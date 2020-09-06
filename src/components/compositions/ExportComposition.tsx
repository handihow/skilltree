import React, { Component } from 'react'
import { RouteComponentProps } from 'react-router';
import CompositionMenu from '../layout/CompositionMenu'
import Header from '../layout/Header';

type TParams =  { compositionId: string };

export class ExportComposition extends Component<RouteComponentProps<TParams>> {
    
    openEmailClient = () => {
        window.location.href = `mailto:office@handihow.com?subject=Feedback%20on%20skilltree%20app&body=Your%20feedback%20on%20skilltree%20app...`;
    }
    
    render() {
        const compositionId = this.props.match.params.compositionId;
        return (
            <div className="columns is-mobile" style={{height:"95vh"}}>
                <div className="column is-2">
                    <CompositionMenu id={compositionId} />
                </div>
                <div className="column" style={{marginTop: "30px"}}>
                        <Header header='Export' icon="file-export"></Header>
                        <hr></hr>
                        <p>Do you want to export to PDF?</p>
                        <p>Let us know your feedback and feature requests!</p>
                        <hr></hr>
                        <button className="button" onClick={this.openEmailClient}>Email HandiHow</button>
                </div>
            </div>
        )
    }
}

export default ExportComposition
