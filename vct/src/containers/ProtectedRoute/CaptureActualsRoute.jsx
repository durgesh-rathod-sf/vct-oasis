import React from 'react';
import { Route, Redirect } from 'react-router-dom';
import AccessDeniedPage from './AccessDeniedPage';

var SessionStorage = require('store/storages/sessionStorage');

const CaptureActualsRoute = ({ component: Component, ...rest }) => (
    <Route {...rest} render={props => (
        SessionStorage.read('username')
            ?
            (SessionStorage.read('option_selected') === "delivery") ? <Component {...props} /> : <AccessDeniedPage message="Navigate to Program Delivery to view this page." />
            :
            <Redirect to={{ pathname: '/login', state: { from: props.location } }} />
    )} />

)
export default CaptureActualsRoute;