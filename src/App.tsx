import React from 'react';
//import useData from "components/useData";
import Index from "pages/index";
//import Page404 from "pages/page404";
import Kitchen from "pages/kitchen";
import './Tail.css';
import './Config/styles.css';
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";
import { createGlobalStyle } from "styled-components";
//const {useEffect, useState } = React;
const GlobalStyles = createGlobalStyle`
    body {
        margin: 0;
        padding: 0;
        font-family: sans-serif;
         -webkit-font-smoothing: antialiased;
        -moz-osx-font-smoothing: grayscale;
    }
#container {
    overflow:hidden;
    position:relative;
}
#hideMe {
    -webkit-animation: cssAnimation 5s forwards; 
    animation: cssAnimation 5s forwards;
}
@keyframes cssAnimation {
    0%   {opacity: 1;}
    90%  {opacity: 1;}
    100% {opacity: 0;}
}
@-webkit-keyframes cssAnimation {
    0%   {opacity: 1;}
    90%  {opacity: 1;}
    99% {opacity: 0; display:none;}
    100% {opacity: 0; display:none;}
}
.code {
  font-family: source-code-pro, Menlo, Monaco, Consolas, 'Courier New',
    monospace;
  font-size:12px;
}

`;

//let data = useData();
// data["fuck"] = "you";

const App = (props) => {
//     const [data, setData] = useState(false);
//     data["foo"]  = "fuck";
//     useEffect( () => {
//         console.log("Here we are cunt.");
//     }, [setData]);
    return (
    <Router>
     <GlobalStyles />
         <Switch>            
             <Route exact path='/' component={Index} />                    
             <Route exact path='/index' component={Index} />     
             <Route exact path='/kitchen' component={Kitchen} />
         </Switch>        
    </Router>
    )
}
export default App;

// 
// export default () => (
// 
//     <Router>
//         <GlobalStyles />
//             <Switch>            
//             	   <Route exact path='/' component={Index}/>        			
//                    <Route exact path='/index' component={Index}/>     
//                 <Route component={Page404}/>
//             </Switch>        
//     </Router>
// );
