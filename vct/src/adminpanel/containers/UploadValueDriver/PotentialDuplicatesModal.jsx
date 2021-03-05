import React, { Component } from 'react';
import { withRouter } from "react-router-dom";
import { inject } from 'mobx-react';
import Modal from 'react-bootstrap4-modal';
import 'moment-timezone';
import CustomConfirmModal from '../../../components/CustomConfirmModal/CustomConfirmModal';
import NotificationMessage from '../../../components/NotificationMessage/NotificationMessage';
import closeIcon from '../../../assets/project/workstream/modal-close.svg';
import { toast } from 'react-toastify';
import ReactTooltip from 'react-tooltip';

@inject('workstreamStore', 'adminStore')
class PotentialDuplicatesModal extends Component {
    constructor(props) {
        super(props);

        this.state = {
            duplicatedMarked: [],
            selectAll : false,
            potentialModalCloseVisible: false,
            potentialModalCloseTitle: '',
            isSaveEnabled: false,
            loader: false
        }
    }

    componentDidMount() {
        const { duplicatesArray } = this.props;
        let copy = duplicatesArray;
        for( let x of duplicatesArray){
            x['checked'] = false;
        }
        this.setState({
            duplicatedMarked: [...copy]
        })
    }

    closeWithoutSave = () => {
        const confirmMsg = 'Are you sure you want to close ?';
        this.openCloseConfirmModal(confirmMsg);
    }
    openCloseConfirmModal = (title) => {
        this.setState({
            potentialModalCloseVisible: true,
            potentialModalCloseTitle: title,
        });
    }
    closePotentialConfirmModal = (isYesClicked) => {
        this.setState({
            potentialModalCloseVisible: false,
            potentialModalCloseTitle: '',
        }, () => {
            ReactTooltip.rebuild();
        });
        if (isYesClicked) {
            this.props.modalCloseHandler();
        }
    }

    savePotentialDuplicates = (e) => {
        const { duplicatedMarked } = this.state;
        const { adminStore, selectedObjective } = this.props;
        var filteredArray = duplicatedMarked.filter((itm)=>{
            return itm.checked === true;
          });
        if(selectedObjective !== 'KPI' ){
            filteredArray.forEach(function(obj, i) {
                obj['checked'] && delete obj['checked'];
                obj['id'] && delete obj['id'];
              });
              const payload = {
                taskId: this.props.taskId,
                potentialDuplicates: [...filteredArray]
            }
            this.setState({
              loader: true
            })
            adminStore.updatePotentialDuplicates(payload)
                  .then((response) => {
                      if (!response.error && response.data.resultCode === 'OK') {
                          this.showNotification('success', response.data.resultDescription)
                          this.setState({
                              loader: false
                          });
                          this.props.modalCloseHandler();
                      }
                      else {
                          this.showNotification('error', response.data.errorDescription)
                          this.setState({
                              loader: false
                          });
                          this.props.modalCloseHandler();
                      }
                  })
                  .catch((e) => {
                      this.setState({
                          loader: false
                      })
                  });
        }else{
            filteredArray.forEach(function(obj, i) {
                obj['checked'] && delete obj['checked'];
              });
              const payload = {
                  taskId: this.props.taskId,
                  override: [...filteredArray]
              }
              this.setState({
                loader: true
              })
              adminStore.updatePotentialDuplicatesforKPI(payload)
                    .then((response) => {
                        if (!response.error && response.data.resultCode === 'OK') {
                            this.showNotification('success', response.data.resultDescription)
                            this.setState({
                                loader: false
                            });
                            this.props.modalCloseHandler();
                        }
                        else {
                            this.showNotification('error', response.data.errorDescription)
                            this.setState({
                                loader: false
                            });
                            this.props.modalCloseHandler();
                        }
                    })
                    .catch((e) => {
                        this.setState({
                            loader: false
                        })
                    });
              
        }
        
    }

    markPotentialDuplicates = (marked, index) => {
        const { duplicatedMarked } = this.state;
        let copy = duplicatedMarked;
        for( let [i,x] of duplicatedMarked.entries()){
            if(marked === true && index === x['id']){
                copy[i]['checked'] = true
            }else if(marked === false && index === x['id']){
                copy[i]['checked'] = false
            }
        }
        this.setState({
            duplicatedMarked : [...copy],
                isSaveEnabled:([...copy].some(item => item.checked === true))?true:false
        },()=>{
            this.checkAllMarked(this.state.duplicatedMarked);
        })
    }

    checkAllMarked(checkedArray){
        let count = false;
        for (let x of checkedArray) {
            if (x['checked'] === true) {
              count = true
            } else {
              count = false;
              break;
            }
        }
        if(count){
            this.setState({
                selectAll: true,
            });
        }else{
            this.setState({
                selectAll: false,
            });
        }
    }

    handleSelectAllDuplicates(marked){
        const { duplicatedMarked } = this.state;
        let copy = duplicatedMarked;
        if(marked){
        for(let x of copy){
                x['checked'] = true
        }
        }else{
            for(let x of copy){
                x['checked'] = false
        }  
        }
        this.setState({
            duplicatedMarked : [...copy],
            selectAll: marked?true:false,
            isSaveEnabled: marked?true:false
        })
    }

    showNotification(type, message) {
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
            default:
                console.log("");
                break;
        }
    }

    render() {
        const { potentialModalCloseTitle, potentialModalCloseVisible, isSaveEnabled, duplicatedMarked, selectAll, loader } = this.state;
        const { successCount, selectedObjective } = this.props;
        return (
            <Modal id='bulk-upload' visible='true' className='video-upload'>
                <div className="modal-header">
                    <h6 className="modal-title mx-auto md-block">Potential Duplicates</h6>
                    <img data-tip="" data-for="close_act_tooltip" data-type="dark" data-place="left"
                        src={closeIcon} alt="close" onClick={this.closeWithoutSave} data-dismiss="modal"></img>
                    <ReactTooltip id="close_act_tooltip">
                        <span>Close</span>
                    </ReactTooltip>
                </div>

                <div style={{ paddingTop: '10px' }}>
        <p className="header-info">{(successCount !== null && successCount>0)? `${successCount} ${selectedObjective}s were successfully uploaded.` : ''} Following {selectedObjective}s could be potentially duplicates.
                    Select the {selectedObjective}s to be saved in the database
                    </p>
                    {duplicatedMarked && <div className="tablediv">
                        <table className="table" style={{ marginBottom: "2px" }}>
                            <thead style={{ whiteSpace: 'nowrap' }}>
                                <tr>
                                    <th>
                                        <input type="checkbox"
                                            style={{ margin: "5px", textAlignLast: 'left' }}
                                            checked={selectAll}
                                            // value={checkedVal}
                                            onChange={(e) => this.handleSelectAllDuplicates(e.target.checked)} 
                                        /></th>
                                    <th style={{ width: '50%' }}>Requested KPIs</th>
                                    <th id="linkedKpiHeaderClick"> Available KPIs</th>
                                </tr>
                            </thead>
                            <tbody className="table-body">
                                {duplicatedMarked && duplicatedMarked.map((option, potentialIndex) => (
                                    <tr key={potentialIndex}>
                                        <td style={{textAlign: 'center'}}>
                                                <input type="checkbox"
                                                    id={`option_${potentialIndex}`}
                                                    name={"potential-Duplicates-check"}
                                                    style={{ margin: "5px"/* , textAlignLast: 'left'  */}}
                                                    checked={option.checked}
                                                    onChange={(e) => this.markPotentialDuplicates(e.target.checked, option.id)} 
                                                />
                                        </td>
                                        <td>
                                            <p style={{ margin: "5px" }}> {option.requested}</p>
                                        </td>
                                        <td>
                                            <p style={{ margin: "5px" }}> {option.available}</p>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>}
                    <div className="row">
                        <div className="col-sm-12 col-md-12 col-xs-12 save-icon-align">
                            <button type="button" style={{ cursor: 'pointer',marginRight:"20px", fontSize:"12px", fontFamily:"Graphik" }}
                                // className={isSaveEnabled ?"save-cancel-enabled":"save-cancel-disabled"}
                                className="btn btn-primary"
                                disabled={(!isSaveEnabled || loader)}
                             onClick={this.savePotentialDuplicates}
                            >
                                {loader ? "Saving..." : "Save"}
                                </button>

                                <button type="button" style={{ cursor: 'pointer', fontSize:"12px", fontFamily:"Graphik"}}
                                 className="btn btn-primary"
                                    // className={isSaveEnabled && !loader?"save-cancel-enabled":"save-cancel-disabled"}
                                    disabled={(!isSaveEnabled || loader)}
                                onClick={this.closeWithoutSave}
                                >
                                    Cancel</button>
                        </div>
                    </div>
                </div>

                {potentialModalCloseVisible ?
                    <CustomConfirmModal
                        ownClassName={'potential-dup-modal'}
                        isModalVisible={potentialModalCloseVisible}
                        modalTitle={potentialModalCloseTitle}
                        closeConfirmModal={this.closePotentialConfirmModal}
                    /> : ''
                }
            </Modal>
        );
    }
}

export default withRouter(PotentialDuplicatesModal);
