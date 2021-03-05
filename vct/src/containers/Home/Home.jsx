import React, { Component } from "react";
import { withRouter } from "react-router-dom";
import { toast } from 'react-toastify';

import "./Home.css";
import HomeMenu from '../../components/HomeMenu/HomeMenu';
import Menu from "../../components/Menu/Menu";
import NotificationMessage from '../../components/NotificationMessage/NotificationMessage';
import HowToUseIco from "../../assets/home/menu/howToUseMenu.svg";
import ConatctUsIco from "../../assets/home/menu/contactMenu.svg";
import MyProjectIco from "../../assets/home/menu/myProjectMenu.svg";
import DemoProjectIco from "../../assets/home/menu/demoProjectMenu.svg";
import MyDealIco from "../../assets/home/menu/myDealMenu.svg";
import DemoDealIco from "../../assets/home/menu/demoDealMenu.svg";
import SalesImg from '../../assets/logo/sales_logo.png';
import DeliveryImg from '../../assets/logo/delivery_logo.png';
import { inject } from 'mobx-react';
var SessionStorage = require('store/storages/sessionStorage');

@inject('adminStore', "myProjectStore")

class Home extends Component {
  constructor(props) {
    super(props);
    this.angle = 0;
    this.endAngle = 0;
    this.increase = 0;
    this.state = {
      popMenuStatus: false,
      buttons: false,
      count: 0,
      radius: 0,
      selectedOption: false,
    };

    this.redirectHandler = this.redirectHandler.bind(this);
    this.demoUserHandler = this.demoUserHandler.bind(this);
    this.move = this.move.bind(this);
    this.handleUserType = this.handleUserType.bind(this);
  }
  componentDidMount() {
    const { adminStore } = this.props;
    adminStore.inAdminPanel = false;
    this.setState({
      buttons: Array.from(document.querySelectorAll(".button")),
      count: Array.from(document.querySelectorAll(".button")).length,
      increase: (Math.PI * 2) / Array.from(document.querySelectorAll(".button")).length,
      radius: 200
    });
  }

  move = (e) => {
    const { buttons, count, increase } = this.state;
    const n = buttons.indexOf(e.target);
    this.endAngle = (n % count) * increase;
    this.showSelectedOption(e.target.id);
    this.turn();
  };

  demoUserHandler = (event) => {
    let option = SessionStorage.read('option_selected')
    toast.error(<NotificationMessage
      title="Error"
      bodytext={option === 'sales' ? 'Sorry! You cannot access My Opportunities' : 'Sorry! You cannot access My Projects'}
      icon="error"
    />, {
      position: toast.POSITION.BOTTOM_RIGHT
    });
  }

  turn = () => {
    if (Math.abs(this.endAngle - this.angle) > 1 / 8) {
      const sign = this.endAngle > this.angle ? 1 : -1;
      this.angle = this.angle + sign / 12;
      setTimeout(this.turn, 20);
    } else {
      this.angle = this.endAngle;
    }

    this.setAngle();
  };

  setAngle() {
    const { buttons, increase, radius } = this.state;
    buttons.forEach((button, i) => {
      button.style.top =
        Math.sin(-Math.PI / 4 + i * increase - this.angle) * radius + "px";
      button.style.left =
        Math.cos(-Math.PI / 4 + i * increase - this.angle) * radius + "px";
    });
  }

  redirectHandler(e) {
    const { history, myProjectStore } = this.props;
    // eslint-disable-next-line default-case
    switch (e.target.id) {
      case "video":
        history.push('/how-to-use');
        break;
      case "contact_us":
        history.push("/contact-us");
        break;
      case "my_project":
        SessionStorage.write('mapId', SessionStorage.read('mapId'))
        SessionStorage.write('demoUser', JSON.stringify(false));
        let userType = SessionStorage.read('userType')
        if (userType === 'U') {
          this.handleUserType('Project');
        } else {
          history.push("/my-deals");
        }
        break;
      case "my_deal":
        SessionStorage.write('mapId', SessionStorage.read('mapId'))
        SessionStorage.write('demoUser', JSON.stringify(false));
        let userTypeStore = SessionStorage.read('userType');
        if (userTypeStore === 'U') {
          this.handleUserType('Deal');
        } else {
          history.push("/my-deals");
        }
        break;
      // case "demo_project":
      //   SessionStorage.write('mapId', SessionStorage.read('demoMapId'))
      //   SessionStorage.write('demoUser', JSON.stringify(true));
      //   SessionStorage.write('accessType', 'Read')
      //   history.push("/deal");
      //   break;
      // case "demo_deal":
      //   // SessionStorage.write('mapId', SessionStorage.read('demoMapId'))
      //   SessionStorage.write('demoUser', JSON.stringify(true));
      //   SessionStorage.write('accessType', 'Read');
      //   myProjectStore.fetchDemoDeal()
      //     .then((res) => {
      //       console.log(res);
      //       history.push("/deal");
      //     })

      //   break;
    }
  }

  showSelectedOption(type) {
    // eslint-disable-next-line default-case
    switch (type) {
      case "howtouse":
        this.setState({ selectedOption: 'howtouse' });
        break;
      case "contact":
        this.setState({ selectedOption: 'contact' });
        break;
      case "myproject":
        this.setState({ selectedOption: 'myproject' });
        break;
      case "demoproject":
        this.setState({ selectedOption: 'demoproject' });
        break;
      case "mydeal":
        this.setState({ selectedOption: 'mydeal' });
        break;
      case "demodeal":
        this.setState({ selectedOption: 'demodeal' });
        break;
    }
  }
  menuHandler(type) {
    const { history } = this.props;
    // eslint-disable-next-line default-case
    switch (type) {
      case 'home':
        history.push('/home');
        break;
      case 'sales-home':
        history.push('/sales-home');
        break;
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
       
        break;
    }
  }
  handleUserType = (type) => {
    const { myProjectStore, history } = this.props;

    myProjectStore.getProjectLists()
      .then((result) => {
        if (result && !result.error && result.resultCode === "OK") {
          if (result.resultObj[type].length === 0) {
            // alert("There are no " + type.toLowerCase() +"s created. Please reach out 'Sambit Banerjee' to get " + type.toLowerCase() + "s created as you dont have access to create.");
            this.showNotification("error", ("There are no " + type.toLowerCase() + "s created. Please reach out 'Sambit Banerjee' to get " + type.toLowerCase() + "s created as you dont have access to create."))
          } else {
            history.push("/my-deals");
          }
        }else if (result && result.resultCode === 'KO') {
          this.showNotification("error", result.errorDescription);
      }
      });
  }

  render() {
    const { increase, radius, selectedOption } = this.state;
    const userType = SessionStorage.read('userType')
    const option = SessionStorage.read('option_selected');

    return (
      <div className="container-fluid home-page-body-after" style={{ overflowY: 'hidden' }}>
        <Menu />
        <div className="row" style={{ paddingTop: '25.5px' }}>
          <div className="col-sm-4">
            <nav aria-label="breadcrumb">
              <ol className="breadcrumb">
                <li className="breadcrumb-item" style={{ cursor: 'pointer' }} onClick={() => this.menuHandler('home')}>Home</li>
                {option === 'sales' ?
                  <li className="breadcrumb-item active" style={{ cursor: 'pointer' }} aria-current="page" onClick={() => this.menuHandler('sales-home')}> Opportunity Home </li> : ""}
                <li className="breadcrumb-item active" aria-current="page">{option === 'sales' ? 'Sales ' : 'Delivery'}</li>
              </ol>
            </nav>
          </div>
          <div className="col-sm-5">
            <div className="menu">
              <div className="center1">
                <img
                  src={option === 'sales' ? SalesImg : DeliveryImg}
                  alt="Get Started"
                  style={{ marginLeft: "-42%", marginTop: '4%', height: '110px' }}
                />
                <div
                  className="button"
                  style={{
                    top: Math.sin(-Math.PI / 4 + 0 * increase) * radius + "px",
                    left: Math.cos(-Math.PI / 4 + 0 * increase) * radius + "px",
                    backgroundImage: `url(${ConatctUsIco})`
                  }}
                  id="contact"
                  onClick={this.move}
                ></div>
                <div
                  className="button"
                  style={{
                    top: Math.sin(-Math.PI / 4 + 1 * increase) * radius + "px",
                    left: Math.cos(-Math.PI / 4 + 1 * increase) * radius + "px",
                    backgroundImage: `url(${option === 'sales' ? DemoDealIco : DemoProjectIco})`
                  }}
                  id={option === 'sales' ? "demodeal" : "demoproject"}
                  onClick={this.move}
                ></div>
                <div
                  className="button"
                  style={{
                    top: Math.sin(-Math.PI / 4 + 2 * increase) * radius + "px",
                    left: Math.cos(-Math.PI / 4 + 2 * increase) * radius + "px",
                    backgroundImage: `url(${option === 'sales' ? MyDealIco : MyProjectIco})`
                  }} 
                  id={option === 'sales' ? "mydeal" : "myproject"}
                  onClick={userType === 'D' ? this.demoUserHandler : this.move}
                ></div>
                <div
                  className="button"
                  style={{
                    top: Math.sin(-Math.PI / 4 + 3 * increase) * radius + "px",
                    left: Math.cos(-Math.PI / 4 + 3 * increase) * radius + "px",
                    backgroundImage: `url(${HowToUseIco})`
                  }}
                  id="howtouse"
                  onClick={this.move}
                ></div>
              </div>
            </div>
          </div>

          {selectedOption && <div className="col-sm-3">
            <HomeMenu
              type={selectedOption}
              redirectHandler={this.redirectHandler} />
          </div>}
        </div>
      </div>
    );
  }
}

export default withRouter(Home);
