import React, { Fragment, useState } from 'react';
import '../../containers/DevelopBusinessCaseComponents/KpiTable.css';
import NumberFormat from 'react-number-format';
import ReactTooltip from 'react-tooltip';
// import Moment from 'moment';
import 'moment-timezone';
import DatePicker from "react-datepicker";
// import ToggleSwitch from '../../containers/ToggleSwitch/ToggleSwitch';
import './benefitTargetTable.css';

import calendarIcon from "../../assets/project/fvdt/calendar.svg";
import plusIco_brackets from "../../assets/project/fvdt/plusWithBackets.svg";
import deleteIcon from "../../assets/newDealsIcons/trashdelete.svg";
import ToggleSwitch from '../../containers/ToggleSwitch/TargetToggleSwitch';
var SessionStorage = require('store/storages/sessionStorage');

const BenefitTargetTable = (props) => {
    let { KPIBenefitsArray } = props;
    const [yearNumber, setExpandYearNumber] = useState(0);
    const [isBenefitsView, setIsBenefitsView] = useState(false)
    const option = SessionStorage.read('option_selected');
    var showPlus = true;
    //Filtering common params values for extra years
    const maxYear = (KPIBenefitsArray[0].targetBenefits.paramDto[0].paramValues.length);

    const kpiBenefits = KPIBenefitsArray[0];
    if (kpiBenefits.length > 0) {
        for (let i = 0; i < kpiBenefits.length; i++) {
            if (props.kpiId === kpiBenefits[i].kpiId) {
                KPIBenefitsArray = kpiBenefits[i];
            }
        }
    }
    const yearArray = [];
    for (let i = 1; i <= (kpiBenefits.targetBenefits.paramDto[0].paramValues.length); i++) {
        yearArray.push(i);
    }
    if (kpiBenefits.targetBenefits.paramDto[0].paramValues.length > 10) {
        showPlus = false;
    }
    props.setYearArrayLength(yearArray);
    const getTooltipData = (value) => {
        if (value) {
            let val = String(value).replace(/(?<!\..*)(\d)(?=(?:\d{3})+(?:\.|$))/g, '$1,');
            return `${val}`;

        }
    }
    const isParamActive = (currentParam) => {
        return currentParam.paramValues.map(paramVal => {
            return paramVal.activeFlag;
        });
    }
    if (props.collapseAll === true && yearNumber > 0) {
        setExpandYearNumber(0);
    }
    const setYearNumber = (index) => {
        if (yearNumber === index) {
            setExpandYearNumber(0)
        } else {
            setExpandYearNumber(index)
        }
        props.setFrequencyNumber(index, 'target')
    }

    const handleTargetToggle = () => {
        setIsBenefitsView(!isBenefitsView)
    }

    const checkForError = (param) => {
        const hasError = param.paramValues.find(item => item.hasTargetError === 'Y');
        if (hasError) {
            return true;
        }
        return false;
    };

    // const benefitData = (param) => {
    //     const hasError = KPIBenefitsArray[0].targetBenefits.kpiBenefits.find(item => item.hasTargetError === 'Y');
    //     if (hasError) {
    //         return true;
    //     }
    //     return false;
    // }
    const benefitData = KPIBenefitsArray[0].targetBenefits.kpiBenefits.find((benefit) => benefit.hasTargetError === "Y");
    return (
        <Fragment>
            <div className='row TargetTable'>
                <ToggleSwitch
                    id="target"
                    source="target"
                    handleToggle={handleTargetToggle}
                    view={!isBenefitsView ? 'Full View' : 'KPI Benefits View'}

                />
                <div className="ben-target invest_table-responsive" style={{ overflowX: 'auto', width: '96%' }} >
                    <table className="table" style={{
                        marginTop: "2%", marginBottom: "1px",
                        width: (option === 'delivery' ?
                            // props.isExpandBenefits ? '100%':
                            "unset" : "100%"),
                        tableLayout: 'fixed'
                    }}>

                        <thead style={{ whiteSpace: 'nowrap' }}>
                            <tr key={Math.random()}>
                                <th style={{
                                    backgroundColor: '#505050',
                                    padding: "12px 15px",
                                    color: '#ffffff'
                                }}>Parameter</th>
                                <th style={{
                                    color: '#ffffff',
                                    backgroundColor: '#505050',
                                    padding: "12px 10px"
                                }}>Unit</th>
                                {yearArray && yearArray.map((index) => (
                                    <Fragment>
                                        {yearNumber === index && !props.collapseAll ? props.freqArray.map((frequency, count) => (
                                            <th style={{ padding: "0px", backgroundColor: '#505050', color: '#ffffff' }}><p style={{ margin: "6px 0px" }}>{frequency}</p>
                                                {yearNumber === index ?
                                                    <th className="subHead" style={{ width: '200px' }}>
                                                        {KPIBenefitsArray[0].targetBenefits.paramDto[0].paramValues[index - 1].paramFreqData[count].startDate === ""
                                                            ?
                                                            <img src={calendarIcon} alt='calendarIcon' style={{ width: "15px", float: "right", margin: "5px 5px 5px 0px" }} ></img>
                                                            :
                                                            <DatePicker
                                                                value={KPIBenefitsArray[0].targetBenefits.paramDto[0].paramValues[index - 1].paramFreqData.length > 0 && KPIBenefitsArray[0].targetBenefits.paramDto[0].paramValues[index - 1].paramFreqData[count].startDate !== "Invalid date"
                                                                    ? new Date(KPIBenefitsArray[0].targetBenefits.paramDto[0].paramValues[index - 1].paramFreqData[count].startDate) : null}
                                                                selected={KPIBenefitsArray[0].targetBenefits.paramDto[0].paramValues[index - 1].paramFreqData[count].startDate !== "Invalid date" ?
                                                                    new Date(KPIBenefitsArray[0].targetBenefits.paramDto[0].paramValues[index - 1].paramFreqData[count] && KPIBenefitsArray[0].targetBenefits.paramDto[0].paramValues[index - 1].paramFreqData[count].startDate)
                                                                    : ""}
                                                                id={`targetDate_Y${index}_freq_${count}`}
                                                                placeholderText="Select Date"
                                                                onChange={props.handleFrequencyDateChange.bind(this, index, count)}
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
                                                                className="input-Ben-actuals-target  date-Input"
                                                                required={true}
                                                                style={{ zIndex: '122323', width: '45px', fontSize: '10px', backgroundColor: "#505050" }}
                                                            />
                                                        }
                                                    </th>
                                                    : null}
                                            </th>
                                        )) : null}

                                        <th style={{ padding: "0px", backgroundColor: '#505050', color: '#ffffff' }}><p style={{ margin: "6px 0px" }}>
                                            {props.frequency !== 'Yearly' ?
                                                <span style={{ cursor: "pointer" }} id={`target_plus_Y${index}`} onClick={(e) => { setYearNumber(index) }}>{(yearNumber === index || props.frequencyCheck === false) && !props.collapseAll ? '[-] ' : '[+] '}</span> : ''}
                                            {'Year ' + index}</p>
                                            <th className="subHead" style={{ width: '200px' }}>
                                                {KPIBenefitsArray[0].targetBenefits.paramDto[0].paramValues[index - 1].startDate === "" ?
                                                    <img src={calendarIcon} alt='calendarIcon' style={{ width: "15px", float: "right", margin: "5px 5px 5px 0px" }} ></img> :
                                                    <DatePicker
                                                        value={
                                                            KPIBenefitsArray[0].targetBenefits.paramDto[0].paramValues[index - 1].startDate !== 'Invalid date' ?
                                                                new Date(
                                                                    KPIBenefitsArray[0].targetBenefits.paramDto[0].paramValues[index - 1].startDate
                                                                ) : ''
                                                        }
                                                        id={`targetDate_Y${index}`}
                                                        selected={
                                                            KPIBenefitsArray[0].targetBenefits.paramDto[0].paramValues[index - 1].startDate !== 'Invalid date' ?
                                                                new Date(
                                                                    KPIBenefitsArray[0].targetBenefits.paramDto[0].paramValues[index - 1].startDate
                                                                ) : ''
                                                        }
                                                        placeholderText="Select Date"
                                                        onChange={props.handleIndividualTargetDateChange.bind(this, index)}
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
                                                        className="input-Ben-actuals-target  date-Input"
                                                        required={true}
                                                        style={{ zIndex: '121212', backgroundColor: "#505050" }}
                                                    />
                                                }
                                            </th>
                                        </th>
                                    </Fragment>
                                ))}  {
                                    option === 'delivery' && showPlus ?
                                        <div className="d-inline-block align-top" style={{ width: 'auto', paddingLeft: "1%", marginTop: "1%" }} >
                                            {
                                                yearArray.length < 10 &&
                                                <span onClick={props.addTargetColoumnHandler} style={{ color: '#ffffff', fontSize: '20px', cursor: 'pointer', padding: "0px 3px" }}>
                                                    <img src={plusIco_brackets} alt="add"
                                                        data-tip=""
                                                        data-for="benTargetTable-addYear-tooltip"
                                                        data-place="left" />
                                                    <ReactTooltip id="benTargetTable-addYear-tooltip" className="tooltip-class">
                                                        <span>Add Year</span>
                                                    </ReactTooltip>
                                                </span>
                                            }
                                            {
                                                yearArray.length > 5 &&
                                                <span style={{ color: '#ffffff', fontSize: '20px', cursor: 'pointer' }}>
                                                    {' '} <img src={deleteIcon} alt="deleteIcon" onClick={props.deleteTargetColumnHandler}
                                                        data-tip=""
                                                        data-for="benTargetTable-deleteYear-tooltip"
                                                        data-place="left" />
                                                    <ReactTooltip id="benTargetTable-deleteYear-tooltip" className="tooltip-class">
                                                        <span>Delete Year</span>
                                                    </ReactTooltip>
                                                </span>
                                            }
                                        </div> : ''
                                }
                            </tr>

                        </thead>
                        <tbody>
                            {KPIBenefitsArray && KPIBenefitsArray[0].targetBenefits.paramDto && KPIBenefitsArray[0].targetBenefits.paramDto.map((param, index) => (
                                (() => isParamActive(param).indexOf('N') === -1) &&
                                    (isBenefitsView && param.isRuleParam === 'N') && (isBenefitsView && param.isCpRuleParam === null) || (!isBenefitsView) ?


                                    <tr style={{ backgroundColor: (!checkForError(param)) ? '#ffffff' : '#ff8787' }}>
                                        <td className="toolTip"
                                            data-tip={getTooltipData(
                                                param.rule
                                            )}
                                            data-for="benActualTable-values-tooltip"
                                            data-place="top"
                                            disabled
                                            style={{
                                                minWidth: "115px",
                                                // backgroundColor: '#4d4d4d',
                                                backgroundColor: (checkForError(param)) ? '#ff8787' : ((param && param.isRuleParam) === 'Y' || props.frequency !== 'Yearly' || param.paramName === "Incremental Benefit" || param.rule !== null ? '#5a5a5a' : '#4d4d4d'),
                                                color: ((param && param.isRuleParam) === 'Y' || param.rule !== null || props.frequency !== 'Yearly' || param.paramName === "Incremental Benefit" ? '#b9b9b9' : '#ffffff'),
                                                textAlignLast: "left", paddingLeft: "5px"
                                            }} >
                                            {param.paramName}
                                        </td>
                                        <td style={{
                                            textAlignLast: "center",
                                            //  backgroundColor: '#4d4d4d',
                                            backgroundColor: (checkForError(param)) ? '#ff8787' : ((param && param.isRuleParam) === 'Y' || props.frequency !== 'Yearly' || param.paramName === "Incremental Benefit" || param.rule !== null ? '#5a5a5a' : '#4d4d4d'),
                                            color: ((param && param.isRuleParam) === 'Y' || props.frequency !== 'Yearly' || param.paramName === "Incremental Benefit" || param.rule !== null ? '#b9b9b9' : '#ffffff'),
                                            minWidth: "50px"
                                        }}>
                                            {param.unit}
                                        </td>
                                        {param.paramValues && param.paramValues.map((data, index1) =>
                                            (maxYear > index1 ?
                                                <Fragment>
                                                    {yearNumber === data.year && !props.collapseAll ?
                                                        param.paramValues[index1].paramFreqData && param.paramValues[index1].paramFreqData.map((data1, idx) => (
                                                            <td className="toolTip"
                                                                data-tip={getTooltipData(
                                                                    data1.targetValue && data1.targetValue.actualValue ? data1.targetValue.actualValue : null
                                                                )}
                                                                data-for="benTargetTable-values-tooltip"
                                                                data-place="top"
                                                                style={{
                                                                    textAlignLast: "right",
                                                                    width: '17%', minWidth: '68px',
                                                                    backgroundColor: (checkForError(param)) ? '#ff8787' : ((param && param.paramName) === "Incremental Benefit" || param.isRuleParam === 'Y' || param.rule !== null) ? '#5a5a5a' : '#4d4d4d'
                                                                }}>
                                                                {data1.hasTargetError !== "Y" ?
                                                                    <NumberFormat
                                                                        disabled={((param && param.paramName) === "Incremental Benefit" || param.rule !== null || param.isRuleParam === 'Y') ? true : false}
                                                                        id={KPIBenefitsArray && KPIBenefitsArray.length > 0 && KPIBenefitsArray.kpiId ?
                                                                            (KPIBenefitsArray.kpiId + '@' + index + '@' + data1.paramDataId + '@' + param.paramName + '@' + param.unit) : ''}
                                                                        name={`benefitTargetTable_${param.paramName}_Y${index1 + 1}_freq_${idx}`}
                                                                        style={{
                                                                            fontSize: '10px', borderRadius: '0px',
                                                                            color: ((param && param.isRuleParam) === 'Y' || param.paramName === "Incremental Benefit" || param.rule !== null ? '#b9b9b9' : '#ffffff'),
                                                                            backgroundColor: ((param && param.paramName) === "Incremental Benefit" || param.isRuleParam === 'Y' || param.rule !== null) ? '#5a5a5a' : '#4d4d4d', border: 'none', padding: '0px', width: '100%', textAlignLast: 'right'
                                                                        }}
                                                                        className="input-Ben-actuals-target"
                                                                        thousandSeparator={true}
                                                                        value={data1.targetValue && (data1.targetValue.actualValue || data1.targetValue.actualValue === 0) ?
                                                                            (data1.targetValue.formattedValue > 0 ? data1.targetValue.formattedValue :
                                                                                Number(Math.round(Number(data1.targetValue.actualValue) * 10) / 10).toFixed(1)
                                                                            )
                                                                            : null}
                                                                        onChange={(event) => props.onchangeKPIFrequencyData(event, index, index1, idx)}
                                                                        onBlur={(event) => props.onMFBlur(event, index, index1, 'target')}
                                                                        onFocus={(event) => props.onFocusMF(event, index, index1, 'target')}
                                                                    ></NumberFormat> :
                                                                    // ( data1.targetErrorDescription)
                                                                    '#REF'
                                                                }
                                                            </td>)) : null}

                                                    <td className="toolTip" data-tip={getTooltipData(
                                                        data.targetValue && data.targetValue.actualValue ? data.targetValue.actualValue : null
                                                    )}
                                                        data-for="benTargetTable-values-tooltip"
                                                        data-place="top"
                                                        style={{
                                                            textAlignLast: "right",
                                                            width: '17%', minWidth: '68px',
                                                            backgroundColor: (checkForError(param)) ? '#ff8787' : ((param && param.isRuleParam) === 'Y' || param.rule !== null || props.frequency !== 'Yearly' || param.paramName === "Incremental Benefit" ? '#5a5a5a' : '#4d4d4d')
                                                        }}>
                                                        {data.hasTargetError !== "Y" ?
                                                            <NumberFormat
                                                                disabled={(param && param.isRuleParam) === 'Y' || props.frequency !== 'Yearly' || param.paramName === "Incremental Benefit" || param.rule !== null}
                                                                id={KPIBenefitsArray && KPIBenefitsArray.length > 0 && KPIBenefitsArray.kpiId ?
                                                                    (KPIBenefitsArray.kpiId + '@' + index + '@' + data.paramDataId + '@' + param.paramName + '@' + param.unit) : ''}
                                                                name={`benefitTargetTable_${param.paramName}_Y${index1 + 1}`}
                                                                style={{
                                                                    fontSize: '10px', borderRadius: '0px', border: 'none', padding: '0px', width: '100%', textAlignLast: 'right',
                                                                    backgroundColor: ((param && param.isRuleParam) === 'Y' || props.frequency !== 'Yearly' || param.paramName === "Incremental Benefit" || param.rule !== null ? '#5a5a5a' : '#4d4d4d'),
                                                                    color: ((param && param.isRuleParam) === 'Y' || props.frequency !== 'Yearly' || param.paramName === "Incremental Benefit" || param.rule !== null ? '#b9b9b9' : '#ffffff')
                                                                }}
                                                                className="input-Ben-actuals-target"
                                                                thousandSeparator={true}
                                                                value={data.targetValue && (data.targetValue.actualValue || data.targetValue.actualValue === 0) ?
                                                                    (data.targetValue.formattedValue > 0 ? data.targetValue.formattedValue :
                                                                        //  Number(data.paramValue.actualValue).toFixed(1)
                                                                        Number(Math.round(Number(data.targetValue.actualValue) * 10) / 10).toFixed(1)
                                                                    )
                                                                    : null}
                                                                onChange={(event) => props.onChangeKPITargetEachYear(event, index, index1)}
                                                                onBlur={(event) => props.onMFBlur(event, index, index1, 'target')}
                                                                onFocus={(event) => props.onFocusMF(event, index, index1, 'target')}
                                                            ></NumberFormat> :
                                                            // ( data.targetErrorDescription)
                                                            '#REF'
                                                        }
                                                    </td>
                                                </Fragment>
                                                // </td>
                                                : null))}


                                    </tr>
                                    : ''
                            ))}
                            {KPIBenefitsArray[0].kpiType === 'NON_FINANCIAL' ? '' :
                                <tr style={{
                                    // backgroundColor: benefitData ? '#ff8787' : '#5a5a5a',
                                    // color: benefitData ? '#ffffff' : '#b9b9b9',
                                }}>
                                    <td
                                        data-tip={getTooltipData(
                                            KPIBenefitsArray[0].benefitRule
                                        )}
                                        data-for="benActualTable-values-tooltip"
                                        data-place="top"
                                        style={{
                                            backgroundColor: benefitData ? '#ff8787' : '#6c6c6cbf',
                                            color: '#ffffff', textAlignLast: "left", paddingLeft: "5px"
                                        }}
                                    >
                                        Benefits
                                    </td>
                                    <td style={{
                                        textAlignLast: "center",
                                        backgroundColor: benefitData ? '#ff8787' : '#6c6c6cbf',
                                        color: '#b9b9b9',
                                    }}>$</td>
                                    {/* <td data-tip={getTooltipData("0.0")} style={{ textAlignLast: "right",width: '17%', minWidth: '68px', color: "white" }}>0.0</td> */}
                                    <Fragment>
                                        {KPIBenefitsArray && KPIBenefitsArray[0].targetBenefits.kpiBenefits && KPIBenefitsArray[0].targetBenefits.kpiBenefits.map((kpi, index) =>
                                            (maxYear > index ?
                                                <Fragment>
                                                    {yearNumber === kpi.year && !props.collapseAll ?
                                                        //
                                                        KPIBenefitsArray[0].targetBenefits.kpiBenefits[index].frequencyBenfits.map((kpi, index) => (
                                                            <td data-tip={getTooltipData(kpi.targetValue)}
                                                                data-for="benTargetTable-values-tooltip"
                                                                data-place="top"
                                                                style={{
                                                                    textAlignLast: "right",
                                                                    width: '17%', minWidth: '68px',
                                                                    backgroundColor: benefitData ? '#ff8787' : '#6c6c6cbf',
                                                                    color: '#ffffff',
                                                                }}>
                                                                {kpi.hasTargetError === 'N' ?
                                                                    <NumberFormat
                                                                        disabled
                                                                        style={{
                                                                            width: '100%', border: 'none',
                                                                            backgroundColor: benefitData ? '#ff8787' : '#6c6c6cbf',
                                                                            color: '#b9b9b9',
                                                                            textAlignLast: 'right'
                                                                        }}
                                                                        thousandSeparator={true}
                                                                        value={
                                                                            // Number(kpi.benefitValue).toFixed(1)
                                                                            Number(Math.round(Number(kpi.targetValue) * 10) / 10).toFixed(1)
                                                                        }>
                                                                    </NumberFormat> :
                                                                    // ( kpi.targetErrorDescription)
                                                                    '#REF'
                                                                }

                                                                {/* <ReactTooltip type="light" html={true} thousandSeparator={true} /> */}
                                                            </td>

                                                        )) : null}
                                                    < td data-tip={getTooltipData(kpi.targetValue)}
                                                        data-for="benTargetTable-values-tooltip"
                                                        data-place="top"
                                                        style={{
                                                            textAlignLast: "right",
                                                            width: '17%', minWidth: '68px',
                                                            backgroundColor: benefitData ? '#ff8787' : '#6c6c6cbf',
                                                            color: '#ffffff',
                                                        }}>
                                                        {kpi.hasTargetError === 'N' ?
                                                            <NumberFormat
                                                                disabled
                                                                style={{
                                                                    width: '100%', border: 'none',
                                                                    backgroundColor: benefitData ? '#ff8787' : '#6c6c6cbf',
                                                                    color: '#b9b9b9',
                                                                    textAlignLast: 'right'
                                                                }}
                                                                thousandSeparator={true}
                                                                value={
                                                                    // Number(kpi.benefitValue).toFixed(1)
                                                                    Number(Math.round(Number(kpi.targetValue) * 10) / 10).toFixed(1)
                                                                }>
                                                            </NumberFormat> :
                                                            // ( kpi.targetErrorDescription)
                                                            '#REF'
                                                        }

                                                        {/* <ReactTooltip type="light" html={true} thousandSeparator={true} /> */}
                                                    </td>
                                                </Fragment>
                                                : null)
                                        )}

                                    </Fragment>
                                </tr>
                            }

                        </tbody>
                    </table>
                    <ReactTooltip id="benTargetTable-values-tooltip" className="tooltip-class" />
                </div>
            </div >
        </Fragment >
    );
}


export default BenefitTargetTable;



