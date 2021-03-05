
import React from 'react';
import { Route, Redirect } from 'react-router-dom';
import AccessDeniedPage from './AccessDeniedPage';
var SessionStorage = require('store/storages/sessionStorage');

const ProtectedOfferingRoute = ({ component: Component, ...rest }) => (
   <Route {...rest} render={props => (
      SessionStorage.read('username')
         ? (SessionStorage.read('userType') === 'A' || SessionStorage.read('userType') === 'O' || SessionStorage.read('userType') === 'C' || SessionStorage.read('userType') === 'IL' || SessionStorage.read("isSME")==='Y') ? <Component {...props} /> : <AccessDeniedPage />
         : <Redirect to={{ pathname: '/login', state: { from: props.location } }} />
   )} />
)
export default ProtectedOfferingRoute;