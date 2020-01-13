import React, { Component } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import ILink from '../../models/link.model';

interface ILinkProps {
    link: ILink;
    deleteLink?: Function;
    selectLink?: Function;
    isSelected?: boolean;
}

interface ILinkState{
    isActive: boolean;
}

export class LinkCard extends Component<ILinkProps, ILinkState> {

    constructor(props: ILinkProps){
        super(props);
        this.state = {
            isActive: false
        };
    }
    
    render() {
        const {link} = this.props;
        return (
            <article className="media">
                <figure className="media-left">
                <p className="image is-64x64">
                    <img src={link.imageUrl? link.imageUrl: "https://bulma.io/images/placeholders/128x128.png"} alt='' />
                </p>
                </figure>
                <div className="media-content">
                <div className="content">
                    <p>
                    <a href={link.reference} target="_blank" rel="noopener noreferrer">
                    <span style={{marginRight: '10px'}}>
                        <FontAwesomeIcon icon={[link.iconPrefix, link.iconName]} />
                    </span>
                    {link.title}
                    </a>
                    {link.description && <React.Fragment>
                    <br></br>{link.description}</React.Fragment>}
                    </p>
                </div>
                </div>
                <div className="media-right">
                {typeof this.props.deleteLink !=='undefined' ?
                <button className="delete" onClick={() => this.props.deleteLink!(link.id)}></button> : null}
                {typeof this.props.selectLink !=='undefined' ?
                <button className={`button ${this.props.isSelected ? "is-success" : ""}`} 
                onClick={() => this.props.selectLink!(link)}>Select</button> : null}
                </div>
            </article>
        )
    }
}

export default LinkCard





