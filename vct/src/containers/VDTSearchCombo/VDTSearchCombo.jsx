import React, { Component, Fragment } from 'react';
import { withRouter } from "react-router-dom";
import Select from 'react-select';
import { observer, inject } from 'mobx-react';
import { toast } from 'react-toastify';
import NotificationMessage from '../../components/NotificationMessage/NotificationMessage';
import './VDTSearchCombo.css';
var SessionStorage = require('store/storages/sessionStorage');

@inject('editVDTStore', 'reviewValueDriverStore')
@observer
class VDTSearchCombo extends Component {
    constructor(props) {
        super(props);
        this.state = {
            masterData: [],
            masterIndustryData: [],
            accentureOffering: [],
            accentureIndustry: [],
            industriesToDisplay: [], //to display in dropdown with key value pairs
            selectedIndustry: props.selectedIndustry,
            industryLoader: false,
            accentureOfferingLoader: false,
            selectedAccentureOffering: props.selectedAccentureOffering,
            disableIndustry: true


        }

        this.enableGenerateVDT = this.enableGenerateVDT.bind(this);
        this.disableGenerateVDT = this.disableGenerateVDT.bind(this)
    }

    enableGenerateVDT = () => {
        var enableBtn = true
        this.setState({
            disableIndustry: true
        })
        this.props.enableGenerateVDT(enableBtn);
    }
    disableGenerateVDT = () => {
        var enableBtn = false
        this.props.enableGenerateVDT(enableBtn);
    }

    onSelectedIndustry = (selectedOption) => {
        const { masterData, selectedAccentureOffering, masterIndustryData } = this.state
        const { editVDTStore } = this.props;
        let accentureOfferings = [];
        // accentureOfferings.push({
        //     value: "Select",
        //     label: "Select"
        // })
        let selectedProjectId = ''
        let selectedMapId = ''
        /* to reset the filters upon Select click start*/
        let accentureOffering = [], accentureIndustry = [];
        if (selectedOption === null) {
            // accentureOffering.push({
            //     value: "Select",
            //     label: "Select"
            // })
            // accentureIndustry.push({
            //     value: "Select",
            //     label: "Select"
            // })

            const myOfferingsObj = this.state.masterData;
            let result = Object.keys(myOfferingsObj);
            console.log(myOfferingsObj, result);
            result.map((value) => {
                accentureOffering.push({
                    value: value,
                    label: value
                })
                return true
            });

            const myIndustriesObj = this.state.masterIndustryData;
            let result1 = Object.keys(myIndustriesObj);
            result1.map((value) => {
                accentureIndustry.push({
                    value: value,
                    label: value
                })
                return true
            });

            this.setState({
                accentureOffering: accentureOffering,
                industriesToDisplay: accentureIndustry,
                selectedAccentureOffering: null, //reset offering
                selectedAccentureOfferingValue: null,//reset offering
            },()=>{
                console.log(this.state.accentureIndustry, this.state.accentureOffering);
            });
        }
        /* to reset the filters upon Select click end*/
        else {
            for (const offering of Object.keys(masterData)) {
                if (offering === selectedAccentureOffering) {
                    masterData[offering].map((value) => {
                        if (value.industry === selectedOption.value) {
                            selectedProjectId = value.projectId
                            selectedMapId = value.mapId
                        }
                        return true
                    })
                    if (SessionStorage.read('offeringTenantId') === false) {
                        SessionStorage.write('offeringTenantId', masterData[offering][0].accountId);
                    }

                }
            }

            for (const industry of Object.keys(masterIndustryData)) {
                if (selectedOption !== null) {
                    if (selectedOption.value === industry) {
                        masterIndustryData[industry].map((value) => {
                            accentureOfferings.push({
                                value: value.projectName,
                                label: value.projectName
                            })
                            return true
                        })
                        // SessionStorage.write('offeringTenantId', masterData[industry][0].accountId);
                    }
                }
            }
            this.setState({
                selectedProjectId: selectedProjectId,
                selectedMapId: selectedMapId,
                accentureOffering: accentureOfferings
            })
        }
        this.setState({
            selectedIndustry: selectedOption === null ? null : selectedOption.value,//selectedOption.value,
            selectedIndustryValue: selectedOption === null ? null : selectedOption, //selectedOption,
        },()=>{
            if((this.state.selectedAccentureOfferingValue !== undefined && this.state.selectedAccentureOfferingValue !== null && this.state.selectedAccentureOfferingValue !== "") && 
               (this.state.selectedIndustryValue !== undefined && this.state.selectedIndustryValue !== null && this.state.selectedIndustryValue !== "")){
                this.enableGenerateVDT();
                this.props.saveProjectMapId(selectedProjectId, selectedMapId)
                editVDTStore.cancelSelected = false;
                editVDTStore.findWhenSelected = false;
            }else{
                this.disableGenerateVDT();
            }
        });
    }

    onSelectAccentureOffering = (selectedOption) => {
        const { masterData, masterIndustryData, selectedIndustry } = this.state;
        const { editVDTStore } = this.props;
        let selectedProjectId = '', selectedMapId = '';
        let industries = []
        /* to reset the filters upon Select click start*/
        let accentureOffering = [], accentureIndustry = [];
        if (selectedOption === null) {
            // accentureOffering.push({
            //     value: "Select",
            //     label: "Select"
            // })
            // accentureIndustry.push({
            //     value: "Select",
            //     label: "Select"
            // })

            const myOfferingsObj = this.state.masterData;
            let result = Object.keys(myOfferingsObj);
            console.log(myOfferingsObj, result);
            result.map((value) => {
                accentureOffering.push({
                    value: value,
                    label: value
                })
                return true
            });

            const myIndustriesObj = this.state.masterIndustryData;
            let result1 = Object.keys(myIndustriesObj);
            result1.map((value) => {
                accentureIndustry.push({
                    value: value,
                    label: value
                })
                return true
            });

            this.setState({
                accentureOffering: accentureOffering,
                industriesToDisplay: accentureIndustry,
                selectedIndustry:  null,//reset Industry,
                selectedIndustryValue: null, //reset Industry,
            },()=>{console.log(this.state.accentureIndustry, this.state.accentureOffering);});
        }
        /* to reset the filters upon Select click end*/
        else {
            for (const industry of Object.keys(masterIndustryData)) {
                if (industry === selectedIndustry) {
                    masterIndustryData[industry].map((value) => {
                        if (value.projectName === selectedOption.value) {
                            selectedProjectId = value.projectId
                            selectedMapId = value.mapId
                        }
                        return true
                    })
                    if (SessionStorage.read('offeringTenantId') === false) {
                        SessionStorage.write('offeringTenantId', masterIndustryData[industry][0].accountId);
                    }

                }
            }

            // industries.push({
            //     value: "Select",
            //     label: "Select"
            // })
            for (const offering of Object.keys(masterData)) {
                if (selectedOption !== null) {
                    if (offering === selectedOption.label) {
                        masterData[offering].map((value) => {
                            industries.push({
                                value: value.industry,
                                label: value.industry
                            })
                            return true
                        })
                        SessionStorage.write('offeringTenantId', masterData[offering][0].accountId);
                    }
                }
            }
            this.setState({
                industryLoader: false,
                industriesToDisplay: industries,
                disableIndustry: false,
                selectedProjectId: selectedProjectId,
                selectedMapId: selectedMapId,
            })
        }
        this.setState({
            selectedAccentureOffering: selectedOption === null ? null : selectedOption.value,
            selectedAccentureOfferingValue: selectedOption === null? null : selectedOption,
        },()=>{
            if((this.state.selectedAccentureOfferingValue !== undefined && this.state.selectedAccentureOffering !== null && this.state.selectedAccentureOffering !== "") && 
            (this.state.selectedAccentureOfferingValue !== undefined && this.state.selectedIndustry !== null && this.state.selectedIndustry !== "")){
                this.enableGenerateVDT();
                this.props.saveProjectMapId(selectedProjectId, selectedMapId)
                editVDTStore.cancelSelected = false;
                editVDTStore.findWhenSelected = false;
            }else{
                this.disableGenerateVDT();
            }
        });
    }

    componentDidUpdate(prevProps) {
        const { reviewValueDriverStore } = this.props;
        if (prevProps.isDeletedVDT !== this.props.isDeletedVDT) {
            reviewValueDriverStore.selectedAccentureOffering = "";
            reviewValueDriverStore.selectedIndustry = "";
            this.setState({
                selectedAccentureOfferingValue: "",
                selectedIndustryValue: ""
            })
            this.disableGenerateVDT()
        }
    }
    componentDidMount() {
        const { editVDTStore, reviewValueDriverStore } = this.props;
        if(reviewValueDriverStore.branchTree.length > 0) {
            reviewValueDriverStore.selectedAccentureOffering=''
            reviewValueDriverStore.selectedIndustry=''
        }


        if (this.props.treeLength > 0) {
            editVDTStore.cancelSelected = false
        }
        else {
            editVDTStore.cancelSelected = true
        }

        editVDTStore.loadOfferings()
            .then((response) => {
                if (response && !response.error && response.data && response.data.resultCode === "OK") {
                    let result = {}, result1 = {};
                    let accentureOffering = [],accentureIndustry = [];
                    
                    const myOfferingsObj = response.data.resultObj.groupedByName;
                    result = Object.keys(myOfferingsObj);
                    result.map((value) => {
                        accentureOffering.push({
                            value: value,
                            label: value
                        })
                        return true
                    });
                    
                    const myIndustriesObj = response.data.resultObj.groupedByIndustry;
                    result1 = Object.keys(myIndustriesObj)
                    result1.map((value) => {
                        accentureIndustry.push({
                            value: value,
                            label: value
                        })
                        return true
                    });

                    this.setState({
                        industriesToDisplay: accentureIndustry,
                        accentureOffering: accentureOffering,
                        masterIndustryData: myIndustriesObj,
                        masterData: myOfferingsObj
                    })
                }else if (response.data.resultCode === 'KO') {
                    this.showErrorNotification(response.data.errorDescription, "Error", "error");
                }

            })

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

    demoFunction() {
        this.setState({
            selectedAccentureOfferingValue: ""
        }, () => {
            return "";
        })
    }


    render() {
        const { accentureOffering, selectedAccentureOfferingValue, accentureOfferingLoader, industriesToDisplay, industryLoader, selectedIndustryValue } = this.state;
        const { reviewValueDriverStore, demoUser} = this.props

        const defaultStyle3 = {
            control: (base) => ({
                ...base, color: 'rgba(255, 255, 255, 0.8)',
                borderRadius: '2px', textAlign: 'left', backgroundColor: '#5A5A5A',
                borderColor: this.props.disableCombo ? 'grey' : 'rgba(255, 255, 255, 0.8)', minHeight: '32px',
                fontSize: '12px', '&:hover': { borderColor: 'rgba(255, 255, 255, 0.8)' }
            }),
            indicatorSeparator: (base) => ({ ...base, display: 'none' }),
            menu: (base) => ({
                ...base, fontSize: '12px', marginTop: 0, borderRadius: '2px',
                paddingTop: 0, paddingBottom: 0,
            }),
            indicatorsContainer: (base) => ({ ...base, padding: 0 }),
            menuList: (base) => ({
                ...base, padding: 0, color: 'rgba(255, 255, 255, 0.8)', textAlign: 'left',
                height: '120px', backgroundColor: '#5A5A5A', border: '1px solid rgba(255, 255, 255, 0.8)',
            }),
            dropdownIndicator: (base) => ({ ...base, padding: 0, paddingRight: '2px', color: this.props.disableCombo ? 'grey' : 'rgba(255, 255, 255, 0.8)', '&:hover': { color: '#ffffff' }, '& svg': { width: 22, height: 22 } }),
            option: (base) => ({ ...base, padding: 0, paddingTop: '2px', paddingLeft: '5px' }),
            placeholder: (base) => ({ ...base, color: this.props.disableCombo ? 'grey' : 'rgba(255, 255, 255, 0.8)' }),
            singleValue: (base) => ({ ...base, color: this.props.disableCombo ? 'grey' : 'rgba(255, 255, 255, 0.8)' }),
            input: (base) => ({ ...base, color: 'rgba(255, 255, 255, 0.8)' }),
        }
        return (
            <Fragment>
             {  (SessionStorage.read("userType") !== "EU" && (SessionStorage.read("accessType") !== "Read"||SessionStorage.read("accessType") !== "Write" ) )&&  
              <div data-html2canvas-ignore="true" className="row">
                    <div  className={`col-sm-6 offering-select-box ${(demoUser || (SessionStorage.read("isMaster") === "Y" || (SessionStorage.read("accessType") === "Read"))) ? 'offering-select-disable' :''}`}>
                   <p style={{ color: this.props.disableCombo ? 'grey' : '#ffffff' }}>Accenture Offering *</p> 
                    <Select
                            size={6}
                            id="ddlCars"
                            isClearable
                            value={(selectedAccentureOfferingValue === undefined ? reviewValueDriverStore.selectedAccentureOffering : selectedAccentureOfferingValue)}
                            onChange={this.onSelectAccentureOffering}
                            options={accentureOffering && accentureOffering.constructor === Array ? accentureOffering : []}
                            styles={defaultStyle3}
                            defaultValue={reviewValueDriverStore.selectedAccentureOffering}
                            isDisabled={(demoUser || (SessionStorage.read("isMaster") === "Y" || (SessionStorage.read("accessType") === "Read"))|| (SessionStorage.read("userType") === "EU" && (SessionStorage.read("accessType") === "Read"||SessionStorage.read("accessType") === "Write" ) )) ? true : accentureOfferingLoader ? accentureOfferingLoader : this.props.disableCombo}
                            placeholder={accentureOfferingLoader ? <i className="fa fa-spinner fa-spin"></i> : "Select Offering"}
                            theme={theme => ({
                                ...theme,
                                colors: {
                                    ...theme.colors,
                                    primary25: '#004DFF',
                                    primary: '#00BAFF',
                                    primary50: '#004DFF'
                                },


                            })}
                        />
                    </div>
                    <div  className={`col-sm-6 ${(demoUser || (SessionStorage.read("isMaster") === "Y" || (SessionStorage.read("accessType") === "Read"))) ? 'offering-select-disable' :''}`} style={{ zIndex: '3', paddingRight: '0px' }}>
                    <p style={{ color: this.props.disableCombo ? 'grey' : '#ffffff', marginBottom: '0' }}>Industry *</p> 
                    <Select
                            size="6"
                            isClearable
                            // value={!editVDTStore.cancelSelected?selec===""?reviewValueDriverStore.selectedSolutiontype:selectedSolutionTypeValue:''}
                            value={(selectedIndustryValue === undefined ? reviewValueDriverStore.selectedIndustry : selectedIndustryValue)}
                            onChange={this.onSelectedIndustry}
                            options={industriesToDisplay && industriesToDisplay.constructor === Array ? industriesToDisplay : []}
                            styles={defaultStyle3}
                            // isMulti={true}
                            isSearchable={true}
                            isDisabled={
                                // disableIndustry?disableIndustry:
                                ((demoUser || (SessionStorage.read("isMaster") === "Y" || (SessionStorage.read("accessType") === "Read"))|| (SessionStorage.read("userType") === "EU" && (SessionStorage.read("accessType") === "Read"||SessionStorage.read("accessType") === "Write" ) )) ? true : industryLoader ? accentureOfferingLoader : this.props.disableCombo)}
                            placeholder={industryLoader ? <i className="fa fa-spinner fa-spin"></i> : "Select Industry"}
                            theme={theme => ({
                                ...theme,
                                colors: {
                                    ...theme.colors,
                                    primary25: '#004DFF',
                                    primary: '#00BAFF',
                                    primary50: '#004DFF'
                                },
                            })}
                        />
                    </div>

                </div>
    }

            </Fragment >)
    }
}

export default withRouter(VDTSearchCombo);
