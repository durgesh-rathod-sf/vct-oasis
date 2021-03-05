import React from 'react';
import Modal from 'react-bootstrap4-modal';

const DownloadModal = (props) => {    
    return(
        <Modal visible={props.visible}>
        <div className="modal-header" style={{borderBottom: '0px', backgroundColor: '#404040', color: '#ffffff'}}>            
            <h6 className="modal-title mx-auto md-block">Business Case Templates</h6>          
            <button type="button" onClick={props.modalCloseHandler} className="close" data-dismiss="modal" style={{color: '#ffffff', opacity: '1'}} >&times;</button>
        </div>
        <div className="modal-body" style={{ backgroundColor: '#404040', color: '#ffffff'}}>
            <div className="row">
                <div className="col-sm-12">
                    <div className="form-check">
                        <label className="form-check-label">
                            <input type="radio" onChange={props.fileNameChangeHandler} value="customerservice" className="form-check-input" name="optradio" />Customer Service Business Case Template
                        </label>
                    </div>
                    <div className="form-check">
                        <label className="form-check-label">
                            <input type="radio" onChange={props.fileNameChangeHandler} value="networkcost" className="form-check-input" name="optradio" /> Network Cost Reductine Business Case Template
                        </label>
                    </div>
                    <div className="form-check">
                        <label className="form-check-label">
                            <input type="radio" onChange={props.fileNameChangeHandler} value="otherservice" className="form-check-input" name="optradio" /> Other Business Case Template
                        </label>
                    </div>
                </div>
            </div>
          <div className="row">
            <div className="col-12">
            <div className="text-center" style={{margin: '4%'}}>
                    <button 
                        type="button" 
                        className="btn btn-light" 
                        style={{fontWeight: '600'}}
                        onClick={props.downloadTemplate}
                    >
                        Download
                        {props.downloaderBtn && <i className="fa fa-spinner fa-spin" style={{color: '#ffffff'}}></i>}
                    </button>                
                </div>    
            </div>            
          </div>
        </div>        
      </Modal>
    );
}

export default DownloadModal;