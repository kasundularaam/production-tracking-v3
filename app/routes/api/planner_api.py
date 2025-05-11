# Update the imports in app/routes/api/planner_api.py

from fastapi import APIRouter, Depends, HTTPException, status, Query, Request
from sqlalchemy.orm import Session, joinedload  # Add joinedload here
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime
from app.database import get_db
from app.models import Hour, Production, User, Planner, Shift, Plant, DayNight, ShiftType, Line, Loop, Zone
from sqlalchemy import desc, func


router = APIRouter(prefix="/api/planner", tags=["planner"])

# Pydantic models


class ShiftCreate(BaseModel):
    date: str
    day_night: DayNight
    shift: ShiftType


class UserResponse(BaseModel):
    sap_id: str
    name: str
    role: str

    class Config:
        from_attributes = True


class PlannerResponse(BaseModel):
    user_id: str
    plant_id: int
    user: Optional[UserResponse] = None

    class Config:
        from_attributes = True


class PlantResponse(BaseModel):
    id: int
    name: str

    class Config:
        from_attributes = True


class ZoneResponse(BaseModel):
    id: int
    name: str
    plant_id: int
    plant: Optional[PlantResponse] = None

    class Config:
        from_attributes = True


class LoopResponse(BaseModel):
    id: int
    name: str
    zone_id: int
    zone: Optional[ZoneResponse] = None

    class Config:
        from_attributes = True


class LineResponse(BaseModel):
    id: int
    name: str
    loop_id: int
    # Now using the properly defined LoopResponse
    loop: Optional[LoopResponse] = None

    class Config:
        from_attributes = True


class LinesResponse(BaseModel):
    items: List[LineResponse]
    total: int


class ShiftResponse(BaseModel):
    id: int
    date: datetime
    day_night: DayNight
    shift: ShiftType
    plant_id: int
    planner_id: str
    created_at: datetime
    plant: Optional[PlantResponse] = None  # Add this line
    planner: Optional[PlannerResponse] = None

    class Config:
        from_attributes = True


class PaginatedShiftResponse(BaseModel):
    items: List[ShiftResponse]
    total: int
    page: int
    limit: int


@router.get("/profile", response_model=PlannerResponse)
async def get_planner_profile(
    request: Request,
    db: Session = Depends(get_db)
):
    """Get the current planner's profile"""
    user = request.state.user

    planner = db.query(Planner).filter(
        Planner.user_id == user.sap_id,
        Planner.is_deleted == False
    ).first()

    if not planner:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Planner profile not found"
        )

    return planner


@router.post("/shifts", response_model=ShiftResponse, status_code=status.HTTP_201_CREATED)
async def create_shift(
    shift_data: ShiftCreate,
    request: Request,
    db: Session = Depends(get_db)
):
    """Create a new shift"""
    user = request.state.user

    # Get planner info
    planner = db.query(Planner).filter(
        Planner.user_id == user.sap_id,
        Planner.is_deleted == False
    ).first()

    if not planner:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Planner profile not found"
        )

    # Convert date string to datetime
    try:
        shift_date = datetime.strptime(shift_data.date, "%Y-%m-%d")
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid date format. Use YYYY-MM-DD"
        )

    # Check if a shift with the same date, day_night, and shift already exists
    existing_shift = db.query(Shift).filter(
        Shift.date == shift_date,
        Shift.day_night == shift_data.day_night,
        Shift.shift == shift_data.shift,
        Shift.plant_id == planner.plant_id,
        Shift.is_deleted == False
    ).first()

    if existing_shift:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A shift with these details already exists"
        )

    # Create new shift
    new_shift = Shift(
        date=shift_date,
        day_night=shift_data.day_night,
        shift=shift_data.shift,
        plant_id=planner.plant_id,
        planner_id=planner.user_id
    )

    db.add(new_shift)
    db.commit()
    db.refresh(new_shift)

    return new_shift


@router.get("/shifts", response_model=PaginatedShiftResponse)
async def list_shifts(
    request: Request,
    page: int = Query(1, gt=0),
    limit: int = Query(10, gt=0, le=50),
    db: Session = Depends(get_db)
):
    """List shifts for the planner's plant"""
    user = request.state.user

    # Get planner info
    planner = db.query(Planner).filter(
        Planner.user_id == user.sap_id,
        Planner.is_deleted == False
    ).first()

    if not planner:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Planner profile not found"
        )

    # Query shifts for the planner's plant
    shifts_query = db.query(Shift).filter(
        Shift.plant_id == planner.plant_id,
        Shift.is_deleted == False
    ).order_by(desc(Shift.created_at))

    # Get total count
    total = shifts_query.count()

    # Apply pagination
    shifts = shifts_query.offset((page - 1) * limit).limit(limit).all()

    return {
        "items": shifts,
        "total": total,
        "page": page,
        "limit": limit
    }


@router.get("/shifts/{shift_id}", response_model=ShiftResponse)
async def get_shift(
    shift_id: int,
    request: Request,
    db: Session = Depends(get_db)
):
    """Get shift details by ID"""
    user = request.state.user

    # Get planner info
    planner = db.query(Planner).filter(
        Planner.user_id == user.sap_id,
        Planner.is_deleted == False
    ).first()

    if not planner:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Planner profile not found"
        )

    # Get shift with plant data
    shift = db.query(Shift).filter(
        Shift.id == shift_id,
        Shift.is_deleted == False
    ).first()

    if not shift:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Shift not found"
        )

    # Verify planner has access to this shift
    if shift.plant_id != planner.plant_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You don't have access to this shift"
        )

    return shift


@router.get("/shifts/{shift_id}/lines", response_model=LinesResponse)
async def list_lines_for_shift(
    shift_id: int,
    request: Request,
    db: Session = Depends(get_db)
):
    """List all lines for the planner's plant based on shift"""
    user = request.state.user

    # Get shift details
    shift = db.query(Shift).filter(
        Shift.id == shift_id,
        Shift.is_deleted == False
    ).first()

    if not shift:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Shift not found"
        )

    # Get planner info
    planner = db.query(Planner).filter(
        Planner.user_id == user.sap_id,
        Planner.is_deleted == False
    ).first()

    if not planner:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Planner profile not found"
        )

    # Verify the shift belongs to the planner's plant
    if shift.plant_id != planner.plant_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You don't have access to this shift"
        )

    # Query lines for this plant
    lines_query = (
        db.query(Line)
        .join(Loop, Line.loop_id == Loop.id)
        .join(Zone, Loop.zone_id == Zone.id)
        .filter(
            Zone.plant_id == planner.plant_id,
            Line.is_deleted == False,
            Loop.is_deleted == False,
            Zone.is_deleted == False
        )
        .options(
            joinedload(Line.loop).joinedload(Loop.zone).joinedload(Zone.plant)
        )
        .order_by(Line.name)
    )

    # Get total count
    total = lines_query.count()

    # Get all lines
    lines = lines_query.all()

    return {
        "items": lines,
        "total": total
    }

# Add to app/routes/api/planner_api.py


@router.get("/lines/{line_id}", response_model=LineResponse)
async def get_line(
    line_id: int,
    request: Request,
    db: Session = Depends(get_db)
):
    """Get line details by ID"""
    user = request.state.user

    # Get planner info
    planner = db.query(Planner).filter(
        Planner.user_id == user.sap_id,
        Planner.is_deleted == False
    ).first()

    if not planner:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Planner profile not found"
        )

    # Get line with related data
    line = (
        db.query(Line)
        .filter(Line.id == line_id, Line.is_deleted == False)
        .join(Loop, Line.loop_id == Loop.id)
        .join(Zone, Loop.zone_id == Zone.id)
        .filter(Zone.plant_id == planner.plant_id)
        .options(
            joinedload(Line.loop).joinedload(Loop.zone).joinedload(Zone.plant)
        )
        .first()
    )

    if not line:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Line not found or you don't have access to it"
        )

    return line


class ProductionPlan(BaseModel):
    hour: Hour
    plan: int
    line_id: int
    shift_id: int


class ProductionPlanRequest(BaseModel):
    productions: List[ProductionPlan]


class ProductionResponse(BaseModel):
    id: int
    plan: Optional[int] = None
    hour: Hour
    line_id: int
    shift_id: int
    planner_id: str
    created_at: datetime

    class Config:
        from_attributes = True


class ProductionsResponse(BaseModel):
    items: List[ProductionResponse]
    total: int


@router.get("/productions", response_model=ProductionsResponse)
async def list_productions(
    shift: int,
    line: int,
    request: Request,
    db: Session = Depends(get_db)
):
    """List productions for a specific shift and line"""
    user = request.state.user

    # Get planner info
    planner = db.query(Planner).filter(
        Planner.user_id == user.sap_id,
        Planner.is_deleted == False
    ).first()

    if not planner:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Planner profile not found"
        )

    # Verify shift belongs to planner's plant
    shift_obj = db.query(Shift).filter(
        Shift.id == shift,
        Shift.plant_id == planner.plant_id,
        Shift.is_deleted == False
    ).first()

    if not shift_obj:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Shift not found or you don't have access to it"
        )

    # Verify line belongs to planner's plant
    line_check = (
        db.query(Line)
        .join(Loop, Line.loop_id == Loop.id)
        .join(Zone, Loop.zone_id == Zone.id)
        .filter(
            Line.id == line,
            Zone.plant_id == planner.plant_id,
            Line.is_deleted == False
        )
        .first()
    )

    if not line_check:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Line not found or you don't have access to it"
        )

    # Get productions
    productions = db.query(Production).filter(
        Production.shift_id == shift,
        Production.line_id == line,
        Production.is_deleted == False
    ).all()

    return {
        "items": productions,
        "total": len(productions)
    }


@router.post("/productions", response_model=List[ProductionResponse], status_code=status.HTTP_201_CREATED)
async def create_productions(
    data: ProductionPlanRequest,
    request: Request,
    db: Session = Depends(get_db)
):
    """Create or update production plans for a shift and line"""
    user = request.state.user

    # Get planner info
    planner = db.query(Planner).filter(
        Planner.user_id == user.sap_id,
        Planner.is_deleted == False
    ).first()

    if not planner:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Planner profile not found"
        )

    if not data.productions or len(data.productions) == 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No production plans provided"
        )

    # Get first production to check shift and line
    first_prod = data.productions[0]

    # Verify shift belongs to planner's plant
    shift = db.query(Shift).filter(
        Shift.id == first_prod.shift_id,
        Shift.plant_id == planner.plant_id,
        Shift.is_deleted == False
    ).first()

    if not shift:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Shift not found or you don't have access to it"
        )

    # Verify line belongs to planner's plant
    line_check = (
        db.query(Line)
        .join(Loop, Line.loop_id == Loop.id)
        .join(Zone, Loop.zone_id == Zone.id)
        .filter(
            Line.id == first_prod.line_id,
            Zone.plant_id == planner.plant_id,
            Line.is_deleted == False
        )
        .first()
    )

    if not line_check:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Line not found or you don't have access to it"
        )

    # Process all production plans
    created_productions = []

    for prod_plan in data.productions:
        # Check if all plans have the same shift and line
        if prod_plan.shift_id != first_prod.shift_id or prod_plan.line_id != first_prod.line_id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="All production plans must be for the same shift and line"
            )

        # Check if production already exists for this hour
        existing_prod = db.query(Production).filter(
            Production.shift_id == prod_plan.shift_id,
            Production.line_id == prod_plan.line_id,
            Production.hour == prod_plan.hour,
            Production.is_deleted == False
        ).first()

        if existing_prod:
            # Update existing production
            existing_prod.plan = prod_plan.plan
            existing_prod.updated_at = func.now()
            db.add(existing_prod)
            created_productions.append(existing_prod)
        else:
            # Create new production
            new_prod = Production(
                plan=prod_plan.plan,
                hour=prod_plan.hour,
                line_id=prod_plan.line_id,
                shift_id=prod_plan.shift_id,
                planner_id=planner.user_id
            )
            db.add(new_prod)
            db.flush()
            created_productions.append(new_prod)

    try:
        db.commit()
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to save production plans: {str(e)}"
        )

    return created_productions
