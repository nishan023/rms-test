import 'dotenv/config';
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
import prisma from '../config/prisma.ts';

async function verifyTables() {
    console.log('🔍 Verifying Tables...');
    
    // Check T tables
    const tTables = await prisma.table.findMany({
        where: { tableCode: { startsWith: 'T' } },
        orderBy: { tableCode: 'asc' }
    });
    console.log(`T Tables (${tTables.length}):`, tTables.map(t => t.tableCode).join(', '));
    
    // Check O tables
    const oTables = await prisma.table.findMany({
        where: { tableCode: { startsWith: 'O' } },
        orderBy: { tableCode: 'asc' }
    });
    console.log(`O Tables (${oTables.length}):`, oTables.map(t => t.tableCode).join(', '));
}

verifyTables()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
