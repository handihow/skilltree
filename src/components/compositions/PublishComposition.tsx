import React, { Component } from 'react'
import CompositionMenu from '../layout/CompositionMenu'
import { RouteComponentProps } from 'react-router';
import { db } from '../../firebase/firebase';
import IComposition from '../../models/composition.model';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { toast } from 'react-toastify';

type TParams =  { compositionId: string };

interface IPublishCompositionState {
    activeTab: string;
    unsubscribe?: any;
    composition?: IComposition;
    url?: string;
}

export class PublishComposition extends Component<RouteComponentProps<TParams>, IPublishCompositionState> {
    constructor(props: RouteComponentProps<TParams>){
        super(props);
        this.state = {
            activeTab: 'link'
        }
    }

    componentWillMount(){
        const unsubscribe = db.collection('compositions').doc(this.props.match.params.compositionId).onSnapshot(snap => {
            const composition = snap.data() as IComposition;
            this.setState({
                composition: composition,
                unsubscribe: unsubscribe,
                url: window.location.protocol + '//' + window.location.host + '/compositions/' + composition.id + '/viewer'
            })
        })
    }

    componentWillUnmount(){
        this.state.unsubscribe();
    }

    changeActiveTab = (tab: string) => {
        this.setState({
            activeTab: tab
        });
    }

    handleChange = (e: any) => {
        db.collection('compositions').doc(this.state.composition?.id).update({
            [e.currentTarget.name] : e.currentTarget.value === "true" ? true : false
        })
    }

    copyToClipboard = () => {
        if(this.state.url){
            navigator.clipboard.writeText(this.state.url);
            toast.info('Link copied to clipboard!');
        } else {
            toast.error('The link could not be copied!');
        }
    }

    openEmailClient = () => {
        window.location.href = `mailto:?subject=Link%20to%20my%20skilltree&body=${this.state.url}`;
    }

    render() {
        const compositionId = this.props.match.params.compositionId;
        return (
            <div className="columns is-mobile" style={{height:"95vh"}}>
                <div className="column is-2">
                    <CompositionMenu id={compositionId} />
                </div>
                <div className="column" style={{marginTop: "30px"}}>
                        <div className="title">Publish skilltree</div>
                        <hr></hr>
                        <h5 className="title is-5">Define your settings</h5>
                        <div className="field is-inline-block-desktop" style={{marginLeft: "20px"}}>
                            <div className="field is-narrow">
                                <label className="label">
                                    Who can view skilltree
                                </label>
                                <div className="control">
                                {["true", "false"].map((option, index) => (
                                    <label className="radio" key={index}>
                                        <input type="radio" name="loggedInUsersOnly" value={option}
                                            checked={this.state.composition && 
                                                this.state.composition.loggedInUsersOnly?.toString() ===  option ? 
                                                true : false}
                                            onChange={this.handleChange} />
                                        <span style={{marginLeft: "10px"}}>{option === 'true' ? 
                                                                'Logged in users' : 'No need to log in'}</span>
                                    </label>
                                ))}
                                </div>
                            </div>
                            {this.state.composition?.loggedInUsersOnly && 
                            <React.Fragment>
                            <div className="field is-narrow">
                                <label className="label">
                                    Logged in users can edit skilltree?
                                </label>
                                <div className="control">
                                {["true", "false"].map((option, index) => (
                                    <label className="radio" key={index}>
                                        <input type="radio" name="loggedInUsersCanEdit" value={option}
                                            checked={this.state.composition && 
                                                this.state.composition.loggedInUsersCanEdit?.toString() ===  option ? 
                                                true : false}
                                            onChange={this.handleChange} />
                                        <span style={{marginLeft: "10px"}}>{option === 'true' ? 
                                                                'Logged in users can mark skills as completed' : 'Only I can mark skills as completed'}</span>
                                    </label>
                                ))}
                                </div>
                            </div>
                            <div className="field is-narrow">
                                <label className="label">
                                    Logged in users can copy skilltree?
                                </label>
                                <div className="control">
                                {["true", "false"].map((option, index) => (
                                    <label className="radio" key={index}>
                                        <input type="radio" name="canCopy" value={option}
                                            checked={this.state.composition && 
                                                this.state.composition.canCopy?.toString() ===  option ? 
                                                true : false}
                                            onChange={this.handleChange} />
                                        <span style={{marginLeft: "10px"}}>{option === 'true' ? 
                                                                'Logged in users can copy the skilltree' : 'Copying skilltree not allowed'}</span>
                                    </label>
                                ))}
                                </div>
                            </div>
                            </React.Fragment>}
                        </div>
                        <hr></hr>
                        <div className="tabs">
                        <ul>
                            <li className={this.state.activeTab ==='link' ? "is-active" : undefined}>
                                <a href="# " onClick={() => this.changeActiveTab('link')}>Link</a>
                            </li>
                            {/* <li className={this.state.activeTab ==='iframe' ? "is-active" : undefined}>
                                <a href="# " onClick={() => this.changeActiveTab('iframe')}>IFrame</a>
                            </li> */}
                            <li className={this.state.activeTab ==='email' ? "is-active" : undefined}>
                                <a href="# " onClick={() => this.changeActiveTab('email')}>Email</a>
                            </li>
                            {/* <li className={this.state.activeTab ==='pdf' ? "is-active" : undefined}>
                                <a href="# " onClick={() => this.changeActiveTab('pdf')}>PDF</a>
                            </li> */}
                        </ul>
                        </div>
                        {this.state.activeTab === 'link' && 
                            <div className="level" style={{margin: "20px"}}>
                                <div className="level-left">
                                    <div className="level-item">
                                        <div className="title is-6">
                                            <a href={this.state.url || ''} target="_blank"
                                                rel="noopener noreferrer">{this.state.url}</a>
                                        </div>
                                    </div>
                                    <div className="level-item">
                                        <button className="button" onClick={this.copyToClipboard}
                                            data-tooltip="Copy link to clipboard">
                                        <FontAwesomeIcon icon="copy" />
                                        </button>
                                    </div>
                                </div>
                            </div>}
                        {this.state.activeTab === 'email' && 
                            <button className="button" onClick={this.openEmailClient}>New email with link</button>}

                </div>
            </div>
        )
    }
}

export default PublishComposition
