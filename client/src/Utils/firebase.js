
import { initializeApp } from "firebase/app";
import {getAuth , GoogleAuthProvider} from "firebase/auth"

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_APIKEY,
  authDomain: "interviewiq-4858f.firebaseapp.com",
  projectId: "interviewiq-4858f",
  storageBucket: "interviewiq-4858f.firebasestorage.app",
  messagingSenderId: "65238589890",
  appId: "1:65238589890:web:5f8e5d38294f72d83fb65b"
};


const app = initializeApp(firebaseConfig);

const auth = getAuth(app)

const provider = new GoogleAuthProvider()

export {auth , provider}