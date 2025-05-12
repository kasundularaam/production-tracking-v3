# app/routes/api/team_leader_api.py

from fastapi import APIRouter, Depends, HTTPException, status, Query, Request
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime, date
from app.database import get_db
from app.models import Loss, LossReason, User, TeamLeader, Shift, Production, Plant, Line, Hour

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


class LossCreate(BaseModel):
    amount: int
    loss_reason_id: int
    production_id: int


class LossReasonResponse(BaseModel):
    id: int
    title: str
    department: str

    class Config:
        from_attributes = True


class LossResponse(BaseModel):
    id: int
    amount: int
    loss_reason: LossReasonResponse

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


@router.get("/loss-reasons", response_model=List[LossReasonResponse])
async def get_loss_reasons(
    request: Request,
    db: Session = Depends(get_db)
):
    """Get all loss reasons"""
    loss_reasons = db.query(LossReason).filter(
        LossReason.is_deleted == False
    ).all()

    return loss_reasons


@router.get("/production/{production_id}/losses", response_model=List[LossResponse])
async def get_production_losses(
    production_id: int,
    request: Request,
    db: Session = Depends(get_db)
):
    """Get losses for a specific production"""
    user = request.state.user

    # Verify the production belongs to this team leader
    team_leader = db.query(TeamLeader).filter(
        TeamLeader.user_id == user.sap_id,
        TeamLeader.is_deleted == False
    ).first()

    if not team_leader:
        raise HTTPException(status_code=404, detail="Team leader not found")

    production = db.query(Production).filter(
        Production.id == production_id,
        Production.team_leader_id == team_leader.user_id,
        Production.is_deleted == False
    ).first()

    if not production:
        raise HTTPException(status_code=404, detail="Production not found")

    # Get losses for this production
    losses = db.query(Loss).filter(
        Loss.production_id == production_id,
        Loss.is_deleted == False
    ).all()

    return losses


@router.post("/losses", status_code=status.HTTP_201_CREATED, response_model=LossResponse)
async def create_loss(
    loss_data: LossCreate,
    request: Request,
    db: Session = Depends(get_db)
):
    """Create a new loss entry"""
    user = request.state.user

    # Verify the production belongs to this team leader
    team_leader = db.query(TeamLeader).filter(
        TeamLeader.user_id == user.sap_id,
        TeamLeader.is_deleted == False
    ).first()

    if not team_leader:
        raise HTTPException(status_code=404, detail="Team leader not found")

    production = db.query(Production).filter(
        Production.id == loss_data.production_id,
        Production.team_leader_id == team_leader.user_id,
        Production.is_deleted == False
    ).first()

    if not production:
        raise HTTPException(status_code=404, detail="Production not found")

    # Check if loss reason exists
    loss_reason = db.query(LossReason).filter(
        LossReason.id == loss_data.loss_reason_id,
        LossReason.is_deleted == False
    ).first()

    if not loss_reason:
        raise HTTPException(status_code=404, detail="Loss reason not found")

    # Calculate total loss
    total_loss = production.plan - production.achievement

    # Get existing losses for this production
    existing_losses = db.query(Loss).filter(
        Loss.production_id == production.id,
        Loss.is_deleted == False
    ).all()

    existing_loss_total = sum(loss.amount for loss in existing_losses)

    # Check if adding this loss would exceed the total loss
    if existing_loss_total + loss_data.amount > total_loss:
        raise HTTPException(
            status_code=400,
            detail=f"Total loss amount cannot exceed {total_loss}. Current total: {existing_loss_total}, Attempted to add: {loss_data.amount}"
        )

    # Create new loss
    new_loss = Loss(
        amount=loss_data.amount,
        loss_reason_id=loss_data.loss_reason_id,
        production_id=loss_data.production_id
    )

    db.add(new_loss)
    db.commit()
    db.refresh(new_loss)

    return new_loss


@router.delete("/losses/{loss_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_loss(
    loss_id: int,
    request: Request,
    db: Session = Depends(get_db)
):
    """Delete a loss entry"""
    user = request.state.user

    # Get the team leader
    team_leader = db.query(TeamLeader).filter(
        TeamLeader.user_id == user.sap_id,
        TeamLeader.is_deleted == False
    ).first()

    if not team_leader:
        raise HTTPException(status_code=404, detail="Team leader not found")

    # Get the loss
    loss = db.query(Loss).filter(
        Loss.id == loss_id,
        Loss.is_deleted == False
    ).first()

    if not loss:
        raise HTTPException(status_code=404, detail="Loss not found")

    # Check if the loss belongs to a production of this team leader
    production = db.query(Production).filter(
        Production.id == loss.production_id,
        Production.team_leader_id == team_leader.user_id,
        Production.is_deleted == False
    ).first()

    if not production:
        raise HTTPException(
            status_code=403, detail="Not authorized to delete this loss")

    # Mark as deleted
    loss.is_deleted = True
    loss.deleted_at = datetime.now()

    db.commit()

    return None
