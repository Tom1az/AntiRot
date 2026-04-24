"""
Dual-Agent Socratic Chat Engine
================================
Agent 1 (Local Model via Ollama): Sinh câu hỏi gợi mở Socratic.
Agent 2 (Gemini API): Kiểm tra chất lượng + Fallback nếu Agent 1 thất bại.

Flow:
1. Agent 1 nhận câu hỏi → sinh phản hồi Socratic
2. Agent 2 kiểm tra phản hồi đó có trả lời thẳng đáp án không
3. Nếu trả lời thẳng → yêu cầu Agent 1 thử lại (kèm feedback)
4. Nếu thử >= 3 lần vẫn fail → Agent 2 tự sinh phản hồi Socratic
"""

import os
import json
import httpx
import google.generativeai as genai
from dotenv import load_dotenv
from dataclasses import dataclass
from typing import Optional

load_dotenv()

# =============================================================================
# CẤU HÌNH
# =============================================================================
AGENT1_BASE_URL = os.getenv("AGENT1_BASE_URL", "http://localhost:11434")
AGENT1_MODEL_NAME = os.getenv("AGENT1_MODEL_NAME", "socratic-coach")
AGENT2_MAX_RETRIES = int(os.getenv("AGENT2_MAX_RETRIES", "3"))

genai.configure(api_key=os.getenv("GEMINI_API_KEY"))
gemini_model = genai.GenerativeModel('gemini-2.0-flash')

# =============================================================================
# SYSTEM PROMPTS
# =============================================================================
AGENT1_SYSTEM_PROMPT = """Bạn là một gia sư Socratic chuyên nghiệp dành cho sinh viên CNTT.

QUY TẮC TUYỆT ĐỐI:
1. KHÔNG BAO GIỜ trả lời thẳng đáp án, công thức, hoặc lời giải.
2. Luôn đặt câu hỏi gợi mở để học sinh TỰ SUY LUẬN.
3. Nếu học sinh bế tắc: gợi ý MỘT khái niệm nhỏ liên quan, rồi hỏi tiếp.
4. Nếu học sinh xin đáp án: Hỏi về hướng tiếp cận của họ trước.
5. Ngắn gọn, thân thiện, dùng tiếng Việt.

VÍ DỤ:
- Học sinh: "Linked List là gì?"  
  → Bạn: "Em hãy tưởng tượng một chuỗi các toa tàu nối nhau. Mỗi toa biết toa kế tiếp là gì. Vậy theo em, điều gì xảy ra nếu em muốn thêm một toa ở giữa?"

- Học sinh: "Cho em đáp án bài tập Quick Sort"
  → Bạn: "Trước khi đi vào bài tập, em có thể giải thích cho anh em hiểu pivot là gì và vai trò của nó trong Quick Sort không?"
"""

AGENT2_VALIDATION_PROMPT = """Bạn là hệ thống kiểm duyệt chất lượng giáo dục.

NHIỆM VỤ: Đánh giá xem phản hồi của gia sư có vi phạm nguyên tắc Socratic không.

MỘT PHẢN HỒI BỊ COI LÀ "TRẢ LỜI THẲNG" NẾU:
- Cung cấp đáp án, công thức, code hoàn chỉnh, hoặc lời giải trực tiếp
- Giải thích chi tiết cách giải mà không hỏi lại học sinh
- Đưa ra kết quả cuối cùng mà học sinh không cần suy luận

MỘT PHẢN HỒI TỐT (SOCRATIC) NẾU:
- Đặt câu hỏi gợi mở để học sinh tự suy nghĩ
- Gợi ý hướng tiếp cận thay vì đưa đáp án
- Dùng ví dụ/phép so sánh để kích thích tư duy

Trả về CHÍNH XÁC JSON sau (không thêm gì khác):
{
    "is_direct_answer": true/false,
    "reason": "Giải thích ngắn gọn tại sao",
    "quality_score": 0-100
}
"""

AGENT2_SOCRATIC_PROMPT = """Bạn là gia sư Socratic chuyên nghiệp. 
NHIỆM VỤ: Tạo câu hỏi gợi mở cho học sinh tự suy luận.

QUY TẮC:
1. TUYỆT ĐỐI KHÔNG trả lời thẳng đáp án.
2. Đặt 1-2 câu hỏi gợi mở giúp học sinh tự tìm ra câu trả lời.
3. Có thể gợi ý MỘT khái niệm nhỏ liên quan nếu học sinh bế tắc.
4. Ngắn gọn, thân thiện, dùng tiếng Việt.
"""

# =============================================================================
# DATA CLASSES
# =============================================================================
@dataclass
class ValidationResult:
    is_direct_answer: bool
    reason: str
    quality_score: int

@dataclass
class DualAgentResponse:
    reply: str
    agent_used: str  # "agent_1" hoặc "agent_2"
    retry_count: int
    validation_score: int


# =============================================================================
# AGENT 1: Local Model (Ollama)
# =============================================================================
async def agent1_generate(
    user_message: str, 
    topic: str, 
    feedback: Optional[str] = None
) -> str:
    """
    Gọi Agent 1 (Ollama) để sinh phản hồi Socratic.
    Nếu có feedback (từ lần retry), thêm vào context để Agent 1 sửa lại.
    """
    system_prompt = AGENT1_SYSTEM_PROMPT
    
    # Nếu đang retry, thêm feedback từ Agent 2 vào system prompt
    if feedback:
        system_prompt += f"\n\n⚠️ CẢNH BÁO: Câu trả lời trước của bạn đã bị từ chối vì: {feedback}. Hãy THỬ LẠI và đảm bảo CHỈ HỎI GỢI MỞ, KHÔNG đưa đáp án."
        
    messages = [
        {"role": "system", "content": system_prompt}
    ]
    
    user_content = f"Chủ đề: {topic}\nCâu hỏi của học sinh: {user_message}"
    messages.append({"role": "user", "content": user_content})
    
    async with httpx.AsyncClient(timeout=60.0) as client:
        response = await client.post(
            f"{AGENT1_BASE_URL}/chat/completions",
            json={
                "model": AGENT1_MODEL_NAME,
                "messages": messages,
                "stream": False,
                "temperature": 0.7
            }
        )
        response.raise_for_status()
        data = response.json()
        # Chuẩn API OpenAI / LM Studio trả về ở data["choices"][0]["message"]["content"]
        return data["choices"][0]["message"]["content"]


# =============================================================================
# AGENT 2: Gemini API — Validator
# =============================================================================
async def agent2_validate(
    student_question: str, 
    agent1_response: str
) -> ValidationResult:
    """
    Agent 2 (Gemini) kiểm tra phản hồi của Agent 1.
    Trả về ValidationResult với is_direct_answer, reason, quality_score.
    """
    prompt = f"""{AGENT2_VALIDATION_PROMPT}

--- BẮT ĐẦU ĐÁNH GIÁ ---
Câu hỏi của học sinh: "{student_question}"

Phản hồi của gia sư cần đánh giá: "{agent1_response}"
--- KẾT THÚC ---
"""
    
    response = gemini_model.generate_content(prompt)
    raw_text = response.text.strip()
    
    # Dọn dẹp nếu Gemini bọc JSON trong markdown
    if raw_text.startswith("```json"):
        raw_text = raw_text[7:-3].strip()
    elif raw_text.startswith("```"):
        raw_text = raw_text[3:-3].strip()
    
    try:
        result = json.loads(raw_text)
        return ValidationResult(
            is_direct_answer=result.get("is_direct_answer", False),
            reason=result.get("reason", "Không rõ lý do"),
            quality_score=result.get("quality_score", 50)
        )
    except json.JSONDecodeError:
        # Nếu parse lỗi, mặc định cho qua (không block user)
        print(f"⚠️ Agent 2 parse lỗi: {raw_text}")
        return ValidationResult(
            is_direct_answer=False,
            reason="Không thể parse kết quả validation",
            quality_score=50
        )


# =============================================================================
# AGENT 2: Gemini API — Fallback Socratic Generator
# =============================================================================
async def agent2_generate_socratic(
    user_message: str, 
    topic: str
) -> str:
    """
    Fallback: Khi Agent 1 thất bại 3 lần, Gemini tự sinh phản hồi Socratic.
    """
    prompt = f"""{AGENT2_SOCRATIC_PROMPT}

Chủ đề: {topic}
Câu hỏi của học sinh: {user_message}
"""
    
    response = gemini_model.generate_content(prompt)
    return response.text.strip()


# =============================================================================
# ORCHESTRATOR: Dual-Agent Chat (Main Entry Point)
# =============================================================================
async def dual_agent_chat(
    user_message: str, 
    topic: str = "General"
) -> DualAgentResponse:
    """
    Hàm chính — điều phối toàn bộ flow dual-agent.
    
    Returns:
        DualAgentResponse với reply, agent_used, retry_count, validation_score
    """
    feedback = None
    last_validation_score = 0
    
    for attempt in range(1, AGENT2_MAX_RETRIES + 1):
        try:
            # Bước 1: Agent 1 sinh phản hồi
            agent1_reply = await agent1_generate(user_message, topic, feedback)
            
            # Bước 2: Agent 2 kiểm tra chất lượng
            try:
                validation = await agent2_validate(user_message, agent1_reply)
                last_validation_score = validation.quality_score
                
                # Bước 3: Nếu PASS → trả về Agent 1's response
                if not validation.is_direct_answer:
                    print(f"✅ Agent 1 PASS (attempt {attempt}, score: {validation.quality_score})")
                    return DualAgentResponse(
                        reply=agent1_reply,
                        agent_used="agent_1",
                        retry_count=attempt - 1,
                        validation_score=validation.quality_score
                    )
                
                # Bước 4: Nếu FAIL → chuẩn bị feedback cho lần retry tiếp theo
                feedback = validation.reason
                print(f"❌ Agent 1 FAIL (attempt {attempt}): {validation.reason}")

            except Exception as e:
                # Nếu Agent 2 (Gemini) chết (ví dụ: Quota Exceeded), bypass validation luôn!
                print(f"⚠️ Agent 2 Validation Error: {e}. Bypassing validation and trusting Agent 1.")
                return DualAgentResponse(
                    reply=agent1_reply,
                    agent_used="agent_1",
                    retry_count=attempt - 1,
                    validation_score=0
                )
            
        except httpx.HTTPError as e:
            # Agent 1 không kết nối được → fallback ngay sang Agent 2
            print(f"⚠️ Agent 1 connection error: {e}. Falling back to Agent 2.")
            break
        except Exception as e:
            print(f"⚠️ Unexpected error in attempt {attempt}: {e}")
            feedback = f"Lỗi kỹ thuật: {str(e)}"
    
    # Bước 5: FALLBACK → Agent 2 tự sinh Socratic response
    print(f"🔄 Fallback to Agent 2 (Gemini) after {AGENT2_MAX_RETRIES} failed attempts")
    try:
        agent2_reply = await agent2_generate_socratic(user_message, topic)
        return DualAgentResponse(
            reply=agent2_reply,
            agent_used="agent_2",
            retry_count=AGENT2_MAX_RETRIES,
            validation_score=last_validation_score
        )
    except Exception as e:
        # Cả 2 agent đều fail → trả về thông báo lỗi thân thiện
        return DualAgentResponse(
            reply="Xin lỗi, hệ thống đang gặp sự cố. Vui lòng thử lại sau nhé! 🙏",
            agent_used="error",
            retry_count=AGENT2_MAX_RETRIES,
            validation_score=0
        )
