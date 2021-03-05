import React from 'react';
import DashBoardUtils from './DashboardUtils';
import "./ValueTrackingTabs.css";
import * as _ from "lodash";
import { inject, observer } from 'mobx-react';
import NotificationMessage from "../../components/NotificationMessage/NotificationMessage";
import Card from './Card';
import { toast } from 'react-toastify';
import ChartsVT from "./ChartsVT";
import ValueDriverTreeNew from '../../components/ValueDriverTree/ValueDriverTreeNew';
import ReviewValueDriverStore from '../../stores/ReviewValueDriverStore';
import { toJS } from "mobx";
import VDTBranch from '../../components/vdt/VDTBranch';
let graphs = {
    ValueDriverTree: {

      label: '',
      data: {
        backgroundColor: 'transparent',
        tooltip: {
          trigger: 'item',
          triggerOn: 'mousemove'
        },
        series: []
      }
    }
  };

let mockcards = {
    ExpectedBenefitsFinal:
    {
        label: 'EXPECTED BENEFITS OVER TIME',
        value: '$ 0',
        subvalue: '',
        icon: 'benefits'
    },
    ExpectedBenefits:
    {
        label: 'EXPECTED BENEFITS TILL DATE',
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

@inject('projectOverviewDashboardStore')
@observer
class ProjectOverviewDashboard extends React.Component {

    constructor(props) {
        super();
        this.state = {             
            totalCards: mockcards,
            charts: graphs,
            treeHeight: '400px',            
            apiError: false
        }
    }

    getProjectOverview = () => {
        const { projectOverviewDashboardStore } = this.props;
        
        projectOverviewDashboardStore.getProjectOverview()
            .then(response => {

                if (response && response.data && response.data.resultCode === "OK") {
                    
                    const allCards = this.populateAllCards();
                    // const lhsdata = this.populateBothCharts();
                    const chartData = this.populateValueDriverTreeChart();
                    const heightCal = this.calculateTreeHeight(chartData.kpiCount);
                    this.setState({
                        totalCards: allCards,
                        charts: chartData.chartObj,
                        treeHeight: heightCal
                    });

                } else if(response && response.data && response.data.resultCode === "KO"){
                    this.showNotification(response.data.errorDescription, "Error", "error");
                    let graphs2 = JSON.parse(JSON.stringify(graphs));
                    
                    this.setState({ 
                        apiError: !this.state.apiError,
                        totalCards: mockcards,
                        charts: graphs2
                     });

                } else {
                    this.showNotification("Sorry! Something went wrong", "Error", "error");
                    let graphs2 = JSON.parse(JSON.stringify(graphs));
                    
                    this.setState({ 
                        apiError: !this.state.apiError,
                        totalCards: mockcards,
                        charts: graphs2 
                    });

                }
            });        
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


    componentDidMount() {
        // this.setState({ charts: graphs });
        
        this.getProjectOverview();
    }

    populateAllCards = () => {
        const {projectOverviewDashboardStore} = this.props;
        const {totalCards} = this.state;
        let allCardsData = JSON.parse(JSON.stringify(totalCards));
        
        allCardsData.ExpectedBenefitsFinal.value = DashBoardUtils.currencyFormatter(projectOverviewDashboardStore.expectedTotalBenefitFinalYear)
        allCardsData.ExpectedBenefits.value = DashBoardUtils.currencyFormatter(projectOverviewDashboardStore.expectedTotalBenefitCurrentYear)
        allCardsData.ActualBenefits.value = DashBoardUtils.currencyFormatter(projectOverviewDashboardStore.actualTotalBenefitCurrentYear)
        allCardsData.BenefitVariance.value = DashBoardUtils.currencyFormatter(projectOverviewDashboardStore.benefitVarianceCurrentYear);

        allCardsData.BenefitVariance.className = (projectOverviewDashboardStore.benefitVarianceCurrentYear && parseFloat(projectOverviewDashboardStore.benefitVarianceCurrentYear) > 0)
         ? 'green' : 'red';

        allCardsData.ExpectedBenefitsFinal.subvalue = 'by ' + projectOverviewDashboardStore.benefitFinalYear;
        allCardsData.ExpectedBenefits.subvalue = 'by ' + projectOverviewDashboardStore.benefitCurrentYear;
        allCardsData.ActualBenefits.subvalue = 'by ' + projectOverviewDashboardStore.benefitCurrentYear;
        allCardsData.BenefitVariance.subvalue = 'by ' + projectOverviewDashboardStore.benefitCurrentYear;

        return allCardsData;

    }

    calculateTreeHeight = (kpiCount) => {

        let formula = kpiCount * 50;
        return `${formula}px`;
    }

    formTreeData = (treeObj) => {
        
        let tempArr = [];

        let kpiCount = 0;

        const isOnTarget = (value) => {
            if (value) {
                return '#339933';
            } else {
                return '#E15759';
            }
        }
        
        Object.keys(treeObj).map((sobj, sInd) => {
            tempArr.push({
                name: sobj,
                collapsed: false,
                children: []
            });
            Object.keys(treeObj[sobj]).map((fobj, fInd) => {
                tempArr[sInd].children.push({
                    name: fobj,
                    collapsed: false,
                    children: []
                });
                Object.keys(treeObj[sobj][fobj]).map((bobj, bInd) => {
                    tempArr[sInd].children[fInd].children.push({
                        name: bobj,
                        collapsed: false,
                        children: []
                    });
                    Object.keys(treeObj[sobj][fobj][bobj]).map((vobj, vInd) => {
                        tempArr[sInd].children[fInd].children[bInd].children.push({
                            name: vobj,
                            collapsed: false,
                            children: []
                        });
                        Object.values(treeObj[sobj][fobj][bobj][vobj]).map((kobj, kInd) => {
                            kpiCount = kpiCount + 1;
                            tempArr[sInd].children[fInd].children[bInd].children[vInd].children.push({
                                name: kobj.kpiName,
                                collapsed: false,
                                itemStyle: {
                                    color: isOnTarget(kobj.kpiOnTarget)
                                }
                            });
                        });
                            

                        })
                    })
                })
                
            });
            
            let tempObj = {
                'treeDataArray': tempArr,
                'kpiCount': kpiCount
            }

        return tempObj;
    }

    populateValueDriverTreeChart = () => {

        const {projectOverviewDashboardStore} = this.props;
        const {charts} = this.state;
        const chartsClone = JSON.parse(JSON.stringify(charts));
             
        const returnObj = this.formTreeData(projectOverviewDashboardStore.vdtTreeObject);
        // const data = traverse(projectOverviewDashboardStore.vdtTreeObject)[0];

        chartsClone.ValueDriverTree.data.tooltip = {
            trigger: 'item',
            triggerOn: 'mousemove',
            formatter: function (params) {
                let x = params.name;
                return x;
            }
          };
    
        chartsClone.ValueDriverTree.data.series = [
          {
            type: 'tree',
            data: returnObj.treeDataArray,
            top: '1%',
            left: '8%',
            bottom: '1%',
            right: '10%',
            symbol: 'circle',
            symbolSize: 11,
            lineStyle: {
                color: '#00BAFF',
            },
            itemStyle: {                        
                borderWidth: 0,
                color: '#00BAFF'
            },
            label: {
              position: 'top',
              verticalAlign: 'middle',
              align: 'center',
              color: '#fff',
              fontSize: 10,
              padding: [10, 0],
              formatter: function (params) {
                let x = `${(params.name.length > 28) ? `${params.name.substr(0, 27)}...` : (params.name)}`;
                return x;
            }
            },
            leaves: {
              label: {
                position: 'top',
                verticalAlign: 'middle',
                align: 'center',
                // padding: [0,0,55,0]
              }
            },
            expandAndCollapse: true,
            animationDuration: 550,
            animationDurationUpdate: 750
          }
        ];

        let retObj = {
            'chartObj': chartsClone,
            'kpiCount': returnObj.kpiCount
        }
        return retObj;
      }

    render() {

        const {projectOverviewDashboardStore} = this.props;
        const {totalCards, treeHeight} = this.state;
        const {
            strategicObjectives,
            branchTree,
            dataTree,
            operationKpiIds,
            operationalKpIs, showVdtLoading
          } = projectOverviewDashboardStore;

        return (
            <div className="pl-3 pr-3 position-relative w-100 pro-over-tree">               

                {projectOverviewDashboardStore.loader === false ?
                    <div>
                        <div className="row">
                            <div className="col-lg-12 col-xl-12">
                                <div className="row pl-lg-3">
                                    {
                                        totalCards && Object.values(totalCards).map((total, ix) => <div key={`total${ix}`} className="col-lg-3 col-md-6 pl-lg-0" ><Card key={`card${ix}`} total={total} /></div>)
                                    }
                                </div>
                            </div>
                        </div>
                        <div className="row vdt-main-heading">
                            <div className="col-lg-12 col-xl-12">
                                <span>VALUE DRIVER TREE</span>
                            </div>
                        </div>

                        <div className="tree-chart">
                            <div className="row vdt-headings-row">
                                <div className="vdt-name pl-3"><label style={{ position:'relative', left:'-68px'}}>Strategic Objective</label></div>
                                <div className="vdt-name"><span>Financial Objective</span></div>
                                <div className="vdt-name"><span>Business Objective</span></div>
                                <div className="vdt-name "><span >Value driver</span></div>
                                <div className="vdt-name pr-3"><span>KPI</span></div>
                            </div>
                            <div className=" row mr-0 vdt-tree-wrapper" id = 'projectOverviewDashboard'>
                            <VDTBranch page="projectOverviewDashboard" level={1} branchTree={toJS(dataTree)} 
           
            vdtValues={this.props.projectOverviewDashboardStore.vdtValues} editNode={this.state.editNode} onSetName={(t, n) => this.onSetName(t, n)}
          ></VDTBranch>

                        
                            </div>
                            <div className="form-group row">
                                <div className="col-lg-12">
                                    <span className="tree-legends-row">
                                        <span className="red-legend">
                                        </span> <span className="pr-3">KPI Off Target</span>
                                        <span className="green-legend">
                                        </span><span>KPI On Target</span>
                                    </span> 
                                </div>
                            </div>
                        </div>
                    </div>
                    :
                    <div className="row  spinner-div" style={{ display: "flex", justifyContent: "center", height: '50px' }}>

                        <i className="fa fa-spinner fa-spin" style={{ fontSize: '18px', color: '#ffffff', height: "min-content" }}></i>
                    </div>}                    
                
               
                
            </div>
        );
    }
}

export default ProjectOverviewDashboard;