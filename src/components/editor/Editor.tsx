import React, { Component } from 'react'
import { db, storage } from '../../firebase/firebase';
import EditorDisplay from '../layout/EditorDisplay';
import EditorMenu from '../layout/EditorMenu';
import Loading from '../layout/Loading';
import {skillArrayToSkillTree} from '../compositions/StandardFunctions';
import { RouteComponentProps, Redirect } from 'react-router-dom';
import ISkilltree from '../../models/skilltree.model';
import IComposition from '../../models/composition.model';
import ISkill from '../../models/skill.model';
import { toast } from 'react-toastify';
import { connect } from "react-redux";
import { DragDropContext } from 'react-beautiful-dnd';

type TParams =  { compositionId: string };

interface ICompositionProps extends RouteComponentProps<TParams>{
    user: any;
    isAuthenticated: boolean;
}

interface ICompositionState {
    composition?: IComposition;
    hasBackgroundImage: boolean;
    backgroundImage?: string;
    skilltrees?: ISkilltree[];
    toEditor: boolean;
    unsubscribe?: any;
}

export class Composition extends Component<ICompositionProps,ICompositionState> {
    constructor(props: ICompositionProps){
        super(props);
        this.state = {
            hasBackgroundImage: false,
            toEditor: false,
        }
        this.handleOnDragEnd = this.handleOnDragEnd.bind(this);
    }

    handleOnDragEnd(result) {
        if (!result.destination) {
           return;   
        } else if(result.source.droppableId === 'skilltrees' && result.destination.droppableId === 'skilltrees' && this.state.skilltrees){
             const movingSkilltreeRef = db.collection('compositions').doc(this.state.composition?.id).collection('skilltrees').doc(this.state.skilltrees[result.source.index].id);
             const replacedSkilltreeRef = db.collection('compositions').doc(this.state.composition?.id).collection('skilltrees').doc(this.state.skilltrees[result.destination.index].id);
             const batch = db.batch();
             batch
             .update(movingSkilltreeRef, {order: result.destination.index});
             batch
             .update(replacedSkilltreeRef, {order: result.source.index});
             batch.commit();
        }

     }

    componentDidMount() {
        const compositionId = this.props.match.params.compositionId;
        db.collection("compositions").doc(compositionId).get()
        .then(doc => {
            const composition = doc.data() as IComposition;
            if(this.props.user.uid !== composition.user) {
                toast.error('You are not the owner of this skilltree. You cannot view in editor mode.');
                this.setState({
                    toEditor: true
                })
            } else {
                const unsubscribe = db.collection("compositions").doc(compositionId)
                .collection("skilltrees").orderBy('order').onSnapshot(async querySnapshot => {
                    const skilltrees = querySnapshot.docs.map(doc => doc.data() as ISkilltree);
                    db.collectionGroup('skills').where('composition', '==', compositionId).orderBy('order').get()
                    .then((querySnapshot) => {
                        const skills : ISkill[] = [];
                        querySnapshot.docs.forEach((doc) => {
                            const skill : ISkill = {
                                parent: doc.ref.path.split('/'),
                                path: doc.ref.path,
                                ...doc.data() as ISkill
                            }
                            skills.push(skill);
                        });
                        skilltrees.forEach((skilltree) => {
                            skilltree.data = skillArrayToSkillTree(skills.filter((s:ISkill) => s.skilltree===skilltree.id));
                        });
                        if(composition?.hasBackgroundImage){
                            //fetch the background image
                            const storageRef = storage.ref();
                            const imageRef = storageRef.child(composition.backgroundImage ||'');
                            imageRef.getDownloadURL()
                            .then(url => {
                                this.setState({
                                    composition, 
                                    unsubscribe,
                                    hasBackgroundImage: true, 
                                    backgroundImage: url, 
                                    skilltrees: skilltrees
                                });
                            });
                        } else {
                            this.setState({composition, unsubscribe, skilltrees: skilltrees });
                        }
                    })  
                    });
            }
            
        });
    }

    componentWillUnmount(){
        if(this.state.unsubscribe){
            this.state.unsubscribe();
        }  
    }

    render() {
        return (
            this.state.toEditor ?
            <Redirect to={'/'} /> :
            !this.state.skilltrees || this.state.skilltrees.length===0 ? 
            <Loading /> : 
            <div className="columns is-mobile" style={{marginBottom: '0rem', overflow:'auto'}}>
                <div className="column is-2 has-background-white">
                    <EditorMenu id={this.props.match.params.compositionId}/>
                </div>
                <div className="column" style={this.state.hasBackgroundImage ? 
                                                {
                                                    backgroundImage: `url(${this.state.backgroundImage})`,
                                                    backgroundSize: 'cover',
                                                    position : 'relative',
                                                    height:"calc(100vh - 3.5rem)",
                                                    padding: '0px',
                                                    marginTop: '0.75rem'
                                                }
                                                : undefined}>
                    <div style={{maxHeight:'100%', overflow:'auto'}}>
                    {this.state.skilltrees && this.state.skilltrees.length > 0 && this.state.composition && 
                    <DragDropContext onDragEnd={this.handleOnDragEnd}>
                    <EditorDisplay
                    theme={this.state.composition.theme} 
                    skilltrees={this.state.skilltrees || []}
                    composition={this.state.composition}
                    title={this.state.composition?.title || ''} /></DragDropContext>}
                    </div>
                </div>
            </div>
        )
    }
}

function mapStateToProps(state) {
    return {
      isAuthenticated: state.auth.isAuthenticated,
      user: state.auth.user
    };
  }

export default connect(mapStateToProps)(Composition)