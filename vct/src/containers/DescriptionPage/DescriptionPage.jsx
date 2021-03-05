import React, { Component, Fragment } from 'react';
import { withRouter } from "react-router-dom";

import Menu from '../../components/Menu/Menu';
import SalesImg from '../../assets/logo/sales_logo.png';
import DeliveryImg from '../../assets/logo/delivery_logo.png';

import { inject } from 'mobx-react';
var SessionStorage = require('store/storages/sessionStorage');

@inject('adminStore')

class LandingPage extends Component {
    constructor(props) {
        super(props)
        this.onNextClick = this.onNextClick.bind(this);
    }
    onNextClick() {
        const { history } = this.props;
        history.push('/home');
    }


    componentDidMount() {
        SessionStorage.write('option_selected', false);
        const { adminStore } = this.props;
        adminStore.inAdminPanel = true;
    }
    render() {
        return (
            <Fragment>
                <Menu />
                <div className="container-fluid">
                    <div className="row justify-content-center">
                        <div className="col-sm-12" style={{ textAlignLast: "center", paddingTop: "15%", color: "white" }}>
                            Description of tool for Sales team with diagram
                        </div>
                    </div>
                </div>
                <div className="col-sm-12" style={{ textAlignLast: "center", paddingTop: "20%" }}>
                    <button onClick={this.onNextClick}>Next</button>
                </div>
            </Fragment>
        )
    }
}

export default withRouter(LandingPage);