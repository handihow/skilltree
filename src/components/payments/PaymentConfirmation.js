import React, { Component } from 'react'
import { db } from '../../firebase/firebase';
import features from './Features';
import { Link } from 'react-router-dom';

export class PaymentConfirmation extends Component {
    
    state = {
        status: 'waiting',
        event: null,
        featureId: '',
        compositionId: '',
        unsubscribe: null
    }

    componentDidMount(){
        const currentComponent = this;
        const compositionId = this.props.match.params.compositionId;
        const featureId = this.props.match.params.featureId;
        console.log(featureId);
        console.log(compositionId);
        const unsubscribe = db.collection('payments').doc(compositionId+'_'+featureId).onSnapshot(function(doc) {
            if(doc.exists){
                const paymentRecord = doc.data();
                currentComponent.setState({
                    status: paymentRecord.success ? 'success' : 'failed',
                    event: paymentRecord.event,
                    featureId: featureId,
                    compositionId: compositionId,
                    unsubscribe: unsubscribe
                })
            }
        });;
    }

    componentWillUnmount(){
        this.state.unsubscribe();
    }
    
    render() {
        return (
            <section className="hero is-primary">
                <div className="hero-body">
                    <div className="container">
                        <h1 className="title">
                            {this.state.status === 'waiting' ? 'Waiting for confirmation' : 
                            this.state.status ==='success' ? 'Payment received' : 'Payment failed'}
                        </h1>
                        <h2 className="subtitle">
                            {this.state.status === 'waiting' ? 'Payment is not confirmed ... Please wait.' : 
                            this.state.status ==='success' ? 'Thank you for your purchase. ' + features[this.state.featureId].success : 
                            'Payment failed. See below more information about the reason of rejection.'}
                        </h2>
                            {this.state.status ==='success' ? 
                            <div className="button">
                                <Link to={`/compositions/${this.state.compositionId}/${features[this.state.featureId].redirect}`}>
                                    Try it out!
                                </Link>
                            </div> : 
                            'Payment failed. See below more information about the reason of rejection.'}
                    </div>
                </div>
            </section>
        )
    }
}

export default PaymentConfirmation
