import React, { Component } from "react";
import { connect } from "react-redux";
import { showModal, hideModal } from "../../../actions/ui";
import { Droppable } from "react-beautiful-dnd";

import ISkilltree from "../../../models/skilltree.model";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import SortableTree from "react-sortable-tree";
// import { SortableTreeWithoutDndContext as SortableTree } from 'react-sortable-tree';

import ISkill from "../../../models/skill.model";
import { db } from "../../../firebase/firebase";
import {
  skillArrayToSkillTree,
  arraysEqual,
} from "../../../services/StandardFunctions";
import {
  deleteSkill,
  moveSkill,
  reorderSkills,
  updateSkill,
} from "../../../services/SkillServices";
import { getNumberOfRootSkills } from "../../../services/SkillTreeServices";
import { toast } from "react-toastify";
import { v4 as uuid } from "uuid";

interface ISkillTreeEditorProps {
  skilltree: ISkilltree;
  index: number;
  editSkilltree: Function;
  deleteSkilltree: Function;
  editSkill: Function;
  isDropDisabledSkilltree: boolean;
  isDropDisabledSkills: boolean;
  dispatch: any;
}

interface ISkillTreeEditorState {
  isDragDisabledSkilltrees: boolean;
  data: any;
  currentSkill?: ISkill;
  skills?: ISkill[];
  showSkillForm?: boolean;
  unsubscribe?: any;
  isMobile: boolean;
  allowSubscriptionUpdates: boolean;
  title: string;
}

class SkillTreeEditor extends Component<
  ISkillTreeEditorProps,
  ISkillTreeEditorState
> {
  constructor(props: ISkillTreeEditorProps) {
    super(props);
    this.state = {
      isDragDisabledSkilltrees: false,
      data: [],
      isMobile: window.innerWidth <= 760,
      allowSubscriptionUpdates: true,
      title: "",
    };
    this.moveExistingSkill = this.moveExistingSkill.bind(this);
    this.prepareDeleteSkill = this.prepareDeleteSkill.bind(this);
  }

  getData() {
    const unsubscribe = db
      .collectionGroup("skills")
      .where("skilltree", "==", this.props.skilltree.id)
      .orderBy("order")
      .onSnapshot((querySnapshot) => {
        const skills: ISkill[] = [];
        querySnapshot.docs.forEach((doc) => {
          const skill: ISkill = {
            ...(doc.data() as ISkill),
            parent: doc.ref.path.split("/"),
            path: doc.ref.path,
          };
          skills.push(skill);
        });
        if (this.state.allowSubscriptionUpdates) {
          const data = skillArrayToSkillTree(
            skills.filter(
              (s: ISkill) => s.skilltree === this.props.skilltree.id
            ),
            false
          );
          this.setState({
            data,
            skills,
          });
        }
      });
    this.setState({
      unsubscribe,
    });
  }

  componentDidMount() {
    this.getData();
    // window.addEventListener("resize", () => this.setState({isMobile: window.innerWidth <= 760}));
  }

  componentWillUnmount() {
    this.state.unsubscribe();
    // window.removeEventListener("resize", () => this.setState({isMobile: window.innerWidth <= 760}));
  }

  componentDidUpdate(prevProps) {
    if (prevProps.index !== this.props.index) {
      this.state.unsubscribe();
      this.setState({
        skills: [],
      });
      this.getData();
    }
  }

  handleTitleChange = ({ target }) => {
    this.setState({
      title: target.value,
    });
  };

  async addRootSkill() {
    if (this.state.title.length === 0) {
      toast.error("Please enter the title of new skill");
      return;
    }
    const order = await getNumberOfRootSkills(this.props.skilltree);
    const skill: ISkill = {
      id: uuid(),
      title: this.state.title,
      optional: false,
      countChildren: 0,
      links: [],
      order,
    };
    console.log(skill);
    await updateSkill(skill, this.props.skilltree, undefined, order, false);
    this.setState({
      title: "",
    });
  }

  updateSortableTree(data) {
    this.setState({
      data,
    });
  }

  moveExistingSkill(data) {
    const keepsParent = arraysEqual(data.nextPath, data.prevPath);
    const keepsIndex = data.prevTreeIndex === data.nextTreeIndex;
    if (keepsParent && keepsIndex) return;
    if (keepsParent) {
      // changeOrderOfSkills()
      this.setState({
        allowSubscriptionUpdates: false,
      });
      reorderSkills(data);
    } else {
      moveSkill(data, this.props.skilltree);
    }
  }

  prepareDeleteSkill(skill: ISkill) {
    this.setState({
      currentSkill: skill,
      allowSubscriptionUpdates: true,
    });
    const { dispatch } = this.props;
    dispatch(
      showModal({
        id: "warn",
        title: "Are you sure",
        warningMessage:
          "You are about to delete the Skill " +
          skill?.title +
          " including all related child skills. You cannot undo this. Are you sure?",
        dismissedWarningFunc: this.deleteSkill
      })
    );
  }

  async deleteSkill() {
    if (!this.state.currentSkill) {
      toast.error("You have not selected any skill to be destroyed..");
      return;
    }
    toast.info("Please wait for skill to be removed...");
    const { dispatch } = this.props;
    dispatch(hideModal());
    await deleteSkill(
      this.state.currentSkill?.path || "",
      this.props.skilltree?.composition || ""
    );
  }

  render() {
    return (
      <Droppable
        droppableId={"SKILLTREE-" + this.props.skilltree.id}
        isDropDisabled={this.props.isDropDisabledSkilltree}
      >
        {(provided, snapshot) => (
          <div {...provided.droppableProps} ref={provided.innerRef}>
            <div
              style={{
                backgroundColor: snapshot.isDraggingOver ? "#d4823a" : "unset",
              }}
            >
              <div className="content">
                <div
                  style={{ height: "calc(100vh - 7rem)" }}
                  onMouseEnter={() =>
                    this.setState({ isDragDisabledSkilltrees: true })
                  }
                  onMouseLeave={() =>
                    this.setState({ isDragDisabledSkilltrees: false })
                  }
                >
                  <React.Fragment>
                    <div className="field has-addons">
                      <div className="control">
                        <input
                          className="input is-focused"
                          type="text"
                          placeholder="Enter skill title"
                          onChange={this.handleTitleChange}
                          value={this.state.title}
                        ></input>
                      </div>
                      <div className="control">
                        <button
                          className="button is-primary"
                          onClick={() => this.addRootSkill()}
                        >
                          <FontAwesomeIcon icon="plus"></FontAwesomeIcon>
                        </button>
                      </div>
                    </div>

                    <SortableTree
                      getNodeKey={({ node }) => node.id}
                      treeData={this.state.data}
                      onChange={(data) => this.updateSortableTree(data)}
                      onMoveNode={(data) => this.moveExistingSkill(data)}
                      generateNodeProps={({ node }) => ({
                        title: (
                          <Droppable
                            droppableId={"SKILL-" + node.id}
                            isDropDisabled={this.props.isDropDisabledSkills}
                          >
                            {(provided, snapshot) => (
                              <div
                                className={`p-1 ${
                                  snapshot.isDraggingOver
                                    ? "has-background-info-light"
                                    : ""
                                }`}
                                {...provided.droppableProps}
                                ref={provided.innerRef}
                              >
                                <div
                                  className="level is-mobile"
                                  style={{ width: "240px" }}
                                >
                                  <div className="level-left">
                                    <div className="title is-6">
                                      {node.title}
                                    </div>
                                  </div>
                                  <div className="level-right">
                                    <div className="buttons">
                                      <button
                                        className="button is-small"
                                        onClick={() =>
                                          this.props.editSkill(
                                            node,
                                            this.state.skills
                                          )
                                        }
                                      >
                                        <span className="icon is-small">
                                          <FontAwesomeIcon icon="edit"></FontAwesomeIcon>
                                        </span>
                                      </button>
                                      <button
                                        className="button is-small"
                                        onClick={() =>
                                          this.prepareDeleteSkill(node)
                                        }
                                      >
                                        <span className="icon is-small">
                                          <FontAwesomeIcon icon="trash"></FontAwesomeIcon>
                                        </span>
                                      </button>
                                    </div>
                                  </div>
                                </div>
                                {provided.placeholder}
                              </div>
                            )}
                          </Droppable>
                        ),
                      })}
                    />
                  </React.Fragment>
                </div>
              </div>
            </div>
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    );
  }
}

export default connect()(SkillTreeEditor);
