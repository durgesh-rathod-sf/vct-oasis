import React, { Component, Fragment } from 'react';
import { withRouter } from "react-router-dom";
import Menu from '../../components/Menu/Menu';
import bell from '../../assets/Contacts/bell.svg';
import { inject } from 'mobx-react';
import './SalesHome.css';
import { toast } from 'react-toastify';
import NotificationMessage from '../../components/NotificationMessage/NotificationMessage';
var SessionStorage = require('store/storages/sessionStorage');

@inject('adminStore', 'myProjectStore')
class SalesHome extends Component {
   constructor(props) {
      super(props)
      this.onNextClick = this.onNextClick.bind(this);
      this.demoClickHandler = this.demoClickHandler.bind(this);
      this.projectClickHandler = this.projectClickHandler.bind(this);
   }

   onNextClick() {
      const { history } = this.props;
      history.push('/home');
      SessionStorage.write('option_selected', 'sales');
   }

   componentDidMount() {
      SessionStorage.write('option_selected', 'sales');
      const { adminStore } = this.props;
      adminStore.inAdminPanel = true;
   }
   demoClickHandler = (event) => {
      const { history, myProjectStore } = this.props
      SessionStorage.write('tenantId', null);
      SessionStorage.write('demoUser', JSON.stringify(true));
      SessionStorage.write('accessType', 'Read');
      SessionStorage.write('projectName', "DEMO OPPORTUNITY");

      myProjectStore.fetchDemoDeal()
         .then((res) => {
            console.log(res);
            if (res.resultCode === 'OK') {
               history.push('/value-drivers');
            } else if (res.resultCode === 'KO') {
               this.showNotification('error', res.errorDescription);
            } else {
               this.showNotification('error', 'Sorry! Something went wrong');
            }
            //  history.push("/deal");
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
                  if (result.resultObj[type].length === 0 && result.resultObj['Offering'].length === 0 && result.resultObj['MasterOffering'].length === 0) {
                     // alert("There are no " + type.toLowerCase() + "s created. Please reach out 'Sambit Banerjee' to get " + type.toLowerCase() + "s created as you dont have access to create.");
                     this.showNotification("error", ("There are no " + type.toLowerCase() + "s created. Please reach out 'Sambit Banerjee' to get " + type.toLowerCase() + "s created as you dont have access to create."))
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

   showNotification(type, msg) {
      switch (type) {
         case 'error':
            toast.error(<NotificationMessage
               title="Error"
               bodytext={msg}
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
                           >Opportunity Home</li>
                        </ol>
                     </nav>
                  </div>
               </div>
            </div>

            <div className={userType !== 'EU' ? "container-fluid contentmain sales-home-main" : "container-fluid contentmain sales-external-home-main"} id={"LandingPage"} style={{ textAlign: 'left', display: 'flex', }}>
               <div className={userType !== 'EU' ? 'outerDiv' : 'gradientClass '}>
                  <div className="row leftDivHome col-sm-12" style={{ width: userType === 'EU' ? '50%' : '' }} >
                     <div style={{ width: '500px', marginTop: userType === 'EU' ? '1.5rem' : '' }} className="bellIco" >
                        <img src={bell} alt="" ></img>
                     </div>

                     <div >{
                        userType !== 'EU' ?
                           <span style={{ color: '#00BAFF', marginTop: '26px' }} className='leftFont'>
                              <b>WORK WITH ACCENTURE<br></br> CAPABILITY<br></br> NETWORK DURING <br></br>YOUR OPPORTUNITY<br></br> PURSUIT TO</b>
                              <span style={{ color: '#ffffff' }} className='leftFont1'><b>ARTICULATE VALUE<br></br> THAT ACCENTURE <br></br>CAN ENABLE FOR<br></br> YOUR CLIENT</b></span>
                           </span> :
                           <span style={{ color: '#ffffff', marginTop: '26px' }} className='EUleftFont'>
                              <b>WORK WITH<br></br> <span style={{ color: '#00BAFF' }} className='EUleftFont1'> <b> ACCENTURE</b> </span><br></br>DURING YOUR<br></br>OPPORTUNITY PURSUIT<br></br>TO ARTICULATE</b><br></br>
                              <b><span style={{ color: '#00BAFF' }} className='EUleftFont1'><b> VALUE </b></span> THAT CAN BE<br></br>ENABLED FOR YOU</b></span>

                     }
                     </div>
                     <div className="row" >
                        <div className="col-sm-12 btn-row" style={{ alignContent: 'left', textAlign: 'left', paddingTop: '21px' }}>
                           <div  >
                              <div className="cr-de-btn-div" style={{ margintop: '30px', paddingLeft: userType === 'EU' ? '25px' : '' }}>

                                 <button
                                    onClick={(e) => { this.projectClickHandler(e, 'Deal') }}
                                    type="submit"
                                    className="btn btn-primary"
                                    disabled={userType === "D" ? true : false}
                                 >
                                    MY OPPORTUNITIES
               </button>

                              </div>
                              {userType !== 'EU' ?
                                 <div className="cr-de-btn-div">

                                    <button onClick={this.demoClickHandler}
                                       type="submit"
                                       className="btn btn-primary"
                                    >
                                       DEMO OPPORTUNITY
               </button>

                                 </div> : null}
                           </div>
                        </div>
                     </div>
                  </div>
               </div>

               {
                  userType !== "EU" ?
                     <div className="divTableSales">
                        <div className="divTableBody">
                           <div className="divTableRow">
                              <div className="divTableCell11"></div>
                              <div className="divTableCell1" style={{ backgroundColor: '#9fbaff', fontSize: '10px' }}>Stage<br /><b style={{ fontSize: '16px' }}>1A</b>
                              </div>
                              <div className="divTableCell1" style={{ backgroundColor: '#97d0ff', fontSize: '10px' }}>Stage <br /><b style={{ fontSize: '16px' }}>1A-1B</b>
                              </div>
                              <div className="divTableCell1" style={{ backgroundColor: '#65b9ff', fontSize: '10px' }}>Stage <br /><b style={{ fontSize: '16px' }}>1A-2B</b>
                              </div>
                              <div className="divTableCell1" style={{ backgroundColor: '#6595ff', fontSize: '10px' }}>Stage <br /><b style={{ fontSize: '16px' }}>1A-2A</b></div>
                              <div className="divTableCell1" style={{ backgroundColor: '#008cbe', fontSize: '10px' }}>Stage <br /><b style={{ fontSize: '16px' }}>2B-3A</b></div>
                              <div className="divTableCell1" style={{ backgroundColor: '#0068be', fontSize: '10px' }}>Stage <br /><b style={{ fontSize: '16px' }}>3B</b></div>
                           </div>
                           <div className="divTableRow">
                              <div className="divTableCell11"></div>
                              <div className="divTableCell1"><b style={{ fontSize: '12px' }}>REQUEST</b><br />Access to <br />Value Cockpit Tool</div>
                              <div className="divTableCell1"><b style={{ fontSize: '12px' }}>SETUP</b> <br />New Deal in<br /> the Tool</div>
                              <div className="divTableCell1"><b style={{ fontSize: '12px' }}>CONFIGURE</b><br />Deal for <br />the opportunity</div>
                              <div className="divTableCell1"><b style={{ fontSize: '12px' }}>PRESENT</b><br />Business Case <br /> to Client</div>
                              <div className="divTableCell1"><b style={{ fontSize: '12px' }}>UPDATE</b><br />Value Case<br /> to Close Sales</div>
                              <div className="divTableCell1"><b style={{ fontSize: '12px' }}>CONVERT</b><br />Deal to VRO Project<br />  to Win</div>
                           </div>
                           <div className="divTableRow" >
                              <div className="divTableCell11"></div>
                              <div className="divTableCell11" style={{ backgroundColor: '#969696' }}>At deal origination stage</div>
                              <div className="divTableCell11" style={{ backgroundColor: '#969696' }}>After access to Value Cockpit is provided</div>
                              <div className="divTableCell11" style={{ backgroundColor: '#969696' }}>After deal instance is created for a client</div>
                              <div className="divTableCell11" style={{ backgroundColor: '#969696' }}>After deal is customized for client</div>
                              <div className="divTableCell11" style={{ backgroundColor: '#969696' }}>After client feedback</div>
                              <div className="divTableCell11" style={{ backgroundColor: '#969696' }}>After opportunity is won</div>
                           </div>
                           <div className="divTableRow" >
                              <div className="divActivityCell" style={{ backgroundColor: '#969696' }}>
                                 <span className='Activities' >ACTIVITIES</span>
                              </div>
                              <div className="divTableCell-sales" >
                                 <ul className="A">
                                    <li>Deal Owner emails CN VRO Lead for relevant Industry (see Contact Us page) requesting support on value- focused Sales and shares BD WBSE</li>
                                    <br />
                                    <li> CN Industry VRO Lead assigns CN VRO SMEs to support Deal Owner on pursuit</li>
                                    <br />
                                    <li>CN Industry VRO Lead emails Sambit Banerjee (Global VRO Lead) requesting access for CN and Sales teams to Value Cockpit “My Opportunities” section</li>
                                    <br />
                                    <li>Sambit’s team provides access to CN and Sales Team</li>
                                 </ul>
                              </div>
                              <div className="divTableCell-sales">
                                 <ul className="A">
                                    <li>Sales Team creates a deal instance in the tool and adds other deal members with read / write privilege</li>
                                    <br />
                                    <li>CN VRO SMEs assigned to the deal and APP Tech Support Team provide any necessary assistance during the deal setup process (e.g. training, tech troubleshooting etc.)</li>
                                 </ul>
                              </div>
                              <div className="divTableCell-sales">
                                 <ul className="A">
                                    <li>Sales Team supported by CN VRO SMEs customize a pre-configured Industry Offering (e.g. ACE+, Living Systems etc.) based on client context</li>
                                    <br></br>
                                    <li style={{ textAlign: 'center', marginRight: '24px' }}>-OR-</li>
                                    <br></br>
                                    <li>Sales Team supported by CN VRO SMEs create custom Value trees and Business Cases if the pursuit does not align to a specific Industry Offering (e.g. ACE+, Living Systems etc.)</li>
                                 </ul>
                              </div>
                              <div className="divTableCell-sales">
                                 <ul className="A">
                                    <li>Sales Team reviews the Value-focused deal with the client and updates the business case as necessary</li>
                                    <br></br>
                                    <li>As required, CN Industry VRO Lead can help prep for client orals/ discussions and further Business Case</li>
                                 </ul>
                              </div>
                              <div className="divTableCell-sales">
                                 <ul className="A">
                                    <li>Sales Team updates the business case based on client feedback</li>
                                    <li>As required, CN Industry VRO Lead can assist the Deal Team with above updates, pricing of VRO workstream during delivery etc.</li>
                                    <br></br>
                                    <li>Sales Team closes the Sales process once the deal is won</li>
                                 </ul>
                              </div>
                              <div className="divTableCell-sales">
                                 <ul className="A">
                                    <li>Once the sale goes through, based on CN’s contribution during the Sales phase, Deal Owner adds CN Industry VRO Lead on MMS in a Role with Allocation </li>
                                    <br></br>
                                    <li>CN Industry VRO Lead converts the Deal into a VRO Program on the tool</li>
                                    <br></br>
                                    <li>CN Industry VRO Lead works with Program Delivery Team to enable Value creation for client</li>
                                 </ul>
                              </div>
                           </div>
                        </div>
                     </div> :
                     null}

            </div >
         </Fragment >
      )
   }
}

export default withRouter(SalesHome);