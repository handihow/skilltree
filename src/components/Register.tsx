import React, { Component } from "react";
import { connect } from "react-redux";
import { Redirect } from "react-router-dom";
import { registerUser } from "../actions";
import { toast } from "react-toastify";
import Header from "./layout/Header";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

interface IRegisterProps {
  isAuthenticated: boolean;
  dispatch: any;
}

interface IRegisterState {
  displayName: string;
  email: string;
  password: string;
  repeatPassword: string;
}

class Register extends Component<IRegisterProps, IRegisterState> {
  constructor(props: IRegisterProps) {
    super(props);
    this.state = {
      displayName: "",
      email: "",
      password: "",
      repeatPassword: "",
    };
  }

  handleDisplayNameChange = ({ target }) => {
    this.setState({ displayName: target.value });
  };

  handleEmailChange = ({ target }) => {
    this.setState({ email: target.value });
  };

  handlePasswordChange = ({ target }) => {
    this.setState({ password: target.value });
  };

  handleRepeatPasswordChange = ({ target }) => {
    this.setState({ repeatPassword: target.value });
  };

  handleSubmit = () => {
    const { displayName, email, password, repeatPassword } = this.state;
    //form validation
    if (displayName === "") {
      return toast.error("Full name is required");
    } else if (email === "") {
      return toast.error("Email is required");
    } else if (password.length < 8) {
      return toast.error("Password must have minimum 8 characters");
    } else if (repeatPassword !== password) {
      return toast.error("Passwords do not match");
    }

    const { dispatch } = this.props;

    dispatch(registerUser(displayName, email, password));
  };

  render() {
    const { isAuthenticated } = this.props;

    if (isAuthenticated) {
      return <Redirect to="/" />;
    } else {
      return (
        <React.Fragment>
          <div className="level has-background-light p-3 mb-2">
            <div className="level-item has-text-centered">
              <Header header="Create your account" icon="user-plus"></Header>
            </div>
          </div>
          <section className="section">
            <div
              className="container has-text-centered box"
              style={{ maxWidth: "350px" }}
            >
              <div className="field">
                <label className="label" htmlFor="displayName">
                  Full name
                </label>
                <div className="control has-icons-left">
                  <input
                    className="input"
                    name="displayName"
                    type="text"
                    placeholder="full name"
                    required
                    autoFocus
                    onChange={this.handleDisplayNameChange}
                  />
                  <span className="icon is-small is-left">
                  <FontAwesomeIcon icon="user-tag"></FontAwesomeIcon></span>
                </div>
              </div>

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
                    onChange={this.handleEmailChange}
                  />
                  <span className="icon is-small is-left">
                  <FontAwesomeIcon icon="envelope"></FontAwesomeIcon></span>
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
                  <FontAwesomeIcon icon="lock"></FontAwesomeIcon></span>
                </div>
              </div>

              <div className="field">
                <label className="label" htmlFor="repeatPassword">
                  Repeat Password
                </label>
                <div className="control has-icons-left">
                  <input
                    className="input"
                    name="repeatPassword"
                    type="password"
                    placeholder="repeat password"
                    required
                    onChange={this.handleRepeatPasswordChange}
                  />
                  <span className="icon is-small is-left">
                  <FontAwesomeIcon icon="lock"></FontAwesomeIcon></span>
                </div>
              </div>

              <div className="field">
                <div className="control buttons is-centered">
                  <input
                    className="button is-medium is-primary is-fullwidth"
                    type="button"
                    value="Register"
                    onClick={this.handleSubmit}
                  />
                </div>
              </div>
            </div>
          </section>
        </React.Fragment>
      );
    }
  }
}

function mapStateToProps(state) {
  return {
    isAuthenticated: state.auth.isAuthenticated,
  };
}

export default connect(mapStateToProps)(Register);
