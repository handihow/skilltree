import React, { Component } from 'react';
import ISkilltree from '../../../models/skilltree.model';
// import { db } from '../../../firebase/firebase';
import { connect } from "react-redux";
// import firebase from "firebase/app";
// import { toast } from 'react-toastify';
import IComposition from '../../../models/composition.model';
import '../../layout/CompositionDisplay.css';
import { Droppable, Draggable } from 'react-beautiful-dnd';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import SortableTree from 'react-sortable-tree';

interface IEditorDisplayProps {
    theme: any;
    composition: IComposition;
    skilltrees: ISkilltree[];
    user: any;
    title: string;
    monitoredUserId?: string;
    editSkilltree: Function;
    deleteSkilltree: Function;
    editSkill: Function;
    deleteSkill: Function;
    isDropDisabledSkilltrees: boolean;
    isDropDisabledSkills: boolean;
}

interface IEditorDisplayState {
    data?: any[];
    skillQuery?: string;
    isDragDisabledSkilltrees: boolean;
}

class EditorDisplay extends Component<IEditorDisplayProps, IEditorDisplayState> {
    progress: React.RefObject<HTMLSpanElement>;
    // the state of the skill tree, as per my custom implementation
    
    constructor(props: IEditorDisplayProps){
        super(props);        
        this.progress = React.createRef()
        this.state = {
            isDragDisabledSkilltrees: false
        }
    }

    componentDidMount(){
    }

    componentWillUnmount(){

    }

    updateQueryValue = (e : React.FormEvent<HTMLInputElement>) => {
        this.setState({
            skillQuery: e.currentTarget.value
        })
    }


    render(){
        return (
            <Droppable droppableId={"EDITOR-" + this.props.composition.id} direction="horizontal" isDropDisabled={this.props.isDropDisabledSkilltrees}>
            {(provided, snapshot) => (
                <div {...provided.droppableProps} ref={provided.innerRef}
                style={{ backgroundColor: snapshot.isDraggingOver ? '#d4823a' : 'unset', height: "calc(100vh - 5rem - 30px)" }}>
                    <div className="is-flex is-flex-direction-row">
                      {this.props.skilltrees.map((skilltree, index) => {
                        return (
                        <Draggable isDragDisabled={this.state.isDragDisabledSkilltrees} key={skilltree.id} draggableId={'skilltree-' + skilltree.id} index={index} type="SKILLTREE">
                        {(provided) =>(
                        <div
                            ref={provided.innerRef} 
                            {...provided.draggableProps} 
                            {...provided.dragHandleProps}
                        >
                            <div className="box m-3" style={{width: 500, backgroundColor: 'rgba(75, 74, 74, 0.6)'}}>
                                <div className="level">
                                    <div className="level-left">
                                        <div className="title is-3 has-text-primary-light">{skilltree.title}</div>
                                    </div>
                                    <div className="level-right">
                                        <div className="buttons">
                                            <button className="button is-medium" onClick={() => this.props.editSkilltree(skilltree)}>
                                                <span className="icon is-medium">
                                                   <FontAwesomeIcon icon="edit"></FontAwesomeIcon>
                                                </span>
                                            </button>
                                            <button className="button is-medium" onClick={() => this.props.deleteSkilltree(skilltree)}>
                                                <span className="icon is-medium">
                                                   <FontAwesomeIcon icon="trash"></FontAwesomeIcon>
                                                </span>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                                <div className="content">
                                <div style={{ height: 500 }} 
                                    onMouseEnter={() => this.setState({isDragDisabledSkilltrees: true})}
                                    onMouseLeave={() => this.setState({isDragDisabledSkilltrees: false})}>
                                    <SortableTree
                                    getNodeKey={({ node }) => node.id}
                                    treeData={skilltree.data}
                                    onChange={treeData => console.log(treeData)}
                                    onMoveNode={(_treeData, node) => console.log(node)}
                                    generateNodeProps={({ node, path }) => ({
                                        title: (
                                            <Droppable droppableId={"SKILL-" + node.id} isDropDisabled={this.props.isDropDisabledSkills}>
                                                {(provided, snapshot) => (
                                                    <div className={`p-3 ${snapshot.isDraggingOver ? 'has-background-info-light' : ''}`} 
                                                    {...provided.droppableProps} ref={provided.innerRef}>
                                                        <div className="level" style={{width: '220px'}}>
                                                            <div className="level-left">
                                                                <div className="title is-6">{node.title}</div>
                                                            </div>
                                                            <div className="level-right">
                                                                <div className="buttons">
                                                                    <button className="button is-small" onClick={() => this.props.editSkill(node)}>
                                                                        <span className="icon is-small">
                                                                        <FontAwesomeIcon icon="edit"></FontAwesomeIcon>
                                                                        </span>
                                                                    </button>
                                                                    <button className="button is-small" onClick={() => this.props.deleteSkill(node)}>
                                                                        <span className="icon is-small">
                                                                        <FontAwesomeIcon icon="trash"></FontAwesomeIcon>
                                                                        </span>
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        {provided.placeholder}
                                                    </div>
                                            )}</Droppable>
                                        ),
                                    })}
                                    />
                                </div>
                            </div>
                            </div>
                            {provided.placeholder}
                        </div>
                        )}</Draggable>
                      )})}
                    </div>
                {provided.placeholder}
                </div>
            )}
            </Droppable>
        )
    }
}

function mapStateToProps(state) {
    return {
      user: state.auth.user
    };
  }

  export default connect(mapStateToProps)(EditorDisplay);
