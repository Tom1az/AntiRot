from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from core.database import get_db
from models.skill_model import SkillNode, SkillEdge, StudentSkillStatus
from schemas.skill_schema import (
    SkillNodeCreate, SkillNodeResponse,
    SkillEdgeCreate, SkillEdgeResponse,
    StudentSkillStatusUpdate, StudentSkillStatusResponse,
    SkillNodeWithStatus, SkillGraphResponse, SkillStatus,
)
from typing import List
import uuid

skill_tree = APIRouter(prefix="/skill-tree", tags=["Skill Tree"])

# ============================================================================
# GET /skill-tree/{student_id}/graph
# Trả về toàn bộ graph (nodes + edges) kèm trạng thái cá nhân của sinh viên.
# Đây là API chính mà Frontend gọi để render React Flow.
# ============================================================================
@skill_tree.get("/{student_id}/graph", response_model=SkillGraphResponse)
def get_skill_graph(student_id: uuid.UUID, category: str = "dsa", db: Session = Depends(get_db)):
    """Lấy toàn bộ cây kỹ năng theo category, gắn trạng thái cho từng sinh viên."""

    # 1. Lấy tất cả nodes thuộc category
    nodes = db.query(SkillNode).filter(SkillNode.category == category).all()
    if not nodes:
        raise HTTPException(status_code=404, detail=f"Không tìm thấy Skill Tree cho môn '{category}'.")

    # 2. Lấy tất cả edges liên quan
    node_ids = [n.id for n in nodes]
    edges = db.query(SkillEdge).filter(
        SkillEdge.source_node_id.in_(node_ids)
    ).all()

    # 3. Lấy trạng thái kỹ năng của sinh viên này
    statuses = db.query(StudentSkillStatus).filter(
        StudentSkillStatus.student_id == student_id,
        StudentSkillStatus.skill_node_id.in_(node_ids)
    ).all()
    status_map = {str(s.skill_node_id): s for s in statuses}

    # 4. Ghép nodes + statuses
    nodes_with_status = []
    for node in nodes:
        st = status_map.get(str(node.id))
        nodes_with_status.append(SkillNodeWithStatus(
            id=node.id,
            name=node.name,
            description=node.description,
            category=node.category,
            position_x=node.position_x,
            position_y=node.position_y,
            status=st.status if st else SkillStatus.LOCKED,
            mastery_pct=st.mastery_pct if st else 0,
        ))

    edges_response = [SkillEdgeResponse(id=e.id, source_node_id=e.source_node_id, target_node_id=e.target_node_id) for e in edges]

    return SkillGraphResponse(nodes=nodes_with_status, edges=edges_response)


# ============================================================================
# POST /skill-tree/nodes  — Tạo skill node mới (Giáo viên dùng)
# ============================================================================
@skill_tree.post("/nodes", response_model=SkillNodeResponse)
def create_skill_node(payload: SkillNodeCreate, db: Session = Depends(get_db)):
    """Giáo viên tạo một node kỹ năng mới."""
    new_node = SkillNode(
        name=payload.name,
        description=payload.description,
        category=payload.category,
        position_x=payload.position_x,
        position_y=payload.position_y,
    )
    db.add(new_node)
    db.commit()
    db.refresh(new_node)
    return new_node


# ============================================================================
# POST /skill-tree/edges  — Tạo liên kết giữa 2 node (Giáo viên dùng)
# ============================================================================
@skill_tree.post("/edges", response_model=SkillEdgeResponse)
def create_skill_edge(payload: SkillEdgeCreate, db: Session = Depends(get_db)):
    """Tạo quan hệ tiên quyết giữa 2 node."""
    # Kiểm tra node tồn tại
    src = db.query(SkillNode).filter(SkillNode.id == payload.source_node_id).first()
    tgt = db.query(SkillNode).filter(SkillNode.id == payload.target_node_id).first()
    if not src or not tgt:
        raise HTTPException(status_code=404, detail="Một trong hai node không tồn tại.")

    new_edge = SkillEdge(
        source_node_id=payload.source_node_id,
        target_node_id=payload.target_node_id,
    )
    db.add(new_edge)
    db.commit()
    db.refresh(new_edge)
    return new_edge


# ============================================================================
# PUT /skill-tree/{student_id}/status/{node_id}  — Cập nhật trạng thái kỹ năng
# ============================================================================
@skill_tree.put("/{student_id}/status/{node_id}", response_model=StudentSkillStatusResponse)
def update_skill_status(
    student_id: uuid.UUID,
    node_id: uuid.UUID,
    payload: StudentSkillStatusUpdate,
    db: Session = Depends(get_db)
):
    """Cập nhật trạng thái kỹ năng (locked → in-progress → mastered) cho sinh viên."""
    record = db.query(StudentSkillStatus).filter(
        StudentSkillStatus.student_id == student_id,
        StudentSkillStatus.skill_node_id == node_id,
    ).first()

    if record:
        record.status = payload.status
        record.mastery_pct = payload.mastery_pct
    else:
        record = StudentSkillStatus(
            student_id=student_id,
            skill_node_id=node_id,
            status=payload.status,
            mastery_pct=payload.mastery_pct,
        )
        db.add(record)

    db.commit()
    db.refresh(record)
    return record


# ============================================================================
# GET /skill-tree/{student_id}/mastered  — Lấy danh sách kỹ năng đã thành thạo
# Dùng bởi Chat Tutor để gợi ý kiến thức nền tảng.
# ============================================================================
@skill_tree.get("/{student_id}/mastered", response_model=List[SkillNodeResponse])
def get_mastered_skills(student_id: uuid.UUID, db: Session = Depends(get_db)):
    """Trả về danh sách các SkillNode mà sinh viên đã master."""
    mastered_statuses = db.query(StudentSkillStatus).filter(
        StudentSkillStatus.student_id == student_id,
        StudentSkillStatus.status == "mastered",
    ).all()

    if not mastered_statuses:
        return []

    mastered_node_ids = [s.skill_node_id for s in mastered_statuses]
    nodes = db.query(SkillNode).filter(SkillNode.id.in_(mastered_node_ids)).all()
    return nodes
