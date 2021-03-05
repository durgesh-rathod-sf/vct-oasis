import React, { Component } from 'react';
import './developBusinessCaseNavbar.css';
import { withRouter } from "react-router-dom";
import { toast } from 'react-toastify';
import NotificationMessage from '../../components/NotificationMessage/NotificationMessage';
import { inject } from 'mobx-react';
import CommonData from '../DevelopBusinessCaseComponents/CommonData';
import KpiBenefitsData from '../DevelopBusinessCaseComponents/KpiBenefitsData';
import Investments from '../DevelopBusinessCaseComponents/Investments';
import BusinessCaseSummary from '../DevelopBusinessCaseComponents/BusinessCaseSummary';

var SessionStorage = require('store/storages/sessionStorage');

@inject('kpiBenefitsStore', 'commonParamsStore', 'investmentStore', "businessCaseSummaryStore")
class DevelopBusinessCaseNavbar extends Component {
    constructor(props) {
        super(props);
        this.handleClick = this.handleClick.bind(this);
        this.state = {
            selectedPage: 'commondata',
            isBusinessCase: true,
            isCommonParamsTab: true,
            commonDataList: [],
            checkedVal: '',
            result: {},
            initiatives: [],
            linkedKPIIds: [],
            addClicked: false,
            totalInvestmentsArray: [],
            KPIBenefitsArray: [],
            KPIDetailsArray: [],
            selectedKpiObj: {},
            cParamArray: [], 
            isLoading:false,
            //hideTooltips: false,
        }
        this.onBenefitProfileClick = this.onBenefitProfileClick.bind(this);
        this.onCommonParametersClick = this.onCommonParametersClick.bind(this);
        this.onIngestCommonData = this.onIngestCommonData.bind(this);
        this.onIngestKPIBenifits = this.onIngestKPIBenifits.bind(this);
        this.downloadInv = this.downloadInv.bind(this);
        this.downloadBusinessCaseTemplate = this.downloadBusinessCaseTemplate.bind(this);
        this.downloadCommonParams = this.downloadCommonParams.bind(this);
        this.downloadKpiBenifits = this.downloadKpiBenifits.bind(this);
        this.onIngestInvestments = this.onIngestInvestments.bind(this);
        this.fetchCommonData = this.fetchCommonData.bind(this);
        this.fetchKpiBenefits = this.fetchKpiBenefits.bind(this);
        this.getInvestments = this.getInvestments.bind(this);
        this.totalInvFormat = this.totalInvFormat.bind(this);
        this.handleDownload = this.handleDownload.bind(this);
        this.onIngestHandle = this.onIngestHandle.bind(this);
    }
    componentDidMount() {
        let kpiTab = SessionStorage.read('kpiTab')
        if (kpiTab === 'true') {
            this.setState({
                selectedPage: 'kpibenefitsdata'
            })
            SessionStorage.write('kpiTab', false)
        }
		 // this.fetchKpiBenefits(); // commented to not execute is benefit true like in dev
    }
    handleDownload() {
        const { selectedPage } = this.state;
        let tab = selectedPage;
        switch (tab) {
            case "commondata":
                this.downloadCommonParams()
                break;
            case "kpibenefitsdata":
                this.downloadKpiBenifits()
                break;
            case "investments":
                this.downloadInv()
                break;
            case "businesscasesummary":
                this.downloadBusinessCaseTemplate()
                break;
            default:
                break;
        }
    }
    onIngestHandle = (e) => {
        const { selectedPage } = this.state;
        let tab = selectedPage;
        switch (tab) {
            case "commondata":
                this.onIngestCommonData(e)
                break;
            case "kpibenefitsdata":
                this.onIngestKPIBenifits(e)
                break;
            case "investments":
                this.onIngestInvestments(e)
                break;
            // case "businesscasesummary":
            //     break;
            default:
                break;
        }
    }

    fetchCommonData() {
        const { commonParamsStore } = this.props;
        let i;
        
        commonParamsStore.getCommonParameters()
            .then((res) => {
                if (res && !res.error && res.data && res.data.resultCode === 'OK') {
                    let TempParamArray = [...commonParamsStore.paramList];
                    TempParamArray.map((param, paramIndex) => {
                        for(i=0;i<TempParamArray[paramIndex].data.length;i++){
                            TempParamArray[paramIndex].data[i].cpParamValue = {
                            "actualValue": param.data[i].cpParamValue,
                            "formattedValue": 0,
                        }}
                        return true;
                    });
                    this.setState({
                        commonDataList: [...TempParamArray],
                        maxIndexOnLoad: commonParamsStore.paramList.length - 1
                    });

                }else if(res && res.data && res.data.resultCode === 'KO'){
                    this.showErrNotification('error', res.data.errorDescription);
                }
            })
        return true;
    }

    fetchKpiBenefits() {
        const { kpiBenefitsStore } = this.props;
        kpiBenefitsStore.color = 'changeColor';
        kpiBenefitsStore.getKPIBenefits()
            .then((response) => {
                const { data } = response;
                if (response && !response.error && data.resultCode === 'OK') {
                    let paramArrayTemp = [];
                    var KPIDetails = [];
                    if (!kpiBenefitsStore.kpiId || kpiBenefitsStore.kpiId === undefined) {
                        kpiBenefitsStore.kpiId = kpiBenefitsStore.kpiBenefits[0].kpiId;
                        KPIDetails = kpiBenefitsStore.kpiBenefits[0];
                    }
                    else {
                        for (let i = 0; i < kpiBenefitsStore.kpiBenefits.length; i++) {
                            if (kpiBenefitsStore.kpiId === kpiBenefitsStore.kpiBenefits[i].kpiId) {
                                KPIDetails = kpiBenefitsStore.kpiBenefits[i];
                            }
                        }
                    }
                    if (KPIDetails.length === 0) {
                        kpiBenefitsStore.kpiId = kpiBenefitsStore.kpiBenefits[0].kpiId;
                        KPIDetails = kpiBenefitsStore.kpiBenefits[0];
                    }

                    let comParamArray = [];
                    kpiBenefitsStore.fetchParamsForKpiBenefits(kpiBenefitsStore.kpiId)
                        .then(response => {
                            const { data } = response;
                            if (response && !response.error && data.resultCode === 'OK') {
                                comParamArray = [...response.data.resultObj];
                            } else if (data.resultCode === 'KO') {
                                comParamArray = [];
                                this.showErrorNotification(data.errorDescription);
                            } else {
                                comParamArray = [];
                            }
                            if (kpiBenefitsStore.kpiBenefits.length > 0) {

                                KPIDetails && KPIDetails.paramDto && KPIDetails.paramDto.map((param, index) => {
                                    //param.data.map((value, valIndex) => {
                                        // tempArray.paramDto[index].paramValues[valIndex].paramValue = {
                                        //     "actualValue": value.paramValue,
                                        //     "formattedValue": 0,
                                        // };
                                        // return true;
                                    for (let i = 0; i < param.data.length; i++) {
                                        param.data[i].paramValue = {
                                            "actualValue": param.data[i].paramValue,
                                            "formattedValue": 0,
                                        }
                                    }
                                       // return true
                                    //});
                                    return true;
                                });
                                paramArrayTemp.push({
                                    kpiId: KPIDetails.kpiId,
                                    kpiUnit: KPIDetails.opKpiUnit,
                                    baseline: KPIDetails.baseline,
                                    target: KPIDetails.target,
                                    targetAchieved: KPIDetails.targetAchieved,
                                    paramDto: KPIDetails.paramDto,
                                    kpiBenefits: KPIDetails.kpiBenefits,
                                    kpiTrend: KPIDetails.kpiTrend,
                                    kpiType: KPIDetails.kpiType,
                                    kpiBusType: KPIDetails.kpiBusType
                                });
                                this.setState({
                                    KPIBenefitsArray: paramArrayTemp,
                                    KPIDetailsArray: KPIDetails,
                                    selectedKpiObj: paramArrayTemp[0],
                                    cParamArray: [...comParamArray]
                                });
                            }
                        });
                        
                    
                }else if (response && data.resultCode === 'KO'){
                    this.showErrNotification('error', data.errorDescription);
                }
            });
    };

    totalInvFormat() {
        const { result } = this.state;
        if (result) {
            for (let k = 0; k < result.investments.length; k++) {
                result.investments[k].total_investment_value = 0
            }
            for (let i = 0; i < result.initiatives.length; i++) {
                for (let j = 0; j < result.initiatives[i].year.length; j++) {
                    for (let k = 0; k < result.investments.length; k++) {
                        if (result.investments[k].year_no === result.initiatives[i].year[j].year_no) {

                            if (result.initiatives[i].year[j].inv_val.actualValue === '0') {
                                var tempResult = 0
                            }
                            else {
                                tempResult =
                                    //  Number( Math.round(Number(result.initiatives[i].year[j].inv_val.actualValue) * 10) / 10).toFixed(1)
                                    Number(result.initiatives[i].year[j].inv_val.actualValue).toFixed(30)
                            }
                            result.investments[k].total_investment_value = Number(result.investments[k].total_investment_value) + Number(tempResult)
                        }
                    }
                }
            }

            this.setState({
                totalInvestmentsArray: result.investments
            })
        }
    }

    getInvestments() {
        const { investmentStore } = this.props;
        // const payload = {
        //     mapId: SessionStorage.read('mapId')
        // }
        let linkedKPIIds = []
        let found = false;
        var maxYear = "";
        investmentStore.fetchInvestments()
            .then((response) => {
                if (!response.error) {
                    for (let i = 0; i < response.initiatives.length; i++) {
                        for (let k = 0; k < 5; k++) {
                            if (response.initiatives[i].year[k] !== undefined) {

                            } else {
                                let val = {
                                    inv_val: "", year_no: k + 1
                                }
                                response.initiatives[i].year.splice(k + 1, 0, val)
                            }
                        }
                    }
                    if (response.investments.length === 0) {
                        maxYear = 5;
                    }
                    else {
                        if (response.initiatives.length > 0) {
                            maxYear = response.initiatives[0].year.length
                        } else {
                            maxYear = 5;
                        }

                    }
                    for (let k = 0; k < maxYear; k++) {
                        if (response.investments[k] !== undefined) {

                        } else {
                            let val = {
                                total_investment_value: "",
                                year_no: k + 1
                            }
                            response.investments.splice(k + 1, 0, val)
                        }
                    }
                    for (let i = 0; i < response.initiatives.length; i++) {
                        for (let j = 0; j < response.initiatives[i].year.length; j++) {
                            if (response.initiatives[i].year[j].inv_val === 0) {
                                response.initiatives[i].year[j].inv_val = {
                                    'actualValue': '0',
                                    'formattedValue': 0
                                }
                            } else {
                                response.initiatives[i].year[j].inv_val = {
                                    'actualValue': response.initiatives[i].year[j].inv_val,
                                    'formattedValue': 0
                                }
                            }


                        }
                        for (let k = 0; k < response.KPI_list.length; k++) {
                            found = false
                            for (let j = 0; j < response.initiatives[i].linked_kpis.length; j++) {
                                if (response.KPI_list[k].kpi_id === response.initiatives[i].linked_kpis[j].kpi_id) {
                                    found = true;
                                    response.initiatives[i].linked_kpis[j].checked = true;
                                    response.initiatives[i].linkedValue = response.initiatives[i].linked_kpis[j].kpi_name
                                    if (response.initiatives[i].linked_kpis[j].cost_allocated_percent !== "" || response.initiatives[i].linked_kpis[j].cost_allocated_percent !== undefined) {
                                        this.setState({
                                            checkedVal: response.initiatives[i].linked_kpis[j].kpi_name
                                        })
                                    }
                                }
                            }
                            if (!found) {
                                let val = {
                                    kpi_id: response.KPI_list[k].kpi_id,
                                    kpi_name: response.KPI_list[k].operational_kpi,
                                    cost_allocated_percent: response.KPI_list[k].cost_allocated_percent,
                                    checked: false
                                }
                                response.initiatives[i].linked_kpis.push(val)
                            }
                        }
                    }
                    this.setState({
                        result: response,
                        initiatives: response.initiatives,
                        linkedKPIIds: linkedKPIIds,
                        addClicked: false
                    })
                    investmentStore.tempResult = response
                    // this.calculateTotalInvestments()
                    this.totalInvFormat()
                    return response
                } else if(response.error){
                    this.showErrNotification('error','Sorry! Something went wrong');
                }
            })
    }
   
    downloadBusinessCaseTemplate = (event) => {
        const { businessCaseSummaryStore } = this.props;
        this.setState({
            isLoading:true
        })
        businessCaseSummaryStore.downloadBusinessCaseTemplate()
            .then((res) => {
                if (!res || res.error) {
                    this.showNotification('downloadError')
                }
                this.setState({
                    isLoading:false
                })
            })
    }

    downloadInv = (event) => {
        const { kpiBenefitsStore } = this.props;
        this.setState({
            isLoading:true
        })
        kpiBenefitsStore.downloadFetchInvestments()
            .then((res) => {
                if (!res || res.error) {
                    this.showNotification('downloadError')
                }
                this.setState({
                    isLoading:false
                })
            })


    }
    downloadCommonParams = (event) => {
        const { kpiBenefitsStore } = this.props;
        this.setState({
            isLoading:true
        })
        kpiBenefitsStore.downloadCommonParameters()
            .then((res) => {
                if (!res || res.error) {
                    this.showNotification('downloadError')
                }
                this.setState({
                    isLoading:false
                })
            })

    }
    downloadKpiBenifits = (event) => {
        const { kpiBenefitsStore } = this.props;
        this.setState({
            isLoading:true
        })
        kpiBenefitsStore.downloadKPIBenifits()
            .then((res) => {
                if (!res || res.error) {
                    this.showNotification('downloadError')
                }
                this.setState({
                    isLoading:false
                })
            })
    }
    showErrNotification(type, message) {
        switch (type) {
            case 'success':
                toast.info(<NotificationMessage
                    title="Success"
                    bodytext={message}
                    icon="success"
                />, {
                    position: toast.POSITION.BOTTOM_RIGHT,
                });
                break;
            case 'error':
                toast.error(<NotificationMessage
                    title="Error"
                    bodytext={message}
                    icon="error"
                />, {
                    position: toast.POSITION.BOTTOM_RIGHT,
                });
                break;
            default:
                break;
        }
    }
    showNotification(type) {
        const { kpiBenefitsStore } = this.props;
        switch (type) {
            case 'fileUploadSuccess':
                toast.info(<NotificationMessage
                    title="Success"
                    bodytext={'Successfully uploaded file'}
                    icon="success"
                />, {
                    position: toast.POSITION.BOTTOM_RIGHT
                });
                break;
            case 'fileUploadFailure':
                toast.error(<NotificationMessage
                    title="Error"
                    bodytext={kpiBenefitsStore.cpUploadErr}
                    icon="error"
                />, {
                    position: toast.POSITION.BOTTOM_RIGHT
                });
                break;
            case "InvUploadFailure":
                toast.error(<NotificationMessage
                    title="Error"
                    bodytext={kpiBenefitsStore.InvUploadErr}
                    icon="error"
                />, {
                    position: toast.POSITION.BOTTOM_RIGHT
                });
                break;
            case "fileUploadErr":
                toast.error(<NotificationMessage
                    title="Error"
                    bodytext={kpiBenefitsStore.kpiUploadError}
                    icon="error"
                />, {
                    position: toast.POSITION.BOTTOM_RIGHT
                });
                break;
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

    isValidFileSize(file) {
        let fileSize = Math.round(((file.size) / 1048576)); // filesize in MB
        if (fileSize > 1) {
            return false;
        }
        return true;
    }

    isValidFileExtension(file) {
        let fileName = file.name;
        let fileExtension = fileName.split('.').pop();
        if (fileExtension !== "xlsx") {
            return false;
        }
        return true;
    }

    onIngestKPIBenifits = (event) => {
        event.preventDefault();
        const { kpiBenefitsStore } = this.props;
        const file = event.target.files[0];
        if (event.target.files[0] !== undefined) {
            this.setState({
                kpiBaselineUpload: true
            })
            if (!this.isValidFileSize(file) && !this.isValidFileExtension(file)) {
                // alert("file is too large, maximum supported file size is 1MB and file format allowed is '.xlsx' ");
                this.showErrNotification("error", "file is too large, maximum supported file size is 1MB and file format allowed is '.xlsx' ");
            } else if (!this.isValidFileExtension(file)) {
                // alert("invalid file format, allowed is '.xlsx'");
                this.showErrNotification("error", ("invalid file format, allowed is '.xlsx'"));
            }
            else if (!this.isValidFileSize(file)) {
                // alert("file is too large, maximum supported file size is 1MB");
                this.showErrNotification("error", ("file is too large, maximum supported file size is 1MB"));
            }
            else {
                kpiBenefitsStore.ingestKpiBenifits(file)
                    .then((response) => {
                        this.setState({
                            kpiBaselineUpload: false,
                        })
                        if (response && !response.error) {
                            this.setState({
                                selectedFile: file,
                                loaded: 0,
                                fileName: file.name,
                                calculateBtn: false,
                                generateTargetBtn: false
                            })
                            // setKpiTargetStore.generateTargetBtn = false  
                            this.fetchKpiBenefits()
                            this.showNotification('fileUploadSuccess')
                        } else {

                            if (kpiBenefitsStore.kpiUploadError) {
                                this.showNotification('fileUploadErr');
                            }
                            else if(kpiBenefitsStore.saveError) {
                                this.showNotification('fileUploadFailure');
                            }
                        }
                    })
            }
            document.getElementById("file").value = "";
        }
    }

    onIngestCommonData = (event) => {
        event.preventDefault();
        const { kpiBenefitsStore } = this.props;
        const file = event.target.files[0]
        if (event.target.files[0] !== undefined) {
            this.setState({
                kpiBaselineUpload: true
            })
            if (!this.isValidFileSize(file) && !this.isValidFileExtension(file)) {
                // alert("file is too large, maximum supported file size is 1MB and file format allowed is '.xlsx' ");
                this.showErrNotification("error", "file is too large, maximum supported file size is 1MB and file format allowed is '.xlsx' ")
            } else if (!this.isValidFileExtension(file)) {
                // alert("invalid file format, allowed is '.xlsx'");
                this.showErrNotification("error", "invalid file format, allowed is '.xlsx'");
            }
            else if (!this.isValidFileSize(file)) {
                // alert("file is too large, maximum supported file size is 1MB");
                this.showErrNotification("error", "file is too large, maximum supported file size is 1MB");
            } else {
                kpiBenefitsStore.ingestCommonData(file)
                    .then((response) => {
                        this.setState({
                            kpiBaselineUpload: false,
                        })
                        if (response && !response.error) {
                            this.setState({
                                selectedFile: file,
                                loaded: 0,
                                fileName: file.name,
                                calculateBtn: false,
                                generateTargetBtn: false
                            })
                            // setKpiTargetStore.generateTargetBtn = false
                            this.fetchCommonData()
                            this.showNotification('fileUploadSuccess')
                        } else {
                            this.showNotification('fileUploadFailure')
                        }
                    })
            }
            document.getElementById("file").value = "";
        }
    }

    onIngestInvestments = (event) => {
        event.preventDefault();
        const { kpiBenefitsStore } = this.props;
        const file = event.target.files[0];
        if (event.target.files[0] !== undefined) {
            this.setState({
                kpiBaselineUpload: true
            })
            if (!this.isValidFileSize(file) && !this.isValidFileExtension(file)) {
                // alert("file is too large, maximum supported file size is 1MB and file format allowed is '.xlsx' ");
                this.showErrNotification("error", "file is too large, maximum supported file size is 1MB and file format allowed is '.xlsx' ")
            } else if (!this.isValidFileExtension(file)) {
                // alert("invalid file format, allowed is '.xlsx'");
                this.showErrNotification("error", "invalid file format, allowed is '.xlsx'");
            }
            else if (!this.isValidFileSize(file)) {
                // alert("file is too large, maximum supported file size is 1MB");
                this.showErrNotification("error", "file is too large, maximum supported file size is 1MB");
            } else {
                kpiBenefitsStore.uploadInvestments(file)
                    .then((response) => {
                        this.setState({
                            kpiBaselineUpload: false,
                        })
                        if (response && !response.error) {
                            this.setState({
                                selectedFile: file,
                                loaded: 0,
                                fileName: file.name,
                                calculateBtn: false,
                                generateTargetBtn: false
                            })
                            // setKpiTargetStore.generateTargetBtn = false
                            this.getInvestments()
                            this.showNotification('fileUploadSuccess')
                        } else {
                            if (kpiBenefitsStore.InvUploadErr !== "") {
                                this.showNotification('InvUploadFailure')
                            }
                            else {
                                this.showNotification('fileUploadFailure');
                            }

                        }
                    })
            }
            document.getElementById("file").value = "";
        }
    }
    onCommonParametersClick() {

        this.setState({
            isCommonParamsTab: true
        })
    }
    onBenefitProfileClick() {
        this.setState({
            isCommonParamsTab: false
        })
    }
    handleClick(type) {
        this.setState({
            selectedPage: type
        });
        this.props.selectedPage(type)
    }


    render() {
        const { selectedPage, commonDataList } = this.state
        return (
            <div className="tab-content-outer-wrapper " id="DBC">

                <div className="row tab navMenu">

                    <ul className="nav nav-tabs tab_menu">
                        <li className={this.state.selectedPage === 'commondata' ? "active" : ""} data-toggle="tab" onClick={() => this.handleClick('commondata')}>Common Data</li>
                        <li className={this.state.selectedPage === 'kpibenefitsdata' ? "active" : ""} data-toggle="tab" onClick={() => this.handleClick('kpibenefitsdata')} >Benefits</li>
                        <li className={this.state.selectedPage === 'investments' ? "active" : ""} data-toggle="tab" onClick={() => this.handleClick('investments')}>Investments</li>
                        <li className={this.state.selectedPage === 'businesscasesummary' ? "active" : ""} data-toggle="tab" onClick={() => this.handleClick('businesscasesummary')}>Business Case Summary</li>
                    </ul>
                   
                    <div className="Icon_menu">
                       
                    </div>
                </div>


                {selectedPage && selectedPage === "commondata" ?
                    <div style={{ width: "100%", position: "relative" }}>
                      
                        <CommonData
                            isBusinessCase={this.state.isBusinessCase}
                            isCommonParamsTab={this.state.isCommonParamsTab}
                            onCommonParametersClick={this.onCommonParametersClick}
                            onBenefitProfileClick={this.onBenefitProfileClick}
                            fetchCommonData={this.fetchCommonData}
                            commonDataList={commonDataList}
                            maxIndexOnLoad={this.state.maxIndexOnLoad}
                            selectedTab={this.state.selectedPage}
                            handleDownload={this.handleDownload}
                            handleupload={this.handleupload}
                            onIngestHandle={this.onIngestHandle}
                            isLoading={this.state.isLoading}
                        />
                    </div> : ""
                }
                {selectedPage && selectedPage === "kpibenefitsdata" ?
                    <div style={{ width: "100%", position: "relative" }}>
                       
                        <KpiBenefitsData
                            isBusinessCase={this.state.isBusinessCase}
                            KPIBenefitsArray={this.state.KPIBenefitsArray}
                            KPIDetailsArray={this.state.KPIDetailsArray}
                            selectedKpiObj={this.state.selectedKpiObj}
                            fetchKpiBenefits={this.fetchKpiBenefits}
                            handleDownload={this.handleDownload}
                            handleupload={this.handleupload}
                            onIngestHandle={this.onIngestHandle}
                            cParamArray={this.state.cParamArray}
                            isLoading={this.state.isLoading}
                            //onSortEnd = {this.onSortEnd}
                            //beforeSorting = {this.beforeSorting}
                            //hideTooltips = {this.state.hideTooltips}
                        />

                    </div> : ""
                }
                {selectedPage && selectedPage === "investments" ?
                    <div>
                       
                        <div>
                            <Investments
                                isBusinessCase={this.state.isBusinessCase}
                                getInvestments={this.getInvestments}
                                totalInvFormat={this.totalInvFormat}
                                result={this.state.result}
                                initiatives={this.state.initiatives}
                                linkedKPIIds={this.state.linkedKPIIds}
                                addClicked={this.state.addClicked}
                                totalInvestmentsArray={this.state.totalInvestmentsArray}
                                handleDownload={this.handleDownload}
                                handleupload={this.handleupload}
                                onIngestHandle={this.onIngestHandle}
                                isLoading={this.state.isLoading}
                            />
                        </div>
                    </div> : ""
                }
                {selectedPage && selectedPage === "businesscasesummary" ?
                    <div style={{ width: "100%" }}>
                        <BusinessCaseSummary isBusinessCase={this.state.isBusinessCase}
                            handleDownload={this.handleDownload}
                            handleupload={this.handleupload}
                            isLoading={this.state.isLoading} />
                    </div>

                    : ""
                }
            </div>
        );
    }
}

export default withRouter(DevelopBusinessCaseNavbar);
