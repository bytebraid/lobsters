import React from "react";
import App from "./App.tsx";
import QAPI from "qapi";

import ReactDOM from 'react-dom';


window.QAPI = QAPI;
ReactDOM.render(<App />	, document.getElementById("root"));
