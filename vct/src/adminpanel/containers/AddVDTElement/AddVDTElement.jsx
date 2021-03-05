import React, { Fragment, useState, useEffect } from 'react';
import 'moment-timezone';
import './AddVDTElement.css';
import MultiSelect from "react-multi-select-component";
//import DashboardFilter from "../Dashboards/DashboardFilter/DashboardFilter"

const AddVDTElement = (props) => {

    const [selectedFoBoType, setSelectedFoBoType] = useState("");
    const [selectedFoBoCategory, setSelectedFoBoCategory] = useState("");
    const [selectedFoBoSubCategory, setSelectedFoBoSubCategory] = useState("");
    const [customCategoryText, setCustomCategoryText] = useState("");
    const [customSubCategoryText, setCustomSubCategoryText] = useState("");

    useEffect(() => setSelectedFoBoType(""), [props.selectedObjective])
    useEffect(() => setSelectedFoBoCategory(""), [selectedFoBoType])
    useEffect(() => setSelectedFoBoSubCategory(""), [selectedFoBoCategory])
    useEffect(() => setCustomCategoryText(""), [selectedFoBoCategory])
    useEffect(() => setCustomSubCategoryText(""), [selectedFoBoSubCategory])

    useEffect(() => {
        if (props.isSaveSuccess) {
            setSelectedFoBoType("")
        }
    }, [props.isSaveSuccess])

    const handleKeyDown = (e, type) => {
        if (e.key === 'Enter') {
            switch (type) {
                case 'close':
                    props.redirectHandler('adminpanel');
                    break;
                case 'save':
                    if (!props.loader && !getSaveDisabledState()) {
                        onSave(e);
                    }
                    break;
                default:
                    break;
            }
        }
    }

    const customIndustryValueRenderer = () => {
        return props.selectedIndustryValue.length > 1
            ? "Multiple"
            : ""
    };

    const customBuisnessValueRenderer = () => {
        return props.selectedBusinessValue.length > 1
            ? "Multiple"
            : ""
    };

    const setIndustrySelected = (selected) => {
        props.selectedIndustries(selected);
    }

    const setBusinessSelected = (selected) => {
        props.selectedBusiness(selected);
    }

    const onFoBoTypeChange = (event) => {
        let selectedType = props.foBoTypes.filter(type => type.objTypeName === event.target.value);
        setSelectedFoBoType(selectedType[0])
    }
    const onFoBoCategoryChange = (event) => {
        let selectedCategory = selectedFoBoType.objCategories.filter(category => category.objCatName === event.target.value);
        setSelectedFoBoCategory(selectedCategory[0])
    }

    const onFoBoSubCategoryChange = (event) => {
        let selectedSubCategory = selectedFoBoCategory.objectiveSubCategories.filter(subCategory => subCategory.objSubCatName === event.target.value);
        setSelectedFoBoSubCategory(selectedSubCategory[0])
    }

    const onCustomCategoryTextChange = (event) => {
        setCustomCategoryText(event.target.value)
    }

    const onCustomSubCategoryTextChange = (event) => {
        setCustomSubCategoryText(event.target.value)
    }

    const getSaveDisabledState = () => {
        switch (props.selectedObjective) {
            case "Financial / Non-Financial Objective":
                return props.objectiveValue.trim() === "" || selectedFoBoType === "" || selectedFoBoCategory === "" || (selectedFoBoCategory.objCatName === "CUSTOM" && customCategoryText === "")
            case "Business Objective":
                return props.objectiveValue.trim() === "" || selectedFoBoType === "" || selectedFoBoCategory === "" || (selectedFoBoCategory.objCatName === "CUSTOM" && customCategoryText === "") || selectedFoBoSubCategory === "" || (selectedFoBoSubCategory.objSubCatName === "CUSTOM" && customSubCategoryText === "")
            case "Value Driver":
                return props.objectiveValue.trim() === "" || selectedFoBoType === ""
            default:
                return props.objectiveValue.trim() === ""
        }
    }

    const onSaveSo = () => {
        let input = {
            "soId": null,
            "soName": props.objectiveValue.trim()
        }
        return [input]
    }

    const onSaveFo = () => {
        let input = {
            "foId": null
            , "foName": props.objectiveValue.trim()
            , "objTypeId": selectedFoBoType.objTypeId
            , "objCatId": selectedFoBoCategory.objCatId
            , "objCustomCatValue": customCategoryText
        }
        return [input]
    }

    const onSaveBo = () => {
        let input = {
            "boId": null,
            "boName": props.objectiveValue.trim(),
            "objTypeId": selectedFoBoType.objTypeId,
            "objCatId": selectedFoBoCategory.objCatId,
            "objSubCatId": selectedFoBoSubCategory.objSubCatId,
            "objCustomCatValue": customCategoryText,
            "objCustomSubCatValue": customSubCategoryText
        }
        return [input]
    }

    const onSaveVD = () => {
        let input = {
            "vdId": null,
            "vdName": props.objectiveValue.trim(),
            "objTypeId": selectedFoBoType.objTypeId
        }
        return [input]
    }

    const onSave = (event) => {
        switch (props.selectedObjective) {
            case "Strategic Objective":
                props.saveObjectives(event, onSaveSo())
                break;
            case "Financial / Non-Financial Objective":
                props.saveObjectives(event, onSaveFo())
                break;
            case "Business Objective":
                props.saveObjectives(event, onSaveBo())
                break;
            case "Value Driver":
                props.saveObjectives(event, onSaveVD())
                break;
            default:
                props.saveObjectives(event)
        }
    }
    return (
        <div className='inputForm' id="addVDT">
            <div className="row marginNone">
                <div className="col-sm-5 paddingNone">
                    <div className="field-wrap">
                        <h6 className='vdtLabel'>{props.selectedObjective} *</h6>
                        <div className="input-field-wrap">
                            <input type="text" className='textboxStyle'
                                disabled={props.loader}
                                value={props.objectiveValue}
                                tabIndex="1"
                                maxLength="100"
                                id='objective'
                                onChange={(event) => props.onObjectiveValueChange(event)}
                                onKeyDown={(e) => { handleKeyDown(e, 'save') }}
                            /><br />

                            {(props.selectedObjective !== 'KPI' && props.objectiveError !== '') ?
                                <span style={{ color: '#ffffff' }}><small>{props.objectiveError}</small></span> :
                                (props.selectedObjective === 'KPI' && props.kpiNameError !== '') ?
                                    <span style={{ color: '#ffffff' }}><small>{props.kpiNameError}</small></span> :
                                    <span></span>}
                        </div>
                    </div>
                    {
                        (props.selectedObjective === "Financial / Non-Financial Objective" ||
                            props.selectedObjective === "Business Objective" ||
                            props.selectedObjective === "Value Driver") &&
                        <div className="field-wrap">
                            <h6 className='vdtLabel'>Type *</h6>
                            <div className="input-field-wrap">
                                <select className='textboxStyle'
                                    disabled={props.loader}
                                    value={selectedFoBoType ? selectedFoBoType.objTypeName : ""}
                                    tabIndex="1"
                                    maxLength="100"
                                    id='selectedObjectiveType'
                                    onChange={onFoBoTypeChange}
                                >
                                    <option value="" defaultValue disabled>Select Type</option>
                                    {
                                        props.foBoTypes && props.foBoTypes.length > 0 && props.foBoTypes.map((type) =>
                                            <option style={{ color: "#fff" }} key={type.objTypeId} value={type.objTypeName}>{type.objTypeLabel}</option>)
                                    }
                                </select><br />

                            </div>
                        </div>
                    }
                    {(props.selectedObjective === "Financial / Non-Financial Objective" ||
                        props.selectedObjective === "Business Objective") &&
                        <Fragment>
                            <div className="field-wrap">
                                <h6 className='vdtLabel'>{
                                    props.selectedObjective === "Financial / Non-Financial Objective"
                                        ? "Category *" : "Financial / Non-Financial Objective *"
                                }</h6>

                                <div className="input-field-wrap">
                                    <select className='textboxStyle'
                                        disabled={props.loader}
                                        value={selectedFoBoCategory ? selectedFoBoCategory.objCatName : ""}
                                        tabIndex="1"
                                        maxLength="100"
                                        id='selectedObjectiveCategory'
                                        onChange={onFoBoCategoryChange}
                                    >
                                        <option value="" defaultValue disabled>Select {
                                            props.selectedObjective === "Financial / Non-Financial Objective"
                                                ? "Category" : "Objective"
                                        }</option>
                                        {
                                            selectedFoBoType && selectedFoBoType.objCategories && selectedFoBoType.objCategories.length > 0 && selectedFoBoType.objCategories.map((category) =>
                                                <option style={{ color: "#fff" }} key={category.objCatId} value={category.objCatName}>{category.objCatLabel}</option>)
                                        }
                                    </select><br />
                                </div>
                            </div>
                            {
                                selectedFoBoCategory.objCatName === "CUSTOM" &&
                                <div className="field-wrap">
                                    <h6 className='vdtLabel'>Custom Objective *</h6>
                                    <div className="input-field-wrap">
                                        <input type="text" className='textboxStyle'
                                            disabled={props.loader}
                                            tabIndex="1"
                                            maxLength="100"
                                            id='customCategory'
                                            value={customCategoryText}
                                            onChange={onCustomCategoryTextChange}
                                            onKeyDown={(e) => { handleKeyDown(e, 'save') }}
                                        />
                                    </div>
                                </div>

                            }
                            {
                                props.selectedObjective === "Business Objective" &&
                                <div className="field-wrap">
                                    <h6 className='vdtLabel'>Category *</h6>
                                    <div className="input-field-wrap">
                                        <select className='textboxStyle'
                                            disabled={props.loader}
                                            value={selectedFoBoSubCategory ? selectedFoBoSubCategory.objSubCatName : ""}
                                            tabIndex="1"
                                            maxLength="100"
                                            id='selectedObjectiveSubCategory'
                                            onChange={onFoBoSubCategoryChange}
                                        >
                                            <option value="" defaultValue disabled>Select Category</option>
                                            {
                                                selectedFoBoCategory && selectedFoBoCategory.objectiveSubCategories && selectedFoBoCategory.objectiveSubCategories.length > 0 && selectedFoBoCategory.objectiveSubCategories.map((category) =>
                                                    <option style={{ color: "#fff" }} key={category.objSubCatId} value={category.objSubCatName}>{category.objSubCatLabel}</option>)
                                            }
                                        </select><br />
                                    </div>
                                </div>
                            }
                            {
                                selectedFoBoSubCategory.objSubCatName === "CUSTOM" &&
                                <div className="field-wrap">
                                    <h6 className='vdtLabel'>Custom Category *</h6>
                                    <div className="input-field-wrap">
                                        <input type="text" className='textboxStyle'
                                            disabled={props.loader}
                                            tabIndex="1"
                                            maxLength="100"
                                            value={customSubCategoryText}
                                            id='customSubObjective'
                                            onChange={onCustomSubCategoryTextChange}
                                            onKeyDown={(e) => { handleKeyDown(e, 'save') }}
                                        />
                                    </div>
                                </div>

                            }
                        </Fragment>}

                    {(props.selectedObjective === 'KPI') ?
                        <Fragment>
                            <div className="row marginNone">
                                <div className="col-sm-6 paddingNone">
                                    <div className="field-wrap">
                                        <h6 className='vdtLabel'>KPI Trend *</h6>
                                        <div className="input-field-wrap">
                                            <select
                                                className='selectVDT'
                                                style={{
                                                    color: (props.kpiTrend === "" ? "#ffffff80" : "#ffffff")
                                                }}
                                                value={props.kpiTrend}
                                                id='KPI Trend'
                                                tabIndex="1"
                                                disabled={props.loader}
                                                onChange={(event) => props.onObjectiveValueChange(event)} >
                                                <option value="" defaultValue disabled> Select Trend</option>
                                                <option style={{ color: "#fff" }} value="Increase">Increase</option>
                                                <option style={{ color: "#fff" }} value="Decrease">Decrease</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>

                                <div className="col-sm-6 paddingNone">
                                    <div className="field-wrap">
                                        <h6 className='vdtLabel'>KPI Unit *</h6>
                                        <div className="input-field-wrap">
                                            <select className='selectVDT'
                                                style={{
                                                    color: (props.kpiUnit === "" ? "#ffffff80" : "#ffffff")
                                                }}
                                                value={props.kpiUnit}
                                                disabled={props.loader}
                                                tabIndex="1"
                                                id='KPI Unit'
                                                onChange={(event) => props.onObjectiveValueChange(event)}>
                                                <option value="" defaultValue disabled> Select Unit </option>
                                                <option style={{ color: "#fff" }} value="#/$" defaultValue>#/$</option>
                                                <option style={{ color: "#fff" }} value="%">%</option>
                                                <option style={{ color: "#fff" }} value="#">#</option>
                                                <option style={{ color: "#fff" }} value="$">$</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="field-wrap">
                                <h6 className='vdtLabel'> Target Calculation *</h6>
                                <div className="input-field-wrap">
                                    <select className='selectVDT'
                                        style={{
                                            width: "40%",
                                            color: (props.calculationType === "" ? "#ffffff80" : "#ffffff")
                                        }}
                                        size={1}
                                        value={props.calculationType}
                                        id='Calculation Type'
                                        tabIndex="1"
                                        disabled={props.loader}
                                        onChange={(event) => props.onObjectiveValueChange(event)}>
                                        <option value="" defaultValue disabled>  Select Target Calculation </option>
                                        <option style={{ color: "#fff" }} value="Absolute Value">Absolute Value</option>
                                        <option style={{ color: "#fff" }} value="Relative Improvement">Relative Improvement</option>
                                        <option style={{ color: "#fff" }} value="Absolute Improvement">Absolute Improvement</option>
                                    </select>
                                </div>
                            </div>

                            <div className="field-wrap">
                                <h6 className='vdtLabel'>KPI Formula *</h6>
                                <div className="input-field-wrap">
                                    <textarea type="text" className='inputVDT'
                                        value={props.kpiFormula}
                                        disabled={props.loader}
                                        tabIndex="1"
                                        maxLength="1999"
                                        id='KPI Formula'
                                        style={{ resize: 'none' }}
                                        onChange={(event) => props.onObjectiveValueChange(event)}
                                    />
                                    <br />
                                    <span style={{ color: '#ffffff' }}><small>{props.kpiFormulaError}</small></span>
                                </div>
                            </div>

                            <div className="field-wrap" style={{ height: "110px" }}>
                                <h6 className='vdtLabel'>KPI Description *</h6>
                                <div className="input-field-wrap">
                                    <textarea type="text" className='inputVDTTextArea'
                                        value={props.kpiDescription}
                                        disabled={props.loader}
                                        tabIndex="1"
                                        maxLength="249"
                                        style={{ resize: 'none' }}
                                        id='KPI Description'
                                        onChange={(event) => props.onObjectiveValueChange(event)}
                                    />
                                    <br />
                                    <span style={{ color: '#ffffff' }}><small>{props.kpiDescriptionError}</small></span>
                                </div>
                            </div>

                        </Fragment>
                        : ""}
                </div>

                {(props.selectedObjective === 'KPI') ?
                    <Fragment>

                        <div className="col-sm-7 paddingNone">

                            <div className="field-wrap">
                                <h6 className='vdtLabel'>KPI Type *</h6>
                                <select
                                    className='selectVDT'
                                    style={{
                                        width: "42%",
                                        color: (props.kpiType === "" ? "#ffffff80" : "#ffffff")
                                    }}
                                    value={props.kpiType}
                                    id='KPI Type'
                                    tabIndex="1"
                                    disabled={props.loader}
                                    onChange={props.onObjectiveValueChange} >
                                    <option value="" defaultValue disabled> Select KPI Type </option>
                                    <option style={{ color: "#fff" }} value="FINANCIAL">Financial</option>
                                    <option style={{ color: "#fff" }} value="NON_FINANCIAL">Non-Financial</option>
                                </select>

                            </div>
                            <div className="row marginNone">

                                <div className="field-wrap" style={{
                                    width: "42%",
                                    height: "40px"
                                }}>
                                    <h6 className='vdtLabel'>Industry *</h6>
                                    <MultiSelect
                                        options={props.industryList}
                                        value={props.selectedIndustryValue}
                                        onChange={setIndustrySelected}
                                        labelledBy="Select"
                                        disableSearch={true}
                                        id="Industry List"
                                        valueRenderer={customIndustryValueRenderer}
                                        ClearSelectedIcon

                                    />
                                </div>

                            </div>
                            <div className="field-wrap" style={{
                                width: "42%",
                                height: "40px",
                                marginTop: "22px"
                            }}>
                                <h6 className='vdtLabel'>Business Functions *</h6>
                                <MultiSelect
                                    options={props.businessList}
                                    value={props.selectedBusinessValue}
                                    onChange={setBusinessSelected}
                                    labelledBy="Select"
                                    disableSearch={true}
                                    id="Business List"
                                    valueRenderer={customBuisnessValueRenderer}
                                    ClearSelectedIcon

                                />

                            </div>
                        </div>
                    </Fragment>
                    : ""}
            </div>

            <div className='buttondiv cr-de-btn-div' >
               {props.isSaveloading?
                 <button alt="save Objectives"
                 className="btn btn-primary"
                
                 disabled
             > Saving
             <i className="fa fa-spinner fa-spin" style={{ color: '#ffffff',marginLeft:"8px" }}></i>
            </button>
               :
               <button alt="save Objectives"
               style={{ cursor: props.loader ? 'wait' : 'pointer' }}
               className="btn btn-primary"
               onClick={onSave}
               onKeyDown={(e) => { handleKeyDown(e, 'save') }}
               disabled={getSaveDisabledState()}
           >Save</button>
               }
              
            </div>

        </div>
    );
}

export default AddVDTElement;