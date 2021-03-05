import { observable, action,toJS } from "mobx";
var SessionStorage = require('store/storages/sessionStorage');

export default class commonStore {
    @observable keysTimeStampList = []
    @action
    checkResponseTimeStamp(url, reqObj) {
       
        this.keysTimeStampList = (SessionStorage.read("timeStampsList") ? JSON.parse(SessionStorage.read("timeStampsList")) :[]);
        let prevResTime = "";
        
        let strigifiedReq = JSON.stringify(reqObj)
        let key = url + strigifiedReq
        this.keysTimeStampList.length > 0 && this.keysTimeStampList.map((eachTimeObj,index)=>{
            if(eachTimeObj.key === key){
                prevResTime = this.keysTimeStampList[index].value ;
            }
        })
        return prevResTime
    }
    @action
    updateResTimeStamp(url, reqObj, resObj) {
        let strigifiedReq = JSON.stringify(reqObj);
        // reqObj.prevResTime=""; //this line is added to stop adding the new record for different times of same url and reqObj
        let keysArray = [];
        let newKey = url + strigifiedReq
        let newValue = ((resObj.prevResTime === "" && resObj.prevResTime === null) ? "" : resObj.prevResTime)
        if (newValue !== "") {
          let  newObj = {
                "key": newKey,
                "value": newValue
            }
            if (this.keysTimeStampList.length === 0) {              //below code execute only when no data in the keysTimeStampList
                this.keysTimeStampList.push(newObj)
            }
            else {                                              //below code executes when the keysTimeStampList has atleast one value
                this.keysTimeStampList.map((eachTimeObj) => {
                    keysArray.push(eachTimeObj.key)
                })
                if (keysArray.indexOf(newObj.key) === -1) {      //for adding a key
                    this.keysTimeStampList.push(newObj)
  }
                else {                                           //for updating the timestamp for exsisting key
                    this.keysTimeStampList.map((eachTimeObj,index)=>{
                        if(eachTimeObj.key === newObj.key){
                            this.keysTimeStampList[index].value = newObj.value;
                        }
                    })
                }

            }
            // let x=JSON(this.keysTimeStampList)
           
            SessionStorage.write("timeStampsList",JSON.stringify(this.keysTimeStampList))
        }
    }
}