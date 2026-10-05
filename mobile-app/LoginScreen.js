import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';

// Adjust for your testing environment:
// - Android Emulator: 'http://10.0.2.2:5000'
// - iOS Simulator: 'http://localhost:5000'
// - Physical Phone: 'http://YOUR_LOCAL_WIFI_IP:5000'
const API_BASE_URL = 'http://10.0.2.2:5000';

const DEMO_MANAGERS = [
  { username: 'manager1', name: 'Saravanan', rig: 'Rig 1 (TN-28-AA-1001)' },
  { username: 'manager2', name: 'Murugan', rig: 'Rig 2 (TN-28-AA-1002)' },
  { username: 'manager3', name: 'Selvam', rig: 'Rig 3 (TN-28-AA-1003)' },
  { username: 'manager4', name: 'Ganesan', rig: 'Rig 4 (TN-28-AA-1004)' },
];

export default function LoginScreen({ onLoginSuccess }) {
  const [username, setUsername] = useState('manager1');
  const [password, setPassword] = useState('password123');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!username.trim() || !password) {
      Alert.alert('Required Fields', 'Please enter your manager username and password.');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({
          username: username.trim(),
          password,
          expected_role: 'MANAGER',
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        if (!data.vehicle_id) {
          Alert.alert(
            'Configuration Error',
            'No vehicle assigned to this manager account. Please contact Fleet Admin.'
          );
          return;
        }

        // Pass manager profile & assigned vehicle_id to dashboard
        onLoginSuccess({
          user: data.user,
          vehicle_id: data.vehicle_id,
          vehicle_number: data.vehicle_number,
          rig_name: data.rig_name,
          token: data.token,
        });
      } else {
        Alert.alert('Login Failed', data.message || 'Invalid username or password.');
      }
    } catch (err) {
      console.error('Login error:', err);
      Alert.alert(
        'Connection Error',
        `Unable to connect to backend at ${API_BASE_URL}.\nEnsure server is running and device is on same network.`
      );
    } finally {
      setLoading(false);
    }
  };

  const handleQuickSelect = (demoUsername) => {
    setUsername(demoUsername);
    setPassword('password123');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#090d16" />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.container}>
          {/* Brand Header */}
          <View style={styles.brandContainer}>
            <View style={styles.logoBadge}>
              <Text style={styles.logoIcon}>⛏️</Text>
            </View>
            <Text style={styles.title}>Rig Manager Login</Text>
            <Text style={styles.subtitle}>
              Borewell Daily Drilling Management App
            </Text>
            <View style={styles.roleTag}>
              <Text style={styles.roleTagText}>1 MANAGER = 1 ASSIGNED RIG</Text>
            </View>
          </View>

          {/* Login Card */}
          <View style={styles.card}>
            <Text style={styles.label}>Manager Username</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. manager1"
              placeholderTextColor="#64748b"
              autoCapitalize="none"
              value={username}
              onChangeText={setUsername}
            />

            <Text style={styles.label}>Password</Text>
            <TextInput
              style={styles.input}
              placeholder="••••••••••••"
              placeholderTextColor="#64748b"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
            />

            <TouchableOpacity
              style={[styles.loginBtn, loading && styles.loginBtnDisabled]}
              onPress={handleLogin}
              disabled={loading}
              activeOpacity={0.8}
            >
              {loading ? (
                <ActivityIndicator color="#ffffff" />
              ) : (
                <Text style={styles.loginBtnText}>Sign In & Open Rig Form</Text>
              )}
            </TouchableOpacity>
          </View>

          {/* Quick Select Chips for the 4 Managers */}
          <View style={styles.demoSection}>
            <Text style={styles.demoSectionTitle}>
              Select Demo Rig Manager (Password: password123):
            </Text>
            <View style={styles.demoGrid}>
              {DEMO_MANAGERS.map((mgr) => {
                const isSelected = username === mgr.username;
                return (
                  <TouchableOpacity
                    key={mgr.username}
                    style={[styles.demoChip, isSelected && styles.demoChipActive]}
                    onPress={() => handleQuickSelect(mgr.username)}
                    activeOpacity={0.7}
                  >
                    <Text
                      style={[
                        styles.demoChipUsername,
                        isSelected && styles.demoChipTextActive,
                      ]}
                    >
                      {mgr.name}
                    </Text>
                    <Text
                      style={[
                        styles.demoChipRig,
                        isSelected && styles.demoChipSubActive,
                      ]}
                      numberOfLines={1}
                    >
                      {mgr.rig}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#090d16',
  },
  container: {
    padding: 24,
    justifyContent: 'center',
    minHeight: '100%',
  },
  brandContainer: {
    alignItems: 'center',
    marginBottom: 28,
  },
  logoBadge: {
    width: 68,
    height: 68,
    borderRadius: 20,
    backgroundColor: '#1e293b',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#334155',
    marginBottom: 14,
    shadowColor: '#3b82f6',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 6,
  },
  logoIcon: {
    fontSize: 32,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: '#ffffff',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 13,
    color: '#94a3b8',
    marginTop: 4,
    textAlign: 'center',
  },
  roleTag: {
    marginTop: 10,
    backgroundColor: 'rgba(59, 130, 246, 0.15)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.3)',
  },
  roleTagText: {
    color: '#60a5fa',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  card: {
    backgroundColor: '#111827',
    borderRadius: 20,
    padding: 22,
    borderWidth: 1,
    borderColor: '#1f2937',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  label: {
    fontSize: 12,
    fontWeight: '700',
    color: '#94a3b8',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  input: {
    backgroundColor: '#090d16',
    borderWidth: 1,
    borderColor: '#374151',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: '#f8fafc',
    marginBottom: 16,
  },
  loginBtn: {
    backgroundColor: '#2563eb',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 4,
    shadowColor: '#2563eb',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  loginBtnDisabled: {
    opacity: 0.6,
  },
  loginBtnText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  demoSection: {
    marginTop: 28,
  },
  demoSectionTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748b',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 10,
    textAlign: 'center',
  },
  demoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  demoChip: {
    flexBasis: '48%',
    flexGrow: 1,
    backgroundColor: '#111827',
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#1f2937',
  },
  demoChipActive: {
    backgroundColor: 'rgba(37, 99, 235, 0.15)',
    borderColor: '#3b82f6',
  },
  demoChipUsername: {
    fontSize: 12,
    fontWeight: '700',
    color: '#cbd5e1',
  },
  demoChipRig: {
    fontSize: 10,
    color: '#64748b',
    marginTop: 2,
  },
  demoChipTextActive: {
    color: '#60a5fa',
    fontWeight: '800',
  },
  demoChipSubActive: {
    color: '#93c5fd',
  },
});
