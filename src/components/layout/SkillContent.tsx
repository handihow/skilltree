import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import renderHTML from 'react-render-html';
import { NavLink } from 'react-router-dom';

export default function SkillContent(props) {
    return (
        <React.Fragment>
            {props.optional && <div className="tag" style={{marginBottom: '10px'}}>optional</div>}
            {renderHTML(props.description)}
            <ul style={{listStyleType: 'none', marginTop: '10px'}}>
                {props.links.map((link) => (
                    <li key={link.id}>
                        <a href={link.reference} target="_blank" rel="noopener noreferrer">
                        <span style={{marginRight: '10px'}}>
                        <FontAwesomeIcon icon={[link.iconPrefix, link.iconName]} />
                        </span>
                        {link.title}
                        </a>
                    </li>
                ))}
            </ul>
            {props.hasQuiz && 
                <div className="buttons" style={{marginTop:'10px'}}>
                <NavLink to={"/quizzes/"+props.quizId+"/test"} className="button is-primary is-inverted">
                    View Quiz</NavLink>
                </div>}
        </React.Fragment>
    )
}
