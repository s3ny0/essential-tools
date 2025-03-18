//Load DOM content before running script
document.addEventListener("DOMContentLoaded", function () {
    const { jsPDF } = window.jspdf;


    function formatNumber(num) {
        return num.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    }

    //Display the company logo in preview
    document.getElementById("file-input").addEventListener("change", function(event) {
        let file = event.target.files[0];
        let companyLogoElement = document.getElementById("company-logo");
        
        // Remove any existing image
        companyLogoElement.innerHTML = "";
        
        if (file) {
            let reader = new FileReader();
            reader.onload = function(e) {
                let img = document.createElement("img");
                img.src = e.target.result;
                companyLogoElement.appendChild(img);
            };
            reader.readAsDataURL(file);
        }
    });

    function updateTotals() {
        let totalDue = 0;
        
        //Returning the totals for each item
        document.querySelectorAll(".saleItem").forEach((item) => {
            let price = parseFloat(item.querySelector(".price").value) || 0;
            let quantity = parseInt(item.querySelector(".quantity").value) || 0;
            let subtotal = price * quantity;

            item.querySelector(".subTotal").textContent = subtotal ? formatNumber(subtotal) : "";
            totalDue += subtotal;
        });

        let subTotalElement = document.getElementById("sub-total");
        let taxAmountElement = document.getElementById("tax-amount");
        let discountAmountElement = document.getElementById("discount-amount");
        let grandTotalElement = document.getElementById("grand-total");
        let totalDueElement = document.getElementById("total-due");

        subTotalElement.textContent = formatNumber(totalDue);

        let taxRate = parseFloat(document.getElementById("tax-rate")?.value) || 0;
        let discountRate = parseFloat(document.getElementById("discount-rate")?.value) || 0;

        let taxAmount = (totalDue * taxRate) / 100;
        let grandTotalBeforeDiscount = totalDue + taxAmount;
        let discountAmount = (grandTotalBeforeDiscount * discountRate) / 100;
        let grandTotal = grandTotalBeforeDiscount - discountAmount;

        taxAmountElement.textContent = formatNumber(taxAmount);
        discountAmountElement.textContent = formatNumber(discountAmount);
        grandTotalElement.textContent = formatNumber(grandTotal);
        totalDueElement.textContent = formatNumber(grandTotal);
    }

    document.querySelectorAll(".price, .quantity, #tax-rate, #discount-rate").forEach((input) => {
        input.addEventListener("input", updateTotals);
    });

    updateTotals();

    let uploadedLogo = null;
    document.querySelector(".profile-img input[type='file']").addEventListener("change", function (event) {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function (e) {
                uploadedLogo = e.target.result;
            };
            reader.readAsDataURL(file);
        }
    });

    document.getElementById("generate-invoice").addEventListener("click", function () {
        function cleanNumber(value) {
            return parseFloat(value.replace(/,/g, '')) || 0;
        }
        
        let totalDue = cleanNumber(document.getElementById("total-due").textContent);
        let subTotal = cleanNumber(document.getElementById("sub-total").textContent);
        let taxAmount = cleanNumber(document.getElementById("tax-amount").textContent);
        let discountAmount = cleanNumber(document.getElementById("discount-amount").textContent);
        let grandTotal = cleanNumber(document.getElementById("grand-total").textContent);
        
        const doc = new jsPDF();
        let margin = 10;
        let y = margin;

        // Header Section
        //Logo Display
        y += 20;
        if (uploadedLogo) {
            doc.addImage(uploadedLogo, "PNG", margin, y, 30, 30);
        } else {
            doc.setFillColor(200, 200, 200);
            doc.rect(margin, y, 40, 40, "F");
        }
        
        //Company Name, Invoice Number & Date
        let rightAlignX = 240 - margin - 30;
        doc.setFontSize(12);
        doc.setFont("helvetica", "bold");
        doc.text(`${document.getElementById("company-name").value || ''}`, rightAlignX, y, { align: "right" });
        doc.setFontSize(8);
        doc.setFont("helvetica", "normal");
        doc.text(`${document.getElementById("company-address").value || ''}`, rightAlignX, y + 10, { align: "right" });
        doc.text(`${document.getElementById("company-email").value || ''}`, rightAlignX, y + 15, { align: "right" });
        doc.text(`${document.getElementById("company-phone").value || ''}`, rightAlignX, y + 20, { align: "right" });
        doc.text(`INV-${document.getElementById("order-number").value || ''}`, rightAlignX, y + 25, { align: "right" });
        doc.text(`${document.getElementById("invoice-date").value || ''}`, rightAlignX, y + 30, { align: "right" });
        y += 50;

        // Divider
        doc.setLineWidth(0.25);
        doc.line(margin, y, 210 - margin, y);
        y += 10;

        // Bill To & Total Due Section
        doc.setFontSize(12);
        doc.setFont("helvetica", "bold");
        doc.text("Bill To:", margin, y);

        // Total Due Section
        doc.setFontSize(12);
        doc.setFont("helvetica", "bold");
        doc.text("Total Due", rightAlignX, y, { align: "right" });
        doc.setFont("helvetica", "normal");
        
        // Bill To Section
        y += 10;
        doc.setFontSize(8);
        doc.setFont("helvetica", "normal");
        doc.text(`${document.getElementById("bill-to-person").value || ''}`, margin, y);
        doc.text(formatNumber(totalDue), rightAlignX, y, { align: "right" });
        y += 5;
        doc.text(`${document.getElementById("bill-to-address").value || ''}`, margin, y);
        y += 5;
        doc.text(`${document.getElementById("bill-to-email").value || ''}`, margin, y);
        y += 5;
        doc.text(`${document.getElementById("bill-to-contact").value || ''}`, margin, y);
        y += 15;

        // Divider
        doc.setLineWidth(1);
        doc.line(margin, y, 210 - margin, y);
        y += 15; 
        
        doc.setFont("helvetica", "bold");
        doc.text("Item", margin, y);
        doc.text("Price", 110, y);
        doc.text("Qty.", 140, y);
        doc.text("Amount", rightAlignX, y , { align: "right" });
        y += 10;

        document.querySelectorAll("#saleItem").forEach((item) => {
            let description = item.querySelector(".item").value || 'N/A';
            let price = parseFloat(item.querySelector(".price").value) || 0;
            let quantity = parseInt(item.querySelector(".quantity").value) || 0;
            let total = price * quantity;
            
            doc.setFont("helvetica", "normal")
            let rightAlignX = 240 - margin - 30;
            if (total > 0) {
                doc.setFontSize(8);
                doc.text(`${description}`, margin, y);
                doc.text(`${formatNumber(price)}`, 110, y);
                doc.text(`${quantity}`, 140, y);
                doc.text(`${formatNumber(total)}`, rightAlignX, y , { align: "right" });
                y += 5;
            }
        });

        // Divider
        doc.setLineWidth(0.25);
        doc.line(margin, y, 210 - margin, y);
        y += 10;


        // Payment Method & Grand Total Section (Side by Side)
        doc.setFont("helvetica", "bold");
        doc.text("Payment Method:", margin, y);
        doc.setFont("helvetica", "normal");
        doc.text(document.getElementById("payment-method").value || "N/A", margin + 40, y); // Align inline

        // Move Totals section to align with Payment Method
        doc.setFont("helvetica", "bold");
        doc.text("Sub-Total:", 140, y);
        doc.setFont("helvetica", "normal");
        doc.text(formatNumber(subTotal), rightAlignX, y, { align: "right" });

        y += 5;
        doc.setFont("helvetica", "bold");
        doc.text("Account Number:", margin, y);
        doc.setFont("helvetica", "normal");
        doc.text(document.getElementById("account-number").value || "N/A", margin + 40, y); // Align inline

        doc.setFont("helvetica", "bold");
        doc.text("Tax:", 140, y);
        doc.setFont("helvetica", "normal");
        doc.text(formatNumber(taxAmount), rightAlignX, y, { align: "right" });

        y += 5;
        doc.setFont("helvetica", "bold");
        doc.text("Discount:", 140, y);
        doc.setFont("helvetica", "normal");
        doc.text(formatNumber(discountAmount), rightAlignX, y, { align: "right" });

        y += 5;
        doc.setFont("helvetica", "bold");
        doc.text("Grand Total:", 140, y);
        doc.setFont("helvetica", "normal");
        doc.text(formatNumber(parseFloat(grandTotal)), rightAlignX, y, { align: "right" });

        //Issued By
        y += 20;
        doc.setFontSize(8);
        doc.setFont("helvetica", "normal");
        doc.text(`This invoice was issued by ${document.getElementById("issued-by").value || ''}`, margin, y);

        y += 10;


        
        // Divider
        doc.setLineWidth(1);
        doc.line(margin, y, 210 - margin, y);
        y += 10;

        // Footer
        doc.setFont("helvetica", "normal")
        doc.setFontSize(6);
        doc.text("This PDF was generated using Invoice Me", margin, y + 10);



        doc.save("Invoice.pdf");
    });
});
