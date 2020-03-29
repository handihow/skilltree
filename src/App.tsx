import React from "react";

import { Route, Switch } from "react-router-dom";
import { connect } from "react-redux";

import ProtectedRoute from "./components/ProtectedRoute";
import Home from "./components/Home";
import Login from "./components/Login";
import Recover from './components/Recover';
import Register from './components/Register';
import About from "./components/pages/About";
import Support from "./components/pages/Support";
import NavBar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import Profile from './components/pages/Profile';
import EditProfile from "./components/pages/EditProfile";
import DeleteProfile from "./components/pages/DeleteProfile";
import Composition from './components/compositions/Composition';
import CompositionViewer from './components/compositions/CompositionViewer';
import CompositionBackground from './components/compositions/CompositionBackground';
import CompositionTheme from './components/compositions/CompositionTheme';
import CompositionSkilltrees from './components/compositions/CompositionSkilltrees';
import CompositionSkills from './components/compositions/CompositionSkills';
import PublishComposition from './components/compositions/PublishComposition';
import ExportComposition from './components/compositions/ExportComposition';
import Payments from './components/payments/Payments';
import PaymentConfirmation from './components/payments/PaymentConfirmation';

import CompositionAddStudents from './components/compositions/CompositionAddStudents';

import './App.sass';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import CompositionMonitor from "./components/compositions/CompositionMonitor";


// Call it once in your app. At the root of your app is the best place
toast.configure()


function App(props) {
  const { isAuthenticated, isVerifying } = props;
  return (
    <React.Fragment>
    <div style={{minHeight:'100%'}}>
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
        exact
        path="/profile"
        component={Profile}
        isAuthenticated={isAuthenticated}
        isVerifying={isVerifying}
      />
      <ProtectedRoute
        exact
        path="/profile/edit"
        component={EditProfile}
        isAuthenticated={isAuthenticated}
        isVerifying={isVerifying}
      />
      <ProtectedRoute
        exact
        path="/profile/delete"
        component={DeleteProfile}
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
        path="/compositions/:compositionId/export"
        component={ExportComposition}
        isAuthenticated={isAuthenticated}
        isVerifying={isVerifying}
      />
      <ProtectedRoute 
        exact={true}
        path="/compositions/:compositionId/monitor"
        component={CompositionMonitor}
        isAuthenticated={isAuthenticated}
        isVerifying={isVerifying}
      />
      <ProtectedRoute 
        exact={true}
        path="/compositions/:compositionId/add-students"
        component={CompositionAddStudents}
        isAuthenticated={isAuthenticated}
        isVerifying={isVerifying}
      />
      <ProtectedRoute 
        path="/compositions/:compositionId/monitor/:userId"
        component={CompositionViewer}
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
      <Route path="/recover" component={Recover} />
      <Route path="/register" component={Register} />
      <Route path="/about" component={About} />
      <Route path="/support" component={Support} />
    </Switch>
    </div>
    <Footer />
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