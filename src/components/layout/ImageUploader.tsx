import React, { Component } from 'react'
import FileUploader from "react-firebase-file-uploader";
import { db, storage } from '../../firebase/firebase';
import { Redirect } from 'react-router-dom';

interface IImageUploaderProps {
    compositionId: string;
}

interface IImageUploaderState {
    toEditor: boolean;
    isUploading: boolean;
    progress: number;
    uploadedBackgroundFile: string;
    uploadedBackgroundUrl: string;
}

export class ImageUploader extends Component<IImageUploaderProps, IImageUploaderState> {
    constructor(props: IImageUploaderProps){
        super(props);
        this.state = {
            toEditor: false,
            isUploading: false,
            progress: 0,
            uploadedBackgroundFile: '',
            uploadedBackgroundUrl: ''
        };
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
        db.collection('compositions').doc(this.props.compositionId).set({
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

    render() {
        return (
            this.state.toEditor ? 
            <Redirect to={`/compositions/${this.props.compositionId}`}/> :
            <React.Fragment>
            <label className="button is-primary">
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
            </React.Fragment>
        )
    }
}

export default ImageUploader
