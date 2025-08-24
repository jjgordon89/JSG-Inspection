import 'package:flutter/material.dart';
import 'package:flutter_hooks/flutter_hooks.dart';
import 'package:hooks_riverpod/hooks_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../../shared/presentation/widgets/responsive_scaffold.dart';
import '../../../../shared/presentation/widgets/loading_overlay.dart';
import '../../../../shared/presentation/widgets/custom_button.dart';
import '../../../../shared/presentation/widgets/custom_text_field.dart';
import '../../../../core/utils/validators.dart';
import '../../../../core/constants/app_constants.dart';

/// Page for creating a new asset
class CreateAssetPage extends HookConsumerWidget {
  const CreateAssetPage({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final theme = Theme.of(context);
    final colorScheme = theme.colorScheme;
    final formKey = useMemoized(() => GlobalKey<FormState>());
    final isLoading = useState(false);
    final currentStep = useState(0);
    
    // Form controllers
    final nameController = useTextEditingController();
    final categoryController = useTextEditingController();
    final locationController = useTextEditingController();
    final manufacturerController = useTextEditingController();
    final modelController = useTextEditingController();
    final serialNumberController = useTextEditingController();
    final purchaseDateController = useTextEditingController();
    final warrantyExpiryController = useTextEditingController();
    final descriptionController = useTextEditingController();
    
    // Dropdown values
    final selectedCategory = useState<String?>('Equipment');
    final selectedStatus = useState<String?>('Active');
    final selectedLocation = useState<String?>('Warehouse A');
    
    final steps = [
      'Basic Information',
      'Technical Details',
      'Additional Information',
    ];

    return ResponsiveScaffold(
      title: 'Create Asset',
      body: LoadingOverlay(
        isLoading: isLoading.value,
        child: Column(
          children: [
            _buildStepIndicator(theme, colorScheme, currentStep.value, steps),
            Expanded(
              child: Form(
                key: formKey,
                child: _buildStepContent(
                  context,
                  theme,
                  colorScheme,
                  currentStep.value,
                  nameController,
                  categoryController,
                  locationController,
                  manufacturerController,
                  modelController,
                  serialNumberController,
                  purchaseDateController,
                  warrantyExpiryController,
                  descriptionController,
                  selectedCategory,
                  selectedStatus,
                  selectedLocation,
                ),
              ),
            ),
            _buildNavigationButtons(
              context,
              theme,
              colorScheme,
              currentStep,
              steps.length,
              formKey,
              isLoading,
              {
                'name': nameController.text,
                'category': selectedCategory.value,
                'location': selectedLocation.value,
                'manufacturer': manufacturerController.text,
                'model': modelController.text,
                'serialNumber': serialNumberController.text,
                'purchaseDate': purchaseDateController.text,
                'warrantyExpiry': warrantyExpiryController.text,
                'description': descriptionController.text,
                'status': selectedStatus.value,
              },
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildStepIndicator(
    ThemeData theme,
    ColorScheme colorScheme,
    int currentStep,
    List<String> steps,
  ) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: colorScheme.surface,
        border: Border(
          bottom: BorderSide(
            color: colorScheme.outline,
            width: 1,
          ),
        ),
      ),
      child: Column(
        children: [
          Row(
            children: List.generate(
              steps.length,
              (index) => Expanded(
                child: Row(
                  children: [
                    Expanded(
                      child: _buildStepItem(
                        theme,
                        colorScheme,
                        index,
                        currentStep,
                        steps[index],
                      ),
                    ),
                    if (index < steps.length - 1)
                      Container(
                        height: 2,
                        width: 24,
                        color: index < currentStep
                            ? colorScheme.primary
                            : colorScheme.outline,
                      ),
                  ],
                ),
              ),
            ),
          ),
          const SizedBox(height: 8),
          LinearProgressIndicator(
            value: (currentStep + 1) / steps.length,
            backgroundColor: colorScheme.outline.withOpacity(0.3),
            valueColor: AlwaysStoppedAnimation<Color>(colorScheme.primary),
          ),
        ],
      ),
    );
  }

  Widget _buildStepItem(
    ThemeData theme,
    ColorScheme colorScheme,
    int index,
    int currentStep,
    String title,
  ) {
    final isActive = index == currentStep;
    final isCompleted = index < currentStep;
    
    return Column(
      children: [
        Container(
          width: 32,
          height: 32,
          decoration: BoxDecoration(
            color: isCompleted || isActive
                ? colorScheme.primary
                : colorScheme.outline.withOpacity(0.3),
            shape: BoxShape.circle,
          ),
          child: Center(
            child: isCompleted
                ? Icon(
                    Icons.check,
                    color: colorScheme.onPrimary,
                    size: 16,
                  )
                : Text(
                    '${index + 1}',
                    style: theme.textTheme.bodySmall?.copyWith(
                      color: isActive
                          ? colorScheme.onPrimary
                          : colorScheme.onSurfaceVariant,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
          ),
        ),
        const SizedBox(height: 4),
        Text(
          title,
          style: theme.textTheme.bodySmall?.copyWith(
            color: isActive
                ? colorScheme.primary
                : colorScheme.onSurfaceVariant,
            fontWeight: isActive ? FontWeight.w600 : FontWeight.normal,
          ),
          textAlign: TextAlign.center,
        ),
      ],
    );
  }

  Widget _buildStepContent(
    BuildContext context,
    ThemeData theme,
    ColorScheme colorScheme,
    int currentStep,
    TextEditingController nameController,
    TextEditingController categoryController,
    TextEditingController locationController,
    TextEditingController manufacturerController,
    TextEditingController modelController,
    TextEditingController serialNumberController,
    TextEditingController purchaseDateController,
    TextEditingController warrantyExpiryController,
    TextEditingController descriptionController,
    ValueNotifier<String?> selectedCategory,
    ValueNotifier<String?> selectedStatus,
    ValueNotifier<String?> selectedLocation,
  ) {
    switch (currentStep) {
      case 0:
        return _buildBasicInformationStep(
          context,
          theme,
          colorScheme,
          nameController,
          selectedCategory,
          selectedStatus,
          selectedLocation,
        );
      case 1:
        return _buildTechnicalDetailsStep(
          context,
          theme,
          colorScheme,
          manufacturerController,
          modelController,
          serialNumberController,
          purchaseDateController,
          warrantyExpiryController,
        );
      case 2:
        return _buildAdditionalInformationStep(
          context,
          theme,
          colorScheme,
          descriptionController,
        );
      default:
        return const SizedBox.shrink();
    }
  }

  Widget _buildBasicInformationStep(
    BuildContext context,
    ThemeData theme,
    ColorScheme colorScheme,
    TextEditingController nameController,
    ValueNotifier<String?> selectedCategory,
    ValueNotifier<String?> selectedStatus,
    ValueNotifier<String?> selectedLocation,
  ) {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'Basic Information',
            style: theme.textTheme.headlineSmall?.copyWith(
              fontWeight: FontWeight.bold,
            ),
          ),
          const SizedBox(height: 8),
          Text(
            'Enter the basic details for the new asset.',
            style: theme.textTheme.bodyMedium?.copyWith(
              color: colorScheme.onSurfaceVariant,
            ),
          ),
          const SizedBox(height: 24),
          CustomTextField(
            controller: nameController,
            label: 'Asset Name *',
            hintText: 'Enter asset name',
            validator: Validators.required('Asset name is required'),
          ),
          const SizedBox(height: 16),
          DropdownButtonFormField<String>(
            value: selectedCategory.value,
            decoration: const InputDecoration(
              labelText: 'Category *',
              border: OutlineInputBorder(),
            ),
            items: ['Equipment', 'Vehicles', 'Machinery', 'Tools', 'Furniture']
                .map((category) => DropdownMenuItem(
                      value: category,
                      child: Text(category),
                    ))
                .toList(),
            onChanged: (value) {
              selectedCategory.value = value;
            },
            validator: (value) {
              if (value == null || value.isEmpty) {
                return 'Please select a category';
              }
              return null;
            },
          ),
          const SizedBox(height: 16),
          DropdownButtonFormField<String>(
            value: selectedLocation.value,
            decoration: const InputDecoration(
              labelText: 'Location *',
              border: OutlineInputBorder(),
            ),
            items: [
              'Warehouse A',
              'Warehouse B',
              'Production Floor',
              'Office Building',
              'Maintenance Shop',
              'Tool Room',
            ]
                .map((location) => DropdownMenuItem(
                      value: location,
                      child: Text(location),
                    ))
                .toList(),
            onChanged: (value) {
              selectedLocation.value = value;
            },
            validator: (value) {
              if (value == null || value.isEmpty) {
                return 'Please select a location';
              }
              return null;
            },
          ),
          const SizedBox(height: 16),
          DropdownButtonFormField<String>(
            value: selectedStatus.value,
            decoration: const InputDecoration(
              labelText: 'Status *',
              border: OutlineInputBorder(),
            ),
            items: ['Active', 'Inactive', 'Maintenance']
                .map((status) => DropdownMenuItem(
                      value: status,
                      child: Text(status),
                    ))
                .toList(),
            onChanged: (value) {
              selectedStatus.value = value;
            },
            validator: (value) {
              if (value == null || value.isEmpty) {
                return 'Please select a status';
              }
              return null;
            },
          ),
        ],
      ),
    );
  }

  Widget _buildTechnicalDetailsStep(
    BuildContext context,
    ThemeData theme,
    ColorScheme colorScheme,
    TextEditingController manufacturerController,
    TextEditingController modelController,
    TextEditingController serialNumberController,
    TextEditingController purchaseDateController,
    TextEditingController warrantyExpiryController,
  ) {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'Technical Details',
            style: theme.textTheme.headlineSmall?.copyWith(
              fontWeight: FontWeight.bold,
            ),
          ),
          const SizedBox(height: 8),
          Text(
            'Provide technical specifications and purchase information.',
            style: theme.textTheme.bodyMedium?.copyWith(
              color: colorScheme.onSurfaceVariant,
            ),
          ),
          const SizedBox(height: 24),
          CustomTextField(
            controller: manufacturerController,
            label: 'Manufacturer',
            hintText: 'Enter manufacturer name',
          ),
          const SizedBox(height: 16),
          CustomTextField(
            controller: modelController,
            label: 'Model',
            hintText: 'Enter model number/name',
          ),
          const SizedBox(height: 16),
          CustomTextField(
            controller: serialNumberController,
            label: 'Serial Number',
            hintText: 'Enter serial number',
          ),
          const SizedBox(height: 16),
          CustomTextField(
            controller: purchaseDateController,
            label: 'Purchase Date',
            hintText: 'YYYY-MM-DD',
            suffixIcon: IconButton(
              onPressed: () async {
                final date = await showDatePicker(
                  context: context,
                  initialDate: DateTime.now(),
                  firstDate: DateTime(2000),
                  lastDate: DateTime.now(),
                );
                if (date != null) {
                  purchaseDateController.text =
                      '${date.year}-${date.month.toString().padLeft(2, '0')}-${date.day.toString().padLeft(2, '0')}';
                }
              },
              icon: const Icon(Icons.calendar_today),
            ),
          ),
          const SizedBox(height: 16),
          CustomTextField(
            controller: warrantyExpiryController,
            label: 'Warranty Expiry',
            hintText: 'YYYY-MM-DD',
            suffixIcon: IconButton(
              onPressed: () async {
                final date = await showDatePicker(
                  context: context,
                  initialDate: DateTime.now(),
                  firstDate: DateTime.now(),
                  lastDate: DateTime(2030),
                );
                if (date != null) {
                  warrantyExpiryController.text =
                      '${date.year}-${date.month.toString().padLeft(2, '0')}-${date.day.toString().padLeft(2, '0')}';
                }
              },
              icon: const Icon(Icons.calendar_today),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildAdditionalInformationStep(
    BuildContext context,
    ThemeData theme,
    ColorScheme colorScheme,
    TextEditingController descriptionController,
  ) {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'Additional Information',
            style: theme.textTheme.headlineSmall?.copyWith(
              fontWeight: FontWeight.bold,
            ),
          ),
          const SizedBox(height: 8),
          Text(
            'Add any additional details or notes about the asset.',
            style: theme.textTheme.bodyMedium?.copyWith(
              color: colorScheme.onSurfaceVariant,
            ),
          ),
          const SizedBox(height: 24),
          CustomTextField(
            controller: descriptionController,
            label: 'Description',
            hintText: 'Enter detailed description of the asset...',
            maxLines: 6,
          ),
          const SizedBox(height: 24),
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: colorScheme.primaryContainer.withOpacity(0.3),
              borderRadius: BorderRadius.circular(12),
              border: Border.all(
                color: colorScheme.primary.withOpacity(0.3),
              ),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    Icon(
                      Icons.info_outline,
                      color: colorScheme.primary,
                      size: 20,
                    ),
                    const SizedBox(width: 8),
                    Text(
                      'Next Steps',
                      style: theme.textTheme.titleSmall?.copyWith(
                        color: colorScheme.primary,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 8),
                Text(
                  'After creating the asset, you can:',
                  style: theme.textTheme.bodyMedium?.copyWith(
                    color: colorScheme.onSurfaceVariant,
                  ),
                ),
                const SizedBox(height: 8),
                _buildNextStepItem(
                  theme,
                  colorScheme,
                  Icons.qr_code,
                  'Generate and print QR codes for easy identification',
                ),
                _buildNextStepItem(
                  theme,
                  colorScheme,
                  Icons.assignment,
                  'Create inspection templates and schedules',
                ),
                _buildNextStepItem(
                  theme,
                  colorScheme,
                  Icons.photo_camera,
                  'Add photos and documentation',
                ),
                _buildNextStepItem(
                  theme,
                  colorScheme,
                  Icons.location_on,
                  'Set precise GPS coordinates',
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildNextStepItem(
    ThemeData theme,
    ColorScheme colorScheme,
    IconData icon,
    String text,
  ) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 4),
      child: Row(
        children: [
          Icon(
            icon,
            size: 16,
            color: colorScheme.primary,
          ),
          const SizedBox(width: 8),
          Expanded(
            child: Text(
              text,
              style: theme.textTheme.bodySmall?.copyWith(
                color: colorScheme.onSurfaceVariant,
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildNavigationButtons(
    BuildContext context,
    ThemeData theme,
    ColorScheme colorScheme,
    ValueNotifier<int> currentStep,
    int totalSteps,
    GlobalKey<FormState> formKey,
    ValueNotifier<bool> isLoading,
    Map<String, dynamic> formData,
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
          if (currentStep.value > 0)
            Expanded(
              child: CustomButton(
                onPressed: () {
                  currentStep.value--;
                },
                text: 'Previous',
                variant: ButtonVariant.outline,
              ),
            ),
          if (currentStep.value > 0) const SizedBox(width: 16),
          Expanded(
            flex: currentStep.value == 0 ? 1 : 1,
            child: CustomButton(
              onPressed: () async {
                if (currentStep.value < totalSteps - 1) {
                  // Validate current step
                  if (formKey.currentState?.validate() ?? false) {
                    currentStep.value++;
                  }
                } else {
                  // Final step - create asset
                  if (formKey.currentState?.validate() ?? false) {
                    await _createAsset(context, isLoading, formData);
                  }
                }
              },
              text: currentStep.value < totalSteps - 1 ? 'Next' : 'Create Asset',
              icon: currentStep.value < totalSteps - 1 ? Icons.arrow_forward : Icons.save,
            ),
          ),
        ],
      ),
    );
  }

  Future<void> _createAsset(
    BuildContext context,
    ValueNotifier<bool> isLoading,
    Map<String, dynamic> formData,
  ) async {
    isLoading.value = true;
    
    try {
      // Simulate API call
      await Future.delayed(const Duration(seconds: 2));
      
      // Generate asset ID
      final assetId = 'AST-${DateTime.now().millisecondsSinceEpoch.toString().substring(8)}';
      
      if (context.mounted) {
        // Show success message
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Asset "${formData['name']}" created successfully'),
            backgroundColor: Colors.green,
          ),
        );
        
        // Navigate back to assets list
        context.pop();
      }
    } catch (error) {
      if (context.mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Failed to create asset: $error'),
            backgroundColor: Colors.red,
          ),
        );
      }
    } finally {
      isLoading.value = false;
    }
  }
}