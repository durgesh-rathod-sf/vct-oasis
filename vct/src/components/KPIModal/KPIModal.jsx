import React, { Fragment, Component } from 'react';
import Modal from 'react-bootstrap4-modal';
import './kpiModal.css';
import { toast } from 'react-toastify';
import NotificationMessage from '../../components/NotificationMessage/NotificationMessage';
import closeIcon from '../../assets/project/fvdt/modal-close-icon.svg';
import CustomConfirmModal from '../../components/CustomConfirmModal/CustomConfirmModal';
import ReactTooltip from 'react-tooltip';
class KPIModal extends Component {

    constructor(props) {
        super(props);

        this.state = {
            kpiModalDetails: {},
            // madatoryFieldsErr:false,
            isFormDirty: false,
            saveKpiModalVisible: false,
            saveKpiModalTitle: '',
            isEdited: false,
           // kpiCloseIconVisible:false,
        }

        this.modalKpiChange = this.modalKpiChange.bind(this);
        this.saveKpiModal = this.saveKpiModal.bind(this);
        this.closeModal = this.closeModal.bind(this);
    }


    componentDidUpdate(prevProps) {
        //const {kpiDetails} = this.props;

        const tempDetails = JSON.parse(JSON.stringify(this.props.kpiDetails));
        if (prevProps.kpiDetails !== this.props.kpiDetails) {
            this.setState({
                kpiModalDetails: tempDetails
            })
        }
    }

    componentDidMount() {
        const { kpiDetails } = this.props;
       let KpiDetailArray = {...kpiDetails };
       KpiDetailArray.kpiType = kpiDetails.okpiType;
       //KpiDetailArray.kpiBusType = kpiDetails.kpiBusType;
       if(KpiDetailArray.okpiType ==="NON_FINANCIAL"){
        KpiDetailArray.kpiBusType =   "WITHOUT_BUS_CASE";
       }
      
       
        this.setState({
            kpiModalDetails: KpiDetailArray,
            //kpiCloseIconVisible: this.kpiCloseIconDisplay(KpiDetailArray)
        })
    }

    componentWillUnmount() {
        this.setState({
            kpiModalDetails: {}
        })
    }

    showNotification(msg) {
        toast.error(<NotificationMessage
            title="Error"
            bodytext={msg}
            icon="error"
        />, {
            position: toast.POSITION.BOTTOM_RIGHT
        });

    }
    modalKpiChange = (event, type) => {
        const { kpiModalDetails } = this.state;
        let tempKpiDetails = JSON.parse(JSON.stringify(kpiModalDetails));
        switch (type) {
            case 'kpiName':
                tempKpiDetails.opKpiError = !RegExp(/[<>!'"[\]]/).test(event.target.value) ? "" : 'Please enter valid KPI name. Special characters [ < ! \' " > ] are invalid';
                tempKpiDetails.opKpi = event.target.value
                break;
            case 'kpiDescription':
                tempKpiDetails.opKpiDescError = !RegExp(/[<>!'"[\]]/).test(event.target.value) ? "" : 'Please enter valid description. Special characters [ < ! \' " > ] are invalid';
                tempKpiDetails.opKpiDesc = event.target.value
                break;
            case 'kpiFormula':
                tempKpiDetails.opKpiFormulaError = !RegExp(/[<>!'"[\]]/).test(event.target.value) ? "" : 'Please enter valid formula. Special characters [ < ! \' " > ] are invalid';
                tempKpiDetails.opKpiFormula = event.target.value
                break;
            case 'kpiTrend':
                tempKpiDetails.kpiTrend = event.target.value
                break;
            case 'kpiUnit':
                tempKpiDetails.opKpiUnit = event.target.value
                break;
            case 'kpiCalculationType':
                tempKpiDetails.calculationType = event.target.value
                break;
            case 'okpiType':
                tempKpiDetails.okpiType = event.target.value;
                tempKpiDetails.kpiType = event.target.value;
                if(event.target.value === "NON_FINANCIAL"){
                    tempKpiDetails.kpiBusType = "WITHOUT_BUS_CASE";
                }

                break;
            case 'kpiBusType':
                tempKpiDetails.kpiBusType = event.target.value;
                break;
            default:
                break;
        }
        this.setState({
            kpiModalDetails: tempKpiDetails,
            isFormDirty: true,
            isEdited: true
        })

    }
    
    closeModal() {
        const { isFormDirty } = this.state;
        // if (!((!RegExp(/[<>!'"[\]]/).test(this.state.kpiModalDetails.opKpi)) &&
        //         (!RegExp(/[<>!'"[\]]/).test(this.state.kpiModalDetails.opKpiDesc)) &&
        //         (!RegExp(/[<>!'"[\]]/).test(this.state.kpiModalDetails.opKpiFormula)) &&
        //         (this.state.kpiModalDetails.opKpi !== "" && this.state.kpiModalDetails.opKpi !== undefined) &&
        //         (this.state.kpiModalDetails.opKpiDesc !== "" && this.state.kpiModalDetails.opKpiDesc !== undefined) &&
        //         (this.state.kpiModalDetails.opKpiFormula !== "" && this.state.kpiModalDetails.opKpiFormula !== undefined) &&
        //         (this.state.kpiModalDetails.kpiTrend !== "" && this.state.kpiModalDetails.kpiTrend !== undefined) &&
        //         (this.state.kpiModalDetails.calculationType !== "" && this.state.kpiModalDetails.calculationType !== undefined) &&
        //         (this.state.kpiModalDetails.opKpiUnit !== "" && this.state.kpiModalDetails.opKpiUnit !== undefined) &&
        //         (this.state.kpiModalDetails.okpiType !== "" && this.state.kpiModalDetails.okpiType !== undefined &&
        //             this.state.kpiModalDetails.okpiType !== null))) {

        //                 this.showNotification("Please fill the mandatory fields");
        // }
        // else{
        //     // isValid=true;
        //     this.setState({
        //         kpiModalDetails: this.props.kpiDetails,
        //     }, () => {
        //         this.props.modalCloseHandler();
        //     });
        // }
        if (isFormDirty) {
            const confirmMsg = 'Do you want to close without saving it ?';
            this.openSaveKpiConfirmModal(confirmMsg);

        } else {
            this.setState({
                kpiModalDetails: this.props.kpiDetails,
            }, () => {
                this.props.modalCloseHandler();
            });
        }


    }
    openSaveKpiConfirmModal = (title) => {
        this.setState({
            saveKpiModalVisible: true,
            saveKpiModalTitle: title,
        });
    }
    closeSaveKpiConfirmModal = (isYesClicked) => {
        this.setState({
            saveKpiModalVisible: false,
            saveKpiModalTitle: ''
        }, () => {
            ReactTooltip.rebuild();
        });
        if (isYesClicked) {
          //  this.saveKpiModal();
          this.props.modalCloseHandler();
        }
       /*  else{
            this.setState({
                kpiModalDetails: this.props.kpiDetails,
            }, () => {
                this.props.modalCloseHandler();
            });
        } */
    }

    saveKpiModal() {
        this.props.saveKPIHandler(this.state.kpiModalDetails, this.props.kpiIndex);
    }

    /* kpiCloseIconDisplay(){
        const { kpiDetails } = this.props;
        let KpiDetailArray = {...kpiDetails };
        if(KpiDetailArray.kpiTrend && KpiDetailArray.kpiTrend !== '' && KpiDetailArray.opKpi &&  KpiDetailArray.opKpi !== '' &&
        KpiDetailArray.opKpiDesc && KpiDetailArray.opKpiDesc  !== '' && KpiDetailArray.opKpiFormula && KpiDetailArray.opKpiFormula !== '' &&
        KpiDetailArray.calculationType && KpiDetailArray.calculationType !=='' && KpiDetailArray.opKpiUnit && KpiDetailArray.opKpiUnit !== '' &&
        KpiDetailArray.okpiType && KpiDetailArray.okpiType !== '' && KpiDetailArray.kpiBusType && KpiDetailArray.kpiBusType !== '')
        {
           return true;
        }
        else{
            return false;
        }
    } */

    render() {

        return (
            <Modal className="kpiModal1" visible={this.props.visible} >
                <div className="modal-header-flex" style={{ borderBottom: '0px', color: '#ffffff' }}>
                    <div className="col-sm-12">
                        <div className="title-close-wrapper">

                            <div className="modal-title md-block">Enter New KPI</div>
                            <div className="">
                                {this.state.kpiModalDetails.kpi_id !== null ?
                                    <img src={closeIcon} alt="Close"
                                    data-tip="Close" data-type="dark" data-place="left"
                                        style={{ cursor: 'pointer' }}
                                        onClick={this.closeModal}
                                    ></img> : ""}
                                <ReactTooltip html={true}/>
                            </div>
                        </div>

                    </div>

                </div>

                <div className="modal-body" style={{ color: '#ffffff' }}>
                    {
                        <Fragment>
                            <div className="form-group row">
                                <div className="col-sm-7 no-gutters">
                                    <div className="col-sm-12 KPI">
                                        <label
                                            htmlFor="kpi_name"
                                            style={{ paddingRight: "0px" }}
                                        >
                                            KPI Name *
                                        </label>
                                    </div>
                                    <div className="col-sm-12">
                                        <input
                                            value={this.state.kpiModalDetails.opKpi || ''}
                                            id={this.state.kpiIndex}
                                            name="kpi_name"
                                            maxLength="100"
                                            placeholder="KPI Name"
                                            type="text"
                                            className="form-control"
                                            onChange={(event) => this.modalKpiChange(event, "kpiName")}

                                        />
                                        <span style={{ color: '#ffffff' }}>
                                            <small>
                                                {!RegExp(/[<>!'"[\]]/).test(this.state.kpiModalDetails.opKpi) ? '' : 'Please enter valid KPI name. Special characters [ < ! \' " > ] are invalid'}
                                            </small>
                                        </span>
                                    </div>
                                </div>

                                <div className="col-sm-5 no-gutters">
                                    <div className="col-sm-12 KPI">
                                        <label
                                            htmlFor="kpi_type"
                                        >
                                            KPI Type *
                                        </label>
                                    </div>
                                    <div className="col-sm-12">
                                        <select 
                                            value={this.state.kpiModalDetails.okpiType || ''}
                                            id={this.state.kpiIndex}
                                            name="kpi_type"
                                            placeholder="KPI Type"
                                            className="form-control"
                                            onChange={(event) => this.modalKpiChange(event, "okpiType")}
                                           
                                        >
                                            <option value="" disabled>
                                                Select KPI Type
                                            </option>
                                            <option defaultValue value="FINANCIAL">Financial</option> 
                                            <option value="NON_FINANCIAL">Non-Financial</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                          
                                <div className="form-group row">
                                    <div className="col-sm-7 no-gutters">
                                        <div className="col-sm-12 KPI">
                                            <label
                                                htmlFor="kpi_formula"
                                            >
                                                KPI Formula *
                                            </label>
                                        </div>
                                        <div className="col-sm-12">
                                        <input
                                        value={this.state.kpiModalDetails.opKpiFormula || ''}
                                        id={this.state.kpiIndex}
                                        name="kpi_formula"
                                        placeholder="KPI Formula"
                                        maxLength="1999"
                                        type="text"
                                        className="form-control"
                                        onChange={(event) => this.modalKpiChange(event, "kpiFormula")}

                                        />
                                        <span style={{color:'#ffffff'}}><small>{this.state.kpiModalDetails.opKpiFormulaError}</small></span>
                                    </div>
                                </div>
                            

                            <div className="col-sm-5 no-gutters">
                                    <div className="col-sm-12 KPI">
                                        <label
                                            htmlFor="bus_type"
                                        >
                                            Business Case Type *
                                        </label>
                                    </div>
                                    <div className="col-sm-12">
                                        <select
                                            value={this.state.kpiModalDetails.kpiBusType || ''}
                                            id={this.state.kpiIndex}
                                            name="bus_type"
                                            placeholder="KPI Bussiness Type"
                                            className="form-control"
                                            onChange={(event) => this.modalKpiChange(event, "kpiBusType")}
                                            disabled= {this.state.kpiModalDetails.okpiType === undefined} 
                                        >
                                           <option value="" defaultValue disabled>
                                                Select KPI Business Type
                                            </option>
                                            {(this.state.kpiModalDetails.okpiType === "FINANCIAL" || this.state.kpiModalDetails.okpiType === undefined) ?
                                             <option value="WITH_BUS_CASE">KPI With Business Case</option>: ''}
                                             <option  value="WITHOUT_BUS_CASE">KPI Without Business Case</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                            
                            {/* trend unit type */}
                            <div className="form-group row">
                                <div className="col-sm-4 no-gutters">
                                    <div className="col-sm-12 KPI">
                                        <label
                                            htmlFor="kpi_trend"
                                        >
                                            KPI Trend *
                                </label>
                                    </div>
                                    <div className="col-sm-12">
                                        <select
                                            value={this.state.kpiModalDetails.kpiTrend || ''}
                                            id={this.state.kpiIndex}
                                            name="kpi_trend"
                                            placeholder="KPI Trend"
                                            className="form-control"
                                            onChange={(event) => this.modalKpiChange(event, "kpiTrend")}

                                        >
                                            <option value="" defaultValue disabled>
                                                Select KPI Trend
                                        </option>
                                            <option value="Increase">Increase</option>
                                            <option value="Decrease">Decrease</option>
                                        </select>

                                    </div>

                                </div>
                                <div className="col-sm-3 no-gutters">

                                    <div className="col-sm-12 KPI">
                                        <label
                                            htmlFor="kpi_trend"
                                        >
                                            KPI Unit *
                                </label>
                                    </div>
                                    <div className="col-sm-12">
                                        <select
                                            value={this.state.kpiModalDetails.opKpiUnit || ''}
                                            id={this.state.kpiIndex}
                                            name="kpi_unit"
                                            placeholder="KPI Unit"
                                            className="form-control"
                                            onChange={(event) => this.modalKpiChange(event, "kpiUnit")}
                                        >
                                            <option value="" disabled>
                                                Select KPI Unit
                                        </option>
                                            <option value="#/$" defaultValue>#/$</option>
                                            <option value="%">%</option>
                                            <option value="#">#</option>
                                            <option value="$">$</option>
                                        </select>
                                    </div>

                                </div>
                                <div className="col-sm-5 no-gutters">
                                    <div className="col-sm-12 KPI">
                                        <label
                                            htmlFor="kpi_calculation_type"
                                        >
                                            Target Calculation Type *
                                        </label>
                                    </div>
                                    <div className="col-sm-12">
                                        <select
                                            value={this.state.kpiModalDetails.calculationType || ''}
                                            id={this.state.kpiIndex}
                                            name="kpi_calculation_type"
                                            placeholder="KPI CalculationType"
                                            className="form-control"
                                            onChange={(event) => this.modalKpiChange(event, "kpiCalculationType")}

                                        >
                                            <option value="" defaultValue disabled>
                                                Select KPI Target Calculation Type
                                    </option>
                                            <option value="Absolute Value">Absolute Value</option>
                                            <option value="Relative Improvement">Relative Improvement</option>
                                            <option value="Absolute Improvement">Absolute Improvement</option>
                                        </select>
                                    </div>
                                </div>

                            </div>
                            {/* end of trend unit type */}
                            <div className="form-group row">
                                <div className="col-sm-12 KPI" >
                                    <label
                                        htmlFor="kpi_description"
                                        style={{ paddingRight: "0px" }}
                                    >
                                        KPI Description *
                                </label>
                                </div>
                                <div className="col-sm-12">
                                    <textarea
                                        value={this.state.kpiModalDetails.opKpiDesc || ''}
                                        id={this.state.kpiIndex}
                                        name="kpi_description"
                                        placeholder="KPI description"
                                        type="text"
                                        maxLength="249"
                                        rows="4"
                                        className="form-control"
                                        onChange={(event) => this.modalKpiChange(event, "kpiDescription")}
                                    />
                                    <span style={{ color: '#ffffff' }}>
                                        <small>
                                            {!RegExp(/[<>!'"[\]]/).test(this.state.kpiModalDetails.opKpiDesc) ? '' : 'Please enter valid description. Special characters [ < ! \' " > ] are invalid'}
                                        </small>
                                    </span>
                                </div>
                            </div>
                            <div className="form-group row">

                                <div className="col-sm-4">
                                    <button
                                        className="btn btn-primary"
                                        onClick={this.saveKpiModal}
                                        style={{ width: '50%' }}
                                        disabled={(this.state.isEdited ? false : true ) ||
                                            !((!RegExp(/[<>!'"[\]]/).test(this.state.kpiModalDetails.opKpi)) &&
                                                (!RegExp(/[<>!'"[\]]/).test(this.state.kpiModalDetails.opKpiDesc)) &&
                                                (!RegExp(/[<>!'"[\]]/).test(this.state.kpiModalDetails.opKpiFormula)) &&
                                                (this.state.kpiModalDetails.opKpi !== "" && this.state.kpiModalDetails.opKpi !== undefined) &&
                                                (this.state.kpiModalDetails.opKpiDesc !== "" && this.state.kpiModalDetails.opKpiDesc !== undefined) &&
                                                (this.state.kpiModalDetails.opKpiFormula !== "" && this.state.kpiModalDetails.opKpiFormula !== undefined) &&
                                                (this.state.kpiModalDetails.kpiTrend !== "" && this.state.kpiModalDetails.kpiTrend !== undefined) &&
                                                (this.state.kpiModalDetails.calculationType !== "" && this.state.kpiModalDetails.calculationType !== undefined) &&
                                                (this.state.kpiModalDetails.opKpiUnit !== "" && this.state.kpiModalDetails.opKpiUnit !== undefined) &&
                                                (this.state.kpiModalDetails.okpiType !== "" && this.state.kpiModalDetails.okpiType !== undefined && this.state.kpiModalDetails.okpiType !== null) &&
                                                (this.state.kpiModalDetails.kpiBusType !== "" && this.state.kpiModalDetails.kpiBusType !== undefined && this.state.kpiModalDetails.kpiBusType !== null))}
                                    >
                                        Save
                                </button>
                                </div>
                                {/* {this.state.madatoryFieldsErr? 
                               <div className="col-sm-8" style={{color:"red"}}>Please fill the mandatory fields</div>
                               :""} */}

                            </div>
                            {/* </form> */}
                        </Fragment>}
                </div>
                {this.state.saveKpiModalVisible ?
                    <CustomConfirmModal
                        ownClassName={'ws-del-delete-modal'}
                        isModalVisible={this.state.saveKpiModalVisible}
                        modalTitle={this.state.saveKpiModalTitle}
                        closeConfirmModal={this.closeSaveKpiConfirmModal}
                    />
                    : ''

                }
            </Modal >
        );
    }
}

export default KPIModal;