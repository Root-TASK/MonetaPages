from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func, extract
from typing import List, Optional
from collections import defaultdict

from database import get_db
import models, schemas, auth

router = APIRouter()


def get_ob(db: Session, user_id: int) -> float:
    s = db.query(models.Settings).filter_by(key="opening_balance", user_id=user_id).first()
    return float(s.value) if s else 0.0


# ── Overall summary ──────────────────────────────────────────────
@router.get("/summary", response_model=schemas.OverallSummary)
def overall_summary(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    ob = get_ob(db, current_user.id)
    txs = db.query(models.Transaction).filter_by(user_id=current_user.id).all()

    total_inc = sum(t.amount for t in txs if t.type == models.TransactionType.income)
    total_exp = sum(t.amount for t in txs if t.type == models.TransactionType.expense)
    cli_exp   = sum(t.amount for t in txs if t.type == models.TransactionType.expense and t.category == models.TransactionCategory.client)
    com_exp   = sum(t.amount for t in txs if t.type == models.TransactionType.expense and t.category == models.TransactionCategory.company)
    per_exp   = sum(t.amount for t in txs if t.type == models.TransactionType.expense and t.category == models.TransactionCategory.personal)

    closing = round(ob + total_inc - total_exp, 2)

    return schemas.OverallSummary(
        opening_balance=ob,
        total_income=round(total_inc, 2),
        total_expense=round(total_exp, 2),
        client_expense=round(cli_exp, 2),
        company_expense=round(com_exp, 2),
        personal_expense=round(per_exp, 2),
        closing_balance=closing,
        net_profit_loss=round(total_inc - total_exp, 2),
        total_transactions=len(txs),
    )


# ── Monthly breakdown ────────────────────────────────────────────
@router.get("/monthly", response_model=List[schemas.MonthlySummary])
def monthly_report(
    year: Optional[int] = Query(None),
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    ob = get_ob(db, current_user.id)
    query = db.query(models.Transaction).filter_by(user_id=current_user.id).order_by(
        models.Transaction.date, models.Transaction.id
    )
    if year:
        query = query.filter(extract("year", models.Transaction.date) == year)
    txs = query.all()

    # Group by month
    months: dict = defaultdict(lambda: {"inc": 0, "exp": 0, "cli": 0, "com": 0, "per": 0, "cnt": 0})
    for tx in txs:
        key = str(tx.date)[:7]
        if tx.type == models.TransactionType.income:
            months[key]["inc"] += tx.amount
        else:
            months[key]["exp"] += tx.amount
            if tx.category == models.TransactionCategory.client:
                months[key]["cli"] += tx.amount
            elif tx.category == models.TransactionCategory.company:
                months[key]["com"] += tx.amount
            else:
                months[key]["per"] += tx.amount
        months[key]["cnt"] += 1

    result = []
    balance = ob
    for month in sorted(months.keys()):
        d = months[month]
        op = balance
        balance = round(balance + d["inc"] - d["exp"], 2)
        result.append(schemas.MonthlySummary(
            month=month,
            opening_balance=round(op, 2),
            total_income=round(d["inc"], 2),
            total_expense=round(d["exp"], 2),
            client_expense=round(d["cli"], 2),
            company_expense=round(d["com"], 2),
            personal_expense=round(d["per"], 2),
            closing_balance=balance,
            transaction_count=d["cnt"],
        ))
    return result


# ── Internal Helpers ─────────────────────────────────────────────
def get_smtp_config(db: Session, user_id: int):
    keys = ["smtp_server", "smtp_port", "smtp_user", "smtp_password", "smtp_from_email", "recipient_email"]
    settings = db.query(models.Settings).filter(models.Settings.key.in_(keys), models.Settings.user_id == user_id).all()
    data = {s.key: s.value for s in settings}
    if not all(k in data for k in ["smtp_server", "smtp_port", "smtp_user", "smtp_password", "smtp_from_email"]):
        return None
    return data


# ── Export & Email ───────────────────────────────────────────────
@router.post("/send-email")
def email_report(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    from utils.email import send_moneta_email
    
    config = get_smtp_config(db, current_user.id)
    if not config:
        raise HTTPException(status_code=400, detail="SMTP settings are incomplete. Please configure them in Settings.")

    summary_data = overall_summary(db, current_user)
    
    html = f"""
    <html>
    <body style="font-family: sans-serif; color: #333;">
        <h2 style="color: #d4af37;">Moneta Bank - Overall Financial Summary</h2>
        <p>Hello {current_user.full_name or current_user.email},</p>
        <p>Here is your current financial overview as of today:</p>
        <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
            <tr style="background-color: #f8f8f8;">
                <td style="padding: 10px; border: 1px solid #ddd;"><b>Opening Balance</b></td>
                <td style="padding: 10px; border: 1px solid #ddd;">₹{summary_data.opening_balance}</td>
            </tr>
            <tr>
                <td style="padding: 10px; border: 1px solid #ddd;"><b>Total Income</b></td>
                <td style="padding: 10px; border: 1px solid #ddd; color: #10b981;">₹{summary_data.total_income}</td>
            </tr>
            <tr>
                <td style="padding: 10px; border: 1px solid #ddd;"><b>Total Expense</b></td>
                <td style="padding: 10px; border: 1px solid #ddd; color: #800000;">₹{summary_data.total_expense}</td>
            </tr>
            <tr style="background-color: #f8f8f8; font-weight: bold;">
                <td style="padding: 10px; border: 1px solid #ddd;">Closing Balance</td>
                <td style="padding: 10px; border: 1px solid #ddd;">₹{summary_data.closing_balance}</td>
            </tr>
        </table>
        <br/>
        <p>Check the app for detailed breakdowns.</p>
        <p style="font-size: 12px; color: #777;">Sent automatically by Moneta Bank v1.2</p>
    </body>
    </html>
    """
    
    recipient = config.get("recipient_email") or current_user.email
    send_moneta_email(config, recipient, "Moneta Bank - Financial Report", html)
    
    return {"message": f"Report sent to {recipient}"}




# ── Daily breakdown ──────────────────────────────────────────────
@router.get("/daily", response_model=List[schemas.DailySummary])
def daily_report(
    month: Optional[str] = Query(None, description="YYYY-MM"),
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    ob = get_ob(db, current_user.id)
    all_txs = db.query(models.Transaction).filter_by(user_id=current_user.id).order_by(
        models.Transaction.date, models.Transaction.id
    ).all()

    # Compute running balance up to each day
    days: dict = defaultdict(lambda: {"inc": 0, "exp": 0, "cli": 0, "com": 0, "per": 0, "cnt": 0})
    for tx in all_txs:
        key = str(tx.date)
        if month and not key.startswith(month):
            continue  
        if tx.type == models.TransactionType.income:
            days[key]["inc"] += tx.amount
        else:
            days[key]["exp"] += tx.amount
            if tx.category == models.TransactionCategory.client:
                days[key]["cli"] += tx.amount
            elif tx.category == models.TransactionCategory.company:
                days[key]["com"] += tx.amount
            else:
                days[key]["per"] += tx.amount
        days[key]["cnt"] += 1

    # Re-compute balance from full history
    balance = ob
    all_sorted = sorted(all_txs, key=lambda t: (str(t.date), t.id))
    for tx in all_sorted:
        day_key = str(tx.date)
        if month and day_key >= (month + "-01") and day_key <= (month + "-31"):
            break
        if tx.type == models.TransactionType.income:
            balance += tx.amount
        else:
            balance -= tx.amount

    result = []
    sorted_days = sorted(days.keys())
    for day in sorted_days:
        d = days[day]
        op = balance
        balance = round(balance + d["inc"] - d["exp"], 2)
        result.append(schemas.DailySummary(
            date=day,
            opening_balance=round(op, 2),
            total_income=round(d["inc"], 2),
            total_expense=round(d["exp"], 2),
            client_expense=round(d["cli"], 2),
            company_expense=round(d["com"], 2),
            personal_expense=round(d["per"], 2),
            closing_balance=balance,
            transaction_count=d["cnt"],
        ))
    return result
