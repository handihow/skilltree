import React, { Component } from 'react'
import { Redirect, Link } from 'react-router-dom';
import { db, functions } from '../../firebase/firebase';

import uuid from 'uuid';
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
    unsubscribeSkills?: any;
    unsubscribePaymentFeature?: any;
}

type TParams =  { compositionId: string };

export class CompositionSkills extends Component<RouteComponentProps<TParams>, ICompositionSkillsState> {
    constructor(props: RouteComponentProps<TParams>){
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
            const unsubscribeSkills = db.collectionGroup('skills').where('composition', '==', compositionId).orderBy('order')
            .onSnapshot((querySnapshot) => {
                const skills : ISkill[] = [];
                querySnapshot.docs.forEach((doc) => {
                    const skill : ISkill = {
                        parent: doc.ref.path.split('/'),
                        path: doc.ref.path,
                        name: doc.data().title,
                        isSkill: true,
                        decorators: {
                            editSkill: () => this.editSkill(skill),
                            closeModal: () => this.closeModal(),
                            deleteSkill: () => this.deleteSkill(skill)
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
                    skills: skills,
                    unsubscribeSkills: unsubscribeSkills
                });
            })
        })
        .catch(error => {
            toast.error('Could not load skilltrees. Error ' + error.message);
        })
        const unsubscribePaymentFeature = db.collection('compositions')
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
            unsubscribePaymentFeature: unsubscribePaymentFeature
        });
    }

    componentWillUnmount(){
        this.state.unsubscribeSkills();
        this.state.unsubscribePaymentFeature();
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

    updateSkill = (updatedSkill: ISkill) => {
        if(this.state.isEditing && updatedSkill.path){
            const skill : ISkill = {
                id: updatedSkill.id,
                title: updatedSkill.title,
                description: updatedSkill.description,
                direction: updatedSkill.direction,
                links: updatedSkill.links,
                order: updatedSkill.order,
                optional: updatedSkill.optional
            }
            db.doc(updatedSkill.path).set(skill, {merge: true})
            .then( _ => {
                toast.info(`${skill.title} updated successfully`);
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

    deleteSkill = (skill: ISkill) => {
        const toastId = uuid.v4();
        let currentComponent = this;
        toast.info('Deleting skill all related child skills is in progress... please wait', {
          toastId: toastId
        })
        const skillPath = skill.path;
        const deleteSkill = functions.httpsCallable('deleteSkill');
        deleteSkill({
            skillPath
        }).then(function(result) {
                if(result.data.error){
                    toast.update(toastId, {
                      render: result.data.error,
                    });
                } else {
                  toast.update(toastId, {
                    render: 'Skill and related child skills deleted successfully'
                  });
                }
              }).catch(function(error) {
                toast.update(toastId, {
                  render: error.message,
                  type: toast.TYPE.ERROR
                });
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
                                deleteSkill={this.deleteSkill}
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
