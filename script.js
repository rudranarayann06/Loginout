
import {
    initializeApp
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-app.js";

import {
    getAuth,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signInWithPopup,
    GoogleAuthProvider,
    signOut,
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";

import {
    getFirestore,
    doc,
    setDoc,
    getDoc,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";


// ========================================
// FIREBASE CONFIG
// ========================================


  const firebaseConfig = {
    apiKey: "AIzaSyCWlJLkCSTsUkJvmH-2G8pj5DGLpCgebhM",
    authDomain: "loginout-3817f.firebaseapp.com",
    projectId: "loginout-3817f",
    storageBucket: "loginout-3817f.firebasestorage.app",
    messagingSenderId: "1064407808895",
    appId: "1:1064407808895:web:dae1007dcf64183b1f784a",
    measurementId: "G-LB8ZS8VPFR"
  };

  // Initialize Firebase
// ========================================
// INITIALIZE FIREBASE
// ========================================

const app = initializeApp(firebaseConfig);

const auth = getAuth(app);

const db = getFirestore(app);

const googleProvider = new GoogleAuthProvider();


// ========================================
// HTML ELEMENTS
// ========================================

const loginSection =
    document.getElementById("loginSection");

const signupSection =
    document.getElementById("signupSection");

const userSection =
    document.getElementById("userSection");

const loginForm =
    document.getElementById("loginForm");

const signupForm =
    document.getElementById("signupForm");

const googleLogin =
    document.getElementById("googleLogin");

const logoutBtn =
    document.getElementById("logoutBtn");

const showSignup =
    document.getElementById("showSignup");

const showLogin =
    document.getElementById("showLogin");

const message =
    document.getElementById("message");

const welcomeMessage =
    document.getElementById("welcomeMessage");


// ========================================
// LOGIN ROLE
// ========================================

let selectedLoginRole = "user";

const userRoleBtn =
    document.getElementById("userRoleBtn");

const adminRoleBtn =
    document.getElementById("adminRoleBtn");


userRoleBtn.addEventListener("click", () => {

    selectedLoginRole = "user";

    userRoleBtn.classList.add("active");

    adminRoleBtn.classList.remove("active");

});


adminRoleBtn.addEventListener("click", () => {

    selectedLoginRole = "admin";

    adminRoleBtn.classList.add("active");

    userRoleBtn.classList.remove("active");

});


// ========================================
// SHOW SIGNUP
// ========================================

showSignup.addEventListener("click", () => {

    loginSection.classList.add("hidden");

    signupSection.classList.remove("hidden");

});


// ========================================
// SHOW LOGIN
// ========================================

showLogin.addEventListener("click", () => {

    signupSection.classList.add("hidden");

    loginSection.classList.remove("hidden");

});


// ========================================
// USER SIGNUP
// ========================================

signupForm.addEventListener("submit", async (event) => {

    event.preventDefault();

    const name =
        document.getElementById("signupName").value.trim();

    const email =
        document.getElementById("signupEmail").value.trim();

    const phone =
        document.getElementById("signupPhone").value.trim();

    const password =
        document.getElementById("signupPassword").value;

    const confirmPassword =
        document.getElementById("signupConfirmPassword").value;

    const role =
        document.getElementById("signupRole").value;


    if (password !== confirmPassword) {

        showMessage("Passwords do not match.");

        return;

    }


    try {

        showMessage("Creating account...");


        // Create Firebase Authentication account

        const userCredential =
            await createUserWithEmailAndPassword(
                auth,
                email,
                password
            );


        const user =
            userCredential.user;


        // Save additional information in Firestore

        await setDoc(
            doc(db, "users", user.uid),
            {

                uid: user.uid,

                name: name,

                email: email,

                phone: phone,

                role: role,

                provider: "email",

                createdAt: serverTimestamp()

            }
        );


        showMessage("Account created successfully!");


    } catch (error) {

        console.error(error);

        showMessage(
            getFirebaseError(error)
        );

    }

});


// ========================================
// LOGIN
// ========================================

loginForm.addEventListener("submit", async (event) => {

    event.preventDefault();


    const email =
        document.getElementById("loginEmail").value.trim();

    const password =
        document.getElementById("loginPassword").value;


    try {

        showMessage("Logging in...");


        const userCredential =
            await signInWithEmailAndPassword(
                auth,
                email,
                password
            );


        const user =
            userCredential.user;


        // Check user's stored role

        const userDocument =
            await getDoc(
                doc(db, "users", user.uid)
            );


        if (!userDocument.exists()) {

            showMessage(
                "User profile not found."
            );

            await signOut(auth);

            return;

        }


        const userData =
            userDocument.data();


        // Check selected role

        if (userData.role !== selectedLoginRole) {

            showMessage(
                `This account is registered as ${userData.role}, not ${selectedLoginRole}.`
            );

            await signOut(auth);

            return;

        }


        showMessage("Login successful!");


    } catch (error) {

        console.error(error);

        showMessage(
            getFirebaseError(error)
        );

    }

});


// ========================================
// GOOGLE LOGIN
// ========================================

googleLogin.addEventListener("click", async () => {

    try {

        showMessage("Opening Google login...");


        const result =
            await signInWithPopup(
                auth,
                googleProvider
            );


        const user =
            result.user;


        const userDocument =
            await getDoc(
                doc(db, "users", user.uid)
            );


        // First Google login

        if (!userDocument.exists()) {

            await setDoc(
                doc(db, "users", user.uid),
                {

                    uid: user.uid,

                    name: user.displayName || "Google User",

                    email: user.email,

                    phone: user.phoneNumber || "",

                    role: "user",

                    provider: "google",

                    createdAt: serverTimestamp()

                }
            );

        }


        showMessage("Google login successful!");


    } catch (error) {

        console.error(error);

        showMessage(
            getFirebaseError(error)
        );

    }

});


// ========================================
// LOGOUT
// ========================================

logoutBtn.addEventListener("click", async () => {

    try {

        await signOut(auth);

        showMessage("Logged out successfully.");

    } catch (error) {

        console.error(error);

        showMessage(
            getFirebaseError(error)
        );

    }

});


// ========================================
// AUTH STATE
// ========================================

onAuthStateChanged(auth, async (user) => {

    if (user) {

        await displayUser(user);

    } else {

        loginSection.classList.remove("hidden");

        signupSection.classList.add("hidden");

        userSection.classList.add("hidden");

        welcomeMessage.innerHTML = "";

    }

});


// ========================================
// DISPLAY USER
// ========================================

async function displayUser(user) {

    try {

        const userDocument =
            await getDoc(
                doc(db, "users", user.uid)
            );


        let userData = {};


        if (userDocument.exists()) {

            userData =
                userDocument.data();

        }


        loginSection.classList.add("hidden");

        signupSection.classList.add("hidden");

        userSection.classList.remove("hidden");


        const name =
            userData.name ||
            user.displayName ||
            "User";


        const email =
            user.email ||
            userData.email ||
            "";


        const role =
            userData.role ||
            "user";


        document.getElementById(
            "displayName"
        ).textContent = name;


        document.getElementById(
            "displayEmail"
        ).textContent = email;


        document.getElementById(
            "displayRole"
        ).textContent =
            role.toUpperCase();


        document.getElementById(
            "profileInitial"
        ).textContent =
            name.charAt(0).toUpperCase();


        welcomeMessage.innerHTML = `
            <h2>Welcome, ${name}!</h2>
            <p>You are logged in as <strong>${role}</strong>.</p>
        `;


    } catch (error) {

        console.error(error);

    }

}


// ========================================
// MESSAGE
// ========================================

function showMessage(text) {

    message.textContent = text;

}


// ========================================
// FIREBASE ERROR HANDLER
// ========================================

function getFirebaseError(error) {

    switch (error.code) {

        case "auth/email-already-in-use":
            return "This email is already registered.";

        case "auth/invalid-email":
            return "Please enter a valid email.";

        case "auth/weak-password":
            return "Password should be at least 6 characters.";

        case "auth/invalid-credential":
            return "Invalid email or password.";

        case "auth/popup-closed-by-user":
            return "Google login was cancelled.";

        default:
            return error.message || "Something went wrong.";

    }

}