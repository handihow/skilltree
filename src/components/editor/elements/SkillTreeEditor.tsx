import { Component } from "react";
import { connect } from "react-redux";
import { showWarningModal, completedAfterWarning } from "../../../actions/ui";
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
} from "../../../services/SkillServices";

interface ISkillTreeEditorProps {
  skilltree: ISkilltree;
  index: number;
  editSkilltree: Function;
  deleteSkilltree: Function;
  editSkill: Function;
  isDropDisabledSkilltree: boolean;
  isDropDisabledSkills: boolean;
  dispatch: any;
  hasDismissedWarning: boolean;
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
  destroyInProgress: boolean;
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
      destroyInProgress: false
    };
    this.moveExistingSkill = this.moveExistingSkill.bind(this);
    this.prepareDeleteSkill = this.prepareDeleteSkill.bind(this);
  }

  getData(){
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
    if (this.props.hasDismissedWarning && !this.state.destroyInProgress) {
      this.deleteSkill();
    }
    if(prevProps.index !== this.props.index) {
      this.state.unsubscribe();
      this.setState({
        skills: []
      });
      this.getData();
    }
    
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
      showWarningModal(
        "You are about to delete the Skill " +
          skill?.title +
          " including all related child skills. You cannot undo this. Are you sure?"
      )
    );
  }

  async deleteSkill() {
    if (!this.state.currentSkill) return;
    this.setState({
      destroyInProgress: true,
    });
    // console.log('deleting skill');
    await deleteSkill(
      this.state.currentSkill?.path || "",
      this.props.skilltree?.composition || ""
    );
    const { dispatch } = this.props;
    dispatch(completedAfterWarning());
    this.setState({
      destroyInProgress: false,
    });
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
                      backgroundColor: snapshot.isDraggingOver
                        ? "#d4823a"
                        : "unset",
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

function mapStateToProps(state) {
  return {
    hasDismissedWarning: state.ui.hasDismissedWarning,
  };
}

export default connect(mapStateToProps)(SkillTreeEditor);
