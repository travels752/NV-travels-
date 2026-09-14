function bookRide() {
  const pickup = document.getElementById("pickup").value;
  const drop = document.getElementById("drop").value;
  const date = document.getElementById("date").value;
  const time = document.getElementById("time").value;
  const message = document.getElementById("bookingMessage");

  if (!pickup || !drop || !date || !time) {
    message.textContent = "कृपया सभी जानकारी भरें।";
    return;
  }

  message.textContent =
    "Ride request तैयार है! NV Travels जल्द ही आपकी booking confirm करेगा।";
}
function customerLogin() {
  const name = document.getElementById("customerName").value;
  const phone = document.getElementById("customerPhone").value;
  const password = document.getElementById("customerPassword").value;
  const message = document.getElementById("loginMessage");

  if (!name || !phone || !password) {
    message.textContent = "कृपया सभी जानकारी भरें।";
    return;
  }

  message.textContent = "Login details प्राप्त हो गईं।";
}
