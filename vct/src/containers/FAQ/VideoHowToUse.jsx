import React, { Component, Fragment } from 'react';
import { observer, inject } from 'mobx-react'
import { withRouter } from "react-router-dom";
import * as _ from "lodash";
import './FAQHome.css';
import details from '../../assets/HowToUse/details.svg';
import intro from '../../assets/HowToUse/introVideo.svg';
import play from '../../assets/HowToUse/play.svg';
import pdf from '../../assets/HowToUse/pdf.svg';
import close from '../../assets/menu/close.svg';
import comingSoon from '../../assets/HowToUse/comingsoon.svg';
import uploadLogoIco from "../../assets/newDealsIcons/uploadLogo.svg";
import uploadIco from "../../assets/project/fvdt/upload.svg";
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
class VideoHowToUse extends Component {
    constructor(props) {
        super(props);
        this.state = {
            openVideoModal: false,
            openDocModal: false,
            file: null,
            videoFile: null,
            displayVideoFile: null,
            prevVideoFile: null,
            prevVideoThumbnail: '',
            isPrevVideoLoading: false,

            listVideos: [],
            listVideosDisplay: [],
            editVideoName: '',
            editThumbnail: '',
            deleteVideoThumbnail: false,
            deleteVideoTitle: '',
            deleteVideoMetaObj: '',
            isVideoLoading: false,
            selectedThumbnail: '',
            isVideoinStore: false,
            fileNameArray: [],
            downloadPending: false,
            selectedDocId:""

        };

        this.redirectHandler = this.redirectHandler.bind(this);

        this.closeVideoIntro = this.closeVideoIntro.bind(this);
        this.openVideoDetails = this.openVideoDetails.bind(this);


        this.onVideoChange = this.onVideoChange.bind(this);
        //this.resetFile=this.resetFile.bind(this);
        this.getBucketName = this.getBucketName.bind(this);
        // this.saveVideo = this.saveVideo.bind(this);

    }

    componentDidMount() {
        // this.fetchDocList();
        // this.fetchVedioList();
        SessionStorage.write('tenantId', null)
        this.getVideosAndThumbnails();
        // this.listFiles();
    }

    componentDidUpdate() {
        //const {tempDocList} = this.state;
    }
    //     fetchVedioList() {
    //         const { howToUseStore } = this.props;
    //         howToUseStore.getVedioList()
    //         .then((res)=>{
    //            vediosArray = res.data.resultObj;
    //  console.log(res)
    //         })
    //     }

    getVideosAndThumbnails = async () => {
        const { howToUseStore } = this.props;

        let vediosArray = [];
        let allObjArray = [];
        this.setState({
            isVideoLoading: true,
        })

        howToUseStore.getVedioList()
            .then((res) => {
                if (res.data.resultCode === "OK") {
                    allObjArray = res.data.resultObj;
                    if (allObjArray) {
                        for (let i = 0; i < allObjArray.length; i++) {
                            if (allObjArray[i].documentType !== "pdf") {
                                vediosArray.push(allObjArray[i]);
                            }
                        }
                    }
                    this.getVediosFromS3(vediosArray)
                }
                else {
                    this.showNotification("apiError", (res.data.errorDescription !== "" ? res.data.errorDescription : "Something went wrong."));
                }

            })




    }
    async getVediosFromS3(vediosArray) {
        let publicUrlCount = 0,
            listVideos = [];
        let fileNamesArr = [];
        const userType = SessionStorage.read("userType");
        const bucketName = this.getBucketNameForUpload();
        SetS3Config(bucketName);
        const files = await Storage.list('vroimages/vrovideos/', {
            customPrefix: {
                public: ''
            }
        });
        for (let i = 0; i < files.length; i++) {
            let video = files[i].key;
            let vedioName = (video.substring(0, video.length - 4)).split('/public/')[1]
            let matchedVideoObj = (vediosArray && _.find(vediosArray, { fileName: vedioName }));
            fileNamesArr.push(matchedVideoObj && matchedVideoObj.fileName)
            if ((video.indexOf('public/') > 0) && (matchedVideoObj)) {
                publicUrlCount++
                listVideos.push({
                    id: publicUrlCount - 1,
                    title: video.split('/public/')[1],
                    metaData: matchedVideoObj,
                    // documentId: matchedVideoObj.documentId,
                    // fileName: matchedVideoObj.fileName,

                });
            }
        }
        let sortedListVideos = this.props.sortNamesList(listVideos, 'asc');
        this.setState({
            listVideos: sortedListVideos,
            listVideosDisplay: [...sortedListVideos],
            isVideoLoading: false,
            fileNameArray: fileNamesArr
        });
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

    /* video carousel start*/
    videosPrevClick = (id) => {
        const { listVideos } = this.state;
        const userType = SessionStorage.read("userType");
        let newID = id
        let test = listVideos;
        //let test3 = test.slice(0, 2)
        if ((userType === 'A' && newID <= 1) || (userType !== 'A' && newID <= 2)) {

        }
        else {
            this.setState({
                listVideosDisplay: userType === 'A' ? test.slice(newID - 2, newID) : test.slice(newID - 3, newID)
            })
        }
    }

    videosNextClick = (id) => {
        const { listVideos } = this.state;
        const userType = SessionStorage.read("userType");
        let newID = id;
        let test2 = listVideos;
        if (newID >= listVideos.length - 1) {
        }
        else {
            this.setState({
                listVideosDisplay: userType === 'A' ? test2.slice(newID, newID + 2) : test2.slice(newID - 1, newID + 2)
            });
        }
    }
    /* video carousel end*/
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
            case 'apiError':
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

    onVideoChange(file) {
        this.setState({
            displayVideoFile: URL.createObjectURL(file),
            videoFile: file,
        });
    }

    openVideoModalHandler = (e) => {
        this.setState({
            openVideoModal: true,
            openDocModal: false,
            displayVideoFile: null,
            editVideoName: '',
            editThumbnail: ''

        });
    }

    openDocModal = (e) => {
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

    deleteVideo = (videoMetaObj, title) => {
        this.setState({
            deleteVideoThumbnail: true,
            deleteVideoTitle: 'Are you sure you want to delete this video?',
            deleteVideoName: title,
            deleteVideoMetaObj: videoMetaObj
        });
    }

    deleteVideoThumbnailConfirm = (isYesClicked) => {
        if (isYesClicked) {
            this.setState({
                deleteVideoThumbnail: false,
                deleteVideoTitle: '',
                isVideoLoading: true,
            });
            this.deleteVideoFromS3(this.state.deleteVideoMetaObj, false);
        }
        else {
            this.setState({
                deleteVideoThumbnail: false,
                deleteVideoTitle: '',
                deleteVideoName: '',
                isVideoLoading: false,
                deleteVideoMetaObj: ''
            });
        }
    }

    closeVideoIntro = (event) => {
        var video = document.getElementById("myVideo");
        video.pause();
        video.currentTime = 0;

        this.setState({
            selectedThumbnail: ''
        }, () => {

            // document.getElementById("rightTextDiv").style.filter = "blur(0px)";
            // document.getElementById("leftTextDiv").style.filter = "blur(0px)";
            ReactTooltip.rebuild();
        });

    }
    openVideoDetails = (event) => {
        let id = event.currentTarget.id;
        let id_with_plus = id.split(' ').join('+');
        this.setState({
            selectedThumbnail: id_with_plus
        }, () => {
            var video = document.getElementById('myVideo');
            video.play();
            // document.getElementById("videoDynamicIntro").style.display = "block";
            // document.getElementById("rightTextDiv").style.filter = "blur(2px)";
            // document.getElementById("leftTextDiv").style.filter = "blur(2px)";
        });
        // let sourceEle = document.getElementById('webm');
        // sourceEle.src = `${this.getBucketName()}/vroimages/vrovideos/${id}/public/${id}.mp4`;

        // document.getElementById("videoStatic").style.display = "block";

    }

    getVideofromS3(name) {
        const bucketName = this.getBucketNameForUpload();
        const videoUrl = `vroimages/vrovideos/${name}/public/${name}.mp4`;
        SetS3Config(bucketName);
        return Storage.get(videoUrl);
        document.getElementById("leftTextDiv").style.filter = "blur(2px)";

    }

    redirectHandler(type) {
        const { history } = this.props;
        // eslint-disable-next-line default-case
        switch (type) {
            case 'home':
                history.push('/home');
                break;
            case 'sales':
                history.push('/sales-home');
                break;
            case 'delivery':
                history.push('/delivery');
                break;
        }
    }

    /* Video handlers */

    editVideoFile = (id, metaDataObj, editThumbnail) => {
        this.setState({
            editVideoName: metaDataObj.title,
            // openVideoModal: true,
            editedMetaDataObj: metaDataObj,
            openDocModal: false,
            editThumbnail: editThumbnail,
            isPrevVideoLoading: true
        }, () => {
            this.getPrevVideoFile(this.state.editVideoName, metaDataObj);
        });
    }
    getPrevVideoFile = async (videoName, metaDataObj) => {
        let tempVar = this;
        const fileUrl = `vroimages/vrovideos/${metaDataObj.fileName}/public/${metaDataObj.fileName}.mp4`;
        const thumbnailURL = `vroimages/vrovideo-thumbnails/${metaDataObj.fileName}/public/${metaDataObj.fileName}.png`;
        const bucketName = this.getBucketNameForUpload();

        Storage.get(thumbnailURL, {
            download: true, customPrefix: {
                public: ''
            }
        }).then(res => {
            let blob = new Blob([res.Body], { type: res.ContentType });
            var filetest = new File([blob], videoName, { type: "image/png" });
            tempVar.setState({
                openVideoModal: true,
                prevVideoThumbnail: filetest,
                isPrevVideoLoading: true
            });
        }).catch(() => console.log(""));
    }
    UpdateVedioDetails = (docName, accessType, editedMetaDataObj, file) => {
        const { listVideosDisplay } = this.state;
        let duplicateExists = false;
        for (let i = 0; i < listVideosDisplay.length; i++) {

            if (listVideosDisplay[i].metaData.title.trim() === docName.trim()) {
                duplicateExists = true;
                break;
            }
        }

        if (!duplicateExists || editedMetaDataObj.accessType !== accessType) {
            let saveObj = {
                "docName": docName,
                "documentId": editedMetaDataObj.documentId,
                "bucketName": editedMetaDataObj.bucketUrl,
                "accessType": accessType,
                "fileName": editedMetaDataObj.fileName,
                "documentType": editedMetaDataObj.documentType,
                "edited": true


            }
            this.saveVedioToDb(saveObj)
        }
        else {
            this.showNotification("error", "File with same name already exists!");
            this.modalCloseHandler()
        }
    }
    // saveVideo = (documentName, file, thumbnail, edited, accessType) => {
    //     return this.saveVideoToS3(documentName, file, thumbnail, false, accessType)
    // }
    getRandomString = (length) => {
        var result = '';
        var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        var charactersLength = characters.length;
        for (var i = 0; i < length; i++) {
            result += characters.charAt(Math.floor(Math.random() * charactersLength));
        }
        return result;
    }

    saveVideoToS3 = (docmntName, file, thumbnail, edited, accessType) => {
        const { history } = this.props;
        const { listVideos, editedMetaDataObj, fileNameArray } = this.state;
        let duplicateExists = false;
        let duplicateFileName = false;
        const bucketName = this.getBucketNameForUpload();
        let documentName = docmntName.trim();
        let fileName = "";
        if (documentName !== '') {
            let docName;
            if (documentName && documentName.length > 4) {
                docName = ((documentName.substring(documentName.length, documentName.length - 4).toLowerCase() === '.mp4' ||
                    documentName.substring(documentName.length, documentName.length - 4).toLowerCase() === '.flv')
                    ? documentName.substring(0, documentName.length - 4) : documentName);
            } else {
                docName = documentName;
            }
            for (let i = 0; i < fileNameArray.length; i++) {
                if (fileNameArray[i] && fileNameArray[i].trim() === docName.trim()) {
                    duplicateFileName = true
                }
            }
            if (duplicateFileName) {
                fileName = `${docName}_${this.getRandomString(2)}`;
            } else {
                fileName = docName.trim();
            }


            for (let i = 0; i < listVideos.length; i++) {

                if ((listVideos[i].metaData.title).toLowerCase().trim() === docName.toLowerCase().trim()) {
                    duplicateExists = true;
                    break;
                }
            }

            const uploadThumbnailUrl = bucketName + '/vroimages/vrovideo-thumbnails/' + fileName;
            const uploadVideoUrl = bucketName + '/vroimages/vrovideos/' + fileName;
            if (!duplicateExists) {
                file && SetS3Config(uploadVideoUrl);
                if (file) {
                    file && Storage.put(fileName + `.mp4`, file, {
                        contentType: file.type,
                    })
                        .then(res => {

                            documentName && SetS3Config(uploadThumbnailUrl);
                            Storage.put(fileName + `.png`, thumbnail, {
                                contentType: thumbnail.type,
                            })
                                .then(res => {

                                    let saveObj = {
                                        "docName": docName,
                                        "bucketName": (bucketName + '/vroimages/vrovideos/' + fileName + '/public/' + fileName + ".mp4"),
                                        "file": file,
                                        "accessType": accessType,
                                        "fileName": fileName,
                                        "edited": edited,
                                        "documentId": (editedMetaDataObj ? (editedMetaDataObj.documentId) : ""),
                                        "documentType": (editedMetaDataObj ? editedMetaDataObj.documentType : "")


                                    }
                                    this.saveVedioToDb(saveObj)


                                }).catch(e => {

                                    this.showNotification("error", "Sorry, Client video cannot be updated");
                                    history.push('how-to-use');
                                });
                        }).catch(e => {

                            this.showNotification("error", "Sorry, Client video cannot be updated");
                            history.push('how-to-use');
                        });
                } else {
                    this.modalCloseHandler();
                    history.push('how-to-use');
                }
            } else {
                this.modalCloseHandler();
                this.showNotification("error", "Video not saved. Video with same name already exists!");
            }
        } else {
            this.modalCloseHandler();
            this.showNotification("error", "Video not saved. Video name cannot be empty!");
        }
    }
    saveVedioToDb = (saveObj) => {
        const { howToUseStore, history } = this.props;
        const { editedMetaDataObj } = this.state;
        const bucketName = this.getBucketNameForUpload();
        let payload = {};
        if (saveObj.edited) {
            payload = {
                "documentId": saveObj.documentId,
                "title": saveObj.docName,
                "fileName": saveObj.fileName,
                "accessType": saveObj.accessType,
                "bucketUrl": saveObj.bucketName,
                "documentType": saveObj.documentType
            }
        }
        else {
            payload = {
                "title": saveObj.docName,
                "fileName": saveObj.fileName,
                "accessType": saveObj.accessType,
                "bucketUrl": saveObj.bucketName,
                "documentType": saveObj.file.type.split('/')[1]  //"video/mp4" 
            }
        }
        howToUseStore.uploadVedio(payload)
            .then((res) => {
                if (res.data.resultCode === "OK") {
                    this.getVideosAndThumbnails();
                    if (saveObj.edited) {
                        this.modalCloseHandler();
                        this.showNotification("success", "Video Edited successfully");
                    } else {
                        this.modalCloseHandler();
                        this.showNotification("success", "Video uploaded successfully");
                    }
                }
                else {
                    this.modalCloseHandler();
                    this.showNotification("apiError", (res.data.errorDescription !== "" ? res.data.errorDescription : "Something went wrong.Please try again!"));
                    //remove vedio from s3 only when vedio is updated//
                    if (saveObj.fileName !== editedMetaDataObj.fileName) {
                        let deleteFileName = saveObj.fileName
                        const deleteThumbnailUrl = bucketName + '/vroimages/vrovideo-thumbnails/' + deleteFileName;
                        const deleteVideoUrl = bucketName + '/vroimages/vrovideos/' + deleteFileName;
                        SetS3Config(deleteVideoUrl);

                        Storage.remove(deleteFileName + `.mp4`)
                            .then(res => {
                                SetS3Config(deleteThumbnailUrl);
                                Storage.remove(deleteFileName + '.png')
                                    .then(res => {
                                        history.push('how-to-use');
                                    }).catch(e => { history.push('how-to-use'); });
                            }).catch(e => { history.push('how-to-use'); });
                    }


                }
            })
    }
    // removeMp4 = (name) => {
    //     if(name.split(".")) === ".mp4"){
    //       return  name.substring(0, videoName.length - 4)
    //     }
    // }
    deletePrevVideo = (editFile, editThumbnail, edited, docName, newfile, newthumbNailBlob, accessType) => {

        let duplicateExists = false;
        const { listVideos } = this.state;
        for (let i = 0; i < listVideos.length; i++) {

            if ((listVideos[i].title.substring(0, listVideos[i].title.length - 4)).toLowerCase() === docName.toLowerCase()) {
                duplicateExists = true;
                break;
            }
        }
        if (!duplicateExists) {
            if (edited) {
                this.deleteUpdateVideoFromS3(editFile, edited, editThumbnail, docName, newfile, newthumbNailBlob, accessType)
            }
            else {
                this.deleteVideoFromS3(editFile, edited, editThumbnail, docName, newfile, newthumbNailBlob);
            }
            this.setState({
                isVideoinStore: false
            })
        } else {
            this.showNotification("error", "Video with same name already exists!");
            this.setState({
                openVideoModal: true,
                isVideoinStore: true
            });
        }
    }

    deleteVideoFromS3(deleteVideoMetaObj, edited, editThumbnail, docName, newfile, newthumbNailBlob) {
        const { history, howToUseStore } = this.props;
        let bucketName = this.getBucketNameForUpload();
        let prevName = deleteVideoMetaObj.title;
        let deleteFileName = deleteVideoMetaObj.fileName;
        let deleteDocId = deleteVideoMetaObj.documentId;

        // commenting below code where '.mp4/.flv' is removed before forming s3 url'

        // newprevName = ((prevName.substring(prevName.length, prevName.length - 4).toLowerCase() === '.mp4' ||
        //     prevName.substring(prevName.length, prevName.length - 4).toLowerCase() === '.flv')
        //     ? prevName.substring(0, prevName.length - 4) : prevName);

        howToUseStore.deleteFileMetaData(deleteDocId)
            .then((res) => {
                if (res.data && res.data.resultCode == 'OK') {
                    const deleteThumbnailUrl = bucketName + '/vroimages/vrovideo-thumbnails/' + deleteFileName;
                    const deleteVideoUrl = bucketName + '/vroimages/vrovideos/' + deleteFileName;
                    SetS3Config(deleteVideoUrl);

                    Storage.remove(deleteFileName + `.mp4`)
                        .then(res => {
                            SetS3Config(deleteThumbnailUrl);
                            Storage.remove(deleteFileName + '.png')
                                .then(res => {
                                    history.push('how-to-use');
                                    this.getVideosAndThumbnails();
                                    this.showNotification("success", "Video Deleted successfully");
                                }).catch(e => {
                                    this.showNotification("error", "Sorry, Client video cannot be deleted");
                                    history.push('how-to-use');
                                });
                        }).catch(e => {
                            this.showNotification("error", "Sorry, Client video cannot be deleted");
                            history.push('how-to-use');
                        });
                } else {
                    this.showNotification("error", "Sorry, Client video cannot be deleted");
                }

            })


    }
    async downloadDocument(fileURL, title,docId) {
        const bucketName = this.getBucketNameForUpload();
        this.setState({ downloadPending: true,selectedDocId:docId })
        SetS3Config(bucketName);
        return Storage.get(fileURL, {
            download: true, customPrefix: {
                public: ''
            }
        }).then(res =>
            this.downloadBlob(res, title)
        )
            .catch(error => {
                console.log(error);
                this.setState({ downloadPending: false })

            });
    }

    downloadBlob(res, title) {
        let blob = new Blob([res.Body], { type: res.ContentType });
        let link = document.createElement("a");
        link.href = window.URL.createObjectURL(blob);
        link.download = title;
        link.click();
        this.setState({ downloadPending: false })
    }
    deleteUpdateVideoFromS3 = (deleteVideoMetaObj, edited, editThumbnail, docName, newfile, newthumbNailBlob, accessType) => {
        const { history, howToUseStore } = this.props;
        let bucketName = this.getBucketNameForUpload();
        let prevName = deleteVideoMetaObj.title;
        let deleteFileName = deleteVideoMetaObj.fileName;
        let deleteDocId = deleteVideoMetaObj.documentId;

        const deleteThumbnailUrl = bucketName + '/vroimages/vrovideo-thumbnails/' + deleteFileName;
        const deleteVideoUrl = bucketName + '/vroimages/vrovideos/' + deleteFileName;
        SetS3Config(deleteVideoUrl);

        Storage.remove(deleteFileName + `.mp4`)
            .then(res => {
                SetS3Config(deleteThumbnailUrl);
                Storage.remove(deleteFileName + '.png')
                    .then(res => {
                        history.push('how-to-use');
                        // if (edited) {
                        let newName = (docName && docName.substring(docName.length, docName.length - 4).toLowerCase() === ('.mp4' || '.flv') ?
                            docName.substring(0, docName.length - 4) : docName);
                        this.saveVideoToS3(newName, (newfile !== undefined ? newfile : this.state.prevVideoFile), (newthumbNailBlob !== "" ? newthumbNailBlob : this.state.prevVideoThumbnail), true, accessType);
                        // }

                    }).catch(e => {
                        this.showNotification("error", "Sorry, Client video cannot be deleted");
                        history.push('how-to-use');
                    });
            }).catch(e => {
                this.showNotification("error", "Sorry, Client video cannot be deleted");
                history.push('how-to-use');
            });
    }
    /* video handlers end */

    render() {
        //let option = SessionStorage.read('option_selected');
        const { listVideos, listVideosDisplay, isVideoLoading, selectedThumbnail, isPrevVideoLoading, downloadPending,selectedDocId } = this.state;

        const userType = SessionStorage.read("userType");

        return (
            <Fragment>

                <div className="video-htu-main" id="video-react">
                    <div className="row no-gutters upload-div">
                        {userType === 'A' ?
                            <div className="htu-tabs-icon">
                                <img src={uploadIco} alt="upload" className="upload-icon"
                                    onClick={userType === 'A' ? () => { this.openVideoModalHandler() } : () => { }}
                                    data-tip="" data-for="upload_tt" data-place="left"
                                />
                                <ReactTooltip id="upload_tt" >
                                    <span>Upload</span>
                                </ReactTooltip>
                            </div> : ''}
                    </div>
                    {isVideoLoading ?
                        <div className="row justify-content-center video-spinner spinner-div">
                            <i className="fa fa-spinner fa-spin" style={{ height: "min-content", fontSize: '25px', color: '#ffffff' }}></i>
                        </div>
                        :
                        <div className="row" id="video-main-div">
                            {listVideosDisplay && listVideosDisplay.map((data, index) => (

                                <div key={`vid-col-${index}`} className="videoStaticDiv col-sm-4"
                                    style={{ cursor: 'pointer' }} key={`video_${index}`} id={`video_${index}`}>
                                    <div className="video-thumbnail-div"
                                        //  id={`${data.title.split('.')[0]}`}
                                        id={data.metaData.title}
                                        style={{
                                            // backgroundImage: `url(${this.getBucketName()}/vroimages/vrovideo-thumbnails/${((data.title.substring(0, data.title.length - 4)).split(' ').join('+'))}/public/${((data.title.substring(0, data.title.length - 4)).split(' ').join('+'))}.png)`,
                                            backgroundImage: `url(${this.getBucketName()}/vroimages/vrovideo-thumbnails/${((data.metaData.fileName).split(' ').join('+'))}/public/${((data.metaData.fileName).split(' ').join('+'))}.png)`,
                                            backgroundSize: "cover"
                                        }}
                                    >
                                        <div className="videoStaticImg" style={{ cursor: isPrevVideoLoading ? 'progress' : 'default' }}>
                                            <span>
                                                <img src={downloadIco} alt="video"
                                                    name={`${data.metaData.fileName}`}
                                                    id={`${((data.metaData.fileName).split(' ').join('+'))}`}
                                                    onClick={downloadPending && (selectedDocId===data.metaData.documentId) ? () => { } : () => { this.downloadDocument(`vroimages/vrovideos/${((data.metaData.fileName))}/public/${((data.metaData.fileName))}.mp4`, data.metaData.title,data.metaData.documentId) }}
                                                    style={{
                                                        width: "25px",
                                                        opacity: (downloadPending && (selectedDocId===data.metaData.documentId) ? "0.5" : "unset"),
                                                        cursor: (downloadPending && (selectedDocId===data.metaData.documentId) ? "default" :"pointer" ),
                                                    }}
                                                    data-tip='' data-for={`video_type_2_download_${index}`} data-type="dark"
                                                />
                                                {downloadPending && (selectedDocId===data.metaData.documentId)?
                                                    <i className="fa fa-spinner fa-spin" style={{ color: '#ffffff', position: "absolute", margin: "5px 0px 0px -22px", cursor: "default" }}></i>
                                                    : ""}
                                                <ReactTooltip id={`video_type_2_download_${index}`}>Download</ReactTooltip>
                                            </span>
                                            <span>
                                                <img src={play} alt="video"
                                                    //  name={`${data.title.split('.')[0]}`} 
                                                    //  id={`${((data.title.substring(0, data.title.length - 4)).split(' ').join('+'))}`}
                                                    name={`${data.metaData.fileName}`}
                                                    id={`${((data.metaData.fileName).split(' ').join('+'))}`}
                                                    onClick={this.openVideoDetails} style={{ marginLeft: '12px', width: "20px" }}
                                                    data-tip='' data-for={`video_type_2_play_${index}`} data-type="dark"
                                                />
                                                <ReactTooltip id={`video_type_2_play_${index}`}>Play</ReactTooltip>
                                            </span>
                                            <span>
                                                <img
                                                    data-tip='' data-for={`video_type_2_edit_${index}`} data-type="dark"
                                                    src={editIcon} hidden={userType === 'A' ? false : true}
                                                    style={{ marginLeft: '12px', width: "20px" }}
                                                    alt="edit"
                                                    // id={`edit_${listVideosDisplay[index].title}`}
                                                    id={`edit_${listVideosDisplay[index].metaData.title}`}
                                                    // onClick={() => { this.editVideoFile(listVideosDisplay[index].id, listVideosDisplay[index].title, `${this.getBucketName()}/vroimages/vrovideo-thumbnails/${((data.title.substring(0, data.title.length - 4)).split(' ').join('+'))}/public/${((data.title.substring(0, data.title.length - 4)).split(' ').join('+'))}.png`) }}
                                                    onClick={() => { this.editVideoFile(listVideosDisplay[index].id, listVideosDisplay[index].metaData, `${this.getBucketName()}/vroimages/vrovideo-thumbnails/${((data.metaData.fileName).split(' ').join('+'))}/public/${((data.metaData.fileName).split(' ').join('+'))}.png`) }}

                                                />
                                                <ReactTooltip id={`video_type_2_edit_${index}`}>Edit</ReactTooltip>
                                            </span>
                                            <span>
                                                <img
                                                    data-tip='' data-for={`video_type_2_delete_${index}`} data-type="dark"
                                                    src={deleteIco} hidden={userType === 'A' ? false : true}
                                                    style={{ marginLeft: '12px', width: "20px" }}
                                                    alt="delete"
                                                    // id={`delete_${listVideosDisplay[index].title}`}
                                                    // onClick={() => { this.deleteVideo(listVideosDisplay[index].id, listVideosDisplay[index].title) }}
                                                    id={`delete_${listVideosDisplay[index].metaData.title}`}
                                                    onClick={() => { this.deleteVideo(data.metaData, listVideosDisplay[index].metaData.title) }}
                                                />
                                                <ReactTooltip id={`video_type_2_delete_${index}`}>Delete</ReactTooltip>
                                            </span>
                                        </div>
                                    </div>
                                    <div className="intro">
                                        {/* <span>{`${data.title.substring(0, data.title.length - 4)}`}</span> */}
                                        <span>{`${data.metaData.title}`}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    }
                </div>

                {this.state.openVideoModal ?
                    <VideoUploadModal
                        modalCloseHandler={this.modalCloseHandler}
                        fileName={this.state.videoFile}
                        editedMetaDataObj={this.state.editedMetaDataObj}
                        editFile={this.state.editVideoName}
                        editThumbnail={this.state.editThumbnail}
                        displayFile={this.state.displayVideoFile}
                        UpdateVedioDetails={this.UpdateVedioDetails}
                        onChange={this.onVideoChange}
                        saveVideo={this.saveVideoToS3}
                        deleteEditedVideo={this.deletePrevVideo}
                        isVideoinStore={this.state.isVideoinStore}
                    /> : ""

                }

                {this.state.deleteVideoThumbnail ?
                    <CustomConfirmModal
                        ownClassName={'video-delete-modal'}
                        isModalVisible={this.state.deleteVideoThumbnail}
                        modalTitle={this.state.deleteVideoTitle}
                        closeConfirmModal={this.deleteVideoThumbnailConfirm}
                    /> : ''
                }
                {selectedThumbnail.length > 0 ?
                    <VideoPlayModal
                        getBucketName={this.getBucketName}
                        selectedThumbnail={selectedThumbnail}
                        closeVideoIntro={this.closeVideoIntro}
                    >

                    </VideoPlayModal> : ''
                }

            </Fragment>



        )
    }
}

export default withRouter(VideoHowToUse);
