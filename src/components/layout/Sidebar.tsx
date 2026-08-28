import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Modal,
  TouchableWithoutFeedback,
} from 'react-native';
import {
  Home,
  BookOpen,
  Users,
  GraduationCap,
  FileText,
  UserCog,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Bell,
  Folder,
  ClipboardCheck,
  CalendarCheck,
  Brain,
  X,
} from 'lucide-react-native';
import { UserRole, ScreenName, ClassTabKey, ClassItem } from '../../types';
import { lightColors, darkColors, radius, spacing, shadows } from '../../theme';
import { BrandLogo } from '../common/BrandLogo';

interface SidebarProps {
  role: UserRole;
  screen: ScreenName;
  setScreen: (s: ScreenName) => void;
  activeClass: ClassItem | null;
  classTab: ClassTabKey;
  setClassTab: (t: ClassTabKey) => void;
  onBackToClasses: () => void;
  instituteName: string;
  isDark?: boolean;
  onToggleTheme?: () => void;
  onLogout: () => void;
  collapsed?: boolean;
  setCollapsed?: (c: boolean) => void;
  isMobile?: boolean;
  mobileOpen?: boolean;
  onCloseMobile?: () => void;
}

export const CLASS_TABS: { key: ClassTabKey; label: string; icon: any }[] = [
  { key: 'notices', label: 'Notices', icon: Bell },
  { key: 'resources', label: 'Resources', icon: Folder },
  { key: 'assignments', label: 'Assignments', icon: FileText },
  { key: 'attendance', label: 'Attendance', icon: CalendarCheck },
  { key: 'exams', label: 'Exams & Quizzes', icon: Brain },
  { key: 'members', label: 'Members', icon: Users },
];

export const Sidebar: React.FC<SidebarProps> = ({
  role,
  screen,
  setScreen,
  activeClass,
  classTab,
  setClassTab,
  onBackToClasses,
  instituteName,
  isDark = false,
  onLogout,
  collapsed = false,
  setCollapsed,
  isMobile = false,
  mobileOpen = false,
  onCloseMobile,
}) => {
  const colors = isDark ? darkColors : lightColors;

  const adminNavItems: { key: ScreenName; label: string; icon: any }[] = [
    { key: 'dashboard', label: 'Dashboard', icon: Home },
    { key: 'classes', label: 'Classes', icon: BookOpen },
    { key: 'teachers', label: 'Teachers', icon: GraduationCap },
    { key: 'students', label: 'Students', icon: Users },
    { key: 'reports', label: 'Reports', icon: ClipboardCheck },
    { key: 'profile', label: 'Profile', icon: UserCog },
  ];

  const standardNavItems: { key: ScreenName; label: string; icon: any }[] = [
    { key: 'classes', label: 'My Classes', icon: BookOpen },
    { key: 'profile', label: 'Profile', icon: UserCog },
  ];

  const navItems = role === 'admin' ? adminNavItems : standardNavItems;

  const handleSelectScreen = (key: ScreenName) => {
    setScreen(key);
    if (isMobile && onCloseMobile) onCloseMobile();
  };

  const handleSelectTab = (key: ClassTabKey) => {
    setClassTab(key);
    if (isMobile && onCloseMobile) onCloseMobile();
  };

  const handleBackToClasses = () => {
    onBackToClasses();
    if (isMobile && onCloseMobile) onCloseMobile();
  };

  const sidebarWidth = isMobile ? 280 : collapsed ? 76 : 250;

  const renderContent = () => (
    <View
      style={{
        width: sidebarWidth,
        minWidth: sidebarWidth,
        maxWidth: sidebarWidth,
        flexShrink: 0,
        backgroundColor: colors.surface,
        borderRightWidth: isMobile ? 0 : 1,
        borderRightColor: colors.border,
        flexDirection: 'column',
        paddingVertical: spacing.md,
        paddingHorizontal: isMobile ? spacing.md : collapsed ? spacing.xs : spacing.sm,
        justifyContent: 'space-between',
        height: '100%',
      }}
    >
      <View style={{ flex: 1 }}>
        {/* Brand Header */}
        <View
          style={{
            flexDirection: collapsed && !isMobile ? 'column' : 'row',
            alignItems: 'center',
            justifyContent: isMobile ? 'space-between' : collapsed ? 'center' : 'space-between',
            gap: collapsed && !isMobile ? spacing.sm : 0,
            marginBottom: spacing.lg,
            paddingHorizontal: collapsed ? 0 : spacing.xs,
          }}
        >
          {/* Logo with clean brand typography */}
          <BrandLogo
            size="md"
            showText={!collapsed || isMobile}
            showSubtitle={!collapsed || isMobile}
            instituteName={instituteName}
            isDark={isDark}
          />

          {/* Desktop Toggle Button */}
          {!isMobile && setCollapsed && (
            <TouchableOpacity
              onPress={() => setCollapsed(!collapsed)}
              style={{
                width: collapsed ? 36 : 30,
                height: collapsed ? 36 : 30,
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: radius.md,
                backgroundColor: colors.surface2,
              }}
              accessibilityLabel={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              {collapsed ? (
                <ChevronRight size={18} color={colors.inkSoft} />
              ) : (
                <ChevronLeft size={18} color={colors.inkSoft} />
              )}
            </TouchableOpacity>
          )}

          {/* Mobile Close Button */}
          {isMobile && onCloseMobile && (
            <TouchableOpacity
              onPress={onCloseMobile}
              style={{
                width: 34,
                height: 34,
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: radius.md,
                backgroundColor: colors.surface2,
              }}
            >
              <X size={20} color={colors.inkSoft} />
            </TouchableOpacity>
          )}
        </View>

        {/* Navigation List */}
        <ScrollView showsVerticalScrollIndicator={false}>
          {activeClass ? (
            /* Inside Class Detail View */
            <View style={{ gap: 4 }}>
              <TouchableOpacity
                onPress={handleBackToClasses}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: spacing.xs,
                  height: !isMobile && collapsed ? 46 : 38,
                  width: !isMobile && collapsed ? 46 : '100%',
                  alignSelf: !isMobile && collapsed ? 'center' : 'auto',
                  paddingHorizontal: !isMobile && collapsed ? 0 : 10,
                  borderRadius: radius.md,
                  backgroundColor: colors.surface2,
                  marginBottom: spacing.xs,
                  justifyContent: !isMobile && collapsed ? 'center' : 'flex-start',
                }}
              >
                <ChevronLeft size={20} color={colors.brand} />
                {(!collapsed || isMobile) && (
                  <Text style={{ fontSize: 13, fontWeight: '700', color: colors.brand }}>
                    All Classes
                  </Text>
                )}
              </TouchableOpacity>

              {(!collapsed || isMobile) && (
                <Text
                  numberOfLines={1}
                  style={{
                    fontSize: 11.5,
                    fontWeight: '700',
                    color: colors.inkSoft,
                    textTransform: 'uppercase',
                    letterSpacing: 0.5,
                    paddingHorizontal: 10,
                    paddingVertical: 4,
                  }}
                >
                  {activeClass.name}
                </Text>
              )}

              {CLASS_TABS.map((tab) => {
                const isActive = classTab === tab.key;
                const Icon = tab.icon;
                return (
                  <TouchableOpacity
                    key={tab.key}
                    activeOpacity={0.7}
                    onPress={() => handleSelectTab(tab.key)}
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      gap: spacing.md,
                      height: !isMobile && collapsed ? 46 : 42,
                      width: !isMobile && collapsed ? 46 : '100%',
                      alignSelf: !isMobile && collapsed ? 'center' : 'auto',
                      paddingHorizontal: !isMobile && collapsed ? 0 : 12,
                      justifyContent: !isMobile && collapsed ? 'center' : 'flex-start',
                      borderRadius: radius.lg,
                      backgroundColor: isActive ? colors.brandTint : 'transparent',
                    }}
                  >
                    <Icon
                      size={!isMobile && collapsed ? 22 : 21}
                      color={isActive ? colors.brandDark : colors.inkSoft}
                      strokeWidth={2.1}
                    />
                    {(!collapsed || isMobile) && (
                      <Text
                        style={{
                          fontSize: 14,
                          fontWeight: isActive ? '700' : '500',
                          color: isActive ? colors.brandDark : colors.inkSoft,
                        }}
                      >
                        {tab.label}
                      </Text>
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          ) : (
            /* Global Screen Nav Items */
            <View style={{ gap: 4 }}>
              {navItems.map((item) => {
                const isActive = screen === item.key;
                const Icon = item.icon;
                return (
                  <TouchableOpacity
                    key={item.key}
                    activeOpacity={0.7}
                    onPress={() => handleSelectScreen(item.key)}
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      gap: spacing.md,
                      height: !isMobile && collapsed ? 46 : 42,
                      width: !isMobile && collapsed ? 46 : '100%',
                      alignSelf: !isMobile && collapsed ? 'center' : 'auto',
                      paddingHorizontal: !isMobile && collapsed ? 0 : 12,
                      justifyContent: !isMobile && collapsed ? 'center' : 'flex-start',
                      borderRadius: radius.lg,
                      backgroundColor: isActive ? colors.brandTint : 'transparent',
                    }}
                  >
                    <Icon
                      size={!isMobile && collapsed ? 22 : 21}
                      color={isActive ? colors.brandDark : colors.inkSoft}
                      strokeWidth={2.1}
                    />
                    {(!collapsed || isMobile) && (
                      <Text
                        style={{
                          fontSize: 14.5,
                          fontWeight: isActive ? '700' : '500',
                          color: isActive ? colors.brandDark : colors.inkSoft,
                        }}
                      >
                        {item.label}
                      </Text>
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          )}
        </ScrollView>
      </View>

      {/* Sidebar Footer */}
      <View
        style={{
          borderTopWidth: 1,
          borderTopColor: colors.border,
          paddingTop: spacing.sm,
          gap: 4,
        }}
      >
        <TouchableOpacity
          onPress={() => {
            onLogout();
            if (isMobile && onCloseMobile) onCloseMobile();
          }}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: spacing.md,
            height: !isMobile && collapsed ? 46 : 42,
            width: !isMobile && collapsed ? 46 : '100%',
            alignSelf: !isMobile && collapsed ? 'center' : 'auto',
            paddingHorizontal: !isMobile && collapsed ? 0 : 12,
            justifyContent: !isMobile && collapsed ? 'center' : 'flex-start',
            borderRadius: radius.lg,
          }}
        >
          <LogOut size={20} color={colors.danger} strokeWidth={2.0} />
          {(!collapsed || isMobile) && (
            <Text style={{ fontSize: 14, fontWeight: '600', color: colors.danger }}>
              Log Out
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );

  if (isMobile) {
    return (
      <Modal
        visible={mobileOpen}
        transparent
        animationType="fade"
        onRequestClose={onCloseMobile}
      >
        <TouchableWithoutFeedback onPress={onCloseMobile}>
          <View
            style={{
              flex: 1,
              backgroundColor: 'rgba(15, 23, 42, 0.45)',
              flexDirection: 'row',
            }}
          >
            <TouchableWithoutFeedback onPress={(e) => e.stopPropagation()}>
              <View style={{ height: '100%', ...shadows.lg }}>
                {renderContent()}
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    );
  }

  return renderContent();
};
