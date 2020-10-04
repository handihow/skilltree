import React, { Component } from 'react'
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {db} from '../../firebase/firebase';
import IQuiz from '../../models/quiz.model';
import { connect } from "react-redux";
import {v4 as uuid} from "uuid"; 
import { toast } from 'react-toastify';
import firebase from 'firebase/app'

interface IQuizItemProps {
    quiz: IQuiz;
    editQuizTitle: Function;
    isAuthenticated: boolean;
    user: any
    deleteQuiz: Function;
}

interface IQuizItemState {
    thumbnail: string;
    progress: number;
}

export class QuizItem extends Component<IQuizItemProps, IQuizItemState> {

    constructor(props: IQuizItemProps){
        super(props);
        this.state = {
            thumbnail: 'https://via.placeholder.com/128x128.png?text=Quiz',
            progress: 0
        };
    }
    
    copyQuiz = async (quiz) => {
        const toastId = uuid();
        toast.info('Copying quiz and all related data is in progress... please wait', {
            toastId: toastId,
            autoClose: 5000
        });
        //first create a new quiz and set it to the batch
        const newQuiz = {
          ...quiz, 
          user: this.props.user.uid,
          username: this.props.user.email, 
          id: uuid(), 
          sharedUsers: [], 
          title: 'Copy of ' + quiz.title,
          lastUpdate: firebase.firestore.Timestamp.now()
        };
        db.collection('quizzes').doc(newQuiz.id).set(newQuiz)
        .then(() => {
            toast.update(toastId, {
                render: `Successfully copied quiz '${quiz.title}'`
              });
        })
        .catch((error: any) => {
            toast.update(toastId, {
                render: toast.error(`Problem copying: ${error.message} `),
                type: toast.TYPE.ERROR
              });
        });
      };
      
    
    render() {
        const { id, title, username } = this.props.quiz;
        return (
            <div className="box">
            <div className="media">
            <div className="media-left">
                <p className="image is-64x64">
                <img className="is-rounded" src={this.state.thumbnail} alt="thumbnail"></img>
                </p>
            </div>
            <div className="media-content">
                <div className="content">
                <p>
                    <Link to={this.props.user.uid === this.props.quiz.user 
                              ? "/quizzes/"+id :
                              "quizzes/"+id+"/viewer"} data-tooltip="To quiz editor" style={{color: "black"}}> 
                    <strong>{title}</strong> 
                    </Link><small style={{marginLeft: "10px"}}>{username}</small>
                </p>
                </div>
                <nav className="level is-mobile">
                <div className="level-left">
                {this.props.user.uid === this.props.quiz.user &&
                    <div className="level-item" data-tooltip="Edit quiz title">
                        <a href="# " onClick={this.props.editQuizTitle.bind(this, this.props.quiz)}>
                            <FontAwesomeIcon icon='pen' /></a>
                    </div>}
                    {(this.props.quiz.canCopy || this.props.user.uid === this.props.quiz.user)  && <div className="level-item" data-tooltip="Copy quiz">
                        <a href="# " onClick={() => this.copyQuiz(this.props.quiz)}>
                            <FontAwesomeIcon icon='copy' /></a>
                    </div>}
                    {this.props.user.uid === this.props.quiz.user &&
                        <Link to={"/quizzes/"+id+"/builder"} className="level-item" data-tooltip="Quiz editor">
                    <span className="icon is-small"><FontAwesomeIcon icon='edit' /></span>
                    </Link>}
                    {this.props.user.uid === this.props.quiz.user &&
                        <Link to={"/quizzes/"+id+"/test"} className="level-item" data-tooltip="Do the quiz">
                    <span className="icon is-small"><FontAwesomeIcon icon='external-link-alt' /></span>
                    </Link>}
                    {this.props.user.uid === this.props.quiz.user &&
                        <Link to={"/quizzes/"+id+"/results"} className="level-item" data-tooltip="Quiz results">
                    <span className="icon is-small"><FontAwesomeIcon icon='poll-h' /></span>
                    </Link>}
                </div>
                </nav>
            </div>
            <div className="media-right">
            <button className="delete" onClick={this.props.deleteQuiz.bind(this, this.props.quiz)}></button>
            </div>
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
  

export default connect(mapStateToProps)(QuizItem)
