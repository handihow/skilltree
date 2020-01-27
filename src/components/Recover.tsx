import React, { Component } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { isEmail } from 'validator';
import { myFirebase } from '../firebase/firebase';
import { toast } from 'react-toastify';
import {Redirect} from 'react-router-dom';

interface IRecoverState {
    email: string;
    hasValidEmail: boolean;
    toLogin: boolean;
}

export class Recover extends Component<{}, IRecoverState> {
    
    constructor(props){
        super(props);
        this.state = { 
            email: "", 
            hasValidEmail: false, 
            toLogin: false 
        };
    }

    handleEmailChange = ({ target }) => {
        this.setState({ 
            email: target.value,
            hasValidEmail: isEmail(target.value)
        });
    };

    onClick = () => {
        myFirebase
        .auth().sendPasswordResetEmail(this.state.email)
        .then( _ => {
            toast.info('Password recovery email sent. Please check your inbox');
            this.setState({
                toLogin: true
            })
        })
        .catch( err => {
            toast.error('Could not send password recovery email : ' + err.message);
        })
    }
    
    render() {
        return (
            this.state.toLogin ? <Redirect to="/login" /> :
            <React.Fragment>
            <section className="hero is-primary">
                <div className="hero-body">
                    <div className="container has-text-centered">
                        <h1 className="title">
                            Recover password
                        </h1>
                        <h2 className="subtitle">
                            Set a new password. Enter your email address below.
                        </h2>
                    </div>
                </div>
            </section>
            <section className="section">
                <div className="container has-text-centered box" style={{ maxWidth: '350px' }}>
                    <div className="field">
                        <label className="label" htmlFor="email">Email</label>
                        <div className="control">
                            <input className="input" name="email" type="email" placeholder="email" required onChange={this.handleEmailChange} />
                        </div>
                    </div>

                    <div className="field">
                    <div className="field">
                    <button className='control button is-medium is-primary' style={{ width: '300px' }} 
                        disabled={!this.state.hasValidEmail}
                        onClick={this.onClick}>
                        <span className="icon">
                        <FontAwesomeIcon icon='envelope-open-text' />
                        </span>
                        <span>Send recovery email</span>
                    </button>
                    </div>
                    </div>
                </div>
                
            </section>
        </React.Fragment>
        )
    }
}

export default Recover
