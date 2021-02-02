import React, { Component } from 'react'
import {v4 as uuid} from "uuid"; 
import ISkilltree from '../../../models/skilltree.model';

interface ISkilltreeFormProps {
    skilltree?: ISkilltree;
    isEditing: boolean;
    closeModal: Function;
    updateSkilltree: Function;
    compositionId: string;
    order: number;
}

interface ISkilltreeFormState {
    title: string;
    description: string;
    moreOptions: boolean;
    root: string;
    collapsible: boolean;
}

export class SkilltreeForm extends Component<ISkilltreeFormProps,ISkilltreeFormState> {
    constructor(props: ISkilltreeFormProps){
        super(props);
        this.state = {
            title: '',
            description: '',
            root: '',
            moreOptions: false,
            collapsible: true
        }
    }

    componentDidMount(){
        if(this.props.isEditing){
            this.setState({
                title: this.props.skilltree?.title || '',
                description: this.props.skilltree?.description || '',
                collapsible: this.props.skilltree?.collapsible ? true : false
            })
        }
    }

    handleTitleChange = ({ target }) => {
        this.setState({
            title: target.value
        })
    }

    handleDescriptionChange = ({ target }) => {
        this.setState({
            description: target.value
        })
    }

    handleCollapsibleChange = ({ target }) => {
        this.setState({
            collapsible: target.checked ? true : false
        })
    }

    handleRootSkillTitleChange = ({ target }) => {
        this.setState({
            root: target.value
        });
    };

    onSubmit = (e: any) => {
        e.preventDefault();
        const skilltree : ISkilltree = {
            id: this.props.skilltree?.id || uuid(),
            title: this.state.title,
            description: this.state.description,
            collapsible: this.state.collapsible,
            order: this.props.order
        }
        this.props.updateSkilltree(skilltree, this.state.root);
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
                            onChange={this.handleTitleChange}
                            value={this.state.title} />
                        </div>
                    </div>
                    <div className="field">
                        <label className="label" htmlFor="description">Description</label>
                        <div className="control">
                            <input className="input" 
                            name="description" type="text" placeholder="description" required 
                            onChange={this.handleDescriptionChange}
                            value={this.state.description} />
                        </div>
                    </div>
                    {!this.props.isEditing && 
                        <div className="field">
                        <label className="label" htmlFor="root">Root skill</label>
                        <div className="control">
                            <input className="input" 
                            placeholder="Enter the title of the root skill in this skilltree"
                            name="root" type="text" 
                            required
                            onChange={this.handleRootSkillTitleChange}
                            value={this.state.root} />
                        </div>
                    </div>}
                    {this.state.moreOptions && <div className="columns">
                        <div className="column is-narrow">
                        <div className="field">
                        <label className="checkbox" htmlFor="collapsible">
                            <input type="checkbox" name="collapsible" onChange={this.handleCollapsibleChange}
                            checked={this.state.collapsible} />
                            <span style={{marginLeft: "10px"}}>Collapsible</span>
                        </label>
                        </div>
                        </div>
                    </div>}
                </section>
                <footer className="modal-card-foot">
                <button className="button is-success">Save changes</button>
                <button className="button" type="button" onClick={this.toggleOptions}>
                    {this.state.moreOptions ? 'Less options' : 'More options'}
                </button>
                <button className="button is-danger" type="button" onClick={() =>this.props.closeModal()}>
                    Cancel
                </button>
                </footer>
                </form>
            </div>
            </div>
        )
    }
}

export default SkilltreeForm