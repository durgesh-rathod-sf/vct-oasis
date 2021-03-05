import React, { Component, Fragment } from 'react';
import { withRouter } from 'react-router-dom';
import { inject } from 'mobx-react';
import './CommonData.css';
import { toast } from 'react-toastify';
import NotificationMessage from '../../components/NotificationMessage/NotificationMessage';
import ReviewValueDriverTreeHeader from '../../components/ReviewValueDriverTreeHeader/ReviewValueDriverTreeHeader';
import ValueDriverTreeNew from '../../components/ValueDriverTree/ValueDriverTreeNew';
import '../DevelopBusinessCaseNavbar/developBusinessCaseNavbar.css';
import NumberFormat from 'react-number-format';
import plusIco_brackets from "../../assets/project/fvdt/plusWithBackets.svg";
import plusIco from "../../assets/project/fvdt/addRowIcon.svg";
import deleteIcon from "../../assets/newDealsIcons/trashdelete.svg";
import saveIco from "../../assets/project/fvdt/saveIcon.svg";
import ReactTooltip from 'react-tooltip';
import CustomConfirmModal from '../../components/CustomConfirmModal/CustomConfirmModal';
import downloadIco from "../../assets/project/fvdt/download.svg";
import uploadIco from "../../assets/project/fvdt/upload.svg";
import dragDropIcon from "../../assets/newDealsIcons/cpDragDrop.svg";
import * as _ from "lodash";
import arrayMove from "array-move";

import {
    sortableContainer,
    sortableElement,
    sortableHandle,
  } from 'react-sortable-hoc';

var SessionStorage = require('store/storages/sessionStorage');

const DragHandle = sortableHandle(
    ({param , getTooltipValue}) => 
        <>
            <img
                data-tip=""
                data-for= {`drag_icon_tt_${param.order}`}
                data-place="left" src={dragDropIcon} alt="icon"
                className="delete-buttonIcn"
                style={{ cursor: 'grab'
                   
                }}
            />
            
        </>
    //<span>{param.cpName}</span>
    );

const SortableItem = sortableElement(({param, paramIndex, getTooltipData, getTooltipValue, errorIndexArr,
    unitEnabled, maxIndexOnLoad, doesParamExist, deleteParameterHandler, kpiUnits, onNewCommonParamNameChange,
    setUnitForNewCommonParam, onInputFocus, onInputBlur, onChangeParamValue, deleteNewlyAddedParam, showUnitOnClick, 
    onBlur, selected_option,commonParamsList
    }) => (
     
    <tr className={errorIndexArr.includes(paramIndex) ? 'error-border' : ''}>
                                                <td className={`headcol cp-name-col ${selected_option === 'sales' ? 'opp' : 'pro'}`}>{
                                                    <input type="text"
                                                        id={`newCommonParam_${paramIndex}`}
                                                        className="new-param-name-input new_input"
                                                        placeholder="Enter parameter name"
                                                        onChange={(event) => onNewCommonParamNameChange(event, paramIndex)}
                                                        value={param.cpName}
                                                        autoComplete="off"
                                                    />
                                                }</td>
                                                <td className="cp-unit-col" id={paramIndex} onClick = {(e) => showUnitOnClick(e)
                                                } onBlur = {(e) => onBlur(e)} style={{ textAlignLast: "center" }}>{param.cpUnit && !errorIndexArr.includes(paramIndex)
                                                    && doesParamExist(param) && paramIndex.toString() !== unitEnabled
                                                    ?
                                                    param.cpUnit :
                                                    <select onChange={(event) => setUnitForNewCommonParam(event, paramIndex)} className="slectCD"
                                                    value={param.cpUnit}>
                                                        <option value={''}  disabled>Unit</option>
                                                        {
                                                            kpiUnits.map(kpiUnit => <option value={kpiUnit}>
                                                                {kpiUnit}
                                                            </option>)
                                                        }
                                                    </select>
                                                }</td>

                                                {param.data && param.data.map((value, index) => (
                                                    
                                                    <td key={`${paramIndex}_${index}`} className="cp-year-col"
                                                        >
                                                            {value && value.cpParamValue.actualValue ?
                                                            <Fragment>
                                                                <div className="cp-year-data-input input-group mb-3" data-for={`cp_data_${paramIndex}_year_${index}`}
                                                        data-tip=''>
                                                            <NumberFormat
                                                                id={`param_${paramIndex}_year_${index}`}
                                                                name={param.cpName}
                                                                thousandSeparator={true}
                                                                className="form-control"
                                                                style={{
                                                                    fontSize: '10px',
                                                                    borderRadius: '0px',
                                                                    border: 'none',
                                                                    padding: "0px",
                                                                    textAlignLast: "right",
                                                                }}

                                                                onFocus={(event) => onInputFocus(event, paramIndex, index)}
                                                                onBlur={(event) => onInputBlur(event, paramIndex, index)}
                                                                value={(value.cpParamValue.formattedValue > 0 ? value.cpParamValue.formattedValue : (value.cpParamValue.actualValue === null ? '' :
                                                                    Number(Math.round(Number(value.cpParamValue.actualValue) * 10) / 10).toFixed(1)
                                                                ))}
                                                                onChange={(event) => onChangeParamValue(event, paramIndex, index)}
                                                            />
                                                        </div>
                                                        <ReactTooltip id={`cp_data_${paramIndex}_year_${index}`}>
                                                    <span>{getTooltipData(value && value.cpParamValue.actualValue ? value.cpParamValue.actualValue : null)}</span>
                                                    </ReactTooltip>
                                                            </Fragment>
                                                            : <Fragment>
                                                                <div className="cp-year-data-input input-group mb-3">
                                                            <NumberFormat
                                                                id={`param_${paramIndex}_year_${index}`}
                                                                name={param.cpName}
                                                                thousandSeparator={true}
                                                                className="form-control"
                                                                style={{
                                                                    fontSize: '10px',
                                                                    borderRadius: '0px',
                                                                    border: 'none',
                                                                    padding: "0px",
                                                                    textAlignLast: "right",
                                                                }}

                                                                onFocus={(event) => onInputFocus(event, paramIndex, index)}
                                                                onBlur={(event) => onInputBlur(event, paramIndex, index)}
                                                                value={(value.cpParamValue.formattedValue > 0 ? value.cpParamValue.formattedValue : (value.cpParamValue.actualValue === null ? '' :
                                                                    Number(Math.round(Number(value.cpParamValue.actualValue) * 10) / 10).toFixed(1)
                                                                ))}
                                                                onChange={(event) => onChangeParamValue(event, paramIndex, index)}
                                                            />
                                                        </div>
                                                        
                                                            </Fragment>
                                                            }
                                                        
                                                    </td>
                                                ))}
                                                
                                                    
                                                        <td className="cp-options-col" 
                                                            >
                                                                {(commonParamsList.length > 1)?
                                                                    <Fragment><DragHandle param={param} getTooltipValue={getTooltipValue}/>
                                                                <ReactTooltip id={`drag_icon_tt_${param.order}`}
                                                                    className="drag-icon" >Drag & Reorder</ReactTooltip>
                                                                    </Fragment>:""
                                                                    }
                                                            <img
                                                                data-tip={getTooltipValue("Delete")}
                                                                onClick={(SessionStorage.read("isMaster") === "Y" || (SessionStorage.read("accessType") === "Read"))
                                                                ? 'return false;' : (event) => deleteParameterHandler(param.cpId, paramIndex)}
                                                                data-place="left" src={deleteIcon} alt="" className="delete-buttonIcn" 
                                                                id={`delete_cp_${paramIndex}`}
                                                                data-for={`deleteparam_tooltip_${paramIndex}`}
                                                                style={{
                                                                    marginLeft: '8px',
                                                                    cursor: (SessionStorage.read("isMaster") === "Y" || (SessionStorage.read("accessType") === "Read")) ? "not-allowed" : "pointer",
                                                                    opacity: (SessionStorage.read("isMaster") === "Y" || (SessionStorage.read("accessType") === "Read")) ? "0.5" : "unset",
                                                                }}
                                                            />
                                                            <ReactTooltip id={`deleteparam_tooltip_${paramIndex}`} className="tooltip-class">
                                                                <span>Delete</span>
                                                                </ReactTooltip> 

                                                        </td>
                                            </tr>
));
  
const SortableContainer = sortableContainer(({children}) => {
return <tbody>{children}</tbody>;
});

@inject('reviewValueDriverStore', 'commonParamsStore', 'kpiBenefitsStore')
class CommonData extends Component {
    kpiUnits = ['#', '$', '%', '#/$'];
    constructor(props) {
        super(props);
        this.state = {
            isTabVdtLoading: true,
            commonParamsList: [],
            benefitProfileList: [],
            benefitProfileKeys: [],
            individualBenefitProfileKeys: [],
            paramValueArr: [],
            selectedParamName: '',
            selectedYear: '',
            selectedParamVal: '',
            selectedUnit: '',
            selectedParamIdArr: [],
            selectedParamSource: [],
            errorIndexArr: [],
            deleteLoader: false,
            newColumnAdded: false,
            customDeleteNewParamModalVisible: false,
            customDeleteNewParamModalTitle: '',

            customDeleteExistingParamModalVisible: false,
            customDeleteExistingParamModalTitle: '',
            unitEnabled: '',
            nameChangeModalVisible: false,
            nameChangeModalTitle: '',
            hideTooltips: false,
            isloading:false
        };

        // Refs
        this.containerEl = null;

        this.openPopup = false;
        this.changeNameIndexesArray = [];
        this.onSaveCommonParam = this.onSaveCommonParam.bind(this);
        this.onAddCommonParam = this.onAddCommonParam.bind(this);
        this.onChangeParamValue = this.onChangeParamValue.bind(this);
        this.onSaveBenefitProfile = this.onSaveBenefitProfile.bind(this);
        this.showNotification = this.showNotification.bind(this);
        this.setUnitForNewCommonParam = this.setUnitForNewCommonParam.bind(this);
        this.fetchCommonParameters = this.fetchCommonParameters.bind(this);
        this.generateVdt = this.generateVdt.bind(this);
        this.deleteParameterHandler = this.deleteParameterHandler.bind(this);
        this.onInputFocus = this.onInputFocus.bind(this);
        this.onInputBlur = this.onInputBlur.bind(this);
        this.addNewYear = this.addNewYear.bind(this);
        this.deleteYearHandler = this.deleteYearHandler.bind(this);
        this.openDeleteNewParamConfirmModal = this.openDeleteNewParamConfirmModal.bind(this);
        this.closeDeleteNewParamModalHandler = this.closeDeleteNewParamModalHandler.bind(this);
        this.openDeleteExistingParamConfirmModal = this.openDeleteExistingParamConfirmModal.bind(this);
        this.closeDeleteExistingParamModalHandler = this.closeDeleteExistingParamModalHandler.bind(this);
        this.onNewCommonParamNameChange = this.onNewCommonParamNameChange.bind(this);
        this.showUnitOnClick = this.showUnitOnClick.bind(this);
        this.doesParamExist = this.doesParamExist.bind(this);
        
        this.deleteNewlyAddedParam = this.deleteNewlyAddedParam.bind(this);
        this.onBlur = this.onBlur.bind(this);

        this.openNameChangeModal = this.openNameChangeModal.bind(this);
        this.closeNameChangeModal = this.closeNameChangeModal.bind(this);
        // this.checkForMasterOrReadAccess = this.checkForMasterOrReadAccess.bind(this);

    }

    helperFun = () => {
        return this.containerEl;
    }

    onSortEnd = ({oldIndex, newIndex}) => {

        const {commonParamsList} = this.state;
        let tempCommonParamsList = [...commonParamsList];

        let sortedList = arrayMove(tempCommonParamsList, oldIndex, newIndex)

        sortedList.map((row, index) =>{
            row.order = index+1
        })
        
        this.setState({
            commonParamsList: sortedList,
            hideTooltips: false
          });
      };

      beforeSorting = ({node, index}, event) => {
      
        this.setState({
            hideTooltips: true
        });
      }

    openDeleteNewParamConfirmModal = (title) => {
        this.setState({
            customDeleteNewParamModalVisible: true,
            customDeleteNewParamModalTitle: title
        });
    };
    closeDeleteNewParamModalHandler = (isYesClicked) => {
        this.setState({
            customDeleteNewParamModalVisible: false,
            customDeleteNewParamModalTitle: ''
        });
        if (isYesClicked) {
            //new delete function
            this.deleteNewlyAddedParamConfirm()
        }
    };
    openDeleteExistingParamConfirmModal = (title) => {
        this.setState({
            customDeleteExistingParamModalVisible: true,
            customDeleteExistingParamModalTitle: title
        });
    };
    closeDeleteExistingParamModalHandler = (isYesClicked) => {
        this.setState({
            customDeleteExistingParamModalVisible: false,
            customDeleteExistingParamModalTitle: ''
        });
        if (isYesClicked) {
            //new delete function
            this.deleteParameterHandlerConfirm()
        }
    };
    openNameChangeModal(title) {
        this.setState({
            nameChangeModalVisible: true,
            nameChangeModalTitle: title
        });
    }
    closeNameChangeModal(isYesClicked) {
        this.setState({
            nameChangeModalVisible: false,
            nameChangeModalTitle: ''
        });
        if (isYesClicked) {
            let { commonParamsList } = this.state;
            //const { commonParamsStore } = this.props;
            let commonParamsListCopy = [...commonParamsList];
            const duplicateIndexArr = this.checkIfNewCommonParamIsValid(commonParamsListCopy);
            if (duplicateIndexArr.length === 0) {
                this.setState({
                    errorIndexArr: [],
                });
                this.saveOnParamApi(commonParamsListCopy);
            } else {
                this.throwError(duplicateIndexArr);
            }
        } else {
            let { commonParamsList } = this.state;
            let commonParamsListCopy = [...commonParamsList];

            for (let i = 0; i < this.changeNameIndexesArray.length; i++) {
                let index = this.changeNameIndexesArray[i].changeindex;
                commonParamsListCopy[index].cpName = this.changeNameIndexesArray[i].initialValue;
            }
            this.setState({
                commonParamsList: [...commonParamsListCopy]
            })

        }
    }
    doesParamExist = (currentParam) => {
        const { commonParamsList } = this.state;
        for (let param of commonParamsList) {
            if (currentParam && (currentParam.data.length > 0 || currentParam.cpId.length > 0) && currentParam.cpName.trim() === param.cpName.trim()) {
                return true;
            }
        }
        return false;
    };

    generateVdt() {
        const { kpiBenefitsStore } = this.props;
        const payload = { mapId: SessionStorage.read('mapId') };
        kpiBenefitsStore.getKPIBenefits(payload)
            .then((response) => {
                const { data } = response;
                if (response && !response.error && data.resultCode === 'OK') {
                    return true;
                }else if (response && data.resultCode === 'KO') {
                    this.showNotification('error', data.errorDescription);
                }
            });
        return true;
    }

    componentDidMount() {
        const { reviewValueDriverStore } = this.props;

        // const payload = { mapId: SessionStorage.read('mapId') };
        // kpiBenefitsStore.getKPIBenefits(payload) 
        let mapId = SessionStorage.read('mapId')
        reviewValueDriverStore.getGenerateVDTOnly(false)
            .then((response) => {
                // const { data } = response;
                this.setState({
                    isTabVdtLoading: false
                });
                if (response && response.resultCode === 'OK') {
                    // this.fetchCommonParameters();
                }else if (response && response.resultCode === 'KO') {
                    this.showNotification('error', response.errorDescription);
                }
                this.fetchCommonParameters();
            });
    }

    componentDidUpdate(prevProps, prevState) {
        if (prevProps.commonDataList !== this.props.commonDataList) {
            this.test();
        }
    }

    test() {
        this.setState({
            commonParamsList: [...this.props.commonDataList],
            maxIndexOnLoad: this.props.maxIndexOnLoad,
        });
    }

    fetchCommonParameters() {
        const res = this.props.fetchCommonData();
        // if (res) {
        //     let TempParamArray = this.props.commonDataList;
        //     this.setState({
        //         commonParamsList: [...TempParamArray],
        //         maxIndexOnLoad: this.props.maxIndexOnLoad,
        //     });
        // }
    }

    setUnitForNewCommonParam(event, paramIndex) {
        let { commonParamsList } = this.state;
        let commonParamsListCopy = [...commonParamsList];
        commonParamsListCopy[paramIndex].cpUnit = event.target.value;
        this.setState({
            commonParamsList: [...commonParamsListCopy],
        });
    }
    showUnitOnClick(e){
        if(e.target.id !== ''){
        this.setState({
            unitEnabled: e.target.id, 
        })       
    }
    }
    onBlur(e){
        this.setState({
            unitEnabled:'',
        })
    }

    onNewCommonParamNameChange(event, paramIndex) {
        let { commonParamsList } = this.state;
        let commonParamsListCopy = [...commonParamsList];
        commonParamsListCopy[paramIndex].cpName = event.target.value;
        this.setState({
            commonParamsList: [...commonParamsListCopy],
        });
    }

    validateChar(event) {
        let charArray = ["@", "+", "*", "-", "/", "%", "^", "(", ")", "{", "}", "[", "]", "<", "_", ">", "!", "'", "\""];
        let isValidChar = true;
        charArray.map((char) => {
            if ((event.indexOf(char) !== -1) || event.toUpperCase().includes('#REF')) {
                isValidChar = false
            }
            return true
        })
        return isValidChar;
    }

    onAddCommonParam() {
        let { commonParamsList } = this.state;
        let commonParamsListCopy = [...commonParamsList];

        let i, yearValue = [];
        let orderValue, paramlength;
        if (commonParamsListCopy && commonParamsListCopy.length > 0) {
            paramlength = commonParamsListCopy.length;
            orderValue = paramlength + 1;
        } else {
            orderValue = 1;
            yearValue = [1, 2, 3, 4, 5];
        }
        let newParamObj = {
            cpId: null,
            cpName: '',
            cpUnit: '',
            order: orderValue,
            data: []
        };

        if (commonParamsListCopy && commonParamsListCopy.length > 0) {
            commonParamsListCopy.push(newParamObj);
            for (i = 0; i < commonParamsListCopy[0].data.length; i++) {
                let dataObj = {
                    cpDataId: null,
                    cpParamValue: { actualValue: null, formattedValue: 0 },
                    year: commonParamsListCopy[0].data[i].year
                };
                commonParamsListCopy[commonParamsListCopy.length - 1].data.push(dataObj);
            }
        } else {
            commonParamsListCopy.push(newParamObj);
            for (i = 0; i < 5; i++) {
                let dataObj = {
                    cpDataId: null,
                    cpParamValue: { actualValue: null, formattedValue: 0 },
                    year: yearValue[i]
                };
                commonParamsListCopy[0].data.push(dataObj);
            }
        }
        this.setState({
            commonParamsList: [...commonParamsListCopy]
        });
    }
    checkIfNewCommonParamIsValid(paramList) {
        const { commonParamsStore } = this.props;
        commonParamsStore.unitMissingErr = 0;
        commonParamsStore.nameMissingErr = 0;
        commonParamsStore.invalidCharErr = 0;
        commonParamsStore.duplicateNameErr = 0;
        let paramNameArr = [];
        let duplicateIndexArr = [];
        let paramNameTrimmed = '';
        let isValid = "";
        for (let [index, param] of paramList.entries()) {
            paramNameTrimmed = param.cpName && param.cpName.trim();
            if (param.cpName && param.cpUnit && param.cpName.trim().length && paramNameArr.indexOf(paramNameTrimmed) === -1) {
                paramNameArr.push(paramNameTrimmed);

                isValid = this.validateChar(param.cpName);
                if (!isValid) {
                    commonParamsStore.invalidCharErr = (commonParamsStore.invalidCharErr + 1);
                    duplicateIndexArr.push(index);
                }

            }
            else {
                if (param.cpUnit === "") {
                    commonParamsStore.unitMissingErr = (commonParamsStore.unitMissingErr + 1);
                }
                if (!param.cpName.trim().length) {
                    commonParamsStore.nameMissingErr = (commonParamsStore.nameMissingErr + 1);
                }
                if (param.cpName && param.cpUnit && paramNameArr.indexOf(paramNameTrimmed) !== -1) {
                    commonParamsStore.duplicateNameErr = (commonParamsStore.duplicateNameErr + 1);
                }
                duplicateIndexArr.push(index);
            }
        }
        return duplicateIndexArr;
    }
    throwError(indexArr) {
        const { commonParamsStore } = this.props;
        const uErr = commonParamsStore.unitMissingErr;
        const nErr = commonParamsStore.nameMissingErr;
        const cErr = commonParamsStore.invalidCharErr;
        if (uErr > 0) {
            this.showNotification('error', 'Please select common parameter unit before saving.');
        }
        else {
            if (nErr > 0) {
                this.showNotification('error', 'Please enter common parameter name before saving.');
            }
            else {
                if (cErr > 0) {
                    this.showNotification('error', '{ [ ( < @ + * - \' " ! / % ^ > ) _ ] }, #ref are not allowed in parameter name.');
                }
                else {
                    this.showNotification('error', 'Parameter  with same name already exists');
                }
            }
        }
        this.setState({
            errorIndexArr: [...indexArr],
        });
    }
    buildPayloadForCommonParamSave(paramList) {
        let payload = [];
        let dataObj = [];
        for (let param of paramList) {
            for (let i = 0; i < param.data.length; i++) {
                dataObj.push({
                    cpDataId: param.data[i].cpDataId,
                    cpParamValue: param.data[i].cpParamValue.actualValue,
                    year: param.data[i].year
                });
            }
            payload.push({
                cpId: param.cpId,
                cpName: param.cpName,
                cpUnit: param.cpUnit,
                order: param.order,
                data: dataObj
            });
            dataObj = [];
        }
        return payload;
    }
    onSaveCommonParam() {
        let { commonParamsList } = this.state;
        const { commonParamsStore } = this.props;
        let commonParamsListCopy = [...commonParamsList];
        const duplicateIndexArr = this.checkIfNewCommonParamIsValid(commonParamsListCopy);
        if (duplicateIndexArr.length === 0) {
            this.setState({
                errorIndexArr: [],
            });
            const isNameChanged = this.checkNameChange(commonParamsStore.initialParamList, commonParamsListCopy);
            if (isNameChanged) {
                this.openNameChangeModal('The new parameter name will be used in every KPI formula where it is been used. Do you want to save it ?');
            } else {
                this.saveOnParamApi(commonParamsListCopy);
            }
        } else {
            this.throwError(duplicateIndexArr);
        }
    }

    showNotification(type, message) {
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

    onSaveBenefitProfile() {
        const { commonParamsStore } = this.props;
        const updatedBenefitProfile = [...this.state.benefitProfileList];
        commonParamsStore.saveBenefitProfileData(updatedBenefitProfile).then(response => {
            if (response && !response.error && response.data.resultCode === 'OK') {
                this.showNotification('success', 'Benefit profile values saved successfully');
                return;
            } else if (response && response.data.resultCode === 'KO') {
                this.showNotification('error', response.data.errorDescription);
                return;
            }else {
                this.showNotification('error', 'Save failed');
            }

        });
    }

    onBenefitProfileYearChanged(event, index, key, year) {
        const { benefitProfileList } = this.state;
        benefitProfileList[index][key][year] = Number(event.target.value) <= 100 ? Number(event.target.value) : 100;
        this.setState({
            benefitProfileList: [...benefitProfileList],
        });
    }
    onInputBlur = (event, paramIndex, yearIndex) => {
        let { commonParamsList } = this.state;
        let commonParamsListCopy = [...commonParamsList];

        var value = commonParamsListCopy[paramIndex].data[yearIndex].cpParamValue.actualValue;
        commonParamsListCopy[paramIndex].data[yearIndex].cpParamValue.formattedValue = value ?
            Number(Math.round(Number(value) * 10) / 10).toFixed(1)
            : null;
        this.setState({
            commonParamsList: [...commonParamsListCopy],
        });
    }
    onInputFocus = (event, paramIndex, yearIndex) => {
        let { commonParamsList } = this.state;
        let commonParamsListCopy = [...commonParamsList];

        var value = commonParamsListCopy[paramIndex].data[yearIndex].cpParamValue.actualValue;
        commonParamsListCopy[paramIndex].data[yearIndex].cpParamValue.formattedValue = value ? value : null;
        this.setState({
            commonParamsList: [...commonParamsListCopy],
        });
    }

    onChangeParamValue = (event, paramIndex, yearIndex) => {
        let { commonParamsList } = this.state;
        let commonParamsListCopy = [...commonParamsList];

        var value = event.target.value.replace(/,/g, '');
        var decPos = value.indexOf('.');
        var substrLength = decPos === -1 ? value.length : 1 + decPos + 10,
            trimmedResult = value.substr(0, substrLength),
            finalValue = isNaN(trimmedResult) ? 0 : trimmedResult;

        commonParamsListCopy[paramIndex].data[yearIndex].cpParamValue.actualValue = finalValue ? Number(finalValue) : null;
        commonParamsListCopy[paramIndex].data[yearIndex].cpParamValue.formattedValue = finalValue ? Number(finalValue) : null;

        this.setState({
            commonParamsList: [...commonParamsListCopy],
        });
    };

    deleteNewlyAddedParam = (paramIndex) => {
        let deleteMsg = 'Are you sure you want to delete it?';
        this.setState({
            newlyAddedParamIndex: paramIndex
        })
        this.openDeleteNewParamConfirmModal(deleteMsg);
        // if (!window.confirm('Are you sure you want to delete it?')) {
        //     return;
        // }


    };
    deleteNewlyAddedParamConfirm() {
        let { commonParamsList } = this.state;
        let commonParamsListCopy = [...commonParamsList];

        const { errorIndexArr, newlyAddedParamIndex } = this.state;
        commonParamsListCopy.splice(newlyAddedParamIndex, 1);
        if (errorIndexArr.indexOf(newlyAddedParamIndex) !== -1) {
            errorIndexArr.splice(errorIndexArr.indexOf(newlyAddedParamIndex), 1);
        }
        this.setState({
            commonParamsList: [...commonParamsListCopy],
            errorIndexArr: [...errorIndexArr],
            newlyAddedParamIndex: false
        });
    }

    getYearsArray = () => {
        let i;
        let apiyearList = [];
        const { commonParamsStore } = this.props;
        let { commonParamsList } = this.state;
        let commonParamsListCopy = [...commonParamsList];

        if (commonParamsListCopy && commonParamsListCopy.length > 0) {
            for (i = 0; i < commonParamsListCopy[0].data.length; i++) {
                apiyearList.push(commonParamsListCopy[0].data[i].year)
            }
            return apiyearList;
            //return commonParamsListCopy[0].year;
        }
        return commonParamsStore.yearsList;
    };

    addNewYear = () => {
        const yearIndex = this.getYearsArray().length;
        const { commonParamsStore } = this.props;
        let { commonParamsList } = this.state;
        let commonParamsListCopy = [...commonParamsList];

        const TempParamArray = [...commonParamsListCopy];
        TempParamArray.map((param) => {
            const previousYearValue = param.data[yearIndex - 1].cpParamValue.actualValue;
            const obj = {
                year: yearIndex + 1,
                cpDataId: null,
                cpParamValue: {
                    actualValue: previousYearValue,
                    formattedValue: 0
                }

            };
            param.data.push(obj);

            // const yearNumber = Number(yearIndex + 1);
            // const yeararr = [...param.data[yearIndex - 1].year];
            // yeararr.push(yearNumber);
            // param.data[yearIndex - 1].year = [...yeararr];
        });

        this.setState({
            commonParamsList: [...TempParamArray],
            newColumnAdded: true,
        });
    };

    deleteYearHandler = () => {
        if (this.getYearsArray().length === 5) {
            this.showNotification('error', 'Sorry! You cannot delete below 5 years');
            return;
        }
        this.setState({
            deleteLoader: true,
        });

        const { newColumnAdded, commonParamsList } = this.state;
        
        let commonParamsListCopy = [...commonParamsList];

        const year = this.getYearsArray().length;
        const { commonParamsStore } = this.props;
        const TempParamArray = [...commonParamsListCopy];
      
        
        if (!newColumnAdded) {
            commonParamsStore.deleteExtraYear(year)
                .then((response) => {
                    if (response && !response.error && response.data.resultCode === 'OK') {
                        this.fetchCommonParameters();
                        this.setState({
                            deleteLoader: false,
                        });
                        this.showNotification('success', 'Data deleted successfully');
                        return;
                    }else if (response && response.data.resultCode === 'KO') {
                        this.setState({
                            deleteLoader: false,
                        });
                        this.showNotification('error', response.data.errorDescription);
                        return;
                    }else{
                        this.setState({
                            deleteLoader: false,
                        })
                        this.showNotification('error', 'Sorry! something went wrong');
                    }
                    
                });
        } else {
            TempParamArray.map((param) => {
                param.data.pop();
            });
            this.setState({
                deleteLoader: false,
                commonParamsList: [...TempParamArray]
            });
        }

    };

    deleteParameterHandler = (cpId, cpIndex) => {
        const { commonParamsStore } = this.props;
        const kpiBenefitMessage = 'This parameter is in use in KPI benefit table. Are you sure you want to delete it?';
        const message = 'Are you sure you want to delete it?';
        const paramId =  cpId;

        if (paramId && paramId !== 'null' && paramId !== '') {
            let deleteMsg = (paramId !== 'null' ? kpiBenefitMessage : message);
            this.setState({
                paramId: paramId
            })
            this.openDeleteExistingParamConfirmModal(deleteMsg);

        } else {
            this.deleteNewlyAddedParam(cpIndex);
        }

        

        // if (!window.confirm(paramId[1] !== 'null' ? kpiBenefitMessage : message)) {
        //     return;
        // }

    };
    deleteParameterHandlerConfirm() {
        const { commonParamsStore } = this.props;
        const { paramId } = this.state;
        this.setState({
            deleteLoader: true,
        });
        commonParamsStore.deletCommonParameter(paramId)
            .then((response) => {
                this.setState({
                    deleteLoader: false,
                });
                if (response && !response.error && response.data.resultCode === 'OK') {
                    this.showNotification('success', 'Parameter deleted successfully');
                    this.props.fetchCommonData();
                    return;
                }else if (response && response.data.resultCode === 'KO') {
                    this.showNotification('error', response.data.errorDescription);
                    // this.props.fetchCommonData();
                    return;
                }
                else
                this.showNotification('error', 'Sorry! Something went wrong');
            });
    }
    checkNameChange = (originalParamList, newParamList) => {
        this.changeNameIndexesArray = [];
        this.openPopup = false;
        for (let i = 0; i < originalParamList.length; i++) {
            for (let y = 0; y < newParamList.length; y++) {
                if (originalParamList[i].cpId === newParamList[y].cpId) {
                    if (originalParamList[i].cpName !== newParamList[y].cpName) {
                        this.changeNameIndexesArray.push({
                            changeindex: y,
                            initialValue: originalParamList[i].cpName
                        });
                        this.openPopup = true;
                    }
                }
            }
        }
        return this.openPopup;
    }
    saveOnParamApi(commonParamsListCopy) {
        const { commonParamsStore } = this.props;
        this.setState({
            isloading:true,
        })
        commonParamsStore.saveCommonParams(this.buildPayloadForCommonParamSave(commonParamsListCopy)).then(response => {
            if (response && response.data.resultCode === 'OK') {
                this.showNotification('success', 'Common Parameters values saved successfully');
                this.fetchCommonParameters();
                this.setState({
                    newColumnAdded: false,
                    isloading:false
                });
            }
            else if (response && response.data.resultCode === 'KO') {
                if (commonParamsStore.duplicateNameError !== '') {
                    this.showNotification('error', commonParamsStore.duplicateNameError);
                }
                else {
                    this.showNotification('error', response.data.errorDescription);
                }
                this.setState({
                    isloading:false
                })

            }
            else {
                this.showNotification('error', 'Sorry! Something went wrong');
                this.setState({
                    isloading:false
                })
            }
        });
    }

    checkForMasterOrReadAccess = () => {        

        if ( (SessionStorage.read("isMaster") === "Y") || (SessionStorage.read("accessType") === "Read")) {
            return true;
        } else {
            return false;
        }
    }


    render() {
        const { reviewValueDriverStore} = this.props;
        const selected_option = SessionStorage.read('option_selected');
        const { branchTree } = reviewValueDriverStore;
        const getTooltipData = (value) => {
            if (value) {
                const val = String(value).replace(/(?<!\..*)(\d)(?=(?:\d{3})+(?:\.|$))/g, '$1,');
                return `${val}`;
            }
        };
        const getTooltipValue = (value) => {
            return `${value}`;

        }
        return (
            <div className="cp-sub-tab-main comonData row" style={{ margin: '0%' }}>
                {/* {(this.props.selectedTab === "commondata")?  */}
                <div className="row tab navMenu wrapper_CD" style={{ width: "100%", padding: "6px 0px" }}>
                    <div style={{ display: "flex", justifyContent: "flex-end" }}>
                        <img src={saveIco} alt="save" className="save-img"
                            onClick={(SessionStorage.read("isMaster") === "Y" || (SessionStorage.read("accessType") === "Read") || this.state.isloading ) ? () => { } : this.onSaveCommonParam}
                            data-tip
                            data-for="CD-save-tooltip"
                            data-place="top"
                            style={{
                                // marginRight: "31px",
                                cursor: (SessionStorage.read("isMaster") === "Y" || (SessionStorage.read("accessType") === "Read")) ? "not-allowed" : (this.state.isloading? "default" :"pointer"),
                                opacity: (SessionStorage.read("isMaster") === "Y" || (SessionStorage.read("accessType") === "Read") || this.state.isloading ) ? "0.5" : "unset",
                                zIndex: "1",
                                height: "30px"
                            }} />
                            {this.state.isloading ? 
                 <i className="fa fa-spinner fa-spin" style={{ color: '#ffffff',position:"absolute",margin:"10px 30px" ,cursor:"default"}}></i>
                :"" }
                        <ReactTooltip id="CD-save-tooltip" className="tooltip-class">
                            <span>Save</span>
                        </ReactTooltip>
                        {/* adding icons */}
                        <span
                            className="kpiBenifit-operationBtn"
                            style={{ cursor: (this.props.isLoading ? "default":"pointer"),
                            opacity:(this.props.isLoading?"0.5":"unset"), marginRight: "0px" }}
                            // id={this.props.KPIBenefitsArray[0] && this.props.KPIBenefitsArray[0].kpiId}
                            // onClick={(SessionStorage.read("isMaster") === "Y" || (SessionStorage.read("accessType") === "Read")) ? 'return false;' : (isLoading ? () => { } : this.onKPIBenefitSaveClick)}
                            onClick={this.props.isLoading? ()=>{} : this.props.handleDownload}
                            // disabled={SessionStorage.read("demoUser") === "true" ? true : (isLoading ? true : false)}
                            data-tip=""
                            data-for="kpib-download-tooltip"
                            data-place="top" >
                            <img src={downloadIco} alt="download" style={{ paddingBottom: "15px", marginRight: "5px" }} />
                            {this.props.isLoading ? 
                 <i className="fa fa-spinner fa-spin" style={{ color: '#ffffff',position:"absolute",margin:"10px -28px",fontSize:"15px" ,cursor:"default"}}></i>
                 :"" } 
                        </span>
                        <ReactTooltip id="kpib-download-tooltip" className="tooltip-class">
                            <span>Generate Data Template</span>
                        </ReactTooltip>

                        <span
                            className="kpiBenifit-operationBtn"
                            style={{ margin: "-3px -70px 0px 0px" }}
                            // id={this.props.KPIBenefitsArray[0] && this.props.KPIBenefitsArray[0].kpiId}
                            // onClick={(SessionStorage.read("isMaster") === "Y" || (SessionStorage.read("accessType") === "Read")) ? 'return false;' : (isLoading ? () => { } : this.onKPIBenefitSaveClick)}
                            onClick={this.props.handleupload}
                        // disabled={SessionStorage.read("demoUser") === "true" ? true : (isLoading ? true : false)}
                        ><label htmlFor="file" style={{ marginBottom: 0 }}>
                                <img data-tip=""
                                    data-for="kpib-upload-tooltip"
                                    data-place="top"
                                    src={uploadIco} style={{ cursor: (SessionStorage.read("isMaster") === "Y" || (SessionStorage.read("accessType") === "Read")) ? "not-allowed" : "pointer", paddingBottom: "8px", marginLeft: "5px", marginRight: "10px", opacity: (SessionStorage.read("isMaster") === "Y" || (SessionStorage.read("accessType") === "Read")) ? "0.5" : "unset" }} alt="upload" />
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
                    <div className="Icon_sub_menu" style={{ marginRight: "80px" }} />
                </div>
                {/* :""} */}



                <div className="row col-sm-12" style={{ padding: "0px", margin: "0px" }}>
                    <div className="vdt-table" style={{ padding: "0px", width: "610px", background: '#5A5A5A', zIndex: 1 }}>
                        <div className="row rvdt-header rvdt-header-cd align-self-center" style={{ backgroundColor: '#505050', width: '596px' }}>
                            <ReviewValueDriverTreeHeader isBusinessCase={true} />
                        </div>
                        {
                            branchTree.length > 0  && !this.state.isTabVdtLoading ?
                                (
                                    <div >
                                        <div key={Math.floor(Math.random() * 1001)} className="col-sm-12" id="vdt">
                                            <ValueDriverTreeNew
                                                branchTree={branchTree}
                                                isBusinessCase={this.props.isBusinessCase}
                                                fetchKPIDetails={this.fetchKPIDetails}
                                                isKPIBenefitsTab={true}
                                                isBenefitActuals={false}
                                            />
                                        </div>
                                    </div>
                                ) :
                                <div className="row justify-content-center" style={{ height: '50px' }}>
                                    <i className="fa fa-spinner fa-spin" style={{ fontSize: '18px', color: '#ffffff', height: "min-content" }}></i>
                                    {/* <h4> <i className="fa fa-exclamation-triangle"></i> No data to load</h4> */}
                                </div>
                        }
                    </div>
                    <div className="" style={{ padding: "0px", width: "calc( 100% - 610px )" }}>
                        <div className="commonDataTable" style={{ position: 'sticky', top: '0' }}>
                            
                            <div className={`isCommonParamsTab_inv_table-responsive ${this.state.hideTooltips ? 'hide-tt': ''}`} >
                                <table className="table" ref={el => (this.containerEl = el)}>
                                    <thead style={{ whiteSpace: 'nowrap' }}>
                                        <tr>
                                            <th>Common Parameter</th>
                                            <th>Unit</th>
                                            {this.getYearsArray().map((value, index) => (
                                                <th key = {index}>Year {value}</th>
                                            ))}
                                            {selected_option !== 'sales' ?
                                                <th style={{ border: "none", background: '#5A5A5A'}}>
                                                    {
                                                        this.getYearsArray().length < 10 &&
                                                        <span onClick={this.addNewYear} >
                                                            <img style={{ cursor: 'pointer' }} src={plusIco_brackets} alt="plus" data-tip=""
                                                                data-for="addyear_tooltip" data-place="left" />
                                                            <ReactTooltip id="addyear_tooltip" className="tooltip-class">
                                                                <span>Add Year</span>
                                                            </ReactTooltip>

                                                        </span>
                                                    }
                                                    {
                                                        this.getYearsArray().length > 5 &&
                                                        <span onClick={this.deleteYearHandler}  style={{ marginLeft: "5px" }}>
                                                            <img src={deleteIcon} data-for= "deleteyear_tooltip" alt="delete" data-tip={getTooltipValue("Delete Year")} data-place="left" style={{ cursor: (this.state.deleteLoader ? 'wait': 'pointer') ,opacity: (this.state.deleteLoader ? "0.5" : "unset")}} />
                                                            <ReactTooltip id="deleteyear_tooltip" className="tooltip-class">
                                                                <span>Delete Year</span>
                                                            </ReactTooltip>
                                                        </span>
                                                    }
                                                </th> : ''
                                            }
                                        </tr>
                                    </thead>
                                    <SortableContainer onSortEnd={this.onSortEnd} 
                                    updateBeforeSortStart={this.beforeSorting}
                                    useDragHandle lockAxis="y"
                                    lockToContainerEdges={true}
                                    disableAutoscroll={true}
                                    helperContainer = {this.helperFun}
                                    // useWindowAsScrollContainer={true}
                                    helperClass="cp-dragged-row-type"
                                    /*lockOffset={["30%","80%"]}*/>                                        
                                        
                                        {this.state.commonParamsList ? this.state.commonParamsList.map((param, paramIndex) => (
                                            
                                              <SortableItem key={`item-${paramIndex}`} 
                                              index = {paramIndex}
                                              disabled={((SessionStorage.read("isMaster") === "Y") || (SessionStorage.read("accessType") === "Read")) ? true : false} 
                                              param = {param} 
                                              paramIndex = {paramIndex} 
                                              getTooltipValue = {getTooltipValue}
                                              getTooltipData = {getTooltipData}
                                              errorIndexArr = {this.state.errorIndexArr}
                                              unitEnabled = {this.state.unitEnabled}
                                              maxIndexOnLoad = {this.state.maxIndexOnLoad}
                                              doesParamExist = {this.doesParamExist}
                                              deleteParameterHandler = {this.deleteParameterHandler}
                                              kpiUnits = {this.kpiUnits}
                                              onNewCommonParamNameChange = {this.onNewCommonParamNameChange}
                                              setUnitForNewCommonParam = {this.setUnitForNewCommonParam}
                                              onInputFocus = {this.onInputFocus}
                                              onInputBlur = {this.onInputBlur}
                                              onChangeParamValue = {this.onChangeParamValue}
                                              deleteNewlyAddedParam = {this.deleteNewlyAddedParam}
                                              showUnitOnClick = {this.showUnitOnClick}
                                              onBlur = {this.onBlur}
                                              selected_option = {selected_option}
                                              commonParamsList={this.state.commonParamsList}
                                              />
                                            
                                            ))    
                                         : <i className="fa fa-spinner fa-spin" style={{ fontSize: '18px', color: '#ffffff' }}></i>}
                                        {/* <tr>
                                                <td></td><td></td>
                                                {this.state.commonParamsList ? this.state.commonParamsList[0].paramVal.map((param)=>(
                                                    <td></td>
                                                )):""}
                                            </tr> */}
                                    </SortableContainer>

                                </table>


                            </div>
                            <div style={{ padding: "0px", marginLeft: "1%", marginTop: '0.5rem' }}>

                                <img
                                    src={plusIco} alt="Add"
                                    // className="delete-buttonIcn"
                                    data-tip=""
                                    data-for="add_tooltip"
                                    data-place="right"
                                    style={{
                                        cursor: (SessionStorage.read("isMaster") === "Y" || (SessionStorage.read("accessType") === "Read")) ? "not-allowed" : "pointer",
                                        opacity: (SessionStorage.read("isMaster") === "Y" || (SessionStorage.read("accessType") === "Read")) ? "0.5" : "unset",
                                        width: "15px", verticalAlign: "top"
                                    }}
                                    disabled={(SessionStorage.read("isMaster") === "Y" || (SessionStorage.read("accessType") === "Read")) ? true : false}
                                    onClick={(SessionStorage.read("isMaster") === "Y" || (SessionStorage.read("accessType") === "Read")) ? () => { } : this.onAddCommonParam}
                                />
                                <ReactTooltip id="add_tooltip" className="tooltip-class">
                                    <span>Add Parameter</span>
                                </ReactTooltip>
                            </div>
                        </div>
                    </div>
                </div>
                <CustomConfirmModal
                    ownClassName={'commonData-new-delete'}
                    isModalVisible={this.state.customDeleteNewParamModalVisible}
                    modalTitle={this.state.customDeleteNewParamModalTitle}
                    closeConfirmModal={this.closeDeleteNewParamModalHandler}
                />
                <CustomConfirmModal
                    ownClassName={'commonData-existing-delete'}
                    isModalVisible={this.state.customDeleteExistingParamModalVisible}
                    modalTitle={this.state.customDeleteExistingParamModalTitle}
                    closeConfirmModal={this.closeDeleteExistingParamModalHandler}
                />
                <CustomConfirmModal
                ownClassName={'commonData-changeName-save'}
                isModalVisible={this.state.nameChangeModalVisible}
                modalTitle={this.state.nameChangeModalTitle}
                closeConfirmModal={this.closeNameChangeModal}
                />
            </div>
        );
    }
}

export default withRouter(CommonData);