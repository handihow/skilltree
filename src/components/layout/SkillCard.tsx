import React, { Component } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { linkIcons } from '../compositions/StandardData';
import ISkill from '../../models/skill.model';

interface ISkillCardProps {
    skill: ISkill;
    editSkill: Function;
    deleteSkill: Function;
}

interface ISkillCardState {
    isActive: boolean;
}

export class SkillCard extends Component<ISkillCardProps, ISkillCardState> {

    constructor(props: ISkillCardProps){
        super(props);
        this.state = {
            isActive: false
        };
    }

    editSkill = () => {
        this.props.editSkill(this.props.skill);
    }

    deleteSkill = () => {
        this.props.deleteSkill(this.props.skill);
    }

    toggleIsActive = () =>{
        this.setState({
            isActive: !this.state.isActive
        });
    }

    addChild = () => {
        
    }

    render() {
        const {skill} = this.props;
        return (
            <React.Fragment>
            <article className="media box" style={{width:"100%"}}>
                <div className="media-left">
                    <p className="image is-64x64">
                    <img src={skill.icon ? skill.icon : 
                    "https://via.placeholder.com/128.png?text=No+Icon"}></img>
                    </p>
                </div>
                <div className="media-content">
                <div className="content">
                    <div>
                        <strong>{skill.title}</strong>
                        <br></br>
                        {skill.description}
                        <br></br>
                        <ul style={{listStyleType: 'none', margin: '10px'}}>
                        {skill.links && skill.links.map((link) => (
                            <li key={link.id}>
                                <a href={link.reference} target="_blank" rel="noopener noreferrer">
                                <span style={{marginRight: '10px'}}>
                                <FontAwesomeIcon icon={[link.iconPrefix, link.iconName]} />
                                </span>
                                {link.title}
                                </a>
                            </li>
                        ))}
                        </ul>
                    </div>
                    <nav className="level is-mobile">
                    <div className="level-left">
                        <a className="level-item" onClick={this.addChild}>
                        <span className="icon is-small"><FontAwesomeIcon icon='plus' /></span>
                        </a>
                        <a className="level-item" onClick={this.editSkill}>
                        <span className="icon is-small"><FontAwesomeIcon icon='edit' /></span>
                        </a>
                        <a className="level-item" onClick={this.toggleIsActive}>
                        <span className="icon is-small"><FontAwesomeIcon icon='trash' /></span>
                        </a>
                    </div>
                    </nav>
                </div>
                </div>
                <div className="media-right">
                    <small>{this.props.skill.optional ? 'Optional' : 'Not optional'}</small>
                        {skill.direction && 
                        <React.Fragment> <span style={{marginLeft:'5px', marginRight:'5px'}}>|</span> 
                        <small>Tooltip @{skill.direction}</small></React.Fragment>}
                </div>
            </article>
            <div className={`modal ${this.state.isActive ? "is-active" : ""}`}>
                <div className="modal-background"></div>
                <div className="modal-card">
                <header className="modal-card-head">
                    <p className="modal-card-title">Are you sure?</p>
                    <button className="delete" aria-label="close" onClick={this.toggleIsActive}></button>
                </header>
                <section className="modal-card-body">
                    You are about to delete skill {skill.title}. Do you want to delete?
                </section>
                <footer className="modal-card-foot">
                    <button className="button is-danger" onClick={this.deleteSkill}>Delete</button>
                    <button className="button" onClick={this.toggleIsActive}>Cancel</button>
                </footer>
                </div>
            </div>
            </React.Fragment>
        )
    }
}

export default SkillCard
