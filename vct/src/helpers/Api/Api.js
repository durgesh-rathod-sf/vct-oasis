import axios from 'axios';
import { Auth } from 'aws-amplify';
import ApiUrl from '../../constants/ApiUrls';
import jwt_decode from 'jwt-decode';
import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import ConcurrentLoginModal from '../../components/ConcurrentLoginModal/ConcurrentLoginModal';
import { authProvider } from '../../authProvider';
var qs = require('qs');
var SessionStorage = require('store/storages/sessionStorage')
const date = new Date();
const url = ApiUrl.ApiUrl;

class Api extends Component {
    constructor(props) {
        super(props);
        this.state = {
            concurrentLoginOccurred: false
        }
    }
    async post(url, payload, reqIdvalue, retryGatewayCount = 5) {
        const path = `${this.getUrlPrefix()}${url}`
        const tenantId = SessionStorage.read('tenantId')
        const offerTenantId = SessionStorage.read('offeringTenantId')
        const accessToken = await this.getUpdatedAcessToken();
        let response = "";
        if (reqIdvalue) {            
        } else {
            
            if (path.includes('save-user')) {
                reqIdvalue = payload.userName + '_' + new Date().getTime();
            } else {
                const userNameLogged = SessionStorage.read('username');
                reqIdvalue =  userNameLogged + '_' + new Date().getTime();
            }
        }

        try {
            {
                path.includes("cloneOffering") || path.includes("fetchAllObjectives") ?
                    response = await axios.post(path, payload, {
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': accessToken,
                            'Content-Security-Policy': `default-src 'self'`,
                            'Strict-Transport-Security': `max-age=31536000;includeSubDomains; preload`,
                            'X-Frame-Options': 'DENY',
                            //'X-Frame-Options': 'SAMEORIGIN',
                            'Set-Cookie': `cookie-name="VRO";Path=/${url}/; Expires=${date};Secure;HttpOnly`,
                            'X-VRO-SESSIONID': SessionStorage.read('sessionId'),
                            'X-VRO-MAPID':SessionStorage.read('mapId'),
                            'X-VRO-REQ-ID': reqIdvalue
                        }

                    })
                    :
                    (path.includes("generateVDT") && (offerTenantId !== "false")) ?
                        response = await axios.post(path, payload, {
                            headers: {
                                'Content-Type': 'application/json',
                                'Authorization': accessToken,
                                'X-TenantID': offerTenantId,
                                'Content-Security-Policy': `default-src 'self'`,
                                'Strict-Transport-Security': `max-age=31536000;includeSubDomains; preload`,
                                'X-Frame-Options': 'DENY',
                                //'X-Frame-Options': 'SAMEORIGIN',
                                'Set-Cookie': `cookie-name="VRO";Path=/${url}/; Expires=${date};Secure;HttpOnly`,
                                'X-VRO-SESSIONID': SessionStorage.read('sessionId'),
								'X-VRO-MAPID':payload.mapId,
                                'X-VRO-REQ-ID': reqIdvalue
                            }

                        }):(path.includes("delete-project"))?
                        response = await axios.post(path, payload, {
                            headers: {
                                'Content-Type': 'application/json',
                                'Content-Security-Policy': `default-src 'self'`,
                                'Strict-Transport-Security': `max-age=31536000;includeSubDomains; preload`,
                                'X-Frame-Options': 'DENY',
                                //'X-Frame-Options': 'SAMEORIGIN',
                                'Authorization': accessToken,
                                'X-TenantID': (tenantId === "null" ? "null" : tenantId),
                                'Set-Cookie': `cookie-name="VRO";Path=/${url}/; Expires=${date};Secure;HttpOnly`,
                                'X-VRO-SESSIONID': SessionStorage.read('sessionId'),
                                'X-VRO-MAPID':payload.mapId,
                                'X-VRO-REQ-ID': reqIdvalue
                            }

                        }):
                        response = await axios.post(path, payload, {
                            headers: {
                                'Content-Type': 'application/json',
                                'Content-Security-Policy': `default-src 'self'`,
                                'Strict-Transport-Security': `max-age=31536000;includeSubDomains; preload`,
                                'X-Frame-Options': 'DENY',
                                //'X-Frame-Options': 'SAMEORIGIN',
                                'Authorization': accessToken,
                                'X-TenantID': (tenantId === "null" ? "null" : tenantId),
                                'Set-Cookie': `cookie-name="VRO";Path=/${url}/; Expires=${date};Secure;HttpOnly`,
                                'X-VRO-SESSIONID': SessionStorage.read('sessionId'),
                                'X-VRO-MAPID':SessionStorage.read('mapId'),
                                'X-VRO-REQ-ID': reqIdvalue
                            }

                        })
                    }
                    return response;
        }
        catch (error) {

            const retryApiCallFor = await this.errorMessageHandler(error); 
            if (retryApiCallFor === 'token-expired') {
                const retryResp = await this.post(url,payload);
                return retryResp;
            } else if (retryApiCallFor === 'gateway-timeout') {
                if (retryGatewayCount > 0) {  // break the loop when retryGatewayCount reaches 0

                    // below await call will help to sleep the execution for 5 sec and returns resolve  
                    const waitRes = await this.setApiTimeoutPromise(5000);
                    
                    // making the retry api call with same vro-req-id and reduced gateway counter
                    return this.post(url, payload, reqIdvalue, retryGatewayCount - 1);
                } else {
                    throw error;
                }
            } else {
                throw error;
            }        
        }
    }

    async get(url, reqIdvalue, retryGatewayCount = 5) {
        const accessToken = await this.getUpdatedAcessToken();
        const tenantId = SessionStorage.read('tenantId')
        let path;
        path = `${this.getUrlPrefix()}${url}`;
        if (reqIdvalue) {            
        } else {
            const userNameLogged = SessionStorage.read('username');
            reqIdvalue = userNameLogged + '_' + new Date().getTime();
        }      

        try {
            const res = await axios.get(path, {
                headers: {
                    'Authorization': accessToken,
                   'X-TenantID': ((path.includes("getMasterKPIInfo") || path.includes("loadOfferings") || path.includes("getIndustries") || path.includes("getBusinessFunctions") || path.includes("fetchObjectiveCategories") || tenantId === "null")  ? "null" : tenantId),
                    'Content-Security-Policy': `default-src 'self'`,
                    'Strict-Transport-Security': `max-age=31536000;includeSubDomains; preload`,
                    'X-Frame-Options': 'DENY',
                    //'X-Frame-Options': 'SAMEORIGIN',
                    'Set-Cookie': `cookie-name="VRO";Path=/${url}/; Expires=${date};Secure;HttpOnly`,
                    'X-VRO-SESSIONID': SessionStorage.read('sessionId'),
                    'X-VRO-MAPID':SessionStorage.read('mapId'),
                    'X-VRO-REQ-ID': reqIdvalue
                }
            })
            return res
        }
        catch (error) {
            const retryApiCallFor = await this.errorMessageHandler(error); 
            if (retryApiCallFor === 'token-expired') {
                const retryResp = await this.get(url);
                return retryResp;
            } else if (retryApiCallFor === 'gateway-timeout') {
                if (retryGatewayCount > 0) {  // break the loop when retryGatewayCount reaches 0

                    // below await call will help to sleep the execution for 5 sec and returns resolve  
                    const waitRes = await this.setApiTimeoutPromise(5000);
                    
                    // making the retry api call with same vro-req-id and reduced gateway counter
                    return this.get(url, reqIdvalue, retryGatewayCount - 1);
                } else {
                    throw error;
                }
            } else {
                throw error;
            }
        }
    }

    async adminDelete(url, reqIdvalue, retryGatewayCount = 5) {
        const accessToken = await this.getUpdatedAcessToken();
        const tenantId = SessionStorage.read('tenantId')
        const path = `${this.getUrlPrefix()}${url}`
        let res = "";
        if (reqIdvalue) {            
        } else {
            const userNameLogged = SessionStorage.read('username');
            reqIdvalue = userNameLogged + '_' + new Date().getTime();
        }
        try {
            (path.includes('deleteProjectInfo')) ?
                res = await axios.delete(path, {
                    headers: {
                        'Authorization': accessToken,
                        'X-TenantID': tenantId,
                        'Content-Security-Policy': `default-src 'self'`,
                        'Strict-Transport-Security': `max-age=31536000;includeSubDomains; preload`,
                        'X-Frame-Options': 'DENY',
                        //'X-Frame-Options': 'SAMEORIGIN',
                        'Set-Cookie': `cookie-name="VRO";Path=/${url}/; Expires=${date};Secure;HttpOnly`,
                        'X-VRO-SESSIONID': SessionStorage.read('sessionId'),
						'X-VRO-MAPID':SessionStorage.read('mapId'),
                        'X-VRO-REQ-ID': reqIdvalue
                    }
                })
                :
                res = await axios.delete(path, {
                    headers: {
                        'Authorization': accessToken,
                        'Content-Security-Policy': `default-src 'self'`,
                        'Strict-Transport-Security': `max-age=31536000;includeSubDomains; preload`,
                        'X-Frame-Options': 'DENY',
                        //'X-Frame-Options': 'SAMEORIGIN',
                        'Set-Cookie': `cookie-name="VRO";Path=/${url}/; Expires=${date};Secure;HttpOnly`,
                        'X-VRO-SESSIONID': SessionStorage.read('sessionId'),
						'X-VRO-MAPID':SessionStorage.read('mapId'),
                        'X-VRO-REQ-ID': reqIdvalue
                    }
                })
            return res
        }
        catch (error) {           

            const retryApiCallFor = await this.errorMessageHandler(error); 
            if (retryApiCallFor === 'token-expired') {
                const retryResp = await this.adminDelete(url);
                return retryResp;
            } else if (retryApiCallFor === 'gateway-timeout') {
                if (retryGatewayCount > 0) {  // break the loop when retryGatewayCount reaches 0

                    // below await call will help to sleep the execution for 5 sec and returns resolve  
                    const waitRes = await this.setApiTimeoutPromise(5000);
                    
                    // making the retry api call with same vro-req-id and reduced gateway counter
                    return this.adminDelete(url, reqIdvalue, retryGatewayCount - 1);
                } else {
                    throw error;
                }
            } else {
                throw error;
            }
        }
    }

    async git(url) {
        const accessToken = await this.getUpdatedAcessToken();
        const path = url
        return axios.get(path, {
            headers: {
                'Authorization': accessToken,
                'X-VRO-SESSIONID': SessionStorage.read('sessionId'),
				'X-VRO-MAPID':SessionStorage.read('mapId')
            }
        }
        )
    }

    downloadFile(url, type, name, reqIdvalue, retryGatewayCount = 5) {
        if (reqIdvalue) {            
        } else {
            const userNameLogged = SessionStorage.read('username');
            reqIdvalue = userNameLogged + '_' + new Date().getTime();
        }
        axios({
            url: url,
            method: 'GET',
            responseType: 'blob',
            headers: {
                'X-VRO-REQ-ID': reqIdvalue
            }
        }).then((response) => {
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', name + '.' + type);
            document.body.appendChild(link);
            link.click();
        }).catch(async(error) => {
            const retryApiCallFor = await this.errorMessageHandler(error); 
            if (retryApiCallFor === 'token-expired') {
                const retryResp = await this.downloadFile(url, type, name);
                return retryResp;
            } else if (retryApiCallFor === 'gateway-timeout') {
                if (retryGatewayCount > 0) {  // break the loop when retryGatewayCount reaches 0

                    // below await call will help to sleep the execution for 5 sec and returns resolve  
                    const waitRes = await this.setApiTimeoutPromise(5000);
                    
                    // making the retry api call with same vro-req-id and reduced gateway counter
                    return this.downloadFile(url, type, name, reqIdvalue, retryGatewayCount - 1);
                } else {
                    throw error;
                }
            } else {
                throw error;
            }
        })
    }
    async downloadFileExcel(url, type, name, reqIdvalue, retryGatewayCount = 5) {
        if (reqIdvalue) {            
        } else {
            const userNameLogged = SessionStorage.read('username');
            reqIdvalue = userNameLogged + '_' + new Date().getTime();
        }
        await axios({
            url: url,
            method: 'GET',
            responseType: 'blob',
            headers: {
                'X-VRO-REQ-ID': reqIdvalue
            }
        }).then((response) => {
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', name + '.' + type);
            document.body.appendChild(link);
            link.click();
            return true
        }).catch( async(error) => {
            const retryApiCallFor = await this.errorMessageHandler(error); 
            if (retryApiCallFor === 'token-expired') {
                const retryResp = await this.downloadFileExcel(url, type, name);
                return retryResp;
            } else if (retryApiCallFor === 'gateway-timeout') {
                if (retryGatewayCount > 0) {  // break the loop when retryGatewayCount reaches 0

                    // below await call will help to sleep the execution for 5 sec and returns resolve  
                    const waitRes = await this.setApiTimeoutPromise(5000);
                    
                    // making the retry api call with same vro-req-id and reduced gateway counter
                    return this.downloadFileExcel(url, type, name, reqIdvalue, retryGatewayCount - 1);
                } else {
                    throw error;
                }
            } else {
                throw error;
            }
        })
    }

    async setKpiTargetpost(url, payload, reqIdvalue, retryGatewayCount = 5) {
        const accessToken = await this.getUpdatedAcessToken();
        const path = `${this.getKPIUrl()}${url}`
        const tenantId = SessionStorage.read('tenantId');
        if (reqIdvalue) {            
        } else {
            const userNameLogged = SessionStorage.read('username');
            reqIdvalue = userNameLogged + '_' + new Date().getTime();
        }
        try {
            const response = await axios.post(path, payload, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': accessToken,
                    'X-TenantID': tenantId,
                    'X-VRO-SESSIONID': SessionStorage.read('sessionId'),
					'X-VRO-MAPID':SessionStorage.read('mapId'),
                    'X-VRO-REQ-ID': reqIdvalue
                }
            })
            return response;
        }
        catch (error) {           
            const retryApiCallFor = await this.errorMessageHandler(error); 
            if (retryApiCallFor === 'token-expired') {
                const retryResp = await this.setKpiTargetpost(url, payload);
                return retryResp;
            } else if (retryApiCallFor === 'gateway-timeout') {
                if (retryGatewayCount > 0) {  // break the loop when retryGatewayCount reaches 0

                    // below await call will help to sleep the execution for 5 sec and returns resolve  
                    const waitRes = await this.setApiTimeoutPromise(5000);
                    
                    // making the retry api call with same vro-req-id and reduced gateway counter
                    return this.setKpiTargetpost(url, payload, reqIdvalue, retryGatewayCount - 1);
                } else {
                    throw error;
                }
            } else {
                throw error;
            }
        }
    }

    async workstreamGet(url, reqIdvalue, retryGatewayCount = 5) {
        const accessToken = await this.getUpdatedAcessToken();
        const tenantId = SessionStorage.read('tenantId')
        const path = `${this.getKPIUrl()}${url}`;
        if (reqIdvalue) {            
        } else {
            const userNameLogged = SessionStorage.read('username');
            reqIdvalue = userNameLogged + '_' + new Date().getTime();
        }
        try {
            const res = await axios.get(path, {
                headers: {
                    'Authorization': accessToken,
                    'X-TenantID': ((tenantId === "null") ? "null" : tenantId),
                    'Content-Security-Policy': `default-src 'self'`,
                    'Strict-Transport-Security': `max-age=31536000;includeSubDomains; preload`,
                    'X-Frame-Options': 'DENY',
                    //'X-Frame-Options': 'SAMEORIGIN',
                    'Set-Cookie': `cookie-name="VRO";Path=/${url}/; Expires=${date};Secure;HttpOnly`,
                    'X-VRO-SESSIONID': SessionStorage.read('sessionId'),
					'X-VRO-MAPID':SessionStorage.read('mapId'),
                    'X-VRO-REQ-ID': reqIdvalue
                }
            })
            return res
        } catch (error) {            
            const retryApiCallFor = await this.errorMessageHandler(error); 
            if (retryApiCallFor === 'token-expired') {
                const retryResp = await this.workstreamGet(url);
                return retryResp;
            } else if (retryApiCallFor === 'gateway-timeout') {
                if (retryGatewayCount > 0) {  // break the loop when retryGatewayCount reaches 0

                    // below await call will help to sleep the execution for 5 sec and returns resolve  
                    const waitRes = await this.setApiTimeoutPromise(5000);
                    
                    // making the retry api call with same vro-req-id and reduced gateway counter
                    return this.workstreamGet(url, reqIdvalue, retryGatewayCount - 1);
                } else {
                    throw error;
                }
            } else {
                throw error;
            }
        }

    }

    setApiTimeoutPromise = (ms) => {
        return new Promise(resolve => setTimeout(resolve, ms))
    }
    
    async workstreamPost(url, payload, reqIdvalue, retryGatewayCount = 5) {
        const accessToken = await this.getUpdatedAcessToken();
        const tenantId = SessionStorage.read('tenantId')
        const path = `${this.getKPIUrl()}${url}`
        let response = "";
        if (reqIdvalue) {            
        } else {
            const userNameLogged = SessionStorage.read('username');
            reqIdvalue = userNameLogged + '_' + new Date().getTime();
        }
        try {


            response = await axios.post(path, payload, {
                headers: {
                    'Content-Type': 'application/json', 'Authorization': accessToken,
                    'X-TenantID': ((tenantId === "null") ? "null" : tenantId),
                    'Content-Security-Policy': `default-src 'self'`,
                    'Strict-Transport-Security': `max-age=31536000;includeSubDomains; preload`,
                    'X-Frame-Options': 'DENY',
                    //'X-Frame-Options': 'SAMEORIGIN',
                    'Set-Cookie': `cookie-name="VRO";Path=/${url}/; Expires=${date};Secure;HttpOnly`,
                    'X-VRO-SESSIONID': SessionStorage.read('sessionId'),
					'X-VRO-MAPID':SessionStorage.read('mapId'),
                    'X-VRO-REQ-ID': reqIdvalue
                }
            })

            return response;
        }
        catch (error) {           

            const retryApiCallFor = await this.errorMessageHandler(error); 
            if (retryApiCallFor === 'token-expired') {
                const retryResp = await this.workstreamPost(url, payload);
                return retryResp;
            } else if (retryApiCallFor === 'gateway-timeout') {
                if (retryGatewayCount > 0) {  // break the loop when retryGatewayCount reaches 0

                    // below await call will help to sleep the execution for 5 sec and returns resolve  
                    const waitRes = await this.setApiTimeoutPromise(5000);
                    
                    // making the retry api call with same vro-req-id and reduced gateway counter
                    return this.workstreamPost(url, payload, reqIdvalue, retryGatewayCount - 1);
                } else {
                    throw error;
                }
            } else {
                return error.response
            }
        }
    }

    async weakPasswordPost(url, payload, requestType, reqIdvalue, retryGatewayCount = 5) {
        const accessToken = await this.getUpdatedAcessToken();
        const tenantId = SessionStorage.read('tenantId')
        const path = `${this.getKPIUrl()}${url}`
        let response = "";
        if (reqIdvalue) {            
        } else {
            const userNameLogged = SessionStorage.read('username');
            reqIdvalue = userNameLogged + '_' + new Date().getTime();
        }
        try {


           let headers = {
                'Content-Type': 'application/json',
                 'Authorization': accessToken,
                'X-TenantID': ((tenantId === "null") ? "null" : tenantId),
                'Content-Security-Policy': `default-src 'self'`,
                'Strict-Transport-Security': `max-age=31536000;includeSubDomains; preload`,
                'X-Frame-Options': 'DENY',
                //'X-Frame-Options': 'SAMEORIGIN',
                'Set-Cookie': `cookie-name="VRO";Path=/${url}/; Expires=${date};Secure;HttpOnly`,
                'X-VRO-SESSIONID': SessionStorage.read('sessionId'),
                'X-VRO-MAPID':SessionStorage.read('mapId'),
                'X-VRO-REQ-ID': reqIdvalue
            }

            if(requestType === "RequestForgotPassword" || requestType === "ResetPassword" || requestType ==="RemainingLoginAttempts"){
                
                headers = {
                    'Content-Type': 'application/json',
                     'Authorization': 'ValueCockpit',
                    'X-TenantID': ((tenantId === "null") ? "null" : tenantId),
                    'Content-Security-Policy': `default-src 'self'`,
                    'Strict-Transport-Security': `max-age=31536000;includeSubDomains; preload`,
                    'X-Frame-Options': 'DENY',
                    //'X-Frame-Options': 'SAMEORIGIN',
                    'Set-Cookie': `cookie-name="VRO";Path=/${url}/; Expires=${date};Secure;HttpOnly`,
                    'X-VRO-SESSIONID': SessionStorage.read('sessionId'),
                    'X-VRO-MAPID':SessionStorage.read('mapId'),
                    'x-vro-req-type' : requestType,
                    'X-VRO-REQ-ID': reqIdvalue
                }
               
            }

            response = await axios.post(path, payload, {headers
               
            })

            return response;
        }
        catch (error) {           

            const retryApiCallFor = await this.errorMessageHandler(error); 
            if (retryApiCallFor === 'token-expired') {
                const retryResp = await this.weakPasswordPost(url, payload, requestType);
                return retryResp;
            } else if (retryApiCallFor === 'gateway-timeout') {
                if (retryGatewayCount > 0) {  // break the loop when retryGatewayCount reaches 0

                    // below await call will help to sleep the execution for 5 sec and returns resolve  
                    const waitRes = await this.setApiTimeoutPromise(5000);
                    
                    // making the retry api call with same vro-req-id and reduced gateway counter
                    return this.weakPasswordPost(url, payload, requestType, reqIdvalue, retryGatewayCount - 1);
                } else {
                    throw error;
                }
            } else {
                return error.response
            }
        }
    }

    async workstreamDelete(url, reqIdvalue, retryGatewayCount = 5) {
        const accessToken = await this.getUpdatedAcessToken();
        const path = `${this.getKPIUrl()}${url}`
        const tenantId = SessionStorage.read('tenantId');
        if (reqIdvalue) {            
        } else {
            const userNameLogged = SessionStorage.read('username');
            reqIdvalue = userNameLogged + '_' + new Date().getTime();
        }
        try {
            let res = ""
            {
                (path.includes('deleteAccount')) ?
                    res = await axios.delete(path, {
                        headers: {
                            'Authorization': accessToken,
                            'X-VRO-SESSIONID': SessionStorage.read('sessionId'),
                            'X-VRO-REQ-ID': reqIdvalue
                        }
                    })
                    :
                    res = await axios.delete(path, {
                        headers: {
                            'Authorization': accessToken,
                            'X-TenantID': tenantId,
                            'Content-Security-Policy': `default-src 'self'`,
                            'Strict-Transport-Security': `max-age=31536000;includeSubDomains; preload`,
                            'X-Frame-Options': 'DENY',
                            //'X-Frame-Options': 'SAMEORIGIN',
                            'Set-Cookie': `cookie-name="VRO";Path=/${url}/; Expires=${date};Secure;HttpOnly`,
                            'X-VRO-SESSIONID': SessionStorage.read('sessionId'),
							'X-VRO-MAPID':SessionStorage.read('mapId'),
                            'X-VRO-REQ-ID': reqIdvalue
                        }
                    })
            }
            return res
        } catch (error) {
            const retryApiCallFor = await this.errorMessageHandler(error); 
            if (retryApiCallFor === 'token-expired') {
                const retryResp = await this.workstreamDelete(url);
                return retryResp;
            } else if (retryApiCallFor === 'gateway-timeout') {
                if (retryGatewayCount > 0) {  // break the loop when retryGatewayCount reaches 0

                    // below await call will help to sleep the execution for 5 sec and returns resolve  
                    const waitRes = await this.setApiTimeoutPromise(5000);
                    
                    // making the retry api call with same vro-req-id and reduced gateway counter
                    return this.workstreamDelete(url, reqIdvalue, retryGatewayCount - 1);
                } else {
                    throw error;
                }
            } else {
                throw error;
            }
        }

    }


    async workstreamDeletePayload(url, payload, reqIdvalue, retryGatewayCount = 5) {
        const accessToken = await this.getUpdatedAcessToken();
        const path = `${this.getKPIUrl()}${url}`
        const tenantId = SessionStorage.read('tenantId');
        if (reqIdvalue) {            
        } else {
            const userNameLogged = SessionStorage.read('username');
            reqIdvalue = userNameLogged + '_' + new Date().getTime();
        }
        try {
            return axios.delete(path, {
                headers: {
                    'Authorization': accessToken,
                    'X-TenantID': tenantId,
                    'X-VRO-SESSIONID': SessionStorage.read('sessionId'),
					'X-VRO-MAPID':SessionStorage.read('mapId'),
                    'X-VRO-REQ-ID': reqIdvalue
                },
                data: payload
            }
            )
        } catch (error) {
            
            const retryApiCallFor = await this.errorMessageHandler(error); 
            if (retryApiCallFor === 'token-expired') {
                const retryResp = await this.workstreamDeletePayload(url, payload);
                return retryResp;
            } else if (retryApiCallFor === 'gateway-timeout') {
                if (retryGatewayCount > 0) {  // break the loop when retryGatewayCount reaches 0

                    // below await call will help to sleep the execution for 5 sec and returns resolve  
                    const waitRes = await this.setApiTimeoutPromise(5000);
                    
                    // making the retry api call with same vro-req-id and reduced gateway counter
                    return this.workstreamDeletePayload(url, payload, reqIdvalue, retryGatewayCount - 1);
                } else {
                    throw error;
                }
            } else {
                throw error;
            }
        }

    }

    getUrlPrefix() {
        if (process.env.REACT_APP_BASE_URL === 'production') {
            return url.production
        }
        if (process.env.REACT_APP_BASE_URL === 'preprod') {
            return url.preprod
        }
        if (process.env.REACT_APP_BASE_URL === 'staging') {
            return url.staging
        }
        if (process.env.REACT_APP_BASE_URL === 'development') {
            return url.development
        }
        if (process.env.REACT_APP_BASE_URL === 'local') {
            return url.development
        }
        if (process.env.REACT_APP_BASE_URL === 'dev2') {
            return url.dev2
        }
        if (process.env.REACT_APP_BASE_URL === 'training') {
            return url.training
        }
        if (process.env.REACT_APP_BASE_URL === 'productionb') {
            return url.productionb
        }
    }

    getKPIUrl() {
        if (process.env.REACT_APP_BASE_URL === 'production') {
            return url.pythonProduction
        }
        if (process.env.REACT_APP_BASE_URL === 'preprod') {
            return url.pythonPreProd
        }
        if (process.env.REACT_APP_BASE_URL === 'staging') {
            return url.pythonStaging
        }
        if (process.env.REACT_APP_BASE_URL === 'development') {
            return url.pythonDevelopment
        }
        if (process.env.REACT_APP_BASE_URL === 'local') {
            return url.pythonDevelopment
        }
        if (process.env.REACT_APP_BASE_URL === 'dev2') {
            return url.pythonDev2
        }
        if (process.env.REACT_APP_BASE_URL === 'training') {
            return url.pythonTraining
        }
        if (process.env.REACT_APP_BASE_URL === 'productionb') {
            return url.pythonProductionb
        }
    }

    async pythonpost(url, payload, reqIdvalue, retryGatewayCount = 5) {
        const path = `${this.getKPIUrl()}${url}`
        const accessToken = await this.getUpdatedAcessToken();
        const tenantId = SessionStorage.read('tenantId');
        if (reqIdvalue) {            
        } else {
            const userNameLogged = SessionStorage.read('username');
            reqIdvalue = userNameLogged + '_' + new Date().getTime();
        }
        try {
            const response = await axios.post(path, payload, {
                headers: {
                    'Content-Type': 'application/json', 'Authorization': accessToken, 'X-TenantID': tenantId,
                    'X-VRO-SESSIONID': SessionStorage.read('sessionId'),
					'X-VRO-MAPID':SessionStorage.read('mapId'),
                    'X-VRO-REQ-ID': reqIdvalue
                },

            });

            return response;
        }
        catch (error) {
            
            const retryApiCallFor = await this.errorMessageHandler(error); 
            if (retryApiCallFor === 'token-expired') {
                const retryResp = await this.pythonpost(url, payload);
                return retryResp;
            } else if (retryApiCallFor === 'gateway-timeout') {
                if (retryGatewayCount > 0) {  // break the loop when retryGatewayCount reaches 0

                    // below await call will help to sleep the execution for 5 sec and returns resolve  
                    const waitRes = await this.setApiTimeoutPromise(5000);
                    
                    // making the retry api call with same vro-req-id and reduced gateway counter
                    return this.pythonpost(url, payload, reqIdvalue, retryGatewayCount - 1);
                } else {
                    throw error;
                }
            } else {
                throw error;
            }
        }
    }

    async pythonget(url, reqIdvalue, retryGatewayCount = 5) {
        const accessToken = await this.getUpdatedAcessToken();
        const path = `${this.getUrlPrefix()}${url}`;
        if (reqIdvalue) {            
        } else {
            const userNameLogged = SessionStorage.read('username');
            reqIdvalue = userNameLogged + '_' + new Date().getTime();
        }
        try {
            return axios.get(path, {
                headers: {
                    'Authorization': accessToken,
                    'X-VRO-SESSIONID': SessionStorage.read('sessionId'),
					'X-VRO-MAPID':SessionStorage.read('mapId'),
                    'X-VRO-REQ-ID': reqIdvalue
                }
            })
        } catch (error) {
            const retryApiCallFor = await this.errorMessageHandler(error); 
            if (retryApiCallFor === 'token-expired') {
                this.pythonget(url);
            } else if (retryApiCallFor === 'gateway-timeout') {
                if (retryGatewayCount > 0) {  // break the loop when retryGatewayCount reaches 0

                    // below await call will help to sleep the execution for 5 sec and returns resolve  
                    const waitRes = await this.setApiTimeoutPromise(5000);
                    
                    // making the retry api call with same vro-req-id and reduced gateway counter
                    return this.pythonget(url, reqIdvalue, retryGatewayCount - 1);
                } else {
                    throw error;
                }
            } else {
                throw error;
            }
        }

    }

    async tableauPostRequest(url, payload, reqIdvalue, retryGatewayCount = 5) {
        if (reqIdvalue) {            
        } else {
            const userNameLogged = SessionStorage.read('username');
            reqIdvalue = userNameLogged + '_' + new Date().getTime();
        }
        try {
            const response = await axios.post(url, qs.stringify(payload), {
                headers: {
                    'content-type': 'application/x-www-form-urlencoded;charset=utf-8',
                    'X-VRO-SESSIONID': SessionStorage.read('sessionId'),
					'X-VRO-MAPID':SessionStorage.read('mapId'),
                    'X-VRO-REQ-ID': reqIdvalue
                }
            });

            return response;
        } catch (error) {
            
            const retryApiCallFor = await this.errorMessageHandler(error); 
            if (retryApiCallFor === 'token-expired') {
                const retryResp = await this.tableauPostRequest(url, payload);
                return retryResp;
            } else if (retryApiCallFor === 'gateway-timeout') {
                if (retryGatewayCount > 0) {  // break the loop when retryGatewayCount reaches 0

                    // below await call will help to sleep the execution for 5 sec and returns resolve  
                    const waitRes = await this.setApiTimeoutPromise(5000);
                    
                    // making the retry api call with same vro-req-id and reduced gateway counter
                    return this.tableauPostRequest(url, payload, reqIdvalue, retryGatewayCount - 1);
                } else {
                    throw error;
                }
            } else {
                throw error;
            }
        }
    }

    async getUpdatedAcessToken() {
        // Auth.currentSession() method will automatically refresh the accessToken and idToken
        // if tokens are expired and a valid refreshToken presented
        let accessToken = SessionStorage.read('AccessToken');       
        

        // --- below code will be uncommented when no api gateway and token expiry check is not returning --
        // ---- from api error response ----

        /*const sessionInterval = new Date(jwt_decode(accessToken).exp * 1000) - new Date();        
        if (sessionInterval <= 0) {
            if (SessionStorage.read('isAzureLogin') && SessionStorage.read('isAzureLogin') === 'true') {
                // need to refresh the access token from azure ad login   
            } else {
                const session = await Auth.currentSession();
                if (session && session.accessToken) {
                    accessToken = session.accessToken.jwtToken;
                    SessionStorage.write('AccessToken', accessToken);
                }
            }            
        }*/

        return accessToken;
    }

    async errorMessageHandler(error) {
        let retryApiCallFor = '';
        if (error.response && error.response.status === 409) {
            // below code will alert when concurrent login identified on a different browser/system')
            ReactDOM.render(<ConcurrentLoginModal
                title={
                    'User session expired as concurrent login identified on a different browser/system'
                }
                visible={true}
                modalCloseHandler={this.modalCloseHandler}
            />, document.getElementById('root'))
            retryApiCallFor = '';
            return retryApiCallFor;

        } else if (error.response && error.response.status === 403 && typeof error.response.data.message === 'object' ) {
            // update /renew access token using library functions and retry the service api call

            switch (error.response.data.message.name) {
                case 'TokenExpiredError':

                    let isAzureLogin = SessionStorage.read('isAzureLogin');

                    if (isAzureLogin && isAzureLogin === 'true') {
                        const renewIdTokenRequest = {
                            scopes: [process.env.REACT_APP_AZURE_CLIENT_ID] // client id
                        };
                        const renewResp = await authProvider.acquireTokenSilent(renewIdTokenRequest)
                            .then(token => {
                                console.log('--acquireTokenSilent token = ' + token.idToken.rawIdToken);
                                sessionStorage.setItem('AccessToken', token.idToken.rawIdToken);
                                retryApiCallFor = 'token-expired';
                                return retryApiCallFor;
                            }).catch(error => {
                                // call acquireTokenRedirect in case of acquireTokenSilent failure
                                // due to consent or interaction required
                                if (error.errorCode === "consent_required"
                                    || error.errorCode === "interaction_required"
                                    || error.errorCode === "login_required") {
                                        authProvider.acquireTokenRedirect(renewIdTokenRequest);
                                        retryApiCallFor = '';
                                        return retryApiCallFor;
                                } else {
                                    retryApiCallFor = '';
                                    return retryApiCallFor;
                                }                                
                            });
                        return renewResp;
                    } else if (isAzureLogin && isAzureLogin === 'false') {
                        const session = await Auth.currentSession();
                        if (session && session.accessToken) {
                            SessionStorage.write('AccessToken', session.accessToken.jwtToken);
                        }
                        retryApiCallFor = 'token-expired';
                        return retryApiCallFor;
                    } else {
                        retryApiCallFor = '';
                        return retryApiCallFor;
                    }
                    break;
                default:
                    retryApiCallFor = '';
                    return retryApiCallFor;
            } 
                      
        } else if (error.response && error.response.status === 504 && typeof error.response.data === 'object') {
            //    if (error.response.data.message === 'Endpoint request timed out'
            //    || error.response.data.message === 'Please retry') {
            //         retryApiCallFor = 'gateway-timeout';
            //    } else {
            //     retryApiCallFor = '';
            //    } 
            retryApiCallFor = 'gateway-timeout';
            return retryApiCallFor;
        } else {
            retryApiCallFor = '';
            return retryApiCallFor;
        }
    }

    async opportunityDelete(url, payload, reqIdvalue, retryGatewayCount = 5) {
        const accessToken = await this.getUpdatedAcessToken();
        const tenantId = SessionStorage.read('tenantId')
        const path = `${this.getUrlPrefix()}${url}`
        let res="";
        if (reqIdvalue) {            
        } else {
            const userNameLogged = SessionStorage.read('username');
            reqIdvalue = userNameLogged + '_' + new Date().getTime();
        }
        try {

            res = await axios.delete(path, {
                headers: {
                    'Authorization': accessToken,
                    'X-TenantID': tenantId,
                    'Content-Security-Policy': `default-src 'self'`,
                                'Strict-Transport-Security': `max-age=31536000;includeSubDomains; preload`,
                                'X-Frame-Options': 'DENY',
                                //'X-Frame-Options': 'SAMEORIGIN',
                'Set-Cookie':`cookie-name="VRO";Path=/${url}/; Expires=${date};Secure;HttpOnly`,
				'X-VRO-MAPID':SessionStorage.read('mapId'),
                'X-VRO-REQ-ID': reqIdvalue
                },
                data: payload
            })
            return res;

        } catch(error) {
            const retryApiCallFor = await this.errorMessageHandler(error); 
            if (retryApiCallFor === 'token-expired') {
                const retryResp = await this.opportunityDelete(url, payload);
                return retryResp;
            } else if (retryApiCallFor === 'gateway-timeout') {
                if (retryGatewayCount > 0) {  // break the loop when retryGatewayCount reaches 0

                    // below await call will help to sleep the execution for 5 sec and returns resolve  
                    const waitRes = await this.setApiTimeoutPromise(5000);
                    
                    // making the retry api call with same vro-req-id and reduced gateway counter
                    return this.opportunityDelete(url, payload, reqIdvalue, retryGatewayCount - 1);
                } else {
                    throw error;
                }
            } else {
                throw error;
            }
        }
        
        
    }

}

export default Api
