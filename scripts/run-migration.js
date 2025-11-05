const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

async function main() {
  console.log('🚀 Starting loyalty program setup...\n');

  try {
    // Read SQL file
    console.log('📦 Reading migration file...');
    const sqlPath = path.join(__dirname, 'init-loyalty.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');

    // Split SQL into individual statements
    const statements = sql
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--') && !s.startsWith('SELECT'));

    console.log(`Found ${statements.length} SQL statements to execute\n`);

    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      try {
        console.log(`[${i + 1}/${statements.length}] Executing...`);
        await prisma.$executeRawUnsafe(statement + ';');
        console.log(`✅ Success\n`);
      } catch (error) {
        // Check if error is benign (table/column already exists)
        if (
          error.message.includes('Duplicate column') ||
          error.message.includes('already exists') ||
          error.message.includes('Duplicate entry')
        ) {
          console.log(`⚠️  Skipped (already exists)\n`);
        } else {
          console.error(`❌ Error: ${error.message}`);
          console.error(`Statement: ${statement.substring(0, 100)}...\n`);
          // Continue with other statements
        }
      }
    }

    // Verify rewards were created
    console.log('📊 Verifying setup...');
    const rewardCount = await prisma.loyaltyReward.count();
    const userCount = await prisma.user.count();

    console.log(`\n✅ Setup completed!`);
    console.log(`  - ${rewardCount} rewards in catalog`);
    console.log(`  - ${userCount} users in database`);

    console.log('\n🎉 Loyalty program is ready!');
    console.log('\n📝 Next steps:');
    console.log('  1. Visit /account/loyalty to see the rewards');
    console.log('  2. Test signup bonus: Create a new account');
    console.log('  3. Test order points: Make a purchase');
    console.log('  4. Test review points: Write a product review');

  } catch (error) {
    console.error('\n❌ Fatal error during setup:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
