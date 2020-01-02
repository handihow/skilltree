import React, { Component } from 'react'
import { db, storage } from '../../firebase/firebase';
import CompositionDisplay from '../layout/CompositionDisplay';
import CompositionMenu from '../layout/CompositionMenu';
import Loading from '../layout/Loading';

export class Composition extends Component {
    
    state = {
        id: '',
        composition: {},
        hasBackgroundImage: false,
        backgroundImage: null,
        skilltrees: []
    }

    componentDidMount() {
        const compositionId = this.props.match.params.compositionId;
        db.collection("compositions").doc(compositionId).get()
        .then(doc => {
            const composition = doc.data();
            db.collection("compositions").doc(compositionId)
            .collection("skilltrees").orderBy('order').get()
            .then(querySnapshot => {
                const data = querySnapshot.docs.map(doc => doc.data());
                if(composition.hasBackgroundImage){
                    //fetch the background image
                    const storageRef = storage.ref();
                    const imageRef = storageRef.child(composition.backgroundImage);
                    imageRef.getDownloadURL()
                    .then(url => {
                        this.setState({
                            id: compositionId, 
                            composition, 
                            hasBackgroundImage: true, 
                            backgroundImage: url, 
                            skilltrees: data
                        });
                    });
                } else {
                    this.setState({id: compositionId, composition, skilltrees: data });
                }
            });
        });
    }

    render() {
        return (
            this.state.skilltrees.length===0 ? 
            <Loading /> :
            <div className="columns">
                <div className="column is-one-fifth">
                    <CompositionMenu id={this.state.id}/>
                </div>
                <div className="column" style={this.state.hasBackgroundImage ? 
                                                {
                                                    backgroundImage: `url(${this.state.backgroundImage})`,
                                                    backgroundSize: 'cover',
                                                    position : 'relative',
                                                    height:"95vh"
                                                }
                                                : null}>
                    <div style={{maxHeight:'100%',overflow:'auto'}}>
                    <CompositionDisplay
                    theme={this.state.composition.theme} 
                    skilltrees={this.state.skilltrees} /></div>
                </div>
            </div>
        )
    }
}

export default Composition
