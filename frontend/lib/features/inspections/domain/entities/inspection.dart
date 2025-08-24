import 'package:freezed_annotation/freezed_annotation.dart';

part 'inspection.freezed.dart';
part 'inspection.g.dart';

@freezed
class Inspection with _$Inspection {
  const factory Inspection({
    required String id,
    required String formTemplateId,
    required String assetId,
    required String folderId,
    required String inspectorId,
    required InspectionStatus status,
    required Map<String, dynamic> responses,
    required Map<String, List<String>> photos,
    InspectionScore? score,
    InspectionPriority? priority,
    String? notes,
    String? signature,
    DateTime? startedAt,
    DateTime? completedAt,
    required DateTime createdAt,
    required DateTime updatedAt,
  }) = _Inspection;

  factory Inspection.fromJson(Map<String, dynamic> json) =>
      _$InspectionFromJson(json);
}

@freezed
class InspectionScore with _$InspectionScore {
  const factory InspectionScore({
    required double totalScore,
    required double maxScore,
    required double percentage,
    required Map<String, double> sectionScores,
    required List<String> criticalIssues,
    required List<String> recommendations,
  }) = _InspectionScore;

  factory InspectionScore.fromJson(Map<String, dynamic> json) =>
      _$InspectionScoreFromJson(json);
}

@freezed
class InspectionResponse with _$InspectionResponse {
  const factory InspectionResponse({
    required String questionId,
    required dynamic value,
    String? notes,
    List<String>? photos,
    DateTime? timestamp,
  }) = _InspectionResponse;

  factory InspectionResponse.fromJson(Map<String, dynamic> json) =>
      _$InspectionResponseFromJson(json);
}

@freezed
class InspectionPhoto with _$InspectionPhoto {
  const factory InspectionPhoto({
    required String id,
    required String questionId,
    required String filePath,
    String? caption,
    double? latitude,
    double? longitude,
    required DateTime capturedAt,
  }) = _InspectionPhoto;

  factory InspectionPhoto.fromJson(Map<String, dynamic> json) =>
      _$InspectionPhotoFromJson(json);
}

@freezed
class CreateInspectionParams with _$CreateInspectionParams {
  const factory CreateInspectionParams({
    required String formTemplateId,
    required String assetId,
    required String folderId,
    required String inspectorId,
    String? notes,
    DateTime? startedAt,
  }) = _CreateInspectionParams;

  factory CreateInspectionParams.fromJson(Map<String, dynamic> json) =>
      _$CreateInspectionParamsFromJson(json);
}

@freezed
class UpdateInspectionParams with _$UpdateInspectionParams {
  const factory UpdateInspectionParams({
    Map<String, dynamic>? responses,
    Map<String, List<String>>? photos,
    InspectionStatus? status,
    InspectionScore? score,
    InspectionPriority? priority,
    String? notes,
    String? signature,
  }) = _UpdateInspectionParams;

  factory UpdateInspectionParams.fromJson(Map<String, dynamic> json) =>
      _$UpdateInspectionParamsFromJson(json);
}

enum InspectionStatus {
  @JsonValue('draft')
  draft,
  @JsonValue('in_progress')
  inProgress,
  @JsonValue('completed')
  completed,
  @JsonValue('submitted')
  submitted,
  @JsonValue('approved')
  approved,
  @JsonValue('rejected')
  rejected,
  @JsonValue('cancelled')
  cancelled;

  String get displayName {
    switch (this) {
      case InspectionStatus.draft:
        return 'Draft';
      case InspectionStatus.inProgress:
        return 'In Progress';
      case InspectionStatus.completed:
        return 'Completed';
      case InspectionStatus.submitted:
        return 'Submitted';
      case InspectionStatus.approved:
        return 'Approved';
      case InspectionStatus.rejected:
        return 'Rejected';
      case InspectionStatus.cancelled:
        return 'Cancelled';
    }
  }

  bool get isEditable {
    return this == InspectionStatus.draft || this == InspectionStatus.inProgress;
  }

  bool get isCompleted {
    return this == InspectionStatus.completed ||
        this == InspectionStatus.submitted ||
        this == InspectionStatus.approved;
  }
}

enum InspectionPriority {
  @JsonValue('low')
  low,
  @JsonValue('medium')
  medium,
  @JsonValue('high')
  high,
  @JsonValue('critical')
  critical;

  String get displayName {
    switch (this) {
      case InspectionPriority.low:
        return 'Low';
      case InspectionPriority.medium:
        return 'Medium';
      case InspectionPriority.high:
        return 'High';
      case InspectionPriority.critical:
        return 'Critical';
    }
  }

  int get value {
    switch (this) {
      case InspectionPriority.low:
        return 1;
      case InspectionPriority.medium:
        return 2;
      case InspectionPriority.high:
        return 3;
      case InspectionPriority.critical:
        return 4;
    }
  }
}