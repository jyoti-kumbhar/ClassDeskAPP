import React, { useState, useMemo } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { Bell, Plus, CalendarClock } from 'lucide-react-native';
import { Notice, ClassItem } from '../../../types';
import { fmtDateTime, uid } from '../../../services/dataStore';
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

interface NoticesTabProps {
  cls: ClassItem;
  notices: Notice[];
  isTeacher: boolean;
  userId: string;
  onAddNotice: (notice: Omit<Notice, 'id' | 'classId' | 'date'>) => void;
  onUpdateNotice: (id: string, patch: Partial<Notice>) => void;
  onDeleteNotice: (id: string) => void;
  isDark?: boolean;
}

export const NoticesTab: React.FC<NoticesTabProps> = ({
  cls,
  notices,
  isTeacher,
  userId,
  onAddNotice,
  onUpdateNotice,
  onDeleteNotice,
  isDark = false,
}) => {
  const colors = isDark ? darkColors : lightColors;
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingNotice, setEditingNotice] = useState<Notice | null>(null);

  // Form State
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [scheduledFor, setScheduledFor] = useState<string | null>(null);
  const [formError, setFormError] = useState('');

  const openAdd = () => {
    setTitle('');
    setBody('');
    setScheduledFor(null);
    setFormError('');
    setShowAddModal(true);
  };

  const openEdit = (notice: Notice) => {
    setEditingNotice(notice);
    setTitle(notice.title);
    setBody(notice.body);
    setScheduledFor(notice.scheduledFor || null);
    setFormError('');
  };

  const handleSave = () => {
    if (!title.trim()) {
      setFormError('Please enter a notice title.');
      return;
    }
    if (!body.trim()) {
      setFormError('Please enter the announcement message.');
      return;
    }

    if (editingNotice) {
      onUpdateNotice(editingNotice.id, {
        title: title.trim(),
        body: body.trim(),
        scheduledFor,
      });
      setEditingNotice(null);
    } else {
      onAddNotice({
        authorId: userId,
        title: title.trim(),
        body: body.trim(),
        scheduledFor,
      });
      setShowAddModal(false);
    }
  };

  const isFuture = (iso?: string | null) => {
    if (!iso) return false;
    return new Date(iso).getTime() > Date.now();
  };

  // Filter notices for students and search query
  const displayedNotices = useMemo(() => {
    return notices
      .filter((n) => n.classId === cls.id)
      .filter((n) => isTeacher || !isFuture(n.scheduledFor))
      .filter((n) => {
        if (!searchQuery.trim()) return true;
        const q = searchQuery.toLowerCase().trim();
        return n.title.toLowerCase().includes(q) || n.body.toLowerCase().includes(q);
      })
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [notices, cls.id, isTeacher, searchQuery]);

  return (
    <View style={{ gap: spacing.md }}>
      {/* Search & Action Bar */}
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: spacing.sm,
          marginBottom: spacing.xs,
        }}
      >
        <View style={{ flex: 1, minWidth: 200 }}>
          <SearchBar
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search notices by keyword..."
            isDark={isDark}
          />
        </View>

        {isTeacher && (
          <Button
            variant="primary"
            size="md"
            icon={Plus}
            onPress={openAdd}
            isDark={isDark}
          >
            Post Notice
          </Button>
        )}
      </View>

      {displayedNotices.length === 0 ? (
        <EmptyState
          icon={Bell}
          title={searchQuery ? 'No matching notices' : 'No notices yet'}
          hint={
            searchQuery
              ? `No announcements found matching "${searchQuery}".`
              : isTeacher
              ? 'Post announcements to keep your class informed with updates & schedules.'
              : 'Your teacher has not posted any announcements yet.'
          }
          actionLabel={searchQuery ? 'Clear Search' : isTeacher ? 'Post a Notice' : undefined}
          onAction={searchQuery ? () => setSearchQuery('') : isTeacher ? openAdd : undefined}
          isDark={isDark}
        />
      ) : (
        displayedNotices.map((n) => {
          const scheduled = isFuture(n.scheduledFor);
          return (
            <Card key={n.id} isDark={isDark}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <View style={{ flex: 1, paddingRight: spacing.sm }}>
                  <Text style={{ fontSize: 15.5, fontWeight: '700', color: colors.ink }}>
                    {n.title}
                  </Text>
                  <Text style={{ fontSize: 12, color: colors.inkSoft, marginTop: 2 }}>
                    Posted on {fmtDateTime(n.date)}
                  </Text>
                </View>

                <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.xs }}>
                  {scheduled && (
                    <Stamp tone="amber" isDark={isDark}>
                      Scheduled: {fmtDateTime(n.scheduledFor!)}
                    </Stamp>
                  )}
                  {isTeacher && (
                    <RowActions
                      onEdit={() => openEdit(n)}
                      onDelete={() => onDeleteNotice(n.id)}
                      isDark={isDark}
                    />
                  )}
                </View>
              </View>

              <Text
                style={{
                  fontSize: 14,
                  color: colors.ink,
                  lineHeight: 20,
                  marginTop: spacing.sm,
                }}
              >
                {n.body}
              </Text>
            </Card>
          );
        })
      )}

      {/* Add / Edit Notice Modal */}
      {(showAddModal || editingNotice) && (
        <Modal
          title={editingNotice ? 'Edit Class Notice' : 'Post a New Notice'}
          onClose={() => {
            setShowAddModal(false);
            setEditingNotice(null);
          }}
          isDark={isDark}
        >
          <Field
            label="Title"
            error={formError && !title.trim() ? formError : undefined}
            isDark={isDark}
          >
            <Input
              value={title}
              onChangeText={(txt) => {
                setTitle(txt);
                if (formError) setFormError('');
              }}
              placeholder="e.g. Unit Test Postponed"
              isDark={isDark}
            />
          </Field>

          <Field
            label="Announcement Message"
            error={formError && title.trim() && !body.trim() ? formError : undefined}
            isDark={isDark}
          >
            <TextArea
              value={body}
              onChangeText={(txt) => {
                setBody(txt);
                if (formError) setFormError('');
              }}
              placeholder="Write your announcement details here..."
              isDark={isDark}
            />
          </Field>

          <ScheduleField
            scheduledFor={scheduledFor}
            setScheduledFor={setScheduledFor}
            isDark={isDark}
          />

          <Button
            variant="primary"
            size="lg"
            fullWidth
            disabled={!title.trim() || !body.trim()}
            onPress={handleSave}
            isDark={isDark}
            style={{ marginTop: spacing.sm }}
          >
            {editingNotice ? 'Save Changes' : 'Post to Class'}
          </Button>
        </Modal>
      )}
    </View>
  );
};
