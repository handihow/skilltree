import { combineReducers } from "redux";
import auth from "./auth";
import ui from "./ui";
import editor from './editor';

export default combineReducers({ auth, ui, editor });
