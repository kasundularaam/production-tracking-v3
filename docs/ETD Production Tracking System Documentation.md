# ETD Production Tracking System Documentation

## 1. Introduction

ETD Production Tracking is a web-based application developed to monitor and manage manufacturing operations. The system enables real-time tracking of hourly production data and employee attendance while providing valuable insights to administrative users.

## 2. System Overview

The application serves as a centralized platform for production management with a hierarchical structure reflecting the physical organization of the manufacturing facility. It facilitates data collection, monitoring, and analysis of production metrics across various organizational levels.

## 3. Technical Specifications

### 3.1 Visual Design
- **Color Palette**:
  - Main: #131624 (dark blue/black)
  - Accent: #f7eb00 (bright yellow)
  - Text/Icons: #ffffff (white)
- **UI Theme**: Dark-themed, modern interface
- **Device Compatibility**: Desktop and tablet devices

### 3.2 System Architecture
- **Platform**: Web-based application
- **Database**: Relational database system
- **Authentication**: SAP ID-based user identification

## 4. Organizational Hierarchy

The system follows a 5-tier hierarchical structure:

```
Plant (ETD-01, ETD-02...) [Planner Level]
  │
  ├── Zone (Zone-A, Zone-B...)
  │     │
  │     └── Loop (Loop-01, Loop-02...)
  │           │
  │           └── Line (Line-01, Line-02...) [Team Leader Level]
  │                 │
  │                 └── Cell (Cell-01, Cell-02...) [Member Level]
```

## 5. User Roles & Permissions

### 5.1 Admin
- System management and configuration
- User account management
- Access to comprehensive insights and reports
- Initial setup of master data
- Creation of planners, team leaders, and members

### 5.2 Planner
- Associated with Plant level
- Creating and managing shift schedules
- Establishing production plans
- Monitoring production progress

### 5.3 Team Leader
- Associated with Line level
- Updating hourly production data
- Managing member attendance
- Monitoring line performance

### 5.4 Member
- Associated with Cell level
- No direct system access
- Subject to attendance tracking
- Production data associated with their cell

## 6. System Initialization & Setup

### 6.1 Database Initialization
- Admin account created automatically during system initialization
- Admin is responsible for setting up initial master data

### 6.2 Master Data Setup
- **User Setup**:
  - Planners: Configured with plant assignment, SAP ID, and name
  - Team Leaders: Configured with line assignment, SAP ID, and name
  - Members: Configured with cell assignment, SAP ID, and name

- **Reference Data**:
  - Loss Reasons: Imported via Excel file (ID, title, department)
  - Attendance Types: Imported via Excel file (ID, title, color)

## 7. Core Functionality

### 7.1 Production Planning
- **Responsibility**: Planner
- Creating shift schedules
- Establishing production targets
- Assigning resources

### 7.2 Production Tracking
- **Responsibility**: Team Leader
- Hourly production data entry
- Production loss documentation
- Real-time performance monitoring

### 7.3 Attendance Management
- **Responsibility**: Team Leader
- Marking member attendance
- Recording attendance types
- Tracking workforce availability

### 7.4 Insights & Reporting
- **Responsibility**: Admin
- Production performance analytics
- Attendance pattern analysis
- Resource utilization metrics

## 8. Data Flow

1. Admin initializes the system with master data
2. Planners create production schedules and targets
3. Team Leaders record actual production and attendance
4. System processes data to generate insights
5. Admin reviews performance metrics and makes strategic decisions

## 9. Technical Requirements

- Modern web browser
- Network connectivity to the application server
- Only desktop use no need to make it responsive for other sizes

## 10. Security Considerations

- Authentication through unique SAP ID
- Role-based access control
- Data encryption for sensitive information
- Audit logging of critical system activities