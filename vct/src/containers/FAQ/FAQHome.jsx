import React, { Component, Fragment } from 'react';
import { withRouter } from "react-router-dom";
import './FAQHome.css';
import NotificationMessage from '../../components/NotificationMessage/NotificationMessage';
import { toast } from 'react-toastify';
import bell from '../../assets/Contacts/bell.svg';
//import { Player, BigPlayButton, LoadingSpinner } from 'video-react';
// import Poster from '../../assets/contact_us.jpg';
import Menu from '../../components/Menu/Menu';

import PdfHowToUse from './PdfHowToUse';
import VideoHowToUse from './VideoHowToUse';
var SessionStorage = require('store/storages/sessionStorage');

// var aws = require('aws-sdk');
// var s3 = new aws.S3({
//     region: 'us-east-1',
//     credentials: {
//         accessKeyId: process.env.REACT_APP_ACCESS_KEY_ID,
//         secretAccessKey: process.env.REACT_APP_SECRET_ACCESS_KEY
//     }
// });

class FAQHome extends Component {
    constructor(props) {
        super(props);
        this.state = {
            openVideoModal: false,
            openDocModal: false,
            file: null,
            videoFile: null,
            displayFile: null,
            displayVideoFile: null,
            prevVideoFile: null,
            prevVideoThumbnail: '',
            deleteDocument: false,
            deleteDocumentTitle: '',
            docList: [],
            tempDocList: [],
            pdfLoading: false,
            listVideos: [],
            listVideosDisplay: [],
            editVideoName: '',
            editThumbnail: '',
            deleteVideoThumbnail: false,
            deleteVideoTitle: '',
            isVideoLoading: false,
            selectedThumbnail: '',
            isVideoinStore: false,

            // tab selected variables
            selectedTab: 'video'
        };

        this.redirectHandler = this.redirectHandler.bind(this);      
       

    }

    componentDidMount() {
        // this.fetchDocList();
        // this.getVideosAndThumbnails();
        // this.listFiles();
    }

    componentDidUpdate() {
        //const {tempDocList} = this.state;
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

    // change the tab on tab click
    setSelctedTab = (tabName) => {
        this.setState({
            selectedTab: tabName
        });
    }



    //sort and send the name list to child components
    sortNamesList = (listArray, sortType) => {
        let tempArr = JSON.parse(JSON.stringify(listArray));
        tempArr = tempArr.sort(
            this.compareValues('title', 'asc')
        );
        tempArr.map((obj, ind) => {
            obj.id = ind;
            return true
        })
        return tempArr;
    }

    compareValues(key, order = 'asc') {
        return function innerSort(a, b) {
          if (!a.hasOwnProperty(key) || !b.hasOwnProperty(key)) {
            // property doesn't exist on either object
            return 0;
          }
          const varA = typeof a[key] === 'string' ? a[key].toUpperCase() : a[key];
          const varB = typeof b[key] === 'string' ? b[key].toUpperCase() : b[key];
    
          let comparison = 0;
          if (varA > varB) {
            comparison = 1;
          } else if (varA < varB) {
            comparison = -1;
          }
          return order === 'desc' ? comparison * -1 : comparison;
        };
      }

      checkForExternalUser = () => {
        const userType = SessionStorage.read('userType');
        if (userType && userType === 'EU') {
          return true;
        } else {
          return false;
        }
      }

    render() {
        //let option = SessionStorage.read('option_selected');
        const {  selectedTab } = this.state;
        
        return (
            <Fragment>
                <Menu />

                <div className="container-fluid" id="video-react" style={{ paddingRight: '0px' }}>

                    <div className="row breadcrumb-row" >
                        <div className="col-sm-6">
                            <div>
                                <nav aria-label="breadcrumb">
                                    <ol className="breadcrumb">
                                        <li className="breadcrumb-item" style={{ cursor: 'pointer' }} onClick={() => { this.redirectHandler('home') }}>Home</li>
                                        <li className="breadcrumb-item active" aria-current="page">How To Use</li>
                                    </ol>
                                </nav>
                            </div>
                        </div>
                    </div>

                    <div className="row contentmain" style={{ position: 'relative' }}>

                        <div className="col-sm-12 faq-home-row" style={{ display: 'flex', position: "absolute", marginTop: '0.5rem' }}>
                            <div className="col-4" id="leftTextDiv">
                                <div className="leftDiv1" style={{ marginLeft: '2px' }}>
                                    <div className="contactbellIco" >
                                        <img src={bell} alt=""></img>
                                    </div>
                                    {!this.checkForExternalUser() ?
                                    <div className="contactTextDiv">
                                        <span style={{ color: '#00BAFF' }} className='ContactText'>
                                            <b>CHECKOUT THE<br />
                                            CONTENT HERE &<br />
                                            REACH OUT TO
                                        </b>
                                            <span style={{ color: '#ffffff' }} className='ContactText'>
                                                <b> <span style={{ color: '#00BAFF' }}>THE</span> CAPABILITY<br />
                                                NETWORK VRO<br />
                                                LEADS <span style={{ color: '#00BAFF' }}>TO KNOW </span>
                                                </b>
                                                <span style={{ color: '#00BAFF' }} className='ContactText'>
                                                    <b>MORE ABOUT
                                            </b>
                                                    <span style={{ color: '#ffffff' }} className='ContactText'>
                                                        <b>OUR VRO <br />OFFERING<br />
                                                ENABLED BY<br />
                                                VALUE COCKPIT
                                            </b>
                                                    </span></span></span>
                                        </span>
                                    </div>
                                    :
                                    <div className="contactTextDiv">
                                        <span style={{ color: '#ffffff' }} className='ContactText'>
                                            <b>CHECKOUT THE </b><br />
                                            <span style={{ color: '#00BAFF' }} className='ContactText'>
                                                   <b>CONTENT</b> 
                                                                                    
                                        <span style={{ color: '#ffffff' }} className='ContactText'>
                                                <span style={{ color: '#ffffff' }} className='ContactText'> <b>  HERE TO KNOW 
                                                </b>
                                                <span style={{ color: '#ffffff' }} className='ContactText'>
                                                    <b>MORE ABOUT
                                            </b>
                                                    <span style={{ color: '#00BAFF' }} className='ContactText'>
                                                        <b>
                                                VALUE COCKPIT
                                            </b>
                                            </span> </span></span></span> </span>
                                        </span>
                                    </div>}
                                </div>
                                
                            </div>
                            
                            <div className="col-8" id="rightTextDiv">
                                {/* tabs row start */}
                                <div className="htu-tabs-main">
                                    <div className="htu-tabs-row row">
                                        <div className="col-10 htu-tabs-wrapper">
                                            <ul className="htu-tabs-ul">
                                                <li className="htu-tabs-li">
                                                    <a className={`htu-nav-link ${selectedTab === 'video' ? 'active-class': 'not-active'}`} id="video_tutorial_link" name="video_tutorial"
                                                    onClick={() => {this.setSelctedTab('video')}}>
                                                        Video Tutorials
                                                    </a>
                                                </li>
                                                <li className="htu-tabs-li">
                                                    <a className={`htu-nav-link ${selectedTab === 'manuals' ? 'active-class': 'not-active'}`} id="manuals_link" name="manuals"
                                                    onClick={() => {this.setSelctedTab('manuals')}}>
                                                        Manuals
                                                    </a>
                                                </li>
                                                {!this.checkForExternalUser() ?
                                                <li className="htu-tabs-li">
                                                    <a className={`htu-nav-link ${selectedTab === 'stage0' ? 'active-class': 'not-active'}`} id="stage_0_deck_link" name="stage_0_deck"
                                                    onClick={() => {this.setSelctedTab('stage0')}}>
                                                       Imp Docs
                                                    </a>
                                                </li>:''}
                                                <li className="htu-tabs-li">
                                                    <a className={`htu-nav-link ${selectedTab === 'faq' ? 'active-class': 'not-active'}`} id="faq_link" name="faq"
                                                    onClick={() => {this.setSelctedTab('faq')}}>
                                                        FAQ
                                                    </a>
                                                </li>

                                            </ul>

                                        </div>
                                        <div className="col-2 htu-tabs-icon">
                                            
                                        </div>
                                    </div>
                                </div>
                                {/* tabs row end */}

                                {/* selected tab content */}
                                <div className="htu-tab-content-main">
                                    {selectedTab && selectedTab === 'video' ?
                                    <VideoHowToUse
                                    sortNamesList = {this.sortNamesList}
                                    >

                                    </VideoHowToUse>:
                                    <PdfHowToUse
                                    selectedTab = {selectedTab}
                                    sortNamesList={this.sortNamesList}
                                    >

                                    </PdfHowToUse>
                                    }
                                </div>                               
                                
                            </div>
                        </div>
                    </div>
                </div>               

            </Fragment>



        )
    }
}

export default withRouter(FAQHome);
