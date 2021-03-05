import { observable, action, makeAutoObservable, toJS } from "mobx";
import * as _ from "lodash"
import React from 'react';
import '../components/ValueDriverTree/ValueDriverTree.css';

import ValueDriversDropdownHelper from '../helpers/ValueDriversDropdownHelper/ValueDriversDropdownHelper';
import CustomVDTHelper from "../helpers/CustomVDTHelper/CustomVDTHelper";
//import { ShowError, ShowSuccess } from "../components/core/notification/Notification";
import NotificationMessage from '../components/NotificationMessage/NotificationMessage';
import MultipleNotificationMessage from '../components/NotificationMessage/MultipleNotificationMessage';
import { toast } from 'react-toastify';

// import EditVDTStore from './EditVDTStore';
import CommonStore from './CommonStore/CommonStore';
var SessionStorage = require('store/storages/sessionStorage');

// Utility function
const traverse = (node, fn, compareFn) => {
  if (compareFn(node)) { //KPI Leave
    fn(node);
  } else {
    if (node.children != null)
      node.children.forEach(k => {
        traverse(k, fn, compareFn);
      });
  }
}


export default class ReviewValueDriverStore {

  @observable selectedKpi = false;
  @observable formatedKpis = [];
  @observable strategicObjectives = []
  @observable financialObjectives = []
  @observable businessObjectives = []
  @observable businessObjectiveKPIs = []
  @observable valueDrivers = []

  @observable sortedBusinessKpi = []
  @observable sortedOperationalKpi = []
  @observable unmatchedBusinessKpi = []
  @observable unMatchedBFO = [] // BFO - Business Financial Objectives
  @observable unMatchedBO = []
  @observable unMatchedBOKPIs = []
  @observable branchTree = []

  @observable unMatchedBusinessIndex = []
  @observable matchedBusinessIndex = []
  @observable data = []
  @observable operationKpiIds = []
  @observable updatedResponse = []
  @observable getFrequencyMessage = ''
  @observable selectedAccentureOffering = ''
  @observable selectedIndustry = ''
  @observable existingTransaction = ''
  @observable oldKPIValues
  @observable mode = "";
  @observable showVdtLoading = true;
  @observable isLoading = false;
  @observable loadingVDTMode = true;
  // DATA REQUIRED for new approach
  @observable dataTree = {}
  @observable dataTreeBackup = {}
  @observable operationalKpIs = []
  @observable vdtValues = {
    'Strategic Objective': [],
    'Business Objective': {
      'FINANCIAL': {
        'FINANCIAL': []
      },
      'NON_FINANCIAL': {
        'EXPERIENCE': [],
        'SUSTAINABILITY': [],
        'TALENT': [],
        'INCLUSION_AND_DIVERSITY': [],
        'CUSTOM': []
      }
    },
    'Financial Objective': {
      'FINANCIAL': [],
      'NON_FINANCIAL': []
    },
    'Value Driver': {
      'FINANCIAL': [],
      'NON_FINANCIAL': []
    },
    'Kpi': {
      'FINANCIAL': [],
      'NON_FINANCIAL': []
    }
  };
  @observable catDropDown = {};
  @observable stateUndoHistory = [];
  @observable resultEmptyCheck = {};
  stateRedoHistory = []
  catDropDown = []
  selectedNode = {};



  /**
   * ACTION. Changes the order of a node
   * @param {*} from Node to be moved
   * @param {*} to Node to be appended the node
   */
  @action
  moveItem(from, to) {
    console.log('moving ' + from + ' to ' + to);

    this.stateUndoHistory.push(_.cloneDeep(this.dataTree));

    const traverseMove = (node) => {
      const fromIx = _.findIndex(node.children, { id: from.id });
      const toIx = _.findIndex(node.children, { id: to.id });
      if (fromIx !== -1 && toIx !== -1) {
        var f = node.children.splice(fromIx, 1)[0];
        node.children.splice(toIx, 0, f);
      } else {
        if (node.children != null)
          node.children.forEach(k => {
            traverseMove(k);
          });
      }
    }
    // Move KPI
    traverseMove(this.dataTree);

    this.updateOpKpis()
  }

  @action
  setEmptyBranchTree = () => {
    this.branchTree = [];
  }



  /**
   * ACTION. Assigns a node into another parent
   * @param {*} node Node to be assigned
   * @param {*} to Parent node to be assigned
   */
  @action
  assignItem(node, to) {
    this.stateUndoHistory.push(_.cloneDeep(this.dataTree));

    // delete previous node
    this.deleteItem(node, false);

    // Add to node
    traverse(this.dataTree,
      (parent) => {
        if (parent.level === 3 && node.kpiType === parent.category[0].objType) {
          node.objType = node.kpiType;
        }
        parent.children.push(node)
      },
      (parent) => parent.id === to.id);

    this.updateOpKpis()
  }


  /**
   * Deletes a node
   * @param {*} nodetoDelete Node to be deleted
   * @param {boolean} addToHistory Add as an action in the undo history
   */
  @action
  deleteItem(nodetoDelete, addToHistory = true) {
    if (addToHistory)
      this.stateUndoHistory.push(_.cloneDeep(this.dataTree));

    const traverseDelete = (node, fn) => {
      const fromIx = _.findIndex(node.children, { id: nodetoDelete.id });
      if (fromIx !== -1) {
        node.children.splice(fromIx, 1);
      } else {
        if (node.children != null)
          node.children.forEach(k => {
            traverseDelete(k, fn);
          });
      }
    }
    traverseDelete(this.dataTree);
    this.updateOpKpis()
  }

  /**
   * Updates the value of a node
   * @param {*} nodetoUpdate Node to be updated
   */
  @action
  updateItem(nodetoUpdate) {
    this.stateUndoHistory.push(_.cloneDeep(this.dataTree));

    const traverseUpdate = (node, fn) => {
      if (node.id === nodetoUpdate.id) {
        _.merge(node, nodetoUpdate);
      } else {
        if (node.children != null)
          node.children.forEach(k => {
            traverseUpdate(k, fn);
          });
      }
    }

    traverseUpdate(this.dataTree);

    this.updateOpKpis()
  }

  /**
* ACTION. Creates a new Branch node
* @param {*} parentNode Parent to be added as new child
* @param {*} newItem Node to be created
* @param {*} foType
*/
  @action
  createBranch(parentNode, newItem, foType) {
    let objType = "";
    let objCategory = "";

    if (parentNode.type === "Strategic Objective") {
      objType = foType === undefined ? "FINANCIAL" : "NON_FINANCIAL"
    }
    else {
      objType = parentNode.category[0].objType;
      if (parentNode.level == 1)
        objCategory = parentNode.category[0].objCategory;
    }

    const newNode = {
      id: 'NEW' + new Date().getTime(), level: parentNode.level + 1, children: [], category: [{ objType: objType, objCategory: objCategory }],
      creating: true, ...newItem
    };

    this.createItem(parentNode, this.formatBranch(newNode, foType));
    return newNode;
  }
  /**
* ACTION. Creates a new KPI node
* @param {*} parentNode Parent to be added as new child
* @param {*} newItem Node to be created
*/
  @action
  createKPI(parentNode, newItem) {
    const newNode = {
      // index: KPIs.length,
      id: 'NEW' + new Date().getTime(), level: parentNode.level + 1, objType: parentNode.category[0].objType,
      kpiId: null, bicBenchmark: { actualValue: null }, baseline: { actualValue: null }, avgBenchmark: { actualValue: null }, target: { actualValue: null }, creating: true,
      ...newItem
    };
    this.createItem(parentNode, newNode)
    return newNode;
  }

  /**
 * ACTION. Creates a new node
 * @param {*} parentNode Parent to be added as new child
 * @param {*} newItem Node to be created
 */
  @action
  createItem(parentNode, newItem) {
    this.stateUndoHistory.push(_.cloneDeep(this.dataTree));
    traverse(this.dataTree, (node) => { node.children.push(newItem) }, (node) => node.id === parentNode.id);
    this.updateOpKpis();
  }

  /**
   * ACTION. Invoked when user set the label of a created KPI or branch
   * @param {*} nodeLabel Label to be assigned
   * @param {*} newItem Node
   */
  @action
  async setNameToNewItem(nodeLabel, newItem) {
    let treeItem = null; // Look for node in the tree
    traverse(this.dataTree, (node) => { treeItem = node }, (node) => node.id === newItem.id);
    delete treeItem.creating;// Remove creating flag

    if (newItem.level > 3) {
      treeItem.opKpi = nodeLabel;// Assign name
      //Look for the new name in the collection
      //let kpiLabel = newItem.objType === "FINANCIAL" ? this.vdtValues.Kpi.FINANCIAL : this.vdtValues.Kpi.NON_FINANCIAL;
      const kpi = _.find(this.vdtValues.Kpi[newItem.objType], { okpi: nodeLabel });

      if (kpi) {
        //Retrieve detail from backend
        const kpiobj = await this.fetchKPIInfo(kpi.kpi_id);
        // delete treeItem.kpiId;// Delete temporal ID
        delete treeItem.opKpi;
        treeItem = Object.assign(treeItem, this.formatKpi(kpiobj.data.resultObj, true));
        if (kpiobj.data.resultObj.okpiType === 'FINANCIAL') {
          return treeItem;
        }
        else if (kpiobj.data.resultObj.okpiType === 'NON_FINANCIAL') {
          treeItem.kpiType = "NON_FINANCIAL"
          treeItem.kpiBusType = 'WITHOUT_BUS_CASE'
        }
      } else {
        //New KPI, open dialog
        return treeItem;
      }
    } else { //it is a branch
      treeItem.label = nodeLabel;

    }
    this.updateOpKpis();
    return null;
  }

  @action
  async setNameToNewNode(nodeLabel, newItem) {
    let treeItem = null; // Look for node in the tree
    traverse(this.dataTree, (node) => { treeItem = node }, (node) => node.id === newItem.id);
    delete treeItem.creating;// Remove creating flag   

    if (newItem.level === 1 || newItem.level === 2) { // add || newItem.level === 2 condition for BO
      //it is FO or BO, check for the value is from dropdown list and open the popup if not
      treeItem.label = nodeLabel;
      //Look for the new name in the collection

      let selectedObjInfo = {};

      if (newItem.level === 1) {
        selectedObjInfo = _.find(this.vdtValues[newItem.type][newItem.category[0].objType], { genericName: nodeLabel });
      } else {
        selectedObjInfo = _.find(this.vdtValues[newItem.type][newItem.category[0].objType][newItem.category[0].objCategory], { genericName: nodeLabel });

      }

      if (selectedObjInfo) {
        treeItem.id = selectedObjInfo.genericId;
        treeItem['category'] = [{
          "objType": selectedObjInfo.objTypeName,
          "objCategory": selectedObjInfo.objCatName,
          "objIsCustomCategory": selectedObjInfo.objCatName === 'CUSTOM' ? 'Y' : 'N',
          "objCustomCatValue": selectedObjInfo.objCustomCatValue,
          "objSubCategory": selectedObjInfo.objSubCatName,
          "objIsCustomSubCategory": selectedObjInfo.objSubCatName === 'CUSTOM' ? 'Y' : 'N',
          "objCustomSubCatValue": selectedObjInfo.objCustomSubCatValue
        }]
        return null;
      } else {
        // new objective, open the edit popup
        return treeItem;
      }
    } else {
      return null;
    }
  }



  /**
   * Internal function.Extranct an array of KPIs from the tree for showing in the table
   */
  updateOpKpis() {
    //Update operational KPIs table
    const opKpis = []
    traverse(this.dataTree,
      (node) => {
        /*switch(node.level){
          case 1:
            node = children[0].children[0].children[0];
            break;
          case 2:
            node = children[0].children[0];
            break;
          case 3:
            node = children[0];
            break;
          default:
            break;
        }*/
        if (typeof node.bicBenchmark !== 'object' || node.bicBenchmark == null) {
          node.bicBenchmark = {
            'actualValue': Number(node.bicBenchmark),
            'formattedValue': 0
          }
        }
        if (typeof node.baseline !== 'object' || node.baseline == null) {
          node.baseline = {
            'actualValue': Number(node.baseline),
            'formattedValue': 0
          }
        }
        if (typeof node.avgBenchmark !== 'object' || node.avgBenchmark == null) {
          node.avgBenchmark = {
            'actualValue': Number(node.avgBenchmark),
            'formattedValue': 0
          }
        }
        if (typeof node.target !== 'object' || node.target == null) {
          node.target = {
            'actualValue': Number(node.target),
            'formattedValue': 0
          }
        }
        if (node.kpiType && node.kpiType !== "") {
          node['okpiType'] = node.kpiType
        }
        opKpis.push((node.opKpi /* && !node.creating*/) ? node : /*node.children && node.children.opKpi ? node.children[0] : */null)
      },
      (node) => node.opKpi != null || node.creating || (node.children && node.children.length === 0));
    this.operationalKpIs.replace(opKpis);
  }


  customizer = (objValue, srcValue) => {
    if (_.isArray(objValue)) {
      return objValue.replace(srcValue);
    }
  }

  /**
  * ACTION. Undo the last action
  */
  @action
  undo() {
    if (this.stateUndoHistory.length > 0) {
      this.stateRedoHistory.push(_.cloneDeep(toJS(this.dataTree)));

      const state = this.stateUndoHistory.pop();
      // this.stateRedoHistory.push(state);

      this.dataTree.children.replace(state.children);
      Object.assign(this.dataTree, state);
      this.updateOpKpis();
    }
  }

  /**
   * ACTION. Redo the last undone action
   */
  @action
  redo() {
    if (this.stateRedoHistory.length > 0) {
      this.stateUndoHistory.push(_.cloneDeep(toJS(this.dataTree)));
      const state = this.stateRedoHistory.pop();

      // this.stateUndoHistory.push(state);
      // this.dataTree.children.replace(state.children);
      Object.assign(this.dataTree, state);
      this.updateOpKpis();
    }
  }




  /**
   * Call backend for getting all possible values
   * @param {*} kpiId 
   */
  @action
  async fetchDropDownValues(payload) {
    const customVDTHelper = new CustomVDTHelper();
    return await customVDTHelper.fetchDropDownValues(payload)
      .then((response) => {
        // have to work on integration of this api
        this.assignValidObjList(response.data.resultObj);
        // Object.assign(this.vdtValues, response.data.resultObj);
        //this.handleResponse(response.data.resultObj)
        return response
      })
      .catch((e) => {
        console.log(e)
      })
  }

  @action
  assignValidObjList = (resultObj) => {
    this.vdtValues['Strategic Objective'] = this.filterOut('soId', resultObj['Strategic Objective'], 'so');
    this.vdtValues['Financial Objective'] = this.filterOutTypes('objTypeId', resultObj['Financial Objective'], 'fo');
    this.vdtValues['Business Objective'] = this.filterOutTypes('objTypeId', resultObj['Business Objective'], 'bo');
    this.vdtValues['Value Driver'] = this.filterOutTypes('objTypeId', resultObj['Value Driver'], 'vdt');
    this.vdtValues['Kpi'] = this.filterOutKPI('okpiType', resultObj['Kpi']);
  }

  filterOutTypes = (queryString, list, key) => {
    let finArr = [];
    let nonFinArr = [];
    var i;
    //let grouped_data=[];
    finArr = list.filter(function (v) {
      v['genericId'] = v[key + 'Id'];
      v['genericName'] = v[key + 'Name'];
      if (v[queryString] && v[queryString] !== '') {
        if (v['objTypeName'] === 'FINANCIAL') {
          return true;
        } else if (v['objTypeName'] === 'NON_FINANCIAL') {
          nonFinArr.push(v);
          return false;
        }
      } else {
        return false;
      }
    });
    if (key === 'bo') {

      let grouped_data_nfo = _.groupBy(nonFinArr, "objCatName");
      let grouped_data_fo = _.groupBy(finArr, "objCatName");
      return {
        'FINANCIAL': {
          'FINANCIAL': grouped_data_fo.FINANCIAL ? grouped_data_fo.FINANCIAL : []
        },
        'NON_FINANCIAL': {
          'EXPERIENCE': grouped_data_nfo.EXPERIENCE ? grouped_data_nfo.EXPERIENCE : [],
          'SUSTAINABILITY': grouped_data_nfo.SUSTAINABILITY ? grouped_data_nfo.SUSTAINABILITY : [],
          'TALENT': grouped_data_nfo.TALENT ? grouped_data_nfo.TALENT : [],
          'INCLUSION_AND_DIVERSITY': grouped_data_nfo.INCLUSION_AND_DIVERSITY ? grouped_data_nfo.INCLUSION_AND_DIVERSITY : [],
          'CUSTOM': []
        }
      }
    } else {
      return {
        'FINANCIAL': finArr ? finArr : [],
        'NON_FINANCIAL': nonFinArr ? nonFinArr : []
      }
    }

  }

  filterOut = (queryString, list, key) => {
    return list.filter(function (v) {
      v['genericId'] = v[key + 'Id'];
      v['genericName'] = v[key + 'Name'];
      return (v[queryString] && v[queryString] !== '');
    });
  }

  filterOutKPI = (queryString, list) => {
    let finArr = [];
    let nonFinArr = [];
    finArr = list.filter(function (v) {

      if (v[queryString] && v[queryString] !== '') {
        if (v['okpiType'] === 'FINANCIAL') {
          return true;
        } else if (v['okpiType'] === 'NON_FINANCIAL') {
          nonFinArr.push(v);
          return false;
        }
      } else {
        return false;
      }
    });
    return {
      'FINANCIAL': finArr ? finArr : [],
      'NON_FINANCIAL': nonFinArr ? nonFinArr : []
    }
  }



  /**
   * Call backend for getting kpi information
   * @param {*} kpiId 
   */
  fetchKPIInfo(kpiId) {
    const customVDTHelper = new CustomVDTHelper();
    const kpiID = kpiId.substr(4);
    // localStorage.setItem('tenantId', null);
    return customVDTHelper.fetchKpiInfo(kpiID)
      .then((response) => {
        // this.handleResponse(response.data.resultObj)
        return response
      })
      .catch((e) => {
        console.log(e)
      })
  }



  /**
   * Internal function.Adds properties to kpi node
   * @param {*} kpiNode KPI node
   */
  formatKpi(kpiNode, kpiNew) {
    //TO BE DONE: Move logic from component VDTTable to here
    if (kpiNew) {
      return Object.assign(kpiNode, { bicBenchmark: { actualValue: null }, baseline: { actualValue: null }, avgBenchmark: { actualValue: null }, target: { actualValue: null }, targetAchieved: null, kpiBusType: null });
    }
    else {
      return kpiNode;
    }
  }

  /**
   * Internal function.Adds properties to branch node
   * @param {*} branch Branch node
   */
  formatBranch(branch, foType) {
    // eslint-disable-next-line default-case
    switch (branch.level) {
      case 0: branch.type = 'Strategic Objective'; break;
      case 1: branch.type = 'Financial Objective'; break;
      case 2: branch.type = 'Business Objective'; break;
      case 3: branch.type = 'Value Driver'; break;
    }
    return branch;
  }





  /**
   * This function initializes the tree structure
   * @param {*} resultObj Array of data from backend
   */
  @action
  createTree(resultObj) {
    let id = 1; //Counter for setting an unique ID to nodes
    let objIsCustomCategory = ""
    let objIsCustomSubCategory = ""
    let objSoType = ""
    let objType = ""
    let objCategory = ""
    let objSubCategory = ""
    let objCustomCatValue = '';
    let objCustomSubCatValue = '';

    // Function for transforming the array of data from backend into a tree structure
    const traverseTree = (node, ix) => {
      if (node.length) { //KPI Leave
        return node.map(n => {
          objIsCustomCategory = n.objective.objIsCustomCategory
          objIsCustomSubCategory = n.objective.objIsCustomSubCategory
          objSoType = n.objective.objSoType
          objType = n.objective.objType
          objCategory = n.objective.objCategory
          objSubCategory = n.objective.objSubCategory
          objCustomCatValue = n.objective.objCustomCatValue
          objCustomSubCatValue = n.objective.objCustomSubCatValue
          n.objType = n.objective.objType
          return this.formatKpi({ ...n, id: n.kpiId }, false)
        });
      } else {
        const keys = Object.keys(node)
        return keys.map(k => {
          const branch = this.formatBranch({ id: 'Branch_' + id++, label: k, level: ix })
          branch.children = traverseTree(node[k], ix + 1)

          switch (branch.type) {
            case "Financial Objective":
              branch.category = [{
                objIsCustomCategory: objIsCustomCategory,
                objType: objType,
                objCategory: objCategory,
                objCustomCatValue: objCustomCatValue,
                objCustomSubCatValue: objCustomSubCatValue
              }]
              // if(objType === "NON_FINANCIAL"){
              //   branch.type = "Non-Financial Objective"
              // }
              break;
            case "Business Objective":
              branch.category = [{
                objIsCustomCategory: objIsCustomCategory,
                objIsCustomSubCategory: objIsCustomSubCategory,
                objType: objType,
                objCategory: objCategory,
                objSubCategory: objSubCategory,
                objCustomCatValue: objCustomCatValue,
                objCustomSubCatValue: objCustomSubCatValue
              }]
              break;
            case "Value Driver":
              branch.category = [{
                objType: objType
              }]
              break;
            case "Strategic Objective":
              branch.category = [{
                objSoType: objSoType,
              }]
              break;
            default:
              branch.category = [{
                objType: objType
              }]
              break;
          }
          return branch;
        });
      }
    }
    this.dataTree = traverseTree(resultObj, 0)[0];
    this.dataTreeBackup = _.cloneDeep(this.dataTree);
    makeAutoObservable(this.dataTree);
    this.operationalKpIs = observable([]);
    this.updateOpKpis();
    this.stateUndoHistory = []; // Reset History
    this.stateRedoHistory = [];


    /** OLD CODE   */
    /* vvvvvvvvvvv */
    let treeObj = {}
    let level2cnt = 0
    let level3cnt = 0
    let level4cnt = 0
    let level5cnt = 0
    let kpiIds = []
    let count = 0


    // const editVDTStore = new EditVDTStore()
    for (let so in resultObj) {
      treeObj[so] = []
      level2cnt = 0
      for (let fo in resultObj[so]) {
        treeObj[so].push({ [fo]: [] })
        level3cnt = 0
        for (let bo in resultObj[so][fo]) {
          treeObj[so][level2cnt][fo].push({ [bo]: [] })
          level4cnt = 0
          for (let bkpi in resultObj[so][fo][bo]) {
            treeObj[so][level2cnt][fo][level3cnt][bo].push({ [bkpi]: [] })
            level5cnt = 0
            for (let vd in resultObj[so][fo][bo][bkpi]) {
              treeObj[so][level2cnt][fo][level3cnt][bo][level4cnt][bkpi].push({ [vd]: [] })
              for (let okpi in resultObj[so][fo][bo][bkpi][vd]) {
                treeObj[so][level2cnt][fo][level3cnt][bo][level4cnt][bkpi][level5cnt][vd].push({ [okpi]: [resultObj[so][fo][bo][bkpi][vd][okpi]] })
                for (let okpi in resultObj[so][fo][bo][bkpi]) {
                  if (!kpiIds.includes(resultObj[so][fo][bo][bkpi][okpi].kpiId)) {
                    kpiIds.push(resultObj[so][fo][bo][bkpi][okpi].kpiId)
                    this.operationKpiIds.push({
                      kpiId: resultObj[so][fo][bo][bkpi][okpi].kpiId,
                      frequency: false,
                    })
                    //this.operationalKpIs.push(resultObj[so][fo][bo][bkpi][okpi])
                    count++;
                    if (count === 1) {
                      this.selectedAccentureOffering = {
                        value: resultObj[so][fo][bo][bkpi][okpi].clonedProject,
                        label: resultObj[so][fo][bo][bkpi][okpi].clonedProject
                      }
                      this.selectedIndustry = {
                        value: resultObj[so][fo][bo][bkpi][okpi].cloneIndustry,
                        label: resultObj[so][fo][bo][bkpi][okpi].cloneIndustry
                      }

                    }

                  }
                }
              }
              level5cnt++
            }
            level4cnt++
          }
          level3cnt++
        }
        level2cnt++
      }
    }
    if (this.existingTransaction) {
      if (this.selectedGrowthPillar !== "") {
        this.branchTree.push(treeObj)
      }
    }
    else {

      this.branchTree.push(treeObj)


    }
    return true

  }

  async validateTree() {
    if (this.operationalKpIs.filter(function (el) {
      return el == null;
    }).length > 0) {
      //Show error

      await this.showNotification('saveError', 'Sorry, please complete the tree before saving')
      return false;
    }

    return true;
  }

  showNotification(type, msg) {
    switch (type) {

      case 'saveSuccess':
        toast.info(<NotificationMessage
          title="Success"
          bodytext={msg}
          icon="success"
        />, {
          position: toast.POSITION.BOTTOM_RIGHT
        });
        break;

      case 'saveError':
        toast.error(<NotificationMessage
          title="Error"
          bodytext={msg}
          icon="error"
        />, {
          position: toast.POSITION.BOTTOM_RIGHT
        });
        break;

      case 'multipleKOError':
        toast.error(<MultipleNotificationMessage
          title="Errors"
          bodytext={msg}
          icon="error"
        />, {
          position: toast.POSITION.BOTTOM_RIGHT
          //className:"multipleKOError",          
        });
        break;

      default:
        console.log("Default");
        break;
    }
  }

  isDefinedNonEmpty = (value) => {
    return value !== undefined && value !== null && value.toString().trim() !== '';
  }

  isDefined = (value) => {
    return value !== undefined && value !== null;
  }

  @action
  async saveTree(isModeClicked) {

    if (!await this.validateTree())
      return false;
    // flaten kpi information
    const payload = {
      mapId: SessionStorage.read('mapId'),
      deleteKpis: [],
      kpiDetails: []
    }

    let category = [];

    const traverseFlat = (node, branchPath, nodeArray) => {
      if (node.level === 0) {
        category.objSoType = node.category[0].objSoType;
      }
      if (node.level === 1) {
        category.objCategory = node.category[0].objCategory;
        category.objIsCustomCategory = node.category[0].objCategory !== "CUSTOM" ? "N" : "Y";
        category.objCustomCatValue = node.category[0].objCustomCatValue;
      }
      if (node.level === 2) {
        category.objSubCategory = node.category[0].objSubCategory;
        category.objIsCustomSubCategory = node.category[0].objSubCategory !== "CUSTOM" ? "N" : "Y";
        category.objCustomSubCatValue = node.category[0].objCustomSubCatValue;
      }
      if (node.children === undefined) { //KPI
        let objectiveInfo = {
          "objSoType": "STRATEGIC",
          "objSoName": branchPath.objSoName.trim(),
          "objType": node.objType,
          "objFoName": branchPath.objFoName.trim(),
          "objBoName": branchPath.objBoName.trim(),
          "objVdName": branchPath.objVdName.trim(),
          "objCategory": category.objCategory,
          "objIsCustomCategory": category.objIsCustomCategory,
          "objCustomCatValue": category.objCustomCatValue,
          "objSubCategory": category.objSubCategory,
          "objIsCustomSubCategory": category.objIsCustomSubCategory,
          "objCustomSubCatValue": category.objCustomSubCatValue
        }
        let eachNode = {
          "avgBenchmark": treeBackup ? node.avgBenchmark : ((node.avgBenchmark.actualValue) === null || (node.avgBenchmark.actualValue) === "null" || (node.avgBenchmark.actualValue) === "" ? null : (node.avgBenchmark.actualValue)),
          "avgBenchmarkSource": node.avgBenchmarkSource === "" || node.avgBenchmarkSource === null || node.avgBenchmarkSource === undefined ? null : (node.avgBenchmarkSource),
          "baseline": treeBackup ? node.baseline : ((node.baseline.actualValue) === "" || (node.baseline.actualValue) === null ? null : (node.baseline.actualValue)),
          "bicBenchmark": treeBackup ? node.bicBenchmark : ((node.bicBenchmark.actualValue) === null || (node.bicBenchmark.actualValue) === "null" || (node.bicBenchmark.actualValue) === "" ? null : (node.bicBenchmark.actualValue)),
          "bicBenchmarkSource": node.bicBenchmarkSource === "" || node.bicBenchmarkSource === null || node.bicBenchmarkSource === undefined ? null : (node.bicBenchmarkSource),
          "enabledBenchmark": node.enabledBenchmark === undefined ? null : node.enabledBenchmark,
          "kpiFrequency": node.kpiFrequency === undefined ? null : node.kpiFrequency,
          "opKpi": node.opKpi === undefined ? null : node.opKpi.trim(),
          "calculationType": node.calculationType === undefined ? null : node.calculationType,
          "opKpiFormula": node.opKpiFormula === undefined ? null : node.opKpiFormula.trim(),
          "opKpiDesc": node.opKpiDesc === undefined ? null : node.opKpiDesc.trim(),
          "opKpiUnit": node.opKpiUnit === undefined ? null : node.opKpiUnit,
          "kpiId": node.kpiId,
          "kpiBusType": node.kpiBusType === undefined ? null : node.kpiBusType,
          "kpiType": node.kpiType === undefined ? null : node.kpiType,
          "mapId": node.mapId === undefined ? SessionStorage.read('mapId') : node.mapId,
          "kpiTrend": node.kpiTrend === undefined ? null : node.kpiTrend,
          "order": node.order,
          "target": treeBackup ? node.target : (node.target === null || (node.target.actualValue) === "" || (node.target.actualValue) === null ? null : (node.target.actualValue)),
          "targetAchieved": node.targetAchieved === undefined || node.targetAchieved === "Select Year" ? null : node.targetAchieved,
          "objective": objectiveInfo
        }
        nodeArray.push(eachNode);
        //nodeArray.push(Object.assign(eachNode, branchPath));
      } else {
        // eslint-disable-next-line default-case
        switch (node.level) {
          case 0: branchPath.objSoName = node.label; break;
          case 1: branchPath.objFoName = node.label; break;
          case 2: branchPath.objBoName = node.label; break;
          case 3: branchPath.objVdName = node.label; break;
        }
        if (node.children != null)
          node.children.forEach((child, ix) => {

            branchPath.order = ix + 1;
            traverseFlat(child, branchPath, nodeArray);
          });
      }
    }
    let treeBackup = false;
    traverseFlat(this.dataTree, {}, payload.kpiDetails);
    const backupKPI = []
    treeBackup = true;
    traverseFlat(this.dataTreeBackup, {}, backupKPI);
    treeBackup = false;

    // Get Deleted nodes
    const diff = _.differenceBy(backupKPI, payload.kpiDetails, 'kpiId');
    payload.deleteKpis = diff.map((kpi) => kpi.kpiId)

    let inValidValues = 0;
    let mandatoryKpiFields = "";
    //Call Backend for saving
    if (!this.isLoading) {
      if (payload.kpiDetails && payload.kpiDetails.length > 0) {
        payload.kpiDetails.forEach((eachKpi, ind) => {
          eachKpi['order'] = ind + 1;
          if (/*RegExp(/[<>!'"[\]]/).test(eachKpi.objective.objSoType)
          ||*/ RegExp(/[<>!'"[\]]/).test(eachKpi.objective.objSoName)
            || RegExp(/[<>!'"[\]]/).test(eachKpi.objective.objFoName)
            || RegExp(/[<>!'"[\]]/).test(eachKpi.objective.objBoName)
            || RegExp(/[<>!'"[\]]/).test(eachKpi.objective.objVdName)
            || RegExp(/[<>!'"[\]]/).test(eachKpi.opKpi)
            /*|| RegExp(/[<>!'"[\]]/).test(eachKpi.objective.objCustomCatValue)
            || RegExp(/[<>!'"[\]]/).test(eachKpi.objective.objCustomSubCatValue)*/
          ) {
            inValidValues = inValidValues + 1;
          }

          if (!this.isDefined(eachKpi.calculationType) ||
            !this.isDefinedNonEmpty(eachKpi.opKpiFormula) || !this.isDefinedNonEmpty(eachKpi.opKpiDesc) ||
            !this.isDefined(eachKpi.opKpiUnit) || !this.isDefined(eachKpi.kpiBusType) || !this.isDefined(eachKpi.kpiTrend)
            || RegExp(/[<>!'"[\]]/).test(eachKpi.opKpiDesc) || RegExp(/[<>!'"[\]]/).test(eachKpi.opKpiFormula)) {
            if (mandatoryKpiFields === "") {
              mandatoryKpiFields = eachKpi.opKpi
            }
            else {
              mandatoryKpiFields = mandatoryKpiFields + ", " + eachKpi.opKpi
            }
          }
          /* "objCategory" : category.objCategory,
           "objIsCustomCategory" : category.objIsCustomCategory,
           "objCustomCatValue" : category.objCustomCatValue,
           "objSubCategory" : category.objSubCategory,
           "objIsCustomSubCategory" : category.objIsCustomSubCategory,
           "objCustomSubCatValue" : category.objCustomSubCatValue*/
        });
      }
      if (inValidValues > 0) {
        this.showNotification('saveError', "Please enter valid values for nodes. Special characters [ < ! ' \" > ] are invalid ");
      } else
        if (mandatoryKpiFields !== "") {
          this.showNotification('saveError', "Please enter mandatory fields with valid values for KPI : " + mandatoryKpiFields);
        }
        else {
          let vdtStatus = await this.saveCustomVDT(payload, isModeClicked)
          return vdtStatus;
        }
    }
    else {
      return false;
    }
  }

  @action
  saveCustomVDT(payload, isModeClicked) {
    const customVDTHelper = new CustomVDTHelper();
    const mapId = SessionStorage.read('mapId');
    this.isLoading = true;
    return customVDTHelper.saveCustomVDT(payload)
      .then((response) => {
        // if (response && response.data.resultCode === "OK") {
        if (response.data.resultCode === "OK") {
          if (isModeClicked === true) {
            this.selectMode();
          }
          this.showNotification('saveSuccess', 'Data saved successfully')
          this.getSelectedKpi(mapId, "isBenefitTrue");
          this.isLoading = false;
          return response;
        }
        else {
          this.showNotification('saveError', response.data.errorDescription);
          this.isLoading = false;
          return false;
        }
      })
      .catch((e) => {
        console.log(e.response);
        if (e.response.data.resultCode === "KO" && e.response.data.errorDescription === "VDT_ERRORS") {
          this.showNotification('multipleKOError', e.response.data.resultObj);
          //this.isLoading = false;
          //return false;
        } else {
          this.showNotification('saveError', e.response.data.errorDescription);

        }
        this.isLoading = false;
        return false;
      })
  }

  @action
  async getCategorDropDownValues() {
    const valueDriversDropdownHelper = new ValueDriversDropdownHelper();
    return await valueDriversDropdownHelper.getCategorDropDownValues()
      .then((response) => {

        Object.assign(this.catDropDown, response.data.resultObj);
        //this.handleResponse(response.data.resultObj)
        return response
      })
      .catch((e) => {
        console.log(e)
      })
  }

  @action
  async getSelectedKpi(projMapId, isBenefitTrue) {
    await this.fetchDropDownValues();
    this.getCategorDropDownValues();
    this.branchTree = []
    this.dataTree = {}
    this.operationKpiIds = []
    this.showVdtLoading = true;
    //
    if (SessionStorage.read('VDTmode'))
      this.mode = SessionStorage.read('VDTmode');
    else {
      this.mode = 'ALL'
      SessionStorage.write('VDTmode', 'ALL');
    }
    //SessionStorage.write('VDTmode', this.mode);


    this.existingTransaction = false;

    let prevResTime = "";
    let copyPayload = {};
    copyPayload = {
      "mapId": projMapId,
      "prevResTime": "",
      "isBenefit": isBenefitTrue === "isBenefitTrue" ? "true" : "false",
      "mode": SessionStorage.read('VDTmode'),
    };
    let reqObj = {
      "mapId": projMapId,
      "isBenefit": "false"
    };
    const commonStore = new CommonStore();
    prevResTime = commonStore.checkResponseTimeStamp("/rvdt/generateVDT", reqObj)
    copyPayload.prevResTime = (prevResTime !== null && prevResTime !== "" && isBenefitTrue !== "isBenefitTrue") ? prevResTime : "";
    const valueDriversDropdownHelper = new ValueDriversDropdownHelper();
    // const editVDTStore = new EditVDTStore()
    return valueDriversDropdownHelper.getSelectedKpis(copyPayload)
      .then(async (response) => {
        const { data } = response;
        this.branchTree = []
        this.dataTree = {};
        this.showVdtLoading = false;
        commonStore.updateResTimeStamp('/rvdt/generateVDT', reqObj, data);
        if (data.resultCode === 'OK') {
          const { resultObj } = data;
          this.resultEmptyCheck = data;

          if (isBenefitTrue === "isBenefitTrue") {
            // this.isLoading = false;
            window.location.reload();
          }
          if (resultObj !== 'Duplicates in VDT' && Object.entries(resultObj).length !== 0) {
            this.selectedKpi = resultObj;
            /*this.dataTree = resultObj;
            makeAutoObservable(this.dataTree)*/
            if (this.createTree(resultObj)) {
              this.getFrequencyMessage = data.errorDescription;
              this.isLoading = false;
              return data;
            }

          } else {
            //this.createTree({ 'Unset': {} });
            let result = {
              "": {}
            }
            if (this.createTree(result)) {
              ;
              this.isLoading = false;
              return data;
            }
          }

        } else {
          //this.createTree({ 'Unset': {} });
          this.branchTree = [];
          this.showNotification('saveError', 'Error loading project:' + data.errorDescription)
          this.isLoading = false;
          this.showVdtLoading = false
          return data;

        }
      })
      .catch((error) => {
        // return {
        //     error: true
        // }
        this.showVdtLoading = false;
        this.isLoading = false;
        if (isBenefitTrue === "isBenefitTrue") {
          window.location.reload();
        }
        return error; //error.response.data;
      });;
  }

  @action
  generateKPITemplate() {
    const valueDriversDropdownHelper = new ValueDriversDropdownHelper();
    const mapId = SessionStorage.read('mapId');

    return valueDriversDropdownHelper.generateKPITemplate(mapId)
      .then((response) => {
        const { data } = response;
        if (data.resultCode === 'OK') {
          const url = data.resultObj
          return valueDriversDropdownHelper.exportScreen(url, 'xlsx', 'KPI Data Template')
        }
      })
      .catch((error) => {
        return {
          error: true
        }
      });
  }

  @action
  setKpiFrequency(frequencyDetails, businessFrequency) {
    const valueDriversDropdownHelper = new ValueDriversDropdownHelper();
    const FrequencyData = {
      upMapId: SessionStorage.read('mapId'),
      business: businessFrequency,
      operational: frequencyDetails
    }
    return valueDriversDropdownHelper.setFrequency(FrequencyData)
      .then((response) => {
        if (!response.error) {
          const { data } = response;
          return data;
        }
      }).catch((error) => {
        return error.response.data;
      })
  }

  @action
  deleteVdt() {
    let mapId = SessionStorage.read('mapId')
    const valueDriversDropdownHelper = new ValueDriversDropdownHelper;
    return valueDriversDropdownHelper.deleteVDT(mapId)
      .then((response) => {
        const { data } = response;
        if (data.resultCode === 'OK') {
          const { resultObj } = data;
          let result = {
            "": {}
          }
          if (this.createTree(result)) {
            return data;
          }
          return data

        }
        else {
          return false
        }
      }).catch((error) => {

        return error.response.data;
      });
  }
  @action
  filterCategories(type, category) {
    let objectives = {
      "Financial Objective": 0,
      "Non-Financial Objective": 1
    }
    if (type === "Business Objective" && category) {
      let categories = {
        "EXPERIENCE": 0,
        "SUSTAINABILITY": 1,
        "TALENT": 2,
        "INCLUSION_AND_DIVERSITY": 3,
        "CUSTOM": 4,
        "FINANCIAL": 0
      }
      return this.catDropDown[category === "FINANCIAL" ? 0 : 1].objCategories[categories[category]].objectiveSubCategories
    }
    else
      return (objectives[type] || objectives[type] === 0) ? this.catDropDown[objectives[type]].objCategories.map(({ objCatName, objCatLabel }) => ({
        objCatName, objCatLabel
      })) : []
  }
  @action
  async selectMode() {
    this.loadingVDTMode = false;
    const mapId = SessionStorage.read('mapId');
    switch (this.mode) {
      case "ALL":
        this.mode = "FINANCIAL";
        break;
      case "FINANCIAL":
        this.mode = "NON_FINANCIAL";
        break;
      case "NON_FINANCIAL":
        this.mode = "ALL";
        break;
    }
    SessionStorage.write('VDTmode', this.mode);
    //this.getCategorDropDownValues();
    this.branchTree = []
    this.dataTree = {}
    this.operationKpiIds = []
    this.showVdtLoading = true;
    //


    this.existingTransaction = false;
    let copyPayload = {};
    copyPayload = {
      "mapId": SessionStorage.read('mapId'),
      "prevResTime": "",
      "isBenefit": "false",
      "mode": SessionStorage.read('VDTmode'),
    };
    let reqObj = {
      "mapId": SessionStorage.read('mapId'),
      "isBenefit": "false"
    };
    const valueDriversDropdownHelper = new ValueDriversDropdownHelper();
    // const editVDTStore = new EditVDTStore()
    return valueDriversDropdownHelper.getSelectedKpis(copyPayload)
      .then(async (response) => {
        const { data } = response;
        this.branchTree = []
        this.dataTree = {};
        this.showVdtLoading = false;
        this.loadingVDTMode = true;
        //commonStore.updateResTimeStamp('/rvdt/generateVDT', reqObj, data);
        if (data.resultCode === 'OK') {
          const { resultObj } = data;

          if (resultObj !== 'Duplicates in VDT' && Object.entries(resultObj).length !== 0) {
            this.selectedKpi = resultObj;
            /*this.dataTree = resultObj;
            makeAutoObservable(this.dataTree)*/
            if (this.createTree(resultObj)) {
              this.getFrequencyMessage = data.errorDescription;
              this.isLoading = false;
              this.loadingVDTMode = true;
              return data;
            }

          } else {
            //this.createTree({ 'Unset': {} });
            let result = {
              "": {}
            }
            if (this.createTree(result)) {
              ;
              this.isLoading = false;
              this.loadingVDTMode = true;
              return data;
            }
          }

        } else {
          //this.createTree({ 'Unset': {} });
          this.branchTree = [];
          this.showNotification('saveError', 'Error loading project:' + data.errorDescription);
          this.showVdtLoading = false;
          this.loadingVDTMode = true;
          this.isLoading = false;
          return data;

        }
      })
      .catch((error) => {
        // return {
        //     error: true
        // }
        this.showVdtLoading = false;
        this.isLoading = false;
        this.loadingVDTMode = true;
        return error; //error.response.data;
      });;
  }

  // below function is used for calling generatevdt only and create tree for rest of 'fvdt'tabs

  @action
  async getGenerateVDTOnly(isBenefit, mode, tab) {

    this.branchTree = []
    this.dataTree = {}
    this.operationKpiIds = []
    this.showVdtLoading = true;
    //
    if (tab === "Business Case Summary") {
      this.mode = mode;
    }
    else {
      if (SessionStorage.read('VDTmode'))
        this.mode = SessionStorage.read('VDTmode');
      else {
        this.mode = 'ALL'
        SessionStorage.write('VDTmode', 'ALL');
      }
    }
    //SessionStorage.write('VDTmode', this.mode);


    this.existingTransaction = false;

    let prevResTime = "";
    let copyPayload = {};

    copyPayload = {
      "mapId": SessionStorage.read('mapId'),
      "prevResTime": "",
      "isBenefit": isBenefit ? "true" : "false",
      "mode": this.mode,
    };
    let reqObj = {
      "mapId": SessionStorage.read('mapId'),
      "isBenefit": "false"
    };
    const commonStore = new CommonStore();
    prevResTime = commonStore.checkResponseTimeStamp("/rvdt/generateVDT", reqObj)
    copyPayload.prevResTime = (prevResTime !== null && prevResTime !== "" && !isBenefit) ? prevResTime : "";
    const valueDriversDropdownHelper = new ValueDriversDropdownHelper();
    // const editVDTStore = new EditVDTStore()
    return valueDriversDropdownHelper.getSelectedKpis(copyPayload)
      .then(async (response) => {
        const { data } = response;
        this.branchTree = []
        this.dataTree = {};
        this.showVdtLoading = false;
        commonStore.updateResTimeStamp('/rvdt/generateVDT', reqObj, data);
        if (data.resultCode === 'OK') {
          const { resultObj } = data;


          if (resultObj !== 'Duplicates in VDT' && Object.entries(resultObj).length !== 0) {
            this.selectedKpi = resultObj;
            /*this.dataTree = resultObj;
            makeAutoObservable(this.dataTree)*/
            if (this.createTree(resultObj)) {
              this.getFrequencyMessage = data.errorDescription;
              // this.isLoading = false;
              return data;
            }

          } else {
            //this.createTree({ 'Unset': {} });
            let result = {
              "": {}
            }
            if (this.createTree(result)) {
              ;
              // this.isLoading = false;
              return data;
            }
          }

        } else {
          //this.createTree({ 'Unset': {} });
          this.branchTree = [];
          this.showNotification('saveError', 'Error loading project:' + data.errorDescription)
          // this.isLoading = false;
          return data;

        }
      })
      .catch((error) => {
        // return {
        //     error: true
        // }
        this.showVdtLoading = false;
        this.isLoading = false;

        return error; //error.response.data;
      });;
  }

  @action
  resetVdtTreeVariables() {
    this.showVdtLoading = true;
    this.strategicObjectives = [];
    this.branchTree = [];
    this.dataTree = {};
    this.operationKpiIds = [];
    this.operationalKpIs = [];
  }
}