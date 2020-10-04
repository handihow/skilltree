import React, { Component } from 'react'
import { db } from '../../firebase/firebase';
import { RouteComponentProps, Redirect } from 'react-router-dom';
import IQuiz from '../../models/quiz.model';
import { toast } from 'react-toastify';
import { connect } from "react-redux";
import SurveyCreator from "../surveyjs/SurveyCreator";

type TParams =  { quizId: string };

interface IQuizProps extends RouteComponentProps<TParams>{
    user: any;
    isAuthenticated: boolean;
}

interface IQuizState {
    quiz?: IQuiz;
    toEditor: boolean;
}

export class Quiz extends Component<IQuizProps,IQuizState> {
    constructor(props: IQuizProps){
        super(props);
        this.state = {
            toEditor: false
        }
    }

    componentDidMount() {
        const quizId = this.props.match.params.quizId;
        db.collection("quizzes").doc(quizId).get()
        .then(doc => {
            const quiz = doc.data() as IQuiz;
            if(this.props.user.uid !== quiz.user) {
                toast.error('You are not the owner of this quiz. You cannot view in editor mode.');
                this.setState({
                    toEditor: true
                })
            } else {
                this.setState({quiz});
            }
        });
    }

    render() {
        return (
            this.state.toEditor ?
            <Redirect to={'/quizzes'} /> :
            <SurveyCreator quiz={this.state.quiz} 
                dotest={() => this.props.history.push("/quizzes/"+this.state.quiz?.id+"/test")}
                goback={() => this.props.history.push("/quizzes")}/>
        )
    }
}

function mapStateToProps(state) {
    return {
      isAuthenticated: state.auth.isAuthenticated,
      user: state.auth.user
    };
  }

export default connect(mapStateToProps)(Quiz)
