import React, { Component } from 'react'
import { connect } from "react-redux";
import { toast } from 'react-toastify';
import { logoutUser } from "../../actions";
import {v4 as uuid} from "uuid"; 
import { functions } from '../../firebase/firebase';
import { Redirect } from 'react-router-dom';

interface IDeleteProfileProps {
    isAuthenticated: boolean;
    user: any;
    dispatch: any;
}

interface IDeleteProfileState {
    toProfilePage: boolean;
}


export class DeleteProfile extends Component<IDeleteProfileProps, IDeleteProfileState> {
    constructor(props: IDeleteProfileProps) {
        super(props);
        this.state = { 
            toProfilePage: false
        };
    }

    backToProfile = () => {
        this.setState({
            toProfilePage: true
        })
    }

    deleteAccount = () => {
        const currentComponent = this;
        const toastId = uuid();
        toast.info('Deleting of user record in progress... please wait', {
        toastId: toastId,
        autoClose: 10000
        });
        const deleteUser = functions.httpsCallable('deleteUser');
        deleteUser({})
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
                <section className="hero is-primary">
                    <div className="hero-body">
                        <div className="container has-text-centered">
                            <h1 className="title">
                            Delete your account
                            </h1>
                            <h2 className="subtitle">
                            Your account will be deleted and all your data will be removed permanently
                            </h2>
                            <div className="buttons is-centered">
                            <button className="button is-danger"
                                onClick={this.deleteAccount}>Delete Permanently</button>
                            <button className="button"
                                onClick={this.backToProfile}>Cancel</button>
                            </div>
                        </div>
                    </div>
                </section>
                    
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


export default connect(mapStateToProps)(DeleteProfile)
