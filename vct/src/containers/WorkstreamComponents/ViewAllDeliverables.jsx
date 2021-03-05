import React, { Component } from 'react';
import { withRouter } from "react-router-dom";
import { inject } from 'mobx-react';
import { toast } from 'react-toastify';
import ReactTooltip from 'react-tooltip';

import './ViewAllDeliverables.css';
import NotificationMessage from '../../components/NotificationMessage/NotificationMessage';
import CustomConfirmModal from '../../components/CustomConfirmModal/CustomConfirmModal';
import DeliverableDetailsModal from './DeliverableDetailsModal';
import trashIcon from '../../assets/project/viewDeals/trash-delete-icon.svg';
var SessionStorage = require('store/storages/sessionStorage');

@inject('workstreamStore')
class ViewAllDeliverables extends Component {
    constructor(props) {
        super(props);

        this.state = {
            allDeliverablesArray: [],
            isDelModalVisible: false,
            selectedDelId: '',
            selectedDelName: '',
            deleteDelModalVisible: '',
            deleteDelModalTitle: '',

            deleteDelIndex: ''
        };

        this.openDeliverableModal = this.openDeliverableModal.bind(this);
        this.deleteDelevarable = this.deleteDelevarable.bind(this);
        this.isDefined = this.isDefined.bind(this);
    }

    componentDidMount() {
        const { selectedViewIcon, allDeliverablesList } = this.props;
        const deliverablesArray = [...allDeliverablesList];
        this.setState({
            selectedViewIcon: selectedViewIcon,
            allDeliverablesArray: deliverablesArray
        });
    }

    componentDidUpdate(prevProps, prevState) {
        if (prevProps.allDeliverablesList !== this.props.allDeliverablesList ||
            prevProps.selectedViewIcon !== this.props.selectedViewIcon) {
            this.test()
        }
    }
    test() {
        const { selectedViewIcon, allDeliverablesList } = this.props;
        const deliverablesArray = [...allDeliverablesList];
        this.setState({
            selectedViewIcon: selectedViewIcon,
            allDeliverablesArray: deliverablesArray
        }, () => {
            ReactTooltip.rebuild();
        });
    }

    openDeleteDelConfirmModal = (title, delInd) => {
        this.setState({
            deleteDelModalVisible: true,
            deleteDelModalTitle: title,
            deleteDelIndex: delInd
        });
    }

    closeDeleteDelConfirmModal = (isYesClicked) => {
        this.setState({
            deleteDelModalVisible: false,
            deleteDelModalTitle: ''
        }, () => {
            ReactTooltip.rebuild();
        });
        if (isYesClicked) {
            //new delete function
            this.deleteDeleverableOnConfirm();
        } else {
            this.setState({
                deleteDelIndex: ''
            });

        }

    }

    deleteDeleverableOnConfirm = () => {
        const { workstreamStore } = this.props;
        const { allDeliverablesArray, deleteDelIndex } = this.state;
        const dlvIndex = deleteDelIndex;
        const wsDeliverablesArray = [...allDeliverablesArray];
        const delId = wsDeliverablesArray[dlvIndex].deliverableId;
        workstreamStore.deleteDeliverable(delId)
            .then((res) => {
                if (!res.error && res.data.resultCode === 'OK') {

                    wsDeliverablesArray.splice(dlvIndex, 1);
                    this.setState({
                        allDeliverablesArray: wsDeliverablesArray
                    });
                    this.props.fetchAllWsDetails();
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

    deleteDelevarable = (e, dlvIndex) => {
        const { workstreamStore } = this.props;
        const { allDeliverablesArray } = this.state;
        const wsDeliverablesArray = [...allDeliverablesArray];
        const delId = wsDeliverablesArray[dlvIndex].deliverableId;
        const confirmMsg = 'Are you sure you want to delete the deliverable?';

        if (this.isDefined(delId)) {
            this.openDeleteDelConfirmModal(confirmMsg, dlvIndex);

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
        if (param) {
            this.props.fetchAllWsDetails();
        }
        this.setState({
            isDelModalVisible: false,
            selectedDelId: '',
            selectedDelName: ''
        });
    }

    render() {

        const { allDeliverablesArray, selectedViewIcon } = this.state;

        return (
            <div>
                {selectedViewIcon === 'list_view' ?
                    <div className="view-all-dlv-tab">
                        {allDeliverablesArray && allDeliverablesArray.length > 0 ?
                            allDeliverablesArray.map((dlvObj, dlvIndex) => (
                                <div key={Math.random()} className="dlvr-binder">
                                    <div className="view-dlvr row">
                                        <div className="col-md-7">
                                            <div className="dlvr-name">
                                                <label onClick={(e) => { this.openDeliverableModal(e, dlvObj) }}>{dlvObj.name}</label>
                                            </div>
                                        </div>
                                        <div className="col-md-4">
                                            <div className="milestone-counter">
                                                <label>No. of Milestones:</label> {dlvObj.milestoneCnt}
                                            </div>
                                        </div>
                                        <div className="col-md-1 text-right">
                                            <img src={trashIcon} className="trash-img" alt="delete"
                                                data-tip="Delete Deliverable" data-type="dark" data-place="left"
                                                style={{ cursor: SessionStorage.read("accessType") === "Read" ? "not-allowed" : 'pointer' }}
                                                onClick={(e) => SessionStorage.read("accessType") === "Read" ? 'return false;' : this.deleteDelevarable(e, dlvIndex)}></img>
                                            <ReactTooltip html={true} />
                                        </div>
                                    </div>
                                </div>
                            )) :
                            <div className="no-deli-div">There are No Deliverables created.</div>
                        }
                    </div>
                    : selectedViewIcon === 'grid_view' ?
                        <div className="view-all-act-grid-tab row">
                            {allDeliverablesArray && allDeliverablesArray.length > 0 ?
                                allDeliverablesArray.map((dlvObj, dlvIndex) => (
                                    <div key={Math.random()} className="view-delivery-grid col-md-2">
                                        <div className="grid-holder">
                                            <div className="row no-gutters">

                                                <div className="col-md-11">

                                                </div>
                                                <div className="col-md-1 text-right">
                                                    <img src={trashIcon} className="trash-img" alt="delete"
                                                        data-tip="Delete Deliverable" data-type="dark" data-place="left"
                                                        style={{ cursor: SessionStorage.read("accessType") === "Read" ? "not-allowed" : 'pointer' }}
                                                        onClick={(e) => SessionStorage.read("accessType") === "Read" ? 'return false;' : this.deleteDelevarable(e, dlvIndex)}></img>
                                                    <ReactTooltip html={true} />
                                                </div>
                                            </div>
                                            <div className="col-md-12 del-name-grid">
                                                <div className="dlvr-name">
                                                    <label onClick={(e) => { this.openDeliverableModal(e, dlvObj) }}>{dlvObj.name}</label>
                                                </div>
                                            </div>

                                            <div className="col-md-12 grid-delivery">
                                                <div className="milestone-counter">
                                                    <label>No. of Milestones:</label> {dlvObj.milestoneCnt}
                                                </div>
                                            </div>
                                        </div>

                                    </div>
                                )) :
                                <div className="no-deli-div">There are No Deliverables created.</div>
                            }
                        </div>
                        : ''
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

export default withRouter(ViewAllDeliverables);