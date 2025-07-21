// Main application logic
class InvoiceApp {
    constructor() {
        this.currentSection = 'dashboard';
        this.isAuthenticated = false;
        this.currentInvoice = null;
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.loadSettings();
        this.updateDashboardStats();
        this.loadInvoicesList();
        this.checkAuthStatus();
        
        // Set default date
        const today = new Date().toISOString().split('T')[0];
        document.getElementById('invoice-date').value = today;
        
        // Set due date to 30 days from today
        const dueDate = new Date();
        dueDate.setDate(dueDate.getDate() + 30);
        document.getElementById('due-date').value = dueDate.toISOString().split('T')[0];
        
        // Generate default invoice number
        this.generateInvoiceNumber();
        
        // Add first item by default
        InvoiceBuilder.addItem();
    }

    setupEventListeners() {
        // Navigation
        document.querySelectorAll('.nav-item').forEach(item => {
            item.addEventListener('click', (e) => {
                const section = e.currentTarget.dataset.section;
                this.navigateToSection(section);
            });
        });

        // Mobile menu toggle
        const mobileToggle = document.querySelector('.mobile-menu-toggle');
        const sidebar = document.querySelector('.sidebar');
        
        if (mobileToggle) {
            mobileToggle.addEventListener('click', () => {
                sidebar.classList.toggle('active');
            });
        }

        // Dashboard buttons
        document.getElementById('create-new-invoice').addEventListener('click', () => {
            this.navigateToSection('invoice-builder');
        });

        // Template selection
        document.querySelectorAll('[data-template]').forEach(card => {
            card.addEventListener('click', (e) => {
                const template = e.currentTarget.dataset.template;
                this.selectTemplate(template);
            });
        });

        // Modal close
        document.querySelector('.modal-close').addEventListener('click', () => {
            this.closeModal();
        });

        // Settings
        document.getElementById('save-settings').addEventListener('click', () => {
            this.saveSettings();
        });

        // Preview and export
        document.getElementById('preview-invoice').addEventListener('click', () => {
            this.previewInvoice();
        });

        document.getElementById('print-invoice').addEventListener('click', () => {
            window.print();
        });

        document.getElementById('download-pdf').addEventListener('click', () => {
            PDFGenerator.generatePDF();
        });

        // Click outside modal to close
        document.getElementById('preview-modal').addEventListener('click', (e) => {
            if (e.target.id === 'preview-modal') {
                this.closeModal();
            }
        });

        // Escape key to close modal
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeModal();
            }
        });
    }

    navigateToSection(section) {
        // Update active nav item
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.remove('active');
        });
        
        document.querySelector(`[data-section="${section}"]`).classList.add('active');

        // Show section
        document.querySelectorAll('.content-section').forEach(sec => {
            sec.classList.remove('active');
        });
        
        document.getElementById(section).classList.add('active');
        
        this.currentSection = section;

        // Close mobile menu if open
        document.querySelector('.sidebar').classList.remove('active');
    }

    selectTemplate(template) {
        // Update template selection in form
        document.getElementById('template-select').value = template;
        
        // Update visual selection
        document.querySelectorAll('.template-card').forEach(card => {
            card.classList.remove('selected');
        });
        
        document.querySelectorAll(`[data-template="${template}"]`).forEach(card => {
            card.classList.add('selected');
        });
        
        // Update preview if in builder
        if (this.currentSection === 'invoice-builder') {
            InvoiceBuilder.updatePreview();
            this.navigateToSection('invoice-builder');
        }
    }

    previewInvoice() {
        const invoiceData = InvoiceBuilder.getInvoiceData();
        const template = document.getElementById('template-select').value;
        const previewHtml = InvoiceTemplates.generateHTML(invoiceData, template);
        
        document.getElementById('modal-invoice-preview').innerHTML = previewHtml;
        document.getElementById('preview-modal').classList.add('active');
    }

    closeModal() {
        document.getElementById('preview-modal').classList.remove('active');
    }

    generateInvoiceNumber() {
        const invoices = Storage.getInvoices();
        const nextNumber = invoices.length + 1;
        const invoiceNumber = `INV-${nextNumber.toString().padStart(3, '0')}`;
        document.getElementById('invoice-number').value = invoiceNumber;
    }

    updateDashboardStats() {
        const invoices = Storage.getInvoices();
        const totalInvoices = invoices.length;
        const totalAmount = invoices.reduce((sum, inv) => sum + parseFloat(inv.total || 0), 0);
        
        // Calculate this month's invoices
        const currentMonth = new Date().getMonth();
        const currentYear = new Date().getFullYear();
        const thisMonth = invoices.filter(inv => {
            const invoiceDate = new Date(inv.date);
            return invoiceDate.getMonth() === currentMonth && 
                   invoiceDate.getFullYear() === currentYear;
        }).length;

        document.getElementById('total-invoices').textContent = totalInvoices;
        document.getElementById('total-amount').textContent = `$${totalAmount.toFixed(2)}`;
        document.getElementById('this-month').textContent = thisMonth;
    }

    loadInvoicesList() {
        const invoices = Storage.getInvoices();
        const listContainer = document.getElementById('invoices-list');

        if (invoices.length === 0) {
            listContainer.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-file-invoice fa-3x"></i>
                    <h3>No invoices yet</h3>
                    <p>Create your first invoice to get started</p>
                </div>
            `;
            return;
        }

        const invoicesHtml = invoices.map(invoice => `
            <div class="invoice-item" onclick="app.editInvoice('${invoice.id}')">
                <div class="invoice-info">
                    <h4>${invoice.number} - ${invoice.clientName}</h4>
                    <p>Date: ${new Date(invoice.date).toLocaleDateString()}</p>
                </div>
                <div class="invoice-amount">$${parseFloat(invoice.total || 0).toFixed(2)}</div>
            </div>
        `).join('');

        listContainer.innerHTML = invoicesHtml;
    }

    editInvoice(invoiceId) {
        const invoice = Storage.getInvoice(invoiceId);
        if (invoice) {
            this.currentInvoice = invoice;
            InvoiceBuilder.loadInvoice(invoice);
            this.navigateToSection('invoice-builder');
        }
    }

    loadSettings() {
        const settings = Storage.getSettings();
        if (settings.defaultTemplate) {
            document.getElementById('default-template').value = settings.defaultTemplate;
        }
        if (settings.defaultTaxRate !== undefined) {
            document.getElementById('default-tax-rate').value = settings.defaultTaxRate;
            document.getElementById('tax-rate').value = settings.defaultTaxRate;
        }
    }

    saveSettings() {
        const settings = {
            defaultTemplate: document.getElementById('default-template').value,
            defaultTaxRate: parseFloat(document.getElementById('default-tax-rate').value) || 0
        };
        
        Storage.saveSettings(settings);
        
        // Show success message
        const btn = document.getElementById('save-settings');
        const originalText = btn.innerHTML;
        btn.innerHTML = '<i class="fas fa-check"></i> Saved!';
        btn.style.background = 'var(--success-color)';
        
        setTimeout(() => {
            btn.innerHTML = originalText;
            btn.style.background = '';
        }, 2000);
    }

    checkAuthStatus() {
        // Check if user is authenticated with Google Drive
        if (GoogleDrive.isAuthenticated()) {
            this.updateAuthStatus(true);
        }
    }

    updateAuthStatus(isAuthenticated) {
        this.isAuthenticated = isAuthenticated;
        const statusElement = document.getElementById('auth-status');
        const toggleButton = document.getElementById('auth-toggle');
        const authBtn = document.getElementById('google-auth-btn');

        if (isAuthenticated) {
            statusElement.textContent = 'Connected';
            statusElement.style.color = 'var(--success-color)';
            toggleButton.textContent = 'Disconnect';
            authBtn.innerHTML = '<i class="fas fa-check"></i> <span>Connected to Drive</span>';
            authBtn.style.background = 'rgba(16, 185, 129, 0.2)';
        } else {
            statusElement.textContent = 'Not connected';
            statusElement.style.color = 'var(--error-color)';
            toggleButton.textContent = 'Connect';
            authBtn.innerHTML = '<i class="fab fa-google"></i> <span>Connect Google Drive</span>';
            authBtn.style.background = 'rgba(255, 255, 255, 0.1)';
        }
    }
}

// Global functions for template selection
function selectTemplate(template) {
    app.selectTemplate(template);
}

// Initialize app when DOM is loaded
let app;
document.addEventListener('DOMContentLoaded', () => {
    app = new InvoiceApp();
});