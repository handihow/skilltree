import React, { Component } from 'react'
import { db, storage } from '../../firebase/firebase';
import EditorDisplay from './layout/EditorDisplay';
import EditorMenu from './layout/EditorMenu';
import EditorNavbar from './layout/EditorNavbar';
import WarningModal from './elements/WarningModal';
import Loading from '../layout/Loading';
import { RouteComponentProps, Redirect } from 'react-router-dom';
import ISkilltree from '../../models/skilltree.model';
import IComposition from '../../models/composition.model';
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
    toEditor: boolean;
    unsubscribe?: any;
    showSkilltreeForm: boolean;
    isEditingSkilltree: boolean;
    currentSkilltree?: ISkilltree;
    showWarningMessage: boolean;
    warningMessage?: string;
    confirmedWarningFunction: Function;
    numberOfSkills: number;
    enableDropSkilltrees: boolean;
    enableDropSkills: boolean;
    isAddingRootSkill: boolean;
    isAddingSiblingSkill: boolean;
    isAddingChildSkill: boolean;
    dropTargetSkillId: string;
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
            enableDropSkilltrees: false,
            enableDropSkills: true,
            isAddingRootSkill: false,
            isAddingSiblingSkill: false,
            isAddingChildSkill: false,
            dropTargetSkillId: ''
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
        this.subscribeSkilltreeChanges();
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

    

    subscribeSkilltreeChanges(){
        const unsubscribe = 
        db.collection("compositions").doc(this.props.match.params.compositionId)
        .collection("skilltrees").orderBy('order').onSnapshot(async querySnapshot => {
            const skilltrees = querySnapshot.docs.map(doc => {
                return {path: doc.ref.path, ...doc.data() as ISkilltree}
            });
            this.setState({
                skilltrees
            });
        });
        this.setState({
            unsubscribe
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
        this.state.unsubscribe();
    }

    handleOnDragStart(result) {
        console.log(result);
        if(result.draggableId.startsWith('skilltree')) {
            console.log('moving or creating skilltree')
            this.setState({
                enableDropSkilltrees: true,
                enableDropSkills: false
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
        this.setState({
            enableDropSkilltrees: false,
            enableDropSkills: true
        })
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
        console.log(skilltree);
        this.setState({
            showSkilltreeForm: true,
            currentSkilltree: skilltree,
            isEditingSkilltree: true
        });
    }

    

    async updateSkilltree(skilltree: ISkilltree, rootSkillTitle: string){
        if(!this.state.composition?.id) return;
        await updateSkilltree(skilltree, this.state.composition.id, this.state.isEditingSkilltree ? true : false, rootSkillTitle)
        this.closeSkilltreeModal();
    }

   
    async deleteSkilltree(){
        if(!this.state.composition?.id || !this.state.currentSkilltree) return;
        await deleteSkilltree(this.state.composition?.id, this.state.currentSkilltree)
        this.toggleShowWarningMessage();
        this.closeSkilltreeModal();
    }

    prepareDeleteSkilltree(skilltree: ISkilltree) {
        this.setState({
            currentSkilltree: skilltree,
            showSkilltreeForm: false,
            showWarningMessage: true,
            warningMessage: 'You are about to delete the SkillTree ' + skilltree?.title + ' including all related skills. You cannot undo this. Are you sure?',
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
                !this.state.skilltrees || this.state.skilltrees.length === 0 ?
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
                                        overflowY: 'auto',
                                        overflowX: 'hidden',
                                        ...editorDisplayStyles
                                    }}>
                                    {this.state.skilltrees && this.state.skilltrees.length > 0 && this.state.composition &&

                                        <EditorDisplay
                                            theme={this.state.composition.theme}
                                            skilltrees={this.state.skilltrees || []}
                                            composition={this.state.composition}
                                            title={this.state.composition?.title || ''}
                                            isDropDisabledSkilltrees={!this.state.enableDropSkilltrees}
                                            isDropDisabledSkills={!this.state.enableDropSkills}
                                            editSkilltree={this.editSkilltree}
                                            deleteSkilltree={this.prepareDeleteSkilltree}
                                            isAddingRootSkill={this.state.isAddingRootSkill}
                                            isAddingSiblingSkill={this.state.isAddingSiblingSkill}
                                            isAddingChildSkill={this.state.isAddingChildSkill}
                                            dropTargetSkillId={this.state.dropTargetSkillId}/>}
                                </div>
                            </div>

                        </DragDropContext>
                        {this.state.showSkilltreeForm && <SkilltreeForm
                            isEditing={this.state.isEditingSkilltree}
                            skilltree={this.state.currentSkilltree}
                            closeModal={this.closeSkilltreeModal}
                            updateSkilltree={this.updateSkilltree}
                            compositionId={this.props.match.params.compositionId}
                            order={this.state.isEditingSkilltree ? this.state.currentSkilltree?.order || 0 : this.state.skilltrees.length} />}
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