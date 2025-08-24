## Overall Application Architecture

### **Clean Architecture + Feature-First Structure**

```
lib/
├── main.dart                           # App entry point
├── app/                               # App-level configuration
│   ├── app.dart                       # Main app widget
│   ├── router/                        # Navigation & routing
│   ├── theme/                         # App theming
│   └── constants/                     # Global constants
├── core/                              # Core infrastructure
│   ├── database/                      # SurrealDB integration
│   ├── network/                       # API & WebSocket clients
│   ├── storage/                       # Local storage services
│   ├── services/                      # Core services (auth, sync, etc.)
│   ├── utils/                         # Utilities & helpers
│   ├── exceptions/                    # Custom exceptions
│   └── extensions/                    # Dart extensions
├── features/                          # Feature modules (Clean Architecture)
│   ├── authentication/
│   ├── dashboard/
│   ├── inspections/
│   ├── assets/
│   ├── folders/
│   ├── forms/
│   ├── reports/
│   ├── ai_analysis/
│   └── settings/
├── shared/                            # Shared components
│   ├── widgets/                       # Reusable UI components
│   ├── models/                        # Data models
│   ├── providers/                     # Global state providers
│   └── extensions/                    # Shared extensions
└── generated/                         # Generated code
    ├── assets.gen.dart
    ├── colors.gen.dart
    └── l10n/
```

## **1. Clean Architecture Layers**

### **Feature Structure (Domain-Driven Design)**
```
features/inspections/
├── data/
│   ├── datasources/
│   │   ├── inspection_remote_datasource.dart
│   │   └── inspection_local_datasource.dart
│   ├── models/
│   │   ├── inspection_model.dart
│   │   └── inspection_response_model.dart
│   └── repositories/
│       └── inspection_repository_impl.dart
├── domain/
│   ├── entities/
│   │   ├── inspection.dart
│   │   └── inspection_response.dart
│   ├── repositories/
│   │   └── inspection_repository.dart
│   └── usecases/
│       ├── create_inspection_usecase.dart
│       ├── get_inspections_usecase.dart
│       ├── update_inspection_usecase.dart
│       └── complete_inspection_usecase.dart
└── presentation/
    ├── pages/
    │   ├── inspections_list_page.dart
    │   ├── inspection_form_page.dart
    │   └── inspection_detail_page.dart
    ├── widgets/
    │   ├── inspection_card.dart
    │   ├── dynamic_form_builder.dart
    │   └── photo_capture_widget.dart
    ├── providers/
    │   ├── inspections_provider.dart
    │   ├── inspection_form_provider.dart
    │   └── inspection_detail_provider.dart
    └── controllers/
        └── inspection_controller.dart
```

## **2. Core Architecture Components**

### **Database Layer (SurrealDB Integration)**
```dart
// core/database/database_service.dart
class DatabaseService {
  static DatabaseService? _instance;
  late SurrealDB _db;
  
  static DatabaseService get instance {
    _instance ??= DatabaseService._();
    return _instance!;
  }
  
  DatabaseService._();
  
  Future<void> initialize() async {
    _db = SurrealDB();
    await _db.connect('ws://localhost:8000/rpc');
    await _db.use(namespace: 'jsg_inspections', database: 'main');
    await _runMigrations();
  }
  
  Future<List<Map<String, dynamic>>> query(String query, [Map<String, dynamic>? params]) async {
    final result = await _db.query(query, params);
    return result.cast<Map<String, dynamic>>();
  }
  
  Stream<List<Map<String, dynamic>>> live(String query) {
    return _db.live(query).map((results) => results.cast<Map<String, dynamic>>());
  }
}
```

### **State Management Architecture (Riverpod)**
```dart
// core/providers/providers.dart
// Database Provider
final databaseProvider = Provider<DatabaseService>((ref) {
  return DatabaseService.instance;
});

// Repository Providers
final inspectionRepositoryProvider = Provider<InspectionRepository>((ref) {
  final database = ref.watch(databaseProvider);
  final apiClient = ref.watch(apiClientProvider);
  final localStorage = ref.watch(localStorageProvider);
  
  return InspectionRepositoryImpl(
    remoteDataSource: InspectionRemoteDataSource(apiClient),
    localDataSource: InspectionLocalDataSource(database, localStorage),
    networkService: ref.watch(networkServiceProvider),
  );
});

// UseCase Providers
final createInspectionUseCaseProvider = Provider<CreateInspectionUseCase>((ref) {
  return CreateInspectionUseCase(ref.watch(inspectionRepositoryProvider));
});

// State Providers
final inspectionsProvider = AsyncNotifierProvider<InspectionsNotifier, List<Inspection>>(() {
  return InspectionsNotifier();
});

final currentInspectionProvider = StateNotifierProvider.family<CurrentInspectionNotifier, InspectionState, String>((ref, inspectionId) {
  return CurrentInspectionNotifier(
    inspectionId,
    ref.watch(inspectionRepositoryProvider),
  );
});
```

### **Network Layer**
```dart
// core/network/api_client.dart
class ApiClient {
  final Dio _dio;
  final AuthService _authService;
  final Logger _logger;
  
  ApiClient(this._authService, this._logger) : _dio = Dio() {
    _setupInterceptors();
  }
  
  void _setupInterceptors() {
    _dio.interceptors.addAll([
      AuthInterceptor(_authService),
      LoggingInterceptor(_logger),
      ErrorInterceptor(),
      RetryInterceptor(),
    ]);
  }
  
  Future<Response<T>> get<T>(String path, {Map<String, dynamic>? queryParameters}) {
    return _dio.get<T>(path, queryParameters: queryParameters);
  }
  
  Future<Response<T>> post<T>(String path, {dynamic data}) {
    return _dio.post<T>(path, data: data);
  }
}

// core/network/websocket_service.dart
class WebSocketService {
  late IO.Socket _socket;
  final StreamController<WebSocketEvent> _eventController = StreamController.broadcast();
  
  Stream<WebSocketEvent> get events => _eventController.stream;
  
  Future<void> connect(String url, String token) async {
    _socket = IO.io(url, IO.OptionBuilder()
        .setAuth({'token': token})
        .setTransports(['websocket'])
        .build());
        
    _setupEventHandlers();
  }
  
  void _setupEventHandlers() {
    _socket.on('inspection:created', (data) {
      _eventController.add(InspectionCreatedEvent.fromJson(data));
    });
    
    _socket.on('inspection:updated', (data) {
      _eventController.add(InspectionUpdatedEvent.fromJson(data));
    });
  }
}
```

## **3. Feature Implementation Example**

### **Domain Layer (Business Logic)**
```dart
// features/inspections/domain/entities/inspection.dart
@freezed
class Inspection with _$Inspection {
  const factory Inspection({
    required String id,
    required String folderId,
    required String formTemplateId,
    required String assetId,
    required String inspectorId,
    required InspectionStatus status,
    required List<InspectionResponse> responses,
    required List<InspectionPhoto> photos,
    double? score,
    InspectionPriority? priority,
    String? notes,
    String? signature,
    DateTime? startedAt,
    DateTime? completedAt,
    required DateTime createdAt,
    required DateTime updatedAt,
  }) = _Inspection;
}

// features/inspections/domain/usecases/create_inspection_usecase.dart
class CreateInspectionUseCase {
  final InspectionRepository _repository;
  
  CreateInspectionUseCase(this._repository);
  
  Future<Either<Failure, Inspection>> call(CreateInspectionParams params) async {
    try {
      // Validation
      final validation = _validateParams(params);
      if (validation.isLeft()) return validation;
      
      // Business logic
      final inspection = Inspection(
        id: const Uuid().v4(),
        folderId: params.folderId,
        formTemplateId: params.formTemplateId,
        assetId: params.assetId,
        inspectorId: params.inspectorId,
        status: InspectionStatus.pending,
        responses: [],
        photos: [],
        createdAt: DateTime.now(),
        updatedAt: DateTime.now(),
      );
      
      // Save
      final result = await _repository.createInspection(inspection);
      return result;
      
    } catch (e) {
      return Left(UnexpectedFailure(e.toString()));
    }
  }
}
```

### **Data Layer (Repository Pattern)**
```dart
// features/inspections/data/repositories/inspection_repository_impl.dart
class InspectionRepositoryImpl implements InspectionRepository {
  final InspectionRemoteDataSource _remoteDataSource;
  final InspectionLocalDataSource _localDataSource;
  final NetworkService _networkService;
  final SyncService _syncService;
  
  InspectionRepositoryImpl({
    required InspectionRemoteDataSource remoteDataSource,
    required InspectionLocalDataSource localDataSource,
    required NetworkService networkService,
    required SyncService syncService,
  }) : _remoteDataSource = remoteDataSource,
       _localDataSource = localDataSource,
       _networkService = networkService,
       _syncService = syncService;
  
  @override
  Future<Either<Failure, List<Inspection>>> getInspections({
    String? folderId,
    InspectionStatus? status,
  }) async {
    try {
      // Always try local first (offline-first)
      final localInspections = await _localDataSource.getInspections(
        folderId: folderId,
        status: status,
      );
      
      // Sync with remote if online
      if (await _networkService.isConnected) {
        _syncService.scheduleSync();
        
        // Try to get fresh data from remote
        try {
          final remoteInspections = await _remoteDataSource.getInspections(
            folderId: folderId,
            status: status,
          );
          
          // Update local cache
          await _localDataSource.cacheInspections(remoteInspections);
          
          return Right(remoteInspections.map((m) => m.toEntity()).toList());
        } catch (e) {
          // Remote failed, return local data
          return Right(localInspections.map((m) => m.toEntity()).toList());
        }
      }
      
      return Right(localInspections.map((m) => m.toEntity()).toList());
    } catch (e) {
      return Left(CacheFailure(e.toString()));
    }
  }
}
```

### **Presentation Layer (UI + State)**
```dart
// features/inspections/presentation/providers/inspections_provider.dart
class InspectionsNotifier extends AsyncNotifier<List<Inspection>> {
  @override
  Future<List<Inspection>> build() async {
    final useCase = ref.read(getInspectionsUseCaseProvider);
    final result = await useCase(const GetInspectionsParams());
    
    return result.fold(
      (failure) => throw failure,
      (inspections) => inspections,
    );
  }
  
  Future<void> createInspection(CreateInspectionParams params) async {
    final useCase = ref.read(createInspectionUseCaseProvider);
    final result = await useCase(params);
    
    result.fold(
      (failure) => ref.read(errorHandlerProvider).handle(failure),
      (inspection) {
        // Optimistic update
        final currentState = state.value ?? [];
        state = AsyncValue.data([inspection, ...currentState]);
      },
    );
  }
  
  Future<void> refresh() async {
    state = const AsyncLoading();
    state = await AsyncValue.guard(() async {
      final useCase = ref.read(getInspectionsUseCaseProvider);
      final result = await useCase(const GetInspectionsParams(forceRefresh: true));
      
      return result.fold(
        (failure) => throw failure,
        (inspections) => inspections,
      );
    });
  }
}

// features/inspections/presentation/pages/inspections_list_page.dart
class InspectionsListPage extends ConsumerWidget {
  const InspectionsListPage({Key? key}) : super(key: key);
  
  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final inspectionsAsync = ref.watch(inspectionsProvider);
    final connectivity = ref.watch(connectivityProvider);
    
    return Scaffold(
      appBar: AppBar(
        title: const Text('Inspections'),
        actions: [
          if (!connectivity)
            const Icon(Icons.cloud_off, color: Colors.orange),
          IconButton(
            onPressed: () => ref.read(inspectionsProvider.notifier).refresh(),
            icon: const Icon(Icons.refresh),
          ),
        ],
      ),
      body: inspectionsAsync.when(
        loading: () => const LoadingWidget(),
        error: (error, stack) => ErrorWidget.withDetails(
          message: error.toString(),
          onRetry: () => ref.invalidate(inspectionsProvider),
        ),
        data: (inspections) => InspectionsList(inspections: inspections),
      ),
      floatingActionButton: FloatingActionButton(
        onPressed: () => context.push('/inspections/create'),
        child: const Icon(Icons.add),
      ),
    );
  }
}
```

## **4. Sync Architecture**

### **Background Synchronization**
```dart
// core/services/sync_service.dart
class SyncService {
  final DatabaseService _database;
  final ApiClient _apiClient;
  final ConnectivityService _connectivity;
  final Logger _logger;
  
  Timer? _syncTimer;
  bool _isSyncing = false;
  
  Future<void> initialize() async {
    // Schedule periodic sync
    _syncTimer = Timer.periodic(const Duration(minutes: 5), (_) {
      if (_connectivity.isConnected && !_isSyncing) {
        scheduledSync();
      }
    });
    
    // Listen to connectivity changes
    _connectivity.onConnectivityChanged.listen((isConnected) {
      if (isConnected && !_isSyncing) {
        scheduledSync();
      }
    });
  }
  
  Future<void> scheduledSync() async {
    if (_isSyncing) return;
    
    _isSyncing = true;
    try {
      await _syncPendingChanges();
      await _syncDownstream();
      await _resolveConflicts();
    } catch (e) {
      _logger.error('Sync failed: $e');
    } finally {
      _isSyncing = false;
    }
  }
  
  Future<void> _syncPendingChanges() async {
    final pendingChanges = await _database.query(
      'SELECT * FROM sync_queue WHERE status = "pending" ORDER BY timestamp ASC'
    );
    
    for (final change in pendingChanges) {
      try {
        await _uploadChange(change);
        await _database.query(
          'UPDATE sync_queue:⟨${change['id']}⟩ SET status = "synced", syncedAt = time::now()'
        );
      } catch (e) {
        await _database.query(
          'UPDATE sync_queue:⟨${change['id']}⟩ SET status = "failed", error = $error, retryCount = retryCount + 1',
          {'error': e.toString()}
        );
      }
    }
  }
}
```

## **5. Dependency Injection Setup**

### **Service Locator Pattern**
```dart
// core/di/injection_container.dart
final GetIt sl = GetIt.instance;

Future<void> init() async {
  // Core Services
  sl.registerLazySingleton<DatabaseService>(() => DatabaseService.instance);
  sl.registerLazySingleton<ApiClient>(() => ApiClient(sl(), sl()));
  sl.registerLazySingleton<AuthService>(() => AuthService(sl(), sl()));
  sl.registerLazySingleton<SyncService>(() => SyncService(sl(), sl(), sl(), sl()));
  
  // Repositories
  sl.registerLazySingleton<InspectionRepository>(() => InspectionRepositoryImpl(
    remoteDataSource: sl(),
    localDataSource: sl(),
    networkService: sl(),
    syncService: sl(),
  ));
  
  // Use Cases
  sl.registerLazySingleton(() => CreateInspectionUseCase(sl()));
  sl.registerLazySingleton(() => GetInspectionsUseCase(sl()));
  sl.registerLazySingleton(() => UpdateInspectionUseCase(sl()));
  
  // Data Sources
  sl.registerLazySingleton<InspectionRemoteDataSource>(() => InspectionRemoteDataSourceImpl(sl()));
  sl.registerLazySingleton<InspectionLocalDataSource>(() => InspectionLocalDataSourceImpl(sl()));
}
```

## **6. Error Handling Architecture**

### **Global Error Handler**
```dart
// core/exceptions/error_handler.dart
class GlobalErrorHandler {
  static void initialize() {
    FlutterError.onError = (FlutterErrorDetails details) {
      _handleFlutterError(details);
    };
    
    PlatformDispatcher.instance.onError = (error, stack) {
      _handlePlatformError(error, stack);
      return true;
    };
  }
  
  static void _handleFlutterError(FlutterErrorDetails details) {
    _logError(details.exception, details.stack);
    
    if (kReleaseMode) {
      // Send to crash analytics
      FirebaseCrashlytics.instance.recordFlutterFatalError(details);
    }
  }
  
  static void _handlePlatformError(Object error, StackTrace stack) {
    _logError(error, stack);
    
    if (kReleaseMode) {
      FirebaseCrashlytics.instance.recordError(error, stack, fatal: true);
    }
  }
}

// Failure classes for different error types
abstract class Failure {
  final String message;
  const Failure(this.message);
}

class ServerFailure extends Failure {
  const ServerFailure(String message) : super(message);
}

class CacheFailure extends Failure {
  const CacheFailure(String message) : super(message);
}

class NetworkFailure extends Failure {
  const NetworkFailure(String message) : super(message);
}

class ValidationFailure extends Failure {
  const ValidationFailure(String message) : super(message);
}
```

## **7. Testing Architecture**

### **Testing Structure**
```
test/
├── unit/
│   ├── core/
│   │   ├── services/
│   │   └── utils/
│   └── features/
│       └── inspections/
│           ├── data/
│           ├── domain/
│           └── presentation/
├── integration/
│   ├── database/
│   ├── api/
│   └── sync/
├── widget/
│   └── features/
└── fixtures/
    ├── inspection_fixtures.dart
    └── mock_data.dart
```

### **Test Setup Example**
```dart
// test/features/inspections/domain/usecases/create_inspection_usecase_test.dart
void main() {
  group('CreateInspectionUseCase', () {
    late CreateInspectionUseCase useCase;
    late MockInspectionRepository mockRepository;
    
    setUp(() {
      mockRepository = MockInspectionRepository();
      useCase = CreateInspectionUseCase(mockRepository);
    });
    
    test('should create inspection when valid params provided', () async {
      // Arrange
      final params = CreateInspectionParams(
        folderId: 'folder1',
        formTemplateId: 'form1',
        assetId: 'asset1',
        inspectorId: 'user1',
      );
      
      final expectedInspection = Inspection(
        id: 'inspection1',
        folderId: params.folderId,
        formTemplateId: params.formTemplateId,
        assetId: params.assetId,
        inspectorId: params.inspectorId,
        status: InspectionStatus.pending,
        responses: [],
        photos: [],
        createdAt: DateTime.now(),
        updatedAt: DateTime.now(),
      );
      
      when(mockRepository.createInspection(any))
          .thenAnswer((_) async => Right(expectedInspection));
      
      // Act
      final result = await useCase(params);
      
      // Assert
      expect(result, equals(Right(expectedInspection)));
      verify(mockRepository.createInspection(any)).called(1);
    });
  });
}
```

This architecture provides:

1. **Separation of Concerns** - Clean architecture layers
2. **Offline-First** - Local database with sync capabilities  
3. **Reactive UI** - Riverpod state management with streams
4. **Type Safety** - Strong typing with freezed/json_annotation
5. **Testability** - Dependency injection and mocking
6. **Scalability** - Feature-based organization
7. **Error Resilience** - Comprehensive error handling
8. **Real-time Updates** - WebSocket integration
9. **Performance** - Efficient caching and lazy loading
10. **Maintainability** - Clear structure and documentation

This architecture will scale beautifully as your JSG-Inspections app grows in complexity and user base.