import 'dotenv/config';
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
import { TableType } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';
import prisma from '../config/prisma.ts';

console.log("DEBUG: DATABASE_URL is", process.env.DATABASE_URL ? "SET" : "NOT SET");

const TABLE_CONFIG = [
    { type: 'PHYSICAL' as TableType, prefix: 'T', count: 8 },
    { type: 'WALK_IN' as TableType, prefix: 'C', count: 8 },
    { type: 'ONLINE' as TableType, prefix: 'O', count: 8 },
];

async function seedTables() {
    console.log('🌱 Starting table seeding...');

    for (const config of TABLE_CONFIG) {
        console.log(`Processing ${config.type} tables (${config.prefix}1 - ${config.prefix}${config.count})...`);
        
        for (let i = 1; i <= config.count; i++) {
            const tableCode = `${config.prefix}${i}`;
            
            // Check if exists
            const existing = await prisma.table.findUnique({
                where: { tableCode }
            });

            if (!existing) {
                await prisma.table.create({
                    data: {
                        tableCode,
                        tableType: config.type,
                        qrToken: uuidv4(),
                        isActive: true
                    }
                });
                console.log(`   ✅ Created ${tableCode}`);
            } else {
                console.log(`   Example: ${tableCode} already exists`);
            }
        }
    }

    console.log('✨ Table seeding completed!');
}

seedTables()
    .catch((e) => {
        console.error('Error seeding tables:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
