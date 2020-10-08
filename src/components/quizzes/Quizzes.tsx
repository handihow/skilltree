import React, { Component } from 'react'
import QuizItem from './QuizItem';
import AddQuiz from './AddQuiz';
import Header from '../layout/Header';
import { db } from '../../firebase/firebase';
import IQuiz from '../../models/quiz.model';
import {v4 as uuid} from "uuid"; 
import { connect } from "react-redux";
import { toast } from 'react-toastify';
import firebase from 'firebase/app';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

interface IQuizzesProps {
  isAuthenticated: boolean;
  user: any
}

interface IQuizzesState {
  quizzes: IQuiz[];
  isEditingTitle: boolean;
  currentQuiz?: IQuiz;
  unsubscribeOwned?: any;
  isAddingOrEditing: boolean;
  isActive: boolean;
}


class Quizzes extends Component<IQuizzesProps, IQuizzesState> {
    constructor(props: IQuizzesProps){
        super(props)
        this.state = {
          quizzes: [],
          isEditingTitle: false,
          isAddingOrEditing: false,
          isActive: false
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
    } 

    componentWillUnmount() {
        if(this.state.unsubscribeOwned){
          this.state.unsubscribeOwned();
        }
    }

    addQuiz = (title, data) => {
        this.setState({
          isAddingOrEditing: false
        });
        const newQuiz : IQuiz = {
          id: uuid(), 
          title, 
          user: this.props.user.uid,
          username: this.props.user.email,
          created: firebase.firestore.Timestamp.now(),
          lastUpdate: firebase.firestore.Timestamp.now(),
          feedback: `
          {
           "pages": [
            {
             "name": "page1",
             "title": "Feedback",
             "elements": [
              {
               "type": "comment",
               "name": "question1",
               "title": "Comment"
              }
             ]
            }
           ],
           "showQuestionNumbers": "off"
          }
          `
        };
        db.collection('quizzes').doc(newQuiz.id).set(newQuiz)
        .then(_ => {
            toast('Successfully added quiz ' + title);
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
            <section className="section has-background-white-ter" style={{minHeight: "100vh"}}>
            <div className="container">
              <div className="level is-mobile">
                <div className="level-left">
                <Header header={header} icon='poll-h'/>
                
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

            {this.state.quizzes.length === 0 ? 
                <article className="message is-primary">
                <div className="message-header">No Quizzes yet.. </div>
                <div className="message-body">
                    <div className="content">
                        <p>You can add a new Quiz clicking on the button top right.</p>
                    </div>
                </div>
                </article>
                : this.state.quizzes?.map((quiz) => (
                    <QuizItem key={quiz.id} quiz={quiz} 
                    editQuizTitle={this.toggleIsAddingOrEditing}
                    deleteQuiz={this.toggleIsActive}
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
