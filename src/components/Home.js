import React, { Component } from "react";
import Compositions from './compositions/Compositions';
import AddComposition from './compositions/AddComposition';
import Header from './layout/Header';
import { db } from '../firebase/firebase';
import uuid from 'uuid';
import { connect } from "react-redux";

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
        data,
        description: 'More information about my skill tree',
        collapsible: true 
      }
      db.collection('compositions')
      .doc(newComposition.id)
      .collection('skilltrees')
      .doc(newSkilltree.id)
      .set(newSkilltree)
      .then( _ => {
        this.setState({compositions: [...this.state.compositions, newComposition]});
      })
    })
    .catch(err => {
        console.log(err)
    })
  }

  delComposition = (id) => {
    const batch = db.batch();
    db.collection('compositions').doc(id).collection('skilltrees').get()
    .then(querySnapshot => {
      querySnapshot.docs.forEach(doc => {
        const skilltreeRef = db.collection('compositions').doc(id).collection('skilltrees').doc(doc.id);
        batch.delete(skilltreeRef);
      });
      batch.commit()
      .then(_ => {
        db.collection('compositions').doc(id).delete()
        .then((res) =>
          this.setState({
            compositions: [...this.state.compositions.filter((composition) => composition.id !== id)]
          })
        )
        .catch(e => {
          console.log(e)
        });
      })
      .catch(err => {
        console.log(err)
      })
    })
  }

  render() {
    const header = "Skill trees"

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