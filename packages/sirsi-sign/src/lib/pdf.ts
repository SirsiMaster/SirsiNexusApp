import { contractsClient } from './grpc';

export async function downloadContractPdf(contractId: string) {
    try {
        const response = await contractsClient.generatePage({
            contractId: contractId
        });

        if (response.html) {
            const printWindow = window.open('', '_blank');
            if (printWindow) {
                printWindow.document.write(response.html);
                printWindow.document.close();

                // Wait for styles and fonts to load
                printWindow.onload = () => {
                    printWindow.print();
                };
            }
        }
    } catch (err) {
        console.error('Failed to generate PDF:', err);
        alert('Failed to generate PDF. Please try again.');
    }
}
