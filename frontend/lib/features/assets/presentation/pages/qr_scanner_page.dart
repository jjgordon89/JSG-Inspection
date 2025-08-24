import 'package:flutter/material.dart';
import 'package:flutter_hooks/flutter_hooks.dart';
import 'package:hooks_riverpod/hooks_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../../shared/presentation/widgets/responsive_scaffold.dart';
import '../../../../shared/presentation/widgets/loading_overlay.dart';
import '../../../../shared/presentation/widgets/custom_button.dart';
import '../../../../core/constants/app_constants.dart';

/// Page for scanning QR codes to identify assets
class QRScannerPage extends HookConsumerWidget {
  const QRScannerPage({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final theme = Theme.of(context);
    final colorScheme = theme.colorScheme;
    final isScanning = useState(false);
    final hasPermission = useState<bool?>(null);
    final scannedCode = useState<String?>(null);
    final isProcessing = useState(false);
    
    // Initialize camera permission check
    useEffect(() {
      _checkCameraPermission(hasPermission);
      return null;
    }, []);

    return ResponsiveScaffold(
      title: 'QR Code Scanner',
      body: LoadingOverlay(
        isLoading: isProcessing.value,
        child: Column(
          children: [
            Expanded(
              child: _buildScannerContent(
                context,
                theme,
                colorScheme,
                hasPermission.value,
                isScanning,
                scannedCode,
                isProcessing,
              ),
            ),
            _buildBottomControls(
              context,
              theme,
              colorScheme,
              isScanning,
              hasPermission.value,
              scannedCode.value,
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildScannerContent(
    BuildContext context,
    ThemeData theme,
    ColorScheme colorScheme,
    bool? hasPermission,
    ValueNotifier<bool> isScanning,
    ValueNotifier<String?> scannedCode,
    ValueNotifier<bool> isProcessing,
  ) {
    if (hasPermission == null) {
      return _buildLoadingState(theme, colorScheme);
    }
    
    if (!hasPermission) {
      return _buildPermissionDeniedState(context, theme, colorScheme);
    }
    
    if (scannedCode.value != null) {
      return _buildScannedResultState(
        context,
        theme,
        colorScheme,
        scannedCode.value!,
        isProcessing,
      );
    }
    
    return _buildScannerState(
      context,
      theme,
      colorScheme,
      isScanning,
      scannedCode,
    );
  }

  Widget _buildLoadingState(ThemeData theme, ColorScheme colorScheme) {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          CircularProgressIndicator(
            color: colorScheme.primary,
          ),
          const SizedBox(height: 16),
          Text(
            'Initializing camera...',
            style: theme.textTheme.bodyLarge?.copyWith(
              color: colorScheme.onSurfaceVariant,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildPermissionDeniedState(
    BuildContext context,
    ThemeData theme,
    ColorScheme colorScheme,
  ) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(24),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(
              Icons.camera_alt_outlined,
              size: 64,
              color: colorScheme.onSurfaceVariant,
            ),
            const SizedBox(height: 24),
            Text(
              'Camera Permission Required',
              style: theme.textTheme.headlineSmall?.copyWith(
                fontWeight: FontWeight.bold,
              ),
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 16),
            Text(
              'To scan QR codes, please grant camera permission in your device settings.',
              style: theme.textTheme.bodyLarge?.copyWith(
                color: colorScheme.onSurfaceVariant,
              ),
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 32),
            CustomButton(
              onPressed: () {
                // Open app settings
                _openAppSettings();
              },
              text: 'Open Settings',
              icon: Icons.settings,
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildScannerState(
    BuildContext context,
    ThemeData theme,
    ColorScheme colorScheme,
    ValueNotifier<bool> isScanning,
    ValueNotifier<String?> scannedCode,
  ) {
    return Column(
      children: [
        Expanded(
          child: Stack(
            children: [
              // Camera preview placeholder
              Container(
                width: double.infinity,
                color: Colors.black,
                child: Center(
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Icon(
                        Icons.qr_code_scanner,
                        size: 100,
                        color: Colors.white.withOpacity(0.7),
                      ),
                      const SizedBox(height: 16),
                      Text(
                        'Camera Preview',
                        style: theme.textTheme.bodyLarge?.copyWith(
                          color: Colors.white.withOpacity(0.7),
                        ),
                      ),
                      const SizedBox(height: 8),
                      Text(
                        'Point camera at QR code',
                        style: theme.textTheme.bodyMedium?.copyWith(
                          color: Colors.white.withOpacity(0.5),
                        ),
                      ),
                    ],
                  ),
                ),
              ),
              // Scanning overlay
              _buildScanningOverlay(theme, colorScheme, isScanning.value),
              // Instructions overlay
              Positioned(
                top: 40,
                left: 16,
                right: 16,
                child: _buildInstructionsOverlay(theme, colorScheme),
              ),
            ],
          ),
        ),
        // Manual input option
        Container(
          padding: const EdgeInsets.all(16),
          child: Column(
            children: [
              Text(
                'Having trouble scanning?',
                style: theme.textTheme.bodyMedium?.copyWith(
                  color: colorScheme.onSurfaceVariant,
                ),
              ),
              const SizedBox(height: 8),
              TextButton(
                onPressed: () {
                  _showManualInputDialog(context, scannedCode);
                },
                child: const Text('Enter code manually'),
              ),
            ],
          ),
        ),
      ],
    );
  }

  Widget _buildScanningOverlay(
    ThemeData theme,
    ColorScheme colorScheme,
    bool isScanning,
  ) {
    return Center(
      child: Container(
        width: 250,
        height: 250,
        decoration: BoxDecoration(
          border: Border.all(
            color: isScanning ? colorScheme.primary : Colors.white,
            width: 2,
          ),
          borderRadius: BorderRadius.circular(12),
        ),
        child: Stack(
          children: [
            // Corner indicators
            ...[
              const Alignment.topLeft,
              const Alignment.topRight,
              const Alignment.bottomLeft,
              const Alignment.bottomRight,
            ].map(
              (alignment) => Align(
                alignment: alignment,
                child: Container(
                  width: 20,
                  height: 20,
                  decoration: BoxDecoration(
                    color: isScanning ? colorScheme.primary : Colors.white,
                    borderRadius: BorderRadius.circular(2),
                  ),
                ),
              ),
            ),
            // Scanning line animation
            if (isScanning)
              TweenAnimationBuilder<double>(
                tween: Tween(begin: 0.0, end: 1.0),
                duration: const Duration(seconds: 2),
                builder: (context, value, child) {
                  return Positioned(
                    top: value * 220 + 10,
                    left: 10,
                    right: 10,
                    child: Container(
                      height: 2,
                      decoration: BoxDecoration(
                        gradient: LinearGradient(
                          colors: [
                            Colors.transparent,
                            colorScheme.primary,
                            Colors.transparent,
                          ],
                        ),
                      ),
                    ),
                  );
                },
                onEnd: () {
                  // Restart animation
                },
              ),
          ],
        ),
      ),
    );
  }

  Widget _buildInstructionsOverlay(
    ThemeData theme,
    ColorScheme colorScheme,
  ) {
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: Colors.black.withOpacity(0.7),
        borderRadius: BorderRadius.circular(8),
      ),
      child: Text(
        'Position the QR code within the frame to scan',
        style: theme.textTheme.bodyMedium?.copyWith(
          color: Colors.white,
        ),
        textAlign: TextAlign.center,
      ),
    );
  }

  Widget _buildScannedResultState(
    BuildContext context,
    ThemeData theme,
    ColorScheme colorScheme,
    String scannedCode,
    ValueNotifier<bool> isProcessing,
  ) {
    // Mock asset data based on scanned code
    final mockAsset = _getMockAssetFromCode(scannedCode);
    
    return SingleChildScrollView(
      padding: const EdgeInsets.all(16),
      child: Column(
        children: [
          // Success indicator
          Container(
            width: 80,
            height: 80,
            decoration: BoxDecoration(
              color: Colors.green,
              shape: BoxShape.circle,
            ),
            child: const Icon(
              Icons.check,
              color: Colors.white,
              size: 40,
            ),
          ),
          const SizedBox(height: 24),
          Text(
            'QR Code Scanned Successfully',
            style: theme.textTheme.headlineSmall?.copyWith(
              fontWeight: FontWeight.bold,
            ),
            textAlign: TextAlign.center,
          ),
          const SizedBox(height: 8),
          Text(
            'Code: $scannedCode',
            style: theme.textTheme.bodyLarge?.copyWith(
              color: colorScheme.onSurfaceVariant,
              fontFamily: 'monospace',
            ),
            textAlign: TextAlign.center,
          ),
          const SizedBox(height: 32),
          
          // Asset information card
          if (mockAsset != null) ..[
            Card(
              child: Padding(
                padding: const EdgeInsets.all(16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        Icon(
                          Icons.inventory_2,
                          color: colorScheme.primary,
                        ),
                        const SizedBox(width: 8),
                        Text(
                          'Asset Found',
                          style: theme.textTheme.titleMedium?.copyWith(
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 16),
                    _buildAssetInfoRow('Name', mockAsset['name'], theme),
                    _buildAssetInfoRow('Category', mockAsset['category'], theme),
                    _buildAssetInfoRow('Location', mockAsset['location'], theme),
                    _buildAssetInfoRow('Status', mockAsset['status'], theme),
                    const SizedBox(height: 16),
                    Row(
                      children: [
                        Expanded(
                          child: CustomButton(
                            onPressed: () {
                              context.push('/assets/${mockAsset['id']}');
                            },
                            text: 'View Details',
                            variant: ButtonVariant.outline,
                          ),
                        ),
                        const SizedBox(width: 12),
                        Expanded(
                          child: CustomButton(
                            onPressed: () {
                              context.push('/inspections/create?assetId=${mockAsset['id']}');
                            },
                            text: 'Start Inspection',
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
            ),
          ] else ..[
            Card(
              child: Padding(
                padding: const EdgeInsets.all(16),
                child: Column(
                  children: [
                    Icon(
                      Icons.warning_amber,
                      color: Colors.orange,
                      size: 48,
                    ),
                    const SizedBox(height: 16),
                    Text(
                      'Asset Not Found',
                      style: theme.textTheme.titleMedium?.copyWith(
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    const SizedBox(height: 8),
                    Text(
                      'No asset found with this QR code. The asset may not be registered in the system.',
                      style: theme.textTheme.bodyMedium?.copyWith(
                        color: colorScheme.onSurfaceVariant,
                      ),
                      textAlign: TextAlign.center,
                    ),
                    const SizedBox(height: 16),
                    CustomButton(
                      onPressed: () {
                        context.push('/assets/create?qrCode=$scannedCode');
                      },
                      text: 'Register New Asset',
                      icon: Icons.add,
                    ),
                  ],
                ),
              ),
            ),
          ],
        ],
      ),
    );
  }

  Widget _buildAssetInfoRow(
    String label,
    String value,
    ThemeData theme,
  ) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 8),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          SizedBox(
            width: 80,
            child: Text(
              '$label:',
              style: theme.textTheme.bodyMedium?.copyWith(
                fontWeight: FontWeight.w500,
              ),
            ),
          ),
          Expanded(
            child: Text(
              value,
              style: theme.textTheme.bodyMedium,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildBottomControls(
    BuildContext context,
    ThemeData theme,
    ColorScheme colorScheme,
    ValueNotifier<bool> isScanning,
    bool? hasPermission,
    String? scannedCode,
  ) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: colorScheme.surface,
        border: Border(
          top: BorderSide(
            color: colorScheme.outline,
            width: 1,
          ),
        ),
      ),
      child: Row(
        children: [
          Expanded(
            child: CustomButton(
              onPressed: () {
                context.pop();
              },
              text: 'Cancel',
              variant: ButtonVariant.outline,
            ),
          ),
          const SizedBox(width: 16),
          if (scannedCode != null)
            Expanded(
              child: CustomButton(
                onPressed: () {
                  // Reset scanner
                  isScanning.value = false;
                  // Clear scanned code to return to scanner
                },
                text: 'Scan Again',
                icon: Icons.qr_code_scanner,
              ),
            )
          else if (hasPermission == true)
            Expanded(
              child: CustomButton(
                onPressed: () {
                  isScanning.value = !isScanning.value;
                  if (isScanning.value) {
                    _startScanning(isScanning);
                  }
                },
                text: isScanning.value ? 'Stop Scanning' : 'Start Scanning',
                icon: isScanning.value ? Icons.stop : Icons.play_arrow,
              ),
            ),
        ],
      ),
    );
  }

  Future<void> _checkCameraPermission(ValueNotifier<bool?> hasPermission) async {
    // Simulate permission check
    await Future.delayed(const Duration(milliseconds: 500));
    hasPermission.value = true; // Mock: permission granted
  }

  void _openAppSettings() {
    // In a real app, this would open the device settings
    // For now, just show a message
  }

  void _startScanning(ValueNotifier<bool> isScanning) {
    // Simulate scanning process
    Future.delayed(const Duration(seconds: 3), () {
      if (isScanning.value) {
        // Mock successful scan
        isScanning.value = false;
      }
    });
  }

  void _showManualInputDialog(
    BuildContext context,
    ValueNotifier<String?> scannedCode,
  ) {
    final controller = TextEditingController();
    
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Enter QR Code'),
        content: TextField(
          controller: controller,
          decoration: const InputDecoration(
            labelText: 'QR Code',
            hintText: 'Enter the QR code manually',
            border: OutlineInputBorder(),
          ),
          autofocus: true,
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(context).pop(),
            child: const Text('Cancel'),
          ),
          TextButton(
            onPressed: () {
              if (controller.text.isNotEmpty) {
                scannedCode.value = controller.text;
                Navigator.of(context).pop();
              }
            },
            child: const Text('Submit'),
          ),
        ],
      ),
    );
  }

  Map<String, dynamic>? _getMockAssetFromCode(String code) {
    // Mock asset database lookup
    final mockAssets = {
      'QR001': {
        'id': 'AST001',
        'name': 'Industrial Pump #1',
        'category': 'Equipment',
        'location': 'Warehouse A',
        'status': 'Active',
      },
      'QR002': {
        'id': 'AST002',
        'name': 'Forklift #3',
        'category': 'Vehicles',
        'location': 'Loading Dock',
        'status': 'Active',
      },
      'QR003': {
        'id': 'AST003',
        'name': 'Conveyor Belt Motor',
        'category': 'Machinery',
        'location': 'Production Floor',
        'status': 'Maintenance',
      },
    };
    
    return mockAssets[code];
  }
}