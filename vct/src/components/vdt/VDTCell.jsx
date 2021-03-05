import React, { Fragment, useState } from 'react';
import ReactTooltip from 'react-tooltip';
import { useDrag, useDrop } from 'react-dnd';
import classNames from 'classnames';
import './VDTCell.css';
import { ContextMenuTrigger } from 'react-contextmenu';
var SessionStorage = require('store/storages/sessionStorage');

function VDTCell({ page, valueKPI, editNode, parent, onClick, onMove, onDrag, onSetName, draggingObject, vdtValues, isGenerateVDTBtnClicked}) {
  let nodeRef;
  const forbidDrag = (SessionStorage.read("demoUser") ==="true") || (SessionStorage.read("isMaster") === "Y") || (SessionStorage.read("accessType") === "Read") || isGenerateVDTBtnClicked ? false : true;
  const [kpiLabel, setKpiLabel] = useState('');
  const editable = editNode && editNode.id === valueKPI.id;
  const newKPI = (editNode && editNode.id === valueKPI.id && editNode.creating === true) || valueKPI.opKpi === "";
  const [{ isDragging }, drag] = useDrag({
    item: { type: 'KPI', id: valueKPI.id, value: valueKPI },
    begin: () => {
      ReactTooltip.hide(nodeRef);
      onDrag({ type: 'KPI', id: valueKPI.id, value: valueKPI });
    },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
    canDrag: forbidDrag,
    end: () => {
      onDrag(null);
    },
  });
  const canDrop = (item) => (item != null && valueKPI.id !== item.id && (valueKPI.objType === item.value.objType && valueKPI.kpiType === item.value.kpiType));
  const [, drop] = useDrop({
    accept: 'KPI',
    canDrop,
    drop(item) {
      if (canDrop(item)) {
      
        onMove(item, valueKPI);
      }
    }
  });
  const mandatoryCheck = (valueKPI) => {
    if (valueKPI.baseline === null || (valueKPI.baseline && (valueKPI.baseline.actualValue === "" || valueKPI.baseline.actualValue === null ))  ||
    valueKPI.target === null || (valueKPI.target && (valueKPI.target.actualValue === "" || valueKPI.target.actualValue === null)) ||
    valueKPI.targetAchieved === null || valueKPI.targetAchieved === "Select Year"
   || valueKPI.targetAchieved === "" || valueKPI.targetAchieved === undefined) {
      return false
    }
    else {
      return true
    }
  }
  const getKpiUniqueId = function (valueKPI) {
    // if(branchTree.kpiId=== null){
      for(let i=0 ; i<parent.children.length ; i++){
        if(valueKPI.id === parent.children[i].id){
          return `${parent.label}_child-${i}`
        }
       } 
      
    // }
    // else{
    //   return `kpi_${valueKPI.order}`
    // }
  
  }
  const renderNewKPI = function () {
    return (
      <Fragment>
        <input type="text" list="kpiList" name="kpi"
          autoComplete="off"
          maxLength="100"
          onChange={(event) => {
            setKpiLabel(event.target.value)
          }}
          value={kpiLabel}
          onBlur={(event) => {
            //setKPINAME
            onSetName(event.target.value, valueKPI)
          }
          }
        />
        {  (SessionStorage.read("userType") === "EU" && SessionStorage.read("accessType") === "Write") ?"" : <datalist id="kpiList" style={{ maxHeight: '20px', overflow: 'scroll' }}>
          {vdtValues.Kpi[valueKPI.objType].map((opt) => (<option key={opt.kpi_id} value={opt.okpi} />))}
        </datalist>}

      </Fragment>

    )
  }


  const klass = (parent!== undefined && parent.children.length === 1) ? 'entry sole' : 'entry';
  const opacity = isDragging ? .2 : 1;
  const droppable = canDrop(draggingObject);
  const isFinancialClass  = (valueKPI) => {
    if (valueKPI.objType!== null && valueKPI.objType === "FINANCIAL") {
      return true;
    } else {
      return false;
    }
  }

  return (<div style={{ opacity }} className={klass}>
    <ContextMenuTrigger id="vdtNodeContextMenu" holdToDisplay={-1} collect={() => { return { type: 'KPI', node: valueKPI } }}>
      <div className={
        // mandatoryCheck(valueKPI) ? classNames({ 'label vdt-node vdt-kpi d-table ': true, 'droppable': droppable }) : 
        classNames({ 'label vdt-node vdt-kpi': true, 'droppable': droppable,
        // 'vdt-kpi': isFinancialClass(valueKPI), 'vdt-kpi-non-fin': !isFinancialClass(valueKPI),
        "vdt-kpi-grey":(valueKPI.okpiType && valueKPI.okpiType!== null && valueKPI.okpiType === "FINANCIAL" && mandatoryCheck(valueKPI) && valueKPI.kpiBusType === "WITHOUT_BUS_CASE" && valueKPI.objType === "FINANCIAL") ,
        "vdt-kpi-red":( (mandatoryCheck(valueKPI) ?false:true) ||( page==='projectOverviewDashboard' && !valueKPI.kpiOnTarget) || ((valueKPI.objType === "NON_FINANCIAL") &&(valueKPI.okpiType === "FINANCIAL"))|| ((valueKPI.okpiType === "NON_FINANCIAL") && (valueKPI.objType === "FINANCIAL"))),
        "vdt-kpi-purple": (valueKPI.okpiType && valueKPI.okpiType!== null && valueKPI.objType === "NON_FINANCIAL" && valueKPI.kpiBusType === "WITHOUT_BUS_CASE" && valueKPI.okpiType === "NON_FINANCIAL" && mandatoryCheck(valueKPI)),
		    "vdt-kpi-green":( page==='projectOverviewDashboard' && valueKPI.kpiOnTarget),
        "vdt-kpi-cursor":(!forbidDrag || page==='projectOverviewDashboard'),
       
       })}
       id={getKpiUniqueId(valueKPI)}
       style={{ paddingTop:"12px" }}
        ref={node => drag(drop(nodeRef = node))}
        data-type="dark" data-tip=""
        data-for={`${valueKPI.id}_${valueKPI.opKpi}`}
        //onClick={(e) => onClick(e)}

      >
        {(newKPI) ? renderNewKPI()
         : (valueKPI.opKpi !== undefined) ?<span className=""> {valueKPI.opKpi}</span>:<span className=""> {valueKPI.kpiName}</span>
        }
      </div>
    </ContextMenuTrigger >

    { !editable && valueKPI.opKpi !== undefined &&  <ReactTooltip className="kpi-tooltip-align" id={`${valueKPI.id}_${valueKPI.opKpi}`}>
      <span>{valueKPI.opKpiDesc}</span><br />
      <span className="kpi-formula-tooltip">KPI Formula:</span> {valueKPI.opKpiFormula} <br />
      <span className="kpi-type-tooltip">KPI Type: <span className="kpi-type-text-tooltip">{valueKPI.okpiType === 'NON_FINANCIAL' ? 'Non-Financial' : valueKPI.okpiType === 'FINANCIAL' ? 'Financial' : ''}</span></span>
    </ReactTooltip>}
  </div>);

}
//}

export default VDTCell;