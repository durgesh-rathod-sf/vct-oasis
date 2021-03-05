
import React from 'react';
import { Route, Redirect } from 'react-router-dom';
import AccessDeniedPage from './AccessDeniedPage';
var SessionStorage = require('store/storages/sessionStorage');

const ProtectedSalesDeliveryPageForEU = ({ component: Component, ...rest }) => (
    <Route {...rest} render={props => (
        rest.path === "/change-password" ?
        SessionStorage.read('username')
        ? (SessionStorage.read('userType') === 'EU') ? <Component {...props} /> : <AccessDeniedPage />
        : <Redirect to={{ pathname: '/login', state: { from: props.location } }} />
        :
      SessionStorage.read('username')
         ? (SessionStorage.read('userType') !== 'EU') ? <Component {...props} /> : <AccessDeniedPage />
         : <Redirect to={{ pathname: '/login', state: { from: props.location } }} />
   )} />
   
)
export default ProtectedSalesDeliveryPageForEU;