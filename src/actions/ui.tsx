export const SHOW_MODAL = "SHOW_MODAL";
export const HIDE_MODAL = "HIDE_MODAL";
export const DISMISSED_MODAL = "DISMISS_MODAL";
export const DISMISSED_WARNING = "DISMISSED_WARNING";
export const WARNING_ACTION_COMPLETED = "WARNING_ACTION_COMPLETED";

const show = (modalProperties: any) => {
  return {
    type: SHOW_MODAL,
    modalProperties
  };
};

const hide = () => {
  return {
    type: HIDE_MODAL,
  };
};

const dismiss = () => {
	return {
	   type: DISMISSED_MODAL,
	};
}

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

export const showModal = (modalProperties: any) => dispatch => {
	dispatch(show(modalProperties));
}

export const hideModal = () => dispatch => {
	dispatch(hide());
}

export const dismissedModal = () => dispatch => {
	dispatch(dismiss());
}

export const dismissedWarning = () => dispatch => {
	dispatch(dismissWarning());
}

export const completedAfterWarning = () => dispatch => {
  dispatch(completeAfterWarning());
}