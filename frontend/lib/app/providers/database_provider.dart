import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../core/services/database_service.dart';

// Database Service Provider
final databaseServiceProvider = Provider<DatabaseService>((ref) {
  return DatabaseService.instance;
});

// Database initialization provider
final databaseInitializationProvider = FutureProvider<void>((ref) async {
  final databaseService = ref.watch(databaseServiceProvider);
  await databaseService.initialize();
});

// Connection status provider
final connectionStatusProvider = StreamProvider<bool>((ref) {
  final databaseService = ref.watch(databaseServiceProvider);
  return databaseService.connectionStatusStream;
});

// Sync status provider
final syncStatusProvider = StreamProvider((ref) {
  final databaseService = ref.watch(databaseServiceProvider);
  return databaseService.syncStatusStream;
});