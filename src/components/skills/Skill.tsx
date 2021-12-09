import React, { Component } from 'react'
import { Link, RouteComponentProps } from 'react-router-dom';
import { Redirect } from 'react-router-dom';

import { db } from '../../firebase/firebase';
import firebase from 'firebase/app';

import ISkill from '../../models/skill.model';
import { showWarningModal, completedAfterWarning } from '../../actions/ui';

import { connect } from "react-redux";
import { toast } from 'react-toastify';
import Loading from '../layout/Loading';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import SkillForm from '../editor/elements/SkillForm';
import LinkCard from '../layout/LinkCard';
import IconPicker from '../layout/IconPicker';
import IResult from '../../models/result.model';

type TParams =  { skillId: string };

interface SkillResult {
    uid: string;
    displayName: string;
    email: string;
    photoURL: string;
    overallProgressOnComposition: number;
    skillStatus: string;
}

interface ISkillProps extends RouteComponentProps<TParams> {
  isAuthenticated: boolean;
  user: any;
  dispatch: any;
  hasDismissedWarning: boolean;
}

interface ISkillState {
  skill?: ISkill;
  doneLoading: boolean;
  toSkillsList: boolean;
  showSkillForm: boolean;
  linkId?: string;
  destroyInProgress: boolean;
  showIconPicker: boolean;
  userResults: SkillResult[];
}

class Skill extends Component<ISkillProps, ISkillState> {
    constructor(props: ISkillProps){
        super(props)
        this.state = {
          doneLoading: false,
          toSkillsList: false,
          showSkillForm: false,
          destroyInProgress: false,
          showIconPicker: false,
          userResults: []
        }
      }

    componentDidMount() {
        const skillId = this.props.match.params.skillId;
        db.collectionGroup("skills").where("id", "==", skillId)
        .get()
        .then(skillsSnap => {
            if(skillsSnap.empty){
                toast.error('Could not find the skill');
                this.setState({
                    doneLoading: true,
                    toSkillsList: true
                })
            } else {
                const skills = skillsSnap.docs.map(doc => {
                    let skill: ISkill = {
                        ...doc.data() as ISkill,
                        id: doc.id,
                        path: doc.ref.path
                    }
                    return skill;
                });
                this.setState({
                    doneLoading: true,
                    skill: skills[0]
                });
                if(skills[0].composition && skills[0].skilltree && skills[0].id){
                    const compositionId = skills[0].composition;
                    const skilltreeId = skills[0].skilltree;
                    const skillId = skills[0].id;
                    db.collection('results').where("compositions", "array-contains", compositionId)
                    .get()
                    .then(async resultsSnap => {
                        if(!resultsSnap.empty){
                            let userResults : any[] = [];
                            const results : IResult[] = resultsSnap.docs.map(doc => {
                                return {
                                    ...doc.data() as IResult,
                                    id: doc.id
                                }
                            });
                            for (let index = 0; index < results.length; index++) {
                                const result = results[index];
                                let userResult : SkillResult = {
                                    uid: result.id || '',
                                    displayName: result.displayName,
                                    email: result.email,
                                    photoURL: result.photoURL || '',
                                    overallProgressOnComposition: 0,
                                    skillStatus: 'locked'
                                }
                                if(result.progress&&result.progress[compositionId]&&result.progress[compositionId]>0){
                                    userResult.overallProgressOnComposition = result.progress[compositionId]
                                    const resultSnap = await 
                                    db.collection('results').doc(result.id)
                                    .collection('skilltrees').doc(skilltreeId)
                                    .get()
                                    if(resultSnap.exists){
                                        const skillResults = resultSnap.data()?.skills[skillId];
                                        if(skillResults&&skillResults.nodeState){
                                            userResult.skillStatus = skillResults.nodeState;
                                        }
                                    }
                                }
                                userResults.push(userResult);
                            }
                            this.setState({
                                userResults
                            })
                        }
                    });
                }
                
            }
        })
        .catch(err => {
            toast.error(err.message);
            this.setState({
                doneLoading: true,
                toSkillsList: true
            })
        })  
    } 

    componentDidUpdate(prevProps) {
        if(this.props.hasDismissedWarning && !this.state.destroyInProgress){
            this.deleteLink();
        }
    }

    editSkill = () => {
        this.toggleSkillForm();
    }

    updateSkill = (skill) => {
        db.doc(skill.path).set(skill, {merge: true})
        .then(_ => {
            this.setState({
                skill
            })
            this.toggleSkillForm();
        })
        .catch(err => {
            toast.error(err.message);
        })
    }

    toggleSkillForm = () => {
        this.setState({
            showSkillForm: !this.state.showSkillForm
        })
    }

    backToList = () => {
        this.setState({
            toSkillsList: true
        })
    }

    prepareDeleteLink = (id) => {
        if(!this.state.skill || !this.state.skill.title || !this.state.skill.links || !this.state.skill.path) return;
        const linkIndex = this.state.skill.links.findIndex(link => link.id === id);
        if(linkIndex > -1) {
            this.setState({
                linkId: id
            })
            const { dispatch } = this.props;
            dispatch(showWarningModal('You are about to delete the Link ' + this.state.skill.links[linkIndex].title + '. Are you sure?'))
        }
        
    }

    deleteLink = () => {
        if(!this.state.skill || !this.state.skill.title || !this.state.skill.links || !this.state.skill.path) return;
        this.setState({
            destroyInProgress: true
        })
        const updatedLinks = this.state.skill.links.filter(link => link.id !== this.state.linkId);
        db.doc(this.state.skill.path).update({
            links: updatedLinks
        })
        .then(_ => {
            const { dispatch } = this.props;
            dispatch(completedAfterWarning());
            this.setState({
                skill: {
                    ...this.state.skill,
                    title: this.state.skill?.title || '',
                    optional: this.state.skill?.optional || false,
                    countChildren: this.state.skill?.countChildren || 0,
                    links: updatedLinks
                },
                linkId: undefined,
                destroyInProgress: false
            })
        })
    }

    toggleIconPicker = () => {
        this.setState({
            showIconPicker: !this.state.showIconPicker
        })
    }

    iconPicked = (link) => {
        if(!this.state.skill?.path) return;
        this.toggleIconPicker();
        const updateIconLink = link ? link : firebase.firestore.FieldValue.delete();
        db.doc(this.state.skill.path).update({
            icon: updateIconLink
        })
        .then(_ => {
            this.setState({
                skill: {
                    ...this.state.skill,
                    title: this.state.skill?.title || '',
                    optional: this.state.skill?.optional || false,
                    countChildren: this.state.skill?.countChildren || 0,
                    icon: link
                }
            })
        })
    }

    render() {  
        return (
        this.state.toSkillsList ?
            <Redirect to={'/skills'} /> : this.state.doneLoading ? 
        <React.Fragment>
        <section className="section has-background-white-ter" style={{minHeight: "100vh"}}>
            <div className="container">
                    <div className="level">
                        <div className="level-left">
                            <div className="level-item">
                                <h1 className="title">{this.state.skill?.title}</h1>  
                            </div>
                            <div className="level-item">
                                <h3 className="subtitle">{this.state.skill?.category}</h3>  
                            </div>
                        </div>
                        <div className="level-right">
                            <div className="level-item">
                                <button className="button" onClick={this.backToList}>Back</button>
                            </div>
                            <div className="level-item">
                                <button className="button" onClick={this.toggleSkillForm}>Edit</button>
                            </div>
                            
                        </div>
                    </div>
                    <div className="title is-5">Description and icon</div>
                    <article className="media">
                    <figure className="media-left">
                        <p className="image is-64x64">
                        <img src={this.state.skill?.icon ? this.state.skill.icon : 
                                    "https://bulma.io/images/placeholders/128x128.png"} alt="" />
                        </p>
                    </figure>
                    <div className="media-content">
                        <div className="content">
                        <div dangerouslySetInnerHTML={{ __html: this.state.skill?.description || '' }} />
                        </div>
                    </div>
                    <div className="media-right">
                        <button className="button" onClick={this.toggleIconPicker}>
                            <span className="icon" data-tooltip="Edit skills icon">
                                <FontAwesomeIcon icon="file-image" />
                            </span>
                        </button>
                    </div>
                    </article>
                    <div className="title is-5 mt-5">Additional properties</div>
                    <div className="columns">
                            <div className="column">
                                <span className="mr-3">Tooltip direction: </span>
                                {this.state.skill?.tooltip ? 'this.state.skill.tooltip' : 'top'}
                            </div>
                            <div className="column">
                                <span className="mr-3">Count children: </span>
                                {this.state.skill?.countChildren ? this.state.skill.countChildren : 0 }
                            </div>
                            <div className="column">
                                <span className="mr-3">Optional: </span>
                                {this.state.skill?.optional ? 'Yes' : 'No'}
                            </div>
                            {this.state.skill?.composition !== this.props.user.uid && <div className="column">
                                <span className="mr-3">Composition: </span>
                                <Link to={`/compositions/${this.state.skill?.composition}/viewer`}>View</Link> | 
                                <Link className="ml-2" to={`/editor/${this.state.skill?.composition}`}>Edit</Link>
                            </div>}
                    </div>
                    <div className={`title is-5 ${this.state.skill?.links?.length ? '' : 'is-hidden' }`}>Links</div>
                    {this.state.skill?.links && this.state.skill.links.map(link => (
                        <LinkCard key={link.id} link={link} deleteLink={this.prepareDeleteLink}/>
                    ))}
                    {this.state.userResults.length > 0 && 
                    <React.Fragment>
                    <div className="is-divider"></div>
                    <h1 className="title">Completion status</h1>
                        {this.state.userResults.map((r,index) => (
                            <article key={index} className="media">
                            <figure className="media-left">
                                <p className="image is-64x64">
                                <img src={r.photoURL} alt="" />
                                </p>
                            </figure>
                            <div className="media-content">
                                <div className="content">
                                    <strong>{r.displayName}</strong><small className="ml-3">{r.email}</small>
                                    <div>
                                        Overall progress: {r.overallProgressOnComposition} skills completed
                                    </div>
                                    <Link to={`/compositions/${this.state.skill?.composition}/monitor/${r.uid}`}>Monitor results</Link>
                                </div>
                                
                            </div>
                            <div className="media-right">
                                <div className={`icon ${r.skillStatus === 'selected' ? 'has-text-success'  : 'has-text-danger'}`}
                                    data-tooltip={'status: '+r.skillStatus}>
                                <FontAwesomeIcon icon={ r.skillStatus ==='selected' ? 'check' : 'times'} />
                                </div>
                            </div>
                            </article>
                        ))}</React.Fragment>
                    }
            </div>
        </section>
        {this.state.showSkillForm &&
        <SkillForm isEditing={true} updateSkill={this.updateSkill} toggleSkillEditor={this.toggleSkillForm} skill={this.state.skill} />}
        {this.state.showIconPicker && <IconPicker closeModal={this.toggleIconPicker} iconPicked={this.iconPicked} />}
        </React.Fragment>
        : <Loading />);    
    } 

}

function mapStateToProps(state) {
  return {
    isAuthenticated: state.auth.isAuthenticated,
    user: state.auth.user,
    hasDismissedWarning: state.ui.hasDismissedWarning
  };
}

export default connect(mapStateToProps)(Skill);
