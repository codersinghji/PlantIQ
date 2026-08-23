Day 2 - API Design

Think about:

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

React
↓

Send email & password

↓

Node.js

↓

MongoDB

↓

Check User

↓

Return Success

↓

Dashboard Opens

POST /login

POST /register

GET /equipment

POST /equipment