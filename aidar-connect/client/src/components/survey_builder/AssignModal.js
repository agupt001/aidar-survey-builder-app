/*
 * Assign to Patients Modal
 * Description: Show a list of patients to assign survey
 * Author: Ankit Gupta
 * Created Date: 10/19/2024
 */
import React, { useEffect, useState } from "react";
import { Modal, Button, OverlayTrigger, Tooltip } from "react-bootstrap";
import useEntity from "../../hooks/useEntity";
import { Search } from "react-bootstrap-icons";

const AssignModal = ({
  showAssignModal,
  setShowAssignModal,
  surveyId,
  physicianId,
  toastObj,
  setToastObj,
}) => {
  const [searchTerm, setSearchTerm] = useState(""); // For search functionality

  const [updatedAssignedPatients, setUpdatedAssignedPatients] = useState([]); // Track selected patients for saving
  const [patients, setPatients] = useState([]);
  const [prevAssignments, setPrevAssignments] = useState([]); // Track prev patients' assignments

  // API calls for patients and assignments
  const { loadItems: get_patients } = useEntity("patients");
  const {
    addItems,
    removeItems,
    loadItems: loadAssignments,
  } = useEntity("assignments", {
    surveyId: surveyId,
    physicianId: physicianId,
  });

  // One time call to fetch patients and previous assignments
  useEffect(() => {
    async function fetchData() {
      const [patients_data, prev_assign] = await Promise.all([
        get_patients(),
        loadAssignments(),
      ]);
      setPatients(patients_data);
      setPrevAssignments(prev_assign);
    }
    fetchData();
  }, []);

  // Prepopulate assigned patients based on loaded assignments
  useEffect(() => {
    if (prevAssignments.length) {
      const assignedPatients = prevAssignments.map(
        (assignment) => assignment.patientId
      );
      setUpdatedAssignedPatients(assignedPatients);
    }
  }, [prevAssignments]);

  // Track record of changed assignments
  const handleAssignmentChange = (patientId) => {
    if (updatedAssignedPatients.includes(patientId)) {
      setUpdatedAssignedPatients(
        updatedAssignedPatients.filter((id) => id !== patientId)
      ); // Uncheck
    } else {
      setUpdatedAssignedPatients([...updatedAssignedPatients, patientId]); // Check
    }
  };

  // Function to close the modal
  const handleClose = () => {
    setShowAssignModal(false);
  };

  // Tootlip for UI
  const renderTooltip = (msg) => <Tooltip id="button-tooltip">{msg}</Tooltip>;

  // Save changes on button click
  const handleSave = async () => {
    // Generate a toast
    const toastObj = {
      showToast: true,
      message: "Patients assignment changed successfully!",
      variant: "success",
    };
    try {
      // XOR of updatedAssignedPatients with prevAssignments
      const newAssignments = updatedAssignedPatients
        .filter(
          (updated) =>
            !prevAssignments.some((prev) => prev.patientId === updated)
        )
        .map((updated) => ({
          physicianId,
          surveyId,
          patientId: updated,
          status: "pending",
          assignedAt: Date.now(),
        }));

      // XOR of prevAssignments with updatedAssignedPatients
      const removeAssignments = prevAssignments
        .filter((prev) => !updatedAssignedPatients.includes(prev.patientId))
        .map((prev) => prev._id);

      if (newAssignments.length > 0) {
        // Bulk save API for assignments
        await addItems(newAssignments);
      }
      if (removeAssignments.length > 0) {
        // Bulk remove API for assignments
        await removeItems(removeAssignments);
      }
      // Show warning msg on no changes
      if (!newAssignments.length && !removeAssignments.length) {
        toastObj.message = "No new assignments to add.";
        toastObj.variant = "warning";
      }
    } catch (error) {
      toastObj.message = "Failed to save assignments"; // Show error msg
      toastObj.variant = "danger";
    }

    // Show toast
    setToastObj(toastObj);

    // Close modal after saving
    setShowAssignModal(false);
  };

  return (
    <div>
      {/* Modal component */}
      <Modal show={showAssignModal} onHide={handleClose}>
        <Modal.Header closeButton>
          <Modal.Title>Assign Patients</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="input-group mb-3">
            {/* Search Module */}
            <input
              type="search"
              className="form-control"
              placeholder="Search"
              aria-label="Search"
              aria-describedby="basic-addon1"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <span className="input-group-text" id="basic-addon1">
              <Search color="green" />
            </span>
          </div>

          {/* Filter and map patients */}
          {patients
            .filter((patient) =>
              patient.name.toLowerCase().includes(searchTerm.toLowerCase())
            )
            .map((patient) => {
              // Check if this patient has an assignment in prevAssignments and if the status is "completed"
              const patientAssignment = prevAssignments.find(
                (assignment) => assignment.patientId === patient._id
              );

              // Determine if the checkbox should be disabled
              const isDisabled =
                patientAssignment && patientAssignment.status === "completed";

              return (
                <div
                  className="d-flex align-items-center mb-2"
                  key={patient._id}
                >
                  <OverlayTrigger
                    placement="left" // Tooltip placement
                    overlay={renderTooltip(
                      isDisabled ? "Already Completed" : "Change Assignment"
                    )}
                  >
                    <span>
                      <input
                        type="checkbox"
                        className="form-check-input me-3"
                        checked={updatedAssignedPatients.includes(patient._id)}
                        disabled={isDisabled}
                        onChange={() => handleAssignmentChange(patient._id)}
                      />
                    </span>
                  </OverlayTrigger>
                  <span className="fw-bold flex-fill">{patient.name}</span>
                  <span className="fst-italic text-primary">
                    {patient.email}
                  </span>
                </div>
              );
            })}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="outline-secondary" size="sm" onClick={handleClose}>
            Close
          </Button>
          <Button variant="outline-primary" size="sm" onClick={handleSave}>
            Save Changes
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default AssignModal;
