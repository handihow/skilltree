import React, { PureComponent } from 'react'
import { Redirect, Link } from 'react-router-dom';
import { db } from '../../firebase/firebase';

import SkillForm from '../layout/SkillForm';
import CompositionMenu from '../layout/CompositionMenu';
import {toast} from 'react-toastify';
import features from '../payments/Features';
import {Treebeard} from 'react-treebeard';
import {skillArrayToSkillTree} from './StandardFunctions';
import {treebeardTheme} from './StandardData';

const decorators = {
    Loading: (props) => {
        return (
            <div style={props.style}>
                loading...
            </div>
        );
    },
    Toggle: (props) => {
        return (
            <div style={props.style}>
                <svg height={props.height} width={props.width}>
                    // Vector Toggle Here
                </svg>
            </div>
        );
    },
    Header: (props) => {
        return (
            <div style={props.style}>
                {props.node.name}

            </div>
        );
    },
    Container: (props) => {
        return (
            <div onClick={this.props.onClick}>
                // Hide Toggle When Terminal Here
                <this.props.decorators.Toggle/>
                <this.props.decorators.Header/>
            </div>
        );
    }
};

export class CompositionSkills extends PureComponent {
    constructor(props){
        super(props);
        this.state = {
            compositionId: this.props.match.params.compositionId,
            hasUnlockedUnlimitedSkills: false,
            toEditor: false,
            showEditor: false,
            isEditing: false,
            skilltrees: [],
            skills: [],
            currentSkill: null,
            cursor: null,
            featureId: 'unlimited-skills'
        };
        this.onToggle = this.onToggle.bind(this);
    }

    componentDidMount() {
        const currentComponent = this;
        const compositionId = currentComponent.state.compositionId;
        db.collection("compositions").doc(compositionId)
        .collection("skilltrees")
        .orderBy('order').get()
        .then(async querySnapshot => {
            const skilltrees = querySnapshot.docs.map(doc => doc.data());
            db.collectionGroup('skills').where('composition', '==', compositionId).orderBy('order').get()
            .then((querySnapshot) => {
                const skills = [];
                querySnapshot.docs.forEach((doc) => {
                    const skill = {
                        parent: doc.ref.path.split('/'),
                        path: doc.ref.path,
                        name: doc.data().title,
                        isSkill: true,
                        ...doc.data()
                    }
                    skills.push(skill);
                });
                skilltrees.forEach((skilltree) => {
                    skilltree.name = skilltree.title;
                    skilltree.isSkill = false;
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
                this.setState({
                    showEditor: false,
                    currentSkill: null,
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
        console.log('closed modal')
        this.setState({
            showEditor : false,
            currentSkilltree: null
        })
    }

    onToggle(node, toggled){
        this.closeModal();
        const {cursor, data} = this.state;
        if (cursor) {
            this.setState(() => ({cursor, active: false}));
        }
        node.active = true;
        if (node.children) { 
            node.toggled = toggled; 
        }
        this.setState(() => ({
            cursor: node, 
            data: Object.assign({}, data)
        }));
        console.log(node);
        if(node.isSkill){
            this.setState({
                showEditor: true,
                isEditing: true,
                currentSkill: node
            });
        }
    }
    
    render() {
        const {skilltrees} = this.state;
        console.log(this.state.showEditor)
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
                        {!this.state.hasUnlockedUnlimitedSkills && 
                        <Link to={`/compositions/${this.state.compositionId}/unlock/${this.state.featureId}`} 
                        className="button">Unlimited skills ${features[this.state.featureId].amount}</Link>}
                        </div>
                        <hr></hr>
                        <div className="container">
                        {skilltrees && skilltrees.map(tree => (
                            <Treebeard
                                key={tree.id}
                                data={tree}
                                onToggle={this.onToggle}
                                style={treebeardTheme}
                            />
                        ))
                        }
                        </div>
                    </div>
                    <div className="column is-6">
                    {this.state.showEditor && <SkillForm 
                    isEditing={this.state.isEditing} 
                    skill={this.state.currentSkill} 
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
