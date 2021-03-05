import React, { Component, Fragment } from 'react';
import { withRouter } from "react-router-dom";
import { inject } from 'mobx-react';
import ReactTooltip from 'react-tooltip';

import './DefineWorkstreamNavbar.css';
import AddWorkstream from '../WorkstreamComponents/AddWorkstream';
import LinkKpiInvestments from '../WorkstreamComponents/LinkKpiInvestments';
import ViewAllWorkstreams from '../WorkstreamComponents/ViewAllWorkstreams';
import ViewAllActivities from '../WorkstreamComponents/ViewAllActivities';
import ViewAllDeliverables from '../WorkstreamComponents/ViewAllDeliverables';

import plusIcon from '../../assets/project/workstream/add-ws.svg';
import linkKpiIcon from '../../assets/project/workstream/person.svg';
import listIcon from '../../assets/project/workstream/ws-list.svg';
import gridIcon from '../../assets/project/workstream/ws-grid.svg';
import sortAzIcon from '../../assets/project/viewDeals/sort-w-alpha.svg';
import sortDateIcon from '../../assets/project/viewDeals/sort-w-date.svg';
import listWIcon from '../../assets/project/workstream/sort-w.svg';
import listAIcon from '../../assets/project/workstream/sort-a.svg';
import listDIcon from '../../assets/project/workstream/sort-d.svg';
import GeneralInformation from '../WorkstreamComponents/GeneralInformation';

@inject('workstreamStore')
class DefineWorkstreamNavbar extends Component {
    constructor(props) {
        super(props);

        this.handleSelectedTabClick = this.handleSelectedTabClick.bind(this);
        this.fetchAllWsDetails = this.fetchAllWsDetails.bind(this);
        this.sortAndSendArray = this.sortAndSendArray.bind(this);
        this.sortAndAssignState = this.sortAndAssignState.bind(this);
        this.onPlusClick = this.onPlusClick.bind(this);
        this.onMinusClick = this.onMinusClick.bind(this);
        this.handleLinkKpiClose = this.handleLinkKpiClose.bind(this);

        this.state = {
            selectedWorkstreamTab: '',
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
        }
    }

    componentDidMount() {
        // after service call - GET - getAllWSDetails
        this.WsDetailsOnLoad();

    }

    componentWillUnmount() {
        const { workstreamStore } = this.props;
        //this array is used to track new workstream rows created on clicking 'Add workstream'
        workstreamStore.addWorkstreamArray = [];
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
                                selectedWorkstreamTab: 'add_workstream_icon',
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
                            selectedWorkstreamTab = 'add_workstream_icon';
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
            case 'add_workstream_icon':
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

            case 'link_kpi_investments_icon':
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
                if (res !== false && !res.error) {
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
            selectedWorkstreamTab: 'add_workstream_icon',
            selectedViewIcon: 'list_view',
            selectedSortByIcon: 'sort_date',
            selectedWDAIcon: 'workstream_list',
            isGeneralInfoOpen: false
        });
    }

    render() {

        const { selectedWorkstreamTab, selectedViewIcon, selectedSortByIcon, selectedWDAIcon,
            allWorkstreamsList, allActivitiesList, allDeliverablesList, noWsMsg, showLoadingInd } = this.state

        return (
            <div className="ws-main-container">

                {/* icon-tabs row */}
                <div className="icon-container">
                    <div className="dws-icons-tab-row row">
                        <div className="col-sm-6 dws-tabs-wrapper">
                            <ul className="dws-tabs-ul">
                                <li className="dws-tabs-li">
                                    <a className={`dws-nav-link ${selectedWorkstreamTab !== 'link_kpi_investments_icon' ? 'active-class' : ''}`}

                                        id="add_workstream" name="add_workstream"
                                    >
                                        Add Workstream
                                </a>
                                </li>
                                <li className="dws-tabs-li">
                                    <a
                                        id="link_kpi_investments" name="link_kpi_investments"
                                        className={`dws-nav-link  ${allWorkstreamsList.length > 0 ? '' : 'disable-icon'} ${selectedWorkstreamTab === 'link_kpi_investments_icon' ? 'active-class' : ''}`}
                                        onClick={this.state.isGeneralInfoOpen ? () => { } : () => { this.handleSelectedTabClick('link_kpi_investments_icon', 'link_kpi_investments') }}
                                    >
                                        Link KPIs and Investments
                                </a>
                                </li>
                            </ul>

                        </div>





                        <div className="dws-option-icons col-sm-6">
                            <div className="icon-tab-div">
                                <img src={plusIcon} className={`${selectedWorkstreamTab === 'add_workstream_icon' ? 'ws-color-white' : 'ws-color-grey'}`}
                                    data-tip="" data-for="add_ws_tooltip" data-type="dark"
                                    onClick={this.state.isGeneralInfoOpen ? () => { } : () => { this.handleSelectedTabClick('add_workstream_icon', 'add_workstream') }}
                                    id="add_workstream" name="add_workstream"
                                >
                                </img>
                                <ReactTooltip id="add_ws_tooltip">
                                    <span>Add Workstream</span>
                                </ReactTooltip>
                            </div>

                            {/* list view && grid view Icons */}
                            <div className="icon-tab-div">
                                {selectedViewIcon === 'list_view' ?
                                    <span className="">

                                        <img src={listIcon} alt="listView"
                                            id="list_view" name="list_view"
                                            data-type="dark" data-tip="" data-for="list_tooltip"
                                            onClick={(this.state.isGeneralInfoOpen || allWorkstreamsList.length === 0) ? () => { } : () => { this.handleSelectedTabClick('list_grid_icon', 'grid_view') }}
                                            className={`${allWorkstreamsList.length > 0 ? '' : 'disable-icon'} ${selectedWorkstreamTab === 'list_grid_icon' ? 'ws-color-white' : 'ws-color-grey'}`}
                                        />
                                        <ReactTooltip id="list_tooltip">
                                            <span>List View</span>
                                        </ReactTooltip>

                                    </span>
                                    :
                                    <span className="">

                                        <img id="grid_view" name="grid_view" src={gridIcon} alt="gridView"
                                            data-type="dark" data-tip="" data-for="grid_tooltip"
                                            onClick={(this.state.isGeneralInfoOpen || allWorkstreamsList.length === 0) ? () => { } : () => { this.handleSelectedTabClick('list_grid_icon', 'list_view') }}
                                            className={`${allWorkstreamsList.length > 0 ? '' : 'disable-icon'} ${selectedWorkstreamTab === 'list_grid_icon' ? 'ws-color-white' : 'ws-color-grey'}`}
                                        />
                                        <ReactTooltip id="grid_tooltip">
                                            <span>Grid View</span>
                                        </ReactTooltip>
                                    </span>
                                }
                            </div>



                            {/* WDA views Icons */}
                            <div className="icon-tab-div">
                                {selectedWDAIcon === 'workstream_list' ?
                                    <span className="">

                                        <img id="workstream_list" name="workstream_list" src={listWIcon} alt="workstreamList"
                                            data-type="dark" data-tip="" data-for="sort_w_tooltip" data-place="left"
                                            onClick={(this.state.isGeneralInfoOpen || allWorkstreamsList.length === 0) ? "" : () => { this.handleSelectedTabClick('display_WDA_icon', 'activity_list') }}
                                            className={`${allWorkstreamsList.length > 0 ? '' : 'disable-icon'} ${selectedWorkstreamTab === 'display_WDA_icon' ? 'ws-color-white' : 'ws-color-grey'}`}
                                        />
                                        <ReactTooltip id="sort_w_tooltip">
                                            <span>Sort Workstream Wise</span>
                                        </ReactTooltip>


                                    </span>
                                    : selectedWDAIcon === 'activity_list' ?
                                        <span className="">

                                            <img id="activity_list" name="activity_list" src={listAIcon} alt="activityList"
                                                data-type="dark" data-tip="" data-for="sort_a_tooltip" data-place="left"
                                                onClick={(this.state.isGeneralInfoOpen || allWorkstreamsList.length === 0) ? "" : () => { this.handleSelectedTabClick('display_WDA_icon', 'deliverable_list') }}
                                                className={`${allWorkstreamsList.length > 0 ? '' : 'disable-icon'} ${selectedWorkstreamTab === 'display_WDA_icon' ? 'ws-color-white' : 'ws-color-grey'}`}
                                            />
                                            <ReactTooltip id="sort_a_tooltip">
                                                <span>Sort Activity Wise</span>
                                            </ReactTooltip>

                                        </span>
                                        :
                                        <span className="">

                                            <img id="deliverable_list" name="deliverable_list" src={listDIcon} alt="deliverableList"
                                                data-type="dark" data-tip="" data-for="sort_d_tooltip" data-place="left"
                                                onClick={(this.state.isGeneralInfoOpen || allWorkstreamsList.length === 0) ? "" : () => { this.handleSelectedTabClick('display_WDA_icon', 'workstream_list') }}
                                                className={`${allWorkstreamsList.length > 0 ? '' : 'disable-icon'} ${selectedWorkstreamTab === 'display_WDA_icon' ? 'ws-color-white' : 'ws-color-grey'}`}
                                            />
                                            <ReactTooltip id="sort_d_tooltip">
                                                <span>Sort Deliverable Wise</span>
                                            </ReactTooltip>

                                        </span>
                                }
                            </div>

                            {/* sort by letter && sort by date Icons */}
                            <div className="icon-tab-div last-ws-icon">
                                {selectedSortByIcon === 'sort_az' ?
                                    <span className="">

                                        <img id="sort_az" name="sort_az" src={sortAzIcon} alt="sortAZ"
                                            data-type="dark" data-tip="" data-for="sort_az_tooltip" data-place="left"
                                            onClick={(this.state.isGeneralInfoOpen || allWorkstreamsList.length === 0) ? "" : () => { this.handleSelectedTabClick('sort_by_icon', 'sort_date') }}
                                            className={`${allWorkstreamsList.length > 0 ? '' : 'disable-icon'} ${selectedWorkstreamTab === 'sort_by_icon' ? 'ws-color-white' : 'ws-color-grey'}`}
                                        />
                                        <ReactTooltip id="sort_az_tooltip">
                                            <span>Sort Alphabetically</span>
                                        </ReactTooltip>

                                    </span>
                                    :
                                    <span className="">

                                        <img id="sort_date" name="sort_date" src={sortDateIcon} alt="sortDateWise"
                                            data-type="dark" data-tip="" data-for="sort_date_tooltip" data-place="left"
                                            style={{ width: '34px', height: '34px' }}
                                            onClick={(this.state.isGeneralInfoOpen || allWorkstreamsList.length === 0) ? "" : () => { this.handleSelectedTabClick('sort_by_icon', 'sort_az') }}
                                            className={`${allWorkstreamsList.length > 0 ? '' : 'disable-icon'} ${selectedWorkstreamTab === 'sort_by_icon' ? 'ws-color-white' : 'ws-color-grey'}`}
                                        />
                                        <ReactTooltip id="sort_date_tooltip">
                                            <span>Sort by Timestamp</span>
                                        </ReactTooltip>

                                    </span>
                                }
                            </div>

                        </div>


                    </div>
                </div>

                {/* selected Workstream Tab and component loading row */}

                <div className="workstream-tabs">
                    {selectedWorkstreamTab && selectedWorkstreamTab === 'add_workstream_icon' ?
                        (this.state.isGeneralInfoOpen ?
                            <GeneralInformation
                                onMinusClick={this.onMinusClick}
                                selectedWsDetails={this.state.selectedWsDetails} /> :
                            <Fragment>
                                <AddWorkstream
                                    addWorkstreamArray={this.state.addWorkstreamArray}
                                    fetchAllWsDetails={this.fetchAllWsDetails}
                                ></AddWorkstream>
                                <ViewAllWorkstreams
                                    selectedViewIcon={selectedViewIcon}
                                    allWorkstreamsList={allWorkstreamsList}
                                    fetchAllWsDetails={this.fetchAllWsDetails}
                                    onPlusClick={this.onPlusClick}
                                ></ViewAllWorkstreams>
                            </Fragment>)
                        : ''
                    }
                    {selectedWorkstreamTab && selectedWorkstreamTab === 'link_kpi_investments_icon' ?
                        <LinkKpiInvestments closeLinkKpiView={this.handleLinkKpiClose}></LinkKpiInvestments>
                        : ''
                    }


                    {selectedWorkstreamTab && (selectedWorkstreamTab === 'display_WDA_icon' ||
                        selectedWorkstreamTab === 'list_grid_icon' ||
                        selectedWorkstreamTab === 'sort_by_icon') ?
                        (this.state.isGeneralInfoOpen ?
                            <GeneralInformation
                                onMinusClick={this.onMinusClick}
                                selectedWsDetails={this.state.selectedWsDetails} /> :
                            (selectedWDAIcon === 'workstream_list' ?
                                <ViewAllWorkstreams
                                    selectedViewIcon={selectedViewIcon}
                                    allWorkstreamsList={allWorkstreamsList}
                                    fetchAllWsDetails={this.fetchAllWsDetails}
                                    onPlusClick={this.onPlusClick}
                                ></ViewAllWorkstreams>
                                : selectedWDAIcon === 'activity_list' ?
                                    <ViewAllActivities
                                        selectedViewIcon={selectedViewIcon}
                                        allActivitiesList={allActivitiesList}
                                        fetchAllWsDetails={this.fetchAllWsDetails}
                                        onPlusClick={this.onPlusClick}></ViewAllActivities>
                                    : selectedWDAIcon === 'deliverable_list' ?
                                        <ViewAllDeliverables
                                            selectedViewIcon={selectedViewIcon}
                                            allDeliverablesList={allDeliverablesList}
                                            fetchAllWsDetails={this.fetchAllWsDetails}
                                            onPlusClick={this.onPlusClick}></ViewAllDeliverables>
                                        : ''))
                        : ''
                    }
                </div>
                {showLoadingInd ?
                    <div className="ws-spinner-div">
                        <i className="fa fa-spinner fa-spin" style={{ height: "min-content", fontSize: '36px', color: '#ffffff' }}></i>
                    </div>
                    : noWsMsg ?
                        <div className="no-ws-msg row">No Workstream</div>
                        : ''

                }
            </div>
        )
    }
}

export default withRouter(DefineWorkstreamNavbar);