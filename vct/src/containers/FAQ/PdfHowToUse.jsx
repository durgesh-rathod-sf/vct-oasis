import React, { Component, Fragment } from 'react';
import { inject } from 'mobx-react'
import { withRouter } from "react-router-dom";
import * as _ from "lodash";
import './FAQHome.css';
import details from '../../assets/HowToUse/details.svg';
import intro from '../../assets/HowToUse/introVideo.svg';
import play from '../../assets/HowToUse/play.svg';
import pdf from '../../assets/HowToUse/pdf.svg';
import uploadIco from "../../assets/project/fvdt/upload.svg";
import close from '../../assets/menu/close.svg';
import comingSoon from '../../assets/HowToUse/comingsoon.svg';
import uploadLogoIco from "../../assets/newDealsIcons/uploadLogo.svg";
import VideoUploadModal from "./VideoUploadModal";
import VideoPlayModal from "./VideoPlayModal";
import DocUploadModal from "./DocUploadModal";
import downloadIco from "../../assets/project/fvdt/download.svg";
import editIcon from '../../assets/project/viewDeals/pencil-edit-icon.svg';
import deleteIco from "../../assets/newDealsIcons/trashdelete.svg";
import CustomConfirmModal from '../../components/CustomConfirmModal/CustomConfirmModal';
import { SetS3Config } from '../Login/Login';
import Storage from '@aws-amplify/storage';
import NotificationMessage from '../../components/NotificationMessage/NotificationMessage';
import { toast } from 'react-toastify';
import ReactTooltip from 'react-tooltip';
import bell from '../../assets/Contacts/bell.svg';
//import { Player, BigPlayButton, LoadingSpinner } from 'video-react';
// import Poster from '../../assets/contact_us.jpg';
import Menu from '../../components/Menu/Menu';

var SessionStorage = require('store/storages/sessionStorage');

// var aws = require('aws-sdk');
// var s3 = new aws.S3({
//     region: 'us-east-1',
//     credentials: {
//         accessKeyId: process.env.REACT_APP_ACCESS_KEY_ID,
//         secretAccessKey: process.env.REACT_APP_SECRET_ACCESS_KEY
//     }
// });

const env = process.env.REACT_APP_BASE_URL;
@inject('howToUseStore')
class PdfHowToUse extends Component {
    constructor(props) {
        super(props);
        this.state = {
            openVideoModal: false,
            openDocModal: false,
            file: null,
            displayFile: null,
            deleteDocument: false,
            deleteDocumentTitle: '',
            docList: [],
            tempDocList: [],
            pdfLoading: false,
            isDocinStore: false,
            editVideoName: '',
            editThumbnail: '',
             fileNameArray:[]
        };

        this.onChange = this.onChange.bind(this);
        //this.resetFile=this.resetFile.bind(this);
        this.getBucketName = this.getBucketName.bind(this);
        this.saveDocument = this.saveDocument.bind(this);
        this.UpdateDocDetails = this.UpdateDocDetails.bind(this);

    }

    componentDidMount() {
        this.fetchDocList();
        // this.getVideosAndThumbnails();
        // this.listFiles();
    }

    componentDidUpdate(prevProps, prevState) {
        if (prevProps.selectedTab !== this.props.selectedTab) {
            this.fetchDocList();
        }
    }

    getStorageURL = (selectedTab) => {
        switch (selectedTab) {
            case 'manuals':
                return 'vroimages/vropdfs/';
            case 'stage0':
                return 'vroimages/vrostagepdfs/';
            case 'faq':
                return 'vroimages/vrofaqpdfs/';
            default:
                break;
        }
    }

    fetchDocList = async () => {
        const { howToUseStore } = this.props;
        const userType = SessionStorage.read("userType");
        const { selectedTab } = this.props;
        let allPdfsArray = [];
        let allObjsArray = [];
        let fileNamesArr=[]
        this.setState({
            pdfLoading: true,
        });

        howToUseStore.getVedioList()
            .then(async (resp) => {
                if (resp.data && resp.data.resultCode === 'OK') {
                    allObjsArray = resp.data.resultObj;
                    if(allObjsArray){
                        for (let i = 0; i < allObjsArray.length; i++) {
                            if (allObjsArray[i].documentType === "pdf") {
                                allPdfsArray.push(allObjsArray[i]);
                            }
                        }
                    }
                   

                    // make S3 get call for pdfs

                    const bucketName = this.getBucketNameForUpload();
                    SetS3Config(bucketName);
                    const files = await Storage.list(this.getStorageURL(selectedTab), {
                        customPrefix: {
                            public: ''
                        }
                    });
                    let fetchDocList = [];
                 
                    for (let i = 0; i < files.length; i++) {
                        let j = files[i].key;
                        //  if (i === 0) {
                        //         continue;
                        //     }
                        if (j.indexOf('public/') > 0) {
                            let pdfFileName = (j.substring(0, j.length - 4)).split('/public/')[1];

                            let matchedPdfObj = (allPdfsArray && _.find(allPdfsArray, { fileName: pdfFileName }));
                            fileNamesArr.push(matchedPdfObj && matchedPdfObj.fileName)
                                      if (matchedPdfObj) {
                                fetchDocList.push({
                                    id: i - 1,
                                    title: j.split('/public/')[1],
                                    metaData: matchedPdfObj
                                });
                            }
                        }

                    }
                    let sortedDocList = this.props.sortNamesList(fetchDocList, 'asc');
                    this.setState({
                        docList: sortedDocList,
                        tempDocList: [...sortedDocList],
                        pdfLoading: false,
                        file: null,
                        displayFile: null,
                        fileNameArray:fileNamesArr
                    })
                }
            })

    }

    getBucketName() {
        // eslint-disable-next-line default-case
        switch (env) {
            case 'production':
                return 'https://valuecockpit-accenture.net';
            case 'preprod':
                return 'https://preprod.valuecockpit-accenture.net';
            case 'staging':
                return 'https://uat.valuecockpit.accenture.com';
            case 'development':
                return 'https://dev-valuecockpit.accenture.com';
            case 'local':
                return 'https://dev-valuecockpit.accenture.com';
            case 'productionb':
                return 'https://prodb.valuecockpit-accenture.net';
            case 'training':
                return 'https://training.valuecockpit-accenture.net';
                case 'dev2':
                    return 'https://dev2-valuecockpit.accenture.com';
        }
    }

    getBucketNameForUpload() {
        // eslint-disable-next-line default-case
        switch (env) {
            case 'production':
                return 'prod-valuecockpit-ui';
            case 'preprod':
                return 'preprod-valuecockpit-ui';
            case 'staging':
                return 'uat-valuecockpit-ui';
            case 'development':
                return 'dev-valuecockpit-ui';
            case 'local':
                return 'dev-valuecockpit-ui';
            case 'productionb':
                return 'prodb-valuecockpit-ui';
            case 'dev2':
                return 'dev2-valuecockpit-ui';
            case 'training':
                return 'training-valuecockpit-ui';
        }
    }
    deleteUpdateDocumentFromS3(pdfname, edited, editDocument,accessType) {
        const { history, howToUseStore, selectedTab } = this.props;
        const { deleteMetadataObj } = this.state;
        let bucketName = this.getBucketNameForUpload();
        let newPdf = (pdfname.substring(pdfname.length, pdfname.length - 4).toLowerCase() === '.pdf' ?
            pdfname.substring(0, pdfname.length - 4) : pdfname);

        const deleteUrl = bucketName + '/' + this.getStorageURL(selectedTab) + newPdf;
        SetS3Config(deleteUrl);

        Storage.remove(newPdf + `.pdf`)
            .then(res => {
                history.push('how-to-use');
                if (edited) {
                    this.addFileToS3(editDocument, true, accessType);
                }
                else {
                    this.fetchDocList();
                    this.showNotification("success", "Document Deleted successfully");
                }
            }).catch(e => {
                this.showNotification("error", "Sorry, Client pdf cannot be deleted");
                history.push('how-to-use');
            });


    }
    deleteDocumentFromS3(pdfname, edited, editDocument) {
        const { history, howToUseStore, selectedTab } = this.props;
        const { deleteMetadataObj } = this.state;
        let bucketName = this.getBucketNameForUpload();
        howToUseStore.deleteFileMetaData(deleteMetadataObj.documentId)
            .then((res) => {
                if (res.data && res.data.resultCode == 'OK') {
                    let newPdf = (pdfname.substring(pdfname.length, pdfname.length - 4).toLowerCase() === '.pdf' ?
                        pdfname.substring(0, pdfname.length - 4) : pdfname);

                    const deleteUrl = bucketName + '/' + this.getStorageURL(selectedTab) + newPdf;
                    SetS3Config(deleteUrl);

                    Storage.remove(newPdf + `.pdf`)
                        .then(res => {
                            history.push('how-to-use');
                            if (edited) {
                                this.addFileToS3(editDocument, true);
                            }
                            else {
                                this.fetchDocList();
                                this.showNotification("success", "Document Deleted successfully");
                            }
                        }).catch(e => {
                            this.showNotification("error", "Sorry, Client pdf cannot be deleted");
                            history.push('how-to-use');
                        });
                }
                else {
                    this.showNotification("error", "Sorry, Client video cannot be deleted");
                }
            })






    }

    getRandomString=(length)=>{
        var result           = '';
        var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        var charactersLength = characters.length;
        for ( var i = 0; i < length; i++ ) {
           result += characters.charAt(Math.floor(Math.random() * charactersLength));
        }
        return result;
     }
    async addFileToS3(pdfname, edited, accessType) {
        const { history, selectedTab } = this.props;
        const { docList, editedMetaDataDocObj,fileNameArray } = this.state;
        let documentId = (editedMetaDataDocObj && editedMetaDataDocObj.documentId);
        let bucketName = this.getBucketNameForUpload();
        let duplicateExists = false,
        duplicateFileName=false;

        let newPdf = (pdfname.substring(pdfname.length, pdfname.length - 4).toLowerCase() === '.pdf' ?
            pdfname.substring(0, pdfname.length - 4).trim() : pdfname.trim());
         let docTitle = newPdf; //when two videos are uploaded with same name, title will be same and file name will be added with some random code
                           
        if (newPdf !== "") {
            //checking for same file name
            for(let i=0 ; i < fileNameArray.length ;i++){
                if(fileNameArray[i] && fileNameArray[i].trim() === newPdf.trim() ){
                    duplicateFileName = true;
                }
            }
            if(duplicateFileName){
                newPdf = `${newPdf}_${this.getRandomString(2)}` ;
            }else{
                newPdf = newPdf.trim();
            }
//checking for same title
            for (let i = 0; i < docList.length; i++) {
                if (docList[i].metaData.title.trim() === docTitle.trim()) {
                    duplicateExists = true;
                    break;
                }
            }
            const uploadUrl = bucketName + '/' + this.getStorageURL(selectedTab) + newPdf;
            if (!duplicateExists) {

                this.state.file && SetS3Config(uploadUrl);
                if (this.state.file) {
                    Storage.put(newPdf + `.pdf`, this.state.file, {
                        contentType: this.state.file.type,
                    })
                        .then(async (res) => {
                            // call save metadata after success and await
                            // let accessType = 'IU'; // later replace with dropdown value from modal
                            let bucketUrl = bucketName + '/' + this.getStorageURL(selectedTab) + newPdf;
                            const saveMetaResp = await this.saveDocMetaData(newPdf, bucketUrl, accessType, docTitle, documentId, edited);

                            if (saveMetaResp) {
                                history.push('how-to-use');
                                this.fetchDocList();
                                if (edited) {
                                    this.modalCloseHandler();
                                    this.showNotification("success", "Document Edited successfully");
                                }
                                else {
                                    this.modalCloseHandler();
                                    this.showNotification("success", "Document uploaded successfully");
                                }
                            } else {
                               

                               const deleteUrl = bucketName + '/' + this.getStorageURL(selectedTab) + newPdf;
                            SetS3Config(deleteUrl);
                    
                            Storage.remove(newPdf + `.pdf`)
                            .then(res => {
                                this.showNotification("error", "Sorry, Client pdf cannot be updated");
                                history.push('how-to-use');
                            })
                            }

                        }).catch(e => {
                            this.showNotification("error", "Sorry, Client pdf cannot be updated");
                            history.push('how-to-use');
                        });
                } else {
                    this.modalCloseHandler();
                    history.push('how-to-use');
                }
            } else {
                this.modalCloseHandler();
                this.showNotification("error", "File not saved. File with same name already exists!");
            }
        }
        else {
            this.modalCloseHandler();
            this.showNotification("error", "File not saved. File name cannot be empty!");
        }
    }

    saveDocument = (pdfName, accessType) => {
        this.addFileToS3(pdfName, false, accessType);
    }

    saveDocMetaData = (fileName, bucketName, accessType, docTitle, docId, edited) => {
        const { howToUseStore } = this.props;
        let payload = "";
        if (edited) {
            payload = {
                "documentId": docId,
                "fileName": fileName,
                "accessType": accessType,
                "title": docTitle,
                "bucketUrl": bucketName,
                "documentType": 'pdf',

            }
        }
        else {
            payload = {
                "fileName": fileName,
                "accessType": accessType,
                "title": docTitle,
                "bucketUrl": bucketName,
                "documentType": 'pdf'
            }
        }

        return howToUseStore.uploadVedio(payload)
            .then(resp => {
                if (resp.data && resp.data.resultCode === 'OK') {
                    return true;
                } else {
                    return false;
                }
            })
    }

    prevClick = (id) => {
        const { docList } = this.state;
        const userType = SessionStorage.read("userType");
        let newID = id
        let test = docList;
        //let test3 = test.slice(0, 2)
        if ((userType === 'A' && newID <= 1) || userType !== 'A' && newID <= 2) {

        }
        else {
            this.setState({
                tempDocList: userType === 'A' ? test.slice(newID - 2, newID) : test.slice(newID - 3, newID)
            })
        }
    }

    nextClick = (id) => {
        const { docList } = this.state;
        const userType = SessionStorage.read("userType");
        let newID = id;
        let test2 = docList;
        if (newID >= docList.length - 1) {
        }
        else {
            this.setState({
                tempDocList: userType === 'A' ? test2.slice(newID, newID + 2) : test2.slice(newID - 1, newID + 2)
            });
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

    onChange(file) {
        this.setState({
            displayFile: URL.createObjectURL(file),
            file: file,
        });
    }

    openVideoModal = (e) => {
        this.setState({
            openVideoModal: true,
            openDocModal: false
        });
    }

    openDocModalHandler = (e) => {
        this.setState({
            openVideoModal: false,
            openDocModal: true
        });
    }

    modalCloseHandler = (e) => {
        this.setState({
            openVideoModal: false,
            openDocModal: false,
            editFile: null,
            editVideoName: null,
            editThumbnail: ''
        })
    }

    editDocument = (id, title, metaData, fileURL) => {

        this.setSelectedEditDocument(title, metaData, fileURL);
    }

    setSelectedEditDocument = (title, metaData, fileUrl) => {

        const bucketName = this.getBucketNameForUpload();
        // SetS3Config(bucketName);
        // Storage.get(fileUrl,{download: true ,customPrefix: {
        //     public:''
        //  }}).then(res => {
        // let blob = new Blob([res.Body], { type: res.ContentType });
        // var filetest = new File([blob], title, {type:"application/pdf"});
        this.setState({
            editFile: title,
            openVideoModal: false,
            openDocModal: true,
            // file: filetest,
            editedMetaDataDocObj: metaData
        })

        // }).catch(()=>console.log("Object retrival was a failure")) ;
    }
    async UpdateDocDetails(docName, accessType, editedMetaDataObj) {
        const { docList } = this.state;
        const { history } = this.props;
        let duplicateExists = false;
        for (let i = 0; i < docList.length; i++) {

            if (docList[i].metaData.title.trim() === docName.trim()) {
                duplicateExists = true;
                break;
            }
        }
        if (!duplicateExists ||  editedMetaDataObj.accessType !== accessType) {
            const saveMetaResp = await this.saveDocMetaData(editedMetaDataObj.fileName, editedMetaDataObj.bucketUrl, accessType, docName, editedMetaDataObj.documentId, true);
            if (saveMetaResp) {
                history.push('how-to-use');
                this.fetchDocList();
                this.modalCloseHandler();
                this.showNotification("success", "Document Edited successfully");

            } else {
                this.showNotification("error", "Sorry, Client pdf cannot be updated");
                history.push('how-to-use');
            }
        }
        else {
            this.showNotification("error", "File with same name already exists!");
            this.modalCloseHandler();
            history.push('how-to-use');
        }
    }
    deleteEditedDocument = (pdfname, edited, newDoc,accessType) => {
    
        let duplicateExists = false;
        const { docList } = this.state;
        for (let i = 0; i < docList.length; i++) {

            if ((docList[i].metaData.title).toLowerCase().trim() === newDoc.toLowerCase().trim()) {
                duplicateExists = true;
                break;
            }
        }
        if (!duplicateExists) {
            this.deleteUpdateDocumentFromS3(pdfname, edited, newDoc,accessType);
            this.setState({
                isDocinStore: false
            })
        } else {
            this.showNotification("error", "File with same name already exists!");
            this.setState({
                isDocinStore: true
            })
        }
    }


    deleteDocument = (id, title, metaData) => {
        this.setState({
            deleteDocument: true,
            deleteDocumentTitle: 'Are you sure you want to delete this file?',
            deleteTitle: title,
            deleteMetadataObj: metaData
        });
    }


    deleteDocumentConfirm = (isYesClicked) => {
        if (isYesClicked) {
            this.setState({
                deleteDocument: false,
                deleteDocumentTitle: '',
                pdfLoading: true,
            });
            this.deleteDocumentFromS3(this.state.deleteMetadataObj.fileName, false);
        }
        else {
            this.setState({
                deleteDocument: false,
                deleteDocumentTitle: '',
                deleteTitle: '',
                pdfLoading: false,
            });
        }
    }

    async downloadDocument(fileURL, fileName,title) {
        const bucketName = this.getBucketNameForUpload();
        SetS3Config(bucketName);
        return Storage.get(fileURL, {
            download: true, customPrefix: {
                public: ''
            }
        }).then(res => this.downloadBlob(res, fileName,title));
        // s3.getObject({ Bucket: this.getBucketNameForUpload(), Key: fileURL }, function (
        //     error,
        //     data
        // ) {
        //     if (error != null) {
        //         console.log("Object retrival was a failure");
        //     } else {
        //         let blob = new Blob([data.Body], { type: data.ContentType });
        //         let link = document.createElement("a");
        //         link.href = window.URL.createObjectURL(blob);
        //         link.download = fileName;
        //         link.click();
        //     }
        // });
    }

    downloadBlob(res, filename,title) {
        let blob = new Blob([res.Body], { type: res.ContentType });
        let link = document.createElement("a");
        link.href = window.URL.createObjectURL(blob);
        link.download = title;
        link.click();
    }

    render() {
        //let option = SessionStorage.read('option_selected');
        const { tempDocList, docList, pdfLoading } = this.state;
        const { selectedTab } = this.props;
        const prefixDocPath = this.getStorageURL(selectedTab);
        const userType = SessionStorage.read("userType");
        const docPath = this.getBucketName();
        return (
            <Fragment>
                <div className="pdf-htu-main" id="pdf_react">
                    <div className="row no-gutters upload-div">
                        {userType === 'A' ?
                            <div className="htu-tabs-icon">
                                <img src={uploadIco} alt="upload" className="upload-icon"
                                    onClick={userType === 'A' ? () => { this.openDocModalHandler() } : () => { }}
                                    data-tip="" data-for="upload_tt" data-place="left"
                                />
                                <ReactTooltip id="upload_tt" >
                                    <span>Upload</span>
                                </ReactTooltip>
                            </div> : ''}
                    </div>
                    {pdfLoading ?
                        <div className="row justify-content-center video-spinner spinner-div">
                            <i className="fa fa-spinner fa-spin" style={{ height: "min-content", fontSize: '25px', color: '#ffffff' }}></i>
                        </div>
                        :
                        <div className="row">
                            {tempDocList && tempDocList.map((data, index) => (
                                <div className="pdfInfo col-sm-4 pdfContent" id={`pdfInfo_${index}`} key={`pdfInfoKey_${index}`}>
                                    <div className="pdf-img-div">
                                        <a
                                            target="_blank" rel="noopener noreferrer"
                                            href={`${docPath}/${prefixDocPath}${tempDocList[index].metaData.fileName}/public/${tempDocList[index].metaData.fileName}.pdf`} >
                                            <img src={pdf} alt="pdf" />
                                        </a>
                                    </div>
                                    <div className="pdfText">
                                        <a rel="noopener noreferrer"
                                            data-tip="" data-for={`pdfTtext_${tempDocList[index].metaData.title}`} data-place="left" data-type="dark" target="_blank"
                                            href={`${docPath}/${prefixDocPath}${tempDocList[index].metaData.fileName}/public/${tempDocList[index].metaData.fileName}.pdf`} >
                                            {tempDocList[index].metaData.title && tempDocList[index].metaData.title.length > 24 ?
                                                (tempDocList[index].metaData.title).substr(0, 21) + "..." :
                                                tempDocList[index].metaData.title
                                            }
                                        </a>
                                        {tempDocList[index].metaData.title && tempDocList[index].metaData.title.length > 24 ?
                                            <ReactTooltip id={`pdfTtext_${tempDocList[index].metaData.title}`}>{tempDocList[index].metaData.title}</ReactTooltip>
                                            : ''}
                                        <div className="row" style={{ paddingTop: '7px' }}>


                                            <img src={downloadIco} style={{ marginLeft: '16px', cursor: 'pointer' }} alt="pdf"
                                                data-tip="" data-for={`pdfDownload_${tempDocList[index].metaData.title}`} data-place="bottom" data-type="dark"
                                                onClick={() => { this.downloadDocument(`${prefixDocPath}${tempDocList[index].metaData.fileName}/public/${tempDocList[index].metaData.fileName}.pdf`, tempDocList[index].metaData.fileName,tempDocList[index].metaData.title) }}
                                            />

                                            <ReactTooltip id={`pdfDownload_${tempDocList[index].metaData.title}`}>Download</ReactTooltip>

                                            <img
                                                data-tip="" data-for={`pdfEdit_${tempDocList[index].metaData.title}`} data-place="bottom" data-type="dark"
                                                src={editIcon} hidden={userType === 'A' ? false : true}
                                                style={{ marginLeft: '12px', cursor: 'pointer' }}
                                                alt="edit" id={`edit_${tempDocList[index].metaData.title}`}
                                                onClick={() => {
                                                    this.editDocument(tempDocList[index].id, tempDocList[index].metaData.title, tempDocList[index].metaData,
                                                        `${prefixDocPath}${tempDocList[index].metaData.fileName}/public/${tempDocList[index].metaData.fileName}.pdf`)
                                                }} />
                                            <ReactTooltip id={`pdfEdit_${tempDocList[index].metaData.title}`}>Edit</ReactTooltip>

                                            <img
                                                data-tip="" data-for={`pdfDelete_${tempDocList[index].metaData.title}`} data-place="bottom" data-type="dark"
                                                src={deleteIco} hidden={userType === 'A' ? false : true}
                                                style={{ marginLeft: '12px', cursor: 'pointer' }}
                                                alt="delete" id={`delete_${tempDocList[index].metaData.title}`}
                                                onClick={() => { this.deleteDocument(tempDocList[index].id, tempDocList[index].metaData.title, tempDocList[index].metaData) }} />
                                            <ReactTooltip id={`pdfDelete_${tempDocList[index].metaData.title}`}>Delete</ReactTooltip>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    }
                </div>


                {this.state.openDocModal ?
                    <DocUploadModal
                        modalCloseHandler={this.modalCloseHandler}
                        fileName={this.state.file}
                        saveDocument={this.saveDocument}
                        editFile={this.state.editFile}
                        deleteDocumentFromS3={this.deleteEditedDocument}
                        //resetFile={this.resetFile}
                        displayFile={this.state.displayFile}
                        //resetFileName={this.resetFileName}
                        UpdateDocDetails={this.UpdateDocDetails}
                        onChange={this.onChange}
                        isDocinStore={this.state.isDocinStore}
                        editedMetaDataDocObj={this.state.editedMetaDataDocObj}

                    /> : ""

                }

                {this.state.deleteDocument ?
                    <CustomConfirmModal
                        ownClassName={'doc-delete-modal'}
                        isModalVisible={this.state.deleteDocument}
                        modalTitle={this.state.deleteDocumentTitle}
                        closeConfirmModal={this.deleteDocumentConfirm}
                    /> : ''
                }


            </Fragment>



        )
    }
}

export default withRouter(PdfHowToUse);
