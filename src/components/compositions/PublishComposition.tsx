import React, { Component } from 'react'
import CompositionMenu from '../layout/CompositionMenu'
import { RouteComponentProps } from 'react-router';

type TParams =  { compositionId: string };

interface IPublishCompositionState {
    activeTab: string;
}

export class PublishComposition extends Component<RouteComponentProps<TParams>, IPublishCompositionState> {
    constructor(props: RouteComponentProps<TParams>){
        super(props);
        this.state = {
            activeTab: 'link'
        }
    }

    changeActiveTab = (tab: string) => {
        this.setState({
            activeTab: tab
        });
    }

    render() {
        const compositionId = this.props.match.params.compositionId;
        return (
            <div className="columns" style={{height:"95vh"}}>
                <div className="column is-2">
                    <CompositionMenu id={compositionId} />
                </div>
                <div className="column" style={{marginTop: "10px"}}>
                        <div className="title">Publish skilltree</div>
                        <div className="tabs">
                        <ul>
                            <li className={this.state.activeTab ==='link' ? "is-active" : undefined}>
                                <a href="# " onClick={() => this.changeActiveTab('link')}>Link</a>
                            </li>
                            <li className={this.state.activeTab ==='iframe' ? "is-active" : undefined}>
                                <a href="# " onClick={() => this.changeActiveTab('iframe')}>IFrame</a>
                            </li>
                            <li className={this.state.activeTab ==='email' ? "is-active" : undefined}>
                                <a href="# " onClick={() => this.changeActiveTab('email')}>Email</a>
                            </li>
                            <li className={this.state.activeTab ==='pdf' ? "is-active" : undefined}>
                                <a href="# " onClick={() => this.changeActiveTab('pdf')}>PDF</a>
                            </li>
                        </ul>
                        </div>
                </div>
            </div>
        )
    }
}

export default PublishComposition
