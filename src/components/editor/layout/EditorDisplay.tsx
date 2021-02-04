import React, { Component } from 'react';
import ISkilltree from '../../../models/skilltree.model';
// import { db } from '../../../firebase/firebase';
import { connect } from "react-redux";
// import firebase from "firebase/app";
// import { toast } from 'react-toastify';
import IComposition from '../../../models/composition.model';
import '../../layout/CompositionDisplay.css';
import { Droppable } from 'react-beautiful-dnd';
import SkillTreeEditor  from '../elements/SkillTreeEditor';

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
    isDropDisabledSkilltrees: boolean;
    isDropDisabledSkilltree: boolean;
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


    updateQueryValue = (e : React.FormEvent<HTMLInputElement>) => {
        this.setState({
            skillQuery: e.currentTarget.value
        })
    }

    render(){
        return (
            <Droppable droppableId={"EDITOR-" + this.props.composition.id} isDropDisabled={this.props.isDropDisabledSkilltrees}>
            {(provided, snapshot) => (
                <div {...provided.droppableProps} ref={provided.innerRef}
                style={{ backgroundColor: snapshot.isDraggingOver ? '#d4823a' : 'unset' }}>
                    <div className="is-flex is-flex-direction-row is-flex-wrap-wrap is-justify-content-space-evenly">
                      {this.props.skilltrees.map((skilltree, index) => {
                        return (
                        <SkillTreeEditor
                            key={skilltree.id}
                            skilltree={skilltree}
                            index={index}
                            editSkilltree={this.props.editSkilltree}
                            deleteSkilltree={this.props.deleteSkilltree}
                            isDropDisabledSkills={this.props.isDropDisabledSkills}
                            editSkill={this.props.editSkill}
                            isDropDisabledSkilltree={this.props.isDropDisabledSkilltree}
                        ></SkillTreeEditor>
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
