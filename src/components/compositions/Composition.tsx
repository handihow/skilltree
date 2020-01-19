import React, { Component } from 'react'
import { db, storage } from '../../firebase/firebase';
import CompositionDisplay from '../layout/CompositionDisplay';
import CompositionMenu from '../layout/CompositionMenu';
import Loading from '../layout/Loading';
import {skillArrayToSkillTree} from './StandardFunctions';
import { RouteComponentProps } from 'react-router-dom';
import ISkilltree from '../../models/skilltree.model';
import IComposition from '../../models/composition.model';
import ISkill from '../../models/skill.model';

type TParams =  { compositionId: string };

interface ICompositionState {
    composition?: IComposition;
    hasBackgroundImage: boolean;
    backgroundImage?: string;
    skilltrees?: ISkilltree[];
}

export class Composition extends Component<RouteComponentProps<TParams>,ICompositionState> {
    constructor(props: RouteComponentProps<TParams>){
        super(props);
        this.state = {
            hasBackgroundImage: false,
        }
    }

    componentDidMount() {
        const compositionId = this.props.match.params.compositionId;
        db.collection("compositions").doc(compositionId).get()
        .then(doc => {
            const composition = doc.data() as IComposition;
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
                        const imageRef = storageRef.child(composition.backgroundImage ||'');
                        imageRef.getDownloadURL()
                        .then(url => {
                            console.log(skilltrees);
                            this.setState({
                                composition, 
                                hasBackgroundImage: true, 
                                backgroundImage: url, 
                                skilltrees: skilltrees
                            });
                        });
                    } else {
                        this.setState({composition, skilltrees: skilltrees });
                    }
                })
                
            });
        });
    }

    render() {
        return (
            this.state.skilltrees && this.state.skilltrees.length===0 ? 
            <Loading /> :
            <div className="columns" style={{marginBottom: '0rem'}}>
                <div className="column is-2 has-background-white">
                    <CompositionMenu id={this.props.match.params.compositionId}/>
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
                    <div style={{maxHeight:'100%',overflow:'auto'}}>
                    {this.state.skilltrees && this.state.skilltrees.length > 0 && <CompositionDisplay
                    showController={true}
                    theme={this.state.composition?.theme} 
                    skilltrees={this.state.skilltrees || []}
                    compositionId={this.props.match.params.compositionId}
                    title={this.state.composition?.title || ''} />}</div>
                </div>
            </div>
        )
    }
}

export default Composition
