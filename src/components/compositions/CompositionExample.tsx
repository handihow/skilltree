import React, { Component } from 'react'
import ISkilltree from '../../models/skilltree.model';
import IComposition from '../../models/composition.model';
import ISkill from '../../models/skill.model';
import { db, storage } from '../../firebase/firebase';
import {skillArrayToSkillTree} from './StandardFunctions';
import CompositionDisplay from '../layout/CompositionDisplay';

interface ICompositionExampleProps {
    compositionId: string;
}

interface ICompositionExampleState {
    composition?: IComposition;
    hasBackgroundImage: boolean;
    backgroundImage?: string;
    skilltrees?: ISkilltree[];
}

export class CompositionExample extends Component<ICompositionExampleProps, ICompositionExampleState> {

    constructor(props: ICompositionExampleProps){
        super(props);
        this.state = {
            hasBackgroundImage: false
        }
    }

    componentDidMount() {
        db.collection("compositions").doc(this.props.compositionId).get()
        .then(doc => {
            const composition = doc.data() as IComposition;
            db.collection("compositions").doc(this.props.compositionId)
            .collection("skilltrees").orderBy('order').get()
            .then(async querySnapshot => {
                const skilltrees = querySnapshot.docs.map(doc => doc.data() as ISkilltree);
                db.collectionGroup('skills').where('composition', '==', this.props.compositionId).orderBy('order').get()
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
            <div style={this.state.hasBackgroundImage ? 
                {
                    backgroundImage: `url(${this.state.backgroundImage})`,
                    backgroundSize: 'cover',
                    position : 'relative',
                    height:"calc(100vh - 3.5rem)",
                    padding: '0px',
                    marginTop: '0.75rem',
                    width: '100%'
                }
                : undefined}>
                <div style={{maxHeight:'100%',overflow:'auto'}}>
                {this.state.skilltrees && this.state.skilltrees.length > 0 && this.state.composition && 
                <CompositionDisplay
                showController={false}
                theme={this.state.composition.theme} 
                skilltrees={this.state.skilltrees || []}
                composition={this.state.composition}
                title={this.state.composition?.title || ''} />}</div>
                </div>
        )
    }
}

export default CompositionExample
