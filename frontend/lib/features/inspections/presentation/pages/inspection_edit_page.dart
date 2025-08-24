import 'package:flutter/material.dart';
import 'package:flutter_hooks/flutter_hooks.dart';
import 'package:hooks_riverpod/hooks_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../../shared/presentation/widgets/responsive_scaffold.dart';
import '../../../../shared/presentation/widgets/loading_overlay.dart';
import '../../../../shared/presentation/widgets/custom_button.dart';
import '../../../../shared/presentation/widgets/custom_text_field.dart';
import '../../../../app/router/app_router.dart';
import '../../../../core/constants/app_constants.dart';
import '../../../../core/utils/validators.dart';

/// Page for editing/creating inspections with dynamic form fields
class InspectionEditPage extends HookConsumerWidget {
  final String? inspectionId;

  const InspectionEditPage({
    super.key,
    this.inspectionId,
  });

  bool get isEditing => inspectionId != null;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final theme = Theme.of(context);
    final colorScheme = theme.colorScheme;
    final formKey = useMemoized(() => GlobalKey<FormState>());
    final isLoading = useState(false);
    final isSaving = useState(false);
    final currentStep = useState(0);
    
    // Form controllers
    final titleController = useTextEditingController();
    final notesController = useTextEditingController();
    final responses = useState<Map<String, dynamic>>({});
    final photos = useState<Map<String, List<String>>>({});
    final signature = useState<String?>(null);
    
    // Mock form template
    final formTemplate = useState(_getMockFormTemplate());
    
    // Load existing inspection data if editing
    useEffect(() {
      if (isEditing) {
        _loadInspectionData(titleController, notesController, responses, photos, signature);
      }
      return null;
    }, [inspectionId]);

    return ResponsiveScaffold(
      title: isEditing ? 'Edit Inspection' : 'New Inspection',
      actions: [
        if (currentStep.value > 0)
          TextButton(
            onPressed: () {
              currentStep.value = currentStep.value - 1;
            },
            child: const Text('Previous'),
          ),
        TextButton(
          onPressed: () {
            _saveDraft(context, titleController, notesController, responses, photos, signature);
          },
          child: const Text('Save Draft'),
        ),
      ],
      body: LoadingOverlay(
        isLoading: isLoading.value,
        child: Column(
          children: [
            _buildProgressIndicator(theme, colorScheme, currentStep.value, formTemplate.value.sections.length),
            Expanded(
              child: Form(
                key: formKey,
                child: _buildStepContent(
                  context,
                  theme,
                  colorScheme,
                  currentStep.value,
                  formTemplate.value,
                  titleController,
                  notesController,
                  responses,
                  photos,
                  signature,
                ),
              ),
            ),
            _buildNavigationButtons(
              context,
              theme,
              colorScheme,
              formKey,
              currentStep,
              formTemplate.value.sections.length,
              isSaving,
              titleController,
              notesController,
              responses,
              photos,
              signature,
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildProgressIndicator(
    ThemeData theme,
    ColorScheme colorScheme,
    int currentStep,
    int totalSteps,
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
            children: [
              Text(
                'Step ${currentStep + 1} of $totalSteps',
                style: theme.textTheme.titleMedium?.copyWith(
                  fontWeight: FontWeight.w600,
                ),
              ),
              const Spacer(),
              Text(
                '${((currentStep + 1) / totalSteps * 100).round()}% Complete',
                style: theme.textTheme.bodyMedium?.copyWith(
                  color: colorScheme.onSurfaceVariant,
                ),
              ),
            ],
          ),
          const SizedBox(height: 8),
          LinearProgressIndicator(
            value: (currentStep + 1) / totalSteps,
            backgroundColor: colorScheme.surfaceVariant,
            valueColor: AlwaysStoppedAnimation<Color>(colorScheme.primary),
          ),
        ],
      ),
    );
  }

  Widget _buildStepContent(
    BuildContext context,
    ThemeData theme,
    ColorScheme colorScheme,
    int currentStep,
    MockFormTemplate template,
    TextEditingController titleController,
    TextEditingController notesController,
    ValueNotifier<Map<String, dynamic>> responses,
    ValueNotifier<Map<String, List<String>>> photos,
    ValueNotifier<String?> signature,
  ) {
    if (currentStep == 0) {
      return _buildBasicInfoStep(theme, colorScheme, titleController, notesController);
    } else if (currentStep <= template.sections.length) {
      final section = template.sections[currentStep - 1];
      return _buildFormSection(context, theme, colorScheme, section, responses, photos);
    } else {
      return _buildSignatureStep(theme, colorScheme, signature);
    }
  }

  Widget _buildBasicInfoStep(
    ThemeData theme,
    ColorScheme colorScheme,
    TextEditingController titleController,
    TextEditingController notesController,
  ) {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'Basic Information',
            style: theme.textTheme.headlineSmall?.copyWith(
              fontWeight: FontWeight.w600,
            ),
          ),
          const SizedBox(height: 24),
          CustomTextField(
            controller: titleController,
            label: 'Inspection Title',
            hintText: 'Enter inspection title',
            validator: Validators.required('Title is required'),
          ),
          const SizedBox(height: 16),
          _buildAssetSelector(theme, colorScheme),
          const SizedBox(height: 16),
          _buildLocationSelector(theme, colorScheme),
          const SizedBox(height: 16),
          CustomTextField(
            controller: notesController,
            label: 'Notes (Optional)',
            hintText: 'Add any additional notes',
            maxLines: 3,
          ),
        ],
      ),
    );
  }

  Widget _buildAssetSelector(
    ThemeData theme,
    ColorScheme colorScheme,
  ) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'Asset',
          style: theme.textTheme.labelLarge,
        ),
        const SizedBox(height: 8),
        Container(
          width: double.infinity,
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            border: Border.all(color: colorScheme.outline),
            borderRadius: BorderRadius.circular(8),
          ),
          child: Row(
            children: [
              Icon(
                Icons.precision_manufacturing,
                color: colorScheme.onSurfaceVariant,
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'Forklift #001',
                      style: theme.textTheme.bodyLarge?.copyWith(
                        fontWeight: FontWeight.w500,
                      ),
                    ),
                    Text(
                      'ID: FL-001',
                      style: theme.textTheme.bodySmall?.copyWith(
                        color: colorScheme.onSurfaceVariant,
                      ),
                    ),
                  ],
                ),
              ),
              IconButton(
                onPressed: () {
                  _showAssetSelector(context);
                },
                icon: const Icon(Icons.edit),
              ),
            ],
          ),
        ),
      ],
    );
  }

  Widget _buildLocationSelector(
    ThemeData theme,
    ColorScheme colorScheme,
  ) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'Location',
          style: theme.textTheme.labelLarge,
        ),
        const SizedBox(height: 8),
        Container(
          width: double.infinity,
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            border: Border.all(color: colorScheme.outline),
            borderRadius: BorderRadius.circular(8),
          ),
          child: Row(
            children: [
              Icon(
                Icons.location_on_outlined,
                color: colorScheme.onSurfaceVariant,
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Text(
                  'Warehouse A - Section 3',
                  style: theme.textTheme.bodyLarge?.copyWith(
                    fontWeight: FontWeight.w500,
                  ),
                ),
              ),
              IconButton(
                onPressed: () {
                  _getCurrentLocation(context);
                },
                icon: const Icon(Icons.my_location),
              ),
            ],
          ),
        ),
      ],
    );
  }

  Widget _buildFormSection(
    BuildContext context,
    ThemeData theme,
    ColorScheme colorScheme,
    MockFormSection section,
    ValueNotifier<Map<String, dynamic>> responses,
    ValueNotifier<Map<String, List<String>>> photos,
  ) {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            section.title,
            style: theme.textTheme.headlineSmall?.copyWith(
              fontWeight: FontWeight.w600,
            ),
          ),
          if (section.description != null) ..[
            const SizedBox(height: 8),
            Text(
              section.description!,
              style: theme.textTheme.bodyMedium?.copyWith(
                color: colorScheme.onSurfaceVariant,
              ),
            ),
          ],
          const SizedBox(height: 24),
          ...section.questions.map((question) => 
            _buildQuestionWidget(context, theme, colorScheme, question, responses, photos)
          ).toList(),
        ],
      ),
    );
  }

  Widget _buildQuestionWidget(
    BuildContext context,
    ThemeData theme,
    ColorScheme colorScheme,
    MockQuestion question,
    ValueNotifier<Map<String, dynamic>> responses,
    ValueNotifier<Map<String, List<String>>> photos,
  ) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 24),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Expanded(
                child: Text(
                  question.text,
                  style: theme.textTheme.titleMedium?.copyWith(
                    fontWeight: FontWeight.w500,
                  ),
                ),
              ),
              if (question.isRequired)
                Text(
                  '*',
                  style: TextStyle(
                    color: colorScheme.error,
                    fontSize: 16,
                    fontWeight: FontWeight.bold,
                  ),
                ),
            ],
          ),
          if (question.description != null) ..[
            const SizedBox(height: 4),
            Text(
              question.description!,
              style: theme.textTheme.bodySmall?.copyWith(
                color: colorScheme.onSurfaceVariant,
              ),
            ),
          ],
          const SizedBox(height: 12),
          _buildQuestionInput(context, theme, colorScheme, question, responses, photos),
        ],
      ),
    );
  }

  Widget _buildQuestionInput(
    BuildContext context,
    ThemeData theme,
    ColorScheme colorScheme,
    MockQuestion question,
    ValueNotifier<Map<String, dynamic>> responses,
    ValueNotifier<Map<String, List<String>>> photos,
  ) {
    switch (question.type) {
      case QuestionType.text:
        return CustomTextField(
          label: '',
          hintText: 'Enter your answer',
          onChanged: (value) {
            responses.value = {...responses.value, question.id: value};
          },
          validator: question.isRequired ? Validators.required('This field is required') : null,
        );
      
      case QuestionType.multipleChoice:
        return _buildMultipleChoiceInput(theme, colorScheme, question, responses);
      
      case QuestionType.yesNo:
        return _buildYesNoInput(theme, colorScheme, question, responses);
      
      case QuestionType.rating:
        return _buildRatingInput(theme, colorScheme, question, responses);
      
      case QuestionType.photo:
        return _buildPhotoInput(context, theme, colorScheme, question, photos);
      
      case QuestionType.signature:
        return _buildSignatureInput(context, theme, colorScheme, question, responses);
    }
  }

  Widget _buildMultipleChoiceInput(
    ThemeData theme,
    ColorScheme colorScheme,
    MockQuestion question,
    ValueNotifier<Map<String, dynamic>> responses,
  ) {
    return Column(
      children: question.options!.map((option) {
        return RadioListTile<String>(
          title: Text(option),
          value: option,
          groupValue: responses.value[question.id] as String?,
          onChanged: (value) {
            responses.value = {...responses.value, question.id: value};
          },
          contentPadding: EdgeInsets.zero,
        );
      }).toList(),
    );
  }

  Widget _buildYesNoInput(
    ThemeData theme,
    ColorScheme colorScheme,
    MockQuestion question,
    ValueNotifier<Map<String, dynamic>> responses,
  ) {
    return Row(
      children: [
        Expanded(
          child: RadioListTile<bool>(
            title: const Text('Yes'),
            value: true,
            groupValue: responses.value[question.id] as bool?,
            onChanged: (value) {
              responses.value = {...responses.value, question.id: value};
            },
            contentPadding: EdgeInsets.zero,
          ),
        ),
        Expanded(
          child: RadioListTile<bool>(
            title: const Text('No'),
            value: false,
            groupValue: responses.value[question.id] as bool?,
            onChanged: (value) {
              responses.value = {...responses.value, question.id: value};
            },
            contentPadding: EdgeInsets.zero,
          ),
        ),
      ],
    );
  }

  Widget _buildRatingInput(
    ThemeData theme,
    ColorScheme colorScheme,
    MockQuestion question,
    ValueNotifier<Map<String, dynamic>> responses,
  ) {
    final currentRating = responses.value[question.id] as int? ?? 0;
    
    return Row(
      children: List.generate(5, (index) {
        final rating = index + 1;
        return IconButton(
          onPressed: () {
            responses.value = {...responses.value, question.id: rating};
          },
          icon: Icon(
            rating <= currentRating ? Icons.star : Icons.star_border,
            color: rating <= currentRating ? Colors.amber : colorScheme.onSurfaceVariant,
          ),
        );
      }),
    );
  }

  Widget _buildPhotoInput(
    BuildContext context,
    ThemeData theme,
    ColorScheme colorScheme,
    MockQuestion question,
    ValueNotifier<Map<String, List<String>>> photos,
  ) {
    final questionPhotos = photos.value[question.id] ?? [];
    
    return Column(
      children: [
        if (questionPhotos.isNotEmpty) ..[
          GridView.builder(
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
              crossAxisCount: 3,
              crossAxisSpacing: 8,
              mainAxisSpacing: 8,
              childAspectRatio: 1,
            ),
            itemCount: questionPhotos.length,
            itemBuilder: (context, index) {
              return Stack(
                children: [
                  Container(
                    decoration: BoxDecoration(
                      color: colorScheme.surfaceVariant,
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: const Center(
                      child: Icon(Icons.image),
                    ),
                  ),
                  Positioned(
                    top: 4,
                    right: 4,
                    child: IconButton(
                      onPressed: () {
                        final updatedPhotos = List<String>.from(questionPhotos);
                        updatedPhotos.removeAt(index);
                        photos.value = {...photos.value, question.id: updatedPhotos};
                      },
                      icon: const Icon(Icons.close),
                      style: IconButton.styleFrom(
                        backgroundColor: colorScheme.errorContainer,
                        foregroundColor: colorScheme.onErrorContainer,
                        minimumSize: const Size(24, 24),
                      ),
                    ),
                  ),
                ],
              );
            },
          ),
          const SizedBox(height: 12),
        ],
        CustomButton(
          onPressed: () {
            _takePhoto(context, question.id, photos);
          },
          text: 'Take Photo',
          icon: Icons.camera_alt,
          variant: ButtonVariant.outline,
        ),
      ],
    );
  }

  Widget _buildSignatureInput(
    BuildContext context,
    ThemeData theme,
    ColorScheme colorScheme,
    MockQuestion question,
    ValueNotifier<Map<String, dynamic>> responses,
  ) {
    final hasSignature = responses.value[question.id] != null;
    
    return Column(
      children: [
        Container(
          height: 150,
          width: double.infinity,
          decoration: BoxDecoration(
            border: Border.all(color: colorScheme.outline),
            borderRadius: BorderRadius.circular(8),
          ),
          child: hasSignature
              ? Stack(
                  children: [
                    const Center(
                      child: Icon(Icons.draw, size: 48),
                    ),
                    Positioned(
                      top: 8,
                      right: 8,
                      child: IconButton(
                        onPressed: () {
                          responses.value = {...responses.value}..remove(question.id);
                        },
                        icon: const Icon(Icons.clear),
                      ),
                    ),
                  ],
                )
              : const Center(
                  child: Text('Tap to add signature'),
                ),
        ),
        const SizedBox(height: 12),
        CustomButton(
          onPressed: () {
            _captureSignature(context, question.id, responses);
          },
          text: hasSignature ? 'Update Signature' : 'Add Signature',
          icon: Icons.draw,
          variant: ButtonVariant.outline,
        ),
      ],
    );
  }

  Widget _buildSignatureStep(
    ThemeData theme,
    ColorScheme colorScheme,
    ValueNotifier<String?> signature,
  ) {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'Inspector Signature',
            style: theme.textTheme.headlineSmall?.copyWith(
              fontWeight: FontWeight.w600,
            ),
          ),
          const SizedBox(height: 8),
          Text(
            'Please provide your signature to complete the inspection.',
            style: theme.textTheme.bodyMedium?.copyWith(
              color: colorScheme.onSurfaceVariant,
            ),
          ),
          const SizedBox(height: 24),
          Container(
            height: 200,
            width: double.infinity,
            decoration: BoxDecoration(
              border: Border.all(color: colorScheme.outline),
              borderRadius: BorderRadius.circular(8),
            ),
            child: signature.value != null
                ? Stack(
                    children: [
                      const Center(
                        child: Icon(Icons.draw, size: 64),
                      ),
                      Positioned(
                        top: 8,
                        right: 8,
                        child: IconButton(
                          onPressed: () {
                            signature.value = null;
                          },
                          icon: const Icon(Icons.clear),
                        ),
                      ),
                    ],
                  )
                : const Center(
                    child: Text('Tap to add signature'),
                  ),
          ),
          const SizedBox(height: 16),
          Center(
            child: CustomButton(
              onPressed: () {
                _captureInspectorSignature(context, signature);
              },
              text: signature.value != null ? 'Update Signature' : 'Add Signature',
              icon: Icons.draw,
              variant: ButtonVariant.outline,
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
    GlobalKey<FormState> formKey,
    ValueNotifier<int> currentStep,
    int totalSteps,
    ValueNotifier<bool> isSaving,
    TextEditingController titleController,
    TextEditingController notesController,
    ValueNotifier<Map<String, dynamic>> responses,
    ValueNotifier<Map<String, List<String>>> photos,
    ValueNotifier<String?> signature,
  ) {
    final isLastStep = currentStep.value == totalSteps;
    
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
                  currentStep.value = currentStep.value - 1;
                },
                text: 'Previous',
                variant: ButtonVariant.outline,
              ),
            ),
          if (currentStep.value > 0) const SizedBox(width: 16),
          Expanded(
            child: CustomButton(
              onPressed: isSaving.value
                  ? null
                  : () {
                      if (isLastStep) {
                        _completeInspection(
                          context,
                          formKey,
                          isSaving,
                          titleController,
                          notesController,
                          responses,
                          photos,
                          signature,
                        );
                      } else {
                        if (formKey.currentState?.validate() ?? false) {
                          currentStep.value = currentStep.value + 1;
                        }
                      }
                    },
              text: isSaving.value
                  ? 'Saving...'
                  : isLastStep
                      ? 'Complete Inspection'
                      : 'Next',
              icon: isLastStep ? Icons.check : Icons.arrow_forward,
            ),
          ),
        ],
      ),
    );
  }

  void _loadInspectionData(
    TextEditingController titleController,
    TextEditingController notesController,
    ValueNotifier<Map<String, dynamic>> responses,
    ValueNotifier<Map<String, List<String>>> photos,
    ValueNotifier<String?> signature,
  ) {
    // TODO: Load actual inspection data
    titleController.text = 'Monthly Safety Inspection';
    notesController.text = 'Regular monthly inspection';
  }

  void _saveDraft(
    BuildContext context,
    TextEditingController titleController,
    TextEditingController notesController,
    ValueNotifier<Map<String, dynamic>> responses,
    ValueNotifier<Map<String, List<String>>> photos,
    ValueNotifier<String?> signature,
  ) {
    // TODO: Implement draft saving
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(content: Text('Draft saved')),
    );
  }

  void _completeInspection(
    BuildContext context,
    GlobalKey<FormState> formKey,
    ValueNotifier<bool> isSaving,
    TextEditingController titleController,
    TextEditingController notesController,
    ValueNotifier<Map<String, dynamic>> responses,
    ValueNotifier<Map<String, List<String>>> photos,
    ValueNotifier<String?> signature,
  ) async {
    if (!(formKey.currentState?.validate() ?? false)) {
      return;
    }

    isSaving.value = true;
    
    try {
      // TODO: Implement actual inspection completion
      await Future.delayed(const Duration(seconds: 2));
      
      if (context.mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Inspection completed successfully')),
        );
        context.goNamed(AppRoutes.inspections);
      }
    } catch (e) {
      if (context.mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Error completing inspection: $e')),
        );
      }
    } finally {
      isSaving.value = false;
    }
  }

  void _showAssetSelector(BuildContext context) {
    // TODO: Implement asset selector
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(content: Text('Asset selector not implemented')),
    );
  }

  void _getCurrentLocation(BuildContext context) {
    // TODO: Implement location detection
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(content: Text('Location updated')),
    );
  }

  void _takePhoto(
    BuildContext context,
    String questionId,
    ValueNotifier<Map<String, List<String>>> photos,
  ) {
    // TODO: Implement photo capture
    final currentPhotos = List<String>.from(photos.value[questionId] ?? []);
    currentPhotos.add('photo_${DateTime.now().millisecondsSinceEpoch}.jpg');
    photos.value = {...photos.value, questionId: currentPhotos};
    
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(content: Text('Photo captured')),
    );
  }

  void _captureSignature(
    BuildContext context,
    String questionId,
    ValueNotifier<Map<String, dynamic>> responses,
  ) {
    // TODO: Implement signature capture
    responses.value = {...responses.value, questionId: 'signature_data'};
    
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(content: Text('Signature captured')),
    );
  }

  void _captureInspectorSignature(
    BuildContext context,
    ValueNotifier<String?> signature,
  ) {
    // TODO: Implement signature capture
    signature.value = 'inspector_signature_data';
    
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(content: Text('Signature captured')),
    );
  }

  MockFormTemplate _getMockFormTemplate() {
    return MockFormTemplate(
      id: 'template_1',
      title: 'Safety Inspection Form',
      sections: [
        MockFormSection(
          id: 'safety',
          title: 'Safety Checks',
          description: 'Verify all safety requirements are met',
          questions: [
            MockQuestion(
              id: 'safety_guards',
              text: 'Are all safety guards in place?',
              type: QuestionType.yesNo,
              isRequired: true,
            ),
            MockQuestion(
              id: 'safety_rating',
              text: 'Rate the overall safety condition',
              type: QuestionType.rating,
              isRequired: true,
            ),
            MockQuestion(
              id: 'safety_photo',
              text: 'Take a photo of safety equipment',
              type: QuestionType.photo,
              isRequired: false,
            ),
          ],
        ),
        MockFormSection(
          id: 'maintenance',
          title: 'Maintenance Checks',
          description: 'Check equipment condition and maintenance needs',
          questions: [
            MockQuestion(
              id: 'cleanliness',
              text: 'Is the equipment clean and well-maintained?',
              type: QuestionType.yesNo,
              isRequired: true,
            ),
            MockQuestion(
              id: 'damage',
              text: 'Any visible damage or wear?',
              type: QuestionType.multipleChoice,
              options: ['None', 'Minor', 'Moderate', 'Severe'],
              isRequired: true,
            ),
            MockQuestion(
              id: 'maintenance_notes',
              text: 'Additional maintenance notes',
              type: QuestionType.text,
              isRequired: false,
            ),
          ],
        ),
      ],
    );
  }
}

// Mock data classes
class MockFormTemplate {
  final String id;
  final String title;
  final List<MockFormSection> sections;

  MockFormTemplate({
    required this.id,
    required this.title,
    required this.sections,
  });
}

class MockFormSection {
  final String id;
  final String title;
  final String? description;
  final List<MockQuestion> questions;

  MockFormSection({
    required this.id,
    required this.title,
    this.description,
    required this.questions,
  });
}

class MockQuestion {
  final String id;
  final String text;
  final String? description;
  final QuestionType type;
  final List<String>? options;
  final bool isRequired;

  MockQuestion({
    required this.id,
    required this.text,
    this.description,
    required this.type,
    this.options,
    required this.isRequired,
  });
}

enum QuestionType {
  text,
  multipleChoice,
  yesNo,
  rating,
  photo,
  signature,
}