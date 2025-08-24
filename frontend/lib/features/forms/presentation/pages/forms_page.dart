import 'package:flutter/material.dart';
import 'package:flutter_hooks/flutter_hooks.dart';
import 'package:hooks_riverpod/hooks_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../../shared/presentation/widgets/responsive_scaffold.dart';
import '../../../../shared/presentation/widgets/loading_overlay.dart';
import '../../../../shared/presentation/widgets/custom_button.dart';
import '../../../../shared/presentation/widgets/custom_text_field.dart';
import '../../../../app/router/app_router.dart';
import '../../../../core/models/form_template.dart';

/// Page displaying form templates with creation and management
class FormsPage extends HookConsumerWidget {
  const FormsPage({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final theme = Theme.of(context);
    final colorScheme = theme.colorScheme;
    final searchController = useTextEditingController();
    final selectedCategory = useState<FormCategory?>(null);
    final selectedStatus = useState<FormStatus?>(null);
    final isLoading = useState(false);
    
    // Mock data - replace with actual provider
    final forms = useState<List<FormTemplate>>(_getMockForms());
    final filteredForms = useMemoized(() {
      var filtered = forms.value;
      
      // Apply category filter
      if (selectedCategory.value != null) {
        filtered = filtered.where((f) => f.category == selectedCategory.value).toList();
      }
      
      // Apply status filter
      if (selectedStatus.value != null) {
        filtered = filtered.where((f) => f.status == selectedStatus.value).toList();
      }
      
      // Apply search filter
      final searchTerm = searchController.text.toLowerCase();
      if (searchTerm.isNotEmpty) {
        filtered = filtered.where((f) => 
          f.name.toLowerCase().contains(searchTerm) ||
          f.description?.toLowerCase().contains(searchTerm) == true
        ).toList();
      }
      
      return filtered;
    }, [forms.value, selectedCategory.value, selectedStatus.value, searchController.text]);

    return ResponsiveScaffold(
      title: 'Form Templates',
      floatingActionButton: FloatingActionButton.extended(
        onPressed: () => context.go(AppRoutes.newForm),
        icon: const Icon(Icons.add),
        label: const Text('New Form'),
      ),
      body: LoadingOverlay(
        isLoading: isLoading.value,
        child: Column(
          children: [
            _buildHeader(context, theme, colorScheme, searchController, selectedCategory, selectedStatus),
            Expanded(
              child: _buildFormsList(context, theme, colorScheme, filteredForms),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildHeader(
    BuildContext context,
    ThemeData theme,
    ColorScheme colorScheme,
    TextEditingController searchController,
    ValueNotifier<FormCategory?> selectedCategory,
    ValueNotifier<FormStatus?> selectedStatus,
  ) {
    final screenType = context.screenType;
    
    return Container(
      padding: EdgeInsets.all(screenType.isMobile ? 16 : 24),
      decoration: BoxDecoration(
        color: colorScheme.surface,
        border: Border(
          bottom: BorderSide(
            color: colorScheme.outline.withOpacity(0.2),
            width: 1,
          ),
        ),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          if (screenType.isDesktop)
            Row(
              children: [
                Expanded(
                  flex: 2,
                  child: CustomSearchField(
                    controller: searchController,
                    hintText: 'Search form templates...',
                    onChanged: (value) {
                      // Trigger rebuild through controller
                    },
                  ),
                ),
                const SizedBox(width: 16),
                Expanded(
                  child: _buildCategoryFilter(theme, colorScheme, selectedCategory),
                ),
                const SizedBox(width: 16),
                Expanded(
                  child: _buildStatusFilter(theme, colorScheme, selectedStatus),
                ),
                const SizedBox(width: 16),
                CustomButton(
                  text: 'Import',
                  style: ButtonStyle.outline,
                  icon: Icons.upload_file,
                  onPressed: () => _handleImport(context),
                ),
              ],
            )
          else
            Column(
              children: [
                CustomSearchField(
                  controller: searchController,
                  hintText: 'Search form templates...',
                  onChanged: (value) {
                    // Trigger rebuild through controller
                  },
                ),
                const SizedBox(height: 12),
                Row(
                  children: [
                    Expanded(
                      child: _buildCategoryFilter(theme, colorScheme, selectedCategory),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: _buildStatusFilter(theme, colorScheme, selectedStatus),
                    ),
                  ],
                ),
                const SizedBox(height: 12),
                Row(
                  children: [
                    Expanded(
                      child: CustomButton(
                        text: 'Import Template',
                        style: ButtonStyle.outline,
                        icon: Icons.upload_file,
                        onPressed: () => _handleImport(context),
                      ),
                    ),
                  ],
                ),
              ],
            ),
          const SizedBox(height: 16),
          _buildStatsRow(theme, colorScheme),
        ],
      ),
    );
  }

  Widget _buildCategoryFilter(
    ThemeData theme,
    ColorScheme colorScheme,
    ValueNotifier<FormCategory?> selectedCategory,
  ) {
    return DropdownButtonFormField<FormCategory?>(
      value: selectedCategory.value,
      decoration: InputDecoration(
        labelText: 'Category',
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(8),
        ),
        contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
      ),
      items: [
        const DropdownMenuItem<FormCategory?>(
          value: null,
          child: Text('All Categories'),
        ),
        ...FormCategory.values.map((category) => DropdownMenuItem(
          value: category,
          child: Text(_getCategoryDisplayName(category)),
        )),
      ],
      onChanged: (value) {
        selectedCategory.value = value;
      },
    );
  }

  Widget _buildStatusFilter(
    ThemeData theme,
    ColorScheme colorScheme,
    ValueNotifier<FormStatus?> selectedStatus,
  ) {
    return DropdownButtonFormField<FormStatus?>(
      value: selectedStatus.value,
      decoration: InputDecoration(
        labelText: 'Status',
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(8),
        ),
        contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
      ),
      items: [
        const DropdownMenuItem<FormStatus?>(
          value: null,
          child: Text('All Statuses'),
        ),
        ...FormStatus.values.map((status) => DropdownMenuItem(
          value: status,
          child: Text(_getStatusDisplayName(status)),
        )),
      ],
      onChanged: (value) {
        selectedStatus.value = value;
      },
    );
  }

  Widget _buildStatsRow(ThemeData theme, ColorScheme colorScheme) {
    return Row(
      children: [
        _buildStatChip(theme, colorScheme, 'Total', '15', colorScheme.primary),
        const SizedBox(width: 12),
        _buildStatChip(theme, colorScheme, 'Active', '12', Colors.green),
        const SizedBox(width: 12),
        _buildStatChip(theme, colorScheme, 'Draft', '2', Colors.orange),
        const SizedBox(width: 12),
        _buildStatChip(theme, colorScheme, 'Archived', '1', Colors.grey),
      ],
    );
  }

  Widget _buildStatChip(
    ThemeData theme,
    ColorScheme colorScheme,
    String label,
    String value,
    Color color,
  ) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
      decoration: BoxDecoration(
        color: color.withOpacity(0.1),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(
          color: color.withOpacity(0.3),
          width: 1,
        ),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Text(
            label,
            style: theme.textTheme.bodySmall?.copyWith(
              color: color,
              fontWeight: FontWeight.w600,
            ),
          ),
          const SizedBox(width: 6),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
            decoration: BoxDecoration(
              color: color,
              borderRadius: BorderRadius.circular(8),
            ),
            child: Text(
              value,
              style: theme.textTheme.bodySmall?.copyWith(
                color: Colors.white,
                fontWeight: FontWeight.bold,
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildFormsList(
    BuildContext context,
    ThemeData theme,
    ColorScheme colorScheme,
    List<FormTemplate> forms,
  ) {
    if (forms.isEmpty) {
      return _buildEmptyState(context, theme, colorScheme);
    }

    final screenType = context.screenType;
    
    if (screenType.isDesktop) {
      return _buildDesktopGrid(context, theme, colorScheme, forms);
    } else {
      return _buildMobileList(context, theme, colorScheme, forms);
    }
  }

  Widget _buildDesktopGrid(
    BuildContext context,
    ThemeData theme,
    ColorScheme colorScheme,
    List<FormTemplate> forms,
  ) {
    return GridView.builder(
      padding: const EdgeInsets.all(24),
      gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
        crossAxisCount: 3,
        crossAxisSpacing: 16,
        mainAxisSpacing: 16,
        childAspectRatio: 1.1,
      ),
      itemCount: forms.length,
      itemBuilder: (context, index) {
        final form = forms[index];
        return _buildFormCard(context, theme, colorScheme, form);
      },
    );
  }

  Widget _buildMobileList(
    BuildContext context,
    ThemeData theme,
    ColorScheme colorScheme,
    List<FormTemplate> forms,
  ) {
    return ListView.builder(
      padding: const EdgeInsets.all(16),
      itemCount: forms.length,
      itemBuilder: (context, index) {
        final form = forms[index];
        return _buildFormCard(context, theme, colorScheme, form, isMobile: true);
      },
    );
  }

  Widget _buildFormCard(
    BuildContext context,
    ThemeData theme,
    ColorScheme colorScheme,
    FormTemplate form, {
    bool isMobile = false,
  }) {
    return Card(
      margin: isMobile ? const EdgeInsets.only(bottom: 12) : EdgeInsets.zero,
      child: InkWell(
        onTap: () => _viewForm(context, form.id),
        borderRadius: BorderRadius.circular(12),
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                children: [
                  Container(
                    padding: const EdgeInsets.all(8),
                    decoration: BoxDecoration(
                      color: _getCategoryColor(form.category).withOpacity(0.1),
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: Icon(
                      _getCategoryIcon(form.category),
                      color: _getCategoryColor(form.category),
                      size: 24,
                    ),
                  ),
                  const Spacer(),
                  _buildStatusChip(theme, colorScheme, form.status),
                ],
              ),
              const SizedBox(height: 12),
              Text(
                form.name,
                style: theme.textTheme.titleMedium?.copyWith(
                  fontWeight: FontWeight.bold,
                ),
                maxLines: 2,
                overflow: TextOverflow.ellipsis,
              ),
              if (form.description != null) ..[
                const SizedBox(height: 4),
                Text(
                  form.description!,
                  style: theme.textTheme.bodySmall?.copyWith(
                    color: colorScheme.onSurfaceVariant,
                  ),
                  maxLines: 2,
                  overflow: TextOverflow.ellipsis,
                ),
              ],
              const SizedBox(height: 8),
              Row(
                children: [
                  Icon(
                    Icons.quiz,
                    size: 16,
                    color: colorScheme.onSurfaceVariant,
                  ),
                  const SizedBox(width: 4),
                  Text(
                    '${form.questions.length} questions',
                    style: theme.textTheme.bodySmall?.copyWith(
                      color: colorScheme.onSurfaceVariant,
                    ),
                  ),
                  const Spacer(),
                  Icon(
                    Icons.access_time,
                    size: 16,
                    color: colorScheme.onSurfaceVariant,
                  ),
                  const SizedBox(width: 4),
                  Text(
                    '~${form.estimatedDuration} min',
                    style: theme.textTheme.bodySmall?.copyWith(
                      color: colorScheme.onSurfaceVariant,
                    ),
                  ),
                ],
              ),
              if (!isMobile) ..[
                const Spacer(),
                Row(
                  children: [
                    Expanded(
                      child: CustomButton(
                        text: 'Edit',
                        style: ButtonStyle.outline,
                        size: ButtonSize.small,
                        onPressed: () => _editForm(context, form.id),
                      ),
                    ),
                    const SizedBox(width: 8),
                    Expanded(
                      child: CustomButton(
                        text: 'Use',
                        size: ButtonSize.small,
                        onPressed: () => _useForm(context, form.id),
                      ),
                    ),
                  ],
                ),
              ] else ..[
                const SizedBox(height: 12),
                Row(
                  children: [
                    Expanded(
                      child: CustomButton(
                        text: 'Edit Template',
                        style: ButtonStyle.outline,
                        size: ButtonSize.small,
                        onPressed: () => _editForm(context, form.id),
                      ),
                    ),
                    const SizedBox(width: 8),
                    Expanded(
                      child: CustomButton(
                        text: 'Use Template',
                        size: ButtonSize.small,
                        onPressed: () => _useForm(context, form.id),
                      ),
                    ),
                  ],
                ),
              ],
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildStatusChip(ThemeData theme, ColorScheme colorScheme, FormStatus status) {
    Color color;
    switch (status) {
      case FormStatus.active:
        color = Colors.green;
        break;
      case FormStatus.draft:
        color = Colors.orange;
        break;
      case FormStatus.archived:
        color = Colors.grey;
        break;
    }

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
      decoration: BoxDecoration(
        color: color.withOpacity(0.1),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(
          color: color.withOpacity(0.3),
          width: 1,
        ),
      ),
      child: Text(
        _getStatusDisplayName(status),
        style: theme.textTheme.bodySmall?.copyWith(
          color: color,
          fontWeight: FontWeight.w600,
        ),
      ),
    );
  }

  Widget _buildEmptyState(BuildContext context, ThemeData theme, ColorScheme colorScheme) {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(
            Icons.description_outlined,
            size: 64,
            color: colorScheme.onSurfaceVariant,
          ),
          const SizedBox(height: 16),
          Text(
            'No form templates found',
            style: theme.textTheme.titleLarge?.copyWith(
              color: colorScheme.onSurface,
            ),
          ),
          const SizedBox(height: 8),
          Text(
            'Create your first form template to get started',
            style: theme.textTheme.bodyMedium?.copyWith(
              color: colorScheme.onSurfaceVariant,
            ),
          ),
          const SizedBox(height: 24),
          CustomButton(
            text: 'Create Form Template',
            icon: Icons.add,
            onPressed: () => context.go(AppRoutes.newForm),
          ),
        ],
      ),
    );
  }

  String _getCategoryDisplayName(FormCategory category) {
    switch (category) {
      case FormCategory.safety:
        return 'Safety';
      case FormCategory.maintenance:
        return 'Maintenance';
      case FormCategory.quality:
        return 'Quality';
      case FormCategory.compliance:
        return 'Compliance';
      case FormCategory.general:
        return 'General';
    }
  }

  String _getStatusDisplayName(FormStatus status) {
    switch (status) {
      case FormStatus.active:
        return 'Active';
      case FormStatus.draft:
        return 'Draft';
      case FormStatus.archived:
        return 'Archived';
    }
  }

  IconData _getCategoryIcon(FormCategory category) {
    switch (category) {
      case FormCategory.safety:
        return Icons.security;
      case FormCategory.maintenance:
        return Icons.build;
      case FormCategory.quality:
        return Icons.verified;
      case FormCategory.compliance:
        return Icons.gavel;
      case FormCategory.general:
        return Icons.description;
    }
  }

  Color _getCategoryColor(FormCategory category) {
    switch (category) {
      case FormCategory.safety:
        return Colors.red;
      case FormCategory.maintenance:
        return Colors.orange;
      case FormCategory.quality:
        return Colors.green;
      case FormCategory.compliance:
        return Colors.blue;
      case FormCategory.general:
        return Colors.grey;
    }
  }

  void _viewForm(BuildContext context, String formId) {
    context.go('${AppRoutes.forms}/$formId');
  }

  void _editForm(BuildContext context, String formId) {
    context.go('${AppRoutes.forms}/$formId/edit');
  }

  void _useForm(BuildContext context, String formId) {
    context.go('${AppRoutes.newInspection}?formId=$formId');
  }

  void _handleImport(BuildContext context) {
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(
        content: Text('Import functionality will be implemented soon'),
      ),
    );
  }

  // Mock data - replace with actual data provider
  List<FormTemplate> _getMockForms() {
    return [
      FormTemplate(
        id: 'FT001',
        name: 'Fire Extinguisher Inspection',
        description: 'Monthly fire extinguisher safety inspection checklist',
        category: FormCategory.safety,
        status: FormStatus.active,
        version: '1.2',
        questions: _getFireExtinguisherQuestions(),
        estimatedDuration: 15,
        createdBy: 'admin',
        createdAt: DateTime(2023, 1, 15),
        updatedAt: DateTime.now().subtract(const Duration(days: 7)),
      ),
      FormTemplate(
        id: 'FT002',
        name: 'HVAC Maintenance Check',
        description: 'Quarterly HVAC system maintenance and performance check',
        category: FormCategory.maintenance,
        status: FormStatus.active,
        version: '2.0',
        questions: _getHVACQuestions(),
        estimatedDuration: 45,
        createdBy: 'user2',
        createdAt: DateTime(2023, 2, 1),
        updatedAt: DateTime.now().subtract(const Duration(days: 3)),
      ),
      FormTemplate(
        id: 'FT003',
        name: 'Vehicle Safety Inspection',
        description: 'Pre-trip vehicle safety and maintenance inspection',
        category: FormCategory.safety,
        status: FormStatus.active,
        version: '1.0',
        questions: _getVehicleQuestions(),
        estimatedDuration: 20,
        createdBy: 'user3',
        createdAt: DateTime(2023, 3, 1),
        updatedAt: DateTime.now().subtract(const Duration(days: 1)),
      ),
      FormTemplate(
        id: 'FT004',
        name: 'Quality Control Checklist',
        description: 'Product quality control and assurance checklist',
        category: FormCategory.quality,
        status: FormStatus.draft,
        version: '0.5',
        questions: _getQualityQuestions(),
        estimatedDuration: 30,
        createdBy: 'user1',
        createdAt: DateTime(2023, 4, 1),
        updatedAt: DateTime.now().subtract(const Duration(hours: 12)),
      ),
    ];
  }

  List<FormQuestion> _getFireExtinguisherQuestions() {
    return [
      FormQuestion(
        id: 'Q001',
        text: 'Is the fire extinguisher properly mounted?',
        type: QuestionType.yesNo,
        isRequired: true,
        order: 1,
      ),
      FormQuestion(
        id: 'Q002',
        text: 'Check pressure gauge reading',
        type: QuestionType.multipleChoice,
        isRequired: true,
        order: 2,
        options: ['Green (Normal)', 'Yellow (Recharge)', 'Red (Replace)'],
      ),
      FormQuestion(
        id: 'Q003',
        text: 'Visual inspection notes',
        type: QuestionType.text,
        isRequired: false,
        order: 3,
      ),
    ];
  }

  List<FormQuestion> _getHVACQuestions() {
    return [
      FormQuestion(
        id: 'Q101',
        text: 'Filter condition',
        type: QuestionType.multipleChoice,
        isRequired: true,
        order: 1,
        options: ['Clean', 'Dirty - Replace', 'Missing'],
      ),
      FormQuestion(
        id: 'Q102',
        text: 'Temperature reading (°F)',
        type: QuestionType.number,
        isRequired: true,
        order: 2,
      ),
    ];
  }

  List<FormQuestion> _getVehicleQuestions() {
    return [
      FormQuestion(
        id: 'Q201',
        text: 'Tire condition',
        type: QuestionType.rating,
        isRequired: true,
        order: 1,
        ratingScale: 5,
      ),
      FormQuestion(
        id: 'Q202',
        text: 'Brake functionality',
        type: QuestionType.yesNo,
        isRequired: true,
        order: 2,
      ),
    ];
  }

  List<FormQuestion> _getQualityQuestions() {
    return [
      FormQuestion(
        id: 'Q301',
        text: 'Product meets specifications',
        type: QuestionType.yesNo,
        isRequired: true,
        order: 1,
      ),
      FormQuestion(
        id: 'Q302',
        text: 'Defects found',
        type: QuestionType.checkbox,
        isRequired: false,
        order: 2,
        options: ['Scratches', 'Dents', 'Color variation', 'Size variance'],
      ),
    ];
  }
}