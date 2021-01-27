import React from 'react';
import { Draggable } from 'react-beautiful-dnd';

export default function DraggableMenuItem(props) {
  return (
    <Draggable key={props.type} draggableId={props.type} index={props.index} type={props.type}>
        {(provided) => (
        <li className="pb-4"
            ref={provided.innerRef}
            {...provided.draggableProps}
            {...provided.dragHandleProps}>
            <div className="has-text-centered">
            <div className="icon" data-tooltip={props.title}>
            <img src={props.img} alt=""></img>
            </div>
            <div className="is-hidden-touch is-capitalized is-size-7">{props.title}</div>
            </div>
            {provided.placeholder}
        </li>)}
    </Draggable>
  )
}