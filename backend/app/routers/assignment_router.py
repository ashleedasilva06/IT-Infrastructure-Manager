from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from app.database.connection import get_db
from app.models.assignment import Assignment
from app.models.device import Device
from app.schemas.assignment_schema import AssignmentCreate, AssignmentUpdate, AssignmentResponse
from app.services.auth_service import get_current_user, require_admin

router = APIRouter(prefix="/assignments", tags=["Assignments"])


@router.post("/", response_model=AssignmentResponse, status_code=201)
def create_assignment(
    assignment: AssignmentCreate,
    db: Session = Depends(get_db),
    current_user=Depends(require_admin)
):
    device = db.query(Device).filter(Device.id == assignment.device_id).first()
    if not device:
        raise HTTPException(status_code=404, detail="Device not found")

    new_assignment = Assignment(**assignment.dict())
    db.add(new_assignment)
    db.commit()
    db.refresh(new_assignment)
    return new_assignment


@router.get("/", response_model=List[AssignmentResponse])
def get_assignments(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    # Admins see all, users see only their own
    if current_user.role == "admin":
        return db.query(Assignment).order_by(Assignment.created_at.desc()).all()
    return db.query(Assignment).filter(
        Assignment.user_id == current_user.id
    ).order_by(Assignment.created_at.desc()).all()


@router.get("/my-devices")
def get_my_devices(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    assignments = db.query(Assignment).filter(
        Assignment.user_id == current_user.id
    ).all()
    devices = [a.device for a in assignments if a.device]
    return devices


@router.get("/{assignment_id}", response_model=AssignmentResponse)
def get_assignment(
    assignment_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    assignment = db.query(Assignment).filter(Assignment.id == assignment_id).first()
    if not assignment:
        raise HTTPException(status_code=404, detail="Assignment not found")
    if current_user.role != "admin" and assignment.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized")
    return assignment


@router.put("/{assignment_id}", response_model=AssignmentResponse)
def update_assignment(
    assignment_id: int,
    update: AssignmentUpdate,
    db: Session = Depends(get_db),
    current_user=Depends(require_admin)
):
    assignment = db.query(Assignment).filter(Assignment.id == assignment_id).first()
    if not assignment:
        raise HTTPException(status_code=404, detail="Assignment not found")

    for key, value in update.dict(exclude_none=True).items():
        setattr(assignment, key, value)

    db.commit()
    db.refresh(assignment)
    return assignment


@router.delete("/{assignment_id}")
def delete_assignment(
    assignment_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(require_admin)
):
    assignment = db.query(Assignment).filter(Assignment.id == assignment_id).first()
    if not assignment:
        raise HTTPException(status_code=404, detail="Assignment not found")

    db.delete(assignment)
    db.commit()
    return {"message": "Assignment removed successfully"}