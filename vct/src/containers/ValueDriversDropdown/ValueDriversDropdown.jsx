import React, { Component } from 'react';
import { observer, inject } from 'mobx-react';
import { toast } from 'react-toastify';
import { withRouter } from "react-router-dom";
import Menu from '../../components/Menu/Menu';
import ExportModal from '../../components/ExportModal/ExportModal';
import NotificationMessage from '../../components/NotificationMessage/NotificationMessage';
import ProjectNavbar from '../../components/ProjectNavbar/ProjectNavbar';
import Polygon from '../../assets/project_card_icon.svg';
import './ValueDrivers.css';
import VDTTable from '../../components/Table/VDTTable';
import Select from 'react-select';
import ReviewValueDriverTree from '../ReviewValueDriverTree/ReviewValueDriverTree';
var SessionStorage = require('store/storages/sessionStorage');

@inject('valueDriversStore')
@inject('editVDTStore')
@observer
class ValueDriversDropdown extends Component {
    constructor(props) {
        super(props);
        this.state = {
            growthPillar: '',
            selectedGrowthPillar: '',
            selectedGrowthPillarValue: '',
            solutionType: '',
            selectedSolutionType: '',
            selectedSolutionTypeValue: '',
            subIndustry: '',
            selectedSubIndustry: '',
            selectedSubIndustryValue: '',


        }
        this.industryClickHandler = this.industryClickHandler.bind(this);
        this.functionalAreaClickHandler = this.functionalAreaClickHandler.bind(this);
        this.developDriversHandler = this.developDriversHandler.bind(this);
        this.selectVDTHandler = this.selectVDTHandler.bind(this);

    }
    componentDidMount() {

        const { editVDTStore } = this.props;
        editVDTStore.getGrowthPillar()
            .then((response) => {
                const growthPillar = []
                let data = ''
                editVDTStore.growthPillar.map((index) => {
                    data = {
                        value: index.value['cmt_growth_pillar'],
                        label: index.label['cmt_growth_pillar']
                    }
                    growthPillar.push(data);
                })

                this.setState({
                    growthPillar: growthPillar
                })
            })
        console.log(this.state.growthPillar);
        const { valueDriversStore } = this.props;
        valueDriversStore.resetValueDriver();
        valueDriversStore.getDefaultDropdownValue()
            .then((response) => {
                if (response && response.data && response.data.resultCode === 'OK') {
                    this.setState({
                        tableData: valueDriversStore.highKpiDetails,
                        priority: 'selected'
                    })
                }else if(response && response.data && response.data.resultCode === 'KO'){
                    this.showErrorNotification(response.data.errorDescription);
                }
            });
        valueDriversStore.selectedIndustry = '';
        valueDriversStore.selectedFunctionalArea = [];
        valueDriversStore.selectedScenario = [];
        valueDriversStore.getSubIndustries();
    }

    showErrorNotification(text) {
        toast.error(<NotificationMessage
            title="Error"
            bodytext={text}
            icon="error"
        />, {
            position: toast.POSITION.BOTTOM_RIGHT
        });
    }

    showSuccessNotification(type) {
        // eslint-disable-next-line default-case
        switch (type) {
            case 'VDTSaved':
                toast.info(<NotificationMessage
                    title="Success"
                    bodytext={'Successfully saved data'}
                    icon="success"
                />, {
                    position: toast.POSITION.BOTTOM_RIGHT
                });
                break;
            case 'nodata':
                toast.info(<NotificationMessage
                    title="Error"
                    bodytext={'Sorry! No data to show'}
                    icon="error"
                />, {
                    position: toast.POSITION.BOTTOM_RIGHT
                });
        }
    }



    createFilteredArr(actArr) {
        let arr = [];
        if (actArr) {
            for (let opt of actArr) {
                arr.push(opt.value);
            }
        }
        return arr;
    }

    industryClickHandler = (selectedOption) => {
        const { valueDriversStore } = this.props;
        this.setState({
            functionalAreaLoader: true,
            projectScenarioLoader: true
        })
        valueDriversStore.selectedIndustry = selectedOption.value;
        valueDriversStore.getSubIndustries()
            .then((response) => {
                this.setState({
                    functionalAreaLoader: false,
                    projectScenarioLoader: false
                })
            })
        this.setState({
            selectedIndustry: selectedOption.value,
            selectedIndustryValue: selectedOption,
            functionalArea: '',
        })
    }

    functionalAreaClickHandler = (selectedOption) => {
        const { valueDriversStore } = this.props;
        this.setState({
            industryLoader: true,
            projectScenarioLoader: true
        })
        valueDriversStore.selectedFunctionalArea = []
        if (selectedOption !== null) {
            let selectedFunctionalOption = []
            for (let i = 0; i < selectedOption.length; i++) {
                selectedFunctionalOption.push(selectedOption[i].value)
            }
            valueDriversStore.selectedFunctionalArea = selectedFunctionalOption;
        }

        valueDriversStore.getSubIndustries()
            .then((response) => {
                this.setState({
                    industryLoader: false,
                    projectScenarioLoader: false
                })
            })
        this.setState({
            //selectedFunctionalArea: event.target.value,
            selectedFunctionalOption: selectedOption,
            projectScenario: '',
        })
    }

    scenarioClickHandler = (selectedOption) => {
        const { valueDriversStore } = this.props;
        this.setState({
            industryLoader: true,
            functionalAreaLoader: true
        })
        valueDriversStore.selectedScenario = []
        if (selectedOption !== null) {
            let selectedProjectOptions = []
            for (let i = 0; i < selectedOption.length; i++) {
                selectedProjectOptions.push(selectedOption[i].value)
            }
            valueDriversStore.selectedScenario = selectedProjectOptions
        }
        valueDriversStore.getSubIndustries()
            .then((response) => {
                this.setState({
                    industryLoader: false,
                    functionalAreaLoader: false
                })
            })
        this.setState({
            //projectScenario: event.target.value
            selectedProjectScenarioOption: selectedOption
        })
    }
    growthPillarClickHandler = (selectedOption) => {
        const { editVDTStore } = this.props;
        editVDTStore.selectedGrowthPillar = selectedOption.value;
        this.setState({
            selectedGrowthPillar: selectedOption.value,
            selectedGrowthPillarValue: selectedOption,
            solutionType: '',
        })
        editVDTStore.getSolutionType(selectedOption.value)
            .then((response) => {
                if(response && response.data && response.data.resultCode === 'OK'){
                const solutionType = []
                let data = ''
                editVDTStore.solutionType.map((index) => {
                    data = {
                        value: index.value['solution_type'],
                        label: index.label['solution_type']
                    }
                    solutionType.push(data);
                    return true
                })

                this.setState({
                    solutionType: solutionType
                })
                return true
            }else if (response && response.data && response.data.resultCode === 'KO') {
                this.showErrorNotification(response.data.errorDescription);
            }
            })
    }

    render() {
        const { valueDriversStore } = this.props;
        const { growthPillar, subIndustry } = valueDriversStore
        const { tableData, visualVDTButton, editVDTButton, exportXlsBtnModal, exportPPTBtnModal, selectedFunctionalOption, selectedProjectScenarioOption, priority, selectedIndustryValue, industryLoader, functionalAreaLoader, projectScenarioLoader } = this.state
        const pname = SessionStorage.read('projectName');
        const demoUser = SessionStorage.read('demoUser');
        const defaultStyle = {
            option: (styles) => {
                return {
                    ...styles,
                    color: 'black',
                };
            },
        };
        return (
            <div className="row">

                <div className="col-sm-4">
                    <p style={{ color: '#ffffff' }}>CMT Growth Pillar*</p>
                    <Select
                        value={selectedGrowthPillarValue}
                        onChange={this.growthPillarClickHandler}
                        options={growthPillar}
                        styles={defaultStyle}
                        //isDisabled={industryLoader}                            
                        //placeholder= {industryLoader ? <i className="fa fa-spinner fa-spin"></i> : "Select CMT Sub-Industry"} 
                        placeholder="Select CMT Growth Pillar"
                        theme={theme => ({
                            ...theme,
                            colors: {
                                ...theme.colors,
                                primary25: '#A9A9A9', // fix (hover)
                                neutral0: 'white', // background
                                primary50: '#676767' // fix (on select transition)
                            },
                        })}
                    />
                </div>
                <div className="col-sm-4">
                    <p style={{ color: '#ffffff' }}>Solution Type*</p>
                    <Select
                        value={selectedSolutionTypeValue}
                        onChange={this.solutionTypeClickHandler}
                        options={solutionType}
                        styles={defaultStyle}
                        //isDisabled={industryLoader}                            
                        //placeholder= {industryLoader ? <i className="fa fa-spinner fa-spin"></i> : "Select CMT Sub-Industry"} 
                        placeholder="Select Solution Type"
                        theme={theme => ({
                            ...theme,
                            colors: {
                                ...theme.colors,
                                primary25: '#A9A9A9', // fix (hover)
                                neutral0: 'white', // background
                                primary50: '#676767' // fix (on select transition)
                            },
                        })}
                    />
                </div>
                <div className="col-sm-4">
                    <p style={{ color: '#ffffff' }}>CMT Sub-Industry*</p>
                    <Select
                        value={selectedSubIndustryValue}
                        onChange={this.subIndustryClickHandler}
                        options={subIndustry}
                        styles={defaultStyle}
                        //isDisabled={industryLoader}                            
                        //placeholder= {industryLoader ? <i className="fa fa-spinner fa-spin"></i> : "Select CMT Sub-Industry"} 
                        placeholder="Select CMT Sub-Industry"
                        theme={theme => ({
                            ...theme,
                            colors: {
                                ...theme.colors,
                                primary25: '#A9A9A9', // fix (hover)
                                neutral0: 'white', // background
                                primary50: '#676767' // fix (on select transition)
                            },
                        })}
                    />
                </div>
            </div>

        )
    }

    export default withRouter(ValueDriversDropdown);