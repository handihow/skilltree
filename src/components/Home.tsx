import React, { Component } from "react";
import Compositions from './compositions/Compositions';
import AddComposition from './compositions/AddComposition';
import Header from './layout/Header';
import { db } from '../firebase/firebase';
import uuid from 'uuid';
import { connect } from "react-redux";
import { toast } from 'react-toastify';
import { standardChildSkills, standardRootSkill } from "./compositions/StandardData";
import { functions } from '../firebase/firebase';
import IComposition from '../models/composition.model';

interface IHomeProps {
  isAuthenticated: boolean;
  user: any
}

interface IHomeState {
  compositions: IComposition[];
  isEditingTitle: boolean;
  currentComposition?: IComposition;
  unsubscribe?: any;
}

class Home extends Component<IHomeProps, IHomeState> {
  
  constructor(props: IHomeProps){
    super(props)
    this.state = {
      compositions: [],
      isEditingTitle: false
    }
  }
  
  componentDidMount() {
      const unsubscribe = db.collection("compositions")
        .where('user', '==', this.props.user.uid)
        .onSnapshot(querySnapshot => {
          const data = querySnapshot.docs.map(doc => doc.data() as IComposition);
          this.setState({ compositions: data });
        });
      this.setState({
        unsubscribe: unsubscribe
      })
  } 

  componentWillUnmount() {
    this.state.unsubscribe();
  }

  addComposition = (title, theme, data) => {
    const newComposition : IComposition = {
      id: uuid.v4(), 
      title, 
      theme, 
      user: this.props.user.uid,
      username: this.props.user.email,
      hasBackgroundImage: false,
      skillcount: 3
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
      title: updatedTitle
    }).then( _ => {
      this.setState({
        isEditingTitle: false,
        currentComposition: undefined,
      })
    })
  }

  copyComposition = (composition) => {
    const toastId = uuid.v4();
    toast.info('Copying skilltree and all related data is in progress... please wait', {
      toastId: toastId
    });
    const copyComposition = functions.httpsCallable('copyComposition');
    copyComposition({
      composition: composition
    })
    .then(function(result) {
      if(result.data.error){
          toast.update(toastId, {
            render: result.data.error
          });
      } else {
        toast.update(toastId, {
          render: 'Skill tree copied successfully'
        });
      }
    })
    .catch(function(error) {
      toast.update(toastId, {
        render: error.message,
        type: toast.TYPE.ERROR
      });
    });
  }

  delComposition = (composition) => {
    const toastId = uuid.v4();
    toast.info('Deleting skilltree and all related data is in progress... please wait', {
      toastId: toastId
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
            render: result.data.error
          });
      } else {
        toast.update(toastId, {
          render: 'Skill tree deleted successfully'
        });
      }
    })
    .catch(function(error) {
      toast.update(toastId, {
        render: error.message,
        type: toast.TYPE.ERROR
      });
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
        {this.state.compositions && 
          <Compositions compositions={this.state.compositions} delComposition={this.delComposition}
            editCompositionTitle={this.editCompositionTitle} copyComposition={this.copyComposition} />
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