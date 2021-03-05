import React, { Component } from 'react';
import { withRouter } from "react-router-dom";
import './VisualVDTTable.css';
import { observer, inject } from 'mobx-react';
import NumberFormat from 'react-number-format';
import ReactTooltip from 'react-tooltip'
import eyeIcon from '../../assets/project/fvdt/eyeIcon.svg';
import Modal from 'react-bootstrap4-modal';
import closeIcon from "../../assets/project/fvdt/crossIcon.svg";

var SessionStorage = require('store/storages/sessionStorage');

@inject('reviewValueDriverStore')
@observer
class VisualVDTTable extends Component {
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
        this.checkUncheckKPIS = this.checkUncheckKPIS.bind(this)
    }

    componentDidMount() {
        //this.checkUncheckKPIS();
        this.populateOpkpiObject();
    }

    populateOpkpiObject(){
        const{ reviewValueDriverStore}= this.props;
        const { operationalKpIs } = reviewValueDriverStore;
        this.setState({
            operationalKpIs: operationalKpIs,
            sourceValueBic: {},
            sourceValueAvg: {}
        });

        for (let i = 0; i < operationalKpIs.length; i++) {
            if(operationalKpIs[i] !== null){
            if (operationalKpIs[i].bicBenchmark === "null" || operationalKpIs[i].bicBenchmark === null || operationalKpIs[i].bicBenchmark === "") {
              operationalKpIs[i].bicBenchmark = {
                'actualValue': '',
                'formattedValue': 0
              }
            }
            else {
              if (typeof operationalKpIs[i].bicBenchmark !== 'object') {
                operationalKpIs[i].bicBenchmark = {
                  'actualValue': Number(operationalKpIs[i].bicBenchmark),
                  'formattedValue': 0
                }
              }
            }
            if (operationalKpIs[i].baseline === "null" || operationalKpIs[i].baseline === null || operationalKpIs[i].baseline === "") {
              operationalKpIs[i].baseline = {
                'actualValue': '',
                'formattedValue': 0
              }
            }
            else {
              if (typeof operationalKpIs[i].baseline !== 'object') {
                operationalKpIs[i].baseline = {
                  'actualValue': Number(operationalKpIs[i].baseline),
                  'formattedValue': 0
                }
              }
            }
            if (operationalKpIs[i].avgBenchmark === "null" || operationalKpIs[i].avgBenchmark === null || operationalKpIs[i].avgBenchmark === "") {
              operationalKpIs[i].avgBenchmark = {
                'actualValue': '',
                'formattedValue': 0
              }
            }
            else {
              if (typeof operationalKpIs[i].avgBenchmark !== 'object') {
                operationalKpIs[i].avgBenchmark = {
                  'actualValue': Number(operationalKpIs[i].avgBenchmark),
                  'formattedValue': 0
                }
              }
            }
            if (operationalKpIs[i].target === "null" ||operationalKpIs[i].target === null || operationalKpIs[i].target === "") {
              operationalKpIs[i].target = {
                'actualValue': '',
                'formattedValue': 0
              }
            }
            else {
      
              if (typeof operationalKpIs[i].target !== 'object') {
                operationalKpIs[i].target = {
                  'actualValue': Number(operationalKpIs[i].target),
                  'formattedValue': 0
                }
              }
            }
             switch (operationalKpIs[i].enabledBenchmark) {
              case "BIC":
                operationalKpIs[i].selectedBicBenchmark = true
                break;
              case "AVG":
                operationalKpIs[i].selectedAvgBenchmark = true
                break;
      
              default:
                break;
      
            }
          }
        }
    }
       
   

    checkUncheckKPIS() {
        const { reviewValueDriverStore, oldKPIValues } = this.props;
        let { operationalKpIs } = reviewValueDriverStore;

        for (let i = 0; i < operationalKpIs.length; i++) {
            for (let j = 0; j < oldKPIValues.length; j++) {
                if (operationalKpIs[i].kpiId === oldKPIValues[j].kpiId) {
                    operationalKpIs[i].selectedAvgBenchmark = oldKPIValues[j].selectedAvgBenchmark
                    operationalKpIs[i].selectedBicBenchmark = oldKPIValues[j].selectedBicBenchmark
                }
                if (operationalKpIs[i].kpiId === oldKPIValues[j].kpiId) {
                    if (operationalKpIs[i].selectedAvgBenchmark === true) {
                        switch (operationalKpIs[i].calculationType) {
                            case "Absolute Value":
                                operationalKpIs[i].target = {
                                    "actualValue": Number(operationalKpIs[i].avgBenchmark),
                                    "formattedValue": 0
                                }
                                break;
                            case "Absolute Improvement":
                                if (operationalKpIs[i].kpiTrend === "Decrease") {
                                    operationalKpIs[i].target = {
                                        "actualValue": (Number(operationalKpIs[i].baseline) - Number(operationalKpIs[i].avgBenchmark)),
                                        "formattedValue": 0
                                    }
                                }
                                else {
                                    operationalKpIs[i].target = {
                                        "actualValue": (Number(operationalKpIs[i].avgBenchmark) + Number(operationalKpIs[i].baseline)),
                                        "formattedValue": 0
                                    }
                                }
                                break;
                            case "Relative Improvement":
                                if (operationalKpIs[i].kpiTrend === "Decrease") {
                                    operationalKpIs[i].target = {
                                        "actualValue": Number(Math.round(Number(
                                            (Number(operationalKpIs[i].baseline) * (1 - (Number(operationalKpIs[i].avgBenchmark) / 100)))
                                        ) * 10) / 10).toFixed(1),
                                        "formattedValue": 0
                                    }
                                }
                                else {
                                    operationalKpIs[i].target = {
                                        "actualValue": Number(Math.round(Number(
                                            (Number(operationalKpIs[i].baseline) * (1 + (Number(operationalKpIs[i].avgBenchmark) / 100)))
                                        ) * 10) / 10).toFixed(1),
                                        "formattedValue": 0
                                    }
                                }
                                break;
                            default:
                                break;

                        }
                    }
                    if (operationalKpIs[i].selectedBicBenchmark === true) {
                        switch (operationalKpIs[i].calculationType) {
                            case "Absolute Value":
                                operationalKpIs[i].target = {
                                    "actualValue": Number(operationalKpIs[i].bicBenchmark),
                                    "formattedValue": 0
                                }
                                break;
                            case "Absolute Improvement":

                                if (operationalKpIs[i].kpiTrend === "Decrease") {
                                    operationalKpIs[i].target = {
                                        "actualValue": (Number(operationalKpIs[i].baseline) - Number(operationalKpIs[i].bicBenchmark)),
                                        "formattedValue": 0
                                    }
                                }
                                else {
                                    operationalKpIs[i].target = {
                                        "actualValue": (Number(operationalKpIs[i].bicBenchmark) + Number(operationalKpIs[i].baseline)),
                                        "formattedValue": 0
                                    }
                                }
                                break;
                            case "Relative Improvement":
                                if (operationalKpIs[i].kpiTrend === "Decrease") {
                                    operationalKpIs[i].target = {
                                        "actualValue": Number(Math.round(Number(
                                            (Number(operationalKpIs[i].baseline) * (1 - (Number(operationalKpIs[i].bicBenchmark) / 100)))
                                        ) * 10) / 10).toFixed(1),
                                        "formattedValue": 0
                                    }
                                } else {
                                    operationalKpIs[i].target = {
                                        "actualValue": Number(Math.round(Number(
                                            (Number(operationalKpIs[i].baseline) * (1 + (Number(operationalKpIs[i].bicBenchmark) / 100)))
                                        ) * 10) / 10).toFixed(1),
                                        "formattedValue": 0
                                    }
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

    updateId(value) {
        let val = ""
        if (value !== null && value !== undefined) {
            if (typeof value !== "string") {
                value = value.toString()
            }
            if (value.includes("_")) {
                val = Number(value.split("_")[1])
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
        const { reviewValueDriverStore } = this.props;
        const { operationalKpIs } = reviewValueDriverStore;
        for (let i = 0; i < operationalKpIs.length; i++) {
            if (i === this.updateId(event.target.id)) {
                operationalKpIs[i].kpiFrequency = event.target.value
            }
        }
        this.setState({
            operationalKpIs: operationalKpIs
        })
    }

    onSelectedBicBenchmark = (event) => {

        const { reviewValueDriverStore } = this.props;
        const { operationalKpIs } = reviewValueDriverStore;

        this.setState({
            selectedBicBenchmark: true,
            onSelectedAvgBenchmark: false,
        })

        if (event.target.checked) {
            for (let i = 0; i < operationalKpIs.length; i++) {
                if (i === this.updateId(event.target.id)) {
                    if (operationalKpIs[i].bicBenchmark !== "null" && operationalKpIs[i].bicBenchmark !== "") {
                        switch (event.target.name) {
                            case "Absolute Value":
                                operationalKpIs[i].target.actualValue = operationalKpIs[i].bicBenchmark.actualValue
                                operationalKpIs[i].target.formattedValue = operationalKpIs[i].bicBenchmark.actualValue
                                break;
                            case "Absolute Improvement":
                                if (operationalKpIs[i].kpiTrend === "Decrease") {
                                    operationalKpIs[i].target.actualValue = (Number(operationalKpIs[i].baseline.actualValue) - Number(operationalKpIs[i].bicBenchmark.actualValue))
                                    operationalKpIs[i].target.formattedValue = (Number(operationalKpIs[i].baseline.actualValue) - Number(operationalKpIs[i].bicBenchmark.actualValue))
                                }
                                else {
                                    operationalKpIs[i].target.actualValue = (Number(operationalKpIs[i].bicBenchmark.actualValue) + Number(operationalKpIs[i].baseline.actualValue))
                                    operationalKpIs[i].target.formattedValue = (Number(operationalKpIs[i].bicBenchmark.actualValue) + Number(operationalKpIs[i].baseline.actualValue))
                                }
                                break;
                            case "Relative Improvement":
                                if (operationalKpIs[i].kpiTrend === "Decrease") {
                                    operationalKpIs[i].target.actualValue =
                                        Number(Math.round(Number(
                                            (Number(operationalKpIs[i].baseline.actualValue) * (1 - (Number(operationalKpIs[i].bicBenchmark.actualValue) / 100)))
                                        ) * 10) / 10).toFixed(1)
                                    operationalKpIs[i].target.formattedValue =
                                        Number(Math.round(Number(
                                            (Number(operationalKpIs[i].baseline.actualValue) * (1 - (Number(operationalKpIs[i].bicBenchmark.actualValue) / 100)))
                                        ) * 10) / 10).toFixed(1)
                                } else {
                                    operationalKpIs[i].target.actualValue =
                                        Number(Math.round(Number(
                                            (Number(operationalKpIs[i].baseline.actualValue) * (1 + (Number(operationalKpIs[i].bicBenchmark.actualValue) / 100)))
                                        ) * 10) / 10).toFixed(1)
                                    operationalKpIs[i].target.formattedValue =
                                        Number(Math.round(Number(
                                            (Number(operationalKpIs[i].baseline.actualValue) * (1 + (Number(operationalKpIs[i].bicBenchmark.actualValue) / 100)))
                                        ) * 10) / 10).toFixed(1)
                                }
                                break;
                            default:
                                break;

                        }
                    }
                    operationalKpIs[i].selectedBicBenchmark = true
                    operationalKpIs[i].selectedAvgBenchmark = false
                    operationalKpIs[i].enabledBenchmark = "BIC"
                }
            }
            this.setState({
                operationalKpIs: operationalKpIs
            })
        }
        else {
            for (let i = 0; i < operationalKpIs.length; i++) {
                if (i === this.updateId(event.target.id)) {
                    operationalKpIs[i].selectedBicBenchmark = false;
                    operationalKpIs[i].enabledBenchmark = null
                }
            }
            this.setState({
                operationalKpIs: operationalKpIs
            })
        }

    }

    onSelectedAvgBenchmark = (event) => {
        const { reviewValueDriverStore } = this.props;
        const { operationalKpIs } = reviewValueDriverStore;
        this.setState({
            selectedBicBenchmark: false,
            selectedAvgBenchmark: true
        })
        if (event.target.checked) {
            for (let i = 0; i < operationalKpIs.length; i++) {
                if (i === this.updateId(event.target.id)) {
                    if (operationalKpIs[i].avgBenchmark !== "null" && operationalKpIs[i].avgBenchmark !== "") {
                        switch (event.target.name) {
                            case "Absolute Value":
                                operationalKpIs[i].target.actualValue = operationalKpIs[i].avgBenchmark.actualValue
                                operationalKpIs[i].target.formattedValue = operationalKpIs[i].avgBenchmark.actualValue
                                break;
                            case "Absolute Improvement":
                                if (operationalKpIs[i].kpiTrend === "Decrease") {
                                    operationalKpIs[i].target.actualValue = (Number(operationalKpIs[i].baseline.actualValue) - Number(operationalKpIs[i].avgBenchmark.actualValue))
                                    operationalKpIs[i].target.formattedValue = (Number(operationalKpIs[i].baseline.actualValue) - Number(operationalKpIs[i].avgBenchmark.actualValue))
                                }
                                else {
                                    operationalKpIs[i].target.actualValue = (Number(operationalKpIs[i].avgBenchmark.actualValue) + Number(operationalKpIs[i].baseline.actualValue))
                                    operationalKpIs[i].target.formattedValue = (Number(operationalKpIs[i].avgBenchmark.actualValue) + Number(operationalKpIs[i].baseline.actualValue))
                                }
                                break;
                            case "Relative Improvement":
                                if (operationalKpIs[i].kpiTrend === "Decrease") {
                                    operationalKpIs[i].target.actualValue =
                                        Number(Math.round(Number(
                                            (Number(operationalKpIs[i].baseline.actualValue) * (1 - (Number(operationalKpIs[i].avgBenchmark.actualValue) / 100)))
                                        ) * 10) / 10).toFixed(1)
                                    operationalKpIs[i].target.formattedValue =
                                        Number(Math.round(Number(
                                            (Number(operationalKpIs[i].baseline.actualValue) * (1 - (Number(operationalKpIs[i].avgBenchmark.actualValue) / 100)))
                                        ) * 10) / 10).toFixed(1)
                                }
                                else {
                                    operationalKpIs[i].target.actualValue =
                                        Number(Math.round(Number(
                                            (Number(operationalKpIs[i].baseline.actualValue) * (1 + (Number(operationalKpIs[i].avgBenchmark.actualValue) / 100)))
                                        ) * 10) / 10).toFixed(1)
                                    operationalKpIs[i].target.formattedValue =
                                        Number(Math.round(Number(
                                            (Number(operationalKpIs[i].baseline.actualValue) * (1 + (Number(operationalKpIs[i].avgBenchmark.actualValue) / 100)))
                                        ) * 10) / 10).toFixed(1)
                                }
                                break;
                            default:
                                break;

                        }
                    }
                    operationalKpIs[i].selectedAvgBenchmark = true
                    operationalKpIs[i].selectedBicBenchmark = false
                    operationalKpIs[i].enabledBenchmark = "AVG"
                }
            }
            this.setState({
                operationalKpIs: operationalKpIs
            })
        }
        else {
            for (let i = 0; i < operationalKpIs.length; i++) {
                if (i === this.updateId(event.target.id)) {
                    operationalKpIs[i].selectedAvgBenchmark = false;
                    operationalKpIs[i].enabledBenchmark = null
                }
            }
            this.setState({
                operationalKpIs: operationalKpIs
            })
        }
    }

    onChangeBicBenchmark = (event) => {
        const { reviewValueDriverStore } = this.props;
        var value = event.target.value.replace(/,/g, '')
        const { operationalKpIs } = reviewValueDriverStore;
        for (let i = 0; i < operationalKpIs.length; i++) {
            if (i === this.updateId(event.target.id)) {
                operationalKpIs[i].bicBenchmarkSource = "Custom"
                operationalKpIs[i].bicBenchmark.actualValue = value === "" ? "" : Number(value)
                operationalKpIs[i].bicBenchmark.formattedValue = value === "" ? "" : Number(value)
                if (operationalKpIs[i].selectedBicBenchmark === true) {
                    switch (event.target.name) {
                        case "Absolute Value":
                            operationalKpIs[i].target.actualValue = operationalKpIs[i].bicBenchmark.actualValue
                            operationalKpIs[i].target.formattedValue = operationalKpIs[i].bicBenchmark.actualValue
                            break;
                        case "Absolute Improvement":
                            if (operationalKpIs[i].kpiTrend === "Decrease") {
                                operationalKpIs[i].target.actualValue = (Number(operationalKpIs[i].baseline.actualValue) - Number(operationalKpIs[i].bicBenchmark.actualValue))
                                operationalKpIs[i].target.formattedValue = (Number(operationalKpIs[i].baseline.actualValue) - Number(operationalKpIs[i].bicBenchmark.actualValue))
                            }
                            else {
                                operationalKpIs[i].target.actualValue = (Number(operationalKpIs[i].bicBenchmark.actualValue) + Number(operationalKpIs[i].baseline.actualValue))
                                operationalKpIs[i].target.formattedValue = (Number(operationalKpIs[i].bicBenchmark.actualValue) + Number(operationalKpIs[i].baseline.actualValue))
                            }
                            break;
                        case "Relative Improvement":
                            if (operationalKpIs[i].kpiTrend === "Decrease") {
                                operationalKpIs[i].target.actualValue = Number(Math.round(Number(
                                    (Number(operationalKpIs[i].baseline.actualValue) * (1 - (Number(operationalKpIs[i].bicBenchmark.actualValue) / 100)))
                                ) * 10) / 10).toFixed(1)
                                operationalKpIs[i].target.formattedValue = Number(Math.round(Number(
                                    (Number(operationalKpIs[i].baseline.actualValue) * (1 - (Number(operationalKpIs[i].bicBenchmark.actualValue) / 100)))
                                ) * 10) / 10).toFixed(1)
                            }
                            else {
                                operationalKpIs[i].target.actualValue = Number(Math.round(Number(
                                    (Number(operationalKpIs[i].baseline.actualValue) * (1 + (Number(operationalKpIs[i].bicBenchmark.actualValue) / 100)))
                                ) * 10) / 10).toFixed(1)
                                operationalKpIs[i].target.formattedValue = Number(Math.round(Number(
                                    (Number(operationalKpIs[i].baseline.actualValue) * (1 + (Number(operationalKpIs[i].bicBenchmark.actualValue) / 100)))
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
        const { reviewValueDriverStore } = this.props;
        const { operationalKpIs } = reviewValueDriverStore;
        var value = event.target.value.replace(/,/g, '')
        for (let i = 0; i < operationalKpIs.length; i++) {
            if (i === this.updateId(event.target.id)) {
                operationalKpIs[i].avgBenchmarkSource = 'Custom'
                operationalKpIs[i].avgBenchmark.actualValue = value === "" ? "" : Number(value)
                operationalKpIs[i].avgBenchmark.formattedValue = value === "" ? "" : Number(value)
                if (operationalKpIs[i].selectedAvgBenchmark === true) {
                    switch (event.target.name) {
                        case "Absolute Value":
                            operationalKpIs[i].target.actualValue = operationalKpIs[i].avgBenchmark.actualValue
                            operationalKpIs[i].target.formattedValue = operationalKpIs[i].avgBenchmark.actualValue
                            break;
                        case "Absolute Improvement":
                            if (operationalKpIs[i].kpiTrend === "Decrease") {
                                operationalKpIs[i].target.actualValue = (Number(operationalKpIs[i].baseline.actualValue) - Number(operationalKpIs[i].avgBenchmark.actualValue))
                                operationalKpIs[i].target.formattedValue = (Number(operationalKpIs[i].baseline.actualValue) - Number(operationalKpIs[i].avgBenchmark.actualValue))
                            }
                            else {
                                operationalKpIs[i].target.actualValue = (Number(operationalKpIs[i].avgBenchmark.actualValue) + Number(operationalKpIs[i].baseline.actualValue))
                                operationalKpIs[i].target.formattedValue = (Number(operationalKpIs[i].avgBenchmark.actualValue) + Number(operationalKpIs[i].baseline.actualValue))
                            }
                            break;
                        case "Relative Improvement":
                            if (operationalKpIs[i].kpiTrend === "Decrease") {
                                operationalKpIs[i].target.actualValue =
                                    // (Number(operationalKpIs[i].baseline.actualValue) * (1 - (Number(operationalKpIs[i].avgBenchmark.actualValue) / 100))).toFixed(1)
                                    Number(Math.round(Number(
                                        (Number(operationalKpIs[i].baseline.actualValue) * (1 - (Number(operationalKpIs[i].avgBenchmark.actualValue) / 100)))
                                    ) * 10) / 10).toFixed(1)
                                operationalKpIs[i].target.formattedValue =
                                    // (Number(operationalKpIs[i].baseline.actualValue) * (1 - (Number(operationalKpIs[i].avgBenchmark.actualValue) / 100))).toFixed(1)
                                    Number(Math.round(Number(
                                        (Number(operationalKpIs[i].baseline.actualValue) * (1 - (Number(operationalKpIs[i].avgBenchmark.actualValue) / 100)))
                                    ) * 10) / 10).toFixed(1)
                            }
                            else {
                                operationalKpIs[i].target.actualValue =
                                    // (Number(operationalKpIs[i].baseline.actualValue) * (1 + (Number(operationalKpIs[i].avgBenchmark.actualValue) / 100))).toFixed(1)
                                    Number(Math.round(Number(
                                        (Number(operationalKpIs[i].baseline.actualValue) * (1 + (Number(operationalKpIs[i].avgBenchmark.actualValue) / 100)))
                                    ) * 10) / 10).toFixed(1)
                                operationalKpIs[i].target.formattedValue =
                                    // (Number(operationalKpIs[i].baseline.actualValue) * (1 + (Number(operationalKpIs[i].avgBenchmark.actualValue) / 100))).toFixed(1)
                                    Number(Math.round(Number(
                                        (Number(operationalKpIs[i].baseline.actualValue) * (1 + (Number(operationalKpIs[i].avgBenchmark.actualValue) / 100)))
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
        const { reviewValueDriverStore } = this.props;
        const { operationalKpIs } = reviewValueDriverStore;
        var value = event.target.value.replace(/,/g, '')
        for (let i = 0; i < operationalKpIs.length; i++) {
            if (i === this.updateId(event.target.id)) {
                operationalKpIs[i].baseline.actualValue = value === "" ? "" : Number(value)
                operationalKpIs[i].baseline.formattedValue = value === "" ? "" : Number(value)
                if (operationalKpIs[i].selectedAvgBenchmark !== undefined || operationalKpIs[i].selectedBicBenchmark !== undefined) {
                    if (operationalKpIs[i].selectedAvgBenchmark !== false || operationalKpIs[i].selectedBicBenchmark !== false) {
                        if (operationalKpIs[i].selectedAvgBenchmark === true) {
                            switch (event.target.name) {
                                case "Absolute Value":
                                    operationalKpIs[i].target.actualValue = operationalKpIs[i].avgBenchmark.actualValue
                                    operationalKpIs[i].target.formattedValue = operationalKpIs[i].avgBenchmark.actualValue
                                    break;
                                case "Absolute Improvement":
                                    if (operationalKpIs[i].kpiTrend === "Decrease") {
                                        operationalKpIs[i].target.actualValue = (Number(operationalKpIs[i].baseline.actualValue) - Number(operationalKpIs[i].avgBenchmark.actualValue))
                                        operationalKpIs[i].target.formattedValue = (Number(operationalKpIs[i].baseline.actualValue) - Number(operationalKpIs[i].avgBenchmark.actualValue))
                                    }
                                    else {
                                        operationalKpIs[i].target.actualValue = (Number(operationalKpIs[i].avgBenchmark.actualValue) + Number(operationalKpIs[i].baseline.actualValue))
                                        operationalKpIs[i].target.formattedValue = (Number(operationalKpIs[i].avgBenchmark.actualValue) + Number(operationalKpIs[i].baseline.actualValue))
                                    }
                                    break;
                                case "Relative Improvement":
                                    if (operationalKpIs[i].kpiTrend === "Decrease") {
                                        operationalKpIs[i].target.actualValue =
                                            // (Number(operationalKpIs[i].baseline.actualValue) * (1 - (Number(operationalKpIs[i].avgBenchmark.actualValue) / 100))).toFixed(1)
                                            Number(Math.round(Number(
                                                (Number(operationalKpIs[i].baseline.actualValue) * (1 - (Number(operationalKpIs[i].avgBenchmark.actualValue) / 100)))
                                            ) * 10) / 10).toFixed(1)
                                        operationalKpIs[i].target.formattedValue =
                                            // (Number(operationalKpIs[i].baseline.actualValue) * (1 - (Number(operationalKpIs[i].avgBenchmark.actualValue) / 100))).toFixed(1)
                                            Number(Math.round(Number(
                                                (Number(operationalKpIs[i].baseline.actualValue) * (1 - (Number(operationalKpIs[i].avgBenchmark.actualValue) / 100)))
                                            ) * 10) / 10).toFixed(1)
                                    }
                                    else {
                                        operationalKpIs[i].target.actualValue =
                                            //  (Number(operationalKpIs[i].baseline.actualValue) * (1 + (Number(operationalKpIs[i].avgBenchmark.actualValue) / 100))).toFixed(1)
                                            Number(Math.round(Number(
                                                (Number(operationalKpIs[i].baseline.actualValue) * (1 + (Number(operationalKpIs[i].avgBenchmark.actualValue) / 100)))
                                            ) * 10) / 10).toFixed(1)
                                        operationalKpIs[i].target.formattedValue =
                                            //  (Number(operationalKpIs[i].baseline.actualValue) * (1 + (Number(operationalKpIs[i].avgBenchmark.actualValue) / 100))).toFixed(1)
                                            Number(Math.round(Number(
                                                (Number(operationalKpIs[i].baseline.actualValue) * (1 + (Number(operationalKpIs[i].avgBenchmark.actualValue) / 100)))
                                            ) * 10) / 10).toFixed(1)
                                    }
                                    break;
                                default:
                                    break;

                            }
                        }
                        if (operationalKpIs[i].selectedBicBenchmark === true) {
                            switch (event.target.name) {
                                case "Absolute Value":
                                    operationalKpIs[i].target.actualValue = operationalKpIs[i].bicBenchmark.actualValue
                                    operationalKpIs[i].target.formattedValue = operationalKpIs[i].bicBenchmark.actualValue
                                    break;
                                case "Absolute Improvement":
                                    if (operationalKpIs[i].kpiTrend === "Decrease") {
                                        operationalKpIs[i].target.actualValue = (Number(operationalKpIs[i].baseline.actualValue) - Number(operationalKpIs[i].bicBenchmark.actualValue))
                                        operationalKpIs[i].target.formattedValue = (Number(operationalKpIs[i].baseline.actualValue) - Number(operationalKpIs[i].bicBenchmark.actualValue))
                                    }
                                    else {
                                        operationalKpIs[i].target.actualValue = (Number(operationalKpIs[i].bicBenchmark.actualValue) + Number(operationalKpIs[i].baseline.actualValue))
                                        operationalKpIs[i].target.formattedValue = (Number(operationalKpIs[i].bicBenchmark.actualValue) + Number(operationalKpIs[i].baseline.actualValue))
                                    }
                                    break;
                                case "Relative Improvement":
                                    if (operationalKpIs[i].kpiTrend === "Decrease") {
                                        operationalKpIs[i].target.actualValue =
                                            Number(Math.round(Number(
                                                (Number(operationalKpIs[i].baseline.actualValue) * (1 - (Number(operationalKpIs[i].bicBenchmark.actualValue) / 100)))
                                            ) * 10) / 10).toFixed(1)
                                        operationalKpIs[i].target.formattedValue =
                                            Number(Math.round(Number(
                                                (Number(operationalKpIs[i].baseline.actualValue) * (1 - (Number(operationalKpIs[i].bicBenchmark.actualValue) / 100)))
                                            ) * 10) / 10).toFixed(1)
                                    }
                                    else {
                                        operationalKpIs[i].target.actualValue =
                                            Number(Math.round(Number(
                                                (Number(operationalKpIs[i].baseline.actualValue) * (1 + (Number(operationalKpIs[i].bicBenchmark.actualValue) / 100)))
                                            ) * 10) / 10).toFixed(1)
                                        operationalKpIs[i].target.formattedValue =
                                            Number(Math.round(Number(
                                                (Number(operationalKpIs[i].baseline.actualValue) * (1 + (Number(operationalKpIs[i].bicBenchmark.actualValue) / 100)))
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

    /*onChangeTargetAchieved = (selectedOption, index, kpiId) => {
        const { reviewValueDriverStore } = this.props;
        const { operationalKpIs } = reviewValueDriverStore;
        const { selectedYearValue } = this.state;
        for (let i = 0; i < operationalKpIs.length; i++) {
            if (i === this.updateId(index)) {
                operationalKpIs[i].targetAchieved = selectedOption.value
                selectedYearValue[i] = selectedOption;
            }
        }
        this.setState({
            operationalKpIs: operationalKpIs,
            selectedYearValue: selectedYearValue
        })
    }*/

    onChangeTargetAchieved = (event, index) => {
        const { reviewValueDriverStore } = this.props;
        const { operationalKpIs } = reviewValueDriverStore;
        for (let i = 0; i < operationalKpIs.length; i++) {
            if (i === this.updateId(index)) {
                operationalKpIs[i].targetAchieved = event.target.value
            }
        }
        this.setState({
            operationalKpIs: operationalKpIs
        })
    }

    onChangeTarget = (event) => {
        const { reviewValueDriverStore } = this.props;
        const { operationalKpIs } = reviewValueDriverStore;
        var value = event.target.value.replace(/,/g, '')
        for (let i = 0; i < operationalKpIs.length; i++) {
            if (i === this.updateId(event.target.id)) {
                operationalKpIs[i].target.actualValue = value === "" || null ? "" : Number(value)
                operationalKpIs[i].target.formattedValue = value === "" || null ? "" : Number(value)
            }
        }
        this.setState({
            operationalKpIs: operationalKpIs
        })
    }

    onInputFocus(event, param) {
        const { reviewValueDriverStore } = this.props;
        const { operationalKpIs } = reviewValueDriverStore;
        switch (param) {
            case 'bicBenchmark':
                for (let i = 0; i < operationalKpIs.length; i++) {
                    if (i === this.updateId(event.target.id)) {
                        operationalKpIs[i].bicBenchmark.formattedValue = operationalKpIs[i].bicBenchmark.actualValue ? operationalKpIs[i].bicBenchmark.actualValue : null
                    }
                }
                this.setState({
                    operationalKpIs: operationalKpIs
                });
                break;
            case 'avgBenchmark':
                for (let i = 0; i < operationalKpIs.length; i++) {
                    if (i === this.updateId(event.target.id)) {
                        operationalKpIs[i].avgBenchmark.formattedValue = operationalKpIs[i].avgBenchmark.actualValue ? operationalKpIs[i].avgBenchmark.actualValue : null
                    }
                }
                this.setState({
                    operationalKpIs: operationalKpIs
                });
                break;
            case 'baseline':
                for (let i = 0; i < operationalKpIs.length; i++) {
                    if (i === this.updateId(event.target.id)) {
                        operationalKpIs[i].baseline.formattedValue = operationalKpIs[i].baseline.actualValue ? operationalKpIs[i].baseline.actualValue : null
                    }
                }
                this.setState({
                    operationalKpIs: operationalKpIs
                })
                break;
            case 'target':
                for (let i = 0; i < operationalKpIs.length; i++) {
                    if (i === this.updateId(event.target.id)) {
                        operationalKpIs[i].target.formattedValue = operationalKpIs[i].target.actualValue ? operationalKpIs[i].target.actualValue : null
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

    onInputBlur(event, param) {
        const { reviewValueDriverStore } = this.props;
        const { operationalKpIs } = reviewValueDriverStore;
        switch (param) {
            case 'bicBenchmark':
                for (let i = 0; i < operationalKpIs.length; i++) {
                    if (i === this.updateId(event.target.id)) {
                        operationalKpIs[i].bicBenchmark.formattedValue = operationalKpIs[i].bicBenchmark.actualValue ?
                            // Number(operationalKpIs[i].bicBenchmark.actualValue).toFixed(1)
                            Number(Math.round(Number(operationalKpIs[i].bicBenchmark.actualValue) * 10) / 10).toFixed(1)
                            : null
                    }
                }
                this.setState({
                    operationalKpIs: operationalKpIs
                })
                break;
            case 'avgBenchmark':
                for (let i = 0; i < operationalKpIs.length; i++) {
                    if (i === this.updateId(event.target.id)) {
                        operationalKpIs[i].avgBenchmark.formattedValue = operationalKpIs[i].avgBenchmark.actualValue ?
                            // Number(operationalKpIs[i].avgBenchmark.actualValue).toFixed(1) 
                            Number(Math.round(Number(operationalKpIs[i].avgBenchmark.actualValue) * 10) / 10).toFixed(1)
                            : null
                    }
                }
                this.setState({
                    operationalKpIs: operationalKpIs
                })
                break;
            case 'baseline':
                for (let i = 0; i < operationalKpIs.length; i++) {
                    if (i === this.updateId(event.target.id)) {
                        operationalKpIs[i].baseline.formattedValue = operationalKpIs[i].baseline.actualValue ?
                            //  Number(operationalKpIs[i].baseline.actualValue).toFixed(1) 
                            Number(Math.round(Number(operationalKpIs[i].baseline.actualValue) * 10) / 10).toFixed(1)
                            : null
                    }
                }
                this.setState({
                    operationalKpIs: operationalKpIs
                })
                break;
            case 'target':
                for (let i = 0; i < operationalKpIs.length; i++) {
                    if (i === this.updateId(event.target.id)) {
                        operationalKpIs[i].target.formattedValue = operationalKpIs[i].target.actualValue ?
                            // Number(operationalKpIs[i].target.actualValue).toFixed(1)
                            Number(Math.round(Number(operationalKpIs[i].target.actualValue) * 10) / 10).toFixed(1)
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

        const { operationalKpIs, sourceValueBic } = this.state;
        let result = operationalKpIs;
        for (let [i, x] of operationalKpIs.entries()) {
            if ((x['kpiId'] === Number(e.target.id)) && (Number(Object.keys(sourceValueBic)[0]) === Number(e.target.id))) {
                result[i]['bicBenchmarkSource'] = sourceValueBic[`${e.target.id}`];
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
            if ((x['kpiId'] === Number(e.target.id)) && (Number(Object.keys(sourceValueAvg)[0]) === Number(e.target.id))) {
                result[i]['avgBenchmarkSource'] = sourceValueAvg[`${e.target.id}`];
            }
        }
        this.setState(
            {
                operationalKpIs: [...result], sourceValueAvg: {}, selectedKpiAvg: '',
            })
    }

    render() {
        const { operationalKpIs, selectedKpiBic, selectedKpiAvg, sourceValueBic, sourceValueAvg } = this.state;
        let height = 39.05;
        const getTooltipData = (value) => {
            if (value) {
                let val = String(value).replace(/(?<!\..*)(\d)(?=(?:\d{3})+(?:\.|$))/g, '$1,');
                return `${val}`;
            }

        }
        return (
            <div className="">
                <div className="d-flex flex-sm-row flex-column justify-content-center">
                    <div className="invoice-itemization visual-vdt-table-main"  >
                        <table className="table" style={{}}>
                            <tbody>
                                {
                                    operationalKpIs.map((kpi, index) => (
                                        // height=height+0.25,
                                        (kpi == null) ? <tr key={index}><td className="tableDataConfig" colSpan="5" >Pending Configuration...</td></tr> :
                                            <tr key={index}>
                                                <td className="colClass" >
                                                    <div className="input-group mb-3" style={{ borderRadius: '0px' }}>
                                                        <input type="text"
                                                            id={`kpiUnit_${index}`}
                                                            className="form-control"
                                                            style={{ borderRadius: '0px', height: height.toString() + 'px' }}
                                                            value={kpi && kpi.opKpiUnit} readOnly/>
                                                        {/* Replaced 'value' attribute as 'defaultValue*/}
                                                    </div>
                                                </td>
                                                <td className="colClass" >

                                                    <div className="input-group mb-3" style={{}}>
                                                        <div className="input-group-prepend">
                                                            <div className="input-group-text" style={{ padding: '0px', borderRadius: '0px', borderRight: 'none', height: height.toString() + 'px' }}>
                                                                <input type="checkbox"
                                                                    checked={kpi.selectedBicBenchmark !== undefined ? kpi.selectedBicBenchmark : false}
                                                                    id={`calType_${index}`}
                                                                    name={kpi.calculationType}
                                                                    style={{ padding: '0px', marginLeft: '5px', marginRi: '5px', borderRadius: '0px', height: height.toString() + 'px' }}
                                                                    onChange={this.onSelectedBicBenchmark} />
                                                            </div>
                                                        </div>

                                                        <NumberFormat
                                                            data-tip=''
                                                            data-for={`benchmark_${kpi.kpiId}_${index}`}
                                                            id={`benchmark_${index}`}
                                                            thousandSeparator={true}
                                                            decimalScale={10}
                                                            // decimalprecision={40}
                                                            /* Replaced 'decimalPrecision' prop as 'decimalprecision' (in lowercase) */
                                                            name={kpi.calculationType}
                                                            className="form-control"
                                                            style={{
                                                                borderRadius: '0px',
                                                                //  height: '39.45px', 
                                                                borderLeft: 'none', borderbottom: 'none', height: height.toString() + 'px'
                                                            }}
                                                            onChange={this.onChangeBicBenchmark}
                                                            onFocus={(event) => this.onInputFocus(event, "bicBenchmark")}
                                                            onBlur={(event) => this.onInputBlur(event, "bicBenchmark")}
                                                            value={(kpi.bicBenchmark.formattedValue > 0 ? kpi.bicBenchmark.formattedValue : (kpi.bicBenchmark.actualValue === null || kpi.bicBenchmark.actualValue === "" ? "" :
                                                                //  Number(kpi.bicBenchmark.actualValue).toFixed(1)
                                                                Number(Math.round(Number(kpi.bicBenchmark.actualValue) * 10) / 10).toFixed(1)
                                                            ))}
                                                        />
                                                        <ReactTooltip type="dark" html={true} id={`benchmark_${kpi.kpiId}_${index}`} >
                                                            {getTooltipData(kpi.bicBenchmark && kpi.bicBenchmark.actualValue ? kpi.bicBenchmark.actualValue : null)}
                                                        </ReactTooltip>
                                                        <div className="eye-icon">
                                                            <i onClick={(SessionStorage.read("isMaster") === "Y" || SessionStorage.read("accessType") === "Read") ? ()=>{} : (event) => this.onClickEyeBic(event, kpi.kpiId)} >
                                                                <img src={eyeIcon} alt="eye-icon" data-tip='' data-for={`benchmark_eye_${kpi.kpiId}_${index}`} data-place="top" 
                                                                 style={{
                                                                    cursor: ( kpi.kpiId === null || kpi.kpiId === undefined ?"default": "pointer")
                                                                }}
                                                                />
                                                            </i>
                                                            <ReactTooltip type="dark" id={`benchmark_eye_${kpi.kpiId}_${index}`}>
                                                                {"Source : " + getTooltipData(sourceValueBic[kpi.kpiId] === undefined ? kpi.bicBenchmarkSource !== null && kpi.bicBenchmarkSource !== undefined ? kpi.bicBenchmarkSource : 'Custom' : sourceValueBic[kpi.kpiId])}

                                                            </ReactTooltip>
                                                            {/* onClick listener should be written as a function, like- onClick={()=> SessionStorage... */}
                                                        </div>

                                                        <Modal id="eyeDataSource" visible={kpi.kpiId === selectedKpiBic} >
                                                            <div>
                                                                <div className="row" style={{ margin: "0% 0% 0% 1%", justifyContent: "space-between" }}>
                                                                    <div style={{ padding: "5%", color: "#ffffff" }} >Enter Source Details</div>
                                                                    <div style={{ padding: "5%" }} onClick={this.onClickEyeCloseBic} >
                                                                        <img data-tip="" data-for="close-tooltip" data-place="top" src={closeIcon} alt="close" style={{ width: "12px" }} />
                                                                        <ReactTooltip id="close-tooltip" className="tooltip-class"> <span>Close</span></ReactTooltip>
                                                                    </div>
                                                                </div>
                                                                <div className="source-input">
                                                                    <input type="text" id={kpi.kpiId} name="sourceDetails" style={{ background: "#505050", border: "1px solid #F0F0F0", color: "#ffffff" }}
                                                                        onChange={(e) => this.onChangeSourceInputBic(e)}
                                                                        value={sourceValueBic[kpi.kpiId] === undefined ? kpi.bicBenchmarkSource !== null && kpi.bicBenchmarkSource !== undefined  ? kpi.bicBenchmarkSource : 'Custom' : sourceValueBic[kpi.kpiId]}
                                                                    // (sourceValueBic[kpi.kpiId] !== null && sourceValueBic[kpi.kpiId] !== '') ?
                                                                    // (kpi.bicBenchmarkSource === null && Object.keys(sourceValueBic).length > 0) ?
                                                                    //  sourceValueBic[kpi.kpiId] : "" : kpi.bicBenchmarkSource} 
                                                                    />
                                                                </div>
                                                                <div className="source-save-button">
                                                                    <button id={kpi.kpiId} className="btn btn-primary" style={{ cursor: "pointer", lineHeight: '1' }}
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
                                                                    checked={kpi.selectedAvgBenchmark !== undefined ? kpi.selectedAvgBenchmark : false}
                                                                    id={`selectAvgBenchmark_${index}`}
                                                                    name={kpi.calculationType}
                                                                    style={{ padding: '0px', marginLeft: '5px', borderRadius: '0px', height: height.toString() + 'px' }}
                                                                    onChange={this.onSelectedAvgBenchmark} />
                                                            </div>
                                                        </div>
                                                        <NumberFormat
                                                            data-tip=''
                                                            data-for={`avg_benchmark_${kpi.kpiId}_${index}`}
                                                            thousandSeparator={true}
                                                            id={`avgBenchmark_${index}`}
                                                            name={kpi.calculationType}
                                                            className="form-control"
                                                            style={{ borderRadius: '0px', height: height.toString() + 'px', borderLeft: 'none', borderbottom: 'none' }}
                                                            value={(kpi.avgBenchmark.formattedValue > 0 ? kpi.avgBenchmark.formattedValue : (kpi.avgBenchmark.actualValue === null || kpi.avgBenchmark.actualValue === "" ? "" :
                                                                //  Number(kpi.avgBenchmark.actualValue).toFixed(1)
                                                                Number(Math.round(Number(kpi.avgBenchmark.actualValue) * 10) / 10).toFixed(1)
                                                            ))}
                                                            onChange={this.onChangeAvgBenchmark}
                                                            onFocus={(event) => this.onInputFocus(event, "avgBenchmark")}
                                                            onBlur={(event) => this.onInputBlur(event, "avgBenchmark")}
                                                        />
                                                        <ReactTooltip id={`avg_benchmark_${kpi.kpiId}_${index}`} data-type="dark">
                                                            {getTooltipData(kpi.avgBenchmark && kpi.avgBenchmark.actualValue ? kpi.avgBenchmark.actualValue : null)}
                                                        </ReactTooltip>
                                                        <div className="eye-icon">
                                                            <i onClick={(SessionStorage.read("isMaster") === "Y" || SessionStorage.read("accessType") === "Read") ? ()=>{} : (event) => this.onClickEyeAvg(event, kpi.kpiId)} >
                                                                <img src={eyeIcon} alt="eye-icon" data-tip='' data-for={`avg_benchmark_eye_${kpi.kpiId}_${index}`} data-place="top" 
                                                                style={{
                                                                    cursor: ( kpi.kpiId === null || kpi.kpiId === undefined ?"default": "pointer")
                                                                }}
                                                                />
                                                            </i>
                                                            <ReactTooltip id={`avg_benchmark_eye_${kpi.kpiId}_${index}`}>
                                                                {"Source : " + getTooltipData(sourceValueAvg[kpi.kpiId] === undefined ? kpi.avgBenchmarkSource !== null && kpi.avgBenchmarkSource !== undefined ? kpi.avgBenchmarkSource : 'Custom' : sourceValueAvg[kpi.kpiId])}
                                                            </ReactTooltip>
                                                            {/* onClick listener should be written as a function, like- onClick={()=> SessionStorage... */}
                                                        </div>

                                                        <Modal id="eyeDataSource" visible={kpi.kpiId === selectedKpiAvg} >
                                                            <div>
                                                                <div className="row" style={{ margin: "0% 0% 0% 1%", justifyContent: "space-between" }}>
                                                                    <div style={{ padding: "5%", color: "#ffffff" }} >Enter Source Details</div>
                                                                    <div style={{ padding: "5%" }} onClick={this.onClickEyeCloseAvg} >
                                                                        <img data-tip="" data-for="close-tooltip" data-place="top" src={closeIcon} alt="close" style={{ width: "12px" }} />
                                                                        <ReactTooltip id="close-tooltip" className="tooltip-class"> <span>Close</span></ReactTooltip>
                                                                    </div>
                                                                </div>
                                                                <div className="source-input">
                                                                    <input type="text" id={kpi.kpiId} name="sourceDetails" style={{ background: "#505050", border: "1px solid #F0F0F0", color: "#ffffff" }}
                                                                        onChange={(e) => this.onChangeSourceInputAvg(e)}
                                                                        value={sourceValueAvg[kpi.kpiId] === undefined ? kpi.avgBenchmarkSource !== null && kpi.avgBenchmarkSource !== undefined ? kpi.avgBenchmarkSource : 'Custom' : sourceValueAvg[kpi.kpiId]}
                                                                    />
                                                                    {/* value={(kpi.avgBenchmarkSource === null && Object.keys(sourceValueAvg).length > 0) ? */}
                                                                    {/* (sourceValueAvg[kpi.kpiId] !== null && sourceValueAvg[kpi.kpiId] !== '') ? sourceValueAvg[kpi.kpiId] : "" : kpi.avgBenchmarkSource} /> */}
                                                                </div>
                                                                <div className="source-save-button">
                                                                    <button id={kpi.kpiId} className="btn btn-primary" style={{ cursor: "pointer", lineHeight: '1' }}
                                                                        onClick={(e) => this.onSaveSourceInputAvg(e)}> Save</button>
                                                                </div>
                                                            </div>
                                                        </Modal>
                                                    </div>
                                                </td>
                                                <td data-tip='' data-for={`baseline_${kpi.kpiId}_${index}`} className="colClass" >

                                                    <div className="input-group mb-3" style={{ borderRadius: '0px' }}>
                                                        <NumberFormat
                                                            thousandSeparator={true}
                                                            id={`baseline_${index}`}
                                                            name={kpi.calculationType}
                                                            className="form-control"
                                                            style={{ borderRadius: '0px', height: height.toString() + 'px' }}
                                                            onFocus={(event) => this.onInputFocus(event, "baseline")}
                                                            onBlur={(event) => this.onInputBlur(event, "baseline")}
                                                            onChange={this.onChangeBaseline}
                                                            value={(kpi && kpi.baseline.formattedValue > 0 ? kpi.baseline.formattedValue : (kpi.baseline.actualValue === null || kpi.baseline.actualValue === "" ? "" :
                                                                //  Number(kpi.baseline.actualValue).toFixed(1)
                                                                Number(Math.round(Number(kpi.baseline.actualValue) * 10) / 10).toFixed(1)
                                                            ))} />
                                                    </div>
                                                    <ReactTooltip id={`baseline_${kpi.kpiId}_${index}`} data-type="dark">
                                                        {getTooltipData(kpi.baseline && kpi.baseline.actualValue ? kpi.baseline.actualValue : null)}
                                                    </ReactTooltip>
                                                </td>
                                                <td data-tip='' data-for={`target_${kpi.kpiId}_${index}`} className="colClass" >

                                                    <div className="input-group mb-3" style={{}}>
                                                        <NumberFormat
                                                            thousandSeparator={true}
                                                            id={`target_${index}`}
                                                            className="form-control"
                                                            style={{ borderRadius: '0px', height: height.toString() + 'px' }}
                                                            value={(kpi && kpi.target.formattedValue > 0 ? kpi.target.formattedValue : (kpi.target.actualValue === null || kpi.target.actualValue === "" ? "" :
                                                                // Number(kpi.target.actualValue).toFixed(1)
                                                                Number(Math.round(Number(kpi.target.actualValue) * 10) / 10).toFixed(1)
                                                            ))}
                                                            onFocus={(event) => this.onInputFocus(event, "target")}
                                                            onBlur={(event) => this.onInputBlur(event, "target")}
                                                            onChange={this.onChangeTarget} />
                                                    </div>
                                                    <ReactTooltip id={`target_${kpi.kpiId}_${index}`}>
                                                        {getTooltipData(kpi.target && kpi.target.actualValue ? kpi.target.actualValue : null)}
                                                    </ReactTooltip>

                                                </td>
                                                <td className="colClass">
                                                    <div className="input-group mb-3">
                                                        <select className="form-control"
                                                            id={`selectedYear_${index}`}
                                                            value={kpi.targetAchieved === null ? "" : kpi.targetAchieved}
                                                            onChange={(event) => this.onChangeTargetAchieved(event, index)} style={{ borderRadius: '0px', height: height.toString() + 'px' }}>
                                                            <option >Select Year</option>
                                                            <option value="Year 1">Year 1</option>
                                                            <option value="Year 2">Year 2</option>
                                                            <option value="Year 3">Year 3</option>
                                                            <option value="Year 4">Year 4</option>
                                                            <option value="Year 5">Year 5</option>
                                                        </select>
                                                    </div>
                                                </td>
                                            </tr>
                                    ))}
                            </tbody>
                        </table>
                    </div >
                </div >
            </div >
        )
    }
}

export default withRouter(VisualVDTTable);