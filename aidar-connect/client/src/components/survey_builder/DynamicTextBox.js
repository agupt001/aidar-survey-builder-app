/*
 * Text Box
 * Description: Text box component for all the Survey builder components
 * Author: Ankit Gupta
 * Created Date: 10/20/2024
 */
import React, { useEffect, useState } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

// Reusable Editable Text Box Component
const DynamicTextBox = ({ initialText = 'Your text goes here', onSaveText }) => {
  const [editing, setEditing] = useState(true); // Initially in editing mode
  const [text, setText] = useState(initialText); // Store the HTML content from the editor

  const handleSave = () => {
    setEditing(false); // Switch to display mode
    if (onSaveText) {
      onSaveText(text); // Call parent function to handle the save
    }
  };

  // To stop from entering null value
  useEffect(()=>{},[text]);

  return (
    <div>
      {editing ? (
        <div className='dynamic-text-box'>
          <ReactQuill value={text} onChange={setText} />
          <div className='text-end mb-2'>
            <button onClick={handleSave} 
            className="btn btn-outline-primary btn-sm mt-2"
            disabled={text === "<p><br></p>" ? true : false}
            >Done</button></div>
        </div>
      ) : (
        <div dangerouslySetInnerHTML={{ __html: text }} onClick={() => setEditing(true)} />
      )}
    </div>
  );
};

export default DynamicTextBox;
