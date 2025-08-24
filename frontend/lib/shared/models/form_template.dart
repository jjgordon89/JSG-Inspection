import 'package:freezed_annotation/freezed_annotation.dart';
import 'inspection.dart';

part 'form_template.freezed.dart';
part 'form_template.g.dart';

@freezed
class FormTemplate with _$FormTemplate {
  const factory FormTemplate({
    required String id,
    required String name,
    String? description,
    required String version,
    required FormTemplateStatus status,
    String? category,
    List<String>? tags,
    required List<FormSection> sections,
    FormTemplateSettings? settings,
    FormTemplateScoring? scoring,
    List<FormTemplateRule>? rules,
    String? createdById,
    String? lastModifiedById,
    required DateTime createdAt,
    required DateTime updatedAt,
    DateTime? publishedAt,
    DateTime? archivedAt,
    Map<String, dynamic>? metadata,
  }) = _FormTemplate;

  factory FormTemplate.fromJson(Map<String, dynamic> json) => _$FormTemplateFromJson(json);
}

@freezed
class FormSection with _$FormSection {
  const factory FormSection({
    required String id,
    required String title,
    String? description,
    required int order,
    @Default(true) bool isVisible,
    @Default(false) bool isRequired,
    List<FormQuestion> questions = const [],
    FormSectionCondition? condition,
    Map<String, dynamic>? metadata,
  }) = _FormSection;

  factory FormSection.fromJson(Map<String, dynamic> json) => _$FormSectionFromJson(json);
}

@freezed
class FormQuestion with _$FormQuestion {
  const factory FormQuestion({
    required String id,
    required String text,
    String? description,
    String? helpText,
    required QuestionType type,
    required int order,
    @Default(true) bool isVisible,
    @Default(false) bool isRequired,
    FormQuestionValidation? validation,
    FormQuestionOptions? options,
    FormQuestionCondition? condition,
    FormQuestionScoring? scoring,
    @Default(false) bool allowPhotos,
    @Default(false) bool allowNotes,
    @Default(false) bool allowMultiplePhotos,
    int? maxPhotos,
    String? placeholder,
    Map<String, dynamic>? metadata,
  }) = _FormQuestion;

  factory FormQuestion.fromJson(Map<String, dynamic> json) => _$FormQuestionFromJson(json);
}

@freezed
class FormQuestionValidation with _$FormQuestionValidation {
  const factory FormQuestionValidation({
    dynamic minValue,
    dynamic maxValue,
    int? minLength,
    int? maxLength,
    String? pattern,
    String? customValidation,
    String? errorMessage,
    List<String>? allowedValues,
    List<String>? forbiddenValues,
  }) = _FormQuestionValidation;

  factory FormQuestionValidation.fromJson(Map<String, dynamic> json) => _$FormQuestionValidationFromJson(json);
}

@freezed
class FormQuestionOptions with _$FormQuestionOptions {
  const factory FormQuestionOptions({
    List<FormQuestionOption>? choices,
    int? minRating,
    int? maxRating,
    String? ratingLabel,
    List<String>? ratingLabels,
    @Default(false) bool allowOther,
    String? otherLabel,
    @Default(false) bool randomizeOrder,
    int? maxSelections,
    String? dateFormat,
    String? timeFormat,
    Map<String, dynamic>? customOptions,
  }) = _FormQuestionOptions;

  factory FormQuestionOptions.fromJson(Map<String, dynamic> json) => _$FormQuestionOptionsFromJson(json);
}

@freezed
class FormQuestionOption with _$FormQuestionOption {
  const factory FormQuestionOption({
    required String id,
    required String text,
    String? description,
    dynamic value,
    @Default(false) bool isDefault,
    @Default(true) bool isEnabled,
    int? order,
    Map<String, dynamic>? metadata,
  }) = _FormQuestionOption;

  factory FormQuestionOption.fromJson(Map<String, dynamic> json) => _$FormQuestionOptionFromJson(json);
}

@freezed
class FormQuestionCondition with _$FormQuestionCondition {
  const factory FormQuestionCondition({
    required String dependsOnQuestionId,
    required ConditionOperator operator,
    required dynamic expectedValue,
    List<FormQuestionCondition>? andConditions,
    List<FormQuestionCondition>? orConditions,
  }) = _FormQuestionCondition;

  factory FormQuestionCondition.fromJson(Map<String, dynamic> json) => _$FormQuestionConditionFromJson(json);
}

@freezed
class FormSectionCondition with _$FormSectionCondition {
  const factory FormSectionCondition({
    required String dependsOnQuestionId,
    required ConditionOperator operator,
    required dynamic expectedValue,
    List<FormSectionCondition>? andConditions,
    List<FormSectionCondition>? orConditions,
  }) = _FormSectionCondition;

  factory FormSectionCondition.fromJson(Map<String, dynamic> json) => _$FormSectionConditionFromJson(json);
}

@freezed
class FormQuestionScoring with _$FormQuestionScoring {
  const factory FormQuestionScoring({
    required double maxPoints,
    Map<String, double>? valuePoints,
    @Default(false) bool isCritical,
    double? criticalThreshold,
    String? scoringMethod,
    Map<String, dynamic>? customScoring,
  }) = _FormQuestionScoring;

  factory FormQuestionScoring.fromJson(Map<String, dynamic> json) => _$FormQuestionScoringFromJson(json);
}

@freezed
class FormTemplateSettings with _$FormTemplateSettings {
  const factory FormTemplateSettings({
    @Default(true) bool allowSaveAsDraft,
    @Default(true) bool allowOfflineCompletion,
    @Default(false) bool requireSignature,
    @Default(false) bool requireLocation,
    @Default(false) bool requirePhotos,
    @Default(true) bool allowNotes,
    @Default(false) bool autoCalculateScore,
    @Default(false) bool showProgressBar,
    @Default(false) bool randomizeQuestions,
    @Default(false) bool randomizeSections,
    int? timeLimit,
    String? completionMessage,
    List<String>? requiredRoles,
    Map<String, dynamic>? customSettings,
  }) = _FormTemplateSettings;

  factory FormTemplateSettings.fromJson(Map<String, dynamic> json) => _$FormTemplateSettingsFromJson(json);
}

@freezed
class FormTemplateScoring with _$FormTemplateScoring {
  const factory FormTemplateScoring({
    required ScoringMethod method,
    required double maxScore,
    Map<String, double>? sectionWeights,
    Map<String, double>? categoryWeights,
    List<ScoreRange>? scoreRanges,
    @Default(false) bool penalizeUnanswered,
    double? unansweredPenalty,
    Map<String, dynamic>? customScoring,
  }) = _FormTemplateScoring;

  factory FormTemplateScoring.fromJson(Map<String, dynamic> json) => _$FormTemplateScoringFromJson(json);
}

@freezed
class ScoreRange with _$ScoreRange {
  const factory ScoreRange({
    required double minScore,
    required double maxScore,
    required String label,
    String? description,
    String? color,
    ScoreGrade? grade,
  }) = _ScoreRange;

  factory ScoreRange.fromJson(Map<String, dynamic> json) => _$ScoreRangeFromJson(json);
}

@freezed
class FormTemplateRule with _$FormTemplateRule {
  const factory FormTemplateRule({
    required String id,
    required String name,
    String? description,
    required RuleType type,
    required RuleCondition condition,
    required RuleAction action,
    @Default(true) bool isEnabled,
    int? priority,
  }) = _FormTemplateRule;

  factory FormTemplateRule.fromJson(Map<String, dynamic> json) => _$FormTemplateRuleFromJson(json);
}

@freezed
class RuleCondition with _$RuleCondition {
  const factory RuleCondition({
    required String questionId,
    required ConditionOperator operator,
    required dynamic value,
    List<RuleCondition>? andConditions,
    List<RuleCondition>? orConditions,
  }) = _RuleCondition;

  factory RuleCondition.fromJson(Map<String, dynamic> json) => _$RuleConditionFromJson(json);
}

@freezed
class RuleAction with _$RuleAction {
  const factory RuleAction({
    required ActionType type,
    String? targetId,
    dynamic value,
    String? message,
    Map<String, dynamic>? parameters,
  }) = _RuleAction;

  factory RuleAction.fromJson(Map<String, dynamic> json) => _$RuleActionFromJson(json);
}

enum FormTemplateStatus {
  @JsonValue('draft')
  draft,
  @JsonValue('review')
  review,
  @JsonValue('published')
  published,
  @JsonValue('archived')
  archived,
}

enum ConditionOperator {
  @JsonValue('equals')
  equals,
  @JsonValue('not_equals')
  notEquals,
  @JsonValue('greater_than')
  greaterThan,
  @JsonValue('greater_than_or_equal')
  greaterThanOrEqual,
  @JsonValue('less_than')
  lessThan,
  @JsonValue('less_than_or_equal')
  lessThanOrEqual,
  @JsonValue('contains')
  contains,
  @JsonValue('not_contains')
  notContains,
  @JsonValue('starts_with')
  startsWith,
  @JsonValue('ends_with')
  endsWith,
  @JsonValue('is_empty')
  isEmpty,
  @JsonValue('is_not_empty')
  isNotEmpty,
  @JsonValue('in')
  inList,
  @JsonValue('not_in')
  notInList,
}

enum ScoringMethod {
  @JsonValue('simple')
  simple,
  @JsonValue('weighted')
  weighted,
  @JsonValue('percentage')
  percentage,
  @JsonValue('custom')
  custom,
}

enum RuleType {
  @JsonValue('validation')
  validation,
  @JsonValue('visibility')
  visibility,
  @JsonValue('calculation')
  calculation,
  @JsonValue('notification')
  notification,
}

enum ActionType {
  @JsonValue('show')
  show,
  @JsonValue('hide')
  hide,
  @JsonValue('require')
  require,
  @JsonValue('optional')
  optional,
  @JsonValue('set_value')
  setValue,
  @JsonValue('calculate')
  calculate,
  @JsonValue('validate')
  validate,
  @JsonValue('notify')
  notify,
}

extension FormTemplateStatusExtension on FormTemplateStatus {
  String get displayName {
    switch (this) {
      case FormTemplateStatus.draft:
        return 'Draft';
      case FormTemplateStatus.review:
        return 'Under Review';
      case FormTemplateStatus.published:
        return 'Published';
      case FormTemplateStatus.archived:
        return 'Archived';
    }
  }

  String get description {
    switch (this) {
      case FormTemplateStatus.draft:
        return 'Template is being created or edited';
      case FormTemplateStatus.review:
        return 'Template is under review for approval';
      case FormTemplateStatus.published:
        return 'Template is active and available for use';
      case FormTemplateStatus.archived:
        return 'Template is no longer active';
    }
  }

  bool get canEdit {
    return this == FormTemplateStatus.draft;
  }

  bool get canPublish {
    return this == FormTemplateStatus.draft || this == FormTemplateStatus.review;
  }

  bool get canArchive {
    return this == FormTemplateStatus.published;
  }

  bool get canUse {
    return this == FormTemplateStatus.published;
  }

  bool get isActive {
    return this == FormTemplateStatus.published;
  }
}

extension ConditionOperatorExtension on ConditionOperator {
  String get displayName {
    switch (this) {
      case ConditionOperator.equals:
        return 'Equals';
      case ConditionOperator.notEquals:
        return 'Not Equals';
      case ConditionOperator.greaterThan:
        return 'Greater Than';
      case ConditionOperator.greaterThanOrEqual:
        return 'Greater Than or Equal';
      case ConditionOperator.lessThan:
        return 'Less Than';
      case ConditionOperator.lessThanOrEqual:
        return 'Less Than or Equal';
      case ConditionOperator.contains:
        return 'Contains';
      case ConditionOperator.notContains:
        return 'Does Not Contain';
      case ConditionOperator.startsWith:
        return 'Starts With';
      case ConditionOperator.endsWith:
        return 'Ends With';
      case ConditionOperator.isEmpty:
        return 'Is Empty';
      case ConditionOperator.isNotEmpty:
        return 'Is Not Empty';
      case ConditionOperator.inList:
        return 'In List';
      case ConditionOperator.notInList:
        return 'Not In List';
    }
  }

  String get symbol {
    switch (this) {
      case ConditionOperator.equals:
        return '=';
      case ConditionOperator.notEquals:
        return '≠';
      case ConditionOperator.greaterThan:
        return '>';
      case ConditionOperator.greaterThanOrEqual:
        return '≥';
      case ConditionOperator.lessThan:
        return '<';
      case ConditionOperator.lessThanOrEqual:
        return '≤';
      case ConditionOperator.contains:
        return '⊃';
      case ConditionOperator.notContains:
        return '⊅';
      case ConditionOperator.startsWith:
        return '^';
      case ConditionOperator.endsWith:
        return '$';
      case ConditionOperator.isEmpty:
        return '∅';
      case ConditionOperator.isNotEmpty:
        return '≠∅';
      case ConditionOperator.inList:
        return '∈';
      case ConditionOperator.notInList:
        return '∉';
    }
  }

  bool evaluate(dynamic actualValue, dynamic expectedValue) {
    switch (this) {
      case ConditionOperator.equals:
        return actualValue == expectedValue;
      case ConditionOperator.notEquals:
        return actualValue != expectedValue;
      case ConditionOperator.greaterThan:
        if (actualValue is num && expectedValue is num) {
          return actualValue > expectedValue;
        }
        return false;
      case ConditionOperator.greaterThanOrEqual:
        if (actualValue is num && expectedValue is num) {
          return actualValue >= expectedValue;
        }
        return false;
      case ConditionOperator.lessThan:
        if (actualValue is num && expectedValue is num) {
          return actualValue < expectedValue;
        }
        return false;
      case ConditionOperator.lessThanOrEqual:
        if (actualValue is num && expectedValue is num) {
          return actualValue <= expectedValue;
        }
        return false;
      case ConditionOperator.contains:
        if (actualValue is String && expectedValue is String) {
          return actualValue.contains(expectedValue);
        }
        if (actualValue is List) {
          return actualValue.contains(expectedValue);
        }
        return false;
      case ConditionOperator.notContains:
        if (actualValue is String && expectedValue is String) {
          return !actualValue.contains(expectedValue);
        }
        if (actualValue is List) {
          return !actualValue.contains(expectedValue);
        }
        return true;
      case ConditionOperator.startsWith:
        if (actualValue is String && expectedValue is String) {
          return actualValue.startsWith(expectedValue);
        }
        return false;
      case ConditionOperator.endsWith:
        if (actualValue is String && expectedValue is String) {
          return actualValue.endsWith(expectedValue);
        }
        return false;
      case ConditionOperator.isEmpty:
        if (actualValue == null) return true;
        if (actualValue is String) return actualValue.isEmpty;
        if (actualValue is List) return actualValue.isEmpty;
        if (actualValue is Map) return actualValue.isEmpty;
        return false;
      case ConditionOperator.isNotEmpty:
        if (actualValue == null) return false;
        if (actualValue is String) return actualValue.isNotEmpty;
        if (actualValue is List) return actualValue.isNotEmpty;
        if (actualValue is Map) return actualValue.isNotEmpty;
        return true;
      case ConditionOperator.inList:
        if (expectedValue is List) {
          return expectedValue.contains(actualValue);
        }
        return false;
      case ConditionOperator.notInList:
        if (expectedValue is List) {
          return !expectedValue.contains(actualValue);
        }
        return true;
    }
  }
}

extension ScoringMethodExtension on ScoringMethod {
  String get displayName {
    switch (this) {
      case ScoringMethod.simple:
        return 'Simple';
      case ScoringMethod.weighted:
        return 'Weighted';
      case ScoringMethod.percentage:
        return 'Percentage';
      case ScoringMethod.custom:
        return 'Custom';
    }
  }

  String get description {
    switch (this) {
      case ScoringMethod.simple:
        return 'Simple point-based scoring';
      case ScoringMethod.weighted:
        return 'Weighted scoring with different question values';
      case ScoringMethod.percentage:
        return 'Percentage-based scoring';
      case ScoringMethod.custom:
        return 'Custom scoring algorithm';
    }
  }
}

extension FormTemplateExtension on FormTemplate {
  bool get canEdit => status.canEdit;
  bool get canPublish => status.canPublish;
  bool get canArchive => status.canArchive;
  bool get canUse => status.canUse;
  bool get isActive => status.isActive;
  
  int get totalQuestions {
    return sections.fold(0, (sum, section) => sum + section.questions.length);
  }
  
  int get requiredQuestions {
    return sections.fold(0, (sum, section) => 
      sum + section.questions.where((q) => q.isRequired).length);
  }
  
  int get totalSections => sections.length;
  
  int get visibleSections => sections.where((s) => s.isVisible).length;
  
  List<FormQuestion> get allQuestions {
    return sections.expand((section) => section.questions).toList();
  }
  
  List<FormQuestion> get requiredQuestionsList {
    return allQuestions.where((q) => q.isRequired).toList();
  }
  
  List<FormQuestion> get scoredQuestions {
    return allQuestions.where((q) => q.scoring != null).toList();
  }
  
  double get maxPossibleScore {
    if (scoring == null) return 0.0;
    return scoring!.maxScore;
  }
  
  bool get hasScoring => scoring != null;
  bool get hasRules => rules?.isNotEmpty == true;
  bool get hasSettings => settings != null;
  
  bool get requiresSignature => settings?.requireSignature == true;
  bool get requiresLocation => settings?.requireLocation == true;
  bool get requiresPhotos => settings?.requirePhotos == true;
  bool get allowsOfflineCompletion => settings?.allowOfflineCompletion == true;
  
  Duration? get timeLimit {
    if (settings?.timeLimit == null) return null;
    return Duration(minutes: settings!.timeLimit!);
  }
  
  bool get hasTimeLimit => timeLimit != null;
  
  String get categoryDisplayText => category ?? 'Uncategorized';
  
  String get versionDisplayText => 'v$version';
  
  String get statusDisplayText => status.displayName;
  
  Map<String, dynamic> toSummaryMap() {
    return {
      'id': id,
      'name': name,
      'version': versionDisplayText,
      'status': statusDisplayText,
      'category': categoryDisplayText,
      'totalQuestions': totalQuestions,
      'requiredQuestions': requiredQuestions,
      'totalSections': totalSections,
      'hasScoring': hasScoring,
      'maxScore': maxPossibleScore,
      'hasTimeLimit': hasTimeLimit,
      'timeLimit': timeLimit?.inMinutes,
      'requiresSignature': requiresSignature,
      'requiresLocation': requiresLocation,
      'allowsOffline': allowsOfflineCompletion,
      'createdAt': createdAt.toIso8601String(),
      'updatedAt': updatedAt.toIso8601String(),
      'publishedAt': publishedAt?.toIso8601String(),
    };
  }
}

extension FormSectionExtension on FormSection {
  int get questionCount => questions.length;
  int get requiredQuestionCount => questions.where((q) => q.isRequired).length;
  int get visibleQuestionCount => questions.where((q) => q.isVisible).length;
  
  List<FormQuestion> get requiredQuestions => questions.where((q) => q.isRequired).toList();
  List<FormQuestion> get visibleQuestions => questions.where((q) => q.isVisible).toList();
  List<FormQuestion> get scoredQuestions => questions.where((q) => q.scoring != null).toList();
  
  double get maxSectionScore {
    return scoredQuestions.fold(0.0, (sum, q) => sum + (q.scoring?.maxPoints ?? 0.0));
  }
  
  bool get hasCondition => condition != null;
  bool get hasRequiredQuestions => requiredQuestionCount > 0;
  bool get hasScoredQuestions => scoredQuestions.isNotEmpty;
}

extension FormQuestionExtension on FormQuestion {
  bool get hasValidation => validation != null;
  bool get hasOptions => options != null;
  bool get hasCondition => condition != null;
  bool get hasScoring => scoring != null;
  
  bool get supportsChoices {
    return type == QuestionType.singleChoice || type == QuestionType.multipleChoice;
  }
  
  bool get supportsRating => type == QuestionType.rating;
  bool get supportsText => type == QuestionType.text;
  bool get supportsNumber => type == QuestionType.number;
  bool get supportsDate => type == QuestionType.date || type == QuestionType.datetime;
  bool get supportsTime => type == QuestionType.time || type == QuestionType.datetime;
  bool get supportsBoolean => type == QuestionType.boolean;
  
  List<FormQuestionOption> get choiceOptions {
    if (!supportsChoices || options?.choices == null) return [];
    return options!.choices!;
  }
  
  List<FormQuestionOption> get enabledChoiceOptions {
    return choiceOptions.where((option) => option.isEnabled).toList();
  }
  
  FormQuestionOption? get defaultChoice {
    return choiceOptions.where((option) => option.isDefault).firstOrNull;
  }
  
  int get minRating => options?.minRating ?? 1;
  int get maxRating => options?.maxRating ?? 5;
  
  String get ratingLabel => options?.ratingLabel ?? 'Rating';
  
  List<String> get ratingLabels {
    if (options?.ratingLabels != null && options!.ratingLabels!.isNotEmpty) {
      return options!.ratingLabels!;
    }
    return List.generate(maxRating - minRating + 1, (index) => '${minRating + index}');
  }
  
  bool get allowsOther => options?.allowOther == true;
  String get otherLabel => options?.otherLabel ?? 'Other';
  
  int? get maxSelections => options?.maxSelections;
  bool get hasMaxSelections => maxSelections != null;
  
  String get dateFormat => options?.dateFormat ?? 'yyyy-MM-dd';
  String get timeFormat => options?.timeFormat ?? 'HH:mm';
  
  double get maxPoints => scoring?.maxPoints ?? 0.0;
  bool get isCritical => scoring?.isCritical == true;
  
  String get placeholderText => placeholder ?? _getDefaultPlaceholder();
  
  String _getDefaultPlaceholder() {
    switch (type) {
      case QuestionType.text:
        return 'Enter your answer...';
      case QuestionType.number:
        return 'Enter a number...';
      case QuestionType.date:
        return 'Select a date...';
      case QuestionType.time:
        return 'Select a time...';
      case QuestionType.datetime:
        return 'Select date and time...';
      default:
        return '';
    }
  }
  
  bool validateValue(dynamic value) {
    if (validation == null) return true;
    
    // Check required
    if (isRequired && (value == null || value.toString().isEmpty)) {
      return false;
    }
    
    if (value == null) return true; // Optional field with no value is valid
    
    final val = validation!;
    
    // Check min/max values for numbers
    if (type == QuestionType.number && value is num) {
      if (val.minValue != null && value < val.minValue) return false;
      if (val.maxValue != null && value > val.maxValue) return false;
    }
    
    // Check min/max length for text
    if (type == QuestionType.text && value is String) {
      if (val.minLength != null && value.length < val.minLength!) return false;
      if (val.maxLength != null && value.length > val.maxLength!) return false;
    }
    
    // Check pattern for text
    if (val.pattern != null && value is String) {
      final regex = RegExp(val.pattern!);
      if (!regex.hasMatch(value)) return false;
    }
    
    // Check allowed values
    if (val.allowedValues != null && !val.allowedValues!.contains(value.toString())) {
      return false;
    }
    
    // Check forbidden values
    if (val.forbiddenValues != null && val.forbiddenValues!.contains(value.toString())) {
      return false;
    }
    
    return true;
  }
  
  String? getValidationError(dynamic value) {
    if (validateValue(value)) return null;
    return validation?.errorMessage ?? 'Invalid value';
  }
}

extension FormQuestionConditionExtension on FormQuestionCondition {
  bool evaluate(Map<String, dynamic> responses) {
    final actualValue = responses[dependsOnQuestionId];
    bool result = operator.evaluate(actualValue, expectedValue);
    
    // Handle AND conditions
    if (andConditions != null) {
      for (final condition in andConditions!) {
        result = result && condition.evaluate(responses);
      }
    }
    
    // Handle OR conditions
    if (orConditions != null) {
      bool orResult = false;
      for (final condition in orConditions!) {
        orResult = orResult || condition.evaluate(responses);
      }
      result = result && orResult;
    }
    
    return result;
  }
}

extension FormSectionConditionExtension on FormSectionCondition {
  bool evaluate(Map<String, dynamic> responses) {
    final actualValue = responses[dependsOnQuestionId];
    bool result = operator.evaluate(actualValue, expectedValue);
    
    // Handle AND conditions
    if (andConditions != null) {
      for (final condition in andConditions!) {
        result = result && condition.evaluate(responses);
      }
    }
    
    // Handle OR conditions
    if (orConditions != null) {
      bool orResult = false;
      for (final condition in orConditions!) {
        orResult = orResult || condition.evaluate(responses);
      }
      result = result && orResult;
    }
    
    return result;
  }
}