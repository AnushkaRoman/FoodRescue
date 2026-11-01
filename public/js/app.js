
const API_URL = "/api/donations";

let donations = [];
let editingId = null;

// DOM elements
const donationForm = document.getElementById("donationForm");
const donationList = document.getElementById("donationList");
const formMessage = document.getElementById("formMessage");
const submitBtn = document.getElementById("submitBtn");
const cancelEditBtn = document.getElementById("cancelEditBtn");

// Safely display text received from the API
function escapeHTML(value) {
    return String(value ?? "").replace(/[&<>"']/g, char => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#039;"
    })[char]);
}

// Display notification
function showMessage(message, type = "success") {
    formMessage.className = `alert alert-${type}`;
    formMessage.textContent = message;

    window.scrollTo({
        top: document.getElementById("addDonation").offsetTop - 80,
        behavior: "smooth"
    });
}

// Format date
function formatDate(date) {
    return new Date(date).toLocaleString("en-IN", {
        dateStyle: "medium",
        timeStyle: "short"
    });
}

// API request helper
async function apiRequest(url, options = {}) {
    const response = await fetch(url, {
        ...options,
        headers: {
            "Content-Type": "application/json",
            ...options.headers
        }
    });

    const result = await response.json();

    if (!response.ok) {
        const message = result.errors
            ? result.errors.map(error => error.message).join(", ")
            : result.message || "Something went wrong";

        throw new Error(message);
    }

    return result;
}

// READ: Get all donations
async function loadDonations() {
    document.getElementById("loadingMessage").classList.remove("d-none");

    try {
        const result = await apiRequest(API_URL);
        donations = result.data || [];

        updateDashboard();
        displayDonations();

    } catch (error) {
        donationList.innerHTML = `
            <div class="col-12">
                <div class="alert alert-danger">
                    Unable to load donations: ${escapeHTML(error.message)}
                </div>
            </div>`;

    } finally {
        document.getElementById("loadingMessage").classList.add("d-none");
    }
}

// UPDATE: Dashboard statistics
function updateDashboard() {
    const total = donations.length;

    const meals = donations
        .filter(item => item.status === "Available" && item.unit === "Meals")
        .reduce((sum, item) => sum + Number(item.quantity), 0);

    const collected = donations
        .filter(item => item.status === "Collected")
        .length;

    document.getElementById("totalDonations").textContent = total;
    document.getElementById("availableMeals").textContent = meals;
    document.getElementById("collectedDonations").textContent = collected;
}

// READ: Display donation cards
function displayDonations() {
    const search = document.getElementById("searchInput")
        .value.toLowerCase().trim();

    const category = document.getElementById("categoryFilter").value;
    const status = document.getElementById("statusFilter").value;

    const filtered = donations.filter(item => {
        const matchesSearch =
            item.foodName.toLowerCase().includes(search) ||
            item.donorName.toLowerCase().includes(search) ||
            item.location.toLowerCase().includes(search);

        const matchesCategory =
            !category || item.category === category;

        const matchesStatus =
            !status || item.status === status;

        return matchesSearch && matchesCategory && matchesStatus;
    });

    const emptyMessage = document.getElementById("emptyMessage");

    if (filtered.length === 0) {
        donationList.innerHTML = "";
        emptyMessage.classList.remove("d-none");
        lucide.createIcons();
        return;
    }

    emptyMessage.classList.add("d-none");

    donationList.innerHTML = filtered.map(item => {
        const id = escapeHTML(item._id);
        const currentStatus = escapeHTML(item.status);
        const statusClass = {
            Available: "",
            Claimed: "status-claimed",
            Collected: "status-collected",
            Expired: "status-expired"
        }[item.status] || "";

        let actionButtons = "";

        if (item.status === "Available") {
            actionButtons = `
                <button class="btn btn-green"
                    onclick="claimDonation('${id}')">
                    Claim
                </button>`;
        }

        if (item.status === "Claimed") {
            actionButtons = `
                <button class="btn btn-outline-green"
                    onclick="collectDonation('${id}')">
                    Mark Collected
                </button>`;
        }

        return `
            <div class="col-lg-4 col-md-6">
                <div class="donation-card">

                    <div class="donation-card-top">
                        <span class="food-category">
                            ${escapeHTML(item.category)}
                        </span>

                        <span class="status-badge ${statusClass}">
                            ${currentStatus}
                        </span>
                    </div>

                    <h4>${escapeHTML(item.foodName)}</h4>

                    <p class="donor-name">
                        Donated by ${escapeHTML(item.donorName)}
                    </p>

                    <div class="donation-details">

                        <div class="detail-item">
                            <i data-lucide="package"></i>
                            <span>
                                ${escapeHTML(item.quantity)}
                                ${escapeHTML(item.unit)}
                            </span>
                        </div>

                        <div class="detail-item">
                            <i data-lucide="map-pin"></i>
                            <span>${escapeHTML(item.location)}</span>
                        </div>

                        <div class="detail-item">
                            <i data-lucide="phone"></i>
                            <span>${escapeHTML(item.contact)}</span>
                        </div>

                        <div class="detail-item">
                            <i data-lucide="clock"></i>
                            <span>${escapeHTML(formatDate(item.expiryTime))}</span>
                        </div>

                        ${item.claimedBy ? `
                        <div class="detail-item">
                            <i data-lucide="handshake"></i>
                            <span>${escapeHTML(item.claimedBy)}</span>
                        </div>` : ""}

                    </div>

                    <div class="donation-actions">

                        ${actionButtons}

                        <button class="btn btn-outline-green"
                            onclick="editDonation('${id}')">
                            Edit
                        </button>

                        <button class="btn btn-outline-danger"
                            onclick="deleteDonation('${id}')">
                            Delete
                        </button>

                    </div>
                </div>
            </div>
        `;
    }).join("");

    lucide.createIcons();
}

// CREATE / UPDATE: Submit donation form
donationForm.addEventListener("submit", async function(event) {
    event.preventDefault();

    const expiry = new Date(
        document.getElementById("expiryTime").value
    );

    if (Number.isNaN(expiry.getTime()) || expiry <= new Date()) {
        showMessage("Please select a future expiry date and time.", "danger");
        return;
    }

    const donationData = {
        donorName: document.getElementById("donorName").value.trim(),
        foodName: document.getElementById("foodName").value.trim(),
        category: document.getElementById("category").value,
        quantity: Number(document.getElementById("quantity").value),
        unit: document.getElementById("unit").value,
        location: document.getElementById("location").value.trim(),
        contact: document.getElementById("contact").value.trim(),
        expiryTime: expiry.toISOString()
    };

    submitBtn.disabled = true;

    try {
        if (editingId) {
            // UPDATE
            await apiRequest(`${API_URL}/${editingId}`, {
                method: "PUT",
                body: JSON.stringify(donationData)
            });

            showMessage("Donation updated successfully!");

        } else {
            // CREATE
            await apiRequest(API_URL, {
                method: "POST",
                body: JSON.stringify(donationData)
            });

            showMessage("Food donation added successfully!");
        }

        resetForm();
        await loadDonations();

    } catch (error) {
        showMessage(error.message, "danger");

    } finally {
        submitBtn.disabled = false;
    }
});

// EDIT: Load existing donation into form
function editDonation(id) {
    const item = donations.find(donation => donation._id === id);

    if (!item) return;

    if (item.status !== "Available") {
        alert("Only available donations can be edited.");
        return;
    }

    editingId = id;

    document.getElementById("donorName").value = item.donorName;
    document.getElementById("foodName").value = item.foodName;
    document.getElementById("category").value = item.category;
    document.getElementById("quantity").value = item.quantity;
    document.getElementById("unit").value = item.unit;
    document.getElementById("location").value = item.location;
    document.getElementById("contact").value = item.contact;

    const localDate = new Date(item.expiryTime);
    const offset = localDate.getTimezoneOffset() * 60000;

    document.getElementById("expiryTime").value =
        new Date(localDate.getTime() - offset)
            .toISOString()
            .slice(0, 16);

    document.getElementById("formHeading").textContent =
        "Edit Donation";

    submitBtn.innerHTML = '<i data-lucide="save"></i> Update Donation';
    cancelEditBtn.classList.remove("d-none");

    formMessage.classList.add("d-none");

    lucide.createIcons();

    document.getElementById("addDonation").scrollIntoView({
        behavior: "smooth"
    });
}

// RESET: Clear form
function resetForm() {
    donationForm.reset();
    editingId = null;

    document.getElementById("formHeading").textContent =
        "Add New Donation";

    submitBtn.innerHTML =
        '<i data-lucide="plus-circle"></i> Add Donation';

    cancelEditBtn.classList.add("d-none");
    formMessage.classList.add("d-none");

    lucide.createIcons();
}

// CANCEL EDIT
cancelEditBtn.addEventListener("click", resetForm);

// DELETE: Remove donation
async function deleteDonation(id) {
    const confirmed = confirm(
        "Are you sure you want to delete this donation?"
    );

    if (!confirmed) return;

    try {
        await apiRequest(`${API_URL}/${id}`, {
            method: "DELETE"
        });

        alert("Donation deleted successfully!");

        if (editingId === id) {
            resetForm();
        }

        await loadDonations();

    } catch (error) {
        alert(error.message);
    }
}

// CLAIM: Claim an available donation
async function claimDonation(id) {
    const claimedBy = prompt(
        "Enter your NGO or volunteer name:"
    );

    if (claimedBy === null) return;

    if (!claimedBy.trim()) {
        alert("Please enter your name.");
        return;
    }

    try {
        await apiRequest(`${API_URL}/${id}/status`, {
            method: "PATCH",
            body: JSON.stringify({
                status: "Claimed",
                claimedBy: claimedBy.trim()
            })
        });

        alert("Donation claimed successfully!");
        await loadDonations();

    } catch (error) {
        alert(error.message);
    }
}

// MARK AS COLLECTED
async function collectDonation(id) {
    const confirmed = confirm(
        "Confirm that this donation has been collected?"
    );

    if (!confirmed) return;

    try {
        await apiRequest(`${API_URL}/${id}/status`, {
            method: "PATCH",
            body: JSON.stringify({
                status: "Collected"
            })
        });

        alert("Donation marked as collected!");
        await loadDonations();

    } catch (error) {
        alert(error.message);
    }
}

// SEARCH AND FILTER
document.getElementById("searchInput")
    .addEventListener("input", displayDonations);

document.getElementById("categoryFilter")
    .addEventListener("change", displayDonations);

document.getElementById("statusFilter")
    .addEventListener("change", displayDonations);

// REFRESH
document.getElementById("refreshBtn")
    .addEventListener("click", loadDonations);

// Initial application load
document.addEventListener("DOMContentLoaded", () => {
    lucide.createIcons();
    loadDonations();
});
