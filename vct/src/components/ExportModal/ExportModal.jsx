import React from 'react';
import Modal from 'react-bootstrap4-modal';
import './ExportModal.css';
import closeIcon from '../../assets/project/fvdt/modal-close-icon.svg';
import ReactTooltip from 'react-tooltip';

const ExportModal = (props) => {    
    return(
        <Modal id="exportScreen" visible={props.visible}>
        <div className="modal-header-flex" style={{borderBottom: '0px', backgroundColor: '#3e3e3e', color: '#ffffff'}}>            
            <h6 className="modal-title mx-auto md-block">EXPORT VALUE DRIVERS</h6>  

            <img src={closeIcon} alt="" onClick={props.modalCloseHandler} data-dismiss="modal" style={{cursor: 'pointer'}} 
             data-tip
             data-for="fvdt-close-tooltip"
             data-place="right"/>
              <ReactTooltip id="fvdt-close-tooltip" className="tooltip-class">
                  <span>Close</span>
                </ReactTooltip> 
        </div>
        <div className="modal-body" style={{ backgroundColor: '#3e3e3e', color: '#ffffff'}}>
          <p>Download your file in the desired format!</p>
          
          <div className="row">
            <div className="col-6">
            <div className="text-right">
                    <button 
                        type="button" 
                        className="btn btn-primary" 
                        style={{}}
                        onClick={props.generateXlsHandler}
                    > 
                        <i className="fa fa-file-excel-o" style={{color: '#fff'}}></i> Download as Excel {" "}
                        {props.exportXlsBtnModal && <i className="fa fa-spinner fa-spin" style={{color: '#ffffff'}}></i>}
                    </button>                
                </div>    
            </div>
            <div className="col-6" >                
                <button 
                    type="button" 
                    className="btn btn-primary" 
                    style={{}}
                    onClick={props.generatePPTHandler}
                > 
                    <i className="fa fa-file-powerpoint-o" style={{color: '#fff'}}></i> Download as PPT {" "}
                    {props.exportPPTBtnModal && <i className="fa fa-spinner fa-spin" style={{color: '#ffffff'}}></i>}
                </button>                                  
            </div>
          </div>
        </div>        
      </Modal>
    );
}

export default ExportModal;