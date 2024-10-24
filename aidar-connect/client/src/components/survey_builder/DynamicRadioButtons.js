/*
 * Multiple choice for Survey Builder
 * Description: Show multiple choice for survey builder
 * Author: Ankit Gupta
 * Created Date: 10/19/2024
 */
import React, { useEffect, useState } from "react";
import DynamicTextBox from "./DynamicTextBox";
import { PlusCircleFill, XLg } from "react-bootstrap-icons";
import RequiredSwitch from "./RequiredSwitch";
const DynamicRadioButtons = ({
  typeOfButton = "radio",
  initialData = {
    isRequired: false,
    questionText: "Question",
    options: ["", ""],
  },
  onSaveQuestion,
}) => {
  const [options, setOptions] = useState(() => initialData.options);
  const [isRequired, setIsRequired] = useState(() => initialData.isRequired);
  const [questionText, setQuestionText] = useState(
    () => initialData.questionText
  ); // To store question text

  // Trigger save whenever questionText, options, or isRequired changes
  useEffect(() => {
    if (
      onSaveQuestion &&
      (questionText !== initialData.questionText ||
        isRequired !== initialData.isRequired ||
        options !== initialData.options)
    ) {
      onSaveQuestion({
        questionText,
        options,
        required: isRequired,
      });
    }
  }, [questionText, options, isRequired]); // Dependencies trigger save

  const addRadio = () => {
    // Add one radio button
    setOptions([...options, ""]);
    console.log(options);
    console.log(initialData.options);
  };

  const deleteRadio = (index) => {
    // Only delete the radio button if there are more than 1 options
    if (options.length > 1) {
      const newOptions = [...options];
      newOptions.splice(index, 1); // Remove the option at the given index
      setOptions(newOptions);
    }
  };

  // Save options on change
  const handleOptionChange = (index, event) => {
    event.target.style.border = "none";
    const newOptions = [...options];
    newOptions[index] = event.target.value;
    setOptions(newOptions);
  };

  return (
    <div>
      <DynamicTextBox
        initialText={questionText}
        onSaveText={(text) => setQuestionText(text)}
      />

      {/* Render the radio buttons */}
      {options.map((option, index) => (
        <div
          key={index}
          style={{ marginBottom: "0.3rem" }}
          className="radio-option-container d-flex align-items-center mb-2"
        >
          <input
            type={typeOfButton}
            name="dynamic-radio"
            className="no-pointer-events"
            value={option}
            onChange={(e) => handleOptionChange(index, e)}
          />{" "}
          <input
            type="text"
            value={option}
            onChange={(e) => handleOptionChange(index, e)}
            placeholder={`Option ${index + 1}`}
            className="form-control flex-grow-1"
            style={{
              width: "200px",
              display: "inline-block",
              marginLeft: "10px",
            }}
          />
          {/* Show delete button if there are more than 1 radio buttons */}
          {options.length > 1 && (
            <span
              className="radio-delete ms-2 mb-1"
              onClick={() => deleteRadio(index)}
            >
              <XLg color="red" />
            </span>
          )}
        </div>
      ))}
      <div className="radio-add" onClick={addRadio}>
        <PlusCircleFill color="green" size={13} />
      </div>

      {/* Required switch */}
      <RequiredSwitch
        isRequired={isRequired}
        onToggleRequired={setIsRequired}
      />
    </div>
  );
};

export default DynamicRadioButtons;
