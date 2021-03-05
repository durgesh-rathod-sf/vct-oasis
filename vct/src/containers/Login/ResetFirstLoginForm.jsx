import React, { useState } from 'react';

import { Auth } from 'aws-amplify';
import { toast } from 'react-toastify';
import NotificationMessage from '../../components/NotificationMessage/NotificationMessage';
import ReactTooltip from 'react-tooltip';
import "../Login/Login.css"
import eye from "../../assets/home/eye.svg"
import info from "../../assets/home/info.svg"
import { inject, observer } from 'mobx-react';


@observer
@inject("loginStore")
class ResetFirstLoginForm extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            password: "",
            passwordError: "",
            confirmPassword: "",
            confirmPasswordError: "",
            loader: false,
            disableSave: false,
            showNewPassword: false,
            showConfirmPassword: false

        }
    }

    passwordChangeHandler = (event) => {
        event.preventDefault();
        let validPassword = !event.target.value || 0 === event.target.value.length || !event.target.value.trim() ? "" : event.target.value;
        validPassword = validPassword.replace(/\s/g, "");
        if (event.target.name === "password") {
            this.setState({ password: validPassword, passwordError: "" });
        } else if (event.target.name === "confirmPassword") {
            this.setState({ confirmPassword: validPassword, confirmPasswordError: "" });
        }
    }

    togglePasswordVisiblity = (e, toggledIcon) => {
        e.preventDefault();
        if (toggledIcon === "new") {
            this.setState({ showNewPassword: !this.state.showNewPassword })
        } else if (toggledIcon === "confirm") {
            this.setState({ showConfirmPassword: !this.state.showConfirmPassword })
        }
    }

    checkValidation = () => {
        let errorCnt = 0;

        const { password, confirmPassword, disableSave } = this.state;

        if (password.trim() === '' || password.length < 8) {
            this.setState({ passwordError: "Password should contain minimum 8 characters, including one uppercase, one lower case, one number and one special character" })
            this.showNotification('error', "Password should contain minimum 8 characters, including one uppercase, one lower case, one number and one special character");
            errorCnt++
            return;
        }

        if (password !== confirmPassword) {
            this.setState({ confirmPasswordError: "Confirm password does not match!" })

            this.showNotification('error', "Confirm password does not match!");
            errorCnt++
            return;
        }
        if (password.match(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[$@#!%^*?&~|{}():;'"<>/.,])[A-Za-z\d$@#!%^*?&~|{}():;'"<>/.,]{8,}/)) {

        } else {
            this.setState({ passwordError: "Password should contain minimum 8 characters, including one uppercase, one lower case, one number and one special character" })

            this.showNotification('error', "Password should contain minimum 8 characters, including one uppercase, one lower case, one number and one special character");
            errorCnt++
            return;
        }
        return errorCnt;
    }
    resetFirstloginHandler = (event) => {

        const { password } = this.state;
        const { loginStore, userName, userRes } = this.props;
        event.preventDefault();
        if (this.checkValidation() === 0) {
            this.props.showLoading(true);
            try {
                Auth.completeNewPassword(
                    userRes,               // the Cognito User Object
                    password,       // the new password

                ).then(user => {
                    let cognitoReq = {
                        "requestType": "UpdateHistory",
                        "user_name": userName,
                        "user_password": password,

                    };

                    if (user && user.challengeName === "SMS_MFA") {

                        this.props.openMfaLoginHandler(userName, user, userRes.challengeName, cognitoReq);
                    } else {
                        const accessToken = user.signInUserSession && user.signInUserSession.accessToken && user.signInUserSession.accessToken.jwtToken
                        sessionStorage.setItem('AccessToken', accessToken);

                        this.props.loginStore.validateOrUpdateCognitoUser(cognitoReq, null).then(res => {
                            if (res && res.data && res.data.body && res.data.body.resultCode === "OK") {
                                this.props.showLoading(false);
                            } else {
                                this.props.showLoading(false);
                                this.showNotification("error", res && res.data && res.data.body && res.data.body.errorDescription)
                            }

                        }).catch(err => {
                            this.props.showLoading(false);
                            this.showNotification("error", err.message)
                        })

                        this.props.showLoading(false);
                        this.props.closeResetFirstLoginHandler(userName);
                        this.showNotification("saveSuccess", "Reset password successful");
                    }
                }).catch(e => {
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


    }

    showNotification = (type, message) => {
        switch (type) {
            case 'error':
                toast.error(<NotificationMessage
                    title="Error"
                    bodytext={message}
                    icon="error"
                />, {
                    position: toast.POSITION.BOTTOM_RIGHT,

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

    render() {
        const { password, confirmPassword, showOldPassword, showNewPassword, showConfirmPassword, loader, disableSave } = this.state;
        return (
            <div className="login-form-main">
                <form className="login-form" onSubmit={(e) => { this.resetFirstloginHandler(e) }} autoComplete="off">
                    <div className="form-group">
                        <label style={{ color: "#FFFFFF" }}>New Password</label>
                        <img src={info} alt="info" className="info_img"
                            data-tip="" data-for="info"
                        />
                        <ReactTooltip id="info" className="tooltip-class" place='right' >
                            <span> Password must contain minimum 8 characters <br />one uppercase , one lowercase, one special character <br /> and one number.</span>
                        </ReactTooltip>
                        <div class="input-group">
                            <input type={showNewPassword ? "text" : "password"}
                                autoComplete="off"
                                id="password"
                                name="password"
                                value={password}
                                onChange={this.passwordChangeHandler}
                                className="form-control inputPasswordText" placeholder="Enter the new password" />

                            <div class="input-group-prepend" style={{ backgroundColor: "#272727", borderTopRightRadius: "0.25rem", borderBottomRightRadius: "0.25rem" }}>
                                <div className="input-group-text" style={{ backgroundColor: "#272727", color: "#ffffff", border: "1px solid #272727", borderLeft: "none" }}><img style={{ opacity: (password && password.length > 0 ? "unset" : "0.5"), cursor: (password && password.length > 0 ? "pointer" : "default") }} onClick={(password && password.length > 0 ? (e) => this.togglePasswordVisiblity(e, "new") : () => { })} src={eye}></img></div>
                            </div>

                        </div>
                    </div>
                    <div className="form-group">
                        <label style={{ color: "#FFFFFF" }}>Confirm Password</label>
                        <div className="input-group">
                            <input type={showConfirmPassword ? "text" : "password"}
                                name="confirmPassword"
                                autoComplete="off"
                                id="confirmPassword"
                                value={confirmPassword}
                                onChange={this.passwordChangeHandler}
                                className="form-control inputPasswordText" placeholder="Confirm Password" />
                            <div className="input-group-prepend" style={{ backgroundColor: "#272727", borderTopRightRadius: "0.25rem", borderBottomRightRadius: "0.25rem" }}>
                                <div className="input-group-text" style={{ backgroundColor: "#272727", color: "#ffffff", border: "1px solid #272727", borderLeft: "none" }}><img style={{ opacity: (confirmPassword && confirmPassword.length > 0 ? "unset" : "0.5"), cursor: (confirmPassword && confirmPassword.length > 0 ? "pointer" : "default") }} onClick={(confirmPassword && confirmPassword.length > 0 ? (e) => this.togglePasswordVisiblity(e, "confirm") : () => { })} src={eye}></img></div>
                            </div>

                        </div>
                    </div>
                    <div className="sign-in-button-wrapper">
                        <button
                            type="submit"
                            className="btn btn-light"
                            id="signIn"
                            style={{
                                color: '#282828',
                                fontSize: '14px',
                            }}
                            onClick={(e) => { this.resetFirstloginHandler(e) }}
                            disabled={password.trim() === "" || confirmPassword.trim() === ""}
                        >
                            Sign In {' '}
                        </button>
                    </div>

                </form>
            </div>
        );
    }
}

export default ResetFirstLoginForm;