import React, { Component } from 'react'
import { db } from '../../firebase/firebase';
import ImageThumb1 from '../layout/ImageThumb1';
import CompositionMenu from '../layout/CompositionMenu';
import { Redirect, Link } from 'react-router-dom';
import ImageUploader from '../layout/ImageUploader';
import features from '../payments/Features';

export class CompositionBackground extends Component {
    
    state = {
        compositionId: this.props.match.params.compositionId,
        toEditor: false,
        images: [],
        hasUnlockedCustomImageUpload: false,
        featureId: 'custom-image-upload',
        unsubscribe: null
    }
    
    componentDidMount(){
        const currentComponent = this;
        db.collection('backgrounds')
        .orderBy('title')
        .get()
        .then(snapshots => {
            const imageData = [];
            snapshots.forEach(snap => imageData.push(snap.data()));
            currentComponent.setState({
                images: imageData
            })
        })
        db.collection('compositions').doc(currentComponent.state.compositionId).get()
        .then(snap => {
            const composition = snap.data();
            currentComponent.setState({
                hasUnlockedCustomImageUpload: composition.hasUnlockedCustomImageUpload ? true : false
            })
        })
        const unsubscribe = db.collection('compositions')
        .doc(currentComponent.state.compositionId)
        .collection('payments')
        .doc(currentComponent.state.featureId)
        .onSnapshot(function(doc) {
            if(doc.exists){
                const paymentRecord = doc.data();
                if(paymentRecord.success){
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
                <div className="column is-2">
                    <CompositionMenu id={this.state.compositionId} />
                </div>
                <div className="column" style={{marginTop: "10px"}}>
                        <div className="title">Customize Background</div>
                        <button className="button" onClick={this.removeBackground}>Remove background</button>
                        {this.state.hasUnlockedCustomImageUpload ? 
                        <ImageUploader compositionId={this.state.compositionId} /> :
                        <Link to={`/compositions/${this.state.compositionId}/unlock/custom-image-upload`} className="button">
                            Unlock upload ${features[this.state.featureId].amount}</Link>}
                        <hr></hr>
                        <div className="columns is-multiline is-mobile">
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
