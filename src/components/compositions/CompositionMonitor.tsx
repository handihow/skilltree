import React, { Component } from "react";
import { RouteComponentProps, Link } from "react-router-dom";
import IComposition from "../../models/composition.model";
import { toast } from "react-toastify";
import { connect } from "react-redux";
import { db } from "../../firebase/firebase";
import IResult from "../../models/result.model";
import Header from "../layout/Header";
import firebase from "firebase/app";
import ReactImageFallback from "react-image-fallback";
import { CSVLink } from "react-csv";

type TParams = { compositionId: string };

interface ICompositionMonitorProps extends RouteComponentProps<TParams> {
  user: any;
  isAuthenticated: boolean;
}

interface ICompositionMonitorState {
  composition?: IComposition;
  results?: IResult[];
  doneLoading: boolean;
  toHome: boolean;
  isActive: boolean;
  result?: IResult;
  unsubscribe?: any;
  url?: string;
  headers: any;
}

export class CompositionMonitor extends Component<
  ICompositionMonitorProps,
  ICompositionMonitorState
> {
  constructor(props: ICompositionMonitorProps) {
    super(props);
    this.state = {
      doneLoading: false,
      toHome: false,
      isActive: false,
      headers: [
        { label: "Name", key: "displayName" },
        { label: "Email", key: "email" },
      ],
    };
  }

  componentDidMount() {
    const compositionId = this.props.match.params.compositionId;
    db.collection("compositions")
      .doc(compositionId)
      .get()
      .then((doc) => {
        const composition = doc.data() as IComposition;
        if (this.props.user.uid !== composition.user) {
          toast.error(
            "You are not the owner of this skilltree. You cannot use composition monitor."
          );
          this.setState({
            toHome: true,
          });
        } else {
          const unsubscribe = db
            .collection("results")
            .where("compositions", "array-contains", compositionId)
            .orderBy("displayName")
            .onSnapshot(
              (snap) => {
                const results = snap.empty
                  ? []
                  : snap.docs.map((r) => {
                      const result = r.data() as IResult;
                      return {
                        ...result,
                        max: composition.skillcount,
                        percentage: composition.skillcount
                          ? Math.round(
                              (result.progress[compositionId] * 100) /
                                composition.skillcount
                            )
                          : 0,
                      };
                    });
                const filteredResults = results.filter(
                  (r) => r.user !== this.props.user.uid
                );
                this.setState({
                  composition: composition,
                  headers: [
                    ...this.state.headers,
                    {
                      label: "Progress",
                      key: "progress." + compositionId,
                    },
                    {
                      label: "Max",
                      key: "max",
                    },
                    {
                      label: "Percentage",
                      key: "percentage",
                    },
                  ],
                  results: filteredResults,
                  doneLoading: true,
                  unsubscribe: unsubscribe,
                  url:
                    window.location.protocol +
                    "//" +
                    window.location.host +
                    "/compositions/" +
                    composition.id +
                    "/viewer",
                });
              },
              (error) => {
                console.error(error.message);
                toast.error(error.message);
              }
            );
        }
      });
  }

  componentWillUnmount() {
    if (this.state.unsubscribe) {
      this.state.unsubscribe();
    }
  }

  toggleIsActive = () => {
    this.setState({
      isActive: !this.state.isActive,
      result: undefined,
    });
  };

  prepareToRemoveStudent = (result: IResult) => {
    console.log("preparing to remove student " + result.displayName);
    this.setState({
      isActive: true,
      result: result,
    });
  };

  removeStudent = () => {
    db.collection("results")
      .doc(this.state.result?.user)
      .set(
        {
          compositions: firebase.firestore.FieldValue.arrayRemove(
            this.props.match.params.compositionId
          ),
        },
        { merge: true }
      )
      .then((_) => {
        toast.info(
          `Student ${this.state.result?.displayName}  was successfully removed from overview`
        );
        this.toggleIsActive();
      })
      .catch((err) => {
        toast.error(
          "There was an error when removing the student from the list: " +
            err.message
        );
      });
  };

  copyToClipboard = () => {
    if (this.state.url) {
      navigator.clipboard.writeText(this.state.url);
      toast.info("Link copied to clipboard!");
    } else {
      toast.error("The link could not be copied!");
    }
  };

  onDownload = () => {
    console.log("downloading progress");
  };

  render() {
    return (
      <React.Fragment>
        <div className="level p-4 has-background-light">
          <div className="level-left">
            <div className="level-item">
              <Link to={"/editor/" + this.state.composition?.id}>
                <Header
                  header={this.state.composition?.title || ""}
                  icon="arrow-left"
                ></Header>
              </Link>
            </div>
          </div>
          <div className="level-right">
            <div className="level-item">
              {this.state.composition && (
                <Link
                  to={`/compositions/${
                    this.state.composition?.id || ""
                  }/add-students`}
                  className="button"
                >
                  Add students
                </Link>
              )}
            </div>
            <div className="level-item">
              {this.state.composition &&
                this.state.results &&
                this.state.results.length > 0 && (
                  <CSVLink
                    className="button"
                    data={this.state.results}
                    headers={this.state.headers}
                    filename={"skilltree-student-progress-overview.csv"}
                  >
                    Download progress
                  </CSVLink>
                )}
            </div>
          </div>
        </div>
        <div className="container">
          {this.state.results && this.state.results.length === 0 && (
            <React.Fragment>
              <article className="message is-primary">
                <div className="message-header">No students yet... </div>
                <div className="message-body">
                  <div>You can add students or share the link. </div>
                  <div>
                    When students visit your link and log in, they will appear
                    automatically in this overview.
                  </div>
                  <div className="columns" style={{ marginTop: "20px" }}>
                    <div className="column is-narrow">
                      <Link
                        to={`/compositions/${
                          this.state.composition?.id || ""
                        }/add-students`}
                        className="button"
                      >
                        Add students
                      </Link>
                    </div>
                    <div
                      className="is-divider-vertical"
                      data-content="OR"
                    ></div>
                    <div className="column">
                      <button
                        className="button has-tooltip-multiline"
                        onClick={this.copyToClipboard}
                        data-tooltip="Copy link to clipboard"
                      >
                        Copy Share Link
                      </button>
                    </div>
                  </div>
                </div>
              </article>
            </React.Fragment>
          )}
          {this.state.composition &&
            this.state.results &&
            this.state.results?.map((result: IResult) => (
              <div className="box" key={result.user}>
                <div className="media">
                  <div className="media-left">
                    <p className="image is-64x64">
                      <ReactImageFallback
                        src={result.photoURL}
                        fallbackImage={`https://eu.ui-avatars.com/api/?name=${result.displayName}`}
                        initialImage="Spinner-1s-200px.gif"
                        alt="thumbnail"
                        className="is-rounded"
                      />
                    </p>
                  </div>
                  <div className="media-content">
                    <div className="content">
                      <nav className="level is-mobile">
                        <div className="level-left">
                          <Link
                            to={
                              "/compositions/" +
                              this.state.composition?.id +
                              "/monitor/" +
                              result.user
                            }
                            data-tooltip="View skilltree"
                            style={{ color: "black" }}
                          >
                            <strong>{result.displayName}</strong>
                          </Link>
                          <small style={{ marginLeft: "10px" }}>
                            {result.email}
                          </small>
                        </div>
                        <div className="level-right">
                          <div className="level-item is-hidden-mobile">
                            <div className="tag is-primary">
                              {this.state.composition?.id &&
                                "Completed " +
                                  result.progress[this.state.composition.id] +
                                  " of " +
                                  this.state.composition.skillcount +
                                  " skills"}
                            </div>
                          </div>
                        </div>
                      </nav>
                      {this.state.composition?.id && (
                        <progress
                          className="progress is-primary"
                          value={result.progress[this.state.composition.id]}
                          max={this.state.composition.skillcount}
                        ></progress>
                      )}
                    </div>
                  </div>
                  <div className="media-right">
                    <button
                      className="delete"
                      onClick={() => this.prepareToRemoveStudent(result)}
                    ></button>
                  </div>
                </div>
              </div>
            ))}
        </div>
        <div className={`modal ${this.state.isActive ? "is-active" : ""}`}>
          <div className="modal-background"></div>
          <div className="modal-card">
            <header className="modal-card-head">
              <p className="modal-card-title">Are you sure?</p>
              <button
                className="delete"
                aria-label="close"
                onClick={this.toggleIsActive}
              ></button>
            </header>
            <section className="modal-card-body">
              You are about to remove {this.state.result?.displayName}. Do you
              want to remove this student from your overview page?
            </section>
            <footer className="modal-card-foot">
              <button className="button is-danger" onClick={this.removeStudent}>
                Remove
              </button>
              <button className="button" onClick={this.toggleIsActive}>
                Cancel
              </button>
            </footer>
          </div>
        </div>
      </React.Fragment>
    );
  }
}

function mapStateToProps(state) {
  return {
    isAuthenticated: state.auth.isAuthenticated,
    user: state.auth.user,
  };
}

export default connect(mapStateToProps)(CompositionMonitor);
