import React from 'react';

export default function WarningModal(props) {
  return (
    <div className="modal is-active">
        <div className="modal-background"></div>
        <div className="modal-card">
            <header className="modal-card-head">
                <p className="modal-card-title">Are you sure?</p>
                <button className="delete" aria-label="close" onClick={props.toggleShowWarningMessage}></button>
            </header>
            <section className="modal-card-body">
                {props.warningMessage}
            </section>
            <footer className="modal-card-foot">
                <button className="button is-danger" onClick={(event) => props.confirmedWarningFunction(event)}>Delete</button>
                <button className="button" onClick={props.toggleShowWarningMessage}>Cancel</button>
            </footer>
        </div>
    </div>
  )
}


