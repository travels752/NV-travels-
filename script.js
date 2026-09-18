let driverOnline = true;
let driverRides = 0;
let driverEarnings = 0;

function hideAllScreens() {
    document.querySelectorAll(".screen").forEach(function(screen) {
        screen.classList.remove("active");
    });
}

function openScreen(screenId) {
    hideAllScreens();

    const screen = document.getElementById(screenId);

    if (screen) {
        screen.classList.add("active");
    }

    updateNavigation(screenId);
}

function updateNavigation(screenId) {
    document.querySelectorAll(".nav-item").forEach(function(item) {
        item.classList.remove("active-nav");
    });
}

function loginAs(role) {

    hideAllScreens();

    const header = document.getElementById("appHeader");
    const bottomNav = document.getElementById("bottomNav");

    if (role === "customer") {

        document.getElementById("home").classList.add("active");

        if (header) {
            header.style.display = "flex";
        }

        if (bottomNav) {
            bottomNav.style.display = "flex";
        }

    } else if (role === "driver") {

        document.getElementById("driver").classList.add("active");

        if (header) {
            header.style.display = "flex";
        }

        if (bottomNav) {
            bottomNav.style.display = "none";
        }

    } else if (role === "hotel") {

        document.getElementById("hotelOwner").classList.add("active");

        if (header) {
            header.style.display = "flex";
        }

        if (bottomNav) {
            bottomNav.style.display = "none";
        }
    }
}

function logout() {

    hideAllScreens();

    const header = document.getElementById("appHeader");
    const bottomNav = document.getElementById("bottomNav");

    if (header) {
        header.style.display = "none";
    }

    if (bottomNav) {
        bottomNav.style.display = "none";
    }

    document.getElementById("login").classList.add("active");
}

function toggleDriverStatus() {

    driverOnline = !driverOnline;

    const status = document.getElementById("driverStatus");

    if (!status) return;

    if (driverOnline) {
        status.innerText = "🟢 Online";
    } else {
        status.innerText = "🔴 Offline";
    }
}

function acceptRide() {

    if (!driverOnline) {
        alert("Driver is Offline. Please go Online first.");
        return;
    }

    driverRides++;
    driverEarnings += 500;

    const rides = document.getElementById("driverRides");
    const earnings = document.getElementById("driverEarnings");

    if (rides) {
        rides.innerText = driverRides;
    }

    if (earnings) {
        earnings.innerText = "₹" + driverEarnings;
    }

    alert("Ride accepted successfully! 🚕");
}

function rejectRide() {

    alert("Ride rejected.");

}
