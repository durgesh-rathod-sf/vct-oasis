import React, { Component, Fragment } from 'react';
import { withRouter, NavLink } from "react-router-dom";
import { routes } from '../../constants';
import { Auth } from 'aws-amplify';
import { observer, inject } from 'mobx-react';
import IdleTimer from 'react-idle-timer';
import Modal from 'react-bootstrap4-modal';
import './Menu.css';
import { toast } from 'react-toastify';
import NotificationMessage from '../../components/NotificationMessage/NotificationMessage';
import { authProvider } from '../../authProvider';

import Logo from '../../assets/logo/logo.png';
import menuIco from '../../assets/menu/Menu.svg';
import closeIco from '../../assets/menu/close.svg';
var SessionStorage = require('store/storages/sessionStorage');

@inject('adminStore', 'myProjectStore')
@observer
class Menu extends Component {
	constructor(props) {
		super(props)
		this.onLogoutHandler = this.onLogoutHandler.bind(this);
		this.openSideNavHandler = this.openSideNavHandler.bind(this)
		this.closeSideNavHandler = this.closeSideNavHandler.bind(this)
		this.demoClickHandler = this.demoClickHandler.bind(this);
		this.projectClickHandler = this.projectClickHandler.bind(this);
		// this.openRightArrow=this.openRightArrow.bind(this);
		//  this.closeRightArrow=this.closeRightArrow(this);
		this.goToHome = this.goToHome.bind(this);
		this.state = {
			isActive: false,
			isIdle: false,
			idleTimer: null,
			timerId: null,
			username:null
		}

	}

	onLogoutHandler = (event) => {
		const { history } = this.props;
		SessionStorage.write('logoutClicked', true)
		if (SessionStorage.read('isAzureLogin') && SessionStorage.read('isAzureLogin') === 'true') {
			authProvider.logout();
			sessionStorage.clear()
			localStorage.clear();
			// history.push('/login');			

		} else {
			Auth.signOut().then((response) => {
				sessionStorage.clear()
				localStorage.clear();
				//window.location.reload();
				history.push('/login');
			}).catch(e => {
			});
		}
	}

	openSideNavHandler = (event) => {
		// if (userType === "A" || option !== "false") {
		document.getElementById("mySidenav").style.width = "350px";
		//document.getElementById("nav-item").style.marginRight = "300px";
		document.getElementById("sideNavOpen").style.display = "none";

		document.getElementById("sideNavClose").style.display = 'block';
		//	document.getElementById("main").style.opacity='0.3';




		// }
	}
	// openRightArrow=(event)=>
	// {
	// 	document.getElementById("rightArrow").style.display='block';
	// 	document.getElementById("menuIco").style.width= '0';
	// }
	// closeRightArrow=(event)=>
	// {
	// 	document.getElementById("rightArrow").style.display='none';
	// 	document.getElementById("menuIco").style.display= 'block';

	// }
	closeSideNavHandler = (event) => {
		document.getElementById("mySidenav").style.width = "0";
		// document.getElementById("main").style.marginLeft = "0";
		//document.getElementById("logo").style.display = 'block';
		//document.getElementById("nav-item").style.marginRight = "0px";
		document.getElementById("sideNavOpen").style.display = 'block';
		document.getElementById("sideNavClose").style.display = "none";
		//document.getElementById("main").style.opacity='1';

	}

	demoClickHandler = (event) => {
		const { history } = this.props
		SessionStorage.write('mapId', SessionStorage.read('demoMapId'))
		SessionStorage.write('demoUser', JSON.stringify(true));
		history.push("/deal");
	}

	projectClickHandler = (event, type) => {
		const { history } = this.props;
		
		SessionStorage.write('mapId', SessionStorage.read('mapId'))
		SessionStorage.write('demoUser', JSON.stringify(false));
		SessionStorage.write('option_selected', type === "Deal" ? "sales" : type === "Project" ?"delivery" :"");
		let userType = SessionStorage.read('userType');
		if (userType === 'U' && (type === 'Project' || type === 'Deal')) {
			const { myProjectStore } = this.props;
			myProjectStore.getProjectLists()
				.then((result) => {
					if (result && !result.error && result.resultCode === "OK") {
						if (result.resultObj[type].length === 0) {
							// alert("There are no " + type.toLowerCase() +"s created. Please reach out 'Sambit Banerjee' to get " + type.toLowerCase() + "s created as you dont have access to create.");
							this.showNotification('error', ("There are no " + type.toLowerCase() + "s created. Please reach out 'Sambit Banerjee' to get " + type.toLowerCase() + "s created as you dont have access to create."));
						} else {
							history.push("/my-deals");
						}
					} else if (result && result.resultCode === 'KO') {
						this.showNotification("error", result.errorDescription);
					}
				});
		} else {
			history.push("/my-deals");
		}
	}
	goToHome() {
		const { history } = this.props;
		history.push("/");
	}

	// idle timeout functions
	onIdle = () => {
		this.minuteTimeout = setTimeout(this.signout, 60000); // will wait for 1 minute and executes signout
		this.setState({
			isIdle: true,
			timerId: this.minuteTimeout
		})
	}
	onActive = () => {
		this.setState({
			isActive: true
		});
	}

	signout = () => {
		const { history } = this.props;
		SessionStorage.write('logoutClicked', true);
		if (SessionStorage.read('isAzureLogin') && SessionStorage.read('isAzureLogin') === 'true') {
			authProvider.logout();
			sessionStorage.clear()
			localStorage.clear();
			// history.push('/login');		

		} else {
			Auth.signOut().then((response) => {
				sessionStorage.clear()
				localStorage.clear();
				// window.location.reload();
				history.push('/login');
			}).catch(e => {
			});
		}
	}

	extendTheSession = () => {
		clearTimeout(this.state.timerId);

		this.setState({
			isIdle: false,
			isActive: true
		})
	}
	showNotification(type, message) {
		switch (type) {
			case 'error':
				toast.error(<NotificationMessage
					title="Error"
					bodytext={message}
					icon="error"
				/>, {
					position: toast.POSITION.BOTTOM_RIGHT
				});
				break;
			default:
				break;
		}
	}
	componentDidMount() {
		window.scrollTo(0,0);
		const user = SessionStorage.read('username');
		const userstring = user.split('_').pop().split('@')[0]
		const username = userstring.split('.')
		let tempUserName=''
		if(username.length>1){
			tempUserName=username[0].charAt(0).toUpperCase() + username[0].slice(1)+' '+username[1].charAt(0).toUpperCase() + username[1].slice(1)
		}
		else{
			tempUserName=username[0].charAt(0).toUpperCase() + username[0].slice(1)
		}
		this.setState({
			username:tempUserName
		})

    }

	render() {
		
		const userType = SessionStorage.read('userType');
		const isSME = SessionStorage.read("isSME");
		return (
			<Fragment>

				<div data-html2canvas-ignore="true" className="row" id="main" style={{ height: '80px', backgroundColor: '#3E3E3E', borderBottom: '2px solid #2d2d2d', padding: '10px' }}>
					<div className="col-sm-4">
						<nav className="nav">
							<li tabIndex="0" className="nav-link" style={{ outline: 'none', marginTop: '-4%', cursor: 'pointer', marginLeft: '-4%' }} onClick={this.goToHome}>
								<img src={Logo} id="logo" alt="Value Cockpit" className="menu-logo" />
							</li>
						</nav>
					</div>
					<div className="col-sm-8" style={{ paddingRight: '1px !important' }}>
						<ul className="nav justify-content-end">
							<li tabIndex="0" className="nav-item" style={{ paddingTop: "20px", color: '#ffffff', outline: 'none' }}>
								Welcome {this.state.username}
							</li>
							<li className="nav-item" style={{ paddingTop: "20px", paddingLeft: "11px", color: '#ffffff' }}>
								{" "}
							</li>
							<li tabIndex="0" id="sideNavOpen" style={{ paddingTop: '16px' }} className="nav-link" onClick={this.openSideNavHandler}>
								{/* <i className="fa fa-bars" style={{ fontSize: '48px', color: '#ffffff', cursor: 'pointer' }}></i> */}
								<img id="menuIco" src={menuIco} alt="" style={{ fontSize: '48px', color: '#ffffff', cursor: 'pointer', width: '20px' }} />
								{/* <img onMouseLeave={this.closeRightArrow}  id="rightArrow" src={rightarrow} style={{ fontSize: '48px', color: '#ffffff', cursor: 'pointer',display:'none'}} /> */}
							</li>


							<li tabIndex="0" id="sideNavClose" style={{ paddingTop: '16px' }} className="nav-link" onClick={this.closeSideNavHandler}>
								<img src={closeIco} alt="" style={{ fontSize: '48px', color: '#ffffff', cursor: 'pointer', width: '20px' }} />
								{/* <button className="btn closebtn" style={{ color: '#ffffff' }} onClick={this.closeSideNavHandler}>&times;</button> */}
							</li>
						</ul>
					</div>
				</div>
				<div data-html2canvas-ignore="true" id="mySidenav" className="sidenav">
					<ul>
						<li>
							<div className="row">
								<div className="col-sm-2">
									<button className="btn closebtn" style={{ color: '#ffffff' }} onClick={this.closeSideNavHandler}>&times;</button>
								</div>
							</div>
						</li>
						{/* {userType && userType === "A" && this.props.location.pathname !== "/" ?
      <li style={{ padding: '8px 8px 8px' }}>
      <NavLink
      to={routes.HOME}
      style={{ fontWeight: '400', textDecoration: 'none', color: '#ffffff' }}
      >
      <span
      style={{ fontWeight: '400', fontSize: '14px', textDecoration: 'none', color: '#ffffff', cursor: 'pointer' }}
      onClick={(e) => {this.projectClickHandler(e, 'home')}}
      >
      <div className="row" style={{ marginLeft: '6%' }}>
      <img src={HomeIco} className="menu-icons" alt="Home" /> 
      {' '}
      <p> Home</p>
</div>
</span>
</NavLink>
</li> : ''}
{
option === 'delivery' && inAdminPanel !== true ?
<Fragment>
<li style={{ padding: '8px 8px 8px' }}>
<NavLink to={routes.VIDEO} style={{ fontWeight: '400', textDecoration: 'none', color:'#ffffff',cursor: 'pointer' }} >
<div className="row" style={{ marginLeft: '6%' }}>
<img src={VideoIco} className="menu-icons" alt="How to use" /> 
{' '}<p>How to use</p>
</div>
</NavLink>
</li>
<li style={{ padding: '8px 8px 8px' }}>
<NavLink
to={routes.CONTACT}
style={{ fontWeight: '400', textDecoration: 'none', color: '#ffffff' }}
>
<div className="row" style={{ marginLeft: '6%' }}>
<img src={ContactIco} className="menu-icons" alt="Contact us" /> 
{' '}<p>Contact Us</p>
</div>
</NavLink>
</li>
<li style={{ padding: '8px 8px 8px 42px'}}>
<span
style={{ fontWeight: '400',fontSize: '14px', textDecoration: 'none', color: '#ffffff', cursor: 'pointer' }}
onClick={this.demoClickHandler}
>
<div className="row" style={{ marginLeft: '4%' }}>
<img src={DemoProjectIco} className="menu-icons" alt="Demo project" /> 
{' '} <p>Demo Project</p>
</div>
</span>
</li>
{userType !== 'D' ?
<Fragment>
<li style={{ padding: '8px 8px 8px 42px' }}>
<span
style={{ fontWeight: '400', fontSize: '14px', textDecoration: 'none', color: '#ffffff', cursor: 'pointer' }}
onClick={(e) => {this.projectClickHandler(e, 'Project')}}
>
<div className="row" style={{ marginLeft: '4%' }}>
<img src={MyProjectIco} className="menu-icons" alt="My Project" />
{' '} <p>My Projects</p>
</div>
</span>
</li>
</Fragment> : ''}
</Fragment> : ''
}
{
option === 'sales' && inAdminPanel !== true ?
<Fragment>
<li style={{ padding: '8px 8px 8px' }}>
<NavLink to={routes.VIDEO} style={{ fontWeight: '400', textDecoration: 'none', color: '#ffffff' }} >
<div className="row" style={{ marginLeft: '6%' }}>
<img src={VideoIco} className="menu-icons" alt="How to use" /> 
{' '}<p>How to use</p>
</div>
</NavLink>
</li>
<li style={{ padding: '8px 8px 8px' }}>
<NavLink
to={routes.CONTACT}
style={{ fontWeight: '400', textDecoration: 'none', color: '#ffffff' }}
>
<div className="row" style={{ marginLeft: '6%' }}>
<img src={ContactIco} className="menu-icons" alt="Contact us" /> 
{' '}<p>Contact Us</p>
</div>
</NavLink>
</li>
<li style={{ padding: '8px 8px 8px 42px' }}>
<span
style={{ fontWeight: '400', fontSize: '14px', textDecoration: 'none', color: '#ffffff', cursor: 'pointer' }}
onClick={this.demoClickHandler}
>
<div className="row" style={{ marginLeft: '6%' }}>
<img src={DemoProjectIco} className="menu-icons" alt="Demo project" /> 
{' '}<p> Demo Deal</p>
</div>
</span>
</li>
{userType !== 'D' ?
<li style={{ padding: '8px 8px 8px 42px' }}>
<span
style={{ fontWeight: '400', fontSize: '14px', textDecoration: 'none', color: '#ffffff', cursor: 'pointer' }}
onClick={(e) => {this.projectClickHandler(e, 'Deal')}}
>
<div className="row" style={{ marginLeft: '6%' }}>
<img src={MyProjectIco} className="menu-icons" alt="My Project" /> 
{' '}<p> My Deals</p>
</div>
</span>
</li> : ''}
</Fragment> : ''
} */}
						{userType && (userType === "A" || isSME === 'Y') ?
							<li style={{ padding: '8px 8px 8px' }}>
								<NavLink
									to={routes.ADMINPANEL}
									style={{ fontWeight: '400', textDecoration: 'none', color: '#ffffff' }}
								>
									<span
										style={{ fontWeight: '400', fontSize: '16px', textDecoration: 'none', color: '#ffffff', cursor: 'pointer' }}
										onClick={(e) => { this.projectClickHandler(e, 'admin') }}
									>
										<div className="row" style={{ marginLeft: '6%' }}>
											{/* <img src={AdminIco} className="menu-icons" alt="Admin Panel" /> */}
											{' '}<p> Admin Panel</p>
										</div>
									</span>
								</NavLink>
							</li> : ''}
							{userType && (userType === "IL" || userType === "O" || userType === 'C') ?
							<li style={{ padding: '8px 8px 8px' }}>
							<NavLink
								to={routes.ACCESSMANAGEMENT}
								style={{ fontWeight: '400', textDecoration: 'none', color: '#ffffff' }}
							>
								<span
									style={{ fontWeight: '400', fontSize: '16px', textDecoration: 'none', color: '#ffffff', cursor: 'pointer' }}
									onClick={(e) => { this.projectClickHandler(e, 'access-management') }}
								>
									<div className="row" style={{ marginLeft: '6%' }}>
										{/* <img src={HomeIco} className="menu-icons" alt="Home" /> */}
										{' '}<p> Access Management</p>
									</div>
								</span>
							</NavLink>
						</li> : '' }
						<li style={{ padding: '8px 8px 8px' }}>
							<NavLink
								to={routes.HOME}
								style={{ fontWeight: '400', textDecoration: 'none', color: '#ffffff' }}
							>
								<span
									style={{ fontWeight: '400', fontSize: '16px', textDecoration: 'none', color: '#ffffff', cursor: 'pointer' }}
									onClick={(e) => { this.projectClickHandler(e, 'home') }}
								>
									<div className="row" style={{ marginLeft: '6%' }}>
										{/* <img src={HomeIco} className="menu-icons" alt="Home" /> */}
										{' '}<p> Home</p>
									</div>
								</span>
							</NavLink>
						</li>
						<li style={{ padding: '8px 8px 8px' }}>
							<NavLink
							
								to={(SessionStorage.read("userType") === "EU" ? routes.MYPROJECTS : routes.SalesHome)}
								style={{ fontWeight: '400', textDecoration: 'none', color: '#ffffff' }}
							>
								<span
								
									style={{ fontWeight: '400', fontSize: '16px', textDecoration: 'none', color: '#ffffff', cursor: 'pointer' }}
									onClick={(e) => { this.projectClickHandler(e, (SessionStorage.read("userType") === "EU" ? "Deal": 'sales') )}}
								>
									<div className="row" style={{ marginLeft: '6%' }}>
										{/* <img src={HomeIco} className="menu-icons" alt="Home" /> */}
										{' '}<p>Opportunity</p>
									</div>
								</span>
							</NavLink>
						</li>
						<li style={{ padding: '8px 8px 8px' }}>
							<NavLink
							
								to={(SessionStorage.read("userType") === "EU" ? routes.MYPROJECTS :routes.DELIVERYHOME)}
								style={{ fontWeight: '400', textDecoration: 'none', color: '#ffffff' }}
							>
								<span
							
									style={{ fontWeight: '400', fontSize: '16px', textDecoration: 'none', color: '#ffffff', cursor: 'pointer' }}
									onClick={(e) => { this.projectClickHandler(e, 'Project') }}
								>
									<div className="row" style={{ marginLeft: '6%' }}>
										{/* <img src={HomeIco} className="menu-icons" alt="Home" /> */}
										{' '}<p>Program Delivery</p>
									</div>
								</span>
							</NavLink>
						</li>
						<li style={{ padding: '8px 8px 8px' }}>
							<NavLink to={routes.VIDEO} style={{ fontWeight: '400', fontSize: '16px', textDecoration: 'none', color: '#ffffff', cursor: 'pointer' }} >
								<div className="row" style={{ marginLeft: '6%' }}>
									{/* <img src={VideoIco} className="menu-icons" alt="How to use" /> */}
									{' '}<p>How To Use</p>
								</div>
							</NavLink>
						</li>
						{SessionStorage.read('userType') !== 'EU' && <li style={{ padding: '8px 8px 8px' }}>
							<NavLink
								to={routes.CONTACT}
								style={{ fontWeight: '400', fontSize: '16px', textDecoration: 'none', color: '#ffffff' }}
							>
								<div className="row" style={{ marginLeft: '6%' }}>
									{/* <img src={ContactIco} className="menu-icons" alt="Contact us" /> */}
									{' '}<p>Contact Us</p>
								</div>
							</NavLink>
						</li>}
					{SessionStorage.read("userType") === "EU" && <li style={{ padding: '8px 8px 8px' }}>
 							<NavLink
 								to={routes.CHANGEPASSWORD}
 								style={{ fontWeight: '400', fontSize: '16px', textDecoration: 'none', color: '#ffffff' }}
 							>
 								<div className="row" style={{ marginLeft: '6%' }}>
 									{/* <img src={ContactIco} className="menu-icons" alt="Contact us" /> */}
 									{' '}<p>Change Password</p>
 								</div>
 							</NavLink>
	 						</li>}
						<li onClick={this.onLogoutHandler} style={{ textAlign: 'left', padding: '8px 8px 8px', cursor: 'pointer' }} >
							<button tabIndex="-1" className="btn" style={{ fontWeight: '400', fontSize: '16px', textDecoration: 'none', color: '#ffffff', cursor: 'pointer' }}>
								<div className="row" style={{ marginLeft: '40px' }}>
									Logout</div></button>
						</li>
					</ul>
				</div>
				{SessionStorage.read('AccessToken') &&
					<div>
						{/* idle timeout is 15 minutes */}
						<IdleTimer
							element={document}
							onActive={this.onActive}
							onIdle={this.onIdle}
							timeout={1000 * 60 * 55} />
						<Modal className="timeout-modal" visible={this.state.isIdle}>
							<div className="modal-header">
								<h5 className="modal-title">You Have Been Idle!</h5>
							</div>
							<div className="modal-body">
								<p>Your session will be timed out in next 1 minute. Please click OK to Stay in the session</p>
							</div>
							<div className="modal-footer">
								<button type="button" className="btn btn-primary" onClick={() => { this.extendTheSession() }}>OK</button>
							</div>
						</Modal>
					</div>
				}
			</Fragment>
		)
	}
}

export default withRouter(Menu);