# app/routes/api/team_leader_api.py

from fastapi import APIRouter, Depends, HTTPException, status, Query, Request
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime, date
from app.database import get_db
from app.models import User, TeamLeader, Shift, Production, Plant, Line, Hour

router = APIRouter(prefix="/api/team-leader")

# Pydantic models


class ShiftResponse(BaseModel):
    id: int
    date: datetime
    day_night: str
    shift: str
    plant: dict

    class Config:
        from_attributes = True


class ProductionData(BaseModel):
    shift_id: int
    hour: str
    plan: int
    achievement: int
    scraps: int
    defects: int
    flash: int


class TeamLeaderResponse(BaseModel):
    sap_id: str
    name: str
    line: dict

    class Config:
        from_attributes = True


@router.get("/me", response_model=TeamLeaderResponse)
async def get_team_leader_info(request: Request, db: Session = Depends(get_db)):
    """Get current team leader's information"""
    user = request.state.user

    team_leader = db.query(TeamLeader).filter(
        TeamLeader.user_id == user.sap_id,
        TeamLeader.is_deleted == False
    ).first()

    if not team_leader:
        raise HTTPException(status_code=404, detail="Team leader not found")

    # Format the response
    response = {
        "sap_id": user.sap_id,
        "name": user.name,
        "line": {
            "id": team_leader.line.id,
            "name": team_leader.line.name,
        }
    }

    return response


@router.get("/shifts", response_model=List[ShiftResponse])
async def get_shifts_for_date(
    request: Request,
    db: Session = Depends(get_db),
    date: str = Query(..., description="Date in YYYY-MM-DD format")
):
    """Get available shifts for a specific date for the team leader's plant"""
    user = request.state.user

    print(f"Date received: {date}")

    # Parse the date parameter
    try:
        parsed_date = datetime.strptime(date, "%Y-%m-%d").date()
        print(f"Parsed date: {parsed_date}")
    except ValueError as e:
        print(f"Date parsing error: {e}")
        raise HTTPException(
            status_code=400, detail="Invalid date format. Use YYYY-MM-DD")

    # Get the team leader's plant
    team_leader = db.query(TeamLeader).filter(
        TeamLeader.user_id == user.sap_id,
        TeamLeader.is_deleted == False
    ).first()

    if not team_leader or not team_leader.plant:
        raise HTTPException(
            status_code=404, detail="Team leader's plant not found")

    # Get shifts for the date and plant using date comparison with SQL functions
    # This handles the case where Shift.date is a datetime in the database
    from sqlalchemy import func

    shifts = db.query(Shift).filter(
        # Extract only the date part for comparison
        func.date(Shift.date) == parsed_date,
        Shift.plant_id == team_leader.plant.id,
        Shift.is_deleted == False
    ).all()

    print(f"Found {len(shifts)} shifts")

    # Format the response
    formatted_shifts = []
    for shift in shifts:
        formatted_shifts.append({
            "id": shift.id,
            "date": shift.date,
            "day_night": shift.day_night,
            "shift": shift.shift,
            "plant": {
                "id": shift.plant.id,
                "name": shift.plant.name
            }
        })

    return formatted_shifts


@router.get("/shifts/{shift_id}", response_model=ShiftResponse)
async def get_shift_details(
    shift_id: int,
    request: Request,
    db: Session = Depends(get_db)
):
    """Get detailed information about a specific shift"""
    user = request.state.user

    # Get the team leader's plant
    team_leader = db.query(TeamLeader).filter(
        TeamLeader.user_id == user.sap_id,
        TeamLeader.is_deleted == False
    ).first()

    if not team_leader or not team_leader.plant:
        raise HTTPException(
            status_code=404, detail="Team leader's plant not found")

    # Get the shift
    shift = db.query(Shift).filter(
        Shift.id == shift_id,
        Shift.plant_id == team_leader.plant.id,
        Shift.is_deleted == False
    ).first()

    if not shift:
        raise HTTPException(status_code=404, detail="Shift not found")

    # Format the response
    return {
        "id": shift.id,
        "date": shift.date,
        "day_night": shift.day_night,
        "shift": shift.shift,
        "plant": {
            "id": shift.plant.id,
            "name": shift.plant.name
        }
    }


@router.get("/production")
async def get_production_data(
    request: Request,
    db: Session = Depends(get_db),
    shift_id: int = Query(...),
    hour: str = Query(...)
):
    """Get production data for a specific shift and hour"""
    user = request.state.user

    # Get the team leader
    team_leader = db.query(TeamLeader).filter(
        TeamLeader.user_id == user.sap_id,
        TeamLeader.is_deleted == False
    ).first()

    if not team_leader:
        raise HTTPException(status_code=404, detail="Team leader not found")

    # Get production data
    production = db.query(Production).filter(
        Production.shift_id == shift_id,
        Production.hour == hour,
        Production.line_id == team_leader.line_id,
        Production.is_deleted == False
    ).first()

    if not production:
        return None

    return {
        "id": production.id,
        "plan": production.plan,
        "achievement": production.achievement,
        "scraps": production.scraps,
        "defects": production.defects,
        "flash": production.flash,
        "hour": production.hour,
        "shift_id": production.shift_id,
        "line_id": production.line_id
    }


@router.get("/production/plan")
async def get_production_plan(
    request: Request,
    db: Session = Depends(get_db),
    shift_id: int = Query(...),
    hour: str = Query(...)
):
    """Get production plan for a specific shift and hour"""
    user = request.state.user

    # Get the team leader
    team_leader = db.query(TeamLeader).filter(
        TeamLeader.user_id == user.sap_id,
        TeamLeader.is_deleted == False
    ).first()

    if not team_leader:
        raise HTTPException(status_code=404, detail="Team leader not found")

    # Check if shift exists
    shift = db.query(Shift).filter(
        Shift.id == shift_id,
        Shift.is_deleted == False
    ).first()

    if not shift:
        raise HTTPException(status_code=404, detail="Shift not found")

    existing_production = db.query(Production).filter(
        Production.shift_id == shift_id,
        Production.hour == hour,
        Production.is_deleted == False
    ).first()

    if existing_production and existing_production.plan:
        return {
            "plan": existing_production.plan
        }

    # For this demonstration, we'll return a 404 to indicate no plan is available
    raise HTTPException(
        status_code=404, detail="No production plan found for this shift and hour")


@router.post("/production", status_code=status.HTTP_201_CREATED)
async def save_production_data(
    data: ProductionData,
    request: Request,
    db: Session = Depends(get_db)
):
    """Save production data for a specific shift and hour"""
    user = request.state.user

    # Get the team leader
    team_leader = db.query(TeamLeader).filter(
        TeamLeader.user_id == user.sap_id,
        TeamLeader.is_deleted == False
    ).first()

    if not team_leader:
        raise HTTPException(status_code=404, detail="Team leader not found")

    # Check if shift exists
    shift = db.query(Shift).filter(
        Shift.id == data.shift_id,
        Shift.is_deleted == False
    ).first()

    if not shift:
        raise HTTPException(status_code=404, detail="Shift not found")

    # Check if production record already exists
    existing_production = db.query(Production).filter(
        Production.shift_id == data.shift_id,
        Production.hour == data.hour,
        Production.line_id == team_leader.line_id,
        Production.is_deleted == False
    ).first()

    try:
        if existing_production:
            # Update existing record
            existing_production.achievement = data.achievement
            existing_production.scraps = data.scraps
            existing_production.defects = data.defects
            existing_production.flash = data.flash
            existing_production.updated_at = datetime.now()

            # Ensure team leader ID is set (even if it was already set before)
            existing_production.team_leader_id = team_leader.user_id

            db.commit()
            db.refresh(existing_production)

            return {
                "id": existing_production.id,
                "message": "Production data updated successfully"
            }
        else:
            # Create new record
            new_production = Production(
                plan=data.plan,
                achievement=data.achievement,
                scraps=data.scraps,
                defects=data.defects,
                flash=data.flash,
                hour=data.hour,
                shift_id=data.shift_id,
                line_id=team_leader.line_id,
                team_leader_id=team_leader.user_id,  # Make sure team leader ID is set
                # Assuming planner_id is available from the shift
                planner_id=shift.planner_id if shift.planner_id else None
            )

            db.add(new_production)
            db.commit()
            db.refresh(new_production)

            return {
                "id": new_production.id,
                "message": "Production data saved successfully"
            }
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to save production data: {str(e)}"
        )
