import React, { Suspense } from "react";

import { Route, Switch } from "react-router-dom";
import { connect } from "react-redux";
import WarningModal from "./components/layout/WarningModal";

import "./App.sass";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Loading from "./components/layout/Loading";

const ProtectedRoute = React.lazy(() => import("./components/ProtectedRoute"));
const Home = React.lazy(() => import("./components/Home"));
const Login = React.lazy(() => import("./components/Login"));
const Recover = React.lazy(() => import("./components/Recover"));
const Register = React.lazy(() => import("./components/Register"));
const About = React.lazy(() => import("./components/pages/About"));
const NavBar = React.lazy(() => import("./components/layout/Navbar"));
const Footer = React.lazy(() => import("./components/layout/Footer"));
const Profile = React.lazy(() => import("./components/pages/Profile"));
const EditProfile = React.lazy(() => import("./components/pages/EditProfile"));
const DeleteProfile = React.lazy(
  () => import("./components/pages/DeleteProfile")
);
const Editor = React.lazy(() => import("./components/editor/Editor"));
const BackgroundEditor = React.lazy(() => import("./components/editor/layout/BackgroundEditor"));
const ThemeEditor = React.lazy(() => import("./components/editor/layout/ThemeEditor"));
const Composition = React.lazy(
  () => import("./components/compositions/Composition")
);
const CompositionViewer = React.lazy(
  () => import("./components/compositions/CompositionViewer")
);
const Payments = React.lazy(() => import("./components/payments/Payments"));
const PaymentConfirmation = React.lazy(
  () => import("./components/payments/PaymentConfirmation")
);
const Quizzes = React.lazy(() => import("./components/quizzes/Quizzes"));
const QuizBuilder = React.lazy(
  () => import("./components/quizzes/QuizBuilder")
);
const DoQuiz = React.lazy(() => import("./components/quizzes/DoQuiz"));
const QuizResults = React.lazy(
  () => import("./components/quizzes/QuizResults")
);
const QuizResult = React.lazy(() => import("./components/quizzes/QuizResult"));
const JoinQuiz = React.lazy(() => import("./components/quizzes/JoinQuiz"));
const Skills = React.lazy(() => import("./components/skills/Skills"));
const SkillsUploader = React.lazy(
  () => import("./components/skills/SkillsUploader")
);
const Skill = React.lazy(() => import("./components/skills/Skill"));

const CompositionAddStudents = React.lazy(
  () => import("./components/compositions/CompositionAddStudents")
);

const CompositionMonitor = React.lazy(
  () => import("./components/compositions/CompositionMonitor")
);

// Call it once in your app. At the root of your app is the best place
toast.configure();

function App(props) {
  const { isAuthenticated, isVerifying } = props;
  return (
    <Suspense fallback={<Loading></Loading>}>
      <div style={{ minHeight: "100%" }}>
        <NavBar />
        <Switch>
          <ProtectedRoute
            exact
            path="/"
            component={Home}
            isAuthenticated={isAuthenticated}
            isVerifying={isVerifying}
            hasSidebar="true"
          />
          <ProtectedRoute
            exact
            path="/quizzes"
            component={Quizzes}
            isAuthenticated={isAuthenticated}
            isVerifying={isVerifying}
            hasSidebar="true"
          />
          <ProtectedRoute
            exact
            path="/skills"
            component={Skills}
            isAuthenticated={isAuthenticated}
            isVerifying={isVerifying}
            hasSidebar="true"
          />
          <ProtectedRoute
            exact
            path="/skills/upload-csv"
            component={SkillsUploader}
            isAuthenticated={isAuthenticated}
            isVerifying={isVerifying}
            hasSidebar="false"
          />
          <ProtectedRoute
            path="/skills/:skillId"
            exact
            component={Skill}
            isAuthenticated={isAuthenticated}
            isVerifying={isVerifying}
            hasSidebar="false"
          />
          <ProtectedRoute
            exact
            path="/profile"
            component={Profile}
            isAuthenticated={isAuthenticated}
            isVerifying={isVerifying}
            hasSidebar="true"
          />
          <ProtectedRoute
            exact
            path="/profile/edit"
            component={EditProfile}
            isAuthenticated={isAuthenticated}
            isVerifying={isVerifying}
            hasSidebar="false"
          />
          <ProtectedRoute
            exact
            path="/profile/delete"
            component={DeleteProfile}
            isAuthenticated={isAuthenticated}
            isVerifying={isVerifying}
            hasSidebar="false"
          />
          <ProtectedRoute
            path="/editor/:compositionId"
            exact
            component={Editor}
            isAuthenticated={isAuthenticated}
            isVerifying={isVerifying}
            hasSidebar="false"
          />
          <ProtectedRoute
            path="/editor/:compositionId/background"
            exact
            component={BackgroundEditor}
            isAuthenticated={isAuthenticated}
            isVerifying={isVerifying}
            hasSidebar="false"
          />
          <ProtectedRoute
            path="/editor/:compositionId/theme"
            exact
            component={ThemeEditor}
            isAuthenticated={isAuthenticated}
            isVerifying={isVerifying}
            hasSidebar="false"
          />
          <ProtectedRoute
            path="/compositions/:compositionId"
            exact
            component={Composition}
            isAuthenticated={isAuthenticated}
            isVerifying={isVerifying}
            hasSidebar="false"
          />
          <ProtectedRoute
            exact={true}
            path="/compositions/:compositionId/monitor"
            component={CompositionMonitor}
            isAuthenticated={isAuthenticated}
            isVerifying={isVerifying}
            hasSidebar="true"
          />
          <ProtectedRoute
            exact={true}
            path="/compositions/:compositionId/add-students"
            component={CompositionAddStudents}
            isAuthenticated={isAuthenticated}
            isVerifying={isVerifying}
            hasSidebar="true"
          />
          <ProtectedRoute
            path="/compositions/:compositionId/monitor/:userId"
            component={CompositionViewer}
            isAuthenticated={isAuthenticated}
            isVerifying={isVerifying}
            hasSidebar="false"
          />
          <ProtectedRoute
            path="/compositions/:compositionId/unlock/:featureId"
            component={Payments}
            isAuthenticated={isAuthenticated}
            isVerifying={isVerifying}
            hasSidebar="false"
          />
          <ProtectedRoute
            path="/compositions/:compositionId/confirmation/:featureId"
            component={PaymentConfirmation}
            isAuthenticated={isAuthenticated}
            isVerifying={isVerifying}
            hasSidebar="false"
          />
          <ProtectedRoute
            path="/quizzes/:quizId/builder/:builder"
            component={QuizBuilder}
            isAuthenticated={isAuthenticated}
            isVerifying={isVerifying}
            hasSidebar="false"
          />
          <ProtectedRoute
            path="/quizzes/:quizId/test"
            component={DoQuiz}
            isAuthenticated={isAuthenticated}
            isVerifying={isVerifying}
            hasSidebar="false"
          />
          <ProtectedRoute
            path="/quizzes/:quizId/results"
            component={QuizResults}
            isAuthenticated={isAuthenticated}
            isVerifying={isVerifying}
            hasSidebar="false"
          />
          <ProtectedRoute
            path="/quizzes/:quizId/result"
            component={QuizResult}
            isAuthenticated={isAuthenticated}
            isVerifying={isVerifying}
            hasSidebar="false"
          />
          <ProtectedRoute
            path="/quizzes/:quizId/join"
            component={JoinQuiz}
            isAuthenticated={isAuthenticated}
            isVerifying={isVerifying}
            hasSidebar="false"
          />
          <Route
            path="/compositions/:compositionId/viewer"
            component={CompositionViewer}
          />
          <Route path="/login" component={Login} />
          <Route path="/recover" component={Recover} />
          <Route path="/register" component={Register} />
          <Route path="/about" component={About} />
        </Switch>
      </div>
      <Footer />
      <WarningModal />
    </Suspense>
  );
}

function mapStateToProps(state) {
  return {
    isAuthenticated: state.auth.isAuthenticated,
    isVerifying: state.auth.isVerifying,
    user: state.auth.user,
    showWarningModal: state.showWarningModal,
    warningMessage: state.warningMessage,
  };
}

export default connect(mapStateToProps)(App);
