import 'dotenv/config';
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
import prisma from '../config/prisma.ts';
import { v4 as uuidv4 } from 'uuid';

async function fixTableNames() {
    console.log('🧹 Starting table name cleanup...');

    // 1. Delete "WALKIN-" tables (virtual tables cluttering the UI)
    const virtualTables = await prisma.table.findMany({
        where: { tableCode: { startsWith: 'WALKIN-' } }
    });
    
    console.log(`Found ${virtualTables.length} virtual 'WALKIN-' tables.`);
    
    for (const table of virtualTables) {
        // Check for orders
        const orderCount = await prisma.order.count({ where: { tableId: table.id } });
        if (orderCount === 0) {
            await prisma.table.delete({ where: { id: table.id } });
            console.log(`   🗑️ Deleted empty virtual table: ${table.tableCode}`);
        } else {
            console.log(`   ⚠️ Skipping ${table.tableCode} (has ${orderCount} orders)`);
        }
    }

    // 2. Normalize Table Names (uppercase, remove leading zeros)
    // First, handle known specific outlier "ONLINE"
    const onlineTable = await prisma.table.findUnique({ where: { tableCode: 'ONLINE' } });
    if (onlineTable) {
        // Find next O number
        const oTables = await prisma.table.findMany({ where: { tableCode: { startsWith: 'O' } } });
        let maxO = 0;
        oTables.forEach(t => {
            const m = t.tableCode.match(/O(\d+)/);
            if (m) maxO = Math.max(maxO, parseInt(m[1]));
        });
        const newCode = `O${maxO + 1}`;
        await prisma.table.update({
            where: { id: onlineTable.id },
            data: { tableCode: newCode, tableType: 'ONLINE' }
        });
        console.log(`   🔄 Renamed specific outlier 'ONLINE' -> ${newCode}`);
    }

    const allTables = await prisma.table.findMany();
    
    for (const table of allTables) {
        if (table.tableCode.startsWith('WALKIN-')) continue;
        if (table.tableCode === 'ONLINE') continue; // Should be handled above, but just in case

        const originalCode = table.tableCode;
        
        // Extract prefix and number
        const match = originalCode.match(/^([a-zA-Z]+)(\d+)$/);
        if (!match) {
            console.log(`   ❓ Skipping unrecognized format: ${originalCode}`);
            continue;
        }

        const prefix = match[1].toUpperCase();
        const number = parseInt(match[2], 10);
        const newCode = `${prefix}${number}`; // e.g., t01 -> T1

        if (originalCode !== newCode) {
            console.log(`   🔄 Renaming ${originalCode} -> ${newCode}`);
            
            // Check if target exists
            const targetExists = await prisma.table.findUnique({
                where: { tableCode: newCode }
            });

            if (targetExists) {
                // Determine which to keep. If original has no orders and target does, delete original.
                // If original has orders... complications.
                const originalOrders = await prisma.order.count({ where: { tableId: table.id } });
                const targetOrders = await prisma.order.count({ where: { tableId: targetExists.id } });

                if (originalOrders === 0) {
                     await prisma.table.delete({ where: { id: table.id } });
                     console.log(`      🗑️ Deleted duplicate/empty ${originalCode} (kept existing ${newCode})`);
                } else if (targetOrders === 0) {
                     await prisma.table.delete({ where: { id: targetExists.id } });
                     await prisma.table.update({
                        where: { id: table.id },
                        data: { tableCode: newCode }
                     });
                     console.log(`      ✏️ Overwrote empty ${newCode} with ${originalCode} data`);
                } else {
                    console.log(`      ❌ CONFLICT: Both ${originalCode} and ${newCode} have orders. Skipping merge.`);
                }
            } else {
                // Safe rename
                await prisma.table.update({
                    where: { id: table.id },
                    data: { tableCode: newCode }
                });
                console.log(`      ✅ Renamed successfully`);
            }
        }
    }

    // 3. Fill Gaps (e.g., T9 missing)
    console.log('✨ Checking for numbering gaps...');
    const prefixes = ['T', 'C', 'O'];
    const types = {'T': 'PHYSICAL', 'C': 'WALK_IN', 'O': 'ONLINE'};

    for (const prefix of prefixes) {
        const tables = await prisma.table.findMany({
            where: { tableCode: { startsWith: prefix } }
        });
        
        const numbers = tables
            .map(t => {
                const m = t.tableCode.match(new RegExp(`^${prefix}(\\d+)$`));
                return m ? parseInt(m[1]) : 0;
            })
            .filter(n => n > 0)
            .sort((a, b) => a - b);

        if (numbers.length === 0) continue;

        const maxNum = numbers[numbers.length - 1];
        const missingNumbers = [];
        for (let i = 1; i < maxNum; i++) {
            if (!numbers.includes(i)) {
                missingNumbers.push(i);
            }
        }

        if (missingNumbers.length > 0) {
            console.log(`   Found gaps for ${prefix}: ${missingNumbers.join(', ')}`);
            for (const num of missingNumbers) {
                const code = `${prefix}${num}`;
                // Double check it doesn't exist
                const exists = await prisma.table.findUnique({ where: { tableCode: code } });
                if (!exists) {
                    await prisma.table.create({
                        data: {
                            tableCode: code,
                            tableType: types[prefix as keyof typeof types] as any,
                            qrToken: uuidv4(),
                            isActive: true
                        }
                    });
                     console.log(`      ➕ Created missing table: ${code}`);
                }
            }
        } else {
             console.log(`   No gaps for ${prefix}.`);
        }
    }
    
    console.log('✨ Table cleanup completed!');
}

fixTableNames()
    .catch((e) => {
        console.error('Error fixing tables:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
