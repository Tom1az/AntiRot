from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from core.database import get_db
from models.user_model import User
from schemas.user_schema import UserRegister, UserLogin, AuthResponse, UserResponse
import bcrypt

auth = APIRouter(prefix="/auth", tags=["Authentication"])


def hash_password(password: str) -> str:
    """Hash mật khẩu bằng bcrypt."""
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')


def verify_password(plain: str, hashed: str) -> bool:
    """Kiểm tra mật khẩu có khớp với hash không."""
    return bcrypt.checkpw(plain.encode('utf-8'), hashed.encode('utf-8'))


# ============================================================================
# POST /auth/register  — Đăng ký tài khoản
# ============================================================================
@auth.post("/register", response_model=AuthResponse)
def register(payload: UserRegister, db: Session = Depends(get_db)):
    """Tạo tài khoản mới (học sinh hoặc giáo viên)."""

    # 1. Kiểm tra username đã tồn tại chưa
    existing = db.query(User).filter(User.username == payload.username).first()
    if existing:
        raise HTTPException(status_code=400, detail="Tên đăng nhập đã tồn tại. Vui lòng chọn tên khác.")

    # 2. Hash mật khẩu
    hashed_pw = hash_password(payload.password)

    # 3. Tạo user mới
    new_user = User(
        username=payload.username,
        password_hash=hashed_pw,
        full_name=payload.full_name,
        role=payload.role.value,
        grade=payload.grade,
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return AuthResponse(user=UserResponse.model_validate(new_user), token=None)


# ============================================================================
# POST /auth/login  — Đăng nhập
# ============================================================================
@auth.post("/login", response_model=AuthResponse)
def login(payload: UserLogin, db: Session = Depends(get_db)):
    """Xác thực tên đăng nhập và mật khẩu."""

    # 1. Tìm user theo username
    user = db.query(User).filter(User.username == payload.username).first()
    if not user:
        raise HTTPException(status_code=401, detail="Sai tên đăng nhập hoặc mật khẩu.")

    # 2. Verify mật khẩu
    if not verify_password(payload.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Sai tên đăng nhập hoặc mật khẩu.")

    return AuthResponse(user=UserResponse.model_validate(user), token=None)
