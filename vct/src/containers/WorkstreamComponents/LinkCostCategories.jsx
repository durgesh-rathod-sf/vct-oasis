import React, { Component } from 'react';
import { withRouter } from "react-router-dom";
import { inject } from 'mobx-react';
import ReactTooltip from 'react-tooltip';

@inject('linkKPIInvestmentStore')
class LinkCostCategories extends Component {

    constructor(props) {
        super(props);
        this.state = {
            linkedCostCatData: {},
            linkedCostCatArray: [],
            totalcostCat: [],
            wsCostCategories: [],
            totalCostCatWithColumns: [],
        }
        this.handleLinkCostCategoryChange = this.handleLinkCostCategoryChange.bind(this);
    }

    componentDidMount() {
        const { linkKPIInvestmentStore, linkcostCatData } = this.props;
        let sum = 0;                                            //row sum of costCat
        let rowSum = [];
        linkcostCatData.wsCostCategories.map((ws) => {
            ws.linkedCostCategories.map((kpi) => {
                sum = Number(kpi.percentAllocation) + sum;
                return true;
            })
            if (sum > 100) {
                rowSum.push(sum);
            }
            return true;
        })
        linkKPIInvestmentStore.costRowSum = rowSum;             //row sum of costCat
        this.setState({
            linkedCostCatData: linkcostCatData
        }, () => {
            this.handleLinkedCostCat(this.state.linkedCostCatData);
        });
    }
    handleLinkedCostCat(data) {
        if (data.wsCostCategories[0].linkedCostCategories.length === 1) {
            const linkedCostCatArray = data.wsCostCategories.map((option, index) => {
                const costCatObj = {};
                costCatObj["workstream_name"] = option.name;
                costCatObj["workstream_id"] = option.wsId;
                option.linkedCostCategories.map((optionone, index1) => {
                    costCatObj[`costCatId_${optionone["costCatId"]}`] = optionone["percentAllocation"] !== null ? optionone["percentAllocation"] : 0;
                    return true;
                });
                return costCatObj;
            });
            linkedCostCatArray['costCatArray'] = linkedCostCatArray.map(linkedcostCat => {
                return Object.keys(linkedcostCat).splice(2);
            });
            this.setState({
                linkedCostCatArray: linkedCostCatArray
            }, () => {
                this.costCatTotal();
            })
        } else {
            for (let i = 0; i < data.wsCostCategories.length; i++) {
                data.wsCostCategories[i].linkedCostCategories.sort(function (a, b) {
                    return a.costCatId - b.costCatId || a.catName.localeCompare(b.catName);
                });
            }
            const linkedCostCatArray = data.wsCostCategories.map((option, index) => {
                const costCatObj = {};
                costCatObj["workstream_name"] = option.name;
                costCatObj["workstream_id"] = option.wsId;
                option.linkedCostCategories.map((optionone, index1) => {
                    costCatObj[`costCatId_${optionone["costCatId"]}`] = optionone["percentAllocation"] !== null ? optionone["percentAllocation"] : 0;
                    return true;
                });
                return costCatObj;
            });
            linkedCostCatArray['costCatArray'] = linkedCostCatArray.map(linkedcostCat => {
                return Object.keys(linkedcostCat).splice(2);
            });
            this.setState({
                linkedCostCatArray: linkedCostCatArray
            }, () => {
                this.costCatTotal();
            })
        }
    }

    costCatTotal() {
        const totalcostCatObj = {}, totalcostCatNames = {};
        let totalValue = 0;
        const { linkKPIInvestmentStore } = this.props;
        const { linkedCostCatData } = this.state;
        linkKPIInvestmentStore.costColSum = [];
        let sum = 0;                                            //row sum of costCat
        let rowSum = [];
        for(let i=0 ; i < linkedCostCatData.wsCostCategories.length ; i++){
            let ws = linkedCostCatData.wsCostCategories[i] 
            sum = 0;
            for(let j=0 ; j < linkedCostCatData.wsCostCategories[i].linkedCostCategories.length ; j++){
                let kpi = linkedCostCatData.wsCostCategories[i].linkedCostCategories[j]
                sum = Number(kpi.percentAllocation) + sum
            }
            if (sum === 0) {
                let sumObj = {}
                sumObj["sum"] = sum;
                sumObj["ws"] = ws.name;
                rowSum.push(sumObj);
                sum = 0;
            }
        }

        // linkedCostCatData.wsCostCategories.map((ws) => {
        //     sum = 0;
        //     ws.linkedCostCategories.map((kpi) => {
        //         sum = Number(kpi.percentAllocation) + sum
        //     })
        //     if (sum === 0) {
        //         let sumObj = {}
        //         sumObj["sum"] = sum;
        //         sumObj["ws"] = ws.name;
        //         rowSum.push(sumObj);
        //         sum = 0;
        //     }
        // })


        linkKPIInvestmentStore.costRowSum = rowSum;             //row sum of costCat
        if (this.state.linkedCostCatData.wsCostCategories[0].linkedCostCategories.length === 1 && this.state.linkedCostCatData.wsCostCategories.length === 1) {
            const totalcostCat = this.state.linkedCostCatData.wsCostCategories.map((option, index) => {
                for (let i = 0; i < option.linkedCostCategories.length; i++) {
                    totalcostCatObj[`costCatId_${option.linkedCostCategories[i]['costCatId']}`] = option.linkedCostCategories[i]['percentAllocation'] !== null ? option.linkedCostCategories[i]['percentAllocation'] : 0;
                }
                return totalcostCatObj;
            });
            const totalCostCatWithColumns = this.state.linkedCostCatData.wsCostCategories.map((option, index) => {
                for (let i = 0; i < option.linkedCostCategories.length; i++) {
                    totalcostCatNames[option.linkedCostCategories[i]['catName']] = option.linkedCostCategories[i]['percentAllocation'] !== null ? option.linkedCostCategories[i]['percentAllocation'] : 0;
                }
                return totalcostCatNames;
            });
            totalcostCatObj['costCatArray'] = totalcostCat.map(total => {
                return Object.keys(total);
            });
            totalcostCat.length = 1;
            this.setState({
                totalcostCat: totalcostCat,
                totalCostCatWithColumns: totalCostCatWithColumns
            }, () => {
                console.log("totalcostCatObj::", this.state.totalcostCat, totalcostCat);
                linkKPIInvestmentStore.costColSum = totalCostCatWithColumns;
            });
        }
        else {
            const totalcostCat = this.state.linkedCostCatData.wsCostCategories.map((option, index) => {
                for (let i = 0; i < option.linkedCostCategories.length; i++) {

                    totalValue = 0
                    this.state.linkedCostCatArray.map((yearVal) => {
                        totalcostCatObj[`costCatId_${option.linkedCostCategories[i]['costCatId']}`] = yearVal[`costCatId_${option.linkedCostCategories[i]['costCatId']}`] + totalValue;
                        totalValue = totalcostCatObj[`costCatId_${option.linkedCostCategories[i]['costCatId']}`]
                        return true;
                    });
                }
                return totalcostCatObj;
            });
            const totalCostCatWithColumns = this.state.linkedCostCatData.wsCostCategories.map((option, index) => {
                for (let i = 0; i < option.linkedCostCategories.length; i++) {
                    // this.state.linkedCostCatArray.reduce((yearVal, totalVal) => {
                    //     totalcostCatNames[option.linkedCostCategories[i]['catName']] = yearVal[`costCatId_${option.linkedCostCategories[i]['costCatId']}`] + totalVal[`costCatId_${option.linkedCostCategories[i]['costCatId']}`];
                    // });
                    totalValue = 0
                    this.state.linkedCostCatArray.map((yearVal) => {
                        totalcostCatNames[option.linkedCostCategories[i]['catName']] = yearVal[`costCatId_${option.linkedCostCategories[i]['costCatId']}`] + totalValue;
                        totalValue = totalcostCatNames[option.linkedCostCategories[i]['catName']]
                        return true;
                        });
                    // totalcostCatNames[option.linkedCostCategories[i]['catName']] = option.linkedCostCategories[i]['percentAllocation']!==null? option.linkedCostCategories[i]['percentAllocation']:0;
                }
                return totalcostCatNames;
            });
            totalcostCatObj['costCatArray'] = totalcostCat.map(total => {
                return Object.keys(total);
            });
            totalcostCat.length = 1;
            totalCostCatWithColumns.length = 1;
            this.setState({
                totalcostCat: totalcostCat,
                totalCostCatWithColumns: totalCostCatWithColumns
            }, () => {
                console.log("");
                linkKPIInvestmentStore.costColSum = totalCostCatWithColumns;
            });
        }
    }

    handleLinkCostCategoryChange(option, costCat, value) {
        let wsCostCatObj = {}; let test = {};
        const { linkKPIInvestmentStore } = this.props;
        let costCatId = costCat.split('_');
        const { linkedCostCatData } = this.state;
        let tempArray = this.state.wsCostCategories;
        for (let x of linkedCostCatData.wsCostCategories) {
            for (let y of x.linkedCostCategories) {
                if (x.wsId === option && y['costCatId'] === Number(costCatId[1])) {
                    y['percentAllocation'] = Number(value);
                    if (this.state.wsCostCategories.length > 0) {
                        for (let i = 0; i < this.state.wsCostCategories.length; i++) {
                            if (this.state.wsCostCategories[i].costCatId === Number(costCatId[1]) && this.state.wsCostCategories[i].wsId === option) {
                                tempArray.splice(i, 1);
                            }
                        }
                    }
                    wsCostCatObj.wsId = option;
                    wsCostCatObj.costCatId = Number(costCatId[1]);
                    wsCostCatObj.percentAllocation = Number(value);
                    wsCostCatObj.wsCostCatId = y['wsCostCatId'];
                    test = tempArray.concat(wsCostCatObj);
                }
            }
        }
        linkKPIInvestmentStore.linkCostCategoriesSaveRequest = test
            this.handleLinkedCostCat(linkedCostCatData);
        this.setState({
            linkedCostCatData: { ...linkedCostCatData },
            wsCostCategories: test
        }
        // , () => {
        //     linkKPIInvestmentStore.linkCostCategoriesSaveRequest = this.state.wsCostCategories
        //     this.handleLinkedCostCat(this.state.linkedCostCatData);
        //     //this.buildSaveRequest(option, Number(kpiId[1]), Number(value));
        // }
        )
    }
    render() {
        const { linkedCostCatData, totalcostCat, linkedCostCatArray } = this.state;
        const getTooltipData = (val) => {
            return `${val}`;
        }
        var linkCostCatHeaders = [];
        if (Object.keys(linkedCostCatData).length > 0) {
            for (let i = 0; i < linkedCostCatData.wsCostCategories[0].linkedCostCategories.length; i++) {
                linkCostCatHeaders.push(<th key={`header${i}`} data-tip={getTooltipData(linkedCostCatData.wsCostCategories[0].linkedCostCategories[i].catName)} abbr={linkedCostCatData.wsCostCategories[0].linkedCostCategories[i].catName}>{linkedCostCatData.wsCostCategories[0].linkedCostCategories[i].catName}<ReactTooltip html={true} type="dark"/></th>);
            }
        }
        return (
            <>
                {linkedCostCatData && Object.keys(linkedCostCatData).length > 0 && linkedCostCatData.wsCostCategories[0].linkedCostCategories.length === 0 ?
                    <div className="nodata_available" style={{padding:"10%"}}>
                        Please Add Cost Categories To The Project
         </div>
                    : <table id="linkKpiInvestmentsTable">
                        <thead>
                            <tr>
                                <th></th>
                                {linkCostCatHeaders.length > 0 ? linkCostCatHeaders : ""}
                            </tr>
                        </thead>
                        <tbody>
                            {linkedCostCatData && Object.keys(linkedCostCatData).length > 0 && linkedCostCatArray && linkedCostCatArray.map((option, index) => (
                                <tr key={`costRow${index}`}>
                                    <th scope="row"data-tip={getTooltipData(option.workstream_name)}>{option.workstream_name}<ReactTooltip html={true} type="dark"/></th>
                                    {
                                        linkedCostCatArray.costCatArray[0] && linkedCostCatArray.costCatArray[0].map((costCatObj,costIndex) => {
                                            return <td key={`costtd${costIndex}`}>
                                                <span className="input-euro right">
                                                    <input
                                                        type="text"
                                                        id={costCatObj+index}
                                                        value={option[costCatObj] > 0 ? option[costCatObj] : ""}
                                                        onChange={(e) => this.handleLinkCostCategoryChange(option.workstream_id, costCatObj, e.target.value)}
                                                        className="link-kpi-input"
                                                    />
                                                </span>
                                            </td>
                                        })}
                                </tr>
                            ))}
                        </tbody>
                        <tfoot>
                        {totalcostCat && totalcostCat.map((option, index) => (
                            <tr key={`totalRow${index}`}>
                                <th scope="row"data-tip={getTooltipData("Sum")}>Sum<ReactTooltip html={true} type="dark"/></th>
                                {
                                    option.costCatArray[0] && option.costCatArray[0].map((totalobj,indexOne) => {
                                        return <td key={`totaltd${indexOne}`}>
                                            <span className="input-euro right">
                                                <input
                                                    type="text"
                                                    id={totalobj}
                                                    value={option[totalobj] > 0 ? option[totalobj] : ""}
                                                    className="link-kpi-inputTotal"
                                                    disabled={true}
                                                />
                                            </span>
                                        </td>
                                    })}
                            </tr>
                        ))}</tfoot>
                    </table>}
            </>
        );
    }
}

export default withRouter(LinkCostCategories);
