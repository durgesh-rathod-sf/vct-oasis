import React, { Component } from 'react';
import { withRouter } from "react-router-dom";
import { inject } from 'mobx-react';
import Modal from 'react-bootstrap4-modal';
import 'moment-timezone';
import ReactTooltip from 'react-tooltip';
import uploadLogoIco from "../../../assets/project/fvdt/upload.svg";
import closeIcon from '../../../assets/project/workstream/modal-close.svg';
import CustomConfirmModal from '../../../components/CustomConfirmModal/CustomConfirmModal';
import NotificationMessage from '../../../components/NotificationMessage/NotificationMessage';
import { toast } from 'react-toastify';

@inject('workstreamStore')
class UploadBulkTemplate extends Component {
    constructor(props) {
        super(props);

        this.state = {
            UploadConfirmModalVisible: false,
            UploadModalCloseTitle:'',
            file: ''
        }
    }

    componentDidMount() {
        
    }

    closeWithoutSave = () => {
        this.props.modalCloseHandler();
    }
    openUploadConfirmModal = (title) => {
        this.setState({
            UploadConfirmModalVisible: true,
            UploadModalCloseTitle: title
        });
    }
    closeUploadConfirmModal = (isYesClicked) => {
        const { file } = this.state;
        const { selectedObjective } = this.props;
        this.setState({
            UploadConfirmModalVisible: false,
            UploadModalCloseTitle: '',
        }, () => {
            ReactTooltip.rebuild();
        });
        if (isYesClicked) {
            this.props.uploadTemplate(file, selectedObjective);
            this.props.modalCloseHandler();
        }
        else{
            this.props.modalCloseHandler();
        }
    }

    isValidFileSize(file) {
        if (file !== undefined && file !== null) {
            let fileSize = Math.round(file.size / 1024);
            if (fileSize > 4000) {
                return false;
            }
            return true;
        }
        return false;
    }

    
    isValidFileExtension(file) {
        if (file !== undefined && file !== null) {
            if ( file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
            || file.type !== 'application/vnd.ms-excel.sheet.macroEnabled.12') {
                return false;
            }
            return true;
        }
        return true;
    }

    onNameChange = (e) => {
        // if(/^[<>!.'"[\]]/.test(e.target.value)){
        // this.setState({
        //     docName: '',
        // })
        // }
        // else {
            this.setState({
                docName: e.target.value,
            }) 
        // }
    }

    onChange(e) {
        const file = e.target.files[0];
        if (!this.isValidFileExtension(file) && this.isValidFileSize(file)) {
            const file = document.getElementById('fileInput');
            file.value = '';
            this.showNotification("error", "invalid file format! File format allowed is '.xlsx'")
        } else {
            if (file !== undefined && file !== null) {
                this.setState(
                    {
                        file: file,
                    },() => {
                            const confirmMsg = 'Are you sure you want to upload br_br_br this file ?';
                            this.openUploadConfirmModal(confirmMsg);
                    });
            }
        }
    }

    showNotification(type, message) {
        switch (type) {
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
        const { UploadConfirmModalVisible, UploadModalCloseTitle } = this.state;
        return (
            <Modal id='video-upload' visible='true' className='video-upload'>
                <div className="modal-header">
                    <h6 className="modal-title mx-auto md-block">Upload Document</h6>
                    <img data-tip="" data-for="close_act_tooltip" data-type="dark" data-place="left"
                        src={closeIcon} alt="close" onClick={this.closeWithoutSave} data-dismiss="modal"></img>
                    <ReactTooltip id="close_act_tooltip">
                        <span>Close</span>
                    </ReactTooltip>
                </div>
                <div style={{ paddingTop: '10px', alignSelf: 'center' }}>
                        <label htmlFor="fileInput">
                            <div className="row logoUpload-box"
                                style={{ cursor: 'pointer' }}>
                                <div style={{ width: "100%", marginTop: "15px" }}>
                                    <img src={uploadLogoIco} alt="logo" />
                                </div>
                                <span className="col-sm-12 uploadText" style={{ marginBottom: "-10px" }}>Upload Document</span>
                                <span className="col-sm-12 uploadText" >.xlsm format</span>
                                <span className="col-sm-12 uploadText" >less than 4MB</span>
                            </div>
                        </label>
                        <input
                            type="file"
                            name="file"
                            id="fileInput"
                            // accept=".xlsx"
                            //disabled={this.props.masterMarked ? true: this.props.loader ? true: false}
                            style={{ height: "32px", opacity: "0", position: "absolute", zIndex: "-1" }}
                            onChange={e => this.onChange(e)}
                        />
                    </div>

                {UploadConfirmModalVisible ?
                    <CustomConfirmModal
                        ownClassName={'bulk-doc-modal'}
                        isModalVisible={UploadConfirmModalVisible}
                        modalTitle={UploadModalCloseTitle}
                        closeConfirmModal={this.closeUploadConfirmModal}
                    /> : ''
                }
            </Modal>
        );
    }
}

export default withRouter(UploadBulkTemplate);