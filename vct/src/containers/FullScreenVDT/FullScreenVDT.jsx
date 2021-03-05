import React, { Component } from 'react';
import './FullScreenVDT.css';
import ReactTooltip from 'react-tooltip';
import ReviewValueDriverTreeHeader from '../../components/ReviewValueDriverTreeHeader/ReviewValueDriverTreeHeader';
import { observer, inject } from "mobx-react";
import Modal from 'react-bootstrap4-modal';
import closeIcon from '../../assets/project/fvdt/modal-close-icon.svg';
import VDTBranch from '../../components/vdt/VDTBranch';
import { toJS } from "mobx";
import ReactToPdf from "react-to-pdf";
import html2canvas from 'html2canvas';
import jsPDF from "jspdf";
var SessionStorage = require('store/storages/sessionStorage');

@inject("reviewValueDriverStore")
@inject("projectOverviewDashboardStore")
@observer
class FullScreenVDT extends Component {
    constructor(props) {
        super(props);
        this.state = {
            visible: true
        }
    }
    onDownloadClick() {
        document.documentElement.scrollTop = 20;
        let input = document.getElementById('fullPrint');
        html2canvas(input, {
            scale: 1
        }).then(canvas => {

            /* const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF();
            pdf.addImage(imgData, 'JPEG', 0, 0);
            let fileName = 'VDT_Tree';
            pdf.save(fileName + ".pdf"); */
            var imgData = canvas.toDataURL('image/png');
            var imgWidth = 210; 
            var pageHeight = 295;  
            var imgHeight = canvas.height * imgWidth / canvas.width;
            var heightLeft = imgHeight;
            var doc = new jsPDF('p', 'mm');
            var position = 20; // give some top padding to first page

            doc.addImage(imgData, 'JPEG', position, position, imgWidth, imgHeight+17);
            heightLeft -= pageHeight;

            while (heightLeft >= 0) {
            position += heightLeft - imgHeight; // top padding for other pages
            doc.addPage();
            doc.addImage(imgData, 'JPEG', 20, position + 15, imgWidth, imgHeight);
            heightLeft -= pageHeight;
            }
            if( SessionStorage.read('projectName') !== null &&  SessionStorage.read('projectName') !== undefined){
                doc.save(  SessionStorage.read('projectName')+'.pdf');
            }else{
                doc.save('ValueDriverTree.pdf');
            }
            
        });

    }

    modalCloseHandler = () => {
        this.props.fullScreenCloseHandler()
    }

    // createPdf = (html) => Doc.createPdf(html);
    render() {
        const { reviewValueDriverStore } = this.props;
        const pname = SessionStorage.read('projectName');
        const demoUser = SessionStorage.read('demoUser');
        const option = SessionStorage.read('option_selected')
        const {
            branchTree,
            dataTree,
            color,
            kpiId, operationalKpIs
        } = reviewValueDriverStore
        /*const getTooltipData = (description, formula, kpiType) => {
            return `${description} <br /> KPI Formula: ${formula} <br/> KPI Type: ${kpiType}`;
        }*/
        const ref = React.createRef();


        return (
            < >
                <Modal className="fullScreenVDT" id={operationalKpIs.length <= 15 ? "mypdftest" : operationalKpIs.length <= 25 ? "mypdftest1" : operationalKpIs.length <= 35 ? "mypdftest2" : "mypdftest3"} visible={this.props.displayFullScreen} >
                    <div className={operationalKpIs.length <= 15 ? " modal1" : operationalKpIs.length <= 25 ? " modal2" : operationalKpIs.length <= 35 ? " modal3" : " modal4"}>
                        {/* <div className="modal-header"> */}
                        {/* <h5 className="modal-title"></h5> */}
                        <div id="button_row" className="row">

                            {/* <ReactToPdf  targetRef={ref} filename={JSON.parse(demoUser) === true ? (option === 'sales' ? 'Demo Opportunity' : 'Demo Project') : pname} scale={1}>
                      {({toPdf}) => (
                       <button id="generatepdf" className="btn btn-primary float-right" style={{ marginLeft: '78%', marginTop: '1.5%' }} onClick={toPdf}>Generate PDF</button>
                        )}
                       </ReactToPdf> */}



                            <button id="generatepdf" className="btn btn-primary float-right" style={{ marginLeft: '560px', marginTop: '1.5%', marginRight:'18px' }} onClick={this.onDownloadClick}>Generate PDF</button>
                            <img id="closepdf" src={closeIcon} alt="" style={{ marginLeft: '1%', marginTop: '1%', cursor: 'pointer' }} data-dismiss="modal" aria-label="Close" onClick={this.modalCloseHandler}

                                data-tip
                                data-for="fullScreen-close-tooltip"
                                data-place="bottom" />
                            <ReactTooltip id="fullScreen-close-tooltip" className="tooltip-class">
                                <span>Close</span>
                            </ReactTooltip>
                        </div>
                        <div id="fullPrint" className="full-rvdt-header" media="print" rel="stylesheet" href="./FullScreenVDT.css" style={{
                            marginLeft: '54px',
                            marginRight: 'auto'
                        }} ref={ref}>
                            {/* ref={ref}> */}
                            <div className=" rvdt-header align-self-center" style={{ width: "615px" }} >
                                <ReviewValueDriverTreeHeader isBusinessCase={true} fullScreen={true} />
                            </div>
                            {
                                branchTree.length > 0 ?
                                    (
                                        <div id="fullScreenVDT" className="vdt-tree-wrapper" style={{ marginLeft: '14px' }}>
                                            <VDTBranch onKpiClick={this.props.onKpiClick} level={1} branchTree={toJS(dataTree)}

                                                vdtValues={this.props.projectOverviewDashboardStore.vdtValues} editNode={this.state.editNode} onSetName={(t, n) => this.onSetName(t, n)}
                                            ></VDTBranch>
                                             <div id="empty" style={{height: "50px"}}>
                                        </div>
                                        </div>  
                                                                            
                                    )

                                    :
                                    <div className="row justify-content-center" style={{ height: '50px' }}>
                                        <h4> <i className="fa fa-exclamation-triangle"></i> No data to load</h4>
                                    </div>
                            }
                        </div>
                        {/* </PdfContainer> */}
                    </div>
                </Modal>
            </>
        )
    }
}
export default FullScreenVDT;
