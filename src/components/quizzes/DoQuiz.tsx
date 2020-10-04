import React, { Component } from 'react'
import { db } from '../../firebase/firebase';
import { RouteComponentProps } from 'react-router-dom';
import IQuiz from '../../models/quiz.model';
import { connect } from "react-redux";
import { SurveyPage } from "../surveyjs/Survey";
import Loading from '../layout/Loading';

type TParams =  { quizId: string };

interface IDoQuizProps extends RouteComponentProps<TParams>{
    user: any;
    isAuthenticated: boolean;
}

interface IDoQuizState {
    quiz?: IQuiz;
}

export class DoQuiz extends Component<IDoQuizProps,IDoQuizState> {
    constructor(props: IDoQuizProps){
        super(props);
        this.state = {
            quiz: undefined
        }
    }

    componentDidMount() {
        const quizId = this.props.match.params.quizId;
        db.collection("quizzes").doc(quizId).get()
        .then(doc => {
            const quiz = doc.data() as IQuiz;
            this.setState({quiz});
        });
    }

    render() {
        return (
            this.state.quiz ?
            <SurveyPage json={this.state.quiz.data} 
            onValueChanged={(value) => {console.log(value.data)}} 
            onCompleted={(value) => console.log(value.data)} /> 
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
