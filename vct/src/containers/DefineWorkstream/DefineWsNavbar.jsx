import React, { Component } from 'react';
import { withRouter } from "react-router-dom";
import { inject } from 'mobx-react';
import ReactTooltip from 'react-tooltip';
import Menu, { SubMenu, MenuItem } from 'rc-menu';
import 'rc-menu/assets/index.css';

import './DefineWs.css';
import AllWsInfoAndCharts from '../DefineWorkstream/AllWsInfoAndCharts';
import GroupByWsChart from '../DefineWorkstream/GroupByWsChart';
import DefineWsFilterView from '../DefineWsViews/DefineWsFilterView';
import DefineWsSortView from '../DefineWsViews/DefineWsSortView';
import LinkedKpiCostCatModalHome from '../DefineWorkstreamModals/LinkedKpiCostCatHome/LinkedKpiCostCatHomeModal';
import exportIco from '../../assets/project_DWS/exportIcon.svg';
import showHideIco from '../../assets/project_DWS/eyeIcon.svg';
import groupByIco from '../../assets/project_DWS/groupByIcon.svg';
import dateSortYearIcon from '../../assets/project_DWS/date-sort-year.svg';
import dateSortMonthIcon from '../../assets/project_DWS/date-sort-month.svg';
import dateSortDayIcon from '../../assets/project_DWS/date-sort-day.svg';
import eraseIcon from '../../assets/project_DWS/eraserIcon.svg';
import filterIcon from '../../assets/project_DWS/filterIcon.svg';
import sortIcon from '../../assets/project_DWS/sortIcon.svg';
import radioSelected from '../../assets/project_DWS/radio-selected-1.svg'
import radioNotSelected from '../../assets/project_DWS/radio-not-selected-1.svg';

@inject('workstreamStore')
class DefineWorkstreamNavbar extends Component {
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

            // open filter state variables
            openFilterMenu: false, // used for show/hide of filter menu
            selectedFilterType: '', // used for sending filter type to child
            selectedFilterKeys: [], // used for holding the selected keys of filter

            // show/hide connectors state variables
            hideConnectors: false,

            selectedViewIcon: 'list_view',
            selectedSortByIcon: 'sort_date',
            selectedWDAIcon: 'workstream_list',
            selectedSortBy: false,
            selectedSortKeys: [],
            allWorkstreamsList: [],
            allActivitiesList: [],
            allDeliverablesList: [],
            addWorkstreamArray: [],
            isGeneralInfoOpen: false,
            selectedWsDetails: false,
            showLoadingInd: true,
            noWsMsg: false,
            showLinkKpi: false,
            isGroupBySelected: false,
            groupBykeyPath: [],
            selectedKeys: []
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
                if (response && !response.error && response.data) {
                    if (response.data.resultCode === "OK") {
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
                    }
                }
            });
    }

    fetchAllWsDetails() {
        const { workstreamStore } = this.props;
        workstreamStore.getAllWsDetails()
            .then((response) => {
                if (response && !response.error && response.data) {
                    if (response.data.resultCode === "OK") {
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
            case 'filter_tab':
                if (workstreamStore.allWorkstreamsStartDate && workstreamStore.allWorkstreamsStartDate !== '') {
                    this.setState({
                        selectedWorkstreamTab: tabCategory,
                        openFilterMenu: selected_icon_name,
                        //selectedSortBy: false,
                    }, () => {
                        document.addEventListener('click', this.closeAllFilters);
                    });
                }

                break;
            case 'connectors_tab':
                if (workstreamStore.allWorkstreamsStartDate && workstreamStore.allWorkstreamsStartDate !== '') {
                    this.setState({
                        selectedWorkstreamTab: 'workstreams_tab',
                        hideConnectors: !selected_icon_name,
                        //selectedSortBy: false,
                    }, () => {
                        // document.addEventListener('click', this.closeAllFilters);
                    });
                }
                break;
            case 'export_tab':

                break;
            case 'clear_all':
                this.setState({
                    selectedWorkstreamTab: 'workstreams_tab',
                    hideConnectors: false,  // un comment this for showing connectors
                    selectedSortKeys: [],
                    selectedSortBy: false,
                    sortType: '',
                    sortBy: '',
                    // selectedDateMode: 'month',
                    selectedFilterType: '',
                    selectedFilterKeys: [],
                    groupBykeyPath: [],
                    selectedKeys: [],
                });
                break;

            case 'sort_tab':
                if (workstreamStore.allWorkstreamsStartDate && workstreamStore.allWorkstreamsStartDate !== '') {
                    this.setState({
                        selectedSortBy: true,
                        //openFilterMenu : false,
                    }, () => {
                        document.addEventListener('click', this.closeAllFilters)
                    });
                }
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
            case 'ws_groupBy':

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
                if (res.error) {
                    return {
                        error: true
                    }
                } else {
                    if (res !== false) {
                        details = res
                    } else {
                        details = false
                    }

                    this.setState({
                        isGeneralInfoOpen: true,
                        selectedWsDetails: details
                    })
                }
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
    /* groupBy */
    handleGroupBy = () => {
        const { workstreamStore } = this.props;
        if (workstreamStore.allWorkstreamsStartDate && workstreamStore.allWorkstreamsStartDate !== '') {
            this.setState({
                isGroupByOpen: true
            }, () => {
                document.addEventListener('click', this.closeAllFilters);
            })
        }
    }

    handleInnerMenu = (event) => {
        this.setState({
            selectedKeys: event.selectedKeys,
            selectedFilterKeys: [],
            selectedFilterType: '',
            selectedSortKeys: [],
            sortBy: ''
        });
    }

    handleGropBySubMenu = (event) => {
        const setkeyPath = event.keyPath[0].split("-")
        this.setState({
            hideConnectors: true,  // un comment this to not show connectors on load
            isGroupByOpen: false,
            isGroupBySelected: true,
            groupBykeyPath: setkeyPath,
            sortBy: ''
        });
    }

    handleSortInnerMenu = (event) => {
        this.setState({
            hideConnectors: true,  // un comment this to not show connectors on load
            selectedFilterKeys: [],
            selectedFilterType: '',
            groupBykeyPath: [],
            selectedSortKeys: [event.key],
            selectedKeys: []
        });
    }

    handleSubMenu = (event) => {
        const { selectedSortKeys } = this.state;
        this.setState({
            selectedSortKeys: selectedSortKeys,
            sortType: event.keyPath[0].split('-')[1],
            sortBy: event.keyPath[1],
            selectedSortBy: false
        })
    }

    onSelectFilter = (info) => {
        this.setState({
            selectedFilterType: info.selectedKeys[0],
            selectedFilterKeys: info.selectedKeys,
            openFilterMenu: false,
            hideConnectors: true, // un comment this to not show connectors on load
            selectedSortKeys: [],
            groupBykeyPath: [],
            selectedKeys: [],
            sortBy: ''
        })
    }

    closeAllFilters = (event) => {
        this.setState({
            selectedSortBy: false,
            sortType: '',
            // sortBy: '',
            openFilterMenu: false,
            isGroupByOpen: false,
            selectedWorkstreamTab: 'workstreams_tab'
        }, () => {
            document.removeEventListener('click', this.closeAllFilters);
        })
    }

    onClickFilter = (info) => {
    }

    onDeselectFilter = (info) => {
    }

    onOpenChangeFilter = (openKeys) => {
    }

    render() {

        const { selectedWorkstreamTab, selectedFilterType, selectedFilterKeys, openFilterMenu, isGroupByOpen, groupBykeyPath, selectedSortBy, selectedSortKeys } = this.state

        const { workstreamStore } = this.props;

        return (
            <div className="ws-main-container">

                {/* icon-tabs row */}
                <div className="icon-container">
                    <div className="dws-icons-tab-row row">
                        <div className="col-sm-6 dws-tabs-wrapper">
                            <ul className="dws-tabs-ul">
                                <li className="dws-tabs-li">
                                    <a className={`dws-nav-link ${selectedWorkstreamTab !== 'link_kpi_investments_tab' ? 'active-class' : 'showLinkKpi'}`}

                                        id="add_workstream" name="add_workstream"
                                    >
                                        Workstreams
                                </a>
                                </li>
                                <li className="dws-tabs-li">
                                    <a
                                        id="link_kpi_investments" name="link_kpi_investments"
                                        className={`dws-nav-link  ${this.state.showLinkKpi ? '' : 'disable-icon showLinkKpi'} ${selectedWorkstreamTab === 'link_kpi_investments_tab' ? 'active-class' : 'showLinkKpi'}`}
                                        onClick={() => { this.handleSelectedTabClick('link_kpi_investments_tab', 'link_kpi_investments') }}
                                    >
                                        Link KPIs and Investments
                                </a>
                                </li>
                            </ul>

                        </div>
                        <div className="dws-option-icons col-sm-6">
                            <div className="icon-tab-div">
                                <img src={exportIco} alt=""
                                    className={`${(workstreamStore.allWorkstreamsStartDate && workstreamStore.allWorkstreamsStartDate !== '') ? 'ws-color-grey' : 'ws-icon-disabled'}`}
                                    data-tip="" data-for="export_ws_tooltip" data-type="dark"
                                    onClick={this.state.isGeneralInfoOpen ? () => { } : () => { this.handleSelectedTabClick('export_tab', 'add_workstream') }}
                                    id="export_gantt" name="export_gantt"
                                />
                                <ReactTooltip id="export_ws_tooltip">
                                    <span>Export Gantt chart - Coming soon.. </span>
                                </ReactTooltip>
                            </div>
                            <div className="icon-tab-div">
                                <img src={showHideIco} alt=""
                                    className={`${(this.state.hideConnectors) ? 'ws-color-white' : (workstreamStore.allWorkstreamsStartDate && workstreamStore.allWorkstreamsStartDate !== '') ? 'ws-color-grey' : 'ws-icon-disabled'}`}
                                    data-tip="" data-for="hide_ws_tooltip" data-type="dark"
                                    onClick={this.state.showLinkKpi ? () => { this.handleSelectedTabClick('connectors_tab', this.state.hideConnectors) } : () => { }}
                                    id="connectors_hide_show" name="connectors_hide_show"
                                />
                                <ReactTooltip id="hide_ws_tooltip">
                                    <span>Hide/Show connectors</span>
                                </ReactTooltip>
                            </div>

                            <div className="icon-tab-div">
                                <div className="enclose-menu-div">
                                    <img src={groupByIco} alt=""
                                        className={`${(isGroupByOpen || groupBykeyPath.length !== 0) ? 'ws-color-white' : (workstreamStore.allWorkstreamsStartDate && workstreamStore.allWorkstreamsStartDate !== '') ? 'ws-color-grey' : 'ws-icon-disabled'}`}
                                        data-tip="" data-for="group_ws_tooltip" data-type="dark"
                                        onClick={this.handleGroupBy}
                                        id="group_by_dws" name="group_by_dws"
                                    />
                                    <ReactTooltip id="group_ws_tooltip">
                                        <span>Group By</span>
                                    </ReactTooltip>
                                    {
                                        isGroupByOpen ?
                                            <Menu
                                                className="groupBy-menu"
                                                selectedKeys={this.state.selectedKeys}
                                                onSelect={this.handleInnerMenu}
                                            >
                                                <SubMenu
                                                    onClick={this.handleGropBySubMenu}
                                                    style={{ background: "#505050" }}
                                                    //    popupOffset={[15, 0]}
                                                    title={<div className="main-menu">Department<span>
                                                        {(this.state.selectedKeys && this.state.selectedKeys.length > 0 && this.state.selectedKeys[0].split('-')[0] === "Department") ? <img className="radio-img radio-select" alt="radio" src={radioSelected}></img> :
                                                            <img className="radio-img radio-not-select" alt="radio" src={radioNotSelected}></img>}
                                                    </span></div>} key="Department">
                                                    <MenuItem
                                                        onClick={this.handleInnerMenu}
                                                        key="Department-Workstream"
                                                    ><div className="sub-menu">Workstream<span>
                                                        {(this.state.selectedKeys && this.state.selectedKeys[0] === "Department-Workstream") ? <img className="radio-img radio-select" alt="radio" src={radioSelected}></img> :
                                                            <img className="radio-img radio-not-select" alt="radio" src={radioNotSelected}></img>}
                                                    </span></div></MenuItem>
                                                    <MenuItem
                                                        key="Department-Activity"
                                                        onClick={this.handleInnerMenu}
                                                    ><div className="sub-menu">Activity<span>
                                                        {(this.state.selectedKeys && this.state.selectedKeys[0] === "Department-Activity") ? <img className="radio-img radio-select" alt="radio" src={radioSelected}></img> :
                                                            <img className="radio-img radio-not-select" alt="radio" src={radioNotSelected}></img>}
                                                    </span></div></MenuItem>
                                                    <MenuItem
                                                        key="Department-Deliverable"
                                                        onClick={this.handleInnerMenu}
                                                    ><div className="sub-menu">Deliverable<span>
                                                        {(this.state.selectedKeys && this.state.selectedKeys[0] === "Department-Deliverable") ? <img className="radio-img radio-select" alt="radio" src={radioSelected}></img> :
                                                            <img className="radio-img radio-not-select" alt="radio" src={radioNotSelected}></img>}
                                                    </span></div></MenuItem>
                                                    <MenuItem
                                                        key="Department-Milestone"
                                                        onClick={this.handleInnerMenu}
                                                    ><div className="sub-menu">Milestone<span>
                                                        {(this.state.selectedKeys && this.state.selectedKeys[0] === "Department-Milestone") ? <img className="radio-img radio-select" alt="radio" src={radioSelected}></img> :
                                                            <img className="radio-img radio-not-select" alt="radio" src={radioNotSelected}></img>}
                                                    </span></div></MenuItem>
                                                </SubMenu>
                                                <SubMenu
                                                    onClick={this.handleGropBySubMenu}
                                                    title={<div className="main-menu">Owner
                                   {(this.state.selectedKeys && this.state.selectedKeys.length > 0 && this.state.selectedKeys[0].split('-')[0] === "Owner") ? <img className="radio-img radio-select" alt="radio" src={radioSelected}></img> :
                                                            <img className="radio-img radio-not-select" alt="radio" src={radioNotSelected}></img>}</div>} key="Owner">
                                                    <MenuItem
                                                        onClick={this.handleInnerMenu}
                                                        key="Owner-Workstream"
                                                    ><div className="sub-menu">Workstream<span>
                                                        {(this.state.selectedKeys && this.state.selectedKeys[0] === "Owner-Workstream") ? <img className="radio-img radio-select" alt="radio" src={radioSelected}></img> :
                                                            <img className="radio-img radio-not-select" alt="radio" src={radioNotSelected}></img>}
                                                    </span></div></MenuItem>
                                                    <MenuItem
                                                        key="Owner-Activity"
                                                        onClick={this.handleInnerMenu}
                                                    ><div className="sub-menu">Activity<span>
                                                        {(this.state.selectedKeys && this.state.selectedKeys[0] === "Owner-Activity") ? <img className="radio-img radio-select" alt="radio" src={radioSelected}></img> :
                                                            <img className="radio-img radio-not-select" alt="radio" src={radioNotSelected}></img>}
                                                    </span></div></MenuItem>
                                                    <MenuItem
                                                        key="Owner-Deliverable"
                                                        onClick={this.handleInnerMenu}
                                                    ><div className="sub-menu">Deliverable<span>
                                                        {(this.state.selectedKeys && this.state.selectedKeys[0] === "Owner-Deliverable") ? <img className="radio-img radio-select" alt="radio" src={radioSelected}></img> :
                                                            <img className="radio-img radio-not-select" alt="radio" src={radioNotSelected}></img>}
                                                    </span></div></MenuItem>
                                                    <MenuItem
                                                        key="Owner-Milestone"
                                                        onClick={this.handleInnerMenu}
                                                    ><div className="sub-menu">Milestone<span>
                                                        {(this.state.selectedKeys && this.state.selectedKeys[0] === "Owner-Milestone") ? <img className="radio-img radio-select" alt="radio" src={radioSelected}></img> :
                                                            <img className="radio-img radio-not-select" alt="radio" src={radioNotSelected}></img>}
                                                    </span></div></MenuItem></SubMenu>
                                            </Menu> : ""
                                    }
                                </div>
                            </div>
                            <div className="icon-tab-div">
                                <div className="enclose-menu-div">
                                    <img src={filterIcon} alt=""
                                        className={`${(openFilterMenu || selectedFilterKeys.length !== 0) ? 'ws-color-white' : (workstreamStore.allWorkstreamsStartDate && workstreamStore.allWorkstreamsStartDate !== '') ? 'ws-color-grey' : 'ws-icon-disabled'}`}
                                        data-tip="" data-for="filter_ws_tooltip" data-type="dark"
                                        onClick={this.state.showLinkKpi ? () => { this.handleSelectedTabClick('filter_tab', true) } : () => { }}
                                        id="filter_icon" name="filter"
                                    />
                                    <ReactTooltip id="filter_ws_tooltip">
                                        <span>Filter</span>
                                    </ReactTooltip>
                                    {openFilterMenu ?

                                        <Menu className="filter-menu filterby-menu"
                                            onSelect={this.onSelectFilter}
                                            onClick={this.onClickFilter}
                                            onDeselect={this.onDeselectFilter}
                                            onOpenChange={this.onOpenChangeFilter}
                                            // openKeys={[]}
                                            selectedKeys={this.state.selectedFilterKeys}
                                        >
                                            <MenuItem key={`ws-filter`}><div className="main-menu">Workstream<span>
                                                {(selectedFilterKeys && selectedFilterKeys[0] === "ws-filter") ? <img className="radio-img radio-select" alt="radio" src={radioSelected}></img> :
                                                    <img className="radio-img radio-not-select" alt="radio" src={radioNotSelected}></img>}
                                            </span></div></MenuItem>
                                            <MenuItem key={`act-filter`}><div className="main-menu">Activity<span>
                                                {(selectedFilterKeys && selectedFilterKeys[0] === "act-filter") ? <img className="radio-img radio-select" alt="radio" src={radioSelected}></img> :
                                                    <img className="radio-img radio-not-select" alt="radio" src={radioNotSelected}></img>}
                                            </span></div></MenuItem>
                                            <MenuItem key={`del-filter`}><div className="main-menu">Deliverable<span>
                                                {(selectedFilterKeys && selectedFilterKeys[0] === "del-filter") ? <img className="radio-img radio-select" alt="radio" src={radioSelected}></img> :
                                                    <img className="radio-img radio-not-select" alt="radio" src={radioNotSelected}></img>}
                                            </span></div></MenuItem>
                                            <MenuItem key={`mile-filter`}><div className="main-menu">Milestone<span>
                                                {(selectedFilterKeys && selectedFilterKeys[0] === "mile-filter") ? <img className="radio-img radio-select" alt="radio" src={radioSelected}></img> :
                                                    <img className="radio-img radio-not-select" alt="radio" src={radioNotSelected}></img>}
                                            </span></div></MenuItem>

                                        </Menu>

                                        : ''
                                    }
                                </div>



                            </div>

                            <div className="icon-tab-div">
                                <div className="enclose-menu-div">
                                    <img src={sortIcon} alt=""
                                        className={`${selectedSortBy || selectedSortKeys.length !== 0 ? 'ws-color-white' : (workstreamStore.allWorkstreamsStartDate && workstreamStore.allWorkstreamsStartDate !== '') ? 'ws-color-grey' : 'ws-icon-disabled'}`}
                                        data-tip="" data-for="sort_ws_tooltip" data-type="dark"
                                        onClick={this.state.showLinkKpi ? () => this.handleSelectedTabClick('sort_tab', true) : () => { }}
                                        id="sort_workstream" name="add_workstream"
                                    />
                                    <ReactTooltip id="sort_ws_tooltip">
                                        <span>Sort </span>
                                    </ReactTooltip>

                                    {selectedSortBy ?
                                        <Menu
                                            direction='rtl'
                                            /*mode ='vertical-left'*/
                                            className="filter-menu sortby-menu"
                                            selectedKeys={selectedSortKeys}
                                            onSelect={this.handleSortInnerMenu}
                                        //    onOpenChange={this.handleSubMenu} 
                                        //    onClick={this.handleSortInnerMenu}
                                        >
                                            <SubMenu
                                                onClick={this.handleSubMenu}
                                                onOpenChange={this.handleSubMenu}
                                                title={<div className="main-menu"><span style={{ marginLeft: "12px" }}> Alphabetically (A-Z) </span>
                                                    {(this.state.sortBy && this.state.sortBy === "alphaAZ") ? <img className="radio-img radio-select" alt="radio" src={radioSelected}></img> :
                                                        <img className="radio-img radio-not-select" alt="radio" src={radioNotSelected}></img>}</div>} key="alphaAZ">
                                                <MenuItem
                                                    onClick={this.handleSortInnerMenu}
                                                    key="AZ-Workstream"
                                                ><div className="sub-menu">Workstream<span>
                                                    {(this.state.selectedSortKeys && this.state.selectedSortKeys[0] === "AZ-Workstream") ? <img className="radio-img radio-select" alt="radio" src={radioSelected}></img> :
                                                        <img className="radio-img radio-not-select" alt="radio" src={radioNotSelected}></img>}
                                                </span></div>
                                                </MenuItem>
                                                <MenuItem
                                                    onClick={this.handleSortInnerMenu} key="AZ-Activity"
                                                ><div className="sub-menu">Activity<span>
                                                    {(this.state.selectedSortKeys && this.state.selectedSortKeys[0] === "AZ-Activity") ? <img className="radio-img radio-select" alt="radio" src={radioSelected}></img> :
                                                        <img className="radio-img radio-not-select" alt="radio" src={radioNotSelected}></img>}
                                                </span></div></MenuItem>
                                                <MenuItem
                                                    onClick={this.handleSortInnerMenu} key="AZ-Deliverable"
                                                ><div className="sub-menu">Deliverable<span>
                                                    {(this.state.selectedSortKeys && this.state.selectedSortKeys[0] === "AZ-Deliverable") ? <img className="radio-img radio-select" alt="radio" src={radioSelected}></img> :
                                                        <img className="radio-img radio-not-select" alt="radio" src={radioNotSelected}></img>}
                                                </span></div></MenuItem>
                                            </SubMenu>
                                            <SubMenu
                                                onClick={this.handleSubMenu}
                                                onOpenChange={this.handleSubMenu}
                                                //    onMouseEnter={this.handleSubMenu}
                                                title={<div className="main-menu"><span style={{ marginLeft: "12px" }}> Alphabetically (Z-A) </span>
                                                    {(this.state.sortBy && this.state.sortBy === "alphaZA") ? <img className="radio-img radio-select" alt="radio" src={radioSelected}></img> :
                                                        <img className="radio-img radio-not-select" alt="radio" src={radioNotSelected}></img>}</div>} key="alphaZA">
                                                <MenuItem
                                                    onClick={this.handleSortInnerMenu} key="ZA-Workstream"
                                                ><div className="sub-menu">Workstream<span>
                                                    {(this.state.selectedSortKeys && this.state.selectedSortKeys[0] === "ZA-Workstream") ? <img className="radio-img radio-select" alt="radio" src={radioSelected}></img> :
                                                        <img className="radio-img radio-not-select" alt="radio" src={radioNotSelected}></img>}
                                                </span></div></MenuItem>
                                                <MenuItem
                                                    onClick={this.handleSortInnerMenu} key="ZA-Activity"
                                                ><div className="sub-menu">Activity<span>
                                                    {(this.state.selectedSortKeys && this.state.selectedSortKeys[0] === "ZA-Activity") ? <img className="radio-img radio-select" alt="radio" src={radioSelected}></img> :
                                                        <img className="radio-img radio-not-select" alt="radio" src={radioNotSelected}></img>}
                                                </span></div></MenuItem>
                                                <MenuItem
                                                    onClick={this.handleSortInnerMenu} key="ZA-Deliverable"
                                                ><div className="sub-menu">Deliverable<span>
                                                    {(this.state.selectedSortKeys && this.state.selectedSortKeys[0] === "ZA-Deliverable") ? <img className="radio-img radio-select" alt="radio" src={radioSelected}></img> :
                                                        <img className="radio-img radio-not-select" alt="radio" src={radioNotSelected}></img>}
                                                </span></div></MenuItem>
                                            </SubMenu>
                                            <SubMenu
                                                onClick={this.handleSubMenu}
                                                onOpenChange={this.handleSubMenu}
                                                //    onMouseEnter={this.handleSubMenu}
                                                title={<div className="main-menu"><span style={{ marginLeft: "12px" }}> Chronologically (F-L) </span>
                                                    {(this.state.sortBy && this.state.sortBy === "chronoFL_DWS") ? <img className="radio-img radio-select" alt="radio" src={radioSelected}></img> :
                                                        <img className="radio-img radio-not-select" alt="radio" src={radioNotSelected}></img>}</div>}
                                                key="chronoFL_DWS">
                                                <MenuItem
                                                    onClick={this.handleSortInnerMenu} key="FL-Workstream"
                                                ><div className="sub-menu">Workstream<span>
                                                    {(this.state.selectedSortKeys && this.state.selectedSortKeys[0] === "FL-Workstream") ? <img className="radio-img radio-select" alt="radio" src={radioSelected}></img> :
                                                        <img className="radio-img radio-not-select" alt="radio" src={radioNotSelected}></img>}
                                                </span></div></MenuItem>
                                                <MenuItem
                                                    onClick={this.handleSortInnerMenu} key="FL-Activity"
                                                ><div className="sub-menu">Activity<span>
                                                    {(this.state.selectedSortKeys && this.state.selectedSortKeys[0] === "FL-Activity") ? <img className="radio-img radio-select" alt="radio" src={radioSelected}></img> :
                                                        <img className="radio-img radio-not-select" alt="radio" src={radioNotSelected}></img>}
                                                </span></div></MenuItem>
                                                <MenuItem
                                                    onClick={this.handleSortInnerMenu} key="FL-Deliverable"
                                                ><div className="sub-menu">Deliverable<span>
                                                    {(this.state.selectedSortKeys && this.state.selectedSortKeys[0] === "FL-Deliverable") ? <img className="radio-img radio-select" alt="radio" src={radioSelected}></img> :
                                                        <img className="radio-img radio-not-select" alt="radio" src={radioNotSelected}></img>}
                                                </span></div></MenuItem>
                                            </SubMenu>
                                            <SubMenu
                                                onClick={this.handleSubMenu}
                                                onOpenChange={this.handleSubMenu}
                                                title={<div className="main-menu"><span style={{ marginLeft: "12px" }}> Chronologically (L-F) </span>
                                                    {(this.state.sortBy && this.state.sortBy === "chronoLF_DWS") ? <img className="radio-img radio-select" alt="radio" src={radioSelected}></img> :
                                                        <img className="radio-img radio-not-select" alt="radio" src={radioNotSelected}></img>}</div>}
                                                key="chronoLF_DWS">
                                                <MenuItem
                                                    onClick={this.handleSortInnerMenu} key="LF-Workstream"
                                                ><div className="sub-menu">Workstream<span>
                                                    {(this.state.selectedSortKeys && this.state.selectedSortKeys[0] === "LF-Workstream") ? <img className="radio-img radio-select" alt="radio" src={radioSelected}></img> :
                                                        <img className="radio-img radio-not-select" alt="radio" src={radioNotSelected}></img>}
                                                </span></div></MenuItem>
                                                <MenuItem
                                                    onClick={this.handleSortInnerMenu} key="LF-Activity"
                                                ><div className="sub-menu">Activity<span>
                                                    {(this.state.selectedSortKeys && this.state.selectedSortKeys[0] === "LF-Activity") ? <img className="radio-img radio-select" alt="radio" src={radioSelected}></img> :
                                                        <img className="radio-img radio-not-select" alt="radio" src={radioNotSelected}></img>}
                                                </span></div></MenuItem>
                                                <MenuItem
                                                    onClick={this.handleSortInnerMenu} key="LF-Deliverable"
                                                ><div className="sub-menu">Deliverable<span>
                                                    {(this.state.selectedSortKeys && this.state.selectedSortKeys[0] === "LF-Deliverable") ? <img className="radio-img radio-select" alt="radio" src={radioSelected}></img> :
                                                        <img className="radio-img radio-not-select" alt="radio" src={radioNotSelected}></img>}
                                                </span></div></MenuItem>
                                            </SubMenu>
                                        </Menu> : ""
                                    }
                                </div>
                            </div>

                            <div className="icon-tab-div">
                                <img src={eraseIcon} alt=""
                                    className={`${((selectedFilterKeys && selectedFilterKeys.length !== 0) || (selectedSortKeys && selectedSortKeys.length !== 0) || (groupBykeyPath && groupBykeyPath.length !== 0)) ? 'ws-color-white' : (workstreamStore.allWorkstreamsStartDate && workstreamStore.allWorkstreamsStartDate !== '') ? 'ws-color-grey' : 'ws-icon-disabled'}`}
                                    data-tip="" data-for="clear_ws_tooltip" data-type="dark" data-place="left"
                                    onClick={() => { this.handleSelectedTabClick('clear_all', 'add_workstream') }}
                                    id="clear_all" name="clear_all"
                                />
                                <ReactTooltip id="clear_ws_tooltip">
                                    <span>Clear all selections</span>
                                </ReactTooltip>
                            </div>


                            <div className="icon-tab-div">
                                {this.state.selectedDateMode === 'year' ?
                                    <img src={dateSortYearIcon} alt=""
                                        className={`${(this.state.selectedDateMode === 'year') && (workstreamStore.allWorkstreamsStartDate && workstreamStore.allWorkstreamsStartDate !== '') ? 'ws-color-white' : 'ws-icon-disabled'}`}
                                        data-tip="" data-for="datSort_ws_tooltip" data-type="dark" data-place="left"
                                        onClick={() => { this.handleDateModeChange('month') }}
                                        id="year_wise_view" name="year_wise_view"
                                    />
                                    : this.state.selectedDateMode === 'month' ?
                                        <img src={dateSortMonthIcon} alt=""
                                            className={`${(this.state.selectedDateMode === 'month' && workstreamStore.allWorkstreamsStartDate && workstreamStore.allWorkstreamsStartDate !== '') ? 'ws-color-white' : 'ws-icon-disabled'}`}
                                            data-tip="" data-for="datSort_ws_tooltip" data-type="dark" data-place="left"
                                            onClick={() => { this.handleDateModeChange('day') }}
                                            id="month_wise_view" name="month_wise_view"
                                        />
                                        :
                                        <img src={dateSortDayIcon} alt=""
                                            className={`${(this.state.selectedDateMode === 'day' && workstreamStore.allWorkstreamsStartDate && workstreamStore.allWorkstreamsStartDate !== '') ? 'ws-color-white' : 'ws-icon-disabled'}`}
                                            data-tip="" data-for="datSort_ws_tooltip" data-type="dark" data-place="left"
                                            onClick={() => { this.handleDateModeChange('year') }}
                                            id="day_wise_view" name="day_wise_view"
                                        />
                                }

                            </div>
                            <ReactTooltip id="datSort_ws_tooltip">
                                <span>Change Timescale</span>
                            </ReactTooltip>




                        </div>


                    </div>
                </div>

                {/* selected Workstream Tab and component loading row */}

                <div className="workstream-tabs">
                    {/* {selectedWorkstreamTab && selectedWorkstreamTab === 'workstreams_tab' ? */}
                    {selectedFilterType && selectedFilterType !== '' ?
                        <DefineWsFilterView
                            selectedDateMode={this.state.selectedDateMode}
                            selectedFilterType={selectedFilterType}
                            hideConnectors={this.state.hideConnectors}
                        ></DefineWsFilterView>
                        :
                        selectedSortKeys.length !== 0 ?

                            <DefineWsSortView
                                hideConnectors={this.state.hideConnectors}
                                selectedDateMode={this.state.selectedDateMode}
                                selectedSortKeys={this.state.selectedSortKeys}
                                sortType={this.state.sortType}
                                sortBy={this.state.sortBy}
                                wsListArray={this.wsListArray}
                            ></DefineWsSortView>
                            : groupBykeyPath.length > 0 ?
                                <GroupByWsChart
                                    hideConnectors={this.state.hideConnectors}
                                    selectedDateMode={this.state.selectedDateMode}
                                    keyPath={groupBykeyPath}
                                    groupBy={groupBykeyPath[0]}
                                    group={groupBykeyPath[1]}
                                >
                                </GroupByWsChart>
                                :
                                <AllWsInfoAndCharts
                                    selectedDateMode={this.state.selectedDateMode}
                                    hideConnectors={this.state.hideConnectors}
                                    wsListArray={this.wsListArray}
                                >
                                </AllWsInfoAndCharts>
                    }

                    {/* : */}
                    {selectedWorkstreamTab && selectedWorkstreamTab === 'link_kpi_investments_tab' ?
                        // <LinkedKpiCostCatModalHome closeLinkKpiView={this.handleLinkKpiClose}></LinkedKpiCostCatModalHome>
                        <LinkedKpiCostCatModalHome closeLinkKpiView={this.handleLinkKpiClose} />
                        : ''
                    }

                    {/* {
                        this.state.isGroupBySelected ? <AllWsInfoAndCharts
                        selectedDateMode={this.state.selectedDateMode}
                            wsListArray={this.wsListArray}
                            >
                            </AllWsInfoAndCharts>:""
                    } */}

                </div>


            </div>
        )
    }
}

export default withRouter(DefineWorkstreamNavbar);