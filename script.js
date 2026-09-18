/* =========================================
NV TRAVELSS - APP LOGIC
FIREBASE OTP + CUSTOMER → DRIVER RIDES
========================================= */

let selectedRole = "customer";

let driverOnline = false;
let driverEarnings = 0;
let driverRides = 0;

let pendingRide = false;
let currentRide = null;

let confirmationResult = null;
let recaptchaVerifier = null;

let rideListener = null;

/* =========================================
FIREBASE DATABASE
========================================= */

function getDatabase() {

if (typeof firebase === "undefined") {
    console.error("Firebase SDK not loaded.");
    return null;
}

if (!firebase.firestore) {
    console.error("Firebase Firestore SDK not loaded.");
    return null;
}

return firebase.firestore();

}

/* =========================================
LOGIN ROLE
========================================= */

document.addEventListener("DOMContentLoaded", function () {

const roleButtons =
    document.querySelectorAll(".role-btn");

roleButtons.forEach(function (button) {

    button.addEventListener("click", function () {

        roleButtons.forEach(function (btn) {
            btn.classList.remove("active");
        });

        this.classList.add("active");

        selectedRole =
            this.dataset.role;

    });

});


const loginButton =
    document.getElementById("loginButton");

const verifyOtpButton =
    document.getElementById("verifyOtpButton");


if (loginButton) {
    loginButton.addEventListener(
        "click",
        login
    );
}


if (verifyOtpButton) {
    verifyOtpButton.addEventListener(
        "click",
        verifyOTP
    );
}

});

/* =========================================
FIREBASE OTP LOGIN
========================================= */

function login() {

const nameInput =
    document.getElementById("loginName");

const phoneInput =
    document.getElementById("loginPhone");

const otpInput =
    document.getElementById("otpInput");

const loginButton =
    document.getElementById("loginButton");

const verifyButton =
    document.getElementById("verifyOtpButton");

const message =
    document.getElementById("otpMessage");


const name =
    nameInput.value.trim();

let phone =
    phoneInput.value.trim();


if (name === "") {

    alert("Please enter your name.");

    nameInput.focus();

    return;
}


if (phone === "") {

    alert("Please enter your mobile number.");

    phoneInput.focus();

    return;
}


phone =
    phone.replace(/\D/g, "");


if (phone.length === 10) {

    phone =
        "+91" + phone;

}


if (
    !phone.startsWith("+91") ||
    phone.length !== 13
) {

    alert(
        "Please enter a valid 10 digit Indian mobile number."
    );

    phoneInput.focus();

    return;
}


localStorage.setItem(
    "nvUserName",
    name
);

localStorage.setItem(
    "nvUserRole",
    selectedRole
);

localStorage.setItem(
    "nvUserPhone",
    phone
);


message.style.display =
    "block";

message.textContent =
    "Sending OTP...";


loginButton.disabled =
    true;


try {

    if (!recaptchaVerifier) {

        recaptchaVerifier =
            new firebase.auth.RecaptchaVerifier(
                "recaptcha-container",
                {
                    size: "normal"
                }
            );

    }


    firebase.auth()
        .signInWithPhoneNumber(
            phone,
            recaptchaVerifier
        )

        .then(function (result) {

            confirmationResult =
                result;


            message.textContent =
                "OTP sent to your mobile number.";


            otpInput.style.display =
                "block";


            verifyButton.style.display =
                "block";


            loginButton.style.display =
                "none";


            otpInput.focus();

        })

        .catch(function (error) {

            console.error(error);


            message.textContent =
                "OTP send nahi hua: " +
                error.message;


            loginButton.disabled =
                false;


            if (recaptchaVerifier) {

                recaptchaVerifier.clear();

                recaptchaVerifier =
                    null;

            }

        });

}

catch (error) {

    console.error(error);


    message.textContent =
        "Firebase OTP error: " +
        error.message;


    loginButton.disabled =
        false;

}

}

/* =========================================
VERIFY OTP
========================================= */

function verifyOTP() {

const otpInput =
    document.getElementById("otpInput");

const message =
    document.getElementById("otpMessage");


const code =
    otpInput.value.trim();


if (code.length !== 6) {

    alert(
        "Please enter the 6 digit OTP."
    );

    otpInput.focus();

    return;
}


if (!confirmationResult) {

    alert(
        "Please request OTP first."
    );

    return;
}


message.textContent =
    "Verifying OTP...";


confirmationResult
    .confirm(code)

    .then(function (result) {

        message.textContent =
            "Login successful! Welcome to NV Travelss.";


        openLoggedInApp();

    })

    .catch(function (error) {

        console.error(error);


        message.textContent =
            "Invalid OTP. Please try again.";

    });

}

/* =========================================
OPEN APP
========================================= */

function openLoggedInApp() {

const name =
    localStorage.getItem(
        "nvUserName"
    ) || "Traveler";


const role =
    localStorage.getItem(
        "nvUserRole"
    ) || selectedRole;


document.getElementById(
    "loginScreen"
).classList.remove(
    "active-screen"
);


if (role === "driver") {

    const driverApp =
        document.getElementById(
            "driverApp"
        );


    if (driverApp) {

        driverApp.classList.add(
            "active-app"
        );

    }


    const driverName =
        document.getElementById(
            "driverName"
        );


    if (driverName) {

        driverName.textContent =
            name;

    }


    startDriverRideListener();

}

else {

    const customerApp =
        document.getElementById(
            "customerApp"
        );


    if (customerApp) {

        customerApp.classList.add(
            "active-app"
        );

    }


    const welcomeName =
        document.getElementById(
            "welcomeName"
        );


    const profileName =
        document.getElementById(
            "profileName"
        );


    if (welcomeName) {

        welcomeName.textContent =
            name;

    }


    if (profileName) {

        profileName.textContent =
            name;

    }


    openPage("homePage");

    startCustomerRideListener();

}

}

/* =========================================
CUSTOMER PAGE NAVIGATION
========================================= */

function openPage(pageId) {

const pages =
    document.querySelectorAll(
        "#customerApp .page"
    );


pages.forEach(function (page) {

    page.classList.remove(
        "active-page"
    );

});


const selectedPage =
    document.getElementById(
        pageId
    );


if (selectedPage) {

    selectedPage.classList.add(
        "active-page"
    );

}


updateBottomNavigation(
    pageId
);


window.scrollTo({
    top: 0,
    behavior: "smooth"
});

}

function goHome() {

openPage("homePage");

}

function updateBottomNavigation(pageId) {

const navButtons =
    document.querySelectorAll(
        ".nav-btn"
    );


navButtons.forEach(function (button) {

    button.classList.remove(
        "active"
    );

});


if (pageId === "homePage" &&
    navButtons[0]) {

    navButtons[0].classList.add(
        "active"
    );

}


if (pageId === "reelsPage" &&
    navButtons[1]) {

    navButtons[1].classList.add(
        "active"
    );

}


if (pageId === "searchPage" &&
    navButtons[3]) {

    navButtons[3].classList.add(
        "active"
    );

}


if (pageId === "profilePage" &&
    navButtons[4]) {

    navButtons[4].classList.add(
        "active"
    );

}

}

/* =========================================
CUSTOMER REQUEST RIDE
========================================= */

function requestRide() {

const pickup =
    document.getElementById(
        "pickupLocation"
    ).value.trim();


const destination =
    document.getElementById(
        "destinationLocation"
    ).value.trim();


const vehicle =
    document.getElementById(
        "vehicleType"
    ).value;


const message =
    document.getElementById(
        "rideMessage"
    );


if (
    !pickup ||
    !destination ||
    !vehicle
) {

    message.style.display =
        "block";


    message.textContent =
        "Please fill pickup, destination and vehicle.";


    return;
}


const db =
    getDatabase();


if (!db) {

    message.style.display =
        "block";


    message.textContent =
        "Firebase database is not connected.";


    return;
}


const customerName =
    localStorage.getItem(
        "nvUserName"
    ) || "Traveler";


const customerPhone =
    localStorage.getItem(
        "nvUserPhone"
    ) || "";


message.style.display =
    "block";


message.innerHTML =
    "🚕 Creating ride request...";


const rideData = {

    customerName:
        customerName,

    customerPhone:
        customerPhone,

    pickup:
        pickup,

    destination:
        destination,

    vehicle:
        vehicle,

    fare:
        850,

    status:
        "searching",

    createdAt:
        firebase.firestore.FieldValue.serverTimestamp(),

    acceptedBy:
        "",

    driverName:
        "",

    driverPhone:
        ""

};


db.collection("rides")
    .add(rideData)

    .then(function (docRef) {

        localStorage.setItem(
            "nvCurrentRideId",
            docRef.id
        );


        message.innerHTML =
            "🚕 Ride request created.<br>" +
            "Searching for nearby drivers...";


        alert(
            "🚕 Ride request sent to nearby drivers."
        );

    })

    .catch(function (error) {

        console.error(
            "Ride creation error:",
            error
        );


        message.textContent =
            "Ride request failed: " +
            error.message;

    });

}

/* =========================================
CUSTOMER RIDE STATUS LISTENER
========================================= */

function startCustomerRideListener() {

const db =
    getDatabase();


if (!db) {
    return;
}


const rideId =
    localStorage.getItem(
        "nvCurrentRideId"
    );


if (!rideId) {
    return;
}


if (rideListener) {

    rideListener();

    rideListener =
        null;

}


rideListener =
    db.collection("rides")
        .doc(rideId)
        .onSnapshot(
            function (doc) {

                if (!doc.exists) {
                    return;
                }


                const ride =
                    doc.data();


                currentRide =
                    ride;


                updateCustomerRideStatus(
                    ride
                );

            },

            function (error) {

                console.error(
                    "Ride listener error:",
                    error
                );

            }
        );

}

/* =========================================
CUSTOMER STATUS DISPLAY
========================================= */

function updateCustomerRideStatus(ride) {

const message =
    document.getElementById(
        "rideMessage"
    );


if (!message) {
    return;
}


if (ride.status === "searching") {

    message.style.display =
        "block";


    message.innerHTML =
        "🚕 Ride request created.<br>" +
        "Searching for nearby drivers...";

}


else if (
    ride.status === "accepted"
) {

    message.style.display =
        "block";


    message.innerHTML =
        "✅ Driver accepted your ride.<br>" +
        "Driver: " +
        (ride.driverName || "Driver") +
        "<br>" +
        "Vehicle: " +
        (ride.vehicle || "Taxi") +
        "<br>" +
        "Pickup: " +
        ride.pickup +
        "<br>" +
        "Destination: " +
        ride.destination;

}


else if (
    ride.status === "rejected"
) {

    message.style.display =
        "block";


    message.innerHTML =
        "❌ Ride request was rejected.<br>" +
        "You can request another ride.";

}


else if (
    ride.status === "completed"
) {

    message.style.display =
        "block";


    message.innerHTML =
        "✅ Ride completed successfully.";

}

}

/* =========================================
DRIVER RIDE LISTENER
========================================= */

function startDriverRideListener() {

const db =
    getDatabase();


if (!db) {
    return;
}


if (rideListener) {

    rideListener();

    rideListener =
        null;

}


rideListener =
    db.collection("rides")
        .where(
            "status",
            "==",
            "searching"
        )
        .orderBy(
            "createdAt",
            "desc"
        )
        .limit(1)
        .onSnapshot(

            function (snapshot) {

                if (
                    snapshot.empty
                ) {

                    pendingRide =
                        false;

                    currentRide =
                        null;

                    showNoRideRequest();

                    updateRequestBadge(0);

                    return;

                }


                const doc =
                    snapshot.docs[0];


                currentRide = {

                    id:
                        doc.id,

                    ...doc.data()

                };


                pendingRide =
                    true;


                showDriverRideRequest(
                    currentRide
                );


                updateRequestBadge(1);

            },

            function (error) {

                console.error(
                    "Driver ride listener error:",
                    error
                );


                /*
                   Firestore may require
                   an index for this query.
                */

                fallbackDriverRideListener();

            }
        );

}

/* =========================================
DRIVER FALLBACK LISTENER
========================================= */

function fallbackDriverRideListener() {

const db =
    getDatabase();


if (!db) {
    return;
}


db.collection("rides")
    .where(
        "status",
        "==",
        "searching"
    )
    .limit(10)
    .onSnapshot(
        function (snapshot) {

            if (
                snapshot.empty
            ) {

                pendingRide =
                    false;

                currentRide =
                    null;

                showNoRideRequest();

                updateRequestBadge(0);

                return;

            }


            const doc =
                snapshot.docs[0];


            currentRide = {

                id:
                    doc.id,

                ...doc.data()

            };


            pendingRide =
                true;


            showDriverRideRequest(
                currentRide
            );


            updateRequestBadge(1);

        },

        function (error) {

            console.error(
                "Fallback ride error:",
                error
            );

        }
    );

}

/* =========================================
DRIVER RIDE REQUEST UI
========================================= */

function showDriverRideRequest(ride) {

let card =
    document.getElementById(
        "liveRideRequest"
    );


if (!card) {

    const driverApp =
        document.getElementById(
            "driverApp"
        );


    if (!driverApp) {
        return;
    }


    card =
        document.createElement(
            "div"
        );


    card.id =
        "liveRideRequest";


    card.style.padding =
        "18px";


    card.style.margin =
        "15px";


    card.style.borderRadius =
        "16px";


    card.style.background =
        "#ffffff";


    card.style.boxShadow =
        "0 4px 15px rgba(0,0,0,0.12)";


    driverApp.prepend(card);

}


card.innerHTML =

    "<h3>🚕 New Ride Request</h3>" +

    "<p><b>Customer:</b> " +
    escapeRideText(
        ride.customerName
    ) +
    "</p>" +

    "<p><b>Pickup:</b> " +
    escapeRideText(
        ride.pickup
    ) +
    "</p>" +

    "<p><b>Destination:</b> " +
    escapeRideText(
        ride.destination
    ) +
    "</p>" +

    "<p><b>Vehicle:</b> " +
    escapeRideText(
        ride.vehicle
    ) +
    "</p>" +

    "<p><b>Estimated Fare:</b> ₹" +
    (ride.fare || 0) +
    "</p>" +

    "<button onclick=\"acceptLiveRide()\" " +
    "style=\"margin-right:8px;padding:12px 18px;\">" +
    "ACCEPT RIDE" +
    "</button>" +

    "<button onclick=\"rejectLiveRide()\" " +
    "style=\"padding:12px 18px;\">" +
    "REJECT" +
    "</button>";

}

/* =========================================
NO RIDE REQUEST
========================================= */

function showNoRideRequest() {

const card =
    document.getElementById(
        "liveRideRequest"
    );


if (card) {

    card.innerHTML =
        "<p>🚕 No new ride requests.</p>";

}

}

/* =========================================
REQUEST BADGE
========================================= */

function updateRequestBadge(count) {

const badge =
    document.getElementById(
        "requestBadge"
    );


if (badge) {

    badge.textContent =
        count;

}

}

/* =========================================
ACCEPT LIVE RIDE
========================================= */

function acceptLiveRide() {

if (!driverOnline) {

    alert(
        "Please GO ONLINE first."
    );

    return;
}


if (
    !currentRide ||
    !currentRide.id
) {

    alert(
        "No ride request available."
    );

    return;
}


const db =
    getDatabase();


if (!db) {

    alert(
        "Firebase database is not connected."
    );

    return;
}


const driverName =
    localStorage.getItem(
        "nvUserName"
    ) || "Driver";


const driverPhone =
    localStorage.getItem(
        "nvUserPhone"
    ) || "";


db.collection("rides")
    .doc(currentRide.id)
    .update({

        status:
            "accepted",

        driverName:
            driverName,

        driverPhone:
            driverPhone,

        acceptedBy:
            driverPhone,

        acceptedAt:
            firebase.firestore.FieldValue.serverTimestamp()

    })

    .then(function () {

        driverRides++;

        driverEarnings +=
            Number(
                currentRide.fare || 850
            );


        const ridesElement =
            document.getElementById(
                "driverRides"
            );


        const earningsElement =
            document.getElementById(
                "driverEarnings"
            );


        if (ridesElement) {

            ridesElement.textContent =
                driverRides;

        }


        if (earningsElement) {

            earningsElement.textContent =
                "₹" +
                driverEarnings;

        }


        pendingRide =
            false;


        updateRequestBadge(0);


        alert(
            "🚕 Ride accepted successfully!"
        );


        showAcceptedDriverRide(
            currentRide
        );

    })

    .catch(function (error) {

        console.error(
            "Accept ride error:",
            error
        );


        alert(
            "Ride accept nahi hui: " +
            error.message
        );

    });

}

/* =========================================
DRIVER ACCEPTED RIDE SCREEN
========================================= */

function showAcceptedDriverRide(ride) {

const card =
    document.getElementById(
        "liveRideRequest"
    );


if (!card) {
    return;
}


card.innerHTML =

    "<h3>✅ Ride Accepted</h3>" +

    "<p><b>Customer:</b> " +
    escapeRideText(
        ride.customerName
    ) +
    "</p>" +

    "<p><b>Pickup:</b> " +
    escapeRideText(
        ride.pickup
    ) +
    "</p>" +

    "<p><b>Destination:</b> " +
    escapeRideText(
        ride.destination
    ) +
    "</p>" +

    "<p><b>Fare:</b> ₹" +
    (ride.fare || 0) +
    "</p>" +

    "<button onclick=\"completeCurrentRide()\">" +
    "COMPLETE RIDE" +
    "</button>";

}

/* =========================================
REJECT LIVE RIDE
========================================= */

function rejectLiveRide() {

if (
    !currentRide ||
    !currentRide.id
) {

    alert(
        "No ride request available."
    );

    return;
}


const db =
    getDatabase();


if (!db) {
    return;
}


db.collection("rides")
    .doc(currentRide.id)
    .update({

        status:
            "rejected",

        rejectedBy:
            localStorage.getItem(
                "nvUserPhone"
            ) || "",

        rejectedAt:
            firebase.firestore.FieldValue.serverTimestamp()

    })

    .then(function () {

        pendingRide =
            false;


        currentRide =
            null;


        updateRequestBadge(0);


        showNoRideRequest();


        alert(
            "Ride rejected."
        );

    })

    .catch(function (error) {

        console.error(
            "Reject ride error:",
            error
        );

    });

}

/* =========================================
COMPLETE RIDE
========================================= */

function completeCurrentRide() {

if (
    !currentRide ||
    !currentRide.id
) {
    return;
}


const db =
    getDatabase();


if (!db) {
    return;
}


db.collection("rides")
    .doc(currentRide.id)
    .update({

        status:
            "completed",

        completedAt:
            firebase.firestore.FieldValue.serverTimestamp()

    })

    .then(function () {

        alert(
            "✅ Ride completed successfully!"
        );


        currentRide =
            null;


        pendingRide =
            false;


        updateRequestBadge(0);


        showNoRideRequest();

    })

    .catch(function (error) {

        console.error(
            "Complete ride error:",
            error
        );

    });

}

/* =========================================
OLD ACCEPT FUNCTION
KEPT FOR EXISTING HTML
========================================= */

function acceptRide() {

acceptLiveRide();

}

/* =========================================
OLD REJECT FUNCTION
KEPT FOR EXISTING HTML
========================================= */

function rejectRide() {

rejectLiveRide();

}

/* =========================================
DRIVER ONLINE / OFFLINE
========================================= */

function toggleDriverStatus() {

const button =
    document.getElementById(
        "onlineButton"
    );


const statusText =
    document.getElementById(
        "driverStatusText"
    );


driverOnline =
    !driverOnline;


if (driverOnline) {

    if (button) {

        button.textContent =
            "GO OFFLINE";

        button.classList.add(
            "online"
        );

    }


    if (statusText) {

        statusText.textContent =
            "Online";

        statusText.style.color =
            "#16a34a";

    }


    startDriverRideListener();

}

else {

    if (button) {

        button.textContent =
            "GO ONLINE";

        button.classList.remove(
            "online"
        );

    }


    if (statusText) {

        statusText.textContent =
            "Offline";

        statusText.style.color =
            "#dc2626";

    }

}

}

/* =========================================
DRIVER PASS
========================================= */

function activatePass() {

const status =
    document.getElementById(
        "passStatus"
    );


const confirmPass =
    confirm(
        "Driver Pass ₹75 for 24 hours activate karein?"
    );


if (!confirmPass) {
    return;
}


if (status) {

    status.textContent =
        "Active for 24 hours";

    status.style.color =
        "#16a34a";

}


alert(
    "🎫 Driver Pass activated."
);

}

/* =========================================
DRIVER COMMISSION
========================================= */

function payCommission() {

alert(
    "💳 Payment gateway will be connected here."
);

}

/* =========================================
HOTEL
========================================= */

function hotelSearch() {

alert(
    "🏨 Hotel search request created."
);

}

/* =========================================
PACKAGES
========================================= */

function packageSearch() {

alert(
    "🎒 Package search request created."
);

}

/* =========================================
SEARCH
========================================= */

function showSearch() {

openPage(
    "searchPage"
);

}

function performSearch() {

const input =
    document.getElementById(
        "searchInput"
    );


const result =
    document.getElementById(
        "searchResult"
    );


const text =
    input.value.trim();


result.style.display =
    "block";


if (text === "") {

    result.textContent =
        "Please enter something to search.";

    return;
}


result.textContent =
    "🔍 Searching for: " +
    text;

}

/* =========================================
NOTIFICATIONS
========================================= */

function showNotifications() {

alert(
    "🔔 No new notifications."
);

}

/* =========================================
REELS
========================================= */

function likeReel(button) {

const icon =
    button.querySelector(
        "span"
    );


if (icon.textContent === "❤️") {

    icon.textContent =
        "💙";

    button.style.color =
        "#60a5fa";

}

else {

    icon.textContent =
        "❤️";

    button.style.color =
        "white";

}

}

function commentReel() {

const comment =
    prompt(
        "Write your comment:"
    );


if (
    comment &&
    comment.trim() !== ""
) {

    alert(
        "💬 Comment added!"
    );

}

}

function shareReel() {

const shareText =
    "Check out this travel reel from NV Travelss!";


if (navigator.share) {

    navigator.share({

        title:
            "NV Travelss",

        text:
            shareText

    }).catch(
        function () {}
    );

}

else {

    alert(
        "↗️ Reel share option opened."
    );

}

}

function saveReel(button) {

const icon =
    button.querySelector(
        "span"
    );


if (icon.textContent === "🔖") {

    icon.textContent =
        "📌";

    alert(
        "Reel saved."
    );

}

else {

    icon.textContent =
        "🔖";

    alert(
        "Reel removed from saved."
    );

}

}

/* =========================================
POST
========================================= */

function createPost() {

const text =
    prompt(
        "What do you want to post?"
    );


if (
    text &&
    text.trim() !== ""
) {

    alert(
        "➕ Post created successfully."
    );

}

}

/* =========================================
PROFILE / MESSAGES
========================================= */

function showMessage(title) {

alert(
    title +
    " section is ready."
);

}

function openMessages() {

alert(
    "💬 Messages section"
);

}

/* =========================================
LOGOUT
========================================= */

function logout() {

stopRideListener();


document.getElementById(
    "customerApp"
).classList.remove(
    "active-app"
);


document.getElementById(
    "driverApp"
).classList.remove(
    "active-app"
);


document.getElementById(
    "loginScreen"
).classList.add(
    "active-screen"
);

}

function driverLogout() {

stopRideListener();


document.getElementById(
    "driverApp"
).classList.remove(
    "active-app"
);


document.getElementById(
    "loginScreen"
).classList.add(
    "active-screen"
);

}

/* =========================================
STOP LISTENER
========================================= */

function stopRideListener() {

if (rideListener) {

    rideListener();

    rideListener =
        null;

}

}

/* =========================================
SAFE TEXT
========================================= */

function escapeRideText(value) {

if (
    value === undefined ||
    value === null
) {

    return "";

}


return String(value)
    .replace(
        /&/g,
        "&amp;"
    )
    .replace(
        /</g,
        "&lt;"
    )
    .replace(
        />/g,
        "&gt;"
    )
    .replace(
        /"/g,
        "&quot;"
    )
    .replace(
        /'/g,
        "&#039;"
    );

}

/* =========================================
APP START
========================================= */

window.addEventListener(
"load",
function () {

    const savedName =
        localStorage.getItem(
            "nvUserName"
        );


    const savedRole =
        localStorage.getItem(
            "nvUserRole"
        );


    /*
       Login is intentionally shown again
       so testing stays simple.
    */

}

);
