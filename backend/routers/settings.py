from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database import get_db
from database import get_db
import models, schemas, auth

router = APIRouter()


@router.get("/opening-balance")
def get_opening_balance(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    setting = db.query(models.Settings).filter_by(key="opening_balance", user_id=current_user.id).first()
    return {"opening_balance": float(setting.value) if setting else 0.0}


@router.put("/opening-balance")
def set_opening_balance(
    data: schemas.OpeningBalanceUpdate, 
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    setting = db.query(models.Settings).filter_by(key="opening_balance", user_id=current_user.id).first()
    if setting:
        setting.value = str(round(data.opening_balance, 2))
    else:
        setting = models.Settings(
            key="opening_balance", 
            value=str(round(data.opening_balance, 2)),
            user_id=current_user.id
        )
        db.add(setting)
    db.commit()
    return {"opening_balance": round(data.opening_balance, 2)}


@router.get("/smtp", response_model=schemas.SmtpConfigUpdate)
def get_smtp_settings(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    keys = ["smtp_server", "smtp_port", "smtp_user", "smtp_password", "smtp_from_email", "recipient_email"]
    settings = db.query(models.Settings).filter(models.Settings.key.in_(keys), models.Settings.user_id == current_user.id).all()
    
    data = {s.key: s.value for s in settings}
    return {
        "smtp_server": data.get("smtp_server", ""),
        "smtp_port": int(data.get("smtp_port", 587)),
        "smtp_user": data.get("smtp_user", ""),
        "smtp_password": data.get("smtp_password", ""),
        "smtp_from_email": data.get("smtp_from_email", ""),
        "recipient_email": data.get("recipient_email", current_user.email)
    }


@router.put("/smtp")
def update_smtp_settings(
    data: schemas.SmtpConfigUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    for key, value in data.dict().items():
        if value is None: continue
        setting = db.query(models.Settings).filter_by(key=key, user_id=current_user.id).first()
        if setting:
            setting.value = str(value)
        else:
            setting = models.Settings(key=key, value=str(value), user_id=current_user.id)
            db.add(setting)
    
    db.commit()
    return {"message": "SMTP settings updated"}
