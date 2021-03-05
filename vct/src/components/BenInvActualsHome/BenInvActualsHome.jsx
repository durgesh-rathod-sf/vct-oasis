import React, { Fragment } from 'react';
import InvestmentActuals from '../../containers/InvestmentActuals/InvestmentActuals';
import BenefitActualsHomeData from '../../containers/BenefitActualsHome/BenefitActualsHomeData.jsx';
// import TimelineHome from '../../containers/TimelineHome/TimelineHome';
import WorkStreamActualsHome from '../../containers/WorkstreamActuals/WorkstreamActualsHome.jsx';

const BenInvActualsHome = (props) => {
    return (
        <Fragment>
            <div className="ca-tab-content-main-wrapper">
            <div className="row ca-tab-links-wrapper">
                <ul className="ca-tab-ul col-sm-9">
                    <li className="ca-tab-li">
                        <a className={`ca-nav-link ${props.isBenefitActuals ? 'active-class' : ''}`}
                        style={{
                            color: props.isBenefitActuals ? 'white' : '#D0D0D0',
                            fontSize: props.isExpandBenefits ? '12px' : '12px'
                        }}
                        onClick={props.benefitsClick}
                        >Benefit Actuals
                        </a>
                    </li>
                    <li className="ca-tab-li">
                        <a className={`ca-nav-link ${!props.isBenefitActuals && !props.isWorkStreamActuals ? 'active-class' : ''}`}
                        style={{
                            
                            color: !props.isBenefitActuals && !props.isWorkStreamActuals ? 'white' : '#D0D0D0',
                            fontSize: props.isExpandBenefits ? '12px' : '12px'
                        }}
                        onClick={props.investmentsClick}
                        >Investment Actuals
                        </a>
                    </li>
                    <li className="ca-tab-li">
                        <a className={`ca-nav-link ${props.isWorkStreamActuals ? 'active-class' : ''}`}
                         style={{  color: props.isWorkStreamActuals ? 'white' : '#D0D0D0',
                         fontSize: props.isExpandBenefits ? '12px' : '12px' }}
                         onClick={props.workstreamsActualsClick}
                        >Workstream Actuals
                        </a>
                    </li>
                </ul>
                <div className="col-sm-3">

                </div>
               
            </div>
            {
                props.isWorkStreamActuals && props.isExpandBenefits ?
                    <WorkStreamActualsHome
                        // onExpandClick={props.onExpandClick}
                        isExpandBenefits={true} />
                    :
                    props.isBenefitActuals ?
                        <BenefitActualsHomeData
                            onExpandClick={props.onExpandClick}
                            fetchKpiBenefits={props.fetchKpiBenefits}
                            KPIBenefitsArray={props.KPIBenefitsArray}
                            KPIDetailsArray={props.KPIDetailsArray}
                            selectedKpiObj={props.selectedKpiObj}
                            isExpandBenefits={props.isExpandBenefits}
                            branchTree={props.branchTree}
                        />
                        :
                        <InvestmentActuals
                            onExpandClick={props.onExpandClick}
                            startDatesArray={props.startDatesArray}
                            totalInvFormat={props.totalInvFormat}
                            isBusinessCase={props.isBusinessCase}
                            getInvestments={props.getInvestments}
                            actualResult={props.actualResult}
                            actualInitiatives={props.actualInitiatives}
                            actualLinkedKPIIds={props.actualLinkedKPIIds}
                            actualAddClicked={props.actualAddClicked}
                            actualTotalInvestmentsArray={props.actualTotalInvestmentsArray}
                            projectedResult={props.projectedResult}
                            projectedInitiatives={props.projectedInitiatives}
                            projectedLinkedKPIIds={props.projectedLinkedKPIIds}
                            projectedAddClicked={props.projectedAddClicked}
                            projectedTotalInvestmentsArray={props.projectedTotalInvestmentsArray}
                            showError={props.showError}
                            isExpandBenefits={props.isExpandBenefits}
                        />

            }
            </div>
            

        </Fragment >
    );
}

export default BenInvActualsHome;