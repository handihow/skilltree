import {
  myFirebase,
  googleProvider,
  microsoftProvider,
  db,
  app,
} from "../firebase/firebase";
import { toast } from "react-toastify";
import IUser, { IFLContent } from "../models/user.model";
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
      let signedInUser;
      if (process.env.REACT_APP_ENVIRONMENT_ID !== "free") {
        signedInUser = await constructPremiumUser(user);
      } else {
        signedInUser = constructFreeUser(user);
      }
      if (!signedInUser) return;
      db.collection("users").doc(user.uid).set(signedInUser, { merge: true });
      dispatch(receiveLogin(signedInUser));
    }
    dispatch(verifySuccess());
  });
};

const mapToFlamelinkContent = (content: IFLContent) => {
  return {
    id: content.id,
    name: content.name,
  };
}

const constructPremiumUser = async (user: firebase.User) => {
  const flamelinkUser = await app.users.get({ uid: user.uid });
  const school = await app.content.get({ schemaKey: "school" });
  if (!flamelinkUser || !school) {
    //not supposed to be on the app
    toast.error(
      "We could not find a connected premium account. Please use the free version of SkillTree."
    );
    logoutUser();
    return null;
  }
  const organisation = school.name;
  const displayName = flamelinkUser.displayName;
  const hostedDomain = flamelinkUser.email.split("@").pop() || "";
  const userDocRef = db.collection("fl_users").doc(user.uid);
  const schoolUser = await app.content.getByField({
    schemaKey: "user",
    field: "flamelinkUser",
    value: userDocRef,
  });
  for (const id in schoolUser) {
    const userData = await app.content.get({
      schemaKey: "user",
      entryId: id,
      populate: ["groups", "programs", "subjects"],
    });
    const type = userData.type;
    const subjects = userData.subjects.map((s) => s.name).join(", ");
    const groups = userData.groups.map((g) => g.name).join(", ");
    const programs = userData.programs.map((p) => p.name).join(", ");
    const flUserContent = {
      subjects: userData.subjects.map(mapToFlamelinkContent),
      groups: userData.groups.map(mapToFlamelinkContent),
      programs: userData.programs.map(mapToFlamelinkContent),
    };
    const signedInUser: IUser = {
      uid: user.uid,
      email: flamelinkUser.email,
      displayName,
      photoURL: `https://eu.ui-avatars.com/api/?name=${displayName}`,
      emailVerified: true,
      hostedDomain,
      provider: "password",
      organisation,
      type,
      subjects,
      groups,
      programs,
      flUserContent,
      creationTime: user?.metadata?.creationTime || null,
      lastSignInTime: user?.metadata?.lastSignInTime || null,
    };
    return signedInUser;
  }
};

const constructFreeUser = (user: firebase.User) => {
  let hostedDomain = "";
  const provider = user?.providerData[0]?.providerId || "password";
  if (
    provider &&
    provider === "google.com" &&
    user.email &&
    !["gmail.com", "googlemail.com"].includes(user.email.split("@").pop() || "")
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
  const signedInUser: IUser = {
    uid: user.uid,
    email: user.email || "",
    displayName: user.displayName || "",
    photoURL: user.photoURL
      ? user.photoURL
      : `https://eu.ui-avatars.com/api/?name=${user.displayName}`,
    emailVerified: user.emailVerified,
    hostedDomain,
    provider,
    creationTime: user?.metadata?.creationTime || null,
    lastSignInTime: user?.metadata?.lastSignInTime || null,
  };
  return signedInUser;
};
