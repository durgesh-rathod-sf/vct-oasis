import React, { Component, Fragment } from 'react';
import { withRouter } from "react-router-dom";
import { inject, observer } from 'mobx-react';
import ReactTooltip from 'react-tooltip';
import './DashboardMain.css';
import ValueTrackingTabs from "./ValueTrackingTabs";
import tableauIcon from "../../assets/publishDashboard/tableau.svg";
import downloadIco from "../../assets/project/fvdt/download.svg";
import uploadIcon from "../../assets/project/fvdt/upload.svg";
import { toast } from 'react-toastify';
import NotificationMessage from '../../components/NotificationMessage/NotificationMessage';
import ValueArchitectingTabs from "./ValueArchitectingTabs"
var SessionStorage = require('store/storages/sessionStorage')
@inject('dashboardStore','publishDashboardStore')
@observer
class DashboardNavbar extends Component {
    constructor(props) {
        super(props);

        this.state = {
          selectedPage: "valueArchitecting",
            selectedpage: '',
            downloadstarted: false
        }
    }

    setSelectedPage(val) {
        this.setState({
            selectedpage: val
        })
    }

    handleClick(type) {
        this.setState({
            selectedPage: type
        });
        //this.props.selectedPage(type)
    }

    downloadDashboard = (event) => {
        const { dashboardStore,publishDashboardStore } = this.props;
        this.setState({ downloadstarted: true });
        dashboardStore.downloadTableauFile(publishDashboardStore.url)
            .then((res) => {
                if (!res || res.error) {
                    this.showNotification('downloadError');
                }
                this.setState({ downloadstarted: false });
            })
    }

    showNotification(type) {
        switch (type) {
            case 'downloadError':
                toast.error(<NotificationMessage
                    title="Error"
                    bodytext={'Error in downloading the template'}
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
        const { selectedWorkstreamTab, allWorkstreamsList, selectedPage, downloadstarted } = this.state;
        let option = SessionStorage.read('option_selected');
        const {publishDashboardStore}=this.props;

        return (

            <div className="tab-content-outer-wrapper " id="publishDashboard">

                <div className="row tab navMenu" >

                    <ul className="nav nav-tabs tab_menu" style={{ width: option === "delivery" ? "30%" : "15%" }}>
                        <li style={{ width: option === "delivery" ? "50%" : "100%" }}
                            className={this.state.selectedPage === 'valueArchitecting' ? "active" : ""} data-toggle="tab" onClick={() => this.handleClick('valueArchitecting')}>Value Architecting</li>
                        {option === 'delivery' ?
                            <li className={this.state.selectedPage === 'valueTracking' ? "active" : ""} data-toggle="tab" onClick={() => this.handleClick('valueTracking')} >Value Tracking</li>
                            : ''}

                    </ul>
                    {/* <div style ={{  display: "flex", borderBottom : "1px solid rgba(255, 255, 255, 0.5) !important"}}></div> */}
                    <div className="Icon_menu" style={{ width: option === "delivery" ? "70%" : "85%" }}>
                        {publishDashboardStore.url===''?
                        <div>
                        <span data-for="downloadIcon"
                            data-place="left"
                            data-tip="">
                            <img disabled onClick={() => { }} src={downloadIco} style={{ cursor: "default", paddingRight: '10px',opacity:'0.5' }}/>
                        </span>
                        <ReactTooltip id="downloadIcon">Extracting data ...</ReactTooltip>
                        </div>:
                        <div>
                        <span data-for="downloadIcon"
                            data-place="left"
                            data-tip="">
                            {!downloadstarted  ? <img disabled onClick={downloadstarted ? () => { } : (event) => this.downloadDashboard(event)} src={downloadIco} style={{ cursor: (downloadstarted ? "default" : "pointer"), paddingRight: '10px' }}/> :
                                <div className="row download-icon"><img disabled src={downloadIco} style={{ cursor: (downloadstarted ? "default" : "pointer"), position: 'absolute', opacity: '0.4', paddingLeft: '5px' }} /><span className="spinner-icon">
                                    <i className="fa fa-spinner fa-spin" style={{ fontSize: '18px', color: '#ffffff', height: "min-content" }}></i>
                                </span></div>}
                        </span>
                        <ReactTooltip id="downloadIcon">{downloadstarted ? '' : 'Extract data to Excel'}</ReactTooltip>
                        </div>}
                        <div
                            style={{ cursor: (this.props.loadingresponse ? "progress" : "pointer") }}

                            onClick={(this.props.loadingresponse ? () => { } : this.props.publishDashboardIcon)}
                            //  activeClassName={props.activePage === 'publish_dashboard' ? 'active-menu' : ''}
                            className="">  <span data-for="tableau"
                                data-place="left"
                                data-tip=""><img src={tableauIcon} style={{ cursor: (this.props.loadingresponse ? "progress" : "pointer"), paddingRight: '10px' }} />
                            </span>
                            <ReactTooltip id="tableau">Launch Tableau Reports</ReactTooltip>

                        </div>

                    </div>

                </div>

                {selectedPage && selectedPage === "valueTracking" ?
                    <div style={{ width: "100%", position: "relative" }}>

                        <ValueTrackingTabs />
                    </div> : ""}

                {selectedPage && selectedPage === "valueArchitecting" ?
                    <div style={{ width: "100%", position: "relative" }}>
                        <ValueArchitectingTabs />

                    </div> : ""}
            </div>
        )
    }
}

export default withRouter(DashboardNavbar);