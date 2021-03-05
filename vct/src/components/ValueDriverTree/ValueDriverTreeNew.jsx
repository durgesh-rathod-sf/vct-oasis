import React, { Component } from 'react';
import './ValueDriverTree.css';
import VisualVDTTable from '../../containers/VisualVDTTable/VisualVDTTable';

import VDTBranch from '../vdt/VDTBranch';
import VDTBranchStatic from '../vdtDBC/VDTBranchStatic';
import { inject, observer } from 'mobx-react';
import VDTContextMenu from '../vdt/VDTContextMenu';
import KPIModal from '../KPIModal/KPIModal';
import VDTBranchModal from '../vdt/VDTBranchModal';
import Confirmation from '../core/notification/Confirmation'
import { toJS } from 'mobx';
var SessionStorage = require('store/storages/sessionStorage');

@inject('reviewValueDriverStore')
@observer
class ValueDriverTreeNew extends Component {


  constructor(props, c) {
    super(props, c);
    this.state = {
      editKPI: null,
      draggingObject: null,
      deprecatedNodes: []
    }
    this.obsoleteNodes = []
  }

  onMove(from, to) {
    this.props.reviewValueDriverStore.moveItem(from, to);

  }
  async onAssign(node, to) {
    if (await Confirmation('Are you sure to reassign the node ?')) {
      this.props.reviewValueDriverStore.assignItem(node, to);
    }

  }
  onDrag(draggingObject) {
    this.setState({ draggingObject });
  }

  onAdd = (trigger, foType) => {
    if (trigger.node.level === 3) //Value Driver
      this.setState({ editNode: this.props.reviewValueDriverStore.createKPI(trigger.node, {}) });
    else if (foType == "Non-Financial")
      this.setState({ editNode: this.props.reviewValueDriverStore.createBranch(trigger.node, {}, foType) })
    else
      this.setState({ editNode: this.props.reviewValueDriverStore.createBranch(trigger.node, {}) });
    // this.props.refresh()
  }

  async onSetName(name, node) {
    this.setState({
      editKPI: await this.props.reviewValueDriverStore.setNameToNewItem(name, node),
      editNode: null,
      editBranch: await this.props.reviewValueDriverStore.setNameToNewNode(name, node)
    });
  }

  async onKpiNodeClick(id, node) {

    // below if condition should be true only for kpi benefits and benefit actuals
    if (this.props.currentTabName && this.props.currentTabName === 'dbcBenefits') {

      this.props.kpiClickHandler(id);
      // need to call its props method for changing the kpi color
    }

  }
  onDelete(node) {
    this.props.reviewValueDriverStore.deleteItem(node);
    this.setState({
      editBranch: false,
      editKPI: false,
    });
  }
  onEdit(trigger) {

    if (trigger.type === 'KPI') {
      this.setState({ editKPI: trigger.node });
    } else {
      this.setState({ editBranch: trigger.node });
    }


  }
  saveKPIHandler(node) {
    if (node) {
      this.props.reviewValueDriverStore.updateItem(node);
    }
    this.setState({ editKPI: null });
  }



  saveBranchHandler(node) {
    if (node) {
      this.props.reviewValueDriverStore.updateItem(node);
    }
    this.setState({ editBranch: null, deprecatedNodes: [...this.obsoleteNodes] });
  }

  deprecatedNodeId = (id) => {
    !this.obsoleteNodes.includes(id) && this.obsoleteNodes.push(id)
  }

  filterNodeId = (id) => this.obsoleteNodes = this.obsoleteNodes.filter(nodeId => nodeId !== id)

  render() {
    const {

      reviewValueDriverStore, isGenerateVDTBtnClicked, isBusinessCase, kpiId, currentTabName

    } = this.props;

    const { operationalKpIs, dataTree, oldKPIValues, catDropDown, filterCategories } = reviewValueDriverStore;

    return (
      <div className="row visual-vdt-wrapper" style={{ marginTop: '20px' }}>
        <div id="visual_vdt_tree" className={`vdt-tree-wrapper ${currentTabName === 'dbcBenefits' ? 'dbc-benefits-tab' : ''}`}>
          { isBusinessCase ?
            reviewValueDriverStore.branchTree.length > 0 ?
            <VDTBranchStatic level={1} branchTree={toJS(dataTree)} onMove={(f, t) => this.onMove(f, t)} isGenerateVDTBtnClicked={isGenerateVDTBtnClicked}
              onDrag={(t) => this.onDrag(t)} onAssign={(i, t) => this.onAssign(i, t)} draggingObject={this.state.draggingObject}
              vdtValues={this.props.reviewValueDriverStore.vdtValues} editNode={this.state.editNode} onSetName={(t, n) => this.onSetName(t, n)}
              isBusinessCase={isBusinessCase} onKpiNodeClick={(t, n) => this.onKpiNodeClick(t, n)} selectedKpiId={kpiId}
            ></VDTBranchStatic> :
            <div className="row justify-content-center" style={{ height: '50px' }}>
              <i className="fa fa-spinner fa-spin" style={{ fontSize: '18px', color: '#ffffff', height: "min-content" }}></i>
            </div>
            :
            <VDTBranch level={1} branchTree={toJS(dataTree)} onMove={(f, t) => this.onMove(f, t)} isGenerateVDTBtnClicked={isGenerateVDTBtnClicked}
              onDrag={(t) => this.onDrag(t)} onAssign={(i, t) => this.onAssign(i, t)} draggingObject={this.state.draggingObject}
              vdtValues={this.props.reviewValueDriverStore.vdtValues} editNode={this.state.editNode} onSetName={(t, n) => this.onSetName(t, n)}
              deprecatedNodes={this.state.deprecatedNodes}
            ></VDTBranch>
          }
        </div>
        <div className="vdt-table-wrapper">
          {isBusinessCase ? "" :
            <VisualVDTTable operationalKpis={operationalKpIs} oldKPIValues={oldKPIValues} />
          }
        </div>

        {(SessionStorage.read("demoUser") === "true") || (SessionStorage.read("isMaster") === "Y")
          || (SessionStorage.read("accessType") === "Read") || isGenerateVDTBtnClicked || isBusinessCase ? '' :
          <VDTContextMenu onAdd={this.onAdd}
            onDelete={(node) => this.onDelete(node)}
            onEdit={(node) => this.onEdit(node)}
          ></VDTContextMenu>}

        {isBusinessCase ? "" : this.state.editKPI && <KPIModal
          visible={true}
          modalCloseHandler={() => this.setState({ editKPI: false })}
          saveKPIHandler={(node) => this.saveKPIHandler(node)}
          kpiDetails={this.state.editKPI}
        ></KPIModal>}

        {isBusinessCase ? "" : this.state.editBranch && <VDTBranchModal
          vdtValues={this.props.reviewValueDriverStore.vdtValues}
          visible={true}
          closeHandler={() => this.setState({ editBranch: false })}
          saveHandler={(node) => this.saveBranchHandler(node)}
          branchDetails={this.state.editBranch}
          catDropDown={catDropDown}
          filterCategories={filterCategories}
          deprecatedNodeId={this.deprecatedNodeId}
          filterNodeId={this.filterNodeId}
        ></VDTBranchModal>}
      </div>
    );
  }
}

export default ValueDriverTreeNew;