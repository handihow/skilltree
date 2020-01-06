import React from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

export default function SkillContent(props) {
    return (
        <React.Fragment>
            <div>{props.description}</div>
            <ul style={{listStyleType: 'none', marginTop: '10px'}}>
                {props.links.map((link) => (
                    <li key={link.id}>
                        <a href={link.reference} target="_blank" rel="noopener noreferrer">
                        <span style={{marginRight: '10px'}}>
                        <FontAwesomeIcon icon={[link.iconLibrary, link.icon]} />
                        </span>
                        {link.title}
                        </a>
                    </li>
                ))}
            </ul>
        </React.Fragment>
    )
}
