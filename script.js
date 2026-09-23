/* =========================================
NV TRAVELSS - FINAL APP LOGIC
FIREBASE OTP + CUSTOMER → DRIVER RIDES
RIDE CONNECTION + MULTIPLE RIDES + OTP
GPS + FARE + RIDE STATUS
========================================= */

let selectedRole = "customer";

let driverOnline = false;
let driverEarnings = 0;
let driverRides = 0;

let pendingRide = false;
let currentRide = null;

/* Accepted driver ride */
let activeRideId = null;

/* Prevent double accept */
let acceptingRide = false;

let confirmationResult = null;
let recaptchaVerifier = null;

/* Customer aur Driver listeners alag */
let customerRideListener = null;
let driverRideListener = null;

/* Multiple pending rides */
let driverPendingRides = {};

/* Ride OTP */
let rideOtp = "";

/* GPS */
let gpsWatchId = null;
let gpsTrackingRideId = null;
let gpsLastPosition = null;
let gpsTotalDistanceKm = 0;
let gpsLastUpdateTime = 0;


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
VEHICLE RATES
========================================= */

function getVehicleRate(vehicle) {

    const rates = {
        bike: 10,
        auto: 15,
        hatchback: 16,
        sedan: 18,
        suv: 22,
        muv: 24,
        premium: 30,
        "6-7-seater": 25,
        "8-12-seater": 30,
        "tempo-traveller": 35,
        "mini-bus": 45,
        bus: 60
    };

    return rates[vehicle] || 0;
}


/* =========================================
VEHICLE NAMES
========================================= */

function getVehicleName(vehicle) {

    const names = {
        bike: "🏍️ Bike",
        auto: "🛺 Auto Rickshaw",
        hatchback: "🚗 Hatchback",
        sedan: "🚘 Sedan",
        suv: "🚙 SUV",
        muv: "🚐 MUV",
        premium: "🚙 Premium / Luxury Car",
        "6-7-seater": "🚐 6–7 Seater",
        "8-12-seater": "🚐 8–12 Seater",
        "tempo-traveller": "🚐 Tempo Traveller",
        "mini-bus": "🚌 Mini Bus",
        bus: "🚌 Bus"
    };

    return names[vehicle] || vehicle || "Vehicle";
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


    if (!nameInput || !phoneInput || !message) {

        console.error("Login elements not found.");

        return;
    }


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
        phone = "+91" + phone;
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


    message.style.display = "block";

    message.textContent =
        "Sending OTP...";


    if (loginButton) {
        loginButton.disabled = true;
    }


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


                if (otpInput) {
                    otpInput.style.display = "block";
                }


                if (verifyButton) {
                    verifyButton.style.display = "block";
                }


                if (loginButton) {
                    loginButton.style.display = "none";
                }


                if (otpInput) {
                    otpInput.focus();
                }

            })

            .catch(function (error) {

                console.error(
                    "OTP error:",
                    error
                );

                message.textContent =
                    "OTP send nahi hua: " +
                    error.message;


                if (loginButton) {
                    loginButton.disabled = false;
                }


                if (recaptchaVerifier) {

                    try {
                        recaptchaVerifier.clear();
                    } catch (e) {}

                    recaptchaVerifier = null;
                }

            });

    }

    catch (error) {

        console.error(
            "Firebase OTP error:",
            error
        );

        message.textContent =
            "Firebase OTP error: " +
            error.message;


        if (loginButton) {
            loginButton.disabled = false;
        }

    }

}


/* =========================================
VERIFY LOGIN OTP
========================================= */

function verifyOTP() {

    const otpInput =
        document.getElementById("otpInput");

    const message =
        document.getElementById("otpMessage");


    if (!otpInput || !message) {
        return;
    }


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

        .then(function () {

            message.textContent =
                "Login successful! Welcome to NV Travelss.";

            openLoggedInApp();

        })

        .catch(function (error) {

            console.error(
                "OTP verification error:",
                error
            );

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


    const loginScreen =
        document.getElementById(
            "loginScreen"
        );


    if (loginScreen) {

        loginScreen.classList.remove(
            "active-screen"
        );

    }


    /* =====================================
       DRIVER
    ===================================== */

    if (role === "driver") {

        stopCustomerRideListener();

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


        driverOnline =
            false;

        activeRideId =
            null;

        pendingRide =
            false;

        currentRide =
            null;

        acceptingRide =
            false;

        driverPendingRides =
            {};


        updateDriverStatusUI();

        showNoRideRequest();

    }


    /* =====================================
       CUSTOMER
    ===================================== */

    else {

        stopDriverRideListener();

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


/* =========================================
GO HOME
========================================= */

function goHome() {

    openPage("homePage");

}


/* =========================================
BOTTOM NAVIGATION
========================================= */

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


    if (
        pageId === "homePage" &&
        navButtons[0]
    ) {

        navButtons[0].classList.add(
            "active"
        );

    }


    if (
        pageId === "reelsPage" &&
        navButtons[1]
    ) {

        navButtons[1].classList.add(
            "active"
        );

    }


    if (
        pageId === "searchPage" &&
        navButtons[3]
    ) {

        navButtons[3].classList.add(
            "active"
        );

    }


    if (
        pageId === "profilePage" &&
        navButtons[4]
    ) {

        navButtons[4].classList.add(
            "active"
        );

    }

}


/* =========================================
GENERATE RIDE OTP
========================================= */

function generateRideOTP() {

    return String(
        Math.floor(
            1000 +
            Math.random() * 9000
        )
    );

}


/* =========================================
CUSTOMER REQUEST RIDE
========================================= */

function requestRide() {

    const pickupInput =
        document.getElementById("pickupLocation");

    const destinationInput =
        document.getElementById("destinationLocation");

    const vehicleInput =
        document.getElementById("vehicleType");

    const message =
        document.getElementById("rideMessage");


    if (
        !pickupInput ||
        !destinationInput ||
        !vehicleInput ||
        !message
    ) {

        console.error(
            "❌ Ride form elements not found."
        );

        return;
    }


    const pickup =
        pickupInput.value.trim();

    const destination =
        destinationInput.value.trim();

    const vehicle =
        vehicleInput.value;


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


    const rate =
        getVehicleRate(vehicle);


    if (rate <= 0) {

        message.style.display =
            "block";

        message.textContent =
            "Please select a valid vehicle.";

        return;
    }


    const db =
        getDatabase();


    if (!db) {

        message.style.display =
            "block";

        message.textContent =
            "❌ Firebase database is not connected.";

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


    /* Ride OTP */
    const customerRideOtp =
        generateRideOTP();


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

        vehicleName:
            getVehicleName(vehicle),

        ratePerKm:
            rate,

        fare:
            rate,

        baseFare:
            rate,

        status:
            "searching",

        createdAt:
            new Date(),

        acceptedBy:
            "",

        driverName:
            "",

        driverPhone:
            "",

        acceptedAt:
            null,

        driverComingAt:
            null,

        startedAt:
            null,

        completedAt:
            null,

        rejectedBy:
            [],

        rideOtp:
            customerRideOtp,

        otpVerified:
            false,

        actualDistanceKm:
            0,

        extraDistanceKm:
            0,

        liveFare:
            rate,

        finalFare:
            0,

        finalDistanceKm:
            0,

        gpsLat:
            null,

        gpsLng:
            null

    };


    console.log(
        "🚕 RIDE DATA:",
        rideData
    );


    let ridePromise;


    try {

        ridePromise =
            db.collection("rides")
                .add(rideData);

    }

    catch (error) {

        console.error(
            "❌ Firestore start error:",
            error
        );


        message.innerHTML =
            "❌ Ride request failed.<br>" +
            escapeRideText(
                error.message ||
                "Firebase error"
            );

        return;
    }


    const timeoutPromise =
        new Promise(function (_, reject) {

            setTimeout(
                function () {

                    reject(
                        new Error(
                            "Firebase response nahi de raha. Firestore connection ya Security Rules check karein."
                        )
                    );

                },
                15000
            );

        });


    Promise.race([
        ridePromise,
        timeoutPromise
    ])

    .then(function (docRef) {

        console.log(
            "🚕 RIDE CREATED SUCCESSFULLY:",
            docRef.id
        );


        localStorage.setItem(
            "nvCurrentRideId",
            docRef.id
        );


        message.style.display =
            "block";


        message.innerHTML =
            "🚕 Ride request created.<br>" +
            "Searching for nearby drivers...";


        startCustomerRideListener();


        alert(
            "🚕 Ride request sent to nearby drivers."
        );

    })

    .catch(function (error) {

        console.error(
            "❌ RIDE CREATION ERROR:",
            error
        );


        message.style.display =
            "block";


        let errorMessage =
            error &&
            error.message
                ? error.message
                : "Unknown Firebase error";


        if (
            error &&
            error.code ===
                "permission-denied"
        ) {

            errorMessage =
                "Firestore permission denied. Firebase Security Rules check karein.";

        }


        if (
            error &&
            error.code ===
                "unavailable"
        ) {

            errorMessage =
                "Firebase temporarily unavailable. Internet connection check karein.";

        }


        message.innerHTML =
            "❌ Ride request failed.<br>" +
            escapeRideText(
                errorMessage
            );

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


    if (customerRideListener) {

        customerRideListener();

        customerRideListener =
            null;

    }


    customerRideListener =
        db.collection("rides")
            .doc(rideId)
            .onSnapshot(

                function (doc) {

                    if (!doc.exists) {
                        return;
                    }


                    const ride =
                        doc.data();


                    currentRide = {

                        id:
                            doc.id,

                        ...ride

                    };


                    updateCustomerRideStatus(
                        currentRide
                    );

                },

                function (error) {

                    console.error(
                        "Customer ride listener error:",
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


    if (
        ride.status === "searching"
    ) {

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
            escapeRideText(
                ride.driverName || "Driver"
            ) +

            "<br>" +

            "Vehicle: " +
            escapeRideText(
                getVehicleName(
                    ride.vehicle
                )
            ) +

            "<br>" +

            "Rate: ₹" +
            (
                ride.ratePerKm ||
                getVehicleRate(
                    ride.vehicle
                )
            ) +
            "/km" +

            "<br>" +

            "Pickup: " +
            escapeRideText(
                ride.pickup
            ) +

            "<br>" +

            "Destination: " +
            escapeRideText(
                ride.destination
            ) +

            "<br><br>" +

            "<b>🚗 Driver is coming to you.</b>";

    }


    else if (
        ride.status === "driverComing"
    ) {

        message.style.display =
            "block";


        message.innerHTML =
            "🚗 Driver is coming to your pickup location.<br>" +

            "Driver: " +
            escapeRideText(
                ride.driverName || "Driver"
            ) +

            "<br>" +

            "Vehicle: " +
            escapeRideText(
                getVehicleName(
                    ride.vehicle
                )
            ) +

            "<br><br>" +

            "<b>🔐 Your Ride OTP</b><br>" +

            "<strong style=\"font-size:28px;\">" +
            escapeRideText(
                ride.rideOtp
            ) +
            "</strong><br>" +

            "Driver ke paas pahunchne par ye OTP bataye.";

    }


    else if (
        ride.status === "started"
    ) {

        message.style.display =
            "block";


        const distance =
            Number(
                ride.actualDistanceKm || 0
            ).toFixed(2);


        const fare =
            Number(
                ride.liveFare ||
                ride.ratePerKm ||
                getVehicleRate(
                    ride.vehicle
                )
            ).toFixed(2);


        message.innerHTML =
            "🚕 <b>Ride Started</b><br>" +

            "Driver: " +
            escapeRideText(
                ride.driverName || "Driver"
            ) +

            "<br>" +

            "📍 Live Distance: " +
            distance +
            " km" +

            "<br>" +

            "💰 Live Fare: ₹" +
            fare +

            "<br><br>" +

            "GPS tracking active.";

        startCustomerGpsTracking(
            ride
        );

    }


    else if (
        ride.status === "completed"
    ) {

        stopCustomerGpsTracking();


        message.style.display =
            "block";


        const distance =
            Number(
                ride.finalDistanceKm ||
                ride.actualDistanceKm ||
                0
            ).toFixed(2);


        const fare =
            Number(
                ride.finalFare ||
                ride.liveFare ||
                ride.fare ||
                0
            ).toFixed(2);


        message.innerHTML =
            "✅ <b>Ride Completed</b><br><br>" +

            "📍 Total Distance: " +
            distance +
            " km" +

            "<br>" +

            "💰 <b>Final Fare: ₹" +
            fare +
            "</b><br><br>" +

            "Thank you for travelling with NV Travelss.";

    }


    else if (
        ride.status === "rejected"
    ) {

        /*
           Individual driver reject karne par
           customer ride rejected nahi hogi.
           Ye status sirf compatibility ke liye rakha hai.
        */

        message.style.display =
            "block";


        message.innerHTML =
            "❌ Ride request was rejected.<br>" +
            "You can request another ride.";

    }

}


/* =========================================
DRIVER RIDE LISTENER
MULTIPLE PENDING RIDES
========================================= */

function startDriverRideListener() {

    if (!driverOnline) {

        console.log(
            "Driver is offline. Ride listener not started."
        );

        return;
    }


    const db =
        getDatabase();


    if (!db) {

        console.error(
            "Firebase database not connected."
        );

        return;
    }


    if (driverRideListener) {

        driverRideListener();

        driverRideListener =
            null;

    }


    const driverPhone =
        localStorage.getItem(
            "nvUserPhone"
        ) || "";


    console.log(
        "🚕 DRIVER LISTENER STARTED"
    );


    console.log(
        "🚕 Driver phone:",
        driverPhone
    );


    driverRideListener =
        db.collection("rides")
            .where(
                "status",
                "==",
                "searching"
            )
            .onSnapshot(

                function (snapshot) {

                    console.log(
                        "🚕 Searching rides found:",
                        snapshot.size
                    );


                    let rides = [];


                    snapshot.forEach(
                        function (doc) {

                            const data =
                                doc.data();


                            const rejectedBy =
                                Array.isArray(
                                    data.rejectedBy
                                )
                                    ? data.rejectedBy
                                    : [];


                            if (
                                driverPhone &&
                                rejectedBy.indexOf(
                                    driverPhone
                                ) !== -1
                            ) {

                                return;

                            }


                            rides.push({

                                id:
                                    doc.id,

                                ...data

                            });

                        }
                    );


                    rides.sort(
                        function (a, b) {

                            const timeA =
                                getRideTime(
                                    a.createdAt
                                );


                            const timeB =
                                getRideTime(
                                    b.createdAt
                                );


                            return timeB - timeA;

                        }
                    );


                    driverPendingRides =
                        {};


                    rides.forEach(
                        function (ride) {

                            driverPendingRides[
                                ride.id
                            ] = ride;

                        }
                    );


                    /*
                       Active ride hone par
                       pending rides count dikhega,
                       lekin active ride ke saath
                       doosri ride accept nahi hogi.
                    */

                    if (activeRideId) {

                        updateRequestBadge(
                            rides.length
                        );

                        return;

                    }


                    if (rides.length === 0) {

                        pendingRide =
                            false;

                        currentRide =
                            null;

                        showNoRideRequest();

                        updateRequestBadge(0);

                        return;

                    }


                    pendingRide =
                        true;


                    /*
                       First ride ko currentRide
                       rakha ja raha hai compatibility
                       ke liye.
                    */

                    currentRide =
                        rides[0];


                    console.log(
                        "🚕 PENDING RIDES:",
                        rides
                    );


                    showDriverRideRequests(
                        rides
                    );


                    updateRequestBadge(
                        rides.length
                    );

                },

                function (error) {

                    console.error(
                        "❌ DRIVER RIDE LISTENER ERROR:",
                        error
                    );


                    showNoRideRequest();

                }
            );

}


/* =========================================
RIDE TIME HELPER
========================================= */

function getRideTime(value) {

    if (!value) {
        return 0;
    }


    if (
        typeof value.toMillis ===
        "function"
    ) {

        return value.toMillis();

    }


    if (
        value instanceof Date
    ) {

        return value.getTime();

    }


    if (
        typeof value === "string"
    ) {

        const time =
            new Date(value).getTime();

        return isNaN(time)
            ? 0
            : time;

    }


    return 0;

}


/* =========================================
DRIVER MULTIPLE RIDE REQUEST UI
========================================= */

function showDriverRideRequests(rides) {

    if (!rides || rides.length === 0) {

        showNoRideRequest();

        return;
    }


    const driverApp =
        document.getElementById(
            "driverApp"
        );


    if (!driverApp) {
        return;
    }


    let container =
        document.getElementById(
            "liveRideRequests"
        );


    /*
       Agar HTML me container abhi nahi hai,
       to automatically create karenge.
    */

    if (!container) {

        container =
            document.createElement(
                "div"
            );

        container.id =
            "liveRideRequests";

        driverApp.prepend(
            container
        );

    }


    container.innerHTML = "";


    rides.forEach(
        function (ride) {

            const card =
                document.createElement(
                    "div"
                );


            card.className =
                "live-ride-request-card";


            card.id =
                "liveRideRequest-" +
                ride.id;


            card.style.padding =
                "18px";

            card.style.margin =
                "15px 0";

            card.style.borderRadius =
                "16px";

            card.style.background =
                "#ffffff";

            card.style.boxShadow =
                "0 4px 15px rgba(0,0,0,0.12)";


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
                    getVehicleName(
                        ride.vehicle
                    )
                ) +
                "</p>" +

                "<p><b>Rate:</b> ₹" +
                (
                    ride.ratePerKm ||
                    getVehicleRate(
                        ride.vehicle
                    )
                ) +
                "/km</p>" +

                "<p><b>Fare:</b> " +
                "Distance ke according calculate hoga." +
                "</p>" +

                "<button onclick=\"acceptSpecificRide('" +
                escapeRideText(
                    ride.id
                ) +
                "')\" " +
                "style=\"margin-right:8px;padding:12px 18px;\">" +
                "ACCEPT RIDE" +
                "</button>" +

                "<button onclick=\"rejectSpecificRide('" +
                escapeRideText(
                    ride.id
                ) +
                "')\" " +
                "style=\"padding:12px 18px;\">" +
                "REJECT" +
                "</button>";


            container.appendChild(
                card
            );

        }
    );

}


/* =========================================
OLD SINGLE RIDE UI COMPATIBILITY
========================================= */

function showDriverRideRequest(ride) {

    if (!ride) {
        return;
    }


    showDriverRideRequests([
        ride
    ]);

}


/* =========================================
NO RIDE REQUEST
========================================= */

function showNoRideRequest() {

    let container =
        document.getElementById(
            "liveRideRequests"
        );


    if (!container) {

        const driverApp =
            document.getElementById(
                "driverApp"
            );


        if (!driverApp) {
            return;
        }


        container =
            document.createElement(
                "div"
            );

        container.id =
            "liveRideRequests";

        driverApp.prepend(
            container
        );

    }


    container.innerHTML =
        "<div id=\"liveRideRequest\" " +
        "style=\"padding:18px;margin:15px 0;\">" +
        "<p>🚕 No new ride requests.</p>" +
        "</div>";

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
ACCEPT SPECIFIC RIDE
========================================= */

function acceptSpecificRide(rideId) {

    if (acceptingRide) {
        return;
    }


    if (!driverOnline) {

        alert(
            "Please GO ONLINE first."
        );

        return;
    }


    if (activeRideId) {

        alert(
            "Pehle active ride complete karein."
        );

        return;
    }


    if (!rideId) {

        alert(
            "No ride selected."
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


    acceptingRide =
        true;


    const driverName =
        localStorage.getItem(
            "nvUserName"
        ) || "Driver";


    const driverPhone =
        localStorage.getItem(
            "nvUserPhone"
        ) || "";


    const rideRef =
        db.collection("rides")
            .doc(rideId);


    const card =
        document.getElementById(
            "liveRideRequest-" +
            rideId
        );


    if (card) {

        const buttons =
            card.querySelectorAll(
                "button"
            );


        buttons.forEach(
            function (button) {

                button.disabled =
                    true;

            }
        );

    }


    db.runTransaction(
        function (transaction) {

            return transaction
                .get(rideRef)

                .then(
                    function (doc) {

                        if (!doc.exists) {

                            throw new Error(
                                "Ride does not exist."
                            );

                        }


                        const ride =
                            doc.data();


                        if (
                            ride.status !==
                            "searching"
                        ) {

                            throw new Error(
                                "Ride is no longer available."
                            );

                        }


                        const rejectedBy =
                            Array.isArray(
                                ride.rejectedBy
                            )
                                ? ride.rejectedBy
                                : [];


                        if (
                            driverPhone &&
                            rejectedBy.indexOf(
                                driverPhone
                            ) !== -1
                        ) {

                            throw new Error(
                                "You already rejected this ride."
                            );

                        }


                        transaction.update(
                            rideRef,
                            {

                                status:
                                    "accepted",

                                driverName:
                                    driverName,

                                driverPhone:
                                    driverPhone,

                                acceptedBy:
                                    driverPhone,

                                acceptedAt:
                                    firebase.firestore
                                        .FieldValue
                                        .serverTimestamp()

                            }
                        );


                        return {
                            ...ride,
                            id:
                                doc.id
                        };

                    }
                );

        }
    )

    .then(
        function (ride) {

            activeRideId =
                rideId;


            currentRide = {

                ...ride,

                id:
                    rideId,

                status:
                    "accepted",

                driverName:
                    driverName,

                driverPhone:
                    driverPhone,

                acceptedBy:
                    driverPhone

            };


            driverRides++;


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


            showAcceptedDriverRide(
                currentRide
            );


            updateRequestBadge(0);


            alert(
                "🚕 Ride accepted successfully!"
            );

        }
    )

    .catch(
        function (error) {

            console.error(
                "❌ ACCEPT RIDE ERROR:",
                error
            );


            if (card) {

                const buttons =
                    card.querySelectorAll(
                        "button"
                    );


                buttons.forEach(
                    function (button) {

                        button.disabled =
                            false;

                    }
                );

            }


            alert(
                "Ride accept nahi hui: " +
                error.message
            );

        }
    )

    .finally(
        function () {

            acceptingRide =
                false;

        }
    );

}


/* =========================================
ACCEPT LIVE RIDE - COMPATIBILITY
========================================= */

function acceptLiveRide() {

    if (
        currentRide &&
        currentRide.id
    ) {

        acceptSpecificRide(
            currentRide.id
        );

        return;
    }


    alert(
        "No ride request available."
    );

}


/* =========================================
DRIVER ACCEPTED RIDE SCREEN
========================================= */

function showAcceptedDriverRide(ride) {

    const driverApp =
        document.getElementById(
            "driverApp"
        );


    if (!driverApp) {
        return;
    }


    let card =
        document.getElementById(
            "activeDriverRide"
        );


    if (!card) {

        card =
            document.createElement(
                "div"
            );

        card.id =
            "activeDriverRide";

        driverApp.prepend(
            card
        );

    }


    card.style.padding =
        "18px";

    card.style.margin =
        "15px 0";

    card.style.borderRadius =
        "16px";

    card.style.background =
        "#ffffff";

    card.style.boxShadow =
        "0 4px 15px rgba(0,0,0,0.12)";


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

        "<p><b>Vehicle:</b> " +
        escapeRideText(
            getVehicleName(
                ride.vehicle
            )
        ) +
        "</p>" +

        "<p><b>Rate:</b> ₹" +
        (
            ride.ratePerKm ||
            getVehicleRate(
                ride.vehicle
            )
        ) +
        "/km</p>" +

        "<p><b>Status:</b> " +
        "Driver Coming</p>" +

        "<button onclick=\"driverComingToCustomer()\">" +
        "🚗 DRIVER COMING / REACHED CUSTOMER" +
        "</button>";

}


/* =========================================
DRIVER COMING TO CUSTOMER
========================================= */

function driverComingToCustomer() {

    const rideId =
        activeRideId;


    if (!rideId) {

        alert(
            "No active ride."
        );

        return;
    }


    const db =
        getDatabase();


    if (!db) {
        return;
    }


    db.collection("rides")
        .doc(rideId)
        .update({

            status:
                "driverComing",

            driverComingAt:
                firebase.firestore.FieldValue
                    .serverTimestamp()

        })

        .then(
            function () {

                currentRide = {

                    ...currentRide,

                    status:
                        "driverComing"

                };


                showOtpVerificationForDriver(
                    currentRide
                );

            }
        )

        .catch(
            function (error) {

                console.error(
                    "Driver coming error:",
                    error
                );


                alert(
                    "Status update nahi hua: " +
                    error.message
                );

            }
        );

}


/* =========================================
DRIVER OTP VERIFICATION UI
========================================= */

function showOtpVerificationForDriver(ride) {

    const driverApp =
        document.getElementById(
            "driverApp"
        );


    if (!driverApp) {
        return;
    }


    let card =
        document.getElementById(
            "activeDriverRide"
        );


    if (!card) {

        card =
            document.createElement(
                "div"
            );

        card.id =
            "activeDriverRide";

        driverApp.prepend(
            card
        );

    }


    card.style.padding =
        "18px";

    card.style.margin =
        "15px 0";

    card.style.borderRadius =
        "16px";

    card.style.background =
        "#ffffff";


    card.innerHTML =

        "<h3>🔐 Start Ride Verification</h3>" +

        "<p><b>Customer:</b> " +
        escapeRideText(
            ride.customerName
        ) +
        "</p>" +

        "<p>Customer ke paas jo <b>4 digit Ride OTP</b> hai, " +
        "wo customer se lekar neeche enter karein.</p>" +

        "<input id=\"driverRideOtpInput\" " +
        "type=\"tel\" " +
        "maxlength=\"4\" " +
        "inputmode=\"numeric\" " +
        "placeholder=\"Enter 4 digit OTP\" " +
        "style=\"padding:12px;width:100%;box-sizing:border-box;margin:10px 0;\">" +

        "<button onclick=\"verifyRideOtpAndStart()\">" +
        "🔐 VERIFY OTP & START RIDE" +
        "</button>";

}


/* =========================================
VERIFY RIDE OTP + START
========================================= */

function verifyRideOtpAndStart() {

    const rideId =
        activeRideId;


    if (!rideId) {

        alert(
            "No active ride."
        );

        return;
    }


    const otpInput =
        document.getElementById(
            "driverRideOtpInput"
        );


    if (!otpInput) {
        return;
    }


    const enteredOtp =
        otpInput.value.trim();


    if (
        !/^\d{4}$/.test(
            enteredOtp
        )
    ) {

        alert(
            "Customer ka 4 digit Ride OTP enter karein."
        );

        otpInput.focus();

        return;
    }


    const db =
        getDatabase();


    if (!db) {
        return;
    }


    const rideRef =
        db.collection("rides")
            .doc(rideId);


    rideRef.get()

        .then(
            function (doc) {

                if (!doc.exists) {

                    throw new Error(
                        "Ride does not exist."
                    );

                }


                const ride =
                    doc.data();


                if (
                    String(
                        ride.rideOtp || ""
                    ) !== enteredOtp
                ) {

                    throw new Error(
                        "OTP incorrect hai. Ride start nahi hui."
                    );

                }


                if (
                    ride.status !==
                    "driverComing"
                ) {

                    throw new Error(
                        "Ride is not ready to start."
                    );

                }


                return rideRef.update({

                    status:
                        "started",

                    otpVerified:
                        true,

                    startedAt:
                        firebase.firestore.FieldValue
                            .serverTimestamp(),

                    actualDistanceKm:
                        Number(
                            ride.actualDistanceKm ||
                            0
                        ),

                    liveFare:
                        Number(
                            ride.liveFare ||
                            ride.ratePerKm ||
                            getVehicleRate(
                                ride.vehicle
                            )
                        )

                });

            }
        )

        .then(
            function () {

                currentRide = {

                    ...currentRide,

                    status:
                        "started",

                    otpVerified:
                        true

                };


                alert(
                    "✅ OTP verified. Ride Started!"
                );


                showStartedDriverRide(
                    currentRide
                );

            }
        )

        .catch(
            function (error) {

                console.error(
                    "OTP verification error:",
                    error
                );


                alert(
                    error.message
                );

            }
        );

}


/* =========================================
DRIVER STARTED RIDE SCREEN
========================================= */

function showStartedDriverRide(ride) {

    const card =
        document.getElementById(
            "activeDriverRide"
        );


    if (!card) {
        return;
    }


    card.innerHTML =

        "<h3>🚕 Ride Started</h3>" +

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
            getVehicleName(
                ride.vehicle
            )
        ) +
        "</p>" +

        "<p>📍 Distance: GPS se calculate hogi.</p>" +

        "<p>💰 Final fare ride complete hone par calculate hoga.</p>" +

        "<button onclick=\"completeCurrentRide()\">" +
        "✅ COMPLETE RIDE" +
        "</button>";

}


/* =========================================
REJECT SPECIFIC RIDE
========================================= */

function rejectSpecificRide(rideId) {

    if (!rideId) {

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


    const driverPhone =
        localStorage.getItem(
            "nvUserPhone"
        ) || "";


    db.collection("rides")
        .doc(rideId)
        .update({

            rejectedBy:
                firebase.firestore.FieldValue
                    .arrayUnion(
                        driverPhone
                    ),

            rejectedAt:
                firebase.firestore.FieldValue
                    .serverTimestamp()

        })

        .then(
            function () {

                delete driverPendingRides[
                    rideId
                ];


                if (
                    currentRide &&
                    currentRide.id ===
                    rideId
                ) {

                    currentRide =
                        null;

                }


                alert(
                    "Ride rejected."
                );


                if (driverOnline) {

                    startDriverRideListener();

                }

            }
        )

        .catch(
            function (error) {

                console.error(
                    "Reject ride error:",
                    error
                );


                alert(
                    "Ride reject nahi hui: " +
                    error.message
                );

            }
        );

}


/* =========================================
REJECT LIVE RIDE - COMPATIBILITY
========================================= */

function rejectLiveRide() {

    if (
        currentRide &&
        currentRide.id
    ) {

        rejectSpecificRide(
            currentRide.id
        );

        return;
    }


    alert(
        "No ride request available."
    );

}


/* =========================================
GPS DISTANCE
========================================= */

function calculateDistanceKm(
    lat1,
    lon1,
    lat2,
    lon2
) {

    const earthRadiusKm =
        6371;


    const dLat =
        (
            lat2 -
            lat1
        ) *
        Math.PI /
        180;


    const dLon =
        (
            lon2 -
            lon1
        ) *
        Math.PI /
        180;


    const a =
        Math.sin(
            dLat / 2
        ) *
        Math.sin(
            dLat / 2
        ) +

        Math.cos(
            lat1 *
            Math.PI /
            180
        ) *

        Math.cos(
            lat2 *
            Math.PI /
            180
        ) *

        Math.sin(
            dLon / 2
        ) *
        Math.sin(
            dLon / 2
        );


    const c =
        2 *
        Math.atan2(
            Math.sqrt(a),
            Math.sqrt(
                1 - a
            )
        );


    return earthRadiusKm * c;

}


/* =========================================
START CUSTOMER GPS
========================================= */

function startCustomerGpsTracking(ride) {

    if (!ride || !ride.id) {
        return;
    }


    if (
        !navigator.geolocation
    ) {

        const message =
            document.getElementById(
                "rideMessage"
            );


        if (message) {

            message.innerHTML +=
                "<br>⚠️ GPS is not available on this device.";

        }

        return;
    }


    if (
        gpsTrackingRideId ===
        ride.id &&
        gpsWatchId !== null
    ) {

        return;

    }


    stopCustomerGpsTracking();


    gpsTrackingRideId =
        ride.id;


    gpsTotalDistanceKm =
        Number(
            ride.actualDistanceKm ||
            0
        );


    gpsLastPosition =
        null;


    gpsWatchId =
        navigator.geolocation.watchPosition(

            function (position) {

                handleCustomerGpsPosition(
                    ride.id,
                    position
                );

            },

            function (error) {

                console.error(
                    "GPS error:",
                    error
                );


                const message =
                    document.getElementById(
                        "rideMessage"
                    );


                if (message) {

                    message.innerHTML +=
                        "<br>⚠️ GPS permission/location required for distance tracking.";

                }

            },

            {

                enableHighAccuracy:
                    true,

                maximumAge:
                    3000,

                timeout:
                    10000

            }

        );

}


/* =========================================
HANDLE GPS POSITION
========================================= */

function handleCustomerGpsPosition(
    rideId,
    position
) {

    if (
        gpsTrackingRideId !==
        rideId
    ) {

        return;
    }


    const lat =
        position.coords.latitude;


    const lng =
        position.coords.longitude;


    const accuracy =
        Number(
            position.coords.accuracy ||
            999
        );


    /*
       Very inaccurate GPS point ko
       distance calculation me use nahi karenge.
    */

    if (
        accuracy > 100
    ) {

        console.log(
            "GPS accuracy too low:",
            accuracy
        );

        return;
    }


    if (gpsLastPosition) {

        const distance =
            calculateDistanceKm(

                gpsLastPosition.lat,
                gpsLastPosition.lng,

                lat,
                lng

            );


        /*
           GPS jump filter.
           Ek single update me 1 km se zyada
           jump ko ignore karenge.
        */

        if (
            distance >= 0 &&
            distance <= 1
        ) {

            gpsTotalDistanceKm +=
                distance;

        }

    }


    gpsLastPosition = {

        lat:
            lat,

        lng:
            lng

    };


    const now =
        Date.now();


    /*
       Firestore ko har ~5 seconds me update.
    */

    if (
        now -
        gpsLastUpdateTime <
        5000
    ) {

        return;
    }


    gpsLastUpdateTime =
        now;


    updateRideGpsInFirestore(
        rideId,
        lat,
        lng,
        gpsTotalDistanceKm
    );

}


/* =========================================
UPDATE GPS + LIVE FARE
========================================= */

function updateRideGpsInFirestore(
    rideId,
    lat,
    lng,
    distanceKm
) {

    const db =
        getDatabase();


    if (!db) {
        return;
    }


    db.collection("rides")
        .doc(rideId)
        .get()

        .then(
            function (doc) {

                if (!doc.exists) {
                    return;
                }


                const ride =
                    doc.data();


                if (
                    ride.status !==
                    "started"
                ) {

                    return;
                }


                const rate =
                    Number(
                        ride.ratePerKm ||
                        getVehicleRate(
                            ride.vehicle
                        ) ||
                        0
                    );


                /*
                   Abhi pickup/destination text hai,
                   isliye exact planned route distance
                   available nahi hai.

                   GPS actual travelled distance
                   ke basis par live fare calculate
                   hoga.
                */

                const minimumFare =
                    rate;


                const calculatedFare =
                    Math.max(
                        minimumFare,
                        distanceKm *
                        rate
                    );


                db.collection("rides")
                    .doc(rideId)
                    .update({

                        actualDistanceKm:
                            Number(
                                distanceKm.toFixed(
                                    3
                                )
                            ),

                        liveFare:
                            Number(
                                calculatedFare.toFixed(
                                    2
                                )
                            ),

                        gpsLat:
                            lat,

                        gpsLng:
                            lng

                    });

            }
        )

        .catch(
            function (error) {

                console.error(
                    "GPS Firestore update error:",
                    error
                );

            }
        );

}


/* =========================================
STOP CUSTOMER GPS
========================================= */

function stopCustomerGpsTracking() {

    if (
        gpsWatchId !== null &&
        navigator.geolocation
    ) {

        navigator.geolocation.clearWatch(
            gpsWatchId
        );

    }


    gpsWatchId =
        null;

    gpsTrackingRideId =
        null;

    gpsLastPosition =
        null;

    gpsTotalDistanceKm =
        0;

    gpsLastUpdateTime =
        0;

}


/* =========================================
COMPLETE RIDE
========================================= */

function completeCurrentRide() {

    const rideId =
        activeRideId ||
        (
            currentRide &&
            currentRide.id
        );


    if (!rideId) {

        alert(
            "No active ride."
        );

        return;
    }


    const db =
        getDatabase();


    if (!db) {
        return;
    }


    db.collection("rides")
        .doc(rideId)
        .get()

        .then(
            function (doc) {

                if (!doc.exists) {

                    throw new Error(
                        "Ride does not exist."
                    );

                }


                const ride =
                    doc.data();


                if (
                    ride.status !==
                    "started"
                ) {

                    throw new Error(
                        "Ride OTP verify karke ride start karein."
                    );

                }


                const rate =
                    Number(
                        ride.ratePerKm ||
                        getVehicleRate(
                            ride.vehicle
                        ) ||
                        0
                    );


                const finalDistance =
                    Number(
                        ride.actualDistanceKm ||
                        gpsTotalDistanceKm ||
                        0
                    );


                const finalFare =
                    Math.max(
                        rate,
                        finalDistance *
                        rate
                    );


                const extraDistance =
                    Math.max(
                        0,
                        finalDistance -
                        1
                    );


                return db.collection("rides")
                    .doc(rideId)
                    .update({

                        status:
                            "completed",

                        completedAt:
                            firebase.firestore
                                .FieldValue
                                .serverTimestamp(),

                        finalDistanceKm:
                            Number(
                                finalDistance.toFixed(
                                    3
                                )
                            ),

                        finalFare:
                            Number(
                                finalFare.toFixed(
                                    2
                                )
                            ),

                        actualDistanceKm:
                            Number(
                                finalDistance.toFixed(
                                    3
                                )
                            ),

                        extraDistanceKm:
                            Number(
                                extraDistance.toFixed(
                                    3
                                )
                            )

                    })

                    .then(
                        function () {

                            return {
                                ...ride,

                                id:
                                    rideId,

                                status:
                                    "completed",

                                finalDistanceKm:
                                    finalDistance,

                                finalFare:
                                    finalFare,

                                extraDistanceKm:
                                    extraDistance

                            };

                        }
                    );

            }
        )

        .then(
            function (completedRide) {

                stopCustomerGpsTracking();


                currentRide =
                    completedRide;


                showCompletedDriverRide(
                    completedRide
                );


                alert(
                    "✅ Ride completed successfully!"
                );

            }
        )

        .catch(
            function (error) {

                console.error(
                    "Complete ride error:",
                    error
                );


                alert(
                    "Ride complete nahi hui: " +
                    error.message
                );

            }
        );

}


/* =========================================
COMPLETED DRIVER RIDE SUMMARY
========================================= */

function showCompletedDriverRide(ride) {

    const card =
        document.getElementById(
            "activeDriverRide"
        );


    if (!card) {
        return;
    }


    const distance =
        Number(
            ride.finalDistanceKm ||
            ride.actualDistanceKm ||
            0
        ).toFixed(2);


    const fare =
        Number(
            ride.finalFare ||
            0
        ).toFixed(2);


    card.innerHTML =

        "<h3>✅ Ride Completed</h3>" +

        "<p><b>Customer:</b> " +
        escapeRideText(
            ride.customerName
        ) +
        "</p>" +

        "<p><b>Total Distance:</b> " +
        distance +
        " km</p>" +

        "<p><b>Final Fare:</b> ₹" +
        fare +
        "</p>" +

        "<button onclick=\"closeCompletedRide()\">" +
        "CLOSE RIDE" +
        "</button>";

}


/* =========================================
CLOSE COMPLETED RIDE
========================================= */

function closeCompletedRide() {

    activeRideId =
        null;


    currentRide =
        null;


    pendingRide =
        false;


    updateRequestBadge(0);


    const card =
        document.getElementById(
            "activeDriverRide"
        );


    if (card) {

        card.remove();

    }


    if (driverOnline) {

        startDriverRideListener();

    }


    alert(
        "Ride closed. New rides can be accepted."
    );

}


/* =========================================
OLD ACCEPT FUNCTION
========================================= */

function acceptRide() {

    acceptLiveRide();

}


/* =========================================
OLD REJECT FUNCTION
========================================= */

function rejectRide() {

    rejectLiveRide();

}


/* =========================================
DRIVER STATUS UI
========================================= */

function updateDriverStatusUI() {

    const button =
        document.getElementById(
            "onlineButton"
        );


    const statusText =
        document.getElementById(
            "driverStatusText"
        );


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
DRIVER ONLINE / OFFLINE
========================================= */

function toggleDriverStatus() {

    if (
        driverOnline &&
        activeRideId
    ) {

        alert(
            "Pehle active ride complete karein, phir offline ja sakte hain."
        );

        return;
    }


    driverOnline =
        !driverOnline;


    updateDriverStatusUI();


    if (driverOnline) {

        console.log(
            "🚕 Driver is now ONLINE."
        );


        startDriverRideListener();

    }

    else {

        console.log(
            "🚕 Driver is now OFFLINE."
        );


        stopDriverRideListener();


        if (!activeRideId) {

            pendingRide =
                false;

            currentRide =
                null;

            updateRequestBadge(0);

            showNoRideRequest();

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


    if (!input || !result) {
        return;
    }


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

    if (!button) {
        return;
    }


    const icon =
        button.querySelector(
            "span"
        );


    if (!icon) {
        return;
    }


    if (
        icon.textContent === "❤️"
    ) {

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


/* =========================================
COMMENT REEL
========================================= */

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


/* =========================================
SHARE REEL
========================================= */

function shareReel() {

    const shareText =
        "Check out this travel reel from NV Travelss!";


    if (
        navigator.share
    ) {

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


/* =========================================
SAVE REEL
========================================= */

function saveReel(button) {

    if (!button) {
        return;
    }


    const icon =
        button.querySelector(
            "span"
        );


    if (!icon) {
        return;
    }


    if (
        icon.textContent === "🔖"
    ) {

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

    stopCustomerRideListener();
    stopDriverRideListener();
    stopCustomerGpsTracking();


    driverOnline =
        false;

    pendingRide =
        false;

    currentRide =
        null;

    activeRideId =
        null;

    acceptingRide =
        false;


    const customerApp =
        document.getElementById(
            "customerApp"
        );


    const driverApp =
        document.getElementById(
            "driverApp"
        );


    const loginScreen =
        document.getElementById(
            "loginScreen"
        );


    if (customerApp) {

        customerApp.classList.remove(
            "active-app"
        );

    }


    if (driverApp) {

        driverApp.classList.remove(
            "active-app"
        );

    }


    if (loginScreen) {

        loginScreen.classList.add(
            "active-screen"
        );

    }

}


/* =========================================
DRIVER LOGOUT
========================================= */

function driverLogout() {

    stopDriverRideListener();
    stopCustomerRideListener();
    stopCustomerGpsTracking();


    driverOnline =
        false;

    pendingRide =
        false;

    currentRide =
        null;

    activeRideId =
        null;

    acceptingRide =
        false;


    const driverApp =
        document.getElementById(
            "driverApp"
        );


    const loginScreen =
        document.getElementById(
            "loginScreen"
        );


    if (driverApp) {

        driverApp.classList.remove(
            "active-app"
        );

    }


    if (loginScreen) {

        loginScreen.classList.add(
            "active-screen"
        );

    }

}


/* =========================================
STOP CUSTOMER RIDE LISTENER
========================================= */

function stopCustomerRideListener() {

    if (customerRideListener) {

        customerRideListener();

        customerRideListener =
            null;

    }

}


/* =========================================
STOP DRIVER RIDE LISTENER
========================================= */

function stopDriverRideListener() {

    if (driverRideListener) {

        driverRideListener();

        driverRideListener =
            null;

    }

}


/* =========================================
STOP ALL RIDE LISTENERS
========================================= */

function stopRideListener() {

    stopCustomerRideListener();

    stopDriverRideListener();

    stopCustomerGpsTracking();

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

        console.log(
            "🚕 NV Travelss app loaded successfully."
        );

    }
);
