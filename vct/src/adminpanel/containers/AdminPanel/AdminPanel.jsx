import React, { Component, Fragment } from 'react';
import { withRouter, NavLink } from "react-router-dom"; import Menu from '../../../components/Menu/Menu';
import { routes } from '../../../constants';
import './AdminPanel.css';
import EditDriverImg from '../../../assets/admin/edit.svg';
import oppRequest from '../../../assets/admin/keyInsights.svg';
import { observer, inject } from 'mobx-react';
import cloudUpload from '../../../assets/admin/cloudUpload.svg';
import accessControl from '../../../assets/admin/AccessControl.svg';
import addEdit from '../../../assets/admin/AddEdit.svg';
import lock from '../../../assets/admin/lock.svg';
var sessionStorage = require('store/storages/sessionStorage');

@inject('adminStore')
@observer
class AdminPanel extends Component {
    // constructor(props) {
    //     super(props);
    // }

    componentDidMount() {
        const { adminStore } = this.props;
        adminStore.inAdminPanel = true;
        sessionStorage.write('tenantId', null)
    }
    componentWillUnmount() {
        const { adminStore } = this.props;
        adminStore.inAdminPanel = false;
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
    render() {
        const userType = sessionStorage.read("userType");
        const isSME = sessionStorage.read("isSME");
        return (
            <Fragment>
                <Menu />
                <div className="container-fluid" style={{ paddingLeft: '0px', paddingRight: '0px' }}>
                    <div className="row breadcrumb-row" >
                        <div className="col-sm-12">
                            <nav aria-label="breadcrumb">
                                <ol className="breadcrumb">
                                    <li className="breadcrumb-item" style={{ cursor: 'pointer' }} onClick={() => this.redirectHandler('home')}>Home</li>
                                    <li className="breadcrumb-item" style={{ cursor: 'pointer' }} onClick={() => this.redirectHandler('adminpanel')} aria-current="page">Admin Panel</li>

                                </ol>
                            </nav>
                        </div>
                    </div>

                    <div className="row justify-content-center">
                        <div className="col-sm-11">
                            <div className="row admin-option-box justify-content-center">
                                {userType === 'A' && <> 
                                <div className="col-sm-3">
                                    <NavLink to={routes.UPLOADVALUEDRIVER} style={{ textDecoration: 'none' }}>
                                        <div className="row admin-other-box">
                                            <div className="col-sm-12 text-center upload-text-align" >
                                                <img src={cloudUpload} alt="Edit Value Drivers" className="option-img option-upload" />
                                                {/* <i className="fa fa-cloud-upload option-icon"></i> */}
                                            </div>
                                            <div className="col-sm-12 text-center" style={{ marginTop: '20px' }}>
                                                <h5>Upload / Edit<br /> VDT Elements</h5>
                                            </div>


                                        </div>
                                    </NavLink>
                                </div>

                                <div className="col-sm-3">
                                    <NavLink to={routes.CLIENTMASTER} style={{ textDecoration: 'none' }}>
                                        <div className="row admin-other-box">
                                            <div className="col-sm-12 text-center" style={{ marginLeft: '15px' }} >
                                                <img src={addEdit} alt="Edit Value Drivers" className="option-img" />
                                            </div>
                                            <div className="col-sm-12 text-center" style={{ marginTop: '20px' }}>
                                                <h5>Add / Edit <br /> Client Master</h5>
                                            </div>
                                        </div>
                                    </NavLink>
                                </div>

                                <div className="col-sm-3">
                                    <NavLink to={routes.ACCESSCONTROL} style={{ textDecoration: 'none' }}>
                                        <div className="row admin-other-box">
                                            <div className="col-sm-12 text-center">
                                                <img src={lock} alt="Access Control" className="option-img" />
                                            </div>
                                            <div className="col-sm-12 text-center" style={{ marginTop: '20px' }}>
                                                <h5>Access<br /> Control</h5>
                                            </div>
                                        </div>
                                    </NavLink>
                                </div>
                                </>
                                }

                                {(userType === 'A' || userType === 'IL' || isSME === 'Y' ) && <>
                                <div className="col-sm-3">
                                    <NavLink to={routes.OPPORTUNITYREQUEST} style={{ textDecoration: 'none' }}>
                                        <div className="row admin-other-box">
                                            <div className="col-sm-12 text-center">
                                                <img src={oppRequest} alt="Access Control" className="option-img" />
                                            </div>
                                            <div className="col-sm-12 text-center" style={{ marginTop: '40px' }}>
                                                <h5>Opportunity / Program Delivery<br /> Requests</h5>
                                            </div>
                                        </div>
                                    </NavLink>
                                </div>
                                </>}
                            </div>
                        </div>
                    </div>
                </div>
            </Fragment >
        )
    }
}

export default withRouter(AdminPanel);