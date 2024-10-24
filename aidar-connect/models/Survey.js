/*
* Survey Schema for MongoDB
* Description: Store the survey built from Survey Builder
* Author: Ankit Gupta
* Created Date: 10/16/2024
*/
const mongoose = require("mongoose");

const surveySchema = new mongoose.Schema(
  {
    physicianId: { type: String, required: true },
    title: { type: String, required: true },
    questions: [
      {
        questionId: String,
        questionText: String,
        fieldType: String, // "text", "input", etc.
        required: { type: Boolean, default: false },
        options: [String], // for radio & checkboxes
      },
    ],
    createdAt: Date,
    modifiedAt: { type: Date, default: Date.now },
  },
  { collection: "survey_schema" }
);

const Survey = mongoose.model("Survey", surveySchema);
module.exports = Survey;
