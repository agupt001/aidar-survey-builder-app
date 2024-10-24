/*
 * Navigation bar
 * Description: This component will handle all the navigation and UI changes
 * Author: Ankit Gupta
 * Created Date: 10/20/2024
 */
import { useEffect, useState } from "react";
import { BoxArrowLeft, FilePerson, Person, PersonCircle } from "react-bootstrap-icons";
import logo from "../../assets/alavita_health_logo.jpeg";
import useEntity from "../../hooks/useEntity";
import PatientSurveys from "../patient_pages/PatientSurveys";
import SurveyBuilder from "../survey_builder/SurveyBuilder";
import MySurveys from "../physician_pages/MySurveys";

const NavigationBar = () => {

    const [selectedPage, setSelectedPage] = useState("Survey Builder");
    const [userId, setUserId] = useState("");
    const [isPhysician, setIsPhysician] = useState(true);
    const [surveyId, setSurveyId] = useState("");
    const [physicians, setPhysicians] = useState([]);
    const [patients, setPatients] = useState([]);

    const { loadItems: physicians_query, loading, error } = useEntity('physicians');
    const { loadItems: patients_query, pa_loading, pa_error } = useEntity('patients');

    // Use effect to set the userId based on the first physician or patient
    useEffect( () => {

        async function fetchData() {
            const [physician_data, patient_data] = await Promise.all([
                physicians_query(),
                patients_query()
              ]);
            setPhysicians(physician_data);
            setPatients(patient_data);

            // Always call the hook and handle the conditions inside
            if (isPhysician && !loading && physician_data.length > 0 && !userId) {
                setUserId(physician_data[0]._id);  // Set the first physician's ID
                setIsPhysician(true);
                
            } else if (!isPhysician && !pa_loading && patient_data.length > 0 && !userId) {
                setUserId(patient_data[0]._id);  // Set the first patient's ID
                setIsPhysician(false);
            }
          }
        fetchData();
    }, []);

    // Handle page navigation
    const handleNavigation = (page, surveyId="") => {
        setSurveyId(surveyId)
        setSelectedPage(page);
    };

    const handleUserChange = (user_id, isPhysician) => {
        console.log(user_id, isPhysician, selectedPage);
        
        setUserId(user_id);
        setIsPhysician(isPhysician);
        if(!isPhysician){
            setSelectedPage("Patient Surveys");
        }else{
            setSelectedPage("MySurveys");
        }
    }

    const logout = () => {
        console.log('logging out');
    };

  return (
    <div className=''>
        <div className="nav-bar fixed-top">
        <div className="d-flex justify-content-between p-4 pb-0">
            {/* Left side: Show company and logo */}
            <div className="logo-company d-flex align-items-center">
                <img className="logo me-2" src={logo}></img>
                <span className="company-name">Aidar Connect</span>
            </div>

            {/* Right side: Navigation links */}
            <div className="d-flex align-items-center navigation-items">
                {isPhysician ? (
                    <>
                        <span className={`me-3 ${
                        selectedPage === "Survey Builder" ? "active" : ""
                        }`} 
                        onClick={() => handleNavigation('Survey Builder')}>Survey Builder</span>
                    <span className={`me-3 ${
                        selectedPage === "MySurveys" ? "active" : ""
                        }`} 
                        onClick={() => handleNavigation('MySurveys')}>My Surveys</span>
                    </>
                ):(
                    <>
                    <span className={`me-3 ${
                        selectedPage === "Patient Surveys" ? "active" : ""
                        }`} 
                        onClick={() => handleNavigation('Patient Surveys')}>My Surveys</span>
                    </>
                )}
                
                {/* Dropdown for users */}
                <div className="dropdown">
                <span id="dropdownMenuButton" data-bs-toggle="dropdown" aria-expanded="false">
                    <PersonCircle size={25} color="orange"/>
                </span>
                <ul className="user-dropdown dropdown-menu dropdown-menu-end" aria-labelledby="dropdownMenuButton">
                    {/* Physicians */}
                    <li><span className="dropdown-item user-header">PHYSICIANS</span></li>
                    <li><hr className="dropdown-divider"/></li>
                    {physicians.map((physician) => (
                        <li key={physician._id} style={userId===physician._id? {pointerEvents:"none"}:{}}>
                            <span className={`dropdown-item ${physician._id === userId ? "active-user": ""}`} onClick={() => handleUserChange(physician._id, true)}>
                                <FilePerson className={`users-icon ${physician._id === userId ? "active-user": ""}`}/>{physician.name}</span>
                        </li>
                        ))}
                    {/* Patients */}
                    <li><hr className="dropdown-divider"/></li>
                    <li><span className="dropdown-item user-header">PATIENTS</span></li>
                    <li><hr className="dropdown-divider"/></li>
                    {patients.map((patient) => (
                        <li key={patient._id} style={userId===patient._id? {pointerEvents:"none"}:{}}>
                            <span className={`dropdown-item ${patient._id === userId ? "active-user": ""}`} onClick={() => handleUserChange(patient._id, false)}>
                                <Person className={`users-icon ${patient._id === userId ? "active-user": ""}`}/>{patient.name}</span>
                        </li>
                        ))}
                    <li><hr className="dropdown-divider"/></li>
                    <li><span className="dropdown-item" onClick={() => logout()}><BoxArrowLeft className="users-icon" color="red"/>Logout</span></li>
                </ul>
                </div>
            </div>
        </div>
        <hr />
        </div>

      {/* Render content based on the selected page */}
      <div className="content">
        {isPhysician ? (
            <>
            <main
            style={{
                display: selectedPage === "Survey Builder" ? "block" : "none",
            }}
            >
            <SurveyBuilder physicianId={userId} surveyId={surveyId}  />
            </main>
            <main
            style={{
                display: selectedPage === "MySurveys" ? "block" : "none",
            }}
            >
            <MySurveys physicianId={userId} handleNavigation={handleNavigation} />
            </main>
            </>) : (
            <>
            <main
            style={{
                display: selectedPage === "Patient Surveys" ? "block" : "none",
            }}
            >
            <PatientSurveys patientId={userId} />
            </main>
            </>)
        }

      </div>

    </div>
  );
};

export default NavigationBar;
