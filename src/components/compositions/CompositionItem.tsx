import { Component } from "react";
import { Link } from "react-router-dom";
import { storage, db } from "../../firebase/firebase";
import IComposition from "../../models/composition.model";
import { connect } from "react-redux";
import IResult from "../../models/result.model";
import { v4 as uuid } from "uuid";
import { toast } from "react-toastify";
import firebase from "firebase/app";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

interface ICompositionItemProps {
  composition: IComposition;
  editCompositionTitle: Function;
  isAuthenticated: boolean;
  user: any;
  deleteComposition: Function;
}

interface ICompositionItemState {
  thumbnail: string;
  progress: number;
}

export class CompositionItem extends Component<
  ICompositionItemProps,
  ICompositionItemState
> {
  constructor(props: ICompositionItemProps) {
    super(props);
    this.state = {
      thumbnail: "https://via.placeholder.com/360x254.png?text=Skilltree",
      progress: 0,
    };
  }

  copyComposition = async (composition) => {
    const toastId = uuid();
    toast.info(
      "Copying skilltree and all related data is in progress... please wait",
      {
        toastId: toastId,
        autoClose: 5000,
      }
    );
    const batch = db.batch();
    //first create a new composition and set it to the batch
    const newComposition = {
      ...composition,
      user: this.props.user.uid,
      username: this.props.user.email,
      id: uuid(),
      sharedUsers: [],
      title: "Copy of " + composition.title,
      lastUpdate: firebase.firestore.Timestamp.now(),
    };
    const newCompositionRef = db
      .collection("compositions")
      .doc(newComposition.id);
    batch.set(newCompositionRef, newComposition);

    //then copy all the skilltrees
    const skilltreeSnapshot = await db
      .collection("compositions")
      .doc(composition.id)
      .collection("skilltrees")
      .get();
    const skilltrees = skilltreeSnapshot.docs.map((snap) => snap.data());
    for (let i = 0; i < skilltrees.length; i++) {
      const newSkilltree = {
        ...skilltrees[i],
        id: uuid(),
        composition: newComposition.id,
      };
      const newSkilltreeRef = db
        .collection("compositions")
        .doc(newComposition.id)
        .collection("skilltrees")
        .doc(newSkilltree.id);
      batch.set(newSkilltreeRef, newSkilltree);

      //get the root skills and start copying
      const rootSkillSnapshot = await db
        .collection("compositions")
        .doc(composition.id)
        .collection("skilltrees")
        .doc(skilltrees[i].id)
        .collection("skills")
        .get();
      const rootSkills = rootSkillSnapshot.empty
        ? []
        : rootSkillSnapshot.docs.map((snap) => snap.data());
      const rootSkillPaths = rootSkillSnapshot.empty
        ? []
        : rootSkillSnapshot.docs.map((snap) => snap.ref.path);
      for (let j = 0; j < rootSkills.length; j++) {
        const newRootSkill = {
          ...rootSkills[j],
          composition: newComposition.id,
          skilltree: newSkilltree.id,
          id: uuid(),
        };
        const newRootSkillRef = db
          .collection("compositions")
          .doc(newComposition.id)
          .collection("skilltrees")
          .doc(newSkilltree.id)
          .collection("skills")
          .doc(newRootSkill.id);
        batch.set(newRootSkillRef, newRootSkill);
        await this.copyChildSkills(
          rootSkills[j],
          rootSkillPaths[j],
          batch,
          newComposition.id,
          newSkilltree.id,
          newRootSkillRef
        );
      }
    }
    return batch
      .commit()
      .then(() => {
        toast.update(toastId, {
          render: `Successfully copied skilltree '${composition.title}'`,
        });
      })
      .catch((error: any) => {
        toast.update(toastId, {
          render: toast.error(`Problem copying: ${error.message} `),
          type: toast.TYPE.ERROR,
        });
      });
  };

  copyChildSkills = async (
    skill: any,
    path: string,
    batch: any,
    newCompositionId: string,
    newSkilltreeId: string,
    newSkillRef: any
  ) => {
    const childSkillSnapshot = await db.doc(path).collection("skills").get();
    if (childSkillSnapshot.empty) {
      return;
    } else {
      const childSkills = childSkillSnapshot.docs.map((snap) => snap.data());
      const childSkillPaths = childSkillSnapshot.docs.map((snap) => snap.ref);
      for (let index = 0; index < childSkills.length; index++) {
        const newChildSkill = {
          ...childSkills[index],
          composition: newCompositionId,
          skilltree: newSkilltreeId,
          id: uuid(),
        };
        const newChildSkillRef = newSkillRef
          .collection("skills")
          .doc(newChildSkill.id);
        batch.set(newChildSkillRef, newChildSkill);
        await this.copyChildSkills(
          childSkills[index],
          childSkillPaths[index].path,
          batch,
          newCompositionId,
          newSkilltreeId,
          newChildSkillRef
        );
      }
    }
  };

  componentDidMount() {
    if (this.props.composition.hasBackgroundImage) {
      const storageRef = storage.ref();
      const imageRef = storageRef.child(
        this.props.composition.backgroundImage || ""
      );
      imageRef.getDownloadURL().then((url) => {
        this.setState({ thumbnail: url });
      });
    }
    if (this.props.isAuthenticated) {
      db.collection("results")
        .doc(this.props.user.uid)
        .get()
        .then((snapShot) => {
          if (!snapShot.exists) {
            this.setState({
              progress: 0,
            });
          } else {
            const result = snapShot.data() as IResult;
            let progress = 0;
            try {
              progress = result.progress[this.props.composition.id || ""];
            } catch (e) {
              console.error(e);
            }
            this.setState({
              progress: progress ? progress : 0,
            });
          }
        });
    }
  }

  render() {
    const { id, title, username } = this.props.composition;
    const isOwner = this.props.user.uid === this.props.composition.user;
    return (
      <div className="card" style={{ width: "280px" }}>
        <Link to={isOwner ? "/editor/" + id : "compositions/" + id + "/viewer"}>
          <header className="card-header">
            <p className="card-header-title">{title}</p>
          </header>
          <div className="card-image">
            <figure className="image">
              <img
                src={this.state.thumbnail}
                alt="thumbnail"
                style={{ height: "200px" }}
              ></img>
            </figure>
          </div>
        </Link>
        <div className="card-content">
          <div className="content">
            <div className="tags">
              <div className={isOwner ? "tag is-info" : "tag is-danger"}>
                {isOwner ? "owner" : username}
              </div>
              <div className="tag is-primary">
                {isOwner
                  ? this.props.composition.skillcount + " skills"
                  : this.state.progress +
                    " of " +
                    this.props.composition.skillcount +
                    " skills"}
              </div>
            </div>
          </div>
        </div>
        <footer className="card-footer is-justify-content-end	is-flex">
          <div className="dropdown is-hoverable is-right">
            <div className="dropdown-trigger">
              <button
                className="button"
                aria-haspopup="true"
                aria-controls="dropdown-menu4"
              >
                <span className="icon is-small">
                  <FontAwesomeIcon icon="ellipsis-v"></FontAwesomeIcon>
                </span>
              </button>
            </div>
            <div className="dropdown-menu" id="dropdown-menu4" role="menu">
              <div className="dropdown-content">
                <Link
                  to={"compositions/" + id + "/viewer"}
                  className="dropdown-item"
                >
                  <span className="icon mr-2">
                    <FontAwesomeIcon icon="eye"></FontAwesomeIcon>
                  </span>
                  <span>View</span>
                </Link>
                {(this.props.composition.canCopy || isOwner) && (
                  <a
                    className="dropdown-item"
                    href="# "
                    onClick={() => this.copyComposition(this.props.composition)}
                  >
                    <span className="icon mr-2">
                      <FontAwesomeIcon icon="copy"></FontAwesomeIcon>
                    </span>
                    <span>Copy</span>
                  </a>
                )}
                {isOwner && (
                  <Link to={"/editor/" + id} className="dropdown-item">
                    <span className="icon mr-2">
                      <FontAwesomeIcon icon="pen"></FontAwesomeIcon>
                    </span>
                    <span>Edit</span>
                  </Link>
                )}
                {isOwner && (
                  <a
                    onClick={this.props.deleteComposition.bind(
                      this,
                      this.props.composition
                    )}
                    href="# "
                    className="dropdown-item"
                  >
                    <span className="icon mr-2">
                      <FontAwesomeIcon icon="trash"></FontAwesomeIcon>
                    </span>
                    <span>Delete</span>
                  </a>
                )}
              </div>
            </div>
          </div>
        </footer>
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

export default connect(mapStateToProps)(CompositionItem);
