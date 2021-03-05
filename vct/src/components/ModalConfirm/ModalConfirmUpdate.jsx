import React from 'react';
import { NavLink } from "react-router-dom";
import { routes } from '../../constants';
import Modal from 'react-bootstrap4-modal';
import './ModalConfirm.css';

const ExportModal = (props) => {    
    return(
        <Modal id="confirm" visible={props.visible}>
        {/* <div className="modal-header-flex" style={{borderBottom: '0px', backgroundColor: '#404040', color: '#ffffff'}}>            
            <h6 className="modal-title mx-auto md-block">DOWNLOAD VALUE DRIVERS</h6>          
            <button type="button" onClick={props.modalCloseHandler} className="close" data-dismiss="modal" style={{color: '#ffffff', opacity: '1'}} >&times;</button>
        </div> */}
        <div className="modal-body" style={{ backgroundColor: '#404040', color: '#ffffff'}}>
    <p>{props.error} {". "}</p>
          <p>Do you want to replace the file</p>
          
          <div className="row">
            <div className="col-6">
            <div className="text-right">
                    <button 
                        type="button" 
                        id="Yes"
                        className="btn btn-light" 
                        style={{fontWeight: '600'}}
                        onClick={props.uploadModifyRowsHandler_withFlag}
                    > 
                        {/* <i className="fa fa-file-excel-o" style={{color: '#107C41'}}></i> */}
                         Yes {" "}
                        {/* {props.exportXlsBtnModal && <i className="fa fa-spinner fa-spin" style={{color: '#ffffff'}}></i>} */}
                    </button>                
                </div>    
            </div>
            <div className="col-6" >                
                <button 
                    type="button" 
                    id="No"
                    className="btn btn-light" 
                    style={{fontWeight: '600'}}
                    onClick={props.uploadModifyRowsHandler_withFlag}
                > 
                    {/* <i className="fa fa-file-powerpoint-o" style={{color: '#107C41'}}></i> */}
                     No {" "}
                    {/* {props.exportPPTBtnModal && <i className="fa fa-spinner fa-spin" style={{color: '#ffffff'}}></i>} */}
                </button>                                  
            </div>
          </div>
        </div>        
      </Modal>
    );
}

export default ExportModal;