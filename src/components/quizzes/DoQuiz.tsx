import React, { Component } from 'react'
import { db } from '../../firebase/firebase';
import { RouteComponentProps } from 'react-router-dom';
import IQuiz from '../../models/quiz.model';
import IAnswer from '../../models/answer.model';
import { connect } from "react-redux";
import SurveyPage from "../surveyjs/Survey";
import Loading from '../layout/Loading';
import firebase from 'firebase/app';
import { toast } from 'react-toastify';

type TParams =  { quizId: string };

interface IDoQuizProps extends RouteComponentProps<TParams>{
    user: any;
    isAuthenticated: boolean;
}

interface IDoQuizState {
    quiz?: IQuiz;
    answer?: IAnswer;
    doneLoading: boolean;
}

export class DoQuiz extends Component<IDoQuizProps,IDoQuizState> {
    constructor(props: IDoQuizProps){
        super(props);
        this.state = {
            quiz: undefined,
            doneLoading: false
        }
    }

    componentDidMount() {
        const quizId = this.props.match.params.quizId;
        db.collection("quizzes").doc(quizId).get()
        .then(doc => {
            const quiz = doc.data() as IQuiz;
            if(!quiz.data){
                toast('There are no questions in this quiz');
                this.props.history.goBack();
                return;
            }
            this.setState({quiz});
            db.collection("answers").doc(quizId + '_' + this.props.user.uid).get()
            .then(doc => {
                if(doc.exists){
                    const answer = doc.data() as IAnswer;
                    this.setState({
                        answer,
                        doneLoading: true
                    });
                } else {
                    db.collection("answers").doc(quizId + '_' + this.props.user.uid).set({
                        id: quizId + '_' + this.props.user.uid,
                        user: this.props.user.uid,
                        username: this.props.user.email,
                        displayName: this.props.user.displayName,
                        quiz: quizId,
                        created: firebase.firestore.Timestamp.now(),
                        lastUpdate: firebase.firestore.Timestamp.now()
                    }).then(_ => {
                        this.setState({
                            doneLoading: true
                        });
                    });
                }
            });
        });
        
    }

    onValueChanged(data){
        const quizId = this.props.match.params.quizId;
        db.collection("answers").doc(quizId + '_' + this.props.user.uid).update({
            data: data
        });
    }

    onComplete(sender){
        const quizId = this.props.match.params.quizId;
        db.collection("answers").doc(quizId + '_' + this.props.user.uid).set({
            isFinished: true,
            lastUpdate: firebase.firestore.Timestamp.now(),
            correctAnswers: sender.getCorrectedAnswerCount(),
            incorrectAnswers: sender.getInCorrectedAnswerCount()
        }, {merge: true}).then(_ => {
            this.props.history.goBack();
        });
        
    }

    onFinishPreview(){
        this.props.history.goBack();
    }

    render() {
        return (
            this.state.doneLoading ?
            <SurveyPage 
            json={this.state.quiz?.data} 
            data={this.state.answer ? this.state.answer.data : null}
            onValueChanged={(value) => this.onValueChanged(value.data)} 
            onComplete={(sender) => this.onComplete(sender)}
            onFinishPreview={() => this.onFinishPreview()}
            isQuizOwner={this.state.quiz?.user === this.props.user.uid} /> 
            : <Loading />
        )
    }
}

function mapStateToProps(state) {
    return {
      isAuthenticated: state.auth.isAuthenticated,
      user: state.auth.user
    };
  }

export default connect(mapStateToProps)(DoQuiz)
