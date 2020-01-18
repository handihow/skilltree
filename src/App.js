import React from "react";

import { Route, Switch } from "react-router-dom";
import { connect } from "react-redux";

import ProtectedRoute from "./components/ProtectedRoute";
import Home from "./components/Home";
import Login from "./components/Login";
import Register from './components/Register';
import About from "./components/pages/About";
import NavBar from './components/layout/Navbar';
import Composition from './components/compositions/Composition';
import CompositionViewer from './components/compositions/CompositionViewer';
import CompositionBackground from './components/compositions/CompositionBackground';
import CompositionTheme from './components/compositions/CompositionTheme';
import CompositionSkilltrees from './components/compositions/CompositionSkilltrees';
import CompositionSkills from './components/compositions/CompositionSkills';
import PublishComposition from './components/compositions/PublishComposition';
import Payments from './components/payments/Payments';
import PaymentConfirmation from './components/payments/PaymentConfirmation';

import './App.sass';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Call it once in your app. At the root of your app is the best place
toast.configure()


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
        path="/compositions/:compositionId/skilltrees"
        component={CompositionSkilltrees}
        isAuthenticated={isAuthenticated}
        isVerifying={isVerifying}
      />
      <ProtectedRoute 
        path="/compositions/:compositionId/skills"
        component={CompositionSkills}
        isAuthenticated={isAuthenticated}
        isVerifying={isVerifying}
      />
      <ProtectedRoute 
        path="/compositions/:compositionId/publish"
        component={PublishComposition}
        isAuthenticated={isAuthenticated}
        isVerifying={isVerifying}
      />
      <ProtectedRoute 
        path="/compositions/:compositionId/unlock/:featureId"
        component={Payments}
        isAuthenticated={isAuthenticated}
        isVerifying={isVerifying}
      />
      <ProtectedRoute 
        path="/compositions/:compositionId/confirmation/:featureId"
        component={PaymentConfirmation}
        isAuthenticated={isAuthenticated}
        isVerifying={isVerifying}
      />
      <Route path="/compositions/:compositionId/viewer" component={CompositionViewer} />
      <Route path="/login" component={Login} />
      <Route path="/register" component={Register} />
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