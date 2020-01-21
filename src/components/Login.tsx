import React, { Component } from "react";
import { connect } from "react-redux";
import { Redirect, Link, RouteComponentProps } from "react-router-dom";
import { loginUser, loginWithGoogle, loginWithMicrosoft } from "../actions";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

const hrStyle =  {
    display: 'inline-block',
    margin: 0,
    padding: 0,
    verticalAlign: 'middle',
    width: '100px'
}

interface ILoginProps  {
    isLoggingIn: boolean;
    isAuthenticated: boolean;
    dispatch: any;
    onCompositionPage?: boolean;
}

interface ILoginState {
    email: string;
    password: string;
}

class Login extends Component<ILoginProps, ILoginState> {
    
    constructor(props: ILoginProps){
        super(props);
        this.state = { email: "", password: "" };
    }

    handleEmailChange = ({ target }) => {
        this.setState({ email: target.value });
    };

    handlePasswordChange = ({ target }) => {
        this.setState({ password: target.value });
    };

    handleSubmit = () => {
        const { dispatch } = this.props;
        const { email, password } = this.state;

        dispatch(loginUser(email, password));
    };

    handleLoginWithGoogle = () => {
        const { dispatch } = this.props;
        dispatch(loginWithGoogle());
    };

    handleLoginWithMicrosoft = () => {
        const { dispatch } = this.props;
        dispatch(loginWithMicrosoft());
    };

    render() {
        const { isAuthenticated } = this.props;
        const LoginButton = ({ icon, name, onClick, color }) => (
            <div className="field">
              <p className={`control button is-medium ${color}`} style={{ width: '300px' }} onClick={onClick}>
                <span className="icon">
                <FontAwesomeIcon icon={['fab', icon]} />
                </span>
                <span>{`Sign in with ${name}`}</span>
              </p>
            </div>
          );
        if (isAuthenticated) {
            return <Redirect to="/" />;
        } else {
            return (
                <React.Fragment>
                    <section className="hero is-primary">
                        <div className="hero-body">
                            <div className="container has-text-centered">
                                <h1 className="title">
                                    Skilltree
                                </h1>
                                <h2 className="subtitle">
                                    {this.props.onCompositionPage ? 'You need to sign in to view this skilltree'
                                    : 'Sign in to create awesome skilltrees'}
                                </h2>
                            </div>
                        </div>
                    </section>
                    <section className="section">
                    <div className="has-text-centered">
                    <LoginButton icon="google" name="Google" onClick={this.handleLoginWithGoogle} color="is-danger" />
                    <LoginButton icon="microsoft" name="Microsoft" onClick={this.handleLoginWithMicrosoft} color="is-info" />
                    </div>

                    <div className="has-text-centered" style={{ margin: '10px 0' }}>
                    <hr style={hrStyle}/>
                    <span style={{ verticalAlign: 'middle', padding: '0 10px' }}>OR</span>
                    <hr style={hrStyle}/>
                    </div>
                        <div className="container has-text-centered box" style={{ maxWidth: '350px' }}>
                            <div className="field">
                                <label className="label" htmlFor="email">Email</label>
                                <div className="control">
                                    <input className="input" name="email" type="email" placeholder="email" required onChange={this.handleEmailChange} />
                                </div>
                            </div>

                            <div className="field">
                                <label className="label" htmlFor="password">Password</label>
                                <div className="control">
                                    <input className="input" name="password" type="password" placeholder="password" required onChange={this.handlePasswordChange} />
                                </div>
                            </div>
                            
                            <div className="field">
                                <div className="control buttons is-centered">
                                    <input className="button is-medium is-primary is-fullwidth" type="button" value="Sign In" onClick={this.handleSubmit} />
                                </div>
                            </div>
                            <Link to="/register">Click here to create an account</Link>
                        </div>
                        
                    </section>
                </React.Fragment>
            );
        }
    }
}

function mapStateToProps(state) {
    return {
        isLoggingIn: state.auth.isLoggingIn,
        isAuthenticated: state.auth.isAuthenticated
    }
};

export default (connect(mapStateToProps)(Login));