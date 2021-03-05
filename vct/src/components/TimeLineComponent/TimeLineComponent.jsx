import React from 'react';
import 'moment-timezone';
import DatePicker from "react-datepicker";
import calenderIcon from "../../assets/project/workstream/date.svg";

import saveIcon from "../../assets/project/workstream/saveIcon.png";
import Moment from 'moment';
import "./TimeLineComponent.css";
var SessionStorage = require('store/storages/sessionStorage');

const TimeLineComponent = (props) => {

  const { timelineDetails, pStartDate, pEndDate, expEndDate, expStartDate, actualEndDate, actualStartDate, disableObj } = props
  return (
    <div id="Timeline">

 


      <div className="row">
      
          <div className="col-sm-3" style={{paddingRight:'0px',paddingLeft:'0px'}}>
          <div className="row">
          Planned start date
            <div className="inputAboveDiv">
            
              <DatePicker
                disabled={disableObj.pSD}
                value={pStartDate}
                selected={pStartDate}
                placeholderText="dd-mmm-yyyy"
                dateFormat="dd-MMM-yyyy"
                showMonthDropdown
                showYearDropdown
                useShortMonthInDropdown
                className="timeline_input"
                required={true}
              >

              </DatePicker>
              {/* <i className="fa fa-caret-down date_drop_Icon" aria-hidden="true"  ></i> */}


            </div>
            <div className="calenderAboveDiv">
            
            <img src={calenderIcon} alt="calender" className="calenderImg" />
          </div>
              </div>
         
            {/* <div className="col-md-3 labelAboveDiv">
              <label className="timeline_labelText">Planned start date</label>
            </div> */}

          </div>
        
        <div className="col-sm-3" style={{paddingRight:'0px',paddingLeft:'0px'}}>
          <div className="row">
          Planned end date
            <div className="inputAboveDiv">
              <DatePicker
                disabled={disableObj.pED}
                value={pEndDate}
                selected={pEndDate}
                placeholderText="dd-mmm-yyyy"
                dateFormat="dd-MMM-yyyy"
                showMonthDropdown
                showYearDropdown
                useShortMonthInDropdown
                className="timeline_input"
                required={true}
              >

              </DatePicker>
              {/* <i className="fa fa-caret-down date_drop_Icon" aria-hidden="true"></i> */}
            </div>
            <div className="calenderAboveDiv">
              <img src={calenderIcon} alt="calender" className="calenderImg" />
            </div>
          </div>
       
            {/* <div className="col-md-3 labelAboveDiv">
              <label className="timeline_labelText">Planned end date</label>
            </div> */}
           
        </div>
        
        <div className="col-sm-3" style={{paddingRight:'0px',paddingLeft:'0px'}}>
          <div className="row">
          Expected start date
            <div className="inputAboveDiv">

              <DatePicker
                disabled={disableObj.eSD}
                minDate={new Date(Moment(new Date()).add(1, "days"))
                  //  new Date(Moment(Moment(new Date()).format('YYYY-MM-DD')).add(1,'days'))
                }
                value={expStartDate}
                selected={
                  // expStartDate === undefined || expStartDate === "" ? "" : new Date(
                  expStartDate
                  // )
                }
                placeholderText="dd-mmm-yyyy"
                onChange={(event) => props.handleDateChange(event, 'expStartDate')}
                dateFormat="dd-MMM-yyyy"
                showMonthDropdown
                showYearDropdown
                useShortMonthInDropdown
                fixedHeight
                className="form-control timeline_input"
                required={true}
              >

              </DatePicker>
              {/* <i className="fa fa-caret-down date_drop_Icon" aria-hidden="true"></i> */}
            </div>
            <div className="calenderAboveDiv">
              <img src={calenderIcon} alt="calender" className="calenderImg" />
            </div>
          </div>
       
            {/* <div className="col-md-3 labelAboveDiv">
              <label className="timeline_labelText">Expected start date</label>
            </div> */}
           

        </div>
        
        <div className="col-sm-3" style={{paddingRight:'0px',paddingLeft:'0px'}}>
          <div className="row">
          Expected end date
            <div className="inputAboveDiv">

              <DatePicker
                disabled={disableObj.eED}
                minDate={(expStartDate !== "" && expStartDate > new Date() ? expStartDate :
                  //  "")
                  new Date(Moment(new Date()).add(1, "days")))

                }
                value={expEndDate}
                selected={expEndDate}
                placeholderText="dd-mmm-yyyy"
                onChange={(event) => props.handleDateChange(event, 'expEndDate')}
                dateFormat="dd-MMM-yyyy"
                fixedHeight
                showMonthDropdown
                showYearDropdown
                useShortMonthInDropdown
                className="timeline_input"
                required={true}
              >

              </DatePicker>
              {/* <i className="fa fa-caret-down date_drop_Icon" aria-hidden="true"></i> */}
            </div>
            <div className="calenderAboveDiv">
              <img src={calenderIcon} alt="calender" className="calenderImg" />
            </div>
          </div>
       
            {/* <div className="col-md-3 labelAboveDiv">
              <label className="timeline_labelText">Expected end date</label>
            </div> */}
           

        </div>
        </div>
        
        {/* <div className="col-md-11 row"> */}
        <div className="row"  style={{marginTop:'20px'}}>
        <div className="col-sm-3" style={{paddingRight:'0px',paddingLeft:'0px'}}>
          <div className="row">
          Actual start date
            <div className="inputAboveDiv">
              <DatePicker
                disabled={disableObj.aSD}
                maxDate={new Date()}
                value={actualStartDate}
                selected={actualStartDate}
                placeholderText="dd-mmm-yyyy"
                onChange={(event) => props.handleDateChange(event, 'actualStartDate')}
                dateFormat="dd-MMM-yyyy"
                showMonthDropdown
                showYearDropdown
                fixedHeight
                useShortMonthInDropdown
                className="timeline_input"
                required={true}
              >

              </DatePicker>
              {/* <i className="fa fa-caret-down date_drop_Icon" aria-hidden="true"></i> */}
              </div>
              <div className="calenderAboveDiv">
              <img src={calenderIcon} alt="calender" className="calenderImg" />
            </div>
          </div>
        
            {/* <div className="col-md-3 labelAboveDiv">
              <label className="timeline_labelText">Actual start date</label>
            </div> */}
           
          </div>
        
        <div className="col-sm-3" style={{paddingRight:'0px',paddingLeft:'0px'}}>
          <div className="row">
          Actual end date
            <div className="inputAboveDiv">
              <DatePicker
                disabled={disableObj.aED}
                minDate={(actualStartDate !== "" ? actualStartDate :
                  "")}
                maxDate={new Date()}
                value={actualEndDate}
                selected={actualEndDate}
                placeholderText="dd-mmm-yyyy"
                onChange={(event) => props.handleDateChange(event, 'actualEndDate')}
                dateFormat="dd-MMM-yyyy"
                fixedHeight
                showMonthDropdown
                showYearDropdown
                useShortMonthInDropdown
                className="timeline_input"
                required={true}
              >

              </DatePicker>
              {/* <i className="fa fa-caret-down date_drop_Icon" aria-hidden="true"></i> */}
            </div>

         
        <div className="calenderAboveDiv">
              <img src={calenderIcon} alt="calender" className="calenderImg" />
            </div>
            {/* <div className="col-md-3 labelAboveDiv">
              <label className="timeline_labelText">Actual end date</label>
            </div> */}
           
           </div>
        </div>
        <div className="col-md-6" style={{paddingRight:'0px',paddingLeft:'0px'}}>
        {/* <div className="col-md-2 statusLabel"> <label >Status</label> </div> */}

<div className="row statusInput">
Status
  
    <select className="statusSelect" value={(timelineDetails && timelineDetails.status) || ''} onChange={props.onStatusChange}>
      <option value="" defaultValue disabled>Select</option>
      <option value="CMP_WITHIN_DUE_DT" >Completed within due date</option>
      <option value="CMP_AFTER_DUE_DT">Completed after due date</option>
      <option value="DELAYED">Delayed</option>
      <option value="INPROGRESS">In Progress</option>
      <option value="NOT_STARTED">Not started</option>

    </select>
  
</div>

        </div>
          </div>
          
        {/* <div className="col-md-6">
          <div className="dateRow row">
            
          </div>
          <div className="dateRow row">
           
          </div>
          <div className="dateRow row">
            


        </div>
        <div className="col-md-6">
          <div className="dateRow row">
           
          </div>
          <div className="dateRow row">
           
          </div>
          <div className="dateRow row">
           
          </div>


        </div>
        <div className="col-md-12 row statusRow">

      
        </div> */}
        {props.saveInprogress ?
          < div className="col-md-12 row saving_loader" >
            Saving....
               </ div>
          :
          // <div className="col-md-12 saveIcon_div">

          //   <img src={saveIcon} alt="saveIcon" className="saveIcon" 
          //   style={{cursor: SessionStorage.read("accessType") === "Read" ?"not-allowed":'pointer'}}
          //   onClick={SessionStorage.read("accessType") === "Read" ?'return false;':props.saveActivityWSTimeLine} />
          // </div>
          <div className="col-sm-12 btn-row" style={{marginTop:'2%',paddingLeft:'0px'}}>
                        <div className="cr-de-btn-div" style={{paddingLeft:'10px'}}  >
                         <button 
                          style={{width:'85px',
                          cursor: SessionStorage.read("accessType") === "Read" ?"not-allowed":'pointer'}}
                          disabled={SessionStorage.read("accessType") === "Read" ?true:false}
                             onClick={SessionStorage.read("accessType") === "Read" ?'return false;':props.saveActivityWSTimeLine}
                           className="activity-img" className="btn btn-primary">Save</button>
                        </div>
                      </div>
        }
      </div>
      
    
  );
}

export default TimeLineComponent;