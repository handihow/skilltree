import React, { Component } from 'react'
import { db, storage } from '../../firebase/firebase';
import EditorDisplay from './layout/EditorDisplay';
import EditorMenu from './layout/EditorMenu';
import EditorNavbar from './layout/EditorNavbar';
import WarningModal from './elements/WarningModal';
import Loading from '../layout/Loading';
import { skillArrayToSkillTree } from '../compositions/StandardFunctions';
import { RouteComponentProps, Redirect } from 'react-router-dom';
import ISkilltree from '../../models/skilltree.model';
import IComposition from '../../models/composition.model';
import ISkill from '../../models/skill.model';
import { toast } from 'react-toastify';
import { connect } from "react-redux";
import { SkilltreeForm } from './elements/SkilltreeForm';
import { DragDropContext } from 'react-beautiful-dnd';
import {getComposition} from './services/CompositionServices';
import {deleteSkilltree} from './services/SkillTreeServices';

type TParams = { compositionId: string };

interface IEditorProps extends RouteComponentProps<TParams> {
    user: any;
    isAuthenticated: boolean;
}

interface IEditorState {
    composition?: IComposition;
    hasBackgroundImage: boolean;
    backgroundImage?: string;
    skilltrees?: ISkilltree[];
    toEditor: boolean;
    unsubscribe?: any;
    showSkilltreeForm: boolean;
    isEditingSkilltree: boolean;
    currentSkilltree?: ISkilltree;
    showWarningMessage: boolean;
    warningMessage?: string;
    confirmedWarningFunction: Function;
    numberOfSkills: number;
}

export class Editor extends Component<IEditorProps, IEditorState> {
    constructor(props: IEditorProps) {
        super(props);
        this.state = {
            hasBackgroundImage: false,
            toEditor: false,
            showSkilltreeForm: false,
            isEditingSkilltree: false,
            showWarningMessage: false,
            numberOfSkills: 0,
            confirmedWarningFunction: (event) => { console.log(event) }
        }
        this.handleOnDragStart = this.handleOnDragStart.bind(this);
        this.handleOnDragEnd = this.handleOnDragEnd.bind(this);
        this.closeSkilltreeModal = this.closeSkilltreeModal.bind(this);
        this.editSkilltree = this.editSkilltree.bind(this);
        this.prepareDeleteSkilltree = this.prepareDeleteSkilltree.bind(this);
        this.toggleShowWarningMessage = this.toggleShowWarningMessage.bind(this);
    }

    componentDidMount() {
        const compositionId = this.props.match.params.compositionId;
        getComposition(compositionId)
        .then(composition => {
            if(!composition){
                toast.error('Could not find composition');
                return
            } else if (this.props.user.uid !== composition.user) {
                toast.error('You are not the owner of this skilltree. You cannot view in editor mode.');
                this.setState({
                    toEditor: true
                })
            } else {
                const unsubscribe = db.collection("compositions").doc(compositionId)
                    .collection("skilltrees").orderBy('order').onSnapshot(async querySnapshot => {
                        console.log('updating skilltrees');
                        const skilltrees = querySnapshot.docs.map(doc => doc.data() as ISkilltree);
                        db.collectionGroup('skills').where('composition', '==', compositionId).orderBy('order').get()
                            .then((querySnapshot) => {
                                console.log('new querysnapshot');
                                const skills: ISkill[] = [];
                                querySnapshot.docs.forEach((doc) => {
                                    const skill: ISkill = {
                                        parent: doc.ref.path.split('/'),
                                        path: doc.ref.path,
                                        ...doc.data() as ISkill
                                    }
                                    skills.push(skill);
                                });
                                console.log(skills);
                                skilltrees.forEach((skilltree) => {
                                    skilltree.data = skillArrayToSkillTree(skills.filter((s: ISkill) => s.skilltree === skilltree.id));
                                    console.log(skilltree.data);
                                });
                                if (composition?.hasBackgroundImage) {
                                    //fetch the background image
                                    const storageRef = storage.ref();
                                    const imageRef = storageRef.child(composition.backgroundImage || '');
                                    imageRef.getDownloadURL()
                                        .then(url => {
                                            this.setState({
                                                hasBackgroundImage: true,
                                                backgroundImage: url,
                                            });
                                        });
                                } 
                                this.setState({
                                    composition,
                                    unsubscribe,
                                    skilltrees: skilltrees,
                                    numberOfSkills: skills.length,
                                    currentSkilltree: undefined,
                                    isEditingSkilltree: false,
                                    showWarningMessage: false,
                                    showSkilltreeForm: false,
                                    warningMessage: undefined,
                                    confirmedWarningFunction: (event) => {}
                                });
                            })
                    });
            }
        });
                

    }

    componentWillUnmount() {
        if (this.state.unsubscribe) {
            this.state.unsubscribe();
        }
    }

    handleOnDragStart(result) {
        console.log(result);
    }

    toggleShowWarningMessage() {
        this.setState({
            showWarningMessage: !this.state.showWarningMessage
        })
    }

    closeSkilltreeModal() {
        this.setState({
            currentSkilltree: undefined,
            isEditingSkilltree: false,
            showSkilltreeForm: false
        });
    }

    handleOnDragEnd(result) {
        if (!result.destination) {
            return;
        } else if (result.source.droppableId.startsWith('EDITOR') && result.destination.droppableId.startsWith('EDITOR') && result.draggableId.startsWith('skilltree')) {
            this.moveExistingSkilltree(result);
        } else if (result.source.droppableId === 'MENU' && result.destination.droppableId.startsWith('EDITOR') && result.draggableId === 'skilltree') {
            this.setState({
                showSkilltreeForm: true
            });
        } else {
            console.log(result);
        }

    }

    async moveExistingSkilltree(result) {
        const skilltreeId = result.draggableId.replace("skilltree-", "");
        const compositionId = result.source.droppableId.replace("EDITOR-", "");
        const movedItem = this.state.skilltrees?.find(st => st.id === skilltreeId);
        const remainingItems = this.state.skilltrees?.filter(st => st.id !== skilltreeId) || [];
        const reorderedItems = [
            ...remainingItems.slice(0, result.destination.index),
            movedItem,
            ...remainingItems.slice(result.destination.index)
        ];
        const batch = db.batch();
        reorderedItems.forEach((item, index) => {
            const ref = db.collection('compositions').doc(compositionId).collection('skilltrees').doc(item?.id);
            batch.update(ref, { order: index });
        });
        batch.commit();
    }
   

    editSkilltree(skilltree: ISkilltree) {
        this.setState({
            showSkilltreeForm: true,
            currentSkilltree: skilltree,
            isEditingSkilltree: true
        });
    }

    prepareDeleteSkilltree() {
        this.setState({
            showSkilltreeForm: false,
            showWarningMessage: true,
            warningMessage: 'You are about to delete the SkillTree ' + this.state.currentSkilltree?.title + ' including all related skills. You cannot undo this. Are you sure?',
            confirmedWarningFunction: () => deleteSkilltree(this.state.composition?.id, this.state.currentSkilltree)
        });
    }

    render() {
        const editorDisplayStyles: React.CSSProperties = {
            position: 'relative',
            height: "calc(100vh - 3.5rem)",
            padding: '0px',
            marginTop: '0.75rem',
            backgroundColor: !this.state.hasBackgroundImage ? 'hsl(0, 0%, 48%)' : 'unset',
            backgroundImage: this.state.hasBackgroundImage ? `url(${this.state.backgroundImage})` : 'unset',
            backgroundSize: this.state.hasBackgroundImage ? 'cover' : 'unset',
        };
        return (
            this.state.toEditor ?
                <Redirect to={'/'} /> :
                !this.state.skilltrees || this.state.skilltrees.length === 0 ?
                    <Loading /> :
                    <React.Fragment>
                        <EditorNavbar numberOfSkills={this.state.numberOfSkills} id={this.state.composition?.id}></EditorNavbar>
                        <DragDropContext onDragEnd={this.handleOnDragEnd} onDragStart={this.handleOnDragStart}>
                            <div className="columns is-mobile mb-0 mt-0">

                                <div className="column is-1 has-background-light pr-0 pt-0">
                                    <EditorMenu id={this.props.match.params.compositionId} hideDraggables={false} />
                                </div>
                                <div className="column pl-0 mt-0" style={{
                                        overflow: 'auto',
                                        ...editorDisplayStyles
                                    }}>
                                    {this.state.skilltrees && this.state.skilltrees.length > 0 && this.state.composition &&

                                        <EditorDisplay
                                            theme={this.state.composition.theme}
                                            skilltrees={this.state.skilltrees || []}
                                            composition={this.state.composition}
                                            title={this.state.composition?.title || ''}
                                            editSkilltree={this.editSkilltree} />}
                                </div>
                            </div>

                        </DragDropContext>
                        {this.state.showSkilltreeForm && <SkilltreeForm
                            isEditing={this.state.isEditingSkilltree}
                            skilltree={this.state.currentSkilltree}
                            closeModal={this.closeSkilltreeModal}
                            deleteSkilltree={this.prepareDeleteSkilltree}
                            compositionId={this.props.match.params.compositionId}
                            order={this.state.skilltrees.length} />}
                        {this.state.showWarningMessage && <WarningModal
                            toggleShowWarningMessage={this.toggleShowWarningMessage}
                            warningMessage={this.state.warningMessage}
                            confirmedWarningFunction={this.state.confirmedWarningFunction}></WarningModal>}
                    </React.Fragment>
        )
    }
}

function mapStateToProps(state) {
    return {
        isAuthenticated: state.auth.isAuthenticated,
        user: state.auth.user
    };
}

export default connect(mapStateToProps)(Editor)