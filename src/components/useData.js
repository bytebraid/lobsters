import React from 'react';

let json = {};

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
        console.error(error.message);        
    }    

    if (repeat) {
        // TODO retry / recover
        clearTimeout(repeat);
    }

    return false;
}

//   componentDidMount() {
//     this.getData();
//     this.interval = setInterval(() => {
//       this.getData();
//     }, 5000);
//   }

setInterval(function() {
    fetch("/bisque/now")
    .then(function(response) { json = response.json(); });
},5000);


const useData = () => {

    const [data, setData] = React.useState([]);

    React.useEffect(() => {
        let repeat = setTimeout(updateFromJSON, 1000);
        let loader =  fetchData();
        
        async function updateFromJSON() {
            await fetchData();
            try {                
                if (!loader || !json) {   
                    json = {"lastFetch": "FAILED", "last":"FAILED" };                 
                    //json = { } TODO recover
                    //loader = fetchData();
                    throw new Error("panpanpan")
                }
                json["last"] = new Date().toLocaleTimeString();
                setData({"json": json});
                repeat = setTimeout(updateFromJSON, 1000);
            } catch (error) {
                console.error(error.message);
                loader = await fetchData();
            }
            setData({"json": json});
        }

        updateFromJSON();
        if (repeat) { clearTimeout(repeat) }
        // return () => {
        //    if (repeat) {
        //        clearTimeout(repeat);
        //    }
        // }
        //
        data["json"] = json;
        
    }, [data]);

   return ( {data} );
        //<span className="data">{data}</span>
    

};

export default useData;
