import React from 'react';
import Modal from 'react-bootstrap4-modal';
import './NewProject.css';

const ExportModal = (props) => {    
    // console.log(props.error);
    return(
        <Modal id="convert" visible={props.visible}>
        
        <div className="modal-body" style={{ backgroundColor: '#404040', color: '#ffffff',borderRadius:'10px'}}>
    <p style={{marginBottom:"0px"}}>
        {props.error}
        {/* Deal Name already exsists */}
        </p>
          {/* <p>Do you want to: </p> */}
          <p> Do you want to: </p>
          <div className="row" style={{marginTop:"15px"}} >
            <div className="col-6">
            <div className="text-right">
                    <button 
                        type="button" 
                        disabled={props.replaceLoader}
                        className="btn btn-light modalStyle" 
                   
                        onClick={props.onReplaceClick}
                    > 
                        Replace Existing Project
                      </button>                
                </div>    
            </div>
            <div className="col-6" >                
                <button 
                    type="button" 
                    disabled={props.renameLoader}
                    className="btn btn-light modalStyle" 
             
                    onClick={props.onRenameClick}
                > Create Duplicate Project
               </button>                                  
            </div>

            <div className="col-12" >                
                <button 
                    type="button" 
                
                    className="btn btn-light modalStyle" 
                    style={{marginTop:"15px"}}
                    onClick={props.onCancelClick}
                > Cancel
               </button>                                  
            </div>
          </div>
        </div>        
      </Modal>
    );
}

export default ExportModal;