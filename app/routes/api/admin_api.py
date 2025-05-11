from fastapi import APIRouter, Depends, HTTPException, Query, status, Request
from sqlalchemy import and_, distinct
from sqlalchemy.orm import Session, joinedload
from sqlalchemy.sql import func
from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime
from app.database import get_db
from app.models import Loss, LossReason, Plant, Zone, Loop, Line, Cell, User, Planner, TeamLeader, Member, UserRole

router = APIRouter(prefix="/api/admin")

# Pydantic models for request/response validation


class PlantCreate(BaseModel):
    name: str


class PlantResponse(BaseModel):
    id: int
    name: str
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True
        json_encoders = {
            datetime: lambda dt: dt.isoformat() if dt else None
        }


class ZoneResponse(BaseModel):
    id: int
    name: str
    plant_id: int
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True
        json_encoders = {
            datetime: lambda dt: dt.isoformat() if dt else None
        }


class ZoneCreate(BaseModel):
    name: str
    plant_id: int


class LoopResponse(BaseModel):
    id: int
    name: str
    zone_id: int
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True
        json_encoders = {
            datetime: lambda dt: dt.isoformat() if dt else None
        }


class LoopCreate(BaseModel):
    name: str
    zone_id: int


class LineResponse(BaseModel):
    id: int
    name: str
    loop_id: int
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True
        json_encoders = {
            datetime: lambda dt: dt.isoformat() if dt else None
        }


class LineCreate(BaseModel):
    name: str
    loop_id: int


class CellResponse(BaseModel):
    id: int
    name: str
    line_id: int
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True
        json_encoders = {
            datetime: lambda dt: dt.isoformat() if dt else None
        }


class CellCreate(BaseModel):
    name: str
    line_id: int


class UserResponse(BaseModel):
    sap_id: str
    name: str
    role: str

    class Config:
        from_attributes = True


class MemberResponse(BaseModel):
    user_id: str
    cell_id: int
    user: Optional[UserResponse] = None

    class Config:
        from_attributes = True


class TeamLeaderCreate(BaseModel):
    sap_id: str
    name: str
    line_id: int


class TeamLeaderResponse(BaseModel):
    user_id: str
    line_id: int
    user: Optional[UserResponse] = None

    class Config:
        from_attributes = True


class PlannerCreate(BaseModel):
    sap_id: str
    name: str
    plant_id: int


class PlannerResponse(BaseModel):
    user_id: str
    plant_id: int
    user: Optional[UserResponse] = None

    class Config:
        from_attributes = True


class MemberCreate(BaseModel):
    sap_id: str
    name: str
    cell_id: int


class LossReasonBase(BaseModel):
    id: int
    title: str
    department: str


class LossReasonCreate(LossReasonBase):
    pass


class LossReasonResponse(LossReasonBase):
    created_at: datetime

    class Config:
        from_attributes = True


class LossReasonsResponse(BaseModel):
    items: List[LossReasonResponse]
    total: int


class DashboardStats(BaseModel):
    plants: int
    zones: int
    loops: int
    lines: int
    cells: int
    planners: int
    teamLeaders: int
    members: int

# Check if user is admin middleware


def admin_required(request: Request):
    user = request.state.user
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required"
        )

    if user.role != UserRole.ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin privileges required"
        )

    return user

# Dashboard stats endpoint


@router.get("/dashboard/stats", response_model=DashboardStats)
async def get_dashboard_stats(
    user: User = Depends(admin_required),
    db: Session = Depends(get_db)
):
    """Get statistical counts for admin dashboard"""

    # Get counts for different entities
    plants_count = db.query(func.count(Plant.id)).filter(
        Plant.is_deleted == False).scalar() or 0
    zones_count = db.query(func.count(Zone.id)).filter(
        Zone.is_deleted == False).scalar() or 0
    loops_count = db.query(func.count(Loop.id)).filter(
        Loop.is_deleted == False).scalar() or 0
    lines_count = db.query(func.count(Line.id)).filter(
        Line.is_deleted == False).scalar() or 0
    cells_count = db.query(func.count(Cell.id)).filter(
        Cell.is_deleted == False).scalar() or 0

    # Get counts for different users
    planners_count = db.query(func.count(Planner.user_id)).join(
        User).filter(User.is_deleted == False).scalar() or 0
    team_leaders_count = db.query(func.count(TeamLeader.user_id)).join(
        User).filter(User.is_deleted == False).scalar() or 0
    members_count = db.query(func.count(Member.user_id)).join(
        User).filter(User.is_deleted == False).scalar() or 0

    return {
        "plants": plants_count,
        "zones": zones_count,
        "loops": loops_count,
        "lines": lines_count,
        "cells": cells_count,
        "planners": planners_count,
        "teamLeaders": team_leaders_count,
        "members": members_count
    }

# Plant endpoints


@router.get("/plants", response_model=List[PlantResponse])
async def get_plants(
    user: User = Depends(admin_required),
    db: Session = Depends(get_db)
):
    """Get all plants for admin dashboard"""

    plants = db.query(Plant).filter(Plant.is_deleted ==
                                    False).order_by(Plant.name).all()
    return plants


@router.post("/plants", response_model=PlantResponse, status_code=status.HTTP_201_CREATED)
async def create_plant(
    plant_data: PlantCreate,
    user: User = Depends(admin_required),
    db: Session = Depends(get_db)
):
    """Create a new plant"""

    # Check if plant with the same name already exists
    existing_plant = db.query(Plant).filter(
        Plant.name == plant_data.name,
        Plant.is_deleted == False
    ).first()

    if existing_plant:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A plant with this name already exists"
        )

    # Create new plant
    new_plant = Plant(name=plant_data.name)
    db.add(new_plant)
    db.commit()
    db.refresh(new_plant)

    return new_plant


@router.get("/plants/{plant_id}", response_model=PlantResponse)
async def get_plant(
    plant_id: int,
    user: User = Depends(admin_required),
    db: Session = Depends(get_db)
):
    """Get a specific plant by ID"""

    plant = db.query(Plant).filter(
        Plant.id == plant_id,
        Plant.is_deleted == False
    ).first()

    if not plant:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Plant not found"
        )

    return plant


@router.get("/plants/{plant_id}/zones", response_model=List[ZoneResponse])
async def get_plant_zones(
    plant_id: int,
    user: User = Depends(admin_required),
    db: Session = Depends(get_db)
):
    """Get all zones for a specific plant"""

    # Verify plant exists
    plant = db.query(Plant).filter(
        Plant.id == plant_id,
        Plant.is_deleted == False
    ).first()

    if not plant:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Plant not found"
        )

    # Get zones for this plant
    zones = db.query(Zone).filter(
        Zone.plant_id == plant_id,
        Zone.is_deleted == False
    ).order_by(Zone.name).all()

    return zones


@router.get("/plants/{plant_id}/planners", response_model=List[PlannerResponse])
async def get_plant_planners(
    plant_id: int,
    user: User = Depends(admin_required),
    db: Session = Depends(get_db)
):
    """Get all planners for a specific plant"""

    # Verify plant exists
    plant = db.query(Plant).filter(
        Plant.id == plant_id,
        Plant.is_deleted == False
    ).first()

    if not plant:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Plant not found"
        )

    # Get planners for this plant with eager loading of user data
    planners = db.query(Planner).options(
        joinedload(Planner.user)
    ).filter(
        Planner.plant_id == plant_id
    ).all()

    return planners

# Zone endpoints


@router.get("/zones/{zone_id}", response_model=ZoneResponse)
async def get_zone(
    zone_id: int,
    user: User = Depends(admin_required),
    db: Session = Depends(get_db)
):
    """Get a specific zone by ID"""

    zone = db.query(Zone).filter(
        Zone.id == zone_id,
        Zone.is_deleted == False
    ).first()

    if not zone:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Zone not found"
        )

    return zone


@router.get("/zones/{zone_id}/loops", response_model=List[LoopResponse])
async def get_zone_loops(
    zone_id: int,
    user: User = Depends(admin_required),
    db: Session = Depends(get_db)
):
    """Get all loops for a specific zone"""

    # Verify zone exists
    zone = db.query(Zone).filter(
        Zone.id == zone_id,
        Zone.is_deleted == False
    ).first()

    if not zone:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Zone not found"
        )

    # Get loops for this zone
    loops = db.query(Loop).filter(
        Loop.zone_id == zone_id,
        Loop.is_deleted == False
    ).order_by(Loop.name).all()

    return loops


@router.post("/zones", response_model=ZoneResponse, status_code=status.HTTP_201_CREATED)
async def create_zone(
    zone_data: ZoneCreate,
    user: User = Depends(admin_required),
    db: Session = Depends(get_db)
):
    """Create a new zone"""

    # Check if plant exists
    plant = db.query(Plant).filter(
        Plant.id == zone_data.plant_id,
        Plant.is_deleted == False
    ).first()

    if not plant:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Plant not found"
        )

    # Check if zone with the same name already exists in this plant
    existing_zone = db.query(Zone).filter(
        Zone.name == zone_data.name,
        Zone.plant_id == zone_data.plant_id,
        Zone.is_deleted == False
    ).first()

    if existing_zone:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A zone with this name already exists in this plant"
        )

    # Create new zone
    new_zone = Zone(
        name=zone_data.name,
        plant_id=zone_data.plant_id
    )
    db.add(new_zone)
    db.commit()
    db.refresh(new_zone)

    return new_zone


@router.post("/loops", response_model=LoopResponse, status_code=status.HTTP_201_CREATED)
async def create_loop(
    loop_data: LoopCreate,
    user: User = Depends(admin_required),
    db: Session = Depends(get_db)
):
    """Create a new loop"""

    # Check if zone exists
    zone = db.query(Zone).filter(
        Zone.id == loop_data.zone_id,
        Zone.is_deleted == False
    ).first()

    if not zone:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Zone not found"
        )

    # Check if loop with the same name already exists in this zone
    existing_loop = db.query(Loop).filter(
        Loop.name == loop_data.name,
        Loop.zone_id == loop_data.zone_id,
        Loop.is_deleted == False
    ).first()

    if existing_loop:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A loop with this name already exists in this zone"
        )

    # Create new loop
    new_loop = Loop(
        name=loop_data.name,
        zone_id=loop_data.zone_id
    )
    db.add(new_loop)
    db.commit()
    db.refresh(new_loop)

    return new_loop


@router.get("/loops/{loop_id}", response_model=LoopResponse)
async def get_loop(
    loop_id: int,
    user: User = Depends(admin_required),
    db: Session = Depends(get_db)
):
    """Get a specific loop by ID"""

    loop = db.query(Loop).filter(
        Loop.id == loop_id,
        Loop.is_deleted == False
    ).first()

    if not loop:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Loop not found"
        )

    return loop


@router.get("/loops/{loop_id}/lines", response_model=List[LineResponse])
async def get_loop_lines(
    loop_id: int,
    user: User = Depends(admin_required),
    db: Session = Depends(get_db)
):
    """Get all lines for a specific loop with additional counts"""

    # Verify loop exists
    loop = db.query(Loop).filter(
        Loop.id == loop_id,
        Loop.is_deleted == False
    ).first()

    if not loop:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Loop not found"
        )

    # Query to get lines with cell and team leader counts
    lines_query = db.query(
        Line,
        func.count(distinct(Cell.id)).label('cells_count'),
        func.count(distinct(TeamLeader.user_id)).label('team_leaders_count')
    ).filter(
        Line.loop_id == loop_id,
        Line.is_deleted == False
    ).outerjoin(
        Cell, and_(Cell.line_id == Line.id, Cell.is_deleted == False)
    ).outerjoin(
        TeamLeader, and_(TeamLeader.line_id == Line.id,
                         TeamLeader.is_deleted == False)
    ).group_by(
        Line.id
    ).order_by(
        Line.name
    )

    # Execute query and format results
    results = []
    for line, cells_count, team_leaders_count in lines_query.all():
        line_dict = {
            "id": line.id,
            "name": line.name,
            "loop_id": line.loop_id,
            "cells_count": cells_count,
            "team_leaders_count": team_leaders_count
        }
        results.append(line_dict)

    return results


@router.post("/lines", response_model=LineResponse, status_code=status.HTTP_201_CREATED)
async def create_line(
    line_data: LineCreate,
    user: User = Depends(admin_required),
    db: Session = Depends(get_db)
):
    """Create a new line"""

    # Check if loop exists
    loop = db.query(Loop).filter(
        Loop.id == line_data.loop_id,
        Loop.is_deleted == False
    ).first()

    if not loop:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Loop not found"
        )

    # Check if line with the same name already exists in this loop
    existing_line = db.query(Line).filter(
        Line.name == line_data.name,
        Line.loop_id == line_data.loop_id,
        Line.is_deleted == False
    ).first()

    if existing_line:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A line with this name already exists in this loop"
        )

    # Create new line
    new_line = Line(
        name=line_data.name,
        loop_id=line_data.loop_id
    )
    db.add(new_line)
    db.commit()
    db.refresh(new_line)

    return new_line


@router.get("/lines/{line_id}", response_model=LineResponse)
async def get_line(
    line_id: int,
    user: User = Depends(admin_required),
    db: Session = Depends(get_db)
):
    """Get a specific line by ID"""

    line = db.query(Line).filter(
        Line.id == line_id,
        Line.is_deleted == False
    ).first()

    if not line:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Line not found"
        )

    return line


@router.get("/lines/{line_id}/cells", response_model=List[CellResponse])
async def get_line_cells(
    line_id: int,
    user: User = Depends(admin_required),
    db: Session = Depends(get_db)
):
    """Get all cells for a specific line with member counts"""

    # Verify line exists
    line = db.query(Line).filter(
        Line.id == line_id,
        Line.is_deleted == False
    ).first()

    if not line:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Line not found"
        )

    # Query to get cells with member counts
    cells_query = db.query(
        Cell,
        func.count(distinct(Member.user_id)).label('members_count')
    ).filter(
        Cell.line_id == line_id,
        Cell.is_deleted == False
    ).outerjoin(
        Member, and_(Member.cell_id == Cell.id, Member.is_deleted == False)
    ).group_by(
        Cell.id
    ).order_by(
        Cell.name
    )

    # Execute query and format results
    results = []
    for cell, members_count in cells_query.all():
        cell_dict = {
            "id": cell.id,
            "name": cell.name,
            "line_id": cell.line_id,
            "members_count": members_count
        }
        results.append(cell_dict)

    return results


@router.get("/lines/{line_id}/team-leaders", response_model=List[TeamLeaderResponse])
async def get_line_team_leaders(
    line_id: int,
    user: User = Depends(admin_required),
    db: Session = Depends(get_db)
):
    """Get all team leaders for a specific line"""

    # Verify line exists
    line = db.query(Line).filter(
        Line.id == line_id,
        Line.is_deleted == False
    ).first()

    if not line:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Line not found"
        )

    # Get team leaders for this line with eager loading of user data
    team_leaders = db.query(TeamLeader).options(
        joinedload(TeamLeader.user)
    ).filter(
        TeamLeader.line_id == line_id,
        TeamLeader.is_deleted == False
    ).all()

    return team_leaders


@router.post("/cells", response_model=CellResponse, status_code=status.HTTP_201_CREATED)
async def create_cell(
    cell_data: CellCreate,
    user: User = Depends(admin_required),
    db: Session = Depends(get_db)
):
    """Create a new cell"""

    # Check if line exists
    line = db.query(Line).filter(
        Line.id == cell_data.line_id,
        Line.is_deleted == False
    ).first()

    if not line:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Line not found"
        )

    # Check if cell with the same name already exists in this line
    existing_cell = db.query(Cell).filter(
        Cell.name == cell_data.name,
        Cell.line_id == cell_data.line_id,
        Cell.is_deleted == False
    ).first()

    if existing_cell:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A cell with this name already exists in this line"
        )

    # Create new cell
    new_cell = Cell(
        name=cell_data.name,
        line_id=cell_data.line_id
    )
    db.add(new_cell)
    db.commit()
    db.refresh(new_cell)

    return new_cell


@router.post("/members", response_model=MemberResponse, status_code=status.HTTP_201_CREATED)
async def create_member(
    member_data: MemberCreate,
    user: User = Depends(admin_required),
    db: Session = Depends(get_db)
):
    """Create a new member"""

    # Check if cell exists
    cell = db.query(Cell).filter(
        Cell.id == member_data.cell_id,
        Cell.is_deleted == False
    ).first()

    if not cell:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Cell not found"
        )

    # Check if user with the same SAP ID already exists
    existing_user = db.query(User).filter(
        User.sap_id == member_data.sap_id,
        User.is_deleted == False
    ).first()

    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A user with this SAP ID already exists"
        )

    # Create new user with role MEMBER and password same as SAP ID
    from app.services.auth_service import get_password_hash

    hashed_password = get_password_hash(member_data.sap_id)

    # Create transaction to ensure both user and member are created
    try:
        # Create user first
        new_user = User(
            sap_id=member_data.sap_id,
            name=member_data.name,
            role=UserRole.MEMBER,
            password=hashed_password
        )
        db.add(new_user)
        db.flush()  # Flush to get the user ID without committing transaction

        # Create member linking to the user
        new_member = Member(
            user_id=new_user.sap_id,
            cell_id=member_data.cell_id
        )
        db.add(new_member)
        db.commit()
        db.refresh(new_member)

        # Load the user relationship for response
        db.refresh(new_user)

        return new_member
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create member: {str(e)}"
        )


@router.get("/cells/{cell_id}", response_model=CellResponse)
async def get_cell(
    cell_id: int,
    user: User = Depends(admin_required),
    db: Session = Depends(get_db)
):
    """Get a specific cell by ID"""

    cell = db.query(Cell).filter(
        Cell.id == cell_id,
        Cell.is_deleted == False
    ).first()

    if not cell:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Cell not found"
        )

    return cell


@router.get("/cells/{cell_id}/members", response_model=List[MemberResponse])
async def get_cell_members(
    cell_id: int,
    user: User = Depends(admin_required),
    db: Session = Depends(get_db)
):
    """Get all members for a specific cell"""

    # Verify cell exists
    cell = db.query(Cell).filter(
        Cell.id == cell_id,
        Cell.is_deleted == False
    ).first()

    if not cell:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Cell not found"
        )

    # Get members for this cell with eager loading of user data
    members = db.query(Member).options(
        joinedload(Member.user)
    ).filter(
        Member.cell_id == cell_id,
        Member.is_deleted == False
    ).all()

    return members


@router.post("/planners", response_model=PlannerResponse, status_code=status.HTTP_201_CREATED)
async def create_planner(
    planner_data: PlannerCreate,
    user: User = Depends(admin_required),
    db: Session = Depends(get_db)
):
    """Create a new planner"""

    # Check if plant exists
    plant = db.query(Plant).filter(
        Plant.id == planner_data.plant_id,
        Plant.is_deleted == False
    ).first()

    if not plant:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Plant not found"
        )

    # Check if user with the same SAP ID already exists
    existing_user = db.query(User).filter(
        User.sap_id == planner_data.sap_id,
        User.is_deleted == False
    ).first()

    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A user with this SAP ID already exists"
        )

    # Create new user with role PLANNER and password same as SAP ID
    from app.services.auth_service import get_password_hash

    hashed_password = get_password_hash(planner_data.sap_id)

    # Create transaction to ensure both user and planner are created
    try:
        # Create user first
        new_user = User(
            sap_id=planner_data.sap_id,
            name=planner_data.name,
            role=UserRole.PLANNER,
            password=hashed_password
        )
        db.add(new_user)
        db.flush()  # Flush to get the user ID without committing transaction

        # Create planner linking to the user
        new_planner = Planner(
            user_id=new_user.sap_id,
            plant_id=planner_data.plant_id
        )
        db.add(new_planner)
        db.commit()
        db.refresh(new_planner)

        # Load the user relationship for response
        db.refresh(new_user)

        return new_planner
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create planner: {str(e)}"
        )


@router.post("/team-leaders", response_model=TeamLeaderResponse, status_code=status.HTTP_201_CREATED)
async def create_team_leader(
    team_leader_data: TeamLeaderCreate,
    user: User = Depends(admin_required),
    db: Session = Depends(get_db)
):
    """Create a new team leader"""

    # Check if line exists
    line = db.query(Line).filter(
        Line.id == team_leader_data.line_id,
        Line.is_deleted == False
    ).first()

    if not line:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Line not found"
        )

    # Check if user with the same SAP ID already exists
    existing_user = db.query(User).filter(
        User.sap_id == team_leader_data.sap_id,
        User.is_deleted == False
    ).first()

    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A user with this SAP ID already exists"
        )

    # Create new user with role TEAM_LEADER and password same as SAP ID
    from app.services.auth_service import get_password_hash

    hashed_password = get_password_hash(team_leader_data.sap_id)

    # Create transaction to ensure both user and team leader are created
    try:
        # Create user first
        new_user = User(
            sap_id=team_leader_data.sap_id,
            name=team_leader_data.name,
            role=UserRole.TEAM_LEADER,
            password=hashed_password
        )
        db.add(new_user)
        db.flush()  # Flush to get the user ID without committing transaction

        # Create team leader linking to the user
        new_team_leader = TeamLeader(
            user_id=new_user.sap_id,
            line_id=team_leader_data.line_id
        )
        db.add(new_team_leader)
        db.commit()
        db.refresh(new_team_leader)

        # Load the user relationship for response
        db.refresh(new_user)

        return new_team_leader
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create team leader: {str(e)}"
        )


@router.get("/loss-reasons", response_model=LossReasonsResponse)
async def list_loss_reasons(
    request: Request,
    page: int = Query(1, gt=0),
    limit: int = Query(20, gt=0, le=100),
    db: Session = Depends(get_db)
):
    """List all loss reasons with pagination"""
    user = request.state.user

    # Check if user is admin
    if user.role != UserRole.ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only admins can access this resource"
        )

    # Query loss reasons
    query = db.query(LossReason).filter(
        LossReason.is_deleted == False
    ).order_by(LossReason.id)

    # Count total items
    total = query.count()

    # Apply pagination
    items = query.offset((page - 1) * limit).limit(limit).all()

    return {
        "items": items,
        "total": total
    }


@router.get("/loss-reasons/{loss_reason_id}", response_model=LossReasonResponse)
async def get_loss_reason(
    loss_reason_id: int,
    request: Request,
    db: Session = Depends(get_db)
):
    """Get a specific loss reason by ID"""
    user = request.state.user

    # Check if user is admin
    if user.role != UserRole.ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only admins can access this resource"
        )

    # Get loss reason
    loss_reason = db.query(LossReason).filter(
        LossReason.id == loss_reason_id,
        LossReason.is_deleted == False
    ).first()

    if not loss_reason:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Loss reason not found"
        )

    return loss_reason


@router.post("/loss-reasons", response_model=LossReasonResponse, status_code=status.HTTP_201_CREATED)
async def create_loss_reason(
    loss_reason_data: LossReasonCreate,
    request: Request,
    db: Session = Depends(get_db)
):
    """Create a new loss reason"""
    user = request.state.user

    # Check if user is admin
    if user.role != UserRole.ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only admins can create loss reasons"
        )

    # Check if ID already exists
    existing_reason = db.query(LossReason).filter(
        LossReason.id == loss_reason_data.id,
        LossReason.is_deleted == False
    ).first()

    if existing_reason:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Loss reason with ID {loss_reason_data.id} already exists"
        )

    # Create new loss reason
    new_reason = LossReason(**loss_reason_data.dict())

    try:
        db.add(new_reason)
        db.commit()
        db.refresh(new_reason)
        return new_reason
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create loss reason: {str(e)}"
        )


@router.put("/loss-reasons/{loss_reason_id}", response_model=LossReasonResponse)
async def update_loss_reason(
    loss_reason_id: int,
    loss_reason_data: LossReasonBase,
    request: Request,
    db: Session = Depends(get_db)
):
    """Update an existing loss reason"""
    user = request.state.user

    # Check if user is admin
    if user.role != UserRole.ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only admins can update loss reasons"
        )

    # Get existing loss reason
    loss_reason = db.query(LossReason).filter(
        LossReason.id == loss_reason_id,
        LossReason.is_deleted == False
    ).first()

    if not loss_reason:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Loss reason not found"
        )

    # Check if ID in data matches URL ID
    if loss_reason_data.id != loss_reason_id:
        # Check if new ID already exists
        existing_reason = db.query(LossReason).filter(
            LossReason.id == loss_reason_data.id,
            LossReason.is_deleted == False
        ).first()

        if existing_reason:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Loss reason with ID {loss_reason_data.id} already exists"
            )

    # Update loss reason
    for key, value in loss_reason_data.dict().items():
        setattr(loss_reason, key, value)

    loss_reason.updated_at = func.now()

    try:
        db.add(loss_reason)
        db.commit()
        db.refresh(loss_reason)
        return loss_reason
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update loss reason: {str(e)}"
        )


# Update in app/routes/api/admin_api.py

# Update in app/routes/api/admin_api.py

# Changed from 204 to 200
@router.delete("/loss-reasons/{loss_reason_id}", status_code=status.HTTP_200_OK)
async def delete_loss_reason(
    loss_reason_id: int,
    request: Request,
    db: Session = Depends(get_db)
):
    """Delete a loss reason (permanent delete)"""
    user = request.state.user

    # Check if user is admin
    if user.role != UserRole.ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only admins can delete loss reasons"
        )

    # Get loss reason
    loss_reason = db.query(LossReason).filter(
        LossReason.id == loss_reason_id
    ).first()

    if not loss_reason:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Loss reason not found"
        )

    # Check if there are any losses associated with this reason
    # If there are, we can't delete it
    has_losses = db.query(Loss).filter(
        Loss.loss_reason_id == loss_reason_id
    ).first() is not None

    if has_losses:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot delete loss reason that is being used by loss records"
        )

    # Permanent delete
    try:
        db.delete(loss_reason)
        db.commit()
        # Return a response instead of None
        return {"success": True, "message": "Loss reason deleted successfully"}
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to delete loss reason: {str(e)}"
        )
