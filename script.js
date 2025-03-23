const API_URL = "http://localhost:3000";

// Function to show registration form
function showRegister() {
  document.getElementById("loginCard").style.display = "none";
  document.getElementById("registerCard").style.display = "flex";
}

// Function to show login form
function showLogin() {
  document.getElementById("registerCard").style.display = "none";
  document.getElementById("loginCard").style.display = "flex";
}

// User Registration
document
  .querySelector("#registerCard .user-profile")
  .addEventListener("click", async () => {
    const name = document.getElementById("register_name").value.trim();
    const age = document.getElementById("register_age").value.trim();
    const username = document.getElementById("register_username").value.trim();
    const password = document.getElementById("register_password").value;
    const confirmPassword = document.getElementById(
      "register_confirm_password"
    ).value;

    // Basic validation
    if (!name || !age || !username || !password || !confirmPassword) {
      alert("All fields are required!");
      return;
    }

    if (password !== confirmPassword) {
      alert("Passwords do not match!");
      return;
    }

    try {
      const response = await fetch(`${API_URL}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, age, username, password }),
      });

      const data = await response.json();
      if (response.ok) {
        alert("Registration successful! Please log in.");
        showLogin(); // Switch to login form
      } else {
        alert(data.message || "Registration failed!");
      }
    } catch (error) {
      alert("Error registering user!");
    }
  });

// User Login
document
  .querySelector("#loginCard .user-profile")
  .addEventListener("click", async () => {
    const username = document.getElementById("login_username").value.trim();
    const password = document.getElementById("login_password").value;

    // Basic validation
    if (!username || !password) {
      alert("Username and Password are required!");
      return;
    }

    try {
      const response = await fetch(`${API_URL}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();
      if (response.ok) {
        localStorage.setItem("token", data.token); // Store token in localStorage
        localStorage.setItem("username", username); // Store username for later use
        window.location.href = "home.html"; // Redirect to home page
      } else {
        alert(data.message || "Invalid username or password!");
      }
    } catch (error) {
      alert("Error logging in!");
    }
  });
