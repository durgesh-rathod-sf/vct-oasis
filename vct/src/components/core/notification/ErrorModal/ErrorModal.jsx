import React from 'react';
import Modal from 'react-bootstrap4-modal';
//import CrossIcon from '../../../../assets/newDealsIcons/cross.svg';
import { ReactComponent as CrossIcon } from '../../../../assets/newDealsIcons/cross.svg';
import { ReactComponent as OkIcon } from '../../../../assets/icons/done.svg';
import './ErrorModal.scss';

const ErrorModal = (props) => {
  return NotificationModal({ error: true, ...props })
}
const SuccessModal = (props) => {
  return NotificationModal({ success: true, ...props })
}


const NotificationModal = (props) => {

  const handleKeyDown = (e) => {
    if (e.key === 'Escape' || e.key === 'Enter') {
      props.closeModal(true);
    }
  }
  const handleConfirm = () => {
    props.closeModal(true);
  }
  return (
    <div className="error-modal-wrapper">
      <Modal className={`error-modal-main ${props.ownClassName}`} visible={props.isModalVisible}>
        <div className="modal-header">
          {/* <img src={CrossIcon} alt="error" /> */}
          {props.error && < CrossIcon className="errIcon" />}
          {props.success && < OkIcon className="okIcon" />}
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
            <button autoFocus={true}
              type="button"
              className="btn btn-light yes-button"
              onKeyPress={(e) => { handleKeyDown(e) }}
              onClick={handleConfirm}
            >Ok</button>

          </div>
        </div>
      </Modal>
    </div>

  );
}

export { SuccessModal, ErrorModal };
