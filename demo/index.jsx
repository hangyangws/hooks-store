import React from "react";
import ReactDOM from "react-dom";

import Provider from "../../src/index";
import storeList from "./storeList";
import middlewaras from "./middlewares";
import App from "./App";

const Root = document.getElementById("root");

ReactDOM.render(
  <Provider stores={storeList} middlewares={middlewaras}>
    <App />
  </Provider>,
  Root
);
