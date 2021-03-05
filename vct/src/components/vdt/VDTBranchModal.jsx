import React, { Fragment, useRef, useState } from 'react';
import Modal from 'react-bootstrap4-modal';
import closeIcon from '../../assets/project/fvdt/modal-close-icon.svg';
import * as _ from "lodash";
import DeleteModal from "../DeleteModal/DeleteModal";
import ReactTooltip from 'react-tooltip';
var SessionStorage = require('store/storages/sessionStorage');

const VDTBranchModal = (props) => {

  let branch_names = [];
  let branch_title = '';
  let branch_categorys = [];
  let branch_boCategorys = [];

  const [branchDetails, setBranchDetails] = useState(props.branchDetails);
  const [modalVisible, setModalVisible] = useState(false);
  const [catValue, setCatValue] = useState("");
  const [subCatValue, setSubCatValue] = useState("");
  const categoryRef = useRef(null);



  const isEmpty = (value) => {
    return (!value || 0 === value.length || !value.trim());
  }
  const getSaveDisabledState = (level) => {
    switch (level) {
      case 0:
        return (branchDetails.label && branchDetails.label.trim() === "") || (branchDetails.objectiveNameErr && branchDetails.objectiveNameErr !== '');
      case 1:
        return (branchDetails.label && branchDetails.label.trim() === "") || (branchDetails.customError && branchDetails.customError !== '') || (branchDetails.objectiveNameErr && branchDetails.objectiveNameErr !== '') || branchDetails.category[0].objCategory === "" || (props.branchDetails.category[0].objType === "NON_FINANCIAL" && branchDetails.category[0].objCategory === "CUSTOM" && (isEmpty(branchDetails.category[0].objCustomCatValue)));
      case 2:
        return (branchDetails.label && branchDetails.label.trim() === "") || (branchDetails.customError && branchDetails.customError !== '') || (branchDetails.objectiveNameErr && branchDetails.objectiveNameErr !== '') || branchDetails.category[0].objSubCategory === "" || (props.branchDetails.category[0].objType === "NON_FINANCIAL" && branchDetails.category[0].objSubCategory === "CUSTOM" && (isEmpty(branchDetails.category[0].objCustomSubCatValue)));
      case 3:
        return (branchDetails.label && branchDetails.label.trim() === "") || (branchDetails.objectiveNameErr && branchDetails.objectiveNameErr !== '');

      default:
        return (branchDetails.label && branchDetails.label.trim() === "")
    }
  }

  const onChange = function (event, property) {
    let cbranchDetails = JSON.parse(JSON.stringify(branchDetails));
    switch (property) {
      case 'label':
        cbranchDetails.objectiveNameErr = !RegExp(/[<>!'"[\]]/).test(event.target.value) ? "" : 'Please enter valid objective name. Special characters [ < ! \' " > ] are invalid';
        cbranchDetails.label = event.target.value;
        break;
      case 'select':
        if (cbranchDetails.category[0].objCategory === "CUSTOM" && (cbranchDetails.category[0].objCustomCatValue !== "" && cbranchDetails.category[0].objCustomCatValue !== null)) {
          openModalHandler(event.target.value, "select");
        } else {
          cbranchDetails.category[0].objCategory = event.target.value;
        }
        if (props.branchDetails.category[0].objType === "NON_FINANCIAL" && cbranchDetails.children && cbranchDetails.children.length > 0) {
          cbranchDetails.children = cbranchDetails.children.map(child => {
            child.category[0].objCategory = event.target.value;
            child.category[0].objSubCategory = "";
            child.category[0].objCustomSubCatValue = "";
            props.deprecatedNodeId(child.id)
            return child
          })
        }
        branch_boCategorys = props.filterCategories(branch_title, event.target.value);
        break;
      case 'custom_label':
        cbranchDetails.customError = !RegExp(/[<>!'"[\]]/).test(event.target.value) ? "" : 'Please enter valid custom objective name. Special characters [ < ! \' " > ] are invalid';
        cbranchDetails.category[0].objCustomCatValue = event.target.value;
        break;
      case 'select_bo':
        if (cbranchDetails.category[0].objSubCategory === "CUSTOM" && (cbranchDetails.category[0].objCustomSubCatValue !== "" && cbranchDetails.category[0].objCustomSubCatValue !== null)) {
          openModalHandler(event.target.value, "select_bo");
        }
        else
          cbranchDetails.category[0].objSubCategory = event.target.value;
        props.filterNodeId(cbranchDetails.id)
        break;
      case 'custom_bo_label':
        cbranchDetails.category[0].objCustomSubCatValue = event.target.value;
        break;
      default:
        break;
    }
    setBranchDetails(cbranchDetails)

  }

  const openModalHandler = (value, property) => {
    setModalVisible(true);
    switch (property) {
      case "select":
        setCatValue(value);
        break;
      case "select_bo":
        setSubCatValue(value);
        break;
    }
  }

  const modalCloseHandler = () => {
    setModalVisible(false);
    props.deprecatedNodeId("")
  };

  const deleteCustomHandler = () => {
    let cbranchDetails = JSON.parse(JSON.stringify(branchDetails));
    if (cbranchDetails.category[0].objSubCategory === "CUSTOM" && (cbranchDetails.category[0].objCustomSubCatValue !== "" && cbranchDetails.category[0].objCustomSubCatValue !== null)) {
      cbranchDetails.category[0].objCustomSubCatValue = null;
      cbranchDetails.category[0].objSubCategory = subCatValue;
    }
    else {
      cbranchDetails.category[0].objCustomCatValue = null;
      cbranchDetails.category[0].objCategory = catValue;
    }

    setBranchDetails(cbranchDetails)
    setModalVisible(false);
  }

  const setCatOnBlur = function (event, branchDetails) {
    let cbranchDetails = JSON.parse(JSON.stringify(branchDetails));
    switch (cbranchDetails.level) {
      case 1: // financial objectives
        const selectedObjInfo = _.find(branch_names, { genericName: event.target.value });
        if (selectedObjInfo) {
          cbranchDetails.category[0].objCategory = selectedObjInfo.objCatName;
          cbranchDetails.category[0].objCustomCatValue = selectedObjInfo.objCustomCatValue ? cbranchDetails.category[0].objCustomCatValue : ''
        } else {
          cbranchDetails.category[0].objCategory = '';
          cbranchDetails.category[0].objCustomCatValue = '';
        }
        if (props.branchDetails.category[0].objType === "NON_FINANCIAL" && cbranchDetails.children && cbranchDetails.children.length > 0) {
          cbranchDetails.children = cbranchDetails.children.map(child => {
            child.category[0].objCategory = selectedObjInfo && selectedObjInfo.objCatName;
            child.category[0].objSubCategory = "";
            child.category[0].objCustomSubCatValue = "";
            props.deprecatedNodeId(child.id)
            return child
          })
        }
        break;
      case 2: // business objectives
        const selectedBoInfo = _.find(branch_names, { genericName: event.target.value });
        if (selectedBoInfo) {
          cbranchDetails.category[0].objCategory = selectedBoInfo && selectedBoInfo.objCatName;
          cbranchDetails.category[0].objCustomCatValue = selectedBoInfo && selectedBoInfo.objCustomCatValue ? selectedBoInfo.objCustomCatValue : '';
          cbranchDetails.category[0].objSubCategory = selectedBoInfo && selectedBoInfo.objSubCatName;
          cbranchDetails.category[0].objCustomSubCatValue = selectedBoInfo && selectedBoInfo.objCustomSubCatValue ? selectedBoInfo.objCustomSubCatValue : '';
        } else {
          cbranchDetails.category[0].objSubCategory = '';
          cbranchDetails.category[0].objCustomSubCatValue = '';
        }
        break;
      default:
        break;
    }
    setBranchDetails(cbranchDetails)
  }


  // eslint-disable-next-line default-case
  switch (props.branchDetails.level) {
    case 0: branch_title = 'Strategic Objective'; break;
    case 1: if (props.branchDetails.category[0].objType === "NON_FINANCIAL") branch_title = 'Non-Financial Objective';
    else branch_title = 'Financial Objective'; break;
    case 2: branch_title = 'Business Objective'; break;
    case 3: branch_title = 'Value Driver'; break;
  }
  if (props.branchDetails.level === 0) {
    branch_names = props.vdtValues[props.branchDetails.type];
  } else if (props.branchDetails.level === 2) {
    branch_names = props.vdtValues[props.branchDetails.type][props.branchDetails.category[0].objType][props.branchDetails.category[0].objCategory];
  }
  else {
    branch_names = props.vdtValues[props.branchDetails.type][props.branchDetails.category[0].objType];
  }

  branch_categorys = props.filterCategories(branch_title);
  branch_boCategorys = props.filterCategories(branch_title, branchDetails.category[0].objCategory);
  if (!branchDetails) return null;
  return (
    <Modal className="kpiModal1" visible={props.visible} >
      <div className="modal-header-flex" style={{ borderBottom: '0px', color: '#ffffff', marginLeft: "-13px" }}>
        <div className="col-sm-12">
          <div className="title-close-wrapper">
            <div className="modal-title md-block">Enter {branch_title}</div>
            <div className="">
              <img src={closeIcon} alt="Close"
                data-tip="" data-for="close-tooltip"
                data-place="left"
                style={{ cursor: 'pointer' }}
                onClick={props.closeHandler}
              ></img>
              <ReactTooltip id="close-tooltip" className="tooltip-class"> <span>Close</span></ReactTooltip>
            </div>
          </div>

        </div>

      </div>

      <div className="modal-body" style={{ color: '#ffffff' }}>
        {
          <Fragment>
            <div className="form-group row">
              <div className="col-sm-7 no-gutters">
                <div className="col-sm-12 KPI">
                  <label
                    htmlFor="branch_name"
                    style={{ paddingRight: "0px" }}
                  >
                    {branch_title} Name *
                                        </label>
                </div>
                <div className="col-sm-12">
                  <input
                    value={branchDetails.label || ''}
                    id={branch_title}
                    list="branch_names"
                    name="branch_name"
                    ref={categoryRef}
                    maxLength="100"
                    placeholder="Branch Name"
                    type="text"
                    className="form-control"
                    onChange={(event) => onChange(event, "label")}
                    onBlur={(e) => { setCatOnBlur(e, branchDetails) }}

                  />



                  {
                    (branchDetails && branchDetails.objectiveNameErr !== '') &&

                    <span style={{ color: '#ffffff' }}><small>{branchDetails.objectiveNameErr}</small></span>
                  }
                  {(SessionStorage.read("userType") === "EU" && SessionStorage.read("accessType") === "Write") ? "" : <datalist id="branch_names">
                    {branch_names.map(opt => <option key={opt.genericId} value={opt.genericName} />)}
                  </datalist>}


                </div>
                {(props.branchDetails.level == 1) &&
                  <div className="col-sm-12" style={{ paddingTop: "10px" }} >
                    <label>Select Category *</label>
                    <select
                      value={branchDetails.category[0].objCategory ? branchDetails.category[0].objCategory : ""}
                      id="branch_catagory"
                      name="branch_catagory"
                      maxLength="100"
                      placeholder="Category"
                      className="form-control"
                      required
                      onChange={(event) => onChange(event, "select")}
                    >
                      <option value="" defaultValue disabled> Select Category </option>
                      {branch_categorys.map(opt => <option key={opt.objCatName} value={opt.objCatName}>{opt.objCatLabel}</option>)}
                    </select>
                  </div>}
                {(props.branchDetails.level == 1) && (props.branchDetails.category[0].objType === "NON_FINANCIAL") && (branchDetails.category[0].objCategory === "CUSTOM") &&
                  <div className="col-sm-12" style={{ paddingTop: "10px" }}>
                    <label>Custom Objective *</label>
                    <input
                      value={branchDetails.category[0].objCustomCatValue ? branchDetails.category[0].objCustomCatValue : ""}
                      id="custom_name"
                      list="custom_names"
                      name="custom_name"
                      maxLength="100"
                      placeholder="Custom Objective"
                      type="text"
                      className="form-control"
                      onChange={(event) => onChange(event, "custom_label")}
                    />


                    {
                      (branchDetails && branchDetails.customError !== '') &&

                      <span style={{ color: '#ffffff' }}><small>{branchDetails.customError}</small></span>}
                  </div>}
                {(props.branchDetails.level == 2) &&
                  <div className="col-sm-12" style={{ paddingTop: "10px" }} >
                    <label>Select Category *</label>
                    <select
                      value={branchDetails.category[0].objSubCategory ? branchDetails.category[0].objSubCategory : ""}
                      id="branch_bo_catagory"
                      name="branch_bo_catagory"
                      maxLength="100"
                      placeholder="Category"
                      className="form-control"
                      required
                      onChange={(event) => onChange(event, "select_bo")}
                    >
                      <option value="" defaultValue disabled> Select Category </option>
                      {branch_boCategorys.map(opt => <option key={opt.objSubCatName} value={opt.objSubCatName}>{opt.objSubCatLabel}</option>)}
                    </select>
                  </div>}
                {(props.branchDetails.level == 2) && (props.branchDetails.type === "Business Objective") && (branchDetails.category[0].objSubCategory === "CUSTOM") &&
                  <div className="col-sm-12" style={{ paddingTop: "10px" }}>
                    <label>Custom Objective *</label>
                    <input
                      value={branchDetails.category[0].objCustomSubCatValue ? branchDetails.category[0].objCustomSubCatValue : ""}
                      id="sub_custom_name"
                      name="sub_custom_name"
                      maxLength="100"
                      placeholder="Custom Objective"
                      type="text"
                      className="form-control"
                      onChange={(event) => onChange(event, "custom_bo_label")}
                    />
                  </div>}
              </div>
            </div>
            <div className="form-group row">

              <div className="col-sm-4">
                <button
                  className="btn btn-primary"
                  onClick={() => {
                    categoryRef.current.blur();
                    props.saveHandler(branchDetails)
                  }
                  }
                  style={{ width: '50%' }}
                  disabled={getSaveDisabledState(props.branchDetails.level)}
                //disabled ={ branchDetails.label === "" || branchDetails.category[0].objCategory === "" || (props.branchDetails.category[0].objType==="NON_FINANCIAL"  && branchDetails.category[0].objCategory==="CUSTOM" && branchDetails.category[0].objCustomCatValue === "")}
                >
                  Save
                                </button>
              </div>
            </div>

            <DeleteModal
              title="Text entered for the custom will be deleted. Do you want to continue?"
              visible={modalVisible}
              modalCloseHandler={modalCloseHandler}
              deleteProjectHandler={deleteCustomHandler}
            />

          </Fragment>}
      </div>
    </Modal >)
}

export default VDTBranchModal;