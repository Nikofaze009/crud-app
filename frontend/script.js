import API_BASE_URL from './config.js';

const form = document.getElementById("userForm");
const message = document.getElementById("message");
console.log("🔥 script.js loaded");

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const name = document.getElementById("name").value.trim();
  const dob = document.getElementById("dob").value;
  const email = document.getElementById("email").value.trim();
  const mobile = document.getElementById("mobile").value.trim();
  const photo = document.getElementById("photo").files[0];

  // 🔴 Client-side validation
  if (!name || !dob || !email || !mobile || !photo) {
    showMessage("All fields are required", "error");
    return;
  }

  if (!/^\S+@\S+\.\S+$/.test(email)) {
    showMessage("Invalid email format", "error");
    return;
  }

  if (mobile.length !== 10 || isNaN(mobile)) {
    showMessage("Mobile number must be 10 digits", "error");
    return;
  }

  // 🟢 FormData for file upload
  const formData = new FormData();
  formData.append("name", name);
  formData.append("dob", dob);
  formData.append("email", email);
  formData.append("mobile", mobile);
  formData.append("photo", photo);

  try {
    const res = await fetch(`${API_BASE_URL}/api/users`, {
      method: "POST",
      body: formData,
    });

    console.log("Response status:", res.status);
    
    // Check if response is JSON
    const contentType = res.headers.get("content-type");
    if (!contentType || !contentType.includes("application/json")) {
      const text = await res.text();
      console.error("Non-JSON response:", text);
      throw new Error("Server returned non-JSON response");
    }
    
    const data = await res.json();
    console.log("Response data:", data);

    if (res.ok) {
       // Save user id (MongoDB uses _id)
       const userId = data._id || data.id;
       console.log("User ID:", userId);
       
       if (userId) {
         localStorage.setItem("userId", userId);
         console.log("Redirecting to dashboard...");
         
         // Redirect immediately to dashboard
         window.location.href = "dashboard.html";
       } else {
         console.error("No user ID in response:", data);
         showMessage("Account created but redirect failed", "error");
       }
    }
    else {
      showMessage(data.message || "Registration failed", "error");
    }
  } catch (err) {
    console.error("Fetch error:", err);
    showMessage("Server error. Please try again.", "error");
  }
});

// Helper function to display messages with animation
function showMessage(text, type) {
  message.textContent = text;
  message.className = `message show ${type}`;
  
  setTimeout(() => {
    message.classList.remove("show");
  }, 5000);
}

// Update file label when file is selected
const photoInput = document.getElementById("photo");
const fileLabel = document.querySelector(".file-text");

photoInput.addEventListener("change", updateFileLabel);

function updateFileLabel() {
  if (photoInput.files.length > 0) {
    fileLabel.textContent = photoInput.files[0].name;
  } else {
    fileLabel.textContent = "Choose a photo";
  }
}


