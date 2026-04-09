const API_URL = 'http://localhost:5000/api';
let contests = [];
let selectedContest = null;
let currentUserContests = [];
let currentUser = null;

// 🔐 Check if user is logged in
function isUserLoggedIn() {
    return !!getToken();
}

// Get logged-in user data
async function getCurrentUser() {
    if (!currentUser && isUserLoggedIn()) {
        try {
            const token = getToken();
            const response = await fetch(`${API_URL}/auth/profile`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            if (response.ok) {
                currentUser = await response.json();
            }
        } catch (error) {
            console.error('Error fetching user:', error);
        }
    }
    return currentUser;
}

// Get auth token
function getToken() {
    return localStorage.getItem("token");
}

// Load contests from API
async function loadContests() {
    try {
        const response = await fetch(`${API_URL}/contests`);
        if (!response.ok) throw new Error('Failed to fetch contests');
        
        contests = await response.json();
        displayContests();
    } catch (error) {
        console.error('Error loading contests:', error);
        alert('Failed to load contests. Make sure the server is running.');
    }
}

// Load user's own contests
async function loadYourContests() {
    const user = await getCurrentUser();
    if (!user) {
        alert("Unable to load user data. Please login again.");
        window.location.href = "login.html";
        return;
    }

    try {
        const response = await fetch(`${API_URL}/contests`);
        if (!response.ok) throw new Error('Failed to fetch contests');
        
        const allContests = await response.json();
        currentUserContests = allContests.filter(c => c.createdBy._id === user._id);
        displayYourContests();
    } catch (error) {
        console.error('Error loading your contests:', error);
        alert('Failed to load your contests.');
    }
}

// Display your contests
function displayYourContests() {
    const container = document.getElementById("your-contests-list");
    container.innerHTML = "";

    if (currentUserContests.length === 0) {
        container.innerHTML = "<p>You haven't created any contests yet.</p>";
        return;
    }

    currentUserContests.forEach(c => {
        container.innerHTML += `
            <div class="card">
                <h3>${c.title}</h3>
                <p>Theme: ${c.theme}</p>
                <p>Category: ${c.category}</p>
                <p>Max Participants: ${c.maxParticipants || 'Unlimited'}</p>
                <p>Budget: ₹${c.budget}</p>
                <p>Gender: ${c.gender}</p>
                <p>Status: <strong>${c.status}</strong></p>
                <p>Entries: ${c.entries?.length || 0}</p>
                <div class="button-group">
                    <button onclick="viewSubmissions('${c._id}')">📋 View Submissions</button>
                    <button onclick="viewLeaderboard('${c._id}')">🏆 Leaderboard</button>
                    <button onclick="closeContest('${c._id}')">🚫 Close Contest</button>
                </div>
            </div>
        `;
    });
}

// Close contest
async function closeContest(id) {
    const token = getToken();
    if (!token) {
        alert("Login required!");
        return;
    }

    if (!confirm("Are you sure you want to close this contest?")) return;

    try {
        const response = await fetch(`${API_URL}/contests/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ status: 'closed' })
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to close contest');
        }

        alert('Contest closed successfully!');
        loadYourContests();
    } catch (error) {
        console.error('Error closing contest:', error);
        alert('Failed to close contest: ' + error.message);
    }
}

// Display contests
function displayContests() {
    const container = document.getElementById("contest-list");
    container.innerHTML = "";

    if (contests.length === 0) {
        container.innerHTML = "<p>No contests available yet.</p>";
        return;
    }

    contests.forEach(c => {
        container.innerHTML += `
            <div class="card">
                <h3>${c.title}</h3>
                <p>Theme: ${c.theme}</p>
                <p>Category: ${c.category}</p>
                <p>Budget: ₹${c.budget}</p>
                <p>Gender: ${c.gender}</p>
                <p>Created by: ${c.createdBy?.name || 'Unknown'}</p>
                <p>Entries: ${c.entries?.length || 0}</p>

                <button onclick="selectContest('${c._id}')">Select</button>
                <button onclick="viewLeaderboard('${c._id}')">View Leaderboard</button>
            </div>
        `;
    });
}

function showCreate() {
    document.getElementById("main-options").style.display = "none";
    document.getElementById("create-section").style.display = "block";
}

function showJoin() {
    document.getElementById("main-options").style.display = "none";
    document.getElementById("join-section").style.display = "block";
    loadContests(); // load contests when opening
}

function showYourContests() {
    if (!isUserLoggedIn()) {
        alert("Login required!");
        window.location.href = "login.html";
        return;
    }
    document.getElementById("main-options").style.display = "none";
    document.getElementById("your-contests-section").style.display = "block";
    loadYourContests();
}

function goBack() {
    document.getElementById("main-options").style.display = "flex";
    document.getElementById("create-section").style.display = "none";
    document.getElementById("join-section").style.display = "none";
    document.getElementById("your-contests-section").style.display = "none";
}

function goHome() {
    window.location.href = "index.html";
}

// Create contest
async function createContest() {
    if (!isUserLoggedIn()) {
        alert("Login first!");
        window.location.href = "login.html";
        return;
    }

    const token = getToken();
    const title = document.getElementById("contestTitle").value;
    const theme = document.getElementById("theme").value;
    const category = document.getElementById("category").value;
    const budget = document.getElementById("budget").value;
    const gender = document.getElementById("gender").value;
    const maxParticipants = document.getElementById("maxParticipants").value;

    if (!title || !theme || !category || !budget || !gender) {
        alert("Please fill all fields!");
        return;
    }

    try {
        const response = await fetch(`${API_URL}/contests`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                title,
                theme,
                category,
                budget: Number(budget),
                gender,
                maxParticipants: maxParticipants ? Number(maxParticipants) : 999
            })
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to create contest');
        }

        const newContest = await response.json();
        alert('Contest created successfully!');
        
        // Clear form
        document.getElementById("contestTitle").value = '';
        document.getElementById("theme").value = '';
        document.getElementById("category").value = '';
        document.getElementById("budget").value = '';
        document.getElementById("gender").value = '';
        document.getElementById("maxParticipants").value = '999';
        
        goBack();
        loadContests();
    } catch (error) {
        console.error('Error creating contest:', error);
        alert('Failed to create contest: ' + error.message);
    }
}

// Select contest
function selectContest(id) {
    if (!isUserLoggedIn()) {
        alert("Login required!");
        window.location.href = "login.html";
        return;
    }

    selectedContest = id;
    alert("Contest selected! You can now submit an entry.");
}

// Submit entry
async function submitEntry() {
    if (!isUserLoggedIn()) {
        alert("Login required!");
        window.location.href = "login.html";
        return;
    }

    const token = getToken();

    if (!selectedContest) {
        alert("Please select a contest first!");
        return;
    }

    const file = document.getElementById("imageUpload").files[0];
    const productLinks = document.getElementById("productLinks").value;

    if (!file || !productLinks) {
        alert("Please upload an image and add product links!");
        return;
    }

    try {
        const reader = new FileReader();

        reader.onload = async function () {
            try {
                const response = await fetch(`${API_URL}/contests/${selectedContest}/entries`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({
                        image: reader.result,
                        productLinks: productLinks.split(",").map(link => link.trim())
                    })
                });

                if (!response.ok) {
                    const error = await response.json();
                    throw new Error(error.message || 'Failed to submit entry');
                }

                alert('Entry submitted successfully!');
                
                // Clear form
                document.getElementById("imageUpload").value = '';
                document.getElementById("productLinks").value = '';
                selectedContest = null;
                
                loadContests();
            } catch (error) {
                console.error('Error submitting entry:', error);
                alert('Failed to submit entry: ' + error.message);
            }
        };

        reader.readAsDataURL(file);
    } catch (error) {
        console.error('Error reading file:', error);
        alert('Failed to read file');
    }
}

// View leaderboard
async function viewLeaderboard(id) {
    if (!id) {
        alert("Please select a contest first!");
        return;
    }

    try {
        const response = await fetch(`${API_URL}/contests/${id}/leaderboard`);
        if (!response.ok) throw new Error('Failed to fetch leaderboard');
        
        const entries = await response.json();
        const contestResponse = await fetch(`${API_URL}/contests/${id}`);
        const contest = await contestResponse.json();

        const container = document.getElementById("leaderboard");
        container.innerHTML = `<h3>${contest.title} - Leaderboard</h3>`;

        if (entries.length === 0) {
            container.innerHTML += "<p>No entries yet.</p>";
            return;
        }

        let leaderboardHTML = `<table>
            <thead>
                <tr>
                    <th>Rank</th>
                    <th>Username</th>
                    <th>Preview</th>
                    <th>Links</th>
                    <th>Votes</th>
                    <th>Action</th>
                </tr>
            </thead>
            <tbody>`;

        entries.forEach((e, index) => {
            const links = e.productLinks ? e.productLinks.map(p => `<a href="${p}" target="_blank" class="link-btn">${p.substring(0, 20)}...</a>`).join("<br>") : '<p>No links</p>';
            leaderboardHTML += `
                <tr>
                    <td><strong>#${index + 1}</strong></td>
                    <td>${e.username || 'Anonymous'}</td>
                    <td><img src="${e.image}" style="width: 80px; height: 80px; object-fit: cover; border-radius: 8px;"></td>
                    <td>${links}</td>
                    <td><strong>${e.votes || 0} 👍</strong></td>
                    <td><button onclick="vote('${id}', ${index})">Vote</button></td>
                </tr>
            `;
        });

        leaderboardHTML += `</tbody></table>`;
        container.innerHTML += leaderboardHTML;
    } catch (error) {
        console.error('Error fetching leaderboard:', error);
        alert('Failed to load leaderboard: ' + error.message);
    }
}

// Vote
async function vote(contestId, entryIndex) {
    if (!isUserLoggedIn()) {
        alert("Login to vote!");
        window.location.href = "login.html";
        return;
    }

    const token = getToken();

    try {
        const response = await fetch(`${API_URL}/contests/${contestId}/vote`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                entryIndex: entryIndex
            })
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to vote');
        }

        alert('Vote recorded successfully!');
        viewLeaderboard(contestId);
    } catch (error) {
        console.error('Error voting:', error);
        alert('Failed to vote: ' + error.message);
    }
}

// Close contest
async function closeContest(id) {
    if (!isUserLoggedIn()) {
        alert("Login required!");
        return;
    }

    const token = getToken();

    if (!confirm("Are you sure you want to close this contest?")) return;

    try {
        const response = await fetch(`${API_URL}/contests/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ status: 'closed' })
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to close contest');
        }

        alert('Contest closed successfully!');
        loadYourContests();
    } catch (error) {
        console.error('Error closing contest:', error);
        alert('Failed to close contest: ' + error.message);
    }
}

// View all submissions for a contest
async function viewSubmissions(contestId) {
    if (!isUserLoggedIn()) {
        alert("Login required!");
        return;
    }

    const token = getToken();
    try {
        const response = await fetch(`${API_URL}/contests/${contestId}/submissions`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to fetch submissions');
        }

        const submissions = await response.json();
        showSubmissionsModal(contestId, submissions);
    } catch (error) {
        console.error('Error fetching submissions:', error);
        alert('Failed to view submissions: ' + error.message);
    }
}

// Show submissions in a modal
function showSubmissionsModal(contestId, submissions) {
    const modalHTML = `
        <div class="modal-overlay" id="submissionsModal">
            <div class="modal-content submissions-modal">
                <div class="modal-header">
                    <h2>📋 All Submissions</h2>
                    <button class="close-modal" onclick="document.getElementById('submissionsModal').remove()">✕</button>
                </div>
                <div class="submissions-list">
                    ${submissions.length === 0 ? '<p>No submissions yet.</p>' : 
                      submissions.map((entry, idx) => `
                        <div class="submission-card">
                            <div class="submission-header">
                                <h4>${entry.username}</h4>
                                <span class="rating-badge">⭐ Rating: ${entry.ratingPoints || 0}</span>
                            </div>
                            <img src="${entry.image}" alt="Entry" class="submission-image">
                            <div class="submission-details">
                                <p><strong>Votes:</strong> ${entry.votes || 0}</p>
                                <p><strong>Position:</strong> ${entry.position ? '#' + entry.position : 'Not ranked'}</p>
                                <p><strong>Submitted:</strong> ${new Date(entry.createdAt).toLocaleDateString()}</p>
                            </div>
                            <div class="winner-selection">
                                <label>
                                    <input type="radio" name="first-place" value="${entry._id}" onchange="setWinner('${contestId}', '${entry._id}', 1)">
                                    🥇 1st Place (50 pts)
                                </label>
                                <label>
                                    <input type="radio" name="second-place" value="${entry._id}" onchange="setWinner('${contestId}', '${entry._id}', 2)">
                                    🥈 2nd Place (30 pts)
                                </label>
                                <label>
                                    <input type="radio" name="third-place" value="${entry._id}" onchange="setWinner('${contestId}', '${entry._id}', 3)">
                                    🥉 3rd Place (20 pts)
                                </label>
                            </div>
                        </div>
                      `).join('')}
                </div>
                <div class="modal-actions">
                    <button onclick="submitWinners('${contestId}')" class="btn-primary">🎉 Confirm Winners</button>
                    <button onclick="document.getElementById('submissionsModal').remove()" class="btn-secondary">Cancel</button>
                </div>
            </div>
        </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHTML);
}

// Store winner selections temporarily
let winnerSelections = {};

function setWinner(contestId, entryId, position) {
    if (!winnerSelections[contestId]) {
        winnerSelections[contestId] = {};
    }
    winnerSelections[contestId][position] = entryId;
}

// Submit winners to backend
async function submitWinners(contestId) {
    const token = getToken();
    const selections = winnerSelections[contestId] || {};

    try {
        const response = await fetch(`${API_URL}/contests/${contestId}/select-winners`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                first: selections[1] ? { entryId: selections[1], ratingPoints: 50 } : null,
                second: selections[2] ? { entryId: selections[2], ratingPoints: 30 } : null,
                third: selections[3] ? { entryId: selections[3], ratingPoints: 20 } : null
            })
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to select winners');
        }

        alert('Winners selected successfully! 🎉');
        document.getElementById('submissionsModal').remove();
        loadYourContests();
    } catch (error) {
        console.error('Error selecting winners:', error);
        alert('Failed to select winners: ' + error.message);
    }
}

// Initialize on page load
function initializeContest() {
    loadContests();
    updateNavButtons();
}

window.addEventListener('DOMContentLoaded', initializeContest);
