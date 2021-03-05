import { observable, action } from "mobx";
// import { Auth } from 'aws-amplify';
import EditVDTHelper from '../helpers/EditVDTHelper/EditVDTHelper';
var SessionStorage = require('store/storages/sessionStorage');

export default class EditVDTStore {
    @observable subIndustry = []
    @observable accentureOffering = []
    @observable solutionType = []
    @observable selectedIndustry = ''
    @observable selectedAccentureOffering = []
    @observable defaultSelectedSolutionType = ''
    @observable defaultSelectedIndustry = ''
    @observable defaultSelectedGrowthPillar = ''
    @observable selectedSolutionType = []
    @observable selectedKPI = []
    @observable selectedSubIndustry = []
    @observable selectedVDT = []
    @observable selectedVDTForExport = []
    @observable selectedKpiIds = [] /* to maintain checklist as rendering removes selected checkobox */
    @observable selectedKPIIds = []
    @observable selectedKPItoDelete = []
    @observable selectedKPItoDeleteIDs = []

    // @observable selectedKPIIds = []
    @observable resultCode
    @observable errorMessage
    @observable cancelSelected = false;
    @observable findWhenSelected = false;
    @observable ManuallySearchBtn = false

    @action
    getValueDriverTreeData() {
        this.getSubIndustries();
        this.getGrowthPillar();
        this.getSolutionType();
    }

    @action
    async findValueDrivers() {
        const editVDTHelper = new EditVDTHelper();
        const dropdownInitial = {
            "cmt_growth_pillar": this.selectedGrowthPillar,
            "solution_type": this.selectedSolutionType,
            "cmt_sub_industry": this.selectedSubIndustry
        }
        return await editVDTHelper.fetchData(dropdownInitial)
            .then((response) => {
                if (!response.error) {
                    const { data } = response;
                    console.log('findValueDrivers:::', data);
                    console.log('findValueDrivers response:::', response);
                    if (data.resultCode === 'OK') {
                        this.subIndustry = [];
                        const { resultObj } = data
                        this.selectedVDT = resultObj
                        return response;
                    }
                    if (data.resultCode === 'KO') {
                        this.subIndustry = [];
                        this.selectedVDT = []
                        return response;
                    }
                }

            })
            .catch((e) => {
                // return {
                //     error: true
                // }
                return e.response;
            })
    }


    @action
    async getSubIndustries() {
        const editVDTHelper = new EditVDTHelper();
        const dropdownInitial = {
            "cmt_growth_pillar": this.selectedGrowthPillar,
            "solution_type": this.selectedSolutionType,
            "cmt_sub_industry": ""
        }

        return await editVDTHelper.fetchData(dropdownInitial)
            .then((response) => {
                if (!response.error) {
                    const { data } = response;
                    if (data.resultCode === 'OK') {
                        this.subIndustry = [];
                        const { resultObj } = data
                        for (let j = 0; j < resultObj.length; j++) {
                            if (resultObj[j] !== "") {
                                this.subIndustry.push({
                                    value: data.resultObj[j],
                                    label: data.resultObj[j]
                                })
                            }
                        }

                    }
                }

            })
            .catch((e) => {
                // return {
                //     error: true
                // }
                return e.response;
            })
    }

    @action
    async loadOfferings() {
        const editVDTHelper = new EditVDTHelper();
        // SessionStorage.write('tenantId', null);
        return await editVDTHelper.loadOfferings()
            .then((response) => {
                const { data } = response;
                if (!response.error && data) {
                    // if (data.resultCode === 'OK') {
                        return response;
                    // }
                }

            })
            .catch((e) => {
                // return {
                //     error: true
                // }
                return e.response;
            })
    }

    @action
    async getSolutionType() {
        const editVDTHelper = new EditVDTHelper();
        const dropdownInitial = {
            "cmt_growth_pillar": this.selectedGrowthPillar,
            "solution_type": "",
            "cmt_sub_industry": ""
        }

        return await editVDTHelper.fetchData(dropdownInitial)
            .then((response) => {
                const { data } = response;
                if (response && !response.error && data) {
                    if (data.resultCode === 'OK') {
                        const dataLength = data.resultObj.length;
                        this.solutionType = []
                        for (let i = 0; i < dataLength; i++) {
                            this.solutionType.push({
                                value: data.resultObj[i],
                                label: data.resultObj[i]
                            })
                        }
                        return response;
                    }
                        return response;
                }

            })
            .catch((e) => {
                // return {
                //     error: true
                // }
                return e.response;
            })
    }

    @action resetValueDriver() {
        // this.highKpiDetails = [];
        // this.lowKpiDetails = [];
        this.selectedIndustry = '';
        this.functionalArea = false;
        this.projectScenario = false
        this.selectedFunctionalArea = []
        this.selectedScenario = []
        this.selectedVDT = []
        this.selectedVDTForExport = []
        this.selectedKpiIds = []
        this.defaultSelectedScenario = ''
        this.defaultSelectedIndustry = ''
        this.defaultSelectedFunctionalArea = ''
    }

    @action
    async getDefaultDropdownValue() {
        const editVDTHelper = new EditVDTHelper();
        const mapId = SessionStorage.read('mapId');
        return await editVDTHelper.getDefaultDropdownValue(mapId)
            .then((response) => {
                if (!response.error) {
                    const { data } = response;
                    const { resultObj } = data
                    if (data.resultCode === 'OK') {
                        for (let i = 0; i < resultObj.length; i++) {
                            if (resultObj[i].priority === 'HIGH') {
                                this.highKpiDetails.push(resultObj[i])
                            }
                            if (resultObj[i].priority === 'LOW') {
                                this.lowKpiDetails.push(resultObj[i]);
                            }
                        }
                        this.selectedVDT = resultObj
                        this.defaultSelectedIndustry = resultObj[0].subIndustry
                        this.defaultSelectedGrowthPillar = resultObj[0].functionalArea
                        this.defaultSelectedSolutionType = resultObj[0].projectScenario
                        return response;
                    }else{
                        return response;
                    }
                }

                return false
            }).catch((error) => {
                // return {
                //     error: true
                // }
                return error.response;
            });
    }

    @action
    async uploadUpdatedKPI(file) {
        const payload = new FormData();
        payload.append("file", file)
        payload.append("flag", "")
        const editVDTHelper = new EditVDTHelper();
        try {
            return await editVDTHelper.uploadUpdatedKPI(payload)
                .then((response) => {
                    console.log(response);
                    // console.log(response.error);
                    if (response && !response.error
                        // .data.resultCode === 'OK'
                    ) {
                        this.errorMessage = response.data.errorDescription;
                        this.resultCode = response.data.resultCode;
                        console.log("from store:" + response.data.message + "/" + response.data.resultCode);
                        return response;

                    }
                    // return false;
                }).catch((error) => {
                    // return {
                    //     error: true
                    // }
                    return error.response;
                })
        } catch (error) {
            console.log("error is" + error);
            return {
                error: true
            }
        }
    }
    @action
    async uploadUpdatedKPIwithFlag(file, flag) {
        const payload = new FormData();
        payload.append("file", file)
        payload.append("flag", flag)
        const editVDTHelper = new EditVDTHelper();
        try {
            return await editVDTHelper.uploadUpdatedKPI(payload)
                .then((response) => {
                    console.log(response);
                    // console.log(response.error);
                    if (response && !response.error
                        // .data.resultCode === 'OK'
                    ) {
                        this.errorMessage = response.data.errorDescription;
                        this.resultCode = response.data.resultCode;
                        console.log("from store:" + response.data.message + "/" + response.data.resultCode);
                        return true;

                    }
                    return false;
                }).catch((error) => {
                    // return {
                    //     error: true
                    // }
                    this.errorMessage = error.response.data.errorDescription;
                })
        } catch (error) {
            console.log("error is" + error);
            return {
                error: true
            }
        }
    }

    @action
    async editKPI() {
        const editVDTHelper = new EditVDTHelper();
        let kpi_list = [...this.selectedKPIIds]
        let payload = {
            kpi_list: kpi_list
        }
        console.log('payload:::', payload);
        return await editVDTHelper.editKPIRows(payload)
            .then((response) => {
                if (!response.error) {
                    const { data } = response;
                    if (data.resultCode === 'OK') {
                        editVDTHelper.downloadSelectedKPI(data.url, 'xlsx');
                        console.log('success!!!!!');
                        return response;
                    }
                    return response;
                }

            })
            .catch((e) => {
                // return {
                //     error: true
                // }
                return e.response;
            })
    }


    @action
    async deleteKPI() {
        const editVDTHelper = new EditVDTHelper();
        let kpi_list = [...this.selectedKPItoDeleteIDs]
        let payload = {
            kpi_list: kpi_list
        }
        return await editVDTHelper.deleteKPIRows(payload)
            .then((response) => {
                if (response && response.data && !response.error) {
                    // if (data.resultCode === 'OK') {
                        console.log(response);
                        return response;
                    // }
                    // return response;
                }

            })
            .catch((e) => {
                // return {
                //     error: true
                // }
                return e.response;
            })
    }
}


// async fetchdata() {
//     const editVDTHelper = new EditVDTHelper();
//     const paylod = {
//         "cmt_growth_pillar": "",
//         "solution_type": "",
//         "cmt_sub_industry": ""

//     }
//     return await editVDTHelper.fetchVDTData(payload)
//         .then((response) => {
//             const { data } = response;
//             const { resultObj } = data
//             if (data.resultCode === 'OK') {

//             }
//         }
//     }