import React, { Component } from 'react'
import { Redirect, Link } from 'react-router-dom';
import { db } from '../../firebase/firebase';

import SkillForm from '../layout/SkillForm';
import CompositionMenu from '../layout/CompositionMenu';
import SkillCard from '../layout/SkillCard';
import {toast} from 'react-toastify';
import features from '../payments/Features';

import {skillTreeToSkillArray, skillArrayToSkillTree} from './StandardFunctions';
import update from 'react-addons-update';

export class CompositionSkills extends Component {

    state = {
        compositionId: this.props.match.params.compositionId,
        hasUnlockedUnlimitedSkills: false,
        toEditor: false,
        showEditor: false,
        isEditing: false,
        skilltrees: [],
        currentSkilltree: null,
        skills: [],
        filteredSkills: [],
        currentSkill: null,
        featureId: 'unlimited-skills'
    }

    componentDidMount() {
        const currentComponent = this;
        db.collection("compositions").doc(currentComponent.state.compositionId)
        .collection("skilltrees")
        .orderBy('order').get()
        .then(querySnapshot => {
            const skilltrees = querySnapshot.docs.map(doc => doc.data());
            db.collectionGroup('skills').where('composition', '==', currentComponent.state.compositionId)
            .orderBy('order').get()
            .then((querySnapshot) => {
                const skills = [];
                querySnapshot.docs.forEach((doc) => {
                    const parent = doc.ref.path.split('/');
                    const skill = {
                        parent: parent,
                        path: doc.ref.path,
                        parentPath: [...parent.filter((p,i,a) => i < a.length-2)].join('/'),
                        ...doc.data()
                    }
                    skills.push(skill);
                });
                currentComponent.setState({
                    skilltrees: skilltrees,
                    currentSkilltree: skilltrees[0],
                    skills: skills,
                    filteredSkills: skills.filter(s => s.skilltree === skilltrees[0].id)
                });
            });
        })
        .catch(error => {
            toast.error('Could not load skilltrees. Error ' + error.message);
        })
        const unsubscribe = db.collection('compositions')
            .doc(currentComponent.state.compositionId)
            .collection('payments')
            .doc(currentComponent.state.featureId)
            .onSnapshot(function(doc) {
                if(doc.exists){
                    const paymentRecord = doc.data();
                    if(paymentRecord.success){
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
        if(this.state.filteredSkills.length === 10 && !this.state.hasUnlockedUnlimitedSkills){
            toast.error('You cannot have more than 10 skills per skill tree. You can pay $1,- to unlock unlimited skills feature.');
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
            db.doc(updatedSkill.path).set({
                description: updatedSkill.description,
                title: updatedSkill.title,
                links: updatedSkill.links,
                optional: updatedSkill.optional,
                direction: updatedSkill.direction
            }, {merge: true})
            .then( _ => {
                const skillIndex = this.state.skills.findIndex(s => s.id === updatedSkill.id);
                const filteredSkillIndex = this.state.filteredSkills.findIndex(fs => fs.id === updatedSkill.id);
                if(skillIndex > -1){
                    toast.info('Update succesvol');
                    this.setState({
                        showEditor: false,
                        currentSkill: null,
                        isEditing: false,
                        skills: update(this.state.skills, {
                                [skillIndex]: {
                                    description: {$set: updatedSkill.description },
                                    title: {$set: updatedSkill.title },
                                    links: {$set: updatedSkill.links },
                                    optional: {$set: updatedSkill.optional },
                                    direction: {$set: updatedSkill.direction }
                            }
                        }),
                        filteredSkills: update(this.state.filteredSkills, {
                            [filteredSkillIndex]: {
                                description: {$set: updatedSkill.description },
                                title: {$set: updatedSkill.title },
                                links: {$set: updatedSkill.links },
                                optional: {$set: updatedSkill.optional },
                                direction: {$set: updatedSkill.direction }
                        }
                    })
                    })
                } else {
                    toast.info('Update succesvol, but skill not updated on the page. Please reload the page to reflect changes.');
                    //something went wrong, could not find skill in skills anymore
                    this.setState({
                        showEditor: false,
                        currentSkill: null,
                        isEditing: false
                    })
                }
                
            })
        }
    }  

    deleteSkill = (skill) => {
        // check if at least one skill would remain
        if(skill.childCount > 0){
            toast.error('This skill has children. Delete the child skills first');
        } else {
            db.doc(skill.path).delete()
            .then(_ => {
                if(skill.parent.length > 6){
                    //need to update the child count on the parent document
                    db.doc(skill.parentPath).get()
                    .then(snapshot => {
                        const parentSkill = snapshot.data();
                        const childCount = parentSkill.childCount - 1;
                        db.doc(skill.parentPath).set({
                            childCount: childCount
                        })
                        .then( _ => {
                            this.setState({
                                skills: [...this.state.skills.filter((s) => s.id !== skill.id)],
                                filteredSkills: [...this.state.filteredSkills.filter((fs) => fs.id !== skill.id)]
                            })
                        })
                        .catch(err => {
                            toast.error(err.message);
                        })
                    })
                    .catch(err => {
                        toast.error(err.message);
                    })
                } else {
                    this.setState({
                        skills: [...this.state.skills.filter((s) => s.id !== skill.id)],
                        filteredSkills: [...this.state.filteredSkills.filter((fs) => fs.id !== skill.id)]
                    })
                }
                
            })
            .catch(error => {
                toast.error('Something went wrong...' + error.message);
            });
        }
    }

    closeModal = () => {
        this.setState({
            showEditor : false,
            currentSkilltree: null
        })
    }
    
    render() {
        return (
            this.state.toEditor ?
                <Redirect to={`/compositions/${this.state.compositionId}`} /> :
                <React.Fragment>
                <div className="columns" >
                    <div className="column is-2">
                        <CompositionMenu id={this.state.compositionId} />
                    </div>
                    <div className="column" style={{ marginTop: "10px" }}>
                        <div className="title">Skills</div>
                        <div className="buttons">
                        <button className="button" onClick={this.addSkill}>Add root skill</button>
                        {!this.state.hasUnlockedUnlimitedSkills && 
                        <Link to={`/compositions/${this.state.compositionId}/unlock/${this.state.featureId}`} 
                        className="button">Unlimited skills ${features[this.state.featureId].amount}</Link>}
                        </div>
                        <hr></hr>
                        <div className="container">
                        {this.state.filteredSkills && this.state.filteredSkills.map((skill, index) =>(
                            <SkillCard key={skill.id} 
                            skill={skill} editSkill={this.editSkill} 
                            deleteSkill={this.deleteSkill}/>
                        ))}
                        </div>
                    </div>
                </div>
                {this.state.showEditor && <SkillForm 
                isEditing={this.state.isEditing} 
                skill={this.state.currentSkill} 
                skills={this.state.filteredSkills}
                updateSkill={this.updateSkill}
                closeModal={this.closeModal}
                />}
                </React.Fragment>
                
        )
    }
}

export default CompositionSkills
