from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
import os

from database import get_db
import models, auth

router = APIRouter()

UPLOAD_DIR = "uploads"

@router.get("/{filename}")
async def get_secure_file(
    filename: str,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    """
    Serves files from the uploads directory only after verifying the user's Bearer token.
    Additionally checks if the user owns the transaction associated with the file.
    """
    file_path = os.path.join(UPLOAD_DIR, filename)
    
    # Security check FIRST: Does this user own the transaction that linked this screenshot?
    # This prevents users from guessing other users' receipt names or enumerating existing files.
    tx = db.query(models.Transaction).filter(
        models.Transaction.screenshot_name == filename,
        models.Transaction.user_id == current_user.id
    ).first()
    
    if not tx:
        raise HTTPException(status_code=403, detail="You do not have permission to view this file")

    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="File not found")

    return FileResponse(file_path)
