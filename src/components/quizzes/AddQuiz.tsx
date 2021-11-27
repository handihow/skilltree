import React, { Component } from 'react'
import IQuiz from '../../models/quiz.model';
import { toast } from "react-toastify";

interface IAddQuizProps {
    addQuiz: Function;
    isEditingTitle: boolean;
    isHidden: boolean;
    quiz?: IQuiz;
    updateQuizTitle: Function;
}

interface IAddQuizState {
    title: string;
}

export class AddQuiz extends Component<IAddQuizProps, IAddQuizState> {

    constructor(props: IAddQuizProps){
        super(props);
        this.state = {
            title: ''
        }
    }

    componentDidUpdate(prevProps) {
        if (!prevProps.isEditingTitle && this.props.isEditingTitle) {
            this.setState({
                title: this.props.quiz?.title || '',
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
        if(this.state.title.length === 0){
            toast.error("Please enter a title");
        } else if(this.props.isEditingTitle) {
            this.props.updateQuizTitle(this.state.title);
        } else {
            this.props.addQuiz(this.state.title);
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
                        placeholder="Title New Quiz..."
                        autoFocus
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

export default AddQuiz
