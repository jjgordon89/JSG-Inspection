# JSG-Inspections Implementation Roadmap

## Executive Summary

This document provides a comprehensive step-by-step implementation guide for building the JSG-Inspections application. The roadmap is structured in phases, each with specific deliverables, timelines, and success criteria.

## Phase 1: Project Setup and Foundation (Weeks 1-2)

### 1.1 Development Environment Setup

#### Prerequisites Installation
```bash
# Install Flutter SDK
winget install Google.Flutter

# Install Rust toolchain
winget install Rustlang.Rustup

# Install Node.js for backend development
winget install OpenJS.NodeJS

# Install Git
winget install Git.Git

# Install Visual Studio Code
winget install Microsoft.VisualStudioCode
```

#### Flutter Environment Configuration
```bash
# Verify Flutter installation
flutter doctor

# Enable Windows desktop support
flutter config --enable-windows-desktop

# Create new Flutter project
flutter create jsg_inspections
cd jsg_inspections

# Add required dependencies
flutter pub add riverpod flutter_riverpod go_router surrealdb dio
flutter pub add camera image_picker geolocator permission_handler
flutter pub add shared_preferences hive flutter_secure_storage
flutter pub add pdf flutter_signature_pad qr_code_scanner
```

#### Project Structure Setup
```
jsg_inspections/
├── lib/
│   ├── core/
│   │   ├── constants/
│   │   ├── errors/
│   │   ├── network/
│   │   └── utils/
│   ├── data/
│   │   ├── datasources/
│   │   ├── models/
│   │   └── repositories/
│   ├── domain/
│   │   ├── entities/
│   │   ├── repositories/
│   │   └── usecases/
│   ├── presentation/
│   │   ├── pages/
│   │   ├── widgets/
│   │   └── providers/
│   └── main.dart
├── backend/
│   ├── src/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── services/
│   │   └── utils/
│   ├── package.json
│   └── server.js
└── docs/
```

### 1.2 Backend API Setup

#### Node.js Backend Initialization
```bash
# Create backend directory
mkdir backend
cd backend

# Initialize Node.js project
npm init -y

# Install dependencies
npm install express cors helmet morgan dotenv
npm install jsonwebtoken bcryptjs multer
npm install surrealdb.js ws socket.io
npm install joi express-rate-limit

# Install development dependencies
npm install --save-dev nodemon jest supertest
```

#### Basic Server Setup
```javascript
// backend/server.js
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(helmet());
app.use(cors());
app.use(morgan('combined'));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Routes
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
```

### 1.3 SurrealDB Setup

#### Database Installation and Configuration
```bash
# Download SurrealDB
winget install SurrealDB.SurrealDB

# Start SurrealDB server
surreal start --log trace --user root --pass root memory

# Create database schema file
touch backend/database/schema.surql
```

#### Initial Schema Implementation
```sql
-- backend/database/schema.surql
USE NS jsg_inspections DB main;

-- Create core tables
DEFINE TABLE users SCHEMAFULL;
DEFINE FIELD email ON TABLE users TYPE string ASSERT string::is::email($value);
DEFINE FIELD password ON TABLE users TYPE string;
DEFINE FIELD firstName ON TABLE users TYPE string;
DEFINE FIELD lastName ON TABLE users TYPE string;
DEFINE FIELD role ON TABLE users TYPE string DEFAULT 'inspector';
DEFINE FIELD isActive ON TABLE users TYPE bool DEFAULT true;
DEFINE FIELD createdAt ON TABLE users TYPE datetime DEFAULT time::now();
DEFINE FIELD updatedAt ON TABLE users TYPE datetime DEFAULT time::now();

-- Create unique index for email
DEFINE INDEX idx_users_email ON TABLE users COLUMNS email UNIQUE;
```

## Phase 2: Core Authentication and User Management (Weeks 3-4)

### 2.1 Authentication Backend Implementation

#### JWT Authentication Service
```javascript
// backend/src/services/authService.js
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { Surreal } = require('surrealdb.js');

class AuthService {
  constructor() {
    this.db = new Surreal();
    this.initDatabase();
  }

  async initDatabase() {
    await this.db.connect('ws://localhost:8000/rpc');
    await this.db.use({ ns: 'jsg_inspections', db: 'main' });
  }

  async register(userData) {
    const { email, password, firstName, lastName } = userData;
    
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);
    
    // Create user
    const user = await this.db.create('users', {
      email,
      password: hashedPassword,
      firstName,
      lastName,
      role: 'inspector',
      isActive: true
    });
    
    return this.generateTokens(user[0]);
  }

  async login(email, password) {
    const users = await this.db.select('users').where({ email });
    
    if (!users.length) {
      throw new Error('Invalid credentials');
    }
    
    const user = users[0];
    const isValidPassword = await bcrypt.compare(password, user.password);
    
    if (!isValidPassword) {
      throw new Error('Invalid credentials');
    }
    
    return this.generateTokens(user);
  }

  generateTokens(user) {
    const payload = {
      id: user.id,
      email: user.email,
      role: user.role
    };
    
    const accessToken = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: '15m'
    });
    
    const refreshToken = jwt.sign(payload, process.env.JWT_REFRESH_SECRET, {
      expiresIn: '7d'
    });
    
    return { accessToken, refreshToken, user: payload };
  }
}

module.exports = AuthService;
```

### 2.2 Flutter Authentication Implementation

#### Authentication Provider
```dart
// lib/presentation/providers/auth_provider.dart
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import '../../data/models/user_model.dart';
import '../../data/repositories/auth_repository.dart';

class AuthState {
  final UserModel? user;
  final bool isLoading;
  final String? error;
  final bool isAuthenticated;

  const AuthState({
    this.user,
    this.isLoading = false,
    this.error,
    this.isAuthenticated = false,
  });

  AuthState copyWith({
    UserModel? user,
    bool? isLoading,
    String? error,
    bool? isAuthenticated,
  }) {
    return AuthState(
      user: user ?? this.user,
      isLoading: isLoading ?? this.isLoading,
      error: error,
      isAuthenticated: isAuthenticated ?? this.isAuthenticated,
    );
  }
}

class AuthNotifier extends StateNotifier<AuthState> {
  final AuthRepository _authRepository;
  final FlutterSecureStorage _storage;

  AuthNotifier(this._authRepository, this._storage) : super(const AuthState()) {
    _checkAuthStatus();
  }

  Future<void> _checkAuthStatus() async {
    final token = await _storage.read(key: 'access_token');
    if (token != null) {
      // Validate token and get user info
      try {
        final user = await _authRepository.getCurrentUser();
        state = state.copyWith(user: user, isAuthenticated: true);
      } catch (e) {
        await _storage.delete(key: 'access_token');
        await _storage.delete(key: 'refresh_token');
      }
    }
  }

  Future<void> login(String email, String password) async {
    state = state.copyWith(isLoading: true, error: null);
    
    try {
      final authResponse = await _authRepository.login(email, password);
      
      await _storage.write(key: 'access_token', value: authResponse.accessToken);
      await _storage.write(key: 'refresh_token', value: authResponse.refreshToken);
      
      state = state.copyWith(
        user: authResponse.user,
        isAuthenticated: true,
        isLoading: false,
      );
    } catch (e) {
      state = state.copyWith(
        error: e.toString(),
        isLoading: false,
      );
    }
  }

  Future<void> logout() async {
    await _storage.delete(key: 'access_token');
    await _storage.delete(key: 'refresh_token');
    
    state = const AuthState();
  }
}

final authProvider = StateNotifierProvider<AuthNotifier, AuthState>((ref) {
  return AuthNotifier(
    ref.read(authRepositoryProvider),
    const FlutterSecureStorage(),
  );
});
```

## Phase 3: Core Inspection Features (Weeks 5-8)

### 3.1 Form Template System

#### Backend Form Template Service
```javascript
// backend/src/services/formTemplateService.js
class FormTemplateService {
  constructor(db) {
    this.db = db;
  }

  async createTemplate(templateData) {
    const template = await this.db.create('form_templates', {
      ...templateData,
      version: '1.0.0',
      isActive: true,
      createdAt: new Date().toISOString()
    });
    
    return template[0];
  }

  async getTemplates(filters = {}) {
    let query = 'SELECT * FROM form_templates WHERE isActive = true';
    
    if (filters.category) {
      query += ` AND category = '${filters.category}'`;
    }
    
    if (filters.type) {
      query += ` AND type = '${filters.type}'`;
    }
    
    return await this.db.query(query);
  }

  async updateTemplate(id, updateData) {
    return await this.db.merge(id, {
      ...updateData,
      updatedAt: new Date().toISOString()
    });
  }
}
```

#### Flutter Form Builder
```dart
// lib/presentation/widgets/dynamic_form_builder.dart
import 'package:flutter/material.dart';
import '../../data/models/form_template_model.dart';
import '../../data/models/form_field_model.dart';

class DynamicFormBuilder extends StatefulWidget {
  final FormTemplateModel template;
  final Map<String, dynamic>? initialValues;
  final Function(Map<String, dynamic>) onSubmit;

  const DynamicFormBuilder({
    Key? key,
    required this.template,
    this.initialValues,
    required this.onSubmit,
  }) : super(key: key);

  @override
  State<DynamicFormBuilder> createState() => _DynamicFormBuilderState();
}

class _DynamicFormBuilderState extends State<DynamicFormBuilder> {
  final _formKey = GlobalKey<FormState>();
  final Map<String, dynamic> _formData = {};

  @override
  void initState() {
    super.initState();
    if (widget.initialValues != null) {
      _formData.addAll(widget.initialValues!);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Form(
      key: _formKey,
      child: Column(
        children: [
          ...widget.template.fields.map((field) => _buildField(field)),
          const SizedBox(height: 20),
          ElevatedButton(
            onPressed: _submitForm,
            child: const Text('Submit'),
          ),
        ],
      ),
    );
  }

  Widget _buildField(FormFieldModel field) {
    switch (field.type) {
      case 'text':
        return _buildTextField(field);
      case 'number':
        return _buildNumberField(field);
      case 'dropdown':
        return _buildDropdownField(field);
      case 'checkbox':
        return _buildCheckboxField(field);
      case 'photo':
        return _buildPhotoField(field);
      case 'signature':
        return _buildSignatureField(field);
      default:
        return const SizedBox.shrink();
    }
  }

  Widget _buildTextField(FormFieldModel field) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 8.0),
      child: TextFormField(
        decoration: InputDecoration(
          labelText: field.label,
          hintText: field.placeholder,
          border: const OutlineInputBorder(),
        ),
        validator: (value) {
          if (field.required && (value == null || value.isEmpty)) {
            return '${field.label} is required';
          }
          return null;
        },
        onSaved: (value) => _formData[field.id] = value,
      ),
    );
  }

  void _submitForm() {
    if (_formKey.currentState!.validate()) {
      _formKey.currentState!.save();
      widget.onSubmit(_formData);
    }
  }
}
```

### 3.2 Inspection Workflow Implementation

#### Inspection State Management
```dart
// lib/presentation/providers/inspection_provider.dart
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../data/models/inspection_model.dart';
import '../../data/repositories/inspection_repository.dart';

class InspectionState {
  final List<InspectionModel> inspections;
  final InspectionModel? currentInspection;
  final bool isLoading;
  final String? error;

  const InspectionState({
    this.inspections = const [],
    this.currentInspection,
    this.isLoading = false,
    this.error,
  });

  InspectionState copyWith({
    List<InspectionModel>? inspections,
    InspectionModel? currentInspection,
    bool? isLoading,
    String? error,
  }) {
    return InspectionState(
      inspections: inspections ?? this.inspections,
      currentInspection: currentInspection ?? this.currentInspection,
      isLoading: isLoading ?? this.isLoading,
      error: error,
    );
  }
}

class InspectionNotifier extends StateNotifier<InspectionState> {
  final InspectionRepository _repository;

  InspectionNotifier(this._repository) : super(const InspectionState());

  Future<void> loadInspections() async {
    state = state.copyWith(isLoading: true);
    
    try {
      final inspections = await _repository.getInspections();
      state = state.copyWith(
        inspections: inspections,
        isLoading: false,
      );
    } catch (e) {
      state = state.copyWith(
        error: e.toString(),
        isLoading: false,
      );
    }
  }

  Future<void> startInspection(String templateId, String assetId) async {
    try {
      final inspection = await _repository.createInspection(
        templateId: templateId,
        assetId: assetId,
      );
      
      state = state.copyWith(currentInspection: inspection);
    } catch (e) {
      state = state.copyWith(error: e.toString());
    }
  }

  Future<void> updateInspectionData(Map<String, dynamic> data) async {
    if (state.currentInspection == null) return;
    
    try {
      final updatedInspection = await _repository.updateInspection(
        state.currentInspection!.id,
        data,
      );
      
      state = state.copyWith(currentInspection: updatedInspection);
    } catch (e) {
      state = state.copyWith(error: e.toString());
    }
  }

  Future<void> completeInspection() async {
    if (state.currentInspection == null) return;
    
    try {
      await _repository.completeInspection(state.currentInspection!.id);
      
      state = state.copyWith(currentInspection: null);
      await loadInspections(); // Refresh list
    } catch (e) {
      state = state.copyWith(error: e.toString());
    }
  }
}

final inspectionProvider = StateNotifierProvider<InspectionNotifier, InspectionState>((ref) {
  return InspectionNotifier(ref.read(inspectionRepositoryProvider));
});
```

## Phase 4: AI Integration Implementation (Weeks 9-12)

### 4.1 Computer Vision for Defect Detection

#### AI Service Backend
```javascript
// backend/src/services/aiService.js
const tf = require('@tensorflow/tfjs-node');
const sharp = require('sharp');
const path = require('path');

class AIService {
  constructor() {
    this.defectModel = null;
    this.loadModels();
  }

  async loadModels() {
    try {
      // Load pre-trained defect detection model
      this.defectModel = await tf.loadLayersModel(
        'file://' + path.join(__dirname, '../models/defect_detection/model.json')
      );
      console.log('AI models loaded successfully');
    } catch (error) {
      console.error('Error loading AI models:', error);
    }
  }

  async analyzeImage(imagePath, analysisType = 'defect_detection') {
    try {
      switch (analysisType) {
        case 'defect_detection':
          return await this.detectDefects(imagePath);
        case 'crack_analysis':
          return await this.analyzeCracks(imagePath);
        case 'corrosion_detection':
          return await this.detectCorrosion(imagePath);
        default:
          throw new Error('Unknown analysis type');
      }
    } catch (error) {
      console.error('Image analysis error:', error);
      throw error;
    }
  }

  async detectDefects(imagePath) {
    if (!this.defectModel) {
      throw new Error('Defect detection model not loaded');
    }

    // Preprocess image
    const imageBuffer = await sharp(imagePath)
      .resize(224, 224)
      .removeAlpha()
      .raw()
      .toBuffer();

    // Convert to tensor
    const tensor = tf.tensor3d(
      new Uint8Array(imageBuffer),
      [224, 224, 3]
    ).expandDims(0).div(255.0);

    // Run prediction
    const prediction = await this.defectModel.predict(tensor);
    const scores = await prediction.data();

    // Process results
    const defectTypes = ['crack', 'corrosion', 'wear', 'deformation'];
    const results = defectTypes.map((type, index) => ({
      type,
      confidence: scores[index],
      detected: scores[index] > 0.7
    }));

    // Cleanup tensors
    tensor.dispose();
    prediction.dispose();

    return {
      defects: results.filter(r => r.detected),
      confidence: Math.max(...scores),
      analysisTimestamp: new Date().toISOString()
    };
  }

  async generateInspectionReport(inspectionData) {
    const prompt = `
      Generate a professional inspection report based on the following data:
      
      Inspection Type: ${inspectionData.type}
      Asset: ${inspectionData.assetName}
      Inspector: ${inspectionData.inspectorName}
      Date: ${inspectionData.date}
      
      Findings:
      ${JSON.stringify(inspectionData.findings, null, 2)}
      
      AI Analysis Results:
      ${JSON.stringify(inspectionData.aiAnalysis, null, 2)}
      
      Please provide a comprehensive report with:
      1. Executive Summary
      2. Detailed Findings
      3. Risk Assessment
      4. Recommendations
      5. Next Steps
    `;

    try {
      // Call OpenAI API for report generation
      const response = await this.callOpenAI(prompt);
      return response;
    } catch (error) {
      console.error('Report generation error:', error);
      throw error;
    }
  }

  async callOpenAI(prompt) {
    // Implementation for OpenAI API call
    // This would use the OpenAI SDK
    return 'Generated report content...';
  }
}

module.exports = AIService;
```

### 4.2 Flutter AI Integration

#### AI Analysis Widget
```dart
// lib/presentation/widgets/ai_analysis_widget.dart
import 'package:flutter/material.dart';
import 'package:camera/camera.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../data/models/ai_analysis_model.dart';
import '../providers/ai_provider.dart';

class AIAnalysisWidget extends ConsumerStatefulWidget {
  final String imagePath;
  final String analysisType;

  const AIAnalysisWidget({
    Key? key,
    required this.imagePath,
    required this.analysisType,
  }) : super(key: key);

  @override
  ConsumerState<AIAnalysisWidget> createState() => _AIAnalysisWidgetState();
}

class _AIAnalysisWidgetState extends ConsumerState<AIAnalysisWidget> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      ref.read(aiProvider.notifier).analyzeImage(
        widget.imagePath,
        widget.analysisType,
      );
    });
  }

  @override
  Widget build(BuildContext context) {
    final aiState = ref.watch(aiProvider);

    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                const Icon(Icons.psychology, color: Colors.blue),
                const SizedBox(width: 8),
                Text(
                  'AI Analysis',
                  style: Theme.of(context).textTheme.titleLarge,
                ),
              ],
            ),
            const SizedBox(height: 16),
            if (aiState.isAnalyzing)
              const Center(
                child: Column(
                  children: [
                    CircularProgressIndicator(),
                    SizedBox(height: 8),
                    Text('Analyzing image...'),
                  ],
                ),
              )
            else if (aiState.error != null)
              Container(
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: Colors.red.shade50,
                  borderRadius: BorderRadius.circular(8),
                  border: Border.all(color: Colors.red.shade200),
                ),
                child: Row(
                  children: [
                    Icon(Icons.error, color: Colors.red.shade600),
                    const SizedBox(width: 8),
                    Expanded(
                      child: Text(
                        'Analysis failed: ${aiState.error}',
                        style: TextStyle(color: Colors.red.shade600),
                      ),
                    ),
                  ],
                ),
              )
            else if (aiState.currentAnalysis != null)
              _buildAnalysisResults(aiState.currentAnalysis!),
          ],
        ),
      ),
    );
  }

  Widget _buildAnalysisResults(AIAnalysisModel analysis) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        if (analysis.defects.isNotEmpty) ..[
          Text(
            'Detected Issues:',
            style: Theme.of(context).textTheme.titleMedium,
          ),
          const SizedBox(height: 8),
          ...analysis.defects.map((defect) => _buildDefectItem(defect)),
        ] else
          Container(
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: Colors.green.shade50,
              borderRadius: BorderRadius.circular(8),
              border: Border.all(color: Colors.green.shade200),
            ),
            child: Row(
              children: [
                Icon(Icons.check_circle, color: Colors.green.shade600),
                const SizedBox(width: 8),
                const Text('No defects detected'),
              ],
            ),
          ),
        const SizedBox(height: 16),
        Row(
          children: [
            Text(
              'Confidence: ',
              style: Theme.of(context).textTheme.bodyMedium,
            ),
            Text(
              '${(analysis.confidence * 100).toStringAsFixed(1)}%',
              style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                fontWeight: FontWeight.bold,
                color: _getConfidenceColor(analysis.confidence),
              ),
            ),
          ],
        ),
      ],
    );
  }

  Widget _buildDefectItem(DefectModel defect) {
    return Container(
      margin: const EdgeInsets.only(bottom: 8),
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: _getDefectColor(defect.severity).withOpacity(0.1),
        borderRadius: BorderRadius.circular(8),
        border: Border.all(
          color: _getDefectColor(defect.severity).withOpacity(0.3),
        ),
      ),
      child: Row(
        children: [
          Icon(
            _getDefectIcon(defect.type),
            color: _getDefectColor(defect.severity),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  defect.type.toUpperCase(),
                  style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                    fontWeight: FontWeight.bold,
                  ),
                ),
                Text(
                  'Confidence: ${(defect.confidence * 100).toStringAsFixed(1)}%',
                  style: Theme.of(context).textTheme.bodySmall,
                ),
              ],
            ),
          ),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
            decoration: BoxDecoration(
              color: _getDefectColor(defect.severity),
              borderRadius: BorderRadius.circular(12),
            ),
            child: Text(
              defect.severity.toUpperCase(),
              style: const TextStyle(
                color: Colors.white,
                fontSize: 12,
                fontWeight: FontWeight.bold,
              ),
            ),
          ),
        ],
      ),
    );
  }

  Color _getConfidenceColor(double confidence) {
    if (confidence >= 0.8) return Colors.green;
    if (confidence >= 0.6) return Colors.orange;
    return Colors.red;
  }

  Color _getDefectColor(String severity) {
    switch (severity.toLowerCase()) {
      case 'high':
        return Colors.red;
      case 'medium':
        return Colors.orange;
      case 'low':
        return Colors.yellow.shade700;
      default:
        return Colors.grey;
    }
  }

  IconData _getDefectIcon(String type) {
    switch (type.toLowerCase()) {
      case 'crack':
        return Icons.broken_image;
      case 'corrosion':
        return Icons.water_damage;
      case 'wear':
        return Icons.texture;
      case 'deformation':
        return Icons.transform;
      default:
        return Icons.warning;
    }
  }
}
```

## Phase 5: Testing and Quality Assurance (Weeks 13-14)

### 5.1 Unit Testing Setup

#### Flutter Unit Tests
```dart
// test/unit/auth_provider_test.dart
import 'package:flutter_test/flutter_test.dart';
import 'package:mockito/mockito.dart';
import 'package:mockito/annotations.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:jsg_inspections/presentation/providers/auth_provider.dart';
import 'package:jsg_inspections/data/repositories/auth_repository.dart';

@GenerateMocks([AuthRepository, FlutterSecureStorage])
import 'auth_provider_test.mocks.dart';

void main() {
  group('AuthNotifier', () {
    late AuthNotifier authNotifier;
    late MockAuthRepository mockAuthRepository;
    late MockFlutterSecureStorage mockStorage;

    setUp(() {
      mockAuthRepository = MockAuthRepository();
      mockStorage = MockFlutterSecureStorage();
      authNotifier = AuthNotifier(mockAuthRepository, mockStorage);
    });

    test('should login successfully with valid credentials', () async {
      // Arrange
      const email = 'test@example.com';
      const password = 'password123';
      final authResponse = AuthResponse(
        accessToken: 'access_token',
        refreshToken: 'refresh_token',
        user: UserModel(id: '1', email: email, firstName: 'Test'),
      );

      when(mockAuthRepository.login(email, password))
          .thenAnswer((_) async => authResponse);
      when(mockStorage.write(key: anyNamed('key'), value: anyNamed('value')))
          .thenAnswer((_) async {});

      // Act
      await authNotifier.login(email, password);

      // Assert
      expect(authNotifier.state.isAuthenticated, true);
      expect(authNotifier.state.user?.email, email);
      expect(authNotifier.state.isLoading, false);
      expect(authNotifier.state.error, null);

      verify(mockStorage.write(key: 'access_token', value: 'access_token'));
      verify(mockStorage.write(key: 'refresh_token', value: 'refresh_token'));
    });

    test('should handle login failure', () async {
      // Arrange
      const email = 'test@example.com';
      const password = 'wrong_password';
      const errorMessage = 'Invalid credentials';

      when(mockAuthRepository.login(email, password))
          .thenThrow(Exception(errorMessage));

      // Act
      await authNotifier.login(email, password);

      // Assert
      expect(authNotifier.state.isAuthenticated, false);
      expect(authNotifier.state.user, null);
      expect(authNotifier.state.isLoading, false);
      expect(authNotifier.state.error, contains(errorMessage));
    });
  });
}
```

#### Backend Unit Tests
```javascript
// backend/tests/unit/authService.test.js
const AuthService = require('../../src/services/authService');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Mock SurrealDB
jest.mock('surrealdb.js', () => {
  return {
    Surreal: jest.fn().mockImplementation(() => ({
      connect: jest.fn(),
      use: jest.fn(),
      create: jest.fn(),
      select: jest.fn(),
    })),
  };
});

describe('AuthService', () => {
  let authService;
  let mockDb;

  beforeEach(() => {
    authService = new AuthService();
    mockDb = authService.db;
  });

  describe('register', () => {
    it('should register a new user successfully', async () => {
      // Arrange
      const userData = {
        email: 'test@example.com',
        password: 'password123',
        firstName: 'Test',
        lastName: 'User',
      };

      const mockUser = {
        id: 'user:123',
        email: userData.email,
        firstName: userData.firstName,
        lastName: userData.lastName,
        role: 'inspector',
      };

      mockDb.create.mockResolvedValue([mockUser]);

      // Act
      const result = await authService.register(userData);

      // Assert
      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('refreshToken');
      expect(result).toHaveProperty('user');
      expect(result.user.email).toBe(userData.email);
      expect(mockDb.create).toHaveBeenCalledWith('users', expect.objectContaining({
        email: userData.email,
        firstName: userData.firstName,
        lastName: userData.lastName,
        role: 'inspector',
        isActive: true,
      }));
    });
  });

  describe('login', () => {
    it('should login user with valid credentials', async () => {
      // Arrange
      const email = 'test@example.com';
      const password = 'password123';
      const hashedPassword = await bcrypt.hash(password, 12);
      
      const mockUser = {
        id: 'user:123',
        email,
        password: hashedPassword,
        role: 'inspector',
      };

      mockDb.select.mockReturnValue({
        where: jest.fn().mockResolvedValue([mockUser]),
      });

      // Act
      const result = await authService.login(email, password);

      // Assert
      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('refreshToken');
      expect(result.user.email).toBe(email);
    });

    it('should throw error for invalid credentials', async () => {
      // Arrange
      const email = 'test@example.com';
      const password = 'wrong_password';
      
      mockDb.select.mockReturnValue({
        where: jest.fn().mockResolvedValue([]),
      });

      // Act & Assert
      await expect(authService.login(email, password))
        .rejects.toThrow('Invalid credentials');
    });
  });
});
```

### 5.2 Integration Testing

#### Flutter Integration Tests
```dart
// integration_test/app_test.dart
import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:integration_test/integration_test.dart';
import 'package:jsg_inspections/main.dart' as app;

void main() {
  IntegrationTestWidgetsFlutterBinding.ensureInitialized();

  group('JSG Inspections App Integration Tests', () {
    testWidgets('complete inspection workflow', (WidgetTester tester) async {
      // Start the app
      app.main();
      await tester.pumpAndSettle();

      // Test login flow
      await tester.enterText(find.byKey(const Key('email_field')), 'test@example.com');
      await tester.enterText(find.byKey(const Key('password_field')), 'password123');
      await tester.tap(find.byKey(const Key('login_button')));
      await tester.pumpAndSettle();

      // Verify navigation to dashboard
      expect(find.text('Dashboard'), findsOneWidget);

      // Test creating new inspection
      await tester.tap(find.byKey(const Key('new_inspection_button')));
      await tester.pumpAndSettle();

      // Select inspection template
      await tester.tap(find.text('Building Inspection'));
      await tester.pumpAndSettle();

      // Fill out inspection form
      await tester.enterText(find.byKey(const Key('inspector_notes')), 'Test inspection notes');
      
      // Take photo (mock)
      await tester.tap(find.byKey(const Key('take_photo_button')));
      await tester.pumpAndSettle();

      // Submit inspection
      await tester.tap(find.byKey(const Key('submit_inspection_button')));
      await tester.pumpAndSettle();

      // Verify inspection was created
      expect(find.text('Inspection submitted successfully'), findsOneWidget);
    });

    testWidgets('offline functionality test', (WidgetTester tester) async {
      // Start app in offline mode
      app.main();
      await tester.pumpAndSettle();

      // Simulate offline state
      // This would require mocking network connectivity
      
      // Test that app still functions offline
      // Verify data is stored locally
      // Test sync when back online
    });
  });
}
```

## Phase 6: Deployment and Production Setup (Weeks 15-16)

### 6.1 Production Build Configuration

#### Flutter Production Build
```bash
# Android APK build
flutter build apk --release --split-per-abi

# Windows desktop build
flutter build windows --release

# Create installer for Windows
# Using Inno Setup or similar tool
```

#### Backend Production Setup
```javascript
// backend/ecosystem.config.js (PM2 configuration)
module.exports = {
  apps: [{
    name: 'jsg-inspections-api',
    script: './server.js',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'development',
      PORT: 3000
    },
    env_production: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_file: './logs/combined.log',
    time: true
  }]
};
```

### 6.2 Deployment Scripts

#### Docker Configuration
```dockerfile
# backend/Dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

EXPOSE 3000

USER node

CMD ["npm", "start"]
```

#### Docker Compose
```yaml
# docker-compose.yml
version: '3.8'

services:
  api:
    build: ./backend
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - DB_HOST=surrealdb
    depends_on:
      - surrealdb
    restart: unless-stopped

  surrealdb:
    image: surrealdb/surrealdb:latest
    command: start --log trace --user root --pass root file:///data/database.db
    ports:
      - "8000:8000"
    volumes:
      - surrealdb_data:/data
    restart: unless-stopped

volumes:
  surrealdb_data:
```

## Success Metrics and KPIs

### Technical Metrics
- **App Performance**: < 3 second startup time
- **API Response Time**: < 500ms for 95% of requests
- **Offline Capability**: 100% functionality without internet
- **Cross-Platform Compatibility**: Identical features on Windows and Android
- **AI Accuracy**: > 85% defect detection accuracy

### Business Metrics
- **Inspection Time Reduction**: 40% faster than manual processes
- **Report Generation**: Automated reports in < 2 minutes
- **User Adoption**: 90% inspector adoption within 3 months
- **Data Accuracy**: 95% reduction in manual data entry errors

## Risk Mitigation Strategies

### Technical Risks
1. **SurrealDB Stability**: Implement fallback to SQLite for critical operations
2. **AI Model Performance**: Provide manual override options for all AI features
3. **Cross-Platform Issues**: Extensive testing on target devices
4. **Offline Sync Conflicts**: Implement robust conflict resolution algorithms

### Business Risks
1. **User Resistance**: Comprehensive training program and gradual rollout
2. **Data Migration**: Thorough testing with production data copies
3. **Regulatory Compliance**: Regular compliance audits and updates

## Conclusion

This implementation roadmap provides a comprehensive guide for building the JSG-Inspections application. The phased approach ensures systematic development while maintaining quality and meeting business objectives. Regular reviews and adjustments should be made based on testing results and user feedback throughout the development process.