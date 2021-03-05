import React, { Component, Fragment } from 'react';
import { observer, inject } from 'mobx-react';
import { toast } from 'react-toastify';
import { withRouter } from "react-router-dom";
import Menu from '../../components/Menu/Menu';
import ExportModal from '../../components/ExportModal/ExportModal';
import NotificationMessage from '../../components/NotificationMessage/NotificationMessage';
import ProjectNavbar from '../../components/ProjectNavbar/ProjectNavbar';
import './ValueDrivers.css';
import VDTSearchCombo from '../VDTSearchCombo/VDTSearchCombo';
import VisualVDT from '../VisualVDT/VisualVDT';
import CustomConfirmModal from '../../components/CustomConfirmModal/CustomConfirmModal';
import MultiSelect from "react-multi-select-component";
var SessionStorage = require('store/storages/sessionStorage');

@inject('reviewValueDriverStore', 'valueDriversStore', 'editVDTStore', 'saveVDTStore', 'customVDTStore', 'kpiBenefitsStore')
@inject('valueDriversStore')
@inject('adminStore')
@inject('saveVDTStore', 'customVDTStore', "publishDashboardStore")
@observer
class ValueDrivers extends Component {
    constructor(props) {
        super(props);
        this.state = {

            industriesList: [],
            businessList: [],
            selectedIndustryForKPIs: [],
            selectedBusiness: [],

            visualVDTButton: true,
            editVDTButton: false,
            selectedFunctionalArea: [],
            selectedIndustry: '',
            functionalArea: '',
            projectScenario: '',
            selectedScenario: [],
            highKpiDetails: false,
            lowKpiDetails: false,
            selectedFlag: false,
            priority: 'high',
            vdtList: "",
            // isEditCalled: false,
            visible: false,
            generateKPI: false,
            saveClick: false,
            tableData: [],
            changeKpiType: false,
            lowPriorityBtn: false,
            exportXlsBtnModal: false,
            exportPPTBtnModal: false,
            highPriorityButton: true,
            lowPriorityButton: true,
            selectedIndustryValue: '',
            selectedIndustryOption: [],
            selectedFunctionalOption: [],
            selectedProjectScenarioOption: [],
            industryLoader: false,
            functionalAreaLoader: false,
            projectScenarioLoader: false,
            frequencyErrorFlag: false,
            manuallySearchButton: false,
            enableSaveBtn: false,
            enableGenerateVDTBtn: false,
            colorChanged: '',
            displayFullScreen: false,
            fileUploaded: false,
            oldKPIValues: false,
            createCustomVDT: false,
            enableExportScreen: false,
            isWarning: false,
            mapId: '',
            selectedAccentureOffering: '',
            isloading: false,
            isDeletedVDT: false,
            loadingresponse: false,
            customDeleteVDTModalVisible: false,
            customDeleteVDTModalTitle: '',
            customSaveVDTMode: false,
            customSaveVDTModeModalTitle: '',
            customSaveVDTModalVisible: false,
            customSaveVDTModalTitle: '',
            newSaveVDTPayload: '',

            isGenerateVDTBtnClicked: false,
            isDownloadLoading:false

        }
        this.redirectHandler = this.redirectHandler.bind(this);
        this.selectVDTHandler = this.selectVDTHandler.bind(this);
        this.saveVDTHandler = this.saveVDTHandler.bind(this);
        this.autoSave = this.autoSave.bind(this);
        this.editvdtHandler = this.editvdtHandler.bind(this);
        this.exportHandler = this.exportHandler.bind(this);
        this.modalCloseHandler = this.modalCloseHandler.bind(this);
        this.generateXlsHandler = this.generateXlsHandler.bind(this);
        this.generatePPTHandler = this.generatePPTHandler.bind(this);
        this.changeKpiTypeHandler = this.changeKpiTypeHandler.bind(this);
        this.manuallySearchKpiBtnClickHandler = this.manuallySearchKpiBtnClickHandler.bind(this);
        this.editvdtHandler = this.editvdtHandler.bind(this);
        this.onEditVdtButtonClick = this.onEditVdtButtonClick.bind(this);
        this.downloadBaseline = this.downloadBaseline.bind(this);
        this.onIngestBaseline = this.onIngestBaseline.bind(this);
        this.getKpiData = this.getKpiData.bind(this);
        this.deleteVDT = this.deleteVDT.bind(this);
        this.showMessage = this.showMessage.bind(this);
        this.publishDashboardHandler = this.publishDashboardHandler.bind(this);
        // custom confirm modal functions
        this.openSaveVDTConfirmModal = this.openSaveVDTConfirmModal.bind(this);
        this.closeSaveVDTConfirmModal = this.closeSaveVDTConfirmModal.bind(this);
        this.deleteSavedVDTConfirm = this.deleteSavedVDTConfirm.bind(this);
        this.openDeleteVDTConfirmModal = this.openDeleteVDTConfirmModal.bind(this);
        this.closeDeleteVDTConfirmModal = this.closeDeleteVDTConfirmModal.bind(this);
        this.openSaveVDTModeModel = this.openSaveVDTModeModel.bind(this);
        this.closeSaveVDTMode = this.closeSaveVDTMode.bind(this);
        this.deleteVDTConfirm = this.deleteVDTConfirm.bind(this);
        this.setLoaderToTrue = this.setLoaderToTrue.bind(this);

    }

    //--start of new functions for filter KPI--//

    customValueRendererIndustry = () => {
        return this.state.selectedMultipleIndustryItems > 1
            ? "Multiple"
            : ""
    };

    setSelectedIndustry = (selected) => {
        this.setState({
            selectedIndustryForKPIs: selected,
            selectedMultipleIndustryItems: selected.length
        });

    }
    setLoaderToTrue = (value) => {
        this.setState({
            isloading: value
        })
    }
    customValueRendererBusiness = () => {
        return this.state.selectedMultipleBusinessItems > 1
            ? "Multiple"
            : ""
    };

    setSelectedBusinessFunction = (selected) => {
        this.setState({
            selectedBusiness: selected,
            selectedMultipleBusinessItems: selected.length
        });

    }

    getIndustriesList = () => {
        this.getIndustriesForKpi();
    }

    getIndustriesForKpi = () => {
        const { adminStore } = this.props;
        adminStore.getIndustriesList()
            .then(response => {
                if (response && response.data && response.data.resultCode === 'OK' && !response.error) {
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

    getBusinessList = () => {
        this.getBusinessFunctions();
    }

    getBusinessFunctions = () => {
        const { adminStore } = this.props;
        adminStore.getBusinessList()
            .then(response => {
                if (response && response.data && !response.error && response.data.resultCode === 'OK') {
                    let businessList = [];
                    response.data.resultObj.map((data, index) => {
                        let businessFunction = { value: data.businessId, label: data.businessName }
                        businessList.push(businessFunction);
                        return true
                    });
                    this.setState({
                        businessList: businessList,
                    })
                } else if (response && response.data.resultCode === 'KO') {
                    this.showErrorNotification(response.data.errorDescription);
                }
                else {
                }
            });
    }

    filterKPI = () => {
        const { selectedIndustryForKPIs, industriesList, selectedBusiness, businessList } = this.state;
        const { customVDTStore, reviewValueDriverStore } = this.props;

        let tempIndustries = [];
        let tempBusiness = [];

        let industryReqList = '';
        let businessReqList = '';

        if (selectedIndustryForKPIs.length !== 0 && selectedBusiness.length !== 0) {
            tempIndustries = selectedIndustryForKPIs;
            tempBusiness = selectedBusiness;
        }
        else if (selectedIndustryForKPIs.length !== 0 && selectedBusiness.length === 0) {
            tempIndustries = selectedIndustryForKPIs;
            tempBusiness = businessList;
        }
        else if (selectedIndustryForKPIs.length === 0 && selectedBusiness.length !== 0) {
            tempIndustries = industriesList;
            tempBusiness = selectedBusiness;
        }

        if (tempIndustries.length !== 0 && tempBusiness.length !== 0) {
            let filterIndustries = [];
            let filterBusiness = [];
            tempIndustries.map((data, index) => {
                let industryID = data.value;
                filterIndustries.push(industryID);
                return true
            })

            tempBusiness.map((data, index) => {
                let businessId = data.value;
                filterBusiness.push(businessId);
                return true
            })
            industryReqList = filterIndustries;
            businessReqList = filterBusiness;
            this.setState({
                filteredIndustries: JSON.parse(JSON.stringify(filterIndustries)),
                filteredBusiness: JSON.parse(JSON.stringify(filterBusiness))
            }, () => console.log());
        }
        else {
            let filterIndustries = [];
            let filterBusiness = [];
            industriesList.map((data, index) => {
                let industryID = data.value;
                filterIndustries.push(industryID);
                return true
            })

            businessList.map((data, index) => {
                let businessId = data.value;
                filterBusiness.push(businessId);
                return true
            })
            industryReqList = filterIndustries;
            businessReqList = filterBusiness;
            this.setState({
                filteredIndustries: JSON.parse(JSON.stringify(filterIndustries)),
                filteredBusiness: JSON.parse(JSON.stringify(filterBusiness))
            }, () => console.log());
        }

        const payload = {
            "industryList": industryReqList,
            "businessList": businessReqList
        };
        reviewValueDriverStore.fetchDropDownValues(payload)
            .then((response) => {
                if (response && response.data.resultCode === 'OK' && response.data.resultObj) {

                } else if (response && response.data.resultCode === 'KO') {
                    this.showErrorNotification(response.data.errorDescription, 'Error', 'error');
                } else {
                    this.showErrorNotification('Sorry, !Something went wrong', 'Error', 'error');
                }
            });

    }

    //--end of new functions for filter KPI--//

    componentWillUnmount() {
        //alert("unmount");
        if (this.state.oldKPIValues !== false) {
            this.autoSave()
        }
        SessionStorage.write('VDTmode', 'ALL');
        const { reviewValueDriverStore } = this.props;
        reviewValueDriverStore.resetVdtTreeVariables();

        // alert("done")
    }

    downloadBaseline = (event) => {
        const { valueDriversStore } = this.props;
        this.setState({
            isDownloadLoading:true
        })
        valueDriversStore.downloadBaseline()
            .then((res) => {
                // this.getKpiData()
                if (!res || res.error) {
                    this.showNotification('downloadError')
                }
                this.setState({
                    isDownloadLoading:false
                })

            })
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

    onIngestBaseline = (event) => {
        event.preventDefault();
        const { valueDriversStore, reviewValueDriverStore } = this.props;
        let { operationalKpIs } = reviewValueDriverStore
        const file = event.target.files[0]
        if (event.target.files[0] !== undefined) {
            this.setState({
                kpiBaselineUpload: true
            })
            if (!this.isValidFileSize(file) && !this.isValidFileExtension(file)) {
                const errorMsg = "file is too large, maximum supported file size is 1MB and file format allowed is '.xlsx' ";
                this.showNotification('uploaderr', errorMsg);

            } else if (!this.isValidFileExtension(file)) {
                const errorMsg = "invalid file format, allowed is '.xlsx'";
                this.showNotification('uploaderr', errorMsg);

            }
            else if (!this.isValidFileSize(file)) {
                const errorMsg = "file is too large, maximum supported file size is 1MB";
                this.showNotification('uploaderr', errorMsg);

            } else {
                valueDriversStore.IngestBaseline(file)
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
                                generateTargetBtn: false,
                                fileUploaded: true,
                                oldKPIValues: operationalKpIs

                            })

                            // setKpiTargetStore.generateTargetBtn = false
                            valueDriversStore.CalculationBaseline()
                                .then((res) => {
                                    if (res && !res.error) {
                                        this.getKpiData()
                                        this.showNotification('fileUploadSuccess')

                                    }
                                    else {
                                        if (valueDriversStore.calErr) {
                                            this.showNotification('uploaderr', valueDriversStore.calErr)
                                        }
                                        else {
                                            this.showNotification('calculationFailure')
                                        }

                                    }

                                })

                        } else {
                            if (valueDriversStore.upoadBaselineErr !== undefined && valueDriversStore.upoadBaselineErr !== "") {
                                this.showNotification('uploaderr', valueDriversStore.upoadBaselineErr)
                            }
                            else if (valueDriversStore.upoadBaselineErr === undefined) {
                                this.showNotification('fileUploadFailure')
                            }
                            else {
                                this.showNotification('fileUploadFailure')
                            }

                        }
                    })
            }
            document.getElementById("file").value = "";
        }
    }
    showNotification(type, err) {
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
            case 'calculationFailure':
                toast.error(<NotificationMessage
                    title="Error"
                    bodytext={'Sorry! Calculation Failed. Try again'}
                    icon="error"
                />, {
                    position: toast.POSITION.BOTTOM_RIGHT
                });
                break;
            case 'fileUploadFailure':
                toast.error(<NotificationMessage
                    title="Error"
                    bodytext={'Sorry! File not uploaded. Try again'}
                    icon="error"
                />, {
                    position: toast.POSITION.BOTTOM_RIGHT
                });
                break;

            case 'uploaderr':
                toast.error(<NotificationMessage
                    title="Error"
                    bodytext={err}
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
            case 'publishError':
                toast.error(<NotificationMessage
                    title="Error"
                    bodytext={'Sorry! Failed to publish. Please try again'}
                    icon="error"
                />, {
                    position: toast.POSITION.BOTTOM_RIGHT
                });
                break;
            default:
                break;
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

    openDeleteVDTConfirmModal = (title) => {
        this.setState({
            customDeleteVDTModalVisible: true,
            customDeleteVDTModalTitle: title
        });
    };

    closeDeleteVDTConfirmModal = (isYesClicked) => {
        this.setState({
            customDeleteVDTModalVisible: false,
            customDeleteVDTModalTitle: ''
        });
        if (isYesClicked) {
            //new delete function
            this.deleteVDTConfirm();
        } else {

        }
    };

    deleteVDT() {

        // let deleteMsg = (enableExportScreen?"This action will delete the saved VDT and its associated Business Case components. Do you want to continue?":"Unsaved VDT changes will be lost. Do you want to continue?")
        let deleteMsg = ("This VDT will be deleted and data will be erased. This action is irreversible. Do you want to continue?")

        this.openDeleteVDTConfirmModal(deleteMsg);

    }
    showMessage() {
        let msg = ("There are unsaved changes in the page, Do you want to save them ?")
        let value = this.openSaveVDTModeModel(msg);
        if (value == false) {
            return true;
        }
    }

    openSaveVDTModeModel(msg) {
        if (this.props.reviewValueDriverStore.stateUndoHistory.length > 0) {
            this.setState({
                customSaveVDTMode: true,
                customSaveVDTModeModalTitle: msg
            })
        } else {
            return false;
        }

    }

    deleteVDTConfirm() {
        const { reviewValueDriverStore } = this.props;
        reviewValueDriverStore.deleteVdt()
            .then((res) => {
                if (res && !res.error && res.resultCode === 'OK') {
                    this.showSuccessNotification("Deleted")
                    this.setState({
                        isDeletedVDT: true
                    })
                    this.getKpiData()
                }
                else if (res && res.resultCode === 'KO') {
                    this.showErrorNotification(res.errorDescription)
                }
            });
    }

    /* CustomVDTAfterSave = () => {
        this.setState({
            createCustomVDT: false
        });
    } */

    getKpiData() {
        const { reviewValueDriverStore } = this.props;
        let mapId = SessionStorage.read('mapId');
        //Setting createCustomVDT as true and again resetting to false inside response to fix rendering issue of VisualVDT
        if (this.state.isDeletedVDT) {
            this.setState({
                createCustomVDT: true
            })
        }
        reviewValueDriverStore.getSelectedKpi(mapId)
            .then((response) => {
                if (response && !response.error && response.resultCode === 'OK') {
                    if (Object.keys(response.resultObj).length === 0) {
                        this.setState({
                            enableExportScreen: false,
                            selectedIndustry: reviewValueDriverStore.selectedIndustry,
                            selectedAccentureOffering: reviewValueDriverStore.selectedAccentureOffering,
                            isDeletedVDT: false
                        })
                    }
                    else {
                        this.setState({
                            createCustomVDT: false,
                            enableExportScreen: (Object.keys(response.resultObj).length > 0 ? true : false),
                            selectedIndustry: reviewValueDriverStore.selectedIndustry,
                            selectedAccentureOffering: reviewValueDriverStore.selectedAccentureOffering,
                            isDeletedVDT: false
                        })
                    }
                    return true
                } else if (response && response.resultCode === 'KO') {
                    if (!response.errorDescription === 'No data found for the selection') {
                        this.showErrorNotification(response.errorDescription);
                    }
                    if (this.state.isDeletedVDT) {
                        this.setState({
                            // disabled vdt search combo
                            // visualVDTButton: false,
                            createCustomVDT: false,
                            enableExportScreen: false,
                            isDeletedVDT: false

                        })
                    }
                    return false
                } else {
                    this.showErrorNotification('Sorry!Something went wrong');
                    if (this.state.isDeletedVDT) {
                        this.setState({
                            // disabled vdt search combo
                            // visualVDTButton: false,
                            createCustomVDT: false,
                            enableExportScreen: false,
                            isDeletedVDT: false

                        })
                    }
                    return false
                }
                // }
            }
            )

    }

    componentDidMount() {
        const { reviewValueDriverStore } = this.props;
        SessionStorage.write("offeringTenantId", false);
        reviewValueDriverStore.oldKPIValues = []
        this.getIndustriesForKpi();
        this.getBusinessFunctions();
        this.getKpiData()
        this.getDashboardUrl();
    }

    publishDashboardHandler = (event) => {
        event.preventDefault();
        // const { keyCallOutsList } = this.state;
        const { publishDashboardStore } = this.props;

        // const mapId = SessionStorage.read('mapId')
        // let keyCallOut = {}
        // let keyCallOutList = []
        this.setState({
            publishDashboard: true,
            loadingresponse: true,
            tablueInprogress: true
        })
        // for (let i = 0; i < keyCallOutsList.length; i++) {
        //     keyCallOut = {
        //         // "kcId" :"123" ,
        //         "mapId": SessionStorage.read('mapId'),
        //         "keyCallOuts": keyCallOutsList[i]["details" + i.toString()]
        //     }
        //     keyCallOutList.push(keyCallOut)
        // }

        // publishDashboardStore.keyCallouts = keyCallOutList; 

        publishDashboardStore.publishDashboard()
            .then((response) => {
                this.setState({
                    publishDashboard: false,

                })
                if (response && !response.error && response.resultCode === 'OK') {
                    this.setState({
                        tableData: false,
                        showDashboard: true,
                        // showFiles: false,
                        bodyClass: false,
                        loadingresponse: false,
                        tablueInprogress: false
                    })
                    window.open(this.state.tableauUrl)
                } else {

                    this.showErrorNotification(response.errorDescription)
                    this.setState({
                        loadingresponse: false,
                        tablueInprogress: false
                    })
                }
            })
    }
    getDashboardUrl() {
        const mapId = SessionStorage.read('mapId')
        // const url = "https://tableau.valuecockpit.accenture.com/trusted/"+token+"/views/ValueCockpitDashboards/BenefitsSummaryF?map_id="+mapId+"&:embed=yes&:refresh=yes"
        // eslint-disable-next-line default-case
        switch (process.env.REACT_APP_BASE_URL) {
            case 'production':
                if (SessionStorage.read('option_selected') === 'sales') {
                    this.setState({
                        tableauUrl: 'https://tableau.valuecockpit.accenture.com/#/views/ValueArchitectingSalesProd/BenefitSummary?:iid=1&:embed=y&:refresh=yes&:linktarget=_self&map_id=' + mapId
                    })
                } else {
                    this.setState({
                        tableauUrl: 'https://tableau.valuecockpit.accenture.com/#/views/ValueDeliveryProd/BenefitSummary?:iid=1&:embed=y&:refresh=yes&:linktarget=_self&map_id=' + mapId
                    })
                }
                break;
            case 'staging':
                if (SessionStorage.read('option_selected') === 'sales') {
                    this.setState({
                        tableauUrl: 'https://tableau.valuecockpit.accenture.com/#/views/ValueArchitectingSalesUAT/BenefitSummary?:iid=1&:embed=y&:refresh=yes&:linktarget=_self&map_id=' + mapId
                    })
                } else {
                    this.setState({
                        tableauUrl: 'https://tableau.valuecockpit.accenture.com/#/views/ValueDeliveryUAT/BenefitSummary?:iid=1&:embed=y&:refresh=yes&:linktarget=_self&map_id=' + mapId
                    })
                }

                break;
            case "development":
                if (SessionStorage.read('option_selected') === 'sales') {
                    this.setState({
                        tableauUrl: 'https://tableau.valuecockpit.accenture.com/#/views/ValueArchitectingSalesDEV/BenefitSummary?:iid=1&:embed=y&:refresh=yes&:linktarget=_self&map_id=' + mapId
                    })
                } else {
                    this.setState({
                        tableauUrl: 'https://tableau.valuecockpit.accenture.com/#/views/ValueDeliveryDEV/BenefitSummary?:iid=1&:embed=y&:refresh=yes&:linktarget=_self&map_id=' + mapId
                    })
                }
                break;
            case "training":
                if (SessionStorage.read('option_selected') === 'sales') {
                    this.setState({
                        tableauUrl: 'https://tableau.valuecockpit.accenture.com/#/views/ValueArchitectingSalesDEV/BenefitSummary?:iid=1&:embed=y&:refresh=yes&:linktarget=_self&map_id=' + mapId
                    })
                } else {
                    this.setState({
                        tableauUrl: 'https://tableau.valuecockpit.accenture.com/#/views/ValueDeliveryDEV/BenefitSummary?:iid=1&:embed=y&:refresh=yes&:linktarget=_self&map_id=' + mapId
                    })
                }
                break;
            case 'local':
                if (SessionStorage.read('option_selected') === 'sales') {
                    this.setState({
                        tableauUrl: 'https://tableau.valuecockpit.accenture.com/#/views/ValueArchitectingSalesDEV/BenefitSummary?:iid=1&:embed=y&:refresh=yes&:linktarget=_self&map_id=' + mapId
                    })
                } else {
                    this.setState({
                        tableauUrl: 'https://tableau.valuecockpit.accenture.com/trusted/d6epmGMTSQq76zMv3FHpYA==:jTjnDo_1HDsA4X0ZVuETtO3R/views/ValueDeliveryDEV/BenefitSummary/general.user/be905271-f7d6-4b43-8ff3-c70a14085a17?:display_count=n&:showVizHome=n&:origin=viz_share_link&:embed=y&:refresh=yes&:linktarget=_self&map_id=' + mapId
                        // tableauUrl: 'https://tableau.valuecockpit.accenture.com/#/views/ValueDeliveryDEV/BenefitSummary?:iid=1&:embed=y&:refresh=yes&:linktarget=_self&map_id=' + mapId
                    })
                }
                break;
            case 'preprod':
                if (SessionStorage.read('option_selected') === 'sales') {
                    this.setState({
                        tableauUrl: 'https://tableau.valuecockpit.accenture.com/#/views/ValueArchitectingSalesPreProd/BenefitSummary?:iid=2&:embed=y&:refresh=yes&:linktarget=_self&map_id=' + mapId
                    })
                } else {
                    this.setState({
                        tableauUrl: 'https://tableau.valuecockpit.accenture.com/#/views/ValueDeliveryPreProd/BenefitSummary?:iid=1&:embed=y&:refresh=yes&:linktarget=_self&map_id=' + mapId
                    })
                }
                break;
            case 'productionb':
                if (SessionStorage.read('option_selected') === 'sales') {
                    this.setState({
                        tableauUrl: 'https://tableau.valuecockpit.accenture.com/#/views/ValueArchitectingSalesProdB/BenefitSummary?:iid=3&:embed=y&:refresh=yes&:linktarget=_self&map_id=' + mapId
                    })
                } else {
                    this.setState({
                        tableauUrl: ' https://tableau.valuecockpit.accenture.com/#/views/ValueDeliveryProdB/BenefitSummary?:iid=1&:embed=y&:refresh=yes&:linktarget=_self&map_id=' + mapId
                    })
                }
                break;
        }
    }

    editvdtHandler(event) {
        const { saveVDTStore } = this.props;
        saveVDTStore.setKpiDetails(event)
        saveVDTStore.isEditCalled = true;
    }

    manuallySearchKpiBtnClickHandler = event => {
        const { manuallySearchKpisStore } = this.props;
        manuallySearchKpisStore.navigateToEdit = true
        this.setState({
            manuallySearchButton: true

        })
    }


    async autoSave(event) {
        let option = SessionStorage.read('option_selected');
        const { customVDTStore, reviewValueDriverStore } = this.props;
        const { operationalKpIs } = reviewValueDriverStore;
        let data = {}
        let kpis = []
        for (let i = 0; i < operationalKpIs.length; i++) {
            if (((operationalKpIs[i].baseline.actualValue) === null || (operationalKpIs[i].baseline.actualValue) === "") ||
                ((operationalKpIs[i].target.actualValue) === null || (operationalKpIs[i].target.actualValue) === "") ||
                (operationalKpIs[i].targetAchieved === null || operationalKpIs[i].targetAchieved === "Select Year")) {
                operationalKpIs[i].color = 'red'
            }
        }
        for (let i = 0; i < operationalKpIs.length; i++) {
            data = {
                "order": i + 1,
                "kpiId": Number(operationalKpIs[i].kpiId),
                "baseline": (operationalKpIs[i].baseline.actualValue) === "" || (operationalKpIs[i].baseline.actualValue) === null ? null : (operationalKpIs[i].baseline.actualValue),
                "bicBenchmark": (operationalKpIs[i].bicBenchmark.actualValue) === null || (operationalKpIs[i].bicBenchmark.actualValue) === "null" || (operationalKpIs[i].bicBenchmark.actualValue) === "" ? null : (operationalKpIs[i].bicBenchmark.actualValue),
                "avgBenchmark": (operationalKpIs[i].avgBenchmark.actualValue) === null || (operationalKpIs[i].avgBenchmark.actualValue) === "null" || (operationalKpIs[i].avgBenchmark.actualValue) === "" ? null : (operationalKpIs[i].avgBenchmark.actualValue),
                "target": (operationalKpIs[i].target.actualValue) === "" || (operationalKpIs[i].target.actualValue) === null ? null : (operationalKpIs[i].target.actualValue),
                "targetAchieved": operationalKpIs[i].targetAchieved === "Select Year" ? null : operationalKpIs[i].targetAchieved,
                "kpiFrequency": option === "sales" ? null : operationalKpIs[i].kpiFrequency
            }
            kpis.push(data)
        }
        const payload = {
            "mapId": SessionStorage.read('mapId'),
            "deleteKpis": [],
            "kpiDetails": [...kpis]
        };
        await customVDTStore.saveCustomVDT(payload)
            .then((response) => {
                // if (response.error) {
                //     return {
                //         error: true
                //     }
                // } else {
                const { data } = response;
                if (data.resultCode === 'OK') {
                    this.setState({
                        enableExportScreen: true
                    })
                    return true
                } else if (data.resultCode === 'KO') {
                    this.showErrorNotification(data.errorDescription);
                }
                // }

            })
        this.showSuccessNotification('VDTSaved');
        let isMap = false;
        this.generateVDTHandlerAfterSave(isMap);
    }



    async saveVDTHandler(event) {
        let option = SessionStorage.read('option_selected');
        const { isWarning, enableExportScreen } = this.state;
        const { reviewValueDriverStore, customVDTStore } = this.props;
        const { operationalKpIs } = reviewValueDriverStore;
        let data = {}
        let kpis = []
        this.setState({
            mapId: SessionStorage.read('mapId'),

        })
        for (let i = 0; i < operationalKpIs.length; i++) {
            if (((operationalKpIs[i].baseline.actualValue) === null || (operationalKpIs[i].baseline.actualValue) === "") ||
                ((operationalKpIs[i].target.actualValue) === null || (operationalKpIs[i].target.actualValue) === "") ||
                (operationalKpIs[i].targetAchieved === null || operationalKpIs[i].targetAchieved === "Select Year")) {
                operationalKpIs[i].color = 'red'
            }
        }
        for (let i = 0; i < operationalKpIs.length; i++) {
            data = {
                "order": i + 1,
                "kpiId": Number(operationalKpIs[i].kpiId),
                "baseline": (operationalKpIs[i].baseline.actualValue) === "" || (operationalKpIs[i].baseline.actualValue) === null ? null : (operationalKpIs[i].baseline.actualValue),
                "bicBenchmarkSource": (operationalKpIs[i].bicBenchmarkSource) === "" || (operationalKpIs[i].bicBenchmarkSource) === null ? null : (operationalKpIs[i].bicBenchmarkSource),
                "avgBenchmarkSource": (operationalKpIs[i].avgBenchmarkSource) === "" || (operationalKpIs[i].avgBenchmarkSource) === null ? null : (operationalKpIs[i].avgBenchmarkSource),
                "bicBenchmark": (operationalKpIs[i].bicBenchmark.actualValue) === null || (operationalKpIs[i].bicBenchmark.actualValue) === "null" || (operationalKpIs[i].bicBenchmark.actualValue) === "" ? null : (operationalKpIs[i].bicBenchmark.actualValue),
                "avgBenchmark": (operationalKpIs[i].avgBenchmark.actualValue) === null || (operationalKpIs[i].avgBenchmark.actualValue) === "null" || (operationalKpIs[i].avgBenchmark.actualValue) === "" ? null : (operationalKpIs[i].avgBenchmark.actualValue),
                "target": (operationalKpIs[i].target.actualValue) === "" || (operationalKpIs[i].target.actualValue) === null ? null : (operationalKpIs[i].target.actualValue),
                "targetAchieved": operationalKpIs[i].targetAchieved === "Select Year" ? null : operationalKpIs[i].targetAchieved,
                "kpiFrequency": option === "sales" ? null : operationalKpIs[i].kpiFrequency,
                "enabledBenchmark": operationalKpIs[i].enabledBenchmark,
                "mapId": operationalKpIs[i].mapId,
                "kpiType": operationalKpIs[i].kpiType,
            }
            kpis.push(data)
        }
        const payload = {
            "mapId": SessionStorage.read('mapId'),
            "deleteKpis": [],
            "kpiDetails": [...kpis]
        };
        this.setState({
            isloading: true
        })
        if (enableExportScreen) { //vdt saved in db
            if (isWarning) {
                const alertMsg = 'Your existing VDT will be lost, Do you want to continue?';
                this.openSaveVDTConfirmModal(alertMsg, payload);

            }
            else {
                await customVDTStore.saveCustomVDT(payload)
                    .then((response) => {
                        // if (response.error) {
                        //     return {
                        //         error: true
                        //     }
                        // } else {
                        const { data } = response;
                        if (data.resultCode === 'OK') {
                            this.setState({
                                enableExportScreen: true,
                                isloading: false
                            })
                            return true
                        } else if (data.resultCode === 'KO') {
                            this.showErrorNotification(data.errorDescription);
                            this.setState({
                                isloading: false
                            })
                        }
                        else {
                            this.setState({
                                isloading: false
                            })
                        }
                        // }

                    })
                this.showSuccessNotification('VDTSaved');
                let isMap = false;
                this.generateVDTHandlerAfterSave(isMap);

            }
        }
        else {
            await customVDTStore.saveCustomVDT(payload)
                .then((response) => {
                    // if (response.error) {
                    //     return {
                    //         error: true
                    //     }
                    // } else {
                    const { data } = response;
                    if (data.resultCode === 'OK') {
                        this.setState({
                            enableExportScreen: true,
                            isloading: false
                        })
                        return true
                    } else if (data.resultCode === 'KO') {
                        this.showErrorNotification(data.errorDescription);
                        this.setState({
                            isloading: false
                        })
                    }
                    else {
                        this.setState({
                            isloading: false
                        })
                    }
                    // }

                })

            this.showSuccessNotification('VDTSaved');
            let isMap = false;
            this.generateVDTHandlerAfterSave(isMap);
        }
    }

    openSaveVDTConfirmModal = (title, payload) => {
        this.setState({
            customSaveVDTModalVisible: true,
            customSaveVDTModalTitle: title,
            newSaveVDTPayload: payload
        });
    };

    closeSaveVDTConfirmModal(isYesClicked) {
        this.setState({
            customSaveVDTModalVisible: false,
            customSaveVDTModalTitle: ''
        });
        if (isYesClicked) {
            //new delete function
            this.deleteSavedVDTConfirm();
        } else {
            this.setState({
                isloading: false
            });
        }
    }
    async closeSaveVDTMode(isYesClicked) {
        this.setState({
            customSaveVDTMode: false,
            customSaveVDTModeModalTitle: ''
        });
        if (isYesClicked) {
            this.props.reviewValueDriverStore.saveTree(true);
        } else {
            const res = await this.props.reviewValueDriverStore.selectMode();
            if (res) {
                this.setState({
                    isloading: false
                });
            }
        }
    }

    async deleteSavedVDTConfirm() {
        const { customVDTStore } = this.props;
        const { newSaveVDTPayload } = this.state;
        await customVDTStore.saveCustomVDT(newSaveVDTPayload)
            .then((response) => {
                // if (response.error) {
                //     return {
                //         error: true
                //     }
                // } else {
                const { data } = response;
                if (data.resultCode === 'OK') {
                    this.setState({
                        enableExportScreen: true,
                        isloading: false
                    })
                    return true
                } else if (data.resultCode === 'KO') {
                    this.showErrorNotification(data.errorDescription);
                    this.setState({
                        isloading: false
                    })
                }
                else {
                    this.setState({
                        isloading: false
                    })
                }
                // }
            })
        this.showSuccessNotification('VDTSaved');
        let isMap = false;
        this.generateVDTHandlerAfterSave(isMap);
    }


    showSuccessNotification(type) {
        switch (type) {
            case 'VDTSaved':
                toast.info(<NotificationMessage
                    title="Success"
                    bodytext={'Successfully saved data'}
                    icon="success"
                />, {
                    position: toast.POSITION.BOTTOM_RIGHT
                });
                break;
            case 'Deleted':
                toast.info(<NotificationMessage
                    title="Success"
                    bodytext={'Data deleted successfully'}
                    icon="success"
                />, {
                    position: toast.POSITION.BOTTOM_RIGHT
                });
                break;
            case 'Delete_Error':
                toast.error(<NotificationMessage
                    title="Error"
                    bodytext={'Something went wrong.Please try again'}
                    icon="error"
                />, {
                    position: toast.POSITION.BOTTOM_RIGHT
                });
                break;
            case 'nodata':
                toast.error(<NotificationMessage
                    title="Error"
                    bodytext={'Sorry! No data to show'}
                    icon="error"
                />, {
                    position: toast.POSITION.BOTTOM_RIGHT
                });
                break;
            case 'kpiError':
                toast.error(<NotificationMessage
                    title="Error"
                    bodytext={'Enter all Mandatory fields'}
                    icon="error"
                />, {
                    position: toast.POSITION.BOTTOM_RIGHT
                });
                break;
            case 'Error':
                toast.error(<NotificationMessage
                    title="Error"
                    bodytext={'Error occurred while saving data'}
                    icon="error"
                />, {
                    position: toast.POSITION.BOTTOM_RIGHT
                });
                break;
            default:
                break;
        }
    }

    exportHandler = (event) => {
        this.setState({
            visible: true,
        })
    }

    modalCloseHandler = () => {
        this.setState({
            visible: false,
        })
    }

    generateXlsHandler = (event) => {
        const { valueDriversStore } = this.props;
        valueDriversStore.generateXls()
            .then((resposne) => {
                this.setState({
                    exportXlsBtnModal: false
                })
            })
    }

    generatePPTHandler = (event) => {
        const { valueDriversStore } = this.props;
        valueDriversStore.generatePPT()
            .then((resposne) => {
                this.setState({
                    exportXlsBtnModal: false
                })
            })
    }

    createFilteredArr(actArr) {
        let arr = [];
        if (actArr) {
            for (let opt of actArr) {
                arr.push(opt.value);
            }
        }
        return arr;
    }

    selectVDTHandler = (event) => {
        const { editVDTStore } = this.props;
        const { selectedKPIIds } = editVDTStore;
        const target = event.target;
        const targetId = target.id.split('_');
        if (target.checked) {
            if (!selectedKPIIds.includes(Number(targetId[1]))) {
                selectedKPIIds.push(Number(targetId[1]))
            }
        }
        else {
            for (let i = 0; i < selectedKPIIds.length; i++) {
                if (Number(selectedKPIIds[i]) === Number(targetId[1])) {
                    selectedKPIIds.splice(i, 1)
                }
            }
        }
    }

    onEditVdtButtonClick() {
        const { valueDriversStore, editVDTStore } = this.props;
        editVDTStore.selectedKPIIds = []
        valueDriversStore.getVDTList(SessionStorage.read('mapId'))
            .then((response) => {
                // if (response.error) {
                //     return {
                //         error: true
                //     }
                // } else {
                if (response && response.resultCode === 'OK') {
                    this.setState({
                        vdtList: response.resultObj
                    })
                    // if (response) {
                    for (let i = 0; i < response.length; i++) {
                        if (editVDTStore.selectedKPIIds.filter(item => item === response[i].kpiId).length === 0) {
                            if (response[i].selected === true) {
                                editVDTStore.selectedKPIIds.push(response[i].kpiId)
                            }
                        }

                    }
                } else if (response && response.resultCode === 'KO') {
                    this.showErrorNotification(response.errorDescription);
                }
                // }

            });
        return true;
    }

    vdtBtnHandler = (event) => {
        const targetId = event.target.id;
        switch (targetId) {
            case 'visualVDT':
                this.setState({
                    visualVDTButton: true,
                    editVDTButton: false,
                    selectedFlag: false,
                    manuallySearchButton: false,
                    createCustomVDT: false,
                    selectedBusiness: [],
                    selectedIndustryForKPIs: [],
                    selectedMultipleIndustryItems: 0,
                    selectedMultipleBusinessItems: 0,
                    filteredIndustries: undefined,
                    filteredBusiness: undefined
                });
                break;
            case 'editVDT':
                this.onEditVdtButtonClick()
                this.setState({
                    selectedFlag: false,
                    visualVDTButton: false,
                    editVDTButton: true,
                    selectedBusiness: [],
                    selectedIndustryForKPIs: [],
                    selectedMultipleIndustryItems: 0,
                    selectedMultipleBusinessItems: 0,
                    filteredIndustries: undefined,
                    filteredBusiness: undefined
                });
                break;
            default:
                break;
        }
    }

    sortVDTData() {
        const { valueDriversStore } = this.props;
        const { selectedVDT } = valueDriversStore;
        let highPriorityRecords = []
        let lowPriorityRecords = []
        for (let i = 0; i < selectedVDT.length; i++) {
            selectedVDT[i].priority === 'high' ?
                highPriorityRecords.push(selectedVDT[i])
                : lowPriorityRecords.push(selectedVDT[i]);
        }
        const mergedArray = highPriorityRecords.concat(lowPriorityRecords)
        valueDriversStore.selectedVDT = mergedArray;
        this.setState({
            tableData: mergedArray
        })

    }

    changeKpiTypeHandler = (event) => {
        if (!this.state.changeKpiType) {
            this.setState({
                changeKpiType: false
            })
        }
        const { valueDriversStore } = this.props;
        const { priority } = this.state;
        const { selectedVDT, highKpiDetails, lowKpiDetails } = valueDriversStore;
        const kpiDataLength = selectedVDT.length;
        const target = event.target;
        const targetId = target.id.split('_')
        for (let i = 0; i < kpiDataLength; i++) {
            if (Number(selectedVDT[i].kpiId) === Number(targetId[1])) {
                valueDriversStore.selectedVDT[i].kpiType = target.value;
            }
        }
        const kpiData = priority === 'high' ? highKpiDetails : lowKpiDetails;
        for (let i = 0; i < kpiData.length; i++) {
            if (Number(kpiData[i].kpiId) === Number(targetId[1])) {
                if (priority === 'high') {
                    valueDriversStore.highKpiDetails[i].kpiType = target.value
                } else {
                    valueDriversStore.lowKpiDetails[i].kpiType = target.value;
                }
            }
        }
        this.setState({
            changeKpiType: true
        })
    }

    async developDriversHandler(event) {
        event.preventDefault();
        this.resetValueDriver()
        this.setState({
            generateKPI: true,
            priority: 'high',
        })
        const { valueDriversStore } = this.props;
        await valueDriversStore.generateKPI('high')
            .then((response) => {
                // if (response.error) {
                //     return {
                //         error: true
                //     }
                // } else {
                if (!response && response.resultCode === 'OK') {
                    this.showSuccessNotification('nodata')
                    this.setState({
                        highKpiDetails: true,
                        generateKPI: false,
                        tableData: valueDriversStore.highKpiDetails,
                        highPriorityButton: false,
                        lowPriorityButton: false,
                    })
                } else if (!response && response.resultCode === 'KO') {
                    this.showErrorNotification(response.errorDescription);
                }
                // }

            })
    }

    resetValueDriver() {
        this.setState({
            highKpiDetails: false,
            lowKpiDetails: false,
            selectedFlag: false,
            visible: false,
            tableData: [],
            generateKPI: false,
            changeKpiType: false,
            lowPriorityBtn: false,
        })
        const { valueDriversStore } = this.props;
        valueDriversStore.selectedVDT = []
        valueDriversStore.selectedKpiIds = []
        valueDriversStore.highKpiDetails = []
        valueDriversStore.lowKpiDetails = []
    }

    redirectHandler(type) {
        const { history } = this.props;
        if (this.state.oldKPIValues !== false) {
            this.autoSave()
        }
        switch (type) {
            case 'home':
                history.push('/home');
                // window.location.reload();
                break;
            case 'sales':
                history.push('/home');
                // window.location.reload();
                break;
            // case 'projectMenu':
            //     history.push('/deal');
            //     window.location.reload();
            //     break;
            case 'myproject':
                history.push('my-deals');
                // window.location.reload();
                break;
            case "sales-home":
                history.push('/sales-home');
                break;
            case "delivery-home":
                history.push('/delivery');
                break;
            default:
                break;
        }
    }

    createModelForMultiSelect(dataArray) {
        const modelArr = [];
        if (dataArray) {
            dataArray.map((opt) => {
                if (opt) {
                    modelArr.push({
                        value: opt,
                        label: opt
                    });
                    return true;
                }
                return false;
            })
        }
        return modelArr;
    }

    enableGenerateVDT = (val) => {
        this.setState({
            enableGenerateVDTBtn: val
        })
    }
    generateVDTHandlerAfterSave = (event) => {
        const { kpiBenefitsStore } = this.props;
        var isMapid
        this.setState({
            frequencyErrorFlag: false,
            createCustomVDT: false,
            isWarning: false
        })
        if (event.target === undefined) {
            isMapid = true;
        }
        else {
            isMapid = false;
        }
        this.getFrequencies(isMapid);
        const payload = { mapId: SessionStorage.read('mapId') };
        kpiBenefitsStore.getKPIBenefits(payload);
    }
    generateVDTHandler = (event) => {

        var isMapid
        const { enableExportScreen } = this.state;
        if (enableExportScreen) {
            this.setState({
                frequencyErrorFlag: false,
                createCustomVDT: false,
                isWarning: true,
                enableGenerateVDTBtn: false
            })
        }
        else {
            this.setState({
                frequencyErrorFlag: false,
                createCustomVDT: false,
                enableGenerateVDTBtn: false
            })
        }

        if (event.target === undefined) {
            isMapid = true;
        }
        else {
            isMapid = false;
        }

        this.getFrequencies(isMapid);

    }
    saveVDT = (vdtStatus) => {
        this.setState({
            isGenerateVDTBtnClicked: vdtStatus
        })
    }

    getFrequencies(isMapid) {
        const { reviewValueDriverStore } = this.props;
        //Setting createCustomVDT as true and again resetting to false inside response to fix rendering issue of VisualVDT
        this.setState({
            createCustomVDT: true,
            isGenerateVDTBtnClicked: true
        })
        reviewValueDriverStore.getSelectedKpi(this.state.mapId)
            .then((response) => {
                if (response && response.resultCode === 'OK') {
                    this.setState({
                        createCustomVDT: false,
                        enableSaveBtn: true
                    })
                } else if (response && response.resultCode === 'KO') {
                    this.showErrorNotification(response.errorDescription);
                } else {
                    this.showErrorNotification('Sorry!Something went wrong');
                }
                SessionStorage.write("offeringTenantId", false);
            }
            )
        // }
    }

    saveProjectMapId = (projectId, mapId) => {
        this.setState({
            mapId: mapId,
            projectId: projectId
        })
    }

    render() {
        const { reviewValueDriverStore, customVDTStore } = this.props;
        const { oldKPIValues, createCustomVDT, enableExportScreen, isloading,isDownloadLoading, filteredIndustries, filteredBusiness, isGenerateVDTBtnClicked } = this.state;
        const option = SessionStorage.read('option_selected')
        const { totalSelectedLinesArray, strategicObjectives, financialObjectives, businessObjectives, valueDrivers, operationalKPIs } = customVDTStore
        const { tableData, visualVDTButton, editVDTButton, exportXlsBtnModal, exportPPTBtnModal, colorChanged } = this.state
        const pname = SessionStorage.read('projectName');
        const demoUser = SessionStorage.read('demoUser');
        return (
            <div className={tableData.length > 0 ? 'container-fluid my-project-body' : 'container-fluid no-project-body'}>
                <Menu />
                <div className="page-off-menu">
                    <div className="breadcrumb-row row" data-html2canvas-ignore="true">
                        <div className="col-sm-12">

                            <div >
                                <nav aria-label="breadcrumb">
                                    <ol className="breadcrumb">
                                        <li className="breadcrumb-item" style={{ cursor: 'pointer' }} onClick={() => this.redirectHandler('home')}>Home</li>
                                        {option === 'sales' ?
                                            (SessionStorage.read("userType") === "EU" ? "" : <li className="breadcrumb-item active" style={{ cursor: 'pointer' }} aria-current="page" onClick={() => this.redirectHandler('sales-home')}>Opportunity Home </li>)
                                            : (SessionStorage.read("userType") === "EU" ? "" : <li className="breadcrumb-item active" style={{ cursor: 'pointer' }} aria-current="page" onClick={() => this.redirectHandler('delivery-home')}>Program Delivery Home </li>)
                                        }

                                        {/* {option === "sales" ?
                                            <li className="breadcrumb-item active" style={{ cursor: 'pointer' }} onClick={() => this.redirectHandler('sales')}>Sales</li> :
                                            <li className="breadcrumb-item active" style={{ cursor: 'pointer' }} onClick={() => this.redirectHandler('sales')}>Delivery</li>
                                        } */}
                                        {
                                            !JSON.parse(demoUser) &&
                                            <li className="breadcrumb-item" style={{ cursor: 'pointer' }} aria-current="page" onClick={() => this.redirectHandler('myproject')}>{option === "sales" ? "My Opportunities" : "My Projects"}</li>
                                        }
                                        <li className="breadcrumb-item" aria-current="page">{JSON.parse(demoUser) === true ? (option === 'sales') ? 'Demo Opportunity' : 'Demo Project' : pname}</li>
                                        <li className="breadcrumb-item active" aria-current="page">Finalize Value Driver Tree</li>
                                    </ol>
                                </nav>
                            </div>
                        </div>

                    </div>
                    <div className="fvdt-main">
                        <div className="row page-name-row">
                            <label className="page-header-label">{JSON.parse(demoUser) === true ? (option === 'sales' ? 'Demo Opportunity' : 'Demo Project') : pname}</label> {" "}
                        </div>
                        <ProjectNavbar
                            branchTree={reviewValueDriverStore.branchTree}
                            activePage="value_driver"
                            enableHeaders={enableExportScreen}
                            publishDashboardHandler={this.publishDashboardHandler}
                            loadingresponse={this.state.loadingresponse}
                        />
                        <div className="tab-content-outer-wrapper">
                            <div className="fvdt-tab-content-main" style={{ marginTop: (SessionStorage.read("userType") === "EU" && (SessionStorage.read("accessType") === "Read" || SessionStorage.read("accessType") === "Write") && "50px") }}>
                                <div className="row select-icons-wrapper-row">
                                    <div className="col-sm-3">
                                        <VDTSearchCombo
                                            enableGenerateVDT={this.enableGenerateVDT}
                                            disableCombo={!visualVDTButton}
                                            treeLength={reviewValueDriverStore.branchTree.length}
                                            isEditValueDriver={false}
                                            demoUser={JSON.parse(demoUser)}
                                            isDeletedVDT={this.state.isDeletedVDT}
                                            saveProjectMapId={this.saveProjectMapId}
                                            selectedIndustry={this.state.selectedIndustry}
                                            selectedAccentureOffering={this.state.selectedAccentureOffering}
                                            createCustomVDT={createCustomVDT} />
                                    </div>
                                    {/* second col-sm-4 */}

                                    <div className="col-sm-5" style={{ alignSelf: "flex-end", /*paddingLeft: 0,*/ zIndex: '3', marginLeft: '15px' }}>
                                        {(SessionStorage.read("userType") !== "EU" && (SessionStorage.read("accessType") !== "Read" || SessionStorage.read("accessType") !== "Write")) && <div className="row">
                                            <div style={{ display: ((SessionStorage.read("userType") === "EU" && (SessionStorage.read("accessType") === "Read" || SessionStorage.read("accessType") === "Write") ? "none" : "block")), borderRight: ((SessionStorage.read("userType") === "EU" && (SessionStorage.read("accessType") === "Read" || SessionStorage.read("accessType") === "Write")) ? "none" : '1px solid grey'), marginTop: '18px', marginRight: '15px' }}>
                                                <button
                                                    type="submit"
                                                    className="btn btn-primary"
                                                    id="generate"
                                                    style={{
                                                        fontSize: '12px',
                                                        marginRight: '15px',
                                                        //marginTop: '18px',
                                                        //marginLeft: '15px',
                                                        width: '105px',
                                                        cursor: ((!this.state.enableGenerateVDTBtn) || (SessionStorage.read("isMaster") === "Y" || (SessionStorage.read("accessType") === "Read"))) ? "not-allowed" : "pointer"
                                                    }}
                                                    disabled={(!this.state.enableGenerateVDTBtn) || (SessionStorage.read("isMaster") === "Y" || (SessionStorage.read("accessType") === "Read")) || (SessionStorage.read("userType") === "EU" && (SessionStorage.read("accessType") === "Read" || SessionStorage.read("accessType") === "Write"))}
                                                    onClick={this.generateVDTHandler}>
                                                    Generate VDT
                                                        </button>
                                            </div>
                                            <Fragment>
                                                <div style={{ width: '25%', paddingRight: '15px', opacity: (SessionStorage.read("isMaster") === "Y" || (SessionStorage.read("accessType") === "Read")) ? "0.5" : "unset" }}>
                                                    Industry
                                                            <MultiSelect
                                                        options={this.state.industriesList}
                                                        value={this.state.selectedIndustryForKPIs}
                                                        onChange={this.setSelectedIndustry}
                                                        labelledBy="Select"
                                                        disableSearch={true}
                                                        placeholder={this.state.placeholder}
                                                        valueRenderer={this.customValueRendererIndustry}
                                                        ClearSelectedIcon
                                                        style={{
                                                            cursor: (SessionStorage.read("isMaster") === "Y" || (SessionStorage.read("demoUser") === "Y") || (SessionStorage.read("accessType") === "Read")) ? "not-allowed" : "pointer",
                                                            opacity: (SessionStorage.read("isMaster") === "Y" || (SessionStorage.read("accessType") === "Read") || (SessionStorage.read("demoUser") === "Y")) ? "0.5" : "unset"
                                                        }}
                                                        disabled={(SessionStorage.read("isMaster") === "Y" || (SessionStorage.read("demoUser") === "Y") || (SessionStorage.read("accessType") === "Read"))}

                                                    />

                                                </div>

                                                <div style={{ width: '25%', paddingRight: '15px', opacity: (SessionStorage.read("isMaster") === "Y" || (SessionStorage.read("accessType") === "Read")) ? "0.5" : "unset" }}>
                                                    Business Function
                                                            <MultiSelect
                                                        options={this.state.businessList}
                                                        value={this.state.selectedBusiness}
                                                        onChange={this.setSelectedBusinessFunction}
                                                        labelledBy="Select"
                                                        disableSearch={true}
                                                        placeholder={this.state.placeholder}
                                                        valueRenderer={this.customValueRendererBusiness}
                                                        ClearSelectedIcon
                                                        style={{
                                                            cursor: (SessionStorage.read("isMaster") === "Y" || (SessionStorage.read("demoUser") === "Y") || (SessionStorage.read("accessType") === "Read")) ? "not-allowed" : "pointer",
                                                            opacity: (SessionStorage.read("isMaster") === "Y" || (SessionStorage.read("accessType") === "Read") || (SessionStorage.read("demoUser") === "Y")) ? "0.5" : "unset"
                                                        }}
                                                        disabled={(SessionStorage.read("isMaster") === "Y" || (SessionStorage.read("accessType") === "Read") || (SessionStorage.read("demoUser") === "Y"))}

                                                    />
                                                </div>

                                                <button
                                                    type="submit"
                                                    id="custom_vdt_button"
                                                    className="btn btn-primary"
                                                    style={{

                                                        fontSize: '12px',
                                                        marginTop: '18px',
                                                        width: '105px',
                                                        cursor: (SessionStorage.read("isMaster") === "Y" || (SessionStorage.read("accessType") === "Read")) ? "not-allowed" : "pointer",
                                                        opacity: ((SessionStorage.read("isMaster") === "Y" || (SessionStorage.read("demoUser") === "Y") || (SessionStorage.read("accessType") === "Read")) ? "0.5" : "unset")
                                                    }}
                                                    disabled={this.state.selectedIndustryForKPIs.length === 0 || this.state.selectedBusiness.length === 0}
                                                    onClick={(SessionStorage.read("isMaster") === "Y" || (SessionStorage.read("demoUser") === "Y") || (SessionStorage.read("accessType") === "Read")) ? () => { } : this.filterKPI}>
                                                    Filter KPIs
                                                        </button>

                                            </Fragment>
                                        </div>}
                                    </div>
                                </div>
                                <div className="row both-vdt-wrapper">
                                    {
                                        visualVDTButton || colorChanged
                                            || !editVDTButton
                                            ?
                                            // {visualVDTButton?
                                            <VisualVDT oldKPIValues={oldKPIValues}
                                                saveVDT={this.saveVDT}
                                                isGenerateVDTBtnClicked={isGenerateVDTBtnClicked}
                                                enableExportScreen={enableExportScreen}
                                                branchTree={reviewValueDriverStore.branchTree}
                                                isloading={isloading}
                                                isDownloadLoading={isDownloadLoading}
                                                setLoaderToTrue={this.setLoaderToTrue}
                                                saveVDTHandler={this.saveVDTHandler}
                                                deleteVDT={this.deleteVDT}
                                                generateVDT={this.getKpiData}
                                                vdtBtnHandler={this.vdtBtnHandler}
                                                showMessage={this.showMessage}
                                                downloadBaseline={this.downloadBaseline}
                                                onIngestBaseline={this.onIngestBaseline}
                                                exportHandler={this.exportHandler} /> :
                                            ''
                                    }
                                </div>
                            </div>
                        </div>
                    </div>

                </div>

                <ExportModal
                    visible={this.state.visible}
                    generateXlsHandler={this.generateXlsHandler}
                    generatePPTHandler={this.generatePPTHandler}
                    modalCloseHandler={this.modalCloseHandler}
                    exportXlsBtnModal={exportXlsBtnModal}
                    exportPPTBtnModal={exportPPTBtnModal}
                />
                {/* custom confirm modal components here */}
                <CustomConfirmModal
                    ownClassName={'full-vdt-delete'}
                    isModalVisible={this.state.customDeleteVDTModalVisible}
                    modalTitle={this.state.customDeleteVDTModalTitle}
                    closeConfirmModal={this.closeDeleteVDTConfirmModal}
                />
                <CustomConfirmModal
                    ownClassName={'saved-vdt-delete'}
                    isModalVisible={this.state.customSaveVDTModalVisible}
                    modalTitle={this.state.customSaveVDTModalTitle}
                    closeConfirmModal={this.closeSaveVDTConfirmModal}
                />
                {this.state.customSaveVDTMode ?
                    <CustomConfirmModal
                        ownClassName={'save-vdt-mode'}
                        isModalVisible={this.state.customSaveVDTMode}
                        modalTitle={this.state.customSaveVDTModeModalTitle}
                        closeConfirmModal={this.closeSaveVDTMode}
                    /> : ''}


            </div >

        )
    }
}

export default withRouter(ValueDrivers);