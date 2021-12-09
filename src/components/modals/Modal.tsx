import { connect } from "react-redux";
import LinkFileUploader from "./LinkFileUploader";
import YouTubeForm from "./YouTubeForm";
import LinkForm from "./LinkForm";
import LinkQuiz from "./LinkQuiz";
import { hideModal } from "../../actions/ui";

function Modal(props: {
  dispatch: any;
  showModal: boolean;
  modalProperties: any;
}) {
  const { dispatch, showModal, modalProperties } = props;
  return (
    <div
      className={`modal ${showModal ? "is-active" : ""}`}
      style={{ position: "fixed" }}
    >
      <div className="modal-background"></div>
      <div className="modal-card">
      <header className="modal-card-head">
          <p className="modal-card-title">{modalProperties?.title}</p>
          <button
            className="delete"
            aria-label="close"
            onClick={() => dispatch(hideModal())}
          ></button>
        </header>
        {modalProperties?.id === "file" && (
          <LinkFileUploader addLink={modalProperties.addLink} />
        )}
        {modalProperties?.id === "youtube" && (
          <YouTubeForm addLink={modalProperties.addLink} />
        )}
        {modalProperties?.id === "link" && (
          <LinkForm addLink={modalProperties.addLink} />
        )}
        {modalProperties?.id === "quiz" && (
          <LinkQuiz addQuiz={modalProperties.addQuiz} />
        )}
      </div>
    </div>
  );
}

function mapStateToProps(state) {
  return {
    showModal: state.ui.showModal,
    modalProperties: state.ui.modalProperties,
  };
}

export default connect(mapStateToProps)(Modal);
