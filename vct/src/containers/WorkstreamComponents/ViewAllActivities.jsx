import React, { Component } from 'react';
import { withRouter } from "react-router-dom";
import { observer } from 'mobx-react';
import ActivityDetailsModal from './ActivityModal/ActivityDetailsModal'
import { inject } from 'mobx-react';
import { toast } from 'react-toastify';
import ReactTooltip from 'react-tooltip';

import './ViewAllActivities.css';
import NotificationMessage from '../../components/NotificationMessage/NotificationMessage';
import CustomConfirmModal from '../../components/CustomConfirmModal/CustomConfirmModal';
import trashIcon from '../../assets/project/viewDeals/trash-delete-icon.svg';
var SessionStorage = require('store/storages/sessionStorage');

@inject('workstreamStore')
class ViewAllActivities extends Component {
    constructor(props) {
        super(props);

        this.state = {
            allActivitiesArray: [],
            selectedViewIcon: '',
            modalVisible: false,
            actName: "",
            activityId: '',
            deleteActModalVisible: '',
            deleteActModalTitle: '',
            deleteActIndex: '',
        };

        this.openActivityLayer = this.openActivityLayer.bind(this);
        this.deleteActivity = this.deleteActivity.bind(this);
        this.modalCloseHandler = this.modalCloseHandler.bind(this);
        this.isDefined = this.isDefined.bind(this);
    }

    componentDidMount() {
        const { selectedViewIcon, allActivitiesList } = this.props;
        const activitiesArray = [...allActivitiesList];
        this.setState({
            selectedViewIcon: selectedViewIcon,
            allActivitiesArray: activitiesArray
        });


    }

    componentDidUpdate(prevProps, prevState) {
        if (prevProps.allActivitiesList !== this.props.allActivitiesList ||
            prevProps.selectedViewIcon !== this.props.selectedViewIcon) {
            this.test()
        }
    }
    test() {
        const { selectedViewIcon, allActivitiesList } = this.props;
        const activitiesArray = [...allActivitiesList];
        this.setState({
            selectedViewIcon: selectedViewIcon,
            allActivitiesArray: activitiesArray
        }, () => {
            ReactTooltip.rebuild();
        });
    }

    openActivityLayer = (actObj, actIndex) => {
        this.setState({
            modalVisible: true,
            actName: actObj.name,
            activityId: actObj.activityId
        });
    }

    openDeleteActConfirmModal = (title, actInd) => {
        this.setState({
            deleteActModalVisible: true,
            deleteActModalTitle: title,
            deleteActIndex: actInd
        });

    }

    closeDeleteActConfirmModal = (isYesClicked) => {
        this.setState({
            deleteActModalVisible: false,
            deleteActModalTitle: ''
        }, () => {
            ReactTooltip.rebuild();
        });
        if (isYesClicked) {
            //new delete function
            this.deleteActivityOnConfirm();
        } else {
            this.setState({
                deleteActIndex: ''
            });

        }

    }

    deleteActivityOnConfirm = () => {
        const { workstreamStore } = this.props;
        const { allActivitiesArray, deleteActIndex } = this.state;
        const actIndex = deleteActIndex;
        const wsActivitiesArray = [...allActivitiesArray];
        const actId = wsActivitiesArray[actIndex].activityId;

        workstreamStore.deleteActivity(actId)
            .then((res) => {
                if (!res.error && res.data.resultCode === 'OK') {

                    wsActivitiesArray.splice(actIndex, 1);
                    this.setState({
                        allActivitiesArray: wsActivitiesArray
                    });
                    this.props.fetchAllWsDetails();
                    this.showErrorNotification("Activity Deleted successfully", "Success", "success");

                } else if (!res.error && res.data.resultCode === 'KO') {
                    this.showErrorNotification(res.data.resultDescription, "Error", "error");
                    console.log('error in Delete: ' + res.data.errorDescription);
                } else {
                    this.showErrorNotification("Sorry! Something went wrong", "Error", "error");
                    console.log('error: something went wrong in SAVE');
                }
            });

    }

    deleteActivity = (e, actIndex) => {
        const { workstreamStore } = this.props;
        const { allActivitiesArray } = this.state;
        const wsActivitiesArray = [...allActivitiesArray];
        const actId = wsActivitiesArray[actIndex].activityId;
        const confirmMsg = 'Deleting the activity will delete all the associated deliverables. Do you want to continue?';
        if (this.isDefined(actId)) {
            this.openDeleteActConfirmModal(confirmMsg, actIndex);

        }
    }

    isDefined = (value) => {
        return value !== undefined && value !== null;
    }

    showErrorNotification = (message, title, type) => {
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

    modalCloseHandler = () => {
        this.setState({
            modalVisible: false
        });
    }

    render() {

        const { selectedViewIcon, allActivitiesArray } = this.state;
        return (
            <div className="view-acti-main-div">
                {selectedViewIcon === 'list_view' ?
                    <div className="view-all-act-tab">
                        {allActivitiesArray && allActivitiesArray.length > 0 ?
                            allActivitiesArray.map((act, actIndex) => (
                                <div key={Math.random()} className="activity-binder">
                                    <div className="view-activity row">
                                        <div className="col-md-7">
                                            <div className="activity-name">
                                                <label onClick={(e) => { this.openActivityLayer(act, actIndex) }}>{act.name}</label>
                                            </div>
                                        </div>
                                        <div className="col-md-4">
                                            <div className="deliverables-counter">
                                                <label>No. of Deliverables:</label> {act.delCount}
                                            </div>
                                        </div>
                                        <div className="col-md-1 text-right">
                                            <img className="trash-img" src={trashIcon} alt="delete"
                                                data-tip="Delete Activity" data-type="dark" data-place="left"
                                                style={{ cursor: SessionStorage.read("accessType") === "Read" ? "not-allowed" : 'pointer' }}
                                                onClick={(e) => SessionStorage.read("accessType") === "Read" ? 'return false;' : this.deleteActivity(e, actIndex)}></img>
                                            <ReactTooltip html={true} />
                                        </div>
                                    </div>
                                </div>
                            )) :
                            <div className="no-act-div">There are No Activities created.</div>
                        }
                    </div>
                    : selectedViewIcon === 'grid_view' ?
                        <div className="view-all-act-grid-tab row">
                            {allActivitiesArray && allActivitiesArray.length > 0 ?
                                allActivitiesArray.map((act, actIndex) => (
                                    <div key={Math.random()} className="view-activity-grid col-md-2">
                                        <div className="grid-holder">
                                            <div className="row no-gutters">

                                                <div className="col-md-11">

                                                </div>
                                                <div className="col-md-1 text-right">
                                                    <img className="trash-img" src={trashIcon} alt="delete"
                                                        data-tip="Delete Activity" data-type="dark"
                                                        style={{ cursor: SessionStorage.read("accessType") === "Read" ? "not-allowed" : 'pointer' }}
                                                        onClick={(e) => SessionStorage.read("accessType") === "Read" ? 'return false;' : this.deleteActivity(e, actIndex)}></img>
                                                    <ReactTooltip html={true}></ReactTooltip>
                                                </div>
                                            </div>
                                            <div className="col-md-12 act-name-grid">
                                                <div className="activity-name">
                                                    <label onClick={(e) => { this.openActivityLayer(act, actIndex) }}>{act.name}</label>
                                                </div>
                                            </div>

                                            <div className="col-md-12 grid-delivery">
                                                <div className="deliverables-counter">
                                                    <label>No. of Deliverables:</label> {act.delCount}
                                                </div>
                                            </div>
                                        </div>

                                    </div>
                                )) :
                                <div className="no-act-div">There are No Activities created.</div>
                            }
                        </div>
                        : ''

                }

                {this.state.modalVisible && this.state.modalVisible === true ?
                    <ActivityDetailsModal modalCloseHandler={this.modalCloseHandler}
                        title={this.state.actName} visible={this.state.modalVisible}
                        activityId={this.state.activityId}></ActivityDetailsModal> : ''
                }
                <CustomConfirmModal
                    ownClassName={'ws-act-delete-modal'}
                    isModalVisible={this.state.deleteActModalVisible}
                    modalTitle={this.state.deleteActModalTitle}
                    closeConfirmModal={this.closeDeleteActConfirmModal}
                />
            </div>

        )
    }
}

export default withRouter(ViewAllActivities);