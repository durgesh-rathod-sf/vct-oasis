import Api from "../Api/Api";
import { appUrl } from '../../constants/ApiUrls';

class InvestmentHelper extends Api {
    
    fetchInvestments(payload){
        return this.pythonpost(appUrl.vcmlFetchinv, payload)
    }

    saveInvestments(payload){
        return this.pythonpost(appUrl.vcmlAddinv, payload)
    } 

    saveInvestmentsForDelivery(payload) {
        return this.pythonpost(appUrl.vcmlAddinvestment, payload)
    }
}

export default InvestmentHelper;