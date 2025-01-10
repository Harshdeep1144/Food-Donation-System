// Initialize Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-app.js";
import { getDatabase, ref, push, set, onValue } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-database.js";

const firebaseConfig = {
    apiKey: "AIzaSyBhvGLDoiI3H_sIQfDOek2VI7d7o0B9fV4",
    authDomain: "food-donation-system-ec479.firebaseapp.com",
    databaseURL: "https://food-donation-system-ec479-default-rtdb.firebaseio.com",
    projectId: "food-donation-system-ec479",
    storageBucket: "food-donation-system-ec479.firebasestorage.app",
    messagingSenderId: "298711668239",
    appId: "1:298711668239:web:7d0bb74794c7914ef2357a",
    measurementId: "G-KX7JTNH7JD",
};

const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

// Function to handle registration
function handleRegistration(event) {
    event.preventDefault();

    const username = document.querySelector('.form.Register input[name="username"]').value.trim();
    const email = document.querySelector('.form.Register input[name="email"]').value.trim();
    const password = document.querySelector('.form.Register input[name="password"]').value.trim();
    const confirmPassword = document.querySelector('.form.Register input[name="confirm_password"]').value.trim();

    if (!username || !email || !password || !confirmPassword) {
        alert('Please fill in all fields!');
        return;
    }

    if (password !== confirmPassword) {
        alert('Passwords do not match');
        return;
    }

    // Create a database reference for a new user under 'users'
    const userRef = ref(database, 'users');
    const newUserRef = push(userRef);

    // Use set() to store the user data at this new unique key
    set(newUserRef, {
        username: username,
        email: email,
        password: password,
    })
        .then(() => {
            alert('User registered successfully!');
            document.querySelector('.form.Register').reset();
        })
        .catch((error) => {
            console.error('Error registering user:', error);
        });
}

// Function to handle login
function handleLogin(event) {
    event.preventDefault();

    const username = document.querySelector('.form.Login input[name="username"]').value.trim();
    const password = document.querySelector('.form.Login input[name="password"]').value.trim();

    if (!username || !password) {
        alert("Please enter both username and password.");
        return;
    }

    const usersRef = ref(database, 'users');
    onValue(usersRef, (snapshot) => {
        let userFound = false;

        snapshot.forEach((childSnapshot) => {
            const data = childSnapshot.val();
            if (data.username === username && data.password === password) {
                userFound = true;
                localStorage.setItem('loggedInUser', username);
            }
        });

        if (userFound) {
            alert('Login successful!');
            window.location.href = "index.html";
        } else {
            alert('Invalid username or password. Please try again.');
        }
    }, { onlyOnce: true });
}

// Assign onsubmit handlers
window.onload = function () {
    const registerForm = document.querySelector('.form.Register');
    const loginForm = document.querySelector('.form.Login');

    if (registerForm) {
        registerForm.onsubmit = handleRegistration;
    }

    if (loginForm) {
        loginForm.onsubmit = handleLogin;
    }
};
