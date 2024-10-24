/*
 * Patient Survey List Module
 * Description: Display all the surveys for the patient
 * Author: Ankit Gupta
 * Created Date: 10/17/2024
 */
import React, { useEffect, useState } from "react";
import useEntity from "../../hooks/useEntity";
import { Button, Card, CardBody, CardHeader } from "react-bootstrap";
import FillSurvey from "../utility/FillSurvey";

const PatientSurveys = ({ patientId }) => {
  const [mergedData, setMergedData] = useState([]);
  const [surveyRecords, setSurveyRecords] = useState([]);
  const [surveyAssignments, setSurveyAssignments] = useState([]);
  const [physicianData, setPhysicianData] = useState([]);
  const [viewOnly, setViewOnly] = useState(false);

  // Fetch assignments of patients
  const { loadItems: surveyAssignmentsQuery } = useEntity("assignments", {
    patientId: patientId,
  });

  // Fetch survey records for the patients
  const { loadItems: surveyRecordsQuery } = useEntity("surveys");

  // Fetch physician data once we have the assignments
  const { loadItems: physicianDataQuery } = useEntity("physicians");

  //   Keep track of selected assignment
  const [selectedAssignment, setSelectedAssignment] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      var merged = [];
      // Fetch Assignment Records and store it
      const assignments = await surveyAssignmentsQuery();
      setSurveyAssignments(assignments);

      // Fetch Survey and Physician Data if we have Assignments
      if (assignments.length > 0) {
        const surveyIds = assignments.map((assignment) => assignment.surveyId);
        const surveys = await surveyRecordsQuery({ _id: { $in: surveyIds } });
        setSurveyRecords(surveys);

        const physicianIds = assignments.map(
          (assignment) => assignment.physicianId
        );
        const physicians = await physicianDataQuery({
          _id: { $in: physicianIds },
        });
        setPhysicianData(physicians);

        // Merge the data to display on UI
        merged = assignments.map((assignment) => {
          const survey = surveys.find(
            (survey) => survey._id === assignment.surveyId
          );
          const physician = physicians.find(
            (physician) => physician._id === assignment.physicianId
          );
          return {
            ...assignment,
            survey: survey || {}, // Attach survey data
            physician: physician || {}, // Attach physician data
          };
        });
      }
      setMergedData(merged); // Store the merged data
    };

    fetchData(); // Call the async function to fetch data
  }, [patientId, selectedAssignment]); // Rerun effect if patientId changes, selectedAssignment to load data after filling survey

  //   Use formatted date
  const formattedDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString("en-US", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
  };

  // Fill survey button click
  const handleFillSurvey = (assignment) => {
    setViewOnly(false);
    setSelectedAssignment(assignment);
  };

  // View response button click
  const handleViewResponse = (assignment) => {
    setViewOnly(true);
    setSelectedAssignment(assignment);
  };

  // Track selectedAssignment to check either fill or view survey
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
            mergedData.map((assignment) => (
              <div className="p-3" key={assignment._id}>
                <Card className="survey-card mb-3" key={assignment._id}>
                  <CardHeader
                    className={`${
                      assignment.status === "completed"
                        ? "bg-success-subtle"
                        : "bg-danger-subtle"
                    }`}
                  >
                    <span className="text-capitalize fw-bold align-middle">
                      Status: {assignment.status}
                    </span>
                    {assignment.status === "completed" ? (
                      <Button
                        variant="outline-success float-end"
                        size="sm"
                        onClick={() => handleViewResponse(assignment)}
                      >
                        View Response
                      </Button>
                    ) : (
                      <Button
                        variant="outline-success float-end"
                        size="sm"
                        onClick={() => handleFillSurvey(assignment)}
                      >
                        Fill Survey
                      </Button>
                    )}
                  </CardHeader>
                  <CardBody>
                    <div className="d-flex justify-content-between">
                      <span className="mb-2 text-primary-emphasis fw-semibold">
                        Title: {assignment.survey.title}
                      </span>
                      <span className="mb-2 text-primary survey-card-dates fst-italic">
                        Assigned On: {formattedDate(assignment.assignedAt)}
                      </span>
                    </div>
                    <div className="d-flex justify-content-between">
                      <span className="fw-semibold">
                        Physician: {assignment.physician.name}
                      </span>
                      {assignment.completedAt ? (
                        <span className="text-success survey-card-dates fst-italic">
                          Completed On: {formattedDate(assignment.completedAt)}
                        </span>
                      ) : (
                        ""
                      )}
                    </div>
                  </CardBody>
                </Card>
              </div>
            ))
          ) : (
            <div className="p-3">
              <Card className="survey-card mb-3">
                <CardBody className="text-center">
                  <span className="fst-italic fw-bold text-danger-emphasis">
                    No Survey Assigned
                  </span>
                </CardBody>
              </Card>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
export default PatientSurveys;
