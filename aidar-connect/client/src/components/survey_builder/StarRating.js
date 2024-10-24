/*
 * Star Rating for Survey Builder
 * Description: Show star rating for survey builder
 * Author: Ankit Gupta
 * Created Date: 10/19/2024
 */
import React, { useEffect, useState } from "react";
import { FaStar } from "react-icons/fa"; // Using react-icons for stars
import DynamicTextBox from "./DynamicTextBox";
import RequiredSwitch from "./RequiredSwitch";

const StarRating = ({
  initialData = {
    isRequired: false,
    questionText: "How would you rate us?",
    options: [],
  },
  onSaveQuestion,
  value,
  onChange,
}) => {
  const [rating, setRating] = useState(value || 0);
  const [isRequired, setIsRequired] = useState(() => initialData.isRequired);
  const [questionText, setQuestionText] = useState(
    () => initialData.questionText
  );

  // Trigger save whenever questionText, or isRequired changes
  useEffect(() => {
    if (onSaveQuestion) {
      onSaveQuestion({
        questionText,
        required: isRequired,
      });
    }
  }, [questionText, isRequired]); // Dependencies trigger save

  const handleClick = (index) => {
    setRating(index);
    onChange(index); // Propagate change to parent
  };

  return (
    <div>
      <DynamicTextBox
        initialText={questionText}
        onSaveText={(text) => setQuestionText(text)}
      />
      {[...Array(5)].map((_, index) => {
        const starValue = index + 1;
        return (
          <FaStar
            key={starValue}
            size={30} // Change size to make stars bigger
            color={starValue <= rating ? "#ffc107" : "#e4e5e9"} // Yellow for selected stars, gray for others
            onClick={() => handleClick(starValue)}
            style={{ cursor: "pointer", marginRight: "15px" }} // Set margin to separate stars further
            className="no-pointer-events"
          />
        );
      })}
      {/* Required switch */}
      <RequiredSwitch
        isRequired={isRequired}
        onToggleRequired={setIsRequired}
      />
    </div>
  );
};

export default StarRating;
