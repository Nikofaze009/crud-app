import API_BASE_URL from './config.js';

// 🔹 Fetch and display all users
let allUsers = [];
let isLoading = false;

function loadUsers() {
  if (isLoading) {
    console.log("Already loading users, skipping...");
    return;
  }
  
  isLoading = true;
  console.log("Loading users...");
  
  fetch(`${API_BASE_URL}/api/users`)
    .then((res) => {
      if (!res.ok) {
        throw new Error("Failed to fetch users");
      }
      return res.json();
    })
    .then((users) => {
      allUsers = users;
      displayUsers(users);
      updateStatistics(users);
      isLoading = false;
      console.log("Users loaded successfully");
    })
    .catch((error) => {
      console.error(error);
      isLoading = false;
      alert("Unable to load users");
    });
}

function updateStatistics(users) {
  // Total users
  document.getElementById('totalUsers').textContent = users.length;
  document.getElementById('userCount').textContent = users.length;
  
  // Calculate new users today
  const today = new Date().toDateString();
  const newToday = users.filter(user => {
    const userDate = new Date(user.createdAt).toDateString();
    return userDate === today;
  }).length;
  document.getElementById('newToday').textContent = newToday;
  
  // Active users (for demo, showing random number)
  document.getElementById('activeUsers').textContent = Math.floor(users.length * 0.7);
  
  // Calculate storage (approximate)
  const storageInBytes = users.length * 150 * 1024; // ~150KB per user
  const storageInMB = (storageInBytes / (1024 * 1024)).toFixed(2);
  document.getElementById('storageUsed').textContent = storageInMB + ' MB';
}

function displayUsers(users) {
  console.log("displayUsers called with", users.length, "users");
  const tbody = document.getElementById("userTableBody");
  const userCount = document.getElementById("userCount");
  
  userCount.textContent = users.length;
  
  if (users.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="5">
          <div class="empty-state">
            <i class="fas fa-users"></i>
            <h3>No Users Found</h3>
            <p>Get started by adding your first user</p>
          </div>
        </td>
      </tr>
    `;
    return;
  }
  
  tbody.innerHTML = users.map(user => `
    <tr>
      <td>
        <img src="/uploads/${user.photo}" 
             alt="${user.name}" 
             class="user-photo"
             loading="lazy"
             onerror="this.style.display='none'; this.parentElement.innerHTML='<div class=\\'user-photo\\' style=\\'background:#e2e8f0;display:flex;align-items:center;justify-content:center;color:#718096;\\'>N/A</div>';" />
      </td>
      <td><span class="user-name">${user.name}</span></td>
      <td><span class="user-email">${user.email}</span></td>
      <td><span class="user-mobile">${user.mobile}</span></td>
      <td>
        <div class="action-buttons">
          <button type="button" class="btn-edit" data-user-id="${user._id}" title="Edit user details">
            <i class="fas fa-edit"></i>
            Edit
          </button>
          <button type="button" class="btn-delete" data-user-id="${user._id}" title="Delete user permanently">
            <i class="fas fa-trash"></i>
            Delete
          </button>
        </div>
      </td>
    </tr>
  `).join('');
  
  // Add event listeners using delegation
  attachTableEventListeners();
}

// 🔹 Open Edit Modal
function openEditModal(userId) {
  const user = allUsers.find(u => u._id === userId);
  if (!user) return;
  
  document.getElementById("editUserId").value = user._id;
  document.getElementById("editName").value = user.name;
  document.getElementById("editDob").value = user.dob.split('T')[0];
  document.getElementById("editEmail").value = user.email;
  document.getElementById("editMobile").value = user.mobile;
  
  const currentPhoto = document.getElementById("currentPhoto");
  currentPhoto.src = `${API_BASE_URL}/uploads/${user.photo}`;
  currentPhoto.style.display = "block";
  
  document.getElementById("editModal").classList.add("show");
}

// 🔹 Close Edit Modal
function closeEditModal() {
  document.getElementById("editModal").classList.remove("show");
  document.getElementById("editForm").reset();
  document.getElementById("editMessage").classList.remove("show");
}

// 🔹 Handle Edit Form Submit
document.getElementById("editForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  e.stopPropagation();
  
  const userId = document.getElementById("editUserId").value;
  const name = document.getElementById("editName").value.trim();
  const dob = document.getElementById("editDob").value;
  const email = document.getElementById("editEmail").value.trim();
  const mobile = document.getElementById("editMobile").value.trim();
  const photo = document.getElementById("editPhoto").files[0];
  
  const formData = new FormData();
  formData.append("name", name);
  formData.append("dob", dob);
  formData.append("email", email);
  formData.append("mobile", mobile);
  if (photo) {
    formData.append("photo", photo);
  }
  
  try {
    const res = await fetch(`${API_BASE_URL}/api/users/${userId}`, {
      method: "PUT",
      body: formData,
    });
    
    const data = await res.json();
    
    if (res.ok) {
      showEditMessage("User updated successfully! ✅", "success");
      setTimeout(() => {
        closeEditModal();
        loadUsers();
      }, 1500);
    } else {
      showEditMessage(data.message || "Update failed", "error");
    }
  } catch (err) {
    console.error("Update error:", err);
    showEditMessage("Server error. Please try again.", "error");
  }
});

function showEditMessage(text, type) {
  const message = document.getElementById("editMessage");
  message.textContent = text;
  message.className = `message show ${type}`;
}

// 🔴 DELETE: Delete user
function deleteUser(userId) {
  if (!confirm("Are you sure you want to delete this user?")) return;

  fetch(`${API_BASE_URL}/api/users/${userId}`, {
    method: "DELETE",
  })
    .then(() => {
      alert("User deleted successfully");
      loadUsers();
    })
    .catch(() => {
      alert("Error deleting user");
    });
}

// 🔹 Add User - redirect to registration
function addUser() {
  window.location.href = "index.html";
}

// 🔹 Attach event listeners using delegation
let tableListenersAttached = false;

function attachTableEventListeners() {
  if (tableListenersAttached) {
    return; // Already attached
  }
  
  const tbody = document.getElementById("userTableBody");
  
  // Use event delegation on tbody
  tbody.addEventListener('click', function(e) {
    const target = e.target.closest('button');
    if (!target) return;
    
    e.preventDefault();
    e.stopPropagation();
    
    const userId = target.getAttribute('data-user-id');
    
    if (target.classList.contains('btn-edit')) {
      openEditModal(userId);
    } else if (target.classList.contains('btn-delete')) {
      deleteUser(userId);
    }
  });
  
  tableListenersAttached = true;
  console.log("Table event listeners attached");
}

// 🔹 File input handler for edit form
document.getElementById("editPhoto").addEventListener("change", function() {
  const fileText = document.querySelector(".edit-file-text");
  if (this.files.length > 0) {
    fileText.textContent = this.files[0].name;
  } else {
    fileText.textContent = "Choose new photo";
  }
});

// Load users on page load
console.log("Dashboard loaded at:", new Date().toISOString());
loadUsers();

// Search functionality
document.getElementById('searchInput').addEventListener('input', function(e) {
  const searchTerm = e.target.value.toLowerCase();
  const filteredUsers = allUsers.filter(user => {
    return user.name.toLowerCase().includes(searchTerm) ||
           user.email.toLowerCase().includes(searchTerm) ||
           user.mobile.includes(searchTerm);
  });
  displayUsers(filteredUsers);
});

// Filter buttons
document.querySelectorAll('.filter-btn').forEach(btn => {
  btn.addEventListener('click', function() {
    document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
    this.classList.add('active');
    
    const filter = this.dataset.filter;
    if (filter === 'all') {
      displayUsers(allUsers);
    } else if (filter === 'recent') {
      const recentUsers = [...allUsers].sort((a, b) => 
        new Date(b.createdAt) - new Date(a.createdAt)
      ).slice(0, 10);
      displayUsers(recentUsers);
    }
  });
});

// Refresh button
document.querySelectorAll('.icon-btn')[0].addEventListener('click', function() {
  this.style.transform = 'rotate(360deg)';
  setTimeout(() => {
    this.style.transform = '';
  }, 600);
  loadUsers();
});

// Export button - Export users to CSV
document.querySelectorAll('.icon-btn')[1].addEventListener('click', function() {
  if (allUsers.length === 0) {
    alert('No users to export!');
    return;
  }
  
  // Create CSV header
  const csvHeader = 'Name,Email,Mobile,Date of Birth,Photo\n';
  
  // Create CSV rows
  const csvRows = allUsers.map(user => {
    const name = `"${user.name.replace(/"/g, '""')}"`;
    const email = `"${user.email.replace(/"/g, '""')}"`;
    const mobile = `"${user.mobile}"`;
    const dob = new Date(user.dob).toLocaleDateString();
    const photo = user.photo;
    
    return `${name},${email},${mobile},${dob},${photo}`;
  }).join('\n');
  
  // Combine header and rows
  const csvContent = csvHeader + csvRows;
  
  // Create blob and download
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', `users_export_${new Date().toISOString().split('T')[0]}.csv`);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  // Show success animation
  this.style.transform = 'scale(0.9)';
  setTimeout(() => {
    this.style.transform = '';
  }, 200);
});

// Detect page unload
window.addEventListener('beforeunload', function(e) {
  console.log("Page is unloading!");
});

// Log any navigation
window.addEventListener('popstate', function(e) {
  console.log("Navigation detected!");
});

// Add user button event listener
document.getElementById('addUserBtn').addEventListener('click', function(e) {
  e.preventDefault();
  e.stopPropagation();
  addUser();
});

// Modal close button listeners
document.getElementById('closeModalBtn').addEventListener('click', function(e) {
  e.preventDefault();
  e.stopPropagation();
  closeEditModal();
});

document.getElementById('cancelModalBtn').addEventListener('click', function(e) {
  e.preventDefault();
  e.stopPropagation();
  closeEditModal();
});

// Close modal when clicking outside
document.getElementById('editModal').addEventListener('click', function(e) {
  if (e.target === this) {
    closeEditModal();
  }
});
