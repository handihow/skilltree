export const SHOW_WARNING_MODAL = "SHOW_WARNING_MODAL";
export const HIDE_WARNING_MODAL = "HIDE_WARNING_MODAL";
export const DISMISSED_WARNING = "DISMISSED_WARNING";
export const WARNING_ACTION_COMPLETED = "WARNING_ACTION_COMPLETED";

const showWarning = warningMessage => {
  return {
    type: SHOW_WARNING_MODAL,
    warningMessage
  };
};

const hideWarning = () => {
  return {
    type: HIDE_WARNING_MODAL,
  };
};

const dismissWarning = () => {
	return {
	   type: DISMISSED_WARNING,
	};
}

const completeAfterWarning = () => {
  return {
     type: WARNING_ACTION_COMPLETED,
  };
}

export const showWarningModal = (warningMessage) => dispatch => {
	dispatch(showWarning(warningMessage));
}

export const hideWarningModal = () => dispatch => {
	dispatch(hideWarning());
}

export const dismissedWarning = () => dispatch => {
	dispatch(dismissWarning());
}

export const completedAfterWarning = () => dispatch => {
  dispatch(completeAfterWarning());
}