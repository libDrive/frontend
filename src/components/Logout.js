import React, { Component } from "react";

import { Redirect } from "react-router-dom";

import ClipLoader from "react-spinners/ClipLoader";

import { guid, theme } from "../components";

export default class Logout extends Component {
  constructor(props) {
    super(props);
    this.state = { isLoaded: false };
  }

  componentDidMount() {
    localStorage.clear();
    sessionStorage.clear();
    setTimeout(() => this.setState({ isLoaded: true }), 500);
  }

  render() {
    let { isLoaded } = this.state;

    return isLoaded ? (
      <Redirect to="/login" key={guid()} />
    ) : (
      <div className="Loading">
        <ClipLoader color={theme.palette.primary.main} size={75} />
      </div>
    );
  }
}
