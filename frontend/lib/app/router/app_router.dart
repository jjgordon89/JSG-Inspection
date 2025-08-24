import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../features/authentication/presentation/pages/login_page.dart';
import '../../features/authentication/presentation/pages/register_page.dart';
import '../../features/authentication/presentation/pages/forgot_password_page.dart';
import '../../features/dashboard/presentation/pages/dashboard_page.dart';
import '../../features/inspections/presentation/pages/inspections_list_page.dart';
import '../../features/inspections/presentation/pages/inspection_detail_page.dart';
import '../../features/inspections/presentation/pages/inspection_form_page.dart';
import '../../features/inspections/presentation/pages/create_inspection_page.dart';
import '../../features/assets/presentation/pages/assets_list_page.dart';
import '../../features/assets/presentation/pages/asset_detail_page.dart';
import '../../features/assets/presentation/pages/create_asset_page.dart';
import '../../features/assets/presentation/pages/qr_scanner_page.dart';
import '../../features/folders/presentation/pages/folders_list_page.dart';
import '../../features/folders/presentation/pages/folder_detail_page.dart';
import '../../features/folders/presentation/pages/create_folder_page.dart';
import '../../features/forms/presentation/pages/forms_list_page.dart';
import '../../features/forms/presentation/pages/form_detail_page.dart';
import '../../features/forms/presentation/pages/create_form_page.dart';
import '../../features/reports/presentation/pages/reports_list_page.dart';
import '../../features/reports/presentation/pages/report_detail_page.dart';
import '../../features/reports/presentation/pages/generate_report_page.dart';
import '../../features/settings/presentation/pages/settings_page.dart';
import '../../features/profile/presentation/pages/profile_page.dart';
import '../../features/profile/presentation/pages/edit_profile_page.dart';
import '../../shared/presentation/pages/splash_page.dart';
import '../../shared/presentation/pages/error_page.dart';
import '../../shared/presentation/widgets/main_scaffold.dart';
import '../providers/auth_provider.dart';

// Route Names
class AppRoutes {
  static const String splash = '/splash';
  static const String login = '/login';
  static const String register = '/register';
  static const String forgotPassword = '/forgot-password';
  static const String dashboard = '/dashboard';
  static const String inspections = '/inspections';
  static const String inspectionDetail = '/inspections/:id';
  static const String inspectionForm = '/inspections/:id/form';
  static const String createInspection = '/inspections/create';
  static const String assets = '/assets';
  static const String assetDetail = '/assets/:id';
  static const String createAsset = '/assets/create';
  static const String qrScanner = '/qr-scanner';
  static const String folders = '/folders';
  static const String folderDetail = '/folders/:id';
  static const String createFolder = '/folders/create';
  static const String forms = '/forms';
  static const String formDetail = '/forms/:id';
  static const String createForm = '/forms/create';
  static const String reports = '/reports';
  static const String reportDetail = '/reports/:id';
  static const String generateReport = '/reports/generate';
  static const String settings = '/settings';
  static const String profile = '/profile';
  static const String editProfile = '/profile/edit';
}

// Router Provider
final appRouterProvider = Provider<GoRouter>((ref) {
  final authState = ref.watch(authNotifierProvider);
  
  return GoRouter(
    initialLocation: AppRoutes.splash,
    debugLogDiagnostics: true,
    redirect: (context, state) {
      final isLoggedIn = authState.maybeWhen(
        authenticated: (_) => true,
        orElse: () => false,
      );
      
      final isLoading = authState.maybeWhen(
        loading: () => true,
        orElse: () => false,
      );
      
      // Show splash while loading
      if (isLoading) {
        return AppRoutes.splash;
      }
      
      // Public routes that don't require authentication
      final publicRoutes = [
        AppRoutes.splash,
        AppRoutes.login,
        AppRoutes.register,
        AppRoutes.forgotPassword,
      ];
      
      final isPublicRoute = publicRoutes.contains(state.matchedLocation);
      
      // Redirect to login if not authenticated and trying to access protected route
      if (!isLoggedIn && !isPublicRoute) {
        return AppRoutes.login;
      }
      
      // Redirect to dashboard if authenticated and trying to access public route
      if (isLoggedIn && isPublicRoute && state.matchedLocation != AppRoutes.splash) {
        return AppRoutes.dashboard;
      }
      
      return null; // No redirect needed
    },
    errorBuilder: (context, state) => ErrorPage(
      error: state.error.toString(),
    ),
    routes: [
      // Splash Route
      GoRoute(
        path: AppRoutes.splash,
        name: 'splash',
        builder: (context, state) => const SplashPage(),
      ),
      
      // Authentication Routes
      GoRoute(
        path: AppRoutes.login,
        name: 'login',
        builder: (context, state) => const LoginPage(),
      ),
      GoRoute(
        path: AppRoutes.register,
        name: 'register',
        builder: (context, state) => const RegisterPage(),
      ),
      GoRoute(
        path: AppRoutes.forgotPassword,
        name: 'forgotPassword',
        builder: (context, state) => const ForgotPasswordPage(),
      ),
      
      // Main App Routes with Shell
      ShellRoute(
        builder: (context, state, child) => MainScaffold(child: child),
        routes: [
          // Dashboard
          GoRoute(
            path: AppRoutes.dashboard,
            name: 'dashboard',
            builder: (context, state) => const DashboardPage(),
          ),
          
          // Inspections
          GoRoute(
            path: AppRoutes.inspections,
            name: 'inspections',
            builder: (context, state) => const InspectionsListPage(),
            routes: [
              GoRoute(
                path: 'create',
                name: 'createInspection',
                builder: (context, state) => const CreateInspectionPage(),
              ),
              GoRoute(
                path: ':id',
                name: 'inspectionDetail',
                builder: (context, state) {
                  final id = state.pathParameters['id']!;
                  return InspectionDetailPage(inspectionId: id);
                },
                routes: [
                  GoRoute(
                    path: 'form',
                    name: 'inspectionForm',
                    builder: (context, state) {
                      final id = state.pathParameters['id']!;
                      return InspectionFormPage(inspectionId: id);
                    },
                  ),
                ],
              ),
            ],
          ),
          
          // Assets
          GoRoute(
            path: AppRoutes.assets,
            name: 'assets',
            builder: (context, state) => const AssetsListPage(),
            routes: [
              GoRoute(
                path: 'create',
                name: 'createAsset',
                builder: (context, state) => const CreateAssetPage(),
              ),
              GoRoute(
                path: ':id',
                name: 'assetDetail',
                builder: (context, state) {
                  final id = state.pathParameters['id']!;
                  return AssetDetailPage(assetId: id);
                },
              ),
            ],
          ),
          
          // QR Scanner
          GoRoute(
            path: AppRoutes.qrScanner,
            name: 'qrScanner',
            builder: (context, state) => const QRScannerPage(),
          ),
          
          // Folders
          GoRoute(
            path: AppRoutes.folders,
            name: 'folders',
            builder: (context, state) => const FoldersListPage(),
            routes: [
              GoRoute(
                path: 'create',
                name: 'createFolder',
                builder: (context, state) => const CreateFolderPage(),
              ),
              GoRoute(
                path: ':id',
                name: 'folderDetail',
                builder: (context, state) {
                  final id = state.pathParameters['id']!;
                  return FolderDetailPage(folderId: id);
                },
              ),
            ],
          ),
          
          // Forms
          GoRoute(
            path: AppRoutes.forms,
            name: 'forms',
            builder: (context, state) => const FormsListPage(),
            routes: [
              GoRoute(
                path: 'create',
                name: 'createForm',
                builder: (context, state) => const CreateFormPage(),
              ),
              GoRoute(
                path: ':id',
                name: 'formDetail',
                builder: (context, state) {
                  final id = state.pathParameters['id']!;
                  return FormDetailPage(formId: id);
                },
              ),
            ],
          ),
          
          // Reports
          GoRoute(
            path: AppRoutes.reports,
            name: 'reports',
            builder: (context, state) => const ReportsListPage(),
            routes: [
              GoRoute(
                path: 'generate',
                name: 'generateReport',
                builder: (context, state) => const GenerateReportPage(),
              ),
              GoRoute(
                path: ':id',
                name: 'reportDetail',
                builder: (context, state) {
                  final id = state.pathParameters['id']!;
                  return ReportDetailPage(reportId: id);
                },
              ),
            ],
          ),
          
          // Settings
          GoRoute(
            path: AppRoutes.settings,
            name: 'settings',
            builder: (context, state) => const SettingsPage(),
          ),
          
          // Profile
          GoRoute(
            path: AppRoutes.profile,
            name: 'profile',
            builder: (context, state) => const ProfilePage(),
            routes: [
              GoRoute(
                path: 'edit',
                name: 'editProfile',
                builder: (context, state) => const EditProfilePage(),
              ),
            ],
          ),
        ],
      ),
    ],
  );
});

// Navigation Extensions
extension GoRouterExtension on GoRouter {
  void pushAndClearStack(String location) {
    while (canPop()) {
      pop();
    }
    pushReplacement(location);
  }
}

// Navigation Helper
class AppNavigation {
  static void goToLogin(BuildContext context) {
    context.go(AppRoutes.login);
  }
  
  static void goToDashboard(BuildContext context) {
    context.go(AppRoutes.dashboard);
  }
  
  static void goToInspections(BuildContext context) {
    context.go(AppRoutes.inspections);
  }
  
  static void goToInspectionDetail(BuildContext context, String id) {
    context.go('/inspections/$id');
  }
  
  static void goToInspectionForm(BuildContext context, String id) {
    context.go('/inspections/$id/form');
  }
  
  static void goToCreateInspection(BuildContext context) {
    context.go('/inspections/create');
  }
  
  static void goToAssets(BuildContext context) {
    context.go(AppRoutes.assets);
  }
  
  static void goToAssetDetail(BuildContext context, String id) {
    context.go('/assets/$id');
  }
  
  static void goToCreateAsset(BuildContext context) {
    context.go('/assets/create');
  }
  
  static void goToQRScanner(BuildContext context) {
    context.go(AppRoutes.qrScanner);
  }
  
  static void goToFolders(BuildContext context) {
    context.go(AppRoutes.folders);
  }
  
  static void goToFolderDetail(BuildContext context, String id) {
    context.go('/folders/$id');
  }
  
  static void goToCreateFolder(BuildContext context) {
    context.go('/folders/create');
  }
  
  static void goToForms(BuildContext context) {
    context.go(AppRoutes.forms);
  }
  
  static void goToFormDetail(BuildContext context, String id) {
    context.go('/forms/$id');
  }
  
  static void goToCreateForm(BuildContext context) {
    context.go('/forms/create');
  }
  
  static void goToReports(BuildContext context) {
    context.go(AppRoutes.reports);
  }
  
  static void goToReportDetail(BuildContext context, String id) {
    context.go('/reports/$id');
  }
  
  static void goToGenerateReport(BuildContext context) {
    context.go('/reports/generate');
  }
  
  static void goToSettings(BuildContext context) {
    context.go(AppRoutes.settings);
  }
  
  static void goToProfile(BuildContext context) {
    context.go(AppRoutes.profile);
  }
  
  static void goToEditProfile(BuildContext context) {
    context.go('/profile/edit');
  }
}