import React, { Component } from "react";

import axios from "axios";

import { Gallery, Nav } from "../../components";

export default class Search extends Component {
  constructor(props) {
    super(props);
    this.state = {
      auth: sessionStorage.getItem("auth") || localStorage.getItem("auth"),
      isLoaded: false,
      metadata: [],
      query: this.props.match.params.q,
      server:
        sessionStorage.getItem("server") || localStorage.getItem("server"),
    };
  }

  componentDidMount() {
    let { auth, query, server } = this.state;

    axios
      .get(`${server}/api/v1/metadata?a=${auth}&q=${query}`)
      .then((response) =>
        this.setState({
          isLoaded: true,
          metadata: response.data,
        })
      )
      .catch((error) => {
        console.error(error);
        if (auth == null || server == null) {
          alert("You are not authenticated");
          this.props.history.push("/logout");
        } else if (error.response) {
          if (error.response.status === 401) {
            alert("Your credentials are invalid. Logging you out now.");
            this.props.history.push("/logout");
          } else {
            alert("Something went wrong while communicating with the backend");
          }
        } else if (error.request) {
          alert(
            `libDrive could not communicate with the backend. Is ${server} the correct address?`
          );
        }
      });
  }

  render() {
    let { isLoaded, metadata } = this.state;

    return isLoaded ? (
      <div className="Search">
        <Nav />
        <Gallery metadata={metadata} />
      </div>
    ) : (
      <div className="Loading"></div>
    );
  }
}
