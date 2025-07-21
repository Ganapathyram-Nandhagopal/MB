// Main Application Controller
class InvoiceApp {
    constructor() {
        this.currentSection = 'dashboard';
        this.currentInvoice = null;
        this.isGoogleDriveConnected = false;
        this.theme = localStorage.getItem('theme') || 'dark';
        
        this.init();
    }

    init() {
        this.setupTheme();
        this.setupEventListeners();
        this.loadDashboardData();
        this.generateInvoiceNumber();
        this.setDefaultDates();
        this.addDefaultItem();
        this.updatePreview();
    }

    setupTheme() {
        document.documentElement.setAttribute('data-theme', this.theme);
        const themeIcon = document.querySelector('#themeToggle i');
        themeIcon.className = this.theme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
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
        document.getElementById('mobileToggle').addEventListener('click', () => {
            document.querySelector('.sidebar').classList.toggle('active');
        });

        // Theme toggle
        document.getElementById('themeToggle').addEventListener('click', () => {
            this.toggleTheme();
        });

        // Dashboard actions
        document.getElementById('createInvoiceBtn').addEventListener('click', () => {
            this.navigateToSection('new-invoice');
        });

        // Invoice builder actions
        document.getElementById('addItemBtn').addEventListener('click', () => {
            InvoiceBuilder.addItem();
        });

        document.getElementById('saveInvoiceBtn').addEventListener('click', () => {
            this.saveInvoice();
        });

        document.getElementById('previewBtn').addEventListener('click', () => {
            this.showPreviewModal();
        });

        document.getElementById('exportPdfBtn').addEventListener('click', () => {
            this.exportToPDF();
        });

        document.getElementById('printBtn').addEventListener('click', () => {
            this.printInvoice();
        });

        // Modal actions
        document.getElementById('closeModal').addEventListener('click', () => {
            this.closeModal();
        });

        document.getElementById('modalPrintBtn').addEventListener('click', () => {
            this.printInvoice();
        });

        document.getElementById('modalExportBtn').addEventListener('click', () => {
            this.exportToPDF();
        });

        // Template selection
        document.querySelectorAll('.select-template-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const template = e.target.dataset.template;
                this.selectTemplate(template);
            });
        });

        // Google Drive
        document.getElementById('googleDriveBtn').addEventListener('click', () => {
            GoogleDriveAPI.toggleConnection();
        });

        document.getElementById('driveToggle').addEventListener('click', () => {
            GoogleDriveAPI.toggleConnection();
        });

        // Settings
        document.getElementById('saveSettingsBtn').addEventListener('click', () => {
            this.saveSettings();
        });

        document.getElementById('exportDataBtn').addEventListener('click', () => {
            this.exportData();
        });

        document.getElementById('importDataBtn').addEventListener('click', () => {
            document.getElementById('importDataInput').click();
        });

        document.getElementById('importDataInput').addEventListener('change', (e) => {
            this.importData(e.target.files[0]);
        });

        document.getElementById('clearDataBtn').addEventListener('click', () => {
            this.clearAllData();
        });

        // Search
        document.getElementById('searchInput').addEventListener('input', (e) => {
            this.searchInvoices(e.target.value);
        });

        // Form changes for live preview
        this.setupFormListeners();

        // Click outside modal to close
        document.getElementById('previewModal').addEventListener('click', (e) => {
            if (e.target.id === 'previewModal') {
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

    setupFormListeners() {
        const formFields = [
            'invoiceNumber', 'invoiceDate', 'dueDate', 'templateSelect',
            'companyName', 'companyEmail', 'companyAddress',
            'clientName', 'clientEmail', 'clientAddress',
            'taxRate'
        ];

        formFields.forEach(fieldId => {
            const field = document.getElementById(fieldId);
            if (field) {
                field.addEventListener('input', () => this.updatePreview());
                field.addEventListener('change', () => this.updatePreview());
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

        // Close mobile menu
        document.querySelector('.sidebar').classList.remove('active');

        // Load section-specific data
        if (section === 'dashboard') {
            this.loadDashboardData();
        } else if (section === 'invoice-list') {
            this.loadInvoiceList();
        }
    }

    toggleTheme() {
        this.theme = this.theme === 'dark' ? 'light' : 'dark';
        localStorage.setItem('theme', this.theme);
        this.setupTheme();
    }

    loadDashboardData() {
        const invoices = Storage.getInvoices();
        const stats = this.calculateStats(invoices);

        document.getElementById('totalInvoices').textContent = stats.total;
        document.getElementById('totalRevenue').textContent = `$${stats.revenue.toFixed(2)}`;
        document.getElementById('paidInvoices').textContent = stats.paid;
        document.getElementById('pendingInvoices').textContent = stats.pending;

        this.loadRecentInvoices(invoices.slice(0, 5));
    }

    calculateStats(invoices) {
        return {
            total: invoices.length,
            revenue: invoices.reduce((sum, inv) => sum + (inv.total || 0), 0),
            paid: invoices.filter(inv => inv.status === 'paid').length,
            pending: invoices.filter(inv => inv.status === 'pending').length
        };
    }

    loadRecentInvoices(invoices) {
        const container = document.getElementById('recentInvoicesList');
        
        if (invoices.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-file-invoice"></i>
                    <h3>No invoices yet</h3>
                    <p>Create your first invoice to get started</p>
                    <button class="primary-btn glow-btn" onclick="app.navigateToSection('new-invoice')">
                        <i class="fas fa-plus"></i>
                        Create Invoice
                    </button>
                </div>
            `;
            return;
        }

        const invoicesHtml = invoices.map(invoice => `
            <div class="invoice-item" onclick="app.editInvoice('${invoice.id}')">
                <div class="invoice-item-header">
                    <span class="invoice-number">${invoice.number}</span>
                    <span class="invoice-status status-${invoice.status || 'pending'}">
                        ${(invoice.status || 'pending').toUpperCase()}
                    </span>
                </div>
                <div class="invoice-details">
                    <div>
                        <div class="invoice-card-client">${invoice.clientName || 'Unknown Client'}</div>
                        <div class="invoice-card-date">${new Date(invoice.date).toLocaleDateString()}</div>
                    </div>
                    <div class="invoice-amount">$${(invoice.total || 0).toFixed(2)}</div>
                </div>
            </div>
        `).join('');

        container.innerHTML = invoicesHtml;
    }

    loadInvoiceList() {
        const invoices = Storage.getInvoices();
        const container = document.getElementById('invoiceListContainer');

        if (invoices.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-file-invoice"></i>
                    <h3>No invoices found</h3>
                    <p>Start by creating your first invoice</p>
                    <button class="primary-btn glow-btn" onclick="app.navigateToSection('new-invoice')">
                        <i class="fas fa-plus"></i>
                        Create Invoice
                    </button>
                </div>
            `;
            return;
        }

        const invoicesHtml = invoices.map(invoice => `
            <div class="invoice-card glass-card">
                <div class="invoice-card-header">
                    <div class="invoice-card-number">${invoice.number}</div>
                    <span class="invoice-status status-${invoice.status || 'pending'}">
                        ${(invoice.status || 'pending').toUpperCase()}
                    </span>
                </div>
                <div class="invoice-card-body">
                    <div class="invoice-card-client">${invoice.clientName || 'Unknown Client'}</div>
                    <div class="invoice-card-date">${new Date(invoice.date).toLocaleDateString()}</div>
                </div>
                <div class="invoice-card-footer">
                    <div class="invoice-card-amount">$${(invoice.total || 0).toFixed(2)}</div>
                    <div class="invoice-actions">
                        <button class="icon-btn" onclick="app.editInvoice('${invoice.id}')" title="Edit">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="icon-btn" onclick="app.duplicateInvoice('${invoice.id}')" title="Duplicate">
                            <i class="fas fa-copy"></i>
                        </button>
                        <button class="icon-btn" onclick="app.toggleInvoiceStatus('${invoice.id}')" title="Toggle Status">
                            <i class="fas fa-${invoice.status === 'paid' ? 'undo' : 'check'}"></i>
                        </button>
                        <button class="icon-btn" onclick="app.deleteInvoice('${invoice.id}')" title="Delete">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
            </div>
        `).join('');

        container.innerHTML = invoicesHtml;
    }

    searchInvoices(query) {
        const invoices = Storage.getInvoices();
        const filtered = invoices.filter(invoice => 
            invoice.number.toLowerCase().includes(query.toLowerCase()) ||
            (invoice.clientName || '').toLowerCase().includes(query.toLowerCase()) ||
            (invoice.companyName || '').toLowerCase().includes(query.toLowerCase())
        );

        // Update the display with filtered results
        this.displayFilteredInvoices(filtered);
    }

    displayFilteredInvoices(invoices) {
        const container = document.getElementById('invoiceListContainer');
        
        if (invoices.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-search"></i>
                    <h3>No invoices found</h3>
                    <p>Try adjusting your search criteria</p>
                </div>
            `;
            return;
        }

        const invoicesHtml = invoices.map(invoice => `
            <div class="invoice-card glass-card">
                <div class="invoice-card-header">
                    <div class="invoice-card-number">${invoice.number}</div>
                    <span class="invoice-status status-${invoice.status || 'pending'}">
                        ${(invoice.status || 'pending').toUpperCase()}
                    </span>
                </div>
                <div class="invoice-card-body">
                    <div class="invoice-card-client">${invoice.clientName || 'Unknown Client'}</div>
                    <div class="invoice-card-date">${new Date(invoice.date).toLocaleDateString()}</div>
                </div>
                <div class="invoice-card-footer">
                    <div class="invoice-card-amount">$${(invoice.total || 0).toFixed(2)}</div>
                    <div class="invoice-actions">
                        <button class="icon-btn" onclick="app.editInvoice('${invoice.id}')" title="Edit">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="icon-btn" onclick="app.duplicateInvoice('${invoice.id}')" title="Duplicate">
                            <i class="fas fa-copy"></i>
                        </button>
                        <button class="icon-btn" onclick="app.toggleInvoiceStatus('${invoice.id}')" title="Toggle Status">
                            <i class="fas fa-${invoice.status === 'paid' ? 'undo' : 'check'}"></i>
                        </button>
                        <button class="icon-btn" onclick="app.deleteInvoice('${invoice.id}')" title="Delete">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
            </div>
        `).join('');

        container.innerHTML = invoicesHtml;
    }

    generateInvoiceNumber() {
        const invoices = Storage.getInvoices();
        const nextNumber = invoices.length + 1;
        const invoiceNumber = `INV-${nextNumber.toString().padStart(4, '0')}`;
        document.getElementById('invoiceNumber').value = invoiceNumber;
    }

    setDefaultDates() {
        const today = new Date().toISOString().split('T')[0];
        const dueDate = new Date();
        dueDate.setDate(dueDate.getDate() + 30);
        
        document.getElementById('invoiceDate').value = today;
        document.getElementById('dueDate').value = dueDate.toISOString().split('T')[0];
    }

    addDefaultItem() {
        InvoiceBuilder.addItem();
    }

    updatePreview() {
        const invoiceData = this.getInvoiceData();
        const template = invoiceData.template || 'modern';
        const previewHtml = InvoiceTemplates.generateHTML(invoiceData, template);
        
        document.getElementById('invoicePreview').innerHTML = previewHtml;
    }

    getInvoiceData() {
        return {
            id: this.currentInvoice?.id || null,
            number: document.getElementById('invoiceNumber').value,
            date: document.getElementById('invoiceDate').value,
            dueDate: document.getElementById('dueDate').value,
            template: document.getElementById('templateSelect').value,
            
            // Company info
            companyName: document.getElementById('companyName').value,
            companyEmail: document.getElementById('companyEmail').value,
            companyAddress: document.getElementById('companyAddress').value,
            
            // Client info
            clientName: document.getElementById('clientName').value,
            clientEmail: document.getElementById('clientEmail').value,
            clientAddress: document.getElementById('clientAddress').value,
            
            // Items and calculations
            items: InvoiceBuilder.getItems(),
            taxRate: parseFloat(document.getElementById('taxRate').value) || 0,
            subtotal: InvoiceBuilder.calculateSubtotal(),
            taxAmount: InvoiceBuilder.calculateTaxAmount(),
            total: InvoiceBuilder.calculateTotal(),
            
            // Status
            status: this.currentInvoice?.status || 'pending',
            createdAt: this.currentInvoice?.createdAt || new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
    }

    saveInvoice() {
        const invoiceData = this.getInvoiceData();
        
        // Validate required fields
        if (!invoiceData.number || !invoiceData.clientName) {
            this.showMessage('Please fill in the invoice number and client name.', 'error');
            return;
        }

        if (!invoiceData.items.length || invoiceData.items.every(item => !item.description)) {
            this.showMessage('Please add at least one item to the invoice.', 'error');
            return;
        }

        // Save to localStorage
        const savedInvoice = Storage.saveInvoice(invoiceData);
        this.currentInvoice = savedInvoice;

        // Upload to Google Drive if connected
        if (this.isGoogleDriveConnected) {
            GoogleDriveAPI.saveInvoice(savedInvoice);
        }

        // Update dashboard
        this.loadDashboardData();

        // Show success message
        this.showMessage('Invoice saved successfully!', 'success');
    }

    editInvoice(invoiceId) {
        const invoice = Storage.getInvoice(invoiceId);
        if (invoice) {
            this.currentInvoice = invoice;
            this.loadInvoiceData(invoice);
            this.navigateToSection('new-invoice');
        }
    }

    loadInvoiceData(invoice) {
        document.getElementById('invoiceNumber').value = invoice.number || '';
        document.getElementById('invoiceDate').value = invoice.date || '';
        document.getElementById('dueDate').value = invoice.dueDate || '';
        document.getElementById('templateSelect').value = invoice.template || 'modern';
        
        document.getElementById('companyName').value = invoice.companyName || '';
        document.getElementById('companyEmail').value = invoice.companyEmail || '';
        document.getElementById('companyAddress').value = invoice.companyAddress || '';
        
        document.getElementById('clientName').value = invoice.clientName || '';
        document.getElementById('clientEmail').value = invoice.clientEmail || '';
        document.getElementById('clientAddress').value = invoice.clientAddress || '';
        
        document.getElementById('taxRate').value = invoice.taxRate || 0;

        // Load items
        InvoiceBuilder.loadItems(invoice.items || []);
        this.updatePreview();
    }

    duplicateInvoice(invoiceId) {
        const invoice = Storage.getInvoice(invoiceId);
        if (invoice) {
            // Create a copy without ID
            const duplicatedInvoice = { ...invoice };
            delete duplicatedInvoice.id;
            delete duplicatedInvoice.createdAt;
            delete duplicatedInvoice.updatedAt;
            
            // Generate new invoice number
            this.generateInvoiceNumber();
            duplicatedInvoice.number = document.getElementById('invoiceNumber').value;
            
            // Set new dates
            this.setDefaultDates();
            duplicatedInvoice.date = document.getElementById('invoiceDate').value;
            duplicatedInvoice.dueDate = document.getElementById('dueDate').value;
            
            this.currentInvoice = null;
            this.loadInvoiceData(duplicatedInvoice);
            this.navigateToSection('new-invoice');
        }
    }

    toggleInvoiceStatus(invoiceId) {
        const invoice = Storage.getInvoice(invoiceId);
        if (invoice) {
            invoice.status = invoice.status === 'paid' ? 'pending' : 'paid';
            Storage.saveInvoice(invoice);
            this.loadInvoiceList();
            this.loadDashboardData();
        }
    }

    deleteInvoice(invoiceId) {
        if (confirm('Are you sure you want to delete this invoice?')) {
            Storage.deleteInvoice(invoiceId);
            this.loadInvoiceList();
            this.loadDashboardData();
            this.showMessage('Invoice deleted successfully!', 'success');
        }
    }

    selectTemplate(template) {
        document.getElementById('templateSelect').value = template;
        this.updatePreview();
        this.navigateToSection('new-invoice');
    }

    showPreviewModal() {
        const invoiceData = this.getInvoiceData();
        const template = invoiceData.template || 'modern';
        const previewHtml = InvoiceTemplates.generateHTML(invoiceData, template);
        
        document.getElementById('modalInvoicePreview').innerHTML = previewHtml;
        document.getElementById('previewModal').classList.add('active');
    }

    closeModal() {
        document.getElementById('previewModal').classList.remove('active');
    }

    exportToPDF() {
        const invoiceData = this.getInvoiceData();
        const template = invoiceData.template || 'modern';
        const invoiceHtml = InvoiceTemplates.generateHTML(invoiceData, template);
        
        // Create a temporary element for PDF generation
        const element = document.createElement('div');
        element.innerHTML = invoiceHtml;
        element.style.width = '210mm';
        element.style.minHeight = '297mm';
        element.style.padding = '20mm';
        element.style.margin = '0 auto';
        element.style.background = 'white';
        element.style.color = '#333';
        
        const opt = {
            margin: 0,
            filename: `${invoiceData.number || 'invoice'}.pdf`,
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { scale: 2, useCORS: true },
            jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
        };

        html2pdf().set(opt).from(element).save().then(() => {
            // Upload to Google Drive if connected
            if (this.isGoogleDriveConnected) {
                GoogleDriveAPI.uploadPDF(invoiceData);
            }
        });
    }

    printInvoice() {
        const invoiceData = this.getInvoiceData();
        const template = invoiceData.template || 'modern';
        const invoiceHtml = InvoiceTemplates.generateHTML(invoiceData, template);
        
        const printWindow = window.open('', '_blank');
        printWindow.document.write(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>Invoice ${invoiceData.number}</title>
                <style>
                    body { font-family: Arial, sans-serif; margin: 0; padding: 20px; }
                    .invoice-template { background: white; color: #333; }
                    @media print {
                        body { margin: 0; padding: 0; }
                        .invoice-template { box-shadow: none; }
                    }
                </style>
            </head>
            <body>
                ${invoiceHtml}
            </body>
            </html>
        `);
        printWindow.document.close();
        printWindow.print();
    }

    saveSettings() {
        const settings = {
            defaultTaxRate: parseFloat(document.getElementById('defaultTaxRate').value) || 0,
            defaultTemplate: document.getElementById('defaultTemplate').value,
            theme: this.theme
        };
        
        Storage.saveSettings(settings);
        this.showMessage('Settings saved successfully!', 'success');
    }

    exportData() {
        const data = Storage.exportData();
        const blob = new Blob([data], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `invoicepro-data-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        this.showMessage('Data exported successfully!', 'success');
    }

    importData(file) {
        if (!file) return;
        
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const success = Storage.importData(e.target.result);
                if (success) {
                    this.loadDashboardData();
                    this.loadInvoiceList();
                    this.showMessage('Data imported successfully!', 'success');
                } else {
                    this.showMessage('Failed to import data. Please check the file format.', 'error');
                }
            } catch (error) {
                this.showMessage('Error importing data: ' + error.message, 'error');
            }
        };
        reader.readAsText(file);
    }

    clearAllData() {
        if (confirm('Are you sure you want to clear all data? This action cannot be undone.')) {
            Storage.clearAllData();
            this.loadDashboardData();
            this.loadInvoiceList();
            this.showMessage('All data cleared successfully!', 'success');
        }
    }

    showMessage(message, type = 'info') {
        // Create message element
        const messageEl = document.createElement('div');
        messageEl.className = `message ${type}`;
        messageEl.innerHTML = `
            <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
            <span>${message}</span>
        `;
        
        // Add to page
        const container = document.querySelector('.main-content');
        container.insertBefore(messageEl, container.firstChild);
        
        // Remove after 5 seconds
        setTimeout(() => {
            if (messageEl.parentNode) {
                messageEl.parentNode.removeChild(messageEl);
            }
        }, 5000);
    }

    updateGoogleDriveStatus(isConnected) {
        this.isGoogleDriveConnected = isConnected;
        
        const driveBtn = document.getElementById('googleDriveBtn');
        const driveStatus = document.getElementById('driveStatus');
        const driveToggle = document.getElementById('driveToggle');
        
        if (isConnected) {
            driveBtn.innerHTML = '<i class="fab fa-google-drive"></i><span>Connected</span>';
            driveBtn.classList.add('active');
            driveStatus.textContent = 'Connected';
            driveToggle.textContent = 'Disconnect';
            driveToggle.classList.add('active');
        } else {
            driveBtn.innerHTML = '<i class="fab fa-google-drive"></i><span>Connect Drive</span>';
            driveBtn.classList.remove('active');
            driveStatus.textContent = 'Not Connected';
            driveToggle.textContent = 'Connect';
            driveToggle.classList.remove('active');
        }
    }
}

// Initialize app when DOM is loaded
let app;
document.addEventListener('DOMContentLoaded', () => {
    app = new InvoiceApp();
});