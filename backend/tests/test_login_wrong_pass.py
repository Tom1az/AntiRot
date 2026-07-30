from fastapi.testclient import TestClient
from main import app

client = TestClient(app)


def test_login_wrong_pass():
    response = client.post(
        "/auth/login",
        json={"username": "test", "password": "wrong"},
    )
    assert response.status_code == 401
    assert response.json() == {"detail": "Sai tên đăng nhập hoặc mật khẩu."}
