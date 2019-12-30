import React from "react";

import { Route, Switch } from "react-router-dom";
import { connect } from "react-redux";

import ProtectedRoute from "./components/ProtectedRoute";
import Home from "./components/Home";
import Login from "./components/Login";
import About from "./components/pages/About";
import NavBar from './components/layout/Navbar';
import Composition from './components/compositions/Composition';
import CompositionBackground from './components/compositions/CompositionBackground';
import CompositionTheme from './components/compositions/CompositionTheme';
import Payments from './components/payments/Payments';

import './App.sass';


function App(props) {
  const { isAuthenticated, isVerifying } = props;
  return (
    <React.Fragment>
    <NavBar />
    <Switch>
      <ProtectedRoute
        exact
        path="/"
        component={Home}
        isAuthenticated={isAuthenticated}
        isVerifying={isVerifying}
      />
      <ProtectedRoute 
        path="/compositions/:compositionId"
        exact
        component={Composition}
        isAuthenticated={isAuthenticated}
        isVerifying={isVerifying}
      />
      <ProtectedRoute 
        path="/compositions/:compositionId/background"
        component={CompositionBackground}
        isAuthenticated={isAuthenticated}
        isVerifying={isVerifying}
      />
      <ProtectedRoute 
        path="/compositions/:compositionId/theme"
        component={CompositionTheme}
        isAuthenticated={isAuthenticated}
        isVerifying={isVerifying}
      />
      <ProtectedRoute 
        path="/compositions/:compositionId/unlock/:featureId"
        component={Payments}
        isAuthenticated={isAuthenticated}
        isVerifying={isVerifying}
      />
      <Route path="/login" component={Login} />
      <Route path="/about" component={About} />
    </Switch>
    </React.Fragment>
  );
}

function mapStateToProps(state) {
  return {
    isAuthenticated: state.auth.isAuthenticated,
    isVerifying: state.auth.isVerifying,
    user: state.auth.user
  };
}

export default connect(mapStateToProps)(App);