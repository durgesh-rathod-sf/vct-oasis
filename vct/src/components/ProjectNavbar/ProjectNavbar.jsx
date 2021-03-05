import React, { Fragment } from 'react';
import { NavLink, withRouter } from "react-router-dom";
import { routes } from '../../constants';
import "./ProjectNavbar.css";
import polygonIcon from "../../assets/project/fvdt/polygon-caret.svg";
var SessionStorage = require('store/storages/sessionStorage');

const ProjectNavbar = (props) => {
    const option = SessionStorage.read('option_selected')
    return (
        <div data-html2canvas-ignore="true" className="row project-navbar-main">
            <div className="fvdt-tab-name">
                <NavLink exact to={routes.VALUEDRIVERS} activeClassName={props.activePage === 'value_driver' ? 'active-menu' : ''}
                    className="each-anchor-tab"
                >Finalize Value Driver Tree</NavLink>
                {props.activePage === 'value_driver' ?
                    <span className="polygon-caret">
                        <img src={polygonIcon} alt=""></img>
                    </span> : ''
                }
            </div>
            <div id={props.activePage === 'value_driver' ? (props.branchTree.length > 0 && props.enableHeaders ? "" : "disableLink") : ""}
                className="dbc-tab-name">
                <NavLink to={routes.BUSINESSCASE}
                    activeClassName={props.activePage === 'develop_business_case' ? 'active-menu' : ''}
                    className="">Develop Business Case</NavLink>
                {props.activePage === 'develop_business_case' ?
                    <span className="polygon-caret">
                        <img src={polygonIcon} alt=""></img>
                    </span> : ''
                }
            </div>
            <div
                // id="disableLink"
                id={props.activePage === 'value_driver' ? props.branchTree.length > 0 && props.enableHeaders ? "" : "disableLink" : ""}
                className="dw-tab-name">
                <NavLink
                    to={routes.DEFINEWORKSTREAM}
                    activeClassName={props.activePage === 'define_workstream' ? 'active-menu' : ''}
                    className=""
                >Define Workstreams</NavLink>
                {props.activePage === 'define_workstream' ?
                    <span className="polygon-caret">
                        <img src={polygonIcon} alt=""></img>
                    </span> : ''
                }
            </div>
            {option === 'delivery' ?
                <Fragment>

                    <div id={props.activePage === 'value_driver' ? props.branchTree.length > 0 && props.enableHeaders ? "" : "disableLink" : ""}
                        className="ca-tab-name">
                        <NavLink
                            to={routes.CAPTUREACTUALS}
                            activeClassName={props.activePage === 'capture_actuals' ? 'active-menu' : ''}
                            className="ca-nav-link"
                        >Capture Actuals</NavLink>
                        {props.activePage === 'capture_actuals' ?
                            <span className="polygon-caret">
                                <img src={polygonIcon} alt=""></img>
                            </span> : ''
                        }
                    </div>
                    {/* <div
                    id="disableLink"    
                    //  id={props.activePage === 'value_driver' ? props.branchTree.length > 0 && props.enableHeaders? "" : "disableLink" : ""} className="col-sm-2 text-center"
                     >
                        <NavLink
                        to={routes.ADDINITIATIVEINFORMATION}
                            activeClassName={props.activePage === 'define_initiatives' ? 'activeMenu' : ''}
                            className="tab-vdt" style={{ padding: '0px' }}
                        >Define Initiatives</NavLink>
                    </div> */}
                </Fragment> : ''
            }

            <div id={props.activePage === 'value_driver' ? (props.branchTree.length > 0 || (props.branchTree.length)) && props.enableHeaders ? "" : "disableLink" : ""}
                className="pd-tab-name">

                <NavLink
                    to={routes.PUBLISHDASHBOARD}
                    activeClassName={props.activePage === 'publish_dashboard' ? 'active-menu' : ''}
                    className="ca-nav-link"
                >Publish Dashboard</NavLink>
                {props.activePage === 'publish_dashboard' ?
                    <span className="polygon-caret">
                        <img src={polygonIcon} alt=""></img>
                    </span> : ''
                }
            </div>


            {/* <div className="Icon_menu" style ={{marginLeft :"400px"}}> */}
            {/* <div
                    style={{ cursor: (props.loadingresponse ? "progress" : "pointer"),marginLeft :"400px" }}

                    onClick={(props.loadingresponse ? () => { } : props.publishDashboardIcon)}
                    //  activeClassName={props.activePage === 'publish_dashboard' ? 'active-menu' : ''}
                    className="">Icon</div> */}

            {/* </div> */}

        </div >


    );
}

export default withRouter(ProjectNavbar);
