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
    showWarning: boolean;
    isEditing: boolean;
    skilltrees: ISkilltree[];
    skills: ISkill[];
    currentSkill?: ISkill;
    parentSkill?: ISkill;
    parentSkilltree?: ISkilltree;
    isAddingRootSkill?: boolean;
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
            showWarning: false,
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
            const skilltrees = querySnapshot.docs.map(doc => { return {path: doc.ref.path,...doc.data() as ISkilltree}});
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
                            addSkill: () => this.addSkill(skill),
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
                    const filteredSkills = skills.filter(s => s.skilltree===skilltree.id);
                    skilltree.name = skilltree.title;
                    skilltree.isSkill = false;
                    skilltree.toggled = true;
                    skilltree.children = skillArrayToSkillTree(filteredSkills);
                    skilltree.decorators = {
                        addSkill: () => this.addSkill(undefined,skilltree)
                    };
                    skilltree.countChildren = filteredSkills.length;
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

    addSkill = (skill?: ISkill, skilltree?: ISkilltree) => {
        //maximum number of skills is 10 unless the unlimited feature is paid
        if(this.state.skills.length === 20 && !this.state.hasUnlockedUnlimitedSkills){
            toast.error('You cannot have more than 20 skills. You can pay $1,- to unlock unlimited skills feature.');
        } else {
            //add a child to an existing skill
            this.setState({
                showEditor: true,
                currentSkill: {id: uuid.v4(),...standardEmptySkill},
                isEditing: false,
                parentSkill: skill,
                parentSkilltree: skilltree,
                isAddingRootSkill: typeof skill == 'undefined' ? true : false
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
        let path = '';
        if(this.state.isEditing && updatedSkill.path){
            path = updatedSkill.path;
        } else if(!this.state.isEditing 
                    && !this.state.isAddingRootSkill) {
            path = `${this.state.parentSkill?.path}/skills/${updatedSkill.id}`
        } else if(!this.state.isEditing 
                    && this.state.isAddingRootSkill) {
            path = `${this.state.parentSkilltree?.path}/skills/${updatedSkill.id}`
        }
        let skill : ISkill = {
            id: updatedSkill.id,
            title: updatedSkill.title,
            description: updatedSkill.description,
            direction: updatedSkill.direction,
            links: updatedSkill.links,
            optional: updatedSkill.optional,
            countChildren: updatedSkill.countChildren
        }
        if(!this.state.isEditing && !this.state.isAddingRootSkill){
            skill.composition = this.state.parentSkill?.composition;
            skill.skilltree = this.state.parentSkill?.skilltree;
            skill.order = this.state.parentSkill?.countChildren;
        } else if(!this.state.isEditing && this.state.isAddingRootSkill){
            skill.composition = this.state.parentSkilltree?.composition;
            skill.skilltree = this.state.parentSkilltree?.id;
            skill.order = this.state.parentSkilltree?.countChildren;
        }
        if(path !== ''){
            db.doc(path).set(skill, {merge: true})
            .then( _ => {
                if(this.state.isEditing || (!this.state.isEditing && this.state.isAddingRootSkill)){
                    this.onSuccessfullUpdate(skill);
                } else if(!this.state.isEditing && this.state.parentSkill && this.state.parentSkill.path) {
                    db.doc(this.state.parentSkill.path).set({
                        countChildren: this.state.parentSkill?.countChildren + 1
                    }, {merge: true})
                    .then( _ => {
                        this.onSuccessfullUpdate(skill);
                    })
                }
            })
            .catch(err => {
                toast.error(err.message);
            });
        } else {
            toast.error('Could not construct the path to updated skill')
        }
    }  

    onSuccessfullUpdate(skill: ISkill){
        toast.info(`${skill.title} updated successfully`);
        this.setState({
            showEditor: false,
            isEditing: false
        });
    }

    deleteSkill = (skill: ISkill) => {
        this.setState({
            currentSkill: skill,
            showWarning: true
        })
    }

    confirmDeleteSkill = () => {
        const currentComponent = this;
        const toastId = uuid.v4();
        toast.info('Deleting skill all related child skills is in progress... please wait', {
          toastId: toastId
        })
        const skillPath = this.state.currentSkill?.path;
        const deleteFirestorePathRecursively = functions.httpsCallable('deleteFirestorePathRecursively');
        deleteFirestorePathRecursively({
            collection: 'Skill',
            path: skillPath
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
                currentComponent.closeWarning()
              }).catch(function(error) {
                toast.update(toastId, {
                  render: error.message,
                  type: toast.TYPE.ERROR
                });
                currentComponent.closeWarning()
              });
    }

    closeWarning = () => {
        this.setState({
            currentSkill: undefined,
            showWarning: false
        })
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
                    <div className="column" style={{ marginTop: "10px", height:"calc(100vh - 3.5rem)", overflow: 'auto' }}>
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
                    <div className={this.state.showEditor ? "column is-6" : "column is-1"}>
                    {this.state.showEditor && <SkillForm 
                    isEditing={this.state.isEditing} 
                    skill={this.state.currentSkill ? this.state.currentSkill : {id: uuid.v4(), ...standardEmptySkill}} 
                    updateSkill={this.updateSkill}
                    closeModal={this.closeModal}
                    parentName={this.state.parentSkill ? this.state.parentSkill.title : ''}
                    />}
                    </div>
                </div>
                <div className={`modal ${this.state.showWarning ? "is-active" : ""}`}>
                    <div className="modal-background"></div>
                    <div className="modal-card">
                    <header className="modal-card-head">
                        <p className="modal-card-title">Are you sure?</p>
                        <button className="delete" aria-label="close" onClick={this.closeWarning}></button>
                    </header>
                    <section className="modal-card-body">
                        You are about to delete skill '{this.state.currentSkill?.title}' and related child skills. Do you want to delete?
                    </section>
                    <footer className="modal-card-foot">
                        <button className="button is-danger" onClick={this.confirmDeleteSkill}>Delete</button>
                        <button className="button" onClick={this.closeWarning}>Cancel</button>
                    </footer>
                    </div>
                </div>
                </React.Fragment>
                
        )
    }
}

export default CompositionSkills
