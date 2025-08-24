import 'package:hive/hive.dart';
import 'package:freezed_annotation/freezed_annotation.dart';
import 'inspection.dart';
import 'sync_status.dart';

part 'form_template.freezed.dart';
part 'form_template.g.dart';

@freezed
@HiveType(typeId: 16)
class FormTemplate with _$FormTemplate {
  const factory FormTemplate({
    @HiveField(0) required String id,
    @HiveField(1) required String name,
    @HiveField(2) String? description,
    @HiveField(3) required String version,
    @HiveField(4) required List<FormSection> sections,
    @HiveField(5) required FormTemplateStatus status,
    @HiveField(6) String? category,
    @HiveField(7) @Default([]) List<String> tags,
    @HiveField(8) String? createdBy,
    @HiveField(9) required DateTime createdAt,
    @HiveField(10) required DateTime updatedAt,
    @HiveField(11) DateTime? publishedAt,
    @HiveField(12) @Default(SyncStatus.pending) SyncStatus syncStatus,
    @HiveField(13) @Default({}) Map<String, dynamic> settings,
  }) = _FormTemplate;

  factory FormTemplate.fromJson(Map<String, dynamic> json) => _$FormTemplateFromJson(json);
}

@freezed
@HiveType(typeId: 17)
class FormSection with _$FormSection {
  const factory FormSection({
    @HiveField(0) required String id,
    @HiveField(1) required String title,
    @HiveField(2) String? description,
    @HiveField(3) required int order,
    @HiveField(4) required List<FormQuestion> questions,
    @HiveField(5) @Default(true) bool isRequired,
    @HiveField(6) @Default(true) bool isVisible,
    @HiveField(7) @Default({}) Map<String, dynamic> conditions,
  }) = _FormSection;

  factory FormSection.fromJson(Map<String, dynamic> json) => _$FormSectionFromJson(json);
}

@freezed
@HiveType(typeId: 18)
class FormQuestion with _$FormQuestion {
  const factory FormQuestion({
    @HiveField(0) required String id,
    @HiveField(1) required String text,
    @HiveField(2) String? description,
    @HiveField(3) required QuestionType type,
    @HiveField(4) required int order,
    @HiveField(5) @Default(false) bool isRequired,
    @HiveField(6) @Default(true) bool isVisible,
    @HiveField(7) @Default([]) List<QuestionOption> options,
    @HiveField(8) QuestionValidation? validation,
    @HiveField(9) dynamic defaultValue,
    @HiveField(10) String? placeholder,
    @HiveField(11) String? helpText,
    @HiveField(12) @Default({}) Map<String, dynamic> conditions,
    @HiveField(13) @Default({}) Map<String, dynamic> settings,
  }) = _FormQuestion;

  factory FormQuestion.fromJson(Map<String, dynamic> json) => _$FormQuestionFromJson(json);
}

@freezed
@HiveType(typeId: 19)
class QuestionOption with _$QuestionOption {
  const factory QuestionOption({
    @HiveField(0) required String id,
    @HiveField(1) required String text,
    @HiveField(2) dynamic value,
    @HiveField(3) required int order,
    @HiveField(4) @Default(false) bool isDefault,
    @HiveField(5) @Default(false) bool isDefect,
    @HiveField(6) DefectSeverity? defectSeverity,
    @HiveField(7) double? score,
    @HiveField(8) @Default({}) Map<String, dynamic> metadata,
  }) = _QuestionOption;

  factory QuestionOption.fromJson(Map<String, dynamic> json) => _$QuestionOptionFromJson(json);
}

@freezed
@HiveType(typeId: 20)
class QuestionValidation with _$QuestionValidation {
  const factory QuestionValidation({
    @HiveField(0) int? minLength,
    @HiveField(1) int? maxLength,
    @HiveField(2) double? minValue,
    @HiveField(3) double? maxValue,
    @HiveField(4) String? pattern,
    @HiveField(5) @Default([]) List<String> allowedValues,
    @HiveField(6) String? customValidation,
    @HiveField(7) String? errorMessage,
  }) = _QuestionValidation;

  factory QuestionValidation.fromJson(Map<String, dynamic> json) => _$QuestionValidationFromJson(json);
}

@HiveType(typeId: 21)
enum FormTemplateStatus {
  @HiveField(0)
  draft,
  @HiveField(1)
  published,
  @HiveField(2)
  archived,
  @HiveField(3)
  deprecated,
}

extension FormTemplateStatusExtension on FormTemplateStatus {
  String get displayName {
    switch (this) {
      case FormTemplateStatus.draft:
        return 'Draft';
      case FormTemplateStatus.published:
        return 'Published';
      case FormTemplateStatus.archived:
        return 'Archived';
      case FormTemplateStatus.deprecated:
        return 'Deprecated';
    }
  }

  bool get isActive {
    return this == FormTemplateStatus.published;
  }

  bool get canEdit {
    return this == FormTemplateStatus.draft;
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
      case QuestionType.photo:
        return 'Photo';
      case QuestionType.signature:
        return 'Signature';
      case QuestionType.location:
        return 'Location';
    }
  }

  bool get requiresOptions {
    return this == QuestionType.singleChoice || 
           this == QuestionType.multipleChoice ||
           this == QuestionType.rating;
  }

  bool get supportsMedia {
    return this == QuestionType.photo || this == QuestionType.signature;
  }

  bool get supportsValidation {
    return this == QuestionType.text || 
           this == QuestionType.number ||
           this == QuestionType.date ||
           this == QuestionType.time;
  }
}