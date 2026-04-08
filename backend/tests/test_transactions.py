import pytest
from httpx import AsyncClient

# Test Data
TRANSACTION_DATA = {
    "date": "2024-04-06",
    "type": "expense",
    "category": "personal",
    "description": "Test Grocery",
    "amount": 500.0,
    "notes": "Weekly milk and bread"
}

@pytest.fixture
async def auth_header(async_client: AsyncClient):
    """Fixture to provide a valid JWT token header."""
    user = {"email": "tx_test@example.com", "password": "password", "full_name": "Tx Tester"}
    await async_client.post("/api/auth/register", json=user)
    
    login_data = {"username": user["email"], "password": user["password"]}
    res = await async_client.post("/api/auth/token", data=login_data)
    token = res.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}

@pytest.mark.asyncio
async def test_create_transaction(async_client: AsyncClient, auth_header):
    """Verify transaction creation."""
    response = await async_client.post("/api/transactions/", json=TRANSACTION_DATA, headers=auth_header)
    assert response.status_code == 201
    data = response.json()
    assert data["description"] == TRANSACTION_DATA["description"]
    assert data["amount"] == TRANSACTION_DATA["amount"]
    assert data["category"] == TRANSACTION_DATA["category"]

@pytest.mark.asyncio
async def test_get_transactions(async_client: AsyncClient, auth_header):
    """Verify transaction list retrieval."""
    # Create two transactions
    await async_client.post("/api/transactions/", json=TRANSACTION_DATA, headers=auth_header)
    await async_client.post("/api/transactions/", json={**TRANSACTION_DATA, "description": "Tx 2"}, headers=auth_header)
    
    response = await async_client.get("/api/transactions/", headers=auth_header)
    assert response.status_code == 200
    data = response.json()
    assert len(data) >= 2

@pytest.mark.asyncio
async def test_unauthorized_access(async_client: AsyncClient):
    """Verify endpoints are protected."""
    response = await async_client.get("/api/transactions/")
    assert response.status_code == 401

@pytest.mark.asyncio
async def test_delete_transaction(async_client: AsyncClient, auth_header):
    """Verify transaction deletion."""
    res = await async_client.post("/api/transactions/", json=TRANSACTION_DATA, headers=auth_header)
    tx_id = res.json()["id"]
    
    del_res = await async_client.delete(f"/api/transactions/{tx_id}", headers=auth_header)
    assert del_res.status_code == 204
    
    # Verify it's gone
    get_res = await async_client.get("/api/transactions/", headers=auth_header)
    assert all(t["id"] != tx_id for t in get_res.json())
