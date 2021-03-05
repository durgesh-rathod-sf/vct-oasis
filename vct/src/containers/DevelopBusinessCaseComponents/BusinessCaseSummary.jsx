
import React, { Component } from 'react';
import { withRouter } from "react-router-dom";
import ReviewValueDriverTreeHeader from '../../components/ReviewValueDriverTreeHeader/ReviewValueDriverTreeHeader';
import ValueDriverTreeNew from '../../components/ValueDriverTree/ValueDriverTreeNew';
import { observer, inject } from 'mobx-react';
import MaterialTable from "material-table";
import './BusinessCaseSummary.css';
import { MuiThemeProvider } from '@material-ui/core';
import { createMuiTheme } from '@material-ui/core/styles';
import { forwardRef } from 'react';
import AddBox from '@material-ui/icons/AddBox';
import ArrowDownward from '@material-ui/icons/ArrowDownward';
import Check from '@material-ui/icons/Check';
import ChevronLeft from '@material-ui/icons/ChevronLeft';
import ChevronRight from '@material-ui/icons/ChevronRight';
import Clear from '@material-ui/icons/Clear';
import DeleteOutline from '@material-ui/icons/DeleteOutline';
import Edit from '@material-ui/icons/Edit';
import FilterList from '@material-ui/icons/FilterList';
import FirstPage from '@material-ui/icons/FirstPage';
import LastPage from '@material-ui/icons/LastPage';
import Remove from '@material-ui/icons/Remove';
import SaveAlt from '@material-ui/icons/SaveAlt';
import Search from '@material-ui/icons/Search';
import ViewColumn from '@material-ui/icons/ViewColumn';
import { toast } from 'react-toastify';
import NotificationMessage from '../../components/NotificationMessage/NotificationMessage';
import NumberFormat from 'react-number-format';
import downloadIco from "../../assets/project/fvdt/download.svg";
import ReactTooltip from 'react-tooltip';
import infoIcon from "../../assets/project/fvdt/info-Icon.svg";
import finmodeImg from "../../assets/project/fvdt/finMode.svg";
import nonfinmodeImg from "../../assets/project/fvdt/nonFinMode.svg";
var SessionStorage = require('store/storages/sessionStorage');

const tableIcons = {
    Add: forwardRef((props, ref) => <AddBox {...props} ref={ref} />),
    Check: forwardRef((props, ref) => <Check {...props} ref={ref} />),
    Clear: forwardRef((props, ref) => <Clear {...props} ref={ref} />),
    Delete: forwardRef((props, ref) => <DeleteOutline {...props} ref={ref} />),
    DetailPanel: forwardRef((props, ref) => <ChevronRight {...props} ref={ref} />),
    Edit: forwardRef((props, ref) => <Edit {...props} ref={ref} />),
    Export: forwardRef((props, ref) => <SaveAlt {...props} ref={ref} />),
    Filter: forwardRef((props, ref) => <FilterList {...props} ref={ref} />),
    FirstPage: forwardRef((props, ref) => <FirstPage {...props} ref={ref} />),
    LastPage: forwardRef((props, ref) => <LastPage {...props} ref={ref} />),
    NextPage: forwardRef((props, ref) => <ChevronRight {...props} ref={ref} />),
    PreviousPage: forwardRef((props, ref) => <ChevronLeft {...props} ref={ref} />),
    ResetSearch: forwardRef((props, ref) => <Clear {...props} ref={ref} />),
    Search: forwardRef((props, ref) => <Search {...props} ref={ref} />),
    SortArrow: forwardRef((props, ref) => <ArrowDownward {...props} ref={ref} />),
    ThirdStateCheck: forwardRef((props, ref) => <Remove {...props} ref={ref} />),
    ViewColumn: forwardRef((props, ref) => <ViewColumn {...props} ref={ref} />)
};
// import Typography from "@material-ui/core/Typography";

const theme = createMuiTheme({
    root: {
        padding: '2px'
    },
});

@inject("businessCaseSummaryStore", "reviewValueDriverStore", "kpiBenefitsStore")
@observer

class BusinessCaseSummary extends Component {

    constructor(props) {
        super(props);
        this.state = {
            fileName: null,
            businessCaseSummaryObj: [],
            npvObj: {},
            counter: 0,
            summaryArray: [],
            npv: "",
            cpc: "",
            cpcUnit: "%",
            selectedMode: "FINANCIAL",
            loadingVDTMode: false,
            saveProgress: false
        }
        this.downloadBusinessCaseTemplate = this.downloadBusinessCaseTemplate.bind(this);
        this.onCostCapitalChange = this.onCostCapitalChange.bind(this);
        this.buildSummaryArray = this.buildSummaryArray.bind(this);
        this.saveNPV = this.saveNPV.bind(this);
        this.KPIsWithoutBusinessCase = []
    }

    getBusinessCaseSummaryFromStore = (businessCaseSummaryStore) => {
        businessCaseSummaryStore.getBusinessCaseSummary(this.state.selectedMode)
            .then((res) => {
                if (res.error) {
                    return {
                        error: true
                    }
                } else {
                    let businessCaseData = res;
                    if (this.state.selectedMode === "NON_FINANCIAL") {
                        businessCaseData = [
                            { ...res.filter(data => data.name === "Total Benefits")[0], year_1: "-", year_2: "-", year_3: "-", year_4: "-", year_5: "-", total: "-" },
                            ...res.filter(data => data.name !== ("Total Benefits" || "Total CashFlow"))
                        ]
                    }
                    this.KPIsWithoutBusinessCase = businessCaseData.filter(data => data.kpiBusType === "WITHOUT_BUS_CASE").map(kpiData => kpiData.name)
                    this.setState({
                        businessCaseSummaryObj: businessCaseData
                    }, () => this.state.selectedMode === "FINANCIAL" && this.buildSummaryArray(this.state.businessCaseSummaryObj))
                    businessCaseSummaryStore.getNPV()
                        .then((response) => {
                            if (response === "No data for this map_id") {
                                this.setState({
                                    npv: "",
                                    cpc: "",
                                    cpcUnit: "%"
                                })
                            }
                            else {
                                this.setState({
                                    npv: response.net_present_value,
                                    cpc: response.cost_capital,
                                    cpcUnit: response.cost_capital_unit
                                })
                            }
                            // }
                        })
                }

            })
    }

    componentDidMount() {
        const { businessCaseSummaryStore, reviewValueDriverStore } = this.props;

        this.setState({
            loadingVDTMode: true
        }, () => {
            reviewValueDriverStore.getGenerateVDTOnly(false, this.state.selectedMode, "Business Case Summary")
                .then(response => {
                    this.setState({
                        loadingVDTMode: false
                    })
                    if (response && response.resultCode === 'OK') {
                    } else if (response && response.resultCode === 'KO') {
                        this.showNotification('error', response.errorDescription);
                    }
                })
        })

        this.getBusinessCaseSummaryFromStore(businessCaseSummaryStore)
    }
    saveNPV = (CPC) => {
        const { businessCaseSummaryStore } = this.props;
        const { npv, cpcUnit } = this.state;
        const nPV = npv;
        //    .replace(/,/g, '');
        businessCaseSummaryStore.saveNpv(nPV, CPC, cpcUnit)
            .then((res) => {
                if (res && !res.error) {
                     this.showNotification('saveSuccess')
                    this.setState({
                        npv: businessCaseSummaryStore.npvSaveValue
                    })
                }
                else {
                    const msg = businessCaseSummaryStore.errorMsg;
                    this.showNotification('saveError', msg)
                }
                this.setState ({
                    saveProgress: false
                })
            })
    }

    getTableCellBackgroundColor = (cellData) => {
        return this.state.selectedMode === "FINANCIAL"
            ?
            ((cellData.indexOf('(F)') > -1) ? '#66bbff' :
                ((cellData.indexOf('(B)') > -1) ? '#6694ff' :
                    ((cellData.indexOf('(V)') > -1) ? '#008bbf' :
                        ((cellData.indexOf('(K)') > -1) && this.KPIsWithoutBusinessCase.filter(data => data === cellData).length > 0) ? "#909090" :
                            ((cellData.indexOf('(K)') > -1) ? "#006abf" :
                                "#5A5A5A"))))
            :
            ((cellData.indexOf('(F)') > -1) ? '#E0B0FF' :
                ((cellData.indexOf('(B)') > -1) ? '#C161FF' :
                    ((cellData.indexOf('(V)') > -1) ? '#A212FF' :
                        //((cellData.indexOf('(K)') > -1) && this.KPIsWithoutBusinessCase.filter(data => data === cellData).length > 0) ? "#909090" :
                        ((cellData.indexOf('(K)') > -1) ? "#39285f" :
                            "#5A5A5A"))))
    }

    buildSummaryArray = (res) => {

        const TotCashFlow = res[2];
        let CashFlowArr = []; //[T1,T2,...]
        var yVal = "";
        for (let i = 1; i <= 10; i++) {
            yVal = ("year_" + i);
            if (TotCashFlow[yVal] !== undefined) {
                CashFlowArr.push(TotCashFlow[yVal]);
            }
        }

        let TempArray = [{
            title: '', field: 'name', width: 100, rowStyle: { height: '5px' },
            cellStyle: cellData => {
                return {
                    backgroundColor: this.getTableCellBackgroundColor(cellData),
                    color: "#FFFFFF",
                    fontWeight: 500,
                    fontFamily: 'Graphik',
                    fontSize: '12px',
                    borderRight: "1px solid rgb(144, 144, 144)",
                    borderBottom: "1px solid rgb(144, 144, 144)",
                    overflowX: 'hidden',
                    textAlignLast: 'left',
                    minWidth: 50
                }
            },
            headerStyle: {
                minWidth: 50
            },

        }]
        for (let j = 1; j <= CashFlowArr.length; j++) {
            let y_val = ("year_" + j);
            let val = ("Year " + j);
            TempArray.push({
                title: val, field: y_val,
                cellStyle: {
                    minWidth: "50px",
                    fontSize: '10px',
                    padding: '2px',
                    borderRight: "1px solid rgb(144, 144, 144)",
                    borderBottom: "1px solid rgb(144, 144, 144)",
                    overflowX: 'hidden',
                    textAlignLast: 'right',
                    fontFamily: 'Graphik',
                    backgroundColor: "#5A5A5A",
                    color: "#FFFFFF"
                }
            })
        }
        TempArray.push({
            title: 'Total', field: 'total', tooltip: 'This is tooltip text ',
            cellStyle: {
                backgroundColor: "#5A5A5A",
                color: "#ffffff",
                fontFamily: 'Graphik',
                borderRight: "1px solid rgb(144, 144, 144)",
                borderBottom: "1px solid rgb(144, 144, 144)",
                minWidth: "100px", fontSize: '10px', overflowX: 'hidden', textAlignLast: 'right'
            }
        })
        this.setState({
            buildSummaryArray: TempArray
        })
    }
    cpcValue = 0;
    cpcValueChanged = false;
    frameCostOfCaptialValue = (event) => {
        this.cpcValueChanged = true;
        this.cpcValue = event.target.value
    }
   
    onCostCapitalChange = (event) => {
        let CPC = this.cpcValueChanged ? this.cpcValue : this.state.cpc;
       // let CPC = event.target.value;

        if (isNaN(CPC) || parseInt(CPC) < 0) {
            CPC = "";
        }

        // for (let i = 1; i <= 10; i++) {
        //     yVal = ("year_" + i);
        //     if (TotCashFlow[yVal] !== undefined) {
        //         CashFlowArr.push(TotCashFlow[yVal]);
        //     }
        // }
        // var sum = 0;
        // for (let j = 1; j <= CashFlowArr.length; j++) {
        //     let temp = Number(CashFlowArr[j - 1].replace(/,/g, '')) / Math.pow((1 + (Number(CPC)/100)), j);
        //     sum = sum + temp;
        // }
        // if (CPC === "") {
        //     sum = ""
        // }

        this.setState({
            // npv: sum.toLocaleString(),
            cpc: CPC,
            saveProgress: true
        })


        this.saveNPV(CPC)



    }

    downloadBusinessCaseTemplate = (event) => {
        const { businessCaseSummaryStore } = this.props;
        businessCaseSummaryStore.downloadBusinessCaseTemplate()
            .then((res) => {
                if (!res || res.error) {
                    this.showNotification('downloadError')
                }
            })
    }

    showNotification(type, msg) {
        switch (type) {
            case 'saveSuccess':
                toast.info(<NotificationMessage
                    title="Success"
                    bodytext={'NPV saved successfully'}
                    icon="success"
                />, {
                    position: toast.POSITION.BOTTOM_RIGHT
                });
                break;
            case 'saveError':
                toast.error(<NotificationMessage
                    title="Error"
                    bodytext={msg}
                    icon="error"
                />, {
                    position: toast.POSITION.BOTTOM_RIGHT
                });
                break;
            case 'downloadError':
                toast.error(<NotificationMessage
                    title="Error"
                    bodytext={'Error in downloading the template'}
                    icon="error"
                />, {
                    position: toast.POSITION.BOTTOM_RIGHT
                });
                break;
            default:
                break;
        }
    }

    vdtModeChange() {
        const { reviewValueDriverStore, businessCaseSummaryStore } = this.props;
        this.setState({
            selectedMode: this.state.selectedMode === "FINANCIAL" ? "NON_FINANCIAL" : "FINANCIAL",
            loadingVDTMode: true
        }, () => {
            reviewValueDriverStore.getGenerateVDTOnly(false, this.state.selectedMode, "Business Case Summary")
                .then(response => {
                    this.setState({
                        loadingVDTMode: false
                    })
                    if (response && response.resultCode === 'OK') {
                    } else if (response && response.resultCode === 'KO') {
                        this.showNotification('error', response.errorDescription);
                    }
                })
            this.getBusinessCaseSummaryFromStore(businessCaseSummaryStore)
        })
    }

    render() {
        const { reviewValueDriverStore } = this.props;
        const {
            branchTree
        } = reviewValueDriverStore
        const { loadingVDTMode, selectedMode } = this.state
        const getTooltipData = (value) => {
            if (value) {
                let val = String(value).replace(/(?<!\..*)(\d)(?=(?:\d{3})+(?:\.|$))/g, '$1,');
                return `${val}`;
            }
        }
        return (
            <MuiThemeProvider theme={theme}>

                <div className="BusinessCase-Icon">
                    <div className="iconCircle" style={{ paddingTop: "7px" }} onClick={
                        () => !loadingVDTMode && this.vdtModeChange()
                    }>
                        <img src={selectedMode === "FINANCIAL" ? finmodeImg : nonfinmodeImg} alt="vdt mode" className="" data-tip="" data-for="toggle_fin"
                            style={{ opacity: ((loadingVDTMode) ? "0.5" : "1"), cursor: loadingVDTMode ? "pointer" : "default" }} />
                        <ReactTooltip id="toggle_fin" className="tooltip-class">
                            <span>{selectedMode == "FINANCIAL" ? "Display Financial Objective" : "Display Non-Financial Objective"}</span>
                        </ReactTooltip>
                    </div>
                    <div className="iconCircle">
                        <img src={downloadIco} alt="download"
                            onClick={this.props.handleDownload} style={{
                                cursor: "pointer", marginTop: "5px",
                            }}
                            data-tip=""
                            data-for="kpib-download-tooltip"
                            data-place="top"
                        />
                        <ReactTooltip id="kpib-download-tooltip" className="tooltip-class">
                            <span>Generate Data Template</span>
                        </ReactTooltip>
                    </div>
                </div>
                <div className="BCS row" style={{ margin: "0%" }}>
                    <div className="row col-sm-12" style={{ padding: "0px", margin: "0px" }}>
                        <div className="vdt-table" style={{ padding: "0px", width: "610px" }}>
                            <div className="row rvdt-header rvdt-header-cd align-self-center " style={{ backgroundColor: '#505050', width: '596px' }}>
                                <ReviewValueDriverTreeHeader isBusinessCase={true} />
                            </div>
                            {
                                (branchTree.length > 0 && !loadingVDTMode) ?
                                    (
                                        <div >
                                            <div key={Math.floor(Math.random() * 1001)} className="col-sm-12" id="vdt">
                                                <ValueDriverTreeNew
                                                    branchTree={branchTree}
                                                    isBenefitActuals={false}
                                                    isBusinessCase={this.props.isBusinessCase}
                                                />
                                            </div>
                                        </div>
                                    ) :
                                    <div className="row justify-content-center" style={{ height: '50px' }}>
                                        <i className="fa fa-spinner fa-spin" style={{ fontSize: '18px', color: '#ffffff', height: "min-content" }}></i>
                                    </div>
                            }
                        </div>
                        <div className="" style={{ padding: "0% 1%", width: "calc( 100% - 610px )" }}>
                            <div className="row" style={{ backgroundColor: "#505050", height: "47px", margin: "1% 0%" }}>
                                <div className="row col-sm-6" style={{ margin: "0px" }}>
                                    <label className="label-BCS">Cost of Capital (%) :</label>
                                    {
                                        this.state.selectedMode === "FINANCIAL"
                                        &&
                                        <input type="number"
                                            min="0"
                                            disabled={(SessionStorage.read("isMaster") === "Y" || (SessionStorage.read("accessType") === "Read")) ? true : false}
                                            className="cpc" defaultValue={this.state.cpc} onChange={(e) => this.frameCostOfCaptialValue(e)} />
                                    }

                                     {this.state.selectedMode === "FINANCIAL" ?
                                     <div>
                                        <span className="fa fa-calculator calcIcon" style={{ cursor: this.state.saveProgress ? 'wait' : 'pointer' }} onClick={this.onCostCapitalChange}></span>
                                    </div> : "" }

                                </div>
                                <div className="row col-sm-5" style={{ margin: "0px" }}>
                                    <label className="label-BCS">NPV ($) :  </label>
                                    <p style={{ margin: "0px", alignSelf: "center" }}
                                        data-tip={getTooltipData(
                                            this.state.npv ? this.state.npv : null
                                        )}>
                                        {
                                            this.state.selectedMode === "FINANCIAL"
                                            &&
                                            <NumberFormat
                                                thousandSeparator={true}
                                                value={this.state.npv !== "" ? Number(this.state.npv).toFixed(1) : null}
                                                disabled={true}
                                                className="npvStyle" />
                                        }

                                        <ReactTooltip />
                                    </p>
                                </div>
                                <div className="col-sm-1" style={{ padding: "0px", alignSelf: "center" }}>
                                    <div style={{ width: "10%" }} data-tip="" data-for="kpib-target-info-tooltip"
                                        data-place="left">
                                        <img src={infoIcon} alt="info" style={{ width: "18px" }} />
                                    </div>
                                    <ReactTooltip id="kpib-target-info-tooltip" className="tooltip-class">
                                        <span> *KPIs without Financial Benefits are not included in the NPV calculation </span>
                                    </ReactTooltip>
                                </div>
                            </div>
                            <div style={{ backgroundColor: '#505050', position: 'sticky', top: '0' }}>
                                {/* <div className="row tab" style={{ justifyContent: "flex-end", padding:'1%' }}>
                                    <button className="inv_button" style={{ maxWidth: '30%' }} onClick={this.downloadBusinessCaseTemplate}>
                                        Download Business Case Template
                                </button>
                                </div> */}
                                <div className="row mt-5" style={{ marginTop: '1rem' }}></div>
                                
                                {
                                    this.state.loadingVDTMode
                                        ?
                                        <div className="row justify-content-center" style={{ height: '50px' }}>
                                            <i className="fa fa-spinner fa-spin" style={{ fontSize: '18px', color: '#ffffff', height: "min-content" }}></i>
                                        </div>
                                        :
                                        
                                        <MaterialTable
                                            style={{ backgroundColor: "#5A5A5A", boxShadow: "none" }}
                                            icons={tableIcons}
                                            options={{
                                                search: false,
                                                paging: false,
                                                sorting: false,
                                                cellStyle: {

                                                    background: "#5A5A5A",
                                                    border: " 1px solid #909090",
                                                    // border: '1.5px solid #adb5bd',
                                                    fontSize: '12px',
                                                    verticalAlign: 'middle',
                                                    fontFamily: 'Graphik',
                                                    // borderTop: '1px solid #dee2e6',
                                                    // marginBottom: '1rem',
                                                    color: '#FFFFFF',

                                                },
                                                headerStyle: {
                                                    border: '1px solid #909090',
                                                    fontSize: '10px',
                                                    fontWeight: 600,
                                                    fontFamily: 'Graphik',
                                                    color: '#FFFFFF',
                                                    textAlignLast: 'center',
                                                    backgroundColor: '#505050',
                                                    height: "47px"
                                                },
                                                rowStyle: {
                                                    height: '20px',
                                                    border: '1px solid #909090',

                                                }
                                            }}

                                            title=""
                                            data={this.state.businessCaseSummaryObj}

                                            columns={this.state.buildSummaryArray}

                                            parentChildData={(row, rows) => rows.find(a => a.id === row.parentId)}

                                        />
                                }
                            </div>
                        </div>
                    </div>
                </div>
            </MuiThemeProvider>
        )
    }
}

export default withRouter(BusinessCaseSummary);
