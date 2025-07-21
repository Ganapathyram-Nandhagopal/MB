// Invoice builder functionality
class InvoiceBuilder {
    static currentItems = [];
    static currentInvoiceId = null;

    static init() {
        this.setupEventListeners();
        this.addItem(); // Add first item by default
        this.updatePreview();
    }

    static setupEventListeners() {
        // Add item button
        document.getElementById('add-item').addEventListener('click', () => {
            this.addItem();
        });

        // Save invoice button
        document.getElementById('save-invoice').addEventListener('click', () => {
            this.saveInvoice();
        });

        // Export PDF button
        document.getElementById('export-pdf').addEventListener('click', () => {
            PDFGenerator.generatePDF();
        });

        // Form field changes for live preview
        const formFields = [
            'invoice-number', 'invoice-date', 'due-date', 'template-select',
            'business-name', 'business-address', 'business-email',
            'client-name', 'client-address', 'client-email',
            'tax-rate'
        ];

        formFields.forEach(fieldId => {
            const field = document.getElementById(fieldId);
            if (field) {
                field.addEventListener('input', () => this.updatePreview());
                field.addEventListener('change', () => this.updatePreview());
            }
        });
    }

    static addItem() {
        const itemId = 'item_' + Date.now() + Math.random().toString(36).substr(2, 5);
        const item = {
            id: itemId,
            description: '',
            quantity: 1,
            rate: 0,
            amount: 0
        };

        this.currentItems.push(item);
        this.renderItems();
        this.updateCalculations();
        this.updatePreview();
    }

    static removeItem(itemId) {
        this.currentItems = this.currentItems.filter(item => item.id !== itemId);
        this.renderItems();
        this.updateCalculations();
        this.updatePreview();
    }

    static renderItems() {
        const container = document.getElementById('items-list');
        
        const itemsHtml = this.currentItems.map(item => `
            <div class="item-row" data-item-id="${item.id}">
                <input 
                    type="text" 
                    placeholder="Description" 
                    value="${item.description}"
                    onchange="InvoiceBuilder.updateItem('${item.id}', 'description', this.value)"
                >
                <input 
                    type="number" 
                    min="0" 
                    step="0.01" 
                    value="${item.quantity}"
                    onchange="InvoiceBuilder.updateItem('${item.id}', 'quantity', this.value)"
                >
                <input 
                    type="number" 
                    min="0" 
                    step="0.01" 
                    value="${item.rate}"
                    onchange="InvoiceBuilder.updateItem('${item.id}', 'rate', this.value)"
                >
                <span class="item-amount">$${item.amount.toFixed(2)}</span>
                <button 
                    type="button" 
                    class="remove-item" 
                    onclick="InvoiceBuilder.removeItem('${item.id}')"
                    title="Remove item"
                >
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `).join('');

        container.innerHTML = itemsHtml;
    }

    static updateItem(itemId, field, value) {
        const item = this.currentItems.find(item => item.id === itemId);
        if (item) {
            if (field === 'description') {
                item[field] = value;
            } else {
                item[field] = parseFloat(value) || 0;
            }
            
            // Recalculate amount
            item.amount = item.quantity * item.rate;
            
            // Update the amount display
            const itemRow = document.querySelector(`[data-item-id="${itemId}"]`);
            const amountSpan = itemRow.querySelector('.item-amount');
            amountSpan.textContent = `$${item.amount.toFixed(2)}`;
            
            this.updateCalculations();
            this.updatePreview();
        }
    }

    static updateCalculations() {
        const subtotal = this.currentItems.reduce((sum, item) => sum + item.amount, 0);
        const taxRate = parseFloat(document.getElementById('tax-rate').value) || 0;
        const taxAmount = subtotal * (taxRate / 100);
        const total = subtotal + taxAmount;

        document.getElementById('subtotal').textContent = `$${subtotal.toFixed(2)}`;
        document.getElementById('tax-amount').textContent = `$${taxAmount.toFixed(2)}`;
        document.getElementById('total-amount').textContent = `$${total.toFixed(2)}`;
    }

    static getInvoiceData() {
        return {
            id: this.currentInvoiceId,
            number: document.getElementById('invoice-number').value,
            date: document.getElementById('invoice-date').value,
            dueDate: document.getElementById('due-date').value,
            template: document.getElementById('template-select').value,
            
            // Business info
            businessName: document.getElementById('business-name').value,
            businessAddress: document.getElementById('business-address').value,
            businessEmail: document.getElementById('business-email').value,
            
            // Client info
            clientName: document.getElementById('client-name').value,
            clientAddress: document.getElementById('client-address').value,
            clientEmail: document.getElementById('client-email').value,
            
            // Items and calculations
            items: this.currentItems,
            taxRate: parseFloat(document.getElementById('tax-rate').value) || 0,
            subtotal: this.currentItems.reduce((sum, item) => sum + item.amount, 0),
            taxAmount: this.currentItems.reduce((sum, item) => sum + item.amount, 0) * 
                      ((parseFloat(document.getElementById('tax-rate').value) || 0) / 100),
            total: this.currentItems.reduce((sum, item) => sum + item.amount, 0) * 
                   (1 + ((parseFloat(document.getElementById('tax-rate').value) || 0) / 100))
        };
    }

    static updatePreview() {
        const invoiceData = this.getInvoiceData();
        const template = invoiceData.template || 'modern';
        const previewHtml = InvoiceTemplates.generateHTML(invoiceData, template);
        
        document.getElementById('invoice-preview').innerHTML = previewHtml;
    }

    static saveInvoice() {
        const invoiceData = this.getInvoiceData();
        
        // Validate required fields
        if (!invoiceData.number || !invoiceData.clientName) {
            alert('Please fill in the invoice number and client name.');
            return;
        }

        if (this.currentItems.length === 0 || this.currentItems.every(item => !item.description)) {
            alert('Please add at least one item to the invoice.');
            return;
        }

        // Save to localStorage
        const savedInvoice = Storage.saveInvoice(invoiceData);
        this.currentInvoiceId = savedInvoice.id;

        // Save to Google Drive if authenticated
        if (app.isAuthenticated) {
            GoogleDrive.saveInvoice(savedInvoice);
        }

        // Update dashboard
        app.updateDashboardStats();
        app.loadInvoicesList();

        // Show success message
        const btn = document.getElementById('save-invoice');
        const originalText = btn.innerHTML;
        btn.innerHTML = '<i class="fas fa-check"></i> Saved!';
        btn.style.background = 'var(--success-color)';
        
        setTimeout(() => {
            btn.innerHTML = originalText;
            btn.style.background = '';
        }, 2000);
    }

    static loadInvoice(invoice) {
        this.currentInvoiceId = invoice.id;
        this.currentItems = invoice.items || [];

        // Fill form fields
        document.getElementById('invoice-number').value = invoice.number || '';
        document.getElementById('invoice-date').value = invoice.date || '';
        document.getElementById('due-date').value = invoice.dueDate || '';
        document.getElementById('template-select').value = invoice.template || 'modern';
        
        document.getElementById('business-name').value = invoice.businessName || '';
        document.getElementById('business-address').value = invoice.businessAddress || '';
        document.getElementById('business-email').value = invoice.businessEmail || '';
        
        document.getElementById('client-name').value = invoice.clientName || '';
        document.getElementById('client-address').value = invoice.clientAddress || '';
        document.getElementById('client-email').value = invoice.clientEmail || '';
        
        document.getElementById('tax-rate').value = invoice.taxRate || 0;

        // Render items and update calculations
        this.renderItems();
        this.updateCalculations();
        this.updatePreview();
    }

    static clearForm() {
        this.currentInvoiceId = null;
        this.currentItems = [];
        
        // Clear all form fields
        document.querySelectorAll('#invoice-builder input, #invoice-builder textarea, #invoice-builder select').forEach(field => {
            if (field.type === 'date') {
                field.value = field.defaultValue || '';
            } else if (field.type === 'number') {
                field.value = 0;
            } else {
                field.value = '';
            }
        });

        // Set default dates
        const today = new Date().toISOString().split('T')[0];
        document.getElementById('invoice-date').value = today;
        
        const dueDate = new Date();
        dueDate.setDate(dueDate.getDate() + 30);
        document.getElementById('due-date').value = dueDate.toISOString().split('T')[0];

        // Generate new invoice number
        app.generateInvoiceNumber();

        // Add default item
        this.addItem();
        this.updatePreview();
    }

    static duplicateInvoice() {
        const currentData = this.getInvoiceData();
        
        // Clear ID and generate new number
        this.currentInvoiceId = null;
        app.generateInvoiceNumber();
        
        // Update date to today
        const today = new Date().toISOString().split('T')[0];
        document.getElementById('invoice-date').value = today;
        
        // Update due date
        const dueDate = new Date();
        dueDate.setDate(dueDate.getDate() + 30);
        document.getElementById('due-date').value = dueDate.toISOString().split('T')[0];
        
        this.updatePreview();
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    InvoiceBuilder.init();
});