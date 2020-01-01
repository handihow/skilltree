import React from 'react';
import {injectStripe} from 'react-stripe-elements';
import { toast } from 'react-toastify';

import CardSection from './CardSection';
import { Redirect } from 'react-router-dom';
import features from './Features';
import { Link } from 'react-router-dom';

class CheckoutForm extends React.Component {

  state = {
    toPaymentConfirmation: false
  }

  handleSubmit = (ev) => {
    // We don't want to let default form submission happen here, which would refresh the page.
    ev.preventDefault();

    // See our confirmCardPayment documentation for more:
    // https://stripe.com/docs/stripe-js/reference#stripe-confirm-card-payment
    this.props.stripe.confirmCardPayment(this.props.clientSecret, {
      payment_method: {
        card: this.props.elements.getElement('card'),
        billing_details: {
          name: 'Guest',
        },
      }
    })
    .then(result => {
      if(result.paymentIntent && result.paymentIntent.status==='succeeded'){
        this.setState({
          toPaymentConfirmation: true
        })
      } else if(result.error && result.error.message) {
        toast.error(result.error.message);
      }
    })
    .catch(err => {
      toast.error(err.message);
    });
  };

  render() {
    return (
      this.state.toPaymentConfirmation 
        ? <Redirect to={`/compositions/${this.props.compositionId}/confirmation/${this.props.featureId}`}/> :
        <form onSubmit={this.handleSubmit}>
        <CardSection />
        <div className="level" style={{marginTop:"20px"}}>
          <div className="level-left">
        <button className="button is-success" 
        >Confirm order ${features[this.props.featureId].amount},-</button>
        <button className="button" style={{marginLeft:"5px"}}><Link to={`/compositions/${this.props.compositionId}/${features[this.props.featureId].redirect}`} 
                            >Cancel</Link></button>
        </div>
        </div>
      </form>
    );
  }
}


export default injectStripe(CheckoutForm);