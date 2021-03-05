import React, { Component, Fragment } from 'react';
import { withRouter } from "react-router-dom";
import Menu from '../../../components/Menu/Menu';
import { toast } from 'react-toastify';
import NotificationMessage from '../../../components/NotificationMessage/NotificationMessage';

import './ClientMasterHome.css';
import AddClientMaster from './AddClientMaster';
import EditClientMaster from './EditClientMaster';

import { observer, inject } from 'mobx-react';


@inject('adminStore')
@observer
class ClientMasterHome extends Component {

    constructor(props) {
        super(props);
        this.state = {
            addAccount: true,
            loader: false,
            accountName: '',
            accountNameError: '',
            isSaveLoading:false
        };

        this.redirectHandler = this.redirectHandler.bind(this);
        this.showNotification = this.showNotification.bind(this);
    }

    onAddOrDeleteSelected = (event) => {
        const { accountName, accountNameError } = this.state;
        let name = accountName;
        let error = accountNameError;
        let addAcc = true;
        if (event.target.id === 'Add') {
            addAcc = true;
        } else {
            name = '';
            addAcc = false;
            error = '';
        }
        this.setState({
            addAccount: addAcc,
            accountName: name,
            accountNameError: error,
        });
    }

    onAccountInputChange = (event) => {
        let errors = !RegExp(/[<>!'"[\]]/).test(event.target.value) ? '' : 'Please enter valid account name. Special characters [ < ! \' " > ] are invalid';
        this.setState({
            accountName: event.target.value,
            accountNameError: errors,
        })
    }

    saveAccount = (event) => {
        event.preventDefault();
        this.setState({
            loader: true,
            isSaveLoading:true
        });
        const { accountName, accountNameError } = this.state;
        const { adminStore } = this.props;
        if (accountName.trim() !== '' && accountNameError === '') {
            const payload = [{
                'tenantId': '',
                'accountName': accountName,
                'isActive': ''
            }];

            adminStore.saveAccount(payload)
                .then((response) => {
                    // if (response.error) {
                    //     return {
                    //         error: true
                    //     }
                    // } else {
                        if (response && response.data.resultCode === 'OK') {
                            this.showNotification('saveSuccess', 'Data saved successfully')
                            this.setState({
                                accountName: '',
                                loader: false,
                                isSaveLoading: false,
                            });
                        } else if (response && response.data.resultCode === 'KO') {
                            this.showNotification('saveError', response.data.errorDescription)
                            this.setState({
                                loader: false,
                                isSaveLoading: false,
                            });
                        } else {
                            this.showNotification('saveError', 'Sorry! Something went wrong');
                            this.setState({
                                loader: false,
                                isSaveLoading: false,
                            })
                        }
                    // }

                });
        } else {
            this.showNotification('saveError', 'Please enter the mandatory field with valid value and try again');
            this.setState({
                loader: false,
                isSaveLoading: false,
            });
        }
    }

    // utility functions
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

    showNotification(type, msg) {
        switch (type) {

            case 'saveSuccess':
                toast.info(<NotificationMessage
                    title="Success"
                    bodytext={msg}
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

            default:
                break;
        }
    }

    /// end of utility functions

    render() {
        const { addAccount, loader, accountName, accountNameError } = this.state;

        return (
            <Fragment>
                <Menu />
                <div className="container-fluid client-master-main" style={{ paddingRight: '0px' }}>
                    <div className="row" style={{ backgroundColor: '#3B3B3B'}} >
                        <div className="col-sm-12">
                            <nav aria-label="breadcrumb">
                                <ol className="breadcrumb">
                                    <li className="breadcrumb-item" style={{ cursor: 'pointer' }} onClick={() => this.redirectHandler('home')}>Home</li>
                                    <li className="breadcrumb-item" style={{ cursor: 'pointer' }} onClick={() => this.redirectHandler('adminpanel')} aria-current="page">Admin Panel</li>
                                    <li className="breadcrumb-item active" aria-current="page">Add / Edit Client Master</li>
                                </ol>
                            </nav>
                        </div>
                    </div>
                    <div className="row col-sm-12" id="cmH">

                        <ul class="nav nav-tabs tab_menu">
                            <li style={{ width: '5%' }} className={this.state.addAccount === true ? "active" : ""} data-toggle="tab" id="Add" onClick={this.onAddOrDeleteSelected}>Add</li>
                            <li style={{ width: '5%' }} className={this.state.addAccount === false ? "active" : ""} data-toggle="tab" id="EditOrDelete" onClick={this.onAddOrDeleteSelected} >Edit
                                </li>
                            <li style={{ width: '90%' }}  ></li>

                        </ul>

                    </div>


                    <div className="row mainContainer">

                        <div className="col-sm-12">
                            {addAccount ?
                                <AddClientMaster
                                    redirectHandler={this.redirectHandler}
                                    loader={loader}
                                    saveAccount={this.saveAccount}
                                    isSaveLoading={this.state.isSaveLoading}
                                    accountName={accountName}
                                    accountNameError={accountNameError}
                                    onAccountInputChange={this.onAccountInputChange}
                                ></AddClientMaster>
                                :
                                <EditClientMaster></EditClientMaster>
                            }
                        </div>
                    </div>
                </div>
            </Fragment>
        )
    }

}

export default withRouter(ClientMasterHome);