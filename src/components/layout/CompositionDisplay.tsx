import React, { Component } from "react";
import ISkilltree from "../../models/skilltree.model";
import IUser from "../../models/user.model";
import {
  SkillTreeGroup,
  SkillTree,
  SkillProvider,
  // SkillType,
  SkillGroupDataType,
  SavedDataType,
} from "beautiful-skill-tree";
import { ContextStorage } from "beautiful-skill-tree/dist/models";
import { db } from "../../firebase/firebase";
import { connect } from "react-redux";
import firebase from "firebase/app";
import { toast } from "react-toastify";
import IComposition from "../../models/composition.model";
import BackButton from "./BackButton";
import "./CompositionDisplay.css";

interface ICompositionDisplayProps {
  theme: any;
  composition: IComposition;
  skilltrees: ISkilltree[];
  user: any;
  showController: boolean;
  title: string;
  monitoredUserId?: string;
}

interface ICompositionDisplayState {
  unsubscribe?: any;
  data?: any[];
  doneLoading: boolean;
  skillQuery?: string;
  handleReset: boolean;
}

class CompositionDisplay extends Component<
  ICompositionDisplayProps,
  ICompositionDisplayState
> {
  progress: React.RefObject<HTMLSpanElement>;
  // the state of the skill tree, as per my custom implementation

  constructor(props: ICompositionDisplayProps) {
    super(props);
    this.state = {
      doneLoading: false,
      handleReset: false,
    };
    this.handleSave = this.handleSave.bind(this);
    this.resetSkills = this.resetSkills.bind(this);
    this.cancelReset = this.cancelReset.bind(this);
    this.reset = this.reset.bind(this);
    this.progress = React.createRef();
  }

  componentDidMount() {
    if (this.props.user && this.props.user.uid) {
      const monitoredUserId =
        typeof this.props.monitoredUserId === "undefined"
          ? this.props.user.uid
          : this.props.monitoredUserId;
      const unsubscribe = db
        .collection("results")
        .doc(monitoredUserId)
        .collection("skilltrees")
        .where("compositionId", "==", this.props.composition.id)
        .onSnapshot((querySnapshot) => {
          if (!querySnapshot.empty && querySnapshot.size !== 0) {
            const results = querySnapshot.docs.map((snap) => snap.data());
            const data: SavedDataType[] = [];
            this.props.skilltrees.forEach((skilltree) => {
              const dataIndex = results.findIndex((r) => r.id === skilltree.id);
              if (dataIndex > -1) {
                data.push(results[dataIndex].skills as SavedDataType);
              } else {
                data.push({});
              }
            });
            this.setState({
              unsubscribe: unsubscribe,
              data: data,
              doneLoading: true,
            });
          } else {
            //no data yet
            this.setState({
              data: [],
              doneLoading: true,
            });
          }
        });
    } else {
      //no user is logged in
      this.setState({
        data: [],
        doneLoading: true,
      });
    }
  }

  componentWillUnmount() {
    if (this.state.unsubscribe) {
      this.state.unsubscribe();
    }
  }

  updateQueryValue = (e: React.FormEvent<HTMLInputElement>) => {
    this.setState({
      skillQuery: e.currentTarget.value,
    });
  };

  handleSave(storage: ContextStorage, treeId: string, skills: SavedDataType) {
    const monitoredUserId =
      typeof this.props.monitoredUserId === "undefined"
        ? this.props.user.uid
        : this.props.monitoredUserId;
    if (
      this.props.user &&
      this.props.user.uid &&
      treeId &&
      this.state.doneLoading
    ) {
      if (
        this.props.user.uid !== this.props.composition.user &&
        !this.props.composition.loggedInUsersCanEdit
      ) {
        toast.info(
          "Please ask your instructor to update the completion status of this skill. Changes will not be saved.",
          { toastId: "cannotduplicatethistoast" }
        );
      } else {
        db.collection("results")
          .doc(monitoredUserId)
          .collection("skilltrees")
          .doc(treeId)
          .set({
            skills,
            id: treeId,
            compositionId: this.props.composition.id,
          })
          .then((_) => {
            const compositionId: string = this.props.composition.id || "";
            db.collection("users")
              .doc(monitoredUserId)
              .get()
              .then((snap) => {
                const user = snap.data() as IUser;
                db.collection("results")
                  .doc(monitoredUserId)
                  .set(
                    {
                      user: monitoredUserId,
                      email: user.email,
                      displayName: user.displayName,
                      photoURL: user.photoURL ? user.photoURL : "",
                      compositions: firebase.firestore.FieldValue.arrayUnion(
                        this.props.composition.id
                      ),
                      progress: {
                        [compositionId]: parseInt(
                          this.progress.current?.textContent
                            ? this.progress.current?.textContent
                            : "0"
                        ),
                      },
                    },
                    { merge: true }
                  )
                  .catch((err) => {
                    toast.error(err.message);
                  });
              });
          })
          .catch((err) => {
            toast.error(err.message);
          });
      }
    } else if (this.state.doneLoading) {
      //not logged in
      storage.setItem(`skills-${treeId}`, JSON.stringify(skills));
    }
  }

  resetSkills() {
    this.setState({
      handleReset: true,
    });
  }

  cancelReset() {
    this.setState({
      handleReset: false,
    });
  }

  reset() {
    this.setState({
      data: [],
      handleReset: false,
    });
  }

  render() {
    return this.state.handleReset ? (
      <section className="section">
        <div className="notification is-warning">
          You are about to reset the skilltree. Your progress will be reset and
          there is no way to undo this.
          <div className="buttons mt-3">
            <button className="button" onClick={this.cancelReset}>
              Cancel
            </button>
            <button className="button is-danger" onClick={this.reset}>
              Proceed with reset
            </button>
          </div>
        </div>
      </section>
    ) : this.state.data ? (
      <SkillProvider>
        <SkillTreeGroup theme={this.props.theme}>
          {(treeData: SkillGroupDataType) => (
            <React.Fragment>
              {this.props.showController && this.state.doneLoading && (
                <div
                  className="message is-primary"
                  style={{ marginTop: "15px", height: "210px" }}
                >
                  <div className="message-header">{this.props.title}</div>
                  <div className="message-body">
                    <div className="level">
                      <div className="level-left">
                        <h6 className="title is-6">
                          Completed skills:
                          <span
                            style={{ marginLeft: "5px" }}
                            ref={this.progress}
                          >
                            {treeData.selectedSkillCount.required +
                              treeData.selectedSkillCount.optional}
                          </span>
                          /
                          {treeData.skillCount.required +
                            treeData.skillCount.optional}
                        </h6>
                      </div>
                      <div className="level-right is-hidden-mobile">
                        {this.props.user?.uid ===
                          this.props.composition.user && (
                          <div className="level-item">
                            <button
                              className="button"
                              onClick={this.resetSkills}
                            >
                              Reset
                            </button>
                          </div>
                        )}
                        <div className="level-item">
                          <BackButton />
                        </div>
                      </div>
                    </div>
                    <div className="field is-fullwidth has-addons">
                      <div className="control">
                        <input
                          className="input"
                          type="text"
                          placeholder="Filter by skill name..."
                          onChange={this.updateQueryValue}
                          value={
                            this.state.skillQuery ? this.state.skillQuery : ""
                          }
                        />
                        <p className="help">
                          Only show skilltrees that contain a skill that matches
                          your query
                        </p>
                      </div>
                      <p className="control">
                        <button
                          className="button"
                          onClick={() =>
                            treeData.handleFilter(this.state.skillQuery || "")
                          }
                        >
                          Filter
                        </button>
                      </p>
                    </div>
                  </div>
                </div>
              )}
              {this.state.doneLoading &&
                this.props.skilltrees.map((skilltree, index) => (
                  <SkillTree
                    key={skilltree.id}
                    treeId={skilltree.id}
                    title={skilltree.title}
                    data={skilltree.data}
                    collapsible={skilltree.collapsible}
                    description={skilltree.description}
                    handleSave={this.handleSave}
                    savedData={this.state.data ? this.state.data[index] : {}}
                  />
                ))}
            </React.Fragment>
          )}
        </SkillTreeGroup>
      </SkillProvider>
    ) : null;
  }
}

function mapStateToProps(state) {
  return {
    user: state.auth.user,
  };
}

export default connect(mapStateToProps)(CompositionDisplay);
