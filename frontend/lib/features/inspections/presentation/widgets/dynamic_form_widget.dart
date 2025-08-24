import 'package:flutter/material.dart';
import 'package:flutter_hooks/flutter_hooks.dart';
import 'package:hooks_riverpod/hooks_riverpod.dart';
import 'package:image_picker/image_picker.dart';
import 'package:signature/signature.dart';
import '../../../../core/models/form_template.dart';
import '../providers/inspection_provider.dart';
import '../../../../shared/widgets/photo_capture_widget.dart';
import '../../../../shared/widgets/signature_pad_widget.dart';
import '../../../../shared/widgets/rating_widget.dart';
import '../../../../shared/widgets/checkbox_group_widget.dart';
import '../../../../shared/widgets/radio_group_widget.dart';
import '../../../../shared/utils/validation_utils.dart';

class DynamicFormWidget extends HookConsumerWidget {
  final FormTemplate formTemplate;
  final String? inspectionId;
  final VoidCallback? onFormChanged;
  final bool isReadOnly;

  const DynamicFormWidget({
    super.key,
    required this.formTemplate,
    this.inspectionId,
    this.onFormChanged,
    this.isReadOnly = false,
  });

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final formNotifier = ref.read(inspectionFormNotifierProvider(inspectionId).notifier);
    final formState = ref.watch(inspectionFormNotifierProvider(inspectionId));
    final currentSectionIndex = useState(0);
    final pageController = usePageController();
    final theme = Theme.of(context);

    useEffect(() {
      void listener() {
        onFormChanged?.call();
      }
      
      // Listen to form changes
      return null;
    }, [formState]);

    return Column(
      children: [
        if (formTemplate.sections.length > 1) ..[
          _buildSectionTabs(context, theme, currentSectionIndex, pageController),
          const SizedBox(height: 16),
        ],
        Expanded(
          child: PageView.builder(
            controller: pageController,
            onPageChanged: (index) => currentSectionIndex.value = index,
            itemCount: formTemplate.sections.length,
            itemBuilder: (context, sectionIndex) {
              final section = formTemplate.sections[sectionIndex];
              return _buildSection(context, ref, section, formNotifier, formState);
            },
          ),
        ),
        if (formTemplate.sections.length > 1)
          _buildNavigationButtons(context, theme, currentSectionIndex, pageController, formTemplate),
      ],
    );
  }

  Widget _buildSectionTabs(BuildContext context, ThemeData theme, ValueNotifier<int> currentSectionIndex, PageController pageController) {
    return Container(
      height: 48,
      child: ListView.builder(
        scrollDirection: Axis.horizontal,
        itemCount: formTemplate.sections.length,
        itemBuilder: (context, index) {
          final section = formTemplate.sections[index];
          final isSelected = currentSectionIndex.value == index;
          
          return Padding(
            padding: const EdgeInsets.only(right: 8),
            child: FilterChip(
              label: Text(section.title),
              selected: isSelected,
              onSelected: isReadOnly ? null : (selected) {
                if (selected) {
                  currentSectionIndex.value = index;
                  pageController.animateToPage(
                    index,
                    duration: const Duration(milliseconds: 300),
                    curve: Curves.easeInOut,
                  );
                }
              },
              backgroundColor: theme.colorScheme.surface,
              selectedColor: theme.colorScheme.primaryContainer,
              checkmarkColor: theme.colorScheme.onPrimaryContainer,
            ),
          );
        },
      ),
    );
  }

  Widget _buildSection(BuildContext context, WidgetRef ref, FormSection section, InspectionFormNotifier formNotifier, InspectionFormState formState) {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            section.title,
            style: Theme.of(context).textTheme.headlineSmall?.copyWith(
              fontWeight: FontWeight.w600,
            ),
          ),
          if (section.description?.isNotEmpty == true) ..[
            const SizedBox(height: 8),
            Text(
              section.description!,
              style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                color: Theme.of(context).colorScheme.onSurfaceVariant,
              ),
            ),
          ],
          const SizedBox(height: 24),
          ...section.questions.map((question) => _buildQuestion(context, ref, question, formNotifier, formState)),
        ],
      ),
    );
  }

  Widget _buildQuestion(BuildContext context, WidgetRef ref, FormQuestion question, InspectionFormNotifier formNotifier, InspectionFormState formState) {
    final theme = Theme.of(context);
    final currentValue = formState.responses[question.id];
    final hasError = question.isRequired && (currentValue == null || currentValue.toString().isEmpty);

    return Container(
      margin: const EdgeInsets.only(bottom: 24),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: theme.colorScheme.surface,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(
          color: hasError 
              ? theme.colorScheme.error.withOpacity(0.5)
              : theme.colorScheme.outline.withOpacity(0.2),
        ),
        boxShadow: [
          BoxShadow(
            color: theme.shadowColor.withOpacity(0.05),
            blurRadius: 4,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          _buildQuestionHeader(context, question, hasError),
          const SizedBox(height: 12),
          _buildQuestionInput(context, ref, question, formNotifier, formState),
          if (hasError) ..[
            const SizedBox(height: 8),
            Text(
              'This field is required',
              style: theme.textTheme.bodySmall?.copyWith(
                color: theme.colorScheme.error,
              ),
            ),
          ],
        ],
      ),
    );
  }

  Widget _buildQuestionHeader(BuildContext context, FormQuestion question, bool hasError) {
    final theme = Theme.of(context);
    
    return Row(
      children: [
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                children: [
                  Expanded(
                    child: Text(
                      question.title,
                      style: theme.textTheme.titleMedium?.copyWith(
                        fontWeight: FontWeight.w500,
                        color: hasError ? theme.colorScheme.error : null,
                      ),
                    ),
                  ),
                  if (question.isRequired)
                    Text(
                      '*',
                      style: TextStyle(
                        color: theme.colorScheme.error,
                        fontSize: 16,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                ],
              ),
              if (question.description?.isNotEmpty == true) ..[
                const SizedBox(height: 4),
                Text(
                  question.description!,
                  style: theme.textTheme.bodySmall?.copyWith(
                    color: theme.colorScheme.onSurfaceVariant,
                  ),
                ),
              ],
            ],
          ),
        ),
        _buildQuestionTypeIcon(question.type, theme),
      ],
    );
  }

  Widget _buildQuestionTypeIcon(QuestionType type, ThemeData theme) {
    IconData iconData;
    
    switch (type) {
      case QuestionType.text:
        iconData = Icons.text_fields;
        break;
      case QuestionType.number:
        iconData = Icons.numbers;
        break;
      case QuestionType.multipleChoice:
        iconData = Icons.radio_button_checked;
        break;
      case QuestionType.checkbox:
        iconData = Icons.check_box;
        break;
      case QuestionType.rating:
        iconData = Icons.star_rate;
        break;
      case QuestionType.photo:
        iconData = Icons.camera_alt;
        break;
      case QuestionType.signature:
        iconData = Icons.draw;
        break;
      case QuestionType.date:
        iconData = Icons.calendar_today;
        break;
      case QuestionType.time:
        iconData = Icons.access_time;
        break;
      case QuestionType.dropdown:
        iconData = Icons.arrow_drop_down;
        break;
    }
    
    return Icon(
      iconData,
      size: 20,
      color: theme.colorScheme.onSurfaceVariant,
    );
  }

  Widget _buildQuestionInput(BuildContext context, WidgetRef ref, FormQuestion question, InspectionFormNotifier formNotifier, InspectionFormState formState) {
    final currentValue = formState.responses[question.id];
    
    if (isReadOnly) {
      return _buildReadOnlyValue(context, question, currentValue);
    }

    switch (question.type) {
      case QuestionType.text:
        return _buildTextInput(context, question, currentValue, formNotifier);
      case QuestionType.number:
        return _buildNumberInput(context, question, currentValue, formNotifier);
      case QuestionType.multipleChoice:
        return _buildMultipleChoiceInput(context, question, currentValue, formNotifier);
      case QuestionType.checkbox:
        return _buildCheckboxInput(context, question, currentValue, formNotifier);
      case QuestionType.rating:
        return _buildRatingInput(context, question, currentValue, formNotifier);
      case QuestionType.photo:
        return _buildPhotoInput(context, question, formState, formNotifier);
      case QuestionType.signature:
        return _buildSignatureInput(context, question, formState, formNotifier);
      case QuestionType.date:
        return _buildDateInput(context, question, currentValue, formNotifier);
      case QuestionType.time:
        return _buildTimeInput(context, question, currentValue, formNotifier);
      case QuestionType.dropdown:
        return _buildDropdownInput(context, question, currentValue, formNotifier);
    }
  }

  Widget _buildTextInput(BuildContext context, FormQuestion question, dynamic currentValue, InspectionFormNotifier formNotifier) {
    return TextFormField(
      initialValue: currentValue?.toString() ?? '',
      onChanged: (value) => formNotifier.updateResponse(question.id, value),
      maxLines: question.options?['multiline'] == true ? 3 : 1,
      decoration: InputDecoration(
        hintText: question.placeholder ?? 'Enter ${question.title.toLowerCase()}',
        border: const OutlineInputBorder(),
      ),
      validator: question.isRequired ? ValidationUtils.required : null,
    );
  }

  Widget _buildNumberInput(BuildContext context, FormQuestion question, dynamic currentValue, InspectionFormNotifier formNotifier) {
    return TextFormField(
      initialValue: currentValue?.toString() ?? '',
      onChanged: (value) {
        final numValue = double.tryParse(value);
        formNotifier.updateResponse(question.id, numValue);
      },
      keyboardType: TextInputType.number,
      decoration: InputDecoration(
        hintText: question.placeholder ?? 'Enter number',
        border: const OutlineInputBorder(),
      ),
      validator: question.isRequired ? ValidationUtils.required : null,
    );
  }

  Widget _buildMultipleChoiceInput(BuildContext context, FormQuestion question, dynamic currentValue, InspectionFormNotifier formNotifier) {
    return RadioGroupWidget(
      options: question.options?['choices'] ?? [],
      value: currentValue,
      onChanged: (value) => formNotifier.updateResponse(question.id, value),
    );
  }

  Widget _buildCheckboxInput(BuildContext context, FormQuestion question, dynamic currentValue, InspectionFormNotifier formNotifier) {
    return CheckboxGroupWidget(
      options: question.options?['choices'] ?? [],
      values: currentValue is List ? List<String>.from(currentValue) : [],
      onChanged: (values) => formNotifier.updateResponse(question.id, values),
    );
  }

  Widget _buildRatingInput(BuildContext context, FormQuestion question, dynamic currentValue, InspectionFormNotifier formNotifier) {
    final maxRating = question.options?['maxRating'] ?? 5;
    
    return RatingWidget(
      rating: currentValue?.toDouble() ?? 0.0,
      maxRating: maxRating,
      onRatingChanged: (rating) => formNotifier.updateResponse(question.id, rating),
    );
  }

  Widget _buildPhotoInput(BuildContext context, FormQuestion question, InspectionFormState formState, InspectionFormNotifier formNotifier) {
    final photos = formState.photos[question.id] ?? [];
    
    return PhotoCaptureWidget(
      photos: photos,
      maxPhotos: question.options?['maxPhotos'] ?? 5,
      onPhotoAdded: (photoPath) => formNotifier.addPhoto(question.id, photoPath),
      onPhotoRemoved: (photoPath) => formNotifier.removePhoto(question.id, photoPath),
    );
  }

  Widget _buildSignatureInput(BuildContext context, FormQuestion question, InspectionFormState formState, InspectionFormNotifier formNotifier) {
    return SignaturePadWidget(
      signaturePath: formState.signature,
      onSignatureChanged: (signaturePath) => formNotifier.updateSignature(signaturePath),
    );
  }

  Widget _buildDateInput(BuildContext context, FormQuestion question, dynamic currentValue, InspectionFormNotifier formNotifier) {
    return InkWell(
      onTap: () async {
        final date = await showDatePicker(
          context: context,
          initialDate: currentValue != null ? DateTime.parse(currentValue) : DateTime.now(),
          firstDate: DateTime(2000),
          lastDate: DateTime(2100),
        );
        
        if (date != null) {
          formNotifier.updateResponse(question.id, date.toIso8601String());
        }
      },
      child: InputDecorator(
        decoration: InputDecoration(
          hintText: 'Select date',
          border: const OutlineInputBorder(),
          suffixIcon: const Icon(Icons.calendar_today),
        ),
        child: Text(
          currentValue != null 
              ? DateTime.parse(currentValue).toString().split(' ')[0]
              : 'Select date',
        ),
      ),
    );
  }

  Widget _buildTimeInput(BuildContext context, FormQuestion question, dynamic currentValue, InspectionFormNotifier formNotifier) {
    return InkWell(
      onTap: () async {
        final time = await showTimePicker(
          context: context,
          initialTime: currentValue != null 
              ? TimeOfDay.fromDateTime(DateTime.parse(currentValue))
              : TimeOfDay.now(),
        );
        
        if (time != null) {
          final now = DateTime.now();
          final dateTime = DateTime(now.year, now.month, now.day, time.hour, time.minute);
          formNotifier.updateResponse(question.id, dateTime.toIso8601String());
        }
      },
      child: InputDecorator(
        decoration: InputDecoration(
          hintText: 'Select time',
          border: const OutlineInputBorder(),
          suffixIcon: const Icon(Icons.access_time),
        ),
        child: Text(
          currentValue != null 
              ? TimeOfDay.fromDateTime(DateTime.parse(currentValue)).format(context)
              : 'Select time',
        ),
      ),
    );
  }

  Widget _buildDropdownInput(BuildContext context, FormQuestion question, dynamic currentValue, InspectionFormNotifier formNotifier) {
    final options = question.options?['choices'] ?? [];
    
    return DropdownButtonFormField<String>(
      value: currentValue,
      onChanged: (value) => formNotifier.updateResponse(question.id, value),
      decoration: InputDecoration(
        hintText: 'Select option',
        border: const OutlineInputBorder(),
      ),
      items: options.map<DropdownMenuItem<String>>((option) {
        return DropdownMenuItem<String>(
          value: option,
          child: Text(option),
        );
      }).toList(),
    );
  }

  Widget _buildReadOnlyValue(BuildContext context, FormQuestion question, dynamic currentValue) {
    final theme = Theme.of(context);
    
    if (currentValue == null) {
      return Text(
        'No response',
        style: theme.textTheme.bodyMedium?.copyWith(
          color: theme.colorScheme.onSurfaceVariant,
          fontStyle: FontStyle.italic,
        ),
      );
    }
    
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: theme.colorScheme.surfaceVariant.withOpacity(0.3),
        borderRadius: BorderRadius.circular(8),
        border: Border.all(
          color: theme.colorScheme.outline.withOpacity(0.2),
        ),
      ),
      child: Text(
        currentValue.toString(),
        style: theme.textTheme.bodyMedium,
      ),
    );
  }

  Widget _buildNavigationButtons(BuildContext context, ThemeData theme, ValueNotifier<int> currentSectionIndex, PageController pageController, FormTemplate formTemplate) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: theme.colorScheme.surface,
        border: Border(
          top: BorderSide(
            color: theme.colorScheme.outline.withOpacity(0.2),
          ),
        ),
      ),
      child: Row(
        children: [
          if (currentSectionIndex.value > 0)
            Expanded(
              child: OutlinedButton.icon(
                onPressed: () {
                  currentSectionIndex.value--;
                  pageController.previousPage(
                    duration: const Duration(milliseconds: 300),
                    curve: Curves.easeInOut,
                  );
                },
                icon: const Icon(Icons.arrow_back),
                label: const Text('Previous'),
              ),
            ),
          if (currentSectionIndex.value > 0 && currentSectionIndex.value < formTemplate.sections.length - 1)
            const SizedBox(width: 16),
          if (currentSectionIndex.value < formTemplate.sections.length - 1)
            Expanded(
              child: FilledButton.icon(
                onPressed: () {
                  currentSectionIndex.value++;
                  pageController.nextPage(
                    duration: const Duration(milliseconds: 300),
                    curve: Curves.easeInOut,
                  );
                },
                icon: const Icon(Icons.arrow_forward),
                label: const Text('Next'),
              ),
            ),
        ],
      ),
    );
  }
}