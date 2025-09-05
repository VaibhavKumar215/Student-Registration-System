// -------------------- GLOBAL VARIABLES --------------------
let currentTab = "registrationTab";   // Default active tab: Registration
const studentsRecord = [];            // Stores all student records
let validata = false;                 // (Unused? can remove if not needed)
let editingIndex = -1;                // Tracks index of student being edited (-1 = none)
let deleteIndex = -1;                 // Tracks index of student to be deleted (-1 = none)


// -------------------- INITIALIZATION --------------------
// Load data & display records on page load
window.addEventListener('load', function () {
    loadStudents();
    displayRecords();
});


// -------------------- TAB HANDLING --------------------
function showTab(tabId, tabBtn) {
    // Prevent redundant re-render if already on this tab
    if (currentTab === tabId) return;

    // Remove active class from all tab buttons
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });

    // Highlight the clicked button
    document.getElementById(tabBtn).classList.add('active');

    // Hide previous tab and show new tab
    document.getElementById(currentTab).classList.remove("active");
    document.getElementById(tabId).classList.add("active");

    currentTab = tabId;

    // Refresh records list when switching to "View Records" tab
    if (tabId === 'recordTab') {
        displayRecords();
    }
}


// -------------------- LOCAL STORAGE --------------------
// Save students array into localStorage
function saveStudents() {
    localStorage.setItem('students', JSON.stringify(studentsRecord));
}

// Load students from localStorage into memory
function loadStudents() {
    const storedStudents = JSON.parse(localStorage.getItem('students'));
    studentsRecord.length = 0;               // Clear current array
    if (storedStudents) {
        studentsRecord.push(...storedStudents); // Refill from storage
    }
}


// -------------------- UI FEEDBACK --------------------
// Show success toast (auto-hides after 3s)
function showSuccessMessage(message) {
    const successDiv = document.getElementById('successMessage');
    successDiv.textContent = '✅ ' + message;
    successDiv.classList.remove('hidden');
    setTimeout(() => {
        successDiv.classList.add('hidden');
    }, 3000);
}

// Cancel editing mode and reset form
function cancelEdit() {
    editingIndex = -1;
    document.getElementById('editForm').classList.add("hidden");
    document.getElementById('submitBtn').textContent = 'Register Student';
    document.getElementById('cancelBtn').classList.add('hidden');

    // Reset form and remove errors
    document.getElementById('studentForm').reset();
    clearAllErrors();
}


// -------------------- FORM HANDLING --------------------
document.getElementById('studentForm').addEventListener('submit', function (e) {
    e.preventDefault();  // Prevent page reload

    // Collect form data into object
    const formData = {
        name: document.getElementById('studentName').value.trim(),
        id: document.getElementById('studentID').value.trim(),
        email: document.getElementById('emailAddress').value.trim(),
        contact: document.getElementById('contactNumber').value.trim()
    };

    // Run validation
    if (!ValidateForm(formData)) return;

    // Update or Add student
    if (editingIndex >= 0) {
        studentsRecord[editingIndex] = formData;  // Replace existing
        showSuccessMessage('Student record updated successfully');
        cancelEdit();
    } else {
        studentsRecord.push(formData);            // Add new record
        showSuccessMessage('Student registered successfully');
    }

    // Save to storage and reset form
    saveStudents();
    this.reset();
});


// -------------------- VALIDATION --------------------
function ValidateForm(formData) {
    const { name, id, email, contact } = formData;
    let isValid = true;

    clearAllErrors();  // Reset errors before checking

    // Check required fields
    if (!name || !id || !email || !contact) {
        if (!name) showError('studentName', 'nameError', 'Student name is required');
        if (!id) showError('studentID', 'idError', 'Student ID is required');
        if (!email) showError('emailAddress', 'emailError', 'Email is required');
        if (!contact) showError('contactNumber', 'contactError', 'Contact number is required');
        return false;
    }

    // Name: only letters and spaces
    const nameRegex = /^[a-zA-Z\s]+$/;
    if (!nameRegex.test(name.trim())) {
        showError('studentName', 'nameError', 'Please enter a valid name (letters and spaces only)');
        isValid = false;
    }

    // ID: only digits, must be unique (except when editing the same record)
    const idRegex = /^\d+$/;
    if (!idRegex.test(id)) {
        showError('studentID', 'idError', 'Field must contain only numbers');
        isValid = false;
    } else if (studentsRecord.some((student, index) => student.id == id && editingIndex != index)) {
        showError('studentID', 'idError', 'Student ID already exists');
        isValid = false;
    }

    // Email validation
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(email)) {
        showError('emailAddress', 'emailError', 'Please enter a valid email address');
        isValid = false;
    }

    // Contact: exactly 10 digits
    const contactRegex = /^\d{10}$/;
    if (!contactRegex.test(contact)) {
        showError('contactNumber', 'contactError', 'Field must contain only 10 digit numbers');
        isValid = false;
    }

    return isValid;
}

// Show form input field error
function showError(fieldId, errorId, message) {
    const field = document.getElementById(fieldId);
    const errorDiv = document.getElementById(errorId);
    field.classList.add('error');
    errorDiv.textContent = message;
    errorDiv.style.display = 'block';
}

// Clear all errors
function clearAllErrors() {
    document.querySelectorAll('.error-message').forEach(ele => {
        ele.style.display = "none";
    });
    document.querySelectorAll('.error').forEach(ele => {
        ele.classList.remove("error");
    });
}


// -------------------- RECORD DISPLAY --------------------
function displayRecords(records = studentsRecord) {
    const recordsBody = document.getElementById('recordsBody');
    const noRecords = document.getElementById('noRecords');
    const recordsGrid = document.getElementById('recordsGrid');

    // Handle empty dataset
    if (studentsRecord.length === 0) {
        recordsGrid.classList.add('hidden');
        noRecords.classList.remove('hidden');
        noRecords.classList.add('flex');
        return;
    }

    // Show table and hide "no records"
    recordsGrid.classList.remove('hidden');
    noRecords.classList.add('hidden');

    // Clear table body before re-render
    recordsBody.innerHTML = '';

    // Render each student row
    records.forEach((student, index) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${index + 1}.</td>
            <td class="min-w-24 break-words">${student.name}</td>
            <td>${student.id}</td>
            <td class="min-w-32 break-all">${student.email}</td>
            <td>${student.contact}</td>
            <td>
                <div class="action-buttons">
                    <button class="btn-secondary edit-btn" data-index="${index}">Edit</button>
                    <button class="btn-danger delete-btn" data-index="${index}">Delete</button>
                </div>
            </td>
        `;
        recordsBody.appendChild(row);
    });

    updateScrollbar(); // Refresh scroll state
}


// -------------------- SEARCH --------------------
const searchInput = document.getElementById('searchInput');
const noMatchRecords = document.getElementById('noMatchRecords');

searchInput.addEventListener('input', function () {
    if (studentsRecord.length === 0) return;

    const searchStudent = searchInput.value.trim().toLowerCase();
    let records;

    if (!searchStudent) {
        displayRecords();
        records = false;
    } else {
        const filterRecords = studentsRecord.filter(student =>
            Object.values(student).some(value =>
                value.toLowerCase().includes(searchStudent)
            )
        );
        displayRecords(filterRecords);
        records = filterRecords.length === 0;
    }

    // Toggle “No match found” message
    noMatchRecords.classList.toggle('hidden', !records);
    noMatchRecords.classList.toggle('flex', records);
});


// -------------------- EDIT & DELETE --------------------
// Delegate edit/delete clicks to parent <tbody>
recordsBody.addEventListener('click', e => {
    const btn = e.target;
    const index = btn.dataset.index;
    if (btn.classList.contains('edit-btn')) editStudent(index);
    if (btn.classList.contains('delete-btn')) deleteStudent(index);
});

// Fill form with student data for editing
function editStudent(index) {
    const student = studentsRecord[index];
    editingIndex = index;

    // Pre-fill inputs
    document.getElementById('studentName').value = student.name;
    document.getElementById('studentID').value = student.id;
    document.getElementById('emailAddress').value = student.email;
    document.getElementById('contactNumber').value = student.contact;

    // Switch form to "edit" mode
    document.getElementById('editForm').classList.remove('hidden');
    document.getElementById('submitBtn').textContent = 'Update Student';
    document.getElementById('cancelBtn').classList.remove('hidden');

    // Switch to registration tab
    showTab('registrationTab', 'registrationBtn');
    clearAllErrors();
}

// Open delete confirmation modal
function deleteStudent(index) {
    const modal = document.getElementById('deleteModal');
    deleteIndex = index;
    const student = studentsRecord[index];

    // Populate modal with student info
    document.getElementById('studentInfo').innerHTML = `
        <p><span class="student-info">Student Name :</span>${student.name}</p>
        <p><span class="student-info">Student ID :</span>${student.id}</p>
        <p><span class="student-info">Email :</span>${student.email}</p>
        <p><span class="student-info">Contact :</span>${student.contact}</p>
    `;

    modal.showModal();
    modal.classList.replace('scale-0', 'scale-100');
    document.body.classList.add('overflow-hidden');
}

// Confirm deletion
function confirmDelete() {
    if (deleteIndex >= 0) {
        studentsRecord.splice(deleteIndex, 1); // Remove from array
        saveStudents();
        displayRecords();
        closeDeleteModal();

        setTimeout(() => {
            window.alert("✅ Successfully Deleted");
        }, 500);
    }
}

// Close delete modal
function closeDeleteModal() {
    deleteIndex = -1;
    const modal = document.getElementById('deleteModal');
    modal.close();
    modal.classList.replace('scale-100', 'scale-0');
    document.body.classList.remove("overflow-hidden");
}

// Close modal when clicking outside the box
document.getElementById('deleteModal').addEventListener('click', function (e) {
    if (e.target === this) closeDeleteModal();
});


// -------------------- SCROLLBAR HANDLING --------------------
function updateScrollbar() {
    const recordsGrid = document.getElementById('recordsGrid');
    const table = document.getElementById('recordsTable');

    // Enable vertical scroll if table content exceeds container height
    if (table.scrollHeight > recordsGrid.clientHeight) {
        recordsGrid.classList.add('overflow-y-scroll');
    } else {
        recordsGrid.classList.remove('overflow-y-scroll');
    }
}
