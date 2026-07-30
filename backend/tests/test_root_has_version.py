from fastapi.testclient import TestClient
from main import app

client = TestClient(app)

def test_root_has_version():
    response = client.get("/")
    assert response.status_code == 200
    assert response.json() == {"status": "AntiRot Backend is running!", "academic_context": "HCMUT Computer Science Project", "version": "1.0.0"}