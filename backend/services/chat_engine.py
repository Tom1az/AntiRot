import os
import google.generativeai as genai
from dotenv import load_dotenv
import json

load_dotenv()
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))
model = genai.GenerativeModel(os.getenv("GEMINI_MODEL", "gemini-flash-latest"))

# Prompt này ép AI phải đóng vai Socratic
SOCRATIC_PROMPT = """Bạn là Socratic Coach. 
NHIỆM VỤ: Chỉ hỏi gợi mở, không đưa đáp án. 
NẾU học sinh hỏi đáp án: Hãy hỏi về hướng tiếp cận của em ấy.
NẾU học sinh bế tắc: Gợi ý 1 khái niệm nhỏ liên quan.
Ngắn gọn, thân thiện, dùng tiếng Việt."""

async def get_socratic_reply(history: list, user_input: str):
    chat = model.start_chat(history=[]) # Có thể format history từ DB vào đây
    response = chat.send_message(f"{SOCRATIC_PROMPT}\n\nUser: {user_input}")
    return response.text

PEDAGOGICAL_PROMPT = """Bạn là Trợ lý Sư phạm (Pedagogical Assistant).
NHIỆM VỤ: Hỗ trợ giáo viên các phương pháp giảng dạy hiệu quả, gợi ý cách xử lý học sinh yếu kém hoặc lạm dụng AI.
Luôn đưa ra các bước thực hành cụ thể, chuyên nghiệp, đồng cảm. Dùng tiếng Việt."""

async def get_pedagogical_reply(history: list, user_input: str):
    chat = model.start_chat(history=[]) 
    response = chat.send_message(f"{PEDAGOGICAL_PROMPT}\n\nTeacher: {user_input}")
    return response.text

async def generate_adaptive_quiz(topic: str, student_context: str, num_questions: int = 3):
    prompt = f"""
    Bạn là một chuyên gia giáo dục. Hãy tạo {num_questions} câu hỏi trắc nghiệm về chủ đề '{topic}'.
    
    ĐÂY LÀ NGỮ CẢNH CỦA HỌC SINH (Hãy phân tích để quyết định độ khó và nội dung câu hỏi):
    {student_context}
    
    YÊU CẦU BẮT BUỘC: 
    - Nếu học sinh lạm dụng Hint (Gợi ý) nhiều hoặc trả lời sai nhiều, hãy cho câu hỏi dễ (easy) hoặc trung bình (medium) tập trung vào lý thuyết cốt lõi.
    - Phải trộn lẫn các độ khó (easy, medium, hard) sao cho phù hợp với năng lực hiện tại.
    - Cấu trúc trả về CHỈ LÀ MỘT JSON OBJECT (không markdown, không giải thích thêm), có cấu trúc chính xác như sau:
    {{
        "weakness_summary": "Phân tích 1-2 câu về điểm yếu hoặc xu hướng học tập của học sinh dựa trên ngữ cảnh.",
        "study_materials": ["Tài liệu ôn tập 1", "Tài liệu ôn tập 2"],
        "questions": [
            {{
                "id": 123,
                "difficulty": "easy hoặc medium hoặc hard",
                "q": "Nội dung câu hỏi",
                "options": ["Đáp án A", "Đáp án B", "Đáp án C", "Đáp án D"],
                "answer": "Ghi lại chính xác 1 đáp án đúng từ mảng options",
                "hint": "Một gợi ý kiểu Socratic để giúp học sinh tự suy luận (không nói thẳng đáp án)"
            }}
        ]
    }}
    """
    
    response = model.generate_content(prompt)
    raw_text = response.text.strip()
    
    if raw_text.startswith("```json"):
        raw_text = raw_text[7:-3].strip()
    elif raw_text.startswith("```"):
        raw_text = raw_text[3:-3].strip()
        
    try:
        quiz_data = json.loads(raw_text)
        return quiz_data
    except json.JSONDecodeError:
        print("Lỗi parse JSON từ AI:", raw_text)
        raise Exception("AI không trả về đúng định dạng JSON.")