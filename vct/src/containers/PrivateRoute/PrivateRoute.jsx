// import React, { Component } from 'react';
// import { Route, Redirect } from 'react-router-dom';
// import { observer, inject } from 'mobx-react';

// import { routes } from '../../constants'

// class PrivateRoute extends Component {
//     render() {
//         const {
//             component: ChildComponent,
//             computedMatch,
//             loginStore,
//             path,
//             exact,
//             ...rest
//         } = this.props

//         if (SessionStorage.read('CognitoIdentityServiceProvider.v7o1l0ear033ks78jst5c7o34.LastAuthUser')) {
//             return (
//                 <Route 
//                     {...rest}
//                     render={() => <ChildComponent {...rest} />}
//                 />
//             )
//         }

//         return <Redirect to={routes.LOGIN} />
//     }
// }

// export default inject("loginStore")(observer(PrivateRoute));




import React from 'react';
import { Route, Redirect } from 'react-router-dom';
var SessionStorage = require('store/storages/sessionStorage');
const PrivateRoute = ({ component: Component, ...rest }) => (
   <Route {...rest} render={props => (
      SessionStorage.read('username')
         ? <Component {...props} />
         : <Redirect to={{ pathname: '/login', state: { from: props.location } }} />
   )} />
)
export default PrivateRoute;