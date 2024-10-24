/*
* MongoDB connection
* Description: Connection request for MongoDB
* Author: Ankit Gupta
* Created Date: 10/17/2024
*/
const mongoose = require('mongoose');
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {}); // Connect to MongoDB
    console.log('MongoDB connected');
  } catch (error) {
    console.error('MongoDB connection failed:', error.message);
    process.exit(1);
  }
};
module.exports = connectDB;
