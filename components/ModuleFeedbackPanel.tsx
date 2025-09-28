import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
} from 'react-native';
import { X, AlertCircle, CheckCircle, AlertTriangle, Info } from 'lucide-react-native';
import { useModuleFeedback } from '@/hooks/useModuleFeedback';

interface ModuleFeedbackPanelProps {
  visible: boolean;
  onClose: () => void;
}

export default function ModuleFeedbackPanel({ visible, onClose }: ModuleFeedbackPanelProps) {
  const { moduleFeedback, activityLog } = useModuleFeedback();
  const [activeTab, setActiveTab] = useState<'feedback' | 'activity'>('feedback');

  const getFeedbackIcon = (type: string) => {
    switch (type) {
      case 'SUCCESS':
        return <CheckCircle size={16} color="#34C759" />;
      case 'ERROR':
        return <AlertCircle size={16} color="#FF3B30" />;
      case 'WARNING':
        return <AlertTriangle size={16} color="#FF9500" />;
      case 'INFO':
      default:
        return <Info size={16} color="#007AFF" />;
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleString();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Module Feedback</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <X size={24} color="#007AFF" />
          </TouchableOpacity>
        </View>

        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'feedback' && styles.activeTab]}
            onPress={() => setActiveTab('feedback')}
          >
            <Text style={[styles.tabText, activeTab === 'feedback' && styles.activeTabText]}>
              Feedback ({moduleFeedback.length})
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'activity' && styles.activeTab]}
            onPress={() => setActiveTab('activity')}
          >
            <Text style={[styles.tabText, activeTab === 'activity' && styles.activeTabText]}>
              Activity ({activityLog.length})
            </Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {activeTab === 'feedback' ? (
            moduleFeedback.length > 0 ? (
              moduleFeedback.map((feedback, index) => (
                <View key={index} style={styles.feedbackItem}>
                  <View style={styles.feedbackHeader}>
                    {getFeedbackIcon(feedback.feedback_type)}
                    <Text style={styles.moduleName}>{feedback.module_name}</Text>
                    <Text style={styles.timestamp}>
                      {formatTimestamp(feedback.timestamp)}
                    </Text>
                  </View>
                  <Text style={styles.feedbackMessage}>{feedback.message}</Text>
                  {feedback.file_reference && (
                    <Text style={styles.fileReference}>
                      File: {feedback.file_reference}
                    </Text>
                  )}
                </View>
              ))
            ) : (
              <View style={styles.emptyState}>
                <Info size={48} color="#C7C7CC" />
                <Text style={styles.emptyTitle}>No Module Feedback</Text>
                <Text style={styles.emptySubtitle}>
                  Module feedback will appear here when available
                </Text>
              </View>
            )
          ) : (
            activityLog.length > 0 ? (
              activityLog.map((activity, index) => (
                <View key={activity.id} style={styles.activityItem}>
                  <View style={styles.activityHeader}>
                    <Text style={styles.activityType}>{activity.activity_type}</Text>
                    <Text style={styles.timestamp}>
                      {formatTimestamp(activity.timestamp)}
                    </Text>
                  </View>
                  <Text style={styles.activityContent}>{activity.content}</Text>
                  {activity.module && (
                    <Text style={styles.moduleTag}>Module: {activity.module}</Text>
                  )}
                </View>
              ))
            ) : (
              <View style={styles.emptyState}>
                <Info size={48} color="#C7C7CC" />
                <Text style={styles.emptyTitle}>No Activity Logged</Text>
                <Text style={styles.emptySubtitle}>
                  Activity logs will appear here as you use the app
                </Text>
              </View>
            )
          )}
        </ScrollView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E5E5EA',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#000',
  },
  closeButton: {
    padding: 4,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E5E5EA',
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#007AFF',
  },
  tabText: {
    fontSize: 16,
    color: '#8E8E93',
  },
  activeTabText: {
    color: '#007AFF',
    fontWeight: '600',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  feedbackItem: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  feedbackHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  moduleName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginLeft: 8,
    flex: 1,
  },
  timestamp: {
    fontSize: 12,
    color: '#8E8E93',
  },
  feedbackMessage: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
  },
  fileReference: {
    fontSize: 12,
    color: '#007AFF',
    marginTop: 4,
    fontStyle: 'italic',
  },
  activityItem: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  activityHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  activityType: {
    fontSize: 14,
    fontWeight: '600',
    color: '#007AFF',
  },
  activityContent: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
  },
  moduleTag: {
    fontSize: 12,
    color: '#8E8E93',
    marginTop: 4,
    fontStyle: 'italic',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 64,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#8E8E93',
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: 32,
  },
});