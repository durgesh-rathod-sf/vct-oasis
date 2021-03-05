import { observable, action } from "mobx";
import DashboardHelper from '../../helpers/DashboardHelper/DashboardHelper';
import { toJS } from "mobx";
import * as _ from "lodash";
import DashboardUtils from '../../containers/Dashboards/DashboardUtils';
var SessionStorage = require('store/storages/sessionStorage');

export default class InvestmentOverviewDashboardStore {
    @observable investmentOverviewResponse = {};
    @observable objectiveTypeList = [];
    @observable year = [];
    @observable loader = false;
    @observable allYears = [];
    @observable totalCapexForSelectedYears = 0;
    @observable totalOpexForSelectedYears = 0;
    @observable capexForSelectedYear = [];
    @observable opexForSelectedYear = [];
    @observable totalInvestment = {};
    @observable selectedData = [];
    @observable elementTotalValue = [];
    @observable allUniqueYear = [];
    @observable getElementValue = [];

    @action
    async getInvestmentOverviewResponse(objType) {
        const dashboardHelper = new DashboardHelper();
        this.loader = true;
        const mapId = SessionStorage.read('mapId');
        return await dashboardHelper.getInvOverview(mapId, objType)
            .then((response) => {
                if (response.data.resultCode === "OK") {
                    this.investmentOverviewResponse = response.data;
                    this.loader = false;
                    return response;

                } else if (response.data.resultCode === "KO") {
                    this.investmentOverviewResponse = {};
                    this.loader = false;
                    return response;
                }


            }).catch((error) => {
                this.loader = false;
                // return {
                //     error: true

                // }
                return error.respone;
            });
    }

    @action
    async getElement(data) {
        this.loader = true;
        this.objectiveTypeList = [];
        let objectArray = [];
        data.objectiveDetailList.map(object => {
            objectArray.push(object.elementName);
        })
        objectArray = objectArray.sort();
        objectArray.map(obj => {
            this.objectiveTypeList.push({ value: obj, label: obj });
        })
        this.loader = false;
        return this.objectiveTypeList;

    }

    @action
    async getYear(data, mode) {
        this.loader = true;
        let years = [];
        this.allUniqueYear = [];
        this.year = [];
        data.investmentOvertime.map(value => {
            this.allYears.push('Year ' + value.year)
        })
        data.investmentOvertime.map(object => {
            this.year.push({ value: 'Year ' + object.year, label: 'Year ' + object.year })
        })

        this.allUniqueYear = DashboardUtils.removeDuplicate(toJS(this.year));
        this.loader = false;
        return this.year;
    }

    @action
    async getInvestmentValues(years, objective, type) {
        this.loader = true;
        this.capexForSelectedYear = [];
        this.opexForSelectedYear = [];
        this.totalCapexForSelectedYears = 0;
        this.totalOpexForSelectedYears = 0;
        let investmentOverviewResponse = toJS(this.investmentOverviewResponse);

        if (type === 'element') {
            objective.map(val => {
                if (val.value !== 'All') {
                    investmentOverviewResponse.resultObj[0].objectiveDetailList.map(obj => {
                        if (obj.elementName === val.value) {
                            obj.investmentOvertime.map(yearValue => {
                                this.capexForSelectedYear.push({ year: 'Year_' + yearValue.year, capexValue: yearValue.capex })
                                this.opexForSelectedYear.push({ year: 'Year_' + yearValue.year, opexValue: yearValue.opex })
                                this.totalCapexForSelectedYears = this.totalCapexForSelectedYears + yearValue.capex;
                                this.totalOpexForSelectedYears = this.totalOpexForSelectedYears + yearValue.opex;
                            })
                        }
                    })
                    this.totalInvestment = this.totalCapexForSelectedYears + this.totalOpexForSelectedYears;
                } else {
                    let capexYearValue = 0;
                    let opexYearValue = 0;
                    let capexSelectedYearArray = [];
                    let opexSelectedYearArray = [];
                    investmentOverviewResponse.resultObj[0].objectiveDetailList.map(obj => {
                        obj.investmentOvertime.map(yearValue => {
                            if (capexSelectedYearArray.hasOwnProperty('Year_' + yearValue.year)) {
                                capexYearValue = capexSelectedYearArray['Year_' + yearValue.year] + yearValue.capex;
                                capexSelectedYearArray['Year_' + yearValue.year] = capexYearValue;
                            } else {
                                capexYearValue = yearValue.capex;
                                capexSelectedYearArray['Year_' + yearValue.year] = yearValue.capex
                            }

                            if (opexSelectedYearArray.hasOwnProperty('Year_' + yearValue.year)) {
                                opexYearValue = opexSelectedYearArray['Year_' + yearValue.year] + yearValue.opex;
                                opexSelectedYearArray['Year_' + yearValue.year] = opexYearValue;
                            } else {
                                opexYearValue = yearValue.opex;
                                opexSelectedYearArray['Year_' + yearValue.year] = yearValue.opex
                            }


                            this.capexForSelectedYear = capexSelectedYearArray;
                            this.opexForSelectedYear = opexSelectedYearArray;
                            this.totalCapexForSelectedYears = this.totalCapexForSelectedYears + yearValue.capex;
                            this.totalOpexForSelectedYears = this.totalOpexForSelectedYears + yearValue.opex;
                        })

                    })

                    Object.keys(capexSelectedYearArray).forEach(key => {
                        this.capexForSelectedYear.push({ year: key, capexValue: capexSelectedYearArray[key] })
                    })
                    Object.keys(opexSelectedYearArray).forEach(key => {
                        this.opexForSelectedYear.push({ year: key, opexValue: opexSelectedYearArray[key] })
                    })
                    this.totalInvestment = this.totalCapexForSelectedYears + this.totalOpexForSelectedYears;

                }

            })
        } else if (type = 'Years') {
            let capexYearValue = 0;
            let opexYearValue = 0;
            let capexSelectedYearArray = [];
            let opexSelectedYearArray = [];
            let selectedObj = objective;
            let selectedObjData = [];
            if (years === null || (years && years.length === 0)) {
                years = toJS(this.allUniqueYear);
            }
            if (selectedObj !== null && selectedObj.length > 0) {
                selectedObj.map(sel => {
                    investmentOverviewResponse.resultObj[0].objectiveDetailList.map(obj => {
                        if (sel.value === obj.elementName) {
                            selectedObjData.push(obj)
                        }
                    })
                })
            }
            years.map(year => {
                selectedObjData.map(obj => {
                    let yearValue = year.value;
                    let currentYear = yearValue.substring(5, yearValue.length)
                    obj.investmentOvertime.map(objData => {
                        if (parseInt(currentYear) === objData.year) {
                            /*  this.capexForSelectedYear.push({ year: 'Year_' + objData.year, capexValue: objData.capex })
                             this.opexForSelectedYear.push({ year: 'Year_' + objData.year, opexValue: objData.opex })
                             this.totalCapexForSelectedYears = this.totalCapexForSelectedYears + objData.capex;
                             this.totalOpexForSelectedYears = this.totalOpexForSelectedYears + objData.opex; */
                            if (capexSelectedYearArray.hasOwnProperty('Year_' + objData.year)) {
                                capexYearValue = capexSelectedYearArray['Year_' + objData.year] + objData.capex;
                                capexSelectedYearArray['Year_' + objData.year] = capexYearValue;
                            } else {
                                capexYearValue = objData.capex;
                                capexSelectedYearArray['Year_' + objData.year] = objData.capex
                            }

                            if (opexSelectedYearArray.hasOwnProperty('Year_' + objData.year)) {
                                opexYearValue = opexSelectedYearArray['Year_' + objData.year] + objData.opex;
                                opexSelectedYearArray['Year_' + objData.year] = opexYearValue;
                            } else {
                                opexYearValue = objData.opex;
                                opexSelectedYearArray['Year_' + objData.year] = objData.opex
                            }


                            this.capexForSelectedYear = capexSelectedYearArray;
                            this.opexForSelectedYear = opexSelectedYearArray;
                            this.totalCapexForSelectedYears = this.totalCapexForSelectedYears + objData.capex;
                            this.totalOpexForSelectedYears = this.totalOpexForSelectedYears + objData.opex;
                        }
                    })

                })
            })
            Object.keys(capexSelectedYearArray).forEach(key => {
                this.capexForSelectedYear.push({ year: key, capexValue: capexSelectedYearArray[key] })
            })
            Object.keys(opexSelectedYearArray).forEach(key => {
                this.opexForSelectedYear.push({ year: key, opexValue: opexSelectedYearArray[key] })
            })
            this.totalInvestment = this.totalCapexForSelectedYears + this.totalOpexForSelectedYears;
        }

        this.loader = false;
        return this.totalInvestment;
    }

    @action
    async getSelectedData(event, type, element) {
        this.loader = true;
        this.selectedData = [];
        let dataArray = [];
        if (type === 'Years') {
            let value = [];
            if (event.length === 0) {
                event = toJS(this.allUniqueYear)
            }
            if (event !== null) {
                if (element !== null && element.length > 0) {
                    this.investmentOverviewResponse.resultObj[0].objectiveDetailList.map(obj => {
                        element.map(ele => {
                            if (ele.value === obj.elementName) {
                                value.push(obj)
                            }
                        })
                    })
                } else {
                    value = toJS(this.investmentOverviewResponse.resultObj[0].objectiveDetailList)
                }

                let sortedValue = _.sortBy(value, 'elementName')
                value = sortedValue;
                value.map(data => {
                    data.investmentOvertime.map(investYear => {
                        event.map(eve => {
                            let yearValue = (eve.value).substring(5, (eve.value).length)
                            if (parseInt(yearValue) === investYear.year) {
                                //data.investmentOvertime.map(val => {
                                dataArray.push(investYear);
                                //})
                            }
                        })
                    })

                })
            }
            let selectedObject = [];
            let totalCapex = 0;
            let totalOpex = 0;
            dataArray.map(data => {
                if (selectedObject.hasOwnProperty('Year_' + data.year)) {
                    totalCapex = selectedObject['Year_' + data.year].capex + data.capex;
                    totalOpex = selectedObject['Year_' + data.year].opex + data.opex
                    selectedObject['Year_' + data.year] = { year: data.year, capex: totalCapex, opex: totalOpex };
                } else {
                    totalCapex = data.capex;
                    totalOpex = data.opex;
                    selectedObject['Year_' + data.year] = { year: data.year, capex: totalCapex, opex: totalOpex };
                }
            })
            Object.keys(selectedObject).forEach(key => {
                event.map(year => {
                    let yearValue = (key).substring(5, key.length)
                    let eventYear = (year.value).substring(5, (year.value).length)
                    if (parseInt(yearValue) === parseInt(eventYear))
                        this.selectedData.push(selectedObject[key])
                })

            })
        } else {
            let selectedObject = [];
            let selectedYear = [];
            if (element !== undefined && element !== null) {
                element.map(year => {
                    selectedYear.push(parseInt((year.value).substring(5, (year.value).length)))
                })
            }
            if (event !== null) {
                let value = toJS(this.investmentOverviewResponse.resultObj[0].objectiveDetailList)
                let sortedValue = _.sortBy(value, 'elementName')
                value = sortedValue;
                value.map(data => {
                    event.map(eve => {
                        let totalCapex = 0;
                        let totalOpex = 0;
                        if (eve.value === data.elementName) {
                            //this.selectedData = data.investmentOvertime;
                            data.investmentOvertime.map(invest => {
                                if (selectedYear.includes(invest.year)) {
                                    if (selectedObject.hasOwnProperty('Year_' + invest.year)) {
                                        totalCapex = selectedObject['Year_' + invest.year].capex + invest.capex;
                                        totalOpex = selectedObject['Year_' + invest.year].opex + invest.opex
                                        selectedObject['Year_' + invest.year] = { year: invest.year, capex: totalCapex, opex: totalOpex };
                                    } else {
                                        totalCapex = invest.capex;
                                        totalOpex = invest.opex;
                                        selectedObject['Year_' + invest.year] = { year: invest.year, capex: totalCapex, opex: totalOpex };
                                    }
                                }
                            })

                        }
                    })
                })
                Object.keys(selectedObject).forEach(key => {
                    this.selectedData.push(selectedObject[key])
                })
            } else {
                let selectedObject = [];
                let totalCapex = 0;
                let totalOpex = 0;
                let response = toJS(this.investmentOverviewResponse)
                let sortedValue = _.sortBy(response.resultObj[0].objectiveDetailList, 'elementName')
                sortedValue.map(data => {
                    data.investmentOvertime.map(data => {
                        //selectedObject.push(investmentOvertime)
                        if (selectedObject.hasOwnProperty('Year_' + data.year)) {
                            totalCapex = selectedObject['Year_' + data.year].capex + data.capex;
                            totalOpex = selectedObject['Year_' + data.year].opex + data.opex
                            selectedObject['Year_' + data.year] = { year: data.year, capex: totalCapex, opex: totalOpex };
                        } else {
                            totalCapex = data.capex;
                            totalOpex = data.opex;
                            selectedObject['Year_' + data.year] = { year: data.year, capex: totalCapex, opex: totalOpex };
                        }
                    })

                });
                Object.keys(selectedObject).forEach(key => {
                    this.selectedData.push(selectedObject[key])
                })
            }
        }
        this.loader = false;
        return this.selectedData;
    }

    @action
    async getDataByElement(selectedElement, type, years) {
        let totalCapex = 0;
        let totalOpex = 0;
        this.elementTotalValue = [];
        let elementArray = [];
        let investmentResponse = toJS(this.investmentOverviewResponse);
        if (type === 'Years') {
            let sortedValue = _.sortBy(investmentResponse.resultObj[0].objectiveDetailList, 'elementName')
            sortedValue.map(data => {
                data.investmentOvertime.map(val => {
                    let totalCapex = 0;
                    let totalOpex = 0;
                    selectedElement.map(element => {
                        let yearVal = (element.value).substring(5, (element.value).length)
                        if (val.year === parseInt(yearVal)) {
                            if (elementArray.hasOwnProperty(data.elementName)) {
                                totalCapex = elementArray[data.elementName].totalCapex + val.capex
                                totalOpex = elementArray[data.elementName].totalOpex + val.opex
                                elementArray[data.elementName] = { element: data.elementName, totalCapex: totalCapex, totalOpex: totalOpex }
                            } else {
                                totalCapex = totalCapex + val.capex;
                                totalOpex = totalOpex + val.opex;
                                elementArray[data.elementName] = { element: data.elementName, totalCapex: totalCapex, totalOpex: totalOpex }
                            }
                        }
                    })

                })
            })
            let grandTotalOpex = 0;
            let grandTotalCapex = 0;
            Object.keys(elementArray).forEach(key => {
                grandTotalCapex = grandTotalCapex + elementArray[key].totalCapex;
                grandTotalOpex = grandTotalOpex + elementArray[key].totalOpex;
                this.elementTotalValue.push(elementArray[key]);
            })
            this.elementTotalValue.push({ element: 'Grand Total', totalCapex: grandTotalCapex, totalOpex: grandTotalOpex });
        } else {
            let selectedYear = [];
            if (years !== undefined && years !== null) {
                years.map(year => {
                    selectedYear.push(parseInt((year.value).substring(5, (year.value).length)))
                })
            }
            let sortedElement = _.sortBy(investmentResponse.resultObj[0].objectiveDetailList, 'elementName')
            let sortedValue = [];
            sortedElement.map(ele => {
                selectedElement.map(selEle => {
                    if (selEle.value === ele.elementName) {
                        sortedValue.push(ele)
                    }
                })
            })
            sortedValue.map(data => {
                if (selectedElement !== null) {
                    selectedElement.map(selectedData => {
                        if (data.elementName === selectedData.value) {
                            totalCapex = 0;
                            totalOpex = 0;
                            data.investmentOvertime.map(yearData => {
                                if (selectedYear.includes(yearData.year)) {
                                    totalCapex = totalCapex + yearData.capex;
                                    totalOpex = totalOpex + yearData.opex;
                                }
                            })
                            this.elementTotalValue.push({ element: data.elementName, totalCapex: totalCapex, totalOpex: totalOpex })
                        }
                    })
                } else {
                    totalCapex = 0;
                    totalOpex = 0;
                    data.investmentOvertime.map(yearData => {
                        if (selectedYear.includes(yearData.year)) {
                            totalCapex = totalCapex + yearData.capex;
                            totalOpex = totalOpex + yearData.opex;
                        }
                    })
                    this.elementTotalValue.push({ element: data.elementName, totalCapex: totalCapex, totalOpex: totalOpex })
                }
            })

            let capexGrandTotal = 0;
            let opexGrandTotal = 0;
            this.elementTotalValue.map(value => {
                capexGrandTotal = capexGrandTotal + value.totalCapex;
                opexGrandTotal = opexGrandTotal + value.totalOpex;
            })
            this.elementTotalValue.push({ element: 'Grand Total', totalCapex: capexGrandTotal, totalOpex: opexGrandTotal })

            this.getElementValue = this.elementTotalValue;
        }
        return this.elementTotalValue;
    }
}