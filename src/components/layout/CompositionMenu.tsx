import React from 'react'
import { NavLink } from 'react-router-dom';

interface ICompositionMenuProps {
  id: string;
}

export default function CompositionMenu(props: ICompositionMenuProps) {
  return (
      <aside className="menu has-background-white" style={{padding: '10px', height: "calc(100vh - 3.5rem)"}}>
        <ul className="menu-list">
        <p className="menu-label">
          Appearance
        </p>
          <li><NavLink to={"/compositions/"+props.id} activeClassName='is-active' exact={true}>Viewer</NavLink></li>
          <li><NavLink to={"/compositions/"+props.id +"/background"} activeClassName='is-active'>Background Image</NavLink></li>
          <li><NavLink to={"/compositions/"+props.id +"/theme"} activeClassName='is-active'>Theme</NavLink></li>
        <p className="menu-label">
          Content
        </p>
          <li><NavLink to={"/compositions/"+props.id +"/skilltrees"} activeClassName='is-active'>Skilltrees</NavLink></li>
          <li><NavLink to={"/compositions/"+props.id +"/skills"} activeClassName='is-active'>Skills</NavLink></li>
        <p className="menu-label">
          Share
        </p>
          <li><NavLink to={"/compositions/"+props.id +"/publish"} activeClassName='is-active'>Publish</NavLink></li>
          <li><NavLink to={"/compositions/"+props.id +"/export"} activeClassName='is-active'>Export</NavLink></li>
        </ul>
        
      </aside>
  )
}

