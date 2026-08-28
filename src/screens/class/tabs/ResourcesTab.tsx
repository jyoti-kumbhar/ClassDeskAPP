import React, { useState, useMemo } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Linking, Platform } from 'react-native';
import {
  Folder,
  Plus,
  Tag,
  ExternalLink,
  Trash2,
  Filter,
  Youtube,
  Globe,
  FileText,
  Paperclip,
} from 'lucide-react-native';
import { Resource, ResourceLink, ClassItem } from '../../../types';
import { fmtDate, uid } from '../../../services/dataStore';
import { lightColors, darkColors, radius, spacing, typography, shadows } from '../../../theme';
import { Card } from '../../../components/common/Card';
import { Button } from '../../../components/common/Button';
import { Modal } from '../../../components/common/Modal';
import { Field, Input, TextArea } from '../../../components/common/Input';
import { Stamp } from '../../../components/common/Stamp';
import { RowActions } from '../../../components/common/RowActions';
import { ScheduleField } from '../../../components/common/ScheduleField';
import { EmptyState } from '../../../components/common/EmptyState';
import { SearchBar } from '../../../components/common/SearchBar';
import { FileUploadButton, FileAttachmentItem } from '../../../components/common/FileUploadButton';

interface ResourcesTabProps {
  cls: ClassItem;
  resources: Resource[];
  resourceLabels: string[];
  isTeacher: boolean;
  userId: string;
  onAddResource: (res: Omit<Resource, 'id' | 'classId' | 'date'>) => void;
  onUpdateResource: (id: string, patch: Partial<Resource>) => void;
  onDeleteResource: (id: string) => void;
  onAddLabel: (label: string) => void;
  onRemoveLabel: (label: string) => void;
  isDark?: boolean;
}

export const ResourcesTab: React.FC<ResourcesTabProps> = ({
  cls,
  resources,
  resourceLabels,
  isTeacher,
  userId,
  onAddResource,
  onUpdateResource,
  onDeleteResource,
  onAddLabel,
  onRemoveLabel,
  isDark = false,
}) => {
  const colors = isDark ? darkColors : lightColors;
  const [selectedFilter, setSelectedFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showManageLabels, setShowManageLabels] = useState(false);
  const [editingResource, setEditingResource] = useState<Resource | null>(null);

  // Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [scheduledFor, setScheduledFor] = useState<string | null>(null);
  const [links, setLinks] = useState<ResourceLink[]>([]);
  const [newLabelInput, setNewLabelInput] = useState('');
  const [formError, setFormError] = useState('');

  const isFuture = (iso?: string | null) => {
    if (!iso) return false;
    return new Date(iso).getTime() > Date.now();
  };

  const openAdd = () => {
    setTitle('');
    setDescription('');
    setScheduledFor(null);
    setLinks([{ id: uid('l'), type: resourceLabels[0] || 'Notes', label: '', url: '' }]);
    setFormError('');
    setShowAddModal(true);
  };

  const openEdit = (res: Resource) => {
    setEditingResource(res);
    setTitle(res.title);
    setDescription(res.description || '');
    setScheduledFor(res.scheduledFor || null);
    setLinks(res.links.map((l) => ({ ...l })));
    setFormError('');
  };

  const handleAddLinkRow = () => {
    setLinks((prev) => [
      ...prev,
      { id: uid('l'), type: resourceLabels[0] || 'Notes', label: '', url: '' },
    ]);
  };

  const handleUpdateLink = (id: string, patch: Partial<ResourceLink>) => {
    setLinks((prev) => prev.map((l) => (l.id === id ? { ...l, ...patch } : l)));
  };

  const handleRemoveLink = (id: string) => {
    setLinks((prev) => prev.filter((l) => l.id !== id));
  };

  const handleSave = () => {
    if (!title.trim()) {
      setFormError('Please enter a title for the resource.');
      return;
    }
    const validLinks = links.filter((l) => l.label.trim() && l.url.trim());
    if (validLinks.length === 0) {
      setFormError('Please add at least one link or uploaded file with label and URL.');
      return;
    }
    setFormError('');

    if (editingResource) {
      onUpdateResource(editingResource.id, {
        title: title.trim(),
        description: description.trim() || undefined,
        links: validLinks,
        scheduledFor,
      });
      setEditingResource(null);
    } else {
      onAddResource({
        authorId: userId,
        title: title.trim(),
        description: description.trim() || undefined,
        links: validLinks,
        scheduledFor,
      });
      setShowAddModal(false);
    }
  };

  const handleAddCustomLabel = () => {
    if (!newLabelInput.trim()) return;
    onAddLabel(newLabelInput.trim());
    setNewLabelInput('');
  };

  const openUrl = (url: string) => {
    if (Platform.OS === 'web') {
      window.open(url, '_blank');
    } else {
      Linking.openURL(url).catch(() => {});
    }
  };

  // Filtered list by class, scheduled date, label, and search query
  const displayedResources = useMemo(() => {
    return resources
      .filter((r) => r.classId === cls.id)
      .filter((r) => isTeacher || !isFuture(r.scheduledFor))
      .filter((r) => {
        if (selectedFilter === 'All') return true;
        return r.links.some((l) => l.type === selectedFilter);
      })
      .filter((r) => {
        if (!searchQuery.trim()) return true;
        const q = searchQuery.toLowerCase().trim();
        const inLinks = r.links.some((l) => l.label.toLowerCase().includes(q));
        return (
          r.title.toLowerCase().includes(q) ||
          (r.description && r.description.toLowerCase().includes(q)) ||
          inLinks
        );
      })
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [resources, cls.id, isTeacher, selectedFilter, searchQuery]);

  return (
    <View style={{ gap: spacing.md }}>
      {/* Search Bar & Action Buttons */}
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: spacing.sm,
        }}
      >
        <View style={{ flex: 1, minWidth: 200 }}>
          <SearchBar
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search resources by title or material..."
            isDark={isDark}
          />
        </View>

        {isTeacher && (
          <View style={{ flexDirection: 'row', gap: spacing.sm }}>
            <Button
              variant="ghost"
              size="sm"
              icon={Tag}
              onPress={() => setShowManageLabels(true)}
              isDark={isDark}
            >
              Labels
            </Button>
            <Button
              variant="primary"
              size="sm"
              icon={Plus}
              onPress={openAdd}
              isDark={isDark}
            >
              Add Resource
            </Button>
          </View>
        )}
      </View>

      {/* Label Filter Pills */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ flexDirection: 'row' }}>
        <View style={{ flexDirection: 'row', gap: 6 }}>
          <TouchableOpacity
            onPress={() => setSelectedFilter('All')}
            style={{
              paddingVertical: 6,
              paddingHorizontal: 12,
              borderRadius: radius.md,
              backgroundColor: selectedFilter === 'All' ? colors.brandTint : colors.surface2,
              borderWidth: 1,
              borderColor: selectedFilter === 'All' ? colors.brand : colors.border,
            }}
          >
            <Text
              style={{
                fontSize: 12.5,
                fontWeight: selectedFilter === 'All' ? '700' : '500',
                color: selectedFilter === 'All' ? colors.brandDark : colors.ink,
              }}
            >
              All
            </Text>
          </TouchableOpacity>

          {resourceLabels.map((lbl) => {
            const isSelected = selectedFilter === lbl;
            return (
              <TouchableOpacity
                key={lbl}
                onPress={() => setSelectedFilter(lbl)}
                style={{
                  paddingVertical: 6,
                  paddingHorizontal: 12,
                  borderRadius: radius.md,
                  backgroundColor: isSelected ? colors.brandTint : colors.surface2,
                  borderWidth: 1,
                  borderColor: isSelected ? colors.brand : colors.border,
                }}
              >
                <Text
                  style={{
                    fontSize: 12.5,
                    fontWeight: isSelected ? '700' : '500',
                    color: isSelected ? colors.brandDark : colors.ink,
                  }}
                >
                  {lbl}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>

      {/* Resources List */}
      {displayedResources.length === 0 ? (
        <EmptyState
          icon={Folder}
          title={searchQuery || selectedFilter !== 'All' ? 'No matching resources' : 'No resources found'}
          hint={
            searchQuery || selectedFilter !== 'All'
              ? 'Try changing your search term or selecting a different category label.'
              : isTeacher
              ? 'Upload notes, PDFs, Drive links, or YouTube videos for your class.'
              : 'No study materials have been shared in this category yet.'
          }
          actionLabel={searchQuery || selectedFilter !== 'All' ? 'Reset Filter' : isTeacher ? 'Add a Resource' : undefined}
          onAction={
            searchQuery || selectedFilter !== 'All'
              ? () => {
                  setSearchQuery('');
                  setSelectedFilter('All');
                }
              : isTeacher
              ? openAdd
              : undefined
          }
          isDark={isDark}
        />
      ) : (
        displayedResources.map((res) => (
          <Card key={res.id} isDark={isDark}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <View style={{ flex: 1, paddingRight: spacing.sm }}>
                <Text style={{ fontSize: 16, fontWeight: '700', color: colors.ink }}>
                  {res.title}
                </Text>
                <Text style={{ fontSize: 12, color: colors.inkSoft, marginTop: 2 }}>
                  Shared on {fmtDate(res.date)}
                </Text>
              </View>

              <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.xs }}>
                {isFuture(res.scheduledFor) && (
                  <Stamp tone="amber" isDark={isDark}>
                    Scheduled
                  </Stamp>
                )}
                {isTeacher && (
                  <RowActions
                    onEdit={() => openEdit(res)}
                    onDelete={() => onDeleteResource(res.id)}
                    isDark={isDark}
                  />
                )}
              </View>
            </View>

            {res.description ? (
              <Text style={{ fontSize: 13.5, color: colors.inkSoft, marginTop: spacing.xs, lineHeight: 19 }}>
                {res.description}
              </Text>
            ) : null}

            {/* Link Chips & Attachments */}
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginTop: spacing.md }}>
              {res.links.map((link) => (
                <TouchableOpacity
                  key={link.id}
                  activeOpacity={0.8}
                  onPress={() => openUrl(link.url)}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 6,
                    backgroundColor: colors.surface2,
                    borderWidth: 1,
                    borderColor: colors.border,
                    borderRadius: radius.md,
                    paddingVertical: 6,
                    paddingHorizontal: 12,
                  }}
                >
                  <Tag size={13} color={colors.brand} />
                  <Text style={{ fontSize: 12.5, fontWeight: '600', color: colors.ink }}>
                    {link.label}
                  </Text>
                  <ExternalLink size={12} color={colors.inkSoft} />
                </TouchableOpacity>
              ))}
            </View>
          </Card>
        ))
      )}

      {/* Add / Edit Resource Modal */}
      {(showAddModal || editingResource) && (
        <Modal
          title={editingResource ? 'Edit Resource' : 'Share Study Resource'}
          onClose={() => {
            setShowAddModal(false);
            setEditingResource(null);
          }}
          wide
          isDark={isDark}
        >
          <Field
            label="Resource Title"
            error={formError && !title.trim() ? formError : undefined}
            isDark={isDark}
          >
            <Input
              value={title}
              onChangeText={(txt) => {
                setTitle(txt);
                if (formError) setFormError('');
              }}
              placeholder="e.g. Chapter 9 Practical Notes & Diagrams"
              isDark={isDark}
            />
          </Field>

          <Field label="Description (Optional)" isDark={isDark}>
            <TextArea
              value={description}
              onChangeText={setDescription}
              placeholder="Provide a summary or study instructions..."
              isDark={isDark}
            />
          </Field>

          {/* Links & Attachments Builder */}
          <View style={{ marginBottom: spacing.md }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.xs }}>
              <Text style={{ fontSize: 12, fontWeight: '700', color: colors.inkSoft, textTransform: 'uppercase' }}>
                Resource Links & Uploads
              </Text>
              <FileUploadButton
                userId={userId}
                classId={cls.id}
                buttonText="Upload File"
                onUploadSuccess={(meta) => {
                  setLinks((prev) => [
                    ...prev,
                    {
                      id: uid('l'),
                      type: 'PDF',
                      label: meta.fileName,
                      url: meta.url || meta.storagePath,
                    },
                  ]);
                }}
                isDark={isDark}
              />
            </View>

            <View style={{ gap: spacing.sm }}>
              {links.map((link) => (
                <View
                  key={link.id}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: spacing.xs,
                    backgroundColor: colors.surface2,
                    borderRadius: radius.md,
                    padding: spacing.xs,
                  }}
                >
                  <View style={{ flex: 1 }}>
                    <Input
                      value={link.label}
                      onChangeText={(val) => handleUpdateLink(link.id, { label: val })}
                      placeholder="Label (e.g. Notes PDF)"
                      isDark={isDark}
                    />
                  </View>
                  <View style={{ flex: 1.5 }}>
                    <Input
                      value={link.url}
                      onChangeText={(val) => handleUpdateLink(link.id, { url: val })}
                      placeholder="https://..."
                      autoCapitalize="none"
                      isDark={isDark}
                    />
                  </View>
                  <TouchableOpacity
                    onPress={() => handleRemoveLink(link.id)}
                    style={{ padding: 6 }}
                  >
                    <Trash2 size={16} color={colors.danger} />
                  </TouchableOpacity>
                </View>
              ))}
            </View>

            <Button
              variant="ghost"
              size="sm"
              icon={Plus}
              onPress={handleAddLinkRow}
              isDark={isDark}
              style={{ marginTop: spacing.sm, alignSelf: 'flex-start' }}
            >
              Add another link
            </Button>
          </View>

          <ScheduleField
            scheduledFor={scheduledFor}
            setScheduledFor={setScheduledFor}
            isDark={isDark}
          />

          <Button
            variant="primary"
            size="lg"
            fullWidth
            disabled={!title.trim() || links.every((l) => !l.label.trim() || !l.url.trim())}
            onPress={handleSave}
            isDark={isDark}
            style={{ marginTop: spacing.sm }}
          >
            {editingResource ? 'Save Changes' : 'Share with Class'}
          </Button>
        </Modal>
      )}

      {/* Manage Labels Modal */}
      {showManageLabels && (
        <Modal
          title="Manage Resource Labels"
          onClose={() => setShowManageLabels(false)}
          isDark={isDark}
        >
          <View style={{ gap: spacing.sm, marginBottom: spacing.lg }}>
            {resourceLabels.map((lbl) => (
              <View
                key={lbl}
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  paddingVertical: 8,
                  paddingHorizontal: spacing.md,
                  backgroundColor: colors.surface2,
                  borderRadius: radius.md,
                }}
              >
                <Text style={{ fontSize: 14, fontWeight: '600', color: colors.ink }}>
                  {lbl}
                </Text>
                <TouchableOpacity onPress={() => onRemoveLabel(lbl)}>
                  <Trash2 size={15} color={colors.danger} />
                </TouchableOpacity>
              </View>
            ))}
          </View>

          <View style={{ flexDirection: 'row', gap: spacing.sm }}>
            <View style={{ flex: 1 }}>
              <Input
                value={newLabelInput}
                onChangeText={setNewLabelInput}
                placeholder="New label name"
                isDark={isDark}
              />
            </View>
            <Button
              variant="primary"
              size="md"
              icon={Plus}
              disabled={!newLabelInput.trim()}
              onPress={handleAddCustomLabel}
              isDark={isDark}
            >
              Add
            </Button>
          </View>
        </Modal>
      )}
    </View>
  );
};
