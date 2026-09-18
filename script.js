/* =========================================
   NV TRAVELSS - FINAL APP LOGIC + FIREBASE OTP
========================================= */

let selectedRole = "customer";

let driverOnline = false;
let driverEarnings = 0;
let driverRides = 0;
let pendingRide = true;

let confirmationResult = null;
let recaptchaVerifier = null;


/* =========================================
   LOGIN ROLE
========================================= */

document.addEventListener("DOMContentLoaded", function () {

    const roleButtons = document.querySelectorAll(".role-btn");

    roleButtons.forEach(function (button) {

        button.addEventListener("click", function () {

            roleButtons.forEach(function (btn) {
                btn.classList.remove("active");
            });

            this.classList.add("active");

            selectedRole = this.dataset.role;

        });

    });


    const loginButton = document.getElementById("loginButton");
    const verifyOtpButton = document.getElementById("verifyOtpButton");

    if (loginButton) {
        loginButton.addEventListener("click", login);
    }

    if (verifyOtpButton) {
        verifyOtpButton.addEventListener("click", verifyOTP);
    }

});


/* =========================================
   FIREBASE OTP LOGIN
========================================= */

function login() {

    const nameInput = document.getElementById("loginName");
    const phoneInput = document.getElementById("loginPhone");
    const otpInput = document.getElementById("otpInput");
    const loginButton = document.getElementById("loginButton");
    const verifyButton = document.getElementById("verifyOtpButton");
    const message = document.getElementById("otpMessage");

    const name = nameInput.value.trim();
    let phone = phoneInput.value.trim();


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


    phone = phone.replace(/\D/g, "");


    if (phone.length === 10) {
        phone = "+91" + phone;
    }


    if (!phone.startsWith("+91") || phone.length !== 13) {
        alert("Please enter a valid 10 digit Indian mobile number.");
        phoneInput.focus();
        return;
    }


    localStorage.setItem("nvUserName", name);
    localStorage.setItem("nvUserRole", selectedRole);
    localStorage.setItem("nvUserPhone", phone);


    message.style.display = "block";
    message.textContent = "Sending OTP...";


    loginButton.disabled = true;


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
            .signInWithPhoneNumber(phone, recaptchaVerifier)

            .then(function (result) {

                confirmationResult = result;

                message.textContent =
                    "OTP sent to your mobile number.";

                otpInput.style.display = "block";

                verifyButton.style.display = "block";

                loginButton.style.display = "none";

                otpInput.focus();

            })

            .catch(function (error) {

                console.error(error);

                message.textContent =
                    "OTP send nahi hua: " + error.message;

                loginButton.disabled = false;

                if (recaptchaVerifier) {
                    recaptchaVerifier.clear();
                    recaptchaVerifier = null;
                }

            });

    } catch (error) {

        console.error(error);

        message.textContent =
            "Firebase OTP error: " + error.message;

        loginButton.disabled = false;

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

        alert("Please enter the 6 digit OTP.");

        otpInput.focus();

        return;
    }


    if (!confirmationResult) {

        alert("Please request OTP first.");

        return;
    }


    message.textContent =
        "Verifying OTP...";


    confirmationResult
        .confirm(code)

        .then(function () {

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
   OPEN APP AFTER OTP
========================================= */

function openLoggedInApp() {

    const name =
        localStorage.getItem("nvUserName") || "Traveler";


    document.getElementById("loginScreen")
        .classList.remove("active-screen");


    if (selectedRole === "driver") {

        document.getElementById("driverApp")
            .classList.add("active-app");

        document.getElementById("driverName")
            .textContent = name;

    } else {

        document.getElementById("customerApp")
            .classList.add("active-app");

        document.getElementById("welcomeName")
            .textContent = name;

        document.getElementById("profileName")
            .textContent = name;

        openPage("homePage");

    }

}


/* =========================================
   CUSTOMER PAGE NAVIGATION
========================================= */

function openPage(pageId) {

    const pages =
        document.querySelectorAll("#customerApp .page");

    pages.forEach(function (page) {
        page.classList.remove("active-page");
    });


    const selectedPage =
        document.getElementById(pageId);

    if (selectedPage) {
        selectedPage.classList.add("active-page");
    }


    updateBottomNavigation(pageId);


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
        document.querySelectorAll(".nav-btn");


    navButtons.forEach(function (button) {
        button.classList.remove("active");
    });


    if (pageId === "homePage") {
        navButtons[0].classList.add("active");
    }

    if (pageId === "reelsPage") {
        navButtons[1].classList.add("active");
    }

    if (pageId === "searchPage") {
        navButtons[3].classList.add("active");
    }

    if (pageId === "profilePage") {
        navButtons[4].classList.add("active");
    }

}


/* =========================================
   RIDE
========================================= */

function requestRide() {

    const pickup =
        document.getElementById("pickupLocation").value.trim();

    const destination =
        document.getElementById("destinationLocation").value.trim();

    const vehicle =
        document.getElementById("vehicleType").value;

    const message =
        document.getElementById("rideMessage");


    if (!pickup || !destination || !vehicle) {

        message.style.display = "block";

        message.textContent =
            "Please fill pickup, destination and vehicle.";

        return;
    }


    message.style.display = "block";

    message.innerHTML =
        "🚕 Ride request created.<br>" +
        "Searching for nearby drivers...";

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

    openPage("searchPage");

}


function performSearch() {

    const input =
        document.getElementById("searchInput");

    const result =
        document.getElementById("searchResult");

    const text =
        input.value.trim();


    result.style.display = "block";


    if (text === "") {

        result.textContent =
            "Please enter something to search.";

        return;
    }


    result.textContent =
        "🔍 Searching for: " + text;

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
        button.querySelector("span");


    if (icon.textContent === "❤️") {

        icon.textContent = "💙";
        button.style.color = "#60a5fa";

    } else {

        icon.textContent = "❤️";
        button.style.color = "white";

    }

}


function commentReel() {

    const comment =
        prompt("Write your comment:");


    if (comment && comment.trim() !== "") {

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
            title: "NV Travelss",
            text: shareText
        }).catch(function () {});

    } else {

        alert(
            "↗️ Reel share option opened."
        );

    }

}


function saveReel(button) {

    const icon =
        button.querySelector("span");


    if (icon.textContent === "🔖") {

        icon.textContent = "📌";

        alert("Reel saved.");

    } else {

        icon.textContent = "🔖";

        alert("Reel removed from saved.");

    }

}


/* =========================================
   POST
========================================= */

function createPost() {

    const text =
        prompt("What do you want to post?");


    if (text && text.trim() !== "") {

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
        title + " section is ready."
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

    document.getElementById("customerApp")
        .classList.remove("active-app");

    document.getElementById("driverApp")
        .classList.remove("active-app");

    document.getElementById("loginScreen")
        .classList.add("active-screen");

}


function driverLogout() {

    document.getElementById("driverApp")
        .classList.remove("active-app");

    document.getElementById("loginScreen")
        .classList.add("active-screen");

}


/* =========================================
   DRIVER ONLINE / OFFLINE
========================================= */

function toggleDriverStatus() {

    const button =
        document.getElementById("onlineButton");

    const statusText =
        document.getElementById("driverStatusText");


    driverOnline = !driverOnline;


    if (driverOnline) {

        button.textContent = "GO OFFLINE";

        button.classList.add("online");

        statusText.textContent = "Online";

        statusText.style.color = "#16a34a";

    } else {

        button.textContent = "GO ONLINE";

        button.classList.remove("online");

        statusText.textContent = "Offline";

        statusText.style.color = "#dc2626";

    }

}


/* =========================================
   DRIVER ACCEPT RIDE
========================================= */

function acceptRide() {

    if (!driverOnline) {

        alert(
            "Please GO ONLINE first."
        );

        return;
    }


    if (!pendingRide) {

        alert(
            "No ride request available."
        );

        return;
    }


    driverRides++;

    driverEarnings += 850;

    pendingRide = false;


    document.getElementById("driverRides")
        .textContent = driverRides;

    document.getElementById("driverEarnings")
        .textContent = "₹" + driverEarnings;

    document.getElementById("requestBadge")
        .textContent = "0";


    alert(
        "🚕 Ride accepted successfully!"
    );

}


/* =========================================
   DRIVER REJECT RIDE
========================================= */

function rejectRide() {

    pendingRide = false;

    document.getElementById("requestBadge")
        .textContent = "0";

    alert(
        "Ride rejected."
    );

}


/* =========================================
   DRIVER PASS
========================================= */

function activatePass() {

    const status =
        document.getElementById("passStatus");


    const confirmPass =
        confirm(
            "Driver Pass ₹75 for 24 hours activate karein?"
        );


    if (!confirmPass) {
        return;
    }


    status.textContent =
        "Active for 24 hours";

    status.style.color =
        "#16a34a";


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
   APP START
========================================= */

window.addEventListener("load", function () {

    const savedName =
        localStorage.getItem("nvUserName");

    const savedRole =
        localStorage.getItem("nvUserRole");

    /*
       Login is intentionally shown again
       so testing stays simple.
    */

});
