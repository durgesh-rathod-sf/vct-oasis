import React from 'react';
import { Route, Redirect } from 'react-router-dom';
import AccessDeniedPage from './AccessDeniedPage';

var SessionStorage = require('store/storages/sessionStorage');

const ProjectRoute = ({ component: Component, ...rest }) => (
    <Route {...rest} render={props => (
        SessionStorage.read('username')
            ?
            SessionStorage.read('projectName') ? <Component {...props} /> : <AccessDeniedPage message="Navigate to any project/opportunity to view this page." />
            :
            <Redirect to={{ pathname: '/login', state: { from: props.location } }} />
    )} />

)
export default ProjectRoute;