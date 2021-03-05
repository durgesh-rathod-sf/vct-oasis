import React from 'react';
import fullscreenImg from "../../../assets/project/fvdt/expand.svg";
import saveIco from "../../../assets/project/fvdt/save.svg";
import editIco from "../../../assets/project/fvdt/tree.svg";
import downloadIco from "../../../assets/project/fvdt/download.svg";
import uploadIco from "../../../assets/project/fvdt/upload.svg";
import closeIco from "../../../assets/project/fvdt/close-vdt.svg";
import treeIco from "../../../assets/project/fvdt/tree.svg";
import exportIco from "../../../assets/project/fvdt/export.svg";
import ReactTooltip from 'react-tooltip';
import undoImg from "../../../assets/project/fvdt/undo.svg";
import redoImg from "../../../assets/project/fvdt/redo.svg";
import finmodeImg from "../../../assets/project/fvdt/finMode.svg";
import nonfinmodeImg from "../../../assets/project/fvdt/nonFinMode.svg";
import allmodeImg from "../../../assets/project/fvdt/allMode.svg";

import "./IconStack.css";
var SessionStorage = require('store/storages/sessionStorage');

const IconStack = (props) => {
    let isDemo = SessionStorage.read("demoUser") === "true" ? true : false;
    const noClickDone = () => {
        return false;
    }
    return (
        <div className="icon-stack-body-div" style={{ display: "inline-flex" }} >
            <div className={(!props.isVdtSaved) || props.isGenerateVDTBtnClicked  ? "iconDisableCircle" : "iconCircle"}
                onClick={(props.isCVDT || (!props.isVdtSaved)|| props.isGenerateVDTBtnClicked ) ? () => { } : props.exportHandler}
            >
                <img src={exportIco} alt="export vdt" className="export-img" data-tip="" data-for="export_vdt"
                    style={{ opacity: ((props.isCVDT || (!props.isVdtSaved)|| props.isGenerateVDTBtnClicked ) ? "0.5" : "unset") }} />
                <ReactTooltip id="export_vdt" className="tooltip-class">
                    <span>Export Value Driver Tree</span>
                </ReactTooltip>
            </div>
            <div className={(!props.isVdtSaved) ? "iconDisableCircle" : "iconCircle"}
                onClick={(!props.loadingVDTMode ? () => { } :props.mode )}
            >
                <img src={props.selectedMode=="ALL" ? allmodeImg : props.selectedMode=="FINANCIAL" ? finmodeImg : nonfinmodeImg} alt="vdt mode" className="" data-tip="" data-for="toggle_fin"
                    style={{ opacity: ((props.loadingVDTMode) ? "unset" : "0.5"),cursor:(props.loadingVDTMode)?"pointer":"default" }} />
                <ReactTooltip id="toggle_fin" className="tooltip-class">
                    <span>{props.selectedMode=="ALL" ? "Display Financial and Non-Financial Objective" : props.selectedMode=="FINANCIAL" ? "Display Financial Objective" : "Display Non-Financial Objective"}</span>
                </ReactTooltip>
            </div>

            <div
                className={ (!props.isVdtSaved) || props.isGenerateVDTBtnClicked  ? "iconDisableCircle cloud-icon" : "iconCircle cloud-icon"} 
                onClick={(props.isCVDT || (!props.isVdtSaved) || props.isGenerateVDTBtnClicked ||props.isDownloadLoading) ? () => { } : props.downloadBaseline}>
                <img src={downloadIco} alt="Download" className="download-img" data-tip="" data-for="kpi_base"
                    style={{ opacity: ((props.isCVDT || (!props.isVdtSaved) || props.isGenerateVDTBtnClicked ||props.isDownloadLoading) ? "0.5" : "unset") }} />
               
               {props.isDownloadLoading ? 
                 <i className="fa fa-spinner fa-spin" style={{ color: '#ffffff',position:"absolute",margin:"5px 0px 0px -22px" ,cursor:"default"}}></i>
           :"" }  
                <ReactTooltip id="kpi_base" className="tooltip-class">
                    <span>KPI Baseline Template</span>
                </ReactTooltip>
            </div>

            <label htmlFor="file" style={{ marginBottom: 0 }}>
                {/* Replaced 'for' with 'htmlFor' as a valid DOM property */}
                <div className={(props.isCVDT || isDemo || (!props.isVdtSaved) || props.isGenerateVDTBtnClicked || SessionStorage.read("isMaster") === "Y" || (SessionStorage.read("accessType") === "Read")) ? "iconDisableCircle cloud-icon" : "iconCircle cloud-icon"}
                >
                    <img src={uploadIco} alt="upload" className="upload-img"
                        data-tip="" data-for="ingest-base"
                        style={{
                            cursor: ((SessionStorage.read("isMaster") === "Y") || (SessionStorage.read("accessType") === "Read")) ? "not-allowed" : (props.isCVDT || !props.isVdtSaved || props.isGenerateVDTBtnClicked ? "default" : "pointer"),
                            opacity: ((props.isCVDT || isDemo || (!props.isVdtSaved) || props.isGenerateVDTBtnClicked || SessionStorage.read("isMaster") === "Y" || (SessionStorage.read("accessType") === "Read")) ? "0.5" : "unset")
                        }} />
                    <ReactTooltip id="ingest-base" className="tooltip-class">
                        <span>Ingest Baseline Data</span>
                    </ReactTooltip>

                </div>
            </label>
            {(props.isCVDT || !props.isVdtSaved || props.isGenerateVDTBtnClicked || isDemo  || (SessionStorage.read("isMaster") === "Y") || (SessionStorage.read("accessType") === "Read")) ? "" :
                <input type="file" style={{ height: "32px", opacity: "0", position: "absolute", zIndex: "-1" }} name="file" id="file" onChange={props.onIngestBaseline} />
            }

            <div
                // onClick={(isDemo || props.isCvdtEmpty || SessionStorage.read("isMaster") === "Y" || (SessionStorage.read("accessType") === "Read")) ? noClickDone: (props.isloading ? () => {}:props.saveVDTHandler)}
                className={(isDemo || props.isCvdtEmpty || SessionStorage.read("isMaster") === "Y" || (SessionStorage.read("accessType") === "Read")) ? "iconDisableCircle" : "iconCircle"}
            >
                <img src={saveIco} alt="Save" className="save-img"
                    data-tip="" data-for="save_tooltip"
                    style={{
                        cursor: (SessionStorage.read("isMaster") === "Y" || (SessionStorage.read("accessType") === "Read")) ? "not-allowed" :(props.isloading?"default": "pointer"),
                        opacity: ((isDemo || props.isCvdtEmpty || SessionStorage.read("isMaster") === "Y" || (SessionStorage.read("accessType") === "Read")) ? "0.5" : (props.isloading?"0.2":"unset"))
                    }}
                    onClick={(isDemo || props.isCvdtEmpty || SessionStorage.read("isMaster") === "Y" || (SessionStorage.read("accessType") === "Read")) ? noClickDone : (props.isloading ? () => { } : props.saveVDTHandler)}
                />
                {props.isloading ? 
                 <i className="fa fa-spinner fa-spin" style={{ color: '#ffffff',position:"absolute",margin:"5px 0px 0px -20px" ,cursor:"default"}}></i>
                :"" }
                <ReactTooltip id="save_tooltip" className="tooltip-class">
                    <span>Save</span>
                </ReactTooltip>
            </div>

            <div className={props.isCVDT || props.isGenerateVDTBtnClicked || SessionStorage.read("isMaster") === "Y" ? "iconDisableCircle" : "iconCircle"} onClick={(isDemo || props.isGenerateVDTBtnClicked  || SessionStorage.read("isMaster") === "Y" || (SessionStorage.read("accessType") === "Read")) ? noClickDone : props.undo}
            ><img src={undoImg} alt="fullScreen" className="expand-img"
                data-tip="" data-for="undo_tooltip" data-place="left"
                style={{ opacity: (props.isCVDT || props.isGenerateVDTBtnClicked  || isDemo || SessionStorage.read("isMaster") === "Y" ? "0.5" : "unset"),
                cursor: (props.isCVDT || isDemo || SessionStorage.read("isMaster") === "Y") ? "not-allowed" : props.isGenerateVDTBtnClicked ? "default" : "pointer"}} />
                <ReactTooltip id="undo_tooltip" className="tooltip-class">
                    <span>Undo</span>
                </ReactTooltip>
            </div>

            <div className={props.isCVDT || props.isGenerateVDTBtnClicked || SessionStorage.read("isMaster") === "Y" ? "iconDisableCircle" : "iconCircle"} onClick={(isDemo || props.isGenerateVDTBtnClicked || SessionStorage.read("isMaster") === "Y" || (SessionStorage.read("accessType") === "Read")) ? noClickDone : props.redo}
            >
                <img src={redoImg} alt="fullScreen" className="expand-img"
                    data-tip="" data-for="redo_tooltip" data-place="left"
                    style={{ opacity: (props.isCVDT || props.isGenerateVDTBtnClicked || isDemo || SessionStorage.read("isMaster") === "Y" ? "0.5" : "unset"),
                    cursor: (props.isCVDT || isDemo || SessionStorage.read("isMaster") === "Y") ? "not-allowed" : props.isGenerateVDTBtnClicked ? "default" : "pointer"}} />
                <ReactTooltip id="redo_tooltip" className="tooltip-class">
                    <span>Redo</span>
                </ReactTooltip>
            </div>
            <div className={props.isCVDT ? "iconDisableCircle" : "iconCircle"} onClick={props.isCVDT ? "" : props.viewFullScreenVDT}
            >
                <img src={fullscreenImg} alt="fullScreen" className="expand-img"
                    data-tip="" data-for="full_screen_tooltip" data-place="left"
                    style={{ opacity: (props.isCVDT ? "0.5" : "unset") }} />
                <ReactTooltip id="full_screen_tooltip" className="tooltip-class">
                    <span>View VDT in full screen</span>
                </ReactTooltip>
            </div>

            <div
                className={(SessionStorage.read("isMaster") === "Y" || (SessionStorage.read("accessType") === "Read")) ? "iconDisableCircle" : "iconCircle"}
                id="visualVDT"
            // onClick={SessionStorage.read("isMaster") === "Y" || (SessionStorage.read("accessType") === "Read")?noClickDone:(props.isCVDT ? props.vdtBtnHandler :() => props.deleteVDT())}
            >
                <img src={closeIco} alt="close" id="visualVDT" className="close-img"
                    data-tip="" data-for="cancel_tooltip"
                    style={{
                        cursor: (SessionStorage.read("isMaster") === "Y" || (SessionStorage.read("accessType") === "Read")) ? "not-allowed" : "pointer",
                        opacity: (SessionStorage.read("isMaster") === "Y" || (SessionStorage.read("accessType") === "Read")) ? "0.5" : "unset"
                    }}
                    onClick={SessionStorage.read("isMaster") === "Y" || (SessionStorage.read("accessType") === "Read") ? noClickDone : (props.isCVDT ? props.vdtBtnHandler : () => props.deleteVDT())} />
                <ReactTooltip id="cancel_tooltip" className="tooltip-class">
                    <span>Cancel</span>
                </ReactTooltip>
            </div>

        </div>
    )
}
export default IconStack;