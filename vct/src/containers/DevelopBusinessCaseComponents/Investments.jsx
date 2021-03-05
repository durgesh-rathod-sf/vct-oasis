import React, { Component } from 'react';
import { withRouter } from "react-router-dom";
import './KpiTable.css';
import { toast } from 'react-toastify';
import NotificationMessage from '../../components/NotificationMessage/NotificationMessage';
import { observer, inject } from 'mobx-react';
import ReviewValueDriverTreeHeader from '../../components/ReviewValueDriverTreeHeader/ReviewValueDriverTreeHeader';
import ValueDriverTreeNew from '../../components/ValueDriverTree/ValueDriverTreeNew';
import NumberFormat from 'react-number-format';
import ReactTooltip from 'react-tooltip';
import Modal from 'react-bootstrap4-modal';
import arrayMove from "array-move";
import { sortableContainer, sortableElement, sortableHandle } from 'react-sortable-hoc';

import plusIco from "../../assets/project/fvdt/addRowIcon.svg";
import deleteIcon from "../../assets/newDealsIcons/trashdelete.svg";
import saveIco from "../../assets/project/fvdt/saveIcon.svg";
import closeIcon from "../../assets/project/fvdt/crossIcon.svg";
import plusIco_brackets from "../../assets/project/fvdt/plusWithBackets.svg";
import CustomConfirmModal from '../../components/CustomConfirmModal/CustomConfirmModal';
import downloadIco from "../../assets/project/fvdt/download.svg";
import uploadIco from "../../assets/project/fvdt/upload.svg";
import dragDropIcon from "../../assets/newDealsIcons/cpDragDrop.svg";
var SessionStorage = require('store/storages/sessionStorage');

// react sortable hoc components
const SortableContainer = sortableContainer(({ children }) => {
    return <tbody>{children}</tbody>;
});

const DragHandle = sortableHandle(
    ({ option, initIndex }) =>
        <>
            <img
                data-tip=""
                data-for={`drag_icon_tt_inv_${initIndex}`}
                data-place="left" src={dragDropIcon} alt="icon"
                className="init-drag-icon"
            />

        </>
    //<span>{param.cpName}</span>
);

const SortableItem = sortableElement(({ option, index, initIndex, init_id, iniId, modalIndex, capexIndex, getTooltipData,
    handleNameChange, capexCloseWithoutSave, capexChangePerc, opexChangePerc, onCapexModalClose, onKpiModalOpen,
    kpiCloseWithoutSave, linkedKPIChecked, linkedKPIValueChange, onKpiModalClose, handleInvestmentValueChange, 
    onInputFocus, onInputBlur, deleteInvestment, onCapexDrillClick

}) => (
    <tr key={initIndex}>
        <td className="init-name-td">
            <input
                type="text"
                name={option.initiative_name}
                autoComplete="off"
                id={`init_name_id_${initIndex}`}
                value={option.initiative_name}
                style={{ width: "100%", textAlignLast: "left", paddingLeft: "5px" }}
                onChange={(e) => handleNameChange(option.init_id, e.target.value, initIndex)}
                className="form-control-capex"
            />
        </td>
        <td className="co-split-td" style={{ textAlignLast: "end" }}>
            <input
                type="text"
                style={{ width: '80%', border: 'none' }}
                className="form-control-capex"
                disabled
                value={option.capex_inv_percent !== "" || option.opex_inv_percent !== "" ? option.capex_inv_percent !== "" ? 'Cap...' : 'Ope...' : ''} />
            <i className="fa fa-caret-down" aria-hidden="true" style={{
                cursor: "pointer",
            }}
                id={option.init_id}
                name={option.initiative_name + "_CapexDrop"}
                onClick={(e) => onCapexDrillClick(option.init_id, initIndex)}></i>
            <Modal id="capexInv" visible={option.init_id === parseInt(iniId) || capexIndex === initIndex} >
                <div className="row" style={{ margin: "5% 0% 0% 0%" }}>
                    <div className="col-sm-10 modalStyles-head" style={{ padding: "1% 0% 1% 4%" }}>Indicate Capex/Opex split</div>
                    <div className="col-sm-2" onClick={capexCloseWithoutSave} >
                        <img src={closeIcon} data-tip="" data-for="close_tooltip" data-place="right" alt="close" style={{ width: "12px" }} />
                        <ReactTooltip id="close_tooltip" className="tooltip-class" ><span>Close</span>
                        </ReactTooltip>

                    </div>
                </div>
                <table className="table" style={{ margin: "4%", width: "92%" }}>
                    <thead style={{ whiteSpace: 'nowrap' }}>
                        <tr>
                            <th>Cost Type</th>
                            <th id="headerClick">% cost allocated</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td style={{ textAlignLast: "left", paddingLeft: "10px" }}>Capex</td>
                            <td>
                                <input
                                    type="number"
                                    name={option.initiative_name}
                                    id="capex"
                                    min="0"
                                    className="form-control-capex"
                                    style={{ width: "100%", border: "0px", backgroundColor: "#4D4D4D" }}
                                    value={Math.abs(option.capex_inv_percent)}
                                    onChange={(e) => capexChangePerc(option.init_id, e.target.value, initIndex)} />
                            </td>
                        </tr>
                        <tr>
                            <td style={{ textAlignLast: "left", paddingLeft: "10px" }}>Opex</td>
                            <td style={{ padding: "0px" }}>
                                <input
                                    type="number"
                                    name={option.initiative_name}
                                    id="opex"
                                    min="0"
                                    className="form-control-capex"
                                    style={{ width: "100%", border: "0px", backgroundColor: "#4D4D4D" }}
                                    value={Math.abs(option.opex_inv_percent)}
                                    onChange={(e) => opexChangePerc(option.init_id, e.target.value, initIndex)} />
                            </td>
                        </tr>
                    </tbody>
                </table>
                <div className="cr-de-btn-div" style={{ padding: "0px", margin: "0% 4% 4%", textAlignLast: "center" }}>
                    <button className="btn btn-primary inv-modal-ok" style={{
                        textAlignLast: "center", cursor: "pointer", width: "30px", borderRadius: "2px",
                        // float:"left"

                    }} onClick={(e) => onCapexModalClose(option.init_id, initIndex)}>
                        OK
                                                                </button>
                </div>

            </Modal>
        </td>
        <td className="kpi-link-td" style={{ textAlignLast: "end" }}>
            <input
                type="text"
                style={{ width: '80%', border: 'none' }}
                className="form-control-capex"
                disabled
                value={option.linkedValue ? (option.linkedValue.substring(0, 3) + '...') : ''} />
            <i className="fa fa-caret-down" aria-hidden="true" style={{
                cursor: "pointer",
            }}
                id={option.init_id}
                name={option.initiative_name + "_KpiDrop"}
                onClick={(e) => onKpiModalOpen(initIndex, option.init_id)}></i>

            <Modal id="inv" visible={(option.init_id === parseInt(init_id) || parseInt(modalIndex) === initIndex)}>
                <div className="row" style={{ margin: "5% 0% 0% 0%" }}>
                    <div className="col-sm-10 modalStyles-head" style={{ padding: "0% 5%" }} >Select KPIs and enter cost allocated</div>
                    <div className="col-sm-2" style={{ padding: "0px 28px" }} onClick={kpiCloseWithoutSave} >
                        <img data-tip="" data-for="close-tooltip" data-place="left" src={closeIcon} alt="close" style={{ width: "12px" }} />
                        <ReactTooltip id="close-tooltip" className="tooltip-class"> <span>Close</span></ReactTooltip>
                    </div>
                </div>
                <div className="tablediv">
                    <table className="table" style={{ marginBottom: "2px" }}>
                        <thead style={{ whiteSpace: 'nowrap' }}>
                            <tr>
                                <th style={{ width: '50%' }}>KPIs Linked</th>
                                <th id="linkedKpiHeaderClick"> % cost allocated</th>
                            </tr>
                        </thead>
                        <tbody>
                            {option.linked_kpis && option.linked_kpis.map((kpi, kpiIndex) => (
                                <tr key={kpiIndex}>
                                    <td >
                                        <div style={{ display: "flex" }}>
                                            <input type="checkbox"
                                                style={{ margin: "5px", textAlignLast: 'left' }}
                                                checked={kpi.checked}
                                                // value={checkedVal}
                                                onChange={(e) => linkedKPIChecked(e.target.checked, option.init_id, kpi.kpi_id, initIndex, kpiIndex)} />
                                            <p style={{ margin: "5px" }}> {kpi.kpi_name}</p>
                                        </div>
                                    </td>
                                    <td>
                                        <input
                                            type="number"
                                            disabled={!kpi.checked}
                                            name={option.initiative_name}
                                            id={kpi.kpi_name}
                                            min="0"
                                            style={{ width: "100%", height: '25px', border: "0px", backgroundColor: "#4D4D4D", color: "#ffffff" }}
                                            value={kpi.cost_allocated_percent ? Math.abs(kpi.cost_allocated_percent) : ''}
                                            onChange={(e) => linkedKPIValueChange(option.init_id, kpi.kpi_id, e.target.value, initIndex, kpiIndex)} />
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <div className="cr-de-btn-div" style={{ padding: "0px", margin: "0% 5% 4%", textAlignLast: "center" }}>
                    <button className="btn btn-primary inv-modal-ok" style={{
                        textAlignLast: "center", cursor: "pointer", width: "30px", borderRadius: "2px",
                        // float:"left"


                    }} onClick={(e) => onKpiModalClose(initIndex)}>
                        OK
                                                                </button>
                </div>
                {/* <button className="inv_button" style={{ textAlignLast: "center", cursor: "pointer", maxWidth: "50px", marginLeft: "160px" }} onClick={(e) => this.onKpiModalClose(index)}>Ok</button> */}
            </Modal>
        </td>
        {
            option.year && option.year.map((year, yearInd) => {
                return <td key={`init_${initIndex}_${yearInd}`}
                    className="init-year-td"
                    data-tip={getTooltipData(year.inv_val && year.inv_val.actualValue ? year.inv_val.actualValue : null)}
                    data-for={`init_${initIndex}_year_${yearInd}_tt`}
                    data-place="top"  >
                    <ReactTooltip id={`init_${initIndex}_year_${yearInd}_tt`} className="tooltip-class" />
                    <NumberFormat
                        thousandSeparator={true}
                        id={`init_${initIndex}_year_${yearInd}`}
                        name={option.initiative_name}
                        style={{ textAlignLast: 'right' }}
                        allowNegative={false}
                        value={(year.inv_val.formattedValue > 0 ? year.inv_val.formattedValue :
                            ((year.inv_val.actualValue === null || year.inv_val.actualValue === 0 || year.inv_val.actualValue === '') ? "" :
                                Number(Math.round(Number(year.inv_val.actualValue) * 10) / 10).toFixed(1)
                            ))}
                        onChange={(e) => handleInvestmentValueChange(option.init_id, e.target.value, year.year_no, initIndex)}
                        onFocus={(event) => onInputFocus(option.init_id, event.target.value, year.year_no, initIndex)}
                        onBlur={(event) => onInputBlur(option.init_id, event.target.value, year.year_no, initIndex)}
                        className="form-control-capex"

                    />
                </td>
            })
        }
        <td className="init-del-td">
            <div>
                <span>
                    
                    <DragHandle option={option} initIndex={initIndex}/>
                    <ReactTooltip id={`drag_icon_tt_inv_${initIndex}`} className="drag-icon">
                        <span>{`Drag & Reorder`}</span>
                    </ReactTooltip>
                </span>
                <span>
                    <img src={deleteIcon} alt=""
                        // data-tip={getTooltipValue("Delete")}
                        className="disabled" id={option.init_id}
                        style={{
                            width: "15px",
                            opacity: (SessionStorage.read("isMaster") === "Y" || (SessionStorage.read("accessType") === "Read")) ? '0.5' : 'unset',
                            cursor: (SessionStorage.read("isMaster") === "Y" || (SessionStorage.read("accessType") === "Read")) ? 'not-allowed' : 'pointer'
                        }}
                        name={option.initiative_name}
                        onClick={(e) => (SessionStorage.read("isMaster") === "Y" || (SessionStorage.read("accessType") === "Read")) ? 'return false;' : deleteInvestment(option.init_id, initIndex)}
                        data-tip=""
                        data-for={`delete_icon_tt_inv_${initIndex}`}
                        data-place="left" />
                    <ReactTooltip id={`delete_icon_tt_inv_${initIndex}`} className="tooltip-class">
                        <span>Delete</span>
                    </ReactTooltip>
                </span>
            </div>
        </td>
    </tr>
));

@inject('reviewValueDriverStore', 'kpiBenefitsStore', 'investmentStore')
@observer
class Investments extends Component {
    constructor(props) {
        super(props);
        this.state = {
            result: {},
            rows: [],
            max_capex_year: 0,
            max_opex_year: 0,
            isCapexExpand: false,
            isOpexExpand: false,
            isCapexOpen: false,
            isKpiModalOpen: false,
            testResult: {},
            initiatives: [],
            linkedKPIIds: [],
            init_id: '',
            iniId: '',
            checkedVal: '',
            tempResult: [],
            modalIndex: '',
            capexIndex: '',
            del_init_id_ls: [],
            newColumnAdded: false,
            customDeleteInvModalVisible: false,
            customDeleteInvModalTitle: '',
            saveResponseWaiting: false,
            isInvLoading: true,
            init_id_modal: '',
            del_init_index: ''            
        };

        // Refs
        this.containerEl = null;

        this.saveInvestment = this.saveInvestment.bind(this);
        this.handleAddRow = this.handleAddRow.bind(this);
        this.onCapexModalClose = this.onCapexModalClose.bind(this);
        this.onKpiModalClose = this.onKpiModalClose.bind(this);
        this.onCapexDrillClick = this.onCapexDrillClick.bind(this);
        this.handleInvestmentValueChange = this.handleInvestmentValueChange.bind(this);
        this.calculateTotalInvestments = this.calculateTotalInvestments.bind(this);
        this.capexCloseWithoutSave = this.capexCloseWithoutSave.bind(this);
        this.kpiCloseWithoutSave = this.kpiCloseWithoutSave.bind(this);
        this.test = this.test.bind(this);
        // this.childMethod = this.childMethod.bind(this);
        this.addNewYear = this.addNewYear.bind(this);
        this.deleteColumnHandler = this.deleteColumnHandler.bind(this);
        this.openDeleteInvConfirmModal = this.openDeleteInvConfirmModal.bind(this);
        this.closeDeleteInvConfirmModal = this.closeDeleteInvConfirmModal.bind(this);
        this.onInputBlur = this.onInputBlur.bind(this);
        this.onInputFocus = this.onInputFocus.bind(this);
        this.handleNameChange = this.handleNameChange.bind(this);
        this.capexChangePerc = this.capexChangePerc.bind(this);
        this.opexChangePerc = this.opexChangePerc.bind(this);
        this.onKpiModalOpen = this.onKpiModalOpen.bind(this);
        this.linkedKPIChecked = this.linkedKPIChecked.bind(this);
        this.linkedKPIValueChange = this.linkedKPIValueChange.bind(this);
        this.deleteInvestment = this.deleteInvestment.bind(this);
        this.deleteInvestmentConfirm = this.deleteInvestmentConfirm.bind(this);

    }

    onSortEnd = ({ oldIndex, newIndex }) => {

        const { result, initiatives } = this.state;
        let tempResult = { ...result };
        let tempInitiatives = [...initiatives];

        let sortedList = arrayMove(tempInitiatives, oldIndex, newIndex);

        sortedList.map((row, index) => {
            row.order = index + 1;
            return true;
        });
        tempResult.initiatives = sortedList;

        this.setState({
            result: { ...tempResult },
            initiatives: [...sortedList],
            hideTooltips: false
        });
    };

    helperFun = () => {
        return this.containerEl;
    }

    beforeSorting = ({ node, index }, event) => {

        this.setState({
            hideTooltips: true
        });
    }
    openDeleteInvConfirmModal = (title, init_id, initIndex) => {
        this.setState({
            customDeleteInvModalVisible: true,
            customDeleteInvModalTitle: title,
            init_id_modal: init_id,
            del_init_index: initIndex
        });
    };
    closeDeleteInvConfirmModal = (isYesClicked) => {
        
        if (isYesClicked) {
            //new delete function
            this.setState({
                customDeleteInvModalVisible: false,
                customDeleteInvModalTitle: ''
            });
            this.deleteInvestmentConfirm()
        } else {
            this.setState({
                customDeleteInvModalVisible: false,
                customDeleteInvModalTitle: '',
                init_id_modal: '',
                del_init_index: ''
            });
        }
    };
    // childMethod() {
    //     alert("child component alert");
    // }

    componentDidMount() {
        this.triggerServiceCalls();
        
    }

    triggerServiceCalls = async() => {
        const {reviewValueDriverStore} = this.props;
        let vdtResp = await reviewValueDriverStore.getGenerateVDTOnly(false,'ALL','');
        this.fetchInvestments();
    }

    capexCloseWithoutSave() {
        const { investmentStore } = this.props
        // const { tempResult } = this.state
        this.setState({
            isCapexOpen: false,
            iniId: '',
            result: investmentStore.tempResult,
            initiatives: investmentStore.tempResult.initiatives,
            capexIndex: ''
        })
    }
    componentDidUpdate(prevProps, prevState) {
        if (prevProps.result !== this.props.result || prevProps.totalInvestmentsArray !== this.props.totalInvestmentsArray) {
            this.test()
        }

        // if (prevState.initiatives !== this.state.initiatives) {
        //     this.setState({
        //         initiatives: this.props.initiatives
        //     })
        // }

    }
    test() {
        this.setState({
            result: this.props.result,
            initiatives: [...this.props.initiatives],
            linkedKPIIds: [...this.props.linkedKPIIds],
            addClicked: this.props.addClicked,
            totalInvestmentsArray: [...this.props.totalInvestmentsArray],
            isInvLoading: false
        })
    }

    fetchInvestments() {        
        this.props.getInvestments();       
    }
    deleteInvestment(init_id, initIndex) {
        let deleteMsg = "Are you sure you want to delete?";
       
        this.openDeleteInvConfirmModal(deleteMsg, init_id, initIndex);
    }
    deleteInvestmentConfirm() {
        // if (window.confirm("Are you sure you want to delete?")) {
        const { result, del_init_id_ls, init_id_modal, del_init_index } = this.state;
        let init_id = init_id_modal;
        let tempResultArr = result;
        let deletedInitArray = [...del_init_id_ls];

        // new code for delete
        if (init_id !== null && init_id !== '') {
            deletedInitArray.push(init_id);
            this.setState({
                del_init_id_ls: deletedInitArray
            }, () => {
                // if (Object.keys(this.state.result).length > 0 && this.state.initiatives.length > 0) { check why this is added on this
                // this.showNotification('success', 'Investment deleted successfully');
                if (Object.keys(this.state.result).length > 0 && (this.state.del_init_id_ls.length > 0)) {
                    this.saveInvestment();
                } else {
                    return;
                }
            })
        } else {
            if (tempResultArr.initiatives) {
                tempResultArr.initiatives.splice(del_init_index, 1);

                // logic to calculate total investments
                if (tempResultArr) {
                    for (let k = 0; k < tempResultArr.investments.length; k++) {
                        tempResultArr.investments[k].total_investment_value = 0
                    }
                    for (let i = 0; i < tempResultArr.initiatives.length; i++) {
                        for (let j = 0; j < tempResultArr.initiatives[i].year.length; j++) {
                            for (let k = 0; k < tempResultArr.investments.length; k++) {
                                if (tempResultArr.investments[k].year_no === tempResultArr.initiatives[i].year[j].year_no) {
    
                                    if (tempResultArr.initiatives[i].year[j].inv_val.actualValue === '0') {
                                        var tempResult = 0
                                    }
                                    else {
                                        tempResult =
                                            //  Number( Math.round(Number(result.initiatives[i].year[j].inv_val.actualValue) * 10) / 10).toFixed(1)
                                            Number(tempResultArr.initiatives[i].year[j].inv_val.actualValue).toFixed(30)
                                    }
                                    tempResultArr.investments[k].total_investment_value = Number(tempResultArr.investments[k].total_investment_value) + Number(tempResult)
                                }
                            }
                        }
                    }
                }

                this.setState({
                    result: tempResultArr,
                    initiatives: tempResultArr.initiatives,
                    totalInvestmentsArray: tempResultArr.investments,
                    del_init_id_ls: [],
                    init_id_modal: '',
                    del_init_index: ''    
                })
            }
            
            
            
        }

        
            
            
            

        
            
            

    }
    calculateTotalInvestments() {
        const totalCal = this.props.totalInvFormat();
        if (totalCal) {
            this.setState({
                totalInvestmentsArray: [...this.props.totalInvestmentsArray]
            });
        }
    }

    onCapexModalClose(init_id, index) {
        const { result } = this.state;
        for (let i = 0; i < result.initiatives.length; i++) {
            let iniId = this.state.iniId !== null ? parseInt(this.state.iniId) : null;
            if (init_id === null && index === i) {
                let capex = 0;
                let opex = 0;
                if (result.initiatives[i].capex_inv_percent !== undefined || result.initiatives[i].capex_inv_percent !== "") {
                    capex = result.initiatives[i].capex_inv_percent;
                }
                if (result.initiatives[i].opex_inv_percent !== undefined || result.initiatives[i].opex_inv_percent !== "") {
                    opex = result.initiatives[i].opex_inv_percent;
                }
                if (Number(capex) + Number(opex) !== 100) {
                    // alert("Total percentage of Capex and Opex should be 100");
                    this.showNotification('error', 'Total percentage of Capex and Opex should be 100');
                }
                else {
                    this.setState({
                        isCapexOpen: false,
                        iniId: '',
                        capexIndex: '',
                    });
                }
            }
            else if (iniId !== null) {
                if (iniId === result.initiatives[i].init_id) {
                    let capex = 0;
                    let opex = 0;
                    if (result.initiatives[i].capex_inv_percent !== undefined || result.initiatives[i].capex_inv_percent !== "") {
                        capex = result.initiatives[i].capex_inv_percent;
                    }
                    if (result.initiatives[i].opex_inv_percent !== undefined || result.initiatives[i].opex_inv_percent !== "") {
                        opex = result.initiatives[i].opex_inv_percent;
                    }
                    if (Number(capex) + Number(opex) !== 100) {
                        // alert("Total percentage of Capex and Opex should be 100");
                        this.showNotification('error', "Total percentage of Capex and Opex should be 100")
                    }
                    else {
                        this.setState({
                            isCapexOpen: false,
                            iniId: '',
                            capexIndex: '',
                        });
                    }
                }
            }
        }

    }

    onKpiModalOpen(index, initId) {
        this.setState({
            isKpiModalOpen: true,
            init_id: initId === '' ? null : initId,
            modalIndex: index,
        });
    }

    onKpiModalClose(index, kpiIndex) {
        let total = 0
        let emptyCount = 0;
        let uncheckCount = 0;
        const { result } = this.state;
        let init_id = this.state.init_id !== null && this.state.init_id !== "" ? parseInt(this.state.init_id) : null
        for (let i = 0; i < result.initiatives.length; i++) {

            if (init_id === null && index === i) {
                result.initiatives[i].linkedValue = "";
                for (let j = 0; j < result.initiatives[i].linked_kpis.length; j++) {
                    total = total + (result.initiatives[i].linked_kpis[j].cost_allocated_percent && result.initiatives[i].linked_kpis[j].cost_allocated_percent !== "" ? result.initiatives[i].linked_kpis[j].cost_allocated_percent : 0)
                    if (result.initiatives[i].linkedValue === "" && result.initiatives[i].linked_kpis[j].cost_allocated_percent !== "" && result.initiatives[i].linked_kpis[j].cost_allocated_percent !== undefined) {
                        result.initiatives[i].linkedValue = result.initiatives[i].linked_kpis[j].kpi_name
                        this.setState({
                            checkedVal: result.initiatives[i].linked_kpis[j].kpi_name
                        })
                    }
                    if (result.initiatives[i].linked_kpis[j].checked === true && (result.initiatives[i].linked_kpis[j].cost_allocated_percent === "" || result.initiatives[i].linked_kpis[j].cost_allocated_percent === undefined)) {
                        emptyCount = emptyCount + 1
                    }
                    if (result.initiatives[i].linked_kpis[j].checked === false && (result.initiatives[i].linked_kpis[j].cost_allocated_percent !== "" && result.initiatives[i].linked_kpis[j].cost_allocated_percent !== undefined)) {
                        uncheckCount = uncheckCount + 1
                    }
                }
            }
            else if (init_id !== null) {
                if (init_id === result.initiatives[i].init_id) {
                    result.initiatives[i].linkedValue = "";

                    for (let j = 0; j < result.initiatives[i].linked_kpis.length; j++) {
                        total = total + (result.initiatives[i].linked_kpis[j].cost_allocated_percent && result.initiatives[i].linked_kpis[j].cost_allocated_percent !== "" ? result.initiatives[i].linked_kpis[j].cost_allocated_percent : 0)

                        if (result.initiatives[i].linkedValue === "" && result.initiatives[i].linked_kpis[j].cost_allocated_percent !== "" && result.initiatives[i].linked_kpis[j].cost_allocated_percent !== undefined) {
                            result.initiatives[i].linkedValue = result.initiatives[i].linked_kpis[j].kpi_name
                            this.setState({
                                checkedVal: result.initiatives[i].linked_kpis[j].kpi_name
                            })
                        }
                        if (result.initiatives[i].linked_kpis[j].checked === true && (result.initiatives[i].linked_kpis[j].cost_allocated_percent === "" || result.initiatives[i].linked_kpis[j].cost_allocated_percent === undefined)) {
                            emptyCount = emptyCount + 1
                        }
                        if (result.initiatives[i].linked_kpis[j].checked === false && (result.initiatives[i].linked_kpis[j].cost_allocated_percent !== "" && result.initiatives[i].linked_kpis[j].cost_allocated_percent !== undefined)) {
                            uncheckCount = uncheckCount + 1
                        }

                    }
                }
            }
        }
        if (emptyCount === 0 && uncheckCount === 0 && total === 100) {
            this.setState({
                isKpiModalOpen: false,
                init_id: '',
                modalIndex: '',
            })
        }
        else {
            if (emptyCount !== 0) {
                // alert("Please enter the value(s) to the KPI(s) selected")
                this.showNotification('error', "Please enter the value(s) to the KPI(s) selected")
            }
            if (uncheckCount !== 0) {
                // alert("Please select KPI for which Cost % is allocated")
                this.showNotification('error', "Please select KPI for which Cost % is allocated")
            }
            if (total !== 100) {
                // alert("Total percentage of linked KPIs should be 100")
                this.showNotification('error', "Total percentage of linked KPIs should be 100")

            }
        }




    }

    kpiCloseWithoutSave() {
        this.setState({
            isKpiModalOpen: false,
            init_id: '',
            modalIndex: ''
        })
    }

    onCapexDrillClick(iniId, index) {
        this.setState({
            isCapexOpen: true,
            iniId: iniId === '' ? null : iniId,
            capexIndex: index,
        });
    }

    showNotification(type, message) {
        switch (type) {
            case 'success':
                toast.info(<NotificationMessage
                    title="Success"
                    bodytext={message}
                    icon="success"
                />, {
                    position: toast.POSITION.BOTTOM_RIGHT,
                });
                break;
            case 'Duplicate data entered':
                toast.error(<NotificationMessage
                    title="Error"
                    bodytext={'Please check duplicate Data entered for Initiative'}
                    icon="error"
                />, {
                    position: toast.POSITION.BOTTOM_RIGHT,
                });
                break;
            case 'error':
                toast.error(<NotificationMessage
                    title="Error"
                    bodytext={message}
                    icon="error"
                />, {
                    position: toast.POSITION.BOTTOM_RIGHT,
                });
                break;
        }
    }

    saveInvestment() {
        const { investmentStore } = this.props;
        const { initiatives, del_init_id_ls } = this.state;
        const result = JSON.parse(JSON.stringify(this.state.result));
        
        if (this.validateInputs()) {
            for (let i = 0; i < result.initiatives.length; i++) {
                for (let j = 0; j < result.initiatives[i].linked_kpis.length; j++) {
                    delete result.initiatives[i].linked_kpis[j].checked
                    if (!result.initiatives[i].linked_kpis[j].cost_allocated_percent || result.initiatives[i].linked_kpis[j].cost_allocated_percent === undefined) {
                        result.initiatives[i].linked_kpis.splice(j, 1)
                        j = j - 1
                    }
                }
                for (let k = 0; k < result.initiatives[i].year.length; k++) {
                    if (result.initiatives[i].year[k].inv_val) {
                        if (result.initiatives[i].year[k].inv_val.actualValue === "" || result.initiatives[i].year[k].inv_val.actualValue === null) {
                            // delete result.initiatives[i].year[k].inv_val
                            result.initiatives[i].year[k].inv_val = ""
                        }
                        else {
                            if (result.initiatives[i].year[k].inv_val.actualValue === '0') {
                                result.initiatives[i].year[k].inv_val = 0
                            }
                            else {
                                if (result.initiatives[i].year[k].inv_val.actualValue) {
                                    result.initiatives[i].year[k].inv_val = result.initiatives[i].year[k].inv_val.actualValue
                                } else {

                                }

                            }
                            if (typeof (result.initiatives[i].year[k].inv_val) === 'string') {
                                result.initiatives[i].year[k].inv_val = Number(result.initiatives[i].year[k].inv_val)
                            }
                        }
                    }
                    else {
                        result.initiatives[i].year[k].inv_val = "";
                    }
                }
            }
            const selected_option = SessionStorage.read('option_selected');
            // if (selected_option === 'delivery') {
            result['del_init_id_ls'] = del_init_id_ls;

            // result.initiatives.map((init) => {
            //     if (init.init_id === null) {
            //         init.init_id = "";
            //     }
            //     return true;
            // });

            // }
            let err = 0;

            for (let i = 0; i < result.initiatives.length; i++) {
                if (RegExp(/[<>!'"[\]]/).test(result.initiatives[i].initiative_name)) {
                    err = err + 1;
                }
                if (result.initiatives[i].init_id === null) {
                    result.initiatives[i].init_id = "";
                }
                result.initiatives[i].initiative_name = result.initiatives[i].initiative_name.trim();
                result.initiatives[i]['order'] = i + 1;
                // for (let j = 0; j < result.initiatives[i].linked_kpis.length; j++) {
                //     delete result.initiatives[i].linked_kpis[j].checked;
                // }
            }
            

            if (err === 0) {
                this.setState({
                    saveResponseWaiting: true
                }, () => {
                    console.log('succes state of save waiting');
                })
                investmentStore.saveInvestments(result)
                    .then((response) => {
                        if (response && !response.error) {
                            if (response.data.resultCode === "OK") {
                                this.fetchInvestments();
                                if (del_init_id_ls && del_init_id_ls.length > 0) {
                                    this.showNotification('success', 'Investment deleted successfully');
                                } else {
                                    this.showNotification('success', 'Investments saved Successfully');
                                }                               
                                
                            }
                            else {
                                if (response.data.resultCode === "KO") {
                                    // this.fetchInvestments();
                                    this.showNotification('error', response.data.message)
                                    // this.setState({
                                    //     saveResponseWaiting:false
                                    // })
                                }
                            }
                            
                            this.setState({
                                del_init_id_ls: [],
                                saveResponseWaiting: false
                            });
                            return response;
                        }
                        else {                            
                            this.setState({
                                del_init_id_ls: [],
                                saveResponseWaiting: false
                            });
                            this.showNotification('error', 'Error !!!, please check the values and save again');
                        }
                    }
                    )
            }
            else {
                this.fetchInvestments();
                this.showNotification('error', 'Please enter valid value for Cost Category. Special characters [ < ! \' " > ] are invalid');
            }
        }
    }

    validateInputs() {
        const { result } = this.state;
        for (let i = 0; i < result.initiatives.length; i++) {
            let total = 0;
            for (let j = 0; j < result.initiatives[i].linked_kpis.length; j++) {
                total = total + (result.initiatives[i].linked_kpis[j].cost_allocated_percent && result.initiatives[i].linked_kpis[j].cost_allocated_percent !== "" ? result.initiatives[i].linked_kpis[j].cost_allocated_percent : 0)
            }
            if (total !== 100) {
                // alert("for Initiative " + result.initiatives[i].initiative_name + " total percentage of linked KPIs is not 100")
                this.showNotification('error', ("for Initiative " + result.initiatives[i].initiative_name + " total percentage of linked KPIs is not 100"))
                return false
            }
            let capex = 0
            let opex = 0
            if (result.initiatives[i].capex_inv_percent === undefined || result.initiatives[i].capex_inv_percent === "") {
                capex = 0
            }
            else {
                capex = result.initiatives[i].capex_inv_percent
            }
            if (result.initiatives[i].opex_inv_percent === undefined || result.initiatives[i].opex_inv_percent === "") {
                opex = 0
            }
            else {
                opex = result.initiatives[i].opex_inv_percent
            }
            if (capex + opex !== 100) {
                // alert("for Initiative " + result.initiatives[i].initiative_name + " total percentage of Capex/Opex is not 100")
                this.showNotification('error', ("for Initiative " + result.initiatives[i].initiative_name + " total percentage of Capex/Opex is not 100"))
                return false
            }

        }
        return true

    }


    handleAddRow() {
        let addRow = {};
        addRow = this.state.result;
        let linkedKPIs = []
        for (let i = 0; i < addRow.KPI_list.length; i++) {
            let kpi = {
                kpi_id: addRow.KPI_list[i].kpi_id,
                kpi_name: addRow.KPI_list[i].operational_kpi,
                cost_allocated_percent: '',
                checked: false
            }
            linkedKPIs.push(kpi)
        }
        let yearsArray = [];
        for (let i = 0; i < this.getYearsArray().length; i++) {
            const obj = { 'inv_val': { actualValue: null, formattedValue: 0 },"year_no": i + 1 }
            yearsArray.push(obj);
        }

        let testResult = {
            'capex_inv_percent': "",
            "init_id": null,
            "initiative_name": "",
            "linked_kpis": linkedKPIs,
            'opex_inv_percent': '',
            "year": yearsArray,
            'order': addRow.initiatives.length ? addRow.initiatives.length + 1 : 1
        }

        addRow.initiatives.push(testResult);
        this.setState({
            result: { ...addRow },
            initiatives: [...addRow.initiatives],

        }, () => {
            // this.capexFormat();
        });

    }

    capexChangePerc(init_id, value, index) {
        const { investmentStore } = this.props
        const { result } = this.state
        let tempResult = result
        investmentStore.tempResult = tempResult
        let newResult = result
        for (let i = 0; i < newResult.initiatives.length; i++) {
            if (init_id === null && index === i) {
                newResult.initiatives[i].capex_inv_percent = value === "" ? "" : value.indexOf('.') === value.length - 1 ? value : Number(value)
            }
            else if (init_id !== null) {
                if (init_id === newResult.initiatives[i].init_id) {
                    newResult.initiatives[i].capex_inv_percent = value === "" ? "" : value.indexOf('.') === value.length - 1 ? value : Number(value)
                }
            }
        }

        this.setState({
            result: newResult,
            initiatives: newResult.initiatives
        })

    }

    opexChangePerc(init_id, value, index) {
        const { investmentStore } = this.props
        const { result } = this.state
        let tempResult = result
        investmentStore.tempResult = tempResult
        let newResult = result
        for (let i = 0; i < newResult.initiatives.length; i++) {
            if (init_id === null && index === i) {
                newResult.initiatives[i].opex_inv_percent = value === "" ? "" : value.indexOf('.') === value.length - 1 ? value : Number(value)
            }
            else if (init_id !== null) {
                if (init_id === newResult.initiatives[i].init_id) {
                    newResult.initiatives[i].opex_inv_percent = value === "" ? "" : value.indexOf('.') === value.length - 1 ? value : Number(value)
                }
            }
        }
        this.setState({
            result: newResult,
            initiatives: newResult.initiatives
        })
    }

    linkedKPIChecked(checked, init_id, kpi_id, index, kpiIndex) {
        const { result } = this.state
        let newResult = result
        for (let i = 0; i < newResult.initiatives.length; i++) {
            if (init_id === null && index === i) {
                for (let j = 0; j < result.initiatives[i].linked_kpis.length; j++) {
                    if (kpiIndex === j) {
                        if (checked) {
                            newResult.initiatives[i].linked_kpis[j].checked = true
                        }
                        else {
                            newResult.initiatives[i].linked_kpis[j].checked = false
                            newResult.initiatives[i].linked_kpis[j].cost_allocated_percent = ''
                        }
                    }
                }
            }
            else if (init_id !== null) {
                if (init_id === newResult.initiatives[i].init_id) {
                    for (let j = 0; j < newResult.initiatives[i].linked_kpis.length; j++) {
                        if (kpi_id === newResult.initiatives[i].linked_kpis[j].kpi_id) {
                            if (checked) {
                                newResult.initiatives[i].linked_kpis[j].checked = true
                            }
                            else {
                                newResult.initiatives[i].linked_kpis[j].checked = false
                                newResult.initiatives[i].linked_kpis[j].cost_allocated_percent = ''
                            }
                        }
                    }
                }
            }
            this.setState({
                result: newResult,
                initiatives: newResult.initiatives
            })

        }
    }

    linkedKPIValueChange(init_id, kpi_id, value, index, kpiIndex) {
        const { result } = this.state
        let newResult = result
        for (let i = 0; i < newResult.initiatives.length; i++) {
            if (init_id === null && index === i) {
                for (let j = 0; j < newResult.initiatives[i].linked_kpis.length; j++) {
                    if (kpiIndex === j) {
                        newResult.initiatives[i].linked_kpis[j].cost_allocated_percent = value === "" ? "" : parseInt(value)
                    }
                }
            }
            else if (init_id !== null) {
                if (init_id === newResult.initiatives[i].init_id) {
                    for (let j = 0; j < newResult.initiatives[i].linked_kpis.length; j++) {
                        if (kpi_id === newResult.initiatives[i].linked_kpis[j].kpi_id) {
                            newResult.initiatives[i].linked_kpis[j].cost_allocated_percent = value === "" ? "" : parseInt(value)
                        }
                    }
                }
            }
        }
        this.setState({
            result: newResult,
            initiatives: newResult.initiatives
        })
    }

    handleNameChange(init_id, value, index) {
        const { result } = this.state
        let newResult = result
        for (let i = 0; i < newResult.initiatives.length; i++) {
            if (init_id === null && index === i) {
                newResult.initiatives[i].initiative_name = value
            }
            else if (init_id !== null) {
                if (init_id === newResult.initiatives[i].init_id) {
                    newResult.initiatives[i].initiative_name = value
                }
            }
        }
        this.setState({
            result: newResult,
            initiatives: newResult.initiatives
        })
    }

    handleInvestmentValueChange(init_id, value, year_no, index) {
        const { result } = this.state
        let value1 = value.replace(/,/g, '')
        let newResult = result
        let regex = /^(?!00)\d+\.0{1,}\d*$/
        for (let i = 0; i < newResult.initiatives.length; i++) {
            for (let j = 0; j < newResult.initiatives[i].year.length; j++) {
                if (init_id === null && index === i) {
                    if (year_no === newResult.initiatives[i].year[j].year_no) {
                        if (newResult.initiatives[i].year[j].inv_val) {
                            if (value1 === '0') {
                                newResult.initiatives[i].year[j].inv_val.actualValue = "0"
                                newResult.initiatives[i].year[j].inv_val.formattedValue = 0
                            } else {
                                // newResult.initiatives[i].year[j].inv_val.actualValue = value1 === "" ? "" : value1.indexOf('.') === value1.length - 1 ?value1: value1==='0.0'? value1: Number(value1)
                                // newResult.initiatives[i].year[j].inv_val.formattedValue = value1 === "" ? "" : value1.indexOf('.') === value1.length - 1 ?value1: value1==='0.0'?value1 : Number(value1)
                                newResult.initiatives[i].year[j].inv_val.actualValue = value1 === "" ? "" : value1.indexOf('.') === value1.length - 1 ? value1 : regex.test(value1) ? value1 : Number(value1)
                                newResult.initiatives[i].year[j].inv_val.formattedValue = value1 === "" ? "" : value1.indexOf('.') === value1.length - 1 ? value1 : regex.test(value1) ? value1 : Number(value1)
                            }
                        }
                        else {
                            if (value1 === '0') {
                                newResult.initiatives[i].year[j].inv_val = {
                                    'actualValue': '0',
                                    'formattedValue': '0'
                                }

                            } else {
                                newResult.initiatives[i].year[j].inv_val = {
                                    'actualValue': value1 === "" ? "" : value1.indexOf('.') === value1.length - 1 ? value1 : regex.test(value1) ? value1 : Number(value1),
                                    'formattedValue': value1 === "" ? "" : value1.indexOf('.') === value1.length - 1 ? value1 : regex.test(value1) ? value1 : Number(value1)
                                }
                            }
                        }
                    }
                }
                else if (init_id !== null) {
                    if (init_id === newResult.initiatives[i].init_id) {
                        for (let j = 0; j < newResult.initiatives[i].year.length; j++) {
                            if (year_no === newResult.initiatives[i].year[j].year_no) {
                                if (year_no === newResult.initiatives[i].year[j].year_no) {
                                    if (value1 === '0') {
                                        newResult.initiatives[i].year[j].inv_val.actualValue = '0'
                                        newResult.initiatives[i].year[j].inv_val.formattedValue = 0
                                    } else {
                                        newResult.initiatives[i].year[j].inv_val.actualValue = value1 === "" ? "" : value1.indexOf('.') === value1.length - 1 ? value1 : regex.test(value1) ? value1 : Number(value1)
                                        newResult.initiatives[i].year[j].inv_val.formattedValue = value1 === "" ? "" : value1.indexOf('.') === value1.length - 1 ? value1 : regex.test(value1) ? value1 : Number(value1)
                                    }
                                }
                                else {
                                    if (value1 === '0') {
                                        newResult.initiatives[i].year[j].inv_val = {
                                            'actualValue': '0',
                                            'formattedValue': '0'
                                        }

                                    } else {
                                        newResult.initiatives[i].year[j].inv_val = {
                                            'actualValue': value1 === "" ? "" : value1.indexOf('.') === value1.length - 1 ? value1 : regex.test(value1) ? value1 : Number(value1),
                                            'formattedValue': value1 === "" ? "" : value1.indexOf('.') === value1.length - 1 ? value1 : regex.test(value1) ? value1 : Number(value1)
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
        for (let k = 0; k < newResult.investments.length; k++) {
            if (newResult.investments[k].year_no === year_no) {
                newResult.investments[k].total_investment_value = 0
            }
        }

        for (let k = 0; k < newResult.investments.length; k++) {
            for (let i = 0; i < newResult.initiatives.length; i++) {
                for (let j = 0; j < newResult.initiatives[i].year.length; j++) {
                    if (newResult.initiatives[i].year[j].year_no === year_no) {
                        if (newResult.investments[k].year_no === year_no) {
                            if (newResult.initiatives[i].year[j].inv_val) {
                                newResult.investments[k].total_investment_value = newResult.investments[k].total_investment_value + (newResult.initiatives[i].year[j].inv_val.actualValue === "" || Number(newResult.initiatives[i].year[j].inv_val.actualValue) === 0 || newResult.initiatives[i].year[j].inv_val.actualValue === undefined ? 0 : Number(newResult.initiatives[i].year[j].inv_val.actualValue))
                            }
                        }
                    }
                }

            }
        }
        this.setState({
            result: newResult,
            initiatives: newResult.initiatives,
            totalInvestmentsArray: newResult.totalInvestmentsArray,
            totalInvestmentsArray: result.investments
        })

    }

    onInputBlur(init_id, value, year_no, index) {
        const { result } = this.state
        let value1 = value.replace(/,/g, '')
        let newResult = result
        for (let i = 0; i < newResult.initiatives.length; i++) {
            for (let j = 0; j < newResult.initiatives[i].year.length; j++) {
                if (init_id === null && index === i) {
                    if (year_no === newResult.initiatives[i].year[j].year_no) {
                        if (newResult.initiatives[i].year[j].inv_val) {
                            newResult.initiatives[i].year[j].inv_val.formattedValue = value1 === "" ? "" : value1.indexOf('.') === value1.length - 1 ? value1 :
                                // Number(value1).toFixed(1)
                                Number(Math.round(Number(value1) * 10) / 10).toFixed(1)
                        }
                    }
                }
                else if (init_id !== null) {
                    if (init_id === newResult.initiatives[i].init_id) {
                        for (let j = 0; j < newResult.initiatives[i].year.length; j++) {
                            if (year_no === newResult.initiatives[i].year[j].year_no) {
                                if (newResult.initiatives[i].year[j].inv_val) {
                                    newResult.initiatives[i].year[j].inv_val.formattedValue = value1 === "" ? "" : value1.indexOf('.') === value1.length - 1 ? value1 :
                                        // Number(value1).toFixed(1)
                                        Number(Math.round(Number(value1) * 10) / 10).toFixed(1)
                                }
                            }
                        }
                    }
                }
            }
        }

        this.setState({
            result: newResult,
            initiatives: newResult.initiatives,
        })
    }

    onInputFocus(init_id, value, year_no, index) {
        const { result } = this.state
        // let value1 = value.replace(/,/g, '')
        let newResult = result
        for (let i = 0; i < newResult.initiatives.length; i++) {
            for (let j = 0; j < newResult.initiatives[i].year.length; j++) {
                if (init_id === null && index === i) {
                    if (year_no === newResult.initiatives[i].year[j].year_no) {
                        if (newResult.initiatives[i].year[j].inv_val) {
                            let val = newResult.initiatives[i].year[j].inv_val.actualValue
                            newResult.initiatives[i].year[j].inv_val.formattedValue = val ? val : null;
                            // newResult.initiatives[i].year[j].inv_val.formattedValue = newResult.initiatives[i].year[j].inv_val.actualValue === "" ? "" : newResult.initiatives[i].year[j].inv_val.actualValue.indexOf('.') === newResult.initiatives[i].year[j].inv_val.actualValue.length - 1 ? newResult.initiatives[i].year[j].inv_val.actualValue : Number(newResult.initiatives[i].year[j].inv_val.actualValue)
                        }
                    }
                }
                else if (init_id !== null) {
                    if (init_id === newResult.initiatives[i].init_id) {
                        for (let j = 0; j < newResult.initiatives[i].year.length; j++) {
                            if (year_no === newResult.initiatives[i].year[j].year_no) {
                                if (newResult.initiatives[i].year[j].inv_val) {
                                    let val = newResult.initiatives[i].year[j].inv_val.actualValue
                                    newResult.initiatives[i].year[j].inv_val.formattedValue = val ? val : null;
                                    // newResult.initiatives[i].year[j].inv_val.formattedValue = newResult.initiatives[i].year[j].inv_val.actualValue === "" ? "" : newResult.initiatives[i].year[j].inv_val.actualValue.indexOf('.') === newResult.initiatives[i].year[j].inv_val.actualValue.length - 1 ? newResult.initiatives[i].year[j].inv_val.actualValue : Number(newResult.initiatives[i].year[j].inv_val.actualValue)
                                }
                            }
                        }
                    }
                }
            }
        }

        this.setState({
            result: newResult,
            initiatives: newResult.initiatives,
        })
    }

    getYearsArray = () => {
        const { result } = this.state;
        if (result.initiatives && result.initiatives.length > 0) {
            return result.initiatives[0].year;
        }
        return [{ "year_no": 1 }, { "year_no": 2 },
        { "year_no": 3 }, { "year_no": 4 }, { "year_no": 5 }];
    }

    addNewYear = () => {
        const yearIndex = this.getYearsArray().length;
        const { result } = this.state;
        let tempResult = result;
        let TempInitiativesArray = [...tempResult.initiatives];
        let TempInvArray = [...tempResult.investments];
        TempInitiativesArray.map((initiative, initiativeIndex) => {
            const previousYearObj = initiative.year[yearIndex - 1];
            let tempObj = {}
            if (previousYearObj.inv_val) {
                tempObj = {
                    "inv_val": {
                        "actualValue": previousYearObj.inv_val.actualValue,
                        "formattedValue": 0
                    },
                    "year_no": Number(yearIndex + 1),
                }
            } else {
                tempObj = {
                    "year_no": Number(yearIndex + 1)
                }
            }

            initiative.year.push(tempObj);
            return true;
        });
        const previousInvObj = {
            "total_investment_value": TempInvArray[yearIndex - 1].total_investment_value,
            "year_no": Number(yearIndex + 1),
        };

        TempInvArray.push(previousInvObj);
        tempResult.investments = [...TempInvArray];

        this.setState({
            result: tempResult,
            initiatives: TempInitiativesArray,
            totalInvestmentsArray: [...TempInvArray],
            newColumnAdded: true,
        });
    };

    deleteColumnHandler = () => {
        const { result, newColumnAdded } = this.state;        
        let {initialInvDataObj} = this.props.investmentStore;
        if (initialInvDataObj.investments && initialInvDataObj.investments.length === result.investments.length) {
            const {investmentStore} = this.props;
            investmentStore.deleteExtraYear(this.getYearsArray().length)
                .then((response) => {
                    const { data } = response;
                    if (response && !response.error && data.resultCode === 'OK') {
                        this.showNotification('success', 'Data deleted successfully');
                        this.fetchInvestments();
                        return;
                    } else if (response && !response.error && data.resultCode === 'KO') {
                        this.showNotification('error', data.errorDescription);
                        return;
                    }
                    this.showNotification('error', 'Sorry! something went wrong');
                });
        }
        const tempResult = result;
        const TempInitiativesArray = [...tempResult.initiatives];
        const TempInvArray = [...tempResult.investments];
        TempInitiativesArray.map((initiative) => {
            initiative.year.pop();
            return true;
        });

        TempInvArray.pop();
        tempResult.investments = [...TempInvArray];
        tempResult.initiatives = [...TempInitiativesArray];

        this.setState({
            result: tempResult,
            initiatives: TempInitiativesArray,
            totalInvestmentsArray: [...TempInvArray]
        });
    };


    render() {
        const { kpiBenefitsStore, reviewValueDriverStore } = this.props;
        const { branchTree } = reviewValueDriverStore;
        const { initiatives, totalInvestmentsArray, init_id, iniId, modalIndex, capexIndex, saveResponseWaiting } = this.state;
        var headers = [];
        let max_years = this.getYearsArray().length;
        for (var i = 0; i < max_years; i++) {
            headers.push(<th className="init-year-th" key={i}>Year {i + 1}</th>);
        }
        const getTooltipData = (value) => {
            if (value) {
                let val = String(value).replace(/(?<!\..*)(\d)(?=(?:\d{3})+(?:\.|$))/g, '$1,');
                return `${val}`;
            }
        }
        // const getTooltipValue = (value) => {
        //     return `${value}`;

        //  }
        var totalInvestmentheaders = [];
        let max_inv = this.getYearsArray().length;
        for (var i = 0; i < max_inv; i++) {
            totalInvestmentheaders.push(<th key={i}>Year {i + 1}</th>);
        }
        const selected_option = SessionStorage.read('option_selected');

        return (
            <div className="investments row" style={{ margin: '0%' }}>
                <div className="row tab navMenu wrapper_Inv" style={{ width: "100%", padding: "6px 0px" }}>
                    <div style={{ display: "flex", justifyContent: "flex-end" }}>
                        <img src={saveIco} alt="save"
                            onClick={(SessionStorage.read("isMaster") === "Y" || (SessionStorage.read("accessType") === "Read") || saveResponseWaiting) ? () => { } : this.saveInvestment}
                            disabled={(SessionStorage.read("isMaster") === "Y" || (SessionStorage.read("accessType") === "Read")) ? true : false}
                            data-tip=""
                            data-for="inv-save-tooltip"
                            data-place="top"
                            className="save-img"
                            style={{
                                opacity: (SessionStorage.read("isMaster") === "Y" || (SessionStorage.read("accessType") === "Read") || saveResponseWaiting) ? '0.5' : 'unset',
                                cursor: (saveResponseWaiting ? "default" : ((SessionStorage.read("isMaster") === "Y" || (SessionStorage.read("accessType") === "Read")) ? "not-allowed" : "pointer")),
                                // zIndex: "1",
                                margin: "0px",
                                height: "30px"
                            }} />
                        {saveResponseWaiting ? 
                        <i className="fa fa-spinner fa-spin" style={{ color: '#ffffff', position: "absolute", margin: "10px 70px", cursor: "default" }}></i>
                        :"" } 
                        <ReactTooltip id="inv-save-tooltip" className="tooltip-class">
                            <span>Save</span>
                        </ReactTooltip>

                        {/* adding icons */}
                        <span
                            className="kpiBenifit-operationBtn"
                            style={{ cursor:(this.props.isLoading ?"default": "pointer"), 
                            opacity:(this.props.isLoading ?"0.5": "unset"),
                            marginRight: "0px" }}
                            // id={this.props.KPIBenefitsArray[0] && this.props.KPIBenefitsArray[0].kpiId}
                            // onClick={(SessionStorage.read("isMaster") === "Y" || (SessionStorage.read("accessType") === "Read")) ? 'return false;' : (isLoading ? () => { } : this.onKPIBenefitSaveClick)}
                            onClick={this.props.isLoading ? ()=>{} : this.props.handleDownload}
                            // disabled={SessionStorage.read("demoUser") === "true" ? true : (isLoading ? true : false)}
                            data-tip=""
                            data-for="kpib-download-tooltip"
                            data-place="top" >
                            <img src={downloadIco} alt="download" style={{ paddingBottom: "15px", marginRight: "5px" }} />
                            {this.props.isLoading ?
                                <i className="fa fa-spinner fa-spin" style={{ color: '#ffffff', position: "absolute", margin: "10px -28px", fontSize: "15px", cursor: "default" }}></i>
                            : ""} 
                        </span>
                        <ReactTooltip id="kpib-download-tooltip" className="tooltip-class">
                            <span>Generate Data Template</span>
                        </ReactTooltip>

                        <span
                            className="kpiBenifit-operationBtn"
                            style={{ margin: "-3px -30px 0px 0px" }}
                            // id={this.props.KPIBenefitsArray[0] && this.props.KPIBenefitsArray[0].kpiId}
                            // onClick={(SessionStorage.read("isMaster") === "Y" || (SessionStorage.read("accessType") === "Read")) ? 'return false;' : (isLoading ? () => { } : this.onKPIBenefitSaveClick)}
                            onClick={this.props.handleupload}
                        // disabled={SessionStorage.read("demoUser") === "true" ? true : (isLoading ? true : false)}
                        ><label htmlFor="file" style={{ marginBottom: 0 }}>
                                <img src={uploadIco}
                                    data-tip=""
                                    data-for="kpib-upload-tooltip"
                                    data-place="top"
                                    style={{ cursor: (SessionStorage.read("isMaster") === "Y" || (SessionStorage.read("accessType") === "Read")) ? "not-allowed" : "pointer", paddingBottom: "8px", marginLeft: "5px", marginRight: "10px", opacity: (SessionStorage.read("isMaster") === "Y" || (SessionStorage.read("accessType") === "Read")) ? "0.5" : "unset" }} alt="upload" />
                                <ReactTooltip id="kpib-upload-tooltip" className="tooltip-class">
                                    <span>Ingest Data</span>
                                </ReactTooltip>
                            </label >
                            <input type="file"
                                disabled={SessionStorage.read('accessType') === 'Read' || SessionStorage.read("isMaster") === "Y"}
                                style={{ height: "32px", opacity: "0", position: "absolute", zIndex: "-1" }}
                                name="file" id="file" onChange={(e) => this.props.onIngestHandle(e)} /></span>
                        {/* adding icons end */}
                    </div>
                    <div className="Icon_sub_menu" style={{ marginRight: "80px" }} />
                </div>

                <div className="col-sm-12" style={{ display: "inline-flex", padding: "0px" }}>
                    <div className="vdt-table" style={{ width: "610px", padding: "0px" }}>
                        <div className="row rvdt-header align-self-center " style={{ backgroundColor: '#6C6C6C', width: '596px' }}>
                            <ReviewValueDriverTreeHeader isBusinessCase={true} />
                        </div>
                        {!this.state.isInvLoading ?
                            branchTree.length > 0 ?
                                (
                                    <div >
                                        <div key={Math.floor(Math.random() * 1001)} className="col-sm-12" id="vdt">
                                            <ValueDriverTreeNew
                                                branchTree={branchTree}
                                                isBusinessCase={this.props.isBusinessCase}
                                                isBenefitActuals={false}
                                            />
                                        </div>
                                    </div>
                                ) :
                                <div className="row justify-content-center" style={{ height: '50px' }}>
                                    <i className="fa fa-spinner fa-spin" style={{ fontSize: '18px', color: '#ffffff', height: "min-content" }}></i>
                                </div> 
                                :
                                <div className="row justify-content-center" style={{ height: '50px' }}>
                                    <i className="fa fa-spinner fa-spin" style={{ fontSize: '18px', color: '#ffffff', height: "min-content" }}></i>
                                </div>
                        }
                    </div>
                    <div style={{ width: "calc( 100% - 610px )" }}>
                        {/* <KPIBenifits /> */}
                        { !this.state.isInvLoading ?
                        <div style={{ margin: '0.5rem', position: 'sticky', top: '0' }}>
                            {/* <div className="row tab" style={{ justifyContent: "flex-end", width: "102%" }}>
                                <button className="inv_button"
                                    style={{ cursor: (SessionStorage.read("isMaster") === "Y" || (SessionStorage.read("accessType") === "Read")) ? 'not-allowed' : 'pointer' }}
                                    disabled={SessionStorage.read("demoUser") === "true" ? true : ((SessionStorage.read("isMaster") === "Y" || (SessionStorage.read("accessType") === "Read")) ? true : false)}
                                    onClick={this.saveInvestment}>Save</button>
                            </div> */}
                            <div className="invest_table-responsive totalInvTable">
                                <table className="table" style={{ width: "100%", marginBottom: "1px" }}>
                                    <thead style={{ whiteSpace: 'nowrap' }}>
                                        <tr>
                                            <th>Total Investments</th>
                                            {totalInvestmentheaders}
                                        </tr>
                                    </thead>
                                    <tbody>

                                        <tr>
                                            <td style={{ width: "23.8%", textAlignLast: "left", paddingLeft: "5px" }}>Total Investments</td>
                                            {totalInvestmentsArray && totalInvestmentsArray.map((option, index) => (
                                                < td key={index}
                                                    style={{ minWidth: "65px" }}
                                                    data-tip={getTooltipData(option.total_investment_value)}
                                                    data-for="invTotal-values-tooltip"
                                                    data-place="top"  >
                                                    <ReactTooltip id="invTotal-values-tooltip" className="tooltip-class" />
                                                    <NumberFormat
                                                        thousandSeparator={true}
                                                        name="capexcategory"
                                                        id={`total_inv_year_${index}`}
                                                        value={
                                                            // Number(option.total_investment_value).toFixed(1)
                                                            Number(Math.round(Number(option.total_investment_value) * 10) / 10).toFixed(1)
                                                        }
                                                        allowNegative={false}
                                                        style={{ textAlignLast: 'right' }}
                                                        onChange={() => this.handleChange(option)}
                                                        className="form-control-capex"
                                                        disabled={true}
                                                    /></td>
                                            ))}
                                        </tr>
                                    </tbody>
                                </table>

                            </div>
                            {/* <div className="row tab" style={{ justifyContent: "flex-end", width: "102%" }}>
                                <button className="inv_button" onClick={this.handleAddRow}
                                    style={{ cursor: (SessionStorage.read("isMaster") === "Y" || (SessionStorage.read("accessType") === "Read")) ? 'not-allowed' : 'pointer' }}
                                    disabled={(SessionStorage.read("isMaster") === "Y" || (SessionStorage.read("accessType") === "Read")) ? true : false}>
                                    Add Initiative
                        </button>
                            </div> */}
                            <div className="invest_table-responsive d-inline-block dbc-inv-table-main">
                                <div className={`d-inline-block InvTable ${this.state.hideTooltips ? 'hide-tt': ''}`}
                                    >
                                    <table className={`table ${this.getYearsArray().length > 5 ? 'init-more-years': ''}`} style={{ marginBottom: "1px" }} ref={el => (this.containerEl = el)}>
                                        <thead style={{ whiteSpace: 'nowrap' }}>
                                            <tr>
                                                <th className="init-name-th">Cost Category </th>
                                                <th className="co-split-th">Capex /<br />Opex split</th>
                                                <th className="kpi-link-th">KPIs<br />Linked</th>
                                                {headers}
                                                {selected_option !== "sales" && initiatives.length !== 0 ?
                                                    <th className="init-del-th">
                                                        {
                                                            this.getYearsArray().length < 10 &&
                                                            <span onClick={this.addNewYear} style={{ color: 'black', fontSize: '20px', cursor: 'pointer', padding: "5px 0px 5px 5px" }}>
                                                                <img src={plusIco_brackets} alt="plusIcon"
                                                                    data-tip=""
                                                                    data-for="invT-addYear-tooltip"
                                                                    data-place="left" />
                                                                <ReactTooltip id="invT-addYear-tooltip" className="tooltip-class">
                                                                    <span>Add Year</span>
                                                                </ReactTooltip>
                                                            </span>
                                                        }
                                                        {
                                                            this.getYearsArray().length > 5 &&
                                                            <span style={{ color: 'black', fontSize: '20px', cursor: 'pointer' }}>
                                                                {' '} <img src={deleteIcon} alt="" onClick={this.deleteColumnHandler}
                                                                    data-tip=""
                                                                    data-for="invT-deleteYear-tooltip"
                                                                    data-place="left" />
                                                                <ReactTooltip id="invT-deleteYear-tooltip" className="tooltip-class">
                                                                    <span>Delete Year</span>
                                                                </ReactTooltip>
                                                            </span>
                                                        }
                                                    </th> : ''
                                                }
                                            </tr>
                                        </thead>
                                            <SortableContainer onSortEnd={this.onSortEnd}
                                                updateBeforeSortStart={this.beforeSorting}
                                                useDragHandle lockAxis="y"
                                                lockToContainerEdges={true}
                                                disableAutoscroll={true}
                                                helperContainer={this.helperFun}
                                                helperClass="cp-dragged-row-type"
                                            >
                                                {initiatives && initiatives.map((option, index) => (
                                                    <SortableItem key={`init-${index}`}
                                                    index = {index}
                                                    initIndex = {index}
                                                    option={option}
                                                    init_id={init_id}
                                                    iniId={iniId}
                                                    modalIndex={modalIndex}
                                                    capexIndex={capexIndex}
                                                    getTooltipData = {getTooltipData}
                                                    handleNameChange = {this.handleNameChange}
                                                    capexCloseWithoutSave = {this.capexCloseWithoutSave}
                                                    capexChangePerc = {this.capexChangePerc}
                                                    opexChangePerc = {this.opexChangePerc}
                                                    onCapexModalClose = {this.onCapexModalClose}
                                                    onKpiModalOpen = {this.onKpiModalOpen}
                                                    kpiCloseWithoutSave = {this.kpiCloseWithoutSave}
                                                    linkedKPIChecked = {this.linkedKPIChecked}
                                                    linkedKPIValueChange = {this.linkedKPIValueChange}
                                                    onKpiModalClose = {this.onKpiModalClose}
                                                    handleInvestmentValueChange = {this.handleInvestmentValueChange}
                                                    onInputFocus = {this.onInputFocus}
                                                    onInputBlur = {this.onInputBlur}
                                                    deleteInvestment = {this.deleteInvestment}
                                                    onCapexDrillClick = {this.onCapexDrillClick}
                                                    >
                                                    </SortableItem>
                                                ))
                                                }
                                            </SortableContainer>
                                        
                                    </table>

                                </div>
                                <div className="add-init-main">
                                    <img src={plusIco} alt="Add"

                                        style={{
                                            float: "left", marginLeft: "1%", opacity: (SessionStorage.read("isMaster") === "Y" || (SessionStorage.read("accessType") === "Read")) ? '0.5' : 'unset',
                                            cursor: (SessionStorage.read("isMaster") === "Y" || (SessionStorage.read("accessType") === "Read")) ? 'not-allowed' : 'pointer'
                                        }}
                                        disabled={(SessionStorage.read("isMaster") === "Y" || (SessionStorage.read("accessType") === "Read")) ? true : false}
                                        onClick={(SessionStorage.read("isMaster") === "Y" || (SessionStorage.read("accessType") === "Read")) ? () => { } : this.handleAddRow}
                                        data-tip=""
                                        data-for="invT-addParam-tooltip"
                                        data-place="right" />
                                    <ReactTooltip id="invT-addParam-tooltip" className="tooltip-class">
                                        <span>Add Cost Category</span>
                                    </ReactTooltip>
                                </div>
                            </div>
                        </div>
                            : <div className="row justify-content-center" style={{ height: '50px', marginTop: '1rem' }}>
                                <i className="fa fa-spinner fa-spin" style={{ fontSize: '18px', color: '#ffffff', height: "min-content" }}></i>
                                {/* <h4> <i className="fa fa-exclamation-triangle"></i> No data to load</h4> */}
                            </div>
                        }
                    </div>
                </div>
                <CustomConfirmModal
                    ownClassName={'Inv-delete'}
                    isModalVisible={this.state.customDeleteInvModalVisible}
                    modalTitle={this.state.customDeleteInvModalTitle}
                    closeConfirmModal={this.closeDeleteInvConfirmModal}
                />
            </div >
        );
    }
}

export default withRouter(Investments);