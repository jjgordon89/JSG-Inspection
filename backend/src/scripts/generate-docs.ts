#!/usr/bin/env ts-node

/**
 * API Documentation Generator
 * Generates comprehensive OpenAPI documentation from route annotations
 */

import fs from 'fs';
import path from 'path';
import swaggerJSDoc from 'swagger-jsdoc';
import { swaggerConfig } from '../config/swagger';

// Swagger JSDoc options
const options: swaggerJSDoc.Options = {
  definition: swaggerConfig,
  apis: [
    path.join(__dirname, '../routes/*.ts'),
    path.join(__dirname, '../controllers/*.ts'),
    path.join(__dirname, '../models/*.ts'),
    path.join(__dirname, '../types/*.ts')
  ]
};

/**
 * Generate OpenAPI specification
 */
function generateApiDocs(): void {
  try {
    console.log('🚀 Generating API documentation...');
    
    // Generate the OpenAPI specification
    const specs = swaggerJSDoc(options);
    
    // Ensure docs directory exists
    const docsDir = path.join(__dirname, '../../docs');
    if (!fs.existsSync(docsDir)) {
      fs.mkdirSync(docsDir, { recursive: true });
    }
    
    // Write OpenAPI JSON specification
    const jsonPath = path.join(docsDir, 'openapi.json');
    fs.writeFileSync(jsonPath, JSON.stringify(specs, null, 2));
    console.log(`✅ OpenAPI JSON generated: ${jsonPath}`);
    
    // Write OpenAPI YAML specification
    const yaml = require('js-yaml');
    const yamlPath = path.join(docsDir, 'openapi.yaml');
    fs.writeFileSync(yamlPath, yaml.dump(specs));
    console.log(`✅ OpenAPI YAML generated: ${yamlPath}`);
    
    // Generate API documentation summary
    generateDocsSummary(specs);
    
    console.log('🎉 API documentation generation completed!');
    console.log('📖 View documentation at: http://localhost:3000/api-docs');
    
  } catch (error) {
    console.error('❌ Error generating API documentation:', error);
    process.exit(1);
  }
}

/**
 * Generate documentation summary
 */
function generateDocsSummary(specs: any): void {
  const summaryPath = path.join(__dirname, '../../docs/API-SUMMARY.md');
  
  let summary = `# JSG-Inspections API Documentation\n\n`;
  summary += `Generated on: ${new Date().toISOString()}\n\n`;
  summary += `## API Information\n\n`;
  summary += `- **Title**: ${specs.info.title}\n`;
  summary += `- **Version**: ${specs.info.version}\n`;
  summary += `- **Description**: ${specs.info.description}\n\n`;
  
  // Count endpoints by tag
  const endpointsByTag: Record<string, number> = {};
  let totalEndpoints = 0;
  
  if (specs.paths) {
    Object.keys(specs.paths).forEach(path => {
      Object.keys(specs.paths[path]).forEach(method => {
        totalEndpoints++;
        const endpoint = specs.paths[path][method];
        if (endpoint.tags && endpoint.tags.length > 0) {
          const tag = endpoint.tags[0];
          endpointsByTag[tag] = (endpointsByTag[tag] || 0) + 1;
        }
      });
    });
  }
  
  summary += `## Endpoint Summary\n\n`;
  summary += `**Total Endpoints**: ${totalEndpoints}\n\n`;
  
  Object.entries(endpointsByTag).forEach(([tag, count]) => {
    summary += `- **${tag}**: ${count} endpoints\n`;
  });
  
  summary += `\n## Available Documentation Formats\n\n`;
  summary += `- [OpenAPI JSON](./openapi.json)\n`;
  summary += `- [OpenAPI YAML](./openapi.yaml)\n`;
  summary += `- [Interactive Swagger UI](http://localhost:3000/api-docs)\n\n`;
  
  summary += `## Authentication\n\n`;
  summary += `The API uses JWT Bearer token authentication. Include the token in the Authorization header:\n\n`;
  summary += `\`\`\`\n`;
  summary += `Authorization: Bearer <your-jwt-token>\n`;
  summary += `\`\`\`\n\n`;
  
  summary += `## Rate Limiting\n\n`;
  summary += `API endpoints are rate limited to prevent abuse:\n\n`;
  summary += `- **Authentication endpoints**: 5 requests per minute\n`;
  summary += `- **General endpoints**: 100 requests per minute\n`;
  summary += `- **File upload endpoints**: 10 requests per minute\n\n`;
  
  summary += `## Error Handling\n\n`;
  summary += `The API returns consistent error responses with the following structure:\n\n`;
  summary += `\`\`\`json\n`;
  summary += `{\n`;
  summary += `  "success": false,\n`;
  summary += `  "error": {\n`;
  summary += `    "code": "ERROR_CODE",\n`;
  summary += `    "message": "Human readable error message",\n`;
  summary += `    "details": "Additional error details (optional)"\n`;
  summary += `  }\n`;
  summary += `}\n`;
  summary += `\`\`\`\n\n`;
  
  summary += `## WebSocket Events\n\n`;
  summary += `Real-time features are available via WebSocket connection:\n\n`;
  summary += `- **Connection**: \`ws://localhost:3000\`\n`;
  summary += `- **Authentication**: Send JWT token after connection\n`;
  summary += `- **Events**: Inspection updates, notifications, system alerts\n\n`;
  
  fs.writeFileSync(summaryPath, summary);
  console.log(`✅ API summary generated: ${summaryPath}`);
}

/**
 * Validate OpenAPI specification
 */
function validateApiDocs(specs: any): boolean {
  const errors: string[] = [];
  
  // Check required fields
  if (!specs.info) errors.push('Missing info section');
  if (!specs.info?.title) errors.push('Missing API title');
  if (!specs.info?.version) errors.push('Missing API version');
  if (!specs.paths || Object.keys(specs.paths).length === 0) {
    errors.push('No API paths defined');
  }
  
  // Check security schemes
  if (!specs.components?.securitySchemes) {
    errors.push('Missing security schemes');
  }
  
  if (errors.length > 0) {
    console.error('❌ OpenAPI specification validation failed:');
    errors.forEach(error => console.error(`  - ${error}`));
    return false;
  }
  
  console.log('✅ OpenAPI specification validation passed');
  return true;
}

// Run the documentation generator
if (require.main === module) {
  generateApiDocs();
}

export { generateApiDocs, validateApiDocs };