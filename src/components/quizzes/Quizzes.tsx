import React, { Component } from 'react'
import QuizItem from './QuizItem';
import AddQuiz from './AddQuiz';
import Header from '../layout/Header';
import { db } from '../../firebase/firebase';
import IQuiz from '../../models/quiz.model';
import IUser from '../../models/user.model';
import {v4 as uuid} from "uuid"; 
import { connect } from "react-redux";
import { toast } from 'react-toastify';
import firebase from 'firebase/app';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { Redirect } from 'react-router-dom';


interface IQuizzesProps {
  isAuthenticated: boolean;
  user: any
}

interface IQuizzesState {
  quizzes: IQuiz[];
  sharedQuizzes: IQuiz[];
  isEditingTitle: boolean;
  currentQuiz?: IQuiz;
  unsubscribeOwned?: any;
  unsubscribeShared?: any;
  isAddingOrEditing: boolean;
  isActive: boolean;
  toBuilder: boolean;
  quizId: string;
  activeTab: string;
}


class Quizzes extends Component<IQuizzesProps, IQuizzesState> {
    constructor(props: IQuizzesProps){
        super(props)
        this.state = {
          quizzes: [],
          sharedQuizzes: [],
          isEditingTitle: false,
          isAddingOrEditing: false,
          isActive: false,
          toBuilder: false,
          quizId: '',
          activeTab: 'owned',
        }
      }

    componentDidMount() {
      const unsubscribeOwned = db.collection("quizzes")
        .where('user', '==', this.props.user.uid)
        .orderBy('lastUpdate', "desc")
        .onSnapshot(querySnapshot => {
          const ownQuizzes = querySnapshot.docs.map(doc => doc.data() as IQuiz);
          this.setState({ 
            quizzes: ownQuizzes,
            unsubscribeOwned: unsubscribeOwned 
          });
        });

      const unsubscribeShared = db.collection("quizzes")
        .where('sharedUsers', 'array-contains', this.props.user.uid)
        .orderBy('lastUpdate', "desc")
        .onSnapshot(querySnapshot => {
          const sharedQuizzes = querySnapshot.docs.map(doc => doc.data() as IQuiz);
          this.setState({ 
            sharedQuizzes: sharedQuizzes,
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

    changeActiveTab = (tab: string) => {
      this.setState({
          activeTab: tab
      });
    }

    addQuiz = async (title, data) => {
        this.setState({
          isAddingOrEditing: false
        });
        const quizId = uuid();
        let standardFeedback = '{ "pages": [  {   "name": "page1",   "elements": [    {     "type": "boolean",     "name": "question1",     "title": "Completed"    },    {     "type": "comment",     "name": "question2",     "title": "Comment"    }   ],   "title": "Feedback"  } ], "showQuestionNumbers": "off"}';
        const userSnap = await db.collection("users").doc(this.props.user.uid).get();
        if(userSnap.exists){
          const userData = userSnap.data() as IUser;
          if(userData.standardFeedback){
            standardFeedback = userData.standardFeedback;
          }
        }
        const newQuiz : IQuiz = {
          id: quizId, 
          title, 
          user: this.props.user.uid,
          username: this.props.user.email,
          created: firebase.firestore.Timestamp.now(),
          lastUpdate: firebase.firestore.Timestamp.now(),
          feedback: standardFeedback
        };
        db.collection('quizzes').doc(newQuiz.id).set(newQuiz)
        .then(_ => {
            toast('Successfully added quiz ' + title);
            this.setState({
              toBuilder: true,
              quizId
            })
        })
        .catch(error => {
            toast(error.message);
        })
      }

    updateQuizTitle = (updatedTitle: string) => {
        db.collection('quizzes').doc(this.state.currentQuiz?.id).update({
          title: updatedTitle,
          lastUpdate: firebase.firestore.Timestamp.now()
        }).then( _ => {
          this.setState({
            isEditingTitle: false,
            currentQuiz: undefined,
            isAddingOrEditing: false,
            isActive: false
          })
        })
      }

    delQuiz = (quiz) => {
        db.collection("quizzes").doc(quiz.id).delete()
        .then(_ => {
            toast('Deleted quiz ' + quiz.title);
            this.toggleIsActive();
        })
        .catch(err => {
            toast(err.message);
            this.toggleIsActive();
        })
      }

    toggleIsActive = (quiz?: IQuiz) =>{
          this.setState({
              currentQuiz: quiz? quiz : undefined,
              isActive: !this.state.isActive
          });
      }

    toggleIsAddingOrEditing = (quiz?: IQuiz) =>{
          this.setState({
              isAddingOrEditing: !this.state.isAddingOrEditing,
              isEditingTitle: quiz? true : false,
              currentQuiz: quiz? quiz : undefined
          });
      }

    render() {
        const header = "Quizzes"
          return (
            this.state.toBuilder ?
            <Redirect to={'/quizzes/' + this.state.quizId + '/builder/quiz'} /> :
            <section className="section has-background-white-ter" style={{minHeight: "100vh"}}>
            <div className="container">
              <div className="level is-mobile">
                <div className="level-left">
                <Header header={header} />
                
                </div>
                <div className="level-right">
                  <button className="is-primary is-medium is-rounded is-outlined button" 
                  data-tooltip="Add Quiz" onClick={() => this.toggleIsAddingOrEditing()}>
                    <span className="icon">
                      <FontAwesomeIcon icon='plus' />
                    </span>
                  </button>
                </div>
              </div>
              <div className="tabs">
              <ul>
                  <li className={this.state.activeTab ==='owned' ? "is-active" : undefined}>
                      <a href="# " onClick={() => this.changeActiveTab('owned')}>Your Quizzes</a>
                  </li>
                  <li className={this.state.activeTab ==='shared' ? "is-active" : undefined}>
                      <a href="# " onClick={() => this.changeActiveTab('shared')}>Shared Quizzes</a>
                  </li>
              </ul>
              </div>

              {((this.state.quizzes.length === 0 && this.state.activeTab==='owned') || 
              (this.state.sharedQuizzes.length === 0 && this.state.activeTab === 'shared')) && 
                <article className="message is-primary">
                <div className="message-header">No Quizzes yet.. </div>
                <div className="message-body">
                    <div className="content">
                        <p>You can add a new Quiz clicking on the button top right.</p>
                    </div>
                </div>
                </article>
              }
            {this.state.activeTab === 'owned' && 
                 this.state.quizzes?.map((quiz) => (
                    <QuizItem key={quiz.id} quiz={quiz} 
                    editQuizTitle={this.toggleIsAddingOrEditing}
                    deleteQuiz={this.toggleIsActive}
                     />
                ))}
            {this.state.activeTab === 'shared' && 
                 this.state.sharedQuizzes?.map((quiz) => (
                    <QuizItem key={quiz.id} quiz={quiz} 
                    editQuizTitle={() => {}}
                    deleteQuiz={() => {}}
                     />
                ))}
            </div>
            <div className={`modal ${this.state.isActive ? "is-active" : ""}`}>
                <div className="modal-background"></div>
                <div className="modal-card">
                <header className="modal-card-head">
                    <p className="modal-card-title">Are you sure?</p>
                    <button className="delete" aria-label="close" onClick={() => this.toggleIsActive()}></button>
                </header>
                <section className="modal-card-body">
                    You are about to delete quiz '{this.state.currentQuiz?.title}'. Do you want to delete?
                </section>
                <footer className="modal-card-foot">
                    <button className="button is-danger" 
                    onClick={() => this.delQuiz(this.state.currentQuiz)}>
                        Delete</button>
                    <button className="button" onClick={() => this.toggleIsActive()}>Cancel</button>
                </footer>
                </div>
            </div>
            <div className={`modal ${this.state.isAddingOrEditing ? "is-active" : ""}`}>
              <div className="modal-background"></div>
              <div className="modal-card">
                <header className="modal-card-head">
                  <p className="modal-card-title">{this.state.isEditingTitle ? 'Edit quiz title' : 'Add quiz'}</p>
                  <button className="delete" aria-label="close" onClick={() => this.toggleIsAddingOrEditing()}></button>
                </header>
                
                  <AddQuiz addQuiz={this.addQuiz} isEditingTitle={this.state.isEditingTitle}
                   quiz={this.state.currentQuiz} updateQuizTitle={this.updateQuizTitle}
                   isHidden={this.state.isAddingOrEditing}/>
                
              </div>
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

export default connect(mapStateToProps)(Quizzes);
