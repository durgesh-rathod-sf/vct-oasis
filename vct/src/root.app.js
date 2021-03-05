import { Provider } from 'mobx-react';
import React from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import ReactDOM from 'react-dom';
import { BrowserRouter as Router } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import singleSpaReact from 'single-spa-react';
import App from './App.js';
import stores from './stores/index.js';

const reactLifecycles = singleSpaReact({
  React,
  ReactDOM,
  rootComponent: () => <Provider {...stores}> <Router > <ToastContainer /> <DndProvider backend={HTML5Backend}> <App /> </DndProvider> </Router> </Provider>,
  domElementGetter,
});

export const bootstrap = [reactLifecycles.bootstrap];

export const mount = [reactLifecycles.mount];

export const unmount = [reactLifecycles.unmount];

function domElementGetter() {
    let el = document.getElementById("root");
    if (!el) {
      el = document.createElement('div');
      el.id = 'root';
      document.body.appendChild(el);
    }
    return el;
}