import React from "react";
import { transformVar } from "@quarkly/atomize";
import { createGlobalStyle } from "styled-components";

const pageStyles = {
    "404": {
        "background": "rgba(0, 104, 255, 0.41) linear-gradient(173deg,rgba(0,0,0,0) 39.5%,rgba(0,0,0,1) 97.1%) no-repeat scroll",
        "transition": "opacity --transitionDuration-fastest --transitionTimingFunction-easeOut 0s",
        "display": ""
    },
    "index": {
        "background": "rgba(0, 104, 255, 0.41) linear-gradient(173deg,rgba(0,0,0,0) 39.5%,rgba(0,0,0,1) 97.1%) no-repeat scroll",
        "transition": "opacity --transitionDuration-fastest --transitionTimingFunction-easeOut 0s",
        "display": ""
    }
};



const PageStyles = createGlobalStyle`
    body {
        ${({ styles }) =>
            Object.entries(styles || {}).map(
                ([prop, value]) => `${prop}: ${transformVar(prop, value)};`
            )}
    }
`;
export const GlobalQuarklyPageStyles = ({ pageUrl }) => <PageStyles styles={pageStyles[pageUrl]} />
