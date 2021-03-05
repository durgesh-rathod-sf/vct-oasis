import React, { Component } from 'react';
import { withRouter } from "react-router-dom";
import { inject } from 'mobx-react';
import { toast } from 'react-toastify';
import ReactTooltip from 'react-tooltip';

import './ViewAllWorkstreams.css';
import NotificationMessage from '../../components/NotificationMessage/NotificationMessage';
import CustomConfirmModal from '../../components/CustomConfirmModal/CustomConfirmModal';
import drillDownIcon from "../../assets/project/workstream/drill-down.svg";
import trashIcon from '../../assets/project/viewDeals/trash-delete-icon.svg';
var SessionStorage = require('store/storages/sessionStorage');

@inject('workstreamStore')
class ViewAllWorkstreams extends Component {
    constructor(props) {
        super(props);
        this.state = {
            allWsArray: [],
            selectedViewIcon: '',
            deleteWsModalVisible: false,
            deleteWsModalTitle: '',
            deleteWsIndex: ''
        };

        this.makeInputHandler = this.makeInputHandler.bind(this);
        this.saveWorkstreamNameHandler = this.saveWorkstreamNameHandler.bind(this);
        this.updateWsNamevalue = this.updateWsNamevalue.bind(this);
        this.deleteWorkstream = this.deleteWorkstream.bind(this);
        this.isDefined = this.isDefined.bind(this);
        this.deleteApiRequest = this.deleteApiRequest.bind(this);
    }

    componentDidMount() {
        const { allWorkstreamsList, selectedViewIcon } = this.props;
        let wsArray = [...allWorkstreamsList];
        let allWsArray = [];
        wsArray.map((ws, ind) => {
            let tempObj = {
                'isInputEnabled': false,
                'workstream': ws
            }
            allWsArray.push(tempObj);
        });
        this.setState({
            allWsArray: [...allWsArray],
            selectedViewIcon: selectedViewIcon
        });
    }

    componentDidUpdate(prevProps, prevState) {
        if (prevProps.allWorkstreamsList !== this.props.allWorkstreamsList ||
            prevProps.selectedViewIcon !== this.props.selectedViewIcon) {
            this.test()
        }
    }
    test() {
        const { allWorkstreamsList, selectedViewIcon, workstreamStore } = this.props;
        let wsArray = [...allWorkstreamsList];
        let allWsArray = [];
        wsArray.map((ws, ind) => {
            let tempObj = {
                'isInputEnabled': false,
                'workstream': ws
            }
            allWsArray.push(tempObj);
        });
        this.setState({
            allWsArray: [...allWsArray],
            selectedViewIcon: selectedViewIcon
        }, () => {
            ReactTooltip.rebuild();
        });

    }

    makeInputHandler = (event, wsIndex) => {
        let { allWsArray } = this.state;
        allWsArray[wsIndex].isInputEnabled = true;
        this.setState({
            allWsArray: allWsArray
        });
    }

    saveWorkstreamNameHandler = (event, wsIndex) => {
        let { allWsArray } = this.state;
        const { workstreamStore } = this.props;
        const wsName = event.target.value;

        if (wsName.length > 0 && !RegExp(/[<>!'"[\]]/).test(wsName)) {
            const payloadObj = {
                'mapId': SessionStorage.read('mapId'),
                'wsId': allWsArray[wsIndex].workstream.wsId,
                'name': wsName.trim(),
                'label': 'Y'
            }
            workstreamStore.saveWorkstreamDetails(payloadObj)
                .then((response) => {
                    if (!response.error && response.data.resultCode === 'OK') {
                        allWsArray[wsIndex].isInputEnabled = false;
                        allWsArray[wsIndex].workstream.name = wsName;
                        this.setState({
                            allWsArray: allWsArray
                        });
                        this.props.fetchAllWsDetails();
                        this.showErrorNotification("Workstream Name saved successfully", "Success", "success");

                    } else if (!response.error && response.data.resultCode === 'KO') {
                        this.showErrorNotification(response.data.errorDescription, "Error", "error");
                        console.log('error in SAVE: ' + response.data.errorDescription);
                    } else {
                        this.showErrorNotification("Sorry! Something went wrong", "Error", "error");
                        console.log('error: something went wrong in SAVE');
                    }
                });
        } else {
            this.showErrorNotification("Please enter the valid non-empty workstream name. Special characters [ < ! ' \" > ] are invalid", "Error", "error");
            console.log('error: ws name is either empty/invalid');
        }


    }

    updateWsNamevalue = (event, wsIndex) => {
        let { allWsArray } = this.state;
        const wsName = event.target.value;
        allWsArray[wsIndex].workstream.name = wsName;
        this.setState({
            allWsArray: allWsArray
        });
    }

    openDeleteWsConfirmModal = (title, wsInd) => {
        this.setState({
            deleteWsModalVisible: true,
            deleteWsModalTitle: title,
            deleteWsIndex: wsInd
        }, () => {
            ReactTooltip.rebuild();
        });

    }

    closeDeleteWsConfirmModal = (isYesClicked) => {
        this.setState({
            deleteWsModalVisible: false,
            deleteWsModalTitle: ''
        });
        if (isYesClicked) {
            //old delete function
            this.deleteApiRequest(this.state.deleteWsIndex);
        } else {
            this.setState({
                deleteWsIndex: ''
            }, () => {
                ReactTooltip.rebuild();
            });

        }

    }

    deleteWorkstream = (event, wsObj, wsIndex) => {
        const confirmMsg = 'If you delete the workstream, related activities and deliverables will also get deleted. Do you want to delete the workstream?';
        // const {allWsArray} = this.state;
        if (this.isDefined(wsObj.workstream.wsId)) {
            // allWsArray.splice(wsIndex, 1);
            if (wsObj.workstream.activityCount > 0 || wsObj.workstream.delCount > 0) {
                this.openDeleteWsConfirmModal(confirmMsg, wsObj.workstream.wsId);
                // if (window.confirm(confirmMsg)) {
                //     this.deleteApiRequest(wsObj.workstream.wsId);
                // }                
            } else {
                this.deleteApiRequest(wsObj.workstream.wsId);
            }
        }
    };

    deleteApiRequest(id) {
        const { workstreamStore } = this.props;
        workstreamStore.deleteWorkstream(id)
            .then((res) => {
                if (!res.error && res.data.resultCode === 'OK') {
                    this.props.fetchAllWsDetails();
                    this.showErrorNotification("Workstream Deleted successfully", "Success", "success");
                    // this.setState({
                    //     allWsArray: allWsArray
                    // });
                } else if (!res.error && res.data.resultCode === 'KO') {
                    this.showErrorNotification(res.data.resultDescription, "Error", "error");
                    console.log('error in Delete: ' + res.data.errorDescription);
                } else {
                    this.showErrorNotification("Sorry! Something went wrong", "Error", "error");
                    console.log('error: something went wrong in SAVE');
                }
            });
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

    handleKeyDown = (e, ind) => {
        if (e.key === 'Enter') {
            this.saveWorkstreamNameHandler(e, ind);
        }
    }

    render() {

        const { allWsArray, selectedViewIcon } = this.state;

        return (
            <div>
                {selectedViewIcon === 'list_view' ?
                    <div className="view-all-ws-tab">
                        {allWsArray && allWsArray.map((ws, wsIndex) => (
                            <div key={Math.random()} className="view-workstream row">
                                <div className='col-md-5'>
                                    <div className="ws-icon-input">
                                        <div className="ws-icon">
                                            <img src={drillDownIcon} alt="open" className="text-left"
                                                data-tip="" data-for="open_ws_tooltip" data-type="dark" data-place="right"
                                                id={ws.workstream.wsId} onClick={this.props.onPlusClick}></img>

                                        </div>
                                        <div className="ws-input-div">
                                            {ws.isInputEnabled ?
                                                <input type='text' className="workstream-input"
                                                    defaultValue={ws.workstream.name}
                                                    autoFocus={true}
                                                    maxLength="50"
                                                    onKeyDown={(e) => { this.handleKeyDown(e, wsIndex) }}
                                                    disabled={SessionStorage.read("accessType") === "Read" ? true : false}
                                                    style={{ cursor: SessionStorage.read("accessType") === "Read" ? "not-allowed" : 'pointer' }}
                                                    onBlur={(e) => { this.saveWorkstreamNameHandler(e, wsIndex) }}
                                                ></input>
                                                : <label onDoubleClick={(e) => { this.makeInputHandler(e, wsIndex) }}>
                                                    {ws.workstream.name.length > 0 ?
                                                        <span className="ws-name">{ws.workstream.name}</span>
                                                        : <span className="ws-placeholder">Enter Workstream Name*</span>
                                                    }
                                                </label>
                                            }
                                        </div>
                                    </div>
                                </div>
                                <div className="col-md-3">
                                    <div className="activities-counter">
                                        <label>No. of Activities:</label> {ws.workstream.activityCount}
                                    </div>
                                </div>
                                <div className="col-md-3">
                                    <div className="deliverables-counter">
                                        <label>No. of Deliverables:</label> {ws.workstream.delCount}
                                    </div>
                                </div>
                                <div className="col-md-1 text-right">
                                    <img className="trash-img" alt="delete" src={trashIcon}
                                        data-tip="Delete Workstream" data-type="dark" data-place="left"
                                        style={{
                                            opacity: SessionStorage.read("accessType") === "Read" ? "0.5" : 'unset',
                                            cursor: SessionStorage.read("accessType") === "Read" ? "not-allowed" : 'pointer',
                                        }}
                                        onClick={(e) => SessionStorage.read("accessType") === "Read" ? 'return false;' : this.deleteWorkstream(e, ws, wsIndex)}></img>
                                    <ReactTooltip html={true}></ReactTooltip>

                                </div>
                            </div>
                        ))
                        }
                        <ReactTooltip id="open_ws_tooltip">
                            <span>Open Workstream</span>
                        </ReactTooltip>

                    </div>
                    : selectedViewIcon === 'grid_view' ?
                        <div className="view-all-ws-grid-tab row">
                            {allWsArray && allWsArray.map((ws, wsIndex) => (
                                <div key={Math.random()} className="view-workstream-grid col-md-2">
                                    <div className="grid-holder">
                                        <div className="row no-gutters">
                                            <div className=" col-md-1 ws-icon ">
                                                <img src={drillDownIcon} className="text-left" id={ws.workstream.wsId}
                                                    data-tip="" data-for="open_ws_tooltip" data-type="dark" data-place="right"
                                                    alt="open" onClick={this.props.onPlusClick}></img>
                                            </div>
                                            <div className="col-md-10">

                                            </div>
                                            <div className="col-md-1 text-right">
                                                <img className="trash-img" src={trashIcon} alt="delete"
                                                    data-tip="Delete Workstream" data-type="dark"
                                                    style={{
                                                        cursor: SessionStorage.read("accessType") === "Read" ? "not-allowed" : 'pointer',
                                                        opacity: SessionStorage.read("accessType") === "Read" ? "0.5" : 'unset'
                                                    }}
                                                    onClick={(e) => SessionStorage.read("accessType") === "Read" ? 'return false;' : this.deleteWorkstream(e, ws, wsIndex)}></img>
                                                <ReactTooltip html={true}></ReactTooltip>
                                            </div>
                                        </div>
                                        <div className="col-md-12 grid-input-div">
                                            {ws.isInputEnabled ?
                                                <input type='text' className="workstream-grid-input"
                                                    defaultValue={ws.workstream.name}
                                                    autoFocus={true}
                                                    maxLength="50"
                                                    onKeyDown={(e) => { this.handleKeyDown(e, wsIndex) }}
                                                    disabled={SessionStorage.read("accessType") === "Read" ? true : false}
                                                    style={{ cursor: SessionStorage.read("accessType") === "Read" ? 'not-allowed' : 'pointer' }}
                                                    onBlur={(e) => SessionStorage.read("accessType") === "Read" ? 'return false;' : this.saveWorkstreamNameHandler(e, wsIndex)}
                                                ></input>
                                                : <label
                                                    disabled={SessionStorage.read("accessType") === "Read" ? true : false}
                                                    style={{ cursor: SessionStorage.read("accessType") === "Read" ? 'not-allowed' : 'pointer' }}
                                                    onDoubleClick={(e) => SessionStorage.read("accessType") === "Read" ? 'return false;' : this.makeInputHandler(e, wsIndex)}>
                                                    {ws.workstream.name.length > 0 ?
                                                        <span className="ws-name">{ws.workstream.name}</span>
                                                        : <span className="ws-placeholder">Enter Workstream Name*</span>
                                                    }
                                                </label>
                                            }
                                        </div>

                                        <div className="col-md-12 grid-activity">
                                            <label>No. of Activities:</label> {ws.workstream.activityCount}
                                        </div>
                                        <div className="col-md-12 grid-delivery">
                                            <label>No. of Deliverables:</label> {ws.workstream.delCount}
                                        </div>
                                    </div>

                                </div>
                            ))
                            }
                            <ReactTooltip id="open_ws_tooltip">
                                <span>Open Workstream</span>
                            </ReactTooltip>


                        </div>
                        : ''
                }
                <CustomConfirmModal
                    ownClassName={'ws-delete-modal'}
                    isModalVisible={this.state.deleteWsModalVisible}
                    modalTitle={this.state.deleteWsModalTitle}
                    closeConfirmModal={this.closeDeleteWsConfirmModal}
                />
            </div>


        )
    }
}

export default withRouter(ViewAllWorkstreams);