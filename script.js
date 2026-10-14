/* =====================================================
   NV TRAVELSS — COMPLETE APP SCRIPT
   Customer + Driver + Hotel
   Firebase OTP + Ride Requests + Ride OTP
   GPS + Google Maps Links + Fare + Hotel Bookings
   Compatible with the supplied index.html
===================================================== */

"use strict";

/* ================= FIREBASE ================= */

if (typeof firebase === "undefined" || !firebase.apps.length) {
    console.error("Firebase initialize nahi hua. index.html check karein.");
}

const auth = firebase.auth();
const db = firebase.firestore();

/* ================= APP STATE ================= */

let selectedRole = "customer";
let currentUser = null;
let confirmationResult = null;
let recaptchaVerifier = null;

let driverOnline = false;
let activeRideId = null;
let currentRide = null;

let customerRideUnsubscribe = null;
let driverRequestsUnsubscribe = null;
let driverActiveUnsubscribe = null;
let hotelBookingsUnsubscribe = null;

let driverGpsWatchId = null;
let customerGpsWatchId = null;

let lastDriverPosition = null;
let driverDistanceKm = 0;

let driverEarnings = 0;
let driverRides = 0;
let driverPassActiveUntil = 0;

const VEHICLE_RATES = {
    "bike": 10,
    "auto": 15,
    "hatchback": 16,
    "sedan": 18,
    "suv": 22,
    "muv": 24,
    "premium": 30,
    "6-7-seater": 25,
    "8-12-seater": 30,
    "tempo-traveller": 35,
    "mini-bus": 45,
    "bus": 60
};

const VEHICLE_NAMES = {
    "bike": "Bike",
    "auto": "Auto Rickshaw",
    "hatchback": "Hatchback",
    "sedan": "Sedan",
    "suv": "SUV",
    "muv": "MUV",
    "premium": "Premium / Luxury Car",
    "6-7-seater": "6–7 Seater",
    "8-12-seater": "8–12 Seater",
    "tempo-traveller": "Tempo Traveller",
    "mini-bus": "Mini Bus",
    "bus": "Bus"
};

const ACTIVE_RIDE_STATUSES = [
    "accepted",
    "driverComing",
    "started"
];

/* ================= HELPERS ================= */

function getElement(id) {
    return document.getElementById(id);
}

function getUserName() {
    return currentUser?.name || "Traveler";
}

function getUserPhone() {
    return currentUser?.phone || "";
}

function getUserRole() {
    return currentUser?.role || selectedRole;
}

function showNotice(message) {
    alert(String(message));
}

function safeText(value) {
    return String(value ?? "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}

function formatMoney(value) {
    return "₹" + Math.round(Number(value) || 0).toLocaleString("en-IN");
}

function makeGoogleMapsUrl(destination) {
    return "https://www.google.com/maps/dir/?api=1&destination=" +
        encodeURIComponent(destination || "");
}

function makeCoordinateMapsUrl(lat, lng) {
    return "https://www.google.com/maps/search/?api=1&query=" +
        encodeURIComponent(lat + "," + lng);
}

function generateRideOTP() {
    return String(Math.floor(1000 + Math.random() * 9000));
}

function haversineKm(a, b) {
    if (!a || !b) return 0;

    const R = 6371;
    const rad = value => value * Math.PI / 180;

    const dLat = rad(b.lat - a.lat);
    const dLng = rad(b.lng - a.lng);

    const h =
        Math.sin(dLat / 2) ** 2 +
        Math.cos(rad(a.lat)) *
        Math.cos(rad(b.lat)) *
        Math.sin(dLng / 2) ** 2;

    return 2 * R * Math.asin(Math.sqrt(h));
}

function setText(id, value) {
    const el = getElement(id);
    if (el) el.textContent = value;
}

function showScreen(id) {
    ["loginScreen", "customerApp", "driverApp"].forEach(screenId => {
        const el = getElement(screenId);
        if (el) el.style.display = screenId === id ? "" : "none";
    });

    const hotelPanel = getElement("hotelOwnerDashboard");
    if (hotelPanel) {
        hotelPanel.style.display = id === "hotelOwnerDashboard" ? "" : "none";
    }
}

/* ================= LOGIN ROLE ================= */

document.querySelectorAll(".role-btn").forEach(button => {
    button.addEventListener("click", () => {
        selectedRole = button.dataset.role || "customer";

        document.querySelectorAll(".role-btn").forEach(btn => {
            btn.classList.toggle("active", btn === button);
        });
    });
});

/* ================= FIREBASE PHONE OTP ================= */

function setupRecaptcha() {
    if (recaptchaVerifier) return;

    try {
        recaptchaVerifier = new firebase.auth.RecaptchaVerifier(
            "recaptcha-container",
            {
                size: "normal",
                callback: () => {
                    console.log("reCAPTCHA verified");
                },
                "expired-callback": () => {
                    setText("otpMessage", "reCAPTCHA expire ho gaya. Dobara verify karein.");
                }
            }
        );

        recaptchaVerifier.render().catch(error => {
            console.error("reCAPTCHA render error:", error);
        });
    } catch (error) {
        console.error("reCAPTCHA error:", error);
    }
}

async function login() {
    const name = getElement("loginName")?.value.trim();
    const rawPhone = getElement("loginPhone")?.value.trim();

    if (!name) {
        showNotice("Apna naam enter karein.");
        return;
    }

    if (!rawPhone) {
        showNotice("Mobile number enter karein.");
        return;
    }

    let phone = rawPhone.replace(/\D/g, "");

    if (phone.length === 10) {
        phone = "+91" + phone;
    } else if (phone.length === 12 && phone.startsWith("91")) {
        phone = "+" + phone;
    } else {
        showNotice("Sahi 10-digit Indian mobile number enter karein.");
        return;
    }

    if (!/^\+91[6-9]\d{9}$/.test(phone)) {
        showNotice("Sahi Indian mobile number enter karein.");
        return;
    }

    const loginButton = getElement("loginButton");
    if (loginButton) loginButton.disabled = true;

    try {
        setupRecaptcha();

        if (!recaptchaVerifier) {
            throw new Error("reCAPTCHA ready nahi hai. Page reload karke try karein.");
        }

        await recaptchaVerifier.render();

        confirmationResult = await auth.signInWithPhoneNumber(
            phone,
            recaptchaVerifier
        );

        window.nvPendingLogin = {
            name,
            phone,
            role: selectedRole
        };

        const otpInput = getElement("otpInput");
        const verifyButton = getElement("verifyOtpButton");

        if (otpInput) {
            otpInput.style.display = "block";
            otpInput.value = "";
        }

        if (verifyButton) verifyButton.style.display = "block";

        setText("otpMessage", "OTP SMS se bhej diya gaya hai. Apna OTP enter karein.");

        if (loginButton) loginButton.style.display = "none";

    } catch (error) {
        console.error("Phone login error:", error);

        setText(
            "otpMessage",
            "OTP nahi bheja gaya: " + (error.message || error.code || "Error")
        );

        try {
            if (recaptchaVerifier) {
                await recaptchaVerifier.clear();
                recaptchaVerifier = null;
            }
        } catch (_) {}

    } finally {
        if (loginButton) loginButton.disabled = false;
    }
}

async function verifyOTP() {
    const otp = getElement("otpInput")?.value.trim();
    const pending = window.nvPendingLogin;

    if (!confirmationResult || !pending) {
        showNotice("Pehle Login dabakar OTP mangwayein.");
        return;
    }

    if (!/^\d{6}$/.test(otp || "")) {
        showNotice("6-digit Firebase OTP enter karein.");
        return;
    }

    try {
        const result = await confirmationResult.confirm(otp);

        currentUser = {
            uid: result.user.uid,
            name: pending.name,
            phone: pending.phone,
            role: pending.role
        };

        localStorage.setItem("nvUserName", currentUser.name);
        localStorage.setItem("nvUserRole", currentUser.role);
        localStorage.setItem("nvUserPhone", currentUser.phone);

        await openLoggedInApp();

    } catch (error) {
        console.error("OTP verification error:", error);
        setText("otpMessage", "OTP verify nahi hua. OTP check karke dobara try karein.");
    }
}

if (getElement("loginButton")) {
    getElement("loginButton").addEventListener("click", login);
}

if (getElement("verifyOtpButton")) {
    getElement("verifyOtpButton").addEventListener("click", verifyOTP);
}

/* ================= OPEN DASHBOARD ================= */

async function openLoggedInApp() {
    if (!currentUser) return;

    selectedRole = currentUser.role;

    setText("welcomeName", currentUser.name);
    setText("profileName", currentUser.name);
    setText("driverName", currentUser.name);

    const phoneInput = getElement("loginPhone");
    if (phoneInput) phoneInput.value = currentUser.phone;

    stopAllListeners();
    showHotelDashboard(false);

    if (selectedRole === "driver") {
        showScreen("driverApp");
        startDriverDashboard();
        return;
    }

    if (selectedRole === "hotel") {
        showHotelDashboard(true);
        startHotelDashboard();
        return;
    }

    showScreen("customerApp");
    openPage("homePage");
    startCustomerRideListener();
}

function restoreSavedLogin() {
    /*
       OTP bypass nahi kiya ja raha.
       Saved details sirf form mein prefill hoti hain.
       Har nayi login ke liye Firebase OTP zaroori hai.
    */
    const savedName = localStorage.getItem("nvUserName");
    const savedPhone = localStorage.getItem("nvUserPhone");

    if (savedName && getElement("loginName")) {
        getElement("loginName").value = savedName;
    }

    if (savedPhone && getElement("loginPhone")) {
        getElement("loginPhone").value = savedPhone.replace("+91", "");
    }
}

restoreSavedLogin();

/* ================= CUSTOMER NAVIGATION ================= */

function openPage(pageId) {
    document.querySelectorAll("#customerApp .page").forEach(page => {
        page.classList.toggle("active-page", page.id === pageId);
    });

    const navPages = {
        homePage: 0,
        reelsPage: 1,
        searchPage: 3,
        profilePage: 4
    };

    document.querySelectorAll("#customerApp .bottom-nav .nav-btn").forEach((button, index) => {
        button.classList.toggle(navPages[pageId] === index, true);
        button.classList.toggle(
            "active",
            navPages[pageId] === index
        );
    });
}

function goHome() {
    openPage("homePage");
}

function showSearch() {
    openPage("searchPage");
    getElement("searchInput")?.focus();
}

function showNotifications() {
    showNotice("Aapki notifications yahan dikhengi jab app mein notifications enable hongi.");
}

function showMessage(message) {
    showNotice(message + " ka section abhi connect nahi hai.");
}

function openMessages() {
    showNotice("Messaging feature abhi connect nahi hai.");
}

/* ================= RIDE BOOKING ================= */

async function requestRide() {
    if (!currentUser || currentUser.role !== "customer") {
        showNotice("Ride book karne ke liye Customer login karein.");
        return;
    }

    const pickup = getElement("pickupLocation")?.value.trim();
    const destination = getElement("destinationLocation")?.value.trim();
    const vehicle = getElement("vehicleType")?.value;

    if (!pickup || !destination || !vehicle) {
        showNotice("Pickup, destination aur vehicle select karein.");
        return;
    }

    const rate = VEHICLE_RATES[vehicle];

    if (!rate) {
        showNotice("Selected vehicle ki rate available nahi hai.");
        return;
    }

    const button = document.querySelector("#ridePage .primary-btn");
    if (button) button.disabled = true;

    try {
        const rideOtp = generateRideOTP();

        const rideData = {
            customerUid: currentUser.uid,
            customerName: currentUser.name,
            customerPhone: currentUser.phone,

            pickup,
            destination,
            vehicle,
            vehicleName: VEHICLE_NAMES[vehicle],
            ratePerKm: rate,

            fare: rate,
            baseFare: rate,
            liveFare: rate,
            finalFare: null,

            actualDistanceKm: 0,

            status: "searching",
            driverUid: "",
            driverName: "",
            driverPhone: "",
            driverLat: null,
            driverLng: null,

            rideOtp,
            otpVerified: false,

            rejectedBy: [],

            customerLat: null,
            customerLng: null,

            createdAt: firebase.firestore.FieldValue.serverTimestamp(),
            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        };

        const doc = await db.collection("rides").add(rideData);

        activeRideId = doc.id;
        localStorage.setItem("nvCurrentRideId", doc.id);

        setText(
            "rideMessage",
            "Ride request bhej di gayi hai. Nearby online drivers ka intezar karein."
        );

        startCustomerRideListener();

    } catch (error) {
        console.error("Ride booking error:", error);
        showNotice("Ride book nahi hui. Firebase rules aur internet check karein.");
    } finally {
        if (button) button.disabled = false;
    }
}

/* ================= CUSTOMER RIDE LISTENER ================= */

function startCustomerRideListener() {
    if (customerRideUnsubscribe) {
        customerRideUnsubscribe();
        customerRideUnsubscribe = null;
    }

    const rideId = activeRideId || localStorage.getItem("nvCurrentRideId");
    if (!rideId || !currentUser || currentUser.role !== "customer") return;

    activeRideId = rideId;

    customerRideUnsubscribe = db.collection("rides")
        .doc(rideId)
        .onSnapshot(snapshot => {
            if (!snapshot.exists) {
                setText("rideMessage", "Ride request nahi mili.");
                return;
            }

            const ride = snapshot.data();
            updateCustomerRideStatus(ride);
        }, error => {
            console.error("Customer ride listener error:", error);
            setText("rideMessage", "Ride status load nahi hua. Firebase rules check karein.");
        });
}

function updateCustomerRideStatus(ride) {
    currentRide = ride;

    const box = getElement("rideMessage");
    if (!box) return;

    let html = "";

    if (ride.status === "searching") {
        html = `
            <h3>🔎 Driver dhoondh rahe hain</h3>
            <p><b>Pickup:</b> ${safeText(ride.pickup)}</p>
            <p><b>Destination:</b> ${safeText(ride.destination)}</p>
            <p><b>Vehicle:</b> ${safeText(ride.vehicleName)}</p>
            <p><b>Rate:</b> ${formatMoney(ride.ratePerKm)}/km</p>
            <p>Online driver ka intezar karein.</p>
            <button onclick="cancelCustomerRide()">Cancel Ride</button>
        `;
    } else if (ride.status === "accepted" || ride.status === "driverComing") {
        html = `
            <h3>🚕 Driver mil gaya</h3>
            <p><b>Driver:</b> ${safeText(ride.driverName || "Driver")}</p>
            <p><b>Phone:</b> ${safeText(ride.driverPhone || "Not available")}</p>
            <p><b>Vehicle:</b> ${safeText(ride.vehicleName)}</p>
            <p><b>Pickup:</b> ${safeText(ride.pickup)}</p>
            <p><b>Destination:</b> ${safeText(ride.destination)}</p>
            <p><b>Rate:</b> ${formatMoney(ride.ratePerKm)}/km</p>
            ${ride.status === "driverComing"
                ? `<h2>Ride OTP: ${safeText(ride.rideOtp)}</h2>
                   <p>Ye OTP driver ko tabhi batayein jab driver pickup par pahunch jaye.</p>`
                : `<p>Driver aapke pickup par aa raha hai.</p>`}
            ${ride.driverLat != null && ride.driverLng != null
                ? `<p><a href="${makeCoordinateMapsUrl(ride.driverLat, ride.driverLng)}" target="_blank" rel="noopener">📍 Driver ki latest location Maps par dekhein</a></p>`
                : ""}
            <p><a href="${makeGoogleMapsUrl(ride.pickup)}" target="_blank" rel="noopener">Pickup location Maps mein kholein</a></p>
        `;
    } else if (ride.status === "started") {
        const fare = ride.liveFare ?? ride.fare ?? ride.ratePerKm;

        html = `
            <h3>🟢 Ride chal rahi hai</h3>
            <p><b>Driver:</b> ${safeText(ride.driverName || "Driver")}</p>
            <p><b>Distance recorded:</b> ${(Number(ride.actualDistanceKm) || 0).toFixed(2)} km</p>
            <h2>Estimated fare: ${formatMoney(fare)}</h2>
            <p>Final fare ride complete hone par update hoga.</p>
            ${ride.driverLat != null && ride.driverLng != null
                ? `<p><a href="${makeCoordinateMapsUrl(ride.driverLat, ride.driverLng)}" target="_blank" rel="noopener">📍 Driver ki latest location Maps par dekhein</a></p>`
                : ""}
            <p><a href="${makeGoogleMapsUrl(ride.destination)}" target="_blank" rel="noopener">Destination Maps mein kholein</a></p>
        `;
    } else if (ride.status === "completed") {
        html = `
            <h3>✅ Ride complete ho gayi</h3>
            <p><b>Distance:</b> ${(Number(ride.actualDistanceKm) || 0).toFixed(2)} km</p>
            <h2>Final fare: ${formatMoney(ride.finalFare ?? ride.fare)}</h2>
            <p>Thank you for travelling with NV Travelss.</p>
            <button onclick="clearCustomerRide()">Book Another Ride</button>
        `;
    } else if (ride.status === "cancelled") {
        html = `
            <h3>Ride cancel ho gayi</h3>
            <button onclick="clearCustomerRide()">Book Another Ride</button>
        `;
    } else {
        html = `<p>Ride status: ${safeText(ride.status)}</p>`;
    }

    box.innerHTML = html;

    if (ride.status === "started") {
        startCustomerLocationSharing(ride);
    } else {
        stopCustomerGps();
    }
}

async function cancelCustomerRide() {
    if (!activeRideId || !currentRide) return;

    if (!["searching", "accepted", "driverComing"].includes(currentRide.status)) {
        showNotice("Is stage par ride cancel nahi kar sakte.");
        return;
    }

    try {
        await db.collection("rides").doc(activeRideId).update({
            status: "cancelled",
            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        });

        stopCustomerGps();
    } catch (error) {
        console.error(error);
        showNotice("Ride cancel nahi hui.");
    }
}

function clearCustomerRide() {
    stopCustomerGps();

    if (customerRideUnsubscribe) {
        customerRideUnsubscribe();
        customerRideUnsubscribe = null;
    }

    activeRideId = null;
    currentRide = null;

    localStorage.removeItem("nvCurrentRideId");
    setText("rideMessage", "");

    if (getElement("pickupLocation")) getElement("pickupLocation").value = "";
    if (getElement("destinationLocation")) getElement("destinationLocation").value = "";
    if (getElement("vehicleType")) getElement("vehicleType").value = "";
}

/* ================= CUSTOMER GPS ================= */

function startCustomerLocationSharing(ride) {
    if (!navigator.geolocation || !activeRideId) return;
    if (customerGpsWatchId !== null) return;

    customerGpsWatchId = navigator.geolocation.watchPosition(
        position => {
            const lat = position.coords.latitude;
            const lng = position.coords.longitude;

            db.collection("rides").doc(activeRideId).update({
                customerLat: lat,
                customerLng: lng,
                updatedAt: firebase.firestore.FieldValue.serverTimestamp()
            }).catch(error => console.error("Customer GPS update error:", error));
        },
        error => {
            console.warn("Customer GPS unavailable:", error.message);
        },
        {
            enableHighAccuracy: true,
            maximumAge: 5000,
            timeout: 15000
        }
    );
}

function stopCustomerGps() {
    if (customerGpsWatchId !== null && navigator.geolocation) {
        navigator.geolocation.clearWatch(customerGpsWatchId);
    }

    customerGpsWatchId = null;
}

/* ================= DRIVER DASHBOARD ================= */

function startDriverDashboard() {
    if (!currentUser || currentUser.role !== "driver") return;

    setText("driverStatusText", driverOnline ? "Online" : "Offline");
    setText("driverEarnings", formatMoney(driverEarnings));
    setText("driverRides", String(driverRides));

    listenForRideRequests();
    listenForDriverActiveRides();
}

async function toggleDriverStatus() {
    if (!currentUser || currentUser.role !== "driver") {
        showNotice("Driver login karein.");
        return;
    }

    driverOnline = !driverOnline;

    setText("driverStatusText", driverOnline ? "Online" : "Offline");

    const button = getElement("onlineButton");
    if (button) {
        button.textContent = driverOnline ? "GO OFFLINE" : "GO ONLINE";
    }

    if (driverOnline) {
        listenForRideRequests();
        listenForDriverActiveRides();
    } else {
        if (driverRequestsUnsubscribe) {
            driverRequestsUnsubscribe();
            driverRequestsUnsubscribe = null;
        }

        stopDriverGps();
    }
}

function listenForRideRequests() {
    if (!driverOnline || !currentUser) return;

    if (driverRequestsUnsubscribe) {
        driverRequestsUnsubscribe();
    }

    driverRequestsUnsubscribe = db.collection("rides")
        .where("status", "==", "searching")
        .onSnapshot(snapshot => {
            const requests = [];

            snapshot.forEach(doc => {
                const ride = doc.data();

                if (ride.customerPhone === currentUser.phone) return;

                const rejectedBy = Array.isArray(ride.rejectedBy) ? ride.rejectedBy : [];
                if (rejectedBy.includes(currentUser.phone)) return;

                requests.push({ id: doc.id, ...ride });
            });

            renderRideRequests(requests);
        }, error => {
            console.error("Driver requests listener error:", error);
            setText("liveRideRequest", "Ride requests load nahi hui. Firebase rules/index check karein.");
        });
}

function renderRideRequests(requests) {
    const box = getElement("liveRideRequest");
    if (!box) return;

    setText("requestBadge", String(requests.length));

    if (!requests.length) {
        box.innerHTML = "<p>🚕 No new ride requests.</p>";
        return;
    }

    box.innerHTML = requests.map(ride => `
        <div class="ride-request-card" style="padding:12px;margin:10px 0;border:1px solid #ddd;border-radius:12px;">
            <h3>🚕 New Ride</h3>
            <p><b>Customer:</b> ${safeText(ride.customerName || "Customer")}</p>
            <p><b>Pickup:</b> ${safeText(ride.pickup)}</p>
            <p><b>Destination:</b> ${safeText(ride.destination)}</p>
            <p><b>Vehicle:</b> ${safeText(ride.vehicleName)}</p>
            <p><b>Rate:</b> ${formatMoney(ride.ratePerKm)}/km</p>
            <button onclick="acceptRide('${ride.id}')">Accept Ride</button>
            <button onclick="rejectRide('${ride.id}')">Reject</button>
        </div>
    `).join("");
}

async function acceptRide(rideId) {
    if (!driverOnline || !currentUser) {
        showNotice("Pehle GO ONLINE karein.");
        return;
    }

    try {
        await db.runTransaction(async transaction => {
            const ref = db.collection("rides").doc(rideId);
            const snapshot = await transaction.get(ref);

            if (!snapshot.exists) throw new Error("Ride nahi mili.");

            const ride = snapshot.data();

            if (ride.status !== "searching") {
                throw new Error("Ye ride kisi aur driver ne accept kar li.");
            }

            const rejectedBy = Array.isArray(ride.rejectedBy) ? ride.rejectedBy : [];
            if (rejectedBy.includes(currentUser.phone)) {
                throw new Error("Aapne ye ride pehle reject ki thi.");
            }

            transaction.update(ref, {
                status: "accepted",
                driverUid: currentUser.uid,
                driverName: currentUser.name,
                driverPhone: currentUser.phone,
                driverLat: null,
                driverLng: null,
                acceptedAt: firebase.firestore.FieldValue.serverTimestamp(),
                updatedAt: firebase.firestore.FieldValue.serverTimestamp()
            });
        });

        activeRideId = rideId;
        lastDriverPosition = null;
        driverDistanceKm = 0;

        showNotice("Ride accept ho gayi. Pickup par pahunchkar 'Arrived' dabayein.");
        listenForDriverActiveRides();
        startDriverGps();

    } catch (error) {
        console.error("Accept ride error:", error);
        showNotice(error.message || "Ride accept nahi hui.");
    }
}

async function rejectRide(rideId) {
    if (!currentUser) return;

    try {
        await db.collection("rides").doc(rideId).update({
            rejectedBy: firebase.firestore.FieldValue.arrayUnion(currentUser.phone),
            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        });
    } catch (error) {
        console.error("Reject ride error:", error);
        showNotice("Ride reject nahi hui.");
    }
}

/* ================= DRIVER ACTIVE RIDE ================= */

function listenForDriverActiveRides() {
    if (!currentUser) return;

    if (driverActiveUnsubscribe) {
        driverActiveUnsubscribe();
        driverActiveUnsubscribe = null;
    }

    driverActiveUnsubscribe = db.collection("rides")
        .where("driverPhone", "==", currentUser.phone)
        .onSnapshot(snapshot => {
            const active = [];

            snapshot.forEach(doc => {
                const ride = doc.data();

                if (ACTIVE_RIDE_STATUSES.includes(ride.status)) {
                    active.push({ id: doc.id, ...ride });
                }
            });

            renderDriverActiveRides(active);
        }, error => {
            console.error("Driver active ride error:", error);
        });
}

function renderDriverActiveRides(rides) {
    const box = getElement("liveRideRequest");
    if (!box) return;

    const active = rides.find(ride => ACTIVE_RIDE_STATUSES.includes(ride.status));

    if (!active) {
        if (!driverOnline) {
            box.innerHTML = "<p>Driver offline hai. GO ONLINE karke requests dekhein.</p>";
        }
        return;
    }

    currentRide = active;
    activeRideId = active.id;

    let action = "";

    if (active.status === "accepted") {
        action = `<button onclick="driverComingToCustomer('${active.id}')">📍 Arrived at Pickup</button>`;
    } else if (active.status === "driverComing") {
        action = `
            <p>Customer se ride OTP lein.</p>
            <input id="driverRideOtpInput" inputmode="numeric" maxlength="4" placeholder="Customer Ride OTP">
            <button onclick="verifyRideOtpAndStart('${active.id}')">Verify OTP & Start</button>
        `;
    } else if (active.status === "started") {
        action = `
            <p>Ride chal rahi hai.</p>
            <p>Distance: ${(Number(active.actualDistanceKm) || 0).toFixed(2)} km</p>
            <p>Estimated fare: ${formatMoney(active.liveFare ?? active.fare)}</p>
            <button onclick="openDestinationMaps('${active.id}')">Navigate to Destination</button>
            <button onclick="completeCurrentRide('${active.id}')">Complete Ride</button>
        `;
    }

    box.innerHTML = `
        <div class="ride-request-card" style="padding:12px;margin:10px 0;border:1px solid #ddd;border-radius:12px;">
            <h3>🟢 Your Active Ride</h3>
            <p><b>Status:</b> ${safeText(active.status)}</p>
            <p><b>Customer:</b> ${safeText(active.customerName || "Customer")}</p>
            <p><b>Customer Phone:</b> ${safeText(active.customerPhone || "")}</p>
            <p><b>Pickup:</b> ${safeText(active.pickup)}</p>
            <p><b>Destination:</b> ${safeText(active.destination)}</p>
            <p><b>Vehicle:</b> ${safeText(active.vehicleName)}</p>
            <p><b>Rate:</b> ${formatMoney(active.ratePerKm)}/km</p>
            <p><a href="${makeGoogleMapsUrl(active.status === "started" ? active.destination : active.pickup)}" target="_blank" rel="noopener">Open Google Maps Navigation</a></p>
            ${action}
        </div>
    `;

    if (active.status === "accepted" || active.status === "driverComing" || active.status === "started") {
        startDriverGps();
    }
}

async function driverComingToCustomer(rideId) {
    if (!currentUser) return;

    try {
        await db.collection("rides").doc(rideId).update({
            status: "driverComing",
            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        });

        showNotice("Customer ki screen par Ride OTP dikh jayega. Customer se OTP lein.");
    } catch (error) {
        console.error(error);
        showNotice("Ride status update nahi hua.");
    }
}

async function verifyRideOtpAndStart(rideId) {
    const input = getElement("driverRideOtpInput");
    const enteredOtp = input?.value.trim();

    if (!/^\d{4}$/.test(enteredOtp || "")) {
        showNotice("Customer ka 4-digit Ride OTP enter karein.");
        return;
    }

    try {
        await db.runTransaction(async transaction => {
            const ref = db.collection("rides").doc(rideId);
            const snapshot = await transaction.get(ref);

            if (!snapshot.exists) throw new Error("Ride nahi mili.");

            const ride = snapshot.data();

            if (ride.driverPhone !== currentUser.phone) {
                throw new Error("Ye ride aapko assign nahi hai.");
            }

            if (ride.status !== "driverComing") {
                throw new Error("Ride ab OTP verification ke liye ready nahi hai.");
            }

            if (String(ride.rideOtp) !== enteredOtp) {
                throw new Error("OTP galat hai. Customer ki screen wala OTP enter karein.");
            }

            transaction.update(ref, {
                status: "started",
                otpVerified: true,
                startedAt: firebase.firestore.FieldValue.serverTimestamp(),
                updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
                actualDistanceKm: 0,
                liveFare: Number(ride.ratePerKm) || 0,
                fare: Number(ride.ratePerKm) || 0
            });
        });

        lastDriverPosition = null;
        driverDistanceKm = 0;
        startDriverGps();

        showNotice("OTP verified. Ride start ho gayi.");

    } catch (error) {
        console.error("Ride OTP error:", error);
        showNotice(error.message || "OTP verification fail hui.");
    }
}

function openDestinationMaps(rideId) {
    const destination = currentRide?.destination;

    if (destination) {
        window.open(makeGoogleMapsUrl(destination), "_blank", "noopener");
        return;
    }

    db.collection("rides").doc(rideId).get().then(snapshot => {
        if (snapshot.exists) {
            window.open(makeGoogleMapsUrl(snapshot.data().destination), "_blank", "noopener");
        }
    }).catch(console.error);
}

/* ================= DRIVER GPS + FARE ================= */

function startDriverGps() {
    if (!navigator.geolocation || driverGpsWatchId !== null || !currentUser) return;

    driverGpsWatchId = navigator.geolocation.watchPosition(
        async position => {
            const lat = position.coords.latitude;
            const lng = position.coords.longitude;

            if (!activeRideId) return;

            const currentPosition = { lat, lng };

            if (lastDriverPosition && currentRide?.status === "started") {
                const moved = haversineKm(lastDriverPosition, currentPosition);

                // Bahut bada GPS jump ignore karein.
                if (moved >= 0 && moved < 1) {
                    driverDistanceKm += moved;
                }
            }

            lastDriverPosition = currentPosition;

            const rideRef = db.collection("rides").doc(activeRideId);

            try {
                const snapshot = await rideRef.get();
                if (!snapshot.exists) return;

                const ride = snapshot.data();

                if (ride.driverPhone !== currentUser.phone) return;

                const rate = Number(ride.ratePerKm) || 0;
                const fare = Math.max(rate, driverDistanceKm * rate);

                await rideRef.update({
                    driverLat: lat,
                    driverLng: lng,
                    actualDistanceKm: driverDistanceKm,
                    liveFare: fare,
                    fare: fare,
                    updatedAt: firebase.firestore.FieldValue.serverTimestamp()
                });

            } catch (error) {
                console.warn("Driver GPS Firestore update error:", error);
            }
        },
        error => {
            console.warn("Driver GPS unavailable:", error.message);

            if (error.code === 1) {
                showNotice("Driver GPS permission allow karein, tabhi location update hogi.");
            }
        },
        {
            enableHighAccuracy: true,
            maximumAge: 3000,
            timeout: 15000
        }
    );
}

function stopDriverGps() {
    if (driverGpsWatchId !== null && navigator.geolocation) {
        navigator.geolocation.clearWatch(driverGpsWatchId);
    }

    driverGpsWatchId = null;
    lastDriverPosition = null;
}

/* ================= COMPLETE RIDE ================= */

async function completeCurrentRide(rideId = activeRideId) {
    if (!rideId || !currentUser) {
        showNotice("Active ride nahi mili.");
        return;
    }

    try {
        const ref = db.collection("rides").doc(rideId);
        const snapshot = await ref.get();

        if (!snapshot.exists) {
            showNotice("Ride nahi mili.");
            return;
        }

        const ride = snapshot.data();

        if (ride.driverPhone !== currentUser.phone) {
            showNotice("Ye ride aapko assign nahi hai.");
            return;
        }

        if (ride.status !== "started" || ride.otpVerified !== true) {
            showNotice("Ride complete karne se pehle OTP se start karein.");
            return;
        }

        const distance = Number(ride.actualDistanceKm) || 0;
        const rate = Number(ride.ratePerKm) || 0;
        const finalFare = Math.max(rate, distance * rate);

        await ref.update({
            status: "completed",
            actualDistanceKm: distance,
            finalFare,
            fare: finalFare,
            liveFare: finalFare,
            completedAt: firebase.firestore.FieldValue.serverTimestamp(),
            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        });

        driverRides += 1;
        driverEarnings += finalFare;

        setText("driverEarnings", formatMoney(driverEarnings));
        setText("driverRides", String(driverRides));

        stopDriverGps();

        activeRideId = null;
        currentRide = null;
        lastDriverPosition = null;
        driverDistanceKm = 0;

        showNotice("Ride complete ho gayi. Final fare: " + formatMoney(finalFare));

    } catch (error) {
        console.error("Complete ride error:", error);
        showNotice("Ride complete nahi hui. Firebase rules check karein.");
    }
}

/* ================= DRIVER PASS ================= */

async function activatePass() {
    if (!currentUser || currentUser.role !== "driver") {
        showNotice("Driver login karein.");
        return;
    }

    const confirmed = confirm("₹75 ka 24-hour Driver Pass activate karna hai? Abhi automatic payment gateway connected nahi hai.");

    if (!confirmed) return;

    /*
       Abhi yeh demo activation hai.
       Real paid pass ke liye verified payment gateway/server required hai.
    */
    driverPassActiveUntil = Date.now() + 24 * 60 * 60 * 1000;

    setText("passStatus", "Active — 24 Hours");

    try {
        await db.collection("driverPasses").doc(currentUser.uid).set({
            driverUid: currentUser.uid,
            driverPhone: currentUser.phone,
            price: 75,
            status: "demo-active",
            activatedAt: firebase.firestore.FieldValue.serverTimestamp(),
            expiresAt: new Date(driverPassActiveUntil)
        }, { merge: true });
    } catch (error) {
        console.warn("Driver pass save error:", error);
    }

    showNotice("Demo pass active dikh raha hai, lekin ₹75 ka real payment abhi collect nahi hua.");
}

async function payCommission() {
    showNotice("Real commission payment abhi connected nahi hai. Payment gateway aur secure server ke bina payment successful mark nahi ki jayegi.");
}

/* ================= HOTEL OWNER DASHBOARD ================= */

function showHotelDashboard(show) {
    let panel = getElement("hotelOwnerDashboard");

    if (!panel) {
        panel = document.createElement("section");
        panel.id = "hotelOwnerDashboard";
        panel.className = "app-screen";
        panel.style.padding = "16px";
        panel.style.display = "none";

        panel.innerHTML = `
            <header style="display:flex;justify-content:space-between;align-items:center;gap:12px;">
                <div>
                    <small>NV TRAVELSS</small>
                    <h2>Hotel Owner Dashboard</h2>
                </div>
                <button onclick="logout()">🚪 Logout</button>
            </header>

            <div class="driver-card" style="margin-top:20px;padding:16px;border:1px solid #ddd;border-radius:12px;">
                <h3>🏨 Incoming Hotel Bookings</h3>
                <p>Customers ki hotel booking requests yahan dikhengi.</p>
                <div id="hotelBookingRequests">
                    <p>Bookings load ho rahi hain...</p>
                </div>
            </div>
        `;

        document.body.appendChild(panel);
    }

    panel.style.display = show ? "block" : "none";

    if (show) {
        ["loginScreen", "customerApp", "driverApp"].forEach(id => {
            const el = getElement(id);
            if (el) el.style.display = "none";
        });
    }
}

function startHotelDashboard() {
    if (!currentUser || currentUser.role !== "hotel") return;

    showHotelDashboard(true);

    if (hotelBookingsUnsubscribe) {
        hotelBookingsUnsubscribe();
        hotelBookingsUnsubscribe = null;
    }

    hotelBookingsUnsubscribe = db.collection("hotelBookings")
        .orderBy("createdAt", "desc")
        .limit(50)
        .onSnapshot(snapshot => {
            const bookings = [];

            snapshot.forEach(doc => {
                bookings.push({ id: doc.id, ...doc.data() });
            });

            renderHotelBookings(bookings);
        }, error => {
            console.error("Hotel bookings listener error:", error);

            const box = getElement("hotelBookingRequests");
            if (box) {
                box.innerHTML = `
                    <p>Hotel bookings load nahi hui.</p>
                    <p>Firebase Firestore rules aur permissions check karein.</p>
                `;
            }
        });
}

function renderHotelBookings(bookings) {
    const box = getElement("hotelBookingRequests");
    if (!box) return;

    if (!bookings.length) {
        box.innerHTML = "<p>Abhi koi hotel booking request nahi hai.</p>";
        return;
    }

    box.innerHTML = bookings.map(booking => `
        <div style="padding:12px;margin:12px 0;border:1px solid #ddd;border-radius:10px;">
            <h3>🏨 ${safeText(booking.destination || "Hotel Request")}</h3>
            <p><b>Customer:</b> ${safeText(booking.customerName || "Customer")}</p>
            <p><b>Phone:</b> ${safeText(booking.customerPhone || "")}</p>
            <p><b>Check-in:</b> ${safeText(booking.checkIn || "")}</p>
            <p><b>Check-out:</b> ${safeText(booking.checkOut || "")}</p>
            <p><b>Guests:</b> ${safeText(booking.guests || "")}</p>
            <p><b>Status:</b> ${safeText(booking.status || "pending")}</p>

            ${booking.status === "pending" ? `
                <button onclick="updateHotelBooking('${booking.id}','accepted')">Accept Booking</button>
                <button onclick="updateHotelBooking('${booking.id}','rejected')">Reject</button>
            ` : ""}
        </div>
    `).join("");
}

async function updateHotelBooking(bookingId, status) {
    if (!currentUser || currentUser.role !== "hotel") {
        showNotice("Hotel owner login karein.");
        return;
    }

    try {
        await db.collection("hotelBookings").doc(bookingId).update({
            status,
            hotelOwnerUid: currentUser.uid,
            hotelOwnerPhone: currentUser.phone,
            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        });

        showNotice(status === "accepted" ? "Booking accept ho gayi." : "Booking reject ho gayi.");
    } catch (error) {
        console.error("Hotel booking status error:", error);
        showNotice("Booking status update nahi hua. Firebase rules check karein.");
    }
}

/* ================= CUSTOMER HOTEL SEARCH ================= */

async function hotelSearch() {
    if (!currentUser || currentUser.role !== "customer") {
        showNotice("Hotel request bhejne ke liye Customer login karein.");
        return;
    }

    const page = getElement("hotelPage");
    if (!page) return;

    const inputs = page.querySelectorAll('input');
    const selects = page.querySelectorAll('select');

    const destination = inputs[0]?.value.trim();
    const checkIn = inputs[1]?.value;
    const checkOut = inputs[2]?.value;
    const guests = selects[0]?.value || "1 Guest";

    if (!destination || !checkIn || !checkOut) {
        showNotice("Destination, check-in aur check-out date enter karein.");
        return;
    }

    if (checkOut <= checkIn) {
        showNotice("Check-out date, check-in ke baad ki honi chahiye.");
        return;
    }

    try {
        const doc = await db.collection("hotelBookings").add({
            customerUid: currentUser.uid,
            customerName: currentUser.name,
            customerPhone: currentUser.phone,
            destination,
            checkIn,
            checkOut,
            guests,
            status: "pending",
            hotelOwnerUid: "",
            hotelOwnerPhone: "",
            createdAt: firebase.firestore.FieldValue.serverTimestamp(),
            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        });

        const result = document.createElement("div");
        result.className = "result-box";
        result.style.marginTop = "16px";
        result.innerHTML = `
            <h3>✅ Hotel request submit ho gayi</h3>
            <p><b>Destination:</b> ${safeText(destination)}</p>
            <p><b>Check-in:</b> ${safeText(checkIn)}</p>
            <p><b>Check-out:</b> ${safeText(checkOut)}</p>
            <p><b>Guests:</b> ${safeText(guests)}</p>
            <p><b>Request ID:</b> ${safeText(doc.id)}</p>
            <p>Status: Pending hotel confirmation</p>
            <p>Abhi actual hotel availability ya room confirm nahi hua hai.</p>
        `;

        const oldResult = getElement("hotelSearchResult");
        if (oldResult) oldResult.remove();

        result.id = "hotelSearchResult";
        page.appendChild(result);

    } catch (error) {
        console.error("Hotel search error:", error);
        showNotice("Hotel request save nahi hui. Firestore rules check karein.");
    }
}

/* ================= PACKAGES ================= */

function packageSearch() {
    const page = getElement("packagePage");
    const inputs = page?.querySelectorAll("input");
    const selects = page?.querySelectorAll("select");

    const from = inputs?.[0]?.value.trim();
    const destination = inputs?.[1]?.value.trim();
    const days = selects?.[0]?.value;
    const passengers = inputs?.[2]?.value;

    if (!from || !destination) {
        showNotice("Starting location aur destination enter karein.");
        return;
    }

    const result = document.createElement("div");
    result.className = "result-box";
    result.style.marginTop = "16px";
    result.innerHTML = `
        <h3>🎒 Package Request</h3>
        <p><b>From:</b> ${safeText(from)}</p>
        <p><b>Destination:</b> ${safeText(destination)}</p>
        <p><b>Duration:</b> ${safeText(days)}</p>
        <p><b>Passengers:</b> ${safeText(passengers || "Not specified")}</p>
        <p>Yeh abhi request preview hai. Package prices aur confirmed bookings abhi connect nahi hain.</p>
    `;

    const old = getElement("packageSearchResult");
    if (old) old.remove();

    result.id = "packageSearchResult";
    page?.appendChild(result);
}

/* ================= REELS / SOCIAL ================= */

function likeReel(button) {
    if (!button) return;

    const liked = button.dataset.liked === "true";
    button.dataset.liked = liked ? "false" : "true";

    const span = button.querySelector("span");
    if (span) span.textContent = liked ? "❤️" : "💖";

    const small = button.querySelector("small");
    if (small) small.textContent = liked ? "Like" : "Liked";
}

function commentReel() {
    const comment = prompt("Apna comment likhein:");
    if (comment && comment.trim()) {
        showNotice("Comment likha gaya, lekin online comments database abhi connect nahi hai.");
    }
}

async function shareReel() {
    const shareData = {
        title: "NV TRAVELSS",
        text: "Travel with NV Travelss ✈️",
        url: window.location.href
    };

    try {
        if (navigator.share) {
            await navigator.share(shareData);
        } else if (navigator.clipboard) {
            await navigator.clipboard.writeText(
                shareData.text + " " + shareData.url
            );
            showNotice("Share link copy ho gaya.");
        } else {
            showNotice(shareData.url);
        }
    } catch (error) {
        if (error.name !== "AbortError") {
            console.error("Share error:", error);
        }
    }
}

function saveReel(button) {
    if (!button) return;

    const saved = button.dataset.saved === "true";
    button.dataset.saved = saved ? "false" : "true";

    const span = button.querySelector("span");
    if (span) span.textContent = saved ? "🔖" : "✅";

    const small = button.querySelector("small");
    if (small) small.textContent = saved ? "Save" : "Saved";
}

function createPost() {
    showNotice("Post upload feature ke liye media upload aur database setup abhi baaki hai.");
}

function performSearch() {
    const query = getElement("searchInput")?.value.trim();

    if (!query) {
        showNotice("Search mein kuch likhein.");
        return;
    }

    const result = getElement("searchResult");
    if (result) {
        result.innerHTML = `
            <h3>🔎 Search</h3>
            <p>${safeText(query)}</p>
            <p>Ride aur hotel requests unke dedicated pages se submit karein.</p>
        `;
    }
}

/* ================= LOGOUT ================= */

function stopAllListeners() {
    [
        "customerRideUnsubscribe",
        "driverRequestsUnsubscribe",
        "driverActiveUnsubscribe",
        "hotelBookingsUnsubscribe"
    ].forEach(name => {
        const unsubscribe = ({
            customerRideUnsubscribe,
            driverRequestsUnsubscribe,
            driverActiveUnsubscribe,
            hotelBookingsUnsubscribe
        })[name];

        if (typeof unsubscribe === "function") {
            try { unsubscribe(); } catch (_) {}
        }
    });

    if (customerRideUnsubscribe) customerRideUnsubscribe();
    if (driverRequestsUnsubscribe) driverRequestsUnsubscribe();
    if (driverActiveUnsubscribe) driverActiveUnsubscribe();
    if (hotelBookingsUnsubscribe) hotelBookingsUnsubscribe();

    customerRideUnsubscribe = null;
    driverRequestsUnsubscribe = null;
    driverActiveUnsubscribe = null;
    hotelBookingsUnsubscribe = null;

    stopDriverGps();
    stopCustomerGps();
}

async function logout() {
    stopAllListeners();

    try {
        await auth.signOut();
    } catch (error) {
        console.warn("Firebase sign out error:", error);
    }

    currentUser = null;
    activeRideId = null;
    currentRide = null;
    driverOnline = false;
    confirmationResult = null;

    localStorage.removeItem("nvUserName");
    localStorage.removeItem("nvUserRole");
    localStorage.removeItem("nvUserPhone");
    localStorage.removeItem("nvCurrentRideId");

    showHotelDashboard(false);
    showScreen("loginScreen");

    if (getElement("loginButton")) {
        getElement("loginButton").style.display = "block";
    }

    if (getElement("otpInput")) {
        getElement("otpInput").style.display = "none";
        getElement("otpInput").value = "";
    }

    if (getElement("verifyOtpButton")) {
        getElement("verifyOtpButton").style.display = "none";
    }

    setText("otpMessage", "");

    try {
        if (recaptchaVerifier) await recaptchaVerifier.clear();
    } catch (_) {}

    recaptchaVerifier = null;
}

function driverLogout() {
    logout();
}

/* ================= APP START ================= */

window.addEventListener("load", () => {
    showScreen("loginScreen");

    console.log("NV Travelss app loaded successfully.");

    /*
       Login par OTP hamesha required rahega.
       Purani saved details se automatic login nahi hota.
    */
});
