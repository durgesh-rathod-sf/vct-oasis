import React, { Component, Fragment } from 'react';
import { withRouter } from "react-router-dom";
import { observer, inject } from 'mobx-react';
import Moment from 'moment';
import ProjectedInvestments from '../ProjectedInvestments/ProjectedInvestments';
import ActualInvestments from '../../components/ActualInvestments/ActualInvestments'


@inject('reviewValueDriverStore', 'kpiBenefitsStore', 'investmentStore', 'investmentActualsStore')
@observer
class Investments extends Component {
    constructor(props) {
        super(props);
        this.state = ({
            result: '',
            initiatives: '',
            linkedKPIIds: '',
            addClicked: '',
            deleteClicked: false,
            saveInvestments: false,
            valuesChanged: false,
            newActualYear: false,
            newProjectedYear: false,
            showErrorMessage: false,
            loadTable: false,
            addedProjectedYear: false,
            deletedProjectedYear: false,
            deletedActualYear: false,
            saveLoading:false
        })
        this.saveClicked = this.saveClicked.bind(this)
        this.isDeleteClicked = this.isDeleteClicked.bind(this)
        this.addNewActualYear = this.addNewActualYear.bind(this)
        this.addNewProjectedYear = this.addNewProjectedYear.bind(this)
        this.loadTable = this.loadTable.bind(this)
        this.deleteActualYear = this.deleteActualYear.bind(this)
        this.deleteProjectedYear = this.deleteProjectedYear.bind(this)
        this.handleChange = this.handleChange.bind(this);
        this.handleFreqDateChange = this.handleFreqDateChange.bind(this);
        this.addDateColumn = this.addDateColumn.bind(this);
        // this.disableSave=this.disableSave.bind(this);
    }
    handleChange = (value) => {

        const { startDatesArray, investmentActualsStore } = this.props;
        let result = startDatesArray
        this.setState({
            dateValue: value,
        }
        );
        result.main_start_date = value !== null ? Moment(value).format('YYYY-MM-DD') : ""
        this.calculatedates(value);
        if (investmentActualsStore.frequency !== 'yearly') {
            this.calculateFrequencyLevelDate(value);
        }

    }
    setSaveProgress=(value)=>{
this.setState({
    saveLoading:value
})
    }
    calculatedates = (dateValue) => {
        const { projectedTotalInvestmentsArray, actualTotalInvestmentsArray, startDatesArray } = this.props;
        let projTotalInvArr = projectedTotalInvestmentsArray;
        let actualTotalInvArr = actualTotalInvestmentsArray;
        let result = startDatesArray.year_dates
        const periods = (
            projTotalInvArr.length > actualTotalInvArr.length ?
                projTotalInvArr.length :
                actualTotalInvArr.length
        )
        let tempDateArr = [];
        let newDate = "";
        let startDate = dateValue !== null ? Moment(dateValue) : ''
        for (let i = 0; i < (periods); i++) {
            if (tempDateArr.length === 0) {

                newDate = startDate !== "" ? Moment(startDate) : ''
            }
            else {
                newDate = tempDateArr[i - 1] !== "" ? Moment(tempDateArr[i - 1]).add(1, 'year') : ''
            }
            tempDateArr.push(newDate)
        }
        let dailyFrequency = tempDateArr
        for (let i = 0; i < dailyFrequency.length; i++) {
            let dateNew = dailyFrequency[i] !== "" ? new Date(dailyFrequency[i]) : "";
            result[i].start_date = dateNew !== "" ? Moment(dateNew).format('YYYY-MM-DD') : ''
        }
    }
    addDateColumn() {
        const { investmentActualsStore, startDatesArray } = this.props;
        let result = startDatesArray.year_dates;
        let freqObj = {}
        let freqDates = []
        let lastYearDate = result[(result.length) - 1].start_date !== "" ? new Date(result[(result.length) - 1].start_date) : ""
        if (investmentActualsStore.frequency !== "yearly") {
            let lastfrequencyDate = new Date(result[(result.length) - 1].frequency_start_dates[(result[(result.length) - 1].frequency_start_dates).length - 1].start_date)
            switch (investmentActualsStore.frequency) {
                case 'monthly':
                    for (let i = result.length * 12; i < (result.length * 12) + 12; i++) {
                        let newDate = lastfrequencyDate !== "" ? Moment(lastfrequencyDate).add(1, 'month').format('YYYY-MM-DD') : ''
                        freqObj = {
                            "month_no": i + 1,
                            "start_date": lastfrequencyDate !== "" ? Moment(lastfrequencyDate).add(1, 'month').format('YYYY-MM-DD') : ''
                        }
                        lastfrequencyDate = newDate
                        freqDates.push(freqObj)
                    }

                    break;
                case 'quarterly':
                    for (let i = result.length * 4; i < (result.length * 4) + 4; i++) {
                        let newDate = lastfrequencyDate !== "" ? Moment(lastfrequencyDate).add(1, 'quarter').format('YYYY-MM-DD') : ''
                        freqObj = {
                            "quarter_no": i + 1,
                            "start_date": newDate
                        }
                        lastfrequencyDate = newDate
                        freqDates.push(freqObj)
                    }
                    break;
                case 'fortnightly':
                    for (let i = result.length * 26; i < (result.length * 26) + 26; i++) {
                        let newDate = lastfrequencyDate !== "" ? Moment(lastfrequencyDate).add(14, 'days').format('YYYY-MM-DD') : ''
                        freqObj = {
                            "fortnight_no": i + 1,
                            "start_date": lastfrequencyDate !== "" ? Moment(lastfrequencyDate).add(14, 'days').format('YYYY-MM-DD') : ''
                        }
                        lastfrequencyDate = newDate
                        freqDates.push(freqObj)
                    }
                    break;
                default: break;
            }

        }
        let newYearObj = {
            "year_no": (result.length + 1),
            "start_date": lastYearDate !== "" ? investmentActualsStore.frequency === "yearly" ? Moment(lastYearDate).add(1, 'year') : freqDates[freqDates.length - 1].start_date : '',
            "frequency_start_dates": freqDates
        }
        result.push(newYearObj)

    }

    calculateFrequencyLevelDate = (value) => {
        const { investmentActualsStore, startDatesArray } = this.props;
        let result = startDatesArray.year_dates;
        let formattedDate = Moment(value)
        for (let j = 0; j < result.length; j++) {
            for (let k = 0; k < result[j].frequency_start_dates.length; k++) {
                switch (investmentActualsStore.frequency) {
                    case 'quarterly':
                        if (j === 0 && k === 0) {
                            result[j].frequency_start_dates[k].start_date = formattedDate.format('YYYY-MM-DD')
                            formattedDate = result[j].frequency_start_dates[k].start_date
                        } else {
                            result[j].frequency_start_dates[k].start_date = formattedDate !== "" ? Moment(formattedDate).add(1, 'quarter').format('YYYY-MM-DD') : ''
                            formattedDate = result[j].frequency_start_dates[k].start_date
                        }
                        result[j].start_date = result[j].frequency_start_dates[k].start_date // year1 = month 12 date
                        break;
                    case 'monthly':
                        if (j === 0 && k === 0) {
                            result[j].frequency_start_dates[k].start_date = formattedDate.format('YYYY-MM-DD')
                            formattedDate = result[j].frequency_start_dates[k].start_date
                        } else {
                            result[j].frequency_start_dates[k].start_date = formattedDate !== "" ? Moment(formattedDate).add(1, 'month').format('YYYY-MM-DD') : ''
                            formattedDate = result[j].frequency_start_dates[k].start_date
                        }
                        result[j].start_date = result[j].frequency_start_dates[k].start_date
                        break;
                    case 'fortnightly':
                        if (j === 0 && k === 0) {
                            result[j].frequency_start_dates[k].start_date = formattedDate.format('YYYY-MM-DD')
                            formattedDate = result[j].frequency_start_dates[k].start_date
                        } else {
                            result[j].frequency_start_dates[k].start_date = formattedDate !== "" ? Moment(formattedDate).add(14, 'days').format('YYYY-MM-DD') : ''
                            formattedDate = result[j].frequency_start_dates[k].start_date
                        }
                        result[j].start_date = result[j].frequency_start_dates[k].start_date
                        break;
                    default: break;
                }

            }
        }
    }

    handleFreqDateChange(yearValue, freqIndex, value) {
        const { startDatesArray } = this.props;
        let result = startDatesArray.year_dates;
        if (freqIndex === "yearly") {
            result[yearValue].start_date = value
        }
        else {
            result[yearValue].frequency_start_dates[freqIndex].start_date = value
        }
    }

    loadTable(val) {
        this.setState({
            loadTable: val
        })
    }

    saveClicked(value) {
        this.setState({
            saveInvestments: value
        })
    }

    addNewActualYear(val) {
        this.setState({
            newActualYear: val,
            // newProjectedYear: false
        })
    }

    addNewProjectedYear(val) {
        this.setState({
            newProjectedYear: val,
            // newActualYear:false
        })
    }

    deleteActualYear(val) {
        this.setState({
            deletedActualYear: val,
            // newProjectedYear: false
        })
    }

    deleteProjectedYear(val) {
        this.setState({
            deletedProjectedYear: val,
            // newProjectedYear: false
        })
    }

    isDeleteClicked(val) {
        this.setState({
            deleteClicked: val
        })
    }



    render() {
        const { projectedResult, projectedInitiatives, projectedLinkedKPIIds, projectedAddClicked, projectedTotalInvestmentsArray,
            actualResult, actualInitiatives, actualLinkedKPIIds, actualAddClicked, actualTotalInvestmentsArray, startDatesArray } = this.props
        return (
            <div className="ia-tab-content-main" style={{ position: 'sticky', top: '0' }} >
                {this.props.showError ?
                    <Fragment>
                        <div  >
                            <div className="dtMsgInCA" style={{ marginTop: '2%', position: 'sticky', top: '0' }}>
                                <p className="mainMsg" style={{ fontSize: "25px", marginBottom: "-15px" }}>Data not found</p><br />
                           No Initiatives to display.
                    </div>
                        </div>
                    </Fragment> :
                    <Fragment>
                        <ProjectedInvestments
                            onExpandClick={this.props.onExpandClick}
                            handleChange={this.handleChange}
                            handleFreqDateChange={this.handleFreqDateChange}
                            addDateColumn={this.addDateColumn}
                            dateValue={this.state.dateValue}
                            result={projectedResult}
                            actualResult={actualResult}
                            initiatives={projectedInitiatives}
                            linkedKPIIds={projectedLinkedKPIIds}
                            addClicked={projectedAddClicked}
                            startDatesArray={startDatesArray}
                            totalInvestmentsArray={projectedTotalInvestmentsArray}
                            getInvestments={this.props.getInvestments}
                            saveClicked={this.saveClicked}
                            deleteClicked={this.state.deleteClicked}
                            addNewActualYear={this.addNewActualYear}
                            newProjectedYear={this.state.newProjectedYear}
                            newActualYear={this.state.newActualYear}
                            deletedProjectedYear={this.state.deletedProjectedYear}
                            deletedActualYear={this.state.deletedActualYear}
                            loadTable={this.loadTable}
                            addNewProjectedYear={this.addNewProjectedYear}
                            addedProjectedYear={this.addedProjectedYear}
                            deleteProjectedYear={this.deleteProjectedYear}
                            deleteActualYear={this.deleteActualYear}
                            isExpandBenefits={this.props.isExpandBenefits}
                            setSaveProgress={this.setSaveProgress}
                            saveLoading={this.state.saveLoading}
                        // valuesChanged={this.state.valuesChanged}
                        />
                        {this.state.loadTable ?
                            <ActualInvestments
                                onExpandClick={this.props.onExpandClick}
                                result={actualResult}
                                addDateColumn={this.addDateColumn}
                                handleFreqDateChange={this.handleFreqDateChange}
                                saveClicked={this.saveClicked}
                                projectedResult={projectedResult}
                                initiatives={actualInitiatives}
                                saveClicked={this.saveClicked}
                                linkedKPIIds={actualLinkedKPIIds}
                                addClicked={actualAddClicked}
                                startDatesArray={startDatesArray}
                                totalInvestmentsArray={actualTotalInvestmentsArray}
                                getInvestments={this.props.getInvestments}
                                saveInvestments={this.state.saveInvestments}
                                isDeleteClicked={this.isDeleteClicked}
                                addNewProjectedYear={this.addNewProjectedYear}
                                newActualYear={this.state.newActualYear}
                                newProjectedYear={this.state.newProjectedYear}
                                addNewActualYear={this.addNewActualYear}
                                isExpandBenefits={this.props.isExpandBenefits}
                                deletedProjectedYear={this.state.deletedProjectedYear}
                                deletedActualYear={this.state.deletedActualYear}
                                deleteActualYear={this.deleteActualYear}
                                deleteProjectedYear={this.deleteProjectedYear}
                                setSaveProgress={this.setSaveProgress}
                                saveLoading={this.state.saveLoading}
                            // disableSave={this.disableSave}
                            /> : ''}
                    </Fragment>
                }

            </div>


        )
    }

}

export default withRouter(Investments);