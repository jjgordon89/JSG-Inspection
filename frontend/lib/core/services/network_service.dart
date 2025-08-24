import 'dart:async';
import 'dart:convert';
import 'dart:io';
import 'package:dio/dio.dart';
import 'package:flutter/foundation.dart';
import 'package:connectivity_plus/connectivity_plus.dart';
import 'package:shared_preferences/shared_preferences.dart';

import '../utils/constants.dart';
import '../exceptions/app_exceptions.dart';
import 'storage_service.dart';

class NetworkService {
  static NetworkService? _instance;
  static NetworkService get instance => _instance ??= NetworkService._();
  
  NetworkService._();
  
  late Dio _dio;
  bool _isInitialized = false;
  bool _isOnline = true;
  
  final StreamController<bool> _connectionStatusController = StreamController<bool>.broadcast();
  Stream<bool> get connectionStatusStream => _connectionStatusController.stream;
  
  // Initialize network service
  Future<void> initialize() async {
    if (_isInitialized) return;
    
    _dio = Dio();
    
    // Configure Dio
    _dio.options = BaseOptions(
      baseUrl: AppConstants.apiBaseUrl,
      connectTimeout: const Duration(seconds: AppConstants.connectionTimeout),
      receiveTimeout: const Duration(seconds: AppConstants.receiveTimeout),
      sendTimeout: const Duration(seconds: AppConstants.sendTimeout),
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    );
    
    // Add interceptors
    _dio.interceptors.addAll([
      _AuthInterceptor(),
      _LoggingInterceptor(),
      _ErrorInterceptor(),
      _RetryInterceptor(),
    ]);
    
    // Setup connectivity monitoring
    await _setupConnectivityMonitoring();
    
    _isInitialized = true;
    debugPrint('NetworkService initialized');
  }
  
  // Setup connectivity monitoring
  Future<void> _setupConnectivityMonitoring() async {
    // Check initial connectivity
    final connectivityResult = await Connectivity().checkConnectivity();
    _isOnline = connectivityResult != ConnectivityResult.none;
    _connectionStatusController.add(_isOnline);
    
    // Listen for connectivity changes
    Connectivity().onConnectivityChanged.listen((ConnectivityResult result) {
      final wasOnline = _isOnline;
      _isOnline = result != ConnectivityResult.none;
      
      if (wasOnline != _isOnline) {
        _connectionStatusController.add(_isOnline);
        debugPrint('Network status changed: ${_isOnline ? 'Online' : 'Offline'}');
      }
    });
  }
  
  // Check if device is online
  bool get isOnline => _isOnline;
  
  // GET request
  Future<Response<T>> get<T>(
    String path, {
    Map<String, dynamic>? queryParameters,
    Options? options,
    CancelToken? cancelToken,
    ProgressCallback? onReceiveProgress,
  }) async {
    _ensureInitialized();
    _checkConnectivity();
    
    try {
      final response = await _dio.get<T>(
        path,
        queryParameters: queryParameters,
        options: options,
        cancelToken: cancelToken,
        onReceiveProgress: onReceiveProgress,
      );
      
      return response;
    } catch (e) {
      throw _handleError(e);
    }
  }
  
  // POST request
  Future<Response<T>> post<T>(
    String path, {
    dynamic data,
    Map<String, dynamic>? queryParameters,
    Options? options,
    CancelToken? cancelToken,
    ProgressCallback? onSendProgress,
    ProgressCallback? onReceiveProgress,
  }) async {
    _ensureInitialized();
    _checkConnectivity();
    
    try {
      final response = await _dio.post<T>(
        path,
        data: data,
        queryParameters: queryParameters,
        options: options,
        cancelToken: cancelToken,
        onSendProgress: onSendProgress,
        onReceiveProgress: onReceiveProgress,
      );
      
      return response;
    } catch (e) {
      throw _handleError(e);
    }
  }
  
  // PUT request
  Future<Response<T>> put<T>(
    String path, {
    dynamic data,
    Map<String, dynamic>? queryParameters,
    Options? options,
    CancelToken? cancelToken,
    ProgressCallback? onSendProgress,
    ProgressCallback? onReceiveProgress,
  }) async {
    _ensureInitialized();
    _checkConnectivity();
    
    try {
      final response = await _dio.put<T>(
        path,
        data: data,
        queryParameters: queryParameters,
        options: options,
        cancelToken: cancelToken,
        onSendProgress: onSendProgress,
        onReceiveProgress: onReceiveProgress,
      );
      
      return response;
    } catch (e) {
      throw _handleError(e);
    }
  }
  
  // PATCH request
  Future<Response<T>> patch<T>(
    String path, {
    dynamic data,
    Map<String, dynamic>? queryParameters,
    Options? options,
    CancelToken? cancelToken,
    ProgressCallback? onSendProgress,
    ProgressCallback? onReceiveProgress,
  }) async {
    _ensureInitialized();
    _checkConnectivity();
    
    try {
      final response = await _dio.patch<T>(
        path,
        data: data,
        queryParameters: queryParameters,
        options: options,
        cancelToken: cancelToken,
        onSendProgress: onSendProgress,
        onReceiveProgress: onReceiveProgress,
      );
      
      return response;
    } catch (e) {
      throw _handleError(e);
    }
  }
  
  // DELETE request
  Future<Response<T>> delete<T>(
    String path, {
    dynamic data,
    Map<String, dynamic>? queryParameters,
    Options? options,
    CancelToken? cancelToken,
  }) async {
    _ensureInitialized();
    _checkConnectivity();
    
    try {
      final response = await _dio.delete<T>(
        path,
        data: data,
        queryParameters: queryParameters,
        options: options,
        cancelToken: cancelToken,
      );
      
      return response;
    } catch (e) {
      throw _handleError(e);
    }
  }
  
  // Upload file
  Future<Response<T>> uploadFile<T>(
    String path,
    String filePath, {
    String? fileName,
    Map<String, dynamic>? data,
    ProgressCallback? onSendProgress,
    CancelToken? cancelToken,
  }) async {
    _ensureInitialized();
    _checkConnectivity();
    
    try {
      final formData = FormData();
      
      // Add file
      formData.files.add(
        MapEntry(
          'file',
          await MultipartFile.fromFile(
            filePath,
            filename: fileName,
          ),
        ),
      );
      
      // Add additional data
      if (data != null) {
        data.forEach((key, value) {
          formData.fields.add(MapEntry(key, value.toString()));
        });
      }
      
      final response = await _dio.post<T>(
        path,
        data: formData,
        onSendProgress: onSendProgress,
        cancelToken: cancelToken,
      );
      
      return response;
    } catch (e) {
      throw _handleError(e);
    }
  }
  
  // Download file
  Future<Response> downloadFile(
    String url,
    String savePath, {
    ProgressCallback? onReceiveProgress,
    CancelToken? cancelToken,
    Options? options,
  }) async {
    _ensureInitialized();
    _checkConnectivity();
    
    try {
      final response = await _dio.download(
        url,
        savePath,
        onReceiveProgress: onReceiveProgress,
        cancelToken: cancelToken,
        options: options,
      );
      
      return response;
    } catch (e) {
      throw _handleError(e);
    }
  }
  
  // Update auth token
  void updateAuthToken(String token) {
    _dio.options.headers['Authorization'] = 'Bearer $token';
  }
  
  // Clear auth token
  void clearAuthToken() {
    _dio.options.headers.remove('Authorization');
  }
  
  // Ensure service is initialized
  void _ensureInitialized() {
    if (!_isInitialized) {
      throw NetworkException('NetworkService not initialized');
    }
  }
  
  // Check connectivity
  void _checkConnectivity() {
    if (!_isOnline) {
      throw NetworkException.noConnection();
    }
  }
  
  // Handle errors
  AppException _handleError(dynamic error) {
    if (error is DioException) {
      switch (error.type) {
        case DioExceptionType.connectionTimeout:
        case DioExceptionType.sendTimeout:
        case DioExceptionType.receiveTimeout:
          return NetworkException.timeout();
        
        case DioExceptionType.connectionError:
          return NetworkException.noConnection();
        
        case DioExceptionType.badResponse:
          final statusCode = error.response?.statusCode ?? 0;
          final message = error.response?.data?['message'] ?? error.message;
          
          switch (statusCode) {
            case 400:
              return NetworkException.badRequest(message);
            case 401:
              return AuthException.tokenExpired();
            case 403:
              return NetworkException.forbidden(message);
            case 404:
              return NetworkException.notFound(message);
            case 422:
              return ValidationException(message ?? 'Validation failed');
            default:
              return NetworkException.serverError(statusCode, message);
          }
        
        case DioExceptionType.cancel:
          return NetworkException('Request cancelled');
        
        case DioExceptionType.unknown:
          if (error.error is SocketException) {
            return NetworkException.noConnection();
          }
          return NetworkException('Unknown network error: ${error.message}');
        
        default:
          return NetworkException('Network error: ${error.message}');
      }
    }
    
    return NetworkException('Unexpected error: $error');
  }
  
  // Dispose resources
  Future<void> dispose() async {
    await _connectionStatusController.close();
    _dio.close();
    _isInitialized = false;
  }
}

// Auth interceptor to add JWT token
class _AuthInterceptor extends Interceptor {
  @override
  void onRequest(RequestOptions options, RequestInterceptorHandler handler) async {
    // Get token from storage
    final prefs = await SharedPreferences.getInstance();
    final token = prefs.getString(AppConstants.authTokenKey);
    
    if (token != null && token.isNotEmpty) {
      options.headers['Authorization'] = 'Bearer $token';
    }
    
    handler.next(options);
  }
  
  @override
  void onError(DioException err, ErrorInterceptorHandler handler) async {
    // Handle token expiration
    if (err.response?.statusCode == 401) {
      // Clear expired token
      final prefs = await SharedPreferences.getInstance();
      await prefs.remove(AppConstants.authTokenKey);
      await StorageService.instance.clearSecureData(AppConstants.authTokenKey);
    }
    
    handler.next(err);
  }
}

// Logging interceptor for debugging
class _LoggingInterceptor extends Interceptor {
  @override
  void onRequest(RequestOptions options, RequestInterceptorHandler handler) {
    if (kDebugMode) {
      debugPrint('🌐 ${options.method} ${options.uri}');
      if (options.data != null) {
        debugPrint('📤 Request Data: ${options.data}');
      }
      if (options.queryParameters.isNotEmpty) {
        debugPrint('🔍 Query Parameters: ${options.queryParameters}');
      }
    }
    handler.next(options);
  }
  
  @override
  void onResponse(Response response, ResponseInterceptorHandler handler) {
    if (kDebugMode) {
      debugPrint('✅ ${response.statusCode} ${response.requestOptions.uri}');
      debugPrint('📥 Response Data: ${response.data}');
    }
    handler.next(response);
  }
  
  @override
  void onError(DioException err, ErrorInterceptorHandler handler) {
    if (kDebugMode) {
      debugPrint('❌ ${err.response?.statusCode} ${err.requestOptions.uri}');
      debugPrint('💥 Error: ${err.message}');
      if (err.response?.data != null) {
        debugPrint('📥 Error Data: ${err.response?.data}');
      }
    }
    handler.next(err);
  }
}

// Error interceptor for consistent error handling
class _ErrorInterceptor extends Interceptor {
  @override
  void onError(DioException err, ErrorInterceptorHandler handler) {
    // Add custom error handling logic here
    // For example, show global error messages, log errors, etc.
    
    handler.next(err);
  }
}

// Retry interceptor for failed requests
class _RetryInterceptor extends Interceptor {
  static const int maxRetries = 3;
  static const Duration retryDelay = Duration(seconds: 1);
  
  @override
  void onError(DioException err, ErrorInterceptorHandler handler) async {
    final requestOptions = err.requestOptions;
    
    // Check if request should be retried
    if (_shouldRetry(err) && _canRetry(requestOptions)) {
      final retryCount = (requestOptions.extra['retryCount'] ?? 0) + 1;
      requestOptions.extra['retryCount'] = retryCount;
      
      debugPrint('🔄 Retrying request (${retryCount}/${maxRetries}): ${requestOptions.uri}');
      
      // Wait before retrying
      await Future.delayed(retryDelay * retryCount);
      
      try {
        final response = await Dio().fetch(requestOptions);
        handler.resolve(response);
        return;
      } catch (e) {
        // If retry fails, continue with original error
      }
    }
    
    handler.next(err);
  }
  
  bool _shouldRetry(DioException err) {
    // Retry on network errors, timeouts, and 5xx server errors
    return err.type == DioExceptionType.connectionTimeout ||
           err.type == DioExceptionType.sendTimeout ||
           err.type == DioExceptionType.receiveTimeout ||
           err.type == DioExceptionType.connectionError ||
           (err.response?.statusCode != null && err.response!.statusCode! >= 500);
  }
  
  bool _canRetry(RequestOptions options) {
    final retryCount = options.extra['retryCount'] ?? 0;
    return retryCount < maxRetries;
  }
}