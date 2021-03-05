import React from 'react';
import Modal from 'react-bootstrap4-modal';
import './ConcurrentLoginModal.css';
import { Auth } from 'aws-amplify';
import { Component } from 'react';
var SessionStorage = require('store/storages/sessionStorage');

class ConcurrentLoginModal extends Component {

  constructor(props) {
    super(props)
  }
  modalCloseHandler() {
    // const { history } = this.props;
    SessionStorage.write('logoutClicked', true)
    Auth.signOut().then((response) => {
      sessionStorage.clear()
      localStorage.clear();
      window.location.reload();
      // history.push('/login');
    }).catch(e => {});
  }
  render() {
    return (
      <div className="my-projects-concurrent">
        <Modal id="modalContainer" visible={this.props.visible}>
          <div className="modal-header" style={{ borderBottom: '0px', backgroundColor: '#404040', color: '#ffffff' }}>
            <h6 className="modal-title mx-auto md-block">{this.props.title}</h6>
            {/* <button type="button" onClick={props.modalCloseHandler} className="close" data-dismiss="modal" style={{ color: '#ffffff', opacity: '1' }} >&times;</button> */}
          </div>
          <div className="modal-body" style={{ backgroundColor: '#404040', color: '#ffffff' }}>
            <div className="parent-flex">
              <div style={{ marginLeft: '3%' }}>
                <button
                  type="button"
                  className="btn btn-light no-button"
                  onClick={
                    this.modalCloseHandler
                  }
                >
                  OK
                            </button>
              </div>
            </div>
          </div>
        </Modal>
      </div>
    );
  }


}

export default ConcurrentLoginModal;