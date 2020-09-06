import React, { Component } from 'react'
import { Redirect, Link } from 'react-router-dom';
import { db, functions } from '../../firebase/firebase';
import { RouteComponentProps } from 'react-router-dom';
import {v4 as uuid} from "uuid"; 
import firebase from 'firebase/app';

import SkilltreeForm from '../layout/SkilltreeForm';
import CompositionMenu from '../layout/CompositionMenu';
import SkilltreeCard from '../layout/SkilltreeCard';
import {toast} from 'react-toastify';
import features from '../payments/Features';
import ISkilltree from '../../models/skilltree.model';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import Header from '../layout/Header';


interface ICompositionSkilltreesState{
    hasUnlockedUnlimitedSkilltrees: boolean;
    toEditor: boolean;
    showEditor: boolean;
    isEditing: boolean;
    skilltrees: ISkilltree[];
    featureId: string;
    currentSkilltree?: ISkilltree;
    unsubscribeSkilltrees?: any;
    unsubscribePaymentFeature?: any;
}

type TParams =  { compositionId: string };

export class CompositionSkilltrees extends Component<RouteComponentProps<TParams>, ICompositionSkilltreesState> {
    constructor(props: RouteComponentProps<TParams>){
        super(props);
        this.state = {
            hasUnlockedUnlimitedSkilltrees: true,
            toEditor: false,
            showEditor: false,
            isEditing: false,
            skilltrees: [],
            featureId: 'unlimited-skilltrees'
        };
    }

    componentDidMount() {
        const currentComponent = this;
        const compositionId = this.props.match.params.compositionId;
        const unsubscribeSkilltrees = db.collection("compositions").doc(compositionId)
        .collection("skilltrees")
        .orderBy('order')
        .onSnapshot(querySnapshot => {
            const data = querySnapshot.docs.map(doc => doc.data() as ISkilltree);
            currentComponent.setState({
                skilltrees: data,
                unsubscribeSkilltrees: unsubscribeSkilltrees
            });
        }, (error) => {
            toast.error('Could not load skilltrees. Error ' + error.message);
        })
        const unsubscribePaymentFeature = db.collection('compositions')
            .doc(compositionId)
            .collection('payments')
            .doc(currentComponent.state.featureId)
            .onSnapshot(function(doc) {
                if(doc.exists){
                    const paymentRecord = doc.data();
                    if(paymentRecord && paymentRecord.success){
                        currentComponent.setState({
                            hasUnlockedUnlimitedSkilltrees: true
                        })
                    }
                }
            });
        currentComponent.setState({
            unsubscribePaymentFeature: unsubscribePaymentFeature
        });
    }

    componentWillUnmount(){
        this.state.unsubscribeSkilltrees();
        this.state.unsubscribePaymentFeature();
    }

    addSkilltree = () => {
        //maximum number of skill trees is 2 unless the unlimited feature is paid
        if(this.state.skilltrees.length === 2 && !this.state.hasUnlockedUnlimitedSkilltrees){
            return toast.error('You cannot have more than 2 skilltrees. You can pay $1,- to unlock unlimited skilltrees feature.');
        }
        this.setState({
            showEditor: true,
            isEditing: false
        });
        this.updateCompositionTimestamp()
    }

    editSkilltree = (skilltree) => {
        this.setState({
            showEditor: true,
            currentSkilltree: skilltree,
            isEditing: true
        })
    }

    updateSkilltree = (skilltree: ISkilltree) => {
        if(!this.state.isEditing){
            skilltree.composition = this.props.match.params.compositionId;
        }
        db.collection('compositions')
        .doc(this.props.match.params.compositionId)
        .collection('skilltrees')
        .doc(skilltree.id).set(skilltree, {merge: true})
        .then(_=> {
            toast.info("Skilltree successfully updated");
            this.setState({
                showEditor: false
            });
            this.updateCompositionTimestamp()
        })
        .catch(error => {
            toast.error('Something went wrong...' + error.message);
        })
    }  

    deleteSkilltree = (skilltree) => {
        const currentComponent = this;
        const toastId = uuid();
        toast.info('Deleting skilltree all related child skills is in progress... please wait', {
          toastId: toastId
        })
        const skilltreePath = `compositions/${this.props.match.params.compositionId}/skilltrees/${skilltree.id}`;
        const deleteFirestorePathRecursively = functions.httpsCallable('deleteFirestorePathRecursively');
        deleteFirestorePathRecursively({
            collection: 'Skilltree',
            path: skilltreePath
        }).then(function(result) {
                currentComponent.updateCompositionTimestamp()
                if(result.data.error){
                    toast.update(toastId, {
                      render: result.data.error,
                    });
                } else {
                  toast.update(toastId, {
                    render: 'Skilltree and related child skills deleted successfully'
                  });
                }
              }).catch(function(error) {
                toast.update(toastId, {
                  render: error.message,
                  type: toast.TYPE.ERROR
                });
              });
    }

    updateCompositionTimestamp = () => {
        db.collection('compositions').doc(this.props.match.params.compositionId).update({
            lastUpdate: firebase.firestore.Timestamp.now()
        })
    }

    closeModal = () => {
        this.setState({
            showEditor : false,
        })
    }
    
    render() {
        return (
            this.state.toEditor ?
                <Redirect to={`/compositions/${this.props.match.params.compositionId}`} /> :
                <React.Fragment>
                <div className="columns is-mobile" >
                    <div className="column is-2">
                        <CompositionMenu id={this.props.match.params.compositionId} />
                    </div>
                    <div className="column" style={{ marginTop: "30px", marginRight: "10px", height:"calc(100vh - 3.5rem)", overflow: 'auto' }}>
                        <div className="level is-mobile">
                            <div className="level-left">
                                <Header header='Skilltrees' icon="sitemap"></Header>
                            </div>
                            <div className="level-right">
                                <div className="level-item">                                
                                    <button className="is-primary is-medium is-rounded is-outlined button has-tooltip-bottom" 
                                      data-tooltip="Add Skilltree" onClick={this.addSkilltree}>
                                        <span className="icon">
                                          <FontAwesomeIcon icon='plus' />
                                        </span>
                                    </button>
                                </div>
                                <div className="level-item">
                                    {!this.state.hasUnlockedUnlimitedSkilltrees && 
                                            <Link to={`/compositions/${this.props.match.params.compositionId}/unlock/${this.state.featureId}`} 
                                    className="button">Unlimited skilltrees ${features[this.state.featureId].amount}</Link>}
                                </div>
                            </div>
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
