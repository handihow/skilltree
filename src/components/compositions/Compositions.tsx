import React from 'react'
import CompositionItem from './CompositionItem';
import IComposition from '../../models/composition.model';

interface ICompositionsProps {
    compositions: IComposition[];
    delComposition: Function;
}

export default function Compositions(props: ICompositionsProps) {
    return (
        props.compositions.length === 0 ? 
        <div>Start by adding a skill tree page...</div> : 
        props.compositions?.map(composition => (
            <CompositionItem key={composition.id} composition={composition} delComposition={props.delComposition} />
        ))
    )
}

