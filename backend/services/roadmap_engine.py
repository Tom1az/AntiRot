import os
import json
import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv()
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

# Hỗ trợ Tuned Model nếu đã train xong, ngược lại dùng Base Model
TUNED_MODEL = os.getenv("TUNED_MODEL_NAME")
if TUNED_MODEL:
    model = genai.GenerativeModel(TUNED_MODEL)
    print(f"✅ Đang sử dụng mô hình Fine-tuned: {TUNED_MODEL}")
else:
    model = genai.GenerativeModel('gemini-3.1-flash-lite-preview')
    print("⚠️ Chưa có TUNED_MODEL_NAME, đang dùng base model.")

async def generate_ai_roadmap(course_kb: dict, student_context: str) -> dict:
    """
    Gọi Gemini AI để cá nhân hóa cây kỹ năng cho học sinh.
    
    Args:
        course_kb: Knowledge Base chuẩn của môn học (nodes + edges).
        student_context: Chuỗi mô tả dữ liệu cá nhân học sinh.
    
    Returns:
        dict chứa: node_statuses, ai_insight, recommended_next, weakness_areas.
    """
    
    # Chuẩn bị danh sách node keys để AI biết phải đánh giá những gì
    node_keys = [n["key"] for n in course_kb["nodes"]]
    node_descriptions = "\n".join([
        f'  - "{n["key"]}": {n["name"]} — {n["description"]} (Độ khó mặc định: {n["difficulty"]})'
        for n in course_kb["nodes"]
    ])
    
    prompt = f"""Bạn là chuyên gia phân tích năng lực học tập.

MÔN HỌC: {course_kb["full_name"]}

CÂY KỸ NĂNG CỦA MÔN (KHÔNG ĐƯỢC THÊM HOẶC BỚT NODE):
{node_descriptions}

DỮ LIỆU CÁ NHÂN HỌC SINH:
{student_context}

NHIỆM VỤ: Dựa trên dữ liệu cá nhân, hãy đánh giá trạng thái từng node trong cây.
Quy tắc:
- Nếu học sinh làm quiz tốt ở chủ đề liên quan, hints ít → node đó "mastered", mastery_pct cao (70-100).
- Nếu học sinh đang học, hints vừa phải, điểm trung bình → "in-progress", mastery_pct 30-69.
- Nếu chưa có dữ liệu hoặc các node tiên quyết chưa mastered → "locked", mastery_pct 0-29.
- Node dễ (easy) có xu hướng mastered nhanh hơn node khó (hard).
- Căn cứ vào điểm yếu (weakness_areas) và ai_dependency, hãy phân bổ thời gian học tập (tổng 100%) cho các node cần cải thiện nhất. Nếu là lộ trình tổng hợp, TÊN TOPIC TRONG time_allocation PHẢI CÓ TÊN MÔN HỌC (VD: [DSA] Trees & Graphs).
- Bắt buộc lập một Thời gian biểu (Schedule) chi tiết, bám sát các môn/kiến thức phụ thuộc. Nếu đây là lộ trình tổng hợp nhiều môn, HÃY GHI RÕ [Tên môn học] phía trước Task (VD: [DSA] Ôn lại Trees & Graphs).

TRẢ VỀ ĐÚNG 1 JSON OBJECT (không markdown, không giải thích):
{{
    "node_statuses": {{
        "{node_keys[0]}": {{ "status": "mastered|in-progress|locked", "mastery_pct": 0-100 }},
        ... (tất cả {len(node_keys)} nodes)
    }},
    "ai_insight": "1-2 câu phân tích tổng quan năng lực học sinh và lời khuyên cụ thể.",
    "recommended_next": "key của node nên học tiếp theo",
    "weakness_areas": ["key_1", "key_2"],
    "time_allocation": [
        {{"topic": "[Tên Môn] Tên topic 1", "percentage": 70}},
        {{"topic": "[Tên Môn] Tên topic 2", "percentage": 30}}
    ],
    "schedule": [
        {{"day": "Thứ 2", "task": "Đọc lại lý thuyết phần A", "duration": "2 giờ"}},
        {{"day": "Thứ 3", "task": "Làm bài tập phần A để quen dần mà không dùng hint", "duration": "3 giờ"}}
    ]
}}
"""

    response = model.generate_content(prompt)
    raw_text = response.text.strip()

    # Dọn dẹp markdown wrapper
    if raw_text.startswith("```json"):
        raw_text = raw_text[7:-3].strip()
    elif raw_text.startswith("```"):
        raw_text = raw_text[3:-3].strip()

    try:
        result = json.loads(raw_text)
        
        # Validate: đảm bảo tất cả node keys đều có trong kết quả
        if "node_statuses" not in result:
            result["node_statuses"] = {}
        
        for key in node_keys:
            if key not in result["node_statuses"]:
                result["node_statuses"][key] = {"status": "locked", "mastery_pct": 0}
        
        if "ai_insight" not in result:
            result["ai_insight"] = "Chưa đủ dữ liệu để phân tích chi tiết. Hãy làm thêm quiz!"
        if "recommended_next" not in result:
            result["recommended_next"] = node_keys[0]
        if "weakness_areas" not in result:
            result["weakness_areas"] = []
        if "time_allocation" not in result:
            result["time_allocation"] = []
        if "schedule" not in result:
            result["schedule"] = []
            
        return result

    except json.JSONDecodeError:
        print("Lỗi parse JSON từ AI (roadmap):", raw_text)
        # Fallback: trả về trạng thái mặc định
        fallback = {
            "node_statuses": {k: {"status": "locked", "mastery_pct": 0} for k in node_keys},
            "ai_insight": "AI đang bận, vui lòng thử lại sau.",
            "recommended_next": node_keys[0],
            "weakness_areas": [],
            "time_allocation": [],
            "schedule": []
        }
        return fallback
