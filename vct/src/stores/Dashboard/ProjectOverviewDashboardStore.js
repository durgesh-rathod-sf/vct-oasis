
import { observable, action, makeAutoObservable } from "mobx";
import * as _ from "lodash"
// import { Auth } from 'aws-amplify';
import DashboardHelper from '../../helpers/DashboardHelper/DashboardHelper';

import Moment from 'moment';
import { toJS } from "mobx";

const SessionStorage = require('store/storages/sessionStorage');
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
export default class ProjectOverviewDashboardStore {
    @observable projectOverResponse = {};
    @observable selectedKpi = false;
    @observable vdtTreeObject = {};

    @observable expectedTotalBenefitFinalYear = 0;
    @observable expectedTotalBenefitCurrentYear = 0;
    @observable actualTotalBenefitCurrentYear = 0;
    @observable benefitVarianceCurrentYear = 0;

    @observable benefitFinalYear = '';
    @observable benefitCurrentYear = '';
    @observable selectedIndustry = ''
    @observable selectedAccentureOffering = ''
    @observable loader = false;
    @observable dataTree = {}
    @observable branchTree = []
  @observable dataTreeBackup = {}
  @observable operationalKpIs = []
  @observable operationKpiIds = []
  @observable vdtValues = {
    'Strategic Objective': [],
    'Business Objective': [],
    'Financial Objective': [],
    'Value Driver': [],
    'Kpi': []
  };

    @action
    getProjectOverview() {
      //  this.fetchDropDownValues();
        const dashboardHelper = new DashboardHelper();
        this.loader = true;
        const mapId = SessionStorage.read('mapId');
        this.resetAllVars();
        return  dashboardHelper.getProjectOverview(mapId)
            .then((response) => {
                if (response && response.data && response.data.resultCode === "OK") {
                    this.projectOverResponse = response.data.resultObj;

                    this.vdtTreeObject = response.data.resultObj.vdtPlotDetailsList;
                    

                    this.expectedTotalBenefitCurrentYear = response.data.resultObj.expectedBenefitsTillDate;
                    this.actualTotalBenefitCurrentYear = response.data.resultObj.actualBenefitsTillDate;
                    this.expectedTotalBenefitFinalYear = response.data.resultObj.targetBenefits;
                    this.benefitVarianceCurrentYear = response.data.resultObj.benefitVarianceTillDate;

                    let temp = '';
                    if (response.data.resultObj.targetBenefitEndDate && response.data.resultObj.targetBenefitEndDate !== '') {
                        let dateformat = Moment(response.data.resultObj.targetBenefitEndDate, 'DD-MM-YYYY');
                        temp = Moment(dateformat).format("MMMM yyyy");
                    }
                    

                    this.benefitFinalYear = temp;
                    this.benefitCurrentYear = Moment().format('MMMM yyyy');
            
                    this.loader = false;
                    this.createTree (response.data.resultObj.vdtPlotDetailsList);
                    return response
                }else if(response && response.data && response.data.resultCode === "KO"){
                    this.loader = false;
                    return response;
                }
                 else{
                    this.loader = false;
                    return response;
                }
            }).catch((error) => {
                console.log("error", error)
                this.loader = false;
                return {
                    error: true

                }
            })

    }
    // @action
    // async fetchDropDownValues() {
    //   const customVDTHelper = new CustomVDTHelper();
    //   return await customVDTHelper.fetchDropDownValues()
    //     .then((response) => {
  
    //       Object.assign(this.vdtValues, response.data.resultObj);
    //       //this.handleResponse(response.data.resultObj)
    //       return response
    //     })
    //     .catch((e) => {
    //       console.log(e)
    //     })
    // }
    createTree(resultObj) {
      let id = 1; //Counter for setting an unique ID to nodes

      // Function for transforming the array of data from backend into a tree structure
      const traverseTree = (node, ix) => {
        if (node.length) { //KPI Leave
          return node.map(n => {
            return this.formatKpi({ ...n, id: n.kpiId }, false)
          });
        } else {
          const keys = Object.keys(node)
          return keys.map(k => {
            const branch = this.formatBranch({ id: 'Branch_' + id++, label: k, level: ix })
            branch.children = traverseTree(node[k], ix + 1)
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
            if ( node.kpiType && node.kpiType !== "" ) {
              node['okpiType'] = node.kpiType
            }
            opKpis.push((node.opKpi && !node.creating) ? node : /*node.children && node.children.opKpi ? node.children[0] : */null)
          },
          (node) => node.opKpi != null || node.creating || (node.children && node.children.length === 0));
        this.operationalKpIs.replace(opKpis);
      }

       /**
   * Internal function.Adds properties to branch node
   * @param {*} branch Branch node
   */
      formatBranch(branch) {
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
   * Internal function.Adds properties to kpi node
   * @param {*} kpiNode KPI node
   */

      formatKpi(kpiNode, kpiNew) {
        //TO BE DONE: Move logic from component VDTTable to here
        if (kpiNew) {
          return Object.assign(kpiNode, { bicBenchmark: { actualValue: null }, baseline: { actualValue: null }, avgBenchmark: { actualValue: null }, target: { actualValue: null }, targetAchieved: null });
        }
        else {
          return kpiNode;
        }
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
        
    resetAllVars = () => {
        this.projectOverResponse = {};

        this.vdtTreeObject = {};        

        this.expectedTotalBenefitCurrentYear = 0;
        this.actualTotalBenefitCurrentYear = 0;
        this.expectedTotalBenefitFinalYear = 0;
        this.benefitVarianceCurrentYear =  0;        

        this.benefitFinalYear = '';
        this.benefitCurrentYear = '';
    }

}