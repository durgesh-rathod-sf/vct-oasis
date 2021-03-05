import React from 'react';
import './AddClientMaster.css';
import saveIcon from "../../../assets/project/workstream/saveIcon.png";
import ReactTooltip from 'react-tooltip';
import closeIco from "../../../assets/valueDrivers/times-solid.svg";

const AddClientMaster = (props) => {
    const getTooltip = (value) => {
        return `${value}`;
    }
    const handleKeyDown = (e, type) => {
        if (e.key === 'Enter') {
            switch (type) {            
                case 'close':
                    props.redirectHandler('adminpanel');
                    break;
                case 'save':
                    if (!props.loader) {
                        props.saveAccount(e);
                    }                   
                    break;
                default:
                    break;
            }            
        }
    }
    return (
        <div className='add-account-container' id="addClentMaster">
            <div className='inputForm'>
                <div className='row inputRow'>
                    <div className='col-sm-12'>
                        <h6 className='lblAccount'>Account *</h6>
                    </div>
                    <div className='col-sm-9'>
                        <input type="text" className='inputVDT'
                            disabled={props.loader}
                            value={props.accountName}
                            tabIndex="1"
                            id='account_name'
                            maxLength="50"
                            onChange={(event) => props.onAccountInputChange(event)}
                            onKeyDown={(e) => {handleKeyDown(e, 'save')}}
                        /><br/>
						<span style={{color:'#ffffff'}}><small>{props.accountNameError}</small></span>
                    </div>
                    <div className='col-sm-9 buttondiv'>
                    <div className="cr-de-btn-div" style={{paddingLeft:'0px'}}  >
      {props.isSaveLoading ? 
       <button   alt="save Objectives"
       disabled
       className="btn btn-primary"
       data-for="saveIconToolTip"
      
       >Saving
       <i className="fa fa-spinner fa-spin" style={{ color: '#ffffff',marginLeft:"8px" }}></i>
      </button> 
       :
       <button   alt="save Objectives"
      disabled={props.accountName === "" ? true : false }
      className="btn btn-primary"
    //   data-tip={getTooltip('Save')}
      data-for="saveIconToolTip"
      style={{ cursor: props.loader ? 'wait' : 'pointer'}}
      onClick={props.saveAccount } 
    //   data-tip={getTooltip("Save")}
      onKeyDown={(e) => {handleKeyDown(e, 'save')}}>Save</button>
    }
       
      {/* <ReactTooltip html={true} id="saveIconToolTip" place="top" /> */}
      {/* 
      <div className="save-text"><span>save</span></div>
      */}
   </div>
                    </div>
                 
                </div>                
            </div>

        

        </div >
    );
}

export default AddClientMaster;