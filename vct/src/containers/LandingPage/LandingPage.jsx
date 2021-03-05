import React, { Component, Fragment } from 'react';
import { Link, Route, withRouter } from "react-router-dom";

import Menu from '../../components/Menu/Menu';
import SalesImg from '../../assets/logo/sales_logo.png';
import DeliveryImg from '../../assets/logo/delivery_logo.png';
import maskGroup from '../../assets/project/login/login-bg.svg';
import landingPageStyles from './landingPageStyles.css';
import DashboardUtils from '../Dashboards/DashboardUtils';
import { inject } from 'mobx-react';
import { toast } from 'react-toastify';
var SessionStorage = require('store/storages/sessionStorage');

@inject('adminStore','myProjectStore')

class LandingPage extends Component {
    constructor(props) {
        super(props)
        this.redirectHandler = this.redirectHandler.bind(this);
        this. expiryHandler = this. expiryHandler.bind(this);
    }


    expiryHandler = () => {
        let userType = SessionStorage.read('userType');
        let endDt = DashboardUtils.formatDateMMDDYY(SessionStorage.read('endDate'));
        let endDate = new Date(endDt);
        let presentDay = new Date();
        let differenceInTime = endDate.getTime() - presentDay.getTime();
        let differenceInDay = Math.round (differenceInTime / (1000 * 3600 * 24));
       if (userType !== 'A' && userType !== 'D') {
            if (differenceInDay <= 10 ) {
                this.showNotification("warn",  differenceInDay );

        }
    }
}
    
redirectPage = () => {
    this.props.history.push("/contact-us");
}



showNotification = (type, message) => {
    switch (type) {
      case 'warn':
        toast.warn(
          <div>
            <div className="col-*" style={{ fontFamily: 'Graphik', fontSize: '14px', color: "#ffffff", marginTop: "6px", paddingLeft: "19px" }}>
             <div style={{marginRight: '37px',textAlign: 'center'}}>
                  <span style={{fontFamily: 'Graphik', fontSize: '14px',color: '#FF0000', position: 'absolute', marginTop: "-18px" }}>Warning! </span>
                  </div><span>Your access will expire in </span><span style={{fontFamily: 'Graphik', fontSize: '14px',color: '#FF0000'}}>{message}</span>
                  <span> days. Please reach out to your</span>
                  <span style={{ fontFamily: 'Graphik', fontSize: '14px', cursor: "pointer", textDecoration: "underline" , color: "#4169E1"}} onClick={() => this.redirectPage()}> VRO Industry Lead</span>
                  <span> to extend your access.</span>
            </div>
          </div>
          , {
            position: toast.POSITION.TOP_RIGHT,
            className: "toastWarnCSS",
            autoClose: false,
             });
        break;
        default:
        break;
                 }
             }

    redirectHandler = (event) => {
        const { history } = this.props;
        const targetId = event.target.id;

        // eslint-disable-next-line default-case
        switch (targetId) {
            case 'sales':
                if (SessionStorage.read("userType") === "EU") {
                    this.projectClickHandler("Deal");
                    // SessionStorage.write('option_selected', 'sales');

                } else {
                    history.push('/sales-home');
                    //SessionStorage.write('option_selected', targetId);
                }
                SessionStorage.write('option_selected', targetId);
                break;
            case 'delivery':
                if (SessionStorage.read("userType") === "EU") {
                    this.projectClickHandler("Project");
                    // SessionStorage.write('option_selected', 'delivery');

                } else {
                    history.push('/delivery');
                    // SessionStorage.write('option_selected', targetId);
                }
                SessionStorage.write('option_selected', targetId);
                break;
        }
    }

    projectClickHandler = (type) => {
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

    componentDidMount() {
        SessionStorage.write('option_selected', false);
        const { adminStore } = this.props;
        adminStore.inAdminPanel = true;
        this.expiryHandler();

    }

    render() {

        return (
            <Fragment>
                <Menu />
                <Route path="/" exact>
                <Link to="/angular/">PMO</Link>
                <div id="homelandingPage" className="container-fluid">
                    <div className="row justify-content-center">
                        {/* <div className="col-sm-8">
                            <div className="row landing-page" >
                                <div className="col-sm-6 text-center landing-page-partition">
                                    <img src={SalesImg} id="sales" onClick={this.redirectHandler} alt="Valuecockpit Sales" className="landing-page-logo" />
                                </div>
                                <div className="col-sm-6 text-center" style={{marginTop:'1%'}}>
                                    <img src={DeliveryImg} id="delivery"
                                          onClick={this.redirectHandler}
                                      alt="Valuecockpit Delivery" className="landing-page-logo" />
                                </div>
                            </div>
                        </div> */}
                        <div className="col-sm-12 leftdiv" >
                            <div className="col-sm-6 welcomediv">
                                <div>
                                    <span className="welcomeFont">Welcome!</span>
                                </div>
                                <div>
                                    <span className="displayText">
                                        Let's pursue opportunities and deliver better <br>
                                        </br>using a Value-focused approach
                                    </span>

                                </div>
                                <div className="col-sm-10 btn-row">
                                    <div className="cr-de-btn-div" style={{ paddingLeft: '0px' }}>

                                        <button
                                            id="sales"
                                            onClick={this.redirectHandler}
                                            type="submit"
                                            className="btn btn-primary"
                                            style={{ width: '150px' }}

                                        >
                                            Opportunity
           </button>

                                    </div>
                                    <div className="cr-de-btn-div">

                                        <button onClick={this.redirectHandler}
                                            id="delivery"
                                            type="submit"
                                            className="btn btn-primary"
                                            style={{ width: '160px' }}
                                        >
                                            Program Delivery
           </button>

                                    </div>
                                </div>


                            </div>
                        </div>


                    </div>


                </div>
                </Route>
                <Route path="/angular">
                <div id="angular-pmo"></div>
                </Route>
            </Fragment>
        )
    }
}

export default withRouter(LandingPage);