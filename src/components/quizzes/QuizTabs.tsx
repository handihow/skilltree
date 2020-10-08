import React from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { Link } from 'react-router-dom';

export default function QuizTabs (props: {currentTab: string, quizId: string}) {
    return (
        <div className="tabs is-toggle is-toggle-rounded is-centered" style={{"marginTop": "10px"}}>
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
    )
}

