import React, { Fragment } from 'react';
import './KpiTable.css';
import NumberFormat from 'react-number-format';

import plusIco_brackets from "../../assets/project/fvdt/plusWithBackets.svg";
import plusIco from "../../assets/project/fvdt/addRowIcon.svg";
import deleteIcon from "../../assets/newDealsIcons/trashdelete.svg";
import dragDropIcon from "../../assets/newDealsIcons/cpDragDrop.svg";
import ReactTooltip from 'react-tooltip';

import arrayMove from "array-move";

import {
    sortableContainer,
    sortableElement,
    sortableHandle,
  } from 'react-sortable-hoc';

var SessionStorage = require('store/storages/sessionStorage');

const DragHandle = sortableHandle(
    ({param }) => 
        <>
            <img
                data-tip=""
                data-for= {`drag_icon_tt_${param.order}`}
                data-place="left" src={dragDropIcon} alt="icon"
                className="delete-buttonIcn"
                style={{ cursor: 'grab', marginRight: "5px"}}
            />
            
        </>
    );

const SortableItem = sortableElement(({errorIndexArr, param, checkForError, getName, paramIndex, index,
    onNewParamChange, paramArray, showUnitOnClick, onCpUnitBlur, doesParamExist, unitEnabled, onSetNewMFUnit,
    kpiUnits, getTooltipData, BenifitsArray, maxYear, targetYearValue, onChangeMultiplicationFactor,
    onMFBlur, onFocusMF, onChangeKPITargetEachYear, onTargetBlur, onTargetFocus, delinkKPIs,deleteRowLoader
    }) => (
        <tr className={errorIndexArr.includes(paramIndex) ? 'error-border kpi-draggable' : 'kpi-draggable'}>
        <td className="kpi-td-input"
            style={{
            color: ((param.paramType === 'MF' && !checkForError(param) /* && (param.paramRule === null)*/) ? '#ffffff' : `${checkForError(param) ? '#ffffff' : '#b9b9b9'}`),
            backgroundColor: ((param.paramType === 'MF' && !checkForError(param)/* && (param.paramRule === null)*/) ? '#4D4D4D' : `${checkForError(param) ? '#ff8787' : '#5A5A5A'}`)
        }}>
            {
                (param.paramId !== null && param.paramType === "CP")? <div>
                        {getName(param.paramName)}
                </div>
                :
                    <div>
                        <input className="new_input" list="paramList" value={param.paramName}
                            style ={{background: param.paramType === "MF" ? "#4D4D4D" : "rgba(88, 87, 87, 0.5)"}}
                            placeholder="Enter parameter name"
                            value={param.paramName}
                            onChange={(event) => onNewParamChange(event, paramIndex)} />
                        {param.paramName !== '' ?
                            <datalist className="input-width" id="paramList">
                                <option disabled value ={''} >Select a param</option>
                                {
                                    paramArray.map((indParam,i) => {
                                        return <option key = {i} value={indParam.cpName}>{indParam.cpName}</option>;
                                    })
                                }
                            </datalist>
                            : ''
                        }
                    </div>
            }
        </td>
        <td id={paramIndex} onClick = {(e) => showUnitOnClick(e)} 
        onBlur = {(e) => onCpUnitBlur(e)} 
        className="kpi-td-unit"
        style={{ 
        backgroundColor: ((param.paramType === 'MF' && !checkForError(param)/* && (param.paramRule === null)*/) ? '#4D4D4D' : `${checkForError(param) ? '#ff8787' : '#5A5A5A'}`),
        }}>
            {
                doesParamExist(param) && (paramIndex.toString() !== unitEnabled)?
                    param.paramUnit :
                    (param.paramType === 'MF' ?
                        <select className="input-width select-hide-arrow"
                        value={param.paramUnit} onChange={(event) => onSetNewMFUnit(event, paramIndex)}>
                            <option disabled value ={''}>Unit</option>
                            {
                                kpiUnits.map((kpiUnit, kpiIndex) => <option key = {kpiIndex} value={kpiUnit}>
                                    {kpiUnit}
                                </option>)
                                //kpiUnits.map(kpiUnit => <option>{kpiUnit}</option>)
                            }
                        </select> : param.paramUnit
                    )
            }
        </td>
        <td
            data-tip={getTooltipData(param.data[0].paramValue.actualValue && param.data[0].paramValue.actualValue !== null ? param.data[0].paramValue.actualValue : param.data[0].paramValue.actualValue)}
            data-for="kpiT-values-tooltip"
            data-place="top"
            className = "kpi-td-year"
            style={{ color: "#FFFFFF", backgroundColor: ((param.paramType === 'MF' && !checkForError(param)/* && (param.paramRule === null)*/) ? '#5A5A5A' : `${checkForError(param) ? '#ff8787' : '#5A5A5A'}`)}}>
            {/* <ReactTooltip  className="tooltip-class"  html={true}/> */}
            <NumberFormat
                disabled
                style={{
                    width: '100%', border: 'none', color: "#FFFFFF",
                    backgroundColor: ((param.paramType === 'MF' && !checkForError(param)/* && (param.paramRule === null)*/) ? '#5A5A5A' : `${checkForError(param) ? '#ff8787' : '#5A5A5A'}`), textAlignLast: 'right', padding: '0px', color: "#FFFFFF"
                }}
                thousandSeparator={true}
                value={Number(Math.round(Number(param.data[0].paramValue.actualValue) * 10) / 10).toFixed(1)}
            />
        </td>

        {param.data && param.data.map((data, index1) => (
            (maxYear > index1 ?
                <td key = {index1} data-tip={getTooltipData(
                    data.paramValue && data.paramValue.actualValue ? data.paramValue.actualValue : null
                )}
                    data-for="kpiT-values-tooltip"
                    data-place="top"
                    className = "kpi-td-year"
                    style={{
                        color: "#FFFFFF",
                        backgroundColor: (paramIndex === 0 && index1 < (Number(targetYearValue) - 1) ? "#4D4D4D" :
                            ((param.paramType === 'MF' && !checkForError(param) /* && (param.paramRule === null)*/) ? '#4D4D4D' : `${checkForError(param) ? '#ff8787' : '#5A5A5A'}`)),
                    }}
                >
                    {/* <ReactTooltip  className="tooltip-class"  html={true}/> */}
                    {param.paramType === 'MF' ?

                        (data.paramHasError === 'Y' ? <div data-tip={getTooltipData('#REF')}>#REF</div> :
                            <NumberFormat
                                // id={KPIBenefitsArray && KPIBenefitsArray.length > 0 && KPIBenefitsArray.kpiId ?
                                //     (KPIBenefitsArray.kpiId + '@' + index + '@' + data.paramDataId + '@' + param.paramName + '@' + param.unit) : ''}
                                id={index1}
                                name={param.paramName}
                                style={{
                                    fontSize: '10px', borderRadius: '0px', border: 'none', padding: '0px', width: '100%', textAlignLast: 'right',
                                    backgroundColor:  /*param.paramRule ? "#d3d3d305" :*/ "#4D4D4D", color: "#FFFFFF"
                                }}
                                className="form-control "
                                thousandSeparator={true}
                                value={data.paramValue && (data.paramValue.actualValue || data.paramValue.actualValue === 0) ?
                                    (data.paramValue.formattedValue > 0 ? data.paramValue.formattedValue :
                                        Number(Math.round(Number(data.paramValue.actualValue) * 10) / 10).toFixed(1)
                                    )
                                    : null}
                                onChange={(event) => onChangeMultiplicationFactor(event, paramIndex, index1)}
                                onBlur={(event) => onMFBlur(event, paramIndex, index1)}
                                disabled={(param.paramRule)}
                                onFocus={(event) => onFocusMF(event, paramIndex, index1)}
                            />

                        )
                        :
                        (paramIndex === 0 && index1 < (Number(targetYearValue) - 1) ?
                            (data.paramHasError === 'Y' ? '#REF' :
                                <NumberFormat
                                    name={param.paramName}
                                    // id={KPIBenefitsArray && KPIBenefitsArray.length > 0 && KPIBenefitsArray.kpiId ?
                                    //     (KPIBenefitsArray.kpiId + '@' + index + '@' + data.paramDataId + '@' + param.paramName + '@' + param.unit) : ''}
                                    id={index1}
                                    style={{ width: '100%', border: 'none', color: "#FFFFFF", backgroundColor: '#4D4D4D', textAlignLast: 'right', padding: '0px' }}
                                    value={data.paramValue && (data.paramValue.actualValue || data.paramValue.actualValue === 0) ?
                                        (data.paramValue.formattedValue > 0 ? data.paramValue.formattedValue :
                                            // Number(data.paramValue.actualValue).toFixed(1)
                                            Number(Math.round(Number(data.paramValue.actualValue) * 10) / 10).toFixed(1)
                                        ) : null}
                                    onChange={(event) => onChangeKPITargetEachYear(event, paramIndex, index1)}
                                    onBlur={(event) => onTargetBlur(event, paramIndex, index1)}
                                    onFocus={(event) => onTargetFocus(event, paramIndex, index1)}
                                    thousandSeparator={true}
                                />
                            )
                            :
                            (data.paramHasError === 'Y' ? '#REF' :
                                <NumberFormat
                                    name={param.paramName}
                                    id={index1}
                                    disabled
                                    style={{ width: '100%', border: 'none', backgroundColor: '#5A5A5A', color: "#FFFFFF", textAlignLast: 'right', padding: '0px' }}
                                    value=
                                    {
                                        data.paramValue && (data.paramValue.actualValue !== undefined) ?
                                            (
                                                param.paramType === 'CP' && (data.paramValue.actualValue === null) ? '' :
                                                    (param.paramType !== 'CP' && (data.paramValue.actualValue === null) ? '' : Number(Math.round(Number(data.paramValue.actualValue) * 10) / 10).toFixed(1))
                                            ) : null
                                    }
                                    thousandSeparator={true}
                                />)
                        )
                    }
                </td> : '')
        ))}
        {param.paramType === 'MF' || param.paramType === 'CP' ?
   
            <td className="kpi-td-delete" disabled={true}>
                <DragHandle param={param}/>
                <ReactTooltip id={`drag_icon_tt_${param.order}`}
                    className="drag-icon" >Drag & Reorder</ReactTooltip>
                <img className="tableImg" src={deleteIcon} alt="delete" id={param.paramId}
                    style={{
                        opacity: (SessionStorage.read("isMaster") === "Y" || (SessionStorage.read("accessType") === "Read")) ? '0.5' : 'unset',
                        cursor: (SessionStorage.read("isMaster") === "Y" || SessionStorage.read("accessType") === "Read") ? 'not-allowed' : (deleteRowLoader ?'wait' : 'pointer')
                    }}
                    name={param.paramName}
                    onClick={(SessionStorage.read("isMaster") === "Y" || SessionStorage.read("accessType") === "Read") ? 'return false;' : (id) => delinkKPIs(id, param, paramIndex)}
                    data-tip=""
                    data-for="kpiT-deleteParam-tooltip"
                    data-place="left" />
                <ReactTooltip id="kpiT-deleteParam-tooltip" className="tooltip-class">
                    <span>Delete</span>
                </ReactTooltip>
            </td>
            
            : ''}
            
    </tr>
    
));
  
const SortableContainer = sortableContainer(({children}) => {
return <tbody>{children}</tbody>;
});
var SessionStorage = require('store/storages/sessionStorage');

const KPITable = (props) => {
    let { KPIBenefitsArray } = props;
    const { BenifitsArray } = props;
    const TypeOfKpi = (BenifitsArray && BenifitsArray[0].kpiType)
    const TypeOfBusType = (KPIBenefitsArray && KPIBenefitsArray[0].kpiBusType)
    const option = SessionStorage.read('option_selected');
    const benefitData = KPIBenefitsArray[0].kpiBenefits.find((benefit) => benefit.benefitHasError);
    var showPlus = true;
    let containerEl = null;
    
    //Filtering common params values for extra years
    const maxYear = KPIBenefitsArray[0].paramDto[0].data.length;
    const targetYearValue = (BenifitsArray[0].targetAchieved !== null && BenifitsArray[0].targetAchieved.substr(4, 5));
    const kpiBenefits = KPIBenefitsArray;
    const kpiUnits = ['#', '$', '%', '#/$'];
    if (kpiBenefits.length > 0) {
        for (let i = 0; i < kpiBenefits.length; i++) {
            if (props.kpiId === kpiBenefits[i].kpiId) {
                KPIBenefitsArray = kpiBenefits[i];
            }
        }
    }
    const yearArray = [];
    for (let i = 1; i <= kpiBenefits[0].paramDto[0].data.length; i++) {
        yearArray.push(i);
    }
    // if (kpiBenefits[0].paramDto[0].paramValues.length >= 10) {
    //     showPlus = false;
    // }
    props.setYearArrayLength(yearArray);
    const getTooltipData = (value) => {
        if (value) {
            let val = String(value).replace(/(?<!\..*)(\d)(?=(?:\d{3})+(?:\.|$))/g, '$1,');
            return `${val}`;
        }
    }
    const isParamActive = (currentParam) => {
        return currentParam.data.map(paramVal => {
            return paramVal.activeFlag;
        });
    };


    const getName = (paramName) => {
        if (paramName === 'Incremental Benefit') {
            return 'Incremental Target';
        }
        return paramName;
    };
    const checkForError = (param) => {
        const paramHasError = false;
        //Comment below 3 lines of code and uncomment the above one
        // const hasError = param.paramValues.find(item => 
        //     item? 
        //         item.hasError === 'Y' : false
        //     );
        if (paramHasError) {
            return true;
        }
        return false;
    };

    const helperFun = () => {
        return containerEl;
    }

    const onSortEnd = ({oldIndex, newIndex}) => {
        props.onSortEnd(oldIndex, newIndex);
    };

    /*const beforeSorting = ({node, index}, event) => {
       hideTooltips = true
    }*/

    return (
        <Fragment>
            <div className="kpi-table-parent-div">
                <div className={`kpi-table table-responsive kpi-table-child-div ${props.hideTooltips ? 'hide-kpi-tt' : ''}`} >
                    {/* <div className=""> */}
                    <table className="table" ref={el => (containerEl = el)}>
                        <thead>
                            <tr key={Math.random()}>
                                <th>Parameter</th>
                                <th>Unit</th>
                                <th>{'Year ' + 0}</th>
                                {yearArray && yearArray.map((index) => (
                                    <th key={index}>{'Year ' + index}</th>
                                ))}
                                {option !== "sales" && showPlus ?
                                    <th className=" add-year-th">
                                        {
                                            yearArray.length < 10 &&
                                            <span onClick={props.addColoumnHandler}>
                                                <img src={plusIco_brackets} alt="add"
                                                    data-tip=""
                                                    data-for="kpiT-addYear-tooltip"
                                                    data-place="left" />
                                                <ReactTooltip id="kpiT-addYear-tooltip" className="tooltip-class">
                                                    <span>Add Year</span>
                                                </ReactTooltip>
                                            </span>
                                        }
                                        {
                                            yearArray.length > 5 &&
                                            <span>
                                                {' '} <img className="tableImg" src={deleteIcon} alt="delete" onClick={props.deleteColumnHandler}
                                                    data-tip=""
                                                    data-for="kpiT-deleteYear-tooltip"
                                                    style={{ cursor: (props.deleteLoader ? 'wait': 'pointer') ,opacity: (props.deleteLoader ? "0.5" : "unset")}}
                                                    data-place="left" />
                                                <ReactTooltip id="kpiT-deleteYear-tooltip" className="tooltip-class">
                                                    <span>Delete Year</span>
                                                </ReactTooltip>
                                            </span>
                                        }
                                    </th> : <th className="d-inline-block align-top add-year-th"></th>}
                            </tr>
                        </thead>
                        <SortableContainer onSortEnd={onSortEnd} 
                            updateBeforeSortStart={props.beforeSorting}
                            useDragHandle lockAxis="y"
                            lockToContainerEdges={true}
                            disableAutoscroll={true}
                            helperContainer = {helperFun}
                            // useWindowAsScrollContainer={true}
                            helperClass="kpi-draggable-row"
                            /*lockOffset={["30%","80%"]}*/> 

                        
                            {KPIBenefitsArray && KPIBenefitsArray.paramDto && KPIBenefitsArray.paramDto.map((param, index) => (
                            (() => isParamActive(param).indexOf('N') === -1) && index <=1 && 
                            <tr key ={index} className={props.errorIndexArr.includes(index) ? 'error-border' : ''}>
                                <td className="kpi-td-input"
                                    style={{
                                    color: ((param.paramType === 'MF' && !checkForError(param) /* && (param.paramRule === null)*/) ? '#ffffff' : `${checkForError(param) ? '#ffffff' : '#b9b9b9'}`),
                                    backgroundColor: ((param.paramType === 'MF' && !checkForError(param)/* && (param.paramRule === null)*/) ? '#4D4D4D' : `${checkForError(param) ? '#ff8787' : '#5A5A5A'}`)
                                }}>
                                    {
                                        <div>
                                                {getName(param.paramName)}
                                        </div>
                                    }
                                </td>
                                <td id={index}  
                                className="kpi-td-unit"
                                style={{ 
                                backgroundColor: ((param.paramType === 'MF' && !checkForError(param)/* && (param.paramRule === null)*/) ? '#4D4D4D' : `${checkForError(param) ? '#ff8787' : '#5A5A5A'}`),
                                }}>
                                     {param.paramUnit}       
                                </td>
                                {index === 0 ?
                                    <td
                                        data-tip={getTooltipData(BenifitsArray[0].baseline)}
                                        data-for="kpiT-values-tooltip"
                                        data-place="top"
                                        style={{ 
                                        backgroundColor: checkForError(param) ? '#ff8787' : '#5A5A5A'}}
                                        className = "kpi-td-year"
                                    >
                                        {/* <ReactTooltip  className="tooltip-class"  html={true}/> */}
                                        <NumberFormat
                                            disabled
                                            style={{
                                                width: '100%', border: 'none',
                                                backgroundColor: '#5A5A5A',
                                                color: "#FFFFFF",
                                                textAlignLast: 'right',
                                                padding: '0px',
                                            }}
                                            thousandSeparator={true}
                                            value={Number(Math.round(Number(BenifitsArray[0].baseline) * 10) / 10).toFixed(1)}
                                        />
                                    </td> :
                                    (index === 1 ?
                                        <td data-tip={getTooltipData("0")}
                                            data-for="kpiT-values-tooltip"
                                            data-place="top"
                                            style={{backgroundColor: checkForError(param) ? '#ff8787' : '#5A5A5A', 
                                            color: "#FFFFFF" }}
                                            className = "kpi-td-year">
                                            {/* <ReactTooltip  className="tooltip-class"  html={true}/> */}
                                             0.0</td> :
                                        "")}

                                {param.data && param.data.map((data, index1) => (
                                    (maxYear > index1 ?
                                        <td key={index1} data-tip={getTooltipData(
                                            data.paramValue && data.paramValue.actualValue ? data.paramValue.actualValue : null
                                        )}
                                            data-for="kpiT-values-tooltip"
                                            data-place="top"
                                            className = "kpi-td-year"
                                            style={{
                                                color: "#FFFFFF",
                                                backgroundColor: (index === 0 && index1 < (Number(targetYearValue) - 1) ? "#4D4D4D" :
                                                    ((param.paramType === 'MF' && !checkForError(param) /* && (param.paramRule === null)*/) ? '#4D4D4D' : `${checkForError(param) ? '#ff8787' : '#5A5A5A'}`)),
                                            }}
                                        >
                                            {/* <ReactTooltip  className="tooltip-class"  html={true}/> */}
                                            {param.paramType === 'MF' ?

                                                (data.paramHasError === 'Y' ? <div data-tip={getTooltipData('#REF')}>#REF</div> :
                                                    <NumberFormat
                                                        // id={KPIBenefitsArray && KPIBenefitsArray.length > 0 && KPIBenefitsArray.kpiId ?
                                                        //     (KPIBenefitsArray.kpiId + '@' + index + '@' + data.paramDataId + '@' + param.paramName + '@' + param.unit) : ''}
                                                        id={index1}
                                                        name={param.paramName}
                                                        style={{
                                                            fontSize: '10px', borderRadius: '0px', border: 'none', padding: '0px', width: '100%', textAlignLast: 'right',
                                                            backgroundColor:  /*param.paramRule ? "#d3d3d305" :*/ "#4D4D4D", color: "#FFFFFF"
                                                        }}
                                                        className="form-control "
                                                        thousandSeparator={true}
                                                        value={data.paramValue && (data.paramValue.actualValue || data.paramValue.actualValue === 0) ?
                                                            (data.paramValue.formattedValue > 0 ? data.paramValue.formattedValue :
                                                                Number(Math.round(Number(data.paramValue.actualValue) * 10) / 10).toFixed(1)
                                                            )
                                                            : null}
                                                        onChange={(event) => props.onChangeMultiplicationFactor(event, index, index1)}
                                                        onBlur={(event) => props.onMFBlur(event, index, index1)}
                                                        disabled={(param.paramRule)}
                                                        onFocus={(event) => props.onFocusMF(event, index, index1)}
                                                    />

                                                )
                                                :
                                                (index === 0 && index1 < (Number(targetYearValue) - 1) ?
                                                    (data.paramHasError === 'Y' ? '#REF' :
                                                        <NumberFormat
                                                            name={param.paramName}
                                                            // id={KPIBenefitsArray && KPIBenefitsArray.length > 0 && KPIBenefitsArray.kpiId ?
                                                            //     (KPIBenefitsArray.kpiId + '@' + index + '@' + data.paramDataId + '@' + param.paramName + '@' + param.unit) : ''}
                                                            id={index1}
                                                            style={{ width: '100%', border: 'none', color: "#FFFFFF", backgroundColor: '#4D4D4D', textAlignLast: 'right', padding: '0px' }}
                                                            value={data.paramValue && (data.paramValue.actualValue || data.paramValue.actualValue === 0) ?
                                                                (data.paramValue.formattedValue > 0 ? data.paramValue.formattedValue :
                                                                    // Number(data.paramValue.actualValue).toFixed(1)
                                                                    Number(Math.round(Number(data.paramValue.actualValue) * 10) / 10).toFixed(1)
                                                                ) : null}
                                                            onChange={(event) => props.onChangeKPITargetEachYear(event, index, index1)}
                                                            onBlur={(event) => props.onTargetBlur(event, index, index1)}
                                                            onFocus={(event) => props.onTargetFocus(event, index, index1)}
                                                            thousandSeparator={true}
                                                        />
                                                    )
                                                    :
                                                    (data.benefitHasError === 'Y' ? '#REF' :
                                                        <NumberFormat
                                                            name={param.paramName}
                                                            id={index1}
                                                            disabled
                                                            style={{ width: '100%', border: 'none', backgroundColor: '#5A5A5A', color: "#FFFFFF", textAlignLast: 'right', padding: '0px' }}
                                                            value=
                                                            {
                                                                data.paramValue && (data.paramValue.actualValue !== undefined) ?
                                                                    (
                                                                        param.paramType === 'CP' && (data.paramValue.actualValue === null) ? '' :
                                                                            (param.paramType !== 'CP' && (data.paramValue.actualValue === null) ? '' : Number(Math.round(Number(data.paramValue.actualValue) * 10) / 10).toFixed(1))
                                                                    ) : null
                                                            }
                                                            thousandSeparator={true}
                                                        />)
                                                )
                                            }
                                        </td> : '')
                                ))}

                                        <td 
                                            style={{backgroundColor: '#5A5A5A', border : "none",
                                            color: "#FFFFFF" }}
                                            className = "kpi-td-delete">
                                            {/* <ReactTooltip  className="tooltip-class"  html={true}/> */}
                                             </td>

                            </tr>
                        ))}

                        {KPIBenefitsArray && KPIBenefitsArray.paramDto && KPIBenefitsArray.paramDto.map((param, index) => (
                            (() => isParamActive(param).indexOf('N') === -1) && index > 1 &&
                            <SortableItem key={`item-${index}`} 
                                index = {index}
                                disabled={((SessionStorage.read("isMaster") === "Y") || (SessionStorage.read("accessType") === "Read")) ? true : false} 
                                param = {param} 
                                paramIndex = {index}
                                errorIndexArr ={props.errorIndexArr}
                                checkForError ={checkForError}
                                getName = {getName}
                                onNewParamChange = {props.onNewParamChange}
                                paramArray = {props.paramArray}
                                showUnitOnClick = {props.showUnitOnClick}
                                onCpUnitBlur = {props.onCpUnitBlur}
                                doesParamExist = {props.doesParamExist}
                                unitEnabled = {props.unitEnabled}
                                onSetNewMFUnit = {props.onSetNewMFUnit}
                                kpiUnits = {kpiUnits}
                                getTooltipData = {getTooltipData}
                                BenifitsArray = {BenifitsArray}
                                maxYear = {maxYear}
                                targetYearValue = {targetYearValue}
                                onChangeMultiplicationFactor = {props.onChangeMultiplicationFactor}
                                onMFBlur = {props.onMFBlur}
                                onFocusMF = {props.onFocusMF}
                                onChangeKPITargetEachYear = {props.onChangeKPITargetEachYear}
                                onTargetBlur = {props.onTargetBlur}
                                onTargetFocus = {props.onTargetFocus}
                                delinkKPIs = {props.delinkKPIs}
                                deleteRowLoader ={props.deleteRowLoader}
                            />
                        ))}
                            {TypeOfKpi === "NON_FINANCIAL" || (TypeOfKpi === "FINANCIAL" && TypeOfBusType === "WITHOUT_BUS_CASE") ? "" :
                                <tr style={{ backgroundColor: (benefitData ? '#ff8787' : '#6c6c6cbf'), color: "#FFFFFF" }}>
                                    <td style={{ color: 'white', height: "25px", backgroundColor: benefitData ? '#ff8787' : '#6c6c6cbf' }}>Benefits</td>
                                    <td style={{ textAlignLast: 'center', color: 'white', height: "25px", backgroundColor: benefitData ? '#ff8787' : '#6c6c6cbf' }}>$</td>
                                    <td style={{ textAlignLast: 'right', height: "25px", width: '11%', minWidth: '55px', color: "white", backgroundColor: benefitData ? '#ff8787' : '#6c6c6cbf' }}>
                                        0.0
                                </td>
                                    <Fragment>
                                        {KPIBenefitsArray && KPIBenefitsArray.kpiBenefits && KPIBenefitsArray.kpiBenefits.map((kpi, index) => (
                                            <td key={index * Math.random()}
                                                data-tip={kpi.benefitHasError ? "#REF" : kpi.benefitValue}
                                                data-for="kpiBT-values-tooltip"
                                                data-place="top"
                                                className = "kpi-td-year"
                                                style={{height: "25px", backgroundColor: benefitData ? '#ff8787' : '#6c6c6cbf', color: "#FFFFFF" }}>
                                                {
                                                    kpi.benefitHasError && '#REF'
                                                }
                                                {
                                                    !kpi.benefitHasError &&
                                                    <Fragment>
                                                        <NumberFormat
                                                            id={index}
                                                            disabled
                                                            style={{ width: '100%', border: 'none', backgroundColor: benefitData ? '#ff8787' : '#6c6c6cbf', color: "#FFFFFF", textAlignLast: 'right', padding: '0px' }}
                                                            thousandSeparator={true}
                                                            value={
                                                                Number(Math.round(Number(kpi.benefitValue) * 10) / 10).toFixed(1)
                                                            } />

                                                        <ReactTooltip id="kpiBT-values-tooltip" className="tooltip-class" />
                                                    </Fragment>
                                                }
                                            </td>
                                        ))
                                        }
                                    </Fragment>
                                    <td 
                                            style={{backgroundColor: '#5A5A5A', border : "none",
                                            color: "#FFFFFF" }}
                                            className = "kpi-td-delete">
                                            {/* <ReactTooltip  className="tooltip-class"  html={true}/> */}
                                             </td>
                                    {/* <td style={{ border: 'none',backgroundColor:"#4D4D4D",padding:"8px 0px 8px 8px",textAlignLast:"right" }}>
                                                    <span onClick={props.onAddMultiplicationFactor}>
                                                        <img src={plusIco} alt="plusIcon" className="delete-buttonIcn" />
                                                    </span>
                                                </td> */}
                                </tr>
                            }

                        </SortableContainer>
                    </table>

                    <ReactTooltip id="kpiT-values-tooltip" className="tooltip-class" />
                </div>
                {TypeOfKpi === "NON_FINANCIAL" || (TypeOfKpi === "FINANCIAL" && TypeOfBusType === "WITHOUT_BUS_CASE") ? "" :
                    <div>
                        <img src={plusIco} alt="Add"
                            // data-tip={getTooltipValue("Add Parameter")}
                            style={{
                                float: "left",
                                // cursor: "pointer"
                                opacity: (SessionStorage.read("isMaster") === "Y" || (SessionStorage.read("accessType") === "Read")) ? '0.5' : 'unset',
                                cursor: (SessionStorage.read("isMaster") === "Y" || (SessionStorage.read("accessType") === "Read")) ? 'not-allowed' : 'pointer'
                            }}
                            disabled={(SessionStorage.read("isMaster") === "Y" || (SessionStorage.read("accessType") === "Read")) ? true : false}
                            onClick={(SessionStorage.read("isMaster") === "Y" || (SessionStorage.read("accessType") === "Read")) ? () => { } : props.onAddMultiplicationFactor}
                            data-tip=""
                            data-for="kpiT-addParam-tooltip"
                            data-place="right" />
                        <ReactTooltip id="kpiT-addParam-tooltip" className="tooltip-class">
                            <span>Add Parameter</span>
                        </ReactTooltip>
                    </div>
                }
            </div>
        </Fragment >
    );
};

export default KPITable;

