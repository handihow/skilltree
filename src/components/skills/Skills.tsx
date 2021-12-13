import React, { Component } from "react";
import { db } from "../../firebase/firebase";
import ISkill from "../../models/skill.model";
import IComposition from "../../models/composition.model";
import { connect } from "react-redux";
import { toast } from "react-toastify";
import Loading from "../layout/Loading";
import Table from "../layout/Table";
import EditableCell from "../layout/EditableCell";
import { Link, Redirect } from "react-router-dom";
import { propertyInArrayEqual } from "../../services/StandardFunctions";
import { getRelevantUserIds } from "../../services/UserServices";
import Header from "../layout/Header";
import { v4 as uuid } from "uuid";
import { showModal, hideModal } from "../../actions/ui";
import { startedImporting } from "../../actions/editor";
import ISkilltree from "../../models/skilltree.model";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

interface ISkillsProps {
  isAuthenticated: boolean;
  user: any;
  parentSkilltree: ISkilltree;
  hasSelectedParentSkilltree: boolean;
  dispatch: any;
}

interface ISkillsState {
  skills: ISkill[];
  selectedSkills: ISkill[];
  currentSkill?: ISkill;
  doneLoading: boolean;
  showEditMultipleModal: boolean;
  categoryTitle: string;
  activeTab: string;
  toEditor: boolean;
}

const columns = [
  {
    Header: "Title",
    accessor: "title", // accessor is the "key" in the data,
  },
  {
    Header: "Icon",
    accessor: "icon", // accessor is the "key" in the data,
    Cell: (tableInfo) =>
      tableInfo.data[tableInfo.row.index].icon ? (
        <p className="image is-32x32">
          <img
            src={tableInfo.data[tableInfo.row.index].icon}
            alt="thumbnail"
          ></img>
        </p>
      ) : null,
  },
  {
    Header: "Category",
    accessor: "category",
  },
];

const hierarchyColumn = {
  Header: "Hierarchy",
  accessor: "hierarchy",
  // Cell: EditableCell
};

const compositionColumn = {
  Header: "Composition",
  accessor: "compositionTitle",
};

const referenceColumn = {
  Header: "Reference",
  accessor: "reference",
  Cell: EditableCell,
};

const actionsColumn = {
  Header: "Actions",
  Cell: (tableInfo) => (
    <Link
      to={`/skills/${tableInfo.data[tableInfo.row.index].id}`}
      className="button"
    >
      Open
    </Link>
  ),
};

class Skills extends Component<ISkillsProps, ISkillsState> {
  constructor(props: ISkillsProps) {
    super(props);
    this.state = {
      activeTab: "master",
      skills: [],
      selectedSkills: [],
      doneLoading: false,
      showEditMultipleModal: false,
      categoryTitle: "",
      toEditor: false,
    };
    this.prepareDeleteSkills = this.prepareDeleteSkills.bind(this);
  }

  componentDidMount() {
    this.getRelevantSkills("master");
  }

  getRelevantSkills = async (activeTab: string) => {
    if (activeTab === "master") {
      const masterSkillsSnap = await db
        .collection("skills")
        .where("composition", "==", this.props.user.uid)
        .get();
      if (masterSkillsSnap.empty) {
        this.doneLoadingNoSkills();
      } else {
        this.doneLoadingWithSkills(masterSkillsSnap);
      }
    } else if (activeTab === "skilltrees") {
      const compositionsSnap = await db
        .collection("compositions")
        .where("user", "==", this.props.user.uid)
        .orderBy("lastUpdate", "desc")
        .limit(10)
        .get();
      if (compositionsSnap.empty) {
        this.doneLoadingNoSkills();
      } else {
        const compositions = compositionsSnap.docs.map((doc) => {
          const composition = {
            ...(doc.data() as IComposition),
            id: doc.id,
          };
          return composition;
        });
        console.log(compositions);
        const skilltreeSkillsSnap = await db
          .collectionGroup("skills")
          .where(
            "composition",
            "in",
            compositions.map((c) => c.id)
          )
          .get();
        if (skilltreeSkillsSnap.empty) {
          this.doneLoadingNoSkills();
        } else {
          this.doneLoadingWithSkills(skilltreeSkillsSnap, compositions);
        }
      }
    } else {
      const userIds = await getRelevantUserIds(this.props.user);
      db.collection("compositions")
        .where("user", "in", userIds)
        .orderBy("lastUpdate", "desc")
        .limit(10)
        .get()
        .then((collectionsSnap) => {
          console.log("collectionSnap");
          if (collectionsSnap.empty) {
            this.doneLoadingNoSkills();
          } else {
            const compositions = collectionsSnap.docs.map((doc) => {
              const composition = {
                ...(doc.data() as IComposition),
                id: doc.id,
              };
              return composition;
            });
            db.collectionGroup("skills")
              .where(
                "composition",
                "in",
                compositions.map((c) => c.id)
              )
              .get()
              .then((skillsSnap) => {
                if (skillsSnap.empty) {
                  this.doneLoadingNoSkills();
                } else {
                  this.doneLoadingWithSkills(skillsSnap, compositions);
                }
              })
              .catch((err) => {
                toast.error(err.message);
                this.doneLoadingNoSkills();
              });
          }
        })
        .catch((err) => {
          toast.error(err.message);
          this.doneLoadingNoSkills();
        });
    }
  };

  doneLoadingNoSkills = () => {
    this.setState({
      doneLoading: true,
    });
  };

  doneLoadingWithSkills = (skillsSnap, compositions?) => {
    const skills = skillsSnap.docs.map((doc) => {
      let hierarchy = 0;
      const splittedPath = doc.ref.path.split("/").length;
      if (splittedPath > 5) {
        hierarchy = (doc.ref.path.split("/").length - 4) / 2;
      }
      let skill: ISkill = {
        category: "None",
        reference: "None",
        ...(doc.data() as ISkill),
        hierarchy,
        path: doc.ref.path,
      };
      skill.compositionTitle = "Master";
      console.log(compositions);
      if (compositions && compositions.length > 0) {
        const compositionIndex = compositions.findIndex(
          (c) => c.id === skill.composition
        );
        skill.compositionTitle =
          compositionIndex > -1 ? compositions[compositionIndex].title : "";
        skill.table =
          compositionIndex > -1
            ? compositions[compositionIndex].user === this.props.user.uid
              ? "skilltrees"
              : "domain"
            : "no table";
      } else {
        skill.table = "master";
      }
      return skill;
    });

    this.setState({
      doneLoading: true,
      skills,
    });
  };

  onEdit = (items) => {
    //check if items have a common title
    let categoryTitle = "";
    const haveCommonCategoryTitle = propertyInArrayEqual(items, "category");
    if (haveCommonCategoryTitle) {
      categoryTitle = items[0].category;
    }
    this.setState({
      selectedSkills: items,
      categoryTitle,
    });
    this.toggleEditMultipleModal();
  };

  toggleEditMultipleModal = () => {
    this.setState({
      showEditMultipleModal: !this.state.showEditMultipleModal,
    });
  };

  onChangeCategoryTitle = (e) =>
    this.setState({ categoryTitle: e.target.value });

  setCategory = () => {
    const batch = db.batch();
    this.state.selectedSkills.forEach((skill) => {
      const ref = db.doc(skill.path || "");
      batch.update(ref, { category: this.state.categoryTitle });
    });
    batch.commit().then((_) => {
      //update the skills
      const skills = this.state.skills.map((skill) => {
        const found =
          this.state.selectedSkills.findIndex((ss) => ss.id === skill.id) > -1;
        if (found) {
          return {
            ...skill,
            category: this.state.categoryTitle,
          };
        } else {
          return skill;
        }
      });
      this.setState({
        showEditMultipleModal: false,
        categoryTitle: "",
        skills,
      });
    });
  };

  copyToMaster = () => {
    const batch = db.batch();
    const newSkills: ISkill[] = [];
    this.state.selectedSkills.forEach((item) => {
      const id = uuid();
      const newSkillRef = db.collection("skills").doc(id);
      const newSkill: ISkill = {
        id: id,
        title: item.title,
        optional: item.optional ? true : false,
        composition: this.props.user.uid,
        table: "master",
        countChildren: 0,
      };
      ["description", "icon", "category", "direction", "links"].forEach(
        (optionalProperty) => {
          if (item[optionalProperty]) {
            newSkill[optionalProperty] = item[optionalProperty];
          }
        }
      );
      batch.set(newSkillRef, newSkill);
      newSkills.push(newSkill);
    });
    batch
      .commit()
      .then((_) => {
        toast.info("Successfully copied skills to master list");
        this.setState({
          activeTab: "master",
          showEditMultipleModal: false,
          skills: [...this.state.skills, ...newSkills],
        });
      })
      .catch((error) => {
        toast.error(error.message);
      });
  };

  updateData = (index, id, value) => {
    const filteredSkills = this.state.skills.filter(
      (skill) => skill.table === this.state.activeTab
    );
    if (!filteredSkills[index].path) return;
    db.doc(filteredSkills[index].path || "").update({
      [id]: value,
    });
  };

  prepareDeleteSkills() {
    const { dispatch } = this.props;
    dispatch(
      showModal({
        id: "warn",
        title: "Are you sure?",
        warningMessage:
          "You are about to delete " +
          this.state.selectedSkills.length +
          " skills from your master list. You cannot undo this. Are you sure?",
        dismissedWarningFunc: this.deleteMasterSkills
      })
    );
  }

  deleteMasterSkills = () => {

    if (!this.state.selectedSkills || this.state.selectedSkills.length === 0)
      return;
    const { dispatch } = this.props;
    dispatch(hideModal());
    const batch = db.batch();
    this.state.selectedSkills.forEach((skill) => {
      if (skill.path) {
        batch.delete(db.doc(skill.path));
      }
    });
    batch
      .commit()
      .then((_) => {
        toast.info(
          "Deleted " + this.state.selectedSkills.length + " successfully"
        );
        this.setState({
          showEditMultipleModal: false,
          selectedSkills: [],
          skills: this.state.skills.filter(
            (el) => !this.state.selectedSkills.includes(el)
          ),
        });
      })
      .catch((err) => {
        toast.error("Error deleting skills ..." + err.message);
      });
  };

  changeActiveTab = (tab: string) => {
    this.setState({
      activeTab: tab,
      skills: [],
    });
    this.getRelevantSkills(tab);
  };

  importSelectedSkills = () => {
    if (!this.state.selectedSkills) return;
    const { dispatch } = this.props;
    dispatch(startedImporting(this.state.selectedSkills));
    this.setState({
      toEditor: true,
    });
  };

  render() {
    return this.state.toEditor ? (
      <Redirect to={`/editor/${this.props.parentSkilltree.composition}`} />
    ) : this.state.doneLoading ? (
      <React.Fragment>
        <div className="level has-background-light mb-0 p-3 is-mobile">
          <div className="level-item has-text-centered">
            <Header
              icon="list"
              header={
                this.props.hasSelectedParentSkilltree
                  ? "Import skills into " + this.props.parentSkilltree.title
                  : "Skills"
              }
            />
          </div>
          <div className="level-item">
            {!this.props.hasSelectedParentSkilltree && (
              <Link to="/skills/upload-csv" className="button is-rounded">
                <span className="icon">
                  <FontAwesomeIcon icon="plus" />
                </span>
                <span>Upload</span>
              </Link>
            )}
          </div>
        </div>

        {this.props.hasSelectedParentSkilltree && (
          <div className="message is-info">
            <div className="message-header"></div>
            <div className="message-body">
              <p>
                Select skills in the table below and click on 'Edit selected' to
                start import process...{" "}
              </p>
              <a
                href="https://github.com/handihow/skilltree/wiki/Managing-skills"
                target="_blank"
                rel="noreferrer"
              >
                View Manage Skills Wiki page
              </a>{" "}
              to learn more.
            </div>
          </div>
        )}

        <div className="tabs is-centered has-background-light">
          <ul>
            <li
              className={
                this.state.activeTab === "master" ? "is-active" : undefined
              }
            >
              <a href="# " onClick={() => this.changeActiveTab("master")}>
                Master skills
              </a>
            </li>
            <li
              className={
                this.state.activeTab === "skilltrees" ? "is-active" : undefined
              }
            >
              <a href="# " onClick={() => this.changeActiveTab("skilltrees")}>
                Skills in SkillTrees
              </a>
            </li>
            {this.props.user.hostedDomain && (
              <li
                className={
                  this.state.activeTab === "domain" ? "is-active" : undefined
                }
              >
                <a href="# " onClick={() => this.changeActiveTab("domain")}>
                  Skills in {this.props.user.hostedDomain}
                </a>
              </li>
            )}
          </ul>
        </div>
        <div className="container" style={{ minHeight: "100vh" }}>
          <Table
            data={this.state.skills.filter(
              (skill) => skill.table === this.state.activeTab
            )}
            columns={
              this.state.activeTab === "domain"
                ? [...columns, compositionColumn, hierarchyColumn]
                : this.state.activeTab === "skilltrees"
                ? [
                    ...columns,
                    compositionColumn,
                    hierarchyColumn,
                    actionsColumn,
                  ]
                : [...columns, referenceColumn, actionsColumn]
            }
            header=""
            onSelectMultiple={this.onEdit}
            selectMultipleButtonText={"Edit selected"}
            updateData={this.updateData}
            isEditingEnabled={true}
          />
        </div>
        <div
          className={`modal ${
            this.state.showEditMultipleModal ? "is-active" : ""
          }`}
        >
          <div className="modal-background"></div>
          <div className="modal-card">
            <header className="modal-card-head">
              <p className="modal-card-title">
                Actions on {this.state.selectedSkills.length} selected items
              </p>
              <button
                className="delete"
                aria-label="close"
                onClick={this.toggleEditMultipleModal}
              ></button>
            </header>
            <section className="modal-card-body">
              {this.state.activeTab !== "domain" &&
                !this.props.hasSelectedParentSkilltree && (
                  <div className="field">
                    <label className="label">Category</label>
                    <div className="control">
                      <input
                        className="input"
                        type="text"
                        placeholder="Enter category title..."
                        value={this.state.categoryTitle}
                        onChange={this.onChangeCategoryTitle}
                      />
                    </div>
                  </div>
                )}
              {this.state.activeTab !== "master" &&
                !this.props.hasSelectedParentSkilltree && (
                  <div>
                    You can copy skills to your master skills list using button
                    below
                  </div>
                )}
              {this.state.activeTab === "master" &&
                !this.props.hasSelectedParentSkilltree && (
                  <div>
                    You can delete the selected skills from your master skills
                    list using button below
                  </div>
                )}
              {this.props.hasSelectedParentSkilltree && (
                <div>
                  You can import the selected skills now using button below
                </div>
              )}
            </section>
            <footer className="modal-card-foot">
              <button className="button" onClick={this.toggleEditMultipleModal}>
                Cancel
              </button>
              {this.state.activeTab !== "domain" &&
                !this.props.hasSelectedParentSkilltree && (
                  <button className="button is-info" onClick={this.setCategory}>
                    Set category
                  </button>
                )}
              {this.state.activeTab !== "master" &&
                !this.props.hasSelectedParentSkilltree && (
                  <button
                    className="button is-primary"
                    onClick={this.copyToMaster}
                  >
                    Copy to master
                  </button>
                )}
              {this.state.activeTab === "master" &&
                !this.props.hasSelectedParentSkilltree && (
                  <button
                    className="button is-warning"
                    onClick={this.prepareDeleteSkills}
                  >
                    Delete from master
                  </button>
                )}
              {this.props.hasSelectedParentSkilltree && (
                <button
                  className="button is-primary"
                  onClick={this.importSelectedSkills}
                >
                  Import selected
                </button>
              )}
            </footer>
          </div>
        </div>
      </React.Fragment>
    ) : (
      <Loading />
    );
  }
}

function mapStateToProps(state) {
  return {
    isAuthenticated: state.auth.isAuthenticated,
    user: state.auth.user,
    hasDismissedWarning: state.ui.hasDismissedWarning,
    parentSkilltree: state.editor.parentSkilltree,
    hasSelectedParentSkilltree: state.editor.hasSelectedParentSkilltree,
  };
}

export default connect(mapStateToProps)(Skills);
