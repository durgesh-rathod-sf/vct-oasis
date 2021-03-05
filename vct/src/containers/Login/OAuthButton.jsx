import { withOAuth } from 'aws-amplify-react';
import React, { Component } from 'react';
import { Auth } from 'aws-amplify';
import Moment from 'moment';
import { observer, inject } from 'mobx-react';
import { AzureAD, LoginType, AuthenticationState } from 'react-aad-msal';
import NotificationMessage from '../../components/NotificationMessage/NotificationMessage';
import { routes } from "../../constants";
import { authProvider } from '../../authProvider';
import { toast } from 'react-toastify';
import disclaimer from "../../assets/home/disclaimer.svg";

var SessionStorage = require('store/storages/sessionStorage');

@inject('loginStore')
@observer
class OAuthButton extends Component {
  constructor(props) {
    super(props);
    // azure config
    const options = authProvider.getProviderOptions();
    options.loginType = LoginType.Redirect;
    authProvider.setProviderOptions(options);

    this.loginHandler = this.loginHandler.bind(this);
    this.usernameChangeHandler = this.usernameChangeHandler.bind(this);
    this.passwordChangeHandler = this.passwordChangeHandler.bind(this);
    this.state = {
      userName: '',
      password: '',
      mandatoryError: false,

      loginSuccess: false,
      loginError: false,
      limitExceedError: false,
      loginErrMsg: ''
    }
  }


  openChange = () => {

    this.props.goToHistory("/change-password");
    toast.dismiss("disclaimer")
  }

  showNotification = (type, message) => {
    switch (type) {
      case 'warn':
        toast.warn(
          <div>
            <div className="col-*" style={{ fontFamily: 'Graphik', fontSize: '14px', fontWeight: "700" }}>
              <span> <img src={disclaimer} alt="" id="disclaimer" />{' '} Alert</span>
            </div>
            <div className="col-*" style={{ fontFamily: 'Graphik', fontSize: '14px', color: "#ffffff", marginTop: "5px", paddingLeft: "37px" }}>
              <span>Dear User, your password will be expired in {message} {message > 1 ? "days" : "day"}. Click on <span style={{ fontWeight: "700", cursor: "pointer", textDecoration: "underline" }} onClick={() => this.openChange()}>Change Password</span></span>
            </div>
          </div>
          , {
            position: toast.POSITION.TOP_RIGHT,
            autoClose: false,
            className: "toastCSS",
            closeOnClick: false,
            toastId: "disclaimer"
          });
        break;
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
        console.log("Default");
        break;
    }
  }

  componentDidMount() {
    const { loginStore, history } = this.props;
    loginStore.isLoginError = false
    loginStore.loginErrorMessage = ''
  }

  checkValidation = () => {
    const { userName, password } = this.state;
    let errCount = 0;
    if (userName.trim() === '') {
      errCount++
    }
    if (password.trim() === '') {
      errCount++
    }
    return errCount;
  }

  loginHandler = (event) => {
    const { userName, password } = this.state;
    const { loginStore, history } = this.props;
    event.preventDefault();
    if (this.checkValidation() === 0) {
      // sessionStorage.setItem('loggedButtonClick', true);
      SessionStorage.write("username", userName)
      this.props.showLoading(true);
      try {
        this.props.loginStore.authSignIn(userName, password)
          .then((response) => {

            if (response && response.challengeName === "NEW_PASSWORD_REQUIRED") {
              this.props.openResetFirstLoginHandler(this.state.userName, response);
            } else if (response && response.challengeName === "SMS_MFA") {
              this.props.openMfaLoginHandler(this.state.userName,response,response.challengeName);
            }
            else if (response && !response.code) {
              loginStore.saveUser(response.username)
                .then(res => {
                  //let endDate = Moment(SessionStorage.read('endDate'), 'DD-MM-YYYY');
                  //let formattedEndDate = endDate.format('DD-MM-YYYY')
                  //console.log(endDate)
                  //let today = Moment().format('DD-MM-YYYY')
                  this.props.showLoading(false);
                  //console.log(today)

                  //if (formattedEndDate < today) {
                  if(res && res.data && res.data.resultCode === "KO"){
                    loginStore.isLoginError = true
                    loginStore.loginErrorMessage = res.data.errorDescription
                  } else {
                    var cognitoPasswordReq = {
                      "requestType": "ExpiredIn",
                      "user_name": userName
                    };
                    loginStore.validateOrUpdateCognitoUser(cognitoPasswordReq, null).then(res => {
                      if (res && res.data && res.data.body && res.data.body.resultCode === "OK" && res.data.body.resultObj && res.data.body.resultObj.showNotification) {
                        this.showNotification("warn", res.data.body.resultObj.daysLeft);
                      } else if (res && res.data && res.data.body && res.data.body.resultCode === "KO") {
                        this.showNotification("error", res.data.body.errorDescription);
                      }

                    }).catch(e => {
                      this.props.showLoading(false);
                      this.showNotification("error", e.message);
                    })
                    this.props.goToHistory(routes.HOME);
                  }
                }).catch(e => {
                  this.props.showLoading(false);
                  this.showNotification("error", e.message);
                });
            } else if (response && response.code === 'NotAuthorizedException') {
              let cognitoReq = {
                "requestType": "RemainingLoginAttempts",
                "user_name": userName
              }
              loginStore.validateOrUpdateCognitoUser(cognitoReq, "RemainingLoginAttempts").then(res => {
                if (res && res.data && res.data.body && res.data.body.resultCode === "OK" && res.data.body.resultObj) {
                  //this.setState({loginError : true, loginErrMsg :`Incorrect username or password. You have ${res.data.body.resultObj.RemainingAttempts} login attempts left` })
                  this.showNotification("error", `You have ${res.data.body.resultObj.RemainingAttempts} login attempts left`)
                  this.props.showLoading(false);
                } else {
                  this.props.showLoading(false);
                  this.showNotification("error", res && res.data && res.data.body && res.data.body.errorDescription)
                }
              }).catch(err => {
                this.props.showLoading(false);
                this.showNotification("error", err.message)
              })

            } else if (response && response.code === 'PasswordResetRequiredException') {
              this.props.openExpiryPasswordHandler(this.state.userName);
            } else if (response && response.code === 'LimitExceededException') {
              this.props.showLoading(false);
              this.setState({
                loginError: !this.state.loginError,
                loginErrMsg: response.message
              })
            } else {
              // this.props.showLoading(false);
              this.setState({
                loginError: !this.state.loginError,
                loginErrMsg: response.message
              })
            }
          })
          .catch(e => {
            this.props.showLoading(false);
            this.showNotification("error", e.message);
          });
      } catch (e) {
        this.props.showLoading(false);
        this.showNotification("error", e.message);
      }
    } else {
      if (process.env && process.env.REACT_APP_BASE_URL === 'productionb') {

      } else {
        this.setState({
          mandatoryError: true
        });
      }
    }

    // Auth.federatedSignIn();
  };
  signIn = (event) => {
    event();
  }

  signIn = (event) => {
    event();
  }

  jwtIdToken = (value) => {
    const { history } = this.props;
    const loggedUser = SessionStorage.read("username");
    if (!loggedUser) {
      const { loginStore } = this.props;
      this.props.showLoading(true);
      loginStore.setUsername(value.account.userName);
      sessionStorage.setItem('loggedButtonClick', true);
      sessionStorage.setItem("username", value.account.userName);
      sessionStorage.setItem('AccessToken', value.jwtIdToken);
      sessionStorage.setItem('isAzureLogin', true);

      loginStore.saveUser(value.account.userName)
        .then(res => {
          this.props.showLoading(false);
          this.props.goToHistory(routes.HOME);
        }).catch(e => {
          console.log(e);
          this.props.showLoading(false);
        })
    }

  }

  goToAccenture = (e) => {
    this.props.goToAccentureLogin();
  }


  usernameChangeHandler = (e) => {
    this.setState({
      userName: e.target.value
    });
  }

  passwordChangeHandler = (e) => {
    this.setState({
      password: e.target.value
    });
  }

  render() {
    const { loginError, loginErrMsg } = this.state;
    const { loginStore } = this.props;
    const loginBtn = sessionStorage.getItem('loggedButtonClick');
    const isAzureEnabled = () => {
      if (process.env && process.env.REACT_APP_AZURE_CLIENT_ID !== '') {
        return true;
      } else {
        return false;
      }
    }
    return (
      <div className="login-form-main">
        <div className="acc-id-wrapper">
          <div className="form-group">
            <AzureAD provider={authProvider}>
              {({ login, logout, authenticationState, accountInfo }) => {
                const isInProgress = authenticationState === AuthenticationState.InProgress;
                const isAuthenticated = authenticationState === AuthenticationState.Authenticated;
                const isUnauthenticated = authenticationState === AuthenticationState.Unauthenticated;
                if (isAuthenticated) {
                  this.jwtIdToken(accountInfo);
                  return (
                    null
                  );
                } else if (isUnauthenticated) {
                  return (
                    <div>
                      <button id="login_accenture_id" className="btn btn-primary " onClick={() => this.signIn(login)} disabled={isInProgress || !isAzureEnabled()}>
                        Sign In with Accenture ID
                </button>
                    </div>
                  );
                } else if (isInProgress) {
                  this.props.showLoading(true);
                  return (
                    <div>
                      <button id="login_accenture_id" className="btn btn-primary " onClick={() => this.signIn(login)} disabled={isInProgress || isAzureEnabled()}>
                        Sign In with Accenture ID
                </button>
                    </div>
                  );
                }
              }}
            </AzureAD>
          </div>
          <div className="or-wrapper">
            <span className="hr-class">
              <hr></hr>
            </span>
            <span className="or-class">Or</span>
            <span className="hr-class"><hr /></span>
          </div>
        </div>
        <div className="reg-user-wrapper">
          {
            this.props.cognitoError ?
              <div className="error-div">
                {this.props.cognitoErrorMsg}
              </div> :
              this.state.mandatoryError ?
                <div className="error-div">
                  Please fill out all fields.
                </div> :
                this.props.loginStore.isLoginError ?
                  <div className="error-div">
                    {this.props.loginStore.loginErrorMessage}
                  </div> :
                  loginError ?
                    <div className="error-div">
                      {loginErrMsg}
                    </div> : ''
          }
          <form className="login-form" onSubmit={(e) => { this.loginHandler(e) }} autoComplete="off">
            <div className="form-group">
              <label data-for="username" className="">User Name</label>
              <input type="text" name="username" id="username"
                autoComplete="new-password"
                value={this.state.userName}
                required
                onChange={(e) => { this.usernameChangeHandler(e) }}
                className="form-control" placeholder="User Name" />
            </div>
            <div className="form-group pwd-group">
              <label data-for="password" className="">Password</label>
              <input type="password" name="password" id="password" autoComplete="new-password"
                value={this.state.password}
                required
                onChange={(e) => { this.passwordChangeHandler(e) }}
                className="form-control" placeholder="Password" />
            </div>
            <div id="register-link" className="text-left">
              <a onClick={() => { this.props.openForgotPasswordHandler() }} className="forgot-link text-white">Forgot your password?</a>
            </div>
            <div className="sign-in-button-wrapper">
              <button
                type="submit"
                className={`btn btn-light ${(process.env && process.env.REACT_APP_BASE_URL === 'productionb') ? 'prodb-env' : ''}`}
                id="signIn"
                style={{
                  color: '#282828',
                  fontSize: '14px',
                }}
                // disabled={loginBtn ? true : false}
                onClick={(e) => { this.loginHandler(e) }}
              >
                Sign In {' '}
                {/* {loginBtn && <i className="fa fa-spinner fa-spin"></i>} */}
              </button>
            </div>

          </form>
        </div>

      </div >

    );
  }
}

export default withOAuth(OAuthButton);
