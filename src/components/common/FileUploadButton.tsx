import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ViewStyle,
} from 'react-native';
import { UploadCloud, File, FileText, Image as ImageIcon, Trash2, ExternalLink } from 'lucide-react-native';
import { pickDocument, validateFile, uploadFileToStorage, safeOpenUrl } from '../../services/storage';
import { FileUploadMetadata } from '../../types';
import { lightColors, darkColors, radius, spacing } from '../../theme';
import { Button } from './Button';

interface FileUploadButtonProps {
  userId: string;
  classId?: string | null;
  onUploadSuccess: (metadata: FileUploadMetadata) => void;
  onUploadError?: (errorMsg: string) => void;
  buttonText?: string;
  isDark?: boolean;
  style?: ViewStyle;
}

export const FileUploadButton: React.FC<FileUploadButtonProps> = ({
  userId,
  classId,
  onUploadSuccess,
  onUploadError,
  buttonText = 'Upload File',
  isDark = false,
  style,
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const colors = isDark ? darkColors : lightColors;

  const handlePickAndUpload = async () => {
    try {
      const picked = await pickDocument();
      if (!picked) return;

      const validation = validateFile(picked);
      if (!validation.valid) {
        if (onUploadError) onUploadError(validation.error || 'Invalid file');
        return;
      }

      setIsUploading(true);
      const metadata = await uploadFileToStorage(picked, userId, classId);
      setIsUploading(false);
      onUploadSuccess(metadata);
    } catch (err: any) {
      setIsUploading(false);
      if (onUploadError) {
        onUploadError(err.message || 'File upload failed');
      }
    }
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      icon={UploadCloud}
      loading={isUploading}
      onPress={handlePickAndUpload}
      isDark={isDark}
      style={style}
    >
      {isUploading ? 'Uploading...' : buttonText}
    </Button>
  );
};

export interface FileAttachmentItemProps {
  fileName: string;
  fileSize?: number;
  url?: string;
  onDelete?: () => void;
  isDark?: boolean;
  style?: ViewStyle;
}

export const FileAttachmentItem: React.FC<FileAttachmentItemProps> = ({
  fileName,
  fileSize,
  url,
  onDelete,
  isDark = false,
  style,
}) => {
  const colors = isDark ? darkColors : lightColors;

  const formatBytes = (bytes?: number) => {
    if (!bytes || bytes === 0) return '';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const getFileIcon = () => {
    const ext = fileName.split('.').pop()?.toLowerCase();
    if (ext === 'pdf') return FileText;
    if (['jpg', 'jpeg', 'png', 'webp', 'gif'].includes(ext || '')) return ImageIcon;
    return File;
  };

  const FileIcon = getFileIcon();

  const handleOpen = () => {
    safeOpenUrl(url);
  };

  return (
    <View
      style={[
        {
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          backgroundColor: colors.surface,
          borderWidth: 1,
          borderColor: colors.border,
          borderRadius: radius.md,
          paddingVertical: 8,
          paddingHorizontal: spacing.md,
          gap: spacing.sm,
        },
        style,
      ]}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm, flex: 1 }}>
        <FileIcon size={20} color={colors.brand} />
        <View style={{ flex: 1 }}>
          <Text
            numberOfLines={1}
            style={{ fontSize: 13.5, fontWeight: '600', color: colors.ink }}
          >
            {fileName}
          </Text>
          {fileSize ? (
            <Text style={{ fontSize: 11.5, color: colors.inkSoft }}>
              {formatBytes(fileSize)}
            </Text>
          ) : null}
        </View>
      </View>

      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
        {url && (
          <TouchableOpacity
            onPress={handleOpen}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            style={{
              padding: 7,
              borderRadius: radius.md,
              backgroundColor: colors.surface2,
            }}
          >
            <ExternalLink size={16} color={colors.ink} />
          </TouchableOpacity>
        )}
        {onDelete && (
          <TouchableOpacity
            onPress={onDelete}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            style={{
              padding: 7,
              borderRadius: radius.md,
              backgroundColor: colors.dangerTint,
            }}
          >
            <Trash2 size={16} color={colors.danger} />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};
