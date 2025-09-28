import React, { useState, useRef, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TextInput, 
  TouchableOpacity, 
  SafeAreaView,
  Platform,
  StatusBar,
  Dimensions,
  Alert,
  ScrollView
} from 'react-native';
import { WebView } from 'react-native-webview';
import { 
  ArrowLeft, 
  ArrowRight, 
  RotateCw, 
  Home, 
  Search,
  Bookmark,
  Menu,
  X
} from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { useDatabase } from '@/hooks/useDatabase';
import { useSettings } from '@/hooks/useSettings';
import { useModuleFeedback } from '@/hooks/useModuleFeedback';

const { width, height } = Dimensions.get('window');

interface Tab {
  id: string;
  url: string;
  title: string;
}

export default function BrowserScreen() {
  const webViewRef = useRef<WebView>(null);
  const { addToHistory, addBookmark } = useDatabase();
  const { settings } = useSettings();
  const { logActivity, getModuleFeedback } = useModuleFeedback();
  
  const [currentUrl, setCurrentUrl] = useState(settings.homepage || 'https://www.google.com');
  const [urlInput, setUrlInput] = useState('');
  const [canGoBack, setCanGoBack] = useState(false);
  const [canGoForward, setCanGoForward] = useState(false);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [showNavMenu, setShowNavMenu] = useState(false);

  useEffect(() => {
    setUrlInput(currentUrl);
  }, [currentUrl]);

  const handleUrlSubmit = () => {
    let url = urlInput.trim();
    
    if (!url) return;
    
    // Add protocol if missing
    if (!url.match(/^https?:\/\//)) {
      // Check if it looks like a domain
      if (url.includes('.') && !url.includes(' ')) {
        url = 'https://' + url;
      } else {
        // Treat as search query
        url = `https://www.google.com/search?q=${encodeURIComponent(url)}`;
      }
    }
    
    setCurrentUrl(url);
    webViewRef.current?.injectJavaScript(`window.location.href = '${url}';`);
    
    // Log navigation activity
    logActivity('NAVIGATION', `User navigated to: ${url}`);
    
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  const handleNavigation = (action: 'back' | 'forward' | 'reload' | 'home') => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }

    switch (action) {
      case 'back':
        webViewRef.current?.goBack();
        break;
      case 'forward':
        webViewRef.current?.goForward();
        break;
      case 'reload':
        webViewRef.current?.reload();
        break;
      case 'home':
        const homeUrl = settings.homepage || 'https://www.google.com';
        setCurrentUrl(homeUrl);
        webViewRef.current?.injectJavaScript(`window.location.href = '${homeUrl}';`);
        break;
    }
  };

  const handleBookmark = async () => {
    try {
      const title = await webViewRef.current?.getTitle() || 'Untitled';
      await addBookmark(currentUrl, title);
      logActivity('BOOKMARK', `User bookmarked: ${currentUrl}`);
      
      if (Platform.OS !== 'web') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
      
      Alert.alert('Bookmarked', 'Page added to bookmarks successfully');
    } catch (error) {
      Alert.alert('Error', 'Failed to add bookmark');
    }
  };

  const onNavigationStateChange = (navState: any) => {
    setCanGoBack(navState.canGoBack);
    setCanGoForward(navState.canGoForward);
    setCurrentUrl(navState.url);
    setLoading(navState.loading);

    // Update tab title and add to history
    if (navState.title && !navState.loading) {
      addToHistory(navState.url, navState.title);
      logActivity('PAGE_LOAD', `Page loaded: ${navState.title}`);
    }
  };

  const toggleNavMenu = () => {
    setShowNavMenu(!showNavMenu);
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      
      {/* Compact Top Navigation */}
      <View style={styles.topNavContainer}>
        <TouchableOpacity
          style={styles.menuButton}
          onPress={toggleNavMenu}
        >
          {showNavMenu ? <X size={20} color="#007AFF" /> : <Menu size={20} color="#007AFF" />}
        </TouchableOpacity>
        
        <View style={styles.addressBar}>
          <Search size={16} color="#8E8E93" style={styles.searchIcon} />
          <TextInput
            style={styles.urlInput}
            value={urlInput}
            onChangeText={setUrlInput}
            onSubmitEditing={handleUrlSubmit}
            placeholder="Search or URL"
            placeholderTextColor="#8E8E93"
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="web-search"
            returnKeyType="go"
          />
        </View>
        
        <TouchableOpacity
          style={styles.bookmarkButton}
          onPress={handleBookmark}
        >
          <Bookmark size={18} color="#007AFF" />
        </TouchableOpacity>
      </View>

      {/* Collapsible Navigation Menu */}
      {showNavMenu && (
        <View style={styles.navMenu}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.navScrollView}>
            <TouchableOpacity
              style={[styles.navButton, !canGoBack && styles.disabledButton]}
              onPress={() => handleNavigation('back')}
              disabled={!canGoBack}
            >
              <ArrowLeft size={18} color={canGoBack ? '#007AFF' : '#C7C7CC'} />
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.navButton, !canGoForward && styles.disabledButton]}
              onPress={() => handleNavigation('forward')}
              disabled={!canGoForward}
            >
              <ArrowRight size={18} color={canGoForward ? '#007AFF' : '#C7C7CC'} />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.navButton}
              onPress={() => handleNavigation('reload')}
            >
              <RotateCw size={18} color="#007AFF" />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.navButton}
              onPress={() => handleNavigation('home')}
            >
              <Home size={18} color="#007AFF" />
            </TouchableOpacity>
          </ScrollView>
        </View>
      )}

      {/* Progress Bar */}
      {loading && (
        <View style={styles.progressContainer}>
          <View style={[styles.progressBar, { width: `${progress * 100}%` }]} />
        </View>
      )}

      {/* WebView */}
      <View style={styles.webViewContainer}>
        <WebView
          ref={webViewRef}
          source={{ uri: currentUrl }}
          onNavigationStateChange={onNavigationStateChange}
          onLoadProgress={({ nativeEvent }) => setProgress(nativeEvent.progress)}
          style={styles.webView}
          allowsBackForwardNavigationGestures={true}
          decelerationRate="normal"
          showsHorizontalScrollIndicator={false}
          showsVerticalScrollIndicator={true}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingTop: Platform.OS === 'ios' ? 92 : 48,
  },
  topNavContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E5E5EA',
  },
  menuButton: {
    padding: 8,
    marginRight: 8,
  },
  addressBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F2F2F7',
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 36,
  },
  bookmarkButton: {
    padding: 8,
    marginLeft: 8,
  },
  searchIcon: {
    marginRight: 8,
  },
  urlInput: {
    flex: 1,
    fontSize: 15,
    color: '#000',
    paddingVertical: 0,
  },
  navMenu: {
    backgroundColor: '#F8F9FA',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E5E5EA',
    paddingVertical: 8,
  },
  navScrollView: {
    paddingHorizontal: 16,
  },
  navButton: {
    padding: 10,
    marginRight: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 1,
    elevation: 1,
  },
  disabledButton: {
    opacity: 0.4,
  },
  progressContainer: {
    height: 2,
    backgroundColor: '#F2F2F7',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#007AFF',
  },
  webViewContainer: {
    flex: 1,
  },
  webView: {
    flex: 1,
  },
});