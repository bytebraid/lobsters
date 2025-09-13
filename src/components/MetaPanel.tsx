import React from 'react';
import {Text} from "@quarkly/widgets";
// import MarqueeText from "react-marquee-text";

// import "MarqueeText/styles.css"

// const wrapStyle : React.CSSProperties = {
//   position: 'relative',
//   paddingTop: "56.25%",
// };
// 
// const rpStyle :  React.CSSProperties = {
//   position: 'absolute',
//   top: '0',
//   left: '0',
// };

interface TestComponentProps {
   name: string;
   subkey: string;
}

var loadingJSON ={
    "meta": {
    "show": "Loading",
    "date": "",
    "hash": "",
    "artist": "Wesley Snips",
    "title": "Cooking Chowder",
    "coveruri": "/images/THRESHOLD_TEST_CARD.png",
    "on_air": "",
    "comment": "Rustling up the bisque..."
  },
  "next": {
    "show": "Loading",
    "date": "",
    "hash": "",
    "artist": "Macky Gee",
    "title": "Back on Tour",
    "coveruri": "/images/THRESHOLD_TEST_CARD.png",
    "on_air": "",
    "comment": "Kenny Ken B2B Kenny Ken"
  },
    lastFetch: "COOKING",
    last: "LOADING",

};

var json = loadingJSON;

async function fetchData() {
    let repeat;
    try {
        const res = await fetch("/bisque/now");
        json = await res.json();
        json["lastFetch"] = new Date().toLocaleTimeString();
                 // request again after a minute
        return true;
        //return json["lastFetch"];

    } catch (error) {
        json = loadingJSON;
        json["lastFetch"] = "FAILED";
        clearTimeout(repeat);
        console.error((error as Error).message);
        return false;       
    }    
    finally {
        repeat = setTimeout(fetchData, 10000);
    }
}

let loader = fetchData();

interface Dataset {
    artist: string;
    coveruri: string;
    title: string;
    show: string;
    comment: string;    
}
interface Queue {
 url:string;
 user:string;
 date:string;
}

interface Meta {
    meta: Partial<Dataset>;
    next: Partial<Dataset>;
//    queue: Queue[];
    lastFetch: string;
    last: string;
}

const MetaPanel = (props: TestComponentProps) => {  

    const [data, setData] = React.useState<Partial<Meta>> ({});
    React.useEffect(() => {
        async function updateFromJSON() {
            try {                
                if (!loader || !json) {  
                    json["lastFetch"] = "FIRE IN THE HOLE" 
                    throw new Error("panpanpan")
                }
                json["last"] = new Date().toLocaleTimeString(); 
               
            } catch (error) {
                console.log(error);
                loader = fetchData();
            } finally {
                let coveruri = json["meta"]["coveruri"];
                if (coveruri.charAt(0) !== "/") {
                    json["meta"]["coveruri"] = "https://"+coveruri;
                }
                setData(json);
                setTimeout(updateFromJSON, 3000);
            }
        }

        updateFromJSON();

        return () => {

        }
    }, [props]);

    return (
        <>
                     
                
         

            <div style={{ background: "linear-gradient(45deg, rgba(153, 0, 136,0.9), rgba(100, 80, 100, 0.66), rgba(200, 0, 85,0.9)), url(/images/threshlobs.jpg) no-repeat 0% 0%/100%", 
                 backgroundRepeat: "no-repeat",  width:"100%", height:"100", borderRadius:"inherit", minHeight: "300px", padding:"20px", whiteSpace:"pre" }}>
            <Text 
                margin="auto"
                margin-top="5px"
                font="normal small-caps 200 19px/1.0 --fontFamily-googleAldrich"
                display="grid"                      
                justify-self="top"
                justify-items="center"
                align-items="center"
                lg-color="#ffffff"
                color="#ffffff"
                sm-order="1"
                sm-position="relative"
                sm-bottom="0px"
                sm-top="10px"
                lg-position="relative"
                lg-top="10px"
                lg-order="1"
                lg-justify-self="stretch"
                lg-align-self="stretch"
                lg-align-content="center"
                lg-margin="-20px 0px 0px 0px"
                md-bottom="auto"
                md-top="10px"
                md-margin="-10px 0px 0px 0px"
                md-justify-content="space-around"
                md-align-content="center"
                md-align-items="stretch"
                md-grid-column="1/ span 6"
                filter="blur(0.5px)"        
                    >

                        <u>Lobster On Air</u> <span className="meta" style={{ marginTop: "8px"}}>{data.meta?.artist}</span> <br/>

                        <i> <span className="meta" style={{font: "italic 200 12px --fontFamily-googleAldrich", textAlign:"center"}}> ----------------- </span></i> <br/>

                        <span className="meta">{data.meta?.show}</span>
                                           
                        <img width="150px" style={{ margin: "auto", marginTop: "20px" }} alt={data.meta?.comment} src={data.meta?.coveruri} />
                        
                    </Text>
                    
                </div>

                <Text
                    margin="0px 0px 0px 0px"
                    font="15px --fontFamily-mono"
                    lg-display="flex"
                    lg-flex-direction="column"
                    lg-position="relative"
                    lg-top="10px"
                    position="relative"
                    top="15px"
                    md-align-items="center"
                    md-flex-direction="column"
                    md-display="block"
                    style={{"color": "black", "border-radius": "10px",
"border-right-style": "groove",
"border-color": "cornflowerblue",
"backdrop-filter": "saturate(0.6)", 
"padding": "20px",
"border-left-style": "groove",}}
                >
                <u>Now Playing:</u> {data.meta?.title} <br/>
                <br/>
                <pre style={{maxWidth:"300px",  whiteSpace: "preserve"}}>                

                {data?.meta?.comment?.replaceAll("\\n","\n")} 
                
                </pre>
                <br/>

                <b>==============</b>
                <br/>
                <br/>
                <u>Next Lobster:</u> {data.next?.artist} <br/>
                <u>Next Show:</u> {data.next?.title} <br />
                <u>Last refresh:</u> {data.last} <br/>   
                <br/>

                <b>==============</b>

                <br/>             
                <div id="endpoint" /><br/>
                </Text>
                
  
         </>
    );

};
export default MetaPanel;