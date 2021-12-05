import React, { Component } from "react";
import ISkilltree from "../../../models/skilltree.model";
// import { db } from '../../../firebase/firebase';
import { connect } from "react-redux";
// import firebase from "firebase/app";
// import { toast } from 'react-toastify';
import IComposition from "../../../models/composition.model";
import "../../layout/CompositionDisplay.css";
import { Droppable, Draggable } from "react-beautiful-dnd";
import SkillTreeEditor from "../elements/SkillTreeEditor";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

interface IEditorDisplayProps {
  theme: any;
  composition: IComposition;
  skilltrees: ISkilltree[];
  user: any;
  title: string;
  monitoredUserId?: string;
  addSkilltree: Function;
  editSkilltree: Function;
  deleteSkilltree: Function;
  editSkill: Function;
  isDropDisabledSkilltrees: boolean;
  isDropDisabledSkilltree: boolean;
  isDropDisabledSkills: boolean;
}

interface IEditorDisplayState {
  data?: any[];
  skillQuery?: string;
  selectedIndex: number;
  isDragDisabledSkilltrees: boolean;
}

class EditorDisplay extends Component<
  IEditorDisplayProps,
  IEditorDisplayState
> {
  progress: React.RefObject<HTMLSpanElement>;
  // the state of the skill tree, as per my custom implementation

  constructor(props: IEditorDisplayProps) {
    super(props);
    this.progress = React.createRef();
    this.state = {
      isDragDisabledSkilltrees: false,
      selectedIndex: 0,
    };
  }

  updateQueryValue = (e: React.FormEvent<HTMLInputElement>) => {
    this.setState({
      skillQuery: e.currentTarget.value,
    });
  };

  render() {
    return (
      <Droppable
        droppableId={"EDITOR-" + this.props.composition.id}
        isDropDisabled={this.props.isDropDisabledSkilltrees}
      >
        {(provided, snapshot) => (
          <div
            {...provided.droppableProps}
            ref={provided.innerRef}
            style={{
              backgroundColor: snapshot.isDraggingOver ? "#d4823a" : "unset",
              height: this.props.skilltrees.length === 0 ? "100%" : "unset",
            }}
          >
            <div className="columns">
              <div className="column is-narrow">
                {this.props.skilltrees.map((skilltree, index) => {
                  return (
                    <Draggable
                      isDragDisabled={this.state.isDragDisabledSkilltrees}
                      key={skilltree.id}
                      draggableId={"skilltree-" + skilltree.id}
                      index={index}
                      type="SKILLTREE"
                    >
                      {(provided) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                        >
                          <div key={index} className="card mb-2 ml-2">
                            <div className="card-header">
                              <a
                                href="# "
                                onClick={() =>
                                  this.setState({ selectedIndex: index })
                                }
                                className="card-header-title"
                              >
                                {skilltree.title}
                              </a>
                              <div
                                className="card-header-icon"
                                style={{ cursor: "move" }}
                              >
                                <span className="icon">
                                  <FontAwesomeIcon icon="grip-lines"></FontAwesomeIcon>
                                </span>
                              </div>
                            </div>
                            {this.state.selectedIndex === index && (
                              <footer className="card-footer">
                                <a
                                  href="# "
                                  className="card-footer-item"
                                  onClick={() =>
                                    this.props.editSkilltree(skilltree)
                                  }
                                >
                                  Edit
                                </a>
                                <a
                                  href="# "
                                  className="card-footer-item"
                                  onClick={() =>
                                    this.props.deleteSkilltree(skilltree)
                                  }
                                >
                                  Delete
                                </a>
                              </footer>
                            )}
                          </div>
                        </div>
                      )}
                    </Draggable>
                  );
                })}
                <div className="card ml-2">
                  <div className="card-header">
                    <div className="card-header-title">Add skilltree</div>
                    <div className="card-header-icon">
                      <button
                        className="button"
                        onClick={() => this.props.addSkilltree()}
                      >
                        <FontAwesomeIcon icon="plus"></FontAwesomeIcon>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
              <div className="column">
                <SkillTreeEditor
                  skilltree={this.props.skilltrees[this.state.selectedIndex]}
                  index={this.state.selectedIndex}
                  editSkilltree={this.props.editSkilltree}
                  deleteSkilltree={this.props.deleteSkilltree}
                  isDropDisabledSkills={this.props.isDropDisabledSkills}
                  editSkill={this.props.editSkill}
                  isDropDisabledSkilltree={this.props.isDropDisabledSkilltree}
                ></SkillTreeEditor>
              </div>
              {provided.placeholder}
            </div>
          </div>
        )}
      </Droppable>
    );
  }
}

function mapStateToProps(state) {
  return {
    user: state.auth.user,
  };
}

export default connect(mapStateToProps)(EditorDisplay);
