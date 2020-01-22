import React, { Component } from "react";
import Compositions from './compositions/Compositions';
import AddComposition from './compositions/AddComposition';
import Header from './layout/Header';
import { db } from '../firebase/firebase';
import uuid from 'uuid';
import { connect } from "react-redux";
import { toast } from 'react-toastify';
import { standardChildSkills, standardRootSkill } from "./compositions/StandardData";
import IComposition from '../models/composition.model';
import firebase from 'firebase/app';

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
}

class Home extends Component<IHomeProps, IHomeState> {
  
  constructor(props: IHomeProps){
    super(props)
    this.state = {
      activeTab: 'owned',
      compositions: [],
      sharedCompositions: [],
      isEditingTitle: false
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
    const newComposition : IComposition = {
      id: uuid.v4(), 
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
        id: uuid.v4(),
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
          id: uuid.v4(),
          ...standardRootSkill
        };
        db.collection('compositions').doc(newComposition.id)
        .collection('skilltrees').doc(newSkilltree.id)
        .collection('skills').doc(newRootSkill.id).set(newRootSkill)
        .then( _ => {
          const batch = db.batch();
          standardChildSkills.forEach((child) => {
            const dbRef = db.collection('compositions').doc(newComposition.id)
            .collection('skilltrees').doc(newSkilltree.id)
            .collection('skills').doc(newRootSkill.id).collection('skills').doc(child.id);
            batch.set(dbRef, {
              skilltree: newSkilltree.id, 
              composition: newComposition.id, 
              id: uuid.v4(),
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

  editCompositionTitle = (composition: IComposition) => {
    this.setState({
      isEditingTitle: true,
      currentComposition: composition
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
      })
    })
  }

  changeActiveTab = (tab: string) => {
    this.setState({
        activeTab: tab
    });
  }

  render() {
    const header = "Skilltrees"
    return (
      <section className="section">
      <div className="container">
        <div className="level">
          <div className="level-left">
          <Header header={header} />
          </div>
          <div className="level-right">
          <AddComposition addComposition={this.addComposition} isEditingTitle={this.state.isEditingTitle}
             composition={this.state.currentComposition} updateCompositionTitle={this.updateCompositionTitle}/>  
          </div>
        </div>
        <div className="tabs">
        <ul>
            <li className={this.state.activeTab ==='owned' ? "is-active" : undefined}>
                <a href="# " onClick={() => this.changeActiveTab('owned')}>Your skilltrees</a>
            </li>
            <li className={this.state.activeTab ==='shared' ? "is-active" : undefined}>
                <a href="# " onClick={() => this.changeActiveTab('shared')}>Shared skilltrees</a>
            </li>
        </ul>
        </div>
        {this.state.compositions && 
          <Compositions compositions={this.state.activeTab === 'owned' ? this.state.compositions : this.state.sharedCompositions} 
            editCompositionTitle={this.editCompositionTitle} />
        }
      </div>
      </section>    
    );
  }
}

function mapStateToProps(state) {
  return {
    isAuthenticated: state.auth.isAuthenticated,
    user: state.auth.user
  };
}

export default connect(mapStateToProps)(Home);