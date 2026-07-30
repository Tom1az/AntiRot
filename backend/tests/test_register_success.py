import uuid

from fastapi.testclient import TestClient
from main import app

client = TestClient(app)


def test_register_success():
    username = f"test_{uuid.uuid4().hex[:8]}"
    response = client.post(
        "/auth/register",
        json={
            "username": username,
            "password": "test123",
            "full_name": "Test User",
            "role": "student",
            "grade": "123",
        },
    )
    assert response.status_code == 201
    data = response.json()
    assert "token" in data
    assert data["user"]["username"] == username
    assert data["user"]["full_name"] == "Test User"
    assert data["user"]["role"] == "student"
