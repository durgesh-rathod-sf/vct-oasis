import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from "mobx-react";
import { BrowserRouter as Router } from 'react-router-dom';
import 'typeface-roboto';
import WebFont from 'webfontloader';
import 'bootstrap/scss/bootstrap.scss';
import App from './App';

import stores from './stores';
import * as serviceWorker from './serviceWorker';

import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.min.css';
import 'font-awesome/css/font-awesome.min.css';
// import './fonts/GraphikXCondensed-Black-Web.woff';
import './index.css';

import { DndProvider } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'
import { registerApplication, start } from 'single-spa';
import * as isActive from './ActivityFns'
import SystemJS from "systemjs"



registerApplication(
  'root',
  () => import('./root.app.js'),
  isActive.homePage,
  { domElement: document.getElementById('root') }
);

//  setTimeout(()=>{
  registerApplication(
    'oasis',
    () => window.System.import('oasis'),
    isActive.angularPage,
    { domElement: document.getElementById('angular-pmo') }
  );
//  },500)

start();serviceWorker.unregister();
