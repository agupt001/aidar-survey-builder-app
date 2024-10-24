/*
* Assignment Schema for MongoDB
* Description: Track assignment of patients to surveys and store their responses
* Author: Ankit Gupta
* Created Date: 10/16/2024
*/
const mongoose = require("mongoose");

const assignmentSchema = new mongoose.Schema(
  {
    physicianId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Physician",
      required: true,
    },
    surveyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Survey",
      required: true,
    },
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Patient",
    },
    responses: {
        type: Map, // Keeping question ID as keys
        of: mongoose.Schema.Types.Mixed, // Mixed allows flexibility in storing strings, arrays, numbers, etc.
        default: {} // Initialize as an empty object
    },
    status: {
      type: String,
      enum: ["pending", "completed"],
      default: "pending",
    },
    assignedAt: { type: Date },
    completedAt: { type: Date },
  },
  { collection: "survey_assignments" }
);

const Assignment = mongoose.model("Assignment", assignmentSchema);
module.exports = Assignment;
