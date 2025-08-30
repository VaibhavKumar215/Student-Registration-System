let currentTab = "registrationTab";      // by default: Registration tab
let currentTabBtn = document.querySelector(".tab-btn.active"); // default button
const studentsRecord = [];
let validata = false;

// Tab functionality
function showTab(tabId, btn) {
    currentTabBtn.classList.remove("active");
    btn.classList.add("active");

    document.getElementById(currentTab).classList.remove("active");
    document.getElementById(tabId).classList.add("active");

    currentTab = tabId;
    currentTabBtn = btn;
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

    studentsRecord.push(formData);
    localStorage.setItem('studentsRecord', JSON.stringify(studentsRecord));
    showSuccessMessage('Student registered successfully');
    this.reset();

})

// Validating the Form Data
function ValidateForm(formData) {
    const {name, id, email, contact} = formData
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
    if (id.length !== 6) {
        showError('studentID', 'idError', 'Field must contain only 6 characters');
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

function showError(fieldId, errorId, message) {
    const field = document.getElementById(fieldId);
    const errorDiv = document.getElementById(errorId);
    field.classList.add('error');
    errorDiv.textContent = message;
    errorDiv.style.display = 'block';
}

function clearAllErrors() {
    document.querySelectorAll('.error-message').forEach(ele => {
        ele.style.display = "none";
    });
    document.querySelectorAll('.error').forEach(ele => {
        ele.classList.remove("error");
    });
}
