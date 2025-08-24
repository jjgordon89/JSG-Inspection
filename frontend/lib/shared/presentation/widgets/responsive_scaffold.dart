import 'package:flutter/material.dart';

/// A responsive scaffold that adapts to different screen sizes
class ResponsiveScaffold extends StatelessWidget {
  final Widget body;
  final String? title;
  final List<Widget>? actions;
  final Widget? floatingActionButton;
  final Widget? drawer;
  final Widget? endDrawer;
  final Widget? bottomNavigationBar;
  final Widget? bottomSheet;
  final Color? backgroundColor;
  final bool extendBody;
  final bool extendBodyBehindAppBar;
  final PreferredSizeWidget? appBar;
  final bool showAppBar;
  final bool resizeToAvoidBottomInset;

  const ResponsiveScaffold({
    super.key,
    required this.body,
    this.title,
    this.actions,
    this.floatingActionButton,
    this.drawer,
    this.endDrawer,
    this.bottomNavigationBar,
    this.bottomSheet,
    this.backgroundColor,
    this.extendBody = false,
    this.extendBodyBehindAppBar = false,
    this.appBar,
    this.showAppBar = true,
    this.resizeToAvoidBottomInset = true,
  });

  @override
  Widget build(BuildContext context) {
    final screenWidth = MediaQuery.of(context).size.width;
    final isDesktop = screenWidth > 1200;
    final isTablet = screenWidth > 768 && screenWidth <= 1200;
    final isMobile = screenWidth <= 768;

    // For desktop layout
    if (isDesktop) {
      return _buildDesktopLayout(context);
    }
    
    // For tablet layout
    if (isTablet) {
      return _buildTabletLayout(context);
    }
    
    // For mobile layout
    return _buildMobileLayout(context);
  }

  Widget _buildDesktopLayout(BuildContext context) {
    return Scaffold(
      backgroundColor: backgroundColor,
      extendBody: extendBody,
      extendBodyBehindAppBar: extendBodyBehindAppBar,
      resizeToAvoidBottomInset: resizeToAvoidBottomInset,
      appBar: showAppBar ? (appBar ?? _buildAppBar(context)) : null,
      body: Row(
        children: [
          // Navigation sidebar for desktop
          if (drawer != null)
            SizedBox(
              width: 280,
              child: drawer!,
            ),
          // Main content area
          Expanded(
            child: body,
          ),
          // End drawer as sidebar
          if (endDrawer != null)
            SizedBox(
              width: 280,
              child: endDrawer!,
            ),
        ],
      ),
      floatingActionButton: floatingActionButton,
      bottomSheet: bottomSheet,
    );
  }

  Widget _buildTabletLayout(BuildContext context) {
    return Scaffold(
      backgroundColor: backgroundColor,
      extendBody: extendBody,
      extendBodyBehindAppBar: extendBodyBehindAppBar,
      resizeToAvoidBottomInset: resizeToAvoidBottomInset,
      appBar: showAppBar ? (appBar ?? _buildAppBar(context)) : null,
      drawer: drawer,
      endDrawer: endDrawer,
      body: body,
      floatingActionButton: floatingActionButton,
      bottomNavigationBar: bottomNavigationBar,
      bottomSheet: bottomSheet,
    );
  }

  Widget _buildMobileLayout(BuildContext context) {
    return Scaffold(
      backgroundColor: backgroundColor,
      extendBody: extendBody,
      extendBodyBehindAppBar: extendBodyBehindAppBar,
      resizeToAvoidBottomInset: resizeToAvoidBottomInset,
      appBar: showAppBar ? (appBar ?? _buildAppBar(context)) : null,
      drawer: drawer,
      endDrawer: endDrawer,
      body: body,
      floatingActionButton: floatingActionButton,
      bottomNavigationBar: bottomNavigationBar,
      bottomSheet: bottomSheet,
    );
  }

  PreferredSizeWidget? _buildAppBar(BuildContext context) {
    if (title == null && actions == null) return null;
    
    return AppBar(
      title: title != null ? Text(title!) : null,
      actions: actions,
      elevation: 0,
      scrolledUnderElevation: 1,
    );
  }
}

/// Breakpoint constants for responsive design
class Breakpoints {
  static const double mobile = 768;
  static const double tablet = 1200;
  static const double desktop = 1200;
}

/// Extension to get screen type
extension ScreenTypeExtension on BuildContext {
  bool get isMobile => MediaQuery.of(this).size.width <= Breakpoints.mobile;
  bool get isTablet => MediaQuery.of(this).size.width > Breakpoints.mobile && 
                      MediaQuery.of(this).size.width <= Breakpoints.tablet;
  bool get isDesktop => MediaQuery.of(this).size.width > Breakpoints.desktop;
  
  double get screenWidth => MediaQuery.of(this).size.width;
  double get screenHeight => MediaQuery.of(this).size.height;
}