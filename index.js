let currentTab = "registrationTab";      // by default: Registration tab
const studentsRecord = [];
let validata = false;
let editingIndex = -1;
let deleteIndex = -1;

// Load students from localStorage on page load
window.addEventListener('load', function () {
    loadStudents();
    displayRecords();
});

// Tab button functionality
function showTab(tabId, tabBtn) {
    if (currentTab === tabId) {
        return
    }

    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    document.getElementById(tabBtn).classList.add('active');

    document.getElementById(currentTab).classList.remove("active");
    document.getElementById(tabId).classList.add("active");

    currentTab = tabId;

    if (tabId === 'recordTab') {
        displayRecords();
    }
    // else{
    //     resetForm();
    // }
}

// Save students to localStorage
function saveStudents() {
    localStorage.setItem('students', JSON.stringify(studentsRecord));
}

// Load students from localStorage
function loadStudents() {
    const storedStudents = JSON.parse(localStorage.getItem('students'));
    if (storedStudents) {
        studentsRecord.push(...storedStudents)
    }
}

// Show success message
function showSuccessMessage(message) {
    const successDiv = document.getElementById('successMessage');
    successDiv.textContent = '✅ ' + message
    successDiv.classList.remove('hidden');
    setTimeout(() => {
        successDiv.classList.add('hidden');
    }, 3000);
}

//Cancel the Edit
function cancelEdit() {
    editingIndex = -1;
    document.getElementById('editForm').style.display = '';
    document.getElementById('submitBtn').textContent = 'Register Student';
    document.getElementById('cancelBtn').classList.add('hidden');
    clearAllErrors();
}


// Form submission and Validation
document.getElementById('studentForm').addEventListener('submit', function (e) {
    e.preventDefault();

    const formData = {
        name: document.getElementById('studentName').value.trim(),
        id: document.getElementById('studentID').value.trim(),
        email: document.getElementById('emailAddress').value.trim(),
        contact: document.getElementById('contactNumber').value.trim()
    };

    if (!ValidateForm(formData))
        return;

    if (editingIndex >= 0) {
        // Update existing record
        studentsRecord[editingIndex] = formData;
        showSuccessMessage('Student record updated successfully');
        cancelEdit();
    } else {
        // Add new record
        studentsRecord.push(formData);
        showSuccessMessage('Student registered successfully');
    }

    saveStudents();
    this.reset();

})


// Validate the Form Data
function ValidateForm(formData) {
    const { name, id, email, contact } = formData
    let isValid = true;

    clearAllErrors();

    if (!name || !id || !email || !contact) {
        if (!name) showError('studentName', 'nameError', 'Student name is required');
        if (!id) showError('studentID', 'idError', 'Student ID is required');
        if (!email) showError('emailAddress', 'emailError', 'Email is required');
        if (!contact) showError('contactNumber', 'contactError', 'Contact number is required');
        return false;
    }

    // Validate name
    const nameRegex = /^[a-zA-Z\s]+$/;
    if (!nameRegex.test(name.trim()) && name.trim().length > 0) {
        showError('studentName', 'nameError', 'Please enter a valid name (letters and spaces only)');
        isValid = false;
    }

    // Validate student ID
    const idRegex = /^[a-zA-Z0-9]/
    if (!idRegex.test(id) && id.length !== 8) {
        showError('studentID', 'idError', 'Field must contain only 8 characters');
        isValid = false;
    }

    if (editingIndex === -1 && studentsRecord.some(student => student.id == id )) {
        showError('studentID', 'idError', 'Student ID already exists');
        isValid = false;
    }

    // Validate email
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
    if (!emailRegex.test(email)) {
        showError('emailAddress', 'emailError', 'Please enter a valid email address');
        isValid = false;
    }

    // Validate contact
    const contactRegex = /^\d{10}$/;
    if (!contactRegex.test(contact)) {
        showError('contactNumber', 'contactError', 'Field must contain only 10 digits');
        isValid = false;
    }

    return isValid;
}

//Show the errors
function showError(fieldId, errorId, message) {
    const field = document.getElementById(fieldId);
    const errorDiv = document.getElementById(errorId);
    field.classList.add('error');
    errorDiv.textContent = message;
    errorDiv.style.display = 'block';
}

//Clear all the errors
function clearAllErrors() {
    document.querySelectorAll('.error-message').forEach(ele => {
        ele.style.display = "none";
    });
    document.querySelectorAll('.error').forEach(ele => {
        ele.classList.remove("error");
    });
}


// Display records
function displayRecords() {
    const recordsBody = document.getElementById('recordsBody');
    const noRecords = document.getElementById('noRecords');
    const recordsGrid = document.getElementById('recordsGrid');

    if (studentsRecord.length === 0) {

        recordsGrid.classList.add('hidden');
        noRecords.classList.remove('hidden')
        noRecords.classList.add('flex')
        return;
    }

    recordsGrid.classList.remove('hidden');
    noRecords.classList.remove('flex');
    noRecords.classList.add('hidden');

    recordsBody.innerHTML = '';
    studentsRecord.forEach((student, index) => {
        const row = document.createElement('tr');
        row.classList.add('records-body')
        row.innerHTML = `
            <td>${index + 1}.</td>
            <td class="min-w-24 break-words">
                ${student.name}
            </td>
            <td>${student.id}</td>
            <td class="min-w-32 break-all">
                ${student.email}
            </td>
            <td>${student.contact}</td>
            <td>
                <div class="action-buttons">
                    <button class="btn-secondary" onclick="editStudent(${index})">Edit</button>
                    <button class="btn-danger" onclick="deleteStudent(${index})">Delete</button>
                </div>
            </td>
        `
        recordsBody.appendChild(row);
    })
}

// Search Student record
const searchInput = document.getElementById('searchInput');

searchInput.addEventListener('input', function () {
    const searchStudent = searchInput.value.toLowerCase();
    const rows = document.querySelectorAll('#recordsBody tr');
    const noMatchRecords = document.getElementById('noMatchRecords');

    let records = false;

    rows.forEach(row => {
        const text = row.textContent.toLowerCase();
        if (!searchStudent || text.includes(searchStudent)) {
            row.classList.remove('hidden');
            records = true;
        }

        else {
            row.classList.add('hidden');
        }
    });

    // Toggle “No records” message
    if (records) {
        noMatchRecords.classList.add('hidden');
    } else {
        noMatchRecords.classList.remove('hidden');
        noMatchRecords.classList.add('flex');
    }

});


// Edit student record
function editStudent(index) {
    const student = studentsRecord[index];
    editingIndex = index;

    // Fill form with student data
    document.getElementById('studentName').value = student.name;
    document.getElementById('studentID').value = student.id;
    document.getElementById('emailAddress').value = student.email;
    document.getElementById('contactNumber').value = student.contact;

    // Update form appearance
    document.getElementById('editForm').style.display = 'block';
    document.getElementById('submitBtn').textContent = 'Update Student';
    document.getElementById('cancelBtn').classList.remove('hidden');

    // Switch to registration tab
    showTab('registrationTab', 'registrationBtn');

    clearAllErrors();
}

//Delete student info
function deleteStudent(index) {
    const modal = document.getElementById('deleteModal')
    deleteIndex = index;
    const student = studentsRecord[index];

    document.getElementById('studentInfo').innerHTML = `
        <p><span class="student-info">Student Name :</span>${student.name}</p>
        <p><span class="student-info">Student ID :  </span>${student.id}</p>
        <p><span class="student-info">Email :  </span>${student.email}</p>
        <p><span class="student-info">Contact :  </span>${student.contact}</p>
    `;

    //Show modal
    modal.showModal();
    modal.classList.replace('scale-0','scale-100')
    document.body.style.overflow = 'hidden'
}

//Conform delete  
function confirmDelete() {
    if (deleteIndex >= 0) {
        studentsRecord.splice(deleteIndex,1);
        saveStudents();
        displayRecords();
        closeDeleteModal();
        setTimeout(() => {
            window.alert("✅ Successfully Deleted")
        }, 500);
        
    }
}


//Close the modal
function closeDeleteModal() {
    deleteIndex = -1;
    const modal = document.getElementById('deleteModal');
    modal.close();
    document.body.style.overflow = '';
    modal.classList.replace('scale-100','scale-0')
}

// Close modal when clicking outside
document.getElementById('deleteModal').addEventListener('click', function (e) {

    if (e.target === this) {
        closeDeleteModal();
    }
});