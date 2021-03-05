import React, { Component } from 'react';
import { withRouter } from "react-router-dom";
import { inject } from 'mobx-react';
import { toast } from 'react-toastify';
import NotificationMessage from '../../components/NotificationMessage/NotificationMessage';
import RisksTable from '../../components/RisksTable/RisksTable';
import CustomConfirmModal from '../../components/CustomConfirmModal/CustomConfirmModal';

import 'moment-timezone';
import Moment from 'moment';

@inject('workstreamActualsStore')
class RisksHome extends Component {
    constructor(props) {
        super(props);
        this.state = {
            tableData: [],
            tempTable: [],
            startDate: '',
            checkedValue: null,
            checkedStatus: '',
            saveInprogress: false,
            entryDatesArray: [],
            closedDatesArray: [],
            customDeleteRiskModalVisible: false,
            customDeleteRiskModalTitle: '',
        }
        this.addNewRisk = this.addNewRisk.bind(this)
        this.entryDateFilter = this.entryDateFilter.bind(this)
        this.closedDateFilter = this.closedDateFilter.bind(this)
        this.formatDate = this.formatDate.bind(this)
        this.setEntryDatesArray = this.setEntryDatesArray.bind(this)
        this.setClosedDatesArray = this.setClosedDatesArray.bind(this)
        this.closeCustomModelRiskDelete = this.closeCustomModelRiskDelete.bind(this)
        this.openCustomModelRiskDelete = this.openCustomModelRiskDelete.bind(this)
    }
    closeCustomModelRiskDelete = (isyesClicked) => {
        this.setState({
            customDeleteRiskModalVisible: false,
            customDeleteRiskModalTitle: ''
        })
        if (isyesClicked) {
            this.deleteRiskConfirm();
        }
    }
    openCustomModelRiskDelete = (title) => {
        this.setState({
            customDeleteRiskModalVisible: true,
            customDeleteRiskModalTitle: title
        })
    }


    componentDidMount() {
        const { selectedLevel } = this.props;
        switch (selectedLevel) {
            case 'Workstream':
                this.getWsRisks()
                break
            case 'Activity':
                this.getActivityRisks()
                break
            case 'Deliverable':
                this.getDeliverableRisks()
                break
            default:
                break;
        }
        this.setState({
            showClosedDates: false
        })
    }

    componentDidUpdate(PrevProps) {
        if (PrevProps.selectedWADLevelId !== this.props.selectedWADLevelId) {
            const { selectedLevel } = this.props;
            switch (selectedLevel) {
                case 'Workstream':
                    this.getWsRisks()
                    break
                case 'Activity':
                    this.getActivityRisks()
                    break
                case 'Deliverable':
                    this.getDeliverableRisks()
                    break
                default:
                    break;
            }
        }

    }

    formatDate(str) {
        let date = str === " " ? new Date() : new Date(str),
            mnth = ('0' + (date.getMonth() + 1)).slice(-2),
            day = ('0' + date.getDate()).slice(-2);
        return [mnth, day, date.getFullYear()].join('-');
    }


    getDeliverableRisks = () => {
        // let test = Moment(date).format('DD-MMM-YYYY');
        const { workstreamActualsStore } = this.props;
        const DelId = this.props.selectedWADLevelId;
        let details = []
        workstreamActualsStore.getDeliverableRisks(DelId)
            .then((res) => {
                if (res && res.data.resultCode === 'OK') {
                    details = res.data.resultObj
                    details.map((entry) => {
                        if (entry.closedDate === "") {
                            entry.display = true
                            entry.checked = true
                        }
                        else {
                            let closedDate = this.formatDate(entry.closedDate)
                            let newDate = this.formatDate(" ")
                            if (closedDate >= newDate) {
                                entry.display = true
                                entry.checked = true
                            } else {
                                entry.display = false
                                entry.checked = false
                            }
                        }
                        return true
                    })
                    this.setState({
                        tableData: details,
                        tempTable: details
                    })
                    workstreamActualsStore.tableData = details



                } else if(res && res.data.resultCode === 'KO'){
                    this.showErrorNotification(res.data.errorDescription, 'Error', 'error')
                }
            })
    }
    getWsRisks = () => {
        const { workstreamActualsStore } = this.props;
        const wsId = this.props.selectedWADLevelId;
        let details = []
        workstreamActualsStore.getWsRisks(wsId)
            .then((res) => {
                if (res && res.data.resultCode === 'OK') {
                    details = res.data.resultObj
                    details.map((entry) => {
                        if (entry.closedDate === "") {
                            entry.display = true
                            entry.checked = true
                        }
                        else {
                            let closedDate = this.formatDate(entry.closedDate)
                            let newDate = this.formatDate(" ")
                            if (closedDate >= newDate) {
                                entry.display = true
                                entry.checked = true
                            } else {
                                entry.display = false
                                entry.checked = false
                            }
                        }
                        return true
                    })
                    this.setState({
                        tableData: details,
                        tempTable: details
                    })
                    workstreamActualsStore.tableData = details
                } else if(res && res.data.resultCode === 'KO'){
                    this.showErrorNotification(res.data.errorDescription,'Error', 'error')
                }
            })
    }
    getActivityRisks = () => {
        const { workstreamActualsStore } = this.props;
        const actId = this.props.selectedWADLevelId;
        let details = []
        workstreamActualsStore.getActivityRisks(actId)
            .then((res) => {
                if (res && res.data.resultCode === 'OK') {
                    details = res.data.resultObj
                    details.map((entry) => {
                        if (entry.closedDate === "") {
                            entry.display = true
                            entry.checked = true
                        }
                        else {
                            let closedDate = this.formatDate(entry.closedDate)
                            let newDate = this.formatDate(" ")
                            if (closedDate >= newDate) {
                                entry.display = true
                                entry.checked = true
                            } else {
                                entry.display = false
                                entry.checked = false
                            }

                        }
                        return true
                    })
                    this.setState({
                        tableData: details,
                        tempTable: details
                    })
                    workstreamActualsStore.tableData = details
                } else if(res && res.data.resultCode === 'KO') {
                    this.showErrorNotification(res.data.errorDescription, 'Error', 'error')
                }
            })
    }

    addNewRisk = () => {
        const { tableData } = this.state
        const { workstreamActualsStore } = this.props
        let newTableData = tableData
        const riskDetail = {
            'catActId': null,
            'catType': "",
            'closedDate': "",
            'description': "",
            'mitigationPlan': "",
            'openDate': "",
            'owner': "",
            'checked': true,
            'display': true
        }
        newTableData.push(riskDetail)
        this.setState({
            tableData: newTableData,
            tempTable: newTableData

        })
        workstreamActualsStore.tableData = newTableData
    }

    onRiskDetailsChange = (event, val, index) => {
        const { tableData } = this.state
        const { workstreamActualsStore } = this.props
        let newTableData = tableData
        for (let i = 0; i <= tableData.length; i++) {
            if (i === index) {
                switch (val) {
                    case 'catType':
                        newTableData[i].catType = event.target.value
                        break;
                    case 'description':
                        newTableData[i].description = event.target.value
                        break;
                    case 'mitigationPlan':
                        newTableData[i].mitigationPlan = event.target.value
                        break;
                    case 'owner':
                        newTableData[i].owner = event.target.value
                        break;
                    case 'openDate':
                        newTableData[i].openDate = Moment(event).format('DD-MMM-YYYY')

                        break;
                    case 'closedDate':
                        if (newTableData[i].catType !== "" && newTableData[i].description !== "" &&
                            newTableData[i].owner !== "" && newTableData[i].openDate !== "") {
                            newTableData[i].closedDate = Moment(event).format('DD-MMM-YYYY')
                        } else {
                            // alert("Please enter all madatory fields")
                            this.showErrorNotification(' Please enter all madatory fields', 'error', 'error')
                        }
                        break;
                    default:
                        break;

                }
            }
        }

        this.setState({
            newTableData: tableData
        })
        workstreamActualsStore.tableData = newTableData
    }

    onDelRisksSave = () => {
        const { selectedLevel, tableData } = this.state
        const { workstreamActualsStore } = this.props;
        let newTableData = []
        let data = {}
        let mandatoryCheck = ''

        tableData.forEach(function (element) {
            if ((element.catType === "" || element.catType === undefined) || (element.description === "" || element.description === undefined) || (element.owner === "" || element.owner === undefined) || (element.openDate === "" || element.openDate === undefined)) {
                mandatoryCheck = 'empty';
            }
            if (RegExp(/[<>!'"[\]]/).test(element.description) || RegExp(/[<>!'"[\]]/).test(element.mitigationPlan) || RegExp(/[<>!'"[\]]/).test(element.owner)) {
                mandatoryCheck = 'invalidAll'
            }
        })

        if (mandatoryCheck !== '') {
            if (mandatoryCheck === 'empty') {
                this.showErrorNotification("Please enter all mandatory fields with valid values", "error", "error");
            }
            if (mandatoryCheck === 'invalidAll') {
                this.showErrorNotification("Please enter all mandatory fields with valid values. Special characters [ < ! ' \" > ] are invalid", "error", "error");
            }
        }
        else {
            tableData.forEach(function (element) {
                element.deliverableId = selectedLevel;
            });

            tableData.map((deliverable, index) => {
                if (deliverable.catActId !== null) {
                    data = {
                        "catActId": deliverable.catActId,
                        "deliverableId": this.props.selectedWADLevelId + '',
                        "categoryType": deliverable.catType,
                        "description": deliverable.description,
                        "mitigationPlan": deliverable.mitigationPlan,
                        "owner": deliverable.owner,
                        "openDate": (Moment(deliverable.openDate).format('YYYY-MM-DD')).toString(),
                        "closedDate": deliverable.closedDate !== "" ? (Moment(deliverable.closedDate).format('YYYY-MM-DD')).toString() : ""
                    }
                    newTableData.push(data)
                } else {
                    let data = {

                        "deliverableId": this.props.selectedWADLevelId + '',
                        "categoryType": deliverable.catType === "" ? deliverable.catType = 'Risk' : deliverable.catType,
                        "description": deliverable.description,
                        "mitigationPlan": deliverable.mitigationPlan,
                        "owner": deliverable.owner,
                        "openDate": (Moment(deliverable.openDate).format('YYYY-MM-DD')).toString(),
                        "closedDate": deliverable.closedDate !== "" ? (Moment(deliverable.closedDate).format('YYYY-MM-DD')).toString() : ""

                    }
                    newTableData.push(data)
                }

                return true

            })
            let payload = {
                "categoryActuals": newTableData
            }
            this.setState({
                saveInprogress: true
            })
            workstreamActualsStore.saveDeliverableRisks(payload)
                .then((res) => {
                    if (res && res.data.resultCode === 'OK') {
                        this.getDeliverableRisks()

                        this.showErrorNotification('Risks, Issues and Dependencies saved successfully', 'success', 'success')
                        this.setState({
                            saveInprogress: false
                        })
                    } else if(res && res.data.resultCode === 'KO'){
                        this.setState({
                            saveInprogress: false
                        })
                        this.showErrorNotification(res.data.errorDescription, 'Error', 'error')
                    }
                })
        }
    }




    deleteRisk = (catActId, index) => {

        const deleteMessage = "Are you sure you want to delete?"
        this.setState({
            modelcatActId: catActId,
            modelindex: index
        })
        this.openCustomModelRiskDelete(deleteMessage);



        // this.showErrorNotification()

    }

    deleteRiskConfirm() {
        const { workstreamActualsStore } = this.props
        const { tableData, modelcatActId, modelindex } = this.state

        let tempTable = tableData

        if (modelcatActId === null) {
            tempTable.splice(modelindex, 1)
            this.setState({
                tableData: tempTable
            })

        } else {
            workstreamActualsStore.deleteRisks(modelcatActId)
                .then((res) => {
                    if (res && res.data.resultCode === 'OK') {
                        this.getDeliverableRisks()
                        this.showErrorNotification('Deleted successfully', 'success', 'success')
                    } else if(res && res.data.resultCode === 'KO'){
                        this.showErrorNotification(res.data.errorDescription, 'Error', 'error')
                    }
                })

        }
    }
    showErrorNotification = (message, title, type) => {
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

    entryDateFilter(event, value, index) {
        const { workstreamActualsStore } = this.props;
        const { tableData, tempTable } = this.state
        let dateTemp
        let newTable = JSON.parse(JSON.stringify(tempTable))
        if (value === 'Select All') {
            tableData.map((entry, index) => {
                entry.checked = event.target.checked
                entry.display = event.target.checked
                return true
            })
            this.setEntryDatesArray()
            this.setState({
                tempTable: event.target.checked ? tableData : [],
                checkedValue: value,
                checkedStatus: event.target.checked
            })
        } else {
            workstreamActualsStore.tableData.map((entry, index) => {
                if (entry.openDate === "") {
                    dateTemp = "(Blanks)"
                } else {
                    dateTemp = Moment(entry.openDate).format('DD-MMM-YYYY')
                }
                if (dateTemp === value) {
                    if (event.target.checked === true) {
                        entry.checked = true
                        entry.display = true
                        if (newTable.filter(item => ((item.catActId !== null) && (item.catActId === entry.catActId)).length === 0)) {
                            newTable.push(entry)
                        }
                        else {
                            newTable.map(entry => {
                                if (Moment(entry.openDate).format('DD-MMM-YYYY') === value) {
                                    entry.display = true
                                }
                                return true
                            })
                        }
                    } else {
                        entry.checked = false
                        index = newTable.findIndex(x => x.catActId === entry.catActId);
                        newTable.splice(index, 1)
                    }
                }
                return true
            })
            this.setEntryDatesArray()
            this.setState({
                tempTable: newTable,
                checkedValue: value,
                checkedStatus: event.target.checked
            })
        }
    }

    closedDateFilter(event, value, index) {
        const { workstreamActualsStore } = this.props;
        const { tableData, tempTable } = this.state
        let dateTemp
        let newTable = JSON.parse(JSON.stringify(tempTable))
        if (value === 'Select All') {
            tableData.map((entry) => {
                entry.checked = event.target.checked
                entry.display = event.target.checked
                return true
            })
            this.setClosedDatesArray()
            this.setState({
                tempTable: event.target.checked ? tableData : [],
                checkedValue: value,
                checkedStatus: event.target.checked
            })
        } else {
            workstreamActualsStore.tableData.map((entry, index) => {
                if (entry.closedDate === "") {
                    dateTemp = "(Blanks)"
                } else {
                    dateTemp = Moment(entry.closedDate).format('DD-MMM-YYYY')
                }
                if (dateTemp === value) {
                    if (event.target.checked === true) {
                        entry.display = true
                        entry.checked = true
                        if (newTable.filter(item => ((item.catActId !== null) && (item.catActId === entry.catActId)).length === 0)) {
                            newTable.push(entry)
                        }
                        else {
                            newTable.map(entry => {
                                if (Moment(entry.closedDate).format('DD-MMM-YYYY') === value) {
                                    entry.display = true
                                }
                                return true
                            })
                        }
                    } else {
                        entry.checked = false
                        index = newTable.findIndex(x => x.catActId === entry.catActId);
                        newTable.splice(index, 1)

                    }
                }
                return true
            })
            this.setClosedDatesArray()
            this.setState({
                tempTable: newTable,
                checkedValue: value,
                checkedStatus: event.target.checked
            })
        }
    }

    setEntryDatesArray() {
        let entryDatesArray = []
        this.state.tableData.map((entry) => {
            let openDate = entry.openDate !== "" ? Moment(entry.openDate).format('DD-MMM-YYYY') : '(Blanks)'
            if (entryDatesArray.filter(item => item.openDate === openDate).length === 0) {
                entryDatesArray.push({
                    'openDate': entry.openDate === "" ? '(Blanks)' : Moment(entry.openDate).format('DD-MMM-YYYY'),
                    'checked': entry.checked
                })
            }
            return true
        })
        entryDatesArray.unshift({
            'openDate': 'Select All',
            'checked': entryDatesArray.filter(e => e.checked === false).length > 0 ? false : true
        })
        this.setState({
            entryDatesArray: entryDatesArray
        })
    }

    setClosedDatesArray() {
        let closedDatesArray = []
        this.state.tableData.map((entry) => {
            let closedDate = entry.closedDate !== "" ? Moment(entry.closedDate).format('DD-MMM-YYYY') : '(Blanks)'
            if (closedDatesArray.filter(item => item.closedDate === closedDate).length === 0) {
                closedDatesArray.push({
                    'closedDate': entry.closedDate !== "" ? Moment(entry.closedDate).format('DD-MMM-YYYY') : '(Blanks)',
                    'checked': entry.checked
                })
            }
            return true
        })
        closedDatesArray.unshift({
            'closedDate': 'Select All',
            'checked': closedDatesArray.filter(e => e.checked === false).length > 0 ? false : true
        })
        this.setState({
            closedDatesArray: closedDatesArray
        })
    }

    closeModal = () => {
        this.setState({
            checkedValue: null,
            checkedStatus: ''
        })
    }

    render() {
        const { tableData, tempTable, saveInprogress } = this.state;
        const { selectedLevel } = this.props;

        return (
            <div>
                <RisksTable
                    // tempTable={tempTable}
                    actualData={tableData}
                    tableData={tempTable}
                    addNewRisk={this.addNewRisk}
                    selectedLevel={selectedLevel}
                    onRiskDetailsChange={this.onRiskDetailsChange}
                    onDelRisksSave={this.onDelRisksSave}
                    deleteRisk={this.deleteRisk}
                    entryDateFilter={this.entryDateFilter}
                    closedDateFilter={this.closedDateFilter}
                    checkedValue={this.state.checkedValue}
                    closeModal={this.closeModal}
                    checkedStatus={this.state.checkedStatus}
                    isExpandBenefits={this.props.isExpandBenefits}
                    showClosedDates={this.state.closedDates}
                    saveInprogress={saveInprogress}
                    entryDatesArray={this.state.entryDatesArray}
                    setEntryDatesArray={this.setEntryDatesArray}
                    closedDatesArray={this.state.closedDatesArray}
                    setClosedDatesArray={this.setClosedDatesArray}
                    allSelected={tempTable.length === tableData.length}
                />
                <CustomConfirmModal
                    ownClassName={'commonData-existing-delete'}
                    isModalVisible={this.state.customDeleteRiskModalVisible}
                    modalTitle={this.state.customDeleteRiskModalTitle}
                    closeConfirmModal={this.closeCustomModelRiskDelete}
                />
            </div>


        )
    }
}

export default withRouter(RisksHome);