import React, { Component } from 'react';
import { withRouter } from "react-router-dom";
import { observer, inject } from 'mobx-react';
import './GeneralInformation.css';
import ActivitiesAndDeliverables from './ActivitiesAndDeliverables'
import ReactTooltip from 'react-tooltip';
import drillUpIcon from '../../assets/project/workstream/drill-up.svg';
import infoIcon from '../../assets/project/workstream/ws-info.svg';
import settingsIcon from '../../assets/project/workstream/settings.svg';
import calIcon from '../../assets/project/workstream/date-disabled.svg';
import closeIcon from '../../assets/project/workstream/modal-close.svg';
import { toast } from 'react-toastify';
import NotificationMessage from '../../components/NotificationMessage/NotificationMessage';
import CustomConfirmModal from '../../components/CustomConfirmModal/CustomConfirmModal';
import Moment from 'moment';
import Modal from 'react-bootstrap4-modal';
var SessionStorage = require('store/storages/sessionStorage');

@observer
@inject('workstreamStore')
class GeneralInformation extends Component {
    constructor(props) {
        super(props);
        this.state = {
            wsName: "",
            wsOwner: "",
            wsDescription: "",
            wsStartDate: "",
            wsEndDate: "",
            wsLinkedKpiBenefits: [],
            wsInvestments: [],
            isKpiModalOpen: false,
            isInvModalOpen: false,
            invWsDetails: "",
            kpiWsDetails: "",
            selectedIconTab: 'general_info',
            edited: false,
            wsOwnerError: '',
            wsDescriptionError: '',
            saveGenInfoModalVisible: false,
            saveGenInfoModalTitle: ''

        };
        this.saveWsGiDetails = this.saveWsGiDetails.bind(this);
        this.handleChange = this.handleChange.bind(this);
        this.ModalKpiHandler = this.ModalKpiHandler.bind(this);
        this.ModalInvHandler = this.ModalInvHandler.bind(this);
        this.ModalInvCloseHandler = this.ModalInvCloseHandler.bind(this);
        this.ModalKpiCloseHandler = this.ModalKpiCloseHandler.bind(this);
        this.MinusClick = this.MinusClick.bind(this);
    }

    componentDidMount() {
        // const { workstreamStore } = this.props;
        const wsDetails = this.props.selectedWsDetails;

        if (wsDetails !== false) {

            this.setState({
                wsId: wsDetails.wsId,
                wsName: wsDetails.name,
                wsOwner: wsDetails.owner,
                wsDescription: wsDetails.description,
                wsStartDate: (wsDetails.startDate === "" ? "" : Moment(new Date(wsDetails.startDate)).format('DD-MMM-YYYY')),

                wsEndDate: (wsDetails.endDate === "" ? "" : Moment(new Date(wsDetails.endDate)).format('DD-MMM-YYYY')),

                wsLinkedKpiBenefits: wsDetails.linkedKPIs,
                wsInvestments: wsDetails.linkedCostCategories
            })
        }

    }

    openSaveGenInfoConfirmModal = (title) => {
        this.setState({
            saveGenInfoModalVisible: true,
            saveGenInfoModalTitle: title,
        });
    }

    closeSaveGenInfoConfirmModal = (isYesClicked) => {
        this.setState({
            saveGenInfoModalVisible: false,
            saveGenInfoModalTitle: ''
        }, () => {
            ReactTooltip.rebuild();
        });
        if (isYesClicked) {
            //new delete function
            this.saveWsGiDetails();
        } else {
            this.props.onMinusClick();
        }
    }

    MinusClick() {
        const { edited, selectedIconTab } = this.state;
        if (edited === false) {
            this.props.onMinusClick()
        }
        else {
            if (selectedIconTab === "general_info") {
                this.openSaveGenInfoConfirmModal('Do you want to save the changes ?');

                // this.props.onMinusClick() 

            }
            else {
                this.props.onMinusClick()
            }
        }

    }
    saveWsGiDetails() {
        const { workstreamStore } = this.props;
        const { wsId, wsName, wsOwner, wsDescription, wsOwnerError, wsDescriptionError } = this.state;
        if (wsName !== "" && wsOwner !== "" && wsOwner !== null && wsDescription !== "" && wsDescription !== null && wsOwnerError === '' && wsDescriptionError === '') {
            const payloadObj = {
                "mapId": SessionStorage.read('mapId'),
                "name": wsName,
                "wsId": wsId,
                "owner": wsOwner,
                "description": wsDescription

            }
            workstreamStore.saveWorkstreamDetails(payloadObj)
                .then((response) => {
                    if (!response.error && response.data.resultCode === 'OK') {
                        // this.props.fetchAllWsDetails();
                        workstreamStore.fetchWsGenInfo(wsId)
                        this.showNotification("Workstream Details saved successfully", "Success", "success");
                        this.setState({
                            edited: false
                        })

                    } else if (!response.error && response.data.resultCode === 'KO') {
                        this.showNotification(response.data.resultDescription, "Error", "error");
                    } else {
                        this.showNotification("Sorry! Something went wrong", "Error", "error");
                    }
                });
        }
        else {
            this.showNotification("Workstream owner/description should have valid non-empty values", "Error", "error");

        }
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
    handleChange = (event) => {
        let value = event.target.value
        let type = event.target.id
        let errors = ''
        switch (type) {
            case "owner":
                errors = !RegExp(/[<>!'"[\]]/).test(value) ? '' : 'Please enter valid owner name. Special characters [ < ! \' " > ] are invalid';
                this.setState({
                    wsOwner: value,
                    edited: true,
                    wsOwnerError: errors
                })
                break;
            case "ws-description":
                errors = !RegExp(/[<>!'"[\]]/).test(value) ? '' : 'Please enter valid description. Special characters [ < ! \' " > ] are invalid';
                this.setState({
                    wsDescription: value,
                    edited: true,
                    wsDescriptionError: errors
                })
                break;
            default:
                break;

        }

    }
    ModalInvHandler = (event, inv) => {
        const { isInvModalOpen } = this.state;
        this.setState({
            isInvModalOpen: !isInvModalOpen,
            invWsDetails: inv
        })
    }
    ModalInvCloseHandler = () => {
        const { isInvModalOpen } = this.state;
        this.setState({
            isInvModalOpen: !isInvModalOpen,

        })
    }
    ModalKpiHandler = (event, kpi) => {
        const { isKpiModalOpen } = this.state;
        this.setState({
            isKpiModalOpen: !isKpiModalOpen,
            kpiWsDetails: kpi
        })
    }
    ModalKpiCloseHandler = (event) => {
        const { isKpiModalOpen } = this.state;
        this.setState({
            isKpiModalOpen: !isKpiModalOpen
        })
    }

    switchIconHandler = (icon_type) => {
        const { workstreamStore } = this.props;
        let savedOwner = workstreamStore.wsGIdetails.owner;
        let savedDesc = workstreamStore.wsGIdetails.description;

        if (icon_type === 'general_info') {
            const { selectedIconTab, wsId } = this.state;
            if (selectedIconTab === 'act_and_del') {
                let storeStartDate = '', storeEndDate = '';
                workstreamStore.fetchWsGenInfo(wsId)
                    .then(response => {
                        if (!response.error) {
                            if (response) {
                                storeStartDate = response['startDate'];
                                storeEndDate = response['endDate'];
                            }
                            this.setState({
                                selectedIconTab: icon_type,
                                wsStartDate: (storeStartDate === "" ? "" : Moment(new Date(storeStartDate)).format('DD-MMM-YYYY')),
                                wsEndDate: (storeEndDate === "" ? "" : Moment(new Date(storeEndDate)).format('DD-MMM-YYYY'))
                            });
                        }

                    });
            } else {
                this.setState({
                    selectedIconTab: icon_type
                });
            }

        } else {
            if (savedOwner !== null && savedDesc !== null && this.state.wsOwnerError === '' && this.state.wsDescriptionError === '') {
                this.setState({
                    selectedIconTab: icon_type
                })
            }
            else {
                this.showNotification("Please save Workstream Owner and Description before switching to Activities and Deliverables section", "Error", "error");
            }

        }
    }

    render() {
        // const pname = SessionStorage.read('projectName');
        // const demoUser = SessionStorage.read('demoUser');
        // const option = SessionStorage.read('option_selected');
        const { wsId, wsName, wsOwner, wsDescription, wsLinkedKpiBenefits, wsInvestments, wsStartDate, wsEndDate, isKpiModalOpen,
            isInvModalOpen, invWsDetails, kpiWsDetails, selectedIconTab } = this.state;
        const getTooltipData = (value) => {
            if (value) {
                let val = String(value)
                // .replace(/(?<!\..*)(\d)(?=(?:\d{3})+(?:\.|$))/g, '$1,');
                return `${val}`;
            }
        }
        const getTooltip = (value) => {
            return `${value}`;
        }
        return (
            <div className="generalInfoContainer row">
                <div className="gi_head row">
                    <div className="col-md-9">
                        <div className="ws-icon">
                            <img src={drillUpIcon} data-tip="Close Workstream" data-place="right" data-type="dark" alt="close" className="text-left" onClick={this.MinusClick} style={{ cursor: "pointer" }}></img>
                            <ReactTooltip html={true} />
                        </div>
                        <div className="ws_label">
                            <label >{wsName}</label>
                        </div>
                    </div>
                    <div className="col-md-3 icon-stack">
                        {/* {selectedIconTab === 'general_info' ?
                            <Fragment>
                                <div className="gi_IconDiv" style={{ backgroundColor: "white", cursor: SessionStorage.read("accessType") === "Read" ?"not-allowed":'pointer' }} data-tip={getTooltip("Save")}>
                                    <img src={saveIcon} alt="saveIcon" style={{cursor: SessionStorage.read("accessType") === "Read" ?"not-allowed":'pointer'}} className="gi_icon_disabled" style={{ width: "30px" }} onClick={SessionStorage.read("accessType") === "Read" ?'return false;':this.saveWsGiDetails} />
                                </div><ReactTooltip html={true} />
                            </Fragment> : ''
                        } */}
                        <div className="gi-img-wrapper"
                        >
                            <img src={infoIcon} alt="generalInfoIcon" className=""
                                data-tip={getTooltip("General Information")} data-type="dark" data-place="left"
                                style={selectedIconTab === 'general_info' ? { opacity: 1 } : { opacity: 0.6 }}
                                onClick={() => { this.switchIconHandler('general_info') }}
                            />
                            <ReactTooltip html={true} />
                        </div>
                        <div className="gi-img-wrapper"
                        >
                            <img src={settingsIcon} alt="setingsIcon" className=""
                                data-tip={getTooltip("Activities and Deliverables")} data-place="left" data-type="dark"
                                style={selectedIconTab === 'act_and_del' ? { opacity: 1 } : { opacity: 0.6 }}
                                onClick={() => { this.switchIconHandler('act_and_del') }}
                            />
                            <ReactTooltip html={true} />
                        </div>
                    </div>
                </div>
                {selectedIconTab && selectedIconTab === 'general_info' ?
                    <div className="gen-info-save-main">
                        <div className="general-info-main row">
                            <div className="col-md-4">
                                <div className="form-group ws-gi-form row">
                                    <div className="col-sm-12">
                                        <label htmlFor="ws_owner">Owner *</label>
                                    </div>
                                    <div className="col-md-12">
                                        <input className="form-control" name="ws_owner" type="text"
                                            value={wsOwner} id="owner" placeholder="Owner"
                                            maxLength="50"
                                            onChange={this.handleChange} />
                                        <span><small>{this.state.wsOwnerError}</small></span>
                                    </div>
                                </div>
                                <div className="row no-gutters">
                                    <div className="col-sm-6 ws-date-input-wrapper">
                                        <div className="form-group ws-gi-form-date row">
                                            <div className="col-sm-12 ">
                                                <label>Start Date</label>
                                            </div>
                                            <div className="col-sm-12 ">
                                                <div className="ws-date-row">
                                                    <input type="text" className="form-control" disabled
                                                        placeholder="dd-mmm-yyyy"
                                                        value={wsStartDate !== "" ? Moment(wsStartDate).format('DD-MMM-YYYY') : ""}
                                                    />
                                                    <img src={calIcon} alt="calender"></img>
                                                </div>

                                            </div>
                                        </div>

                                    </div>
                                    <div className="col-sm-6">
                                        <div className="form-group ws-gi-form-date row">
                                            <div className="col-sm-12">
                                                <label>End Date</label>
                                            </div>
                                            <div className="col-sm-12">
                                                <div className="ws-date-row">
                                                    <input type="text" disabled className="form-control"
                                                        placeholder="dd-mmm-yyyy"
                                                        value={wsEndDate !== "" ? Moment(wsEndDate).format('DD-MMM-YYYY') : ""}
                                                    />
                                                    <img src={calIcon} alt="calender"></img>
                                                </div>
                                            </div>

                                        </div>
                                    </div>
                                </div>

                                <div className="form-group ws-gi-form row">
                                    <div className="col-sm-12">
                                        <label>Description *</label>
                                    </div>
                                    <div className="col-sm-12">
                                        <textarea type="text" rows="5" placeholder="Enter description here"
                                            value={wsDescription} className="form-control"
                                            maxLength="250"
                                            id="ws-description" onChange={this.handleChange} />
                                        {wsDescription && wsDescription.length ?
                                            <div className="text-area-counter">{wsDescription.length} / 250 character(s)</div>
                                            : <div className="text-area-counter">0 / 250 character(s)</div>
                                        }

                                        <small>{this.state.wsDescriptionError}</small>
                                    </div>
                                </div>
                            </div>
                            <div className="col-md-8 ">
                                <div className="gi_body row">
                                    <div className="col-sm-12">
                                        <label>Linked KPI Benefits</label>
                                    </div>

                                    <div className="col-sm-12">

                                        <div className="ws-bg-holder">
                                            <div className="table_aboveDiv">
                                                {wsLinkedKpiBenefits && wsLinkedKpiBenefits.length !== 0 ? <table>
                                                    <thead>
                                                        <td className="first-th-td">Linked KPIs</td>
                                                        <td className="second-th-td">Total Benefit Contribution</td>
                                                    </thead>
                                                    <tbody>
                                                        {wsLinkedKpiBenefits && wsLinkedKpiBenefits.map((kpi) => (
                                                            (kpi.splitKpis.length !== 0 && kpi.wsKpiBenefit !== "" ?
                                                                <tr>
                                                                    <td style={{ paddingLeft: "15px" }}><li>{kpi.kpiName}</li></td>
                                                                    <td >
                                                                        <span data-type="dark" data-tip={getTooltipData(Number(kpi.wsKpiBenefit) / 1000000)}>$
                                                                   <label className="generalInfo-label"> {Number(Number(kpi.wsKpiBenefit) / 1000000).toFixed(2)} </label>
                                                                Mn&nbsp;
                                                                     <ReactTooltip html={true} />
                                                                            <span >
                                                                                <i class="fa fa-ellipsis-h" aria-hidden="true" id={kpi} onClick={(event) => this.ModalKpiHandler(event, kpi)}></i>

                                                                            </span>
                                                                        </span>
                                                                    </td>
                                                                </tr>
                                                                : "")
                                                        ))}
                                                        <Modal id="gi_modal" visible={isKpiModalOpen}>
                                                            <div class="gi_modal_div">{" "}
                                                                <div className="modal-close-div">
                                                                    <img src={closeIcon} alt="close" aria-label="Close" onClick={this.ModalKpiCloseHandler}>

                                                                    </img>
                                                                </div>
                                                                <div className='div_above_table'>
                                                                    <table>
                                                                        <thead>
                                                                            <tr>
                                                                                <th>{" "}</th>
                                                                                {kpiWsDetails.splitKpis && kpiWsDetails.splitKpis.map((sKpi) => (
                                                                                    <th>Year {sKpi.year}</th>
                                                                                ))}
                                                                            </tr>
                                                                        </thead>
                                                                        <tbody>
                                                                            <tr>
                                                                                <td style={{ width: "150px", textAlignLast: 'left' }}>{kpiWsDetails.kpiName}</td>
                                                                                {kpiWsDetails.splitKpis && kpiWsDetails.splitKpis.map((sKpi) => (
                                                                                    <td data-type="dark" data-tip={getTooltipData(Number(sKpi.benefit) / 1000000)} style={{ width: "100px" }}>
                                                                                        <label className="generalInfo-label modal-info-label">
                                                                                            $&nbsp;{Number(Number(sKpi.benefit) / 1000000).toFixed(2)}
                                                                                        </label>Mn
                                                                                        <ReactTooltip html={true} />
                                                                                    </td>
                                                                                ))}

                                                                            </tr>
                                                                        </tbody>
                                                                    </table>
                                                                </div>
                                                            </div>
                                                        </Modal>


                                                    </tbody>
                                                </table>
                                                    :
                                                    <div className="no-to-display">
                                                        <p className="">No Linked KPIs to display</p>
                                                    </div>}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="gi_body row inv-body-row">
                                    <div className="col-sm-12">
                                        <label>Investments</label>
                                    </div>
                                    <div className="col-sm-12">

                                        <div className="ws-bg-holder">
                                            <div className="table_aboveDiv">
                                                {wsInvestments && wsInvestments.length !== 0 ? <table>
                                                    <thead>
                                                        <td className="first-th-td">Linked Cost Categories</td>
                                                        <td className="second-th-td">Investment Contribution</td>
                                                    </thead>
                                                    <tbody>
                                                        {wsInvestments && wsInvestments.map((inv) => (
                                                            (inv.splitCostCategories.length !== 0 && inv.wsInvBenefit !== "" ?
                                                                <tr>
                                                                    <td style={{ paddingLeft: "15px" }}>

                                                                        <li>{inv.catName}</li>
                                                                    </td>
                                                                    <td>
                                                                        <span data-type="dark" data-tip={getTooltipData(Number(inv.wsInvBenefit) / 1000000)}>$  <label className="generalInfo-label">
                                                                            {Number(Number(inv.wsInvBenefit) / 1000000).toFixed(2)}
                                                                        </label>
                                                                    Mn&nbsp;
                                                    <ReactTooltip html={true} />
                                                                            <span >
                                                                                <i class="fa fa-ellipsis-h" aria-hidden="true" onClick={(event) => this.ModalInvHandler(event, inv)}></i>

                                                                            </span>
                                                                        </span>

                                                                    </td>
                                                                </tr>
                                                                : "")

                                                        ))}
                                                        <Modal id="gi_modal" visible={isInvModalOpen}>
                                                            <div class="gi_modal_div">{" "}
                                                                <div className="modal-close-div">
                                                                    <img src={closeIcon} alt="close" aria-label="Close" onClick={this.ModalInvCloseHandler}>

                                                                    </img>
                                                                </div>
                                                                <div className='div_above_table'>
                                                                    <table>
                                                                        <thead>
                                                                            <tr>
                                                                                <th>{" "}</th>
                                                                                {invWsDetails.splitCostCategories && invWsDetails.splitCostCategories.map((sInv) => (
                                                                                    <th>Year {sInv.year}</th>
                                                                                ))}
                                                                            </tr>
                                                                        </thead>
                                                                        <tbody>
                                                                            <tr>
                                                                                <td style={{ width: "150px", textAlignLast: 'left' }}>{invWsDetails.catName}</td>
                                                                                {invWsDetails.splitCostCategories && invWsDetails.splitCostCategories.map((sInv) => (
                                                                                    <td style={{ width: "100px" }} data-type="dark" data-tip={getTooltipData(Number(sInv.investment) / 1000000)}>
                                                                                        <label className="generalInfo-label modal-info-label">
                                                                                            $&nbsp;{Number(Number(sInv.investment) / 1000000).toFixed(2)}
                                                                                        </label>Mn
                                                                                        <ReactTooltip html={true} />
                                                                                    </td>
                                                                                ))}

                                                                            </tr>
                                                                        </tbody>
                                                                    </table>
                                                                </div>
                                                            </div>
                                                        </Modal>


                                                    </tbody>
                                                </table>

                                                    :
                                                    <div className="no-to-display">
                                                        <p className="">No Cost category to display</p>
                                                    </div>}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="save-button-row row">
                            <div className="col-sm-2">
                                <button type="button" className="btn btn-primary"
                                    disabled={SessionStorage.read("accessType") === "Read" ? true : false}
                                    style={{ cursor: SessionStorage.read("accessType") === "Read" ? "not-allowed" : 'pointer' }}
                                    onClick={SessionStorage.read("accessType") === "Read" ? 'return false;' : this.saveWsGiDetails}
                                >Save</button>
                            </div>
                        </div>
                    </div>
                    : selectedIconTab === 'act_and_del' ?
                        <div className="act-and-del-main">
                            <ActivitiesAndDeliverables
                                wsId={wsId}
                            ></ActivitiesAndDeliverables>
                        </div>
                        : ''
                }

                <CustomConfirmModal
                    ownClassName={'ws-del-delete-modal'}
                    isModalVisible={this.state.saveGenInfoModalVisible}
                    modalTitle={this.state.saveGenInfoModalTitle}
                    closeConfirmModal={this.closeSaveGenInfoConfirmModal}
                />

            </div>
        )
    }
}

export default withRouter(GeneralInformation);