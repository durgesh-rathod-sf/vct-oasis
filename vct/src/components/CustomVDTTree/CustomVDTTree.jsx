import React, { Fragment, useState } from 'react';
import './customVDTTree.css';
import KPIModal from "../KPIModal/KPIModal";
import { ContextMenuTrigger } from "react-contextmenu";
import { ContextMenu, MenuItem } from "react-contextmenu";
import { SteppedLineTo } from 'react-lineto';
import Draggable from "react-draggable";
import CustomConfirmModal from '../CustomConfirmModal/CustomConfirmModal';

const CustomVDTTree = (props) => {
    const [showMenu, setShowMenu] = useState(false);
    const [menuOption, setMenuOption] = useState([]);
    const [level, setLevel] = useState('');
    const [className, setClassName] = useState('');
    const [sourceObjIndex, setSourceObjIndex] = useState('');
    const [deleteFlag, setDeleteFlag] = useState(false);
    // const [marginTop] = useState('')
    const [enableDrag, setEnableDrag] = useState(false)
    const [enableVDDrag, setEnableVDDrag] = useState(false)
    const [enableBoDrag, setEnableBoDrag] = useState(false)
    const [enableFoDrag, setEnableFoDrag] = useState(false);
    const [deleteKPIModalVisible, setDeleteKPIModalVisible] = useState(false);
    const [deleteKPIModalTitle, setDeleteKPIModalTitle] = useState('');
    const [deleteObjModalVisible, setDeleteObjModalVisible] = useState(false);
    const [deleteObjModalTitle, setDeleteObjModalTitle] = useState('');

    const { strategicObjectives, financialObjectives, businessObjectives, valueDrivers, operationalKPIs,
        strategicObjectivesList, financialObjectivesList, businessObjectivesList, valueDriversList,
        operationalKPIsList, modalCloseHandler, saveKPIHandler, disableSo,
        disableFo, disableBo, disableVd, disableKPI, totalSelectedLinesArray, dragError } = props;

    const showContextMenuHandler = (event, sourceObjIndex) => {
        const type = event.target.dataset.type;

        // eslint-disable-next-line default-case
        switch (type) {
            case 'strategic_identifier':
                setMenuOption(props.financialObjectives);
                setLevel('soLevel_');
                break;
            case 'financial_identifier':
                setMenuOption(props.businessObjectives);
                setLevel('foLevel_');
                break;
            case 'business_identifier':
                setMenuOption(props.valueDrivers);
                setLevel('boLevel_');
                break;
            case 'value_driver_identifier':
                setMenuOption(props.operationalKPIs);
                setLevel('vdLevel_');
                break;
            case 'operational_identifier':
                setMenuOption([]);
                setDeleteFlag(true)
                setEnableDrag();
        }

        setShowMenu(event.target.dataset.type);
        setClassName(event.target.dataset.class);
        setSourceObjIndex(sourceObjIndex);
        props.updatedDisableDataListFlags(event, true);
    }

    const optionHandler = (event, option) => {
        const { target } = event;
        const index = target.id;
        const destinationObjClass = option.objType + index;
        const sourceObjClass = className;
        let destObjVal = option.value;

        const tempObj = {
            'sourceClass': sourceObjClass,
            'destClass': destinationObjClass,
            'checked': target.checked,
            'checkBoxIndex': index,
            'objectiveType': option.objType,
            'sourceObjectiveIndex': sourceObjIndex,
            'destObjectiveValue': destObjVal
        }
        props.buildALine(tempObj);
    }
    const deleteObjective = (event) => {
        event.preventDefault();
        const objectiveType = showMenu;

        if (objectiveType === 'operational_identifier') {
            const kpiMsg = "Since you're deleting an operational KPI, all your data will be lost. Are you sure you want to delete?";
            openDeleteKPIConfirmModal(kpiMsg);
            // if (window.confirm("")) {
            //     props.deleteObjective(objectiveType, initiatedIndex, menuOption);
            // }

        } else {
            const objMsg = 'Are you sure you want to delete?'
            openDeleteObjConfirmModal(objMsg);
            // if (window.confirm("Are you sure you want to delete?")) {
            //     props.deleteObjective(objectiveType, initiatedIndex, menuOption);
            // }
            // setDeleteFlag(false)
        }
    }

    const openDeleteKPIConfirmModal = (title) => {
        setDeleteKPIModalVisible(true);
        setDeleteKPIModalTitle(title);

    }

    const closeDeleteKPIConfirmModal = (isYesClicked) => {
        setDeleteKPIModalVisible(false);
        setDeleteKPIModalTitle('');
        if (isYesClicked) {
            // delete function
            const objectiveType = showMenu;
            const initiatedIndex = sourceObjIndex;
            props.deleteObjective(objectiveType, initiatedIndex, menuOption);
        } else {

        }
        setDeleteFlag(false);
    }

    const openDeleteObjConfirmModal = (title) => {
        setDeleteObjModalVisible(true);
        setDeleteObjModalTitle(title);
    }

    const closeDeleteObjConfirmModal = (isYesClicked) => {
        setDeleteObjModalVisible(false);
        setDeleteObjModalTitle('');
        if (isYesClicked) {
            // delete function
            const objectiveType = showMenu;
            const initiatedIndex = sourceObjIndex;
            props.deleteObjective(objectiveType, initiatedIndex, menuOption);
        } else {

        }
        setMenuOption([]);
        setDeleteFlag(false);
    }

    const editObjective = (event) => {
        const objectiveType = showMenu;
        const initiatedIndex = sourceObjIndex;
        props.editObjective(event, objectiveType, initiatedIndex, menuOption);
    }

    const resetMenuHandler = (event) => {
        // setMenuOption([]);
    }

    const handleKPIStart = (event) => {
        // event.stopPropagation();
        props.validateLinks();
        if (dragError === true) {
            setEnableDrag(false)
        }
        else if (enableDrag === true) {
            operationalKPIs.map((kpi) => {
                kpi.index !== Number(event.target.id) ? kpi.zIndex = '400' : kpi.zIndex = '0';
                return true
            })
            props.handleKPIStart(event.target.id)
        }

        return true
    }

    const handleKPIStop = (event) => {
        event.preventDefault();
        if (enableDrag === true) {
            props.handleKPIStop(event.target.id)
            setEnableDrag(false)
        }
    }


    const handleVDStop = (event) => {
        event.preventDefault();
        if (enableVDDrag === true) {
            props.handleVDStop(event.target.id)
            setEnableVDDrag(false)
        }

    }
    const handleVDStart = (event) => {
        props.validateLinks();
        if (dragError === true) {
            setEnableVDDrag(false)
        }
        else if (enableVDDrag === true) {
            valueDrivers.map((vdObj) => {
                vdObj.index !== Number(event.target.id) ? vdObj.zIndex = '400' : vdObj.zIndex = '0';
                return true
            })
            props.handleVDStart(event.target.id)
        }
        return true;
    }
    const handleBoStop = (event) => {
        event.preventDefault();
        if (enableBoDrag === true) {
            props.handleBoStop(event.target.id)
            setEnableBoDrag(false)
        }

    }
    const handleBoStart = (event) => {
        props.validateLinks();
        if (dragError === true) {
            setEnableBoDrag(false)
        }
        else if (enableBoDrag === true) {
            businessObjectives.map((bObj) => {
                bObj.index !== Number(event.target.id) ? bObj.zIndex = '400' : bObj.zIndex = '0';
                return true
            })
            props.handleBoStart(event.target.id)
        }
        return true;
    }
    const handleFoStop = (event) => {
        event.preventDefault();
        if (enableFoDrag === true) {
            props.handleFoStop(event.target.id)
            setEnableFoDrag(false)
        }

    }
    const handleFoStart = (event) => {
        props.validateLinks();
        if (dragError === true) {
            setEnableFoDrag(false)
        }
        else if (enableFoDrag === true) {
            financialObjectives.map((fObj) => {
                fObj.index !== Number(event.target.id) ? fObj.zIndex = '400' : fObj.zIndex = '0';
                return true
            })
            props.handleFoStart(event.target.id)
        }
        return true;
    }
    const onKPIdoubleClick = () => {
        props.validateLinks();
        if (dragError === true) {
            setEnableDrag(false)
        }
        else if (enableDrag === true) {
            setEnableDrag(false)
        }
        else {
            setEnableDrag(true)
        }
    }
    const onVDdoubleClick = () => {
        props.validateLinks();
        if (dragError === true) {
            setEnableDrag(false)
        }
        else if (enableVDDrag === true) {
            setEnableVDDrag(false)
        }
        else {
            setEnableVDDrag(true)
        }
    }
    const onBodoubleClick = () => {
        props.validateLinks();
        if (dragError === true) {
            setEnableDrag(false)
        }
        else if (enableBoDrag === true) {
            setEnableBoDrag(false)
        }
        else {
            setEnableBoDrag(true)
        }
    }
    const onFodoubleClick = () => {
        props.validateLinks();
        if (dragError === true) {
            setEnableDrag(false)
        }
        else if (enableFoDrag === true) {
            setEnableFoDrag(false)
        }
        else {
            setEnableFoDrag(true)
        }
    }




    return (
        <Fragment>
            <div className='row no-gutters tree-row'>

                <div className='strat-obj-stack'>{
                    strategicObjectives && strategicObjectives.map((sob, sobIndex) => (
                        <div key={sobIndex} className="objective-encloser">
                            {!sob.isLabel ?
                                <div key={sobIndex * Math.random()} style={{}}>
                                    <ContextMenuTrigger id="strategic_identifier">
                                        <input type="text" list="strategicObjective" name="strategicObjective"
                                            data-type="strategic_identifier"
                                            data-class={'strategic_identifier' + sob.index}
                                            autoComplete="off"
                                            maxLength="100"
                                            onClick={(event) => props.updatedDisableDataListFlags(event, false)}
                                            onContextMenu={(e) => { showContextMenuHandler(e, sob.index) }}
                                            data-index={sob.index}
                                            className={`soObjectiveList ${'strategic_identifier' + sob.index}`}
                                            onChange={(event) => props.onSelectedObjective(event, "SO")}
                                            value={sob.value}
                                            onBlur={(event) => props.newStrategicObj(event, "SO")}
                                        />
                                    </ContextMenuTrigger>
                                    <datalist id="strategicObjective" style={{ maxHeight: '20px', display:'none' }}>
                                        {
                                            strategicObjectivesList && strategicObjectivesList.map((objective) => (
                                                <option value={objective} />
                                            ))}
                                    </datalist>
                                </div> :
                                <div style={{}}>
                                    <ContextMenuTrigger id="strategic_identifier">

                                        <div key={sobIndex * Math.random()}
                                        // style={{ marginTop: '1%', marginLeft: '1%', width: "min-content" }}
                                        >
                                            <span
                                                className={`customLabel ${'strategic_identifier' + sob.index}`}
                                                data-type="strategic_identifier"
                                                data-class={'strategic_identifier' + sob.index}
                                                autoComplete="off"
                                                onClick={(event) => props.updatedDisableDataListFlags(event, false)}
                                                onContextMenu={(e) => { showContextMenuHandler(e, sob.index) }}
                                                data-index={sob.index}
                                                style={{ backgroundColor: '#99d2ff', color: '#000000' }}>{sob.value}</span>
                                        </div>

                                    </ContextMenuTrigger>
                                </div>

                            }
                        </div>
                    ))
                }
                </div>

                <div className="finan_obj_stack">
                    {financialObjectives && financialObjectives.map((finanObj, fobIndex) => (
                        <div key={fobIndex} className="objective-encloser">
                            {!finanObj.isLabel ?
                                <div style={{}}>
                                    <ContextMenuTrigger id="financial_identifier">

                                        <input list="financialObjective" name="financialObjective"
                                            className={`foObjectiveList ${'financial_identifier' + finanObj.index}`}
                                            onContextMenu={(e) => { showContextMenuHandler(e, finanObj.index) }}
                                            autoComplete="off"
                                            maxLength="100"
                                            onClick={(event) => props.updatedDisableDataListFlags(event, false)}
                                            data-type="financial_identifier"
                                            data-class={'financial_identifier' + finanObj.index}
                                            data-index={finanObj.index}
                                            onChange={(event) => props.onSelectedObjective(event, "FO")}
                                            value={finanObj.value}
                                            onBlur={(event) => props.newFinancialObj(event, "FOB")}
                                            onDoubleClick={(event) => onFodoubleClick(true)}

                                        />

                                    </ContextMenuTrigger>
                                    <div style={{display: !disableFo && finanObj.value !== "" ? 'block' : 'none'}}>
                                    <datalist id="financialObjective" style={{ height: '20px' }}>
                                        {
                                            financialObjectivesList && financialObjectivesList.map((objective) => (
                                                <option value={objective} />
                                            ))}
                                    </datalist>
                                    </div>
                                </div> :
                                <Draggable
                                    axis='y'
                                    defaultPosition={{ x: 0, y: 0 }}
                                    position={null}
                                    grid={[50, 10]}
                                    scale={1}
                                    onStart={handleFoStart}
                                    onStop={handleFoStop}>
                                    <div className={enableFoDrag ? "draggable" : ''}
                                        style={{
                                            // marginTop: '9%', marginLeft: '1%', width: "min-content",
                                            // width: '100px',
                                            zIndex: finanObj.zIndex, position: 'relative'
                                        }}
                                        id={fobIndex}>
                                        {enableFoDrag ?
                                            <span
                                                className={`customLabel ${'financial_identifier' + finanObj.index}`}
                                                data-type="financial_identifier"
                                                data-class={'financial_identifier' + finanObj.index}
                                                onContextMenu={(e) => { showContextMenuHandler(e, finanObj.index) }}
                                                data-index={finanObj.index}
                                                onDoubleClick={(event) => onFodoubleClick()}
                                                id={fobIndex}
                                                style={{ backgroundColor: '#66BBFF', color: '#000000' }}>{finanObj.value}</span>
                                            :
                                            <ContextMenuTrigger id="financial_identifier">

                                                <span
                                                    className={`customLabel ${'financial_identifier' + finanObj.index}`}
                                                    data-type="financial_identifier"
                                                    data-class={'financial_identifier' + finanObj.index}
                                                    onContextMenu={(e) => { showContextMenuHandler(e, finanObj.index) }}
                                                    data-index={finanObj.index}
                                                    onDoubleClick={(event) => onFodoubleClick()}
                                                    style={{ backgroundColor: '#66bbff', color: '#000000' }}>{finanObj.value}</span>

                                            </ContextMenuTrigger>
                                        }
                                    </div>
                                </Draggable>

                            }
                        </div>

                    ))}
                </div>
                <div className="busin-obj-stack">
                    {businessObjectives && businessObjectives.map((bobj, bobIndex) => (
                        <div key={bobIndex} className="objective-encloser">
                            {!bobj.isLabel ?
                                <div style={{}}>
                                    <ContextMenuTrigger id="business_identifier">

                                        <input list="businessObjective" name="businessObjective"
                                            className={`boObjectiveList ${'business_identifier' + bobj.index}`}
                                            autoComplete="off"
                                            maxLength="100"
                                            onClick={(event) => props.updatedDisableDataListFlags(event, false)}
                                            data-type="business_identifier"
                                            data-class={'business_identifier' + bobj.index}
                                            onContextMenu={(e) => { showContextMenuHandler(e, bobj.index) }}
                                            data-index={bobj.index}
                                            onChange={(event) => props.onSelectedObjective(event, "BO")}
                                            value={bobj.value}
                                            onBlur={(event) => props.newBusinessObj(event, "BOB")}
                                            onDoubleClick={(event) => onBodoubleClick(true)}

                                        />

                                    </ContextMenuTrigger>
                                    <div style={{display: !disableBo && bobj.value !== "" ? 'block' : 'none'}}>
                                    <datalist id="businessObjective" style={{ height: '20px' }}>
                                        {
                                            businessObjectivesList && businessObjectivesList.map((objective) => (
                                                <option value={objective} />
                                            ))}
                                    </datalist>
                                    </div>
                                </div> :
                                <Draggable
                                    axis='y'
                                    defaultPosition={{ x: 0, y: 0 }}
                                    position={null}
                                    grid={[50, 10]}
                                    scale={1}
                                    onStart={handleBoStart}
                                    onStop={handleBoStop}
                                >
                                    <div className={enableBoDrag ? "draggable" : ''}
                                        style={{
                                            // marginTop: '9%', marginLeft: '1%',
                                            // width:"min-content",
                                            zIndex: bobj.zIndex, position: 'relative'
                                        }}
                                        id={bobIndex}>
                                        {enableBoDrag ?
                                            <span
                                                className={`customLabel ${'business_identifier' + bobj.index}`}
                                                data-type="business_identifier"
                                                data-class={'business_identifier' + bobj.index}
                                                onDoubleClick={(event) => onBodoubleClick()}
                                                onContextMenu={(e) => { showContextMenuHandler(e, bobj.index) }}
                                                data-index={bobj.index}
                                                id={bobIndex}
                                                style={{ backgroundColor: '#6694ff', color: '#ffffff' }}>{bobj.value}</span>
                                            :
                                            <ContextMenuTrigger id="business_identifier">

                                                <span
                                                    className={`customLabel ${'business_identifier' + bobj.index}`}
                                                    data-type="business_identifier"
                                                    data-class={'business_identifier' + bobj.index}
                                                    onDoubleClick={(event) => onBodoubleClick()}
                                                    onContextMenu={(e) => { showContextMenuHandler(e, bobj.index) }}
                                                    data-index={bobj.index}
                                                    style={{ backgroundColor: '#6694ff', color: '#ffffff' }}>{bobj.value}</span>

                                            </ContextMenuTrigger>
                                        }
                                    </div>
                                </Draggable>
                            }
                        </div>
                    ))}
                </div>
                <div className="vd-obj-stack">
                    {valueDrivers && valueDrivers.map((vdObj, vdoIndex) => (
                        <div key={vdoIndex} className="objective-encloser">
                            {!vdObj.isLabel ?
                                <div style={{}}>
                                    <ContextMenuTrigger id="value_driver_identifier">

                                        <input list="valueDriver" name="valueDriver"
                                            className={`vdObjectiveList ${'value_driver_identifier' + vdObj.index}`}
                                            autoComplete="off"
                                            maxLength="100"
                                            onClick={(event) => props.updatedDisableDataListFlags(event, false)}
                                            data-type="value_driver_identifier"
                                            data-class={'value_driver_identifier' + vdObj.index}
                                            onContextMenu={(e) => { showContextMenuHandler(e, vdObj.index) }}
                                            onDoubleClick={(event) => onVDdoubleClick(true)}
                                            onBlur={(event) => props.newVDO(event, "VDO")}
                                            data-index={vdObj.index}
                                            onChange={(event) => props.onSelectedObjective(event, "VD")}
                                            value={vdObj.value}
                                        />

                                    </ContextMenuTrigger>
                                    <div style={{display: !disableVd && vdObj.value !== "" ? 'block' : 'none'}}>
                                    <datalist id="valueDriver" style={{ height: '20px' }}>
                                        {
                                            valueDriversList && valueDriversList.map((objective) => (
                                                <option value={objective} />
                                            ))}
                                    </datalist>
                                    </div>
                                </div> :
                                <Draggable
                                    axis='y'
                                    defaultPosition={{ x: 0, y: 0 }}
                                    position={null}
                                    grid={[50, 10]}
                                    scale={1}
                                    onStart={handleVDStart}
                                    // onDrag={handleDrag}
                                    onStop={handleVDStop}
                                >
                                    <div className={enableVDDrag ? "draggable" : ''}
                                        style={{ zIndex: vdObj.zIndex, position: 'relative' }}
                                        id={vdObj.vdoIndex}>

                                        {enableVDDrag ?
                                            <span
                                                className={`customLabel ${'value_driver_identifier' + vdObj.index}`}
                                                data-type="value_driver_identifier"
                                                data-class={'value_driver_identifier' + vdObj.index}
                                                onDoubleClick={(event) => onVDdoubleClick()}
                                                onContextMenu={(e) => { showContextMenuHandler(e, vdObj.index) }}
                                                // onClick={(e) => onKPIClick(e)}
                                                data-index={vdObj.index}
                                                id={vdoIndex}
                                                style={{ backgroundColor: '#008bbf', color: '#ffffff' }}>{vdObj.value}</span> :

                                            <ContextMenuTrigger id="value_driver_identifier">

                                                <span
                                                    className={`customLabel ${'value_driver_identifier' + vdObj.index}`}
                                                    data-type="value_driver_identifier"
                                                    data-class={'value_driver_identifier' + vdObj.index}
                                                    onDoubleClick={(event) => onVDdoubleClick()}
                                                    onContextMenu={(e) => { showContextMenuHandler(e, vdObj.index) }}
                                                    data-index={vdObj.index}
                                                    style={{ backgroundColor: '#008bbf', color: '#ffffff' }}>{vdObj.value}</span>

                                            </ContextMenuTrigger>
                                        }
                                    </div>
                                </Draggable>

                            }
                        </div>
                    ))}
                </div>

                <div className="kpi-obj-stack">
                    {operationalKPIs && operationalKPIs.map((kpi, index) => (
                        <div key={index} className="objective-encloser">
                            {!kpi.isLabel ?
                                <div style={{}}>
                                    <ContextMenuTrigger id="operational_identifier">

                                        <input list="operationalKPI" name="operationalKPI"
                                            className={`kpiObjectiveList ${'operational_identifier' + index}`}
                                            id={index}
                                            autoComplete="off"
                                            maxLength="100"
                                            onClick={(event) => { props.updatedDisableDataListFlags(event, false); setDeleteFlag(false) }}
                                            onContextMenu={(e) => { showContextMenuHandler(e, index) }}
                                            onChange={(event) => props.onSelectedObjective(event, "KPI")}
                                            onBlur={(event) => deleteFlag ? '' : props.onNewKPI(event, "test")}
                                            onKeyPress={(event) => event.keyCode === 9 ? props.onNewKPI(event, "test") : ''}
                                            onDoubleClick={(event) => onKPIdoubleClick(true)}
                                            data-type="operational_identifier"
                                            data-class={'operational_identifier' + index}
                                            data-index={index}
                                            value={kpi.name}
                                            style={{
                                                backgroundColor: kpi.color === 'red' ? '#dc1414eb' :
                                                    kpi.color === 'grey' ? '#909090' : '#006abf'
                                            }}
                                        />

                                    </ContextMenuTrigger>
                                    <div style={{display: !disableKPI ? 'block' : 'none'}}>
                                    <datalist id="operationalKPI" size='10' style={{ height: '20px' }}>
                                        {
                                            operationalKPIsList && operationalKPIsList.map((objective) => (
                                                <option value={objective.okpi} id={objective.kpi_id} />      //okpi change
                                            ))}
                                    </datalist>
                                    </div>
                                </div> :
                                <Draggable
                                    axis='y'
                                    defaultPosition={{ x: 0, y: 0 }}
                                    position={null}
                                    grid={[50, 10]}
                                    scale={1}
                                    onStart={handleKPIStart}
                                    // onDrag={handleDrag}
                                    onStop={handleKPIStop}
                                >
                                    <div
                                        className={enableDrag ? "draggable" : ''}
                                        style={{ zIndex: kpi.zIndex, position: 'relative' }}
                                        id={kpi.index}

                                    >
                                        {
                                            enableDrag ?
                                                <span
                                                    className={`customLabel ${'operational_identifier' + kpi.index}`}
                                                    data-type="operational_identifier"
                                                    data-class={'operational_identifier' + kpi.index}
                                                    onDoubleClick={(event) => onKPIdoubleClick()}
                                                    onContextMenu={(e) => { showContextMenuHandler(e, kpi.index) }}
                                                    // onClick={(e) => onKPIClick(e)}
                                                    data-index={kpi.index}
                                                    id={index}
                                                    style={{
                                                        backgroundColor: kpi.color === 'red' ? '#dc1414eb' :
                                                            kpi.color === 'grey' ? '#909090' : '#006abf', color: '#ffffff'
                                                    }}>

                                                    {kpi.name}
                                                </span> :
                                                <ContextMenuTrigger id="operational_identifier">

                                                    <span
                                                        className={`customLabel ${'operational_identifier' + kpi.index}`}
                                                        data-type="operational_identifier"
                                                        data-class={'operational_identifier' + kpi.index}
                                                        onDoubleClick={(event) => onKPIdoubleClick()}
                                                        onContextMenu={(e) => { showContextMenuHandler(e, kpi.index) }}
                                                        // onClick={(e) => onKPIClick(e)}
                                                        data-index={kpi.index}
                                                        id={index}
                                                        style={{
                                                            backgroundColor: kpi.color === 'red' ? '#dc1414eb' :
                                                                kpi.color === 'grey' ? '#909090' : '#006abf', color: '#ffffff'
                                                        }}>
                                                        {kpi.name}
                                                    </span>

                                                </ContextMenuTrigger>
                                        }
                                    </div>
                                </Draggable>
                            }
                        </div>
                    ))} </div>
                <div>
                    <KPIModal
                        visible={props.displayKPIModal}
                        modalCloseHandler={modalCloseHandler}
                        saveKPIHandler={saveKPIHandler}
                        kpiDetails={props.kpiDetails}
                        //kpiChange={props.kpiChange}
                        kpiIndex={props.kpiIndex}
                    />
                </div>
                <div className="context-menu-class">
                    {
                        showMenu &&
                        <ContextMenu id={showMenu} className="contextMenu" onHide={resetMenuHandler}>
                            {
                                <Fragment>
                                    <div id="options_div">{
                                        menuOption.map((option) => (
                                            <MenuItem key={option.index} data={{ foo: 'bar' }} onClick={props.handleClick} preventClose={true}>
                                                <input type="checkbox" id={option.index} prevous-index="0"
                                                    onChange={(e) => { optionHandler(e, option) }} data-type={showMenu}
                                                    checked={option.checked} disabled={option.checked && className !== option.parentObj} /> {" "}
                                                <label className="form-check-label" for="exampleCheck1" style={{ color: '#ffffff' }}>
                                                    {showMenu === 'value_driver_identifier' ? option.name : option.value}</label>
                                            </MenuItem>
                                        ))}
                                    </div>
                                    {/* <MenuItem>
                                <div style={{ cursor: 'pointer', marginTop: '3%' }} onClick={(event) => { editObjective(event) }}>
                                    <i className="fa fa-edit"></i><span className="p1-1"> Edit</span>
                                </div>
                            </MenuItem> */}
                                    <MenuItem className="del-edit-div">
                                        <div style={{ cursor: 'pointer' }} onClick={(event) => { deleteObjective(event) }}>
                                            <i className="fa fa-trash"></i><span className="pl-2">Delete</span>
                                        </div>
                                        <div style={{ cursor: 'pointer', marginTop: '3%' }} onClick={(event) => { editObjective(event) }}>
                                            <i className="fa fa-edit"></i><span className="p1-2"> Edit</span>
                                        </div>
                                    </MenuItem>

                                </Fragment>}
                        </ContextMenu>
                    }
                </div>
                <div>{totalSelectedLinesArray &&
                    totalSelectedLinesArray.map((item, index) => {
                        return <SteppedLineTo from={item.sourceClass.indexOf(' ') >= 0 ? item.sourceClass.split(' ')[1] : item.sourceClass} to={item.destClass.indexOf(' ') >= 0 ? item.destClass.split(' ')[1] : item.destClass} orientation="h"
                            borderColor="rgb(255, 255, 255)"
                            style={{ left: '484px' }}
                            borderWidth={2}
                            fromAnchor="right"
                            toAnchor="left" />
                    })
                }
                </div>
                {/* custom confirm modal */}
                <CustomConfirmModal
                    ownClassName={'vdt-kpi-delete'}
                    isModalVisible={deleteKPIModalVisible}
                    modalTitle={deleteKPIModalTitle}
                    closeConfirmModal={closeDeleteKPIConfirmModal}
                />
                <CustomConfirmModal
                    ownClassName={'vdt-obj-delete'}
                    isModalVisible={deleteObjModalVisible}
                    modalTitle={deleteObjModalTitle}
                    closeConfirmModal={closeDeleteObjConfirmModal}
                />
            </div>


        </Fragment >)
}
export default CustomVDTTree;