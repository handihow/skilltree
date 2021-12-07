import React from "react";
// import { NavLink } from 'react-router-dom';
// import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { Droppable } from "react-beautiful-dnd";
import DraggableMenuItem from "../elements/DraggableMenuItem";
import MenuItem from "../elements/MenuItem";
import MenuLinkItem from "../elements/MenuLinkItem";

interface IEditorMenuProps {
  id: string;
  hideDraggables: boolean;
  hideSkillDraggables: boolean;
  toggleOptionsEditor: Function;
  isVisibleOptionsEditor: boolean;
}

export default function EditorMenu(props: IEditorMenuProps) {
  const allDraggableMenuItems = [
    {
      title: "Skilltree",
      img: "/Skilltree_icons-04.svg",
      tooltip: "Add a skilltree",
    },
    {
      title: "Root-skill",
      img: "/Skilltree_icons-05.svg",
      tooltip: "Add skill to root of skilltree",
    },
    {
      title: "Sibling-skill",
      img: "/Skilltree_icons-03.svg",
      tooltip: "Add skill as sibling to skill",
    },
    {
      title: "Child-skill",
      img: "/Skilltree_icons-01.svg",
      tooltip: "Add skill as child of skill",
    },
    {
      title: "Master-skills",
      icon: "th-list",
      tooltip: "Import multiple skills from your skills list",
    },
  ];
  const draggableMenuItems = props.hideDraggables
    ? []
    : props.hideSkillDraggables
    ? [allDraggableMenuItems[0]]
    : allDraggableMenuItems;
  const menuLinkItems = [
    {
      title: "Background",
      icon: "image",
      link: "/editor/" + props.id + "/background",
      tooltip: "Customize the background of the composition",
    },
    {
      title: "Theme",
      icon: "sliders-h",
      link: "/editor/" + props.id + "/theme",
      tooltip: "Customize the appearance of the skilltree",
    },
  ];
  const appearanceMenuItems = [
    {
      title: "Share",
      icon: "share",
      clicked: "toggleOptionsEditor",
      active: "isVisibleOptionsEditor",
      tooltip: "Share your skilltree",
    },
  ];
  return (
    <aside className="menu has-background-light p-3" style={{ height: "100%" }}>
      <Droppable droppableId="MENU" isDropDisabled={false}>
        {(provided) => (
          <ul
            className="menu-list"
            {...provided.droppableProps}
            ref={provided.innerRef}
          >
            {!props.hideDraggables && (
              <React.Fragment>
                <p className="menu-label has-text-dark">Add Items</p>

                {draggableMenuItems.map((item, index) => (
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
            )}
            <p className="menu-label has-text-dark">Appearance</p>
            {menuLinkItems.map((item, index) => (
              <MenuLinkItem
                key={item.title?.toLowerCase()}
                title={item.title}
                index={index}
                icon={item.icon}
                tooltip={item.tooltip}
                link={item.link}
              ></MenuLinkItem>
            ))}
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
  );
}
