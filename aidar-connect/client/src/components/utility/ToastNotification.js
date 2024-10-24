/*
 * Toast notification
 * Description: Custom toast display based on msgs
 * Author: Ankit Gupta
 * Created Date: 10/22/2024
 */
import React from "react";
import { Toast, ToastContainer } from "react-bootstrap";

const ToastNotification = ({ show, onClose, message, variant }) => (
    <ToastContainer
          className="p-3"
          position='top-end'
        >
  <Toast show={show} onClose={onClose} delay={3000} bg={variant}>
    <Toast.Header>
      <strong className="me-auto ">{variant === "success" ? "Success" : "Error"}</strong>
    </Toast.Header>
    <Toast.Body className='text-white fw-bold'>{message}</Toast.Body>
  </Toast>
  </ToastContainer>
);

export default ToastNotification;
