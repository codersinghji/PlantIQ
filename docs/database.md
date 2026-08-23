Day 2 - Database Design

Now ask:

What information do we need to store?

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

Database Design

Now ask:

What information must we save?

For example:

A user logs in.

Where is the user stored?

In the Users collection.

A machine is added.

Where is it stored?

In the Equipment collection.

So before coding, we identify all the data our application needs.