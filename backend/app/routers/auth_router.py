from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app.services.auth_service import require_admin
from app.database.connection import get_db
from app.models.user import User
from app.schemas.user_schema import UserCreate, UserLogin, UserResponse
from app.services.auth_service import (
    hash_password, verify_password, create_access_token, get_current_user
)

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/register", response_model=UserResponse, status_code=201)
def register(user: UserCreate, db: Session = Depends(get_db)):
    # Check for duplicates
    if db.query(User).filter(User.username == user.username).first():
        raise HTTPException(status_code=400, detail="Username already taken")
    if db.query(User).filter(User.email == user.email).first():
        raise HTTPException(status_code=400, detail="Email already registered")

    new_user = User(
        name=user.name,
        email=user.email,
        username=user.username,
        password=hash_password(user.password),
        role=user.role or "user"
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user


@router.post("/login")
def login(user: UserLogin, db: Session = Depends(get_db)):
    db_user = db.query(User).filter(User.username == user.username).first()

    if not db_user or not verify_password(user.password, db_user.password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials"
        )

    token = create_access_token({"sub": db_user.username, "role": db_user.role})
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": {
            "id": db_user.id,
            "name": db_user.name,
            "username": db_user.username,
            "email": db_user.email,
            "role": db_user.role
        }
    }


@router.get("/me", response_model=UserResponse)
def get_me(current_user=Depends(get_current_user)):
    return current_user

@router.get("/users", response_model=List[UserResponse])
def get_all_users(
    db: Session = Depends(get_db),
    current_user=Depends(require_admin)
):
    return db.query(User).all()


@router.patch("/users/{user_id}/role")
def update_user_role(
    user_id: int,
    role: str,
    db: Session = Depends(get_db),
    current_user=Depends(require_admin)
):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    user.role = role
    db.commit()
    return {"message": f"Role updated to {role}"}


@router.delete("/users/{user_id}")
def delete_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(require_admin)
):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    db.delete(user)
    db.commit()
    return {"message": "User deleted"}

@router.put("/profile")
def update_profile(
    update: dict,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    if "name" in update:
        current_user.name = update["name"]
    if "email" in update:
        existing = db.query(User).filter(
            User.email == update["email"],
            User.id != current_user.id
        ).first()
        if existing:
            raise HTTPException(status_code=400, detail="Email already in use")
        current_user.email = update["email"]
    if "password" in update and update["password"]:
        current_user.password = hash_password(update["password"][:72])
    db.commit()
    db.refresh(current_user)
    return {"message": "Profile updated", "user": {
        "id": current_user.id,
        "name": current_user.name,
        "email": current_user.email,
        "username": current_user.username,
        "role": current_user.role
    }}