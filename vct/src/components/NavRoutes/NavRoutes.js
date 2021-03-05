import React from "react";
import { Route, Switch, withRouter } from "react-router-dom";

import { routes } from "../../constants";
import PrivateRoute from '../../containers/PrivateRoute/PrivateRoute';
import ProtectedAdminRoute from '../../containers/ProtectedRoute/ProtectedAdminRoute';
import ProtectedOfferingRoute from '../../containers/ProtectedRoute/ProtectedOfferingRoute';
import Login from "./../../containers/Login/Login";
import SalesDeliveryHome from '../../containers/Home/SalesDeliveryHome';
import FAQHome from '../../containers/FAQ/FAQHome';
import Contact from '../../containers/Contact/Contact';
import MyProjects from '../../containers/MyProjects/MyProjects';
import DemoProject from '../../containers/DemoProject/DemoProject';
import NewProject from '../../containers/NewProject/NewProject';
import ValueDrivers from '../../containers/ValueDrivers/ValueDrivers';
import FullScreenVDT from '../../containers/FullScreenVDT/FullScreenVDT';
import BusinessCase from '../../containers/DevelopBusinessCase/DevelopBusinessCase';
import ManuallySelectKpis from '../../containers/ManuallySelectKpis/ManuallySelectKpis';
import ReviewValueDriverTree from '../../containers/ReviewValueDriverTree/ReviewValueDriverTree';
import SalesHome from '../../containers/SalesHome/SalesHome';
import LandingPage from '../../containers/LandingPage/LandingPage';
import AdminPanel from '../../adminpanel/containers/AdminPanel/AdminPanel';
import ClientMasterHome from '../../adminpanel/containers/ClientMaster/ClientMasterHome';
import AccessManagement from '../../adminpanel/containers/AccessManagement/AccessManagement';
import OpportunityRequest from "../../adminpanel/containers/OpportunityRequest/OpportunityRequest";
import CaptureActuals from '../../containers/CaptureActuals/CaptureActuals';
import DefineWorkstreamHome from '../../containers/DefineWorkstream/DefineWsHome';
import UploadValueDriver from '../../adminpanel/containers/UploadValueDriver/UploadValueDriver';
import CreateMasterOffering from '../../containers/CreateMasterOffering/CreateMasterOffering';
import NoMatch from "../../containers/NoMatch/NoMatch";
import DashboardMain from "../../containers/Dashboards/DashboardMain";
import ChangePassword from "../../containers/Login/ChangePassword";
import ProtectedSalesDeliveryPageForEU from "../../containers/ProtectedRoute/ProtectedSalesDeliveryPageForEU"
import CreateNewProjectRoute from "../../containers/ProtectedRoute/CreateNewProjectRoute"
import CaptureActualsRoute from "../../containers/ProtectedRoute/CaptureActualsRoute"
import ProjectRoute from "../../containers/ProtectedRoute/ProjectRoute"
import AngularComponent from "../Angular/AngularComponent";


const NavRoutes = props => {
	return (
		<Switch>
			<Route exact path={routes.LOGIN} component={Login} />
			<PrivateRoute exact path={routes.HOME} component={LandingPage} />
			<PrivateRoute exact path={routes.LANDING} component={LandingPage} />
			<ProtectedSalesDeliveryPageForEU path={routes.SalesHome} component={SalesHome} />
			<PrivateRoute path={routes.SALESHOME} component={SalesDeliveryHome} />
			<ProtectedSalesDeliveryPageForEU path={routes.DELIVERYHOME} component={SalesDeliveryHome} />
			<PrivateRoute path={routes.VIDEO} component={FAQHome} />
			<PrivateRoute path={routes.MYPROJECTS} component={MyProjects} />
			<PrivateRoute path={routes.DEMOPROJECT} component={DemoProject} />
			<CreateNewProjectRoute path={routes.NEWPROJECT} component={NewProject} />
			<ProjectRoute path={routes.VALUEDRIVERS} component={ValueDrivers} />
			<ProjectRoute path={routes.BUSINESSCASE} component={BusinessCase} />
			<PrivateRoute path={routes.FULLSCREENVDT} component={FullScreenVDT} />
			<PrivateRoute path={routes.MANUALLYSELECTKPIS} component={ManuallySelectKpis} />
			<PrivateRoute path={routes.REVIEWVALUEDRIVERTREE} component={ReviewValueDriverTree} />
			<ProjectRoute path={routes.PUBLISHDASHBOARD} component={DashboardMain} />
			<ProtectedAdminRoute exact path={routes.ADMINPANEL} component={AdminPanel} />
			<ProtectedAdminRoute path={routes.CLIENTMASTER} component={ClientMasterHome} />
			<ProtectedAdminRoute path={routes.ACCESSCONTROL} component={AccessManagement} />
			<PrivateRoute path={routes.ACCESSMANAGEMENT} component={AccessManagement} />
			<ProtectedAdminRoute path={routes.OPPORTUNITYREQUEST} component={OpportunityRequest} />
			<CaptureActualsRoute path={routes.CAPTUREACTUALS} component={CaptureActuals} />
			<ProjectRoute path={routes.DEFINEWORKSTREAM} component={DefineWorkstreamHome} />
			<ProtectedAdminRoute path={routes.UPLOADVALUEDRIVER} component={UploadValueDriver} />
			<ProtectedOfferingRoute exact path={routes.MASTEROFFERING} component={CreateMasterOffering} />
			<ProtectedSalesDeliveryPageForEU path={routes.CHANGEPASSWORD} component={ChangePassword} />
			<ProtectedSalesDeliveryPageForEU path={routes.CONTACT} component={Contact} />
			<PrivateRoute path='/angular' component={LandingPage} />
			<PrivateRoute component={NoMatch} />
		</Switch>
	);
};

export default withRouter(NavRoutes);
