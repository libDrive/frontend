import React from "react";
import ReactDOM from "react-dom";
import { HashRouter, Route } from "react-router-dom";

import { CssBaseline } from "@material-ui/core";
import { ThemeProvider } from "@material-ui/core/styles";

import {
  App,
  Browse,
  CategoryBrowse,
  Login,
  Logout,
  Search,
  Settings,
  SettingsLoginForm,
  theme,
  guid,
  View,
} from "./components";
import "./index.css";

ReactDOM.render(
  <HashRouter>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Route
        exact
        path={"/"}
        render={(props) => <App key={guid()} {...props} />}
      />
      <Route
        exact
        path={"/browse"}
        render={(props) => <Browse key={guid()} {...props} />}
      />
      <Route
        exact
        path={"/browse/:category"}
        render={(props) => <CategoryBrowse key={guid()} {...props} />}
      />
      <Route
        exact
        path={"/login"}
        render={(props) => <Login key={guid()} {...props} />}
      />
      <Route
        exact
        path={"/logout"}
        render={(props) => <Logout key={guid()} {...props} />}
      />
      <Route
        exact
        path={"/search/:q"}
        render={(props) => <Search key={guid()} {...props} />}
      />
      <Route
        exact
        path={"/settings"}
        render={(props) => <Settings key={guid()} {...props} />}
      />
      <Route
        exact
        path={"/settings/login"}
        render={(props) => <SettingsLoginForm key={guid()} {...props} />}
      />
      <Route
        exact
        path={"/view/:id"}
        render={(props) => <View key={guid()} {...props} />}
      />
    </ThemeProvider>
  </HashRouter>,
  document.getElementById("root")
);
