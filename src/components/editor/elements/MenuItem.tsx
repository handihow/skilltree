import React from 'react';
import { NavLink } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

export default function MenuItem(props) {
  return (
    <li key={props.index}><NavLink to={props.link} activeClassName='is-active' className="pl-0 pt-0 has-text-centered" exact={props.exact}>
        <div className="icon" data-tooltip={props.title}>
        <FontAwesomeIcon icon={props.icon} />
        </div>
        <div className="is-hidden-touch is-capitalized is-size-7">{props.title}</div></NavLink>
    </li>
  )
}