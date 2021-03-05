import React, { Component } from "react";
import { observer, inject } from "mobx-react";
import { withRouter } from "react-router-dom";
import BenefitActualTable from "../../components/BenefitActualTable/BenefitActualTable";
import BenefitTargetTable from "../../components/BenefitTargetTable/BenefitTargetTable";
import { toast } from 'react-toastify';
import NotificationMessage from '../../components/NotificationMessage/NotificationMessage';
import '../DevelopBusinessCaseComponents/KpiTable.css';
import Moment from 'moment';
import ReactTooltip from 'react-tooltip'
import 'moment-timezone';
import DatePicker from "react-datepicker";
import expandIco from "../../assets/project/fvdt/expand.svg";
import nonFinancial from "../../assets/project/fvdt/info-Icon.svg";
// import saveIcon from "../../assets/project/fvdt/save.svg";
import saveIcon from "../../assets/project/fvdt/saveIcon.svg";
import infoIcon from "../../assets/project/iActuals/info.svg";
import NumberFormat from 'react-number-format';
// import ToggleSwitch from '../ToggleSwitch/ToggleSwitch';
import calendarIcon from "../../assets/project/fvdt/calendar.svg";
import CustomConfirmModal from '../../components/CustomConfirmModal/CustomConfirmModal';
var SessionStorage = require('store/storages/sessionStorage');

@inject('kpiBenefitsStore', "benefitActualsStore", "investmentActualsStore")
@observer
class BenefitActualsHome extends Component {
  yearArrayLength;
  constructor(props) {
    super(props);
    this.state = {
      benefitArray: [],
      paramArray: [],
      addCommonParam: false,
      businessFrequency: false,
      errorIndexArr: [],
      currentYear: 0,
      formattedDate: '',
      // dateValue: "",
      individualStartDate: 0,
      dateValue: "",
      freqArray: [],
      actualfreqArray: [],
      frequencyCheck: false,
      paramString: '',
      loadTable: false,
      loadSave: false,
      newColumnAdded: false,
      collapseAllTarget: false,
      collapseAllActual: false,

      customFreqBenefitActualsModalVisible: false,
      customFreqBenefitActualsModalTitle: '',
    }
    this.yearArray = [];
    this.onKPIBenefitSaveClick = this.onKPIBenefitSaveClick.bind(this)
    this.updateKpiBenefitArray = this.updateKpiBenefitArray.bind(this);
    this.setYearArrayLength = this.setYearArrayLength.bind(this);
    this.calculateTotalValuesOnLoad = this.calculateTotalValuesOnLoad.bind(this);
    this.delinkKPIs = this.delinkKPIs.bind(this);
    this.saveKPIBenefits = this.saveKPIBenefits.bind(this);
    this.onMFBlur = this.onMFBlur.bind(this);
    this.onFocusMF = this.onFocusMF.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.setBusinessFrequency = this.setBusinessFrequency.bind(this);
    this.addColoumnHandler = this.addColoumnHandler.bind(this);
    this.addTargetColoumnHandler = this.addTargetColoumnHandler.bind(this);
    this.handleIndividualTargetDateChange = this.handleIndividualTargetDateChange.bind(this);
    this.calculatedates = this.calculatedates.bind(this);
    this.onchangeKPIFrequencyData = this.onchangeKPIFrequencyData.bind(this);
    this.setFrequencyNumber = this.setFrequencyNumber.bind(this);
    this.handleFrequencyDateChange = this.handleFrequencyDateChange.bind(this);
    this.deleteTargetColumnHandler = this.deleteTargetColumnHandler.bind(this);
    this.deleteColumnHandler = this.deleteColumnHandler.bind(this);
    this.openBenActualsFreqConfirmModal = this.openBenActualsFreqConfirmModal.bind(this);
    this.closeBenActualsFreqConfirmModalHandler = this.closeBenActualsFreqConfirmModalHandler.bind(this);
  }

  handleChange = (value) => {
    try {
      const { benefitActualsStore } = this.props;
      const { benefitArray } = this.state;
      let benefitsArr = benefitArray;
      let formattedDate = value !== null ? Moment(value).format('YYYY-MM-DD') : '';
      benefitsArr.startDate = formattedDate;
      this.setState({
        dateValue: value,
        formattedDate: formattedDate,
        benefitArray: benefitsArr
      },
        () => {
          benefitActualsStore.startDate = formattedDate;
        }
      );

      this.calculatedates(value);
      this.calculateFrequencyLevelDate(value);


    } catch (error) {
    }

    this.calculatedates(value);
    this.calculateFrequencyLevelDate(value);
  }

  calculateFrequencyLevelDate = (value) => {
    const { benefitArray } = this.state;
    let BenefitArr = benefitArray
    let formattedDate = Moment(value).format('YYYY-MM-DD')
    for (let i = 0; i < BenefitArr[0].targetBenefits.paramDto.length; i++) {
      for (let j = 0; j < BenefitArr[0].targetBenefits.paramDto[i].paramValues.length; j++) {
        for (let k = 0; k < BenefitArr[0].targetBenefits.paramDto[i].paramValues[j].paramFreqData.length; k++) {
          switch (benefitArray[0].frequency) {
            case 'Quarterly':
              if (j === 0 && k === 0) {
                BenefitArr[0].targetBenefits.paramDto[i].paramValues[j].paramFreqData[k].startDate = formattedDate
                formattedDate = BenefitArr[0].targetBenefits.paramDto[i].paramValues[j].paramFreqData[k].startDate
              } else {
                BenefitArr[0].targetBenefits.paramDto[i].paramValues[j].paramFreqData[k].startDate = Moment(formattedDate).add(1, 'quarter').format('YYYY-MM-DD')
                formattedDate = BenefitArr[0].targetBenefits.paramDto[i].paramValues[j].paramFreqData[k].startDate
              }
              break;
            case 'Monthly':
              if (j === 0 && k === 0) {
                BenefitArr[0].targetBenefits.paramDto[i].paramValues[j].paramFreqData[k].startDate = formattedDate
                formattedDate = BenefitArr[0].targetBenefits.paramDto[i].paramValues[j].paramFreqData[k].startDate
              } else {
                BenefitArr[0].targetBenefits.paramDto[i].paramValues[j].paramFreqData[k].startDate = Moment(formattedDate).add(1, 'month').format('YYYY-MM-DD')
                formattedDate = BenefitArr[0].targetBenefits.paramDto[i].paramValues[j].paramFreqData[k].startDate
              }
              break;
            case 'Fortnightly':
              if (j === 0 && k === 0) {
                BenefitArr[0].targetBenefits.paramDto[i].paramValues[j].paramFreqData[k].startDate = formattedDate
                formattedDate = BenefitArr[0].targetBenefits.paramDto[i].paramValues[j].paramFreqData[k].startDate
              } else {
                BenefitArr[0].targetBenefits.paramDto[i].paramValues[j].paramFreqData[k].startDate = Moment(formattedDate).add(14, 'days').format('YYYY-MM-DD')
                formattedDate = BenefitArr[0].targetBenefits.paramDto[i].paramValues[j].paramFreqData[k].startDate
              }
              break;
            default: break;
          }

        }
      }
    }
    formattedDate = Moment(value).format('YYYY-MM-DD')
    for (let i = 0; i < BenefitArr[0].actualBenefits.paramDto.length; i++) {
      for (let j = 0; j < BenefitArr[0].actualBenefits.paramDto[i].paramValues.length; j++) {
        for (let k = 0; k < BenefitArr[0].actualBenefits.paramDto[i].paramValues[j].paramFreqData.length; k++) {
          switch (benefitArray[0].frequency) {
            case 'Quarterly':
              if (j === 0 && k === 0) {
                BenefitArr[0].actualBenefits.paramDto[i].paramValues[j].paramFreqData[k].startDate = formattedDate
                formattedDate = BenefitArr[0].actualBenefits.paramDto[i].paramValues[j].paramFreqData[k].startDate
              } else {
                BenefitArr[0].actualBenefits.paramDto[i].paramValues[j].paramFreqData[k].startDate = Moment(formattedDate).add(1, 'quarter').format('YYYY-MM-DD')
                formattedDate = BenefitArr[0].actualBenefits.paramDto[i].paramValues[j].paramFreqData[k].startDate
              }
              break;
            case 'Monthly':
              if (j === 0 && k === 0) {
                BenefitArr[0].actualBenefits.paramDto[i].paramValues[j].paramFreqData[k].startDate = formattedDate
                formattedDate = BenefitArr[0].actualBenefits.paramDto[i].paramValues[j].paramFreqData[k].startDate
              } else {
                BenefitArr[0].actualBenefits.paramDto[i].paramValues[j].paramFreqData[k].startDate = Moment(formattedDate).add(1, 'month').format('YYYY-MM-DD')
                formattedDate = BenefitArr[0].actualBenefits.paramDto[i].paramValues[j].paramFreqData[k].startDate
              }
              break;
            case 'Fortnightly':
              if (j === 0 && k === 0) {
                BenefitArr[0].actualBenefits.paramDto[i].paramValues[j].paramFreqData[k].startDate = formattedDate
                formattedDate = BenefitArr[0].actualBenefits.paramDto[i].paramValues[j].paramFreqData[k].startDate
              } else {
                BenefitArr[0].actualBenefits.paramDto[i].paramValues[j].paramFreqData[k].startDate = Moment(formattedDate).add(14, 'days').format('YYYY-MM-DD')
                formattedDate = BenefitArr[0].actualBenefits.paramDto[i].paramValues[j].paramFreqData[k].startDate
              }
              break;
            default:
              break;
          }
        }
      }
    }
    formattedDate = Moment(value).format('YYYY-MM-DD')
    for (let i = 0; i < BenefitArr[0].actualBenefits.kpiBenefits.length; i++) {
      for (let j = 0; j < BenefitArr[0].actualBenefits.kpiBenefits[i].frequencyBenfits.length; j++) {
        switch (benefitArray[0].frequency) {
          case 'Quarterly':
            if (i === 0 && j === 0) {
              BenefitArr[0].actualBenefits.kpiBenefits[i].frequencyBenfits[j].startDate = formattedDate
              formattedDate = BenefitArr[0].actualBenefits.kpiBenefits[i].frequencyBenfits[j].startDate
            } else {
              BenefitArr[0].actualBenefits.kpiBenefits[i].frequencyBenfits[j].startDate = Moment(formattedDate).add(1, 'quarter').format('YYYY-MM-DD')
              formattedDate = BenefitArr[0].actualBenefits.kpiBenefits[i].frequencyBenfits[j].startDate
            }
            break;
          case 'Monthly':
            if (i === 0 && j === 0) {
              BenefitArr[0].actualBenefits.kpiBenefits[i].frequencyBenfits[j].startDate = formattedDate
              formattedDate = BenefitArr[0].actualBenefits.kpiBenefits[i].frequencyBenfits[j].startDate
            } else {
              BenefitArr[0].actualBenefits.kpiBenefits[i].frequencyBenfits[j].startDate = Moment(formattedDate).add(1, 'month').format('YYYY-MM-DD')
              formattedDate = BenefitArr[0].actualBenefits.kpiBenefits[i].frequencyBenfits[j].startDate
            } break;
          case 'Fortnightly':
            if (i === 0 && j === 0) {
              BenefitArr[0].actualBenefits.kpiBenefits[i].frequencyBenfits[j].startDate = formattedDate
              formattedDate = BenefitArr[0].actualBenefits.kpiBenefits[i].frequencyBenfits[j].startDate
            } else {
              BenefitArr[0].actualBenefits.kpiBenefits[i].frequencyBenfits[j].startDate = Moment(formattedDate).add(14, 'days').format('YYYY-MM-DD')
              formattedDate = BenefitArr[0].actualBenefits.kpiBenefits[i].frequencyBenfits[j].startDate
            } break;
          default:
            break;
        }

      }
    }
    formattedDate = Moment(value).format('YYYY-MM-DD')
    for (let i = 0; i < BenefitArr[0].targetBenefits.kpiBenefits.length; i++) {
      for (let j = 0; j < BenefitArr[0].targetBenefits.kpiBenefits[i].frequencyBenfits.length; j++) {
        switch (benefitArray[0].frequency) {
          case 'Quarterly':
            if (i === 0 && j === 0) {
              BenefitArr[0].targetBenefits.kpiBenefits[i].frequencyBenfits[j].startDate = formattedDate
              formattedDate = BenefitArr[0].targetBenefits.kpiBenefits[i].frequencyBenfits[j].startDate
            } else {
              BenefitArr[0].targetBenefits.kpiBenefits[i].frequencyBenfits[j].startDate = Moment(formattedDate).add(1, 'quarter').format('YYYY-MM-DD')
              formattedDate = BenefitArr[0].targetBenefits.kpiBenefits[i].frequencyBenfits[j].startDate
            }
            break;
          case 'Monthly':
            if (i === 0 && j === 0) {
              BenefitArr[0].targetBenefits.kpiBenefits[i].frequencyBenfits[j].startDate = formattedDate
              formattedDate = BenefitArr[0].targetBenefits.kpiBenefits[i].frequencyBenfits[j].startDate
            } else {
              BenefitArr[0].targetBenefits.kpiBenefits[i].frequencyBenfits[j].startDate = Moment(formattedDate).add(1, 'month').format('YYYY-MM-DD')
              formattedDate = BenefitArr[0].targetBenefits.kpiBenefits[i].frequencyBenfits[j].startDate
            }
            break;
          case 'Fortnightly':
            if (i === 0 && j === 0) {
              BenefitArr[0].targetBenefits.kpiBenefits[i].frequencyBenfits[j].startDate = formattedDate
              formattedDate = BenefitArr[0].targetBenefits.kpiBenefits[i].frequencyBenfits[j].startDate
            } else {
              BenefitArr[0].targetBenefits.kpiBenefits[i].frequencyBenfits[j].startDate = Moment(formattedDate).add(14, 'days').format('YYYY-MM-DD')
              formattedDate = BenefitArr[0].targetBenefits.kpiBenefits[i].frequencyBenfits[j].startDate
            }
            break;
          default:
            break;
        }

      }
    }
  }

  handleFrequencyDateChange = (yearValue, freqIndex, value) => {
    const { benefitArray } = this.state;
    let BenefitArr = benefitArray;
    let formattedDate = Moment(value).format('YYYY-MM-DD')
    for (let i = 0; i < BenefitArr[0].targetBenefits.paramDto.length; i++) {
      for (let j = 0; j < BenefitArr[0].targetBenefits.paramDto[i].paramValues.length; j++) {
        for (let k = 0; k < BenefitArr[0].targetBenefits.paramDto[i].paramValues[j].paramFreqData.length; k++) {
          if (yearValue === j + 1 && freqIndex === k) {
            BenefitArr[0].targetBenefits.paramDto[i].paramValues[j].paramFreqData[k].startDate = formattedDate
          }
          if (yearValue === j + 1 && BenefitArr[0].targetBenefits.paramDto[i].paramValues[j].paramFreqData.length - 1 === freqIndex) {
            BenefitArr[0].targetBenefits.paramDto[i].paramValues[j].startDate = formattedDate
          }
        }
      }
    }
    for (let k = 0; k < BenefitArr[0].targetBenefits.kpiBenefits.length; k++) {
      for (let f = 0; f < BenefitArr[0].targetBenefits.kpiBenefits[k].frequencyBenfits.length; f++) {
        if (yearValue === k + 1 && freqIndex === f) {
          BenefitArr[0].targetBenefits.kpiBenefits[k].frequencyBenfits[f].startDate = formattedDate;
        }
        if (yearValue === k + 1 && BenefitArr[0].targetBenefits.kpiBenefits[k].frequencyBenfits.length - 1 === freqIndex) {
          BenefitArr[0].targetBenefits.kpiBenefits[k].startDate = formattedDate
        }
      }
    }
    for (let i = 0; i < BenefitArr[0].actualBenefits.paramDto.length; i++) {
      for (let j = 0; j < BenefitArr[0].actualBenefits.paramDto[i].paramValues.length; j++) {
        for (let k = 0; k < BenefitArr[0].actualBenefits.paramDto[i].paramValues[j].paramFreqData.length; k++) {
          if (yearValue === j + 1 && freqIndex === k) {
            BenefitArr[0].actualBenefits.paramDto[i].paramValues[j].paramFreqData[k].startDate = formattedDate
          }
          if (yearValue === j + 1 && BenefitArr[0].actualBenefits.paramDto[i].paramValues[j].paramFreqData.length - 1 === freqIndex) {
            BenefitArr[0].actualBenefits.paramDto[i].paramValues[j].startDate = formattedDate
          }
        }
      }
    }
    for (let k = 0; k < BenefitArr[0].actualBenefits.kpiBenefits.length; k++) {
      for (let f = 0; f < BenefitArr[0].actualBenefits.kpiBenefits[k].frequencyBenfits.length; f++) {
        if (yearValue === k + 1 && freqIndex === f) {
          BenefitArr[0].actualBenefits.kpiBenefits[k].frequencyBenfits[f].startDate = formattedDate;
        }
        if (yearValue === k + 1 && BenefitArr[0].actualBenefits.kpiBenefits[k].frequencyBenfits.length - 1 === freqIndex) {
          BenefitArr[0].actualBenefits.kpiBenefits[k].startDate = formattedDate
        }
      }
    }
    this.setState({
      benefitArray: BenefitArr
    })
  }
  handleIndividualTargetDateChange = (yearValue, value) => {
    const { benefitArray } = this.state;
    let BenefitArr = benefitArray
    let formattedDate = Moment(value).format('YYYY-MM-DD')
    for (let i = 0; i < BenefitArr[0].targetBenefits.paramDto.length; i++) {
      for (let j = 0; j < BenefitArr[0].targetBenefits.paramDto[i].paramValues.length; j++) {
        if (yearValue === j + 1) {
          BenefitArr[0].targetBenefits.paramDto[i].paramValues[j].startDate = formattedDate
        }
        // if (yearValue < j + 1) {
        //   let addedYear = ((j + 1) - yearValue)
        //   BenefitArr[0].targetBenefits.paramDto[i].paramValues[j].startDate = Moment(formattedDate).add(addedYear, 'year').format('YYYY-MM-DD') //add years
        // }
      }
    }
    for (let k = 0; k < BenefitArr[0].targetBenefits.kpiBenefits.length; k++) {
      if (yearValue === k + 1) {
        BenefitArr[0].targetBenefits.kpiBenefits[k].startDate = formattedDate;
      }
      // if (yearValue < k + 1) {
      //   let addedYear = ((k + 1) - yearValue)
      //   BenefitArr[0].targetBenefits.kpiBenefits[k].startDate = Moment(formattedDate).add(addedYear, 'year').format('YYYY-MM-DD') //add years

      // }
    }
    for (let i = 0; i < BenefitArr[0].actualBenefits.paramDto.length; i++) {
      for (let j = 0; j < BenefitArr[0].actualBenefits.paramDto[i].paramValues.length; j++) {
        if (yearValue === j + 1) {
          BenefitArr[0].actualBenefits.paramDto[i].paramValues[j].startDate = formattedDate
        }
        // if (yearValue < j + 1) {
        //   let addedYear = ((j + 1) - yearValue)
        //   BenefitArr[0].actualBenefits.paramDto[i].paramValues[j].startDate = Moment(formattedDate).add(addedYear, 'year').format('YYYY-MM-DD') //add years

        // }

      }
    }
    for (let k = 0; k < BenefitArr[0].actualBenefits.kpiBenefits.length; k++) {
      if (yearValue === k + 1) {
        BenefitArr[0].actualBenefits.kpiBenefits[k].startDate = formattedDate;
      }
      // if (yearValue < k + 1) {
      //   let addedYear = ((k + 1) - yearValue)
      //   BenefitArr[0].actualBenefits.kpiBenefits[k].startDate = Moment(formattedDate).add(addedYear, 'year').format('YYYY-MM-DD') //add years

      // }
    }
    this.setState({
      benefitArray: BenefitArr
    })
  }

  calculatedates = (dateValue) => {
    const { benefitArray } = this.state;
    let benefitsArray = benefitArray;
    const periods = (
      benefitsArray[0].targetBenefits.paramDto[0].paramValues.length > benefitsArray[0].actualBenefits.paramDto[0].paramValues.length ?
        benefitsArray[0].targetBenefits.paramDto[0].paramValues.length :
        benefitsArray[0].actualBenefits.paramDto[0].paramValues.length
    )
    let tempDateArr = [];
    let tempDateArray = [];
    tempDateArr.push(Moment(dateValue).format('YYYY-MM-DD'))
    for (let i = 0; i <= (periods); i++) {
      const newDate = Moment(tempDateArr[i]).add(1, 'year').format('YYYY-MM-DD')
      tempDateArr.push(newDate)
    }
    let dailyFrequency = tempDateArr
    for (let i = 0; i < dailyFrequency.length; i++) {
      let dateNew = new Date(dailyFrequency[i]);
      const new_date = Moment(dateNew).format('DD-MMM-YYYY');
      tempDateArray.push(new_date);

    }
    this.setState({
      targetDates: tempDateArray
    })
    for (let i = 0; i < benefitsArray[0].actualBenefits.paramDto.length; i++) {
      for (let j = 0; j < benefitsArray[0].actualBenefits.paramDto[i].paramValues.length; j++) {
        benefitsArray[0].actualBenefits.paramDto[i].paramValues[j].startDate = tempDateArr[j]
      }
    }
    for (let k = 0; k < benefitsArray[0].actualBenefits.kpiBenefits.length; k++) {
      benefitsArray[0].actualBenefits.kpiBenefits[k].startDate = tempDateArr[k]
    }
    for (let i = 0; i < benefitsArray[0].targetBenefits.paramDto.length; i++) {
      for (let j = 0; j < benefitsArray[0].targetBenefits.paramDto[i].paramValues.length; j++) {
        benefitsArray[0].targetBenefits.paramDto[i].paramValues[j].startDate = tempDateArr[j]
      }
    }
    for (let k = 0; k < benefitsArray[0].targetBenefits.kpiBenefits.length; k++) {
      benefitsArray[0].targetBenefits.kpiBenefits[k].startDate = tempDateArr[k]
    }
  }

  addTargetColoumnHandler = () => {
    const { KPIBenefitsArray, benefitActualsStore } = this.props;
    let kpiArray = [];
    let startDateoflastYear = '';
    let startDateofNewYear = '';
    if (KPIBenefitsArray[0].targetBenefits.paramDto[0].paramValues[KPIBenefitsArray[0].targetBenefits.paramDto[0].paramValues.length - 1].startDate) {
      startDateoflastYear = KPIBenefitsArray[0].targetBenefits.paramDto[0].paramValues[KPIBenefitsArray[0].targetBenefits.paramDto[0].paramValues.length - 1].startDate;
      startDateofNewYear = Moment(new Date(startDateoflastYear)).add(1, 'year').format('YYYY-MM-DD');
    }

    //// Benefit Target
    KPIBenefitsArray[0].targetBenefits.paramDto.map((param) => {
      if (param.paramValues.length <= KPIBenefitsArray[0].targetBenefits.paramDto[0].paramValues.length) {
        let paramFreqData = JSON.parse(JSON.stringify(param.paramValues[param.paramValues.length - 1].paramFreqData))
        paramFreqData && paramFreqData.map((param) => {
          param.paramDataId = null
          param.startDate = Moment(new Date(param.startDate)).add(1, 'year').format('YYYY-MM-DD');
        })
        const newParamObj = {
          paramDataId: null,
          targetValue: JSON.parse(JSON.stringify(param.paramValues[param.paramValues.length - 1].targetValue)),
          year: (param.paramValues.length + 1),//6
          activeFlag: 'Y',
          startDate: (startDateoflastYear !== "" ? startDateofNewYear : ''),
          paramFreqData: [...paramFreqData]
        };
        param.paramValues.push(newParamObj);
      }
      if (param.paramName === "KPI Target") {
        param.paramValues.map((value) => {
          kpiArray.push(value);
          return true;
        });
      }
      return true;
    });

    /// kpi benefits
    let frequencyBenfits = KPIBenefitsArray[0].targetBenefits.kpiBenefits[KPIBenefitsArray[0].targetBenefits.kpiBenefits.length - 1].frequencyBenfits;
    frequencyBenfits && frequencyBenfits.map((param) => {
      param.paramDataId = null
      param.startDate = Moment(new Date(param.startDate)).add(1, 'year').format('YYYY-MM-DD');
    })
    const newBenefitObj = {
      kpiBenefitId: null,
      targetValue: KPIBenefitsArray[0].targetBenefits.kpiBenefits[KPIBenefitsArray[0].targetBenefits.kpiBenefits.length - 1].targetValue,
      year: (KPIBenefitsArray[0].targetBenefits.kpiBenefits.length + 1),
      startDate: (startDateoflastYear !== "" ? startDateofNewYear : ''),
      frequencyBenfits: JSON.parse(JSON.stringify(frequencyBenfits)),
      hasTargetError: KPIBenefitsArray[0].targetBenefits.kpiBenefits[KPIBenefitsArray[0].targetBenefits.kpiBenefits.length - 1].hasTargetError
    }

    KPIBenefitsArray[0].targetBenefits.kpiBenefits.push(newBenefitObj);
    let startDateofActualslastYear = '';
    let startDateofActualsNewYear = '';

    kpiArray = [];
    if (KPIBenefitsArray[0].actualBenefits.paramDto[0].paramValues[KPIBenefitsArray[0].actualBenefits.paramDto[0].paramValues.length - 1].startDate) {
      startDateofActualslastYear = KPIBenefitsArray[0].actualBenefits.paramDto[0].paramValues[KPIBenefitsArray[0].actualBenefits.paramDto[0].paramValues.length - 1].startDate;
      startDateofActualsNewYear = Moment(new Date(startDateofActualslastYear)).add(1, 'year').format('YYYY-MM-DD');
    }

    KPIBenefitsArray[0].actualBenefits.paramDto.map((param) => {
      if (param.paramValues.length <= KPIBenefitsArray[0].actualBenefits.paramDto[0].paramValues.length) {
        let paramFreqData = JSON.parse(JSON.stringify(param.paramValues[param.paramValues.length - 1].paramFreqData))
        paramFreqData && paramFreqData.map((param) => {
          param.paramDataId = null
          param.startDate = Moment(new Date(param.startDate)).add(1, 'year').format('YYYY-MM-DD');
        })
        const newActualParamObj = {
          paramDataId: null,
          actualValue: JSON.parse(JSON.stringify(param.paramValues[param.paramValues.length - 1].actualValue)),
          year: (param.paramValues.length + 1),//6
          activeFlag: 'Y',
          startDate: (startDateoflastYear !== "" ? startDateofNewYear : ''),
          paramFreqData: [...paramFreqData],

        };
        param.paramValues.push(newActualParamObj);
      }
      if (param.paramName === "KPI Actual") {
        param.paramValues.map((value) => {
          kpiArray.push(value);
          return true;
        });
      }
      // param.paramValues[param.paramValues.length - 1].actualValue.actualValue = param.paramValues[param.paramValues.length - 2].actualValue.actualValue;
      return true;
    });

    frequencyBenfits = KPIBenefitsArray[0].actualBenefits.kpiBenefits[KPIBenefitsArray[0].actualBenefits.kpiBenefits.length - 1].frequencyBenfits;
    frequencyBenfits && frequencyBenfits.map((param) => {
      param.paramDataId = null
      param.startDate = Moment(new Date(param.startDate)).add(1, 'year').format('YYYY-MM-DD');
    })
    const newActualBenefitObj = {
      kpiBenefitId: null,
      actualValue: KPIBenefitsArray[0].actualBenefits.kpiBenefits[KPIBenefitsArray[0].actualBenefits.kpiBenefits.length - 1].actualValue,
      year: (KPIBenefitsArray[0].actualBenefits.kpiBenefits.length + 1),
      startDate: (startDateofActualslastYear !== '' ? startDateofActualsNewYear : ''),
      frequencyBenfits: JSON.parse(JSON.stringify(frequencyBenfits)),
      hasTargetError: KPIBenefitsArray[0].targetBenefits.kpiBenefits[KPIBenefitsArray[0].targetBenefits.kpiBenefits.length - 1].hasTargetError
    };
    KPIBenefitsArray[0].actualBenefits.kpiBenefits.push(newActualBenefitObj);
    this.setState({
      benefitArray: [...this.props.KPIBenefitsArray],
      newColumnAdded: true,
    });
    this.buildFrequencyArray(benefitActualsStore.frequency);
  };

  deleteTargetColumnHandler = () => {
    const { KPIBenefitsArray, benefitActualsStore } = this.props;
    const { newColumnAdded } = this.state;
    if (!newColumnAdded) {
      benefitActualsStore.deleteExtraYear(this.yearArray.length)
        .then((response) => {
          if (response && !response.error && response.data.resultCode === 'OK') {
            this.showNotification('success', 'Data deleted successfully');
            return;
          }else if(response && !response.error && response.data.resultCode === 'KO'){
            this.showNotification('error', response.data.errorDescription);
            return;
          }
          this.showNotification('error', 'Sorry! something went wrong');
        });
    }
    KPIBenefitsArray[0].targetBenefits.kpiBenefits.pop();
    KPIBenefitsArray[0].targetBenefits.paramDto.map((param) => {
      param.paramValues.pop();

    });
    KPIBenefitsArray[0].actualBenefits.kpiBenefits.pop();
    KPIBenefitsArray[0].actualBenefits.paramDto.map((param) => {
      param.paramValues.pop();
    });

    this.setState({
      benefitArray: [...KPIBenefitsArray]
    });
    this.buildFrequencyArray(benefitActualsStore.frequency);
  }

  addColoumnHandler = () => {
    const { KPIBenefitsArray, benefitActualsStore } = this.props;
    let frequency = benefitActualsStore.frequency;
    let startDateofActualslastYear = "";
    let startDateofActualsNewYear = "";
    if (KPIBenefitsArray[0].actualBenefits.paramDto[0].paramValues[KPIBenefitsArray[0].actualBenefits.paramDto[0].paramValues.length - 1].startDate) {
      startDateofActualslastYear = KPIBenefitsArray[0].actualBenefits.paramDto[0].paramValues[KPIBenefitsArray[0].actualBenefits.paramDto[0].paramValues.length - 1].startDate;
      startDateofActualsNewYear = Moment(new Date(startDateofActualslastYear)).add(1, 'year').format('YYYY-MM-DD');
    }
    let paramFreqData = JSON.parse(JSON.stringify(KPIBenefitsArray[0].actualBenefits.paramDto[0].paramValues[KPIBenefitsArray[0].actualBenefits.paramDto[0].paramValues.length - 1].paramFreqData))
    const newParamObj = {
      paramDataId: null,
      actualValue: KPIBenefitsArray[0].actualBenefits.paramDto[0].paramValues[KPIBenefitsArray[0].actualBenefits.paramDto[0].paramValues.length - 1].actualValue,
      year: (KPIBenefitsArray[0].actualBenefits.paramDto[0].paramValues.length + 1),//6
      activeFlag: 'Y',
      startDate: (startDateofActualslastYear !== "" ? startDateofActualsNewYear : ''),
      paramFreqData: [...paramFreqData]
    }
    let frequencyBenfits = KPIBenefitsArray[0].actualBenefits.kpiBenefits[KPIBenefitsArray[0].actualBenefits.kpiBenefits.length - 1].frequencyBenfits;
    const newBenefitObj = {
      kpiBenefitId: null,
      actualValue: KPIBenefitsArray[0].actualBenefits.kpiBenefits[KPIBenefitsArray[0].actualBenefits.kpiBenefits.length - 1].actualValue,
      year: (KPIBenefitsArray[0].actualBenefits.kpiBenefits.length + 1),
      startDate: (startDateofActualslastYear !== "" ? startDateofActualsNewYear : ''),
      frequencyBenfits: frequencyBenfits,
    }

    KPIBenefitsArray[0].actualBenefits.kpiBenefits.push(newBenefitObj);
    KPIBenefitsArray[0].actualBenefits.paramDto.map((param) => {
      if (param.paramValues.length <= KPIBenefitsArray[0].actualBenefits.paramDto[0].paramValues.length) {
        param.paramValues.push(newParamObj);
      }
      param.paramValues[param.paramValues.length - 1].actualValue.actualValue = param.paramValues[param.paramValues.length - 2].actualValue.actualValue;
      this.buildFrequencyArray(frequency)
      return true
    })
    // target
    let startDateoflastYear = "";
    let startDateofNewYear = "";
    paramFreqData = JSON.parse(JSON.stringify(
      KPIBenefitsArray[0].targetBenefits.paramDto[0].paramValues[KPIBenefitsArray[0].targetBenefits.paramDto[0].paramValues.length - 1].paramFreqData
    ));
    if (KPIBenefitsArray[0].targetBenefits.paramDto[0].paramValues[KPIBenefitsArray[0].targetBenefits.paramDto[0].paramValues.length - 1].startDate) {
      startDateoflastYear = KPIBenefitsArray[0].targetBenefits.paramDto[0].paramValues[KPIBenefitsArray[0].targetBenefits.paramDto[0].paramValues.length - 1].startDate;
      startDateofNewYear = Moment(new Date(startDateoflastYear)).add(1, 'year').format('YYYY-MM-DD');
    }
    const newTargetParamObj = {
      paramDataId: null,
      targetValue: KPIBenefitsArray[0].actualBenefits.kpiBenefits[KPIBenefitsArray[0].actualBenefits.kpiBenefits.length - 1].targetValue,
      year: (KPIBenefitsArray[0].targetBenefits.paramDto[0].paramValues.length + 1),//6
      activeFlag: 'Y',
      startDate: (startDateoflastYear !== "" ? startDateofNewYear : ''),
      paramFreqData: [...paramFreqData]
    }
    frequencyBenfits = KPIBenefitsArray[0].targetBenefits.kpiBenefits[KPIBenefitsArray[0].targetBenefits.kpiBenefits.length - 1].frequencyBenfits;
    const newTargetBenefitObj = {
      kpiBenefitId: null,
      targetValue: KPIBenefitsArray[0].targetBenefits.kpiBenefits[KPIBenefitsArray[0].targetBenefits.kpiBenefits.length - 1].targetValue,
      year: (KPIBenefitsArray[0].targetBenefits.kpiBenefits.length + 1),
      startDate: (startDateoflastYear !== "" ? startDateofNewYear : ''),
      frequencyBenfits: frequencyBenfits,
    };

    KPIBenefitsArray[0].targetBenefits.kpiBenefits.push(newTargetBenefitObj);
    KPIBenefitsArray[0].targetBenefits.paramDto.map((param) => {

      if (param.paramValues.length <= KPIBenefitsArray[0].targetBenefits.paramDto[0].paramValues.length) {
        param.paramValues.push(newTargetParamObj);
      }
      param.paramValues[param.paramValues.length - 1].targetValue.actualValue = param.paramValues[param.paramValues.length - 2].targetValue.actualValue;
      this.buildFrequencyArray(frequency);
      return true;
    });

    this.setState({
      benefitArray: [...this.props.KPIBenefitsArray],
      newColumnAdded: true,
    });
  };

  deleteColumnHandler = () => {
    const { KPIBenefitsArray, benefitActualsStore } = this.props;
    const { newColumnAdded } = this.state;
    if (!newColumnAdded) {
      benefitActualsStore.deleteExtraYear(this.yearArray.length)
        .then((response) => {
          if (response && !response.error && response.data.resultCode === 'OK') {
            this.showNotification('success', 'Data deleted successfully');
            return;
          }else if(response && !response.error && response.data.resultCode === 'KO'){
            this.showNotification('error', response.data.errorDescription);
            return;
          }
          this.showNotification('error', 'Sorry! something went wrong');
        });
    }
    KPIBenefitsArray[0].targetBenefits.kpiBenefits.pop();
    KPIBenefitsArray[0].targetBenefits.paramDto.map((param) => {
      param.paramValues.pop();

    });
    KPIBenefitsArray[0].actualBenefits.kpiBenefits.pop();
    KPIBenefitsArray[0].actualBenefits.paramDto.map((param) => {
      param.paramValues.pop();
    });
    this.setState({
      benefitArray: [...KPIBenefitsArray]
    });
    this.buildFrequencyArray(benefitActualsStore.frequency);
  }


  onKPIBenefitSaveClick = (event) => {
    const { benefitActualsStore } = this.props;
    // if (!this.validateNewlyAddedCPAndMF()) {
    benefitActualsStore.focusedKpiId = benefitActualsStore.kpiId;
    this.saveKPIBenefits(event.target.id);
    this.setState({
      frequencyCheck: true
    })
    // }
    // else {
    //   this.showNotification('MFInvalidError');
    // }
  }

  buildActualInputObj(id) {
    const { benefitActualsStore } = this.props
    const { startDate } = benefitActualsStore;
    let benefitArray = [...benefitActualsStore.kpiBenefits];
    let multiplicationFactorInput = []
    let kpiBenefitCommonParams = []
    // let kpiBenefitInput = []
    let commonParamsDtos = []
    let globalParamsDtos = []
    let mfDtos = []
    let globalParams = []
    let benefitDtos = []
    for (let i = 0; i < benefitArray.length; i++) {
      if (benefitArray[i].kpiId === parseInt(id)) {
        for (let j = 0; j < benefitArray[i].actualBenefits.paramDto.length; j++) {
          if (benefitArray[i].actualBenefits.paramDto[j].paramType === 'MF') {
            mfDtos = []
            let frequencyValueIndex = 0
            for (let k = 0; k < benefitArray[i].actualBenefits.paramDto[j].paramValues.length; k++) {
              let paramFreqArray = []
              let pramaFreqData = benefitArray[i].actualBenefits.paramDto[j].paramValues[k].paramFreqData
              pramaFreqData.map((freq, index) => {
                frequencyValueIndex++
                let tempArray = {
                  "taParamDataId": freq.paramDataId,
                  "paramVal": (freq.actualValue !== null && freq.actualValue.actualValue !== "") ? freq.actualValue.actualValue : null,
                  "freqNum": frequencyValueIndex,
                  "startDate": (freq.startDate !== "" && freq.startDate !== "Invalid date" ? freq.startDate : null),
                }
                paramFreqArray.push(tempArray)
                return true
              })
              let mfDtosTemp = {
                "mfDataId": benefitArray[i].actualBenefits.paramDto[j].paramValues[k].paramDataId,
                "paramVal": ((benefitArray[i].actualBenefits.paramDto[j].paramValues[k].actualValue.actualValue !== "" ? (benefitArray[i].actualBenefits.paramDto[j].paramValues[k].actualValue.actualValue) : null)),
                "year": k + 1,
                "startDate": ((benefitArray[i].actualBenefits.paramDto[j].paramValues[k].startDate !== "" && benefitArray[i].actualBenefits.paramDto[j].paramValues[k].startDate !== "Invalid date") ? benefitArray[i].actualBenefits.paramDto[j].paramValues[k].startDate : null),
                "nonYearDataDto": paramFreqArray

              }
              mfDtos.push(mfDtosTemp)
            }
            let inputArray = {
              "paramId": benefitArray[i].actualBenefits.paramDto[j].paramId,
              "paramName": benefitArray[i].actualBenefits.paramDto[j].paramName,
              "paramUnit": benefitArray[i].actualBenefits.paramDto[j].unit,
              "activeFlag": benefitArray[i].actualBenefits.paramDto[j].activeFlag ? "N" : "Y",
              "isRuleParam": benefitArray[i].actualBenefits.paramDto[j].isRuleParam,
              "mfDtos": mfDtos
            }
            multiplicationFactorInput.push(inputArray)
          }
          else if (benefitArray[i].actualBenefits.paramDto[j].paramType === 'CP') {
            commonParamsDtos = []
            let frequencyValueIndex = 0
            for (let k = 0; k < benefitArray[i].actualBenefits.paramDto[0].paramValues.length; k++) {
              let paramFreqArray = []
              let pramaFreqData = benefitArray[i].actualBenefits.paramDto[j].paramValues[k].paramFreqData
              pramaFreqData.map((freq) => {
                frequencyValueIndex++
                let tempArray = {
                  "taParamDataId": freq.paramDataId,
                  "paramVal": (freq.actualValue !== null && freq.actualValue.actualValue !== "") ? freq.actualValue.actualValue : null,
                  "freqNum": frequencyValueIndex,
                  "startDate": (freq.startDate !== "" && freq.startDate !== "Invalid date" ? freq.startDate : null),
                }
                paramFreqArray.push(tempArray)
                return true
              })
              let CoDtosTemp = {
                "taParamDataId": benefitArray[i].actualBenefits.paramDto[j].paramValues[k].paramDataId,
                "paramVal": ((benefitArray[i].actualBenefits.paramDto[j].paramValues[k].actualValue.actualValue !== "" ? (benefitArray[i].actualBenefits.paramDto[j].paramValues[k].actualValue.actualValue) : null)),
                "year": k + 1,

                "startDate": (benefitArray[i].actualBenefits.paramDto[j].paramValues[k].startDate !== "" && benefitArray[i].actualBenefits.paramDto[j].paramValues[k].startDate !== "Invalid date") ? benefitArray[i].actualBenefits.paramDto[j].paramValues[k].startDate : null,
                "nonYearDataDto": paramFreqArray
              }
              commonParamsDtos.push(CoDtosTemp)
            }
            let inputArray = {
              "paramId": benefitArray[i].actualBenefits.paramDto[j].paramId,
              "paramName": benefitArray[i].actualBenefits.paramDto[j].paramName,
              "unit": benefitArray[i].actualBenefits.paramDto[j].unit,
              "isRuleParam": benefitArray[i].actualBenefits.paramDto[j].isRuleParam,
              "activeFlag": benefitArray[i].actualBenefits.paramDto[j].activeFlag ? "N" : "Y",
              "commonParamsDtos": commonParamsDtos
            }
            kpiBenefitCommonParams.push(inputArray)
          }
          else if (benefitArray[i].actualBenefits.paramDto[j].paramType === "GP_ACTUAL") {
            globalParamsDtos = []
            let frequencyValueIndex = 0
            for (let k = 0; k < benefitArray[i].actualBenefits.paramDto[j].paramValues.length; k++) {
              let paramFreqArray = []
              let pramaFreqData = benefitArray[i].actualBenefits.paramDto[j].paramValues[k].paramFreqData
              pramaFreqData.map((freq, index) => {
                frequencyValueIndex++
                let tempArray = {
                  "taParamDataId": freq.paramDataId,
                  "paramVal": (freq.actualValue !== null && freq.actualValue.actualValue !== "") ? freq.actualValue.actualValue : null,
                  "freqNum": frequencyValueIndex,
                  "startDate": (freq.startDate !== "" && freq.startDate !== "Invalid date" ? freq.startDate : null),

                }
                paramFreqArray.push(tempArray)
                return true
              })
              let globalParamsDtosTemp = {
                // "mfDataId": benefitArray[i].actualBenefits.paramDto[j].paramValues[k].paramDataId,
                "taParamDataId": benefitArray[i].actualBenefits.paramDto[j].paramValues[k].paramDataId,
                "paramVal": ((benefitArray[i].actualBenefits.paramDto[j].paramValues[k].actualValue.actualValue) !== "" ? (benefitArray[i].actualBenefits.paramDto[j].paramValues[k].actualValue.actualValue) : null),
                "year": k + 1,

                "startDate": (benefitArray[i].actualBenefits.paramDto[j].paramValues[k].startDate !== "" && benefitArray[i].actualBenefits.paramDto[j].paramValues[k].startDate !== "Invalid date") ? benefitArray[i].actualBenefits.paramDto[j].paramValues[k].startDate : null,
                "nonYearDataDto": paramFreqArray

              }
              globalParamsDtos.push(globalParamsDtosTemp)
            }
            let inputArray = {
              "paramId": benefitArray[i].actualBenefits.paramDto[j].paramId,
              "paramName": benefitArray[i].actualBenefits.paramDto[j].paramName,
              "paramUnit": benefitArray[i].actualBenefits.paramDto[j].unit,
              "isRuleParam": benefitArray[i].actualBenefits.paramDto[j].isRuleParam,

              "activeFlag": benefitArray[i].actualBenefits.paramDto[j].activeFlag ? "N" : "Y",
              "gpTADtos": globalParamsDtos
            }
            globalParams.push(inputArray)
          }
        }
      }
    }

    for (let i = 0; i < benefitArray.length; i++) {
      if (benefitArray[i].kpiId === parseInt(id)) {
        benefitDtos = []
        let frequencyValueIndex = 0
        for (let j = 0; j < benefitArray[i].actualBenefits.kpiBenefits.length; j++) {
          let paramFreqArray = []
          let pramaFreqData = benefitArray[i].actualBenefits.kpiBenefits[j].frequencyBenfits
          pramaFreqData.map((freq, index) => {
            frequencyValueIndex++
            let tempArray = {
              "paramVal": (freq.actualValue !== null && freq.actualValue.actualValue !== "") ? freq.actualValue : null,
              "taParamDataId": freq.kpiBenefitId,
              "freqNum": frequencyValueIndex,
              "startDate": (freq.startDate !== "" && freq.startDate !== "Invalid date" ? freq.startDate : null),
            }
            paramFreqArray.push(tempArray)
            return true
          })
          let benefitsTemp = {
            "taKpiBenefitId": benefitArray[i].actualBenefits.kpiBenefits[j].kpiBenefitId,
            "paramVal": ((benefitArray[i].actualBenefits.kpiBenefits[j].actualValue) !== "" ? (benefitArray[i].actualBenefits.kpiBenefits[j].actualValue) : null),
            "frequency": j + 1,
            "frequencyType": benefitActualsStore.frequency,
            // "activeFlag": benefitArray[i].actualBenefits.paramDto[j].activeFlag ? "N" : "Y",
            "startDate": ((benefitArray[i].actualBenefits.kpiBenefits[j].startDate !== "" && benefitArray[i].actualBenefits.kpiBenefits[j].startDate !== "Invalid date") ? benefitArray[i].actualBenefits.kpiBenefits[j].startDate : null),
            "nonYearKpiBenefitDataDtos": paramFreqArray,
          }
          benefitDtos.push(benefitsTemp)
        }
      }

    }


    let targetInput = {
      "mapId": SessionStorage.read('mapId'),
      "kpiId": parseInt(id),
      "frequency": benefitActualsStore.frequency,
      "startDate": ((benefitActualsStore.startDate !== "") ? benefitActualsStore.startDate : null),
      "benefitType": "Actual",
      "gpTargetActualDtos": globalParams,
      "multiplicationFactorDtos": multiplicationFactorInput,
      "kpiBenefitCommonParamDtos": kpiBenefitCommonParams,
      "kpiBenefitTADtos": benefitDtos,
    }
    benefitActualsStore.targetTypeInput = targetInput
    this.setState({
      targetTypeInput: targetInput
    })
  }

  buildTargetInputObj(id) {
    const { benefitActualsStore } = this.props
    let benefitArray = [...benefitActualsStore.kpiBenefits];
    let multiplicationFactorInput = []
    let kpiBenefitCommonParams = []
    let commonParamsDtos = []
    let globalParamsDtos = []
    let mfDtos = []
    let globalParams = []
    let benefitDtos = []
    for (let i = 0; i < benefitArray.length; i++) {
      if (benefitArray[i].kpiId === parseInt(id)) {
        for (let j = 0; j < benefitArray[i].targetBenefits.paramDto.length; j++) {
          if (benefitArray[i].targetBenefits.paramDto[j].paramType === 'MF') {
            mfDtos = []
            let freqIndexValue = 0;
            for (let k = 0; k < benefitArray[i].targetBenefits.paramDto[j].paramValues.length; k++) {
              let pramaFreqData = benefitArray[i].targetBenefits.paramDto[j].paramValues[k].paramFreqData
              let paramFreqArray = []
              pramaFreqData.map((freq, index) => {
                freqIndexValue++
                let tempArray = {
                  "taParamDataId": freq.paramDataId,
                  "paramVal": (freq.targetValue.actualValue !== "" ? freq.targetValue.actualValue : null),
                  "freqNum": freqIndexValue,
                  "startDate": (freq.startDate !== "" && freq.startDate !== "Invalid date" ? freq.startDate : null),
                }
                paramFreqArray.push(tempArray)
                return true
              })
              let mfDtosTemp = {
                "mfDataId": benefitArray[i].targetBenefits.paramDto[j].paramValues[k].paramDataId,
                "paramVal": ((benefitArray[i].targetBenefits.paramDto[j].paramValues[k].targetValue.actualValue) !== "" ? (benefitArray[i].targetBenefits.paramDto[j].paramValues[k].targetValue.actualValue) : null),
                "year": k + 1,

                "startDate": ((benefitArray[i].targetBenefits.paramDto[j].paramValues[k].startDate !== "" && benefitArray[i].targetBenefits.paramDto[j].paramValues[k].startDate !== "Invalid date") ? benefitArray[i].targetBenefits.paramDto[j].paramValues[k].startDate : null),
                "nonYearDataDto": paramFreqArray
              }
              mfDtos.push(mfDtosTemp)
            }
            let inputArray = {
              "paramId": benefitArray[i].targetBenefits.paramDto[j].paramId,
              "paramName": benefitArray[i].targetBenefits.paramDto[j].paramName,
              "paramUnit": benefitArray[i].targetBenefits.paramDto[j].unit,
              "activeFlag": benefitArray[i].targetBenefits.paramDto[j].activeFlag ? "N" : "Y",
              "isRuleParam": benefitArray[i].targetBenefits.paramDto[j].isRuleParam,
              "mfDtos": mfDtos
            }
            multiplicationFactorInput.push(inputArray)
          }
          else if (benefitArray[i].targetBenefits.paramDto[j].paramType === 'CP') {
            commonParamsDtos = []
            let freqIndexValue = 0;
            for (let k = 0; k < benefitArray[i].targetBenefits.paramDto[0].paramValues.length; k++) {

              let paramFreqArray = []
              let pramaFreqData = benefitArray[i].targetBenefits.paramDto[j].paramValues[k].paramFreqData
              pramaFreqData.map((freq, index) => {
                freqIndexValue++
                let tempArray = {
                  "taParamDataId": freq.paramDataId,
                  "paramVal": (freq.targetValue.actualValue !== "" ? freq.targetValue.actualValue : null),
                  "freqNum": freqIndexValue,

                  "startDate": (freq.startDate !== "" && freq.startDate !== "Invalid date" ? freq.startDate : null),
                }
                paramFreqArray.push(tempArray)
                return true
              })
              let CoDtosTemp = {
                "taParamDataId": benefitArray[i].targetBenefits.paramDto[j].paramValues[k].paramDataId,
                "paramVal": ((benefitArray[i].targetBenefits.paramDto[j].paramValues[k].targetValue.actualValue) !== "" ? (benefitArray[i].targetBenefits.paramDto[j].paramValues[k].targetValue.actualValue) : null),
                "year": k + 1,

                "startDate": ((benefitArray[i].targetBenefits.paramDto[j].paramValues[k].startDate !== "" && benefitArray[i].targetBenefits.paramDto[j].paramValues[k].startDate !== "Invalid date") ? benefitArray[i].targetBenefits.paramDto[j].paramValues[k].startDate : null),
                "nonYearDataDto": paramFreqArray
              }
              commonParamsDtos.push(CoDtosTemp)

            }
            let inputArray = {
              "paramId": benefitArray[i].targetBenefits.paramDto[j].paramId,
              "paramName": benefitArray[i].targetBenefits.paramDto[j].paramName,
              "unit": benefitArray[i].targetBenefits.paramDto[j].unit,
              "activeFlag": benefitArray[i].targetBenefits.paramDto[j].activeFlag ? "N" : "Y",
              "isRuleParam": benefitArray[i].targetBenefits.paramDto[j].isRuleParam,
              "commonParamsDtos": commonParamsDtos
            }
            kpiBenefitCommonParams.push(inputArray)
          }
          else if (benefitArray[i].targetBenefits.paramDto[j].paramType === 'GP_TARGET') {
            globalParamsDtos = []
            let freqIndexValue = 0;
            for (let k = 0; k < benefitArray[i].targetBenefits.paramDto[j].paramValues.length; k++) {
              let paramFreqArray = []
              let pramaFreqData = benefitArray[i].targetBenefits.paramDto[j].paramValues[k].paramFreqData
              pramaFreqData.map((freq, index) => {
                freqIndexValue++
                let tempArray = {
                  "taParamDataId": freq.paramDataId,
                  "paramVal": (freq.targetValue.actualValue !== "" ? freq.targetValue.actualValue : null),
                  "freqNum": freqIndexValue,

                  "startDate": (freq.startDate !== "" && freq.startDate !== "Invalid date" ? freq.startDate : null)
                }
                paramFreqArray.push(tempArray)
                return true
              })
              let globalParamsDtosTemp = {
                "taParamDataId": benefitArray[i].targetBenefits.paramDto[j].paramValues[k].paramDataId,
                "paramVal": ((benefitArray[i].targetBenefits.paramDto[j].paramValues[k].targetValue.actualValue) !== "" ? (benefitArray[i].targetBenefits.paramDto[j].paramValues[k].targetValue.actualValue) : null),
                "year": k + 1,

                "startDate": ((benefitArray[i].targetBenefits.paramDto[j].paramValues[k].startDate !== "" && benefitArray[i].targetBenefits.paramDto[j].paramValues[k].startDate !== "Invalid date") ? benefitArray[i].targetBenefits.paramDto[j].paramValues[k].startDate : null),
                "nonYearDataDto": paramFreqArray
              }
              globalParamsDtos.push(globalParamsDtosTemp)
            }
            let inputArray = {
              "paramId": benefitArray[i].targetBenefits.paramDto[j].paramId,
              "paramName": benefitArray[i].targetBenefits.paramDto[j].paramName,
              "paramUnit": benefitArray[i].targetBenefits.paramDto[j].unit,
              "activeFlag": benefitArray[i].targetBenefits.paramDto[j].activeFlag ? "N" : "Y",
              "isRuleParam": benefitArray[i].targetBenefits.paramDto[j].isRuleParam,
              "gpTADtos": globalParamsDtos
            }
            globalParams.push(inputArray)
          }
        }
      }
    }

    for (let i = 0; i < benefitArray.length; i++) {
      if (benefitArray[i].kpiId === parseInt(id)) {
        benefitDtos = []
        let frequencyValueIndex = 0
        for (let j = 0; j < benefitArray[i].targetBenefits.kpiBenefits.length; j++) {
          let paramFreqArray = []
          let pramaFreqData = benefitArray[i].targetBenefits.kpiBenefits[j].frequencyBenfits
          pramaFreqData.map((freq, index) => {
            frequencyValueIndex++
            let tempArray = {
              "paramVal": (freq.targetValue !== null && freq.targetValue !== "") ? freq.targetValue : null,
              "taParamDataId": freq.kpiBenefitId,
              "freqNum": frequencyValueIndex,
              "isRuleParam": freq.isRuleParam,
              "startDate": (freq.startDate !== "" && freq.startDate !== "Invalid date" ? freq.startDate : null),
            }
            paramFreqArray.push(tempArray)
            return true
          })
          let benefitsTemp = {
            "taKpiBenefitId": benefitArray[i].targetBenefits.kpiBenefits[j].kpiBenefitId,
            "paramVal": ((benefitArray[i].targetBenefits.kpiBenefits[j].targetValue) !== "" ? (benefitArray[i].targetBenefits.kpiBenefits[j].targetValue) : null),
            "frequency": j + 1,
            "frequencyType": benefitActualsStore.frequency,
            // "activeFlag": benefitArray[i].targetBenefits.paramDto[j].activeFlag ? "N" : "Y",
            "startDate": ((benefitArray[i].targetBenefits.kpiBenefits[j].startDate !== "" && benefitArray[i].targetBenefits.kpiBenefits[j].startDate !== "Invalid date") ? benefitArray[i].targetBenefits.kpiBenefits[j].startDate : null),
            "nonYearKpiBenefitDataDtos": paramFreqArray,

          }
          benefitDtos.push(benefitsTemp)
        }
      }

    }

    let targetInput = {
      "mapId": SessionStorage.read('mapId'),
      "kpiId": parseInt(id),
      "frequency": benefitActualsStore.frequency,
      "startDate": ((benefitActualsStore.startDate !== "") ? benefitActualsStore.startDate : null),
      "benefitType": "Target",
      "gpTargetActualDtos": globalParams,
      "multiplicationFactorDtos": multiplicationFactorInput,
      "kpiBenefitCommonParamDtos": kpiBenefitCommonParams,
      "kpiBenefitTADtos": benefitDtos,
    }
    benefitActualsStore.actualTypeInput = targetInput
    this.setState({
      actualTypeInput: targetInput
    })
  }

  saveKPIBenefits = (id) => {
    const { benefitActualsStore } = this.props
    this.buildTargetInputObj(id);
    this.buildActualInputObj(id);
    this.setState({
      loadTable: false,
      saveLoading:true
    })
    const { targetTypeInput, actualTypeInput } = benefitActualsStore;
    let payload = [targetTypeInput, actualTypeInput]
    benefitActualsStore.saveKpiBenefitActuals(payload)
      .then((response) => {
        if (response && !response.error) {
          if (response.data.resultCode === "OK") {
            this.props.loadKpiBenefitTree();
            let benefitArray = this.props.KPIBenefitsArray;
            this.setState({
              benefitArray: [...benefitArray],
              newColumnAdded: false,
              saveLoading:false
            }, () => {
              this.showNotification('sucrcess', 'KPI Benefits saved successfully')
              this.setState({
                loadTable: true,
              })
            })
          }

          else if (response.data.resultCode === "KO") {
            this.setState({
              saveLoading:false
            })
            this.showNotification('error', response.data.errorDescription)
          }
        }
        else {
          this.setState({
            saveLoading:false
          })
          this.showNotification('error', 'Save failed')
        }
      })
  }

  showNotification(type, message) {
    const { kpiBenefitsStore } = this.props;
    switch (type) {
      case 'success':
        toast.info(<NotificationMessage
          title="Success"
          bodytext={message}
          icon="success"
        />, {
          position: toast.POSITION.BOTTOM_RIGHT
        });
        break;
      case 'error':
        toast.error(<NotificationMessage
          title="Error"
          bodytext={message}
          icon="error"
        />, {
          position: toast.POSITION.BOTTOM_RIGHT
        });
        break;
      case 'kpiDuplicateErr':
        toast.error(<NotificationMessage
          title="Error"
          bodytext={kpiBenefitsStore.kpiBenifitsError}
          icon="error"
        />, {
          position: toast.POSITION.BOTTOM_RIGHT
        });
        break;
      default:
        break;
    }
  }
  calculateStartDatesonLoad() {
    const { KPIBenefitsArray } = this.props;
    if (KPIBenefitsArray[0].startDate !== "" && KPIBenefitsArray[0].targetBenefits.paramDto[0].paramValues[0].startDate !== "")
      KPIBenefitsArray[0].targetBenefits.paramDto.map((param, pIndex) => {
        param.paramValues.map((pyValue, yindex) => {
          if (yindex > 0) {
            var prevDate = KPIBenefitsArray[0].targetBenefits.paramDto[pIndex].paramValues[yindex - 1].startDate;
          }
          if (pyValue.startDate === "") {
            KPIBenefitsArray[0].targetBenefits.paramDto[pIndex].paramValues[yindex].startDate = Moment(prevDate).add(1, 'year').format('YYYY-MM-DD')
            KPIBenefitsArray[0].actualBenefits.paramDto[pIndex].paramValues[yindex].startDate = Moment(prevDate).add(1, 'year').format('YYYY-MM-DD')
            // blank screen issue fix - rever if required 
            // KPIBenefitsArray[0].targetBenefits.kpiBenefits[yindex].startDate = Moment(prevDate).add(1, 'year').format('YYYY-MM-DD')
            // KPIBenefitsArray[0].actualBenefits.kpiBenefits[yindex].startDate = Moment(prevDate).add(1, 'year').format('YYYY-MM-DD')
          }
          return true
        })
        return true
      })
  }

  componentDidMount() {
    SessionStorage.write('investmentsTab', false)
    let benefitArray = [...this.props.KPIBenefitsArray];
    this.setState({
      benefitArray: benefitArray,
      dateValue: benefitArray[0].startDate,
      selectedKpiObj: benefitArray[0],
      businessFrequency: benefitArray[0].frequency,
      benefitObjClone: { ...JSON.parse(JSON.stringify(this.props.KPIBenefitsArray[0])) },
      frequencyCheck: true
    });
    this.setBusinessFrequency(benefitArray[0].frequency, false)
    this.buildFrequencyArray(benefitArray[0].frequency)
    // this.handleChange(benefitArray[0].startDate)
    this.calculateStartDatesonLoad()

  }

  componentDidUpdate() {
    if (this.state.benefitArray !== "" && this.state.benefitArray !== this.props.KPIBenefitsArray) {
      this.setState({
        benefitArray: this.props.KPIBenefitsArray,
        dateValue: this.props.KPIBenefitsArray[0].startDate,
        selectedKpiObj: this.props.KPIBenefitsArray[0][0],
        businessFrequency: this.props.KPIBenefitsArray[0].frequency,
        benefitObjClone: { ...JSON.parse(JSON.stringify(this.props.KPIBenefitsArray[0])) },
        errorIndexArr: [],
        loadTable: true,
        collapseAllTarget: true,
        collapseAllActual: true,
        frequencyCheck: true

      })
      if (this.state.businessFrequency !== this.props.KPIBenefitsArray[0].frequency) {
        this.setBusinessFrequency(this.props.KPIBenefitsArray[0].frequency, false)
        this.buildFrequencyArray(this.props.KPIBenefitsArray[0].frequency)

      }
    }

    this.calculateStartDatesonLoad()

  }

  componentWillReceiveProps() {
    this.setState({
      benefitArray: this.props.KPIBenefitsArray,
      benefitObjClone: { ...JSON.parse(JSON.stringify(this.props.KPIBenefitsArray[0])) },
      dateValue: this.props.KPIBenefitsArray[0].startDate,
      errorIndexArr: []
    });

  }

  buildKpiBenefitsArray(kpiBenefitsArray, length) {
    for (let i = 1; i <= length; i++) {
      kpiBenefitsArray.push({
        benefitValue: 0,
        year: i
      })
    }
  }

  setYearArrayLength(yearArray) {
    this.yearArray = [...yearArray]
  }

  delinkKPIs = (event, param, index) => {
    const { kpiBenefitsStore, KPIBenefitsArray } = this.props;
    let kpiId = kpiBenefitsStore.kpiId
    let benefitArray = [...kpiBenefitsStore.kpiBenefits];
    if (window.confirm("Are you sure you want to delete?")) {
      if (this.doesParamExist(param)) {
        for (let i = 0; i < benefitArray.length; i++) {
          if (benefitArray[i].kpiId === kpiId) {
            for (let j = 0; j < benefitArray[i].paramDto.length; j++) {
              if (benefitArray[i].paramDto[j].paramId === parseInt(event.target.id)) {
                benefitArray[i].paramDto[j].activeFlag = "N";
                if (SessionStorage.read("demoUser") === "false") {
                  this.saveKPIBenefits(kpiId);
                }

              }
            }
          }
        }
      }
      else {
        KPIBenefitsArray[0].paramDto.splice(index, 1);
        this.setState({
          benefitArray: [...KPIBenefitsArray]
        })
      }
    }
  }

  calculateTotalValuesOnLoad(benefitArray) {
    const rowArr = benefitArray.onNewParamChange.paramDto.map(param => {
      return param.paramValues.map(paramValObj => {
        if (paramValObj) {
          return param.unit === '%' ? paramValObj.actualValue.actualValue / 100 : paramValObj.actualValue.actualValue;
        }
        return null;
      });
    }).slice(1);
    const transposeRowArr = (arr) => {
      let w = rowArr.length;
      let h = rowArr[0].length;
      let res = [];
      for (let i = 0; i < h; i++) {
        res[i] = [];
        for (let j = 0; j < w; j++) {
          res[i][j] = arr[j][i];
        }
      }
      return res;
    }
    const productArr = transposeRowArr(rowArr).map(column => column.reduce((currentVal, prod) => currentVal * prod));
    for (let [index, kpiBenefit] of benefitArray.actualBenefits.kpiBenefits.entries()) {
      kpiBenefit.actualValue =
        // productArr[index].toFixed(1);
        Number(Math.round(Number(productArr[index]) * 10) / 10).toFixed(1)
    }
  }


  updateKpiBenefitArray(benefitArray, index, parameterIndex, frequencyIndex) {
    if (frequencyIndex === undefined) {
      const paramColumnValueArray = benefitArray.targetBenefits.paramDto.map((indParam, index) => {
        return Number(indParam.paramValues[parameterIndex].targetValue.actualValue);
      }).slice(1);
      const paramUnitString = benefitArray.targetBenefits.paramDto.map((indParam, index) => {
        return indParam.unit;
      }).slice(1).reduce((unit, res) => unit + res);
      const benefitValue = Number(paramUnitString.split('%').length - 1 > 0 ?
        paramColumnValueArray.reduce((val, totalVal) => val * totalVal) / Math.pow(100, paramUnitString.split('%').length - 1).toFixed(1) :
        paramColumnValueArray.reduce((val, totalVal) => val * totalVal).toFixed(1));
      if (benefitArray.targetBenefits.kpiBenefits.length) {
        benefitArray.targetBenefits.kpiBenefits[parameterIndex].targetValue = benefitValue;
      } else {
        benefitArray.targetBenefits.kpiBenefits = [...this.yearArray.map(year => {
          return {
            benefitValue: benefitValue
          }
        })];
      }
    } else {
      const paramColumnValueArray = benefitArray.targetBenefits.paramDto.map((indParam, index) => {
        return Number(indParam.paramValues[parameterIndex].paramFreqData[frequencyIndex].targetValue.actualValue);
      }).slice(1);;
      const paramUnitString = benefitArray.targetBenefits.paramDto.map((indParam, index) => {
        return indParam.unit;
      }).slice(1).reduce((unit, res) => unit + res);
      const benefitValue = Number(paramUnitString.split('%').length - 1 > 0 ?
        paramColumnValueArray.reduce((val, totalVal) => val * totalVal) / Math.pow(100, paramUnitString.split('%').length - 1).toFixed(1) :
        paramColumnValueArray.reduce((val, totalVal) => val * totalVal).toFixed(1));
      if (benefitArray.targetBenefits.kpiBenefits.length) {
        benefitArray.targetBenefits.kpiBenefits[parameterIndex].frequencyBenfits[frequencyIndex].targetValue = benefitValue;
      } else {
        benefitArray.targetBenefits.kpiBenefits = [...this.yearArray.map(year => {
          return {
            benefitValue: benefitValue
          }
        })];
      }
    }
  }

  updateKpiBenefitArrayForActuals(benefitArray, index, parameterIndex, frequencyIndex) {
    if (frequencyIndex === undefined) {
      const paramColumnValueArray = benefitArray.actualBenefits.paramDto.map((indParam, index) => {
        return Number(indParam.paramValues[parameterIndex].actualValue.actualValue);
      }).slice(1);
      const paramUnitString = benefitArray.actualBenefits.paramDto.map((indParam, index) => {
        return indParam.unit;
      }).slice(1).reduce((unit, res) => unit + res);
      const benefitValue = Number(paramUnitString.split('%').length - 1 > 0 ?
        paramColumnValueArray.reduce((val, totalVal) => val * totalVal) / Math.pow(100, paramUnitString.split('%').length - 1).toFixed(1) :
        paramColumnValueArray.reduce((val, totalVal) => val * totalVal).toFixed(1));
      if (benefitArray.actualBenefits.kpiBenefits.length) {
        benefitArray.actualBenefits.kpiBenefits[parameterIndex].actualValue = benefitValue;
      } else {
        benefitArray.actualBenefits.kpiBenefits = [...this.yearArray.map(year => {
          return {
            benefitValue: benefitValue
          }
        })];
      }
    } else {
      //year 1
      let frequencyLength = benefitArray.actualBenefits.paramDto[index].paramValues[parameterIndex].paramFreqData.length
      if (frequencyIndex === frequencyLength - 1) {

        const paramColumnValueArray = benefitArray.actualBenefits.paramDto.map((indParam, index) => {
          return Number(indParam.paramValues[parameterIndex].actualValue.actualValue);
        }).slice(1);
        const paramUnitString = benefitArray.actualBenefits.paramDto.map((indParam, index) => {
          return indParam.unit;
        }).slice(1).reduce((unit, res) => unit + res);
        const benefitValue = Number(paramUnitString.split('%').length - 1 > 0 ?
          paramColumnValueArray.reduce((val, totalVal) => val * totalVal) / Math.pow(100, paramUnitString.split('%').length - 1).toFixed(1) :
          paramColumnValueArray.reduce((val, totalVal) => val * totalVal).toFixed(1));
        if (benefitArray.actualBenefits.kpiBenefits.length) {
          benefitArray.actualBenefits.kpiBenefits[parameterIndex].actualValue = benefitValue;
        } else {
          benefitArray.actualBenefits.kpiBenefits = [...this.yearArray.map(year => {
            return {
              benefitValue: benefitValue
            }
          })];
        }

      }
      //year1

      const paramColumnValueArray = benefitArray.actualBenefits.paramDto.map((indParam, index) => {
        if (indParam.paramValues[parameterIndex].paramFreqData[frequencyIndex].actualValue === null) {
          return 0
        } else {
          return Number(indParam.paramValues[parameterIndex].paramFreqData[frequencyIndex].actualValue.actualValue)
        }

      }).slice(1);
      const paramUnitString = benefitArray.actualBenefits.paramDto.map((indParam, index) => {
        return indParam.unit;
      }).slice(1).reduce((unit, res) => unit + res);
      const benefitValue = Number(paramUnitString.split('%').length - 1 > 0 ?
        paramColumnValueArray.reduce((val, totalVal) => val * totalVal) / Math.pow(100, paramUnitString.split('%').length - 1).toFixed(1) :
        paramColumnValueArray.reduce((val, totalVal) => val * totalVal).toFixed(1));
      if (benefitArray.actualBenefits.kpiBenefits.length) {
        benefitArray.actualBenefits.kpiBenefits[parameterIndex].frequencyBenfits[frequencyIndex].actualValue = benefitValue;
      } else {
        benefitArray.actualBenefits.kpiBenefits = [...this.yearArray.map(year => {
          return {
            benefitValue: benefitValue
          }
        })];
      }
    }
  }

  onMFBlur = (event, index, yearIndex, type) => {
    const { KPIBenefitsArray } = this.props;

    if (type === 'actual') {
      let value = KPIBenefitsArray[0].actualBenefits.paramDto[index].paramValues[yearIndex].actualValue.actualValue
      KPIBenefitsArray[0].actualBenefits.paramDto[index].paramValues[yearIndex].actualValue.formattedValue = value ?
        //  Number(value).toFixed(1)
        Number(Math.round(Number(value) * 10) / 10).toFixed(1)
        : null;
      this.setState({
        currentYear: yearIndex
      })
    }
    else {
      let value = KPIBenefitsArray[0].targetBenefits.paramDto[index].paramValues[yearIndex].targetValue.actualValue
      KPIBenefitsArray[0].targetBenefits.paramDto[index].paramValues[yearIndex].targetValue.formattedValue = value ?
        //  Number(value).toFixed(1)
        Number(Math.round(Number(value) * 10) / 10).toFixed(1)
        : null;
      this.setState({
        currentYear: yearIndex
      })
    }

  }
  onFocusMF = (event, index, yearIndex, type) => {
    const { KPIBenefitsArray } = this.props;
    if (type === 'actual') {
      let value = KPIBenefitsArray[0].actualBenefits.paramDto[index].paramValues[yearIndex].actualValue.actualValue
      KPIBenefitsArray[0].actualBenefits.paramDto[index].paramValues[yearIndex].actualValue.formattedValue = value ? value : null;
      this.setState({
        currentYear: yearIndex
      })
    } else {
      let value = KPIBenefitsArray[0].targetBenefits.paramDto[index].paramValues[yearIndex].targetValue.actualValue
      KPIBenefitsArray[0].targetBenefits.paramDto[index].paramValues[yearIndex].targetValue.formattedValue = value ? value : null;
      this.setState({
        currentYear: yearIndex
      })
    }
  }
  onchangeKPIFrequencyData = (event, index, yearIndex, frequencyIndex) => {
    const { KPIBenefitsArray } = this.props;
    let trend = (KPIBenefitsArray[0].kpiTrend).trim();
    let value = event.target.value.replace(/,/g, '')
    var decPos = value.indexOf('.');
    let kpiArray = []
    var substrLength = decPos === -1 ? value.length : 1 + decPos + 10,
      trimmedResult = value.substr(0, substrLength),
      finalValue = isNaN(trimmedResult) ? 0 : trimmedResult;
    let frequencyLength = KPIBenefitsArray[0].targetBenefits.paramDto[index].paramValues[yearIndex].paramFreqData.length
    KPIBenefitsArray[0].targetBenefits.paramDto[index].paramValues[yearIndex].paramFreqData[frequencyIndex].targetValue.actualValue = finalValue ? Number(finalValue) : null;
    KPIBenefitsArray[0].targetBenefits.paramDto[index].paramValues[yearIndex].paramFreqData[frequencyIndex].targetValue.formattedValue = finalValue ? Number(finalValue) : null;
    // if(KPIBenefitsArray[0].targetBenefits.paramDto[index].paramValues[yearIndex].paramFreqData.length-1 === frequencyIndex){
    //   KPIBenefitsArray[0].targetBenefits.paramDto[index].paramValues[yearIndex].targetValue.actualValue = finalValue ? Number(finalValue) : null;
    // KPIBenefitsArray[0].targetBenefits.paramDto[index].paramValues[yearIndex].targetValue.formattedValue = finalValue ? Number(finalValue) : null;
    // }

    // if (frequencyIndex === frequencyLength - 1) {
    //   KPIBenefitsArray[0].targetBenefits.paramDto[index].paramValues[yearIndex].targetValue.actualValue = KPIBenefitsArray[0].targetBenefits.paramDto[index].paramValues[yearIndex].paramFreqData[frequencyLength - 1].targetValue.actualValue;
    //   KPIBenefitsArray[0].targetBenefits.paramDto[index].paramValues[yearIndex].targetValue.formattedValue = KPIBenefitsArray[0].targetBenefits.paramDto[index].paramValues[yearIndex].paramFreqData[frequencyLength - 1].targetValue.formattedValue;
    // }
    if (KPIBenefitsArray[0].targetBenefits.paramDto[index].paramName === 'KPI Target' && frequencyIndex !== 0) {
      KPIBenefitsArray[0].targetBenefits.paramDto[index].paramValues[yearIndex].paramFreqData.map((value) => {
        kpiArray.push(value)
        return true
      })
      if (KPIBenefitsArray[0].targetBenefits.paramDto[index + 1].paramValues[yearIndex].paramFreqData[frequencyIndex].targetValue !== null) {
        KPIBenefitsArray[0].targetBenefits.paramDto[index + 1].paramValues[yearIndex].paramFreqData[frequencyIndex].targetValue.actualValue =
          (trend === "Increase" ?
            (finalValue === "" ? "" : ((kpiArray[frequencyIndex].targetValue.actualValue - KPIBenefitsArray[0].baseline) < 0 ? 0 : (kpiArray[frequencyIndex].targetValue.actualValue - KPIBenefitsArray[0].baseline))) :
            (finalValue === "" ? "" : ((KPIBenefitsArray[0].baseline - kpiArray[frequencyIndex].targetValue.actualValue) < 0 ? 0 : (KPIBenefitsArray[0].baseline - kpiArray[frequencyIndex].targetValue.actualValue)))
          )
      } else {
        KPIBenefitsArray[0].targetBenefits.paramDto[index + 1].paramValues[yearIndex].paramFreqData[frequencyIndex].targetValue = {
          "actualValue": (trend === "Increase" ?
            (finalValue === "" ? "" : ((kpiArray[frequencyIndex].targetValue.actualValue - KPIBenefitsArray[0].baseline) < 0 ? 0 : (kpiArray[frequencyIndex].targetValue.actualValue - KPIBenefitsArray[0].baseline))) :
            (finalValue === "" ? "" : ((KPIBenefitsArray[0].baseline - kpiArray[frequencyIndex].targetValue.actualValue) < 0 ? 0 : (KPIBenefitsArray[0].baseline - kpiArray[frequencyIndex].targetValue.actualValue)))
          ),
          "formattedValue": (trend === "Increase" ?
            (finalValue === "" ? "" : ((kpiArray[frequencyIndex].targetValue.actualValue - KPIBenefitsArray[0].baseline) < 0 ? 0 : (kpiArray[frequencyIndex].targetValue.actualValue - KPIBenefitsArray[0].baseline))) :
            (finalValue === "" ? "" : ((KPIBenefitsArray[0].baseline - kpiArray[frequencyIndex].targetValue.actualValue) < 0 ? 0 : (KPIBenefitsArray[0].baseline - kpiArray[frequencyIndex].targetValue.actualValue)))
          )
        }
      }

      if (KPIBenefitsArray[0].targetBenefits.paramDto[index].paramValues[yearIndex].paramFreqData.length - 1 === frequencyIndex) {
        KPIBenefitsArray[0].targetBenefits.paramDto[index + 1].paramValues[yearIndex].targetValue
          = KPIBenefitsArray[0].targetBenefits.paramDto[index + 1].paramValues[yearIndex].paramFreqData[frequencyIndex].targetValue

      }
    }

    if (KPIBenefitsArray[0].targetBenefits.paramDto[index].paramName === 'KPI Target' && frequencyIndex === 0) {
      // if (KPIBenefitsArray[0].actualBenefits.paramDto[index].paramName === 'KPI Actual' && frequencyIndex !== 0) {
      KPIBenefitsArray[0].targetBenefits.paramDto[index].paramValues[yearIndex].paramFreqData.map((value) => {
        kpiArray.push(value)
        return true
      })
      // }
      if (KPIBenefitsArray[0].targetBenefits.paramDto[index + 1].paramValues[yearIndex].paramFreqData[frequencyIndex].targetValue !== null) {
        KPIBenefitsArray[0].targetBenefits.paramDto[index + 1].paramValues[yearIndex].paramFreqData[frequencyIndex].targetValue.actualValue =
          (trend === "Increase" ?
            (finalValue === "" ? "" : ((kpiArray[0].targetValue.actualValue - KPIBenefitsArray[0].baseline) < 0 ? 0 : (kpiArray[0].targetValue.actualValue - KPIBenefitsArray[0].baseline))) :
            (finalValue === "" ? "" : ((KPIBenefitsArray[0].baseline - kpiArray[0].targetValue.actualValue) < 0 ? 0 : (KPIBenefitsArray[0].baseline - kpiArray[0].targetValue.actualValue)))
          )
      } else {
        KPIBenefitsArray[0].targetBenefits.paramDto[index + 1].paramValues[yearIndex].paramFreqData[frequencyIndex].targetValue = {
          "actualValue": (trend === "Increase" ?
            (finalValue === "" ? "" : ((kpiArray[0].targetValue.actualValue - KPIBenefitsArray[0].baseline) < 0 ? 0 : (kpiArray[0].targetValue.actualValue - KPIBenefitsArray[0].baseline))) :
            (finalValue === "" ? "" : ((KPIBenefitsArray[0].baseline - kpiArray[0].targetValue.actualValue) < 0 ? 0 : (KPIBenefitsArray[0].baseline - kpiArray[0].targetValue.actualValue)))
          ),
          "formattedValue": (trend === "Increase" ?
            (finalValue === "" ? "" : ((kpiArray[0].targetValue.actualValue - KPIBenefitsArray[0].baseline) < 0 ? 0 : (kpiArray[0].targetValue.actualValue - KPIBenefitsArray[0].baseline))) :
            (finalValue === "" ? "" : ((KPIBenefitsArray[0].baseline - kpiArray[0].targetValue.actualValue) < 0 ? 0 : (KPIBenefitsArray[0].baseline - kpiArray[0].targetValue.actualValue)))
          )
        }
      }
    }
    this.setState({
      loadTable: true
    })
    // this.updateKpiBenefitArray(KPIBenefitsArray[0], index, yearIndex, frequencyIndex)
  }

  onchangeKPIFrequencyDataActuals = (event, index, yearIndex, frequencyIndex) => {
    const { KPIBenefitsArray } = this.props;
    let trend = (KPIBenefitsArray[0].kpiTrend).trim();
    let value = event.target.value.replace(/,/g, '')
    var decPos = value.indexOf('.');
    let kpiArray = []
    var substrLength = decPos === -1 ? value.length : 1 + decPos + 10,
      trimmedResult = value.substr(0, substrLength),
      finalValue = isNaN(trimmedResult) ? 0 : trimmedResult;
    this.setState({
      loadTable: false
    })
    let frequencyLength = KPIBenefitsArray[0].actualBenefits.paramDto[index].paramValues[yearIndex].paramFreqData.length
    if (frequencyIndex === frequencyLength - 1) {
      KPIBenefitsArray[0].actualBenefits.paramDto[index].paramValues[yearIndex].actualValue.actualValue = Number(finalValue);
      KPIBenefitsArray[0].actualBenefits.paramDto[index].paramValues[yearIndex].actualValue.formattedValue = Number(finalValue);
      if (KPIBenefitsArray[0].actualBenefits.paramDto[index].paramName === 'KPI Actual') {
        KPIBenefitsArray[0].actualBenefits.paramDto[index + 1].paramValues[yearIndex].actualValue.actualValue =
          // Number(finalValue) - KPIBenefitsArray[0].baseline
          (trend === "Increase" ?
            (finalValue === "" ? "" : ((Number(finalValue) - KPIBenefitsArray[0].baseline) < 0 ? 0 : (Number(finalValue) - KPIBenefitsArray[0].baseline))) :
            (finalValue === "" ? "" : ((KPIBenefitsArray[0].baseline - Number(finalValue)) < 0 ? 0 : (KPIBenefitsArray[0].baseline - Number(finalValue))))
          )
      }
    }
    if (KPIBenefitsArray[0].actualBenefits.paramDto[index].paramValues[yearIndex].paramFreqData[frequencyIndex].actualValue === null) {
      KPIBenefitsArray[0].actualBenefits.paramDto[index].paramValues[yearIndex].paramFreqData[frequencyIndex].actualValue = {
        "actualValue": Number(finalValue),
        "formattedValue": Number(finalValue)
      }
      if (frequencyIndex === frequencyLength - 1) {
        KPIBenefitsArray[0].actualBenefits.paramDto[index].paramValues[yearIndex].actualValue = {
          "actualValue": KPIBenefitsArray[0].actualBenefits.paramDto[index].paramValues[yearIndex].paramFreqData[frequencyLength - 1].actualValue.actualValue,
          "formattedValue": KPIBenefitsArray[0].actualBenefits.paramDto[index].paramValues[yearIndex].paramFreqData[frequencyLength - 1].actualValue.formattedValue
        }
      }
    } else {
      KPIBenefitsArray[0].actualBenefits.paramDto[index].paramValues[yearIndex].paramFreqData[frequencyIndex].actualValue.actualValue = finalValue ? Number(finalValue) : null;
      KPIBenefitsArray[0].actualBenefits.paramDto[index].paramValues[yearIndex].paramFreqData[frequencyIndex].actualValue.formattedValue = finalValue ? Number(finalValue) : null;
      KPIBenefitsArray[0].actualBenefits.paramDto[index].paramValues[yearIndex].actualValue.actualValue = KPIBenefitsArray[0].actualBenefits.paramDto[index].paramValues[yearIndex].paramFreqData[frequencyLength - 1].actualValue.actualValue;
      KPIBenefitsArray[0].actualBenefits.paramDto[index].paramValues[yearIndex].actualValue.formattedValue = KPIBenefitsArray[0].actualBenefits.paramDto[index].paramValues[yearIndex].paramFreqData[frequencyLength - 1].actualValue.formattedValue;
    }
    if (KPIBenefitsArray[0].actualBenefits.paramDto[index].paramName === 'KPI Actual' && frequencyIndex !== 0) {
      KPIBenefitsArray[0].actualBenefits.paramDto[index].paramValues[yearIndex].paramFreqData.map((value) => {
        kpiArray.push(value)
        return true
      })

      if (KPIBenefitsArray[0].actualBenefits.paramDto[index + 1].paramValues[yearIndex].paramFreqData[frequencyIndex].actualValue !== null) {
        KPIBenefitsArray[0].actualBenefits.paramDto[index + 1].paramValues[yearIndex].paramFreqData[frequencyIndex].actualValue.actualValue =
          // kpiArray[frequencyIndex].actualValue.actualValue - kpiArray[frequencyIndex - 1].actualValue.actualValue
          (trend === "Increase" ?
            (finalValue === "" ? "" : ((kpiArray[frequencyIndex].actualValue.actualValue - KPIBenefitsArray[0].baseline) < 0 ? 0 : (kpiArray[frequencyIndex].actualValue.actualValue - KPIBenefitsArray[0].baseline))) :
            (finalValue === "" ? "" : ((KPIBenefitsArray[0].baseline - kpiArray[frequencyIndex].actualValue.actualValue) < 0 ? 0 : (KPIBenefitsArray[0].baseline - kpiArray[frequencyIndex].actualValue.actualValue)))
          )
      } else {
        KPIBenefitsArray[0].actualBenefits.paramDto[index + 1].paramValues[yearIndex].paramFreqData[frequencyIndex].actualValue = {
          "actualValue":
            // kpiArray[frequencyIndex].actualValue.actualValue - kpiArray[frequencyIndex - 1].actualValue.actualValue
            (trend === "Increase" ?
              (finalValue === "" ? "" : ((kpiArray[frequencyIndex].actualValue.actualValue - KPIBenefitsArray[0].baseline) < 0 ? 0 : (kpiArray[frequencyIndex].actualValue.actualValue - KPIBenefitsArray[0].baseline))) :
              (finalValue === "" ? "" : ((KPIBenefitsArray[0].baseline - kpiArray[frequencyIndex].actualValue.actualValue) < 0 ? 0 : (KPIBenefitsArray[0].baseline - kpiArray[frequencyIndex].actualValue.actualValue)))
            ),
          "formattedValue":
            // kpiArray[frequencyIndex].actualValue.actualValue - kpiArray[frequencyIndex - 1].actualValue.actualValue
            (trend === "Increase" ?
              (finalValue === "" ? "" : ((kpiArray[frequencyIndex].actualValue.actualValue - KPIBenefitsArray[0].baseline) < 0 ? 0 : (kpiArray[frequencyIndex].actualValue.actualValue - KPIBenefitsArray[0].baseline))) :
              (finalValue === "" ? "" : ((KPIBenefitsArray[0].baseline - kpiArray[frequencyIndex].actualValue.actualValue) < 0 ? 0 : (KPIBenefitsArray[0].baseline - kpiArray[frequencyIndex].actualValue.actualValue)))
            )
        }
      }

      if (KPIBenefitsArray[0].actualBenefits.paramDto[index].paramValues[yearIndex].paramFreqData.length - 1 === frequencyIndex) {
        KPIBenefitsArray[0].actualBenefits.paramDto[index + 1].paramValues[yearIndex].actualValue
          = KPIBenefitsArray[0].actualBenefits.paramDto[index + 1].paramValues[yearIndex].paramFreqData[frequencyIndex].actualValue

      }

    }
    if (KPIBenefitsArray[0].actualBenefits.paramDto[index].paramName === 'KPI Actual' && frequencyIndex === 0) {
      // if (KPIBenefitsArray[0].actualBenefits.paramDto[index].paramName === 'KPI Actual' && frequencyIndex !== 0) {
      KPIBenefitsArray[0].actualBenefits.paramDto[index].paramValues[yearIndex].paramFreqData.map((value) => {
        kpiArray.push(value)
        return true
      })
      // }
      if (KPIBenefitsArray[0].actualBenefits.paramDto[index + 1].paramValues[yearIndex].paramFreqData[frequencyIndex].actualValue !== null) {
        KPIBenefitsArray[0].actualBenefits.paramDto[index + 1].paramValues[yearIndex].paramFreqData[frequencyIndex].actualValue.actualValue =
          // kpiArray[0].actualValue.actualValue - KPIBenefitsArray[0].baseline
          (trend === "Increase" ?
            (finalValue === "" ? "" : ((kpiArray[0].actualValue.actualValue - KPIBenefitsArray[0].baseline) < 0 ? 0 : (kpiArray[0].actualValue.actualValue - KPIBenefitsArray[0].baseline))) :
            (finalValue === "" ? "" : ((KPIBenefitsArray[0].baseline - kpiArray[0].actualValue.actualValue) < 0 ? 0 : (KPIBenefitsArray[0].baseline - kpiArray[0].actualValue.actualValue)))
          )
      } else {
        KPIBenefitsArray[0].actualBenefits.paramDto[index + 1].paramValues[yearIndex].paramFreqData[frequencyIndex].actualValue = {
          "actualValue":
            // kpiArray[0].actualValue.actualValue - KPIBenefitsArray[0].baseline
            (trend === "Increase" ?
              (finalValue === "" ? "" : ((kpiArray[0].actualValue.actualValue - KPIBenefitsArray[0].baseline) < 0 ? 0 : (kpiArray[0].actualValue.actualValue - KPIBenefitsArray[0].baseline))) :
              (finalValue === "" ? "" : ((KPIBenefitsArray[0].baseline - kpiArray[0].actualValue.actualValue) < 0 ? 0 : (KPIBenefitsArray[0].baseline - kpiArray[0].actualValue.actualValue)))
            ),
          "formattedValue":
            // kpiArray[0].actualValue.actualValue - KPIBenefitsArray[0].baseline
            (trend === "Increase" ?
              (finalValue === "" ? "" : ((kpiArray[0].actualValue.actualValue - KPIBenefitsArray[0].baseline) < 0 ? 0 : (kpiArray[0].actualValue.actualValue - KPIBenefitsArray[0].baseline))) :
              (finalValue === "" ? "" : ((KPIBenefitsArray[0].baseline - kpiArray[0].actualValue.actualValue) < 0 ? 0 : (KPIBenefitsArray[0].baseline - kpiArray[0].actualValue.actualValue)))
            )
        }
      }
    }
    this.setState({
      loadTable: true
    })
    // this.updateKpiBenefitArrayForActuals(KPIBenefitsArray[0], index, yearIndex, frequencyIndex)
  }

  onChangeKPITargetEachYearActual = (event, index, yearIndex) => {
    const { KPIBenefitsArray, KPIDetailsArray } = this.props;
    let trend = (KPIBenefitsArray[0].kpiTrend).trim();
    let value = event.target.value.replace(/,/g, '')
    var decPos = value.indexOf('.');
    let kpiArray = []
    var substrLength = decPos === -1 ? value.length : 1 + decPos + 10,
      trimmedResult = value.substr(0, substrLength),
      finalValue = isNaN(trimmedResult) ? 0 : trimmedResult;
    KPIBenefitsArray[0].actualBenefits.paramDto[index].paramValues[yearIndex].actualValue.actualValue = finalValue ? Number(finalValue) : null;
    KPIBenefitsArray[0].actualBenefits.paramDto[index].paramValues[yearIndex].actualValue.formattedValue = finalValue ? Number(finalValue) : null;
    // if()
    this.setState({
      currentYear: yearIndex
    })
    if (KPIBenefitsArray[0].actualBenefits.paramDto[index].paramName === 'KPI Actual' && yearIndex !== 0) {
      KPIBenefitsArray[0].actualBenefits.paramDto[index].paramValues.map((value) => {
        kpiArray.push(value)
        return true
      })

      if (KPIBenefitsArray[0].actualBenefits.paramDto[index + 1].paramValues[yearIndex].actualValue !== null) {
        KPIBenefitsArray[0].actualBenefits.paramDto[index + 1].paramValues[yearIndex].actualValue.actualValue =
          // kpiArray[yearIndex].actualValue.actualValue - kpiArray[yearIndex - 1].actualValue.actualValue
          (trend === "Increase" ?
            (finalValue === "" ? "" : ((kpiArray[yearIndex].actualValue.actualValue - KPIBenefitsArray[0].baseline) < 0 ? 0 : (kpiArray[yearIndex].actualValue.actualValue - KPIBenefitsArray[0].baseline))) :
            (finalValue === "" ? "" : (KPIBenefitsArray[0].baseline - kpiArray[yearIndex].actualValue.actualValue) < 0 ? 0 : (KPIBenefitsArray[0].baseline - kpiArray[yearIndex].actualValue.actualValue))
          )
      } else {
        KPIBenefitsArray[0].actualBenefits.paramDto[index + 1].paramValues[yearIndex].actualValue = {
          "actualValue": (trend === "Increase" ?
            (finalValue === "" ? "" : ((kpiArray[yearIndex].actualValue.actualValue - KPIBenefitsArray[0].baseline) < 0 ? 0 : (kpiArray[yearIndex].actualValue.actualValue - KPIBenefitsArray[0].baseline))) :
            (finalValue === "" ? "" : ((KPIBenefitsArray[0].baseline - kpiArray[yearIndex].actualValue.actualValue) < 0 ? 0 : (KPIBenefitsArray[0].baseline - kpiArray[yearIndex].actualValue.actualValue)))
          ),
          "formattedValue": (trend === "Increase" ?
            (finalValue === "" ? "" : ((kpiArray[yearIndex].actualValue.actualValue - KPIBenefitsArray[0].baseline) < 0 ? 0 : (kpiArray[yearIndex].actualValue.actualValue - KPIBenefitsArray[0].baseline))) :
            (finalValue === "" ? "" : ((KPIBenefitsArray[0].baseline - kpiArray[yearIndex].actualValue.actualValue) < 0 ? 0 : (KPIBenefitsArray[0].baseline - kpiArray[yearIndex].actualValue.actualValue)))
          )
        }
      }
    }
    if (KPIBenefitsArray[0].actualBenefits.paramDto[index].paramName === 'KPI Actual' && yearIndex === 0) {
      // if (KPIBenefitsArray[0].actualBenefits.paramDto[index].paramName === 'KPI Actual' && frequencyIndex !== 0) {
      KPIBenefitsArray[0].actualBenefits.paramDto[index].paramValues.map((value) => {
        kpiArray.push(value)
        return true
      })
      // }
      if (KPIBenefitsArray[0].actualBenefits.paramDto[index + 1].paramValues[yearIndex].actualValue !== null) {
        KPIBenefitsArray[0].actualBenefits.paramDto[index + 1].paramValues[yearIndex].actualValue.actualValue =
          // kpiArray[0].actualValue.actualValue - KPIBenefitsArray[0].baseline
          (trend === "Increase" ?
            (finalValue === "" ? "" : ((kpiArray[0].actualValue.actualValue - KPIBenefitsArray[0].baseline) < 0 ? 0 : (kpiArray[0].actualValue.actualValue - KPIBenefitsArray[0].baseline))) :
            (finalValue === "" ? "" : ((KPIBenefitsArray[0].baseline - kpiArray[0].actualValue.actualValue) < 0 ? 0 : (KPIBenefitsArray[0].baseline - kpiArray[0].actualValue.actualValue)))
          )
      } else {
        KPIBenefitsArray[0].actualBenefits.paramDto[index + 1].paramValues[yearIndex].actualValue = {
          "actualValue":
            // kpiArray[0].actualValue.actualValue - KPIBenefitsArray[0].baseline
            (trend === "Increase" ?
              (finalValue === "" ? "" : ((kpiArray[0].actualValue.actualValue - KPIBenefitsArray[0].baseline) < 0 ? 0 : (kpiArray[0].actualValue.actualValue - KPIBenefitsArray[0].baseline))) :
              (finalValue === "" ? "" : ((KPIBenefitsArray[0].baseline - kpiArray[0].actualValue.actualValue) < 0 ? 0 : (KPIBenefitsArray[0].baseline - kpiArray[0].actualValue.actualValue)))
            ),
          "formattedValue":
            // kpiArray[0].actualValue.actualValue - KPIBenefitsArray[0].baseline
            (trend === "Increase" ?
              ((kpiArray[0].actualValue.actualValue - KPIBenefitsArray[0].baseline) < 0 ? 0 : (kpiArray[0].actualValue.actualValue - KPIBenefitsArray[0].baseline)) :
              (finalValue === "" ? "" : (KPIBenefitsArray[0].baseline - kpiArray[0].actualValue.actualValue) < 0 ? 0 : (KPIBenefitsArray[0].baseline - kpiArray[0].actualValue.actualValue))
            )
        }
      }
    }
    this.setState({
      loadTable: true
    })
    // this.updateKpiBenefitArrayForActuals(KPIBenefitsArray[0], index, yearIndex);
    // this.calculateIncrementalBenefit(index, yearIndex)
  }


  onChangeKPITargetEachYear = (event, index, yearIndex) => {
    const { KPIBenefitsArray, KPIDetailsArray } = this.props;
    let value = event.target.value.replace(/,/g, '')
    let trend = (KPIBenefitsArray[0].kpiTrend).trim();
    var decPos = value.indexOf('.');
    let kpiArray = []
    var substrLength = decPos === -1 ? value.length : 1 + decPos + 10,
      trimmedResult = value.substr(0, substrLength),
      finalValue = isNaN(trimmedResult) ? 0 : trimmedResult;
    KPIBenefitsArray[0].targetBenefits.paramDto[index].paramValues[yearIndex].targetValue.actualValue = finalValue ? Number(finalValue) : null;
    KPIBenefitsArray[0].targetBenefits.paramDto[index].paramValues[yearIndex].targetValue.formattedValue = finalValue ? Number(finalValue) : null;
    // if()
    this.setState({
      currentYear: yearIndex
    })

    if (KPIBenefitsArray[0].targetBenefits.paramDto[index].paramName === 'KPI Target' && yearIndex !== 0) {
      KPIBenefitsArray[0].targetBenefits.paramDto[index].paramValues.map((value) => {
        kpiArray.push(value)
        return true
      })

      if (KPIBenefitsArray[0].targetBenefits.paramDto[index + 1].paramValues[yearIndex].targetValue !== null) {
        KPIBenefitsArray[0].targetBenefits.paramDto[index + 1].paramValues[yearIndex].targetValue.actualValue =
          // kpiArray[yearIndex].actualValue.actualValue - kpiArray[yearIndex - 1].actualValue.actualValue
          (trend === "Increase" ?
            (finalValue === "" ? "" : ((kpiArray[yearIndex].targetValue.actualValue - KPIBenefitsArray[0].baseline) < 0 ? 0 : (kpiArray[yearIndex].targetValue.actualValue - KPIBenefitsArray[0].baseline))) :
            (finalValue === "" ? "" : (KPIBenefitsArray[0].baseline - kpiArray[yearIndex].targetValue.actualValue) < 0 ? 0 : (KPIBenefitsArray[0].baseline - kpiArray[yearIndex].targetValue.actualValue))
          )
      } else {
        KPIBenefitsArray[0].targetBenefits.paramDto[index + 1].paramValues[yearIndex].targetValue = {
          "actualValue": (trend === "Increase" ?
            (finalValue === "" ? "" : ((kpiArray[yearIndex].targetValue.actualValue - KPIBenefitsArray[0].baseline) < 0 ? 0 : (kpiArray[yearIndex].targetValue.actualValue - KPIBenefitsArray[0].baseline))) :
            (finalValue === "" ? "" : ((KPIBenefitsArray[0].baseline - kpiArray[yearIndex].targetValue.actualValue) <= 0 ? 0 : (KPIBenefitsArray[0].baseline - kpiArray[yearIndex].targetValue.actualValue)))
          ),
          "formattedValue": (trend === "Increase" ?
            (finalValue === "" ? "" : ((kpiArray[yearIndex].targetValue.actualValue - KPIBenefitsArray[0].baseline) < 0 ? 0 : (kpiArray[yearIndex].targetValue.actualValue - KPIBenefitsArray[0].baseline))) :
            (finalValue === "" ? "" : ((KPIBenefitsArray[0].baseline - kpiArray[yearIndex].targetValue.actualValue) <= 0 ? 0 : (KPIBenefitsArray[0].baseline - kpiArray[yearIndex].targetValue.actualValue)))
          )
        }
      }
    }
    if (KPIBenefitsArray[0].targetBenefits.paramDto[index].paramName === 'KPI Target' && yearIndex === 0) {
      // if (KPIBenefitsArray[0].actualBenefits.paramDto[index].paramName === 'KPI Actual' && frequencyIndex !== 0) {
      KPIBenefitsArray[0].targetBenefits.paramDto[index].paramValues.map((value) => {
        kpiArray.push(value)
        return true
      })
      // }
      if (KPIBenefitsArray[0].targetBenefits.paramDto[index + 1].paramValues[yearIndex].targetValue !== null) {
        KPIBenefitsArray[0].targetBenefits.paramDto[index + 1].paramValues[yearIndex].targetValue.actualValue =
          // kpiArray[0].actualValue.actualValue - KPIBenefitsArray[0].baseline
          (trend === "Increase" ?
            (finalValue === "" ? "" : ((kpiArray[0].targetValue.actualValue - KPIBenefitsArray[0].baseline) < 0 ? 0 : (kpiArray[0].targetValue.actualValue - KPIBenefitsArray[0].baseline))) :
            (finalValue === "" ? "" : ((KPIBenefitsArray[0].baseline - kpiArray[0].targetValue.actualValue) <= 0 ? 0 : (KPIBenefitsArray[0].baseline - kpiArray[0].targetValue.actualValue)))
          )
      } else {
        KPIBenefitsArray[0].targetBenefits.paramDto[index + 1].paramValues[yearIndex].actualValue = {
          "actualValue":
            // kpiArray[0].actualValue.actualValue - KPIBenefitsArray[0].baseline
            (trend === "Increase" ?
              (finalValue === "" ? "" : ((kpiArray[0].targetValue.actualValue - KPIBenefitsArray[0].baseline) < 0 ? 0 : (kpiArray[0].targetValue.actualValue - KPIBenefitsArray[0].baseline))) :
              (finalValue === "" ? "" : ((KPIBenefitsArray[0].baseline - kpiArray[0].targetValue.actualValue) <= 0 ? 0 : (KPIBenefitsArray[0].baseline - kpiArray[0].targetValue.actualValue)))
            ),
          "formattedValue":
            // kpiArray[0].actualValue.actualValue - KPIBenefitsArray[0].baseline
            (trend === "Increase" ?
              ((kpiArray[0].targetValue.actualValue - KPIBenefitsArray[0].baseline) < 0 ? 0 : (kpiArray[0].targetValue.actualValue - KPIBenefitsArray[0].baseline)) :
              ((KPIBenefitsArray[0].baseline - kpiArray[0].targetValue.actualValue) <= 0 ? 0 : (KPIBenefitsArray[0].baseline - kpiArray[0].targetValue.actualValue))
            )
        }
      }
    }
    // this.updateKpiBenefitArray(KPIBenefitsArray[0], index, yearIndex);
    // this.calculateIncrementalBenefit(index, yearIndex)
  }


  onNewParamChange(event, index) {
    const { paramArray } = this.state;
    let benefitArray = this.props.KPIBenefitsArray;
    let individualParamObj = {};
    for (let param of paramArray) {
      if (param.paramName.trim() === event.target.value.trim()) {
        individualParamObj = param;
      }
    }
    this.setParamValuesForSelectedParam(benefitArray[0].actualBenefits.paramDto[index], individualParamObj);
  }

  setParamValuesForSelectedParam(paramDtoObj, indParamObj) {
    paramDtoObj.paramName = indParamObj.paramName.trim();
    paramDtoObj.unit = indParamObj.unit;
    paramDtoObj.paramValues = indParamObj.paramVal.map(val => {
      return { actualValue: { "actualValue": val, "formattedValue": 0 } }
    });
    this.calculateTotalValuesOnLoad(this.props.KPIBenefitsArray[0])
    this.setState({
      benefitArray: [...this.props.KPIBenefitsArray]
    })
  }
  openBenActualsFreqConfirmModal = (title) => {
    this.setState({
      customFreqBenefitActualsModalVisible: true,
      customFreqBenefitActualsModalTitle: title,

    });
  };
  closeBenActualsFreqConfirmModalHandler = (isYesClicked) => {
    this.setState({
      customFreqBenefitActualsModalVisible: false,
      customFreqBenefitActualsModalTitle: ''
    });
    if (isYesClicked) {
      //new delete function
      this.freqChangeConfirm()
    }
    else {
      this.setState({
        loadTable: true
      });
    }
  };

  freqChangeConfirm() {
    const { benefitActualsStore } = this.props;
    const { freq_modal } = this.state;
    let frequency = freq_modal;
    // KPIBenefitsArray[0].startDate = ""
    let bFrequency = frequency;
    this.setState({
      businessFrequency: bFrequency,
      dateValue: '',
      benefitArray: ''
    })
    benefitActualsStore.frequency = bFrequency;
    benefitActualsStore.isFrequencyChanged = true;
    benefitActualsStore.startDate = ""
    this.props.loadKpiBenefitTree()
    this.buildFrequencyArray(bFrequency)

  }
  setBusinessFrequency = (frequency, slectionchanged) => {
    const { benefitActualsStore } = this.props;
    let deleteMsg = "Already filled data will be lost with the change of frequency. Do you want to continue?";
    if (slectionchanged) {
      this.setState({
        loadTable: false,
        freq_modal: frequency,

      })
      this.openBenActualsFreqConfirmModal(deleteMsg)

    } else {
      let bFrequency = frequency;
      this.setState({
        businessFrequency: bFrequency,
      })
      benefitActualsStore.frequency = bFrequency;
      // this.props.loadKpiBenefitTree()
      this.buildFrequencyArray(bFrequency)
    }


  };

  buildFrequencyArray = (frequency) => {
    let { KPIBenefitsArray } = this.props
    let freqArrayTotal = []
    let totalPeriods = KPIBenefitsArray[0].actualBenefits.kpiBenefits.length
    switch (frequency) {
      case 'Monthly':
        for (let i = 1; i <= 12 * totalPeriods; i++) {
          freqArrayTotal.push('Month ' + i)
        }
        break;
      case 'Quarterly':
        for (let i = 1; i <= 4 * totalPeriods; i++) {
          freqArrayTotal.push('Quarter ' + i)
        }
        break;
      case 'Fortnightly':
        for (let i = 1; i <= 26 * totalPeriods; i++) {
          freqArrayTotal.push('Fortnight ' + i)
        }
        break;
      default: break;
    }

    this.setState({
      freqArrayTotal: freqArrayTotal
    })
  }

  setFrequencyNumber(yearNumber, level) {
    let { benefitActualsStore } = this.props
    let { freqArrayTotal } = this.state
    let frequency = benefitActualsStore.frequency
    let event = yearNumber - 1
    let frequencyToDisplay = 0
    let frequenciesToDisplay = []
    switch (frequency) {
      case 'Monthly':
        frequencyToDisplay = (event + 1) * 12;
        for (let i = (event * 12); i < frequencyToDisplay; i++) {
          frequenciesToDisplay.push(freqArrayTotal[i])
        }
        break;
      case 'Quarterly':
        frequencyToDisplay = (event + 1) * 4;
        for (let i = (event * 4); i < frequencyToDisplay; i++) {
          frequenciesToDisplay.push(freqArrayTotal[i])
        }
        break;
      case 'Fortnightly':
        frequencyToDisplay = (event + 1) * 26;
        for (let i = (event * 26); i < frequencyToDisplay; i++) {
          frequenciesToDisplay.push(freqArrayTotal[i])
        }
        break;

      default:
        break;
    }
    this.buildFrequencyArray(frequency)
    if (level === 'target') {
      this.setState({
        freqArray: frequenciesToDisplay,
        collapseAllTarget: false
      })
    } else {
      this.setState({
        actualfreqArray: frequenciesToDisplay,
        collapseAllActual: false
      })
    }
  }

  render() {
    const { kpiBenefitsStore, benefitActualsStore } = this.props;
    const {saveLoading} = this.state;
    const { KPIBenefitsArray } = this.props;
    const getTooltipData = (value) => {
      if (value) {
        let val = String(value).replace(/(?<!\..*)(\d)(?=(?:\d{3})+(?:\.|$))/g, '$1,');
        return `${val}`;
      }
    }
    const getTooltipInfo = () => {
      const { KPIBenefitsArray } = this.props;
      let BenefitArr = KPIBenefitsArray[0]
      return BenefitArr.benefitRule
      
      // let paramString = ''
      // BenefitArr[0].targetBenefits.paramDto.map((param, index) => {
      //   if (index !== 0) {
      //     paramString = paramString + ' * ' + param.paramName

      //   }
      //   return true
      // })
      // return paramString = paramString.slice(2)

    }
    return (
      <div id="testForCalender" style={{ position: 'relative' }}>
        <div className="row tab " >
          <div className="col-sm-9" />
         
          <div className="col-sm-3 icons-benefits" style={{ top: (this.props.isExpandBenefits ? "-4rem" : "-3.3rem") }}>
            <img src={saveIcon} alt="save" className="save-img"
              id={this.props.KPIBenefitsArray[0] && this.props.KPIBenefitsArray[0].kpiId}
              onClick={(SessionStorage.read("accessType") === "Read" || saveLoading) ? () => { } : this.onKPIBenefitSaveClick}
              style={{
                opacity:(( this.state.loadTable === false || this.props.branchTree.length === 0 || SessionStorage.read("accessType") === "Read" || saveLoading) ? "0.5" : 'unset'),
                cursor: ((this.state.loadTable === false || this.props.branchTree.length === 0 || SessionStorage.read("accessType") === "Read") ? "not-allowed" : (saveLoading?"dafault":'pointer'))
              }}
              disabled={(this.state.loadTable === false || this.props.branchTree.length === 0 || SessionStorage.read("demoUser") === "true" ||saveLoading)? true : SessionStorage.read("accessType") === "Read" ? true : false}
              data-tip=""
              data-for="benActualsHome-save-tooltip"
              data-place="top"
            />
            {saveLoading ? 
                 <i className="fa fa-spinner fa-spin" style={{ color: '#ffffff',position:"absolute",margin:"5px 0px 0px -20px" ,cursor:"default"}}></i>
                :"" }
            <ReactTooltip id="benActualsHome-save-tooltip" className="tooltip-class">
              <span>Save</span>
            </ReactTooltip>
            <img src={expandIco} alt="expand"
              onClick={this.props.onExpandClick}
              data-tip=""
              data-for="benActualsHome-expand-tooltip"
              data-place="top"
            />
            <ReactTooltip id="benActualsHome-expand-tooltip" className="tooltip-class">
              <span>Expand</span>
            </ReactTooltip>

            {this.props.KPIBenefitsArray[0].kpiType === 'NON_FINANCIAL' ?
              <>
                <img src={nonFinancial} alt="non-financial"
                  data-tip=""
                  data-for="benActualsHome-non-financial-info-tooltip"
                  data-place="left"
                />
                <ReactTooltip id="benActualsHome-non-financial-info-tooltip" className="tooltip-class">
                  <span>Financial Benefits are not calculated for Non-Financial KPIs</span>
                </ReactTooltip>
              </>
              : ''}
          </div>
        </div>
        <div className="benefit-act-home-kpi_table-responsive">
          <table className="table" style={{ tableLayout: 'fixed', width: '98%' }}>
            <thead style={{ whiteSpace: 'nowrap' }}>
              <tr>
                <th style={{ width: "55px" }}>KPI Unit</th>
                <th style={{ width: "60px" }} >Baseline</th>
                <th style={{ width: "60px" }}>Target</th>
                <th style={{ width: "70px" }}>Target<br></br>Achieved</th>
                <th style={{ width: "75px" }}>Tracking<br></br>Frequency</th>
                <th style={{ width: "95px" }}>Start Date</th>
                {this.props.KPIBenefitsArray[0].baseKpi !== null ?
                  <th style={{ width: "26px", background: 'none', border: 'none' }}> </th> : ""}
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style={{ backgroundColor: '#4d4d4d' }}>
                  {this.props.KPIBenefitsArray[0] && this.props.KPIBenefitsArray[0].kpiUnit}
                </td>
                <td style={{ backgroundColor: '#4d4d4d', textAlignLast: "right" }}
                  data-tip={getTooltipData(this.props.KPIBenefitsArray[0] && this.props.KPIBenefitsArray[0].baseline)}
                >
                  <NumberFormat
                    disabled
                    style={{
                      width: '100%', border: 'none',
                      backgroundColor: '#d3d3d300',
                      textAlignLast: 'right',
                      color: "#ffffff"
                    }}
                    className="input-Ben-actuals"
                    thousandSeparator={true}
                    value={this.props.KPIBenefitsArray[0] &&
                      Number(Math.round(Number(this.props.KPIBenefitsArray[0].baseline) * 10) / 10).toFixed(1)
                    }
                  />

                </td>
                <td style={{ backgroundColor: '#4d4d4d', textAlignLast: "right" }}
                  data-tip={getTooltipData(this.props.KPIBenefitsArray[0] && this.props.KPIBenefitsArray[0].target)}
                >
                  <NumberFormat
                    disabled
                    style={{
                      width: '100%', border: 'none',
                      backgroundColor: '#d3d3d300',
                      textAlignLast: 'right',
                      color: "#ffffff"
                    }}
                    className="input-Ben-actuals"
                    thousandSeparator={true}
                    value={this.props.KPIBenefitsArray[0] &&
                      Number(Math.round(Number(this.props.KPIBenefitsArray[0].target) * 10) / 10).toFixed(1)
                    }
                  />


                </td>
                <td style={{ backgroundColor: '#4d4d4d' }}>
                  {this.props.KPIBenefitsArray[0] && this.props.KPIBenefitsArray[0].targetAchieved}
                </td>

                <td >
                  <select
                    className="select-Ben-Act"

                    disabled={this.props.KPIBenefitsArray[0].baseKpi !== null}
                    onChange={SessionStorage.read("accessType") === "Read" ? () => { } : (e) => { this.setBusinessFrequency(e.target.value, true) }}
                    value={this.state.businessFrequency}
                  >
                    <option value="false" disabled>Select</option>
                    <option value="Yearly">Yearly</option>
                    <option value="Quarterly">Quarterly</option>
                    <option value="Monthly">Monthly</option>
                    <option value="Fortnightly">Fortnightly</option>

                  </select>

                </td>
                <td >
                  {/* {this.props.KPIBenefitsArray[0] && this.props.KPIBenefitsArray[0].targetAchieved} */}
                  <div className="input-group form-group" style={{ margin: '0px' }}>
                    <DatePicker
                      value={this.state.dateValue}
                      selected={this.state.dateValue}
                      id={`benefit_start_date`}
                      placeholderText="Select Date"
                      onChange={this.handleChange}
                      dateFormat="dd-MMM-yyyy"
                      showMonthDropdown
                      showYearDropdown
                      useShortMonthInDropdown
                      fixedHeight
                      style={{ width: "80%", color: this.props.KPIBenefitsArray[0].baseKpi !== null ? '#464646' : "#fffff" }}
                      className="form-control date-Input"
                      required={true}
                      popperModifiers={{
                        offset: {
                          enabled: true,
                          offset: "5px, 10px"
                        },
                        preventOverflow: {
                          enabled: true,
                          escapeWithReference: false,
                          boundariesElement: "viewport"
                        }
                      }}
                      disabled={!this.state.loadTable || this.props.KPIBenefitsArray[0].baseKpi !== null}
                    />
                    <div style={{ width: "20%", zIndex: '1', fontSize: '22px', padding: "5px 0px 5px 5px" }}>
                      <img src={calendarIcon} alt="CalendarIcon" style={{ width: "18px" }}></img>
                    </div>
                  </div>
                </td>
                {
                  this.props.KPIBenefitsArray[0].baseKpi !== null ?
                    <td style={{ border: 'none', background: 'none' }}>
                      <img src={infoIcon} alt="InfoIcon" style={{ width: "18px" }}
                        data-tip
                        data-for="benTarget-info-tooltip"
                        data-place="left"></img>
                      <ReactTooltip id="benTarget-info-tooltip" className="tooltip-class">
                        <span>As this KPI is linked to {this.props.KPIBenefitsArray[0].baseKpiName} , its start date and frequency are aligned with that of the {this.props.KPIBenefitsArray[0].baseKpiName} </span>
                      </ReactTooltip>
                    </td>
                    : null
                }
              </tr>

            </tbody>
          </table>

        </div>

        <p data-tip={getTooltipInfo()}
          className="title" style={{ width: "fit-content", marginLeft: this.props.isExpandBenefits ? '2%' : '' }}

          data-for="benTarget-title-tooltip"
          data-place="top"
        >
          Benefit Target
            </p>

        <ReactTooltip id="benTarget-title-tooltip" className="tooltip-class" />
        {
          this.state.loadTable && this.state.benefitArray.length > 0 && this.props.branchTree.length > 0 ?
            <BenefitTargetTable
              frequency={benefitActualsStore.frequency}
              setYearArrayLength={this.setYearArrayLength}
              paramArray={this.state.paramArray}
              doesParamExist={this.doesParamExist}
              errorIndexArr={this.state.errorIndexArr}
              KPIBenefitsArray={this.state.benefitArray}
              BenifitsArray={KPIBenefitsArray}
              onMFBlur={this.onMFBlur}
              onFocusMF={this.onFocusMF}
              onChangeKPITargetEachYear={this.onChangeKPITargetEachYear}
              kpiId={kpiBenefitsStore.kpiId}
              delinkKPIs={this.delinkKPIs}
              addTargetColoumnHandler={this.addTargetColoumnHandler}
              deleteTargetColumnHandler={this.deleteTargetColumnHandler}
              individualStartDate={this.state.individualStartDate}
              handleIndividualTargetDateChange={this.handleIndividualTargetDateChange}
              onchangeKPIFrequencyData={this.onchangeKPIFrequencyData}
              freqArray={this.state.freqArray}
              collapseAll={this.state.collapseAllTarget}
              setFrequencyNumber={this.setFrequencyNumber}
              handleFrequencyDateChange={this.handleFrequencyDateChange}
              frequencyCheck={this.state.frequencyCheck}
              isExpandBenefits={this.props.isExpandBenefits}
            />
            :
            <div className="row justify-content-center" style={{ height: '50px' }}>
              {/* <h4> <i className="fa fa-exclamation-triangle"></i> No data to load</h4> */}
              <i className="fa fa-spinner fa-spin" style={{ fontSize: '18px', color: '#ffffff', height: "min-content" }}></i>
            </div>}
        <p 
         data-tip={getTooltipInfo()}

          data-for="benActuals-title-tooltip"
          data-place="top"
          className="title"
          style={{ width: "fit-content" }}>Benefit Actual</p>

        <ReactTooltip id="benActuals-title-tooltip" className="tooltip-class" ></ReactTooltip>
        {
          this.state.loadTable && this.state.benefitArray.length > 0 && this.props.branchTree.length > 0 ?
            <BenefitActualTable
              frequency={benefitActualsStore.frequency}
              setYearArrayLength={this.setYearArrayLength}
              paramArray={this.state.paramArray}
              doesParamExist={this.doesParamActualExist}
              errorIndexArr={this.state.errorIndexArr}
              KPIBenefitsArray={this.state.benefitArray}
              BenifitsArray={KPIBenefitsArray}
              onMFBlur={this.onMFBlur}
              onFocusMF={this.onFocusMF}
              onChangeKPITargetEachYearActual={this.onChangeKPITargetEachYearActual}
              onChangeIncBenfit={this.onChangeIncBenfit}
              kpiId={kpiBenefitsStore.kpiId}
              delinkKPIs={this.delinkKPIs}
              addTargetColoumnHandler={this.addTargetColoumnHandler}
              addColoumnHandler={this.addColoumnHandler}
              deleteColumnHandler={this.deleteColumnHandler}
              handleIndividualActualDateChange={this.handleIndividualTargetDateChange}
              onchangeKPIFrequencyDataActuals={this.onchangeKPIFrequencyDataActuals}
              freqArray={this.state.actualfreqArray}
              setFrequencyNumber={this.setFrequencyNumber}
              collapseAll={this.state.collapseAllActual}
              handleFrequencyDateChange={this.handleFrequencyDateChange}
              isExpandBenefits={this.props.isExpandBenefits} />
            :
            <div className="row justify-content-center" style={{ height: '50px' }}>
              {/* <h4> <i className="fa fa-exclamation-triangle"></i> No data to load</h4> */}
              <i className="fa fa-spinner fa-spin" style={{ fontSize: '18px', color: '#ffffff', height: "min-content" }}></i>
            </div>
        }
        <CustomConfirmModal
          ownClassName={'BenefitActuals-delete-modal'}
          isModalVisible={this.state.customFreqBenefitActualsModalVisible}
          modalTitle={this.state.customFreqBenefitActualsModalTitle}
          closeConfirmModal={this.closeBenActualsFreqConfirmModalHandler}
        />
      </div>
    );
  }
}

export default withRouter(BenefitActualsHome);
