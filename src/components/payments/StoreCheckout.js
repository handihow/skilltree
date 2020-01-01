import React from 'react';
import {Elements} from 'react-stripe-elements';

import CheckoutForm from './CheckoutForm';

class StoreCheckout extends React.Component {
  render() {
    return (
      <Elements>
        <CheckoutForm 
        clientSecret={this.props.clientSecret} 
        compositionId={this.props.compositionId}
        featureId={this.props.featureId} />
      </Elements>
    );
  }
}

export default StoreCheckout;