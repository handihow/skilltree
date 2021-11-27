import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { IconName } from "@fortawesome/fontawesome-svg-core";

interface IHeaderProps {
  header: string;
  icon?: string;
  image?: string;
}

export default function Header(props: IHeaderProps) {
  return (
    <header>
      <h1 className="title is-4">
        {props.icon && (
          <span className="icon">
            <FontAwesomeIcon icon={props.icon as IconName} />
          </span>
        )}
        {props.image && (
          <span className="icon">
            <img src={props.image} alt=""></img>
          </span>
        )}
        <span className="ml-5">{props.header}</span>
      </h1>
    </header>
  );
}
