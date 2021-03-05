import React from 'react';
import { render, unmountComponentAtNode } from 'react-dom';
import CustomConfirmModal from '../../CustomConfirmModal/CustomConfirmModal';


export default function Confirmation(title) {
  const container = document.createElement('div');
  document.body.appendChild(container);
  let confirmationResolve;

  const renderPopup = () => (
    <CustomConfirmModal
      ownClassName={'vdt-obj-delete'}
      isModalVisible={true}
      modalTitle={title}
      closeConfirmModal={handler}
    />
  )

  function destroyModal() {
    unmountComponentAtNode(container);
    document.body.removeChild(container);
  }
  const handler = (res) => confirmationResolve(res);
  const confirmation = new Promise((resolve) => {
    render(renderPopup(), container);
    confirmationResolve = resolve;
  });


  return confirmation.finally(() => {
    setTimeout(destroyModal, 100);
  });
}
