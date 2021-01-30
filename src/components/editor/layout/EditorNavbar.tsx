import React from 'react';
import { NavLink } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

export default function EditorNavbar(props) {
    return (
        <nav className="level has-background-grey-lighter mb-0 p-3 is-mobile">
            <div className="level-left">
                <div className="level-item is-hidden-mobile">
                <div className="field is-horizontal">
                    <div className="field-label is-normal">
                        <label className="label">Title</label>
                    </div>
                    <div className="field-body">
                        <p className="control" style={{width: '250px'}}>
                        <input className="input" type="text" 
                            value={props.composition?.title || ''} onChange={({target}) => props.changeCompositionTitle(target)}></input>
                        </p>
                    </div>
                </div>
                </div>
                <div className="level-item">
                    <div className="icon" data-tooltip="Copy SkillTree">
                        <FontAwesomeIcon icon="copy"/>
                    </div>
                </div>
                <div className="level-item">
                    <p className="subtitle is-5">
                        <strong>{props.numberOfSkills}</strong> skills</p>
                </div>
        </div>
        <div className="level-right">
            <div className="level-item">
                <NavLink to={"/compositions/"+props.id +"/viewer"} activeClassName='is-active' className="pl-0 pt-0 has-text-centered">
                <div className="icon" data-tooltip="View">
                <FontAwesomeIcon icon="eye"/>
                </div>
                <div className="is-hidden-touch is-capitalized is-size-7">View</div></NavLink></div>
            <div className="level-item">
                <NavLink to={"/editor/"+props.id +"/publish"} activeClassName='is-active' className="pl-0 pt-0 has-text-centered">
                <div className="icon" data-tooltip="Publish">
                <FontAwesomeIcon icon="share" />
                </div>
                <div className="is-hidden-touch is-capitalized is-size-7">Publish</div></NavLink></div>
        </div>
    </nav>
  )
}