import 'package:freezed_annotation/freezed_annotation.dart';

part 'asset.freezed.dart';
part 'asset.g.dart';

@freezed
class Asset with _$Asset {
  const factory Asset({
    required String id,
    required String name,
    String? description,
    required String assetNumber,
    String? serialNumber,
    String? model,
    String? manufacturer,
    String? category,
    String? subCategory,
    required AssetStatus status,
    AssetPriority? priority,
    String? location,
    String? building,
    String? floor,
    String? room,
    Map<String, dynamic>? gpsCoordinates,
    String? qrCode,
    String? barcode,
    String? rfidTag,
    List<String>? tags,
    String? ownerId,
    String? assignedToId,
    String? departmentId,
    DateTime? purchaseDate,
    DateTime? warrantyExpiry,
    DateTime? lastInspectionDate,
    DateTime? nextInspectionDate,
    String? inspectionFrequency,
    List<AssetDocument>? documents,
    List<AssetPhoto>? photos,
    Map<String, dynamic>? specifications,
    Map<String, dynamic>? customFields,
    AssetMaintenanceInfo? maintenanceInfo,
    AssetComplianceInfo? complianceInfo,
    required DateTime createdAt,
    required DateTime updatedAt,
    Map<String, dynamic>? metadata,
  }) = _Asset;

  factory Asset.fromJson(Map<String, dynamic> json) => _$AssetFromJson(json);
}

@freezed
class AssetDocument with _$AssetDocument {
  const factory AssetDocument({
    required String id,
    required String assetId,
    required String name,
    required String filePath,
    String? description,
    required AssetDocumentType type,
    String? mimeType,
    int? fileSize,
    String? version,
    DateTime? expiryDate,
    required DateTime uploadedAt,
    String? uploadedById,
    @Default(false) bool isUploaded,
    Map<String, dynamic>? metadata,
  }) = _AssetDocument;

  factory AssetDocument.fromJson(Map<String, dynamic> json) => _$AssetDocumentFromJson(json);
}

@freezed
class AssetPhoto with _$AssetPhoto {
  const factory AssetPhoto({
    required String id,
    required String assetId,
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
    @Default(false) bool isPrimary,
    Map<String, dynamic>? aiAnalysis,
  }) = _AssetPhoto;

  factory AssetPhoto.fromJson(Map<String, dynamic> json) => _$AssetPhotoFromJson(json);
}

@freezed
class AssetMaintenanceInfo with _$AssetMaintenanceInfo {
  const factory AssetMaintenanceInfo({
    DateTime? lastMaintenanceDate,
    DateTime? nextMaintenanceDate,
    String? maintenanceFrequency,
    String? maintenanceProvider,
    String? maintenanceContract,
    List<String>? maintenanceHistory,
    double? maintenanceCost,
    String? maintenanceNotes,
    AssetMaintenanceStatus? status,
  }) = _AssetMaintenanceInfo;

  factory AssetMaintenanceInfo.fromJson(Map<String, dynamic> json) => _$AssetMaintenanceInfoFromJson(json);
}

@freezed
class AssetComplianceInfo with _$AssetComplianceInfo {
  const factory AssetComplianceInfo({
    List<String>? certifications,
    List<String>? regulations,
    DateTime? lastComplianceCheck,
    DateTime? nextComplianceCheck,
    AssetComplianceStatus? status,
    List<String>? complianceIssues,
    String? complianceNotes,
  }) = _AssetComplianceInfo;

  factory AssetComplianceInfo.fromJson(Map<String, dynamic> json) => _$AssetComplianceInfoFromJson(json);
}

enum AssetStatus {
  @JsonValue('active')
  active,
  @JsonValue('inactive')
  inactive,
  @JsonValue('maintenance')
  maintenance,
  @JsonValue('retired')
  retired,
  @JsonValue('disposed')
  disposed,
  @JsonValue('lost')
  lost,
  @JsonValue('stolen')
  stolen,
  @JsonValue('damaged')
  damaged,
}

enum AssetPriority {
  @JsonValue('low')
  low,
  @JsonValue('medium')
  medium,
  @JsonValue('high')
  high,
  @JsonValue('critical')
  critical,
}

enum AssetDocumentType {
  @JsonValue('manual')
  manual,
  @JsonValue('warranty')
  warranty,
  @JsonValue('certificate')
  certificate,
  @JsonValue('specification')
  specification,
  @JsonValue('drawing')
  drawing,
  @JsonValue('photo')
  photo,
  @JsonValue('report')
  report,
  @JsonValue('other')
  other,
}

enum AssetMaintenanceStatus {
  @JsonValue('up_to_date')
  upToDate,
  @JsonValue('due_soon')
  dueSoon,
  @JsonValue('overdue')
  overdue,
  @JsonValue('in_progress')
  inProgress,
  @JsonValue('not_scheduled')
  notScheduled,
}

enum AssetComplianceStatus {
  @JsonValue('compliant')
  compliant,
  @JsonValue('non_compliant')
  nonCompliant,
  @JsonValue('pending')
  pending,
  @JsonValue('expired')
  expired,
  @JsonValue('not_applicable')
  notApplicable,
}

extension AssetStatusExtension on AssetStatus {
  String get displayName {
    switch (this) {
      case AssetStatus.active:
        return 'Active';
      case AssetStatus.inactive:
        return 'Inactive';
      case AssetStatus.maintenance:
        return 'Under Maintenance';
      case AssetStatus.retired:
        return 'Retired';
      case AssetStatus.disposed:
        return 'Disposed';
      case AssetStatus.lost:
        return 'Lost';
      case AssetStatus.stolen:
        return 'Stolen';
      case AssetStatus.damaged:
        return 'Damaged';
    }
  }

  String get description {
    switch (this) {
      case AssetStatus.active:
        return 'Asset is operational and in use';
      case AssetStatus.inactive:
        return 'Asset is not currently in use';
      case AssetStatus.maintenance:
        return 'Asset is undergoing maintenance';
      case AssetStatus.retired:
        return 'Asset has been retired from service';
      case AssetStatus.disposed:
        return 'Asset has been disposed of';
      case AssetStatus.lost:
        return 'Asset location is unknown';
      case AssetStatus.stolen:
        return 'Asset has been reported stolen';
      case AssetStatus.damaged:
        return 'Asset is damaged and needs repair';
    }
  }

  bool get isOperational {
    return this == AssetStatus.active;
  }

  bool get requiresAttention {
    return this == AssetStatus.maintenance || 
           this == AssetStatus.damaged || 
           this == AssetStatus.lost || 
           this == AssetStatus.stolen;
  }

  bool get canBeInspected {
    return this == AssetStatus.active || 
           this == AssetStatus.inactive;
  }

  bool get isAvailable {
    return this == AssetStatus.active || 
           this == AssetStatus.inactive;
  }
}

extension AssetPriorityExtension on AssetPriority {
  String get displayName {
    switch (this) {
      case AssetPriority.low:
        return 'Low';
      case AssetPriority.medium:
        return 'Medium';
      case AssetPriority.high:
        return 'High';
      case AssetPriority.critical:
        return 'Critical';
    }
  }

  String get description {
    switch (this) {
      case AssetPriority.low:
        return 'Low priority asset';
      case AssetPriority.medium:
        return 'Medium priority asset';
      case AssetPriority.high:
        return 'High priority asset';
      case AssetPriority.critical:
        return 'Critical asset - essential for operations';
    }
  }

  int get sortOrder {
    switch (this) {
      case AssetPriority.critical:
        return 4;
      case AssetPriority.high:
        return 3;
      case AssetPriority.medium:
        return 2;
      case AssetPriority.low:
        return 1;
    }
  }
}

extension AssetDocumentTypeExtension on AssetDocumentType {
  String get displayName {
    switch (this) {
      case AssetDocumentType.manual:
        return 'Manual';
      case AssetDocumentType.warranty:
        return 'Warranty';
      case AssetDocumentType.certificate:
        return 'Certificate';
      case AssetDocumentType.specification:
        return 'Specification';
      case AssetDocumentType.drawing:
        return 'Drawing';
      case AssetDocumentType.photo:
        return 'Photo';
      case AssetDocumentType.report:
        return 'Report';
      case AssetDocumentType.other:
        return 'Other';
    }
  }

  String get description {
    switch (this) {
      case AssetDocumentType.manual:
        return 'User or service manual';
      case AssetDocumentType.warranty:
        return 'Warranty documentation';
      case AssetDocumentType.certificate:
        return 'Certification documents';
      case AssetDocumentType.specification:
        return 'Technical specifications';
      case AssetDocumentType.drawing:
        return 'Technical drawings or schematics';
      case AssetDocumentType.photo:
        return 'Asset photographs';
      case AssetDocumentType.report:
        return 'Inspection or maintenance reports';
      case AssetDocumentType.other:
        return 'Other documentation';
    }
  }
}

extension AssetMaintenanceStatusExtension on AssetMaintenanceStatus {
  String get displayName {
    switch (this) {
      case AssetMaintenanceStatus.upToDate:
        return 'Up to Date';
      case AssetMaintenanceStatus.dueSoon:
        return 'Due Soon';
      case AssetMaintenanceStatus.overdue:
        return 'Overdue';
      case AssetMaintenanceStatus.inProgress:
        return 'In Progress';
      case AssetMaintenanceStatus.notScheduled:
        return 'Not Scheduled';
    }
  }

  String get description {
    switch (this) {
      case AssetMaintenanceStatus.upToDate:
        return 'Maintenance is current';
      case AssetMaintenanceStatus.dueSoon:
        return 'Maintenance is due within 30 days';
      case AssetMaintenanceStatus.overdue:
        return 'Maintenance is overdue';
      case AssetMaintenanceStatus.inProgress:
        return 'Maintenance is currently being performed';
      case AssetMaintenanceStatus.notScheduled:
        return 'No maintenance schedule defined';
    }
  }

  bool get requiresAttention {
    return this == AssetMaintenanceStatus.dueSoon || 
           this == AssetMaintenanceStatus.overdue;
  }

  bool get isOverdue {
    return this == AssetMaintenanceStatus.overdue;
  }
}

extension AssetComplianceStatusExtension on AssetComplianceStatus {
  String get displayName {
    switch (this) {
      case AssetComplianceStatus.compliant:
        return 'Compliant';
      case AssetComplianceStatus.nonCompliant:
        return 'Non-Compliant';
      case AssetComplianceStatus.pending:
        return 'Pending';
      case AssetComplianceStatus.expired:
        return 'Expired';
      case AssetComplianceStatus.notApplicable:
        return 'Not Applicable';
    }
  }

  String get description {
    switch (this) {
      case AssetComplianceStatus.compliant:
        return 'Asset meets all compliance requirements';
      case AssetComplianceStatus.nonCompliant:
        return 'Asset does not meet compliance requirements';
      case AssetComplianceStatus.pending:
        return 'Compliance status is being reviewed';
      case AssetComplianceStatus.expired:
        return 'Compliance certifications have expired';
      case AssetComplianceStatus.notApplicable:
        return 'Compliance requirements do not apply';
    }
  }

  bool get requiresAttention {
    return this == AssetComplianceStatus.nonCompliant || 
           this == AssetComplianceStatus.expired;
  }

  bool get isCompliant {
    return this == AssetComplianceStatus.compliant;
  }
}

extension AssetExtension on Asset {
  bool get isOperational => status.isOperational;
  bool get requiresAttention => status.requiresAttention;
  bool get canBeInspected => status.canBeInspected;
  bool get isAvailable => status.isAvailable;
  
  String get displayLocation {
    final parts = <String>[];
    if (building != null && building!.isNotEmpty) parts.add(building!);
    if (floor != null && floor!.isNotEmpty) parts.add('Floor $floor');
    if (room != null && room!.isNotEmpty) parts.add('Room $room');
    if (location != null && location!.isNotEmpty && parts.isEmpty) parts.add(location!);
    
    return parts.isEmpty ? 'Location not specified' : parts.join(', ');
  }
  
  String get fullIdentifier {
    final parts = <String>[name];
    if (assetNumber.isNotEmpty) parts.add('($assetNumber)');
    if (serialNumber != null && serialNumber!.isNotEmpty) {
      parts.add('S/N: $serialNumber');
    }
    return parts.join(' ');
  }
  
  String get manufacturerModel {
    final parts = <String>[];
    if (manufacturer != null && manufacturer!.isNotEmpty) parts.add(manufacturer!);
    if (model != null && model!.isNotEmpty) parts.add(model!);
    return parts.isEmpty ? 'Not specified' : parts.join(' ');
  }
  
  String get categoryPath {
    final parts = <String>[];
    if (category != null && category!.isNotEmpty) parts.add(category!);
    if (subCategory != null && subCategory!.isNotEmpty) parts.add(subCategory!);
    return parts.isEmpty ? 'Uncategorized' : parts.join(' > ');
  }
  
  bool get hasPhotos => photos?.isNotEmpty == true;
  bool get hasDocuments => documents?.isNotEmpty == true;
  bool get hasPrimaryPhoto => photos?.any((p) => p.isPrimary) == true;
  
  AssetPhoto? get primaryPhoto {
    if (photos == null || photos!.isEmpty) return null;
    return photos!.firstWhere(
      (p) => p.isPrimary,
      orElse: () => photos!.first,
    );
  }
  
  List<AssetPhoto> get additionalPhotos {
    if (photos == null || photos!.isEmpty) return [];
    return photos!.where((p) => !p.isPrimary).toList();
  }
  
  bool get hasQrCode => qrCode != null && qrCode!.isNotEmpty;
  bool get hasBarcode => barcode != null && barcode!.isNotEmpty;
  bool get hasRfidTag => rfidTag != null && rfidTag!.isNotEmpty;
  
  bool get hasIdentificationCode => hasQrCode || hasBarcode || hasRfidTag;
  
  String? get primaryIdentificationCode {
    if (hasQrCode) return qrCode;
    if (hasBarcode) return barcode;
    if (hasRfidTag) return rfidTag;
    return null;
  }
  
  String? get primaryIdentificationType {
    if (hasQrCode) return 'QR Code';
    if (hasBarcode) return 'Barcode';
    if (hasRfidTag) return 'RFID Tag';
    return null;
  }
  
  bool get hasGpsCoordinates => gpsCoordinates != null && gpsCoordinates!.isNotEmpty;
  
  double? get latitude {
    if (!hasGpsCoordinates) return null;
    return gpsCoordinates!['latitude'] as double?;
  }
  
  double? get longitude {
    if (!hasGpsCoordinates) return null;
    return gpsCoordinates!['longitude'] as double?;
  }
  
  bool get isWarrantyValid {
    if (warrantyExpiry == null) return false;
    return DateTime.now().isBefore(warrantyExpiry!);
  }
  
  Duration? get warrantyTimeRemaining {
    if (warrantyExpiry == null) return null;
    final now = DateTime.now();
    if (now.isAfter(warrantyExpiry!)) return Duration.zero;
    return warrantyExpiry!.difference(now);
  }
  
  bool get isInspectionDue {
    if (nextInspectionDate == null) return false;
    return DateTime.now().isAfter(nextInspectionDate!);
  }
  
  bool get isInspectionDueSoon {
    if (nextInspectionDate == null) return false;
    final now = DateTime.now();
    final daysUntilDue = nextInspectionDate!.difference(now).inDays;
    return daysUntilDue <= 30 && daysUntilDue >= 0;
  }
  
  Duration? get timeSinceLastInspection {
    if (lastInspectionDate == null) return null;
    return DateTime.now().difference(lastInspectionDate!);
  }
  
  Duration? get timeUntilNextInspection {
    if (nextInspectionDate == null) return null;
    final now = DateTime.now();
    if (now.isAfter(nextInspectionDate!)) return Duration.zero;
    return nextInspectionDate!.difference(now);
  }
  
  bool get hasMaintenanceInfo => maintenanceInfo != null;
  bool get hasComplianceInfo => complianceInfo != null;
  
  bool get requiresMaintenanceAttention {
    return maintenanceInfo?.status?.requiresAttention == true;
  }
  
  bool get requiresComplianceAttention {
    return complianceInfo?.status?.requiresAttention == true;
  }
  
  bool get hasAnyIssues {
    return requiresAttention || 
           requiresMaintenanceAttention || 
           requiresComplianceAttention || 
           isInspectionDue;
  }
  
  List<String> get issuesList {
    final issues = <String>[];
    
    if (requiresAttention) {
      issues.add('Asset Status: ${status.description}');
    }
    
    if (isInspectionDue) {
      issues.add('Inspection Overdue');
    } else if (isInspectionDueSoon) {
      issues.add('Inspection Due Soon');
    }
    
    if (requiresMaintenanceAttention) {
      issues.add('Maintenance: ${maintenanceInfo!.status!.description}');
    }
    
    if (requiresComplianceAttention) {
      issues.add('Compliance: ${complianceInfo!.status!.description}');
    }
    
    if (!isWarrantyValid && warrantyExpiry != null) {
      issues.add('Warranty Expired');
    }
    
    return issues;
  }
  
  String get priorityDisplayText {
    return priority?.displayName ?? 'Not Set';
  }
  
  String get statusDisplayText => status.displayName;
  
  Map<String, dynamic> toSummaryMap() {
    return {
      'id': id,
      'name': name,
      'assetNumber': assetNumber,
      'status': statusDisplayText,
      'priority': priorityDisplayText,
      'location': displayLocation,
      'category': categoryPath,
      'manufacturer': manufacturerModel,
      'hasPhotos': hasPhotos,
      'hasDocuments': hasDocuments,
      'hasIssues': hasAnyIssues,
      'issuesCount': issuesList.length,
      'lastInspection': lastInspectionDate?.toIso8601String(),
      'nextInspection': nextInspectionDate?.toIso8601String(),
      'warrantyExpiry': warrantyExpiry?.toIso8601String(),
    };
  }
}

extension AssetDocumentExtension on AssetDocument {
  bool get hasExpiry => expiryDate != null;
  bool get isExpired {
    if (expiryDate == null) return false;
    return DateTime.now().isAfter(expiryDate!);
  }
  
  bool get isExpiringSoon {
    if (expiryDate == null) return false;
    final now = DateTime.now();
    final daysUntilExpiry = expiryDate!.difference(now).inDays;
    return daysUntilExpiry <= 30 && daysUntilExpiry >= 0;
  }
  
  Duration? get timeUntilExpiry {
    if (expiryDate == null) return null;
    final now = DateTime.now();
    if (now.isAfter(expiryDate!)) return Duration.zero;
    return expiryDate!.difference(now);
  }
  
  String get fileSizeDisplay {
    if (fileSize == null) return 'Unknown';
    
    final bytes = fileSize!;
    if (bytes < 1024) return '${bytes}B';
    if (bytes < 1024 * 1024) return '${(bytes / 1024).toStringAsFixed(1)}KB';
    return '${(bytes / (1024 * 1024)).toStringAsFixed(1)}MB';
  }
  
  String get uploadTimeAgo {
    final now = DateTime.now();
    final difference = now.difference(uploadedAt);
    
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

extension AssetPhotoExtension on AssetPhoto {
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
  
  String get captureTimeAgo {
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
  
  double? get latitude {
    if (!hasGpsData) return null;
    return gpsCoordinates!['latitude'] as double?;
  }
  
  double? get longitude {
    if (!hasGpsData) return null;
    return gpsCoordinates!['longitude'] as double?;
  }
}