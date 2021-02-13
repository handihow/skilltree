import React, { Component } from 'react'
import FileUploader from "react-firebase-file-uploader";
import { db, storage } from '../../firebase/firebase';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

interface IImageUploaderProps {
    compositionId: string;
    doneUpdatingBackground: Function;
}

interface IImageUploaderState {
    isUploading: boolean;
    progress: number;
    uploadedBackgroundFile: string;
    uploadedBackgroundUrl: string;
}

export class ImageUploader extends Component<IImageUploaderProps, IImageUploaderState> {
    constructor(props: IImageUploaderProps){
        super(props);
        this.state = {
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
            this.props.doneUpdatingBackground();

        })
    }

    cancelUseBackground = () => {
        this.props.doneUpdatingBackground();
    }

    render() {
        return (
            <React.Fragment>
            <label className="button is-primary is-medium is-primary is-outlined is-rounded has-tooltip-bottom" data-tooltip="Upload Image">
            <FontAwesomeIcon icon='upload' />
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
                <div className="modal is-active">
                  <div className="modal-background"></div>
                  <div className="modal-card">
                    <header className="modal-card-head">
                      <p className="modal-card-title">Custom Image As Background</p>
                      <button className="delete" aria-label="close" onClick={this.cancelUseBackground}></button>
                    </header>
                    <section className="modal-card-body">
                      <img className="image is-3-by-2" src={this.state.uploadedBackgroundUrl} alt=""></img>
                    </section>
                    <footer className="modal-card-foot">
                      <button className="button is-success" onClick={this.useBackground}>Use this background</button>
                      <button className="button" onClick={this.cancelUseBackground}>Cancel</button>
                    </footer>
                  </div>
                </div>
            }
            </React.Fragment>
        )
    }
}

export default ImageUploader
