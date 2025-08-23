# JSG-Inspections Flutter Frontend Architecture

## Overview

This document outlines the comprehensive frontend architecture for the JSG-Inspections application using Flutter. The architecture is designed for cross-platform compatibility (Windows Desktop and Android) with a focus on offline-first functionality, responsive design, and seamless user experience.

## Technology Stack

### Core Framework
- **Flutter 3.16+**: Cross-platform UI framework
- **Dart 3.2+**: Programming language
- **Material Design 3**: Design system

### State Management
- **Riverpod 2.4+**: Primary state management solution
- **Flutter Hooks**: For local component state
- **Freezed**: Immutable data classes

### Navigation
- **Go Router 12+**: Declarative routing
- **Auto Route**: Code generation for routes

### Database & Storage
- **SurrealDB Dart SDK**: Database connectivity
- **Hive**: Local storage and caching
- **Shared Preferences**: Simple key-value storage
- **Path Provider**: File system access

### UI Components
- **Flutter Material 3**: Base components
- **Custom Design System**: JSG-specific components
- **Animations**: Lottie, Rive for complex animations

### Media & Files
- **Image Picker**: Camera and gallery access
- **File Picker**: Document selection
- **PDF**: PDF generation and viewing
- **Signature**: Digital signature capture

### Networking & Sync
- **Dio**: HTTP client
- **Connectivity Plus**: Network status
- **Background Sync**: Offline data synchronization

### Platform Integration
- **Device Info Plus**: Device information
- **Permission Handler**: Runtime permissions
- **GPS Location**: Location services
- **QR Code Scanner**: Barcode/QR scanning

## Project Structure

```
lib/
├── main.dart                           # Application entry point
├── app/
│   ├── app.dart                        # Main app widget
│   ├── router/
│   │   ├── app_router.dart             # Route configuration
│   │   ├── route_guards.dart           # Authentication guards
│   │   └── route_transitions.dart      # Custom transitions
│   ├── theme/
│   │   ├── app_theme.dart              # Theme configuration
│   │   ├── color_scheme.dart           # Color definitions
│   │   ├── typography.dart             # Text styles
│   │   └── component_themes.dart       # Component-specific themes
│   └── constants/
│       ├── app_constants.dart          # Global constants
│       ├── asset_paths.dart            # Asset path constants
│       └── api_endpoints.dart          # API endpoint constants
├── core/
│   ├── database/
│   │   ├── database_service.dart       # SurrealDB service
│   │   ├── local_database.dart         # Hive local storage
│   │   ├── sync_service.dart           # Data synchronization
│   │   └── models/                     # Database models
│   ├── network/
│   │   ├── api_client.dart             # HTTP client setup
│   │   ├── network_service.dart        # Network utilities
│   │   ├── interceptors/               # Request/response interceptors
│   │   └── error_handling.dart         # Network error handling
│   ├── storage/
│   │   ├── secure_storage.dart         # Encrypted storage
│   │   ├── cache_service.dart          # Caching layer
│   │   └── file_service.dart           # File operations
│   ├── services/
│   │   ├── auth_service.dart           # Authentication
│   │   ├── location_service.dart       # GPS services
│   │   ├── camera_service.dart         # Camera operations
│   │   ├── notification_service.dart   # Push notifications
│   │   └── sync_service.dart           # Background sync
│   ├── utils/
│   │   ├── validators.dart             # Input validation
│   │   ├── formatters.dart             # Data formatting
│   │   ├── extensions.dart             # Dart extensions
│   │   ├── helpers.dart                # Utility functions
│   │   └── constants.dart              # Core constants
│   └── exceptions/
│       ├── app_exceptions.dart         # Custom exceptions
│       └── error_handler.dart          # Global error handling
├── features/
│   ├── authentication/
│   │   ├── data/
│   │   │   ├── repositories/
│   │   │   ├── datasources/
│   │   │   └── models/
│   │   ├── domain/
│   │   │   ├── entities/
│   │   │   ├── repositories/
│   │   │   └── usecases/
│   │   └── presentation/
│   │       ├── pages/
│   │       ├── widgets/
│   │       ├── providers/
│   │       └── controllers/
│   ├── dashboard/
│   │   ├── data/
│   │   ├── domain/
│   │   └── presentation/
│   ├── inspections/
│   │   ├── data/
│   │   ├── domain/
│   │   └── presentation/
│   ├── assets/
│   │   ├── data/
│   │   ├── domain/
│   │   └── presentation/
│   ├── folders/
│   │   ├── data/
│   │   ├── domain/
│   │   └── presentation/
│   ├── forms/
│   │   ├── data/
│   │   ├── domain/
│   │   └── presentation/
│   ├── reports/
│   │   ├── data/
│   │   ├── domain/
│   │   └── presentation/
│   ├── settings/
│   │   ├── data/
│   │   ├── domain/
│   │   └── presentation/
│   └── profile/
│       ├── data/
│       ├── domain/
│       └── presentation/
├── shared/
│   ├── widgets/
│   │   ├── common/
│   │   │   ├── app_bar.dart
│   │   │   ├── bottom_navigation.dart
│   │   │   ├── drawer.dart
│   │   │   ├── loading_indicator.dart
│   │   │   ├── error_widget.dart
│   │   │   └── empty_state.dart
│   │   ├── forms/
│   │   │   ├── custom_text_field.dart
│   │   │   ├── custom_dropdown.dart
│   │   │   ├── custom_checkbox.dart
│   │   │   ├── custom_radio.dart
│   │   │   ├── date_picker.dart
│   │   │   ├── time_picker.dart
│   │   │   └── signature_pad.dart
│   │   ├── media/
│   │   │   ├── image_picker_widget.dart
│   │   │   ├── camera_widget.dart
│   │   │   ├── photo_gallery.dart
│   │   │   └── document_viewer.dart
│   │   ├── lists/
│   │   │   ├── inspection_list_item.dart
│   │   │   ├── asset_list_item.dart
│   │   │   ├── folder_list_item.dart
│   │   │   └── infinite_scroll_list.dart
│   │   └── dialogs/
│   │       ├── confirmation_dialog.dart
│   │       ├── info_dialog.dart
│   │       ├── loading_dialog.dart
│   │       └── error_dialog.dart
│   ├── models/
│   │   ├── user.dart
│   │   ├── inspection.dart
│   │   ├── asset.dart
│   │   ├── folder.dart
│   │   ├── form_template.dart
│   │   ├── report.dart
│   │   └── api_response.dart
│   ├── providers/
│   │   ├── auth_provider.dart
│   │   ├── theme_provider.dart
│   │   ├── connectivity_provider.dart
│   │   ├── location_provider.dart
│   │   └── sync_provider.dart
│   └── extensions/
│       ├── context_extensions.dart
│       ├── string_extensions.dart
│       ├── datetime_extensions.dart
│       └── widget_extensions.dart
└── generated/
    ├── assets.gen.dart                 # Asset code generation
    ├── colors.gen.dart                 # Color code generation
    └── l10n/                           # Internationalization
        ├── app_localizations.dart
        ├── app_localizations_en.dart
        └── app_localizations_es.dart
```

## Architecture Patterns

### Clean Architecture Implementation

#### Data Layer
```dart
// Repository Implementation
class InspectionRepositoryImpl implements InspectionRepository {
  final InspectionRemoteDataSource remoteDataSource;
  final InspectionLocalDataSource localDataSource;
  final NetworkService networkService;
  final SyncService syncService;

  InspectionRepositoryImpl({
    required this.remoteDataSource,
    required this.localDataSource,
    required this.networkService,
    required this.syncService,
  });

  @override
  Future<Either<Failure, List<Inspection>>> getInspections({
    String? folderId,
    InspectionStatus? status,
    int page = 1,
    int limit = 20,
  }) async {
    try {
      // Try local first for offline support
      final localInspections = await localDataSource.getInspections(
        folderId: folderId,
        status: status,
        page: page,
        limit: limit,
      );

      // If online, sync with remote
      if (await networkService.isConnected) {
        final remoteInspections = await remoteDataSource.getInspections(
          folderId: folderId,
          status: status,
          page: page,
          limit: limit,
        );
        
        // Update local cache
        await localDataSource.cacheInspections(remoteInspections);
        
        // Sync pending changes
        await syncService.syncPendingChanges();
        
        return Right(remoteInspections);
      }
      
      return Right(localInspections);
    } catch (e) {
      return Left(DataFailure(e.toString()));
    }
  }
}
```

#### Domain Layer
```dart
// Use Case Implementation
class GetInspectionsUseCase {
  final InspectionRepository repository;

  GetInspectionsUseCase(this.repository);

  Future<Either<Failure, List<Inspection>>> call(GetInspectionsParams params) {
    return repository.getInspections(
      folderId: params.folderId,
      status: params.status,
      page: params.page,
      limit: params.limit,
    );
  }
}

@freezed
class GetInspectionsParams with _$GetInspectionsParams {
  const factory GetInspectionsParams({
    String? folderId,
    InspectionStatus? status,
    @Default(1) int page,
    @Default(20) int limit,
  }) = _GetInspectionsParams;
}
```

#### Presentation Layer
```dart
// Riverpod Provider
@riverpod
class InspectionsNotifier extends _$InspectionsNotifier {
  @override
  Future<List<Inspection>> build() async {
    final useCase = ref.read(getInspectionsUseCaseProvider);
    final result = await useCase(const GetInspectionsParams());
    
    return result.fold(
      (failure) => throw failure,
      (inspections) => inspections,
    );
  }

  Future<void> refreshInspections() async {
    state = const AsyncLoading();
    state = await AsyncValue.guard(() async {
      final useCase = ref.read(getInspectionsUseCaseProvider);
      final result = await useCase(const GetInspectionsParams());
      
      return result.fold(
        (failure) => throw failure,
        (inspections) => inspections,
      );
    });
  }

  Future<void> createInspection(CreateInspectionParams params) async {
    final useCase = ref.read(createInspectionUseCaseProvider);
    final result = await useCase(params);
    
    result.fold(
      (failure) => ref.read(errorHandlerProvider).handleError(failure),
      (inspection) => refreshInspections(),
    );
  }
}
```

### State Management with Riverpod

#### Global Providers
```dart
// Authentication Provider
@riverpod
class AuthNotifier extends _$AuthNotifier {
  @override
  AuthState build() {
    _checkAuthStatus();
    return const AuthState.initial();
  }

  Future<void> login(String email, String password) async {
    state = const AuthState.loading();
    
    final authService = ref.read(authServiceProvider);
    final result = await authService.login(email, password);
    
    result.fold(
      (failure) => state = AuthState.error(failure.message),
      (user) => state = AuthState.authenticated(user),
    );
  }

  Future<void> logout() async {
    final authService = ref.read(authServiceProvider);
    await authService.logout();
    state = const AuthState.unauthenticated();
  }

  void _checkAuthStatus() async {
    final authService = ref.read(authServiceProvider);
    final user = await authService.getCurrentUser();
    
    if (user != null) {
      state = AuthState.authenticated(user);
    } else {
      state = const AuthState.unauthenticated();
    }
  }
}

// Theme Provider
@riverpod
class ThemeNotifier extends _$ThemeNotifier {
  @override
  ThemeMode build() {
    _loadTheme();
    return ThemeMode.system;
  }

  void setTheme(ThemeMode theme) {
    state = theme;
    _saveTheme(theme);
  }

  void _loadTheme() async {
    final prefs = await SharedPreferences.getInstance();
    final themeIndex = prefs.getInt('theme_mode') ?? 0;
    state = ThemeMode.values[themeIndex];
  }

  void _saveTheme(ThemeMode theme) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setInt('theme_mode', theme.index);
  }
}

// Connectivity Provider
@riverpod
class ConnectivityNotifier extends _$ConnectivityNotifier {
  StreamSubscription<ConnectivityResult>? _subscription;

  @override
  bool build() {
    _subscription = Connectivity().onConnectivityChanged.listen((result) {
      state = result != ConnectivityResult.none;
    });
    
    ref.onDispose(() => _subscription?.cancel());
    
    return true; // Assume connected initially
  }
}
```

#### Feature-Specific Providers
```dart
// Inspection Form Provider
@riverpod
class InspectionFormNotifier extends _$InspectionFormNotifier {
  @override
  InspectionFormState build(String? inspectionId) {
    if (inspectionId != null) {
      _loadInspection(inspectionId);
    }
    return InspectionFormState.initial();
  }

  void updateResponse(String questionId, dynamic value) {
    final currentState = state;
    final updatedResponses = Map<String, dynamic>.from(currentState.responses);
    updatedResponses[questionId] = value;
    
    state = currentState.copyWith(
      responses: updatedResponses,
      hasChanges: true,
    );
    
    _autoSave();
  }

  void addPhoto(String questionId, String photoPath) {
    final currentState = state;
    final photos = List<String>.from(currentState.photos[questionId] ?? []);
    photos.add(photoPath);
    
    final updatedPhotos = Map<String, List<String>>.from(currentState.photos);
    updatedPhotos[questionId] = photos;
    
    state = currentState.copyWith(
      photos: updatedPhotos,
      hasChanges: true,
    );
    
    _autoSave();
  }

  Future<void> saveInspection() async {
    state = state.copyWith(isSaving: true);
    
    final useCase = ref.read(saveInspectionUseCaseProvider);
    final result = await useCase(SaveInspectionParams(
      inspectionId: state.inspectionId,
      responses: state.responses,
      photos: state.photos,
      signature: state.signature,
      location: state.location,
    ));
    
    result.fold(
      (failure) => state = state.copyWith(
        isSaving: false,
        error: failure.message,
      ),
      (inspection) => state = state.copyWith(
        isSaving: false,
        hasChanges: false,
        inspectionId: inspection.id,
      ),
    );
  }

  void _autoSave() {
    Timer(const Duration(seconds: 2), () {
      if (state.hasChanges && !state.isSaving) {
        saveInspection();
      }
    });
  }

  void _loadInspection(String inspectionId) async {
    final useCase = ref.read(getInspectionUseCaseProvider);
    final result = await useCase(GetInspectionParams(id: inspectionId));
    
    result.fold(
      (failure) => state = state.copyWith(error: failure.message),
      (inspection) => state = InspectionFormState.fromInspection(inspection),
    );
  }
}
```

## UI Components & Design System

### Theme Configuration
```dart
class AppTheme {
  static ThemeData lightTheme = ThemeData(
    useMaterial3: true,
    colorScheme: ColorScheme.fromSeed(
      seedColor: AppColors.primary,
      brightness: Brightness.light,
    ),
    typography: Typography.material2021(),
    appBarTheme: const AppBarTheme(
      centerTitle: true,
      elevation: 0,
      scrolledUnderElevation: 1,
    ),
    cardTheme: CardTheme(
      elevation: 2,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(12),
      ),
    ),
    inputDecorationTheme: InputDecorationTheme(
      border: OutlineInputBorder(
        borderRadius: BorderRadius.circular(8),
      ),
      filled: true,
      contentPadding: const EdgeInsets.symmetric(
        horizontal: 16,
        vertical: 12,
      ),
    ),
    elevatedButtonTheme: ElevatedButtonThemeData(
      style: ElevatedButton.styleFrom(
        padding: const EdgeInsets.symmetric(
          horizontal: 24,
          vertical: 12,
        ),
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(8),
        ),
      ),
    ),
  );

  static ThemeData darkTheme = ThemeData(
    useMaterial3: true,
    colorScheme: ColorScheme.fromSeed(
      seedColor: AppColors.primary,
      brightness: Brightness.dark,
    ),
    typography: Typography.material2021(),
    // ... similar configuration for dark theme
  );
}

class AppColors {
  static const Color primary = Color(0xFF1976D2);
  static const Color secondary = Color(0xFF03DAC6);
  static const Color error = Color(0xFFB00020);
  static const Color warning = Color(0xFFFF9800);
  static const Color success = Color(0xFF4CAF50);
  static const Color info = Color(0xFF2196F3);
  
  // Priority colors
  static const Color priorityHigh = Color(0xFFE53E3E);
  static const Color priorityMedium = Color(0xFFFF9800);
  static const Color priorityLow = Color(0xFF38A169);
  static const Color priorityGood = Color(0xFF4CAF50);
  static const Color priorityNA = Color(0xFF9E9E9E);
}
```

### Custom Widgets

#### Inspection List Item
```dart
class InspectionListItem extends ConsumerWidget {
  final Inspection inspection;
  final VoidCallback? onTap;
  final VoidCallback? onEdit;
  final VoidCallback? onDelete;

  const InspectionListItem({
    Key? key,
    required this.inspection,
    this.onTap,
    this.onEdit,
    this.onDelete,
  }) : super(key: key);

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final theme = Theme.of(context);
    
    return Card(
      margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(12),
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                children: [
                  Expanded(
                    child: Text(
                      inspection.formTemplate.name,
                      style: theme.textTheme.titleMedium?.copyWith(
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                  ),
                  _buildStatusChip(context, inspection.status),
                ],
              ),
              const SizedBox(height: 8),
              Text(
                inspection.asset.name,
                style: theme.textTheme.bodyMedium?.copyWith(
                  color: theme.colorScheme.onSurfaceVariant,
                ),
              ),
              const SizedBox(height: 8),
              Row(
                children: [
                  Icon(
                    Icons.person_outline,
                    size: 16,
                    color: theme.colorScheme.onSurfaceVariant,
                  ),
                  const SizedBox(width: 4),
                  Text(
                    inspection.inspector.fullName,
                    style: theme.textTheme.bodySmall,
                  ),
                  const Spacer(),
                  if (inspection.completedAt != null) ..[
                    Icon(
                      Icons.schedule,
                      size: 16,
                      color: theme.colorScheme.onSurfaceVariant,
                    ),
                    const SizedBox(width: 4),
                    Text(
                      inspection.completedAt!.formatRelative(),
                      style: theme.textTheme.bodySmall,
                    ),
                  ],
                ],
              ),
              if (inspection.score != null) ..[
                const SizedBox(height: 8),
                _buildScoreIndicator(context, inspection.score!),
              ],
              if (inspection.priority != InspectionPriority.na) ..[
                const SizedBox(height: 8),
                _buildPriorityIndicator(context, inspection.priority),
              ],
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildStatusChip(BuildContext context, InspectionStatus status) {
    final theme = Theme.of(context);
    Color backgroundColor;
    Color textColor;
    
    switch (status) {
      case InspectionStatus.completed:
        backgroundColor = AppColors.success.withOpacity(0.1);
        textColor = AppColors.success;
        break;
      case InspectionStatus.inProgress:
        backgroundColor = AppColors.warning.withOpacity(0.1);
        textColor = AppColors.warning;
        break;
      case InspectionStatus.pending:
        backgroundColor = theme.colorScheme.surfaceVariant;
        textColor = theme.colorScheme.onSurfaceVariant;
        break;
      default:
        backgroundColor = theme.colorScheme.errorContainer;
        textColor = theme.colorScheme.onErrorContainer;
    }
    
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
      decoration: BoxDecoration(
        color: backgroundColor,
        borderRadius: BorderRadius.circular(12),
      ),
      child: Text(
        status.displayName,
        style: theme.textTheme.labelSmall?.copyWith(
          color: textColor,
          fontWeight: FontWeight.w500,
        ),
      ),
    );
  }

  Widget _buildScoreIndicator(BuildContext context, InspectionScore score) {
    final theme = Theme.of(context);
    final percentage = score.percentage;
    Color color;
    
    if (percentage >= 80) {
      color = AppColors.success;
    } else if (percentage >= 60) {
      color = AppColors.warning;
    } else {
      color = AppColors.error;
    }
    
    return Row(
      children: [
        Expanded(
          child: LinearProgressIndicator(
            value: percentage / 100,
            backgroundColor: color.withOpacity(0.2),
            valueColor: AlwaysStoppedAnimation<Color>(color),
          ),
        ),
        const SizedBox(width: 8),
        Text(
          '${percentage.toInt()}%',
          style: theme.textTheme.bodySmall?.copyWith(
            color: color,
            fontWeight: FontWeight.w600,
          ),
        ),
      ],
    );
  }

  Widget _buildPriorityIndicator(BuildContext context, InspectionPriority priority) {
    final theme = Theme.of(context);
    Color color;
    IconData icon;
    
    switch (priority) {
      case InspectionPriority.high:
        color = AppColors.priorityHigh;
        icon = Icons.priority_high;
        break;
      case InspectionPriority.medium:
        color = AppColors.priorityMedium;
        icon = Icons.warning;
        break;
      case InspectionPriority.low:
        color = AppColors.priorityLow;
        icon = Icons.info;
        break;
      case InspectionPriority.good:
        color = AppColors.priorityGood;
        icon = Icons.check_circle;
        break;
      default:
        return const SizedBox.shrink();
    }
    
    return Row(
      children: [
        Icon(
          icon,
          size: 16,
          color: color,
        ),
        const SizedBox(width: 4),
        Text(
          priority.displayName,
          style: theme.textTheme.bodySmall?.copyWith(
            color: color,
            fontWeight: FontWeight.w500,
          ),
        ),
      ],
    );
  }
}
```

#### Form Question Widget
```dart
class FormQuestionWidget extends ConsumerWidget {
  final FormQuestion question;
  final dynamic value;
  final ValueChanged<dynamic> onChanged;
  final bool isRequired;
  final String? error;

  const FormQuestionWidget({
    Key? key,
    required this.question,
    this.value,
    required this.onChanged,
    this.isRequired = false,
    this.error,
  }) : super(key: key);

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return Card(
      margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            _buildQuestionHeader(context),
            const SizedBox(height: 12),
            _buildQuestionInput(context, ref),
            if (error != null) ..[
              const SizedBox(height: 8),
              Text(
                error!,
                style: Theme.of(context).textTheme.bodySmall?.copyWith(
                  color: Theme.of(context).colorScheme.error,
                ),
              ),
            ],
          ],
        ),
      ),
    );
  }

  Widget _buildQuestionHeader(BuildContext context) {
    final theme = Theme.of(context);
    
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Expanded(
          child: Text(
            question.text,
            style: theme.textTheme.titleMedium?.copyWith(
              fontWeight: FontWeight.w500,
            ),
          ),
        ),
        if (isRequired)
          Text(
            '*',
            style: theme.textTheme.titleMedium?.copyWith(
              color: theme.colorScheme.error,
            ),
          ),
      ],
    );
  }

  Widget _buildQuestionInput(BuildContext context, WidgetRef ref) {
    switch (question.type) {
      case QuestionType.text:
        return _buildTextInput(context);
      case QuestionType.number:
        return _buildNumberInput(context);
      case QuestionType.boolean:
        return _buildBooleanInput(context);
      case QuestionType.select:
        return _buildSelectInput(context);
      case QuestionType.multiselect:
        return _buildMultiSelectInput(context);
      case QuestionType.date:
        return _buildDateInput(context);
      case QuestionType.time:
        return _buildTimeInput(context);
      case QuestionType.photo:
        return _buildPhotoInput(context, ref);
      case QuestionType.signature:
        return _buildSignatureInput(context, ref);
      default:
        return const SizedBox.shrink();
    }
  }

  Widget _buildTextInput(BuildContext context) {
    return TextFormField(
      initialValue: value?.toString(),
      onChanged: onChanged,
      maxLines: question.maxLines ?? 1,
      decoration: InputDecoration(
        hintText: question.placeholder,
        border: const OutlineInputBorder(),
      ),
    );
  }

  Widget _buildBooleanInput(BuildContext context) {
    return Row(
      children: [
        Radio<bool>(
          value: true,
          groupValue: value,
          onChanged: (val) => onChanged(val),
        ),
        const Text('Yes'),
        const SizedBox(width: 16),
        Radio<bool>(
          value: false,
          groupValue: value,
          onChanged: (val) => onChanged(val),
        ),
        const Text('No'),
      ],
    );
  }

  Widget _buildSelectInput(BuildContext context) {
    return DropdownButtonFormField<String>(
      value: value,
      onChanged: onChanged,
      decoration: const InputDecoration(
        border: OutlineInputBorder(),
      ),
      items: question.options?.map((option) {
        return DropdownMenuItem<String>(
          value: option,
          child: Text(option),
        );
      }).toList(),
    );
  }

  Widget _buildPhotoInput(BuildContext context, WidgetRef ref) {
    final photos = value as List<String>? ?? [];
    
    return Column(
      children: [
        if (photos.isNotEmpty)
          SizedBox(
            height: 100,
            child: ListView.builder(
              scrollDirection: Axis.horizontal,
              itemCount: photos.length,
              itemBuilder: (context, index) {
                return Container(
                  margin: const EdgeInsets.only(right: 8),
                  width: 100,
                  decoration: BoxDecoration(
                    borderRadius: BorderRadius.circular(8),
                    image: DecorationImage(
                      image: FileImage(File(photos[index])),
                      fit: BoxFit.cover,
                    ),
                  ),
                  child: Stack(
                    children: [
                      Positioned(
                        top: 4,
                        right: 4,
                        child: GestureDetector(
                          onTap: () {
                            final updatedPhotos = List<String>.from(photos);
                            updatedPhotos.removeAt(index);
                            onChanged(updatedPhotos);
                          },
                          child: Container(
                            padding: const EdgeInsets.all(4),
                            decoration: BoxDecoration(
                              color: Colors.black54,
                              borderRadius: BorderRadius.circular(12),
                            ),
                            child: const Icon(
                              Icons.close,
                              color: Colors.white,
                              size: 16,
                            ),
                          ),
                        ),
                      ),
                    ],
                  ),
                );
              },
            ),
          ),
        const SizedBox(height: 8),
        Row(
          children: [
            Expanded(
              child: OutlinedButton.icon(
                onPressed: () => _takePhoto(context, ref),
                icon: const Icon(Icons.camera_alt),
                label: const Text('Take Photo'),
              ),
            ),
            const SizedBox(width: 8),
            Expanded(
              child: OutlinedButton.icon(
                onPressed: () => _pickPhoto(context, ref),
                icon: const Icon(Icons.photo_library),
                label: const Text('Gallery'),
              ),
            ),
          ],
        ),
      ],
    );
  }

  void _takePhoto(BuildContext context, WidgetRef ref) async {
    final cameraService = ref.read(cameraServiceProvider);
    final photoPath = await cameraService.takePhoto();
    
    if (photoPath != null) {
      final photos = List<String>.from(value ?? []);
      photos.add(photoPath);
      onChanged(photos);
    }
  }

  void _pickPhoto(BuildContext context, WidgetRef ref) async {
    final picker = ImagePicker();
    final image = await picker.pickImage(source: ImageSource.gallery);
    
    if (image != null) {
      final photos = List<String>.from(value ?? []);
      photos.add(image.path);
      onChanged(photos);
    }
  }
}
```

## Navigation & Routing

### Route Configuration
```dart
final appRouter = GoRouter(
  initialLocation: '/splash',
  redirect: (context, state) {
    final authState = ref.read(authNotifierProvider);
    final isAuthenticated = authState.maybeWhen(
      authenticated: (_) => true,
      orElse: () => false,
    );
    
    // Redirect to login if not authenticated
    if (!isAuthenticated && !state.location.startsWith('/auth')) {
      return '/auth/login';
    }
    
    // Redirect to dashboard if authenticated and on auth pages
    if (isAuthenticated && state.location.startsWith('/auth')) {
      return '/dashboard';
    }
    
    return null;
  },
  routes: [
    GoRoute(
      path: '/splash',
      builder: (context, state) => const SplashPage(),
    ),
    GoRoute(
      path: '/auth',
      builder: (context, state) => const AuthShell(),
      routes: [
        GoRoute(
          path: '/login',
          builder: (context, state) => const LoginPage(),
        ),
        GoRoute(
          path: '/register',
          builder: (context, state) => const RegisterPage(),
        ),
        GoRoute(
          path: '/forgot-password',
          builder: (context, state) => const ForgotPasswordPage(),
        ),
      ],
    ),
    ShellRoute(
      builder: (context, state, child) => MainShell(child: child),
      routes: [
        GoRoute(
          path: '/dashboard',
          builder: (context, state) => const DashboardPage(),
        ),
        GoRoute(
          path: '/inspections',
          builder: (context, state) => const InspectionsPage(),
          routes: [
            GoRoute(
              path: '/create',
              builder: (context, state) => const CreateInspectionPage(),
            ),
            GoRoute(
              path: '/:id',
              builder: (context, state) => InspectionDetailPage(
                inspectionId: state.params['id']!,
              ),
            ),
            GoRoute(
              path: '/:id/edit',
              builder: (context, state) => InspectionFormPage(
                inspectionId: state.params['id']!,
              ),
            ),
          ],
        ),
        GoRoute(
          path: '/assets',
          builder: (context, state) => const AssetsPage(),
          routes: [
            GoRoute(
              path: '/create',
              builder: (context, state) => const CreateAssetPage(),
            ),
            GoRoute(
              path: '/:id',
              builder: (context, state) => AssetDetailPage(
                assetId: state.params['id']!,
              ),
            ),
          ],
        ),
        GoRoute(
          path: '/folders',
          builder: (context, state) => const FoldersPage(),
          routes: [
            GoRoute(
              path: '/create',
              builder: (context, state) => const CreateFolderPage(),
            ),
            GoRoute(
              path: '/:id',
              builder: (context, state) => FolderDetailPage(
                folderId: state.params['id']!,
              ),
            ),
          ],
        ),
        GoRoute(
          path: '/reports',
          builder: (context, state) => const ReportsPage(),
        ),
        GoRoute(
          path: '/settings',
          builder: (context, state) => const SettingsPage(),
        ),
        GoRoute(
          path: '/profile',
          builder: (context, state) => const ProfilePage(),
        ),
      ],
    ),
  ],
);
```

### Shell Widgets
```dart
class MainShell extends ConsumerWidget {
  final Widget child;

  const MainShell({Key? key, required this.child}) : super(key: key);

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final currentRoute = GoRouter.of(context).location;
    
    return Scaffold(
      body: Row(
        children: [
          if (MediaQuery.of(context).size.width > 768)
            NavigationRail(
              selectedIndex: _getSelectedIndex(currentRoute),
              onDestinationSelected: (index) => _navigateToIndex(context, index),
              labelType: NavigationRailLabelType.all,
              destinations: _getNavigationDestinations(),
            ),
          Expanded(child: child),
        ],
      ),
      bottomNavigationBar: MediaQuery.of(context).size.width <= 768
          ? NavigationBar(
              selectedIndex: _getSelectedIndex(currentRoute),
              onDestinationSelected: (index) => _navigateToIndex(context, index),
              destinations: _getNavigationDestinations(),
            )
          : null,
    );
  }

  List<NavigationDestination> _getNavigationDestinations() {
    return const [
      NavigationDestination(
        icon: Icon(Icons.dashboard_outlined),
        selectedIcon: Icon(Icons.dashboard),
        label: 'Dashboard',
      ),
      NavigationDestination(
        icon: Icon(Icons.assignment_outlined),
        selectedIcon: Icon(Icons.assignment),
        label: 'Inspections',
      ),
      NavigationDestination(
        icon: Icon(Icons.inventory_2_outlined),
        selectedIcon: Icon(Icons.inventory_2),
        label: 'Assets',
      ),
      NavigationDestination(
        icon: Icon(Icons.folder_outlined),
        selectedIcon: Icon(Icons.folder),
        label: 'Folders',
      ),
      NavigationDestination(
        icon: Icon(Icons.analytics_outlined),
        selectedIcon: Icon(Icons.analytics),
        label: 'Reports',
      ),
    ];
  }

  int _getSelectedIndex(String route) {
    if (route.startsWith('/dashboard')) return 0;
    if (route.startsWith('/inspections')) return 1;
    if (route.startsWith('/assets')) return 2;
    if (route.startsWith('/folders')) return 3;
    if (route.startsWith('/reports')) return 4;
    return 0;
  }

  void _navigateToIndex(BuildContext context, int index) {
    switch (index) {
      case 0:
        context.go('/dashboard');
        break;
      case 1:
        context.go('/inspections');
        break;
      case 2:
        context.go('/assets');
        break;
      case 3:
        context.go('/folders');
        break;
      case 4:
        context.go('/reports');
        break;
    }
  }
}
```

## Offline Support & Synchronization

### Sync Service Implementation
```dart
class SyncService {
  final SurrealDBService _remoteDb;
  final HiveService _localDb;
  final ConnectivityService _connectivity;
  final NotificationService _notifications;
  
  final StreamController<SyncStatus> _syncStatusController = StreamController.broadcast();
  Stream<SyncStatus> get syncStatus => _syncStatusController.stream;
  
  Timer? _syncTimer;
  bool _isSyncing = false;

  SyncService({
    required SurrealDBService remoteDb,
    required HiveService localDb,
    required ConnectivityService connectivity,
    required NotificationService notifications,
  }) : _remoteDb = remoteDb,
       _localDb = localDb,
       _connectivity = connectivity,
       _notifications = notifications {
    _initializeSync();
  }

  void _initializeSync() {
    // Start periodic sync every 5 minutes
    _syncTimer = Timer.periodic(const Duration(minutes: 5), (_) {
      syncData();
    });
    
    // Listen to connectivity changes
    _connectivity.onConnectivityChanged.listen((isConnected) {
      if (isConnected && !_isSyncing) {
        syncData();
      }
    });
  }

  Future<void> syncData() async {
    if (_isSyncing || !await _connectivity.isConnected) {
      return;
    }
    
    _isSyncing = true;
    _syncStatusController.add(SyncStatus.syncing);
    
    try {
      // Sync pending changes to server
      await _syncPendingChanges();
      
      // Pull latest data from server
      await _pullLatestData();
      
      // Resolve conflicts
      await _resolveConflicts();
      
      _syncStatusController.add(SyncStatus.completed);
      
    } catch (e) {
      _syncStatusController.add(SyncStatus.error(e.toString()));
      _notifications.showError('Sync failed: ${e.toString()}');
    } finally {
      _isSyncing = false;
    }
  }

  Future<void> _syncPendingChanges() async {
    final pendingInspections = await _localDb.getPendingInspections();
    
    for (final inspection in pendingInspections) {
      try {
        if (inspection.isNew) {
          final remoteInspection = await _remoteDb.createInspection(inspection);
          await _localDb.updateInspectionId(inspection.localId, remoteInspection.id);
        } else {
          await _remoteDb.updateInspection(inspection);
        }
        
        await _localDb.markInspectionSynced(inspection.id);
      } catch (e) {
        // Mark as failed sync for retry later
        await _localDb.markInspectionSyncFailed(inspection.id, e.toString());
      }
    }
    
    // Sync photos
    await _syncPendingPhotos();
  }

  Future<void> _syncPendingPhotos() async {
    final pendingPhotos = await _localDb.getPendingPhotos();
    
    for (final photo in pendingPhotos) {
      try {
        final uploadedUrl = await _remoteDb.uploadPhoto(photo.localPath);
        await _localDb.updatePhotoUrl(photo.id, uploadedUrl);
        await _localDb.markPhotoSynced(photo.id);
      } catch (e) {
        await _localDb.markPhotoSyncFailed(photo.id, e.toString());
      }
    }
  }

  Future<void> _pullLatestData() async {
    final lastSyncTime = await _localDb.getLastSyncTime();
    
    // Pull updated inspections
    final updatedInspections = await _remoteDb.getInspectionsUpdatedSince(lastSyncTime);
    for (final inspection in updatedInspections) {
      await _localDb.upsertInspection(inspection);
    }
    
    // Pull updated assets
    final updatedAssets = await _remoteDb.getAssetsUpdatedSince(lastSyncTime);
    for (final asset in updatedAssets) {
      await _localDb.upsertAsset(asset);
    }
    
    // Pull updated folders
    final updatedFolders = await _remoteDb.getFoldersUpdatedSince(lastSyncTime);
    for (final folder in updatedFolders) {
      await _localDb.upsertFolder(folder);
    }
    
    await _localDb.updateLastSyncTime(DateTime.now());
  }

  Future<void> _resolveConflicts() async {
    final conflicts = await _localDb.getConflicts();
    
    for (final conflict in conflicts) {
      // Simple conflict resolution: server wins
      // In a real app, you might want more sophisticated conflict resolution
      await _localDb.resolveConflict(conflict.id, conflict.serverVersion);
    }
  }

  Future<void> forcePullData() async {
    if (!await _connectivity.isConnected) {
      throw Exception('No internet connection');
    }
    
    _syncStatusController.add(SyncStatus.syncing);
    
    try {
      // Clear local data and pull everything fresh
      await _localDb.clearAllData();
      await _pullLatestData();
      
      _syncStatusController.add(SyncStatus.completed);
    } catch (e) {
      _syncStatusController.add(SyncStatus.error(e.toString()));
      rethrow;
    }
  }

  void dispose() {
    _syncTimer?.cancel();
    _syncStatusController.close();
  }
}

@freezed
class SyncStatus with _$SyncStatus {
  const factory SyncStatus.idle() = _Idle;
  const factory SyncStatus.syncing() = _Syncing;
  const factory SyncStatus.completed() = _Completed;
  const factory SyncStatus.error(String message) = _Error;
}
```

## Platform-Specific Considerations

### Windows Desktop Adaptations
```dart
class WindowsAdaptations {
  static void configureWindow() {
    if (Platform.isWindows) {
      // Set minimum window size
      windowManager.setMinimumSize(const Size(1024, 768));
      
      // Set initial window size
      windowManager.setSize(const Size(1440, 900));
      
      // Center window
      windowManager.center();
      
      // Set window title
      windowManager.setTitle('JSG Inspections');
      
      // Prevent window from being resized below minimum
      windowManager.setResizable(true);
    }
  }

  static Widget adaptiveScaffold({
    required Widget body,
    PreferredSizeWidget? appBar,
    Widget? drawer,
    Widget? endDrawer,
    Widget? bottomNavigationBar,
  }) {
    if (Platform.isWindows) {
      return Scaffold(
        appBar: appBar,
        body: Row(
          children: [
            if (drawer != null)
              SizedBox(
                width: 280,
                child: drawer,
              ),
            Expanded(child: body),
            if (endDrawer != null)
              SizedBox(
                width: 280,
                child: endDrawer,
              ),
          ],
        ),
      );
    }
    
    return Scaffold(
      appBar: appBar,
      body: body,
      drawer: drawer,
      endDrawer: endDrawer,
      bottomNavigationBar: bottomNavigationBar,
    );
  }
}
```

### Android Optimizations
```dart
class AndroidOptimizations {
  static void configureApp() {
    if (Platform.isAndroid) {
      // Configure system UI
      SystemChrome.setSystemUIOverlayStyle(
        const SystemUiOverlayStyle(
          statusBarColor: Colors.transparent,
          statusBarIconBrightness: Brightness.dark,
          systemNavigationBarColor: Colors.white,
          systemNavigationBarIconBrightness: Brightness.dark,
        ),
      );
      
      // Set preferred orientations
      SystemChrome.setPreferredOrientations([
        DeviceOrientation.portraitUp,
        DeviceOrientation.portraitDown,
        DeviceOrientation.landscapeLeft,
        DeviceOrientation.landscapeRight,
      ]);
    }
  }

  static Widget adaptiveLayout({
    required Widget child,
    EdgeInsets? padding,
  }) {
    if (Platform.isAndroid) {
      return SafeArea(
        child: Padding(
          padding: padding ?? const EdgeInsets.all(16),
          child: child,
        ),
      );
    }
    
    return Padding(
      padding: padding ?? const EdgeInsets.all(16),
      child: child,
    );
  }
}
```

## Performance Optimizations

### Image Optimization
```dart
class ImageOptimizationService {
  static Future<String> optimizeImage(String imagePath) async {
    final file = File(imagePath);
    final image = img.decodeImage(await file.readAsBytes());
    
    if (image == null) return imagePath;
    
    // Resize if too large
    img.Image resized = image;
    if (image.width > 1920 || image.height > 1920) {
      resized = img.copyResize(
        image,
        width: image.width > image.height ? 1920 : null,
        height: image.height > image.width ? 1920 : null,
      );
    }
    
    // Compress
    final compressedBytes = img.encodeJpg(resized, quality: 85);
    
    // Save optimized image
    final optimizedPath = imagePath.replaceAll('.jpg', '_optimized.jpg');
    await File(optimizedPath).writeAsBytes(compressedBytes);
    
    return optimizedPath;
  }

  static Widget optimizedImage({
    required String imagePath,
    double? width,
    double? height,
    BoxFit? fit,
  }) {
    return FutureBuilder<String>(
      future: optimizeImage(imagePath),
      builder: (context, snapshot) {
        if (snapshot.hasData) {
          return Image.file(
            File(snapshot.data!),
            width: width,
            height: height,
            fit: fit,
            cacheWidth: width?.toInt(),
            cacheHeight: height?.toInt(),
          );
        }
        
        return Container(
          width: width,
          height: height,
          color: Colors.grey[300],
          child: const Center(
            child: CircularProgressIndicator(),
          ),
        );
      },
    );
  }
}
```

### List Performance
```dart
class OptimizedListView extends StatelessWidget {
  final List<dynamic> items;
  final Widget Function(BuildContext, int) itemBuilder;
  final bool shrinkWrap;
  final ScrollPhysics? physics;
  final EdgeInsets? padding;

  const OptimizedListView({
    Key? key,
    required this.items,
    required this.itemBuilder,
    this.shrinkWrap = false,
    this.physics,
    this.padding,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    if (items.length > 100) {
      // Use ListView.builder for large lists
      return ListView.builder(
        itemCount: items.length,
        itemBuilder: itemBuilder,
        shrinkWrap: shrinkWrap,
        physics: physics,
        padding: padding,
        cacheExtent: 500, // Cache more items for smooth scrolling
      );
    }
    
    // Use regular ListView for smaller lists
    return ListView(
      shrinkWrap: shrinkWrap,
      physics: physics,
      padding: padding,
      children: List.generate(
        items.length,
        (index) => itemBuilder(context, index),
      ),
    );
  }
}
```

## Testing Strategy

### Widget Testing
```dart
void main() {
  group('InspectionListItem Widget Tests', () {
    testWidgets('displays inspection information correctly', (tester) async {
      final inspection = Inspection(
        id: '1',
        formTemplate: FormTemplate(name: 'Safety Check'),
        asset: Asset(name: 'Pump 001'),
        inspector: User(firstName: 'John', lastName: 'Doe'),
        status: InspectionStatus.completed,
        score: InspectionScore(percentage: 85, passed: true),
        completedAt: DateTime.now(),
      );
      
      await tester.pumpWidget(
        MaterialApp(
          home: Scaffold(
            body: InspectionListItem(inspection: inspection),
          ),
        ),
      );
      
      expect(find.text('Safety Check'), findsOneWidget);
      expect(find.text('Pump 001'), findsOneWidget);
      expect(find.text('John Doe'), findsOneWidget);
      expect(find.text('85%'), findsOneWidget);
    });
    
    testWidgets('handles tap events', (tester) async {
      bool tapped = false;
      final inspection = createMockInspection();
      
      await tester.pumpWidget(
        MaterialApp(
          home: Scaffold(
            body: InspectionListItem(
              inspection: inspection,
              onTap: () => tapped = true,
            ),
          ),
        ),
      );
      
      await tester.tap(find.byType(InspectionListItem));
      expect(tapped, isTrue);
    });
  });
}
```

### Integration Testing
```dart
void main() {
  group('Inspection Flow Integration Tests', () {
    testWidgets('complete inspection flow', (tester) async {
      await tester.pumpWidget(const MyApp());
      
      // Login
      await tester.enterText(find.byKey(const Key('email_field')), 'test@example.com');
      await tester.enterText(find.byKey(const Key('password_field')), 'password');
      await tester.tap(find.byKey(const Key('login_button')));
      await tester.pumpAndSettle();
      
      // Navigate to inspections
      await tester.tap(find.text('Inspections'));
      await tester.pumpAndSettle();
      
      // Create new inspection
      await tester.tap(find.byKey(const Key('create_inspection_fab')));
      await tester.pumpAndSettle();
      
      // Fill form
      await tester.tap(find.text('Select Asset'));
      await tester.pumpAndSettle();
      await tester.tap(find.text('Pump 001'));
      await tester.pumpAndSettle();
      
      await tester.tap(find.text('Select Form'));
      await tester.pumpAndSettle();
      await tester.tap(find.text('Safety Inspection'));
      await tester.pumpAndSettle();
      
      // Start inspection
      await tester.tap(find.text('Start Inspection'));
      await tester.pumpAndSettle();
      
      // Answer questions
      await tester.tap(find.byKey(const Key('question_1_yes')));
      await tester.tap(find.byKey(const Key('question_2_good')));
      
      // Complete inspection
      await tester.tap(find.text('Complete Inspection'));
      await tester.pumpAndSettle();
      
      // Verify completion
      expect(find.text('Inspection Completed'), findsOneWidget);
    });
  });
}
```

## Security Considerations

### Data Protection
```dart
class SecurityService {
  static const String _keyAlias = 'jsg_inspections_key';
  
  static Future<void> initializeSecurity() async {
    // Initialize secure storage
    await FlutterSecureStorage().write(
      key: 'app_initialized',
      value: DateTime.now().toIso8601String(),
    );
  }
  
  static Future<String> encryptSensitiveData(String data) async {
    // Implement encryption for sensitive data
    final key = await _getOrCreateEncryptionKey();
    final encrypted = encrypt.Encrypter(encrypt.AES(key));
    final iv = encrypt.IV.fromSecureRandom(16);
    
    return encrypted.encrypt(data, iv: iv).base64;
  }
  
  static Future<String> decryptSensitiveData(String encryptedData) async {
    final key = await _getOrCreateEncryptionKey();
    final encrypted = encrypt.Encrypter(encrypt.AES(key));
    final iv = encrypt.IV.fromSecureRandom(16);
    
    return encrypted.decrypt64(encryptedData, iv: iv);
  }
  
  static Future<encrypt.Key> _getOrCreateEncryptionKey() async {
    const storage = FlutterSecureStorage();
    String? keyString = await storage.read(key: _keyAlias);
    
    if (keyString == null) {
      final key = encrypt.Key.fromSecureRandom(32);
      await storage.write(key: _keyAlias, value: key.base64);
      return key;
    }
    
    return encrypt.Key.fromBase64(keyString);
  }
}
```

### Authentication Security
```dart
class AuthSecurityService {
  static Future<bool> validateBiometric() async {
    final localAuth = LocalAuthentication();
    
    try {
      final isAvailable = await localAuth.canCheckBiometrics;
      if (!isAvailable) return false;
      
      return await localAuth.authenticate(
        localizedReason: 'Authenticate to access JSG Inspections',
        options: const AuthenticationOptions(
          biometricOnly: true,
          stickyAuth: true,
        ),
      );
    } catch (e) {
      return false;
    }
  }
  
  static Future<void> setupPinSecurity(String pin) async {
    final hashedPin = _hashPin(pin);
    await const FlutterSecureStorage().write(
      key: 'user_pin',
      value: hashedPin,
    );
  }
  
  static Future<bool> validatePin(String pin) async {
    final storedHash = await const FlutterSecureStorage().read(key: 'user_pin');
    if (storedHash == null) return false;
    
    return _hashPin(pin) == storedHash;
  }
  
  static String _hashPin(String pin) {
    final bytes = utf8.encode(pin + 'jsg_salt_2024');
    final digest = sha256.convert(bytes);
    return digest.toString();
  }
}
```

## Deployment Configuration

### Android Build Configuration
```yaml
# android/app/build.gradle
android {
    compileSdkVersion 34
    ndkVersion flutter.ndkVersion

    compileOptions {
        sourceCompatibility JavaVersion.VERSION_1_8
        targetCompatibility JavaVersion.VERSION_1_8
    }

    defaultConfig {
        applicationId "com.jsg.inspections"
        minSdkVersion 21
        targetSdkVersion 34
        versionCode flutterVersionCode.toInteger()
        versionName flutterVersionName
        multiDexEnabled true
    }

    signingConfigs {
        release {
            keyAlias keystoreProperties['keyAlias']
            keyPassword keystoreProperties['keyPassword']
            storeFile keystoreProperties['storeFile'] ? file(keystoreProperties['storeFile']) : null
            storePassword keystoreProperties['storePassword']
        }
    }

    buildTypes {
        release {
            signingConfig signingConfigs.release
            minifyEnabled true
            proguardFiles getDefaultProguardFile('proguard-android.txt'), 'proguard-rules.pro'
        }
    }
}
```

### Windows Build Configuration
```cmake
# windows/runner/CMakeLists.txt
set(BINARY_NAME "jsg_inspections")
set(APPLICATION_ID "com.jsg.inspections")

# Configure app properties
set_target_properties(${BINARY_NAME} PROPERTIES
    WIN32_EXECUTABLE TRUE
    OUTPUT_NAME "JSG Inspections"
)

# Set app icon
set(APP_ICON_RESOURCE_FILE "${CMAKE_CURRENT_SOURCE_DIR}/resources/app_icon.ico")
```

## Performance Monitoring

### Analytics Integration
```dart
class AnalyticsService {
  static FirebaseAnalytics? _analytics;
  
  static Future<void> initialize() async {
    _analytics = FirebaseAnalytics.instance;
    await _analytics?.setAnalyticsCollectionEnabled(true);
  }
  
  static Future<void> logInspectionCreated({
    required String formType,
    required String assetType,
  }) async {
    await _analytics?.logEvent(
      name: 'inspection_created',
      parameters: {
        'form_type': formType,
        'asset_type': assetType,
        'timestamp': DateTime.now().toIso8601String(),
      },
    );
  }
  
  static Future<void> logInspectionCompleted({
    required String inspectionId,
    required Duration duration,
    required int questionCount,
    required int photoCount,
  }) async {
    await _analytics?.logEvent(
      name: 'inspection_completed',
      parameters: {
        'inspection_id': inspectionId,
        'duration_minutes': duration.inMinutes,
        'question_count': questionCount,
        'photo_count': photoCount,
      },
    );
  }
  
  static Future<void> logError({
    required String error,
    required String stackTrace,
    String? userId,
  }) async {
    await _analytics?.logEvent(
      name: 'app_error',
      parameters: {
        'error': error,
        'stack_trace': stackTrace,
        'user_id': userId ?? 'anonymous',
        'timestamp': DateTime.now().toIso8601String(),
      },
    );
  }
}
```

## Accessibility Features

### Accessibility Implementation
```dart
class AccessibilityHelper {
  static Widget makeAccessible({
    required Widget child,
    required String semanticLabel,
    String? hint,
    bool excludeSemantics = false,
  }) {
    return Semantics(
      label: semanticLabel,
      hint: hint,
      excludeSemantics: excludeSemantics,
      child: child,
    );
  }
  
  static Widget accessibleButton({
    required VoidCallback onPressed,
    required Widget child,
    required String semanticLabel,
    String? hint,
  }) {
    return Semantics(
      button: true,
      label: semanticLabel,
      hint: hint,
      child: ElevatedButton(
        onPressed: onPressed,
        child: child,
      ),
    );
  }
  
  static Widget accessibleTextField({
    required TextEditingController controller,
    required String label,
    String? hint,
    bool isPassword = false,
  }) {
    return Semantics(
      textField: true,
      label: label,
      hint: hint,
      obscured: isPassword,
      child: TextFormField(
        controller: controller,
        obscureText: isPassword,
        decoration: InputDecoration(
          labelText: label,
          hintText: hint,
        ),
      ),
    );
  }
}
```

## Conclusion

This Flutter frontend architecture provides a robust, scalable, and maintainable foundation for the JSG-Inspections application. Key benefits include:

- **Cross-platform compatibility** with optimized experiences for both Windows and Android
- **Offline-first architecture** ensuring functionality without internet connectivity
- **Clean architecture** with clear separation of concerns
- **Comprehensive state management** using Riverpod
- **Responsive design** adapting to different screen sizes
- **Security-focused** implementation with data encryption and authentication
- **Performance optimized** with efficient image handling and list rendering
- **Accessibility compliant** following WCAG guidelines
- **Comprehensive testing** strategy covering unit, widget, and integration tests

The architecture is designed to scale with the application's growth while maintaining code quality and developer productivity.