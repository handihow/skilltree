import React, { Component } from 'react'
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {storage, db} from '../../firebase/firebase';
import IComposition from '../../models/composition.model';
import { connect } from "react-redux";
import IResult from '../../models/result.model';

interface ICompositionItemProps {
    composition: IComposition;
    editCompositionTitle: Function;
    delComposition: Function;
    copyComposition: Function;
    isAuthenticated: boolean;
    user: any
}

interface ICompositionItemState {
    isActive: boolean;
    thumbnail: string;
    progress: number;
}

export class CompositionItem extends Component<ICompositionItemProps, ICompositionItemState> {

    constructor(props: ICompositionItemProps){
        super(props);
        this.state = {
            isActive: false,
            thumbnail: 'https://via.placeholder.com/128x128.png?text=Skilltree',
            progress: 0
        };
    }
    
    componentDidMount(){
        if(this.props.composition.hasBackgroundImage){
            const storageRef = storage.ref();
            const imageRef = storageRef.child(this.props.composition.thumbnailImage || '');
            imageRef.getDownloadURL()
            .then(url => {
                this.setState({thumbnail: url});
            });
        }
        if(this.props.isAuthenticated){
            db.collection('results')
            .doc(this.props.user.uid)
            .get()
            .then(snapShot => {
                const result = snapShot.data() as IResult;
                this.setState({
                    progress: result.progress[this.props.composition.id || ''] || 0
                })
            })
        }
        
        
    }

    toggleIsActive = () =>{
        this.setState({
            isActive: !this.state.isActive
        });
    }
    
    render() {
        const { id, title, username } = this.props.composition;
        return (
            <div className="box">
            <div className="media">
            <div className="media-left">
                <p className="image is-64x64">
                <img className="is-rounded" src={this.state.thumbnail} alt="thumbnail"></img>
                </p>
            </div>
            <div className="media-content">
                <div className="content">
                <p>
                    <Link to={"/compositions/"+id} data-tooltip="To skilltree editor" style={{color: "black"}}> 
                    <strong>{title}</strong> 
                    </Link><small style={{marginLeft: "10px"}}>{username}</small>
                </p>
                </div>
                <nav className="level is-mobile">
                <div className="level-left">
                {this.props.user.uid === this.props.composition.user &&
                    <div className="level-item" data-tooltip="Edit skilltree title">
                        <a href="# " onClick={this.props.editCompositionTitle.bind(this, this.props.composition)}>
                            <FontAwesomeIcon icon='pen' /></a>
                    </div>}
                    <div className="level-item" data-tooltip="Copy skilltree">
                        <a href="# " onClick={this.props.copyComposition.bind(this, this.props.composition)}>
                            <FontAwesomeIcon icon='copy' /></a>
                    </div>
                    {this.props.user.uid === this.props.composition.user &&
                        <Link to={"/compositions/"+id} className="level-item" data-tooltip="Skilltree editor">
                    <span className="icon is-small"><FontAwesomeIcon icon='edit' /></span>
                    </Link>}
                    <Link to={"/compositions/"+id+"/viewer"} className="level-item" data-tooltip="View skilltree">
                    <span className="icon is-small"><FontAwesomeIcon icon='eye' /></span>
                    </Link>
                </div>
                <div className="level-right">
                <div className="level-item">
                    <div className="tag is-primary">
                        {'Completed ' + this.state.progress + ' of ' + this.props.composition.skillcount + ' skills'}
                    </div>
                </div>
                </div>
                </nav>
                <progress className="progress is-primary"
                        value={this.state.progress} 
                        max={this.props.composition.skillcount}></progress>
            </div>
            <div className="media-right">
            {this.props.user.uid === this.props.composition.user &&
            <button className="delete" onClick={this.toggleIsActive}></button>}
            </div>
            </div>
            <div className={`modal ${this.state.isActive ? "is-active" : ""}`}>
                <div className="modal-background"></div>
                <div className="modal-card">
                <header className="modal-card-head">
                    <p className="modal-card-title">Are you sure?</p>
                    <button className="delete" aria-label="close" onClick={this.toggleIsActive}></button>
                </header>
                <section className="modal-card-body">
                    You are about to delete skill tree page {title}. Do you want to delete?
                </section>
                <footer className="modal-card-foot">
                    <button className="button is-danger" onClick={this.props.delComposition.bind(this, this.props.composition)}>Delete</button>
                    <button className="button" onClick={this.toggleIsActive}>Cancel</button>
                </footer>
                </div>
            </div>
            </div>
        )
    }
}

function mapStateToProps(state) {
    return {
      isAuthenticated: state.auth.isAuthenticated,
      user: state.auth.user
    };
  }
  

export default connect(mapStateToProps)(CompositionItem)
