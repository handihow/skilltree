import React from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { IconName } from '@fortawesome/fontawesome-svg-core';

interface IHeaderProps {
    header: string;
    icon: string;
}

export default function Header(props: IHeaderProps) {
    return (
        <header>
            <h1 className="title has-text-primary">
              <span className="icon">
                <FontAwesomeIcon icon={props.icon as IconName} />
              </span>
              <span className="ml-5">{props.header}</span>
              
           </h1>
        </header>
    )
}
