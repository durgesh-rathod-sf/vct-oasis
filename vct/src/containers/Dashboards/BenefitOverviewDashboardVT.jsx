import React from 'react';
import DashBoardUtils from './DashboardUtils';
import "./ValueTrackingTabs.css";
import * as _ from "lodash";

import { inject, observer } from 'mobx-react';
import ChartsVT from "./ChartsVT";
import Card from './Card';
import NotificationMessage from "../../components/NotificationMessage/NotificationMessage"
import { toast } from 'react-toastify';
import Select from 'react-select';


let graphs = {
    grossBenefit: {
        label: 'Actual vs Target Value of Benefit Till Date ($)',
        data: {
            backgroundColor: 'transparent',
            // grid: { containLabel: true },
            tooltip: {
                trigger: 'axis',
                axisPointer: {
                    type: 'shadow'
                },
                formatter: function (params) {
                    
                    let x = DashBoardUtils.currencyFormatterNoRoundOneDecimal(params[0].value).split("$")[1];
                    let y = DashBoardUtils.currencyFormatterNoRoundOneDecimal(params[1].value).split("$")[1];
                    return `Category : ${params[0].name}<br />Actual Benefit : ${x}<br />Target Benefit : ${y}`;
                }
            },
            grid : {
                y2: 95,
                width:"85%"
               
            },
            xAxis: [{
                type: 'category',
                data: [],
                axisLabel: {
                    rotate: 90,
                    // fontSize: 10,
                    rich :{
                        height: '0'
                    }               
                },
            }],
            yAxis: [{
                type: 'value',
                data: [],
                axisLabel: {
                    formatter: function (value) {
                        let x = DashBoardUtils.currencyFormatterNoRound(value).split("$")[1];
                        return x;
                    }
                },
            }],
            legend: {
             left: '1%',
             data: [
             {
                name: 'Actual Benefit',
                icon: 'roundRect'
            },
            {
                name: 'Target Benefit',
                icon: 'roundRect'
            }]                   
            },
            series: [{
                data: [],
                type: 'bar'
            },{
                data: [],
                type: 'line'
            }]
        }
    },
    periodicBenefit: {
        label: 'Periodic View of Benefit ($)',
        data: {
            backgroundColor: 'transparent',
            tooltip: {
                trigger: 'axis',
                axisPointer: {
                    type: 'shadow'
                }
            },
            xAxis: [{
                type: 'category',
                data: [],
                axisLabel: {
                    rotate: 90,
                    // fontSize: 10,
                    rich :{
                        height: '0'
                    }               
                },
            }],
            yAxis: [{
                type: 'value',
                data: [],
                axisLabel: {
                    formatter: function (value) {
                        let x = DashBoardUtils.currencyFormatterNoRound(value).split("$")[1];
                        return x;
                    }
                },
            }],
            legend: {
             left: '1%',
             data: [
                {
                   name: 'Actual Benefit',
                   icon: 'roundRect'
               },
               {
                   name: 'Target Benefit',
                   icon: 'roundRect'
               }]                   
            },
            series: [{
                data: [],
                type: 'bar'
            },{
                data: [],
                type: 'line'
            }],
            y2: 95,
width:"85%"
        }
    }
};
let mockcards = {
    ExpectedBenefitsFinal:
    {
        label: 'EXPECTED BENEFITS',
        value: '$ 0',
        subvalue: '',
        icon: 'benefits'
    },
    ExpectedBenefits:
    {
        label: 'EXPECTED BENEFITS',
        value: ' $ 0',
        subvalue: '',
        icon: 'benefits'
    },
    ActualBenefits: {
        label: 'ACTUAL BENEFITS',
        value: '$ 0',
        subvalue: '',
        icon: 'currency_dash'
    },
    BenefitVariance: {
        label: 'BENEFIT VARIANCE',
        value: '$ 0',
        subvalue: '',
        icon: 'variance_dash',
        className: 'green'
    }

};

@inject('benefitOverviewVTStore')
@observer
class BenefitOverviewDashboardVT extends React.Component {

    constructor(props) {
        super();
        this.state = {
            selectedView: {label: 'Financial Objective', value: 'Financial Objective'}, 
            totalCards: mockcards,
            charts: graphs,            
            apiError: false
        }

    }


    getBenOverviewVT = (selectedViewValue) => {
        const { benefitOverviewVTStore } = this.props;
        
        benefitOverviewVTStore.getBenOverviewVT(selectedViewValue)
            .then(response => {

                if (response && response.data && response.data.resultCode === "OK" && response.data.errorDescription === null) {
                    
                    const allCards = this.populateAllCards();
                    const lhsdata = this.populateBothCharts();
                    this.setState({
                        totalCards: allCards,
                        charts: lhsdata
                    });

                } else if(response && response.data && (response.data.resultCode === "KO" || response.data.resultCode === "OK" ) && response.data.errorDescription !== null){
                    this.showNotification(response.data.errorDescription, "Error", "error");
                    let graphs2 = JSON.parse(JSON.stringify(graphs));
                    graphs2.grossBenefit.data.grid = {};
                    this.setState({ 
                        apiError: !this.state.apiError,
                        totalCards: mockcards,
                        charts: graphs2 });

                }
                  else {
                    this.showNotification("Sorry! Something went wrong", "Error", "error");
                    let graphs2 = JSON.parse(JSON.stringify(graphs));
                    graphs2.grossBenefit.data.grid = {};
                    this.setState({ 
                        apiError: !this.state.apiError,
                        totalCards: mockcards,
                        charts: graphs2 });

                }
            });        
    }


    componentDidMount() {
        // this.setState({ charts: graphs });
        const {selectedView} = this.state;
        this.getBenOverviewVT(selectedView.value);
    }

    componentWillUnmount() {
        this.setState({ charts: graphs });
    }

    populateAllCards = () => {
        const {benefitOverviewVTStore} = this.props;
        const {totalCards} = this.state;
        let allCardsData = JSON.parse(JSON.stringify(totalCards));
        
        allCardsData.ExpectedBenefitsFinal.value = DashBoardUtils.currencyFormatter(benefitOverviewVTStore.expectedTotalBenefitFinalYear)
        allCardsData.ExpectedBenefits.value = DashBoardUtils.currencyFormatter(benefitOverviewVTStore.expectedTotalBenefitCurrentYear)
        allCardsData.ActualBenefits.value = DashBoardUtils.currencyFormatter(benefitOverviewVTStore.actualTotalBenefitCurrentYear)
        allCardsData.BenefitVariance.value = DashBoardUtils.currencyFormatter(benefitOverviewVTStore.benefitVarianceCurrentYear);

        allCardsData.BenefitVariance.className = (benefitOverviewVTStore.benefitVarianceCurrentYear && parseFloat(benefitOverviewVTStore.benefitVarianceCurrentYear) > 0)
         ? 'green' : 'red';

        allCardsData.ExpectedBenefitsFinal.subvalue = 'by ' + benefitOverviewVTStore.benefitFinalYear;
        allCardsData.ExpectedBenefits.subvalue = 'by ' + benefitOverviewVTStore.benefitCurrentYear;
        allCardsData.ActualBenefits.subvalue = 'by ' + benefitOverviewVTStore.benefitCurrentYear;
        allCardsData.BenefitVariance.subvalue = 'by ' + benefitOverviewVTStore.benefitCurrentYear;

        return allCardsData;

    }

    populateBothCharts = () => {
        let formatterFn = 'currencyFormatter';
        const {benefitOverviewVTStore} = this.props;
        const {charts} = this.state;
        let bothCharts = JSON.parse(JSON.stringify(charts));

        if (benefitOverviewVTStore.actualVsTargetBenefitOverTillDates && benefitOverviewVTStore.actualVsTargetBenefitOverTillDates.length > 0) {
            bothCharts.grossBenefit.data.xAxis[0].data = _.map(benefitOverviewVTStore.actualVsTargetBenefitOverTillDates, 'elementName');
           
            // below code is used to set currency formatter for Y axis labels
            bothCharts.grossBenefit.data.yAxis[0].axisLabel = {
                formatter: function (value) {
                    let x = DashBoardUtils.currencyFormatterNoRound(value).split("$")[1];
                    return x;
                }
            };

            bothCharts.grossBenefit.data.grid = {y2: 95, width: '85%'};
    
            bothCharts.grossBenefit.data.xAxis[0].axisLabel = {
                rotate: 90,
                fontSize: 10,
                formatter: function (value) {
                    let x = `${(value.length > 15) ? `${value.substr(0, 14)}...` : (value)}`;
                    return x;
                } 
            }
    
            bothCharts.grossBenefit.data.tooltip = {
                trigger: 'axis',
                axisPointer: {
                    type: 'shadow'
                },
                formatter: function (params) {
    
                    let iconAct = ``;
                    let iconTar = ``;
                    let x = ``;
                    let y = ``;
                    let final = ``;  // this will be final string of html code that will be displayed as tooltip content
    
                    if (params[0]) {
                        iconAct = `<span style="background-color:${
                            params[0].color
                          };border: 1px solid ${
                            params[0].color
                          };border-radius:50%;display:inline-block;height:12px;margin-right:6px;margin-botton:2px;width:12px;"></span>`;
    
                          x = DashBoardUtils.currencyFormatterNoRoundOneDecimal(params[0].value).split("$")[1];
    
                          final = `Category : ${params[0].name}<br />${iconAct}${params[0].seriesName} : $ ${x}`
                    }
                    if (params[1]) {
                        iconTar = `<span style="background-color:${
                            params[1].color
                          };border: 1px solid ${
                            params[1].color
                          };border-radius:50%;display:inline-block;height:12px;margin-right:6px;width:12px;"></span>`;
                          y = DashBoardUtils.currencyFormatterNoRoundOneDecimal(params[1].value).split("$")[1];
    
                          final = final + `<br />${iconTar}Target Benefit : $ ${y}`
                    }                
                    return final;                  
                }
            }
            
            bothCharts.grossBenefit.data.series = [{
                type: 'bar',
                name: 'Actual Benefit',
                itemStyle: {
                    color: '#00BAFF'
                },
                label: {
                    normal: {
                        show: true,
                        formatterFn,
                        // color: '#fff'
                    }
                },
                data: _.map(benefitOverviewVTStore.actualVsTargetBenefitOverTillDates, 'actualBenefitTillDate')
            },
            {
                type: 'line',
                name: 'Target Benefit',
                itemStyle: {
                    color: '#F28E2B'
                },
                label: {
                    normal: {
                        show: true,
                        formatterFn,
                        // color: '#fff'
                    }
                },
                data: _.map(benefitOverviewVTStore.actualVsTargetBenefitOverTillDates, 'targetBenefitTillDate')
            }];
        }
       

        
                

        // *****  lhs chart end ********

        // ------------------ rhs chart start -----------------------//
        
        bothCharts.periodicBenefit.data.xAxis[0].data = _.map(benefitOverviewVTStore.periodicBenefits, 'year');

        // below code is used to set currency formatter Y axis labels
        bothCharts.periodicBenefit.data.yAxis[0].axisLabel = {
            formatter: function (value) {
                let x = DashBoardUtils.currencyFormatterNoRound(value).split("$")[1];
                return x;
            },
            show: true
        };

        // below code is used to set the custom tooltip with currency formatter and legend color in the tooltip
        bothCharts.periodicBenefit.data.tooltip = {
            trigger: 'axis',
            axisPointer: {
                type: 'shadow'
            },
            formatter: function (params) {

                let iconAct = ``;
                let iconTar = ``;
                let x = ``;
                let y = ``;
                let final = ``;  // this will be final string of html code that will be displayed as tooltip content

                if (params[0]) {
                    iconAct = `<span style="background-color:${
                        params[0].color
                      };border: 1px solid ${
                        params[0].color
                      };border-radius:50%;display:inline-block;height:12px;margin-right:6px;margin-botton:2px;width:12px;"></span>`;

                      x = DashBoardUtils.currencyFormatterNoRoundOneDecimal(params[0].value).split("$")[1];

                      final = `Year : ${params[0].name}<br />${iconAct}${params[0].seriesName} : $ ${x}`
                }
                if (params[1]) {
                    iconTar = `<span style="background-color:${
                        params[1].color
                      };border: 1px solid ${
                        params[1].color
                      };border-radius:50%;display:inline-block;height:12px;margin-right:6px;width:12px;"></span>`;
                      y = DashBoardUtils.currencyFormatterNoRoundOneDecimal(params[1].value).split("$")[1];

                      final = final + `<br />${iconTar}Target Benefit : $ ${y}`
                }                
                return final;
            }
        }

        // below code is used to set the data for series with two objects(1.actual benefit (bar) && 2.target benefit (line))
        bothCharts.periodicBenefit.data.series = [{
            type: 'bar',
            name: 'Actual Benefit',
            itemStyle: {
                color: '#00BAFF'
            },
            label: {
                normal: {
                    show: true,
                    formatterFn,
                    // color: '#fff'
                }
            },
            data: _.map(benefitOverviewVTStore.periodicBenefits, 'actualBenefit')
        },
        {
            type: 'line',
            name: 'Target Benefit',
            itemStyle: {
                color: '#F28E2B'
            },
            label: {
                normal: {
                    show: true,
                    formatterFn,
                    // color: '#fff'
                }
            },
            data: _.map(benefitOverviewVTStore.periodicBenefits, 'targetBenefit')
        }];       

        return bothCharts;
    }

    onSelectedViewChange = (opt) => {
        const {selectedView} = this.state;
        this.setState({
            selectedView: opt
        });
        this.getBenOverviewVT(opt.value);
    }

    showNotification = (message, title, type) => {
        if (type === 'error') {
            toast.error(<NotificationMessage
                title={title}
                bodytext={message}
                icon={type}
            />, {
                position: toast.POSITION.BOTTOM_RIGHT
            });
        }
        if (type === 'success') {
            toast.info(<NotificationMessage
                title={title}
                bodytext={message}
                icon={type}
            />, {
                position: toast.POSITION.BOTTOM_RIGHT
            });
        }

    }
   
    render() {
        const { benefitOverviewVTStore } = this.props;
        
        const viewOptions=[
            {'label':'Financial Objective', 'value': 'Financial Objective'},
            {'label':'Business Objective', 'value': 'Business Objective'},
            {'label':'Value Driver', 'value': 'Value Driver'},
            {'label':'Operational KPI', 'value': 'Operational KPI'},
            {'label':'Work Stream', 'value': 'Work Stream'}];

        const { totalCards, selectedView } = this.state;
        return (
            <div className="ben-ove-vt pl-3 pr-3 position-relative w-100">

                <div className="row">
                    <div className="col-lg-3 col-xl-2 mt-3">
                        <div className="row">
                            <div className="form-group col-lg-12 col-md-6">
                                <div className="field-wrap dashb-multi-dd">
                                    <h6 className='vdtLabel'>Select View</h6>

                                    <Select
                                        classNamePrefix="react-select"
                                        closeMenuOnSelect={true}
                                        isMulti={false}
                                        value={selectedView}
                                        isSearchable={false}
                                        components={{
                                            IndicatorSeparator: () => null
                                        }}
                                        size={1}
                                        onChange={(opt) => this.onSelectedViewChange(opt)}
                                        options={viewOptions}
                                    >
                                    </Select>
                                </div>
                            </div>
                        </div>              

                    </div>
                    {benefitOverviewVTStore.loader === false ?
                        <div className="col-lg-9 col-xl-10">
                            <div className="row">
                                {
                                    totalCards && Object.values(totalCards).map((total, ix) => <div key={`total${ix}`} className="col-lg-3 col-md-6 pl-lg-0" ><Card key={`card${ix}`} total={total} /></div>)
                                }
                            </div>
                            <div className="form-group row">
                                {
                                    this.state.charts && Object.values(this.state.charts).map((chart, ix) =>
                                        <div className="col-lg-6 pl-lg-0" key={`chart${ix}`}>
                                            <ChartsVT chart={chart} />
                                        </div>)
                                }
                            </div>
                        </div> 
                        : 
                        <div className="row  spinner-div" style={{ display: "flex", justifyContent: "center", height: '50px' }}>

                            <i className="fa fa-spinner fa-spin" style={{ fontSize: '18px', color: '#ffffff', height: "min-content" }}></i>
                        </div>}


                </div>
            </div>
        );
    }
}

export default BenefitOverviewDashboardVT;