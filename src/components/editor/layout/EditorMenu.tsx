import React from 'react'
// import { NavLink } from 'react-router-dom';
// import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { Droppable } from 'react-beautiful-dnd';
import DraggableMenuItem from '../elements/DraggableMenuItem';
import MenuItem from '../elements/MenuItem';

interface IEditorMenuProps {
  id: string;
  hideDraggables: boolean;
}

export default function EditorMenu(props: IEditorMenuProps) {
  const draggableMenuItems = [
    {'title': "Skilltree", 'img': "/Skilltree_icons-04.svg"},
    {'title': "Root-skill", 'img': "/Skilltree_icons-05.svg"},
    {'title': "Sibling-left-skill", 'img': "/Skilltree_icons-02.svg"},
    {'title': "Sibling-right-skill", 'img': "/Skilltree_icons-03.svg"},
    {'title': 'Child-skill', 'img': "/Skilltree_icons-01.svg" },
    {'title': 'Quiz', 'img': "/Skilltree_icons-grey_Q&A black.svg"}
  ];
  const appearanceMenuItems = [
    {'title': 'Background', 'icon': 'image', 'link': "/editor/"+props.id +"/background", 'exact': false},
    {'title': 'Theme', 'icon': 'sliders-h', 'link': "/editor/"+props.id +"/theme", 'exact': false},
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
              ></DraggableMenuItem>
            ))}
            </React.Fragment>
            {props.hideDraggables &&
            <React.Fragment>
              <p className="menu-label is-hidden-touch">
              Editor
              </p>
              <MenuItem title="Back to editor" icon="arrow-left" link={"/editor/"+props.id} exact={true}></MenuItem>
            </React.Fragment>
            }
            <p className="menu-label is-hidden-touch">
              Appearance
            </p>
            {appearanceMenuItems.map((item, index) => (
              <MenuItem key={index} title={item.title} icon={item.icon} link={item.link} exact={item.exact}></MenuItem>
            ))}
            {provided.placeholder}
          </ul>
        )}
      </Droppable>
    </aside>
  )
}
