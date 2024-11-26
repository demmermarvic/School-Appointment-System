document.addEventListener('DOMContentLoaded', () => {
    // Load appointments data from localStorage
    const savedAppointments = localStorage.getItem('appointments');
    const savedAppointmentsByDate = localStorage.getItem('appointmentsByDate');
    
    let appointments = savedAppointments ? JSON.parse(savedAppointments) : {};
    let appointmentsByDate = savedAppointmentsByDate ? JSON.parse(savedAppointmentsByDate) : {};

    const adminCalendar = document.getElementById('admin-calendar');
    const adminMonthYear = document.getElementById('admin-month-year');
    const adminSelectedDate = document.getElementById('admin-selected-date');
    const adminPopup = document.getElementById('admin-popup');
    const popupDate = document.getElementById('popup-date');
    const appointmentsList = document.getElementById('admin-appointments-list');
    
    let currentAdminDate = new Date();

    // Update admin calendar
    function updateAdminCalendar() {
        const adminCalendar = document.getElementById('admin-calendar');
        const adminMonthYear = document.getElementById('admin-month-year');
        
        const year = currentAdminDate.getFullYear();
        const month = currentAdminDate.getMonth();
        const firstDay = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();

        // Get updated appointments from localStorage
        const appointmentsByDate = JSON.parse(localStorage.getItem('appointmentsByDate') || '{}');

        adminMonthYear.textContent = `${monthNames[month]} ${year}`;
        adminCalendar.innerHTML = '';

        // Add day headers
        const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        days.forEach(day => {
            const dayHeader = document.createElement('div');
            dayHeader.classList.add('day-header');
            dayHeader.textContent = day;
            adminCalendar.appendChild(dayHeader);
        });

        // Add empty cells
        for (let i = 0; i < firstDay; i++) {
            const emptyCell = document.createElement('div');
            adminCalendar.appendChild(emptyCell);
        }

        // Add days
        for (let day = 1; day <= daysInMonth; day++) {
            const date = new Date(year, month, day);
            const dateString = date.toDateString();
            const dateKey = `${month + 1}/${day}`;

            const dayElement = document.createElement('div');
            dayElement.classList.add('date');
            dayElement.textContent = day;
            dayElement.dataset.date = dateString;

            // Add appointment count badge if there are appointments
            if (appointmentsByDate[dateString] && appointmentsByDate[dateString].length > 0) {
                const countBadge = document.createElement('div');
                countBadge.classList.add('appointment-count');
                countBadge.textContent = appointmentsByDate[dateString].length;
                dayElement.appendChild(countBadge);

                // Add a class to indicate there are appointments
                dayElement.classList.add('has-appointments');
            }

            // Add today class if it's the current date
            if (dateString === new Date().toDateString()) {
                dayElement.classList.add('today');
            }

            // Add holiday class if it's a holiday
            if (philippineHolidays[dateKey]) {
                dayElement.classList.add('holiday');
                dayElement.title = philippineHolidays[dateKey].name;
            }

            dayElement.addEventListener('click', () => showAppointments(dateString));
            adminCalendar.appendChild(dayElement);
        }
    }

    // Show appointments for selected date
    function showAppointments(dateString) {
        adminSelectedDate.textContent = dateString;
        popupDate.textContent = dateString;
        appointmentsList.innerHTML = '';

        const appointmentsByDate = JSON.parse(localStorage.getItem('appointmentsByDate') || '{}');
        console.log(`Showing appointments for ${dateString}:`, appointmentsByDate[dateString]); // Debug log

        if (appointmentsByDate[dateString] && appointmentsByDate[dateString].length > 0) {
            const appointmentsWrapper = document.createElement('div');
            appointmentsWrapper.classList.add('appointments-wrapper');
            
            appointmentsByDate[dateString].forEach(appointment => {
                const appointmentItem = document.createElement('div');
                appointmentItem.classList.add('appointment-item');
                appointmentItem.innerHTML = `
                    <div class="appointment-header">
                        <h4>${appointment.fullName}</h4>
                    </div>
                    <div class="appointment-details">
                        <p><strong>Program:</strong> ${appointment.program}</p>
                        <p><strong>Contact Number:</strong> ${appointment.contactNumber}</p>
                        <p><strong>Year Level:</strong> ${appointment.yearLevel}</p>
                        <p><strong>Documentation:</strong> ${appointment.documentation}</p>
                    </div>
                `;
                appointmentsWrapper.appendChild(appointmentItem);
            });
            
            appointmentsList.appendChild(appointmentsWrapper);
        } else {
            const noAppointments = document.createElement('div');
            noAppointments.classList.add('no-appointments');
            noAppointments.textContent = 'No appointments scheduled for this date';
            appointmentsList.appendChild(noAppointments);
        }

        adminPopup.style.display = 'block';
    }

    // Event listeners
    document.getElementById('admin-prev-month').addEventListener('click', () => {
        currentAdminDate.setMonth(currentAdminDate.getMonth() - 1);
        updateAdminCalendar();
    });

    document.getElementById('admin-next-month').addEventListener('click', () => {
        currentAdminDate.setMonth(currentAdminDate.getMonth() + 1);
        updateAdminCalendar();
    });

    document.querySelector('.admin-close-btn').addEventListener('click', () => {
        adminPopup.style.display = 'none';
    });

    // Close popup when clicking outside
    window.addEventListener('click', (e) => {
        if (e.target === adminPopup) {
            adminPopup.style.display = 'none';
        }
    });

    // Initial calendar update
    updateAdminCalendar();

    // Add this function for the mini calendar
    function initializeMiniCalendar() {
        const miniCalendarContainer = document.querySelector('.side-calendar-container');
        if (!miniCalendarContainer) return;

        // Create mini calendar structure
        miniCalendarContainer.innerHTML = `
            <div class="mini-calendar-header">
                <span id="mini-month-year"></span>
            </div>
            <div class="mini-calendar" id="mini-calendar"></div>
        `;

        function updateMiniCalendar() {
            const miniCalendar = document.getElementById('mini-calendar');
            const miniMonthYear = document.getElementById('mini-month-year');
            const currentDate = new Date();
            const year = currentDate.getFullYear();
            const month = currentDate.getMonth();
            
            // Set month and year
            miniMonthYear.textContent = `${monthNames[month]} ${year}`;
            
            // Clear previous calendar
            miniCalendar.innerHTML = '';
            
            // Add day headers
            const days = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
            days.forEach(day => {
                const dayHeader = document.createElement('div');
                dayHeader.classList.add('mini-day-header');
                dayHeader.textContent = day;
                miniCalendar.appendChild(dayHeader);
            });

            // Get first day of month and total days
            const firstDay = new Date(year, month, 1).getDay();
            const daysInMonth = new Date(year, month + 1, 0).getDate();

            // Add empty cells for days before start of month
            for (let i = 0; i < firstDay; i++) {
                const emptyCell = document.createElement('div');
                emptyCell.classList.add('mini-date', 'empty');
                miniCalendar.appendChild(emptyCell);
            }

            // Add days of month
            for (let day = 1; day <= daysInMonth; day++) {
                const dateCell = document.createElement('div');
                dateCell.classList.add('mini-date');
                dateCell.textContent = day;

                // Highlight current day
                if (day === currentDate.getDate()) {
                    dateCell.classList.add('mini-today');
                }

                miniCalendar.appendChild(dateCell);
            }
        }

        updateMiniCalendar();
    }

    // Add this to your DOMContentLoaded event listener
    initializeMiniCalendar();

    // Add this function to display current day's appointments
    function updateSideInfo() {
        const sideInfoContainer = document.querySelector('.side-moreInfo-container');
        if (!sideInfoContainer) return;

        const currentDate = new Date().toDateString();
        const appointmentsByDate = JSON.parse(localStorage.getItem('appointmentsByDate') || '{}');
        
        sideInfoContainer.innerHTML = `
            <h3 style="color: #333; margin-bottom: 15px;">Today's Appointments</h3>
            <div class="today-appointments-list"></div>
        `;

        const appointmentsList = sideInfoContainer.querySelector('.today-appointments-list');

        if (appointmentsByDate[currentDate] && appointmentsByDate[currentDate].length > 0) {
            appointmentsByDate[currentDate].forEach(appointment => {
                const appointmentItem = document.createElement('div');
                appointmentItem.classList.add('side-appointment-item');
                appointmentItem.innerHTML = `
                    <div class="side-appointment-name">${appointment.fullName}</div>
                `;
                appointmentsList.appendChild(appointmentItem);
            });
        } else {
            const noAppointments = document.createElement('div');
            noAppointments.classList.add('no-appointments-today');
            noAppointments.textContent = 'No appointments scheduled for today';
            appointmentsList.appendChild(noAppointments);
        }
    }

    // Add this to your DOMContentLoaded event listener
    updateSideInfo();

    // Make updateAdminCalendar globally available
    window.updateAdminCalendar = updateAdminCalendar;

    // Add event listener to update calendar when appointments change
    window.addEventListener('storage', (e) => {
        if (e.key === 'appointmentsByDate') {
            updateAdminCalendar();
        }
    });

    // Update calendar when appointments are modified
    document.addEventListener('appointmentsUpdated', () => {
        updateAdminCalendar();
    });
});