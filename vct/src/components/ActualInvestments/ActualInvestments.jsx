import React, { Component, Fragment } from 'react';
import { withRouter } from "react-router-dom";
import '../../containers/ProjectedInvestments/projectedInvestments.css';
import { toast } from 'react-toastify';
import NotificationMessage from '../../components/NotificationMessage/NotificationMessage';
import { observer, inject } from 'mobx-react';
import NumberFormat from 'react-number-format';
import ReactTooltip from 'react-tooltip';
import Modal from 'react-bootstrap4-modal';
import DatePicker from "react-datepicker";
import rectPlusIcon from "../../assets/project/iActuals/add-year.svg";
import trashIcon from "../../assets/project/iActuals/trash-can.svg";
import circPlusIcon from "../../assets/project/iActuals/add-plus-circle.svg";
import modalCloseIcon from "../../assets/project/fvdt/modal-close-icon.svg";
import calendarIcon from "../../assets/project/fvdt/calendar.svg";
var SessionStorage = require('store/storages/sessionStorage');

@inject('investmentActualsStore')
@observer
class ActualInvestments extends Component {
    constructor(props) {
        super(props);
        this.state = {
            result: {},
            rows: [],
            max_capex_year: 0,
            max_opex_year: 0,
            isCapexExpand: false,
            isOpexExpand: false,
            isCapexOpen: false,
            isKpiModalOpen: false,
            testResult: {},
            initiatives: [],
            linkedKPIIds: [],
            init_id: '',
            iniId: '',
            checkedVal: '',
            tempResult: [],
            modalIndex: '',
            capexIndex: '',
            del_init_id_ls: [],
            expandedIndex: false,
            expandedActualIndex: false,
            showTable: false,
            newYearAdded: false
        }
        this.saveInvestment = this.saveInvestment.bind(this);
        this.handleAddRow = this.handleAddRow.bind(this);
        this.onCapexModalClose = this.onCapexModalClose.bind(this);
        this.onKpiModalClose = this.onKpiModalClose.bind(this);
        this.onCapexDrillClick = this.onCapexDrillClick.bind(this);
        this.handleInvestmentValueChange = this.handleInvestmentValueChange.bind(this);
        this.calculateTotalInvestments = this.calculateTotalInvestments.bind(this);
        this.capexCloseWithoutSave = this.capexCloseWithoutSave.bind(this);
        this.kpiCloseWithoutSave = this.kpiCloseWithoutSave.bind(this);
        this.test = this.test.bind(this);
        // this.childMethod = this.childMethod.bind(this);
        this.addNewYear = this.addNewYear.bind(this);
        this.expandTotalFrequencyActualData = this.expandTotalFrequencyActualData.bind(this)

    }
    // childMethod() {
    //     alert("child component alert");
    // }

    componentDidMount() {
        // this.fetchInvestments();
        if (this.props.saveInvestments) {
            this.saveInvestment()
        }
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
        }

        if (prevProps.saveInvestments !== this.props.saveInvestments && this.props.saveInvestments === true) {
            this.saveInvestment();
        }

        if (prevProps.newActualYear !== this.props.newActualYear) {
            if (this.props.newActualYear === true) {
                this.addNewYear()
            }
        }

        if (prevProps.deletedActualYear !== this.props.deletedActualYear) {
            if (this.props.deletedActualYear === true) {
                this.deleteTargetColumnHandler()
            }
        }
    }

    test() {
        this.setState({
            result: this.props.result,
            initiatives: [...this.props.initiatives],
            linkedKPIIds: [...this.props.linkedKPIIds],
            addClicked: this.props.addClicked,
            totalInvestmentsArray: [...this.props.totalInvestmentsArray]
        })
    }

    fetchInvestments() {
        let res = this.props.getInvestments()
        if (res) {
            this.setState({
                result: this.props.result,
                initiatives: this.props.initiatives,
                linkedKPIIds: this.props.linkedKPIIds,
                addClicked: this.props.addClicked,
            })
        }

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
                // this.props.totalInvFormat()
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
                this.props.isDeleteClicked(true)
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
                    this.showNotification("displayError", ("Total percentage of Capex and Opex should be 100"))
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
                        this.showNotification("displayError", "Total percentage of Capex and Opex should be 100")
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
                        this.showNotification("displayError", "Please enter the value(s) to the KPI(s) selected")
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
                            this.showNotification("displayError", "Please enter the value(s) to the KPI(s) selected")
                        }

                    }
                }
            }
        }
        if (total !== 100) {
            // alert("Total percentage of linked KPIs should be 100")
            this.showNotification("displayError", "Total percentage of linked KPIs should be 100")

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
                    bodytext={'Please check the values and save again'}
                    icon="success"
                />, {
                    position: toast.POSITION.BOTTOM_RIGHT
                });
                break;
            case 'displayError':
                var Message = '';

                switch (message) {
                    case 'duplicate initiative name':
                        Message = 'Please check duplicate Data entered for Initiative';
                        break;
                    case 'null initiative name':
                        Message = 'Please fill the columns : Initiative name';
                        break;
                    default:
                        Message = message;
                        break;

                }


                toast.error(<NotificationMessage
                    title="Error"
                    bodytext={Message}
                    icon="error"
                />, {
                    position: toast.POSITION.BOTTOM_RIGHT
                });
                break;
            default:
                break;
        }
    }

    capexCloseWithoutSave() {

        this.setState({
            isCapexOpen: false,
            iniId: '',
            capexIndex: ''
        })
    }

    formatStartDates(startDatesArray) {
        const { investmentActualsStore } = this.props;
        let frequency = investmentActualsStore.frequency
        if (startDatesArray.main_start_date === "Invalid date") {
            startDatesArray.main_start_date = ""
        }
        startDatesArray.year_dates.map((value, index) => {
            if (value.start_date === "Invalid date") {
                value.start_date = ""
            }
            if (frequency !== 'yearly') {
                value.frequency_start_dates.map((freqVal) => {
                    if (freqVal.start_date === "Invalid date") {
                        freqVal.start_date = ""
                    }
                })
            }

        })
        return startDatesArray
    }



    saveInvestment() {
        const { investmentActualsStore } = this.props;
        let frequency = investmentActualsStore.frequency
        const { result, initiatives } = this.state;
        const { projectedResult } = investmentActualsStore;
        let err = 0;
        if (this.validateInputs()) {
            for (let i = 0; i < initiatives.length; i++) {
                if (RegExp(/[<>!'"[\]]/).test(initiatives[i].initiative_name)) {
                    err = err + 1;
                }
                if (initiatives[i].init_id === null) {
                    initiatives[i].init_id = ""
                }
                for (let j = 0; j < initiatives[i].linked_kpis.length; j++) {
                    delete initiatives[i].linked_kpis[j].checked
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
                    else {
                        if (result.initiatives[i].year[k].frequency_data && result.initiatives[i].year[k].frequency_data.length === 0) {
                            delete result.initiatives[i].year[k].frequency_data
                        }
                    }
                    if (initiatives[i].linkedValue) {
                        delete initiatives[i].linkedValue
                    }
                }
            }
            for (let i = 0; i < initiatives.length; i++) {
                initiatives[i].initiative_name = initiatives[i].initiative_name.trim();
            }
            let KPI_list = result.KPI_list
            delete result.KPI_list
            let projectedInvestments = {
                initiatives: projectedResult.initiatives,
                investments: projectedResult.investments
            }

            let datesArray = this.formatStartDates(this.props.startDatesArray)

            if (err === 0) {
                this.props.setSaveProgress(true)
                let payload = {
                    "KPI_list": KPI_list,
                    "actual_investments": result,
                    "frequency": investmentActualsStore.frequency,
                    "map_id": SessionStorage.read("map_id"),
                    "projected_investments": projectedInvestments,
                    "start_date": datesArray
                }
                investmentActualsStore.saveActualProjectedInvestments(payload)
                    .then((response) => {
                        if (response && !response.error) {
                            if (response.data.resultCode === "OK") {
                                // this.fetchInvestments();
                                this.showNotification('saveInvestmentSuccess')
                                SessionStorage.write('investmentsTab', true)
                                this.setState({
                                    newYearAdded: false
                                })
                                // window.location.reload();
                                this.props.setSaveProgress(false)
                                this.props.getInvestments();
                            }
                            else {
                                if (response.data.resultCode === "KO") {
                                    
                                    this.fetchInvestments();
                                    this.showNotification('displayError', response.data.error)
                                }
                                this.props.setSaveProgress(false)
                            }
                            return response
                        }
                        else {
                            this.props.setSaveProgress(false)
                            this.fetchInvestments();
                            this.showNotification("error")
                        }
                    }
                    )
            }
            else {
                this.fetchInvestments();
                this.showNotification('displayError', 'Please enter valid value for Cost Category. Special characters [ < ! \' " > ] are invalid');
            }
        }
        this.props.saveClicked(false)
    }

    validateInputs() {
        const { result } = this.state;
        for (let i = 0; i < result.initiatives.length; i++) {
            let total = 0;
            for (let j = 0; j < result.initiatives[i].linked_kpis.length; j++) {
                total = total + (result.initiatives[i].linked_kpis[j].cost_allocated_percent && result.initiatives[i].linked_kpis[j].cost_allocated_percent !== "" ? result.initiatives[i].linked_kpis[j].cost_allocated_percent : 0)
            }
            if (total !== 100) {
                // alert("for Initiative " + result.initiatives[i].initiative_name + " total percentage of linked KPIs is not 100")
                this.showNotification("displayError", ("for Initiative " + result.initiatives[i].initiative_name + " total percentage of linked KPIs is not 100"))
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
                this.showNotification("displayError", ("for Initiative " + result.initiatives[i].initiative_name + " total percentage of Capex/Opex is not 100"))
                return false
            }

        }
        return true

    }


    handleAddRow(event) {
        event.preventDefault();
        let addRow = {};
        addRow = this.state.result;
        let yearIndex = this.getYearsArray().length
        let linkedKPIs = []
        const { investmentActualsStore } = this.props;
        const { frequency } = investmentActualsStore
        let freqData = []
        // let tempResult = addRow
        for (let i = 0; i < addRow.KPI_list.length; i++) {
            let kpi = {
                kpi_id: addRow.KPI_list[i].kpi_id,
                kpi_name: addRow.KPI_list[i].operational_kpi,
                cost_allocated_percent: '',
                checked: false
            }
            linkedKPIs.push(kpi)
        }
        let yearsArray = [];
        for (let j = 0; j < this.getYearsArray().length; j++) {
            if (frequency === 'fortnightly') {
                freqData = []
                for (let i = 0; i < 26; i++) {
                    let tempObj = {
                        'fortnight_no': (j * 26 + i + 1),
                        "inv_val": {
                            "actualValue": '',
                            "formattedValue": 0
                        }
                    }
                    freqData.push(tempObj)
                }
            } else if (frequency === 'monthly') {
                freqData = []
                for (let i = 0; i < 12; i++) {
                    let tempObj = {
                        'month_no': (j * 12 + i + 1),
                        "inv_val": {
                            "actualValue": '',
                            "formattedValue": 0
                        }
                    }
                    // let totalObj = {
                    //     'month_no': i + 1,
                    //     // 'total_investment_value': TempInvArray[i].total_investment_value / 12
                    // }
                    // totalArray.push(totalObj)
                    freqData.push(tempObj)
                }
            } else if (frequency === 'quarterly') {
                freqData = []
                for (let i = 0; i < 4; i++) {
                    let tempObj = {
                        'quarter_no': (j * 4 + i + 1),
                        "inv_val": {
                            "actualValue": '',
                            "formattedValue": 0
                        }
                    }
                    // let totalObj = {
                    //     'quarter_no': i + 1,
                    //     'total_investment_value': TempInvArray[i].total_investment_value / 4
                    // }
                    // totalArray.push(totalObj)
                    freqData.push(tempObj)
                }
            }
            const obj = {
                "year_no": j + 1,
                "inv_val": {
                    'actualValue': "",
                    'formattedValue': 0
                },
                frequency_data: freqData
            }
            yearsArray.push(obj);
        }

        let testResult = {
            'capex_inv_percent': "",
            "init_id": null,
            "initiative_name": "",
            "linked_kpis": linkedKPIs,
            'opex_inv_percent': '',
            "year": yearsArray
        }

        addRow.initiatives.push(testResult);
        this.setState({
            result: { ...addRow },
            initiatives: [...addRow.initiatives],

        }, () => {
            // this.capexFormat();
        });

    }

    capexChangePerc(init_id, value, index) {
        const { investmentActualsStore } = this.props
        const { result } = this.state
        let tempResult = result
        investmentActualsStore.tempResult = tempResult
        let newResult = result
        for (let i = 0; i < newResult.initiatives.length; i++) {
            if (init_id === null && index === i) {
                newResult.initiatives[i].capex_inv_percent = value === "" ? "" : value.indexOf('.') === value.length - 1 ? value : Number(value)
            }
            else if (init_id !== null) {
                if (init_id === newResult.initiatives[i].init_id) {
                    newResult.initiatives[i].capex_inv_percent = value === "" ? "" : value.indexOf('.') === value.length - 1 ? value : Number(value)
                }
            }
        }

        this.setState({
            result: newResult,
            initiatives: newResult.initiatives
        })

    }

    opexChangePerc(init_id, value, index) {
        const { investmentActualsStore } = this.props
        const { result } = this.state
        let tempResult = result
        investmentActualsStore.tempResult = tempResult
        let newResult = result
        for (let i = 0; i < newResult.initiatives.length; i++) {
            if (init_id === null && index === i) {
                newResult.initiatives[i].opex_inv_percent = value === "" ? "" : value.indexOf('.') === value.length - 1 ? value : Number(value)
            }
            else if (init_id !== null) {
                if (init_id === newResult.initiatives[i].init_id) {
                    newResult.initiatives[i].opex_inv_percent = value === "" ? "" : value.indexOf('.') === value.length - 1 ? value : Number(value)
                }
            }
        }
        this.setState({
            result: newResult,
            initiatives: newResult.initiatives
        })
    }

    linkedKPIChecked(checked, init_id, kpi_id, index, kpiIndex) {
        const { result } = this.state
        let newResult = result
        for (let i = 0; i < newResult.initiatives.length; i++) {
            if (init_id === null && index === i) {
                for (let j = 0; j < result.initiatives[i].linked_kpis.length; j++) {
                    if (kpiIndex === j) {
                        if (checked) {
                            newResult.initiatives[i].linked_kpis[j].checked = true
                        }
                        else {
                            newResult.initiatives[i].linked_kpis[j].checked = false
                            newResult.initiatives[i].linked_kpis[j].cost_allocated_percent = ''
                        }
                    }
                }
            }
            else if (init_id !== null) {
                if (init_id === newResult.initiatives[i].init_id) {
                    for (let j = 0; j < newResult.initiatives[i].linked_kpis.length; j++) {
                        if (kpi_id === newResult.initiatives[i].linked_kpis[j].kpi_id) {
                            if (checked) {
                                newResult.initiatives[i].linked_kpis[j].checked = true
                            }
                            else {
                                newResult.initiatives[i].linked_kpis[j].checked = false
                                newResult.initiatives[i].linked_kpis[j].cost_allocated_percent = ''
                            }
                        }
                    }
                }
            }
            this.setState({
                result: newResult,
                initiatives: newResult.initiatives
            })

        }
    }

    linkedKPIValueChange(init_id, kpi_id, value, index, kpiIndex) {
        const { result } = this.state
        let newResult = result
        for (let i = 0; i < newResult.initiatives.length; i++) {
            if (init_id === null && index === i) {
                for (let j = 0; j < newResult.initiatives[i].linked_kpis.length; j++) {
                    if (kpiIndex === j) {
                        newResult.initiatives[i].linked_kpis[j].cost_allocated_percent = value === "" ? "" : parseInt(value)
                    }
                }
            }
            else if (init_id !== null) {
                if (init_id === newResult.initiatives[i].init_id) {
                    for (let j = 0; j < newResult.initiatives[i].linked_kpis.length; j++) {
                        if (kpi_id === newResult.initiatives[i].linked_kpis[j].kpi_id) {
                            newResult.initiatives[i].linked_kpis[j].cost_allocated_percent = value === "" ? "" : parseInt(value)
                        }
                    }
                }
            }
        }
        this.setState({
            result: newResult,
            initiatives: newResult.initiatives
        })
    }

    handleNameChange(init_id, value, index) {
        const { result } = this.state
        let newResult = result
        for (let i = 0; i < newResult.initiatives.length; i++) {
            if (init_id === null && index === i) {
                newResult.initiatives[i].initiative_name = value
            }
            else if (init_id !== null) {
                if (init_id === newResult.initiatives[i].init_id) {
                    newResult.initiatives[i].initiative_name = value
                }
            }
        }
        this.setState({
            result: newResult,
            initiatives: newResult.initiatives
        })
    }



    handleInvestmentValueChange(init_id, value, idx, year_no, index) {
        const { result } = this.state
        const { investmentActualsStore } = this.props
        let frequency = investmentActualsStore.frequency
        let value1 = value.replace(/,/g, '')
        let newResult = result
        let regex = /^(?!00)\d+\.0{1,}\d*$/
        for (let i = 0; i < newResult.initiatives.length; i++) {
            if (init_id === null && idx === i) {
                if (value1 === '0') {
                    if (frequency === 'yearly') {
                        newResult.initiatives[i].year[year_no - 1].inv_val = {
                            'actualValue': "0",
                            'formattedValue': 0
                        }
                    } else {
                        newResult.initiatives[i].year[year_no - 1].frequency_data[index].inv_val.actualValue = "0"
                        newResult.initiatives[i].year[year_no - 1].frequency_data[index].inv_val.formattedValue = 0
                    }
                } else {
                    if (frequency === 'yearly') {
                        newResult.initiatives[i].year[year_no - 1].inv_val = {
                            'actualValue': value1 === "" ? "" : value1.indexOf('.') === value1.length - 1 ? value1 : regex.test(value1) ? value1 : Number(value1),
                            'formattedValue': value1 === "" ? "" : value1.indexOf('.') === value1.length - 1 ? value1 : regex.test(value1) ? value1 : Number(value1)
                        }
                    } else {
                        newResult.initiatives[i].year[year_no - 1].frequency_data[index].inv_val.actualValue = value1 === "" ? "" : value1.indexOf('.') === value1.length - 1 ? value1 : regex.test(value1) ? value1 : Number(value1)
                        newResult.initiatives[i].year[year_no - 1].frequency_data[index].inv_val.formattedValue = value1 === "" ? "" : value1.indexOf('.') === value1.length - 1 ? value1 : regex.test(value1) ? value1 : Number(value1)
                    }
                }
            }
            else if (init_id !== null) {
                if (newResult.initiatives[i].init_id === init_id) {
                    if (value1 === '0') {
                        if (frequency === 'yearly') {
                            newResult.initiatives[i].year[year_no - 1].inv_val = {
                                'actualValue': "0",
                                'formattedValue': 0
                            }
                        } else {
                            newResult.initiatives[i].year[year_no].frequency_data[index].inv_val.actualValue = '0'
                            newResult.initiatives[i].year[year_no].frequency_data[index].inv_val.formattedValue = 0
                        }
                    } else {

                        if (frequency === 'yearly') {
                            newResult.initiatives[i].year[year_no - 1].inv_val.actualValue = value1 === "" ? "" : value1.indexOf('.') === value1.length - 1 ? value1 : regex.test(value1) ? value1 : Number(value1)
                            newResult.initiatives[i].year[year_no - 1].inv_val.formattedValue = value1 === "" ? "" : value1.indexOf('.') === value1.length - 1 ? value1 : regex.test(value1) ? value1 : Number(value1)
                        } else {

                            newResult.initiatives[i].year[year_no - 1].frequency_data[index].inv_val.actualValue = value1 === "" ? "" : value1.indexOf('.') === value1.length - 1 ? value1 : regex.test(value1) ? value1 : Number(value1)
                            newResult.initiatives[i].year[year_no - 1].frequency_data[index].inv_val.formattedValue = value1 === "" ? "" : value1.indexOf('.') === value1.length - 1 ? value1 : regex.test(value1) ? value1 : Number(value1)
                        }
                    }
                }
            }
        }
        for (let k = 0; k < newResult.initiatives.length; k++) {
            for (let i = 0; i < newResult.initiatives[k].year.length; i++) {
                let frequencyData = newResult.initiatives[k].year[i].frequency_data
                if (frequency && frequency !== 'yearly' && frequency.length > 0) {
                    let sum = frequencyData.map(o => o.inv_val.actualValue).reduce((a, c) => { return Number(a) + Number(c) });
                    newResult.initiatives[k].year[i].inv_val.actualValue = sum
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
        this.setState({
            result: newResult,
            initiatives: newResult.initiatives,
            // totalInvestmentsArray: newResult.totalInvestmentsArray,
            totalInvestmentsArray: result.investments
        })

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
                            // newResult.initiatives[i].year[j].inv_val.formattedValue = newResult.initiatives[i].year[j].inv_val.actualValue === "" ? "" : newResult.initiatives[i].year[j].inv_val.actualValue.indexOf('.') === newResult.initiatives[i].year[j].inv_val.actualValue.length - 1 ? newResult.initiatives[i].year[j].inv_val.actualValue : Number(newResult.initiatives[i].year[j].inv_val.actualValue)
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
        const { result } = this.state;
        const selected_option = SessionStorage.read('option_selected');
        if (selected_option === 'delivery' && result.initiatives && result.initiatives.length > 0) {
            return result.initiatives[0].year;
        }
        return [{ "year_no": 1 }, { "year_no": 2 },
        { "year_no": 3 }, { "year_no": 4 }, { "year_no": 5 }];
    }

    addNewYear = () => {
        const { investmentActualsStore } = this.props
        const yearIndex = this.getYearsArray().length;
        const { result } = this.state;
        let frequency = !this.state.frequency ? investmentActualsStore.frequency : this.state.frequency
        let tempResult = result;
        let freqData = []
        let totalArray = []
        let TempInitiativesArray = [...tempResult.initiatives];
        let TempInvArray = [...tempResult.investments];
        this.setState({
            newYearAdded: true
        })
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
        if (this.props.newActualYear === false) {
            this.props.addNewProjectedYear(true)
            this.props.addDateColumn()
        }
        else {
            this.props.addNewActualYear(false)
        }

    };

    calculateFrequencyData = () => {
        const { investmentActualsStore, result } = this.props
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

    expandTotalFrequencyActualData = (event) => {
        const { expandedTotalActualIndex } = this.state
        if (expandedTotalActualIndex === event) {
            this.setState({
                expandedTotalActualIndex: false
            })
        } else {
            this.setState({
                expandedTotalActualIndex: event
            })
        }
        this.calculateFrequencyData()
        this.expandFrequencyLevelData(event, 'totalfrequency')
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
        } else {
            this.setState({
                totalActualFrequenciesToDisplay: frequenciesToDisplay
            })
            investmentActualsStore.totalActualFrequenciesToDisplay = frequenciesToDisplay
        }
    }

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
        if (this.props.deletedActualYear === false) {
            this.props.deleteProjectedYear(true)
        }
        else {
            this.props.deleteActualYear(false)
        }
    }

    render() {
        const { initiatives, totalInvestmentsArray, init_id, iniId, modalIndex, capexIndex, expandedActualIndex, expandedTotalActualIndex, totalActualFrequenciesToDisplay } = this.state;
        const { investmentActualsStore, startDatesArray } = this.props
        const { frequenciesToDisplay, frequency } = investmentActualsStore
        const getTooltipData = (value) => {
            if (value) {
                let val = String(value).replace(/(?<!\..*)(\d)(?=(?:\d{3})+(?:\.|$))/g, '$1,');
                return `${val}`;
            }
        }
        const getTooltipText = (val) => {
            return `${val}`;
        }
        var totalInvestmentheaders = [];
        let max_inv = this.getYearsArray().length;
        for (var i = 0; i < max_inv; i++) {
            totalInvestmentheaders.push(<th>Year {i + 1}</th>);
        }
        const selected_option = SessionStorage.read('option_selected');
        return (
            <div className="row ia-tab-content" >
                <div className="col-sm-12 table-width-holder" >
                    <div className="row">

                        <h5 style={{ color: '#fff', fontSize: '14px', marginTop: '2rem' }}>   Actual Investments</h5>

                        {this.state.showTable ?
                            <Fragment>
                                <div className="col-sm-12 table-width-holder" >
                                    <div className="ia-table-responsive invActuals-table-scroll" style={{ overflowX: 'auto', width: "100%" }}>
                                        <table className="table" style={{ marginBottom: "0%", width: "unset" }}>
                                            <thead style={{ whiteSpace: 'nowrap' }}>
                                                <tr>
                                                    <th style={{ padding: "20px 50px" }}>Total Investments</th>
                                                    {totalInvestmentsArray && totalInvestmentsArray.map((option, index) => (
                                                        <Fragment>
                                                            {expandedTotalActualIndex === index ?
                                                                totalActualFrequenciesToDisplay.map((frequency, freqIndex) => (
                                                                    <th style={{ padding: "0px" }}>
                                                                        <p style={{ margin: "7px 0px" }}> {frequency} </p>

                                                                        <th className="projInv_subHead" style={{ width: '200px' }}>
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
                                                                                // disabled={!this.state.loadTable}
                                                                                />
                                                                                :
                                                                                <img src={calendarIcon} alt='calendarIcon' style={{ width: "15px", float: "right", margin: "5px 5px 5px 0px" }} ></img>
                                                                            }
                                                                        </th>
                                                                    </th>
                                                                ))
                                                                : null}
                                                            <th style={{ padding: "0px" }}>
                                                                <p style={{ margin: "7px 0px" }}>{frequency !== 'yearly' ? <span id={`actual_plus_tot_Y${index + 1}`} style={{ cursor: "pointer" }} onClick={(e) => { this.expandTotalFrequencyActualData(index) }}>{expandedTotalActualIndex === index ? '[-] ' : '[+] '}</span> : null} Year {index + 1}</p>
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
                                            <tbody>

                                                <tr>
                                                    <td style={{ width: "23.8%", backgroundColor: '#606060' }}>Total Investments</td>
                                                    {totalInvestmentsArray && totalInvestmentsArray.map((option, index) => (
                                                        <Fragment>
                                                            {expandedTotalActualIndex === index && totalActualFrequenciesToDisplay.length > 0 ?
                                                                option.frequency_data.map((frequencyData, fIndex) => (
                                                                    < td data-tip={getTooltipData(frequencyData.total_investment_value)} style={{ backgroundColor: '#606060' }} >
                                                                        <ReactTooltip type="dark" html={true} />
                                                                        <NumberFormat
                                                                            thousandSeparator={true}
                                                                            name="capexcategory"
                                                                            id="year"
                                                                            allowNegative={false}
                                                                            value={
                                                                                // Number(option.total_investment_value).toFixed(1)
                                                                                Number(Math.round(Number(frequencyData.total_investment_value) * 10) / 10).toFixed(1)
                                                                            }
                                                                            style={{ textAlignLast: 'right', backgroundColor: '606060' }}
                                                                            // onChange={() => this.handleChange(option)}
                                                                            className="form-control-capex"
                                                                            disabled="true"
                                                                        />
                                                                    </td>
                                                                )) : null}
                                                            < td data-tip={getTooltipData(option.total_investment_value)} style={{ backgroundColor: '#606060' }}>
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
                                                                    onChange={() => this.handleChange(option)}
                                                                    className="form-control-capex"
                                                                    disabled={true}
                                                                /></td>
                                                        </Fragment>
                                                    ))}
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                                <div className="row" style={{ justifyContent: "flex-end", width: "102%" }}>
                                    <img src={circPlusIcon} className="add-init-img"
                                        alt="circleplusIcon"
                                        data-tip="" data-for="add_initiative_tooltip" data-place="left"
                                        style={{ cursor: SessionStorage.read("accessType") === "Read" ? "not-allowed" : 'pointer', opacity: SessionStorage.read("accessType") === "Read" ? "0.5" : 'unset' }}
                                        disabled={SessionStorage.read("accessType") === "Read" ? true : false}
                                        onClick={SessionStorage.read("accessType") === "Read" ? 'return false;' : this.handleAddRow}>
                                        {/* Add Initiative */}
                                    </img>
                                    <ReactTooltip id="add_initiative_tooltip" className="tooltip-class">
                                        <span>Add Initiative</span>
                                    </ReactTooltip>
                                </div>
                                {/* <div style={{ color: "black", marginLeft: "2%", fontWeight: "600", fontSize: "16px", marginBottom: "-11px" }}>Capex ($)</div> */}
                                < div className=" col-sm-12 table-width-holder" >
                                    <div className="ia-table-responsive invActuals-table-scroll" style={{ overflowX: 'auto', width: "100%", marginBottom: '3%' }}>
                                        <table className="table" style={{
                                            marginTop: "2%",
                                            marginBottom: "0%",
                                            width:
                                                // this.props.isExpandBenefits ? '':
                                                'unset',
                                            tableLayout: this.props.isExpandBenefits ? 'fixed' : ''
                                        }}>
                                            <thead style={{ whiteSpace: 'nowrap' }}>
                                                <tr>
                                                    <th style={{ padding: "20px 22px" }}>Cost Category </th>
                                                    <th style={{ padding: "12px 4px" }}>Capex /<br />Opex split</th>
                                                    <th style={{ padding: "12px 4px" }}>KPIs<br />Linked</th>
                                                    {totalInvestmentsArray && totalInvestmentsArray.map((option, index) => (
                                                        <Fragment>
                                                            {expandedActualIndex === index ?
                                                                frequenciesToDisplay.map((frequency, freqIndex) => (
                                                                    <th style={{ padding: "0px" }}>
                                                                        <p style={{ margin: "7px 0px" }}> {frequency}</p>
                                                                        <th className="projInv_subHead" style={{ width: '200px' }}>
                                                                            {startDatesArray.year_dates && startDatesArray.year_dates[index] && (startDatesArray.year_dates[index].frequency_start_dates[freqIndex].start_date !== "Invalid date" && startDatesArray.year_dates[index].frequency_start_dates[freqIndex].start_date !== "") ?
                                                                                <DatePicker
                                                                                    value={startDatesArray.year_dates && startDatesArray.year_dates[index] && (startDatesArray.year_dates[index].frequency_start_dates[freqIndex].start_date !== "Invalid date" && startDatesArray.year_dates[index].frequency_start_dates[freqIndex].start_date !== "") ?
                                                                                        new Date(startDatesArray.year_dates[index].frequency_start_dates[freqIndex].start_date) : null}
                                                                                    selected={startDatesArray.year_dates && startDatesArray.year_dates[index] && (startDatesArray.year_dates[index].frequency_start_dates[freqIndex].start_date !== "Invalid date" && startDatesArray.year_dates[index].frequency_start_dates[freqIndex].start_date !== "") ?
                                                                                        new Date(startDatesArray.year_dates[index].frequency_start_dates[freqIndex].start_date) : null}
                                                                                    placeholderText="Select Date"
                                                                                    id={`actual_inv_date_Y${index + 1}_freq_${freqIndex}`}
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
                                                                                // disabled={!this.state.loadTable}
                                                                                />
                                                                                :
                                                                                <img src={calendarIcon} alt='calendarIcon' style={{ width: "15px", float: "right", margin: "5px 5px 5px 0px" }} ></img>
                                                                            }

                                                                        </th></th>
                                                                ))
                                                                : null}
                                                            <th style={{ padding: "0px" }}>
                                                                <p style={{ margin: "7px 0px" }}> {frequency !== 'yearly' ? <span id={`actual_plus_Y${index + 1}`} style={{ cursor: "pointer" }} onClick={(e) => { this.expandFrequencyActualData(index) }}>{expandedActualIndex === index ? '[-] ' : '[+] '}</span> : null} Year {index + 1}</p>
                                                                <th className="projInv_subHead" style={{ width: '200px' }}>
                                                                    {startDatesArray.year_dates && startDatesArray.year_dates[index] && (startDatesArray.year_dates[index].start_date !== "Invalid date" && startDatesArray.year_dates[index].start_date !== "") ?
                                                                        <DatePicker
                                                                            value={startDatesArray.year_dates && startDatesArray.year_dates[index] && (startDatesArray.year_dates[index].start_date !== "Invalid date" && startDatesArray.year_dates[index].start_date !== "") ?
                                                                                new Date(startDatesArray.year_dates[index].start_date) : null}
                                                                            selected={startDatesArray.year_dates && startDatesArray.year_dates[index] && (startDatesArray.year_dates[index].start_date !== "Invalid date" && startDatesArray.year_dates[index].start_date !== "") ?
                                                                                new Date(startDatesArray.year_dates[index].start_date) : null}
                                                                            placeholderText="Select Date"
                                                                            id={`actual_inv_date_${index}`}
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
                                                                data-tip="" data-for="ai_add_year_tooltip" data-place="left"
                                                            >
                                                            </img> : ''}
                                                        {
                                                            this.getYearsArray().length > 5 &&
                                                            <span style={{ paddingLeft: '0.2rem' }}>
                                                                {' '} <img src={trashIcon} alt="" style={{ cursor: 'pointer', height: '16px' }}
                                                                    onClick={this.deleteTargetColumnHandler}
                                                                    data-tip="" data-for="ai_delete_year_tooltip" data-place="left"
                                                                />
                                                                <ReactTooltip id="ai_delete_year_tooltip" className="tooltip-class">
                                                                    <span>Delete Year</span>
                                                                </ReactTooltip>
                                                            </span>
                                                        }
                                                        <ReactTooltip id="ai_add_year_tooltip" className="tooltip-class">
                                                            <span>Add Year</span>
                                                        </ReactTooltip>
                                                    </div>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {/*  */}
                                                {(initiatives && initiatives.map((option, index) => (
                                                    <tr>
                                                        <td style={{ width: "10%" }} data-tip={getTooltipText(option.initiative_name)}>
                                                            <input
                                                                type="text"
                                                                name="capexcategory"
                                                                id={option}
                                                                value={option.initiative_name}
                                                                style={{ width: "100%", textAlignLast: 'left' }}
                                                                onChange={(e) => this.handleNameChange(option.init_id, e.target.value, index)}
                                                                className="form-control-capex"
                                                                disabled={option.init_id !== null}
                                                            />
                                                            <ReactTooltip type="dark" html={true} />
                                                        </td>
                                                        <td style={{ textAlignLast: "end" }}>
                                                            <input
                                                                type="text"
                                                                style={{ width: '80%', border: 'none' }}
                                                                className="form-control-capex"
                                                                disabled
                                                                value={option.capex_inv_percent !== "" || option.opex_inv_percent !== "" ? option.capex_inv_percent !== "" ? 'Cap...' : 'Ope...' : ''} />
                                                            <i className="fa fa-caret-down" aria-hidden="true" style={{
                                                                cursor: "pointer",
                                                            }}
                                                                id={`actual_inv_${option.initiative_name}_capex`}
                                                                onClick={(e) => this.onCapexDrillClick(option.init_id, index)}></i>
                                                            <Modal className="capex-actuals-modal" visible={option.init_id === parseInt(iniId) || capexIndex === index} >
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
                                                                                    name={option.initiative_name}
                                                                                    id="actual_capex"
                                                                                    min="0"
                                                                                    style={{ width: "98px", border: "0px" }}
                                                                                    value={Math.abs(option.capex_inv_percent)}
                                                                                    onChange={(e) => this.capexChangePerc(option.init_id, e.target.value, index)} />
                                                                            </td>
                                                                        </tr>
                                                                        <tr>
                                                                            <td style={{ textAlignLast: "left", paddingLeft: "6px" }}>Opex</td>
                                                                            <td>
                                                                                <input
                                                                                    type="number"
                                                                                    name={option.initiative_name}
                                                                                    id="actual_opex"
                                                                                    min="0"
                                                                                    style={{ width: "98px", border: "0px" }}
                                                                                    value={Math.abs(option.opex_inv_percent)}
                                                                                    onChange={(e) => this.opexChangePerc(option.init_id, e.target.value, index)} />
                                                                            </td>
                                                                        </tr>
                                                                    </tbody>
                                                                </table>
                                                                <button className="btn btn-primary" style={{ textAlignLast: "center", fontSize: '10px', cursor: "pointer", maxWidth: "50px", marginLeft: "87px" }} onClick={(e) => this.onCapexModalClose(option.init_id, index)}>OK</button>

                                                            </Modal>
                                                        </td>
                                                        <td style={{ textAlignLast: "end" }}>
                                                            <input
                                                                type="text"
                                                                style={{ width: '80%', border: 'none' }}
                                                                className="form-control-capex"
                                                                disabled
                                                                value={option.linkedValue && option.linkedValue.substring(0, 3) + '...'} />
                                                            <i className="fa fa-caret-down" aria-hidden="true" style={{
                                                                cursor: "pointer",
                                                            }}
                                                                id={`actual_inv_${option.initiative_name}_linkedkpi`}
                                                                onClick={(e) => this.onKpiModalOpen(index, option.init_id)}></i>

                                                            <Modal className="kpi-actuals-modal" visible={(option.init_id === parseInt(init_id) || parseInt(modalIndex) === index)}>
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
                                                                                            checked={kpi.checked}
                                                                                            name={`actual${option.initiative_name}`}
                                                                                            id={`actual${kpi.kpi_name}`}
                                                                                            // value={checkedVal}
                                                                                            onChange={(e) => this.linkedKPIChecked(e.target.checked, option.init_id, kpi.kpi_id, index, kpiIndex)} />
                                                                                        <p style={{ margin: "7px 1px 1px 2px" }}> {kpi.kpi_name}</p>
                                                                                    </div>
                                                                                </td>
                                                                                <td>
                                                                                    <input
                                                                                        type="number"
                                                                                        disabled={!kpi.checked}
                                                                                        name={`actual_${option.initiative_name}`}
                                                                                        id={`actual_${kpi.kpi_name}`}
                                                                                        min="0"
                                                                                        style={{ width: "98px", border: "0px" }}
                                                                                        value={kpi.cost_allocated_percent ? Math.abs(kpi.cost_allocated_percent) : ''}
                                                                                        onChange={(e) => this.linkedKPIValueChange(option.init_id, kpi.kpi_id, e.target.value, index, kpiIndex)} />
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
                                                                        year.frequency_data.map((frequencyYear, frequencyIndex) => (
                                                                            <td
                                                                                style={{ width: "13%", backgroundColor: '#4D4D4D' }}
                                                                                data-tip={getTooltipData(frequencyYear.inv_val && frequencyYear.inv_val.actualValue ? frequencyYear.inv_val.actualValue : null)} >
                                                                                <ReactTooltip type="dark" html={true} />
                                                                                <NumberFormat
                                                                                    thousandSeparator={true}
                                                                                    id={`actual_inv_${option.initiative_name}_Y${index1 + 1}_freq_${frequencyIndex}`}
                                                                                    name="capexcategory"
                                                                                    allowNegative={false}
                                                                                    style={{ textAlignLast: 'right', backgroundColor: '#4D4D4D' }}
                                                                                    value={frequencyYear.inv_val && (frequencyYear.inv_val.formattedValue > 0 ? frequencyYear.inv_val.formattedValue : (frequencyYear.inv_val.actualValue === null || frequencyYear.inv_val.actualValue === 0 || frequencyYear.inv_val.actualValue === "" ? " " :
                                                                                        Number(Math.round(Number(frequencyYear.inv_val.actualValue) * 10) / 10).toFixed(1)
                                                                                    ))}
                                                                                    onChange={(e) => this.handleInvestmentValueChange(option.init_id, e.target.value, index, year.year_no, frequencyIndex)}
                                                                                    onFocus={(event) => this.onInputFocus(option.init_id, event.target.value, frequencyYear.year_no, index)}
                                                                                    onBlur={(event) => this.onInputBlur(option.init_id, event.target.value, frequencyYear.year_no, index)}
                                                                                    className="form-control-capex"
                                                                                // disabled={frequency !== "yearly" ? true : false}
                                                                                // disabled={true}
                                                                                />
                                                                            </td>
                                                                        )) : null : null}
                                                                    <td
                                                                        style={{ width: "13%", backgroundColor: frequency === "yearly" ? '#4D4D4D' : '#5A5A5A' }}
                                                                        data-tip={getTooltipData(year.inv_val && year.inv_val.actualValue ? year.inv_val.actualValue : null)} >
                                                                        <ReactTooltip type="dark" html={true} />
                                                                        <NumberFormat
                                                                            thousandSeparator={true}
                                                                            name="capexcategory"
                                                                            id={`actual_inv_${option.initiative_name}_Y${index1 + 1}`}
                                                                            style={{ textAlignLast: 'right', backgroundColor: frequency !== "yearly" ? '#5A5A5A' : '#4D4D4D' }}
                                                                            value={year.inv_val && (year.inv_val.formattedValue > 0 ? year.inv_val.formattedValue : (year.inv_val.actualValue === null || year.inv_val.actualValue === 0 || year.inv_val.actualValue === '' ? "" :
                                                                                Number(Math.round(Number(year.inv_val.actualValue) * 10) / 10).toFixed(1)
                                                                            ))}
                                                                            allowNegative={false}
                                                                            onChange={(e) => this.handleInvestmentValueChange(option.init_id, e.target.value, index, year.year_no, null)}
                                                                            onFocus={(event) => this.onInputFocus(option.init_id, event.target.value, year.year_no, index)}
                                                                            onBlur={(event) => this.onInputBlur(option.init_id, event.target.value, year.year_no, index)}
                                                                            className="form-control-capex"
                                                                            disabled={frequency !== "yearly" ? true : false}
                                                                        />
                                                                    </td>

                                                                </Fragment>
                                                            ))
                                                        }
                                                        {/* <td style={{ border: "0px" }}>
                                                    <div style={{ textAlignLast: 'left', paddingLeft: "8px", border: 'none', width: "fit-content", backgroundColor: '#ffffff' }}>
                                                        <i className="fa fa-trash disabled" id={option.init_id} style={{ cursor: 'pointer' }}
                                                            onClick={(e) => this.deleteInvestment(option.init_id)}
                                                        >
                                                        </i>


                                                    </div>
                                                </td> */}
                                                    </tr>
                                                )))
                                                }

                                                {/*  */}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                                {/* {selected_option === 'delivery' && this.getYearsArray().length < 10 && initiatives.length > 0 ?
                                    <div className="d-inline-block align-top col-cm-2" style={{ width: 'auto', marginTop: '3%' }}>
                                        <span onClick={this.addNewYear} style={{ color: 'black', fontSize: '20px', cursor: 'pointer' }}>
                                            [+]</span>
                                            {
                                                this.getYearsArray().length > 5 &&
                                                <span style={{ color: 'black', fontSize: '20px', cursor: 'pointer' }}>
                                                        {' '} <i className="fa fa-trash" onClick={this.props.deleteTargetColumnHandler} />
                                                </span>
                                            }
                                    </div> : ''
                                } */}
                            </Fragment> : <div className="row justify-content-center" style={{ height: '50px' }}>
                                {/* <h4> <i className="fa fa-exclamation-triangle"></i> No data to load</h4> */}
                                <i className="fa fa-spinner fa-spin" style={{ fontSize: '18px', color: '#ffffff', height: "min-content" }}></i>
                            </div>}


                    </div>
                </div>
            </div >
        )
    }
}

export default withRouter(ActualInvestments);