import {
    SHOW_MODAL,
    HIDE_MODAL,
    DISMISSED_MODAL,
    WARNING_ACTION_COMPLETED
  } from "../actions/";
  
const uiReducer = (
    state = {
      showModal: false,
      dismissedModal: false,
      modalProperties: {},
      hasDismissedWarning: false
    },
    action
  ) => {
    switch (action.type) {
      case SHOW_MODAL:
        return {
          ...state,
          showModal: true,
          modalProperties: action.modalProperties,
        };
      case HIDE_MODAL:
        return {
          ...state,
          showModal: false,
          modalProperties: {},
        };
      case DISMISSED_MODAL:
        return{
          ...state,
          showModal: false,
          dismissedModal: true,
          modalProperties: {}
        };
      case WARNING_ACTION_COMPLETED:
        return {
          ...state,
          showModal: false,
          warningMessage: '',
          hasDismissedWarning: true
        };
      default:
        return state;
    }
  };

export default uiReducer;