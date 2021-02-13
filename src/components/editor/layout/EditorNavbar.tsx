import React from 'react';
import { NavLink } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import BackButton from '../../layout/BackButton';

export default function EditorNavbar(props) {
    return (
        <nav className="level has-background-grey-lighter mb-0 p-3 is-mobile">
            <div className="level-left">
                <div className="level-item">
                    <BackButton />
                </div> 
                <div className="level-item">   
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
                </div>
        </div>
        <div className="level-right">
            <div className="level-item">
                <NavLink to={"/compositions/"+props.id +"/viewer"} activeClassName='is-active' className="pl-0 pt-0 has-text-centered">
                <div className="icon has-text-dark" data-tooltip="View">
                <FontAwesomeIcon icon="eye"/>
                </div></NavLink></div>
            <div className="level-item">
                <NavLink to={"/editor/"+props.id +"/publish"} activeClassName='is-active' className="pl-0 pt-0 has-text-centered">
                <div className="icon has-text-dark" data-tooltip="Publish">
                <FontAwesomeIcon icon="share" />
                </div></NavLink></div>
        </div>
    </nav>
  )
}