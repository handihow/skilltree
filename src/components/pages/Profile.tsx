import React, { Component } from 'react'
import { connect } from "react-redux";
import { Link } from 'react-router-dom';

interface IProfileProps {
    isAuthenticated: boolean;
    user: any;
}


export class Profile extends Component<IProfileProps> {
    constructor(props: IProfileProps) {
        super(props);
        this.state = {}
    }
    
    render() {
        return (
            
            <div className="card" style={{margin: 'auto', maxWidth: '600px', marginTop: '20px'}}>
            <div className="card-content">
                <div className="media">
                <div className="media-left">
                    <figure className="image is-64x64 is-rounded">
                    <img alt="" 
                    src={this.props.user?.photoURL ? 
                        this.props.user.photoURL :
                        `https://eu.ui-avatars.com/api/?name=${this.props.user.displayName}`}/>
                    </figure>
                </div>
                <div className="media-content">
                    <p className="title is-4">{this.props.user?.displayName}</p>
                    <p className="subtitle is-6">{this.props.user?.email}</p>
                </div>
                </div>
                <div className="content">
                <p>
                    If you contact the service desk, please note that your unique user reference is: 
                </p>
                <p><strong>{this.props.user?.uid}</strong></p>
                <hr></hr>
                <p>User record created: {this.props.user?.metadata?.creationTime}</p>
                <p>Last sign in: {this.props.user?.metadata?.lastSignInTime}</p>
                </div>
            </div>
            <footer className="card-footer">
                <Link to="/profile/edit"  className="card-footer-item">Edit</Link>
                <Link to="/profile/delete" className="card-footer-item">Delete</Link>
            </footer>
            </div>

        )
    }
}

function mapStateToProps(state) {
    return {
      isAuthenticated: state.auth.isAuthenticated,
      user: state.auth.user
    };
  }


export default connect(mapStateToProps)(Profile)
