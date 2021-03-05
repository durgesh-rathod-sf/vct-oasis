import React, { Component, Fragment } from 'react';
import { withRouter } from "react-router-dom";
import './Video.css';
import details from '../../assets/HowToUse/details.svg';
import intro from '../../assets/HowToUse/intro.svg';
import play from '../../assets/HowToUse/play.svg';
import pdf from '../../assets/HowToUse/pdf.svg';
import close from '../../assets/menu/close.svg';
import comingSoon from '../../assets/HowToUse/details.svg';
import business_case from '../../assets/HowToUse/business-case.png';
import capture_actual_values from '../../assets/HowToUse/capture-actual-values.png';
import create_oppurtunity from '../../assets/HowToUse/create-oppurtunity.png';
import offering from '../../assets/HowToUse/offering.png';
import VDT from '../../assets/HowToUse/VDT.png';
import value_program from '../../assets/HowToUse/value-program.png';


import bell from '../../assets/Contacts/bell.svg';
import { Player, BigPlayButton, LoadingSpinner } from 'video-react';
// import Poster from '../../assets/contact_us.jpg';
import Menu from '../../components/Menu/Menu';

// import { backgroundImage } from 'html2canvas/dist/types/css/property-descriptors/background-image';
var SessionStorage = require('store/storages/sessionStorage');

const env = process.env.REACT_APP_BASE_URL;
class Video extends Component {
    constructor(props) {
        super(props);
        this.redirectHandler = this.redirectHandler.bind(this);
        this.openVideo = this.openVideo.bind(this);
        this.closeVideo = this.closeVideo.bind(this);
        // this.openVideoDetails = this.openVideoDetails.bind(this);
        // this.closeVideoDetails = this.closeVideoDetails.bind(this);


    }

    getBucketName() {
        // eslint-disable-next-line default-case
        switch (env) {
            case 'production':
                return 'https://prodb.valuecockpit-accenture.net';
            case 'preprod':
                return 'https://preprod.valuecockpit-accenture.net';
            case 'staging':
                return 'https://uat.valuecockpit.accenture.com';
            case 'development':
                return 'https://dev-valuecockpit.accenture.com';
            case 'localhost':
                return 'https://dev-valuecockpit.accenture.com';
            case 'productionb':
                return 'https://valuecockpit.accenture.com';
            case 'dev2':
                return 'https://dev2-valuecockpit.accenture.com';

        }
    }

    openVideo = (event) => {
        var video = document.getElementById("myVideo" + event.currentTarget.id);
        video.play();
        document.getElementById("videoStatic").style.display = "none";
        document.getElementById("videoDynamicIntro" + event.currentTarget.id).style.display = "block";
        document.getElementById("pdfDiv").style.display = "none";
        document.getElementById("leftTextDiv").style.filter = "blur(2px)";
    }
    closeVideo = (event) => {
        var video = document.getElementById("myVideo" + event.currentTarget.id);
        video.pause();
        video.currentTime = 0;
        document.getElementById("videoStatic").style.display = "block";
        document.getElementById("videoDynamicIntro" + event.currentTarget.id).style.display = "none";
        document.getElementById("pdfDiv").style.display = "block";
        document.getElementById("leftTextDiv").style.filter = "blur(0px)";
    }

    openVideo1 = (event) => {
        document.getElementById("videoStatic").style.display = "none";
        document.getElementById("videoDynamicIntro1").style.display = "block";
        document.getElementById("pdfDiv").style.display = "none";
        document.getElementById("leftTextDiv").style.filter = "blur(2px)";
    }
    closeVideo1 = (event) => {
        var video = document.getElementById("myVideo2");
        video.pause();
        video.currentTime = 0;
        document.getElementById("videoStatic").style.display = "block";
        document.getElementById("videoDynamicIntro1").style.display = "none";
        document.getElementById("pdfDiv").style.display = "block";
        document.getElementById("leftTextDiv").style.filter = "blur(0px)";
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
    render() {
        let resourcePath = this.getBucketName();
        // let resourcePath = 'https://dev-valuecockpit.accenture.com'
        let option = SessionStorage.read('option_selected')
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
                                        {/* {
                                                option === "sales" ?
                                                    <li className="breadcrumb-item active" style={{ cursor: 'pointer' }} onClick={() => this.redirectHandler('sales')}>Sales Home</li> :
                                                    <li className="breadcrumb-item active" style={{ cursor: 'pointer' }} onClick={() => this.redirectHandler('delivery')}>Program Delivery Home</li>
                                            }  */}
                                        <li className="breadcrumb-item active" aria-current="page">How To Use</li>
                                    </ol>
                                </nav>
                            </div>
                        </div>
                    </div>

                    <div className="row contentmain" style={{ position: 'relative' }}>
                        <div id="videoDynamicIntro1">
                            <img onClick={this.closeVideo} id={1} className="crossClick" src={close} />
                            <video id="myVideo1" className="videoDiv" style={{ backgroundImage: `url(${intro})`, width: '90%', height: '90%' }} controls="controls" preload='none' poster={intro} >
                                <source id='webm' src={`${resourcePath}/vroimages/vrovideos/video1/public/Introduction+to+Value+Cockpit.mp4`} type='video/mp4' />
                            </video>
                        </div>
                        <div id="videoDynamicIntro5">
                            <img onClick={this.closeVideo} id={5} className="crossClick" src={close} />
                            <video id="myVideo5" className="videoDiv" style={{ backgroundImage: `url(${offering})`, width: '90%', height: '90%' }} controls="controls" preload='none' poster={offering} >
                                <source id='webm' src={`${resourcePath}/vroimages/vrovideos/video5/How+to+create+a+new+offering.mp4`} type='video/mp4' />
                            </video>
                        </div>
                        <div id="videoDynamicIntro3">
                            <img onClick={this.closeVideo} id={3} className="crossClick" src={close} />
                            <video id="myVideo3" className="videoDiv" style={{ backgroundImage: `url(${create_oppurtunity})`, width: '90%', height: '90%' }} controls="controls" preload='none' poster={create_oppurtunity} >
                                <source id='webm' src={`${resourcePath}/vroimages/vrovideos/video3/How+to+Create+New+Opportunity.mp4`} type='video/mp4' />
                            </video>
                        </div>
                        <div id="videoDynamicIntro4">
                            <img onClick={this.closeVideo} id={4} className="crossClick" src={close} />
                            <video id="myVideo4" className="videoDiv" style={{ backgroundImage: `url(${VDT})`, width: '90%', height: '90%' }} controls="controls" preload='none' poster={VDT} >
                                <source id='webm' src={`${resourcePath}/vroimages/vrovideos/video4/How%2Bto%2Bcreate%2Ba%2BValue%2BDriver%2BTree.mp4`} type='video/mp4' />
                            </video>
                        </div>
                        <div id="videoDynamicIntro6">
                            <img onClick={this.closeVideo} id={6} className="crossClick" src={close} />
                            <video id="myVideo6" className="videoDiv" style={{ backgroundImage: `url(${business_case})`, width: '90%', height: '90%' }} controls="controls" preload='none' poster={business_case} >
                                <source id='webm' src={`${resourcePath}/vroimages/vrovideos/video6/How+to+create+a+Business+Case.mp4`} type='video/mp4' />
                            </video>
                        </div>
                        <div id="videoDynamicIntro2">
                            <img onClick={this.closeVideo} id={2} className="crossClick" src={close} />
                            <video id="myVideo2" className="videoDiv" style={{ backgroundImage: `url(${value_program})`, width: '90%', height: '90%' }} controls="controls" preload='none' poster={value_program} >
                                <source id='webm' src={`${resourcePath}/vroimages/vrovideos/video2/How+to+setup+a+Value+Program.mp4`} type='video/mp4' />
                            </video>
                        </div>
                        <div id="videoDynamicIntro7">
                            <img onClick={this.closeVideo} id={7} className="crossClick" src={close} />
                            <video id="myVideo7" className="videoDiv" style={{ backgroundImage: `url(${capture_actual_values})`, width: '90%', height: '90%' }} controls="controls" preload='none' poster={capture_actual_values} >
                                <source id='webm' src={`${resourcePath}/vroimages/vrovideos/video7/How+to+Capture+Actual+Values.mp4`} type='video/mp4' />
                            </video>
                        </div>
                        <div className="col-sm-12" style={{ display: 'flex', position: "absolute", marginTop: '0.5rem' }}>
                            <div style={{ width: '38%', marginLeft: '5px' }} id="leftTextDiv">
                                <div className="leftDiv1" style={{ marginLeft: '2px' }}>
                                    <div className="contactbellIco" >
                                        <img src={bell} ></img>
                                    </div>
                                    <div className="contactTextDiv">
                                        <span style={{ color: '#00BAFF' }} className='ContactText'>
                                            <b>CHECKOUT THE<br />
                                            CONTENT HERE &<br />
                                            REACH OUT TO THE
                                        </b>
                                            <span style={{ color: '#ffffff' }} className='ContactText'>
                                                <b>ACCENTURE CAPABILITY<br />
                                                NETWORK<br />
                                                VRO LEADS
                                            </b>
                                                <span style={{ color: '#00BAFF' }} className='ContactText'>
                                                    <b>TO KNOW MORE <br />
                                                ABOUT
                                            </b>
                                                    <span style={{ color: '#ffffff' }} className='ContactText'>
                                                        <b>OUR VRO OFFERING<br />
                                                ENABLED BY<br />
                                                VALUE COCKPIT
                                            </b>
                                                    </span></span></span>
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <div className="mainStaticDiv" style={{ width: '38%', height: '400px', marginRight: '5%', paddingRight: '5%' }}>
                                <div id="videoStatic" style={{ width: '352px', marginLeft: '45px' }}>
                                    <div className="videoStaticDiv" >
                                        <div className="videoDiv" style={{ backgroundImage: `url(${intro})` }} >
                                            <div className="videoStaticImg">
                                                <img src={play} id="1" onClick={this.openVideo} style={{ cursor: 'pointer' }} />
                                            </div>
                                        </div>
                                        <div className="intro">
                                            <span>Introduction to Value Cockpit</span>
                                        </div>
                                    </div>
                                    <div className="videoStaticDiv" style={{ marginTop: '30px' }}>
                                        <div className="videoDiv" style={{ backgroundImage: `url(${offering})` }} >
                                            <div className="videoStaticImg">
                                                <img src={play} id="5" onClick={this.openVideo} style={{ cursor: 'pointer' }} />
                                            </div>
                                        </div>
                                        <div className="intro">
                                            <span> How to create a new Offering </span>
                                        </div>
                                    </div>
                                    <div className="videoStaticDiv" style={{ marginTop: '30px' }}>
                                        <div className="videoDiv" style={{ backgroundImage: `url(${create_oppurtunity})` }} >
                                            <div className="videoStaticImg">
                                                <img src={play} id="3" onClick={this.openVideo} style={{ cursor: 'pointer' }} />
                                            </div>
                                        </div>
                                        <div className="intro">
                                            <span> How to create new Opportunity </span>
                                        </div>
                                    </div>


                                    <div className="videoStaticDiv" style={{ marginTop: '30px' }}>
                                        <div className="videoDiv" style={{ backgroundImage: `url(${VDT})` }} >
                                            <div className="videoStaticImg">
                                                <img src={play} id="4" onClick={this.openVideo} style={{ cursor: 'pointer' }} />
                                            </div>
                                        </div>
                                        <div className="intro">
                                            <span> How to create a Value Driver Tree </span>
                                        </div>
                                    </div>
                                    <div className="videoStaticDiv" style={{ marginTop: '30px' }}>
                                        <div className="videoDiv" style={{ backgroundImage: `url(${business_case})` }} >
                                            <div className="videoStaticImg">
                                                <img src={play} id="6" onClick={this.openVideo} style={{ cursor: 'pointer' }} />
                                            </div>
                                        </div>
                                        <div className="intro">
                                            <span> How to create a Business Case </span>
                                        </div>
                                    </div>
                                    <div className="videoStaticDiv" style={{ marginTop: '30px' }}>
                                        <div className="videoDiv" style={{ backgroundImage: `url(${value_program})` }} >
                                            <div className="videoStaticImg">
                                                <img src={play} id="2" onClick={this.openVideo} style={{ cursor: 'pointer' }} />
                                            </div>
                                        </div>
                                        <div className="intro">
                                            <span>How to setup a Value Program </span>
                                        </div>
                                    </div>
                                    <div className="videoStaticDiv" style={{ marginTop: '30px' }}>
                                        <div className="videoDiv" style={{ backgroundImage: `url(${capture_actual_values})` }} >
                                            <div className="videoStaticImg">
                                                <img src={play} id="7" onClick={this.openVideo} style={{ cursor: 'pointer' }} />
                                            </div>
                                        </div>
                                        <div className="intro">
                                            <span> How to Capture Actual Values </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div style={{ width: '22%' }} id="pdfDiv">
                                <div style={{ paddingTop: '110px' }}>
                                    <div className="pdfInfo">
                                        <div>
                                            <img src={pdf} />
                                        </div>
                                        <div className="pdfText">
                                            Value Realization Office (VRO) Stage-0 Deck
                                    </div>

                                    </div>
                                    <div className="pdfInfo">
                                        <div>
                                            <img src={pdf} />
                                        </div>
                                        <div className="pdfText">
                                            Value Cockpit Tool<br /> User Manual
                                    </div>
                                    </div>
                                    <div className="pdfInfo">
                                        <div>
                                            <img src={pdf} />
                                        </div>
                                        <div className="pdfText" style={{ marginTop: '17px' }} >
                                            Frequently Asked Questions
                                    </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

            </Fragment>
        )
    }
}

export default withRouter(Video);