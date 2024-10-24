/*
 * Generic Entity generator
 * Description: Generic entity class to handle API requests from client
 * Author: Ankit Gupta
 * Created Date: 10/21/2024
 */
import { useState } from "react";
import genericAPI from "../api/genericAPI";

const useEntity = (entityName, queryParams = {}) => {
  const api = genericAPI(entityName); // Create the API service dynamically
  const [items, setItems] = useState([]); // Store list of items
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // FETCH all items
  const loadItems = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.getAll(queryParams);
      setItems(data);
      return data;
    } catch (err) {
      setError(`Failed to fetch ${entityName}`);
    } finally {
      setLoading(false);
    }
  };

  // CREATE a new item
  const addItem = async (itemData) => {
    setLoading(true);
    setError(null);
    try {
      const newItem = await api.create(itemData);
      setItems([...items, newItem]); // Add new item to state
      return newItem._id;
    } catch (err) {
      setError(`Failed to create ${entityName}`);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // BULK CREATE multiple items
  const addItems = async (itemsData) => {
    setLoading(true);
    setError(null);
    try {
      const newItems = await api.createBulk(itemsData); // Use createBulk from genericAPI
      setItems([...items, ...newItems]); // Append the newly created items to the existing state
      return newItems.map(item => item._id); // Return an array of new item IDs
    } catch (err) {
      setError(`Failed to create ${entityName}`);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // UPDATE an item by ID
  const updateItem = async (id, updatedData) => {
    setLoading(true);
    setError(null);
    try {
      const updatedItem = await api.update(id, updatedData);
      setItems(items.map((item) => (item._id === id ? updatedItem : item)));
      return updateItem;
    } catch (err) {
      setError(`Failed to update ${entityName}`);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // DELETE an item by ID
  const removeItem = async (id) => {
    setLoading(true);
    setError(null);
    try {
      await api.remove(id);
      setItems(items.filter((item) => item._id !== id)); // Remove item from state
      return 'Deleted Successfully';
    } catch (err) {
      setError(`Failed to delete ${entityName}`);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // BULK REMOVE multiple items
  const removeItems = async (itemsData) => {
    setLoading(true);
    setError(null);
    try {
      const removedItems = await api.removeBulk(itemsData); // Use removeBulk from genericAPI
      setItems((prevItems) => prevItems.filter((item) => !itemsData.includes(item._id))); 
      return removedItems; 
    } catch (err) {
      setError(`Failed to delete entity ${entityName}`);
      throw err;
    } finally {
      setLoading(false);
    }
  };


  // GET a single item by ID
  const fetchItemById = async (id) => {
    setLoading(true);
    setError(null);
    try {
      const item = await api.getById(id);
      return item;
    } catch (err) {
      setError(`Failed to fetch ${entityName} by ID`);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Return state and functions for CRUD operations
  return {
    items,
    loading,
    error,
    addItem,
    addItems,
    updateItem,
    removeItem,
    removeItems,
    fetchItemById,
    loadItems,
  };
};

export default useEntity;
