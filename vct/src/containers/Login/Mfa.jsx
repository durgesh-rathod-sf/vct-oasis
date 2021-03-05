import React, { Component } from 'react';
import { observer, inject } from 'mobx-react'
import { Auth } from 'aws-amplify';
import { toast } from 'react-toastify';
import NotificationMessage from '../../components/NotificationMessage/NotificationMessage';
import eye from "../../assets/home/eye.svg"
import disclaimer from "../../assets/home/disclaimer.svg";

@inject('loginStore')
@observer
class Mfa extends Component {
    constructor(props) {
        super(props);
        this.state = {
            code: '',
            codeError: '',

            loader: false,
            resetLoader: false,
            codeDeliveryDetails: {},
            disableSave: false,

        }
    }

    inputChangeHandler = (event) => {
        let validCode = !event.target.value || 0 === event.target.value.length || !event.target.value.trim() ? "" : event.target.value;
        validCode =  validCode.replace(/\s/g, "");
        if (event.target.id === "code") {
            this.setState({ code: validCode, codeError: '' });
        }
    }

    openChange = () =>{

        this.props.goToHistory("/change-password");
        toast.dismiss("disclaimer")
      }
    showNotification = (type, message) => {
        switch (type) {
            case 'warn':
                toast.warn(
                  <div>
                    <div className="col-*" style={{ fontFamily: 'Graphik', fontSize: '14px', fontWeight: "700" }}>
                      <span> <img src={disclaimer} alt=""  id="disclaimer" />{' '} Alert</span>
                    </div>
                    <div className="col-*" style={{ fontFamily: 'Graphik', fontSize: '14px', color: "#ffffff", marginTop: "5px" ,paddingLeft :"37px"}}>
                      <span>Dear User, your password will be expired in {message} {message > 1 ?"days" :"day"}. Click on <span style={{fontWeight: "700",cursor :"pointer",textDecoration :"underline"}} onClick = {() => this.openChange()}>Change Password</span></span>
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
            case 'saveSuccess':
                toast.info(<NotificationMessage
                    title="Success"
                    bodytext={message}
                    icon="success"
                />, {
                    position: toast.POSITION.BOTTOM_RIGHT
                });
                break;
            default:
                console.log("Default");
                break;
        }
    }

    confirmSignInCodeHandler = (event) => {
        const { loginStore, userName, userRes } = this.props;
        const { code } = this.state;
        event.preventDefault();
        if (this.checkValidation() === 0) {
            this.setState({ loader: true, disableSave: true });
            Auth.confirmSignIn(userRes, code, "SMS_MFA").then(res => {
              
                sessionStorage.setItem("username", res.username)
                const accessToken = res.signInUserSession && res.signInUserSession.accessToken && res.signInUserSession.accessToken.jwtToken
                sessionStorage.setItem('AccessToken', accessToken); 
                this.setState({ loader: false, disableSave: false });             
                 this.props.goToHistory("/home");

                if(this.props.signInChallengeName === 'NEW_PASSWORD_REQUIRED'){
                    this.props.loginStore.validateOrUpdateCognitoUser(this.props.cognitoReq,null).then(res =>{
                        if(res && res.data && res.data.body && res.data.body.resultCode === "OK"){
                            this.props.showLoading(false);
                        }else{
                            this.props.showLoading(false);
                           // this.showNotification("error", res && res.data && res.data.body && res.data.body.errorDescription)
                        }
                       
                    }).catch(err =>{
                        this.props.showLoading(false);
                        //this.showNotification("error", err.message)
                    })
                }
                
                loginStore.saveUser(userName)
                    .then(res => {
                        this.props.showLoading(false);
                      
                        var cognitoPasswordReq = {
                            "requestType": "ExpiredIn",
                            "user_name": userName
                        };
                        loginStore.validateOrUpdateCognitoUser(cognitoPasswordReq,null).then(res => {
                            if (res && res.data && res.data.body && res.data.body.resultCode === "OK" && res.data.body.resultObj && res.data.body.resultObj.showNotification) {
                                this.showNotification("warn", res.data.body.resultObj.daysLeft);
                            } else if (res && res.data && res.data.body && res.data.body.resultCode === "KO") {
                                this.showNotification("error", res.data.body.errorDescription);
                            }
                        }).catch(e => {
                            this.setState({
                                loader: false,
                                resetLoader: false,
                                codeDeliveryDetails: {},
                                disableSave: false
                            });
                            this.showNotification("error", e.message)
                        });

                    })
                    .catch(error => {
                        this.setState({
                            loader: false,
                            resetLoader: false,
                            codeDeliveryDetails: {},
                            disableSave: false
                        });
                        this.showNotification("error", error.message);
                    });
                
            }).catch(err => {
                this.setState({
                    loader: false,
                    resetLoader: false,
                    codeDeliveryDetails: {},
                    disableSave: false
                });
                if(err && err.code === "CodeMismatchException"){
                    this.showNotification("error", "Invalid verification code. Please enter valid code.");
                }else{
                    
                    this.showNotification("error", err.message);
                  this.props.closeMfaLoginHandler();
                }
               
            })

        } else {
            if (process.env && process.env.REACT_APP_BASE_URL === 'productionb') {

            } else {
                this.setState({
                    mandatoryError: true,
                    loader : false
                });
            }
        }
        return;
    }




    togglePasswordVisiblity = (e, toggledIcon) => {
        e.preventDefault();
        if (toggledIcon === "new") {
            this.setState({ showNewPassword: !this.state.showNewPassword })
        } else if (toggledIcon === "confirm") {
            this.setState({ showConfirmPassword: !this.state.showConfirmPassword })
        }
    };

    checkValidation = () => {
        const { code, password, confirmPassword } = this.state;
        let errorCnt = 0;

        if (code === '') {
            this.setState({ codeError: "Enter the code!" });
            errorCnt++
        }


        return errorCnt;
    }

    render() {
        const { code, codeError, codeDeliveryDetails, loader, disableSave } = this.state;
        const { userName, userRes } = this.props;
        return (
            <div id="resend">
                <form onSubmit={this.confirmSignInCodeHandler} autoComplete="nope">

                    <div className="form-group">
                        {userRes && userRes.challengeParam
 && userRes.challengeParam.CODE_DELIVERY_DELIVERY_MEDIUM === "SMS" &&

                            <p>
                                We have delivered the authentication code by SMS to <span>{userRes.challengeParam.CODE_DELIVERY_DESTINATION}</span>. Please enter the code to complete authentication.
                        </p>
                        }
                    </div>
                    {codeError && codeError.length > 0 ?
                        <div className="error-div">
                            {codeError}
                        </div>
                        : this.state.mandatoryError ?
                            <div className="error-div">
                                Please fill out all fields.
                    </div> : ''
                    }
                    <div className="form-group">
                        <label>Code</label>
                        <input type="password" name="code" id="code"
                            autoComplete="nope"
                            style={{ boxShadow: "none" }}
                            value={code}
                            onChange={this.inputChangeHandler}
                            className="form-control" placeholder="Enter the code" />
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
                            style={{ cursor: loader ? 'wait' : 'pointer' }}
                            disabled={code === "" || disableSave}
                            onClick={(e) => { this.confirmSignInCodeHandler(e) }}
                        >
                            Sign In {' '}
                            {loader && <i className="fa fa-spinner fa-spin"></i>}
                        </button>
                    </div>
                </form>
            </div>

        )
    }
};

export default Mfa;