/* =========================================
NV TRAVELSS - FINAL APP LOGIC
FIREBASE OTP + CUSTOMER → DRIVER RIDES
RIDE CONNECTION FIX
========================================= */

let selectedRole = "customer";

let driverOnline = false;
let driverEarnings = 0;
let driverRides = 0;

let pendingRide = false;
let currentRide = null;

/* Accepted driver ride */
let activeRideId = null;

let confirmationResult = null;
let recaptchaVerifier = null;

/* Customer aur Driver listeners alag */
let customerRideListener = null;
let driverRideListener = null;


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


    if (loginButton) {

        loginButton.disabled =
            true;

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

                    otpInput.style.display =
                        "block";

                }


                if (verifyButton) {

                    verifyButton.style.display =
                        "block";

                }


                if (loginButton) {

                    loginButton.style.display =
                        "none";

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

                    loginButton.disabled =
                        false;

                }


                if (recaptchaVerifier) {

                    try {
                        recaptchaVerifier.clear();
                    } catch (e) {}

                    recaptchaVerifier =
                        null;

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

            loginButton.disabled =
                false;

        }

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
CUSTOMER REQUEST RIDE
FIRESTORE FIXED
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


    message.style.display =
        "block";


    message.innerHTML =
        "🚕 Creating ride request...";


    /*
       Firestore document.
       new Date() use kiya gaya hai.
    */

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

        completedAt:
            null,

        rejectedBy:
            []

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


    /*
       15 second timeout.
       Agar Firebase response nahi deta
       to clear error show hoga.
    */

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
            );

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
CUSTOMER → DRIVER
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


                    /*
                       Accepted ride ko overwrite
                       nahi karna.
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


                    /*
                       Latest ride first.
                    */

                    rides.sort(
                        function (a, b) {

                            const timeA =
                                a.createdAt &&
                                typeof a.createdAt.toMillis ===
                                "function"
                                    ? a.createdAt.toMillis()
                                    : (
                                        a.createdAt instanceof Date
                                            ? a.createdAt.getTime()
                                            : 0
                                    );


                            const timeB =
                                b.createdAt &&
                                typeof b.createdAt.toMillis ===
                                "function"
                                    ? b.createdAt.toMillis()
                                    : (
                                        b.createdAt instanceof Date
                                            ? b.createdAt.getTime()
                                            : 0
                                    );


                            return timeB - timeA;

                        }
                    );


                    currentRide =
                        rides[0];


                    pendingRide =
                        true;


                    console.log(
                        "🚕 NEW RIDE RECEIVED:",
                        currentRide
                    );


                    showDriverRideRequest(
                        currentRide
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
DRIVER RIDE REQUEST UI
========================================= */

function showDriverRideRequest(ride) {

    if (!ride) {
        return;
    }


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


        driverApp.prepend(
            card
        );

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
        "Distance calculate hone ke baad final hoga." +
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


    const rideToAccept = {
        ...currentRide
    };


    const rideId =
        rideToAccept.id;


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


    const rideRef =
        db.collection("rides")
            .doc(rideId);


    db.runTransaction(
        function (transaction) {

            return transaction.get(
                rideRef
            )

            .then(function (doc) {

                if (!doc.exists) {

                    throw new Error(
                        "Ride does not exist."
                    );

                }


                const ride =
                    doc.data();


                if (
                    ride.status !== "searching"
                ) {

                    throw new Error(
                        "This ride has already been accepted or is no longer available."
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
                            firebase.firestore.FieldValue.serverTimestamp()

                    }
                );

            });

        }
    )

    .then(function () {

        activeRideId =
            rideId;


        currentRide = {

            ...rideToAccept,

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


        updateRequestBadge(0);


        showAcceptedDriverRide(
            currentRide
        );


        alert(
            "🚕 Ride accepted successfully!"
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
        "Final fare distance calculate hone ke baad hoga." +
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


    const rideId =
        currentRide.id;


    const driverPhone =
        localStorage.getItem(
            "nvUserPhone"
        ) || "";


    db.collection("rides")
        .doc(rideId)
        .update({

            rejectedBy:
                firebase.firestore.FieldValue.arrayUnion(
                    driverPhone
                ),

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


            alert(
                "Ride reject nahi hui: " +
                error.message
            );

        });

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


            activeRideId =
                null;


            currentRide =
                null;


            pendingRide =
                false;


            updateRequestBadge(0);


            showNoRideRequest();


            if (driverOnline) {

                startDriverRideListener();

            }

        })

        .catch(function (error) {

            console.error(
                "Complete ride error:",
                error
            );


            alert(
                "Ride complete nahi hui: " +
                error.message
            );

        });

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

    /*
       Active ride ke beech offline nahi.
    */

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


    driverOnline =
        false;

    pendingRide =
        false;

    currentRide =
        null;

    activeRideId =
        null;


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


    driverOnline =
        false;

    pendingRide =
        false;

    currentRide =
        null;

    activeRideId =
        null;


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
