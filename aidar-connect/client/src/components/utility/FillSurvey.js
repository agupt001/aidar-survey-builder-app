/*
 * Fill Surveys
 * Description: This component will allow patients to fill the responses in surveys
 *    It will also allow both patients and physicians to view responses
 * Author: Ankit Gupta
 * Created Date: 10/22/2024
 */
import React, { useEffect, useState } from "react";
import { Card, CardBody, CardFooter, CardHeader } from "react-bootstrap";
import PatientStarRating from "../patient_pages/PatientStarRating";
import useEntity from "../../hooks/useEntity";

const FillSurvey = ({
  assignment,
  setSelectedAssignment,
  viewOnly = false,
}) => {
  const [responses, setResponses] = useState(assignment.responses || {}); // Set patients responses
  const [errors, setErrors] = useState({});
  const [starReset, setStarReset] = useState(false);

  const { updateItem, loading, error } = useEntity("assignments"); // Update API call

// Format date
  const formattedDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString("en-US", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
  };

  // Handle form input changes
  const handleInputChange = (questionId, value) => {
    if (!viewOnly) {
      setResponses((prevResponses) => ({
        ...prevResponses,
        [questionId]: value,
      }));
    }
  };

  // Handle reset button
  const handleReset = () => {
    setResponses({});
    setErrors({});
    setStarReset(true);
  };

  // Check assignment responses
  useEffect(() => {
    setResponses(assignment.responses || {});
  }, [assignment]);

  // Handle checkbox change (allows multiple selections)
  const handleCheckboxChange = (questionId, option, isChecked) => {
    setResponses((prevResponses) => {
      const prevSelectedOptions = prevResponses[questionId] || [];
      const updatedOptions = isChecked
        ? [...prevSelectedOptions, option]
        : prevSelectedOptions.filter((opt) => opt !== option);

      return {
        ...prevResponses,
        [questionId]: updatedOptions,
      };
    });
  };

  // Custom validation to 
  const validateForm = () => {
    const validationErrors = {};
    assignment.survey.questions.forEach((question) => {
      // Check if at least one checkbox is selected for each required question
      if (question.fieldType === "checkbox" && question.required) {
        const selectedOptions = responses[question.questionId] || [];
        if (selectedOptions.length === 0) {
          validationErrors[question.questionId] =
            "Please select at least one option.";
        }
      }
      // Check if rating is required and null
      if (
        (question.fieldType === "rating" && question.required) &&
        (!responses[question.questionId] ||
          responses[question.questionId] === 0)
      ) {
        validationErrors[question.questionId] = "Please provide a rating.";
      }
    });
    setErrors(validationErrors);
    return Object.keys(validationErrors).length === 0; // Return true if no errors
  };

  // Handle form submission
  const handleSubmit = async (event) => {
    event.preventDefault();

    if (validateForm() && !viewOnly) {
      
      // Construct the payload with updated responses
      const updatedAssignment = {
        ...assignment,
        responses: responses,
        status: "completed", // Mark the assignment as completed
        completedAt: Date.now(), // Set the completion date
      };

      // Call the API to update the assignment
      try {
        await updateItem(assignment._id, updatedAssignment);
        console.log("Survey successfully submitted:", responses);
        setSelectedAssignment(null); // Navigate back or clear the assignment
      } catch (error) {
        console.error("Error submitting survey:", error);
      }
    }
  };

  // Handle back button click
  const handleBackButton = () => {
    setSelectedAssignment(null);
  };

  return (
    <Card className="w-50 m-auto ">
      <CardHeader className="survey-name-input p-4">
        {assignment.survey.title}
        <span className="survey-card-dates text-primary fw-medium fst-italic float-end">
          Assigned On: {formattedDate(assignment.assignedAt)}
        </span><br/>
        {viewOnly ? (
          <span className="survey-card-dates text-success fw-medium fst-italic float-end">
            Completed On: {formattedDate(assignment.completedAt)}
          </span>
        ) : (
          ""
        )}
        {assignment.physician?
        <div className="fs-6 fw-medium fst-italic">
          Physician: {assignment.physician.name}
        </div>:""}
        {assignment.patient?
        <div className="fs-6 fw-medium fst-italic">
          Patient: {assignment.patient.name}
        </div>:""}
      </CardHeader>

      <form onSubmit={handleSubmit}>
        <CardBody>
          {assignment.survey.questions.map((question) => (
            <div key={question.questionId} className="survey-items p-3 m-2">
              <p className="d-inline-flex">
                <span
                  dangerouslySetInnerHTML={{ __html: question.questionText }}
                />
                {question.required && (
                  <span style={{ color: "red", marginLeft: "4px" }}>*</span>
                )}
              </p>

              {question.fieldType === "input" && (
                <input
                  type="text"
                  className="form-control"
                  placeholder="Enter your answer"
                  required={question.required && !viewOnly}
                  value={responses[question.questionId] || ""}
                  disabled={viewOnly}
                  onChange={(e) =>
                    handleInputChange(question.questionId, e.target.value)
                  }
                />
              )}

              {question.fieldType === "radio" &&
                question.options.length > 0 && (
                  <div className="form-check">
                    {question.options.map((option, idx) => (
                      <div key={idx} className="mb-2">
                        <input
                          type="radio"
                          name={question.questionId}
                          value={option}
                          required={question.required}
                          disabled={viewOnly}
                          checked={responses[question.questionId] === option}
                          id={question.questionId}
                          className="form-check-input"
                          onChange={(e) =>
                            handleInputChange(
                              question.questionId,
                              e.target.value
                            )
                          }
                        />
                        <label
                          className="form-check-label"
                          htmlFor={question.questionId}
                          style={{
                            width: "200px",
                            display: "inline-block",
                            marginBottom: "10px",
                          }}
                        >
                          {option}
                        </label>
                      </div>
                    ))}
                  </div>
                )}

              {question.fieldType === "checkbox" &&
                question.options.length > 0 && (
                  <div className="form-check">
                    {question.options.map((option, idx) => (
                      <div key={idx} className="mb-2">
                        <input
                          type="checkbox"
                          value={option}
                          className="form-check-input"
                          disabled={viewOnly}
                          checked={
                            responses[question.questionId]
                              ? responses[question.questionId].includes(option)
                              : false
                          }
                          id={`${question.questionId}-${idx}`}
                          onChange={(e) =>
                            handleCheckboxChange(
                              question.questionId,
                              option,
                              e.target.checked
                            )
                          }
                        />
                        <label
                          className="form-check-label"
                          htmlFor={question.questionId}
                          style={{
                            width: "200px",
                            display: "inline-block",
                            marginBottom: "10px",
                          }}
                        >
                          {option}
                        </label>
                      </div>
                    ))}
                  </div>
                )}

              {question.fieldType === "rating" && (
                <div className="pb-3" style={viewOnly?{pointerEvents:'none'}:{}}>
                  <PatientStarRating
                    value={responses[question.questionId] || 0} // Pass current value if exists
                    onChange={(rating) =>
                      handleInputChange(question.questionId, rating)
                    } // Handle star rating change
                    starReset={starReset}
                    setStarReset={setStarReset}
                    
                  />
                </div>
              )}
              {errors[question.questionId] && (
                <p style={{ color: "red" }}>{errors[question.questionId]}</p>
              )}
            </div>
          ))}
        </CardBody>
        <CardFooter>
          <div className="d-flex">
            <button
              type="button"
              className="btn btn-outline-primary btn-sm me-4 fw-semibold"
              onClick={handleBackButton}
            >
              Back
            </button>
            {!viewOnly && (
              <div className="d-flex flex-fill justify-content-end">
                <button
                  type="reset"
                  className="btn btn-outline-danger btn-sm me-4 fw-semibold"
                  onClick={handleReset}
                >
                  Reset
                </button>
                <button
                  type="submit"
                  className="btn btn-outline-success btn-sm fw-semibold"
                >
                  Submit Survey
                </button>
              </div>
            )}
          </div>
        </CardFooter>
      </form>
    </Card>
  );
};

export default FillSurvey;
