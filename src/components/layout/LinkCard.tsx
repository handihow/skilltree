import React, { Component } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import ILink from '../../models/link.model';

interface ILinkProps {
    link: ILink;
    deleteLink: Function;
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

    deleteSkill = () => {
        this.props.deleteLink(this.props.link);
    }
    
    render() {
        const {link} = this.props;
        return (
            <li key={link.id}>
                <a href={link.reference} target="_blank" rel="noopener noreferrer">
                <span style={{marginRight: '10px'}}>
                    <FontAwesomeIcon icon={[link.iconPrefix, link.iconName]} />
                </span>
                {link.title}
                </a>
                <span style={{float: 'right'}}>
                    <button className="delete" onClick={() => this.props.deleteLink(link.id)}></button>
                </span>
                
            </li>
        )
    }
}

export default LinkCard





