// NV TRAVELSS APP

function openScreen(screenId) {

    // सभी screens hide
    const screens = document.querySelectorAll(".screen");

    screens.forEach(screen => {
        screen.classList.remove("active");
    });

    // selected screen show
    const selectedScreen = document.getElementById(screenId);

    if (selectedScreen) {
        selectedScreen.classList.add("active");
    }

    // bottom navigation active state
    const navItems = document.querySelectorAll(".nav-item");

    navItems.forEach(item => {
        item.classList.remove("active-nav");
    });

    // current navigation button active
    navItems.forEach(item => {

        const text = item.innerText.toLowerCase();

        if (
            (screenId === "home" && text.includes("home")) ||
            (screenId === "social" && text.includes("videos")) ||
            (screenId === "ride" && text.includes("ride")) ||
            (screenId === "search" && text.includes("search")) ||
            (screenId === "profile" && text.includes("profile"))
        ) {
            item.classList.add("active-nav");
        }

    });

    // page ko top par le jao
    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
}


// ===============================
// RIDE BOOKING
// ===============================

function findRide() {

    const inputs = document.querySelectorAll("#ride input");
    const pickup = inputs[0].value.trim();
    const destination = inputs[1].value.trim();

    const vehicleSelect = document.querySelector("#ride select");
    const vehicle = vehicleSelect.value;

    if (pickup === "") {
        alert("Please enter pickup location.");
        return;
    }

    if (destination === "") {
        alert("Please enter destination.");
        return;
    }

    if (vehicle === "Select Vehicle") {
        alert("Please select a vehicle.");
        return;
    }

    // booking ID
    const bookingId =
        "NV" + Date.now().toString().slice(-6);

    alert(
        "Ride Request Sent Successfully! 🚕\n\n" +
        "Booking ID: " + bookingId + "\n" +
        "Pickup: " + pickup + "\n" +
        "Destination: " + destination + "\n" +
        "Vehicle: " + vehicle + "\n\n" +
        "Driver request bheji ja rahi hai."
    );

    // save booking
    const booking = {
        id: bookingId,
        pickup: pickup,
        destination: destination,
        vehicle: vehicle,
        status: "Searching Driver",
        time: new Date().toLocaleString()
    };

    localStorage.setItem(
        "nv_current_ride",
        JSON.stringify(booking)
    );
}


// ===============================
// HOTEL SEARCH
// ===============================

function searchHotels() {

    const hotelSection = document.getElementById("hotel");

    const destination =
        hotelSection.querySelector("input[type='text']").value.trim();

    if (destination === "") {
        alert("Please enter hotel destination.");
        return;
    }

    alert(
        "Hotel search request created 🏨\n\n" +
        "Destination: " + destination
    );
}


// ===============================
// PACKAGE SEARCH
// ===============================

function searchPackages() {

    const packageSection =
        document.getElementById("packages");

    const inputs =
        packageSection.querySelectorAll("input");

    const from = inputs[0].value.trim();
    const destination = inputs[1].value.trim();
    const passengers = inputs[2].value.trim();

    const days =
        packageSection.querySelector("select").value;

    if (from === "") {
        alert("Please enter starting location.");
        return;
    }

    if (destination === "") {
        alert("Please enter destination.");
        return;
    }

    alert(
        "Package Search Created 🎒\n\n" +
        "From: " + from + "\n" +
        "Destination: " + destination + "\n" +
        "Duration: " + days + "\n" +
        "Passengers: " +
        (passengers || "Not specified")
    );
}


// ===============================
// APP START
// ===============================

document.addEventListener("DOMContentLoaded", function () {

    // Ride button
    const rideButton =
        document.querySelector("#ride .main-button");

    if (rideButton) {
        rideButton.addEventListener("click", findRide);
    }

    // Hotel button
    const hotelButton =
        document.querySelector("#hotel .main-button");

    if (hotelButton) {
        hotelButton.addEventListener(
            "click",
            searchHotels
        );
    }

    // Package button
    const packageButton =
        document.querySelector("#packages .main-button");

    if (packageButton) {
        packageButton.addEventListener(
            "click",
            searchPackages
        );
    }

});
