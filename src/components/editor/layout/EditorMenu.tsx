import React from 'react'
// import { NavLink } from 'react-router-dom';
// import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { Droppable } from 'react-beautiful-dnd';
import DraggableMenuItem from '../elements/DraggableMenuItem';
import MenuItem from '../elements/MenuItem';

interface IEditorMenuProps {
  id: string;
  hideDraggables: boolean;
  toggleBackgroundEditor: Function;
  isVisibleBackgroundEditor: boolean;
  toggleThemeEditor: Function;
  isVisibleThemeEditor: boolean;
}

export default function EditorMenu(props: IEditorMenuProps) {
  const draggableMenuItems = [
    {'title': "Skilltree", 'img': "/Skilltree_icons-04.svg", 'tooltip': 'Add a skilltree'},
    {'title': "Root-skill", 'img': "/Skilltree_icons-05.svg",  'tooltip': 'Add skill to root of skilltree'},
    {'title': "Sibling-left-skill", 'img': "/Skilltree_icons-02.svg", 'tooltip': 'Add skill as sibling to skill'},
    {'title': "Sibling-right-skill", 'img': "/Skilltree_icons-03.svg", 'tooltip': 'Add skill as sibling to skill'},
    {'title': 'Child-skill', 'img': "/Skilltree_icons-01.svg", 'tooltip': 'Add skill as child of skill' },
    {'title': 'Master-skills', 'icon': "th-list", 'tooltip': 'Add skills from master skills list'}
  ];
  const appearanceMenuItems = [
    {'title': 'Background', 'icon': 'image', 'clicked': 'toggleBackgroundEditor', 'active': 'isVisibleBackgroundEditor', 'tooltip': 'Customize the background of the composition'},
    {'title': 'Theme', 'icon': 'sliders-h', 'clicked': 'toggleThemeEditor', 'active': 'isVisibleThemeEditor', 'tooltip': 'Customize the appearance of the skilltree'},
  ];
  return (
    <aside className="menu has-background-light has-text-centered pt-4">
      <Droppable droppableId="MENU" isDropDisabled={false}>
        {(provided) => (
          <ul className="menu-list" {...provided.droppableProps} ref={provided.innerRef}>
            
           <React.Fragment>
           {!props.hideDraggables &&
           <p className="menu-label is-hidden-touch">
              Add Items
            </p>}
            {draggableMenuItems.map((item,index) => (
              <DraggableMenuItem
                key={item.title?.toLowerCase()}
                type={item.title?.toLowerCase()}
                title={item.title}
                index={index}
                img={item.img}
                icon={item.icon}
                tooltip={item.tooltip}
              ></DraggableMenuItem>
            ))}
            </React.Fragment>
            <p className="menu-label is-hidden-touch">
              Appearance
            </p>
            {appearanceMenuItems.map((item, index) => (
              <MenuItem 
                key={index} 
                index={index} 
                title={item.title} 
                tooltip={item.tooltip}
                icon={item.icon} 
                clicked={props[item.clicked]}
                isActive={props[item.active]}
                ></MenuItem>
            ))}
            {provided.placeholder}
          </ul>
        )}
      </Droppable>
    </aside>
  )
}
