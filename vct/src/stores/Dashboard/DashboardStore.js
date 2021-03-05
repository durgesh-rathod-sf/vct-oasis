import { observable, action } from "mobx";
import DashboardHelper from '../../helpers/DashboardHelper/DashboardHelper';

var SessionStorage = require('store/storages/sessionStorage');

export default class DashboardStore {


    @action
     async downloadTableauFile(url) {
        const dashboardHelper = new DashboardHelper();
        const mapId = SessionStorage.read('mapId')
        const projectName = SessionStorage.read('projectName') + '_Dashboard Data'
        return await dashboardHelper.downloadFiledata(url, 'xlsx', projectName).then((response)=>{
            return true;
            }).catch((error) => {
                return {
                    error: true
                }
            })
    }
}