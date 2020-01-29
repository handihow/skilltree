import React from 'react'
import CompositionItem from './CompositionItem';
import IComposition from '../../models/composition.model';

interface ICompositionsProps {
    compositions: IComposition[];
    editCompositionTitle: Function;
    deleteComposition: Function;
}

export default function Compositions(props: ICompositionsProps) {
    return (
        props.compositions.length === 0 ? 
        <div>Start by adding a skill tree page...</div> : 
        <React.Fragment>
        {props.compositions?.map((composition) => (
            <CompositionItem key={composition.id} composition={composition} 
            editCompositionTitle={props.editCompositionTitle}
            deleteComposition={props.deleteComposition}
             />
        ))}
        </React.Fragment>
    )
}

