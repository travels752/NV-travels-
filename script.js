let appState = {
    role: 'customer',
    isLoggedIn: false,
    userName: 'Traveler',

    // Driver commission
    driverCommissionRate: 0.15,

    driverEarnings: 0,
    driverRides: 0,

    // Hotel owner pass
    hasHotelPass: false,
    passExpiry: 'Not Active'
};


/* =========================
   ROLE SELECTION
========================= */

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


/* =========================
   TAB NAVIGATION
========================= */

function switchTab(screenId) {

    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.remove('active-screen');
    });

    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
    });

    const target =
        document.getElementById('screen-' + screenId);

    if (target) {
        target.classList.add('active-screen');
    }

    const tab =
        document.getElementById('tab-' + screenId);

    if (tab) {
        tab.classList.add('active');
    }
}


/* =========================
   RIDE FARE
========================= */

function calculateFare() {

    const pickup =
        document.getElementById('pickup').value.trim();

    const drop =
        document.getElementById('drop').value.trim();

    if (!pickup || !drop) {

        alert(
            "📍 Please enter pickup and destination."
        );

        return;
    }

    // Demo fare for now
    const fare =
        Math.floor(Math.random() * 401) + 200;

    window.lastCalculatedFare = fare;

    document.getElementById('fare-amount').innerText =
        "₹" + fare.toFixed(2);

    document.getElementById('fare-window').style.display =
        'flex';

    document.getElementById('request-btn').style.display =
        'block';
}


/* =========================
   DRIVER REQUEST
========================= */

function sendDriverRequest() {

    if (!window.lastCalculatedFare) {

        alert(
            "Please calculate the fare first."
        );

        return;
    }

    const fare =
        window.lastCalculatedFare;

    alert(
        "📡 Ride request sent to nearby drivers.\n\n" +
        "Customer Fare: ₹" +
        fare.toFixed(2)
    );


    setTimeout(() => {

        const nvCommission =
            fare * appState.driverCommissionRate;

        const driverEarning =
            fare - nvCommission;


        appState.driverRides += 1;

        appState.driverEarnings +=
            driverEarning;


        const ridesElement =
            document.getElementById('drv-rides');

        const earningsElement =
            document.getElementById('drv-earnings');


        if (ridesElement) {
            ridesElement.innerText =
                appState.driverRides;
        }


        if (earningsElement) {
            earningsElement.innerText =
                "₹" +
                appState.driverEarnings.toFixed(2);
        }


        alert(
            "✅ Ride Accepted!\n\n" +

            "Customer Fare: ₹" +
            fare.toFixed(2) +

            "\n\nNV Travels Commission: ₹" +
            nvCommission.toFixed(2) +

            "\n\nDriver Earnings: ₹" +
            driverEarning.toFixed(2)
        );

    }, 2000);
}


/* =========================
   TRAVEL PACKAGES
========================= */

function searchPackages() {

    const from =
        document.getElementById('package-from').value.trim();

    const to =
        document.getElementById('package-to').value.trim();

    const days =
        document.getElementById('package-days').value;

    const passengers =
        document.getElementById('package-passengers').value;

    const vehicle =
        document.getElementById('package-vehicle').value;

    const hotel =
        document.getElementById('package-hotel').value;


    if (
        !from ||
        !to ||
        !days ||
        !passengers ||
        !vehicle ||
        !hotel
    ) {

        alert(
            "📦 Package ki sabhi details fill karo."
        );

        return;
    }


    const results =
        document.getElementById('package-results');


    results.innerHTML = `

        <div class="card" style="margin-top:15px;">

            <h3>📦 Package Found</h3>

            <p style="margin-top:12px;">
                📍 From: ${from}
            </p>

            <p style="margin-top:8px;">
                📍 To: ${to}
            </p>

            <p style="margin-top:8px;">
                📅 Days: ${days}
            </p>

            <p style="margin-top:8px;">
                👥 Passengers: ${passengers}
            </p>

            <p style="margin-top:8px;">
                🚗 Vehicle: ${vehicle}
            </p>

            <p style="margin-top:8px;">
                🏨 Hotel: ${hotel}
            </p>

            <button
                class="main-btn"
                style="margin-top:15px;"
                onclick="alert('📦 Package request sent successfully!')">

                Select Package

            </button>

        </div>

    `;
}


/* =========================
   HOTEL OWNER PASS
========================= */

function buyOwnerPass() {

    appState.hasHotelPass = true;

    appState.passExpiry =
        "Active (30 Days)";


    const badge =
        document.getElementById('pass-badge');


    if (badge) {

        badge.innerText =
            appState.passExpiry;

        badge.style.color =
            '#34c759';
    }


    alert(
        "💳 ₹1,000 Business Pass activated."
    );
}


/* =========================
   HOTEL LISTING
========================= */

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

        alert(
            "🏨 Please enter hotel name and price."
        );

        return;
    }


    alert(
        "🎉 Hotel listing created!\n\n" +

        "Hotel: " +
        name +

        "\nPrice: ₹" +
        price +
        "/night"
    );
}


/* =========================
   SOCIAL
========================= */

function triggerSocialAction(actionType) {

    alert(
        "🌍 Social action: " +
        actionType
    );
}


/* =========================
   LOGOUT
========================= */

function logout() {

    appState.isLoggedIn = false;

    document.getElementById(
        'global-nav'
    ).style.display = 'none';


    document.querySelectorAll('.screen')
        .forEach(screen => {
            screen.classList.remove(
                'active-screen'
            );
        });


    document.getElementById(
        'screen-login'
    ).classList.add(
        'active-screen'
    );


    const phone =
        document.getElementById('auth-phone');

    const otp =
        document.getElementById('auth-otp');

    const otpSection =
        document.getElementById('otp-section');


    if (phone) {
        phone.value = '';
    }


    if (otp) {
        otp.value = '';
    }


    if (otpSection) {
        otpSection.style.display = 'none';
    }


    // Firebase logout
    if (
        typeof window.logoutFirebase ===
        'function'
    ) {
        window.logoutFirebase();
    }
}
