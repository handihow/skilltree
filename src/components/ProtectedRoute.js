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
        <div className="columns is-gapless" style={{height: "calc(100vh-3.5rem)"}}>
          <div className="column is-narrow is-hidden-mobile">{hasSidebar==="true" && <SideBar></SideBar>}</div>
          <div className="column" style={{overflowY: "scroll", overflowX: "hidden"}}>
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
