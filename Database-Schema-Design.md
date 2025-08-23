# JSG-Inspections Database Schema Design

## Overview

This document provides a comprehensive database schema design for the JSG-Inspections application using SurrealDB. The schema is designed to support all core inspection management features while maintaining performance, scalability, and data integrity.

## Database Configuration

### SurrealDB Setup
```sql
-- Database and namespace configuration
USE NS jsg_inspections DB production;

-- Enable strict mode for data validation
DEFINE OPTION STRICT;

-- Set default permissions
DEFINE SCOPE user SESSION 24h
  SIGNUP ( CREATE user SET email = $email, pass = crypto::argon2::generate($pass) )
  SIGNIN ( SELECT * FROM user WHERE email = $email AND crypto::argon2::compare(pass, $pass) );
```

## Core Tables

### 1. Users Table
```sql
DEFINE TABLE users SCHEMAFULL
  PERMISSIONS
    FOR select, update WHERE id = $auth.id
    FOR create, delete WHERE $auth.role = 'admin';

DEFINE FIELD id ON users TYPE record<users>;
DEFINE FIELD email ON users TYPE string 
  ASSERT string::is::email($value) 
  VALUE string::lowercase($value);
DEFINE FIELD firstName ON users TYPE string 
  ASSERT string::len($value) > 0 AND string::len($value) <= 50;
DEFINE FIELD lastName ON users TYPE string 
  ASSERT string::len($value) > 0 AND string::len($value) <= 50;
DEFINE FIELD password ON users TYPE string 
  ASSERT string::len($value) >= 8;
DEFINE FIELD role ON users TYPE string 
  DEFAULT 'inspector' 
  ASSERT $value IN ['admin', 'manager', 'inspector', 'viewer'];
DEFINE FIELD teams ON users TYPE array<record<teams>> DEFAULT [];
DEFINE FIELD avatar ON users TYPE string;
DEFINE FIELD phone ON users TYPE string;
DEFINE FIELD isActive ON users TYPE bool DEFAULT true;
DEFINE FIELD lastLoginAt ON users TYPE datetime;
DEFINE FIELD preferences ON users TYPE object DEFAULT {
  theme: 'light',
  language: 'en',
  notifications: true,
  autoSync: true
};
DEFINE FIELD createdAt ON users TYPE datetime DEFAULT time::now();
DEFINE FIELD updatedAt ON users TYPE datetime DEFAULT time::now();

-- Indexes for users
DEFINE INDEX idx_users_email ON users FIELDS email UNIQUE;
DEFINE INDEX idx_users_role ON users FIELDS role;
DEFINE INDEX idx_users_active ON users FIELDS isActive;
DEFINE INDEX idx_users_created ON users FIELDS createdAt;
```

### 2. Teams Table
```sql
DEFINE TABLE teams SCHEMAFULL
  PERMISSIONS
    FOR select WHERE id IN $auth.teams
    FOR create, update, delete WHERE $auth.role IN ['admin', 'manager'];

DEFINE FIELD id ON teams TYPE record<teams>;
DEFINE FIELD name ON teams TYPE string 
  ASSERT string::len($value) > 0 AND string::len($value) <= 100;
DEFINE FIELD description ON teams TYPE string;
DEFINE FIELD manager ON teams TYPE record<users>;
DEFINE FIELD members ON teams TYPE array<record<users>> DEFAULT [];
DEFINE FIELD permissions ON teams TYPE array<string> DEFAULT [
  'view_inspections',
  'create_inspections',
  'edit_own_inspections'
];
DEFINE FIELD isActive ON teams TYPE bool DEFAULT true;
DEFINE FIELD createdAt ON teams TYPE datetime DEFAULT time::now();
DEFINE FIELD updatedAt ON teams TYPE datetime DEFAULT time::now();

-- Indexes for teams
DEFINE INDEX idx_teams_name ON teams FIELDS name;
DEFINE INDEX idx_teams_manager ON teams FIELDS manager;
DEFINE INDEX idx_teams_active ON teams FIELDS isActive;
```

### 3. Accounts Table
```sql
DEFINE TABLE accounts SCHEMAFULL
  PERMISSIONS
    FOR select WHERE id IN $auth.accounts OR $auth.role = 'admin'
    FOR create, update, delete WHERE $auth.role = 'admin';

DEFINE FIELD id ON accounts TYPE record<accounts>;
DEFINE FIELD name ON accounts TYPE string 
  ASSERT string::len($value) > 0 AND string::len($value) <= 200;
DEFINE FIELD type ON accounts TYPE string 
  DEFAULT 'client' 
  ASSERT $value IN ['client', 'internal', 'partner'];
DEFINE FIELD description ON accounts TYPE string;
DEFINE FIELD contactInfo ON accounts TYPE object DEFAULT {
  email: '',
  phone: '',
  address: '',
  website: ''
};
DEFINE FIELD settings ON accounts TYPE object DEFAULT {
  allowOfflineSync: true,
  requireSignatures: true,
  autoGenerateReports: false,
  retentionPeriod: 2555 -- 7 years in days
};
DEFINE FIELD isActive ON accounts TYPE bool DEFAULT true;
DEFINE FIELD createdAt ON accounts TYPE datetime DEFAULT time::now();
DEFINE FIELD updatedAt ON accounts TYPE datetime DEFAULT time::now();

-- Indexes for accounts
DEFINE INDEX idx_accounts_name ON accounts FIELDS name;
DEFINE INDEX idx_accounts_type ON accounts FIELDS type;
DEFINE INDEX idx_accounts_active ON accounts FIELDS isActive;
```

### 4. Assets Table
```sql
DEFINE TABLE assets SCHEMAFULL
  PERMISSIONS
    FOR select WHERE account IN $auth.accounts OR $auth.role = 'admin'
    FOR create, update, delete WHERE $auth.role IN ['admin', 'manager'] OR (account IN $auth.accounts AND $auth.permissions CONTAINS 'manage_assets');

DEFINE FIELD id ON assets TYPE record<assets>;
DEFINE FIELD name ON assets TYPE string 
  ASSERT string::len($value) > 0 AND string::len($value) <= 200;
DEFINE FIELD type ON assets TYPE string 
  ASSERT $value IN ['equipment', 'building', 'tool', 'person', 'vehicle', 'system'];
DEFINE FIELD category ON assets TYPE string;
DEFINE FIELD description ON assets TYPE string;
DEFINE FIELD account ON assets TYPE record<accounts>;
DEFINE FIELD location ON assets TYPE object DEFAULT {
  building: '',
  floor: '',
  room: '',
  area: '',
  address: ''
};
DEFINE FIELD coordinates ON assets TYPE object DEFAULT {
  latitude: 0.0,
  longitude: 0.0,
  accuracy: 0.0,
  timestamp: null
};
DEFINE FIELD identifiers ON assets TYPE object DEFAULT {
  qrCode: '',
  barcode: '',
  serialNumber: '',
  assetTag: '',
  modelNumber: ''
};
DEFINE FIELD specifications ON assets TYPE object DEFAULT {};
DEFINE FIELD maintenanceInfo ON assets TYPE object DEFAULT {
  lastMaintenance: null,
  nextMaintenance: null,
  maintenanceInterval: 0,
  warrantyExpiry: null
};
DEFINE FIELD status ON assets TYPE string 
  DEFAULT 'active' 
  ASSERT $value IN ['active', 'inactive', 'maintenance', 'retired', 'disposed'];
DEFINE FIELD photos ON assets TYPE array<string> DEFAULT [];
DEFINE FIELD documents ON assets TYPE array<object> DEFAULT [];
DEFINE FIELD customFields ON assets TYPE object DEFAULT {};
DEFINE FIELD createdBy ON assets TYPE record<users>;
DEFINE FIELD createdAt ON assets TYPE datetime DEFAULT time::now();
DEFINE FIELD updatedAt ON assets TYPE datetime DEFAULT time::now();

-- Indexes for assets
DEFINE INDEX idx_assets_name ON assets FIELDS name;
DEFINE INDEX idx_assets_type ON assets FIELDS type;
DEFINE INDEX idx_assets_account ON assets FIELDS account;
DEFINE INDEX idx_assets_status ON assets FIELDS status;
DEFINE INDEX idx_assets_qr ON assets FIELDS identifiers.qrCode;
DEFINE INDEX idx_assets_barcode ON assets FIELDS identifiers.barcode;
DEFINE INDEX idx_assets_location ON assets FIELDS location.building, location.floor;
DEFINE INDEX idx_assets_created ON assets FIELDS createdAt;
```

### 5. Form Templates Table
```sql
DEFINE TABLE form_templates SCHEMAFULL
  PERMISSIONS
    FOR select WHERE account IN $auth.accounts OR isPublic = true OR $auth.role = 'admin'
    FOR create, update, delete WHERE $auth.role IN ['admin', 'manager'] OR (account IN $auth.accounts AND $auth.permissions CONTAINS 'manage_forms');

DEFINE FIELD id ON form_templates TYPE record<form_templates>;
DEFINE FIELD name ON form_templates TYPE string 
  ASSERT string::len($value) > 0 AND string::len($value) <= 200;
DEFINE FIELD category ON form_templates TYPE string;
DEFINE FIELD description ON form_templates TYPE string;
DEFINE FIELD account ON form_templates TYPE record<accounts>;
DEFINE FIELD version ON form_templates TYPE string DEFAULT '1.0';
DEFINE FIELD isPublic ON form_templates TYPE bool DEFAULT false;
DEFINE FIELD isPublished ON form_templates TYPE bool DEFAULT false;
DEFINE FIELD questions ON form_templates TYPE array<object> DEFAULT [] 
  ASSERT array::len($value) > 0;
DEFINE FIELD scoring ON form_templates TYPE object DEFAULT {
  enabled: false,
  maxScore: 100,
  passingScore: 70,
  weightedScoring: false
};
DEFINE FIELD settings ON form_templates TYPE object DEFAULT {
  requirePhotos: false,
  requireSignature: false,
  allowComments: true,
  enablePriorities: true,
  autoCalculateScore: true
};
DEFINE FIELD tags ON form_templates TYPE array<string> DEFAULT [];
DEFINE FIELD createdBy ON form_templates TYPE record<users>;
DEFINE FIELD createdAt ON form_templates TYPE datetime DEFAULT time::now();
DEFINE FIELD updatedAt ON form_templates TYPE datetime DEFAULT time::now();

-- Indexes for form templates
DEFINE INDEX idx_form_templates_name ON form_templates FIELDS name;
DEFINE INDEX idx_form_templates_category ON form_templates FIELDS category;
DEFINE INDEX idx_form_templates_account ON form_templates FIELDS account;
DEFINE INDEX idx_form_templates_published ON form_templates FIELDS isPublished;
DEFINE INDEX idx_form_templates_public ON form_templates FIELDS isPublic;
DEFINE INDEX idx_form_templates_tags ON form_templates FIELDS tags;
```

### 6. Folders Table
```sql
DEFINE TABLE folders SCHEMAFULL
  PERMISSIONS
    FOR select WHERE account IN $auth.accounts OR $auth.role = 'admin'
    FOR create, update, delete WHERE $auth.role IN ['admin', 'manager'] OR (account IN $auth.accounts AND $auth.permissions CONTAINS 'manage_folders');

DEFINE FIELD id ON folders TYPE record<folders>;
DEFINE FIELD name ON folders TYPE string 
  ASSERT string::len($value) > 0 AND string::len($value) <= 200;
DEFINE FIELD type ON folders TYPE string 
  ASSERT $value IN ['inspection', 'maintenance', 'audit', 'repair', 'custom'];
DEFINE FIELD category ON folders TYPE string;
DEFINE FIELD description ON folders TYPE string;
DEFINE FIELD account ON folders TYPE record<accounts>;
DEFINE FIELD location ON folders TYPE string;
DEFINE FIELD status ON folders TYPE string 
  DEFAULT 'open' 
  ASSERT $value IN ['open', 'in_progress', 'completed', 'cancelled', 'on_hold'];
DEFINE FIELD priority ON folders TYPE string 
  DEFAULT 'medium' 
  ASSERT $value IN ['low', 'medium', 'high', 'urgent'];
DEFINE FIELD scheduledDate ON folders TYPE datetime;
DEFINE FIELD dueDate ON folders TYPE datetime;
DEFINE FIELD completedDate ON folders TYPE datetime;
DEFINE FIELD assignedTo ON folders TYPE array<record<users>> DEFAULT [];
DEFINE FIELD assignedTeams ON folders TYPE array<record<teams>> DEFAULT [];
DEFINE FIELD formTemplates ON folders TYPE array<record<form_templates>> DEFAULT [];
DEFINE FIELD assets ON folders TYPE array<record<assets>> DEFAULT [];
DEFINE FIELD settings ON folders TYPE object DEFAULT {
  allowPartialCompletion: true,
  requireAllInspections: false,
  autoCloseOnCompletion: false,
  notifyOnCompletion: true
};
DEFINE FIELD metadata ON folders TYPE object DEFAULT {};
DEFINE FIELD createdBy ON folders TYPE record<users>;
DEFINE FIELD createdAt ON folders TYPE datetime DEFAULT time::now();
DEFINE FIELD updatedAt ON folders TYPE datetime DEFAULT time::now();

-- Indexes for folders
DEFINE INDEX idx_folders_name ON folders FIELDS name;
DEFINE INDEX idx_folders_type ON folders FIELDS type;
DEFINE INDEX idx_folders_account ON folders FIELDS account;
DEFINE INDEX idx_folders_status ON folders FIELDS status;
DEFINE INDEX idx_folders_priority ON folders FIELDS priority;
DEFINE INDEX idx_folders_scheduled ON folders FIELDS scheduledDate;
DEFINE INDEX idx_folders_due ON folders FIELDS dueDate;
DEFINE INDEX idx_folders_assigned ON folders FIELDS assignedTo;
DEFINE INDEX idx_folders_created ON folders FIELDS createdAt;
```

### 7. Inspections Table
```sql
DEFINE TABLE inspections SCHEMAFULL
  PERMISSIONS
    FOR select WHERE folder.account IN $auth.accounts OR inspector = $auth.id OR $auth.role = 'admin'
    FOR create WHERE $auth.permissions CONTAINS 'create_inspections'
    FOR update WHERE inspector = $auth.id OR $auth.role IN ['admin', 'manager']
    FOR delete WHERE $auth.role IN ['admin', 'manager'];

DEFINE FIELD id ON inspections TYPE record<inspections>;
DEFINE FIELD folder ON inspections TYPE record<folders>;
DEFINE FIELD formTemplate ON inspections TYPE record<form_templates>;
DEFINE FIELD asset ON inspections TYPE record<assets>;
DEFINE FIELD inspector ON inspections TYPE record<users>;
DEFINE FIELD status ON inspections TYPE string 
  DEFAULT 'pending' 
  ASSERT $value IN ['pending', 'in_progress', 'completed', 'cancelled', 'failed'];
DEFINE FIELD priority ON inspections TYPE string 
  DEFAULT 'medium' 
  ASSERT $value IN ['na', 'good', 'low', 'medium', 'high'];
DEFINE FIELD responses ON inspections TYPE array<object> DEFAULT [];
DEFINE FIELD score ON inspections TYPE object DEFAULT {
  total: 0,
  percentage: 0,
  passed: false,
  breakdown: {}
};
DEFINE FIELD findings ON inspections TYPE array<object> DEFAULT [];
DEFINE FIELD photos ON inspections TYPE array<object> DEFAULT [];
DEFINE FIELD documents ON inspections TYPE array<object> DEFAULT [];
DEFINE FIELD signature ON inspections TYPE object DEFAULT {
  inspector: null,
  supervisor: null,
  client: null
};
DEFINE FIELD location ON inspections TYPE object DEFAULT {
  coordinates: null,
  address: '',
  accuracy: 0
};
DEFINE FIELD duration ON inspections TYPE number DEFAULT 0; -- in minutes
DEFINE FIELD notes ON inspections TYPE string;
DEFINE FIELD aiAnalysis ON inspections TYPE object DEFAULT {
  defectsDetected: [],
  riskAssessment: '',
  recommendations: [],
  confidence: 0
};
DEFINE FIELD scheduledAt ON inspections TYPE datetime;
DEFINE FIELD startedAt ON inspections TYPE datetime;
DEFINE FIELD completedAt ON inspections TYPE datetime;
DEFINE FIELD createdAt ON inspections TYPE datetime DEFAULT time::now();
DEFINE FIELD updatedAt ON inspections TYPE datetime DEFAULT time::now();

-- Indexes for inspections
DEFINE INDEX idx_inspections_folder ON inspections FIELDS folder;
DEFINE INDEX idx_inspections_asset ON inspections FIELDS asset;
DEFINE INDEX idx_inspections_inspector ON inspections FIELDS inspector;
DEFINE INDEX idx_inspections_status ON inspections FIELDS status;
DEFINE INDEX idx_inspections_priority ON inspections FIELDS priority;
DEFINE INDEX idx_inspections_scheduled ON inspections FIELDS scheduledAt;
DEFINE INDEX idx_inspections_completed ON inspections FIELDS completedAt;
DEFINE INDEX idx_inspections_created ON inspections FIELDS createdAt;
DEFINE INDEX idx_inspections_composite ON inspections FIELDS [status, priority, createdAt];
```

### 8. Reports Table
```sql
DEFINE TABLE reports SCHEMAFULL
  PERMISSIONS
    FOR select WHERE folder.account IN $auth.accounts OR createdBy = $auth.id OR $auth.role = 'admin'
    FOR create WHERE $auth.permissions CONTAINS 'generate_reports'
    FOR update, delete WHERE createdBy = $auth.id OR $auth.role IN ['admin', 'manager'];

DEFINE FIELD id ON reports TYPE record<reports>;
DEFINE FIELD name ON reports TYPE string 
  ASSERT string::len($value) > 0 AND string::len($value) <= 200;
DEFINE FIELD type ON reports TYPE string 
  ASSERT $value IN ['inspection', 'folder', 'asset', 'summary', 'custom'];
DEFINE FIELD format ON reports TYPE string 
  DEFAULT 'pdf' 
  ASSERT $value IN ['pdf', 'excel', 'csv', 'json'];
DEFINE FIELD folder ON reports TYPE record<folders>;
DEFINE FIELD inspections ON reports TYPE array<record<inspections>> DEFAULT [];
DEFINE FIELD template ON reports TYPE string DEFAULT 'standard';
DEFINE FIELD content ON reports TYPE object DEFAULT {};
DEFINE FIELD summary ON reports TYPE object DEFAULT {
  totalInspections: 0,
  completedInspections: 0,
  averageScore: 0,
  highPriorityFindings: 0,
  defectsFound: 0
};
DEFINE FIELD filePath ON reports TYPE string;
DEFINE FIELD fileSize ON reports TYPE number DEFAULT 0;
DEFINE FIELD status ON reports TYPE string 
  DEFAULT 'generating' 
  ASSERT $value IN ['generating', 'completed', 'failed', 'expired'];
DEFINE FIELD expiresAt ON reports TYPE datetime;
DEFINE FIELD downloadCount ON reports TYPE number DEFAULT 0;
DEFINE FIELD createdBy ON reports TYPE record<users>;
DEFINE FIELD createdAt ON reports TYPE datetime DEFAULT time::now();
DEFINE FIELD updatedAt ON reports TYPE datetime DEFAULT time::now();

-- Indexes for reports
DEFINE INDEX idx_reports_folder ON reports FIELDS folder;
DEFINE INDEX idx_reports_type ON reports FIELDS type;
DEFINE INDEX idx_reports_status ON reports FIELDS status;
DEFINE INDEX idx_reports_created_by ON reports FIELDS createdBy;
DEFINE INDEX idx_reports_created ON reports FIELDS createdAt;
DEFINE INDEX idx_reports_expires ON reports FIELDS expiresAt;
```

### 9. Notifications Table
```sql
DEFINE TABLE notifications SCHEMAFULL
  PERMISSIONS
    FOR select, update WHERE recipient = $auth.id OR $auth.role = 'admin'
    FOR create WHERE $auth.role IN ['admin', 'manager', 'system']
    FOR delete WHERE recipient = $auth.id OR $auth.role = 'admin';

DEFINE FIELD id ON notifications TYPE record<notifications>;
DEFINE FIELD recipient ON notifications TYPE record<users>;
DEFINE FIELD type ON notifications TYPE string 
  ASSERT $value IN ['inspection_due', 'inspection_completed', 'folder_assigned', 'report_ready', 'system_alert', 'reminder'];
DEFINE FIELD title ON notifications TYPE string 
  ASSERT string::len($value) > 0 AND string::len($value) <= 200;
DEFINE FIELD message ON notifications TYPE string;
DEFINE FIELD data ON notifications TYPE object DEFAULT {};
DEFINE FIELD priority ON notifications TYPE string 
  DEFAULT 'normal' 
  ASSERT $value IN ['low', 'normal', 'high', 'urgent'];
DEFINE FIELD isRead ON notifications TYPE bool DEFAULT false;
DEFINE FIELD readAt ON notifications TYPE datetime;
DEFINE FIELD actionUrl ON notifications TYPE string;
DEFINE FIELD expiresAt ON notifications TYPE datetime;
DEFINE FIELD createdAt ON notifications TYPE datetime DEFAULT time::now();

-- Indexes for notifications
DEFINE INDEX idx_notifications_recipient ON notifications FIELDS recipient;
DEFINE INDEX idx_notifications_type ON notifications FIELDS type;
DEFINE INDEX idx_notifications_read ON notifications FIELDS isRead;
DEFINE INDEX idx_notifications_priority ON notifications FIELDS priority;
DEFINE INDEX idx_notifications_created ON notifications FIELDS createdAt;
DEFINE INDEX idx_notifications_expires ON notifications FIELDS expiresAt;
```

### 10. Audit Log Table
```sql
DEFINE TABLE audit_logs SCHEMAFULL
  PERMISSIONS
    FOR select WHERE $auth.role = 'admin'
    FOR create WHERE true -- System can always create audit logs
    FOR update, delete WHERE false; -- Audit logs are immutable

DEFINE FIELD id ON audit_logs TYPE record<audit_logs>;
DEFINE FIELD user ON audit_logs TYPE record<users>;
DEFINE FIELD action ON audit_logs TYPE string 
  ASSERT $value IN ['create', 'read', 'update', 'delete', 'login', 'logout', 'export', 'import'];
DEFINE FIELD resource ON audit_logs TYPE string;
DEFINE FIELD resourceId ON audit_logs TYPE string;
DEFINE FIELD details ON audit_logs TYPE object DEFAULT {};
DEFINE FIELD ipAddress ON audit_logs TYPE string;
DEFINE FIELD userAgent ON audit_logs TYPE string;
DEFINE FIELD timestamp ON audit_logs TYPE datetime DEFAULT time::now();

-- Indexes for audit logs
DEFINE INDEX idx_audit_logs_user ON audit_logs FIELDS user;
DEFINE INDEX idx_audit_logs_action ON audit_logs FIELDS action;
DEFINE INDEX idx_audit_logs_resource ON audit_logs FIELDS resource;
DEFINE INDEX idx_audit_logs_timestamp ON audit_logs FIELDS timestamp;
DEFINE INDEX idx_audit_logs_composite ON audit_logs FIELDS [user, action, timestamp];
```

## Relationship Tables

### User-Team Relationships
```sql
DEFINE TABLE user_teams SCHEMAFULL;
DEFINE FIELD in ON user_teams TYPE record<users>;
DEFINE FIELD out ON user_teams TYPE record<teams>;
DEFINE FIELD role ON user_teams TYPE string 
  DEFAULT 'member' 
  ASSERT $value IN ['member', 'lead', 'admin'];
DEFINE FIELD joinedAt ON user_teams TYPE datetime DEFAULT time::now();

-- Create relationship
-- RELATE user:john->user_teams->team:inspectors SET role = 'lead';
```

### Asset-Folder Relationships
```sql
DEFINE TABLE asset_folders SCHEMAFULL;
DEFINE FIELD in ON asset_folders TYPE record<assets>;
DEFINE FIELD out ON asset_folders TYPE record<folders>;
DEFINE FIELD addedAt ON asset_folders TYPE datetime DEFAULT time::now();
DEFINE FIELD addedBy ON asset_folders TYPE record<users>;

-- Create relationship
-- RELATE asset:pump_001->asset_folders->folder:monthly_inspection;
```

### Form-Folder Relationships
```sql
DEFINE TABLE form_folders SCHEMAFULL;
DEFINE FIELD in ON form_folders TYPE record<form_templates>;
DEFINE FIELD out ON form_folders TYPE record<folders>;
DEFINE FIELD isRequired ON form_folders TYPE bool DEFAULT true;
DEFINE FIELD order ON form_folders TYPE number DEFAULT 0;
DEFINE FIELD addedAt ON form_folders TYPE datetime DEFAULT time::now();

-- Create relationship
-- RELATE form:safety_checklist->form_folders->folder:monthly_inspection SET order = 1;
```

## Advanced Features

### 1. Real-time Subscriptions
```sql
-- Live query for real-time updates
LIVE SELECT * FROM inspections WHERE status = 'in_progress';

-- Live query for folder updates
LIVE SELECT * FROM folders WHERE assignedTo CONTAINS $auth.id;

-- Live query for notifications
LIVE SELECT * FROM notifications WHERE recipient = $auth.id AND isRead = false;
```

### 2. Data Validation Functions
```sql
-- Custom validation function for inspection responses
DEFINE FUNCTION fn::validate_inspection_response($response: object) {
  RETURN (
    $response.questionId != NONE AND
    $response.value != NONE AND
    ($response.type IN ['text', 'number', 'boolean', 'select', 'multiselect', 'photo'])
  );
};

-- Custom function to calculate inspection score
DEFINE FUNCTION fn::calculate_inspection_score($responses: array, $template: object) {
  LET $total_weight = 0;
  LET $earned_score = 0;
  
  FOR $response IN $responses {
    LET $question = $template.questions[WHERE id = $response.questionId][0];
    IF $question.scoring.enabled {
      LET $weight = $question.scoring.weight OR 1;
      LET $max_points = $question.scoring.maxPoints OR 10;
      
      $total_weight = $total_weight + $weight;
      
      IF $response.value = $question.correctAnswer {
        $earned_score = $earned_score + ($weight * $max_points);
      }
    }
  };
  
  RETURN {
    total: $earned_score,
    percentage: IF $total_weight > 0 THEN ($earned_score / $total_weight) * 100 ELSE 0 END,
    passed: IF $total_weight > 0 THEN (($earned_score / $total_weight) * 100) >= 70 ELSE false END
  };
};
```

### 3. Triggers for Data Consistency
```sql
-- Trigger to update folder status when all inspections are completed
DEFINE EVENT folder_completion_check ON TABLE inspections WHEN $event = 'UPDATE' AND $after.status = 'completed' THEN {
  LET $folder = $after.folder;
  LET $total_inspections = (SELECT count() FROM inspections WHERE folder = $folder GROUP ALL)[0].count;
  LET $completed_inspections = (SELECT count() FROM inspections WHERE folder = $folder AND status = 'completed' GROUP ALL)[0].count;
  
  IF $total_inspections = $completed_inspections {
    UPDATE $folder SET status = 'completed', completedDate = time::now();
  }
};

-- Trigger to create audit log entries
DEFINE EVENT audit_inspection_changes ON TABLE inspections WHEN $event IN ['CREATE', 'UPDATE', 'DELETE'] THEN {
  CREATE audit_logs SET
    user = $auth.id,
    action = string::lowercase($event),
    resource = 'inspection',
    resourceId = $after.id OR $before.id,
    details = {
      before: $before,
      after: $after
    },
    timestamp = time::now();
};

-- Trigger to update asset last inspection date
DEFINE EVENT update_asset_last_inspection ON TABLE inspections WHEN $event = 'UPDATE' AND $after.status = 'completed' THEN {
  UPDATE $after.asset SET 
    lastInspectionDate = $after.completedAt,
    lastInspectionScore = $after.score.percentage;
};
```

### 4. Performance Optimization Queries
```sql
-- Optimized query for dashboard statistics
DEFINE FUNCTION fn::get_dashboard_stats($user_id: record<users>) {
  LET $user_folders = (SELECT id FROM folders WHERE assignedTo CONTAINS $user_id);
  
  RETURN {
    pending_inspections: (SELECT count() FROM inspections WHERE folder IN $user_folders AND status = 'pending' GROUP ALL)[0].count OR 0,
    completed_today: (SELECT count() FROM inspections WHERE folder IN $user_folders AND status = 'completed' AND completedAt >= time::floor(time::now(), 1d) GROUP ALL)[0].count OR 0,
    high_priority_findings: (SELECT count() FROM inspections WHERE folder IN $user_folders AND priority = 'high' GROUP ALL)[0].count OR 0,
    average_score: math::round((SELECT math::mean(score.percentage) FROM inspections WHERE folder IN $user_folders AND status = 'completed' GROUP ALL)[0] OR 0)
  };
};

-- Optimized query for inspection history
DEFINE FUNCTION fn::get_asset_inspection_history($asset_id: record<assets>, $limit: number) {
  RETURN SELECT 
    id,
    formTemplate.name as form_name,
    inspector.firstName + ' ' + inspector.lastName as inspector_name,
    status,
    score.percentage as score,
    priority,
    completedAt
  FROM inspections 
  WHERE asset = $asset_id 
  ORDER BY completedAt DESC 
  LIMIT $limit;
};
```

## Data Migration Scripts

### Initial Data Setup
```sql
-- Create default admin user
CREATE users:admin SET
  email = 'admin@jsg-inspections.com',
  firstName = 'System',
  lastName = 'Administrator',
  password = crypto::argon2::generate('admin123!'),
  role = 'admin',
  isActive = true;

-- Create default account
CREATE accounts:default SET
  name = 'JSG Inspections',
  type = 'internal',
  description = 'Default internal account';

-- Create sample form template
CREATE form_templates:safety_inspection SET
  name = 'Basic Safety Inspection',
  category = 'Safety',
  description = 'Standard safety inspection checklist',
  account = accounts:default,
  isPublished = true,
  questions = [
    {
      id: 'q1',
      type: 'boolean',
      text: 'Are all safety exits clearly marked?',
      required: true,
      scoring: { enabled: true, weight: 1, maxPoints: 10 }
    },
    {
      id: 'q2',
      type: 'select',
      text: 'Condition of fire extinguishers',
      options: ['Excellent', 'Good', 'Fair', 'Poor'],
      required: true,
      scoring: { enabled: true, weight: 2, maxPoints: 10 }
    },
    {
      id: 'q3',
      type: 'photo',
      text: 'Photo of main entrance',
      required: false
    }
  ],
  createdBy = users:admin;
```

### Data Cleanup Procedures
```sql
-- Clean up expired reports
DELETE reports WHERE status = 'expired' OR (expiresAt != NONE AND expiresAt < time::now());

-- Clean up old notifications (older than 30 days)
DELETE notifications WHERE createdAt < time::now() - 30d;

-- Archive completed inspections older than 2 years
UPDATE inspections SET archived = true WHERE status = 'completed' AND completedAt < time::now() - 2y;

-- Clean up orphaned photos (photos not referenced by any inspection or asset)
LET $referenced_photos = (SELECT photos FROM inspections WHERE photos != NONE) + (SELECT photos FROM assets WHERE photos != NONE);
DELETE photos WHERE id NOT IN $referenced_photos;
```

## Backup and Recovery

### Backup Strategy
```sql
-- Export all data for backup
EXPORT;

-- Export specific tables
EXPORT TABLE users, teams, accounts, assets, form_templates, folders, inspections, reports;

-- Create incremental backup (changes since last backup)
SELECT * FROM audit_logs WHERE timestamp > $last_backup_time;
```

### Recovery Procedures
```sql
-- Import from backup
IMPORT;

-- Restore specific table
IMPORT TABLE inspections FROM 'backup_file.sql';

-- Verify data integrity after restore
SELECT count() FROM users;
SELECT count() FROM inspections WHERE status = 'completed';
```

## Security Considerations

### Row-Level Security
```sql
-- Users can only see their own data or data from their accounts
DEFINE TABLE inspections PERMISSIONS
  FOR select WHERE 
    inspector = $auth.id OR 
    folder.account IN $auth.accounts OR 
    $auth.role = 'admin';

-- Managers can manage data within their accounts
DEFINE TABLE folders PERMISSIONS
  FOR create, update, delete WHERE 
    account IN $auth.accounts AND 
    $auth.role IN ['admin', 'manager'];
```

### Data Encryption
```sql
-- Encrypt sensitive fields
DEFINE FIELD ssn ON users TYPE string 
  VALUE crypto::encrypt::aes256($value, $encryption_key);

-- Hash passwords
DEFINE FIELD password ON users TYPE string 
  VALUE crypto::argon2::generate($value);
```

### Access Control
```sql
-- Define user scopes with different permissions
DEFINE SCOPE inspector SESSION 8h
  SIGNUP ( CREATE user SET email = $email, pass = crypto::argon2::generate($pass), role = 'inspector' )
  SIGNIN ( SELECT * FROM user WHERE email = $email AND crypto::argon2::compare(pass, $pass) AND role = 'inspector' );

DEFINE SCOPE manager SESSION 12h
  SIGNUP ( CREATE user SET email = $email, pass = crypto::argon2::generate($pass), role = 'manager' )
  SIGNIN ( SELECT * FROM user WHERE email = $email AND crypto::argon2::compare(pass, $pass) AND role IN ['manager', 'admin'] );
```

## Performance Monitoring

### Query Performance
```sql
-- Monitor slow queries
SELECT * FROM $queries WHERE duration > 1000; -- queries taking more than 1 second

-- Index usage statistics
SELECT * FROM $indexes WHERE usage_count < 10; -- rarely used indexes

-- Table size monitoring
SELECT table, count(*) as record_count FROM $tables GROUP BY table;
```

### Database Maintenance
```sql
-- Analyze table statistics
ANALYZE TABLE inspections;

-- Rebuild indexes
REBUILD INDEX idx_inspections_composite ON inspections;

-- Vacuum database
VACUUM;
```

## Conclusion

This comprehensive database schema provides a robust foundation for the JSG-Inspections application. Key features include:

1. **Scalability**: Designed to handle large volumes of inspection data
2. **Performance**: Optimized indexes and queries for fast data access
3. **Security**: Row-level security and data encryption
4. **Flexibility**: Extensible schema supporting custom fields and configurations
5. **Real-time**: Live queries for real-time updates
6. **Audit Trail**: Complete audit logging for compliance
7. **Data Integrity**: Comprehensive validation and constraints

The schema supports all core inspection management features while providing the flexibility to extend and customize as needed. Regular maintenance procedures ensure optimal performance and data integrity over time.