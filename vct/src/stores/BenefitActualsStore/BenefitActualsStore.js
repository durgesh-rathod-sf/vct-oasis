import { observable, action } from "mobx";
import BenefitActualsHelper from '../../helpers/BenefitActualsHelper/BenefitActualsHelper';
import BusinessCaseHelper from '../../helpers/BusinessCaseHelper/BusinessCaseHelper';
import CommonStore from '../CommonStore/CommonStore';
var SessionStorage = require('store/storages/sessionStorage');


export default class BenefitActualsStore {
    @observable kpiBenefits = []
    @observable color = ''
    @observable kpiId
    @observable focusedKpiId = "";
    @observable startDate = "";
    @observable freq = "";
    @observable targetTypeInput = {};
    @observable actualTypeInput = {};
    @observable frequency = false;
    @observable isFrequencyChanged = false;
    @observable branchTree = []
    @action
    fetchBenefitActuals() {
        this.branchTree = [];
        this.kpiBenefits = [];
        this.operationKpiIds = [];
        let prevResTime = ""
        // this.existingTransaction = false
       
        let payload = {}
        if ( this.isFrequencyChanged !== false) { 
            payload = {
                "mapId": SessionStorage.read("mapId"),
                "kpiId": this.kpiId,
                "frequency": this.frequency,
                "prevResTime":""
            }
        } else {
            payload = {
                "mapId": SessionStorage.read("mapId"),
                "prevResTime":""
            }
        }
        let reqObj = {
            "mapId": SessionStorage.read("mapId"),
        }
        const commonStore= new CommonStore
        prevResTime =  commonStore.checkResponseTimeStamp("actuals/getBenefitActuals",reqObj)
        payload.prevResTime = prevResTime;
        const d = new Date(), 
        dformat = [[d.getFullYear(),d.getMonth()+1,d.getDate()].join('-'),
                  [d.getHours(),d.getMinutes(),d.getSeconds()].join(':')+
                  '.'+String(new Date().getMilliseconds()).padStart(3, '0')].join(' ');
                  
        const benefitActualsHelper = new BenefitActualsHelper();
        // const editVDTStore = new EditVDTStore()

        return benefitActualsHelper.getBenefitActuals(dformat,payload) 
            .then((response) => {
                const { data } = response;
                if (!response.error) {
                    this.branchTree = []
                    if (data.resultCode === 'OK') {
                        const { resultObj } = data;
                        commonStore.updateResTimeStamp('actuals/getBenefitActuals',reqObj,data)
                        this.createTree(resultObj)
                        return data;
                    }return data;
                }
                else {
                    return false;
                }

            }).catch((error) => {
                // return {
                //     error: true
                // }
                return error.response.data;
            });
    }

    @action
    createTree(resultObj) {
        let treeObj = {}
        let level2cnt = 0
        let level3cnt = 0
        let level4cnt = 0
        let level5cnt = 0
        let kpiIds = []
        let count = 0
        this.operationalKpIs = []
        this.kpiBenefits = [];
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
                                        this.kpiBenefits.push(resultObj[so][fo][bo][bkpi][okpi])
                                        if (resultObj[so][fo][bo][bkpi][okpi].kpiSource === 'P') {
                                            count++;
                                            if (count === 1) {
                                                this.selectedGrowthPillar = {
                                                    value: resultObj[so][fo][bo][bkpi][okpi].cmtGrowthPillar,
                                                    label: resultObj[so][fo][bo][bkpi][okpi].cmtGrowthPillar
                                                }

                                                this.selectedSolutiontype = {
                                                    value: resultObj[so][fo][bo][bkpi][okpi].solutionType,
                                                    label: resultObj[so][fo][bo][bkpi][okpi].solutionType
                                                }

                                                this.selectedIndustry = {
                                                    value: resultObj[so][fo][bo][bkpi][okpi].cmtSubIndustry,
                                                    label: resultObj[so][fo][bo][bkpi][okpi].cmtSubIndustry
                                                }

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


    }
    @action
    async saveKpiBenefitActuals(payload) {

        const benefitActualsHelper = new BenefitActualsHelper();
        return await benefitActualsHelper.saveBenefitActuals(payload)
            .then((res) => {
                return res
            })
            .catch((e) => {
                // return {
                //     error: true
                // };
                return e.response;
            })
    }

    @action
    async deleteExtraYear(year) {
        try {
            const businessCaseHelper = new BusinessCaseHelper();
            const payload = {
                mapId: SessionStorage.read('mapId'),
                year: year,
                tab: 'benefitactuals',
                kpiId: this.kpiId,
            };
            const response = await businessCaseHelper.deleteExtraYear(payload);
            return response;
        } catch (error) {
            // return {
            //     error: true
            // };
            return error.response;
        }
    }
}