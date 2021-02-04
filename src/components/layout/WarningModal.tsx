import React from 'react';
import { connect } from "react-redux";
import { hideWarningModal, dismissedWarning } from '../../actions/ui';

function WarningModal(props) {
  const { dispatch, showWarningModal, warningMessage, hasDismissedWarning } = props;
  return (
    <div className={`modal ${showWarningModal ? 'is-active' : ''}`}>
        <div className="modal-background"></div>
        <div className="modal-card">
            <header className="modal-card-head">
                <p className="modal-card-title">Are you sure?</p>
                <button className="delete" aria-label="close" onClick={() => dispatch(hideWarningModal())}></button>
            </header>
            <section className="modal-card-body">
                {hasDismissedWarning ? 'One moment please...' : warningMessage  }
            </section>
            <footer className="modal-card-foot">
                <button className="button is-danger" 
                  disabled={hasDismissedWarning}
                  onClick={() => dispatch(dismissedWarning())}>Delete</button>
                <button className="button" 
                  disabled={hasDismissedWarning}
                  onClick={() => dispatch(hideWarningModal())}>Cancel</button>
            </footer>
        </div>
    </div>
  )
}

function mapStateToProps(state) {
  return {
    showWarningModal: state.ui.showWarningModal,
    warningMessage: state.ui.warningMessage,
    hasDismissedWarning: state.ui.hasDismissedWarning
  };
}


export default connect(mapStateToProps)(WarningModal);