import React, { Component } from 'react'
import { functions } from '../../firebase/firebase';
import features from './Features';
import Loading from '../layout/Loading';
import {StripeProvider} from 'react-stripe-elements';
import StoreCheckout from './StoreCheckout';

export class Payments extends Component {
    constructor(props) {
        super(props);
        this.state = {
            isLoading: true,
            compositionId: '',
            featureId: '',
            title: '',
            description: '',
            amount: '',
            currency: '',
            clientSecret: ''
        }
    }
   

    componentDidMount(){
        let currentComponent = this;
        const compositionId = this.props.match.params.compositionId;
        const featureId = this.props.match.params.featureId;
        const amount = features[featureId].amount;
        const currency = features[featureId].currency;
        const secretRequest = functions.httpsCallable('secret');
        secretRequest({
            amount,
            currency,
            compositionId,
            featureId
        }).then(function(result) {
            if(result.data.error){
                return console.error(result.data.error);
            }
            // Read result of the Cloud Function.
            currentComponent.setState({
                title: features[featureId].title,
                description: features[featureId].description,
                amount: amount,
                currency: currency,
                clientSecret: result.data.result,
                featureId: featureId,
                compositionId: compositionId,
                isLoading: false
            })
          }).catch(function(error) {
            // Getting the Error details.
            console.log(error.message)
            // ...
          });;
    }

    render() {
        return (
            this.state.isLoading ? 
            <Loading /> : 
            <React.Fragment>
            <section className="hero is-primary">
                <div className="hero-body">
                    <div className="container">
                        <h1 className="title">
                            {this.state.title}
                        </h1>
                        <h2 className="subtitle">
                            Pay ${this.state.amount},- to unlock
                        </h2>
                        {this.state.description}
                    </div>
                </div>
                
            </section>
            <section className="section">
                <div className="container">
                    <div className="box">
                        <div className="title is-5">Enter your credit card information</div>
                        <StripeProvider apiKey="pk_test_2mPZastNCiUv7dQQmesE21G8003EqXrrN3">
                            <StoreCheckout 
                            clientSecret={this.state.clientSecret}
                            compositionId={this.state.compositionId}
                            featureId={this.state.featureId} />
                        </StripeProvider>
                    </div>
                </div>
            </section>
            </React.Fragment>
        )
    }
}

export default Payments
