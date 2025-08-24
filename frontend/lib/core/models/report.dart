import 'package:hive/hive.dart';
import 'package:freezed_annotation/freezed_annotation.dart';
import 'sync_status.dart';

part 'report.freezed.dart';
part 'report.g.dart';

@freezed
@HiveType(typeId: 24)
class Report with _$Report {
  const factory Report({
    @HiveField(0) required String id,
    @HiveField(1) required String title,
    @HiveField(2) String? description,
    @HiveField(3) required ReportType type,
    @HiveField(4) required ReportStatus status,
    @HiveField(5) required ReportParameters parameters,
    @HiveField(6) ReportData? data,
    @HiveField(7) String? filePath,
    @HiveField(8) String? fileUrl,
    @HiveField(9) ReportFormat? format,
    @HiveField(10) String? generatedBy,
    @HiveField(11) required DateTime createdAt,
    @HiveField(12) DateTime? generatedAt,
    @HiveField(13) DateTime? expiresAt,
    @HiveField(14) @Default(SyncStatus.pending) SyncStatus syncStatus,
    @HiveField(15) @Default({}) Map<String, dynamic> metadata,
    @HiveField(16) String? error,
  }) = _Report;

  factory Report.fromJson(Map<String, dynamic> json) => _$ReportFromJson(json);
}

@freezed
@HiveType(typeId: 25)
class ReportParameters with _$ReportParameters {
  const factory ReportParameters({
    @HiveField(0) DateTime? startDate,
    @HiveField(1) DateTime? endDate,
    @HiveField(2) @Default([]) List<String> folderIds,
    @HiveField(3) @Default([]) List<String> assetIds,
    @HiveField(4) @Default([]) List<String> inspectorIds,
    @HiveField(5) @Default([]) List<String> formTemplateIds,
    @HiveField(6) @Default([]) List<String> tags,
    @HiveField(7) @Default({}) Map<String, dynamic> filters,
    @HiveField(8) @Default(true) bool includePhotos,
    @HiveField(9) @Default(true) bool includeCharts,
    @HiveField(10) @Default(false) bool includeRawData,
    @HiveField(11) @Default('en') String language,
    @HiveField(12) @Default({}) Map<String, dynamic> customSettings,
  }) = _ReportParameters;

  factory ReportParameters.fromJson(Map<String, dynamic> json) => _$ReportParametersFromJson(json);
}

@freezed
@HiveType(typeId: 26)
class ReportData with _$ReportData {
  const factory ReportData({
    @HiveField(0) required ReportSummary summary,
    @HiveField(1) @Default([]) List<ReportSection> sections,
    @HiveField(2) @Default([]) List<ReportChart> charts,
    @HiveField(3) @Default([]) List<ReportTable> tables,
    @HiveField(4) @Default([]) List<String> photos,
    @HiveField(5) @Default([]) List<ReportRecommendation> recommendations,
    @HiveField(6) @Default({}) Map<String, dynamic> rawData,
  }) = _ReportData;

  factory ReportData.fromJson(Map<String, dynamic> json) => _$ReportDataFromJson(json);
}

@freezed
@HiveType(typeId: 27)
class ReportSummary with _$ReportSummary {
  const factory ReportSummary({
    @HiveField(0) required int totalInspections,
    @HiveField(1) required int totalAssets,
    @HiveField(2) required int totalDefects,
    @HiveField(3) required int criticalDefects,
    @HiveField(4) required int majorDefects,
    @HiveField(5) required int minorDefects,
    @HiveField(6) required double averageScore,
    @HiveField(7) required double complianceRate,
    @HiveField(8) DateTime? periodStart,
    @HiveField(9) DateTime? periodEnd,
    @HiveField(10) @Default({}) Map<String, int> statusBreakdown,
    @HiveField(11) @Default({}) Map<String, double> scoreDistribution,
  }) = _ReportSummary;

  factory ReportSummary.fromJson(Map<String, dynamic> json) => _$ReportSummaryFromJson(json);
}

@freezed
@HiveType(typeId: 28)
class ReportSection with _$ReportSection {
  const factory ReportSection({
    @HiveField(0) required String id,
    @HiveField(1) required String title,
    @HiveField(2) required String content,
    @HiveField(3) required int order,
    @HiveField(4) ReportSectionType? type,
    @HiveField(5) @Default([]) List<String> attachments,
    @HiveField(6) @Default({}) Map<String, dynamic> metadata,
  }) = _ReportSection;

  factory ReportSection.fromJson(Map<String, dynamic> json) => _$ReportSectionFromJson(json);
}

@freezed
@HiveType(typeId: 29)
class ReportChart with _$ReportChart {
  const factory ReportChart({
    @HiveField(0) required String id,
    @HiveField(1) required String title,
    @HiveField(2) required ChartType type,
    @HiveField(3) required Map<String, dynamic> data,
    @HiveField(4) @Default({}) Map<String, dynamic> options,
    @HiveField(5) String? description,
  }) = _ReportChart;

  factory ReportChart.fromJson(Map<String, dynamic> json) => _$ReportChartFromJson(json);
}

@freezed
@HiveType(typeId: 30)
class ReportTable with _$ReportTable {
  const factory ReportTable({
    @HiveField(0) required String id,
    @HiveField(1) required String title,
    @HiveField(2) required List<String> headers,
    @HiveField(3) required List<List<dynamic>> rows,
    @HiveField(4) String? description,
    @HiveField(5) @Default({}) Map<String, dynamic> formatting,
  }) = _ReportTable;

  factory ReportTable.fromJson(Map<String, dynamic> json) => _$ReportTableFromJson(json);
}

@freezed
@HiveType(typeId: 31)
class ReportRecommendation with _$ReportRecommendation {
  const factory ReportRecommendation({
    @HiveField(0) required String id,
    @HiveField(1) required String title,
    @HiveField(2) required String description,
    @HiveField(3) required RecommendationPriority priority,
    @HiveField(4) required RecommendationType type,
    @HiveField(5) @Default([]) List<String> relatedAssets,
    @HiveField(6) @Default([]) List<String> relatedInspections,
    @HiveField(7) String? estimatedCost,
    @HiveField(8) String? timeframe,
    @HiveField(9) @Default({}) Map<String, dynamic> metadata,
  }) = _ReportRecommendation;

  factory ReportRecommendation.fromJson(Map<String, dynamic> json) => _$ReportRecommendationFromJson(json);
}

@HiveType(typeId: 32)
enum ReportType {
  @HiveField(0)
  inspection,
  @HiveField(1)
  asset,
  @HiveField(2)
  compliance,
  @HiveField(3)
  performance,
  @HiveField(4)
  defect,
  @HiveField(5)
  trend,
  @HiveField(6)
  custom,
}

@HiveType(typeId: 33)
enum ReportStatus {
  @HiveField(0)
  pending,
  @HiveField(1)
  generating,
  @HiveField(2)
  completed,
  @HiveField(3)
  failed,
  @HiveField(4)
  expired,
}

@HiveType(typeId: 34)
enum ReportFormat {
  @HiveField(0)
  pdf,
  @HiveField(1)
  excel,
  @HiveField(2)
  csv,
  @HiveField(3)
  json,
  @HiveField(4)
  html,
}

@HiveType(typeId: 35)
enum ReportSectionType {
  @HiveField(0)
  summary,
  @HiveField(1)
  analysis,
  @HiveField(2)
  findings,
  @HiveField(3)
  recommendations,
  @HiveField(4)
  appendix,
}

@HiveType(typeId: 36)
enum ChartType {
  @HiveField(0)
  bar,
  @HiveField(1)
  line,
  @HiveField(2)
  pie,
  @HiveField(3)
  scatter,
  @HiveField(4)
  area,
  @HiveField(5)
  histogram,
  @HiveField(6)
  heatmap,
}

@HiveType(typeId: 37)
enum RecommendationPriority {
  @HiveField(0)
  low,
  @HiveField(1)
  medium,
  @HiveField(2)
  high,
  @HiveField(3)
  critical,
}

@HiveType(typeId: 38)
enum RecommendationType {
  @HiveField(0)
  maintenance,
  @HiveField(1)
  replacement,
  @HiveField(2)
  training,
  @HiveField(3)
  process,
  @HiveField(4)
  safety,
  @HiveField(5)
  compliance,
}

extension ReportTypeExtension on ReportType {
  String get displayName {
    switch (this) {
      case ReportType.inspection:
        return 'Inspection Report';
      case ReportType.asset:
        return 'Asset Report';
      case ReportType.compliance:
        return 'Compliance Report';
      case ReportType.performance:
        return 'Performance Report';
      case ReportType.defect:
        return 'Defect Analysis';
      case ReportType.trend:
        return 'Trend Analysis';
      case ReportType.custom:
        return 'Custom Report';
    }
  }
}

extension ReportStatusExtension on ReportStatus {
  String get displayName {
    switch (this) {
      case ReportStatus.pending:
        return 'Pending';
      case ReportStatus.generating:
        return 'Generating';
      case ReportStatus.completed:
        return 'Completed';
      case ReportStatus.failed:
        return 'Failed';
      case ReportStatus.expired:
        return 'Expired';
    }
  }

  bool get isProcessing {
    return this == ReportStatus.pending || this == ReportStatus.generating;
  }

  bool get isComplete {
    return this == ReportStatus.completed;
  }

  bool get hasError {
    return this == ReportStatus.failed;
  }
}

extension ReportFormatExtension on ReportFormat {
  String get displayName {
    switch (this) {
      case ReportFormat.pdf:
        return 'PDF';
      case ReportFormat.excel:
        return 'Excel';
      case ReportFormat.csv:
        return 'CSV';
      case ReportFormat.json:
        return 'JSON';
      case ReportFormat.html:
        return 'HTML';
    }
  }

  String get fileExtension {
    switch (this) {
      case ReportFormat.pdf:
        return '.pdf';
      case ReportFormat.excel:
        return '.xlsx';
      case ReportFormat.csv:
        return '.csv';
      case ReportFormat.json:
        return '.json';
      case ReportFormat.html:
        return '.html';
    }
  }

  String get mimeType {
    switch (this) {
      case ReportFormat.pdf:
        return 'application/pdf';
      case ReportFormat.excel:
        return 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
      case ReportFormat.csv:
        return 'text/csv';
      case ReportFormat.json:
        return 'application/json';
      case ReportFormat.html:
        return 'text/html';
    }
  }
}