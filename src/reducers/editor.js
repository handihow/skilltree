import {
    SET_PARENT_SKILLTREE,
    UNSET_PARENT_SKILLTREE,
    STARTED_IMPORTING_SKILLS,
    COMPLETED_IMPORTING_SKILLS
  } from "../actions/";
  
const editorReducer = (
    state = {
      parentSkilltree: undefined,
      hasSelectedParentSkilltree: false,
      hasStartedImportingSkills: false,
      hasCompletedImportingSkills: false,
      selectedSkills: undefined
    },
    action
  ) => {
    switch (action.type) {
      case SET_PARENT_SKILLTREE:
        return {
          ...state,
          parentSkilltree: action.skilltree,
          hasSelectedParentSkilltree: true
        };
      case UNSET_PARENT_SKILLTREE:
        return {
          ...state,
          parentSkilltree: undefined,
          hasSelectedParentSkilltree: false
        };
      case STARTED_IMPORTING_SKILLS:
        return {
          ...state,
          hasStartedImportingSkills: true,
          selectedSkills: action.skills
        };
      case COMPLETED_IMPORTING_SKILLS:
        return {
          ...state,
          parentSkilltree: undefined,
          hasSelectedParentSkilltree: false,
          hasStartedImportingSkills: false,
          hasCompletedImportingSkills: true,
          selectedSkills: undefined
        };
      default:
        return state;
    }
  };

export default editorReducer;