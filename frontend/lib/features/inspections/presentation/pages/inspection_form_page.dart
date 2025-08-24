import 'package:flutter/material.dart';
import 'package:flutter_hooks/flutter_hooks.dart';
import 'package:hooks_riverpod/hooks_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../../shared/presentation/widgets/responsive_scaffold.dart';
import '../../../../shared/presentation/widgets/loading_widget.dart';
import '../../../../shared/presentation/widgets/error_widget.dart';
import '../../../../core/constants/app_constants.dart';
import '../providers/inspection_provider.dart';
import '../widgets/dynamic_form_widget.dart';
import '../../domain/entities/inspection.dart';

/// Page for filling out inspection forms
class InspectionFormPage extends HookConsumerWidget {
  final String? inspectionId;
  final String? formTemplateId;
  
  const InspectionFormPage({
    super.key,
    this.inspectionId,
    this.formTemplateId,
  });

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final theme = Theme.of(context);
    final colorScheme = theme.colorScheme;
    
    // Watch form state
    final formState = ref.watch(inspectionFormNotifierProvider(inspectionId));
    final formNotifier = ref.read(inspectionFormNotifierProvider(inspectionId).notifier);
    
    // Watch inspection detail if editing
    final inspectionAsync = inspectionId != null 
        ? ref.watch(inspectionDetailProvider(inspectionId!))
        : const AsyncValue.data(null);
    
    // Handle back navigation with unsaved changes
    useEffect(() {
      bool onWillPop() {
        if (formState.hasChanges) {
          _showUnsavedChangesDialog(context);
          return false;
        }
        return true;
      }
      
      // Note: This would need to be implemented with proper back button handling
      return null;
    }, [formState.hasChanges]);
    
    return ResponsiveScaffold(
      title: inspectionId != null ? 'Edit Inspection' : 'New Inspection',
      actions: [
        if (formState.hasChanges)
          TextButton(
            onPressed: formState.isSaving ? null : () async {
              await formNotifier.saveDraft();
              if (context.mounted) {
                ScaffoldMessenger.of(context).showSnackBar(
                  const SnackBar(content: Text('Draft saved successfully')),
                );
              }
            },
            child: formState.isSaving 
                ? const SizedBox(
                    width: 16,
                    height: 16,
                    child: CircularProgressIndicator(strokeWidth: 2),
                  )
                : const Text('Save Draft'),
          ),
        FilledButton(
          onPressed: _canSubmit(formState) && !formState.isSaving ? () async {
            final success = await formNotifier.completeInspection();
            if (success && context.mounted) {
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(content: Text('Inspection completed successfully')),
              );
              context.pop();
            }
          } : null,
          child: formState.isSaving 
              ? const SizedBox(
                  width: 16,
                  height: 16,
                  child: CircularProgressIndicator(
                    strokeWidth: 2,
                    color: Colors.white,
                  ),
                )
              : const Text('Complete'),
        ),
      ],
      body: inspectionAsync.when(
        data: (inspection) {
          if (formState.error != null) {
            return ErrorDisplayWidget(
              error: formState.error!,
              onRetry: () {
                if (inspectionId != null) {
                  formNotifier.loadInspection(inspectionId!);
                }
              },
            );
          }
          
          // Show loading while form template is being loaded
          if (formState.inspectionId == null && formTemplateId == null) {
            return const LoadingWidget(
              message: 'Loading form template...',
            );
          }
          
          return DynamicFormWidget(
            inspectionId: inspectionId,
            formTemplateId: formTemplateId,
            isReadOnly: false,
          );
        },
        loading: () => const LoadingWidget(
          message: 'Loading inspection...',
        ),
        error: (error, stackTrace) => ErrorDisplayWidget(
          error: error.toString(),
          onRetry: () {
            if (inspectionId != null) {
              ref.invalidate(inspectionDetailProvider(inspectionId!));
            }
          },
        ),
      ),
    );
  }
  
  bool _canSubmit(InspectionFormState formState) {
    // Check if all required fields are filled
    // This would need to be implemented based on form template requirements
    return formState.responses.isNotEmpty;
  }
  
  Future<void> _showUnsavedChangesDialog(BuildContext context) async {
    final result = await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Unsaved Changes'),
        content: const Text(
          'You have unsaved changes. Are you sure you want to leave without saving?',
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(context).pop(false),
            child: const Text('Cancel'),
          ),
          FilledButton(
            onPressed: () => Navigator.of(context).pop(true),
            style: FilledButton.styleFrom(
              backgroundColor: Theme.of(context).colorScheme.error,
            ),
            child: const Text('Leave'),
          ),
        ],
      ),
    );
    
    if (result == true && context.mounted) {
      context.pop();
    }
  }


}