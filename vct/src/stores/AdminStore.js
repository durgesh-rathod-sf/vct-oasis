import { observable, action } from "mobx";
// import { Auth } from 'aws-amplify';
import AdminHelper from '../helpers/AdminHelper/AdminHelper';
var SessionStorage = require('store/storages/sessionStorage');

export default class AdminStore {
    @observable emailId
    @observable resultCode
    @observable errorMessage
    @observable accessType
    @observable userDetails
    @observable inAdminPanel = false;
    @observable addUserError = "";




    @action
    async addUser(emailId, accessType, industries,accountName,endDt) {
        this.addUserError = "";
        const adminHelper = new AdminHelper();
        let userType;
        let user = {};
        switch (accessType) {
            case 'User':
                userType = 'superuser'
                break;
            case 'Guest':
                userType = 'demouser'
                break;
            default:
                userType = accessType
                break;
        }
        user = {
            // userName: enterpriseId,
            userEmail: emailId,
            userType: userType,
            industries: industries,
            endDate: endDt
        }
        if(accessType === 'EU'){
            user.accountName = accountName
        }
         
        let userList = []
        userList.push(user)
        const payload = {
            "updateUserList": userList,
            "deleteUserList": []
        }
        return await adminHelper.addUser(payload)
            .then((response) => {
                // if (!response.error && response.data.resultCode === 'OK') {
                //     return true;
                // }
                // else {
                //     this.addUserError = response.data.resultDescription
                //     return false;
                // }
                if (!response.error && response && response.data) {
                    return response;
                }
                // return response;
            }).catch((error) => {
                // return {
                //     error: true
                // }
                return error.response;
            })

    }

    @action
    async updateUser(emailId, accessType, userId, industries, accountName, endDt) {
        const adminHelper = new AdminHelper();
        let userType;
        switch (accessType) {
            case 'User':
                userType = 'superuser'
                break;
            case 'Guest':
                userType = 'demouser'
                break;
            default:
                userType = accessType
                break;
        }
        const user = {
            userId: userId,
            // userName: enterpriseId,
            userEmail: emailId,
            userType: userType,
            industries: industries,
            endDate: endDt,
            accountName: accountName
        }
        let userList = []
        userList.push(user)
        const payload = {
            "updateUserList": userList,
            "deleteUserList": []
        }
        return await adminHelper.addUser(payload)
            .then((response) => {
                if (!response.error && response && response.data) {
                    return response;
                }
            }).catch((error) => {
                // return {
                //     error: true
                // }
                return error.response;
            })

    }

    /*
    *selectedUserType will be for providing Accenture/Non-Accenture users.
    */
    @action
    async fetchUsers(usersType, selectedUserType) {
        const adminHelper = new AdminHelper();
        return await adminHelper.fetchUsers(usersType, selectedUserType)
            .then((response) => {
                if (!response.error && response && response.data) {
                    this.userDetails = response.data.resultObj;
                    return response;
                }
            }).catch((error) => {
                // return {
                //     error: true
                // }
                return error.response;
            })

    }

    @action
    async uploadVDT(file) {
        const payload = new FormData();
        payload.append("file", file)
        payload.append("flag", "")
        const adminHelper = new AdminHelper();
        try {
            return await adminHelper.uploadVDT(payload)
                .then((response) => {
                    if (response && !response.error) {
                        this.errorMessage = response.data.message;
                        this.resultCode = response.data.resultCode;
                        console.log("from store:" + response.data.message + "/" + response.data.resultCode);

                        return true;

                    }
                    return false;
                }).catch((error) => {
                    return {
                        error: true
                    }
                })
        } catch (error) {
            console.log("error is" + error);
        }


    }

    @action
    async uploadVDTwithFlag(file, flag) {
        const payload = new FormData();
        payload.append("file", file)
        payload.append("flag", flag)
        const adminHelper = new AdminHelper();
        try {
            return await adminHelper.uploadVDT(payload)
                .then((response) => {
                    console.log(response);
                    // console.log(response.error);
                    if (response && !response.error
                        // .data.resultCode === 'OK'
                    ) {
                        this.errorMessage = response.data.message;
                        this.resultCode = response.data.resultCode;
                        console.log("from store:" + response.data.message + "/" + response.data.resultCode);

                        return true;

                    }
                    return false;
                }).catch((error) => {
                    return {
                        error: true
                    }
                })
        } catch (error) {
            console.log("error is" + error);
        }


    }

    @action
    async deleteUser(userId) {
        const adminHelper = new AdminHelper();
        let userList = [];
        userList.push(parseInt(userId))
        const payload = {
            "updateUserList": [],
            "deleteUserList": userList
        }
        return await adminHelper.addUser(payload)
            .then((response) => {
                if (!response.error && response && response.data) {
                    return response;
                }
            }).catch((error) => {
                // return {
                //     error: true
                // }
                return error.response;
            })
    }
    @action
    downloadTemplate(url, fileName) {
        const adminHelper = new AdminHelper();
        return adminHelper.downloadDocument(url, 'xlsx', fileName);
    }

    /* Fetch admin VDT Objective details */
    @action
    async getObjectives(type) {
        const adminHelper = new AdminHelper();
        return await adminHelper.getObjectives(type)
            .then((response) => {
                if (response && !response.error && response.data) {
                    return response;
                }
            })
            .catch((e) => {
                // return {
                //     error: true
                // }
                return e.response;
            });
    }

    /* Fetch all admin kpi details */
    @action
    async getKPIList(pageNo) {
        const adminHelper = new AdminHelper();
        return await adminHelper.getKPIList(pageNo)
            .then((response) => {
                if (response && !response.error && response.data) {
                    return response;
                }
            })
            .catch((e) => {
                // return {
                //     error: true
                // }
                return e.response;
            });
    }

    @action
    async getMasterIndustries() {
        const adminHelper = new AdminHelper();
        return await adminHelper.getMasterIndustries()
            .then((response) => {
                if (response && response.data) {
                    return response;
                }
            })
            .catch((e) => {
                // console.log(e);
                return e.response;
            })
    }

    @action
    async getIndustriesList() {
        const adminHelper = new AdminHelper();
        return await adminHelper.getIndustriesList()
            .then((response) => {
                if (response && response.data) {
                    return response;
                }
            })
            .catch((e) => {
                // console.log(e);
                return e.response;
            })
    }
    @action
    async fetchOppRequests() {
        const adminHelper = new AdminHelper();
        return await adminHelper.getOppRequests()
            .then((response) => {
                if (response && response.data) {
                    return response;
                }
            })
            .catch((e) => {
                // console.log(e);
                return e.response;
            })
    }

    @action
    async getBusinessList() {
        const adminHelper = new AdminHelper();
        return await adminHelper.getBusinessList()
            .then((response) => {
                if (response && response.data) {
                    return response;
                }
            })
            .catch((e) => {
                // console.log(e);
                return e.response;
            })
    }

    /* Save Opportunity requests for industry */
    @action
    async saveOppRequests(payload) {
        const adminHelper = new AdminHelper();
        return await adminHelper.saveOppRequests(payload)
            .then((response) => {
                if (response && !response.error && response.data) {
                    return response;
                }
            })
            .catch((e) => {
                //  return {
                //      error: true
                //  }
                return e.response;
            });
    }

    /* Save admin VDT objectives */
    @action
    async saveObjectives(type, payload) {
        const adminHelper = new AdminHelper();
        return await adminHelper.saveObjectives(type, payload)
            .then((response) => {
                if (response && !response.error && response.data) {
                    return response;
                }
            })
            .catch((e) => {
                // return {
                //     error: true
                // }
                return e.response;
            });
    }

    /* Save Admin KPI details */
    @action
    async saveOKPIDetails(payload) {
        const adminHelper = new AdminHelper();
        return await adminHelper.saveOKPIDetails(payload)
            .then((response) => {
                if (response && !response.error && response.data) {
                    return response;
                }
            })
            .catch((e) => {
                // return {
                //     error: true
                // }
                return e.response;
            });
    }

    /*Delete admin VDT element */
    @action
    async deleteObjective(type, id) {
        const adminHelper = new AdminHelper();
        return await adminHelper.deleteObjective(type, id)
            .then((response) => {
                if (response && !response.error && response.data) {
                    return response;
                }
            })
            .catch((e) => {
                // return {
                //     error: true
                // }
                return e.response;
            });
    }

    // start of ADD/EDIT/DELETE client data services -------------

    /* Save account name/names VDT objectives */
    @action
    async saveAccount(payload) {
        const adminHelper = new AdminHelper();
        SessionStorage.write('tenantId', null);
        return await adminHelper.saveAccount(payload)
            .then((response) => {
                if (response && !response.error && response.data) {
                    return response;
                }
            })
            .catch((e) => {
                // return {
                //     error: true
                // }
                return e.response;
            });
    }


    /* get account names  */
    @action
    async getAccountNames() {
        const adminHelper = new AdminHelper();
        SessionStorage.write('tenantId', null);
        return await adminHelper.getAccountNames()
            .then((response) => {
                if (response && !response.error && response.data) {
                    return response;
                }
            })
            .catch((e) => {
                // return {
                //     error: true
                // }
                return e.response;
            });
    }

    /*Delete Account */
    @action
    async deleteAccount(id) {
        const adminHelper = new AdminHelper();
        SessionStorage.write('tenantId', null);
        return await adminHelper.deleteAccount(id)
            .then((response) => {
                if (response && !response.error && response.data) {
                    return response;
                }
            })
            .catch((e) => {
                // return {
                //     error: true
                // }
                return e.response;
            });
    }

    /*Delete Opportunity Requests */
    @action
    async deleteOppRequest(payload) {
        const adminHelper = new AdminHelper();
        return await adminHelper.deleteOppRequest(payload)
            .then((response) => {
                if (response && !response.error && response.data) {
                    return response;
                }
            })
            .catch((e) => {
                //  return {
                //      error: true
                //  }
                return e.response;
            });
    }

    // end of ADD/EDIT/DELETE client data services -------------

    /* bulk upload in Admin Panel */

    @action
    async bulkUploadForKPI(file) {
        const payload = new FormData();
        payload.append("file", file);
        const adminHelper = new AdminHelper();
        return await adminHelper.bulkUploadForKPI(payload)
            .then((response) => {
                if (response && !response.error && response.data) {
                    return response;
                }
            })
            .catch((e) => {
                // return {
                //     error: true
                // }
                return e.response;
            });
    }

    @action
    async bulkUploadForObjectives(file, type) {
        let ObjectiveType = "";
        switch (type) {
            case 'Strategic Objective':
                ObjectiveType = 'SO';
                break
            case 'Financial / Non-Financial Objective':
                ObjectiveType = 'FO';
                break;
            case 'Business Objective':
                ObjectiveType = 'BO';
                break;
            case 'Value Driver':
                ObjectiveType = 'VD';
                break;
            default:
                return true;

        }
        const payload = new FormData();
        payload.append("file", file);
        const adminHelper = new AdminHelper();
        return await adminHelper.bulkUploadForObjectives(payload, ObjectiveType)
            .then((response) => {
                if (response && !response.error && response.data) {
                    return response;
                }
            })
            .catch((e) => {
                // return {
                //     error: true
                // }
                return e.response;
            });
    }

    @action
    async updatePotentialDuplicatesforKPI(payload) {
        const adminHelper = new AdminHelper();
        return await adminHelper.updatePotentialDuplicatesforKPI(payload)
            .then((response) => {
                if (response && !response.error && response.data) {
                    return response;
                }
            })
            .catch((e) => {
                // return {
                //     error: true
                // }
                return e.response;
            });
    }

    @action
    async updatePotentialDuplicates(payload) {
        const adminHelper = new AdminHelper();
        return await adminHelper.updatePotentialDuplicates(payload)
            .then((response) => {
                if (response && !response.error && response.data) {
                    return response;
                }
            })
            .catch((e) => {
                // return {
                //     error: true
                // }
                return e.response;
            });
    }

    @action
    async fetchFoBoCategories() {
        const adminHelper = new AdminHelper();
        return await adminHelper.fetchFoBoCategories()
            .then((response) => {
                if (response && !response.error && response.data) {
                    return response;
                }
            })
            .catch((e) => {
                // return {
                //     error: true
                // }
                return e.response;
            });


    }

    @action
    async saveSo(payload) {
        const adminHelper = new AdminHelper();
        return await adminHelper.saveSo(payload)
            .then((response) => {
                if (response && !response.error && response.data) {
                    return response;
                }
            })
            .catch((e) => {
                return e.response;
            });
    }

    @action
    async saveBo(payload) {
        const adminHelper = new AdminHelper();
        return await adminHelper.saveBo(payload)
            .then((response) => {
                if (response && !response.error && response.data) {
                    return response;
                }
            })
            .catch((e) => {
                // return {
                //     error: true
                // }
                return e.response;
            });
    }

    @action
    async saveFo(payload) {
        const adminHelper = new AdminHelper();
        return await adminHelper.saveFo(payload)
            .then((response) => {
                if (response && !response.error && response.data) {
                    return response;
                }
            })
            .catch((e) => {
                return e.response;
            });
    }

    @action
    async saveVD(payload) {
        const adminHelper = new AdminHelper();
        return await adminHelper.saveVD(payload)
            .then((response) => {
                if (response && !response.error && response.data) {
                    return response;
                }
            })
            .catch((e) => {
                return e.response;
            });
    }

    @action
    async downloadBulkTemplate(objective) {
        const adminHelper = new AdminHelper();
        return await adminHelper.downloadBulkTemplate(objective)
            .then((response) => {
                if (response && !response.error && response.data) {
                    return response;
                }
            })
            .catch((e) => {
                return e.response;
            });
    }
}