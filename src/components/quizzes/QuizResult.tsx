import React, { Component } from "react";
import { db } from "../../firebase/firebase";
import { RouteComponentProps } from "react-router-dom";
import IQuiz from "../../models/quiz.model";
import IAnswer from "../../models/answer.model";
import { connect } from "react-redux";
import SurveyPage from "../surveyjs/Survey";
import Loading from "../layout/Loading";
import { toast } from "react-toastify";
import Header from "../layout/Header";
import BackButton from "../layout/BackButton";

type TParams = { quizId: string };

interface IQuizResultProps extends RouteComponentProps<TParams> {
  user: any;
  isAuthenticated: boolean;
}

interface IQuizResultState {
  quiz?: IQuiz;
  answer?: IAnswer;
  doneLoading: boolean;
}

export class QuizResult extends Component<IQuizResultProps, IQuizResultState> {
  constructor(props: IQuizResultProps) {
    super(props);
    this.state = {
      quiz: undefined,
      doneLoading: false,
    };
  }

  componentDidMount() {
    const quizId = this.props.match.params.quizId;
    db.collection("quizzes")
      .doc(quizId)
      .get()
      .then((doc) => {
        const quiz = doc.data() as IQuiz;
        if (!quiz.data) {
          toast("There are no questions in this quiz");
          this.setState({
            doneLoading: true,
          });
          this.props.history.goBack();
          return;
        }
        this.setState({ quiz });
        db.collection("answers")
          .doc(quizId + "_" + this.props.user.uid)
          .get()
          .then((doc) => {
            if (doc.exists) {
              const answer = doc.data() as IAnswer;
              this.setState({
                answer,
                doneLoading: true,
              });
            } else {
              //quiz is not yet completed
              toast("You have not done the quiz yet. Please do the quiz...");
              this.props.history.push("/quizzes/" + quizId + "/test");
            }
          });
      });
  }

  render() {
    const header = this.state.quiz?.title || "Quiz Result";
    return this.state.doneLoading ? (
      <React.Fragment>
        <div className="level is-mobile has-background-light p-3">
          <div className="level-item has-text-centered">
            <Header header={header} icon="poll-h" />
          </div>
          <div className="level-item has-text-centered">
            <BackButton></BackButton>
          </div>
        </div>
        <div className="container">
          <div className="columns">
            <div className="column is-three-fifths">
              <SurveyPage
                json={this.state.quiz?.data}
                data={this.state.answer?.data}
                viewmode={true}
                providingFeedback={false}
              />
            </div>
            <div className="column box">
              <SurveyPage
                json={this.state.quiz?.feedback}
                data={this.state.answer?.feedback}
                viewmode={true}
                providingFeedback={false}
              />
            </div>
          </div>
        </div>
      </React.Fragment>
    ) : (
      <Loading />
    );
  }
}

function mapStateToProps(state) {
  return {
    isAuthenticated: state.auth.isAuthenticated,
    user: state.auth.user,
  };
}

export default connect(mapStateToProps)(QuizResult);
