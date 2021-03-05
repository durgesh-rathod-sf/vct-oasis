import React, { useState } from 'react';
import { observer, inject } from 'mobx-react'
import { Auth } from 'aws-amplify';

import './Login.css';
import ResetPasswordForm from './ResetPasswordForm';

@inject('loginStore')
@observer
class ForgotPassword extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            username: '',
            usernameError: '',
            loader: false,
            openResetForm: false,
            codeDeliveryDetails: {},
            disableSave: false
        }
    }

    // const [username, setUsername] = useState('');
    // const [usernameError, setUsernameError] = useState('');
    // const [loader, setLoader] = useState(false);
    // const [openResetForm, setOpenResetForm] = useState(false);
    // const [codeDeliveryDetails, setCodeDeliveryDetails] = useState({});
    // const [disableSave, setDisableSave] = useState(false);


    usernameChangeHandler = (event) => {
        this.setState({ username: event.target.value, usernameError: '' })
        // setUsername(event.target.value);
        // setUsernameError('');
    }

    submitHandler = (event) => {
        event.preventDefault();
        const { username } = this.state;
        if (this.checkValidation()) {
            this.setState({ loader: true, disableSave: true })
            // setLoader(true);
            // setDisableSave(true);
            let cognitoReq = {
                "requestType": "RequestForgotPassword",
                "user_name": username,
                "userPoolWebClientId": process.env.REACT_APP_CLIENT_ID
            }
            this.props.loginStore.validateOrUpdateCognitoUser(cognitoReq, "RequestForgotPassword").then(res => {
                if (res && res.data && res.data.body && res.data.body.resultCode === "OK") {

                    if (res.data.body.resultObj &&  res.data.body.resultObj.CodeDeliveryDetails) {

                        this.setState({ codeDeliveryDetails: res.data.body.resultObj.CodeDeliveryDetails, openResetForm: true, disableSave: false, loader: false })
                        
                    }
                } else {
                    this.setState({ usernameError: res && res.data && res.data.body && res.data.body.errorDescription, loader: false, disableSave: false })

                }

            })
                .catch(err => {
                    this.setState({ loader: false, disableSave: false })
                  
                    if (err && err.code) {
                        this.setState({ usernameError: err.message })
                      
                    }
                });
        }
    }

    checkValidation = () => {
        const { username } = this.state;
        if (username.trim() === '') {
            this.setState({ usernameError: "Please fill out this field" })
            
            return false;
        } else if (!username.match(/\./)) {
            this.setState({ usernameError: "Please enter valid user name" })
           
            return false;
        }
        return true;
    }

    onBackHandler = () => {
        this.props.closeForgotPasswordForm();
        this.setState({ loader: false })
     
    }

    closeResetFormHandler = () => {
        this.setState({ loader: false, openResetForm: false })
        // setOpenResetForm(false)
        // setLoader(false)
    }
    resetCodeDeliveryDetails = () => {
        this.setState({ codeDeliveryDetails: {} })
        // setCodeDeliveryDetails({});
    }

    openMfaLoginHandler = (userName, response) =>{
        this.setState({ openResetForm: false })
        this.props.openMfaLoginHandler(userName, response);
    }

    render() {
        const { username, usernameError, loader, disableSave, openResetForm, codeDeliveryDetails } = this.state;
        return (
            <div className="login-form-main">
                <div className="forgot-wrapper-main">
                    {!openResetForm &&
                        <form className="forgot-pwd-form" onSubmit={this.submitHandler}>
                            <div className="form-group" style={{ fontSize: '20px' }}>
                                <label>Forgot your password?</label>
                            </div>
                            <div className="form-group">
                                <label>Enter your Username below and we will send a message to reset your password</label>
                            </div>
                            {usernameError && usernameError.length > 0 ?
                                <div className="error-div">
                                    {usernameError}
                                </div> : ''

                            }
                            <div className="form-group">
                                <input type="text" name="username" id="username"

                                    style={{ boxShadow: "none" }}

                                    value={username}
                                    onChange={this.usernameChangeHandler}

                                    className="form-control" placeholder="User Name" />
                            </div>
                            <div className="reset-pwd-button-wrapper">
                                <button
                                    id="reset-pwd-button"
                                    type="submit"
                                    className="btn btn-light"
                                    style={{ cursor: loader ? 'wait' : 'pointer' }}
                                    disabled={username === "" || disableSave}
                                >
                                    Reset Password {" "}
                                    {loader && <i className="fa fa-spinner fa-spin"></i>}
                                </button>
                                <button
                                    id="cancel-button"
                                    type="cancel"
                                    className="btn btn-light"
                                    onClick={this.onBackHandler}
                                >
                                    Cancel {" "}

                                </button>
                            </div>
                        </form>

                    }
                    {openResetForm &&
                        <ResetPasswordForm
                            showLoading={this.props.showLoading}
                            goToHistory={this.props.goToHistory}
                            codeDeliveryDetails={codeDeliveryDetails}
                            userName={username}
                            closeResetPasswordForm={this.closeResetFormHandler}
                            openResetForm={openResetForm}
                            resetCodeDeliveryDetails={this.resetCodeDeliveryDetails}
                            openMfaLoginHandler={this.openMfaLoginHandler}
                        />

                    }

                </div>
            </div>

        );
    }
};

export default ForgotPassword;