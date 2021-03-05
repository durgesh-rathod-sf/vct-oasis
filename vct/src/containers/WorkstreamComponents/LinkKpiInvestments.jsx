import React, { Component } from 'react';
import { withRouter } from "react-router-dom";
import { inject } from 'mobx-react';
import LinkKPI from './LinkKPi';
import LinkCostCategories from './LinkCostCategories';
import saveIco from "../../assets/project/workstream/saveIcon.png";
import linkKpiIcon from "../../assets/project/workstream/link-kpi.svg";
//import linkCostIcon from "../../assets/project/workstream/currency-cost.svg";
import linkCostIcon from "../../assets/project/workstream/currencylink-cost-cat.svg";
import closeIcon from "../../assets/project/workstream/modal-close.svg";
import ReactTooltip from 'react-tooltip';
import { toast } from 'react-toastify';
import NotificationMessage from '../../components/NotificationMessage/NotificationMessage';

import './LinkKpiInvestments.css';
var SessionStorage = require('store/storages/sessionStorage');

@inject('linkKPIInvestmentStore')
class LinkKpiInvestments extends Component {
    constructor(props) {
        super(props);
        this.state = {
            buttonClicked: "",
            linkKpiObj: {},
            linkCostCatObj: {},
            saveLoading:false
        }
        this.handleOptionClick = this.handleOptionClick.bind(this);
        this.closeLinkedKPI = this.closeLinkedKPI.bind(this);
    }

    componentDidMount() {
        this.getworkStreamKPI();
        this.getworkStreamCostCategories();
        const { linkKPIInvestmentStore } = this.props;
        linkKPIInvestmentStore.optionClickedForSave = "";
        linkKPIInvestmentStore.linkKPIInvestmentsSaveRequest = [];
        linkKPIInvestmentStore.linkCostCategoriesSaveRequest = [];
    }
    checkCostCatTotalSum() {
        const { linkKPIInvestmentStore } = this.props;
        linkKPIInvestmentStore.costCatTotalSumArray = [];
        Object.values(linkKPIInvestmentStore.costColSum).forEach((value) => {
            console.log(value, typeof value);
            Object.keys(value).forEach((val) => {
                console.log(val, value[val]);
                if (value[val] !== 100) {
                    linkKPIInvestmentStore.costCatTotalSumArray.push({ [val]: value[val] })
                }
            });

        });
        var str = '';
        for (var i = 0; i < linkKPIInvestmentStore.costCatTotalSumArray.length; i++) {
            Object.keys(linkKPIInvestmentStore.costCatTotalSumArray[i]).forEach((val) => {
                str += val + ", ";
            });
        }
        return str;
    }
    checkKPITotalSum() {
        const { linkKPIInvestmentStore } = this.props;
        linkKPIInvestmentStore.kpiTotalSumArray = [];
        Object.values(linkKPIInvestmentStore.kpiColSum).forEach((value) => {
            console.log(value, typeof value);
            Object.keys(value).forEach((val) => {
                console.log(val, value[val]);
                if (value[val] !== 100) {
                    linkKPIInvestmentStore.kpiTotalSumArray.push({ [val]: value[val] })
                }
            });

        });
        var str = '';
        for (var i = 0; i < linkKPIInvestmentStore.kpiTotalSumArray.length; i++) {
            Object.keys(linkKPIInvestmentStore.kpiTotalSumArray[i]).forEach((val) => {
                str += val + ", ";
            });
        }
        return str;
    }
    getworkStreamKPI() {
        const { linkKPIInvestmentStore } = this.props;
        // const payload = {
        //     mapId: SessionStorage.read('mapId')
        // }
        linkKPIInvestmentStore.fetchWorkStreamKpiInvestments()
            .then((response) => {
                if (response !== null) {
                    if (!response.error && response.resultCode === "OK" && response.resultObj !== null) {
                        this.setState({
                            linkKpiObj: response.resultObj,
                            buttonClicked: "linkkpi"
                        })
                    } else if (!response.error && response.resultCode === "KO") {
                        this.showNotification("getKPIsError");
                    }
                }
            })
    }
    getworkStreamCostCategories() {
        const { linkKPIInvestmentStore } = this.props;
        linkKPIInvestmentStore.fetchWorkStreamCostCategories()
            .then((response) => {
                if (response !== null) {
                    if (!response.error && response.resultCode === "OK" && response.resultObj !== null) {
                        this.setState({
                            linkCostCatObj: response.resultObj,
                            buttonClicked: "linkkpi"
                        })
                    }else if(!response.error && response.resultCode === "KO" ){
                        this.showNotification('wscategoriesError', response.errorDescription);
                    }
                }
            })
    }
    saveWorkStreamKpiInvestments() {
        const { linkKPIInvestmentStore } = this.props;
        const columnNames = this.checkKPITotalSum();
        if (Object.keys(linkKPIInvestmentStore.linkKPIInvestmentsSaveRequest).length > 0) {
            if (linkKPIInvestmentStore.kpiRowSum.length > 0) {
                this.showNotification('msg',
                    // "Please link a one KPI to " + (linkKPIInvestmentStore.kpiRowSum[0].ws) + " Workstream(s)"
                    "Please link a KPI to Workstream"
                )
            }
            else {
                if (linkKPIInvestmentStore.kpiTotalSumArray.length > 0) {
                    this.showNotification('msg', `please adjust the kpi percentages to 100% for ${columnNames} column(s)`)
                }
                // else{
                //     if(linkKPIInvestmentStore.kpiRowSum.length > 0){
                //     // this.showNotification('msg',"please adjust the Work Stream percentages to 100% for "+(linkKPIInvestmentStore.kpiRowSum[0].ws)+" row")
                // }
                else {
                    this.setState({
                        saveLoading:true    
                    })
                    const payload = {
                        mapId: SessionStorage.read('mapId'),
                        wsKPIs: linkKPIInvestmentStore.linkKPIInvestmentsSaveRequest
                    };
                    linkKPIInvestmentStore.saveWorkStreamKpiInvestments(payload)
                        .then((response) => {
                            if (response !== null) {
                                console.log(response.data.resultCode);
                                if (!response.error && response.data.resultCode === "OK") {
                                    linkKPIInvestmentStore.linkKPIInvestmentsSaveRequest = [];
                                    this.setState({
                                        saveLoading:false    
                                    })
                                    this.showNotification('success', "Linked KPI's Saved Successfully")
                                    this.props.closeLinkKpiView();
                                } else if (!response.error && response.data.resultCode === "KO") {
                                    this.setState({
                                        saveLoading:false    
                                    })
                                    this.showNotification('failure')
                                }
                            }
                        })
                }
            }
            // }

        }
        else {
            this.showNotification('msg', "Please Make any changes and save")
        }
    }

    saveWorkStreamCostCategories() {
        const { linkKPIInvestmentStore } = this.props;

        const columnNames = this.checkCostCatTotalSum();
        if (Object.keys(linkKPIInvestmentStore.linkCostCategoriesSaveRequest).length > 0) {
            if (linkKPIInvestmentStore.costRowSum.length > 0) {
                this.showNotification('msg',
                    // "Please link any cost category to " + (linkKPIInvestmentStore.costRowSum[0].ws) + " workstream(s)"
                    "Please link a Cost Category to Workstream"
                )
            }
            else {
                if (linkKPIInvestmentStore.costCatTotalSumArray.length > 0) {
                    this.showNotification('msg', `Please adjust the cost categories percentages to 100% for ${columnNames} column(s)`)


                }
                else {
                    this.setState({
                        saveLoading:true
                    })
                    const payload = {
                        mapId: SessionStorage.read('mapId'),
                        costCategories: linkKPIInvestmentStore.linkCostCategoriesSaveRequest
                    };
                    linkKPIInvestmentStore.saveWorkStreamCostCat(payload)
                        .then((response) => {
                            if (response !== null) {
                                if (!response.error && response.data.resultCode === "OK") {
                                    linkKPIInvestmentStore.linkCostCategoriesSaveRequest = [];
                                    this.setState({
                                        saveLoading:false
                                    })
                                    this.showNotification('success', "Linked Cost Categories Saved Successfully")
                                    this.props.closeLinkKpiView();
                                } else if (!response.error && response.data.resultCode === "KO") {
                                    this.setState({
                                        saveLoading:false
                                    })
                                    this.showNotification('failure')
                                }
                            }
                        })
                }
            }
            // }
        }
        else {
            this.showNotification('msg', "Please Make any changes and save")
        }

    }

    showNotification(type, msg) {
        switch (type) {
            case 'success':
                toast.info(<NotificationMessage
                    title="Success"
                    bodytext={msg}
                    icon="success"
                />, {
                    position: toast.POSITION.BOTTOM_RIGHT
                });
                break;
            case 'getKPIsError':
                toast.error(<NotificationMessage
                    title="Error"
                    bodytext={'Error occured while retrieving KPIs'}
                    icon="error"
                />, {
                    position: toast.POSITION.BOTTOM_RIGHT
                });
                break;
            case 'failure':
                toast.error(<NotificationMessage
                    title="Error"
                    bodytext={"Error occured while saving KPIs"}
                    icon="error"
                />, {
                    position: toast.POSITION.BOTTOM_RIGHT
                });
                break;
            case 'msg':
                toast.error(<NotificationMessage
                    title="Warning"
                    bodytext={msg}
                    icon="error"
                />, {
                    position: toast.POSITION.BOTTOM_RIGHT
                });
                break;
            case 'wscategoriesError':
                toast.error(<NotificationMessage
                    title="Error"
                    bodytext={msg}
                    icon="error"
                />, {
                    position: toast.POSITION.BOTTOM_RIGHT
                });
                break;
            default:
                console.log("Default");
                break;
        }
    }

    handleOptionClick = (e) => {
        const { linkKPIInvestmentStore } = this.props;
        console.log(e.target.id);
        switch (e.target.id) {
            case 'linkCostCategories':
                this.setState({
                    buttonClicked: "linkCostCategories"
                }, () => {
                    linkKPIInvestmentStore.optionClickedForSave = this.state.buttonClicked
                }
                );
                break;
            case 'saveKpi':
                // this.setState({
                //     buttonClicked: "saveKpi"
                // },()=>{
                if (linkKPIInvestmentStore.optionClickedForSave === "linkCostCategories") {
                    this.saveWorkStreamCostCategories();
                }
                else {
                    this.saveWorkStreamKpiInvestments();

                }

                // }
                // );
                break;
            default:
                this.setState({
                    buttonClicked: "linkkpi"
                }, () => {
                    linkKPIInvestmentStore.optionClickedForSave = this.state.buttonClicked
                })
                break;
        }
    }
    handleView() {
        switch (this.state.buttonClicked) {
            case 'linkCostCategories':
                return <LinkCostCategories linkcostCatData={this.state.linkCostCatObj} />;
            default:
                return <LinkKPI linkkpidata={this.state.linkKpiObj} />;
        }
    }

    closeLinkedKPI() {
        //window.location.reload();
        // const {history} = this.props;
        // history.push('/workstream-home');
        this.props.closeLinkKpiView();
     }


     saveButtonDisable() {
      const noCostCategory =  (this.state.linkCostCatObj && Object.keys(this.state.linkCostCatObj).length > 0 && this.state.linkCostCatObj.wsCostCategories[0].linkedCostCategories.length === 0);
      return noCostCategory;
     }
   
    
    render() {
        // const pname = SessionStorage.read('projectName');
        // const demoUser = SessionStorage.read('demoUser');
        // const option = SessionStorage.read('option_selected');
        const { linkKpiObj, linkCostCatObj,saveLoading } = this.state;
        
        // const noKPI = !(linkCostCatObj && Object.keys(linkCostCatObj).length > 0 && linkCostCatObj.wsCostCategories[0].linkedCostCategories.length > 0)
        const noKPI = !(linkKpiObj && Object.keys(linkKpiObj).length > 0 && linkCostCatObj && Object.keys(linkCostCatObj).length > 0)
        console.log("test for length:", Object.keys(linkKpiObj).length, Object.keys(linkCostCatObj).length);
        const getTooltip = (value) => {
            if (value) {
                let val = String(value)
                return `${val}`;
            }
        }
        return (
            <div className="link-kpi-investments-tab">
                <div className="link-common-header row">
                    <div className="col-sm-8 link-kpi-header-tag">
                        {
                            noKPI ?
                                <label className="linkkpitext">Loading Link KPIs and Link Investments details</label> :
                                this.state.buttonClicked === 'linkCostCategories' ?
                                    <label className="linkkpitext">{(linkCostCatObj && Object.keys(linkCostCatObj).length > 0 && linkCostCatObj.wsCostCategories[0].linkedCostCategories.length > 0) ? "Link cost categories to workstreams by entering % contribution" : ""}</label> :
                                    <label className="linkkpitext">{(linkKpiObj && Object.keys(linkKpiObj).length > 0 && linkKpiObj.wsLinkedKPIs[0].linkedKPIs.length > 0) ? "Link KPIs to workstreams by entering % contribution" : ""}</label>
                        }

                    </div>
                    <div className="col-sm-4 link-icon-stack">
                        {noKPI ?
                            <div id="close">
                                <img src={closeIcon} alt="close" id="close"
                                    data-tip={getTooltip("Close")} data-type="dark" data-place="left"
                                    onClick={() => { this.closeLinkedKPI() }} />
                                <ReactTooltip html={true} />
                            </div>
                            :
                            <>
                                <div className={this.state.buttonClicked !== "linkCostCategories" ? "active-icon" : "disabled-icon"}
                                    id="linkKpi" onClick={this.handleOptionClick} >
                                    <img src={linkKpiIcon} alt="linkKpi"
                                        data-tip={getTooltip("Link KPIs")} data-type="dark" data-place="bottom"
                                        id="linkKpi" onClick={this.handleOptionClick} />
                                    <ReactTooltip html={true} />
                                </div>
                                <div className={this.state.buttonClicked === "linkCostCategories" ? "active-icon" : "disabled-icon"}
                                    id="linkCostCategories" onClick={this.handleOptionClick}>
                                    <img src={linkCostIcon} alt="costcat"
                                        data-tip
                                        data-for="linkcc"
                                        data-type="dark" data-place="left"
                                        id="linkCostCategories" onClick={this.handleOptionClick} />
                                    <ReactTooltip html={true} id="linkcc">Link Cost Category</ReactTooltip>
                                </div>
                                <div id="close">
                                    <img src={closeIcon} alt="close" id="close"
                                        data-tip={getTooltip("Close")} data-type="dark" data-place="left"
                                        onClick={() => { this.closeLinkedKPI() }} />
                                    <ReactTooltip html={true} />
                                </div>
                            </>
                        }

                    </div>

                </div>

                {/* <h5 className="linkkpitext">Please link KPIs to workstreams by entering % contribution</h5> */}
                <div className="link-kpi-bgc">
                    <div className="tableSection">
                        {/* {(Object.keys(linkKpiObj).length > 0 || Object.keys(linkCostCatObj).length > 0) && this.handleView()} */}
                        {
                            noKPI ?
                                <div className="ws-spinner-div">
                                    <i className="fa fa-spinner fa-spin" style={{ height: "min-content", fontSize: '25px', color: '#ffffff' }}></i>
                                </div> :
                                (this.state.buttonClicked === "linkCostCategories") ?
                                    <LinkCostCategories linkcostCatData={this.state.linkCostCatObj} /> :
                                    <LinkKPI linkkpidata={this.state.linkKpiObj} />
                        }
                    </div>

                    {noKPI ?
                        ''
                        :
                        <div className="link-kpi-save-row row">
                            <div className="" id="saveKpi"
                            // style={{cursor: SessionStorage.read("accessType") === "Read" ?"not-allowed":'pointer'}}
                            // onClick={SessionStorage.read("accessType") === "Read"?'return false;':this.handleOptionClick}
                            >
                                <button type="button" src={saveIco} className="btn btn-primary" id="saveKpi"
                                    disabled={(SessionStorage.read("isMaster") === "Y" || (SessionStorage.read("accessType") === "Read")||saveLoading || 
                                    (this.state.buttonClicked === "linkCostCategories" && this.saveButtonDisable())) ? true : false}
                                    style={{ cursor: (SessionStorage.read("isMaster") === "Y" || (SessionStorage.read("accessType") === "Read")) ? "not-allow ed" : (saveLoading?"default":'pointer'), minWidth: "85px" }}
                                    onClick={(SessionStorage.read("isMaster") === "Y" || (SessionStorage.read("accessType") === "Read")||saveLoading) ? 'return false;' : this.handleOptionClick}
                                >
                                    {saveLoading?"Saving...":"Save"}
                                </button>
                            </div>
                        </div>
                    }
                </div>

            </div>
        )
    }
}

export default withRouter(LinkKpiInvestments);