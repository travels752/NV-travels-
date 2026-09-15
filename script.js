function bookRide() {
  const pickup = document.getElementById("pickup").value;
  const drop = document.getElementById("drop").value;
  const vehicle = document.getElementById("vehicle").value;

  if (!pickup || !drop || !vehicle) {
    document.getElementById("rideMessage").textContent =
      "कृपया Pickup, Drop और Vehicle चुनें।";
    return;
  }

  document.getElementById("rideMessage").textContent =
    "✅ Ride request तैयार है!";
}

function bookHotel() {
  const city = document.getElementById("hotelCity").value;

  if (!city) {
    document.getElementById("hotelMessage").textContent =
      "कृपया city डालें।";
    return;
  }

  document.getElementById("hotelMessage").textContent =
    "🏨 Hotels खोजने की सुविधा जल्द उपलब्ध होगी।";
}

function login() {
  document.getElementById("loginMessage").textContent =
    "👤 Login / Register system जल्द जोड़ा जाएगा।";
}

function driverLogin() {
  document.getElementById("driverMessage").textContent =
    "🚗 Driver Login system जल्द जोड़ा जाएगा।";
}

function social() {
  document.getElementById("socialMessage").textContent =
    "📱 Social section जल्द खुलेगा।";
}
