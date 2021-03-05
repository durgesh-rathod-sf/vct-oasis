import React, { Component, Fragment } from 'react';
import { withRouter } from "react-router-dom";
import '../../containers/ProjectedInvestments/projectedInvestments.css';
import { toast } from 'react-toastify';
import NotificationMessage from '../../components/NotificationMessage/NotificationMessage';
import { observer, inject } from 'mobx-react';
import NumberFormat from 'react-number-format';
import ReactTooltip from 'react-tooltip';
import 'moment-timezone';
import DatePicker from "react-datepicker";
import Modal from 'react-bootstrap4-modal';
import uploadIcon from "../../assets/project/fvdt/upload.svg";
import downloadIcon from "../../assets/project/fvdt/download.svg";
import saveIcon from "../../assets/project/fvdt/save.svg";
import expandIco from "../../assets/project/fvdt/expand.svg";
import rectPlusIcon from "../../assets/project/iActuals/add-year.svg";
import trashIcon from "../../assets/project/iActuals/trash-can.svg";
import modalCloseIcon from "../../assets/project/fvdt/modal-close-icon.svg";
import CustomConfirmModal from '../../components/CustomConfirmModal/CustomConfirmModal';
import calendarIcon from "../../assets/project/fvdt/calendar.svg";
var SessionStorage = require('store/storages/sessionStorage');

@inject('investmentActualsStore')
@observer
class ProjectedInvestments extends Component {
    constructor(props) {
        super(props);
        this.state = {
            result: {},
            testResult: {},
            initiatives: [],
            linkedKPIIds: [],
            init_id: '',
            iniId: '',
            tempResult: [],
            frequency: false,
            expandedIndex: false,
            frequenciesToDisplay: false,
            expandedActualIndex: false,
            showTable: false,
            expandedTotalIndex: false,
            totalFrequenciesToDisplay: false,
            newYearAdded: false,
            customFreqInvActualsModalVisible: false,
            customFreqInvActualsModalTitle: '',
        }
        this.saveClicked = this.saveClicked.bind(this);
        this.test = this.test.bind(this);
        this.saveInvestment = this.saveInvestment.bind(this);
        this.addNewYear = this.addNewYear.bind(this);
        // this.deleteNewYear = this.deleteNewYear.bind(this);
        this.capexCloseWithoutSave = this.capexCloseWithoutSave.bind(this);
        this.kpiCloseWithoutSave = this.kpiCloseWithoutSave.bind(this);
        this.onChangeFrequencyHandler = this.onChangeFrequencyHandler.bind(this);
        this.expandFrequencyData = this.expandFrequencyData.bind(this);
        this.expandTotalFrequencyData = this.expandTotalFrequencyData.bind(this);
        this.openInvActualsFreqConfirmModal = this.openInvActualsFreqConfirmModal.bind(this);
        this.closeInvActualsFreqConfirmModalHandler = this.closeInvActualsFreqConfirmModalHandler.bind(this);

    }

    componentDidMount() {
        const { investmentActualsStore } = this.props;
        const { frequency } = investmentActualsStore;
        this.fetchInvestments();
        this.setState({
            frequency: frequency,
        });
    }

    componentDidUpdate(prevProps, prevState) {
        if (prevProps.result !== this.props.result || prevProps.totalInvestmentsArray !== this.props.totalInvestmentsArray) {
            this.test()
        }

        if (prevState.initiatives !== this.state.initiatives) {
            this.setState({
                initiatives: this.props.initiatives,
                showTable: true
            })
            this.props.loadTable(true)
        }

        if (prevProps.valuesChanged !== this.props.valuesChanged) {
            this.saveClicked()
        }

        if (prevProps.newProjectedYear !== this.props.newProjectedYear) {
            if (this.props.newProjectedYear === true) {
                this.addNewYear()
            }
        }

        if (prevProps.deletedProjectedYear !== this.props.deletedProjectedYear) {
            if (this.props.deletedProjectedYear === true) {
                this.deleteTargetColumnHandler()
            }
        }
        // if(prevProps.startDatesArray !== this.props.startDatesArray){
        //     this.setState({
        //         startDatesArray : this.props.startDatesArray
        //     })

        // }
    }
    test() {
        const { investmentActualsStore } = this.props
        this.setState({
            result: this.props.result,
            frequency: this.state.frequency ? this.state.frequency : investmentActualsStore.frequency,
            initiatives: [...this.props.initiatives],
            linkedKPIIds: [...this.props.linkedKPIIds],
            addClicked: this.props.addClicked,
            // startDatesArray: this.props.result.startDatesArray.year_dates,
            totalInvestmentsArray: [...this.props.totalInvestmentsArray]
        })
    }

    fetchInvestments() {
        this.props.getInvestments()
    }
    capexCloseWithoutSave() {

        this.setState({
            isCapexOpen: false,
            iniId: '',
            capexIndex: ''
        })
    }
    deleteInvestment(init_id) {
        if (window.confirm("Are you sure you want to delete?")) {
            const { result, del_init_id_ls } = this.state;
            let tempResultArr = result;
            let deletedInitArray = [...del_init_id_ls];
            if (SessionStorage.read("demoUser") === "false") { //normal deal
                for (let i = 0; i < tempResultArr.initiatives.length; i++) {
                    if (init_id === tempResultArr.initiatives[i].init_id) {
                        tempResultArr.initiatives.splice(i, 1);
                        if (init_id !== null && init_id !== '') {
                            deletedInitArray.push(init_id);
                        }
                    }

                }
                this.setState({
                    result: tempResultArr,
                    initiatives: [...tempResultArr.initiatives],
                    del_init_id_ls: deletedInitArray
                }, () => {
                    this.saveInvestment();
                })
            }
            else {  //demo deal
                if (init_id === null) {
                    for (let i = 0; i < tempResultArr.initiatives.length; i++) {
                        if (init_id === tempResultArr.initiatives[i].init_id) {
                            tempResultArr.initiatives.splice(i, 1);
                            if (init_id !== null && init_id !== '') {
                                deletedInitArray.push(init_id);
                            }
                        }
                    }
                    this.setState({
                        result: tempResultArr,
                        del_init_id_ls: deletedInitArray
                    })
                }
            }
        }

    }
    calculateTotalInvestments() {
        let totalCal = this.props.totalInvFormat()
        if (totalCal) {
            this.setState({
                totalInvestmentsArray: [...this.props.totalInvestmentsArray]
            })
        }
    }


    onCapexDrillClick(iniId, index) {
        this.setState({
            isCapexOpen: true,
            iniId: iniId === '' ? null : iniId,
            capexIndex: index

        })
    }


    showNotification(type, message) {
        switch (type) {
            case 'saveInvestmentSuccess':
                toast.info(<NotificationMessage
                    title="Success"
                    bodytext={'Investments saved Successfully'}
                    icon="success"
                />, {
                    position: toast.POSITION.BOTTOM_RIGHT
                });
                break;
            case 'Duplicate data entered':
                toast.error(<NotificationMessage
                    title="Error"
                    bodytext={'Please check duplicate Data entered for Initiative'}
                    icon="success"
                />, {
                    position: toast.POSITION.BOTTOM_RIGHT
                });
                break;
            case 'error':
                toast.error(<NotificationMessage
                    title="Error"
                    bodytext={'Error !!!, please check the values and save again'}
                    icon="success"
                />, {
                    position: toast.POSITION.BOTTOM_RIGHT
                });
                break;
            case 'success':
                toast.info(<NotificationMessage
                    title="Success"
                    bodytext={message}
                    icon="success"
                />, {
                    position: toast.POSITION.BOTTOM_RIGHT
                });
                break;
            case 'delete-error':
                toast.error(<NotificationMessage
                    title="Error"
                    bodytext={message}
                    icon="success"
                />, {
                    position: toast.POSITION.BOTTOM_RIGHT
                });
                break;
            default:
                break;
        }
    }

    saveClicked() {
        const { investmentActualsStore } = this.props;

        if (this.validateInputs(this.props.actualResult)) {
            this.saveInvestment()
            this.setState({
                newYearAdded: false
            })
            const { result } = this.state;
            delete result.KPI_list
            investmentActualsStore.projectedResult = {
                initiatives: result.initiatives,
                investments: result.investments
            }
            this.props.saveClicked(true)
        }
    }

    validateInputs(result) {

        for (let i = 0; i < result.initiatives.length; i++) {
            let total = 0;
            for (let j = 0; j < result.initiatives[i].linked_kpis.length; j++) {
                total = total + (result.initiatives[i].linked_kpis[j].cost_allocated_percent && result.initiatives[i].linked_kpis[j].cost_allocated_percent !== "" ? result.initiatives[i].linked_kpis[j].cost_allocated_percent : 0)
            }
            if (total !== 100) {
                // alert("for Initiative " + result.initiatives[i].initiative_name + " total percentage of linked KPIs is not 100")
                this.showNotification("delete-error", ("for Initiative " + result.initiatives[i].initiative_name + " total percentage of linked KPIs is not 100"))
                return false
            }
            let capex = 0
            let opex = 0
            if (result.initiatives[i].capex_inv_percent === undefined || result.initiatives[i].capex_inv_percent === "") {
                capex = 0
            }
            else {
                capex = result.initiatives[i].capex_inv_percent
            }
            if (result.initiatives[i].opex_inv_percent === undefined || result.initiatives[i].opex_inv_percent === "") {
                opex = 0
            }
            else {
                opex = result.initiatives[i].opex_inv_percent
            }
            if (capex + opex !== 100) {
                // alert("for Initiative " + result.initiatives[i].initiative_name + " total percentage of Capex/Opex is not 100")
                this.showNotification("delete-error", ("for Initiative " + result.initiatives[i].initiative_name + " total percentage of Capex/Opex is not 100"))
                return false
            }

        }
        return true

    }
    saveInvestment() {
        const { investmentActualsStore } = this.props;
        let frequency = investmentActualsStore.frequency
        const { result, initiatives, } = this.state;
        if (this.validateInputs(result)) {
            for (let i = 0; i < initiatives.length; i++) {
                // if (initiatives[i].linkedValue) {
                //     delete initiatives[i].linkedValue
                // }
                for (let j = 0; j < initiatives[i].linked_kpis.length; j++) {
                    // delete initiatives[i].linked_kpis[j].checked
                    if (!initiatives[i].linked_kpis[j].cost_allocated_percent || initiatives[i].linked_kpis[j].cost_allocated_percent === undefined) {
                        initiatives[i].linked_kpis.splice(j, 1)
                        j = j - 1
                    }
                }
                for (let k = 0; k < result.initiatives[i].year.length; k++) {
                    if (result.initiatives[i].year[k].inv_val) {
                        if (result.initiatives[i].year[k].inv_val.actualValue === "" || result.initiatives[i].year[k].inv_val.actualValue === undefined) {
                            // delete result.initiatives[i].year[k].inv_val
                            result.initiatives[i].year[k].inv_val = ""
                            // initiatives[i].year.splice(k, 1)
                            // k = k - 1
                        }
                        else {
                            if (result.initiatives[i].year[k].inv_val.actualValue === '0') {
                                result.initiatives[i].year[k].inv_val = 0
                            }
                            else {
                                result.initiatives[i].year[k].inv_val = result.initiatives[i].year[k].inv_val.actualValue
                            }
                            if (typeof (result.initiatives[i].year[k].inv_val) === 'string') {
                                result.initiatives[i].year[k].inv_val = Number(result.initiatives[i].year[k].inv_val)
                            }
                        }
                    }
                    else {
                        result.initiatives[i].year[k].inv_val = "";
                    }
                    if (frequency !== 'yearly') {
                        if (result.initiatives[i].year[k].frequency_data) {
                            for (let l = 0; l < result.initiatives[i].year[k].frequency_data.length; l++) {
                                if (result.initiatives[i].year[k].frequency_data[l].inv_val) {
                                    if (result.initiatives[i].year[k].frequency_data[l].inv_val.actualValue === "" || result.initiatives[i].year[k].frequency_data[l].inv_val.actualValue === undefined) {
                                        // delete result.initiatives[i].year[k].inv_val
                                        result.initiatives[i].year[k].frequency_data[l].inv_val = ""
                                        // initiatives[i].year[k].frequency_data.splice(l, 1)
                                        // l = l - 1
                                    }
                                    else {
                                        if (result.initiatives[i].year[k].frequency_data[l].inv_val.actualValue === '0') {
                                            result.initiatives[i].year[k].frequency_data[l].inv_val = 0
                                        }
                                        else {
                                            result.initiatives[i].year[k].frequency_data[l].inv_val = result.initiatives[i].year[k].frequency_data[l].inv_val.actualValue
                                        }
                                        if (typeof (result.initiatives[i].year[k].frequency_data[l].inv_val) === 'string') {
                                            result.initiatives[i].year[k].frequency_data[l].inv_val = Number(result.initiatives[i].year[k].frequency_data[l].inv_val)
                                        }
                                    }
                                }
                                else {
                                    result.initiatives[i].year[k].frequency_data[l].inv_val = "";
                                }
                            }
                        }
                    }
                }
            }
        }
    }

    onInputBlur(init_id, value, year_no, index) {
        const { result } = this.state
        let value1 = value.replace(/,/g, '')
        let newResult = result
        for (let i = 0; i < newResult.initiatives.length; i++) {
            for (let j = 0; j < newResult.initiatives[i].year.length; j++) {
                if (init_id === null && index === i) {
                    if (year_no === newResult.initiatives[i].year[j].year_no) {
                        if (newResult.initiatives[i].year[j].inv_val) {
                            newResult.initiatives[i].year[j].inv_val.formattedValue = value1 === "" ? "" : value1.indexOf('.') === value1.length - 1 ? value1 :
                                // Number(value1).toFixed(1)
                                Number(Math.round(Number(value1) * 10) / 10).toFixed(1)
                        }
                        for (let k = 0; k < newResult.initiatives[i].year[j].frequency_data.length; k++) {
                            if (newResult.initiatives[i].year[j].frequency_data[k].inv_val) {
                                newResult.initiatives[i].year[j].inv_val.formattedValue = value1 === "" ? "" : value1.indexOf('.') === value1.length - 1 ? value1 :
                                    // Number(value1).toFixed(1)
                                    Number(Math.round(Number(value1) * 10) / 10).toFixed(1)
                            }
                        }
                    }
                }
                else if (init_id !== null) {
                    if (init_id === newResult.initiatives[i].init_id) {
                        for (let j = 0; j < newResult.initiatives[i].year.length; j++) {
                            if (year_no === newResult.initiatives[i].year[j].year_no) {
                                if (newResult.initiatives[i].year[j].inv_val) {
                                    newResult.initiatives[i].year[j].inv_val.formattedValue = value1 === "" ? "" : value1.indexOf('.') === value1.length - 1 ? value1 :
                                        // Number(value1).toFixed(1)
                                        Number(Math.round(Number(value1) * 10) / 10).toFixed(1)
                                }
                                if (newResult.initiatives[i].year[j].frequency_data) {
                                    for (let k = 0; k < newResult.initiatives[i].year[j].frequency_data.length; k++) {
                                        if (newResult.initiatives[i].year[j].frequency_data[k].inv_val) {
                                            newResult.initiatives[i].year[j].inv_val.formattedValue = value1 === "" ? "" : value1.indexOf('.') === value1.length - 1 ? value1 :
                                                // Number(value1).toFixed(1)
                                                Number(Math.round(Number(value1) * 10) / 10).toFixed(1)
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }

        this.setState({
            result: newResult,
            initiatives: newResult.initiatives,
        })
    }

    onCapexModalClose(init_id, index) {
        const { result } = this.state;
        for (let i = 0; i < result.initiatives.length; i++) {
            let iniId = this.state.iniId !== null ? parseInt(this.state.iniId) : null
            if (init_id === null && index === i) {
                let capex = 0
                let opex = 0
                if (result.initiatives[i].capex_inv_percent === undefined || result.initiatives[i].capex_inv_percent === "") {
                    capex = 0
                }
                else {
                    capex = result.initiatives[i].capex_inv_percent
                }
                if (result.initiatives[i].opex_inv_percent === undefined || result.initiatives[i].opex_inv_percent === "") {
                    opex = 0
                }
                else {
                    opex = result.initiatives[i].opex_inv_percent
                }
                if (capex + opex !== 100) {
                    // alert("Total percentage of Capex and Opex should be 100")
                    this.showNotification("delete-error", "Total percentage of Capex and Opex should be 100")
                }
                else {
                    this.setState({
                        isCapexOpen: false,
                        iniId: '',
                        capexIndex: ''
                    })
                }
            }
            else if (iniId !== null) {
                if (iniId === result.initiatives[i].init_id) {
                    let capex = 0
                    let opex = 0
                    if (result.initiatives[i].capex_inv_percent === undefined || result.initiatives[i].capex_inv_percent === "") {
                        capex = 0
                    }
                    else {
                        capex = result.initiatives[i].capex_inv_percent
                    }
                    if (result.initiatives[i].opex_inv_percent === undefined || result.initiatives[i].opex_inv_percent === "") {
                        opex = 0
                    }
                    else {
                        opex = result.initiatives[i].opex_inv_percent
                    }
                    if (capex + opex !== 100) {
                        // alert("Total percentage of Capex and Opex should be 100")
                        this.showNotification("delete-error", "Total percentage of Capex and Opex should be 100")
                    }
                    else {
                        this.setState({
                            isCapexOpen: false,
                            iniId: '',
                            capexIndex: ''
                        })
                    }
                }
            }
        }

    }

    onKpiModalOpen(index, initId) {
        this.setState({
            isKpiModalOpen: true,
            init_id: initId === '' ? null : initId,
            modalIndex: index
        })
    }

    onKpiModalClose(index, kpiIndex) {
        let total = 0
        const { result } = this.state;
        let init_id = this.state.init_id !== null && this.state.init_id !== "" ? parseInt(this.state.init_id) : null
        for (let i = 0; i < result.initiatives.length; i++) {
            if (init_id === null && index === i) {
                result.initiatives[i].linkedValue = "";
                for (let j = 0; j < result.initiatives[i].linked_kpis.length; j++) {
                    total = total + (result.initiatives[i].linked_kpis[j].cost_allocated_percent && result.initiatives[i].linked_kpis[j].cost_allocated_percent !== "" ? result.initiatives[i].linked_kpis[j].cost_allocated_percent : 0)
                    if (result.initiatives[i].linkedValue === "" && result.initiatives[i].linked_kpis[j].cost_allocated_percent !== "" && result.initiatives[i].linked_kpis[j].cost_allocated_percent !== undefined) {
                        result.initiatives[i].linkedValue = result.initiatives[i].linked_kpis[j].kpi_name
                        this.setState({
                            checkedVal: result.initiatives[i].linked_kpis[j].kpi_name
                        })
                    }
                    if (result.initiatives[i].linked_kpis[j].checked === true && result.initiatives[i].linked_kpis[j].cost_allocated_percent === "") {
                        // alert("Please enter the value(s) to the KPI(s) selected")
                        this.showNotification("delete-error", "Please enter the value(s) to the KPI(s) selected")
                    }
                }
            }
            else if (init_id !== null) {
                if (init_id === result.initiatives[i].init_id) {
                    result.initiatives[i].linkedValue = "";
                    for (let j = 0; j < result.initiatives[i].linked_kpis.length; j++) {
                        total = total + (result.initiatives[i].linked_kpis[j].cost_allocated_percent && result.initiatives[i].linked_kpis[j].cost_allocated_percent !== "" ? result.initiatives[i].linked_kpis[j].cost_allocated_percent : 0)
                        if (result.initiatives[i].linkedValue === "" && result.initiatives[i].linked_kpis[j].cost_allocated_percent !== "" && result.initiatives[i].linked_kpis[j].cost_allocated_percent !== undefined) {
                            result.initiatives[i].linkedValue = result.initiatives[i].linked_kpis[j].kpi_name
                            this.setState({
                                checkedVal: result.initiatives[i].linked_kpis[j].kpi_name
                            })
                        }
                        if (result.initiatives[i].linked_kpis[j].checked === true && result.initiatives[i].linked_kpis[j].cost_allocated_percent === "") {
                            // alert("Please enter the value(s) to the KPI(s) selected")
                            this.showNotification("delete-error", "Please enter the value(s) to the KPI(s) selected")
                        }

                    }
                }
            }
        }
        if (total !== 100) {
            // alert("Total percentage of linked KPIs should be 100")
            this.showNotification("delete-error", "Total percentage of linked KPIs should be 100")
        }
        else {
            this.setState({
                isKpiModalOpen: false,
                init_id: '',
                modalIndex: '',
            })
        }

    }

    kpiCloseWithoutSave() {
        this.setState({
            isKpiModalOpen: false,
            init_id: '',
            modalIndex: ''
        })
    }

    onInputFocus(init_id, value, year_no, index) {
        const { result } = this.state
        // let value1 = value.replace(/,/g, '')
        let newResult = result
        for (let i = 0; i < newResult.initiatives.length; i++) {
            for (let j = 0; j < newResult.initiatives[i].year.length; j++) {
                if (init_id === null && index === i) {
                    if (year_no === newResult.initiatives[i].year[j].year_no) {
                        if (newResult.initiatives[i].year[j].inv_val) {
                            let val = newResult.initiatives[i].year[j].inv_val.actualValue
                            newResult.initiatives[i].year[j].inv_val.formattedValue = val ? val : null;

                        }
                        for (let k = 0; k < newResult.initiatives[i].year[j].frequency_data.length; k++) {
                            if (newResult.initiatives[i].year[j].frequency_data[k].inv_val) {
                                let val = newResult.initiatives[i].year[j].frequency_data[k].inv_val.actualValue
                                newResult.initiatives[i].year[j].frequency_data[k].inv_val.formattedValue = val ? val : null;
                            }
                        }
                    }
                }
                else if (init_id !== null) {
                    if (init_id === newResult.initiatives[i].init_id) {
                        for (let j = 0; j < newResult.initiatives[i].year.length; j++) {
                            if (year_no === newResult.initiatives[i].year[j].year_no) {
                                if (newResult.initiatives[i].year[j].inv_val) {
                                    let val = newResult.initiatives[i].year[j].inv_val.actualValue
                                    newResult.initiatives[i].year[j].inv_val.formattedValue = val ? val : null;
                                    // newResult.initiatives[i].year[j].inv_val.formattedValue = newResult.initiatives[i].year[j].inv_val.actualValue === "" ? "" : newResult.initiatives[i].year[j].inv_val.actualValue.indexOf('.') === newResult.initiatives[i].year[j].inv_val.actualValue.length - 1 ? newResult.initiatives[i].year[j].inv_val.actualValue : Number(newResult.initiatives[i].year[j].inv_val.actualValue)
                                }
                                if (newResult.initiatives[i].year[j].frequency_data) {
                                    for (let k = 0; k < newResult.initiatives[i].year[j].frequency_data.length; k++) {
                                        if (newResult.initiatives[i].year[j].frequency_data[k].inv_val) {
                                            let val = newResult.initiatives[i].year[j].frequency_data[k].inv_val.actualValue
                                            newResult.initiatives[i].year[j].frequency_data[k].inv_val.formattedValue = val ? val : null;
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }

        this.setState({
            result: newResult,
            initiatives: newResult.initiatives,
        })
    }

    getYearsArray = () => {
        const { result } = this.props;
        const selected_option = SessionStorage.read('option_selected');
        if (selected_option === 'delivery' && result.initiatives && result.initiatives.length > 0) {
            return result.initiatives[0].year;
        }
        return [{ "year_no": 1 }, { "year_no": 2 },
        { "year_no": 3 }, { "year_no": 4 }, { "year_no": 5 }];
    }


    addNewYear = () => {
        const { investmentActualsStore } = this.props;
        const yearIndex = this.getYearsArray().length;
        const { result } = this.state;
        let tempResult = result;
        let freqData = []
        let totalArray = []
        let TempInitiativesArray = [...tempResult.initiatives];
        let TempInvArray = [...tempResult.investments];
        this.setState({
            newYearAdded: true
        })
        let frequency = !this.state.frequency ? investmentActualsStore.frequency : this.state.frequency
        TempInitiativesArray.map((initiative, initiativeIndex) => {
            freqData = []
            totalArray = []
            const previousYearObj = JSON.parse(JSON.stringify(initiative.year[yearIndex - 1]));
            if (frequency === 'fortnightly') {
                for (let i = 0; i < 26; i++) {
                    let tempObj = {
                        'fortnight_no': (yearIndex * 26 + i + 1),
                        "inv_val": {
                            "actualValue": previousYearObj.frequency_data[i].inv_val.actualValue,
                            "formattedValue": previousYearObj.frequency_data[i].inv_val.formattedValue
                        }
                    }
                    let totalObj = {
                        'fortnight_no': (yearIndex * 26 + i + 1),
                        'total_investment_value': TempInvArray[yearIndex - 1].total_investment_value / 26
                    }
                    totalArray.push(totalObj)
                    freqData.push(tempObj)
                }
            } else if (frequency === 'monthly') {
                for (let i = 0; i < 12; i++) {
                    let tempObj = {
                        'month_no': (yearIndex * 12 + i + 1),
                        "inv_val": {
                            "actualValue": previousYearObj.frequency_data[i].inv_val.actualValue,
                            "formattedValue": previousYearObj.frequency_data[i].inv_val.formattedValue
                        }
                    }
                    let totalObj = {
                        'month_no': (yearIndex * 12 + i + 1),
                        'total_investment_value': TempInvArray[yearIndex - 1].total_investment_value / 12
                    }
                    totalArray.push(totalObj)
                    freqData.push(tempObj)
                }
            } else if (frequency === 'quarterly') {
                for (let i = 0; i < 4; i++) {
                    let tempObj = {
                        'quarter_no': (yearIndex * 4 + i + 1),
                        "inv_val": {
                            "actualValue": previousYearObj.frequency_data[i].inv_val.actualValue,
                            "formattedValue": previousYearObj.frequency_data[i].inv_val.formattedValue
                        }
                    }
                    let totalObj = {
                        'quarter_no': (yearIndex * 4 + i + 1),
                        'total_investment_value': TempInvArray[yearIndex - 1].total_investment_value / 4
                    }
                    totalArray.push(totalObj)
                    freqData.push(tempObj)
                }
            }
            let tempObj = {}
            if (previousYearObj.inv_val) {
                tempObj = {
                    "frequency_data": freqData,
                    "inv_val": {
                        "actualValue": previousYearObj.inv_val.actualValue,
                        "formattedValue": 0
                    },
                    "year_no": Number(yearIndex + 1),
                }
            } else {
                tempObj = {
                    "year_no": Number(yearIndex + 1)
                }
            }
            initiative.year.push(tempObj);
            return true
        });
        const previousInvObj = {
            "frequency_data": totalArray,
            "total_investment_value": TempInvArray[yearIndex - 1].total_investment_value,
            "year_no": Number(yearIndex + 1)
        };

        TempInvArray.push(previousInvObj);
        tempResult.investments = [...TempInvArray];

        this.setState({
            result: tempResult,
            initiatives: TempInitiativesArray,
            totalInvestmentsArray: [...TempInvArray]
        });
        if (this.props.newProjectedYear === false) {
            this.props.addNewActualYear(true)
            this.props.addDateColumn()
        }
        else {
            this.props.addNewProjectedYear(false)
        }

    };

    deleteTargetColumnHandler = () => {
        const { investmentActualsStore } = this.props;
        const { newYearAdded, result, totalInvestmentsArray } = this.state;
        let tempResult = result;
        if (!newYearAdded) {
            investmentActualsStore.deleteExtraYear(this.getYearsArray().length)
                .then((response) => {
                    if (response && !response.error) {
                        this.fetchInvestments();
                        this.showNotification('success', 'Data deleted successfully');
                        return;
                    }
                    this.showNotification('delete-error', 'Sorry! something went wrong');
                });
        }
        else {
            tempResult.initiatives.map((kpi) => {
                kpi.year.pop()
            })
            tempResult.investments.pop()
            totalInvestmentsArray.pop()
        }
        this.setState({
            result: tempResult,
            totalInvestmentsArray: totalInvestmentsArray
        })
        if (this.props.deletedProjectedYear === false) {
            this.props.deleteActualYear(true)
        }
        else {
            this.props.deleteProjectedYear(false)
        }
    }
    openInvActualsFreqConfirmModal = (title) => {
        this.setState({
            customFreqInvActualsModalVisible: true,
            customFreqInvActualsModalTitle: title,

        });
    };
    closeInvActualsFreqConfirmModalHandler = (isYesClicked) => {
        const { investmentActualsStore } = this.props;
        this.setState({
            customFreqInvActualsModalVisible: false,
            customFreqInvActualsModalTitle: ''
        });
        if (isYesClicked) {
            //new delete function
            investmentActualsStore.frequency = this.state.modal_targetId;
            this.freqChangeConfirm()
        }
        this.fetchInvestments()

    };
    freqChangeConfirm() {
        const { investmentActualsStore } = this.props;
        const { modal_targetId } = this.state;
        this.setState({
            frequency: modal_targetId,
            frequenciesToDisplay: [],
            expandedIndex: false,
            expandedTotalIndex: false,
            expandedActualIndex: false,


        })
        investmentActualsStore.frequenciesToDisplay = []
        investmentActualsStore.frequencyArray = []
        investmentActualsStore.frequencyChanged = true
        // investmentActualsStore.frequency = ''

    }
    onChangeFrequencyHandler = (event) => {
        const { investmentActualsStore } = this.props;
        // startDatesArray.main_start_date=""
        // investmentActualsStore.frequency = event.target.value
        this.setState({
            showTable: false,
            modal_targetId: event.target.value
        })
        this.props.loadTable(false)
        investmentActualsStore.showTable = false
        let confirmMsg = "Already filled data will be lost with the change of frequency. Do you want to continue?";
        this.openInvActualsFreqConfirmModal(confirmMsg);
        // if (window.confirm()) {}

    }

    calculateFrequencyData = () => {
        const { investmentActualsStore, result } = this.props
        const { frequency } = this.state
        if (frequency) {
            investmentActualsStore.frequency = frequency
        }
        let freqArray = []
        let totalCount
        switch (investmentActualsStore.frequency) {
            case 'monthly':
                totalCount = result.investments.length * 12
                for (let i = 1; i <= totalCount; i++) {
                    freqArray.push('Month ' + i)
                }
                break;
            case 'quarterly':
                totalCount = result.investments.length * 4
                for (let i = 1; i <= totalCount; i++) {
                    freqArray.push('Quarter ' + i)
                }
                break;
            case 'fortnightly':
                totalCount = result.investments.length * 26
                for (let i = 1; i <= totalCount; i++) {
                    freqArray.push('Fortnight ' + i)
                }
                break;
            default: break;
        }
        this.setState({
            frequencyArray: freqArray
        })
        investmentActualsStore.frequencyArray = freqArray
    }

    expandFrequencyData = (event) => {
        const { expandedIndex } = this.state
        if (expandedIndex === event) {
            this.setState({
                expandedIndex: false
            })
        } else {
            this.setState({
                expandedIndex: event
            })
        }
        this.calculateFrequencyData()
        this.expandFrequencyLevelData(event, 'frequency')
    }

    expandTotalFrequencyData = (event) => {
        const { expandedTotalIndex } = this.state
        if (expandedTotalIndex === event) {
            this.setState({
                expandedTotalIndex: false
            })
        } else {
            this.setState({
                expandedTotalIndex: event
            })
        }
        this.calculateFrequencyData()
        this.expandFrequencyLevelData(event, 'totalfrequency')
    }

    expandFrequencyActualData = (event) => {
        const { expandedActualIndex } = this.state
        if (expandedActualIndex === event) {
            this.setState({
                expandedActualIndex: false
            })
        } else {
            this.setState({
                expandedActualIndex: event
            })
        }
        this.calculateFrequencyData()
        this.expandFrequencyLevelData(event, 'frequency')
    }

    expandFrequencyLevelData(event, level) {
        const { investmentActualsStore } = this.props
        let { frequencyArray } = investmentActualsStore
        let frequenciesToDisplay = []
        let frequencyToDisplay
        switch (investmentActualsStore.frequency) {
            case 'monthly':
                frequencyToDisplay = (event + 1) * 12;
                for (let i = (event * 12); i < frequencyToDisplay; i++) {
                    frequenciesToDisplay.push(frequencyArray[i])
                }
                break;
            case 'quarterly':
                frequencyToDisplay = (event + 1) * 4;
                for (let i = (event * 4); i < frequencyToDisplay; i++) {
                    frequenciesToDisplay.push(frequencyArray[i])
                }
                break;
            case 'fortnightly':
                frequencyToDisplay = (event + 1) * 26;
                for (let i = (event * 26); i < frequencyToDisplay; i++) {
                    frequenciesToDisplay.push(frequencyArray[i])
                }
                break;

            default:
                break;
        }
        if (level === 'frequency') {
            this.setState({
                frequenciesToDisplay: frequenciesToDisplay
            })
            investmentActualsStore.frequenciesToDisplay = frequenciesToDisplay
        }
        else {
            this.setState({
                totalFrequenciesToDisplay: frequenciesToDisplay
            })
            investmentActualsStore.totalFrequenciesToDisplay = frequenciesToDisplay
        }


    }

    handleInvestmentValueChange(init_id, value, year_no, index) {
        const { result } = this.state
        let value1 = value.replace(/,/g, '')
        let newResult = result
        let regex = /^(?!00)\d+\.0{1,}\d*$/
        for (let i = 0; i < newResult.initiatives.length; i++) {
            if (init_id === null && year_no - 1 === i) {
                if (value1 === '0') {
                    newResult.initiatives[i].year[year_no - 1].frequency_data[index].inv_val.actualValue = "0"
                    newResult.initiatives[i].year[year_no - 1].frequency_data[index].inv_val.formattedValue = 0
                } else {
                    newResult.initiatives[i].year[year_no - 1].frequency_data[index].inv_val.actualValue = value1 === "" ? "" : value1.indexOf('.') === value1.length - 1 ? value1 : regex.test(value1) ? value1 : Number(value1)
                    newResult.initiatives[i].year[year_no - 1].frequency_data[index].inv_val.formattedValue = value1 === "" ? "" : value1.indexOf('.') === value1.length - 1 ? value1 : regex.test(value1) ? value1 : Number(value1)
                }
            }
            else if (init_id !== null) {
                if (init_id === newResult.initiatives[i].init_id) {
                    if (value1 === '0') {
                        newResult.initiatives[i].year[year_no - 1].frequency_data[index].inv_val.actualValue = '0'
                        newResult.initiatives[i].year[year_no - 1].frequency_data[index].inv_val.formattedValue = 0
                    } else {
                        if (newResult.initiatives[i].year[year_no - 1].frequency_data) {
                            newResult.initiatives[i].year[year_no - 1].frequency_data[index].inv_val.actualValue = value1 === "" ? "" : value1.indexOf('.') === value1.length - 1 ? value1 : regex.test(value1) ? value1 : Number(value1)
                            newResult.initiatives[i].year[year_no - 1].frequency_data[index].inv_val.formattedValue = value1 === "" ? "" : value1.indexOf('.') === value1.length - 1 ? value1 : regex.test(value1) ? value1 : Number(value1)
                        }
                        else {
                            newResult.initiatives[i].year[year_no - 1].inv_val.actualValue = value1 === "" ? "" : value1.indexOf('.') === value1.length - 1 ? value1 : regex.test(value1) ? value1 : Number(value1)
                            newResult.initiatives[i].year[year_no - 1].inv_val.formattedValue = value1 === "" ? "" : value1.indexOf('.') === value1.length - 1 ? value1 : regex.test(value1) ? value1 : Number(value1)
                        }
                    }
                }
            }
        }
        for (let k = 0; k < newResult.investments.length; k++) {
            if (newResult.investments[k].year_no === year_no) {
                newResult.investments[k].total_investment_value = 0
            }
        }

        for (let k = 0; k < newResult.investments.length; k++) {
            for (let i = 0; i < newResult.initiatives.length; i++) {
                for (let j = 0; j < newResult.initiatives[i].year.length; j++) {
                    if (newResult.initiatives[i].year[j].year_no === year_no) {
                        if (newResult.investments[k].year_no === year_no) {
                            if (newResult.initiatives[i].year[j].inv_val) {
                                newResult.investments[k].total_investment_value = newResult.investments[k].total_investment_value + (newResult.initiatives[i].year[j].inv_val.actualValue === "" || Number(newResult.initiatives[i].year[j].inv_val.actualValue) === 0 || newResult.initiatives[i].year[j].inv_val.actualValue === undefined ? 0 : Number(newResult.initiatives[i].year[j].inv_val.actualValue))
                            }
                        }
                    }
                }

            }
        }
        for (let k = 0; k < newResult.initiatives.length; k++) {
            for (let i = 0; i < newResult.initiatives[k].year.length; i++) {
                let frequencyData = newResult.initiatives[k].year[i].frequency_data
                if (frequencyData) {
                    let sum = frequencyData.map(o => o.inv_val.actualValue).reduce((a, c) => { return Number(a) + Number(c) });
                    newResult.initiatives[k].year[i].inv_val.actualValue = sum
                }
            }
        }

        this.setState({
            result: newResult,
            initiatives: newResult.initiatives,
            // totalInvestmentsArray: newResult.totalInvestmentsArray,
            totalInvestmentsArray: result.investments
        })
    }

    render() {
        const { totalFrequenciesToDisplay, totalInvestmentsArray, initiatives, iniId, capexIndex, init_id, modalIndex, frequency, frequenciesToDisplay, expandedActualIndex, expandedTotalIndex } = this.state;
        const { startDatesArray,saveLoading } = this.props;
        const getTooltipData = (value) => {
            if (value) {
                let val = String(value).replace(/(?<!\..*)(\d)(?=(?:\d{3})+(?:\.|$))/g, '$1,');
                return `${val}`;
            }
        }
        const getTooltipText = (val) => {
            return `${val}`;
        }
        const selected_option = SessionStorage.read('option_selected');
        // let frequency_no = frequency === 'monthly' ? 12 : frequency === 'quarterly' ? 4 : frequency === 'fortnightly' ? 24 : 1
        return (
            <Fragment>
                <div className="row ia-tab-content" style={{ position: 'relative' }}>

                    <div className="row tab" style={{ width: '100%' }}>
                        <div className="col-sm-8"></div>
                        <div className="col-sm-4" style={{ textAlignLast: 'end', position: 'relative', top: '-2.9rem' }}>
                            <img className="download-img" alt=""
                                src={downloadIcon}
                                data-tip=""
                                data-for="gdt_tooltip"
                                style={{ opacity: SessionStorage.read("accessType") === "Read" ? "0.5" : "unset", cursor: SessionStorage.read("accessType") === "Read" ? "not-allowed" : 'pointer' }}
                                disabled={SessionStorage.read("demoUser") === "true" ? true : false}
                            >
                                {/* Generate Data Template */}
                            </img>
                            <img className="upload-img" alt=""
                                data-tip=""
                                data-for="ing_data_tooltip"
                                src={uploadIcon}
                                style={{ opacity: SessionStorage.read("accessType") === "Read" ? "0.5" : "unset", cursor: SessionStorage.read("accessType") === "Read" ? "not-allowed" : 'pointer' }}
                                disabled={SessionStorage.read("demoUser") === "true" ? true : SessionStorage.read("accessType") === "Read" ? true : false}
                            >
                                {/* Ingest Data */}
                            </img>
                            <img className="save-img" alt=""
                                data-tip=""
                                data-for="save_tooltip"
                                src={saveIcon}
                                style={{ opacity: ((SessionStorage.read("accessType") === "Read" || saveLoading) ? "0.5" : "unset"), cursor: (SessionStorage.read("accessType") === "Read" ? "not-allowed" : (saveLoading?"default":'pointer')) }}
                                disabled={(SessionStorage.read("demoUser") === "true" ? true : SessionStorage.read("accessType") === "Read" || saveLoading) ? true : false}
                                onClick={(SessionStorage.read("accessType") === "Read" || saveLoading) ? () => { } : this.saveClicked}
                            >
                                {/* Save */}
                            </img>

                            {saveLoading ?
                                <i className="fa fa-spinner fa-spin" style={{ color: '#ffffff', position: "absolute", margin: "10px -17px", cursor: "default" }}></i>
                              : ""}
                            <img src={expandIco} alt="expand"
                                data-tip=""
                                data-for="expand_tooltip"
                                data-place="left"
                                className="expand-img"
                                onClick={this.props.onExpandClick}
                                style={{ cursor: "pointer" }} />
                            <ReactTooltip id="gdt_tooltip" className="tooltip-class">
                                <span>Generate Data Template</span>
                            </ReactTooltip>
                            <ReactTooltip id="ing_data_tooltip" className="tooltip-class">
                                <span>Ingest Data</span>
                            </ReactTooltip>
                            <ReactTooltip id="save_tooltip" className="tooltip-class">
                                <span>Save</span>
                            </ReactTooltip>
                            <ReactTooltip id="expand_tooltip" className="tooltip-class">
                                <span>View in full screen</span>
                            </ReactTooltip>
                        </div>
                    </div>

                    <div className="row frequency-date-row">
                        <div className="col-sm-6 inv-freq-wrapper">
                            <label>Investment Frequency:</label>
                            <select
                                type="text"
                                className="form-control"
                                id="accessControlId"
                                style={{ cursor: "pointer", fontSize: "12px", border: "0px" }}
                                value={this.state.frequency}
                                onChange={SessionStorage.read("accessType") === "Read" ? () => { } : this.onChangeFrequencyHandler}
                                required
                            >
                                <option value="Select">Select</option>
                                <option select value="yearly">Yearly</option>
                                <option value="fortnightly">Fortnightly</option>
                                <option value="quarterly">Quarterly</option>
                                <option value="monthly">Monthly</option>

                            </select>
                        </div>
                        <div className="col-sm-6 date-wrapper">
                            <label className="projInv-label">Start Date:</label>
                            <div className="input-group form-group" style={{ margin: '0px', width: "170px", backgroundColor: "#4D4D4D", borderRadius: "2px" }}>
                                <DatePicker
                                    value={startDatesArray && (startDatesArray.main_start_date !== "Invalid date" && startDatesArray.main_start_date !== "") ? new Date(startDatesArray.main_start_date) : ''}
                                    selected={startDatesArray && (startDatesArray.main_start_date !== "Invalid date" && startDatesArray.main_start_date !== "") ? new Date(startDatesArray.main_start_date) : ''}
                                    placeholderText="Select Date"
                                    id={`inv_start_date`}
                                    onChange={this.props.handleChange.bind(this)}
                                    dateFormat="dd-MMM-yyyy"
                                    showMonthDropdown
                                    showYearDropdown
                                    useShortMonthInDropdown
                                    fixedHeight
                                    popperModifiers={{
                                        offset: {
                                            enabled: true,
                                            offset: "5px, 10px"
                                        },
                                        preventOverflow: {
                                            enabled: true,
                                            escapeWithReference: false,
                                            boundariesElement: "viewport"
                                        }
                                    }}
                                    className="form-control ProjInv_date-Input"
                                    required={true}
                                // disabled={!this.state.loadTable}
                                />
                                <div style={{ width: "20%", zIndex: '1', padding: "5px" }}>
                                    <img src={calendarIcon} alt="CalendarIcon" style={{ width: "18px" }}></img>
                                </div>
                            </div>

                        </div>
                        {/* <div className='col-sm-5'>
                            <div className="ia-table-responsive">
                                <table className="table" style={{ marginLeft: "10%", marginTop: '5%', tableLayout: 'fixed' }}>
                                    <thead style={{
                                        // whiteSpace: 'nowrap',
                                        backgroundColor: '#d3d3d3ad'
                                    }}>
                                        <tr>
                                            <th className="headTable_header">Tracking Frequency</th>
                                            <th className="headTable_header">Start Date</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr>
                                            <td style={{ backgroundColor: '#d3d3d3ad' }}>
                                                <select
                                                    type="text"
                                                    className="form-control"
                                                    id="accessControlId"
                                                    style={{ cursor: "pointer", fontSize: "12px", border: "0px" }}
                                                    value={this.state.frequency}
                                                    onChange={this.onChangeFrequencyHandler}
                                                    required
                                                >
                                                    <option value="Select">Select</option>
                                                    <option selected value="yearly">Yearly</option>
                                                    <option value="fortnightly">Fortnightly</option>
                                                    <option value="quarterly">Quarterly</option>
                                                    <option value="monthly">Monthly</option>

                                                </select>
                                            </td>
                                            <td>
                                                <div className="input-group form-group" style={{ fontSize: '12px', margin: '0px' }}>
                                                    <DatePicker
                                                        value={startDatesArray && (startDatesArray.main_start_date !== "Invalid date" && startDatesArray.main_start_date !== "") ? new Date(startDatesArray.main_start_date) : ''}
                                                        selected={startDatesArray &&  (startDatesArray.main_start_date !== "Invalid date" && startDatesArray.main_start_date !== "") ? new Date(startDatesArray.main_start_date) : ''}
                                                        placeholderText="Select Date"
                                                        onChange={this.props.handleChange.bind(this)}
                                                        dateFormat="dd/MMM/yyyy"
                                                        showMonthDropdown
                                                        useShortMonthInDropdown
                                                        fixedHeight
                                                        className="form-control ProjInv_date-Input"
                                                        required={true}
                                                    // disabled={!this.state.loadTable}
                                                    />
                                                    <div style={{ zIndex: '1', fontSize: '22px', color: '#000000' }}>
                                                        <i className="fa fa-calendar-o" style={{ paddingLeft: "-20px" }} ></i>
                                                    </div>
                                                </div>

                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div> */}


                    </div>
                    {this.state.showTable ?
                        <Fragment>
                            <div className="row">
                                <h5 style={{ color: '#fff', fontSize: '14px', marginTop: '1rem' }}>   Projected Investments</h5>
                            </div>
                            <div className="col-sm-12 table-width-holder" >
                                <div className="ia-table-responsive invActuals-table-scroll" style={{ overflowX: 'auto', width: "100%" }}>
                                    <table className="table" style={{ marginBottom: "0%", width: "unset" }}>
                                        <thead style={{ whiteSpace: 'nowrap' }}>
                                            <tr>
                                                <th style={{ padding: "20px 50px" }} >Total Investments</th>
                                                {totalInvestmentsArray && totalInvestmentsArray.map((option, index) => (
                                                    <Fragment>
                                                        {expandedTotalIndex === index ?
                                                            totalFrequenciesToDisplay.map((frequency, freqIndex) => (
                                                                <th style={{ padding: "0px" }}>
                                                                    <p style={{ margin: "7px 0px" }}>{frequency}</p>
                                                                    <th className="projInv_subHead" style={{ width: '200px', background: '' }}>
                                                                        {startDatesArray.year_dates && (startDatesArray.year_dates[index].frequency_start_dates[freqIndex].start_date !== "Invalid date" && startDatesArray.year_dates[index].frequency_start_dates[freqIndex].start_date !== "") ?
                                                                            <DatePicker
                                                                                value={startDatesArray.year_dates && (startDatesArray.year_dates[index].frequency_start_dates[freqIndex].start_date !== "Invalid date" && startDatesArray.year_dates[index].frequency_start_dates[freqIndex].start_date !== "") ?
                                                                                    new Date(startDatesArray.year_dates[index].frequency_start_dates[freqIndex].start_date) : null}
                                                                                selected={startDatesArray.year_dates && (startDatesArray.year_dates[index].frequency_start_dates[freqIndex].start_date !== "Invalid date" && startDatesArray.year_dates[index].frequency_start_dates[freqIndex].start_date !== "") ?
                                                                                    new Date(startDatesArray.year_dates[index].frequency_start_dates[freqIndex].start_date) : null}
                                                                                placeholderText="Select Date"
                                                                                onChange={this.props.handleFreqDateChange.bind(this, index, freqIndex)}
                                                                                dateFormat="dd-MMM-yyyy"
                                                                                showMonthDropdown
                                                                                showYearDropdown
                                                                                useShortMonthInDropdown
                                                                                fixedHeight
                                                                                popperModifiers={{
                                                                                    offset: {
                                                                                        enabled: true,
                                                                                        offset: "5px, 10px"
                                                                                    },
                                                                                    preventOverflow: {
                                                                                        enabled: true,
                                                                                        escapeWithReference: false,
                                                                                        boundariesElement: "viewport"
                                                                                    }
                                                                                }}
                                                                                className="form-control ProjInv_date-Input"
                                                                                required={true}
                                                                                disabled={true}
                                                                            />
                                                                            :
                                                                            <img src={calendarIcon} alt='calendarIcon' style={{ width: "15px", float: "right", margin: "5px 5px 5px 0px" }} ></img>
                                                                        }

                                                                    </th>
                                                                </th>
                                                            ))
                                                            : null}
                                                        <th style={{
                                                            padding: "0px"
                                                        }}>

                                                            <p style={{ margin: "7px 0px" }}>  {frequency !== 'yearly' ? <span style={{ cursor: "pointer" }} id={`proj_plus_tot_${index}`} onClick={(e) => { this.expandTotalFrequencyData(index) }}>{expandedTotalIndex === index ? '[-] ' : '[+] '}</span> : null} Year {index + 1}</p>
                                                            <th className="projInv_subHead" style={{ width: '200px' }}>
                                                                {startDatesArray.year_dates && startDatesArray.year_dates[index] && (startDatesArray.year_dates[index].start_date !== "Invalid date" && startDatesArray.year_dates[index].start_date !== "") ?
                                                                    <DatePicker
                                                                        value={startDatesArray.year_dates && startDatesArray.year_dates[index] && (startDatesArray.year_dates[index].start_date !== "Invalid date" && startDatesArray.year_dates[index].start_date !== "") ?
                                                                            new Date(startDatesArray.year_dates[index].start_date) : null}
                                                                        selected={startDatesArray.year_dates && startDatesArray.year_dates[index] && (startDatesArray.year_dates[index].start_date !== "Invalid date" && startDatesArray.year_dates[index].start_date !== "") ?
                                                                            new Date(startDatesArray.year_dates[index].start_date) : null}
                                                                        placeholderText="Select Date"
                                                                        onChange={this.props.handleFreqDateChange.bind(this, index, "yearly")}
                                                                        dateFormat="dd-MMM-yyyy"
                                                                        showMonthDropdown
                                                                        showYearDropdown
                                                                        useShortMonthInDropdown
                                                                        fixedHeight
                                                                        popperModifiers={{
                                                                            offset: {
                                                                                enabled: true,
                                                                                offset: "5px, 10px"
                                                                            },
                                                                            preventOverflow: {
                                                                                enabled: true,
                                                                                escapeWithReference: false,
                                                                                boundariesElement: "viewport"
                                                                            }
                                                                        }}
                                                                        className="form-control ProjInv_date-Input"
                                                                        required={true}
                                                                        disabled={true}
                                                                    // disabled={!this.state.loadTable}
                                                                    />
                                                                    :
                                                                    <img src={calendarIcon} alt='calendarIcon' style={{ width: "15px", float: "right", margin: "5px 5px 5px 0px" }} ></img>
                                                                }
                                                            </th>

                                                        </th>
                                                    </Fragment>
                                                ))}
                                            </tr>
                                        </thead>
                                        {/* {this.state.showTable ? */}
                                        <tbody>
                                            <tr>
                                                <td style={{ width: "23.8%", backgroundColor: '#606060' }}>Total Investments</td>
                                                {totalInvestmentsArray && totalInvestmentsArray.map((option, index) => (
                                                    <Fragment>
                                                        {expandedTotalIndex === index ?
                                                            option.frequency_data.map((frequencyData, fIndex) => (
                                                                < td data-tip={getTooltipData(frequencyData.total_investment_value)} style={{ backgroundColor: '#5A5A5A' }} >
                                                                    <ReactTooltip type="dark" html={true} />
                                                                    <NumberFormat
                                                                        disable={frequency !== 'yearly'}
                                                                        thousandSeparator={true}
                                                                        name="capexcategory"
                                                                        allowNegative={false}
                                                                        id="year"
                                                                        value={
                                                                            // Number(option.total_investment_value).toFixed(1)
                                                                            Number(Math.round(Number(frequencyData.total_investment_value) * 10) / 10).toFixed(1)
                                                                        }
                                                                        style={{ textAlignLast: 'right', backgroundColor: frequency !== 'yearly' ? '#5A5A5A' : '#5B5B5B' }}
                                                                        // onChange={() => this.handleChange(option)}
                                                                        className="form-control-capex"
                                                                        disabled="true"
                                                                    />
                                                                </td>
                                                            )) : null}

                                                        <td data-tip={getTooltipData(option.total_investment_value)} style={{ backgroundColor: '#606060' }} >
                                                            <ReactTooltip type="dark" html={true} />
                                                            <NumberFormat
                                                                thousandSeparator={true}
                                                                name="capexcategory"
                                                                id="year"
                                                                allowNegative={false}
                                                                value={
                                                                    // Number(option.total_investment_value).toFixed(1)
                                                                    Number(Math.round(Number(option.total_investment_value) * 10) / 10).toFixed(1)
                                                                }
                                                                style={{ textAlignLast: 'right', backgroundColor: '#606060' }}
                                                                // onChange={() => this.handleChange(option)}
                                                                className="form-control-capex"
                                                                disabled={true}
                                                            />

                                                        </td>
                                                    </Fragment>
                                                ))
                                                }

                                            </tr>
                                        </tbody>
                                        {/* : null} */}

                                    </table>
                                </div>
                            </div >

                            < div className="col-sm-12 table-width-holder" >
                                <div className="ia-table-responsive invActuals-table-scroll" style={{ overflowX: 'auto', width: "100%" }}>
                                    <table className="table" style={{
                                        marginTop: "2%",
                                        marginBottom: "0%",
                                        width:
                                            //  this.props.isExpandBenefits ? '' : 
                                            'unset',
                                        tableLayout: this.props.isExpandBenefits ? 'fixed' : ''
                                    }}>
                                        <thead style={{ whiteSpace: 'nowrap' }}>
                                            <tr>
                                                <th style={{ padding: "20px 22px" }}>Cost Category</th>
                                                <th style={{ padding: "12px 4px" }}>Capex /<br />Opex split</th>
                                                <th style={{ padding: "12px 4px" }}>KPIs<br />Linked</th>
                                                {totalInvestmentsArray && totalInvestmentsArray.map((option, index) => (
                                                    <Fragment>
                                                        {expandedActualIndex === index ?
                                                            frequenciesToDisplay.map((frequency, freqIndex) => (
                                                                <th style={{ padding: "0px" }}>
                                                                    <p style={{ margin: "7px 0px" }}>{frequency} </p>
                                                                    <th className="projInv_subHead" style={{ width: '200px', backgrounColor: '#e9ecef' }}>
                                                                        {startDatesArray.year_dates && (startDatesArray.year_dates[index].frequency_start_dates[freqIndex].start_date !== "" && startDatesArray.year_dates[index].frequency_start_dates[freqIndex].start_date !== "Invalid date") ?
                                                                            <DatePicker
                                                                                value={startDatesArray.year_dates && (startDatesArray.year_dates[index].frequency_start_dates[freqIndex].start_date !== "" && startDatesArray.year_dates[index].frequency_start_dates[freqIndex].start_date !== "Invalid date") ?
                                                                                    new Date(startDatesArray.year_dates[index].frequency_start_dates[freqIndex].start_date) : null}
                                                                                selected={startDatesArray.year_dates && (startDatesArray.year_dates[index].frequency_start_dates[freqIndex].start_date !== "" && startDatesArray.year_dates[index].frequency_start_dates[freqIndex].start_date !== "Invalid date") ?
                                                                                    new Date(startDatesArray.year_dates[index].frequency_start_dates[freqIndex].start_date) : null}
                                                                                placeholderText="Select Date"
                                                                                id={`proj_inv_date_Y${index + 1}_freq_${freqIndex}`}
                                                                                onChange={this.props.handleFreqDateChange.bind(this, index, freqIndex)}
                                                                                dateFormat="dd-MMM-yyyy"
                                                                                showMonthDropdown
                                                                                showYearDropdown
                                                                                useShortMonthInDropdown
                                                                                fixedHeight
                                                                                popperModifiers={{
                                                                                    offset: {
                                                                                        enabled: true,
                                                                                        offset: "5px, 10px"
                                                                                    },
                                                                                    preventOverflow: {
                                                                                        enabled: true,
                                                                                        escapeWithReference: false,
                                                                                        boundariesElement: "viewport"
                                                                                    }
                                                                                }}
                                                                                className="form-control ProjInv_date-Input"
                                                                                required={true}

                                                                            />
                                                                            :
                                                                            <img src={calendarIcon} alt='calendarIcon' style={{ width: "15px", float: "right", margin: "5px 5px 5px 0px" }} ></img>
                                                                        }
                                                                    </th></th>
                                                            ))
                                                            : null}
                                                        <th style={{ padding: "0px" }}>
                                                            <p style={{ margin: "7px 0px" }}>{frequency !== 'yearly' ? <span style={{ cursor: "pointer" }} id={`proj_plus_Y${index + 1}`} onClick={(e) => { this.expandFrequencyActualData(index) }}>{expandedActualIndex === index ? '[-] ' : '[+] '}</span> : null} Year {index + 1}</p>
                                                            <th className="projInv_subHead" style={{ width: '200px' }}>
                                                                {startDatesArray.year_dates && startDatesArray.year_dates[index] && (startDatesArray.year_dates[index].start_date !== "Invalid date" && startDatesArray.year_dates[index].start_date !== "") ?
                                                                    <DatePicker
                                                                        value={startDatesArray.year_dates && startDatesArray.year_dates[index] && (startDatesArray.year_dates[index].start_date !== "Invalid date" && startDatesArray.year_dates[index].start_date !== "") ?
                                                                            new Date(startDatesArray.year_dates[index].start_date) : null}
                                                                        selected={startDatesArray.year_dates && startDatesArray.year_dates[index] && (startDatesArray.year_dates[index].start_date !== "Invalid date" && startDatesArray.year_dates[index].start_date !== "") ?
                                                                            new Date(startDatesArray.year_dates[index].start_date) : null}
                                                                        placeholderText="Select Date"
                                                                        id={`proj_inv_date_Y${index + 1}`}
                                                                        onChange={this.props.handleFreqDateChange.bind(this, index, "yearly")}
                                                                        dateFormat="dd-MMM-yyyy"
                                                                        showMonthDropdown
                                                                        showYearDropdown
                                                                        useShortMonthInDropdown
                                                                        fixedHeight
                                                                        popperModifiers={{
                                                                            offset: {
                                                                                enabled: true,
                                                                                offset: "5px, 10px"
                                                                            },
                                                                            preventOverflow: {
                                                                                enabled: true,
                                                                                escapeWithReference: false,
                                                                                boundariesElement: "viewport"
                                                                            }
                                                                        }}
                                                                        className="form-control ProjInv_date-Input"
                                                                        required={true}
                                                                        disabled={frequency !== 'yearly'}
                                                                    />
                                                                    :
                                                                    <img src={calendarIcon} alt='calendarIcon' style={{ width: "15px", float: "right", margin: "5px 5px 5px 0px" }} ></img>
                                                                }

                                                            </th>
                                                        </th>
                                                    </Fragment>
                                                ))}

                                                <div className="d-inline-block align-top col-cm-2" style={{ width: 'auto', paddingLeft: '0.5rem' }}>
                                                    {selected_option === 'delivery' && this.getYearsArray().length < 10 && initiatives.length > 0 ?
                                                        <img src={rectPlusIcon} alt="" onClick={this.addNewYear} style={{ cursor: 'pointer' }}
                                                            data-tip="" data-for="add_year_tooltip" data-place="left"
                                                        >
                                                        </img> : ''}
                                                    {this.getYearsArray().length > 5 &&
                                                        <span style={{ paddingLeft: '0.2rem' }}>
                                                            {' '} <img src={trashIcon} alt="" style={{ cursor: 'pointer', height: '16px' }}
                                                                onClick={this.deleteTargetColumnHandler}
                                                                data-tip="" data-for="delete_year_tooltip" data-place="left" />
                                                            <ReactTooltip id="delete_year_tooltip" className="tooltip-class">
                                                                <span>Delete Year</span>
                                                            </ReactTooltip>
                                                        </span>
                                                    }
                                                    <ReactTooltip id="add_year_tooltip" className="tooltip-class">
                                                        <span>Add Year</span>
                                                    </ReactTooltip>

                                                </div>

                                            </tr>
                                        </thead>
                                        <tbody>
                                            {/*  */}
                                            {(initiatives && initiatives.map((option, index) => (
                                                <tr>
                                                    <td style={{ width: "10%", backgroundColor: '#4D4D4D' }} data-tip={getTooltipText(option.initiative_name)}>
                                                        <input
                                                            disabled
                                                            type="text"
                                                            name="capexcategory"
                                                            id={option}
                                                            value={option.initiative_name}
                                                            style={{ width: "100%", backgroundColor: '#4D4D4D', textAlignLast: 'left' }}
                                                            // onChange={(e) => this.handleNameChange(option.init_id, e.target.value, index)}
                                                            className="form-control-capex"
                                                        />
                                                        <ReactTooltip type="dark" html={true} />
                                                    </td>
                                                    <td style={{ textAlignLast: "end", backgroundColor: '#4D4D4D' }}>
                                                        <input
                                                            type="text"
                                                            style={{ width: '80%', border: 'none', backgroundColor: '#4D4D4D' }}
                                                            className="form-control-capex"
                                                            disabled
                                                            value={option.capex_inv_percent !== "" || option.opex_inv_percent !== "" ? option.capex_inv_percent !== "" ? 'Cap...' : 'Ope...' : ''} />
                                                        <i className="fa fa-caret-down" aria-hidden="true" style={{
                                                            cursor: "pointer",
                                                        }}
                                                            id={`proj_inv_${option.initiative_name}_capex`}
                                                            onClick={(e) => this.onCapexDrillClick(option.init_id, index)}></i>
                                                        <Modal id="capexInv" className="capex-actuals-modal" visible={option.init_id === parseInt(iniId) || capexIndex === index} >
                                                            <div className="row">
                                                                <div className="modalStyles" style={{ textAlignLast: "center", marginTop: "5px", marginLeft: '2%', fontSize: '12px' }}>Indicate Capex/Opex split</div>
                                                                <img data-tip="" data-for="close-tooltip" data-place="right" src={modalCloseIcon} alt="" className="close" aria-label="Close" onClick={this.capexCloseWithoutSave} style={{ marginLeft: '18%', cursor: 'pointer' }}>

                                                                </img>
                                                                <ReactTooltip id="close-tooltip" className="tooltip-class"> <span>Close</span></ReactTooltip>
                                                            </div>
                                                            <table className="table" style={{ margin: "2%", width: "95.5%" }}>
                                                                <thead style={{ whiteSpace: 'nowrap' }}>
                                                                    <tr>
                                                                        <th>Cost Type</th>
                                                                        <th> % cost allocated</th>
                                                                    </tr>
                                                                </thead>
                                                                <tbody>
                                                                    <tr>
                                                                        <td style={{ textAlignLast: "left", paddingLeft: "6px" }}>Capex</td>
                                                                        <td>
                                                                            <input
                                                                                type="number"
                                                                                name={`proj_${option.initiative_name}`}
                                                                                id="proj_capex"
                                                                                min="0"
                                                                                style={{ width: "98px", border: "0px", backgroundColor: '#4D4D4D' }}
                                                                                defaultValue={Math.abs(option.capex_inv_percent)}
                                                                            // onChange={(e) => this.capexChangePerc(option.init_id, e.target.value, index)} 
                                                                            />
                                                                        </td>
                                                                    </tr>
                                                                    <tr>
                                                                        <td style={{ textAlignLast: "left", paddingLeft: "6px" }}>Opex</td>
                                                                        <td>
                                                                            <input
                                                                                type="number"
                                                                                name={`proj_${option.initiative_name}`}
                                                                                id="proj_opex"
                                                                                min="0"
                                                                                style={{ width: "98px", border: "0px", backgroundColor: '#4D4D4D' }}
                                                                                defaultValue={Math.abs(option.opex_inv_percent)}
                                                                            />
                                                                        </td>
                                                                    </tr>
                                                                </tbody>
                                                            </table>
                                                            <button className="btn btn-primary" style={{ textAlignLast: "center", fontSize: '10px', cursor: "pointer", maxWidth: "50px", marginLeft: "87px" }} onClick={(e) => this.onCapexModalClose(option.init_id, index)}>OK</button>
                                                        </Modal>
                                                    </td>
                                                    <td style={{ textAlignLast: "end", backgroundColor: '#4D4D4D' }}>
                                                        <input
                                                            type="text"
                                                            style={{ width: '80%', border: 'none', backgroundColor: '#4D4D4D' }}
                                                            className="form-control-capex"
                                                            disabled
                                                            value={option.linkedValue && option.linkedValue.substring(0, 3) + '...'} />
                                                        <i className="fa fa-caret-down" aria-hidden="true" style={{
                                                            cursor: "pointer",
                                                        }}
                                                            id={`proj_inv_${option.initiative_name}_linkedkpi`}
                                                            onClick={(e) => this.onKpiModalOpen(index, option.init_id)}
                                                        ></i>

                                                        <Modal id="inv" className="kpi-actuals-modal" visible={(option.init_id === parseInt(init_id) || parseInt(modalIndex) === index)}>
                                                            <div className="row">
                                                                <div className="modalStyles" style={{ marginTop: "5px", textAlignLast: "center", marginLeft: '7%' }}>Select KPIs and enter cost allocated</div>
                                                                <img data-tip="" data-for="close-tooltip" data-place="right" src={modalCloseIcon} alt="" className="close" aria-label="Close" onClick={this.kpiCloseWithoutSave} style={{ marginLeft: '40%', cursor: 'pointer' }}>

                                                                </img>
                                                                <ReactTooltip id="close-tooltip" className="tooltip-class"> <span>Close</span></ReactTooltip>
                                                            </div>
                                                            <table className="table" style={{ margin: "2%", width: "95.5%" }}>
                                                                <thead style={{ whiteSpace: 'nowrap' }}>
                                                                    <tr>
                                                                        <th style={{ width: '50%' }}>KPIs Linked</th>
                                                                        <th> % cost allocated</th>
                                                                    </tr>
                                                                </thead>
                                                                <tbody>
                                                                    {option.linked_kpis && option.linked_kpis.map((kpi, kpiIndex) => (
                                                                        <tr>
                                                                            <td >
                                                                                <div style={{ display: "flex" }}>
                                                                                    <input type="checkbox"
                                                                                        style={{ margin: "8px 1px 1px 4px", textAlignLast: 'left' }}
                                                                                        defaultChecked={kpi.checked}
                                                                                        name={`check_proj_${option.initiative_name}`}
                                                                                        id={`check_proj_${kpi.kpi_name}`}
                                                                                    />
                                                                                    <p style={{ margin: "4px 1px 1px 2px" }}> {kpi.kpi_name}</p>
                                                                                </div>
                                                                            </td>
                                                                            <td>
                                                                                <input
                                                                                    type="number"
                                                                                    name={`proj_${option.initiative_name}`}
                                                                                    id={`proj_${kpi.kpi_name}`}
                                                                                    min="0"
                                                                                    style={{ width: "98px", border: "0px" }}
                                                                                    defaultValue={kpi.cost_allocated_percent ? Math.abs(kpi.cost_allocated_percent) : ''}
                                                                                />
                                                                            </td>
                                                                        </tr>
                                                                    ))}
                                                                </tbody>
                                                            </table>
                                                            <button className="btn btn-primary" style={{ textAlignLast: "center", fontSize: '10px', cursor: "pointer", maxWidth: "50px", marginLeft: "160px" }} onClick={(e) => this.onKpiModalClose(index)}>OK</button>
                                                        </Modal>
                                                    </td>
                                                    {
                                                        option.year && option.year.map((year, index1) => (
                                                            <Fragment>
                                                                {expandedActualIndex !== false ? (expandedActualIndex + 1) === year.year_no ?
                                                                    year.frequency_data.map((frequencyYear, frequecyIndex) => (
                                                                        <td
                                                                            style={{ width: "13%", backgroundColor: '#4D4D4D' }}
                                                                            data-tip={getTooltipData(frequencyYear.inv_val && frequencyYear.inv_val.actualValue ? frequencyYear.inv_val.actualValue : null)} >
                                                                            <ReactTooltip type="dark" html={true} />
                                                                            <NumberFormat
                                                                                // disable={frequency !== 'yearly'}
                                                                                thousandSeparator={true}
                                                                                name="capexcategory"
                                                                                id={`proj_inv_${option.initiative_name}_Y${index1 + 1}_freq_${frequecyIndex}`}
                                                                                allowNegative={false}
                                                                                style={{ textAlignLast: 'right', backgroundColor: '#4D4D4D' }}
                                                                                value={frequencyYear.inv_val && (frequencyYear.inv_val.formattedValue > 0 ? frequencyYear.inv_val.formattedValue : (frequencyYear.inv_val.actualValue === null || frequencyYear.inv_val.actualValue === 0 || frequencyYear.inv_val.actualValue === "" ? "" :
                                                                                    //  ? year.inv_val.actualValue / frequency_no 

                                                                                    //  Number(year.inv_val.actualValue).toFixed(1)
                                                                                    Number(Math.round(Number(frequencyYear.inv_val.actualValue) * 10) / 10).toFixed(1)
                                                                                ))}
                                                                                onChange={(e) => this.handleInvestmentValueChange(option.init_id, e.target.value, year.year_no, frequecyIndex)}
                                                                                onFocus={(event) => this.onInputFocus(option.init_id, event.target.value, frequencyYear.year_no, frequecyIndex)}
                                                                                onBlur={(event) => this.onInputBlur(option.init_id, event.target.value, frequencyYear.year_no, frequecyIndex)}
                                                                                className="form-control-capex"
                                                                            // disabled={true}

                                                                            />
                                                                        </td>
                                                                    )) : null : null}
                                                                < td
                                                                    style={{ width: "13%", backgroundColor: frequency === "yearly" ? '#4D4D4D' : '#5A5A5A' }}
                                                                    data-tip={getTooltipData(year.inv_val && year.inv_val.actualValue ? year.inv_val.actualValue : null)} >
                                                                    <ReactTooltip type="dark" html={true} />
                                                                    <NumberFormat
                                                                        disabled={frequency !== 'yearly'}
                                                                        thousandSeparator={true}
                                                                        name="capexcategory"
                                                                        id={`proj_inv_${option.initiative_name}_Y${index1 + 1}`}
                                                                        allowNegative={false}
                                                                        style={{ textAlignLast: 'right', backgroundColor: frequency === "yearly" ? '#4D4D4D' : '#5A5A5A' }}
                                                                        value={year.inv_val && (year.inv_val.formattedValue > 0 ? year.inv_val.formattedValue : (year.inv_val.actualValue === null || year.inv_val.actualValue === 0 || year.inv_val.actualValue === '' ? "" :
                                                                            //  Number(year.inv_val.actualValue).toFixed(1)
                                                                            Number(Math.round(Number(year.inv_val.actualValue) * 10) / 10).toFixed(1)
                                                                        ))}
                                                                        onChange={(e) => this.handleInvestmentValueChange(option.init_id, e.target.value, year.year_no, index1)}
                                                                        onFocus={(event) => this.onInputFocus(option.init_id, event.target.value, year.year_no, index1)}
                                                                        onBlur={(event) => this.onInputBlur(option.init_id, event.target.value, year.year_no, index1)}
                                                                        className="form-control-capex"


                                                                    />
                                                                </td>
                                                            </Fragment>
                                                        ))
                                                    }

                                                </tr>
                                            )))
                                            }

                                            {/*  */}
                                        </tbody>
                                    </table>
                                </div>
                            </div >

                        </Fragment> : <div className="row justify-content-center" style={{ height: '50px', marginLeft: '50%' }}>
                            {/* <h4> <i className="fa fa-exclamexpandeation-triangle"></i> No data to load</h4> */}
                            <i className="fa fa-spinner fa-spin" style={{ fontSize: '18px', color: '#ffffff', height: "min-content" }}></i>
                        </div>}
                </div >
                <CustomConfirmModal
                    ownClassName={'BenefitActuals-delete-modal'}
                    isModalVisible={this.state.customFreqInvActualsModalVisible}
                    modalTitle={this.state.customFreqInvActualsModalTitle}
                    closeConfirmModal={this.closeInvActualsFreqConfirmModalHandler}
                />
            </Fragment >)
    }
}

export default withRouter(ProjectedInvestments);








