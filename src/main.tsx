import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Amplify } from 'aws-amplify'
import awsExports from './aws-exports'
import './index.css'
import App from './App.tsx'

// Configure Amplify
Amplify.configure(awsExports)

// 🔍 Debug Amplify configuration in development
if (import.meta.env.DEV) {
  console.log('🔧 Amplify Configuration Debug:');
  console.log('User Pool ID:', awsExports.aws_user_pools_id);
  console.log('User Pool Client ID:', awsExports.aws_user_pools_web_client_id);
  console.log('Identity Pool ID:', awsExports.aws_cognito_identity_pool_id);
  console.log('Region:', awsExports.aws_project_region);
  console.log('S3 Bucket:', awsExports.aws_user_files_s3_bucket);
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
