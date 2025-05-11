# Flash Feather

A minimal, LLM-friendly web framework combining Python FastAPI, Jinja2 templates, and Lit.js components - designed for building modern web applications with simplicity and clarity.

## Core Philosophy

Flash Feather follows these key principles:

1. **Minimalism**: Keep it simple, avoid unnecessary abstractions
2. **Clean Structure**: Organized project layout with clear separation of concerns
3. **Direct Approach**: Avoid over-engineering and unnecessary layers
4. **LLM-Friendly**: Code patterns that work well with AI assistance
5. **Pragmatic Development**: Use complexity only when needed, simple is better

## Tech Stack

- **Backend**: Python FastAPI
- **Database ORM**: SQLAlchemy
- **Validation**: Pydantic (defined within API files)
- **Templating**: Jinja2 (page structure only)
- **Frontend Components**: Lit.js (without Shadow DOM)
- **Authentication**: JWT (with no expiration time)
- **UI Resources**: Google Fonts, FontAwesome icons

## Project Structure

```
flash-feather/
├── app/
│   ├── main.py                  # FastAPI application configuration
│   ├── database.py              # Database connection and utilities
│   ├── models.py                # SQLAlchemy database models
│   ├── routes/
│   │   ├── web.py               # Web page routes (HTML responses)
│   │   └── api/                 # API routes directory (JSON responses)
│   │       ├── user_api.py      # User-related API endpoints
│   │       ├── item_api.py      # Item-related API endpoints
│   │       └── auth_api.py      # Authentication API endpoints
│   ├── services/                # Service layer
│   │   └── complex_service.py   # Complex business logic
│   ├── public/                  # Static assets
│   │   ├── js/
│   │   │   ├── components/      # Lit.js components
│   │   │   │   ├── global/      # Global components
│   │   │   │   │   └── app-header.js
│   │   │   │   ├── item/        # Item-specific components
│   │   │   │   │   ├── item-card.js
│   │   │   │   │   └── item-filter.js  # Component with CustomEvent
│   │   │   │   └── user/        # User-specific components
│   │   │   └── utils/           # Utility function files
│   │   │       ├── auth_utils.js
│   │   │       ├── api_utils.js
│   │   │       └── item_utils.js    # Item-specific utilities
│   │   └── images/              # Image assets
│   └── templates/               # Jinja2 templates
│       ├── base.html            # Base template
│       ├── index.html           # Home page template
│       └── feature/             # Feature-specific templates
│           ├── item_list.html   # Item listing page
│           └── item_detail.html # Item detail page
└── requirements.txt             # Python dependencies
```

## Getting Started

### Installation

1. Create a virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

2. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

3. Run the application:
   ```bash
   cd flash-feather
   python -m app.main
   ```

4. Visit http://localhost:8000 in your browser

## Entry Point (app/main.py)

The main.py file is the entry point for your application, where everything is connected together:

```python
from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from pathlib import Path

# Import routers
from app.routes.web import router as web_router
from app.routes.api.user_api import router as user_api_router
from app.routes.api.item_api import router as item_api_router
from app.routes.api.auth_api import router as auth_api_router

# Import database functions
from app.database import init_db

# Create FastAPI app
app = FastAPI(title="Flash Feather App", version="1.0.0")

# Configure static files
app.mount("/static", StaticFiles(directory=Path(__file__).parent / "public"), name="static")

# Configure templates
templates = Jinja2Templates(directory=Path(__file__).parent / "templates")

# Include routers
app.include_router(web_router)
app.include_router(user_api_router)
app.include_router(item_api_router)
app.include_router(auth_api_router)

# Initialize database on startup
@app.on_event("startup")
async def startup():
    init_db()

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
```

This main.py file:

1. Creates the FastAPI application instance
2. Configures static file serving
3. Sets up Jinja2 templates
4. Imports and includes all the different routers (web and API)
5. Imports database functions from the dedicated database service
6. Initializes the database on startup
7. Includes a development server configuration

## Database Configuration (app/database.py)

The database.py file centralizes all database-related functionality:

```python
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

# Database configuration
DATABASE_URL = "sqlite:///./app.db"
engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Database dependency function
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Initialize database
def init_db():
    # Import models here to avoid circular imports
    from app.models import Base
    Base.metadata.create_all(bind=engine)
```

This separates database concerns from the main application file, making the code more modular and maintainable.

## Database Models

Flash Feather uses SQLAlchemy for database operations. Models are defined in `app/models.py`.

```python
from sqlalchemy import Column, Integer, String, Boolean, ForeignKey
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship

Base = declarative_base()

class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    is_active = Column(Boolean, default=True)
    
    items = relationship("Item", back_populates="owner")

class Item(Base):
    __tablename__ = "items"
    
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True)
    description = Column(String)
    owner_id = Column(Integer, ForeignKey("users.id"))
    
    owner = relationship("User", back_populates="items")
```

## Routes Organization

### Web Routes (app/routes/web.py)

Web routes serve HTML pages. They don't pass data to templates - components fetch data directly from API endpoints.

```python
from fastapi import APIRouter, Request
from fastapi.responses import HTMLResponse
from ..templates import templates

router = APIRouter()

@router.get("/", response_class=HTMLResponse)
async def home(request: Request):
    return templates.TemplateResponse(
        "index.html",
        {"request": request}
    )

@router.get("/items/{item_id}", response_class=HTMLResponse)
async def item_detail(request: Request, item_id: int):
    return templates.TemplateResponse(
        "feature/item_detail.html",
        {"request": request, "item_id": item_id}
    )
```

### API Routes (app/routes/api/)

API routes are organized in separate files by domain area. Most database operations are done directly in the route handlers. Pydantic models are defined directly within each API file.

#### Example: Item API (app/routes/api/item_api.py)

```python
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel, Field
from typing import Optional, List
from ...database import get_db
from ...models import Item

router = APIRouter(prefix="/api/items")

# Pydantic models defined within the API file
class ItemBase(BaseModel):
    title: str
    description: Optional[str] = None

class ItemCreate(ItemBase):
    pass

class ItemResponse(ItemBase):
    id: int
    owner_id: int
    
    class Config:
        from_attributes = True

@router.get("/{item_id}", response_model=ItemResponse)
def read_item(item_id: int, db: Session = Depends(get_db)):
    # Direct database query - no service layer needed for simple operations
    item = db.query(Item).filter(Item.id == item_id).first()
    if item is None:
        raise HTTPException(status_code=404, detail="Item not found")
    return item

@router.post("/", response_model=ItemResponse)
def create_item(item: ItemCreate, user_id: int, db: Session = Depends(get_db)):
    # Direct database operations - no service layer needed
    db_item = Item(**item.model_dump(), owner_id=user_id)
    db.add(db_item)
    db.commit()
    db.refresh(db_item)
    return db_item
```

### Auth API Example (app/routes/api/auth_api.py)

```python
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel, EmailStr
from ...database import get_db
from ...models import User
import jwt
from passlib.context import CryptContext

router = APIRouter(prefix="/api/auth")

# Pydantic models defined within the API file
class UserBase(BaseModel):
    username: str
    email: EmailStr

class UserCreate(UserBase):
    password: str

class EmailPasswordLogin(BaseModel):
    email: EmailStr
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str

# Config
JWT_SECRET = "your_secret_key"
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

@router.post("/register")
def register(user: UserCreate, db: Session = Depends(get_db)):
    # Check if user exists
    db_user = db.query(User).filter(User.email == user.email).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    # Create new user
    hashed_password = pwd_context.hash(user.password)
    db_user = User(
        username=user.username, 
        email=user.email, 
        hashed_password=hashed_password
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return {"msg": "User created successfully"}

@router.post("/login", response_model=Token)
def login(login_data: EmailPasswordLogin, db: Session = Depends(get_db)):
    # Find user by email
    user = db.query(User).filter(User.email == login_data.email).first()
    if not user or not pwd_context.verify(login_data.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Incorrect email or password")
    
    # Create token with no expiration
    token_data = {"sub": user.email, "user_id": user.id}
    token = jwt.encode(token_data, JWT_SECRET, algorithm="HS256")
    
    return {"access_token": token, "token_type": "bearer"}
```

## Service Layer - When to Use

The service layer is **only for complex business logic** that goes beyond simple database operations. For basic CRUD operations, use SQLAlchemy directly in the route handlers.

Example of appropriate service layer use (complex multi-step process):

```python
# app/services/report_service.py
from sqlalchemy.orm import Session
from ..models import User, Item
from ..database import get_db

class ReportService:
    @staticmethod
    def generate_complex_report(db: Session, user_id: int, report_type: str):
        """A complex multi-step process that justifies a service layer"""
        # 1. Gather data from multiple sources
        user_data = db.query(User).filter(User.id == user_id).first()
        item_data = db.query(Item).filter(Item.owner_id == user_id).all()
        activity_data = get_user_activity_from_external_api(user_id)
        
        # 2. Process and transform data
        processed_data = transform_data_for_report(
            user_data, item_data, activity_data, report_type
        )
        
        # 3. Generate report in appropriate format
        if report_type == "pdf":
            return generate_pdf_report(processed_data)
        elif report_type == "csv":
            return generate_csv_report(processed_data)
        else:
            return processed_data
```

## Templates & Components

### Base Template (app/templates/base.html)

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{% block title %}Flash Feather App{% endblock %}</title>
    
    <!-- Base styles -->
    <style>
        * { box-sizing: border-box; }
        body { margin: 0; font-family: 'Roboto', sans-serif; }
    </style>
    
    <!-- Google Fonts -->
    <link href="https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;700&display=swap" rel="stylesheet">
    
    <!-- FontAwesome for icons -->
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    
    <!-- Common utility scripts (used across all pages) -->
    <script type="module" src="/static/js/utils/auth_utils.js"></script>
    
    <!-- Dynamic module imports (page-specific components and utilities) -->
    <script type="module">
        {% block module_imports %}{% endblock %}
    </script>
</head>
<body>
    <main>
        {% block content %}{% endblock %}
    </main>
    
    {% block scripts %}{% endblock %}
</body>
</html>
```

### Page Template Example (app/templates/index.html)

```html
{% extends "base.html" %}

{% block title %}Home - Flash Feather App{% endblock %}

{% block module_imports %}
import '/static/js/components/global/app-header.js';
import '/static/js/components/item/item-list.js';
import '/static/js/utils/api_utils.js';
import '/static/js/utils/item_utils.js';
{% endblock %}

{% block content %}
<app-header></app-header>
<div class="container">
  <h1>Welcome to Flash Feather</h1>
  <item-list></item-list>
</div>
{% endblock %}
```

### Feature Template Example (app/templates/feature/item_detail.html)

```html
{% extends "base.html" %}

{% block title %}Item Details - Flash Feather App{% endblock %}

{% block module_imports %}
import '/static/js/components/global/app-header.js';
import '/static/js/components/item/item-card.js';
import '/static/js/utils/api_utils.js';
import '/static/js/utils/item_utils.js';
{% endblock %}

{% block content %}
<app-header></app-header>
<div class="container">
  <h1>Item Details</h1>
  <item-card item-id="{{ item_id }}"></item-card>
  <a href="/" class="back-link">
    <i class="fas fa-arrow-left"></i> Back to List
  </a>
</div>
{% endblock %}
```

### Component with CustomEvent Example (app/public/js/components/item/item-filter.js)

```javascript
import { LitElement, html } from 'https://esm.run/lit';

class ItemFilter extends LitElement {
  static get properties() {
    return {
      categories: { type: Array },
      selected: { type: String }
    };
  }

  constructor() {
    super();
    this.categories = [];
    this.selected = '';
  }

  // Disable Shadow DOM to access global styles
  createRenderRoot() {
    return this;
  }
  
  handleFilterChange(e) {
    this.selected = e.target.value;
    
    // Dispatch a custom event that parent components can listen for
    const event = new CustomEvent('filter-change', {
      detail: { 
        category: this.selected 
      },
      bubbles: true,
      composed: true
    });
    
    this.dispatchEvent(event);
  }

  render() {
    return html`
      <div class="item-filter">
        <label class="item-filter-label">
          <i class="fas fa-filter"></i> Filter by category:
        </label>
        <select class="item-filter-select" @change=${this.handleFilterChange}>
          <option value="">All Categories</option>
          ${this.categories.map(cat => html`
            <option value="${cat.id}" ?selected=${this.selected === cat.id}>
              ${cat.name}
            </option>
          `)}
        </select>
      </div>

      <style>
        .item-filter {
          margin: 1rem 0;
          padding: 0.5rem;
          border-bottom: 1px solid #eee;
        }
        .item-filter-label {
          margin-right: 0.5rem;
          font-weight: 500;
        }
        .item-filter-select {
          padding: 0.25rem 0.5rem;
          border: 1px solid #ccc;
          border-radius: 4px;
        }
      </style>
    `;
  }
}

customElements.define('item-filter', ItemFilter);
```

### Global Component Example (app/public/js/components/global/app-header.js)

```javascript
import { LitElement, html } from 'https://esm.run/lit';
import { isAuthenticated, removeToken } from '../../utils/auth_utils.js';

class AppHeader extends LitElement {
  static get properties() {
    return {
      authenticated: { type: Boolean }
    };
  }

  constructor() {
    super();
    this.authenticated = false;
  }

  // Disable Shadow DOM to access global styles
  createRenderRoot() {
    return this;
  }
  
  connectedCallback() {
    super.connectedCallback();
    this.authenticated = isAuthenticated();
  }
  
  handleLogout() {
    removeToken();
    this.authenticated = false;
    window.location.href = '/';
  }

  render() {
    return html`
      <header class="app-header">
        <div class="app-header-logo">
          <a href="/">
            <i class="fas fa-feather"></i> Flash Feather
          </a>
        </div>
        <nav class="app-header-nav">
          <a href="/" class="app-header-nav-link">
            <i class="fas fa-home"></i> Home
          </a>
          <a href="/items" class="app-header-nav-link">
            <i class="fas fa-list"></i> Items
          </a>
          ${this.authenticated ? 
            html`
              <button @click=${this.handleLogout} class="app-header-nav-button">
                <i class="fas fa-sign-out-alt"></i> Logout
              </button>
            ` : 
            html`
              <a href="/login" class="app-header-nav-link">
                <i class="fas fa-sign-in-alt"></i> Login
              </a>
            `
          }
        </nav>
      </header>

      <style>
        .app-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1rem;
          background-color: #f0f4f8;
          border-bottom: 1px solid #ddd;
        }
        .app-header-logo {
          font-size: 1.5rem;
          font-weight: bold;
        }
        .app-header-logo a {
          color: #2b6cb0;
          text-decoration: none;
        }
        .app-header-nav {
          display: flex;
          gap: 1rem;
        }
        .app-header-nav-link {
          color: #4a5568;
          text-decoration: none;
          padding: 0.5rem;
        }
        .app-header-nav-link:hover {
          color: #2b6cb0;
        }
        .app-header-nav-button {
          background: none;
          border: none;
          color: #4a5568;
          cursor: pointer;
          font-size: 1rem;
          padding: 0.5rem;
        }
        .app-header-nav-button:hover {
          color: #2b6cb0;
        }
      </style>
    `;
  }
}

customElements.define('app-header', AppHeader);
```

### Feature Component Example (app/public/js/components/item/item-card.js)

```javascript
import { LitElement, html } from 'https://esm.run/lit';
import { fetchJson } from '../../utils/api_utils.js';

class ItemCard extends LitElement {
  static get properties() {
    return {
      itemId: { type: Number },
      item: { type: Object }
    };
  }

  constructor() {
    super();
    this.itemId = null;
    this.item = null;
  }

  // Disable Shadow DOM to access global styles
  createRenderRoot() {
    return this;
  }
  
  async firstUpdated() {
    if (this.itemId) {
      await this.fetchItemData();
    }
  }
  
  async fetchItemData() {
    try {
      this.item = await fetchJson(`/api/items/${this.itemId}`);
    } catch (error) {
      console.error('Error fetching item data:', error);
    }
  }

  render() {
    if (!this.item) {
      return html`
        <div class="item-card-loading">
          <i class="fas fa-spinner fa-spin"></i> Loading...
        </div>`;
    }
    
    return html`
      <div class="item-card">
        <h3 class="item-title">
          <i class="fas fa-cube"></i> ${this.item.title}
        </h3>
        <p class="item-description">${this.item.description}</p>
      </div>

      <style>
        .item-card {
          border: 1px solid #eaeaea;
          border-radius: 8px;
          padding: 1rem;
          margin: 1rem 0;
        }
        .item-title {
          margin-top: 0;
          color: #333;
        }
        .item-description {
          color: #666;
        }
        .item-card-loading {
          padding: 1rem;
          color: #999;
        }
      </style>
    `;
  }
}

customElements.define('item-card', ItemCard);
```

## Authentication Utilities (app/public/js/utils/auth_utils.js)

```javascript
// auth_utils.js - Handles authentication token management

// Store token in localStorage
export function saveToken(token) {
  localStorage.setItem('auth_token', token);
}

// Retrieve token from localStorage
export function getToken() {
  return localStorage.getItem('auth_token');
}

// Remove token from localStorage
export function removeToken() {
  localStorage.removeItem('auth_token');
}

// Check if user is authenticated
export function isAuthenticated() {
  return !!getToken();
}

// Add token to request headers
export function getAuthHeaders() {
  const token = getToken();
  return token ? { 'Authorization': `Bearer ${token}` } : {};
}
```

### API Utilities (app/public/js/utils/api_utils.js)

```javascript
// api_utils.js - Handles API requests with authentication

import { getAuthHeaders } from './auth_utils.js';

// Fetch JSON data from API with authentication
export async function fetchJson(url, options = {}) {
  const headers = {
    'Content-Type': 'application/json',
    ...getAuthHeaders(),
    ...options.headers
  };
  
  const response = await fetch(url, {
    ...options,
    headers
  });
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({
      detail: `HTTP error ${response.status}`
    }));
    throw new Error(error.detail || 'API request failed');
  }
  
  return response.json();
}

// Post data to API with authentication
export async function postJson(url, data, options = {}) {
  return fetchJson(url, {
    method: 'POST',
    body: JSON.stringify(data),
    ...options
  });
}
```

## Best Practices

1. **Keep it simple**: Don't add layers of abstraction unless they're truly needed
2. **Direct database operations**: Use SQLAlchemy directly in routes for simple CRUD operations
3. **Only use services for complexity**: Reserve service layer for multi-step processes
4. **Component organization**: 
   - Global components in `/js/components/global/`
   - Feature-specific components in `/js/components/feature_name/`
5. **Template organization**:
   - Base template at root level (`base.html`)
   - Home page template at root level (`index.html`)
   - Feature-specific templates in `/feature/` subdirectories
6. **CSS naming**: Prefix CSS classes with component names to avoid conflicts
7. **Disable Shadow DOM**: Components should disable Shadow DOM to access global styles
8. **Dynamic module imports**: Import only the components and utilities needed for each page
9. **Separate API routes by domain**: Organize API endpoints in dedicated files by feature
10. **Keep templates minimal**: Templates should only provide page structure
11. **Use FontAwesome**: Leverage FontAwesome icons for better UI
12. **Use Google Fonts**: Utilize Google Fonts for consistent typography
13. **Inline Pydantic models**: Define validation models directly in API files