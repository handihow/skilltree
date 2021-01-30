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
    isDropDisabledSkilltrees: boolean;
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
                            onDoubleClick={() => this.props.editSkilltree(skilltree)}
                        >
                            <div className="box m-3" style={{width: 500}}>
                                <div className="title is-3">{skilltree.title}</div>
                                <div className="content">
                                <div style={{ height: 500 }} 
                                    onMouseEnter={() => this.setState({isDragDisabledSkilltrees: true})}
                                    onMouseLeave={() => this.setState({isDragDisabledSkilltrees: false})}>
                                    <SortableTree
                                    treeData={skilltree.data}
                                    onChange={treeData => console.log(treeData)}
                                    onMoveNode={(_treeData, node) => console.log(node)}
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
