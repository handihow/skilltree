import {iconImages} from '../../services/StandardData';


export default function IconPicker({closeModal, iconPicked}) {
    return (
        <div className="modal is-active">
        <div className="modal-background"></div>
        <div className="modal-card">
            <header className="modal-card-head">
            <p className="modal-card-title">Choose icon</p>
            <button className="delete" aria-label="close" onClick={closeModal}></button>
            </header>
            <section className="modal-card-body">
            <div className="columns is-multiline">
            {iconImages.map((image, index) => (
                <div key={index} className="column is-one-quarter-desktop is-half-tablet">
                <div className="card">
                    <div className="card-image">
                        <figure className="image is-2by2">
                        <img src={image.link} alt=""></img>
                        </figure>
                        <div className="card-content is-overlay is-clipped">
                        <span className="tag is-info">
                            {image.category}
                        </span>       
                        </div>
                    </div>
                    <footer className="card-footer">
                        <a href="# " className="card-footer-item" onClick={() => iconPicked(image.link)}>
                        {image.title}
                        </a>
                    </footer>
                </div>
            </div>
            ))}
        </div>
            </section>
            <footer className="modal-card-foot">
                <button className="button" onClick={closeModal}>Cancel</button>
                <button className="button is-danger" onClick={() => iconPicked(null)}>Remove icon</button>
            </footer>
        </div>
        </div>

        
    )
}
