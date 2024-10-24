/*
 * Required switch for Survey Builder
 * Description: Show required switch for each component on survey builder
 * Author: Ankit Gupta
 * Created Date: 10/19/2024
 */
import React from "react";

const RequiredSwitch = ({ isRequired, onToggleRequired }) => {
  return (
    <div className="required-switch form-check form-switch form-check-reverse mt-1">
      <input
        className="form-check-input"
        type="checkbox"
        id="requiredSwitch"
        checked={isRequired}
        onChange={() => onToggleRequired(!isRequired)} // Call parent function to save selection
      />
      <label className="form-check-label" htmlFor="requiredSwitch">
        Required
      </label>
    </div>
  );
};

export default RequiredSwitch;
