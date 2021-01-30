import React, { Component } from 'react'
import { db, storage } from '../../firebase/firebase';
import EditorDisplay from './layout/EditorDisplay';
import EditorMenu from './layout/EditorMenu';
import EditorNavbar from './layout/EditorNavbar';
import WarningModal from './elements/WarningModal';
import Loading from '../layout/Loading';
import { skillArrayToSkillTree } from '../../services/StandardFunctions';
import { RouteComponentProps, Redirect } from 'react-router-dom';
import ISkilltree from '../../models/skilltree.model';
import IComposition from '../../models/composition.model';
import ISkill from '../../models/skill.model';
import { toast } from 'react-toastify';
import { connect } from "react-redux";
import { SkilltreeForm } from './elements/SkilltreeForm';
import { DragDropContext } from 'react-beautiful-dnd';
import {getComposition, updateCompositionTitle} from '../../services/CompositionServices';
import {updateSkilltree, deleteSkilltree} from '../../services/SkillTreeServices';

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
    skills?: ISkill[];
    processedSkilltrees?: ISkilltree[];
    toEditor: boolean;
    subSkilltrees?: any;
    subSkills?: any;
    showSkilltreeForm: boolean;
    isEditingSkilltree: boolean;
    currentSkilltree?: ISkilltree;
    showWarningMessage: boolean;
    warningMessage?: string;
    confirmedWarningFunction: Function;
    numberOfSkills: number;
    enableDropSkilltrees: boolean;
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
            confirmedWarningFunction: (event) => { console.log(event) },
            enableDropSkilltrees: false
        }
        this.handleOnDragStart = this.handleOnDragStart.bind(this);
        this.handleOnDragEnd = this.handleOnDragEnd.bind(this);
        this.closeSkilltreeModal = this.closeSkilltreeModal.bind(this);
        this.editSkilltree = this.editSkilltree.bind(this);
        this.prepareDeleteSkilltree = this.prepareDeleteSkilltree.bind(this);
        this.updateSkilltree = this.updateSkilltree.bind(this);
        this.deleteSkilltree = this.deleteSkilltree.bind(this);
        this.toggleShowWarningMessage = this.toggleShowWarningMessage.bind(this);
        this.changeCompositionTitle = this.changeCompositionTitle.bind(this);
    }

    async componentDidMount() {
        const compositionId = this.props.match.params.compositionId;
        const composition = await getComposition(compositionId);
        if(!composition || this.props.user.uid !== composition.user){
            toast.error('Composition not found or you are not the owner of this skilltree.');
            this.setState({
                toEditor: true
            })
            return;
        }
        this.setCompositionBackground(composition);
        this.subscribeSkillChanges();
    }

    setCompositionBackground(composition: IComposition){
        if (composition.hasBackgroundImage) {
            //fetch the background image
            const storageRef = storage.ref();
            const imageRef = storageRef.child(composition.backgroundImage || '');
            imageRef.getDownloadURL()
                .then(url => {
                    this.setState({
                        hasBackgroundImage: true,
                        backgroundImage: url,
                        composition: composition
                    });
                });
        } else {
            this.setState({
                hasBackgroundImage: false,
                composition: composition
            })
        }  
    }

    subscribeSkillChanges(){
        const subSkills =
        db.collectionGroup('skills').where('composition', '==', this.props.match.params.compositionId).orderBy('order').onSnapshot((querySnapshot) => {
            const skills: ISkill[] = [];
            querySnapshot.docs.forEach((doc) => {
                const skill: ISkill = {
                    parent: doc.ref.path.split('/'),
                    path: doc.ref.path,
                    ...doc.data() as ISkill
                }
                skills.push(skill);
            });
            this.setState({
                skills: skills,
                numberOfSkills: skills.length
            });
            this.processSkilltreeData(true);
        });
        this.setState({
            subSkills: subSkills
        });
        this.subscribeSkilltreeChanges();
    }

    subscribeSkilltreeChanges(){
        const subST = 
        db.collection("compositions").doc(this.props.match.params.compositionId)
        .collection("skilltrees").orderBy('order').onSnapshot(async querySnapshot => {
            const skilltrees = querySnapshot.docs.map(doc => {
                return {data: [], ...doc.data() as ISkilltree}
            });
            this.setState({
                skilltrees
            });
            this.processSkilltreeData(!this.state.processedSkilltrees || 
                this.state.skilltrees?.length === this.state.processedSkilltrees.length ? true : false);
        });
        this.setState({
            subSkilltrees: subST
        });
    }

    processSkilltreeData(proceed: boolean){
        if(!proceed) return;
        const skilltrees : ISkilltree[] = this.state.skilltrees || [];
        const skills : ISkill[] = this.state.skills || [];
        if(skilltrees.length === 0 || skills.length === 0) return;
        skilltrees.forEach((skilltree) => {
            skilltree.data = skillArrayToSkillTree(skills.filter((s: ISkill) => s.skilltree === skilltree.id), false);
        });
        this.setState({
            processedSkilltrees: skilltrees
        });
    }

    changeCompositionTitle(event){
        const title = event.value || '';
        updateCompositionTitle(this.props.match.params.compositionId, title);
        this.setState({
            composition: {
                ...this.state.composition,
                title
            }
        });
    }

    componentWillUnmount() {
        this.state.subSkills();
        this.state.subSkilltrees();
    }

    handleOnDragStart(result) {
        console.log(result);
        if(result.source.droppableId.startsWith('EDITOR') && result.draggableId.startsWith('skilltree')) {
            console.log('moving skilltree')
            this.setState({
                enableDropSkilltrees: true
            })
        } else if (result.source.droppableId === 'MENU' && result.draggableId === 'skilltree') {
            console.log('creating skilltree');
            this.setState({
                enableDropSkilltrees: true
            })
        }
        
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

    updateSkilltree(skilltree: ISkilltree, rootSkillTitle: string){
        if(!this.state.composition?.id) return;
        updateSkilltree(skilltree, this.state.composition.id, this.state.isEditingSkilltree ? true : false, rootSkillTitle)
        .then(_ => {
            this.closeSkilltreeModal();
        })
    }

    deleteSkilltree(){
        if(!this.state.composition?.id || !this.state.currentSkilltree) return;
        deleteSkilltree(this.state.composition?.id, this.state.currentSkilltree)
        .then(_ => {
            this.toggleShowWarningMessage();
            this.closeSkilltreeModal();
        });
    }

    prepareDeleteSkilltree() {
        this.setState({
            showSkilltreeForm: false,
            showWarningMessage: true,
            warningMessage: 'You are about to delete the SkillTree ' + this.state.currentSkilltree?.title + ' including all related skills. You cannot undo this. Are you sure?',
            confirmedWarningFunction: () => this.deleteSkilltree()
        });
    }

    render() {
        const editorDisplayStyles: React.CSSProperties = {
            position: 'relative',
            height: "calc(100vh - 5rem - 30px)",
            padding: '0px',
            marginTop: '0.75rem',
            backgroundColor: !this.state.hasBackgroundImage ? 'hsl(0, 0%, 48%)' : 'unset',
            backgroundImage: this.state.hasBackgroundImage ? `url(${this.state.backgroundImage})` : 'unset',
            backgroundSize: this.state.hasBackgroundImage ? 'cover' : 'unset',
        };
        return (
            this.state.toEditor ?
                <Redirect to={'/'} /> :
                !this.state.processedSkilltrees || this.state.processedSkilltrees.length === 0 ?
                    <Loading /> :
                    <React.Fragment>
                        <EditorNavbar numberOfSkills={this.state.numberOfSkills} 
                        id={this.state.composition?.id}
                        composition={this.state.composition}
                        changeCompositionTitle={this.changeCompositionTitle}></EditorNavbar>
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
                                            skilltrees={this.state.processedSkilltrees || []}
                                            composition={this.state.composition}
                                            title={this.state.composition?.title || ''}
                                            isDropDisabledSkilltrees={!this.state.enableDropSkilltrees}
                                            editSkilltree={this.editSkilltree} />}
                                </div>
                            </div>

                        </DragDropContext>
                        {this.state.showSkilltreeForm && <SkilltreeForm
                            isEditing={this.state.isEditingSkilltree}
                            skilltree={this.state.currentSkilltree}
                            closeModal={this.closeSkilltreeModal}
                            updateSkilltree={this.updateSkilltree}
                            deleteSkilltree={this.prepareDeleteSkilltree}
                            compositionId={this.props.match.params.compositionId}
                            order={this.state.processedSkilltrees.length} />}
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