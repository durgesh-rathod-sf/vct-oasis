import React, { Component } from 'react';
import { withRouter } from "react-router-dom";
import { observer, inject } from 'mobx-react';
import Menu from '../../components/Menu/Menu';
import BenInvActualsHome from "../../components/BenInvActualsHome/BenInvActualsHome";
import ProjectNavbar from '../../components/ProjectNavbar/ProjectNavbar';
import ReviewValueDriverTreeHeader from '../../components/ReviewValueDriverTreeHeader/ReviewValueDriverTreeHeader';
import ValueDriverTreeNew from '../../components/ValueDriverTree/ValueDriverTreeNew';
import '../DevelopBusinessCaseNavbar/developBusinessCaseNavbar.css';
import ReactTooltip from 'react-tooltip';
import NotificationMessage from '../../components/NotificationMessage/NotificationMessage';
import { toast } from 'react-toastify';
import './CaptureActuals.css';
var SessionStorage = require('store/storages/sessionStorage');

@inject('reviewValueDriverStore', 'investmentActualsStore', 'kpiBenefitsStore', "benefitActualsStore", "publishDashboardStore")
@observer

class CaptureActuals extends Component {
    constructor(props) {
        super(props);
        this.state = {
            isBenefitActuals: true,
            projectedResult: {},
            projectedInitiatives: [],
            projectedLinkedKPIIds: [],
            projectedTotalInvestmentsArray: [],
            actualResult: {},
            actualInitiatives: [],
            actualLinkedKPIIds: [],
            actualTotalInvestmentsArray: [],
            showInvestmentTab: false,
            showBenefits: false,
            showError: false,
            isWorkStreamActuals: false,
            isExpandBenefits: false,
            loadingresponse: false,
        }

        this.benefitsClick = this.benefitsClick.bind(this)
        this.investmentsClick = this.investmentsClick.bind(this)
        this.getInvestments = this.getInvestments.bind(this)
        this.projectedTotalInvFormat = this.projectedTotalInvFormat.bind(this)
        this.calcActualInvestments = this.calcActualInvestments.bind(this)
        this.calcProjectedInvestments = this.calcProjectedInvestments.bind(this)
        this.actualTotalInvFormat = this.actualTotalInvFormat.bind(this)
        this.fetchKpiBenefits = this.fetchKpiBenefits.bind(this)
        this.onSaveClick = this.onSaveClick.bind(this);
        this.onExpandClick = this.onExpandClick.bind(this);
        this.publishDashboardHandler = this.publishDashboardHandler.bind(this);
    }
    componentDidMount() {
        const { kpiBenefitsStore, publishDashboardStore } = this.props;
        const payload = {
            mapId: SessionStorage.read('mapId')
        }
        this.setState({
            showBenefits: true
        })
        // kpiBenefitsStore.getKPIBenefits(payload)
        //     .then((response) => {
        //         if (response && !response.error) {
        //             if (response) {
        //                 this.setState({
        //                     showBenefits: true
        //                 })
        //                 return true;
        //             }
        //             else {
        //                 this.setState({
        //                     showBenefits: false
        //                 })
        //                 return false;
        //             }
        //         }
        //     }
        //     )
        if (SessionStorage.read('investmentsTab') === 'true') {
            this.setState({
                isBenefitActuals: false
            })
        }

        this.getDashboardUrl();
    }
    publishDashboardHandler = (event) => {
        event.preventDefault();
        // const { keyCallOutsList } = this.state;
        const { publishDashboardStore } = this.props;

        this.setState({
            publishDashboard: true,
            loadingresponse: true,
            tablueInprogress: true
        })
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

                    this.showNotification('publishError', response.errorDescription);
                    this.setState({
                        loadingresponse: false,
                        tablueInprogress: false
                    })
                }
            })
    }
    getDashboardUrl() {
        const mapId = SessionStorage.read('mapId')
        const { token } = this.state;
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

    onExpandClick = () => {
        const { isExpandBenefits } = this.state;
        this.setState({
            isExpandBenefits: !isExpandBenefits
        })
    }
    onSaveClick() {
        const { benefitActualsStore } = this.props;
        benefitActualsStore.saveKpiBenefitActuals()
    }
    fetchKPIDetails = (kpiId, color) => {
        const { benefitActualsStore } = this.props;
        ReactTooltip.hide()
        benefitActualsStore.color = color
        benefitActualsStore.kpiId = kpiId
        let paramArrayTemp = []
        const KPIDetails = benefitActualsStore.kpiBenefits;
        let tempArray = KPIDetails;
        // benefitActualsStore.startDate=benefitActualsStore.KPIDetails[0].startDate
        KPIDetails.map((kpi, kpiIndex) => {
            kpi.actualBenefits.paramDto.map((param, index) => {
                param.paramValues.map((value, valIndex) => {
                    if (typeof value.actualValue === 'object') {
                        if (value.actualValue === null) {
                            tempArray[kpiIndex].actualBenefits.paramDto[index].paramValues[valIndex].actualValue = {
                                "actualValue": '',
                                "formattedValue": 0
                            }
                            value.paramFreqData.map((data, freqIndex) => {
                                tempArray[kpiIndex].actualBenefits.paramDto[index].paramValues[valIndex].paramFreqData[freqIndex].actualValue = {
                                    "actualValue": '',
                                    "formattedValue": 0
                                }
                                return true
                            })
                        } else {
                            tempArray[kpiIndex].actualBenefits.paramDto[index].paramValues[valIndex].actualValue = value.actualValue
                        }
                    }
                    else {

                        tempArray[kpiIndex].actualBenefits.paramDto[index].paramValues[valIndex].actualValue = {
                            "actualValue": value.actualValue,
                            "formattedValue": 0
                        }
                        value.paramFreqData.map((data, freqIndex) => {
                            tempArray[kpiIndex].actualBenefits.paramDto[index].paramValues[valIndex].paramFreqData[freqIndex].actualValue = {
                                "actualValue": data.actualValue,
                                "formattedValue": 0
                            }
                            return true
                        })

                    }
                    return true
                })
                return true
            })

            kpi.targetBenefits.paramDto.map((param, index) => {
                param.paramValues.map((value, valIndex) => {
                    if (typeof value.targetValue === 'object') {
                        if (value.targetValue === null) {
                            tempArray[kpiIndex].targetBenefits.paramDto[index].paramValues[valIndex].targetValue = {
                                "actualValue": '',
                                "formattedValue": 0
                            }
                            value.paramFreqData.map((data, freqIndex) => {
                                tempArray[kpiIndex].targetBenefits.paramDto[index].paramValues[valIndex].paramFreqData[freqIndex].targetValue = {
                                    "actualValue": '',
                                    "formattedValue": 0
                                }
                                return true
                            })
                        } else {
                            tempArray[kpiIndex].targetBenefits.paramDto[index].paramValues[valIndex].targetValue = value.targetValue
                        }
                    }
                    else {

                        tempArray[kpiIndex].targetBenefits.paramDto[index].paramValues[valIndex].targetValue = {
                            "actualValue": value.targetValue,
                            "formattedValue": 0
                        }
                        value.paramFreqData.map((data, freqIndex) => {
                            tempArray[kpiIndex].targetBenefits.paramDto[index].paramValues[valIndex].paramFreqData[freqIndex].targetValue = {
                                "actualValue": data.targetValue,
                                "formattedValue": 0
                            }
                            return true
                        })

                    }
                    return true
                })
                return true
            })
            return true
        })
        tempArray.map((kpi) => {
            if (kpiId === kpi.kpiId) {
                benefitActualsStore.startDate = kpi.startDate
                if (paramArrayTemp.length === 0) {
                    paramArrayTemp.push({
                        kpiId: kpi.kpiId,
                        kpiUnit: kpi.opKpiUnit,
                        baseline: kpi.baseline,
                        baseKpi: kpi.baseKpi,
                        baseKpiName: kpi.baseKpiName,
                        target: kpi.target,
                        startDate: kpi.startDate === "" ? "" : new Date(kpi.startDate),
                        targetAchieved: kpi.targetAchieved,
                        benefitRule: kpi.benefitRule,
                        targetBenefits: kpi.targetBenefits,
                        actualBenefits: kpi.actualBenefits,
                        frequency: kpi.kpiFrequency,
                        // paramDto: kpi.paramDto,
                        kpiBenefits: kpi.kpiBenefits,
                        kpiTrend: kpi.kpiTrend,
                        kpiType: kpi.kpiType
                    })
                }
            }
            return true
        })
      
        this.setState({
            KPIBenefitsArray: paramArrayTemp,
            KPIDetailsArray: KPIDetails
        })
    }
    fetchKpiBenefits() {
        const { benefitActualsStore } = this.props;
        benefitActualsStore.color = 'changeColor'
        benefitActualsStore.fetchBenefitActuals()
            .then((response) => {
                
    benefitActualsStore.isFrequencyChanged = false;
                if (response && !response.error) {
                    let paramArrayTemp = []
                    var KPIDetails = []
                    if (!benefitActualsStore.kpiId || benefitActualsStore.kpiId === undefined) {
                        benefitActualsStore.kpiId = benefitActualsStore.kpiBenefits && benefitActualsStore.kpiBenefits[0] && benefitActualsStore.kpiBenefits[0].kpiId;
                        KPIDetails = benefitActualsStore.kpiBenefits[0];
                    }
                    else {
                        for (let i = 0; i < benefitActualsStore.kpiBenefits.length; i++) {
                            if (benefitActualsStore.kpiId === benefitActualsStore.kpiBenefits[i].kpiId) {
                                KPIDetails = benefitActualsStore.kpiBenefits[i];
                            }
                        }
                    }
                    if (KPIDetails && KPIDetails.length === 0) {
                        benefitActualsStore.kpiId =  benefitActualsStore.kpiBenefits &&  benefitActualsStore.kpiBenefits[0] && benefitActualsStore.kpiBenefits[0].kpiId;
                        KPIDetails = benefitActualsStore.kpiBenefits[0];
                    }
                    let tempArray = KPIDetails;
                    if (benefitActualsStore.kpiBenefits.length > 0) {
                        KPIDetails.targetBenefits.paramDto.map((param, index) => {
                            param.paramValues.map((value, valIndex) => {
                                tempArray.targetBenefits.paramDto[index].paramValues[valIndex].targetValue = {
                                    "actualValue": value.targetValue,
                                    "formattedValue": 0
                                }
                                value.paramFreqData.map((data, freqIndex) => {
                                    tempArray.targetBenefits.paramDto[index].paramValues[valIndex].paramFreqData[freqIndex].targetValue = {
                                        "actualValue": data.targetValue,
                                        "formattedValue": 0
                                    }
                                    return true
                                })
                                return true
                            })
                            return true
                        })
                        KPIDetails.actualBenefits.paramDto.map((param, index) => {
                            param.paramValues.map((value, valIndex) => {
                                tempArray.actualBenefits.paramDto[index].paramValues[valIndex].actualValue = {
                                    "actualValue": value.actualValue,
                                    "formattedValue": 0
                                }
                                value.paramFreqData.map((data, freqIndex) => {
                                    tempArray.actualBenefits.paramDto[index].paramValues[valIndex].paramFreqData[freqIndex].actualValue = {
                                        "actualValue": data.actualValue,
                                        "formattedValue": 0
                                    }
                                    return true
                                })
                                return true
                            })
                            return true
                        })
                        paramArrayTemp.push({
                            kpiId: KPIDetails.kpiId,
                            kpiUnit: KPIDetails.opKpiUnit,
                            baseline: KPIDetails.baseline,
                            baseKpi: KPIDetails.baseKpi,
                            baseKpiName: KPIDetails.baseKpiName,
                            target: KPIDetails.target,
                            benefitRule: KPIDetails.benefitRule,
                            startDate: KPIDetails.startDate === "" ? "" : new Date(KPIDetails.startDate),
                            targetAchieved: KPIDetails.targetAchieved,
                            targetBenefits: tempArray.targetBenefits,
                            actualBenefits: tempArray.actualBenefits,
                            frequency: KPIDetails.kpiFrequency,
                            // paramDto: tempArray.paramDto,
                            kpiBenefits: KPIDetails.kpiBenefits,
                            kpiTrend: KPIDetails.kpiTrend,
                            kpiType: KPIDetails.kpiType
                        })
                        benefitActualsStore.startDate = KPIDetails.startDate
                        this.setState({
                            KPIBenefitsArray: paramArrayTemp,
                            KPIDetailsArray: KPIDetails,
                            selectedKpiObj: paramArrayTemp[0],
                        }, () => {
                            console.log('');
                        })
                    }

                    return true
                }else if(response && response.resultCode === 'KO'){
                    this.showNotification('publishError', response.errorDescription);
                }
            })

        // return true
    }

    projectedTotalInvFormat() {
        const { projectedResult } = this.state;
        if (projectedResult.length === 0) {
            projectedResult.initiatives = []
            projectedResult.investments = []
        }
        if (projectedResult) {
            for (let k = 0; k < projectedResult.investments.length; k++) {
                projectedResult.investments[k].total_investment_value = 0
            }
            for (let i = 0; i < projectedResult.initiatives.length; i++) {
                for (let j = 0; j < projectedResult.initiatives[i].year.length; j++) {
                    for (let k = 0; k < projectedResult.investments.length; k++) {
                        if (projectedResult.investments[k].year_no === projectedResult.initiatives[i].year[j].year_no) {

                            if (projectedResult.initiatives[i].year[j].inv_val.actualValue === '0') {
                                var tempResult = 0
                            }
                            else {
                                tempResult =
                                    //  Number( Math.round(Number(result.initiatives[i].year[j].inv_val.actualValue) * 10) / 10).toFixed(1)
                                    Number(projectedResult.initiatives[i].year[j].inv_val.actualValue).toFixed(30)
                            }
                            projectedResult.investments[k].total_investment_value = Number(projectedResult.investments[k].total_investment_value) + Number(tempResult)
                        }
                    }
                }
            }

            this.setState({
                projectedTotalInvestmentsArray: projectedResult.investments
            })
        }
    }

    actualTotalInvFormat() {
        const { actualResult } = this.state;
        if (actualResult.length === 0) {
            actualResult.initiatives = []
            actualResult.investments = []
        }
        if (actualResult) {
            for (let k = 0; k < actualResult.investments.length; k++) {
                actualResult.investments[k].total_investment_value = 0
            }
            for (let i = 0; i < actualResult.initiatives.length; i++) {
                for (let j = 0; j < actualResult.initiatives[i].year.length; j++) {
                    for (let k = 0; k < actualResult.investments.length; k++) {
                        if (actualResult.investments[k].year_no === actualResult.initiatives[i].year[j].year_no) {

                            if (actualResult.initiatives[i].year[j].inv_val.actualValue === '0') {
                                var tempResult = 0
                            }
                            else {
                                tempResult =
                                    //  Number( Math.round(Number(result.initiatives[i].year[j].inv_val.actualValue) * 10) / 10).toFixed(1)
                                    Number(actualResult.initiatives[i].year[j].inv_val.actualValue).toFixed(30)
                            }
                            actualResult.investments[k].total_investment_value = Number(actualResult.investments[k].total_investment_value) + Number(tempResult)
                        }
                    }
                }
            }

            this.setState({
                actualTotalInvestmentsArray: actualResult.investments
            })
        }

    }

    getInvestments() {
        const { investmentActualsStore } = this.props;
        const { frequency } = investmentActualsStore;
        const payload = {
            map_id: SessionStorage.read('mapId'),
            inv_frequency: frequency
        }
        investmentActualsStore.fetchActualProjectedInvestments(payload)
            .then((response) => {
                if (
                    // response.frequency 
                    !response.error && response.projected_investments && response.projected_investments.length !== 0) {
                    investmentActualsStore.frequency = response.frequency
                    // if (response.projected_investments) {
                    this.calcStartDates(response)
                    this.calcProjectedInvestments(response)
                    // }
                    // if (response.actual_investments.length > 0) {
                    this.calcActualInvestments(response)
                    // }
                } else {
                    this.setState({
                        showError: true
                    })
                }

                return true
            })

    }
    calcStartDates(response) {
        const { investmentActualsStore } = this.props;
        let DatesArr = response.start_date;
        this.setState({
            startDatesArray: DatesArr
        })
            ;
    }

    calcProjectedInvestments(response) {
        const { investmentActualsStore } = this.props;
        // let DatesArr = response.start_date;     
        let linkedKPIIds = []
        let found = false;
        if (response.projected_investments.length === 1) {
            response.projected_investments.initiatives = []
            response.projected_investments.investments = []
        }

        if (response.projected_investments.initiatives) {
            for (let i = 0; i < response.projected_investments.initiatives.length; i++) {
                for (let k = 0; k < 5; k++) {
                    if (response.projected_investments.initiatives[i].year[k] !== undefined) {

                    } else {
                        let val = {
                            inv_val: "", year_no: k + 1
                        }
                        response.projected_investments.initiatives[i].year.splice(k + 1, 0, val)
                    }
                }
            }
        }
        for (let k = 0; k < 5; k++) {
            if (response.projected_investments.investments) {
                if (response.projected_investments.investments[k] !== undefined) {

                } else {
                    let val = {
                        total_investment_value: "",
                        year_no: k + 1
                    }
                    response.projected_investments.investments.splice(k + 1, 0, val)
                }
            }
        }
        if (response.projected_investments.initiatives) {
            for (let i = 0; i < response.projected_investments.initiatives.length; i++) {
                for (let j = 0; j < response.projected_investments.initiatives[i].year.length; j++) {
                    if (response.projected_investments.initiatives[i].year[j].inv_val === 0) {
                        response.projected_investments.initiatives[i].year[j].inv_val = {
                            'actualValue': '0',
                            'formattedValue': 0
                        }
                        if (response.projected_investments.initiatives[i].year[j].frequency_data) {
                            for (let k = 0; k < response.projected_investments.initiatives[i].year[j].frequency_data.length; k++) {
                                if (response.projected_investments.initiatives[i].year[j].frequency_data[k].inv_val === 0) {
                                    response.projected_investments.initiatives[i].year[j].frequency_data[k].inv_val = {
                                        'actualValue': '0',
                                        'formattedValue': 0
                                    }
                                }
                                else {
                                    response.projected_investments.initiatives[i].year[j].frequency_data[k].inv_val = {
                                        'actualValue': response.projected_investments.initiatives[i].year[j].frequency_data[k].inv_val,
                                        'formattedValue': 0
                                    }
                                }
                            }
                        }
                    } else {
                        response.projected_investments.initiatives[i].year[j].inv_val = {
                            'actualValue': response.projected_investments.initiatives[i].year[j].inv_val,
                            'formattedValue': 0
                        }
                        if (response.projected_investments.initiatives[i].year[j].frequency_data) {
                            for (let k = 0; k < response.projected_investments.initiatives[i].year[j].frequency_data.length; k++) {
                                response.projected_investments.initiatives[i].year[j].frequency_data[k].inv_val = {
                                    'actualValue': response.projected_investments.initiatives[i].year[j].frequency_data[k].inv_val,
                                    'formattedValue': 0
                                }
                            }
                        }
                    }
                }
                for (let k = 0; k < response.KPI_list.length; k++) {
                    found = false
                    for (let j = 0; j < response.projected_investments.initiatives[i].linked_kpis.length; j++) {
                        if (response.KPI_list[k].kpi_id === response.projected_investments.initiatives[i].linked_kpis[j].kpi_id) {
                            found = true;
                            response.projected_investments.initiatives[i].linked_kpis[j].checked = true;
                            response.projected_investments.initiatives[i].linkedValue = response.projected_investments.initiatives[i].linked_kpis[j].kpi_name
                            if (response.projected_investments.initiatives[i].linked_kpis[j].cost_allocated_percent !== "" || response.actual_investments.initiatives[i].linked_kpis[j].cost_allocated_percent !== undefined) {
                                this.setState({
                                    checkedVal: response.projected_investments.initiatives[i].linked_kpis[j].kpi_name
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
                        response.projected_investments.initiatives[i].linked_kpis.push(val)
                    }
                }
            }
        }
        // }
        response.projected_investments.KPI_list = response.KPI_list
        // response.projected_investments.startDatesArray = DatesArr; 
        this.setState({
            projectedResult: response.projected_investments,
            projectedInitiatives: response.projected_investments.initiatives,
            projectedLinkedKPIIds: linkedKPIIds,
            projectedAddClicked: false
        })
        investmentActualsStore.projectedtempResult = response.projected_investments
        // this.calculateTotalInvestments()
        this.projectedTotalInvFormat()
        return response.projected_investments

    }

    calcActualInvestments(response) {
        const { investmentActualsStore } = this.props;
        let linkedKPIIds = []
        let found = false;
        if (response.actual_investments.length === 1) {
            response.actual_investments.initiatives = []
            response.actual_investments.investments = []
        }

        for (let key = 0; key < response.actual_investments.initiatives.length; key++) {
            for (let k = 0; k < 5; k++) {
                if (response.actual_investments.initiatives[key].year[k] !== undefined) {

                } else {
                    let val = {
                        inv_val: "", year_no: k + 1
                    }
                    response.actual_investments.initiatives[key].year.splice(k + 1, 0, val)
                }
            }
        }
        for (let k = 0; k < 5; k++) {
            if (response.actual_investments.investments[k] !== undefined) {

            } else {
                let val = {
                    total_investment_value: "",
                    year_no: k + 1
                }
                response.actual_investments.investments.splice(k + 1, 0, val)
            }
        }
        for (let i = 0; i < response.actual_investments.initiatives.length; i++) {
            for (let j = 0; j < response.actual_investments.initiatives[i].year.length; j++) {
                if (response.actual_investments.initiatives[i].year[j].inv_val === 0) {
                    response.actual_investments.initiatives[i].year[j].inv_val = {
                        'actualValue': '0',
                        'formattedValue': 0
                    }
                    if (response.actual_investments.initiatives[i].year[j].frequency_data) {
                        for (let k = 0; k < response.actual_investments.initiatives[i].year[j].frequency_data.length; k++) {
                            if (response.actual_investments.initiatives[i].year[j].frequency_data[k].inv_val === 0) {
                                response.actual_investments.initiatives[i].year[j].frequency_data[k].inv_val = {
                                    'actualValue': '0',
                                    'formattedValue': 0
                                }
                            }
                            else {
                                response.actual_investments.initiatives[i].year[j].frequency_data[k].inv_val = {
                                    'actualValue': response.actual_investments.initiatives[i].year[j].frequency_data[k].inv_val,
                                    'formattedValue': 0
                                }
                            }
                        }
                    }
                } else {
                    response.actual_investments.initiatives[i].year[j].inv_val = {
                        'actualValue': response.actual_investments.initiatives[i].year[j].inv_val,
                        'formattedValue': 0
                    }
                    if (response.actual_investments.initiatives[i].year[j].frequency_data) {
                        for (let k = 0; k < response.actual_investments.initiatives[i].year[j].frequency_data.length; k++) {
                            response.actual_investments.initiatives[i].year[j].frequency_data[k].inv_val = {
                                'actualValue': response.actual_investments.initiatives[i].year[j].frequency_data[k].inv_val,
                                'formattedValue': 0
                            }
                        }
                    }

                }
            }
            for (let k = 0; k < response.KPI_list.length; k++) {
                found = false
                for (let j = 0; j < response.actual_investments.initiatives[i].linked_kpis.length; j++) {
                    if (response.KPI_list[k].kpi_id === response.actual_investments.initiatives[i].linked_kpis[j].kpi_id) {
                        found = true;
                        response.actual_investments.initiatives[i].linked_kpis[j].checked = true;
                        response.actual_investments.initiatives[i].linkedValue = response.actual_investments.initiatives[i].linked_kpis[j].kpi_name
                        if (response.actual_investments.initiatives[i].linked_kpis[j].cost_allocated_percent !== "" || response.actual_investments.initiatives[i].linked_kpis[j].cost_allocated_percent !== undefined) {
                            this.setState({
                                checkedVal: response.actual_investments.initiatives[i].linked_kpis[j].kpi_name
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
                    response.actual_investments.initiatives[i].linked_kpis.push(val)
                }
            }
        }
        response.actual_investments.KPI_list = response.KPI_list
        this.setState({
            actualResult: response.actual_investments,
            actualInitiatives: response.actual_investments.initiatives,
            actualLinkedKPIIds: linkedKPIIds,
            actualAddClicked: false
        })
        investmentActualsStore.actualtempResult = response.actual_investments
        // this.calculateTotalInvestments()
        this.actualTotalInvFormat()
        return response.actual_investments

    }


    benefitsClick = (event) => {
        this.setState({
            isBenefitActuals: true,
            isWorkStreamActuals: false
        })
    }

    investmentsClick = (event) => {
        this.setState({
            isBenefitActuals: false,
            isWorkStreamActuals: false
        })
    }

    redirectHandler(type) {
        const { history } = this.props;
        // eslint-disable-next-line default-case
        switch (type) {
            case 'home':
                history.push('/home');
                break;
            case 'sales':
                history.push('/home');
                break;
            // case 'projectMenu':
            //     history.push('/deal');
            //     break;
            case 'myproject':
                history.push('my-deals');
                break;
            case "delivery-home":
                history.push('/delivery');
                break;
        }
    }
    showNotification(type, message) {
        switch (type) {

            case 'publishError':
                toast.error(<NotificationMessage
                    title="Error"
                    bodytext={message}
                    icon="error"
                />, {
                    position: toast.POSITION.BOTTOM_RIGHT
                });
                break;
            default:
                break;
        }
    }
    loadKpiBenefitTree() {
        let res = this.fetchKpiBenefits()
        if (res) {
            this.setState({
                KPIBenefitsArray: [...this.props.KPIBenefitsArray],
                KPIDetailsArray: this.props.KPIDetailsArray,
                selectedKpiObj: this.props.selectedKpiObj
            }, () => {
                console.log('');
            })
        }
    }

    workstreamsActualsClick = () => {
        this.setState({
            isBenefitActuals: false,
            isWorkStreamActuals: true,
            isBusinessCase: false,
            isExpandBenefits: true
        })

    }

    render() {
        const pname = SessionStorage.read('projectName');
        const demoUser = SessionStorage.read('demoUser');
        const option = SessionStorage.read('option_selected')
        const { benefitActualsStore } = this.props;
        const { showBenefits } = this.state;
        const {
            branchTree,
        } = benefitActualsStore
        const {
            color,
            kpiId
        } = benefitActualsStore
        return (
            <div className='container-fluid no-project-body' >
                <Menu />
                <div className="breadcrumb-row row">


                    <div className="col-sm-12">
                        <nav aria-label="breadcrumb">
                            <ol className="breadcrumb">
                                <li className="breadcrumb-item" style={{ cursor: 'pointer' }} onClick={() => this.redirectHandler('home')}>Home</li>

                                {option === 'sales' ?
                                    <li className="breadcrumb-item active" style={{ cursor: 'pointer' }} aria-current="page" onClick={() => this.redirectHandler('sales-home')}>Opportunity Home </li>
                                    : <li className="breadcrumb-item active" style={{ cursor: 'pointer' }} aria-current="page" onClick={() => this.redirectHandler('delivery-home')}>Program Delivery Home </li>
                                }
                                {/* {option === "sales" ?
                                        <li className="breadcrumb-item active" style={{ cursor: 'pointer' }} onClick={() => this.redirectHandler('sales')}>Sales</li> :
                                        <li className="breadcrumb-item active" style={{ cursor: 'pointer' }} onClick={() => this.redirectHandler('sales')}>Delivery</li>
                                    } */}
                                {
                                    !JSON.parse(demoUser) &&
                                    <li className="breadcrumb-item" style={{ cursor: 'pointer' }} aria-current="page" onClick={() => this.redirectHandler('myproject')}>{option === "sales" ? "My Opportunities" : "My Projects"}</li>
                                }
                                <li className="breadcrumb-item" aria-current="page">{JSON.parse(demoUser) === true ? (option === 'sales' ? 'Demo Opportunity' : 'Demo Project') : pname}</li>
                                <li className="breadcrumb-item active" aria-current="page">Capture Actuals</li>
                            </ol>
                        </nav>
                    </div>

                </div>
                {/* <div className="col-sm-6 text-right">
                        <span onClick={() => this.redirectHandler('projectMenu')} style={{ color: '#ffffff', fontSize: '40px', cursor: 'pointer' }}>
                            &times;
                        </span>
                    </div> */}
                <div className="capture-actuals-main-tab">
                    <div className="row page-name-row">
                        <label className="page-header-label">{JSON.parse(demoUser) === true ? (option === 'sales' ? 'Demo Opportunity' : 'Demo Project') : pname}</label> {" "}
                        {/* <img src={Polygon} height="31px" alt={JSON.parse(demoUser) ? 'Demo Project' : pname} width="31px" /> */}
                    </div>
                    <ProjectNavbar activePage="capture_actuals"
                        publishDashboardHandler={this.publishDashboardHandler}
                        loadingresponse={this.state.loadingresponse}
                    />

                    <div className="tab-content-outer-wrapper">
                        <div className="ca-tab-content-main">
                            <div className="row" style={{}}>
                                <div className="" style={{ display: "inline-flex", width: '100%' }}>
                                    {(this.state.isExpandBenefits ? "" :
                                        showBenefits ?
                                            <div className=" ca-vdt-tree-main vdt-table">
                                                <div className="row rvdt-header align-self-center " style={{ backgroundColor: '#6C6C6C', width: 'inherit' }}>
                                                    <ReviewValueDriverTreeHeader isBusinessCase={true} />
                                                </div>
                                                {
                                                    branchTree && branchTree.length > 0 ?
                                                        (
                                                            <div style={{}}>
                                                                <div key={Math.floor(Math.random() * 1001)} className="" id="vdt">
                                                                    {/* {this.state.isBenefitActuals ? */}
                                                                    <ValueDriverTreeNew
                                                                        branchTree={branchTree}
                                                                        isBusinessCase={true}
                                                                        fetchKPIDetails={this.fetchKPIDetails}
                                                                        isKPIBenefitsTab={!(this.state.isWorkStreamActuals || !this.state.isBenefitActuals)}
                                                                        color={color}
                                                                        kpiId={kpiId}
                                                                        isBenefitActuals={this.state.isBenefitActuals}
                                                                        isWorkStreamActuals={this.state.isWorkStreamActuals}

                                                                    />

                                                                </div>
                                                            </div>
                                                        ) :
                                                        <div className="row justify-content-center" style={{ height: '50px' }}>
                                                            {/* <h4> <i className="fa fa-exclamation-triangle"></i> No data to load</h4> */}
                                                            <i className="fa fa-spinner fa-spin" style={{ fontSize: '18px', color: '#ffffff', height: "min-content" }}></i>
                                                        </div>
                                                }
                                            </div> : '')}
                                    <div className={(this.state.isExpandBenefits ? "col-sm-12"
                                        : "ca-tables-main")}
                                    >
                                        {/* <button style={{color:"black"}} onClick={this.onSaveClick}> Save </button> */}
                                        {showBenefits === true ?
                                            <BenInvActualsHome
                                                onExpandClick={this.onExpandClick}
                                                benefitsClick={this.benefitsClick}
                                                investmentsClick={this.investmentsClick}
                                                isBenefitActuals={this.state.isBenefitActuals}
                                                isBusinessCase={this.state.isBusinessCase}
                                                getInvestments={this.getInvestments}
                                                totalInvFormat={this.totalInvFormat}
                                                actualResult={this.state.actualResult}
                                                actualInitiatives={this.state.actualInitiatives}
                                                actualLinkedKPIIds={this.state.actualLinkedKPIIds}
                                                actualAddClicked={this.state.actualAddClicked}
                                                actualTotalInvestmentsArray={this.state.actualTotalInvestmentsArray}
                                                projectedResult={this.state.projectedResult}
                                                projectedInitiatives={this.state.projectedInitiatives}
                                                projectedLinkedKPIIds={this.state.projectedLinkedKPIIds}
                                                projectedAddClicked={this.state.projectedAddClicked}
                                                projectedTotalInvestmentsArray={this.state.projectedTotalInvestmentsArray}
                                                fetchKpiBenefits={this.fetchKpiBenefits}
                                                KPIBenefitsArray={this.state.KPIBenefitsArray}
                                                KPIDetailsArray={this.state.KPIDetailsArray}
                                                selectedKpiObj={this.state.selectedKpiObj}
                                                showInvestmentTab={this.state.showInvestmentTab}
                                                showError={this.state.showError}
                                                isWorkStreamActuals={this.state.isWorkStreamActuals}
                                                workstreamsActualsClick={this.workstreamsActualsClick}
                                                isExpandBenefits={this.state.isExpandBenefits}
                                                startDatesArray={this.state.startDatesArray}
                                                branchTree={branchTree}
                                            /> : <div className="row justify-content-center" style={{ height: '50px' }}>
                                                {/* <h4> <i className="fa fa-exclamation-triangle"></i> No data to load</h4> */}
                                                <i className="fa fa-spinner fa-spin" style={{ fontSize: '18px', color: '#ffffff', height: "min-content" }}></i>
                                            </div>}
                                    </div>
                                </div>
                            </div >
                        </div>
                    </div>
                </div>






            </div >
        )
    }
}

export default withRouter(CaptureActuals);