import React from 'react';
// import { NavLink } from "react-router-dom";
import Modal from 'react-bootstrap4-modal';
import '../ExportModal/ExportModal.css';

const ManuallyExportModel = (props) => {    
    return(
        <Modal visible={props.visible}>
        <div className="modal-header-flex" style={{ borderBottom: '0px', backgroundColor: '#404040', color: '#ffffff'}}>            
            <h6 className="modal-title mx-auto md-block">DOWNLOAD VALUE DRIVER</h6>          
            <button type="button" onClick={props.modalCloseHandler} className="close" data-dismiss="modal" style={{color: '#ffffff', opacity: '1'}} >&times;</button>
        </div>
        <div className="modal-body" style={{ backgroundColor: '#404040', color: '#ffffff'}}>
          <p>Download your file in the desired format!</p>
  
          <div className="row">
            <div className="col-6">
            <div className="text-right">
                    <button 
                        type="button" 
                        className="btn btn-light" 
                        style={{fontWeight: '600'}}
                        onClick={props.generateXlsHandler}
                    > 
                        <i className="fa fa-file-excel-o" style={{color: '#107C41'}}></i> Download as Excel
                    </button>                
                </div>    
            </div>
            <div className="col-6" >                
                <button 
                    type="button" 
                    className="btn btn-light" 
                    style={{fontWeight: '600'}}
                    onClick={props.generatePPTHandler}
                > 
                    <i className="fa fa-file-powerpoint-o" style={{color: '#107C41'}}></i> Download as PPT
                </button>                                  
            </div>
          </div>
        </div>        
      </Modal>
    );
}

export default ManuallyExportModel;