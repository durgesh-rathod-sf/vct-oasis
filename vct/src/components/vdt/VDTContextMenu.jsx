//import { property } from 'lodash';
import React, { Component, Fragment, useState } from 'react';
import { connectMenu, ContextMenu, MenuItem } from 'react-contextmenu';
import CustomConfirmModal from '../CustomConfirmModal/CustomConfirmModal';
var SessionStorage = require('store/storages/sessionStorage');
const VDTContextMenu = (props) => {
  const { id, trigger, foType } = props;
  // const handleItemClick = trigger ? trigger.onItemClick : null;
  const [confirm, setConfirm] = useState({ showModal: false, title: '', handler: null });
  const isNew = props.trigger && props.trigger.target.localName === "input"
  const valuePresent = props.trigger && (props.trigger.node.label !== undefined && props.trigger.node.label !== "")
  const deleteNode = function (node) {
    setConfirm({
      showModal: true, title: 'Are you sure you want to delete?', handler: (ok) => {
        if (ok) props.onDelete(props.trigger.node)
        setConfirm({ showModal: false, title: '', handler: null });
      }
    })
  }


  return (
    <Fragment>

      <ContextMenu id={id} className="contextMenu" onHide={() => { }}>
        {(props.trigger && props.trigger.type !== 'KPI' && props.trigger.node.id !== 'Branch_1') && <MenuItem className="del-edit-div" >
          <div style={{ cursor: valuePresent ? 'pointer' : 'default', color: valuePresent ? "#ffffff" : "grey" }} onClick={(ev) => valuePresent ? props.onAdd(props.trigger) : () => {}}>
            <i className="fa fa-plus"></i><span className="pl-2">Add Child</span>
          </div>
        </ MenuItem>}
        {(props.trigger && props.trigger.node.id == 'Branch_1' && (SessionStorage.read("VDTmode") === "FINANCIAL" || SessionStorage.read("VDTmode") ==="ALL")) && <MenuItem className="del-edit-div" >
          <div style={{ cursor: valuePresent ? 'pointer' : 'default', color: valuePresent ? "#ffffff" : "grey" }} onClick={(ev) => valuePresent ? props.onAdd(props.trigger,"Financial") : () => {}}>
            <i className="fa fa-plus"></i><span className="pl-2">Add Child (Financial)</span>
          </div>
        </ MenuItem>}
        {(props.trigger && props.trigger.node.id == 'Branch_1' && (SessionStorage.read("VDTmode") === "NON_FINANCIAL" || SessionStorage.read("VDTmode") ==="ALL")) && <MenuItem className="del-edit-div" >
          <div style={{ cursor: valuePresent ? 'pointer' : 'default', color: valuePresent ? "#ffffff" : "grey" }} onClick={(ev) => valuePresent ? props.onAdd(props.trigger,"Non-Financial") : () => {}}>
            <i className="fa fa-plus"></i><span className="pl-2">Add Child (Non-Financial)</span>
          </div>
        </ MenuItem>}
        {props.trigger && props.trigger.node.id !== 'Branch_1' && <MenuItem className="del-edit-div" >
          <div style={{ cursor: 'pointer' }} onClick={(event) => { deleteNode(props.trigger) }}>
            <i className="fa fa-trash"></i><span className="pl-2">Delete</span>
          </div>
        </ MenuItem>}
        <MenuItem>
          <div style={{ cursor: isNew ? 'default' : 'pointer', marginTop: '3%', color: isNew ? "grey" : "#ffffff" }} onClick={isNew ? () => {} : (event) => { props.onEdit(props.trigger) }}>
            <i className="fa fa-edit"></i><span className="p1-2"> Edit</span>
          </div>
        </MenuItem >
      </ContextMenu>


      <CustomConfirmModal
        ownClassName={'vdt-obj-delete'}
        isModalVisible={confirm.showModal}
        modalTitle={confirm.title}
        closeConfirmModal={confirm.handler}
      />
    </Fragment>
  );
};
export default connectMenu('vdtNodeContextMenu')(VDTContextMenu);