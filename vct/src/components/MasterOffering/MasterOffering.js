import React, { useState, Fragment } from 'react';
import './masterOffering.css';
import Select from 'react-select';
import { makeStyles } from '@material-ui/core/styles';
import industryValues from './IndustryValues';
import MasterCheckConfirmation from './MasterCheckConfirmation.js';
import S3BucketUpload from '../../containers/S3BucketUpload/S3BucketUpload';
import ProjectUser from '../../components/ProjectUser/ProjectUser';
import CustomConfirmModal from '../../components/CustomConfirmModal/CustomConfirmModal';
var SessionStorage = require('store/storages/sessionStorage');

const defaultStyle = {
  control: (base) => ({
    ...base, color: 'rgba(255, 255, 255, 0.8)',
    borderRadius: '2px', textAlign: 'left', backgroundColor: '#5A5A5A',
    borderColor: 'rgba(255, 255, 255, 0.8)', minHeight: '32px',
    fontSize: '12px', '&:hover': { borderColor: 'rgba(255, 255, 255, 0.8)' }
  }),
  indicatorSeparator: (base) => ({ ...base, display: 'none' }),

  menuList: provided => ({
    ...provided,
    height: '80px',
    backgroundColor: "#5A5A5A",
    // width:"320px",
    border: "1px solid #F0F0F0",
    borderTop: "none"
  }),
  menu: (base) => ({
    ...base, fontSize: '12px', marginTop: 0, borderRadius: '2px',
    paddingTop: 0, paddingBottom: 0,
  }),
  indicatorsContainer: (base) => ({ ...base, padding: 0 }),
  menuList: (base) => ({
    ...base, padding: 0, color: 'rgba(255, 255, 255, 0.8)', textAlign: 'left',
    height: '120px', backgroundColor: '#5A5A5A', border: '1px solid rgba(255, 255, 255, 0.8)',
  }),
  dropdownIndicator: (base) => ({ ...base, padding: 0, paddingRight: '2px', color: 'rgba(255, 255, 255, 0.8)', '&:hover': { color: '#fff' }, '& svg': { width: 14, height: 14 } }),

  indicatorSeparator: () => ({
    border: null
  }),
  option: (base) => ({ ...base, padding: 0, paddingTop: '2px' }),
  placeholder: (base) => ({ ...base, color: 'rgba(255, 255, 255, 0.8)' }),
  singleValue: (base) => ({ ...base, color: 'rgba(255, 255, 255, 0.8)' }),

  container: () => ({
    width: "320px",
  }),


};


const useStyles = makeStyles({
  root: {
    background: 'gray',
    borderRadius: 3,
    border: 0,
    color: 'white',
    height: 30,
    padding: '0 30px',
    marginRight: '30px',
  },
  label: {
    textTransform: 'capitalize',
  },
  actions: {
    marginLeft: '30px',
    justifyContent: 'center',
  },
  contentText: {
    color: 'black',
  },
});

const MasterOffering = (props) => {
  const [size, setSize] = useState(0);
  const option = SessionStorage.read('option_selected');
  const { projectUsers, userDetails, eId, accessType } = props;
  return (

    <Fragment>
      <div id="masterOffering" className="master-Offering-Main">
        <div className="page-header-row" className="title-row">
          <div className="col-sm-12" style={{ left: '14px' }}>
            <label className="page-header-label">{props.newOffering ? "Create Master Offering" : "Update Master Offering"}</label>
          </div>
          <div style={{
            position: "absolute",
            width: "1120px",
            borderBottom: "1px solid rgba(255, 255, 255, 0.5)", top: "200px", left: "105px"
          }}></div>
          {/* <div>
   <img src={closeIco} alt="Close" id="OfferingClose" 
   onClick={props.onClose} className="close-icon-style"
   data-tip="" data-for="cancel_tooltip"/>
   <ReactTooltip id="cancel_tooltip" className="tooltip-class">
      <span>Cancel</span>
   </ReactTooltip> 
   </div> */}
        </div>
        <div className="col-sm-12" style={{ display: "flex", marginTop: "15px" }}>
          <div className="col-sm-5">
            <div className="masterOffering">
              <div className="OfferingLabel" >
                <label > Offering Name *</label>

              </div>

              <input
                placeholder="Offering Name"
                type="text"
                placeholder="Offering name"
                value={props.masterOfferingData.offeringName}
                id="offeringName"
                maxLength="100"
                disabled={
                  props.masterOfferingData.masterMarked ? (
                    true
                  ) : props.masterOfferingData.loader ? (
                    true
                  ) : (
                        false
                      )
                }
                className="textboxStyle"
                onChange={props.handleFieldChange}
              // onChange={(event) => handleChange(event, value)}
              />
              <span style={{ color: '#ffffff' }}><small>{props.offeringNameError}</small></span>

            </div>
            <div className="masterOffering">
              <div className="OfferingLabel" >
                Owner Name *
   </div>

              <input
                placeholder="Owner Name"
                type="text"
                placeholder="Owner name"
                className="textboxStyle"
                id="owner"
                maxLength="100"
                disabled={
                  props.masterOfferingData.masterMarked ? (
                    true
                  ) : props.masterOfferingData.loader ? (
                    true
                  ) : (
                        false
                      )
                }
                value={props.masterOfferingData.ownerName}
                onChange={props.handleFieldChange}
              />
              <span style={{ color: '#ffffff' }}><small>{props.ownerNameError}</small></span>

            </div>
            <div className="masterOffering">
              <div className="OfferingLabel" >Select Industry *
   </div>

              <Select
                theme={theme => ({
                  ...theme,
                  colors: {
                    ...theme.colors,
                    primary25: '#004DFF',
                    primary: '#00BAFF',
                    primary50: '#004DFF'
                  },


                })}

                size={1}
                id="selectIndustryDropdown"
                value={props.masterOfferingData.industrySelected}
                onChange={props.handleOptionChange}
                options={
                  industryValues && industryValues.constructor === Array ? (
                    industryValues
                  ) : (
                      []
                    )
                }
                styles={defaultStyle}
                className={
                  props.masterOfferingData.masterMarked ? (
                    'master-dropdown-disabled'
                  ) : props.masterOfferingData.loader ? (
                    'master-dropdown-disabled'
                  ) : (
                        'master-dropdown'
                      )
                }
                isDisabled={
                  props.masterOfferingData.masterMarked ? (
                    true
                  ) : props.masterOfferingData.loader ? (
                    true
                  ) : (
                        false
                      )
                }
                placeholder="Select Industry"
              />

            </div>
            <div className="masterOffering" style={{ marginTop: '45px' }}>
              <div className="OfferingLabel" >Description *
   </div>

              {/* <textarea
      type="text"
      className="textAreaStyle"
      id="description"
      maxLength="200"
      disabled={
      props.masterOfferingData.masterMarked ? (
      true
      ) : props.masterOfferingData.loader ? (
      true
      ) : (
      false
      )
      }
      value={props.masterOfferingData.description}
      onChange={props.handleFieldChange}
      />
      <span style={{color:'#ffffff'}}><small>{props.descriptionError}</small></span>
      <div className="offering-labelChar"> 400 character(s)</div> */}


              <textarea
                type="text"
                maxLength="250"
                rows="4"
                className="textAreaStyle"
                style={{ resize: "none" }}
                id="description"
                placeholder={
                  option === 'delivery'
                    ? 'Write a short description of your project (max 250 Characters)'
                    : 'Write a short description of your deal (max 250 Characters)'
                }
                disabled={
                  props.masterOfferingData.masterMarked ? (
                    true
                  ) : props.masterOfferingData.loader ? (
                    true
                  ) : (
                        false
                      )
                }
                onChange={props.handleFieldChange}
                required
                value={props.masterOfferingData.description}
              /><span style={{ color: '#ffffff' }}><small>{props.descriptionError}</small></span>
              <div className="offering-labelChar"> {props.masterOfferingData.description.length} / 250 character(s)</div>
              {/* <label className="subText"></label>    */}







            </div>
            <div className="masterOffering">
              <input
                type="checkbox"
                onChange={props.handleMasterCheck}
                disabled={props.newOffering || SessionStorage.read('userType') === 'O' || SessionStorage.read('userType') === 'C' || SessionStorage.read('userType') === 'IL'}
                checked={props.masterOfferingData.masterMarked}
              />
              <label className="OfferingLabel" style={{ paddingLeft: '10px' }}>Mark as Master Offering</label>
            </div>
            {/* <div className="row master-row save-icon-position"  style={{marginLeft:'65px',marginTop:'5px'}}> */}
            <div className="masterOffering" style={{ marginTop: '2px' }}>
              <div className="cr-de-btn-div" style={{ paddingLeft: '0px' }}  >
                <button alt="saveIconAlt"
                  disabled={
                    // !props.newOffering && 
                    (SessionStorage.read('accessType') === 'Read' || props.masterOfferingData.loader)}
                  className="btn btn-primary"
                  // data-tip={getTooltip('Save')}
                  data-for="saveIconToolTip"
                  style={{
                    cursor: props.masterOfferingData.loader ? 'wait' : 'pointer',
                     width: '90px', marginleft: '-30px', color: '#ffffff'
                     
                  }}
                  onClick={props.saveMasterOffering}>{props.newOffering ? (props.masterOfferingData.loader?"Saving...":"Save") : "Update"}</button>
                {/* <ReactTooltip html={true} id="saveIconToolTip" place="top" /> */}
                {/* 
      <div className="save-text"><span>save</span></div>
      */}
              </div>
            </div>
            <div id="masterModal">
              <MasterCheckConfirmation
                open={props.open}
                handleClose={props.handleClose}
              />
            </div>
          </div>
          <div className="col-sm-7" style={{ marginTop: "20px" }}>
            {/* <div className="col-sm-8" style={{ paddingLeft: "0px" }}> */}
            <div style={{ marginLeft: "10px" }}><S3BucketUpload
              fileName={props.file}
              addFileToS3={props.addFileToS3}
              resetFile={props.resetFile}
              displayFile={props.displayFile}
              onChange={props.onChange}
              masterMarked={props.masterOfferingData.masterMarked}
              loader={props.masterOfferingData.loader}
            /></div>

            <ProjectUser
              page='masterOffering'
              projectUsers={projectUsers}
              eId={eId}
              accessType={accessType}
              userDetails={userDetails}
              addUserHandler={props.addUserHandler}
              deleteUserHandler={props.deleteUserHandler}
              onUserEmailChangeHandler={props.onUserEmailChangeHandler}
              onUserAccessChangeHandler={props.onUserAccessChangeHandler}
              emailSelected={props.email}
              masterMarked={props.masterOfferingData.masterMarked}
              loader={props.masterOfferingData.loader}
              enableAddButton={props.enableAddButton}
            />
            <CustomConfirmModal
              ownClassName={props.ownClassName}
              isModalVisible={props.userDeleteModalVisible}
              modalTitle={props.userDeleteModalTitle}
              closeConfirmModal={props.closeConfirmModal}
            />
            <CustomConfirmModal
              ownClassName={'user-access-delete'}
              isModalVisible={props.userAccessModalVisible}
              modalTitle={props.userAccessModalTitle}
              closeConfirmModal={props.closeUserAccessModal}
            />

          </div>
        </div>
      </div>
    </Fragment>
  );
};

export default MasterOffering;
