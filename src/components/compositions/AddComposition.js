import React, { Component } from 'react'
import {standardData, standardTheme} from './StandardData';

export class AddComposition extends Component {

    state = {
        title: ''
    }

    onChange = (e) => this.setState({title: e.target.value});

    onSubmit = (e) => {
        e.preventDefault();
        this.props.addComposition(this.state.title, standardTheme, standardData);
        this.setState({title: ''});
    }

    render() {
        return (
            <form onSubmit={this.onSubmit}>
                <div className="field is-fullwidth has-addons">
                <div className="control">
                <input 
                    className="input" 
                    type="text" 
                    placeholder="Title of skill tree..."
                    value={this.state.title}
                    onChange={this.onChange} />
                </div>
                <p className="control">
                    <button className="button">
                    Submit
                    </button>
                </p>
                </div>
            </form>
        )
    }
}

export default AddComposition
