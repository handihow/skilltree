import React, { Component } from 'react'
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {storage} from '../../firebase/firebase';

export class CompositionItem extends Component {

    state = {
        isActive: false,
        thumbnail: 'https://via.placeholder.com/128x128.png?text=Skilltree'
    };

    componentDidMount(){
        if(this.props.composition.hasBackgroundImage){
            const storageRef = storage.ref();
            const imageRef = storageRef.child(this.props.composition.thumbnailImage);
            imageRef.getDownloadURL()
            .then(url => {
                this.setState({thumbnail: url});
            });
        }
        
    }

    toggleIsActive = () =>{
        this.setState({
            isActive: !this.state.isActive
        });
    }
    
    render() {
        const { id, title, username } = this.props.composition;
        return (
            <div className="box">
            <div className="media">
            <div className="media-left">
                <p className="image is-64x64">
                <img className="is-rounded" src={this.state.thumbnail}></img>
                </p>
            </div>
            <div className="media-content">
                <div className="content">
                <p>
        <strong>{title}</strong> <small>{username}</small>
                </p>
                </div>
                <nav className="level is-mobile">
                <div className="level-left">
                    <Link to={"/compositions/"+id} className="level-item">
                    <span className="icon is-small"><FontAwesomeIcon icon='edit' /></span>
                    </Link>
                    <Link to={"/compositions/"+id+"/view"} className="level-item">
                    <span className="icon is-small"><FontAwesomeIcon icon='eye' /></span>
                    </Link>
                </div>
                </nav>
            </div>
            <div className="media-right">
            <button className="delete" onClick={this.toggleIsActive}></button>
            </div>
            </div>
            <div className={`modal ${this.state.isActive ? "is-active" : ""}`}>
                <div className="modal-background"></div>
                <div className="modal-card">
                <header className="modal-card-head">
                    <p className="modal-card-title">Are you sure?</p>
                    <button className="delete" aria-label="close" onClick={this.toggleIsActive}></button>
                </header>
                <section className="modal-card-body">
                    You are about to delete skill tree page {title}. Do you want to delete?
                </section>
                <footer className="modal-card-foot">
                    <button className="button is-danger" onClick={this.props.delComposition.bind(this, id)}>Delete</button>
                    <button className="button" onClick={this.toggleIsActive}>Cancel</button>
                </footer>
                </div>
            </div>
            </div>
        )
    }
}

// Proptypes
CompositionItem.propTypes = {
    composition: PropTypes.object.isRequired
}

export default CompositionItem
