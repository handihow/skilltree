import React, { Component } from 'react'
import { connect } from "react-redux";
import { toast } from 'react-toastify';
import { logoutUser } from "../../actions";
import {v4 as uuid} from "uuid"; 
import { functions } from '../../firebase/firebase';
import { Redirect } from 'react-router-dom';

interface IEditProfileProps {
    isAuthenticated: boolean;
    user: any;
    dispatch: any;
}

interface IEditProfileState {
    displayName: string;
    email: string;
    password: string;
    repeatPassword: string;
    toProfilePage: boolean;
}


export class EditProfile extends Component<IEditProfileProps, IEditProfileState> {
    constructor(props: IEditProfileProps) {
        super(props);
        this.state = { 
            displayName: props.user.displayName ? props.user.displayName : '', 
            email: props.user.email ? props.user.email : '', 
            password: "", 
            repeatPassword: "",
            toProfilePage: false
        };
    }

    handleDisplayNameChange = ({ target }) => {
        this.setState({ displayName: target.value });
    };
    
    handleEmailChange = ({ target }) => {
        this.setState({ email: target.value });
    };

    handlePasswordChange = ({ target }) => {
        this.setState({ password: target.value });
    };

    handleRepeatPasswordChange = ({ target }) => {
        this.setState({ repeatPassword: target.value });
    };

    backToProfile = () => {
        this.setState({
            toProfilePage: true
        })
    }

    handleSubmit = () => {
        const { displayName, email, password, repeatPassword } = this.state;
        const currentComponent = this;
        //form validation
        if( displayName === '' ){
            return toast.error('Full name is required')
        } else if(email === ''){
            return toast.error('Email is required')
        } else if(password.length < 8){
            return toast.error('Password must have minimum 8 characters')
        } else if(repeatPassword !== password){
            return toast.error('Passwords do not match');
        }
        const toastId = uuid();
        toast.info('Update of user record in progress... please wait', {
        toastId: toastId,
        autoClose: 10000
        });
        const editUser = functions.httpsCallable('editUser');
        editUser({
            email: email,
            displayName: displayName,
            password: password
        })
        .then(function(result) {
            if(result.data.error){
                toast.update(toastId, {
                    render: result.data.error,
                    type: toast.TYPE.ERROR,
                    autoClose: 5000
                });
            } else {
                toast.update(toastId, {
                render: result.data.result,
                autoClose: 3000
                });
                const { dispatch } = currentComponent.props;
                dispatch(logoutUser());
            }
        })
        .catch(function(error) {
        toast.update(toastId, {
            render: error.message,
            type: toast.TYPE.ERROR,
            autoClose: 5000
        });
        });
    
    };
    
    render() {
        if(this.state.toProfilePage){
            return <Redirect to="/profile" />
        } else {
            return (
                <React.Fragment>
                    <section className="hero is-primary">
                        <div className="hero-body">
                            <div className="container has-text-centered">
                                <h1 className="title">
                                Edit your account
                                </h1>
                                <h2 className="subtitle">
                                     You must log in with new credentials after updating your account
                                </h2>
                            </div>
                        </div>
                    </section>
                    <section className="section">
                        <div className="container has-text-centered box" style={{ maxWidth: '350px' }}>
                            <div className="field">
                                <label className="label" htmlFor="displayName">Full name</label>
                                <div className="control">
                                    <input className="input" name="displayName" type="text" 
                                    value={this.state.displayName}
                                    placeholder="full name" required onChange={this.handleDisplayNameChange} />
                                </div>
                            </div>
        
                            <div className="field">
                                <label className="label" htmlFor="email">Email</label>
                                <div className="control">
                                    <input className="input" name="email" type="email" placeholder="email" 
                                    value={this.state.email}
                                    required onChange={this.handleEmailChange} />
                                </div>
                            </div>
        
                            <div className="field">
                                <label className="label" htmlFor="password">Password</label>
                                <div className="control">
                                    <input className="input" name="password" type="password" placeholder="password" required onChange={this.handlePasswordChange} />
                                </div>
                            </div>
        
                            <div className="field">
                                <label className="label" htmlFor="repeatPassword">Repeat Password</label>
                                <div className="control">
                                    <input className="input" name="repeatPassword" type="password" placeholder="repeat password" required onChange={this.handleRepeatPasswordChange} />
                                </div>
                            </div>
                            
                            <div className="field">
                                <div className="control buttons is-centered">
                                    <input className="button is-primary" 
                                    type="button" value="Update account" onClick={this.handleSubmit} />
                                    <button className="button" onClick={this.backToProfile}>Cancel</button>
                                </div>
                            </div>
                        </div>
                    </section>
                </React.Fragment>
            )
        }
        
    }
}

function mapStateToProps(state) {
    return {
      isAuthenticated: state.auth.isAuthenticated,
      user: state.auth.user
    };
  }


export default connect(mapStateToProps)(EditProfile)
