// PDF generation functionality
class PDFGenerator {
    static async generatePDF() {
        try {
            const invoiceData = InvoiceBuilder.getInvoiceData();
            const template = invoiceData.template || 'modern';
            
            // Create jsPDF instance
            const { jsPDF } = window.jspdf;
            const pdf = new jsPDF('p', 'mm', 'a4');
            
            // Set font
            pdf.setFont('helvetica');
            
            // Generate PDF content based on template
            if (template === 'modern') {
                this.generateModernPDF(pdf, invoiceData);
            } else if (template === 'classic') {
                this.generateClassicPDF(pdf, invoiceData);
            } else {
                this.generateMinimalPDF(pdf, invoiceData);
            }
            
            // Save the PDF
            const filename = `Invoice-${invoiceData.number || 'Draft'}.pdf`;
            pdf.save(filename);
            
            // Upload to Google Drive if authenticated
            if (app.isAuthenticated) {
                const pdfBlob = pdf.output('blob');
                await GoogleDrive.uploadPDF(pdfBlob, filename);
            }
            
        } catch (error) {
            console.error('Error generating PDF:', error);
            alert('Error generating PDF. Please try again.');
        }
    }

    static generateModernPDF(pdf, data) {
        const pageWidth = pdf.internal.pageSize.getWidth();
        const pageHeight = pdf.internal.pageSize.getHeight();
        let yPosition = 20;

        // Header with gradient background (simulated with rectangle)
        pdf.setFillColor(59, 130, 246); // Primary blue
        pdf.rect(0, 0, pageWidth, 40, 'F');

        // Invoice title
        pdf.setFontSize(28);
        pdf.setFont('helvetica', 'bold');
        pdf.setTextColor(255, 255, 255);
        pdf.text('INVOICE', 20, 25);

        // Invoice number
        pdf.setFontSize(14);
        pdf.setFont('helvetica', 'normal');
        pdf.text(data.number || '', 20, 35);

        // Business info (top right)
        pdf.setTextColor(255, 255, 255);
        pdf.setFont('helvetica', 'bold');
        pdf.text(data.businessName || '', pageWidth - 20, 25, { align: 'right' });

        yPosition = 55;

        // Reset text color for body
        pdf.setTextColor(0, 0, 0);

        // Business details
        pdf.setFontSize(12);
        pdf.setFont('helvetica', 'bold');
        pdf.text('From:', 20, yPosition);
        
        pdf.setFont('helvetica', 'normal');
        yPosition += 7;
        pdf.text(data.businessName || '', 20, yPosition);
        yPosition += 5;
        
        if (data.businessAddress) {
            const addressLines = data.businessAddress.split('\n');
            addressLines.forEach(line => {
                pdf.text(line, 20, yPosition);
                yPosition += 5;
            });
        }
        
        if (data.businessEmail) {
            pdf.text(data.businessEmail, 20, yPosition);
        }

        // Client details
        yPosition = 55;
        pdf.setFont('helvetica', 'bold');
        pdf.text('To:', pageWidth / 2, yPosition);
        
        pdf.setFont('helvetica', 'normal');
        yPosition += 7;
        pdf.text(data.clientName || '', pageWidth / 2, yPosition);
        yPosition += 5;
        
        if (data.clientAddress) {
            const addressLines = data.clientAddress.split('\n');
            addressLines.forEach(line => {
                pdf.text(line, pageWidth / 2, yPosition);
                yPosition += 5;
            });
        }
        
        if (data.clientEmail) {
            pdf.text(data.clientEmail, pageWidth / 2, yPosition);
        }

        // Date information
        yPosition = 55;
        pdf.setFont('helvetica', 'bold');
        pdf.text('Date:', pageWidth - 60, yPosition, { align: 'left' });
        pdf.setFont('helvetica', 'normal');
        pdf.text(data.date ? new Date(data.date).toLocaleDateString() : '', pageWidth - 20, yPosition, { align: 'right' });
        
        yPosition += 7;
        pdf.setFont('helvetica', 'bold');
        pdf.text('Due Date:', pageWidth - 60, yPosition, { align: 'left' });
        pdf.setFont('helvetica', 'normal');
        pdf.text(data.dueDate ? new Date(data.dueDate).toLocaleDateString() : '', pageWidth - 20, yPosition, { align: 'right' });

        // Items table
        yPosition = 110;
        
        // Table header
        pdf.setFillColor(59, 130, 246);
        pdf.rect(20, yPosition - 7, pageWidth - 40, 14, 'F');
        
        pdf.setTextColor(255, 255, 255);
        pdf.setFont('helvetica', 'bold');
        pdf.text('Description', 25, yPosition);
        pdf.text('Qty', pageWidth - 80, yPosition, { align: 'center' });
        pdf.text('Rate', pageWidth - 60, yPosition, { align: 'right' });
        pdf.text('Amount', pageWidth - 25, yPosition, { align: 'right' });

        yPosition += 15;
        pdf.setTextColor(0, 0, 0);
        pdf.setFont('helvetica', 'normal');

        // Table rows
        data.items?.forEach(item => {
            if (yPosition > pageHeight - 50) {
                pdf.addPage();
                yPosition = 30;
            }
            
            pdf.text(item.description || '', 25, yPosition);
            pdf.text((item.quantity || 0).toString(), pageWidth - 80, yPosition, { align: 'center' });
            pdf.text(`$${(item.rate || 0).toFixed(2)}`, pageWidth - 60, yPosition, { align: 'right' });
            pdf.text(`$${(item.amount || 0).toFixed(2)}`, pageWidth - 25, yPosition, { align: 'right' });
            yPosition += 10;
        });

        // Totals
        yPosition += 10;
        const totalsX = pageWidth - 80;
        
        pdf.setFont('helvetica', 'normal');
        pdf.text('Subtotal:', totalsX - 30, yPosition);
        pdf.text(`$${(data.subtotal || 0).toFixed(2)}`, pageWidth - 25, yPosition, { align: 'right' });
        
        yPosition += 8;
        pdf.text(`Tax (${data.taxRate || 0}%):`, totalsX - 30, yPosition);
        pdf.text(`$${(data.taxAmount || 0).toFixed(2)}`, pageWidth - 25, yPosition, { align: 'right' });
        
        yPosition += 8;
        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(14);
        pdf.text('Total:', totalsX - 30, yPosition);
        pdf.text(`$${(data.total || 0).toFixed(2)}`, pageWidth - 25, yPosition, { align: 'right' });

        // Footer
        yPosition = pageHeight - 30;
        pdf.setFontSize(10);
        pdf.setFont('helvetica', 'normal');
        pdf.setTextColor(128, 128, 128);
        pdf.text('Thank you for your business!', pageWidth / 2, yPosition, { align: 'center' });
    }

    static generateClassicPDF(pdf, data) {
        const pageWidth = pdf.internal.pageSize.getWidth();
        const pageHeight = pdf.internal.pageSize.getHeight();
        let yPosition = 30;

        // Title
        pdf.setFontSize(32);
        pdf.setFont('helvetica', 'bold');
        pdf.text('INVOICE', pageWidth / 2, yPosition, { align: 'center' });
        
        yPosition += 10;
        pdf.setFontSize(14);
        pdf.setFont('helvetica', 'normal');
        pdf.text(data.number || '', pageWidth / 2, yPosition, { align: 'center' });

        // Horizontal line
        yPosition += 10;
        pdf.setLineWidth(1);
        pdf.line(20, yPosition, pageWidth - 20, yPosition);

        yPosition += 20;

        // Business and client info side by side
        pdf.setFontSize(12);
        pdf.setFont('helvetica', 'bold');
        pdf.text('FROM:', 20, yPosition);
        pdf.text('TO:', pageWidth / 2, yPosition);

        yPosition += 8;
        pdf.setFont('helvetica', 'normal');

        // Business info
        let businessY = yPosition;
        pdf.text(data.businessName || '', 20, businessY);
        businessY += 6;
        
        if (data.businessAddress) {
            const addressLines = data.businessAddress.split('\n');
            addressLines.forEach(line => {
                pdf.text(line, 20, businessY);
                businessY += 5;
            });
        }
        
        if (data.businessEmail) {
            businessY += 2;
            pdf.text(data.businessEmail, 20, businessY);
        }

        // Client info
        let clientY = yPosition;
        pdf.text(data.clientName || '', pageWidth / 2, clientY);
        clientY += 6;
        
        if (data.clientAddress) {
            const addressLines = data.clientAddress.split('\n');
            addressLines.forEach(line => {
                pdf.text(line, pageWidth / 2, clientY);
                clientY += 5;
            });
        }
        
        if (data.clientEmail) {
            clientY += 2;
            pdf.text(data.clientEmail, pageWidth / 2, clientY);
        }

        yPosition = Math.max(businessY, clientY) + 20;

        // Date box
        pdf.setLineWidth(0.5);
        pdf.rect(pageWidth - 80, yPosition - 10, 60, 25);
        
        pdf.setFont('helvetica', 'bold');
        pdf.text('Date:', pageWidth - 75, yPosition);
        pdf.setFont('helvetica', 'normal');
        pdf.text(data.date ? new Date(data.date).toLocaleDateString() : '', pageWidth - 25, yPosition, { align: 'right' });
        
        yPosition += 8;
        pdf.setFont('helvetica', 'bold');
        pdf.text('Due Date:', pageWidth - 75, yPosition);
        pdf.setFont('helvetica', 'normal');
        pdf.text(data.dueDate ? new Date(data.dueDate).toLocaleDateString() : '', pageWidth - 25, yPosition, { align: 'right' });

        yPosition += 25;

        // Items table with border
        const tableStartY = yPosition;
        
        // Table header
        pdf.setFillColor(200, 200, 200);
        pdf.rect(20, yPosition, pageWidth - 40, 12, 'F');
        pdf.rect(20, yPosition, pageWidth - 40, 12);
        
        pdf.setFont('helvetica', 'bold');
        pdf.text('Description', 25, yPosition + 8);
        pdf.text('Qty', pageWidth - 80, yPosition + 8, { align: 'center' });
        pdf.text('Rate', pageWidth - 60, yPosition + 8, { align: 'right' });
        pdf.text('Amount', pageWidth - 25, yPosition + 8, { align: 'right' });

        yPosition += 12;

        // Table rows
        pdf.setFont('helvetica', 'normal');
        data.items?.forEach(item => {
            pdf.rect(20, yPosition, pageWidth - 40, 10);
            pdf.text(item.description || '', 25, yPosition + 7);
            pdf.text((item.quantity || 0).toString(), pageWidth - 80, yPosition + 7, { align: 'center' });
            pdf.text(`$${(item.rate || 0).toFixed(2)}`, pageWidth - 60, yPosition + 7, { align: 'right' });
            pdf.text(`$${(item.amount || 0).toFixed(2)}`, pageWidth - 25, yPosition + 7, { align: 'right' });
            yPosition += 10;
        });

        // Totals section
        yPosition += 10;
        const totalsStartX = pageWidth - 80;
        
        pdf.rect(totalsStartX, yPosition, 60, 30);
        
        pdf.text('Subtotal:', totalsStartX + 5, yPosition + 8);
        pdf.text(`$${(data.subtotal || 0).toFixed(2)}`, pageWidth - 25, yPosition + 8, { align: 'right' });
        
        yPosition += 10;
        pdf.text(`Tax (${data.taxRate || 0}%):`, totalsStartX + 5, yPosition + 8);
        pdf.text(`$${(data.taxAmount || 0).toFixed(2)}`, pageWidth - 25, yPosition + 8, { align: 'right' });
        
        yPosition += 10;
        pdf.setFont('helvetica', 'bold');
        pdf.setFillColor(0, 0, 0);
        pdf.rect(totalsStartX, yPosition, 60, 10, 'F');
        pdf.setTextColor(255, 255, 255);
        pdf.text('TOTAL:', totalsStartX + 5, yPosition + 7);
        pdf.text(`$${(data.total || 0).toFixed(2)}`, pageWidth - 25, yPosition + 7, { align: 'right' });

        // Footer
        pdf.setTextColor(0, 0, 0);
        pdf.setFont('helvetica', 'italic');
        pdf.setFontSize(10);
        pdf.text('Payment is due within 30 days of invoice date.', pageWidth / 2, pageHeight - 40, { align: 'center' });
        pdf.text('Thank you for choosing our services.', pageWidth / 2, pageHeight - 30, { align: 'center' });
    }

    static generateMinimalPDF(pdf, data) {
        const pageWidth = pdf.internal.pageSize.getWidth();
        const pageHeight = pdf.internal.pageSize.getHeight();
        let yPosition = 40;

        // Simple title
        pdf.setFontSize(24);
        pdf.setFont('helvetica', 'normal');
        pdf.text('Invoice', 20, yPosition);
        
        pdf.setFontSize(12);
        pdf.setTextColor(128, 128, 128);
        pdf.text(data.number || '', 20, yPosition + 8);

        yPosition += 30;
        pdf.setTextColor(0, 0, 0);

        // Business info
        pdf.setFont('helvetica', 'bold');
        pdf.text(data.businessName || '', 20, yPosition);
        yPosition += 6;
        
        pdf.setFont('helvetica', 'normal');
        pdf.setTextColor(128, 128, 128);
        
        if (data.businessAddress) {
            const addressLines = data.businessAddress.split('\n');
            addressLines.forEach(line => {
                pdf.text(line, 20, yPosition);
                yPosition += 5;
            });
        }
        
        if (data.businessEmail) {
            pdf.text(data.businessEmail, 20, yPosition);
        }

        yPosition += 20;
        pdf.setTextColor(0, 0, 0);

        // Client info
        pdf.setFont('helvetica', 'bold');
        pdf.text(data.clientName || '', 20, yPosition);
        yPosition += 6;
        
        pdf.setFont('helvetica', 'normal');
        pdf.setTextColor(128, 128, 128);
        
        if (data.clientAddress) {
            const addressLines = data.clientAddress.split('\n');
            addressLines.forEach(line => {
                pdf.text(line, 20, yPosition);
                yPosition += 5;
            });
        }
        
        if (data.clientEmail) {
            pdf.text(data.clientEmail, 20, yPosition);
        }

        // Dates
        yPosition -= 20;
        pdf.setTextColor(128, 128, 128);
        pdf.text(`Date: ${data.date ? new Date(data.date).toLocaleDateString() : ''}`, pageWidth - 20, yPosition, { align: 'right' });
        yPosition += 6;
        pdf.text(`Due: ${data.dueDate ? new Date(data.dueDate).toLocaleDateString() : ''}`, pageWidth - 20, yPosition, { align: 'right' });

        yPosition += 40;

        // Simple table
        pdf.setTextColor(0, 0, 0);
        pdf.setFont('helvetica', 'normal');
        
        // Header
        pdf.text('Description', 20, yPosition);
        pdf.text('Qty', pageWidth - 80, yPosition, { align: 'center' });
        pdf.text('Rate', pageWidth - 60, yPosition, { align: 'right' });
        pdf.text('Amount', pageWidth - 20, yPosition, { align: 'right' });
        
        yPosition += 5;
        pdf.setLineWidth(0.5);
        pdf.line(20, yPosition, pageWidth - 20, yPosition);
        yPosition += 10;

        // Items
        data.items?.forEach(item => {
            pdf.text(item.description || '', 20, yPosition);
            pdf.text((item.quantity || 0).toString(), pageWidth - 80, yPosition, { align: 'center' });
            pdf.text(`$${(item.rate || 0).toFixed(2)}`, pageWidth - 60, yPosition, { align: 'right' });
            pdf.text(`$${(item.amount || 0).toFixed(2)}`, pageWidth - 20, yPosition, { align: 'right' });
            yPosition += 8;
        });

        // Totals
        yPosition += 10;
        pdf.setTextColor(128, 128, 128);
        pdf.text('Subtotal', pageWidth - 80, yPosition);
        pdf.text(`$${(data.subtotal || 0).toFixed(2)}`, pageWidth - 20, yPosition, { align: 'right' });
        
        yPosition += 6;
        pdf.text(`Tax (${data.taxRate || 0}%)`, pageWidth - 80, yPosition);
        pdf.text(`$${(data.taxAmount || 0).toFixed(2)}`, pageWidth - 20, yPosition, { align: 'right' });
        
        yPosition += 10;
        pdf.setLineWidth(0.5);
        pdf.line(pageWidth - 80, yPosition, pageWidth - 20, yPosition);
        yPosition += 8;
        
        pdf.setTextColor(0, 0, 0);
        pdf.setFont('helvetica', 'bold');
        pdf.text('Total', pageWidth - 80, yPosition);
        pdf.text(`$${(data.total || 0).toFixed(2)}`, pageWidth - 20, yPosition, { align: 'right' });

        // Simple footer
        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(10);
        pdf.setTextColor(128, 128, 128);
        pdf.text('Thank you', pageWidth / 2, pageHeight - 30, { align: 'center' });
    }
}