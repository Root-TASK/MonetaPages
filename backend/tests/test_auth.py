import pytest
from httpx import AsyncClient

# Test Credentials
TEST_USER = {
    "email": "test@example.com",
    "password": "testpassword123",
    "full_name": "Test User"
}

@pytest.mark.asyncio
async def test_user_signup(async_client: AsyncClient):
    """Verify new user registration."""
    response = await async_client.post("/api/auth/register", json=TEST_USER)
    assert response.status_code == 200
    data = response.json()
    assert data["email"] == TEST_USER["email"]
    assert data["full_name"] == TEST_USER["full_name"]
    assert "id" in data

@pytest.mark.asyncio
async def test_user_login(async_client: AsyncClient):
    """Verify login with correct credentials."""
    # First, ensure user exists
    await async_client.post("/api/auth/register", json=TEST_USER)
    
    # Login payload (FastAPI OAuth2 expects form data)
    login_data = {
        "username": TEST_USER["email"],
        "password": TEST_USER["password"]
    }
    
    response = await async_client.post("/api/auth/token", data=login_data)
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"

@pytest.mark.asyncio
async def test_login_invalid_password(async_client: AsyncClient):
    """Verify login failure with wrong password."""
    await async_client.post("/api/auth/register", json=TEST_USER)
    
    login_data = {
        "username": TEST_USER["email"],
        "password": "wrongpassword"
    }
    
    response = await async_client.post("/api/auth/token", data=login_data)
    assert response.status_code == 401
    assert response.json()["detail"] == "Incorrect email or password"

@pytest.mark.asyncio
async def test_duplicate_signup(async_client: AsyncClient):
    """Verify uniqueness constraint on email."""
    await async_client.post("/api/auth/register", json=TEST_USER)
    
    # Try again with same email
    response = await async_client.post("/api/auth/register", json=TEST_USER)
    assert response.status_code == 400
    assert response.json()["detail"] == "Email already registered"
