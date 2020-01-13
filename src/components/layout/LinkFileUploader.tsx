import React, { Component } from 'react'
import FileUploader from "react-firebase-file-uploader";
import { storage } from '../../firebase/firebase';
import ILink from '../../models/link.model';
import { toast } from 'react-toastify';
import uuid from 'uuid';

interface ILinkFileUploaderProps {
    isShowFileModal: boolean;
    toggleFileModal: Function;
    addLink: Function;
}

interface ILinkFileUploaderState {
    isUploading: boolean;
    progress: number;
    link?: ILink;
}

export class LinkFileUploader extends Component<ILinkFileUploaderProps, ILinkFileUploaderState> {
    constructor(props: ILinkFileUploaderProps){
        super(props);
        this.state = {
            isUploading: false,
            progress: 0,
        }
    }

    handleUploadStart = () => this.setState({ isUploading: true, progress: 0 });
    
    handleProgress = (progress : number) => this.setState({ progress });
    
    handleUploadError = (error : any) => {
        this.setState({ isUploading: false });
        toast.error(error);
    };

    closeModal = () =>{
        this.setState({
            isUploading: false,
            progress: 0,
            link: undefined
        })
        this.props.toggleFileModal();
    }
    
    handleUploadSuccess = (filename) => {
        this.setState({ progress: 100, isUploading: false });
        storage
          .ref("files")
          .child(filename)
          .getDownloadURL()
          .then((url : string) => {
                const link : ILink = {
                    id: uuid.v4(),
                    reference: url,
                    iconName: 'file',
                    iconPrefix: 'fas',
                    title: filename,
                    imageUrl: 'https://cdn.pixabay.com/photo/2013/07/13/11/36/documents-158461_1280.png',
                    filename: filename
                }
                this.setState({
                    link: link
                });
          })
          .catch(error => toast.error(error));
    };

    saveFileLink = () => {
        this.props.addLink(this.state.link)
        this.closeModal()
    }

    handleChange = (e: React.FormEvent<HTMLInputElement>) => {
        if(this.state.link){
            this.setState({
                link: {...this.state.link, [e.currentTarget.name]: e.currentTarget.value}
            })
        }
    }

    render() {
        return (
            <div className={`modal ${this.props.isShowFileModal ? "is-active" : ""}`}>
                <div className="modal-background"></div>
                <div className="modal-card">
                <header className="modal-card-head">
                    <p className="modal-card-title">Upload file</p>
                    <button className="delete" aria-label="close" onClick={this.closeModal}></button>
                </header>
                <section className="modal-card-body">
                {!this.state.link && 
                    <React.Fragment>
                    <h6 className="title is-6">Click button to start uploading the file...</h6>
                    <hr></hr>
                    <label className="button">
                    Upload file
                    <FileUploader
                        name="file"
                        hidden
                        storageRef={storage.ref("files")}
                        onUploadStart={this.handleUploadStart}
                        onUploadError={this.handleUploadError}
                        onUploadSuccess={this.handleUploadSuccess}
                        onProgress={this.handleProgress}
                    />
                    </label></React.Fragment>}
                    {this.state.isUploading && <progress className="progress is-primary" 
                    value={this.state.progress} max="100">{this.state.progress}%</progress>}
                    {this.state.link && 
                    <React.Fragment>
                    <h6 className="title is-6">Successfully uploaded file!</h6>
                    <div>File name is: {this.state.link.filename}</div>
                    <div>You can now click save to add it to the skill, or change the title and description first.</div>
                    <hr></hr>
                    <div className="field">
                        <label className="label">Title</label>
                        <div className="control">
                        <input className="input" type="text" placeholder="Enter title"
                                name="title" onChange={this.handleChange} 
                                value={this.state.link && this.state.link.title ? this.state.link.title : ''} />
                        </div>
                        <p className="help">You can change the title displayed on the link (defaults to the file name)</p>
                    </div>
                    <div className="field">
                        <label className="label">Description</label>
                        <div className="control">
                            <input className="input" type="text" placeholder="Enter description (optional)"
                                    name="description" onChange={this.handleChange} 
                                    value={this.state.link && this.state.link.description ? this.state.link.description : ''} />
                            <p className="help">Optionally, you can enter a description of the file you uploaded</p>
                        </div>
                    </div>
                    </React.Fragment>}
                </section>
                <footer className="modal-card-foot">
                    <button className="button is-success" onClick={this.saveFileLink}
                        disabled={this.state.link ? false : true}>Save</button>
                    <button className="button" onClick={this.closeModal}>Cancel</button>
                </footer>
                </div>
            </div>
        )
    }
}

export default LinkFileUploader
