// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyC65lUzbEo3T-20EbJ64i_X5s9L1eRMkLs",
  authDomain: "splitgroup-fecaf.firebaseapp.com",
  projectId: "splitgroup-fecaf",
  storageBucket: "splitgroup-fecaf.firebasestorage.app",
  messagingSenderId: "866358288870",
  appId: "1:866358288870:web:7b29261ec5c92a8710b627",
  measurementId: "G-W7THZCDB8R"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);