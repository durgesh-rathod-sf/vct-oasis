import React, { Component } from 'react';
import { withRouter } from "react-router-dom";
import { inject } from 'mobx-react';
import Modal from 'react-bootstrap4-modal';
import 'moment-timezone';
import './FAQHome.css';

import ReactTooltip from 'react-tooltip';
import closeIcon from '../../assets/project/workstream/modal-close.svg';

import intro from '../../assets/HowToUse/introVideo.svg';

@inject('workstreamStore')
class VideoPlayModal extends Component {
    

    componentDidMount() {
       
    }
    

    render() {
        const { selectedThumbnail } = this.props;
        return (
            <Modal id='video_play_modal' visible={selectedThumbnail && selectedThumbnail.length > 0} className='video-play-modal'>
               
                <div id="videoDynamicIntro" className="row video-store-main">
                            
                            <video id={`myVideo`} className="videoDiv" style={{ backgroundImage: `url(${intro})`, backgroundSize: 'cover', width: '90%', height: '90%', marginTop: '82px', marginLeft: '10px' }} controls="controls" controlsList="nodownload" preload='none' 
                            poster={`${this.props.getBucketName()}/vroimages/vrovideo-thumbnails/${selectedThumbnail}/public/${selectedThumbnail}.png`} >
                                <source id='webm' src={`${this.props.getBucketName()}/vroimages/vrovideos/${selectedThumbnail}/public/${selectedThumbnail}.mp4`} type='video/mp4' />
                            </video>
                            <span>
                            <img className="video-close-img" data-tip="" data-for="close_act_tooltip" data-type="dark" data-place="left"
                        src={closeIcon} alt="close" onClick={() => {this.props.closeVideoIntro()}} data-dismiss="modal"></img>
                    <ReactTooltip id="close_act_tooltip">
                        <span>Close</span>
                    </ReactTooltip>
                            </span>
                        </div>

               
            </Modal>
        );
    }
}

export default withRouter(VideoPlayModal);