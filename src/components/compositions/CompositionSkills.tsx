import React, { Component } from 'react'
import { Redirect, Link } from 'react-router-dom';
import { db } from '../../firebase/firebase';

import SkillForm from '../layout/SkillForm';
import CompositionMenu from '../layout/CompositionMenu';
import {toast} from 'react-toastify';
import features from '../payments/Features';
import {skillArrayToSkillTree} from './StandardFunctions';
import TreeView from '../layout/TreeView';
import ISkill from '../../models/skill.model';
import ISkilltree from '../../models/skilltree.model';
import { RouteComponentProps } from 'react-router-dom';
import { standardEmptySkill } from './StandardData';

interface ICompositionSkillsState{
    hasUnlockedUnlimitedSkills: boolean;
    toEditor: boolean;
    showEditor: boolean;
    isEditing: boolean;
    skilltrees: ISkilltree[];
    skills: ISkill[];
    currentSkill?: ISkill;
    featureId: string;
    unsubscribe?: any;
}


export class CompositionSkills extends Component<RouteComponentProps, ICompositionSkillsState> {
    constructor(props: RouteComponentProps){
        super(props);
        this.state = {
            hasUnlockedUnlimitedSkills: false,
            toEditor: false,
            showEditor: false,
            isEditing: false,
            skilltrees: [],
            skills: [],
            featureId: 'unlimited-skills'
        };
    }


    componentDidMount() {
        const currentComponent = this;
        const compositionId = this.props.match.params.compositionId;
        db.collection("compositions").doc(compositionId)
        .collection("skilltrees")
        .orderBy('order').get()
        .then(async querySnapshot => {
            const skilltrees = querySnapshot.docs.map(doc => doc.data() as ISkilltree);
            db.collectionGroup('skills').where('composition', '==', compositionId).orderBy('order').get()
            .then((querySnapshot) => {
                const skills : ISkill[] = [];
                querySnapshot.docs.forEach((doc) => {
                    const skill : ISkill = {
                        parent: doc.ref.path.split('/'),
                        path: doc.ref.path,
                        name: doc.data().title,
                        isSkill: true,
                        decorators: {
                            editSkill: () => this.editSkill(skill),
                            closeModal: () => this.closeModal()
                        },
                        toggled: true,
                        ...doc.data() as ISkill
                    }
                    skills.push(skill);
                });
                skilltrees.forEach((skilltree) => {
                    skilltree.name = skilltree.title;
                    skilltree.isSkill = false;
                    skilltree.toggled = true;
                    skilltree.children = skillArrayToSkillTree(skills.filter(s => s.skilltree===skilltree.id));
                });
                this.setState({
                    skilltrees: skilltrees,
                    skills: skills
                });
            })
        })
        .catch(error => {
            toast.error('Could not load skilltrees. Error ' + error.message);
        })
        const unsubscribe = db.collection('compositions')
            .doc(compositionId)
            .collection('payments')
            .doc(this.state.featureId)
            .onSnapshot(function(doc) {
                if(doc.exists){
                    const paymentRecord = doc.data() || false;
                    if(paymentRecord && paymentRecord.success){
                        currentComponent.setState({
                            hasUnlockedUnlimitedSkills: true
                        })
                    }
                }
            });
        currentComponent.setState({
            unsubscribe: unsubscribe
        });
    }

    componentWillUnmount(){
        this.state.unsubscribe();
    }

    addSkill = () => {
        //maximum number of skills is 10 unless the unlimited feature is paid
        if(this.state.skills.length === 10 && !this.state.hasUnlockedUnlimitedSkills){
            toast.error('You cannot have more than 10 skills. You can pay $1,- to unlock unlimited skills feature.');
        } else {
            this.setState({
                showEditor: true
            });
        }
    }

    editSkill = (skill) => {
        this.setState({
            showEditor: true,
            currentSkill: skill,
            isEditing: true
        })
    }

    updateSkill = (updatedSkill) => {
        console.log(updatedSkill);
        if(this.state.isEditing){
            db.doc(updatedSkill.path).set(updatedSkill, {merge: true})
            .then( _ => {
                this.setState({
                    showEditor: false,
                    isEditing: false
                });
            })
            .catch(err => {
                toast.error(err.message);
            });
        }
    }  

    deleteSkill = (skill) => {
        db.doc(skill.path).delete()
        .then(_ => {
            toast.info('Skill successfully deleted');
        })
        .catch(error => {
            toast.error('Something went wrong...' + error.message);
        });
    }

    closeModal = () => {
        this.setState({
            showEditor : false,
        })
    }
    
    render() {
        const {skilltrees} = this.state;
        return (
            this.state.toEditor ?
                <Redirect to={`/compositions/${this.props.match.params.compositionId}`} /> :
                <React.Fragment>
                <div className="columns" >
                    <div className="column is-2">
                        <CompositionMenu id={this.props.match.params.compositionId} />
                    </div>
                    <div className="column" style={{ marginTop: "10px" }}>
                        <div className="title">Skills</div>
                        <div className="buttons">
                        {!this.state.hasUnlockedUnlimitedSkills && 
                        <Link to={`/compositions/${this.props.match.params.compositionId}/unlock/${this.state.featureId}`} 
                        className="button">Unlimited skills ${features[this.state.featureId].amount}</Link>}
                        </div>
                        <hr></hr>
                        <div className="container">
                        {skilltrees && skilltrees.map(tree => (
                            <TreeView
                                key={tree.id}
                                data={tree}
                                editSkill={this.editSkill}
                            />
                        ))}
                        </div>
                    </div>
                    <div className="column is-6">
                    {this.state.showEditor && <SkillForm 
                    isEditing={this.state.isEditing} 
                    skill={this.state.currentSkill ? this.state.currentSkill : standardEmptySkill} 
                    skills={this.state.skills}
                    updateSkill={this.updateSkill}
                    closeModal={this.closeModal}
                    />}
                    </div>
                </div>
                </React.Fragment>
                
        )
    }
}

export default CompositionSkills
