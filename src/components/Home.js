import React, { Component } from "react";
import Compositions from './compositions/Compositions';
import AddComposition from './compositions/AddComposition';
import Header from './layout/Header';
import { db } from '../firebase/firebase';
import uuid from 'uuid';
import { connect } from "react-redux";
import {toast} from 'react-toastify';

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
        collapsible: true,
        order: 0
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
        toast(err.message);
    })
  }

  delComposition = async (id) => {
    const batch = db.batch();
    const paymentSnapshot = await db.collection('compositions').doc(id).collection('payments').get();
    if(!paymentSnapshot.empty){
      paymentSnapshot.docs.forEach(doc => {
        const paymentRef = db.collection('compositions').doc(id).collection('payments').doc(doc.id);
        batch.delete(paymentRef);
      })
    }
    const skilltreeSnapshot = await db.collection('compositions').doc(id).collection('skilltrees').get()
    if(!skilltreeSnapshot.empty){
      skilltreeSnapshot.docs.forEach(doc => {
        const skilltreeRef = db.collection('compositions').doc(id).collection('skilltrees').doc(doc.id);
        batch.delete(skilltreeRef);
      });
    }
    const compositionRef = db.collection('compositions').doc(id);
    batch.delete(compositionRef);
    batch.commit()
    .then(_ => {
        toast.info('Skill tree deleted successfully');
        this.setState({
          compositions: [...this.state.compositions.filter((composition) => composition.id !== id)]
        })
    })
    .catch(err => {
      toast.error(err.message)
    })
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