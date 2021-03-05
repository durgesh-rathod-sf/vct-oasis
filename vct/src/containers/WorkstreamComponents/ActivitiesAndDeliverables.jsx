import React, { Component, Fragment } from 'react';
import { withRouter } from "react-router-dom";
import { inject } from 'mobx-react';
import { toast } from 'react-toastify';
import ReactTooltip from 'react-tooltip';
import ActivityDetailsModal from './ActivityModal/ActivityDetailsModal'
import './ActivitiesAndDeliverables.css';
import ownerIcon from "../../assets/project/workstream/person_1.png";
import circPlusIcon from "../../assets/project/iActuals/add-plus-circle.svg";
import trashIcon from '../../assets/project/viewDeals/trash-delete-icon.svg';
import ellipsisVIcon from '../../assets/project/workstream/ellipsis-v.svg';
import NotificationMessage from '../../components/NotificationMessage/NotificationMessage';
import CustomConfirmModal from '../../components/CustomConfirmModal/CustomConfirmModal';
import DeliverableDetailsModal from './DeliverableDetailsModal';
var SessionStorage = require('store/storages/sessionStorage');

@inject('workstreamStore')
class ActivitiesAndDeliverables extends Component {
    constructor(props) {
        super(props);
        this.state = {
            isInputEnabled: false,
            activityName: '',
            allWsActivitiesList: [],
            actName: "",
            activityId: "",
            // allWsDeliverables: []
            isDelModalVisible: false,
            selectedDelId: '',
            selectedDelName: '',
            deleteActModalVisible: '',
            deleteActModalTitle: '',
            deleteActIndex: '',
            deleteDelModalVisible: '',
            deleteDelModalTitle: '',
            deleteDelActIndex: '',
            deleteDelIndex: ''
        };

        this.isDefined = this.isDefined.bind(this);
        this.fetchWsOverviewDetails = this.fetchWsOverviewDetails.bind(this);

        // add activity related functions
        this.makeAddActInputHandler = this.makeAddActInputHandler.bind(this);
        this.handleKeyDownAddAct = this.handleKeyDownAddAct.bind(this);
        this.updateAddActName = this.updateAddActName.bind(this);
        this.saveAddActivityHandler = this.saveAddActivityHandler.bind(this);
        this.saveWsActivityApi = this.saveWsActivityApi.bind(this);

        // functions for viewing/saving/deleting previously saved activities
        this.makeActivityInputHandler = this.makeActivityInputHandler.bind(this);
        this.handleKeyDownAct = this.handleKeyDownAct.bind(this);
        this.saveActivityNameHandler = this.saveActivityNameHandler.bind(this);
        this.deleteActivityHandler = this.deleteActivityHandler.bind(this);
        this.openActivityLayer = this.openActivityLayer.bind(this);
        this.modalCloseHandler = this.modalCloseHandler.bind(this);


    }

    componentDidMount() {

        this.fetchWsOverviewDetails()

    }

    componentDidUpdate(prevProps, prevState) {
        if (prevProps.wsId !== this.props.wsId) {
            this.test()
        }
    }
    test() {

    }

    modalCloseHandler = () => {
        this.setState({
            modalVisible: false,
            actName: '',
            activityId: ''
        }, () => {
            ReactTooltip.rebuild();
        });
    }
    openActivityLayer = (act, index) => {
        console.log("activityId", act, act.activityId);
        this.setState({
            modalVisible: true,
            actName: act.activity.name,
            activityId: act.activity.activityId
        });
    }
    fetchWsOverviewDetails() {
        const { wsId, workstreamStore } = this.props;
        workstreamStore.fetchWsOverview(wsId)
            .then(response => {

                if (response && response.data) {
                    if (!response.error && response.data.resultCode === "OK") {
                        const actList = response.data.resultObj.activities;
                        this.buildActivitiesToState(actList);
                    } else {
                        console.log('response.data.errorDescription');
                    }
                } else {
                    this.showErrorNotification("Sorry! Something went wrong", "Error", "error");
                    console.log('error: something went wrong in SAVE');
                }

            });

    }

    buildActivitiesToState = (actList) => {
        const activitiesArr = [];

        actList.map((act, ind) => {
            const deliverablesArr = [];
            const deliArr = [...act.deliverables];
            deliArr.map((del, delIndex) => {
                const delObj = {
                    'isInputEnabled': false,
                    'deliverable': del
                }
                deliverablesArr.push(delObj);
            });
            act.deliverables = deliverablesArr;
            const activitiesObj = {
                'isInputEnabled': false,
                'addDeliverable': {
                    'isInputEnabled': false,
                    'deliverableName': ''
                },
                'activity': act
            }
            activitiesArr.push(activitiesObj);
        });

        this.setState({
            allWsActivitiesList: activitiesArr
        });
    }


    // ----------- START of add activitiy related functions ----------

    makeAddActInputHandler = (e) => {
        this.setState({
            isInputEnabled: true
        });
    }

    handleKeyDownAddAct = (e) => {
        if (e.key === 'Enter') {
            this.saveAddActivityHandler(e);
        }
    }

    updateAddActName = (event) => {
        const actName = event.target.value;
        this.setState({
            activityName: actName
        });
    }

    saveAddActivityHandler = (event) => {
        const { wsId } = this.props;
        const { activityName } = this.state;
        const payloadObj = {
            "mapId": SessionStorage.read('mapId'),
            "wsId": '' + wsId,
            "activityName": activityName.trim(),
            "label": 'Y'
        }
        if (activityName.length > 0 && !RegExp(/[<>!'"[\]]/).test(activityName)) {
            this.saveWsActivityApi(payloadObj);
        } else {
            this.setState({
                activityName: '',
                isInputEnabled: false
            });
            this.showErrorNotification("Please enter the valid non-empty activity name. Special characters [ < ! ' \" > ] are invalid", "Error", "error");
        }
    }

    saveWsActivityApi(payloadObj) {
        const { workstreamStore } = this.props;
        workstreamStore.saveActivityDetails(payloadObj)
            .then(response => {
                if (response && !response.error && response.data.resultCode === 'OK') {

                    this.fetchWsOverviewDetails();
                    this.setState({
                        activityName: '',
                        isInputEnabled: false
                    });
                    this.showErrorNotification("New Activity added successfully", "Success", "success");

                } else if (response && !response.error && response.data.resultCode === 'KO') {
                    console.log(response.data.errorDescription);
                    this.showErrorNotification(response.data.errorDescription, "Error", "error");
                } else {
                    this.showErrorNotification("Sorry! Something went wrong", "Error", "error");
                    console.log('error: something went wrong in SAVE');
                }
            });
    }

    // ----------- END of add activitiy related functions ----------


    // ----------- START of viewing/adding/deleting all activities related functions ----------
    makeActivityInputHandler = (e, actIndex) => {
        const { allWsActivitiesList } = this.state;
        allWsActivitiesList[actIndex].isInputEnabled = true;
        this.setState({
            allWsActivitiesList: allWsActivitiesList
        });
    }

    handleKeyDownAct = (event, actIndex) => {
        if (event.key === 'Enter') {
            this.saveActivityNameHandler(event, actIndex);
        }
    }

    saveActivityNameHandler = (event, actIndex) => {
        const { allWsActivitiesList } = this.state;
        const { wsId, workstreamStore } = this.props;
        const ActName = event.target.value;
        const activitiesArr = [...allWsActivitiesList];
        if (ActName.length > 0 && !RegExp(/[<>!'"[\]]/).test(ActName)) {
            const payloadObj = {
                "mapId": SessionStorage.read('mapId'),
                "wsId": '' + wsId,
                "activityName": ActName.trim(),
                "activityId": activitiesArr[actIndex].activity.activityId,
                "label": 'Y'
            }
            workstreamStore.saveActivityDetails(payloadObj)
                .then(response => {
                    if (response && !response.error && response.data.resultCode === 'OK') {

                        // activitiesArr[actIndex].activity.name = ActName;
                        // activitiesArr[actIndex].isInputEnabled = true;                        
                        // this.setState({
                        //     allWsActivitiesList: activitiesArr
                        // });

                        this.fetchWsOverviewDetails();
                        this.showErrorNotification("Activity name saved successfully", "Success", "success");

                    } else if (response && !response.error && response.data.resultCode === 'KO') {
                        console.log(response.data.errorDescription);
                        this.showErrorNotification(response.data.errorDescription, "Error", "error");
                    } else {
                        this.showErrorNotification("Sorry! Something went wrong", "Error", "error");
                        console.log('error: something went wrong in SAVE');
                    }
                });
        } else {
            this.showErrorNotification("Please enter the valid non-empty activity name. Special characters [ < ! ' \" > ] are invalid", "Error", "error");
            console.log('error: Activity name should not be empty');
        }


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
        });
        if (isYesClicked) {
            //new delete function
            this.deleteActivityHandler();
        } else {
            this.setState({
                deleteActIndex: ''
            });

        }

    }

    deleteActivityonConfirm = (event, actIndex) => {
        const { workstreamStore } = this.props;
        const { allWsActivitiesList } = this.state;

        const wsActivitiesArray = [...allWsActivitiesList];
        const actId = wsActivitiesArray[actIndex].activity.activityId;
        const confirmMsg = 'Deleting the activity will delete all the associated deliverables. Do you want to continue?';
        if (this.isDefined(actId)) {
            this.openDeleteActConfirmModal(confirmMsg, actIndex);
        }

    }

    deleteActivityHandler = () => {
        const { workstreamStore } = this.props;
        const { allWsActivitiesList, deleteActIndex } = this.state;
        const actIndex = deleteActIndex;
        const wsActivitiesArray = [...allWsActivitiesList];
        const actId = wsActivitiesArray[actIndex].activity.activityId;


        workstreamStore.deleteActivity(actId)
            .then((res) => {
                if (!res.error && res.data.resultCode === 'OK') {
                    // this.fetchWsOverviewDetails();
                    wsActivitiesArray.splice(actIndex, 1);
                    this.setState({
                        allWsActivitiesList: wsActivitiesArray
                    });
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
    // ----------- END of viewing/adding/deleting all activities related functions ----------


    // ------ START of Add Deliverable Functions --------//
    makeAddDelInputHandler = (e, actIndex) => {
        const { allWsActivitiesList } = this.state;
        allWsActivitiesList[actIndex].addDeliverable.isInputEnabled = true;
        this.setState({
            allWsActivitiesList: allWsActivitiesList
        });
    }

    updateAddDelName = (e, actIndex) => {
        const { allWsActivitiesList } = this.state;
        const addDelName = e.target.value;
        allWsActivitiesList[actIndex].addDeliverable.deliverableName = addDelName;
        this.setState({
            allWsActivitiesList: allWsActivitiesList
        });

    }

    handleKeyDownAddDel = (e, del, actIndex) => {
        if (e.key === 'Enter') {
            this.saveAddDeliverableName(del, actIndex);
        }
    }

    saveAddDeliverableName = (del, actIndex) => {
        const { workstreamStore } = this.props;
        const { allWsActivitiesList } = this.state;
        const addDelName = del;

        if (addDelName.length > 0 && !RegExp(/[<>!'"[\]]/).test(addDelName)) {
            const payloadObj = {
                "mapId": SessionStorage.read('mapId'),
                "activityId": '' + allWsActivitiesList[actIndex].activity.activityId,
                "name": addDelName.trim(),
                "label": 'Y'
            }
            workstreamStore.saveDeliverableDetails(payloadObj)
                .then(response => {
                    if (response && !response.error && response.data.resultCode === 'OK') {

                        this.fetchWsOverviewDetails();

                        this.showErrorNotification("New Deliverable Added Successfully", "Success", "success");

                    } else if (response && !response.error && response.data.resultCode === 'KO') {
                        console.log(response.data.errorDescription);
                        this.showErrorNotification(response.data.errorDescription, "Error", "error");
                    } else {
                        this.showErrorNotification("Sorry! Something went wrong", "Error", "error");
                        console.log('error: something went wrong in SAVE');
                    }
                });
        } else {
            allWsActivitiesList[actIndex].addDeliverable.isInputEnabled = false;
            allWsActivitiesList[actIndex].addDeliverable.deliverableName = '';
            this.setState({
                allWsActivitiesList: allWsActivitiesList
            });
            this.showErrorNotification("Please enter the valid non-empty deliverable name. Special characters [ < ! ' \" > ] are invalid", "Error", "error");
        }
    }
    // ------ END of Add Deliverable Functions --------//


    // ------ START of viewing/adding/deleting all Deliverables Functions --------//
    makeDelInputHandler = (e, actIndex, delIndex) => {
        const { allWsActivitiesList } = this.state;
        allWsActivitiesList[actIndex].activity.deliverables[delIndex].isInputEnabled = true;
        this.setState({
            allWsActivitiesList: allWsActivitiesList
        });

    }

    handleKeyDownDel = (e, actIndex, delIndex) => {
        if (e.key === 'Enter') {
            this.saveDeliverableName(e, actIndex, delIndex);
        }
    }

    saveDeliverableName = (e, actIndex, delIndex) => {
        const { workstreamStore } = this.props;
        const { allWsActivitiesList } = this.state;
        const delivName = e.target.value;
        const payloadObj = {
            "mapId": SessionStorage.read('mapId'),
            "activityId": '' + allWsActivitiesList[actIndex].activity.activityId,
            "deliverableId": '' + allWsActivitiesList[actIndex].activity.deliverables[delIndex].deliverable.deliverableId,
            "name": delivName.trim(),
            "label": 'Y'
        }
        if (delivName.length > 0 && !RegExp(/[<>!'"[\]]/).test(delivName)) {
            workstreamStore.saveDeliverableDetails(payloadObj)
                .then(response => {
                    if (response && !response.error && response.data.resultCode === 'OK') {
                        this.fetchWsOverviewDetails();
                        this.showErrorNotification("Deliverable name saved successfully", "Success", "success");

                    } else if (response && !response.error && response.data.resultCode === 'KO') {
                        console.log(response.data.errorDescription);
                        this.showErrorNotification(response.data.errorDescription, "Error", "error");
                    } else {
                        this.showErrorNotification("Sorry! Something went wrong", "Error", "error");
                        console.log('error: something went wrong in SAVE');
                    }
                });
        } else {
            this.showErrorNotification("Please enter the valid non-empty deliverable name. Special characters [ < ! ' \" > ] are invalid", "Error", "error");
            console.log('error: Deliverable name should not be empty');
        }
    }

    openDeleteDelConfirmModal = (title, actInd, delInd) => {
        this.setState({
            deleteDelModalVisible: true,
            deleteDelModalTitle: title,
            deleteDelActIndex: actInd,
            deleteDelIndex: delInd
        });
    }

    closeDeleteDelConfirmModal = (isYesClicked) => {
        this.setState({
            deleteDelModalVisible: false,
            deleteDelModalTitle: ''
        });
        if (isYesClicked) {
            //new delete function
            this.deleteDeleverableOnConfirm();
        } else {
            this.setState({
                deleteDelIndex: '',
                deleteDelActIndex: ''
            });

        }

    }

    deleteDeleverableOnConfirm = () => {
        const { workstreamStore } = this.props;
        const { allWsActivitiesList, deleteDelIndex, deleteDelActIndex } = this.state;
        const delIndex = deleteDelIndex;
        const actIndex = deleteDelActIndex;
        const wsActivitiesArray = [...allWsActivitiesList];
        const delId = wsActivitiesArray[actIndex].activity.deliverables[delIndex].deliverable.deliverableId;
        workstreamStore.deleteDeliverable(delId)
            .then((res) => {
                if (!res.error && res.data.resultCode === 'OK') {
                    // this.fetchWsOverviewDetails();
                    wsActivitiesArray[actIndex].activity.deliverables.splice(delIndex, 1);
                    this.setState({
                        allWsActivitiesList: wsActivitiesArray
                    })
                    this.showErrorNotification("Deliverable Deleted successfully", "Success", "success");

                } else if (!res.error && res.data.resultCode === 'KO') {
                    this.showErrorNotification(res.data.resultDescription, "Error", "error");
                    console.log('error in Delete: ' + res.data.errorDescription);
                } else {
                    this.showErrorNotification("Sorry! Something went wrong", "Error", "error");
                    console.log('error: something went wrong in SAVE');
                }
            });

    }

    deleteDeliverableHandler = (e, actIndex, delIndex) => {

        const { allWsActivitiesList } = this.state;
        const wsActivitiesArray = [...allWsActivitiesList];
        const delId = wsActivitiesArray[actIndex].activity.deliverables[delIndex].deliverable.deliverableId;
        const confirmMsg = 'Are you sure you want to delete the deliverable?';

        if (this.isDefined(delId)) {
            this.openDeleteDelConfirmModal(confirmMsg, actIndex, delIndex);
        }
    }

    openDeliverableModal = (e, delObj) => {
        if (this.isDefined(delObj.deliverableId)) {
            this.setState({
                isDelModalVisible: true,
                selectedDelName: delObj.name,
                selectedDelId: delObj.deliverableId
            });
        }

    }

    closeDelModal = (param) => {
        this.setState({
            isDelModalVisible: false,
            selectedDelId: '',
            selectedDelName: ''
        });
        this.fetchWsOverviewDetails();
    }
    // ------ END of viewing/adding/deleting all Deliverables Functions --------//


    // ----- START of Utility functions -------
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
    // ----- END of Utility functions -------


    render() {

        const { isInputEnabled, activityName, allWsActivitiesList } = this.state;

        return (
            <div className="act-del-div">
                {/*  Add activity template */}
                <div className="row add-act-wrapper-row">
                    <div className="add-act-input-div col-sm-3">

                        <input type="text" className="form-control"
                            value={activityName}
                            maxLength="50"
                            placeholder="Add Activity"
                            onChange={(e) => { this.updateAddActName(e) }}
                            style={{ cursor: SessionStorage.read("accessType") === "Read" ? "not-allowed" : 'pointer' }}
                            disabled={SessionStorage.read("accessType") === "Read" ? true : false}
                            onKeyDown={(e) => { this.handleKeyDownAddAct(e) }}
                        >
                        </input>
                    </div>
                    <img src={circPlusIcon} alt="add" className="add-act-plus"
                        data-tip="" data-for="add_a_tooltip" data-type="dark"
                        style={{
                            opacity: SessionStorage.read("accessType") === "Read" ? "0.5" : 'unset',
                            cursor: SessionStorage.read("accessType") === "Read" ? "not-allowed" : 'pointer'
                        }}
                        onClick={(e) => SessionStorage.read("accessType") === "Read" ? 'return false;' : this.saveAddActivityHandler(e)}></img>
                    <ReactTooltip id="add_a_tooltip">
                        <span>Add Activity</span>
                    </ReactTooltip>
                </div>

                <div className="row all-activities-row">
                    {allWsActivitiesList && allWsActivitiesList.map((act, actIndex) => (
                        <div key={actIndex} className="all-act-list col-md-3">
                            <div className="row no-gutters activity-name-row">
                                <div className="act-name-div col-md-10">
                                    {act.isInputEnabled ?
                                        <input type="text" className="act-input-box"
                                            maxLength="50"
                                            autoFocus={true}
                                            defaultValue={act.activity.name}
                                            onKeyDown={(e) => { this.handleKeyDownAct(e, actIndex) }}
                                            disabled={SessionStorage.read("accessType") === "Read" ? true : false}
                                            style={{ cursor: SessionStorage.read("accessType") === "Read" ? "not-allowed" : 'pointer' }}
                                            onBlur={(e) => SessionStorage.read("accessType") === "Read" ? 'return false;' : this.saveActivityNameHandler(e, actIndex)}
                                        >
                                        </input>
                                        :
                                        act.activity.name.length > 0 ?
                                            <label onDoubleClick={(e) => { this.makeActivityInputHandler(e, actIndex) }}>
                                                {act.activity.name.length > 20 ?
                                                    <Fragment>
                                                        <b data-tip="" data-for={`act_tooltip_${actIndex}`} data-type="dark">
                                                            {act.activity.name.substr(0, 20)}...</b>
                                                        <ReactTooltip id={`act_tooltip_${actIndex}`}>
                                                            <span>{act.activity.name}</span>

                                                        </ReactTooltip>
                                                    </Fragment>
                                                    :
                                                    <b>{act.activity.name}</b>
                                                }

                                            </label>
                                            :
                                            <label
                                                disabled={SessionStorage.read("accessType") === "Read" ? true : false}
                                                style={{ cursor: SessionStorage.read("accessType") === "Read" ? 'not-allowed' : 'pointer' }}
                                                onDoubleClick={(e) => { this.makeActivityInputHandler(e, actIndex) }}>
                                                Add Activity
                                            </label>
                                    }
                                </div>
                                <div className="act-del-ellipsis col-md-2">
                                    <span className="act-del">
                                        <img src={trashIcon} alt="delete" className=""
                                            data-tip="Delete Activity" data-type="dark"
                                            style={{
                                                opacity: SessionStorage.read("accessType") === "Read" ? "0.5" : 'unset',
                                                cursor: SessionStorage.read("accessType") === "Read" ? "not-allowed" : 'pointer'
                                            }}
                                            onClick={(e) => SessionStorage.read("accessType") === "Read" ? 'return false;' : this.deleteActivityonConfirm(e, actIndex)}></img>
                                    </span>
                                    <ReactTooltip html={true} />
                                    <span className="act-ellipsis">
                                        <img src={ellipsisVIcon} alt="open"
                                            data-tip="Add Activity Related Information" data-type="dark"
                                            className="" style={{ cursor: "pointer" }} onClick={(e) => { this.openActivityLayer(act, actIndex) }}></img>
                                    </span>
                                    <ReactTooltip html={true} />
                                </div>
                            </div>
                            <div className="row ml-0 mr-0 add-deliv-row">
                                <div className="add-del-input-div">
                                    <input type="text" className="form-control"
                                        value={act.addDeliverable.deliverableName}
                                        maxLength="50"
                                        placeholder="Add Deliverable"
                                        onChange={(e) => { this.updateAddDelName(e, actIndex) }}
                                        onKeyDown={(e) => { this.handleKeyDownAddDel(e, act.addDeliverable.deliverableName, actIndex) }}
                                        disabled={SessionStorage.read("accessType") === "Read" ? true : false}
                                        style={{ cursor: SessionStorage.read("accessType") === "Read" ? "not-allowed" : 'pointer' }}

                                    >
                                    </input>
                                </div>
                                <div className="add-del-img-div">
                                    <img src={circPlusIcon} alt="add" className="add-act-plus"
                                        data-tip="" data-for="add_d_tooltip" data-type="dark"
                                        style={{
                                            opacity: SessionStorage.read("accessType") === "Read" ? "0.5" : 'unset',
                                            cursor: SessionStorage.read("accessType") === "Read" ? "not-allowed" : 'pointer'
                                        }}
                                        onClick={(e) => SessionStorage.read("accessType") === "Read" ? 'return false;' : this.saveAddDeliverableName(act.addDeliverable.deliverableName, actIndex)}></img>
                                    <ReactTooltip id="add_d_tooltip">
                                        <span>Add Deliverable</span>
                                    </ReactTooltip>
                                </div>

                            </div>
                            {/* Deliverables list of individual activity template */}
                            <div className="row ml-0 mr-0 all-deliverables-row">
                                {act.activity.deliverables && act.activity.deliverables.map((del, delIndex) => (
                                    <div key={delIndex} className="ml-0 mr-0 each-delivery-row">
                                        <div className="row no-gutters del-name-row">
                                            <div className="del-name-div col-md-10">
                                                {del.isInputEnabled ?
                                                    <input type="text" className="del-input-box"
                                                        defaultValue={del.deliverable.name}
                                                        maxLength="50"
                                                        autoFocus={true}
                                                        style={{ cursor: SessionStorage.read("accessType") === "Read" ? "not-allowed" : 'pointer' }}
                                                        disabled={SessionStorage.read("accessType") === "Read" ? true : false}
                                                        onKeyDown={(e) => { this.handleKeyDownDel(e, actIndex, delIndex) }}
                                                        onBlur={(e) => SessionStorage.read("accessType") === "Read" ? 'return false;' : this.saveDeliverableName(e, actIndex, delIndex)}
                                                    >
                                                    </input>
                                                    :
                                                    del.deliverable.name.length > 0 ?
                                                        <label onDoubleClick={(e) => { this.makeDelInputHandler(e, actIndex, delIndex) }}>
                                                            {del.deliverable.name.length > 20 ?
                                                                <Fragment>
                                                                    <b data-tip="" data-for={`del_tooltip_${delIndex}`} data-type="dark"
                                                                    >{del.deliverable.name.substr(0, 20)}...</b>
                                                                    <ReactTooltip id={`del_tooltip_${delIndex}`}>
                                                                        <span>{del.deliverable.name}</span>

                                                                    </ReactTooltip>
                                                                </Fragment>
                                                                :
                                                                <b>{del.deliverable.name}</b>

                                                            }

                                                        </label>
                                                        :
                                                        <label onDoubleClick={(e) => { this.makeDelInputHandler(e, actIndex, delIndex) }}>
                                                            Add Deliverable
                                                        </label>
                                                }
                                            </div>
                                            <div className="del-del-ellipsis col-md-2">
                                                <span className="del-del">
                                                    <img src={trashIcon} alt="delete" data-tip="Delete Deliverable" data-type="dark" className=""
                                                        style={{
                                                            opacity: SessionStorage.read("accessType") === "Read" ? "0.5" : 'unset',
                                                            cursor: SessionStorage.read("accessType") === "Read" ? "not-allowed" : 'pointer'
                                                        }}
                                                        onClick={(e) => SessionStorage.read("accessType") === "Read" ? 'return false;' : this.deleteDeliverableHandler(e, actIndex, delIndex)}></img>
                                                </span>
                                                <ReactTooltip html={true} />
                                                <span className="del-ellipsis">
                                                    <img src={ellipsisVIcon} alt="open" data-tip="Add Deliverable Related Information" data-type="dark"
                                                        style={{ cursor: 'pointer' }}
                                                        onClick={(e) => { this.openDeliverableModal(e, del.deliverable) }}
                                                        className=""></img>
                                                </span>
                                                <ReactTooltip html={true} />
                                            </div>
                                        </div>
                                        {/* <div className="row no-gutters del-owner-row">
                                            <div className="col-md-2 owner-icon">
                                                <img src={ownerIcon} alt="Owner of Deliverable"></img>
                                            </div>
                                            <div className="col-md-10">
                                            <label className="owner-name">{del.deliverable.owner !== null && del.deliverable.owner !== '' ? del.deliverable.owner: 'Owner'}</label>
                                            </div>
                                        </div>                                             */}
                                    </div>
                                ))
                                }
                            </div>
                        </div>
                    ))
                    }

                </div>

                {/* each activity details modal */}
                {this.state.modalVisible && this.state.modalVisible === true ?
                    <ActivityDetailsModal modalCloseHandler={this.modalCloseHandler}
                        title={this.state.actName}
                        visible={this.state.modalVisible}
                        activityId={this.state.activityId}
                    >
                    </ActivityDetailsModal> : ''
                }

                {/*each deliverable details modal */}
                {this.state.isDelModalVisible ?
                    <div className="del-modal-enclose">
                        <DeliverableDetailsModal
                            deliverableName={this.state.selectedDelName}
                            deliverableId={this.state.selectedDelId}
                            isDelModalVisible={this.state.isDelModalVisible}
                            modalCloseHandler={this.closeDelModal}
                        >
                        </DeliverableDetailsModal>
                    </div> : ''
                }
                {/* custom confirm box */}
                <CustomConfirmModal
                    ownClassName={'ws-act-delete-modal'}
                    isModalVisible={this.state.deleteActModalVisible}
                    modalTitle={this.state.deleteActModalTitle}
                    closeConfirmModal={this.closeDeleteActConfirmModal}
                />
                <CustomConfirmModal
                    ownClassName={'ws-del-delete-modal'}
                    isModalVisible={this.state.deleteDelModalVisible}
                    modalTitle={this.state.deleteDelModalTitle}
                    closeConfirmModal={this.closeDeleteDelConfirmModal}
                />
            </div>
        )
    }
}

export default withRouter(ActivitiesAndDeliverables);