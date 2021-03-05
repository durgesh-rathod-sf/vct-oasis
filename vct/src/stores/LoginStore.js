import { makeObservable, observable, action, computed } from "mobx";
import { Auth } from 'aws-amplify';
import LoginHelper from '../helpers/LoginHelper/LoginHelper';
// import config from '../config.json';
// import { routes } from "../constants";

import Moment from 'moment';

var SessionStorage = require('store/storages/sessionStorage');

export default class LoginStore {

    @observable username
    @observable userType
    @observable azureLogOutHandler
    @observable isLoginError = false
    @observable loginErrorMessage =''

    constructor() {
        makeObservable(this,
          {
            isLoginError:observable,
            loginErrorMessage:observable
          });
      }
    @action
    setUsername(newUsername) {
        this.username = newUsername;
    }

    @action
    setUserType(type) {
        this.userType = type;
    }


    @action
    async saveUser(username) {
        const loginHelper = new LoginHelper();
        const userName = username.split('_').pop().split('@')[0]
        const user = {
            userEmail: username.includes('_') ? username.split('_')[1] : username,
            userName: userName,
        }
        SessionStorage.write('tenantId', null);
        return await loginHelper.saveUser(user)
            .then((response) => {
                if (!response.error && response && response.data && response.data.resultCode === 'OK') {
                    SessionStorage.write('sessionId', response.data.resultObj.sessionId)
                    SessionStorage.write('endDate', response.data.resultObj.endDate)
                    SessionStorage.write('userId', response.data.resultObj.userId)
                    SessionStorage.write('demoMapId', response.data.resultObj.demoMapId)
                    SessionStorage.write('demoUser', false)
                    SessionStorage.write('userType', response.data.resultObj.userType)
                    SessionStorage.write('isSME', response.data.resultObj.isSME)
                    if (response.data.resultObj.userType === 'D') {
                        SessionStorage.write('accessType', 'Read')
                    }
                    this.userType = response.data.resultObj.userType; 
                    if (Moment(response.data.resultObj.endDate).format('DD-MM-YYYY') <= new Date()) {
                        window.history.pushState({ urlPath: "/" }, "", '/home');
                    }

                }
                // else if(response && response.data && response.data.resultCode === 'KO'){
                //     window.history.pushState({ urlPath: "/" }, "", '/login');
                // }

            }).catch((error) => {
                return {
                    data: error.response.data
                }
            })
    }

    @computed
    get isAuthenticated() {
        return SessionStorage.read('amplify-signin-with-hostedUI')
    }

    @action
    getSecurityCode(username) {
        return Auth.forgotPassword(username)
            .then((data) => {
                console.log("dataaaaaaa", data);
                return data;
            }).catch(err => {
                return err;
            })
    }

    @action
    authSignIn(userName, password) {
        return Auth.signIn(userName, password)
            .then((response) => {
                this.setUsername(response.username)
                sessionStorage.setItem("username", response.username)
                const accessToken = response.signInUserSession && response.signInUserSession.accessToken && response.signInUserSession.accessToken.jwtToken
                sessionStorage.setItem('AccessToken', accessToken);
                return response;
            }).catch(err => {
                return err;
            })
    }

    @action
    async validateOrUpdateCognitoUser(payload, requestType) {
        const loginHelper = new LoginHelper();
        return await loginHelper.validateOrUpdateCognitoUser(payload, requestType)
            .then((response) => {
                if (response && !response.error && response.data) {
                    return response;
                }
            })
            .catch((e) => {
                return e.response;
            });


    }


}