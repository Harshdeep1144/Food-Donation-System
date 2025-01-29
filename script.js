document.addEventListener('DOMContentLoaded', () => {
    // Mobile Navigation
    const burger = document.querySelector('.burger');
    const nav = document.querySelector('.nav-links');
    const navLinks = document.querySelectorAll('.nav-links li');

    burger.addEventListener('click', () => {
        // Toggle Nav
        nav.classList.toggle('nav-active');

        // Animate Links
        navLinks.forEach((link, index) => {
            if (link.style.animation) {
                link.style.animation = '';
            } else {
                link.style.animation = `navLinkFade 0.5s ease forwards ${index / 7 + 0.3}s`;

            }
        });

        // Burger Animation
        burger.classList.toggle('toggle');
    });

    // Animate Stats
    const stats = document.querySelectorAll('.stat-number');

    const animateStats = () => {
        stats.forEach(stat => {
            const target = parseInt(stat.getAttribute('data-target'));
            const count = parseInt(stat.innerText);
            const increment = target / 200; // Adjust for animation speed

            if (count < target) {
                stat.innerText = Math.ceil(count + increment);
                setTimeout(animateStats, 1);
            } else {
                stat.innerText = target;
            }
        });
    };

    // Run stats animation when the stats section is in view
    const statsSection = document.querySelector('.stats');
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.5
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                animateStats();
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    observer.observe(statsSection);
});


/* Connect with firebase database */

import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-app.js";
import { getDatabase, ref, push, update, onValue } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-database.js";

// Initialize Firebase
const firebaseConfig = {
    apiKey: "AIzaSyBhvGLDoiI3H_sIQfDOek2VI7d7o0B9fV4",
    authDomain: "food-donation-system-ec479.firebaseapp.com",
    databaseURL: "https://food-donation-system-ec479-default-rtdb.firebaseio.com",
    projectId: "food-donation-system-ec479",
    storageBucket: "food-donation-system-ec479.firebasestorage.app",
    messagingSenderId: "298711668239",
    appId: "1:298711668239:web:7d0bb74794c7914ef2357a",
    measurementId: "G-KX7JTNH7JD"
};

const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

document.addEventListener('DOMContentLoaded', () => {
    updateAuthButton();
    setupDonationForm();
    displayDonations();
});

// Update the auth button text dynamically
function updateAuthButton() {
    const authButton = document.querySelector('.btn-auth');
    const loggedInUser = localStorage.getItem('loggedInUser');

    if (loggedInUser) {
        authButton.innerText = 'Logout';
        authButton.style.backgroundColor = '#c42b2b';
        authButton.style.color = '#fff';
        authButton.onclick = handleLogout;
    } else {
        authButton.innerText = 'Login';
        authButton.style.backgroundColor = '';
        authButton.style.color = '';
        authButton.onclick = () => {
            window.location.href = "LoginorRegister.html";
        };
    }
}

// Handle logout logic
function handleLogout() {
    localStorage.removeItem('loggedInUser');
    alert('Logged out successfully!');
    updateAuthButton();
    window.location.href = 'index.html';
}

// Prevent form submission unless the user is logged in
function setupDonationForm() {
    const donationForm = document.querySelector('#donationForm');

    donationForm.addEventListener('submit', function (event) {
        const loggedInUser = localStorage.getItem('loggedInUser');
        
        if (!loggedInUser) {
            alert('You must log in first to make a donation!');
            event.preventDefault(); // Completely prevent submission
            return; 
        }

        // If logged in, handle donation submission
        submitDonation();
        event.preventDefault(); 
    });
}

// Actual donation submission logic
function submitDonation() {
    const name = document.getElementById('name').value;
    const phone = document.getElementById('phone').value;
    const foodType = document.getElementById('foodType').value;
    const quantity = document.getElementById('quantity').value;
    const localAddress = document.getElementById('localAddress').value;
    const state = document.getElementById('state').value;
    const city = document.getElementById('city').value;
    const pinCode = document.getElementById('pinCode').value;
    const message = document.getElementById('message').value;

    const pickupLocation = `${localAddress}, ${city}, ${state}, ${pinCode}`;

    const donationsRef = ref(database, 'donations');
    push(donationsRef, {
        name: name,
        phone: phone,
        foodType: foodType,
        quantity: quantity,
        location: pickupLocation,
        message: message || "No message provided",
        timestamp: new Date().toLocaleString(),
        accepted: false
    })
        .then(() => {
            alert('Donation submitted successfully!');
            document.getElementById('donationForm').reset();
        })
        .catch((error) => {
            console.error('Error submitting donation:', error);
        });
}

// Display donations dynamically
function displayDonations() {
    const donationsRef = ref(database, 'donations');
    onValue(donationsRef, (snapshot) => {
        const donationsContainer = document.getElementById('donationsContainer');
        donationsContainer.innerHTML = '';

        snapshot.forEach((childSnapshot) => {
            const donationKey = childSnapshot.key;
            const data = childSnapshot.val();

            if (data.accepted) return;

            const donationItem = document.createElement('div');
            donationItem.classList.add('donation-item');
            donationItem.innerHTML = `
                <h3>${data.foodType} - ${data.quantity} kg</h3>
                <p><strong>Donor:</strong> ${data.name}</p>
                <p><strong>Phone:</strong> ${data.phone}</p>
                <p><strong>Pickup Location:</strong> ${data.location}</p>
                <p><strong>Message:</strong> ${data.message}</p>
                <button class="accept-btn" data-key="${donationKey}">Accept Donation</button>
            `;
            donationsContainer.appendChild(donationItem);

            donationItem.querySelector('.accept-btn').addEventListener('click', () => {
                acceptDonation(donationKey);
            });
        });

        if (!snapshot.hasChildren()) {
            donationsContainer.innerHTML = `
                <div class="no-donations">
                   <p>No donations available at the moment.</p>
                </div>
            `;
        }
    });
}

// Accept a donation from Firebase
// function acceptDonation(donationKey) {
    
//     const donationRef = ref(database, `donations/${donationKey}`);
//     update(donationRef, {
//         accepted: true
//     }).then(() => {
//         alert('Donation accepted successfully!, The donor has been informed. ');
//     }).catch((error) => {
//         console.error('Error accepting donation:', error);
//     });
// }

/* database connection for contact form  */ 

document.getElementById('contactForm').addEventListener('submit', (e) => {
  e.preventDefault();

  const nameInput = document.getElementById('contactForm').name.value;
  const emailInput = document.getElementById('contactForm').email.value;
  const subjectInput = document.getElementById('contactForm').subject.value;
  const messageInput = document.getElementById('contactForm').message.value;

  const userQueryData = {
    name: nameInput,
    email: emailInput,
    subject: subjectInput,
    message: messageInput,
    timestamp: new Date().toLocaleString() // Human-readable format
};


  const userQueriesRef = ref(database, 'userqueries');

  push(userQueriesRef, userQueryData)
    .then(() => {
      alert('Your message has been sent successfully!');
      document.getElementById('contactForm').reset();
    })
    .catch((error) => {
      console.error('Error sending message:', error);
      alert('There was an issue sending your message. Please try again.');
    });
});















// Twilio Account Details
const accountSid = "AC102c3a645eeb5775de89ed2861569a88"; // Replace with your Twilio Account SID
const authToken = "a47781836f421faf4546db34bbe9f805";   // Replace with your Twilio Auth Token
const twilioPhoneNumber = "+16088928821"; // Replace with your Twilio phone number
/**
 * Function to send SMS to the donor
 * @param {string} phoneNumber - The donor's phone number
 * @param {string} message - The message to be sent
 */
async function sendSMS(phoneNumber, message) {
    const url = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`;

    // Ensure the phone number starts with +91
    if (!phoneNumber.startsWith("+91")) {
        phoneNumber = `+91${phoneNumber}`;
    }

    const formData = new URLSearchParams();
    formData.append("From", twilioPhoneNumber);
    formData.append("To", phoneNumber);
    formData.append("Body", message);

    const encodedAuth = btoa(`${accountSid}:${authToken}`);

    try {
        const response = await fetch(url, {
            method: "POST",
            headers: {
                Authorization: `Basic ${encodedAuth}`,
                "Content-Type": "application/x-www-form-urlencoded",
            },
            body: formData,
        });

        if (response.ok) {
            console.log("SMS sent successfully!");
            alert("The donor has been informed via SMS!");
        } else {
            const errorData = await response.json();
            console.error("Failed to send SMS:", errorData);
            alert(`Failed to send SMS. Error: ${errorData.message}`);
        }
    } catch (error) {
        console.error("Error sending SMS:", error);
        alert("An error occurred while sending SMS.");
    }
}

/**
 * Function to accept a donation and notify the donor
 * @param {string} donationKey - The unique key of the donation in Firebase
 */
function acceptDonation(donationKey) {
    const database = getDatabase();
    const donationRef = ref(database, `donations/${donationKey}`);

    // Fetch donation details
    onValue(donationRef, (snapshot) => {
        const donationDetails = snapshot.val();

        if (!donationDetails) {
            console.error("Donation not found!");
            alert("Donation not found!");
            return;
        }

        // Update the donation status to 'accepted'
        update(donationRef, { accepted: true })
            .then(() => {
                alert("Donation accepted successfully!");

                // Prepare the SMS message
                const donorPhone = donationDetails.phone; // Assuming phone is stored in donation details
                const message = `Hello ${donationDetails.name}, 
Your donation of ${donationDetails.foodType} (${donationDetails.quantity} kg) has been accepted. 
The accepter will contact you shortly.`;

                // Send SMS to the donor
                sendSMS(donorPhone, message);
            })
            .catch((error) => {
                console.error("Error updating donation status:", error);
                alert("Failed to accept donation.");
            });
    }, { onlyOnce: true });
}

// Attach the acceptDonation function to your Accept button
document.addEventListener("DOMContentLoaded", () => {
    const donationsContainer = document.getElementById("donationsContainer");

    donationsContainer.addEventListener("click", (event) => {
        if (event.target.classList.contains("accept-btn")) {
            const donationKey = event.target.getAttribute("data-key");
            acceptDonation(donationKey);
        }
    });
});
