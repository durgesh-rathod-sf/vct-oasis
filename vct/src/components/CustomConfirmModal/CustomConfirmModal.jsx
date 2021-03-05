import React, { useRef, useEffect } from 'react';
import Modal from 'react-bootstrap4-modal';
import './CustomConfirmModal.css';
 
const CustomConfirmModal = (props) => {
 
  const handleKeyDown = (e, type) => {
    if (e.key === 'Escape') {
 
      props.closeConfirmModal(false);
 
    }
    if (e.key === 'Enter') {
      switch (type) {
        case 'Yes':
          props.closeConfirmModal(true);
          break;
        case 'No':
 
          props.closeConfirmModal(false);
 
          break;
        default:
          break;
      }
    }
  }
 
  const handleCancel = () => {
 
    props.closeConfirmModal(false);
 
  }
  const handleConfirm = () => {
 
    props.closeConfirmModal(true);
  }
  return (
    <div className="confirm-modal-wrapper">
      <Modal
 
        id="custom_confirm_box" className={`confirm-modal-main ${props.ownClassName}`} visible={props.isModalVisible}>
        <div className="modal-header">
 
          {props.modalTitle.includes("br_br_br") ?
            <h6 className="modal-title mx-auto md-block">
              {props.modalTitle.split("br_br_br")[0]} <br /> {props.modalTitle.split("br_br_br")[1]}
            </h6>
            :
            <h6 className="modal-title mx-auto md-block">
              {props.modalTitle}
            </h6>
          }
 
          {/* <button type="button" onClick={props.modalCloseHandler} className="close" data-dismiss="modal" style={{ color: '#ffffff', opacity: '1' }} >&times;</button> */}
        </div>
        <div className="modal-body">
          <div className="">
            <button
 
              autoFocus={true}
 
              type="button"
              className="btn btn-light yes-button"
              onKeyPress={(e) => { handleKeyDown(e, 'Yes') }}
              onClick={handleConfirm}
            >Yes</button>
 
            <button
              type="button"
 
              className="btn btn-light no-button"
              onClick={handleCancel}
              onKeyPress={(e) => { handleKeyDown(e, 'No') }}
            >No</button>
          </div>
        </div>
      </Modal>
    </div>
 
  );
}
 
export default CustomConfirmModal;