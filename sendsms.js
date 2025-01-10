// Import Twilio SDK
import twilio from 'twilio';
import { getDatabase, ref, onValue, update } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-database.js";

// Twilio credentials
const accountSid = 'AC293b2b156b2ed35bd7f82a075f03c153'; // Replace with your Twilio Account SID
const authToken = '5f8010ca09ca9b6799c0c07ba9bf58dd';   // Replace with your Twilio Auth Token
const client = twilio(accountSid, authToken);
const twilioPhoneNumber = '+13612739317'; // Replace with your Twilio phone number

// Function to send SMS to the donor
function sendSMSToDonor(donationDetails, accepterDetails) {
    const message = `
Hello ${donationDetails.name},

Your donation of ${donationDetails.quantity} kg of ${donationDetails.foodType} has been accepted by:
Name: ${accepterDetails.name}
Phone: ${accepterDetails.phone}

Pickup Location: ${donationDetails.location}

Thank you for your generosity!
    `;

    client.messages.create({
        body: message,
        from: twilioPhoneNumber,
        to: donationDetails.phone // Donor's phone number
    }).then((message) => {
        console.log("SMS sent successfully with SID:", message.sid);
    }).catch((error) => {
        console.error("Error sending SMS:", error);
    });
}

// Function to handle donation acceptance
function handleDonationAcceptance(donationKey, accepterDetails) {
    const database = getDatabase();
    const donationRef = ref(database, `donations/${donationKey}`);

    onValue(donationRef, (snapshot) => {
        const donationDetails = snapshot.val();

        if (!donationDetails) {
            console.error("Donation not found!");
            return;
        }

        // Update the donation status to 'accepted'
        update(donationRef, { accepted: true }).then(() => {
            console.log("Donation status updated to 'accepted'.");

            // Send SMS to the donor
            sendSMSToDonor(donationDetails, accepterDetails);
        }).catch((error) => {
            console.error("Error updating donation status:", error);
        });
    }, { onlyOnce: true });
}

// Export the function
export { handleDonationAcceptance };
