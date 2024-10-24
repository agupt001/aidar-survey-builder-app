/*
 * Patient Star Rating Module
 * Description: Shows star rating in patient's surveys
 * Author: Ankit Gupta
 * Created Date: 10/17/2024
 */
import { useEffect, useState } from "react";
import { FaStar } from "react-icons/fa";

const PatientStarRating = ({ value, onChange, starReset, setStarReset }) => {
  const [rating, setRating] = useState(value || 0); // Track rating

  // Change rating and reset star
  const handleClick = (index) => {
    setRating(index);
    setStarReset(false);
    if (onChange) {
      onChange(index); // Propagate the rating change to the parent component
    }
  };

  // Keep track if reset button is pressed
  useEffect(() => {
    if (starReset) {
      setRating(0);
    }
  }, [starReset]);

  return (
    <div>
      {/* Future upgrade: can have dynamic values for star length */}
      {[...Array(5)].map((_, index) => {
        const starValue = index + 1;
        return (
          <FaStar
            key={starValue}
            size={30}
            color={starValue <= rating ? "#ffc107" : "#e4e5e9"} // Yellow for selected stars, gray for others
            onClick={() => handleClick(starValue)}
            style={{ cursor: "pointer", marginRight: "15px" }}
          />
        );
      })}
    </div>
  );
};
export default PatientStarRating;
