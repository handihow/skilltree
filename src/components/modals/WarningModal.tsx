import React from "react";
import { connect } from "react-redux";
import {
  hideModal,
} from "../../actions/ui";

function WarningModal(props) {
  const {
    dispatch,
    warningMessage,
    hasDismissedWarning,
    dismissedWarningFunc,
  } = props;
  return (
    <React.Fragment>
      <section className="modal-card-body">
        {hasDismissedWarning ? "One moment please..." : warningMessage}
      </section>
      <footer className="modal-card-foot">
        <button
          className="button"
          disabled={hasDismissedWarning}
          onClick={() => dispatch(hideModal())}
        >
          Cancel
        </button>
        <button
          className="button is-danger"
          disabled={hasDismissedWarning}
          onClick={() => dismissedWarningFunc()}
        >
          Delete
        </button>
      </footer>
    </React.Fragment>
  );
}

export default connect()(WarningModal);
