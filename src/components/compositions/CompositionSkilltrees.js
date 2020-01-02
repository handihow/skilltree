import React, { Component } from 'react'
import { Redirect, Link } from 'react-router-dom';
import { db } from '../../firebase/firebase';

import SkilltreeForm from '../layout/SkilltreeForm';
import CompositionMenu from '../layout/CompositionMenu';
import SkilltreeCard from '../layout/SkilltreeCard';
import {toast} from 'react-toastify';
import features from '../payments/Features';

export class CompositionSkilltrees extends Component {

    state = {
        compositionId: this.props.match.params.compositionId,
        hasUnlockedUnlimitedSkilltrees: false,
        toEditor: false,
        showEditor: false,
        isEditing: false,
        skilltrees: [],
        currentSkilltree: null,
        featureId: 'unlimited-skilltrees'
    }

    componentDidMount() {
        const currentComponent = this;
        db.collection("compositions").doc(currentComponent.state.compositionId)
        .collection("skilltrees")
        .orderBy('order').get()
        .then(querySnapshot => {
            const data = querySnapshot.docs.map(doc => doc.data());
            currentComponent.setState({skilltrees: data });
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
                            hasUnlockedUnlimitedSkilltrees: true
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

    addSkilltree = () => {
        //maximum number of skill trees is 2 unless the unlimited feature is paid
        if(this.state.skilltrees.length === 2 && !this.state.hasUnlockedUnlimitedSkilltrees){
            return toast.error('You cannot have more than 2 skilltrees. You can pay $1,- to unlock unlimited skill trees feature.');
        }
        this.setState({
            showEditor: true
        });
    }

    editSkilltree = (skilltree) => {
        this.setState({
            showEditor: true,
            currentSkilltree: skilltree,
            isEditing: true
        })
    }

    updateSkilltree = (skilltree) => {
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

    deleteSkilltree = (skilltree) => {
        //check if at least one skilltree would remain
        if(this.state.skilltrees.length === 1){
            return toast.error('You need to have at least one skilltree');
        }
        db.collection('compositions').doc(this.state.compositionId)
        .collection('skilltrees').doc(skilltree.id)
        .delete()
        .then(_ => {
            this.setState({
                skilltrees: [...this.state.skilltrees.filter((st) => st.id !== skilltree.id)]
            })
        })
        .catch(error => {
            toast.error('Something went wrong...' + error.message);
        });
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
                <div className="columns" style={{ marginTop: "10px" }}>
                    <div className="column is-one-fifth">
                        <CompositionMenu id={this.state.compositionId} />
                    </div>
                    <div className="column">
                        <div className="container">
                        <div className="title">Skilltrees</div>
                        <div className="buttons">
                        <button className="button" onClick={this.addSkilltree}>Add skilltree</button>
                        {!this.state.hasUnlockedUnlimitedSkilltrees && 
                                <Link to={`/compositions/${this.state.compositionId}/unlock/${this.state.featureId}`} 
                        className="button">Unlimited skilltrees ${features[this.state.featureId].amount}</Link>}
                        </div>
                        <hr></hr>
                        <div className="columns is-multiline">
                        {this.state.skilltrees.map((skilltree) =>(
                            <SkilltreeCard key={skilltree.id} 
                            skilltree={skilltree} editSkilltree={this.editSkilltree} 
                            deleteSkilltree={this.deleteSkilltree}/>
                        ))}
                        </div>
                        </div>
                    </div>
                </div>
                {this.state.showEditor && <SkilltreeForm 
                isEditing={this.state.isEditing} 
                skilltree={this.state.currentSkilltree} 
                updateSkilltree={this.updateSkilltree}
                closeModal={this.closeModal}
                order={this.state.skilltrees.length}/>}
                </React.Fragment>
                
        )
    }
}

export default CompositionSkilltrees
