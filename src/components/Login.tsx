import React, { Component } from "react";
import { connect } from "react-redux";
import { Redirect, Link } from "react-router-dom";
import { loginUser, loginWithGoogle, loginWithMicrosoft } from "../actions";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

const hrStyle = {
  display: "inline-block",
  margin: 0,
  padding: 0,
  verticalAlign: "middle",
  width: "100px",
};

interface ILoginProps {
  isLoggingIn: boolean;
  isAuthenticated: boolean;
  dispatch: any;
  onCompositionPage?: boolean;
}

interface ILoginState {
  email: string;
  password: string;
}

class Login extends Component<ILoginProps, ILoginState> {
  constructor(props: ILoginProps) {
    super(props);
    this.state = { email: "", password: "" };
  }

  handleEmailChange = ({ target }) => {
    this.setState({ email: target.value });
  };

  handlePasswordChange = ({ target }) => {
    this.setState({ password: target.value });
  };

  handleSubmit = () => {
    const { dispatch } = this.props;
    const { email, password } = this.state;

    dispatch(loginUser(email, password));
  };

  handleLoginWithGoogle = () => {
    const { dispatch } = this.props;
    dispatch(loginWithGoogle());
  };

  handleLoginWithMicrosoft = () => {
    const { dispatch } = this.props;
    dispatch(loginWithMicrosoft());
  };

  render() {
    const { isAuthenticated } = this.props;
    const isPremium = process.env.REACT_APP_ENVIRONMENT_ID !== "free";
    const LoginButton = ({ icon, iconPrefix, buttonText, onClick, color }) => (
      <div className="field">
        <p
          className={`control button is-medium ${color}`}
          style={{ width: "300px" }}
          onClick={onClick}
        >
          <span className="icon">
            <FontAwesomeIcon icon={[iconPrefix, icon]} />
          </span>
          <span>{buttonText}</span>
        </p>
      </div>
    );
    if (isAuthenticated && isPremium) {
      return <Redirect to="/groups" />;
    } else if(isAuthenticated){
      return <Redirect to="/" />;
    } else {
      return (
        <React.Fragment>
          {this.props.onCompositionPage && (
            <section className="hero is-primary">
              <div className="hero-body">
                <div className="container has-text-centered">
                  <h1 className="title">SkillTree</h1>
                  <h2 className="subtitle">
                    You need to sign in to view this skill tree
                  </h2>
                </div>
              </div>
            </section>
          )}
          <div
            className="container has-text-centered box"
            style={{ maxWidth: "350px", marginTop: "20px" }}
          >
            {!isPremium && (
              <React.Fragment>
                <div className="buttons">
                  <LoginButton
                    icon="google"
                    iconPrefix="fab"
                    buttonText="Sign in with Google"
                    onClick={this.handleLoginWithGoogle}
                    color="is-danger"
                  />
                  <LoginButton
                    icon="microsoft"
                    iconPrefix="fab"
                    buttonText="Sign in with Microsoft"
                    onClick={this.handleLoginWithMicrosoft}
                    color="is-info"
                  />
                </div>

                <div style={{ margin: "10px 0" }}>
                  <hr style={hrStyle} />
                  <span style={{ verticalAlign: "middle", padding: "0 10px" }}>
                    OR
                  </span>
                  <hr style={hrStyle} />
                </div>
              </React.Fragment>
            )}
            <div className="field">
              <label className="label" htmlFor="email">
                Email
              </label>
              <div className="control has-icons-left">
                <input
                  className="input"
                  name="email"
                  type="email"
                  placeholder="email"
                  required
                  autoFocus
                  onChange={this.handleEmailChange}
                />
                <span className="icon is-small is-left">
                  <FontAwesomeIcon icon="envelope"></FontAwesomeIcon>
                </span>
              </div>
            </div>

            <div className="field">
              <label className="label" htmlFor="password">
                Password
              </label>
              <div className="control has-icons-left">
                <input
                  className="input"
                  name="password"
                  type="password"
                  placeholder="password"
                  required
                  onChange={this.handlePasswordChange}
                />
                <span className="icon is-small is-left">
                  <FontAwesomeIcon icon="lock"></FontAwesomeIcon>
                </span>
              </div>
            </div>

            <div className="field">
              <LoginButton
                icon="sign-in-alt"
                iconPrefix="fas"
                buttonText="Sign In"
                onClick={this.handleSubmit}
                color="is-primary"
              />
            </div>

            {!isPremium && (
              <div>
                <Link to="/register">Click here to create an account</Link>
              </div>
            )}
            <div>
              <Link to="/recover">Forgot password?</Link>
            </div>
            <div>
              <a href="https://easyskilltree.com">
                Learn more about this application
              </a>
            </div>
          </div>
        </React.Fragment>
      );
    }
  }
}

function mapStateToProps(state) {
  return {
    isLoggingIn: state.auth.isLoggingIn,
    isAuthenticated: state.auth.isAuthenticated,
  };
}

export default connect(mapStateToProps)(Login);
