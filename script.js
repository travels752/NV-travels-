let appState = {
    role: 'customer',
    isLoggedIn: false,
    userName: 'Traveler',
    driverCommissionRate: 0.15,
    driverEarnings: 0,
    driverRides: 0,
    hasHotelPass: false,
    passExpiry: 'Not Active'
};

function setRole(role, button) {
    appState.role = role;

    document.querySelectorAll('.role-btn').forEach(btn => {
        btn.classList.remove('active');
    });

    if (button) {
        button.classList.add('active');
    }

    document.getElementById('auth-title').innerText =
        role.toUpperCase() + " ACCESS PORTAL";
}

function handleAuth() {
    const phone = document.getElementById('auth-phone').value.trim();
    const pass = document.getElementById('auth-pass').value.trim();

    if (!phone || !pass) {
        alert("🚨 Please fill all fields.");
        return;
    }

    appState.isLoggedIn = true;
    appState.userName = phone.slice(-4);

    document.getElementById('screen-login')
        .classList.remove('active-screen');

    document.getElementById('global-nav').style.display = 'flex';

    if (appState.role === 'customer') {
        switchTab('home');
    }

    if (appState.role === 'driver') {
        switchTab('driver-panel');
    }

    if (appState.role === 'owner') {
        switchTab('owner-panel');
    }
}

function switchTab(screenId) {
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.remove('active-screen');
    });

    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
    });

    const target = document.getElementById('screen-' + screenId);

    if (target) {
        target.classList.add('active-screen');
    }

    if (screenId === 'home') {
        document.getElementById('tab-home').classList.add('active');
    }

    if (screenId === 'hotels') {
        document.getElementById('tab-hotels').classList.add('active');
    }

    if (screenId === 'social') {
        document.getElementById('tab-social').classList.add('active');
    }

    if (screenId === 'profile') {
        document.getElementById('tab-profile').classList.add('active');
    }
}

function calculateFare() {
    const pickup = document.getElementById('pickup').value.trim();
    const drop = document.getElementById('drop').value.trim();

    if (!pickup || !drop) {
        alert("📍 Please enter pickup and destination.");
        return;
    }

    const fare = Math.floor(Math.random() * 401) + 200;

    window.lastCalculatedFare = fare;

    document.getElementById('fare-amount').innerText =
        "₹" + fare.toFixed(2);

    document.getElementById('fare-window').style.display = 'flex';
    document.getElementById('request-btn').style.display = 'block';
}

function sendDriverRequest() {
    if (!window.lastCalculatedFare) {
        alert("Please calculate the fare first.");
        return;
    }

    const fare = window.lastCalculatedFare;

    alert(
        "📡 Ride request sent to nearby drivers.\n\n" +
        "Customer Fare: ₹" + fare.toFixed(2)
    );

    setTimeout(() => {

        const nvCommission =
            fare * appState.driverCommissionRate;

        const driverEarning =
            fare - nvCommission;

        appState.driverRides += 1;
        appState.driverEarnings += driverEarning;

        document.getElementById('drv-rides').innerText =
            appState.driverRides;

        document.getElementById('drv-earnings').innerText =
            "₹" + appState.driverEarnings.toFixed(2);

        alert(
            "✅ Ride Accepted!\n\n" +
            "Customer Fare: ₹" + fare.toFixed(2) + "\n" +
            "NV Travels Commission: ₹" +
            nvCommission.toFixed(2) + "\n" +
            "Driver Earnings: ₹" +
            driverEarning.toFixed(2)
        );

    }, 2000);
}

function buyOwnerPass() {
    appState.hasHotelPass = true;
    appState.passExpiry = "Active (30 Days)";

    document.getElementById('pass-badge').innerText =
        appState.passExpiry;

    document.getElementById('pass-badge').style.color =
        '#34c759';

    alert("💳 ₹1,000 Business Pass activated.");
}

function handleHotelAdd() {
    if (!appState.hasHotelPass) {
        alert(
            "⚠️ Please activate the ₹1,000/month Business Pass first."
        );
        return;
    }

    const name =
        document.getElementById('h-name').value.trim();

    const price =
        document.getElementById('h-price').value.trim();

    if (!name || !price) {
        alert("🏨 Please enter hotel name and price.");
        return;
    }

    alert(
        "🎉 Hotel listing created!\n\n" +
        "Hotel: " + name + "\n" +
        "Price: ₹" + price + "/night"
    );
}

function triggerSocialAction(actionType) {
    alert("🌍 Social action: " + actionType);
}

function logout() {
    appState.isLoggedIn = false;

    document.getElementById('global-nav').style.display = 'none';

    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.remove('active-screen');
    });

    document.getElementById('screen-login')
        .classList.add('active-screen');

    document.getElementById('auth-phone').value = '';
    document.getElementById('auth-pass').value = '';
}
