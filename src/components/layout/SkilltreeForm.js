import React, { Component } from 'react'
import PropTypes from 'prop-types';
import {standardData} from '../compositions/StandardData';
import uuid from 'uuid';

export class  SkilltreeForm extends Component {

    state = { 
        skilltree: null
    };

    componentDidMount(){
        if(this.props.isEditing){
            this.setState({
                skilltree: this.props.skilltree
            })
        } else {
            this.setState({
                skilltree: {
                    collapsible: true,
                    data: standardData,
                    description: '',
                    title: '',
                    id: uuid.v4(),
                    order: this.props.order
                }
            })
        }
    }

    handleChange = ({ target }) => {
        this.setState({
            skilltree: {
                ...this.state.skilltree,
                [target.name]: target.type === 'checkbox' ? target.checked : target.value
            }
        });
    };

    onSubmit = (e) => {
        e.preventDefault();
        this.props.updateSkilltree(this.state.skilltree);
        this.setState({skilltree: null});
    }

    render(){
        return (
            <div className="modal is-active">
            <div className="modal-background"></div>
            <div className="modal-card">
                <header className="modal-card-head">
                <p className="modal-card-title">{this.props.isEditing ? 'Edit skilltree' : 'Add skilltree'}</p>
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

SkilltreeForm.propTypes = {
    skilltree: PropTypes.object,
    isEditing: PropTypes.bool.isRequired,
    updateSkilltree: PropTypes.func.isRequired,
    closeModal: PropTypes.func.isRequired,
    order: PropTypes.number.isRequired
};

export default SkilltreeForm