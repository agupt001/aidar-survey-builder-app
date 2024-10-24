/*
 * Delete Survey Modal
 * Description: Confirm from user before deleting
 * Author: Ankit Gupta
 * Created Date: 10/18/2024
 */
import React from "react";
import { Modal, Button } from "react-bootstrap";
import { TrashFill } from "react-bootstrap-icons";
import useEntity from "../../hooks/useEntity";
import EventEmitter from "../utility/EventEmitter";

const DeleteSurveyModal = ({
  showDeleteModal,
  setShowDeleteModal,
  surveyId,
  setToastObj,
}) => {
  // API call for removing
  const { removeItem } = useEntity("surveys");

  // Function to close the modal
  const handleClose = () => {
    setShowDeleteModal(false);
  };

  // Save changes on button click
  const handleDelete = async () => {
    const toastObj = {
      showToast: true,
      message: "Survey record deleted successfully!",
      variant: "danger",
    };
    try {
      // Delete survey record
      removeItem(surveyId);
      EventEmitter.emit("surveyRecordDeleted", surveyId); // Fire event
    } catch (error) {
      console.error("Failed to save assignments", error);
      toastObj.message = "Failed to save assignments";
      toastObj.variant = "danger";
    }

    // Show toast
    setToastObj(toastObj);

    // Close modal after saving
    setShowDeleteModal(false);
  };

  return (
    <div>
      {/* Modal component */}
      <Modal show={showDeleteModal} onHide={handleClose}>
        <Modal.Header closeButton>
          <Modal.Title>
            <TrashFill color="red" /> Delete Survey
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <span>Are you sure, you want to delete the selected survey?</span>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="outline-secondary" size="sm" onClick={handleClose}>
            Close
          </Button>
          <Button variant="outline-danger" size="sm" onClick={handleDelete}>
            Delete
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default DeleteSurveyModal;
