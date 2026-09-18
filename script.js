// ===============================
// NV TRAVELSS - APP FUNCTIONALITY
// ===============================

function openScreen(screenId) {

    // Sabhi screens hide karo
    const screens = document.querySelectorAll(".screen");

    screens.forEach(function(screen) {
        screen.classList.remove("active");
    });

    // Selected screen show karo
    const selectedScreen = document.getElementById(screenId);

    if (selectedScreen) {
        selectedScreen.classList.add("active");
    }

    // Bottom navigation active state
    const navItems = document.querySelectorAll(".nav-item");

    navItems.forEach(function(item) {
        item.classList.remove("active-nav");
    });

    navItems.forEach(function(item) {

        const clickCode = item.getAttribute("onclick");

        if (clickCode && clickCode.includes("'" + screenId + "'")) {
            item.classList.add("active-nav");
        }

    });

    // Page ko top par le jao
    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
}


// ===============================
// RIDE BOOKING
// ===============================

document.addEventListener("DOMContentLoaded", function() {

    const buttons = document.querySelectorAll(".main-button");

    buttons.forEach(function(button) {

        button.addEventListener("click", function() {

            const parent = button.closest(".form-card");

            if (!parent) return;

            // Ride
            if (parent.closest("#ride")) {

                const inputs = parent.querySelectorAll("input");
                const vehicle = parent.querySelector("select");

                const pickup = inputs[0].value.trim();
                const destination = inputs[1].value.trim();

                if (!pickup || !destination || vehicle.value === "Select Vehicle") {
                    alert("Please enter pickup, destination and select vehicle.");
                    return;
                }

                alert(
                    "🚕 Ride Request Sent!\n\n" +
                    "Pickup: " + pickup + "\n" +
                    "Destination: " + destination + "\n" +
                    "Vehicle: " + vehicle.value + "\n\n" +
                    "Nearby drivers will receive your request."
                );

                return;
            }


            // Hotel
            if (parent.closest("#hotel")) {

                const inputs = parent.querySelectorAll("input");
                const destination = inputs[0].value.trim();
                const checkIn = inputs[1].value;
                const checkOut = inputs[2].value;

                if (!destination || !checkIn || !checkOut) {
                    alert("Please enter destination, check-in and check-out dates.");
                    return;
                }

                alert(
                    "🏨 Hotel Search Started!\n\n" +
                    "Destination: " + destination + "\n" +
                    "Check-in: " + checkIn + "\n" +
                    "Check-out: " + checkOut + "\n\n" +
                    "Searching available hotels..."
                );

                return;
            }


            // Packages
            if (parent.closest("#packages")) {

                const inputs = parent.querySelectorAll("input");
                const selects = parent.querySelectorAll("select");

                const from = inputs[0].value.trim();
                const destination = inputs[1].value.trim();
                const days = selects[0].value;
                const passengers = inputs[2].value.trim();

                if (!from || !destination || !passengers) {
                    alert("Please fill all package details.");
                    return;
                }

                alert(
                    "🎒 Package Search Started!\n\n" +
                    "From: " + from + "\n" +
                    "Destination: " + destination + "\n" +
                    "Duration: " + days + "\n" +
                    "Passengers: " + passengers + "\n\n" +
                    "Finding travel packages..."
                );

                return;
            }

        });

    });


    // ===============================
    // SEARCH
    // ===============================

    const searchButton = document.querySelector("#search .search-box button");

    if (searchButton) {

        searchButton.addEventListener("click", function() {

            const searchInput =
                document.querySelector("#search .search-box input");

            const query = searchInput.value.trim();

            if (!query) {
                alert("Please type something to search.");
                return;
            }

            alert(
                "🔍 Searching NV Travels for:\n\n" +
                query
            );

        });

    }


    // ===============================
    // PROFILE BUTTONS
    // ===============================

    const profileButtons =
        document.querySelectorAll("#profile .profile-menu button");

    profileButtons.forEach(function(button) {

        button.addEventListener("click", function() {

            alert(
                button.innerText +
                "\n\nThis section is ready for the next development step."
            );

        });

    });


    // ===============================
    // SOCIAL VIDEO ACTION
    // ===============================

    const videoCards =
        document.querySelectorAll(".video-card");

    videoCards.forEach(function(card) {

        card.addEventListener("click", function() {

            alert(
                "▶️ NV Travels Video\n\n" +
                "Like ❤️  Comment 💬  Share 🔗"
            );

        });

    });

});


// ===============================
// START APP
// ===============================

document.addEventListener("DOMContentLoaded", function() {

    // Home ko default screen rakho
    openScreen("home");

});
