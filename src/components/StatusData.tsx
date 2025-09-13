import React from 'react';

interface TestComponentProps {
   name: string;
   subkey: string;
}

var json = {}

async function fetchData() {
    let repeat = setTimeout(fetchData, 7000);
    try {
        const res = await fetch("/bisque/now");
        json = await res.json();
        json["lastFetch"] = new Date().toLocaleTimeString();
                 // request again after a minute
        return json["lastFetch"];
    } catch (error) {
        json["lastFetch"] = "FAILED";
        console.error((error as Error).message);        
    }    

    if (repeat) {
        // TODO retry / recover
        clearTimeout(repeat);
    }

    return false;
}

let loader = fetchData();

const StatusData = (props: TestComponentProps) => {
//    const [loaded, setLoaded] = useState(false);

    const [data, setData] = React.useState('');
    React.useEffect(() => {
        let repeat = setTimeout(updateFromJSON, 1000);
        async function updateFromJSON() {
            try {                
                if (!loader || !json) {
                    json = {"lastFetch": "FAILED", "last":"FAILED" };
                    //json = { } TODO recover
                    //loader = fetchData();
                    throw new Error("panpanpan")
                }
                    json["last"] = new Date().toLocaleTimeString();

                if (props.subkey) {
                    setData(json[props.name][props.subkey]);
                }
                else {
                    setData(json[props.name]);    
                }

                repeat = setTimeout(updateFromJSON, 1000);
            } catch (error) {
                console.log(error);
                loader = fetchData();
            }            
        }

        updateFromJSON();

        return () => {
            if (repeat) {
                clearTimeout(repeat);
            }
        }
    }, [props]);

    return (
        <span className="data">{data}</span>
    );

};
export default StatusData;