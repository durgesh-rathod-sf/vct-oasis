import React, { Fragment, useState } from "react";
import './risksTable.css';
import DatePicker from "react-datepicker";
import saveIcon from "../../assets/project/workstream/saveIcon.png";
import 'moment-timezone';
import Moment from 'moment';
import Modal from 'react-bootstrap4-modal';
import calenderIcon from "../../assets/project/workstream/date.svg";
import add from "../../assets/project/workstream/add.svg";
import trash from "../../assets/admin/trash.svg";
import ReactTooltip from 'react-tooltip';
import vector from "../../assets/project/workstream/Vector.svg";
import "./risksTable.css";
var SessionStorage = require('store/storages/sessionStorage');

const RisksTable = (props) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isModalCLoseDateOpen, setIsModalCloseDateOpen] = useState(false);

  function openModal() {
    setIsModalOpen(true);
    props.setEntryDatesArray();
    var element = document.getElementById("riskContainerTable");
    var element1 = document.getElementById("openDate");
    var rect = element.getBoundingClientRect();
    var rect1 = element1.getBoundingClientRect();
    var modal = document.getElementById('riskModal1');

    modal.style.margin = 0;
    modal.style.top = rect.top + 28 + 'px';
    modal.style.left = rect1.x + 3 + 'px';

  }



  function openCloseDateModal() {
    setIsModalCloseDateOpen(true);
    props.setClosedDatesArray();
    // setClosedDatesArray(closedDatesArray)
    var element = document.getElementById("riskContainerTable");
    var element1 = document.getElementById("closedDate");
    var rect = element.getBoundingClientRect();
    var rect1 = element1.getBoundingClientRect();
    var modal = document.getElementById('riskModal2');
    modal.style.margin = 0;
    modal.style.top = rect.top + 28 + 'px';
    // console.log(rect.left);
    modal.style.left = rect1.x + 3 + 'px';
  }

  function closeModal() {
    setIsModalOpen(false);
    props.closeModal();
  }

  function closeDateModalClose() {
    setIsModalCloseDateOpen(false);
    props.closeModal();
  }

  return (
    <div className="container" id="riskContainerTable" >
      <div className="table-wrap" >
        <div className="table-wrap-div" style={{ overflowX: (props.isExpandBenefits || (props.tableData && !props.tableData.length > 0)) ? 'unset' : 'scroll' }}>
          <table className="responsive-table" style={{ width: ((props.isExpandBenefits || (props.tableData && !props.tableData.length > 0)) ? '' : 'max-content') }}>
            <thead>
              <tr>
                <th className="risks-header" style={{ width: '15%' }}>Category *</th>
                <th className="risks-header" style={{ width: '15%' }}>Description *</th>
                <th className="risks-header" style={{ width: '15%' }}>Mitigation Plan</th>
                <th className="risks-header" style={{ width: '14%' }}>Owner *</th>
                <th id="openDate" className="risks-header" style={{ width: '18%' }}> Open Date *
                <span style={{ float: 'right' }}>
                    <img data-tip=""
                      data-for="openfilter_tooltip"
                      data-place="left" style={{ cursor: 'pointer', color: props.allSelected && props.tableData.length > 0 ? 'black' : 'grey' }}
                      src={vector} onClick={() => openModal()}></img>
                    <ReactTooltip id="openfilter_tooltip" className="tooltip-class">
                      <span>Filter</span>
                    </ReactTooltip>
                    {/* <i className="fa fa-filter" aria-hidden="true"
                  style={{ color: props.allSelected && props.tableData.length>0? 'black' : 'grey' }}
                  onClick={() => openModal()}></i> */}


                  </span>
                  <Modal id="riskModal1" visible={isModalOpen} >
                    <button type="button" onClick={() => closeModal()} className="close" data-dismiss="modal" style={{ color: '#ffffff', opacity: '1', marginLeft: '80%' }} >&times;</button>
                    {props.entryDatesArray.map((entry, key) => (

                      <div className="row" style={{ marginLeft: '8px' }}>
                        <input type="checkbox" id="test7"
                          checked={props.checkedValue === 'select all' ? props.checkedStatus :
                            entry.openDate === props.checkedValue ?
                              entry.checked = props.checkedStatus : entry.checked}
                          onClick={(event) => props.entryDateFilter(event, entry.openDate, key)} />
                        <label for="test">{entry.openDate}</label>
                      </div>
                    ))}
                  </Modal>
                </th>
                <th id="closedDate" className="risks-header" style={{ width: '18%' }}>Closed date {" "}
                  <span style={{ float: 'right' }}>
                    {/* <i className="fa fa-filter" aria-hidden="true" 
                  style={{ color: props.allSelected && props.tableData.length>0? 'black' : 'grey' }}
                  onClick={() => openCloseDateModal()}></i> */}
                    <img
                      data-tip=""
                      data-for="closefilter_tooltip"
                      data-place="left"
                      src={vector}
                      style={{ cursor: 'pointer', color: props.allSelected && props.tableData.length > 0 ? 'black' : 'grey' }}
                      onClick={() => openCloseDateModal()} ></img>
                    <ReactTooltip id="closefilter_tooltip" className="tooltip-class">
                      <span>Filter</span>
                    </ReactTooltip>
                  </span>

                  <Modal id="riskModal2" visible={isModalCLoseDateOpen} >
                    <button type="button" onClick={() => closeDateModalClose()} className="close" data-dismiss="modal" style={{ color: '#ffffff', opacity: '1', marginLeft: '80%' }} >&times;</button>
                    {props.closedDatesArray.map((entry, key) => (
                      <div className="row" style={{ marginLeft: '8px' }}>
                        <input type="checkbox" id="test7"
                          checked={props.checkedValue === 'select all' ? props.checkedStatus :
                            entry.closedDate === props.checkedValue ?
                              entry.checked = props.checkedStatus : entry.checked}
                          onClick={(event) => props.closedDateFilter(event, entry.closedDate, key)} />
                        <label for="test">{entry.closedDate}</label>
                      </div>
                    ))}
                  </Modal>
                </th>
              </tr>
            </thead>
            <tbody>
              {props.tableData.map(function (entry, key) {
                return (
                  entry.display ?
                    <tr key={`risksRow${key}`} style={{ backgroundColor: "#555555", border: "0px" }}>
                      <td
                        className="risks-cell type-select-td"
                        key={`risktd1${key}`}
                        data-label={entry.catType}
                        style={{
                          backgroundColor: '#4D4D4D',
                          color: (entry.closedDate === undefined || entry.closedDate === "") && props.selectedLevel === 'Deliverable' ? '#ffffff' : '#ffffff80'
                        }}>
                        {(entry.closedDate === undefined || entry.closedDate === "") && props.selectedLevel === 'Deliverable' ?
                          <select
                            style={{
                              marginTop: "8px",
                              color: ((entry.closedDate === undefined || entry.closedDate === "") && props.selectedLevel === 'Deliverable' ? '#ffffff' : '#ffffff80')
                            }}
                            value={entry.catType}
                            onChange={(event) => props.onRiskDetailsChange(event, 'catType', key)}
                          // style={{ border: 'none' }}
                          >
                            <option disabled selected value="">Select </option>
                            <option value="Risk">Risk </option>
                            <option value="Issue">Issue </option>
                            <option value="Dependency">Dependency </option>
                          </select> :
                          <div style={{ height: "25px", marginTop: "8px" }}>{entry.catType} </div>
                        }
                      </td>
                      <td
                        className="risks-cell"
                        key={`risktd2${key}`}
                        data-label={entry.description}
                        style={{
                          width: '20%',
                          backgroundColor: '#4D4D4D'
                          // (entry.closedDate === undefined || entry.closedDate === "") && props.selectedLevel === 'Deliverable' ? '#4D4D4D' : '#d3d3d33d'
                        }}>
                        {(entry.closedDate === undefined || entry.closedDate === "") && props.selectedLevel === 'Deliverable' ?
                          <textarea
                            className="inputCell"
                            placeholder="Description"
                            value={entry.description}
                            style={{
                              color: (entry.closedDate === undefined || entry.closedDate === "") && props.selectedLevel === 'Deliverable' ? '#ffffff' : '#ffffff80'
                            }}
                            onChange={(event) => props.onRiskDetailsChange(event, 'description', key)}>
                          </textarea> :
                          <textarea disabled={true} className='disabledCell' value={entry.description}
                            placeholder="Description"
                            style={{
                              color: (entry.closedDate === undefined || entry.closedDate === "") && props.selectedLevel === 'Deliverable' ? '#ffffff' : '#ffffff80'
                            }}
                          >
                          </textarea>}
                      </td>
                      <td
                        className="risks-cell"
                        key={`risktd3${key}`}
                        data-label={entry.mitigationPlan}
                        style={{
                          backgroundColor: '#4D4D4D'
                          //  (entry.closedDate === undefined || entry.closedDate === "") && props.selectedLevel === 'Deliverable' ? '#4D4D4D' : '#d3d3d33d' 
                        }}>
                        {(entry.closedDate === undefined || entry.closedDate === "") && props.selectedLevel === 'Deliverable' ?
                          <textarea
                            className="inputCell"
                            value={entry.mitigationPlan}
                            placeholder="Mitigation Plan"
                            style={{
                              color: (entry.closedDate === undefined || entry.closedDate === "") && props.selectedLevel === 'Deliverable' ? '#ffffff' : '#ffffff80'
                            }}
                            onChange={(event) => props.onRiskDetailsChange(event, 'mitigationPlan', key)}>
                          </textarea > :
                          <textarea disabled={true} className='disabledCell' placeholder="Mitigation Plan" value={entry.mitigationPlan}
                            style={{
                              color: (entry.closedDate === undefined || entry.closedDate === "") && props.selectedLevel === 'Deliverable' ? '#ffffff' : '#ffffff80'
                            }}
                          >
                          </textarea>}
                      </td>
                      <td
                        className="risks-cell"
                        key={`risktd4${key}`}
                        data-label={entry.owner}
                        style={{
                          backgroundColor: '#4D4D4D'
                          //  (entry.closedDate === undefined || entry.closedDate === "") && props.selectedLevel === 'Deliverable' ? '#4D4D4D' : '#d3d3d33d'
                        }}>
                        {(entry.closedDate === undefined || entry.closedDate === "") && props.selectedLevel === 'Deliverable' ?
                          <textarea
                            value={entry.owner}
                            className="inputCell"
                            placeholder="Owner"
                            style={{
                              color: (entry.closedDate === undefined || entry.closedDate === "") && props.selectedLevel === 'Deliverable' ? '#ffffff' : '#ffffff80'
                            }}
                            onChange={(event) => props.onRiskDetailsChange(event, 'owner', key)}>
                          </textarea> :
                          <textarea disabled={true}
                            placeholder="Owner"
                            className='disabledCell' value={entry.owner}
                            style={{
                              color: (entry.closedDate === undefined || entry.closedDate === "") && props.selectedLevel === 'Deliverable' ? '#ffffff' : '#ffffff80'
                            }}
                          ></textarea>}
                      </td>
                      <td
                        className="risks-cell start-date-td"
                        key={`risktd5${key}`}
                        data-label={entry.openDate}
                        style={{
                          backgroundColor: '#4D4D4D',
                          //  (entry.closedDate === undefined || entry.closedDate === "") && props.selectedLevel === 'Deliverable' ? '#4D4D4D' : '#d3d3d33d' 
                          padding: "8px 4px"
                        }}>
                        {(entry.closedDate === undefined || entry.closedDate === "") && props.selectedLevel === 'Deliverable' ?
                          <div className="row dateDiv">
                            <div className="col-sm-10 centerAlign">
                              <DatePicker
                                value={entry.openDate !== "" ? Moment(entry.openDate).format('DD-MMM-YYYY') : ""}
                                // selected={entry.openDate}
                                placeholderText="dd-mmm-yyyy"
                                onChange={(event) => props.onRiskDetailsChange(event, 'openDate', key)}
                                // dateFormat="dd/MMM/yyyy"
                                showMonthDropdown
                                showYearDropdown
                                useShortMonthInDropdown
                                fixedHeight
                                className="form-control date-Input"
                                required={true}
                                style={{ zIndex: '122323' }}
                              />
                            </div>
                            <div
                              className="col-sm-2 calender-div-Icon">
                              <img src={calenderIcon} alt="calender" className="calenderImg" />
                            </div>
                          </div> :
                          <div className="row">
                            <div className="col-sm-10 centerAlign" style={{ color: "#ffffff80" }}>
                              {Moment(entry.openDate).format('DD-MMM-YYYY')}
                            </div>
                            <div
                              className="col-sm-2 calender-div-Icon" >
                              <img src={calenderIcon} alt="calender" className="calenderImg" />
                            </div>
                          </div>

                        }

                      </td>
                      <td
                        className="risks-cell close-date-td"
                        key={`risktd6${key}`}
                        data-label={entry.closedDate}
                        style={{
                          backgroundColor: '#4D4D4D'
                          // (entry.closedDate === undefined || entry.closedDate === "") && props.selectedLevel === 'Deliverable' ? '#4D4D4D' : '#d3d3d33d'
                        }}>
                        {(entry.closedDate === undefined || entry.closedDate === "") && props.selectedLevel === 'Deliverable' ?
                          <div className="dateDiv close-date">
                            <div className="col-sm-10 centerAlign">
                              <DatePicker
                                value={""}
                                // selected={entry.closedDate }
                                closeOnScroll={false}
                                placeholderText="dd-mmm-yyyy"
                                minDate={entry.openDate !== "" ? new Date(entry.openDate) : ""}
                                maxDate={new Date()}
                                onChange={(event) => props.onRiskDetailsChange(event, 'closedDate', key)}
                                dateFormat="dd-MMM-yyyy"
                                showMonthDropdown
                                showYearDropdown
                                fixedHeight
                                useShortMonthInDropdown
                                className="form-control date-Input"
                                required={true}

                                style={{ zIndex: '122323' }}
                                popperModifiers={{
                                  flip: {
                                    behavior: ['bottom'] // don't allow it to flip to be above
                                  },
                                  preventOverflow: {
                                    enabled: false // tell it not to try to stay within the view (this prevents the popper from covering the element you clicked)
                                  },
                                  // hide: {
                                  //     enabled: false // turn off since needs preventOverflow to be enabled
                                  // }
                                }}
                              />
                            </div>
                            <div
                              className={`col-sm-2 calender-div-Icon ${(entry.closedDate !== "" || props.selectedLevel === 'Deliverable') ? '' : 'empty-date'}`}
                            >
                              <img src={calenderIcon} alt="calender" className="calenderImg" />
                            </div>
                          </div> :
                          <div className="row">
                            <div className="col-sm-10 centerAlign" style={{ color: "#ffffff80" }}>
                              {entry.closedDate !== "" ? Moment(entry.closedDate).format('DD-MMM-YYYY') : ""}
                            </div>
                            <div
                              className={`col-sm-2 calender-div-Icon ${(entry.closedDate !== "" || props.selectedLevel === 'Deliverable') ? '' : 'empty-date'}`}
                            >
                              <img src={calenderIcon} alt="calender" className="calenderImg" />
                            </div>
                          </div>

                        }
                      </td>
                      <td style={{ paddingLeft: "5px" }}>
                        {props.selectedLevel === 'Deliverable' ?
                          // <i className="fa fa-trash" id={key} style={{ cursor: 'pointer' }}
                          //   onClick={(e) => props.deleteRisk(entry.catActId, key)}
                          // >
                          // </i> 
                          <img src={trash}
                            data-tip=""
                            data-for="delete_tooltip"
                            data-place="left"
                            style={{ width: '13px', cursor: 'pointer' }}
                            onClick={(e) => props.deleteRisk(entry.catActId, key)} /> : ''}
                        <ReactTooltip id="delete_tooltip" className="tooltip-class">
                          <span>Delete RID</span>
                        </ReactTooltip>
                      </td>
                    </tr> : ''
                )
              })}
            </tbody>

          </table>
        </div>
        {props.tableData && props.tableData.length > 0 ?
          '' :
          //  <table className="noDataAvailable">
          //    <tbody >
          //    <tr>
          //      <td style={{width:'100%'}}>
          //    No Risks, Issues and Dependencies have been added yet
          //    </td>
          //    </tr>
          // </tbody>
          // </table>
          <div className="noDataAvailable"> No Risks, Issues and Dependencies have been added yet</div>


        }
        {
          props.selectedLevel === 'Deliverable' ?
            <Fragment>


              {props.saveInprogress ?
                < div className="col-md-12 row saving_loader" >
                  Saving....
               {/* <i className="fa fa-spinner fa-spin"></i> */}
                </ div>
                :
                <div className="row col-sm-12" style={{ marginTop: '15px', padding: "0px" }}>

                  < div className="col-sm-10 btn-row" style={{ paddingLeft: '0px' }}>
                    <div className="cr-de-btn-div" style={{ paddingLeft: '0px' }}>
                      <button className="btn btn-primary" alt="saveIcon" type="submit"
                        style={{ width: '85px', cursor: SessionStorage.read("accessType") === "Read" ? "not-allowed" : 'pointer' }}
                        disabled={SessionStorage.read("accessType") === "Read" ? true : false}
                        onClick={SessionStorage.read("accessType") === "Read" ? 'return false;' : props.onDelRisksSave}
                      >
                        save
                    </button>
                    </div>
                  </div>
                  <div className="col-sm-2 row save-row" >
                    <img data-tip=""
                      data-for="add_tooltip"
                      data-place="left" src={add} onClick={props.addNewRisk} style={{ cursor: 'pointer' }} />
                    <ReactTooltip id="add_tooltip" className="tooltip-class">
                      <span>Add RID</span>
                    </ReactTooltip>
                    {/* <i className="fa fa-plus" onClick={props.addNewRisk} style={{ color: '#000000', marginRight: '2%' }}></i> */}
                  </div>


                  {/* <img src={saveIcon} alt="saveIcon" className="saveIcon_risk"
                  style={{cursor: SessionStorage.read("accessType") === "Read" ?"not-allowed":'pointer'}}
                   onClick={SessionStorage.read("accessType") === "Read" ?'return false;':props.onDelRisksSave} /> */}
                </div>
              }
            </Fragment> : ''
        }
      </div >
    </div>
  );
};

export default RisksTable;