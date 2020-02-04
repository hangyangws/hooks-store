import React from "react";
import ReactDOM from "react-dom";

import Provider from "../src/index";
import storeList from "./storeList";
import middlewares from "./middlewares";
import App from "./App";

import 'core-js/stable';
import 'regenerator-runtime/runtime';

const Root = document.getElementById("root");

ReactDOM.render(
  <Provider stores={storeList} middlewares={middlewares}>
    <App />
  </Provider>,
  Root
);
