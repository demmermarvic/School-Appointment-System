// HIDE AND RE-APEAR SIDEBAR

document.querySelector('.hamburger-menu').addEventListener('click', function() {
    const sidebar = document.querySelector('.SIDEBAR');
    const body = document.querySelector('body');
    sidebar.classList.toggle('hidden');
    if (sidebar.classList.contains('hidden')) {
        body.style.paddingLeft = '25px';
    } else {
        body.style.paddingLeft = '95px';
    }
 });

window.addEventListener('resize', function() {
    const sidebar = document.querySelector('.SIDEBAR');
    const body = document.querySelector('body');
    if (window.innerWidth <= 492) {
        sidebar.classList.add('hidden');
        body.style.paddingLeft = '20px';
    } else if (!sidebar.classList.contains('hidden')) {
        body.style.paddingLeft = '95';
    
    }  else if (window.innerWidth >= 492){
        sidebar.classList.remove('hidden');
        body.style.paddingLeft = '95px';
    }
});




// FOR SIDE BAR NAVIGATION

document.addEventListener('DOMContentLoaded', () => {
  const sidebarItems = document.querySelectorAll('.sideBarItem');
  const contentItems = document.querySelectorAll('.content-item');

  // Set up event listeners for sidebar items
  sidebarItems.forEach(item => {
    item.addEventListener('click', () => {
      // Remove 'active' class from all sidebar items
      sidebarItems.forEach(i => i.classList.remove('active'));

      // Add 'active' class to clicked sidebar item
      item.classList.add('active');

      // Hide all content items
      contentItems.forEach(content => content.classList.remove('active'));

      // Show the corresponding content item based on the clicked sidebar item
      const contentId = item.getAttribute('data-content');
      document.getElementById(contentId).classList.add('active');
    });
  });
  
  // Optionally: Trigger click on the first item to display the initial content
  sidebarItems[0].click();
});