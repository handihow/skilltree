import React, { Component } from 'react'
import IQuiz from '../../../models/quiz.model';
import { toast } from 'react-toastify';
import { Redirect } from 'react-router-dom';
import { db } from '../../../firebase/firebase';
import firebase from 'firebase/app';
import {v4 as uuid} from "uuid"; 
import { connect } from "react-redux";
import IUser from '../../../models/user.model';

interface ILinkQuizProps {
    isShowLinkQuizModal: boolean;
    toggleLinkQuizModal: Function;
    addQuiz: Function;
    isAuthenticated: boolean;
    user: any
}

interface ILinkQuizState {
    quizzes?: IQuiz[];
    unsubscribeOwned?: any;
    doneLoading?: boolean;
    quiz?: IQuiz;
    quizId?: string;
    toBuilder: boolean;
    quizName: string;
}

export class LinkQuiz extends Component<ILinkQuizProps, ILinkQuizState> {
    constructor(props: ILinkQuizProps){
        super(props);
        this.state = {
            doneLoading: false,
            toBuilder: false,
            quizName: ''
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
            unsubscribeOwned: unsubscribeOwned,
            doneLoading: true 
          });
        });
    } 

    componentWillUnmount() {
        if(this.state.unsubscribeOwned){
          this.state.unsubscribeOwned();
        }
    }

    closeModal = () =>{
        this.setState({
            doneLoading: false,
            quiz: undefined
        })
        this.props.toggleLinkQuizModal();
    }
    
    saveQuiz = () => {
        this.props.addQuiz(this.state.quiz)
        this.closeModal()
    }

    addQuiz = async () => {
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
          title: this.state.quizName, 
          user: this.props.user.uid,
          username: this.props.user.email,
          created: firebase.firestore.Timestamp.now(),
          lastUpdate: firebase.firestore.Timestamp.now(),
          feedback: standardFeedback
        };
        db.collection('quizzes').doc(newQuiz.id).set(newQuiz)
        .then(_ => {
            toast('Successfully added quiz ' + this.state.quizName);
            this.props.addQuiz(newQuiz);
            this.setState({
              toBuilder: true,
              quizId
            })
        })
        .catch(error => {
            toast(error.message);
        })
      }

    changeQuizName = (e: React.FormEvent<HTMLInputElement>) => {
        this.setState({
            quizName: e.currentTarget.value
        })
    }

    changeSelectedQuiz = (index, e) => {
        const tags = document.getElementsByClassName('tag');
        for (let i = 0; i < tags.length; ++i) {
            tags[i].className="tag";
        }
        e.currentTarget.className = 'tag is-primary';
        if(this.state.quizzes){
            this.setState({
                quiz: this.state.quizzes[index]
            })
        }
    }

    render() {
        return (
            this.state.toBuilder ?
            <Redirect to={'/quizzes/' + this.state.quizId + '/builder/quiz'} /> :
            <div className={`modal ${this.props.isShowLinkQuizModal ? "is-active" : ""}`}>
                <div className="modal-background"></div>
                <div className="modal-card">
                <header className="modal-card-head">
                    <p className="modal-card-title">Add Quiz or Select Existing</p>
                    <button className="delete" aria-label="close" onClick={this.closeModal}></button>
                </header>
                <section className="modal-card-body">
                    <div className="field has-addons">
                        <div className="control is-expanded">
                        <input className="input" type="text" placeholder="Enter quiz name"
                                name="quizName" onChange={this.changeQuizName} 
                                value={this.state.quizName ? this.state.quizName : ''} />
                        <p className="help">Enter a name to start building quiz</p>
                        </div>
                        <div className="control">
                            <button className="button" onClick={this.addQuiz}>
                                Add
                            </button>
                        </div>
                    </div>
                    <div className="is-divider" data-content="OR"></div>
                    <div className="tags">
                    {this.state.quizzes?.map((quiz, index)=> (
                        <div className="tag" key={quiz.id} style={{"cursor": "pointer"}}
                        onClick={this.changeSelectedQuiz.bind(this, index)}>
                            {quiz.title}
                        </div>
                        ))}
                    </div>
                </section>
                <footer className="modal-card-foot">
                    <button className="button is-success" onClick={this.saveQuiz}
                        disabled={this.state.quiz ? false : true}>Add selected</button>
                    <button className="button" onClick={this.closeModal}>Cancel</button>
                </footer>
                </div>
            </div>
        )
    }
}

function mapStateToProps(state) {
  return {
    isAuthenticated: state.auth.isAuthenticated,
    user: state.auth.user
  };
}

export default connect(mapStateToProps)(LinkQuiz);

