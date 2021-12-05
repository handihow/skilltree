import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React from 'react';
import { Draggable } from 'react-beautiful-dnd';

export default function DraggableMenuItem({
  type, 
  index,
  title,
  tooltip,
  img,
  icon
}) {
  return (
    <Draggable key={type} draggableId={type} index={index} type={type}>
        {(provided) => (
        <li className="pb-3"
            ref={provided.innerRef}
            {...provided.draggableProps}
            {...provided.dragHandleProps}>
            <div className="has-text-centered has-text-dark">
            <div className="icon has-tooltip-right has-tooltip-primary" data-tooltip={tooltip}>
              {img ? <img src={img} alt=""></img> : <FontAwesomeIcon icon={icon} />}
            </div>
            <div className="is-size-7">{title}</div>
            </div>
            {provided.placeholder}
        </li>)}
    </Draggable>
  )
}