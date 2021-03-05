import React, { Component } from 'react';
import { withRouter } from "react-router-dom";
import { observer, inject } from 'mobx-react';
import ReactTooltip from 'react-tooltip';
import NotificationMessage from '../../components/NotificationMessage/NotificationMessage';
import { toast } from 'react-toastify';
import exportIco from '../../assets/project_DWS/exportIcon.svg';
import showHideIco from '../../assets/project_DWS/eyeIcon.svg';
import groupByIco from '../../assets/project_DWS/groupByIcon.svg';
import dateSortYearIcon from '../../assets/project_DWS/date-sort-year.svg';
import dateSortMonthIcon from '../../assets/project_DWS/date-sort-month.svg';
import dateSortDayIcon from '../../assets/project_DWS/date-sort-day.svg';
import eraseIcon from '../../assets/project_DWS/eraserIcon.svg';
import notification from '../../assets/project_DWS/notification.svg';
import comment from '../../assets/project_DWS/comment.svg';
import Menu, { SubMenu, MenuItem } from 'rc-menu';
import filterIcon from '../../assets/project_DWS/filterIcon.svg';
import sortIcon from '../../assets/project_DWS/sortIcon.svg';
import radioSelected from '../../assets/project_DWS/radio-selected-1.svg'
import radioNotSelected from '../../assets/project_DWS/radio-not-selected-1.svg';
import AllWsActualsInfoAndCharts from '../WorkstreamActuals/AllWsActualsInfoAndCharts';
import DefineWsActualsFilterView from './DefineWsActualsFilterView';
import GroupByWsActualsChart from './GroupByWsActualsChart';
import DefineWsActualsSortView from './DefineWsActualsSortView';
@inject("publishDashboardStore", "workstreamStore")
@observer
class WorkstreamActualsHome extends Component {
    constructor(props) {
        super(props); this.handleSelectedTabClick = this.handleSelectedTabClick.bind(this);
        this.fetchAllWsDetails = this.fetchAllWsDetails.bind(this);
        this.sortAndSendArray = this.sortAndSendArray.bind(this);
        this.sortAndAssignState = this.sortAndAssignState.bind(this);
        this.handleDateModeChange = this.handleDateModeChange.bind(this);
        this.onPlusClick = this.onPlusClick.bind(this);
        this.onMinusClick = this.onMinusClick.bind(this);
        this.handleLinkKpiClose = this.handleLinkKpiClose.bind(this);
        this.wsListArray = this.wsListArray.bind(this);
        this.handleChangeGroupBy = this.handleChangeGroupBy.bind(this);

        this.state = {
            selectedWorkstreamTab: 'workstreams_tab',
            selectedDateMode: 'month',
            selectedViewIcon: 'list_view',
            selectedSortByIcon: 'sort_date',
            selectedWDAIcon: 'workstream_list',
            // show/hide connectors state variables
            hideConnectors: false,

            // open filter state variables
            openFilterMenu: false, // used for show/hide of filter menu
            selectedFilterType: '', // used for sending filter type to child
            selectedFilterKeys: [], // used for holding the selected keys of filter

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

    }

    showNotification(type) {
        switch (type) {

            case 'publishError':
                toast.error(<NotificationMessage
                    title="Error"
                    bodytext={'Sorry! Failed to publish. Please try again'}
                    icon="error"
                />, {
                    position: toast.POSITION.BOTTOM_RIGHT
                });
                break;
            default:
                break;
        }
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

            case 'list_grid_icon':
                workstreamStore.addWorkstreamArray = [];

                this.sortAndAssignState(selectedSortByIcon);
                this.setState({
                    selectedWorkstreamTab: tabCategory,
                    selectedViewIcon: selected_icon_name,

                });
                this.props.selectedWorkstreamTab(tabCategory);
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
                if (res !== false) {
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

    setSelectedWorkstreamTab(val) {
        this.setState({
            selectedWorkstreamTab: val
        });
    }
    /* groupBy */
    handleChangeGroupBy = () => {
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
            hideConnectors: true,  // un comment this for showing connectors
            isGroupByOpen: false,
            isGroupBySelected: true,
            groupBykeyPath: setkeyPath,
            sortBy: ''
        });
    }

    // filter function
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
    onClickFilter = (info) => {
    }

    onDeselectFilter = (info) => {
    }

    onOpenChangeFilter = (openKeys) => {
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
    handleSortInnerMenu = (event) => {
        this.setState({
            hideConnectors: true,
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

    render() {
        const { workstreamStore } = this.props;
        const { isGroupByOpen, groupBykeyPath, selectedSortKeys,
            selectedFilterType, selectedFilterKeys, openFilterMenu } = this.state;
        return (
            <div className="workStreamDiv ws-act-main ws-actuals-tab-main">
                <div className="row tab">
                    <div className="col-sm-8"></div>
                    <div className="col-sm-4" style={{ top: '-2.2rem' }}>
                        <div className="icon-container">
                            <div className="dws-icons-tab-row ws-act-icon-set row">
                                <div className="icon-tab-div">
                                    <img src={comment} alt=""
                                        className={`${(workstreamStore.allWorkstreamsStartDate && workstreamStore.allWorkstreamsStartDate !== '') ? 'ws-color-grey' : 'ws-icon-disabled'}`}
                                        data-tip="" data-for="comment_ws_tooltip" data-type="dark"
                                        // onClick={this.state.isGeneralInfoOpen ? () => { } : () => { this.handleSelectedTabClick('workstreams_tab', 'add_workstream') }}
                                        id="add_workstream" name="add_workstream"
                                    />
                                    <ReactTooltip id="comment_ws_tooltip">
                                        <span>Conversation </span>
                                    </ReactTooltip>
                                </div>
                                <div className="icon-tab-div">
                                    <img src={notification} alt=""
                                        className={`${(workstreamStore.allWorkstreamsStartDate && workstreamStore.allWorkstreamsStartDate !== '') ? 'ws-color-grey' : 'ws-icon-disabled'}`}
                                        data-tip="" data-for="notification_ws_tooltip" data-type="dark"
                                        // onClick={this.state.isGeneralInfoOpen ? () => { } : () => { this.handleSelectedTabClick('workstreams_tab', 'add_workstream') }}
                                        id="add_workstream" name="add_workstream"
                                    />
                                    <ReactTooltip id="notification_ws_tooltip">
                                        <span>Alerts </span>
                                    </ReactTooltip>
                                </div>
                                <div className="icon-tab-div">
                                    <img src={exportIco} alt=""
                                        className={`${(workstreamStore.allWorkstreamsStartDate && workstreamStore.allWorkstreamsStartDate !== '') ? 'ws-color-grey' : 'ws-icon-disabled'}`}
                                        data-tip="" data-for="export_ws_tooltip" data-type="dark"
                                        // onClick={this.state.isGeneralInfoOpen ? () => { } : () => { this.handleSelectedTabClick('workstreams_tab', 'add_workstream') }}
                                        id="add_workstream" name="add_workstream"
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
                                        id="connectors_wa" name="connectors_wa"
                                    />
                                    <ReactTooltip id="hide_ws_tooltip">
                                        <span>Hide/Show connectors</span>
                                    </ReactTooltip>
                                </div>

                                <div className="ws-act-group-by icon-tab-div">
                                    <img src={groupByIco} alt=""
                                        className={`${(isGroupByOpen || groupBykeyPath.length !== 0) ? 'ws-color-white' : (workstreamStore.allWorkstreamsStartDate && workstreamStore.allWorkstreamsStartDate !== '') ? 'ws-color-grey' : 'ws-icon-disabled'}`}
                                        data-tip="" data-for="group_ws_tooltip" data-type="dark"
                                        onClick={this.handleChangeGroupBy}
                                        id="add_workstream" name="add_workstream"
                                    />
                                    <ReactTooltip id="group_ws_tooltip">
                                        <span>Group By</span>
                                    </ReactTooltip>
                                    {
                                        isGroupByOpen ?
                                            <Menu
                                                className="groupBy-actuals-menu"
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
                                                    {/* <MenuItem
                                                        key="Department-Milestone"
                                                        onClick={this.handleInnerMenu}
                                                    ><div className="sub-menu">Milestone<span>
                                                        {(this.state.selectedKeys && this.state.selectedKeys[0] === "Department-Milestone") ? <img className="radio-img radio-select" alt="radio" src={radioSelected}></img> :
                                                            <img className="radio-img radio-not-select" alt="radio" src={radioNotSelected}></img>}
                                                    </span></div></MenuItem> */}
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
                                                    {/* <MenuItem
                                                        key="Owner-Milestone"
                                                        onClick={this.handleInnerMenu}
                                                    ><div className="sub-menu">Milestone<span>
                                                        {(this.state.selectedKeys && this.state.selectedKeys[0] === "Owner-Milestone") ? <img className="radio-img radio-select" alt="radio" src={radioSelected}></img> :
                                                            <img className="radio-img radio-not-select" alt="radio" src={radioNotSelected}></img>}
                                                    </span></div></MenuItem> */}
                                                </SubMenu>

                                                <SubMenu
                                                    onClick={this.handleGropBySubMenu}
                                                    style={{ background: "#505050" }}
                                                    //    popupOffset={[15, 0]}
                                                    title={<div className="main-menu">Completion Status<span>
                                                        {(this.state.selectedKeys && this.state.selectedKeys.length > 0 && this.state.selectedKeys[0].split('-')[0] === "completionstatus") ? <img className="radio-img radio-select" alt="radio" src={radioSelected}></img> :
                                                            <img className="radio-img radio-not-select" alt="radio" src={radioNotSelected}></img>}
                                                    </span></div>} key="completionstatus">
                                                    <MenuItem
                                                        onClick={this.handleInnerMenu}
                                                        key="completionstatus-Workstream"
                                                    ><div className="sub-menu">Workstream<span>
                                                        {(this.state.selectedKeys && this.state.selectedKeys[0] === "completionstatus-Workstream") ? <img className="radio-img radio-select" alt="radio" src={radioSelected}></img> :
                                                            <img className="radio-img radio-not-select" alt="radio" src={radioNotSelected}></img>}
                                                    </span></div></MenuItem>
                                                    <MenuItem
                                                        key="completionstatus-Activity"
                                                        onClick={this.handleInnerMenu}
                                                    ><div className="sub-menu">Activity<span>
                                                        {(this.state.selectedKeys && this.state.selectedKeys[0] === "completionstatus-Activity") ? <img className="radio-img radio-select" alt="radio" src={radioSelected}></img> :
                                                            <img className="radio-img radio-not-select" alt="radio" src={radioNotSelected}></img>}
                                                    </span></div></MenuItem>
                                                    <MenuItem
                                                        key="completionstatus-Deliverable"
                                                        onClick={this.handleInnerMenu}
                                                    ><div className="sub-menu">Deliverable<span>
                                                        {(this.state.selectedKeys && this.state.selectedKeys[0] === "completionstatus-Deliverable") ? <img className="radio-img radio-select" alt="radio" src={radioSelected}></img> :
                                                            <img className="radio-img radio-not-select" alt="radio" src={radioNotSelected}></img>}
                                                    </span></div></MenuItem>
                                                    {/* <MenuItem
                                                        key="completionstatus-Milestone"
                                                        onClick={this.handleInnerMenu}
                                                    ><div className="sub-menu">Milestone<span>
                                                        {(this.state.selectedKeys && this.state.selectedKeys[0] === "completionstatus-Milestone") ? <img className="radio-img radio-select" alt="radio" src={radioSelected}></img> :
                                                            <img className="radio-img radio-not-select" alt="radio" src={radioNotSelected}></img>}
                                                    </span></div></MenuItem> */}
                                                </SubMenu>
                                            </Menu> : ""
                                    }

                                </div>

                                <div className="ws-act-filter icon-tab-div">
                                    <img src={filterIcon} alt=""
                                        className={`${(openFilterMenu || selectedFilterKeys.length !== 0) ? 'ws-color-white' : (workstreamStore.allWorkstreamsStartDate && workstreamStore.allWorkstreamsStartDate !== '') ? 'ws-color-grey' : 'ws-icon-disabled'}`}
                                        data-tip="" data-for="filter_ws_tooltip" data-type="dark"
                                        onClick={this.state.showLinkKpi ? () => { this.handleSelectedTabClick('filter_tab', true) } : () => { }}
                                        id="ws_act_filter_icon" name="ws_act_filter"
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

                                        </Menu>

                                        : ''
                                    }
                                </div>

                                <div className="icon-tab-div sort-actuals">
                                    <img src={sortIcon} alt=""
                                        className={`${(this.state.selectedSortBy || (selectedSortKeys && selectedSortKeys.length !== 0)) ? 'ws-color-white' : (workstreamStore.allWorkstreamsStartDate && workstreamStore.allWorkstreamsStartDate !== '') ? 'ws-color-grey' : 'ws-icon-disabled'}`}
                                        data-tip="" data-for="sort_ws_tooltip" data-type="dark"
                                        onClick={this.state.showLinkKpi ? () => this.handleSelectedTabClick('sort_tab', true) : () => { }}
                                        id="sort_workstream" name="add_workstream"
                                    />
                                    <ReactTooltip id="sort_ws_tooltip">
                                        <span>Sort </span>
                                    </ReactTooltip>
                                    {this.state.selectedSortBy ?
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
                                                    {(this.state.sortBy && this.state.sortBy === "chronoFL_WA") ? <img className="radio-img radio-select" alt="radio" src={radioSelected}></img> :
                                                        <img className="radio-img radio-not-select" alt="radio" src={radioNotSelected}></img>}</div>}
                                                key="chronoFL_WA">
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
                                                    {(this.state.sortBy && this.state.sortBy === "chronoLF_WA") ? <img className="radio-img radio-select" alt="radio" src={radioSelected}></img> :
                                                        <img className="radio-img radio-not-select" alt="radio" src={radioNotSelected}></img>}</div>}
                                                key="chronoLF_WA">
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
                                            {/* compl start%*/}
                                            <SubMenu
                                                onClick={this.handleSubMenu}
                                                onOpenChange={this.handleSubMenu}
                                                //    onMouseEnter={this.handleSubMenu}
                                                title={<div className="main-menu"><span style={{ marginLeft: "12px" }}> Completion % (L-H) </span>
                                                    {(this.state.sortBy && this.state.sortBy === "CompletionPerc_LH") ? <img className="radio-img radio-select" alt="radio" src={radioSelected}></img> :
                                                        <img className="radio-img radio-not-select" alt="radio" src={radioNotSelected}></img>}</div>}
                                                key="CompletionPerc_LH">
                                                <MenuItem
                                                    onClick={this.handleSortInnerMenu} key="CLH-Workstream"
                                                ><div className="sub-menu">Workstream<span>
                                                    {(this.state.selectedSortKeys && this.state.selectedSortKeys[0] === "CLH-Workstream") ? <img className="radio-img radio-select" alt="radio" src={radioSelected}></img> :
                                                        <img className="radio-img radio-not-select" alt="radio" src={radioNotSelected}></img>}
                                                </span></div></MenuItem>
                                                <MenuItem
                                                    onClick={this.handleSortInnerMenu} key="CLH-Activity"
                                                ><div className="sub-menu">Activity<span>
                                                    {(this.state.selectedSortKeys && this.state.selectedSortKeys[0] === "C-LH-Activity") ? <img className="radio-img radio-select" alt="radio" src={radioSelected}></img> :
                                                        <img className="radio-img radio-not-select" alt="radio" src={radioNotSelected}></img>}
                                                </span></div></MenuItem>
                                                <MenuItem
                                                    onClick={this.handleSortInnerMenu} key="CLH-Deliverable"
                                                ><div className="sub-menu">Deliverable<span>
                                                    {(this.state.selectedSortKeys && this.state.selectedSortKeys[0] === "CLH-Deliverable") ? <img className="radio-img radio-select" alt="radio" src={radioSelected}></img> :
                                                        <img className="radio-img radio-not-select" alt="radio" src={radioNotSelected}></img>}
                                                </span></div></MenuItem>
                                            </SubMenu>
                                            <SubMenu
                                                onClick={this.handleSubMenu}
                                                onOpenChange={this.handleSubMenu}
                                                title={<div className="main-menu"><span style={{ marginLeft: "12px" }}> Completion % (H-L) </span>
                                                    {(this.state.sortBy && this.state.sortBy === "CompletionPerc_HL") ? <img className="radio-img radio-select" alt="radio" src={radioSelected}></img> :
                                                        <img className="radio-img radio-not-select" alt="radio" src={radioNotSelected}></img>}</div>}
                                                key="CompletionPerc_HL">
                                                <MenuItem
                                                    onClick={this.handleSortInnerMenu} key="CHL-Workstream"
                                                ><div className="sub-menu">Workstream<span>
                                                    {(this.state.selectedSortKeys && this.state.selectedSortKeys[0] === "CHL-Workstream") ? <img className="radio-img radio-select" alt="radio" src={radioSelected}></img> :
                                                        <img className="radio-img radio-not-select" alt="radio" src={radioNotSelected}></img>}
                                                </span></div></MenuItem>
                                                <MenuItem
                                                    onClick={this.handleSortInnerMenu} key="CHL-Activity"
                                                ><div className="sub-menu">Activity<span>
                                                    {(this.state.selectedSortKeys && this.state.selectedSortKeys[0] === "CHL-Activity") ? <img className="radio-img radio-select" alt="radio" src={radioSelected}></img> :
                                                        <img className="radio-img radio-not-select" alt="radio" src={radioNotSelected}></img>}
                                                </span></div></MenuItem>
                                                <MenuItem
                                                    onClick={this.handleSortInnerMenu} key="CHL-Deliverable"
                                                ><div className="sub-menu">Deliverable<span>
                                                    {(this.state.selectedSortKeys && this.state.selectedSortKeys[0] === "CHL-Deliverable") ? <img className="radio-img radio-select" alt="radio" src={radioSelected}></img> :
                                                        <img className="radio-img radio-not-select" alt="radio" src={radioNotSelected}></img>}
                                                </span></div></MenuItem>
                                            </SubMenu>
                                            {/* compl end%*/}

                                            {/*Days Remaining start*/}
                                            <SubMenu
                                                onClick={this.handleSubMenu}
                                                onOpenChange={this.handleSubMenu}
                                                //    onMouseEnter={this.handleSubMenu}
                                                title={<div className="main-menu"><span style={{ marginLeft: "12px" }}> Days Remaining % (L-H) </span>
                                                    {(this.state.sortBy && this.state.sortBy === "Days_Remaining_LH") ? <img className="radio-img radio-select" alt="radio" src={radioSelected}></img> :
                                                        <img className="radio-img radio-not-select" alt="radio" src={radioNotSelected}></img>}</div>}
                                                key="Days_Remaining_LH">
                                                <MenuItem
                                                    onClick={this.handleSortInnerMenu} key="LH-Workstream"
                                                ><div className="sub-menu">Workstream<span>
                                                    {(this.state.selectedSortKeys && this.state.selectedSortKeys[0] === "LH-Workstream") ? <img className="radio-img radio-select" alt="radio" src={radioSelected}></img> :
                                                        <img className="radio-img radio-not-select" alt="radio" src={radioNotSelected}></img>}
                                                </span></div></MenuItem>
                                                <MenuItem
                                                    onClick={this.handleSortInnerMenu} key="LH-Activity"
                                                ><div className="sub-menu">Activity<span>
                                                    {(this.state.selectedSortKeys && this.state.selectedSortKeys[0] === "LH-Activity") ? <img className="radio-img radio-select" alt="radio" src={radioSelected}></img> :
                                                        <img className="radio-img radio-not-select" alt="radio" src={radioNotSelected}></img>}
                                                </span></div></MenuItem>
                                                <MenuItem
                                                    onClick={this.handleSortInnerMenu} key="LH-Deliverable"
                                                ><div className="sub-menu">Deliverable<span>
                                                    {(this.state.selectedSortKeys && this.state.selectedSortKeys[0] === "LH-Deliverable") ? <img className="radio-img radio-select" alt="radio" src={radioSelected}></img> :
                                                        <img className="radio-img radio-not-select" alt="radio" src={radioNotSelected}></img>}
                                                </span></div></MenuItem>
                                            </SubMenu>
                                            <SubMenu
                                                onClick={this.handleSubMenu}
                                                onOpenChange={this.handleSubMenu}
                                                title={<div className="main-menu"><span style={{ marginLeft: "12px" }}> Days Remaining % (H-L) </span>
                                                    {(this.state.sortBy && this.state.sortBy === "Days_Remaining_HL") ? <img className="radio-img radio-select" alt="radio" src={radioSelected}></img> :
                                                        <img className="radio-img radio-not-select" alt="radio" src={radioNotSelected}></img>}</div>}
                                                key="Days_Remaining_HL">
                                                <MenuItem
                                                    onClick={this.handleSortInnerMenu} key="HL-Workstream"
                                                ><div className="sub-menu">Workstream<span>
                                                    {(this.state.selectedSortKeys && this.state.selectedSortKeys[0] === "HL-Workstream") ? <img className="radio-img radio-select" alt="radio" src={radioSelected}></img> :
                                                        <img className="radio-img radio-not-select" alt="radio" src={radioNotSelected}></img>}
                                                </span></div></MenuItem>
                                                <MenuItem
                                                    onClick={this.handleSortInnerMenu} key="HL-Activity"
                                                ><div className="sub-menu">Activity<span>
                                                    {(this.state.selectedSortKeys && this.state.selectedSortKeys[0] === "HL-Activity") ? <img className="radio-img radio-select" alt="radio" src={radioSelected}></img> :
                                                        <img className="radio-img radio-not-select" alt="radio" src={radioNotSelected}></img>}
                                                </span></div></MenuItem>
                                                <MenuItem
                                                    onClick={this.handleSortInnerMenu} key="HL-Deliverable"
                                                ><div className="sub-menu">Deliverable<span>
                                                    {(this.state.selectedSortKeys && this.state.selectedSortKeys[0] === "HL-Deliverable") ? <img className="radio-img radio-select" alt="radio" src={radioSelected}></img> :
                                                        <img className="radio-img radio-not-select" alt="radio" src={radioNotSelected}></img>}
                                                </span></div></MenuItem>
                                            </SubMenu>
                                            {/*Days Remaining ends*/}


                                        </Menu> : ""
                                    }

                                </div>

                                <div className="icon-tab-div">
                                    <img src={eraseIcon} alt=""
                                        className={`${((selectedFilterKeys && selectedFilterKeys.length !== 0) || (selectedSortKeys && selectedSortKeys.length !== 0) || (groupBykeyPath && groupBykeyPath.length !== 0)) ? 'ws-color-white' : (workstreamStore.allWorkstreamsStartDate && workstreamStore.allWorkstreamsStartDate !== '') ? 'ws-color-grey' : 'ws-icon-disabled'}`}
                                        data-tip="" data-for="clear_ws_tooltip" data-type="dark" data-place="left"
                                        onClick={() => { this.handleSelectedTabClick('clear_all', 'add_workstream') }}
                                        id="ws_act_clear_all" name="ws_act_clear_all"
                                    />
                                    <ReactTooltip id="clear_ws_tooltip">
                                        <span>Clear all selections</span>
                                    </ReactTooltip>
                                </div>


                                <div className="ws-act-last-icon icon-tab-div">
                                    {this.state.selectedDateMode === 'year' ?
                                        <img src={dateSortYearIcon} alt=""
                                            className={`${this.state.selectedDateMode === 'year' ? 'ws-color-white' : 'ws-color-grey'}`}
                                            data-tip="" data-for="datSort_ws_tooltip" data-type="dark" data-place="left"
                                            onClick={() => { this.handleDateModeChange('month') }}
                                            id="year_wise_view" name="year_wise_view"
                                        />
                                        : this.state.selectedDateMode === 'month' ?
                                            <img src={dateSortMonthIcon} alt=""
                                                className={`${(this.state.selectedDateMode === 'month' && this.props.workstreamStore.allWorkstreamsStartDate && this.props.workstreamStore.allWorkstreamsStartDate !== '') ? 'ws-color-white' : 'ws-color-grey'}`}
                                                data-tip="" data-for="datSort_ws_tooltip" data-type="dark" data-place="left"
                                                onClick={() => { this.handleDateModeChange('day') }}
                                                id="month_wise_view" name="month_wise_view"
                                            />
                                            :
                                            <img src={dateSortDayIcon} alt="" className={`${this.state.selectedDateMode === 'day' ? 'ws-color-white' : 'ws-color-grey'}`}
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

                </div>
                <div>
                    {selectedSortKeys && selectedSortKeys.length !== 0 ?

                        <DefineWsActualsSortView
                            hideConnectors={this.state.hideConnectors}
                            selectedDateMode={this.state.selectedDateMode}
                            selectedSortKeys={this.state.selectedSortKeys}
                            sortType={this.state.sortType}
                            sortBy={this.state.sortBy}
                            wsListArray={this.wsListArray}
                        ></DefineWsActualsSortView> :
                        groupBykeyPath.length > 0 ?
                            // <GroupByWsChart
                            //     selectedDateMode={this.state.selectedDateMode}
                            //     keyPath={groupBykeyPath}
                            //     groupBy={groupBykeyPath[0]}
                            //     group={groupBykeyPath[1]}
                            // >
                            // </GroupByWsChart>
                            <GroupByWsActualsChart selectedDateMode={this.state.selectedDateMode}
                                keyPath={groupBykeyPath}
                                groupBy={groupBykeyPath[0]}
                                group={groupBykeyPath[1]}
                                hideConnectors={this.state.hideConnectors}>
                            </GroupByWsActualsChart>
                            : selectedFilterType && selectedFilterType !== '' ?
                                <DefineWsActualsFilterView
                                    selectedDateMode={this.state.selectedDateMode}
                                    selectedFilterType={selectedFilterType}
                                    hideConnectors={this.state.hideConnectors}
                                ></DefineWsActualsFilterView>
                                :
                                <AllWsActualsInfoAndCharts
                                    selectedDateMode={this.state.selectedDateMode}
                                    hideConnectors={this.state.hideConnectors}
                                    wsListArray={this.wsListArray}
                                >
                                </AllWsActualsInfoAndCharts>
                    }
                </div>
            </div>
        )
    }
}

export default withRouter(WorkstreamActualsHome);