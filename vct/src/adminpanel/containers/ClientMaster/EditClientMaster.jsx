import React, { Component, Fragment } from 'react';
import { withRouter } from "react-router-dom";
import { inject } from 'mobx-react';
import { toast } from 'react-toastify';
import ReactTooltip from 'react-tooltip';


import NotificationMessage from '../../../components/NotificationMessage/NotificationMessage';
import CustomConfirmModal from '../../../components/CustomConfirmModal/CustomConfirmModal';
import './EditClientMaster.css';
import pencil from "../../../assets/admin/pencil.svg";
import trash from "../../../assets/admin/trash.svg";
import search from "../../../assets/admin/search.svg";

@inject('adminStore')
class EditClientMaster extends Component {
    constructor(props) {
        super(props);
        this.state = {
            accountList: [],
            showSpinner: true,
            searchString: '',
            noMatchData: false,
            deleteClientModalVisible: false,
            deleteClientModalTitle: '',
            deleteClientIndex: '',
            isEdited: false
        }

        this.objListRef = React.createRef();
        this.initialAccountList = [];

        this.isDefined = this.isDefined.bind(this);
        this.handleKeyDown = this.handleKeyDown.bind(this);
        this.showErrorNotification = this.showErrorNotification.bind(this);
        this.getAccountsData = this.getAccountsData.bind(this);
        this.openDeleteClientConfirmModal = this.openDeleteClientConfirmModal.bind(this);
        this.closeDeleteClientConfirmModal = this.closeDeleteClientConfirmModal.bind(this);
        this.deleteAccountConfirm = this.deleteAccountConfirm.bind(this);
    }

    componentDidMount() {
        this.getAccountsData();
    }

    getAccountsData = () => {
        const { adminStore } = this.props;
        adminStore.getAccountNames()
            .then(response => {
                if ((response && response.data) || (response && response.error)) {
                    if (response.data.resultCode === "OK") {
                        const objArray = response.data.resultObj;
                        const objMapArray = [...objArray];
                        objMapArray.map(obj => {
                            obj['isEdited'] = false;
                            return true;
                        });
                        this.initialAccountList = JSON.parse(JSON.stringify(objMapArray));
                        this.setState({
                            showSpinner: false,
                            accountList: objMapArray,
                            searchString: '',
                            noMatchData: false
                        });
                        this.objListRef.current.scrollTo(0, 0);
                    } else {
                        this.showErrorNotification(response.data.errorDescription, "Error", "error");
                    }
                } else {
                    this.setState({
                        showSpinner: false
                    });
                    this.showErrorNotification("Sorry! Something went wrong", "Error", "error");
                }
            });
    }

    editAccount = (e, accInd) => {
        const { accountList } = this.state;
        let accListArr = [...accountList];
        accListArr[accInd].isEdited = true;
        this.setState({
            accountList: accListArr
        });
    }

    changeNameHandler = (e, accInd) => {
        const { accountList } = this.state;
        let accListArr = [...accountList];
        accListArr[accInd].accountName = e.target.value;
        this.setState({
            accountList: accListArr,
            isEdited: true
        });
    }

    openDeleteClientConfirmModal = (title, index) => {
        this.setState({
            deleteClientModalVisible: true,
            deleteClientModalTitle: title,
            deleteClientIndex: index
        });
    }

    closeDeleteClientConfirmModal = (isYesClicked) => {
        this.setState({
            deleteClientModalVisible: false,
            deleteClientModalTitle: ''
        });
        if (isYesClicked) {
            //new delete function
            this.deleteAccountConfirm();
        } else {
            this.setState({
                deleteClientIndex: ''
            });

        }

    }

    deleteAccountConfirm = () => {
        const { accountList, deleteClientIndex } = this.state;
        const { adminStore } = this.props;


        let accListArr = JSON.parse(JSON.stringify(accountList));
        let tempObj = accListArr[deleteClientIndex];
        let id = tempObj['tenantId'];

        adminStore.deleteAccount(id)
            .then(response => {
                if (response && response.data.resultCode === 'OK') {
                    this.showErrorNotification('Account details deleted successfully', "Success", "success");

                    accListArr.splice(deleteClientIndex, 1);
                    // this.getAccountsData();
                    this.initialAccountList = this.initialAccountList.filter(obj => {
                        return obj['tenantId'] !== id
                    });
                    this.setState({
                        accountList: accListArr,
                        deleteClientIndex: ''
                    });
                } else if (response && response.data.resultCode === 'KO') {

                    this.showErrorNotification(response.data.resultDescription, "Error", "error");
                } else {
                    this.showErrorNotification("Sorry! Something went wrong", "Error", "error");
                }
            });

    }

    deleteAccount = (e, objInd) => {
        this.openDeleteClientConfirmModal('Are you sure you want to delete it?', objInd);

    }

    saveAccountNames = (e) => {
        const { accountList } = this.state;
        const { adminStore } = this.props;
        let accListArr = JSON.parse(JSON.stringify(accountList));
        let editedAccArray = [];
        editedAccArray = accListArr.filter((obj) => {
            return obj.isEdited;
        });
        if (editedAccArray.length > 0) {
            let toBeSavedArray = [];
            let mandatoryCount = 0;
            editedAccArray.map((obj) => {
                if (obj['accountName'].trim() !== '' && !RegExp(/[<>!'"[\]]/).test(obj['accountName'])) {
                    let tempObj = {
                        'tenantId': obj['tenantId'],
                        'accountName': obj['accountName'],
                        'isActive': obj['isActive']
                    }
                    toBeSavedArray.push(tempObj);
                } else {
                    mandatoryCount++;
                }
                return true;
            });
            if (mandatoryCount === 0) {
                this.setState({
                    showSpinner: true
                });

                adminStore.saveAccount(toBeSavedArray)
                    .then(response => {
                        if (response && response.data.resultCode === 'OK') {
                            this.showErrorNotification("Account details saved successfully", "Success", "success");
                            this.setState({
                                isEdited: false
                            })
                            this.getAccountsData();
                        } else if (response && response.data.resultCode === 'KO') {
                            this.setState({
                                showSpinner: false
                            });
                            this.showErrorNotification(response.data.errorDescription, "Error", "error");
                        } else {
                            this.showErrorNotification("Sorry! Something went wrong", "Error", "error");
                            this.setState({
                                showSpinner: false
                            });
                        }
                    });
            } else {
                this.showErrorNotification("Please enter valid account name. Special characters [ < ! ' \" > ] are invalid", "Save Error", "error");
            }
        } else {
        }
    }

    searchInputHandler = (e) => {
        this.setState({
            searchString: e.target.value
        });
    }

    searchAccount = (e) => {
        const { searchString } = this.state;
        let accListArr = JSON.parse(JSON.stringify(this.initialAccountList));
        if (searchString.trim() !== '') {
            let filteredList = [];
            let name = 'accountName';
            let noMatchedData = false;

            filteredList = accListArr.filter(obj => {
                if (obj[name].toLowerCase().includes(searchString.toLowerCase())) {
                    return obj;
                }
            });
            if (filteredList.length === 0) {
                noMatchedData = true;
            } else {
                noMatchedData = false;
            }
            this.setState({
                accountList: filteredList,
                noMatchData: noMatchedData
            }, () => {
                ReactTooltip.rebuild();
            });

        } else {
            this.setState({
                accountList: accListArr,
                noMatchData: true
            }, () => {
                ReactTooltip.rebuild();
            });

        }
    }

    // ----- START of Utility functions -------
    isDefined = (value) => {
        return value !== undefined && value !== null;
    }

    redirectHandler(type) {
        const { history } = this.props;
        // eslint-disable-next-line default-case
        switch (type) {
            case 'home':
                history.push('/home');
                break;
            case 'adminpanel':
                history.push('/admin');
                break;
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

    handleKeyDown = (e, type) => {
        if (e.key === 'Enter') {
            switch (type) {
                case 'search':
                    this.searchAccount(e);
                    break;
                case 'close':
                    this.redirectHandler('adminpanel');
                    break;
                case 'save':
                    this.saveAccountNames(e);
                    break;
                default:
                    break;
            }
        }
    }
    // ----- END of Utility functions -------

    render() {
        const { showSpinner, accountList, searchString, noMatchData } = this.state;
        const getTooltip = (value) => {
            return `${value}`;
        }

        return (
            <div className="admin-accounts-table-main" id="editCLientMaster">

                <div className="search-obj row">

                    <div className="row col-sm-12">

                        <div className="col-8">
                            <div className="obj-search-combo">
                                <div className="search-input">
                                    <input type="text"
                                        class="search-text"
                                        name="search objective"
                                        value={searchString}
                                        onChange={(e) => { this.searchInputHandler(e) }}
                                        onKeyDown={(e) => { this.handleKeyDown(e, 'search') }}
                                        tabIndex="1"
                                        placeholder="Search"
                                    ></input>
                                </div>
                                <div
                                    className="search-icon1" data-tip={getTooltip("Search")}
                                    tabIndex="1"
                                    onClick={(e) => { this.searchAccount(e) }}
                                    onKeyDown={(e) => { this.handleKeyDown(e, 'search') }}
                                >
                                    <img src={search} alt="search button" />
                                </div>
                                <ReactTooltip html={true} />
                            </div>
                        </div>

                    </div>
                </div>
                <div className="row col-sm-12" style={{ paddingRight: '0px' }}>
                    {showSpinner ?
                        <div className="row justify-content-center spinner-div">
                            <i className="fa fa-spinner fa-spin" style={{ height: "min-content", fontSize: '36px', color: '#ffffff' }}></i>

                        </div>
                        :

                        <div className="col-sm-12 account-list" ref={this.objListRef} >

                            {/* objective list map */}
                            <Fragment>
                                <div className="all-accounts-details-list">
                                    <div className="objc-header-row objc-row row">
                                        {/* <i className="fa fa-pencil"></i>
                                    <i className="fa fa-trash"></i> */}
                                        <div className="objc-header-name-row">
                                            <label className="lblAcc">Accounts</label>
                                            <label className="lblAction">Action</label>
                                        </div>
                                    </div>
                                    <div className="accounts-body-scroll">
                                        {accountList && accountList.map((objective, objIndex) => (
                                            <div key={objIndex} className="objc-row row">
                                                {/* <i className="fa fa-pencil"
                                                data-tip data-for='edit_obj'
                                                onClick={(e) => { this.editAccount(e, objIndex) }}
                                            ></i>
                                            <i className="fa fa-trash"
                                                data-tip data-for='delete_obj'
                                                onClick={(e) => { this.deleteAccount(e, objIndex) }}
                                            ></i> */}
                                                <div className="objc-name-row"  >
                                                    {objective.isEdited ?
                                                        <input id={objective.accountName}
                                                            className="editText" type="text" name="objective-name" value={objective.accountName}
                                                            maxLength="50"
                                                            tabIndex="2"
                                                            onChange={(e) => { this.changeNameHandler(e, objIndex) }}
                                                        ></input> :
                                                        <label style={{ verticalAlign: '-webkit-baseline-middle' }}>{objective.accountName}</label>
                                                    }

                                                    <i
                                                        className="fa fa-trash1"
                                                        data-tip data-for='delete_obj'
                                                        onClick={(e) => { this.deleteAccount(e, objIndex) }}
                                                    >
                                                        <img src={trash} alt=""
                                                            id={`${objective.accountName}_delete`} />
                                                    </i>
                                                    <i
                                                        className="fa fa-pencil1"
                                                        data-tip data-for='edit_obj'
                                                        onClick={(e) => { this.editAccount(e, objIndex) }}
                                                    >
                                                        <img src={pencil} alt=""
                                                            id={`${objective.accountName}_edit`} />
                                                    </i>



                                                </div>

                                            </div>

                                        ))
                                        }
                                    </div>
                                    {accountList && accountList.length === 0 && noMatchData ?
                                        <div className="objc-row row no-match-div">
                                            <p>No Accounts found.</p>
                                        </div>
                                        :
                                        ''
                                    }
                                </div>

                            </Fragment>
                            <ReactTooltip id='edit_obj'>
                                <span>Edit</span>
                            </ReactTooltip>
                            <ReactTooltip id='delete_obj'>
                                <span>Delete</span>
                            </ReactTooltip>
                        </div>
                    }
                </div>
                <div className='col-sm-9 buttondiv'>


                    <div className="cr-de-btn-div" style={{ paddingLeft: '0px' }}  >
                        <button alt="save Objectives"
                            disabled={showSpinner || !this.state.isEdited}
                            className="btn btn-primary"
                            //   data-tip={getTooltip('Save')}
                            data-for="saveIconToolTip"

                            onClick={showSpinner ? () => { } : (e) => { this.saveAccountNames(e) }}
                            onKeyDown={showSpinner ? () => { } : (e) => { this.handleKeyDown(e, 'save') }}
                        //  data-tip={getTooltip("Save")}
                        >Save</button>
                        {/* <ReactTooltip html={true} id="saveIconToolTip" place="top" /> */}
                        {/* 
      <div className="save-text"><span>save</span></div>
      */}
                    </div>

                </div>
                <CustomConfirmModal
                    ownClassName={'client-master-delete-modal'}
                    isModalVisible={this.state.deleteClientModalVisible}
                    modalTitle={this.state.deleteClientModalTitle}
                    closeConfirmModal={this.closeDeleteClientConfirmModal}
                />
            </div>


        )
    }
}

export default withRouter(EditClientMaster);