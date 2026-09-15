// ===============================
// CUSTOMER ACCOUNT
// ===============================

function registerUser() {
  const name = document.getElementById("userName").value.trim();
  const mobile = document.getElementById("userMobile").value.trim();
  const password = document.getElementById("userPassword").value;

  if (!name || !mobile || !password) {
    show("accountMessage", "कृपया सभी details भरें।");
    return;
  }

  if (!/^\d{10}$/.test(mobile)) {
    show("accountMessage", "कृपया 10 अंकों का Mobile Number डालें।");
    return;
  }

  localStorage.setItem("nvUser", JSON.stringify({
    name,
    mobile,
    password
  }));

  show("accountMessage", "✅ Account successfully बनाया गया।");
}

function loginUser() {
  const mobile = document.getElementById("userMobile").value.trim();
  const password = document.getElementById("userPassword").value;

  const saved = localStorage.getItem("nvUser");

  if (!saved) {
    show("accountMessage", "❌ पहले Create Account करें।");
    return;
  }

  const user = JSON.parse(saved);

  if (mobile === user.mobile && password === user.password) {
    localStorage.setItem("nvLoggedIn", "true");

    show(
      "accountMessage",
      "✅ Login successful! Welcome " + user.name
    );
  } else {
    show("accountMessage", "❌ Mobile Number या Password गलत है।");
  }
}

function logoutUser() {
  localStorage.removeItem("nvLoggedIn");
  show("accountMessage", "🚪 Customer Logout successful।");
}


// ===============================
// DRIVER ACCOUNT
// ===============================

function registerDriver() {
  const name = document.getElementById("driverName").value.trim();
  const mobile = document.getElementById("driverMobile").value.trim();
  const password = document.getElementById("driverPassword").value;
  const vehicle = document.getElementById("driverVehicle").value;
  const vehicleNumber =
    document.getElementById("vehicleNumber").value.trim();

  if (!name || !mobile || !password || !vehicle || !vehicleNumber) {
    show("driverMessage", "कृपया सभी Driver details भरें।");
    return;
  }

  if (!/^\d{10}$/.test(mobile)) {
    show("driverMessage", "कृपया 10 अंकों का Mobile Number डालें।");
    return;
  }

  localStorage.setItem("nvDriver", JSON.stringify({
    name,
    mobile,
    password,
    vehicle,
    vehicleNumber
  }));

  show(
    "driverMessage",
    "✅ Driver registration successful। अब Login करें।"
  );
}

function loginDriver() {
  const mobile = document.getElementById("driverMobile").value.trim();
  const password = document.getElementById("driverPassword").value;

  const saved = localStorage.getItem("nvDriver");

  if (!saved) {
    show("driverMessage", "❌ पहले Driver Registration करें।");
    return;
  }

  const driver = JSON.parse(saved);

  if (mobile === driver.mobile && password === driver.password) {
    localStorage.setItem("nvDriverLoggedIn", "true");

    show(
      "driverMessage",
      "✅ Driver Login successful! Welcome " + driver.name
    );

    refreshRides();
  } else {
    show("driverMessage", "❌ Mobile Number या Password गलत है।");
  }
}

function logoutDriver() {
  localStorage.removeItem("nvDriverLoggedIn");
  show("driverMessage", "🚪 Driver Logout successful।");
}


// ===============================
// RIDE BOOKING
// ===============================

function bookRide() {
  const pickup = document.getElementById("pickup").value.trim();
  const drop = document.getElementById("drop").value.trim();
  const date = document.getElementById("date").value;
  const time = document.getElementById("time").value;
  const vehicle = document.getElementById("vehicle").value;

  if (!pickup || !drop || !date || !time || !vehicle) {
    show(
      "rideMessage",
      "कृपया Pickup, Drop, Date, Time और Vehicle भरें।"
    );
    return;
  }

  const ride = {
    id: Date.now(),
    pickup,
    drop,
    date,
    time,
    vehicle,
    status: "Available"
  };

  const rides = JSON.parse(
    localStorage.getItem("nvRides") || "[]"
  );

  rides.push(ride);

  localStorage.setItem("nvRides", JSON.stringify(rides));

  show(
    "rideMessage",
    "✅ Ride request successfully बनाई गई!"
  );

  refreshRides();
}


// ===============================
// DRIVER RIDE REQUESTS
// ===============================

function refreshRides() {
  const box = document.getElementById("rideRequests");

  if (!box) return;

  const rides = JSON.parse(
    localStorage.getItem("nvRides") || "[]"
  );

  if (rides.length === 0) {
    box.innerHTML = "<p>अभी कोई ride request नहीं है।</p>";
    return;
  }

  box.innerHTML = "";

  rides.forEach(function(ride) {

    const div = document.createElement("div");

    div.className = "card";

    div.innerHTML = `
      <h3>🚕 Ride #${ride.id}</h3>
      <p><strong>Pickup:</strong> ${ride.pickup}</p>
      <p><strong>Drop:</strong> ${ride.drop}</p>
      <p><strong>Date:</strong> ${ride.date}</p>
      <p><strong>Time:</strong> ${ride.time}</p>
      <p><strong>Vehicle:</strong> ${ride.vehicle}</p>
      <p><strong>Status:</strong> ${ride.status}</p>

      ${
        ride.status === "Available"
          ? `<button onclick="acceptRide(${ride.id})">
               ✅ Accept Ride
             </button>`
          : ""
      }
    `;

    box.appendChild(div);
  });
}


// ===============================
// ACCEPT RIDE
// ===============================

function acceptRide(id) {
  const loggedIn =
    localStorage.getItem("nvDriverLoggedIn");

  if (loggedIn !== "true") {
    show(
      "driverMessage",
      "🔐 पहले Driver Login करें।"
    );
    return;
  }

  const rides = JSON.parse(
    localStorage.getItem("nvRides") || "[]"
  );

  const ride = rides.find(function(item) {
    return item.id === id;
  });

  if (!ride) {
    show("driverMessage", "❌ Ride नहीं मिली।");
    return;
  }

  ride.status = "Accepted";

  localStorage.setItem(
    "nvRides",
    JSON.stringify(rides)
  );

  show(
    "driverMessage",
    "✅ Ride successfully accepted!"
  );

  refreshRides();
}


// ===============================
// HOTEL
// ===============================

function bookHotel() {
  const city =
    document.getElementById("hotelCity").value.trim();

  const checkin =
    document.getElementById("checkin").value;

  const checkout =
    document.getElementById("checkout").value;

  if (!city || !checkin || !checkout) {
    show(
      "hotelMessage",
      "कृपया City, Check-in और Check-out भरें।"
    );
    return;
  }

  show(
    "hotelMessage",
    "🏨 Hotel booking request तैयार है!"
  );
}

function skipHotel() {
  show(
    "hotelMessage",
    "⏭️ Hotel booking skipped।"
  );
}


// ===============================
// SOCIAL
// ===============================

function social() {
  show(
    "socialMessage",
    "📱 Social section जल्द उपलब्ध होगा।"
  );
}


// ===============================
// HELPER
// ===============================

function show(id, message) {
  const element = document.getElementById(id);

  if (element) {
    element.textContent = message;
  }
}


// ===============================
// LOAD RIDES
// ===============================

document.addEventListener("DOMContentLoaded", function() {
  refreshRides();
});
