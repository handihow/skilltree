import {
    SHOW_WARNING_MODAL,
    HIDE_WARNING_MODAL,
    DISMISSED_WARNING,
    WARNING_ACTION_COMPLETED
  } from "../actions/";
  
const uiReducer = (
    state = {
      showWarningModal: false,
      warningMessage: '',
      hasDismissedWarning: false
    },
    action
  ) => {
    switch (action.type) {
      case SHOW_WARNING_MODAL:
        return {
          ...state,
          showWarningModal: true,
          warningMessage: action.warningMessage
        };
      case HIDE_WARNING_MODAL:
        return {
          ...state,
          showWarningModal: false,
          warningMessage: '',
        };
      case DISMISSED_WARNING:
        return {
          ...state,
          hasDismissedWarning: true
        };
      case WARNING_ACTION_COMPLETED:
        return {
          ...state,
          showWarningModal: false,
          warningMessage: '',
          hasDismissedWarning: false
        };
      default:
        return state;
    }
  };

export default uiReducer;