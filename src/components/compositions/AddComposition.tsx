import React, { Component } from 'react'
import {standardData, standardTheme} from './StandardData';
import ICompostion from '../../models/composition.model';

interface IAddCompositionProps {
    addComposition: Function;
    isEditingTitle: boolean;
    composition?: ICompostion;
    updateCompositionTitle: Function;
}

interface IAddCompositionState {
    title: string;
}

export class AddComposition extends Component<IAddCompositionProps, IAddCompositionState> {

    constructor(props: IAddCompositionProps){
        super(props);
        this.state = {
            title: ''
        }
    }

    componentDidUpdate(prevProps) {
        if (!prevProps.isEditingTitle && this.props.isEditingTitle) {
            this.setState({
                title: this.props.composition?.title || '',
            })
        }
    }
    
    onChange = (e) => this.setState({title: e.target.value});

    onSubmit = (e) => {
        e.preventDefault();
        if(this.props.isEditingTitle) {
            this.props.updateCompositionTitle(this.state.title);
        } else {
            this.props.addComposition(this.state.title, standardTheme, standardData);
        }
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
                    placeholder="Title new SkillTree..."
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
