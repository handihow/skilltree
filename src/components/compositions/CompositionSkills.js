import React, { Component } from 'react'
import { Redirect, Link } from 'react-router-dom';
import { db } from '../../firebase/firebase';

import SkillForm from '../layout/SkillForm';
import CompositionMenu from '../layout/CompositionMenu';
import SkillCard from '../layout/SkillCard';
import {toast} from 'react-toastify';
import features from '../payments/Features';

import {skillTreeToSkillArray, skillArrayToSkillTree} from './StandardFunctions';

export class CompositionSkills extends Component {

    state = {
        compositionId: this.props.match.params.compositionId,
        hasUnlockedUnlimitedSkills: false,
        toEditor: false,
        showEditor: false,
        isEditing: false,
        skilltrees: [],
        currentSkilltree: null,
        flatSkills: [],
        currentSkill: null,
        featureId: 'unlimited-skills'
    }

    componentDidMount() {
        const currentComponent = this;
        db.collection("compositions").doc(currentComponent.state.compositionId)
        .collection("skilltrees")
        .orderBy('order').get()
        .then(querySnapshot => {
            const data = querySnapshot.docs.map(doc => doc.data());
            const currentSkilltree = data[0]
            const flatSkills = skillTreeToSkillArray(data[0].data);
            currentComponent.setState({
                skilltrees: data,
                currentSkilltree: currentSkilltree,
                flatSkills: flatSkills
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
        if(this.state.flatSkills.length === 10 && !this.state.hasUnlockedUnlimitedSkills){
            return toast.error('You cannot have more than 10 skills per skill tree. You can pay $1,- to unlock unlimited skills feature.');
        }
        this.setState({
            showEditor: true
        });
    }

    editSkill = (skill) => {
        this.setState({
            showEditor: true,
            currentSkill: skill,
            isEditing: true
        })
    }

    updateSkill = (updatedSkill) => {
        const skilltree = this.state.currentSkilltree.data.map((skill) => {
            let foundIndex = skill.findIndex(s => s.id === updatedSkill.id);
            if(foundIndex > -1){

            }
        })
        db.collection('compositions')
        .doc(this.state.compositionId)
        .collection('skilltrees')
        .doc(skilltree.id).set(skilltree, {merge: true})
        .then(_=> {
            if(this.state.isEditing){
                const index = this.state.skilltrees.findIndex(st => st.id === skilltree.id);
                this.setState({
                    skilltrees: this.state.skilltrees.map((st) => {
                        if(st.id === skilltree.id){
                            st = skilltree
                        }
                        return st;
                    }),
                    showEditor: false,
                    currentSkilltree: null
                });
            } else {
                this.setState({
                    skilltrees: [...this.state.skilltrees, skilltree],
                    showEditor: false
                })
            }
        })
        .catch(error => {
            toast.error('Something went wrong...' + error.message);
        })
    }  

    deleteSkill = (skill) => {
        //check if at least one skilltree would remain
        // if(this.state.skilltrees.length === 1){
        //     return toast.error('You need to have at least one skilltree');
        // }
        // db.collection('compositions').doc(this.state.compositionId)
        // .collection('skilltrees').doc(skilltree.id)
        // .delete()
        // .then(_ => {
        //     this.setState({
        //         skilltrees: [...this.state.skilltrees.filter((st) => st.id !== skilltree.id)]
        //     })
        // })
        // .catch(error => {
        //     toast.error('Something went wrong...' + error.message);
        // });
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
                        <button className="button" onClick={this.addSkill}>Add skill</button>
                        {!this.state.hasUnlockedUnlimitedSkills && 
                        <Link to={`/compositions/${this.state.compositionId}/unlock/${this.state.featureId}`} 
                        className="button">Unlimited skills ${features[this.state.featureId].amount}</Link>}
                        </div>
                        <hr></hr>
                        <div className="container">
                        {this.state.flatSkills && this.state.flatSkills.map((skill, index) =>(
                            <SkillCard key={skill.id} 
                            skill={skill} editSkill={this.editSkill} 
                            deleteSkill={this.deleteSkill}/>
                        ))}
                        </div>
                    </div>
                </div>
                {this.state.showEditor && <SkillForm 
                isEditing={this.state.isEditing} 
                skilltree={this.state.currentSkilltree} 
                updateSkilltree={this.updateSkilltree}
                closeModal={this.closeModal}
                order={this.state.skilltrees.length}/>}
                </React.Fragment>
                
        )
    }
}

export default CompositionSkills
