import React, { Component } from 'react'
import PropTypes from 'prop-types';

export class SkilltreeCard extends Component {

    state = {
        isActive: false
    };

    editSkilltree = () => {
        this.props.editSkilltree(this.props.skilltree);
    }

    deleteSkilltree = () => {
        this.props.deleteSkilltree(this.props.skilltree);
    }

    toggleIsActive = () =>{
        this.setState({
            isActive: !this.state.isActive
        });
    }

    render() {
        return (
            <div className="column is-one-third-desktop is-one-half-tablet">
            <div className="card">
                <header className="card-header">
                <p className="card-header-title">
                    {this.props.skilltree.title}
                </p>
                </header>
                <div className="card-content">
                <div className="content">
                    {this.props.skilltree.description}
                    <br></br>
                    <small>{this.props.skilltree.collapsible ? 'Collapsible' : 'Not collapsible'}</small>
                </div>
                </div>
                <footer className="card-footer">
                <a className="card-footer-item" onClick={this.editSkilltree}>Edit</a>
                <a className="card-footer-item" onClick={this.toggleIsActive}>Delete</a>
                </footer>
            </div>
            <div className={`modal ${this.state.isActive ? "is-active" : ""}`}>
                <div className="modal-background"></div>
                <div className="modal-card">
                <header className="modal-card-head">
                    <p className="modal-card-title">Are you sure?</p>
                    <button className="delete" aria-label="close" onClick={this.toggleIsActive}></button>
                </header>
                <section className="modal-card-body">
                    You are about to delete skill tree {this.props.skilltree.title}. Do you want to delete?
                </section>
                <footer className="modal-card-foot">
                    <button className="button is-danger" onClick={this.deleteSkilltree}>Delete</button>
                    <button className="button" onClick={this.toggleIsActive}>Cancel</button>
                </footer>
                </div>
            </div>
            </div>
        )
    }
}

SkilltreeCard.propTypes = {
    skilltree: PropTypes.object.isRequired,
    editSkilltree: PropTypes.func.isRequired,
    deleteSkilltree: PropTypes.func.isRequired
};

export default SkilltreeCard
