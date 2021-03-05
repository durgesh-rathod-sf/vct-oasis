import React, { Component, Fragment } from 'react';
import { withRouter } from "react-router-dom";
import Menu from '../../components/Menu/Menu';
import Sambit from '../../assets/Contacts/SAMBIT.svg';
import rehan from '../../assets/Contacts/rehan.svg';
import amrita from '../../assets/Contacts/Amrita.svg';
import sweta from '../../assets/Contacts/sweta.svg';
import sidd from '../../assets/Contacts/sidd.svg';
import shrikar from '../../assets/Contacts/shrikar.svg';
import mehul from '../../assets/Contacts/mehul.svg';
import mayank from '../../assets/Contacts/mayank.svg';
import krishna from '../../assets/Contacts/krishna.svg';
import joe from '../../assets/Contacts/joe.svg';
import deeksha from '../../assets/Contacts/deeksha.svg';
import sameer from '../../assets/Contacts/sameer.svg';
import arun from '../../assets/Contacts/arun.svg';
import shivaji from '../../assets/Contacts/shivaji.svg';
import ajay from '../../assets/Contacts/ajay.svg';
import abhinav from '../../assets/Contacts/abhinav.svg';
import bell from '../../assets/Contacts/bell.svg';
import ankitha from '../../assets/Contacts/anikta.svg';
import './Contact.css';

class Contact extends Component {
   constructor(props) {
      super(props);
      this.redirectHandler = this.redirectHandler.bind(this);
   }
   redirectHandler(type) {
      const { history } = this.props;
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
         default:


      }
   }
   render() {
      return (
         <Fragment>
            <Menu />
            <div className="container-fluid" id="contactUs" style={{ paddingRight: '0px' }}>

               <div className="row breadcrumb-row" >
                  <div className="col-sm-6">

                     <div>
                        <nav aria-label="breadcrumb">
                           <ol className="breadcrumb">
                              <li className="breadcrumb-item" style={{ cursor: 'pointer' }} onClick={() => this.redirectHandler('home')}>Home</li>
                              {/* <li className="breadcrumb-item active"  style={{ cursor: 'pointer' }}aria-current="page" onClick={() => this.redirectHandler(option)}>{option === 'sales' ? 'Sales Home' : 'Program Delivery Home'}</li> */}
                              <li className="breadcrumb-item active" aria-current="page">Contact Us</li>
                           </ol>
                        </nav>
                     </div>
                  </div>
                  {/* <div className="col-sm-6 text-right">
                        <span onClick={() => this.redirectHandler(option)} style={{ color: '#ffffff', fontSize: '40px', cursor: 'pointer' }}>
                            &times;
                        </span>
                    </div> */}
               </div>
               <div style={{ display: 'flex', textAlign: 'center', marginTop: '0.5rem' }} className="contentmain">
                  <div style={{ width: '30%' }}>
                     <div className="leftDiv1" style={{ marginLeft: '5px' }}>
                        <div className="contactbellIco" >
                           <img src={bell} alt="" ></img>
                        </div>
                        <div style={{ margintop: '10px' }} className="contactTextDiv">
                           <span style={{ color: '#00BAFF', paddingTop: '26px' }} className='ContactText'>
                              <b>REACH OUT <br></br>TO THE ACCENTURE</b> <span style={{ color: '#ffffff' }} className='ContactText'><b>CAPABILITY NETWORK <br></br>VRO LEADS</b>
                                 <span style={{ color: '#00BAFF' }} className='ContactText'><b>TO DISCUSS<br></br> HOW WE CAN <br></br>HELP YOU<br></br> WITH</b><span style={{ color: '#ffffff' }} className='ContactText'><b>VALUE-FOCUSED<br></br> OPPORTUNITY PURSUIT <br></br> & DELIVERY</b></span></span></span> </span>
                        </div>
                     </div>
                  </div>
                  <div style={{ width: '69%' }}>
                     <div style={{ display: 'flex' }}>
                        <div className="flip-cardMain">
                           <div className="front" style={{ backgroundImage: `url(${Sambit})`, backgroundSize: 'cover', backgroundRepeat: 'no-repeat' }}>
                              <div className="thumbimg-nameMain">
                                 Sambit Banerjee <br />
                                 VRO LEAD - ALL INDUSTRIES
                              </div>
                           </div>
                           <div className="back">
                              <a href="mailto:sambit.banerjee@accenture.com">Sambit Banerjee</a><br />
                              +91 75061-12989
                           </div>
                        </div>
                        <div className="row no-gutters">
                           <div className="col-sm-3 flip-card">
                              <div className="front" style={{ backgroundImage: `url(${abhinav})` }} >
                                 <div className="thumbimg-name">
                                    Abhinav Nigam <br />
                                    Software & Platforms
                                 </div>
                              </div>
                              <div className="back">
                                 <a href="mailto:abhinav.nigam@accenture.com">Abhinav Nigam</a><br />
                                 +91 9958170088
                              </div>
                           </div>
                           <div className="col-sm-3 flip-card">
                              <div className="front" style={{ backgroundImage: `url(${ajay})` }} >
                                 <div className="thumbimg-name">
                                    Ajay Kumar <br />
                                 Natural Resources
                              </div>
                              </div>
                              <div className="back">
                                 <a href="mailto:ajay.d.kuma@accenture.com">Ajay Kumar</a><br />
                              +91 9901211194
                           </div>
                           </div>
                           <div className="col-sm-3 flip-card">
                              <div className="front" style={{ backgroundImage: `url(${shivaji})` }}>
                                 <div className="thumbimg-name">
                                    Shivaji Banerjee <br />
                                 Chemicals
                                 </div>
                              </div>
                              <div className="back">
                                 <a href="mailto:shivaji.banerjee@accenture.com">Shivaji Banerjee</a><br />
                                 +91 9899830656
                              </div>
                           </div>
                           <div className="col-sm-3 flip-card">
                              <div className="front" style={{ backgroundImage: `url(${ankitha})` }}>
                                 <div className="thumbimg-name">
                                    Ankita Chaturvedi <br />
                                    Travel
                                 </div>
                              </div>
                              <div className="back">
                                 <a href="mailto:ankita.chaturvedi@accenture.com">Ankita Chaturvedi</a><br />
                              +91 9868234035
                           </div>
                           </div>
                           <div className="col-sm-3 flip-card">
                              <div className="front" style={{ backgroundImage: `url(${arun})` }} >
                                 <div className="thumbimg-name">
                                    Arun Manoharan <br />
               Retail
            </div>
                              </div>
                              <div className="back">
                                 <a href="mailto:arun.mano@accenture.com">Arun Manoharan</a><br />
            +91 9986006152
         </div>
                           </div>
                           <div className="col-sm-3 flip-card">
                              <div className="front" style={{ backgroundImage: `url(${deeksha})` }} >
                                 <div className="thumbimg-name">
                                    Deeksha Vasudevan <br />
               Banking
            </div>
                              </div>
                              <div className="back">
                                 <a href="mailto:deeksha.vasudevan@accenture.com">Deeksha Vasudevan</a><br />
            +91 9910005887
         </div>
                           </div>
                           <div className="col-sm-3 flip-card">
                              <div className="front" style={{ backgroundImage: `url(${joe})` }}>
                                 <div className="thumbimg-name">
                                    Joe Antony <br />
               Health; Lifesciences
            </div>
                              </div>
                              <div className="back">
                                 <a href="mailto:joe.antony@accenture.com">Joe Antony</a><br />
            +91 9972522552
         </div>
                           </div>
                           <div className="col-sm-3 flip-card" >
                              <div className="front" style={{ backgroundImage: `url(${krishna})` }}>
                                 <div className="thumbimg-name">
                                    Krishna Murthy <br />
               Insurance
            </div>
                              </div>
                              <div className="back">
                                 <a href="mailto:krishna.murty@accenture.com">Krishna Murthy</a><br />
            +91 9611622400
         </div>
                           </div>
                           <div className="col-sm-3 flip-card">
                              <div className="front" style={{ backgroundImage: `url(${mayank})` }} >
                                 <div className="thumbimg-name">
                                    Mayank Bhati <br />
               Capital Markets
            </div>
                              </div>
                              <div className="back">
                                 <a href="mailto:mayank.bhati@accenture.com">Mayank Bhati</a><br />
            +91 7219510039
         </div>
                           </div>
                           <div className="col-sm-3 flip-card">
                              <div className="front" style={{ backgroundImage: `url(${mehul})` }} >
                                 <div className="thumbimg-name">
                                    Mehul Kishore Bonde <br />
               Automotive; Industrial
            </div>
                              </div>
                              <div className="back">
                                 <a href="mailto:mehul.kishor.bonde@accenture.com">Mehul Kishore Bonde</a><br />
            +91 9324863313
         </div>
                           </div>
                           <div className="col-sm-3 flip-card">
                              <div className="front" style={{ backgroundImage: `url(${rehan})` }}>
                                 <div className="thumbimg-name">
                                    Rehan Memon <br />
               Consumer Goods & Services
            </div>
                              </div>
                              <div className="back">
                                 <a href="mailto:rehan.memon@accenture.com">Rehan Memon</a><br />
            +91 8040796655
         </div>
                           </div>
                           <div className="col-sm-3 flip-card">
                              <div className="front" style={{ backgroundImage: `url(${sameer})` }}>
                                 <div className="thumbimg-name">
                                    Sameer Lawande <br />
               Utilities
            </div>
                              </div>
                              <div className="back">
                                 <a href="mailto:sameer.lawande@accenture.com">Sameer Lawande</a><br />
            +91 7738018000
         </div>
                           </div>
                           <div className="col-sm-3 flip-card">
                              <div className="front" style={{ backgroundImage: `url(${shrikar})` }} >
                                 <div className="thumbimg-name">
                                    Shrikar Madiraju  <br />
               Public Services
            </div>
                              </div>
                              <div className="back">
                                 <a href="mailto:shrikar.k.madiraju@accenture.com">Shrikar Madiraju</a><br />
            +91 1244672320
         </div>
                           </div>
                           <div className="col-sm-3 flip-card">
                              <div className="front" style={{ backgroundImage: `url(${sidd})` }}>
                                 <div className="thumbimg-name">
                                    Siddharth Garg  <br />
               Communications & Media
            </div>
                              </div>
                              <div className="back">
                                 <a href="mailto:siddharth.garg@accenture.com">Siddharth Garg</a><br />
            +91 9717262628
         </div>
                           </div>
                           <div className="col-sm-3 flip-card">
                              <div className="front" style={{ backgroundImage: `url(${sweta})` }}>
                                 <div className="thumbimg-name">
                                    Sweta Gupta <br />
               Aerospace & Defence; Hi-Tech
            </div>
                              </div>
                              <div className="back">
                                 <a href="mailto:sweta.d.gupta@accenture.com">Sweta Gupta</a><br />
            +91 7124047441
         </div>
                           </div>
                           <div className="col-sm-3 flip-card">
                              <div className="front" style={{ backgroundImage: `url(${amrita})` }}>
                                 <div className="thumbimg-name">
                                 Amrita Bandyopadhyay <br />
               Energy
            </div>
                              </div>
                              <div className="back">
                                 <a href="mailto:a.b.bandyopadhyay@accenture.com">Amrita Bandyopadhyay </a><br />
            +91 9945702832
         </div>
                           </div>
                        </div>
                        <div id="clear"></div>
                     </div>


                  </div>
                  {/* <div className="col-sm-4" style={{ textAlign: 'center' }}>
<img src={francescoImg} className="rounded-circle saturate" alt="Cinque Terre" width="106" height="106" />
<div className="contact-person">
   Francesco Venturini
</div>
<div className="contact-person-position">
   CMT Global Sales Lead
</div>
<div className="contact-person-email">
   <a href="mailto:francesco.venturini@accenture.com?Subject=Value Cockpit:%20Request%20for%20support" target="_top">francesco.venturini@accenture.com</a>
</div>
</div> */}
                  {/* 
<div className="Sambit" style={{position:'relative',marginTop:'90px',marginLeft:'450px'}}  >
   <img src={Sambit} style={{width:'250px',height:'200px'}}>
   </img>
   <img src={dropshadowImg} style={{poition:'absolute', zIndex:'4', width:'250px',height:'200px',marginTop:'80px',marginLeft:'-250px'}}/> 
   <div style={{poition:'absolute',Top:'-50px',left:'150px',color:'#ffffff'}}>Sambit Banerjee</div>
</div>
*/}
                  {/* 
<div className="Sambit" style={{position:'relative',marginTop:'90px',marginLeft:'450px'}}  >
   <img src={Sambit} style={{width:'250px',height:'200px'}}/>
   <div style={{poition:'absolute',bottom:'-50px',left:'150px',color:'#ffffff'}}>Sambit Banerjee</div>
</div>
*/}
                  {/* <div className="col-sm-6" style={{ textAlign: 'center' }}>
<img src={fredricImg} className="rounded-circle saturate" alt="Cinque Terre" width="106" height="106" />
<div className="contact-person">
   Frederic Astier
</div>
<div className="contact-person-position">
   Managing Director, CMT Sales
</div>
<div className="contact-person-email">
   <a href="mailto:frederic.astier@accenture.com?Subject=Value Cockpit:%20Request%20for%20support" target="_top">frederic.astier@accenture.com</a>
</div>
</div>
<div className="col-sm-6" style={{ textAlign: 'center' }}>
<img src={SambitImg} className="rounded-circle saturate" alt="Cinque Terre" width="106" height="106" />
<div className="contact-person">
   <span>Sambit Banerjee</span>
</div>
<div className="contact-person-position">
   Value Cockpit Global Lead for CMT
</div>
<div className="contact-person-email">
   <a href="mailto:sambit.banerjee@accenture.com?Subject=Value Cockpit:%20Request%20for%20support" target="_top">sambit.banerjee@accenture.com</a>
</div>
</div> */}





               </div>
            </div >
         </Fragment>
      )
   }
}

export default withRouter(Contact);