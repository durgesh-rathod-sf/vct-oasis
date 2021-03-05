import React, { Component } from 'react';
import { withRouter } from "react-router-dom";
import { inject } from 'mobx-react';
import Modal from 'react-bootstrap4-modal';
import 'moment-timezone';
import './FAQHome.css';

import ReactTooltip from 'react-tooltip';
import uploadLogoIco from "../../assets/newDealsIcons/uploadLogo.svg";
import closeIcon from '../../assets/project/workstream/modal-close.svg';
import CustomConfirmModal from '../../components/CustomConfirmModal/CustomConfirmModal';
import NotificationMessage from '../../components/NotificationMessage/NotificationMessage';
import pdf from '../../assets/HowToUse/pdf.svg';
import uploadIco from "../../assets/project/fvdt/upload.svg";
import { toast } from 'react-toastify';

@inject('workstreamStore')
class DocUploadModal extends Component {
    constructor(props) {
        super(props);

        this.state = {
            docModalCloseVisible: false,
            docModalCloseTitle: '',
            file: null,
            docName: '',
            accessType:"",
        }

        this.onChange = this.onChange.bind(this);
    }

    componentDidMount() {
        const {editFile,editedMetaDataDocObj} = this.props;
        if(editFile){
            this.setState({
                docName: editFile, 
                saveDisabled: false,
                accessType:editedMetaDataDocObj.accessType,
                labelDocName:editedMetaDataDocObj.fileName
            })
        }
    }


    closeWithoutSave = () => {
        const confirmMsg = 'Are you sure you want to close ?';
        this.openDocConfirmModal(confirmMsg);
    }
    
    openDocConfirmModal = (title) => {
        this.setState({
            docModalCloseVisible: true,
            docModalCloseTitle: title,
        });
    }
    closeDocConfirmModal = (isYesClicked) => {
        this.setState({
            docModalCloseVisible: false,
            docModalCloseTitle: '',
        }, () => {
            ReactTooltip.rebuild();
        });
        if (isYesClicked) {

            this.props.modalCloseHandler();
        } 
    }

    
    isValidFileSize(file) {
        if (file !== undefined && file !== null) {
        let fileSize = Math.round(file.size / 1024); 
        if (fileSize > 2000) {
            return false;
        }
        return true;
        }
        return true;
    }

    isValidFileExtension(file) {
        if (file !== undefined && file !== null) {
        let fileName = file.name;
        let fileExtension = fileName.split('.').pop();
        if (
            fileExtension !== 'pdf' &&
            fileExtension !== 'PDF'
        ) {
            return false;
        }
        return true;
        }
        return true;
    }

    onNameChange = (e) => {
        this.setState({
            docName: e.target.value,
        })
    }

    saveDocument = (e) => {
        const {docName,accessType} = this.state;
        if(!RegExp(/[<>!'"[\]\\/#%()+?~`^|]/).test(docName)){
            if(docName.trim().length > 49){
                this.setState({
                    saveDisabled: true,
                })
                this.showNotification("error","File name can have 50 characters only");
            }
            else{
                this.setState({
                    saveDisabled : true,
                })
                this.props.saveDocument(docName,accessType);
            }
        }
        else{
            this.showNotification("error","Please enter valid file name. Special characters [ < ! ' \" / > # % () + ? ~ ` ^ | ] are invalid");
        }
    }

    saveEditedDocument = (e) => {  
        const {docName,labelDocName,accessType} = this.state;
        const {editFile,editedMetaDataDocObj} = this.props;
        if (editFile.trim() !== docName.trim() || editedMetaDataDocObj.accessType !== accessType){
            if(!RegExp(/[<>!'"[\]\\/#%()+?~`^|]/).test(docName)){
                if(docName.trim().length > 49){
                    this.setState({
                        saveDisabled: true,
                    })
                    this.showNotification("error","File name can have 50 characters only");
                }
                else{
                    this.setState({
                        saveDisabled: true,
                    })
                    if (labelDocName === editedMetaDataDocObj.fileName) {
                        this.props.UpdateDocDetails(docName, accessType, editedMetaDataDocObj);
                    } else {
                        this.props.deleteDocumentFromS3(editFile, true , docName,accessType);
                    }
                    
                }
            }
            else{
                this.showNotification("error","Please enter valid file name. Special characters [ < ! ' \" / > # % () + ? ~ ` ^ | ] are invalid");
            }
           
           
           
            }else{
                this.props.modalCloseHandler();
                this.showNotification("error","File not saved. File with same name already exists!");
     }
    }
    onAccessTypeChange = (event) => {
        this.setState({
            accessType: event.target.value
        })
    }
    onChange(e) {
        const file = e.target.files[0];
        if (!this.isValidFileSize(file) && !this.isValidFileExtension(file)) {
        const file = document.getElementById('fileInput');
        file.value = '';
        this.showNotification("error", "file is too large, maximum supported file size is 2MB and file format allowed is '.pdf' ")
        } else if (!this.isValidFileExtension(file)) {
        const file = document.getElementById('fileInput');
        file.value = '';
        this.showNotification("error","invalid file format! File format allowed is '.pdf'")
        } else if (!this.isValidFileSize(file)) {
        const file = document.getElementById('fileInput');
        file.value = '';
        this.showNotification("error",'file is too large, maximum supported file size is 2MB')
        } else {
        if (file !== undefined && file !== null) {
            this.setState(
            {
                docName: file.name,
                file: file,
                labelDocName: file.name,
            },
            () => {
                this.props.onChange(this.state.file);
            }
            );
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
                case 'success':
                    toast.info(<NotificationMessage
                        title="Success"
                        bodytext={message}
                        icon="success"
                    />, {
                        position: toast.POSITION.BOTTOM_RIGHT
                    });
                    break;
            default:
              
                break;
        }
    }

    render() {
        const {docName, file, docModalCloseVisible, docModalCloseTitle, saveDisabled,accessType} = this.state;
        const {displayFile, editFile, isDocinStore} = this.props;
       
        return (
            <Modal id= 'video-upload' visible='true' className='video-upload '>
                <div className="modal-header">
                    <h6 className="modal-title mx-auto md-block">{editFile? "Edit Document" : "Upload Document"}</h6>
                    <img data-tip="" data-for="close_act_tooltip" data-type="dark" data-place="left"
                    src={closeIcon} alt="close" onClick={this.closeWithoutSave} data-dismiss="modal"></img>
                    <ReactTooltip id="close_act_tooltip">
                        <span>Close</span>
                    </ReactTooltip>
                </div>  
                    {(file && displayFile !== null) || editFile ?
                    <div style={{paddingTop: '10px'}}>
                        <div className="row" style={{marginLeft:"0px"}}>
                            <div className="">
                                <img src={pdf} 
                                alt="pdf"
                                style={{
                                maxWidth:"100%",
                                maxHeight:"100%"
                                }} />
                            </div>
                            <div style={{marginLeft: '40px'}}>
                                <div className="col-4" style={{paddingLeft: "0px"}}>
                                    <input type="text" className="file-name-input"
                                        name="filename"
                                        id="fileNameLabel"
                                        placeholder="Display name here" maxLength="50"
                                        autoComplete='off'
                                        value = {
                                            (docName.substring(docName.length, docName.length-4).toLowerCase() === '.pdf' ? 
                                            docName.substring(0, docName.length-4) : docName)  
                                            || ''}
                                        onChange={(e) => {this.onNameChange(e)}}
                                    />
                                </div>
                                {editFile ?
                                    <div style={{alignSelf:"flex-end", paddingTop: '10px'}}>
                                        <label htmlFor="fileUploadInput">
                                        <img src={uploadIco} alt="uploadIcon" style={{ cursor: 'pointer'}}
                                        data-tip="" data-for="upload_tooltip" data-type="dark" data-place="right"
                                        data-dismiss="modal" />
                                        </label>
                                        <input
                                            type="file"
                                            name="file"
                                            id="fileUploadInput"
                                            accept=".pdf"
                                            //disabled={this.props.masterMarked ? true: this.props.loader ? true: false}
                                            style={{ height: "32px", opacity: "0", position: "absolute", zIndex: "-1" }}
                                            onChange={e => this.onChange(e)}
                                        />
                                        <ReactTooltip id="upload_tooltip">
                                            <span>Upload</span>
                                        </ReactTooltip>

                                        <label style={{paddingLeft: '10px'}} 
                                            data-tip="" 
                                            data-for={`pdfTtext_${this.props.editFile && this.state.labelDocName ? this.state.labelDocName: this.props.editFile }`} 
                                            data-place="left" data-type="dark">
                                            {this.props.editFile && this.state.labelDocName
                                                ? this.state.labelDocName.length > 50 ?
                                                    this.state.labelDocName.substr(0,49)+"..." :this.state.labelDocName
                                                    : this.props.editFile.length > 50 ?
                                                        this.props.editFile.substr(0,49)+"..." :this.props.editFile}
                                        </label>

                                    </div>
                                : 
                                    <label style={{paddingLeft: '10px'}}>
                                        {this.state.labelDocName.length > 50 ?
                                            this.state.labelDocName.substr(0,49)+"..." : this.state.labelDocName}
                                    </label>
                                }
                                <div>
                                            <label className="col-sm-12" style={{ padding: "0px", marginBottom: "3px" }}>Access Type</label>
                                            <select tabIndex="2"
                                                defaultValue="Select"
                                                className="access-select"
                                                value={accessType}
                                                onChange={(e) => { this.onAccessTypeChange(e) }}
                                                id="access-control-filter"
                                            // name={'oppIndName_' + orIndex}

                                            >
                                                <option value="" selected disabled>Select</option>
                                                <option value="IU">Accenture Users </option>
                                                <option value="EU">Non-Accenture Users</option>


                                            </select>
                                        </div>
                            </div>
                        </div>
                        <div className="row">
                            <div className="col-sm-12 col-md-12 col-xs-12 save-icon-align">
                                <button type="button" style={{cursor: (docName === undefined || docName === '' || docName === null) || saveDisabled ? 'default' : 'pointer'}}
                                disabled={(docName === undefined || docName === '' || docName === null) || accessType === "" || (saveDisabled && !isDocinStore) ? true  : false}
                                className="btn btn-primary" onClick={editFile ? (e)=>this.saveEditedDocument(e) : (e)=> this.saveDocument(e)}>
                                {(saveDisabled && !isDocinStore) ? "Saving..." : "Save"}</button>
                                
                                {(saveDisabled && !isDocinStore)? '' :
                                <button type="button" 
                                className="btn btn-secondary doc-upload-cancel" onClick={this.closeWithoutSave}>
                                    Cancel</button>
                                }
                            </div>
                        </div>
                    </div>
                    :
                    <div style={{paddingTop: '10px', alignSelf: 'center'}}>
                        <label htmlFor="fileInput">
                        <   div className="row logoUpload-box" 
                                //onClick={this.openVideoModal}
                                style={{cursor: 'pointer'}}
                                >
                                <div style={{ width: "100%", marginTop: "15px" }}>
                                    <img src={uploadLogoIco} alt="logo" />
                                </div>
                                <span className="col-sm-12 uploadText" >Upload Document</span>
                                <span className="col-sm-12 uploadText" >.pdf format</span>
                                <span className="col-sm-12 uploadText" >less than 2MB</span>
                            </div>
                        </label>
                        <input
                            type="file"
                            name="file"
                            id="fileInput"
                            accept=".pdf"
                            //disabled={this.props.masterMarked ? true: this.props.loader ? true: false}
                            style={{ height: "32px", opacity: "0", position: "absolute", zIndex: "-1" }}
                            onChange={e => this.onChange(e)}
                        />
                    </div>
                    }

                {docModalCloseVisible ?
            
                    <CustomConfirmModal
                        ownClassName={'doc-delete-modal'}
                        isModalVisible={docModalCloseVisible}
                        modalTitle={docModalCloseTitle}
                        closeConfirmModal={this.closeDocConfirmModal}
                    /> : ''
                } 
            </Modal>
        );
    }
}

export default withRouter(DocUploadModal);