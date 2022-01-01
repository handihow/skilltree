import React from "react";
import { NavLink } from "react-router-dom";

const SideBar = ({ user }) => {
  const isPremium = process.env.REACT_APP_ENVIRONMENT_ID !== "free";
  return (
    <aside className="menu p-3 has-background-dark" style={{ height: "100%" }}>
      {isPremium ? (
        <React.Fragment>
          <p className="menu-label">Your groups</p>
          <ul className="menu-list">
            {user?.flUserContent.groups.map((group) => (
              <li>
                <NavLink
                  activeClassName="is-active"
                  to={"/groups/" + group.id}
                  exact={true}
                >
                  {group.name}
                </NavLink>
              </li>
            ))}
            {user?.type === "teacher" && (
              <li>
                <NavLink activeClassName="is-active" to="/approvals">
                  Approvals
                </NavLink>
              </li>
            )}
          </ul>
        </React.Fragment>
      ) : (
        <React.Fragment>
          <p className="menu-label">Your content</p>
          <ul className="menu-list">
            <li>
              <NavLink activeClassName="is-active" to="/" exact={true}>
                SkillTrees
              </NavLink>
            </li>
            <li>
              <NavLink activeClassName="is-active" to="/skills">
                Skills
              </NavLink>
            </li>
          </ul>
        </React.Fragment>
      )}

      <p className="menu-label">Get help</p>
      <ul className="menu-list">
        <li>
          <a
            href="https://easyskilltree.com/log-a-support-ticket/"
            target="_blank"
            rel="noreferrer"
          >
            Report bug
          </a>
        </li>
        <li>
          <a
            href="https://easyskilltree.com/knowledge-base/"
            target="_blank"
            rel="noreferrer"
          >
            Manual
          </a>
        </li>
      </ul>
      <p className="menu-label">Your account</p>
      <ul className="menu-list">
        <li>
          <NavLink to="/profile" activeClassName="is-active">
            Your profile
          </NavLink>
        </li>
      </ul>
    </aside>
  );
};

export default SideBar;
