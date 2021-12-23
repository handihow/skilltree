import React from "react";
import { Route, Redirect } from "react-router-dom";
import SideBar from "./layout/SideBar";

const ProtectedRoute = ({
  component: Component,
  isAuthenticated,
  isVerifying,
  hasSidebar,
  ...rest
}) => (
  <Route
    {...rest}
    render={(props) =>
      isVerifying ? (
        <div />
      ) : isAuthenticated ? (
        <div className="columns is-gapless mb-0" style={{minHeight: "90vh"}}>
          <div className="column is-narrow is-hidden-mobile">{hasSidebar==="true" && <SideBar></SideBar>}</div>
          <div className="column" style={{minHeight: "90%"}}>
            <Component {...props} />
          </div>
        </div>
      ) : (
        <Redirect
          to={{
            pathname: "/login",
            state: { from: props.location },
          }}
        />
      )
    }
  />
);
export default ProtectedRoute;
