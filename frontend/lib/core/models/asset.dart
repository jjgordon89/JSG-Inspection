import 'package:hive/hive.dart';
import 'package:freezed_annotation/freezed_annotation.dart';

part 'asset.freezed.dart';
part 'asset.g.dart';

@freezed
@HiveType(typeId: 2)
class Asset with _$Asset {
  const factory Asset({
    @HiveField(0) required String id,
    @HiveField(1) required String name,
    @HiveField(2) required String assetNumber,
    @HiveField(3) String? description,
    @HiveField(4) required AssetType type,
    @HiveField(5) required AssetStatus status,
    @HiveField(6) String? qrCode,
    @HiveField(7) String? barcode,
    @HiveField(8) AssetLocation? location,
    @HiveField(9) String? manufacturer,
    @HiveField(10) String? model,
    @HiveField(11) String? serialNumber,
    @HiveField(12) DateTime? purchaseDate,
    @HiveField(13) DateTime? warrantyExpiry,
    @HiveField(14) double? purchasePrice,
    @HiveField(15) String? department,
    @HiveField(16) String? assignedTo,
    @HiveField(17) @Default([]) List<String> photos,
    @HiveField(18) @Default({}) Map<String, dynamic> customFields,
    @HiveField(19) required DateTime createdAt,
    @HiveField(20) required DateTime updatedAt,
    @HiveField(21) DateTime? lastInspectionAt,
    @HiveField(22) int? inspectionCount,
  }) = _Asset;

  factory Asset.fromJson(Map<String, dynamic> json) => _$AssetFromJson(json);
}

@freezed
@HiveType(typeId: 3)
class AssetLocation with _$AssetLocation {
  const factory AssetLocation({
    @HiveField(0) required double latitude,
    @HiveField(1) required double longitude,
    @HiveField(2) String? address,
    @HiveField(3) String? building,
    @HiveField(4) String? floor,
    @HiveField(5) String? room,
    @HiveField(6) String? zone,
    @HiveField(7) double? accuracy,
    @HiveField(8) required DateTime recordedAt,
  }) = _AssetLocation;

  factory AssetLocation.fromJson(Map<String, dynamic> json) => _$AssetLocationFromJson(json);
}

@HiveType(typeId: 4)
enum AssetType {
  @HiveField(0)
  equipment,
  @HiveField(1)
  machinery,
  @HiveField(2)
  vehicle,
  @HiveField(3)
  building,
  @HiveField(4)
  infrastructure,
  @HiveField(5)
  tool,
  @HiveField(6)
  furniture,
  @HiveField(7)
  electronics,
  @HiveField(8)
  other,
}

@HiveType(typeId: 5)
enum AssetStatus {
  @HiveField(0)
  active,
  @HiveField(1)
  inactive,
  @HiveField(2)
  maintenance,
  @HiveField(3)
  retired,
  @HiveField(4)
  disposed,
}

extension AssetTypeExtension on AssetType {
  String get displayName {
    switch (this) {
      case AssetType.equipment:
        return 'Equipment';
      case AssetType.machinery:
        return 'Machinery';
      case AssetType.vehicle:
        return 'Vehicle';
      case AssetType.building:
        return 'Building';
      case AssetType.infrastructure:
        return 'Infrastructure';
      case AssetType.tool:
        return 'Tool';
      case AssetType.furniture:
        return 'Furniture';
      case AssetType.electronics:
        return 'Electronics';
      case AssetType.other:
        return 'Other';
    }
  }
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
    }
  }

  bool get isOperational {
    return this == AssetStatus.active;
  }

  bool get requiresAttention {
    return this == AssetStatus.maintenance || this == AssetStatus.inactive;
  }
}