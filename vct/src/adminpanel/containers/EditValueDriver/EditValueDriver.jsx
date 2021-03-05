import React, { Component, Fragment } from 'react';
import { withRouter } from "react-router-dom";
import Menu from '../../../components/Menu/Menu';
import EditValueDriverTable from '../EditValueDriverTable/EditValueDriverTable';
import VDTSearchCombo from '../../../containers/VDTSearchCombo/VDTSearchCombo';
import { observer, inject } from 'mobx-react';
import { toast } from 'react-toastify';
import ModalConfirmUpdate from "../../../components/ModalConfirm/ModalConfirmUpdate";
import NotificationMessage from '../../../components/NotificationMessage/NotificationMessage';

@inject('editVDTStore', 'reviewValueDriverStore')
@observer
class EditValueDriver extends Component {
    constructor(props) {
        super(props)
        this.state = {
            growthPillar: '',
            file: null,
            selectedGrowthPillar: '',
            selectedGrowthPillarValue: '',
            solutionType: '',
            selectedSolutionType: '',
            selectedSolutionTypeValue: '',
            subIndustry: '',
            selectedSubIndustry: '',
            selectedSubIndustryValue: '',
            errorMessage: '',
            files: {},
            cancelClicked: false,
            modalVisible: false,
        }

        this.redirectHandler = this.redirectHandler.bind(this);
        this.editVDTHandler = this.editVDTHandler.bind(this);
        this.uploadModifyRowsHandler = this.uploadModifyRowsHandler.bind(this);
        this.uploadModifyRowsHandler_withFlag = this.uploadModifyRowsHandler_withFlag.bind(this);

        this.deleteSelectedKPI = this.deleteSelectedKPI.bind(this);
        this.cancelSelection = this.cancelSelection.bind(this);
        this.enableGenerateVDT = this.enableGenerateVDT.bind(this)

    }
    developDriversHandler = (event) => {
        const { editVDTStore } = this.props;
        editVDTStore.selectedKPIIds = [];
        editVDTStore.selectedKPI = [];
        editVDTStore.selectedKPItoDelete = []
        editVDTStore.findWhenSelected = true;
        editVDTStore.cancelSelected = false;
        editVDTStore.selectedVDT = [];
        editVDTStore.findValueDrivers()
            .then((response) => {
                // if (response.error) {
                //     return {
                //         error: true
                //     }
                // } else {
                    if (response.data.resultCode === 'KO') {
                        this.showNotification('deleteRowsTest')
                    }
                // }

            })
    }

    enableGenerateVDT = (val) => {
        this.setState({
            enableGenerateVDTBtn: val
        })
    }

    componentDidMount() {
        const { reviewValueDriverStore, editVDTStore } = this.props
        reviewValueDriverStore.selectedGrowthPillar = ""
        reviewValueDriverStore.selectedSolutiontype = ""
        reviewValueDriverStore.selectedIndustry = ""
        editVDTStore.selectedKPIIds = []
        editVDTStore.selectedKPItoDelete = []
    }

    editVDTHandler(event) {
        // code to download the excel file to edit the rows
        //input will be kpi ids from editKPISTore.selectedkpis
        //hit editkpi api
        const { editVDTStore } = this.props;
        editVDTStore.selectedKPIIds = [];
        editVDTStore.selectedKPI.map((select) => {
            editVDTStore.selectedKPIIds.push(select.kpiId);
        });
        editVDTStore.editKPI(editVDTStore.selectedKPIIds)
            .then((response) => {
                // editVDTStore.selectedKPItoDelete=[]
                // if (response.error) {
                //     return {
                //         error: true
                //     }
                // } else {
                    if(response && response.data && response.data.resultCode === "OK"){
                    editVDTStore.selectedKPIIds = []
                    return true
                }else if (response.data.resultCode === 'KO') {
                    this.showErrorNotification(response.data.errorDescription);
                }
                // }
            })
    }

    deleteSelectedKPI(event) {
        // code to download the excel file to edit the rows
        //input will be kpi ids from editKPISTore.selectedkpis
        //hit editkpi api
        const { editVDTStore } = this.props;
        editVDTStore.selectedKPItoDeleteIDs = []
        editVDTStore.selectedKPItoDelete.map((select) => {
            editVDTStore.selectedKPItoDeleteIDs.push(select.kpiId);
        });
        editVDTStore.deleteKPI(editVDTStore.selectedKPItoDeleteIDs)
            .then((response) => {
                // if (response.error) {
                //     return {
                //         error: true
                //     }
                // } else {
                    if (response.data.resultCode === "OK") {
                        this.showNotification('deleteRows')
                        editVDTStore.selectedKPItoDeleteIDs = []
                        editVDTStore.selectedKPIIds = []
                        editVDTStore.selectedKPI = []
                        editVDTStore.selectedKPItoDelete = []
                    }else if(response.data.resultCode === "KO"){
                        this.showErrorNotification(response.data.errorDescription);
                    }
                    editVDTStore.findValueDrivers()
                        .then((driverResponse) => {
                            // if (driverResponse.error) {
                            //     return {
                            //         error: true
                            //     }
                            // } else {
                                if (driverResponse.data.resultCode === 'KO') {
                                    this.showNotification('deleteRowsTest')
                                }
                            // }

                        });
                    // return true
                // }

            })
    }

    uploadModifyRowsHandler(event) {
        // upload the downloaded excel
        //hit uploadvaluedrivers  api
        const { editVDTStore } = this.props;
        const file = event.target.files[0]
        this.setState({
            file: file
        })
        editVDTStore.uploadUpdatedKPI(file)
            .then((response) => {
                if (!response.error) {
                    if (editVDTStore.resultCode === "OK") {
                        this.showNotification('fileUploadSuccess')
                        editVDTStore.selectedKPIIds = [];
                        editVDTStore.selectedKPI = [];
                        editVDTStore.selectedKPItoDeleteIDs = []
                        editVDTStore.selectedKPItoDelete = []
                        editVDTStore.findWhenSelected = true;
                        editVDTStore.cancelSelected = false;
                        editVDTStore.selectedVDT = [];
                        editVDTStore.findValueDrivers()
                            .then((response) => {
                                // if (response.error) {
                                //     return {
                                //         error: true
                                //     }
                                // } else {
                                    if(response && response.data && response.data.resultCode === 'OK'){
                                        return true
                                    }else if (response && response.data && response.data.resultCode === 'KO') {
                                        this.showErrorNotification(response.data.errorDescription);
                                    }
                                // }
                            })
                        // 
                    } else {
                        this.setState({
                            errorMessage: editVDTStore.errorMessage
                        })
                        if (editVDTStore.errorMessage.includes("tool")) {
                            this.setState({
                                modalVisible: true
                            })
                        }
                        else {
                            this.showNotification("error")
                        }
                    }
                } else {
                    this.showNotification('fileUploadFailure')
                }
            })
    }

    uploadModifyRowsHandler_withFlag(event) {
        // upload the downloaded excel
        //hit uploadvaluedrivers  api
        const { editVDTStore } = this.props;
        const file = this.state.file;
        const flag = event.target.id
        editVDTStore.uploadUpdatedKPIwithFlag(file, flag)
            .then((response) => {
                if (!response.error) {
                    // console()
                    if (editVDTStore.resultCode === "OK") {
                        this.setState({
                            modalVisible: false
                        })
                        this.showNotification('fileUploadSuccess')
                        editVDTStore.selectedKPIIds = [];
                        editVDTStore.selectedKPI = [];
                        editVDTStore.findWhenSelected = true;
                        editVDTStore.cancelSelected = false;
                        editVDTStore.selectedVDT = [];
                        editVDTStore.findValueDrivers()
                            .then((response) => {
                                // if (response.error) {
                                //     return {
                                //         error: true
                                //     }
                                // } else {
                                    if(response && response.data && response.data.resultCode === 'OK'){
                                        return true
                                    }else if (response && response.data && response.data.resultCode === 'KO') {
                                        this.showErrorNotification(response.data.errorDescription);
                                    }
                                // }
                            })
                    } else {
                        this.setState({
                            errorMessage: editVDTStore.errorMessage,
                            modalVisible: false
                        })
                        this.showNotification("error")
                    }
                } else {
                    this.setState({
                        modalVisible: false
                    })
                    this.showNotification('fileUploadFailure')
                }
            })
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

    showNotification(type) {
        switch (type) {
            case 'fileUploadSuccess':
                toast.info(<NotificationMessage
                    title="Success"
                    bodytext={'Successfully uploaded file'}
                    icon="success"
                />, {
                    position: toast.POSITION.BOTTOM_RIGHT
                });
                break;
            case 'error':
                toast.error(<NotificationMessage
                    title="Error"
                    bodytext={this.state.errorMessage}
                    icon="error"
                />, {
                    position: toast.POSITION.BOTTOM_RIGHT
                });
                break;

            case 'fileUploadFailure':
                toast.error(<NotificationMessage
                    title="Error"
                    bodytext={'Sorry! File not uploaded. Try again'}
                    icon="error"
                />, {
                    position: toast.POSITION.BOTTOM_RIGHT
                });
                break;
            case 'FileDeleteSuccess':
                toast.info(<NotificationMessage
                    title="Success"
                    bodytext={'File deleted successfully'}
                    icon="success"
                />, {
                    position: toast.POSITION.BOTTOM_RIGHT
                });
                break;
            case 'FileDeleteFailure':
                toast.error(<NotificationMessage
                    title="Error"
                    bodytext={'Sorry! Unable to delete file. Try again'}
                    icon="success"
                />, {
                    position: toast.POSITION.BOTTOM_RIGHT
                });
                break;
            case 'deleteRows':
                toast.info(<NotificationMessage
                    title="Success"
                    bodytext={'Successfully deleted KPI(s)'}
                    icon="success"
                />, {
                    position: toast.POSITION.BOTTOM_RIGHT
                });
                break;
            case 'deleteRowsTest':
                toast.error(<NotificationMessage
                    title="error"
                    bodytext={'There is no KPI data for the given filter combination'}
                    icon="success"
                />, {
                    position: toast.POSITION.BOTTOM_RIGHT
                });
                break;
            default:
                console.log("");
                break;
        }
    }

    redirectHandler(type) {
        const { history } = this.props;
        // eslint-disable-next-line default-case
        switch (type) {
            case 'home':
                history.push('/');
                break;
            case 'adminpanel':
                history.push('/admin');
                break;
        }
    }

    cancelSelection() {
        const { editVDTStore } = this.props;
        editVDTStore.cancelSelected = true;
        editVDTStore.selectedVDT = [];
        // window.location.reload();
    }

    findValueDriversButtonEnable() {
        const { editVDTStore } = this.props;
        if ((editVDTStore.selectedSubIndustry.length !== 0)) {
            return false;
        }
        return true;
    }

    checkCancelEnabled() {
        const { editVDTStore } = this.props;
        if ((editVDTStore.findWhenSelected && editVDTStore.selectedVDT.length !== 0)) {
            return false;
        }
        return true;
    }

    checkEditEnabled() {
        const { editVDTStore } = this.props;
        if (editVDTStore.selectedKPI.length === 0) {
            return true;
        }
        return false;
    }

    checkDeleteEnabled() {
        const { editVDTStore } = this.props;
        if (editVDTStore.selectedKPItoDelete.length === 0) {
            return true;
        }
        return false;
    }

    render() {
        const isEnabled = this.findValueDriversButtonEnable();
        const isEditEnabled = this.checkEditEnabled();
        const isDeleteEnabled = this.checkEditEnabled();
        const isCancelEnabled = this.checkCancelEnabled();
        const { editVDTStore } = this.props;
        return (
            <Fragment>
                <Menu />
                <div className="container-fluid">
                    <div className="row">
                        <div className="col-sm-12">
                            <nav aria-label="breadcrumb">
                                <ol className="breadcrumb">
                                    <li className="breadcrumb-item" style={{ cursor: 'pointer' }} onClick={() => this.redirectHandler('home')}>Home</li>
                                    <li className="breadcrumb-item" style={{ cursor: 'pointer' }} onClick={() => this.redirectHandler('adminpanel')} aria-current="page">Admin Panel</li>
                                    <li className="breadcrumb-item active" aria-current="page">Edit Value Drivers</li>
                                </ol>
                            </nav>
                        </div>
                    </div>
                    <hr style={{ borderColor: '#ffffff', marginTop: '-1%' }} />
                    <div className="row">
                        <div className="col-sm-6">
                            <div className="col-sm-8 project-note">

                            </div>
                        </div>
                        <div className="col-sm-6">
                            {/* <label style = {{color: "white",marginLeft: "54%"}}> Upload to modify rows</label>
                            <input type="file" name="bfile" onChange={this.uploadModifyRowsHandler} style={{marginLeft: '50%',color: "white"}}/> */}
                            <button
                                type="button"
                                className="file uploadBtn btn btn-light"
                                onClick={this.generateKPITemplate}
                                style={{ width: '250px', fontWeight: '500', margin: '1%', marginLeft: "50%" }}
                            >
                                Upload to modify rows {" "}
                                <input type="file" name="file" id="file"
                                    onChange={(event) => {
                                        this.uploadModifyRowsHandler(event);
                                        event.target.value = null
                                    }}

                                />
                            </button>
                        </div>
                    </div>
                    <VDTSearchCombo enableGenerateVDT={this.enableGenerateVDT} isEditValueDriver={true} />
                    <div className="row">
                        <div className="col-sm-12" style={{ marginTop: '1%' }}>
                            <button
                                type="submit"
                                disabled={isEnabled}
                                className="btn btn-light float-right"
                                style={{
                                    fontWeight: 'bold',
                                    fontSize: '14px',
                                    width: '200px',
                                }}
                                onClick={this.developDriversHandler}
                            >
                                FIND VALUE DRIVERS
                            {this.state.generateKPI &&
                                    <i className="fa fa-spinner fa-spin" style={{ fontSize: '18px', color: '#000000' }}></i>}
                            </button>
                        </div>
                    </div>

                    <EditValueDriverTable />
                    <div className="row">
                        <div className="col-sm-12 text-center">
                            <button
                                type="button"
                                disabled={isEditEnabled}
                                className="btn btn-light"
                                style={{
                                    fontWeight: 'bold',
                                    fontSize: '14px',
                                    width: '200px',
                                    margin: '1%'
                                }}
                                onClick={this.editVDTHandler}
                            >
                                EDIT SELECTED &nbsp;
                                <i className="fa fa-edit"></i>
                                {this.state.generateKPI &&
                                    <i className="fa fa-spinner fa-spin" style={{ fontSize: '18px', color: '#000000' }}></i>}
                            </button>
                            <button
                                type="button"
                                disabled={isDeleteEnabled}
                                className="btn btn-light"
                                style={{
                                    fontWeight: 'bold',
                                    fontSize: '14px',
                                    width: '200px',
                                    margin: '1%'
                                }}
                                onClick={this.deleteSelectedKPI}
                            >
                                DELETE SELECTED &nbsp;
                                <i className="fa fa-trash"></i>
                                {this.state.generateKPI &&
                                    <i className="fa fa-spinner fa-spin" style={{ fontSize: '18px', color: '#000000' }}></i>}
                            </button>
                            <button
                                type="button"
                                disabled={isCancelEnabled}
                                className="btn btn-light"
                                style={{
                                    fontWeight: 'bold',
                                    fontSize: '14px',
                                    width: '200px',
                                    margin: '1%'
                                }}
                                onClick={this.cancelSelection}
                            >
                                CANCEL &nbsp;
                                &times;
                                {this.state.generateKPI &&
                                    <i className="fa fa-spinner fa-spin" style={{ fontSize: '18px', color: '#000000' }}></i>}
                            </button>

                        </div>
                    </div>
                </div>
                <ModalConfirmUpdate
                    visible={this.state.modalVisible}
                    uploadModifyRowsHandler_withFlag={this.uploadModifyRowsHandler_withFlag}
                    error={editVDTStore.errorMessage}
                />
            </Fragment>
        )
    }
}

export default withRouter(EditValueDriver)

