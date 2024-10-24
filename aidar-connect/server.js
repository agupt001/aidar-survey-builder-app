/*
* Server API routes
* Description: Defining different APIs using generics
*   Add new models if needed in future
* Author: Ankit Gupta
* Created Date: 10/17/2024
*/
// Import dependencies
const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');

// Import the models
const Survey = require('./models/Survey');
const Physician = require('./models/Physician');
const Patient = require('./models/Patient');
const Assignment = require('./models/Assignment');

// Import the generic route factory
const createRoutes = require('./routes/createRoutes');

// Establish DB connection
dotenv.config();
const app = express();
connectDB();

// Enable cross origin policies & JSON
app.use(cors());
app.use(express.json());

// Dynamically create routes for each model
app.use('/api/surveys', createRoutes(Survey));
app.use('/api/physicians', createRoutes(Physician));
app.use('/api/patients', createRoutes(Patient));
app.use('/api/assignments', createRoutes(Assignment));

// Start the connection on port 5500
const PORT = process.env.PORT || 5500;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));