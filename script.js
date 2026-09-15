let appState = {
    role: 'customer',
    isLoggedIn: false,
    userName: 'Traveler',
    driverEarnings: 0,
    driverRides: 0,
    hasHotelPass: false,
    passExpiry: 'Not Active'
};

function setRole(role) {
    appState.role = role;

    document.querySelectorAll('.role-btn').forEach(btn => {
        btn.classList.remove('active');
    });

    event.target.classList.add('active');

    document.getElementById('auth-title').innerText =
        role.toUpperCase() + " ACCESS PORTAL";
}

function handleAuth() {
    const phone = document.getElementById('auth-phone').value.trim();
    const pass = document.getElementById('auth-pass').value.trim();

    if (!phone || !pass) {
        alert("🚨 Please fill all validation fields!");
        return;
    }

    appState.isLoggedIn = true;
    appState.userName = phone.slice(-4);

    document.getElementById('screen-login')
        .classList.remove('active-screen');

    document.getElementById('global-nav').style.display = 'flex';

    if (appState.role === 'customer') {
        switchTab('home');
    } else if (appState.role === 'driver') {
        switchTab('driver-panel');
    } else if (appState.role === 'owner') {
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

    const targetScreen = document.getElementById('screen-' + screenId);

    if (targetScreen) {
        targetScreen.classList.add('active-screen');
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
    const pick = document.getElementById('pickup').value.trim();
    const drop = document.getElementById('drop').value.trim();

    if (!pick || !drop) {
        alert("📍 Please enter pickup and destination.");
        return;
    }

    const baseFare =
        Math.floor(Math.random() * (600 - 200 + 1)) + 200;

    document.getElementById('fare-amount').innerText =
        "₹" + baseFare.toFixed(2);

    document.getElementById('fare-window').style.display = 'flex';
    document.getElementById('request-btn').style.display = 'block';

    window.lastCalculatedFare = baseFare;
}

function sendDriverRequest() {
    if (!window.lastCalculatedFare) {
        alert("Please calculate the fare first.");
        return;
    }

    alert(
        "📡 Syncing live GPS telemetry...\n" +
        "Sending request to nearby drivers."
    );

    setTimeout(() => {
        const fare = window.lastCalculatedFare;

        alert(
            `✅ Ride Accepted by Driver!\n` +
            `Estimated Fare: ₹${fare.toFixed(2)}\n` +
            `15% system fee will be applied after the trip.`
        );

        appState.driverRides += 1;

        const driverCut = fare * 0.85;
        appState.driverEarnings += driverCut;

        document.getElementById('drv-rides').innerText =
            appState.driverRides;

        document.getElementById('drv-earnings').innerText =
            "₹" + appState.driverEarnings.toFixed(2);
    }, 2000);
}

function buyOwnerPass() {
    appState.hasHotelPass = true;
    appState.passExpiry = "Active (Expires in 30 Days)";

    document.getElementById('pass-badge').innerText =
        appState.passExpiry;

    document.getElementById('pass-badge').style.color = '#34c759';

    alert(
        "💳 ₹1,000 subscription activated!\n" +
        "Hotel listing controls are unlocked."
    );
}

function handleHotelAdd() {
    if (!appState.hasHotelPass) {
        alert(
            "⚠️ Access Denied!\n" +
            "Please activate the ₹1,000/month hotel owner pass first."
        );
        return;
    }

    const name = document.getElementById('h-name').value.trim();
    const price = document.getElementById('h-price').value.trim();

    if (!name || !price) {
        alert("🏨 Please enter hotel name and price.");
        return;
    }

    alert(
        `🎉 Successfully listed "${name}"\n` +
        `Price: ₹${price}/night`
    );
}

function triggerSocialAction(actionType) {
    alert(`🌍 Social action registered: ${actionType}`);
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
