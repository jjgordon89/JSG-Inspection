import 'package:flutter/material.dart';
import 'package:flutter_hooks/flutter_hooks.dart';

class RatingWidget extends HookWidget {
  final double rating;
  final int maxRating;
  final Function(double) onRatingChanged;
  final bool isReadOnly;
  final double size;
  final Color? activeColor;
  final Color? inactiveColor;
  final IconData? icon;
  final bool allowHalfRating;
  final String? label;
  final RatingStyle style;

  const RatingWidget({
    super.key,
    required this.rating,
    required this.onRatingChanged,
    this.maxRating = 5,
    this.isReadOnly = false,
    this.size = 32.0,
    this.activeColor,
    this.inactiveColor,
    this.icon,
    this.allowHalfRating = false,
    this.label,
    this.style = RatingStyle.stars,
  });

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final currentRating = useState(rating);
    final hoverRating = useState<double?>(null);
    
    final effectiveActiveColor = activeColor ?? theme.colorScheme.primary;
    final effectiveInactiveColor = inactiveColor ?? theme.colorScheme.outline;
    final effectiveIcon = icon ?? _getDefaultIcon(style);

    useEffect(() {
      currentRating.value = rating;
    }, [rating]);

    void handleRatingChange(double newRating) {
      if (isReadOnly) return;
      
      currentRating.value = newRating;
      onRatingChanged(newRating);
    }

    void handleHover(double? hoverValue) {
      if (isReadOnly) return;
      hoverRating.value = hoverValue;
    }

    switch (style) {
      case RatingStyle.stars:
        return _buildStarRating(
          context,
          theme,
          currentRating,
          hoverRating,
          effectiveActiveColor,
          effectiveInactiveColor,
          effectiveIcon,
          handleRatingChange,
          handleHover,
        );
      case RatingStyle.thumbs:
        return _buildThumbsRating(
          context,
          theme,
          currentRating,
          effectiveActiveColor,
          effectiveInactiveColor,
          handleRatingChange,
        );
      case RatingStyle.numeric:
        return _buildNumericRating(
          context,
          theme,
          currentRating,
          effectiveActiveColor,
          handleRatingChange,
        );
      case RatingStyle.slider:
        return _buildSliderRating(
          context,
          theme,
          currentRating,
          effectiveActiveColor,
          handleRatingChange,
        );
    }
  }

  IconData _getDefaultIcon(RatingStyle style) {
    switch (style) {
      case RatingStyle.stars:
        return Icons.star;
      case RatingStyle.thumbs:
        return Icons.thumb_up;
      case RatingStyle.numeric:
        return Icons.numbers;
      case RatingStyle.slider:
        return Icons.tune;
    }
  }

  Widget _buildStarRating(
    BuildContext context,
    ThemeData theme,
    ValueNotifier<double> currentRating,
    ValueNotifier<double?> hoverRating,
    Color activeColor,
    Color inactiveColor,
    IconData iconData,
    Function(double) onRatingChange,
    Function(double?) onHover,
  ) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        if (label != null) ..[
          Text(
            label!,
            style: theme.textTheme.bodyMedium?.copyWith(
              fontWeight: FontWeight.w500,
            ),
          ),
          const SizedBox(height: 8),
        ],
        Row(
          mainAxisSize: MainAxisSize.min,
          children: List.generate(maxRating, (index) {
            final starValue = index + 1.0;
            final displayRating = hoverRating.value ?? currentRating.value;
            final isFilled = displayRating >= starValue;
            final isHalfFilled = allowHalfRating && 
                displayRating >= starValue - 0.5 && 
                displayRating < starValue;

            return MouseRegion(
              onEnter: (_) => onHover(starValue),
              onExit: (_) => onHover(null),
              child: GestureDetector(
                onTap: () => onRatingChange(starValue),
                onTapDown: allowHalfRating ? (details) {
                  final RenderBox box = context.findRenderObject() as RenderBox;
                  final localPosition = box.globalToLocal(details.globalPosition);
                  final starWidth = size;
                  final relativeX = localPosition.dx - (index * starWidth);
                  final halfRating = relativeX < starWidth / 2 ? starValue - 0.5 : starValue;
                  onRatingChange(halfRating);
                } : null,
                child: Container(
                  padding: const EdgeInsets.all(4),
                  child: Stack(
                    children: [
                      Icon(
                        iconData,
                        size: size,
                        color: inactiveColor,
                      ),
                      if (isFilled || isHalfFilled)
                        ClipRect(
                          clipper: isHalfFilled ? _HalfClipper() : null,
                          child: Icon(
                            iconData,
                            size: size,
                            color: activeColor,
                          ),
                        ),
                    ],
                  ),
                ),
              ),
            );
          }),
        ),
        const SizedBox(height: 8),
        Text(
          '${currentRating.value.toStringAsFixed(allowHalfRating ? 1 : 0)} / $maxRating',
          style: theme.textTheme.bodySmall?.copyWith(
            color: theme.colorScheme.onSurfaceVariant,
          ),
        ),
      ],
    );
  }

  Widget _buildThumbsRating(
    BuildContext context,
    ThemeData theme,
    ValueNotifier<double> currentRating,
    Color activeColor,
    Color inactiveColor,
    Function(double) onRatingChange,
  ) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        if (label != null) ..[
          Text(
            label!,
            style: theme.textTheme.bodyMedium?.copyWith(
              fontWeight: FontWeight.w500,
            ),
          ),
          const SizedBox(height: 8),
        ],
        Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            GestureDetector(
              onTap: () => onRatingChange(0),
              child: Container(
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: currentRating.value == 0 
                      ? theme.colorScheme.errorContainer
                      : theme.colorScheme.surface,
                  borderRadius: BorderRadius.circular(8),
                  border: Border.all(
                    color: currentRating.value == 0 
                        ? theme.colorScheme.error
                        : theme.colorScheme.outline,
                  ),
                ),
                child: Icon(
                  Icons.thumb_down,
                  size: size,
                  color: currentRating.value == 0 
                      ? theme.colorScheme.error
                      : inactiveColor,
                ),
              ),
            ),
            const SizedBox(width: 16),
            GestureDetector(
              onTap: () => onRatingChange(1),
              child: Container(
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: currentRating.value == 1 
                      ? theme.colorScheme.primaryContainer
                      : theme.colorScheme.surface,
                  borderRadius: BorderRadius.circular(8),
                  border: Border.all(
                    color: currentRating.value == 1 
                        ? activeColor
                        : theme.colorScheme.outline,
                  ),
                ),
                child: Icon(
                  Icons.thumb_up,
                  size: size,
                  color: currentRating.value == 1 
                      ? activeColor
                      : inactiveColor,
                ),
              ),
            ),
          ],
        ),
        const SizedBox(height: 8),
        Text(
          currentRating.value == 0 
              ? 'Thumbs Down' 
              : currentRating.value == 1 
                  ? 'Thumbs Up' 
                  : 'No Rating',
          style: theme.textTheme.bodySmall?.copyWith(
            color: theme.colorScheme.onSurfaceVariant,
          ),
        ),
      ],
    );
  }

  Widget _buildNumericRating(
    BuildContext context,
    ThemeData theme,
    ValueNotifier<double> currentRating,
    Color activeColor,
    Function(double) onRatingChange,
  ) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        if (label != null) ..[
          Text(
            label!,
            style: theme.textTheme.bodyMedium?.copyWith(
              fontWeight: FontWeight.w500,
            ),
          ),
          const SizedBox(height: 8),
        ],
        Wrap(
          spacing: 8,
          children: List.generate(maxRating, (index) {
            final value = index + 1.0;
            final isSelected = currentRating.value == value;
            
            return GestureDetector(
              onTap: () => onRatingChange(value),
              child: Container(
                width: size,
                height: size,
                decoration: BoxDecoration(
                  color: isSelected 
                      ? activeColor
                      : theme.colorScheme.surface,
                  borderRadius: BorderRadius.circular(8),
                  border: Border.all(
                    color: isSelected 
                        ? activeColor
                        : theme.colorScheme.outline,
                  ),
                ),
                child: Center(
                  child: Text(
                    value.toInt().toString(),
                    style: theme.textTheme.bodyMedium?.copyWith(
                      color: isSelected 
                          ? theme.colorScheme.onPrimary
                          : theme.colorScheme.onSurface,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                ),
              ),
            );
          }),
        ),
        const SizedBox(height: 8),
        Text(
          'Selected: ${currentRating.value.toInt()} / $maxRating',
          style: theme.textTheme.bodySmall?.copyWith(
            color: theme.colorScheme.onSurfaceVariant,
          ),
        ),
      ],
    );
  }

  Widget _buildSliderRating(
    BuildContext context,
    ThemeData theme,
    ValueNotifier<double> currentRating,
    Color activeColor,
    Function(double) onRatingChange,
  ) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        if (label != null) ..[
          Text(
            label!,
            style: theme.textTheme.bodyMedium?.copyWith(
              fontWeight: FontWeight.w500,
            ),
          ),
          const SizedBox(height: 8),
        ],
        SliderTheme(
          data: SliderTheme.of(context).copyWith(
            activeTrackColor: activeColor,
            thumbColor: activeColor,
            overlayColor: activeColor.withOpacity(0.2),
            valueIndicatorColor: activeColor,
            valueIndicatorTextStyle: TextStyle(
              color: theme.colorScheme.onPrimary,
            ),
          ),
          child: Slider(
            value: currentRating.value,
            min: 0,
            max: maxRating.toDouble(),
            divisions: allowHalfRating ? maxRating * 2 : maxRating,
            label: currentRating.value.toStringAsFixed(allowHalfRating ? 1 : 0),
            onChanged: isReadOnly ? null : onRatingChange,
          ),
        ),
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Text(
              '0',
              style: theme.textTheme.bodySmall?.copyWith(
                color: theme.colorScheme.onSurfaceVariant,
              ),
            ),
            Text(
              '${currentRating.value.toStringAsFixed(allowHalfRating ? 1 : 0)} / $maxRating',
              style: theme.textTheme.bodyMedium?.copyWith(
                fontWeight: FontWeight.w500,
              ),
            ),
            Text(
              maxRating.toString(),
              style: theme.textTheme.bodySmall?.copyWith(
                color: theme.colorScheme.onSurfaceVariant,
              ),
            ),
          ],
        ),
      ],
    );
  }
}

class _HalfClipper extends CustomClipper<Rect> {
  @override
  Rect getClip(Size size) {
    return Rect.fromLTWH(0, 0, size.width / 2, size.height);
  }

  @override
  bool shouldReclip(CustomClipper<Rect> oldClipper) => false;
}

enum RatingStyle {
  stars,
  thumbs,
  numeric,
  slider,
}