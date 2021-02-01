import React, { Component } from 'react'
import youtubeSearch from "youtube-search";
import {youtubeAPIKey} from '../../../firebase/firebase'; 
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { toast } from 'react-toastify';
import ILink from '../../../models/link.model';
import {v4 as uuid} from "uuid"; 
import LinkCard from '../../layout/LinkCard';

const opts: youtubeSearch.YouTubeSearchOptions = {
  maxResults: 10,
  key: youtubeAPIKey
};

interface IYouTubeFormProps {
    isShowYouTubeModal: boolean;
    toggleYouTubeModal: Function;
    addLink: Function;
}

interface IYouTubeFormState {
    searchTerm?: string;
    hasSearchResults?: boolean;
    links?: ILink[];
    selectedVideo?: any;
}

export class YouTubeForm extends Component<IYouTubeFormProps, IYouTubeFormState> {

    constructor(props: IYouTubeFormProps){
        super(props);
        this.state = {};
    }

    searchYouTube = () => {
        if(this.state.searchTerm){
            youtubeSearch(this.state.searchTerm, opts, (err, results) => {
                if(err || !results) return toast.error(err);
                
                const links : ILink[] = results?.map(r => {
                    const link : ILink = {
                        id: r.id ? r.id : uuid(),
                        iconName: 'youtube-square',
                        iconPrefix: 'fab',
                        reference: r.link ? r.link : '',
                        title: r.title ? r.title : '',
                        description: r.description ? r.description : '',
                        imageUrl: r.thumbnails && r.thumbnails.high && r.thumbnails.high.url ? r.thumbnails.high.url : ''
                    };
                    return link;
                });
                this.setState({
                    hasSearchResults: true,
                    links: links
                })
            });
        }
    }

    selectYouTubeLink = (link: ILink) => {
        this.setState({
            selectedVideo: link
        })
    }

    saveYouTubeLink = () => {
        this.props.addLink(this.state.selectedVideo);
        this.closeModal()
    }

    handleChange = (e: React.FormEvent<HTMLInputElement>) => {
        this.setState({
            searchTerm: e.currentTarget.value
        })
    }

    closeModal = () =>{
        this.setState({
            searchTerm: '',
            links: [],
            hasSearchResults: false,
            selectedVideo: null
        })
        this.props.toggleYouTubeModal();
    }

    render() {
        return (
            <div className={`modal ${this.props.isShowYouTubeModal ? "is-active" : ""}`}>
                <div className="modal-background"></div>
                <div className="modal-card">
                <header className="modal-card-head">
                    <p className="modal-card-title">Search YouTube</p>
                    <button className="delete" aria-label="close" onClick={this.closeModal}></button>
                </header>
                <section className="modal-card-body">
                <div className="field has-addons">
                <div className="control has-icons-left is-expanded">
                    <input className="input" type="text" placeholder="Search YouTube"
                            name="searchTerm" onChange={this.handleChange} 
                            value={this.state.searchTerm ? this.state.searchTerm : ''} />
                    <span className="icon is-small is-left">
                    <FontAwesomeIcon icon={['fab', 'youtube-square']} />
                    </span>
                    <p className="help">Enter a search term to find videos on YouTube</p>
                </div>
                <div className="control">
                    <button className="button" onClick={this.searchYouTube}>
                        Search
                    </button>
                </div>
                </div>
                {this.state.hasSearchResults && this.state.links?.map((link) =>(
                    <LinkCard link={link} key={link.id} selectLink={this.selectYouTubeLink}
                        isSelected={this.state.selectedVideo && this.state.selectedVideo.id === link.id ? true: false}/>
                ))}
                </section>
                <footer className="modal-card-foot">
                    <button className="button is-success" onClick={this.saveYouTubeLink}
                        disabled={this.state.selectedVideo ? false : true}>Save</button>
                    <button className="button" onClick={this.closeModal}>Cancel</button>
                </footer>
                </div>
            </div>
        )
    }
}

export default YouTubeForm
