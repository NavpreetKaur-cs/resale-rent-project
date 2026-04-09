const API_URL = 'http://localhost:5000/api';
let contests = [];
let selectedContest = null;

// 🔐 Get logged-in user
function getUser() {
    return JSON.parse(localStorage.getItem("currentUser"));
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

function goBack() {
    document.getElementById("main-options").style.display = "flex";
    document.getElementById("create-section").style.display = "none";
    document.getElementById("join-section").style.display = "none";
}

function goHome() {
    window.location.href = "index.html";
}

// Create contest
async function createContest() {
    const user = getUser();
    const token = getToken();

    if (!user || !token) {
        alert("Login first!");
        window.location.href = "login.html";
        return;
    }

    const title = document.getElementById("contestTitle").value;
    const theme = document.getElementById("theme").value;
    const category = document.getElementById("category").value;
    const budget = document.getElementById("budget").value;
    const gender = document.getElementById("gender").value;

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
                gender
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
        
        goBack();
        loadContests();
    } catch (error) {
        console.error('Error creating contest:', error);
        alert('Failed to create contest: ' + error.message);
    }
}

// Select contest
function selectContest(id) {
    if (!getUser()) {
        alert("Login required!");
        window.location.href = "login.html";
        return;
    }

    selectedContest = id;
    alert("Contest selected! You can now submit an entry.");
}

// Submit entry
async function submitEntry() {
    const user = getUser();
    const token = getToken();

    if (!user || !token) {
        alert("Login required!");
        window.location.href = "login.html";
        return;
    }

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

        entries.forEach((e, index) => {
            container.innerHTML += `
                <div class="card">
                    <p><strong>${e.username || 'Anonymous'}</strong></p>
                    <img src="${e.image}" width="100" style="max-height: 150px; object-fit: cover;">
                    
                    <p>Links:</p>
                    ${e.productLinks ? e.productLinks.map(p => `<a href="${p}" target="_blank">${p}</a>`).join("<br>") : '<p>No links</p>'}

                    <p><strong>Votes: ${e.votes || 0}</strong></p>
                    <button onclick="vote('${id}', ${index})">Vote</button>
                </div>
            `;
        });
    } catch (error) {
        console.error('Error fetching leaderboard:', error);
        alert('Failed to load leaderboard: ' + error.message);
    }
}

// Vote
async function vote(contestId, entryIndex) {
    const user = getUser();
    const token = getToken();

    if (!user || !token) {
        alert("Login to vote!");
        window.location.href = "login.html";
        return;
    }

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

// Initialize on page load
window.addEventListener('DOMContentLoaded', loadContests);
