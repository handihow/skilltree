import React, { Component } from 'react'
import { Link } from 'react-router-dom';
import { logoutUser } from "../../actions";
import { connect } from "react-redux";

interface INavbarProps {
    isLoggingOut: any;
    logoutError: any;
    isAuthenticated: boolean;
    dispatch: any;
}

interface INavbarState {
    isActive: boolean;
}

class Navbar extends Component<INavbarProps, INavbarState> {

    constructor(props: INavbarProps) {
        super(props);
        this.state = {
            isActive: false
        }
    }

    handleLogout = () => {
        const { dispatch } = this.props;
        dispatch(logoutUser());
    };

    toggleActive = () => {
        this.setState({
            isActive: !this.state.isActive
        })
    }

    render(){
        const { isLoggingOut, logoutError, isAuthenticated } = this.props;
        return (
            <React.Fragment>
            <div className="navbar is-primary" role="navigation" aria-label="main navigation">
                <div className="navbar-brand">
                    <Link to="/" className="navbar-item">
                        <img 
                        alt="Skilltree logo"
                        src="https://firebasestorage.googleapis.com/v0/b/skilltree-b6bba.appspot.com/o/SkillTree_logo.png?alt=media&token=0cbc6c2a-58c2-46e7-bfec-47eafb6ddb01" ></img>
                    </Link>
                    <a role="button" className={this.state.isActive ? "navbar-burger is-active" : "navbar-burger"}
                        aria-label="menu" aria-expanded="false" onClick={this.toggleActive} href="# ">
                    <span aria-hidden="true"></span>
                    <span aria-hidden="true"></span>
                    <span aria-hidden="true"></span>
                    </a>
                </div>
                <div className={this.state.isActive ? "navbar-menu is-active" : "navbar-menu"}>
                <div className="navbar-end">
                {isAuthenticated ?
                    <Link to="/" className="navbar-item">
                        Skilltrees
                    </Link> :
                    <Link to="/about" className="navbar-item">
                        About
                    </Link> }
                <div className="navbar-item">
                    <div className="buttons">
                        {isAuthenticated ? 
                            <button className="button is-light" onClick={this.handleLogout}>Logout</button> : 
                            <Link to="/login" className="button is-light">Login</Link>}
                        </div>
                    </div>  
                </div>
                </div>
            </div>
            {isLoggingOut ? <div className="notification">Logging out...</div> : null}
            {logoutError ? <div className="notification">{logoutError}</div> : null}
            </React.Fragment>
        )
    }
    
}

function mapStateToProps(state) {
    return {
      isLoggingOut: state.auth.isLoggingOut,
      logoutError: state.auth.logoutError,
      isAuthenticated: state.auth.isAuthenticated
    };
  }

export default connect(mapStateToProps)(Navbar);