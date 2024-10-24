/*
 * Survey Buillder
 * Description: Primary survey builder component
 * Author: Ankit Gupta
 * Created Date: 10/19/2024
 */
import React, { useEffect, useState } from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { Pin, PinFill, PlusSquareFill, Trash3Fill } from 'react-bootstrap-icons';
import Card from 'react-bootstrap/Card';
import CardBody from 'react-bootstrap/esm/CardBody';
import StarRating from './StarRating';
import DynamicRadioButtons from './DynamicRadioButtons';
import DynamicTextBox from './DynamicTextBox';
import DynamicInput from './DynamicInput';
import useEntity from '../../hooks/useEntity';
import AssignModal from './AssignModal';
import { ButtonToolbar, OverlayTrigger, Tooltip } from 'react-bootstrap';
import ToastNotification from '../utility/ToastNotification';
import EventEmitter from '../utility/EventEmitter';

const SurveyBuilder = ({physicianId, surveyId: propSurveyId}) => {

    const [localSurveyId, setLocalSurveyId] = useState(null);
    const {addItem, updateItem, fetchItemById} = useEntity('surveys');
    
  const [items, setItems] = useState([
    { id: '1', content: 'Text Box' }, // rating scales
    { id: '2', content: 'Input Field' }, // short answer field
    { id: '3', content: 'Radio Buttons' }, // radio buttons
    { id: '4', content: 'Checkboxes' }, // checkboxes
    { id: '5', content: 'Rating Scales' }, // rating scales
  ]);

  const [surveyName, setSurveyName] = useState('Untitled Survey');

  const [surveyItems, setSurveyItems] = useState([]);
  const [editingIndex, setEditingIndex] = useState(null); // Track which item is being edited
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [toastObj, setToastObj] = useState({
                                    showToast: false,
                                    message: '',
                                    variant: 'success'
                                }); // Control for toast

    // Effect to load survey if an ID is passed from props
    useEffect(() => {
        const loadSurvey = async () => {
            
        if (propSurveyId && typeof propSurveyId === 'string') {
            console.log('Loading survey with ID:', propSurveyId);
            const prevSurvey = await fetchItemById(propSurveyId);  // Fetch survey data by ID
            if (prevSurvey) {
                setSurveyName(prevSurvey.title);
                setSurveyItems(prevSurvey.questions || []);
                setLocalSurveyId(prevSurvey._id);
            }
        }
        };
        
        loadSurvey();  // Trigger loading of survey
    }, [propSurveyId]);  // Depend only on the ID and the memoized fetch function

    useEffect(() => {
        const handleRecordDeleted = (deletedSurveyId) => {
          if (localSurveyId === deletedSurveyId) {
            console.log("Refreshing view in SurveyBuilder because the record was deleted");
            handleNewSurvey();
          }
        };
    
        EventEmitter.on('surveyRecordDeleted', handleRecordDeleted);
    
        // Cleanup the event listener on component unmount
        return () => {
          EventEmitter.off('surveyRecordDeleted', handleRecordDeleted);
        };
      }, [localSurveyId]);

  // Handle survey name change
  const handleSurveyNameChange = (e) => {
    setSurveyName(e.target.value);
  };

  // Function to toggle edit mode and save changes
  const toggleEditMode = (index) => {
    console.log('index',index, 'editing index', editingIndex);
    
    if (editingIndex === index) {
      setEditingIndex(null); // Exit editing mode
    } else {
      setEditingIndex(index); // Enter editing mode
    }
  };

  // Show tooltip
  const renderTooltip = (msg) => (
    <Tooltip id="button-tooltip">
      {msg}
    </Tooltip>
  );

  // Reset survey builder
  const handleNewSurvey = () => {
    setLocalSurveyId(null);
    setSurveyName('Untitled Survey');
    setSurveyItems([]);
    setEditingIndex(null);
    setShowAssignModal(false);
  }

  // Validate survey before saving
  const validateSurvey = () => {
    let validObj = {
        errorMsg: '',
        isValid: true
    };

    if(surveyItems.length < 1){
        validObj.errorMsg = 'Survey cannot be empty!';
        validObj.isValid = false;
        return validObj;
    } 
  
    surveyItems.forEach((item) => {
        console.log(item);
        
      if (!item.questionText) {
            validObj.errorMsg = 'Text field cannot be empty!';
            validObj.isValid = false;
        }
  
      if (item.options) {
        if(item.options.some(option => option === "")){
            validObj.errorMsg = 'Multiple choice questions must have a valid option!';
            validObj.isValid = false;
        }
        // Check for duplicate options
        else if (new Set(item.options).size !== item.options.length) {
          validObj.errorMsg = 'Multiple choice questions must not have duplicate options!';
          validObj.isValid = false;
        }
      }
    });
  
    return validObj;
  };  

  // Handle save
  const handleSubmit = async () => {
    const saveToast = {
        showToast: true,
        message: '',
        variant: 'success'
    };

    const validObj = validateSurvey();

    if (validObj.isValid) {
      // Submit or save the survey
      console.log('it is valid survey');
      const surveyData = {
        physicianId: physicianId,
        title: surveyName,
        questions: surveyItems,  // Array of questions
        createdAt: localSurveyId ? undefined : Date.now(),  // Only set createdAt on new surveys
        modifiedAt: Date.now(),  // Always update modifiedAt
      };

      try {
        if (localSurveyId) {
          // Update the survey using updateItem from the generic entity hook
          await updateItem(localSurveyId, surveyData);
          saveToast.message = 'Survey updated successfully';
          console.log('Survey updated successfully');
        } else {
          // Add a new survey using addItem from the generic entity hook
          const newSurveyId = await addItem(surveyData);
          setLocalSurveyId(newSurveyId);
          saveToast.message = 'Survey created successfully';
          console.log('Survey created successfully');
        }
      } catch (error) {
        console.error('Error saving survey:', error);
        saveToast.message = 'There was an error saving the survey. Please try again.';
        saveToast.variant = 'danger';
      }

    } else {
        console.log(validObj);
        
        saveToast.message = validObj.errorMsg;
        saveToast.variant = 'danger';
    }
    setToastObj(saveToast);
  };

  const assignSurvey = () => {
    setShowAssignModal(true);
  };

  const handleDeleteButtonClick = (index) => {
    const updatedSurveyItems = Array.from(surveyItems);
    updatedSurveyItems.splice(index, 1);
    setSurveyItems(updatedSurveyItems);
  };

  const handleSaveItem = (itemId, updatedFields) => {
    
    setSurveyItems(prevItems => {
      // Create a copy of the current surveyItems array
      const updatedSurveyItems = [...prevItems];
  
      // Find the index of the item to update
      const itemIndex = updatedSurveyItems.findIndex(item => item.questionId === itemId);
  
      // Check if item is found and update the necessary fields
      if (itemIndex !== -1) {
        const existingItem = updatedSurveyItems[itemIndex];

      // Check if the fields have actually changed before updating
      if (
        existingItem.questionText !== updatedFields.questionText ||
        existingItem.required !== updatedFields.required ||
        existingItem.options !== updatedFields.options
        ) {
            updatedSurveyItems[itemIndex] = {
            ...existingItem,
            ...updatedFields, // Merge updated fields (e.g., questionText, options, required)
            };
            console.log('Survey item updated:', updatedSurveyItems[itemIndex]);
        } else {
            console.log('No changes detected, skipping update');
        }
      }
  
      return updatedSurveyItems;  // Return the updated array to set it as the new state
    });
  };
  
  
  const handleDragStart = (start) => {
    // Useful, can be used for future purpose
  }

  const handleDragDrop = (result) => {
    
    const { source, destination } = result;

    // Exit if destination is null
    if (!destination) return;

    // If dragging within the same list, reorder items
    if (source.droppableId === destination.droppableId) {
      if (source.droppableId === 'SURVEY_ELEMENTS') {
        const reorderedSurveyItems = Array.from(surveyItems);
        const [movedItem] = reorderedSurveyItems.splice(source.index, 1);
        reorderedSurveyItems.splice(destination.index, 0, movedItem);
        setSurveyItems(reorderedSurveyItems);
      }
      return;
    }

    // Handle dragging from FORM_ELEMENTS to SURVEY_ELEMENTS
    if (source.droppableId === 'FORM_ELEMENTS' && destination.droppableId === 'SURVEY_ELEMENTS') {
    let copiedItem;

    // Check which item is being dragged and create the appropriate element
    if (items[source.index].id === '1') {
        const copiedItemId = `1-survey-${Date.now()}`
        // Adding text box field
        copiedItem = { 
            questionId: copiedItemId,
            questionText: 'Your text goes here',
            fieldType: 'text',
          };
      } else if (items[source.index].id === '2') {
        const copiedItemId = `2-survey-${Date.now()}`
        // Add input box
        copiedItem = { 
            questionId: copiedItemId,
            questionText: 'Question',
            fieldType: 'input',
            required: false, 
        };
    } else if (items[source.index].id === '3') {
        const copiedItemId = `3-survey-${Date.now()}`
        // Add radio buttons
        copiedItem = {
            questionId: copiedItemId,
            questionText: 'Question',
            fieldType: 'radio',
            required: false, 
            options: ["",""],
      };
    } else if (items[source.index].id === '4') {
        const copiedItemId = `4-survey-${Date.now()}`
        // Add checkboxes
        copiedItem = { 
            questionId: copiedItemId,
            questionText: 'Question',
            fieldType: 'checkbox',
            required: false, 
            options: ["",""],
          };
      } else if (items[source.index].id === '5') {
        const copiedItemId = `5-survey-${Date.now()}`
        // Add rating scales
        copiedItem = {
            questionId: copiedItemId,
            questionText: 'How would you rate us?',
            fieldType: 'rating',
            required: false, 
          }
     } 
    
      const newSurveyItems = Array.from(surveyItems);
      newSurveyItems.splice(destination.index, 0, copiedItem);
      setSurveyItems(newSurveyItems);
      return;
    }
  };

  // Display different elements on the main survey area after dropping
  const renderFieldComponent = (item) => {
    const initialInputData = {
        isRequired: item.required,
        questionText: item.questionText,
        options: item.options
    };

    switch (item.fieldType) {
        case 'text':
            return (
            <DynamicTextBox
                initialText={item.questionText}
                onSaveText={(text) =>
                handleSaveItem(item.questionId, { questionText: text })
                }
            />
            );
        case 'input':
            return (
                <DynamicInput 
                initialData={initialInputData}
                onSaveQuestion={(questionData) => handleSaveItem(item.questionId, questionData)}
                /> 
            );
        case 'radio':
            return (
                <DynamicRadioButtons 
                    typeOfButton='radio'
                    initialData={initialInputData}
                    onSaveQuestion={(questionData) => handleSaveItem(item.questionId, questionData)}  // Handle save
                />
            );
        case 'checkbox':
            return (
                <DynamicRadioButtons 
                    typeOfButton='checkbox'
                    initialData={initialInputData}
                    onSaveQuestion={(questionData) => handleSaveItem(item.questionId, questionData)}  // Handle save
                />
            );
        case 'rating':
            return (
                <StarRating 
                        initialData={initialInputData}
                        value={0} 
                        onChange={(rating) => console.log('Selected rating:', rating)} 
                        onSaveQuestion={(questionData) => handleSaveItem(item.questionId, questionData)}
                    />
            );
      default:
        return null;
    }
  };

  return (
    <DragDropContext onDragEnd={handleDragDrop} onDragStart={handleDragStart}>
      <div className='layout-wrapper '>
        <div className='row'>
          {/* Form Elements */}
          <div className='form-elements col-md-4'>
              <div className='form-elements-header'>
                <h3>Form Elements</h3>
              </div>
              <hr />
              <Droppable droppableId='FORM_ELEMENTS' type='group' isDropDisabled={true}>
                {(provided) => (
                  <div {...provided.droppableProps} ref={provided.innerRef}>
                    {items.map((item, index) => (
                      <Draggable draggableId={item.id} key={item.id} index={index}>
                        {(provided, snapshot) => (
                          <Card
                            {...provided.dragHandleProps}
                            {...provided.draggableProps}
                            ref={provided.innerRef}
                            className={snapshot.isDragging ? 'dragging-clone' : 'mb-2'}
                          >
                            <CardBody>{item.content}</CardBody>
                          </Card>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
          </div>

          {/* Survey Creation Area */}
          <div className='survey-creation-area col-md-8 position-relative'>
            
            <div className='survey-area-header d-flex align-items-center justify-content-between'>
              <div className='survey-title'>
                <input type='text' 
                    id="surveyName"
                    className="form-control survey-name-input text-wrap"
                    value={surveyName}
                    onChange={handleSurveyNameChange}
                />
              </div>
              <div className='buttons'>
                <ButtonToolbar>
                <button type="button" className="btn btn-outline-secondary btn-sm me-2" onClick={handleNewSurvey}><PlusSquareFill style={{margin:'-1px 4px 0 0'}}/>New</button>
                <button type="button" className="btn btn-outline-primary btn-sm me-2" onClick={handleSubmit}>Save</button>
                <OverlayTrigger
                    placement="bottom" // Tooltip placement
                    overlay={renderTooltip(localSurveyId!==null ? 'Assign Patients': 'Save to Assign Patients')}
                    >
                <span><button type="button" className="btn btn-outline-success btn-sm" 
                    onClick={assignSurvey} 
                    disabled={localSurveyId!==null?false:true}
                    >
                        Assign</button></span>
                        </OverlayTrigger>
                        </ButtonToolbar>
                
              </div>
            </div>
            
            <hr />
            
            {/* Main Survey Area */}
                  <Droppable droppableId='SURVEY_ELEMENTS' type='group'>
                    {(provided, snapshot) => (
                      <div
                        className='survey-droppable-area'
                        {...provided.droppableProps}
                        ref={provided.innerRef}
                        style={{
                          backgroundColor: snapshot.isDraggingOver ? '#f0f8ff' : 'white'
                          
                        }}

                      >
                        {surveyItems.map((item, index) => (
                          <Draggable draggableId={item.questionId} key={item.questionId} index={index}>
                            {(provided, snapshot) => (
                              <div 
                                className='item-container'
                                {...provided.dragHandleProps}
                                {...provided.draggableProps}
                                ref={provided.innerRef}
                              >
                                                      
                                <div className={`survey-items p-3 m-2 ${editingIndex === index ? 'editing' : ''}`}
                                style={{
                                    border: snapshot.isDragging ? '1px solid #ccc' : '1px solid transparent', // Show border on dragging
                                  }}
                                >
                                    {renderFieldComponent(item)}

                                    {/* Delete button */}
                                    <span 
                                        className="edit-button delete-card position-absolute translate-middle" 
                                        onClick={(e) => {
                                        e.stopPropagation(); // Prevent triggering other click events
                                        handleDeleteButtonClick(index); // Action on edit button click
                                        }}
                                    >
                                        <Trash3Fill color='red' size={20}/>
                                    </span>
                                    <span 
                                        className="edit-button pin position-absolute  translate-middle" 
                                        onClick={(e) => {
                                        e.stopPropagation(); // Prevent triggering other click events
                                        toggleEditMode(index); // Action on edit button click
                                        }}
                                    >
                                        { editingIndex===index ? <PinFill color='navy' size={20}/> : <Pin color='navy' size={20}/> }
                                        
                                    </span>
                                </div>
                              </div>
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>
          </div>
        </div>
      </div>
      {showAssignModal ? 
       <AssignModal 
            showAssignModal={showAssignModal}
            setShowAssignModal={setShowAssignModal}
            surveyId={localSurveyId}
            physicianId={physicianId}
            setToastObj={setToastObj}/> 
        :""}
        <ToastNotification
        show={toastObj.showToast}
        onClose={() => setToastObj((prev)=> ({...prev, showToast:false}))}
        message={toastObj.message}
        variant={toastObj.variant} // Set toast variant based on save status
      />
    </DragDropContext>
    
  );
};

export default SurveyBuilder;
