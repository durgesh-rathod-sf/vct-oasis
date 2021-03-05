import React from 'react';
import { render, unmountComponentAtNode } from 'react-dom';
import { ErrorModal, SuccessModal } from './ErrorModal/ErrorModal';

function ShowError(message) {
  return ShowNotification(message, false);
}
function ShowSuccess(message) {
  return ShowNotification(message, true);
}

function ShowNotification(message, success) {
  const container = document.createElement('div');
  document.body.appendChild(container);
  let errorResolve;

  const renderPopup = () => (
    (success) ? <SuccessModal isModalVisible={true}
      modalTitle={message}
      closeModal={handler}
    /> :

      <ErrorModal isModalVisible={true}
        modalTitle={message}
        closeModal={handler}
      />
  )

  function destroyModal() {
    unmountComponentAtNode(container);
    document.body.removeChild(container);
  }
  const handler = (res) => errorResolve(res);
  const errorPromise = new Promise((resolve) => {
    render(renderPopup(), container);
    errorResolve = resolve;
  });


  return errorPromise.finally(() => {
    setTimeout(destroyModal, 100);
  });
}
export { ShowSuccess, ShowError };