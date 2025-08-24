import 'package:riverpod_annotation/riverpod_annotation.dart';
import '../../domain/entities/inspection.dart';
import '../../domain/repositories/inspection_repository.dart';
import '../../data/repositories/inspection_repository.dart';
import '../../../../core/exceptions/app_exceptions.dart';

part 'inspection_provider.g.dart';

@riverpod
class InspectionsNotifier extends _$InspectionsNotifier {
  @override
  Future<List<Inspection>> build({
    String? folderId,
    String? assetId,
    InspectionStatus? status,
  }) async {
    final repository = ref.read(inspectionRepositoryProvider);
    return repository.getInspections(
      folderId: folderId,
      assetId: assetId,
      status: status,
    );
  }

  /// Create a new inspection
  Future<void> createInspection(CreateInspectionParams params) async {
    state = const AsyncLoading();
    
    state = await AsyncValue.guard(() async {
      final repository = ref.read(inspectionRepositoryProvider);
      await repository.createInspection(params);
      
      // Refresh the list
      return repository.getInspections(
        folderId: params.folderId,
        assetId: params.assetId,
      );
    });
  }

  /// Update an existing inspection
  Future<void> updateInspection(String id, UpdateInspectionParams params) async {
    state = await AsyncValue.guard(() async {
      final repository = ref.read(inspectionRepositoryProvider);
      await repository.updateInspection(id, params);
      
      // Refresh the list
      final currentState = state.value ?? [];
      return repository.getInspections();
    });
  }

  /// Delete an inspection
  Future<void> deleteInspection(String id) async {
    state = await AsyncValue.guard(() async {
      final repository = ref.read(inspectionRepositoryProvider);
      await repository.deleteInspection(id);
      
      // Remove from current state
      final currentState = state.value ?? [];
      return currentState.where((inspection) => inspection.id != id).toList();
    });
  }

  /// Refresh inspections list
  Future<void> refreshInspections() async {
    ref.invalidateSelf();
  }

  /// Sync with remote server
  Future<void> syncInspections() async {
    try {
      final repository = ref.read(inspectionRepositoryProvider);
      await repository.syncInspections();
      
      // Refresh after sync
      ref.invalidateSelf();
    } catch (e) {
      // Handle sync errors gracefully
      throw SyncException('Failed to sync inspections: $e');
    }
  }
}

@riverpod
Future<Inspection?> inspectionDetail(InspectionDetailRef ref, String id) async {
  final repository = ref.read(inspectionRepositoryProvider);
  return repository.getInspectionById(id);
}

@riverpod
Future<List<Inspection>> searchInspections(SearchInspectionsRef ref, String query) async {
  if (query.trim().isEmpty) {
    return [];
  }
  
  final repository = ref.read(inspectionRepositoryProvider);
  return repository.searchInspections(query);
}

@riverpod
class InspectionFormNotifier extends _$InspectionFormNotifier {
  @override
  InspectionFormState build(String? inspectionId) {
    if (inspectionId != null) {
      _loadInspection(inspectionId);
    }
    return InspectionFormState.initial();
  }

  void _loadInspection(String inspectionId) async {
    try {
      final repository = ref.read(inspectionRepositoryProvider);
      final inspection = await repository.getInspectionById(inspectionId);
      
      if (inspection != null) {
        state = state.copyWith(
          inspectionId: inspection.id,
          responses: inspection.responses,
          photos: inspection.photos,
          signature: inspection.signature,
          hasChanges: false,
        );
      }
    } catch (e) {
      state = state.copyWith(
        error: 'Failed to load inspection: $e',
      );
    }
  }

  /// Update a response for a specific question
  void updateResponse(String questionId, dynamic value) {
    state = state.copyWith(
      responses: {...state.responses, questionId: value},
      hasChanges: true,
      error: null,
    );
    _autoSave();
  }

  /// Add a photo to a specific question
  void addPhoto(String questionId, String photoPath) {
    final currentPhotos = List<String>.from(state.photos[questionId] ?? []);
    currentPhotos.add(photoPath);
    
    state = state.copyWith(
      photos: {...state.photos, questionId: currentPhotos},
      hasChanges: true,
    );
    _autoSave();
  }

  /// Remove a photo from a specific question
  void removePhoto(String questionId, String photoPath) {
    final currentPhotos = List<String>.from(state.photos[questionId] ?? []);
    currentPhotos.remove(photoPath);
    
    state = state.copyWith(
      photos: {...state.photos, questionId: currentPhotos},
      hasChanges: true,
    );
    _autoSave();
  }

  /// Update signature
  void updateSignature(String signaturePath) {
    state = state.copyWith(
      signature: signaturePath,
      hasChanges: true,
    );
    _autoSave();
  }

  /// Save the inspection form
  Future<void> saveInspection({
    required String formTemplateId,
    required String assetId,
    required String folderId,
    required String inspectorId,
    InspectionStatus? status,
  }) async {
    state = state.copyWith(isSaving: true, error: null);
    
    try {
      final repository = ref.read(inspectionRepositoryProvider);
      
      if (state.inspectionId != null) {
        // Update existing inspection
        await repository.updateInspection(
          state.inspectionId!,
          UpdateInspectionParams(
            responses: state.responses,
            photos: state.photos,
            signature: state.signature,
            status: status,
          ),
        );
      } else {
        // Create new inspection
        final inspection = await repository.createInspection(
          CreateInspectionParams(
            formTemplateId: formTemplateId,
            assetId: assetId,
            folderId: folderId,
            inspectorId: inspectorId,
          ),
        );
        
        // Update with responses and photos
        await repository.updateInspection(
          inspection.id,
          UpdateInspectionParams(
            responses: state.responses,
            photos: state.photos,
            signature: state.signature,
            status: status,
          ),
        );
        
        state = state.copyWith(inspectionId: inspection.id);
      }
      
      state = state.copyWith(
        hasChanges: false,
        isSaving: false,
      );
      
      // Invalidate inspections list to refresh
      ref.invalidate(inspectionsNotifierProvider);
    } catch (e) {
      state = state.copyWith(
        isSaving: false,
        error: 'Failed to save inspection: $e',
      );
    }
  }

  /// Auto-save functionality (debounced)
  void _autoSave() {
    // Implement debounced auto-save logic here
    // This could use a timer to save after a delay
  }

  /// Reset form state
  void resetForm() {
    state = InspectionFormState.initial();
  }

  /// Complete inspection
  Future<void> completeInspection({
    required String formTemplateId,
    required String assetId,
    required String folderId,
    required String inspectorId,
  }) async {
    await saveInspection(
      formTemplateId: formTemplateId,
      assetId: assetId,
      folderId: folderId,
      inspectorId: inspectorId,
      status: InspectionStatus.completed,
    );
  }
}

/// Form state for inspection forms
class InspectionFormState {
  final String? inspectionId;
  final Map<String, dynamic> responses;
  final Map<String, List<String>> photos;
  final String? signature;
  final bool hasChanges;
  final bool isSaving;
  final String? error;

  const InspectionFormState({
    this.inspectionId,
    required this.responses,
    required this.photos,
    this.signature,
    required this.hasChanges,
    required this.isSaving,
    this.error,
  });

  factory InspectionFormState.initial() {
    return const InspectionFormState(
      responses: {},
      photos: {},
      hasChanges: false,
      isSaving: false,
    );
  }

  InspectionFormState copyWith({
    String? inspectionId,
    Map<String, dynamic>? responses,
    Map<String, List<String>>? photos,
    String? signature,
    bool? hasChanges,
    bool? isSaving,
    String? error,
  }) {
    return InspectionFormState(
      inspectionId: inspectionId ?? this.inspectionId,
      responses: responses ?? this.responses,
      photos: photos ?? this.photos,
      signature: signature ?? this.signature,
      hasChanges: hasChanges ?? this.hasChanges,
      isSaving: isSaving ?? this.isSaving,
      error: error,
    );
  }
}