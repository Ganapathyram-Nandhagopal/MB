// Invoice template management
class InvoiceTemplates {
    static generateHTML(data, template = 'modern') {
        const templates = {
            modern: this.modernTemplate,
            classic: this.classicTemplate,
            minimal: this.minimalTemplate
        };

        const templateFunction = templates[template] || templates.modern;
        return templateFunction(data);
    }

    static modernTemplate(data) {
        const itemsHtml = data.items?.map(item => `
            <tr>
                <td>${item.description || ''}</td>
                <td style="text-align: center">${item.quantity || 0}</td>
                <td style="text-align: right">$${(item.rate || 0).toFixed(2)}</td>
                <td style="text-align: right">$${(item.amount || 0).toFixed(2)}</td>
            </tr>
        `).join('') || '';

        return `
            <div class="invoice-template modern">
                <div class="invoice-header">
                    <div>
                        <h1 class="invoice-title">INVOICE</h1>
                        <p class="invoice-number">${data.number || ''}</p>
                    </div>
                    <div style="text-align: right;">
                        <div style="background: linear-gradient(135deg, var(--primary-color), var(--secondary-color)); color: white; padding: 1rem; border-radius: 8px;">
                            <strong>${data.businessName || 'Your Business'}</strong>
                        </div>
                    </div>
                </div>

                <div class="invoice-details">
                    <div class="business-info">
                        <h3>From:</h3>
                        <p><strong>${data.businessName || ''}</strong></p>
                        <p>${(data.businessAddress || '').replace(/\n/g, '<br>')}</p>
                        <p>${data.businessEmail || ''}</p>
                    </div>

                    <div class="client-info">
                        <h3>To:</h3>
                        <p><strong>${data.clientName || ''}</strong></p>
                        <p>${(data.clientAddress || '').replace(/\n/g, '<br>')}</p>
                        <p>${data.clientEmail || ''}</p>
                    </div>

                    <div style="text-align: right;">
                        <p><strong>Date:</strong> ${data.date ? new Date(data.date).toLocaleDateString() : ''}</p>
                        <p><strong>Due Date:</strong> ${data.dueDate ? new Date(data.dueDate).toLocaleDateString() : ''}</p>
                    </div>
                </div>

                <table class="invoice-table">
                    <thead>
                        <tr style="background: var(--primary-color); color: white;">
                            <th>Description</th>
                            <th style="text-align: center">Qty</th>
                            <th style="text-align: right">Rate</th>
                            <th style="text-align: right">Amount</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${itemsHtml}
                    </tbody>
                </table>

                <div class="invoice-totals">
                    <table class="totals-table">
                        <tr>
                            <td>Subtotal:</td>
                            <td style="text-align: right">$${(data.subtotal || 0).toFixed(2)}</td>
                        </tr>
                        <tr>
                            <td>Tax (${(data.taxRate || 0)}%):</td>
                            <td style="text-align: right">$${(data.taxAmount || 0).toFixed(2)}</td>
                        </tr>
                        <tr style="background: var(--primary-color); color: white;">
                            <td><strong>Total:</strong></td>
                            <td style="text-align: right"><strong>$${(data.total || 0).toFixed(2)}</strong></td>
                        </tr>
                    </table>
                </div>

                <div style="margin-top: 2rem; padding-top: 1rem; border-top: 1px solid var(--gray-200); text-align: center; color: var(--gray-500);">
                    <p>Thank you for your business!</p>
                </div>
            </div>
        `;
    }

    static classicTemplate(data) {
        const itemsHtml = data.items?.map(item => `
            <tr>
                <td>${item.description || ''}</td>
                <td style="text-align: center">${item.quantity || 0}</td>
                <td style="text-align: right">$${(item.rate || 0).toFixed(2)}</td>
                <td style="text-align: right">$${(item.amount || 0).toFixed(2)}</td>
            </tr>
        `).join('') || '';

        return `
            <div class="invoice-template classic">
                <div style="text-align: center; border-bottom: 3px solid var(--gray-800); padding-bottom: 1rem; margin-bottom: 2rem;">
                    <h1 style="font-size: 2.5rem; font-weight: 700; margin-bottom: 0.5rem; color: var(--gray-800);">INVOICE</h1>
                    <p style="font-size: 1.2rem; color: var(--gray-600);">${data.number || ''}</p>
                </div>

                <div class="invoice-details">
                    <div class="business-info">
                        <h3 style="border-bottom: 1px solid var(--gray-300); padding-bottom: 0.5rem;">FROM:</h3>
                        <p><strong>${data.businessName || ''}</strong></p>
                        <p>${(data.businessAddress || '').replace(/\n/g, '<br>')}</p>
                        <p>${data.businessEmail || ''}</p>
                    </div>

                    <div class="client-info">
                        <h3 style="border-bottom: 1px solid var(--gray-300); padding-bottom: 0.5rem;">TO:</h3>
                        <p><strong>${data.clientName || ''}</strong></p>
                        <p>${(data.clientAddress || '').replace(/\n/g, '<br>')}</p>
                        <p>${data.clientEmail || ''}</p>
                    </div>

                    <div style="text-align: right;">
                        <table style="margin-left: auto; border-collapse: collapse;">
                            <tr>
                                <td style="padding: 0.25rem 1rem; border: 1px solid var(--gray-300); background: var(--gray-100);"><strong>Date:</strong></td>
                                <td style="padding: 0.25rem 1rem; border: 1px solid var(--gray-300);">${data.date ? new Date(data.date).toLocaleDateString() : ''}</td>
                            </tr>
                            <tr>
                                <td style="padding: 0.25rem 1rem; border: 1px solid var(--gray-300); background: var(--gray-100);"><strong>Due Date:</strong></td>
                                <td style="padding: 0.25rem 1rem; border: 1px solid var(--gray-300);">${data.dueDate ? new Date(data.dueDate).toLocaleDateString() : ''}</td>
                            </tr>
                        </table>
                    </div>
                </div>

                <table class="invoice-table" style="border: 2px solid var(--gray-800);">
                    <thead>
                        <tr style="background: var(--gray-800); color: white;">
                            <th style="border-right: 1px solid white;">Description</th>
                            <th style="text-align: center; border-right: 1px solid white;">Qty</th>
                            <th style="text-align: right; border-right: 1px solid white;">Rate</th>
                            <th style="text-align: right;">Amount</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${itemsHtml}
                    </tbody>
                </table>

                <div class="invoice-totals">
                    <table class="totals-table" style="border: 1px solid var(--gray-300);">
                        <tr>
                            <td style="border-bottom: 1px solid var(--gray-300); padding: 0.5rem;">Subtotal:</td>
                            <td style="text-align: right; border-bottom: 1px solid var(--gray-300); padding: 0.5rem;">$${(data.subtotal || 0).toFixed(2)}</td>
                        </tr>
                        <tr>
                            <td style="border-bottom: 1px solid var(--gray-300); padding: 0.5rem;">Tax (${(data.taxRate || 0)}%):</td>
                            <td style="text-align: right; border-bottom: 1px solid var(--gray-300); padding: 0.5rem;">$${(data.taxAmount || 0).toFixed(2)}</td>
                        </tr>
                        <tr style="background: var(--gray-800); color: white;">
                            <td style="padding: 0.75rem;"><strong>TOTAL:</strong></td>
                            <td style="text-align: right; padding: 0.75rem;"><strong>$${(data.total || 0).toFixed(2)}</strong></td>
                        </tr>
                    </table>
                </div>

                <div style="margin-top: 3rem; text-align: center; font-style: italic; color: var(--gray-600);">
                    <p>Payment is due within 30 days of invoice date.</p>
                    <p>Thank you for choosing our services.</p>
                </div>
            </div>
        `;
    }

    static minimalTemplate(data) {
        const itemsHtml = data.items?.map(item => `
            <tr style="border-bottom: 1px solid var(--gray-200);">
                <td style="padding: 0.75rem 0;">${item.description || ''}</td>
                <td style="text-align: center; padding: 0.75rem 0;">${item.quantity || 0}</td>
                <td style="text-align: right; padding: 0.75rem 0;">$${(item.rate || 0).toFixed(2)}</td>
                <td style="text-align: right; padding: 0.75rem 0;">$${(item.amount || 0).toFixed(2)}</td>
            </tr>
        `).join('') || '';

        return `
            <div class="invoice-template minimal">
                <div style="margin-bottom: 3rem;">
                    <h1 style="font-size: 1.8rem; font-weight: 300; margin-bottom: 0.25rem; color: var(--gray-800);">Invoice</h1>
                    <p style="color: var(--gray-500); font-size: 1rem;">${data.number || ''}</p>
                </div>

                <div class="invoice-details" style="margin-bottom: 3rem;">
                    <div class="business-info">
                        <p style="font-weight: 600; margin-bottom: 0.5rem;">${data.businessName || ''}</p>
                        <p style="color: var(--gray-600); line-height: 1.4;">${(data.businessAddress || '').replace(/\n/g, '<br>')}</p>
                        <p style="color: var(--gray-600);">${data.businessEmail || ''}</p>
                    </div>

                    <div class="client-info">
                        <p style="font-weight: 600; margin-bottom: 0.5rem;">${data.clientName || ''}</p>
                        <p style="color: var(--gray-600); line-height: 1.4;">${(data.clientAddress || '').replace(/\n/g, '<br>')}</p>
                        <p style="color: var(--gray-600);">${data.clientEmail || ''}</p>
                    </div>

                    <div style="text-align: right; color: var(--gray-600);">
                        <p>Date: ${data.date ? new Date(data.date).toLocaleDateString() : ''}</p>
                        <p>Due: ${data.dueDate ? new Date(data.dueDate).toLocaleDateString() : ''}</p>
                    </div>
                </div>

                <table style="width: 100%; border-collapse: collapse; margin-bottom: 2rem;">
                    <thead>
                        <tr style="border-bottom: 2px solid var(--gray-300);">
                            <th style="text-align: left; padding: 0.75rem 0; font-weight: 500; color: var(--gray-700);">Description</th>
                            <th style="text-align: center; padding: 0.75rem 0; font-weight: 500; color: var(--gray-700);">Qty</th>
                            <th style="text-align: right; padding: 0.75rem 0; font-weight: 500; color: var(--gray-700);">Rate</th>
                            <th style="text-align: right; padding: 0.75rem 0; font-weight: 500; color: var(--gray-700);">Amount</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${itemsHtml}
                    </tbody>
                </table>

                <div style="display: flex; justify-content: flex-end;">
                    <div style="min-width: 250px;">
                        <div style="display: flex; justify-content: space-between; padding: 0.5rem 0; color: var(--gray-600);">
                            <span>Subtotal</span>
                            <span>$${(data.subtotal || 0).toFixed(2)}</span>
                        </div>
                        <div style="display: flex; justify-content: space-between; padding: 0.5rem 0; color: var(--gray-600);">
                            <span>Tax (${(data.taxRate || 0)}%)</span>
                            <span>$${(data.taxAmount || 0).toFixed(2)}</span>
                        </div>
                        <div style="display: flex; justify-content: space-between; padding: 1rem 0; border-top: 1px solid var(--gray-300); font-weight: 600; font-size: 1.1rem; color: var(--gray-800);">
                            <span>Total</span>
                            <span>$${(data.total || 0).toFixed(2)}</span>
                        </div>
                    </div>
                </div>

                <div style="margin-top: 4rem; padding-top: 2rem; border-top: 1px solid var(--gray-200); text-align: center;">
                    <p style="color: var(--gray-500); font-size: 0.9rem;">Thank you</p>
                </div>
            </div>
        `;
    }

    static getTemplatePreview(template) {
        const sampleData = {
            number: 'INV-001',
            date: new Date().toISOString().split('T')[0],
            dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            businessName: 'Your Business Name',
            businessAddress: '123 Business St\nCity, State 12345',
            businessEmail: 'contact@yourbusiness.com',
            clientName: 'Client Name',
            clientAddress: '456 Client Ave\nClient City, State 67890',
            clientEmail: 'client@email.com',
            items: [
                { description: 'Web Development', quantity: 1, rate: 1000, amount: 1000 },
                { description: 'Design Services', quantity: 2, rate: 500, amount: 1000 }
            ],
            taxRate: 8.5,
            subtotal: 2000,
            taxAmount: 170,
            total: 2170
        };

        return this.generateHTML(sampleData, template);
    }

    static getAvailableTemplates() {
        return [
            {
                id: 'modern',
                name: 'Modern',
                description: 'Clean and professional design with gradient accents',
                preview: 'modern-preview'
            },
            {
                id: 'classic',
                name: 'Classic',
                description: 'Traditional business invoice with formal styling',
                preview: 'classic-preview'
            },
            {
                id: 'minimal',
                name: 'Minimal',
                description: 'Simple and elegant design focusing on clarity',
                preview: 'minimal-preview'
            }
        ];
    }
}