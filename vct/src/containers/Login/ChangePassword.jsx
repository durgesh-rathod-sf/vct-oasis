import React, { useState } from 'react';

import { Auth } from 'aws-amplify';
import { toast } from 'react-toastify';
import NotificationMessage from '../../components/NotificationMessage/NotificationMessage';
import { Fragment } from 'react';
import Menu from '../../components/Menu/Menu';
import './ChangePassword.css';
import { observer, inject } from 'mobx-react';

import { NavLink } from 'react-router-dom';
import eye from "../../assets/home/eye.svg"

var SessionStorage = require('store/storages/sessionStorage');

@inject('loginStore')
@observer
class ChangePassword extends React.Component {


    constructor(props) {
        super(props);
        this.state = {
            password: "",
            passwordError: "",
            oldPassword: "",
            oldPasswordError: "",
            confirmPassword: "",
            confirmPasswordError: "",
            loader: false,
            disableSave: false,
            showOldPassword: false,
            showNewPassword: false,
            showConfirmPassword: false

        }
    }



    redirectHandler = (type) => {
        const { history } = this.props;
        // eslint-disable-next-line default-case
        switch (type) {
            case 'home':
                history.push('/home');
                break;
            default:
                break;
        }
    }




    passwordChangeHandler = (event) => {
        event.preventDefault();
        let validPassword = !event.target.value || 0 === event.target.value.length || !event.target.value.trim() ? "" : event.target.value;
        validPassword = validPassword.replace(/\s/g, "");
        if (event.target.name === "oldPassword") {
            this.setState({ oldPassword: validPassword, oldPasswordError: "" });
        } else if (event.target.name === "password") {
            this.setState({ password: validPassword, passwordError: "" });
        } else if (event.target.name === "confirmPassword") {
            this.setState({ confirmPassword: validPassword, confirmPasswordError: "" });
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
              
                break;
        }
    }

    changePasswordHandler = (event) => {
        event.preventDefault();
        const userName = SessionStorage.read('username');
        // const userstring = user.split('_').pop().split('@')[0]
        // const username = userstring.split('.')
        const { history, loginStore } = this.props;
        const { password, oldPassword } = this.state;
        this.setState({ loader: true });
        if (this.checkValidation() === 0) {
            this.setState({ loader: true, disableSave: true });

            Auth.currentAuthenticatedUser().then(user => {
                let cognitoReq = {
                    "requestType": "ChangePassword",
                    "user_name": userName,
                    "user_password": password,
                    "user_previous_password": oldPassword,
                    "user_access_token": user.signInUserSession.accessToken.jwtToken
                };
               
                return loginStore.validateOrUpdateCognitoUser(cognitoReq ,null);

                // return Auth.changePassword(user, oldPassword, password);
            }).then((res) => {
                if (res && res.data && res.data.body && res.data.body.resultCode === "OK") {
                    this.setState({ loader: false, disableSave: false });
                    this.showNotification("saveSuccess", "Successfully changed password");
                    history.push('/home')
                }
                else {
                    this.setState({ loader: false, disableSave: false });
                    this.showNotification("error", res && res.data && res.data.body && res.data.body.errorDescription);
                }
            }).catch(err => {
                this.setState({ loader: false, passwordError: err, disableSave: false });
                this.showNotification("error", err);
            })


        }
        else {
            this.setState({ loader: false, passwordError: "", confirmPasswordError: "", oldPasswordError: "" });

        }
        return;
    }


    inputonkeyup = (e) => {
        e.preventDefault();
        let myInput = document.getElementById("password");
        let letter = document.getElementById("letter");
        let lowerCaseLetters = /[a-z]/g;
        if(myInput.value.match(lowerCaseLetters)) {  
          letter.classList.remove("invalid");
          letter.classList.add("valid");
        } else {
          letter.classList.remove("valid");
          letter.classList.add("invalid");
        }
        
        let capital = document.getElementById("capital");
        var upperCaseLetters = /[A-Z]/g;
        if(myInput.value.match(upperCaseLetters)) {  
          capital.classList.remove("invalid");
          capital.classList.add("valid");
        } else {
          capital.classList.remove("valid");
          capital.classList.add("invalid");
        }
      
        let number = document.getElementById("number");
        var numbers = /[0-9]/g;
        if(myInput.value.match(numbers)) {  
          number.classList.remove("invalid");
          number.classList.add("valid");
        } else {
          number.classList.remove("valid");
          number.classList.add("invalid");
        }
        
        let length = document.getElementById("length");
        if(myInput.value.length >= 8) {
          length.classList.remove("invalid");
          length.classList.add("valid");
        } else {
          length.classList.remove("valid");
          length.classList.add("invalid");
        }
        let specialCh = document.getElementById("specialCh");
        let specialChars =  /[\!\@\#\$\%\^\&\*\)\(\+\=\.\<\>\{\}\:\;\'\"\|\~\`\,\~\|\?\/]/g;

        if(myInput.value.match(specialChars)) {  
            specialCh.classList.remove("invalid");
            specialCh.classList.add("valid");
          } else {
            specialCh.classList.remove("valid");
            specialCh.classList.add("invalid");
          }
      }
    onBackHandler = () => {
        this.props.closeResetPasswordForm()
    }

    checkValidation = () => {
        let errorCnt = 0;

        const { password, oldPassword, confirmPassword, passwordError, confirmPasswordError, oldPasswordError, disableSave } = this.state;

        if (password.trim() === '' || oldPassword.trim() === "" || password.length < 8 || oldPassword.length < 8) {
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
            this.setState({ passwordError: "Password must contain minimum 8 characters, including one uppercase, one lower case, one number and one special character" })

            this.showNotification('error', "Password must contain minimum 8 characters, including one uppercase, one lower case, one number and one special character");
            errorCnt++
            return;
        }
        return errorCnt;
    }
    togglePasswordVisiblity = (e, toggledIcon) => {
        e.preventDefault();
        if (toggledIcon === "old") {
            this.setState({ showOldPassword: !this.state.showOldPassword })
        } else if (toggledIcon === "new") {
            this.setState({ showNewPassword: !this.state.showNewPassword })
        } else if (toggledIcon === "confirm") {
            this.setState({ showConfirmPassword: !this.state.showConfirmPassword })
        }
    };
    render() {
        const { password, oldPassword, confirmPassword, showOldPassword, showNewPassword, showConfirmPassword, loader, disableSave } = this.state;
        return (
            <Fragment>
                <Menu />
                <div className="row breadcrumb-row" >
                    <div className="col-sm-6">
                        <div>
                            <nav aria-label="breadcrumb">
                                <ol className="breadcrumb">
                                    <li className="breadcrumb-item" style={{ cursor: 'pointer' }} onClick={() => { this.redirectHandler('home') }}>Home</li>
                                    <li className="breadcrumb-item active" aria-current="page">Change Password</li>
                                </ol>
                            </nav>
                        </div>
                    </div>
                </div>
                <div className='inputForm' id="changePassword" style={{ top: "100px" }}>
                    <div className="row marginNone" style={{ borderBottom: "1px solid #fff", marginLeft: "100px", marginBottom: "20px", marginRight: "100px" }}>
                        <h6 className='mainTitle'>Change Password</h6>
                    </div>
                    <div className="row marginNone">
                        <div className="col-sm-4 paddingNone" style={{ left: "100px" }}>
                            <form onSubmit={this.changePasswordHandler} autoComplete="off">

                                <div className="form-group" id="old">
                                    <label style={{ color: "#FFFFFF" }}>Old Password</label>
                                    <div class="input-group">

                                        <input type={showOldPassword ? "text" : "password"}
                                            autoComplete="off"
                                            id="oldPassword"
                                            name="oldPassword"
                                            value={oldPassword}
                                            onChange={this.passwordChangeHandler}
                                            className="form-control inputPasswordText" placeholder="Enter the old password" />

                                        <div class="input-group-prepend" style={{ backgroundColor: "#5A5A5A" }}>
                                            <div class="input-group-text" style={{ backgroundColor: "#5A5A5A", color: "#ffffff", borderTopRightRadius: "0.25rem", borderBottomRightRadius: "0.25rem", borderLeft: "none" }}><img style={{ opacity: (oldPassword && oldPassword.length > 0 ? "unset" : "0.5"), cursor: (oldPassword && oldPassword.length > 0 ? "pointer" : "default") }} onClick={(oldPassword && oldPassword.length > 0 ? (event) => this.togglePasswordVisiblity(event, "old") : () => { })} src={eye}></img></div>
                                        </div>

                                    </div>
                                </div>
                                <div className="form-group">
                                    <label style={{ color: "#FFFFFF" }}>New Password</label>
                                   
                                    <div class="input-group">
                                        <input type={showNewPassword ? "text" : "password"}
                                            autoComplete="off"
                        
                                            onKeyUp={(e) => this.inputonkeyup(e)}
                                            id="password"
                                            name="password"
                                            value={password}
                                            onChange={this.passwordChangeHandler}
                                            className="form-control inputPasswordText" placeholder="Enter the new password" />

                                        <div class="input-group-prepend" style={{ backgroundColor: "#5A5A5A" }}>
                                            <div class="input-group-text" style={{ backgroundColor: "#5A5A5A", color: "#ffffff", borderTopRightRadius: "0.25rem", borderBottomRightRadius: "0.25rem", borderLeft: "none" }}><img style={{ opacity: (password && password.length > 0 ? "unset" : "0.5"), cursor: (password && password.length > 0 ? "pointer" : "default") }} onClick={(password && password.length > 0 ? (e) => this.togglePasswordVisiblity(e, "new") : () => { })} src={eye}></img></div>
                                        </div>

                                    </div>
                                </div>
                                <div className="form-group">
                                    <label style={{ color: "#FFFFFF" }}>Confirm Password</label>
                                    <div class="input-group">
                                        <input type={showConfirmPassword ? "text" : "password"}
                                            name="confirmPassword"
                                            autoComplete="off"
                                            id="confirmPassword"
                                            value={confirmPassword}
                                            onChange={this.passwordChangeHandler}
                                            className="form-control inputPasswordText" placeholder="Confirm Password" />
                                        <div class="input-group-prepend" style={{ backgroundColor: "#5A5A5A" }}>
                                            <div class="input-group-text" style={{ backgroundColor: "#5A5A5A", color: "#ffffff", borderTopRightRadius: "0.25rem", borderBottomRightRadius: "0.25rem", borderLeft: "none" }}><img style={{ opacity: (confirmPassword && confirmPassword.length > 0 ? "unset" : "0.5"), cursor: (confirmPassword && confirmPassword.length > 0 ? "pointer" : "default") }} onClick={(confirmPassword && confirmPassword.length > 0 ? (e) => this.togglePasswordVisiblity(e, "confirm") : () => { })} src={eye}></img></div>
                                        </div>

                                    </div>
                                </div>

                                <div className='buttondiv' style={{ paddingLeft: "0px" }} >
                                    <button alt="Submit"
                                        style={{ cursor: loader ? 'wait' : 'pointer', width: "105px" }}
                                        className="btn btn-primary" type="submit"
                                        disabled={password === "" || oldPassword === "" || confirmPassword === "" || disableSave}
                                    >Submit {" "}
                                        {loader && <i className="fa fa-spinner fa-spin"></i>}</button>
                                </div>

                            </form>

                        </div>
                        <div className="col-sm-4" style ={{left :"150px", top :"5px" }} >

                            <div className ="pwdInstructions">
                                <div id="letter" className="invalid">Password must contain a Lower Case Letter</div>
                                <div id="capital" className="invalid">Password must contain a Upper Case Letter</div>
                                <div id="specialCh" className="invalid">Password must contain a Special Character</div>

                                <div id="number" className="invalid">Password must contain a Number</div>
                                <div id="length" className="invalid">Password must contain atleast 8 Characters</div>
                            </div>
                        </div>
                    </div>
                </div>
            </Fragment>
        );
    }
};

export default ChangePassword;