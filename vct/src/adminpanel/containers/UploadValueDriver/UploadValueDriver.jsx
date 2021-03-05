import React, { Component, Fragment } from 'react';
import { withRouter } from "react-router-dom";
import { toast } from 'react-toastify';
import NotificationMessage from '../../../components/NotificationMessage/NotificationMessage';
import Menu from '../../../components/Menu/Menu';
import './UploadValueDriver.css';
import { observer, inject } from 'mobx-react';
import AddVDTElement from '../AddVDTElement/AddVDTElement';
import AdminEditVDT from './AdminEditVDT.jsx';
import UploadBulkTemplate from './UploadBulkTemplate';
import PotentialDuplicatesModal from './PotentialDuplicatesModal'
import pencil from "../../../assets/admin/pencil.svg";
import PlusIcon from "../../../assets/newDealsIcons/addPlus.svg";
import downloadIco from "../../../assets/project/fvdt/download.svg";
import uploadIco from "../../../assets/project/fvdt/upload.svg";
import { SetS3Config } from '../../../containers/Login/Login';
import Storage from '@aws-amplify/storage';
import ReactTooltip from 'react-tooltip';

const env = process.env.REACT_APP_BASE_URL;
@inject('adminStore')
@observer
class UploadValueDriver extends Component {
    constructor(props) {
        super(props);
        this.state = {
            selectedObjective: 'Strategic Objective',
            addObjective: true,
            objectiveValue: '',
            kpiId: null,
            kpiName: "",
            kpiDescription: "",
            kpiFormula: "",
            kpiTrend: "",
            kpiType: "",
            kpiUnit: "",
            calculationType: "",
            loader: false,
            objectiveError: "",
            kpiNameError: "",
            kpiDescriptionError: "",
            kpiFormulaError: "",
            uploadModalOpen: false,
            industriesList: [],
            businessList: [],
            selectedIndustries: [],
            selectedBusiness: [],
            openPotentialDuplicatesModal: false,
            potentialDuplicates: [],
            successCount: null,
            taskId: null,
            foBoTypes: [],
            isSaveSuccess: false,
            isSaveloading: false,
            isDownloadLoading:false
        };
        this.onSelectObjective = this.onSelectObjective.bind(this)
        this.onObjectiveValueChange = this.onObjectiveValueChange.bind(this)
        this.saveObjectives = this.saveObjectives.bind(this)
        this.redirectHandler = this.redirectHandler.bind(this);
        this.downloadBulkTemplate = this.downloadBulkTemplate.bind(this);
    }

    selectedIndustries = (selected) => {
        this.setState({
            selectedIndustries: selected
        })
    }

    selectedBusiness = (selected) => {
        this.setState({
            selectedBusiness: selected
        })
    }

    componentDidMount() {
        this.getIndustriesList();
        this.getBusinessList();
        this.fetchFoBoCategories();
    }

    fetchFoBoCategories() {
        const { adminStore } = this.props;
        adminStore.fetchFoBoCategories()
            .then(response => {
                if (response && response.data && response.data.resultCode === 'OK') {
                    this.setState({
                        foBoTypes: response.data.resultObj,
                    })
                } else if (response && response.data && response.data.resultCode === 'KO') {
                    this.showErrorNotification(response.data.errorDescription)
                }
                return true;
            });
    }

    getIndustriesList() {
        const { adminStore } = this.props;
        adminStore.getIndustriesList()
            .then(response => {
                if (response && response.data && response.data.resultCode === 'OK') {
                    let industriesList = [];
                    response.data.resultObj.map((data, index) => {
                        let industry = { value: data.industryId, label: data.industryName }
                        industriesList.push(industry);
                    });
                    this.setState({
                        industriesList: industriesList,
                    })
                } else if (response && response.data && response.data.resultCode === 'KO') {
                    this.showErrorNotification(response.data.errorDescription)
                }
                return true

            });
    }
    getBusinessList() {
        const { adminStore } = this.props;
        adminStore.getBusinessList()
            .then(response => {
                if (response && response.data && response.data.resultCode === 'OK') {
                    let businessList = [];
                    response.data.resultObj.map((data, index) => {
                        let business = { value: data.businessId, label: data.businessName }
                        businessList.push(business);
                    });
                    this.setState({
                        businessList: businessList,
                    })
                } else if (response && response.data.resultCode === 'KO') {
                    this.showErrorNotification(response.data.errorDescription);
                }
                else {
                }
                return true
            });
    }



    onSelectObjective = (event) => {
        this.setState({
            objectiveValue: '',
            kpiName: "",
            kpiDescription: "",
            kpiFormula: "",
            kpiTrend: "",
            kpiType: "",
            kpiUnit: "",
            calculationType: "",
            selectedObjective: event.target.id,
            objectiveError: "",
            kpiNameError: "",
            kpiDescriptionError: "",
            kpiFormulaError: "",
        })
    }

    onAddOrDeleteSelected = (event) => {
        this.setState({
            addObjective: event.target.id === 'Add' ? true : false,
            objectiveValue: '',
            kpiName: "",
            kpiDescription: "",
            kpiFormula: "",
            kpiTrend: "",
            kpiType: "",
            kpiUnit: "",
            calculationType: "",
            objectiveError: "",
            kpiNameError: "",
            kpiDescriptionError: "",
            kpiFormulaError: "",
        })

    }

    onObjectiveValueChange = (event) => {
        const { selectedObjective } = this.state
        let errors = '';

        if (selectedObjective !== 'KPI') {
            errors = !RegExp(/[<>!'"[\]]/).test(event.target.value) ? '' : 'Please enter valid value. Special characters [ < ! \' " > ] are invalid';
            this.setState({
                objectiveValue: event.target.value,
                objectiveError: errors
            })
        }
        else {
            switch (event.target.id) {
                case 'objective':
                    errors = !RegExp(/[<>!'"[\]]/).test(event.target.value) ? '' : 'Please enter valid KPI name. Special characters [ < ! \' " > ] are invalid';
                    this.setState({
                        objectiveValue: event.target.value,
                        kpiName: event.target.value,
                        kpiNameError: errors
                    })
                    break;
                case 'KPI Description':
                    errors = !RegExp(/[<>!'"[\]]/).test(event.target.value) ? '' : 'Please enter valid description. Special characters [ < ! \' " > ] are invalid';
                    this.setState({
                        kpiDescription: event.target.value,
                        kpiDescriptionError: errors
                    })
                    break;
                case 'KPI Formula':
                    errors = !RegExp(/[<>!'"[\]]/).test(event.target.value) ? '' : 'Please enter valid formula. Special characters [ < ! \' " > ] are invalid';
                    this.setState({
                        kpiFormula: event.target.value,
                        kpiFormulaError: errors
                    })
                    break;
                case 'KPI Trend':
                    this.setState({
                        kpiTrend: event.target.value
                    })
                    break;
                case 'KPI Type':
                    this.setState({
                        kpiType: event.target.value
                    })
                    break;
                case 'KPI Unit':
                    this.setState({
                        kpiUnit: event.target.value
                    })
                    break;
                case 'Calculation Type':
                    this.setState({
                        calculationType: event.target.value
                    })
                    break;

                default: break;
            }
        }

    }

    getCodefromObjective = (obejctive) => obejctive === 'Strategic Objective' ? 'SO' :
        obejctive === 'Financial / Non-Financial Objective' ? 'FO' :
            obejctive === 'Business Objective' ? 'BO' :
                obejctive === 'Value Driver' ? 'VD' :
                    obejctive === 'KPI' ? 'KPI' : null

    saveObjectives(e, saveData = []) {
        e.preventDefault();
        const { adminStore } = this.props;
        const { objectiveValue, selectedObjective, kpiName, kpiDescription, kpiTrend, kpiType, kpiFormula, kpiUnit, calculationType, objectiveError, kpiNameError, kpiDescriptionError, kpiFormulaError, selectedIndustries, selectedBusiness } = this.state;
        let soList = []
        let input = {}
        let result = {}
        let objective = this.getCodefromObjective(selectedObjective)
        this.setState({
            loader: true,
            isSaveloading: true
        })
        if (selectedObjective !== 'KPI') {
            if (objectiveValue.trim() !== '' && objectiveError === '') {
                if (selectedObjective === 'Strategic Objective') {
                    result = adminStore.saveSo(saveData)
                }
                else if (selectedObjective === 'Financial / Non-Financial Objective') {
                    result = adminStore.saveFo(saveData)
                }
                else if (selectedObjective === 'Business Objective') {
                    result = adminStore.saveBo(saveData)
                }
                else if (selectedObjective === "Value Driver") {
                    result = adminStore.saveVD(saveData)
                }
                else {
                    input = {
                        name: objectiveValue.trim(),
                    }
                    soList.push(input)
                    let payload = {
                        soList: soList
                    }
                    result = adminStore.saveObjectives(objective, payload)
                }
                result.then((response) => {
                    if (!response.error && response.data.resultCode === 'OK') {
                        this.showNotification('saveSuccess', 'Data saved successfully')
                        this.setState({
                            objectiveValue: '',
                            loader: false,
                            isSaveSuccess: true.resultObj,
                            isSaveloading: false
                        }, () => this.setState({
                            isSaveSuccess: false
                        }))
                    }
                    else {
                        this.showNotification('saveError', response.data.errorDescription)
                        this.setState({
                            loader: false,
                            isSaveSuccess: false,
                            isSaveloading: false
                        })
                    }
                })
                    .catch((e) => {
                        this.setState({
                            loader: false,
                            isSaveSuccess: false,
                            isSaveloading: false
                        })
                    });
            }
            else {
                this.showNotification('saveError', 'Please enter the mandatory field with valid value and try again.');
                this.setState({
                    loader: false,
                    isSaveSuccess: false,
                    isSaveloading: false
                })
            }
        }
        else {
            if (kpiName.trim() !== '' && kpiDescription.trim() !== '' && kpiFormula.trim() !== '' && kpiTrend.trim() !== '' && kpiUnit.trim() !== '' && calculationType.trim() !== '' && kpiType.trim() !== '' &&
                kpiNameError === '' && kpiDescriptionError === '' && kpiFormulaError === '' && selectedBusiness.length !== 0 && selectedIndustries.length !== 0) {
                let industryRequestData = [];
                let businessRequestData = [];
                selectedBusiness.forEach((business) => {
                    let data = {
                        "kpiBusMapId": null,
                        "businessId": business.value
                    }
                    businessRequestData.push(data);
                })

                selectedIndustries.forEach((industry) => {
                    let data = {
                        "kpiIndMapId": null,
                        "indId": industry.value
                    }
                    industryRequestData.push(data);
                })
                let kpiDetails = {
                    "kpiId": null,
                    "kpiName": kpiName.trim(),
                    "kpiDescription": kpiDescription,
                    "kpiFormula": kpiFormula,
                    "kpiTrend": kpiTrend,
                    "okpiType": kpiType,
                    "kpiUnit": kpiUnit,
                    "calculationType": calculationType,
                    "business": businessRequestData,
                    "industries": industryRequestData
                }
                let payload = []
                payload.push(kpiDetails)
                adminStore.saveOKPIDetails(payload)
                    .then((response) => {
                        if (!response.error && response.data.resultCode === 'OK') {
                            this.showNotification('saveSuccess', 'Data saved successfully')
                            this.setState({
                                objectiveValue: '',
                                kpiName: '',
                                kpiDescription: '',
                                kpiFormula: '',
                                kpiTrend: '',
                                kpiType: "",
                                kpiUnit: '',
                                calculationType: '',
                                loader: false,
                                selectedBusiness: [],
                                selectedIndustries: [],
                                isSaveSuccess: true,
                                isSaveloading: false
                            })
                        }
                        else {
                            this.showNotification('saveError', response.data.errorDescription)
                            this.setState({
                                loader: false,
                                isSaveSuccess: false,
                                isSaveloading: false
                            })
                        }
                    })
            }
            else {
                this.showNotification('saveError', 'Please enter the mandatory fields with valid values and try again.');
                this.setState({
                    loader: false,
                    isSaveSuccess: false,
                    isSaveloading: false
                })
            }
        }


    }

    showErrorNotification(text) {
        toast.error(<NotificationMessage
            title="Error"
            bodytext={text}
            icon="error"
        />, {
            position: toast.POSITION.BOTTOM_RIGHT
        });
    }

    showNotification(type, msg) {
        switch (type) {

            case 'saveSuccess':
                toast.info(<NotificationMessage
                    title="Success"
                    bodytext={msg}
                    icon="success"
                />, {
                    position: toast.POSITION.BOTTOM_RIGHT
                });
                break;


            case 'saveError':
                toast.error(<NotificationMessage
                    title="Error"
                    bodytext={msg}
                    icon="error"
                />, {
                    position: toast.POSITION.BOTTOM_RIGHT,
                    className: "textForCSS"
                });
                break;

            default:
                console.log("");
                break;
        }
    }

    redirectHandler(type) {
        const { history } = this.props;
        // eslint-disable-next-line default-case
        switch (type) {
            case 'home':
                history.push('/home');
                break;
            case 'adminpanel':
                history.push('/admin');
                break;
        }
    }

    /* upload and download bulk template start*/
    getBucketName() {
        // eslint-disable-next-line default-case
        switch (env) {
            case 'production':
                return 'prodb-valuecockpit-artifacts';
            case 'preprod':
                return 'preprod-valuecockpit-artifacts';
            case 'staging':
                return 'uat-valuecockpit-artifacts';
            case 'development':
                return 'dev-valuecockpit-artifacts';
            case 'local':
                return 'dev-valuecockpit-artifacts';
            case 'productionb':
                return 'prodb-valuecockpit-artifacts';
            case 'dev2':
                return 'dev2-valuecockpit-artifacts';
            case 'training':
                return 'training-valuecockpit-artifacts';
            default:
                return true;
        }
    }

    downloadBlob = (url) => {
        let link = document.createElement("a");
        link.href = url;
        link.download = url;
        link.click();
    }


    downloadBulkTemplate() {
        this.setState({isDownloadLoading:true})
        this.props.adminStore.downloadBulkTemplate(this.getCodefromObjective(this.state.selectedObjective))
            .then(response => {
                if (response && response.data && response.data.resultCode === 'OK') {
                    this.setState({isDownloadLoading:false})
                    this.downloadBlob(response.data.resultObj)
                } else if (response && response.data && response.data.resultCode === 'KO') {
                    this.setState({isDownloadLoading:false})
                    this.showErrorNotification(response.data.errorDescription)
                }
                else{
                    this.setState({isDownloadLoading:false})
                }
                return true;
            });

    }


    uploadBulkTemplate = () => {
        this.setState({
            uploadModalOpen: true
        })
    }

    modalCloseHandler = (e) => {
        this.setState({
            uploadModalOpen: false,
        })
    }

    potentialModalCloseHandler = (e) => {
        this.setState({
            openPotentialDuplicatesModal: false
        })
    }
    uploadTemplate = (file, ObjectiveType) => {
        const { adminStore } = this.props;
        this.setState({
            loader: true,
            addObjective: false
        });
        if (ObjectiveType === 'KPI') {
            adminStore.bulkUploadForKPI(file).then(response => {
                if (response && response.data) {
                    if (response.data.resultCode === 'OK') {
                        this.showNotification('saveSuccess', response.data.resultDescription);
                        this.setState({
                            loader: false,
                            addObjective: true
                        });
                    } else if (response.data.resultCode === 'KO' && response.data.resultObj === null) {
                        this.showNotification('saveError', response.data.errorDescription);
                        this.setState({
                            loader: false,
                            addObjective: true
                        });
                    } else if (response.data.resultCode === 'KO' && response.data.resultObj.file !== null) {
                        this.showNotification('saveError', response.data.resultObj.file);
                        this.setState({
                            loader: false,
                            addObjective: true
                        });
                    } else if (response.data.resultCode === 'KO' && response.data.resultObj.headers !== null) {
                        this.showNotification('saveError', response.data.resultObj.headers);
                        this.setState({
                            loader: false,
                            addObjective: true
                        });
                    } else if (response.data.resultCode === 'KO' && response.data.resultObj.dataIssues !== null) {
                        let dataIssuesArray = response.data.resultObj.dataIssues;
                        let dataIssuesText = (dataIssuesArray.join(' , ')).concat(".").concat("\n");
                        if (response.data.resultCode === 'KO' && (response.data.resultObj.dataDuplicates !== null && response.data.resultObj.dataDuplicates.length !== 0)) {
                            let dataDuplicatesArray = response.data.resultObj.dataDuplicates;
                            let dataDuplicatesText = dataDuplicatesArray.join(' , ');
                            let dataIssueDupliatesValue = dataIssuesText.concat("\n").concat(" Duplicate KPIs : ").concat(dataDuplicatesText)
                            this.showNotification('saveError', dataIssueDupliatesValue);
                            this.setState({
                                loader: false,
                                addObjective: true
                            });
                        } else if (response.data.resultCode === 'KO' && (response.data.resultObj.dataDuplicates === null || response.data.resultObj.dataDuplicates.length === 0)) {
                            this.showNotification('saveError', dataIssuesText);
                            this.setState({
                                loader: false,
                                addObjective: true
                            });
                        }
                    }
                    // else if(response.data.resultCode === 'KO' && response.data.resultObj.dataDuplicates!== null) {
                    //     let dataDuplicatesArray = response.data.resultObj.dataDuplicates;
                    //     let dataDuplicatesText = dataDuplicatesArray.join(' , ');
                    //     this.showNotification('saveError', dataDuplicatesText);
                    //     this.setState({
                    //         loader: false,
                    //         addObjective: true
                    //        });
                    // }
                    else if (response.data.resultCode === 'KO' && response.data.resultObj.potentialDuplicates !== null) {
                        this.setState({
                            openPotentialDuplicatesModal: true,
                            potentialDuplicates: response.data.resultObj.potentialDuplicates,
                            successCount: response.data.resultObj.successCount,
                            taskId: response.data.resultObj.taskId,
                            loader: false,
                            addObjective: true
                        })

                    }
                }
                else {
                    this.setState({
                        loader: false,
                        addObjective: true
                    });
                }
            });
        } else {
            adminStore.bulkUploadForObjectives(file, ObjectiveType).then(response => {
                if (response && response.data) {
                    if (response.data.resultCode === 'OK') {
                        this.showNotification('saveSuccess', response.data.resultDescription);
                        this.setState({
                            loader: false,
                            addObjective: true
                        });
                    } else if (response.data.resultCode === 'KO' && response.data.resultObj === null) {
                        this.showNotification('saveError', response.data.errorDescription);
                        this.setState({
                            loader: false,
                            addObjective: true
                        });
                    } else if (response.data.resultCode === 'KO' && response.data.resultObj.file !== null) {
                        this.showNotification('saveError', response.data.resultObj.file);
                        this.setState({
                            loader: false,
                            addObjective: true
                        });
                    } else if (response.data.resultCode === 'KO' && response.data.resultObj.headers !== null) {
                        this.showNotification('saveError', response.data.resultObj.headers);
                        this.setState({
                            loader: false,
                            addObjective: true
                        });
                    }
                    // else if (response.data.resultCode === 'KO' && response.data.resultObj.dataIssues!== null) {
                    //     this.showNotification('saveError', response.data.resultObj.dataIssues);
                    //     this.setState({
                    //         loader: false,
                    //         addObjective: true
                    //        });
                    // }else if(response.data.resultCode === 'KO' && response.data.resultObj.dataDuplicates!== null) {
                    //     this.showNotification('saveError', response.data.resultObj.dataDuplicates);
                    //     this.setState({
                    //         loader: false,
                    //         addObjective: true
                    //        });
                    // }
                    else if (response.data.resultCode === 'KO' && response.data.resultObj.dataIssues !== null) {
                        let dataIssuesArray = response.data.resultObj.dataIssues;
                        let dataIssuesText = (dataIssuesArray.join(' , ')).concat(".").concat("\n");

                        if (response.data.resultCode === 'KO' && (response.data.resultObj.dataDuplicates !== null && response.data.resultObj.dataDuplicates.length !== 0)) {
                            let dataDuplicatesArray = response.data.resultObj.dataDuplicates;
                            let dataDuplicatesText = dataDuplicatesArray.join(' , ');
                            let dataIssueDupliatesValue = dataIssuesText.concat("\n").concat(` Duplicate ${ObjectiveType}s : `).concat(dataDuplicatesText)
                            this.showNotification('saveError', dataIssueDupliatesValue);
                            this.setState({
                                loader: false,
                                addObjective: true
                            });
                        } else if (response.data.resultCode === 'KO' && (response.data.resultObj.dataDuplicates === null || response.data.resultObj.dataDuplicates.length === 0)) {
                            this.showNotification('saveError', dataIssuesText);
                            this.setState({
                                loader: false,
                                addObjective: true
                            });
                        }
                    }
                    else if (response.data.resultCode === 'KO' && response.data.resultObj.potentialDuplicates !== null) {
                        this.setState({
                            openPotentialDuplicatesModal: true,
                            potentialDuplicates: response.data.resultObj.potentialDuplicates,
                            successCount: response.data.resultObj.successCount,
                            taskId: response.data.resultObj.taskId,
                            loader: false,
                            addObjective: true
                        })

                    }
                }
                else {
                    this.setState({
                        loader: false,
                        addObjective: true
                    });
                }
            });
        }
    }
    /*upload and download bulk template end*/
    render() {
        // let lisOfFilters = toJS(adminStore.filters);
        const { selectedObjective, addObjective, objectiveValue, loader, kpiName, kpiDescription,
            kpiTrend, kpiType, kpiFormula, kpiUnit, calculationType, objectiveError, kpiNameError,
            kpiDescriptionError, kpiFormulaError, uploadModalOpen, openPotentialDuplicatesModal, taskId, foBoTypes, isSaveSuccess, isSaveloading ,isDownloadLoading} = this.state;
      
        return (
            <Fragment>
                <Menu />
                <div className="container-fluid" style={{ paddingRight: '0px' }}>
                    <div className="row" style={{ backgroundColor: '#3B3B3B' }}>
                        {/* <div className="col-sm-12"> */}
                        <div className="col-sm-9">
                            <nav aria-label="breadcrumb">
                                <ol className="breadcrumb">
                                    <li className="breadcrumb-item" style={{ cursor: 'pointer' }} onClick={() => this.redirectHandler('home')}>Home</li>
                                    <li className="breadcrumb-item" style={{ cursor: 'pointer' }} onClick={() => this.redirectHandler('adminpanel')} aria-current="page">Admin Panel</li>
                                    <li className="breadcrumb-item active" aria-current="page">Upload / Edit VDT Elements</li>
                                </ol>
                            </nav>
                        </div>
                    </div>
                    <div className="row col-sm-12 paddingNone marginNone" id="uploadValueDriver" >

                        <ul className="nav nav-tabs tab_menu paddingNone subContainer " >
                            <li value="Strategic Objective" id="Strategic Objective" style={{ width: '15%' }} className={this.state.selectedObjective === 'Strategic Objective' ? "active" : ""} data-toggle="tab" onClick={loader ? () => { } : this.onSelectObjective}> Strategic Objective</li>
                            <li value="Financial / Non-Financial Objective" id="Financial / Non-Financial Objective" style={{ width: '20%' }} className={this.state.selectedObjective === 'Financial / Non-Financial Objective' ? "active" : ""} data-toggle="tab" onClick={loader ? () => { } : this.onSelectObjective} >Financial / Non-Financial Objective
                                </li>
                            <li value="Business Objective" id="Business Objective" style={{ width: '15%' }} className={this.state.selectedObjective === 'Business Objective' ? "active" : ""} data-toggle="tab" onClick={loader ? () => { } : this.onSelectObjective}>Business Objective</li>
                            <li value="Value Driver" id="Value Driver" style={{ width: '15%' }} className={this.state.selectedObjective === 'Value Driver' ? "active" : ""} data-toggle="tab" onClick={loader ? () => { } : this.onSelectObjective} >Value Driver
                                </li>
                            <li value="KPI" id="KPI" style={{ width: '15%' }} className={this.state.selectedObjective === 'KPI' ? "active" : ""} data-toggle="tab" onClick={loader ? () => { } : this.onSelectObjective}> KPI</li>

                            <li style={{ width: '20%', cursor: "default" }}  >
                                <div style={{ display: 'flex', float: 'right' }}>
                                    <span data-for="addObj"
                                        data-place="top"
                                        data-tip="">
                                        <img src={PlusIcon} alt="Add" id="Add" onClick={loader ? () => { } : this.onAddOrDeleteSelected} className="pointer"
                                            style={{ opacity: (addObjective ? "unset" : "0.6") }} />
                                    </span>
                                    <ReactTooltip id="addObj">Add</ReactTooltip>
                                    <span data-for="editObj" data-place="top" data-tip="">
                                        <img src={pencil} alt="Edit" id="EditOrDelete" onClick={loader ? () => { } : this.onAddOrDeleteSelected} className="pointer"
                                            style={{ opacity: (addObjective ? "0.6" : "unset"), height: "25px", paddingLeft: "10px" }} />
                                    </span>
                                    <ReactTooltip id="editObj">Edit/Delete</ReactTooltip>
                                    <span style={{ paddingLeft: "10px" }}>
                                        <img src={downloadIco} alt="download" className="pointer"
                                            onClick={loader ? () => { } : this.downloadBulkTemplate}
                                            data-for="downloadObj"
                                            data-place="top"
                                            data-tip=""
                                            style={{ height: "25px" }} />
                                        {isDownloadLoading ?
                                            <i className="fa fa-spinner fa-spin" style={{ color: '#ffffff', position: "absolute", margin: "5px 0px 0px -20px", cursor: "default" }}></i>
                                             : ""} 
                                    </span>
                                    <ReactTooltip id="downloadObj">Download Bulk Template</ReactTooltip>

                                    <span style={{ paddingLeft: "10px" }} >
                                        <img src={uploadIco} alt="upload" className="pointer"
                                            onClick={loader ? () => { } : this.uploadBulkTemplate}
                                            data-for="uploadObj"
                                            data-place="top"
                                            data-class="UploadStyle"
                                            data-tip=""
                                            style={{ height: "25px" }} />
                                    </span>
                                    <ReactTooltip id="uploadObj">Ingest Bulk Template</ReactTooltip>



                                </div>


                            </li>

                        </ul>

                    </div>
                    {loader && !addObjective ? <div style={{ padding: "8%", width: '100%', color: '#FFFFFF', textAlign: 'center', display: 'grid' }}>
                        <i className="fa fa-spinner fa-spin"></i>
                    Upload in Progress...</div> :
                        <div className="row mainContainer">

                            <div className='col-sm-12 paddingNone subContainer'>
                                {
                                    addObjective ?
                                        <AddVDTElement selectedObjective={selectedObjective}
                                            objectiveValue={objectiveValue}
                                            onObjectiveValueChange={this.onObjectiveValueChange}
                                            saveObjectives={this.saveObjectives}
                                            isSaveloading={isSaveloading}
                                            loader={loader}
                                            kpiName={kpiName}
                                            kpiDescription={kpiDescription}
                                            kpiUnit={kpiUnit}
                                            kpiFormula={kpiFormula}
                                            kpiTrend={kpiTrend}
                                            kpiType={kpiType}
                                            calculationType={calculationType}
                                            redirectHandler={this.redirectHandler}
                                            kpiNameError={kpiNameError}
                                            kpiDescriptionError={kpiDescriptionError}
                                            objectiveError={objectiveError}
                                            kpiFormulaError={kpiFormulaError}
                                            industryList={this.state.industriesList}
                                            businessList={this.state.businessList}
                                            selectedIndustryValue={this.state.selectedIndustries}
                                            selectedBusinessValue={this.state.selectedBusiness}
                                            selectedBusiness={this.selectedBusiness}
                                            selectedIndustries={this.selectedIndustries}
                                            foBoTypes={foBoTypes}
                                            isSaveSuccess={isSaveSuccess}
                                        />
                                        :
                                        <AdminEditVDT
                                            selectedObjectiveType={selectedObjective}
                                            industryList={this.state.industriesList}
                                            businessList={this.state.businessList}
                                            foBoTypes={foBoTypes}
                                            isSaveSuccess={isSaveSuccess}
                                        ></AdminEditVDT>

                                }
                                {uploadModalOpen &&
                                    <UploadBulkTemplate
                                        modalCloseHandler={this.modalCloseHandler}
                                        uploadTemplate={this.uploadTemplate}
                                        selectedObjective={selectedObjective}
                                    >
                                    </UploadBulkTemplate>
                                }
                                {
                                    openPotentialDuplicatesModal &&
                                    <PotentialDuplicatesModal
                                        modalCloseHandler={this.potentialModalCloseHandler}
                                        duplicatesArray={this.state.potentialDuplicates}
                                        successCount={this.state.successCount}
                                        selectedObjective={selectedObjective}
                                        taskId={taskId}
                                    >
                                    </PotentialDuplicatesModal>
                                }
                            </div>
                        </div>}
                </div>
            </Fragment >
        )
    }
}

export default withRouter(UploadValueDriver);
