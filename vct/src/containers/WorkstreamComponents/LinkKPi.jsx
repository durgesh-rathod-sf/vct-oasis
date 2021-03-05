import React, { Component } from 'react';
import { withRouter } from "react-router-dom";
import { inject } from 'mobx-react';
import ReactTooltip from 'react-tooltip';

@inject('linkKPIInvestmentStore')
class LinkKPI extends Component {
    constructor(props) {
        super(props);
        this.state = {
            linkedKPIData: {},
            linkedKpiArray: [],
            totalKPI: [],
            wsKPIs: [],
            totalKPIWithColumns: [],
        }
        this.handleLinkedKpiChange = this.handleLinkedKpiChange.bind(this);
    }
    componentDidMount() {
        const { linkkpidata } = this.props;
        this.setState({
            linkedKPIData: linkkpidata
        }, () => {
            if (Object.keys(this.state.linkedKPIData).length > 0) {
                this.handleLinkedKpi(this.state.linkedKPIData);
            }
        });
    }

    static getDerivedStateFromProps(nextProps, prevState) {
        if (nextProps.linkkpidata !== prevState.linkkpidata) {
            return {
                linkedKPIData: nextProps.linkkpidata,
            };
        }
        // return null to indicate no change to state.
        return null;
    }

    componentDidUpdate(prevProps) {
        if (this.props.linkkpidata !== prevProps.linkkpidata) {
            if (Object.keys(this.state.linkedKPIData).length > 0) {
                this.handleLinkedKpi(this.state.linkedKPIData);
            }
        }
    }
    handleLinkedKpi(data) {
        if (data.wsLinkedKPIs[0].linkedKPIs.length === 1) {
            const linkedKpiArray = data.wsLinkedKPIs.map((option, index) => {
                const kpiObj = {};
                kpiObj["workstream_name"] = option.name;
                kpiObj["workstream_id"] = option.wsId;
                option.linkedKPIs.map((optionone, index1) => {
                    kpiObj[`kpiId_${optionone["kpiId"]}`] = optionone["percent"] !== null ? optionone["percent"] : 0;
                    return true;
                });
                return kpiObj;
            });
            linkedKpiArray['kpiArray'] = linkedKpiArray.map(linkedkpi => {
                return Object.keys(linkedkpi).splice(2);
            });
            this.setState({
                linkedKpiArray: linkedKpiArray
            }, () => {
                this.kpiTotal();
            })
        } else {
            for (let i = 0; i < data.wsLinkedKPIs.length; i++) {
                data.wsLinkedKPIs[i].linkedKPIs.sort(function (a, b) {
                    return a.kpiId - b.kpiId || a.kpiName.localeCompare(b.kpiName);
                });
            }
            const linkedKpiArray = data.wsLinkedKPIs.map((option, index) => {
                const kpiObj = {};
                kpiObj["workstream_name"] = option.name;
                kpiObj["workstream_id"] = option.wsId;
                option.linkedKPIs.map((optionone, index1) => {
                    kpiObj[`kpiId_${optionone["kpiId"]}`] = optionone["percent"] !== null ? optionone["percent"] : 0;
                    return true;
                });
                return kpiObj;
            });
            linkedKpiArray['kpiArray'] = linkedKpiArray.map(linkedkpi => {
                return Object.keys(linkedkpi).splice(2);
            });
            this.setState({
                linkedKpiArray: linkedKpiArray
            }, () => {
                this.kpiTotal();
            })
        }
    }

    kpiTotal() {
        let totalValue = 0;
        const totalKpiObj = {},
            totalKpiNames = {};
        const { linkKPIInvestmentStore } = this.props;
        linkKPIInvestmentStore.kpiColSum = [];
        linkKPIInvestmentStore.kpiRowSum = [];
        let sum = 0;                                            //row sum of costCat
        let rowSum = [];
        this.state.linkedKPIData.wsLinkedKPIs.map((ws) => {
            sum = 0;
            ws.linkedKPIs.map((kpi) => {
                sum = Number(kpi.percent) + sum;
                return true;
            })
            if (sum === 0) {
                let sumObj = {}
                sumObj["sum"] = sum;
                sumObj["ws"] = ws.name;
                rowSum.push(sumObj);
                sum = 0;
            }
            return true;
        })
        linkKPIInvestmentStore.kpiRowSum = rowSum;             //row sum of costCat
        if (this.state.linkedKPIData.wsLinkedKPIs[0].linkedKPIs.length === 1 && this.state.linkedKPIData.wsLinkedKPIs.length === 1) {
            const totalKPI = this.state.linkedKPIData.wsLinkedKPIs.map((option, index) => {
                for (let i = 0; i < option.linkedKPIs.length; i++) {
                    totalKpiObj[`kpiId_${option.linkedKPIs[i]['kpiId']}`] = option.linkedKPIs[i]['percent'] !== null ? option.linkedKPIs[i]['percent'] : 0;
                }
                return totalKpiObj;
            });
            const totalKPIWithColumns = this.state.linkedKPIData.wsLinkedKPIs.map((option, index) => {
                for (let i = 0; i < option.linkedKPIs.length; i++) {
                    totalKpiNames[option.linkedKPIs[i]['kpiName']] = option.linkedKPIs[i]['percent'] !== null ? option.linkedKPIs[i]['percent'] : 0;
                }
                return totalKpiNames;
            });
            totalKpiObj['yearArray'] = totalKPI.map(total => {
                return Object.keys(total);
            });
            totalKPI.length = 1;
            this.setState({
                totalKPI: totalKPI,
                totalKPIWithColumns: totalKPIWithColumns
            }, () => {
                linkKPIInvestmentStore.kpiColSum = totalKPIWithColumns;
            });
        }
        else {
            const totalKPI = this.state.linkedKPIData.wsLinkedKPIs.map((option, index) => {
                for (let i = 0; i < option.linkedKPIs.length; i++) {
                    totalValue = 0;
                    this.state.linkedKpiArray.map((yearVal, totalVal) => {
                        totalKpiObj[`kpiId_${option.linkedKPIs[i]['kpiId']}`] = yearVal[`kpiId_${option.linkedKPIs[i]['kpiId']}`] + totalValue;
                        totalValue = totalKpiObj[`kpiId_${option.linkedKPIs[i]['kpiId']}`];
                        return true;
                    });
                }
                return totalKpiObj;
            });
            const totalKPIWithColumns = this.state.linkedKPIData.wsLinkedKPIs.map((option, index) => {
                for (let i = 0; i < option.linkedKPIs.length; i++) {
                    totalValue = 0;
                    this.state.linkedKpiArray.map((yearVal, totalVal) => {
                        totalKpiNames[option.linkedKPIs[i]['kpiName']] = yearVal[`kpiId_${option.linkedKPIs[i]['kpiId']}`] + totalValue;
                        totalValue = totalKpiNames[option.linkedKPIs[i]['kpiName']];
                        return true;
                    });

                    //totalKpiNames[option.linkedKPIs[i]['kpiName']] = option.linkedKPIs[i]['percent']!==null? option.linkedKPIs[i]['percent']:0;
                }
                return totalKpiNames;
            });
            totalKpiObj['yearArray'] = totalKPI.map(total => {
                return Object.keys(total);
            });
            totalKPI.length = 1;
            totalKPIWithColumns.length = 1;
            this.setState({
                totalKPI: totalKPI,
                totalKPIWithColumns: totalKPIWithColumns
            }, () => {
                linkKPIInvestmentStore.kpiColSum = totalKPIWithColumns;
            });
        }
    }

    handleLinkedKpiChange(option, kpi, value) {
        let wskpiObj = {}; let test = {};
        const { linkKPIInvestmentStore } = this.props;
        let kpiId = kpi.split('_');
        const { linkedKPIData } = this.state;
        let tempArray = this.state.wsKPIs;
        for (let x of linkedKPIData.wsLinkedKPIs) {
            for (let y of x.linkedKPIs) {
                if (x.wsId === option && y['kpiId'] === Number(kpiId[1])) {
                    y['percent'] = Number(value);
                    if (this.state.wsKPIs.length > 0) {
                        for (let i = 0; i < this.state.wsKPIs.length; i++) {
                            if (this.state.wsKPIs[i].kpiId === Number(kpiId[1]) && this.state.wsKPIs[i].wsId === option) {
                                tempArray.splice(i, 1);
                            }
                        }
                    }
                    wskpiObj.wsId = option;
                    wskpiObj.kpiId = Number(kpiId[1]);
                    wskpiObj.percent = Number(value);
                    wskpiObj.wsKpiId = y['wsKpiId'];
                    test = tempArray.concat(wskpiObj);
                }
            }
        }
        linkKPIInvestmentStore.linkKPIInvestmentsSaveRequest = test
        this.handleLinkedKpi(linkedKPIData );

        this.setState({
            linkedKPIData: { ...linkedKPIData },
            wsKPIs: test
        })
    }

    buildSaveRequest(wsId, kpiId, percent) {
        let wskpiObj = {}; let test = {};
        console.log("in buildsaverequest", this.state.linkedKPIData);
        for (let x of this.state.linkedKPIData.wsLinkedKPIs) {
            for (let y of x.linkedKPIs) {
                if (y.kpiId === kpiId && x.wsId === wsId) {
                    wskpiObj.wsId = wsId;
                    wskpiObj.kpiId = kpiId;
                    wskpiObj.percent = percent;
                    test = this.state.wsKPIs.concat(wskpiObj);
                }
            }
        }
        this.setState({
            wsKPIs: test
        }, () => {
            console.log(this.state.wsKPIs);
            //    console.log(this.removeduplicate(this.state.wsKPIs,it=>(it.percent)));
        })
    }

    removeduplicate(data, key) {
        return [
            ...new Map(
                data.map(x => [key[x], x])
            ).values()
        ]
    }

    render() {
        const { linkedKPIData, totalKPI, linkedKpiArray } = this.state;
        var linkKPIHeaders = [];
        const getTooltipData = (val) => {
            return `${val}`;
        }
        if (Object.keys(linkedKPIData).length > 0) {
            for (let i = 0; i < linkedKPIData.wsLinkedKPIs[0].linkedKPIs.length; i++) {
                linkKPIHeaders.push(<th key={`header${i}`} data-tip={getTooltipData(linkedKPIData.wsLinkedKPIs[0].linkedKPIs[i].kpiName)} abbr={linkedKPIData.wsLinkedKPIs[0].linkedKPIs[i].kpiName}>{linkedKPIData.wsLinkedKPIs[0].linkedKPIs[i].kpiName}<ReactTooltip html={true} type="dark" /></th>);
            }
        }
        return (
            <>
                {linkedKPIData && Object.keys(linkedKPIData).length > 0 && linkedKPIData.wsLinkedKPIs[0].linkedKPIs.length === 0 ?
                    <div className="nodata_available">
                        Please add KPIs to the project
            </div> :
                    <table id="linkKpiInvestmentsTable">
                        <thead>
                            <tr>
                                {Object.keys(linkedKPIData).length === 0 ? "" : <th>{""}</th>}
                                {linkKPIHeaders.length > 0 ? linkKPIHeaders : ""}
                            </tr>
                        </thead>
                        <tbody>
                            { linkedKpiArray && linkedKpiArray.map((option, index) => (
                                <tr>
                                    <th scope="row" data-tip={getTooltipData(option.workstream_name)}>{option.workstream_name}<ReactTooltip html={true} type="dark" /></th>
                                    {
                                        linkedKpiArray.kpiArray[0] && linkedKpiArray.kpiArray[0].map((kpiobj, kpiArrayIndex) => {
                                            return <td >
                                                <span className="input-euro right">
                                                    <input
                                                        inputmode="numeric"
                                                        type="text"
                                                        id={kpiobj + index}
                                                        value={option[kpiobj] > 0 ? option[kpiobj] : ""}
                                                        onChange={(e) => this.handleLinkedKpiChange(option.workstream_id, kpiobj, e.target.value)}
                                                        className="link-kpi-input"
                                                    />
                                                </span>
                                            </td>
                                        })
                                    }
                                </tr>
                            ))}
                        </tbody>
                            <tfoot>
                        {totalKPI && totalKPI.map((option, index) => (
                            <tr key={`totalRow${index}`}>
                                <th className="totalTH" scope="row" data-tip={getTooltipData("Sum")}>Sum<ReactTooltip html={true} type="dark"/></th>
                                {
                                    option.yearArray[0] && option.yearArray[0].map((totalobj,index) => {
                                        return <td className="totalTD" key={`totaltd${index}`}>

                                            <span className="input-euro right">
                                                <input
                                                    type="text"
                                                    id={totalobj}
                                                    value={option[totalobj] > 0 ? option[totalobj] : ""}
                                                    className="link-kpi-inputTotal"
                                                    disabled={true}
                                                />
                                            </span>
                                            {/* <span>
                                            {option[totalobj] > 0 && option[totalobj] > 100?"please adjust the kpi percentages to 100%":""}
                                        </span> */}
                                            </td>
                                        })
                                    }
                                </tr>
                            ))}</tfoot>
                    </table>}
            </>
        );
    }
}

export default withRouter(LinkKPI);
