import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export const handleDownload = async (filename = "salary_slip.pdf", elementId = "printable-slip") => {
  const element = document.getElementById(elementId);
  if (!element) {
    alert("Nothing to download. Please open the slip first.");
    return;
  }

  try {
    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: "#ffffff"
    });
    
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');
    const imgProps = pdf.getImageProperties(imgData);
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
    
    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
    pdf.save(filename);
    
    alert(`${filename} has been generated and downloaded successfully!`);
  } catch (error) {
    console.error("PDF Generation Error:", error);
    alert("Failed to generate PDF. Please try printing instead.");
  }
};

export const handlePrint = () => {
  window.print();
};
