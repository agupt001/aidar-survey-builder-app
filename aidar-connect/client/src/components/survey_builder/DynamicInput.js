/*
 * Input for Survey Builder
 * Description: Show the input field on survey builder
 * Author: Ankit Gupta
 * Created Date: 10/19/2024
 */
import React, { useEffect, useState } from "react";
import DynamicTextBox from "./DynamicTextBox";
import RequiredSwitch from "./RequiredSwitch";

const DynamicInput = ({
  initialData = { isRequired: false, questionText: "Question", options: [] },
  onSaveQuestion,
}) => {
  const [isRequired, setIsRequired] = useState(() => initialData.isRequired);
  const [questionText, setQuestionText] = useState(
    () => initialData.questionText
  );

  // Trigger save whenever questionText, or isRequired changes
  useEffect(() => {
    if (
      onSaveQuestion &&
      (questionText !== initialData.questionText ||
        isRequired !== initialData.isRequired)
    ) {
      onSaveQuestion({
        questionText,
        required: isRequired,
      });
    }
  }, [questionText, isRequired]); // Dependencies trigger save

  return (
    <div>
      <DynamicTextBox
        initialText={questionText}
        onSaveText={(text) => setQuestionText(text)}
      />
      <input
        type="text"
        className="form-control no-pointer-events"
        placeholder="Enter your answer"
      />
      {/* Required switch */}
      <RequiredSwitch
        isRequired={isRequired}
        onToggleRequired={setIsRequired}
      />
    </div>
  );
};

export default DynamicInput;
