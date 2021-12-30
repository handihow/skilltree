import {
  myFirebase,
  googleProvider,
  microsoftProvider,
  db,
  app,
} from "../firebase/firebase";
import { toast } from "react-toastify";
import firebase from "firebase";

export const LOGIN_REQUEST = "LOGIN_REQUEST";
export const LOGIN_SUCCESS = "LOGIN_SUCCESS";
export const LOGIN_FAILURE = "LOGIN_FAILURE";

export const LOGOUT_REQUEST = "LOGOUT_REQUEST";
export const LOGOUT_SUCCESS = "LOGOUT_SUCCESS";
export const LOGOUT_FAILURE = "LOGOUT_FAILURE";

export const VERIFY_REQUEST = "VERIFY_REQUEST";
export const VERIFY_SUCCESS = "VERIFY_SUCCESS";

const requestLogin = () => {
  return {
    type: LOGIN_REQUEST,
  };
};

const receiveLogin = (user) => {
  return {
    type: LOGIN_SUCCESS,
    user,
  };
};

const loginError = () => {
  return {
    type: LOGIN_FAILURE,
  };
};

const requestLogout = () => {
  return {
    type: LOGOUT_REQUEST,
  };
};

const receiveLogout = () => {
  return {
    type: LOGOUT_SUCCESS,
  };
};

const logoutError = () => {
  return {
    type: LOGOUT_FAILURE,
  };
};

const verifyRequest = () => {
  return {
    type: VERIFY_REQUEST,
  };
};

const verifySuccess = () => {
  return {
    type: VERIFY_SUCCESS,
  };
};

export const registerUser = (displayName, email, password) => (dispatch) => {
  dispatch(requestLogin());
  myFirebase
    .auth()
    .createUserWithEmailAndPassword(email, password)
    .then((result) => {
      if (!result || !result.user) {
        return console.error("no user record");
      }
      result.user
        .updateProfile({
          displayName: displayName,
        })
        .catch((error) => {
          toast.error(error.message);
        });
    })
    .catch((error) => {
      toast.error(error.message);
      dispatch(loginError());
    });
};

export const loginUser = (email, password) => (dispatch) => {
  dispatch(requestLogin());
  myFirebase
    .auth()
    .signInWithEmailAndPassword(email, password)
    .catch((error) => {
      toast.error(error.message);
      dispatch(loginError());
    });
};

export const loginWithGoogle = () => (dispatch) => {
  dispatch(requestLogin());
  myFirebase
    .auth()
    .signInWithPopup(googleProvider)
    .catch((error) => {
      toast.error(error.message);
      //Do something with the error if you want!
      dispatch(loginError());
    });
};

export const loginWithMicrosoft = () => (dispatch) => {
  dispatch(requestLogin());
  myFirebase
    .auth()
    .signInWithPopup(microsoftProvider)
    .catch((error) => {
      toast.error(error.message);
      //Do something with the error if you want!
      dispatch(loginError());
    });
};

export const logoutUser = () => (dispatch) => {
  dispatch(requestLogout());
  myFirebase
    .auth()
    .signOut()
    .then(() => {
      dispatch(receiveLogout());
    })
    .catch((error) => {
      toast.error(error.message);
      //Do something with the error if you want!
      dispatch(logoutError());
    });
};

export const verifyAuth = () => (dispatch) => {
  dispatch(verifyRequest());
  myFirebase.auth().onAuthStateChanged(async (user) => {
    if (user !== null) {
      let organisation: string = "";
      let displayName = user.displayName || "";
      let hostedDomain: string = "";
      let type: string = "";
      const provider = user?.providerData[0]?.providerId || null;
      if (process.env.REACT_APP_ENVIRONMENT_ID !== "free") {
        const flamelinkUser = await app.users.get({ uid: user.uid });
        if (!flamelinkUser) {
          //not supposed to be on the app
          logoutUser();
          return;
        }
        const school = await app.content.get({ schemaKey: "school" });
        organisation = school.name;
        displayName = flamelinkUser.displayName;
        hostedDomain = flamelinkUser.email.split("@").pop() || "";
        const userDocRef = db.collection("fl_users").doc(user.uid);
        const schoolUser = await app.content.getByField({
          schemaKey: "user",
          field: "flamelinkUser",
          value: userDocRef,
        });
        for (const id in schoolUser){
          type = schoolUser[id].type;
        }
      } else if (
        provider &&
        provider === "google.com" &&
        user.email &&
        !["gmail.com", "googlemail.com"].includes(
          user.email.split("@").pop() || ""
        )
      ) {
        hostedDomain = user.email.split("@").pop() || "";
      } else if (
        provider &&
        provider === "microsoft.com" &&
        user.email &&
        !["outlook.com", "live.com", "hotmail.com"].includes(
          user.email.split("@").pop() || ""
        )
      ) {
        hostedDomain = user.email.split("@").pop() || "";
      }
      //create or update user record in firestore db
      const signedInUser = {
        uid: user.uid,
        email: user.email,
        displayName,
        photoURL: user.photoURL
          ? user.photoURL
          : `https://eu.ui-avatars.com/api/?name=${displayName}`,
        emailVerified:
          process.env.REACT_APP__ID === "free" ? user.emailVerified : true,
        hostedDomain,
        provider,
        organisation,
        type,
        creationTime: user?.metadata?.creationTime || null,
        lastSignInTime: user?.metadata?.lastSignInTime || null,
      };
      db.collection("users").doc(user.uid).set(signedInUser, { merge: true });
      dispatch(receiveLogin(signedInUser));
    }
    dispatch(verifySuccess());
  });
};
