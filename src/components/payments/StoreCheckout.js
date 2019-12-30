import React from 'react';
import {Elements} from 'react-stripe-elements';

import CheckoutForm from './CheckoutForm';

class StoreCheckout extends React.Component {
  render() {
    return (
      <Elements>
        <CheckoutForm clientSecret={this.props.clientSecret} />
      </Elements>
    );
  }
}

export default StoreCheckout;