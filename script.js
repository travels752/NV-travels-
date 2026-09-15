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
    document.querySelectorAll('.role-btn').forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');
    document.getElementById('auth-title').innerText = role.toUpperCase() + " ACCESS portal";
}

function handleAuth() {
    const phone = document.getElementById('auth-phone').value;
    const pass = document.getElementById('auth-pass').value;

    if (!phone || !pass) {
        alert("🚨 Please fill all validation fields!");
        return;
    }

    appState.isLoggedIn = true;
    appState.userName = phone.slice(-4); // Temporary username masking

    document.getElementById('screen-login').classList.remove('active-screen');
    document.getElementById('global-nav').style.display = 'flex';
    
    // Role matching screen redirection
    if (appState.role === 'customer') {
        switchTab('home');
    } else if (appState.role === 'driver') {
        switchTab('driver-panel');
    } else if (appState.role === 'owner') {
        switchTab('owner-panel');
    }
}

function switchTab(screenId) {
    document.querySelectorAll('.screen').forEach(scr => scr.classList.remove('active-screen'));
    document.querySelectorAll('.nav-item').forEach(item => item.classList.remove('active'));
    
    const targetScreen = document.getElementById('screen-' + screenId);
    if (targetScreen) targetScreen.classList.add('active-screen');
    
    // Highlight correct tab element manually matching the context
    if(screenId === 'home') document.getElementById('tab-home').classList.add('active');
    if(screenId === 'hotels') document.getElementById('tab-hotels').classList.add('active');
    if(screenId === 'social') document.getElementById('tab-social').classList.add('active');
    if(screenId === 'profile') document.getElementById('tab-profile').classList.add('active');
}

function calculateFare() {
    const pick = document.getElementById('pickup').value;
    const drop = document.getElementById('drop').value;

    if (!pick || !drop) {
        alert("Please map pickup & destination nodes.");
        return;
    }

    // Dynamic fare logic computation 
    const baseFare = Math.floor(Math.random() * (600 - 200 + 1)) + 200;
    document.getElementById('fare-amount').innerText = "₹" + baseFare;
    document.getElementById('fare-window').style.style.display = 'flex';
    document.getElementById('request-btn').style.display = 'block';
    
    // Pass pricing variable state context globally to simulated ride generator
    window.lastCalculatedFare = baseFare;
}

function sendDriverRequest() {
    alert("📡 Syncing live GPS telemetry... Sending request to nearby drivers in Puri.");
    
    // Simulate real driver acceptance after 2 seconds
    setTimeout(() => {
        alert(`✅ Ride Accepted by Driver Biswal (OD-02-X-9981)!\nEstimated Fare: ₹${window.lastCalculatedFare}\nDriver will deduct 15% system fee upon drop.`);
        
        // Update mock driver dashboard engine data
        appState.driverRides += 1;
        const driverCut = window.lastCalculatedFare * 0.85;
        appState.driverEarnings += driverCut;
        
        // Refresh dynamic UI elements metrics
        document.getElementById('drv-rides').innerText = appState.driverRides;
        document.getElementById('drv-earnings').innerText = "₹" + appState.driverEarnings.toFixed(2);
    }, 2000);
}

function buyOwnerPass() {
    appState.hasHotelPass = true;
    appState.passExpiry = "Active (Expires in 30 Days)";
    document.getElementById('pass-badge').innerText = appState.passExpiry;
    document.getElementById('pass-badge').style.color = '#34c759';
    alert("💳 ₹1,000 Subscription Active! Dynamic Hotel Listing Controls Unlocked.");
}

function handleHotelAdd() {
    if(!appState.hasHotelPass) {
        alert("⚠️ Access Denied! Please purchase the ₹1,000/month Active Pass to unlock registration control systems.");
        return;
    }
    const name = document.getElementById('h-name').value;
    const price = document.getElementById('h-price').value;
    if(!name || !price) {
        alert("Fill complete room metadata.");
        return;
    }
    alert(`🎉 Successfully listed '${name}' rooms at ₹${price}/night on Puri Feed!`);
}

function triggerSocialAction(actionType) {
    alert(`Dynamic Social Feed Event: Post ${actionType} registered.`);
}

function logout() {
    appState.isLoggedIn = false;
    document.getElementById('global-nav').style.display = 'none';
    switchTab('login');
               }
