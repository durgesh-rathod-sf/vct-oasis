import LoginStore from './LoginStore';
import MyProjectStore from './MyProjectStore';
import ValueDriversStore from './ValueDriversStore';
import ManuallySearchKpisStore from './ManuallySearchKpisStore';
import ReviewValueDriverStore from './ReviewValueDriverStore';
import SetKpiTargetStore from './SetKpiTargetStore';
import PublishDashboardStore from './PublishDashboardStore';
import AddInitiativeStore from './AddInitiativeStore';
import AdminStore from './AdminStore';
import EditVDTStore from '../stores/EditVDTStore';
import SaveVDTStore from '../stores/saveVDTStore';
import BusinessCaseSummaryStore from '../stores/BusinessCaseStore/BusinessCaseSummaryStore'
import KPIBenefitsStore from '../stores/DevelopBusinessCaseStore/KPIBenefitsStore';
import CommonParamsStore from '../stores/BusinessCaseStore/CommonParamsStore';
import InvestmentStore from '../stores/InvestmentStore/InvestmentStore';
import CustomVDTStore from '../stores/CustomVDTStore/CustomVDTStore';
import InvestmentActualsStore from '../stores/InvestmentActualsStore/InvestmentActualsStore';
import BenefitActualsStore from '../stores/BenefitActualsStore/BenefitActualsStore';
import LinkKPIInvestmentStore from '../stores/LinkKPICostCategoriesStore/LinkKPIInvestmentStore';
import WorkstreamStore from '../stores/WorkstreamStore/WorkstreamStore';
import WorkstreamActualsStore from '../stores/WorkstreamActualsStore/WorkstreamActualsStore';
import KpiOverviewDashboardStore from "../stores/Dashboard/KpiOverviewDashboardStore";
import ProjectOverviewDashboardStore from '../stores/Dashboard/ProjectOverviewDashboardStore'
import BenefitOverviewVTStore from '../stores/Dashboard/BenefitOverviewVTStore';
import NetBenefitOverviewDashboardStore from './Dashboard/NetBenefitOverviewDashboardStore';
import DashboardBenefitsOverviewStore from '../stores/Dashboard/DashboardBenefitOverviewStore';
import DashBoardNetBenefitStore from "./Dashboard/DashboardNetBenefitStore";
import InvestmentOverviewDashboardStore from "../stores/Dashboard/InvestmentOverviewDashboardStore"
import InvestmentOverviewDeliveryStore from "../stores/Dashboard/InvestmentOverviewDeliveryStore"
import CommonStore from "../stores/CommonStore/CommonStore";
import DashboardWorkstreamOverviewStore from "../stores/Dashboard/DashboardWorkstreamOverviewStore";
import HowToUseStore from "../stores/HowToUseStore";

import DashboardStore from "../stores/Dashboard/DashboardStore"
import DashboardViewStore from '../stores/Dashboard/360DashboardViewStore';
// import CommonStore from "../stores/CommonStore/CommonStore"


const loginStore = new LoginStore();
const myProjectStore = new MyProjectStore();
const valueDriversStore = new ValueDriversStore();
const manuallySearchKpisStore = new ManuallySearchKpisStore();
const reviewValueDriverStore = new ReviewValueDriverStore();
const setKpiTargetStore = new SetKpiTargetStore();
const publishDashboardStore = new PublishDashboardStore();
const addInitiativeStore = new AddInitiativeStore();
const adminStore = new AdminStore();
const editVDTStore = new EditVDTStore();
const saveVDTStore = new SaveVDTStore();
const businessCaseSummaryStore = new BusinessCaseSummaryStore();
const kpiBenefitsStore = new KPIBenefitsStore();
const commonParamsStore = new CommonParamsStore();
const investmentStore = new InvestmentStore();
const customVDTStore = new CustomVDTStore();
const investmentActualsStore = new InvestmentActualsStore();
const benefitActualsStore = new BenefitActualsStore();
const linkKPIInvestmentStore = new LinkKPIInvestmentStore();
const workstreamStore = new WorkstreamStore();
const workstreamActualsStore = new WorkstreamActualsStore();
const kpiDashboardStore = new KpiOverviewDashboardStore();
const benefitOverviewVTStore = new BenefitOverviewVTStore();
const projectOverviewDashboardStore = new ProjectOverviewDashboardStore();

const netBenefitOverviewStore = new NetBenefitOverviewDashboardStore();
const dashboardBenefitsOverviewStore = new DashboardBenefitsOverviewStore();
const dashboardNetBenefitStore = new DashBoardNetBenefitStore();
const investmentOverviewDashboardStore = new InvestmentOverviewDashboardStore();

const investmentOverviewDeliveryStore = new InvestmentOverviewDeliveryStore();
const dashboardWorkstreamOverviewStore = new DashboardWorkstreamOverviewStore();
const dashboardStore = new DashboardStore();
const commonStore = new CommonStore();
const howToUseStore = new HowToUseStore()
const dashboardViewStore = new DashboardViewStore();
// const dashboardNetBenefitStore = new DashBoardNetBenefitStore();
// const dashboardBenefitOverviewStore = new DashboardBenefitOverviewStore();
// const dashboardInvestmentOverviewStore = new DashboardInvestmentOverviewStore();
// const dashboardKPIOverviewStore = new DashboardKPIOverviewStore();
// const dashboardProjectOverviewStore = new DashboardProjectOverviewStore();
// const dashboardWorkstreamOverviewStore = new DashboardWorkstreamOverviewStore();
// const dashboardBenefitTrackingOverviewStore = new DashboardBenefitTrackingOverviewStore();
// const dashboardInvestmentTrackingOverviewStore = new DashboardInvestmentTrackingOverviewStore();

export default {
    dashboardNetBenefitStore, loginStore, saveVDTStore, myProjectStore, valueDriversStore,
    manuallySearchKpisStore, reviewValueDriverStore, setKpiTargetStore, addInitiativeStore,
     publishDashboardStore, adminStore, editVDTStore, kpiBenefitsStore, investmentStore, 
     commonParamsStore,businessCaseSummaryStore, customVDTStore,investmentActualsStore ,benefitActualsStore,
      workstreamStore, linkKPIInvestmentStore,workstreamActualsStore ,kpiDashboardStore, netBenefitOverviewStore,
      dashboardBenefitsOverviewStore, projectOverviewDashboardStore, benefitOverviewVTStore,
      investmentOverviewDashboardStore,investmentOverviewDeliveryStore, dashboardWorkstreamOverviewStore, dashboardStore,howToUseStore
}


// dashboardNetBenefitStore, dashboardInvestmentOverviewStore, dashboardBenefitOverviewStore,
// dashboardProjectOverviewStore, dashboardWorkstreamOverviewStore, dashboardKPIOverviewStore,
// dashboardBenefitTrackingOverviewStore, dashboardInvestmentTrackingOverviewStore