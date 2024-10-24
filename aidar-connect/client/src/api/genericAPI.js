import axios from "axios";

// Generic API Service
const genericAPI = (entity) => {
  const API_URL = `/api/${entity}`; // Base URL for the entity

  // CREATE a new document
  const create = async (data) => {
    try {
      const response = await axios.post(API_URL, data);
      return response.data;
    } catch (error) {
      console.error(`Error creating ${entity}`, error);
      throw error;
    }
  };

  // GET all documents
  const getAll = async (queryParams = {}) => {
    try {
      const queryStr = new URLSearchParams(queryParams).toString();
      
      const response = await axios.get(`${API_URL}?${queryStr}`);
      const data = response.data?.data || [];  // Access the 'data' array from response

      // Use map to transform the data
      const transformedData = data.map(item => {
        // Modify each item here if necessary, e.g., extracting certain fields
        return {
          ...item, // Spread existing fields
          newField: 'Example Value' // Add/modify fields as needed
        };
      });
  
      return transformedData; // Return the mapped array
  
    } catch (error) {
      console.error(`Generic API Error fetching ${entity}`, error);
      throw error;
    }
  };

  // CREATE multiple documents (bulk)
  const createBulk = async (data) => {
    try {
      const response = await axios.post(`${API_URL}/bulk`, { items: data }); // Send array of items in request body
      return response.data; // Expect array of created items
    } catch (error) {
      console.error(`Generic API Error creating multiple ${entity}`, error);
      throw error;
    }
  };

  // GET a document by ID
  const getById = async (id) => {
    try {
      const response = await axios.get(`${API_URL}/${id}`);
      return response ? response.data.data: [];
    } catch (error) {
      console.error(`Generic API Get ID Error fetching ${entity} by ID`, error);
      throw error;
    }
  };

  // UPDATE a document by ID
  const update = async (id, updatedData) => {
    try {
      const response = await axios.put(`${API_URL}/${id}`, updatedData);
      return response.data;
    } catch (error) {
      console.error(`Error updating ${entity}`, error);
      throw error;
    }
  };

  // DELETE a document by ID
  const remove = async (id) => {
    try {
      await axios.delete(`${API_URL}/${id}`);
      return { message: `${entity} deleted successfully` };
    } catch (error) {
      console.error(`Error deleting ${entity}`, error);
      throw error;
    }
  };

// DELETE multiple documents (bulk)
const removeBulk = async (data) => {
  try {
    console.log('api data ',data);
    
    // Send a DELETE request with the array of IDs in the request body
    const response = await axios.delete(`${API_URL}/bulk`, { data: {items: data} });
    return response.data; // Return response from the server
  } catch (error) {
    console.error(`Generic API Error deleting multiple ${entity}`, error);
    throw error;
  }
};



  return {
    create,
    createBulk,
    getAll,
    getById,
    update,
    remove,
    removeBulk,
  };
};

export default genericAPI;
