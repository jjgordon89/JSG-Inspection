import 'dart:io';
import 'package:flutter/material.dart';
import 'package:flutter_hooks/flutter_hooks.dart';
import 'package:image_picker/image_picker.dart';
import 'package:photo_view/photo_view.dart';
import 'package:photo_view/photo_view_gallery.dart';
import '../utils/image_utils.dart';

class PhotoCaptureWidget extends HookWidget {
  final List<String> photos;
  final int maxPhotos;
  final Function(String) onPhotoAdded;
  final Function(String) onPhotoRemoved;
  final bool isReadOnly;

  const PhotoCaptureWidget({
    super.key,
    required this.photos,
    required this.onPhotoAdded,
    required this.onPhotoRemoved,
    this.maxPhotos = 5,
    this.isReadOnly = false,
  });

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final imagePicker = useMemoized(() => ImagePicker());

    Future<void> _showImageSourceDialog() async {
      await showModalBottomSheet(
        context: context,
        builder: (context) => SafeArea(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              ListTile(
                leading: const Icon(Icons.camera_alt),
                title: const Text('Take Photo'),
                onTap: () {
                  Navigator.pop(context);
                  _capturePhoto(ImageSource.camera);
                },
              ),
              ListTile(
                leading: const Icon(Icons.photo_library),
                title: const Text('Choose from Gallery'),
                onTap: () {
                  Navigator.pop(context);
                  _capturePhoto(ImageSource.gallery);
                },
              ),
              ListTile(
                leading: const Icon(Icons.cancel),
                title: const Text('Cancel'),
                onTap: () => Navigator.pop(context),
              ),
            ],
          ),
        ),
      );
    }

    Future<void> _capturePhoto(ImageSource source) async {
      try {
        final XFile? image = await imagePicker.pickImage(
          source: source,
          maxWidth: 1920,
          maxHeight: 1080,
          imageQuality: 85,
        );

        if (image != null) {
          // Process and save the image
          final processedPath = await ImageUtils.processAndSaveImage(image.path);
          onPhotoAdded(processedPath);
        }
      } catch (e) {
        if (context.mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: Text('Failed to capture photo: $e'),
              backgroundColor: theme.colorScheme.error,
            ),
          );
        }
      }
    }

    void _showPhotoViewer(int initialIndex) {
      Navigator.of(context).push(
        MaterialPageRoute(
          builder: (context) => PhotoViewerScreen(
            photos: photos,
            initialIndex: initialIndex,
            onPhotoDeleted: isReadOnly ? null : (index) {
              onPhotoRemoved(photos[index]);
              Navigator.pop(context);
            },
          ),
        ),
      );
    }

    void _confirmDeletePhoto(String photoPath) {
      showDialog(
        context: context,
        builder: (context) => AlertDialog(
          title: const Text('Delete Photo'),
          content: const Text('Are you sure you want to delete this photo?'),
          actions: [
            TextButton(
              onPressed: () => Navigator.pop(context),
              child: const Text('Cancel'),
            ),
            FilledButton(
              onPressed: () {
                Navigator.pop(context);
                onPhotoRemoved(photoPath);
              },
              style: FilledButton.styleFrom(
                backgroundColor: theme.colorScheme.error,
              ),
              child: const Text('Delete'),
            ),
          ],
        ),
      );
    }

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        if (photos.isNotEmpty) ..[
          SizedBox(
            height: 120,
            child: ListView.builder(
              scrollDirection: Axis.horizontal,
              itemCount: photos.length,
              itemBuilder: (context, index) {
                final photoPath = photos[index];
                
                return Container(
                  margin: const EdgeInsets.only(right: 12),
                  child: Stack(
                    children: [
                      GestureDetector(
                        onTap: () => _showPhotoViewer(index),
                        child: Container(
                          width: 120,
                          height: 120,
                          decoration: BoxDecoration(
                            borderRadius: BorderRadius.circular(8),
                            border: Border.all(
                              color: theme.colorScheme.outline.withOpacity(0.3),
                            ),
                          ),
                          child: ClipRRect(
                            borderRadius: BorderRadius.circular(8),
                            child: Image.file(
                              File(photoPath),
                              fit: BoxFit.cover,
                              errorBuilder: (context, error, stackTrace) {
                                return Container(
                                  color: theme.colorScheme.errorContainer,
                                  child: Icon(
                                    Icons.broken_image,
                                    color: theme.colorScheme.onErrorContainer,
                                  ),
                                );
                              },
                            ),
                          ),
                        ),
                      ),
                      if (!isReadOnly)
                        Positioned(
                          top: 4,
                          right: 4,
                          child: GestureDetector(
                            onTap: () => _confirmDeletePhoto(photoPath),
                            child: Container(
                              padding: const EdgeInsets.all(4),
                              decoration: BoxDecoration(
                                color: theme.colorScheme.error,
                                shape: BoxShape.circle,
                                boxShadow: [
                                  BoxShadow(
                                    color: Colors.black.withOpacity(0.3),
                                    blurRadius: 4,
                                    offset: const Offset(0, 2),
                                  ),
                                ],
                              ),
                              child: Icon(
                                Icons.close,
                                size: 16,
                                color: theme.colorScheme.onError,
                              ),
                            ),
                          ),
                        ),
                    ],
                  ),
                );
              },
            ),
          ),
          const SizedBox(height: 16),
        ],
        if (!isReadOnly && photos.length < maxPhotos)
          SizedBox(
            width: double.infinity,
            child: OutlinedButton.icon(
              onPressed: _showImageSourceDialog,
              icon: const Icon(Icons.add_a_photo),
              label: Text(
                photos.isEmpty 
                    ? 'Add Photos' 
                    : 'Add More Photos (${photos.length}/$maxPhotos)',
              ),
              style: OutlinedButton.styleFrom(
                padding: const EdgeInsets.symmetric(vertical: 16),
                side: BorderSide(
                  color: theme.colorScheme.primary.withOpacity(0.5),
                  style: BorderStyle.solid,
                  width: 2,
                ),
              ),
            ),
          ),
        if (photos.length >= maxPhotos)
          Container(
            width: double.infinity,
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: theme.colorScheme.surfaceVariant.withOpacity(0.5),
              borderRadius: BorderRadius.circular(8),
              border: Border.all(
                color: theme.colorScheme.outline.withOpacity(0.3),
              ),
            ),
            child: Row(
              children: [
                Icon(
                  Icons.info_outline,
                  size: 16,
                  color: theme.colorScheme.onSurfaceVariant,
                ),
                const SizedBox(width: 8),
                Text(
                  'Maximum $maxPhotos photos reached',
                  style: theme.textTheme.bodySmall?.copyWith(
                    color: theme.colorScheme.onSurfaceVariant,
                  ),
                ),
              ],
            ),
          ),
      ],
    );
  }
}

class PhotoViewerScreen extends StatelessWidget {
  final List<String> photos;
  final int initialIndex;
  final Function(int)? onPhotoDeleted;

  const PhotoViewerScreen({
    super.key,
    required this.photos,
    required this.initialIndex,
    this.onPhotoDeleted,
  });

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final pageController = PageController(initialPage: initialIndex);
    
    return Scaffold(
      backgroundColor: Colors.black,
      appBar: AppBar(
        backgroundColor: Colors.black,
        foregroundColor: Colors.white,
        title: Text('Photo ${initialIndex + 1} of ${photos.length}'),
        actions: [
          if (onPhotoDeleted != null)
            IconButton(
              onPressed: () {
                showDialog(
                  context: context,
                  builder: (context) => AlertDialog(
                    title: const Text('Delete Photo'),
                    content: const Text('Are you sure you want to delete this photo?'),
                    actions: [
                      TextButton(
                        onPressed: () => Navigator.pop(context),
                        child: const Text('Cancel'),
                      ),
                      FilledButton(
                        onPressed: () {
                          Navigator.pop(context);
                          onPhotoDeleted!(initialIndex);
                        },
                        style: FilledButton.styleFrom(
                          backgroundColor: theme.colorScheme.error,
                        ),
                        child: const Text('Delete'),
                      ),
                    ],
                  ),
                );
              },
              icon: const Icon(Icons.delete),
            ),
        ],
      ),
      body: PhotoViewGallery.builder(
        pageController: pageController,
        itemCount: photos.length,
        builder: (context, index) {
          return PhotoViewGalleryPageOptions(
            imageProvider: FileImage(File(photos[index])),
            minScale: PhotoViewComputedScale.contained,
            maxScale: PhotoViewComputedScale.covered * 3,
            heroAttributes: PhotoViewHeroAttributes(tag: photos[index]),
          );
        },
        scrollPhysics: const BouncingScrollPhysics(),
        backgroundDecoration: const BoxDecoration(
          color: Colors.black,
        ),
      ),
    );
  }
}