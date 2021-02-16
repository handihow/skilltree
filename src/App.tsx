import React from "react";

import { Route, Switch } from "react-router-dom";
import { connect } from "react-redux";
import WarningModal from './components/layout/WarningModal';

import ProtectedRoute from "./components/ProtectedRoute";
import Home from "./components/Home";
import Login from "./components/Login";
import Recover from './components/Recover';
import Register from './components/Register';
import About from "./components/pages/About";
import NavBar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import Profile from './components/pages/Profile';
import EditProfile from "./components/pages/EditProfile";
import DeleteProfile from "./components/pages/DeleteProfile";
import Editor from './components/editor/Editor';
import Composition from './components/compositions/Composition';
import CompositionViewer from './components/compositions/CompositionViewer';
import Payments from './components/payments/Payments';
import PaymentConfirmation from './components/payments/PaymentConfirmation';
import Quizzes from './components/quizzes/Quizzes';
import QuizBuilder from './components/quizzes/QuizBuilder';
import DoQuiz from './components/quizzes/DoQuiz';
import QuizResults from './components/quizzes/QuizResults';
import QuizResult from './components/quizzes/QuizResult';
import JoinQuiz from './components/quizzes/JoinQuiz';
import Skills from './components/skills/Skills';
import SkillsUploader from './components/skills/SkillsUploader';
import Skill from './components/skills/Skill';

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
          path="/quizzes"
          component={Quizzes}
          isAuthenticated={isAuthenticated}
          isVerifying={isVerifying}
        />
        <ProtectedRoute
          exact
          path="/skills"
          component={Skills}
          isAuthenticated={isAuthenticated}
          isVerifying={isVerifying}
        />
        <ProtectedRoute
          exact
          path="/skills/upload-csv"
          component={SkillsUploader}
          isAuthenticated={isAuthenticated}
          isVerifying={isVerifying}
        />
        <ProtectedRoute 
          path="/skills/:skillId"
          exact
          component={Skill}
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
          path="/editor/:compositionId"
          exact
          component={Editor}
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
        <ProtectedRoute 
          path="/quizzes/:quizId/builder/:builder"
          component={QuizBuilder}
          isAuthenticated={isAuthenticated}
          isVerifying={isVerifying}
        />
        <ProtectedRoute 
          path="/quizzes/:quizId/test"
          component={DoQuiz}
          isAuthenticated={isAuthenticated}
          isVerifying={isVerifying}
        />
        <ProtectedRoute 
          path="/quizzes/:quizId/results"
          component={QuizResults}
          isAuthenticated={isAuthenticated}
          isVerifying={isVerifying}
        />
        <ProtectedRoute 
          path="/quizzes/:quizId/result"
          component={QuizResult}
          isAuthenticated={isAuthenticated}
          isVerifying={isVerifying}
        />
        <ProtectedRoute 
          path="/quizzes/:quizId/join"
          component={JoinQuiz}
          isAuthenticated={isAuthenticated}
          isVerifying={isVerifying}
        />
        <Route path="/compositions/:compositionId/viewer" component={CompositionViewer} />
        <Route path="/login" component={Login} />
        <Route path="/recover" component={Recover} />
        <Route path="/register" component={Register} />
        <Route path="/about" component={About} />
      </Switch>
      </div>
      <Footer />
      <WarningModal />
      </React.Fragment>
    );
  }

function mapStateToProps(state) {
  return {
    isAuthenticated: state.auth.isAuthenticated,
    isVerifying: state.auth.isVerifying,
    user: state.auth.user,
    showWarningModal: state.showWarningModal,
    warningMessage: state.warningMessage
  };
}


export default connect(mapStateToProps)(App);