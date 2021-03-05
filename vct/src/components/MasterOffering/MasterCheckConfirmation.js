import React from 'react';
import Modal from 'react-bootstrap4-modal';
import './masterOffering.css'

const MasterCheckConfirmation = (props) => {
    return (
        <Modal id="masterContainer" visible={props.open}>
        <div className="modal-header master-header">
                <h6 className="modal-title mx-auto md-block">Are you sure you want to ummark this offering?</h6>
            </div>
            <div className="modal-body master-modal-body">
                <div className="master-flex">
                    <div style={{marginLeft: '3%'}}>
                        <button
                            type="button"
                            id="no"
                            className="btn btn-light no-master-button"
                            onClick={props.handleClose}
                        >
                            No
                            </button>
                    </div>
                    <div>
                        <button
                            type="button"
                            id="yes"
                            className="btn btn-light yes-master-button"
                            onClick={props.handleClose}
                        >
                            Yes
                            </button>
                    </div>
                </div>
            </div>
        </Modal>
    );
}

export default MasterCheckConfirmation;