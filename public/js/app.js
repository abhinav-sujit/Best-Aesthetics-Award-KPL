// Main Application Logic for KlimArt Premiere League
// Best Aesthetics Award - January 2026
// Version 1.0 - Local Testing with Authentication

// Current state
let currentUser = null;
let isAdmin = false;

// DOM Elements - Login
const loginSection = document.getElementById('login-section');
const employeeLoginCard = document.getElementById('employee-login-card');
const adminLoginCard = document.getElementById('admin-login-card');
const employeeLoginForm = document.getElementById('employee-login-form');
const adminLoginForm = document.getElementById('admin-login-form');
const employeeUsername = document.getElementById('employee-username');
const employeePassword = document.getElementById('employee-password');
const adminUsername = document.getElementById('admin-username');
const adminPassword = document.getElementById('admin-password');
const employeeError = document.getElementById('employee-error');
const adminError = document.getElementById('admin-error');
const showAdminLoginBtn = document.getElementById('show-admin-login');
const showEmployeeLoginBtn = document.getElementById('show-employee-login');

// DOM Elements - Voting Section
const votingSection = document.getElementById('voting-section');
const currentUserName = document.getElementById('current-user-name');
const logoutBtn = document.getElementById('logout-btn');
const voteDate = document.getElementById('vote-date');
const voteStatus = document.getElementById('vote-status');
const votingOptions = document.getElementById('voting-options');
const candidatesList = document.getElementById('candidates-list');
const nullVoteBtn = document.getElementById('null-vote-btn');
const progressContainer = document.getElementById('progress-container');
const myVotesList = document.getElementById('my-votes-list');

// DOM Elements - Admin Section
const adminSection = document.getElementById('admin-section');
const adminLogoutBtn = document.getElementById('admin-logout-btn');
const adminDate = document.getElementById('admin-date');
const checkDate = document.getElementById('check-date');
const adminResults = document.getElementById('admin-results');
const overallStandings = document.getElementById('overall-standings');
const tieResolution = document.getElementById('tie-resolution');
const notVotedList = document.getElementById('not-voted-list');
const resetDataBtn = document.getElementById('reset-data-btn');
const exportDataBtn = document.getElementById('export-data-btn');

// Initialize application
async function init() {
    initStorage();
    populateDateSelects();
    setupEventListeners();

    // Check for existing authentication
    const token = getToken();
    const user = getUser();

    if (token && user) {
        try {
            await verifyAuth();
            currentUser = user;
            isAdmin = user.isAdmin;

            if (isAdmin) {
                showSection('admin');
                await updateAdminResults();
                await updateOverallStandings();
                await updateTieResolution();
                await updateNotVotedList();
            } else {
                currentUserName.textContent = user.name;
                showSection('voting');
                await updateVotingUI();
                await updateProgressDisplay();
                await updateDashboard();
            }
        } catch (error) {
            // Token invalid/expired
            logout();
            showSection('login');
        }
    }
}

// Populate all date selects
function populateDateSelects() {
    const dateSelects = [voteDate, adminDate, checkDate];

    for (const select of dateSelects) {
        if (!select) continue;
        select.innerHTML = '';
        for (const date of JANUARY_2026_DATES) {
            const option = document.createElement('option');
            option.value = date;
            option.textContent = formatDate(date);
            select.appendChild(option);
        }
    }

    // Set default to today if in January 2026, otherwise first date
    const today = new Date().toISOString().split('T')[0];
    if (JANUARY_2026_DATES.includes(today)) {
        if (voteDate) voteDate.value = today;
        if (adminDate) adminDate.value = today;
        if (checkDate) checkDate.value = today;
    }
}

// Setup event listeners
function setupEventListeners() {
    // Login toggle buttons
    showAdminLoginBtn.addEventListener('click', () => {
        employeeLoginCard.style.display = 'none';
        adminLoginCard.style.display = 'block';
        clearLoginErrors();
    });

    showEmployeeLoginBtn.addEventListener('click', () => {
        adminLoginCard.style.display = 'none';
        employeeLoginCard.style.display = 'block';
        clearLoginErrors();
    });

    // Login forms
    employeeLoginForm.addEventListener('submit', handleEmployeeLogin);
    adminLoginForm.addEventListener('submit', handleAdminLogin);

    // Logout buttons
    logoutBtn.addEventListener('click', handleLogout);
    adminLogoutBtn.addEventListener('click', handleLogout);

    // Voting
    voteDate.addEventListener('change', updateVotingUI);
    nullVoteBtn.addEventListener('click', handleNullVote);

    // Admin
    adminDate.addEventListener('change', updateAdminResults);
    checkDate.addEventListener('change', updateNotVotedList);
    resetDataBtn.addEventListener('click', handleResetData);
    exportDataBtn.addEventListener('click', handleExportData);

    // Password toggle buttons
    document.querySelectorAll('.toggle-password').forEach(btn => {
        btn.addEventListener('click', function() {
            const targetId = this.getAttribute('data-target');
            const input = document.getElementById(targetId);
            if (input.type === 'password') {
                input.type = 'text';
                this.textContent = 'Hide';
            } else {
                input.type = 'password';
                this.textContent = 'Show';
            }
        });
    });

    // Tab switching for voting section
    votingSection.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', () => switchTab(btn.dataset.tab, 'voting'));
    });

    // Tab switching for admin section
    adminSection.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', () => switchTab(btn.dataset.tab, 'admin'));
    });
}

// Clear login error messages
function clearLoginErrors() {
    employeeError.style.display = 'none';
    adminError.style.display = 'none';
    employeeError.textContent = '';
    adminError.textContent = '';
}

// Show error message
function showError(element, message) {
    element.textContent = message;
    element.style.display = 'block';
}

// Handle employee login
async function handleEmployeeLogin(e) {
    e.preventDefault();
    clearLoginErrors();

    const username = employeeUsername.value.trim();
    const password = employeePassword.value;

    if (!username || !password) {
        showError(employeeError, 'Please enter both username and password');
        return;
    }

    try {
        const result = await login(username, password);

        if (result.success && !result.user.isAdmin) {
            currentUser = result.user;
            isAdmin = false;
            currentUserName.textContent = currentUser.name;
            showSection('voting');
            await updateVotingUI();
            await updateProgressDisplay();
            await updateDashboard();
            // Clear form
            employeeLoginForm.reset();
        } else if (result.user && result.user.isAdmin) {
            showError(employeeError, 'Please use admin login.');
        }
    } catch (error) {
        showError(employeeError, error.message);
    }
}

// Handle admin login
async function handleAdminLogin(e) {
    e.preventDefault();
    clearLoginErrors();

    const username = adminUsername.value.trim();
    const password = adminPassword.value;

    if (!username || !password) {
        showError(adminError, 'Please enter both username and password');
        return;
    }

    try {
        const result = await login(username, password);

        if (result.success && result.user.isAdmin) {
            currentUser = result.user;
            isAdmin = true;
            showSection('admin');
            await updateAdminResults();
            await updateOverallStandings();
            await updateTieResolution();
            await updateNotVotedList();
            // Clear form
            adminLoginForm.reset();
        } else if (result.user && !result.user.isAdmin) {
            showError(adminError, 'Invalid admin credentials.');
        }
    } catch (error) {
        showError(adminError, error.message);
    }
}

// Handle logout
function handleLogout() {
    currentUser = null;
    isAdmin = false;
    showSection('login');
    // Show employee login by default
    employeeLoginCard.style.display = 'block';
    adminLoginCard.style.display = 'none';
    clearLoginErrors();
}

// Show specific section
function showSection(section) {
    loginSection.classList.add('hidden');
    votingSection.classList.add('hidden');
    adminSection.classList.add('hidden');

    switch (section) {
        case 'login':
            loginSection.classList.remove('hidden');
            break;
        case 'voting':
            votingSection.classList.remove('hidden');
            break;
        case 'admin':
            adminSection.classList.remove('hidden');
            break;
    }
}

// Switch tabs within a section
async function switchTab(tab, section) {
    if (section === 'voting') {
        // Update tab buttons
        votingSection.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
        votingSection.querySelector(`[data-tab="${tab}"]`).classList.add('active');

        // Update tab content
        document.getElementById('vote-tab').classList.remove('active');
        document.getElementById('dashboard-tab').classList.remove('active');
        document.getElementById('progress-tab').classList.remove('active');
        document.getElementById('standings-tab').classList.remove('active');
        document.getElementById(`${tab}-tab`).classList.add('active');

        // Update data
        if (tab === 'vote') await updateVotingUI();
        else if (tab === 'dashboard') await updateDashboard();
        else if (tab === 'progress') await updateProgressDisplay();
        else if (tab === 'standings') await updateEmployeeStandings();

    } else if (section === 'admin') {
        // Update tab buttons
        adminSection.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
        adminSection.querySelector(`[data-tab="${tab}"]`).classList.add('active');

        // Update tab content
        document.getElementById('admin-results-tab').classList.remove('active');
        document.getElementById('admin-standings-tab').classList.remove('active');
        document.getElementById('admin-ties-tab').classList.remove('active');
        document.getElementById('admin-data-tab').classList.remove('active');
        document.getElementById(`${tab}-tab`).classList.add('active');

        // Update data
        if (tab === 'admin-results') updateAdminResults();
        else if (tab === 'admin-standings') updateOverallStandings();
        else if (tab === 'admin-ties') updateTieResolution();
        else if (tab === 'admin-data') updateNotVotedList();
    }
}

// Update voting UI based on selected date
async function updateVotingUI() {
    if (!currentUser) return;

    const selectedDate = voteDate.value;
    const hasVoted = await hasUserVoted(currentUser.id, selectedDate);

    if (hasVoted) {
        const vote = await getUserVote(currentUser.id, selectedDate);
        const votedForName = vote.votedFor === null
            ? 'NULL Vote (no one selected)'
            : (await getEmployeeById(vote.votedFor)).name;

        voteStatus.innerHTML = `<strong>You have already voted for this date.</strong><br>Your vote: <strong>${votedForName}</strong>`;
        voteStatus.className = 'vote-status voted';
        votingOptions.style.display = 'none';
    } else {
        voteStatus.innerHTML = '<strong>You have not voted for this date yet.</strong> Select someone below to cast your vote.';
        voteStatus.className = 'vote-status not-voted';
        votingOptions.style.display = 'block';
        await renderCandidates();
    }
}

// Render candidate buttons
async function renderCandidates() {
    candidatesList.innerHTML = '';

    const employees = await loadEmployees();

    for (const emp of employees) {
        const btn = document.createElement('button');
        btn.className = 'candidate-btn';
        if (emp.id === currentUser.id) {
            btn.className += ' self';
            btn.textContent = `${emp.name} (Yourself)`;
        } else {
            btn.textContent = emp.name;
        }
        btn.addEventListener('click', () => handleVote(emp.id));
        candidatesList.appendChild(btn);
    }
}

// Handle vote for a candidate
async function handleVote(candidateId) {
    const selectedDate = voteDate.value;
    const candidate = await getEmployeeById(candidateId);

    const confirmMsg = candidateId === currentUser.id
        ? `Are you sure you want to vote for yourself?\n\nThis vote CANNOT be changed once submitted.`
        : `Are you sure you want to vote for ${candidate.name}?\n\nThis vote CANNOT be changed once submitted.`;

    if (confirm(confirmMsg)) {
        const result = await castVote(currentUser.id, selectedDate, candidateId);
        if (result.success) {
            alert('Vote cast successfully!');
            await updateVotingUI();
            await updateDashboard();
            await updateProgressDisplay();
        } else {
            alert(result.message);
        }
    }
}

// Handle NULL vote
async function handleNullVote() {
    const selectedDate = voteDate.value;

    const confirmMsg = `Are you sure you want to cast a NULL vote?\n\nThis means you're choosing not to vote for anyone today.\nYour NULL vote will count as "having voted" but won't count toward anyone's total.\n\nThis vote CANNOT be changed once submitted.`;

    if (confirm(confirmMsg)) {
        const result = await castVote(currentUser.id, selectedDate, null);
        if (result.success) {
            alert('NULL vote cast successfully!');
            await updateVotingUI();
            await updateDashboard();
            await updateProgressDisplay();
        } else {
            alert(result.message);
        }
    }
}

// Update progress display
async function updateProgressDisplay() {
    progressContainer.innerHTML = '';
    const allProgress = await getAllVotingProgress();

    for (const date of JANUARY_2026_DATES) {
        const progress = allProgress[date];
        const isComplete = progress.voted === progress.total;

        const item = document.createElement('div');
        item.className = 'progress-item';
        item.innerHTML = `
            <div class="progress-label">
                <span>${formatDate(date)}</span>
                <span>${progress.voted}/${progress.total} votes</span>
            </div>
            <div class="progress-bar-bg">
                <div class="progress-bar ${isComplete ? 'complete' : ''}" style="width: ${progress.percentage}%">
                    ${progress.percentage}%
                </div>
            </div>
        `;
        progressContainer.appendChild(item);
    }
}

// Update dashboard with user's voting history
async function updateDashboard() {
    if (!currentUser) return;

    myVotesList.innerHTML = '';

    for (const date of JANUARY_2026_DATES) {
        const vote = await getUserVote(currentUser.id, date);
        const item = document.createElement('div');
        item.className = 'vote-item';

        let voteDisplay;
        if (vote) {
            if (vote.votedFor === null) {
                voteDisplay = '<span class="vote-choice null-vote">NULL Vote</span>';
            } else {
                const votedFor = getEmployeeById(vote.votedFor);
                voteDisplay = `<span class="vote-choice">${votedFor.name}</span>`;
            }
        } else {
            voteDisplay = '<span class="no-vote">Not voted yet</span>';
        }

        item.innerHTML = `
            <span class="vote-date">${formatDate(date)}</span>
            ${voteDisplay}
        `;
        myVotesList.appendChild(item);
    }
}

// Update admin results display
async function updateAdminResults() {
    const selectedDate = adminDate.value;
    const resultData = await getResultsForDate(selectedDate);
    const { results, nullVotes, totalVotes, totalEmployees } = resultData;
    const tieCheck = await checkForTies(selectedDate);
    const tieResolution = resultData.tieResolution;

    adminResults.innerHTML = '';

    // Show voting summary
    const summary = document.createElement('div');
    summary.className = 'result-summary';
    summary.innerHTML = `
        <p><strong>Total Votes Cast:</strong> ${totalVotes}/${totalEmployees}</p>
        <p><strong>NULL Votes:</strong> ${nullVotes}</p>
        <p><strong>Actual Votes:</strong> ${totalVotes - nullVotes}</p>
    `;
    adminResults.appendChild(summary);

    // Show results
    if (totalVotes === 0) {
        adminResults.innerHTML += '<p style="color: #666; margin-top: 20px;">No votes cast for this date yet.</p>';
        return;
    }

    const resultsTitle = document.createElement('h3');
    resultsTitle.textContent = 'Vote Distribution';
    resultsTitle.style.marginTop = '30px';
    resultsTitle.style.marginBottom = '15px';
    adminResults.appendChild(resultsTitle);

    for (const result of results) {
        if (result.votes === 0) continue; // Skip zero votes

        const item = document.createElement('div');
        item.className = 'result-item';

        // Determine if this is a winner or tied
        const isTop = result.votes === results[0].votes && result.votes > 0;
        const isResolvedWinner = tieResolution && tieResolution.winnerId === result.id;

        if (isResolvedWinner) {
            item.className += ' winner';
        } else if (tieCheck.hasTie && isTop && !tieResolution) {
            item.className += ' tie';
        } else if (isTop && !tieCheck.hasTie) {
            item.className += ' winner';
        }

        item.innerHTML = `
            <span class="result-name">
                ${result.name}
                ${isResolvedWinner ? ' (Winner - Tie Resolved)' : ''}
                ${tieCheck.hasTie && isTop && !tieResolution ? ' (Tied)' : ''}
            </span>
            <span class="result-votes">${result.votes} vote${result.votes !== 1 ? 's' : ''}</span>
        `;
        adminResults.appendChild(item);
    }
}

// Update overall standings
async function updateOverallStandings() {
    const data = await getOverallStandings();
    const standings = data.standings || [];
    const dailyWinners = data.dailyWinners || [];
    const totalVotes = data.totalVotes || [];

    overallStandings.innerHTML = '';

    // 1. OVERALL WINNER DISPLAY
    if (standings.length > 0 && standings[0].wins > 0) {
        const topWinner = standings[0];
        const topVotes = totalVotes.find(tv => tv.id === topWinner.id);
        const totalVotesReceived = topVotes ? topVotes.totalVotes : 0;
        const employees = await loadEmployees();
        const maxPossibleVotes = 21 * employees.length; // 21 voting dates

        const winnerCard = document.createElement('div');
        winnerCard.className = 'overall-winner-card';
        winnerCard.innerHTML = `
            <div class="trophy-icon">🏆</div>
            <h2 class="winner-title">OVERALL WINNER</h2>
            <div class="winner-name">${topWinner.name}</div>
            <div class="winner-stats">
                <div class="stat-item">
                    <span class="stat-label">Total Wins</span>
                    <span class="stat-value">${topWinner.wins}</span>
                </div>
                <div class="stat-item">
                    <span class="stat-label">Total Votes Received</span>
                    <span class="stat-value">${totalVotesReceived} / ${maxPossibleVotes}</span>
                </div>
            </div>
        `;
        overallStandings.appendChild(winnerCard);

        const separator = document.createElement('div');
        separator.className = 'standings-separator';
        overallStandings.appendChild(separator);
    }

    // 2. DAILY WINNERS TABLE
    const dailyTitle = document.createElement('h3');
    dailyTitle.textContent = 'Daily Winners';
    dailyTitle.style.marginTop = '30px';
    dailyTitle.style.marginBottom = '15px';
    overallStandings.appendChild(dailyTitle);

    const dailyTable = document.createElement('div');
    dailyTable.className = 'daily-winners-table';

    if (dailyWinners.length === 0) {
        dailyTable.innerHTML = '<p style="color: #666;">No daily winners yet.</p>';
    } else {
        for (const dw of dailyWinners) {
            const item = document.createElement('div');
            item.className = 'daily-winner-item';
            const dateObj = new Date(dw.date + 'T00:00:00');
            const formattedDate = dateObj.toLocaleDateString('en-US', {
                weekday: 'short',
                month: 'short',
                day: 'numeric'
            });
            item.innerHTML = `
                <span class="daily-winner-date">${formattedDate}</span>
                <span class="daily-winner-name">${dw.winnerName}</span>
            `;
            dailyTable.appendChild(item);
        }
    }
    overallStandings.appendChild(dailyTable);

    // 3. WINS SUMMARY TABLE
    const summaryTitle = document.createElement('h3');
    summaryTitle.textContent = 'Wins Summary';
    summaryTitle.style.marginTop = '30px';
    summaryTitle.style.marginBottom = '15px';
    overallStandings.appendChild(summaryTitle);

    const summaryTable = document.createElement('div');
    summaryTable.className = 'wins-summary-table';

    if (standings.every(s => s.wins === 0)) {
        summaryTable.innerHTML = '<p style="color: #666;">No winners declared yet.</p>';
    } else {
        const withWins = standings.filter(s => s.wins > 0);

        for (const standing of withWins) {
            const item = document.createElement('div');
            item.className = 'wins-summary-item';

            const rank = withWins.findIndex(s => s.id === standing.id) + 1;
            let rankClass = '';
            if (rank === 1) rankClass = 'gold';
            else if (rank === 2) rankClass = 'silver';
            else if (rank === 3) rankClass = 'bronze';

            const totalVotesForEmployee = totalVotes.find(tv => tv.id === standing.id);
            const votes = totalVotesForEmployee ? totalVotesForEmployee.totalVotes : 0;

            item.innerHTML = `
                <div class="summary-rank ${rankClass}">${rank}</div>
                <div class="summary-info">
                    <span class="summary-name">${standing.name}</span>
                    <span class="summary-stats">${standing.wins} win${standing.wins !== 1 ? 's' : ''} | ${votes} total votes</span>
                </div>
            `;
            summaryTable.appendChild(item);
        }
    }
    overallStandings.appendChild(summaryTable);
}

// Update tie resolution UI
async function updateTieResolution() {
    const unresolvedTies = await getUnresolvedTiesData();
    tieResolution.innerHTML = '';

    if (unresolvedTies.length === 0) {
        tieResolution.innerHTML = '<p style="color: #666;">No unresolved ties at this time.</p>';
        return;
    }

    for (const tie of unresolvedTies) {
        const item = document.createElement('div');
        item.className = 'tie-item';

        const candidatesHtml = tie.candidates.map(c =>
            `<button class="tie-candidate-btn" data-date="${tie.date}" data-id="${c.id}">
                ${c.name} (${c.votes} votes)
            </button>`
        ).join('');

        item.innerHTML = `
            <div class="tie-date">${formatDate(tie.date)} - Tie between ${tie.candidates.length} candidates</div>
            <div class="tie-candidates">${candidatesHtml}</div>
        `;
        tieResolution.appendChild(item);
    }

    // Add click handlers for tie resolution
    document.querySelectorAll('.tie-candidate-btn').forEach(btn => {
        btn.addEventListener('click', async () => {
            const date = btn.dataset.date;
            const winnerId = parseInt(btn.dataset.id);
            const winner = await getEmployeeById(winnerId);

            if (confirm(`Are you sure you want to declare ${winner.name} as the winner for ${formatDate(date)}?\n\nThis action cannot be undone.`)) {
                await resolveTie(date, winnerId);
                await updateTieResolution();
                await updateOverallStandings();
                await updateAdminResults();
            }
        });
    });
}

// Update who hasn't voted list
async function updateNotVotedList() {
    const selectedDate = checkDate.value;
    const voteData = await getVotesForDate(selectedDate);
    const notVoted = voteData.notVoted || [];

    notVotedList.innerHTML = '';

    if (notVoted.length === 0) {
        notVotedList.innerHTML = '<p style="color: #28a745; font-weight: 600;">Everyone has voted for this date!</p>';
        return;
    }

    notVotedList.innerHTML = `<p style="margin-bottom: 15px;"><strong>${notVoted.length}</strong> people haven't voted yet:</p>`;

    for (const person of notVoted) {
        const item = document.createElement('div');
        item.className = 'vote-item';
        item.innerHTML = `
            <span class="vote-date">${person.name}</span>
            <span class="no-vote">Not voted</span>
        `;
        notVotedList.appendChild(item);
    }
}

// Handle data reset
function handleResetData() {
    if (confirm('Are you sure you want to reset ALL voting data?\n\nThis will permanently delete all votes and tie resolutions.\nThis action cannot be undone!')) {
        if (confirm('FINAL WARNING: Type OK in the next prompt to confirm complete data reset.')) {
            const userInput = prompt('Type "RESET" to confirm:');
            if (userInput === 'RESET') {
                resetAllData();
                alert('All data has been reset.');
                updateAdminResults();
                updateOverallStandings();
                updateTieResolution();
                updateNotVotedList();
            } else {
                alert('Reset cancelled. Data was NOT deleted.');
            }
        }
    }
}

// Handle data export
async function handleExportData() {
    const data = await exportDataAPI();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = `klimart_kpl_bestaesthetics_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    alert('Data exported successfully!');
}

// Update employee overall standings view
async function updateEmployeeStandings() {
    const container = document.getElementById('employee-standings');
    if (!container) return;

    try {
        const data = await getPublicStandings();
        const standings = data.standings || [];
        const dailyWinners = data.dailyWinners || [];
        const totalVotes = data.totalVotes || [];

        // Clear container
        container.innerHTML = '';

        // 1. Overall Winner Card
        if (standings.length > 0 && standings[0].wins > 0) {
            const winner = standings[0];
            const winnerVotes = totalVotes.find(v => v.id === winner.id)?.totalVotes || 0;
            const allProgress = await getAllVotingProgress();
            const totalEmployees = Object.keys(allProgress).length > 0 ? allProgress[Object.keys(allProgress)[0]].total : 19;
            const maxVotes = dailyWinners.length * totalEmployees;

            container.innerHTML = `
                <div class="overall-winner-card">
                    <div class="trophy-icon">🏆</div>
                    <div class="winner-info">
                        <div class="winner-label">OVERALL WINNER</div>
                        <div class="winner-name">${winner.name}</div>
                        <div class="winner-stats">
                            <div class="stat">
                                <div class="stat-label">TOTAL WINS</div>
                                <div class="stat-value">${winner.wins}</div>
                            </div>
                            <div class="stat">
                                <div class="stat-label">TOTAL VOTES RECEIVED</div>
                                <div class="stat-value">${winnerVotes} / ${maxVotes}</div>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        } else {
            container.innerHTML = '<p class="no-data">No winners declared yet.</p>';
        }

        // 2. Daily Winners Table
        if (dailyWinners.length > 0) {
            const dailyWinnersHTML = `
                <div class="standings-section">
                    <h3>Daily Winners</h3>
                    <div class="daily-winners-table">
                        ${dailyWinners.map(winner => `
                            <div class="daily-winner-item">
                                <div class="winner-date">${formatDateDisplay(winner.date)}</div>
                                <div class="winner-employee">${winner.winnerName}</div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            `;
            container.innerHTML += dailyWinnersHTML;
        } else {
            container.innerHTML += '<p class="no-data">No daily winners yet.</p>';
        }

        // 3. Wins Summary Table
        const employeesWithWins = standings.filter(s => s.wins > 0);
        if (employeesWithWins.length > 0) {
            const winsHTML = `
                <div class="standings-section">
                    <h3>Wins Summary</h3>
                    <div class="wins-summary-table">
                        ${employeesWithWins.map((employee, index) => {
                            const empVotes = totalVotes.find(v => v.id === employee.id)?.totalVotes || 0;
                            let rankBadge = '';
                            if (index === 0) rankBadge = '<div class="summary-rank gold">🥇</div>';
                            else if (index === 1) rankBadge = '<div class="summary-rank silver">🥈</div>';
                            else if (index === 2) rankBadge = '<div class="summary-rank bronze">🥉</div>';
                            else rankBadge = `<div class="summary-rank">${index + 1}</div>`;

                            return `
                                <div class="wins-summary-item">
                                    ${rankBadge}
                                    <div class="summary-name">${employee.name}</div>
                                    <div class="summary-stats">
                                        ${employee.wins} wins | ${empVotes} total votes
                                    </div>
                                </div>
                            `;
                        }).join('')}
                    </div>
                </div>
            `;
            container.innerHTML += winsHTML;
        } else {
            container.innerHTML += '<p class="no-data">No winners declared yet.</p>';
        }

    } catch (error) {
        console.error('Error updating employee standings:', error);
        container.innerHTML = '<p class="error-message">Failed to load standings. Please try again.</p>';
    }
}

// Format date for display (e.g., "Mon, Jan 12")
function formatDateDisplay(dateStr) {
    const date = new Date(dateStr + 'T00:00:00');
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${days[date.getDay()]}, ${months[date.getMonth()]} ${date.getDate()}`;
}

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', init);
