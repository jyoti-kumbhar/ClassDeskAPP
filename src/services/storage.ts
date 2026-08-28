import { supabase, isLiveSupabaseConfigured } from '../config/supabase';
import { FileUploadMetadata } from '../types';
import * as DocumentPicker from 'expo-document-picker';
import { Platform, Linking } from 'react-native';

const BUCKET_NAME = 'classdesk-files';
export const MAX_FILE_SIZE_BYTES = 25 * 1024 * 1024; // 25 MB

export const ALLOWED_EXTENSIONS = [
  'pdf', 'doc', 'docx', 'ppt', 'pptx', 'xls', 'xlsx', 'txt', 'csv',
  'jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'zip', 'rar',
];

export interface PickedFile {
  name: string;
  size: number;
  uri: string;
  mimeType?: string;
  file?: File; // Available on Web
}

// 1. Pick a file using Expo Document Picker
export const pickDocument = async (): Promise<PickedFile | null> => {
  try {
    const result = await DocumentPicker.getDocumentAsync({
      type: '*/*',
      copyToCacheDirectory: true,
      multiple: false,
    });

    if (result.canceled || !result.assets || result.assets.length === 0) {
      return null;
    }

    const asset = result.assets[0];
    return {
      name: asset.name,
      size: asset.size || 0,
      uri: asset.uri,
      mimeType: asset.mimeType || 'application/octet-stream',
      file: (asset as any).file,
    };
  } catch (error) {
    console.error('Error picking document:', error);
    throw new Error('Failed to open file picker');
  }
};

// 2. Validate file size and extension
export const validateFile = (file: PickedFile): { valid: boolean; error?: string } => {
  if (file.size > MAX_FILE_SIZE_BYTES) {
    return { valid: false, error: 'File size exceeds 25 MB limit.' };
  }

  const parts = file.name.split('.');
  const ext = parts.length > 1 ? parts.pop()?.toLowerCase() : '';

  if (!ext || !ALLOWED_EXTENSIONS.includes(ext)) {
    return {
      valid: false,
      error: `File type .${ext} is not supported. Please upload a PDF, Document, Image, or Zip.`,
    };
  }

  return { valid: true };
};

// 3. Generate safe storage path with path traversal protection
export const generateSafeStoragePath = (
  userId: string,
  classId: string | null | undefined,
  fileName: string
): string => {
  // Strip any path traversal characters, directory separators, and control characters
  const baseName = fileName.split(/[\\/]/).pop() || 'file';
  const sanitized = baseName
    .replace(/\0/g, '')
    .replace(/^(\.\.)+/, '')
    .replace(/[^a-zA-Z0-9._-]/g, '_')
    .replace(/^\.+/, '');
  const cleanName = sanitized || 'file';
  const timestamp = Date.now();
  const randomSuffix = Math.random().toString(36).substring(2, 7);
  const cleanUserId = userId.replace(/[^a-zA-Z0-9_-]/g, '_');
  const cleanClassId = (classId || 'general').replace(/[^a-zA-Z0-9_-]/g, '_');
  return `${cleanUserId}/${cleanClassId}/${timestamp}_${randomSuffix}_${cleanName}`;
};

// 4. Safe URL opener that validates protocols (blocks javascript:, data:, file:)
export const safeOpenUrl = (rawUrl?: string): boolean => {
  if (!rawUrl) return false;
  let url = rawUrl.trim();
  if (!url) return false;

  // Prepend https:// if protocol is missing and it's a domain-style link
  if (!/^https?:\/\//i.test(url)) {
    if (/^[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}(\/.*)?$/i.test(url)) {
      url = `https://${url}`;
    } else {
      return false; // Reject unsafe protocols
    }
  }

  // Strictly verify protocol is http or https
  if (!/^https?:\/\//i.test(url)) {
    return false;
  }

  if (Platform.OS === 'web' && typeof window !== 'undefined') {
    const win = window.open(url, '_blank', 'noopener,noreferrer');
    if (win) win.opener = null;
  } else {
    Linking.openURL(url).catch(() => {});
  }
  return true;
};

// 4. Upload file to Supabase Storage and record metadata
export const uploadFileToStorage = async (
  file: PickedFile,
  userId: string,
  classId?: string | null
): Promise<FileUploadMetadata> => {
  // Validate
  const validation = validateFile(file);
  if (!validation.valid) {
    throw new Error(validation.error || 'Invalid file');
  }

  const storagePath = generateSafeStoragePath(userId, classId, file.name);

  // If live Supabase is configured, upload to Supabase Storage
  if (isLiveSupabaseConfigured()) {
    let fileBody: any;

    if (Platform.OS === 'web' && file.file) {
      fileBody = file.file;
    } else {
      const response = await fetch(file.uri);
      fileBody = await response.blob();
    }

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(storagePath, fileBody, {
        contentType: file.mimeType || 'application/octet-stream',
        upsert: false,
      });

    if (uploadError) {
      throw new Error(`Upload failed: ${uploadError.message}`);
    }

    // Get public / signed URL
    const { data: urlData } = supabase.storage
      .from(BUCKET_NAME)
      .getPublicUrl(storagePath);

    const publicUrl = urlData?.publicUrl || '';

    // Record metadata in database
    const metadata: FileUploadMetadata = {
      id: 'file_' + Math.random().toString(36).substring(2, 9),
      ownerId: userId,
      classId: classId || null,
      fileName: file.name,
      storagePath,
      fileType: file.mimeType || 'application/octet-stream',
      fileSize: file.size,
      url: publicUrl,
      createdAt: new Date().toISOString(),
    };

    try {
      await supabase.from('file_uploads').insert({
        owner_id: userId,
        class_id: classId || null,
        file_name: file.name,
        storage_path: storagePath,
        file_type: file.mimeType || 'application/octet-stream',
        file_size: file.size,
      });
    } catch (dbErr) {
      console.warn('Metadata recording in DB failed, returning in-memory:', dbErr);
    }

    return metadata;
  }

  // Fallback demo/offline upload simulation (returns valid metadata with URI)
  const simulatedMetadata: FileUploadMetadata = {
    id: 'file_' + Math.random().toString(36).substring(2, 9),
    ownerId: userId,
    classId: classId || null,
    fileName: file.name,
    storagePath,
    fileType: file.mimeType || 'application/octet-stream',
    fileSize: file.size,
    url: file.uri,
    createdAt: new Date().toISOString(),
  };

  return simulatedMetadata;
};

// 5. Delete file from storage and database
export const deleteFileFromStorage = async (storagePath: string): Promise<boolean> => {
  if (isLiveSupabaseConfigured()) {
    const { error } = await supabase.storage.from(BUCKET_NAME).remove([storagePath]);
    if (error) {
      console.error('Failed to delete file from storage:', error);
      return false;
    }
    await supabase.from('file_uploads').delete().match({ storage_path: storagePath });
    return true;
  }
  return true;
};
