import React from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { Link } from 'react-router-dom';
import Header from '../layout/Header';

export default function QuizTabs (props: {currentTab: string, quizId: string, quizName: string}) {
    return (
      <React.Fragment>
        <div className="level has-background-light p-3 mb-0">
          <div className="level-item has-text-centered">
            <Header header={props.quizName} image="/QABlack.svg"></Header>
          </div>
          <div className="level-item has-text-centered">
            <Link className="button" to="/quizzes">Back</Link>
          </div>
        </div>
        <div className="tabs is-centered">
          <ul>
            <li className={props.currentTab ==='quiz' ? "is-active" : undefined}>
              <Link to={"/quizzes/"+props.quizId+"/builder/quiz"} className="level-item">
                <span className="icon is-small"><FontAwesomeIcon icon='edit' /></span>
                <span>Quiz editor</span>
                </Link>
            </li>
             <li className={props.currentTab ==='feedback' ? "is-active" : undefined}>
              <Link to={"/quizzes/"+props.quizId+"/builder/feedback"} className="level-item">
                <span className="icon is-small"><FontAwesomeIcon icon='comments' /></span>
                <span>Feedback editor</span>
                </Link>
            </li>
          </ul>
        </div>
        </React.Fragment>
    )
}

