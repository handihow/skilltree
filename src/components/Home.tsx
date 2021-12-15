import React, { Component } from "react";
import Compositions from "./compositions/Compositions";
import Header from "./layout/Header";
import { db, functions } from "../firebase/firebase";
import { v4 as uuid } from "uuid";
import { connect } from "react-redux";
import { toast } from "react-toastify";
import {
  standardChildSkills,
  standardRootSkill,
} from "../services/StandardData";
import IComposition from "../models/composition.model";
import firebase from "firebase/app";
import { Redirect } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { getRelevantUserIds } from "../services/UserServices";
import { showModal, hideModal } from "../actions/ui";

interface IHomeProps {
  isAuthenticated: boolean;
  user: any;
  dispatch: any;
}

interface IHomeState {
  compositions: IComposition[];
  sharedCompositions: IComposition[];
  hostedDomainCompositions: IComposition[];
  currentComposition?: IComposition;
  unsubscribeOwned?: any;
  unsubscribeShared?: any;
  activeTab: string;
  mustEditProfile: boolean;
  toEditor: boolean;
  compositionId: string;
}

class Home extends Component<IHomeProps, IHomeState> {
  constructor(props: IHomeProps) {
    super(props);
    const mustEditProfile = props.user.email.endsWith("@skilltree.student")
      ? true
      : false;
    if (mustEditProfile) {
      toast.error(
        "You have logged in with an automatically created Skill Tree email account. Please update your account with a real email address."
      );
    }
    this.state = {
      activeTab: "owned",
      compositions: [],
      sharedCompositions: [],
      hostedDomainCompositions: [],
      mustEditProfile: mustEditProfile,
      toEditor: false,
      compositionId: "",
    };
  }

  async componentDidMount() {
    const userIds = await getRelevantUserIds(this.props.user);
    const unsubscribeOwned = db
      .collection("compositions")
      .where("user", "in", userIds)
      .orderBy("lastUpdate", "desc")
      .onSnapshot((querySnapshot) => {
        const allHostedDomainCompositions = querySnapshot.docs.map(
          (doc) => doc.data() as IComposition
        );
        const ownCompositions = allHostedDomainCompositions.filter(
          (hdc) => hdc.user === this.props.user.uid
        );
        const hostedDomainCompositions = allHostedDomainCompositions.filter(
          (hdc) => hdc.user !== this.props.user.uid
        );
        this.setState({
          compositions: ownCompositions,
          hostedDomainCompositions: hostedDomainCompositions,
          unsubscribeOwned: unsubscribeOwned,
        });
      });

    const unsubscribeShared = db
      .collection("compositions")
      .where("sharedUsers", "array-contains", this.props.user.uid)
      .orderBy("lastUpdate", "desc")
      .onSnapshot((querySnapshot) => {
        const sharedCompositions = querySnapshot.docs.map(
          (doc) => doc.data() as IComposition
        );
        this.setState({
          sharedCompositions: sharedCompositions,
          unsubscribeShared: unsubscribeShared,
        });
      });
  }

  componentWillUnmount() {
    this.setState({
      compositions: [],
    });
    if (this.state.unsubscribeOwned) {
      this.state.unsubscribeOwned();
    }
    if (this.state.unsubscribeShared) {
      this.state.unsubscribeShared();
    }
  }

  addComposition = (title, theme, data) => {
    if (!title) {
      toast.error("Please enter a title for the SkillTree");
      return;
    }
    this.props.dispatch(hideModal());
    const compositionId = uuid();
    const newComposition: IComposition = {
      id: compositionId,
      title,
      theme,
      user: this.props.user.uid,
      username: this.props.user.email,
      hasBackgroundImage: false,
      canCopy: false,
      loggedInUsersCanEdit: true,
      loggedInUsersOnly: true,
      skillcount: 3,
      lastUpdate: firebase.firestore.Timestamp.now(),
    };
    db.collection("compositions")
      .doc(newComposition.id)
      .set(newComposition)
      .then((_) => {
        const newSkilltree = {
          id: uuid(),
          title,
          description: "More information about my skill tree",
          collapsible: true,
          order: 0,
        };
        db.collection("compositions")
          .doc(newComposition.id)
          .collection("skilltrees")
          .doc(newSkilltree.id)
          .set({ composition: newComposition.id, ...newSkilltree })
          .then((_) => {
            const newRootSkill = {
              skilltree: newSkilltree.id,
              composition: newComposition.id,
              id: uuid(),
              ...standardRootSkill,
            };
            db.collection("compositions")
              .doc(newComposition.id)
              .collection("skilltrees")
              .doc(newSkilltree.id)
              .collection("skills")
              .doc(newRootSkill.id)
              .set(newRootSkill)
              .then((_) => {
                const batch = db.batch();
                standardChildSkills.forEach((child) => {
                  const newChildId = uuid();
                  const dbRef = db
                    .collection("compositions")
                    .doc(newComposition.id)
                    .collection("skilltrees")
                    .doc(newSkilltree.id)
                    .collection("skills")
                    .doc(newRootSkill.id)
                    .collection("skills")
                    .doc(newChildId);
                  batch.set(dbRef, {
                    skilltree: newSkilltree.id,
                    composition: newComposition.id,
                    id: newChildId,
                    ...child,
                  });
                });
                batch
                  .commit()
                  .then((_) => {
                    this.setState({
                      toEditor: true,
                      compositionId,
                    });
                  })
                  .catch((error) => {
                    toast.error(error.message);
                  });
              })
              .catch((error) => {
                toast.error(error.message);
              });
          })
          .catch((error) => {
            toast.error(error.message);
          });
      })
      .catch((error) => {
        toast(error.message);
      });
  };

  updateCompositionTitle = (updatedTitle: string) => {
    if (!updatedTitle || updatedTitle.length === 0) {
      toast.error("Please enter a title");
      return;
    }
    db.collection("compositions")
      .doc(this.state.currentComposition?.id)
      .update({
        title: updatedTitle,
        lastUpdate: firebase.firestore.Timestamp.now(),
      })
      .then((_) => {
        this.setState({
          currentComposition: undefined,
        });
      });
  };

  delComposition = () => {
    if (!this.state.currentComposition) {
      toast.error("No active composition to be removed");
      return;
    }
    const { dispatch } = this.props;
    dispatch(hideModal());
    const toastId = uuid();
    toast.info(
      "Deleting skilltree and all related data is in progress... please wait",
      {
        toastId: toastId,
        autoClose: 10000,
      }
    );
    const path = `compositions/${this.state.currentComposition.id}`;
    const deleteFirestorePathRecursively = functions.httpsCallable(
      "deleteFirestorePathRecursively"
    );
    deleteFirestorePathRecursively({
      collection: "Skilltree",
      path: path,
    })
      .then(function (result) {
        if (result.data.error) {
          toast.update(toastId, {
            render: result.data.error,
            type: toast.TYPE.ERROR,
            autoClose: 5000,
          });
        } else {
          toast.update(toastId, {
            render: "Skill tree deleted successfully",
            autoClose: 3000,
          });
        }
      })
      .catch(function (error) {
        toast.update(toastId, {
          render: error.message,
          type: toast.TYPE.ERROR,
          autoClose: 5000,
        });
      });
  };

  removeSharedSkilltree = () => {
    if (!this.state.currentComposition) {
      toast.error("No active composition to be removed");
      return;
    }
    const { dispatch } = this.props;
    dispatch(hideModal());
    db.collection("compositions")
      .doc(this.state.currentComposition.id)
      .update({
        sharedUsers: firebase.firestore.FieldValue.arrayRemove(
          this.props.user.uid
        ),
      })
      .then((_) => {
        toast.info("Skill tree removed");
      })
      .catch((e) => {
        toast.error("Something went wrong... " + e.message);
      });
  };

  changeActiveTab = (tab: string) => {
    this.setState({
      activeTab: tab,
    });
  };

  toggleIsActive = (composition?: IComposition) => {
    const { dispatch } = this.props;
    dispatch(
      showModal({
        id: "warn",
        title: "Are you sure?",
        warningMessage:
          "You are about to delete skill tree page " +
          composition?.title +
          ". Do you want to delete?",
        dismissedWarningFunc:
          this.props.user.uid === composition?.user
            ? this.delComposition
            : this.removeSharedSkilltree,
      })
    );
    this.setState({
      currentComposition: composition ? composition : undefined,
    });
  };

  toggleIsAddingOrEditing = (composition?: IComposition) => {
    const { dispatch } = this.props;
    dispatch(
      showModal({
        id: "skilltree",
        title: composition ? "Edit skilltree" : "Add skilltree",
        addComposition: this.addComposition,
        isEditingTitle: composition ? true : false,
        composition: composition,
        updateCompositionTitle: this.updateCompositionTitle,
      })
    );
  };

  render() {
    const header = "SkillTrees";
    if (this.state.mustEditProfile) {
      return <Redirect to="/profile/edit" />;
    } else if (this.state.toEditor) {
      return <Redirect to={"/editor/" + this.state.compositionId} />;
    } else {
      return (
        <React.Fragment>
          <div className="level has-background-light mb-3 p-3 is-mobile">
            <div className="level-left">
              <Header header={header} image="/Skilltree_icons-04.svg" />
            </div>
            <div className="level-right">
              <button
                className="is-rounded is-outlined button"
                onClick={() => this.toggleIsAddingOrEditing()}
              >
                <span className="icon">
                  <FontAwesomeIcon icon="plus" />
                </span>
                <span className="is-hidden-mobile">Add Skilltree</span>
              </button>
            </div>
          </div>
          <div className="container">
            {this.state.compositions && (
              <Compositions
                addComposition={this.toggleIsAddingOrEditing}
                compositions={this.state.compositions.concat(
                  this.state.sharedCompositions.concat(
                    this.state.hostedDomainCompositions
                  )
                )}
                editCompositionTitle={this.toggleIsAddingOrEditing}
                deleteComposition={this.toggleIsActive}
              />
            )}
          </div>
        </React.Fragment>
      );
    }
  }
}

function mapStateToProps(state) {
  return {
    isAuthenticated: state.auth.isAuthenticated,
    user: state.auth.user,
  };
}

export default connect(mapStateToProps)(Home);
