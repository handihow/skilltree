import React, { Component } from 'react'
import {standardData, standardTheme} from '../../services/StandardData';
import IComposition from '../../models/composition.model';

interface IAddCompositionProps {
    addComposition: Function;
    isEditingTitle: boolean;
    isHidden: boolean;
    composition?: IComposition;
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
        } else if(!prevProps.isHidden && this.props.isHidden){
            this.setState({
                title: ''
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
                <section className="modal-card-body">
                    
                    <input 
                        className="input" 
                        type="text" 
                        placeholder="Title new SkillTree..."
                        value={this.state.title}
                        onChange={this.onChange} />
                        
                </section>
                <footer className="modal-card-foot">
                  <button className="is-primary button">Save</button>
                </footer>
            </form>
        )
    }
}

export default AddComposition
