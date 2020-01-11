import React, { Component } from 'react'
import {isURL, isEmpty} from 'validator';
import { toast } from 'react-toastify';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import LinkCard from './LinkCard';
import ISkill from '../../models/skill.model';

interface ISkillFormProps {
    skill: ISkill;
    skills: ISkill[];
    isEditing: boolean;
    updateSkill: Function;
    closeModal: Function;
}

interface ISkillFormState{
    skill?: ISkill,
    openLinkModal?: boolean;
    openYouTubeModal?: boolean;
    openFileModal?: boolean;
}

export class  SkillForm extends Component<ISkillFormProps, ISkillFormState> {

    constructor(props: ISkillFormProps){
        super(props);
        this.state = {};
    }


    componentDidMount(){
        if(this.props.isEditing){
            this.setState({
                skill: this.props.skill
            });
        }
    }

    addLink = () => {
        this.setState({
            openLinkModal: true
        })
    }

    addYouTube = () => {
        this.setState({
            openYouTubeModal: true
        })
    }

    addFile = () => {
        this.setState({
            openFileModal: true
        })
    }

    handleChange = (e : React.FormEvent<HTMLInputElement>) => {
        if(this.state.skill){
            this.setState({
                skill: {...this.state.skill, [e.currentTarget.name] : e.currentTarget.value}
            });
        }
    };

    handleDescriptionChange = (e : React.FormEvent<HTMLTextAreaElement>) => {
        if(this.state.skill){
            this.setState({
                skill: {...this.state.skill, description: e.currentTarget.value}
            })
        }
    }

    handleOptionalChange = (value: string) => {
        if(this.state.skill){
            this.setState({
                skill: {...this.state.skill, optional: value === 'true' ? true : false}
            })
        }
    }

    onSubmit = (e:any) => {
        e.preventDefault();
        // form validation
        let hasError = false;
        if(!this.state.skill || isEmpty(this.state.skill.title) || isEmpty(this.state.skill.description) ){
            toast.error('Title and description cannot be empty');
            hasError = true;
        } else if(this.state.skill.links.length > 0){
            this.state.skill.links.forEach((link, index) => {
                if(isEmpty(link.title) || isEmpty(link.iconName) || !isURL(link.reference)){
                    toast.error('Link number ' + (index + 1) + ' does not have title or icon, or does not contain a valid URL');
                    hasError = true;
                }
            })
        } 
        if(!hasError) {
            this.props.updateSkill(this.state.skill);
        }
    }

    deleteLink = (id: string) => {
        if(this.state.skill && this.state.skill.links.length > 0){
            this.setState({
                skill: { ...this.state.skill, links:[...this.state.skill.links.filter(l => l.id !== id)] } 
            })
        }
    }

    render(){
        return (
            <div className="has-background-white" style={{
                    height: "calc(100vh - 3.5rem)",
                    padding: "20px",
                    overflow: 'auto'
                }}>
                <div className="level">
                    <div className="level-left">
                        <div className="level-item">
                            <h6 className="title is-6">
                                {this.state.skill ?  'Editing ' + this.state.skill.title : 'Add skill' }
                            </h6>
                        </div>
                    </div>
                    <div className="level-right">
                        <button className="delete" style={{float: 'right'}} onClick={() => this.props.closeModal()}></button>
                    </div>
                </div>

            <form onSubmit={this.onSubmit}>
                <div className="field">
                    <label className="label" htmlFor="title">Title</label>
                    <div className="control">
                        <input className="input" 
                        name="title" type="text" placeholder="title" required 
                        onChange={this.handleChange}
                        value={this.state.skill ? this.state.skill.title : ''} />
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
                            <input type="radio" name="optional"
                                checked={!this.state.skill || !this.state.skill.optional}
                                onChange={() => this.handleOptionalChange('false')} />
                            <span style={{marginLeft: "5px"}}>Not optional</span>
                        </label>
                        <label className="radio">
                            <input type="radio" name="optional"
                                checked={this.state.skill && this.state.skill.optional}
                                onChange={() => this.handleOptionalChange('true')} />
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
                                    checked={this.state.skill && this.state.skill.direction === direction}
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
                        name="description" placeholder="description" required 
                        onChange={this.handleDescriptionChange}
                        value={this.state.skill && this.state.skill.description} />
                    </div>
                </div>
                <div className="buttons">
                    <button className="button" onClick={this.addYouTube} type="button">
                        <span className="icon is-small" >
                            <FontAwesomeIcon icon={['fab', 'youtube-square']} />
                        </span>
                    </button>
                    <button className="button" onClick={this.addFile} type="button">
                        <span className="icon is-small">
                            <FontAwesomeIcon icon={'file'} />
                        </span>
                    </button>
                    <button className="button" onClick={this.addLink} type="button">
                        <span className="icon is-small">
                            <FontAwesomeIcon icon={'link'} />
                        </span>
                    </button>
                </div>
                <div className="buttons is-right">
                <button className="button is-success">Save changes</button>
                </div>
            </form>
            <hr></hr>
            {this.state.skill && this.state.skill.links.length > 0 && 
                <ul style={{listStyleType: 'none', marginTop: '10px'}}>
                    {this.state.skill.links.map((link, index)=> (
                        <LinkCard link={link} key={index} deleteLink={this.deleteLink}/>
                    ))}
                </ul>
            }
            </div>
                        
        )
    }
}

export default SkillForm