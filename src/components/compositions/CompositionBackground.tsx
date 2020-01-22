import React, { Component } from 'react'
import { db } from '../../firebase/firebase';
import ImageThumb1 from '../layout/ImageThumb1';
import CompositionMenu from '../layout/CompositionMenu';
import { Redirect, Link } from 'react-router-dom';
import ImageUploader from '../layout/ImageUploader';
import features from '../payments/Features';
import { RouteComponentProps } from 'react-router-dom';
import BackgroundImage from '../../models/backgroundimage.model';

type TParams =  { compositionId: string };

interface ICompositionBackgroundState {
    toEditor: boolean;
    images: BackgroundImage[];
    hasUnlockedCustomImageUpload: boolean;
    unsubscribe?: any;
}

const featureId = 'custom-image-upload';

export class CompositionBackground extends Component<RouteComponentProps<TParams>, ICompositionBackgroundState> {
    constructor(props: RouteComponentProps<TParams>){
        super(props);
        this.state = {
            toEditor: false,
            images: [],
            hasUnlockedCustomImageUpload: false
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
        const unsubscribe = db.collection('compositions')
        .doc(currentComponent.props.match.params.compositionId)
        .collection('payments')
        .doc(featureId)
        .onSnapshot(function(doc) {
            if(doc.exists){
                const paymentRecord = doc.data();
                if(paymentRecord?.success){
                    currentComponent.setState({
                        hasUnlockedCustomImageUpload: true,
                    })
                }
            }
        });
        currentComponent.setState({
            unsubscribe: unsubscribe
        })
    }

    componentWillUnmount(){
        this.state.unsubscribe();
    }

    removeBackground = () => {
        db.collection('compositions').doc(this.props.match.params.compositionId).set({
            hasBackgroundImage: false
        }, {merge: true})
        .then( _=> {
            this.setState({
                toEditor: true
            })
        })
    }

    render() {
        const compositionId = this.props.match.params.compositionId;
        return (
            this.state.toEditor ? 
            <Redirect to={`/compositions/${compositionId}`}/> :
            <div className="columns is-mobile" style={{height:"95vh"}}>
                <div className="column is-2">
                    <CompositionMenu id={compositionId} />
                </div>
                <div className="column" style={{marginTop: "10px"}}>
                        <div className="title">Customize Background</div>
                        <button className="button" onClick={this.removeBackground}>Remove background</button>
                        {this.state.hasUnlockedCustomImageUpload ? 
                        <ImageUploader compositionId={compositionId} /> :
                        <Link to={`/compositions/${compositionId}/unlock/custom-image-upload`} className="button">
                            Unlock upload ${features[featureId].amount}</Link>}
                        <hr></hr>
                        <div className="columns is-multiline is-mobile">
                            {this.state.images.map((image) => (
                                <ImageThumb1 key={image.id} image={image} compositionId={compositionId}/>
                            ))}
                        </div>
                </div>
            </div>
        )
    }
}

export default CompositionBackground
