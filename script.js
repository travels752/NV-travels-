function registerUser() {
  const name = document.getElementById("userName").value.trim();
  const mobile = document.getElementById("userMobile").value.trim();
  const password = document.getElementById("userPassword").value;

  if (!name || !mobile || !password) {
    document.getElementById("accountMessage").textContent =
      "कृपया Name, Mobile और Password भरें।";
    return;
  }

  if (mobile.length !== 10) {
    document.getElementById("accountMessage").textContent =
      "कृपया 10 अंकों का Mobile Number डालें।";
    return;
  }

  localStorage.setItem(
    "nvUser",
    JSON.stringify({
      name: name,
      mobile: mobile,
      password: password
    })
  );

  document.getElementById("accountMessage").textContent =
    "✅ Account बन गया! अब Login करें।";
}

function loginUser() {
  const mobile = document.getElementById("userMobile").value.trim();
  const password = document.getElementById("userPassword").value;

  const savedUser = localStorage.getItem("nvUser");

  if (!savedUser) {
    document.getElementById("accountMessage").textContent =
      "❌ पहले Create Account करें।";
    return;
  }

  const user = JSON.parse(savedUser);

  if (mobile === user.mobile && password === user.password) {
    localStorage.setItem("nvLoggedIn", "true");

    document.getElementById("accountMessage").textContent =
      "✅ Login successful! Welcome " + user.name;
  } else {
    document.getElementById("accountMessage").textContent =
      "❌ Mobile Number या Password गलत है।";
  }
}

function logoutUser() {
  localStorage.removeItem("nvLoggedIn");

  document.getElementById("accountMessage").textContent =
    "🚪 आप Logout हो गए हैं।";
}

function bookRide() {
  const pickup = document.getElementById("pickup").value.trim();
  const drop = document.getElementById("drop").value.trim();
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
  const city = document.getElementById("hotelCity").value.trim();

  if (!city) {
    document.getElementById("hotelMessage").textContent =
      "कृपया City डालें।";
    return;
  }

  document.getElementById("hotelMessage").textContent =
    "🏨 Hotel search request तैयार है!";
}

function skipHotel() {
  document.getElementById("hotelMessage").textContent =
    "⏭️ Hotel booking skipped.";
}

function registerDriver() {
  const name = document.getElementById("driverName").value.trim();
  const mobile = document.getElementById("driverMobile").value.trim();
  const password = document.getElementById("driverPassword").value;
  const vehicle = document.getElementById("driverVehicle").value;
  const vehicleNumber = document.getElementById("vehicleNumber").value.trim();

  if (!name || !mobile || !password || !vehicle || !vehicleNumber) {
    document.getElementById("driverMessage").textContent =
      "कृपया सभी Driver details भरें।";
    return;
  }

  if (mobile.length !== 10) {
    document.getElementById("driverMessage").textContent =
      "कृपया 10 अंकों का Mobile Number डालें।";
    return;
  }

  localStorage.setItem("nvDriver", JSON.stringify({
    name,
    mobile,
    password,
    vehicle,
    vehicleNumber
  }));

  document.getElementById("driverMessage").textContent =
    "✅ Driver registration successful! अब Login करें।";
}

function loginDriver() {
  const mobile = document.getElementById("driverMobile").value.trim();
  const password = document.getElementById("driverPassword").value;

  const savedDriver = localStorage.getItem("nvDriver");

  if (!savedDriver) {
    document.getElementById("driverMessage").textContent =
      "❌ पहले Driver Registration करें।";
    return;
  }

  const driver = JSON.parse(savedDriver);

  if (mobile === driver.mobile && password === driver.password) {
    localStorage.setItem("nvDriverLoggedIn", "true");

    document.getElementById("driverMessage").textContent =
      "✅ Driver Login successful! Welcome " + driver.name;
  } else {
    document.getElementById("driverMessage").textContent =
      "❌ Mobile Number या Password गलत है।";
  }
}

function logoutDriver() {
  localStorage.removeItem("nvDriverLoggedIn");

  document.getElementById("driverMessage").textContent =
    "🚪 Driver Logout successful.";
}

function social() {
  document.getElementById("socialMessage").textContent =
    "📱 Social section जल्द जोड़ा जाएगा।";
}
