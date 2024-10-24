/*
* Patient Schema for MongoDB
* Description: Store patients information
* Author: Ankit Gupta
* Created Date: 10/16/2024
*/
const mongoose = require("mongoose");

const patientSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    createdAt: { type: Date, default: Date.now },
  },
  { collection: "patient_data" }
);

const Patient = mongoose.model("Patient", patientSchema);
module.exports = Patient;
