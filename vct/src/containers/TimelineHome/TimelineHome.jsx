import React, { Component } from 'react';
import { observer, inject } from 'mobx-react';
import { withRouter } from "react-router-dom";
import TimeLineComponent from "../../components/TimeLineComponent/TimeLineComponent";
import "./TimelineHome.css";
import Moment from 'moment';
import { toast } from 'react-toastify';
import NotificationMessage from '../../components/NotificationMessage/NotificationMessage';

@observer
@inject('workstreamStore', 'workstreamActualsStore')
class TimelineHome extends Component {
    constructor(props) {
        super(props);
        this.state = {
            timelineDetails: "",
            disableObj: {},
            saveInprogress: false
        }
        this.onStatusChange = this.onStatusChange.bind(this);
        this.getDeliverableInfo = this.getDeliverableInfo.bind(this);
        this.calcualteDates = this.calcualteDates.bind(this);
        this.handleDateChange = this.handleDateChange.bind(this);
        this.saveActivityWSTimeLine = this.saveActivityWSTimeLine.bind(this);
    }
    componentDidMount() {
        this.fetchSelectedLevelDetails()
    }
    componentDidUpdate(PrevProps) {
        if (PrevProps.selectedWADLevelId !== this.props.selectedWADLevelId) {
            this.fetchSelectedLevelDetails()
        }

    }
    fetchSelectedLevelDetails() {
        const { selectedLevel } = this.props;
        let disableObj = {
            pSD: true,
            pED: true,
            eED: (selectedLevel === 'Deliverable' ? false : true),
            eSD: (selectedLevel === 'Deliverable' ? false : true),
            aSD: (selectedLevel === 'Deliverable' ? false : true),
            aED: (selectedLevel === 'Deliverable' ? false : true)
        }
        switch (selectedLevel) {
            case 'Workstream':
                this.getWsInfo()
                break
            case 'Activity':
                this.getActivityInfo()
                break
            case 'Deliverable':
                this.getDeliverableInfo()
                break
            default:
                break;
        }
        this.setState({
            disableObj: disableObj
        })
    }
    handleDateChange = (value, type) => {
        const { workstreamStore, selectedLevel } = this.props;
        const { disableObj } = this.state;
        let tempDisableObj = disableObj;
        switch (type) {
            case 'expStartDate':
                this.setState({
                    expStartDate: value,
                    expEndDate: ""
                })

                break
            case 'actualStartDate':
                if (value === null) {
                    tempDisableObj.eSD = false;
                    tempDisableObj.aED = true;
                    let eStartDate = (selectedLevel === 'Deliverable' && (workstreamStore.DelInfodetails.expStartDate !== "" && workstreamStore.DelInfodetails.expStartDate !== null)
                        ? new Date(workstreamStore.DelInfodetails.expStartDate) : "")
                    this.setState({
                        actualStartDate: value,
                        actualEndDate: "",
                        expStartDate: eStartDate,
                        disableObj: tempDisableObj
                    })
                }
                else {
                    tempDisableObj.eSD = (value === null ? false : true);
                    tempDisableObj.aED = false;
                    let eStartDate = ""
                    this.setState({
                        actualStartDate: value,
                        actualEndDate: "",
                        expStartDate: eStartDate,
                        disableObj: tempDisableObj
                    })
                }

                break
            case 'expEndDate':
                this.setState({
                    expEndDate: value,
                })

                break
            case 'actualEndDate':
                if (value === null) {
                    tempDisableObj.eED = false;
                    let eEndDate = (selectedLevel === 'Deliverable' && (workstreamStore.DelInfodetails.expEndDate !== "" && workstreamStore.DelInfodetails.expEndDate !== null)
                        ? new Date(workstreamStore.DelInfodetails.expEndDate) : "")
                    this.setState({
                        actualEndDate: value,
                        expEndDate: eEndDate,
                        disableObj: tempDisableObj
                    })
                }
                else {
                    tempDisableObj.eED = true;
                    let eEndDate = ""
                    this.setState({
                        actualEndDate: value,
                        expEndDate: eEndDate,
                        disableObj: tempDisableObj
                    })
                }

                break
            default:
                break;
        }

    }
    onStatusChange = (event) => {
        const { timelineDetails, } = this.state;
        const { workstreamActualsStore } = this.props;
        let value = event.target.value,
            tempObj = timelineDetails;
        tempObj.status = value;
        workstreamActualsStore.statusNotes = value;
        this.setState({
            timelineDetails: tempObj
        })


    }
    getWsInfo() {
        const { workstreamStore } = this.props;
        const wsID =
            // 109
            this.props.selectedWADLevelId;
        let details = false

        workstreamStore.fetchWsGenInfo(wsID, "timeLine")
            .then((res) => {
                if (res !== false && !res.error) {
                    details = res;
                    this.calcualteDates(res);
                } else {
                    details = false
                }

                this.setState({
                    timelineDetails: details,
                })
            })
    }
    getActivityInfo() {
        const { workstreamStore } = this.props;
        const actId =
            // 109
            this.props.selectedWADLevelId;
        let details = false

        workstreamStore.getWSActivity(actId, "timeLine")
            .then((res) => {
                if (!res.error && res.data.resultCode === "OK") {
                    details = res.data.resultObj;
                    this.calcualteDates(details);
                } else {
                    details = false
                }

                this.setState({
                    timelineDetails: details,
                })
            })
    }
    getDeliverableInfo() {
        const { workstreamStore } = this.props;
        const DelId =
            this.props.selectedWADLevelId;
        // 157;
        let details = false;
        workstreamStore.fetchWsDeliverableDetails(DelId, "timeLine")
            .then((res) => {
                if (!res.error && res.data.resultCode === "OK") {
                    details = res.data.resultObj
                    this.calcualteDates(details);
                } else {
                    details = false
                }


            })

    }

    calcualteDates(details) {
        const { selectedLevel } = this.props;
        const { disableObj } = this.state;
        let tempDisableObj = disableObj;
        let { pSDate, pEDate, eEDate, eSDate, aSDate, aEDate } = "";
        pSDate = (details.startDate === "" || details.startDate === null ? "" : new Date(details.startDate));
        pEDate = (details.endDate === "" || details.endDate === null ? "" : new Date(details.endDate));
        eEDate = (details.expEndDate === "" || details.expEndDate === null ? "" : new Date(details.expEndDate));
        eSDate = (details.expStartDate === "" || details.expStartDate === null ? "" : new Date(details.expStartDate));
        aSDate = (details.actualStartDate === "" || details.actualStartDate === null ? "" : new Date(details.actualStartDate));
        aEDate = (aSDate === "" ? "" :
            details.actualEndDate === "" || details.actualEndDate === null ? "" : new Date(details.actualEndDate)
        );
        tempDisableObj.aED = (selectedLevel === 'Deliverable' ? (aSDate === "" ? true : false) : true);
        tempDisableObj.eED = (selectedLevel === 'Deliverable' ? (aEDate !== "" ? true : false) : true);
        eEDate = (selectedLevel === 'Deliverable' && aEDate !== "" ? "" : eEDate);
        tempDisableObj.eSD = (selectedLevel === 'Deliverable' ? (aSDate !== "" ? true : false) : true);
        eSDate = (selectedLevel === 'Deliverable' && aSDate !== "" ? "" : eSDate);
        this.setState({
            timelineDetails: details,
            pStartDate: pSDate,
            pEndDate: pEDate,
            expEndDate: eEDate,
            expStartDate: eSDate,
            actualEndDate: aEDate,
            actualStartDate: aSDate,
            disableObj: tempDisableObj
        })
    }
    buildPayload = (selectedLevel) => {
        const { selectedWADLevelId } = this.props;
        const { timelineDetails, actualStartDate, actualEndDate, expStartDate, expEndDate, } = this.state;
        let selectedStatus = timelineDetails.status;

        let id = selectedWADLevelId;
        let payload = {}
        switch (selectedLevel) {
            case 'Workstream':
                payload = {
                    "wsId": id,
                    "status": selectedStatus
                }
                break
            case 'Activity':
                payload = {
                    "activityId": id,
                    "status": selectedStatus
                }
                break
            case 'Deliverable':
                payload = {
                    "deliverableId": id,
                    "activityId": timelineDetails.activityId,
                    "actualStartDate": (actualStartDate === "" || actualStartDate === null ? "" : Moment(actualStartDate).format('YYYY-MM-DD')),
                    "actualEndDate": (actualEndDate === "" || actualEndDate === null ? "" : Moment(actualEndDate).format('YYYY-MM-DD')),
                    "expStartDate": (expStartDate === "" || expStartDate === null ? "" : Moment(expStartDate).format('YYYY-MM-DD')),
                    "expEndDate": (expEndDate === "" || expEndDate === null ? "" : Moment(expEndDate).format('YYYY-MM-DD')),
                    "status": selectedStatus
                }
                break
            default:
                break;
        }
        return payload;

    }
    saveActivityWSTimeLine = () => {
        const { workstreamActualsStore, selectedLevel } = this.props;

        let payload = this.buildPayload(selectedLevel)
        this.setState({
            saveInprogress: true
        })
        workstreamActualsStore.saveActivityWrokstreamTimeline(payload, selectedLevel)
            .then((res) => {
                if (res && res.data.resultCode === "OK") {
                    this.fetchSelectedLevelDetails()
                    this.showNotification("Timeline details saved successfully", "Success", "success");
                    this.setState({
                        saveInprogress: false
                    })
                }
                else {
                    this.showNotification((res.data.resultDescription || res.data.errorDescription), "Error", "error");
                    this.setState({
                        saveInprogress: false
                    })

                }
            })


    }
    showNotification = (message, title, type) => {
        if (type === 'error') {
            toast.error(<NotificationMessage
                title={title}
                bodytext={message}
                icon={type}
            />, {
                position: toast.POSITION.BOTTOM_RIGHT
            });
        }
        if (type === 'success') {
            toast.info(<NotificationMessage
                title={title}
                bodytext={message}
                icon={type}
            />, {
                position: toast.POSITION.BOTTOM_RIGHT
            });
        }

    }


    render() {
        const { timelineDetails, pStartDate, pEndDate, expEndDate, expStartDate, actualEndDate, actualStartDate, disableObj, saveInprogress } = this.state;
        return (
            <div className="timeline_mainDiv"
                style={{ overflowX: (this.props.isExpandBenefits !== true ? "unset" : "unset") }}>
                <TimeLineComponent
                    isExpandBenefits={this.props.isExpandBenefits}
                    selectedLevel={this.props.selectedLevel}
                    timelineDetails={timelineDetails}
                    onStatusChange={this.onStatusChange}
                    saveInprogress={saveInprogress}
                    pStartDate={pStartDate}
                    pEndDate={pEndDate}
                    expEndDate={expEndDate}
                    expStartDate={expStartDate}
                    actualEndDate={actualEndDate}
                    actualStartDate={actualStartDate}
                    disableObj={disableObj}
                    handleDateChange={this.handleDateChange}
                    saveActivityWSTimeLine={this.saveActivityWSTimeLine}
                />

            </div>
        )
    }
}

export default withRouter(TimelineHome);