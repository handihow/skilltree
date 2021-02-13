import React, { Component } from 'react'
import { db, storage } from '../../firebase/firebase';
import EditorDisplay from './layout/EditorDisplay';
import EditorMenu from './layout/EditorMenu';
import EditorNavbar from './layout/EditorNavbar';
import Loading from '../layout/Loading';
import { RouteComponentProps, Redirect } from 'react-router-dom';
import ISkilltree from '../../models/skilltree.model';
import IComposition from '../../models/composition.model';
import { toast } from 'react-toastify';
import { connect } from "react-redux";
import { SkilltreeForm } from './elements/SkilltreeForm';
import { DragDropContext } from 'react-beautiful-dnd';
import {getComposition, updateCompositionTitle} from '../../services/CompositionServices';
import {updateSkilltree, deleteSkilltree, getNumberOfRootSkills} from '../../services/SkillTreeServices';
import { showWarningModal, completedAfterWarning } from '../../actions/ui';
import {standardEmptySkill} from '../../services/StandardData';
import SkillForm from './elements/SkillForm';
import ISkill from '../../models/skill.model';
import {updateSkill} from '../../services/SkillServices';
import { v4 as uuid } from "uuid";
import BackgroundEditor from './layout/BackgroundEditor';
import ThemeEditor from './layout/ThemeEditor';

type TParams = { compositionId: string };

interface IEditorProps extends RouteComponentProps<TParams> {
    user: any;
    isAuthenticated: boolean;
    dispatch: any;
    hasDismissedWarning: boolean;
}

interface IEditorState {
    composition?: IComposition;
    hasBackgroundImage: boolean;
    backgroundImage?: string;
    skilltrees?: ISkilltree[];
    toEditor: boolean;
    unsubscribe?: any;
    showSkilltreeForm: boolean;
    showSkillForm: boolean;
    isEditingSkilltree: boolean;
    isEditingSkill: boolean;
    currentSkilltree?: ISkilltree;
    currentSkill?: ISkill;
    currentParentSkill?: ISkill;
    numberOfSkills: number;
    enableDropSkilltrees: boolean;
    enableDropInSkilltree: boolean;
    enableDropSkills: boolean;
    isAddingRootSkillAtIndex: number;
    isAddingSiblingSkill: boolean;
    isAddingChildSkill: boolean;
    destroyInProgress: boolean;
    showBackgroundEditor: boolean;
    showThemeEditor: boolean;
}

const defaultState = {
    showSkilltreeForm: false,
    showSkillForm: false,
    isEditingSkilltree: false,
    isEditingSkill: false,
    numberOfSkills: 0,
    enableDropSkilltrees: false,
    enableDropInSkilltree: false,
    enableDropSkills: true,
    isAddingSiblingSkill: false,
    isAddingChildSkill: false,
    destroyInProgress: false,
    isAddingRootSkillAtIndex: 0,
    currentParentSkill: undefined,
    currentSkill: undefined,
    currentSkilltree: undefined,
    showBackgroundEditor: false,
    showThemeEditor: false
}

export class Editor extends Component<IEditorProps, IEditorState> {
    constructor(props: IEditorProps) {
        super(props);
        this.state = {
            hasBackgroundImage: false,
            toEditor: false,
            ...defaultState
        };
        this.handleOnDragStart = this.handleOnDragStart.bind(this);
        this.handleOnDragEnd = this.handleOnDragEnd.bind(this);
        this.editSkilltree = this.editSkilltree.bind(this); 
        this.prepareDeleteSkilltree = this.prepareDeleteSkilltree.bind(this);
        this.updateSkilltree = this.updateSkilltree.bind(this);
        this.deleteSkilltree = this.deleteSkilltree.bind(this);
        this.editSkill = this.editSkill.bind(this); 
        this.updateSkill = this.updateSkill.bind(this); 
        this.changeCompositionTitle = this.changeCompositionTitle.bind(this);
        this.resetDefaultState = this.resetDefaultState.bind(this);
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

    componentDidUpdate(_prevProps) {
        if(this.props.hasDismissedWarning && !this.state.destroyInProgress){
            this.deleteSkilltree();
        }
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
            this.setState({
                enableDropSkilltrees: true,
                enableDropInSkilltree: false,
                enableDropSkills: false
            })
        } else if(result.draggableId === 'root-skill'){
            console.log('dragging a root skill');
            this.setState({
                enableDropSkilltrees: false,
                enableDropInSkilltree: true,
                enableDropSkills: false
            })
        }
    }

    resetDefaultState() {
        this.setState(defaultState);
    }

    async handleOnDragEnd(result) {
        this.setState({
            enableDropSkilltrees: false,
            enableDropInSkilltree: false,
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
        } else if(result.draggableId === 'root-skill' && this.state.skilltrees){
            const skilltreeId = result.destination.droppableId.replace("SKILLTREE-", "");
            const skilltreeIndex = this.state.skilltrees.findIndex(st => st.id === skilltreeId);
            if(skilltreeIndex === -1) return;
            const order = await getNumberOfRootSkills(this.state.skilltrees[skilltreeIndex])
            this.setState({
                showSkillForm: true,
                isAddingRootSkillAtIndex: order,
                currentSkilltree: this.state.skilltrees[skilltreeIndex],
            })
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

    async updateSkilltree(skilltree: ISkilltree, rootSkillTitle: string){
        if(!this.state.composition?.id) return;
        await updateSkilltree(skilltree, this.state.composition.id, this.state.isEditingSkilltree ? true : false, rootSkillTitle)
        this.resetDefaultState();
    }

   
    async deleteSkilltree(){
        if(!this.state.composition?.id || !this.state.currentSkilltree) return;
        this.setState({
            destroyInProgress: true
        })
        await deleteSkilltree(this.state.composition?.id, this.state.currentSkilltree);
        const { dispatch } = this.props;
        dispatch(completedAfterWarning());
        this.setState({
            destroyInProgress: false
        })
    }

    prepareDeleteSkilltree(skilltree: ISkilltree) {
        this.setState({
            currentSkilltree: skilltree
        });
        const { dispatch } = this.props;
        dispatch(showWarningModal('You are about to delete the SkillTree ' + skilltree?.title + ' including all related skills. You cannot undo this. Are you sure?'))
   
    }

    editSkill(skill: ISkill, skills: ISkill[]){
        if(!skill.parent || !skills || !this.state.skilltrees) return;
        const parentId = skill.parent[skill.parent.length - 3];
        const parentSkillIndex = skills.findIndex(s => s.id === parentId);
        const parentSkilltreeIndex = this.state.skilltrees.findIndex(st => st.id === skill.skilltree);
        this.setState({
            showSkillForm: true,
            currentSkill: skill,
            isEditingSkill: true,
            numberOfSkills: skills.length,
            currentParentSkill: parentSkillIndex > -1 ? skills[parentSkillIndex] : undefined,
            currentSkilltree: parentSkilltreeIndex > -1 ? this.state.skilltrees[parentSkilltreeIndex] : undefined
        });
    }

    async updateSkill(skill: ISkill){
        if(!this.state.currentSkilltree) return;
        await updateSkill(skill, this.state.currentSkilltree, this.state.numberOfSkills, this.state.currentParentSkill, this.state.isAddingRootSkillAtIndex, this.state.isEditingSkill)
        this.resetDefaultState();
    }

    toggleBackgroundEditor = async () => {
        if(this.state.showBackgroundEditor && this.state.composition?.id){
            const composition = await getComposition(this.state.composition.id);
            this.setCompositionBackground(composition || this.state.composition);
        }
        this.setState({
            showBackgroundEditor: !this.state.showBackgroundEditor,
            showThemeEditor: false
        })
    }

    toggleThemeEditor = async () => {
        this.setState({
            showThemeEditor: !this.state.showThemeEditor,
            showBackgroundEditor: false
        })
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

        const backgroundAndThemeEditorStyles: React.CSSProperties = {  
            height: "calc(100vh - 5rem - 30px)",
            overflowY: 'auto',
            overflowX: 'hidden',
       }
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
                                    <EditorMenu 
                                        id={this.props.match.params.compositionId} 
                                        hideDraggables={false} 
                                        toggleThemeEditor={this.toggleThemeEditor}
                                        isVisibleThemeEditor={this.state.showThemeEditor}
                                        toggleBackgroundEditor={this.toggleBackgroundEditor}
                                        isVisibleBackgroundEditor={this.state.showBackgroundEditor}
                                    />
                                </div>
                                {this.state.showBackgroundEditor && !this.state.showThemeEditor && <div className="column is-4" style={backgroundAndThemeEditorStyles}>
                                    <BackgroundEditor doneUpdatingBackground={this.toggleBackgroundEditor} compositionId={this.state.composition?.id || ''} />
                                </div>}
                                <div className="column pl-0 mt-0" style={{
                                        overflowY: 'auto',
                                        overflowX: 'hidden',
                                        ...editorDisplayStyles
                                    }}>
                                    {this.state.skilltrees && this.state.skilltrees.length > 0 && this.state.composition && !this.state.showThemeEditor &&
                                        <EditorDisplay
                                            theme={this.state.composition.theme}
                                            skilltrees={this.state.skilltrees || []}
                                            composition={this.state.composition}
                                            title={this.state.composition?.title || ''}
                                            isDropDisabledSkilltrees={!this.state.enableDropSkilltrees}
                                            isDropDisabledSkills={!this.state.enableDropSkills}
                                            isDropDisabledSkilltree={!this.state.enableDropInSkilltree}
                                            editSkilltree={this.editSkilltree}
                                            deleteSkilltree={this.prepareDeleteSkilltree}
                                            editSkill={this.editSkill}/>}
                                    {this.state.skilltrees && this.state.skilltrees.length > 0 && this.state.composition && this.state.showThemeEditor &&
                                        <ThemeEditor compositionId={this.state.composition.id || ''} doneUpdatingTheme={this.toggleThemeEditor} />}
                                </div>
                            </div>

                        </DragDropContext>
                        {this.state.showSkilltreeForm && <SkilltreeForm
                            isEditing={this.state.isEditingSkilltree}
                            skilltree={this.state.currentSkilltree}
                            closeModal={this.resetDefaultState}
                            updateSkilltree={this.updateSkilltree}
                            compositionId={this.props.match.params.compositionId}
                            order={this.state.isEditingSkilltree ? this.state.currentSkilltree?.order || 0 : this.state.skilltrees.length} />}
                        {this.state.showSkillForm && 
                            <SkillForm isEditing={this.state.isEditingSkill} updateSkill={this.updateSkill} closeModal={this.resetDefaultState}
                                skill={this.state.currentSkill ? this.state.currentSkill : {id: uuid(), ...standardEmptySkill}} />}
                    </React.Fragment>
        )
    }
}

function mapStateToProps(state) {
    return {
        isAuthenticated: state.auth.isAuthenticated,
        user: state.auth.user,
        hasDismissedWarning: state.ui.hasDismissedWarning
    };
}

export default connect(mapStateToProps)(Editor)