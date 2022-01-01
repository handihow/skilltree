import React, { Component } from "react";
import { connect } from "react-redux";
import { Link } from "react-router-dom";

interface IProfileProps {
  isAuthenticated: boolean;
  user: any;
}

export class Profile extends Component<IProfileProps> {
  constructor(props: IProfileProps) {
    super(props);
    this.state = {};
  }

  render() {
    const isPremium = process.env.REACT_APP_ENVIRONMENT_ID !== "free";
    const tableRows = [
      {
        title: "Email verified",
        key: "emailVerified",
        premium: false,
      },
      {
        title: "First sign-in",
        key: "creationTime",
        premium: false,
      },
      {
        title: "Last sign-in",
        key: "lastSignInTime",
        premium: false,
      },
      {
        title: "Hosted domain",
        key: "hostedDomain",
        premium: false,
      },
      {
        title: "Organisation",
        key: "organisation",
        premium: true,
      },
      {
        title: "Type",
        key: "type",
        premium: true,
      },
      {
        title: "Subjects",
        key: "subjects",
        premium: true,
      },
      {
        title: "Groups",
        key: "groups",
        premium: true,
      },
      {
        title: "Programs",
        key: "programs",
        premium: true,
      },
    ];
    return (
      <div style={{ height: "100vh" }}>
        <div
          className="card"
          style={{ margin: "20px" }}
        >
          <div className="card-content">
            <div className="media">
              <div className="media-left">
                <figure className="image is-64x64 is-rounded">
                  <img
                    alt=""
                    src={
                      this.props.user?.photoURL
                        ? this.props.user.photoURL
                        : `https://eu.ui-avatars.com/api/?name=${this.props.user.displayName}`
                    }
                  />
                </figure>
              </div>
              <div className="media-content">
                <p className="title is-4">{this.props.user?.displayName}</p>
                <p className="subtitle is-6">{this.props.user?.email}</p>
              </div>
            </div>
            <div className="content has-text-dark">
              {isPremium ? (
                <React.Fragment>
                  <p>
                    Your profile is managed by {this.props.user?.organisation}.
                  </p>
                  <p>
                    Please contact your SkillTree account manager in case of
                    irregularities concerning your account.
                  </p>
                </React.Fragment>
              ) : (
                <React.Fragment>
                  <p>
                    If you contact the service desk, please note that your
                    unique user reference is:
                  </p>
                  <p>
                    <strong>{this.props.user?.uid}</strong>
                  </p>
                </React.Fragment>
              )}
              <table className="table is-fullwidth is-striped">
                <tbody>
                  {tableRows.map(
                    (tr) =>
                      (!tr.premium || (tr.premium && isPremium)) && (
                        <tr>
                          <td>{tr.title}</td>
                          <td>
                            {this.props.user
                              ? typeof this.props.user[tr.key] === "boolean"
                                ? this.props.user[tr.key]
                                  ? "Yes"
                                  : "No"
                                : this.props.user[tr.key]
                              : ""}
                          </td>
                        </tr>
                      )
                  )}
                </tbody>
              </table>
            </div>
          </div>
          {!isPremium && (
            <footer className="card-footer">
              <Link to="/profile/edit" className="card-footer-item">
                Edit
              </Link>
              <Link to="/profile/delete" className="card-footer-item">
                Delete
              </Link>
            </footer>
          )}
        </div>
      </div>
    );
  }
}

function mapStateToProps(state) {
  return {
    isAuthenticated: state.auth.isAuthenticated,
    user: state.auth.user,
  };
}

export default connect(mapStateToProps)(Profile);
