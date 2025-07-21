// Invoice Builder Functionality
class InvoiceBuilder {
    static items = [];

    static addItem() {
        const item = {
            id: this.generateItemId(),
            description: '',
            quantity: 1,
            rate: 0,
            amount: 0
        };

        this.items.push(item);
        this.renderItems();
        this.updateCalculations();
    }

    static removeItem(itemId) {
        this.items = this.items.filter(item => item.id !== itemId);
        this.renderItems();
        this.updateCalculations();
    }

    static updateItem(itemId, field, value) {
        const item = this.items.find(item => item.id === itemId);
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
            if (itemRow) {
                const amountSpan = itemRow.querySelector('.item-amount');
                if (amountSpan) {
                    amountSpan.textContent = `$${item.amount.toFixed(2)}`;
                }
            }
            
            this.updateCalculations();
            
            // Update preview if app is available
            if (typeof app !== 'undefined') {
                app.updatePreview();
            }
        }
    }

    static renderItems() {
        const container = document.getElementById('itemsList');
        if (!container) return;
        
        if (this.items.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-plus-circle"></i>
                    <p>No items added yet</p>
                </div>
            `;
            return;
        }

        const itemsHtml = this.items.map(item => `
            <div class="item-row" data-item-id="${item.id}">
                <input 
                    type="text" 
                    class="glass-input"
                    placeholder="Item description" 
                    value="${item.description}"
                    oninput="InvoiceBuilder.updateItem('${item.id}', 'description', this.value)"
                >
                <input 
                    type="number" 
                    class="glass-input"
                    min="0" 
                    step="0.01" 
                    placeholder="Qty"
                    value="${item.quantity}"
                    oninput="InvoiceBuilder.updateItem('${item.id}', 'quantity', this.value)"
                >
                <input 
                    type="number" 
                    class="glass-input"
                    min="0" 
                    step="0.01" 
                    placeholder="Rate"
                    value="${item.rate}"
                    oninput="InvoiceBuilder.updateItem('${item.id}', 'rate', this.value)"
                >
                <div class="item-amount">$${item.amount.toFixed(2)}</div>
                <button 
                    type="button" 
                    class="remove-item-btn" 
                    onclick="InvoiceBuilder.removeItem('${item.id}')"
                    title="Remove item"
                >
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `).join('');

        container.innerHTML = itemsHtml;
    }

    static updateCalculations() {
        const subtotal = this.calculateSubtotal();
        const taxAmount = this.calculateTaxAmount();
        const total = this.calculateTotal();

        const subtotalEl = document.getElementById('subtotal');
        const taxAmountEl = document.getElementById('taxAmount');
        const totalAmountEl = document.getElementById('totalAmount');

        if (subtotalEl) subtotalEl.textContent = `$${subtotal.toFixed(2)}`;
        if (taxAmountEl) taxAmountEl.textContent = `$${taxAmount.toFixed(2)}`;
        if (totalAmountEl) totalAmountEl.textContent = `$${total.toFixed(2)}`;
    }

    static calculateSubtotal() {
        return this.items.reduce((sum, item) => sum + (item.amount || 0), 0);
    }

    static calculateTaxAmount() {
        const subtotal = this.calculateSubtotal();
        const taxRateEl = document.getElementById('taxRate');
        const taxRate = taxRateEl ? parseFloat(taxRateEl.value) || 0 : 0;
        return subtotal * (taxRate / 100);
    }

    static calculateTotal() {
        return this.calculateSubtotal() + this.calculateTaxAmount();
    }

    static getItems() {
        return this.items;
    }

    static loadItems(items) {
        this.items = items.map(item => ({
            ...item,
            id: item.id || this.generateItemId()
        }));
        this.renderItems();
        this.updateCalculations();
    }

    static clearItems() {
        this.items = [];
        this.renderItems();
        this.updateCalculations();
    }

    static generateItemId() {
        return 'item_' + Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
    }

    // Preset items functionality
    static addPresetItem(description, rate) {
        const item = {
            id: this.generateItemId(),
            description: description,
            quantity: 1,
            rate: rate,
            amount: rate
        };

        this.items.push(item);
        this.renderItems();
        this.updateCalculations();
        
        if (typeof app !== 'undefined') {
            app.updatePreview();
        }
    }

    // Bulk operations
    static duplicateItem(itemId) {
        const item = this.items.find(item => item.id === itemId);
        if (item) {
            const duplicatedItem = {
                ...item,
                id: this.generateItemId()
            };
            this.items.push(duplicatedItem);
            this.renderItems();
            this.updateCalculations();
            
            if (typeof app !== 'undefined') {
                app.updatePreview();
            }
        }
    }

    static moveItemUp(itemId) {
        const index = this.items.findIndex(item => item.id === itemId);
        if (index > 0) {
            [this.items[index], this.items[index - 1]] = [this.items[index - 1], this.items[index]];
            this.renderItems();
        }
    }

    static moveItemDown(itemId) {
        const index = this.items.findIndex(item => item.id === itemId);
        if (index < this.items.length - 1) {
            [this.items[index], this.items[index + 1]] = [this.items[index + 1], this.items[index]];
            this.renderItems();
        }
    }

    // Import/Export items
    static exportItems() {
        return JSON.stringify(this.items, null, 2);
    }

    static importItems(itemsJson) {
        try {
            const items = JSON.parse(itemsJson);
            if (Array.isArray(items)) {
                this.loadItems(items);
                return true;
            }
            return false;
        } catch (error) {
            console.error('Error importing items:', error);
            return false;
        }
    }

    // Validation
    static validateItems() {
        const errors = [];
        
        if (this.items.length === 0) {
            errors.push('At least one item is required');
        }
        
        this.items.forEach((item, index) => {
            if (!item.description.trim()) {
                errors.push(`Item ${index + 1}: Description is required`);
            }
            
            if (item.quantity <= 0) {
                errors.push(`Item ${index + 1}: Quantity must be greater than 0`);
            }
            
            if (item.rate < 0) {
                errors.push(`Item ${index + 1}: Rate cannot be negative`);
            }
        });
        
        return errors;
    }

    // Auto-save functionality
    static enableAutoSave() {
        setInterval(() => {
            if (this.items.length > 0) {
                localStorage.setItem('invoicepro_draft_items', JSON.stringify(this.items));
            }
        }, 30000); // Auto-save every 30 seconds
    }

    static loadDraftItems() {
        const draftItems = localStorage.getItem('invoicepro_draft_items');
        if (draftItems) {
            try {
                const items = JSON.parse(draftItems);
                if (Array.isArray(items) && items.length > 0) {
                    this.loadItems(items);
                    return true;
                }
            } catch (error) {
                console.error('Error loading draft items:', error);
            }
        }
        return false;
    }

    static clearDraftItems() {
        localStorage.removeItem('invoicepro_draft_items');
    }
}

// Initialize auto-save when the module loads
document.addEventListener('DOMContentLoaded', () => {
    InvoiceBuilder.enableAutoSave();
});