// Event listeners
document.querySelector("#zip").addEventListener("change", displayCity);
document.querySelector("#state").addEventListener("change", displayCounties);
document.querySelector("#username").addEventListener("change", checkUsername);
document.querySelector("#password").addEventListener("click", suggestPassword);
document.querySelector("#signupForm").addEventListener("submit", validateForm);

// Load states when the page opens
displayStates();

async function displayCity() {
  let zipCode = document.querySelector("#zip").value;

  try {
    let url = `https://csumb.space/api/cityInfoAPI.php?zip=${zipCode}`;
    let response = await fetch(url);
    let data = await response.json();

    if (data === false) {
      document.querySelector("#city").textContent = "Zip code not found";
      document.querySelector("#latitude").textContent = "";
      document.querySelector("#longitude").textContent = "";
      return;
    }

    document.querySelector("#city").textContent = data.city;
    document.querySelector("#latitude").textContent = data.latitude;
    document.querySelector("#longitude").textContent = data.longitude;

  } catch (error) {
    document.querySelector("#city").textContent = "Unable to retrieve city";
    document.querySelector("#latitude").textContent = "";
    document.querySelector("#longitude").textContent = "";
    console.error(error);
  }
}

async function displayStates() {
  try {
    let url = "https://csumb.space/api/allStatesAPI.php";
    let response = await fetch(url);
    let data = await response.json();

    let stateMenu = document.querySelector("#state");
    stateMenu.innerHTML = '<option value="">Select One</option>';

    for (let state of data) {
      let option = document.createElement("option");

      option.value = state.usps;
      option.textContent = state.state;

      stateMenu.appendChild(option);
    }

  } catch (error) {
    console.error(error);
  }
}

async function displayCounties() {
  let stateCode = document.querySelector("#state").value;
  let countyMenu = document.querySelector("#county");

  countyMenu.innerHTML = '<option value="">Select One</option>';

  if (stateCode === "") {
    return;
  }

  try {
    let url =
      `https://csumb.space/api/countyListAPI.php?state=${stateCode}`;

    let response = await fetch(url);
    let data = await response.json();

    for (let county of data) {
      let option = document.createElement("option");

      option.value = county.county;
      option.textContent = county.county;

      countyMenu.appendChild(option);
    }

  } catch (error) {
    console.error(error);
  }
}

async function checkUsername() {
  let username = document.querySelector("#username").value;
  let usernameError = document.querySelector("#usernameError");

  usernameError.textContent = "";

  if (username === "") {
    return false;
  }

  try {
    let url =
      `https://csumb.space/api/usernamesAPI.php?username=${username}`;

    let response = await fetch(url);
    let data = await response.json();

    if (data.available) {
      usernameError.textContent = "Username is available";
      usernameError.style.color = "green";
      return true;
    } else {
      usernameError.textContent = "Username is already taken";
      usernameError.style.color = "red";
      return false;
    }

  } catch (error) {
    usernameError.textContent = "Unable to check username";
    usernameError.style.color = "red";
    console.error(error);
    return false;
  }
}

async function suggestPassword() {
  let suggestedPassword = document.querySelector("#suggestedPassword");

  try {
    let url =
      "https://csumb.space/api/suggestedPassword.php?length=8";

    let response = await fetch(url);
    let data = await response.json();

    suggestedPassword.textContent =
      `Suggested password: ${data.password}`;

    suggestedPassword.style.color = "blue";

  } catch (error) {
    suggestedPassword.textContent =
      "Unable to suggest a password";

    suggestedPassword.style.color = "red";
    console.error(error);
  }
}

async function validateForm(event) {
  event.preventDefault();

  let password = document.querySelector("#password").value;
  let passwordAgain =
    document.querySelector("#passwordAgain").value;

  let passwordError =
    document.querySelector("#passwordError");

  passwordError.textContent = "";

  if (password.length < 6) {
    passwordError.textContent =
      "Password must have at least 6 characters";

    passwordError.style.color = "red";
    return;
  }

  if (password !== passwordAgain) {
    passwordError.textContent =
      "Passwords do not match";

    passwordError.style.color = "red";
    return;
  }

  let usernameIsAvailable = await checkUsername();

  if (!usernameIsAvailable) {
    return;
  }

  window.location.href = "welcome.html";
}