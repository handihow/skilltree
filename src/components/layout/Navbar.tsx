import React, { Component } from 'react'
import { Link } from 'react-router-dom';
import { logoutUser } from "../../actions";
import { connect } from "react-redux";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

interface INavbarProps {
    isLoggingOut: any;
    logoutError: any;
    isAuthenticated: boolean;
    user: any;
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
                        alt="SkillTree"
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
                <div className="navbar-start">
                
                    
                <div className="navbar-item">
                    <div className="buttons">
                        {isAuthenticated ?
                        <Link to="/" className="button is-primary is-rounded is-medium">
                            <span className="icon has-tooltip-bottom" data-tooltip="Skilltrees">
                              <FontAwesomeIcon icon='sitemap' />
                            </span>
                            <span>Skilltrees</span>
                        </Link> :
                        <Link to="/about" className="button is-primary is-rounded is-medium">
                            <span className="icon has-tooltip-bottom" data-tooltip="About">
                              <FontAwesomeIcon icon='info' />
                            </span>
                            <span>About</span>
                        </Link> }
                        {isAuthenticated && <Link to="/quizzes" className="button is-primary is-rounded is-medium">
                            <span className="icon has-tooltip-bottom" data-tooltip="Quizzes">
                              <FontAwesomeIcon icon='poll-h' />
                            </span>
                            <span>Quizzes</span>
                        </Link>}
                    </div>
                   </div>
                </div>
                <div className="navbar-end">
                <div className="navbar-item">
                    <div className="buttons">
                        <Link to="/support" className="button is-primary is-rounded is-medium">
                            <span className="icon has-tooltip-bottom" data-tooltip="Support">
                              <FontAwesomeIcon icon='question-circle' />
                            </span>
                        </Link>
                        {isAuthenticated && <Link to="/profile" className="button is-primary is-rounded is-medium">
                            <span className="icon has-tooltip-bottom" data-tooltip="Profile">
                              <FontAwesomeIcon icon='user-circle' />
                            </span>
                        </Link>}
                        {isAuthenticated ? 
                            <button className="button is-primary is-rounded is-medium" onClick={this.handleLogout}>
                                <span className="icon has-tooltip-bottom" data-tooltip="Logout">
                                  <FontAwesomeIcon icon='sign-out-alt' />
                                </span>
                            </button> : 
                            <Link to="/login" className="button is-primary is-rounded is-medium">
                                <span className="icon has-tooltip-bottom" data-tooltip="Login">
                                  <FontAwesomeIcon icon='sign-in-alt' />
                                </span>
                                <span>Log In</span>
                            </Link>}
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
      isAuthenticated: state.auth.isAuthenticated,
      user: state.auth.user
    };
  }

export default connect(mapStateToProps)(Navbar);