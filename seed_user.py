import sys
import os

# Add backend to path to import models
sys.path.append(os.path.join(os.getcwd(), 'backend'))

from database import SessionLocal, engine, Base
import models
from auth import get_password_hash

def seed():
    # Ensure tables exist
    Base.metadata.create_all(bind=engine)
    
    db = SessionLocal()
    try:
        # Check if user exists
        user = db.query(models.User).filter(models.User.email == "admin@moneta.com").first()
        if not user:
            print("Creating default user...")
            hashed_pw = get_password_hash("admin123")
            db_user = models.User(
                email="admin@moneta.com",
                hashed_password=hashed_pw,
                full_name="Moneta Admin"
            )
            db.add(db_user)
            db.commit()
            print("User created successfully!")
        else:
            print("Updating existing user password with 72-char fix...")
            user.hashed_password = get_password_hash("admin123")
            db.commit()
            print("User updated successfully!")
    except Exception as e:
        print(f"Error: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    seed()
