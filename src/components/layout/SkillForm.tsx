import React, { Component } from 'react'
import {isURL, isEmpty} from 'validator';
import { toast } from 'react-toastify';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import LinkCard from './LinkCard';
import ISkill from '../../models/skill.model';
import YouTubeForm from './YouTubeForm';
import LinkFileUploader from './LinkFileUploader';
import LinkForm from './LinkForm';
import ILink from '../../models/link.model';
import { db } from '../../firebase/firebase';

interface ISkillFormProps {
    skill: ISkill;
    isEditing: boolean;
    updateSkill: Function;
    closeModal: Function;
    parentName: string;
}

interface ISkillFormState{
    skill?: ISkill,
    isShowFileModal?: boolean;
    isShowYouTubeModal?: boolean;
    isShowLinkModal?: boolean;
}

export class  SkillForm extends Component<ISkillFormProps, ISkillFormState> {

    constructor(props: ISkillFormProps){
        super(props);
        this.state = {
            isShowYouTubeModal: false
        };
    }

    componentDidMount(){
        this.setState({
            skill: this.props.skill,
        })
    }

    toggleLinkModal = () => {
        this.setState({
            isShowLinkModal: !this.state.isShowLinkModal
        })
    }

    toggleYouTubeModal = () => {
        this.setState({
            isShowYouTubeModal: !this.state.isShowYouTubeModal
        })
    }

    toggleFileModal = () => {
        this.setState({
            isShowFileModal: !this.state.isShowFileModal
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
        } else if(this.state.skill && this.state.skill.links && this.state.skill.links.length > 0){
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

    addLink = (link: ILink) => {
        if(this.state.skill?.path){
            db.doc(this.state.skill.path).update({links: [...this.state.skill.links || [], link] })
            .then( _ => {
                if(this.state.skill){
                    this.setState({
                        skill: {...this.state.skill, links: [...this.state.skill.links || [], link]}
                    })
                }
            })
            .catch(e => toast.error(e))
        } else if(this.state.skill){
            //this is a new skill
            this.setState({
                skill: {...this.state.skill, links: [...this.state.skill.links || [], link]}
            })
        }
    }

    deleteLink = (id: string) => {
        if(this.state.skill && this.state.skill.links && this.state.skill.links.length > 0){
            this.setState({
                skill: { ...this.state.skill, links:[...this.state.skill.links.filter(l => l.id !== id)] } 
            })
        }
    }


    render(){
        return (
            <React.Fragment>
            <div className="has-background-white" style={{
                    height: "calc(100vh - 3.5rem)",
                    padding: "20px",
                    overflow: 'auto'
                }}>
                <div className="level">
                    <div className="level-left">
                        <div className="level-item">
                            <h6 className="title is-6">
                                {this.props.isEditing ?  'Editing ' + (this.state.skill ? this.state.skill.title : '') 
                                    : 'Add skill to ' + this.props.parentName }
                            </h6>
                        </div>
                    </div>
                    <div className="level-right">
                        <button className="delete"
                            style={{float: 'right'}} onClick={() => this.props.closeModal()}></button>
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
                                checked={this.state.skill && this.state.skill.optional ? true : false}
                                onChange={() => this.handleOptionalChange('true')} />
                            <span style={{marginLeft: "5px"}}>Optional</span>
                        </label>
                        </div>
                    </div>
                </div>
                {/* <div className="field is-inline-block-desktop" style={{marginLeft: "20px"}}>
                    <div className="field is-narrow">
                        <label className="label">
                            Tooltip direction
                        </label>
                        <div className="control">
                        {['top', 'left', 'right', 'bottom'].map((direction) => (
                            <label className="radio" key={direction}>
                                <input type="radio" name="direction" value={direction}
                                    checked={this.state.skill && this.state.skill.direction === direction ? true : false}
                                    onChange={this.handleChange} />
                                <span style={{marginLeft: "5px"}}>{direction}</span>
                            </label>
                        ))}
                        </div>
                    </div>
                </div> */}
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
                    <button className="button has-tooltip-right" data-tooltip="Add YouTube video" 
                        onClick={this.toggleYouTubeModal} type="button">
                        <span className="icon is-small" >
                            <FontAwesomeIcon icon={['fab', 'youtube-square']} />
                        </span>
                    </button>
                    <button className="button" data-tooltip="Add file"
                        onClick={this.toggleFileModal} type="button">
                        <span className="icon is-small">
                            <FontAwesomeIcon icon={'file'} />
                        </span>
                    </button>
                    <button className="button" data-tooltip="Add link"
                        onClick={this.toggleLinkModal} type="button">
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
            {this.state.skill && this.state.skill.links && this.state.skill.links.length > 0 && 
                <ul style={{listStyleType: 'none', marginTop: '10px'}}>
                    {this.state.skill.links.map((link, index)=> (
                        <LinkCard link={link} key={index} deleteLink={this.deleteLink}/>
                    ))}
                </ul>
            }
            </div>
            <YouTubeForm toggleYouTubeModal={this.toggleYouTubeModal} 
                isShowYouTubeModal={this.state.isShowYouTubeModal ? this.state.isShowYouTubeModal : false}
                addLink={this.addLink}/>
            <LinkFileUploader isShowFileModal={this.state.isShowFileModal ? this.state.isShowFileModal : false}
                toggleFileModal={this.toggleFileModal}
                addLink={this.addLink} />
            <LinkForm isShowLinkModal={this.state.isShowLinkModal ? this.state.isShowLinkModal : false}
                toggleLinkModal={this.toggleLinkModal}
                addLink={this.addLink} />
            </React.Fragment>        
        )
    }
}

export default SkillForm