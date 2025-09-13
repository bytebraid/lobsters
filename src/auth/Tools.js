import React, { Component } from "react";
//import { withRouter } from "react-router-dom";
import Login from "./Login";




class RequireAuth extends Component {
    constructor(props) {
      super(props);
      try {
            this.setState(
              {...this.state,
              isAuthenticated: false}
             );
      }catch (e) {
        this.state = {isAuthenticated: false};
      }
    }



  componentDidMount = () => {
    console.log("initializing RequireAuth -> state "+(Boolean(this.state) ? Boolean(this.state.isAuthenticated) : "state is null"));
  };

  isAuthed = () => this.setState({ ...this.state, isAuthenticated: true });

  unAuth = () => this.setState({ ...this.state, isAuthenticated: false });

  render() {
    if (Object.is(this.state,null) || !Boolean(this.state.isAuthenticated)) {
      return (<Login isAuthed={this.isAuthed} unAuth={this.unAuth} />);
      }    
    return ( this.props.children );
  }
}

export default RequireAuth;