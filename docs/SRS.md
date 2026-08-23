# Software Requirements Specification

## 1. Introduction

Project Name:
PlantIQ 

Purpose:
Develop a web application that helps industrial engineers monitor equipment health and predict failures using AI.

Scope: 
The application will provide equipment  monitoring, maintenance management, AI prediction, dashboards, and reports. 

---
  
## 2. Users   

- Admin
- Engineer
- Technician

---

## 3. Functional Requirements 

FR-1 User Login
{
 name,
 email,
 password,
 role
}

FR-2 User Registration


FR-3 Add Equipment
{
 machineName,
 machineType,
 location,
 status,
 healthScore,
 installationDate
}

FR-4 Edit Equipment

FR-5 Delete Equipment

FR-6 View Dashboard

FR-7 AI Prediction

FR-8 Maintenance Work Orders

FR-9 Reports 

---

## 4. Non Functional Requirements  

Responsive UI 

Fast Response 

Secure Authentication 

Easy to Maintain 

Scalable 


Collection 1

Users

{
 name,
 email,
 password,
 role
}
Collection 2

Equipment

{
 machineName,
 machineType,
 location,
 status,
 healthScore,
 installationDate
}
Collection 3

SensorData

{
 equipmentId,
 temperature,
 pressure,
 vibration,
 humidity,
 voltage,
 current,
 timestamp
}
Collection 4

WorkOrders

{
 equipmentId,
 engineerId,
 technicianId,
 priority,
 status,
 description
}
Collection 5

Predictions

{
 equipmentId,
 prediction,
 riskLevel,
 confidence,
 recommendation,
 createdAt
}

How will the frontend communicate with the backend?

Example APIs:

User
POST /api/auth/register

POST /api/auth/login

GET /api/users
Equipment
GET /api/equipment

POST /api/equipment

PUT /api/equipment/:id

DELETE /api/equipment/:id
Sensors
POST /api/sensors

GET /api/sensors/:id
AI
POST /api/predict

GET /api/predictions
Work Orders
POST /api/workorders

GET /api/workorders

PUT /api/workorders/:id

Login

↓

Dashboard

↓

Equipment

↓

Sensor Data

↓

AI Prediction

↓

Reports