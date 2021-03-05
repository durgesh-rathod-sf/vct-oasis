import React, { Component } from 'react';
import { observer, inject } from 'mobx-react';
import { withRouter } from "react-router-dom";
import { toast } from 'react-toastify';
import CustomVDTTree from '../../components/CustomVDTTree/CustomVDTTree.jsx'
import ReviewValueDriverTreeHeader from '../../components/ReviewValueDriverTreeHeader/ReviewValueDriverTreeHeader';
import './customVDT.css';
import CustomVDTTable from '../../containers/CustomVDTTable/CustomVDTTable.jsx';
import NotificationMessage from '../../components/NotificationMessage/NotificationMessage';
import IconStack from '../ValueDrivers/IconStack/IconStack.jsx';
var SessionStorage = require('store/storages/sessionStorage');

@inject('customVDTStore', 'reviewValueDriverStore', 'editVDTStore')
@observer
class CustomVDT extends Component {
    constructor(props) {
        super(props);
        this.state = {
            strategicObjectivesList: [],
            financialObjectivesList: [],
            businessObjectivesList: [],
            valueDriversList: [],
            operationalKPIsList: [],
            strategicObjectives: [],
            financialObjectives: [],
            businessObjectives: [],
            valueDrivers: [],
            operationalKPIs: [],
            selectedKPIS: [],
            displayVDTTable: false,
            displayKPIModal: false,
            showModal: true,
            disableSo: false,
            disableFo: false,
            disableBo: false,
            disableVd: false,
            disableKPI: false,
            kpiDetails: {},
            totalSelectedLinesArray: [],
            deletedKpiList: [],
            kpiIndex: false,
            sourceIndex: true,
            sourceObjClass: false,
            dragError: false,
            isloading: false

        }
        this.addMoreObjectives = this.addMoreObjectives.bind(this)
        this.addStrategicObjective = this.addStrategicObjective.bind(this)
        this.addFinancialObjective = this.addFinancialObjective.bind(this)
        this.addBusinessObjective = this.addBusinessObjective.bind(this)
        this.addValueDriver = this.addValueDriver.bind(this)
        this.addKPI = this.addKPI.bind(this)
        this.onSelectedKPI = this.onSelectedKPI.bind(this)
        this.onNewKPI = this.onNewKPI.bind(this)
        this.modalCloseHandler = this.modalCloseHandler.bind(this)
        this.saveKPIHandler = this.saveKPIHandler.bind(this);
        this.onSelectedFo = this.onSelectedFo.bind(this);
        this.onSelectedBo = this.onSelectedBo.bind(this);
        this.onSelectedVd = this.onSelectedVd.bind(this);
        this.onSelectedSo = this.onSelectedSo.bind(this)
        //this.kpiChange = this.kpiChange.bind(this);
        this.showList = this.showList.bind(this);
        this.buildALine = this.buildALine.bind(this);
        this.deleteObjective = this.deleteObjective.bind(this);
        this.newFinancialObj = this.newFinancialObj.bind(this)
        this.newStrategicObj = this.newStrategicObj.bind(this)
        this.newVDO = this.newVDO.bind(this)
        this.newBusinessObj = this.newBusinessObj.bind(this)
        this.updateConnectingLines = this.updateConnectingLines.bind(this);
        this.isDefined = this.isDefined.bind(this);
    }
    generateVDT() {
        const { reviewValueDriverStore } = this.props;
        let mapId = SessionStorage.read('mapId')

        reviewValueDriverStore.getSelectedKpi(mapId)
            .then((response) => {
                if (response && !response.error && response.resultCode === 'OK') {
                    // branchTree[0]
                    this.buildTreeFromVDT();
                } else if (response && response.resultCode === 'KO') {
                    this.showErrorNotification(response.errorDescription, 'Error', 'error');
                } else {
                    this.showErrorNotification('Sorry!Something went wrong', 'Error', 'error')
                }
            }
            )
    }
    componentDidMount() {
        const { customVDTStore, editVDTFlag, reviewValueDriverStore} = this.props;

        if (editVDTFlag) {
            this.generateVDT()
        }
        customVDTStore.fetchDropDownValues()
            .then((response) => {
                if (response && !response.error && response.data.resultCode === 'OK' && response.data.resultObj) {
                    this.setState({
                        displayCustomVDTTree: true,
                        operationalKPIsList: customVDTStore.operationalKPIsList,
                        strategicObjectivesList: customVDTStore.strategicObjectivesList,
                        financialObjectivesList: customVDTStore.financialObjectivesList,
                        businessObjectivesList: customVDTStore.businessObjectivesList,
                        valueDriversList: customVDTStore.valueDriversList,
                        // displayVDTTable: false
                    })
                } else if (response && response.data.resultCode === 'KO') {
                    this.showErrorNotification(response.data.errorDescription, 'Error', 'error');
                }
            });

        this.props.getIndustriesList();
        this.props.getBusinessList();

        window.addEventListener('resize', this.updateConnectingLines);
    }

    componentWillUnmount() {
        window.removeEventListener('resize', this.updateConnectingLines);
    }

    updateConnectingLines() {
        const { totalSelectedLinesArray } = this.state;
        this.setState({ totalSelectedLinesArray: totalSelectedLinesArray });
    }

    buildTreeFromVDT = () => {
        const { reviewValueDriverStore } = this.props;
        const { branchTree } = reviewValueDriverStore;
        this.loadCustomVDTTree(branchTree[0]);
        this.colourErr()
    }
    colourErr() {
        const { operationalKPIs } = this.state;
        let opkpiObjArray = operationalKPIs;
        for (let i = 0; i < opkpiObjArray.length; i++) {
            if (opkpiObjArray[i].value && opkpiObjArray[i].value !== '') {
                if (((opkpiObjArray[i].value.baseline) === null || (opkpiObjArray[i].value.baseline) === "") ||
                    (opkpiObjArray[i].value.baseline && opkpiObjArray[i].value.baseline.actualValue === "") ||
                    ((opkpiObjArray[i].value.target) === null || (opkpiObjArray[i].value.target) === "") ||
                    (opkpiObjArray[i].value.target && opkpiObjArray[i].value.target.actualValue === "") ||
                    (opkpiObjArray[i].value.targetAchieved === null || opkpiObjArray[i].value.targetAchieved === "Select Year" || opkpiObjArray[i].value.targetAchieved === "")) {
                    opkpiObjArray[i].color = 'red'
                }
                else {
                    opkpiObjArray[i].color = opkpiObjArray[i].value.okpiType === 'NON_FINANCIAL' ? 'grey' : 'blue'
                }
            }
        }
    }

    loadCustomVDTTreeAfterDrag = () => {
        const { customVDTStore, editVDTFlag } = this.props;
        const { branchTree } = customVDTStore;
        this.loadCustomVDTTree(branchTree[0]);
        const { strategicObjectives, businessObjectives, valueDrivers, financialObjectives, operationalKPIs, totalSelectedLinesArray } = this.state
        customVDTStore.totalSelectedLinesArray = [...totalSelectedLinesArray]
        customVDTStore.strategicObjectives = strategicObjectives
        customVDTStore.businessObjectives = businessObjectives
        customVDTStore.financialObjectives = financialObjectives
        customVDTStore.valueDrivers = valueDrivers
        customVDTStore.operationalKPIs = operationalKPIs
        this.setState({
            totalSelectedLinesArray: false,
            strategicObjectives: false,
            financialObjectives: false,
            businessObjectives: false,
            valueDrivers: false,
            operationalKPIs: false,
            displayVDTTable: false
        });

        this.props.reloadCustomVDT(editVDTFlag)
        this.updateConnectingLines();
    }
    /*
    kpiChange = (event, type) => {
        const { kpiDetails, operationalKPIs } = this.state;
        const targetId = event.target.id
        switch (type) {
            case 'kpiName':
				kpiDetails.opKpiError= RegExp(/^[0-9A-Za-z._#%$\s]*$/).test(event.target.value) ? '': 'Please enter valid KPI name. Special characters except #, ., _, $, %, space are invalid';
                kpiDetails.opKpi = event.target.value
                operationalKPIs[targetId].value.opKpi = event.target.value
                operationalKPIs[targetId].name = event.target.value
                break;
            case 'kpiDescription':
				kpiDetails.opKpiDescError= RegExp(/^[0-9A-Za-z._#@$%\s]*$/).test(event.target.value) ? '': 'Please enter valid description. Special characters except #, ., _, @, $, %, space are invalid';
                kpiDetails.opKpiDesc = event.target.value
                operationalKPIs[targetId].value.opKpiDesc = event.target.value
                break;
            case 'kpiFormula':
				kpiDetails.opKpiFormulaError= RegExp(/^[a-zA-Z0-9%#\s.$()\-^*+/\"]*$/).test(event.target.value) ? '': 'Please enter valid formula. Special characters except %, #, $, (, ), ., -, ^, *, +, / are invalid';
                kpiDetails.opKpiFormula = event.target.value
                operationalKPIs[targetId].value.opKpiFormula = event.target.value
                break;
            case 'kpiTrend':
                kpiDetails.kpiTrend = event.target.value
                operationalKPIs[targetId].value.kpiTrend = event.target.value
                break;
            case 'kpiUnit':
                kpiDetails.opKpiUnit = event.target.value
                operationalKPIs[targetId].value.opKpiUnit = event.target.value
                break;
            case 'kpiCalculationType':
                kpiDetails.calculationType = event.target.value
                operationalKPIs[targetId].value.calculationType = event.target.value
                break;
            default:
                break;
        }
        //}
        //}
        this.setState({
            displayCustomVDTTree: true,
            operationalKPIs: operationalKPIs,
            kpiDetails: kpiDetails
        })
    }
    */

    loadCustomVDTTree = (branchTree) => {
        const { editVDTStore } = this.props;

        let strategyObjArray = [];
        let finanObjArray = [];
        let businObjArray = [];
        let valdrivObjArray = [];
        let opkpiObjArray = [];
        let totalConnectingLinesArray = [];
        Object.values(branchTree).map((sobj, sobjIndex) => {
            const objName = Object.keys(branchTree)[sobjIndex];
            const objectiveIndex = strategyObjArray.length;
            strategyObjArray.push({
                index: objectiveIndex,
                value: objName,
                checked: true,
                parentObj: '',
                parentObjIndex: '',
                objType: 'strategic_identifier',
                isLabel: true,
                childIndexes: []
            });

            Object.values(branchTree)[sobjIndex].map((fobj, fobjIndex) => {
                const objName = Object.keys(fobj)[0];
                const objectiveIndex = finanObjArray.length;
                let parentObjectiveIndex = 0;
                if (strategyObjArray.length > 0) {
                    parentObjectiveIndex = strategyObjArray.length - 1;
                }
                finanObjArray.push({
                    index: objectiveIndex,
                    value: objName,
                    checked: true,
                    parentObj: 'strategic_identifier' + parentObjectiveIndex,
                    parentObjIndex: parentObjectiveIndex,
                    objType: 'financial_identifier',
                    isLabel: true,
                    childIndexes: []
                });
                strategyObjArray[parentObjectiveIndex].childIndexes.push(objectiveIndex);
              
                totalConnectingLinesArray.push({
                    sourceClass: 'strategic_identifier' + parentObjectiveIndex,
                    destClass: 'financial_identifier' + objectiveIndex,
                    checked: true,
                    checkBoxIndex: objectiveIndex,
                    objectiveType: 'financial_identifier',
                    sourceObjectiveIndex: parentObjectiveIndex,
                    destObjectiveValue: objName
                });
                Object.values(fobj)[0].map((bobj, bobjIndex) => {
                    const objName = Object.keys(bobj)[0];
                    const objectiveIndex = businObjArray.length;
                    let parentObjectiveIndex = 0;
                    if (finanObjArray.length > 0) {
                        parentObjectiveIndex = finanObjArray.length - 1;
                    }
                    businObjArray.push({
                        index: objectiveIndex,
                        value: objName,
                        checked: true,
                        parentObj: 'financial_identifier' + parentObjectiveIndex,
                        parentObjIndex: parentObjectiveIndex,
                        objType: 'business_identifier',
                        isLabel: true,
                        childIndexes: []
                    });
                    finanObjArray[parentObjectiveIndex].childIndexes.push(objectiveIndex);
                   
                    totalConnectingLinesArray.push({
                        sourceClass: 'financial_identifier' + parentObjectiveIndex,
                        destClass: 'business_identifier' + objectiveIndex,
                        checked: true,
                        checkBoxIndex: objectiveIndex,
                        objectiveType: 'business_identifier',
                        sourceObjectiveIndex: parentObjectiveIndex,
                        destObjectiveValue: objName
                    });
                    Object.values(bobj)[0].map((vdObj, vdObjIndex) => {
                        const objName = Object.keys(vdObj)[0];
                        const objectiveIndex = valdrivObjArray.length;
                        let parentObjectiveIndex = 0;
                        if (businObjArray.length > 0) {
                            parentObjectiveIndex = businObjArray.length - 1;
                        }
                        valdrivObjArray.push({
                            index: objectiveIndex,
                            value: objName,
                            checked: true,
                            parentObj: 'business_identifier' + parentObjectiveIndex,
                            parentObjIndex: parentObjectiveIndex,
                            objType: 'value_driver_identifier',
                            isLabel: true,
                            childIndexes: []
                        });
                        businObjArray[parentObjectiveIndex].childIndexes.push(objectiveIndex);
                       
                        totalConnectingLinesArray.push({
                            sourceClass: 'business_identifier' + parentObjectiveIndex,
                            destClass: 'value_driver_identifier' + objectiveIndex,
                            checked: true,
                            checkBoxIndex: objectiveIndex,
                            objectiveType: 'value_driver_identifier',
                            sourceObjectiveIndex: parentObjectiveIndex,
                            destObjectiveValue: objName
                        });
                        Object.values(vdObj)[0].map((kpiObj, kpiObjIndex) => {
                            const kpiObject = Object.values(kpiObj)[0];
                            const objectiveIndex = opkpiObjArray.length;
                            let parentObjectiveIndex = 0;
                            let kpiObjValues = {
                                avgBenchmark: kpiObject[11].avgBenchmark[0],
                                baseline: kpiObject[20].baseline[0],
                                bicBenchmark: kpiObject[10].bicBenchmark[0],
                                bottomPerfBenchmark: kpiObject[12].bottomPerfBenchmark[0],
                                calculationType: kpiObject[24].calculationType[0],
                                kpiTrend: kpiObject[13].kpiTrend[0],
                                opKpi: kpiObject[6].opKpi[0],
                                opKpiDesc: kpiObject[7].opKpiDesc[0],
                                opKpiFormula: kpiObject[8].opKpiFormula[0],
                                opKpiUnit: kpiObject[9].opKpiUnit[0],
                                target: kpiObject[21].target[0],
                                targetAchieved: kpiObject[22].targetAchieved[0],
                                kpi_id: kpiObject[0].kpiId[0],
                                enabledBenchmark: kpiObject[28].enabledBenchmark[0],
                                map_id: kpiObject[27].mapId[0],
                                okpiType: kpiObject[40].kpiType[0],
                                avgBenchmarkSource: kpiObject[42].avgBenchmarkSource[0],
                                bicBenchmarkSource: kpiObject[41].bicBenchmarkSource[0]
                            }
                            if (valdrivObjArray.length > 0) {
                                parentObjectiveIndex = valdrivObjArray.length - 1;
                            }
                            opkpiObjArray.push({
                                index: objectiveIndex,
                                value: kpiObjValues,
                                name: kpiObject[6].opKpi[0],
                                checked: true,
                                parentObj: 'value_driver_identifier' + parentObjectiveIndex,
                                parentObjIndex: parentObjectiveIndex,
                                objType: 'operational_identifier',
                                isLabel: true,
                                childIndexes: []
                            });
                            valdrivObjArray[parentObjectiveIndex].childIndexes.push(objectiveIndex);
                           
                            totalConnectingLinesArray.push({
                                sourceClass: 'value_driver_identifier' + parentObjectiveIndex,
                                destClass: 'operational_identifier' + objectiveIndex,
                                checked: true,
                                checkBoxIndex: objectiveIndex,
                                objectiveType: 'operational_identifier',
                                sourceObjectiveIndex: parentObjectiveIndex,
                                destObjectiveValue: kpiObjValues
                            });
                            return true
                        });
                        return true
                    });
                    return true
                });
                return true
            });
            return true
        });
        for (let i = 0; i < opkpiObjArray.length; i++) {
            let okpi = opkpiObjArray[i].value
            if (editVDTStore.selectedKPIIds.indexOf(okpi.kpi_id) === -1) {
                editVDTStore.selectedKPIIds.push(okpi.kpi_id);
            }
        }

        this.removeExistingObjectivesFromDropDown(opkpiObjArray)
        this.setState({
            strategicObjectives: strategyObjArray,
            financialObjectives: finanObjArray,
            businessObjectives: businObjArray,
            valueDrivers: valdrivObjArray,
            operationalKPIs: opkpiObjArray,
            displayCustomVDTTree: true,
            displayVDTTable: true,
            disableSo: false,
            disableFo: false,
            disableBo: false,
            disableVd: false,
            disableKPI: false,
            displayKPIModal: false
        }, () => {
            this.setState({
                totalSelectedLinesArray: [...totalConnectingLinesArray]
            })
        });
    }
    removeExistingObjectivesFromDropDown(opkpiObjArray) {
        const { customVDTStore } = this.props;
        const { operationalKPIsList } = customVDTStore;
        operationalKPIsList.map((kpi, index) => {
            opkpiObjArray.map((opKpi, kpiIndex) => {
                if (kpi.okpi === opKpi.value.opKpi) {                               //okpi change
                    operationalKPIsList.splice(index, 1)
                }
                return true
            })

            return true
        })
    }
    updatedDisableDataListFlags = (event, value) => {
        const type = event.target.dataset.type;
        switch (type) {
            case 'strategic_identifier':
                this.setState({
                    disableSo: value
                })
                break;
            case 'financial_identifier':
                this.setState({
                    disableFo: value
                })
                break;
            case 'business_identifier':
                this.setState({
                    disableBo: value
                })
                break;
            case 'value_driver_identifier':
                this.setState({
                    disableVd: value
                })
                break;
            case 'operational_identifier':
                this.setState({
                    disableKPI: value
                })
                break;
            default:
                break;
        }

    }

    onSelectedObjective = (event, type) => {
        // event.preventDefault();
        // set the disable data-list flags to false on change in input
        // this.updatedDisableDataListFlags(event, false);

        const { customVDTStore } = this.props;
        customVDTStore.isCustomVDTStarted = true;
        switch (type) {
            case 'SO':
                if (event.target.value.length >= 1) {
                    this.setState({
                        disableSo: false
                    })
                } else {
                    this.setState({
                        disableSo: true
                    })
                }
                this.onSelectedSo(event)
                break;
            case 'FO':
                if (event.target.value.length >= 1) {
                    this.setState({
                        disableFo: false
                    })
                } else {
                    this.setState({
                        disableFo: true
                    })
                }
                this.onSelectedFo(event)
                break;
            case 'BO':
                if (event.target.value.length >= 1) {
                    this.setState({
                        disableBo: false
                    })
                } else {
                    this.setState({
                        disableBo: true
                    })
                }
                this.onSelectedBo(event)
                break;
            case 'VD':
                if (event.target.value.length >= 1) {
                    this.setState({
                        disableVd: false
                    })
                } else {
                    this.setState({
                        disableVd: true
                    })
                }
                this.onSelectedVd(event)
                break;
            case 'KPI':
                if (event.target.value.length >= 1) {
                    this.setState({
                        disableKPI: false
                    })
                } else {
                    this.setState({
                        disableKPI: true
                    })
                }
                this.onSelectedKPI(event)
                break;
            default:
                break;
        }
    }

    onSelectedSo(event) {
        let { strategicObjectives, strategicObjectivesList } = this.state;
        let so = strategicObjectives;
        so[event.target.dataset.index].value = event.target.value;

        this.setState({
            strategicObjectives: so,
            displayCustomVDTTree: true
        })
        if (strategicObjectivesList.includes(event.target.value)) {
            so[event.target.dataset.index].isLabel = true
        }
        const index = strategicObjectivesList.indexOf(event.target.value);
        if (index > -1) {
            strategicObjectivesList.splice(index, 1);
        }

    }

    onSelectedFo(event) {
        let { financialObjectives } = this.state;
        let { customVDTStore } = this.props;
        let { financialObjectivesList } = customVDTStore
        let fo = financialObjectives;
        fo[event.target.dataset.index].value = event.target.value;
        if (financialObjectivesList.includes(event.target.value)) {
            fo[event.target.dataset.index].isLabel = true
        }
        this.setState({
            financialObjectives: fo,
            // disableFo: true,
            displayCustomVDTTree: true
        })
        const index = financialObjectivesList.indexOf(event.target.value);
        if (index > -1) {
            financialObjectivesList.splice(index, 1);
        }

    }

    onSelectedBo(event) {
        let { businessObjectives } = this.state;
        let bo = businessObjectives;
        const { customVDTStore } = this.props;
        let { businessObjectivesList } = customVDTStore
        bo[event.target.dataset.index].value = event.target.value
        if (businessObjectivesList.includes(event.target.value)) {
            bo[event.target.dataset.index].isLabel = true
        }
        this.setState({
            businessObjectives: bo,
            displayCustomVDTTree: true
        })

        const index = businessObjectivesList.indexOf(event.target.value);
        if (index > -1) {
            businessObjectivesList.splice(index, 1);
        }
    }

    onSelectedVd(event) {
        let { valueDrivers } = this.state;
        const { customVDTStore } = this.props;
        let { valueDriversList } = customVDTStore
        let vd = valueDrivers;
        vd[event.target.dataset.index].value = event.target.value
        if (valueDriversList.includes(event.target.value)) {
            vd[event.target.dataset.index].isLabel = true
        }
        const index = valueDriversList.indexOf(event.target.value);
        if (index > -1) {
            valueDriversList.splice(index, 1);
        }
        this.setState({
            valueDrivers: vd,
            displayCustomVDTTree: true
        })

    }

    saveKPIHandler(kpiModalDetails, targetId) {
        const { kpiDetails, operationalKPIs } = this.state;

        kpiDetails.opKpi = kpiModalDetails.opKpi;
        kpiDetails.opKpiUnit = kpiModalDetails.opKpiUnit;
        kpiDetails.opKpiDesc = kpiModalDetails.opKpiDesc;
        kpiDetails.opKpiFormula = kpiModalDetails.opKpiFormula;
        kpiDetails.kpiTrend = kpiModalDetails.kpiTrend;
        kpiDetails.calculationType = kpiModalDetails.calculationType;
        kpiDetails.okpiType = kpiModalDetails.okpiType;

        operationalKPIs[targetId].value.opKpi = kpiModalDetails.opKpi;
        operationalKPIs[targetId].name = kpiModalDetails.opKpi;
        operationalKPIs[targetId].value.opKpiDesc = kpiModalDetails.opKpiDesc;
        operationalKPIs[targetId].value.opKpiFormula = kpiModalDetails.opKpiFormula;
        operationalKPIs[targetId].value.kpiTrend = kpiModalDetails.kpiTrend;
        operationalKPIs[targetId].value.opKpiUnit = kpiModalDetails.opKpiUnit;
        operationalKPIs[targetId].value.calculationType = kpiModalDetails.calculationType;
        operationalKPIs[targetId].value.okpiType = kpiModalDetails.okpiType;

        this.setState({
            displayKPIModal: false,
            displayVDTTable: true,
            kpiDetails: kpiDetails,
            operationalKPIs: operationalKPIs,
        })
    }

    addMoreObjectives(type) {
        switch (type) {
            case 'SO':
                this.addStrategicObjective()
                break;
            case 'BO':
                this.addBusinessObjective()
                break;
            case 'FO':
                this.addFinancialObjective()
                break;
            case 'VD':
                this.addValueDriver()
                break;
            case 'KPI':
                this.addKPI()
                break;
            default:

                break;

        }
    }

    addStrategicObjective() {
        let { strategicObjectives } = this.state;
        let so = strategicObjectives
        if ((so.length === 0)) {
            so.push({
                index: 0,
                value: '',
                checked: false,
                parentObj: '',
                parentObjIndex: '',
                objType: 'strategic_identifier',
                isLabel: false,
                childIndexes: []
            })
        }
        this.setState({
            strategicObjectives: so,
            displayCustomVDTTree: true,
            disableSo: true
        })
    }

    addFinancialObjective() {
        let { financialObjectives } = this.state;
        let fo = financialObjectives
        if (fo.length === 0) {
            fo.push({
                index: 0,
                value: '',
                checked: false,
                parentObj: '',
                parentObjIndex: '',
                objType: 'financial_identifier',
                isLabel: false,
                childIndexes: []
            })
        }
        else {
            fo.push({
                index: fo.length,
                value: '',
                checked: false,
                parentObj: '',
                parentObjIndex: '',
                objType: 'financial_identifier',
                childIndexes: []
            })
        }
        this.setState({
            financialObjectives: fo,
            displayCustomVDTTree: true,
            disableFo: true
        })
    }

    addBusinessObjective() {
        let { businessObjectives } = this.state;
        let bo = businessObjectives
        if (bo.length === 0) {
            bo.push({
                index: 0,
                value: '',
                checked: false,
                parentObj: '',
                parentObjIndex: '',
                objType: 'business_identifier',
                childIndexes: []
            })
        }
        else {
            bo.push({
                index: bo.length,
                value: '',
                checked: false,
                parentObj: '',
                parentObjIndex: '',
                objType: 'business_identifier',
                childIndexes: []
            })
        }
        this.setState({
            businessObjectives: bo,
            displayCustomVDTTree: true,
            disableBo: true
        })
    }

    addValueDriver() {
        let { valueDrivers } = this.state;
        let vd = valueDrivers
        if (vd.length === 0) {
            vd.push({
                index: 0,
                value: '',
                checked: false,
                parentObj: '',
                parentObjIndex: '',
                objType: 'value_driver_identifier',
                childIndexes: []
            })
        }
        else {
            vd.push({
                index: vd.length,
                value: '',
                checked: false,
                parentObj: '',
                parentObjIndex: '',
                objType: 'value_driver_identifier',
                childIndexes: []
            })
        }
        this.setState({
            valueDrivers: vd,
            displayCustomVDTTree: true,
            disableVd: true
        })
    }

    addKPI() {

        const { customVDTStore } = this.props;
        let { operationalKPIs } = this.state;
        const { operationalKPIsList } = customVDTStore;
        let KPIs = operationalKPIs

        operationalKPIsList.map((kpi, index) => {
            operationalKPIs.map((opKpi, kpiIndex) => {
                if (kpi.okpi === opKpi.value.opKpi) {                               //okpi change
                    operationalKPIsList.splice(index, 1)
                }
                return true
            })

            return true
        })
        if (KPIs.length === 0) {
            KPIs.push({
                index: 0,
                value: '',
                checked: false,
                parentObj: '',
                parentObjIndex: '',
                objType: 'operational_identifier',
                name: '',
                childIndexes: []
            })
        }
        else {
            KPIs.push({
                index: KPIs.length,
                value: '',
                checked: false,
                parentObj: '',
                parentObjIndex: '',
                objType: 'operational_identifier',
                name: '',
                childIndexes: []
            })
        }
        this.setState({
            operationalKPIs: KPIs,
            displayCustomVDTTree: true,
            disableKPI: true
        })
    }

    redirectHandler(type) {
        const { history } = this.props;
        switch (type) {
            case 'home':
                history.push('/home');
                break;
            // case 'projectMenu':
            //     history.push('/deal');
            //     break;
            case 'myproject':
                history.push('/my-deals');
                break;
            default:
                break;
        }
    }

    onSelectedKPI = (e) => {

        let value = e.target.value;
        let id = e.target.id;
        let datasetIndex = e.target.dataset.index;
        this.selectKpi(value, id, datasetIndex)

    }
    async selectKpi(value, id, datasetIndex) {
        const { customVDTStore } = this.props;
        const { operationalKPIsList } = customVDTStore;
        let { operationalKPIs } = this.state;
        let indexfordelete
        operationalKPIs[id].name = value;

        for (let i = 0; i < operationalKPIsList.length; i++) {
            if (operationalKPIsList[i].okpi === value) {                                                    //okpi change
                await customVDTStore.fetchKPIInfo(operationalKPIsList[i].kpi_id)
                    .then((response) => {
                        // if (response.error) {
                        //     return {
                        //         error: true
                        //     }
                        // } else {
                        if (response && response.data.resultCode === 'OK') {
                            response.data.resultObj.kpi_id = operationalKPIsList[i].kpi_id
                            // reviewValueDriverStore.operationalKpIs.push(response.data.resultObj[0])
                            for (let k = 0; k < operationalKPIs.length; k++) {
                                if (operationalKPIs[k].index === Number(id)) {
                                    operationalKPIs[k].value = response.data.resultObj
                                }
                            }
                            this.setState({
                                displayVDTTable: true,
                                operationalKPIs: operationalKPIs
                            })
                            return true
                        } else if (response && response.data.resultCode === 'KO') {
                            this.showErrorNotification(response.data.errorDescription, 'Error', 'error');
                        }
                        // }

                    })
            }
        }
        // operationalKPIs[datasetIndex].value = value                                          //value issue
        operationalKPIsList.map((kpi, index) => {
            if (kpi.okpi === value) {                                                               //okpi change
                operationalKPIs[datasetIndex].isLabel = true
                indexfordelete = index
            }
            return true
        })
        operationalKPIsList.map((kpi, index) => {
            if (kpi.okpi === value) {                                                                //okpi change
                operationalKPIsList.splice(indexfordelete, 1)
            }
            return true
        })

        this.setState({
            operationalKPIs: operationalKPIs
        })
    }

    onNewKPI(e) {
        const { customVDTStore } = this.props;
        const { operationalKPIsList } = customVDTStore;
        let { kpiDetails, operationalKPIs } = this.state;
        let { kpiIndex } = this.state;
        let showModal = true;
        let kpiNew = {
            avgBenchmark: '',
            baseline: '',
            bicBenchmark: '',
            bottomPerfBenchmark: '',
            calculationType: '',
            kpiTrend: '',
            opKpi: '',
            opKpiDesc: '',
            opKpiFormula: '',
            opKpiUnit: '',
            target: '',
            okpiType: '',
            targetAchieved: '',
            kpi_id: null,
        }
        kpiDetails = kpiNew;

        this.setState({
            kpiDetails: kpiNew
        })

        kpiDetails.opKpi = e.target.value

        for (let i = 0; i < operationalKPIsList.length; i++) {
            if (operationalKPIsList[i].okpi === e.target.value) {                   //okpi change
                showModal = false
            }
        }
        if (e.target.value === "") {
            showModal = false
        }

        //Added this to use the existing VisualVDTTable componet for displaying fields in Custom VDT
        if (showModal) {
            this.setState({
                displayKPIModal: true,
                disableKPI: false
            })
            let kpiData = false
            for (let i = 0; i <= operationalKPIs.length; i++) {
                if (i === Number(e.target.id)) {
                    kpiNew.opKpi = e.target.value
                    kpiDetails.index = i
                    if (operationalKPIs[i].value.opKpiUnit === undefined || operationalKPIs[i].value.opKpiUnit === "") {
                        operationalKPIs[i].value = kpiDetails
                    } else {
                        operationalKPIs[i].value.opKpi = e.target.value;
                        kpiData = operationalKPIs[i].value
                    }
                    kpiIndex = i
                    if (operationalKPIs[e.target.dataset.index].isLabel === true) {
                        operationalKPIs[e.target.dataset.index].isLabel = false
                    } else {
                        operationalKPIs[e.target.dataset.index].isLabel = true
                    }
                }
            }

            this.setState({
                kpiIndex: kpiIndex,
                kpiDetails: kpiData ? kpiData : kpiNew
            })
        } else {
            this.setState({
                disableKPI: false
            })
        }
        this.setState({
            operationalKPIs: operationalKPIs
        })

    }


    modalCloseHandler() {
        this.setState({
            displayKPIModal: false
        })
    }

    showList(input) {
        var datalist = document.querySelector("datalist");
        if (input.value.length === 1) {
            datalist.id = "";
        } else {
            datalist.id = "show-list";
        }
    }

    updateTheSelectedStates(classesObj, fromFun, sourceObjIndex) {
        switch (classesObj.objectiveType) {
            case 'financial_identifier':
                this.updateFObj(classesObj, fromFun, sourceObjIndex);
                break;
            case 'business_identifier':
                this.updateBObj(classesObj, fromFun, sourceObjIndex);
                break;
            case 'value_driver_identifier':
                this.updateVDObj(classesObj, fromFun, sourceObjIndex);
                break;
            case 'operational_identifier':
                this.updateOpeKpis(classesObj, fromFun, sourceObjIndex);
                break;
            default:
                break;
        }
    }

    updateFObj = (classesObj, fromFun, sourceObjIndex) => {
        let { financialObjectives, strategicObjectives } = this.state;
        financialObjectives.map((obj, index) => {
            if (index === Number(classesObj.checkBoxIndex)) {
                obj.checked = classesObj.checked;
                obj.parentObj = classesObj.sourceClass;
                obj.parentObjIndex = classesObj.sourceObjectiveIndex;
            }
            return true
        });

        // below code is used for updating the childIndexes of parent objective
        if (fromFun === 'update' && classesObj.checked) {
            strategicObjectives[sourceObjIndex].childIndexes.push(Number(classesObj.checkBoxIndex));
        } else if (fromFun === 'update' && !classesObj.checked) {
            let strChildArr = strategicObjectives[sourceObjIndex].childIndexes;
            strategicObjectives[sourceObjIndex].childIndexes = strChildArr.filter(item => {
                return item !== Number(classesObj.checkBoxIndex);
            });
        }

        this.setState({
            financialObjectives: financialObjectives,
            strategicObjectives: strategicObjectives
        })
    }

    updateBObj = (classesObj, fromFun, sourceObjIndex) => {
        let { businessObjectives, financialObjectives } = this.state;
        businessObjectives.map((obj, index) => {
            if (index === Number(classesObj.checkBoxIndex)) {
                obj.checked = classesObj.checked;
                obj.parentObj = classesObj.sourceClass;
                obj.parentObjIndex = classesObj.sourceObjectiveIndex;
            }
            return true
        });

        // below code is used for updating the childIndexes of parent objective
        if (fromFun === 'update' && classesObj.checked) {
            financialObjectives[sourceObjIndex].childIndexes.push(Number(classesObj.checkBoxIndex));
        } else if (fromFun === 'update' && !classesObj.checked) {
            let finChildArr = financialObjectives[sourceObjIndex].childIndexes;
            financialObjectives[sourceObjIndex].childIndexes = finChildArr.filter(item => {
                return item !== Number(classesObj.checkBoxIndex);
            });
        }

        this.setState({
            businessObjectives: businessObjectives,
            financialObjectives: financialObjectives
        })
    }

    updateVDObj = (classesObj, fromFun, sourceObjIndex) => {
        let { valueDrivers, businessObjectives } = this.state;
        valueDrivers.map((obj, index) => {
            if (index === Number(classesObj.checkBoxIndex)) {
                obj.checked = classesObj.checked;
                obj.parentObj = classesObj.sourceClass;
                obj.parentObjIndex = classesObj.sourceObjectiveIndex;
            }
            return true
        });

        // below code is used for updating the childIndexes of parent objective
        if (fromFun === 'update' && classesObj.checked) {
            businessObjectives[sourceObjIndex].childIndexes.push(Number(classesObj.checkBoxIndex));
        } else if (fromFun === 'update' && !classesObj.checked) {
            let busChildArr = businessObjectives[sourceObjIndex].childIndexes;
            businessObjectives[sourceObjIndex].childIndexes = busChildArr.filter(item => {
                return item !== Number(classesObj.checkBoxIndex);
            });
        }

        this.setState({
            valueDrivers: valueDrivers,
            businessObjectives: businessObjectives
        })
    }

    updateOpeKpis = (classesObj, fromFun, sourceObjIndex) => {
        let { operationalKPIs, valueDrivers } = this.state;
        operationalKPIs.map((obj, index) => {
            if (index === Number(classesObj.checkBoxIndex)) {
                obj.checked = classesObj.checked;
                obj.parentObj = classesObj.sourceClass;
                obj.parentObjIndex = classesObj.sourceObjectiveIndex;
            }
            return true
        });

        // below code is used for updating the childIndexes of parent objective
        if (fromFun === 'update' && classesObj.checked) {
            valueDrivers[sourceObjIndex].childIndexes.push(Number(classesObj.checkBoxIndex));
        } else if (fromFun === 'update' && !classesObj.checked) {
            let vdChildArr = valueDrivers[sourceObjIndex].childIndexes;
            valueDrivers[sourceObjIndex].childIndexes = vdChildArr.filter(item => {
                return item !== Number(classesObj.checkBoxIndex);
            });
        }
        if (classesObj.sourceObjectiveIndex !== '') {
            valueDrivers[classesObj.sourceObjectiveIndex].childIndexes.push(classesObj.checkBoxIndex);
        }

        this.setState({
            operationalKPIs: operationalKPIs,
            valueDrivers: valueDrivers
        })
    }

    buildALine = (classesObj) => {
        let { totalSelectedLinesArray } = this.state;
        let mutatedArray = [...totalSelectedLinesArray];
        let sourceObjIndex = '';
        sourceObjIndex = classesObj.sourceObjectiveIndex;
        if (classesObj.checked) {
            mutatedArray.push(classesObj);
        } else if (totalSelectedLinesArray.length > 0 && !classesObj.checked) {
            mutatedArray = mutatedArray.filter((item) => {
                return (item.destClass !== classesObj.destClass);
            })
            // classesObj.parentObj = '';
            // classesObj.parentObjIndex = '';
            classesObj.sourceClass = '';
            classesObj.sourceObjectiveIndex = '';
        }
        this.setState({
            totalSelectedLinesArray: [...mutatedArray]
        });
        this.updateTheSelectedStates(classesObj, 'update', sourceObjIndex);
    }

    updateTotalLinesArray = (sourceObjClass) => {
        let { totalSelectedLinesArray } = this.state;
        let mutatedArray = [...totalSelectedLinesArray];

        if (mutatedArray.length > 0) {
            mutatedArray = mutatedArray.filter((item) => {
                return (item.sourceClass !== sourceObjClass);
            });
            mutatedArray = mutatedArray.filter((item) => {
                return (item.destClass !== sourceObjClass);
            });
            this.setState({
                totalSelectedLinesArray: [...mutatedArray]
            }, () => {
                console.log('');
            });
        }
    }


    deleteObjective = (objType, objIndex, childObjs) => {
        const sourceObjClass = objType + objIndex;
        let childObjsArray = [...childObjs];

        // below array is to make all child objectives free from this parent objective
        if (childObjsArray.length > 0) {
            childObjsArray.map((childObj, childObjIndex) => {
                if (childObj && childObj.parentObjIndex === objIndex) {
                    const destinationObjClass = childObj.objType + childObjIndex;
                    const tempObj = {
                        'sourceClass': '',
                        'destClass': destinationObjClass,
                        'checked': !childObj.checked,
                        'checkBoxIndex': childObj.index,
                        'objectiveType': childObj.objType,
                        'sourceObjectiveIndex': '',
                        'destObjectiveValue': childObj.value
                    }
                    // this.buildALine(tempObj);
                    this.updateTheSelectedStates(tempObj, 'delete', '');
                }
                return true
            });
        }
        switch (objType) {
            case 'strategic_identifier':
                this.deleteFromSO(objIndex, sourceObjClass);
                break;
            case 'financial_identifier':
                this.deleteFromFO(objIndex, sourceObjClass);
                break;
            case 'business_identifier':
                this.deleteFromBO(objIndex, sourceObjClass);
                break;
            case 'value_driver_identifier':
                this.deleteFromVDO(objIndex, sourceObjClass);
                break;
            case 'operational_identifier':
                this.deleteFromOPK(objIndex, sourceObjClass);
                break;
            default:
                break;
        }
        this.setState({
            displayKPIModal: false
        })
    }

    editObjective = (event, objType, objIndex, childObjsent) => {
        const sourceObjClass = objType + objIndex;
        switch (objType) {
            case 'strategic_identifier':
                this.editFromSO(objIndex, sourceObjClass);
                break;
            case 'financial_identifier':
                this.editFromFO(objIndex, sourceObjClass);
                break;
            case 'business_identifier':
                this.editFromBO(objIndex, sourceObjClass);
                break;
            case 'value_driver_identifier':
                this.editFromVDO(objIndex, sourceObjClass);
                break;
            case 'operational_identifier':
                this.editFromOKPI(event, objIndex, sourceObjClass);
                break;
            default:
                break;
        }
    }

    editFromVDO = (objIndex, sourceObjClass) => {
        let { valueDrivers } = this.state;
        let vd = valueDrivers;
        if (vd[objIndex].isLabel === false) {
            vd[objIndex].isLabel = true
        } else {
            vd[objIndex].isLabel = false
        }
        this.setState({
            valueDrivers: vd
        });
    }

    editFromSO = (objIndex, sourceObjClass) => {
        let { strategicObjectives } = this.state;
        let so = strategicObjectives;
        if (so[objIndex].isLabel === false) {
            so[objIndex].isLabel = true
        } else {
            so[objIndex].isLabel = false
        }
        this.setState({
            strategicObjectives: so
        });
    }

    editFromFO = (objIndex, sourceObjClass) => {
        let { financialObjectives } = this.state;
        let fo = financialObjectives;
        if (fo[objIndex].isLabel === false) {
            fo[objIndex].isLabel = true
        } else {
            fo[objIndex].isLabel = false
        }
        this.setState({
            financialObjectives: fo
        });
    }

    editFromBO = (objIndex, sourceObjClass) => {
        let { businessObjectives } = this.state;
        let bo = businessObjectives;
        if (bo[objIndex].isLabel === false) {
            bo[objIndex].isLabel = true
        } else {
            bo[objIndex].isLabel = false
        }
        this.setState({
            businessObjectives: bo
        });
    }

    editFromOKPI = (e, objIndex, sourceObjClass) => {
        let { operationalKPIs } = this.state;
        let kpiDetails = false
        let kpiIndex
        for (let i = 0; i < operationalKPIs.length; i++) {
            if (i === Number(objIndex)) {
                // if (operationalKPIs[i].isLabel === true) {
                //     operationalKPIs[i].isLabel = false
                // } else {
                operationalKPIs[i].isLabel = true
                // }
                kpiDetails = operationalKPIs[i].value
                kpiIndex = i
            }

        }
        if (kpiDetails === "") {
            let kpiNew = {
                avgBenchmark: '',
                baseline: '',
                bicBenchmark: '',
                bottomPerfBenchmark: '',
                calculationType: '',
                kpiTrend: '',
                opKpi: '',
                opKpiDesc: '',
                opKpiFormula: '',
                opKpiUnit: '',
                target: '',
                okpiType: '',
                targetAchieved: '',
                kpi_id: null,
            }
            kpiDetails = kpiNew;
            operationalKPIs[objIndex].value = kpiDetails
        }

        this.setState({
            kpiDetails: kpiDetails,
            kpiIndex: kpiIndex,
            displayKPIModal: true,
            operationalKPIs: operationalKPIs
        })
    }


    deleteFromSO = (index, sourceObjClass) => {
        let { strategicObjectives, strategicObjectivesList } = this.state;
        strategicObjectivesList[strategicObjectivesList.length] = strategicObjectives[index].value
        strategicObjectives = [];

        this.setState({
            strategicObjectives: strategicObjectives,
            displayCustomVDTTree: true
        }, () => {
            this.updateTotalLinesArray(sourceObjClass);
        });
    }

    deleteFromFO = (index, sourceObjClass) => {
        let { financialObjectives, financialObjectivesList, strategicObjectives } = this.state;
        financialObjectivesList[financialObjectivesList.length] = financialObjectives[index].value;

        // below code is to remove entry from childIndexes array of its parent objective
        let finObj = financialObjectives[index];
        if (finObj.parentObjIndex !== '') {
            if (strategicObjectives && strategicObjectives[finObj.parentObjIndex]) {
                let strObjChildArr = strategicObjectives[finObj.parentObjIndex].childIndexes;
                strategicObjectives[finObj.parentObjIndex].childIndexes = strObjChildArr.filter(item => {
                    return item !== Number(index)
                })
            }
        }

        delete financialObjectives[index];
        this.setState({
            financialObjectives: financialObjectives,
            displayCustomVDTTree: true,
            strategicObjectives: strategicObjectives
        }, () => {
            this.updateTotalLinesArray(sourceObjClass);
        })

    }

    deleteFromBO = (index, sourceObjClass) => {
        let { businessObjectives, businessObjectivesList, financialObjectives } = this.state;
        businessObjectivesList[businessObjectivesList.length] = businessObjectives[index].value;

        // below code is to remove entry from childIndexes array of its parent objective
        let boObj = businessObjectives[index];
        if (boObj.parentObjIndex !== '') {
            if (financialObjectives && financialObjectives[boObj.parentObjIndex]) {
                let finObjChildArr = financialObjectives[boObj.parentObjIndex].childIndexes;
                financialObjectives[boObj.parentObjIndex].childIndexes = finObjChildArr.filter(item => {
                    return item !== Number(index)
                })
            }
        }

        delete businessObjectives[index];
        this.setState({
            businessObjectives: businessObjectives,
            financialObjectives: financialObjectives,
            displayCustomVDTTree: true
        }, () => {
            this.updateTotalLinesArray(sourceObjClass);
        })

    }

    deleteFromVDO = (index, sourceObjClass) => {
        let { valueDrivers, valueDriversList, businessObjectives } = this.state;
        valueDriversList[valueDriversList.length] = valueDrivers[index].value
        // valueDriversList.push(valueDrivers[index].value])

        // below code is to remove entry from childIndexes array of its parent objective
        let vdObj = valueDrivers[index];
        if (vdObj.parentObjIndex !== '') {
            if (businessObjectives && businessObjectives[vdObj.parentObjIndex]) {
                let boObjChildArr = businessObjectives[vdObj.parentObjIndex].childIndexes;
                businessObjectives[vdObj.parentObjIndex].childIndexes = boObjChildArr.filter(item => {
                    return item !== Number(index)
                })
            }
        }

        delete valueDrivers[index];
        this.setState({
            valueDrivers: valueDrivers,
            businessObjectives: businessObjectives,
            displayCustomVDTTree: true
        }, () => {
            this.updateTotalLinesArray(sourceObjClass);
        })


    }

    isDefined = (value) => {
        return value !== undefined && value !== null;
    }

    deleteFromOPK = (index, sourceObjClass) => {
        let { operationalKPIs, deletedKpiList, operationalKPIsList, valueDrivers } = this.state;
        let kpi
        if (operationalKPIs[index].value.kpi_id !== null) {
            kpi = {
                'okpi': operationalKPIs[index].value.opKpi,
                'kpi_id': operationalKPIs[index].value.kpi_id
            }
            operationalKPIsList[operationalKPIsList.length] = kpi;
        }

        let tempOpkpis = [...operationalKPIs];
        const delKpiId = tempOpkpis[index]['value']['kpi_id'];
        if (this.isDefined(delKpiId)) {
            const { editVDTStore } = this.props;
            const { selectedKPIIds } = editVDTStore;
            let savedKpiIdArray = [...selectedKPIIds];
            savedKpiIdArray.map((id) => {
                if (delKpiId === id) {
                    deletedKpiList.push(delKpiId)
                }
                return true
            });
        }

        //  deleting the kpi entry from its parent obj - child indexes
        let tempKpiObj = operationalKPIs[index];
        if (tempKpiObj.parentObjIndex !== '') {
            if (valueDrivers && valueDrivers[tempKpiObj.parentObjIndex]) {
                let valObjChildArr = valueDrivers[tempKpiObj.parentObjIndex].childIndexes;
                valueDrivers[tempKpiObj.parentObjIndex].childIndexes = valObjChildArr.filter(item => {
                    return item !== Number(index)
                })
            }
        }

        tempOpkpis.splice(index, 1);
        tempOpkpis.map((kpi) => {
            if (Number(kpi.index) > Number(index)) {
                const newIndex = Number(kpi.index) - 1;
                kpi.index = newIndex;
            }
            return true
        })

        this.setState({
            operationalKPIs: tempOpkpis,
            valueDrivers: valueDrivers,
            displayCustomVDTTree: true
        }, () => {
            this.updateTotalLinesArrayForOKPI(index, sourceObjClass);
        })

    }

    updateTotalLinesArrayForOKPI = (index, sourceObjClass) => {
        let { totalSelectedLinesArray } = this.state;
        let mutatedArray = [...totalSelectedLinesArray];
        if (mutatedArray.length > 0) {
            mutatedArray = mutatedArray.filter((item) => {
                return (item.sourceClass !== sourceObjClass);
            });
            mutatedArray = mutatedArray.filter((item) => {
                return (item.destClass !== sourceObjClass);
            });

            //    let matchedArray = mutatedArray.filter((line, lineIndex) => {
            //         return line.objectiveType === 'operational_identifier';
            //     });

            mutatedArray.map((line) => {
                if (line.objectiveType === 'operational_identifier' && Number(line.checkBoxIndex) > Number(index)) {
                    const newIndex = Number(line.checkBoxIndex) - 1;
                    line.destClass = 'operational_identifier' + newIndex;
                    line.checkBoxIndex = newIndex;
                }
                return true
            })

            this.setState({
                totalSelectedLinesArray: [...mutatedArray]
            }, () => {
                console.log('');
            });
        }
    }


    saveCustomVDT = () => {
        const { strategicObjectives, financialObjectives, businessObjectives, valueDrivers, operationalKPIs,
            totalSelectedLinesArray } = this.state;
        const objArray = [strategicObjectives, financialObjectives, businessObjectives, valueDrivers, operationalKPIs];
        const { customVDTStore, editVDTFlag } = this.props;
        customVDTStore.isCustomVDTStarted = true;
        let objectiveCount = 0
        for (let i = 0; i < objArray.length; i++) {
            const realSize = objArray[i].filter(function (value) { return value !== undefined }).length;
            objectiveCount += realSize;
        }
        const initialArray = [...totalSelectedLinesArray];
        const kpiDetailsArray = [];
        const objCnt = objectiveCount - 1
        initialArray.map((line) => {
            if (line.objectiveType === 'operational_identifier') {
                const kpiValue = operationalKPIs[line.checkBoxIndex].name;
                const valueDriverValue = valueDrivers[line.sourceObjectiveIndex].value;
                if (valueDrivers[line.sourceObjectiveIndex].parentObjIndex !== '') {
                    const businessObjValue = businessObjectives[valueDrivers[line.sourceObjectiveIndex].parentObjIndex].value;
                    if (businessObjectives[valueDrivers[line.sourceObjectiveIndex].parentObjIndex].parentObjIndex !== '') {
                        const financialObjValue = financialObjectives[businessObjectives[valueDrivers[line.sourceObjectiveIndex].parentObjIndex].parentObjIndex].value;
                        if (financialObjectives[businessObjectives[valueDrivers[line.sourceObjectiveIndex].parentObjIndex].parentObjIndex].parentObjIndex !== '') {
                            const startegicObjValue = strategicObjectives[financialObjectives[businessObjectives[valueDrivers[line.sourceObjectiveIndex].parentObjIndex].parentObjIndex].parentObjIndex].value;

                            if (line.destObjectiveValue.kpi_id !== undefined && line.destObjectiveValue.kpi_id !== null) {
                                if (typeof line.destObjectiveValue.kpi_id !== "string") {
                                    line.destObjectiveValue.kpi_id = line.destObjectiveValue.kpi_id.toString()
                                }
                            }

                            kpiDetailsArray.push({
                                "strategicObjective": startegicObjValue.trim(),
                                "financialObjective": financialObjValue.trim(),
                                "businessObjective": businessObjValue.trim(),
                                "valueDriver": valueDriverValue.trim(),
                                "opKpi": kpiValue.trim(),
                                "baseline": line.destObjectiveValue.baseline.actualValue,
                                "bicBenchmark": line.destObjectiveValue.bicBenchmark.actualValue,
                                "avgBenchmark": line.destObjectiveValue.avgBenchmark.actualValue,
                                "target": line.destObjectiveValue.target.actualValue,
                                "targetAchieved": line.destObjectiveValue.targetAchieved,
                                "kpiFrequency": null,
                                "calculationType": line.destObjectiveValue.calculationType,
                                "kpiType": line.destObjectiveValue.okpiType,
                                "opKpiFormula": line.destObjectiveValue.opKpiFormula.trim(),
                                "opKpiDesc": line.destObjectiveValue.opKpiDesc.trim(),
                                "opKpiUnit": line.destObjectiveValue.opKpiUnit,
                                "mapId": (line.destObjectiveValue.map_id ? line.destObjectiveValue.map_id : null),
                                "bottomPerfBenchmark": line.destObjectiveValue.bottomPerfBenchmark,
                                "kpiTrend": line.destObjectiveValue.kpiTrend,
                                "kpiId": editVDTFlag ? (line.destObjectiveValue.kpi_id === null || line.destObjectiveValue.kpi_id === 0 ? null : (line.destObjectiveValue.kpi_id.includes("Kpi_") ? null : line.destObjectiveValue.kpi_id)) : null,
                                "order": Number(operationalKPIs[line.checkBoxIndex].index) + 1,
                                "enabledBenchmark": line.destObjectiveValue.enabledBenchmark,
                                "avgBenchmarkSource": line.destObjectiveValue.avgBenchmarkSource,
                                "bicBenchmarkSource": line.destObjectiveValue.bicBenchmarkSource
                            });
                        }
                    }
                }
            }
            return true
        });
        this.setState({
            isloading: true
        })
        let isErrDisplay = false
        for (let i = 0; i < operationalKPIs.length; i++) {
            if (operationalKPIs[i].value && operationalKPIs[i].value !== '') {
                if (((operationalKPIs[i].value.baseline.actualValue) === null || (operationalKPIs[i].value.baseline.actualValue) === "") ||
                    ((operationalKPIs[i].value.target.actualValue) === null || (operationalKPIs[i].value.target.actualValue) === "") || (operationalKPIs[i].value.target) === "" ||
                    (operationalKPIs[i].value.targetAchieved === null || operationalKPIs[i].value.targetAchieved === "Select Year" || operationalKPIs[i].value.targetAchieved === "")) {
                    isErrDisplay = true
                    operationalKPIs[i].color = 'red'
                    this.setState({
                        displayCustomVDTTree: true
                    })
                }
                else {
                    operationalKPIs[i].color = operationalKPIs[i].value.okpiType === 'NON_FINANCIAL' ? 'grey' : 'blue';
                    this.setState({
                        displayCustomVDTTree: true
                    })
                }
            }

        }

        for (let i = 0; i < objArray.length; i++) {
            const realSize = objArray[i].filter(function (value) { return value !== undefined }).length;

            if (realSize === 0) {
                this.showErrorNotification("Please add missing node.", 'Error', "error")
                this.setState({
                    isloading: false
                })
                return;
            }
        }

        if (kpiDetailsArray.length > 0 && (objCnt === initialArray.length)) {
            const linksError = this.checkForAllLinkedNodes();
            if (linksError) {
                this.showErrorNotification("Please link all nodes", "Error", "error")
                this.setState({
                    isloading: false
                })
                return;
            } else {
                this.postCustomVDT(kpiDetailsArray, isErrDisplay);
            }

        } else {
            this.showErrorNotification("Please link all nodes", "Error", "error")
            this.setState({
                isloading: false
            })
            return;
        }

    }

    checkForAllLinkedNodes() {
        const { strategicObjectives, financialObjectives, businessObjectives, valueDrivers } = this.state;
        const objectivesArray = [...strategicObjectives, ...financialObjectives, ...businessObjectives, ...valueDrivers];
        for (let i = 0; i < objectivesArray.length; i++) {
            let eachObj = objectivesArray[i];
            if (eachObj && eachObj.childIndexes.length === 0) {
                return true;
            }
        }
        return false;
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
        if (type === 'KPIerror') {
            toast.error(<NotificationMessage
                title={title}
                bodytext={message}
                icon={type}
            />, {
                position: toast.POSITION.BOTTOM_RIGHT
            });
        }
    }

    postCustomVDT = (kpiDetailsArray, isErrorDisplay) => {
        const { deletedKpiList } = this.state;
        const payload = {
            "mapId": SessionStorage.read('mapId'),
            "deleteKpis": [...deletedKpiList],
            "kpiDetails": [...kpiDetailsArray]
        };
        let error = 0;
        for (let i = 0; i < kpiDetailsArray.length; i++) {
            if (!RegExp(/[<>!'"[\]]/).test(kpiDetailsArray[i].financialObjective) &&
                !RegExp(/[<>!'"[\]]/).test(kpiDetailsArray[i].businessObjective) &&
                !RegExp(/[<>!'"[\]]/).test(kpiDetailsArray[i].strategicObjective) &&
                !RegExp(/[<>!'"[\]]/).test(kpiDetailsArray[i].opKpi) && kpiDetailsArray[i].opKpi !== '' &&
                !RegExp(/[<>!'"[\]]/).test(kpiDetailsArray[i].valueDriver)) {
                error = 0;
            }
            else {
                error = error + 1;
            }
        }

        if (error === 0) {
            const { customVDTStore } = this.props;
            customVDTStore.saveCustomVDT(payload)
                .then((response) => {
                    if (!response.error && response.data.resultCode === 'OK') {
                        this.showErrorNotification("Custom VDT saved successfully", "Success", "success");
                        if (this.props.editVDTFlag) {
                            // this.props.getKpiData() 
                            this.generateVDT()
                            this.setState({
                                isloading: false
                            })
                        }
                        else {
                            if (this.props.isSave) {
                                // this.props.getKpiData()
                                this.generateVDT()
                                this.setState({
                                    isloading: false
                                })
                            }
                            else {
                                // window.location.reload();
                                this.props.CustomVDTAfterSave();
                                this.props.getKpiData();
                            }
                        }

                        // }
                    } else if (!response.error && response.data.resultCode === 'KO') {
                        let errMsg = (response.data.resultDescription !== null) ? response.data.resultDescription.replace(/[0-9]/g, '') : response.data.errorDescription;
                        this.showErrorNotification(errMsg, "Error", "error")
                        this.setState({
                            isloading: false
                        })
                    } else {
                        this.showErrorNotification("Sorry! Something went wrong", "Error", "error")
                        this.setState({
                            isloading: false
                        })
                    }
                })
        }
        else {
            this.showErrorNotification("Please enter valid values for nodes. Special characters [ < ! ' \" > ] are invalid", "Error", "error")
            this.setState({
                isloading: false
            })
        }
    }


    newStrategicObj = (event) => {
        let { strategicObjectives } = this.state;
        let so = strategicObjectives;
        so[event.target.dataset.index].value = event.target.value;
        so[event.target.dataset.index].isLabel = true
        this.setState({
            strategicObjectives: so,
            displayCustomVDTTree: true
        })
    }

    newFinancialObj = (event) => {
        let { financialObjectives } = this.state;
        let fo = financialObjectives;
        fo[event.target.dataset.index].value = event.target.value;
        fo[event.target.dataset.index].isLabel = true
        this.setState({
            financialObjectives: fo,
            displayCustomVDTTree: true
        })
    }

    newBusinessObj = (event) => {
        let { businessObjectives } = this.state;
        let bo = businessObjectives;
        bo[event.target.dataset.index].value = event.target.value;
        bo[event.target.dataset.index].isLabel = true
        this.setState({
            businessObjectives: bo,
            displayCustomVDTTree: true
        })
    }

    newVDO = (event) => {
        let { valueDrivers } = this.state;
        let vd = valueDrivers;
        vd[event.target.dataset.index].value = event.target.value;
        vd[event.target.dataset.index].isLabel = true
        this.setState({
            valueDrivers: vd,
            displayCustomVDTTree: true
        })
    }

    handleKPIStart = (index) => {
        this.setState({
            sourceIndex: index,
        })
        return true;
    }
    handleVDStart = (index) => {
        this.setState({
            sourceIndex: index,
        })
        return true;
    }
    handleBoStart = (index) => {
        this.setState({
            sourceIndex: index,
        })
        return true;
    }
    handleFoStart = (index) => {
        this.setState({
            sourceIndex: index,
        })
        return true;
    }

    validateLinks = () => {
        let error = false
        const { financialObjectives, businessObjectives, valueDrivers, operationalKPIs } = this.state;
        const objArray = [financialObjectives, businessObjectives, valueDrivers, operationalKPIs];
        for (let i = 0; i < objArray.length; i++) {
            const realSize = objArray[i].filter(function (value) { return value.parentObj === "" }).length;
            if (realSize !== 0) {
                error = true
            }
        }
        const linksError = this.checkForAllLinkedNodes();
        if (error === true || linksError === true) {
            this.setState({
                dragError: true
            })
            this.showErrorNotification("Please link all the nodes before dragging", 'Error', "error")
            // return true;
        }
        else {
            this.setState({
                dragError: false
            })
        }
    }
    validateEmptyNodes() {
        let { strategicObjectives, financialObjectives, businessObjectives, valueDrivers, operationalKPIs } = this.state;
        let emptyCount = 0;
        strategicObjectives.map((sObj) => {
            emptyCount = (sObj.value === "" ? (emptyCount + 1) : emptyCount)
            return true
        })
        financialObjectives.map((fObj) => {
            emptyCount = (fObj.value === "" ? (emptyCount + 1) : emptyCount)
            return true
        })
        businessObjectives.map((bObj) => {
            emptyCount = (bObj.value === "" ? (emptyCount + 1) : emptyCount)
            return true
        })
        valueDrivers.map((vObj) => {
            emptyCount = (vObj.value === "" ? (emptyCount + 1) : emptyCount)
            return true
        })
        operationalKPIs.map((kpiObj) => {
            emptyCount = (kpiObj.value === "" ? (emptyCount + 1) : emptyCount)
            return true
        })
        if (emptyCount === 0) {
            return true;
        }
        else {
            return false;
        }
    }
    buildRequestTree() {
        let { customVDTStore, editVDTFlag } = this.props
        let { totalSelectedLinesArray, strategicObjectives, financialObjectives, businessObjectives, valueDrivers } = this.state
        const initialArray = [...totalSelectedLinesArray];
        const kpiDetailsArray = [];
        let isNodesValid = this.validateEmptyNodes()
        if (isNodesValid) {
            initialArray.map((line) => {
                if (line.objectiveType === 'operational_identifier') {
                    const kpiValue = customVDTStore.operationalKPIs[line.checkBoxIndex].name;
                    const valueDriverValue = valueDrivers[line.sourceObjectiveIndex].value;
                    if (valueDrivers[line.sourceObjectiveIndex].parentObjIndex !== '') {
                        const businessObjValue = businessObjectives[valueDrivers[line.sourceObjectiveIndex].parentObjIndex].value;
                        if (businessObjectives[valueDrivers[line.sourceObjectiveIndex].parentObjIndex].parentObjIndex !== '') {
                            const financialObjValue = financialObjectives[businessObjectives[valueDrivers[line.sourceObjectiveIndex].parentObjIndex].parentObjIndex].value;
                            if (financialObjectives[businessObjectives[valueDrivers[line.sourceObjectiveIndex].parentObjIndex].parentObjIndex].parentObjIndex !== '') {
                                const startegicObjValue = strategicObjectives[financialObjectives[businessObjectives[valueDrivers[line.sourceObjectiveIndex].parentObjIndex].parentObjIndex].parentObjIndex].value;

                                if (line.destObjectiveValue.kpi_id !== undefined && line.destObjectiveValue.kpi_id !== null) {
                                    if (typeof line.destObjectiveValue.kpi_id !== "string") {
                                        line.destObjectiveValue.kpi_id = line.destObjectiveValue.kpi_id.toString()
                                    }
                                }
                                kpiDetailsArray.push({
                                    "strategicObjective": startegicObjValue,
                                    "financialObjective": financialObjValue,
                                    "businessObjective": businessObjValue,
                                    "valueDriver": valueDriverValue,
                                    "opKpi": kpiValue,
                                    "baseline": line.destObjectiveValue.baseline.actualValue,
                                    "bicBenchmark": line.destObjectiveValue.bicBenchmark.actualValue,
                                    "avgBenchmark": line.destObjectiveValue.avgBenchmark.actualValue,
                                    "target": line.destObjectiveValue.target.actualValue,
                                    "targetAchieved": line.destObjectiveValue.targetAchieved,
                                    "kpiFrequency": null,
                                    "kpiType": line.destObjectiveValue.okpiType,
                                    "calculationType": line.destObjectiveValue.calculationType,
                                    "opKpiFormula": line.destObjectiveValue.opKpiFormula,
                                    "opKpiDesc": line.destObjectiveValue.opKpiDesc,
                                    "opKpiUnit": line.destObjectiveValue.opKpiUnit,
                                    "bottomPerfBenchmark": line.destObjectiveValue.bottomPerfBenchmark,
                                    "kpiTrend": line.destObjectiveValue.kpiTrend,
                                    // "kpiId": line.destObjectiveValue.kpi_id === null || line.destObjectiveValue.kpi_id === 0 ? null : line.destObjectiveValue.kpi_id,
                                    "kpiId": editVDTFlag ? (line.destObjectiveValue.kpi_id === null || line.destObjectiveValue.kpi_id === 0 ? null : (line.destObjectiveValue.kpi_id.includes("Kpi_") ? null : line.destObjectiveValue.kpi_id)) : null,
                                    "order": customVDTStore.operationalKPIs[line.checkBoxIndex].orderId + 1,
                                    "enabledBenchmark": line.destObjectiveValue.enabledBenchmark,
                                    "avgBenchmarkSource": line.destObjectiveValue.avgBenchmarkSource,
                                    "bicBenchmarkSource": line.destObjectiveValue.bicBenchmarkSource
                                });
                            }
                        }
                    }
                }
                return true
            });

            const payload = {
                "mapId": SessionStorage.read('map_id'),
                "deleteKpis": [],
                "kpiDetails": kpiDetailsArray
            }
            customVDTStore.generateCustomVDTTree(payload)
                .then((res) => {
                    if (res.error) {
                        return {
                            error: true
                        }
                    } else {
                        if (res && res.data.resultCode === 'OK') {
                            customVDTStore.createTree(res.data.resultObj)
                            this.loadCustomVDTTreeAfterDrag()
                        } else if (res && res.data.resultCode === 'KO') {
                            this.showErrorNotification(res.data.errorDescription, 'Error', 'error');
                        }
                    }
                })
        }
        else {
            this.showErrorNotification("Please fill all the nodes before dragging", 'Error', "error")
        }

    }
    handleVDStop = (index) => {
        let { customVDTStore } = this.props
        let { operationalKPIs, sourceIndex, valueDrivers } = this.state
        customVDTStore.operationalKPIs = operationalKPIs
        let tempOpkpis = [...operationalKPIs];
        let resultOkpiList = []
        customVDTStore.valueDrivers = valueDrivers
        let tempVDList = [...valueDrivers];
        let tempvd = valueDrivers[sourceIndex]
        tempVDList.splice(sourceIndex, 1);
        tempvd.index = Number(index)
        tempVDList.splice(index, 0, tempvd)
        for (let i = 0; i < tempVDList.length; i++) {
            if (tempVDList[i] !== undefined) {
                tempVDList[i].index = i
            }
        }
        for (let i = 0; i < customVDTStore.valueDrivers.length; i++) {
            for (let j = 0; j < tempVDList.length; j++) {
                if (customVDTStore.valueDrivers[i] !== undefined && tempVDList[j] !== undefined) {
                    if (customVDTStore.valueDrivers[i].value === tempVDList[j].value) {
                        tempVDList[j].originalIndex = i;
                    }
                }
            }
        }
        for (let i = 0; i < tempVDList.length; i++) {
            for (let j = 0; j < tempOpkpis.length; j++) {
                if (tempVDList[i] !== undefined && tempOpkpis[j] !== undefined) {
                    if (tempVDList[i].originalIndex === tempOpkpis[j].parentObjIndex) {
                        resultOkpiList.push(tempOpkpis[j])
                        // tempOpkpis[j].parentObjIndex = i;
                    }
                }
            }

        }
        for (let i = 0; i < customVDTStore.operationalKPIs.length; i++) {
            for (let j = 0; j < resultOkpiList.length; j++) {
                if (customVDTStore.operationalKPIs[i] !== undefined && resultOkpiList[j] !== undefined) {
                    if (customVDTStore.operationalKPIs[i].name === resultOkpiList[j].name) {
                        customVDTStore.operationalKPIs[i].orderId = j;
                    }
                }
            }
        }
        this.buildRequestTree()
    }
    handleFoStop = (index) => {
        let { customVDTStore } = this.props
        let { operationalKPIs, sourceIndex, financialObjectives, businessObjectives, valueDrivers } = this.state
        customVDTStore.operationalKPIs = operationalKPIs
        let tempOpkpis = [...operationalKPIs];
        let resultOkpiList = []
        let resultVDList = []
        let resultBOList = []
        customVDTStore.valueDrivers = valueDrivers
        let tempVDList = [...valueDrivers];
        customVDTStore.businessObjectives = businessObjectives
        let tempBOList = [...businessObjectives];
        // let tempBo = businessObjectives[sourceIndex]
        customVDTStore.financialObjectives = financialObjectives
        let tempFOList = [...financialObjectives];
        let tempFo = financialObjectives[sourceIndex]
        tempFOList.splice(sourceIndex, 1);
        tempFo.index = Number(index)
        tempFOList.splice(index, 0, tempFo)
        for (let i = 0; i < tempFOList.length; i++) {
            if (tempFOList[i] !== undefined) {
                tempFOList[i].index = i
            }
        }
        for (let i = 0; i < customVDTStore.financialObjectives.length; i++) {
            for (let j = 0; j < tempFOList.length; j++) {
                if (tempFOList[j] !== undefined && customVDTStore.financialObjectives[i] !== undefined) {
                    if (customVDTStore.financialObjectives[i].value === tempFOList[j].value) {
                        tempFOList[j].originalIndex = i;
                    }
                }
            }
        }
        for (let i = 0; i < tempFOList.length; i++) {
            for (let j = 0; j < tempBOList.length; j++) {
                if (tempFOList[i] !== undefined && tempBOList[j] !== undefined) {
                    if (tempFOList[i].originalIndex === tempBOList[j].parentObjIndex) {
                        resultBOList.push(tempBOList[j])
                        // tempOpkpis[j].parentObjIndex = i;
                    }
                }
            }

        }
        for (let i = 0; i < resultBOList.length; i++) {
            if (resultBOList[i] !== undefined) {
                resultBOList[i].index = i
            }
        }
        tempBOList = [...resultBOList]
        for (let i = 0; i < customVDTStore.businessObjectives.length; i++) {
            for (let j = 0; j < tempBOList.length; j++) {
                if (customVDTStore.businessObjectives[i] !== undefined && tempBOList[j] !== undefined) {
                    if (customVDTStore.businessObjectives[i].value === tempBOList[j].value) {
                        tempBOList[j].originalIndex = i;
                    }
                }
            }
        }
        for (let i = 0; i < tempBOList.length; i++) {
            for (let j = 0; j < tempVDList.length; j++) {
                if (tempBOList[i] !== undefined && tempVDList[j] !== undefined) {
                    if (tempBOList[i].originalIndex === tempVDList[j].parentObjIndex) {
                        resultVDList.push(tempVDList[j])
                        // tempOpkpis[j].parentObjIndex = i;
                    }
                }
            }

        }

        for (let i = 0; i < resultVDList.length; i++) {
            if (resultVDList[i] !== undefined) {
                resultVDList[i].index = i
            }
        }
        tempVDList = [...resultVDList]                                                                                 //[V2 .i=0 ,V1 .i=1]
        for (let i = 0; i < customVDTStore.valueDrivers.length; i++) {
            for (let j = 0; j < tempVDList.length; j++) {
                if (tempVDList[j] !== undefined && customVDTStore.valueDrivers[i] !== undefined) {
                    if (customVDTStore.valueDrivers[i].value === tempVDList[j].value) {
                        tempVDList[j].originalIndex = i;
                    }
                }
            }
        }
        for (let i = 0; i < tempVDList.length; i++) {
            for (let j = 0; j < tempOpkpis.length; j++) {
                if (tempVDList[i] !== undefined && tempOpkpis[j] !== undefined) {
                    if (tempVDList[i].originalIndex === tempOpkpis[j].parentObjIndex) {
                        resultOkpiList.push(tempOpkpis[j])
                        // tempOpkpis[j].parentObjIndex = i;
                    }
                }
            }

        }
        for (let i = 0; i < customVDTStore.operationalKPIs.length; i++) {
            for (let j = 0; j < resultOkpiList.length; j++) {
                //    if( resultOkpiList[j] !==undefined){
                if (customVDTStore.operationalKPIs[i].name === resultOkpiList[j].name) {
                    customVDTStore.operationalKPIs[i].orderId = j;
                }
                // }
            }
        }

        this.buildRequestTree()
    }
    handleBoStop = (index) => {
        let { customVDTStore } = this.props
        let { operationalKPIs, sourceIndex, businessObjectives, valueDrivers } = this.state
        customVDTStore.operationalKPIs = operationalKPIs
        let tempOpkpis = [...operationalKPIs];
        let resultOkpiList = []
        let resultVDList = []
        customVDTStore.valueDrivers = valueDrivers
        let tempVDList = [...valueDrivers];
        // let tempvd = valueDrivers[sourceIndex]
        customVDTStore.businessObjectives = businessObjectives
        let tempBOList = [...businessObjectives];
        let tempBo = businessObjectives[sourceIndex]
        tempBOList.splice(sourceIndex, 1);
        tempBo.index = Number(index)
        tempBOList.splice(index, 0, tempBo)
        for (let i = 0; i < tempBOList.length; i++) {
            if (tempBOList[i] !== undefined) {
                tempBOList[i].index = i
            }
        }
        for (let i = 0; i < customVDTStore.businessObjectives.length; i++) {
            for (let j = 0; j < tempBOList.length; j++) {
                if (customVDTStore.businessObjectives[i] !== undefined && tempBOList[j] !== undefined) {
                    if (customVDTStore.businessObjectives[i].value === tempBOList[j].value) {
                        tempBOList[j].originalIndex = i;
                    }
                }
            }
        }
        for (let i = 0; i < tempBOList.length; i++) {
            for (let j = 0; j < tempVDList.length; j++) {
                if (tempBOList[i] !== undefined && tempVDList[j] !== undefined) {
                    if (tempBOList[i].originalIndex === tempVDList[j].parentObjIndex) {
                        resultVDList.push(tempVDList[j])
                        // tempOpkpis[j].parentObjIndex = i;
                    }
                }
            }

        }
        for (let i = 0; i < resultVDList.length; i++) {
            if (resultVDList[i] !== undefined) {
                resultVDList[i].index = i
            }
        }
        tempVDList = [...resultVDList]                                                                                 //[V2 .i=0 ,V1 .i=1]
        for (let i = 0; i < customVDTStore.valueDrivers.length; i++) {
            for (let j = 0; j < tempVDList.length; j++) {
                if (customVDTStore.valueDrivers[i] !== undefined && tempVDList[j] !== undefined) {
                    if (customVDTStore.valueDrivers[i].value === tempVDList[j].value) {
                        tempVDList[j].originalIndex = i;
                    }
                }
            }
        }
        for (let i = 0; i < tempVDList.length; i++) {
            for (let j = 0; j < tempOpkpis.length; j++) {
                if (tempVDList[i] !== undefined && tempOpkpis[j] !== undefined) {
                    if (tempVDList[i].originalIndex === tempOpkpis[j].parentObjIndex) {
                        resultOkpiList.push(tempOpkpis[j])
                        // tempOpkpis[j].parentObjIndex = i;
                    }
                }
            }

        }
        for (let i = 0; i < customVDTStore.operationalKPIs.length; i++) {
            for (let j = 0; j < resultOkpiList.length; j++) {
                if (customVDTStore.operationalKPIs[i] !== undefined && resultOkpiList[j] !== undefined) {
                    if (customVDTStore.operationalKPIs[i].name === resultOkpiList[j].name) {
                        customVDTStore.operationalKPIs[i].orderId = j;
                    }
                }
            }
        }

        this.buildRequestTree()
    }

    handleKPIStop = (index) => {
        let { customVDTStore } = this.props
        let { operationalKPIs, sourceIndex } = this.state

        customVDTStore.operationalKPIs = operationalKPIs //vd
        let tempOpkpis = [...operationalKPIs];
        let tempkpi = operationalKPIs[sourceIndex]
        tempOpkpis.splice(sourceIndex, 1);
        tempkpi.index = Number(index)
        tempOpkpis.splice(index, 0, tempkpi)
        for (let i = 0; i < tempOpkpis.length; i++) {
            tempOpkpis[i].index = i
        }
        //vd

        for (let i = 0; i < customVDTStore.operationalKPIs.length; i++) {
            for (let j = 0; j < tempOpkpis.length; j++) {
                if (customVDTStore.operationalKPIs[i].name === tempOpkpis[j].name) {
                    customVDTStore.operationalKPIs[i].orderId = j;
                }
            }
        }
        this.buildRequestTree()
    }

    componentDidUpdate(prevProps) {
        let { totalSelectedLinesArray, strategicObjectives, financialObjectives, businessObjectives, valueDrivers, operationalKPIs, filteredIndustries, filteredBusiness, customVDTStore } = this.props
        if (prevProps.totalSelectedLinesArray !== this.props.totalSelectedLinesArray) {
            this.setState({
                displayCustomVDTTree: true,
                totalSelectedLinesArray: totalSelectedLinesArray,
                sourceIndex: false,
                strategicObjectives: strategicObjectives,
                financialObjectives: financialObjectives,
                businessObjectives: businessObjectives,
                valueDrivers: valueDrivers,
                operationalKPIs: operationalKPIs,
                displayVDTTable: true
            })
        }
        //filteredIndustries  filteredBusiness
        if ((filteredIndustries !== undefined && JSON.stringify(prevProps.filteredIndustries) !== JSON.stringify(filteredIndustries))
            || (filteredBusiness !== undefined && JSON.stringify(prevProps.filteredBusiness) !== JSON.stringify(filteredBusiness))) {
            //console.log(prevProps.filteredIndustries, filteredIndustries, prevProps.filteredBusiness, filteredBusiness);
            const payload = {
                "industryList": filteredIndustries,
                "businessList": filteredBusiness,
            };
            customVDTStore.fetchDropDownValues(payload)
                .then((response) => {
                    if (response && response.data.resultCode === 'OK' && response.data.resultObj) {
                        this.setState({
                            displayCustomVDTTree: true,
                            operationalKPIsList: customVDTStore.operationalKPIsList,
                            strategicObjectivesList: customVDTStore.strategicObjectivesList,
                            financialObjectivesList: customVDTStore.financialObjectivesList,
                            businessObjectivesList: customVDTStore.businessObjectivesList,
                            valueDriversList: customVDTStore.valueDriversList,
                            // displayVDTTable: false
                        })
                    } else if (response && response.data.resultCode === 'KO') {
                        this.showErrorNotification(response.data.errorDescription, 'Error', 'error');
                    }
                });
        }

        if (this.props.isSave === true) {
            this.colourErr()
        }
    }


    render() {
        const { strategicObjectivesList, financialObjectivesList, businessObjectivesList, valueDriversList, operationalKPIsList, totalSelectedLinesArray } = this.state
        const { strategicObjectives, financialObjectives, businessObjectives, valueDrivers, operationalKPIs, displayKPIModal, displayCustomVDTTree, disableSo,
            disableFo, disableBo, disableVd, disableKPI, kpiDetails, dragError, isloading } = this.state
        const opekpis = operationalKPIs ? [...operationalKPIs] : false;
        return (
            <div className='' style={{ width: '100%' }}>
                <div className="row icon-stack-wrapper-row" data-html2canvas-ignore={true} >
                    <div className="col-sm-8">

                    </div>
                    <div className="col-sm-4" style={{ textAlignLast: "end" }} >
                        <IconStack
                            editVDTFlag={this.props.editVDTFlag}
                            isCVDT={true}
                            isloading={isloading}
                            isCvdtEmpty={strategicObjectives && strategicObjectives.length > 0 ? false : true}
                            isVdtSaved={this.props.isSave}
                            saveVDTHandler={this.saveCustomVDT}
                            generateVDT={this.props.getKpiData}
                            vdtBtnHandler={this.props.vdtBtnHandler}
                            downloadBaseline={this.props.downloadBaseline}
                            onIngestBaseline={this.props.onIngestBaseline}
                            viewFullScreenVDT={this.viewFullScreenVDT} />
                    </div>
                </div>

                <div style={{ width: '100%' }}>
                    <div className="row no-gutters align-self-center " style={{ width: this.props.isBusinessCase ? '50%' : '100%', position: 'sticky', top: '0', zIndex: '2' }}>
                        <ReviewValueDriverTreeHeader isBusinessCase={this.props.isBusinessCase} customVDT={true} addMoreObjectives={this.addMoreObjectives} />
                    </div>
                    <div className="vdt-tree-start-div" style={{ width: this.props.isBusinessCase ? '50%' : '100%' }}>
                        <div className="row">
                            <div className="vdt-tree-part">
                                {displayCustomVDTTree ?
                                    <CustomVDTTree
                                        updateConnectingLines={this.updateConnectingLines}
                                        strategicObjectivesList={strategicObjectivesList}
                                        financialObjectivesList={financialObjectivesList}
                                        businessObjectivesList={businessObjectivesList}
                                        valueDriversList={valueDriversList}
                                        operationalKPIsList={operationalKPIsList}
                                        strategicObjectives={strategicObjectives}
                                        financialObjectives={financialObjectives}
                                        businessObjectives={businessObjectives}
                                        valueDrivers={valueDrivers}
                                        operationalKPIs={opekpis}
                                        onSelectedKPI={this.onSelectedKPI}
                                        onNewKPI={this.onNewKPI}
                                        displayKPIModal={displayKPIModal}
                                        modalCloseHandler={this.modalCloseHandler}
                                        saveKPIHandler={this.saveKPIHandler}
                                        saveVDTHandler={this.saveVDTHandler}
                                        onSelectedObjective={this.onSelectedObjective}
                                        updatedDisableDataListFlags={this.updatedDisableDataListFlags}
                                        kpiDetails={kpiDetails}
                                        disableSo={disableSo}
                                        disableFo={disableFo}
                                        disableBo={disableBo}
                                        disableKPI={disableKPI}
                                        disableVd={disableVd}
                                        //kpiChange={this.kpiChange}
                                        showList={this.showList}
                                        totalSelectedLinesArray={totalSelectedLinesArray}
                                        buildALine={this.buildALine}
                                        deleteObjective={this.deleteObjective}
                                        editObjective={this.editObjective}
                                        kpiIndex={this.state.kpiIndex}
                                        newStrategicObj={this.newStrategicObj}
                                        newFinancialObj={this.newFinancialObj}
                                        newBusinessObj={this.newBusinessObj}
                                        newVDO={this.newVDO}
                                        // handleStop={this.handleStop}
                                        // handleStart={this.handleStart}   
                                        handleKPIStop={this.handleKPIStop}
                                        handleVDStop={this.handleVDStop}
                                        handleBoStop={this.handleBoStop}
                                        handleBoStart={this.handleBoStart}
                                        handleFoStop={this.handleFoStop}
                                        handleFoStart={this.handleFoStart}
                                        handleKPIStart={this.handleKPIStart}
                                        handleVDStart={this.handleVDStart}
                                        validateLinks={this.validateLinks}
                                        dragError={dragError}
                                    /> : ''}
                            </div>

                            <div className="pl-0 vdt-table-main">
                                {this.state.displayVDTTable && opekpis.length !== 0 ?
                                    <CustomVDTTable key={Math.random()} operationalKpIs={opekpis} /> : ''}
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        );
    }
}
export default withRouter(CustomVDT);