import 'package:flutter/material.dart';

/// Button size variants
enum ButtonSize {
  small,
  medium,
  large,
}

/// Button style variants
enum ButtonVariant {
  primary,
  secondary,
  outline,
  text,
  danger,
}

/// Extension for ButtonSize to provide dimensions
extension ButtonSizeExtension on ButtonSize {
  double get height {
    switch (this) {
      case ButtonSize.small:
        return 36;
      case ButtonSize.medium:
        return 44;
      case ButtonSize.large:
        return 52;
    }
  }

  EdgeInsetsGeometry get padding {
    switch (this) {
      case ButtonSize.small:
        return const EdgeInsets.symmetric(horizontal: 12, vertical: 8);
      case ButtonSize.medium:
        return const EdgeInsets.symmetric(horizontal: 16, vertical: 12);
      case ButtonSize.large:
        return const EdgeInsets.symmetric(horizontal: 20, vertical: 16);
    }
  }

  double get fontSize {
    switch (this) {
      case ButtonSize.small:
        return 14;
      case ButtonSize.medium:
        return 16;
      case ButtonSize.large:
        return 18;
    }
  }
}

/// A custom button widget with consistent styling and variants
class CustomButton extends StatelessWidget {
  final String text;
  final VoidCallback? onPressed;
  final ButtonVariant variant;
  final ButtonSize size;
  final bool isLoading;
  final bool isFullWidth;
  final IconData? icon;
  final bool iconAtEnd;
  final double? borderRadius;
  final EdgeInsetsGeometry? padding;
  final TextStyle? textStyle;
  final Color? backgroundColor;
  final Color? foregroundColor;
  final Color? borderColor;
  final double? elevation;
  final Widget? child;

  const CustomButton({
    super.key,
    required this.text,
    this.onPressed,
    this.variant = ButtonVariant.primary,
    this.size = ButtonSize.medium,
    this.isLoading = false,
    this.isFullWidth = false,
    this.icon,
    this.iconAtEnd = false,
    this.borderRadius,
    this.padding,
    this.textStyle,
    this.backgroundColor,
    this.foregroundColor,
    this.borderColor,
    this.elevation,
    this.child,
  });

  /// Primary button constructor
  const CustomButton.primary({
    super.key,
    required this.text,
    this.onPressed,
    this.size = ButtonSize.medium,
    this.isLoading = false,
    this.isFullWidth = false,
    this.icon,
    this.iconAtEnd = false,
    this.borderRadius,
    this.padding,
    this.textStyle,
    this.backgroundColor,
    this.foregroundColor,
    this.borderColor,
    this.elevation,
    this.child,
  }) : variant = ButtonVariant.primary;

  /// Secondary button constructor
  const CustomButton.secondary({
    super.key,
    required this.text,
    this.onPressed,
    this.size = ButtonSize.medium,
    this.isLoading = false,
    this.isFullWidth = false,
    this.icon,
    this.iconAtEnd = false,
    this.borderRadius,
    this.padding,
    this.textStyle,
    this.backgroundColor,
    this.foregroundColor,
    this.borderColor,
    this.elevation,
    this.child,
  }) : variant = ButtonVariant.secondary;

  /// Outline button constructor
  const CustomButton.outline({
    super.key,
    required this.text,
    this.onPressed,
    this.size = ButtonSize.medium,
    this.isLoading = false,
    this.isFullWidth = false,
    this.icon,
    this.iconAtEnd = false,
    this.borderRadius,
    this.padding,
    this.textStyle,
    this.backgroundColor,
    this.foregroundColor,
    this.borderColor,
    this.elevation,
    this.child,
  }) : variant = ButtonVariant.outline;

  /// Text button constructor
  const CustomButton.text({
    super.key,
    required this.text,
    this.onPressed,
    this.size = ButtonSize.medium,
    this.isLoading = false,
    this.isFullWidth = false,
    this.icon,
    this.iconAtEnd = false,
    this.borderRadius,
    this.padding,
    this.textStyle,
    this.backgroundColor,
    this.foregroundColor,
    this.borderColor,
    this.elevation,
    this.child,
  }) : variant = ButtonVariant.text;

  /// Danger button constructor
  const CustomButton.danger({
    super.key,
    required this.text,
    this.onPressed,
    this.size = ButtonSize.medium,
    this.isLoading = false,
    this.isFullWidth = false,
    this.icon,
    this.iconAtEnd = false,
    this.borderRadius,
    this.padding,
    this.textStyle,
    this.backgroundColor,
    this.foregroundColor,
    this.borderColor,
    this.elevation,
    this.child,
  }) : variant = ButtonVariant.danger;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final colorScheme = theme.colorScheme;
    final isEnabled = onPressed != null && !isLoading;

    // Get button colors based on variant
    final buttonColors = _getButtonColors(colorScheme);
    
    final buttonStyle = _getButtonStyle(theme, buttonColors, isEnabled);
    
    Widget buttonChild = child ?? _buildButtonContent(theme);
    
    if (isLoading) {
      buttonChild = _buildLoadingContent(theme, buttonColors);
    }

    Widget button;
    
    switch (variant) {
      case ButtonVariant.primary:
      case ButtonVariant.secondary:
      case ButtonVariant.danger:
        button = ElevatedButton(
          onPressed: isEnabled ? onPressed : null,
          style: buttonStyle,
          child: buttonChild,
        );
        break;
      case ButtonVariant.outline:
        button = OutlinedButton(
          onPressed: isEnabled ? onPressed : null,
          style: buttonStyle,
          child: buttonChild,
        );
        break;
      case ButtonVariant.text:
        button = TextButton(
          onPressed: isEnabled ? onPressed : null,
          style: buttonStyle,
          child: buttonChild,
        );
        break;
    }

    if (isFullWidth) {
      return SizedBox(
        width: double.infinity,
        child: button,
      );
    }

    return button;
  }

  ButtonColors _getButtonColors(ColorScheme colorScheme) {
    switch (variant) {
      case ButtonVariant.primary:
        return ButtonColors(
          background: backgroundColor ?? colorScheme.primary,
          foreground: foregroundColor ?? colorScheme.onPrimary,
          border: borderColor ?? colorScheme.primary,
        );
      case ButtonVariant.secondary:
        return ButtonColors(
          background: backgroundColor ?? colorScheme.secondary,
          foreground: foregroundColor ?? colorScheme.onSecondary,
          border: borderColor ?? colorScheme.secondary,
        );
      case ButtonVariant.outline:
        return ButtonColors(
          background: backgroundColor ?? Colors.transparent,
          foreground: foregroundColor ?? colorScheme.primary,
          border: borderColor ?? colorScheme.outline,
        );
      case ButtonVariant.text:
        return ButtonColors(
          background: backgroundColor ?? Colors.transparent,
          foreground: foregroundColor ?? colorScheme.primary,
          border: borderColor ?? Colors.transparent,
        );
      case ButtonVariant.danger:
        return ButtonColors(
          background: backgroundColor ?? colorScheme.error,
          foreground: foregroundColor ?? colorScheme.onError,
          border: borderColor ?? colorScheme.error,
        );
    }
  }

  ButtonStyle _getButtonStyle(ThemeData theme, ButtonColors colors, bool isEnabled) {
    return ButtonStyle(
      backgroundColor: MaterialStateProperty.resolveWith((states) {
        if (states.contains(MaterialState.disabled)) {
          return theme.colorScheme.onSurface.withOpacity(0.12);
        }
        if (states.contains(MaterialState.pressed)) {
          return colors.background.withOpacity(0.8);
        }
        if (states.contains(MaterialState.hovered)) {
          return colors.background.withOpacity(0.9);
        }
        return colors.background;
      }),
      foregroundColor: MaterialStateProperty.resolveWith((states) {
        if (states.contains(MaterialState.disabled)) {
          return theme.colorScheme.onSurface.withOpacity(0.38);
        }
        return colors.foreground;
      }),
      side: variant == ButtonVariant.outline
          ? MaterialStateProperty.resolveWith((states) {
              if (states.contains(MaterialState.disabled)) {
                return BorderSide(
                  color: theme.colorScheme.onSurface.withOpacity(0.12),
                  width: 1,
                );
              }
              return BorderSide(
                color: colors.border,
                width: 1,
              );
            })
          : null,
      elevation: MaterialStateProperty.resolveWith((states) {
        if (variant == ButtonVariant.text || variant == ButtonVariant.outline) {
          return 0;
        }
        if (states.contains(MaterialState.disabled)) {
          return 0;
        }
        if (states.contains(MaterialState.pressed)) {
          return (elevation ?? 2) + 2;
        }
        if (states.contains(MaterialState.hovered)) {
          return (elevation ?? 2) + 1;
        }
        return elevation ?? 2;
      }),
      shape: MaterialStateProperty.all(
        RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(borderRadius ?? 8),
        ),
      ),
      padding: MaterialStateProperty.all(padding ?? size.padding),
      minimumSize: MaterialStateProperty.all(
        Size(0, size.height),
      ),
      textStyle: MaterialStateProperty.all(
        textStyle ??
            theme.textTheme.labelLarge?.copyWith(
              fontSize: size.fontSize,
              fontWeight: FontWeight.w600,
            ),
      ),
    );
  }

  Widget _buildButtonContent(ThemeData theme) {
    if (icon == null) {
      return Text(text);
    }

    final iconWidget = Icon(
      icon,
      size: size.fontSize + 2,
    );

    final textWidget = Text(text);

    if (iconAtEnd) {
      return Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          textWidget,
          const SizedBox(width: 8),
          iconWidget,
        ],
      );
    }

    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        iconWidget,
        const SizedBox(width: 8),
        textWidget,
      ],
    );
  }

  Widget _buildLoadingContent(ThemeData theme, ButtonColors colors) {
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        SizedBox(
          width: size.fontSize,
          height: size.fontSize,
          child: CircularProgressIndicator(
            strokeWidth: 2,
            valueColor: AlwaysStoppedAnimation<Color>(colors.foreground),
          ),
        ),
        const SizedBox(width: 8),
        Text(text),
      ],
    );
  }
}

/// Helper class to hold button colors
class ButtonColors {
  final Color background;
  final Color foreground;
  final Color border;

  const ButtonColors({
    required this.background,
    required this.foreground,
    required this.border,
  });
}

/// Icon button with consistent styling
class CustomIconButton extends StatelessWidget {
  final IconData icon;
  final VoidCallback? onPressed;
  final ButtonVariant variant;
  final ButtonSize size;
  final String? tooltip;
  final Color? backgroundColor;
  final Color? foregroundColor;
  final double? borderRadius;
  final EdgeInsetsGeometry? padding;

  const CustomIconButton({
    super.key,
    required this.icon,
    this.onPressed,
    this.variant = ButtonVariant.primary,
    this.size = ButtonSize.medium,
    this.tooltip,
    this.backgroundColor,
    this.foregroundColor,
    this.borderRadius,
    this.padding,
  });

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final colorScheme = theme.colorScheme;
    final isEnabled = onPressed != null;

    Color getBackgroundColor() {
      if (backgroundColor != null) return backgroundColor!;
      
      switch (variant) {
        case ButtonVariant.primary:
          return colorScheme.primary;
        case ButtonVariant.secondary:
          return colorScheme.secondary;
        case ButtonVariant.outline:
        case ButtonVariant.text:
          return Colors.transparent;
        case ButtonVariant.danger:
          return colorScheme.error;
      }
    }

    Color getForegroundColor() {
      if (foregroundColor != null) return foregroundColor!;
      
      switch (variant) {
        case ButtonVariant.primary:
          return colorScheme.onPrimary;
        case ButtonVariant.secondary:
          return colorScheme.onSecondary;
        case ButtonVariant.outline:
        case ButtonVariant.text:
          return colorScheme.primary;
        case ButtonVariant.danger:
          return colorScheme.onError;
      }
    }

    Widget button = IconButton(
      onPressed: isEnabled ? onPressed : null,
      icon: Icon(
        icon,
        size: size.fontSize + 4,
      ),
      style: IconButton.styleFrom(
        backgroundColor: getBackgroundColor(),
        foregroundColor: getForegroundColor(),
        disabledBackgroundColor: colorScheme.onSurface.withOpacity(0.12),
        disabledForegroundColor: colorScheme.onSurface.withOpacity(0.38),
        padding: padding ?? size.padding,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(borderRadius ?? 8),
          side: variant == ButtonVariant.outline
              ? BorderSide(
                  color: isEnabled
                      ? colorScheme.outline
                      : colorScheme.onSurface.withOpacity(0.12),
                  width: 1,
                )
              : BorderSide.none,
        ),
      ),
    );

    if (tooltip != null) {
      return Tooltip(
        message: tooltip!,
        child: button,
      );
    }

    return button;
  }
}