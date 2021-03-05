import React, { Component } from 'react';
import { observer, inject } from 'mobx-react'
import Amplify, { Auth, Hub } from 'aws-amplify';
import './Login.css';
import OAuthButton from './OAuthButton';
import Logo from '../../assets/project/login/new-logo.svg';
import Storage from '@aws-amplify/storage';
import LandingPage from '../LandingPage/LandingPage'
import ForgotPassword from './ForgotPassword';
import ResetPasswordForm from './ResetPasswordForm';
import ResetFirstLoginForm from './ResetFirstLoginForm';
import Mfa from "./Mfa"
var SessionStorage = require('store/storages/sessionStorage');

Amplify.configure({
    Auth: {
        mandatorySignId: false,
        region: process.env.REACT_APP_REGION,
        userPoolId: process.env.REACT_APP_USER_POOL_ID,
        userPoolWebClientId: process.env.REACT_APP_CLIENT_ID,
        identityPoolId: process.env.REACT_APP_IDENTITY_POOL_ID,
    },
    Storage: {
        bucket: process.env.REACT_APP_BUCKET_NAME
    }
})
export function SetS3Config(bucket, level) {
    Storage.configure({
        bucket: bucket,
        level: "public",
        region: process.env.REACT_APP_REGION,
        identityPoolId: process.env.REACT_APP_IDENTITY_POOL_ID
    });
}

const oauth = {
    domain: process.env.REACT_APP_DOMAIN,
    scope: ['email', 'profile', 'openid', 'aws.cognito.signin.user.admin'],
    redirectSignIn: process.env.REACT_APP_REDIRECT_SIGNIN_URL,
    redirectSignOut: process.env.REACT_APP_REDIRECT_SIGNOUT_URL,
    responseType: 'code', // or 'token', note that REFRESH token will only be generated when the responseType is code    
    options: {
        // Indicates if the data collection is enabled to support Cognito advanced security features. By default, this flag is set to true.
        AdvancedSecurityDataCollectionFlag: true
    },
};

const environmentInfo = process.env;

Auth.configure({ oauth });

@inject('loginStore')
@observer
class Login extends Component {
    constructor(props) {
        super(props);
        this.state = {
            authState: 'loading',
            authData: null,
            authError: null,
            showLoadingInd: false,
            incorrectError: false,
            openForgotPwdForm: false,
            openExpiryPwdForm: false,
            userName: "",
            codeDeliveryDetails: {},
            openResetFirstLoginForm: false,
            userRes: "",
            openMfaLoginHandler: false,
            signInChallengeName :'',
            cognitoReq:''
        }
    }

    componentDidMount() {
        const { history } = this.props;

        Hub.listen('auth', (data) => {
            var loginUser = null;
            switch (data.payload.event) {
                case 'signIn':
                    sessionStorage.setItem('isAzureLogin', false);
                    this.setState({
                        authState: 'signedIn',
                        authData: data.payload.data,
                    });
                    // window.location.reload()
                    /*Commenting below lines to resolve mutliple saveUser request trigger. 
                        RCA: Hub.listen will be called multiple times during Auth.signIn which is behaviour 
                        of aws-amplify library. Hence multiple saveUser is triggered as it is inside event.*/
                    // Auth.currentAuthenticatedUser().then(user => {
                    //     const { loginStore } = this.props;
                    //     loginUser = user.username;
                    //     loginStore.setUsername(user.username)
                    //     const accessToken = user.signInUserSession.accessToken.jwtToken
                    //     SessionStorage.write('AccessToken', accessToken);
                    //     loginStore.saveUser(user.username)
                    //         .then(res => {
                    //             sessionStorage.clear();
                    //             SessionStorage.write("username", loginUser)
                    //             this.showLoading(false);
                    //             history.push(routes.LANDING);
                    //         }).catch(e => {
                    //             Auth.signOut().then((response) => {
                    //                 sessionStorage.clear()
                    //                 localStorage.clear();
                    //                 //window.location.reload();
                    //                 history.push(routes.LOGIN);
                    //             }).catch(ex => {
                    //                 console.log(ex);
                    //             });
                    //             this.showLoading(false);
                    //             console.log(e);
                    //         })
                    // }).catch(e => {
                    //     console.log(e);
                    //     this.setState({ authState: 'signIn' });
                    // });
                    // Amplify.Auth.currentCredentials().then((result) => {
                    //     console.log(result)
                    // })
                    break;
                case 'signIn_failure':
                    this.setState({ authState: 'signIn', authData: null, authError: data.payload.data });
                    // sessionStorage.clear();
                    sessionStorage.clear();
                    if (data.payload.data && (data.payload.data.code === 'UserNotFoundException' || data.payload.data.code === "UserLambdaValidationException" || data.payload.data.code === 'NotAuthorizedException')) {
                        let errorMsg = data.payload.data.code === "UserLambdaValidationException" && data.payload.data.message.split("error");
                        this.setState({
                            incorrectError: true,
                            showLoadingInd: false,
                            cognitoErrorMsg: data.payload.data.code === "UserLambdaValidationException" ? errorMsg[1] : data.payload.data.message
                        });
                    }

                    break;
                case 'signOut':
                    sessionStorage.clear();
                    localStorage.clear();
                    // window.location.reload();
                    break;
                default:
                    break;
            }
        });
    }

    goToHistory = (path) => {
        const { history } = this.props;
        history.push(path);
    }

    showLoading = (flag) => {
        this.setState({
            showLoadingInd: flag
       
        });

    }

    openForgotPasswordHandler = () => {
        this.setState({
            openForgotPwdForm: true
        });
    }

    closeForgetPasswordFormHandler = () => {
        this.setState({
            openForgotPwdForm: false
        })
    }
    openExpiryPasswordHandler = (userName) => {
        this.props.loginStore.getSecurityCode(userName).then(data => {
            if (data && !data.error && data.CodeDeliveryDetails) {
                this.setState({
                    codeDeliveryDetails: data.CodeDeliveryDetails,
                    openExpiryPwdForm: true,
                    userName: userName
                });
                this.showLoading(false)
            } else {
                this.setState({
                    codeDeliveryDetails: {},
                    openExpiryPwdForm: true,
                    userName: userName
                });
                this.showLoading(false)

            }
        }).catch(err => {
            this.setState({
                codeDeliveryDetails: {},
                openExpiryPwdForm: true,
                userName: userName
            });
            this.showLoading(false)
        })


    }

    closeExpiryPasswordHandler = () => {
        this.setState({
            openExpiryPwdForm: false,
        });
    }

    resetCodeDeliveryDetails = () => {
        this.setState({
            codeDeliveryDetails: {},
        });
    }


    openResetFirstLoginHandler = (userName, user) => {
        this.showLoading(false)
        this.setState({
            openResetFirstLoginForm: true,
            userName: userName,
            userRes: user
        });
    }

    closeResetFirstLoginHandler = (userName) => {
        this.setState({
            openResetFirstLoginForm: false,
            incorrectError: false
        });
    }

    openMfaLoginHandler = (userName, user,signInChallengeName,cognitoReq) => {
        this.setState({
            openMfaLoginHandler: true,
            userName: userName,
            userRes: user,
            signInChallengeName :signInChallengeName,
            cognitoReq : cognitoReq,
            showLoadingInd: false,
            openExpiryPwdForm: false,
            openForgotPwdForm: false,
            openResetFirstLoginForm: false,
        });
    }

    closeMfaLoginHandler = (userName) => {
        this.setState({
            openMfaLoginHandler: false,
            incorrectError: false
        });
    }
    goToAccentureLogin = (e) => {
        if (environmentInfo && environmentInfo.REACT_APP_BASE_URL) {
            if (environmentInfo.REACT_APP_BASE_URL === 'production') {
                sessionStorage.setItem('loggedButtonClick', true);
                const clientLoginURL = `https://valuecockpit.auth.us-east-1.amazoncognito.com/oauth2/authorize?client_id=6nnqe5mcm2imu3c4loag2936uc&response_type=code&scope=aws.cognito.signin.user.admin+email+openid+profile&redirect_uri=https://valuecockpit.accenture.com/&identity_provider=Accenture`;
                window.location.href = clientLoginURL;
            }
        }

    }


    render() {
        const user = localStorage.getItem("username");
        const loginBtn = sessionStorage.getItem('loggedButtonClick');
        const { userRes } = this.state;
        return user ? (
            <LandingPage />
        ) : (
                <div className="container-fluid login-body">
                    <div className="row login-center-main">
                        {this.state.showLoadingInd || (loginBtn === 'true') ?
                            <div className="loader-v-wrapper">
                                <div className="loader-login">

                                </div>
                                <span className="v-icon">V</span>
                            </div>
                            :
                            <div className="col-sm-7 login-box">
                                <div className="logo-form-wrapper row">
                                    <div className='col-sm-6 logo-div'>
                                        <div className="logo-wrapper">
                                            <img src={Logo} alt="Value Cockpit" className="mx-auto d-block" />
                                        </div>
                                    </div>
                                    <div className="col-sm-6">
                                        {this.state.openForgotPwdForm ?
                                            <ForgotPassword
                                                showLoading={this.showLoading}
                                                goToHistory={this.goToHistory}
                                                closeForgotPasswordForm={this.closeForgetPasswordFormHandler}
                                                openMfaLoginHandler={this.openMfaLoginHandler}
                                            /> : (this.state.openExpiryPwdForm ?
                                                <ResetPasswordForm    goToHistory={this.goToHistory} showLoading={this.showLoading} openExpiryPwdForm={this.state.openExpiryPwdForm} userName={this.state.userName} closeExpiryPasswordHandler={this.closeExpiryPasswordHandler} codeDeliveryDetails={this.state.codeDeliveryDetails} resetCodeDeliveryDetails={this.resetCodeDeliveryDetails} />
                                                : (this.state.openResetFirstLoginForm ?
                                                    <ResetFirstLoginForm   openMfaLoginHandler={this.openMfaLoginHandler} goToHistory={this.goToHistory} showLoading={this.showLoading} closeResetFirstLoginHandler={this.closeResetFirstLoginHandler} userName={this.state.userName} userRes={this.state.userRes} />
                                                    : (this.state.openMfaLoginHandler ? <Mfa cognitoReq ={this.state.cognitoReq} goToHistory={this.goToHistory} showLoading={this.showLoading} closeMfaLoginHandler={this.closeMfaLoginHandler} userName={this.state.userName} userRes={this.state.userRes} signInChallengeName ={this.state.signInChallengeName} /> : <OAuthButton
                                                        cognitoError={this.state.incorrectError}
                                                        cognitoErrorMsg={this.state.cognitoErrorMsg}
                                                        showLoading={this.showLoading}
                                                        openForgotPasswordHandler={this.openForgotPasswordHandler}
                                                        openExpiryPasswordHandler={this.openExpiryPasswordHandler}
                                                        openResetFirstLoginHandler={this.openResetFirstLoginHandler}
                                                        openMfaLoginHandler={this.openMfaLoginHandler}
                                                        goToAccentureLogin={this.goToAccentureLogin}
                                                        goToHistory={this.goToHistory} />

                                                    )))
                                        }

                                    </div>
                                </div>
                            </div>
                        }

                    </div>
                    <div className="row justify-content-end">

                    </div>
                </div>
            )
    }
}

export default Login