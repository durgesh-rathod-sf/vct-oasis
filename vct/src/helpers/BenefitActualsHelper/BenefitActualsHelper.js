import Api from "../Api/Api";
import { appUrl } from '../../constants/ApiUrls';

class BenefitActualsHelper extends Api {
    
    getBenefitActuals(fetchDate,payload) {
        return this.post(appUrl.getBenefitActuals, payload)
    } 
    saveBenefitActuals(payload){
        return this.post(appUrl.saveKpiBenefitActuals, payload);
    }  

}

export default BenefitActualsHelper;