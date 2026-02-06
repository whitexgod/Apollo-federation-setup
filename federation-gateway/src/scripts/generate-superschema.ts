import { IntrospectAndCompose } from '@apollo/gateway';
import { ApolloGateway } from '@apollo/gateway';
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

async function generateSuperschema() {
  console.log('🔄 Generating superschema from subgraphs...\n');

  const authServiceUrl = process.env.AUTH_SERVICE_URL || 'http://localhost:3000/graphql';
  const notificationServiceUrl =
    process.env.NOTIFICATION_SERVICE_URL || 'http://localhost:3002/graphql';

  try {
    // Create gateway instance
    const gateway = new ApolloGateway({
      supergraphSdl: new IntrospectAndCompose({
        subgraphs: [
          { name: 'auth', url: authServiceUrl },
          { name: 'notification', url: notificationServiceUrl },
        ],
      }),
    });

    // Load the gateway (this will compose the supergraph)
    const { schema } = await gateway.load();

    // Get the SDL (Schema Definition Language)
    const { printSchema } = require('graphql');
    const superschema = printSchema(schema);

    // Write to file
    const outputPath = path.join(__dirname, '../../superschema.graphql');
    fs.writeFileSync(outputPath, superschema, 'utf-8');

    console.log('✅ Superschema generated successfully!');
    console.log(`📄 File location: ${outputPath}`);
    console.log(`📊 Schema size: ${superschema.length} characters\n`);

    // Print summary
    const typeCount = (superschema.match(/^type /gm) || []).length;
    const queryCount = (superschema.match(/^\s+\w+.*:/gm) || []).length;

    console.log('📈 Schema Summary:');
    console.log(`   - Types defined: ${typeCount}`);
    console.log(`   - Total fields: ${queryCount}`);
    console.log(`   - Subgraphs: 2 (auth, notification)\n`);

    await gateway.stop();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error generating superschema:', error.message);
    console.error('\n💡 Make sure both subgraph services are running:');
    console.error(`   - Auth Service: ${authServiceUrl}`);
    console.error(`   - Notification Service: ${notificationServiceUrl}\n`);
    process.exit(1);
  }
}

generateSuperschema();
