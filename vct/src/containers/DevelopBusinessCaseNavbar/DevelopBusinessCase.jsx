// import React, { Component } from 'react';
// import { observer,inject} from 'mobx-react';
// import { withRouter } from "react-router-dom";
// import Menu from '../../components/Menu/Menu';
// import DevelopBusinessCaseNavbar from "../DevelopBusinessCaseNavbar/DevelopBusinessCaseNavbar";
// import ProjectNavbar from '../../components/ProjectNavbar/ProjectNavbar';
// import '../DevelopBusinessCaseNavbar/developBusinessCaseNavbar.css';
// var SessionStorage = require('store/storages / sessionStorage');
// @inject('kpiBenefitsStore')
// @observer
// class DevelopBusinessCase extends Component {
//     constructor(props) {
//         super(props);
//         this.redirectHandler = this.redirectHandler.bind(this);
//     }

//     componentDidMount() {
//         const { kpiBenefitsStore } = this.props;
//         const payload = {mapId: SessionStorage.read('mapId')};
//         kpiBenefitsStore.getKPIBenefits(payload);
//     }

//     redirectHandler(type) {
//         const { history } = this.props;
//         // eslint-disable-next-line default-case
//         switch (type) {
//             case 'home':
//                 history.push('/');
//                 break;
//             case 'sales':
//                 history.push('/home');
//                 break;
//             case 'projectMenu':
//                 history.push('/project');
//                 break;
//             case 'myproject':
//                 history.push('my-projects');
//                 break;
//         }
//     }
//     render() {
//         const pname = SessionStorage.read('projectName');
//         const demoUser = SessionStorage.read('demoUser');
//         const option = SessionStorage.read('option_selected')
//         return (
//             <div className='container-fluid my-project-body' >
//                 <Menu />
//                 <div className="row" >
//                     <div className="col-sm-6">
//                         <div>
//                             <label className="page-header-label">{JSON.parse(demoUser) ? 'Demo Project' : "pname"}</label> {" "}
//                             </div>
//                         <div>
//                             <nav aria-label="breadcrumb">
//                                 <ol className="breadcrumb">
//                                     <li className="breadcrumb-item" style={{ cursor: 'pointer' }} onClick={() => this.redirectHandler('home')}>Home</li>
//                                     {option === 'sales' ?
//                                     <li className="breadcrumb-item active" style={{ cursor: 'pointer' }} aria-current="page" onClick={() => this.redirectHandler('sales-home')}>Sales Home </li>
//                                    :""
//                                    }
//                                     {option === "sales" ?
//                                         <li className="breadcrumb-item active" style={{ cursor: 'pointer' }} onClick={() => this.redirectHandler('sales')}>Sales</li> :
//                                         <li className="breadcrumb-item active" style={{ cursor: 'pointer' }} onClick={() => this.redirectHandler('delivery')}>Delivery</li>
//                                     }
//                                     {
//                                         !JSON.parse(demoUser) &&
//                                         <li className="breadcrumb-item" style={{ cursor: 'pointer' }} aria-current="page" onClick={() => this.redirectMenuHandler('myproject')}>{option === "sales" ? "My Deals" : "My Projects"}</li>
//                                     }
//                                     <li className="breadcrumb-item" style={{ cursor: 'pointer' }} onClick={() => this.redirectHandler('projectMenu')} aria-current="page">{JSON.parse(demoUser) === true ? 'Demo Project' : pname}</li>
//                                     <li className="breadcrumb-item active" aria-current="page">Finalize Value Driver Tree</li>
//                                 </ol>
//                             </nav>
//                         </div>
//                     </div>
//                     <div className="col-sm-6 text-right">
//                         <span onClick={() => this.redirectHandler('projectMenu')} style={{ color: '#ffffff', fontSize: '40px', cursor: 'pointer' }}>
//                             &times;
//                         </span>
//                     </div>
//                 </div>

//                 <hr style={{ borderColor: '#ffffff', marginTop: '-1%' }} />
//                 <ProjectNavbar
//                     activePage="value_driver"
//                 />
//                 <DevelopBusinessCaseNavbar />
//                 <div>
//                 </div>
//             </div >
//         )
//     }
// }

// export default withRouter(DevelopBusinessCase);
