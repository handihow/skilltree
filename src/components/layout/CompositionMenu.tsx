import React from 'react'
import { NavLink } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

interface ICompositionMenuProps {
  id: string;
}

export default function CompositionMenu(props: ICompositionMenuProps) {
  return (
      <aside className="menu has-background-light" style={{padding: '10px', height: "calc(100vh - 3.5rem)"}}>
        <ul className="menu-list">
        <p className="menu-label is-hidden-touch">
          Appearance
        </p>
          <li><NavLink to={"/compositions/"+props.id} activeClassName='is-active' exact={true}>
            <span className="icon" data-tooltip="Viewer">
              <FontAwesomeIcon icon='eye' />
            </span>
            <span className="ml-2 is-hidden-touch">Viewer</span></NavLink>
          </li>
          <li><NavLink to={"/compositions/"+props.id +"/background"} activeClassName='is-active'>
            <span className="icon" data-tooltip="Background">
              <FontAwesomeIcon icon='image' />
            </span>
            <span className="ml-2 is-hidden-touch">Background Image</span></NavLink>
          </li>
          <li><NavLink to={"/compositions/"+props.id +"/theme"} activeClassName='is-active'>
            <span className="icon" data-tooltip="Theme">
              <FontAwesomeIcon icon='sliders-h' />
            </span>
            <span className="ml-2 is-hidden-touch">Theme</span></NavLink>
          </li>
        <p className="menu-label is-hidden-touch">
          Content
        </p>
          <li><NavLink to={"/compositions/"+props.id +"/skilltrees"} activeClassName='is-active'>
            <span className="icon" data-tooltip="Skilltrees">
              <FontAwesomeIcon icon='sitemap' />
            </span>
            <span className="ml-2 is-hidden-touch">Skilltrees</span></NavLink>
          </li>
          <li><NavLink to={"/compositions/"+props.id +"/skills"} activeClassName='is-active'>
            <span className="icon" data-tooltip="Skills">
              <FontAwesomeIcon icon='pager' />
            </span>
            <span className="ml-2 is-hidden-touch">Skills</span></NavLink></li>
        <p className="menu-label is-hidden-touch">
          Share
        </p>
          <li><NavLink to={"/compositions/"+props.id +"/publish"} activeClassName='is-active'>
             <span className="icon" data-tooltip="Publish">
              <FontAwesomeIcon icon='share' />
            </span>
            <span className="ml-2 is-hidden-touch">Publish</span></NavLink>
          </li>
          <li><NavLink to={"/compositions/"+props.id +"/export"} activeClassName='is-active'>
            <span className="icon" data-tooltip="Export">
              <FontAwesomeIcon icon='file-export' />
            </span>
            <span className="ml-2 is-hidden-touch">Export</span></NavLink></li>
        </ul>
        
      </aside>
  )
}

