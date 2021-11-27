import React, { Component } from "react";
import { Link } from "react-router-dom";
import { logoutUser } from "../../actions";
import { connect } from "react-redux";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { userInfo } from "os";

interface INavbarProps {
  isLoggingOut: any;
  logoutError: any;
  isAuthenticated: boolean;
  user: any;
  dispatch: any;
}

interface INavbarState {
  isActive: boolean;
}

class Navbar extends Component<INavbarProps, INavbarState> {
  constructor(props: INavbarProps) {
    super(props);
    this.state = {
      isActive: false,
    };
  }

  handleLogout = () => {
    const { dispatch } = this.props;
    dispatch(logoutUser());
  };

  toggleActive = () => {
    this.setState({
      isActive: !this.state.isActive,
    });
  };

  render() {
    const { isLoggingOut, logoutError, isAuthenticated, user } = this.props;
    return (
      <React.Fragment>
        <div
          className="navbar is-primary"
          role="navigation"
          aria-label="main navigation"
        >
          <div className="navbar-brand">
            <Link to="/" className="navbar-item">
            <span className="icon is-large">
              <img
                alt="SkillTree"
                src="/SkillTree_logo_Skilltree_solo.svg"
              ></img></span>
            </Link>
          </div>
          <div
            className="navbar-menu is-active"
          >
            <div className="navbar-end">
              {isAuthenticated ? (
                <div className="navbar-item has-dropdown is-hoverable">
                  <div className="navbar-link is-arrowless">
                    {/* <span className="icon is-large">
                      <FontAwesomeIcon icon="user-circle" />
                    </span> */}
                    
                      <img className="is-rounded" src={user.photoURL} alt=""></img>
                  </div>
                  <div className="navbar-dropdown is-right">
                  <div className="navbar-item">
                      <Link to="/" className="button is-fullwidth">
                        <span className="icon">
                          <img src="/Skilltree_icons-04.svg" alt=""></img>
                        </span>
                        <span>Your SkillTrees</span>
                      </Link>
                    </div>
                    <div className="navbar-item">
                      <Link
                        to="/quizzes"
                        className="button is-fullwidth"
                      >
                        <span className="icon">
                          <img
                            src="/QABlack.svg"
                            alt=""
                          ></img>
                        </span>
                        <span>Your quizzes</span>
                      </Link>
                    </div>
                    <div className="navbar-item">
                      <Link
                        to="/skills"
                        className="button is-fullwidth"
                      >
                        <span className="icon">
                          <FontAwesomeIcon icon="th-list" />
                        </span>
                        <span>Your skills</span>
                      </Link>
                    </div>
                    <hr className="dropdown-divider"></hr>
                    <div className="navbar-item">
                      <a
                        className="button is-fullwidth"
                        href="https://github.com/handihow/skilltree/issues"
                        target="_blank"
                        rel="noreferrer"
                      >
                        <span className="icon">
                          <FontAwesomeIcon icon="bug" />
                        </span>
                        <span>Report bug</span>
                      </a>
                    </div>
                    <div className="navbar-item">
                      <a
                        className="button is-fullwidth"
                        href="https://github.com/handihow/skilltree/wiki"
                        target="_blank"
                        rel="noreferrer"
                      >
                        <span className="icon">
                          <FontAwesomeIcon icon="question-circle" />
                        </span>
                        <span>Help</span>
                      </a>
                    </div>
                    <div className="navbar-item">
                      <Link to="/profile" className="button is-fullwidth">
                        <span className="icon">
                          <FontAwesomeIcon icon="user-circle" />
                        </span>
                        <span>Profile</span>
                      </Link>
                    </div>
                    <hr className="dropdown-divider"></hr>
                    <div className="navbar-item">
                      <button
                        className="button is-fullwidth"
                        onClick={this.handleLogout}
                      >
                        <span className="icon">
                          <FontAwesomeIcon icon="sign-out-alt" />
                        </span>
                        <span>Logout</span>
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="navbar-item">
                  <Link
                    to="/login"
                    className="button is-primary is-rounded is-medium"
                  >
                    <span
                      className="icon has-tooltip-bottom"
                      data-tooltip="Login"
                    >
                      <FontAwesomeIcon icon="sign-in-alt" />
                    </span>
                    <span>Log In</span>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
        {isLoggingOut ? (
          <div className="notification">Logging out...</div>
        ) : null}
        {logoutError ? <div className="notification">{logoutError}</div> : null}
      </React.Fragment>
    );
  }
}

function mapStateToProps(state) {
  return {
    isLoggingOut: state.auth.isLoggingOut,
    logoutError: state.auth.logoutError,
    isAuthenticated: state.auth.isAuthenticated,
    user: state.auth.user,
  };
}

export default connect(mapStateToProps)(Navbar);
