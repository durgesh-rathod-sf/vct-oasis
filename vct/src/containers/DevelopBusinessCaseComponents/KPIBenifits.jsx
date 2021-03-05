import React, { Component, Fragment } from "react";
import { observer, inject } from "mobx-react";
import { withRouter } from "react-router-dom";
import { toast } from 'react-toastify';
import ReactTooltip from 'react-tooltip';
import NumberFormat from 'react-number-format';
import './KpiTable.css';
import KPITable from "./KpiTable";
import NotificationMessage from '../../components/NotificationMessage/NotificationMessage';
import ParameterRuleBuilder from '../../components/FormulaBuilder/ParameterRuleBuilder';
import BenefitRuleBuilder from '../../components/FormulaBuilder/BenefitRuleBuilder';
// import BenifitRuleImg from '../../assets/icons/benefit-rule.png';
import BenifitRuleImg from "../../assets/project/fvdt/BenfitRule.svg";
import ParamRuleImg from "../../assets/project/fvdt/pencil_edit.svg";
import saveIco from "../../assets/project/fvdt/saveIcon.svg";
import CustomConfirmModal from '../../components/CustomConfirmModal/CustomConfirmModal';
import downloadIco from "../../assets/project/fvdt/download.svg";
import uploadIco from "../../assets/project/fvdt/upload.svg";
import infoIcon from "../../assets/project/fvdt/info-Icon.svg";
import arrayMove from "array-move";
var SessionStorage = require('store/storages/sessionStorage');

@inject('kpiBenefitsStore')
@observer
class KPIBenifits extends Component {
  yearArrayLength;
  constructor(props) {
    super(props);
    this.state = {
      benefitArray: [],
      paramArray: [],
      addCommonParam: false,
      errorIndexArr: [],
      currentYear: 0,
      kpiBenefitScreen: true,
      editParameterRule: false,
      editBenefitRule: false,
      benefitParamList: false,
      isLoading: false,
      newColumnAdded: false,
      customDeleteKpiBenefitsModalVisible: false,
      customDeleteKpiBenefitsModalTitle: '',
      deleteKpi: false,
      unitEnabled: '',
      hideTooltips: false,
      deleteLoader : false,
      deleteRowLoader : false
    };
    this.yearArray = [];
    this.onKPIBenefitSaveClick = this.onKPIBenefitSaveClick.bind(this);
    this.setYearArrayLength = this.setYearArrayLength.bind(this);
    this.calculateTotalValuesOnLoad = this.calculateTotalValuesOnLoad.bind(this);
    this.delinkKPIs = this.delinkKPIs.bind(this);
    this.saveKPIBenefits = this.saveKPIBenefits.bind(this);
    this.onAddCommonParam = this.onAddCommonParam.bind(this);
    this.onNewParamChange = this.onNewParamChange.bind(this);
    this.onAddMultiplicationFactor = this.onAddMultiplicationFactor.bind(this);
    this.onChangeMultiplicationFactor = this.onChangeMultiplicationFactor.bind(this);
    this.onMFBlur = this.onMFBlur.bind(this);
    this.onFocusMF = this.onFocusMF.bind(this);
    this.onTargetBlur = this.onTargetBlur.bind(this);
    this.onTargetFocus = this.onTargetFocus.bind(this);
    this.addColoumnHandler = this.addColoumnHandler.bind(this);
    this.showEditHandler = this.showEditHandler.bind(this);
    this.validateChar = this.validateChar.bind(this);
    this.deleteColumnHandler = this.deleteColumnHandler.bind(this);
    this.openDeleteKpiBenefitsConfirmModal = this.openDeleteKpiBenefitsConfirmModal.bind(this);
    this.closeDeleteKpiBenefitsModalHandler = this.closeDeleteKpiBenefitsModalHandler.bind(this);

  }

  onKPIBenefitSaveClick = (event) => {
    const { kpiBenefitsStore } = this.props;
    this.setState({
      isLoading: true,
    });
    if (!this.validateNewlyAddedCPAndMF()) {
      kpiBenefitsStore.focusedKpiId = kpiBenefitsStore.kpiId;
      this.saveKPIBenefits(event.target.id);
      this.setState({
        newColumnAdded: false,
      });
    }
    else {
      if (kpiBenefitsStore.invalidCharErr > 0) {
        this.showNotification('error', '{ [ ( @ + * - / % ^ ) ] } _< > ! " \' , #ref are not allowed in parameter name.');
      }
      else {
        this.showNotification('error', 'Highlighted fields are not valid');
      }
      // adidng below to make save icon clickable after error notification 
      this.setState({
        isLoading: false,
      });
    }
  };

  validateNewlyAddedCPAndMF() {
    const { kpiBenefitsStore } = this.props;
    const { benefitArray } = this.state;
    kpiBenefitsStore.invalidCharErr = 0
    let errorIndexArr = [];
    for (let [paramIndex, param] of benefitArray[0].paramDto.entries()) {
      if (!param.paramName || !param.paramUnit || (param.paramName.trim() === '')) {
        errorIndexArr.push(paramIndex);
      }

      let isValid = this.validateChar(param.paramName);
      if (!isValid) {
        kpiBenefitsStore.invalidCharErr = (kpiBenefitsStore.invalidCharErr + 1);
        errorIndexArr.push(paramIndex);
      }
    }
    this.setState({
      errorIndexArr: [...errorIndexArr]
    });
    return errorIndexArr.length;
  }

  saveKPIBenefits = (id) => {
    const { kpiBenefitsStore } = this.props;
    const { deleteKpi } = this.state;
    let benefitArray = [...kpiBenefitsStore.kpiBenefits];
    let multiplicationFactorInput = [];
    let kpiBenefitCommonParams = [];
    let kpiBenefitInput = [];
    let commonParamsDtos = [];
    let globalParamsDtos = [];
    let mfDtos = [];
    let globalParams = [];
    for (let i = 0; i < benefitArray.length; i++) {
      if (benefitArray[i].kpiId === parseInt(id)) {
        for (let j = 0; j < benefitArray[i].paramDto.length; j++) {
         // if (benefitArray[i].paramDto[j].paramType === 'MF') {
            mfDtos = [];
            for (let k = 0; k < benefitArray[i].paramDto[j].data.length; k++) {
              
              let mfDtosTemp = {
                "kpiYearInfoId":benefitArray[i].paramDto[j].data[k].kpiYearInfoId,
                "paramDataId": benefitArray[i].paramDto[j].data[k].paramDataId,
                "paramValue": benefitArray[i].paramDto[j].data[k].paramValue.actualValue,
                "year": k + 1,
              }
              mfDtos.push(mfDtosTemp);
            }
            let inputArray = {
              "paramId": benefitArray[i].paramDto[j].paramId,
              "paramName": (benefitArray[i].paramDto[j].paramName).trim(),
              "paramUnit": benefitArray[i].paramDto[j].paramUnit,
              //"activeFlag": benefitArray[i].paramDto[j].activeFlag ? "N" : "Y",
              "paramType":benefitArray[i].paramDto[j].paramType,
              "order": benefitArray[i].paramDto[j].order === undefined ? j + 1 : benefitArray[i].paramDto[j].order,
              "data": mfDtos,
            };
            multiplicationFactorInput.push(inputArray);
          }
          /* else if (benefitArray[i].paramDto[j].paramType === 'CP') {
            commonParamsDtos = [];
            for (let k = 0; k < benefitArray[i].paramDto[j].data.length; k++) {
              let CoDtosTemp = {
                "paramVal": benefitArray[i].paramDto[j].data[k].paramValue.actualValue,
                "year": k + 1,
              };
              commonParamsDtos.push(CoDtosTemp);
            }
            let inputArray = {
              "paramName": (benefitArray[i].paramDto[j].paramName).trim(),
              "unit": benefitArray[i].paramDto[j].paramUnit,
              "activeFlag": benefitArray[i].paramDto[j].activeFlag ? "N" : "Y",
              "commonParamsDtos": commonParamsDtos
            }
            kpiBenefitCommonParams.push(inputArray)
          }
          else if (benefitArray[i].paramDto[j].paramType === 'GP') {
            globalParamsDtos = []
            for (let k = 0; k < benefitArray[i].paramDto[j].data.length; k++) {
              let globalParamsDtosTemp = {
                "mfDataId": benefitArray[i].paramDto[j].data[k].paramDataId,
                "paramVal": benefitArray[i].paramDto[j].data[k].paramValue.actualValue,
                "year": k + 1,
              }
              globalParamsDtos.push(globalParamsDtosTemp)
            }
            let inputArray = {
              "paramId": benefitArray[i].paramDto[j].paramId,
              "paramName": (benefitArray[i].paramDto[j].paramName).trim(),
              "paramUnit": benefitArray[i].paramDto[j].paramUnit,
              "activeFlag": benefitArray[i].paramDto[j].activeFlag ? "N" : "Y",
              "globalParamDtos": globalParamsDtos
            }
            globalParams.push(inputArray)
          }
        }*/
      } 
    }

    for (let i = 0; i < benefitArray.length; i++) {
      if (benefitArray[i].kpiId === parseInt(id)) {
        for (let j = 0; j < benefitArray[i].kpiBenefits.length; j++) {
          let InputArray = {
            "kpiBenefitId": benefitArray[i].kpiBenefits[j].kpiBenefitId,
            "benefitValue": benefitArray[i].kpiBenefits[j].benefitValue,
            "kpiYearInfoId": benefitArray[i].kpiBenefits[j].kpiYearInfoId,
            "year": j + 1
          }
          kpiBenefitInput.push(InputArray)
        }
      }
    }

    let payload = {
      "mapId": SessionStorage.read('mapId'),
      "kpiId": parseInt(id),
      "params": multiplicationFactorInput,
      "benefits": kpiBenefitInput,
      //"kpiBenefitCommonParamDtos": kpiBenefitCommonParams,
      //"kpiBenefitGlobalParamDtos": globalParams
    }

    kpiBenefitsStore.saveKPIBenefits(payload)
      .then((response) => {
        if (response && !response.error) {
          this.props.loadKpiBenefitTree();
          let benefitArray = this.props.KPIBenefitsArray;
          this.setState({
            benefitArray: [...benefitArray],
            isLoading: false,
          }, () => {

            this.showNotification('success', 'KPI Benefits saved successfully');

            // if (deleteKpi) {
            //   //this.showNotification('success', 'KPI Benefits Deleted successfully');
            //   this.setState({
            //     deleteKpi: false
            //   })
            // }
            // else { this.showNotification('success', 'KPI Benefits saved successfully'); }

          });
        }
        else {
          this.showNotification('error', kpiBenefitsStore.kpiBenifitsError);
          this.setState({
            isLoading: false,
          });
        }
      });
  };

  showErrorNotification(text) {
    toast.error(<NotificationMessage
        title="Error"
        bodytext={text}
        icon="error"
    />, {
        position: toast.POSITION.BOTTOM_RIGHT
    });
}

  showNotification(type, message = '') {
    // eslint-disable-next-line default-case
    switch (type) {
      case 'success':
        toast.info(
          <NotificationMessage
            title="Success"
            bodytext={message}
            icon="success"
          />, {
          position: toast.POSITION.BOTTOM_RIGHT,
        });
        break;
      case 'error':
        toast.error(
          <NotificationMessage
            title="Error"
            bodytext={message}
            icon="error"
          />, {
          position: toast.POSITION.BOTTOM_RIGHT,
        });
        break;
    }
  }

  componentDidMount() {
    const benefitArray = [...this.props.KPIBenefitsArray];
    this.setState({
      benefitArray: benefitArray,
      selectedKpiObj: benefitArray[0],
      benefitObjClone: { ...JSON.parse(JSON.stringify(this.props.KPIBenefitsArray[0])) },
      //kpiBenefitScreen: true,
    });
  }

  componentDidUpdate(prevProps) {
    if (this.state.benefitArray !== this.props.KPIBenefitsArray) {
    if(prevProps.KPIBenefitsArray[0].kpiId !== this.props.KPIBenefitsArray[0].kpiId 
       && this.props.KPIBenefitsArray[0].kpiBusType === "WITHOUT_BUS_CASE"){
      this.displayKpiBenefitScreen();
    }
      this.setState({
        benefitArray: this.props.KPIBenefitsArray,
        benefitObjClone: { ...JSON.parse(JSON.stringify(this.props.KPIBenefitsArray[0])) },
        errorIndexArr: []
        
      }, () => {
        ReactTooltip.rebuild();
      })
    }
  }

  displayKpiBenefitScreen(){
  
    const { kpiBenefitsStore } = this.props;
    this.setState({
      editParameterRule: false,
        kpiBenefitScreen: true,
        editBenefitRule: false,
  },
  () => {
    kpiBenefitsStore.resetScreenSelected('');
  });
}
  

  componentWillReceiveProps() {
    this.setState({
      benefitArray: this.props.KPIBenefitsArray,
      benefitObjClone: { ...JSON.parse(JSON.stringify(this.props.KPIBenefitsArray[0])) },
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
  openDeleteKpiBenefitsConfirmModal = (title) => {
    let { kpiBenefitsStore } = this.props;
    
    this.setState({
      customDeleteKpiBenefitsModalVisible: true,
      customDeleteKpiBenefitsModalTitle: title
    });
  };
  closeDeleteKpiBenefitsModalHandler = (isYesClicked) => {
    let { kpiBenefitsStore } = this.props;

    this.setState({
      customDeleteKpiBenefitsModalVisible: false,
      customDeleteKpiBenefitsModalTitle: ''
    });
    if (isYesClicked) {
      //new delete function
      this.delinkKPIsConfirm()
    }

  };

  deleteKPIBenefits = (kpiId,paramId,paramType) => {
    let { kpiBenefitsStore} = this.props;
    this.setState({deleteRowLoader : true});
 
    kpiBenefitsStore.deleteKPIBenefits(kpiId,paramId,paramType).then(res =>{
      if(res && res.data && res.data.resultCode === "OK"){
       // this.saveKPIBenefits(kpiId);
        this.props.loadKpiBenefitTree();
        this.setState({deleteRowLoader : false});
        this.showNotification("success",res.data.resultDescription);    

      }else {
        this.setState({deleteRowLoader : false});
        this.showNotification("error",res.data.errorDescription);
      }
    }).catch(err =>{
      this.setState({deleteLoader : false});
      this.showNotification("error",err.message)
    })
  }


  delinkKPIsConfirm() {
    const { kpiBenefitsStore, KPIBenefitsArray } = this.props;
    const { targetId_modal, param_modal, index_modal } = this.state;
    let target_id = targetId_modal;
    let param = param_modal;
    let index = index_modal;
    let kpiId = kpiBenefitsStore.kpiId
    let benefitArray = [...kpiBenefitsStore.kpiBenefits];
    this.setState({
      deleteKpi: true
    }, () => {
      if (param.isNewlyAdded === undefined || !param.isNewlyAdded) {
        for (let i = 0; i < benefitArray.length; i++) {
          if (benefitArray[i].kpiId === kpiId) {
            for (let j = 0; j < benefitArray[i].paramDto.length; j++) {
              if (benefitArray[i].paramDto[j].paramId === parseInt(target_id)) {
                benefitArray[i].paramDto[j].activeFlag = "N";
                if (SessionStorage.read("demoUser") === "false") {
                
                 this.deleteKPIBenefits(kpiId,param.paramId,param.paramType);
                 //this.saveKPIBenefits(kpiId);
                }

              }
            }
          }
        }
      }
      else {
        KPIBenefitsArray[0].paramDto.splice(index, 1);
        this.setState({
          benefitArray: [...KPIBenefitsArray],
          isLoading: false
        })
      }
    });

  }
  delinkKPIs = (event, param, index) => {
    const { benefitObjClone } = this.state;
  let added =   benefitObjClone.paramDto.find(paramData => {      
    if(paramData.isNewlyAdded === true){
      return paramData.isNewlyAdded;
    }});

    let deleteMsg =  added ? "Are you sure you want to delete ? You have unsaved data which might be lost, Please save before deleting it." : "Are you sure you want to delete?";

    this.setState({
      targetId_modal: event.target.id,
      param_modal: param,
      index_modal: index
    })
    this.openDeleteKpiBenefitsConfirmModal(deleteMsg)
    // if (window.confirm("Are you sure you want to delete?")) {
  }

  calculateTotalValuesOnLoad(benefitArray) {
    const rowArr = benefitArray.paramDto.map(param => {
      return param.data.map(paramValObj => {
        if (paramValObj) {
          return param.paramUnit === '%' ? paramValObj.paramValue.actualValue / 100 : paramValObj.paramValue.actualValue;
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
    for (let [index, kpiBenefit] of benefitArray.kpiBenefits.entries()) {
      kpiBenefit.benefitValue = Number(Math.round(Number(productArr[index]) * 10) / 10).toFixed(1);
    }
  }


  onMFBlur = (event, index, yearIndex) => {
    const { KPIBenefitsArray } = this.props;
    let value = KPIBenefitsArray[0].paramDto[index].data[yearIndex].paramValue.actualValue
    KPIBenefitsArray[0].paramDto[index].data[yearIndex].paramValue.formattedValue = value ?
      //  Number(value).toFixed(1)
      Number(Math.round(Number(value) * 10) / 10).toFixed(1)
      : null;
    this.setState({
      currentYear: yearIndex
    })
  }
  onFocusMF = (event, index, yearIndex) => {
    const { KPIBenefitsArray } = this.props;
    let value = KPIBenefitsArray[0].paramDto[index].data[yearIndex].paramValue.actualValue
    KPIBenefitsArray[0].paramDto[index].data[yearIndex].paramValue.formattedValue = value ? value : null;
    this.setState({
      currentYear: yearIndex
    })

  }
  onChangeMultiplicationFactor = (event, index, yearIndex) => {
    const { KPIBenefitsArray } = this.props;
    let value = event.target.value.replace(/,/g, '');
    var decPos = value.indexOf('.');
    var substrLength = decPos === -1 ? value.length : 1 + decPos + 10,
      trimmedResult = value.substr(0, substrLength),
      finalValue = isNaN(trimmedResult) ? 0 : trimmedResult;
    KPIBenefitsArray[0].paramDto[index].data[yearIndex].paramValue.actualValue = finalValue ? Number(finalValue) : null;
    KPIBenefitsArray[0].paramDto[index].data[yearIndex].paramValue.formattedValue = finalValue ? Number(finalValue) : null;
    this.setState({
      currentYear: yearIndex,
    })
  }

  addColoumnHandler = () => {
    const { KPIBenefitsArray } = this.props;
    const exsistingYearCount = KPIBenefitsArray[0].paramDto[0].data.length;
    
    const newBenefitObj = {
      kpiBenefitId: null,
      kpiYearInfoId: null,
      benefitValue: KPIBenefitsArray[0].kpiBenefits[KPIBenefitsArray[0].kpiBenefits.length - 1].benefitValue,
      year: (KPIBenefitsArray[0].kpiBenefits.length + 1),
    };

    KPIBenefitsArray[0].kpiBenefits.push(newBenefitObj);
    KPIBenefitsArray[0].paramDto.map((param) => {

      const newParamObj = {
        paramDataId: null,
        kpiYearInfoId: null,
        paramValue: { 'actualValue': null, 'formattedValue': 0 },
        year: (exsistingYearCount + 1),//6
        activeFlag: 'Y',
      };

      if (param.data.length <= exsistingYearCount) {
        param.data.push(newParamObj);
      }
      if (param.paramType !== 'CP') {
        param.data[param.data.length - 1].paramValue.actualValue = param.data[param.data.length - 2].paramValue.actualValue;
      }
    });
    this.calculateTotalValuesOnLoad(this.props.KPIBenefitsArray[0]);
    this.setState({
      benefitArray: [...this.props.KPIBenefitsArray],
      newColumnAdded: true,
    });
  };

  deleteColumnHandler = (event) => {
    const { KPIBenefitsArray, kpiBenefitsStore } = this.props;
    const { newColumnAdded } = this.state;
    this.setState({deleteLoader : true})
    if (!newColumnAdded) {
      kpiBenefitsStore.deleteExtraYear(this.yearArray.length)
        .then((response) => {
          const { data } = response;
          if (response && !response.error && data.resultCode === 'OK') {
            this.setState({deleteLoader : false})
            this.showNotification('success', 'Data deleted successfully');
            return;
          }else if (response && data.resultCode === 'KO') {
            this.setState({deleteLoader : false})
            this.showNotification('error', data.errorDescription);
           
            return;
          }else{
            this.showNotification('error', 'Sorry! something went wrong');
            this.setState({deleteLoader : false})
          }
         
        });
    }
    KPIBenefitsArray[0].kpiBenefits.pop();
    KPIBenefitsArray[0].paramDto.map((param) => {
      param.data.pop();
    });
    this.calculateTotalValuesOnLoad(this.props.KPIBenefitsArray[0]);
    this.setState({
      benefitArray: [...this.props.KPIBenefitsArray],
    });
  };

  onTargetBlur = (event, index, yearIndex) => {
    const { KPIBenefitsArray } = this.props;
    const value = KPIBenefitsArray[0].paramDto[index].data[yearIndex].paramValue.actualValue;
    KPIBenefitsArray[0].paramDto[index].data[yearIndex].paramValue.formattedValue = value ?
      Number(Math.round(Number(value) * 10) / 10).toFixed(1)
      : null;

    this.setState({
      currentYear: yearIndex,
    });
  };

  onTargetFocus = (event, index, yearIndex) => {
    const { KPIBenefitsArray, KPIDetailsArray } = this.props;
    let value = KPIBenefitsArray[0].paramDto[index].data[yearIndex].paramValue.actualValue
    KPIBenefitsArray[0].paramDto[index].data[yearIndex].paramValue.formattedValue = value ? value : null;

    this.setState({
      currentYear: yearIndex
    })
  }
  onChangeKPITargetEachYear = (event, index, yearIndex) => {
    const { KPIBenefitsArray, KPIDetailsArray } = this.props;
    let value = event.target.value.replace(/,/g, '')
    var decPos = value.indexOf('.');
    var substrLength = decPos === -1 ? value.length : 1 + decPos + 10,
      trimmedResult = value.substr(0, substrLength),
      finalValue = isNaN(trimmedResult) ? 0 : trimmedResult;
    KPIBenefitsArray[0].paramDto[index].data[yearIndex].paramValue.actualValue = finalValue ? Number(finalValue) : null;
    KPIBenefitsArray[0].paramDto[index].data[yearIndex].paramValue.formattedValue = finalValue ? Number(finalValue) : null;

    if (KPIBenefitsArray[0].kpiTrend !== "Increase") {
      let incResult = (-1 * (KPIBenefitsArray[0].paramDto[index].data[yearIndex].paramValue.actualValue - KPIBenefitsArray[0].baseline));
      KPIBenefitsArray[0].paramDto[index + 1].data[yearIndex].paramValue.actualValue = (KPIBenefitsArray[0].paramDto[index].data[yearIndex].paramValue.actualValue === null ? null : (incResult > 0 ? incResult : 0));
    }
    else {
      let decResult = (KPIBenefitsArray[0].paramDto[index].data[yearIndex].paramValue.actualValue - (KPIBenefitsArray[0].baseline));
      KPIBenefitsArray[0].paramDto[index + 1].data[yearIndex].paramValue.actualValue = (KPIBenefitsArray[0].paramDto[index].data[yearIndex].paramValue.actualValue === null ? null : (decResult > 0 ? decResult : 0));

    }
    this.setState({
      currentYear: yearIndex
    }, () => {
      ReactTooltip.rebuild();
    })
  }

  onAddCommonParam() {
    const { kpiBenefitsStore } = this.props;
    const buildParamValuesArray = () => {
      return this.yearArray.map(yearVal => {
        return {
          paramDataId: null,
          paramValue: { "actualValue": null, "formattedValue": 0 },
          year: yearVal,
          activeFlag: 'Y'
        }
      })
    }

    const newParamObj = {
      paramId: null,
      paramType: 'CP',
      paramName: '',
      unit: '',
      data: buildParamValuesArray(),
    };
    this.props.KPIBenefitsArray[0].paramDto.push(newParamObj);
    kpiBenefitsStore.fetchParamsForKpiBenefits(this.state.benefitArray[0].kpiId)
      .then(response => {
        const { data } = response;
        if (response && !response.error && data.resultCode === 'OK') {
          this.setState({
            paramArray: [...response.data.resultObj],
            addCommonParam: true
          });
        }else if (data.resultCode === 'KO') {
            this.showErrorNotification(data.errorDescription);
        }

      });
  }

  validateChar(event) {
    let charArray = ["@", "+", "*", "-", "/", "%", "^", "(", ")", "{", "}", "_", "[", "]", "<", ">", "!", "'", "/"];
    let isValidChar = true;
    charArray.map((char) => {
      if ((event.indexOf(char) !== -1) || event.toUpperCase().includes('#REF')) {
        isValidChar = false
      }
      return true
    })
    return isValidChar;
  }

  showUnitOnClick = (e) => {
      if(e.target.id !== ''){
      this.setState({
          unitEnabled: e.target.id, 
      })       
  }
  }
  onCpUnitBlur = (e) => {
      this.setState({
          unitEnabled:'',
      })
  }

  onNewParamChange(event, index) {
    if (index === "NA") {
      this.setState({
        paramNameEntered: event.target.value.replace(/,/g, '')
      })
    }
    else {
      const {  benefitArray } = this.state;
      const {cParamArray} = this.props;
      let benefitArr = this.props.KPIBenefitsArray;
      let individualParamObj = {};
      for (let param of cParamArray) {
        if (param.cpName.trim().toUpperCase() === event.target.value.trim().toUpperCase()) {
          individualParamObj = param;
        }
      }
      // if (isValid) {
      if (individualParamObj.cpId !== undefined) {
        benefitArray[0].paramDto[index].paramType = 'CP'
        this.setParamValuesForSelectedParam(benefitArr[0].paramDto[index], individualParamObj);
      }
      else {
        benefitArray[0].paramDto[index].paramType = 'MF'
        benefitArray[0].paramDto[index].paramName = event.target.value.replace(/,/g, '');
        // added below logic to make year fields empty
        // when input text doesn't match with existing parameter names
        // benefitArray[0].paramDto[index].unit = null;
        /*benefitArray[0].paramDto[index].data.map((param, ind) => {
          param.paramValue['actualValue'] = null;
          param.paramValue['formattedValue'] = 0;
          return true;
        }); */
        this.setState({
          benefitArray: benefitArray,
          isLoading: false
        })
      }
    }
    // }
  }

  setParamValuesForSelectedParam(paramDtoObj, indParamObj) {
    const { KPIBenefitsArray } = this.props;
    paramDtoObj.paramName = indParamObj.cpName.trim();
    paramDtoObj.paramUnit = indParamObj.cpUnit;
    paramDtoObj.paramId = indParamObj.cpId;
    paramDtoObj.data = indParamObj.data.map(val => { //8val
      return { paramDataId: val.cpDataId,
        paramValue: { "actualValue": val.cpParamValue, "formattedValue": 0 },
        kpiYearInfoId: val.cpYearInfoId,
   }
    });
    let maxYear = KPIBenefitsArray[0].paramDto[0].data.length; //9
    if (paramDtoObj.data.length < maxYear) {
      let remainingYears = Number(maxYear) - Number(paramDtoObj.data.length);
      for (let i = 1; i <= remainingYears; i++) {
        paramDtoObj.data.push(
          { 
           paramValue: { "actualValue": null, "formattedValue": 0 },
            }
        )
      }

    }
    this.calculateTotalValuesOnLoad(this.props.KPIBenefitsArray[0])
    this.setState({
      benefitArray: [...this.props.KPIBenefitsArray],
      isLoading: false
    })
  }

  onAddMultiplicationFactor() {
    const { kpiBenefitsStore } = this.props;
    const buildParamValuesArray = () => {
      return this.yearArray.map(yearVal => {
        return {
          paramDataId: null,
          kpiYearInfoId: null,
          paramValue: { "actualValue": null, "formattedValue": 0 },
          year: yearVal,
          kpiYearInfoId: null,
       
          //activeFlag: 'Y'
        }
      })
    }
    const newParamObj = {
      paramId: null,
      paramType: 'MF',
      paramName: '',
      paramUnit: '',
      isNewlyAdded : true,
      data: buildParamValuesArray()
    }
    this.props.KPIBenefitsArray[0].paramDto.push(newParamObj)
    // this.props.fetchParamsForKpiBenefits(this.state.benefitArray[0].kpiId);
    
    this.setState({
      benefitArray: [...this.props.KPIBenefitsArray]
    })
  }

  

  onNewMFNameChange = (event, index) => {
    const { benefitArray } = this.state;
    benefitArray[0].paramDto[index].paramName = event.target.value.replace(/,/g, '');
  }

  doesParamExist = (currentParam) => {
    const { benefitObjClone } = this.state;
    for (let param of benefitObjClone.paramDto) {
      if (currentParam.paramId && currentParam.paramName && currentParam.paramName === param.paramName) {
        return true;
      }
    }
    return false;
  }

  doesParamNewlyAdded = (currentParam) => {
    const { benefitObjClone } = this.state;
    for (let param of benefitObjClone.paramDto) {
      if (currentParam.paramName === param.paramName && currentParam.isNewlyAdded) {
        return true;
      }
    }
    return false;
  }

  onSetNewMFUnit = (event, index) => {

    const { benefitArray } = this.state;
    benefitArray[0].paramDto[index].paramUnit = event.target.value;
    this.setState({
      isLoading: false
    });


  }

  showEditHandler = (type) => {
    const { kpiBenefitsStore } = this.props;
    if (type === 'Parameter') {
      this.setState({
        editParameterRule: true,
        kpiBenefitScreen: false,
        editBenefitRule: false,
      }, () => {
        kpiBenefitsStore.screenSelected = 'editParam';
      });
    } else if (type === 'Benefit') {
      this.setState({
        editParameterRule: false,
        kpiBenefitScreen: false,
        editBenefitRule: true,
      }, () => {
        kpiBenefitsStore.screenSelected = "benefit";
      });
    }
    this.getParamList();
    return;
  };

  getParamList = () => {
    const { kpiBenefitsStore } = this.props;
    kpiBenefitsStore.getBenefitParam()
      .then((response) => {
        if (response && !response.error && response.data.resultCode === 'OK') {
          // var uniqueArray = this.removeDuplicates(response, "paramName");
          this.setState({
            benefitParamList: response.data.resultObj
            // uniqueArray,
          });
        } else if(response.data.resultCode === 'KO') {
          this.showErrorNotification(response.data.errorDescription);
          this.setState({
            benefitParamList: false,
          });
        }
      });
  }

  removeDuplicates(originalArray, prop) {
    var newArray = [];
    var lookupObject = {};

    for (var i in originalArray) {
      lookupObject[originalArray[i][prop]] = originalArray[i];
    }

    for (i in lookupObject) {
      newArray.push(lookupObject[i]);
    }
    return newArray;
  }

  closeEditHandler = (action) => {
    if (action === 'savenclose') {
      this.props.fetchKpiBenefits();
    }
    this.setState({
      editParameterRule: false,
      kpiBenefitScreen: true,
      editBenefitRule: false,
    });
  }

  onSortEnd = (oldIndex, newIndex) => {
    const {benefitArray} = this.state;
    let tempKPIBenefitsArray = [...benefitArray];
    if(tempKPIBenefitsArray[0].paramDto.length > 2){
        let sortedList = arrayMove(tempKPIBenefitsArray[0].paramDto, oldIndex, newIndex)

        sortedList.map((row, index) =>{
            row.order = index+1
        })
        tempKPIBenefitsArray[0].paramDto = sortedList
        
        this.setState({
            benefitArray : tempKPIBenefitsArray,
            hideTooltips : false
        });
    }   
  }

  beforeSorting = ({node, index}, event) => {
    this.setState({
        hideTooltips : true
    })
  }

  render() {
    const { kpiBenefitsStore } = this.props;
    const { KPIBenefitsArray } = this.props;
    const { kpiBenefitScreen, editBenefitRule, editParameterRule, benefitParamList, isLoading } = this.state;
    const TypeOfKpi = (KPIBenefitsArray && KPIBenefitsArray[0].kpiType)
    const TypeOfBusType = (KPIBenefitsArray && KPIBenefitsArray[0].kpiBusType)
    const getTooltipData = value => {
      if (value) {
        let val = String(value).replace(/(?<!\..*)(\d)(?=(?:\d{3})+(?:\.|$))/g, '$1,');
        return `${val}`;
      }
    }

    return (
      <div style={{
        // background: '#ffffff', marginTop: '0.5%', padding: '0', width: "-webkit-fill-available", position: 'sticky', top: '0' 
        position: 'sticky', top: '0', margin: "0.5rem"
      }}
      >


        {
          kpiBenefitScreen &&
          <Fragment>
            <div className="row tab" style={{ position: "absolute", justifyContent: "flex-end", width: "100%", top: "-4.8rem" }}>
              <div style={{ marginTop: "5px" }} >
                <span
                  className="kpiBenifit-operationBtn"
                  style={{
                    zIndex: 1,
                    cursor: (SessionStorage.read("isMaster") === "Y" || (SessionStorage.read("accessType") === "Read")) ? "not-allowed" : ((TypeOfKpi === "NON_FINANCIAL" || (TypeOfKpi === "FINANCIAL" && TypeOfBusType === "WITHOUT_BUS_CASE") ) ? "default" : "pointer")
                  }}
                  onClick={()=> (SessionStorage.read("isMaster") === "Y" || (SessionStorage.read("accessType") === "Read") || (TypeOfKpi === "NON_FINANCIAL") || (TypeOfKpi === "FINANCIAL" && TypeOfBusType === "WITHOUT_BUS_CASE") ) ? 'return false;' : this.showEditHandler('Parameter')}
                  data-tip=""
                  data-for="kpib-paramrule-tooltip"
                  data-place="top" >

                  <img src={ParamRuleImg} alt="paramRule"
                    style={{
                      cursor: (SessionStorage.read("isMaster") === "Y" || (SessionStorage.read("accessType") === "Read")) ? "not-allowed" : ((TypeOfKpi === "NON_FINANCIAL" || (TypeOfKpi === "FINANCIAL" && TypeOfBusType === "WITHOUT_BUS_CASE") ) ? "default" : "pointer"),
                      opacity: (SessionStorage.read("isMaster") === "Y" || (SessionStorage.read("accessType") === "Read") || (TypeOfKpi === "NON_FINANCIAL" || (TypeOfKpi === "FINANCIAL" && TypeOfBusType === "WITHOUT_BUS_CASE") )) ? "0.5" : "unset", width: "25px"
                    }}

                  />
                </span>
                <ReactTooltip id="kpib-paramrule-tooltip" className="tooltip-class">
                  <span>Edit Parameter Rule</span>
                </ReactTooltip>

                <span
                  style={{
                    zIndex: 1,
                    cursor: (SessionStorage.read("isMaster") === "Y" || (SessionStorage.read("accessType") === "Read")) ? "not-allowed" : ((TypeOfKpi === "NON_FINANCIAL" || (TypeOfKpi === "FINANCIAL" && TypeOfBusType === "WITHOUT_BUS_CASE") ) ? "default" : "pointer"),
                    opacity: (SessionStorage.read("isMaster") === "Y" || (SessionStorage.read("accessType") === "Read") || (TypeOfKpi === "NON_FINANCIAL" || (TypeOfKpi === "FINANCIAL" && TypeOfBusType === "WITHOUT_BUS_CASE") )) ? "0.5" : "unset"
                  }}
                  onClick={()=> (SessionStorage.read("isMaster") === "Y" || (SessionStorage.read("accessType") === "Read") || (TypeOfKpi === "NON_FINANCIAL" || (TypeOfKpi === "FINANCIAL" && TypeOfBusType === "WITHOUT_BUS_CASE") )) ? 'return false;' : this.showEditHandler('Benefit')}
                  data-tip=""
                  data-for="kpib-benifitrule-tooltip"
                  data-place="top">
                  <img src={BenifitRuleImg}
                    // className="kpiBenifit-operationBtn-icon"
                    style={{
                      paddingBottom: "10px",
                      cursor: (SessionStorage.read("isMaster") === "Y" || (SessionStorage.read("accessType") === "Read")) ? "not-allowed" : ((TypeOfKpi === "NON_FINANCIAL" || (TypeOfKpi === "FINANCIAL" && TypeOfBusType === "WITHOUT_BUS_CASE") ) ? "default" : "pointer")
                    }}
                    alt="Edit Benefit Rule" />
                </span>
                <ReactTooltip id="kpib-benifitrule-tooltip" className="tooltip-class"><span>Edit Benefit Rule</span></ReactTooltip>

                <span
                  className="kpiBenifit-operationBtn"
                  style={{
                    opacity: (SessionStorage.read("isMaster") === "Y" || (SessionStorage.read("accessType") === "Read") || isLoading) ? "0.5" : "unset",
                    cursor: (SessionStorage.read("isMaster") === "Y" || (SessionStorage.read("accessType") === "Read")|| isLoading) ? "not-allowed" : "pointer"
                  }}
                  id={this.props.KPIBenefitsArray[0] && this.props.KPIBenefitsArray[0].kpiId}
                  onClick={(SessionStorage.read("isMaster") === "Y" || (SessionStorage.read("accessType") === "Read")) ? () => {} : isLoading ? () => {} : this.onKPIBenefitSaveClick}
                  disabled={SessionStorage.read("demoUser") === "true" ? true : (isLoading ? true : false)}
                  data-tip=""
                  data-for="kpib-save-tooltip"
                  data-place="top" >
                  <img src={saveIco} alt="" className="save-img" id={this.props.KPIBenefitsArray[0] && this.props.KPIBenefitsArray[0].kpiId} />
                  {isLoading ? 
                 <i className="fa fa-spinner fa-spin" style={{ color: '#ffffff',position:"absolute",margin:"20px -20px",fontSize:"15px" ,cursor:"default"}}></i>
                 :"" } 
                </span>
                <ReactTooltip id="kpib-save-tooltip" className="tooltip-class">
                  <span>Save</span>
                </ReactTooltip>
                {/* adding icons */}
                <span
                  // className="kpiBenifit-operationBtn"
                  style={{  opacity: (isLoading ? "0.5" : "unset"),
                  cursor:(this.props.isLoading ?"default" : "pointer"),
                 }}
                  // id={this.props.KPIBenefitsArray[0] && this.props.KPIBenefitsArray[0].kpiId}
                  // onClick={(SessionStorage.read("isMaster") === "Y" || (SessionStorage.read("accessType") === "Read")) ? 'return false;' : (isLoading ? () => { } : this.onKPIBenefitSaveClick)}
                  onClick={this.props.isLoading? ()=>{} : this.props.handleDownload}
                  // disabled={SessionStorage.read("demoUser") === "true" ? true : (isLoading ? true : false)}
                  data-tip=""
                  data-for="kpib-download-tooltip"
                  data-place="top" >
                  <img src={downloadIco} alt="download" style={{ paddingBottom: "10px", marginRight: "5px" }} id={this.props.KPIBenefitsArray[0] && this.props.KPIBenefitsArray[0].kpiId} />
                 {this.props.isLoading ? 
                 <i className="fa fa-spinner fa-spin" style={{ color: '#ffffff',position:"absolute",margin:"17px -28px",fontSize:"15px" ,cursor:"default"}}></i>
           :"" } 
                </span>
                <ReactTooltip id="kpib-download-tooltip" className="tooltip-class">
                  <span>Generate Data Template</span>
                </ReactTooltip>

                <span
                  className="kpiBenifit-operationBtn"
                  style={{ margin: "0px" }}
                  // id={this.props.KPIBenefitsArray[0] && this.props.KPIBenefitsArray[0].kpiId}
                  // onClick={(SessionStorage.read("isMaster") === "Y" || (SessionStorage.read("accessType") === "Read")) ? 'return false;' : (isLoading ? () => { } : this.onKPIBenefitSaveClick)}
                  onClick={this.props.handleupload}
                // disabled={SessionStorage.read("demoUser") === "true" ? true : (isLoading ? true : false)}
                ><label htmlFor="file" style={{ marginBottom: 0 }}>
                    <img src={uploadIco}
                      data-tip=""
                      data-for="kpib-upload-tooltip"
                      data-place="top"
                      style={{ cursor: (SessionStorage.read("isMaster") === "Y" || (SessionStorage.read("accessType") === "Read")) ? "not-allowed" : "pointer", marginLeft: "5px", marginRight: "10px", opacity: (SessionStorage.read("isMaster") === "Y" || (SessionStorage.read("accessType") === "Read")) ? "0.5" : "unset" }} alt="upload" id={this.props.KPIBenefitsArray[0] && this.props.KPIBenefitsArray[0].kpiId} />
                    <ReactTooltip id="kpib-upload-tooltip" className="tooltip-class">
                      <span>Ingest Data</span>
                    </ReactTooltip>
                  </label >
                  <input type="file"
                    disabled={SessionStorage.read('accessType') === 'Read' || SessionStorage.read("isMaster") === "Y"}
                    style={{ height: "32px", opacity: "0", position: "absolute", zIndex: "-1" }}
                    name="file" id="file" onChange={(e) => this.props.onIngestHandle(e)} /></span>
                {/* adding icons end */}
              </div>
              {/* <div className="Icon_sub_menu" style={{ marginRight: "72px" }} /> */}
            </div>
            <div className="row baselineTable" >
              <div className="cell-styles">
                KPI Unit : {" "}
                {this.props.KPIBenefitsArray[0] && this.props.KPIBenefitsArray[0].kpiUnit}
              </div>
              <div className="cell-styles" >
                Baseline : {" "}
                <div
                  style={{ display: "contents" }}
                  data-tip=""
                  data-for="kpib-baseline-tooltip"
                  data-place="top" >
                  <NumberFormat
                    disabled
                    className="numberformat"
                    thousandSeparator={true}
                    value={this.props.KPIBenefitsArray[0] && Number(Math.round(Number(this.props.KPIBenefitsArray[0].baseline) * 10) / 10).toFixed(1)}
                  /></div>
                <ReactTooltip id="kpib-baseline-tooltip" className="tooltip-class">
                  <span>{this.props.KPIBenefitsArray[0].baseline}</span>
                </ReactTooltip>
              </div>
              <div className="cell-styles">
                Target : {" "}
                <div
                  style={{ display: "contents" }}
                  data-tip=""
                  data-for="kpib-target-tooltip"
                  data-place="top" >
                  <NumberFormat
                    disabled
                    className="numberformat"
                    thousandSeparator={true}
                    value={this.props.KPIBenefitsArray[0] && Number(Math.round(Number(this.props.KPIBenefitsArray[0].target) * 10) / 10).toFixed(1)}
                  />
                </div>
                <ReactTooltip id="kpib-target-tooltip" className="tooltip-class">
                  <span>{this.props.KPIBenefitsArray[0].target}</span>
                </ReactTooltip>
              </div>
              <div className="cell-styles" style={{ width: (TypeOfKpi === "NON_FINANCIAL" || (TypeOfKpi === "FINANCIAL" && TypeOfBusType === "WITHOUT_BUS_CASE") ? "30%" : "40%") }}>
                Time to Achieve Target : {" "}
                {this.props.KPIBenefitsArray[0] && this.props.KPIBenefitsArray[0].targetAchieved}
              </div>
              {TypeOfKpi === "NON_FINANCIAL" || (TypeOfKpi === "FINANCIAL" && TypeOfBusType === "WITHOUT_BUS_CASE") ?
                <Fragment>
                  <div className="cell-styles" style={{ width: "10%", textAlign: "-webkit-center" }}  >
                    <div data-tip="" data-for="kpib-target-info-tooltip" data-place="left" style={{ width: "18px" }}>
                      <img src={infoIcon} alt="info" style={{ width: "18px" }} />
                    </div>
                    <ReactTooltip id="kpib-target-info-tooltip" className="tooltip-class">
                      <span style={{ fontWeight: "normal" }} >*KPIs without Financial Benefits are not included in the Business case</span>
                    </ReactTooltip>
                  </div>

                </Fragment>

                : ""}

            </div>
            {
              (this.state.benefitArray.length > 0 && !this.props.isLoadingCP) ?
                <KPITable
                  paramValuesArray={this.state.paramValuesArray}
                  setYearArrayLength={this.setYearArrayLength}
                  addCommonParam={this.state.addCommonParam}
                  paramNameEntered={this.state.paramNameEntered}
                  paramUnitSelected={this.state.paramUnitSelected}
                  onNewParamChange={this.onNewParamChange}
                  validateChar={this.validateChar}
                  paramArray={this.props.cParamArray}
                  doesParamExist={this.doesParamExist}
                  onNewMFNameChange={this.onNewMFNameChange}
                  errorIndexArr={this.state.errorIndexArr}
                  onSetNewMFUnit={this.onSetNewMFUnit}
                  KPIBenefitsArray={this.state.benefitArray}
                  BenifitsArray={KPIBenefitsArray}
                  onChangeMultiplicationFactor={this.onChangeMultiplicationFactor}
                  onMFBlur={this.onMFBlur}
                  onFocusMF={this.onFocusMF}
                  onChangeKPITargetEachYear={this.onChangeKPITargetEachYear}
                  onTargetBlur={this.onTargetBlur}
                  onTargetFocus={this.onTargetFocus}
                  kpiId={kpiBenefitsStore.kpiId}
                  delinkKPIs={this.delinkKPIs}
                  addColoumnHandler={this.addColoumnHandler}
                  deleteColumnHandler={this.deleteColumnHandler}
                  onAddMultiplicationFactor={this.onAddMultiplicationFactor}
                  showUnitOnClick={this.showUnitOnClick}
                  onCpUnitBlur={this.onCpUnitBlur}
                  unitEnabled={this.state.unitEnabled}
                  onSortEnd= {this.onSortEnd}
                  beforeSorting ={this.beforeSorting}
                  hideTooltips = {this.state.hideTooltips}
                  deleteLoader ={this.state.deleteLoader}
                />
                : 
                <div className="row" style={{marginTop: '2rem', justifyContent: 'center'}}>
                  
                    <i className="fa fa-spinner fa-spin" style={{ fontSize: '18px', color: '#ffffff', height: "min-content" }}></i>
                  
                </div>
            }
          </Fragment>
        }
        {
          (editParameterRule && benefitParamList) &&
          <ParameterRuleBuilder
            closeEditHandler={this.closeEditHandler}
            paramList={benefitParamList}
            kpiBenefitsStore={this.props.kpiBenefitsStore}
          />
        }
        {
          (editBenefitRule && benefitParamList) &&
          <BenefitRuleBuilder
            closeEditHandler={this.closeEditHandler}
            paramList={benefitParamList}
            kpiBenefitsStore={this.props.kpiBenefitsStore}
          />
        }
        {this.state.customDeleteKpiBenefitsModalVisible ?
        <CustomConfirmModal
          ownClassName={'KpiBenfits-delete'}
          isModalVisible={this.state.customDeleteKpiBenefitsModalVisible}
          modalTitle={this.state.customDeleteKpiBenefitsModalTitle}
          closeConfirmModal={this.closeDeleteKpiBenefitsModalHandler}
        />
        : ""
      }
      </div>
    );
  }
}

export default withRouter(KPIBenifits);
