import React from 'react'
import { NavLink } from 'react-router-dom';

export default function CompositionMenu(props) {
  return (
      <aside className="menu" style={{margin: "10px"}}>
        <ul className="menu-list">
        <p className="menu-label">
          Appearance
        </p>
          <li><NavLink to={"/compositions/"+props.id} activeClassName='is-active' exact={true}>Editor</NavLink></li>
          <li><NavLink to={"/compositions/"+props.id +"/background"} activeClassName='is-active'>Background Image</NavLink></li>
          <li><NavLink to={"/compositions/"+props.id +"/theme"} activeClassName='is-active'>Theme</NavLink></li>
        <p className="menu-label">
          Content
        </p>
          <li><a>Skill trees</a></li>
          <li><a>Skills</a></li>
        <p className="menu-label">
          Share
        </p>
          <li><a>Publish</a></li>
          <li><a>Export</a></li>
        </ul>
        
      </aside>
  )
}
