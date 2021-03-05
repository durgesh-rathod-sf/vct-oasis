import React, { Component, createRef } from 'react';
import { observer, inject } from 'mobx-react';
import { withRouter } from "react-router-dom";
import { toast } from 'react-toastify';
import ValueDriverTree from '../../components/ValueDriverTree/ValueDriverTree';
import ReviewValueDriverTreeHeader from '../../components/ReviewValueDriverTreeHeader/ReviewValueDriverTreeHeader';
import ExportModal from '../../components/ExportModal/ExportModal';
import NotificationMessage from '../../components/NotificationMessage/NotificationMessage';
import './VisualVDT.css';
import FullScreenVDT from '../FullScreenVDT/FullScreenVDT';
import html2canvas from 'html2canvas';
import IconStack from '../ValueDrivers/IconStack/IconStack';
import ValueDriverTreeNew from '../../components/ValueDriverTree/ValueDriverTreeNew';
var SessionStorage = require('store/storages/sessionStorage');
@inject('reviewValueDriverStore', 'valueDriversStore', 'setKpiTargetStore', 'editVDTStore')
@observer
class VisualVDT extends Component {
  constructor(props) {
    super(props);
    this.state = {
      valueRender: false,
      visible: false,
      frequencyErrorFlag: false,
      businessFrequency: false,
      kpiCollectionTemplateBtn: false,
      operationalFrequencyCnt: 0,
      noFrequencies: true,
      defaultResponse: [],
      defaultBusinessKpi: [],
      defaultOperationalKpi: [],
      overflowValue: 'auto',
      displayFullScreen: false,
      refresh: false,
      loadingVDTchange: true,
      saveLoading:false,
    };
    this.redirectHandler = this.redirectHandler.bind(this);
    this.exportHandler = this.exportHandler.bind(this);
    this.modalCloseHandler = this.modalCloseHandler.bind(this);
    this.generateXlsHandler = this.generateXlsHandler.bind(this);
    this.generatePPTHandler = this.generatePPTHandler.bind(this);
    this.generateKPITemplate = this.generateKPITemplate.bind(this);
    this.saveKPIFrequency = this.saveKPIFrequency.bind(this);
    this.setBusinessFrequency = this.setBusinessFrequency.bind(this);
    this.frequencyChangeHandler = this.frequencyChangeHandler.bind(this);
    this.viewFullScreenVDT = this.viewFullScreenVDT.bind(this);
    this.fullScreenCloseHandler = this.fullScreenCloseHandler.bind(this);
    this.scrollHandler = this.scrollHandler.bind(this);
    this.vdtModeChange = this.vdtModeChange.bind(this);
    this.myRef = createRef();
    this.saveVDT = this.saveVDT.bind(this);
  }
  // componentDidUpdate(prevProps){
  //  const {branchTree} = this.props.reviewValueDriverStore;
  //   if(prevProps.reviewValueDriverStore.branchTree !== this.props.reviewValueDriverStore.branchTree){
  //     this.state({
  //       branch : this.props.reviewValueDriverStore.branchTree
  //     })
  //   }
  // }

  viewFullScreenVDT() {
    this.setState({
      displayFullScreen: true,
    });
  }

  async vdtModeChange() {
    //const { reviewValueDriverStore } = this.props;
    //reviewValueDriverStore.selectMode();
    let checkMsg = this.props.showMessage();
    if (checkMsg) {
      const { reviewValueDriverStore } = this.props;
      const vdtRespose = await reviewValueDriverStore.selectMode();
      this.setState({
        loadingVDTchange: false,
      });
    }
  }

  fullScreenCloseHandler() {
    this.setState({
      displayFullScreen: false,
    });
  }

  redirectHandler(type) {
    const { history } = this.props;
    switch (type) {
      case 'home':
        history.push('/home');
        break;
      // case 'projectMenu':
      //     history.push('/deal');
      //     break;
      case 'myproject':
        history.push('/my-deals');
        break;
      default:
        console.log("");
        break
    }
  }

  setBusinessFrequency = (event) => {
    const bFrequency = event.target.value;
    this.setState({
      businessFrequency: bFrequency
    })
  }

  saveKPIFrequency = (event) => {
    const select = document.querySelectorAll('.frequency')
    const { businessFrequency, defaultBusinessKpi, defaultOperationalKpi } = this.state
    let frequencySet = [];
    for (let i = 0; i < select.length; ++i) {
      if (select[i].value !== 'false') {
        const frequeny = {
          txnId: select[i].id,
          frequency: select[i].value
        }
        frequencySet.push(frequeny)
      }
    }
    if (!businessFrequency) {
      this.showSuccessNotification('selectBFrequencyError')
    }
    if (frequencySet.length > 0 && businessFrequency) {
      const { reviewValueDriverStore } = this.props;
      this.checkIfFrequenciesChanged(defaultBusinessKpi, businessFrequency, "Business");
      this.checkIfFrequenciesChanged(defaultOperationalKpi, frequencySet, "Operational");
      reviewValueDriverStore.setKpiFrequency(frequencySet, businessFrequency)
        .then((response) => {
          if (response) {
            this.getFrequencies();
            this.showSuccessNotification('saveFrequency');
            this.setState({
              kpiCollectionTemplateBtn: true,
            });
          } else {
            this.showSuccessNotification('saveFrequencyFailure')
          }
        })
    } else {
      this.showSuccessNotification('selectFrequencyError')
    }
  }

  checkIfFrequenciesChanged(defaultKpi, updatedKpi, type) {
    let businessCount = 0;
    const { reviewValueDriverStore } = this.props;
    if (type === "Business") {
      for (let kpiObj of defaultKpi) {
        if (kpiObj.kpiFrequency && kpiObj.kpiFrequency !== updatedKpi && businessCount === 0) {
          if (!window.confirm('Changing frequency will lead to loss of existing Target Values. Please confirm')) {
            this.setState({
              businessFrequency: kpiObj.kpiFrequency
            });
          }
          businessCount++;
        }
      }
      businessCount = 0;
    }
    else {
      for (let kpiObj of defaultKpi) {
        for (let freqObj of updatedKpi) {
          if (kpiObj.txnId === Number(freqObj.txnId)) {
            freqObj['kpiId'] = Number(freqObj.txnId);
            if (kpiObj.kpiFrequency && kpiObj.kpiFrequency !== freqObj.frequency) {
              if (!window.confirm('Changing frequency will lead to loss of existing Target Values. Please confirm')) {
                freqObj.frequency = kpiObj.kpiFrequency;
              }
            }
          }
        }
      }
      reviewValueDriverStore.operationKpiIds = [...updatedKpi];
    }
  }
  exportHandler = (event) => {
    this.setState({
      visible: true,
    })
  }

  modalCloseHandler = () => {
    this.setState({
      visible: false,
    })
  }

  generateXlsHandler = (event) => {
    const { valueDriversStore } = this.props;
    valueDriversStore.generateXls();
  }

  generatePPTHandler = (event) => {
    const { valueDriversStore } = this.props;
    valueDriversStore.generatePPT();
    this.setState({
      overflowValue: 'visible'
    }, () => {
      // this.savePPT();
    })
  }

  savePPT() {
    const PptxGenJS = require('pptxgenjs');
    html2canvas(document.body, { scale: 2, y: -100 }).then((canvas) => {
      const imgData = canvas.toDataURL('image/png');
      var pptx = new PptxGenJS();
      var slide = pptx.addNewSlide();
      slide.addImage({ data: `'${imgData}'`, sizing: { type: 'cover', w: 13.5, h: 8 } });
      pptx.save('samplePPT');
      this.modalCloseHandler();
      this.setState({
        overflowValue: 'auto'
      })
    });
  }

  generateKPITemplate = (event) => {
    const { reviewValueDriverStore } = this.props;
    reviewValueDriverStore.generateKPITemplate()
  }

  showSuccessNotification(type) {
    // eslint-disable-next-line default-case
    switch (type) {
      case 'saveFrequency':
        toast.info(<NotificationMessage
          title="Success"
          bodytext={'Successfully uploaded frequencies for KPI'}
          icon="success"
        />, {
          position: toast.POSITION.BOTTOM_RIGHT
        });
        break;
      case 'treeFetchError':
        toast.error(<NotificationMessage
          title="Error"
          bodytext={"One or More KPI's are not having relevant Business/Operational KPI's"}
          icon="error"
        />, {
          position: toast.POSITION.BOTTOM_RIGHT
        });
        break;
      case 'selectFrequencyError':
        toast.error(<NotificationMessage
          title="Error"
          bodytext={'Please select frequency for Operational KPIs'}
          icon="error"
        />, {
          position: toast.POSITION.BOTTOM_RIGHT
        });
        break;
      case 'selectBFrequencyError':
        toast.error(<NotificationMessage
          title="Error"
          bodytext={'Please select frequencies for Business KPIs'}
          icon="error"
        />, {
          position: toast.POSITION.BOTTOM_RIGHT
        });
        break;

      case 'saveFrequencyFailure':
        toast.error(<NotificationMessage
          title="Error"
          bodytext={'Sorry! Frequencies not saved'}
          icon="error"
        />, {
          position: toast.POSITION.BOTTOM_RIGHT
        });
    }

  }

  showErrorNotification(text) {
    toast.error(<NotificationMessage
      title="Error"
      bodytext={text}
      icon="error"
    />, {
      position: toast.POSITION.BOTTOM_RIGHT
    });
  }

  frequencyChangeHandler = (event) => {
    const kpiId = event.target.id
    const frequency = event.target.value
    const { reviewValueDriverStore } = this.props;
    const { operationKpiIds } = reviewValueDriverStore;
    for (let i = 0; i < operationKpiIds.length; i++) {
      if (Number(operationKpiIds[i].kpiId) === Number(kpiId)) {
        operationKpiIds[i].frequency = frequency;
      }
    }
    let { operationalFrequencyCnt } = this.state;
    this.setState({
      operationalFrequencyCnt: operationalFrequencyCnt + 1,
    });
  };

  scrollHandler = () => {
    const scrollY = window.scrollY; //Don't get confused by what's scrolling - It's not the window
    const scrollTop = this.myRef.current.scrollTop;
    console.log(`onScroll, window.scrollY: ${scrollY} myRef.scrollTop: ${scrollTop}`);
  };
  isVDTEdited() {
    const { branchTree } = this.props.reviewValueDriverStore;
    let soListValues = Object.keys(branchTree[0]);
    let foList = [];
    let boList = [];
    let vdList = [];
    let kpiList = [];
    Object.values(branchTree[0])[0].map((foObj) => {
      foList.push(foObj);
      Object.values(foObj)[0].map((boObj) => {
        boList.push(boObj);
        Object.values(boObj)[0].map((vdObj) => {
          vdList.push(vdObj);
          Object.values(vdObj)[0].map((kpiObj) => {
            kpiList.push(kpiObj);
          })
        })
      })

    })

    if (foList.length > 0 || boList.length > 0 || vdList.length > 0 || kpiList.length > 0 || soListValues[0] !== "") {
      return true
    }
    else {
      return false;
    }

  }
  refresh = (e) => {
    this.setState({
      refresh: true
    })
  }

  async saveVDT() {
    const { reviewValueDriverStore, isGenerateVDTBtnClicked } = this.props;
    this.props.setLoaderToTrue(true)
    let vdtStatus = await reviewValueDriverStore.saveTree();
    if(vdtStatus!== undefined){
      this.props.setLoaderToTrue(false)
    }
    if (isGenerateVDTBtnClicked) {
      this.props.saveVDT(vdtStatus === false ? true : false);
    }
  }

  render() {
    // let option = localStorage.getItem('option_selected')
    const { reviewValueDriverStore } = this.props;
    const { overflowValue } = this.state
    const isMaster = SessionStorage.read("isMaster");
    const {
      strategicObjectives,
      branchTree,
      dataTree,
      operationKpiIds,
      operationalKpIs, showVdtLoading,
      resultEmptyCheck
    } = reviewValueDriverStore;
    return (
      branchTree.length > 0 ?

        <div id='VisualVDT' ref={this.myRef} onScroll={this.scrollHandler} style={{ width: '100%' }} >
          <div className="row icon-stack-wrapper-row" data-html2canvas-ignore={true} >
            <div className="col-sm-8">

            </div>
          {(SessionStorage.read("userType") ==="EU" && SessionStorage.read("accessType") === "Read" && Object.keys(resultEmptyCheck && resultEmptyCheck.resultObj).length === 0) ? <div></div>:< div className="col-sm-4" style={{ textAlignLast: "end" }} >
              <IconStack
                isGenerateVDTBtnClicked={this.props.isGenerateVDTBtnClicked}
                isCVDT={false}
                isCvdtEmpty={false}
                isVDTEdited={this.isVDTEdited()}
                isloading=
                // {reviewValueDriverStore.isLoading}
                {this.props.isloading}
                isDownloadLoading={this.props.isDownloadLoading}
                isVdtSaved={this.props.enableExportScreen}
                saveVDTHandler2={this.props.saveVDTHandler}
                /*saveVDTHandler={() => {
                  reviewValueDriverStore.saveTree()
                }}*/
                saveVDTHandler={this.saveVDT}
                deleteVDT={this.props.deleteVDT}
                generateVDT={this.props.generateVDT}
                vdtBtnHandler={this.props.vdtBtnHandler}
                downloadBaseline={this.props.downloadBaseline}
                onIngestBaseline={this.props.onIngestBaseline}
                viewFullScreenVDT={this.viewFullScreenVDT}
                isMaster={isMaster}
                exportHandler={this.props.exportHandler}
                confirmMsg={this.props.showMessage}
                mode={this.vdtModeChange}
                selectedMode={reviewValueDriverStore.mode}
                loadingVDTMode={reviewValueDriverStore.loadingVDTMode}
                undo={() => {
                  reviewValueDriverStore.undo()
                }}
                redo={() => reviewValueDriverStore.redo()}

              />
            </div>}
          </div>

          { ( SessionStorage.read("userType") === "EU" && SessionStorage.read("accessType") === "Read" && Object.keys(resultEmptyCheck && resultEmptyCheck.resultObj).length === 0) ?
           <div className="row empty-tree-data-div col-sm-12">Please contact Accenture SPOC to get started</div>:
           <div style={{ width: '100%' }}
          // style={overflowValue === 'auto' ? { marginTop: '2%' } : { overflowX: 'visible', marginTop: '2%' }}
          >         
            <div className="row no-gutters align-self-center " style={{ width: this.props.isBusinessCase ? '50%' : '100%', position: 'sticky', top: '0', zIndex: '2' }}>
              <ReviewValueDriverTreeHeader isBusinessCase={this.props.isBusinessCase} />
            </div>     
            {
              branchTree.length > 0 ?
                (
                  <div style={{}}>
                    <div key={Math.floor(Math.random() * 1001)} className="col-sm-12" style={{
                      //  height: '400px'
                      height: "fit-content"
                    }} id="vdt">
                      <ValueDriverTreeNew
                        isGenerateVDTBtnClicked={this.props.isGenerateVDTBtnClicked}
                        strategicObjectives={strategicObjectives}
                        branchTree={branchTree}
                        dataTree={dataTree}
                        isBusinessCase={this.props.isBusinessCase}
                        frequencyChangeHandler={this.frequencyChangeHandler}
                        operationKpiIds={operationKpiIds}
                        operationalKpis={operationalKpIs}
                        operationalColor={this.props.operationalColor}
                        oldKPIValues={this.props.oldKPIValues}
                        isBenefitActuals={false}
                        refresh={this.refresh}
                        loadingVDTchange={this.loadingVDTchange}
                      />
                    </div>
                  </div>
                ) 
                    : <div className="row justify-content-center" style={{ height: '50px' }}>
                      <h4> <i className="fa fa-exclamation-triangle"></i> No data to load</h4>
                    </div>
            }
            
          </div>
          }
          <div data-html2canvas-ignore={true}>
            <ExportModal
              visible={this.state.visible}
              generateXlsHandler={this.generateXlsHandler}
              generatePPTHandler={this.generatePPTHandler}
              modalCloseHandler={this.modalCloseHandler}
            />
          </div>
          {this.state.displayFullScreen && < FullScreenVDT
            displayFullScreen={this.state.displayFullScreen}
            fullScreenCloseHandler={this.fullScreenCloseHandler}
            download={this.onDownloadClick}
          />}

        </div> : 
        (showVdtLoading ?
          <div id='VisualVDT' className="row empty-tree-data-div col-sm-12">
            <i className="fa fa-spinner fa-spin" style={{ height: "min-content", fontSize: '25px', color: '#ffffff' }}></i>
          </div> :
          <div id='VisualVDT' className="row empty-tree-data-div col-sm-12">
            <p>
              To begin, select Accenture Offering/Industry and click Generate VDT button (or) click Create Custom VDT button
                    </p>
          </div>)

    );

  }
}

export default withRouter(VisualVDT);
