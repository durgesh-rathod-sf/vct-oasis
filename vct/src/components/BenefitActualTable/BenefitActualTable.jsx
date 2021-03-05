import React, { Fragment, useState } from 'react';
import '../../containers/DevelopBusinessCaseComponents/KpiTable.css';
import NumberFormat from 'react-number-format';
import 'moment-timezone';
import ReactTooltip from 'react-tooltip';
import DatePicker from "react-datepicker";
// import ToggleSwitch from '../../containers/ToggleSwitch/ToggleSwitch';
import '../BenefitTargetTable/benefitTargetTable.css';
import plusIco_brackets from "../../assets/project/fvdt/plusWithBackets.svg";
import deleteIcon from "../../assets/newDealsIcons/trashdelete.svg";

import calendarIcon from "../../assets/project/fvdt/calendar.svg";
import ToggleSwitch from '../../containers/ToggleSwitch/TargetToggleSwitch';
//import color from '@material-ui/core/colors/yellow';
var SessionStorage = require('store/storages/sessionStorage');

const BenefitActualTable = (props) => {
    let { KPIBenefitsArray } = props;
    const [yearNumber, setExpandYearNumber] = useState(0);
    const [isActualBenefitsView, setIsActualBenefitsView] = useState(false)
    const option = SessionStorage.read('option_selected');
    var showPlus = true;
    const maxYear = KPIBenefitsArray[0].actualBenefits.paramDto[0].paramValues.length;  //Filtering common params values for extra years
    let kpiBenefits = KPIBenefitsArray[0];
    if (kpiBenefits.length > 0) {
        for (let i = 0; i < kpiBenefits.length; i++) {
            if (props.kpiId === kpiBenefits[i].kpiId) {
                KPIBenefitsArray = kpiBenefits[i]
            }
        }
    }
    let yearArray = []
    for (let i = 1; i <= kpiBenefits.actualBenefits.paramDto[0].paramValues.length; i++) {
        yearArray.push(i)
    }
    if (kpiBenefits.actualBenefits.paramDto[0].paramValues.length > 10) {
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
        props.setFrequencyNumber(index)
    }

    const handleActualToggle = () => {
        setIsActualBenefitsView(!isActualBenefitsView)
    }

    const checkForError = (param) => {
        const hasError = param.paramValues.find(item => item.hasTargetError === 'Y');
        if (hasError) {
            return true;
        }
        return false;
    };
    const benefitData = KPIBenefitsArray[0].actualBenefits.kpiBenefits.find((benefit) => benefit.hasActualError === "Y");
    return (
        <Fragment>
            <div className="row ActualTable">
                <ToggleSwitch
                    id="actual"
                    source="actual"
                    handleToggle={handleActualToggle}
                    view={!isActualBenefitsView ? 'Full View' : 'KPI Benefits View'}
                />
                <div className="ben-target invest_table-responsive" style={{ overflowX: 'auto', width: '96%' }} >
                    {/* <div className=""> */}

                    <table className="table" style={{
                        marginTop: "2%",
                        marginBottom: "1px",
                        tableLayout: 'fixed',
                        width: 'unset',
                    }}>
                        <thead style={{ whiteSpace: 'nowrap' }}>
                            <tr key={Math.random()}>
                                <th style={{ padding: "12px 15px", backgroundColor: '#505050', color: '#ffffff' }}>Parameter</th>
                                <th style={{ padding: "12px 10px", backgroundColor: '#505050', color: '#ffffff' }}>Unit</th>
                                {yearArray && yearArray.map((index) => (
                                    <Fragment>
                                        {yearNumber === index && !props.collapseAll ?
                                            props.freqArray.map((frequency, count) => (
                                                <th style={{ padding: "0px", backgroundColor: '#505050', color: '#ffffff' }}><p style={{ margin: "6px 0px" }}>{frequency}</p>
                                                    {yearNumber === index ?
                                                        <th className="subHead" style={{ width: '200px' }}>
                                                            {KPIBenefitsArray[0].actualBenefits.paramDto[0].paramValues[index - 1].paramFreqData.length > 0 && KPIBenefitsArray[0].actualBenefits.paramDto[0].paramValues[index - 1].paramFreqData[count].startDate === "" ?
                                                                <img src={calendarIcon} alt='calendarIcon' style={{ width: "15px", float: "right", margin: "5px 5px 5px 0px" }} ></img>
                                                                :
                                                                <DatePicker
                                                                    value={KPIBenefitsArray[0].targetBenefits.paramDto[0].paramValues[index - 1].paramFreqData.length > 0 && KPIBenefitsArray[0].actualBenefits.paramDto[0].paramValues[index - 1].paramFreqData[count].startDate !== "Invalid date" ? new Date(KPIBenefitsArray[0].actualBenefits.paramDto[0].paramValues[index - 1].paramFreqData[count].startDate) : null}
                                                                    selected={KPIBenefitsArray[0].actualBenefits.paramDto[0].paramValues[index - 1].paramFreqData[count].startDate !== "Invalid date" ?
                                                                        new Date(KPIBenefitsArray[0].actualBenefits.paramDto[0].paramValues[index - 1].paramFreqData[count].startDate)
                                                                        : ""}
                                                                    id={`actualDate_Y${index}_freq_${count}`}
                                                                    placeholderText="Select Date"
                                                                    onChange={props.handleFrequencyDateChange.bind(this, index, count)}
                                                                    dateFormat="dd-MMM-yyyy"
                                                                    showMonthDropdown
                                                                    showYearDropdown
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
                                                                    useShortMonthInDropdown
                                                                    className="input-Ben-actuals-target date-Input"
                                                                    style={{ backgroundColor: "#505050" }}
                                                                    required={true}
                                                                />
                                                            }
                                                        </th>
                                                        : null}
                                                </th>
                                            )) : null}
                                        <th style={{ padding: "0px", backgroundColor: '#505050', color: '#ffffff' }}><p style={{ margin: "6px 0px" }}>
                                            {props.frequency !== 'Yearly' ?
                                                <span style={{ cursor: "pointer" }} id={`actual_plus_Y${index}`} onClick={(e) => { setYearNumber(index) }}>{yearNumber === index && !props.collapseAll ? '[-] ' : '[+] '}</span> : ''}
                                            {'Year ' + index}</p>

                                            <th className="subHead" style={{ width: '200px' }}> {KPIBenefitsArray[0].actualBenefits.paramDto[0].paramValues[index - 1].startDate === "" ?
                                                <img src={calendarIcon} alt='calendarIcon' style={{ width: "15px", float: "right", margin: "5px 5px 5px 0px" }} ></img>
                                                :
                                                <DatePicker
                                                    value={
                                                        KPIBenefitsArray[0].actualBenefits.paramDto[0].paramValues[index - 1].startDate !== 'Invalid date' ?
                                                            new Date(
                                                                KPIBenefitsArray[0].actualBenefits.paramDto[0].paramValues[index - 1].startDate
                                                            ) : ''
                                                    }
                                                    selected={
                                                        KPIBenefitsArray[0].actualBenefits.paramDto[0].paramValues[index - 1].startDate !== 'Invalid date' ?
                                                            new Date(
                                                                KPIBenefitsArray[0].actualBenefits.paramDto[0].paramValues[index - 1].startDate
                                                            ) : ''}
                                                    id={`actualDate_Y${index}`}
                                                    placeholderText="Select Date"
                                                    onChange={props.handleIndividualActualDateChange.bind(this, index)}
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
                                                    className="input-Ben-actuals-target date-Input"
                                                    required={true}
                                                />}
                                            </th>
                                        </th>
                                    </Fragment>
                                ))}
                                {option === 'delivery' && showPlus ?
                                    <div className="d-inline-block align-top" style={{ width: 'auto', paddingLeft: "1%", marginTop: "1%" }} >
                                        {
                                            yearArray.length < 10 &&
                                            <span onClick={props.addTargetColoumnHandler} style={{ color: 'black', fontSize: '20px', cursor: 'pointer', padding: "0px 3px" }}>
                                                <img src={plusIco_brackets} alt="add"
                                                    data-tip=""
                                                    data-for="benefitActTable-addYear-tooltip"
                                                    data-place="left" />
                                                <ReactTooltip id="benefitActTable-addYear-tooltip" className="tooltip-class">
                                                    <span>Add Year</span>
                                                </ReactTooltip>
                                            </span>
                                        }
                                        {
                                            yearArray.length > 5 &&
                                            <span style={{ color: 'black', fontSize: '20px', cursor: 'pointer' }}>
                                                {' '}  <img src={deleteIcon} alt="delete" onClick={props.deleteColumnHandler}
                                                    data-tip=""
                                                    data-for="benefitActTable-deleteYear-tooltip"
                                                    data-place="left" />
                                                <ReactTooltip id="benefitActTable-deleteYear-tooltip" className="tooltip-class">
                                                    <span>Delete Year</span>
                                                </ReactTooltip>
                                            </span>
                                        }
                                    </div> : ''}
                            </tr>

                        </thead>
                        <tbody>
                            {KPIBenefitsArray && KPIBenefitsArray[0].actualBenefits.paramDto && KPIBenefitsArray[0].actualBenefits.paramDto.map((param, index) => (
                                ((() => isParamActive(param).indexOf('N') === -1) &&
                                    (isActualBenefitsView && param.isRuleParam === 'N') && (isActualBenefitsView && param.isCpRuleParam === null)) || (!isActualBenefitsView) ?
                                    <tr style={{ backgroundColor: (!checkForError(param)) ? '#424242' : '#ff8787' }}>
                                        <td className="toolTip"
                                            data-tip={getTooltipData(
                                                param.rule
                                            )}
                                            data-for="benActualTable-values-tooltip"
                                            data-place="top"
                                            style={{
                                                backgroundColor: (checkForError(param)) ? '#ff8787' : ((param && param.isRuleParam) === 'Y' || props.frequency !== 'Yearly' || param.paramName === "Incremental Benefit" || param.rule !== null ? '#5a5a5a' : '#4d4d4d'),
                                                color: ((param && param.isRuleParam) === 'Y' || param.rule !== null || props.frequency !== 'Yearly' || param.paramName === "Incremental Benefit" ? '#b9b9b9' : '#ffffff'),
                                                minWidth: '115px', textAlignLast: "left", paddingLeft: "5px"
                                            }} >
                                            {param.paramName}
                                        </td>
                                        <td style={{
                                            textAlignLast: "center",
                                            backgroundColor: (checkForError(param)) ? '#ff8787' : ((param && param.isRuleParam) === 'Y' || props.frequency !== 'Yearly' || param.paramName === "Incremental Benefit" || param.rule !== null ? '#5a5a5a' : '#4d4d4d'),
                                            color: ((param && param.isRuleParam) === 'Y' || props.frequency !== 'Yearly' || param.paramName === "Incremental Benefit" || param.rule !== null ? '#b9b9b9' : '#ffffff'),
                                            minWidth: "50px"
                                        }}>
                                            {param.unit}
                                        </td>
                                        {param.paramValues && param.paramValues.map((data, index1) => (
                                            (maxYear > index1 ?
                                                <Fragment>
                                                    {yearNumber === data.year && !props.collapseAll ?
                                                        param.paramValues[index1].paramFreqData && param.paramValues[index1].paramFreqData.map((data, idx) => (
                                                            <td data-tip={getTooltipData(
                                                                data.actualValue && data.actualValue.actualValue ? data.actualValue.actualValue : null
                                                            )}
                                                                data-for="benActualTable-values-tooltip"
                                                                data-place="top"
                                                                style={{
                                                                    textAlignLast: "right",
                                                                    width: '17%', minWidth: '68px',
                                                                    backgroundColor: (checkForError(param)) ? '#ff8787' : (param && param.paramName) === "Incremental Benefit" || param.isRuleParam === 'Y' || param.rule !== null ? '#4e4e4e' : '#4d4d4d',
                                                                    color: (checkForError(param)) ? '#ffffff' : (param && param.paramName) === "Incremental Benefit" || param.isRuleParam === 'Y' || param.rule !== null ? '#b9b9b9' : '#ffffff'
                                                                }}>
                                                                {data.hasActualError !== "Y" ?
                                                                    <NumberFormat
                                                                        disabled={(param && param.paramName) === "Incremental Benefit" || param.isRuleParam === 'Y' || param.rule !== null ? true : false}
                                                                        id={KPIBenefitsArray && KPIBenefitsArray.length > 0 && KPIBenefitsArray.kpiId ?
                                                                            (KPIBenefitsArray.kpiId + '@' + index + '@' + data.paramDataId + '@' + param.paramName + '@' + param.unit) : ''}
                                                                        name={`benefitActualTable_${param.paramName}_Y${index1 + 1}_freq_${idx}`}
                                                                        style={{
                                                                            backgroundColor: ((param && param.paramName) === "Incremental Benefit" || param.isRuleParam === 'Y' || param.rule !== null) ? '#5a5a5a' : '#4d4d4d',
                                                                            // param && param.paramName === "Incremental Benefit" || param.isRuleParam === 'Y' ? true : false
                                                                            color: ((param && param.isRuleParam) === 'Y' || param.paramName === "Incremental Benefit" || param.rule !== null ? '#b9b9b9' : '#ffffff'),
                                                                            fontSize: '10px', borderRadius: '0px', border: 'none', padding: '0px', width: '100%', textAlignLast: 'right'
                                                                        }}
                                                                        className="form-control"
                                                                        thousandSeparator={true}
                                                                        value={data.actualValue && (data.actualValue.actualValue || data.actualValue.actualValue === 0) ?
                                                                            (data.actualValue.formattedValue > 0 ? data.actualValue.formattedValue :
                                                                                //  Number(data.paramValue.actualValue).toFixed(1)
                                                                                Number(Math.round(Number(data.actualValue.actualValue) * 10) / 10).toFixed(1)
                                                                            )
                                                                            : null}
                                                                        onChange={(event) => props.onchangeKPIFrequencyDataActuals(event, index, index1, idx)}
                                                                        onBlur={(event) => props.onMFBlur(event, index, index1, 'actual')}
                                                                        onFocus={(event) => props.onFocusMF(event, index, index1, 'actual')}
                                                                    ></NumberFormat> :
                                                                    // ( data.actualErrorDescription)
                                                                    '#REF'
                                                                }
                                                            </td>)) : null}
                                                    <td data-tip={getTooltipData(
                                                        data.actualValue && data.actualValue.actualValue ? data.actualValue.actualValue : null
                                                    )}
                                                        data-for="benActualTable-values-tooltip"
                                                        data-place="top"
                                                        style={{
                                                            textAlignLast: "right",
                                                            width: '17%', minWidth: '68px',
                                                            backgroundColor: (checkForError(param)) ? '#ff8787' : (param && param.paramName === "Incremental Benefit") || (props.frequency !== 'Yearly') || param.isRuleParam === 'Y' || param.rule !== null ? '#5a5a5a' : '#4d4d4d',
                                                            color: (checkForError(param)) ? '#ffffff' : (param && param.paramName === "Incremental Benefit") || (props.frequency !== 'Yearly') || param.isRuleParam === 'Y' || param.rule !== null ? '#b9b9b9' : '#ffffff',

                                                        }}>
                                                        {data.hasActualError !== 'Y' ?
                                                            <NumberFormat
                                                                disabled={props.frequency !== 'Yearly' || param.paramName === "Incremental Benefit" || param.isRuleParam === 'Y' || param.rule !== null ? true : false}
                                                                id={KPIBenefitsArray && KPIBenefitsArray.length > 0 && KPIBenefitsArray.kpiId ?
                                                                    (KPIBenefitsArray.kpiId + '@' + index + '@' + data.paramDataId + '@' + param.paramName + '@' + param.unit) : ''}
                                                                name={`benefitActualTable_${param.paramName}_Y${index1 + 1}`}
                                                                style={{
                                                                    backgroundColor: ((param && param.isRuleParam) === 'Y' || props.frequency !== 'Yearly' || param.paramName === "Incremental Benefit" || param.rule !== null ? '#5a5a5a' : '#4d4d4d'),
                                                                    color: (((param && param.isRuleParam) === 'Y' || props.frequency !== 'Yearly' || param.paramName === "Incremental Benefit" || param.rule !== null ? '#b9b9b9' : '#ffffff')),
                                                                    fontSize: '10px',
                                                                    borderRadius: '0px', border: 'none', padding: '0px', width: '100%', textAlignLast: 'right',
                                                                }}
                                                                className="form-control"
                                                                thousandSeparator={true}
                                                                value={data.actualValue && (data.actualValue.actualValue || data.actualValue.actualValue === 0) ?
                                                                    (data.actualValue.formattedValue > 0 ? data.actualValue.formattedValue :
                                                                        //  Number(data.paramValue.actualValue).toFixed(1)
                                                                        Number(Math.round(Number(data.actualValue.actualValue) * 10) / 10).toFixed(1)
                                                                    )
                                                                    : null}
                                                                onChange={(event) => props.onChangeKPITargetEachYearActual(event, index, index1)}
                                                                onBlur={(event) => props.onMFBlur(event, index, index1, 'actual')}
                                                                onFocus={(event) => props.onFocusMF(event, index, index1, 'actual')}
                                                            ></NumberFormat> :
                                                            // ( data.actualErrorDescription)
                                                            '#REF'
                                                        }
                                                    </td>
                                                </Fragment> : null

                                            )))}
                                    </tr> : ''
                            ))}
                            {KPIBenefitsArray[0].kpiType === 'NON_FINANCIAL' ? '' :
                                <tr style={{
                                    backgroundColor: benefitData ? '#ff8787' : '#6c6c6cbf',
                                    color: '#ffffff'
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
                                        }}>Benefits</td>
                                    <td style={{
                                        textAlignLast: "center", backgroundColor: (benefitData ? '#ff8787' : '#6c6c6cbf'),
                                        color: '#b9b9b9'
                                    }}>$</td>
                                    {/* <td data-tip={getTooltipData("0.0")} style={{ textAlignLast: "right",width: '17%', minWidth: '68px', color: "white" }}>0.0</td> */}
                                    <Fragment>
                                        {KPIBenefitsArray && KPIBenefitsArray[0].actualBenefits.kpiBenefits && KPIBenefitsArray[0].actualBenefits.kpiBenefits.map((kpi, index) => (
                                            (maxYear > index ?
                                                <Fragment>
                                                    {yearNumber === kpi.year && !props.collapseAll ?
                                                        KPIBenefitsArray[0].actualBenefits.kpiBenefits[index].frequencyBenfits.map((kpi, index) => (
                                                            <td data-tip={getTooltipData(kpi.actualValue)}
                                                                data-for="benActualTable-values-tooltip"
                                                                data-place="top"
                                                                style={{
                                                                    textAlignLast: "right", width: '17%',
                                                                    minWidth: '68px',
                                                                    backgroundColor: benefitData ? '#ff8787' : '#6c6c6cbf',
                                                                    color: '#ffffff'
                                                                }}>
                                                                {kpi.hasActualError !== 'Y' ?
                                                                    <NumberFormat
                                                                        disabled
                                                                        style={{
                                                                            width: '100%', border: 'none',
                                                                            backgroundColor: benefitData ? '#ff8787' : '#6c6c6cbf',
                                                                            color: '#b9b9b9', textAlignLast: 'right'
                                                                        }}
                                                                        thousandSeparator={true}
                                                                        value={
                                                                            // Number(kpi.benefitValue).toFixed(1)
                                                                            Number(Math.round(Number(kpi.actualValue) * 10) / 10).toFixed(1)
                                                                        }>
                                                                    </NumberFormat> :
                                                                    // ( kpi.actualErrorDescription)
                                                                    '#REF'
                                                                }

                                                                {/* <ReactTooltip type="light" html={true} thousandSeparator={true} /> */}
                                                            </td>)) : null}
                                                    < td data-tip={getTooltipData(kpi.actualValue)}

                                                        data-for="benActualTable-values-tooltip"
                                                        data-place="top" style={{
                                                            textAlignLast: "right", width: '17%',
                                                            minWidth: '68px',
                                                            backgroundColor: benefitData ? '#ff8787' : '#6c6c6cbf',
                                                            color: '#ffffff'
                                                        }}>
                                                        {kpi.hasActualError !== 'Y' ?
                                                            <NumberFormat
                                                                disabled
                                                                style={{
                                                                    width: '100%', border: 'none',
                                                                    backgroundColor: benefitData ? '#ff8787' : '#6c6c6cbf',
                                                                    color: '#b9b9b9', textAlignLast: 'right'
                                                                }}
                                                                thousandSeparator={true}
                                                                value={
                                                                    // Number(kpi.benefitValue).toFixed(1)
                                                                    Number(Math.round(Number(kpi.actualValue) * 10) / 10).toFixed(1)
                                                                }>
                                                            </NumberFormat> :
                                                            // ( kpi.actualErrorDescription)
                                                            '#REF'
                                                        }

                                                        {/* <ReactTooltip type="light" html={true} thousandSeparator={true} /> */}
                                                    </td>
                                                </Fragment> : null)
                                        ))}
                                    </Fragment>
                                </tr>
                            }
                        </tbody>
                    </table>
                    <ReactTooltip id="benActualTable-values-tooltip" className="tooltip-class" />
                </div>
            </div>
        </Fragment >
    );
}

export default BenefitActualTable;

