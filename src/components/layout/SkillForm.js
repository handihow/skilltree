import React, { Component } from 'react'
import PropTypes from 'prop-types';
import uuid from 'uuid';
import update from 'react-addons-update'; // ES6
import {isURL, isEmpty} from 'validator';
import { toast } from 'react-toastify';

export class  SkillForm extends Component {

    state = {
        title: '',
        description: '',
        links: [],
        optional: false,
        direction: 'top'
    };

    componentDidMount(){
        console.log('mounting skill form');
        this.setState({
            title: this.props.isEditing ? this.props.skill.title : '',
            description: this.props.isEditing ? this.props.skill.description : '',
            links: this.props.isEditing ? this.props.skill.links : [],
            optional: this.props.isEditing ? this.props.skill.optional ? this.props.skill.optional : false  : false,
            direction: this.props.isEditing ? this.props.skill.direction ? this.props.skill.direction : 'top' : 'top'
        });
    }

    addLink = () => {
        this.setState({
            links: [...this.state.links, {id: this.state.links.length, reference: '', title: '', icon: ''}]
        })
    }

    removeLink = (index) => {
        this.setState({
            links: [...this.state.links.filter((link, i) => {return index !==i})]
        })
    }

    handleChange = ({ target }) => {
        this.setState({
            [target.name] : target.value
        });
    };

    handleOptionalChange = ({target}) => {
        this.setState({
            optional: target.value === 'true' ? true : false
        })
    }

    onSubmit = (e) => {
        e.preventDefault();
        // form validation
        let hasError = false;
        if(isEmpty(this.state.title) || isEmpty(this.state.description) ){
            toast.error('Title and description cannot be empty');
            hasError = true;
        } else if(this.state.links.length > 0){
            this.state.links.forEach((link, index) => {
                if(isEmpty(link.title) || isEmpty(link.icon) || !isURL(link.reference)){
                    toast.error('Link number ' + (index + 1) + ' does not have title or icon, or does not contain a valid URL');
                    hasError = true;
                }
            })
        } 
        if(!hasError) {
            this.props.updateSkill({
                ...this.props.skill,
                description: this.state.description,
                title: this.state.title,
                links: this.state.links,
                optional: this.state.optional,
                direction: this.state.direction
            });
        }
    }

    changeLink = (changeEvent) => {
        const linkTarget = changeEvent.target.name.split('/');
        const linkName = linkTarget[0]
        const linkIndex = linkTarget[1];
        this.setState({
            links: update(this.state.links, {[linkIndex]: {[linkName]: {$set: changeEvent.target.value}}})
        })
    }

    render(){
        return (
            <form className="box" onSubmit={this.onSubmit}>
                <div className="field">
                    <label className="label" htmlFor="title">Title</label>
                    <div className="control">
                        <input className="input" 
                        name="title" type="text" placeholder="title" required 
                        onChange={this.handleChange}
                        value={this.state.title} />
                    </div>
                </div>
                <div className="field-group">
                <div className="field is-inline-block-desktop">
                    <div className="field is-narrow">
                        <label className="label">
                            Optional skill
                        </label>
                        <div className="control">
                        <label className="radio">
                            <input type="radio" name="optional" value={false}
                                checked={!this.state.optional}
                                onChange={this.handleOptionalChange} />
                            <span style={{marginLeft: "5px"}}>Not optional</span>
                        </label>
                        <label className="radio">
                            <input type="radio" name="optional" value={true}
                                checked={this.state.optional}
                                onChange={this.handleOptionalChange} />
                            <span style={{marginLeft: "5px"}}>Optional</span>
                        </label>
                        </div>
                    </div>
                </div>
                <div className="field is-inline-block-desktop" style={{marginLeft: "20px"}}>
                    <div className="field is-narrow">
                        <label className="label">
                            Tooltip direction
                        </label>
                        <div className="control">
                        {['top', 'left', 'right', 'bottom'].map((direction) => (
                            <label className="radio" key={direction}>
                                <input type="radio" name="direction" value={direction}
                                    checked={this.state.direction === direction}
                                    onChange={this.handleChange} />
                                <span style={{marginLeft: "5px"}}>{direction}</span>
                            </label>
                        ))}
                        </div>
                    </div>
                </div>
                </div>
                <div className="field">
                    <label className="label" htmlFor="description">Description</label>
                    <div className="control">
                        <textarea className="textarea" 
                        name="description" type="text" placeholder="description" required 
                        onChange={this.handleChange}
                        value={this.state.description} />
                    </div>
                </div>
                {this.state.links.length > 0 && this.state.links.map((link, index)=> (
                    <React.Fragment key={link.id}>
                    <div className="field is-horizontal">
                        <div className="field-label">
                        <label className="label">Link type?</label>
                        </div>
                        <div className="field-body">
                        <div className="field is-narrow">
                            <div className="control">
                            <label className="radio">
                                <input type="radio" name={`icon/${index}`} value='youtube' 
                                    checked={this.state.links[index].icon === 'youtube'}
                                    onChange={this.changeLink} />
                                <span style={{marginLeft: "5px"}}>YouTube</span>
                            </label>
                            <label className="radio">
                                <input type="radio" name={`icon/${index}`} value='file'
                                checked={this.state.links[index].icon === 'file'}
                                onChange={this.changeLink}/>
                                <span style={{marginLeft: "5px"}}>File</span>
                            </label>
                            <label className="radio">
                                <input type="radio" name={`icon/${index}`} value='link'
                                checked={this.state.links[index].icon === 'link'}
                                onChange={this.changeLink}/>
                                <span style={{marginLeft: "5px"}}>URL</span>
                            </label>
                            </div>
                        </div>
                        </div>
                    </div>
                    <div className="field is-horizontal">
                        <div className="field-label">
                        <label className="label">Link</label>
                        </div>
                        <div className="field-body">
                            <div className="field is-inline-block">
                                <div className="control">
                                    <input className="input" type="text" placeholder="title will display on the link"
                                        name={`title/${index}`} value={this.state.links[index].title}
                                        onChange={this.changeLink}
                                    />
                                </div>
                            </div>
                            <div className="field is-inline-block">
                                <div className="control">
                                    <input className="input" type="text" placeholder="url to the video or file or link"
                                        name={`reference/${index}`} value={this.state.links[index].reference}
                                        onChange={this.changeLink}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="field is-horizontal">
                    <div className="field-label">
                    </div>
                    <div className="field-body">
                        <div className="field">
                        <div className="control">
                            <button type="button" className="button is-danger is-small"
                                onClick={() => this.removeLink(index)}>
                            Remove link
                            </button>
                        </div>
                        </div>
                    </div>
                    </div>
                    </React.Fragment>
                ))}
                <div className="buttons">
                <button className="button is-info" type="button" onClick={this.addLink}>Add Link</button>
                <button className="button is-success">Save changes</button>
                <button className="button" type="button" onClick={this.props.closeModal}>Cancel</button>
                </div>
            </form>
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