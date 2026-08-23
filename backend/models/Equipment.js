import mongoose from "mongoose";

const equipmentSchema = new mongoose.Schema(
    {   
         equipmentCode: {
            type: String,
            required: true,
            unique: true,
            trim: true,
            uppercase: true
        },
        
        name: {
            type: String,
            required: true ,
            trim: true
        },

        type: {
            type: String,
            required: true ,
            trim: true
        },

        location: {
            type: String,
            required: true ,
            trim: true
        },
       
        status: {
           type: String,
          enum: ["Running", "Stopped", "Maintenance"],
          default: "Stopped"
       }
        
    },
    {
        timestamps: true
    }
);

const Equipment = mongoose.model(
    "Equipment",
    equipmentSchema
);

export default Equipment;