import React, { Component, Fragment } from 'react';
import { withRouter } from "react-router-dom";
import { inject } from 'mobx-react';
import ReactTooltip from 'react-tooltip';

// import './DefineWs.css';
// import AllWsInfoAndCharts from '../DefineWorkstream/AllWsInfoAndCharts';


@inject('workstreamStore')
class WorkstreamActualsNavbar extends Component {
    constructor(props) {
        super(props);
        this.handleSelectedTabClick = this.handleSelectedTabClick.bind(this);
        this.fetchAllWsDetails = this.fetchAllWsDetails.bind(this);
        this.sortAndSendArray = this.sortAndSendArray.bind(this);
        this.sortAndAssignState = this.sortAndAssignState.bind(this);
        this.handleDateModeChange = this.handleDateModeChange.bind(this);
        this.onPlusClick = this.onPlusClick.bind(this);
        this.onMinusClick = this.onMinusClick.bind(this);
        this.handleLinkKpiClose = this.handleLinkKpiClose.bind(this);
        this.wsListArray = this.wsListArray.bind(this);

        this.state = {
            selectedWorkstreamTab: 'workstreams_tab',
            selectedDateMode: 'month',
            selectedViewIcon: 'list_view',
            selectedSortByIcon: 'sort_date',
            selectedWDAIcon: 'workstream_list',
            allWorkstreamsList: [],
            allActivitiesList: [],
            allDeliverablesList: [],
            addWorkstreamArray: [],
            isGeneralInfoOpen: false,
            selectedWsDetails: false,
            showLoadingInd: true,
            noWsMsg: false,
            showLinkKpi: false,
        }
    }

    componentDidMount() {
        // after service call - GET - getAllWSDetails
        //this.WsDetailsOnLoad();

    }

    componentWillUnmount() {
        const { workstreamStore } = this.props;
        //this array is used to track new workstream rows created on clicking 'Add workstream'
        workstreamStore.addWorkstreamArray = [];
    }

    handleDateModeChange = (dateMode) => {
        const { workstreamStore } = this.props;
        if (workstreamStore.allWorkstreamsList.length > 0
            && workstreamStore.allWorkstreamsStartDate && workstreamStore.allWorkstreamsStartDate !== '') {
            this.setState({
                selectedDateMode: dateMode
            });
        }
    }

    WsDetailsOnLoad() {
        const { workstreamStore } = this.props;
        workstreamStore.getAllWsDetails()
            .then((response) => {
                if (response && response.data) {
                    if (!response.error && response.data.resultCode === "OK") {
                        if (workstreamStore.allWorkstreamsList.length > 0) {

                            this.setState({
                                selectedWorkstreamTab: 'display_WDA_icon',
                                selectedWDAIcon: 'workstream_list',
                                noWsMsg: false,
                                showLoadingInd: false,
                                allWorkstreamsList: [...workstreamStore.allWorkstreamsList],
                                allActivitiesList: [...workstreamStore.allActivitiesList],
                                allDeliverablesList: [...workstreamStore.allDeliverablesList]
                            });

                        } else {
                            this.setState({
                                selectedWorkstreamTab: 'workstreams_tab',
                                noWsMsg: true,
                                showLoadingInd: false,
                                allWorkstreamsList: [...workstreamStore.allWorkstreamsList],
                                allActivitiesList: [...workstreamStore.allActivitiesList],
                                allDeliverablesList: [...workstreamStore.allDeliverablesList]
                            });

                        }

                    } else {
                        console.log(response.data.errorDescription);
                    }
                }
            });
    }

    fetchAllWsDetails() {
        const { workstreamStore } = this.props;
        workstreamStore.getAllWsDetails()
            .then((response) => {
                if (response && response.data) {
                    if (!response.error && response.data.resultCode === "OK") {
                        let { selectedWorkstreamTab, selectedSortByIcon, selectedViewIcon, selectedWDAIcon, noWsMsg } = this.state;
                        if (workstreamStore.allWorkstreamsList.length === 0) {
                            selectedWorkstreamTab = 'workstreams_tab';
                            selectedViewIcon = 'list_view';
                            selectedSortByIcon = 'sort_date';
                            selectedWDAIcon = 'workstream_list';
                            noWsMsg = true;
                        } else {
                            noWsMsg = false;
                        }
                        this.setState({
                            selectedWorkstreamTab: selectedWorkstreamTab,
                            selectedViewIcon: selectedViewIcon,
                            selectedSortByIcon: selectedSortByIcon,
                            selectedWDAIcon: selectedWDAIcon,
                            showLoadingInd: false,
                            noWsMsg: noWsMsg,
                            allWorkstreamsList: [...workstreamStore.allWorkstreamsList],
                            allActivitiesList: [...workstreamStore.allActivitiesList],
                            allDeliverablesList: [...workstreamStore.allDeliverablesList]
                        }, () => {
                            this.sortAndAssignState(selectedSortByIcon);
                            ReactTooltip.rebuild();
                        });
                    } else {
                        console.log(response.data.errorDescription);
                    }
                }
            });
    }

    handleSelectedTabClick = (tabCategory, selected_icon_name) => {
        let { workstreamStore } = this.props;
        let { selectedSortByIcon } = this.state;
        switch (tabCategory) {
            case 'workstreams_tab':
                let tempObj = {
                    'isInputEnabled': false,
                    'workstreamName': ''
                }
                //below array is used to track new workstream rows created on clicking 'Add workstream' icon
                workstreamStore.addWorkstreamArray.push(tempObj);
                this.setState({
                    selectedWorkstreamTab: tabCategory,
                    selectedViewIcon: 'list_view',
                    selectedSortByIcon: 'sort_date',
                    selectedWDAIcon: 'workstream_list',
                    allWorkstreamsList: [...workstreamStore.allWorkstreamsList],
                    addWorkstreamArray: [...workstreamStore.addWorkstreamArray],
                    isGeneralInfoOpen: false

                });
                this.props.selectedWorkstreamTab(tabCategory);
                break;

            case 'link_kpi_investments_tab':
                workstreamStore.addWorkstreamArray = [];
                this.setState({
                    selectedWorkstreamTab: tabCategory,
                    isGeneralInfoOpen: true

                });
                this.props.selectedWorkstreamTab(tabCategory);
                break;

            case 'list_grid_icon':
                workstreamStore.addWorkstreamArray = [];

                this.sortAndAssignState(selectedSortByIcon);
                this.setState({
                    selectedWorkstreamTab: tabCategory,
                    selectedViewIcon: selected_icon_name,

                });
                this.props.selectedWorkstreamTab(tabCategory);
                break;

            case 'sort_by_icon':
                workstreamStore.addWorkstreamArray = [];
                this.sortAndAssignState(selected_icon_name);
                this.setState({
                    selectedWorkstreamTab: tabCategory,
                    selectedSortByIcon: selected_icon_name,

                });
                this.props.selectedWorkstreamTab(tabCategory);
                break;

            case 'display_WDA_icon':
                workstreamStore.addWorkstreamArray = [];

                this.setState({
                    selectedWorkstreamTab: tabCategory,
                    selectedWDAIcon: selected_icon_name,

                }, () => {
                    this.sortAndAssignState(selectedSortByIcon);
                });
                this.props.selectedWorkstreamTab(tabCategory);
                break;
            default:
                break;
        }

    }

    // below function will sort either ws, deliverables, activities list based on 'sort_order'
    sortAndAssignState = (selected_sort_type) => {
        const { selectedWDAIcon, allWorkstreamsList, allActivitiesList, allDeliverablesList } = this.state;
        let sortedArray = [];
        if (selectedWDAIcon === 'workstream_list') {
            sortedArray = this.sortAndSendArray(allWorkstreamsList, selected_sort_type);
            this.setState({
                allWorkstreamsList: sortedArray
            });
        } else if (selectedWDAIcon === 'activity_list') {
            sortedArray = this.sortAndSendArray(allActivitiesList, selected_sort_type);
            this.setState({
                allActivitiesList: sortedArray
            })
        } else {
            sortedArray = this.sortAndSendArray(allDeliverablesList, selected_sort_type);
            this.setState({
                allDeliverablesList: sortedArray
            })
        }

    }

    sortAndSendArray = (list_array, selected_sort_type) => {

        if (selected_sort_type === 'sort_date') {
            return [...list_array].sort(this.compareValues('creationDate', 'desc'));
        } else if (selected_sort_type === 'sort_az') {
            return [...list_array].sort(this.compareValues('name', 'asc'));
        }

    }

    compareValues(key, order = 'asc') {
        return function innerSort(a, b) {
            if (!a.hasOwnProperty(key) || !b.hasOwnProperty(key)) {
                // property doesn't exist on either object
                return 0;
            }
            const varA = (typeof a[key] === 'string')
                ? a[key].toUpperCase() : a[key];
            const varB = (typeof b[key] === 'string')
                ? b[key].toUpperCase() : b[key];

            let comparison = 0;
            if (varA > varB) {
                comparison = 1;
            } else if (varA < varB) {
                comparison = -1;
            }
            return (
                (order === 'desc') ? (comparison * -1) : comparison
            );
        };
    }
    onPlusClick = (event) => {
        const { workstreamStore } = this.props;
        const wsID = Number(event.target.id);
        // const wsID=111
        let details = false

        workstreamStore.fetchWsGenInfo(wsID)
            .then((res) => {
                if (!res.error && res !== false) {
                    details = res
                } else {
                    details = false
                }

                this.setState({
                    isGeneralInfoOpen: true,
                    selectedWsDetails: details
                })
            })


    }
    onMinusClick = (event) => {
        this.setState({
            isGeneralInfoOpen: false
        })
        this.fetchAllWsDetails();
    }

    handleLinkKpiClose = () => {
        this.setState({
            selectedWorkstreamTab: 'workstreams_tab',
            selectedViewIcon: 'list_view',
            selectedSortByIcon: 'sort_date',
            selectedWDAIcon: 'workstream_list',
            isGeneralInfoOpen: false
        });
    }
    wsListArray = (value) => {
        const { selectedDateMode } = this.state;
        let mode = selectedDateMode;
        if (!value) {
            mode = 'month';
        }
        this.setState({
            showLinkKpi: value,
            selectedDateMode: mode
        })
    }

    render() {

        const { selectedWorkstreamTab, selectedViewIcon, selectedSortByIcon, selectedWDAIcon,
            allWorkstreamsList, allActivitiesList, allDeliverablesList, noWsMsg, showLoadingInd } = this.state

        return (
            <div className="ws-main-container">

                {/* icon-tabs row */}


                {/* selected Workstream Tab and component loading row */}

                <div className="workstream-tabs">
                    {/* {selectedWorkstreamTab && selectedWorkstreamTab === 'workstreams_tab' ? */}

                    {/* <AllWsInfoAndCharts
                        selectedDateMode={this.state.selectedDateMode}
<
                        wsListArray={this.wsListArray}
                    >
                    </AllWsInfoAndCharts> */}
                </div>

            </div>
        )
    }
}

export default withRouter(WorkstreamActualsNavbar);