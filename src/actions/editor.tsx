export const SET_PARENT_SKILLTREE = "SET_PARENT_SKILLTREE";
export const UNSET_PARENT_SKILLTREE = "UNSET_PARENT_SKILLTREE";
export const STARTED_IMPORTING_SKILLS = "STARTED_IMPORTING_SKILLS";
export const COMPLETED_IMPORTING_SKILLS = "COMPLETED_IMPORTING_SKILLS";

const setParentSkilltree = skilltree => {
  return {
    type: SET_PARENT_SKILLTREE,
    skilltree
  };
};

const unsetParentSkilltree = () => {
  return {
    type: UNSET_PARENT_SKILLTREE,
  };
};

const startedImportingSkills = skills => {
	return {
	   type: STARTED_IMPORTING_SKILLS,
     skills
	};
}

const completedImportingSkills = () => {
  return {
     type: COMPLETED_IMPORTING_SKILLS,
  };
}

export const setSkilltree = (skilltree) => dispatch => {
	dispatch(setParentSkilltree(skilltree));
}

export const unsetSkilltree = () => dispatch => {
	dispatch(unsetParentSkilltree());
}

export const startedImporting = (skills) => dispatch => {
	dispatch(startedImportingSkills(skills));
}

export const completedImporting = () => dispatch => {
  dispatch(completedImportingSkills());
}