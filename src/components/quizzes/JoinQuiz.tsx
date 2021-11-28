import React, { Component } from "react";
import { db } from "../../firebase/firebase";
import { Link, RouteComponentProps } from "react-router-dom";
import IQuiz from "../../models/quiz.model";
import { connect } from "react-redux";
import Loading from "../layout/Loading";
import Header from "../layout/Header";

type TParams = { quizId: string };

interface IJoinQuizProps extends RouteComponentProps<TParams> {
  user: any;
  isAuthenticated: boolean;
}

interface IJoinQuizState {
  quiz?: IQuiz;
  doneLoading: boolean;
}

export class JoinQuiz extends Component<IJoinQuizProps, IJoinQuizState> {
  constructor(props: IJoinQuizProps) {
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
        this.setState({
          quiz: quiz,
          doneLoading: true,
        });
      });
  }

  render() {
    const header = "Join Instructions";
    return this.state.doneLoading ? (
      <React.Fragment>
        <div className="level has-background-light p-3 mb-0">
          <div className="level-item has-text-centered">
            <Header header={header} icon="share" />
          </div>
          <div className="level-item has-text-centered">
              <Link className="button" to="/quizzes">Back</Link>
          </div>
        </div>
        <div className="container">
          <div className="notification is-warning">
            Quizzes can only be joined by logged in users!
          </div>

          <h5 className="title is-5">Option 1 - include link in skilltree</h5>
          <p>You can add the quiz link to a skill in your skilltree.</p>
          <p>
            Go to the skilltree editor and then the skill editor. You will find
            a button there to add a quiz to the skill.
          </p>
          <p>
            Once the quiz is added to the skill, a button to enter the quiz will
            appear in the skill of your skilltree.
          </p>
          <div className="is-divider" data-content="OR"></div>
          <h5 className="title is-5">Option 2 - invite with a link</h5>
          <p>You can send this link to your students.</p>
          <p>They need to be logged in to do the quiz.</p>
          <p className="has-text-weight-bold">
            https://easyskilltree.com/quizzes/{this.state.quiz?.id}/test
          </p>
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

export default connect(mapStateToProps)(JoinQuiz);
