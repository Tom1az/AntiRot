import uuid

from fastapi.testclient import TestClient
from main import app

client = TestClient(app)


def test_login_success():
    username = f"login_{uuid.uuid4().hex[:8]}"
    password = "test123"

    register = client.post(
        "/auth/register",
        json={
            "username": username,
            "password": password,
            "full_name": "Login User",
            "role": "student",
            "grade": "123",
        },
    )
    assert register.status_code == 201

    response = client.post(
        "/auth/login",
        json={"username": username, "password": password},
    )
    assert response.status_code == 200
    data = response.json()
    assert "token" in data
    assert data["user"]["username"] == username
