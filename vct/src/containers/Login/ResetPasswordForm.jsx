import React, { Component } from 'react';
import { observer, inject } from 'mobx-react'
import { Auth } from 'aws-amplify';
import { toast } from 'react-toastify';
import ReactTooltip from 'react-tooltip';
import NotificationMessage from '../../components/NotificationMessage/NotificationMessage';
import eye from "../../assets/home/eye.svg"
import info from "../../assets/home/info.svg"

@inject('loginStore')
@observer
class ResetPasswordForm extends Component {
    constructor(props) {
        super(props);
        this.state = {
            code: '',
            codeError: '',
            password: '',
            passwordError: '',
            confirmPassword: '',
            confirmPasswordError: '',
            loader: false,
            resetLoader: false,
            codeDeliveryDetails: {},
            disableSave: false,
            showNewPassword: false,
            showConfirmPassword: false
        }
    }

    inputChangeHandler = (event) => {
        let validPassword = !event.target.value || 0 === event.target.value.length || !event.target.value.trim() ? "" : event.target.value;
        validPassword = validPassword.replace(/\s/g, "");
        if (event.target.id === "code") {

            this.setState({ code: validPassword, codeError: '' });
        } else if (event.target.id === "password") {
            this.setState({ password: validPassword, passwordError: '' });
        } else if (event.target.id === "confirmPassword") {
            this.setState({ confirmPassword: validPassword, confirmPasswordError: '' });
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

    changePasswordHandler = (event) => {
        const { loginStore, userName } = this.props;
        const { code, password } = this.state;
        event.preventDefault();
        if (this.checkValidation() === 0) {
            this.setState({ loader: true, disableSave: true });
            let cognitoReq = {
                "requestType": "ResetPassword",
                "user_name": userName,
                "user_password": password,
                "confirmation_code": code,
                "userPoolWebClientId": process.env.REACT_APP_CLIENT_ID
            };

            loginStore.validateOrUpdateCognitoUser(cognitoReq, "ResetPassword").then(res => {
                if (res && res.data && res.data.body && res.data.body.resultCode === "OK") {

                   
                    loginStore.authSignIn(userName, password)
                        .then((response) => {
                            if(response && response.challengeName === "SMS_MFA"){
                                this.props.openMfaLoginHandler(userName, response);
        
                            }else if (response && !response.code) {
                                loginStore.saveUser(response.username)
                                    .then(res => {
                                        this.props.showLoading(false);
                                        this.props.goToHistory("/home");
                                    }).catch(e => {
                                        this.setState({
                                            // code: '',
                                            // password: '',
                                            // confirmPassword: '',
                                            loader: false,
                                            resetLoader: false,
                                            passwordError: '',
                                            confirmPasswordError: '',
                                            codeDeliveryDetails: {},
                                            disableSave: false
                                        });
                                        this.showNotification("error", e.message)
                                    });
                                this.showNotification("saveSuccess", "Reset password successful")
                            } else {
                                this.props.showLoading(false);
                                this.setState({
                                    // code: '',
                                    // password: '',
                                    // confirmPassword: '',
                                    loader: false,
                                    resetLoader: false,
                                    codeDeliveryDetails: {},
                                    passwordError: "Invalid username or password",
                                    disableSave: false
                                });
                            }
                        })
                        .catch(error => {
                            console.log(error);
                            this.setState({
                                // code: '',
                                // password: '',
                                // confirmPassword: '',
                                loader: false,
                                resetLoader: false,
                                codeDeliveryDetails: {},
                                disableSave: false
                            });
                            this.showNotification("error", error.message);
                        });
                    
                } else {
                    this.setState({ loader: false, resetLoader: false, disableSave: false });
                    this.showNotification("error", res && res.data && res.data.body && res.data.body.errorDescription);

                }

            }).catch(err => {
                this.setState({ loader: false, resetLoader: false, disableSave: false });
                this.showNotification("error", err.message);
            })

        } else {
            this.setState({
                // code: '',
                // password: '',
                // confirmPassword: '',
                loader: false,
                resetLoader: false,
                codeDeliveryDetails: {},
                disableSave: false
            });

            this.props.resetCodeDeliveryDetails();

        }
        return;
    }

    resendCodeHandler = (e) => {
        e.preventDefault();
        this.setState({ resetLoader: true });
        Auth.forgotPassword(this.props.userName)
            .then((data) => {
                if (data && !data.error && data.CodeDeliveryDetails) {
                    this.setState({
                        codeDeliveryDetails: data.CodeDeliveryDetails,
                        code: '',
                        codeError: '',
                        password: '',
                        passwordError: '',
                        confirmPassword: '',
                        confirmPasswordError: '',
                        resetLoader: false,
                        loader: false
                    });


                }

            })
            .catch((err) => {
                const msg = err.message;
                this.setState({
                    code: '',
                    password: '',
                    confirmPassword: '',
                    loader: false,
                    resetLoader: false,
                    passwordError: msg,
                    codeDeliveryDetails: {}
                });
                this.showNotification("error", msg);
            });


    }

    onBackHandler = () => {
        if (this.props.openResetForm) {
            this.props.closeResetPasswordForm();
        } else {
            this.props.closeExpiryPasswordHandler();
        }

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

        if (password.trim() === '' || password.length < 8) {
            this.setState({ passwordError: "Password should contain minimum 8 characters, including one uppercase, one lower case, one number and one special character" });
            errorCnt++
        }

        if (password !== confirmPassword) {
            this.setState({ confirmPasswordError: "Confirm password does not match!" });
            errorCnt++
        }
        if (password.match(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[$@#!%^*?&~|{}():;'"<>/.,])[A-Za-z\d$@#!%^*?&~|{}():;'"<>/.,]{8,}/)) {

        } else {
            this.setState({ passwordError: "Password should contain minimum 8 characters, including one uppercase, one lower case, one number and one special character" });
            errorCnt++
        }
        return errorCnt;
    }

    render() {
        const { code, password, confirmPassword, codeError, passwordError, confirmPasswordError, codeDeliveryDetails, loader, resetLoader, disableSave, showNewPassword, showConfirmPassword } = this.state;
        return (
            <div id="resend">
                <form onSubmit={this.changePasswordHandler} autoComplete="off">
                    <div className="form-group" style={{ fontSize: '20px' }}>
                        <label>Reset your password</label>
                    </div>
                    <div className="form-group">
                        {(Object.values(codeDeliveryDetails).length > 0) || (Object.values(this.props.codeDeliveryDetails).length > 0) &&
                            (codeDeliveryDetails.DeliveryMedium === 'SMS' || this.props.codeDeliveryDetails.DeliveryMedium === 'SMS') ?
                            <p>
                                We have sent a password reset code by sms to <span>{(codeDeliveryDetails.Destination || this.props.codeDeliveryDetails.Destination)}</span>. Enter it below to reset your password.
                        </p>
                            : (codeDeliveryDetails.DeliveryMedium === 'EMAIL' || this.props.codeDeliveryDetails.DeliveryMedium === 'EMAIL') ?
                                <p>
                                    We have sent a password reset code by email to <span>{(codeDeliveryDetails.Destination || this.props.codeDeliveryDetails.Destination)}</span>. Enter it below to reset your password.
                        </p>
                                : ''
                        }
                    </div>
                    {codeError && codeError.length > 0 ?
                        <div className="error-div">
                            {codeError}
                        </div>
                        : passwordError && passwordError.length > 0 ?
                            <div className="error-div">
                                {passwordError}
                            </div>
                            : confirmPasswordError && confirmPasswordError.length > 0 ?
                                <div className="error-div">
                                    {confirmPasswordError}
                                </div> : ''
                    }
                    <div className="form-group">
                        <label>Code</label>
                        <input type="password" name="code" id="code"
                            autoComplete="off"
                            style={{ boxShadow: "none" }}
                            value={code}
                            onChange={this.inputChangeHandler}
                            className="form-control" placeholder="Enter the code" />
                    </div>
                    <div className="form-group">
                        <label>New Password</label>
                        <img src={info} alt="info" className="info_img"
                            data-tip="" data-for="info"
                        />
                        <ReactTooltip id="info" className="tooltip-class" place='right' >
                    <span> Password must contain minimum 8 characters <br/>one uppercase , one lowercase, one special character <br/> and one number.</span>
                </ReactTooltip>
                        <div class="input-group">
                            <input type={showNewPassword ? "text" : "password"}
                                autoComplete="off"
                                style={{ borderRight: "none", boxShadow: "none" }}
                                id="password"
                                name="password"
                                value={password}
                                onChange={this.inputChangeHandler}
                                className="form-control" placeholder="Enter the new password" />

                            <div class="input-group-prepend" style={{ backgroundColor: "#272727" }}>
                                <div class="input-group-text" style={{ backgroundColor: "#272727", color: "#ffffff", borderTopRightRadius: "0.25rem", borderBottomRightRadius: "0.25rem", border: "none" }}><img style={{ opacity: (password && password.length > 0 ? "unset" : "0.5"), cursor: (password && password.length > 0 ? "pointer" : "default") }} onClick={(password && password.length > 0 ? (e) => this.togglePasswordVisiblity(e, "new") : () => { })} src={eye}></img></div>
                            </div>
                        </div>
                    </div>
                    <div className="form-group">
                        <label>Confirm Password</label>
                        <div class="input-group">
                            <input
                                autoComplete="off"
                                style={{ borderRight: "none", boxShadow: "none" }}
                                name="confirmPassword"
                                type={showConfirmPassword ? "text" : "password"}
                                id="confirmPassword"
                                value={confirmPassword}
                                onChange={this.inputChangeHandler}
                                className="form-control" placeholder="Confirm Password" />
                            <div class="input-group-prepend" style={{ backgroundColor: "#272727" }}>
                                <div class="input-group-text" style={{ backgroundColor: "#272727", color: "#ffffff", borderTopRightRadius: "0.25rem", borderBottomRightRadius: "0.25rem", border: "none" }}><img style={{ opacity: (confirmPassword && confirmPassword.length > 0 ? "unset" : "0.5"), cursor: (confirmPassword && confirmPassword.length > 0 ? "pointer" : "none") }} onClick={(confirmPassword && confirmPassword.length > 0 ? (e) => this.togglePasswordVisiblity(e, "confirm") : () => { })} src={eye}></img></div>
                            </div>

                        </div>
                    </div>
                    <div className="change-pwd-button-wrapper">
                        <button
                            id="change-pwd-button"
                            type="submit"
                            className="btn btn-light"
                            style={{ cursor: loader ? 'wait' : 'pointer' }}
                            disabled={password === "" || code === "" || confirmPassword === "" || disableSave}
                        >
                            Reset Password {" "}
                            {loader && <i className="fa fa-spinner fa-spin"></i>}
                        </button>
                        <button
                            id="cancel-button"
                            type="cancel"
                            onClick={this.onBackHandler}
                            className="btn btn-light"

                        >
                            Cancel {" "}

                        </button>
                    </div>
                    {this.props.openExpiryPwdForm && <div style={{
                        marginTop: "1rem",
                        display: "flex",
                        justifyContent: "center"
                    }} className="form-group">

                        <button
                            id="resend-button"
                            type="cancel"
                            className="btn btn-light"
                            onClick={(e) => this.resendCodeHandler(e)}
                            style={{ cursor: resetLoader ? 'wait' : 'pointer' }}

                        >
                            Resend Code{" "}
                            {resetLoader && <i className="fa fa-spinner fa-spin"></i>}
                        </button>

                    </div>}
                </form>
            </div>

        )
    }
};

export default ResetPasswordForm;