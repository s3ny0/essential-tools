document.addEventListener("DOMContentLoaded", () => {
    const qtyInputs = document.querySelectorAll("#receipt-item-qty");
    const priceInputs = document.querySelectorAll("#receipt-item-price");
    const deliveryInput = document.querySelector(".conclusion-item:nth-child(1) input");
    const discountInput = document.querySelector(".conclusion-item:nth-child(3) input");

    const updateTotals = () => {
        let subTotal = 0;
        const receiptUnits = document.querySelectorAll(".receipt-unit");

        receiptUnits.forEach(unit => {
            const qty = parseFloat(unit.querySelector("#receipt-item-qty").value) || 0;
            const price = parseFloat(unit.querySelector("#receipt-item-price").value) || 0;
            const total = qty * price;

            unit.querySelector(".receipt-item-total h1").textContent = total.toFixed(2);
            subTotal += total;
        });

        document.querySelector(".conclusion-item:nth-child(2) h1:last-child").textContent = subTotal.toFixed(2);

        const delivery = parseFloat(deliveryInput.value) || 0;
        const discount = parseFloat(discountInput.value) || 0;

        const grandTotal = subTotal + delivery - discount;
        document.querySelector(".conclusion-item:nth-child(4) h1:last-child").textContent = grandTotal.toFixed(2);
    };

    [...qtyInputs, ...priceInputs, deliveryInput, discountInput].forEach(input => {
        input.addEventListener("input", updateTotals);
    });

    updateTotals();


    // PDF Generation with jsPDF (text-based)
    const generatePDF = () => {
        updateTotals(); // Make sure values are up to date
        const { jsPDF } = window.jspdf;
    
        // Temporary y tracker to calculate needed height
        let y = 10;
        const margin = 5;
    
        // 1. Measure height needed
        y += 10 + 4 + 4 + 4 + 10; // Business name + address + phone + email + gap
        y += 10; // Section title
        const receiptUnits = document.querySelectorAll(".receipt-unit");
    
        receiptUnits.forEach(unit => {
            const item = unit.querySelector("#receipt-item").value;
            const desc = unit.querySelector("#receipt-item-desc").value;
            const qty = unit.querySelector("#receipt-item-qty").value;
            const price = unit.querySelector("#receipt-item-price").value;
    
            if (item || desc || qty || price) {
                y += 10 + 4 + 4 + 4 + 5; // Lines per unit
            }
        });
    
        y += 15 + 5 + 5 + 5 + 8 + 12 + 50; // Dashed line + totals + footer
    
        const pageHeight = y + 10; // Add buffer
    
        // 2. Create PDF with measured height
        const doc = new jsPDF({
            orientation: 'p',
            unit: 'mm',
            format: [100, pageHeight]
        });
    
        // 3. Reuse `y` and render content
        y = 10;
    
        // Draw content now
        doc.setFillColor(220, 220, 208);
        doc.rect(0, 0, 100, pageHeight, 'F');
        doc.setTextColor(0, 0, 0);
    
        const pageWidth = doc.internal.pageSize.getWidth();
        const usableWidth = pageWidth - margin * 2;
    
        const businessName = document.getElementById("receipt-business").value;
        const address = document.getElementById("receipt-address").value;
        const phone = document.getElementById("receipt-phone").value;
        const email = document.getElementById("receipt-email").value;
    
        doc.setFontSize(20);
        doc.setFont("courier", "bold");
        doc.text(businessName, margin, y, { maxWidth: usableWidth });
    
        y += 15;
        doc.setFontSize(10);
        doc.setFont("courier", "normal");
        doc.text(address, 5, y); y += 4;
        doc.text(phone, 5, y); y += 4;
        doc.text(email, 5, y);
        y += 10;

        //Adding the date and time to the receipt
        const date = new Date();
        const dateTimeString = date.toLocaleString(); // e.g., "5/6/2025, 10:32:15 AM"

        doc.setFontSize(8);
        doc.text(`Issued On: ${dateTimeString}`, 5, y); // adjust `x` and `y` positions as needed
        y += 10;

        
        doc.setLineWidth(0.2);
        doc.setDrawColor(0);
        doc.setLineDashPattern([3, 1]);
        doc.line(0, y, 100, y);
    
        y += 10;
        doc.setFontSize(15);
        doc.setFont("courier", "bold");
        doc.setTextColor(25, 62, 130);
        doc.text("Order Summary", 5, y);
        
        let rightAlignX = 100 - margin;
        doc.setFont("courier", "normal");
        receiptUnits.forEach(unit => {
            const item = unit.querySelector("#receipt-item").value;
            const desc = unit.querySelector("#receipt-item-desc").value;
            const qty = unit.querySelector("#receipt-item-qty").value;
            const price = unit.querySelector("#receipt-item-price").value;
            const total = unit.querySelector(".receipt-item-total h1").textContent;
    
            if (item || desc || qty || price) {
                doc.setFontSize(12.5);
                doc.setFont("courier", "bold");
                doc.setTextColor(0, 0, 0);
                y += 10;
                doc.text(item, 5, y); y += 5;
    
                doc.setFontSize(10);
                doc.setFont("courier", "normal");
                doc.text(desc, 5, y); y += 5;
                doc.text(`${qty}pcs`, 5, y); y += 5;
                doc.text(`GHS ${price}`, 5, y);
    
                doc.setFontSize(15);
                doc.setFont("courier", "bold");
                doc.setTextColor(25, 62, 130);
                doc.text(`GHS ${total}`, rightAlignX, y , { align: "right" });
                y += 5;
            }
        });
    
        doc.setLineWidth(0.2);
        doc.setDrawColor(0);
        doc.setLineDashPattern([3, 1]);
        y += 10;
        doc.line(0, y, 100, y);
        y += 10;
    
        const delivery = deliveryInput.value || "0.00";
        const discount = discountInput.value || "0.00";
        const subtotal = document.querySelector(".conclusion-item:nth-child(2) h1:last-child").textContent;
        const grandTotal = document.querySelector(".conclusion-item:nth-child(4) h1:last-child").textContent;
        
        doc.setFontSize(12.5);
        doc.setFont("courier", "bold");
        doc.setTextColor(0, 0, 0);
        doc.text("Delivery Fee", 5, y);
        doc.setFont("courier", "normal");
        doc.text(`GHS ${delivery}`, rightAlignX, y , { align: "right" }); y += 5;

        doc.setFont("courier", "bold");
        doc.text("Sub Total", 5, y);
        doc.setFont("courier", "normal");
        doc.text(`GHS ${subtotal}` , rightAlignX, y , { align: "right" }); y += 5;

        doc.setFont("courier", "bold");
        doc.text("Discount", 5, y);
        doc.setFont("courier", "normal");
        doc.text(`GHS ${discount}` , rightAlignX, y , { align: "right" }); y += 5;

        doc.setLineWidth(0.2);
        doc.setDrawColor(0);
        doc.setLineDashPattern([3, 1]);
        y += 5;
        doc.line(0, y, 100, y);
        y += 10;

        doc.setFontSize(15);
        doc.setFont("courier", "bold");
        doc.setTextColor(25, 62, 130);
        doc.text("TOTAL", 5, y);
        doc.text(`GHS ${grandTotal}` , rightAlignX, y , { align: "right" }); y += 5;
        
        doc.setLineWidth(0.2);
        doc.setDrawColor(0);
        doc.setLineDashPattern([3, 1]);
        y += 5;
        doc.line(0, y, 100, y);
        y += 10;
        
        const name = document.querySelector(".receipt-footer input").value;
        doc.setFontSize(10);
        doc.setFont("courier", "normal");
        doc.setTextColor(0, 0, 0);
        doc.text(`Hello ${name || 'dear customer'}! Thank you for purchasing from ${businessName || 'us'}!`, margin, y, { maxWidth: usableWidth }); y += 10;
        doc.text("Your order has been dispached. Sit tight for your delivery!", margin, y, { maxWidth: usableWidth });
    
        doc.save("receipt.pdf");
    };
    

    const pdfBtn = document.getElementById("generate-receipt");
    if (pdfBtn) {
        pdfBtn.addEventListener("click", generatePDF);
    }
});
