import React from 'react';
import './AccessDenied.css';
import { withRouter } from "react-router-dom";
var SessionStorage = require('store/storages/sessionStorage');

const AccessDeniedPage = (props) => {

    const goHome = () => {
        const { history } = props;
        if (props.message)
            window.alert(props.message)
        else
            window.alert('Access Denied ! You do not have access to this page')
        history.go(-1);
    }

    return (
        <div onLoad={goHome()}></div>

        // <Modal className="ad-modal" visible={userType === 'D'}
        // style={{display: 'grid'}}>
        //     <div className="modal-header">
        //         <h5 className="modal-title">Access Denied !</h5>
        //     </div>
        //     <div className="modal-body">
        //         <p>You do not have Access to this page.</p>
        //     </div>
        //     <div className="modal-footer">
        //         <button type="button" className="btn btn-primary" onClick={() => {history.push('/home')}}>OK</button>
        //     </div>
        // </Modal>
    )
}

export default withRouter(AccessDeniedPage);