import React, { Component, Fragment } from 'react';
import { withRouter } from "react-router-dom";
import { inject } from 'mobx-react';
import Modal from 'react-bootstrap4-modal';
import 'moment-timezone';
import './FAQHome.css';
import { getThumbnails } from 'video-metadata-thumbnails';
import ReactTooltip from 'react-tooltip';
import uploadLogoIco from "../../assets/project/fvdt/upload.svg";
import closeIcon from '../../assets/project/workstream/modal-close.svg';
import CustomConfirmModal from '../../components/CustomConfirmModal/CustomConfirmModal';
import NotificationMessage from '../../components/NotificationMessage/NotificationMessage';
import { toast } from 'react-toastify';

@inject('workstreamStore')
class VideoUploadModal extends Component {
    constructor(props) {
        super(props);

        this.state = {
            videoModalCloseVisible: false,
            videoModalCloseTitle: '',
            docName: '',
            thumbnail: '',
            thumbNailBlob: '',
            accessType: "",
        }
    }

    componentDidMount() {
        const { editFile, editThumbnail, editedMetaDataObj } = this.props;
        if (editFile) {
            this.setState({
                docName: editFile,
                saveDisabled: false,
                thumbnail: editThumbnail,
                editedMetaDataObj: editedMetaDataObj,
                accessType: editedMetaDataObj.accessType//will change one Api integration is done.
            })
        }
    }

    closeWithoutSave = () => {
        const confirmMsg = 'Are you sure you want to close ?';
        this.openVideoConfirmModal(confirmMsg);
    }
    openVideoConfirmModal = (title) => {
        this.setState({
            videoModalCloseVisible: true,
            videoModalCloseTitle: title,
        });
    }
    closeVideoConfirmModal = (isYesClicked) => {
        this.setState({
            videoModalCloseVisible: false,
            videoModalCloseTitle: '',
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

    async getThumbnailForVideo(blob) {
        const thumbnails = await getThumbnails(blob, {
            interval: 1,
            start: 5,
            end: 6,
            quality: 0.7
        });
        var filetest = new File([thumbnails[0].blob], this.state.docName, { type: "image/jpeg" });
        var imageUrl = URL.createObjectURL(thumbnails[0].blob);
        this.setState({
            thumbnail: imageUrl,
            thumbNailBlob: filetest
        })
    }

    saveVideo = (e) => {
        const { docName, file, thumbNailBlob, accessType } = this.state;
        if (!RegExp(/[<>!'"[\]\\/#%()+?~`^|]/).test(docName)) {
            if (docName.trim().length > 49) {
                this.setState({
                    saveDisabled: true,
                })
                this.showNotification("error", "File name can have 50 characters only");
            }
            else {
                this.setState({
                    saveDisabled: true,
                })
                this.props.saveVideo(docName, file, thumbNailBlob, false, accessType);
            }
        }
        else {
            this.showNotification("error", "Please enter valid file name. Special characters [ < ! ' \" / > # % () + ? ~ ` ^ | ] are invalid");
        }
    }

    saveEditedVideo = (e) => {
        const { docName, file, thumbNailBlob, accessType, editedMetaDataObj } = this.state;
        const { editFile, editThumbnail } = this.props;
        if (editFile.trim() !== docName.trim() || editedMetaDataObj.accessType !== accessType) {
            if (!RegExp(/[<>!'"[\]\\/#%()+?~`^|]/).test(docName)) {
                if (docName.trim().length > 49) {
                    this.setState({
                        saveDisabled: true,
                    })
                    this.showNotification("error", "Video name can have 50 characters only");
                }
                else {
                    this.setState({
                        saveDisabled: true,
                    })

                    if (thumbNailBlob === "") {
                        this.props.UpdateVedioDetails(docName, accessType, editedMetaDataObj, file);
                    } else {
                        this.props.deleteEditedVideo(editFile, editThumbnail, true, docName, file, thumbNailBlob, accessType);
                    }
                }
            }
            else {
                this.showNotification("error", "Please enter valid Video file name. Special characters [ < ! ' \" / > # % () + ? ~ ` ^ |] are invalid");
            }
        } else {
            this.props.modalCloseHandler();
            this.showNotification("error", "Video not saved. Video with same name already exists!");
        }
    }

    isValidFileExtension(file) {
        if (file !== undefined && file !== null) {
            if (file.type !== 'video/mp4' && file.type !== 'video/flp' && file.type !== 'video/x-flv') {
                return false;
            }
            return true;
        }
        return true;
    }

    onNameChange = (e) => {
        const { editFile } = this.props;
        const { file, docName, editVideoName } = this.state;
        let tempFile = file;
        // tempFile.name=e.target.value;
        /* if(/^[<>!.'"[\]]/.test(e.target.value)){
        this.setState({
            docName: '',
        })
        }
        else { */
        if (editFile) {
            this.setState({ docName: e.target.value })
        }
        else {
            this.setState({
                docName: e.target.value,
                editVideoName: e.target.value
            })
        }

        // }
    }

    onChange(e) {
        const { editFile } = this.props;
        const file = e.target.files[0];
        if (!this.isValidFileExtension(file)) {
            const file = document.getElementById('fileInput');
            file.value = '';
            this.showNotification("error", "invalid file format! File format allowed is '.mp4' or '.flv'")
        } else {
            if (file !== undefined && file !== null) {

                this.setState(
                    {
                        file: file,
                        docName: file.name,
                        editVideoName: file.name
                    },
                    () => {
                        this.props.onChange(this.state.file);
                        this.getThumbnailForVideo(this.state.file)
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
            default:
                console.log("");
                break;
        }
    }
    onAccessTypeChange = (event) => {
        this.setState({
            accessType: event.target.value
        })
    }

    render() {
        const { docName, file, videoModalCloseTitle, videoModalCloseVisible, saveDisabled, accessType } = this.state;
        const { displayFile, editFile, isVideoinStore } = this.props;
        return (
            <Modal id='video-upload' visible='true' className='video-upload'>
                <div className="modal-header">
                    <h6 className="modal-title mx-auto md-block">{editFile ? "Change Video" : "Upload Video"}</h6>
                    <img data-tip="" data-for="close_act_tooltip" data-type="dark" data-place="left"
                        src={closeIcon} alt="close" onClick={this.closeWithoutSave} data-dismiss="modal"></img>
                    <ReactTooltip id="close_act_tooltip">
                        <span>Close</span>
                    </ReactTooltip>
                </div>

                {(file && displayFile !== null) || editFile ?
                    <div style={{ paddingTop: '10px' }}>
                        <div className="row" style={{ marginLeft: "0px" }}>
                            <div className="">
                                <img src={this.state.thumbnail}
                                    width="180"
                                    height="100"
                                    alt="video" />
                            </div>
                            <div style={{ marginLeft: '20px' }}>
                                <div className="col-4" style={{ paddingLeft: "0px" }}>
                                    <input type="text" className="file-name-input"
                                        placeholder="File name here" maxLength="50"
                                        autoComplete='off'
                                        value={
                                            ((docName.substring(docName.length, docName.length - 4).toLowerCase() === '.mp4' ||
                                                docName.substring(docName.length, docName.length - 4).toLowerCase() === '.flv') ?
                                                docName.substring(0, docName.length - 4) : docName)
                                            || ''}
                                        onChange={(e) => { this.onNameChange(e) }}
                                    />
                                </div>
                                {editFile ?
                                    <Fragment>
                                        <div style={{ alignSelf: "flex-end", paddingTop: '10px' }}>
                                            <label htmlFor="fileUploadInput">
                                                <img src={uploadLogoIco} alt="uploadIcon" style={{ cursor: 'pointer' }}
                                                    data-tip="" data-for="upload_tooltip" data-type="dark" data-place="right"
                                                    data-dismiss="modal" />
                                            </label>
                                            <input
                                                type="file"
                                                name="file"
                                                id="fileUploadInput"
                                                accept=".mp4/.flv"
                                                style={{ height: "32px", opacity: "0", position: "absolute", zIndex: "-1" }}
                                                onChange={e => this.onChange(e)}
                                            />
                                            <ReactTooltip id="upload_tooltip">
                                                <span>Upload</span>
                                            </ReactTooltip>

                                            <label style={{ paddingLeft: '10px' }}
                                                data-tip=""
                                                data-for={`videoNameText_${this.props.editFile && this.state.editVideoName ? this.state.editVideoName : this.props.editFile}`}
                                                data-place="left" data-type="dark">
                                                {this.props.editFile && this.state.editVideoName
                                                    ? this.state.editVideoName.length > 50 ?
                                                        this.state.editVideoName.substr(0, 49) + "..." : this.state.editVideoName
                                                    : this.props.editFile.length > 50 ?
                                                        this.props.editFile.substr(0, 49) + "..." : this.props.editFile}
                                            </label>

                                        </div>
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
                                    </Fragment>
                                    :

                                    <Fragment>
                                        <div ><label style={{ paddingLeft: '10px' }}>
                                            {this.state.editVideoName.length > 50 ?
                                                this.state.editVideoName.substr(0, 49) + "..." : this.state.editVideoName}
                                        </label>
                                        </div>
                                        <div>
                                            <label className="col-sm-12" style={{ padding: "0px", marginBottom: "3px" }}>Access Type</label>
                                            <select tabIndex="2"
                                                defaultValue="Select"
                                                className="access-select"
                                                value={accessType}
                                                onChange={(e) => this.onAccessTypeChange(e)}
                                                id="access-control-filter"
                                            // name={'oppIndName_' + orIndex}

                                            >
                                                <option value="" selected disabled>Select</option>
                                                <option value="IU">Accenture Users </option>
                                                <option value="EU">Non-Accenture Users</option>


                                            </select>
                                        </div>
                                    </Fragment>
                                }
                            </div>
                        </div>
                        <div className="row">
                            <div className="col-sm-12 col-md-12 col-xs-12 save-icon-align">
                                <button type="button" style={{ cursor: (docName === undefined || docName === '' || docName === null) || saveDisabled ? 'default' : 'pointer' }}
                                    disabled={(docName === undefined || docName === '' || docName === null || docName.replace(/\s/g, '').length === 0) || accessType === "" || (saveDisabled && !isVideoinStore) ? true : false}
                                    className="btn btn-primary" onClick={editFile ? (e) => this.saveEditedVideo(e) : (e) => this.saveVideo(e)}>
                                    {(saveDisabled && !isVideoinStore) ? "Saving..." : "Save"}</button>

                                {(saveDisabled && !isVideoinStore) ? '' :
                                    <button type="button"
                                        className="btn btn-secondary doc-upload-cancel" onClick={this.closeWithoutSave}>
                                        Cancel</button>
                                }
                            </div>
                        </div>
                    </div>
                    :
                    <div style={{ paddingTop: '10px', alignSelf: 'center' }}>
                        <label htmlFor="fileInput">
                            <div className="row logoUpload-box"
                                onClick={this.openVideoModal}
                                style={{ cursor: 'pointer' }}>
                                <div style={{ width: "100%", marginTop: "15px" }}>
                                    <img src={uploadLogoIco} alt="logo" />
                                </div>
                                <span className="col-sm-12 uploadText" style={{ marginBottom: "-10px" }}>Upload Video</span>
                                <span className="col-sm-12 uploadText" >.mp4, .flv format</span>
                            </div>
                        </label>
                        <input
                            type="file"
                            name="file"
                            id="fileInput"
                            accept=".mp4,.flv"
                            style={{ height: "32px", opacity: "0", position: "absolute", zIndex: "-1" }}
                            onChange={e => this.onChange(e)}
                        />
                    </div>
                }

                {videoModalCloseVisible ?
                    <CustomConfirmModal
                        ownClassName={'video-delete-modal'}
                        isModalVisible={videoModalCloseVisible}
                        modalTitle={videoModalCloseTitle}
                        closeConfirmModal={this.closeVideoConfirmModal}
                    /> : ''
                }
            </Modal>
        );
    }
}

export default withRouter(VideoUploadModal);