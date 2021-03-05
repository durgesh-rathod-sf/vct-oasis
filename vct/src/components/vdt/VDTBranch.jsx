import React, { Fragment, useState } from 'react';
import { ContextMenuTrigger } from 'react-contextmenu';
import { useDrag, useDrop } from 'react-dnd';
import classNames from 'classnames';
import VDTCell from './VDTCell';
import './VDTBranch.css';
var SessionStorage = require('store/storages/sessionStorage');

function VDTBranch({ page, branchTree, level, parent, onMove, onDrag, onAssign, draggingObject, vdtValues, editNode, onSetName, isGenerateVDTBtnClicked, deprecatedNodes }) {
  const forbidDrag = (SessionStorage.read("demoUser") === "true") || (SessionStorage.read("isMaster") === "Y") || (SessionStorage.read("accessType") === "Read") || isGenerateVDTBtnClicked ? false : true;
  const [label, setLabel] = useState('');
  const isNew = editNode && editNode.id === branchTree.id && editNode.creating === true;
  const isNewTree = branchTree && (!branchTree.label || branchTree.label === '')

  const [{ isDragging }, drag] = useDrag({
    item: { type: 'KPIBranch', id: branchTree.id, value: branchTree, parent },
    begin: (monitor) => {

      onDrag({ type: 'KPIBranch', id: branchTree.id, value: branchTree, parent });
    },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
    canDrag: forbidDrag,
    end: () => {
      onDrag(null);
    },
  });
  const getUniqueId = function (valueKPI) {
    if (valueKPI.type !== "Strategic Objective") {
      for (let i = 0; i < parent.children.length; i++) {
        if (valueKPI.id === parent.children[i].id) {
          return `${parent.label}_child-${i}`
        }
      }
    }
    else {
      return `so-element`
    }
  }
  const canDrop = (item) => {
    return (draggingObject && branchTree.id !== item.id && (
      (item.type === 'KPIBranch' && branchTree.id !== item.parent.id && branchTree.level === (item.value.level - 1) && branchTree.category[0].objType === item.value.category[0].objType) ||
      (item.type === 'KPIBranch' && parent != null && parent.id === item.parent.id && parent.category[0].objType === item.parent.category[0].objType) ||
      (item.type === 'KPI' && branchTree.level === 3 && (branchTree.category[0].objType === item.value.kpiType))))
  }
  const [, drop] = useDrop({
    accept: ['KPI', 'KPIBranch'],
    canDrop,
    drop(item, monitor) {
      if (item.type === 'KPIBranch') {
        if (item.parent.id === parent.id) { //Same parent, so we are moving a branch
        
          onMove(item, branchTree);
        } else {
          //We are assigning a branch
          onAssign(item.value, branchTree);
        }

      } if (item.type === 'KPI') {
        onAssign(item.value, branchTree);
      }
    }
  });


  const renderNewItem = function () {
    return (
      <Fragment>
        <input type="text" list={branchTree.level === 0 ? "so_obj_list" :
          branchTree.level === 2 ? `${branchTree.level}_${branchTree.category[0].objType}_${branchTree.category[0].objCategory}_list_` : `${branchTree.level}_${branchTree.category[0].objType}_list_`} name="kpi"
          autoComplete="off"
          maxLength="100"
          onChange={(event) => {
            setLabel(event.target.value)
          }}
          value={label}
          onBlur={(event) => {
            //setNAME
            onSetName(event.target.value, branchTree)
          }
          }
        />

        {branchTree && branchTree.level > 0 && branchTree.level != 2 &&
          ((SessionStorage.read("userType") === "EU" && SessionStorage.read("accessType") === "Write") ? "" : <datalist id={`${branchTree.level}_${branchTree.category[0].objType}_list_`} style={{ maxHeight: '20px', overflow: 'scroll' }}>
            {vdtValues[branchTree.type][branchTree.category[0].objType].map((opt) => (

              <option key={opt.genericId} value={opt.genericName} />
            ))
            }
          </datalist>)
        }
        {branchTree && branchTree.level == 2 &&
          ((SessionStorage.read("userType") === "EU" && SessionStorage.read("accessType") === "Write") ? "" : <datalist id={`${branchTree.level}_${branchTree.category[0].objType}_${branchTree.category[0].objCategory}_list_`} style={{ maxHeight: '20px', overflow: 'scroll' }}>
            {vdtValues[branchTree.type][branchTree.category[0].objType][branchTree.category[0].objCategory].map((opt) => (

              <option key={opt.genericId} value={opt.genericName} />
            ))
            }
          </datalist>)
        }
        {branchTree && branchTree.level == 0 &&
          ((SessionStorage.read("userType") === "EU" && SessionStorage.read("accessType") === "Write") ? "" : <datalist id="so_obj_list" style={{ maxHeight: '20px', overflow: 'scroll' }}>
            {vdtValues[branchTree.type].map((opt) => (<option key={opt.genericId} value={opt.genericName} />))}
          </datalist>)
        }


      </Fragment>

    )
  }


  const opacity = isDragging ? .2 : 1;
  const droppable = canDrop(draggingObject)
  let klass = '';
  if (parent != null) {
    klass = (parent.children.length === 1) ? 'entry sole' : 'entry';
  }

  const isFinancialClass = (branchTree) => {
    if (branchTree.level > 0 && branchTree.category[0].objType === 'FINANCIAL') {
      return true;
    } else {
      return false;
    }
  }
  return (
    <Fragment>
      {

        (branchTree.children === undefined) ?
          (page === 'projectOverviewDashboard') ?
            <VDTCell page={page} valueKPI={branchTree} parent={parent}
              vdtValues={vdtValues}
              editNode={editNode} onSetName={onSetName}
            ></VDTCell> : <VDTCell page={page} valueKPI={branchTree} parent={parent}
              onMove={onMove} onClick={() => { }} onDrag={onDrag} draggingObject={draggingObject} vdtValues={vdtValues}
              editNode={editNode} onSetName={onSetName} isGenerateVDTBtnClicked={isGenerateVDTBtnClicked}
            ></VDTCell>
          :
          <div id={(parent == null) ? 'wrapper' : ''} key={`branch${branchTree.id}`} className={klass} onContextMenu={() => false}>
            {<ContextMenuTrigger id="vdtNodeContextMenu" holdToDisplay={-1} collect={() => { return { type: 'Branch', node: branchTree } }}>
              <span ref={node => drag(drop(node))} id={getUniqueId(branchTree)}
                className={classNames({ 'isFin': isFinancialClass(branchTree), 'isNonFin': !isFinancialClass(branchTree), 'vdt-kpi-red': deprecatedNodes && deprecatedNodes.includes(branchTree.id), 'label vdt-node': true, 'droppable': droppable, "ordCursor": (page === 'projectOverviewDashboard') })} style={{ ...opacity, paddingTop: "12px" }}>
                {
                  (isNew || isNewTree) ? renderNewItem()
                    :
                    (<span className={`${(page === "projectOverviewDashboard") ? 'ordCursor' : ''} `}>{branchTree.label}</span>)
                }
              </span>
            </ContextMenuTrigger>}
            <div className={`${(branchTree.children.length > 0) ? 'branch lv' + level : ''} ${(!forbidDrag) ? 'branchCursor' : ''}`} onDrop={(e) => console.log('drop ' + e)}>
              {
                branchTree.children && branchTree.children.map((branchSubTree, index1) => (
                  <VDTBranch page={(page === 'projectOverviewDashboard') ? 'projectOverviewDashboard' : ''} key={branchSubTree.id} level={level + 1} branchTree={branchSubTree} parent={branchTree}
                    index={index1} onMove={onMove} onAssign={onAssign} onDrag={onDrag} draggingObject={draggingObject}
                    vdtValues={vdtValues} editNode={editNode} onSetName={onSetName} isGenerateVDTBtnClicked={isGenerateVDTBtnClicked}
                    deprecatedNodes={deprecatedNodes}
                  ></VDTBranch>
                ))
              }
            </div>
          </div>
      }

    </Fragment>
  )
}

export default VDTBranch;