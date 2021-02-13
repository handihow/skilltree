import React, { Component } from 'react'
import { db } from '../../../firebase/firebase';
import ImageThumb1 from '../../layout/ImageThumb1';
import ImageUploader from '../../layout/ImageUploader';
import BackgroundImage from '../../../models/backgroundimage.model';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import Header from '../../layout/Header';


interface IBackgroundEditorProps {
    doneUpdatingBackground: Function;
    compositionId: string;
}


interface IBackgroundEditorState {
    images: BackgroundImage[];
}


export class BackgroundEditor extends Component<IBackgroundEditorProps, IBackgroundEditorState> {
    constructor(props: IBackgroundEditorProps){
        super(props);
        this.state = {
            images: [],
        }
    }
    
    
    componentDidMount(){
        const currentComponent = this;
        db.collection('backgrounds')
        .orderBy('title')
        .get()
        .then(snapshots => {
            const imageData : BackgroundImage[]= [];
            snapshots.forEach(snap => imageData.push(snap.data() as BackgroundImage));
            currentComponent.setState({
                images: imageData
            })
        })

    }

    removeBackground = () => {
        db.collection('compositions').doc(this.props.compositionId).update({
            hasBackgroundImage: false
        })
        .then( _=> {
            this.props.doneUpdatingBackground();
        })
    }

    render() {
        const compositionId = this.props.compositionId;
        return (

            <React.Fragment>
            <div className="level is-mobile">
                <div className="level-left">
                    <Header header='Background' icon="image"></Header>
                </div>
                <div className="level-right">
                    <div className="level-item">
                        <button className="button is-danger is-outlined is-medium is-rounded has-tooltip-bottom" 
                        onClick={this.removeBackground} data-tooltip="Remove Background">
                            <FontAwesomeIcon icon='trash' />
                        </button>
                    </div>
                    <div className="level-item">
                        <ImageUploader compositionId={compositionId} doneUpdatingBackground={this.props.doneUpdatingBackground} />
                    </div>
                </div>
            </div>
            {this.state.images.map((image) => (
                <ImageThumb1 key={image.id} image={image} compositionId={compositionId} doneUpdatingBackground={this.props.doneUpdatingBackground}/>
            ))}
            </React.Fragment>
        )
    }
}

export default BackgroundEditor
