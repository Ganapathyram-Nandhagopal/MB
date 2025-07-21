// Invoice Template Management
class InvoiceTemplates {
    static generateHTML(data, template = 'modern') {
        const templates = {
            modern: this.modernTemplate,
            elegant: this.elegantTemplate,
            minimal: this.minimalTemplate
        };

        const templateFunction = templates[template] || templates.modern;
        return templateFunction(data);
    }

    static modernTemplate(data) {
        const itemsHtml = data.items?.map(item => `
            <tr>
                <td>${item.description || ''}</td>
                <td class="text-center">${item.quantity || 0}</td>
                <td class="text-right">$${(item.rate || 0).toFixed(2)}</td>
                <td class="text-right">$${(item.amount || 0).toFixed(2)}</td>
            </tr>
        `).join('') || '';

        return `
            <div class="invoice-template modern-template">
                <div class="invoice-header">
                    <div>
                        <h1 class="invoice-title">INVOICE</h1>
                        <div class="invoice-number">#${data.number || ''}</div>
                    </div>
                    <div style="text-align: right;">
                        <div style="background: linear-gradient(135deg, #3b82f6, #1e40af); color: white; padding: 1.5rem; border-radius: 12px; box-shadow: 0 8px 32px rgba(59, 130, 246, 0.3);">
                            <strong style="font-size: 1.2rem;">${data.companyName || 'Your Company'}</strong>
                        </div>
                    </div>
                </div>

                <div class="invoice-details">
                    <div class="company-info">
                        <div class="info-label">From</div>
                        <div><strong>${data.companyName || ''}</strong></div>
                        <div>${(data.companyAddress || '').replace(/\n/g, '<br>')}</div>
                        <div>${data.companyEmail || ''}</div>
                    </div>

                    <div class="client-info">
                        <div class="info-label">To</div>
                        <div><strong>${data.clientName || ''}</strong></div>
                        <div>${(data.clientAddress || '').replace(/\n/g, '<br>')}</div>
                        <div>${data.clientEmail || ''}</div>
                    </div>
                </div>

                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 2rem; margin-bottom: 2rem;">
                    <div>
                        <div class="info-label">Invoice Date</div>
                        <div>${data.date ? new Date(data.date).toLocaleDateString() : ''}</div>
                    </div>
                    <div>
                        <div class="info-label">Due Date</div>
                        <div>${data.dueDate ? new Date(data.dueDate).toLocaleDateString() : ''}</div>
                    </div>
                </div>

                <table class="invoice-table">
                    <thead>
                        <tr style="background: linear-gradient(135deg, #3b82f6, #1e40af); color: white;">
                            <th>Description</th>
                            <th class="text-center">Qty</th>
                            <th class="text-right">Rate</th>
                            <th class="text-right">Amount</th>
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
                            <td class="text-right">$${(data.subtotal || 0).toFixed(2)}</td>
                        </tr>
                        <tr>
                            <td>Tax (${(data.taxRate || 0)}%):</td>
                            <td class="text-right">$${(data.taxAmount || 0).toFixed(2)}</td>
                        </tr>
                        <tr style="background: linear-gradient(135deg, #3b82f6, #1e40af); color: white;">
                            <td><strong>Total:</strong></td>
                            <td class="text-right"><strong>$${(data.total || 0).toFixed(2)}</strong></td>
                        </tr>
                    </table>
                </div>

                ${this.generateQRCode(data)}

                <div class="invoice-footer">
                    <p>Thank you for your business!</p>
                    <p style="font-size: 0.9rem; margin-top: 1rem;">
                        Payment is due within 30 days. Please include invoice number in your payment reference.
                    </p>
                </div>
            </div>
        `;
    }

    static elegantTemplate(data) {
        const itemsHtml = data.items?.map(item => `
            <tr>
                <td>${item.description || ''}</td>
                <td class="text-center">${item.quantity || 0}</td>
                <td class="text-right">$${(item.rate || 0).toFixed(2)}</td>
                <td class="text-right">$${(item.amount || 0).toFixed(2)}</td>
            </tr>
        `).join('') || '';

        return `
            <div class="invoice-template elegant-template">
                <div class="invoice-header">
                    <div>
                        <h1 class="invoice-title">INVOICE</h1>
                        <div class="invoice-number">#${data.number || ''}</div>
                    </div>
                    <div style="text-align: right;">
                        <div style="background: linear-gradient(135deg, #8b5cf6, #7c3aed); color: white; padding: 1.5rem; border-radius: 12px; box-shadow: 0 8px 32px rgba(139, 92, 246, 0.3);">
                            <strong style="font-size: 1.2rem;">${data.companyName || 'Your Company'}</strong>
                        </div>
                    </div>
                </div>

                <div style="background: linear-gradient(135deg, rgba(139, 92, 246, 0.1), rgba(124, 58, 237, 0.05)); padding: 2rem; border-radius: 12px; margin-bottom: 2rem;">
                    <div class="invoice-details">
                        <div class="company-info">
                            <div class="info-label" style="color: #8b5cf6;">From</div>
                            <div><strong>${data.companyName || ''}</strong></div>
                            <div>${(data.companyAddress || '').replace(/\n/g, '<br>')}</div>
                            <div>${data.companyEmail || ''}</div>
                        </div>

                        <div class="client-info">
                            <div class="info-label" style="color: #8b5cf6;">To</div>
                            <div><strong>${data.clientName || ''}</strong></div>
                            <div>${(data.clientAddress || '').replace(/\n/g, '<br>')}</div>
                            <div>${data.clientEmail || ''}</div>
                        </div>
                    </div>
                </div>

                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 2rem; margin-bottom: 2rem;">
                    <div style="background: rgba(139, 92, 246, 0.05); padding: 1rem; border-radius: 8px; border-left: 4px solid #8b5cf6;">
                        <div class="info-label" style="color: #8b5cf6;">Invoice Date</div>
                        <div style="font-weight: 600;">${data.date ? new Date(data.date).toLocaleDateString() : ''}</div>
                    </div>
                    <div style="background: rgba(139, 92, 246, 0.05); padding: 1rem; border-radius: 8px; border-left: 4px solid #8b5cf6;">
                        <div class="info-label" style="color: #8b5cf6;">Due Date</div>
                        <div style="font-weight: 600;">${data.dueDate ? new Date(data.dueDate).toLocaleDateString() : ''}</div>
                    </div>
                </div>

                <table class="invoice-table" style="border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(139, 92, 246, 0.1);">
                    <thead>
                        <tr style="background: linear-gradient(135deg, #8b5cf6, #7c3aed); color: white;">
                            <th>Description</th>
                            <th class="text-center">Qty</th>
                            <th class="text-right">Rate</th>
                            <th class="text-right">Amount</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${itemsHtml}
                    </tbody>
                </table>

                <div class="invoice-totals">
                    <table class="totals-table" style="border-radius: 8px; overflow: hidden; box-shadow: 0 4px 20px rgba(139, 92, 246, 0.1);">
                        <tr>
                            <td style="background: rgba(139, 92, 246, 0.05);">Subtotal:</td>
                            <td class="text-right" style="background: rgba(139, 92, 246, 0.05);">$${(data.subtotal || 0).toFixed(2)}</td>
                        </tr>
                        <tr>
                            <td style="background: rgba(139, 92, 246, 0.05);">Tax (${(data.taxRate || 0)}%):</td>
                            <td class="text-right" style="background: rgba(139, 92, 246, 0.05);">$${(data.taxAmount || 0).toFixed(2)}</td>
                        </tr>
                        <tr style="background: linear-gradient(135deg, #8b5cf6, #7c3aed); color: white;">
                            <td><strong>Total:</strong></td>
                            <td class="text-right"><strong>$${(data.total || 0).toFixed(2)}</strong></td>
                        </tr>
                    </table>
                </div>

                ${this.generateQRCode(data)}

                <div class="invoice-footer" style="background: linear-gradient(135deg, rgba(139, 92, 246, 0.1), rgba(124, 58, 237, 0.05)); border-radius: 12px; padding: 2rem;">
                    <p style="font-size: 1.1rem; font-weight: 600; color: #8b5cf6;">Thank you for choosing our services!</p>
                    <p style="margin-top: 1rem;">
                        We appreciate your business and look forward to working with you again.
                    </p>
                </div>
            </div>
        `;
    }

    static minimalTemplate(data) {
        const itemsHtml = data.items?.map(item => `
            <tr>
                <td style="padding: 0.75rem 0; border-bottom: 1px solid #e5e7eb;">${item.description || ''}</td>
                <td class="text-center" style="padding: 0.75rem 0; border-bottom: 1px solid #e5e7eb;">${item.quantity || 0}</td>
                <td class="text-right" style="padding: 0.75rem 0; border-bottom: 1px solid #e5e7eb;">$${(item.rate || 0).toFixed(2)}</td>
                <td class="text-right" style="padding: 0.75rem 0; border-bottom: 1px solid #e5e7eb;">$${(item.amount || 0).toFixed(2)}</td>
            </tr>
        `).join('') || '';

        return `
            <div class="invoice-template minimal-template">
                <div style="margin-bottom: 3rem;">
                    <h1 class="invoice-title" style="font-size: 2rem; font-weight: 300; margin-bottom: 0.5rem;">Invoice</h1>
                    <div class="invoice-number" style="color: #10b981; font-weight: 600;">#${data.number || ''}</div>
                </div>

                <div class="invoice-details" style="margin-bottom: 3rem;">
                    <div class="company-info" style="margin-bottom: 2rem;">
                        <div style="font-weight: 600; font-size: 1.1rem; margin-bottom: 0.5rem; color: #10b981;">${data.companyName || ''}</div>
                        <div style="color: #6b7280; line-height: 1.6;">${(data.companyAddress || '').replace(/\n/g, '<br>')}</div>
                        <div style="color: #6b7280;">${data.companyEmail || ''}</div>
                    </div>

                    <div class="client-info">
                        <div style="font-weight: 600; font-size: 1.1rem; margin-bottom: 0.5rem;">${data.clientName || ''}</div>
                        <div style="color: #6b7280; line-height: 1.6;">${(data.clientAddress || '').replace(/\n/g, '<br>')}</div>
                        <div style="color: #6b7280;">${data.clientEmail || ''}</div>
                    </div>
                </div>

                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 2rem; margin-bottom: 3rem; color: #6b7280;">
                    <div>
                        <div style="font-size: 0.9rem; margin-bottom: 0.25rem;">Invoice Date</div>
                        <div style="font-weight: 600; color: #374151;">${data.date ? new Date(data.date).toLocaleDateString() : ''}</div>
                    </div>
                    <div>
                        <div style="font-size: 0.9rem; margin-bottom: 0.25rem;">Due Date</div>
                        <div style="font-weight: 600; color: #374151;">${data.dueDate ? new Date(data.dueDate).toLocaleDateString() : ''}</div>
                    </div>
                </div>

                <table style="width: 100%; border-collapse: collapse; margin-bottom: 2rem;">
                    <thead>
                        <tr style="border-bottom: 2px solid #10b981;">
                            <th style="text-align: left; padding: 1rem 0; font-weight: 500; color: #10b981;">Description</th>
                            <th class="text-center" style="padding: 1rem 0; font-weight: 500; color: #10b981;">Qty</th>
                            <th class="text-right" style="padding: 1rem 0; font-weight: 500; color: #10b981;">Rate</th>
                            <th class="text-right" style="padding: 1rem 0; font-weight: 500; color: #10b981;">Amount</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${itemsHtml}
                    </tbody>
                </table>

                <div style="display: flex; justify-content: flex-end; margin-bottom: 2rem;">
                    <div style="min-width: 300px;">
                        <div style="display: flex; justify-content: space-between; padding: 0.5rem 0; color: #6b7280;">
                            <span>Subtotal</span>
                            <span>$${(data.subtotal || 0).toFixed(2)}</span>
                        </div>
                        <div style="display: flex; justify-content: space-between; padding: 0.5rem 0; color: #6b7280;">
                            <span>Tax (${(data.taxRate || 0)}%)</span>
                            <span>$${(data.taxAmount || 0).toFixed(2)}</span>
                        </div>
                        <div style="display: flex; justify-content: space-between; padding: 1rem 0; border-top: 2px solid #10b981; font-weight: 700; font-size: 1.2rem; color: #10b981;">
                            <span>Total</span>
                            <span>$${(data.total || 0).toFixed(2)}</span>
                        </div>
                    </div>
                </div>

                ${this.generateQRCode(data)}

                <div class="invoice-footer" style="text-align: center; padding-top: 2rem; border-top: 1px solid #e5e7eb; color: #6b7280;">
                    <p style="font-size: 1rem;">Thank you</p>
                </div>
            </div>
        `;
    }

    static generateQRCode(data) {
        if (typeof QRCode === 'undefined') {
            return '';
        }

        const paymentInfo = `Invoice: ${data.number}\nAmount: $${(data.total || 0).toFixed(2)}\nDue: ${data.dueDate ? new Date(data.dueDate).toLocaleDateString() : ''}`;
        
        return `
            <div class="qr-code-container" style="margin: 2rem 0;">
                <div class="qr-code" id="qr-${data.number || 'invoice'}">
                    <!-- QR Code will be generated here -->
                </div>
            </div>
            <script>
                if (typeof QRCode !== 'undefined') {
                    try {
                        const qrContainer = document.getElementById('qr-${data.number || 'invoice'}');
                        if (qrContainer && !qrContainer.hasChildNodes()) {
                            QRCode.toCanvas(qrContainer, '${paymentInfo}', {
                                width: 120,
                                height: 120,
                                margin: 2,
                                color: {
                                    dark: '#333333',
                                    light: '#FFFFFF'
                                }
                            });
                        }
                    } catch (error) {
                        console.log('QR Code generation skipped');
                    }
                }
            </script>
        `;
    }

    static getTemplatePreview(template) {
        const sampleData = {
            number: 'INV-0001',
            date: new Date().toISOString().split('T')[0],
            dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            companyName: 'Your Company Name',
            companyAddress: '123 Business Street\nCity, State 12345',
            companyEmail: 'contact@yourcompany.com',
            clientName: 'Client Name',
            clientAddress: '456 Client Avenue\nClient City, State 67890',
            clientEmail: 'client@email.com',
            items: [
                { description: 'Web Development Services', quantity: 1, rate: 2500, amount: 2500 },
                { description: 'UI/UX Design', quantity: 2, rate: 750, amount: 1500 },
                { description: 'Consultation Hours', quantity: 5, rate: 150, amount: 750 }
            ],
            taxRate: 8.5,
            subtotal: 4750,
            taxAmount: 403.75,
            total: 5153.75
        };

        return this.generateHTML(sampleData, template);
    }

    static getAvailableTemplates() {
        return [
            {
                id: 'modern',
                name: 'Modern Blue',
                description: 'Clean and professional design with blue gradient accents and modern styling',
                color: '#3b82f6',
                preview: 'modern-preview'
            },
            {
                id: 'elegant',
                name: 'Elegant Purple',
                description: 'Sophisticated design with purple gradients and elegant card-based layout',
                color: '#8b5cf6',
                preview: 'elegant-preview'
            },
            {
                id: 'minimal',
                name: 'Minimal Green',
                description: 'Simple and clean design focusing on clarity with green accent colors',
                color: '#10b981',
                preview: 'minimal-preview'
            }
        ];
    }

    // Template customization
    static customizeTemplate(template, customizations) {
        // This method would allow for template customization
        // For now, it returns the base template
        return this.generateHTML(customizations.data, template);
    }

    // Export template as standalone HTML
    static exportTemplateHTML(data, template) {
        const templateHtml = this.generateHTML(data, template);
        
        return `
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Invoice ${data.number || ''}</title>
                <style>
                    body { 
                        font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif; 
                        margin: 0; 
                        padding: 20px; 
                        background: #f8fafc;
                    }
                    .invoice-template { 
                        max-width: 800px; 
                        margin: 0 auto; 
                        background: white; 
                        padding: 2rem;
                        border-radius: 12px;
                        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
                    }
                    @media print {
                        body { background: white; padding: 0; }
                        .invoice-template { box-shadow: none; margin: 0; }
                    }
                </style>
                <script src="https://cdnjs.cloudflare.com/ajax/libs/qrcode/1.5.3/qrcode.min.js"></script>
            </head>
            <body>
                ${templateHtml}
            </body>
            </html>
        `;
    }
}