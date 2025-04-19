// Initialize tooltips
document.addEventListener('DOMContentLoaded', function() {
    // Initialize Bootstrap tooltips
    const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    const tooltipList = tooltipTriggerList.map(function (tooltipTriggerEl) {
        return new bootstrap.Tooltip(tooltipTriggerEl);
    });

    // Help sidebar functionality
    const helpSidebar = document.getElementById('helpSidebar');
    const helpToggleBtn = document.getElementById('helpToggleBtn');
    const closeHelpSidebar = document.getElementById('closeHelpSidebar');

    // Toggle help sidebar
    helpToggleBtn.addEventListener('click', function() {
        helpSidebar.classList.toggle('active');
    });

    // Close help sidebar
    closeHelpSidebar.addEventListener('click', function() {
        helpSidebar.classList.remove('active');
    });

    // Close help sidebar when clicking outside
    document.addEventListener('click', function(event) {
        if (!helpSidebar.contains(event.target) && event.target !== helpToggleBtn) {
            helpSidebar.classList.remove('active');
        }
    });

    // Navigation links for help sections
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            if (this.textContent.trim().includes('Dashboard')) {
                showHelpSection('dashboardHelp');
            } else if (this.textContent.trim().includes('Add Content')) {
                showHelpSection('contentHelp');
            } else if (this.textContent.trim().includes('Analytics')) {
                showHelpSection('analyticsHelp');
            } else if (this.textContent.trim().includes('Settings')) {
                showHelpSection('settingsHelp');
            }
        });
    });

    // Show specific help section and open sidebar
    function showHelpSection(sectionId) {
        // Hide all sections
        const sections = document.querySelectorAll('.help-sidebar-section');
        sections.forEach(section => {
            section.style.display = 'none';
        });
        
        // Show requested section
        const section = document.getElementById(sectionId);
        if (section) {
            section.style.display = 'block';
            helpSidebar.classList.add('active');
        }
    }

    // Add Content functionality
    const addContentBtn = document.getElementById('addContentBtn');
    const addContentForm = document.getElementById('addContentForm');
    const addContentLink = document.getElementById('addContentLink');

    // Open modal when Add Content link is clicked
    addContentLink.addEventListener('click', function(e) {
        e.preventDefault();
        const addContentModal = new bootstrap.Modal(document.getElementById('addContentModal'));
        addContentModal.show();
    });

    // Handle form submission
    addContentBtn.addEventListener('click', function() {
        const theme = document.getElementById('contentTheme').value;
        const aiTool = document.getElementById('aiTool').value;
        const notes = document.getElementById('additionalNotes').value;
        
        if (!theme) {
            alert('Please enter a theme for your content');
            return;
        }
        
        // Submit content to API
        fetch('/api/content', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ theme, aiTool, notes })
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                // Close modal
                bootstrap.Modal.getInstance(document.getElementById('addContentModal')).hide();
                
                // Refresh content (in a real app, this would update the table)
                alert('Content added successfully! It will be processed in the next automation run.');
                
                // Clear form
                document.getElementById('contentTheme').value = '';
                document.getElementById('additionalNotes').value = '';
            } else {
                alert('Error: ' + (data.error || 'Failed to add content'));
            }
        })
        .catch(error => {
            console.error('Error:', error);
            alert('An error occurred. Please try again.');
        });
    });

    // Load content from API
    fetch('/api/content')
        .then(response => response.json())
        .then(data => {
            // In a real app, this would populate the content table
            console.log('Content loaded:', data);
        })
        .catch(error => {
            console.error('Error loading content:', error);
        });

    // Load stats from API
    fetch('/api/stats')
        .then(response => response.json())
        .then(data => {
            // In a real app, this would update the stats display
            console.log('Stats loaded:', data);
        })
        .catch(error => {
            console.error('Error loading stats:', error);
        });

    // Load activity from API
    fetch('/api/activity')
        .then(response => response.json())
        .then(data => {
            // In a real app, this would update the activity list
            console.log('Activity loaded:', data);
        })
        .catch(error => {
            console.error('Error loading activity:', error);
        });

    // Contextual help for specific elements
    document.querySelectorAll('.help-tooltip').forEach(tooltip => {
        tooltip.addEventListener('click', function(e) {
            e.stopPropagation();
            
            // Determine which help section to show based on closest heading or container
            let section = 'dashboardHelp'; // Default
            
            const container = this.closest('.card');
            if (container) {
                const header = container.querySelector('.card-header h5');
                if (header) {
                    const headerText = header.textContent.trim().toLowerCase();
                    
                    if (headerText.includes('content queue')) {
                        section = 'contentHelp';
                    } else if (headerText.includes('automation status')) {
                        section = 'automationHelp';
                    } else if (headerText.includes('quick stats')) {
                        section = 'analyticsHelp';
                    } else if (headerText.includes('recent activity')) {
                        section = 'analyticsHelp';
                    }
                }
            }
            
            // If inside modal, show content help
            if (this.closest('#addContentModal')) {
                section = 'contentHelp';
            }
            
            showHelpSection(section);
        });
    });
});
