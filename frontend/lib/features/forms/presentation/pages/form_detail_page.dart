import 'package:flutter/material.dart';
import 'package:flutter_hooks/flutter_hooks.dart';
import 'package:hooks_riverpod/hooks_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../../shared/presentation/widgets/responsive_scaffold.dart';
import '../../../../shared/presentation/widgets/loading_overlay.dart';
import '../../../../shared/presentation/widgets/custom_button.dart';
import '../../../../core/constants/app_constants.dart';

/// Page for viewing and managing form template details
class FormDetailPage extends HookConsumerWidget {
  final String formId;
  
  const FormDetailPage({
    super.key,
    required this.formId,
  });

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final theme = Theme.of(context);
    final colorScheme = theme.colorScheme;
    final isLoading = useState(false);
    final selectedTab = useState(0);
    
    // Mock data - in real app, this would come from a provider
    final form = useState(_getMockForm(formId));
    final sections = useState(_getMockSections());
    final usageStats = useState(_getMockUsageStats());
    
    if (form.value == null) {
      return ResponsiveScaffold(
        title: 'Form Not Found',
        body: const Center(
          child: Text('Form template not found'),
        ),
      );
    }

    return ResponsiveScaffold(
      title: form.value!['name'],
      body: LoadingOverlay(
        isLoading: isLoading.value,
        child: Column(
          children: [
            _buildHeader(context, theme, colorScheme, form.value!),
            _buildTabBar(theme, colorScheme, selectedTab),
            Expanded(
              child: _buildTabContent(
                context,
                theme,
                colorScheme,
                selectedTab.value,
                form.value!,
                sections.value,
                usageStats.value,
              ),
            ),
          ],
        ),
      ),
      floatingActionButton: _buildFloatingActionButtons(context, form.value!),
    );
  }

  Widget _buildHeader(
    BuildContext context,
    ThemeData theme,
    ColorScheme colorScheme,
    Map<String, dynamic> form,
  ) {
    return Container(
      padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(
        gradient: LinearGradient(
          colors: [
            _getCategoryColor(form['category']).withOpacity(0.1),
            _getCategoryColor(form['category']).withOpacity(0.05),
          ],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        border: Border(
          bottom: BorderSide(
            color: colorScheme.outline,
            width: 1,
          ),
        ),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: _getCategoryColor(form['category']),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Icon(
                  _getCategoryIcon(form['category']),
                  color: Colors.white,
                  size: 32,
                ),
              ),
              const SizedBox(width: 16),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      form['name'],
                      style: theme.textTheme.headlineMedium?.copyWith(
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      form['description'],
                      style: theme.textTheme.bodyLarge?.copyWith(
                        color: colorScheme.onSurfaceVariant,
                      ),
                    ),
                  ],
                ),
              ),
              _buildStatusChip(form['status'], theme),
            ],
          ),
          const SizedBox(height: 24),
          Row(
            children: [
              _buildInfoCard(
                'Questions',
                form['questionCount'].toString(),
                Icons.quiz,
                theme,
                colorScheme,
              ),
              const SizedBox(width: 16),
              _buildInfoCard(
                'Sections',
                form['sectionCount'].toString(),
                Icons.view_module,
                theme,
                colorScheme,
              ),
              const SizedBox(width: 16),
              _buildInfoCard(
                'Usage',
                form['usageCount'].toString(),
                Icons.trending_up,
                theme,
                colorScheme,
              ),
              const SizedBox(width: 16),
              _buildInfoCard(
                'Version',
                form['version'],
                Icons.history,
                theme,
                colorScheme,
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildInfoCard(
    String title,
    String value,
    IconData icon,
    ThemeData theme,
    ColorScheme colorScheme,
  ) {
    return Expanded(
      child: Card(
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: Column(
            children: [
              Icon(
                icon,
                color: colorScheme.primary,
                size: 24,
              ),
              const SizedBox(height: 8),
              Text(
                value,
                style: theme.textTheme.titleLarge?.copyWith(
                  fontWeight: FontWeight.bold,
                ),
              ),
              Text(
                title,
                style: theme.textTheme.bodySmall?.copyWith(
                  color: colorScheme.onSurfaceVariant,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildTabBar(
    ThemeData theme,
    ColorScheme colorScheme,
    ValueNotifier<int> selectedTab,
  ) {
    return Container(
      decoration: BoxDecoration(
        border: Border(
          bottom: BorderSide(
            color: colorScheme.outline,
            width: 1,
          ),
        ),
      ),
      child: TabBar(
        controller: useTabController(initialLength: 4),
        onTap: (index) => selectedTab.value = index,
        tabs: const [
          Tab(text: 'Structure', icon: Icon(Icons.account_tree)),
          Tab(text: 'Preview', icon: Icon(Icons.preview)),
          Tab(text: 'Usage', icon: Icon(Icons.analytics)),
          Tab(text: 'Settings', icon: Icon(Icons.settings)),
        ],
      ),
    );
  }

  Widget _buildTabContent(
    BuildContext context,
    ThemeData theme,
    ColorScheme colorScheme,
    int selectedTab,
    Map<String, dynamic> form,
    List<Map<String, dynamic>> sections,
    Map<String, dynamic> usageStats,
  ) {
    switch (selectedTab) {
      case 0:
        return _buildStructureTab(context, theme, colorScheme, sections);
      case 1:
        return _buildPreviewTab(context, theme, colorScheme, form, sections);
      case 2:
        return _buildUsageTab(context, theme, colorScheme, usageStats);
      case 3:
        return _buildSettingsTab(context, theme, colorScheme, form);
      default:
        return const SizedBox();
    }
  }

  Widget _buildStructureTab(
    BuildContext context,
    ThemeData theme,
    ColorScheme colorScheme,
    List<Map<String, dynamic>> sections,
  ) {
    return ListView.builder(
      padding: const EdgeInsets.all(16),
      itemCount: sections.length,
      itemBuilder: (context, index) {
        final section = sections[index];
        return Card(
          margin: const EdgeInsets.only(bottom: 16),
          child: ExpansionTile(
            leading: CircleAvatar(
              backgroundColor: colorScheme.primary,
              child: Text(
                '${index + 1}',
                style: const TextStyle(color: Colors.white),
              ),
            ),
            title: Text(
              section['title'],
              style: theme.textTheme.titleMedium?.copyWith(
                fontWeight: FontWeight.bold,
              ),
            ),
            subtitle: Text(
              '${section['questions'].length} questions',
              style: theme.textTheme.bodySmall?.copyWith(
                color: colorScheme.onSurfaceVariant,
              ),
            ),
            children: [
              ...section['questions'].map<Widget>((question) {
                return ListTile(
                  leading: Icon(
                    _getQuestionTypeIcon(question['type']),
                    color: colorScheme.primary,
                  ),
                  title: Text(question['text']),
                  subtitle: Text(
                    _getQuestionTypeLabel(question['type']),
                    style: theme.textTheme.bodySmall?.copyWith(
                      color: colorScheme.onSurfaceVariant,
                    ),
                  ),
                  trailing: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      if (question['required'] == true)
                        Icon(
                          Icons.star,
                          color: Colors.red,
                          size: 16,
                        ),
                      IconButton(
                        icon: const Icon(Icons.edit),
                        onPressed: () => _editQuestion(context, question),
                      ),
                    ],
                  ),
                );
              }).toList(),
              Padding(
                padding: const EdgeInsets.all(16),
                child: Row(
                  children: [
                    CustomButton(
                      text: 'Add Question',
                      onPressed: () => _addQuestion(context, section),
                      variant: ButtonVariant.outline,
                      size: ButtonSize.small,
                    ),
                    const SizedBox(width: 8),
                    CustomButton(
                      text: 'Edit Section',
                      onPressed: () => _editSection(context, section),
                      variant: ButtonVariant.text,
                      size: ButtonSize.small,
                    ),
                  ],
                ),
              ),
            ],
          ),
        );
      },
    );
  }

  Widget _buildPreviewTab(
    BuildContext context,
    ThemeData theme,
    ColorScheme colorScheme,
    Map<String, dynamic> form,
    List<Map<String, dynamic>> sections,
  ) {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Card(
            child: Padding(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'Form Preview',
                    style: theme.textTheme.headlineSmall?.copyWith(
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  const SizedBox(height: 8),
                  Text(
                    'This is how the form will appear to inspectors',
                    style: theme.textTheme.bodyMedium?.copyWith(
                      color: colorScheme.onSurfaceVariant,
                    ),
                  ),
                ],
              ),
            ),
          ),
          const SizedBox(height: 16),
          ...sections.map((section) {
            return Card(
              margin: const EdgeInsets.only(bottom: 16),
              child: Padding(
                padding: const EdgeInsets.all(16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      section['title'],
                      style: theme.textTheme.titleLarge?.copyWith(
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    if (section['description'] != null) ..[
                      const SizedBox(height: 8),
                      Text(
                        section['description'],
                        style: theme.textTheme.bodyMedium?.copyWith(
                          color: colorScheme.onSurfaceVariant,
                        ),
                      ),
                    ],
                    const SizedBox(height: 16),
                    ...section['questions'].map<Widget>((question) {
                      return Padding(
                        padding: const EdgeInsets.only(bottom: 16),
                        child: _buildQuestionPreview(question, theme, colorScheme),
                      );
                    }).toList(),
                  ],
                ),
              ),
            );
          }).toList(),
        ],
      ),
    );
  }

  Widget _buildQuestionPreview(
    Map<String, dynamic> question,
    ThemeData theme,
    ColorScheme colorScheme,
  ) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          children: [
            Expanded(
              child: Text(
                question['text'],
                style: theme.textTheme.titleMedium,
              ),
            ),
            if (question['required'] == true)
              Text(
                '*',
                style: TextStyle(
                  color: Colors.red,
                  fontSize: 18,
                  fontWeight: FontWeight.bold,
                ),
              ),
          ],
        ),
        const SizedBox(height: 8),
        _buildQuestionInput(question, theme, colorScheme),
      ],
    );
  }

  Widget _buildQuestionInput(
    Map<String, dynamic> question,
    ThemeData theme,
    ColorScheme colorScheme,
  ) {
    switch (question['type']) {
      case 'text':
        return TextField(
          enabled: false,
          decoration: InputDecoration(
            hintText: 'Text input',
            border: OutlineInputBorder(),
          ),
        );
      case 'number':
        return TextField(
          enabled: false,
          decoration: InputDecoration(
            hintText: 'Number input',
            border: OutlineInputBorder(),
          ),
          keyboardType: TextInputType.number,
        );
      case 'multipleChoice':
        return Column(
          children: question['options'].map<Widget>((option) {
            return RadioListTile<String>(
              title: Text(option),
              value: option,
              groupValue: null,
              onChanged: null,
            );
          }).toList(),
        );
      case 'yesNo':
        return Row(
          children: [
            Expanded(
              child: RadioListTile<bool>(
                title: const Text('Yes'),
                value: true,
                groupValue: null,
                onChanged: null,
              ),
            ),
            Expanded(
              child: RadioListTile<bool>(
                title: const Text('No'),
                value: false,
                groupValue: null,
                onChanged: null,
              ),
            ),
          ],
        );
      case 'rating':
        return Row(
          children: List.generate(5, (index) {
            return IconButton(
              icon: Icon(
                Icons.star_border,
                color: colorScheme.primary,
              ),
              onPressed: null,
            );
          }),
        );
      case 'photo':
        return Container(
          height: 120,
          decoration: BoxDecoration(
            border: Border.all(color: colorScheme.outline),
            borderRadius: BorderRadius.circular(8),
          ),
          child: Center(
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Icon(
                  Icons.camera_alt,
                  size: 32,
                  color: colorScheme.onSurfaceVariant,
                ),
                const SizedBox(height: 8),
                Text(
                  'Photo capture',
                  style: theme.textTheme.bodyMedium?.copyWith(
                    color: colorScheme.onSurfaceVariant,
                  ),
                ),
              ],
            ),
          ),
        );
      case 'signature':
        return Container(
          height: 120,
          decoration: BoxDecoration(
            border: Border.all(color: colorScheme.outline),
            borderRadius: BorderRadius.circular(8),
          ),
          child: Center(
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Icon(
                  Icons.draw,
                  size: 32,
                  color: colorScheme.onSurfaceVariant,
                ),
                const SizedBox(height: 8),
                Text(
                  'Signature pad',
                  style: theme.textTheme.bodyMedium?.copyWith(
                    color: colorScheme.onSurfaceVariant,
                  ),
                ),
              ],
            ),
          ),
        );
      default:
        return const SizedBox();
    }
  }

  Widget _buildUsageTab(
    BuildContext context,
    ThemeData theme,
    ColorScheme colorScheme,
    Map<String, dynamic> usageStats,
  ) {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Expanded(
                child: _buildStatCard(
                  'Total Inspections',
                  usageStats['totalInspections'].toString(),
                  Icons.assignment,
                  Colors.blue,
                  theme,
                  colorScheme,
                ),
              ),
              const SizedBox(width: 16),
              Expanded(
                child: _buildStatCard(
                  'This Month',
                  usageStats['thisMonth'].toString(),
                  Icons.calendar_today,
                  Colors.green,
                  theme,
                  colorScheme,
                ),
              ),
            ],
          ),
          const SizedBox(height: 16),
          Row(
            children: [
              Expanded(
                child: _buildStatCard(
                  'Avg. Completion Time',
                  '${usageStats['avgCompletionTime']} min',
                  Icons.timer,
                  Colors.orange,
                  theme,
                  colorScheme,
                ),
              ),
              const SizedBox(width: 16),
              Expanded(
                child: _buildStatCard(
                  'Success Rate',
                  '${usageStats['successRate']}%',
                  Icons.check_circle,
                  Colors.green,
                  theme,
                  colorScheme,
                ),
              ),
            ],
          ),
          const SizedBox(height: 24),
          Card(
            child: Padding(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'Recent Inspections',
                    style: theme.textTheme.titleLarge?.copyWith(
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  const SizedBox(height: 16),
                  ...usageStats['recentInspections'].map<Widget>((inspection) {
                    return ListTile(
                      leading: CircleAvatar(
                        backgroundColor: _getStatusColor(inspection['status']),
                        child: Icon(
                          _getStatusIcon(inspection['status']),
                          color: Colors.white,
                          size: 20,
                        ),
                      ),
                      title: Text(inspection['assetName']),
                      subtitle: Text(
                        'Inspector: ${inspection['inspector']} • ${_formatDate(inspection['date'])}',
                      ),
                      trailing: Text(
                        inspection['status'],
                        style: TextStyle(
                          color: _getStatusColor(inspection['status']),
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                      onTap: () => context.go('/inspections/${inspection['id']}'),
                    );
                  }).toList(),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildSettingsTab(
    BuildContext context,
    ThemeData theme,
    ColorScheme colorScheme,
    Map<String, dynamic> form,
  ) {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Card(
            child: Padding(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'Form Information',
                    style: theme.textTheme.titleLarge?.copyWith(
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  const SizedBox(height: 16),
                  _buildInfoRow('Form ID', form['id'], theme, colorScheme),
                  _buildInfoRow('Category', form['category'], theme, colorScheme),
                  _buildInfoRow('Version', form['version'], theme, colorScheme),
                  _buildInfoRow('Created', _formatDate(form['createdAt']), theme, colorScheme),
                  _buildInfoRow('Last Modified', _formatDate(form['updatedAt']), theme, colorScheme),
                  _buildInfoRow('Created By', form['createdBy'], theme, colorScheme),
                ],
              ),
            ),
          ),
          const SizedBox(height: 16),
          Card(
            child: Padding(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'Actions',
                    style: theme.textTheme.titleLarge?.copyWith(
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  const SizedBox(height: 16),
                  ListTile(
                    leading: const Icon(Icons.edit),
                    title: const Text('Edit Form'),
                    subtitle: const Text('Modify form structure and questions'),
                    onTap: () => context.go('/forms/$formId/edit'),
                  ),
                  ListTile(
                    leading: const Icon(Icons.copy),
                    title: const Text('Duplicate Form'),
                    subtitle: const Text('Create a copy of this form'),
                    onTap: () => _duplicateForm(context),
                  ),
                  ListTile(
                    leading: const Icon(Icons.download),
                    title: const Text('Export Form'),
                    subtitle: const Text('Export form as JSON or PDF'),
                    onTap: () => _exportForm(context),
                  ),
                  ListTile(
                    leading: const Icon(Icons.archive),
                    title: const Text('Archive Form'),
                    subtitle: const Text('Archive this form template'),
                    onTap: () => _archiveForm(context),
                  ),
                  ListTile(
                    leading: const Icon(Icons.delete, color: Colors.red),
                    title: const Text('Delete Form', style: TextStyle(color: Colors.red)),
                    subtitle: const Text('Permanently delete this form'),
                    onTap: () => _deleteForm(context),
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildInfoRow(
    String label,
    String value,
    ThemeData theme,
    ColorScheme colorScheme,
  ) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 12),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          SizedBox(
            width: 120,
            child: Text(
              label,
              style: theme.textTheme.bodyMedium?.copyWith(
                fontWeight: FontWeight.bold,
                color: colorScheme.onSurfaceVariant,
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

  Widget _buildStatCard(
    String title,
    String value,
    IconData icon,
    Color color,
    ThemeData theme,
    ColorScheme colorScheme,
  ) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Icon(
                  icon,
                  color: color,
                  size: 20,
                ),
                const Spacer(),
                Text(
                  value,
                  style: theme.textTheme.headlineSmall?.copyWith(
                    fontWeight: FontWeight.bold,
                    color: color,
                  ),
                ),
              ],
            ),
            const SizedBox(height: 8),
            Text(
              title,
              style: theme.textTheme.bodySmall?.copyWith(
                color: colorScheme.onSurfaceVariant,
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildStatusChip(String status, ThemeData theme) {
    Color color;
    String label;
    
    switch (status) {
      case 'active':
        color = Colors.green;
        label = 'Active';
        break;
      case 'draft':
        color = Colors.orange;
        label = 'Draft';
        break;
      case 'archived':
        color = Colors.grey;
        label = 'Archived';
        break;
      default:
        color = Colors.grey;
        label = status;
    }
    
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
      decoration: BoxDecoration(
        color: color.withOpacity(0.1),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: color, width: 1),
      ),
      child: Text(
        label,
        style: theme.textTheme.bodySmall?.copyWith(
          color: color,
          fontWeight: FontWeight.bold,
        ),
      ),
    );
  }

  Widget _buildFloatingActionButtons(BuildContext context, Map<String, dynamic> form) {
    return Column(
      mainAxisSize: MainAxisSize.min,
      children: [
        FloatingActionButton(
          heroTag: 'edit',
          onPressed: () => context.go('/forms/${form['id']}/edit'),
          child: const Icon(Icons.edit),
        ),
        const SizedBox(height: 8),
        FloatingActionButton.extended(
          heroTag: 'test',
          onPressed: () => _testForm(context),
          icon: const Icon(Icons.play_arrow),
          label: const Text('Test Form'),
        ),
      ],
    );
  }

  Color _getCategoryColor(String category) {
    switch (category) {
      case 'safety':
        return Colors.red;
      case 'equipment':
        return Colors.blue;
      case 'maintenance':
        return Colors.orange;
      case 'quality':
        return Colors.green;
      case 'environmental':
        return Colors.teal;
      default:
        return Colors.grey;
    }
  }

  IconData _getCategoryIcon(String category) {
    switch (category) {
      case 'safety':
        return Icons.security;
      case 'equipment':
        return Icons.precision_manufacturing;
      case 'maintenance':
        return Icons.build;
      case 'quality':
        return Icons.verified;
      case 'environmental':
        return Icons.eco;
      default:
        return Icons.description;
    }
  }

  IconData _getQuestionTypeIcon(String type) {
    switch (type) {
      case 'text':
        return Icons.text_fields;
      case 'number':
        return Icons.numbers;
      case 'multipleChoice':
        return Icons.radio_button_checked;
      case 'yesNo':
        return Icons.check_box;
      case 'rating':
        return Icons.star;
      case 'photo':
        return Icons.camera_alt;
      case 'signature':
        return Icons.draw;
      default:
        return Icons.help;
    }
  }

  String _getQuestionTypeLabel(String type) {
    switch (type) {
      case 'text':
        return 'Text Input';
      case 'number':
        return 'Number Input';
      case 'multipleChoice':
        return 'Multiple Choice';
      case 'yesNo':
        return 'Yes/No';
      case 'rating':
        return 'Rating';
      case 'photo':
        return 'Photo';
      case 'signature':
        return 'Signature';
      default:
        return 'Unknown';
    }
  }

  Color _getStatusColor(String status) {
    switch (status) {
      case 'completed':
        return Colors.green;
      case 'in_progress':
        return Colors.orange;
      case 'failed':
        return Colors.red;
      default:
        return Colors.grey;
    }
  }

  IconData _getStatusIcon(String status) {
    switch (status) {
      case 'completed':
        return Icons.check;
      case 'in_progress':
        return Icons.hourglass_empty;
      case 'failed':
        return Icons.error;
      default:
        return Icons.help;
    }
  }

  String _formatDate(DateTime date) {
    return '${date.day}/${date.month}/${date.year}';
  }

  void _editQuestion(BuildContext context, Map<String, dynamic> question) {
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(content: Text('Edit question functionality')),
    );
  }

  void _addQuestion(BuildContext context, Map<String, dynamic> section) {
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(content: Text('Add question functionality')),
    );
  }

  void _editSection(BuildContext context, Map<String, dynamic> section) {
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(content: Text('Edit section functionality')),
    );
  }

  void _testForm(BuildContext context) {
    context.go('/forms/$formId/test');
  }

  void _duplicateForm(BuildContext context) {
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(
        content: Text('Form duplicated successfully'),
        backgroundColor: Colors.green,
      ),
    );
  }

  void _exportForm(BuildContext context) {
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(
        content: Text('Form exported successfully'),
        backgroundColor: Colors.blue,
      ),
    );
  }

  void _archiveForm(BuildContext context) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Archive Form'),
        content: const Text('Are you sure you want to archive this form? It will no longer be available for new inspections.'),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(context).pop(),
            child: const Text('Cancel'),
          ),
          TextButton(
            onPressed: () {
              Navigator.of(context).pop();
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(
                  content: Text('Form archived successfully'),
                  backgroundColor: Colors.orange,
                ),
              );
            },
            child: const Text('Archive'),
          ),
        ],
      ),
    );
  }

  void _deleteForm(BuildContext context) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Delete Form'),
        content: const Text('Are you sure you want to delete this form? This action cannot be undone.'),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(context).pop(),
            child: const Text('Cancel'),
          ),
          TextButton(
            onPressed: () {
              Navigator.of(context).pop();
              context.go('/forms');
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(
                  content: Text('Form deleted successfully'),
                  backgroundColor: Colors.red,
                ),
              );
            },
            child: const Text('Delete', style: TextStyle(color: Colors.red)),
          ),
        ],
      ),
    );
  }

  Map<String, dynamic>? _getMockForm(String formId) {
    final forms = {
      'FORM001': {
        'id': 'FORM001',
        'name': 'Equipment Safety Inspection',
        'description': 'Comprehensive safety inspection checklist for manufacturing equipment',
        'category': 'safety',
        'status': 'active',
        'questionCount': 25,
        'sectionCount': 4,
        'usageCount': 156,
        'version': '2.1',
        'createdAt': DateTime.now().subtract(const Duration(days: 30)),
        'updatedAt': DateTime.now().subtract(const Duration(days: 5)),
        'createdBy': 'John Smith',
      },
    };
    
    return forms[formId];
  }

  List<Map<String, dynamic>> _getMockSections() {
    return [
      {
        'id': 'SEC001',
        'title': 'General Information',
        'description': 'Basic equipment information and identification',
        'questions': [
          {
            'id': 'Q001',
            'text': 'Equipment Serial Number',
            'type': 'text',
            'required': true,
          },
          {
            'id': 'Q002',
            'text': 'Last Maintenance Date',
            'type': 'date',
            'required': true,
          },
        ],
      },
      {
        'id': 'SEC002',
        'title': 'Safety Checks',
        'description': 'Critical safety component inspection',
        'questions': [
          {
            'id': 'Q003',
            'text': 'Emergency stop button functional?',
            'type': 'yesNo',
            'required': true,
          },
          {
            'id': 'Q004',
            'text': 'Safety guards in place?',
            'type': 'yesNo',
            'required': true,
          },
          {
            'id': 'Q005',
            'text': 'Overall safety rating',
            'type': 'rating',
            'required': true,
          },
        ],
      },
      {
        'id': 'SEC003',
        'title': 'Visual Inspection',
        'description': 'Photo documentation of equipment condition',
        'questions': [
          {
            'id': 'Q006',
            'text': 'Equipment overview photo',
            'type': 'photo',
            'required': true,
          },
          {
            'id': 'Q007',
            'text': 'Any visible damage or wear?',
            'type': 'multipleChoice',
            'options': ['None', 'Minor wear', 'Moderate damage', 'Severe damage'],
            'required': true,
          },
        ],
      },
      {
        'id': 'SEC004',
        'title': 'Sign-off',
        'description': 'Inspector signature and final notes',
        'questions': [
          {
            'id': 'Q008',
            'text': 'Additional notes or observations',
            'type': 'text',
            'required': false,
          },
          {
            'id': 'Q009',
            'text': 'Inspector signature',
            'type': 'signature',
            'required': true,
          },
        ],
      },
    ];
  }

  Map<String, dynamic> _getMockUsageStats() {
    return {
      'totalInspections': 156,
      'thisMonth': 23,
      'avgCompletionTime': 18,
      'successRate': 94,
      'recentInspections': [
        {
          'id': 'INS001',
          'assetName': 'CNC Machine #1',
          'inspector': 'John Doe',
          'date': DateTime.now().subtract(const Duration(days: 1)),
          'status': 'completed',
        },
        {
          'id': 'INS002',
          'assetName': 'Conveyor Belt A',
          'inspector': 'Jane Smith',
          'date': DateTime.now().subtract(const Duration(days: 2)),
          'status': 'completed',
        },
        {
          'id': 'INS003',
          'assetName': 'Press Machine #3',
          'inspector': 'Mike Johnson',
          'date': DateTime.now().subtract(const Duration(days: 3)),
          'status': 'in_progress',
        },
      ],
    };
  }
}