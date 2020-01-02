import React, { Component } from 'react'
import PropTypes from 'prop-types';
import CompositionItem from './CompositionItem';

export class Compositions extends Component {
    
    render() {
        return (
            this.props.compositions.length === 0 ? 
            <div>Start by adding a skill tree page...</div> : 
            this.props.compositions.map(composition => (
                <CompositionItem key={composition.id} composition={composition} delComposition={this.props.delComposition} />
            ))
        )
    }
}

// Proptypes
Compositions.propTypes = {
    compositions: PropTypes.array.isRequired,
    delComposition: PropTypes.func.isRequired
}

export default Compositions
