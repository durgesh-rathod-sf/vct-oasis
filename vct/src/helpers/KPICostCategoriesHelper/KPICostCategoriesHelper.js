import Api from "../Api/Api";
import { appUrl } from '../../constants/ApiUrls';

class KPICostCategoriesHelper extends Api {

    fetchWorkStreamKpiInvestments(mapId) {
        return this.workstreamPost(appUrl.getwslinkedkpis + '?mapId='+ mapId
        )
    }
    fetchWorkStreamCostCategories(mapId) {
        return this.workstreamPost(appUrl.getwscostcategories + '?mapId='+ mapId
        )
    }
    saveWorkStreamCostCat(payload) {
        return this.workstreamPost(appUrl.savewscostcategories, payload)
    }

    saveWorkStreamKpiInvestments(payload) {
        return this.workstreamPost(appUrl.savewslinkedkpis, payload)
    }
}
export default KPICostCategoriesHelper;