import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  TextInput,
  SectionList
} from 'react-native';
import { Clock, ExternalLink, Trash2, Search, X } from 'lucide-react-native';
import { useDatabase } from '@/hooks/useDatabase';
import * as WebBrowser from 'expo-web-browser';

interface HistoryItem {
  id: number;
  url: string;
  title: string;
  visited_at: string;
}

interface HistorySection {
  title: string;
  data: HistoryItem[];
}

export default function HistoryScreen() {
  const { getHistory, clearHistory, removeHistoryItem } = useDatabase();
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [sections, setSections] = useState<HistorySection[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadHistory();
  }, []);

  useEffect(() => {
    organizeHistory();
  }, [history, searchQuery]);

  const loadHistory = async () => {
    try {
      const data = await getHistory();
      setHistory(data);
    } catch (error) {
      console.error('Error loading history:', error);
    }
  };

  const organizeHistory = () => {
    let filteredHistory = history;
    
    if (searchQuery.trim()) {
      filteredHistory = history.filter(item =>
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.url.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);
    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);

    const todayItems: HistoryItem[] = [];
    const yesterdayItems: HistoryItem[] = [];
    const thisWeekItems: HistoryItem[] = [];
    const olderItems: HistoryItem[] = [];

    filteredHistory.forEach(item => {
      const visitDate = new Date(item.visited_at);
      
      if (visitDate >= today) {
        todayItems.push(item);
      } else if (visitDate >= yesterday) {
        yesterdayItems.push(item);
      } else if (visitDate >= weekAgo) {
        thisWeekItems.push(item);
      } else {
        olderItems.push(item);
      }
    });

    const newSections: HistorySection[] = [];
    
    if (todayItems.length > 0) {
      newSections.push({ title: 'Today', data: todayItems });
    }
    if (yesterdayItems.length > 0) {
      newSections.push({ title: 'Yesterday', data: yesterdayItems });
    }
    if (thisWeekItems.length > 0) {
      newSections.push({ title: 'This Week', data: thisWeekItems });
    }
    if (olderItems.length > 0) {
      newSections.push({ title: 'Older', data: olderItems });
    }

    setSections(newSections);
  };

  const handleOpenHistoryItem = async (url: string) => {
    try {
      await WebBrowser.openBrowserAsync(url);
    } catch (error) {
      Alert.alert('Error', 'Failed to open page');
    }
  };

  const handleDeleteHistoryItem = async (id: number, title: string) => {
    Alert.alert(
      'Delete History Item',
      `Are you sure you want to delete "${title}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await removeHistoryItem(id);
              loadHistory();
            } catch (error) {
              Alert.alert('Error', 'Failed to delete history item');
            }
          },
        },
      ]
    );
  };

  const handleClearAllHistory = () => {
    Alert.alert(
      'Clear All History',
      'Are you sure you want to clear all browsing history? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear All',
          style: 'destructive',
          onPress: async () => {
            try {
              await clearHistory();
              loadHistory();
            } catch (error) {
              Alert.alert('Error', 'Failed to clear history');
            }
          },
        },
      ]
    );
  };

  const formatUrl = (url: string) => {
    try {
      const urlObj = new URL(url);
      return urlObj.hostname.replace('www.', '');
    } catch {
      return url;
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const renderHistoryItem = ({ item }: { item: HistoryItem }) => (
    <TouchableOpacity
      style={styles.historyCard}
      onPress={() => handleOpenHistoryItem(item.url)}
    >
      <View style={styles.historyContent}>
        <View style={styles.iconContainer}>
          <Clock size={20} color="#007AFF" />
        </View>
        <View style={styles.textContainer}>
          <Text style={styles.historyTitle} numberOfLines={2}>
            {item.title || 'Untitled'}
          </Text>
          <Text style={styles.historyUrl} numberOfLines={1}>
            {formatUrl(item.url)}
          </Text>
          <Text style={styles.historyTime}>
            {formatTime(item.visited_at)}
          </Text>
        </View>
        <View style={styles.actionsContainer}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => handleOpenHistoryItem(item.url)}
          >
            <ExternalLink size={18} color="#007AFF" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => handleDeleteHistoryItem(item.id, item.title)}
          >
            <Trash2 size={18} color="#FF3B30" />
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderSectionHeader = ({ section }: { section: HistorySection }) => (
    <Text style={styles.sectionHeader}>{section.title}</Text>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Clock size={64} color="#C7C7CC" />
      <Text style={styles.emptyTitle}>No History Yet</Text>
      <Text style={styles.emptySubtitle}>
        Your browsing history will appear here as you visit pages
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <Text style={styles.headerTitle}>History</Text>
          {history.length > 0 && (
            <TouchableOpacity
              style={styles.clearButton}
              onPress={handleClearAllHistory}
            >
              <Text style={styles.clearButtonText}>Clear All</Text>
            </TouchableOpacity>
          )}
        </View>
        
        <View style={styles.searchContainer}>
          <Search size={16} color="#8E8E93" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search history..."
            placeholderTextColor="#8E8E93"
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoCapitalize="none"
            autoCorrect={false}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <X size={16} color="#8E8E93" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <SectionList
        sections={sections}
        renderItem={renderHistoryItem}
        renderSectionHeader={renderSectionHeader}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={[
          styles.listContainer,
          sections.length === 0 && styles.emptyListContainer
        ]}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={renderEmptyState}
        stickySectionHeadersEnabled={false}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  header: {
    backgroundColor: '#F2F2F7',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#000',
  },
  clearButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#FF3B30',
    borderRadius: 8,
  },
  clearButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 44,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#000',
    paddingVertical: 0,
  },
  listContainer: {
    padding: 16,
  },
  emptyListContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  sectionHeader: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
    marginTop: 16,
    marginBottom: 12,
    marginLeft: 4,
  },
  historyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  historyContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F0F9FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
  },
  historyTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginBottom: 4,
  },
  historyUrl: {
    fontSize: 14,
    color: '#007AFF',
    marginBottom: 2,
  },
  historyTime: {
    fontSize: 12,
    color: '#8E8E93',
  },
  actionsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButton: {
    padding: 8,
    marginLeft: 4,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 64,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#000',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#8E8E93',
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: 32,
  },
});