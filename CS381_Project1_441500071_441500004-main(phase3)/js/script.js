function getAllEvents() {
  return window.events || [];
}
function isAdminAuthenticated() {
  return fetch('../php/check_admin.php', {
    credentials: 'same-origin',
    headers: { 'X-Requested-With': 'XMLHttpRequest' }
  }).then(response => response.json())
    .then(data => {
      return data && data.success && data.is_admin === true;
    }).catch(() => false);
}
function goToEvents() {
  getCurrentUser().then(currentUser => {
    if (currentUser) {
      window.location.href = 'events.html';
    } else {
      document.getElementById('accountModal').classList.add('active');
    }
  });
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
  return fetch('../php/get_current_user.php', {
    credentials: 'same-origin',
    headers: { 'X-Requested-With': 'XMLHttpRequest' }
  }).then(response => response.json())
    .then(data => {
      if (data && data.success && data.user) {
        return data.user;
      }
      return null;
    }).catch(() => null);
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
    student_id: user ? (user.student_id || user.studentId) : ''
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
    description: eventData.description,
    image: eventData.image
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
  getCurrentUser().then(currentUser => {
    if (!currentUser) {
      showConfirmModal('You need an account before registering for events. Would you like to create one now?', function (confirmed) {
        if (confirmed) {
          window.location.href = `register.html?eventId=${eventId}`;
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
        studentId: currentUser.student_id || currentUser.studentId,
        email: currentUser.email,
        major: currentUser.major,
        dateOfBirth: currentUser.date_of_birth || currentUser.dateOfBirth,
        selectedEventId: eventId
      };
      const finishEventRegistration = function () {
        saveEventRegistrationOnServer(eventId, currentUser).then(function(result) {
          if (result && result.success !== false) {
            showConfirmModal('Registration successful! Redirect to your dashboard?', function (goToDashboard) {
              if (goToDashboard) {
                window.location.href = 'dashboard.html';
              }
            });
          } else {
            alert(result && result.message ? result.message : 'Registration failed.');
          }
        }).catch(function() {
          alert('Error connecting to the server.');
        });
      };

      finishEventRegistration();
    });
  });
}
function loadEventsFromServer(callback) {
fetch('../php/get_events.php', { cache: 'no-store' })
    .then(response => response.text()) 
    .then(text => {
      try {
        const data = JSON.parse(text);
        if (Array.isArray(data)) {
          window.events = data;
        } else if (data && !data.error) {
          window.events = data;
        } else {
          window.events = [];
          console.error('Database error:', data.error);
        }
      } catch (e) {
        console.error('JSON Parse Error (Check PHP files for errors). Server returned:', text);
        window.events = [];
      }
      if (typeof callback === 'function') callback();
    })
    .catch(error => {
      console.error('Fetch error:', error);
      window.events = [];
      if (typeof callback === 'function') callback();
    });
}
document.addEventListener('DOMContentLoaded', function () {
  loadEventsFromServer(function() {
    initApp();
  });
});
function initApp() {
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
  applyAdminReturnPath();
  if (document.getElementById('loginForm')) {
    initializeLoginPage();
  }
}
function applyAdminReturnPath() {
  const params = new URLSearchParams(window.location.search);
  if (params.get('from') !== 'admin') {
    return;
  }
  const adminPageHref = 'admin.html';
  const pageBackBtn = document.getElementById('pageBackBtn');
  if (pageBackBtn) {
    pageBackBtn.setAttribute('href', adminPageHref);
  }
  document.querySelectorAll('a[href="dashboard.html"]').forEach(link => {
    link.setAttribute('href', adminPageHref);
  });
  document.querySelectorAll('a[href="events.html"]').forEach(link => {
    link.setAttribute('href', 'events.html?from=admin');
  });
  document.querySelectorAll('a[href="calendar.html"]').forEach(link => {
    link.setAttribute('href', 'calendar.html?from=admin');
  });
}
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
        const event = getAllEvents().find(e => String(e.id) === String(eventId));
        if (event) {
          showEventDetailsModal(event);
        }
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
  const event = getAllEvents().find(item => String(item.id) === String(eventId));
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
  const params = new URLSearchParams(window.location.search);
  const selectedEventId = params.get('eventId');
  const selectedEventDiv = document.getElementById('selectedEvent');
  const eventTitle = document.getElementById('eventTitle');
  const eventDate = document.getElementById('eventDate');
  const registrationForm = document.getElementById('registrationForm');
  const selectedEventInput = document.getElementById('selectedEventIdInput');
  let selectedEvent = null;
  if (selectedEventId) {
    selectedEvent = getAllEvents().find(item => String(item.id) === String(selectedEventId));
    if (selectedEvent) {
      selectedEventDiv.style.display = 'block';
      eventTitle.textContent = selectedEvent.title;
      eventDate.textContent = `Date: ${selectedEvent.date}`;
      if (selectedEventInput) {
        selectedEventInput.value = selectedEvent.id;
      }
    } else {
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
      saveUserRegistrationOnServer(formData).then(function(result) {
        if (result && result.success !== false) {
          showConfirmModal('Account created successfully! Continue to your dashboard?', function (confirmed) {
            if (confirmed) {
              window.location.href = 'dashboard.html';
            }
          });
        } else {
          alert(result && result.message ? result.message : 'Registration failed.');
        }
      }).catch(function() {
        alert('Error connecting to the server.');
      });
    };
    
    finishRegistration();
    
  });
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
    loginUserOnServer(studentId, password).then(function(result) {
      if (result && result.success !== false) {
        showConfirmModal('Login successful! Go to your dashboard?', function (confirmed) {
          if (confirmed) {
            window.location.href = 'dashboard.html';
          }
        });
      } else {
        showConfirmModal('Invalid login credentials. Would you like to create an account now?', function (confirmed) {
          if (confirmed) {
            window.location.href = 'register.html';
          }
        });
      }
    }).catch(function() {
      alert('Error connecting to the server.');
    });
  });
}
function initializeDashboardPage() {
  const newContainer = document.getElementById('newRegistrations');
  const pastContainer = document.getElementById('pastRegistrations');
  const welcome = document.getElementById('dashboardWelcome');
  if (!newContainer || !pastContainer || !welcome) return;
  getCurrentUser().then(currentUser => {
    if (!currentUser) {
      window.location.href = 'login.html';
      return;
    }
    welcome.textContent = `Welcome, ${currentUser.name || 'User'}`;

    let actionsContainer = document.querySelector('.dashboard-title-actions');
    if (!actionsContainer) {
      actionsContainer = document.createElement('div');
      actionsContainer.className = 'dashboard-title-actions';
      welcome.parentNode.appendChild(actionsContainer);
    }
    
    if (!document.getElementById('editProfileBtn')) {
      const editBtn = document.createElement('button');
      editBtn.id = 'editProfileBtn';
      editBtn.className = 'btn event-details-btn';
      editBtn.textContent = 'Edit Profile';
      editBtn.addEventListener('click', () => openStudentEditProfileModal(currentUser));
      actionsContainer.prepend(editBtn);
    }

  fetch('../php/get_user_registrations.php', {
      credentials: 'same-origin',
      cache: 'no-store',
      headers: { 'X-Requested-With': 'XMLHttpRequest' }
    })
      .then(response => response.json())
      .then(data => {
        let userRegistrations = Array.isArray(data) ? data : (data.registrations || []);
        const sortedRegistrations = userRegistrations.slice().sort((a, b) => {
          const dateA = a.registeredAt || a.created_at || 0;
          const dateB = b.registeredAt || b.created_at || 0;
          return new Date(dateB) - new Date(dateA);
        });
        const today = new Date();
        today.setHours(0, 0, 0, 0); 
        const newRegistrations = [];
        const pastRegistrations = [];
        sortedRegistrations.forEach(reg => {
          const eventId = reg.selectedEventId || reg.event_id;
          const event = getAllEvents().find(item => item.id == eventId);
          const isPastEvent = reg.status === 'past' || reg.markedPast || (event ? new Date(event.date) < today : false);
          const targetList = isPastEvent ? pastRegistrations : newRegistrations;
          targetList.push({ ...reg, event, selectedEventId: eventId });
        });
        renderRegistrations(newContainer, newRegistrations, true);
        renderRegistrations(pastContainer, pastRegistrations, false);
      })
      .catch(error => {
        console.error('Error fetching registrations:', error);
        renderRegistrations(newContainer, [], true);
        renderRegistrations(pastContainer, [], false);
      });
  });
}
function initializeAdminPage() {
  const adminLoginGate = document.getElementById('adminLoginGate');
  const adminContent = document.getElementById('adminContent');
  const adminLoginForm = document.getElementById('adminLoginForm');
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
      loginAdminOnServer(adminId, password).then(function(result) {
        if (result && result.success !== false) {
          adminLoginForm.reset();
          window.location.reload();
        } else {
          alert('Invalid admin credentials. Please try again.');
        }
      }).catch(function() {
        alert('Error connecting to the server.');
      });
    });
  }
  if (adminLoginGate && adminContent) {
    isAdminAuthenticated().then(hasAccess => {
      adminLoginGate.style.display = hasAccess ? 'none' : 'block';
      adminContent.style.display = hasAccess ? 'block' : 'none';
      if (!hasAccess) {
        return;
      }
      if (!adminEventsList || !adminRegistrations || !adminUsers) return;
      const totalEvents = document.getElementById('adminTotalEvents');
      const totalUsers = document.getElementById('adminTotalUsers');
      const totalRegistrations = document.getElementById('adminTotalRegistrations');
      initializeAdminTabs();
      renderAdminEvents(adminEventsList);
      if (totalEvents) {
        totalEvents.textContent = getAllEvents().length;
      }
      fetch('../php/get_users.php', { cache: 'no-store' })
        .then(res => res.text())
        .then(text => {
          try {
            const data = JSON.parse(text);
            const users = Array.isArray(data) ? data : (data.users || []);
            renderAdminUsers(adminUsers, users);
            if (totalUsers) totalUsers.textContent = users.length;
          } catch (e) {
            console.error('JSON Parse Error in get_users.php:', text);
            adminUsers.innerHTML = '<div class="empty-list" style="color:red;">Error loading users. Check console.</div>';
          }
        })
        .catch(err => {
          console.error('Error fetching users:', err);
          renderAdminUsers(adminUsers, []);
        });
      fetch('../php/get_all_registrations.php', { cache: 'no-store' })
        .then(res => res.text())
        .then(text => {
          try {
            const data = JSON.parse(text);
            const registrations = Array.isArray(data) ? data : (data.registrations || []);
            renderAdminRegistrations(adminRegistrations, registrations);
            if (totalRegistrations) totalRegistrations.textContent = registrations.length;
          } catch (e) {
            console.error('JSON Parse Error in get_all_registrations.php:', text);
            adminRegistrations.innerHTML = '<div class="empty-list" style="color:red;">Error loading registrations. Check console.</div>';
          }
        })
        .catch(err => {
          console.error('Error fetching registrations:', err);
          renderAdminRegistrations(adminRegistrations, []);
        });
      if (adminEventForm && !adminEventForm.dataset.bound) {
        adminEventForm.dataset.bound = 'true';
        adminEventForm.addEventListener('submit', function (e) {
          e.preventDefault();
          const title = document.getElementById('adminEventTitle').value.trim();
          const dateValue = document.getElementById('adminEventDate').value;
          const location = document.getElementById('adminEventLocation').value.trim();
          const category = document.getElementById('adminEventCategory').value;
          const description = document.getElementById('adminEventDescription').value.trim();
          const imageInput = document.getElementById('adminEventImage');
          const imageFile = imageInput && imageInput.files.length > 0 ? imageInput.files[0] : null;
          
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
            description: description,
            image: imageFile
          };
          const finishAddEvent = function (eventId) {
            adminEventForm.reset();
            alert('Event added successfully.');
            initializeAdminPage();
          };
  saveAdminEventOnServer(newEvent, dateValue).then(function (result) {
            if (result && result.success === false) {
              alert(result.message || 'Event could not be saved.');
              return;
            }
            finishAddEvent(result && result.event_id);
          }).catch(function () {
            alert('Could not connect to the server to save the event. Please try again.');
          });
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
            adminUserForm.reset();
            alert('User added successfully.');
            initializeAdminPage();
          };
       saveAdminUserOnServer(newUser).then(function (result) {
            if (result && result.success === false) {
              alert(result.message || 'User could not be saved.');
              return;
            }
            finishAddUser();
          }).catch(function () {
            alert('Could not connect to the server to save the user. Please try again.');
          });
        });
      }
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
  const sortedRegistrations = registrations.slice().sort((a, b) => {
    const dateA = a.registeredAt || a.registration_date || a.created_at || 0;
    const dateB = b.registeredAt || b.registration_date || b.created_at || 0;
    return new Date(dateB) - new Date(dateA);
  });
  const today = new Date();
  today.setHours(0, 0, 0, 0); // Strip time to prevent today's events from being marked as past
  sortedRegistrations.forEach(reg => {
    const eventId = reg.selectedEventId || reg.event_id;
    const event = getAllEvents().find(item => item.id == eventId);
    const isPastEvent = reg.status === 'past' || reg.markedPast || (event ? new Date(event.date) < today : false);
    const item = document.createElement('div');
    item.className = 'registration-item admin-registration-item';
    const meta = document.createElement('div');
    meta.className = 'registration-meta';
    meta.innerHTML = `
      <strong>${event ? event.title : 'Unknown Event'}</strong>
      <span>${reg.name || 'Unknown User'}</span>
      <span>${reg.student_id || reg.studentId || 'No Student ID'}</span>
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
    
    const editBtn = document.createElement('button');
    editBtn.className = 'edit-btn';
    editBtn.textContent = 'Edit';
    editBtn.addEventListener('click', function () {
      openEditEventModal(event);
    });
    actions.appendChild(editBtn);

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
    
    const meta = document.createElement('div');
    meta.className = 'registration-meta';
    meta.innerHTML = `
      <strong>${user.name}</strong>
      <span>Student ID: ${user.student_id || user.studentId}</span>
      <span>Email: ${user.email}</span>
      <span>Major: ${user.major}</span>
    `;
    
    const actions = document.createElement('div');
    actions.className = 'registration-actions';
    
    const editBtn = document.createElement('button');
    editBtn.className = 'edit-btn';
    editBtn.textContent = 'Edit';
    editBtn.addEventListener('click', function () {
      openEditUserModal(user);
    });
    actions.appendChild(editBtn);

    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'delete-btn';
    deleteBtn.textContent = 'Delete';
    deleteBtn.addEventListener('click', function () {
      alert('Delete user functionality requires a backend script like `delete_user.php`.');
    });
    actions.appendChild(deleteBtn);

    item.appendChild(meta);
    item.appendChild(actions);
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

function openEditEventModal(event) {
  let modal = document.getElementById('editEventModal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'editEventModal';
    modal.className = 'modal-overlay';
    modal.innerHTML = `
      <div class="modal-card" style="width: min(500px, 100%);">
        <button type="button" class="close-modal" id="closeEditEventModal">&times;</button>
        <h3>Edit Event</h3>
        <form id="editEventForm" class="admin-form" style="text-align: left; margin-top: 15px;">
          <div class="admin-form-grid">
            <label>Event Title <input type="text" id="editEventTitle" required></label>
            <label>Date <input type="date" id="editEventDate" required></label>
            <label>Location <input type="text" id="editEventLocation" required></label>
            <label>Category
              <select id="editEventCategory" required style="width: 100%; padding: 12px 14px; border: 1px solid rgba(148, 166, 193, 0.45); border-radius: 12px; background: var(--field); color: var(--text);">
                <option value="Academic">Academic</option>
                <option value="Sports">Sports</option>
                <option value="Social">Social</option>
                <option value="General">General</option>
              </select>
            </label>
            <label class="admin-form-full">Event Image (Optional)
              <input type="file" id="editEventImage" accept="image/*">
            </label>
            <label class="admin-form-full">Description
              <textarea id="editEventDescription" required></textarea>
            </label>
          </div>
          <div class="modal-actions" style="margin-top: 20px;">
            <button type="submit" class="btn update-btn" style="width: 100%;">Save Changes</button>
          </div>
        </form>
      </div>
    `;
    document.body.appendChild(modal);

    document.getElementById('closeEditEventModal').addEventListener('click', () => modal.classList.remove('active'));
    document.getElementById('editEventForm').addEventListener('submit', function(e) {
      e.preventDefault();
      
      const imageInput = document.getElementById('editEventImage');
      const imageFile = imageInput && imageInput.files.length > 0 ? imageInput.files[0] : null;

      postToPhp('../php/update_event.php', {
        id: modal.dataset.eventId,
        name: document.getElementById('editEventTitle').value.trim(),
        date: document.getElementById('editEventDate').value,
        location: document.getElementById('editEventLocation').value.trim(),
        category: document.getElementById('editEventCategory').value,
        description: document.getElementById('editEventDescription').value.trim(),
        event_image: imageFile
      }).then(function(result) {
        if (result && result.success === false) {
           alert(result.message || 'Error updating event.');
        } else {
           alert('Event updated successfully!');
           modal.classList.remove('active');
           loadEventsFromServer(function() { refreshManagementPages(); });
        }
      }).catch(function() {
         alert('Error connecting to server. Make sure update_event.php exists.');
      });
    });
  }

  document.getElementById('editEventTitle').value = event.title || event.name || '';
  document.getElementById('editEventDate').value = formatEventDatasetDate(event.date) || '';
  document.getElementById('editEventLocation').value = event.location || '';
  document.getElementById('editEventCategory').value = event.category || 'General';
  document.getElementById('editEventDescription').value = event.description || '';
  modal.dataset.eventId = event.id;
  modal.classList.add('active');
}

function openEditUserModal(user) {
  let modal = document.getElementById('editUserModal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'editUserModal';
    modal.className = 'modal-overlay';
    modal.innerHTML = `
      <div class="modal-card" style="width: min(500px, 100%);">
        <button type="button" class="close-modal" id="closeEditUserModal">&times;</button>
        <h3>Edit User</h3>
        <form id="editUserForm" class="admin-form" style="text-align: left; margin-top: 15px;">
          <div class="admin-form-grid">
            <label>Full Name <input type="text" id="editUserName" required></label>
            <label>Student ID <input type="text" id="editUserStudentId" required readonly style="background: rgba(148, 166, 193, 0.1); cursor: not-allowed;"></label>
            <label>Email <input type="email" id="editUserEmail" required></label>
            <label>Major <input type="text" id="editUserMajor" required></label>
            <label>Date of Birth <input type="date" id="editUserDob" required></label>
          </div>
          <div class="modal-actions" style="margin-top: 20px;">
            <button type="submit" class="btn update-btn" style="width: 100%;">Save Changes</button>
          </div>
        </form>
      </div>
    `;
    document.body.appendChild(modal);

    document.getElementById('closeEditUserModal').addEventListener('click', () => modal.classList.remove('active'));
    document.getElementById('editUserForm').addEventListener('submit', function(e) {
      e.preventDefault();
      
      postToPhp('../php/update_user.php', {
        student_id: document.getElementById('editUserStudentId').value,
        name: document.getElementById('editUserName').value.trim(),
        email: document.getElementById('editUserEmail').value.trim(),
        major: document.getElementById('editUserMajor').value.trim(),
        date_of_birth: document.getElementById('editUserDob').value
      }).then(function(result) {
        if (result && result.success === false) {
           alert(result.message || 'Error updating user.');
        } else {
           alert('User updated successfully!');
           modal.classList.remove('active');
           refreshManagementPages();
        }
      }).catch(function() {
         alert('Error connecting to server. Make sure update_user.php exists.');
      });
    });
  }

  document.getElementById('editUserName').value = user.name || '';
  document.getElementById('editUserStudentId').value = user.student_id || user.studentId || '';
  document.getElementById('editUserEmail').value = user.email || '';
  document.getElementById('editUserMajor').value = user.major || '';
  document.getElementById('editUserDob').value = user.date_of_birth || user.dateOfBirth || '';
  modal.classList.add('active');
}

function openStudentEditProfileModal(user) {
  let modal = document.getElementById('studentEditProfileModal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'studentEditProfileModal';
    modal.className = 'modal-overlay';
    modal.innerHTML = `
      <div class="modal-card" style="width: min(500px, 100%);">
        <button type="button" class="close-modal" id="closeStudentEditProfileModal">&times;</button>
        <h3>Edit My Profile</h3>
        <form id="studentEditProfileForm" class="admin-form" style="text-align: left; margin-top: 15px;">
          <div class="admin-form-grid">
            <label>Full Name <input type="text" id="studentEditName" required></label>
            <label>Student ID <input type="text" id="studentEditId" required readonly style="background: rgba(148, 166, 193, 0.1); cursor: not-allowed;"></label>
            <label>Email <input type="email" id="studentEditEmail" required></label>
            <label>Major <input type="text" id="studentEditMajor" required></label>
            <label class="admin-form-full">New Password <span style="font-size:0.8rem;color:var(--muted);font-weight:normal;">(leave blank to keep current)</span> <input type="password" id="studentEditPassword"></label>
          </div>
          <div class="modal-actions" style="margin-top: 20px;">
            <button type="submit" class="btn update-btn" style="width: 100%;">Update Profile</button>
          </div>
        </form>
      </div>
    `;
    document.body.appendChild(modal);

    document.getElementById('closeStudentEditProfileModal').addEventListener('click', () => modal.classList.remove('active'));
    document.getElementById('studentEditProfileForm').addEventListener('submit', function(e) {
      e.preventDefault();
      
      postToPhp('../php/update_user.php', {
        name: document.getElementById('studentEditName').value.trim(),
        email: document.getElementById('studentEditEmail').value.trim(),
        major: document.getElementById('studentEditMajor').value.trim(),
        password: document.getElementById('studentEditPassword').value
      }).then(function(result) {
        if (result && result.success === false) {
           alert(result.message || 'Error updating profile.');
        } else {
           alert('Profile updated successfully!');
           modal.classList.remove('active');
           window.location.reload();
        }
      }).catch(function() {
         alert('Error connecting to server.');
      });
    });
  }

  document.getElementById('studentEditName').value = user.name || '';
  document.getElementById('studentEditId').value = user.studentId || user.student_id || '';
  document.getElementById('studentEditEmail').value = user.email || '';
  document.getElementById('studentEditMajor').value = user.major || '';
  document.getElementById('studentEditPassword').value = '';
  modal.classList.add('active');
}

function openStudentEditProfileModal(user) {
  let modal = document.getElementById('studentEditProfileModal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'studentEditProfileModal';
    modal.className = 'modal-overlay';
    modal.innerHTML = `
      <div class="modal-card" style="width: min(500px, 100%);">
        <button type="button" class="close-modal" id="closeStudentEditProfileModal">&times;</button>
        <h3>Edit My Profile</h3>
        <form id="studentEditProfileForm" class="admin-form" style="text-align: left; margin-top: 15px;">
          <div class="admin-form-grid">
            <label>Full Name <input type="text" id="studentEditName" required></label>
            <label>Student ID <input type="text" id="studentEditId" required readonly style="background: rgba(148, 166, 193, 0.1); cursor: not-allowed;"></label>
            <label>Email <input type="email" id="studentEditEmail" required></label>
            <label>Major <input type="text" id="studentEditMajor" required></label>
            <label class="admin-form-full">New Password <span style="font-size:0.8rem;color:var(--muted);font-weight:normal;">(leave blank to keep current)</span> <input type="password" id="studentEditPassword"></label>
          </div>
          <div class="modal-actions" style="margin-top: 20px;">
            <button type="submit" class="btn update-btn" style="width: 100%;">Update Profile</button>
          </div>
        </form>
      </div>
    `;
    document.body.appendChild(modal);

    document.getElementById('closeStudentEditProfileModal').addEventListener('click', () => modal.classList.remove('active'));
    document.getElementById('studentEditProfileForm').addEventListener('submit', function(e) {
      e.preventDefault();
      
      postToPhp('../php/update_user.php', {
        name: document.getElementById('studentEditName').value.trim(),
        email: document.getElementById('studentEditEmail').value.trim(),
        major: document.getElementById('studentEditMajor').value.trim(),
        password: document.getElementById('studentEditPassword').value
      }).then(function(result) {
        if (result && result.success === false) {
           alert(result.message || 'Error updating profile.');
        } else {
           alert('Profile updated successfully!');
           modal.classList.remove('active');
           window.location.reload();
        }
      }).catch(function() {
         alert('Error connecting to server.');
      });
    });
  }

  document.getElementById('studentEditName').value = user.name || '';
  document.getElementById('studentEditId').value = user.studentId || user.student_id || '';
  document.getElementById('studentEditEmail').value = user.email || '';
  document.getElementById('studentEditMajor').value = user.major || '';
  document.getElementById('studentEditPassword').value = '';
  modal.classList.add('active');
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
  if (!confirm('Delete this registration?')) {
    return;
  }
  postToPhp('../php/delete_registration.php', {
    id: registrationId
  }).then(function (result) {
    if (result && result.success === false) {
      alert(result.message || 'Could not delete registration.');
      return;
    }
    refreshManagementPages();
  }).catch(function () {
    alert('Error connecting to the server.');
  });
}
function deleteEvent(eventId) {
  if (!confirm('Delete this event?')) {
    return;
  }
  
  fetch(`../php/delete_event.php?id=${encodeURIComponent(eventId)}`, {
    credentials: 'same-origin',
    cache: 'no-store',
    headers: {
      'X-Requested-With': 'XMLHttpRequest'
    }
  }).then(function (response) {
    return response.text().then(function (text) {
      let result = null;
      try {
        result = JSON.parse(text);
      } catch (error) {
        result = null;
      }
      if (result && result.success === false) {
        throw new Error(result.message || 'Event could not be deleted.');
      }
      if (!response.ok) {
        throw new Error('Event could not be deleted.');
      }
    });
  }).then(function () {
    loadEventsFromServer(function() {
      refreshManagementPages();
    });
  }).catch(function (error) {
    if (error && error.message === 'Access denied.') {
      alert(error.message);
    } else {
      alert(error.message || 'Event could not be deleted. Please try again.');
    }
  });
}
function markRegistrationPast(registrationId) {
  if (!confirm('Mark this registration as past?')) {
    return;
  }
  postToPhp('../php/update_registration.php', {
    id: registrationId,
    status: 'past'
  }).then(function (result) {
    if (result && result.success === false) {
      alert(result.message || 'Could not update registration.');
      return;
    }
    refreshManagementPages();
  }).catch(function () {
    alert('Error connecting to the server.');
  });
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
    card.dataset.category = (event.category || 'General').toLowerCase(); 
    card.dataset.date = formatEventDatasetDate(event.date);
    const imageStyle = event.image_path ? `style="background-image: url('${event.image_path}'); background-size: cover; background-position: center;"` : '';
    card.innerHTML = `
      <div class="event-card-image" ${imageStyle}></div>
      <div class="event-card-content">
        <h3 class="event-card-title">${event.title || 'No Title'}</h3>
        <p class="event-card-date">${event.date || ''}</p>
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
  let firstEventDate = allEvents.length
    ? allEvents.slice().sort((a, b) => a.parsedDate - b.parsedDate)[0].parsedDate
    : new Date();

  const todayInit = new Date();
  if (firstEventDate.getFullYear() < todayInit.getFullYear() || 
     (firstEventDate.getFullYear() === todayInit.getFullYear() && firstEventDate.getMonth() < todayInit.getMonth())) {
    firstEventDate = todayInit;
  }

  const state = {
    year: firstEventDate.getFullYear(),
    month: firstEventDate.getMonth()
  };
  renderCalendarDayLabels(dayLabels);
  renderCalendarMonth();
  if (prevBtn && !prevBtn.dataset.bound) {
    prevBtn.dataset.bound = 'true';
    prevBtn.addEventListener('click', function () {
      const today = new Date();
      let prevMonth = state.month - 1;
      let prevYear = state.year;
      if (prevMonth < 0) {
        prevMonth = 11;
        prevYear -= 1;
      }
      if (prevYear < today.getFullYear() || (prevYear === today.getFullYear() && prevMonth < today.getMonth())) {
        return;
      }
      state.month = prevMonth;
      state.year = prevYear;
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
    const today = new Date();
    today.setHours(0, 0, 0, 0); 
    if (prevBtn) {
      const currentYear = today.getFullYear();
      const currentMonth = today.getMonth();
      if (state.year < currentYear || (state.year === currentYear && state.month <= currentMonth)) {
        prevBtn.disabled = true;
        prevBtn.style.opacity = '0.5';
        prevBtn.style.cursor = 'not-allowed';
      } else {
        prevBtn.disabled = false;
        prevBtn.style.opacity = '1';
        prevBtn.style.cursor = 'pointer';
      }
    }

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
      const isPastDate = dayDate < today;
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
      if (isPastDate) {
        dayCell.classList.add('calendar-cell--past');
        dayCell.style.opacity = '0.6';
        dayCell.style.backgroundColor = '#f0f0f0';
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
        if (isPastDate) {
          eventButton.disabled = true;
          eventButton.style.cursor = 'not-allowed';
        } else {
          eventButton.addEventListener('click', function () {
            showEventDetailsModal(event);
          });
        }
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
