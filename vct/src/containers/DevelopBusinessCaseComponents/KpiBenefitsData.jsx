import React, { Component } from 'react';
import { withRouter } from "react-router-dom";
import { observer, inject } from 'mobx-react';
import KPIBenifits from './KPIBenifits';
import ReviewValueDriverTreeHeader from '../../components/ReviewValueDriverTreeHeader/ReviewValueDriverTreeHeader';
import ValueDriverTreeNew from '../../components/ValueDriverTree/ValueDriverTreeNew';
import '../DevelopBusinessCaseNavbar/developBusinessCaseNavbar.css';
import ReactTooltip from 'react-tooltip';
import CustomConfirmModal from '../../components/CustomConfirmModal/CustomConfirmModal';
import { toast } from 'react-toastify';
import NotificationMessage from '../../components/NotificationMessage/NotificationMessage';

@inject('reviewValueDriverStore', 'editVDTStore', 'kpiBenefitsStore')
@observer

class KpiBenefitsData extends Component {
    constructor(props) {
        super(props);
        this.state = {
            overflowValue: 'auto',
            KPIBenefitsArray: [],
            KPIDetailsArray: [],
            customConfirmKpiDataModalVisible: false,
            customConfirmKpiDataModalTitle: '',
            isLoadingCP: false
        }
        this.kpiClickHandler = this.kpiClickHandler.bind(this)
        this.loadKpiBenefitTree = this.loadKpiBenefitTree.bind(this)
        this.openKpiDataConfirmModal = this.openKpiDataConfirmModal.bind(this);
        this.closeKpiDataConfirmModalHandler = this.closeKpiDataConfirmModalHandler.bind(this);
        this.SwitchKpiConfirm = this.SwitchKpiConfirm.bind(this);
    }

    componentDidMount() {
        const { kpiBenefitsStore, reviewValueDriverStore} = this.props;
        reviewValueDriverStore.getGenerateVDTOnly(true, 'ALL','').then(response => {
            if(response.resultCode !== undefined && response.resultCode === 'OK'){
                this.setState({
                    isLoadingCP: false
                })
            }else{
                this.setState({
                    isLoadingCP: false
                }, () =>{
                    this.showErrorNotification(response.errorDescription);
                })
            }
           
        })
        this.loadKpiBenefitTree();
        kpiBenefitsStore.editBenefitRuleChange = false;
        kpiBenefitsStore.editParamRuleChange = false;
        
    }

    showErrorNotification(text) {
        toast.error(<NotificationMessage
            title="Error"
            bodytext={text}
            icon="error"
        />, {
            position: toast.POSITION.BOTTOM_RIGHT
        });
    }
    componentWillUnmount() {
        const { kpiBenefitsStore } = this.props;
        kpiBenefitsStore.resetSelectedKpiId();
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
            cParamArray: [...this.props.cParamArray]
        }, () => {
            console.log(this.state.KPIBenefitsArray);
        })
    }

    loadKpiBenefitTree() {
        this.setState({
            isLoadingCP: false
        }, ()=>{
            let res = this.props.fetchKpiBenefits()
        if (res) {
            this.setState({
                KPIBenefitsArray: [...this.props.KPIBenefitsArray],
                KPIDetailsArray: this.props.KPIDetailsArray,
                selectedKpiObj: this.props.selectedKpiObj
            }, () => {
                console.log(this.state.KPIBenefitsArray);
            })
        }
        })        
    }
    openKpiDataConfirmModal = (title) => {
        this.setState({
            customConfirmKpiDataModalVisible: true,
            customConfirmKpiDataModalTitle: title
        });
    };
    closeKpiDataConfirmModalHandler = (isYesClicked) => {
        this.setState({
            customConfirmKpiDataModalVisible: false,
            customConfirmKpiDataModalTitle: ''
        });
        if (isYesClicked) {
            //new delete function
            this.SwitchKpiConfirm()
        }
    };
    async SwitchKpiConfirm() {
        const { kpiBenefitsStore } = this.props;
        const { kpiId_modal } = this.state;
        let kpiId = kpiId_modal;
        kpiBenefitsStore.kpiId = kpiId
        let paramArrayTemp = [];

        // set loading indicator while switching kpis and till loadcp returns some response
        this.setState({
            isLoadingCP: true
        });

        // call load common params api whenver switching the kpis
        const cpArrayKpi = await this.fetchParamsForKpiBenefits(kpiId);

        const KPIDetails = kpiBenefitsStore.kpiBenefits;
        let tempArray = KPIDetails;
        KPIDetails.map((kpi, kpiIndex) => {
            kpi.paramDto && kpi.paramDto.map((param, index) => {
                param.data.map((value, valIndex) => {
                    if (typeof value.paramValue === 'object') {
                        if (value.paramValue === null) {
                            tempArray[kpiIndex].paramDto[index].data[valIndex].paramValue = {
                                "actualValue": '',
                                "formattedValue": 0
                            }
                        } else {
                            tempArray[kpiIndex].paramDto[index].data[valIndex].paramValue = value.paramValue
                        }
                    }
                    else {

                        tempArray[kpiIndex].paramDto[index].data[valIndex].paramValue = {
                            "actualValue": value.paramValue,
                            "formattedValue": 0

                        }

                    }
                })
            })
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
                        kpiTrend: kpi.kpiTrend,
                        kpiType: kpi.kpiType,
                        kpiBusType: kpi.kpiBusType,
                    });
                }
            }
        });
        this.setState({
            KPIBenefitsArray: paramArrayTemp,
            KPIDetailsArray: KPIDetails,
            cParamArray: [...cpArrayKpi],
            isLoadingCP: false
        });
    }
    async kpiClickHandler(kpiId, color) {
        const { kpiBenefitsStore } = this.props;
        ReactTooltip.hide()
        kpiBenefitsStore.color = color;
        if ((kpiId !== kpiBenefitsStore.kpiId) && ((kpiBenefitsStore.screenSelected === 'editParam' && kpiBenefitsStore.editParamRuleChange === true) || (kpiBenefitsStore.screenSelected === 'benefit' && kpiBenefitsStore.editBenefitRuleChange === true))) {
            const message = 'You might lose the unsaved data. Do you want to proceed?';
            /* if (!window.confirm(message)) {
                return; }else{} */
            this.setState({
                kpiId_modal: kpiId,
            })
            this.openKpiDataConfirmModal(message)

        } else {
            kpiBenefitsStore.kpiId = kpiId
            let paramArrayTemp = [];

            // set loading indicator while switching kpis and till loadcp returns some response
            this.setState({
                isLoadingCP: true
            });

            // call load common params api whenver switching the kpis
            const cpArrayKpi = await this.fetchParamsForKpiBenefits(kpiId);


            const KPIDetails = kpiBenefitsStore.kpiBenefits;
            let tempArray = KPIDetails;
            KPIDetails.map((kpi, kpiIndex) => {
                kpi.paramDto && kpi.paramDto.map((param, index) => {
                    param.data.map((value, valIndex) => {
                        if (typeof value.paramValue === 'object') {
                            if (value.paramValue === null) {
                                tempArray[kpiIndex].paramDto[index].data[valIndex].paramValue = {
                                    "actualValue": '',
                                    "formattedValue": 0
                                }
                            } else {
                                tempArray[kpiIndex].paramDto[index].data[valIndex].paramValue = value.paramValue
                            }
                        }
                        else {

                            tempArray[kpiIndex].paramDto[index].data[valIndex].paramValue = {
                                "actualValue": value.paramValue,
                                "formattedValue": 0

                            }

                        }
                    })
                })
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
                            kpiTrend: kpi.kpiTrend,
                            kpiType: kpi.kpiType,
                            kpiBusType: kpi.kpiBusType
                        });
                    }
                }
            });
            this.setState({
                KPIBenefitsArray: paramArrayTemp,
                KPIDetailsArray: KPIDetails,
                cParamArray: [...cpArrayKpi],
                isLoadingCP: false
            });
        }
    }

    fetchParamsForKpiBenefits = (clickedKpiId) => {
        const {kpiBenefitsStore} = this.props;
        let comParamArray = [];
        return kpiBenefitsStore.fetchParamsForKpiBenefits(clickedKpiId)
          .then(response => {
            const { data } =  response;
            if (response && !response.error && data.resultCode === 'OK') {
                comParamArray = [...response.data.resultObj];              
            }else if (data.resultCode === 'KO') {
                comParamArray = [];
              this.showErrorNotification(data.errorDescription);
          }
          return comParamArray;
          })
      }

    mandatoryCheck(kpiData) {
        //console.log(kpiData[0].baseline)
        if (kpiData[0].baseline === null || kpiData[0].target === null || kpiData[0].targetAchieved === null || kpiData[0].targetAchieved === "") {
            return false;
        }
        //console.log(kpiData[0].target)
        return true;
    }

    render() {
        const { kpiBenefitsStore } = this.props;
        const { branchTree, } = kpiBenefitsStore;
        const { color, kpiId } = kpiBenefitsStore;
        const {isLoadingCP} = this.state;

        return (
            <div className="benefits row" style={{ margin: '0%' }}>


                <div className="col-sm-12" style={{ display: "inline-flex", padding: "0px", margin: "0px" }}>
                    <div className="vdt-table" style={{
                        padding: "0px", width: "610px", zIndex: 1, background: '#5A5A5A'
                    }}>
                        <div className="row rvdt-header rvdt-header-cd align-self-center " style={{ backgroundColor: '#505050', width: '596px' }}>
                            <ReviewValueDriverTreeHeader isBusinessCase={true} />
                        </div>
                        { !isLoadingCP ?
                            branchTree.length > 0 ?
                                (
                                    <div >
                                        <div key={Math.floor(Math.random() * 1001)} className="col-sm-12" id="vdt" >
                                            <ValueDriverTreeNew
                                                branchTree={branchTree}
                                                isBusinessCase={this.props.isBusinessCase}
                                                kpiClickHandler={this.kpiClickHandler}
                                                currentTabName={'dbcBenefits'}
                                                color={color}
                                                kpiId={kpiId}
                                            />
                                        </div>
                                    </div>
                                ) :
                                <div className="row justify-content-center" style={{ height: '50px' }}>
                                    {/* <h4> <i className="fa fa-exclamation-triangle"></i> No data to load</h4> */}
                                    <i className="fa fa-spinner fa-spin" style={{ fontSize: '18px', color: '#ffffff', height: "min-content" }}></i>
                                </div>:
                                <div className="row justify-content-center" style={{ height: '50px' }}>
                                    {/* <h4> <i className="fa fa-exclamation-triangle"></i> No data to load</h4> */}
                                    <i className="fa fa-spinner fa-spin" style={{ fontSize: '18px', color: '#ffffff', height: "min-content" }}></i>
                                </div>
                        }
                    </div>
                    {(this.state.KPIBenefitsArray.length > 0) ?
                        (this.mandatoryCheck(this.state.KPIBenefitsArray) ?
                            <div className="" style={{ padding: "0px", width: "calc( 100% - 610px )" }}
                            // style={{ background: '#ffffff', marginTop: '0.5%', padding: '0' }}
                            >
                                <KPIBenifits
                                    isLoadingCP={isLoadingCP}
                                    isLoading={this.props.isLoading}
                                    KPIBenefitsArray={this.state.KPIBenefitsArray}
                                    KPIDetailsArray={this.state.KPIDetailsArray}
                                    selectedKpiObj={this.state.selectedKpiObj}
                                    loadKpiBenefitTree={this.loadKpiBenefitTree}
                                    fetchKpiBenefits={this.props.fetchKpiBenefits}
                                    handleDownload={this.props.handleDownload}
                                    handleupload={this.props.handleupload}
                                    onIngestHandle={this.props.onIngestHandle}
                                    cParamArray={this.state.cParamArray}
                                    fetchParamsForKpiBenefits={this.fetchParamsForKpiBenefits}
                                    //onSortEnd = {this.props.onSortEnd}
                                    //beforeSorting ={this.props.beforeSorting}
                                    //hideTooltips = {this.props.hideTooltips}
                                />
                            </div>
                            :
                            <div className="col-sm-6">
                                <div className="dtMsg" style={{ marginTop: '2%', position: 'sticky', top: '0' }}><p style={{ fontSize: "25px", marginBottom: "-15px" }}>Data not found</p><br />
                    Please fill the mandatory data in Finalize Value Driver Tree.</div></div>)
                        :
                        <div className="col-sm-6" style={{ display: 'flex', justifyContent: 'center', background: "#5A5A5A", marginTop: '0.5%' }}>
                            <i className="fa fa-spinner fa-spin" style={{ fontSize: '18px', color: '#ffffff', height: "min-content" }}></i>
                        </div>}
                </div>
                <CustomConfirmModal
                    ownClassName={'KpiBenefitsData-modal'}
                    isModalVisible={this.state.customConfirmKpiDataModalVisible}
                    modalTitle={this.state.customConfirmKpiDataModalTitle}
                    closeConfirmModal={this.closeKpiDataConfirmModalHandler}
                />
            </div >
        );
    };
}

export default withRouter(KpiBenefitsData);
