/*
* Physician Schema for MongoDB
* Description: Store physicians information
* Author: Ankit Gupta
* Created Date: 10/16/2024
*/
const mongoose = require("mongoose");

const physicianSchema = new mongoose.Schema(
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
    createdAt: { type: Date, default: Date.now }
  },
  { collection: "physician_data" }
);

const Physician = mongoose.model("Physician", physicianSchema);
module.exports = Physician;
