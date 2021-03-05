import React, { Component } from 'react';
import { withRouter } from "react-router-dom";
import { observer, inject } from 'mobx-react';
import '../DevelopBusinessCaseNavbar/developBusinessCaseNavbar.css';
import ReactTooltip from 'react-tooltip';
import BenefitActualsHome from './BenefitActualsHome';

@inject('reviewValueDriverStore', 'editVDTStore', 'kpiBenefitsStore', 'investmentActualsStore')
@observer

class BenefitActualsHomeData extends Component {
    constructor(props) {
        super(props);
        this.state = {
            overflowValue: 'auto',
            KPIBenefitsArray: [],
            KPIDetailsArray: []
        }
        this.fetchKPIDetails = this.fetchKPIDetails.bind(this)
        this.loadKpiBenefitTree = this.loadKpiBenefitTree.bind(this)
    }

    componentDidMount() {
        this.loadKpiBenefitTree();
    }

    componentDidUpdate(prevProps, prevState) {
        if (prevProps.KPIBenefitsArray !== this.props.KPIBenefitsArray || prevProps.KPIDetailsArray !== this.props.KPIDetailsArray) {
            this.test()
        }
    }

    test() {
        this.setState({
            KPIBenefitsArray: [...this.props.KPIBenefitsArray],
            KPIDetailsArray: this.props.KPIDetailsArray,
            selectedKpiObj: this.props.selectedKpiObj,
        }, () => {
            console.log('');
        });
    }

    loadKpiBenefitTree() {
        let res = this.props.fetchKpiBenefits()
        if (res) {
            this.setState({
                KPIBenefitsArray: [...this.props.KPIBenefitsArray],
                KPIDetailsArray: this.props.KPIDetailsArray,
                selectedKpiObj: this.props.selectedKpiObj
            }, () => {
                console.log('');
            })
        }
    }

    fetchKPIDetails = (kpiId, color) => {
        const { kpiBenefitsStore } = this.props;
        ReactTooltip.hide()
        kpiBenefitsStore.color = color
        kpiBenefitsStore.kpiId = kpiId
        let paramArrayTemp = []
        const KPIDetails = kpiBenefitsStore.kpiBenefits;
        let tempArray = KPIDetails;
        KPIDetails.map((kpi, kpiIndex) => {
            kpi.paramDto.map((param, index) => {
                param.paramValues.map((value, valIndex) => {
                    if (typeof value.paramValue === 'object') {
                        if (value.paramValue === null) {
                            tempArray[kpiIndex].paramDto[index].paramValues[valIndex].paramValue = {
                                "actualValue": '',
                                "formattedValue": 0
                            }
                        } else {
                            tempArray[kpiIndex].paramDto[index].paramValues[valIndex].paramValue = value.paramValue
                        }
                    }
                    else {

                        tempArray[kpiIndex].paramDto[index].paramValues[valIndex].paramValue = {
                            "actualValue": value.paramValue,
                            "formattedValue": 0

                        }
                     }
                     return true
                })
                return true
            })
            return true
        })
        tempArray.map((kpi) => {
            if (kpiId === kpi.kpiId) {
                if (paramArrayTemp.length === 0) {
                    paramArrayTemp.push({
                        kpiId: kpi.kpiId,
                        kpiUnit: kpi.opKpiUnit,
                        baseline: kpi.baseline,
                        target: kpi.target,
                        targetAchieved: kpi.targetAchieved,
                        paramDto: kpi.paramDto,
                        kpiBenefits: kpi.kpiBenefits,
                        kpiTrend: kpi.kpiTrend
                    })
                }
            }
            return true;
        });        
        this.setState({
            KPIBenefitsArray: paramArrayTemp,
            KPIDetailsArray: KPIDetails
        })
    }
    mandatoryCheck(kpiData) {
        if (kpiData[0].baseline === null || kpiData[0].target === null || kpiData[0].targetAchieved === null || kpiData[0].targetAchieved === "") {
            return false;
        }
        else {
            return true;
        }
    }

    render() {
        return (
            <div className="row" style={{marginTop: '2%',marginBottom:"5%", position:'sticky', top:'0',zIndex:'99' }}>
                <div className="col-sm-12" style={{ display: "inline-flex",padding:"0px" }}>{this.state.KPIBenefitsArray.length > 0 ?
                        (this.mandatoryCheck(this.state.KPIBenefitsArray) ?
                            <div style={{  marginTop: '0.5%', width: "-webkit-fill-available" }}>
                                <BenefitActualsHome
                                 onExpandClick={this.props.onExpandClick}
                                    KPIBenefitsArray={this.state.KPIBenefitsArray}
                                    KPIDetailsArray={this.state.KPIDetailsArray}
                                    selectedKpiObj={this.state.selectedKpiObj}
                                    loadKpiBenefitTree={this.loadKpiBenefitTree}
                                    isExpandBenefits={this.props.isExpandBenefits}
                                    branchTree={this.props.branchTree}
                                // addColoumnHandler = {this.addColoumnHandler}
                                />
                            </div>
                            :
                            <div >
                                <div className="dtMsgInCA" style={{ marginTop: '2%', position:'sticky', top:'0' }} >
                                    <p className="mainMsg" style={{ fontSize: "25px", marginBottom: "-15px" }}>Data not found</p><br />
                            Please fill the mandatory data in Finalize Value Driver Tree.
                    </div>
                            </div>
                        )
                        :
                        <div style={{ background: "white", marginTop: '0.5%', width: "-webkit-fill-available" }}>
                            {""}
                        </div>

                        // <i className="fa fa-spinner fa-spin" style={{ fontSize: '18px', color: '#000000' }}></i>
                    }
                    {/* </div> */}
                </div>
            </div >
        )
    }
}

export default withRouter(BenefitActualsHomeData);