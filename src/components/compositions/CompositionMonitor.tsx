import React, { Component } from 'react'
import { RouteComponentProps, Link } from 'react-router-dom';
import IComposition from '../../models/composition.model';
import { toast } from 'react-toastify';
import { connect } from "react-redux";
import { db } from '../../firebase/firebase';
import IResult from '../../models/result.model';
import Header from '../layout/Header';
import firebase from "firebase/app";

type TParams =  { compositionId: string };

interface ICompositionMonitorProps extends RouteComponentProps<TParams>{
    user: any;
    isAuthenticated: boolean;
}

interface ICompositionMonitorState {
    composition?: IComposition;
    results?: IResult[];
    doneLoading: boolean;
    toHome: boolean;
    isActive: boolean;
    result?: IResult;
    unsubscribe?: any;
    url?: string;
}

export class CompositionMonitor extends Component<ICompositionMonitorProps, ICompositionMonitorState> {

    constructor(props: ICompositionMonitorProps){
        super(props);
        this.state = {
            doneLoading: false,
            toHome: false,
            isActive: false,
        }
    }

    componentDidMount() {
        const compositionId = this.props.match.params.compositionId;
        db.collection("compositions").doc(compositionId).get()
        .then(doc => {
            const composition = doc.data() as IComposition;
            if(this.props.user.uid !== composition.user) {
                toast.error('You are not the owner of this skilltree. You cannot use composition monitor.');
                this.setState({
                    toHome: true
                })
            } else {
                const unsubscribe = db.collection('results').where('compositions', 'array-contains', compositionId).orderBy('displayName')
                .onSnapshot(
                    (snap) => {
                        const results =  snap.empty ? [] : snap.docs.map(r => r.data() as IResult);
                        const filteredResults = results.filter(r => r.user !== this.props.user.uid);
                        this.setState({
                                composition: composition,
                                results: filteredResults,
                                doneLoading: true,
                                unsubscribe: unsubscribe,
                                url: window.location.protocol + '//' + window.location.host + '/compositions/' + composition.id + '/viewer'
                            });
                    }, 
                    (error) => {
                        toast.error(error.message);
                    });
            }
        });
    }

    componentWillUnmount() {
        if(this.state.unsubscribe){
            this.state.unsubscribe();
        }
    }

    toggleIsActive = () => {
        this.setState({
            isActive: !this.state.isActive,
            result: undefined
        });
    }

    prepareToRemoveStudent = (result : IResult) => {
        console.log('preparing to remove student ' + result.displayName)
        this.setState({
            isActive: true,
            result: result
        })
    }

    removeStudent = () => {
        db.collection('results').doc(this.state.result?.user).set({
            compositions: firebase.firestore.FieldValue.arrayRemove(this.props.match.params.compositionId)
        }, {merge: true})
        .then(_ => {
            toast.info(`Student ${this.state.result?.displayName}  was successfully removed from overview`)
            this.toggleIsActive()
        })
        .catch(err => {
            toast.error('There was an error when removing the student from the list: ' + err.message);
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

    render() {
        return (
            <article style={{height:"95vh"}}>
            <section className="section" style={{maxHeight: "100%", overflowY: 'auto'}}>
            <div className="container">
                <div className="level">
                    <div className="level-left">
                        <div className="level-item">
                            <Header header={this.state.composition?.title || ''}></Header>
                        </div>
                    </div>
                    <div className="level-right">
                        <div className="level-item">
                            {this.state.composition && 
                            <Link to={`/compositions/${this.state.composition?.id || ''}/add-students`} 
                            className="button">
                                Add students</Link>}
                        </div>
                    </div>
                </div>
                <hr></hr>
                {this.state.results && this.state.results.length === 0 && 
                <React.Fragment>
                <article className="message is-primary">
                    <div className="message-header">No students yet... </div>
                <div className="message-body">
                <div>You can add students or share the link. </div>
                <div>When students visit your link and log in, they will appear automatically in this overview.</div>
                <div className="columns" style={{marginTop: "20px"}}>
                <div className="column is-narrow">
                    <Link to={`/compositions/${this.state.composition?.id || ''}/add-students`} 
                    className="button">
                    Add students</Link></div>
                <div className="is-divider-vertical" data-content="OR"></div>
                <div className="column">
                    <button className="button" onClick={this.copyToClipboard}
                        data-tooltip="Copy link to clipboard">
                            Copy Share Link
                    </button>
                </div>
                </div>
                </div>
                </article>
                
                </React.Fragment>
                }
                {this.state.composition && this.state.results && this.state.results?.map((result: IResult) => 
                <div className="box" key={result.user}>
                <div className="media">
                <div className="media-left">
                    <p className="image is-64x64">
                    <img className="is-rounded" src={result.photoURL && result.photoURL.length > 0 ? result.photoURL : 
                    `https://eu.ui-avatars.com/api/?name=${result.displayName}`} alt="thumbnail"></img>
                    </p>
                </div>
                <div className="media-content">
                    <div className="content">
                    <nav className="level is-mobile">
                    <div className="level-left">
                        <Link to={"/compositions/"+this.state.composition?.id+"/monitor/"+result.user} 
                        data-tooltip="View skilltree" style={{color: "black"}}> 
                        <strong>{result.displayName}</strong> 
                        </Link><small style={{marginLeft: "10px"}}>{result.email}</small>
                    </div>
                    <div className="level-right">
                    <div className="level-item is-hidden-mobile">
                        <div className="tag is-primary">
                            {this.state.composition?.id && 'Completed ' + result.progress[this.state.composition.id] + ' of ' + 
                                this.state.composition.skillcount + ' skills'}
                        </div>
                    </div>
                    </div>
                    </nav>
                    {this.state.composition?.id && <progress className="progress is-primary"
                            value={result.progress[this.state.composition.id]} 
                            max={this.state.composition.skillcount}></progress>}
                    </div>
                </div>
                <div className="media-right">
                <button className="delete" onClick={() => this.prepareToRemoveStudent(result)}></button>
                </div>
                </div>
                </div>

            )}
            </div>
            <div className={`modal ${this.state.isActive ? "is-active" : ""}`}>
                <div className="modal-background"></div>
                <div className="modal-card">
                <header className="modal-card-head">
                    <p className="modal-card-title">Are you sure?</p>
                    <button className="delete" aria-label="close" onClick={this.toggleIsActive}></button>
                </header>
                <section className="modal-card-body">
                    You are about to remove {this.state.result?.displayName}. 
                    Do you want to remove this student from your overview page?
                </section>
                <footer className="modal-card-foot">
                    <button className="button is-danger" 
                    onClick={this.removeStudent}>
                        Remove</button>
                    <button className="button" onClick={this.toggleIsActive}>Cancel</button>
                </footer>
                </div>
            </div>
            </section>
            </article>
        )
    }
}

function mapStateToProps(state) {
    return {
      isAuthenticated: state.auth.isAuthenticated,
      user: state.auth.user
    };
  }


export default  connect(mapStateToProps)(CompositionMonitor)
