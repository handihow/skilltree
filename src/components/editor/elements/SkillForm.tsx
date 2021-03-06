import React, { Component } from 'react'
import {isURL, isEmpty} from 'validator';
import { toast } from 'react-toastify';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import LinkCard from '../../layout/LinkCard';
import ISkill from '../../../models/skill.model';
import IQuiz from '../../../models/quiz.model';
import YouTubeForm from './YouTubeForm';
import LinkFileUploader from './LinkFileUploader';
import LinkForm from './LinkForm';
import LinkQuiz from './LinkQuiz';
import ILink from '../../../models/link.model';
import { db } from '../../../firebase/firebase';
import RichTextEditor from 'react-rte';
import {toolbarConfig, quizImage} from '../../../services/StandardData';
import firebase from 'firebase/app';

interface ISkillFormProps {
    isEditing: boolean;
    updateSkill: Function;
    closeModal: Function;
    skill?: ISkill;
}

interface ISkillFormState{
    isShowFileModal?: boolean;
    isShowYouTubeModal?: boolean;
    isShowLinkModal?: boolean;
    isShowQuizModal?: boolean;
    description: any;
    title: string;
    optional: boolean;
    direction: string;
    links: ILink[];
    moreOptions: boolean;
    hasQuiz: boolean;
    quizId: string;
}

export class  SkillForm extends Component<ISkillFormProps, ISkillFormState> {

    constructor(props: ISkillFormProps){
        super(props);
        this.state = {
            isShowYouTubeModal: false,
            description: this.props.skill?.description ? 
                    RichTextEditor.createValueFromString(this.props.skill.description, 'html') : 
                    RichTextEditor.createEmptyValue(),
            title: this.props.skill?.title ? this.props.skill.title : '',
            optional: this.props.skill?.optional ? this.props.skill.optional : false,
            direction: this.props.skill?.direction ? this.props.skill.direction : 'bottom',
            links: this.props.skill?.links && this.props.skill.links.length > 0  ? this.props.skill.links : [],
            moreOptions: false,
            hasQuiz: this.props.skill?.hasQuiz || false,
            quizId: this.props.skill?.quizId || '',
        };
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

    toggleQuizModal = () => {
        this.setState({
            isShowQuizModal: !this.state.isShowQuizModal
        })
    }

    toggleOptions = () => {
        this.setState({
            moreOptions: !this.state.moreOptions
        })
    }

    handleTitleChange = (e : React.FormEvent<HTMLInputElement>) => {
        this.setState({
            title: e.currentTarget.value
        });
    };

    handleDescriptionChange = (value) => {
        this.setState({
            description: value
        })
    }

    handleOptionalChange = (value: string) => {
        this.setState({
            optional: value === 'true' ? true : false
        })
    }

    handleTooltipChange = (e : React.FormEvent<HTMLInputElement>) => {
        this.setState({
            direction: e.currentTarget.value
        })
    }

    onSubmit = (e:any) => {
        e.preventDefault();
        let hasError = false;
        // form validation
        if(isEmpty(this.state.title) || isEmpty(this.state.description.toString('html')) ){
            hasError = true;
            toast.error('Title and description cannot be empty');
        } else if(this.state.links && this.state.links.length > 0){
            this.state.links.forEach((link, index) => {
                if(isEmpty(link.title) || isEmpty(link.iconName) || (!isURL(link.reference)&&!link.isQuizLink)){
                    hasError = true;
                    toast.error('Link number ' + (index + 1) + ' does not have title or icon, or does not contain a valid URL');
                }
            })
        }
        if(hasError) return;
        const updatedSkill = {
            ...this.props.skill,
            title: this.state.title,
            description: this.state.description.toString('html'),
            optional: this.state.optional,
            links: this.state.links,
            direction: this.state.direction
        };
        this.props.updateSkill(updatedSkill);
    }

    addLink = (link: ILink) => {
        if(this.props.skill?.path){
            db.doc(this.props.skill.path).update({links: [...this.state.links || [], link] })
            .then( _ => {
                this.setState({
                    links: [...this.state.links || [], link]
                })
            })
            .catch(e => toast.error(e))
        } else if(this.props.skill){
            //this is a new skill
            this.setState({
                links: [...this.state.links || [], link]
            })
        }
    }


    deleteLink = (id: string) => {
        const linkIndex = this.state.links.findIndex(l => l.id === id);
        const isQuizLink = linkIndex > -1 ? this.state.links[linkIndex].isQuizLink : false;
        if(isQuizLink){
            this.removeQuiz();
        }
        this.setState({
            links:[...this.state.links.filter(l => l.id !== id)] 
        })
    }

    addQuiz = (quiz: IQuiz) => {
        if(this.props.skill?.path){
            db.doc(this.props.skill.path).update({
                hasQuiz: true,
                quizId: quiz.id,
                icon: quizImage,
                quizTitle: quiz.title
            }).then(_ => {
                this.setState({
                    hasQuiz: true,
                    quizId: quiz.id,
                })
            });
        }
    }

    removeQuiz = () => {
        if(this.props.skill?.path){
            db.doc(this.props.skill.path).update({
                hasQuiz: false,
                icon: firebase.firestore.FieldValue.delete(),
                quizId: firebase.firestore.FieldValue.delete(),
                quizTitle: firebase.firestore.FieldValue.delete()
            })
            .then(_ => {
                this.setState({
                    hasQuiz: false,
                    quizId: ''
                })
                toast('Quiz was unlinked from this skill. You can still find it in your list of Quizzes.')
            });
        }
    }

    render(){
        return (
            <React.Fragment>
            <div className="modal is-active">
            <div className="modal-background"></div>
            <div className="modal-card">
                <header className="modal-card-head">
                <p className="modal-card-title">
                {this.props.isEditing ?  'Editing ' + this.props.skill?.title 
                                    : 'Add skill'}    
                </p>
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
                <div className="field-group">
                <div className="field is-inline-block-desktop">
                    <div className="field is-narrow">
                        <label className="label">
                            Optional skill
                        </label>
                        <div className="control">
                        <label className="radio">
                            <input type="radio" name="optional"
                                checked={!this.state.optional}
                                onChange={() => this.handleOptionalChange('false')} />
                            <span style={{marginLeft: "5px"}}>Not optional</span>
                        </label>
                        <label className="radio">
                            <input type="radio" name="optional"
                                checked={this.state.optional}
                                onChange={() => this.handleOptionalChange('true')} />
                            <span style={{marginLeft: "5px"}}>Optional</span>
                        </label>
                        </div>
                    </div>
                </div>
                
                </div>
                <div className="field">
                    <label className="label" htmlFor="description">Description</label>
                    <div className="control">
                        <RichTextEditor
                            value={this.state.description}
                            onChange={this.handleDescriptionChange}
                            toolbarConfig={toolbarConfig}
                        />
                    </div>
                </div>
                {this.state.moreOptions && <React.Fragment>
                    <div className="field is-inline-block-desktop" style={{marginLeft: "20px"}}>
                        <div className="field is-narrow">
                            <label className="label">
                                Tooltip direction
                            </label>
                            <div className="control">
                            {['top', 'left', 'right', 'bottom'].map((direction) => (
                                <label className="radio" key={direction}>
                                    <input type="radio" name="direction" value={direction}
                                        checked={this.state.direction === direction ? true : false}
                                        onChange={this.handleTooltipChange} />
                                    <span style={{marginLeft: "5px"}}>{direction}</span>
                                </label>
                            ))}
                            </div>
                        </div>
                    </div>
                    <hr></hr></React.Fragment>}
                <div className="buttons">
                    <button className="button has-tooltip-right" data-tooltip="Add YouTube video" 
                        onClick={this.toggleYouTubeModal} type="button">
                        <span className="icon is-small" >
                            <FontAwesomeIcon icon={['fab', 'youtube-square']} />
                        </span>
                    </button>
                    <button className="button has-tooltip-right" data-tooltip="Add file"
                        onClick={this.toggleFileModal} type="button">
                        <span className="icon is-small">
                            <FontAwesomeIcon icon={'file'} />
                        </span>
                    </button>
                    <button className="button has-tooltip-right" data-tooltip="Add link"
                        onClick={this.toggleLinkModal} type="button">
                        <span className="icon is-small">
                            <FontAwesomeIcon icon={'link'} />
                        </span>
                    </button>
                    {!this.state.hasQuiz && <button className="button has-tooltip-right" data-tooltip="Add quiz"
                        onClick={this.toggleQuizModal} type="button">
                        <span className="icon is-small">
                            <FontAwesomeIcon icon={'poll-h'} />
                        </span>
                    </button>}
                </div>
            <hr></hr>
            <ul style={{listStyleType: 'none', marginTop: '10px'}}>
                {this.state.hasQuiz && 
                <LinkCard link={{
                    imageUrl: quizImage,
                    id: this.state.quizId,
                    iconName: 'poll-h',
                    iconPrefix: 'fas',
                    reference: '/quizzes/' + this.state.quizId + '/results',
                    title: this.props.skill?.quizTitle || 'Quiz',
                    description: 'This skill has a quiz! You can check the quiz results by clicking on the title.',
                    isQuizLink: true
                }} deleteLink={this.removeQuiz}/>}
                {this.state.links.length > 0 && this.state.links.map((link, index)=> (
                    <LinkCard link={link} key={index} deleteLink={this.deleteLink}/>
                ))}
            </ul>
            </section>
                <footer className="modal-card-foot">
                <button className="button" type="button" onClick={this.toggleOptions}>
                    {this.state.moreOptions ? 'Less options' : 'More options'}
                </button>
                <button className="button is-success">Save changes</button>
                </footer>
            </form>
            </div>
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
            <LinkQuiz isShowLinkQuizModal={this.state.isShowQuizModal ? this.state.isShowQuizModal : false}
                toggleLinkQuizModal={this.toggleQuizModal}
                addQuiz={this.addQuiz} />
            </React.Fragment>        
        )
    }
}

export default SkillForm