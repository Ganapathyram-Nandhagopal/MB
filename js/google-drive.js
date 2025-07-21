// Google Drive API Integration
class GoogleDriveAPI {
    static CLIENT_ID = 'your-google-client-id.apps.googleusercontent.com';
    static API_KEY = 'your-google-api-key';
    static DISCOVERY_DOC = 'https://www.googleapis.com/discovery/v1/apis/drive/v3/rest';
    static SCOPES = 'https://www.googleapis.com/auth/drive.file';
    
    static isInitialized = false;
    static isSignedIn = false;
    static tokenClient = null;
    static accessToken = null;

    static async init() {
        try {
            // Initialize Google API
            await new Promise((resolve) => {
                gapi.load('client', resolve);
            });

            await gapi.client.init({
                apiKey: this.API_KEY,
                discoveryDocs: [this.DISCOVERY_DOC],
            });

            // Initialize Google Identity Services
            this.tokenClient = google.accounts.oauth2.initTokenClient({
                client_id: this.CLIENT_ID,
                scope: this.SCOPES,
                callback: (response) => {
                    if (response.error) {
                        console.error('OAuth error:', response.error);
                        this.showNotification('Authentication failed', 'error');
                        return;
                    }
                    
                    this.accessToken = response.access_token;
                    this.isSignedIn = true;
                    this.updateUI();
                    this.showNotification('Successfully connected to Google Drive!', 'success');
                },
            });

            this.isInitialized = true;
            console.log('Google Drive API initialized');
            
        } catch (error) {
            console.error('Error initializing Google Drive API:', error);
            this.showNotification('Failed to initialize Google Drive API', 'error');
        }
    }

    static async authenticate() {
        if (!this.isInitialized) {
            await this.init();
        }

        if (this.isSignedIn) {
            this.signOut();
            return;
        }

        try {
            // Request access token
            this.tokenClient.requestAccessToken({ prompt: 'consent' });
        } catch (error) {
            console.error('Authentication error:', error);
            this.showNotification('Authentication failed', 'error');
        }
    }

    static signOut() {
        if (this.accessToken) {
            google.accounts.oauth2.revoke(this.accessToken);
            this.accessToken = null;
        }
        
        this.isSignedIn = false;
        this.updateUI();
        this.showNotification('Disconnected from Google Drive', 'info');
    }

    static async toggleConnection() {
        if (this.isSignedIn) {
            this.signOut();
        } else {
            await this.authenticate();
        }
    }

    static updateUI() {
        if (typeof app !== 'undefined') {
            app.updateGoogleDriveStatus(this.isSignedIn);
        }
    }

    static async createInvoicesFolder() {
        if (!this.isSignedIn) {
            throw new Error('Not authenticated');
        }

        try {
            // Check if folder already exists
            const response = await gapi.client.drive.files.list({
                q: "name='Invoices' and mimeType='application/vnd.google-apps.folder' and trashed=false",
                fields: 'files(id, name)'
            });

            if (response.result.files.length > 0) {
                return response.result.files[0].id;
            }

            // Create new folder
            const folderResponse = await gapi.client.drive.files.create({
                resource: {
                    name: 'Invoices',
                    mimeType: 'application/vnd.google-apps.folder'
                },
                fields: 'id'
            });

            return folderResponse.result.id;
        } catch (error) {
            console.error('Error creating folder:', error);
            throw error;
        }
    }

    static async saveInvoice(invoiceData) {
        if (!this.isSignedIn) {
            console.log('Not authenticated with Google Drive');
            return false;
        }

        try {
            // Generate HTML content
            const template = invoiceData.template || 'modern';
            const htmlContent = InvoiceTemplates.exportTemplateHTML(invoiceData, template);
            
            // Create folder if it doesn't exist
            const folderId = await this.createInvoicesFolder();
            
            // Upload HTML file
            const filename = `Invoice-${invoiceData.number || 'draft'}.html`;
            const fileMetadata = {
                name: filename,
                parents: [folderId]
            };

            const form = new FormData();
            form.append('metadata', new Blob([JSON.stringify(fileMetadata)], {type: 'application/json'}));
            form.append('file', new Blob([htmlContent], {type: 'text/html'}));

            const response = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart', {
                method: 'POST',
                headers: new Headers({
                    'Authorization': `Bearer ${this.accessToken}`
                }),
                body: form
            });

            if (response.ok) {
                const result = await response.json();
                this.showNotification(`Invoice saved to Google Drive: ${filename}`, 'success');
                return result;
            } else {
                throw new Error('Upload failed');
            }
            
        } catch (error) {
            console.error('Error saving to Google Drive:', error);
            this.showNotification('Failed to save invoice to Google Drive', 'error');
            return false;
        }
    }

    static async uploadPDF(invoiceData) {
        if (!this.isSignedIn) {
            console.log('Not authenticated with Google Drive');
            return false;
        }

        try {
            // Generate PDF using html2pdf
            const template = invoiceData.template || 'modern';
            const invoiceHtml = InvoiceTemplates.generateHTML(invoiceData, template);
            
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

            const pdfBlob = await html2pdf().set(opt).from(element).outputPdf('blob');
            
            // Create folder if it doesn't exist
            const folderId = await this.createInvoicesFolder();
            
            // Upload PDF file
            const filename = `Invoice-${invoiceData.number || 'draft'}.pdf`;
            const fileMetadata = {
                name: filename,
                parents: [folderId]
            };

            const form = new FormData();
            form.append('metadata', new Blob([JSON.stringify(fileMetadata)], {type: 'application/json'}));
            form.append('file', pdfBlob);

            const response = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart', {
                method: 'POST',
                headers: new Headers({
                    'Authorization': `Bearer ${this.accessToken}`
                }),
                body: form
            });

            if (response.ok) {
                const result = await response.json();
                this.showNotification(`PDF uploaded to Google Drive: ${filename}`, 'success');
                return result;
            } else {
                throw new Error('Upload failed');
            }
            
        } catch (error) {
            console.error('Error uploading PDF:', error);
            this.showNotification('Failed to upload PDF to Google Drive', 'error');
            return false;
        }
    }

    static async listInvoices() {
        if (!this.isSignedIn) {
            return [];
        }

        try {
            const response = await gapi.client.drive.files.list({
                q: "parents in (select id from drive where name='Invoices') and trashed=false",
                fields: 'files(id, name, createdTime, size, webViewLink)',
                orderBy: 'createdTime desc'
            });

            return response.result.files || [];
        } catch (error) {
            console.error('Error listing invoices:', error);
            return [];
        }
    }

    static async deleteInvoice(fileId) {
        if (!this.isSignedIn) {
            return false;
        }

        try {
            await gapi.client.drive.files.delete({
                fileId: fileId
            });

            this.showNotification('Invoice deleted from Google Drive', 'success');
            return true;
        } catch (error) {
            console.error('Error deleting invoice:', error);
            this.showNotification('Failed to delete invoice from Google Drive', 'error');
            return false;
        }
    }

    static async downloadInvoice(fileId, filename) {
        if (!this.isSignedIn) {
            return false;
        }

        try {
            const response = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`, {
                headers: {
                    'Authorization': `Bearer ${this.accessToken}`
                }
            });

            if (response.ok) {
                const blob = await response.blob();
                const url = URL.createObjectURL(blob);
                
                const a = document.createElement('a');
                a.href = url;
                a.download = filename;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
                
                this.showNotification('Invoice downloaded successfully', 'success');
                return true;
            } else {
                throw new Error('Download failed');
            }
        } catch (error) {
            console.error('Error downloading invoice:', error);
            this.showNotification('Failed to download invoice', 'error');
            return false;
        }
    }

    static showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 1rem 1.5rem;
            border-radius: 12px;
            color: white;
            font-weight: 500;
            z-index: 10000;
            transition: all 0.3s ease;
            max-width: 350px;
            backdrop-filter: blur(10px);
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
        `;
        
        const colors = {
            success: 'linear-gradient(135deg, #10b981, #059669)',
            error: 'linear-gradient(135deg, #ef4444, #dc2626)',
            info: 'linear-gradient(135deg, #3b82f6, #1e40af)',
            warning: 'linear-gradient(135deg, #f59e0b, #d97706)'
        };
        
        notification.style.background = colors[type] || colors.info;
        notification.innerHTML = `
            <div style="display: flex; align-items: center; gap: 0.5rem;">
                <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
                <span>${message}</span>
            </div>
        `;
        
        document.body.appendChild(notification);
        
        // Animate in
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 100);
        
        // Remove after 5 seconds
        setTimeout(() => {
            notification.style.transform = 'translateX(400px)';
            notification.style.opacity = '0';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 5000);
    }

    // Backup and sync functionality
    static async backupAllInvoices() {
        if (!this.isSignedIn) {
            this.showNotification('Please connect to Google Drive first', 'warning');
            return false;
        }

        try {
            const invoices = Storage.getInvoices();
            const backupData = {
                timestamp: new Date().toISOString(),
                invoices: invoices,
                settings: Storage.getSettings(),
                version: '2.0'
            };

            const folderId = await this.createInvoicesFolder();
            const filename = `InvoicePro-Backup-${new Date().toISOString().split('T')[0]}.json`;
            
            const fileMetadata = {
                name: filename,
                parents: [folderId]
            };

            const form = new FormData();
            form.append('metadata', new Blob([JSON.stringify(fileMetadata)], {type: 'application/json'}));
            form.append('file', new Blob([JSON.stringify(backupData, null, 2)], {type: 'application/json'}));

            const response = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart', {
                method: 'POST',
                headers: new Headers({
                    'Authorization': `Bearer ${this.accessToken}`
                }),
                body: form
            });

            if (response.ok) {
                this.showNotification('All invoices backed up to Google Drive', 'success');
                return true;
            } else {
                throw new Error('Backup failed');
            }
        } catch (error) {
            console.error('Error backing up invoices:', error);
            this.showNotification('Failed to backup invoices', 'error');
            return false;
        }
    }
}

// Initialize Google Drive API when the page loads
document.addEventListener('DOMContentLoaded', () => {
    // Load Google APIs
    const script1 = document.createElement('script');
    script1.src = 'https://apis.google.com/js/api.js';
    script1.onload = () => {
        const script2 = document.createElement('script');
        script2.src = 'https://accounts.google.com/gsi/client';
        script2.onload = () => {
            // Initialize after both scripts are loaded
            setTimeout(() => {
                GoogleDriveAPI.init();
            }, 1000);
        };
        document.head.appendChild(script2);
    };
    document.head.appendChild(script1);
});