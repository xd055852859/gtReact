import "babel-polyfill";
import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import registerServiceWorker from './registerServiceWorker';


import 'ant-design-pro/dist/ant-design-pro.css';
ReactDOM.render(<App />, document.getElementById('root'));
registerServiceWorker();
