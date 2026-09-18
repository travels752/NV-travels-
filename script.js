let driverOnline = true;
let rideCount = 0;
let earnings = 0;

function hideAllPages() {
document.getElementById("loginPage").classList.remove("active-screen");
document.getElementById("customerPage").classList.remove("active-screen");
document.getElementById("driverPage").classList.remove("active-screen");
document.getElementById("hotelPage").classList.remove("active-screen");
}

function loginAs(role) {

hideAllPages();

if (role === "customer") {
    document.getElementById("customerPage").classList.add("active-screen");
}

if (role === "driver") {
    document.getElementById("driverPage").classList.add("active-screen");
}

if (role === "hotel") {
    document.getElementById("hotelPage").classList.add("active-screen");
}

}

function logout() {
hideAllPages();
document.getElementById("loginPage").classList.add("active-screen");
}

function toggleDriverStatus() {

driverOnline = !driverOnline;

const status = document.getElementById("driverStatus");

if (driverOnline) {
    status.innerText = "🟢 Online";
} else {
    status.innerText = "🔴 Offline";
}

}

function acceptRide() {

if (!driverOnline) {
    alert("Pehle Driver ko Online karo.");
    return;
}

rideCount++;
earnings += 500;

document.getElementById("rideCount").innerText = rideCount;
document.getElementById("earningAmount").innerText = "₹" + earnings;

alert("Ride accepted successfully!");

}

function rejectRide() {
alert("Ride rejected.");
}
