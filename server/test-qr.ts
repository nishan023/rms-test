import { generateQRService } from './src/service/table.service.ts';
import prisma from './src/config/prisma.ts';

async function testQrFormat() {
    process.env.FRONTEND_URL = 'http://localhost:5173';
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

    try {
        const result = await generateQRService({ tableCode: 'T1' });
        console.log('Generated QR Data:', result.table.qrCodeData);
        if (result.table.qrCodeData === 'http://localhost:5173/menu/T1') {
            console.log('✅ TEST PASSED: QR format is correct.');
        } else {
            console.log('❌ TEST FAILED: QR format is incorrect.', result.table.qrCodeData);
        }
    } catch (error) {
        console.error('Test failed with error:', error);
    } finally {
        await prisma.$disconnect();
    }
}

testQrFormat();
