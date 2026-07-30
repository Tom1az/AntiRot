from fastapi.testclient import TestClient
from main import app

client = TestClient(app)

def test_unknown_route():
    response = client.get("/unknown_route")
    assert response.status_code == 404
    assert response.json() == {"detail": "Not Found"}