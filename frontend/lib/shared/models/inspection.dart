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
    String? assignedById,
    required InspectionStatus status,
    required List<InspectionResponse> responses,
    required List<InspectionPhoto> photos,
    InspectionScore? score,
    InspectionPriority? priority,
    String? notes,
    String? signature,
    String? weatherConditions,
    double? temperature,
    String? location,
    Map<String, dynamic>? gpsCoordinates,
    DateTime? scheduledAt,
    DateTime? startedAt,
    DateTime? completedAt,
    DateTime? submittedAt,
    required DateTime createdAt,
    required DateTime updatedAt,
    Map<String, dynamic>? metadata,
  }) = _Inspection;

  factory Inspection.fromJson(Map<String, dynamic> json) => _$InspectionFromJson(json);
}

@freezed
class InspectionResponse with _$InspectionResponse {
  const factory InspectionResponse({
    required String questionId,
    required String questionText,
    required QuestionType questionType,
    required dynamic value,
    String? notes,
    List<String>? photoIds,
    bool? isRequired,
    bool? isCompliant,
    String? validationError,
    DateTime? answeredAt,
    Map<String, dynamic>? metadata,
  }) = _InspectionResponse;

  factory InspectionResponse.fromJson(Map<String, dynamic> json) => _$InspectionResponseFromJson(json);
}

@freezed
class InspectionPhoto with _$InspectionPhoto {
  const factory InspectionPhoto({
    required String id,
    required String inspectionId,
    String? questionId,
    required String filePath,
    String? fileName,
    String? caption,
    int? fileSize,
    String? mimeType,
    Map<String, dynamic>? exifData,
    Map<String, dynamic>? gpsCoordinates,
    required DateTime capturedAt,
    DateTime? uploadedAt,
    @Default(false) bool isUploaded,
    String? thumbnailPath,
    Map<String, dynamic>? aiAnalysis,
  }) = _InspectionPhoto;

  factory InspectionPhoto.fromJson(Map<String, dynamic> json) => _$InspectionPhotoFromJson(json);
}

@freezed
class InspectionScore with _$InspectionScore {
  const factory InspectionScore({
    required double totalScore,
    required double maxScore,
    required double percentage,
    required int totalQuestions,
    required int answeredQuestions,
    required int compliantAnswers,
    required int nonCompliantAnswers,
    required int notApplicableAnswers,
    required ScoreGrade grade,
    Map<String, double>? categoryScores,
    List<String>? criticalIssues,
    List<String>? recommendations,
  }) = _InspectionScore;

  factory InspectionScore.fromJson(Map<String, dynamic> json) => _$InspectionScoreFromJson(json);
}

enum InspectionStatus {
  @JsonValue('draft')
  draft,
  @JsonValue('scheduled')
  scheduled,
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
  cancelled,
}

enum InspectionPriority {
  @JsonValue('low')
  low,
  @JsonValue('medium')
  medium,
  @JsonValue('high')
  high,
  @JsonValue('critical')
  critical,
}

enum QuestionType {
  @JsonValue('text')
  text,
  @JsonValue('number')
  number,
  @JsonValue('boolean')
  boolean,
  @JsonValue('single_choice')
  singleChoice,
  @JsonValue('multiple_choice')
  multipleChoice,
  @JsonValue('rating')
  rating,
  @JsonValue('date')
  date,
  @JsonValue('time')
  time,
  @JsonValue('datetime')
  datetime,
  @JsonValue('photo')
  photo,
  @JsonValue('signature')
  signature,
  @JsonValue('location')
  location,
  @JsonValue('barcode')
  barcode,
  @JsonValue('qr_code')
  qrCode,
}

enum ScoreGrade {
  @JsonValue('excellent')
  excellent,
  @JsonValue('good')
  good,
  @JsonValue('satisfactory')
  satisfactory,
  @JsonValue('needs_improvement')
  needsImprovement,
  @JsonValue('poor')
  poor,
  @JsonValue('critical')
  critical,
}

extension InspectionStatusExtension on InspectionStatus {
  String get displayName {
    switch (this) {
      case InspectionStatus.draft:
        return 'Draft';
      case InspectionStatus.scheduled:
        return 'Scheduled';
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

  String get description {
    switch (this) {
      case InspectionStatus.draft:
        return 'Inspection is being prepared';
      case InspectionStatus.scheduled:
        return 'Inspection is scheduled for future';
      case InspectionStatus.inProgress:
        return 'Inspection is currently being conducted';
      case InspectionStatus.completed:
        return 'Inspection has been completed';
      case InspectionStatus.submitted:
        return 'Inspection has been submitted for review';
      case InspectionStatus.approved:
        return 'Inspection has been approved';
      case InspectionStatus.rejected:
        return 'Inspection has been rejected';
      case InspectionStatus.cancelled:
        return 'Inspection has been cancelled';
    }
  }

  bool get canEdit {
    return this == InspectionStatus.draft || 
           this == InspectionStatus.scheduled || 
           this == InspectionStatus.inProgress;
  }

  bool get canSubmit {
    return this == InspectionStatus.completed;
  }

  bool get canApprove {
    return this == InspectionStatus.submitted;
  }

  bool get canReject {
    return this == InspectionStatus.submitted;
  }

  bool get canCancel {
    return this == InspectionStatus.draft || 
           this == InspectionStatus.scheduled;
  }

  bool get isActive {
    return this == InspectionStatus.scheduled || 
           this == InspectionStatus.inProgress;
  }

  bool get isCompleted {
    return this == InspectionStatus.completed || 
           this == InspectionStatus.submitted || 
           this == InspectionStatus.approved;
  }

  bool get isFinal {
    return this == InspectionStatus.approved || 
           this == InspectionStatus.rejected || 
           this == InspectionStatus.cancelled;
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

  String get description {
    switch (this) {
      case InspectionPriority.low:
        return 'Low priority inspection';
      case InspectionPriority.medium:
        return 'Medium priority inspection';
      case InspectionPriority.high:
        return 'High priority inspection';
      case InspectionPriority.critical:
        return 'Critical priority inspection - immediate attention required';
    }
  }

  int get sortOrder {
    switch (this) {
      case InspectionPriority.critical:
        return 4;
      case InspectionPriority.high:
        return 3;
      case InspectionPriority.medium:
        return 2;
      case InspectionPriority.low:
        return 1;
    }
  }
}

extension QuestionTypeExtension on QuestionType {
  String get displayName {
    switch (this) {
      case QuestionType.text:
        return 'Text';
      case QuestionType.number:
        return 'Number';
      case QuestionType.boolean:
        return 'Yes/No';
      case QuestionType.singleChoice:
        return 'Single Choice';
      case QuestionType.multipleChoice:
        return 'Multiple Choice';
      case QuestionType.rating:
        return 'Rating';
      case QuestionType.date:
        return 'Date';
      case QuestionType.time:
        return 'Time';
      case QuestionType.datetime:
        return 'Date & Time';
      case QuestionType.photo:
        return 'Photo';
      case QuestionType.signature:
        return 'Signature';
      case QuestionType.location:
        return 'Location';
      case QuestionType.barcode:
        return 'Barcode';
      case QuestionType.qrCode:
        return 'QR Code';
    }
  }

  bool get requiresInput {
    return this != QuestionType.photo && 
           this != QuestionType.signature && 
           this != QuestionType.location;
  }

  bool get supportsPhotos {
    return true; // All question types can have photos attached
  }

  bool get supportsNotes {
    return true; // All question types can have notes
  }
}

extension ScoreGradeExtension on ScoreGrade {
  String get displayName {
    switch (this) {
      case ScoreGrade.excellent:
        return 'Excellent';
      case ScoreGrade.good:
        return 'Good';
      case ScoreGrade.satisfactory:
        return 'Satisfactory';
      case ScoreGrade.needsImprovement:
        return 'Needs Improvement';
      case ScoreGrade.poor:
        return 'Poor';
      case ScoreGrade.critical:
        return 'Critical';
    }
  }

  String get description {
    switch (this) {
      case ScoreGrade.excellent:
        return 'Outstanding performance, exceeds expectations';
      case ScoreGrade.good:
        return 'Good performance, meets expectations';
      case ScoreGrade.satisfactory:
        return 'Acceptable performance, minor issues';
      case ScoreGrade.needsImprovement:
        return 'Below expectations, requires attention';
      case ScoreGrade.poor:
        return 'Poor performance, significant issues';
      case ScoreGrade.critical:
        return 'Critical issues, immediate action required';
    }
  }

  double get minPercentage {
    switch (this) {
      case ScoreGrade.excellent:
        return 90.0;
      case ScoreGrade.good:
        return 80.0;
      case ScoreGrade.satisfactory:
        return 70.0;
      case ScoreGrade.needsImprovement:
        return 60.0;
      case ScoreGrade.poor:
        return 40.0;
      case ScoreGrade.critical:
        return 0.0;
    }
  }

  static ScoreGrade fromPercentage(double percentage) {
    if (percentage >= 90) return ScoreGrade.excellent;
    if (percentage >= 80) return ScoreGrade.good;
    if (percentage >= 70) return ScoreGrade.satisfactory;
    if (percentage >= 60) return ScoreGrade.needsImprovement;
    if (percentage >= 40) return ScoreGrade.poor;
    return ScoreGrade.critical;
  }
}

extension InspectionExtension on Inspection {
  bool get canEdit => status.canEdit;
  bool get canSubmit => status.canSubmit;
  bool get canApprove => status.canApprove;
  bool get canReject => status.canReject;
  bool get canCancel => status.canCancel;
  bool get isActive => status.isActive;
  bool get isCompleted => status.isCompleted;
  bool get isFinal => status.isFinal;
  
  Duration? get duration {
    if (startedAt == null) return null;
    final endTime = completedAt ?? DateTime.now();
    return endTime.difference(startedAt!);
  }
  
  double get completionPercentage {
    if (score == null) return 0.0;
    if (score!.totalQuestions == 0) return 0.0;
    return (score!.answeredQuestions / score!.totalQuestions) * 100;
  }
  
  bool get isOverdue {
    if (scheduledAt == null) return false;
    return DateTime.now().isAfter(scheduledAt!) && !isCompleted;
  }
  
  Duration? get timeUntilDue {
    if (scheduledAt == null) return null;
    final now = DateTime.now();
    if (now.isAfter(scheduledAt!)) return Duration.zero;
    return scheduledAt!.difference(now);
  }
  
  bool get hasPhotos => photos.isNotEmpty;
  bool get hasSignature => signature != null && signature!.isNotEmpty;
  bool get hasNotes => notes != null && notes!.isNotEmpty;
  
  List<InspectionResponse> get requiredResponses {
    return responses.where((r) => r.isRequired == true).toList();
  }
  
  List<InspectionResponse> get incompleteResponses {
    return responses.where((r) => r.value == null || r.value.toString().isEmpty).toList();
  }
  
  List<InspectionResponse> get nonCompliantResponses {
    return responses.where((r) => r.isCompliant == false).toList();
  }
  
  bool get hasRequiredIncompleteResponses {
    return requiredResponses.any((r) => r.value == null || r.value.toString().isEmpty);
  }
  
  bool get hasCriticalIssues {
    return score?.criticalIssues?.isNotEmpty == true;
  }
  
  String get priorityDisplayText {
    return priority?.displayName ?? 'Not Set';
  }
  
  String get statusDisplayText => status.displayName;
  
  String get scoreDisplayText {
    if (score == null) return 'Not Scored';
    return '${score!.percentage.toStringAsFixed(1)}% (${score!.grade.displayName})';
  }
  
  Map<String, dynamic> toSummaryMap() {
    return {
      'id': id,
      'status': statusDisplayText,
      'priority': priorityDisplayText,
      'score': scoreDisplayText,
      'completion': '${completionPercentage.toStringAsFixed(1)}%',
      'duration': duration?.toString(),
      'photos': photos.length,
      'hasSignature': hasSignature,
      'scheduledAt': scheduledAt?.toIso8601String(),
      'completedAt': completedAt?.toIso8601String(),
    };
  }
}

extension InspectionResponseExtension on InspectionResponse {
  bool get hasValue => value != null && value.toString().isNotEmpty;
  bool get hasPhotos => photoIds?.isNotEmpty == true;
  bool get hasNotes => notes != null && notes!.isNotEmpty;
  bool get hasValidationError => validationError != null && validationError!.isNotEmpty;
  
  String get displayValue {
    if (value == null) return 'No Answer';
    
    switch (questionType) {
      case QuestionType.boolean:
        return value == true ? 'Yes' : 'No';
      case QuestionType.rating:
        return '$value/5';
      case QuestionType.date:
      case QuestionType.time:
      case QuestionType.datetime:
        if (value is String) {
          try {
            final date = DateTime.parse(value);
            return date.toLocal().toString();
          } catch (e) {
            return value.toString();
          }
        }
        return value.toString();
      case QuestionType.multipleChoice:
        if (value is List) {
          return (value as List).join(', ');
        }
        return value.toString();
      default:
        return value.toString();
    }
  }
  
  bool get isValid {
    if (hasValidationError) return false;
    if (isRequired == true && !hasValue) return false;
    return true;
  }
}

extension InspectionPhotoExtension on InspectionPhoto {
  bool get hasCaption => caption != null && caption!.isNotEmpty;
  bool get hasGpsData => gpsCoordinates != null && gpsCoordinates!.isNotEmpty;
  bool get hasExifData => exifData != null && exifData!.isNotEmpty;
  bool get hasAiAnalysis => aiAnalysis != null && aiAnalysis!.isNotEmpty;
  bool get hasThumbnail => thumbnailPath != null && thumbnailPath!.isNotEmpty;
  
  String get fileSizeDisplay {
    if (fileSize == null) return 'Unknown';
    
    final bytes = fileSize!;
    if (bytes < 1024) return '${bytes}B';
    if (bytes < 1024 * 1024) return '${(bytes / 1024).toStringAsFixed(1)}KB';
    return '${(bytes / (1024 * 1024)).toStringAsFixed(1)}MB';
  }
  
  String get timeAgo {
    final now = DateTime.now();
    final difference = now.difference(capturedAt);
    
    if (difference.inDays > 0) {
      return '${difference.inDays} day${difference.inDays == 1 ? '' : 's'} ago';
    } else if (difference.inHours > 0) {
      return '${difference.inHours} hour${difference.inHours == 1 ? '' : 's'} ago';
    } else if (difference.inMinutes > 0) {
      return '${difference.inMinutes} minute${difference.inMinutes == 1 ? '' : 's'} ago';
    } else {
      return 'Just now';
    }
  }
}

extension InspectionScoreExtension on InspectionScore {
  bool get isPassing => percentage >= 70.0;
  bool get isExcellent => grade == ScoreGrade.excellent;
  bool get isCritical => grade == ScoreGrade.critical;
  
  String get percentageDisplay => '${percentage.toStringAsFixed(1)}%';
  String get gradeDisplay => grade.displayName;
  
  double get completionRate {
    if (totalQuestions == 0) return 0.0;
    return (answeredQuestions / totalQuestions) * 100;
  }
  
  double get complianceRate {
    if (answeredQuestions == 0) return 0.0;
    return (compliantAnswers / answeredQuestions) * 100;
  }
}