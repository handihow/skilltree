import React, { Component } from 'react'
import {storage} from '../../firebase/firebase';
import { db } from '../../firebase/firebase';
import { Redirect } from 'react-router-dom';
import IBackgroundImage from '../../models/backgroundimage.model';
import firebase from 'firebase/app';

interface IImageThumb1Props {
    image: IBackgroundImage;
    compositionId: string;
}

interface IImageThumb1State {
    reference: string;
    toEditor: boolean;
}

export class ImageThumb1 extends Component<IImageThumb1Props, IImageThumb1State> {
    
    constructor(props: IImageThumb1Props){
        super(props);
        this.state = {
            reference: 'https://via.placeholder.com/300x200.png?text=Skilltree',
            toEditor: false
        };
    }

    componentDidMount(){
        const storageRef = storage.ref();
        const imageRef = storageRef.child(this.props.image.thumb1);
        imageRef.getDownloadURL()
        .then(url => {
            this.setState({reference: url});
        });
    }

    selectBackground = () => {
        db.collection('compositions').doc(this.props.compositionId).set({
            backgroundImage: this.props.image.reference,
            thumbnailImage: this.props.image.thumb2,
            hasBackgroundImage: true,
            lastUpdate: firebase.firestore.Timestamp.now()
        }, {merge: true})
        .then( _ => {
            this.setState({toEditor: true})
        });
    }
    
    render() {
        return (
            this.state.toEditor ? 
            <Redirect to={`/compositions/${this.props.compositionId}`}/> :
            <div className="column is-one-quarter-desktop is-one-third-tablet is-half-mobile">
                <div className="card">
                    <div className="card-image">
                        <figure className="image is-3-by-2">
                            <img src={this.state.reference} alt=""></img>
                        </figure>
                    </div>
                    <footer className="card-footer">
                        <a className="card-footer-item" href="# "
                        onClick={this.selectBackground}>{this.props.image.title}</a>
                    </footer>
                </div>
            </div>
        )
    }
}

export default ImageThumb1
