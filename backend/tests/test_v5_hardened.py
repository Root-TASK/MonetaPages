import pytest
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session
from datetime import date

import models, schemas, auth

def create_test_user(db: Session):
    user = db.query(models.User).filter(models.User.email == "test@moneta.com").first()
    if not user:
        user = models.User(email="test@moneta.com", hashed_password=auth.get_password_hash("password123"))
        db.add(user)
        db.commit()
        db.refresh(user)
    return user

def get_token(user):
    return auth.create_access_token(data={"sub": user.email})

# ── Security Tests ───────────────────────────────────────────────

def test_unauthorized_access(client: TestClient):
    """Verify that sensitive routers are protected at the router level."""
    endpoints = [
        "/api/transactions/",
        "/api/settings/opening-balance",
        "/api/reports/summary",
        "/api/clients/",
        "/api/events/",
        "/api/tasks/",
        "/api/budget/summary?month=2024-01",
        "/api/files/test.jpg"
    ]
    for url in endpoints:
        response = client.get(url)
        assert response.status_code == 401, f"Endpoint {url} should be protected"

# ── Budgeting Tests ──────────────────────────────────────────────

def test_budget_cycle(client: TestClient, db: Session):
    """Verify full budget cycle: setting and fetching summary."""
    user = create_test_user(db)
    token = get_token(user)
    headers = {"Authorization": f"Bearer {token}"}
    month = "2024-05"

    # 1. Set a budget
    budget_data = {"category": "company", "amount": 5000.0, "month": month}
    res = client.post("/api/budget/", json=budget_data, headers=headers)
    assert res.status_code == 200
    assert res.json()["amount"] == 5000.0

    # 2. Add an expense in that category
    tx_data = models.Transaction(
        user_id=user.id,
        date=date(2024, 5, 10),
        type="expense",
        category="company",
        description="Office Supplies",
        amount=1200.0
    )
    db.add(tx_data)
    db.commit()

    # 3. Check summary
    res = client.get(f"/api/budget/summary?month={month}", headers=headers)
    assert res.status_code == 200
    data = res.json()
    
    company_budget = next((b for b in data if b["category"] == "company"), None)
    assert company_budget is not None
    assert company_budget["budget"] == 5000.0
    assert company_budget["spent"] == 1200.0
    assert company_budget["remaining"] == 3800.0
    assert company_budget["percent"] == 24.0

# ── Secure Files Tests ───────────────────────────────────────────

def test_secure_file_access_denied(client: TestClient, db: Session):
    """Verify that users cannot access other users' files."""
    user1 = create_test_user(db)
    user2 = models.User(email="other@moneta.com", hashed_password="...")
    db.add(user2)
    db.commit()
    
    # Create a transaction with a screenshot for user 1
    tx = models.Transaction(
        user_id=user1.id,
        date=date.today(),
        type="expense",
        category="personal",
        description="Secret",
        amount=10.0,
        screenshot_name="secret_receipt.jpg"
    )
    db.add(tx)
    db.commit()

    # User 2 tries to access User 1's file
    token2 = auth.create_access_token(data={"sub": user2.email})
    headers2 = {"Authorization": f"Bearer {token2}"}
    
    res = client.get("/api/files/secret_receipt.jpg", headers=headers2)
    assert res.status_code == 403 # Forbidden
