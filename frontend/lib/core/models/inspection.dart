import 'package:hive/hive.dart';
import 'package:freezed_annotation/freezed_annotation.dart';
import 'sync_status.dart';

part 'inspection.freezed.dart';
part 'inspection.g.dart';

@freezed
@HiveType(typeId: 6)
class Inspection with _$Inspection {
  const factory Inspection({
    @HiveField(0) required String id,
    @HiveField(1) required String formTemplateId,
    @HiveField(2) required String assetId,
    @HiveField(3) required String folderId,
    @HiveField(4) required String inspectorId,
    @HiveField(5) required InspectionStatus status,
    @HiveField(6) @Default([]) List<InspectionResponse> responses,
    @HiveField(7) @Default([]) List<InspectionPhoto> photos,
    @HiveField(8) InspectionScore? score,
    @HiveField(9) InspectionPriority? priority,
    @HiveField(10) String? notes,
    @HiveField(11) String? signature,
    @HiveField(12) DateTime? startedAt,
    @HiveField(13) DateTime? completedAt,
    @HiveField(14) required DateTime createdAt,
    @HiveField(15) required DateTime updatedAt,
    @HiveField(16) @Default(SyncStatus.pending) SyncStatus syncStatus,
    @HiveField(17) @Default({}) Map<String, dynamic> metadata,
  }) = _Inspection;

  factory Inspection.fromJson(Map<String, dynamic> json) => _$InspectionFromJson(json);
}

@freezed
@HiveType(typeId: 7)
class InspectionResponse with _$InspectionResponse {
  const factory InspectionResponse({
    @HiveField(0) required String questionId,
    @HiveField(1) required String questionText,
    @HiveField(2) required QuestionType questionType,
    @HiveField(3) dynamic value,
    @HiveField(4) String? notes,
    @HiveField(5) @Default([]) List<String> photos,
    @HiveField(6) bool? isDefect,
    @HiveField(7) DefectSeverity? defectSeverity,
    @HiveField(8) required DateTime answeredAt,
  }) = _InspectionResponse;

  factory InspectionResponse.fromJson(Map<String, dynamic> json) => _$InspectionResponseFromJson(json);
}

@freezed
@HiveType(typeId: 8)
class InspectionPhoto with _$InspectionPhoto {
  const factory InspectionPhoto({
    @HiveField(0) required String id,
    @HiveField(1) required String filePath,
    @HiveField(2) String? questionId,
    @HiveField(3) String? caption,
    @HiveField(4) PhotoLocation? location,
    @HiveField(5) required DateTime takenAt,
    @HiveField(6) @Default(false) bool isDefectPhoto,
    @HiveField(7) @Default(SyncStatus.pending) SyncStatus syncStatus,
  }) = _InspectionPhoto;

  factory InspectionPhoto.fromJson(Map<String, dynamic> json) => _$InspectionPhotoFromJson(json);
}

@freezed
@HiveType(typeId: 9)
class PhotoLocation with _$PhotoLocation {
  const factory PhotoLocation({
    @HiveField(0) required double latitude,
    @HiveField(1) required double longitude,
    @HiveField(2) double? accuracy,
    @HiveField(3) double? altitude,
  }) = _PhotoLocation;

  factory PhotoLocation.fromJson(Map<String, dynamic> json) => _$PhotoLocationFromJson(json);
}

@freezed
@HiveType(typeId: 10)
class InspectionScore with _$InspectionScore {
  const factory InspectionScore({
    @HiveField(0) required double totalScore,
    @HiveField(1) required double maxScore,
    @HiveField(2) required double percentage,
    @HiveField(3) required ScoreGrade grade,
    @HiveField(4) required int totalQuestions,
    @HiveField(5) required int answeredQuestions,
    @HiveField(6) required int defectCount,
    @HiveField(7) required int criticalDefects,
    @HiveField(8) required int majorDefects,
    @HiveField(9) required int minorDefects,
  }) = _InspectionScore;

  factory InspectionScore.fromJson(Map<String, dynamic> json) => _$InspectionScoreFromJson(json);
}

@HiveType(typeId: 11)
enum InspectionStatus {
  @HiveField(0)
  draft,
  @HiveField(1)
  inProgress,
  @HiveField(2)
  completed,
  @HiveField(3)
  submitted,
  @HiveField(4)
  approved,
  @HiveField(5)
  rejected,
}

@HiveType(typeId: 12)
enum InspectionPriority {
  @HiveField(0)
  low,
  @HiveField(1)
  medium,
  @HiveField(2)
  high,
  @HiveField(3)
  critical,
}

@HiveType(typeId: 13)
enum QuestionType {
  @HiveField(0)
  text,
  @HiveField(1)
  number,
  @HiveField(2)
  boolean,
  @HiveField(3)
  singleChoice,
  @HiveField(4)
  multipleChoice,
  @HiveField(5)
  rating,
  @HiveField(6)
  date,
  @HiveField(7)
  time,
  @HiveField(8)
  photo,
  @HiveField(9)
  signature,
  @HiveField(10)
  location,
}

@HiveType(typeId: 14)
enum DefectSeverity {
  @HiveField(0)
  minor,
  @HiveField(1)
  major,
  @HiveField(2)
  critical,
}

@HiveType(typeId: 15)
enum ScoreGrade {
  @HiveField(0)
  excellent,
  @HiveField(1)
  good,
  @HiveField(2)
  fair,
  @HiveField(3)
  poor,
  @HiveField(4)
  fail,
}

extension InspectionStatusExtension on InspectionStatus {
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
    }
  }

  bool get canEdit {
    return this == InspectionStatus.draft || this == InspectionStatus.inProgress;
  }

  bool get isFinalized {
    return this == InspectionStatus.submitted || 
           this == InspectionStatus.approved || 
           this == InspectionStatus.rejected;
  }
}

extension InspectionPriorityExtension on InspectionPriority {
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
}

extension DefectSeverityExtension on DefectSeverity {
  String get displayName {
    switch (this) {
      case DefectSeverity.minor:
        return 'Minor';
      case DefectSeverity.major:
        return 'Major';
      case DefectSeverity.critical:
        return 'Critical';
    }
  }
}

extension ScoreGradeExtension on ScoreGrade {
  String get displayName {
    switch (this) {
      case ScoreGrade.excellent:
        return 'Excellent';
      case ScoreGrade.good:
        return 'Good';
      case ScoreGrade.fair:
        return 'Fair';
      case ScoreGrade.poor:
        return 'Poor';
      case ScoreGrade.fail:
        return 'Fail';
    }
  }
}