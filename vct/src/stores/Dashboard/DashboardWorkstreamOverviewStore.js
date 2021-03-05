import { observable, action } from "mobx";
import DashboardHelper from "../../helpers/DashboardHelper/DashboardHelper";
import { toJS } from "mobx";
import DashBoardUtils from "../../containers/Dashboards/DashboardUtils";

import Moment from 'moment';
import * as _ from "lodash"
var SessionStorage = require('store/storages/sessionStorage')


export default class DashboardWorkstreamOverviewStore {
    @observable kpiListResponse = [];
    @observable loader = false;
    @observable kpiTypeForAll = [];
    @observable wsResponse = {};
    @observable wsCommonArray = [];
    @observable overAllStartDate = "";
    @observable overAllEndDate = "";
    @observable charts = {
        WorkstreamBenefits: {

            label: 'Workstream Benefits ($)',
            type: 'Table',
            data: []
        },
        ProjectPlan: {
            label: 'Project Plan',
            type: 'ProjectPlan',
            data: []
        }
    };
    @observable excludeDeliverables =[];

    @action
    fetchWsOverview() {
        let mapId = SessionStorage.read('mapId')
        let dashboardHelper = new DashboardHelper();
        this.loader = true
        return dashboardHelper.getWorkstreamOveview(mapId)
            .then((res) => {
                if (res.data.resultCode === "OK" && res.data.errorDescription === null) {
                    this.wsResponse = res.data.resultObj;
                    this.kpiListResponse = res.data.resultObj.kpiList;
                    this.overAllStartDate = res.data.resultObj.overallWorkstreamStartDate;
                    this.overAllEndDate = res.data.resultObj.overallWorkstreamEndDate;
                    this.createWsCommonArray("All")
                    this.loader = false;
                    //this.buildProjectPlan()
                    return res;
                }
                else if ((res.data.resultCode === "OK" || res.data.resultCode === "KO") && res.data.errorDescription !== null) {
                    this.wsResponse = {};
                    this.kpiListResponse =[];
                    this.overAllStartDate = "";
                    this.overAllEndDate = "";
                    this.charts.WorkstreamBenefits.data=[];
                    this.charts.ProjectPlan.data=[];
                    this.loader = false;
                    this.kpiTypeForAll = []
                    return res;
                }
                else {
                    this.loader = false;
                    return res;
                }
            }).catch((error) => {
                this.loader = false;
                // return {
                //     error: true;
                // }
                     return error.response
                    //  re

                
            })
    }
    createWsCommonArray(selectedValue) {
        this.wsCommonArray = []
        let kpiList = []
        let tempActObj = {};
        if (selectedValue === "All") {
            kpiList = this.kpiListResponse
        }
        else {
            this.kpiListResponse.length > 0 && this.kpiListResponse.map((kpi, index) => {
                if (selectedValue === kpi.kpiName) {
                    kpiList.push(kpi)
                }
            })

        }

        kpiList.map((kpiObj) => {
            kpiObj.workstreamDetails.map((wsObj) => {
                let actListed = Object.keys(wsObj.activityList[0].groupedByActivity)   //[act1,act2]
                let tempActArr = [];
                Object.values(wsObj.activityList[0].groupedByActivity).map((actObj, actInd) => {
                    actObj.map((delObj, delInd) => {
                        tempActArr.push(delObj);
                        tempActArr[tempActArr.length - 1]["actName"] = actListed[actInd]
                    })
                })
                // console.log(tempActArr);



                let newWsObj = {
                    "wsName": wsObj.workstreamName,
                    "expectedBenefits": wsObj.totalExpectedBenefitTillDate,
                    "actualBenefits": wsObj.totalActualBenefitTillDate,
                    "status": wsObj.status,
                    "actArray": tempActArr

                }
                this.wsCommonArray.push(newWsObj)

            })
        })
        this.wsCommonArray = _.sortBy(this.wsCommonArray, 'wsName');
        this.updateCharts()
        //console.log(this.wsCommonArray)
    }

    buildProjectPlan(selectedWs, clickedIndex) {
        let tempWsObj = {};
        let projectData = [];
        let excludeDeliverables = [];
      
        let tempCommonArray = toJS(this.wsCommonArray);
        if (selectedWs) {   
            // let isAllSelected = false;                           
        

            this.charts.WorkstreamBenefits.data.data.map((wsObj, wsIndex) => {
                wsObj.map((eachWsDetailObj) => {              //resetting all values to isSelected values to false
                    eachWsDetailObj.isSelected = false
                })
                if (wsObj[0].value === selectedWs && selectedWs!== "All") {
                    this.charts.WorkstreamBenefits.data.data[wsIndex][clickedIndex].isSelected = !(this.charts.WorkstreamBenefits.data.data[wsIndex][clickedIndex].isSelected);
                    // isAllSelected = ( this.charts.WorkstreamBenefits.data.data[wsIndex][clickedIndex].isSelected === false ? true : false)
                }

            })

                //code for getting the selected Ws details
                if(selectedWs!=="All"){
                    tempCommonArray.map((eachWsObj) => {
                        if (eachWsObj.wsName === selectedWs) {
                            tempWsObj = eachWsObj
                        }
                    });
                    tempCommonArray = [];
                    tempCommonArray.push(tempWsObj);
                }
               //

        }

        tempCommonArray.map((eachWS) => {
            eachWS.actArray.map((eachAct) => {
                let temp = Object.values(eachAct);
                //console.log([temp[5], temp[0], temp[4], temp[1],temp[2]]);
                //console.log(temp);
                let duplicateExists = false;
                projectData.length > 0 && projectData.map((eachData) => {
                    if (eachData[0] === temp[5] && eachData[1] === temp[0]) {
                        duplicateExists = true;
                        return;
                    }
                })
                if (!duplicateExists) {
                    if (temp[4] === null && (temp[1] === null || temp[2] === null)) {
                        temp[4] = "-"
                    }
                    if (temp[4] !== null && (temp[1] === null || temp[2] === null)) {
                        excludeDeliverables.push(temp[0]);
                    }
                    if (temp[1] === null) {
                        temp[1] = this.overAllStartDate
                    }
                    if (temp[2] === null) {
                        temp[2] = this.overAllEndDate
                    }
                    projectData.push([temp[5], temp[0], this.decodeStatus(temp[4]), (new Date(temp[1])).getTime(), (new Date(temp[2])).getTime(), temp[3] === null ? "" : temp[3],
                    Moment(new Date(temp[1])).format('DD-MMM-YYYY'), 
                    Moment(new Date(temp[2])).format('DD-MMM-YYYY'), 
                    
                ])
                }

            })
        })
        this.excludeDeliverables = excludeDeliverables;
        this.charts.ProjectPlan.data = projectData;

        //console.log(projectData, this.charts.ProjectPlan.data);
    }
    populateWorkstreamBenefitChart(charts) {
        // const filteredData = this.filterData(dbData, filters, 'actualVsTargetKpiTillDates', 'actualVsTargetTotalKpiTillDates');
        // let totals = []
        // let acc_totals = []
        let formatterFn = 'currencyFormatter';
        let tempDataArr = [];
        let wsArray = [];
        let statusArr = []
        //build data Array
        this.wsCommonArray.map((wsObj) => {
            if (wsArray.indexOf(wsObj.wsName) === -1) {                                         //duplicate check
                let wsObjArr = [
                    { "value": (wsObj.wsName), "isSelected": false },
                    { "value": DashBoardUtils.convertToMillions(wsObj.expectedBenefits), "isSelected": false },
                    { "value": DashBoardUtils.convertToMillions(wsObj.actualBenefits), "isSelected": false },
                    {
                        "renderer": 'circle',
                        "value": {
                            "Workstream": wsObj.wsName,
                            "actualBenefits": DashBoardUtils.convertToMillions(wsObj.actualBenefits),
                            "expectedBenefits": DashBoardUtils.convertToMillions(wsObj.expectedBenefits),
                            "status": wsObj.status,
                        },
                        "isSelected": false
                    }
                ];
                wsArray.push(wsObj.wsName)
                tempDataArr.push(wsObjArr)
            }
            if (statusArr.indexOf(wsObj.status) === -1) {
                statusArr.push(wsObj.status)
            }

        })

        //console.log(tempDataArr)
        if (this.wsCommonArray !== []) {
            charts.WorkstreamBenefits.data = {
                headers: ['Workstream', 'Expected Benefits', 'Actual Benefits', 'Status'],
                data: tempDataArr,
                statusArr: statusArr
                // [
                //   ['ws1', '0.002M', '0.001M', { renderer: 'circle', value: 'NotStarted' }],
                //   ['ws2', '0.002M', '0.001M', { renderer: 'circle', value: 'NotStarted' }]
                // ]
            }


        }
        return charts;
    }

    decodeStatus = (status) => {
        let value = "";
        switch (status) {
            case "CMP_WITHIN_DUE_DT":
                value = "Completed within due date";
                break;
            case "CMP_AFTER_DUE_DT":
                value = "Completed after due date"
                break;
            case "DELAYED":
                value = "Delayed"
                break;
            case "INPROGRESS":
                value = "In Progress"
                break;
            case "NOT_STARTED":
                value = "Not Started"
                break;
            case null:
                value = "Not Started"
                break;
            case "-":
                value = "-"
                break;
            default:
                break;
        }
        return value;
    }


    @action
    async getEachKPI(kpiName) {
        this.loader = true;
        //console.log("before", this.loader)
        const kpiListResponse = toJS(this.kpiListResponse);

        if (kpiName === "All") {
            await kpiListResponse && kpiListResponse.length > 0 && kpiListResponse.filter((kpi, index) => {
                this.kpiTypeForAll.push(kpi.kpiType);
                if (kpiName === "All") {
                    this.loader = false;
                    return kpi;
                }
            })

        } else {
            await kpiListResponse && kpiListResponse.length > 0 && kpiListResponse.filter((kpi, index) => {
                if (kpiName === kpi.kpiName) {
                    this.loader = false;
                    this.eachKpi = kpi;
                    return kpi;
                }
            })
        }

    }

    updateCharts() {
        this.charts = this.populateWorkstreamBenefitChart(this.charts);
        this.buildProjectPlan();
    }

}