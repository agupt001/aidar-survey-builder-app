/*
 * Physicians' Surveys
 * Description: Display all the surveys of physicians
 * Author: Ankit Gupta
 * Created Date: 10/19/2024
 */
import React, { useEffect, useState } from "react";
import useEntity from "../../hooks/useEntity";
import { Button, Card, CardBody, CardHeader } from "react-bootstrap";
import { PencilSquare, Trash3Fill } from "react-bootstrap-icons";
import DeleteSurveyModal from "./DeleteSurveyModal";
import ToastNotification from "../utility/ToastNotification";
import FillSurvey from "../utility/FillSurvey";

const MySurveys = ({ physicianId, handleNavigation }) => {
  const [mergedData, setMergedData] = useState([]);
  const [surveyRecords, setSurveyRecords] = useState([]);
  const [surveyAssignments, setSurveyAssignments] = useState([]);
  const [patientData, setPatientData] = useState([]);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [surveyDeleteId, setSurveyDeleteId] = useState("");
  const [toastObj, setToastObj] = useState({
    showToast: false,
    message: "",
    variant: "success",
  }); // Control for toast

  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [viewOnly, setViewOnly] = useState(false);

  // Fetch survey records for the physician
  const { loadItems: surveyRecordsQuery } = useEntity("surveys", {
    physicianId: physicianId,
  });

  // Fetch assignments once we have the survey records
  const { loadItems: surveyAssignmentsQuery } = useEntity("assignments", {
    physicianId: physicianId,
  });

  // Fetch patient data once we have the assignments
  const { loadItems: patientDataQuery } = useEntity("patients");

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch Surveys and Assignments in Parallel
        const [surveys, assignments] = await Promise.all([
          surveyRecordsQuery(),
          surveyAssignmentsQuery(),
        ]);

        setSurveyRecords(surveys);
        setSurveyAssignments(assignments);

        // Fetch Patients (only if we have assignments)
        if (assignments && assignments.length > 0) {
          const patientIds = assignments.map(
            (assignment) => assignment.patientId
          );
          const patients = await patientDataQuery({ _id: { $in: patientIds } });
          setPatientData(patients);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    if (physicianId) {
      fetchData(); // Call the async function to fetch data
    }
  }, [physicianId, surveyRecords]); // Rerun effect if physicianId changes or record changes

  // Merge the data after fetching
  useEffect(() => {
    if (surveyRecords && surveyAssignments && patientData) {
      const merged = surveyRecords.map((survey) => {
        const relatedAssignments = surveyAssignments.filter(
          (assignment) => assignment.surveyId === survey._id
        );

        const assignmentWithPatients = relatedAssignments.map((assignment) => {
          const patient =
            patientData.find((p) => p._id === assignment.patientId) || {}; // Fallback to empty object if no patient found
          return { ...assignment, patient };
        });

        return { ...survey, assignments: assignmentWithPatients }; // Merge survey with its assignments and patient data
      });

      setMergedData(merged); // Update state with the merged data
    }
  }, [surveyRecords, surveyAssignments, patientData]); // Only run when all data is available

  // Format date for better UX
  const formattedDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString("en-US", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
  };

  // Delete button handler
  const handleDeleteButtonClick = (surveyId) => {
    setSurveyDeleteId(surveyId);
    setShowDeleteModal(true);
  };

  // Edit button - invokes navigation with id in survey builder
  const handleModifyButtonClick = (surveyId) => {
    handleNavigation("Survey Builder", surveyId);
  };

  // View responses of patients
  const handleViewResponse = (assignment, survey) => {
    if (assignment.surveyId === survey._id) {
      const updatedAssignment = {
        ...assignment,
        survey: survey,
      };

      setViewOnly(true);
      setSelectedAssignment(updatedAssignment);
    } else {
      console.log("Ids do not match!");
    }
  };

  return (
    <div className="p-3">
      {selectedAssignment ? (
        <FillSurvey
          assignment={selectedAssignment}
          setSelectedAssignment={setSelectedAssignment}
          viewOnly={viewOnly}
        />
      ) : (
        <div>
          {mergedData.length > 0 ? (
            mergedData.map((survey) => (
              <Card
                className="survey-card p-3 mb-3 position-relative"
                key={survey._id}
              >
                <CardBody className="row d-flex justify-content-between align-items-center">
                  <span className="col fw-bold fs-5">{survey.title}</span>
                  <span className="survey-card-dates col-auto fst-italic pe-5">
                    <div className="mb-2 text-success">
                      Created Date : {formattedDate(survey.createdAt)}
                    </div>
                    <div>
                      Modified Date : {formattedDate(survey.modifiedAt)}
                    </div>
                  </span>
                  {survey.assignments.length > 0 ? (
                    <div>
                      {survey.assignments.map((assignment) => (
                        <Card className="mt-3" key={assignment._id}>
                          <CardHeader
                            className={
                              assignment.status === "completed"
                                ? "bg-success-subtle"
                                : "bg-danger-subtle"
                            }
                          >
                            <span className="text-capitalize fw-bold">
                              Status: {assignment.status}
                            </span>
                            {assignment.status === "completed" ? (
                              <Button
                                variant="outline-success float-end"
                                size="sm"
                                onClick={() =>
                                  handleViewResponse(assignment, survey)
                                }
                              >
                                View Response
                              </Button>
                            ) : (
                              ""
                            )}
                          </CardHeader>
                          <CardBody>
                            <div className="d-flex justify-content-between">
                              <span className="mb-2 text-primary-emphasis fw-semibold">
                                Name: {assignment.patient.name}
                              </span>
                              <span className="mb-2 text-primary survey-card-dates fst-italic">
                                Assigned On:{" "}
                                {formattedDate(assignment.assignedAt)}
                              </span>
                            </div>
                            <div className="d-flex justify-content-between">
                              <span>Email: {assignment.patient.email}</span>
                              {assignment.completedAt ? (
                                <span className="text-success survey-card-dates fst-italic">
                                  Completed On:{" "}
                                  {formattedDate(assignment.completedAt)}
                                </span>
                              ) : (
                                ""
                              )}
                            </div>
                          </CardBody>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <span className="fst-italic fw-semibold survey-card-dates text-danger-emphasis ps-4">
                      No Patients Assigned
                    </span>
                  )}
                </CardBody>
                {/* Delete button */}
                <span
                  className="position-absolute translate-middle top-0 start-100"
                  onClick={(e) => {
                    e.stopPropagation(); // Prevent triggering other click events
                    handleDeleteButtonClick(survey._id); // Action on delete button click
                  }}
                >
                  <Trash3Fill
                    key={survey._id}
                    color="red"
                    className="bg-white pointer-cursor"
                    size={20}
                  />
                </span>
                <span
                  className="position-absolute translate-middle my-survey-edit-icon start-100"
                  onClick={(e) => {
                    e.stopPropagation(); // Prevent triggering other click events
                    handleModifyButtonClick(survey._id); // Action on edit button click
                  }}
                >
                  <PencilSquare
                    key={survey._id}
                    color="teal"
                    className="bg-white pointer-cursor"
                    size={20}
                  />
                </span>
              </Card>
            ))
          ) : (
            <div className="p-3">
              <Card className="survey-card mb-3">
                <CardBody className="text-center">
                  <span className="fst-italic fw-bold text-danger-emphasis">
                    No Survey Created
                  </span>
                </CardBody>
              </Card>
            </div>
          )}
          {showDeleteModal ? (
            <DeleteSurveyModal
              showDeleteModal={showDeleteModal}
              setShowDeleteModal={setShowDeleteModal}
              surveyId={surveyDeleteId}
              setToastObj={setToastObj}
            /> // Show delete confirmation modal
          ) : (
            ""
          )}
          <ToastNotification
            show={toastObj.showToast}
            onClose={() =>
              setToastObj((prev) => ({ ...prev, showToast: false }))
            }
            message={toastObj.message}
            variant={toastObj.variant} // Set toast variant based on save status
          />
        </div>
      )}
    </div>
  );
};
export default MySurveys;
