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

class Home extends Component {
  
  state = {
      compositions: []
  }

  componentDidMount() {
      db.collection("compositions")
        .where('user', '==', this.props.user.uid)
        .get()
        .then(querySnapshot => {
          const data = querySnapshot.docs.map(doc => doc.data());
          this.setState({ compositions: data });
        });
  } 

  addComposition = (title, theme, data) => {
    const newComposition = {
      id: uuid.v4(), 
      title, 
      theme, 
      user: this.props.user.uid,
      username: this.props.user.email,
      hasBackgroundImage: false
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
          .then(_ => this.setState({compositions: [...this.state.compositions, newComposition]}))
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

  delComposition = (composition) => {
    const id = composition.id;
    const toastId = uuid.v4();
    let currentComponent = this;
    toast.info('Deleting skill tree page and all related data is in progress... please wait', {
      toastId: toastId
    });
    const path = `compositions/${composition.id}`;
    const deleteFirestorePathRecursively = functions.httpsCallable('deleteFirestorePathRecursively');
    deleteFirestorePathRecursively({
        collection: 'Skilltree page',
        path: path
    }).then(function(result) {
            if(result.data.error){
                toast.update(toastId, {
                  render: result.data.error,
                  
                });
            } else {
              toast.update(toastId, {
                render: 'Skill tree page deleted successfully'
              });
              currentComponent.setState({
                compositions: [...currentComponent.state.compositions.filter((composition) => composition.id !== id)]
              })
            }
          }).catch(function(error) {
            toast.update(toastId, {
              render: error.message,
              type: toast.TYPE.ERROR
            });
          });
  }

  render() {
    const header = "Skill tree pages"

    return (
      <section className="section">
      <div className="container">
        <div className="level">
          <div className="level-left">
          <Header header={header} />
          </div>
          <div className="level-right">
          <AddComposition addComposition={this.addComposition} />  
          </div>
        </div>
        <Compositions compositions={this.state.compositions} delComposition={this.delComposition} />
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