import React, { Component, Fragment } from 'react';
import { withRouter } from "react-router-dom";
import '../../containers/VisualVDTTable/VisualVDTTable.css';
import { observer, inject } from 'mobx-react';
import NumberFormat from 'react-number-format';
import ReactTooltip from 'react-tooltip';
import Select from 'react-select';
import eyeIcon from '../../assets/project/fvdt/eyeIcon.svg';
import Modal from 'react-bootstrap4-modal';
import closeIcon from "../../assets/project/fvdt/crossIcon.svg";

var SessionStorage = require('store/storages/sessionStorage');
@inject('reviewValueDriverStore', 'customVDTStore')
@observer
class CustomVDTTable extends Component {
    constructor(props) {
        super(props);
        this.state = {
            operationalKpIs: [],
            bicBenchmark: '',
            avgBenchmark: '',
            baseline: '',
            target: '',
            targetAchieved: ' ',
            selectedBicBenchmark: false,
            selectedAvgBenchmark: false,
            prevCheckedBicValue: false,
            selectedYearValue: [],
            clickEyeIconBic: false,
            selectedKpiBic: '',
            sourceValueBic: {},
            clickEyeIconAvg: false,
            selectedKpiAvg: '',
            sourceValueAvg: {},
        }
        this.onSelectedBicBenchmark = this.onSelectedBicBenchmark.bind(this)
        this.onChangeBicBenchmark = this.onChangeBicBenchmark.bind(this)
        this.onSelectedAvgBenchmark = this.onSelectedAvgBenchmark.bind(this)
        this.onChangeAvgBenchmark = this.onChangeAvgBenchmark.bind(this)
        this.onChangeBaseline = this.onChangeBaseline.bind(this)
        this.onChangeTargetAchieved = this.onChangeTargetAchieved.bind(this)
        this.onChangeTarget = this.onChangeTarget.bind(this)
        this.onFrequencyChange = this.onFrequencyChange.bind(this)
        this.onInputBlur = this.onInputBlur.bind(this)
        this.onInputFocus = this.onInputFocus.bind(this)
        // this.checkUncheckKPIS = this.checkUncheckKPIS.bind(this)
    }

    componentDidMount() {
        const { operationalKpIs } = this.props
        const { selectedYearValue } = this.state;

        // this.checkUncheckKPIS();
        this.setState({
            operationalKpIs: operationalKpIs,
            sourceValueBic: {},
            sourceValueAvg: {}
        });
        for (let i = 0; i < operationalKpIs.length; i++) {
            // if(operationalKpIs[i].value !== undefined){
            if (typeof operationalKpIs[i].value === 'object') {
                if (operationalKpIs[i].value !== "") {
                    if (operationalKpIs[i].value.bicBenchmark === "null" || operationalKpIs[i].value.bicBenchmark === null || operationalKpIs[i].value.bicBenchmark === "") {
                        operationalKpIs[i].value.bicBenchmark = {
                            'actualValue': '',
                            'formattedValue': 0
                        }
                    }
                    else {
                        if (typeof operationalKpIs[i].value.bicBenchmark !== 'object') {
                            operationalKpIs[i].value.bicBenchmark = {
                                'actualValue': Number(operationalKpIs[i].value.bicBenchmark),
                                'formattedValue': 0
                            }
                        }
                    }
                    if (operationalKpIs[i].value.baseline === null || operationalKpIs[i].value.baseline === "") {
                        operationalKpIs[i].value.baseline = {
                            'actualValue': '',
                            'formattedValue': 0
                        }
                    }
                    else {
                        if (typeof operationalKpIs[i].value.baseline !== 'object') {
                            operationalKpIs[i].value.baseline = {
                                'actualValue': Number(operationalKpIs[i].value.baseline),
                                'formattedValue': 0
                            }
                        }
                    }
                    if (operationalKpIs[i].value.avgBenchmark === "null" || operationalKpIs[i].value.avgBenchmark === null || operationalKpIs[i].value.avgBenchmark === "") {
                        operationalKpIs[i].value.avgBenchmark = {
                            'actualValue': '',
                            'formattedValue': 0
                        }
                    }
                    else {
                        if (typeof operationalKpIs[i].value.avgBenchmark !== 'object') {
                            operationalKpIs[i].value.avgBenchmark = {
                                'actualValue': Number(operationalKpIs[i].value.avgBenchmark),
                                'formattedValue': 0
                            }
                        }
                    }
                    if (operationalKpIs[i].value.target === null || operationalKpIs[i].value.target === "") {
                        operationalKpIs[i].value.target = {
                            'actualValue': '',
                            'formattedValue': 0
                        }
                    }
                    else {

                        if (typeof operationalKpIs[i].value.target !== 'object') {
                            operationalKpIs[i].value.target = {
                                'actualValue': Number(operationalKpIs[i].value.target),
                                'formattedValue': 0
                            }
                        }
                    }
                    // if (operationalKpIs[i].value.bicBenchmark !== "null" && operationalKpIs[i].value.bicBenchmark !== null && operationalKpIs[i].value.bicBenchmark !== "") {
                    //     if (operationalKpIs[i].value.target) {
                    //         switch (operationalKpIs[i].value.calculationType) {
                    //             case "Absolute Value":

                    //                 if (operationalKpIs[i].value.target.actualValue === operationalKpIs[i].value.bicBenchmark.actualValue) {
                    //                     operationalKpIs[i].value.selectedBicBenchmark = true
                    //                 }
                    //                 if (operationalKpIs[i].value.target.actualValue === operationalKpIs[i].value.avgBenchmark.actualValue) {
                    //                     operationalKpIs[i].value.selectedAvgBenchmark = true
                    //                 }

                    //                 break;
                    //             case "Absolute Improvement":
                    //                 if (operationalKpIs[i].value.target.actualValue - Number(operationalKpIs[i].value.baseline.actualValue) === (Number(operationalKpIs[i].value.bicBenchmark.actualValue))
                    //                     || (operationalKpIs[i].value.target.actualValue + (Number(operationalKpIs[i].value.bicBenchmark.actualValue)) === Number(operationalKpIs[i].value.baseline.actualValue))) {
                    //                     operationalKpIs[i].value.selectedBicBenchmark = true
                    //                 }
                    //                 if (operationalKpIs[i].value.target.actualValue - Number(operationalKpIs[i].value.baseline.actualValue) === (Number(operationalKpIs[i].value.avgBenchmark.actualValue))
                    //                     || (operationalKpIs[i].value.target.actualValue + Number(operationalKpIs[i].value.avgBenchmark.actualValue) === (Number(operationalKpIs[i].value.baseline.actualValue)))) {
                    //                     operationalKpIs[i].value.selectedAvgBenchmark = true
                    //                 }
                    //                 break;
                    //             case "Relative Improvement":

                    //                 if ((operationalKpIs[i].value.target.actualValue === Number(Number(Math.round(Number((Number(operationalKpIs[i].value.baseline.actualValue) * (1 + (Number(operationalKpIs[i].value.avgBenchmark.actualValue) / 100)))) * 10) / 10).toFixed(1))) ||
                    //                     (operationalKpIs[i].value.target.actualValue === Number(Number(Math.round(Number((Number(operationalKpIs[i].value.baseline.actualValue) * (1 - (Number(operationalKpIs[i].value.avgBenchmark.actualValue) / 100)))) * 10) / 10).toFixed(1)))) {
                    //                     operationalKpIs[i].value.selectedAvgBenchmark = true
                    //                 }
                    //                 if (operationalKpIs[i].value.target.actualValue === Number(Number(Math.round(Number((Number(operationalKpIs[i].value.baseline.actualValue) * (1 + (Number(operationalKpIs[i].value.bicBenchmark.actualValue) / 100)))) * 10) / 10).toFixed(1))
                    //                     || (operationalKpIs[i].value.target.actualValue === Number(Number(Math.round(Number((Number(operationalKpIs[i].value.baseline.actualValue) * (1 - (Number(operationalKpIs[i].value.bicBenchmark.actualValue) / 100)))) * 10) / 10).toFixed(1)))) {
                    //                     operationalKpIs[i].value.selectedBicBenchmark = true
                    //                 }

                    //                 break;
                    //             default:
                    //                 break;
                    //         }
                    //     }
                    // }
                    switch (operationalKpIs[i].value.enabledBenchmark) {
                        case "BIC":
                            operationalKpIs[i].value.selectedBicBenchmark = true
                            break;
                        case "AVG":
                            operationalKpIs[i].value.selectedAvgBenchmark = true
                            break;
                        // case null:
                        //     operationalKpIs[i].value.selectedAvgBenchmark = false
                        //     operationalKpIs[i].value.selectedBicBenchmark = false
                        //     break;

                        default:
                            break;

                    }
                }
            }
            // code for target achieved dropdown
            selectedYearValue.push({
                'value': operationalKpIs[i].value.targetAchieved ? operationalKpIs[i].value.targetAchieved : null,
                'label': operationalKpIs[i].value.targetAchieved ? operationalKpIs[i].value.targetAchieved : 'Select Year'
            });
            // }

        }
        this.setState({
            selectedYearValue: selectedYearValue
        })
    }

    // checkUncheckKPIS() {
    //     const { operationalKpIs } = this.props
    //     for (let i = 0; i < operationalKpIs.length; i++) {
    //         for (let j = 0; j < oldKPIValues.length; j++) {
    //             // if (operationalKpIs[i].kpi_id === oldKPIValues[j].kpi_id) {
    //                 operationalKpIs[i].selectedAvgBenchmark = oldKPIValues[j].selectedAvgBenchmark
    //                 operationalKpIs[i].selectedBicBenchmark = oldKPIValues[j].selectedBicBenchmark
    //             // }
    //         }
    //     }

    // }

    updateId(value) {
        let val = ""
        if (value !== null && value !== undefined) {
            if (typeof value !== "string") {
                value = value.toString()
            }
            if (value.includes("Kpi_")) {
                val = value
            }
            else {
                val = Number(value)
            }
        }
        else {
            val = value
        }

        return val
    }
    onFrequencyChange = (event) => {
        const { operationalKpIs } = this.props
        for (let i = 0; i < operationalKpIs.length; i++) {
            if ((this.updateId(operationalKpIs[i].value.kpi_id) === this.updateId(event.target.id)) || (this.updateId(operationalKpIs[i].value.kpi_id) === this.updateId(event.target.id))) {
                operationalKpIs[i].value.kpiFrequency = event.target.value
            }
        }
        this.setState({
            operationalKpIs: operationalKpIs
        })
    }

    onSelectedBicBenchmark = (event) => {
        const { operationalKpIs } = this.props
        this.setState({
            selectedBicBenchmark: true,
            onSelectedAvgBenchmark: false,
        })

        if (event.target.checked) {
            for (let i = 0; i < operationalKpIs.length; i++) {
                if (this.updateId(operationalKpIs[i].value.kpi_id) === this.updateId(event.target.id) || i === this.updateId(event.target.id)) {
                    if (operationalKpIs[i].value.bicBenchmark !== "null" && operationalKpIs[i].value.bicBenchmark !== "") {
                        switch (event.target.name) {
                            case "Absolute Value":
                                operationalKpIs[i].value.target.actualValue = operationalKpIs[i].value.bicBenchmark.actualValue
                                operationalKpIs[i].value.target.formattedValue = operationalKpIs[i].value.bicBenchmark.actualValue
                                break;
                            case "Absolute Improvement":
                                if (operationalKpIs[i].value.kpiTrend === "Decrease") {
                                    operationalKpIs[i].value.target.actualValue = (Number(operationalKpIs[i].value.baseline.actualValue) - Number(operationalKpIs[i].value.bicBenchmark.actualValue))
                                    operationalKpIs[i].value.target.formattedValue = (Number(operationalKpIs[i].value.baseline.actualValue) - Number(operationalKpIs[i].value.bicBenchmark.actualValue))
                                }
                                else {
                                    operationalKpIs[i].value.target.actualValue = (Number(operationalKpIs[i].value.bicBenchmark.actualValue) + Number(operationalKpIs[i].value.baseline.actualValue))
                                    operationalKpIs[i].value.target.formattedValue = (Number(operationalKpIs[i].value.bicBenchmark.actualValue) + Number(operationalKpIs[i].value.baseline.actualValue))
                                }
                                break;
                            case "Relative Improvement":
                                if (operationalKpIs[i].value.kpiTrend === "Decrease") {
                                    operationalKpIs[i].value.target.actualValue =
                                        Number(Math.round(Number(
                                            (Number(operationalKpIs[i].value.baseline.actualValue) * (1 - (Number(operationalKpIs[i].value.bicBenchmark.actualValue) / 100)))
                                        ) * 10) / 10).toFixed(1)
                                    operationalKpIs[i].value.target.formattedValue =
                                        Number(Math.round(Number(
                                            (Number(operationalKpIs[i].value.baseline.actualValue) * (1 - (Number(operationalKpIs[i].value.bicBenchmark.actualValue) / 100)))
                                        ) * 10) / 10).toFixed(1)
                                } else {
                                    operationalKpIs[i].value.target.actualValue =
                                        Number(Math.round(Number(
                                            (Number(operationalKpIs[i].value.baseline.actualValue) * (1 + (Number(operationalKpIs[i].value.bicBenchmark.actualValue) / 100)))
                                        ) * 10) / 10).toFixed(1)
                                    operationalKpIs[i].value.target.formattedValue =
                                        Number(Math.round(Number(
                                            (Number(operationalKpIs[i].value.baseline.actualValue) * (1 + (Number(operationalKpIs[i].value.bicBenchmark.actualValue) / 100)))
                                        ) * 10) / 10).toFixed(1)
                                }
                                break;
                            default:
                                break;

                        }
                    }
                    operationalKpIs[i].value.selectedBicBenchmark = true
                    operationalKpIs[i].value.selectedAvgBenchmark = false
                    operationalKpIs[i].value.enabledBenchmark = "BIC"
                }
            }
            this.setState({
                operationalKpIs: operationalKpIs
            })
        }
        else {
            for (let i = 0; i < operationalKpIs.length; i++) {
                if (this.updateId(operationalKpIs[i].value.kpi_id) === this.updateId(event.target.id) || i === this.updateId(event.target.id)) {
                    operationalKpIs[i].value.selectedBicBenchmark = false
                    operationalKpIs[i].value.enabledBenchmark = null
                }
            }
            this.setState({
                operationalKpIs: operationalKpIs
            })
        }
    }

    onSelectedAvgBenchmark = (event) => {
        const { operationalKpIs } = this.props
        this.setState({
            selectedBicBenchmark: false,
            selectedAvgBenchmark: true
        })
        if (event.target.checked) {
            for (let i = 0; i < operationalKpIs.length; i++) {
                if (this.updateId(operationalKpIs[i].value.kpi_id) === this.updateId(event.target.id) || i === this.updateId(event.target.id)) {
                    if (operationalKpIs[i].value.avgBenchmark !== "null" && operationalKpIs[i].value.avgBenchmark !== "") {
                        switch (event.target.name) {
                            case "Absolute Value":
                                operationalKpIs[i].value.target.actualValue = operationalKpIs[i].value.avgBenchmark.actualValue
                                operationalKpIs[i].value.target.formattedValue = operationalKpIs[i].value.avgBenchmark.actualValue
                                break;
                            case "Absolute Improvement":
                                if (operationalKpIs[i].value.kpiTrend === "Decrease") {
                                    operationalKpIs[i].value.target.actualValue = (Number(operationalKpIs[i].value.baseline.actualValue) - Number(operationalKpIs[i].value.avgBenchmark.actualValue))
                                    operationalKpIs[i].value.target.formattedValue = (Number(operationalKpIs[i].value.baseline.actualValue) - Number(operationalKpIs[i].value.avgBenchmark.actualValue))
                                }
                                else {
                                    operationalKpIs[i].value.target.actualValue = (Number(operationalKpIs[i].value.avgBenchmark.actualValue) + Number(operationalKpIs[i].value.baseline.actualValue))
                                    operationalKpIs[i].value.target.formattedValue = (Number(operationalKpIs[i].value.avgBenchmark.actualValue) + Number(operationalKpIs[i].value.baseline.actualValue))
                                }
                                break;
                            case "Relative Improvement":
                                if (operationalKpIs[i].value.kpiTrend === "Decrease") {
                                    operationalKpIs[i].value.target.actualValue =
                                        Number(Math.round(Number(
                                            (Number(operationalKpIs[i].value.baseline.actualValue) * (1 - (Number(operationalKpIs[i].value.avgBenchmark.actualValue) / 100)))
                                        ) * 10) / 10).toFixed(1)
                                    operationalKpIs[i].value.target.formattedValue =
                                        Number(Math.round(Number(
                                            (Number(operationalKpIs[i].value.baseline.actualValue) * (1 - (Number(operationalKpIs[i].value.avgBenchmark.actualValue) / 100)))
                                        ) * 10) / 10).toFixed(1)
                                }
                                else {
                                    operationalKpIs[i].value.target.actualValue =
                                        Number(Math.round(Number(
                                            (Number(operationalKpIs[i].value.baseline.actualValue) * (1 + (Number(operationalKpIs[i].value.avgBenchmark.actualValue) / 100)))
                                        ) * 10) / 10).toFixed(1)
                                    operationalKpIs[i].value.target.formattedValue =
                                        Number(Math.round(Number(
                                            (Number(operationalKpIs[i].value.baseline.actualValue) * (1 + (Number(operationalKpIs[i].value.avgBenchmark.actualValue) / 100)))
                                        ) * 10) / 10).toFixed(1)
                                }
                                break;
                            default:
                                break;

                        }
                    }
                    operationalKpIs[i].value.selectedAvgBenchmark = true
                    operationalKpIs[i].value.selectedBicBenchmark = false
                    operationalKpIs[i].value.enabledBenchmark = "AVG"
                }
            }
            this.setState({
                operationalKpIs: operationalKpIs
            })
        }
        else {
            for (let i = 0; i < operationalKpIs.length; i++) {
                if (this.updateId(operationalKpIs[i].value.kpi_id) === this.updateId(event.target.id) || i === this.updateId(event.target.id)) {
                    operationalKpIs[i].value.selectedAvgBenchmark = false;
                    operationalKpIs[i].value.enabledBenchmark = null
                }
            }
            this.setState({
                operationalKpIs: operationalKpIs
            })
        }
    }

    onChangeBicBenchmark = (event) => {

        var value = event.target.value.replace(/,/g, '')
        const { operationalKpIs } = this.props
        for (let i = 0; i < operationalKpIs.length; i++) {
            if (this.updateId(operationalKpIs[i].value.kpi_id) === this.updateId(event.target.id) || i === this.updateId(event.target.id)) {
                operationalKpIs[i].value.bicBenchmarkSource = "Custom"
                operationalKpIs[i].value.bicBenchmark.actualValue = value === "" ? "" : Number(value)
                operationalKpIs[i].value.bicBenchmark.formattedValue = value === "" ? "" : Number(value)
                if (operationalKpIs[i].value.selectedBicBenchmark === true) {
                    switch (event.target.name) {
                        case "Absolute Value":
                            operationalKpIs[i].value.target.actualValue = operationalKpIs[i].value.bicBenchmark.actualValue
                            operationalKpIs[i].value.target.formattedValue = operationalKpIs[i].value.bicBenchmark.actualValue
                            break;
                        case "Absolute Improvement":
                            if (operationalKpIs[i].value.kpiTrend === "Decrease") {
                                operationalKpIs[i].value.target.actualValue = (Number(operationalKpIs[i].value.baseline.actualValue) - Number(operationalKpIs[i].value.bicBenchmark.actualValue))
                                operationalKpIs[i].value.target.formattedValue = (Number(operationalKpIs[i].value.baseline.actualValue) - Number(operationalKpIs[i].value.bicBenchmark.actualValue))
                            }
                            else {
                                operationalKpIs[i].value.target.actualValue = (Number(operationalKpIs[i].value.bicBenchmark.actualValue) + Number(operationalKpIs[i].value.baseline.actualValue))
                                operationalKpIs[i].value.target.formattedValue = (Number(operationalKpIs[i].value.bicBenchmark.actualValue) + Number(operationalKpIs[i].value.baseline.actualValue))
                            }
                            break;
                        case "Relative Improvement":
                            if (operationalKpIs[i].value.kpiTrend === "Decrease") {
                                operationalKpIs[i].value.target.actualValue = Number(Math.round(Number(
                                    (Number(operationalKpIs[i].value.baseline.actualValue) * (1 - (Number(operationalKpIs[i].value.bicBenchmark.actualValue) / 100)))
                                ) * 10) / 10).toFixed(1)
                                operationalKpIs[i].target.formattedValue = Number(Math.round(Number(
                                    (Number(operationalKpIs[i].value.baseline.actualValue) * (1 - (Number(operationalKpIs[i].value.bicBenchmark.actualValue) / 100)))
                                ) * 10) / 10).toFixed(1)
                            }
                            else {
                                operationalKpIs[i].value.target.actualValue = Number(Math.round(Number(
                                    (Number(operationalKpIs[i].value.baseline.actualValue) * (1 + (Number(operationalKpIs[i].value.bicBenchmark.actualValue) / 100)))
                                ) * 10) / 10).toFixed(1)
                                operationalKpIs[i].value.target.formattedValue = Number(Math.round(Number(
                                    (Number(operationalKpIs[i].value.baseline.actualValue) * (1 + (Number(operationalKpIs[i].value.bicBenchmark.actualValue) / 100)))
                                ) * 10) / 10).toFixed(1)
                            }
                            break;
                        default:
                            break;

                    }
                }
            }
        }
        this.setState({
            sourceValueBic: { [Number(event.target.id)]: 'Custom' },
            operationalKpIs: operationalKpIs
        })
    }

    onChangeAvgBenchmark = (event) => {
        const { operationalKpIs } = this.props
        var value = event.target.value.replace(/,/g, '')
        for (let i = 0; i < operationalKpIs.length; i++) {
            if (this.updateId(operationalKpIs[i].value.kpi_id) === this.updateId(event.target.id) || i === this.updateId(event.target.id)) {
                operationalKpIs[i].value.avgBenchmarkSource = 'Custom'
                operationalKpIs[i].value.avgBenchmark.actualValue = value === "" ? "" : Number(value)
                operationalKpIs[i].value.avgBenchmark.formattedValue = value === "" ? "" : Number(value)
                if (operationalKpIs[i].value.selectedAvgBenchmark === true) {
                    switch (event.target.name) {
                        case "Absolute Value":
                            operationalKpIs[i].value.target.actualValue = operationalKpIs[i].value.avgBenchmark.actualValue
                            operationalKpIs[i].value.target.formattedValue = operationalKpIs[i].value.avgBenchmark.actualValue
                            break;
                        case "Absolute Improvement":
                            if (operationalKpIs[i].value.kpiTrend === "Decrease") {
                                operationalKpIs[i].value.target.actualValue = (Number(operationalKpIs[i].value.baseline.actualValue) - Number(operationalKpIs[i].value.avgBenchmark.actualValue))
                                operationalKpIs[i].value.target.formattedValue = (Number(operationalKpIs[i].value.baseline.actualValue) - Number(operationalKpIs[i].value.avgBenchmark.actualValue))
                            }
                            else {
                                operationalKpIs[i].value.target.actualValue = (Number(operationalKpIs[i].value.avgBenchmark.actualValue) + Number(operationalKpIs[i].value.baseline.actualValue))
                                operationalKpIs[i].value.target.formattedValue = (Number(operationalKpIs[i].value.avgBenchmark.actualValue) + Number(operationalKpIs[i].value.baseline.actualValue))
                            }
                            break;
                        case "Relative Improvement":
                            if (operationalKpIs[i].value.kpiTrend === "Decrease") {
                                operationalKpIs[i].value.target.actualValue =
                                    // (Number(operationalKpIs[i].baseline.actualValue) * (1 - (Number(operationalKpIs[i].avgBenchmark.actualValue) / 100))).toFixed(1)
                                    Number(Math.round(Number(
                                        (Number(operationalKpIs[i].value.baseline.actualValue) * (1 - (Number(operationalKpIs[i].value.avgBenchmark.actualValue) / 100)))
                                    ) * 10) / 10).toFixed(1)
                                operationalKpIs[i].value.target.formattedValue =
                                    // (Number(operationalKpIs[i].baseline.actualValue) * (1 - (Number(operationalKpIs[i].avgBenchmark.actualValue) / 100))).toFixed(1)
                                    Number(Math.round(Number(
                                        (Number(operationalKpIs[i].value.baseline.actualValue) * (1 - (Number(operationalKpIs[i].value.avgBenchmark.actualValue) / 100)))
                                    ) * 10) / 10).toFixed(1)
                            }
                            else {
                                operationalKpIs[i].value.target.actualValue =
                                    // (Number(operationalKpIs[i].baseline.actualValue) * (1 + (Number(operationalKpIs[i].avgBenchmark.actualValue) / 100))).toFixed(1)
                                    Number(Math.round(Number(
                                        (Number(operationalKpIs[i].value.baseline.actualValue) * (1 + (Number(operationalKpIs[i].value.avgBenchmark.actualValue) / 100)))
                                    ) * 10) / 10).toFixed(1)
                                operationalKpIs[i].value.target.formattedValue =
                                    // (Number(operationalKpIs[i].baseline.actualValue) * (1 + (Number(operationalKpIs[i].avgBenchmark.actualValue) / 100))).toFixed(1)
                                    Number(Math.round(Number(
                                        (Number(operationalKpIs[i].value.baseline.actualValue) * (1 + (Number(operationalKpIs[i].value.avgBenchmark.actualValue) / 100)))
                                    ) * 10) / 10).toFixed(1)
                            }
                            break;
                        default:
                            break;

                    }
                }
            }
        }
        this.setState({
            sourceValueAvg: { [Number(event.target.id)]: 'Custom' },
            operationalKpIs: operationalKpIs
        })
    }

    onChangeBaseline = (event) => {
        const { operationalKpIs } = this.props
        var value = event.target.value.replace(/,/g, '')
        for (let i = 0; i < operationalKpIs.length; i++) {
            if (this.updateId(operationalKpIs[i].value.kpi_id) === this.updateId(event.target.id) || i === this.updateId(event.target.id)) {
                operationalKpIs[i].value.baseline.actualValue = value === "" ? "" : Number(value)
                operationalKpIs[i].value.baseline.formattedValue = value === "" ? "" : Number(value)
                if (operationalKpIs[i].value.selectedAvgBenchmark !== undefined || operationalKpIs[i].value.selectedBicBenchmark !== undefined) {
                    if (operationalKpIs[i].value.selectedAvgBenchmark !== false || operationalKpIs[i].value.selectedBicBenchmark !== false) {
                        if (operationalKpIs[i].value.selectedAvgBenchmark === true) {
                            switch (event.target.name) {
                                case "Absolute Value":
                                    operationalKpIs[i].value.target.actualValue = operationalKpIs[i].value.avgBenchmark.actualValue
                                    operationalKpIs[i].value.target.formattedValue = operationalKpIs[i].value.avgBenchmark.actualValue
                                    break;
                                case "Absolute Improvement":
                                    if (operationalKpIs[i].value.kpiTrend === "Decrease") {
                                        operationalKpIs[i].value.target.actualValue = (Number(operationalKpIs[i].value.baseline.actualValue) - Number(operationalKpIs[i].value.avgBenchmark.actualValue))
                                        operationalKpIs[i].value.target.formattedValue = (Number(operationalKpIs[i].value.baseline.actualValue) - Number(operationalKpIs[i].value.avgBenchmark.actualValue))
                                    }
                                    else {
                                        operationalKpIs[i].value.target.actualValue = (Number(operationalKpIs[i].value.avgBenchmark.actualValue) + Number(operationalKpIs[i].value.baseline.actualValue))
                                        operationalKpIs[i].value.target.formattedValue = (Number(operationalKpIs[i].value.avgBenchmark.actualValue) + Number(operationalKpIs[i].value.baseline.actualValue))
                                    }
                                    break;
                                case "Relative Improvement":
                                    if (operationalKpIs[i].value.kpiTrend === "Decrease") {
                                        operationalKpIs[i].value.target.actualValue =
                                            // (Number(operationalKpIs[i].baseline.actualValue) * (1 - (Number(operationalKpIs[i].avgBenchmark.actualValue) / 100))).toFixed(1)
                                            Number(Math.round(Number(
                                                (Number(operationalKpIs[i].value.baseline.actualValue) * (1 - (Number(operationalKpIs[i].value.avgBenchmark.actualValue) / 100)))
                                            ) * 10) / 10).toFixed(1)
                                        operationalKpIs[i].value.target.formattedValue =
                                            // (Number(operationalKpIs[i].baseline.actualValue) * (1 - (Number(operationalKpIs[i].avgBenchmark.actualValue) / 100))).toFixed(1)
                                            Number(Math.round(Number(
                                                (Number(operationalKpIs[i].value.baseline.actualValue) * (1 - (Number(operationalKpIs[i].value.avgBenchmark.actualValue) / 100)))
                                            ) * 10) / 10).toFixed(1)
                                    }
                                    else {
                                        operationalKpIs[i].value.target.actualValue =
                                            //  (Number(operationalKpIs[i].baseline.actualValue) * (1 + (Number(operationalKpIs[i].avgBenchmark.actualValue) / 100))).toFixed(1)
                                            Number(Math.round(Number(
                                                (Number(operationalKpIs[i].value.baseline.actualValue) * (1 + (Number(operationalKpIs[i].value.avgBenchmark.actualValue) / 100)))
                                            ) * 10) / 10).toFixed(1)
                                        operationalKpIs[i].value.target.formattedValue =
                                            //  (Number(operationalKpIs[i].baseline.actualValue) * (1 + (Number(operationalKpIs[i].avgBenchmark.actualValue) / 100))).toFixed(1)
                                            Number(Math.round(Number(
                                                (Number(operationalKpIs[i].value.baseline.actualValue) * (1 + (Number(operationalKpIs[i].value.avgBenchmark.actualValue) / 100)))
                                            ) * 10) / 10).toFixed(1)
                                    }
                                    break;
                                default:
                                    break;

                            }
                        }
                        if (operationalKpIs[i].value.selectedBicBenchmark === true) {
                            switch (event.target.name) {
                                case "Absolute Value":
                                    operationalKpIs[i].value.target.actualValue = operationalKpIs[i].value.bicBenchmark.actualValue
                                    operationalKpIs[i].value.target.formattedValue = operationalKpIs[i].value.bicBenchmark.actualValue
                                    break;
                                case "Absolute Improvement":
                                    if (operationalKpIs[i].value.kpiTrend === "Decrease") {
                                        operationalKpIs[i].value.target.actualValue = (Number(operationalKpIs[i].value.baseline.actualValue) - Number(operationalKpIs[i].value.bicBenchmark.actualValue))
                                        operationalKpIs[i].value.target.formattedValue = (Number(operationalKpIs[i].value.baseline.actualValue) - Number(operationalKpIs[i].value.bicBenchmark.actualValue))
                                    }
                                    else {
                                        operationalKpIs[i].value.target.actualValue = (Number(operationalKpIs[i].value.bicBenchmark.actualValue) + Number(operationalKpIs[i].value.baseline.actualValue))
                                        operationalKpIs[i].value.target.formattedValue = (Number(operationalKpIs[i].value.bicBenchmark.actualValue) + Number(operationalKpIs[i].value.baseline.actualValue))
                                    }
                                    break;
                                case "Relative Improvement":
                                    if (operationalKpIs[i].value.kpiTrend === "Decrease") {
                                        operationalKpIs[i].value.target.actualValue =
                                            Number(Math.round(Number(
                                                (Number(operationalKpIs[i].value.baseline.actualValue) * (1 - (Number(operationalKpIs[i].value.bicBenchmark.actualValue) / 100)))
                                            ) * 10) / 10).toFixed(1)
                                        operationalKpIs[i].value.target.formattedValue =
                                            Number(Math.round(Number(
                                                (Number(operationalKpIs[i].value.baseline.actualValue) * (1 - (Number(operationalKpIs[i].value.bicBenchmark.actualValue) / 100)))
                                            ) * 10) / 10).toFixed(1)
                                    }
                                    else {
                                        operationalKpIs[i].value.target.actualValue =
                                            Number(Math.round(Number(
                                                (Number(operationalKpIs[i].value.baseline.actualValue) * (1 + (Number(operationalKpIs[i].value.bicBenchmark.actualValue) / 100)))
                                            ) * 10) / 10).toFixed(1)
                                        operationalKpIs[i].value.target.formattedValue =
                                            Number(Math.round(Number(
                                                (Number(operationalKpIs[i].value.baseline.actualValue) * (1 + (Number(operationalKpIs[i].value.bicBenchmark.actualValue) / 100)))
                                            ) * 10) / 10).toFixed(1)
                                    }
                                    break;
                                default:
                                    break;

                            }
                        }

                    }

                }

            }
        }
        this.setState({
            operationalKpIs: operationalKpIs
        })
    }

    onChangeTargetAchieved = (selectedOption, index, kpiId) => {
        const { operationalKpIs } = this.props
        const { selectedYearValue } = this.state;
        let selectedKpiId = this.updateId(kpiId);
        if (Object.hasOwnProperty(kpiId) || kpiId === null || kpiId === undefined) {
            selectedKpiId = index;
        } else {
            selectedKpiId = this.updateId(kpiId);
        }
        for (let i = 0; i < operationalKpIs.length; i++) {
            if (this.updateId(operationalKpIs[i].value.kpi_id) === selectedKpiId || i === selectedKpiId) {
                operationalKpIs[i].value.targetAchieved = selectedOption.value
                selectedYearValue[i] = selectedOption;
            }
        }
        this.setState({
            operationalKpIs: operationalKpIs,
            selectedYearValue: selectedYearValue
        })
    }

    onChangeTarget = (event) => {
        const { operationalKpIs } = this.props
        var value = event.target.value.replace(/,/g, '')
        for (let i = 0; i < operationalKpIs.length; i++) {
            if (this.updateId(operationalKpIs[i].value.kpi_id) === this.updateId(event.target.id) || i === this.updateId(event.target.id)) {
                operationalKpIs[i].value.target.actualValue = value === "" ? "" : Number(value)
                operationalKpIs[i].value.target.formattedValue = value === "" ? "" : Number(value)
            }
        }
        this.setState({
            operationalKpIs: operationalKpIs
        })
    }

    onInputFocus(event, param) {
        const { operationalKpIs } = this.props
        switch (param) {
            case 'bicBenchmark':
                for (let i = 0; i < operationalKpIs.length; i++) {
                    if (this.updateId(operationalKpIs[i].value.kpi_id) === this.updateId(event.target.id) || i === this.updateId(event.target.id)) {
                        operationalKpIs[i].value.bicBenchmark.formattedValue = operationalKpIs[i].value.bicBenchmark.actualValue ? operationalKpIs[i].value.bicBenchmark.actualValue : null
                    }
                }
                this.setState({
                    operationalKpIs: operationalKpIs
                })
                break;
            case 'avgBenchmark':
                for (let i = 0; i < operationalKpIs.length; i++) {
                    if (this.updateId(operationalKpIs[i].value.kpi_id) === this.updateId(event.target.id) || i === this.updateId(event.target.id)) {
                        operationalKpIs[i].value.avgBenchmark.formattedValue = operationalKpIs[i].value.avgBenchmark.actualValue ? operationalKpIs[i].value.avgBenchmark.actualValue : null
                    }
                }
                this.setState({
                    operationalKpIs: operationalKpIs
                })
                break;
            case 'baseline':
                for (let i = 0; i < operationalKpIs.length; i++) {
                    if (this.updateId(operationalKpIs[i].value.kpi_id) === this.updateId(event.target.id) || i === this.updateId(event.target.id)) {
                        operationalKpIs[i].value.baseline.formattedValue = operationalKpIs[i].value.baseline.actualValue ? operationalKpIs[i].value.baseline.actualValue : null
                    }
                }
                this.setState({
                    operationalKpIs: operationalKpIs
                })
                break;
            case 'target':
                for (let i = 0; i < operationalKpIs.length; i++) {
                    if (this.updateId(operationalKpIs[i].value.kpi_id) === this.updateId(event.target.id) || i === this.updateId(event.target.id)) {
                        operationalKpIs[i].value.target.formattedValue = operationalKpIs[i].value.target.actualValue ? operationalKpIs[i].value.target.actualValue : null
                    }
                }
                this.setState({
                    operationalKpIs: operationalKpIs
                })
                break;
            // case 'target':
            //     for (let i = 0; i < operationalKpIs.length; i++) {
            //         if (operationalKpIs[i].value.kpi_id === Number(event.target.id) || i === Number(event.target.id)) {
            //             operationalKpIs[i].value.target.formattedValue = operationalKpIs[i].value.target.actualValue ? operationalKpIs[i].value.target.actualValue : null
            //         }
            //     }
            //     this.setState({
            //         operationalKpIs: operationalKpIs
            //     })
            //     break;
            default:
                break;
        }
    }

    onInputBlur(event, param) {
        const { operationalKpIs } = this.props
        switch (param) {
            case 'bicBenchmark':
                for (let i = 0; i < operationalKpIs.length; i++) {
                    if (this.updateId(operationalKpIs[i].value.kpi_id) === this.updateId(event.target.id) || i === this.updateId(event.target.id)) {
                        operationalKpIs[i].value.bicBenchmark.formattedValue = operationalKpIs[i].value.bicBenchmark.actualValue ?
                            // Number(operationalKpIs[i].bicBenchmark.actualValue).toFixed(1)
                            Number(Math.round(Number(operationalKpIs[i].value.bicBenchmark.actualValue) * 10) / 10).toFixed(1)
                            : null
                    }
                }
                this.setState({
                    operationalKpIs: operationalKpIs
                })
                break;
            case 'avgBenchmark':
                for (let i = 0; i < operationalKpIs.length; i++) {
                    if (this.updateId(operationalKpIs[i].value.kpi_id) === this.updateId(event.target.id) || i === this.updateId(event.target.id)) {
                        operationalKpIs[i].value.avgBenchmark.formattedValue = operationalKpIs[i].value.avgBenchmark.actualValue ?
                            // Number(operationalKpIs[i].avgBenchmark.actualValue).toFixed(1) 
                            Number(Math.round(Number(operationalKpIs[i].value.avgBenchmark.actualValue) * 10) / 10).toFixed(1)
                            : null
                    }
                }
                this.setState({
                    operationalKpIs: operationalKpIs
                })
                break;
            case 'baseline':
                for (let i = 0; i < operationalKpIs.length; i++) {
                    if (this.updateId(operationalKpIs[i].value.kpi_id) === this.updateId(event.target.id) || i === this.updateId(event.target.id)) {
                        operationalKpIs[i].value.baseline.formattedValue = operationalKpIs[i].value.baseline.actualValue ?
                            //  Number(operationalKpIs[i].baseline.actualValue).toFixed(1) 
                            Number(Math.round(Number(operationalKpIs[i].value.baseline.actualValue) * 10) / 10).toFixed(1)
                            : null
                    }
                }
                this.setState({
                    operationalKpIs: operationalKpIs
                })
                break;
            case 'target':
                for (let i = 0; i < operationalKpIs.length; i++) {
                    if (this.updateId(operationalKpIs[i].value.kpi_id) === this.updateId(event.target.id) || i === this.updateId(event.target.id)) {
                        operationalKpIs[i].value.target.formattedValue = operationalKpIs[i].value.target.actualValue ?
                            // Number(operationalKpIs[i].target.actualValue).toFixed(1)
                            Number(Math.round(Number(operationalKpIs[i].value.target.actualValue) * 10) / 10).toFixed(1)
                            : null
                    }
                }
                this.setState({
                    operationalKpIs: operationalKpIs
                })
                break;
            default:
                break;
        }
    }

    getYearsArray() {
        return [{ value: null, label: 'Select Year' }, { value: 'Year 1', label: 'Year 1' }, { value: 'Year 2', label: 'Year 2' },
        { value: 'Year 3', label: 'Year 3' }, { value: 'Year 4', label: 'Year 4' }, { value: 'Year 5', label: 'Year 5' }]
    }

    onClickEyeBic(event, kpiId) {
        this.setState({
            clickEyeIconBic: true,
            selectedKpiBic: kpiId,
            sourceValueBic: {},
        })
    }

    onClickEyeCloseBic = () => {
        let temp = this.state.sourceValueBic;
        temp[(Object.keys(this.state.sourceValueBic)[0])] = '';
        this.setState({
            clickEyeIconBic: false,
            selectedKpiBic: '',
            sourceValueBic: { ...temp },
        })
    }

    onChangeSourceInputBic = (e) => {
        if (!RegExp(/[<>!'"[\]]/).test(e.target.value)) {
            this.setState({
                sourceValueBic: { [e.target.id]: e.target.value }
            })
        }
    }

    onSaveSourceInputBic = (e) => {
        // const { customVDTStore } = this.props;
        const { operationalKpIs, sourceValueBic } = this.state;
        let result = operationalKpIs;
        for (let [i, x] of operationalKpIs.entries()) {
            if ((x.value.kpi_id === Number(e.target.id)) && (Number(Object.keys(sourceValueBic)[0]) === Number(e.target.id))) {
                result[i].value.bicBenchmarkSource = sourceValueBic[`${e.target.id}`];
            }
            else if(x.value.kpi_id.includes("Kpi_")){
               if((Number(x.value.kpi_id.split('_')[1]) === Number((e.target.id).split('_')[1] ))){
                result[i].value.bicBenchmarkSource = sourceValueBic[`${e.target.id}`];
               } 
            }
        }
        this.setState(
            {
                operationalKpIs: [...result], sourceValueBic: {}, selectedKpiBic: '',
            })
    }

    onClickEyeAvg(event, kpiId) {
        this.setState({
            clickEyeIconAvg: true,
            selectedKpiAvg: kpiId,
            sourceValueAvg: {},
        })
    }

    onClickEyeCloseAvg = () => {
        let temp = this.state.sourceValueAvg;
        temp[(Object.keys(this.state.sourceValueAvg)[0])] = '';
        this.setState({
            clickEyeIconAvg: false,
            selectedKpiAvg: '',
            sourceValueAvg: { ...temp },
        })
    }

    onChangeSourceInputAvg = (e) => {
        if (!RegExp(/[<>!'"[\]]/).test(e.target.value)) {
            this.setState({
                sourceValueAvg: { [e.target.id]: e.target.value }
            })
        }
    }

    onSaveSourceInputAvg = (e) => {

        const { operationalKpIs, sourceValueAvg } = this.state;
        let result = operationalKpIs;
        for (let [i, x] of operationalKpIs.entries()) {
            if ((x.value.kpi_id === Number(e.target.id)) && (Number(Object.keys(sourceValueAvg)[0]) === Number(e.target.id))) {
                result[i].value.avgBenchmarkSource = sourceValueAvg[`${e.target.id}`];
            }
            else if(x.value.kpi_id.includes("Kpi_")){
                if((Number(x.value.kpi_id.split('_')[1]) === Number((e.target.id).split('_')[1] ))){
                 result[i].value.avgBenchmarkSource = sourceValueAvg[`${e.target.id}`];
                } 
             }
        }
        this.setState(
            {
                operationalKpIs: [...result], sourceValueAvg: {}, selectedKpiAvg: '',
            })
    }

    render() {
        const { operationalKpIs } = this.state;
        const { selectedKpiBic, selectedKpiAvg, sourceValueBic, sourceValueAvg } = this.state;
        let height = 38;
        const getTooltipData = (value) => {
            if (value) {
                let val = String(value).replace(/(?<!\..*)(\d)(?=(?:\d{3})+(?:\.|$))/g, '$1,');
                return `${val}`;
            }
        }
        const yearsArray = this.getYearsArray();
        const defaultStyle = {
            control: (base) => ({
                ...base, color: 'white', backgroundColor: '#404040',
                borderRadius: 0, height: height.toString() + 'px', textAlign: 'center',
                fontSize: '10px', border: '1px solid #606060', borderRight: 'none'
            }),
            container: (base) => ({ width: '100%', backgroundColor: '#404040' }),
            singleValue: (base) => ({ color: 'white' }),
            indicatorSeparator: (base) => ({ ...base, display: 'none' }),
            menu: (base) => ({
                ...base, fontSize: '10px', marginTop: 0, borderRadius: 0,
                color: 'white'
            }),
            indicatorsContainer: (base) => ({ ...base, padding: 0 }),
            menuList: (base) => ({ ...base, padding: 0, border: '1px solid #606060', textAlign: 'left', backgroundColor: '#404040' }),
            dropdownIndicator: (base) => ({ ...base, padding: 0, paddingRight: '2px', color: 'white', ':hover': { color: 'white' }, '& svg': { width: 15, height: 15 } }),
            option: (base) => ({ ...base, padding: 0, paddingLeft: '3px', color: 'white' })
        }
        return (
            <div className="invoice-body custom-vdt-table-main" style={{ marginLeft: '0%', marginTop: 0 }}>
                <div className="d-flex flex-sm-row flex-column justify-content-center">
                    <div className="invoice-itemization" style={{ marginLeft: '0%', paddingLeft: 0, marginBottom: 0 }}>
                        <table className="table" style={{ marginTop: 0, marginBottom: 0 }}>
                            <tbody>
                                {
                                    operationalKpIs.map((kpi, index) => (
                                        // height=height+0.25,
                                        kpi.value !== "" && kpi.value !== undefined ?
                                            <Fragment>
                                                <tr key={index}>
                                                    <td className="colClass" >
                                                        <div className="input-group mb-3" style={{ borderRadius: '0px' }}>
                                                            <input type="text"
                                                                id={(Object.hasOwnProperty(kpi.value.kpi_id) || kpi.value.kpi_id === null) ? index : kpi.value.kpi_id}
                                                                className="form-control"
                                                                style={{ borderRadius: '0px', height: height.toString() + 'px' }}
                                                                defaultValue={kpi && kpi.value.opKpiUnit} />
                                                            {/* Replaced 'value' attribute as 'defaultValue' (in lowercase) */}
                                                        </div>
                                                    </td>
                                                    <td className="colClass" >

                                                        <div className="input-group mb-3" style={{}}>
                                                            <div className="input-group-prepend">
                                                                <div className="input-group-text" style={{ padding: '0px', borderRadius: '0px', borderRight: 'none', height: height.toString() + 'px' }}>
                                                                    <input type="checkbox"
                                                                        checked={kpi.value.selectedBicBenchmark}
                                                                        id={(Object.hasOwnProperty(kpi.value.kpi_id) || kpi.value.kpi_id === null) ? index : kpi.value.kpi_id}
                                                                        name={kpi.value.calculationType}
                                                                        style={{ padding: '0px', marginLeft: '5px', borderRadius: '0px', height: height.toString() + 'px' }}
                                                                        onChange={this.onSelectedBicBenchmark}
                                                                    />
                                                                </div>
                                                            </div>
                                                            <NumberFormat
                                                                data-tip=''
                                                                data-for={`benchmark_tt_${index}`}
                                                                data-type="dark"
                                                                id={(Object.hasOwnProperty(kpi.value.kpi_id) || kpi.value.kpi_id === null) ? index : kpi.value.kpi_id}
                                                                thousandSeparator={true}
                                                                decimalScale={10}
                                                                // decimalprecision={40}
                                                                /* Replaced 'decimalPrecision' prop as 'decimalprecision' (in lowercase) */
                                                                name={kpi.value.calculationType}
                                                                className="form-control"
                                                                style={{
                                                                    borderRadius: '0px',
                                                                    borderLeft: 'none', borderbottom: 'none', height: height.toString() + 'px'
                                                                }}
                                                                onChange={this.onChangeBicBenchmark}
                                                                onFocus={(event) => this.onInputFocus(event, "bicBenchmark")}
                                                                onBlur={(event) => this.onInputBlur(event, "bicBenchmark")}
                                                                value={kpi.value.bicBenchmark && (kpi.value.bicBenchmark.formattedValue > 0 ? kpi.value.bicBenchmark.formattedValue : (kpi.value.bicBenchmark.actualValue === null || kpi.value.bicBenchmark.actualValue === "" ? "" :
                                                                    //  Number(kpi.bicBenchmark.actualValue).toFixed(1)
                                                                    Number(Math.round(Number(kpi.value.bicBenchmark.actualValue) * 10) / 10).toFixed(1)
                                                                ))}
                                                            />
                                                            <ReactTooltip id={`benchmark_tt_${index}`}>
                                                                {getTooltipData(kpi.value.bicBenchmark && kpi.value.bicBenchmark.actualValue ? kpi.value.bicBenchmark.actualValue : null)}
                                                            </ReactTooltip>
                                                            <div className="eye-icon">
                                                                <i onClick={SessionStorage.read("isMaster") === "Y" || SessionStorage.read("accessType") === "Read" ? '' : (event) => this.onClickEyeBic(event, kpi.value.kpi_id)} >
                                                                    <img src={eyeIcon} alt="eye-icon" data-tip='' data-for={`benchmark_eye_tt_${index}`} data-place="top" />
                                                                </i>
                                                                <ReactTooltip id={`benchmark_eye_tt_${index}`}>
                                                                    {"Source : " + getTooltipData(sourceValueBic[kpi.value.kpi_id] === undefined ? kpi.value.bicBenchmarkSource !== null ? kpi.value.bicBenchmarkSource : 'Custom' : sourceValueBic[kpi.value.kpi_id])}
                                                                </ReactTooltip>
                                                            </div>

                                                            <Modal id="eyeDataSource" visible={kpi.value.kpi_id === selectedKpiBic} >
                                                                <div>
                                                                    <div className="row" style={{ margin: "0% 0% 0% 1%", justifyContent: "space-between" }}>
                                                                        <div style={{ padding: "5%", color: "#ffffff" }} >Enter Source Details</div>
                                                                        <div style={{ padding: "5%" }} onClick={this.onClickEyeCloseBic} >
                                                                            <img data-tip="" data-for="close-tooltip" data-place="top" src={closeIcon} alt="close" style={{ width: "12px" }} />
                                                                            <ReactTooltip id="close-tooltip" className="tooltip-class"> <span>Close</span></ReactTooltip>
                                                                        </div>
                                                                    </div>
                                                                    <div className="source-input">
                                                                        <input type="text" id={kpi.value.kpi_id} name="sourceDetails" style={{ background: "#505050", border: "1px solid #F0F0F0", color: "#ffffff" }}
                                                                            onChange={(e) => this.onChangeSourceInputBic(e)}
                                                                            value={sourceValueBic[kpi.value.kpi_id] === undefined ? ( kpi.value.bicBenchmarkSource !== null ? kpi.value.bicBenchmarkSource : 'Custom' ): sourceValueBic[kpi.value.kpi_id]}

                                                                        />
                                                                    </div>
                                                                    <div className="source-save-button">
                                                                        <button id={kpi.value.kpi_id} className="btn btn-primary" style={{ cursor: "pointer", lineHeight: '1' }}
                                                                            onClick={(e) => this.onSaveSourceInputBic(e)}> Save</button>
                                                                    </div>
                                                                </div>
                                                            </Modal>
                                                        </div>

                                                    </td>
                                                    <td className="colClass" >

                                                        <div className="input-group mb-3" style={{}}>
                                                            <div className="input-group-prepend">
                                                                <div className="input-group-text" style={{ padding: '0px', borderRadius: '0px', borderRight: 'none', height: height.toString() + 'px' }}>
                                                                    <input type="checkbox"
                                                                        checked={kpi.value.selectedAvgBenchmark}
                                                                        id={(Object.hasOwnProperty(kpi.value.kpi_id) || kpi.value.kpi_id === null) ? index : kpi.value.kpi_id}
                                                                        name={kpi.value.calculationType}
                                                                        style={{ padding: '0px', marginLeft: '5px', borderRadius: '0px', height: height.toString() + 'px' }}
                                                                        onChange={this.onSelectedAvgBenchmark} />
                                                                </div>
                                                            </div>
                                                            <NumberFormat
                                                                data-tip=''
                                                                data-for={`avg_benchmark_tt_${index}`}
                                                                thousandSeparator={true}
                                                                id={(Object.hasOwnProperty(kpi.value.kpi_id) || kpi.value.kpi_id === null) ? index : kpi.value.kpi_id}
                                                                name={kpi.value.calculationType}
                                                                className="form-control"
                                                                style={{ borderRadius: '0px', height: height.toString() + 'px', borderLeft: 'none', borderbottom: 'none' }}
                                                                value={kpi.value.avgBenchmark && (kpi.value.avgBenchmark.formattedValue > 0 ? kpi.value.avgBenchmark.formattedValue : (kpi.value.avgBenchmark.actualValue === null || kpi.value.avgBenchmark.actualValue === "" ? "" :
                                                                    //  Number(kpi.avgBenchmark.actualValue).toFixed(1)
                                                                    Number(Math.round(Number(kpi.value.avgBenchmark.actualValue) * 10) / 10).toFixed(1)
                                                                ))}
                                                                onChange={this.onChangeAvgBenchmark}
                                                                onFocus={(event) => this.onInputFocus(event, "avgBenchmark")}
                                                                onBlur={(event) => this.onInputBlur(event, "avgBenchmark")}
                                                            />
                                                            <ReactTooltip id={`avg_benchmark_tt_${index}`}>
                                                                {getTooltipData(kpi.value.avgBenchmark && kpi.value.avgBenchmark.actualValue ? kpi.value.avgBenchmark.actualValue : null)}
                                                            </ReactTooltip>
                                                            <div className="eye-icon">
                                                                <i onClick={SessionStorage.read("isMaster") === "Y" || SessionStorage.read("accessType") === "Read" ? '' : (event) => this.onClickEyeAvg(event, kpi.value.kpi_id)} >
                                                                    <img src={eyeIcon} alt="eye-icon" data-tip='' data-for={`benchmark_eye_avg_${index}`} data-place="top" />
                                                                </i>
                                                                <ReactTooltip id={`benchmark_eye_avg_${index}`}>
                                                                    {"Source : " + getTooltipData(sourceValueAvg[kpi.value.kpi_id] === undefined ? kpi.value.avgBenchmarkSource !== null ? kpi.value.avgBenchmarkSource : 'Custom' : sourceValueAvg[kpi.value.kpi_id])}
                                                                </ReactTooltip>
                                                            </div>

                                                            <Modal id="eyeDataSource" visible={kpi.value.kpi_id === selectedKpiAvg} >
                                                                <div>
                                                                    <div className="row" style={{ margin: "0% 0% 0% 1%", justifyContent: "space-between" }}>
                                                                        <div style={{ padding: "5%", color: "#ffffff" }} >Enter Source Details</div>
                                                                        <div style={{ padding: "5%" }} onClick={this.onClickEyeCloseAvg} >
                                                                            <img data-tip="" data-for="close-tooltip" data-place="top" src={closeIcon} alt="close" style={{ width: "12px" }} />
                                                                            <ReactTooltip id="close-tooltip" className="tooltip-class"> <span>Close</span></ReactTooltip>
                                                                        </div>
                                                                    </div>
                                                                    <div className="source-input">
                                                                        <input type="text" id={kpi.value.kpi_id} name="sourceDetails" style={{ background: "#505050", border: "1px solid #F0F0F0", color: "#ffffff" }}
                                                                            onChange={(e) => this.onChangeSourceInputAvg(e)}
                                                                            value={sourceValueAvg[kpi.value.kpi_id] === undefined ? kpi.value.avgBenchmarkSource !== null ? kpi.value.avgBenchmarkSource : 'Custom' : sourceValueAvg[kpi.value.kpi_id]}

                                                                        />
                                                                    </div>
                                                                    <div className="source-save-button">
                                                                        <button id={kpi.value.kpi_id} className="btn btn-primary" style={{ cursor: "pointer", lineHeight: '1' }}
                                                                            onClick={(e) => this.onSaveSourceInputAvg(e)}> Save</button>
                                                                    </div>
                                                                </div>
                                                            </Modal>
                                                        </div>
                                                    </td>
                                                    <td data-tip='' data-type="dark" data-for={`baseline_tt_${index}`} className="colClass" >

                                                        <div className="input-group mb-3" style={{ borderRadius: '0px' }}>
                                                            <NumberFormat
                                                                thousandSeparator={true}
                                                                id={(Object.hasOwnProperty(kpi.value.kpi_id) || kpi.value.kpi_id === null) ? index : kpi.value.kpi_id}
                                                                name={kpi.value.calculationType}
                                                                className="form-control"
                                                                style={{ borderRadius: '0px', height: height.toString() + 'px' }}
                                                                onFocus={(event) => this.onInputFocus(event, "baseline")}
                                                                onBlur={(event) => this.onInputBlur(event, "baseline")}
                                                                onChange={this.onChangeBaseline}
                                                                value={kpi.value.baseline && (kpi.value.baseline.formattedValue > 0 ? kpi.value.baseline.formattedValue : (kpi.value.baseline.actualValue === null || kpi.value.baseline.actualValue === "" ? "" :
                                                                    //  Number(kpi.baseline.actualValue).toFixed(1)
                                                                    Number(Math.round(Number(kpi.value.baseline.actualValue) * 10) / 10).toFixed(1)
                                                                ))}
                                                            />
                                                        </div>
                                                        <ReactTooltip id={`baseline_tt_${index}`}>
                                                            {getTooltipData(kpi.value.baseline && kpi.value.baseline.actualValue ? kpi.value.baseline.actualValue : null)}

                                                        </ReactTooltip>
                                                    </td>
                                                    <td data-tip='' data-for={`target_tt_${index}`} className="colClass" >

                                                        <div className="input-group mb-3" style={{}}>
                                                            <NumberFormat
                                                                thousandSeparator={true}
                                                                id={(Object.hasOwnProperty(kpi.value.kpi_id) || kpi.value.kpi_id === null) ? index : kpi.value.kpi_id}
                                                                className="form-control"
                                                                style={{ borderRadius: '0px', height: height.toString() + 'px' }}
                                                                value={kpi.value.target && (kpi.value.target.formattedValue > 0 ? kpi.value.target.formattedValue : (kpi.value.target.actualValue === null || kpi.value.target.actualValue === "" ? "" :
                                                                    // Number(kpi.target.actualValue).toFixed(1)
                                                                    Number(Math.round(Number(kpi.value.target.actualValue) * 10) / 10).toFixed(1)
                                                                ))}
                                                                onFocus={(event) => this.onInputFocus(event, "target")}
                                                                onBlur={(event) => this.onInputBlur(event, "target")}
                                                                onChange={this.onChangeTarget} />
                                                        </div>
                                                        <ReactTooltip id={`target_tt_${index}`}>
                                                            {getTooltipData(kpi.value.target && kpi.value.target.actualValue ? kpi.value.target.actualValue : null)}
                                                        </ReactTooltip>
                                                    </td>
                                                    <td className="colClass">
                                                        <div className="input-group mb-3">
                                                            <Select
                                                                name="years_select_box"
                                                                id={(Object.hasOwnProperty(kpi.value.kpi_id) || kpi.value.kpi_id === null) ? index : kpi.value.kpi_id}
                                                                value={this.state.selectedYearValue[index]}
                                                                onChange={(event) => { this.onChangeTargetAchieved(event, index, kpi.value.kpi_id) }}
                                                                options={yearsArray}
                                                                styles={defaultStyle}
                                                                theme={theme => ({
                                                                    ...theme,
                                                                    colors: {
                                                                        ...theme.colors,
                                                                        primary25: '#004DFF',
                                                                        primary: '#00BAFF',
                                                                        primary50: '#004DFF'
                                                                    },


                                                                })}
                                                            />
                                                        </div>
                                                    </td>
                                                </tr>
                                            </Fragment> : ''
                                    ))}
                            </tbody>
                        </table>
                    </div >
                </div >
            </div >
        )
    }
}

export default withRouter(CustomVDTTable);