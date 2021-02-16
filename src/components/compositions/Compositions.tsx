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
        
        <article className="message is-primary">
            <div className="message-header">No SkillTrees yet.. </div>
        <div className="message-body">
            <div className="content">
                <p>You can add a new SkillTree clicking on the button top right.</p>
            </div>
        </div>
        </article>
        
             : 
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

