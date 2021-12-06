import React from "react";
import { NavLink } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import BackButton from "../../layout/BackButton";

export default function EditorNavbar({
  composition,
  changeCompositionTitle,
  toggleShareLinkModal,
}) {
  return (
    <nav className="level has-background-grey-lighter mb-0 p-3 is-mobile">
      <div className="level-left">
        <div className="level-item">
          <NavLink to="/" className="button is-rounded">Back</NavLink>
        </div>
        <div className="level-item">
          <div className="level-item is-hidden-mobile">
            <div className="field is-horizontal">
              <div className="field-label is-normal">
                <label className="label">Title</label>
              </div>
              <div className="field-body">
                <p className="control box p-1" style={{ width: "280px" }}>
                  <input
                    className="input"
                    type="text"
                    value={composition?.title || ""}
                    onChange={({ target }) =>
                      changeCompositionTitle("title", target.value)
                    }
                  ></input>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="level-right">
        <div className="level-item">
          <NavLink
            to={"/compositions/" + composition?.id + "/viewer"}
            activeClassName="is-active"
            className="pl-0 pt-0 has-text-centered"
          >
            <div className="icon has-text-dark" data-tooltip="View">
              <FontAwesomeIcon icon="eye" />
            </div>
          </NavLink>
        </div>
        <div className="level-item">
          <NavLink
            to={"/compositions/" + composition?.id + "/monitor"}
            activeClassName="is-active"
            className="pl-0 pt-0 has-text-centered"
          >
            <div className="icon has-text-dark" data-tooltip="Monitor students">
              <FontAwesomeIcon icon="users" />
            </div>
          </NavLink>
        </div>
        <div className="level-item">
          <a
            href="# "
            className="pl-0 pt-0 has-text-centered"
            onClick={() => toggleShareLinkModal()}
          >
            <div className="icon has-text-dark" data-tooltip="Share">
              <FontAwesomeIcon icon="share" />
            </div>
          </a>
        </div>
      </div>
    </nav>
  );
}
