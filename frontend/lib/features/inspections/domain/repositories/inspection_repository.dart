import '../entities/inspection.dart';

abstract class InspectionRepository {
  /// Get list of inspections with optional filtering
  Future<List<Inspection>> getInspections({
    String? folderId,
    String? assetId,
    InspectionStatus? status,
    int? limit,
    int? offset,
  });

  /// Get a specific inspection by ID
  Future<Inspection?> getInspectionById(String id);

  /// Create a new inspection
  Future<Inspection> createInspection(CreateInspectionParams params);

  /// Update an existing inspection
  Future<Inspection> updateInspection(String id, UpdateInspectionParams params);

  /// Delete an inspection
  Future<void> deleteInspection(String id);

  /// Search inspections by text query
  Future<List<Inspection>> searchInspections(String query);

  /// Synchronize inspections with remote server
  Future<void> syncInspections();
}