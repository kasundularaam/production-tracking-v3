from fastapi import APIRouter, Depends, Request
from fastapi.responses import HTMLResponse
from fastapi.templating import Jinja2Templates
from pathlib import Path

from app.models import User
from app.routes.api.admin_api import admin_required

router = APIRouter()

# Configure templates
templates = Jinja2Templates(directory=Path(
    __file__).parent.parent / "templates")


@router.get("/", response_class=HTMLResponse)
async def index(request: Request):
    """
    Loading screen that redirects based on authentication status
    """
    return templates.TemplateResponse(
        "index.html",
        {"request": request}
    )


@router.get("/admin", response_class=HTMLResponse)
async def admin_dashboard(request: Request):
    """
    Admin dashboard page
    """
    return templates.TemplateResponse(
        "pages/admin/dashboard.html",
        {"request": request}
    )


@router.get("/admin/new-plant", response_class=HTMLResponse)
async def new_plant(request: Request):
    """Render the new plant page"""
    return templates.TemplateResponse(
        "pages/admin/new-plant.html",
        {"request": request}
    )


@router.get("/team-leader", response_class=HTMLResponse)
async def team_leader_dashboard(request: Request):
    """
    Team Leader dashboard page
    """
    return templates.TemplateResponse(
        "team_leader/dashboard.html",
        {"request": request}
    )


@router.get("/login", response_class=HTMLResponse)
async def login(request: Request):
    """Render the login page"""
    return templates.TemplateResponse(
        "pages/login.html",
        {"request": request}
    )


@router.get("/admin/plants/{plant_id}", response_class=HTMLResponse)
async def plant_detail(plant_id: int, request: Request):
    """Render the plant detail page"""
    return templates.TemplateResponse(
        "pages/admin/plant.html",
        {"request": request, "plant_id": plant_id}
    )


@router.get("/admin/zones/new", response_class=HTMLResponse)
async def new_zone(request: Request):
    """Render the new zone page"""
    # Get plant_id from query parameter
    plant_id = request.query_params.get("plant")
    return templates.TemplateResponse(
        "pages/admin/new-zone.html",
        {"request": request, "plant_id": plant_id}
    )


@router.get("/admin/zones/{zone_id}", response_class=HTMLResponse)
async def zone_detail(zone_id: int, request: Request):
    """Render the zone detail page"""
    return templates.TemplateResponse(
        "pages/admin/zone.html",
        {"request": request, "zone_id": zone_id}
    )


@router.get("/admin/loops/new", response_class=HTMLResponse)
async def new_loop(request: Request):
    """Render the new loop page"""
    # Get zone_id from query parameter
    zone_id = request.query_params.get("zone")
    return templates.TemplateResponse(
        "pages/admin/new-loop.html",
        {"request": request, "zone_id": zone_id}
    )


@router.get("/admin/loops/{loop_id}", response_class=HTMLResponse)
async def loop_detail(loop_id: int, request: Request):
    """Render the loop detail page"""
    return templates.TemplateResponse(
        "pages/admin/loop.html",
        {"request": request, "loop_id": loop_id}
    )


@router.get("/admin/lines/new", response_class=HTMLResponse)
async def new_line(request: Request):
    """Render the new line page"""
    # Get loop_id from query parameter
    loop_id = request.query_params.get("loop")
    return templates.TemplateResponse(
        "pages/admin/new-line.html",
        {"request": request, "loop_id": loop_id}
    )


@router.get("/admin/lines/{line_id}", response_class=HTMLResponse)
async def line_detail(line_id: int, request: Request):
    """Render the line detail page"""
    return templates.TemplateResponse(
        "pages/admin/line.html",
        {"request": request, "line_id": line_id}
    )


@router.get("/admin/cells/new", response_class=HTMLResponse)
async def new_cell(request: Request):
    """Render the new cell page"""
    # Get line_id from query parameter
    line_id = request.query_params.get("line")
    return templates.TemplateResponse(
        "pages/admin/new-cell.html",
        {"request": request, "line_id": line_id}
    )


@router.get("/admin/members/new", response_class=HTMLResponse)
async def new_member(request: Request):
    """Render the new member page"""
    # Get cell_id from query parameter
    cell_id = request.query_params.get("cell")
    return templates.TemplateResponse(
        "pages/admin/new-member.html",
        {"request": request, "cell_id": cell_id}
    )


@router.get("/admin/cells/{cell_id}", response_class=HTMLResponse)
async def cell_detail(cell_id: int, request: Request):
    """Render the cell detail page"""
    return templates.TemplateResponse(
        "pages/admin/cell.html",
        {"request": request, "cell_id": cell_id}
    )


@router.get("/admin/planners/new", response_class=HTMLResponse)
async def new_planner(request: Request):
    """Render the new planner page"""
    # Get plant_id from query parameter
    plant_id = request.query_params.get("plant")
    return templates.TemplateResponse(
        "pages/admin/new-planner.html",
        {"request": request, "plant_id": plant_id}
    )


@router.get("/admin/team-leaders/new", response_class=HTMLResponse)
async def new_team_leader(request: Request):
    """Render the new team leader page"""
    # Get line_id from query parameter
    line_id = request.query_params.get("line")
    return templates.TemplateResponse(
        "pages/admin/new-team-leader.html",
        {"request": request, "line_id": line_id}
    )


@router.get("/admin/loss-reasons", response_class=HTMLResponse)
async def admin_loss_reasons(request: Request):
    """Render the admin loss reasons page"""
    return templates.TemplateResponse(
        "pages/admin/loss-reasons.html",
        {"request": request}
    )


@router.get("/admin/loss-reasons/new", response_class=HTMLResponse)
async def admin_new_loss_reason(request: Request):
    """Render the admin new loss reason page"""
    return templates.TemplateResponse(
        "pages/admin/new-loss-reason.html",
        {"request": request}
    )

# =============== PLANNER ROUTES =============== #


@router.get("/planner", response_class=HTMLResponse)
async def planner_dashboard(request: Request):
    """Render the planner dashboard page"""
    return templates.TemplateResponse(
        "pages/planner/dashboard.html",
        {"request": request}
    )


@router.get("/planner/shifts/{shift_id}", response_class=HTMLResponse)
async def planner_shift(shift_id: int, request: Request):
    """Render the planner shift page"""
    return templates.TemplateResponse(
        "pages/planner/shift.html",
        {"request": request, "shift_id": shift_id}
    )


# Add to app/routes/web.py

@router.get("/planner/schedule", response_class=HTMLResponse)
async def planner_schedule(
    line: int,
    shift: int,
    request: Request
):
    """Render the planner schedule page"""
    return templates.TemplateResponse(
        "pages/planner/schedule.html",
        {"request": request, "line_id": line, "shift_id": shift}
    )
