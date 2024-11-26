//ADDING AND DELETING ANNOUNCEMENT

document.addEventListener('DOMContentLoaded', () => {
    const addAnnouncementBtn = document.querySelector('.add-announcement-btn');
    const announcementForm = document.querySelector('.announcement-form');
    const saveAnnouncementBtn = document.getElementById('save-announcement-btn');
    const mainAnnouncementContainer = document.getElementById('main-announcement-container');
    const announcementTitle = document.getElementById('announcement-title');
    const announcementText = document.getElementById('announcement-text');
    const announcementImportant = document.getElementById('announcement-important');

    let announcements = [];

    function renderAnnouncements() {
      mainAnnouncementContainer.innerHTML = '';
      if (announcements.length === 0) {
        mainAnnouncementContainer.innerHTML = '<p class="no-announcements">No announcements</p>';
      } else {
        announcements.forEach((announcement, index) => {
          const announcementDiv = document.createElement('div');
          announcementDiv.classList.add('main-announcement-info');
          if (announcement.important) {
            announcementDiv.classList.add('important');
          }
          announcementDiv.innerHTML = `
            <h1>${announcement.title}</h1>
            <hr>
            <p>${announcement.text}</p>
            <button class="delete-btn" data-index="${index}">
              &times
            </button>
          `;
          mainAnnouncementContainer.appendChild(announcementDiv);
        });
      }
    }

    addAnnouncementBtn.addEventListener('click', () => {
      announcementForm.style.display = announcementForm.style.display === 'none' || announcementForm.style.display === '' ? 'block' : 'none';
    });

    saveAnnouncementBtn.addEventListener('click', () => {
      const title = announcementTitle.value;
      const text = announcementText.value;
      const important = announcementImportant.checked;
      if (title && text) {
        announcements.unshift({ title, text, important });
        announcements.sort((a, b) => b.important - a.important || announcements.indexOf(a) - announcements.indexOf(b));
        renderAnnouncements();
        announcementForm.style.display = 'none';
        announcementTitle.value = '';
        announcementText.value = '';
        announcementImportant.checked = false;
      } else {
        alert('Please fill in both the title and text');
      }
    });

    mainAnnouncementContainer.addEventListener('click', (e) => {
      if (e.target.classList.contains('delete-btn')) {
        const index = e.target.getAttribute('data-index');
        announcements.splice(index, 1);
        renderAnnouncements();
      }
    });

    renderAnnouncements();
});
