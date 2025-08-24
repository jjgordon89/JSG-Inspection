import 'package:freezed_annotation/freezed_annotation.dart';
import 'inspection.dart';
import 'asset.dart';
import 'folder.dart';

part 'report.freezed.dart';
part 'report.g.dart';

@freezed
class Report with _$Report {
  const factory Report({
    required String id,
    required String name,
    String? description,
    required ReportType type,
    required ReportStatus status,
    required ReportFormat format,
    ReportConfiguration? configuration,
    ReportData? data,
    ReportMetadata? metadata,
    String? templateId,
    String? folderId,
    List<String>? assetIds,
    List<String>? inspectionIds,
    String? generatedById,
    String? requestedById,
    required DateTime createdAt,
    required DateTime updatedAt,
    DateTime? generatedAt,
    DateTime? scheduledAt,
    DateTime? expiresAt,
    String? filePath,
    String? downloadUrl,
    int? fileSize,
    Map<String, dynamic>? customData,
  }) = _Report;

  factory Report.fromJson(Map<String, dynamic> json) => _$ReportFromJson(json);
}

@freezed
class ReportConfiguration with _$ReportConfiguration {
  const factory ReportConfiguration({
    required DateRange dateRange,
    List<String>? folderIds,
    List<String>? assetIds,
    List<String>? inspectionIds,
    List<String>? formTemplateIds,
    List<InspectionStatus>? inspectionStatuses,
    List<AssetStatus>? assetStatuses,
    List<InspectionPriority>? priorities,
    List<String>? inspectorIds,
    List<String>? tags,
    ReportFilters? filters,
    ReportGrouping? grouping,
    ReportSorting? sorting,
    ReportOptions? options,
    Map<String, dynamic>? customFilters,
  }) = _ReportConfiguration;

  factory ReportConfiguration.fromJson(Map<String, dynamic> json) => _$ReportConfigurationFromJson(json);
}

@freezed
class DateRange with _$DateRange {
  const factory DateRange({
    required DateTime startDate,
    required DateTime endDate,
    DateRangeType? type,
    String? customLabel,
  }) = _DateRange;

  factory DateRange.fromJson(Map<String, dynamic> json) => _$DateRangeFromJson(json);
}

@freezed
class ReportFilters with _$ReportFilters {
  const factory ReportFilters({
    double? minScore,
    double? maxScore,
    @Default(false) bool includeIncomplete,
    @Default(false) bool includeDrafts,
    @Default(false) bool includeArchived,
    @Default(false) bool criticalIssuesOnly,
    @Default(false) bool overdueOnly,
    List<String>? excludeAssetTypes,
    List<String>? includeAssetTypes,
    Map<String, dynamic>? customFilters,
  }) = _ReportFilters;

  factory ReportFilters.fromJson(Map<String, dynamic> json) => _$ReportFiltersFromJson(json);
}

@freezed
class ReportGrouping with _$ReportGrouping {
  const factory ReportGrouping({
    required ReportGroupBy groupBy,
    ReportGroupBy? secondaryGroupBy,
    @Default(false) bool includeSubgroups,
    @Default(true) bool showGroupSummary,
  }) = _ReportGrouping;

  factory ReportGrouping.fromJson(Map<String, dynamic> json) => _$ReportGroupingFromJson(json);
}

@freezed
class ReportSorting with _$ReportSorting {
  const factory ReportSorting({
    required ReportSortBy sortBy,
    @Default(SortOrder.descending) SortOrder order,
    ReportSortBy? secondarySortBy,
    SortOrder? secondaryOrder,
  }) = _ReportSorting;

  factory ReportSorting.fromJson(Map<String, dynamic> json) => _$ReportSortingFromJson(json);
}

@freezed
class ReportOptions with _$ReportOptions {
  const factory ReportOptions({
    @Default(true) bool includePhotos,
    @Default(true) bool includeCharts,
    @Default(true) bool includeSummary,
    @Default(true) bool includeDetails,
    @Default(false) bool includeRawData,
    @Default(false) bool includeSignatures,
    @Default(true) bool includeTimestamps,
    @Default(true) bool includeInspectorInfo,
    @Default(false) bool includeGpsCoordinates,
    @Default(false) bool includeWeatherData,
    @Default(true) bool compressImages,
    ImageQuality? imageQuality,
    String? logoUrl,
    String? headerText,
    String? footerText,
    Map<String, dynamic>? customOptions,
  }) = _ReportOptions;

  factory ReportOptions.fromJson(Map<String, dynamic> json) => _$ReportOptionsFromJson(json);
}

@freezed
class ReportData with _$ReportData {
  const factory ReportData({
    ReportSummary? summary,
    List<ReportSection>? sections,
    List<ReportChart>? charts,
    List<ReportTable>? tables,
    Map<String, dynamic>? rawData,
    List<String>? attachments,
  }) = _ReportData;

  factory ReportData.fromJson(Map<String, dynamic> json) => _$ReportDataFromJson(json);
}

@freezed
class ReportSummary with _$ReportSummary {
  const factory ReportSummary({
    required int totalInspections,
    required int completedInspections,
    required int pendingInspections,
    required int overdueInspections,
    required int totalAssets,
    required int inspectedAssets,
    required int criticalIssues,
    required double averageScore,
    required double completionRate,
    Map<String, int>? inspectionsByStatus,
    Map<String, int>? inspectionsByPriority,
    Map<String, int>? assetsByStatus,
    Map<String, double>? scoresByCategory,
    Map<String, int>? issuesByType,
    List<ReportTrend>? trends,
    DateTime? reportPeriodStart,
    DateTime? reportPeriodEnd,
  }) = _ReportSummary;

  factory ReportSummary.fromJson(Map<String, dynamic> json) => _$ReportSummaryFromJson(json);
}

@freezed
class ReportSection with _$ReportSection {
  const factory ReportSection({
    required String id,
    required String title,
    String? description,
    required ReportSectionType type,
    required int order,
    dynamic content,
    Map<String, dynamic>? metadata,
  }) = _ReportSection;

  factory ReportSection.fromJson(Map<String, dynamic> json) => _$ReportSectionFromJson(json);
}

@freezed
class ReportChart with _$ReportChart {
  const factory ReportChart({
    required String id,
    required String title,
    String? description,
    required ChartType type,
    required List<ChartDataSeries> data,
    ChartOptions? options,
    Map<String, dynamic>? metadata,
  }) = _ReportChart;

  factory ReportChart.fromJson(Map<String, dynamic> json) => _$ReportChartFromJson(json);
}

@freezed
class ChartDataSeries with _$ChartDataSeries {
  const factory ChartDataSeries({
    required String name,
    required List<ChartDataPoint> data,
    String? color,
    ChartSeriesType? type,
  }) = _ChartDataSeries;

  factory ChartDataSeries.fromJson(Map<String, dynamic> json) => _$ChartDataSeriesFromJson(json);
}

@freezed
class ChartDataPoint with _$ChartDataPoint {
  const factory ChartDataPoint({
    required String label,
    required double value,
    String? color,
    Map<String, dynamic>? metadata,
  }) = _ChartDataPoint;

  factory ChartDataPoint.fromJson(Map<String, dynamic> json) => _$ChartDataPointFromJson(json);
}

@freezed
class ChartOptions with _$ChartOptions {
  const factory ChartOptions({
    @Default(true) bool showLegend,
    @Default(true) bool showLabels,
    @Default(true) bool showValues,
    @Default(false) bool showGrid,
    @Default(false) bool animate,
    String? xAxisLabel,
    String? yAxisLabel,
    List<String>? colors,
    Map<String, dynamic>? customOptions,
  }) = _ChartOptions;

  factory ChartOptions.fromJson(Map<String, dynamic> json) => _$ChartOptionsFromJson(json);
}

@freezed
class ReportTable with _$ReportTable {
  const factory ReportTable({
    required String id,
    required String title,
    String? description,
    required List<ReportTableColumn> columns,
    required List<Map<String, dynamic>> rows,
    ReportTableOptions? options,
  }) = _ReportTable;

  factory ReportTable.fromJson(Map<String, dynamic> json) => _$ReportTableFromJson(json);
}

@freezed
class ReportTableColumn with _$ReportTableColumn {
  const factory ReportTableColumn({
    required String key,
    required String title,
    required ColumnType type,
    @Default(true) bool sortable,
    @Default(true) bool visible,
    String? format,
    int? width,
  }) = _ReportTableColumn;

  factory ReportTableColumn.fromJson(Map<String, dynamic> json) => _$ReportTableColumnFromJson(json);
}

@freezed
class ReportTableOptions with _$ReportTableOptions {
  const factory ReportTableOptions({
    @Default(true) bool showHeader,
    @Default(false) bool showFooter,
    @Default(true) bool allowSorting,
    @Default(false) bool allowFiltering,
    @Default(false) bool showRowNumbers,
    @Default(false) bool alternateRowColors,
    int? maxRows,
  }) = _ReportTableOptions;

  factory ReportTableOptions.fromJson(Map<String, dynamic> json) => _$ReportTableOptionsFromJson(json);
}

@freezed
class ReportTrend with _$ReportTrend {
  const factory ReportTrend({
    required String metric,
    required double currentValue,
    required double previousValue,
    required double changeValue,
    required double changePercentage,
    required TrendDirection direction,
    String? period,
    String? unit,
  }) = _ReportTrend;

  factory ReportTrend.fromJson(Map<String, dynamic> json) => _$ReportTrendFromJson(json);
}

@freezed
class ReportMetadata with _$ReportMetadata {
  const factory ReportMetadata({
    String? version,
    String? generatorVersion,
    Duration? generationTime,
    int? totalRecords,
    int? filteredRecords,
    Map<String, String>? parameters,
    List<String>? warnings,
    List<String>? errors,
    Map<String, dynamic>? statistics,
  }) = _ReportMetadata;

  factory ReportMetadata.fromJson(Map<String, dynamic> json) => _$ReportMetadataFromJson(json);
}

@freezed
class ReportTemplate with _$ReportTemplate {
  const factory ReportTemplate({
    required String id,
    required String name,
    String? description,
    required ReportType type,
    required ReportFormat format,
    ReportConfiguration? defaultConfiguration,
    List<ReportTemplateSection>? sections,
    String? createdById,
    required DateTime createdAt,
    required DateTime updatedAt,
    @Default(true) bool isActive,
    Map<String, dynamic>? metadata,
  }) = _ReportTemplate;

  factory ReportTemplate.fromJson(Map<String, dynamic> json) => _$ReportTemplateFromJson(json);
}

@freezed
class ReportTemplateSection with _$ReportTemplateSection {
  const factory ReportTemplateSection({
    required String id,
    required String title,
    String? description,
    required ReportSectionType type,
    required int order,
    @Default(true) bool isRequired,
    @Default(true) bool isVisible,
    Map<String, dynamic>? configuration,
  }) = _ReportTemplateSection;

  factory ReportTemplateSection.fromJson(Map<String, dynamic> json) => _$ReportTemplateSectionFromJson(json);
}

enum ReportType {
  @JsonValue('inspection_summary')
  inspectionSummary,
  @JsonValue('asset_report')
  assetReport,
  @JsonValue('compliance_report')
  complianceReport,
  @JsonValue('performance_dashboard')
  performanceDashboard,
  @JsonValue('trend_analysis')
  trendAnalysis,
  @JsonValue('custom_report')
  customReport,
  @JsonValue('scheduled_report')
  scheduledReport,
  @JsonValue('audit_trail')
  auditTrail,
}

enum ReportStatus {
  @JsonValue('pending')
  pending,
  @JsonValue('generating')
  generating,
  @JsonValue('completed')
  completed,
  @JsonValue('failed')
  failed,
  @JsonValue('cancelled')
  cancelled,
  @JsonValue('expired')
  expired,
}

enum ReportFormat {
  @JsonValue('pdf')
  pdf,
  @JsonValue('excel')
  excel,
  @JsonValue('csv')
  csv,
  @JsonValue('json')
  json,
  @JsonValue('html')
  html,
  @JsonValue('word')
  word,
}

enum DateRangeType {
  @JsonValue('today')
  today,
  @JsonValue('yesterday')
  yesterday,
  @JsonValue('this_week')
  thisWeek,
  @JsonValue('last_week')
  lastWeek,
  @JsonValue('this_month')
  thisMonth,
  @JsonValue('last_month')
  lastMonth,
  @JsonValue('this_quarter')
  thisQuarter,
  @JsonValue('last_quarter')
  lastQuarter,
  @JsonValue('this_year')
  thisYear,
  @JsonValue('last_year')
  lastYear,
  @JsonValue('last_7_days')
  last7Days,
  @JsonValue('last_30_days')
  last30Days,
  @JsonValue('last_90_days')
  last90Days,
  @JsonValue('custom')
  custom,
}

enum ReportGroupBy {
  @JsonValue('none')
  none,
  @JsonValue('folder')
  folder,
  @JsonValue('asset')
  asset,
  @JsonValue('inspector')
  inspector,
  @JsonValue('form_template')
  formTemplate,
  @JsonValue('status')
  status,
  @JsonValue('priority')
  priority,
  @JsonValue('date')
  date,
  @JsonValue('week')
  week,
  @JsonValue('month')
  month,
  @JsonValue('quarter')
  quarter,
  @JsonValue('year')
  year,
}

enum ReportSortBy {
  @JsonValue('name')
  name,
  @JsonValue('date')
  date,
  @JsonValue('score')
  score,
  @JsonValue('status')
  status,
  @JsonValue('priority')
  priority,
  @JsonValue('inspector')
  inspector,
  @JsonValue('asset')
  asset,
  @JsonValue('folder')
  folder,
}

enum SortOrder {
  @JsonValue('ascending')
  ascending,
  @JsonValue('descending')
  descending,
}

enum ImageQuality {
  @JsonValue('low')
  low,
  @JsonValue('medium')
  medium,
  @JsonValue('high')
  high,
  @JsonValue('original')
  original,
}

enum ReportSectionType {
  @JsonValue('summary')
  summary,
  @JsonValue('chart')
  chart,
  @JsonValue('table')
  table,
  @JsonValue('text')
  text,
  @JsonValue('image')
  image,
  @JsonValue('inspection_details')
  inspectionDetails,
  @JsonValue('asset_details')
  assetDetails,
  @JsonValue('custom')
  custom,
}

enum ChartType {
  @JsonValue('bar')
  bar,
  @JsonValue('line')
  line,
  @JsonValue('pie')
  pie,
  @JsonValue('doughnut')
  doughnut,
  @JsonValue('area')
  area,
  @JsonValue('scatter')
  scatter,
  @JsonValue('radar')
  radar,
  @JsonValue('gauge')
  gauge,
}

enum ChartSeriesType {
  @JsonValue('bar')
  bar,
  @JsonValue('line')
  line,
  @JsonValue('area')
  area,
  @JsonValue('scatter')
  scatter,
}

enum ColumnType {
  @JsonValue('text')
  text,
  @JsonValue('number')
  number,
  @JsonValue('date')
  date,
  @JsonValue('boolean')
  boolean,
  @JsonValue('image')
  image,
  @JsonValue('link')
  link,
}

enum TrendDirection {
  @JsonValue('up')
  up,
  @JsonValue('down')
  down,
  @JsonValue('stable')
  stable,
}

// Extensions
extension ReportTypeExtension on ReportType {
  String get displayName {
    switch (this) {
      case ReportType.inspectionSummary:
        return 'Inspection Summary';
      case ReportType.assetReport:
        return 'Asset Report';
      case ReportType.complianceReport:
        return 'Compliance Report';
      case ReportType.performanceDashboard:
        return 'Performance Dashboard';
      case ReportType.trendAnalysis:
        return 'Trend Analysis';
      case ReportType.customReport:
        return 'Custom Report';
      case ReportType.scheduledReport:
        return 'Scheduled Report';
      case ReportType.auditTrail:
        return 'Audit Trail';
    }
  }

  String get description {
    switch (this) {
      case ReportType.inspectionSummary:
        return 'Summary of inspection activities and results';
      case ReportType.assetReport:
        return 'Detailed report on asset status and history';
      case ReportType.complianceReport:
        return 'Compliance status and regulatory requirements';
      case ReportType.performanceDashboard:
        return 'Performance metrics and KPIs';
      case ReportType.trendAnalysis:
        return 'Trend analysis and historical comparisons';
      case ReportType.customReport:
        return 'Custom report with user-defined parameters';
      case ReportType.scheduledReport:
        return 'Automatically generated scheduled report';
      case ReportType.auditTrail:
        return 'Audit trail of system activities';
    }
  }

  String get icon {
    switch (this) {
      case ReportType.inspectionSummary:
        return 'assignment';
      case ReportType.assetReport:
        return 'inventory';
      case ReportType.complianceReport:
        return 'verified';
      case ReportType.performanceDashboard:
        return 'dashboard';
      case ReportType.trendAnalysis:
        return 'trending_up';
      case ReportType.customReport:
        return 'build';
      case ReportType.scheduledReport:
        return 'schedule';
      case ReportType.auditTrail:
        return 'history';
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
      case ReportStatus.cancelled:
        return 'Cancelled';
      case ReportStatus.expired:
        return 'Expired';
    }
  }

  String get color {
    switch (this) {
      case ReportStatus.pending:
        return '#FF9800'; // Orange
      case ReportStatus.generating:
        return '#2196F3'; // Blue
      case ReportStatus.completed:
        return '#4CAF50'; // Green
      case ReportStatus.failed:
        return '#F44336'; // Red
      case ReportStatus.cancelled:
        return '#757575'; // Grey
      case ReportStatus.expired:
        return '#795548'; // Brown
    }
  }

  bool get isInProgress => this == ReportStatus.generating;
  bool get isCompleted => this == ReportStatus.completed;
  bool get isFailed => this == ReportStatus.failed;
  bool get canDownload => this == ReportStatus.completed;
  bool get canCancel => this == ReportStatus.pending || this == ReportStatus.generating;
  bool get canRetry => this == ReportStatus.failed;
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
      case ReportFormat.word:
        return 'Word';
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
      case ReportFormat.word:
        return '.docx';
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
      case ReportFormat.word:
        return 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
    }
  }

  String get icon {
    switch (this) {
      case ReportFormat.pdf:
        return 'picture_as_pdf';
      case ReportFormat.excel:
        return 'table_chart';
      case ReportFormat.csv:
        return 'grid_on';
      case ReportFormat.json:
        return 'code';
      case ReportFormat.html:
        return 'web';
      case ReportFormat.word:
        return 'description';
    }
  }
}

extension DateRangeTypeExtension on DateRangeType {
  String get displayName {
    switch (this) {
      case DateRangeType.today:
        return 'Today';
      case DateRangeType.yesterday:
        return 'Yesterday';
      case DateRangeType.thisWeek:
        return 'This Week';
      case DateRangeType.lastWeek:
        return 'Last Week';
      case DateRangeType.thisMonth:
        return 'This Month';
      case DateRangeType.lastMonth:
        return 'Last Month';
      case DateRangeType.thisQuarter:
        return 'This Quarter';
      case DateRangeType.lastQuarter:
        return 'Last Quarter';
      case DateRangeType.thisYear:
        return 'This Year';
      case DateRangeType.lastYear:
        return 'Last Year';
      case DateRangeType.last7Days:
        return 'Last 7 Days';
      case DateRangeType.last30Days:
        return 'Last 30 Days';
      case DateRangeType.last90Days:
        return 'Last 90 Days';
      case DateRangeType.custom:
        return 'Custom Range';
    }
  }

  DateRange toDateRange() {
    final now = DateTime.now();
    final today = DateTime(now.year, now.month, now.day);
    
    switch (this) {
      case DateRangeType.today:
        return DateRange(
          startDate: today,
          endDate: today.add(const Duration(days: 1)).subtract(const Duration(microseconds: 1)),
          type: this,
        );
      case DateRangeType.yesterday:
        final yesterday = today.subtract(const Duration(days: 1));
        return DateRange(
          startDate: yesterday,
          endDate: yesterday.add(const Duration(days: 1)).subtract(const Duration(microseconds: 1)),
          type: this,
        );
      case DateRangeType.thisWeek:
        final startOfWeek = today.subtract(Duration(days: today.weekday - 1));
        return DateRange(
          startDate: startOfWeek,
          endDate: startOfWeek.add(const Duration(days: 7)).subtract(const Duration(microseconds: 1)),
          type: this,
        );
      case DateRangeType.lastWeek:
        final startOfLastWeek = today.subtract(Duration(days: today.weekday + 6));
        return DateRange(
          startDate: startOfLastWeek,
          endDate: startOfLastWeek.add(const Duration(days: 7)).subtract(const Duration(microseconds: 1)),
          type: this,
        );
      case DateRangeType.thisMonth:
        final startOfMonth = DateTime(now.year, now.month, 1);
        final endOfMonth = DateTime(now.year, now.month + 1, 1).subtract(const Duration(microseconds: 1));
        return DateRange(
          startDate: startOfMonth,
          endDate: endOfMonth,
          type: this,
        );
      case DateRangeType.lastMonth:
        final startOfLastMonth = DateTime(now.year, now.month - 1, 1);
        final endOfLastMonth = DateTime(now.year, now.month, 1).subtract(const Duration(microseconds: 1));
        return DateRange(
          startDate: startOfLastMonth,
          endDate: endOfLastMonth,
          type: this,
        );
      case DateRangeType.thisQuarter:
        final quarterStart = DateTime(now.year, ((now.month - 1) ~/ 3) * 3 + 1, 1);
        final quarterEnd = DateTime(now.year, quarterStart.month + 3, 1).subtract(const Duration(microseconds: 1));
        return DateRange(
          startDate: quarterStart,
          endDate: quarterEnd,
          type: this,
        );
      case DateRangeType.lastQuarter:
        final lastQuarterStart = DateTime(now.year, ((now.month - 1) ~/ 3) * 3 - 2, 1);
        final lastQuarterEnd = DateTime(now.year, lastQuarterStart.month + 3, 1).subtract(const Duration(microseconds: 1));
        return DateRange(
          startDate: lastQuarterStart,
          endDate: lastQuarterEnd,
          type: this,
        );
      case DateRangeType.thisYear:
        final startOfYear = DateTime(now.year, 1, 1);
        final endOfYear = DateTime(now.year + 1, 1, 1).subtract(const Duration(microseconds: 1));
        return DateRange(
          startDate: startOfYear,
          endDate: endOfYear,
          type: this,
        );
      case DateRangeType.lastYear:
        final startOfLastYear = DateTime(now.year - 1, 1, 1);
        final endOfLastYear = DateTime(now.year, 1, 1).subtract(const Duration(microseconds: 1));
        return DateRange(
          startDate: startOfLastYear,
          endDate: endOfLastYear,
          type: this,
        );
      case DateRangeType.last7Days:
        return DateRange(
          startDate: today.subtract(const Duration(days: 7)),
          endDate: today.add(const Duration(days: 1)).subtract(const Duration(microseconds: 1)),
          type: this,
        );
      case DateRangeType.last30Days:
        return DateRange(
          startDate: today.subtract(const Duration(days: 30)),
          endDate: today.add(const Duration(days: 1)).subtract(const Duration(microseconds: 1)),
          type: this,
        );
      case DateRangeType.last90Days:
        return DateRange(
          startDate: today.subtract(const Duration(days: 90)),
          endDate: today.add(const Duration(days: 1)).subtract(const Duration(microseconds: 1)),
          type: this,
        );
      case DateRangeType.custom:
        return DateRange(
          startDate: today,
          endDate: today.add(const Duration(days: 1)).subtract(const Duration(microseconds: 1)),
          type: this,
        );
    }
  }
}

extension TrendDirectionExtension on TrendDirection {
  String get displayName {
    switch (this) {
      case TrendDirection.up:
        return 'Increasing';
      case TrendDirection.down:
        return 'Decreasing';
      case TrendDirection.stable:
        return 'Stable';
    }
  }

  String get icon {
    switch (this) {
      case TrendDirection.up:
        return 'trending_up';
      case TrendDirection.down:
        return 'trending_down';
      case TrendDirection.stable:
        return 'trending_flat';
    }
  }

  String get color {
    switch (this) {
      case TrendDirection.up:
        return '#4CAF50'; // Green
      case TrendDirection.down:
        return '#F44336'; // Red
      case TrendDirection.stable:
        return '#FF9800'; // Orange
    }
  }

  bool get isPositive => this == TrendDirection.up;
  bool get isNegative => this == TrendDirection.down;
  bool get isNeutral => this == TrendDirection.stable;
}

// Report Extensions
extension ReportExtension on Report {
  bool get isCompleted => status == ReportStatus.completed;
  bool get isGenerating => status == ReportStatus.generating;
  bool get isFailed => status == ReportStatus.failed;
  bool get canDownload => status.canDownload && filePath != null;
  bool get canCancel => status.canCancel;
  bool get canRetry => status.canRetry;
  
  String get typeDisplayName => type.displayName;
  String get statusDisplayName => status.displayName;
  String get formatDisplayName => format.displayName;
  
  String get fileName {
    final timestamp = (generatedAt ?? createdAt).millisecondsSinceEpoch;
    return '${name.replaceAll(' ', '_')}_$timestamp${format.fileExtension}';
  }
  
  String get fileSizeFormatted {
    if (fileSize == null) return 'Unknown';
    
    const units = ['B', 'KB', 'MB', 'GB'];
    double size = fileSize!.toDouble();
    int unitIndex = 0;
    
    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024;
      unitIndex++;
    }
    
    return '${size.toStringAsFixed(1)} ${units[unitIndex]}';
  }
  
  Duration? get generationDuration {
    if (generatedAt == null) return null;
    return generatedAt!.difference(createdAt);
  }
  
  String? get generationDurationFormatted {
    final duration = generationDuration;
    if (duration == null) return null;
    
    if (duration.inHours > 0) {
      return '${duration.inHours}h ${duration.inMinutes % 60}m';
    } else if (duration.inMinutes > 0) {
      return '${duration.inMinutes}m ${duration.inSeconds % 60}s';
    } else {
      return '${duration.inSeconds}s';
    }
  }
  
  bool get isExpired {
    if (expiresAt == null) return false;
    return DateTime.now().isAfter(expiresAt!);
  }
  
  Duration? get timeUntilExpiry {
    if (expiresAt == null) return null;
    final now = DateTime.now();
    if (now.isAfter(expiresAt!)) return null;
    return expiresAt!.difference(now);
  }
  
  bool get hasData => data != null;
  bool get hasSummary => data?.summary != null;
  bool get hasCharts => data?.charts?.isNotEmpty == true;
  bool get hasTables => data?.tables?.isNotEmpty == true;
  bool get hasAttachments => data?.attachments?.isNotEmpty == true;
  
  int get totalInspections => data?.summary?.totalInspections ?? 0;
  int get totalAssets => data?.summary?.totalAssets ?? 0;
  double get averageScore => data?.summary?.averageScore ?? 0.0;
  double get completionRate => data?.summary?.completionRate ?? 0.0;
  
  Map<String, dynamic> toSummaryMap() {
    return {
      'id': id,
      'name': name,
      'type': typeDisplayName,
      'status': statusDisplayName,
      'format': formatDisplayName,
      'fileSize': fileSizeFormatted,
      'totalInspections': totalInspections,
      'totalAssets': totalAssets,
      'averageScore': averageScore,
      'completionRate': completionRate,
      'generationDuration': generationDurationFormatted,
      'createdAt': createdAt.toIso8601String(),
      'generatedAt': generatedAt?.toIso8601String(),
      'expiresAt': expiresAt?.toIso8601String(),
    };
  }
}

extension DateRangeExtension on DateRange {
  Duration get duration => endDate.difference(startDate);
  
  int get durationInDays => duration.inDays;
  
  bool get isToday {
    final now = DateTime.now();
    final today = DateTime(now.year, now.month, now.day);
    final tomorrow = today.add(const Duration(days: 1));
    
    return startDate.isAtSameMomentAs(today) && 
           endDate.isBefore(tomorrow);
  }
  
  bool get isValid => startDate.isBefore(endDate);
  
  bool contains(DateTime date) {
    return date.isAfter(startDate) && date.isBefore(endDate) ||
           date.isAtSameMomentAs(startDate) || date.isAtSameMomentAs(endDate);
  }
  
  String get displayText {
    if (type != null) {
      return type!.displayName;
    }
    
    if (customLabel != null) {
      return customLabel!;
    }
    
    final formatter = DateFormat('MMM d, yyyy');
    return '${formatter.format(startDate)} - ${formatter.format(endDate)}';
  }
}

extension ReportTrendExtension on ReportTrend {
  String get changeText {
    final sign = changeValue >= 0 ? '+' : '';
    final value = changeValue.toStringAsFixed(2);
    final percentage = changePercentage.toStringAsFixed(1);
    return '$sign$value ($sign$percentage%)';
  }
  
  String get directionIcon => direction.icon;
  String get directionColor => direction.color;
  
  bool get isImprovement {
    // This would depend on the metric - some metrics are better when they go up,
    // others when they go down. This is a simplified implementation.
    switch (metric.toLowerCase()) {
      case 'score':
      case 'completion_rate':
      case 'efficiency':
        return direction == TrendDirection.up;
      case 'issues':
      case 'defects':
      case 'overdue':
        return direction == TrendDirection.down;
      default:
        return direction == TrendDirection.up;
    }
  }
}