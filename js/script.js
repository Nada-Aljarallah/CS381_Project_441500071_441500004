const baseEventData = [
  {
    id: 'basketball-tournament',
    title: 'Basketball Tournament',
    date: 'May 31, 2026',
    location: 'Main Gym',
    category: 'Sports',
    description: 'Compete with your classmates in a friendly basketball tournament. Teams will be formed on site and prizes awarded to the top performers.'
  },
  {
    id: 'study-skills-workshop',
    title: 'Study Skills Workshop',
    date: 'May 30, 2026',
    location: 'Room 204',
    category: 'Academic',
    description: 'Learn practical study techniques, time management strategies, and exam preparation tips to help you succeed this semester.'
  },
  {
    id: 'campus-movie-night',
    title: 'Campus Movie Night',
    date: 'Jun 5, 2026',
    location: 'Open Lawn',
    category: 'Social',
    description: 'Relax with friends under the stars and watch a popular film. Snacks and drinks will be available for attendees.'
  },
  {
    id: 'cultural-festival',
    title: 'Cultural Festival',
    date: 'Jun 12, 2026',
    location: 'Student Center',
    category: 'Cultural',
    description: 'Celebrate diversity with food, performances, and community booths showcasing different cultures from around the world.'
  },
  {
    id: 'soccer-championship',
    title: 'Soccer Championship',
    date: 'Jun 15, 2026',
    location: 'Sports Field',
    category: 'Sports',
    description: 'Watch or join the soccer championship featuring student teams from across the school. Bring your energy and cheer on your favorites.'
  },
  {
    id: 'career-development-seminar',
    title: 'Career Development Seminar',
    date: 'Jun 18, 2026',
    location: 'Auditorium',
    category: 'Academic',
    description: 'Get career advice from industry experts, learn how to build a strong resume, and practice interview skills in this seminar.'
  }
];
function getAdminEvents() {
  return JSON.parse(localStorage.getItem('adminEvents') || '[]');
}
function getAllEvents() {
  const deletedEventIds = JSON.parse(localStorage.getItem('deletedEventIds') || '[]');
  return [...baseEventData, ...getAdminEvents()].filter(event => !deletedEventIds.includes(event.id));
}
function getStoredUsers() {
  return JSON.parse(localStorage.getItem('users') || '[]');
}
function isAdminAuthenticated() {
  return localStorage.getItem('isAdminAuthenticated') === 'true';
  return sessionStorage.getItem('isAdminAuthenticated') === 'true';
}
function setAdminAuthenticated(isAuthenticated) {
  localStorage.setItem('isAdminAuthenticated', isAuthenticated ? 'true' : 'false');
  sessionStorage.setItem('isAdminAuthenticated', isAuthenticated ? 'true' : 'false');
}
function clearLoginState() {
  localStorage.removeItem('currentUser');
  localStorage.removeItem('selectedEventId');
  localStorage.setItem('isAdminAuthenticated', 'false');
  sessionStorage.setItem('isAdminAuthenticated', 'false');
  localStorage.removeItem('isAdminAuthenticated'); // Clears out the old permanent login
}
function saveUser(userData) {
  const users = getStoredUsers();
  const updatedUsers = users.filter(user => user.studentId !== userData.studentId && user.email !== userData.email);
  updatedUsers.push(userData);
  localStorage.setItem('users', JSON.stringify(updatedUsers));
}
function saveAdminEvent(eventData) {
  const adminEvents = getAdminEvents();
  adminEvents.push(eventData);
  localStorage.setItem('adminEvents', JSON.stringify(adminEvents));
}
function goToEvents() {
  if (getCurrentUser()) {
    window.location.href = 'events.html';
  } else {
    document.getElementById('accountModal').classList.add('active');
  }
}
function handleModalChoice(hasAccount) {
  document.getElementById('accountModal').classList.remove('active');
  if (hasAccount) {
    window.location.href = 'login.html';
  } else {
    window.location.href = 'register.html';
  }
}
function goToLogin() {
  window.location.href = 'login.html';
}
let currentConfirmCallback = null;
function getCurrentUser() {
  const storedUser = localStorage.getItem('currentUser');
  if (storedUser) {
    return JSON.parse(storedUser);
  }
  return null;
}
function postToPhp(url, data) {
  const payload = new FormData();
  Object.entries(data).forEach(([key, value]) => {
    if (value !== null && value !== undefined) {
      payload.append(key, value);
    }
  });
  return fetch(url, {
    method: 'POST',
    body: payload,
    credentials: 'same-origin',
    headers: {
      'X-Requested-With': 'XMLHttpRequest'
    }
  }).then(response => response.text().then(text => {
    let result = null;
    try {
      result = JSON.parse(text);
    } catch (error) {
      result = null;
    }
    if (result) {
      return result;
    }
    if (!response.ok) {
      throw new Error('Server request failed.');
    }
    return null;
  }));
}
function saveUserRegistrationOnServer(formData) {
  return postToPhp('../php/register_process.php', {
    name: formData.name,
    student_id: formData.studentId,
    email: formData.email,
    major: formData.major,
    password: formData.password,
    date_of_birth: formData.dateOfBirth,
    event_id: formData.selectedEventId
  });
}
function saveEventRegistrationOnServer(eventId, user) {
  return postToPhp('../php/register_event.php', {
    event_id: eventId,
    student_id: user ? user.studentId : ''
  });
}
function loginUserOnServer(studentId, password) {
  return postToPhp('../php/login_process.php', {
    student_id: studentId,
    password: password
  });
}
function loginAdminOnServer(employeeId, password) {
  return postToPhp('../php/admin_login.php', {
    employee_id: employeeId,
    password: password
  });
}
function saveAdminEventOnServer(eventData, dateValue) {
  return postToPhp('../php/add_event.php', {
    event_id: eventData.id,
    name: eventData.title,
    date: dateValue,
    location: eventData.location,
    category: eventData.category,
    description: eventData.description
  });
}
function saveAdminUserOnServer(userData) {
  return postToPhp('../php/add_user.php', {
    name: userData.name,
    student_id: userData.studentId,
    email: userData.email,
    major: userData.major,
    password: userData.password,
    date_of_birth: userData.dateOfBirth,
    role: 'user'
  });
}
function initializeLogoutLinks() {
  document.querySelectorAll('a[href$="logout.php"]').forEach(link => {
    if (link.dataset.logoutBound) return;
    link.dataset.logoutBound = 'true';
    link.addEventListener('click', function (e) {
      e.preventDefault();
      clearLoginState();
      window.location.href = 'login.html';
    });
  });
}
function showConfirmModal(message, callback) {
  const modal = document.getElementById('confirmationModal');
  const messageElement = document.getElementById('modalMessage');
  currentConfirmCallback = callback;
  if (messageElement) {
    messageElement.textContent = message;
  }
  if (modal) {
    modal.classList.add('active');
  }
}
function hideConfirmModal() {
  const modal = document.getElementById('confirmationModal');
  if (modal) {
    modal.classList.remove('active');
  }
}
function confirmModalChoice(confirmed) {
  hideConfirmModal();
  if (typeof currentConfirmCallback === 'function') {
    currentConfirmCallback(confirmed);
  }
}
function goToRegister() {
  window.location.href = 'register.html';
}
function registerForEvent(eventId, eventTitle) {
  const currentUser = getCurrentUser();
  if (!currentUser) {
    localStorage.setItem('selectedEventId', eventId);
    showConfirmModal('You need an account before registering for events. Would you like to create one now?', function (confirmed) {
      if (confirmed) {
        window.location.href = 'register.html';
      }
    });
    return;
  }
  showConfirmModal(`Do you want to register for "${eventTitle}"?`, function (confirmed) {
    if (!confirmed) {
      return;
    }
    const registrationData = {
      name: currentUser.name,
      studentId: currentUser.studentId,
      email: currentUser.email,
      major: currentUser.major,
      dateOfBirth: currentUser.dateOfBirth,
      selectedEventId: eventId
    };
    const finishEventRegistration = function () {
      saveRegistration(registrationData);
      showConfirmModal('Registration successful! Redirect to your dashboard?', function (goToDashboard) {
        if (goToDashboard) {
          window.location.href = 'dashboard.html';
        }
      });
    };

    finishEventRegistration();
  });
}
document.addEventListener('DOMContentLoaded', function () {
  initializeLogoutLinks();
  if (document.getElementById('eventsGrid')) {
    renderEventsGrid();
    initializeEventFilters();
    attachEventDetailLinks();
  }
  if (document.getElementById('calendarPage')) {
    initializeCalendarPage();
  }
  if (document.querySelector('.event-details-card')) {
    initializeEventDetailsPage();
  }
  if (document.getElementById('registrationForm')) {
    initializeRegistrationPage();
  }
  if (document.getElementById('dashboardPage')) {
    initializeDashboardPage();
  }
  if (document.getElementById('adminPage')) {
    initializeAdminPage();
  }
  if (document.getElementById('loginForm')) {
    initializeLoginPage();
  }
});
function initializeEventFilters() {
  const searchInput = document.querySelector('.search-input');
  const dateFilter = document.querySelectorAll('.filter-dropdown')[0];
  const categoryFilter = document.querySelectorAll('.filter-dropdown')[1];
  const eventsGrid = document.getElementById('eventsGrid');
  const eventCards = eventsGrid.querySelectorAll('.event-card');
  searchInput.addEventListener('input', function () {
    filterEvents();
  });
  dateFilter.addEventListener('change', function () {
    filterEvents();
  });
  categoryFilter.addEventListener('change', function () {
    filterEvents();
  });
  function filterEvents() {
    const searchTerm = searchInput.value.toLowerCase();
    const selectedDate = dateFilter.value;
    const selectedCategory = categoryFilter.value;
    eventCards.forEach(card => {
      const title = card.querySelector('.event-card-title').textContent.toLowerCase();
      const category = card.dataset.category;
      const date = card.dataset.date;
      const matchesSearch = title.includes(searchTerm);
      const matchesCategory = selectedCategory === 'Category' || category === selectedCategory.toLowerCase();
      let matchesDate = true;
      if (selectedDate !== 'Date') {
        const today = new Date();
        today.setHours(0, 0, 0, 0); // Strip time so today's events are not marked as past
        const eventDate = new Date(date);
        switch (selectedDate) {
          case 'Upcoming':
            matchesDate = eventDate >= today;
            break;
          case 'This Week':
            const weekFromNow = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
            matchesDate = eventDate >= today && eventDate <= weekFromNow;
            break;
          case 'This Month':
            const monthFromNow = new Date(today.getFullYear(), today.getMonth() + 1, today.getDate());
            matchesDate = eventDate >= today && eventDate <= monthFromNow;
            break;
        }
      }
      if (matchesSearch && matchesCategory && matchesDate) {
        card.style.display = 'block';
      } else {
        card.style.display = 'none';
      }
    });
    updateGridLayout();
  }
  function updateGridLayout() {
    const visibleCards = Array.from(eventCards).filter(card => card.style.display !== 'none');
    if (visibleCards.length === 0) {
      if (!document.querySelector('.no-results')) {
        const noResults = document.createElement('div');
        noResults.className = 'no-results';
        noResults.innerHTML = `
          <div style="text-align: center; padding: 40px; color: #7a8da3;">
            <h3>No events found matching your criteria</h3>
            <p>Try adjusting your search or filters</p>
          </div>
        `;
        eventsGrid.appendChild(noResults);
      }
    } else {
      const noResults = document.querySelector('.no-results');
      if (noResults) {
        noResults.remove();
      }
    }
  }
}
function attachEventDetailLinks() {
  const eventCards = document.querySelectorAll('.event-card');
  eventCards.forEach(card => {
    const detailButton = card.querySelector('.event-details-btn');
    const registerButton = card.querySelector('.event-register-btn');
    const eventId = card.dataset.id;
    const eventTitle = card.querySelector('.event-card-title').textContent;
    if (detailButton) {
      detailButton.addEventListener('click', function () {
        const event = getAllEvents().find(e => e.id === eventId);
        showEventDetailsModal(event);
      });
    }
    if (registerButton) {
      registerButton.addEventListener('click', function () {
        registerForEvent(eventId, eventTitle);
      });
    }
  });
}
function initializeEventDetailsPage() {
  const params = new URLSearchParams(window.location.search);
  const eventId = params.get('id');
  const event = getAllEvents().find(item => item.id === eventId);
  if (event) {
    populateEventDetails(event);
  } else {
    displayEventNotFound();
  }
}
function populateEventDetails(event) {
  const titleElement = document.getElementById('detailTitle');
  const dateElement = document.getElementById('detailDate');
  const locationElement = document.getElementById('detailLocation');
  const categoryElement = document.getElementById('detailCategory');
  const descriptionElement = document.getElementById('detailDescription');
  const registerButton = document.getElementById('detailRegisterBtn');
  if (titleElement) {
    titleElement.textContent = event.title;
  }
  if (dateElement) {
    dateElement.textContent = `Date: ${event.date}`;
  }
  if (locationElement) {
    locationElement.textContent = `Location: ${event.location}`;
  }
  if (categoryElement) {
    categoryElement.textContent = `Category: ${event.category}`;
  }
  if (descriptionElement) {
    descriptionElement.textContent = event.description;
  }
  if (registerButton) {
    registerButton.addEventListener('click', function () {
      registerForEvent(event.id, event.title);
    });
  }
}
function displayEventNotFound() {
  const detailsCard = document.querySelector('.event-details-card');
  if (detailsCard) {
    detailsCard.innerHTML = `
      <div style="padding: 40px; text-align: center; color: #4b5c7a;">
        <h2>Event not found</h2>
        <p>Please return to the events page and choose a valid event.</p>
        <button class="event-details-button" onclick="window.location.href='events.html'">Back to Events</button>
      </div>
    `;
  }
}
function initializeRegistrationPage() {
  const selectedEventId = localStorage.getItem('selectedEventId');
  const selectedEventDiv = document.getElementById('selectedEvent');
  const eventTitle = document.getElementById('eventTitle');
  const eventDate = document.getElementById('eventDate');
  const registrationForm = document.getElementById('registrationForm');
  const selectedEventInput = document.getElementById('selectedEventIdInput');
  let selectedEvent = null;
  if (selectedEventId) {
    selectedEvent = getAllEvents().find(item => item.id === selectedEventId);
    if (selectedEvent) {
      selectedEventDiv.style.display = 'block';
      eventTitle.textContent = selectedEvent.title;
      eventDate.textContent = `Date: ${selectedEvent.date}`;
      if (selectedEventInput) {
        selectedEventInput.value = selectedEvent.id;
      }
    } else {
      localStorage.removeItem('selectedEventId');
      if (selectedEventInput) {
        selectedEventInput.value = '';
      }
    }
  }
  registrationForm.addEventListener('submit', function (e) {
    e.preventDefault();
    const formData = {
      name: document.getElementById('userName').value.trim(),
      studentId: document.getElementById('studentId').value.trim(),
      email: document.getElementById('userEmail').value.trim(),
      major: document.getElementById('userMajor').value.trim(),
      password: document.getElementById('userPassword').value,
      dateOfBirth: document.getElementById('userDob').value,
      confirmPassword: document.getElementById('userConfirmPassword') ? document.getElementById('userConfirmPassword').value : null,
      selectedEventId: selectedEvent ? selectedEvent.id : null
    };
    if (!formData.name || !formData.studentId || !formData.email || !formData.major || !formData.password || !formData.dateOfBirth) {
      alert('All fields are required.');
      return;
    }
    if (formData.name.length < 3) {
      alert('Name must be at least 3 characters long.');
      return;
    }
    if (!/^[A-Za-z\s]+$/.test(formData.name)) {
      alert('Name should contain only letters.');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      alert('Please enter a valid email address.');
      return;
    }
    if (formData.password.length < 8) {
      alert('Password must be at least 8 characters long.');
      return;
    }
    if (!/^(?=.*[A-Za-z])(?=.*\d)/.test(formData.password)) {
      alert('Password should include a mix of letters and numbers.');
      return;
    }
    if (formData.confirmPassword !== null && formData.password !== formData.confirmPassword) {
      alert('Passwords do not match.');
      return;
    }
    const finishRegistration = function () {
      const userToStore = {
        name: formData.name,
        studentId: formData.studentId,
        email: formData.email,
        major: formData.major,
        dateOfBirth: formData.dateOfBirth
      };
      localStorage.setItem('currentUser', JSON.stringify(userToStore));
      saveUser(userToStore);
      if (selectedEvent) {
        saveRegistration(formData);
        localStorage.removeItem('selectedEventId');
        showConfirmModal('Registration successful! Continue to your dashboard?', function (confirmed) {
          if (confirmed) {
            window.location.href = 'dashboard.html';
          }
        });
      } else {
        showConfirmModal('Account created successfully! Continue to your dashboard?', function (confirmed) {
          if (confirmed) {
            window.location.href = 'dashboard.html';
          }
        });
      }
    };
    
    // For local frontend testing without a PHP backend, just call finishRegistration() directly:
    finishRegistration();
    
 
  });
}
function saveRegistration(registrationData) {
  const registrations = JSON.parse(localStorage.getItem('registrations') || '[]');
  registrations.push({
    ...registrationData,
    id: Date.now(),
    registeredAt: new Date().toISOString(),
    markedPast: false
  });
  localStorage.setItem('registrations', JSON.stringify(registrations));
}
function initializeLoginPage() {
  const loginForm = document.getElementById('loginForm');
  if (!loginForm) return;

  loginForm.addEventListener('submit', function (e) {
    e.preventDefault();
    const studentId = document.getElementById('loginStudentId').value.trim();
    const password = document.getElementById('loginPassword').value;

    if (!studentId || !password) {
      alert('Please enter both Student ID and password.');
      return;
    }
    const finishLogin = function (user) {
      localStorage.setItem('currentUser', JSON.stringify(user));
      showConfirmModal('Login successful! Go to your dashboard?', function (confirmed) {
        if (confirmed) {
          window.location.href = 'dashboard.html';
        }
      });
    };
    
    // Serverless validation using LocalStorage
    const users = getStoredUsers();
    const foundUser = users.find(u => u.studentId === studentId && u.password === password);
    
    if (foundUser) {
      finishLogin(foundUser);
    } else {
      showConfirmModal('Invalid login credentials. Would you like to create an account now?', function (confirmed) {
        if (confirmed) {
          window.location.href = 'register.html';
        }
      });
    }
  });
}
function initializeDashboardPage() {
  const registrations = JSON.parse(localStorage.getItem('registrations') || '[]');
  const newContainer = document.getElementById('newRegistrations');
  const pastContainer = document.getElementById('pastRegistrations');
  const welcome = document.getElementById('dashboardWelcome');
  if (!newContainer || !pastContainer || !welcome) return;
  const currentUser = getCurrentUser();
  if (!currentUser) {
    window.location.href = 'login.html';
    return;
  }
  welcome.textContent = `Welcome, ${currentUser.name}`;
  const userRegistrations = registrations.filter(
    reg => reg.studentId === currentUser.studentId
  );
  const sortedRegistrations = userRegistrations.slice().sort((a, b) => new Date(b.registeredAt) - new Date(a.registeredAt));
  const today = new Date();
  today.setHours(0, 0, 0, 0); 
  const newRegistrations = [];
  const pastRegistrations = [];
  sortedRegistrations.forEach(reg => {
    const event = getAllEvents().find(item => item.id === reg.selectedEventId);
    const isPastEvent = reg.markedPast || (event ? new Date(event.date) < today : false);
    const targetList = isPastEvent ? pastRegistrations : newRegistrations;
    targetList.push({ ...reg, event });
  });
  renderRegistrations(newContainer, newRegistrations, true);
  renderRegistrations(pastContainer, pastRegistrations, false);
}
function initializeAdminPage() {
  const adminLoginGate = document.getElementById('adminLoginGate');
  const adminContent = document.getElementById('adminContent');
  const adminLoginForm = document.getElementById('adminLoginForm');
  const adminLogoutBtn = document.getElementById('adminLogoutBtn');
  const adminEventsList = document.getElementById('adminEventsList');
  const adminRegistrations = document.getElementById('adminRegistrations');
  const adminUsers = document.getElementById('adminUsers');
  const adminEventForm = document.getElementById('adminEventForm');
  const adminUserForm = document.getElementById('adminUserForm');
  if (adminLoginForm && !adminLoginForm.dataset.bound) {
    adminLoginForm.dataset.bound = 'true';
    adminLoginForm.addEventListener('submit', function (e) {
      e.preventDefault();
      const adminId = document.getElementById('adminId').value.trim();
      const password = document.getElementById('adminPassword').value;
      if (adminId === 'EMP001' && password === 'admin123') {
        setAdminAuthenticated(true);
        adminLoginForm.reset();
        initializeAdminPage();
      } else {
        alert('Invalid admin credentials. Please try again.');
      }
    });
  }
  if (adminLogoutBtn && !adminLogoutBtn.dataset.bound) {
    adminLogoutBtn.dataset.bound = 'true';
    adminLogoutBtn.addEventListener('click', function () {
      setAdminAuthenticated(false);
      initializeAdminPage();
    });
  }
  if (adminLoginGate && adminContent) {
    const hasAccess = isAdminAuthenticated();
    adminLoginGate.style.display = hasAccess ? 'none' : 'block';
    adminContent.style.display = hasAccess ? 'block' : 'none';
    if (!hasAccess) {
      return;
    }
  }
  if (!adminEventsList || !adminRegistrations || !adminUsers) return;
  const registrations = JSON.parse(localStorage.getItem('registrations') || '[]');
  const totalEvents = document.getElementById('adminTotalEvents');
  const totalUsers = document.getElementById('adminTotalUsers');
  const totalRegistrations = document.getElementById('adminTotalRegistrations');
  initializeAdminTabs();
  if (totalEvents) {
    totalEvents.textContent = String(getAllEvents().length);
  }
  if (totalRegistrations) {
    totalRegistrations.textContent = String(registrations.length);
  }
  const usersMap = new Map();
  registrations.forEach(reg => {
    const key = reg.studentId || reg.email || reg.name;
    if (!usersMap.has(key)) {
      usersMap.set(key, {
        name: reg.name || 'Unknown User',
        studentId: reg.studentId || 'N/A',
        email: reg.email || 'N/A',
        major: reg.major || 'N/A'
      });
    }
  });
  const currentUser = getCurrentUser();
  if (currentUser) {
    const currentKey = currentUser.studentId || currentUser.email || currentUser.name;
    if (!usersMap.has(currentKey)) {
      usersMap.set(currentKey, {
        name: currentUser.name || 'Unknown User',
        studentId: currentUser.studentId || 'N/A',
        email: currentUser.email || 'N/A',
        major: currentUser.major || 'N/A'
      });
    }
  }
  getStoredUsers().forEach(user => {
    const key = user.studentId || user.email || user.name;
    if (!usersMap.has(key)) {
      usersMap.set(key, {
        name: user.name || 'Unknown User',
        studentId: user.studentId || 'N/A',
        email: user.email || 'N/A',
        major: user.major || 'N/A'
      });
    }
  });
  const users = Array.from(usersMap.values());
  if (totalUsers) {
    totalUsers.textContent = String(users.length);
  }
  renderAdminEvents(adminEventsList);
  renderAdminRegistrations(adminRegistrations, registrations);
  renderAdminUsers(adminUsers, users);
  if (adminEventForm && !adminEventForm.dataset.bound) {
    adminEventForm.dataset.bound = 'true';
    adminEventForm.addEventListener('submit', function (e) {
      e.preventDefault();
      const title = document.getElementById('adminEventTitle').value.trim();
      const dateValue = document.getElementById('adminEventDate').value;
      const location = document.getElementById('adminEventLocation').value.trim();
      const category = document.getElementById('adminEventCategory').value;
      const description = document.getElementById('adminEventDescription').value.trim();
      if (!title || !dateValue || !location || !category || !description) {
        alert('All event fields are required.');
        return;
      }
      const newEvent = {
        id: createEventId(title),
        title: title,
        date: formatDisplayDate(dateValue),
        location: location,
        category: category,
        description: description
      };
      const finishAddEvent = function (eventId) {
        if (eventId) {
          newEvent.id = String(eventId);
        }
        saveAdminEvent(newEvent);
        adminEventForm.reset();
        alert('Event added successfully.');
        initializeAdminPage();
      };
      
      // For local testing:
      finishAddEvent();
      
      // saveAdminEventOnServer(newEvent, dateValue).then(function (result) {
      //   if (result && result.success === false) {
      //     alert(result.message || 'Event could not be saved.');
      //     return;
      //   }
      //   finishAddEvent(result && result.event_id);
      // }).catch(function () {
      //   alert('Could not connect to the server to save the event. Please try again.');
      // });
    });
  }
  if (adminUserForm && !adminUserForm.dataset.bound) {
    adminUserForm.dataset.bound = 'true';
    adminUserForm.addEventListener('submit', function (e) {
      e.preventDefault();
      const newUser = {
        name: document.getElementById('adminUserName').value.trim(),
        studentId: document.getElementById('adminUserStudentId').value.trim(),
        email: document.getElementById('adminUserEmail').value.trim(),
        major: document.getElementById('adminUserMajor').value.trim(),
        password: document.getElementById('adminUserPassword').value,
        dateOfBirth: document.getElementById('adminUserDob').value,
        confirmPassword: document.getElementById('adminUserConfirmPassword') ? document.getElementById('adminUserConfirmPassword').value : null
      };
      if (!newUser.name || !newUser.studentId || !newUser.email || !newUser.major || !newUser.password || !newUser.dateOfBirth) {
        alert('All fields are required.');
        return;
      }
      if (newUser.name.length < 3) {
        alert('Name must be at least 3 characters long.');
        return;
      }
      if (!/^[A-Za-z\s]+$/.test(newUser.name)) {
        alert('Name should contain only letters.');
        return;
      }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newUser.email)) {
        alert('Please enter a valid email address.');
        return;
      }
      if (newUser.password.length < 8) {
        alert('Password must be at least 8 characters long.');
        return;
      }
      if (!/^(?=.*[A-Za-z])(?=.*\d)/.test(newUser.password)) {
        alert('Password should include a mix of letters and numbers.');
        return;
      }
      if (newUser.confirmPassword !== null && newUser.password !== newUser.confirmPassword) {
        alert('Passwords do not match.');
        return;
      }
      const finishAddUser = function () {
        saveUser(newUser);
        adminUserForm.reset();
        alert('User added successfully.');
        initializeAdminPage();
      };
      
      // For local testing:
      finishAddUser();
      
      // saveAdminUserOnServer(newUser).then(function (result) {
      //   if (result && result.success === false) {
      //     alert(result.message || 'User could not be saved.');
      //     return;
      //   }
      //   finishAddUser();
      // }).catch(function () {
      //   alert('Could not connect to the server to save the user. Please try again.');
      // });
    });
  }
}
function renderRegistrations(container, registrations, isNew) {
  container.innerHTML = '';
  if (!registrations.length) {
    container.innerHTML = '<div class="empty-list">No registrations found.</div>';
    return;
  }
  registrations.forEach(reg => {
    const item = document.createElement('div');
    item.className = 'registration-item';
    const meta = document.createElement('div');
    meta.className = 'registration-meta';
    meta.innerHTML = `
      <strong>${reg.event ? reg.event.title : 'Unknown Event'}</strong>
      <span>${reg.event ? reg.event.date : ''}</span>
      <span>${reg.event ? reg.event.location : ''}</span>
    `;
    const actions = document.createElement('div');
    actions.className = 'registration-actions';
    const viewBtn = document.createElement('button');
    viewBtn.className = 'view-btn';
    viewBtn.textContent = 'View';
    viewBtn.addEventListener('click', function () {
      if (reg.event) {
        showEventDetailsModal(reg.event);
      }
    });
    actions.appendChild(viewBtn);
    if (isNew) {
      const actionBtn = document.createElement('button');
      actionBtn.className = 'delete-btn';
      actionBtn.textContent = 'Mark Past';
      actionBtn.addEventListener('click', function () {
        markRegistrationPast(reg.id);
      });
      actions.appendChild(actionBtn);
    }
    item.appendChild(meta);
    item.appendChild(actions);
    container.appendChild(item);
  });
}
function renderAdminRegistrations(container, registrations) {
  container.innerHTML = '';
  if (!registrations.length) {
    container.innerHTML = '<div class="empty-list">No registrations found.</div>';
    return;
  }
  const sortedRegistrations = registrations.slice().sort((a, b) => new Date(b.registeredAt) - new Date(a.registeredAt));
  const today = new Date();
  today.setHours(0, 0, 0, 0); // Strip time to prevent today's events from being marked as past
  sortedRegistrations.forEach(reg => {
    const event = getAllEvents().find(item => item.id === reg.selectedEventId);
    const isPastEvent = reg.markedPast || (event ? new Date(event.date) < today : false);
    const item = document.createElement('div');
    item.className = 'registration-item admin-registration-item';
    const meta = document.createElement('div');
    meta.className = 'registration-meta';
    meta.innerHTML = `
      <strong>${event ? event.title : 'Unknown Event'}</strong>
      <span>${reg.name || 'Unknown User'}</span>
      <span>${reg.studentId || 'No Student ID'}</span>
      <span>${event ? event.date : 'No date available'}</span>
      <span>Status: ${isPastEvent ? 'Past' : 'Active'}</span>
    `;
    const actions = document.createElement('div');
    actions.className = 'registration-actions';
    const viewBtn = document.createElement('button');
    viewBtn.className = 'view-btn';
    viewBtn.textContent = 'View';
    viewBtn.addEventListener('click', function () {
      if (event) {
        showEventDetailsModal(event);
      }
    });
    actions.appendChild(viewBtn);
    if (!isPastEvent) {
      const pastBtn = document.createElement('button');
      pastBtn.className = 'delete-btn';
      pastBtn.textContent = 'Mark Past';
      pastBtn.addEventListener('click', function () {
        markRegistrationPast(reg.id);
      });
      actions.appendChild(pastBtn);
    }
    const removeBtn = document.createElement('button');
    removeBtn.className = 'view-btn';
    removeBtn.textContent = 'Remove';
    removeBtn.addEventListener('click', function () {
      deleteRegistration(reg.id);
    });
    actions.appendChild(removeBtn);
    item.appendChild(meta);
    item.appendChild(actions);
    container.appendChild(item);
  });
}
function renderAdminEvents(container) {
  const events = getAllEvents();
  container.innerHTML = '';
  if (!events.length) {
    container.innerHTML = '<div class="empty-list">No events found.</div>';
    return;
  }
  events.forEach(event => {
    const item = document.createElement('div');
    item.className = 'registration-item admin-registration-item';
    const meta = document.createElement('div');
    meta.className = 'registration-meta';
    meta.innerHTML = `
      <strong>${event.title}</strong>
      <span>${event.date}</span>
      <span>${event.location}</span>
      <span>${event.category}</span>
    `;
    const actions = document.createElement('div');
    actions.className = 'registration-actions';
    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'delete-btn';
    deleteBtn.textContent = 'Delete';
    deleteBtn.addEventListener('click', function () {
      deleteEvent(event.id);
    });
    actions.appendChild(deleteBtn);
    item.appendChild(meta);
    item.appendChild(actions);
    container.appendChild(item);
  });
}
function renderAdminUsers(container, users) {
  container.innerHTML = '';
  if (!users.length) {
    container.innerHTML = '<div class="empty-list">No users found.</div>';
    return;
  }
  users.forEach(user => {
    const item = document.createElement('div');
    item.className = 'admin-user-card';
    item.innerHTML = `
      <strong>${user.name}</strong>
      <span>Student ID: ${user.studentId}</span>
      <span>Email: ${user.email}</span>
      <span>Major: ${user.major}</span>
    `;
    container.appendChild(item);
  });
}
function initializeAdminTabs() {
  const tabs = document.querySelectorAll('.admin-tab');
  const panels = document.querySelectorAll('.admin-panel');
  tabs.forEach(tab => {
    if (tab.dataset.bound === 'true') return;
    tab.dataset.bound = 'true';
    tab.addEventListener('click', function () {
      const targetTab = tab.dataset.tab;
      tabs.forEach(item => item.classList.remove('active'));
      panels.forEach(panel => panel.classList.remove('active'));
      tab.classList.add('active');
      if (targetTab === 'event') {
        document.getElementById('adminEventPanel').classList.add('active');
      }
      if (targetTab === 'user') {
        document.getElementById('adminUserPanel').classList.add('active');
      }
    });
  });
}
function createEventId(title) {
  return `${title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')}-${Date.now()}`;
}
function formatDisplayDate(dateValue) {
  let date = new Date(dateValue);
  if (typeof dateValue === 'string' && dateValue.includes('-')) {
    const [year, month, day] = dateValue.split('-');
    date = new Date(year, month - 1, day);
  }
  if (Number.isNaN(date.getTime())) {
    return dateValue;
  }
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
}
function deleteRegistration(registrationId) {
  const registrations = JSON.parse(localStorage.getItem('registrations') || '[]');
  const filtered = registrations.filter(reg => reg.id !== registrationId);
  localStorage.setItem('registrations', JSON.stringify(filtered));
  refreshManagementPages();
}
function deleteEvent(eventId) {
  if (!confirm('Delete this event?')) {
    return;
  }
  const finishDelete = function () {
    const adminEvents = getAdminEvents().filter(event => event.id !== eventId);
    const deletedEventIds = JSON.parse(localStorage.getItem('deletedEventIds') || '[]');
    const registrations = JSON.parse(localStorage.getItem('registrations') || '[]');
    localStorage.setItem('adminEvents', JSON.stringify(adminEvents));
    localStorage.setItem('deletedEventIds', JSON.stringify([...new Set([...deletedEventIds, eventId])]));
    localStorage.setItem(
      'registrations',
      JSON.stringify(registrations.filter(reg => reg.selectedEventId !== eventId))
    );
    refreshManagementPages();
  };
  
  // For local testing:
  finishDelete();
  
  // fetch(`../php/delete_event.php?id=${encodeURIComponent(eventId)}`, {
  //   credentials: 'same-origin',
  //   cache: 'no-store',
  //   headers: {
  //     'X-Requested-With': 'XMLHttpRequest'
  //   }
  // }).then(function (response) {
  //   return response.text().then(function (text) {
  //     let result = null;
  //     try {
  //       result = JSON.parse(text);
  //     } catch (error) {
  //       result = null;
  //     }
  //     if (result && result.success === false) {
  //       throw new Error(result.message || 'Event could not be deleted.');
  //     }
  //     if (!response.ok) {
  //       throw new Error('Event could not be deleted.');
  //     }
  //   });
  // }).then(function () {
  //   finishDelete();
  // }).catch(function (error) {
  //   if (error && error.message === 'Access denied.') {
  //     alert(error.message);
  //   } else {
  //     alert(error.message || 'Event could not be deleted. Please try again.');
  //   }
  // });
}
function markRegistrationPast(registrationId) {
  const registrations = JSON.parse(localStorage.getItem('registrations') || '[]');
  const updated = registrations.map(reg => {
    if (reg.id === registrationId) {
      return { ...reg, markedPast: true };
    }
    return reg;
  });
  localStorage.setItem('registrations', JSON.stringify(updated));
  refreshManagementPages();
}
function refreshManagementPages() {
  if (document.getElementById('dashboardPage')) {
    initializeDashboardPage();
  }
  if (document.getElementById('adminPage')) {
    initializeAdminPage();
  }
}
function renderEventsGrid() {
  const eventsGrid = document.getElementById('eventsGrid');
  if (!eventsGrid) return;

  const events = getAllEvents();
  eventsGrid.innerHTML = '';
  events.forEach(event => {
    const card = document.createElement('div');
    card.className = 'event-card';
    card.dataset.id = event.id;
    card.dataset.category = event.category.toLowerCase();
    card.dataset.date = formatEventDatasetDate(event.date);
    card.innerHTML = `
      <div class="event-card-image"></div>
      <div class="event-card-content">
        <h3 class="event-card-title">${event.title}</h3>
        <p class="event-card-date">${event.date}</p>
        <div class="event-card-buttons">
          <button type="button" class="event-btn event-details-btn">View Details</button>
          <button type="button" class="event-btn event-register-btn">Register</button>
        </div>
      </div>
    `;
    eventsGrid.appendChild(card);
  });
}
function formatEventDatasetDate(dateString) {
  const parsedDate = new Date(dateString);
  if (Number.isNaN(parsedDate.getTime())) {
    return dateString;
  }
  const year = parsedDate.getFullYear();
  const month = String(parsedDate.getMonth() + 1).padStart(2, '0');
  const day = String(parsedDate.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}
function initializeCalendarPage() {
  const calendarGrid = document.getElementById('calendarGrid');
  const dayLabels = document.getElementById('calendarDayLabels');
  const monthLabel = document.getElementById('calendarMonthLabel');
  const prevBtn = document.getElementById('calendarPrevBtn');
  const nextBtn = document.getElementById('calendarNextBtn');
  if (!calendarGrid || !dayLabels || !monthLabel) return;
  const allEvents = getAllEvents()
    .map(event => ({
      ...event,
      parsedDate: new Date(event.date)
    }))
    .filter(event => !Number.isNaN(event.parsedDate.getTime()));
  const firstEventDate = allEvents.length
    ? allEvents.slice().sort((a, b) => a.parsedDate - b.parsedDate)[0].parsedDate
    : new Date();
  const state = {
    year: firstEventDate.getFullYear(),
    month: firstEventDate.getMonth()
  };
  renderCalendarDayLabels(dayLabels);
  renderCalendarMonth();
  if (prevBtn && !prevBtn.dataset.bound) {
    prevBtn.dataset.bound = 'true';
    prevBtn.addEventListener('click', function () {
      state.month -= 1;
      if (state.month < 0) {
        state.month = 11;
        state.year -= 1;
      }
      renderCalendarMonth();
    });
  }
  if (nextBtn && !nextBtn.dataset.bound) {
    nextBtn.dataset.bound = 'true';
    nextBtn.addEventListener('click', function () {
      state.month += 1;
      if (state.month > 11) {
        state.month = 0;
        state.year += 1;
      }
      renderCalendarMonth();
    });
  }
  function renderCalendarMonth() {
    const firstDay = new Date(state.year, state.month, 1);
    const daysInMonth = new Date(state.year, state.month + 1, 0).getDate();
    const startDay = firstDay.getDay();
    monthLabel.textContent = firstDay.toLocaleDateString('en-US', {
      month: 'long',
      year: 'numeric'
    });
    calendarGrid.innerHTML = '';
    for (let i = 0; i < startDay; i += 1) {
      const emptyCell = document.createElement('div');
      emptyCell.className = 'calendar-cell calendar-cell--empty';
      calendarGrid.appendChild(emptyCell);
    }
    for (let day = 1; day <= daysInMonth; day += 1) {
      const dayDate = new Date(state.year, state.month, day);
      const dayEvents = allEvents.filter(event =>
        event.parsedDate.getFullYear() === dayDate.getFullYear() &&
        event.parsedDate.getMonth() === dayDate.getMonth() &&
        event.parsedDate.getDate() === dayDate.getDate()
      );
      const dayCell = document.createElement('div');
      dayCell.className = 'calendar-cell';
      if (dayEvents.length) {
        dayCell.classList.add('calendar-cell--event');
      }
      const dayNumber = document.createElement('span');
      dayNumber.className = 'calendar-day-number';
      dayNumber.textContent = String(day);
      dayCell.appendChild(dayNumber);
      dayEvents.forEach(event => {
        const eventButton = document.createElement('button');
        eventButton.type = 'button';
        eventButton.className = 'calendar-event-pill';
        eventButton.textContent = event.title;
        eventButton.addEventListener('click', function () {
          showEventDetailsModal(event);
        });
        dayCell.appendChild(eventButton);
      });

      calendarGrid.appendChild(dayCell);
    }
  }
}
function renderCalendarDayLabels(container) {
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  container.innerHTML = '';
  days.forEach(day => {
    const label = document.createElement('div');
    label.className = 'calendar-day-label';
    label.textContent = day;
    container.appendChild(label);
  });
}
function showEventDetailsModal(event) {
  const modal = document.getElementById('eventDetailsModal');
  if (!modal) return;
  const registerButton = document.getElementById('modalRegisterBtn');
  document.getElementById('modalEventTitle').textContent = event.title;
  document.getElementById('modalEventDate').textContent = event.date;
  document.getElementById('modalEventLocation').textContent = event.location;
  document.getElementById('modalEventCategory').textContent = event.category;
  document.getElementById('modalEventDescription').textContent = event.description;
  if (registerButton) {
    registerButton.onclick = function () {
      closeEventDetailsModal();
      registerForEvent(event.id, event.title);
    };
  }
  modal.classList.add('active');
}
function closeEventDetailsModal() {
  const modal = document.getElementById('eventDetailsModal');
  if (modal) {
    modal.classList.remove('active');
  }
}