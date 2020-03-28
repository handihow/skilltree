import React, { Component } from 'react'
import {v4 as uuid} from "uuid"; 
import ISkilltree from '../../models/skilltree.model';

interface ISkilltreeFormProps {
    skilltree: any;
    isEditing: boolean;
    updateSkilltree: Function;
    closeModal: Function;
    order: number;
}

interface ISkilltreeFormState {
    doneLoading: boolean;
    skilltree?: ISkilltree;
    moreOptions: boolean;
}

export class SkilltreeForm extends Component<ISkilltreeFormProps,ISkilltreeFormState> {
    constructor(props: ISkilltreeFormProps){
        super(props);
        this.state = {
            doneLoading: false,
            moreOptions: false
        }
    }

    componentDidMount(){
        if(this.props.isEditing){
            this.setState({
                skilltree: this.props.skilltree,
                doneLoading: true
            })
        } else {
            this.setState({
                skilltree: {
                    collapsible: true,
                    description: '',
                    title: '',
                    id: uuid(),
                    order: this.props.order
                },
                doneLoading: true
            })
        }
    }

    handleChange = ({ target }) => {
        let newValue;
        if(target.type === 'checkbox'){
            newValue = target.checked 
        } else if(target.type === 'number' && target.value){
            newValue = parseInt(target.value)
        } else {
            newValue = target.value
        }
        if(this.state.skilltree){
            this.setState({
                skilltree: {
                    ...this.state.skilltree,
                    [target.name]: newValue
                }
            });
        }
    };

    onSubmit = (e: any) => {
        e.preventDefault();
        this.props.updateSkilltree(this.state.skilltree);
    }

    toggleOptions = () => {
        this.setState({
            moreOptions: !this.state.moreOptions
        })
    }

    render(){
        return (
            <div className="modal is-active">
            <div className="modal-background"></div>
            <div className="modal-card">
                <header className="modal-card-head">
                <p className="modal-card-title">{this.props.isEditing ? 'Edit skilltree' : 'Add skilltree'}</p>
                <button className="delete" aria-label="close" onClick={() =>this.props.closeModal()}></button>
                </header>
                <form onSubmit={this.onSubmit}>
                <section className="modal-card-body">
                    <div className="field">
                        <label className="label" htmlFor="title">Title</label>
                        <div className="control">
                            <input className="input" 
                            name="title" type="text" placeholder="title" required 
                            onChange={this.handleChange}
                            value={this.state.doneLoading && this.state.skilltree ? this.state.skilltree.title : ''} />
                        </div>
                    </div>
                    <div className="field">
                        <label className="label" htmlFor="description">Description</label>
                        <div className="control">
                            <input className="input" 
                            name="description" type="text" placeholder="description" required 
                            onChange={this.handleChange}
                            value={this.state.doneLoading && this.state.skilltree ? this.state.skilltree.description : ''} />
                        </div>
                    </div>
                    {this.state.moreOptions && <div className="columns">
                        <div className="column is-narrow">
                        <div className="field">
                        <label className="checkbox" htmlFor="collapsible">
                            <input type="checkbox" name="collapsible" onChange={this.handleChange}
                            checked={this.state.doneLoading && this.state.skilltree ? this.state.skilltree.collapsible : true} />
                            <span style={{marginLeft: "10px"}}>Collapsible</span>
                        </label>
                        </div>
                        </div>
                        <div className="column is-narrow">
                            <div className="field">
                            <label className="label" htmlFor="order">Order</label>
                            <div className="control">
                                <input className="input" 
                                name="order" type="number" required 
                                onChange={this.handleChange}
                                value={this.state.doneLoading && this.state.skilltree ? this.state.skilltree.order : 0} />
                            </div>
                        </div>
                        </div>
                    </div>}
                </section>
                <footer className="modal-card-foot">
                <button className="button is-success">Save changes</button>
                <button className="button" type="button" onClick={this.toggleOptions}>
                    {this.state.moreOptions ? 'Less options' : 'More options'}
                </button>
                <button className="button" type="button" onClick={() =>this.props.closeModal()}>Cancel</button>
                </footer>
                </form>
            </div>
            </div>
        )
    }
}

export default SkilltreeForm