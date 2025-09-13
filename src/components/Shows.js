import React from "react";
import { Text, Button } from "@quarkly/widgets";

import BootstrapTable from "react-bootstrap-table-next";
import "react-bootstrap-table-next/dist/react-bootstrap-table2.min.css";
import filterFactory, { textFilter } from "react-bootstrap-table2-filter";
import paginationFactory from "react-bootstrap-table2-paginator";

function urlForm(cell, row) {
  return (
    <span>
      <a href={cell} target="_new">{cell}</a>
    </span>
  );
}


function commentForm(cell, row) {
  return (
    <span>
      <pre style={{whiteSpace: "nowrap", maxWidth:"240px", textOverflow: "ellipsis", overflow: "hidden" }}>{row.comment?.replaceAll("\\n","\n")}</pre>
    </span>
  );
}

const columns = [
  {
    dataField: "hash",
    text: "",
    hidden: true,
    filter: textFilter({
      delay: 500, // default is 500ms
      style: {
        backgroundColor: "yellow",
      },
      className: "filter",
      placeholder: "",
      onClick: (e) => console.log(e),
    }),
    headerClasses: "colhead",
  },
  {
    dataField: "show",
    text: "",
    style: { textWrapMode: "wrap", overflow: "hidden" },
    filter: textFilter({
      delay: 500, // default is 500ms
      style: {
        backgroundColor: "yellow",
      },
      className: "filter",
      placeholder: "Search Show...",
      onClick: (e) => console.log(e),
    }),
    headerClasses: "colhead",
  },
  {
    dataField: "date",
    //text: "Date",
    text: "",
    style: { maxWidth: "150px", textWrapMode: "wrap", overflow: "hidden" },
    filter: textFilter({
      delay: 500, // default is 500ms
      style: {
        backgroundColor: "yellow",
      },
      className: "filter",
      placeholder: "Search Date...",
      onClick: (e) => console.log(e),
    }),
    headerClasses: "colhead",
  },
  {
    dataField: "title",
    //text: "Title",
    text: "",
    style: { textWrapMode: "wrap", overflow: "hidden" },
    filter: textFilter({
      delay: 500, // default is 500ms
      style: {
        backgroundColor: "yellow"        
      },
      className: "filter",
      placeholder: "Search Title...",
      onClick: (e) => console.log(e),
    }),
    headerClasses: "colhead",
  },
  {
    dataField: "artist",
    //text: "Lobster",
    text: "",
    style: { textWrapMode: "wrap", overflow: "hidden" },
    filter: textFilter({
      delay: 500, // default is 500ms
      style: {
        backgroundColor: "yellow",
      },
      className: "filter",
      placeholder: "Search Lobster...",
      onClick: (e) => console.log(e),
    }),
    headerClasses: "colhead",
  },
  {
    dataField: "comment",
    //text: "Comment",
    text: "",
    style: {         
        maxWidth: "240px",
        overflow: "hidden",
        textOverflow: "ellipsis",
        whiteSpace: "nowrap"},
    filter: textFilter({
      delay: 500, // default is 500ms
      style: {
        backgroundColor: "yellow",

      },
      className: "filter",
      placeholder: "Search Comment...",
      onClick: (e) => console.log(e),
    }),
    headerClasses: "colhead",
    formatter: commentForm
  },
  {
    dataField: "url",
    //text: "Audio URL",
    text: "",
    filter: textFilter({
      delay: 500, // default is 500ms
      style: {
        backgroundColor: "yellow",
      },
      className: "filter",
      placeholder: "Search URL...",
      onClick: (e) => console.log(e),
    }),
    style: {         
        maxWidth: "200",
        overflow: "hidden",
        textOverflow: "ellipsis",
        whiteSpace: "nowrap",
        fontSize: "10px"
      },

    formatter: urlForm,
    headerClasses: "colhead",
  },
];

function setIdem(button, data) {
  if (button == null) {
    console.log("missing button element");
    return;
  }
    if (data == null) {         
      button.innerHTML = "SIMMERING";
      button.className = "cookingButton";
      button.disabled = true;
      return;
    }
    if (!data["success"]) {
      console.log("Butters, you're grounded");
    }
    button.innerHTML = button.name;
    button.className = "queueButton";
    button.disabled = false;
    return;
  
}
  


class Shows extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      gary: {},
      data: [],
      isLoading: true,
    };
    this.fetchData.bind(this);
    this.handleQueue.bind(this);
    this.handleResponse.bind(this);
    this.handleResponseJson.bind(this);
  }
  expandRow = {
    renderer: (row) => (
      <div>
        <small>
          <i>{`Show hash ${row.hash}`}</i>
        </small>
        <br/>
        <pre style={{ whiteSpace: "preserve" }}>{row.comment.replaceAll("\\n","\n")}</pre>
            <button id={`${row.hash}`} onClick={this.handleQueue} className="queueButton">          
            REQUEST A REWIND
          </button>
      </div>  
    ),
    showExpandColumn: true,
    expandHeaderColumnRenderer: ({ isAnyExpands }) => {
      if (isAnyExpands) {
        return <b>▼</b>;
      }
      return <b>►</b>;
    },
    expandColumnRenderer: ({ expanded }) => {
      if (expanded) {
        return <b>▼</b>;
      }
      return <b>►</b>;
    },
  };

  handleQueue = (button) => {

    console.log(button);    
    let response = fetch("/bisque/queue/"+button.target.id, {
                    method: 'GET'                                 
                  })
                  .then(this.handleResponse)
                  .then((response) => response.json())
                  .then(this.handleResponseJson);
              console.log(response);
              document.getElementById(button.target.id).innerHTML = "QUEUEING";
              document.getElementById(button.target.id).disabled = true;
              
  }

  handleResponseJson = (jso) => {
    const that = this;
    let gaz = { message: "FAULTY", status: "JSON" }
    try {
        gaz["message"] = `${jso.message}`; 
        gaz["status"]  = that.state.gary.status
    }
    catch(e) {      
      console.log(e)
    }
    finally {
      this.setState({
        gary: gaz,
        data: [...that.state.data], 
        isLoading: false   
      });
    }
    return jso;    
  }

  handleResponse = (response) => {
    const that = this;
    let gaz = { message: "Processing", status: "INSIDE" }
    try {
        gaz["status"] = `${response.status} ${response.statusText}`;        
    }
    catch(e) {
      gaz = { message: "FAULTY", status: "GEAR" }
      console.log(e)
    }
    finally {
      this.setState({
        gary: gaz,
        data: [...that.state.data], 
        isLoading: false   
      });
    }
    return response;    
  }

  fetchData = () => {
    const that = this;
    fetch(`/stream/dbase.json`)
        .then( response => {

        let last = new Date();        
        this.setState({
          gary: {
            message: `Lobster dubplates updated at ${last}`, 
            status: `${response.status} ${response.statusText}`
          }, 
          data: [...this.state.data],
          isLoading: true 
        });
        return response;
      })
      .then((response) => response.json())
      .then(function(response) {

        that.setState({
          gary: that.state.gary,
          data: response,
          isLoading: false
        })
      })
      .catch((err) => {
          console.log(err);
        })

      };

  componentDidMount() {
    
    this.fetchData.bind(this);
    this.handleResponse.bind(this);
    this.handleResponseJson.bind(this);
    this.handleQueue.bind(this);
    this.fetchData();
    setInterval(this.fetchData.bind(this), 60000);
 
  }

  handleShoutOut = (button) => {

    console.log(button);
    let words = document.getElementById("saywords");
    console.log(words);
    let say = words.value.slice(0,200);
    setIdem(button, null);

    try {
      let response = fetch("/bisque/say", {
                      method: 'POST',
                      headers: {
                          'Content-type': 'application/json',                
                      },
                      body: JSON.stringify({"words": say})
                    })
                    .then(this.handleResponse)
                    .then((response) => response.json())
                    .then(this.handleResponseJson)
    
      console.log(response);      
      setTimeout(setIdem, (response.ok) ? 1000 : 10000, button, response);
      return;
 
    } catch (e) {
      console.log(e);   
    }
    console.log("Gary's off on one");
    setTimeout(setIdem, 1000, button, {});

  }
  handleGetCurrentData = () => {
    console.log(this.node.table.props.data);
  };

  handleGetSelectedData = () => {
    console.log(this.node.selectionContext.selected);
  };

  handleGetExpandedData = () => {
    console.log(this.node.rowExpandContext.state.expanded);
  };

  handleGetCurrentPage = () => {
    console.log(this.node.paginationContext.currPage);
  };

  handleGetCurrentSizePerPage = () => {
    console.log(this.node.paginationContext.currSizePerPage);
  };

  handleGetCurrentSortColumn = () => {
    console.log(this.node.sortContext.state.sortColumn);
  };

  handleGetCurrentSortOrder = () => {
    console.log(this.node.sortContext.state.sortOrder);
  };

  handleGetCurrentFilter = () => {
    console.log(this.node.filterContext.currFilters);
  };

  render() {

      
    return (


      <div style={{ boxSizing: "inherit"}}>


          
          <div lg-display="block" style={{ display: "flex", alignItems: "center" }}>

            <Button
              className="queueButton"
              margin="20px 50px 20px 0px"
              border="darkorange groove 4px"    
              min-width="250px"       
              border-width="4px"
              background="--color-orange"
              font="normal 550 26px/1 --fontFamily-googleOswald"
              border-radius="60px"
              padding="10px 24px 10px 24px"
              id="live"
              hover-background="#ffc807"
              onClick={async () => {  let response = await fetch("/bisque/live", {
                      method: 'GET',
                      headers: {
                          'Content-type': 'application/json',                
                      },              
                    });
                let jso = await response.json()
                document.getElementById("endpoint").innerHTML = '<u>Stream Endpoint:</u> <a target="_new" href="'+jso["endpoint"]+'">Click for connection details</a><br /><u>Endpoint expires:</u> '+jso["expires"]+'<br/><b>STREAM SAMPLERATE MUST BE 44100Hz</b><br/>'
              }}
            >
              GO LIVE
            </Button>
            <Text 
              margin="0px 0px 0px 0px"
              font="13px --fontFamily-googleSixtyfour"
              width="100%"
              text-align="center"
              display="flex"
              lg-display="table-column-group"
              id="endpoint"
              color="white"
            >Click GO to refresh live endpoint</Text>

        </div>    
         <div style={{ display: "flex", alignItems: "center" }}>  
         <Button id="speak" 
                       margin="20px 50px 20px 0px"
              border="darkorange groove 4px"    
              min-width="250px"       
              border-width="4px"
              background="--color-orange"
              font="normal 550 26px/1 --fontFamily-googleOswald"
              border-radius="60px"
              padding="10px 24px 10px 24px"
          hover-background="#ffc807"
          name="SHOUT OUT" 
          className="queueButton" 
          onClick={this.handleShoutOut} >          
          SHOUT OUT
        </Button>     
        <input type="text" maxLength="150" class="form-control" id="saywords"
         placeholder="no apostrophies or commas etc yeah gary is well dyslexic like" width="500px" />

        </div>
        <Text 
          margin="0px 0px 0px 0px"
          font="20px --fontFamily-googleSixtyfour"
          width="100%"
          text-align="center"
          display="inline-block"
          lg-display="table-column-group"
          id="endpoint"
        >
        OpenGary AI :: {this.state.gary.status} :: {this.state.gary.message}
        </Text>
        <p></p>
        <BootstrapTable
          id="reactBS"
          ref={(n) => (this.node = n)}
          keyField="hash"
          data={this.state.data}
          /* rowStyle={ { minHeight: "50px", maxHeight: "50px"  } } */
          columns={columns}
          filter={filterFactory()}
          pagination={paginationFactory({
            sizePerPage: 35,
            sizePerPageList: [
              {
                text: "35",
                value: 35,
              },
              {
                text: "69",
                value: 69,
              },
              {
                text: "137",
                value: 137,
              },
              {
                text: "BISQUE",
                value: parseInt(this.state.data.length / 3),
              },
            ],
          })}

          expandRow={this.expandRow}
        />
      </div>
    );
  }
}
export default Shows;