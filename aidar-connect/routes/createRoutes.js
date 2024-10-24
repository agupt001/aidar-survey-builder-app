/*
* Routes for API calls
* Description: CRUD operation generic routes for all the entities
*   Pass the model (entity) directly to create desired route
* Author: Ankit Gupta
* Created Date: 10/17/2024
*/
const express = require("express");

// Generic route factory function
const createRoutes = (Model) => {
  const router = express.Router();

  // CREATE a new document
  router.post("/", async (req, res) => {
    try {
      const document = new Model(req.body); // Generate document for Model
      await document.save(); // Save in DB
      res.status(201).json(document);
    } catch (error) {
      res
        .status(500)
        .json({ message: `Error creating ${Model.modelName}`, error });
    }
  });

  // Bulk CREATE multiple documents
  router.post("/bulk", async (req, res) => {
    try {
      const documents = await Model.insertMany(req.body.items); // Insert all documents in bulk
      res.status(201).json(documents); // Return the newly created documents
    } catch (error) {
      res
        .status(500)
        .json({
          message: `Error creating multiple ${Model.modelName}s`,
          error,
        });
    }
  });

  // GET all documents based on query
  router.get("/", async (req, res) => {
    try {
      const query = {};

      // Add filters based on query parameters
      if (req.query.surveyId) query.surveyId = req.query.surveyId;
      if (req.query.physicianId) query.physicianId = req.query.physicianId;
      if (req.query.patientId) query.patientId = req.query.patientId;

      const documents = await Model.find(query);
      // If no documents found, return an empty array
        if (!documents || documents.length === 0) {
            return res.json({});
        }
        const data = {
          'data': documents
        }
      res.json(data);
    } catch (error) {
      res
        .status(500)
        .json({ message: `Error fetching ${Model.modelName}s`, error });
    }
  });

  // GET a single document by ID
  router.get("/:id", async (req, res) => {
    try {
      const document = await Model.findById(req.params.id);
      // Return error if not found
      if (!document)
        return res
          .status(404)
          .json({ message: `${Model.modelName} not found` });
      const data = {
        'data': document
      }
      res.json(data);
    } catch (error) {
      res.status(500).json({ error: `Failed to fetch ${Model.modelName}` });
    }
  });

  // UPDATE a document by ID
  router.put("/:id", async (req, res) => {
    try {
      const document = await Model.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
      });
      // Return error if not found
      if (!document)
        return res
          .status(404)
          .json({ message: `${Model.modelName} not found` });
      res.json(document);
    } catch (error) {
      res.status(500).json({ error: `Failed to update ${Model.modelName}` });
    }
  });

  // Bulk DELETE multiple documents by IDs
router.delete("/bulk", async (req, res) => {
  try {
    console.log(req.body);
    const { items } = req.body;
    console.log(items);
    
    
    // Use Model.deleteMany to remove documents whose _id is in the provided array
    const result = await Model.deleteMany({ _id: { $in: items } });
    console.log(result);
    
    res.json({ message: `${Model.modelName} deleted successfully` });
  } catch (error) {
    res.status(500).json({
      message: `Error deleting multiple ${Model.modelName}(s)`,
      error,
    });
  }
});

  // DELETE a document by ID
  router.delete("/:id", async (req, res) => {
    try {
      const document = await Model.findByIdAndDelete(req.params.id);
      // Return error if not found
      if (!document)
        return res
          .status(404)
          .json({ message: `${Model.modelName} not found` });
      res.json({ message: `${Model.modelName} deleted successfully` });
    } catch (error) {
      res.status(500).json({ error: `Failed to delete ${Model.modelName}` });
    }
  });



  return router;
};

module.exports = createRoutes;
