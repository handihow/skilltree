import React from 'react'
import CompositionItem from './CompositionItem';
import IComposition from '../../models/composition.model';
import YouTube from 'react-youtube';

interface ICompositionsProps {
    compositions: IComposition[];
    editCompositionTitle: Function;
    deleteComposition: Function;
}

export default function Compositions(props: ICompositionsProps) {
    return (
        props.compositions.length === 0 ? 
        
        <React.Fragment>
        <article className="message is-primary">
            <div className="message-header">No SkillTrees yet.. </div>
        <div className="message-body">
            <div className="content">
                <p>You can add a new SkillTree clicking on the button top right.</p>
            </div>
        </div>
        </article>
        <h5 className="title is-5">Watch the video for more information</h5>
            <YouTube
                    videoId="RGJJt1Vl3Ro"
                    opts = {{height: '300', width: '550'}}/>
        
        </React.Fragment>
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

