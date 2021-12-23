import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { toast } from 'react-toastify';

const copyToClipboard = (url) => {
    if(!url) return;
    navigator.clipboard.writeText(url);
    toast.info('Link copied to clipboard!');
    
}

export default function ShareLinkModal({url, toggleShareLinkModal}) {
    return (
        <div className='modal is-active'>
        <div className="modal-background"></div>
        <div className="modal-card">
            <header className="modal-card-head">
                <p className="modal-card-title">Share your skilltree</p>
                <button className="delete" aria-label="close" onClick={() => toggleShareLinkModal()}></button>
            </header>
            <section className="modal-card-body">
                <p>
                    Here is the generated link to view your skilltree!
                </p>
                <p>
                    You can copy the link and distribute it in your favorite way.
                </p>
                <div className="level" style={{margin: "20px"}}>
                    <div className="level-left">
                    <div className="level-item">
                            <button className="button" onClick={() => copyToClipboard(url)}
                                data-tooltip="Copy link to clipboard">
                            <FontAwesomeIcon icon="copy" />
                            </button>
                        </div>
                        <div className="level-item">
                            <div className="title is-6">
                                <a href={url || ''} target="_blank"
                                    rel="noopener noreferrer">{url}</a>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
            <footer className="modal-card-foot">
                <button className="button" 
                  onClick={() => toggleShareLinkModal()}>Cancel</button>
                <button className="button is-info" onClick={() => copyToClipboard(url)}>
                    Copy link to clipboard
                </button>
            </footer>
        </div>
    </div>
    )
}
