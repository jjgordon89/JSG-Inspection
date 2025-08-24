import 'dart:io';
import 'dart:typed_data';
import 'package:flutter/material.dart';
import 'package:flutter_hooks/flutter_hooks.dart';
import 'package:signature/signature.dart';
import 'package:path_provider/path_provider.dart';
import 'package:uuid/uuid.dart';

class SignaturePadWidget extends HookWidget {
  final String? signaturePath;
  final Function(String?) onSignatureChanged;
  final bool isReadOnly;
  final double height;
  final Color? backgroundColor;
  final Color? penColor;
  final double penStrokeWidth;

  const SignaturePadWidget({
    super.key,
    this.signaturePath,
    required this.onSignatureChanged,
    this.isReadOnly = false,
    this.height = 200,
    this.backgroundColor,
    this.penColor,
    this.penStrokeWidth = 2.0,
  });

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final signatureController = useMemoized(
      () => SignatureController(
        penStrokeWidth: penStrokeWidth,
        penColor: penColor ?? theme.colorScheme.primary,
        exportBackgroundColor: backgroundColor ?? theme.colorScheme.surface,
      ),
    );
    final hasSignature = useState(signaturePath != null);

    useEffect(() {
      void onSignatureChange() {
        hasSignature.value = signatureController.isNotEmpty;
      }

      signatureController.addListener(onSignatureChange);
      return () => signatureController.removeListener(onSignatureChange);
    }, [signatureController]);

    Future<void> _saveSignature() async {
      if (signatureController.isEmpty) return;

      try {
        final Uint8List? data = await signatureController.toPngBytes();
        if (data != null) {
          final directory = await getApplicationDocumentsDirectory();
          final signatureDir = Directory('${directory.path}/signatures');
          if (!await signatureDir.exists()) {
            await signatureDir.create(recursive: true);
          }

          final fileName = 'signature_${const Uuid().v4()}.png';
          final file = File('${signatureDir.path}/$fileName');
          await file.writeAsBytes(data);

          onSignatureChanged(file.path);
        }
      } catch (e) {
        if (context.mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: Text('Failed to save signature: $e'),
              backgroundColor: theme.colorScheme.error,
            ),
          );
        }
      }
    }

    void _clearSignature() {
      signatureController.clear();
      onSignatureChanged(null);
      hasSignature.value = false;
    }

    void _showSignatureDialog() {
      showDialog(
        context: context,
        barrierDismissible: false,
        builder: (context) => _SignatureDialog(
          controller: signatureController,
          onSave: () {
            Navigator.pop(context);
            _saveSignature();
          },
          onCancel: () {
            Navigator.pop(context);
            signatureController.clear();
          },
          theme: theme,
          backgroundColor: backgroundColor,
        ),
      );
    }

    if (isReadOnly && signaturePath != null) {
      return _buildReadOnlySignature(context, theme);
    }

    if (signaturePath != null) {
      return _buildExistingSignature(context, theme);
    }

    return _buildSignaturePad(context, theme, signatureController, hasSignature);
  }

  Widget _buildReadOnlySignature(BuildContext context, ThemeData theme) {
    return Container(
      width: double.infinity,
      height: height,
      decoration: BoxDecoration(
        color: theme.colorScheme.surfaceVariant.withOpacity(0.3),
        borderRadius: BorderRadius.circular(8),
        border: Border.all(
          color: theme.colorScheme.outline.withOpacity(0.3),
        ),
      ),
      child: ClipRRect(
        borderRadius: BorderRadius.circular(8),
        child: Image.file(
          File(signaturePath!),
          fit: BoxFit.contain,
          errorBuilder: (context, error, stackTrace) {
            return Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Icon(
                    Icons.broken_image,
                    size: 48,
                    color: theme.colorScheme.onSurfaceVariant,
                  ),
                  const SizedBox(height: 8),
                  Text(
                    'Signature not found',
                    style: theme.textTheme.bodyMedium?.copyWith(
                      color: theme.colorScheme.onSurfaceVariant,
                    ),
                  ),
                ],
              ),
            );
          },
        ),
      ),
    );
  }

  Widget _buildExistingSignature(BuildContext context, ThemeData theme) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Container(
          width: double.infinity,
          height: height,
          decoration: BoxDecoration(
            color: backgroundColor ?? theme.colorScheme.surface,
            borderRadius: BorderRadius.circular(8),
            border: Border.all(
              color: theme.colorScheme.outline.withOpacity(0.3),
            ),
          ),
          child: ClipRRect(
            borderRadius: BorderRadius.circular(8),
            child: Image.file(
              File(signaturePath!),
              fit: BoxFit.contain,
            ),
          ),
        ),
        const SizedBox(height: 12),
        Row(
          children: [
            Expanded(
              child: OutlinedButton.icon(
                onPressed: _showSignatureDialog,
                icon: const Icon(Icons.edit),
                label: const Text('Edit Signature'),
              ),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: OutlinedButton.icon(
                onPressed: _clearSignature,
                icon: const Icon(Icons.clear),
                label: const Text('Clear'),
                style: OutlinedButton.styleFrom(
                  foregroundColor: theme.colorScheme.error,
                  side: BorderSide(color: theme.colorScheme.error),
                ),
              ),
            ),
          ],
        ),
      ],
    );
  }

  Widget _buildSignaturePad(BuildContext context, ThemeData theme, SignatureController controller, ValueNotifier<bool> hasSignature) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Container(
          width: double.infinity,
          height: height,
          decoration: BoxDecoration(
            color: backgroundColor ?? theme.colorScheme.surface,
            borderRadius: BorderRadius.circular(8),
            border: Border.all(
              color: theme.colorScheme.outline.withOpacity(0.3),
            ),
          ),
          child: ClipRRect(
            borderRadius: BorderRadius.circular(8),
            child: Signature(
              controller: controller,
              backgroundColor: backgroundColor ?? theme.colorScheme.surface,
            ),
          ),
        ),
        const SizedBox(height: 12),
        Row(
          children: [
            Expanded(
              child: OutlinedButton.icon(
                onPressed: controller.clear,
                icon: const Icon(Icons.clear),
                label: const Text('Clear'),
              ),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: FilledButton.icon(
                onPressed: hasSignature.value ? _saveSignature : null,
                icon: const Icon(Icons.save),
                label: const Text('Save'),
              ),
            ),
          ],
        ),
        const SizedBox(height: 8),
        Row(
          children: [
            Icon(
              Icons.info_outline,
              size: 16,
              color: theme.colorScheme.onSurfaceVariant,
            ),
            const SizedBox(width: 8),
            Expanded(
              child: Text(
                'Draw your signature in the box above',
                style: theme.textTheme.bodySmall?.copyWith(
                  color: theme.colorScheme.onSurfaceVariant,
                ),
              ),
            ),
          ],
        ),
      ],
    );
  }
}

class _SignatureDialog extends StatelessWidget {
  final SignatureController controller;
  final VoidCallback onSave;
  final VoidCallback onCancel;
  final ThemeData theme;
  final Color? backgroundColor;

  const _SignatureDialog({
    required this.controller,
    required this.onSave,
    required this.onCancel,
    required this.theme,
    this.backgroundColor,
  });

  @override
  Widget build(BuildContext context) {
    return Dialog(
      child: Container(
        width: MediaQuery.of(context).size.width * 0.9,
        height: MediaQuery.of(context).size.height * 0.7,
        padding: const EdgeInsets.all(16),
        child: Column(
          children: [
            Row(
              children: [
                Text(
                  'Add Signature',
                  style: theme.textTheme.titleLarge?.copyWith(
                    fontWeight: FontWeight.w600,
                  ),
                ),
                const Spacer(),
                IconButton(
                  onPressed: onCancel,
                  icon: const Icon(Icons.close),
                ),
              ],
            ),
            const SizedBox(height: 16),
            Expanded(
              child: Container(
                width: double.infinity,
                decoration: BoxDecoration(
                  color: backgroundColor ?? theme.colorScheme.surface,
                  borderRadius: BorderRadius.circular(8),
                  border: Border.all(
                    color: theme.colorScheme.outline.withOpacity(0.3),
                  ),
                ),
                child: ClipRRect(
                  borderRadius: BorderRadius.circular(8),
                  child: Signature(
                    controller: controller,
                    backgroundColor: backgroundColor ?? theme.colorScheme.surface,
                  ),
                ),
              ),
            ),
            const SizedBox(height: 16),
            Row(
              children: [
                Expanded(
                  child: OutlinedButton(
                    onPressed: controller.clear,
                    child: const Text('Clear'),
                  ),
                ),
                const SizedBox(width: 16),
                Expanded(
                  child: FilledButton(
                    onPressed: onSave,
                    child: const Text('Save'),
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}