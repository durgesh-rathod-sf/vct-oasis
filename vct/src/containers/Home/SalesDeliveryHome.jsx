import React, { Component, Fragment } from 'react';
import { withRouter } from "react-router-dom";
import './Home.css';
import Menu from '../../components/Menu/Menu';
import bell from '../../assets/Contacts/bell.svg';
import { inject } from 'mobx-react';
import { toast } from 'react-toastify';
import NotificationMessage from '../../components/NotificationMessage/NotificationMessage';
var SessionStorage = require('store/storages/sessionStorage');

@inject('myProjectStore')
class SalesDeliveryHome extends Component {
   constructor(props) {
      super(props);
      this.popOptionHandler = this.popOptionHandler.bind(this);
      this.demoClickHandler = this.demoClickHandler.bind(this);
      this.projectClickHandler = this.projectClickHandler.bind(this);
   }

   popOptionHandler = (event) => {
      const { history } = this.props;
      history.push('/home');
   }
   demoClickHandler = (event) => {

      const { history, myProjectStore } = this.props
      // SessionStorage.write('mapId', SessionStorage.read('demoMapId'))
      // SessionStorage.write('demoUser', JSON.stringify(true));
      // history.push("/deal");
      SessionStorage.write('tenantId', null);
      SessionStorage.write('demoUser', JSON.stringify(true));
      SessionStorage.write('accessType', 'Read');
      SessionStorage.write("projectName", "DEMO PROJECT")
      myProjectStore.fetchDemoProject()
         .then((res) => {

            if (res.resultCode === 'OK') {
               history.push('/value-drivers');
            } else if (res.resultCode === 'KO') {
               this.showNotification('error', res.errorDescription);
            } else {
               this.showNotification('error', 'Sorry! Something went wrong');
            }
         })

   }
   projectClickHandler = (event, type) => {
      const { history } = this.props
      SessionStorage.write('mapId', SessionStorage.read('mapId'))
      SessionStorage.write('demoUser', JSON.stringify(false));
      let userType = SessionStorage.read('userType');
      if (userType === 'U' && (type === 'Project' || type === 'Deal')) {
         const { myProjectStore } = this.props;
         myProjectStore.getProjectLists()
            .then((result) => {
               if (result && !result.error && result.resultCode === "OK") {
                  if (result.resultObj[type].length === 0) {
                     // benefit("There are no " + type.toLowerCase() +"s created. Please reach out 'Sambit Banerjee' to get " + type.toLowerCase() + "s created as you dont have access to create.");
                     this.showNotification("error", ("There are no " + type.toLowerCase() + "s created. Please reach out 'Sambit Banerjee' to get " + type.toLowerCase() + "s created as you dont have access to create."));
                  } else {
                     history.push("/my-deals");
                  }
               } else if (result && result.resultCode === 'KO') {
                  this.showNotification("error", result.errorDescription);
               }
            });
      } else {
         history.push("/my-deals");
      }
   }
   componentDidMount() {
      SessionStorage.write('option_selected', 'delivery');

   }
   redirectHandler(type) {
      const { history } = this.props;
      // eslint-disable-next-line default-case
      switch (type) {
         case 'home':
            history.push('/home');
            break;
         case 'sales':
            history.push('/home');
            break;
         case 'delivery':
            history.push('/home');
            break;
      }
   }
   showNotification(type, message) {
      switch (type) {
         case 'error':
            toast.error(<NotificationMessage
               title="Error"
               bodytext={message}
               icon="error"
            />, {
               position: toast.POSITION.BOTTOM_RIGHT
            });
            break;
         default:
            break;
      }
   }

   render() {
      let userType = SessionStorage.read('userType');
      return (
         <Fragment>
            <Menu />
            <div className="row breadcrumb-row">
               <div className="col-sm-6" >
                  <div style={{ marginLeft: '2%' }}>
                     <nav aria-label="breadcrumb">
                        <ol className="breadcrumb">
                           <li className="breadcrumb-item" style={{ cursor: 'pointer' }} onClick={() => this.redirectHandler('home')}>Home</li>
                           <li className="breadcrumb-item active"
                           // onClick={() => this.redirectHandler('sales')}
                           >Program Delivery Home</li>
                        </ol>
                     </nav>
                  </div>
               </div>
            </div>

            <div className="container-fluid delivery-home-main" id="LandingPage" style={{ textAlign: 'center', marginTop: '0.5rem', display: 'flex' }}>

               <div className=" row leftDivDelivery">
                  <div className="bellIco" >
                     <img src={bell} alt="" ></img>
                  </div>
                  <div className='deliveryLeftFont' style={{ paddingTop: '26px' }}>
                     <span style={{ color: '#00BAFF', display: 'inline' }} className='deliveryLeftFont'>
                        <b>WORK WITH ACCENTURE<br></br>
      CAPABILITY <br></br>NETWORK TO</b></span>
                     <span style={{ color: '#ffffff', display: 'inline' }} className='deliveryLeftFont'> <b>ARCHITECT &<br></br> TRACK VALUE </b></span><span style={{ color: '#00BAFF', display: 'inline' }} className='deliveryLeftFont'><b>DURING YOUR<br></br> PROGRAM DELIVERY </b>
                     </span> <span style={{ color: '#ffffff', display: 'inline' }} className='deliveryLeftFont'><b>&  RUN <br></br>THE PMO FUNCTION</b>
                     </span>
                  </div>
                  <div className="row" >
                     <div className="col-sm-12 btn-row" style={{ alignContent: 'left', marginTop: '10px', textAlign: 'left', paddingTop: '25px' }}>
                        <div >
                           <div className="cr-de-btn-div">

                              <button
                                 onClick={(e) => { this.projectClickHandler(e, 'Project') }}
                                 type="submit"
                                 className="btn btn-primary"
                                 disabled={userType === "D" ? true : false}
                              >
                                 MY PROJECTS
                  </button>

                           </div>
                           <div className="cr-de-btn-div">

                              <button
                                 onClick={this.demoClickHandler}
                                 type="submit"
                                 className="btn btn-primary"
                              >
                                 DEMO PROJECT
                  </button>

                           </div>
                        </div>
                     </div>
                  </div>
               </div>
               <div className="rightDivDelivery" style={{ width: '69%', marginLeft: '26px' }}>
                  <table style={{ width: '100%' }}>
                     <thead>
                        <tr>
                           <th style={{ width: '4.86px', padding: '7px 0px 6px' }}></th>
                           <th className="divTableHead12" style={{ backgroundColor: '#008EFF', fontSize: '12px !important', height: '35px', width: '45%' }}>Early Stages of Program Delivery </th>
                           <th className="divTableHead12" style={{ backgroundColor: '#00BAFF', fontSize: '12px !important', height: '35px', width: '45%' }}>Throughout Program Delivery</th>
                        </tr>
                     </thead>
                     {/* Added a <tr> and <thead> tag, as <th> cannot appear as a child of <table> */}
                  </table>
                  <div className="divTableDelivery">

                     <div className="divTableBody">

                        <div className="divTableRow">
                           <div className="divTableCell1" ></div>
                           <div className="divTableCell1"><b style={{ fontSize: '12px' }}>REQUEST</b><br />Access to <br />Value Cockpit Tool</div>
                           <div className="divTableCell1"><b style={{ fontSize: '12px' }}>SETUP</b> <br />New Program in<br /> the Tool</div>
                           <div className="divTableCell1"><b style={{ fontSize: '12px' }}>ARCHITECT</b><br /> Value to be enabled<br />through the Program</div>
                           <div className="divTableCell1"><b style={{ fontSize: '12px' }}>CONFIGURE</b><br />Program Workstreams <br /> & Track Value enablement</div>
                           <div className="divTableCell1"><b style={{ fontSize: '12px' }}>RUN</b><br />Program Management<br /> Office (PMO)</div>
                           <div className="divTableCell1"><b style={{ fontSize: '12px' }}>REPORT</b><br />Program Delivery Status &<br /> Value Enabled</div>
                        </div>
                        <div className="divTableRow" >
                           <div className="divTableCell1"></div>
                           <div className="divTableCell11" style={{ backgroundColor: '#969696' }}>During program mobilization stage</div>
                           <div className="divTableCell11" style={{ backgroundColor: '#969696' }}>After access to Value Cockpit is provided</div>
                           <div className="divTableCell11" style={{ backgroundColor: '#969696' }}> After Program instance is created for the client</div>
                           <div className="divTableCell11" style={{ backgroundColor: '#969696' }}>After Value Driver Tree & Business Case is created for project</div>
                           <div className="divTableCell11" style={{ backgroundColor: '#969696' }}>Throughout Program Delivery</div>
                           <div className="divTableCell11" style={{ backgroundColor: '#969696' }}>Throughout Program Delivery</div>
                        </div>
                        <div className="divTableRow" >
                           <div className="divActivityCellD" style={{ backgroundColor: '#969696' }}>
                              <span className='Activities' >ACTIVITIES</span>
                           </div>
                           <div className="divTableCell">
                              <ul className="A">
                                 <li>Program Delivery Lead emails CN VRO Lead for relevant Industry (see Contact Us page) requesting support on Value Architecting / Tracking and PMO during Program Delivery</li>
                                 <br></br>
                                 <li> CN Industry VRO Lead assigns CN VRO SMEs to deliver VRO and PMO workstreams </li>
                                 <br></br>
                                 <li>CN Industry VRO Lead emails Sambit Banerjee (Global VRO Lead) requesting access for CN and other Delivery resources to Value Cockpit “My Projects” section</li>
                                 <br></br>
                                 <li>Sambit’s team provides access to CN and Delivery Team</li>
                              </ul>
                           </div>
                           <div className="divTableCell">
                              <ul className="A">
                                 <li>CN VRO Team creates a project instance in the tool and adds other delivery members with read / write privilege</li>
                                 <br></br>
                                 <li>APP Tech Support Team provides any necessary assistance during the Project setup process (e.g. tech troubleshooting etc.)</li>
                              </ul>
                           </div>
                           <div className="divTableCell">
                              <ul className="A">
                                 <li>CN VRO Team customizes a pre-configured Industry Offering (e.g. ACE+, Living Systems etc.) based on client context </li>
                                 <br></br>
                                 <li style={{ textAlign: 'center', marginRight: '24px' }}>-OR-</li>
                                 <br></br>
                                 <li>CN VRO Team works with relevant resources in Delivery Team / Client organization to create custom Value trees and Business Cases if the program does not align to a specific Industry Offering (e.g. ACE+, Living Systems etc.)</li>
                              </ul>
                           </div>
                           <div className="divTableCell">
                              <ul className="A">
                                 <li>CN VRO Team works with relevant resources in Delivery Team / Client organization to setup the program workstreams, activities, deliverables, milestones</li>
                                 <br></br>
                                 <li>CN VRO Team starts tracking Value enablement in the program</li>
                              </ul>
                           </div>
                           <div className="divTableCell">
                              <ul className="A">
                                 <li>A blended team of CN and onshore delivery resources setup the PMO office and run it using Value Cockpit</li>
                                 <li>The PMO and VRO teams collaborate closely throughout program delivery </li>
                                 <br></br>
                                 <li>If a separate program management tool (e.g. JIRA) is used, CN VRO team takes program data from PMO at regular cadence and ingests into Value Cockpit </li>
                              </ul>
                           </div>
                           <div className="divTableCell">
                              <ul className="A">
                                 <li>VRO Team and PMO Team use the dashboard features of the tool to report value enablement and program status to relevant stakeholders throughout program delivery</li>
                              </ul>
                           </div>
                        </div>
                     </div>
                  </div>

               </div>

            </div >
         </Fragment >
      )
   }
}

export default withRouter(SalesDeliveryHome);