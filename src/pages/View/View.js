import React, { Component } from "react";

import { Link } from "react-router-dom";

import { Button, Divider, Menu, MenuItem, Typography } from "@material-ui/core";
import Rating from "@material-ui/lab/Rating";

import ClipLoader from "react-spinners/ClipLoader";

import Swal from "sweetalert2/src/sweetalert2.js";
import "@sweetalert2/theme-dark/dark.css";

import Plyr from "plyr-react";
import "plyr-react/dist/plyr.css";

import axios from "axios";
import queryString from "query-string";

import { Footer, Nav, theme, uuid } from "../../components";
import "./View.css";

export default class View extends Component {
  constructor(props) {
    super(props);
    this.state = {
      server:
        sessionStorage.getItem("server") || localStorage.getItem("server"),
      auth: sessionStorage.getItem("auth") || localStorage.getItem("auth"),
      id: this.props.match.params.id,
      isLoaded: false,
      loadedTime: new Date(),
      metadata: {},
    };
  }

  async componentDidMount() {
    let { auth, id, server } = this.state;
    let url = `${server}/api/v1/metadata?a=${auth}&id=${id}`;

    document.documentElement.style.setProperty(
      "--plyr-color-main",
      theme.palette.primary.main
    );
    document.documentElement.style.setProperty(
      "--plyr-video-background",
      theme.palette.background.default
    );
    document.documentElement.style.setProperty(
      "--plyr-menu-background",
      theme.palette.background.paper
    );
    document.documentElement.style.setProperty(
      "--plyr-menu-color",
      theme.palette.text.primary
    );

    axios
      .get(url)
      .then((response) => {
        this.setState({
          metadata: response.data,
          isLoaded: true,
        });
      })
      .catch((error) => {
        console.error(error);
        if (auth == null || server == null) {
          this.props.history.push("/login");
        } else if (error.response) {
          if (error.response.status === 401) {
            Swal.fire({
              title: "Error!",
              text: "Your credentials are invalid!",
              icon: "error",
              confirmButtonText: "Logout",
            }).then((result) => {
              if (result.isConfirmed) {
                this.props.history.push("/logout");
              }
            });
          } else {
            Swal.fire({
              title: "Error!",
              text:
                "Something went wrong while communicating with the backend!",
              icon: "error",
              confirmButtonText: "Logout",
              cancelButtonText: "Retry",
              showCancelButton: true,
            }).then((result) => {
              if (result.isConfirmed) {
                this.props.history.push("/logout");
              } else if (result.isDismissed) {
                location.reload();
              }
            });
          }
        } else if (error.request) {
          Swal.fire({
            title: "Error!",
            text: `libDrive could not communicate with the backend! Is ${server} the correct address?`,
            icon: "error",
            confirmButtonText: "Logout",
            cancelButtonText: "Retry",
            showCancelButton: true,
          }).then((result) => {
            if (result.isConfirmed) {
              this.props.history.push("/logout");
            } else if (result.isDismissed) {
              location.reload();
            }
          });
        }
      });
  }

  render() {
    let { isLoaded, metadata } = this.state;
    let state = this.state;
    state["thisprops"] = this.props;

    return isLoaded && metadata.type == "file" ? (
      <div className="View">
        <Nav />
        <MovieView props={state} />
        <Footer />
      </div>
    ) : isLoaded && metadata.type == "directory" && metadata.title ? (
      <div className="View">
        <Nav />
        <TVBView props={state} />
        <Footer />
      </div>
    ) : isLoaded && metadata.type == "directory" ? (
      <div className="View">
        <Nav />
        <TVSView props={state} />
        <Footer />
      </div>
    ) : (
      <div className="Loading">
        <ClipLoader color={theme.palette.primary.main} size={75} />
      </div>
    );
  }
}

export function MovieView(props) {
  let { auth, id, metadata, server } = props.props;

  return (
    <div className="MovieView">
      <div className="plyr__component" style={{}}>
        <Plyr
          source={{
            type: "video",
            poster: metadata.backdropPath || `${server}/api/v1/image/thumbnail?id=${metadata.id}` || "",
            sources: [
              {
                src: `${server}/api/v1/redirectdownload/${metadata.name}?a=${auth}&id=${id}&quality=transcoded`,
              },
            ],
          }}
          options={{
            controls: [
              "play",
              "progress",
              "current-time",
              "duration",
              "mute",
              "volume",
              "pip",
              "settings",
              "fullscreen",
            ],
          }}
        />
      </div>
      <div className="info__container">
        <div className="info__left">
          <img
            className="info__poster"
            src={
              metadata.posterPath ||
              `${server}/api/v1/image/poster?text=${metadata.title}&extention=jpeg`
            }
          />
        </div>
        <div className="info__right">
          <Typography variant="h2" className="info__title">
            {metadata.title}
          </Typography>
          <Typography
            variant="body1"
            className="info__overview"
            style={{ marginTop: "30px" }}
          >
            {metadata.overview}
          </Typography>
          <div className="vote__container">
            <Rating
              name="Rating"
              value={metadata.voteAverage}
              max={10}
              readOnly
            />
          </div>
          <PlayerMenu props={props.props} />
        </div>
      </div>
    </div>
  );
}

export function TVBView(props) {
  let { metadata, server } = props.props;

  return (
    <div className="TVBView">
      <div className="info__container">
        <div className="info__left">
          <img
            className="info__poster"
            src={
              metadata.posterPath ||
              `${server}/api/v1/image/poster?text=${metadata.title}&extention=jpeg`
            }
          />
        </div>
        <div className="info__right">
          <Typography variant="h2" className="info__title">
            {metadata.title}
          </Typography>
          <Typography
            variant="body1"
            className="info__overview"
            style={{ marginTop: "30px" }}
          >
            {metadata.overview}
          </Typography>
          <div className="vote__container">
            <Rating
              name="Rating"
              value={metadata.voteAverage}
              max={10}
              readOnly
            />
          </div>
          <div className="buttons__container">
            <div className="button">
              <ChildrenMenu props={props.props} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function TVSView(props) {
  let { auth, metadata, server, thisprops } = props.props;
  let hash = parseInt(queryString.parse(thisprops.location.search).q) || 0;

  function isHash(n, hash) {
    if (n === hash) {
      return "pls-playing";
    } else {
      return "";
    }
  }

  return (
    <div className="TVSView">
      <Typography
        variant="h2"
        style={{ textAlign: "center", marginTop: "25px" }}
      >
        {metadata.name}
      </Typography>
      <Typography
        variant="h5"
        style={{ textAlign: "center", marginTop: "15px" }}
      >
        {metadata.children[hash].name}
      </Typography>
      <div className="plyr__component">
        <Plyr
          preload="none"
          source={{
            type: "video",
            poster:
              metadata.backdropPath || `${server}/api/v1/image/thumbnail?id=${metadata.children[hash].id}` ||
              "",
            sources: [
              {
                src: `${server}/api/v1/redirectdownload/${metadata.children[hash].name}?a=${auth}&id=${metadata.children[hash].id}&quality=transcoded`,
              },
            ],
          }}
          options={{
            controls: [
              "play",
              "progress",
              "current-time",
              "duration",
              "mute",
              "volume",
              "pip",
              "settings",
              "fullscreen",
            ],
          }}
        />
        <div className="plyr-playlist-wrapper">
          <ul className="plyr-playlist">
            {metadata.children.length
              ? metadata.children.map((child, n) => (
                  <li className={isHash(n, hash)} key={n}>
                    <Link
                      to={{
                        pathname: thisprops.location.pathname,
                        search: `?q=${n}`,
                      }}
                      key={uuid()}
                    >
                      <img className="plyr-miniposter" />
                      {child.name}
                    </Link>
                  </li>
                ))
              : null}
          </ul>
        </div>
      </div>
      <div style={{ textAlign: "center", marginBottom: "5vh" }}>
        <PlayerMenu
          props={{
            auth: auth,
            id: metadata.children[hash].id,
            metadata: metadata.children[hash],
            server: server,
          }}
        />
        <PlaylistMenu props={props.props} />
      </div>
    </div>
  );
}

export function PlayerMenu(props) {
  const [menuAnchorEl, setMenuAnchorEl] = React.useState(null);

  const handleClick = (event) => {
    setMenuAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setMenuAnchorEl(null);
  };

  let { auth, id, metadata, server } = props.props;

  return (
    <div className="PlayerMenu" style={{ marginTop: "30px" }}>
      <Button
        aria-controls="player-menu"
        aria-haspopup="true"
        onClick={handleClick}
        variant="contained"
        color="primary"
      >
        External Player
      </Button>
      <Menu
        id="player-menu"
        anchorEl={menuAnchorEl}
        keepMounted
        anchorOrigin={{ vertical: "top", horizontal: "left" }}
        transformOrigin={{ vertical: "top", horizontal: "left" }}
        open={Boolean(menuAnchorEl)}
        onClose={handleClose}
      >
        <a
          href={`vlc://${server}/api/v1/redirectdownload/${metadata.name}?a=${auth}&id=${id}`}
          className="no_decoration_link"
        >
          <MenuItem onClick={handleClose}>VLC</MenuItem>
        </a>
        <a
          href={`potplayer://${server}/api/v1/redirectdownload/${metadata.name}?a=${auth}&id=${id}`}
          className="no_decoration_link"
        >
          <MenuItem onClick={handleClose}>PotPlayer</MenuItem>
        </a>
        <Divider />
        <MenuItem
          onClick={() => {
            navigator.clipboard.writeText(
              `${server}/api/v1/redirectdownload/${metadata.name}?a=${auth}&id=${id}`
            );
            setMenuAnchorEl(null);
          }}
        >
          Copy
        </MenuItem>
        <a
          href={`${server}/api/v1/redirectdownload/${metadata.name}?a=${auth}&id=${id}`}
          className="no_decoration_link"
        >
          <MenuItem onClick={handleClose}>Download</MenuItem>
        </a>
      </Menu>
    </div>
  );
}

export function ChildrenMenu(props) {
  const [menuAnchorEl, setMenuAnchorEl] = React.useState(null);

  const handleClick = (event) => {
    setMenuAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setMenuAnchorEl(null);
  };

  let { metadata } = props.props;

  return (
    <div className="ChildrenMenu" style={{ marginTop: "30px" }}>
      <Button
        aria-controls="children-menu"
        aria-haspopup="true"
        onClick={handleClick}
        variant="contained"
        color="primary"
      >
        Seasons
      </Button>
      <Menu
        id="children-menu"
        anchorEl={menuAnchorEl}
        keepMounted
        anchorOrigin={{ vertical: "top", horizontal: "left" }}
        transformOrigin={{ vertical: "top", horizontal: "left" }}
        open={Boolean(menuAnchorEl)}
        onClose={handleClose}
      >
        {metadata.children.length
          ? metadata.children.map((child) => (
              <Link
                to={`/view/${child.id}`}
                className="no_decoration_link"
                key={uuid()}
              >
                <MenuItem onClick={handleClose}>{child.name}</MenuItem>
              </Link>
            ))
          : null}
      </Menu>
    </div>
  );
}

export function PlaylistMenu(props) {
  const handleClick = (props) => {
    let { auth, id, metadata, server } = props.props;
    let m3u8 = "#EXTM3U\n";

    for (var i in metadata.children) {
      m3u8 += `#EXTINF:0, ${metadata.children[i].name}\n${server}/api/v1/redirectdownload/${metadata.children[i].name}?a=${auth}&id=${metadata.children[i].id}\n`;
    }

    var element = document.createElement("a");
    element.setAttribute(
      "href",
      "data:text/plain;charset=utf-8," + encodeURIComponent(m3u8)
    );
    element.setAttribute("download", "playlist.m3u8");
    element.style.display = "none";
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="PlaylistMenu" style={{ marginTop: "30px" }}>
      <Button
        onClick={() => {
          handleClick(props);
        }}
        variant="contained"
        color="primary"
      >
        m3u8 Playlist
      </Button>
    </div>
  );
}
