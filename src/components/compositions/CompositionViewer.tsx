import React, { Component } from 'react'
import { db, storage } from '../../firebase/firebase';
import CompositionDisplay from '../layout/CompositionDisplay';
import Loading from '../layout/Loading';
import {skillArrayToSkillTree} from './StandardFunctions';
import { RouteComponentProps } from 'react-router-dom';
import ISkilltree from '../../models/skilltree.model';
import IComposition from '../../models/composition.model';
import ISkill from '../../models/skill.model';
import { connect } from "react-redux";
import Login from '../Login';
import firebase from "firebase/app";
import { toast } from 'react-toastify';

type TParams =  { compositionId: string };

interface ICompositionViewerProps extends RouteComponentProps<TParams>{
    user: any;
    isAuthenticated: boolean;
}

interface ICompositionViewerState {
    composition?: IComposition;
    hasBackgroundImage: boolean;
    backgroundImage?: string;
    skilltrees?: ISkilltree[];
}

export class CompositionViewer extends Component<ICompositionViewerProps,ICompositionViewerState> {
    constructor(props: ICompositionViewerProps){
        super(props);
        this.state = {
            hasBackgroundImage: false,
        }
    }

    componentDidUpdate(prevProps){
        if(!prevProps.isAuthenticated && this.props.isAuthenticated){
            console.log('adding skilltree to shared')
            this.addSharedUser();
        }
        
    }

    addSharedUser = () => {
        if(this.props.isAuthenticated 
            && this.state.composition
            && !this.state.composition.sharedUsers?.includes(this.props.user.uid)
            && this.state.composition.user !== this.props.user.uid ){
                console.log('adding skilltree to shared')
            db.collection("compositions").doc(this.state.composition?.id).update({
                sharedUsers: firebase.firestore.FieldValue.arrayUnion(this.props.user.uid)
            })
            .then( _ => {
                toast.info('Skilltree was added to your list of shared skilltrees')
            })
            .catch(e => {
                toast.error(e.message);
            })
        }
    }

    componentDidMount() {
        const compositionId = this.props.match.params.compositionId;
        db.collection("compositions").doc(compositionId).get()
        .then(doc => {
            const composition = doc.data() as IComposition;
            this.setState({
                composition: composition
            })
            db.collection("compositions").doc(compositionId)
            .collection("skilltrees").orderBy('order').get()
            .then(async querySnapshot => {
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
                        const imageRef = storageRef.child(composition.backgroundImage || '');
                        imageRef.getDownloadURL()
                        .then(url => {
                            this.setState({
                                composition, 
                                hasBackgroundImage: true, 
                                backgroundImage: url, 
                                skilltrees: skilltrees
                            });
                            this.addSharedUser();
                        });
                    } else {
                        this.setState({composition, skilltrees: skilltrees });
                        this.addSharedUser();
                    }
                })
                
            });
        });
    }

    render() {
        return (
            this.state.skilltrees && this.state.skilltrees.length===0 ? 
            <Loading /> :
                this.state.composition?.loggedInUsersOnly && !this.props.isAuthenticated ? 
                <Login onCompositionPage={true} /> :
                <div style={this.state.hasBackgroundImage ? 
                                                {
                                                    backgroundImage: `url(${this.state.backgroundImage})`,
                                                    backgroundSize: 'cover',
                                                    position : 'relative',
                                                    height:"calc(100vh - 3.5rem)",
                                                    padding: '0px',
                                                }
                                                : undefined}>
                    <div style={{maxHeight:'100%',overflow:'auto'}}>
                    {this.state.skilltrees && this.state.skilltrees.length > 0 && <CompositionDisplay
                    showController={true}
                    theme={this.state.composition?.theme} 
                    skilltrees={this.state.skilltrees || []}
                    compositionId={this.props.match.params.compositionId}
                    title={this.state.composition?.title || ''} />}</div>
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

export default connect(mapStateToProps)(CompositionViewer)
