// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getStorage } from "firebase/storage";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional

//This is a temporary setup. The actual API key won't be uploaded
const firebaseConfig = {
  apiKey: "AIzaSyDX79GqzQmQ-Ub4-YkB8l7_BLs9awnIS_8",
  authDomain: "nightout-d1c21.firebaseapp.com",
  projectId: "nightout-d1c21",
  storageBucket: "nightout-d1c21.appspot.com",
  messagingSenderId: "106729038988",
  appId: "1:106729038988:web:082a90804d1c50c14bc7a9",
  measurementId: "G-KTR73MCSQR"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const storage = getStorage(app);

export default storage;
