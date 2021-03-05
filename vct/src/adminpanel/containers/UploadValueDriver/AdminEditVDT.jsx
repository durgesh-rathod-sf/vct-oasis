import React, { Component, Fragment } from 'react';
import { withRouter } from "react-router-dom";
import { inject } from 'mobx-react';
import { toast } from 'react-toastify';
import ReactTooltip from 'react-tooltip';
import NotificationMessage from '../../../components/NotificationMessage/NotificationMessage';
import CustomConfirmModal from '../../../components/CustomConfirmModal/CustomConfirmModal';
import './AdminEditVDT.css';
import search from "../../../assets/admin/search.svg";
import pencil from "../../../assets/admin/pencil.svg";
import trash from "../../../assets/admin/trash.svg";
import MultiSelect from "react-multi-select-component";
import prevIcon from "../../../assets/admin/circle-lt.svg";
import nextIcon from "../../../assets/admin/circle-rt.svg";

@inject('adminStore')
class AdminEditVDT extends Component {
    constructor(props) {
        super(props);
        this.state = {
            objectivesList: [],
            showSpinner: true,
            selectedPrefix: 'so',
            searchString: '',
            noMatchData: false,
            deleteVDTModalVisible: false,
            deleteVDTModalTitle: '',
            deleteVDTIndex: '',
            selectedIndustryValues: [],
            selectedBusinessValues: [],
            isEdited: false,
            pageNo: 0,
            pagesArray: []
        }

        this.objListRef = React.createRef();
        this.initialObjectivesList = [];

        this.isDefined = this.isDefined.bind(this);
        this.handleKeyDown = this.handleKeyDown.bind(this);
        this.onChange = this.onChange.bind(this);
        this.onPageChange = this.onPageChange.bind(this);
        this.prevNextClick = this.prevNextClick.bind(this);
    }

    componentDidMount() {
        this.setState({
            searchString: ""
        });
        this.fetchObjectiveData();
    }

    componentDidUpdate(prevProps, prevState) {
        if ((prevProps.selectedObjectiveType !== this.props.selectedObjectiveType) || (prevState.pageNo !== this.state.pageNo)) {
            this.setState({
                showSpinner: true,
                isEdited: false
            });
            this.fetchObjectiveData();
        }
        // if (this.props.isSaveSuccess) {
        //     this.fetchObjectiveData();
        // }
    }

    fetchObjectiveData = () => {
        const { pageNo } = this.state;
        const { selectedObjectiveType } = this.props;
        switch (selectedObjectiveType) {
            case 'Strategic Objective':
                this.getObjectiveData('SO', 'soObjects');
                break;
            case 'Financial / Non-Financial Objective':
                this.getObjectiveData('FO', 'foObjects');
                break;
            case 'Business Objective':
                this.getObjectiveData('BO', 'boObjects');
                break;
            case 'Value Driver':
                this.getObjectiveData('VD', 'vdObjects');
                break;
            case 'KPI':
                this.getAllKPIdata(pageNo);
                break;
            default:
                break;
        }
    }

    getObjectiveData = (type, assignedVariable) => {
        const { adminStore } = this.props;
        adminStore.getObjectives(type)
            .then(response => {
                if (!response.error && response.data) {
                    if (response.data.resultCode === "OK") {
                        const objArray = response.data.resultObj[assignedVariable];
                        // const objMapArray = [...objArray];
                        // objMapArray.map(obj => {
                        //     obj['isEdited'] = false;
                        //     return true;
                        // });
                        const objMapArray = objArray.map(obj => {
                            let objectiveType = this.props.foBoTypes[obj.objTypeId - 1]
                            let objectiveCategory = objectiveType && objectiveType.objCategories && objectiveType.objCategories.filter(category => category.objCatId === obj.objCatId)
                            let objectiveSubCategory = objectiveCategory && objectiveCategory[0] && objectiveCategory[0].objectiveSubCategories && objectiveCategory[0].objectiveSubCategories.filter(subCategory => subCategory.objSubCatId === obj.objSubCatId)
                            obj['isEdited'] = false;
                            obj['objTypeName'] = objectiveType && objectiveType.objTypeName
                            obj['objTypeLabel'] = objectiveType && objectiveType.objTypeLabel
                            obj['objCatName'] = objectiveCategory && objectiveCategory[0] && objectiveCategory[0].objCatName
                            obj['objCatLabel'] = objectiveCategory && objectiveCategory[0] && objectiveCategory[0].objCatLabel
                            obj['objCustomCatValue'] = obj.objCustomCatValue
                            obj['objSubCatName'] = objectiveSubCategory && objectiveSubCategory[0] && objectiveSubCategory[0].objSubCatName
                            obj['objSubCatLabel'] = objectiveSubCategory && objectiveSubCategory[0] && objectiveSubCategory[0].objSubCatLabel
                            obj['objCustomSubCatValue'] = obj.objCustomSubCatValue
                            return obj;
                        });

                        this.initialObjectivesList = JSON.parse(JSON.stringify(objMapArray));

                        this.setState({
                            showSpinner: false,
                            objectivesList: objMapArray,
                            selectedPrefix: type.toLowerCase(),
                            searchString: '',
                            noMatchData: false
                        });

                        this.objListRef.current.scrollTo(0, 0);
                    } else if (response.data.resultCode === 'KO') {
                        this.showErrorNotification(response.data.errorDescription, "Error", "error");
                    } else {
                        console.log('response.data.errorDescription');
                    }
                }
            });
    }

    editVDTElement = (e, objInd) => {
        const { objectivesList } = this.state;
        let objListArr = [...objectivesList];
        let industriesList = [];
        let businessList = [];

        objListArr[objInd].industries !== undefined && objListArr[objInd].industries.length >= 1 && objListArr[objInd].industries.map((data, index) => {
            let industry = { value: data.indId, label: data.industryName };

            industriesList.push(industry);
            return true
        });

        objListArr[objInd].business !== undefined && objListArr[objInd].business.length >= 1 && objListArr[objInd].business.map((data, index) => {
            let business = { value: data.businessId, label: data.businessName };

            businessList.push(business);
            return true
        });
        objListArr[objInd].isEdited = true;



        this.setState({
            selectedIndustryValues: industriesList,
            selectedBusinessValues: businessList,
            objectivesList: objListArr,

        });
    }

    // changeNameHandler = (e, objInd) => {
    //     const { objectivesList, selectedPrefix } = this.state;
    //     let objListArr = [...objectivesList];
    //     const temp = selectedPrefix + 'Name';
    //     let objVar = objListArr[objInd];
    //     objVar[temp] = e.target.value;
    //     this.setState({
    //         objectivesList: objListArr
    //     });
    // }

    getSaveDisabledState = (objectToBeUpdated) => {
        switch (this.props.selectedObjectiveType) {
            case "Strategic Objective":
                return !!objectToBeUpdated[`${this.state.selectedPrefix}Name`]
            case "Financial / Non-Financial Objective":
                return !!objectToBeUpdated[`${this.state.selectedPrefix}Name`]
                    && !!objectToBeUpdated["objTypeName"]
                    && !!objectToBeUpdated["objCatName"]
                    && (objectToBeUpdated["objCatName"] === "CUSTOM" ? !!objectToBeUpdated['objCustomCatValue'] : true)
            case "Business Objective":
                return !!objectToBeUpdated[`${this.state.selectedPrefix}Name`]
                    && !!objectToBeUpdated["objTypeName"]
                    && !!objectToBeUpdated["objCatName"]
                    && !!objectToBeUpdated["objSubCatName"]
                    && (objectToBeUpdated["objCatName"] === "CUSTOM" ? !!objectToBeUpdated['objCustomCatValue'] : true)
                    && (objectToBeUpdated["objSubCatName"] === "CUSTOM" ? !!objectToBeUpdated['objCustomSubCatValue'] : true)
            case "Value Driver":
                return !!objectToBeUpdated[`${this.state.selectedPrefix}Name`]
                    && !!objectToBeUpdated["objTypeName"]
        }
    }

    onChange = (event, index, changeType) => {
        const { objectivesList, selectedPrefix } = this.state;
        let copiedList = [...objectivesList]
        let objectToBeUpdated = copiedList[index];
        let selectedType = {}, selectedCategory = {}, selectedSubCategory = {}
        switch (changeType) {
            case "Name":
                objectToBeUpdated[`${selectedPrefix}Name`] = event.target.value
                break;
            case "Type":
                //objectToBeUpdated["objTypeId"] = objectToBeUpdated.objTypeId
                selectedType = this.props.foBoTypes.filter(type => type.objTypeName === event.target.value)
                objectToBeUpdated["objTypeId"] = selectedType && selectedType[0].objTypeId
                objectToBeUpdated["objTypeName"] = selectedType && selectedType[0].objTypeName
                objectToBeUpdated["objTypeLabel"] = selectedType && selectedType[0].objTypeLabel
                objectToBeUpdated["objCatId"] = ""
                objectToBeUpdated["objCatName"] = ""
                objectToBeUpdated["objCatLabel"] = ""
                objectToBeUpdated["objSubCatId"] = ""
                objectToBeUpdated["objSubCatName"] = ""
                objectToBeUpdated["objSubCatLabel"] = ""
                objectToBeUpdated['objCustomCatValue'] = ""
                objectToBeUpdated['objCustomSubCatValue'] = ""
                break;
            case "Category":
                selectedCategory = this.props.foBoTypes[objectToBeUpdated.objTypeId - 1].objCategories.filter(category => category.objCatName === event.target.value)
                objectToBeUpdated["objCatId"] = selectedCategory && selectedCategory[0].objCatId
                objectToBeUpdated["objCatName"] = selectedCategory && selectedCategory[0].objCatName
                objectToBeUpdated["objCatLabel"] = selectedCategory && selectedCategory[0].objCatLabel
                objectToBeUpdated["objSubCatId"] = ""
                objectToBeUpdated["objSubCatName"] = ""
                objectToBeUpdated["objSubCatLabel"] = ""
                objectToBeUpdated['objCustomCatValue'] = ""
                objectToBeUpdated['objCustomSubCatValue'] = ""
                break;
            case "SubCategory":
                selectedCategory = this.props.foBoTypes[objectToBeUpdated.objTypeId - 1].objCategories.filter(category => category.objCatName === objectToBeUpdated.objCatName)
                selectedSubCategory = selectedCategory && selectedCategory[0].objectiveSubCategories && selectedCategory[0].objectiveSubCategories.filter(subCategory => subCategory.objSubCatName === event.target.value)
                objectToBeUpdated["objSubCatId"] = selectedSubCategory && selectedSubCategory[0].objSubCatId
                objectToBeUpdated["objSubCatName"] = selectedSubCategory && selectedSubCategory[0].objSubCatName
                objectToBeUpdated["objSubCatLabel"] = selectedSubCategory && selectedSubCategory[0].objSubCatLabel
                objectToBeUpdated['objCustomSubCatValue'] = ""
                break;
            case "CustomCategory":
                objectToBeUpdated.objCustomCatValue = event.target.value
                break;
            case "CustomSubCategory":
                objectToBeUpdated.objCustomSubCatValue = event.target.value
                break;

        }
        copiedList[index] = objectToBeUpdated;
        this.setState({
            objectivesList: [...copiedList],
            isEdited: this.getSaveDisabledState(objectToBeUpdated)
        })
    }

    // start of kpi details change handlers and functions

    getAllKPIdata = (pageNo) => {

        const { adminStore } = this.props;
        adminStore.getKPIList(pageNo)
            .then(response => {
                if (!response.error && response.data) {
                    if (response.data.resultCode === "OK") {
                        const objList = response.data.resultObj.oKpiMstDtoList;
                        let lastPageNo = (response.data.resultObj.totalSplittedPages);
                        let pagesArr = [];
                        for (let i = 0; i < lastPageNo; i++) {
                            pagesArr.push(i + 1)
                        }
                        this.buildShowPageArr(pagesArr, pageNo)
                        // const objList = response.data.resultObj;
                        const objMapArray = [...objList];
                        objMapArray.map(obj => {
                            obj['isEdited'] = false;
                            return true;
                        });
                        this.initialObjectivesList = JSON.parse(JSON.stringify(objMapArray));

                        // objList.map((options)=>{
                        //     let businessList =[];
                        //     let industryList =[];
                        //     options.business.map((data, index) => {
                        //         let business = { value: data.businessId, label: data.businessName }
                        //         console.log("business each",business)
                        //          businessList.push(business);
                        //          console.log("business mappp",businessList)
                        //          return businessList
                        //     })

                        //     options.industries.map((data, index) => {
                        //         let industry = { value: data.indId, label: data.industryName }
                        //         console.log("business each",industry)
                        //         industryList.push(business);
                        //          console.log("business mappp",industryList)
                        //          return industryList
                        //     })
                        // })
                        this.setState({
                            showSpinner: false,
                            objectivesList: objMapArray,
                            selectedPrefix: 'kpi',
                            searchString: '',
                            noMatchData: false,
                            pagesArray: pagesArr
                        });

                        this.objListRef.current.scrollTo(0, 0);
                    } else if (response.data.resultCode === 'KO') {
                        this.showErrorNotification(response.data.errorDescription, "Error", "error");
                    } else {
                    }
                }
            });
    }
    buildShowPageArr = (pageArr, pageNo) => {
        let showArr = [];
        let hideArr = [];

        for (let i = 0; i < pageArr.length; i++) {
            if ((pageNo - 5 <= i) && (i < pageNo + 5)) {
                showArr.push(i + 1)
            }
        }
        if (showArr[0] !== 1) {
            showArr.splice(0, 0, "...")
        }
        if (showArr[showArr.length - 1] !== pageArr[pageArr.length - 1]) {
            showArr.push("...")
        }
        this.setState({
            showPageArray: showArr
        })
    }

    onPageChange = (page) => {
        this.setState({
            pageNo: page
        }, () => {
            this.getAllKPIdata(page);
        })

    }
    prevNextClick = (type) => {
        const { pageNo } = this.state;
        let page = ""
        switch (type) {
            case "prevPage":
                page = pageNo - 1
                break;
            case "nextPage":
                page = pageNo + 1
                break;
        }
        this.setState({
            pageNo: page
        }, () => {
            this.getAllKPIdata(page);
        })

    }
    editKpiObjective = (e, objInd) => {
        const { objectivesList } = this.state;
        let objListArr = [...objectivesList];
        objListArr[objInd].isEdited = true;
        let industriesList = [];
        let businessList = [];

        objListArr[objInd].industries !== undefined && objListArr[objInd].industries.length >= 1 && objListArr[objInd].industries.map((data, index) => {
            let industry = { value: data.indId, label: data.industryName };

            industriesList.push(industry);
            return true
        });

        objListArr[objInd].business !== undefined && objListArr[objInd].business.length >= 1 && objListArr[objInd].business.map((data, index) => {
            let business = { value: data.businessId, label: data.businessName };

            businessList.push(business);
            return true
        });

        objListArr[objInd].industriesList = industriesList;
        objListArr[objInd].businessList = businessList;

        this.setState({
            objectivesList: objListArr,
            selectedIndustryValues: industriesList,
            selectedBusinessValues: businessList,
        });
    }

    kpiDetailsChangeHandler = (e, objInd, detailType) => {
        const { objectivesList } = this.state;
        let objListArr = [...objectivesList];
        let objVar = objListArr[objInd];
        objVar[detailType] = e.target.value;
        this.setState({
            objectivesList: objListArr,
            isEdited: true
        });
    }

    // end of kpi details change handlers and functions

    openDeleteVDTConfirmModal = (title, index) => {
        this.setState({
            deleteVDTModalVisible: true,
            deleteVDTModalTitle: title,
            deleteVDTIndex: index
        });
    }

    closeDeleteVDTConfirmModal = (isYesClicked) => {
        this.setState({
            deleteVDTModalVisible: false,
            deleteVDTModalTitle: ''
        });
        if (isYesClicked) {
            //new delete function
            this.deleteVDTElementConfirm();
        } else {
            this.setState({
                deleteVDTIndex: ''
            });

        }

    }

    deleteVDTElementConfirm = () => {
        const { objectivesList, selectedPrefix, deleteVDTIndex } = this.state;
        const { adminStore, selectedObjectiveType } = this.props;


        let objListArr = JSON.parse(JSON.stringify(objectivesList));
        let tempObj = objListArr[deleteVDTIndex];
        let id = '';
        if (selectedObjectiveType === 'KPI') {
            id = tempObj['mstOkpiId'];
        } else {
            id = tempObj[selectedPrefix + 'Id'];
        }

        adminStore.deleteObjective(selectedPrefix.toUpperCase(), id)
            .then(response => {
                if (response.data.resultCode === 'OK') {
                    this.showErrorNotification(selectedObjectiveType + ' deleted successfully', "Success", "success");

                    objListArr.splice(deleteVDTIndex, 1);
                    // this.fetchObjectiveData();
                    if (selectedObjectiveType === 'KPI') {
                        this.initialObjectivesList = this.initialObjectivesList.filter(obj => {
                            return obj['mstOkpiId'] !== id
                        });
                    } else {
                        this.initialObjectivesList = this.initialObjectivesList.filter(obj => {
                            return obj[selectedPrefix + 'Id'] !== id
                        });
                    }
                    this.setState({
                        objectivesList: objListArr,
                        deleteVDTIndex: ''
                    })
                } else if (response.data.resultCode === 'KO') {
                    // this.setState({
                    //     showSpinner: false
                    // });
                    this.showErrorNotification(response.data.errorDescription, "Error", "error");
                } else {
                    this.showErrorNotification("Sorry! Something went wrong", "Error", "error");
                }
            });

    }

    deleteVDTElement = (e, objInd) => {

        this.openDeleteVDTConfirmModal('Are you sure you want to delete it?', objInd);



    }

    saveVDTObjectives = (e) => {
        const { objectivesList, selectedPrefix } = this.state;
        const { adminStore, selectedObjectiveType } = this.props;
        let editedObjArray = [];
        editedObjArray = objectivesList.filter((obj) => {
            return obj.isEdited;
        });
        if (editedObjArray.length > 0) {

            let toBeSavedObj = [];

            if (selectedObjectiveType === 'KPI') {


                let industryRequestData = [];
                let businessRequestData = [];

                const frameBusinessRequestData = (obj) => {
                    businessRequestData = [];
                    obj.businessList.map((business) => {
                        let data = {
                            "kpiBusMapId": null,
                            "businessId": business.value
                        }
                        businessRequestData.push(data);
                        return true
                    })
                    return businessRequestData;

                }

                const frameIndustryRequestData = (obj) => {
                    industryRequestData = []
                    obj.industriesList.forEach((industry) => {
                        let data = {
                            "kpiIndMapId": null,
                            "indId": industry.value
                        }
                        industryRequestData.push(data);
                    })
                    return industryRequestData;
                }



                let mandatoryCount = 0;
                editedObjArray.map((obj) => {
                    if (!RegExp(/[<>!'"[\]]/).test(obj.mstOkpiName) && !RegExp(/[<>!'"[\]]/).test(obj.mstOkpiDescription) && !RegExp(/[<>!'"[\]]/).test(obj.mstOkpiFormula)) {
                        let tempKPIObj = {
                            'kpiId': obj.mstOkpiId,
                            'kpiName': obj.mstOkpiName,
                            'kpiDescription': obj.mstOkpiDescription,
                            'kpiFormula': obj.mstOkpiFormula,
                            'kpiTrend': obj.mstOkpiTrend,
                            "okpiType": obj.okpiType,
                            'kpiUnit': obj.mstOkpiUnit,
                            'calculationType': obj.mstOkpiCalcType,
                            'business': frameBusinessRequestData(obj),
                            'industries': frameIndustryRequestData(obj)
                        }
                        toBeSavedObj.push(tempKPIObj);
                    } else {
                        mandatoryCount++;
                    }
                    return true;
                });

                if (mandatoryCount === 0) {
                    this.setState({
                        showSpinner: true
                    });
                    adminStore.saveOKPIDetails(toBeSavedObj)
                        .then(response => {
                            if (!response.error && response.data.resultCode === 'OK') {
                                this.showErrorNotification("KPI Details saved successfully", "Success", "success");
                                // this.props.modalCloseHandler();
                                this.fetchObjectiveData();
                            } else if (response && response.data.resultCode === 'KO') {
                                this.setState({
                                    showSpinner: false
                                });
                                this.showErrorNotification(response.data.errorDescription, "Error", "error");
                            } else {
                                this.showErrorNotification("Sorry! Something went wrong", "Error", "error");
                            }
                        });
                } else {
                    this.showErrorNotification("Please enter all mandatory fields with valid values and try again", "Save Error", "error");
                }
                /*
                this.setState({
                    showSpinner: true
                });
                editedObjArray.map((obj) => {
                    let tempKPIObj = {
                        'kpiId': obj.mstOkpiId,
                        'kpiName': obj.mstOkpiName,
                        'kpiDescription': obj.mstOkpiDescription,
                        'kpiFormula': obj.mstOkpiFormula,
                        'kpiTrend':  obj.mstOkpiTrend,
                        'kpiUnit': obj.mstOkpiUnit,
                        'calculationType': obj.mstOkpiCalcType
                    }
                    toBeSavedObj.push(tempKPIObj);
                    return true;
                });

                adminStore.saveOKPIDetails(toBeSavedObj)
                .then(response => {
                    if (response && response.data.resultCode === 'OK') {
                        this.showErrorNotification("KPI Details saved successfully", "Success", "success");
                        // this.props.modalCloseHandler();
                        this.fetchObjectiveData();
                    } else if (response && response.data.resultCode === 'KO') {
                        this.setState({
                            showSpinner: false
                        });
                        this.showErrorNotification(response.data.errorDescription, "Error", "error");
                    } else {
                        this.showErrorNotification("Sorry! Something went wrong", "Error", "error");
                        console.log('error: something went wrong in SAVE');
                    }
                });
                */
            } else {
                let mandatoryCount = 0;
                editedObjArray.map((obj) => {
                    if (!RegExp(/[<>!'"[\]]/).test(obj[selectedPrefix + 'Name']) && !RegExp(/[<>!'"[\]]/).test(obj.objCustomCatValue) && !RegExp(/[<>!'"[\]]/).test(obj.objCustomSubCatValue)) {
                        let tempObj = {
                            [`${this.state.selectedPrefix}Id`]: obj[`${this.state.selectedPrefix}Id`],
                            [`${this.state.selectedPrefix}Name`]: obj[`${this.state.selectedPrefix}Name`],
                        }
                        switch (selectedObjectiveType) {
                            case "Value Driver":
                                tempObj["objTypeId"] = obj["objTypeId"];
                                break;
                            case "Financial / Non-Financial Objective":
                                tempObj["objTypeId"] = obj["objTypeId"];
                                tempObj["objCatId"] = obj["objCatId"]
                                tempObj["objCustomCatValue"] = obj["objCustomCatValue"]
                                break;
                            case "Business Objective":
                                tempObj["objTypeId"] = obj["objTypeId"];
                                tempObj["objCatId"] = obj["objCatId"];
                                tempObj["objSubCatId"] = obj["objSubCatId"];
                                tempObj["objCustomCatValue"] = obj["objCustomCatValue"];
                                tempObj["objCustomSubCatValue"] = obj["objCustomSubCatValue"];
                                break;
                        }
                        toBeSavedObj.push(tempObj);
                    } else {
                        mandatoryCount++;
                    }
                    return true;
                });

                if (mandatoryCount === 0) {
                    this.setState({
                        showSpinner: true
                    });
                    let result = {}
                    if (selectedObjectiveType === 'Strategic Objective') {
                        result = adminStore.saveSo(toBeSavedObj)
                    }
                    else if (selectedObjectiveType === 'Financial / Non-Financial Objective') {
                        result = adminStore.saveFo(toBeSavedObj)
                    }
                    else if (selectedObjectiveType === 'Business Objective') {
                        result = adminStore.saveBo(toBeSavedObj)
                    }
                    else if (selectedObjectiveType === "Value Driver") {
                        result = adminStore.saveVD(toBeSavedObj)
                    }
                    // let payloadObj = {};
                    // payloadObj['soList'] = toBeSavedObj;
                    // const type = selectedPrefix.toUpperCase();
                    // adminStore.saveObjectives(type, payloadObj)
                    result.then(response => {
                        if (!response.error && response.data.resultCode === 'OK') {
                            this.showErrorNotification(selectedObjectiveType + " saved successfully", "Success", "success");
                            this.setState({
                                isEdited: false
                            })
                            // this.props.modalCloseHandler();
                            this.fetchObjectiveData();
                        } else if (response && response.data.resultCode === 'KO') {
                            this.setState({
                                showSpinner: false
                            });
                            this.showErrorNotification(response.data.errorDescription, "Error", "error");
                        } else {
                            this.showErrorNotification("Sorry! Something went wrong", "Error", "error");
                        }
                    });
                } else {
                    this.showErrorNotification("Please enter valid value. Special characters [ < ! ' \" > ] are invalid", "Save Error", "error");
                }

            }

        } else {
        }
    }

    searchInputHandler = (e) => {
        this.setState({
            searchString: e.target.value
        });
    }

    searchObjective = (e) => {
        const { searchString, selectedPrefix } = this.state;
        const { selectedObjectiveType } = this.props;
        let objListArr = JSON.parse(JSON.stringify(this.initialObjectivesList));
        if (searchString.trim() !== '') {
            let filteredList = [];
            let name = '';
            let noMatchedData = false;
            if (selectedObjectiveType === 'KPI') {
                name = 'mstOkpiName'
            } else {
                name = selectedPrefix + 'Name'
            }
            filteredList = objListArr.filter(obj => {
                if (obj[name].toLowerCase().includes(searchString.toLowerCase())) {
                    return obj;
                }
                // return true
            });
            if (filteredList.length === 0) {
                noMatchedData = true;
            } else {
                noMatchedData = false;
            }
            this.setState({
                objectivesList: filteredList,
                noMatchData: noMatchedData
            });
        } else {
            this.setState({
                objectivesList: objListArr,
                noMatchData: true
            });
        }
    }

    // ----- START of Utility functions -------
    isDefined = (value) => {
        return value !== undefined && value !== null;
    }

    redirectHandler(type) {
        const { history } = this.props;
        // eslint-disable-next-line default-case
        switch (type) {
            case 'home':
                history.push('/home');
                break;
            case 'adminpanel':
                history.push('/admin');
                break;
        }
    }

    showErrorNotification = (message, title, type) => {
        if (type === 'error') {
            toast.error(<NotificationMessage
                title={title}
                bodytext={message}
                icon={type}
            />, {
                position: toast.POSITION.BOTTOM_RIGHT
            });
        }
        if (type === 'success') {
            toast.info(<NotificationMessage
                title={title}
                bodytext={message}
                icon={type}
            />, {
                position: toast.POSITION.BOTTOM_RIGHT
            });
        }

    }

    handleKeyDown = (e, type) => {
        if (e.key === 'Enter') {
            switch (type) {
                case 'search':
                    this.searchObjective(e);
                    break;
                case 'close':
                    this.redirectHandler('adminpanel');
                    break;
                case 'save':
                    this.saveVDTObjectives(e);
                    break;
                default:
                    break;
            }
        }
    }
    decodeType = (type) => {
        switch (type) {
            case "FINANCIAL":
                return "Financial";
            case "NON_FINANCIAL":
                return "Non-Financial";
            case "":
                return "";
            default:
                break;
        }
    }

    customIndustryValueRenderer = (e, index) => {
        return this.state.objectivesList[index].industriesList !== undefined && this.state.objectivesList[index].industriesList.length > 1
            ? "Multiple"
            : ""
    };

    customBuisnessValueRenderer = (e, index) => {
        return this.state.objectivesList[index].businessList !== undefined && this.state.objectivesList[index].businessList.length > 1
            ? "Multiple"
            : ""
    };


    setIndustrySelected = (selected, objInd) => {

        const { objectivesList } = this.state;
        let objListArr = [...objectivesList];
        objListArr[objInd].industriesList = selected;

        this.setState({
            objectivesList: objListArr,
            selectedIndustryValues: selected,
            isEdited: true
        })
    }

    setBusinessSelected = (selected, objInd) => {
        const { objectivesList } = this.state;
        let objListArr = [...objectivesList];
        objListArr[objInd].businessList = selected;
        this.setState({
            objectivesList: objListArr,
            selectedBusinessValues: selected,
            isEdited: true
        })

    }

    // ----- END of Utility functions -------

    render() {
        const { selectedObjectiveType, foBoTypes } = this.props;
        const { showSpinner, objectivesList, searchString, noMatchData, pagesArray, pageNo, showPageArray } = this.state;
        const getTooltip = (value) => {
            return `${value}`;
        }
        return (
            <div className="admin-vdt-table-main" >
                <div className="search-obj row">

                    <div className="row col-sm-12">

                        <div className="col-8">
                            <div className="obj-search-combo">
                                <div className="search-input">
                                    <input type="text"
                                        className="search-text"
                                        name="search objective"
                                        value={searchString}
                                        onChange={(e) => { this.searchInputHandler(e) }}
                                        onKeyDown={(e) => { this.handleKeyDown(e, 'search') }}
                                        tabIndex="1"
                                        placeholder="Search"
                                    ></input>
                                </div>
                                <div
                                    className="search-icon1" data-tip={getTooltip("Search")}
                                    tabIndex="1"
                                    onClick={(e) => { this.searchObjective(e) }}
                                    onKeyDown={(e) => { this.handleKeyDown(e, 'search') }}
                                >
                                    <img src={search} alt="search button" style={{ cursor: 'pointer' }} />
                                </div>
                                <ReactTooltip html={true} />
                            </div>
                        </div>

                    </div>
                </div>
                <div className="row col-sm-12 marginNone paddingNone" >
                    {showSpinner ?
                        <div className="row justify-content-center spinner-div">
                            <i className="fa fa-spinner fa-spin" style={{ color: '#ffffff' }}></i>
                        </div>
                        :
                        <div className="col-sm-12 objective-list" ref={this.objListRef}>

                            {/* objective list map */}
                            {selectedObjectiveType === 'KPI' ?
                                <Fragment>
                                    <div className="kpi-details-list rightBorder">
                                        <div className="objc-header-row objc-row row">
                                            {/* <i className="fa fa-pencil"></i>
                                        <i className="fa fa-trash"></i> */}
                                            <div className="objc-header-name-row" style={{ border: "none" }}>
                                                <div className="row no-gutters">
                                                    <div className="th-div" style={{ width: '12%' }}>
                                                        <label><b>KPI</b></label>
                                                    </div>
                                                    <div className="th-div" style={{ width: '12%' }}>
                                                        <label><b>Description</b></label>
                                                    </div>
                                                    <div className="th-div" style={{ width: '10%' }}>
                                                        <label><b>Formula</b></label>
                                                    </div>
                                                    <div className="th-div" style={{ width: '10%' }}>
                                                        <label><b>Industry</b></label>
                                                    </div>
                                                    <div className="th-div" style={{ width: '10%', paddingTop: "2px" }}>
                                                        <label><b>Business Functions</b></label>
                                                    </div>
                                                    <div className="th-div" style={{ width: '8%' }}>
                                                        <label><b>Trend</b></label>
                                                    </div>
                                                    <div className="th-div" style={{ width: '5%' }}>
                                                        <label><b>Unit</b></label>
                                                    </div>
                                                    <div className="th-div" style={{ width: '14%', paddingTop: "2px" }}>
                                                        <label><b>Target Calculation Type</b></label>
                                                    </div>
                                                    <div className="th-div" style={{ width: '11%' }}>
                                                        <label><b>KPI Type</b></label>
                                                    </div>
                                                    <div className="th-div" style={{ width: '8%', borderRight: "0px" }}>
                                                        <label><b>Action</b></label>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="accounts-body-scroll">
                                            {objectivesList && objectivesList.map((objective, objIndex) => (
                                                <div key={objIndex} className="objc-row row">

                                                    <div className="objc-name-row">
                                                        <div className="row no-gutters">
                                                            <div className="td-div" style={{ width: '12%' }}>
                                                                {objective.isEdited ?
                                                                    <textarea id={objective.mstOkpiName}
                                                                        type="text" className="kpi-name-input" defaultValue={objective.mstOkpiName}
                                                                        style={{ resize: 'none' }} spellCheck="false"
                                                                        maxLength="100"
                                                                        tabIndex="2"
                                                                        onChange={(e) => { this.kpiDetailsChangeHandler(e, objIndex, 'mstOkpiName') }}
                                                                    ></textarea>
                                                                    :
                                                                    <div className="label-div">
                                                                        <label>{objective.mstOkpiName}</label>
                                                                    </div>
                                                                }
                                                            </div>
                                                            <div className="td-div" style={{ width: '12%' }}>
                                                                {objective.isEdited ?
                                                                    <textarea id={`${objective.mstOkpiName}_desc`}
                                                                        type="text" className="kpi-descr-input"
                                                                        defaultValue={objective.mstOkpiDescription}
                                                                        style={{ resize: 'none' }} spellCheck="false"
                                                                        tabIndex="2"
                                                                        maxLength="250"
                                                                        onChange={(e) => { this.kpiDetailsChangeHandler(e, objIndex, 'mstOkpiDescription') }}
                                                                    ></textarea>
                                                                    :
                                                                    <div className="label-div">
                                                                        <label>{objective.mstOkpiDescription}</label>
                                                                    </div>
                                                                }
                                                            </div>
                                                            <div className="td-div" style={{ width: '10%' }}>
                                                                {objective.isEdited ?
                                                                    <textarea id={`${objective.mstOkpiName}_formula`}
                                                                        type="text" className="kpi-formula-input" defaultValue={objective.mstOkpiFormula}
                                                                        style={{ resize: 'none' }}
                                                                        spellCheck="false"

                                                                        tabIndex="2"
                                                                        onChange={(e) => { this.kpiDetailsChangeHandler(e, objIndex, 'mstOkpiFormula') }}
                                                                    ></textarea>
                                                                    :
                                                                    <div className="label-div">
                                                                        <label>{objective.mstOkpiFormula}</label>
                                                                    </div>
                                                                }
                                                            </div>

                                                            <div className="td-div" style={{ width: '10%' }}>
                                                                {objective.isEdited ?

                                                                    <MultiSelect
                                                                        options={this.props.industryList}
                                                                        value={objective.industriesList}
                                                                        onChange={(e) => this.setIndustrySelected(e, objIndex)}
                                                                        labelledBy="Select"
                                                                        disableSearch={true}
                                                                        id={`${objective.mstOkpiName}_industry`}
                                                                        valueRenderer={(e) => this.customIndustryValueRenderer(e, objIndex)}
                                                                        ClearSelectedIcon

                                                                    />
                                                                    :

                                                                    <label className="label-div">{objective.industries && objective.industries.length > 1 ? "Multiple" : objective.industries && objective.industries.length > 0 && objective.industries[0].industryName}</label>
                                                                }
                                                            </div>

                                                            <div className="td-div" style={{ width: '10%' }}>
                                                                {objective.isEdited ?

                                                                    <MultiSelect
                                                                        options={this.props.businessList}
                                                                        value={objective.businessList}
                                                                        onChange={(e) => this.setBusinessSelected(e, objIndex)}
                                                                        labelledBy="Select"
                                                                        disableSearch={true}
                                                                        id={`${objective.mstOkpiName}_business`}
                                                                        valueRenderer={(e) => this.customBuisnessValueRenderer(e, objIndex)}
                                                                        ClearSelectedIcon
                                                                    />
                                                                    :
                                                                    <label className="label-div">{objective.business && objective.business.length > 1 ? "Multiple" : objective.business && objective.business.length > 0 && objective.business[0].businessName}</label>
                                                                }
                                                            </div>




                                                            <div className="td-div" style={{ width: '8%' }}>
                                                                {objective.isEdited ?
                                                                    <select tabIndex="2" id={`${objective.mstOkpiName}_trend`}
                                                                        className="kpi-trend-select" defaultValue={objective.mstOkpiTrend}
                                                                        onChange={(e) => { this.kpiDetailsChangeHandler(e, objIndex, 'mstOkpiTrend') }}
                                                                    >
                                                                        <option value="Select KPI Trend" disabled>
                                                                            Select Trend
                                                                </option>
                                                                        <option value="Increase">Increase</option>
                                                                        <option value="Decrease">Decrease</option>
                                                                    </select>
                                                                    : <label>{objective.mstOkpiTrend}</label>
                                                                }
                                                            </div>
                                                            <div className="td-div1" style={{ width: '5%', textAlign: 'right !important' }}>
                                                                {objective.isEdited ?
                                                                    <select id={`${objective.mstOkpiName}_unit`}
                                                                        tabIndex="2" className='kpi-unit-select' defaultValue={objective.mstOkpiUnit}
                                                                        onChange={(e) => { this.kpiDetailsChangeHandler(e, objIndex, 'mstOkpiUnit') }}
                                                                    >
                                                                        <option value="Select KPI Unit" disabled>
                                                                            Select Unit
                                                                </option>
                                                                        <option value="#/$">#/$</option>
                                                                        <option value="%">%</option>
                                                                        <option value="#">#</option>
                                                                        <option value="$">$</option>
                                                                    </select>
                                                                    :
                                                                    <label>{objective.mstOkpiUnit}</label>
                                                                }

                                                            </div>
                                                            <div className="td-div" style={{ width: '14%' }}>
                                                                {objective.isEdited ?
                                                                    <select id={`${objective.mstOkpiName}_cal`}
                                                                        tabIndex="2" className='kpi-tct-select' defaultValue={objective.mstOkpiCalcType}
                                                                        onChange={(e) => { this.kpiDetailsChangeHandler(e, objIndex, 'mstOkpiCalcType') }}
                                                                    >
                                                                        <option value="Select KPI Target Calculation Type" disabled>
                                                                            Select Target Calculation Type
                                                                </option>
                                                                        <option value="Absolute Value">Absolute Value</option>
                                                                        <option value="Relative Improvement">Relative Improvement</option>
                                                                        <option value="Absolute Improvement">Absolute Improvement</option>
                                                                    </select>
                                                                    :
                                                                    <label>{objective.mstOkpiCalcType}</label>
                                                                }
                                                            </div>

                                                            <div className="td-div" style={{ width: '11%' }}>
                                                                {objective.isEdited ?
                                                                    // <select id = {`${objective.mstOkpiName}_cal`}
                                                                    // tabIndex="2" className='kpi-tct-select' defaultValue={objective.mstOkpiCalcType}
                                                                    // onChange={(e) => {this.kpiDetailsChangeHandler(e, objIndex, 'mstOkpiCalcType')}}
                                                                    // >
                                                                    // </select>
                                                                    <select
                                                                        defaultValue={objective.okpiType}
                                                                        className='kpi-tct-select'
                                                                        id={`${objective.mstOkpiName}_cal`}
                                                                        tabIndex="2"
                                                                        //  disabled={props.loader}
                                                                        onChange={(e) => { this.kpiDetailsChangeHandler(e, objIndex, 'okpiType') }}
                                                                    >
                                                                        <option value="" selected disabled>
                                                                            Select KPI Type
                                                                 </option>
                                                                        <option value="FINANCIAL">Financial</option>
                                                                        <option value="NON_FINANCIAL">Non-Financial</option>
                                                                    </select>
                                                                    :
                                                                    <label>{this.decodeType(objective.okpiType)}</label>
                                                                }
                                                            </div>


                                                            <div className="td-div" style={{ width: '8%' }}>


                                                                <i
                                                                    className="fa fa-pencil2"
                                                                    data-tip data-for='edit_obj'
                                                                    onClick={(e) => this.editKpiObjective(e, objIndex)}>
                                                                    <img src={pencil} style={{ cursor: 'pointer' }} alt=""
                                                                        id={`${objective.mstOkpiName}_edit`} />
                                                                </i>
                                                                <i
                                                                    className="fa fa-trash2"
                                                                    data-tip data-for='delete_obj'
                                                                    onClick={(e) => { this.deleteVDTElement(e, objIndex) }}
                                                                >
                                                                    <img src={trash} style={{ cursor: 'pointer' }} alt=""
                                                                        id={`${objective.mstOkpiName}_delete`} />
                                                                </i>
                                                            </div>


                                                        </div>
                                                    </div>
                                                </div>
                                            ))
                                            }
                                            {objectivesList && objectivesList.length === 0 && noMatchData ?
                                                <div className="objc-row row no-match-div">
                                                    <p>No Matching Data Found.</p>
                                                </div>
                                                :
                                                ''
                                            }

                                        </div>

                                    </div>
                                </Fragment>
                                :
                                <Fragment>
                                    <div className="no-kpi-vdt-details-list rightBorder">
                                        <div className="objc-header-row objc-row row" style={{ borderRight: "0px" }}>
                                            {/* <i className="fa fa-pencil"></i>
                                    <i className="fa fa-trash"></i> */}
                                            <div className="edit-vdt-header-row">
                                                <label style={{ width: "12%" }}>{this.props.selectedObjectiveType}</label>
                                                {
                                                    this.props.selectedObjectiveType !== "Strategic Objective"
                                                    &&
                                                    <Fragment>
                                                        <label style={{ width: "11%" }}>Type</label>
                                                        {this.props.selectedObjectiveType === "Financial / Non-Financial Objective" && <label style={{ width: "12%" }}>Category</label>}
                                                        {this.props.selectedObjectiveType === "Business Objective" && <Fragment>
                                                            <label style={{ width: "12%" }}>Financial / Non-Financial Objective</label>
                                                            <label style={{ width: "12%" }}>Custom Objective</label>
                                                            <label style={{ width: "9%" }}>Category</label>
                                                        </Fragment>}
                                                        {(this.props.selectedObjectiveType === "Business Objective" || this.props.selectedObjectiveType === "Financial / Non-Financial Objective") && <label style={{ width: "12%" }}>Custom Category</label>}
                                                    </Fragment>
                                                }
                                                <label style={{ width: "10%", textAlign: "center", paddingRight: "8px" }}>Action</label>
                                            </div>
                                        </div>
                                        <div className="accounts-body-scroll">
                                            {objectivesList && objectivesList.map((objective, objIndex) => {
                                                let objectiveType = foBoTypes[objective.objTypeId - 1]
                                                let selectedCategory = objectiveType && objectiveType.objCategories.filter(category => category.objCatId === objective.objCatId);

                                                return <div key={objIndex} className="objc-row row">
                                                    <div className="edit-vdt-row">
                                                        {objective.isEdited ?
                                                            <Fragment>
                                                                <textarea id="editObjectiveName"
                                                                    type="text" name="objective-name" defaultValue={objective[`${this.state.selectedPrefix.toLowerCase()}Name`]}
                                                                    className="editVdt"
                                                                    style={{ width: "12%", paddingLeft: "8px", resize: "none" }}
                                                                    maxLength="100"
                                                                    tabIndex="2"
                                                                    onChange={(event) => this.onChange(event, objIndex, "Name")}
                                                                ></textarea>
                                                                {
                                                                    this.props.selectedObjectiveType !== "Strategic Objective"
                                                                    &&
                                                                    <select className='editVdt'
                                                                        value={objective.objTypeName ? objective.objTypeName : ""}
                                                                        maxLength="100"
                                                                        style={{ width: "12%", height: "auto" }}
                                                                        id='editObjectiveType'
                                                                        onChange={(event) => this.onChange(event, objIndex, "Type")}
                                                                    >
                                                                        <option value="" defaultValue disabled>Select Type</option>
                                                                        {
                                                                            foBoTypes && foBoTypes.length > 0 && foBoTypes.map((type) =>
                                                                                <option style={{ color: "#fff" }} key={type.objTypeId} value={type.objTypeName}>{type.objTypeLabel}</option>)
                                                                        }
                                                                    </select>
                                                                }
                                                                {
                                                                    (this.props.selectedObjectiveType === "Financial / Non-Financial Objective" ||
                                                                        this.props.selectedObjectiveType === "Business Objective")
                                                                    &&
                                                                    <Fragment>
                                                                        <select className='editVdt'
                                                                            value={objective.objCatName ? objective.objCatName : ""}
                                                                            maxLength="100"
                                                                            style={{ width: "12%", height: "auto" }}
                                                                            id='editObjectiveCategory'
                                                                            onChange={(event) => this.onChange(event, objIndex, "Category")}
                                                                        >
                                                                            <option value="" defaultValue disabled>Select {
                                                                                this.props.selectedObjectiveType === "Financial / Non-Financial Objective"
                                                                                    ?
                                                                                    "Category"
                                                                                    :
                                                                                    this.props.selectedObjectiveType === "Business Objective"
                                                                                        ?
                                                                                        "Objective"
                                                                                        : ""
                                                                            }</option>
                                                                            {
                                                                                objectiveType && objectiveType.objCategories && objectiveType.objCategories.length > 0 && objectiveType.objCategories.map((category) =>
                                                                                    <option style={{ color: "#fff" }} key={category.objCatId} value={category.objCatName}>{category.objCatLabel}</option>)
                                                                            }
                                                                        </select>
                                                                        {
                                                                            objective.objCatName === "CUSTOM"
                                                                                ?
                                                                                <textarea id="editCustomCategory"
                                                                                    type="text" name="objective-name" defaultValue={objective.objCustomCatValue}
                                                                                    className="editVdt"
                                                                                    style={{ width: "12%", paddingLeft: "8px", resize: "none" }}
                                                                                    maxLength="100"
                                                                                    tabIndex="2"
                                                                                    onChange={(event) => this.onChange(event, objIndex, "CustomCategory")}
                                                                                ></textarea>
                                                                                :
                                                                                <label style={{ width: "12%" }}></label>
                                                                        }

                                                                    </Fragment>
                                                                }
                                                                {
                                                                    this.props.selectedObjectiveType === "Business Objective"
                                                                    &&
                                                                    <Fragment>
                                                                        <select className='editVdt'
                                                                            value={objective.objSubCatName ? objective.objSubCatName : ""}
                                                                            maxLength="100"
                                                                            style={{ width: "12%", height: "auto" }}
                                                                            id='editObjectiveSubCategory'
                                                                            onChange={(event) => this.onChange(event, objIndex, "SubCategory")}
                                                                        >
                                                                            <option value="" defaultValue disabled>Select Category</option>
                                                                            {
                                                                                selectedCategory && selectedCategory[0] && selectedCategory[0].objectiveSubCategories && selectedCategory[0].objectiveSubCategories.length > 0 && selectedCategory[0].objectiveSubCategories.map((subCategory) =>
                                                                                    <option style={{ color: "#fff" }} key={subCategory.objSubCatId} value={subCategory.objSubCatName}>{subCategory.objSubCatLabel}</option>)
                                                                            }
                                                                        </select>
                                                                        {
                                                                            objective.objSubCatName === "CUSTOM"
                                                                                ?
                                                                                <textarea id="editCustomSubCategory"
                                                                                    type="text" name="objective-name" defaultValue={objective.objCustomSubCatValue}
                                                                                    className="editVdt"
                                                                                    style={{ width: "12%", paddingLeft: "8px", resize: "none" }}
                                                                                    maxLength="100"
                                                                                    tabIndex="2"
                                                                                    onChange={(event) => this.onChange(event, objIndex, "CustomSubCategory")}
                                                                                ></textarea>
                                                                                :
                                                                                <label style={{ width: "12%" }}></label>
                                                                        }

                                                                    </Fragment>
                                                                }
                                                            </Fragment> :
                                                            <Fragment>
                                                                <label style={{ width: "12%" }}>{objective[`${this.state.selectedPrefix.toLowerCase()}Name`]}</label>
                                                                {this.props.selectedObjectiveType !== "Strategic Objective" && <label style={{ width: "11%" }}>{objective && objective.objTypeLabel}</label>}
                                                                {
                                                                    (this.props.selectedObjectiveType === "Financial / Non-Financial Objective" ||
                                                                        this.props.selectedObjectiveType === "Business Objective")
                                                                    &&
                                                                    <Fragment>
                                                                        <label style={{ width: "12%" }}>{objective && objective.objCatLabel}</label>
                                                                        <label style={{ width: "12%" }}>{objective && objective.objCustomCatValue}</label>
                                                                    </Fragment>
                                                                }
                                                                {
                                                                    this.props.selectedObjectiveType === "Business Objective" &&
                                                                    <Fragment>
                                                                        <label style={{ width: "9%" }}>{objective && objective.objSubCatLabel}</label>
                                                                        <label style={{ width: "12%" }}>{objective && objective.objCustomSubCatValue}</label>
                                                                    </Fragment>
                                                                }
                                                            </Fragment>
                                                        }
                                                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-evenly", flexWrap: "nowrap", width: "10%" }}>
                                                            <i
                                                                className="fa fa-pencil1"
                                                                data-tip data-for='edit_obj'
                                                                onClick={(e) => { this.editVDTElement(e, objIndex) }}
                                                            >
                                                                <img src={pencil} alt=""
                                                                    id={`${objective[`${this.state.selectedPrefix.toLowerCase()}Name`]}_edit`} />
                                                            </i>
                                                            <i
                                                                className="fa fa-trash1"
                                                                style={{ paddingBottom: "4px" }}
                                                                data-tip data-for='delete_obj'
                                                                onClick={(e) => { this.deleteVDTElement(e, objIndex) }}
                                                            >
                                                                <img src={trash} alt=""
                                                                    id={`${objective[`${this.state.selectedPrefix.toLowerCase()}Name`]}_delete`} /></i>
                                                        </div>

                                                    </div>
                                                </div>
                                            })
                                            }
                                        </div>
                                        {objectivesList && objectivesList.length === 0 && noMatchData ?
                                            <div className="objc-row row no-match-div">
                                                <p>No Matching Data Found.</p>
                                            </div>
                                            :
                                            ''
                                        }
                                    </div>
                                </Fragment>
                            }
                            <ReactTooltip id='edit_obj'>
                                <span>Edit</span>
                            </ReactTooltip>
                            <ReactTooltip id='delete_obj'>
                                <span>Delete</span>
                            </ReactTooltip>
                        </div>
                    }

                </div>
                {(pagesArray.length > 0 && selectedObjectiveType === 'KPI') ?
                    <div className="row col-sm-12 marginNone paddingNone pagination-wrapper" >
                        <div style={{ display: "inline-flex" }}>
                            <img src={prevIcon} alt="prevIcon" className={pageNo === 0 ? "page-disable" : "page-padding"} onClick={pageNo === 0 ? () => { } : () => { this.prevNextClick("prevPage") }} />
                            <div>
                                {pagesArray.length > 5 ?
                                    (showPageArray.map((page) => (
                                        <span className={(pageNo === (page - 1)) ? "page-bold" : "page-normal"} style={{ cursor: (page === "..." ? "default" : "pointer") }} onClick={page === "..." ? () => { } : () => { this.onPageChange(page - 1) }} > {page} </span>
                                    )))
                                    :
                                    (pagesArray.map((page) => (
                                        <span className={(pageNo === (page - 1)) ? "page-bold" : "page-normal"} onClick={() => { this.onPageChange(page - 1) }} > {page} </span>
                                    )))
                                }

                            </div>
                            <img src={nextIcon} alt="nextIcon" className={pageNo === (pagesArray.length - 1) ? "page-disable" : "page-padding"} onClick={pageNo === (pagesArray.length - 1) ? () => { } : () => { this.prevNextClick("nextPage") }} />
                        </div>
                    </div>
                    : ""}
                <div className='col-sm-9 buttondiv'>

                    <div className='cr-de-btn-div' style={{ paddingLeft: '0px' }}>

                        <button alt="save Objectives"
                            disabled={showSpinner || !this.state.isEdited}
                            className="btn btn-primary"
                            //   data-tip={getTooltip('Save')}
                            data-for="saveIconToolTip"
                            onClick={showSpinner ? () => { } : (e) => { this.saveVDTObjectives(e) }}
                            onKeyDown={showSpinner ? () => { } : (e) => { this.handleKeyDown(e, 'save') }}
                        >Save</button>
                    </div>
                </div>

                {/* custom confirm box */}
                <CustomConfirmModal
                    ownClassName={'client-master-delete-modal'}
                    isModalVisible={this.state.deleteVDTModalVisible}
                    modalTitle={this.state.deleteVDTModalTitle}
                    closeConfirmModal={this.closeDeleteVDTConfirmModal}
                />
            </div>
        )
    }
}

export default withRouter(AdminEditVDT);