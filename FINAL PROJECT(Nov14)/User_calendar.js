const philippineHolidays = {
    '1/1': { name: 'New Year\'s Day' },
    '2/25': { name: 'EDSA People Power Revolution' },
    '4/9': { name: 'Araw ng Kagitingan' },
    '5/1': { name: 'Labor Day' },
    '6/12': { name: 'Independence Day' },
    '8/21': { name: 'Ninoy Aquino Day' },
    '11/1': { name: 'All Saints\' Day' },
    '11/30': { name: 'Bonifacio Day' },
    '12/25': { name: 'Christmas Day' },
    '12/30': { name: 'Rizal Day' },
};

const appointments = {};
let selectedDate = null;
const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'
];
const currentDate = new Date();
const calendarElement = document.getElementById('calendar');
const monthYearElement = document.getElementById('month-year');
const selectedDateElement = document.getElementById('selected-date');
const appointmentInfoElement = document.getElementById('appointment-info');
const holidayInfoElement = document.getElementById('holiday-info');
const workingHoursElement = document.getElementById('working-hours');
const proceedButton = document.getElementById('proceed-button');
const popupContainer = document.getElementById('popup-container');
const closePopupButton = document.getElementById('close-popup');
const nextButton = document.getElementById('next-button');
const appointmentsByDate = {};

let isFormInProgress = false;

// Load existing appointments from localStorage if any exist
const savedAppointments = localStorage.getItem('appointments');
const savedAppointmentsByDate = localStorage.getItem('appointmentsByDate');

if (savedAppointments) {
    Object.assign(appointments, JSON.parse(savedAppointments));
}
if (savedAppointmentsByDate) {
    Object.assign(appointmentsByDate, JSON.parse(savedAppointmentsByDate));
}

// Update the calendar to reflect any loaded appointments
updateCalendar();

function updateCalendar() {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    monthYearElement.textContent = `${monthNames[month]} ${year}`;
    calendarElement.innerHTML = '';

    for (let i = 0; i < firstDay; i++) {
        const emptyCell = document.createElement('div');
        calendarElement.appendChild(emptyCell);
    }

    for (let day = 1; day <= daysInMonth; day++) {
        const date = new Date(year, month, day);
        const dateString = date.toDateString();
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const dayElement = document.createElement('div');
        dayElement.classList.add('date');
        dayElement.textContent = day;
        dayElement.dataset.date = dateString;

        // Disable past dates
        if (date < today) {
            dayElement.classList.add('disabled');
            dayElement.style.cursor = 'not-allowed';
            dayElement.style.color = '#ccc';
        } else {
            const counts = updateAppointmentCount(dateString);
            if (counts.available === 0) {
                dayElement.classList.add('full');
            }
            
            if (counts.total - counts.available > 0) {
                const countBadge = document.createElement('div');
                countBadge.classList.add('appointment-count');
                countBadge.textContent = counts.total - counts.available;
                dayElement.appendChild(countBadge);
            }

            dayElement.addEventListener('click', () => selectDate(dateString));
        }

        if (dateString === new Date().toDateString()) {
            dayElement.classList.add('today');
        }

        if (philippineHolidays[`${month + 1}/${day}`]) {
            dayElement.classList.add('holiday');
            dayElement.dataset.holiday = philippineHolidays[`${month + 1}/${day}`].name;
            dayElement.style.cursor = 'not-allowed';
        }

        calendarElement.appendChild(dayElement);
    }
}

function updateAppointmentCount(dateString) {
    const appointmentsByDate = JSON.parse(localStorage.getItem('appointmentsByDate') || '{}');
    const currentCount = appointmentsByDate[dateString]?.length || 0;
    const maxAppointments = 50; // Maximum appointments per day
    
    return {
        available: maxAppointments - currentCount,
        total: maxAppointments
    };
}

function selectDate(dateString) {
    if (!dateString) return;

    const selectedDateObj = new Date(dateString);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Prevent selecting past dates
    if (selectedDateObj < today) {
        alert('Cannot schedule appointments for past dates');
        return;
    }

    // Set the selected date (don't reassign the parameter)
    selectedDateElement.textContent = dateString;
    clearAppointmentDetails();

    const counts = updateAppointmentCount(dateString);
    
    if (philippineHolidays[`${selectedDateObj.getMonth() + 1}/${selectedDateObj.getDate()}`]) {
        holidayInfoElement.textContent = `${philippineHolidays[`${selectedDateObj.getMonth() + 1}/${selectedDateObj.getDate()}`].name} - No Working Hours`;
        proceedButton.style.display = 'none';
    } else {
        holidayInfoElement.textContent = '';
        if (counts.available > 0) {
            proceedButton.style.display = 'inline-block';
            appointmentInfoElement.textContent = 
                `${counts.total - counts.available} Appointment(s) Scheduled - ${counts.available} slots available`;
        } else {
            proceedButton.style.display = 'none';
            appointmentInfoElement.textContent = 'Fully Booked';
        }
    }

    // Update the global selectedDate variable
    selectedDate = dateString;

    // Update appointments display
    if (!appointments[dateString]) {
        appointments[dateString] = { count: 0 };
    }

    const bookedCount = appointments[dateString].count;
    appointmentInfoElement.textContent = `${bookedCount} Appointment(s) Scheduled`;

    if (appointments[dateString].count >= 50) {
        appointmentInfoElement.textContent += " - Fully Booked";
    }

    updateAppointmentList(dateString);
}

proceedButton.addEventListener('click', () => {
    if (selectedDate && !isFormInProgress) {
        isFormInProgress = true;
        proceedButton.disabled = true;
        proceedButton.style.opacity = '0.5';
        proceedButton.style.cursor = 'not-allowed';
        popupContainer.classList.add('active');
    }
});

nextButton.addEventListener('click', () => {
    popupContainer.classList.add('active');
});

closePopupButton.addEventListener('click', () => {
    popupContainer.classList.remove('active');
    isFormInProgress = false;
    proceedButton.disabled = false;
    proceedButton.style.opacity = '1';
    proceedButton.style.cursor = 'pointer';
});

const appointmentsListContainer = document.querySelector('#appointments-list');
const mainContainer = document.querySelector('.main-container');

let appointmentData = [];

document.getElementById('appointment-form').addEventListener('submit', (e) => {
        e.preventDefault();

        const fullName = document.getElementById('full-name').value;
        const program = document.getElementById('program').value;
        const contactNumber = document.getElementById('contact-number').value;
        const yearLevel = document.getElementById('year-level').value;
        const documentationCheckboxes = document.querySelectorAll('input[name="documentation"]:checked');
        const documentation = Array.from(documentationCheckboxes).map(checkbox => checkbox.value).join(', ');

        const appointmentDetails = {
            fullName,
            program,
            contactNumber,
            yearLevel,
            documentation
        };

        // Store appointment by date
        if (!appointmentsByDate[selectedDate]) {
            appointmentsByDate[selectedDate] = [];
        }
        appointmentsByDate[selectedDate].push(appointmentDetails);

        // Now increment the appointment count after successful form submission
        if (!appointments[selectedDate]) {
            appointments[selectedDate] = { count: 0 };
        }
        appointments[selectedDate].count += 1;

        // Save to localStorage
        localStorage.setItem('appointments', JSON.stringify(appointments));
        localStorage.setItem('appointmentsByDate', JSON.stringify(appointmentsByDate));

        appointmentData.push(appointmentDetails);

        const appointmentInfoElement = document.getElementById('appointment-info');
        appointmentInfoElement.innerHTML = `
            <strong>Appointment Scheduled!</strong>
        `;

        popupContainer.classList.remove('active');
        document.getElementById('appointment-form').reset();

        // Update the appointments list for the current selected date
        updateAppointmentList(selectedDate);
        updateCalendar();

        // Reset the form progress flag
        isFormInProgress = false;
        
        // Re-enable the proceed button for future appointments
        proceedButton.disabled = false;
        proceedButton.style.opacity = '1';
        proceedButton.style.cursor = 'pointer';

        alert('Appointment successfully scheduled!');
});

function showAppointmentDetails(appointment, clickedElement) {
    // Remove any existing detail containers
    const existingDetailsContainer = document.querySelector('.appointment-detail-container');
    if (existingDetailsContainer) {
        existingDetailsContainer.remove();
    }

    const appointmentDetailContainer = document.createElement('div');
    appointmentDetailContainer.classList.add('appointment-detail-container');
    appointmentDetailContainer.style.cssText = `
        border: 1px solid #ccc;
        padding: 10px;
        margin-top: 5px;
        position: relative;
        background-color: white;
        box-shadow: 0 2px 5px rgba(0,0,0,0.2);
        z-index: 1000;
        width: calc(100% - 20px);
    `;

    const closeButton = document.createElement('button');
    closeButton.textContent = '×';
    closeButton.style.cssText = `
        position: absolute;
        top: 5px;
        right: 5px;
        border: none;
        background-color: transparent;
        font-size: 18px;
        cursor: pointer;
        color: #666;
        padding: 0 5px;
    `;

    closeButton.addEventListener('click', (e) => {
        e.stopPropagation();
        appointmentDetailContainer.remove();
    });

    appointmentDetailContainer.innerHTML = `
        <h4 style="margin-top: 0; margin-bottom: 10px;">Appointment Details</h4>
        <strong>Full Name:</strong> ${appointment.fullName}<br />
        <strong>Program:</strong> ${appointment.program}<br />
        <strong>Contact Number:</strong> ${appointment.contactNumber}<br />
        <strong>Year Level:</strong> ${appointment.yearLevel}<br />
        <strong>Documentation Requested:</strong> ${appointment.documentation}<br />
    `;

    appointmentDetailContainer.appendChild(closeButton);

    // Insert the details container after the clicked list item
    clickedElement.insertAdjacentElement('afterend', appointmentDetailContainer);
}

function updateAppointmentInfo(dateKey) {
    const bookedCount = appointments[dateKey] ? appointments[dateKey].count : 0;
    appointmentInfoElement.textContent = `${bookedCount} Appointment(s) Scheduled`;

    if (bookedCount >= 1000) {
        appointmentInfoElement.textContent += " - Fully Booked";
    }
}

document.getElementById('prev-month').addEventListener('click', () => {
    currentDate.setMonth(currentDate.getMonth() - 1);
    updateCalendar();
});

document.getElementById('next-month').addEventListener('click', () => {
    currentDate.setMonth(currentDate.getMonth() + 1);
    updateCalendar();
});

function updateAppointmentList(dateString) {
    const appointmentsListContainer = document.querySelector('#appointments-list');
    appointmentsListContainer.innerHTML = ''; // Clear existing appointments
    clearAppointmentDetails(); // Clear any existing detail containers

    if (appointmentsByDate[dateString]) {
        appointmentsByDate[dateString].forEach(appointment => {
            const listItem = document.createElement('li');
            listItem.textContent = appointment.fullName;
            listItem.style.cursor = 'pointer';
            listItem.style.position = 'relative';
            listItem.addEventListener('click', () => showAppointmentDetails(appointment, listItem));
            appointmentsListContainer.appendChild(listItem);
        });
    }
}

function clearAppointmentDetails() {
    const detailContainers = document.querySelectorAll('.appointment-detail-container');
    detailContainers.forEach(container => container.remove());
}

document.addEventListener('DOMContentLoaded', () => {
    // ... existing code ...

    proceedButton.addEventListener('click', () => {
        if (selectedDate && !isFormInProgress) {
            isFormInProgress = true;
            proceedButton.disabled = true;
            proceedButton.style.opacity = '0.5';
            proceedButton.style.cursor = 'not-allowed';
            popupContainer.classList.add('active');
        }
    });

    closePopupButton.addEventListener('click', () => {
        popupContainer.classList.remove('active');
        isFormInProgress = false;
        proceedButton.disabled = false;
        proceedButton.style.opacity = '1';
        proceedButton.style.cursor = 'pointer';
    });

    // ... rest of your code ...
});





