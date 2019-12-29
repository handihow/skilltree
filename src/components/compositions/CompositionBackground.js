import React, { Component } from 'react'
import { db, storage } from '../../firebase/firebase';
import ImageThumb1 from '../layout/ImageThumb1';
import CompositionMenu from '../layout/CompositionMenu';
import FileUploader from "react-firebase-file-uploader";
import { Redirect } from 'react-router-dom';

export class CompositionBackground extends Component {
    
    state = {
        compositionId: this.props.match.params.compositionId,
        toEditor: false,
        images: [],
        isUploading: false,
        progress: 0,
        uploadedBackgroundFile: '',
        uploadedBackgroundUrl: ''
    }
     
    handleUploadStart = () => this.setState({ isUploading: true, progress: 0 });
    
    handleProgress = progress => this.setState({ progress });
    
    handleUploadError = error => {
        this.setState({ isUploading: false });
        console.error(error);
    };
    
    handleUploadSuccess = filename => {
        this.setState({ uploadedBackgroundFile: filename, progress: 100, isUploading: false });
        storage
          .ref("images")
          .child(filename)
          .getDownloadURL()
          .then(url => this.setState({ uploadedBackgroundUrl: url }));
    };

    useBackground = () => {
        const backgroundFile =  this.state.uploadedBackgroundFile;
        const thumbnailFile = backgroundFile.split('.')[0] + '_128x128.'+ backgroundFile.split('.')[1];
        db.collection('compositions').doc(this.state.compositionId).set({
            backgroundImage: 'images/' + backgroundFile,
            thumbnailImage: 'images/' + thumbnailFile,
            hasBackgroundImage: true,
        }, {merge: true})
        .then( _=> {
            this.setState({
                toEditor: true
            })
        })
    }
    
    componentDidMount(){
        db.collection('backgrounds')
        .orderBy('title')
        .get()
        .then(snapshots => {
            const imageData = [];
            snapshots.forEach(snap => imageData.push(snap.data()));
            this.setState({
                images: imageData
            })
        })
    }

    removeBackground = () => {
        db.collection('compositions').doc(this.state.compositionId).set({
            hasBackgroundImage: false
        }, {merge: true})
        .then( _=> {
            this.setState({
                toEditor: true
            })
        })
    }

    render() {
        return (
            this.state.toEditor ? 
            <Redirect to={`/compositions/${this.state.compositionId}`}/> :
            <div className="columns" style={{height:"95vh"}}>
                <div className="column is-one-fifth">
                    <CompositionMenu id={this.state.compositionId} />
                </div>
                <div className="column">
                    <div className="buttons">
                    <button className="button" onClick={this.removeBackground}>Remove background</button>
                    <label className="button">
                    Upload background
                    <FileUploader
                        accept="image/*"
                        name="avatar"
                        hidden
                        randomizeFilename
                        storageRef={storage.ref("images")}
                        onUploadStart={this.handleUploadStart}
                        onUploadError={this.handleUploadError}
                        onUploadSuccess={this.handleUploadSuccess}
                        onProgress={this.handleProgress}
                    />
                    </label>
                    </div>
                    {this.state.isUploading && <progress className="progress is-primary" 
                    value={this.state.progress} max="100">{this.state.progress}%</progress>}
                    {this.state.uploadedBackgroundUrl && 
                        <div className="columns">
                            <div className="column is-three-quarters">
                                <img className="image is-3-by-2" src={this.state.uploadedBackgroundUrl} alt=""></img>
                            </div>
                            <div className="column is-one-quarter">
                                <button className="button" onClick={this.useBackground}>Use this background</button>
                            </div>
                        </div>
                    }
                    
                    <hr></hr>
                    <div className="columns is-multiline">
                        {this.state.images.map((image) => (
                            <ImageThumb1 key={image.id} image={image} compositionId={this.state.compositionId}/>
                        ))}
                    </div>
                </div>
            </div>
        )
    }
}

export default CompositionBackground
