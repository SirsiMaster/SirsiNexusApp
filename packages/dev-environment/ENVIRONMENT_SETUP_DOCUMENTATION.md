# Environment Setup & Credential Management Documentation

## Overview

The Environment Setup step is the first step in all Sirsi Nexus wizards (Migration, Optimization, and Auto-Scaling), providing comprehensive credential management and environment configuration before proceeding with cloud operations.

## Features

### 🔐 **Credential Management**
- **Multi-Cloud Support**: AWS, Azure, GCP, and vSphere credential selection
- **Reusable Component**: `CredentialSelector` component used across all wizards
- **Real-Time Status**: Display of credential status, last used timestamps, and permission scopes
- **Provider-Specific Icons**: Visual differentiation of cloud providers with branded icons

### 🎯 **Wizard-Specific Configuration**

#### Migration Wizard (`/migration`)
- **Source Credentials**: Required - environment being migrated FROM
- **Target Credentials**: Required - environment being migrated TO
- **Validation**: Prevents using same credentials for source and target
- **Best Practices**: Warns when source and target are in same region
- **Supported Source Types**: AWS, Azure, GCP, vSphere
- **Supported Target Types**: AWS, Azure, GCP (no migration TO vSphere)

#### Optimization Wizard (`/optimization`)
- **Environment Credentials**: Required - environment to optimize
- **Single Credential**: Only source environment needed
- **Supported Types**: AWS, Azure, GCP

#### Auto-Scaling Wizard (`/scaling`)
- **Environment Credentials**: Required - environment for auto-scaling
- **Single Credential**: Only source environment needed
- **Supported Types**: AWS, Azure, GCP

### 🛡️ **Security & Validation**

#### Smart Validation
- Required credential validation based on wizard type
- Prevention of duplicate credential selection in migration
- Best practice warnings (different regions recommended)
- Real-time validation feedback with clear error messages

#### Security Transparency
- Clear security notices about credential handling
- Information about encrypted storage and minimum permissions
- Revocation instructions through Credentials Management page
- Permission scope transparency for each credential

### 📊 **Environment Configuration Summary**
- Visual display of selected credentials with provider branding
- Credential details including account, region, and status
- Configuration overview with selected environment context
- Smooth animations and responsive design

## Implementation Details

### Components

#### `EnvironmentSetupStep.tsx`
- **Location**: `src/components/MigrationSteps/steps/EnvironmentSetupStep.tsx`
- **Props**: 
  - `wizardType`: 'migration' | 'optimization' | 'scaling'
  - `onComplete`: Callback with environment configuration artifact
- **Wizard Configuration**: Dynamic configuration based on wizard type
- **Validation Logic**: Smart validation with error feedback
- **Artifact Generation**: Creates environment configuration JSON artifact

#### `CredentialSelector.tsx`
- **Location**: `src/components/CredentialSelector.tsx`
- **Props**:
  - `title`: Selector title
  - `description`: Selector description  
  - `selectedCredential`: Currently selected credential
  - `onSelect`: Selection callback
  - `allowedTypes`: Array of allowed credential types
  - `required`: Whether selection is required
- **Features**: Mock credential data, provider icons, status display
- **Responsive**: Works across desktop and mobile layouts

### Wizard Integration

Each wizard integrates the Environment Setup step as the first step:

```typescript
// Migration Wizard
{currentStep === 'environment' && (
  <EnvironmentSetupStep 
    wizardType="migration"
    onComplete={(artifact) => {
      handleStepComplete(currentStep, artifact);
    }}
  />
)}

// Optimization Wizard  
{currentStep === 'environment' && (
  <EnvironmentSetupStep 
    wizardType="optimization"
    onComplete={(artifact) => {
      handleStepComplete(currentStep, artifact);
    }}
  />
)}

// Auto-Scaling Wizard
{currentStep === 'environment' && (
  <EnvironmentSetupStep 
    wizardType="scaling"
    onComplete={(artifact) => {
      handleStepComplete(currentStep, artifact);
    }}
  />
)}
```

### Artifact Generation

The Environment Setup step generates a comprehensive environment configuration artifact:

```json
{
  "wizardType": "migration",
  "source": {
    "name": "AWS Production",
    "type": "aws",
    "region": "us-east-1",
    "account": "123456789012",
    "status": "active",
    "lastUsed": "2025-01-07T10:30:00Z",
    "scopes": ["read", "write", "admin"]
  },
  "target": {
    "name": "Azure Development",
    "type": "azure", 
    "region": "East US",
    "account": "subscription-id",
    "status": "active",
    "lastUsed": "2025-01-07T09:15:00Z",
    "scopes": ["read", "write"]
  },
  "configuredAt": "2025-01-07T23:45:00Z"
}
```

## User Experience

### Flow
1. **Credential Selection**: User selects appropriate credentials for their wizard type
2. **Validation**: Real-time validation provides immediate feedback
3. **Configuration Summary**: Visual confirmation of selected environment setup
4. **Security Notice**: Clear information about credential handling and security
5. **Completion**: Environment configuration artifact generated for subsequent steps

### Visual Design
- **Provider Branding**: Cloud provider icons and colors for easy identification
- **Status Indicators**: Clear visual feedback for credential status and validation
- **Responsive Layout**: Works seamlessly across desktop and mobile devices
- **Smooth Animations**: Framer Motion animations for enhanced user experience

## Route Structure

The Environment Setup step is implemented across all wizard routes:

| Wizard | Route | Environment Setup |
|--------|-------|-------------------|
| Migration | `/migration` | Source + Target credentials |
| Optimization | `/optimization` | Single environment credential |
| Auto-Scaling | `/scaling` | Single environment credential |

## Future Enhancements

### Planned Features
- **Real Credential Integration**: Integration with actual cloud credential APIs
- **Credential Validation**: Real-time validation against cloud provider APIs
- **Permission Testing**: Automated testing of credential permissions
- **Credential Discovery**: Automatic discovery of available credentials
- **Multi-Factor Authentication**: Enhanced security for credential access
- **Credential Rotation**: Automated credential rotation and management

### API Integration
- **AWS IAM**: Integration with AWS Identity and Access Management
- **Azure AD**: Integration with Azure Active Directory
- **GCP IAM**: Integration with Google Cloud Identity and Access Management
- **vSphere vCenter**: Integration with vSphere authentication systems

## Best Practices

### Security
- Always validate credentials before proceeding with operations
- Use minimum required permissions for each operation
- Regularly rotate credentials and review access
- Monitor credential usage and access patterns

### User Experience
- Provide clear feedback during credential selection
- Explain security implications and best practices
- Allow users to easily manage and update credentials
- Provide troubleshooting guidance for common issues

### Development
- Use TypeScript interfaces for type safety
- Implement proper error handling and validation
- Follow React best practices for component composition
- Maintain consistent styling and branding across providers
