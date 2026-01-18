# SirsiNexus Data Room Management System

A comprehensive document management system designed for investor portals with advanced features including document categorization, access control, version history, search capabilities, and drag-and-drop uploads.

## 🚀 Features

### Document Management
- **File Categories**: Financial, Legal, Strategic, Technical, Marketing, Operations
- **Upload/Download**: Drag-and-drop interface with progress tracking
- **Document Preview**: In-browser preview for supported file types
- **Version History**: Track document versions with detailed changelog
- **Metadata Management**: Rich document descriptions, tags, and categorization

### Access Control & Security
- **Multi-level Access**: Public, Restricted, Confidential access levels
- **Role-based Permissions**: Viewer, Contributor, Editor, Admin roles
- **Document-specific Permissions**: Fine-grained access control per document
- **Audit Logging**: Complete access audit trail with reporting
- **Committee-based Access**: Restrict documents to specific committees

### Search & Discovery
- **Full-text Search**: Search document names, descriptions, and content
- **Advanced Filtering**: Filter by category, access level, date range, file type
- **Smart Suggestions**: Auto-complete search suggestions
- **Content Search**: Search within document content (simulated)
- **Tag-based Search**: Search using document tags and metadata

### User Interface
- **Responsive Design**: Mobile-first design with Tailwind CSS
- **Dark/Light Theme**: Automatic theme switching with persistence
- **Real-time Statistics**: Live document counts and usage metrics
- **Modern Components**: Clean, professional interface with smooth animations

## 📁 File Structure

```
investor-portal/
├── data-room-enhanced.html          # Main interface
├── assets/
│   └── js/
│       ├── data-room-management.js  # Core management system
│       ├── document-search.js       # Search engine
│       ├── access-control.js        # Permission management
│       └── data-room-api.js         # API integration layer
└── DATA_ROOM_README.md             # This documentation
```

## 🔧 Installation & Setup

### 1. File Placement
Place all files in your web server directory maintaining the folder structure:
```bash
/investor-portal/
```

### 2. Dependencies
The system uses the following external libraries (loaded via CDN):
- **Tailwind CSS**: For styling and responsive design
- **Lucide Icons**: For modern iconography
- **Inter Font**: For typography

### 3. Authentication
The system expects investor authentication data in sessionStorage:
```javascript
sessionStorage.setItem('investorAuth', JSON.stringify({
  id: 'user123',
  email: 'investor@example.com',
  role: 'viewer', // viewer, contributor, editor, admin
  loginTime: new Date().toISOString(),
  committees: ['executive', 'strategy'],
  specialAccess: []
}));
```

## 🎯 Usage Guide

### For End Users

#### Uploading Documents
1. Click the "Upload Document" button in the header
2. Drag and drop files or click to select (PDF, DOC, XLS, PPT supported)
3. Set document category, access level, and description
4. Click "Upload Documents" to complete

#### Searching Documents
1. Use the search bar in the header for quick searches
2. Use category filters to narrow results
3. Search supports document names, descriptions, and tags

#### Document Actions
- **Preview**: Click the "Preview" button to view document details
- **Download**: Click "Download" to get the file
- **Version History**: Click version indicator to see document versions

### For Administrators

#### Access Control
Administrators can:
- Set document-specific permissions
- Grant/revoke access to specific users
- View access audit logs
- Generate access reports

#### System Management
- Monitor document statistics
- Track user activity
- Manage document categories
- Configure access levels

## 🛠 Technical Architecture

### Core Classes

#### DataRoomManager
Main orchestrator class that coordinates all system components:
```javascript
class DataRoomManager {
  constructor() {
    this.documents = [];
    this.accessControl = new AccessControlManager();
    this.searchEngine = new DocumentSearchEngine();
  }
}
```

#### DocumentSearchEngine
Handles all search functionality:
- Full-text indexing
- Advanced filtering
- Search suggestions
- Content highlighting

#### AccessControlManager
Manages permissions and security:
- User role validation
- Document access control
- Audit logging
- Permission inheritance

#### DataRoomAPI
API integration layer for server communication:
- RESTful API client
- File upload with progress
- Batch operations
- Error handling

### Data Storage

The system uses browser localStorage for data persistence:
- `sirsi_data_room_documents`: Document metadata and content
- `sirsi_document_permissions`: Access control settings
- `sirsi_access_log`: Audit log entries

### Access Levels

1. **Public (Level 0)**: All authenticated users
2. **Restricted (Level 1)**: Committee members and higher
3. **Confidential (Level 2)**: Administrators only

### User Roles

1. **Viewer**: Read-only access to permitted documents
2. **Contributor**: Can upload new documents
3. **Editor**: Can modify document metadata
4. **Admin**: Full system access including permissions

## 🔒 Security Features

### Authentication
- Session-based authentication with timeout
- Automatic redirect to login page
- Session validation on each page load

### Authorization
- Role-based access control (RBAC)
- Document-level permissions
- Committee-based restrictions
- Audit trail for all actions

### Data Protection
- Client-side validation
- File type restrictions
- Size limitations (50MB max)
- XSS protection through proper escaping

## 📊 Analytics & Reporting

### Built-in Metrics
- Total document count
- Recent uploads (last 7 days)
- Total storage used
- Active user count

### Audit Capabilities
- All document access attempts logged
- User activity tracking
- Download statistics
- Permission change history

### Report Generation
Administrators can generate reports for:
- Document access patterns
- User activity trends
- Security violations
- System usage statistics

## 🎨 Customization

### Themes
The system supports light/dark themes with CSS custom properties:
```css
:root {
  --primary-color: #22c55e;
  --secondary-color: #64748b;
}
```

### Categories
Add new document categories by updating:
```javascript
const categories = ['financial', 'legal', 'strategic', 'technical', 'marketing', 'operations'];
```

### File Types
Supported file types can be modified in the validation:
```javascript
const validTypes = [
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  // Add more types as needed
];
```

## 🔄 Version History

### v1.0.0 - Initial Release
- Complete document management system
- Access control and permissions
- Search and filtering capabilities
- Drag-and-drop upload interface
- Version tracking and audit logs
- Responsive design with dark/light themes

## 🚀 Future Enhancements

### Planned Features
- Real-time collaboration
- Document commenting system
- Email notifications
- Advanced analytics dashboard
- Mobile app integration
- OCR for document content extraction
- Digital signatures support
- Bulk operations interface

### API Integration
The system is designed to integrate with backend APIs:
- File storage services (AWS S3, Azure Blob)
- Database systems (PostgreSQL, MongoDB)
- Authentication providers (OAuth, SAML)
- Notification services (Email, SMS)

## 📞 Support

For technical support or feature requests, contact:
- Email: support@sirsinexus.com
- Documentation: Internal knowledge base
- Issue Tracking: Internal ticketing system

## 📄 License

Proprietary software - SirsiNexus Technologies Inc.
All rights reserved - Not for distribution.

---

*Built with ❤️ for SirsiNexus investor portal ecosystem*
