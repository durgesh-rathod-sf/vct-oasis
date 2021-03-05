import React, { Component, Fragment } from 'react';
import { withRouter } from 'react-router-dom';
import { inject } from 'mobx-react';
import { toast } from 'react-toastify';
import NotificationMessage
  from '../../components/NotificationMessage/NotificationMessage';
import './milestone.css';
import Moment from 'moment';
import Modal from 'react-bootstrap4-modal';
import sortIcon from '../../assets/project/workstream/sorting.svg';
// import saveIco from '../../assets/project/workstream/saveIcon.png';
import calender from '../../assets/project/workstream/date.svg';
import DatePicker from 'react-datepicker';
import vector from "../../assets/project/workstream/Vector.svg";
import ReactTooltip from 'react-tooltip';
var SessionStorage = require('store/storages/sessionStorage');

@inject('workstreamActualsStore')
class MileStonesHome extends Component {
  constructor(props) {
    super(props);
    this.state = {
      milestonesData: [],
      expStartDate: '',
      filteredData: [],
      StatusList: [],
      saveInprogress: false,
      sort: {
        column: null,
        direction: 'desc',
        isModalOpen: false,
        displayFilteredData: false,
      },
      enableExpectedDate: false,
      enableActualDate: false,
    };
    this.handleDateChange = this.handleDateChange.bind(this);
    this.onStatusChange = this.onStatusChange.bind(this);
    this.saveMileStoneDeliverable = this.saveMileStoneDeliverable.bind(this);
  }

  componentDidMount() {
    const {
      actionType,
      selectedWADLevelId,
      workstreamActualsStore,
      selectedLevel,
    } = this.props;
    this.setState({ milestonesData: [] });
    if (actionType === 'Milestones' && selectedLevel === 'Workstream') {
      workstreamActualsStore
        .getWorkstreamMilestonesByWSId(selectedWADLevelId)
        .then(response => {
          if (
            response.data.resultCode === 'OK' &&
            response.data.resultObj !== null
          ) {
            const StatusList = workstreamActualsStore.mileStoneStatusList;
            this.setState({
              milestonesData: response.data.resultObj,
              StatusList: StatusList,
              filteredData: JSON.parse(JSON.stringify(response.data.resultObj))
            });
          }
          else if (
            response.data.resultCode === 'OK' &&
            response.data.resultObj === null
          ) {
            const StatusList = workstreamActualsStore.mileStoneStatusList;
            this.setState({
              milestonesData: [],
              StatusList: StatusList,
              filteredData: []
            });

          }else if (response.data.resultCode === 'KO') {
            this.showNotification(response.data.errorDescription, 'Error', 'error')
        }
        });
    } else if (actionType === 'Milestones' && selectedLevel === 'Activity') {
      workstreamActualsStore
        .getWorkstreamMilestonesByActivityId(selectedWADLevelId)
        .then(response => {
          if (
            response.data.resultCode === 'OK' &&
            response.data.resultObj !== null
          ) {
            const StatusList = workstreamActualsStore.mileStoneStatusList;
            this.setState({
              milestonesData: response.data.resultObj,
              StatusList: StatusList,
              filteredData: JSON.parse(JSON.stringify(response.data.resultObj))
            });
          }
          else if (
            response.data.resultCode === 'OK' &&
            response.data.resultObj === null
          ) {
            const StatusList = workstreamActualsStore.mileStoneStatusList;
            this.setState({
              milestonesData: [],
              StatusList: StatusList,
              filteredData: []
            });

          }else if (response.data.resultCode === 'KO') {
            this.showNotification(response.data.errorDescription, 'Error', 'error')
        }
        });
    } else if (actionType === 'Milestones' && selectedLevel === 'Deliverable') {
      workstreamActualsStore
        .getWorkstreamMilestonesByDeliverableId(selectedWADLevelId)
        .then(response => {
          if (
            response.data.resultCode === 'OK' &&
            response.data.resultObj !== null
          ) {
            const StatusList = workstreamActualsStore.mileStoneStatusList;
            workstreamActualsStore.deliverableTimeline =
              response.data.resultObj;
            this.setState(
              {
                milestonesData: response.data.resultObj.milestones,
                StatusList: StatusList,
                filteredData: JSON.parse(JSON.stringify(response.data.resultObj.milestones))
              },
              () => {
                this.buildSelectionOfDates(this.state.milestonesData);
              }
            );
          }
          else if (
            response.data.resultCode === 'OK' &&
            response.data.resultObj === null
          ) {
            const StatusList = workstreamActualsStore.mileStoneStatusList;
            this.setState({
              milestonesData: [],
              StatusList: StatusList,
              filteredData: []
            });

          }
          else if (response.data.resultCode === 'KO') {
              this.showNotification(response.data.errorDescription, 'Error', 'error')
          }
        });
    }
  }

  componentDidUpdate(prevProps) {
    if (prevProps.selectedWADLevelId !== this.props.selectedWADLevelId) {
      const {
        actionType,
        selectedWADLevelId,
        workstreamActualsStore,
        selectedLevel,
      } = this.props;
      this.setState({ milestonesData: [], StatusList: [] });
      if (actionType === 'Milestones' && selectedLevel === 'Workstream') {
        workstreamActualsStore
          .getWorkstreamMilestonesByWSId(selectedWADLevelId)
          .then(response => {
            if (
              response.data.resultCode === 'OK' &&
              response.data.resultObj !== null
            ) {
              const StatusList = workstreamActualsStore.mileStoneStatusList;
              this.setState({
                milestonesData: response.data.resultObj,
                StatusList: StatusList,
                filteredData: JSON.parse(JSON.stringify(response.data.resultObj))
              });
            }
            else if (
              response.data.resultCode === 'OK' &&
              response.data.resultObj === null
            ) {
              const StatusList = workstreamActualsStore.mileStoneStatusList;
              this.setState({
                milestonesData: [],
                StatusList: StatusList,
                filteredData: []
              });

            }else if (response.data.resultCode === 'KO') {
              this.showNotification(response.data.errorDescription, 'Error', 'error')
          }
          });
      } else if (actionType === 'Milestones' && selectedLevel === 'Activity') {
        workstreamActualsStore
          .getWorkstreamMilestonesByActivityId(selectedWADLevelId)
          .then(response => {
            if (
              response.data.resultCode === 'OK' &&
              response.data.resultObj !== null
            ) {
              const StatusList = workstreamActualsStore.mileStoneStatusList;
              this.setState({
                milestonesData: response.data.resultObj,
                StatusList: StatusList,
                filteredData: JSON.parse(JSON.stringify(response.data.resultObj))
              });
            }
            else if (
              response.data.resultCode === 'OK' &&
              response.data.resultObj === null
            ) {
              const StatusList = workstreamActualsStore.mileStoneStatusList;
              this.setState({
                milestonesData: [],
                StatusList: StatusList,
                filteredData: []
              });

            }else if (response.data.resultCode === 'KO') {
              this.showNotification(response.data.errorDescription, 'Error', 'error')
          }
          });
      } else if (
        actionType === 'Milestones' &&
        selectedLevel === 'Deliverable'
      ) {
        workstreamActualsStore
          .getWorkstreamMilestonesByDeliverableId(selectedWADLevelId)
          .then(response => {
            if (
              response.data.resultCode === 'OK' &&
              response.data.resultObj !== null
            ) {
              workstreamActualsStore.deliverableTimeline =
                response.data.resultObj;
              const StatusList = workstreamActualsStore.mileStoneStatusList;
              this.setState(
                {
                  milestonesData: response.data.resultObj.milestones,
                  StatusList: StatusList,
                  filteredData: JSON.parse(JSON.stringify(response.data.resultObj.milestones))
                },
                () => {
                  this.buildSelectionOfDates(this.state.milestonesData);
                }
              );
            }
            else if (
              response.data.resultCode === 'OK' &&
              response.data.resultObj === null
            ) {
              const StatusList = workstreamActualsStore.mileStoneStatusList;
              this.setState({
                milestonesData: [],
                StatusList: StatusList,
                filteredData: []
              });

            }
            else if (response.data.resultCode === 'KO') {
              this.showNotification(response.data.errorDescription, 'Error', 'error')
            }
          });
      }
    }
  }

  buildSelectionOfDates(mileStones) {
    let tempArray = mileStones;
    for (let x of tempArray) {
      x.disableObj = { expDate: false, actualDate: false };
    }
    for (let x of tempArray) {
      if (x['actualDate'] !== '' && x['actualDate'] !== null) {
        x.disableObj['expDate'] = true;
        x['expDate'] = '';
      }
    }

    this.setState(
      {
        milestonesData: [...tempArray],
      },
      () => {
        console.log('');
      }
    );
  }
  openModal() {
    this.setState({
      isModalOpen: true,
    });
    var element = document.getElementById('mileStoneDiv');
    var element1 = document.getElementById('status');
    var rect1 = element1.getBoundingClientRect();
    var rect = element.getBoundingClientRect();
    var modal = document.getElementById('mileStoneModal');

    modal.style.margin = 0;
    modal.style.top = rect.top + 20 + 'px';
    modal.style.left = rect1.x + 23 + 'px';
  }
  closeModal() {
    this.setState({
      isModalOpen: false,
    });
  }
  onSort(e, column) {
    const direction = this.state.sort.column
      ? this.state.sort.direction === 'asc' ? 'desc' : 'asc'
      : 'desc';
    const sortedMap = this.state.displayFilteredData === true ? [...this.state.filteredData] : [...this.state.milestonesData]
    const sortedData = sortedMap.sort((a, b) => {
      if (column === 'milestone') {
        const nameA = a.milestone.toUpperCase(); // ignore upper and lowercase
        const nameB = b.milestone.toUpperCase(); // ignore upper and lowercase
        if (nameA < nameB) {
          return -1;
        }
        if (nameA > nameB) {
          return 1;
        }
        // names must be equal
        return 0;
      } else if (column === 'plannedDate') {
        const nameA = a.milestoneDate.toUpperCase(); // ignore upper and lowercase
        const nameB = b.milestoneDate.toUpperCase(); // ignore upper and lowercase
        if (nameA < nameB) {
          return -1;
        }
        if (nameA > nameB) {
          return 1;
        }
        // names must be equal
        return 0;
      } else if (column === 'expdate') {
        const nameA = a.expDate.toUpperCase(); // ignore upper and lowercase
        const nameB = b.expDate.toUpperCase(); // ignore upper and lowercase
        if (nameA < nameB) {
          return -1;
        }
        if (nameA > nameB) {
          return 1;
        }
        // names must be equal
        return 0;
      } else if (column === 'actDate') {
        const nameA = a.actualDate.toUpperCase(); // ignore upper and lowercase
        const nameB = b.actualDate.toUpperCase(); // ignore upper and lowercase
        if (nameA < nameB) {
          return -1;
        }
        if (nameA > nameB) {
          return 1;
        }
        // names must be equal
        return 0;
      }
      return true
    });

    if (direction === 'desc') {
      sortedData.reverse();
    }

    this.setState({
      milestonesData: sortedData,
      displayFilteredData: false,
      sort: {
        column,
        direction,
        displayFilteredData: false,
      },
    });
  }
  handleDateChange(e, index, keyValue) {
    const { workstreamActualsStore } = this.props;
    const { milestonesData } = this.state;
    let date = '';
    if (e === null) {
      date = '';
    } else {
      date = this.formatDate(e);
    }
    for (let [i, x] of milestonesData.entries()) {
      let exDate = workstreamActualsStore.deliverableTimeline.milestones[i];
      if (i === index) {
        x[keyValue] = date;
        if (keyValue === 'actualDate') {
          if (date === null || date === '') {
            x.disableObj['expDate'] = false;
            x['expDate'] = exDate['expDate'] !== null &&
              exDate['expDate'] !== ''
              ? exDate['expDate']
              : '';
          } else {
            x.disableObj['expDate'] = true;
            x['expDate'] = '';
          }
        }
      }
    }
    this.setState({
      milestonesData: [...milestonesData],
    });
  }
  formatDate(str) {
    var date = new Date(str),
      mnth = ('0' + (date.getMonth() + 1)).slice(-2),
      day = ('0' + date.getDate()).slice(-2);
    return [mnth, day, date.getFullYear()].join('-');
  }

  statusFilter(event, status, key) {
    let count = false;
    const { milestonesData, filteredData, StatusList } = this.state;
    if (status.statusName === 'select_all') {
      if (event.target.checked === true) {
        for (let [i, statusObject] of StatusList.entries()) {
          StatusList[i]['checked'] = true;
        }
        this.setState({
          filteredData: JSON.parse(JSON.stringify(milestonesData)),
          // JSON.parse (JSON.stringify (milestonesData)),
          StatusList: [...StatusList],
        });
      } else {
        for (let [i, statusObject] of StatusList.entries()) {
          StatusList[i]['checked'] = false;
        }
        this.setState({
          filteredData: [],
          StatusList: [...StatusList],
        });
      }
    } else if (event.target.checked === true) {
      milestonesData.map((entry, index) => {
        if (entry.status === status.statusName) {
          if (filteredData.length > 0) {
            if (
              filteredData.filter(
                item => item.milestoneId === entry.milestoneId
              ).length === 0
            ) {
              for (let [i, x] of StatusList.entries()) {
                if (x['statusName'] === status.statusName) {
                  StatusList[i]['checked'] = true;
                }
              }
              filteredData.push(entry);
            }
            this.setState({
              filteredData: [...filteredData],
              StatusList: [...StatusList],
            });
          } else {
            for (let [i, x] of StatusList.entries()) {
              if (x['statusName'] === status.statusName) {
                StatusList[i]['checked'] = true;
              }
            }
            filteredData.push(entry);
            this.setState({
              filteredData: [...filteredData],
              StatusList: [...StatusList],
            });
          }
        }
        return true
      });
      for (let [i, x] of StatusList.entries()) {
        if (StatusList[i]['checked'] === true) {
          count = true
        } else {
          count = false
        }
      }
      if (count === true) {
        StatusList[0]['checked'] = true;
        this.setState({
          filteredData: JSON.parse(JSON.stringify(milestonesData)),
          StatusList: [...StatusList],
        })
      }
    } else {
      for (let i = 0; i < filteredData.length; i++) {
        if (filteredData[i].status === status.statusName) {
          filteredData.splice(i, 1);
          i = i - 1;
        }
      }
      for (let [i, statusObject] of StatusList.entries()) {
        if (statusObject['statusName'] === status.statusName) {
          StatusList[i]['checked'] = false;
          StatusList[0]['checked'] = false;
        }
      }
      this.setState({
        filteredData: [...filteredData],
        StatusList: [...StatusList],
      });
    }

    this.setState({
      displayFilteredData: true,
    });
  }

  onStatusChange(event, keyValue, index) {
    const { milestonesData } = this.state;
    for (let [i, x] of milestonesData.entries()) {
      if (i === index && event.target.value !== '') {
        x[keyValue] = event.target.value;
      }
    }
    this.setState({
      milestonesData: [...milestonesData],
    });
  }

  saveMileStoneDeliverable() {
    const { workstreamActualsStore, selectedWADLevelId } = this.props;
    const { deliverableTimeline } = workstreamActualsStore;
    const { name, activityId, deliverableId } = deliverableTimeline;
    let mileStoneArray = this.buildData();
    if (mileStoneArray.length > 0) {
      const payload = {
        name: name,
        deliverableId: deliverableId.toString(),
        activityId: activityId.toString(),
        label: 'N',
        milestones: mileStoneArray,
      };
      this.setState({
        saveInprogress: true,
      });
      workstreamActualsStore
        .saveDeliverableMilestones(payload)
        .then(response => {
          if (response.data.resultCode !== undefined) {
            if (response.data.resultCode === 'OK') {
              this.setState({ milestonesData: [], StatusList: [] });
              workstreamActualsStore
                .getWorkstreamMilestonesByDeliverableId(selectedWADLevelId)
                .then(response => {
                  if (
                    response.data.resultCode === 'OK' &&
                    response.data.resultObj !== null
                  ) {
                    workstreamActualsStore.deliverableTimeline =
                      response.data.resultObj;
                    const StatusList = workstreamActualsStore.mileStoneStatusList;
                    this.setState(
                      {
                        milestonesData: response.data.resultObj.milestones,
                        StatusList: StatusList,
                      },
                      () => {
                        this.buildSelectionOfDates(this.state.milestonesData);
                      }
                    );
                  }else if (response.data.resultCode === 'KO') {
                    this.showNotification(response.data.errorDescription, 'Error', 'error')
                }
                });
              this.showNotification(
                response.data.resultDescription,
                'Success',
                'success'
              );
              this.setState({
                saveInprogress: false,
              });
            } else if (response.data.resultCode === 'KO') {
              this.showNotification(
                response.data.errorDescription,
                'Error',
                'error'
              );
              this.setState({
                saveInprogress: false,
              });
            }
          } else {
            this.showNotification('Something went wrong.!', 'Error', 'error');
            this.setState({
              saveInprogress: false,
            });
          }
        });
    } else {
      this.showNotification(
        'Please make any changes and save',
        'error',
        'saveNochangeserror'
      );
    }
  }

  buildData() {
    const { workstreamActualsStore } = this.props;
    let keyValues = [
      'milestoneId',
      'milestone',
      'milestoneDate',
      'expDate',
      'actualDate',
      'status',
    ];
    let valuesArray1 = [];
    let valuesArray = this.state.milestonesData;
    if (
      valuesArray.length ===
      workstreamActualsStore.deliverableTimeline.milestones.length
    ) {
      valuesArray1 = valuesArray
        .filter(function (o1) {
          // filter out (!) items in result2
          return workstreamActualsStore.deliverableTimeline.milestones.some(
            function (o2) {
              if (
                o1.expDate !== o2.expDate ||
                o1.actualDate !== o2.actualDate ||
                o1.status !== o2.status
              ) {
                return o1.milestoneId === o2.milestoneId; // assumes same id
              }
            }
          );
        })
        .map(function (o) {
          // use reduce to make objects with only the required properties
          // and map to apply this to the filtered array as a whole
          return keyValues.reduce(function (newo, reqObj) {
            if (reqObj === 'milestoneId') {
              newo[reqObj] = o[reqObj].toString();
            } else if (reqObj === 'expDate') {
              newo[reqObj] = o[reqObj] !== '' && o[reqObj] !== null
                ? Moment(o[reqObj]).format('YYYY-MM-DD')
                : '';
            } else if (reqObj === 'actualDate') {
              newo[reqObj] = o[reqObj] !== '' && o[reqObj] !== null
                ? Moment(o[reqObj]).format('YYYY-MM-DD')
                : '';
            } else {
              newo[reqObj] = o[reqObj];
            }
            return newo;
          }, {});
        });
      return valuesArray1;
    }
  }

  showNotification = (message, title, type) => {
    if (type === 'error') {
      toast.error(
        <NotificationMessage title={title} bodytext={message} icon={type} />,
        {
          position: toast.POSITION.BOTTOM_RIGHT,
        }
      );
    } else if (type === 'success') {
      toast.info(
        <NotificationMessage title={title} bodytext={message} icon={type} />,
        {
          position: toast.POSITION.BOTTOM_RIGHT,
        }
      );
    } else if (type === 'saveNochangeserror') {
      toast.error(
        <NotificationMessage title={title} bodytext={message} icon="error" />,
        {
          position: toast.POSITION.BOTTOM_RIGHT,
        }
      );
    }
  };

  render() {
    const { selectedLevel } = this.props;
    let {
      milestonesData,
      isModalOpen,
      filteredData,
      displayFilteredData,
      StatusList,
    } = this.state;
    const statusCodes = {
      select_all: 'Select all',
      CMP_ON_DT: 'Completed on date',
      CMP_AFTER_DUE_DT: 'Completed after due date',
      DELAYED: 'Delayed',
      SCHEDULED: 'Scheduled',
    };
    return (
      <div id="mileStoneDiv">
        <div style={{ overflowX: 'auto' }}>
          <div style={{ width: this.props.isExpandBenefits ? 'unset' : '185%' }} >
            <div style={{ height: '50%', overflow: 'auto' }}>
              {(selectedLevel === 'Workstream' ||
                selectedLevel === 'Activity')
                ? <table id="mileStoneTable">
                  <thead>
                    <tr >
                      <th onClick={e => this.onSort(e, 'milestone')}>
                        Milestone<span style={{ float: 'right' }}>
                          <img
                            data-tip=""
                            data-for="milesort_tooltip"
                            data-place="left"
                            src={sortIcon}
                            alt="sort"
                            className="sortImg"
                          />
                          <ReactTooltip id="milesort_tooltip" className="tooltip-class">
                            <span>Sort</span>
                          </ReactTooltip>
                        </span>
                      </th>
                      <th onClick={e => this.onSort(e, 'plannedDate')}>
                        Planned Date<span style={{ float: 'right' }}>
                          <img
                            data-tip=""
                            data-for="plansort_tooltip"
                            data-place="left"
                            src={sortIcon}
                            alt="sort"
                            className="sortImg"
                          />
                          <ReactTooltip id="plansort_tooltip" className="tooltip-class">
                            <span>Sort</span>
                          </ReactTooltip>
                        </span>
                      </th>
                      <th onClick={e => this.onSort(e, 'expdate')}>
                        Expected Date<span style={{ float: 'right' }}>
                          <img
                            data-tip=""
                            data-for="expsort_tooltip"
                            data-place="left"
                            src={sortIcon}
                            alt="sort"
                            className="sortImg"
                          />
                          <ReactTooltip id="expsort_tooltip" className="tooltip-class">
                            <span>Sort</span>
                          </ReactTooltip>
                        </span>
                      </th>
                      <th onClick={e => this.onSort(e, 'actDate')}>
                        Actual Date<span style={{ float: 'right' }}>
                          <img
                            data-tip=""
                            data-for="actsort_tooltip"
                            data-place="left"
                            src={sortIcon}
                            alt="sort"
                            className="sortImg"
                          />
                          <ReactTooltip id="actsort_tooltip" className="tooltip-class">
                            <span>Sort</span>
                          </ReactTooltip>
                        </span>
                      </th>
                      <th id="status" style={{ position: "relative" }}>
                        Status<span style={{ float: 'right' }}>
                          <img data-tip=""
                            data-for="status_tooltip"
                            data-place="left"
                            onClick={() => this.openModal()} style={{ color: 'grey' }} src={vector} />
                          {/* <i
                              className="fa fa-filter sortImg"
                              aria-hidden="true"
                              onClick={() => this.openModal ()}
                            /> */}
                          <ReactTooltip id="status_tooltip" className="tooltip-class">
                            <span>Filter</span>
                          </ReactTooltip>
                        </span>
                        <Modal id="mileStoneModal" visible={isModalOpen}>
                          <button
                            type="button"
                            onClick={() => this.closeModal()}
                            className="close"
                            data-dismiss="modal"
                            style={{
                              color: '#ffffff',
                              opacity: '1',

                              marginLeft: '80%',
                            }}
                          >
                            &times;
                            </button>
                          {StatusList &&
                            StatusList.map((status, key) => (
                              <div key={`actWork${key}`}
                                className="row"
                                style={{ marginLeft: '8px', display: 'flex' }}
                              >
                                <input
                                  type="checkbox"
                                  id={`status${key}`}
                                  className="modalSlider"
                                  checked={status.checked}
                                  onChange={event =>
                                    this.statusFilter(event, status, key)}
                                />
                                <label
                                  id={`statusLabel${key}`}
                                  htmlFor="modalSlider"
                                  style={{ marginTop: '-6px' }}
                                >
                                  {status.statusName === null
                                    ? '(Blanks)'
                                    : status.statusName === 'select_all'
                                      ? statusCodes[status.statusName]
                                      : statusCodes[status.statusName]}
                                </label>
                              </div>
                            ))}
                        </Modal>
                      </th>
                    </tr>
                  </thead>
                  {milestonesData &&
                    milestonesData.length > 0 ?
                    <tbody>
                      {
                        (displayFilteredData
                          ? (milestonesData = filteredData)
                          : milestonesData, milestonesData.map(
                            (option, index) => (
                              <tr key={`row${index}`}>
                                <td>
                                  {' '}
                                  <input
                                    type="text"
                                    id={index}
                                    value={option.milestone}
                                    className="milestone-input_disabled"
                                    disabled={true}
                                    style={{ textAlignLast: "center" }}
                                  /></td>
                                <td>
                                  <div style={{ display: 'flex' }}>
                                    <DatePicker
                                      disabled={true}
                                      value={
                                        option.milestoneDate !== ''
                                          ? Moment(option.milestoneDate).format(
                                            'DD-MMM-YYYY'
                                          )
                                          : ''
                                      }
                                      id={`milestoneDate${index}`}
                                      dateFormat="dd-MMM-yyyy"
                                      showMonthDropdown
                                      showYearDropdown
                                      useShortMonthInDropdown
                                      isCalenderFixed
                                      fixedHeight
                                      className="milestone-input_disabled"
                                      required={true}
                                    />
                                    <img
                                      src={calender}
                                      className="activity-img"
                                      style={{ height: '20px' }}
                                      alt="milestonedate"
                                    />
                                  </div>
                                </td>
                                <td>
                                  <div style={{ display: 'flex' }}>
                                    <DatePicker
                                      disabled={true}
                                      value=
                                      {option.expDate !== ''
                                        ? Moment(option.expDate).format(
                                          'DD-MMM-YYYY'
                                        )
                                        : ''}
                                      id={`expDate${index}`}
                                      dateFormat="dd-MMM-yyyy"
                                      showMonthDropdown
                                      showYearDropdown
                                      useShortMonthInDropdown
                                      isCalenderFixed
                                      fixedHeight
                                      className="milestone-input_disabled"
                                      required={true}
                                    />
                                    <img
                                      src={calender}
                                      className="activity-img"
                                      style={{ height: '20px' }}
                                      alt="expdate"
                                    />
                                  </div>
                                </td>
                                <td>
                                  <div style={{ display: 'flex' }}>
                                    <DatePicker
                                      disabled={true}
                                      value=
                                      {option.actualDate !== ''
                                        ? Moment(option.actualDate).format(
                                          'DD-MMM-YYYY'
                                        )
                                        : ''}
                                      id={`actualDate${index}`}
                                      dateFormat="dd-MMM-yyyy"
                                      showMonthDropdown
                                      showYearDropdown
                                      useShortMonthInDropdown
                                      isCalenderFixed
                                      fixedHeight
                                      className="milestone-input_disabled"
                                      required={true}
                                    />
                                    <img
                                      src={calender}
                                      className="activity-img"
                                      style={{ height: '20px' }}
                                      alt="actualdate"
                                    />
                                  </div>
                                </td>
                                <td>{statusCodes[option.status]}</td>
                              </tr>
                            )
                          ))
                      }</tbody>
                    :
                    <div className="noDataAvailable">No Milestones have been added yet</div>}
                </table>
                : <table id="mileStoneTable">
                  <thead>
                    <tr>
                      <th onClick={e => this.onSort(e, 'milestone')}>
                        Milestone
                          <span style={{ float: 'right' }}>

                          <img
                            data-tip=""
                            data-for="Dmilesort_tooltip"
                            data-place="left"
                            src={sortIcon}
                            alt="sort"
                            className="sortImg"
                          />
                          <ReactTooltip id="Dmilesort_tooltip" className="tooltip-class">
                            <span>Sort</span>
                          </ReactTooltip>
                        </span>
                      </th>
                      <th onClick={e => this.onSort(e, 'plannedDate')}>
                        Planned Date
                          <span style={{ float: 'right' }}>
                          <img
                            data-tip=""
                            data-for="Dplansort_tooltip"
                            data-place="left"
                            src={sortIcon}
                            alt="sort"
                            className="sortImg"
                          />
                          <ReactTooltip id="Dplansort_tooltip" className="tooltip-class">
                            <span>Sort</span>
                          </ReactTooltip>
                        </span>
                      </th>
                      <th onClick={e => this.onSort(e, 'expdate')}>
                        Expected Date
                          <span style={{ float: 'right' }}>
                          <img
                            data-tip=""
                            data-for="Dexpsort_tooltip"
                            data-place="left"
                            src={sortIcon}
                            alt="sort"
                            className="sortImg"
                          />
                          <ReactTooltip id="Dexpsort_tooltip" className="tooltip-class">
                            <span>Sort</span>
                          </ReactTooltip>
                        </span>
                      </th>
                      <th onClick={e => this.onSort(e, 'actDate')}>
                        Actual Date
                          <span style={{ float: 'right' }}>

                          <img
                            data-tip=""
                            data-for="Dactualsort_tooltip"
                            data-place="left"
                            src={sortIcon}
                            alt="sort"
                            className="sortImg"
                          />
                          <ReactTooltip id="Dactualsort_tooltip" className="tooltip-class">
                            <span>Sort</span>
                          </ReactTooltip>
                        </span>
                      </th>
                      <th id="status">
                        Status
                          <span style={{ float: 'right' }}>
                          <img
                            data-tip=""
                            data-for="Dstatussort_tooltip"
                            data-place="left"
                            onClick={() => this.openModal()} style={{ color: 'grey' }} src={vector} />
                          {/* <i
                              className="fa fa-filter sortImg"
                              aria-hidden="true"
                              onClick={() => this.openModal ()}
                            /> */}
                          <ReactTooltip id="Dstatussort_tooltip" className="tooltip-class">
                            <span>Filter</span>
                          </ReactTooltip>
                        </span>
                        <Modal id="mileStoneModal" visible={isModalOpen}>
                          <button
                            type="button"
                            onClick={() => this.closeModal()}
                            className="close"
                            data-dismiss="modal"
                            style={{
                              color: '#ffffff',
                              opacity: '1',

                              marginLeft: '80%',
                            }}
                          >
                            &times;
                            </button>
                          {StatusList &&
                            StatusList.map((status, key) => (
                              <div key={`deliverable${key}`}
                                className="row"
                                style={{ marginLeft: '8px', display: 'flex' }}
                              >
                                <input
                                  type="checkbox"
                                  className="modalSlider"
                                  id={`status${key}`}
                                  checked={status.checked}
                                  onChange={event =>
                                    this.statusFilter(event, status, key)}
                                />
                                <label
                                  id={`statusLabel${key}`}
                                  htmlFor="modalSlider"
                                  style={{ marginTop: '-6px' }}
                                >
                                  {status.statusName === null
                                    ? '(Blanks)'
                                    : status.statusName === 'select_all'
                                      ? statusCodes[status.statusName]
                                      : statusCodes[status.statusName]}
                                </label>
                              </div>
                            ))}
                        </Modal>
                      </th>
                    </tr>
                  </thead>
                  {milestonesData &&
                    milestonesData.length > 0 ?
                    <tbody>
                      {
                        (displayFilteredData
                          ? (milestonesData = filteredData)
                          : milestonesData, milestonesData.map(
                            (option, index) => (
                              <tr key={`delIndex${index}`}>
                                <td>
                                  {' '}
                                  <input
                                    type="text"
                                    id={index}
                                    value={option.milestone}
                                    className="milestone-input_disabled"
                                    disabled={true}
                                    style={{ textAlignLast: "center" }}
                                  />
                                </td>
                                <td>
                                  <div style={{ display: 'flex' }}>
                                    <DatePicker
                                      disabled={true}
                                      value={
                                        option.milestoneDate !== ''
                                          ? Moment(option.milestoneDate).format(
                                            'DD-MMM-YYYY'
                                          )
                                          : ''
                                      }
                                      id={`milestoneDate${index}`}
                                      dateFormat="dd-MMM-yyyy"
                                      showMonthDropdown
                                      showYearDropdown
                                      useShortMonthInDropdown
                                      isCalenderFixed
                                      fixedHeight
                                      className="milestone-input_disabled"
                                      required={true}
                                    />
                                    <img
                                      src={calender}
                                      className="activity-img"
                                      style={{ height: '20px' }}
                                      alt="milestonedate"
                                    />
                                  </div>
                                </td>
                                <td
                                  style={{
                                    backgroundColor: option.disableObj &&
                                      option.disableObj['expDate']
                                      ? '#454545'
                                      : '',
                                    cursor: option.disableObj &&
                                      option.disableObj['expDate']
                                      ? 'not-allowed'
                                      : 'unset',
                                  }}
                                >
                                  <div
                                    style={{ display: 'flex' }}
                                    className="calenderDiv"
                                  >
                                    <DatePicker
                                      disabled={
                                        option.disableObj &&
                                        option.disableObj['expDate']
                                      }
                                      value={
                                        option.expDate !== ''
                                          ? Moment(option.expDate)
                                          : ''
                                      }
                                      minDate={
                                        new Date(
                                          Moment(new Date()).add(1, 'days')
                                        )
                                      }
                                      onChange={e => {
                                        this.handleDateChange(
                                          e,
                                          index,
                                          'expDate'
                                        );
                                      }}
                                      dateFormat="dd-MMM-yyyy"
                                      placeholderText="dd-mmm-yyyy"
                                      showMonthDropdown
                                      showYearDropdown
                                      useShortMonthInDropdown
                                      isCalenderFixed
                                      fixedHeight
                                      selected={
                                        option.expDate !== ''
                                          ? new Date(option.expDate)
                                          : ''
                                      }
                                      className={
                                        option.disableObj &&
                                          option.disableObj['expDate']
                                          ? 'form-control milestone-input_disabled'
                                          : 'form-control mileStone_input'
                                      }
                                      required={true}
                                    />
                                    <img
                                      src={calender}
                                      className="activity-img"
                                      style={{ height: '20px' }}
                                      alt="expdatemilestone"
                                    />
                                  </div>
                                </td>
                                <td
                                  style={{
                                    backgroundColor: option.disableObj &&
                                      option.disableObj['actualDate']
                                      ? '#454545'
                                      : '',
                                  }}
                                >
                                  <div
                                    style={{ display: 'flex' }}
                                    className="calenderDiv"
                                  >
                                    <DatePicker
                                      disabled={
                                        option.disableObj &&
                                        option.disableObj['actualDate']
                                      }
                                      value={
                                        option.actualDate !== ''
                                          ? Moment(option.actualDate)
                                          : ''
                                      }
                                      // minDate={new Date(Moment(new Date()).add(1, "days"))}
                                      maxDate={new Date()}
                                      onChange={e => {
                                        this.handleDateChange(
                                          e,
                                          index,
                                          'actualDate'
                                        );
                                      }}
                                      dateFormat="dd-MMM-yyyy"
                                      placeholderText="dd-mmm-yyyy"
                                      showMonthDropdown
                                      showYearDropdown
                                      useShortMonthInDropdown
                                      isCalenderFixed
                                      fixedHeight
                                      selected={
                                        option.actualDate !== ''
                                          ? new Date(option.actualDate)
                                          : ''
                                      }
                                      className={
                                        option.disableObj &&
                                          option.disableObj['actualDate']
                                          ? 'form-control milestone-input_disabled'
                                          : 'form-control mileStone_input'
                                      }
                                      required={true}
                                    />
                                    <img
                                      src={calender}
                                      style={{ height: '20px' }}
                                      className="activity-img"
                                      // style={{height: '20px'}}
                                      alt="actualdateIcon"
                                    />
                                  </div>
                                </td>

                                <td>
                                  <select
                                    className="mileStone_input_select"
                                    name="status"
                                    id="status"
                                    value={
                                      option.status !== null ? option.status : ''
                                    }
                                    onChange={event =>
                                      this.onStatusChange(
                                        event,
                                        'status',
                                        index
                                      )}
                                  >
                                    <option value="" selected disabled hidden>
                                      {/* {''} */}
                                      {
                                        option.status !== null
                                          ? option.status
                                          : ''}
                                    </option>
                                    <option value="CMP_ON_DT">
                                      Completed on date
                                  </option>
                                    <option value="CMP_AFTER_DUE_DT">
                                      Completed after due date
                                  </option>
                                    <option value="DELAYED">Delayed</option>
                                    <option value="SCHEDULED">Scheduled</option>
                                  </select>
                                </td>
                              </tr>
                            )
                          ))
                      }
                    </tbody> : <div className="noDataAvailable">No Milestones have been added yet</div>}
                </table>}
            </div>
            {selectedLevel === 'Deliverable' &&
              <Fragment>
                {this.state.saveInprogress
                  ? <div
                    className="col-sm-12 col-md-12 col-xs-12 saving_loader_mileStone"
                    style={{ marginTop: '90px' }}
                  >
                    Saving....
                    </div>
                  :
                  // <div
                  //     className="col-sm-12 col-md-12 col-xs-12 save-icon-align"
                  //     style={{marginTop: '90px'}}
                  //   >
                  <div className="col-sm-12 btn-row" style={{ marginTop: '2%', width: '100%', paddingLeft: '2%' }}>
                    <div className="cr-de-btn-div" style={{ paddingLeft: '0px' }} >
                      <button
                        style={{ width: '85px', cursor: SessionStorage.read("accessType") === "Read" ? "not-allowed" : 'pointer' }}
                        disabled={SessionStorage.read("accessType") === "Read" ? true : false}
                        onClick={SessionStorage.read("accessType") === "Read" ? 'return false;' : this.saveMileStoneDeliverable}
                        className="btn btn-primary activity-img">Save</button>
                    </div>
                  </div>
                  // <img
                  //   src={saveIco}
                  //   alt="saveIconAlt"
                  //   className="activity-img"
                  //   style={{cursor: SessionStorage.read("accessType") === "Read" ?"not-allowed":'pointer'}}
                  //   onClick={SessionStorage.read("accessType") === "Read" ?'return false;':this.saveMileStoneDeliverable}
                  // />
                  // </div>
                }
              </Fragment>}
          </div>
        </div>
      </div>
    );
  }
}

export default withRouter(MileStonesHome);
