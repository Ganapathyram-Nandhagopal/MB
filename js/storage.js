// Local Storage Management
class Storage {
    static KEYS = {
        INVOICES: 'invoicepro_invoices',
        SETTINGS: 'invoicepro_settings',
        COMPANY_INFO: 'invoicepro_company_info'
    };

    // Invoice operations
    static saveInvoice(invoice) {
        const invoices = this.getInvoices();
        
        // Generate ID if new invoice
        if (!invoice.id) {
            invoice.id = this.generateId();
            invoice.createdAt = new Date().toISOString();
        }
        
        invoice.updatedAt = new Date().toISOString();
        
        // Find existing invoice or add new one
        const existingIndex = invoices.findIndex(inv => inv.id === invoice.id);
        
        if (existingIndex >= 0) {
            invoices[existingIndex] = invoice;
        } else {
            invoices.unshift(invoice); // Add to beginning
        }
        
        localStorage.setItem(this.KEYS.INVOICES, JSON.stringify(invoices));
        return invoice;
    }

    static getInvoices() {
        const invoices = localStorage.getItem(this.KEYS.INVOICES);
        return invoices ? JSON.parse(invoices) : [];
    }

    static getInvoice(id) {
        const invoices = this.getInvoices();
        return invoices.find(inv => inv.id === id);
    }

    static deleteInvoice(id) {
        const invoices = this.getInvoices();
        const filteredInvoices = invoices.filter(inv => inv.id !== id);
        localStorage.setItem(this.KEYS.INVOICES, JSON.stringify(filteredInvoices));
    }

    // Settings operations
    static saveSettings(settings) {
        const existingSettings = this.getSettings();
        const mergedSettings = { ...existingSettings, ...settings };
        localStorage.setItem(this.KEYS.SETTINGS, JSON.stringify(mergedSettings));
    }

    static getSettings() {
        const settings = localStorage.getItem(this.KEYS.SETTINGS);
        return settings ? JSON.parse(settings) : {
            defaultTemplate: 'modern',
            defaultTaxRate: 0,
            currency: 'USD',
            dateFormat: 'MM/DD/YYYY',
            theme: 'dark'
        };
    }

    // Company info operations
    static saveCompanyInfo(info) {
        localStorage.setItem(this.KEYS.COMPANY_INFO, JSON.stringify(info));
    }

    static getCompanyInfo() {
        const info = localStorage.getItem(this.KEYS.COMPANY_INFO);
        return info ? JSON.parse(info) : {};
    }

    // Utility functions
    static generateId() {
        return 'inv_' + Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
    }

    static exportData() {
        const data = {
            invoices: this.getInvoices(),
            settings: this.getSettings(),
            companyInfo: this.getCompanyInfo(),
            exportDate: new Date().toISOString(),
            version: '2.0'
        };
        
        return JSON.stringify(data, null, 2);
    }

    static importData(jsonData) {
        try {
            const data = JSON.parse(jsonData);
            
            if (data.invoices) {
                localStorage.setItem(this.KEYS.INVOICES, JSON.stringify(data.invoices));
            }
            
            if (data.settings) {
                localStorage.setItem(this.KEYS.SETTINGS, JSON.stringify(data.settings));
            }
            
            if (data.companyInfo) {
                localStorage.setItem(this.KEYS.COMPANY_INFO, JSON.stringify(data.companyInfo));
            }
            
            return true;
        } catch (error) {
            console.error('Error importing data:', error);
            return false;
        }
    }

    static clearAllData() {
        Object.values(this.KEYS).forEach(key => {
            localStorage.removeItem(key);
        });
    }

    // Analytics and statistics
    static getInvoiceStats() {
        const invoices = this.getInvoices();
        const now = new Date();
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();
        
        return {
            total: invoices.length,
            totalAmount: invoices.reduce((sum, inv) => sum + (inv.total || 0), 0),
            thisMonth: invoices.filter(inv => {
                const date = new Date(inv.date);
                return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
            }).length,
            paid: invoices.filter(inv => inv.status === 'paid').length,
            pending: invoices.filter(inv => inv.status === 'pending').length,
            overdue: invoices.filter(inv => {
                const dueDate = new Date(inv.dueDate);
                return inv.status !== 'paid' && dueDate < now;
            }).length,
            recentInvoices: invoices
                .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                .slice(0, 10)
        };
    }

    // Search and filter
    static searchInvoices(query) {
        const invoices = this.getInvoices();
        const searchTerm = query.toLowerCase();
        
        return invoices.filter(invoice => 
            (invoice.number || '').toLowerCase().includes(searchTerm) ||
            (invoice.clientName || '').toLowerCase().includes(searchTerm) ||
            (invoice.clientEmail || '').toLowerCase().includes(searchTerm) ||
            (invoice.companyName || '').toLowerCase().includes(searchTerm)
        );
    }

    static filterInvoicesByStatus(status) {
        const invoices = this.getInvoices();
        return invoices.filter(invoice => invoice.status === status);
    }

    static filterInvoicesByDateRange(startDate, endDate) {
        const invoices = this.getInvoices();
        const start = new Date(startDate);
        const end = new Date(endDate);
        
        return invoices.filter(invoice => {
            const invoiceDate = new Date(invoice.date);
            return invoiceDate >= start && invoiceDate <= end;
        });
    }

    static getInvoicesByMonth(year, month) {
        const invoices = this.getInvoices();
        return invoices.filter(invoice => {
            const date = new Date(invoice.date);
            return date.getFullYear() === year && date.getMonth() === month;
        });
    }

    // Backup and restore
    static createBackup() {
        const backup = {
            timestamp: new Date().toISOString(),
            data: {
                invoices: this.getInvoices(),
                settings: this.getSettings(),
                companyInfo: this.getCompanyInfo()
            }
        };
        
        return JSON.stringify(backup, null, 2);
    }

    static restoreFromBackup(backupData) {
        try {
            const backup = JSON.parse(backupData);
            
            if (backup.data) {
                if (backup.data.invoices) {
                    localStorage.setItem(this.KEYS.INVOICES, JSON.stringify(backup.data.invoices));
                }
                
                if (backup.data.settings) {
                    localStorage.setItem(this.KEYS.SETTINGS, JSON.stringify(backup.data.settings));
                }
                
                if (backup.data.companyInfo) {
                    localStorage.setItem(this.KEYS.COMPANY_INFO, JSON.stringify(backup.data.companyInfo));
                }
                
                return true;
            }
            
            return false;
        } catch (error) {
            console.error('Error restoring backup:', error);
            return false;
        }
    }
}