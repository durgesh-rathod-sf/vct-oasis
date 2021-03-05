import React, { Component } from 'react';
import { withRouter } from "react-router-dom";
import { inject } from 'mobx-react';
import Modal from 'react-bootstrap4-modal';
import 'moment-timezone';
import LinkKpiInvestments from '../../WorkstreamComponents/LinkKpiInvestments';
import './LinkedKpiCostCatHomeModal.css'


@inject('workstreamStore')
class LinkedKpiCostCatModalHome extends Component {
    
    componentDidMount() {
    }

    render() {
       
        return (
            <Modal id= 'link-kpi-modal' visible='true' className='kpicostcat-modal-main'>
                <LinkKpiInvestments closeLinkKpiView={this.props.closeLinkKpiView}/>
            </Modal>
        );
    }
}

export default withRouter(LinkedKpiCostCatModalHome);