import Api from "../Api/Api";
import { appUrl } from '../../constants/ApiUrls';

class LoginHelper extends Api {
    saveUser(payload) {
       return this.post(appUrl.saveuser, payload);
    }

    validateOrUpdateCognitoUser(payload ,requestType){
        return this.weakPasswordPost(appUrl.validateOrUpdateCognitoUser,payload,requestType);
    }
}

export default LoginHelper;