import React, { Component } from 'react'
import { Droppable, Draggable } from 'react-beautiful-dnd';
import ISkilltree from '../../../models/skilltree.model';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import SortableTree from 'react-sortable-tree';
import ISkill from '../../../models/skill.model';
import { db } from '../../../firebase/firebase';
import { skillArrayToSkillTree, arraysEqual } from '../../../services/StandardFunctions';
import SkillForm from './SkillForm';
import {updateSkill, deleteSkill, moveSkill, reorderSkills } from '../../../services/SkillServices';
import {standardEmptySkill} from '../../../services/StandardData';
import { v4 as uuid } from "uuid";
import WarningModal from './WarningModal';

interface ISkillTreeEditorProps {
    skilltree: ISkilltree;
    index: number;
    editSkilltree: Function;
    deleteSkilltree: Function;
    isDropDisabledSkills: boolean;
    isAddingRootSkill: boolean;
    isAddingSiblingSkill: boolean;
    isAddingChildSkill: boolean;
    dropTargetSkillId: string;
}

interface ISkillTreeEditorState {
    isDragDisabledSkilltrees: boolean;
    data: any;
    skills?: ISkill[];
    isEditingSkill: boolean;
    currentSkill?: ISkill;
    currentParentSkill?: ISkill;
    showWarningMessage?: boolean;
    warningMessage?: string;
    confirmedWarningFunction?: Function;
    showSkillForm?: boolean;
    unsubscribe?: any;
    isMobile: boolean;
    allowSubscriptionUpdates: boolean;
}


export default class SkillTreeEditor extends Component<ISkillTreeEditorProps, ISkillTreeEditorState> {
    constructor(props: ISkillTreeEditorProps) {
        super(props);
        this.state = {
            isDragDisabledSkilltrees: false,
            isEditingSkill: false,
            data: [],
            isMobile: window.innerWidth <= 760,
            allowSubscriptionUpdates: true
        }
        this.editSkill = this.editSkill.bind(this);
        this.updateSkill = this.updateSkill.bind(this);
        this.moveExistingSkill = this.moveExistingSkill.bind(this);
        this.closeSkillFormModal = this.closeSkillFormModal.bind(this);
        this.prepareDeleteSkill = this.prepareDeleteSkill.bind(this);
        this.toggleShowWarningMessage = this.toggleShowWarningMessage.bind(this);
    }

    componentDidMount(){
        this.subscribeSkillChanges();
        window.addEventListener("resize", this.resize.bind(this));
        this.resize();
    }

    componentWillUnmount() {
        this.state.unsubscribe();
    }

    resize() {
        this.setState({isMobile: window.innerWidth <= 760});
    }

    subscribeSkillChanges(){
        const unsubscribe =
        db.collectionGroup('skills').where('skilltree', '==', this.props.skilltree.id).orderBy('order').onSnapshot((querySnapshot) => {
            const skills: ISkill[] = [];
            querySnapshot.docs.forEach((doc) => {
                const skill: ISkill = {
                    ...doc.data() as ISkill,
                    parent: doc.ref.path.split('/'),
                    path: doc.ref.path
                }
                skills.push(skill);
            });
            if(this.state.allowSubscriptionUpdates){
                this.setState({
                    skills
                });
                this.processSkilltreeData(skills);
            }
        });
        this.setState({
            unsubscribe
        });
    }

    processSkilltreeData(skills: ISkill[]){
        const data = skillArrayToSkillTree(skills.filter((s: ISkill) => s.skilltree === this.props.skilltree.id), false);
        this.setState({
            data
        });
    }

    closeSkillFormModal() {
        this.setState({
            currentSkill: undefined,
            currentParentSkill: undefined,
            isEditingSkill: false,
            showSkillForm: false,
        });
    }

    updateSortableTree(data){
        this.setState({
            data
        })
    }

    moveExistingSkill(data){
        const keepsParent = arraysEqual(data.nextPath, data.prevPath);
        const keepsIndex = data.prevTreeIndex === data.nextTreeIndex;
        if(keepsParent && keepsIndex) return;
        this.setState({
            allowSubscriptionUpdates: false
        });
        if(keepsParent){
            // changeOrderOfSkills()
            console.log('keeping parent');
            reorderSkills(data);
        } else {
            moveSkill(data, this.props.skilltree);
        }
    }

    // addSkill = (skill: ISkill, type: string) => {
    //     if(!this.state.skilltrees) return;
    //     let isAddingRootSkill = false;
    //     const parentId = skill.parent[skill.parent.length - 3];
    //     const parentSkilltreeIndex = this.state.skilltrees.findIndex(st => st.id === skill.);
    //     switch (type) {
    //         case 'root':
    //             isAddingRootSkill = true;
    //             break;
    //         case 'sibling':
    //             break;
    //         case 'child':
    //             break;
    //         default:
    //             break;
    //     }
    //     //add a child to an existing skill
    //     this.setState({
    //         showSkillForm: true,
    //         currentSkill: {id: uuid(),...standardEmptySkill},
    //         isEditingSkill: false,
    //         parentSkill: skill,
    //         parentSkilltree: skilltree,
    //         isAddingRootSkill: isAddingRootSkill
    //     });
    // }

    editSkill(skill: ISkill){
        if(!skill.parent || !this.state.skills) return;
        const parentId = skill.parent[skill.parent.length - 3];
        const parentSkillIndex = this.state.skills.findIndex(s => s.id === parentId);
        this.setState({
            showSkillForm: true,
            currentSkill: skill,
            isEditingSkill: true,
            currentParentSkill: parentSkillIndex > -1 ? this.state.skills[parentSkillIndex] : undefined,
        });
    }

    async updateSkill(skill: ISkill){
        this.setState({
            allowSubscriptionUpdates: true
        });
        console.log(skill);
        await updateSkill(skill, this.props.skilltree, this.state.currentParentSkill, this.props.isAddingRootSkill, this.state.isEditingSkill)
        this.closeSkillFormModal();
    }

    prepareDeleteSkill(skill: ISkill) {
        this.setState({
            currentSkill: skill,
            showSkillForm: false,
            showWarningMessage: true,
            allowSubscriptionUpdates: true,
            warningMessage: 'You are about to delete the Skill ' + skill?.title + ' including all related child skills. You cannot undo this. Are you sure?',
            confirmedWarningFunction: () => this.deleteSkill()
        });
    }

    async deleteSkill(){
        if(!this.state.currentSkill) return;
        await deleteSkill(this.state.currentSkill?.path || '', this.props.skilltree?.composition || '');
        this.toggleShowWarningMessage();
        this.closeSkillFormModal();
    }

    toggleShowWarningMessage() {
        this.setState({
            showWarningMessage: !this.state.showWarningMessage
        })
    }

    render() {
        return (
            <React.Fragment>
            <Draggable isDragDisabled={this.state.isDragDisabledSkilltrees} key={this.props.skilltree.id} draggableId={'skilltree-' + this.props.skilltree.id} index={this.props.index} type="SKILLTREE">
                {(provided) => (
                    <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                    >
                        <div className="box m-3" style={{ width:  this.state.isMobile ? 400 : 600, backgroundColor: 'rgba(75, 74, 74, 0.6)' }}>
                            <div className="level is-mobile">
                                <div className="level-left">
                                    <div className="title is-3 has-text-primary-light">{this.props.skilltree.title}</div>
                                </div>
                                <div className="level-right">
                                    <div className="buttons">
                                        <button className="button is-medium" onClick={() => this.props.editSkilltree(this.props.skilltree)}>
                                            <span className="icon is-medium">
                                                <FontAwesomeIcon icon="edit"></FontAwesomeIcon>
                                            </span>
                                        </button>
                                        <button className="button is-medium" onClick={() => this.props.deleteSkilltree(this.props.skilltree)}>
                                            <span className="icon is-medium">
                                                <FontAwesomeIcon icon="trash"></FontAwesomeIcon>
                                            </span>
                                        </button>
                                    </div>
                                </div>
                            </div>
                            <div className="content">
                                <div style={{ height: 500 }}
                                    onMouseEnter={() => this.setState({ isDragDisabledSkilltrees: true })}
                                    onMouseLeave={() => this.setState({ isDragDisabledSkilltrees: false })}>
                                    <SortableTree
                                        getNodeKey={({ node }) => node.id}
                                        treeData={this.state.data}
                                        onChange={(data) => this.updateSortableTree(data)}
                                        onMoveNode={(data) => this.moveExistingSkill(data)}
                                        generateNodeProps={({ node }) => ({
                                            title: (
                                                <Droppable droppableId={"SKILL-" + node.id} isDropDisabled={this.props.isDropDisabledSkills}>
                                                    {(provided, snapshot) => (
                                                        <div className={`p-3 ${snapshot.isDraggingOver ? 'has-background-info-light' : ''}`}
                                                            {...provided.droppableProps} ref={provided.innerRef}>
                                                            <div className="level is-mobile" style={{ width: '220px' }}>
                                                                <div className="level-left">
                                                                    <div className="title is-6">{node.title}</div>
                                                                </div>
                                                                <div className="level-right">
                                                                    <div className="buttons">
                                                                        <button className="button is-small" onClick={() => this.editSkill(node)}>
                                                                            <span className="icon is-small">
                                                                                <FontAwesomeIcon icon="edit"></FontAwesomeIcon>
                                                                            </span>
                                                                        </button>
                                                                        <button className="button is-small" onClick={() => this.prepareDeleteSkill(node)}>
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
                {this.state.showSkillForm && 
                    <SkillForm isEditing={this.state.isEditingSkill} updateSkill={this.updateSkill} closeModal={this.closeSkillFormModal}
                        parent={this.state.currentParentSkill}
                        skill={this.state.currentSkill ? this.state.currentSkill : {id: uuid(), ...standardEmptySkill}}
                        skills={[]} skilltrees={[]} />}
                {this.state.showWarningMessage && <WarningModal
                            toggleShowWarningMessage={this.toggleShowWarningMessage}
                            warningMessage={this.state.warningMessage}
                            confirmedWarningFunction={this.state.confirmedWarningFunction}></WarningModal>}
                </React.Fragment>
        )
    }
}


