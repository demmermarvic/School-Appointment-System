class BillingSystem {
    constructor() {
        this.appointments = JSON.parse(localStorage.getItem('appointmentsByDate')) || {};
        this.currentDate = new Date();
        this.documentFees = {
            'Diploma (₱400.00)': 400,
            'Certificate of Transfer Credentials (₱100.00)': 100,
            'Form 137 (₱100.00)': 100,
            'Certification (₱30.00)': 30,
            'Transcript of Records (₱50.00 per page)': 50,
            'Authentication (₱20.00 per page)': 20,
            'Send Copy of Registration Form (₱15.00)': 15,
            'Graduation Fee (₱1,000.00)': 1000,
            'Others, Please Specify': 0
        };
        
        this.missedAppointments = JSON.parse(localStorage.getItem('missedAppointments')) || {};
        this.paidAppointments = JSON.parse(localStorage.getItem('paidAppointments')) || {};
        this.init();
        console.log('Initial appointments:', this.appointments);
        this.initStatusPopup();
    }

    init() {
        this.bindElements();
        this.bindEvents();
        this.updateBillingDisplay();
    }

    bindElements() {
        this.prevDateBtn = document.getElementById('prev-billing-date');
        this.nextDateBtn = document.getElementById('next-billing-date');
        this.currentDateSpan = document.getElementById('current-billing-date');
        this.billingCardsContainer = document.getElementById('billing-cards');
        this.totalTransactionsSpan = document.getElementById('total-transactions');
        this.totalAmountSpan = document.getElementById('total-amount');
        
        // Add search input to the billing header
        const searchInput = document.createElement('input');
        searchInput.type = 'text';
        searchInput.id = 'billing-search';
        searchInput.placeholder = 'Search by name...';
        searchInput.className = 'billing-search';
        document.querySelector('.billing-header').appendChild(searchInput);
        this.searchInput = searchInput;
    }

    bindEvents() {
        this.prevDateBtn.addEventListener('click', () => this.changeDate(-1));
        this.nextDateBtn.addEventListener('click', () => this.changeDate(1));
        this.searchInput.addEventListener('input', () => this.filterBillingCards());
    }

    filterBillingCards() {
        const searchTerm = this.searchInput.value.toLowerCase();
        const cards = this.billingCardsContainer.getElementsByClassName('billing-card');
        
        Array.from(cards).forEach(card => {
            const name = card.querySelector('h3').textContent.toLowerCase();
            card.style.display = name.includes(searchTerm) ? 'block' : 'none';
        });
    }

    changeDate(offset) {
        this.currentDate.setDate(this.currentDate.getDate() + offset);
        this.updateBillingDisplay();
    }

    calculateFees(documentation) {
        if (!documentation) return 0;
        
        try {
            // Split by comma and handle potential whitespace
            const docs = documentation.split(',').map(doc => doc.trim());
            let total = 0;
            
            docs.forEach(doc => {
                // Get the exact fee from the documentFees object
                const fee = this.documentFees[doc];
                if (fee !== undefined) {
                    total += fee;
                    console.log(`Added fee for ${doc}: ${fee}`);
                } else {
                    console.warn(`No fee found for document: "${doc}"`);
                }
            });
            
            console.log('Final total:', total);
            return total;
        } catch (error) {
            console.error('Error calculating fees:', error);
            return 0;
        }
    }

    updateBillingDisplay() {
        const dateString = this.currentDate.toDateString();
        this.currentDateSpan.textContent = dateString;
        this.billingCardsContainer.innerHTML = '';

        const appointments = this.appointments[dateString] || [];
        let totalAmount = 0;

        if (appointments.length === 0) {
            const noTransactions = document.createElement('div');
            noTransactions.className = 'no-transactions';
            noTransactions.textContent = 'No transactions for this date';
            this.billingCardsContainer.appendChild(noTransactions);
        } else {
            appointments.forEach((appointment, index) => {
                // Calculate amount for this appointment
                const amount = this.calculateFees(appointment.documentation);
                console.log(`Amount for ${appointment.fullName}: ${amount}`); // Debug log
                totalAmount += amount;

                const card = this.createBillingCard(appointment, amount, index, dateString);
                this.billingCardsContainer.appendChild(card);
            });
        }

        // Update totals display
        console.log(`Final total amount: ${totalAmount}`); // Debug log
        this.totalTransactionsSpan.textContent = appointments.length;
        this.totalAmountSpan.textContent = totalAmount.toFixed(2);
    }

    createBillingCard(appointment, amount, index, dateString) {
        const card = document.createElement('div');
        card.className = 'billing-card';
        if (this.currentDate.toDateString() === new Date().toDateString()) {
            card.classList.add('current-day');
        }

        // Log the appointment data for debugging
        console.log('Creating card for appointment:', appointment);
        console.log('Calculated amount:', amount);

        // Split documents and create vertical list with exact matching of document names
        const documentsList = appointment.documentation.split(',')
            .map(doc => doc.trim())
            .map(doc => {
                const fee = this.documentFees[doc];
                console.log(`Document: "${doc}", Fee: ${fee}`);
                return `<li class="document-item">
                    <span class="document-name">${doc}</span>
                    <span class="document-fee">₱${fee ? fee.toFixed(2) : '0.00'}</span>
                </li>`;
            })
            .join('');

        card.innerHTML = `
            <div class="billing-card-header">
                <h3>${appointment.fullName}</h3>
                <span class="program-year">${appointment.program} - ${appointment.yearLevel}</span>
            </div>
            <div class="billing-details">
                <p><strong>Contact:</strong> ${appointment.contactNumber}</p>
                <div class="documents-list">
                    <strong>Requested Documents:</strong>
                    <ul class="documents-ul">${documentsList}</ul>
                </div>
                <div class="billing-amount">Total Amount Due: ₱${amount.toFixed(2)}</div>
            </div>
            <div class="billing-actions">
                <button class="complete-btn">Mark as Paid</button>
                <button class="cancel-btn">Cancel</button>
            </div>
            <div class="transaction-time">
                Created: ${new Date().toLocaleTimeString()}
            </div>
        `;

        // Add event listeners for the buttons
        card.querySelector('.complete-btn').addEventListener('click', () => 
            this.completeTransaction(dateString, index));
        
        card.querySelector('.cancel-btn').addEventListener('click', () => 
            this.cancelTransaction(dateString, index));

        return card;
    }

    completeTransaction(dateString, index) {
        if (confirm('Mark this transaction as complete and paid?')) {
            const appointments = this.appointments[dateString] || [];
            const completedTransaction = {
                ...appointments[index],
                paidDate: new Date().toLocaleDateString(),
                expectedClaimDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString()
            };

            // Add to paid appointments
            if (!this.paidAppointments[dateString]) {
                this.paidAppointments[dateString] = [];
            }
            this.paidAppointments[dateString].push(completedTransaction);
            localStorage.setItem('paidAppointments', JSON.stringify(this.paidAppointments));

            // Remove from active appointments
            appointments.splice(index, 1);
            if (appointments.length === 0) {
                delete this.appointments[dateString];
            } else {
                this.appointments[dateString] = appointments;
            }

            // Update appointmentsByDate in localStorage to reflect the removal
            const appointmentsByDate = JSON.parse(localStorage.getItem('appointmentsByDate') || '{}');
            if (appointmentsByDate[dateString]) {
                appointmentsByDate[dateString] = appointmentsByDate[dateString].filter((_, i) => i !== index);
                if (appointmentsByDate[dateString].length === 0) {
                    delete appointmentsByDate[dateString];
                }
            }
            localStorage.setItem('appointmentsByDate', JSON.stringify(appointmentsByDate));

            // Update displays
            this.updateBillingDisplay();
            this.updateStatusLists();
            
            // Update admin calendar and side info
            if (typeof updateAdminCalendar === 'function') {
                updateAdminCalendar();
            }
            if (typeof updateSideInfo === 'function') {
                updateSideInfo();
            }
        }
    }

    cancelTransaction(dateString, index) {
        if (confirm('Are you sure you want to cancel this transaction? This cannot be undone.')) {
            const appointments = this.appointments[dateString] || [];
            
            // Store cancelled transaction in history
            const cancelledTransaction = appointments[index];
            const cancelledTransactions = JSON.parse(localStorage.getItem('cancelledTransactions') || '[]');
            cancelledTransactions.push({
                ...cancelledTransaction,
                cancelledDate: new Date().toISOString(),
                reason: 'User cancelled'
            });
            localStorage.setItem('cancelledTransactions', JSON.stringify(cancelledTransactions));
            
            appointments.splice(index, 1);
            
            if (appointments.length === 0) {
                delete this.appointments[dateString];
            } else {
                this.appointments[dateString] = appointments;
            }

            localStorage.setItem('appointmentsByDate', JSON.stringify(this.appointments));
            this.updateBillingDisplay();
            
            if (typeof updateAdminCalendar === 'function') {
                updateAdminCalendar();
            }
        }
    }

    initStatusPopup() {
        const statusBtn = document.getElementById('show-status-btn');
        const statusPopup = document.getElementById('status-popup');
        const closeStatus = document.querySelector('.close-status');
        const tabBtns = document.querySelectorAll('.tab-btn');

        statusBtn.addEventListener('click', () => {
            statusPopup.style.display = 'block';
            this.updateStatusLists();
        });

        closeStatus.addEventListener('click', () => {
            statusPopup.style.display = 'none';
        });

        tabBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                tabBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                
                document.querySelectorAll('.tab-content').forEach(content => {
                    content.classList.remove('active');
                });
                document.getElementById(`${e.target.dataset.tab}-content`).classList.add('active');
            });
        });

        // Add search inputs for both tabs
        const paidContent = document.getElementById('paid-content');
        const missedContent = document.getElementById('missed-content');

        // Add search input for paid appointments
        const paidSearch = document.createElement('input');
        paidSearch.type = 'text';
        paidSearch.className = 'status-search';
        paidSearch.placeholder = 'Search paid appointments...';
        paidSearch.addEventListener('input', (e) => this.filterStatusCards(e.target.value, 'paid'));
        paidContent.insertBefore(paidSearch, paidContent.firstChild);

        // Add search input for missed appointments
        const missedSearch = document.createElement('input');
        missedSearch.type = 'text';
        missedSearch.className = 'status-search';
        missedSearch.placeholder = 'Search missed appointments...';
        missedSearch.addEventListener('input', (e) => this.filterStatusCards(e.target.value, 'missed'));
        missedContent.insertBefore(missedSearch, missedContent.firstChild);
    }

    updateStatusLists() {
        const paidList = document.getElementById('paid-list');
        const missedList = document.getElementById('missed-list');
        
        paidList.innerHTML = '';
        missedList.innerHTML = '';

        // Update paid appointments list
        Object.entries(this.paidAppointments).forEach(([date, appointments]) => {
            appointments.forEach(app => {
                const card = this.createStatusCard(app, date, 'paid');
                paidList.appendChild(card);
            });
        });

        // Update missed appointments list
        Object.entries(this.missedAppointments).forEach(([date, appointments]) => {
            appointments.forEach(app => {
                const card = this.createStatusCard(app, date, 'missed');
                missedList.appendChild(card);
            });
        });
    }

    createStatusCard(appointment, date, status) {
        const card = document.createElement('div');
        card.className = `status-card ${status}`;
        
        const amount = this.calculateFees(appointment.documentation);
        const documentsList = appointment.documentation.split(',')
            .map(doc => doc.trim())
            .map(doc => `<li>${doc} - ₱${this.documentFees[doc] || 0}</li>`)
            .join('');

        card.innerHTML = `
            <div class="status-card-header">
                <h3>${appointment.fullName}</h3>
                <span class="status-badge ${status}">${status.toUpperCase()}</span>
            </div>
            <div class="status-card-details">
                <p><strong>Date:</strong> ${new Date(date).toLocaleDateString()}</p>
                <p><strong>Program:</strong> ${appointment.program}</p>
                <p><strong>Year Level:</strong> ${appointment.yearLevel}</p>
                <p><strong>Contact:</strong> ${appointment.contactNumber}</p>
                <div class="status-documents">
                    <strong>Requested Documents:</strong>
                    <ul>${documentsList}</ul>
                </div>
                <p><strong>Total Amount:</strong> ₱${amount.toFixed(2)}</p>
                ${status === 'paid' ? 
                    `<p><strong>Paid Date:</strong> ${appointment.paidDate}</p>` : 
                    `<p><strong>Expected Claim Date:</strong> ${appointment.expectedClaimDate || 'Not set'}</p>`}
            </div>
        `;

        return card;
    }

    checkMissedAppointments() {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        Object.entries(this.appointments).forEach(([dateString, appointments]) => {
            const appointmentDate = new Date(dateString);
            appointmentDate.setHours(0, 0, 0, 0);
            
            if (appointmentDate < today) {
                // Move to missed appointments
                if (!this.missedAppointments[dateString]) {
                    this.missedAppointments[dateString] = [];
                }
                this.missedAppointments[dateString].push(...appointments);

                // Remove from active appointments
                delete this.appointments[dateString];

                // Update appointmentsByDate to remove missed appointments
                const appointmentsByDate = JSON.parse(localStorage.getItem('appointmentsByDate') || '{}');
                delete appointmentsByDate[dateString];
                localStorage.setItem('appointmentsByDate', JSON.stringify(appointmentsByDate));

                // Update admin calendar and side info
                if (typeof updateAdminCalendar === 'function') {
                    updateAdminCalendar();
                }
                if (typeof updateSideInfo === 'function') {
                    updateSideInfo();
                }
            }
        });

        localStorage.setItem('missedAppointments', JSON.stringify(this.missedAppointments));
        localStorage.setItem('appointmentsByDate', JSON.stringify(this.appointments));
        this.updateBillingDisplay();
        this.updateStatusLists();
    }

    filterStatusCards(searchTerm, type) {
        const listId = type === 'paid' ? 'paid-list' : 'missed-list';
        const cards = document.getElementById(listId).getElementsByClassName('status-card');
        
        Array.from(cards).forEach(card => {
            const name = card.querySelector('h3').textContent.toLowerCase();
            const visible = name.includes(searchTerm.toLowerCase());
            card.style.display = visible ? 'block' : 'none';
        });
    }
}

// Initialize the billing system when the page loads
document.addEventListener('DOMContentLoaded', () => {
    const billingSystem = new BillingSystem();
    // Check for missed appointments every hour
    setInterval(() => billingSystem.checkMissedAppointments(), 3600000);
    // Initial check
    billingSystem.checkMissedAppointments();
});