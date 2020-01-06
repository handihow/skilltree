import React, { Component } from 'react'
import PropTypes from 'prop-types';
import {standardData} from '../compositions/StandardData';
import uuid from 'uuid';

export class  SkillForm extends Component {

    state = { 
        skill: null
    };

    componentDidMount(){
        this.setState({
            skill: this.props.skilltree
        })
    }

    handleChange = ({ target }) => {
        this.setState({
            skill: {
                ...this.state.skill,
                [target.name]: target.type === 'checkbox' ? target.checked : target.value
            }
        });
    };

    onSubmit = (e) => {
        e.preventDefault();
        this.props.updateSkill(this.state.skill);
    }

    render(){
        return (
            <div className="modal is-active">
            <div className="modal-background"></div>
            <div className="modal-card">
                <header className="modal-card-head">
                <p className="modal-card-title">{this.props.isEditing ? 'Edit skill' : 'Add skill'}</p>
                <button className="delete" aria-label="close" onClick={this.props.closeModal}></button>
                </header>
                <form onSubmit={this.onSubmit}>
                <section className="modal-card-body">
                    <div className="field">
                        <label className="label" htmlFor="title">Title</label>
                        <div className="control">
                            <input className="input" 
                            name="title" type="text" placeholder="title" required 
                            onChange={this.handleChange}
                            value={this.state.skilltree ? this.state.skilltree.title : ''} />
                        </div>
                    </div>
                    <div className="field">
                        <label className="label" htmlFor="description">Description</label>
                        <div className="control">
                            <input className="input" 
                            name="description" type="text" placeholder="description" required 
                            onChange={this.handleChange}
                            value={this.state.skilltree ? this.state.skilltree.description : ''} />
                        </div>
                    </div>
                    <div className="field">
                    <label className="checkbox" htmlFor="collapsible">
                        <input type="checkbox" name="collapsible" onChange={this.handleChange}
                        checked={this.state.skilltree ? this.state.skilltree.collapsible : true} />
                        <span style={{marginLeft: "10px"}}>Collapsible</span>
                    </label>
                    </div>
                </section>
                <footer className="modal-card-foot">
                <button className="button is-success">Save changes</button>
                <button className="button" type="button" onClick={this.props.closeModal}>Cancel</button>
                </footer>
                </form>
            </div>
            </div>
        )
    }
}

SkillForm.propTypes = {
    skill: PropTypes.object,
    skills: PropTypes.array.isRequired,
    isEditing: PropTypes.bool.isRequired,
    updateSkill: PropTypes.func.isRequired,
    closeModal: PropTypes.func.isRequired
};

export default SkillForm