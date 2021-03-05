import React from 'react';

import contactIco from '../../assets/home/othermenu/contactUsSelected.svg';
import demoProjectIco from '../../assets/home/othermenu/demoProjectSelected.svg';
import myProjectIco from '../../assets/home/othermenu/myProjectSelected.svg';
import myDemoIco from '../../assets/home/othermenu/myDemoSelected.svg';
import demoDealIco from '../../assets/home/othermenu/demoDealSelected.svg';
import howToUseIco from '../../assets/home/othermenu/howToUseSelected.svg';
import manjuallyBigImg from "../../assets/project/manuallyBig.svg";
import reviewBigImg from "../../assets/project/reviewBig.svg";
import setKpiBigImg from "../../assets/project/setKpiBig.svg";
import createProjectBigImg from "../../assets/project/addInitiativeBig.svg";
import publishDasboardBigImg from "../../assets/project/publishDasboardBig.svg";
import deliverypublishDasboardBigImg from "../../assets/project/deliverypublishDasboardBig.svg";
import developBigImgProj from "../../assets/project/developBigProj.svg";
import developBigImgDeal from "../../assets/project/developBigDeal.svg";
var SessionStorage = require('store/storages/sessionStorage');

const HomeMenu = (props) => {
    let option = SessionStorage.write('option_selected')
    return (
        <div className="row">
            {props.type === 'howtouse' ?
                (<img src={howToUseIco} id="video" onClick={props.redirectHandler} className="mx-auto d-block selectedOptionImg" alt="How to use" />) : ''
            }
            {props.type === 'contact' ?
                (<img src={contactIco} id="contact_us" onClick={props.redirectHandler} className="mx-auto d-block selectedOptionImg" alt="Contact us" />) : ''
            }
            {props.type === 'myproject' ?
                (<img src={myProjectIco} id="my_project" onClick={props.redirectHandler} className="mx-auto d-block selectedOptionImg" alt="myproject" />) : ''
            }
            {props.type === 'mydeal' ?
                (<img src={myDemoIco} id="my_deal" onClick={props.redirectHandler} className="mx-auto d-block selectedOptionImg" alt="mydemo" />) : ''
            }
            {props.type === 'demoproject' ?
                (<img src={demoProjectIco} id="demo_project" onClick={props.redirectHandler} className="mx-auto d-block selectedOptionImg" alt="demoproject" />) : ''
            }
            {props.type === 'demodeal' ?
                (<img src={demoDealIco} id="demo_deal" onClick={props.redirectHandler} className="mx-auto d-block selectedOptionImg" alt="demoproject" />) : ''
            }
            {props.type === 'businessCase' ?
                (<img src={manjuallyBigImg} id="businessCase" onClick={props.redirectHandler} className="mx-auto d-block selectedOption-project-menu" alt="demoproject" />) : ''
            }
            {props.type === 'defineWorkstream' ?
                (<img src={setKpiBigImg} id="defineWorkstream" onClick={props.redirectHandler} className="mx-auto d-block selectedOption-project-menu" alt="demoproject" />) : ''
            }
            {props.type === 'captureActuals' ?
                (<img src={reviewBigImg} id="captureActuals" onClick={props.redirectHandler} className="mx-auto d-block selectedOption-project-menu" alt="demoproject" />) : ''
            }
            {props.type === 'defineInitiatives' ?
                (<img src={setKpiBigImg} id="defineWorkstream" onClick={props.redirectHandler} className="mx-auto d-block selectedOption-project-menu" alt="demoproject" />) : ''
            }
            {props.type === 'addInitiativeInformation' ?
                (<img src={createProjectBigImg} id="add_Initiative_information" onClick={props.redirectHandler} className="mx-auto d-block selectedOption-project-menu" alt="demoproject" />) : ''
            }
            {props.type === 'publishDashboard' ?
                option === 'sales' ?
                    (
                        <img src={publishDasboardBigImg} id="publish_dashboard"
                            // onClick={props.redirectHandler} 
                            onClick={props.loadingresponse ? () => { } : props.publishDashboardHandler}
                            className="mx-auto d-block selectedOption-project-menu" alt="demoproject"
                            style={{ cursor: (props.tablueInprogress ? "progress" : "pointer") }} />
                    )
                    :
                    (
                        <
                            img src={deliverypublishDasboardBigImg} id="publish_dashboard"
                            onClick={props.redirectHandler}
                            className="mx-auto d-block selectedOption-project-menu" alt="demoproject"
                        />)
                : ''
            }
            {props.type === 'developeVDT' ?
                option === 'sales' ?
                    (<img src={developBigImgDeal} id="develope_VDT" onClick={props.redirectHandler} className="mx-auto d-block selectedOption-project-menu" alt="demoproject" />) :
                    (<img src={developBigImgProj} id="develope_VDT" onClick={props.redirectHandler} className="mx-auto d-block selectedOption-project-menu" alt="demoproject" />) : ''
            }
        </div>
    );
}

export default HomeMenu;