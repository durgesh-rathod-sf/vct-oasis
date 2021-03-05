import Api from "../Api/Api";
import { appUrl } from '../../constants/ApiUrls';

class InvestmentHelper extends Api {
    
    fetchActualProjectedInvestments(payload){
        return this.pythonpost(appUrl.vcmlDeliveryActualsFetchinv, payload)
    }

    saveActualProjectedInvestments(payload){
        return this.pythonpost(appUrl.vcmlDeliveryActualsSaveinv, payload)
    }

    deleteExtraYear(payload) {
        return this.workstreamDeletePayload(appUrl.deleteextrayear, payload);
    }
}

export default InvestmentHelper;