import React, { Component } from "react";
import Compositions from './compositions/Compositions';
import AddComposition from './compositions/AddComposition';
import Header from './layout/Header';
import { db, functions } from '../firebase/firebase';
import {v4 as uuid} from "uuid"; 
import { connect } from "react-redux";
import { toast } from 'react-toastify';
import { standardChildSkills, standardRootSkill } from "./compositions/StandardData";
import IComposition from '../models/composition.model';
import firebase from 'firebase/app';
import { Redirect } from "react-router-dom";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

interface IHomeProps {
  isAuthenticated: boolean;
  user: any
}

interface IHomeState {
  compositions: IComposition[];
  sharedCompositions: IComposition[];
  isEditingTitle: boolean;
  currentComposition?: IComposition;
  unsubscribeOwned?: any;
  unsubscribeShared?: any;
  activeTab: string;
  isActive: boolean;
  isAddingOrEditing: boolean;
  mustEditProfile: boolean;
}

class Home extends Component<IHomeProps, IHomeState> {
  
  constructor(props: IHomeProps){
    super(props)
    const mustEditProfile = props.user.email.endsWith('@skilltree.student') ? true : false;
    if(mustEditProfile){
      toast.error('You have logged in with an automatically created Skill Tree email account. Please update your account with a real email address.')
    }
    this.state = {
      activeTab: 'owned',
      compositions: [],
      sharedCompositions: [],
      isEditingTitle: false,
      isActive: false,
      isAddingOrEditing: false,
      mustEditProfile: mustEditProfile
    }
  }
  
  componentDidMount() {
      const unsubscribeOwned = db.collection("compositions")
        .where('user', '==', this.props.user.uid)
        .orderBy('lastUpdate', "desc")
        .onSnapshot(querySnapshot => {
          const ownCompositions = querySnapshot.docs.map(doc => doc.data() as IComposition);
          this.setState({ 
            compositions: ownCompositions,
            unsubscribeOwned: unsubscribeOwned 
          });
        });
      
        const unsubscribeShared = db.collection("compositions")
        .where('sharedUsers', 'array-contains', this.props.user.uid)
        .orderBy('lastUpdate', "desc")
        .onSnapshot(querySnapshot => {
          const sharedCompositions = querySnapshot.docs.map(doc => doc.data() as IComposition);
          this.setState({ 
            sharedCompositions: sharedCompositions,
            unsubscribeShared: unsubscribeShared 
          });
        });

  } 

  componentWillUnmount() {
    if(this.state.unsubscribeOwned){
      this.state.unsubscribeOwned();
    }
    if(this.state.unsubscribeShared){
      this.state.unsubscribeShared();
    }
  }

  addComposition = (title, theme, data) => {
    this.setState({
      isAddingOrEditing: false
    });
    const newComposition : IComposition = {
      id: uuid(), 
      title, 
      theme, 
      user: this.props.user.uid,
      username: this.props.user.email,
      hasBackgroundImage: false,
      skillcount: 3,
      lastUpdate: firebase.firestore.Timestamp.now()
    };
    db.collection('compositions').doc(newComposition.id).set(newComposition)
    .then(_ => {
      const newSkilltree = {
        id: uuid(),
        title,
        description: 'More information about my skill tree',
        collapsible: true,
        order: 0
      }
      db.collection('compositions')
      .doc(newComposition.id)
      .collection('skilltrees')
      .doc(newSkilltree.id)
      .set({composition: newComposition.id, ...newSkilltree})
      .then( _ => {
        const newRootSkill = {
          skilltree: newSkilltree.id, 
          composition: newComposition.id, 
          id: uuid(),
          ...standardRootSkill
        };
        db.collection('compositions').doc(newComposition.id)
        .collection('skilltrees').doc(newSkilltree.id)
        .collection('skills').doc(newRootSkill.id).set(newRootSkill)
        .then( _ => {
          const batch = db.batch();
          standardChildSkills.forEach((child) => {
            const newChildId = uuid();
            const dbRef = db.collection('compositions').doc(newComposition.id)
            .collection('skilltrees').doc(newSkilltree.id)
            .collection('skills').doc(newRootSkill.id).collection('skills').doc(newChildId);
            batch.set(dbRef, {
              skilltree: newSkilltree.id, 
              composition: newComposition.id, 
              id: newChildId,
              ...child
            });
          })
          batch.commit()
          .catch(error => {
            toast.error(error.message);
          });
        })
        .catch(error => {
          toast.error(error.message);
        })
      })
      .catch(error => {
        toast.error(error.message);
      })
    })
    .catch(error => {
        toast(error.message);
    })
  }

  updateCompositionTitle = (updatedTitle: string) => {
    db.collection('compositions').doc(this.state.currentComposition?.id).update({
      title: updatedTitle,
      lastUpdate: firebase.firestore.Timestamp.now()
    }).then( _ => {
      this.setState({
        isEditingTitle: false,
        currentComposition: undefined,
        isAddingOrEditing: false
      })
    })
  }

  delComposition = (composition) => {
    this.toggleIsActive();
    const toastId = uuid();
    toast.info('Deleting skilltree and all related data is in progress... please wait', {
      toastId: toastId,
      autoClose: 10000
    });
    const path = `compositions/${composition.id}`;
    const deleteFirestorePathRecursively = functions.httpsCallable('deleteFirestorePathRecursively');
    deleteFirestorePathRecursively({
        collection: 'Skilltree',
        path: path
    })
    .then(function(result) {
      if(result.data.error){
          toast.update(toastId, {
            render: result.data.error,
            type: toast.TYPE.ERROR,
            autoClose: 5000
          });
      } else {
        toast.update(toastId, {
          render: 'Skill tree deleted successfully',
          autoClose: 3000
        });
      }
    })
    .catch(function(error) {
      toast.update(toastId, {
        render: error.message,
        type: toast.TYPE.ERROR,
        autoClose: 5000
      });
    });
  }

  removeSharedSkilltree = (composition) => {
    db.collection('compositions').doc(composition.id).update({
      sharedUsers: firebase.firestore.FieldValue.arrayRemove(this.props.user.uid)
    })
    .then( _ => {
      toast.info('Skill tree removed');
      this.toggleIsActive();
    })
    .catch(e => {
      toast.error('Something went wrong... ' + e.message);
      this.toggleIsActive();
    })
  }

  changeActiveTab = (tab: string) => {
    this.setState({
        activeTab: tab
    });
  }

  toggleIsActive = (composition?: IComposition) =>{
      this.setState({
          currentComposition: composition? composition : undefined,
          isActive: !this.state.isActive
      });
  }

  toggleIsAddingOrEditing = (composition?: IComposition) =>{
      this.setState({
          isAddingOrEditing: !this.state.isAddingOrEditing,
          isEditingTitle: composition? true : false,
          currentComposition: composition? composition : undefined
      });
  }

  render() {
    const header = "SkillTrees"
    if(this.state.mustEditProfile){
      return (
        <Redirect to="/profile/edit" />
      )
    } else {
      return (
        <section className="section">
        <div className="container">
          <div className="level">
            <div className="level-left">
            <Header header={header} />
            </div>
            <div className="level-right">
              <button className="is-primary is-medium is-rounded button" 
              data-tooltip="Add Skilltree" onClick={() => this.toggleIsAddingOrEditing()}>
                <span className="icon">
                  <FontAwesomeIcon icon='plus' />
                </span>
              </button>
            </div>
          </div>
          <div className="tabs">
          <ul>
              <li className={this.state.activeTab ==='owned' ? "is-active" : undefined}>
                  <a href="# " onClick={() => this.changeActiveTab('owned')}>Your SkillTrees</a>
              </li>
              <li className={this.state.activeTab ==='shared' ? "is-active" : undefined}>
                  <a href="# " onClick={() => this.changeActiveTab('shared')}>Shared SkillTrees</a>
              </li>
          </ul>
          </div>
          {this.state.compositions && 
            <Compositions 
              compositions={this.state.activeTab === 'owned' ? this.state.compositions : this.state.sharedCompositions} 
              editCompositionTitle={this.toggleIsAddingOrEditing}
              deleteComposition={this.toggleIsActive} />
          }
        </div>
        <div className={`modal ${this.state.isActive ? "is-active" : ""}`}>
            <div className="modal-background"></div>
            <div className="modal-card">
            <header className="modal-card-head">
                <p className="modal-card-title">Are you sure?</p>
                <button className="delete" aria-label="close" onClick={() => this.toggleIsActive()}></button>
            </header>
            <section className="modal-card-body">
                You are about to delete skill tree page '{this.state.currentComposition?.title}'. Do you want to delete?
            </section>
            <footer className="modal-card-foot">
                <button className="button is-danger" 
                onClick={this.props.user.uid === this.state.currentComposition?.user ? 
                          () => this.delComposition(this.state.currentComposition) : 
                          () => this.removeSharedSkilltree(this.state.currentComposition)}>
                    Delete</button>
                <button className="button" onClick={() => this.toggleIsActive()}>Cancel</button>
            </footer>
            </div>
        </div>
        <div className={`modal ${this.state.isAddingOrEditing ? "is-active" : ""}`}>
          <div className="modal-background"></div>
          <div className="modal-card">
            <header className="modal-card-head">
              <p className="modal-card-title">{this.state.isEditingTitle ? 'Edit skilltree title' : 'Add skilltree'}</p>
              <button className="delete" aria-label="close" onClick={() => this.toggleIsAddingOrEditing()}></button>
            </header>
            
              <AddComposition addComposition={this.addComposition} isEditingTitle={this.state.isEditingTitle}
               composition={this.state.currentComposition} updateCompositionTitle={this.updateCompositionTitle}
               isHidden={this.state.isAddingOrEditing}/>
            
          </div>
        </div>
        
        </section>    
      );
    }
  }
}

function mapStateToProps(state) {
  return {
    isAuthenticated: state.auth.isAuthenticated,
    user: state.auth.user
  };
}

export default connect(mapStateToProps)(Home);