import React, { useState, useMemo, useEffect, useCallback } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  StatusBar,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';

const API_BASE_URL = 'http://10.0.2.2:5000';

export default function ManagerDashboard({
  user,
  vehicleId,
  vehicleNumber,
  rigName,
  onLogout,
}) {
  const today = new Date().toISOString().split('T')[0];

  // Initial Form state locked to vehicleId & manager_id
  const initialFormState = {
    vehicle_id: vehicleId,
    manager_id: user?.id,
    report_date: today,
    agent_name: '',
    party_no: '',
    party_name: '',
    village: '',
    bore_rate: '',
    depth: '',
    rod_count: '',
    ms_casing: '',
    pvc_casing: '',
    welding_details: '',
    recut: 'No',
    rebore: 'No',
    flushing: '',
    rpm_start: '',
    rpm_end: '',
    avg_rpm: '',
    bit_number: '',
    bit_size: '6.5 inch',
    hammer_type: 'DHD 360',
    driller_name: '',
    diesel_liters: '',
    cash_advance: '',
    remarks: '',
  };

  const [form, setForm] = useState(initialFormState);
  const [submitting, setSubmitting] = useState(false);
  const [recentLogs, setRecentLogs] = useState([]);
  const [loadingRecent, setLoadingRecent] = useState(false);

  // Field change handler
  const handleChange = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  // Fetch recent reports for this specific vehicle
  const fetchRecentReports = useCallback(async () => {
    setLoadingRecent(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/reports/${vehicleId}`);
      const data = await response.json();
      if (response.ok && data.success) {
        setRecentLogs(data.data?.slice(0, 3) || []);
      }
    } catch (err) {
      console.warn('Could not fetch recent logs for vehicle', err);
    } finally {
      setLoadingRecent(false);
    }
  }, [vehicleId]);

  useEffect(() => {
    fetchRecentReports();
  }, [fetchRecentReports]);

  // Real-time client-side calculation and validation
  const rpmCalculation = useMemo(() => {
    const start = parseFloat(form.rpm_start);
    const end = parseFloat(form.rpm_end);

    if (isNaN(start) || isNaN(end)) {
      return { total: 0, isValid: true, isCalculated: false, error: null };
    }

    if (end <= start) {
      return {
        total: 0,
        isValid: false,
        isCalculated: true,
        error: 'End RPM must be strictly greater than Start RPM',
      };
    }

    const total = parseFloat((end - start).toFixed(2));
    return { total, isValid: true, isCalculated: true, error: null };
  }, [form.rpm_start, form.rpm_end]);

  // Form submission handler
  const handleSubmit = async () => {
    if (!form.party_name.trim()) {
      Alert.alert('Required Field', 'Please enter Party / Customer Name.');
      return;
    }
    if (!form.village.trim()) {
      Alert.alert('Required Field', 'Please enter Village / Site Location.');
      return;
    }
    if (!form.depth || parseFloat(form.depth) <= 0) {
      Alert.alert('Required Field', 'Please enter a valid Total Depth (ft).');
      return;
    }
    if (!form.rpm_start || !form.rpm_end) {
      Alert.alert('Required Field', 'Both Start and End RPM meter readings are required.');
      return;
    }
    if (!rpmCalculation.isValid) {
      Alert.alert('RPM Error', rpmCalculation.error || 'End RPM must be greater than Start RPM');
      return;
    }

    setSubmitting(true);
    try {
      // Force locked vehicle_id and manager_id
      const payload = {
        ...form,
        vehicle_id: vehicleId,
        manager_id: user?.id,
      };

      const response = await fetch(`${API_BASE_URL}/api/reports`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        Alert.alert(
          'Report Submitted! ✅',
          `Daily log for ${form.party_name} recorded.\nVehicle: ${vehicleNumber}\nTotal RPM: ${data.metrics?.rpm_total || rpmCalculation.total} hrs`,
          [
            {
              text: 'OK',
              onPress: () => {
                setForm({
                  ...initialFormState,
                  vehicle_id: vehicleId,
                  manager_id: user?.id,
                  report_date: today,
                });
                fetchRecentReports();
              },
            },
          ]
        );
      } else {
        Alert.alert('Submission Error', data.message || 'Server error occurred.');
      }
    } catch (err) {
      console.error('Submission failed:', err);
      Alert.alert(
        'Network Error',
        `Unable to reach backend at ${API_BASE_URL}. Ensure server is running.`
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#090d16" />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView
          style={styles.container}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Header Bar */}
          <View style={styles.topBar}>
            <div>
              <Text style={styles.managerGreeting}>Logged in as Manager:</Text>
              <Text style={styles.managerName}>{user?.name || 'Field Manager'}</Text>
            </div>
            <TouchableOpacity onPress={onLogout} style={styles.logoutBtn}>
              <Text style={styles.logoutBtnText}>Logout</Text>
            </TouchableOpacity>
          </View>

          {/* LOCKED VEHICLE NUMBER PLATE BANNER */}
          <View style={styles.lockedPlateCard}>
            <View style={styles.plateHeader}>
              <Text style={styles.lockBadgeText}>🔒 ASSIGNED RIG (LOCKED)</Text>
              <Text style={styles.plateSubtext}>Reports will automatically attach to this vehicle</Text>
            </View>

            {/* Realistic Vehicle Plate */}
            <View style={styles.plateVisual}>
              <View style={styles.indCol}>
                <Text style={styles.indText}>IND</Text>
                <Text style={styles.flagText}>🇮🇳</Text>
              </View>
              <Text style={styles.plateNumberText}>{vehicleNumber}</Text>
            </View>

            <View style={styles.rigMetaRow}>
              <Text style={styles.rigMetaText}>{rigName}</Text>
              <Text style={styles.rigIdBadge}>Rig ID #{vehicleId}</Text>
            </View>
          </View>

          {/* SECTION 1: SITE & CUSTOMER DETAILS */}
          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>1. Site & Customer Details</Text>

            <View style={styles.twoCol}>
              <View style={styles.col}>
                <Text style={styles.label}>Report Date</Text>
                <TextInput
                  style={styles.input}
                  value={form.report_date}
                  onChangeText={(val) => handleChange('report_date', val)}
                  placeholder="YYYY-MM-DD"
                  placeholderTextColor="#64748b"
                />
              </View>
              <View style={styles.col}>
                <Text style={styles.label}>Party Phone / Ref</Text>
                <TextInput
                  style={styles.input}
                  value={form.party_no}
                  onChangeText={(val) => handleChange('party_no', val)}
                  placeholder="PT-2024-99"
                  placeholderTextColor="#64748b"
                />
              </View>
            </View>

            <Text style={styles.label}>Customer / Party Name *</Text>
            <TextInput
              style={styles.input}
              value={form.party_name}
              onChangeText={(val) => handleChange('party_name', val)}
              placeholder="e.g. Velusamy Farmer"
              placeholderTextColor="#64748b"
            />

            <View style={styles.twoCol}>
              <View style={styles.col}>
                <Text style={styles.label}>Village / Site Location *</Text>
                <TextInput
                  style={styles.input}
                  value={form.village}
                  onChangeText={(val) => handleChange('village', val)}
                  placeholder="e.g. Perundurai"
                  placeholderTextColor="#64748b"
                />
              </View>
              <View style={styles.col}>
                <Text style={styles.label}>Agent / Broker Name</Text>
                <TextInput
                  style={styles.input}
                  value={form.agent_name}
                  onChangeText={(val) => handleChange('agent_name', val)}
                  placeholder="e.g. Thirumoorthy"
                  placeholderTextColor="#64748b"
                />
              </View>
            </View>
          </View>

          {/* SECTION 2: DRILLING METRICS */}
          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>2. Drilling Metrics</Text>

            <View style={styles.twoCol}>
              <View style={styles.col}>
                <Text style={styles.label}>Total Depth (ft) *</Text>
                <TextInput
                  style={[styles.input, styles.highlightInput]}
                  keyboardType="numeric"
                  value={form.depth}
                  onChangeText={(val) => handleChange('depth', val)}
                  placeholder="e.g. 750"
                  placeholderTextColor="#64748b"
                />
              </View>
              <View style={styles.col}>
                <Text style={styles.label}>Rod Count</Text>
                <TextInput
                  style={styles.input}
                  keyboardType="numeric"
                  value={form.rod_count}
                  onChangeText={(val) => handleChange('rod_count', val)}
                  placeholder="e.g. 37"
                  placeholderTextColor="#64748b"
                />
              </View>
            </View>

            <View style={styles.twoCol}>
              <View style={styles.col}>
                <Text style={styles.label}>MS Casing (ft)</Text>
                <TextInput
                  style={styles.input}
                  keyboardType="numeric"
                  value={form.ms_casing}
                  onChangeText={(val) => handleChange('ms_casing', val)}
                  placeholder="e.g. 45"
                  placeholderTextColor="#64748b"
                />
              </View>
              <View style={styles.col}>
                <Text style={styles.label}>PVC Casing (ft)</Text>
                <TextInput
                  style={styles.input}
                  keyboardType="numeric"
                  value={form.pvc_casing}
                  onChangeText={(val) => handleChange('pvc_casing', val)}
                  placeholder="e.g. 120"
                  placeholderTextColor="#64748b"
                />
              </View>
            </View>

            <View style={styles.twoCol}>
              <View style={styles.col}>
                <Text style={styles.label}>Bore Rate (₹/ft)</Text>
                <TextInput
                  style={styles.input}
                  keyboardType="numeric"
                  value={form.bore_rate}
                  onChangeText={(val) => handleChange('bore_rate', val)}
                  placeholder="85.00"
                  placeholderTextColor="#64748b"
                />
              </View>
              <View style={styles.col}>
                <Text style={styles.label}>Welding Details</Text>
                <TextInput
                  style={styles.input}
                  value={form.welding_details}
                  onChangeText={(val) => handleChange('welding_details', val)}
                  placeholder="3 joints electric"
                  placeholderTextColor="#64748b"
                />
              </View>
            </View>

            <View style={styles.threeCol}>
              <View style={styles.col}>
                <Text style={styles.label}>Recut</Text>
                <TextInput
                  style={styles.input}
                  value={form.recut}
                  onChangeText={(val) => handleChange('recut', val)}
                  placeholder="No / 15ft"
                  placeholderTextColor="#64748b"
                />
              </View>
              <View style={styles.col}>
                <Text style={styles.label}>Rebore</Text>
                <TextInput
                  style={styles.input}
                  value={form.rebore}
                  onChangeText={(val) => handleChange('rebore', val)}
                  placeholder="No"
                  placeholderTextColor="#64748b"
                />
              </View>
              <View style={styles.col}>
                <Text style={styles.label}>Flushing</Text>
                <TextInput
                  style={styles.input}
                  value={form.flushing}
                  onChangeText={(val) => handleChange('flushing', val)}
                  placeholder="45 mins"
                  placeholderTextColor="#64748b"
                />
              </View>
            </View>
          </View>

          {/* SECTION 3: MACHINE STATS & RPM */}
          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>3. Machine Stats & RPM Hours</Text>

            {/* Live RPM Banner */}
            {rpmCalculation.isCalculated && (
              <View
                style={[
                  styles.calcBanner,
                  rpmCalculation.isValid ? styles.calcBannerSuccess : styles.calcBannerError,
                ]}
              >
                <Text
                  style={[
                    styles.calcBannerText,
                    rpmCalculation.isValid ? styles.calcBannerTextSuccess : styles.calcBannerTextError,
                  ]}
                >
                  {rpmCalculation.isValid
                    ? `Auto-Calculated Engine Hours: ${rpmCalculation.total} hrs`
                    : `⚠️ ${rpmCalculation.error}`}
                </Text>
              </View>
            )}

            <View style={styles.twoCol}>
              <View style={styles.col}>
                <Text style={styles.label}>RPM Start *</Text>
                <TextInput
                  style={styles.input}
                  keyboardType="numeric"
                  value={form.rpm_start}
                  onChangeText={(val) => handleChange('rpm_start', val)}
                  placeholder="1450.50"
                  placeholderTextColor="#64748b"
                />
              </View>
              <View style={styles.col}>
                <Text style={styles.label}>RPM End *</Text>
                <TextInput
                  style={[
                    styles.input,
                    !rpmCalculation.isValid && form.rpm_end !== '' && styles.inputErrorBorder,
                  ]}
                  keyboardType="numeric"
                  value={form.rpm_end}
                  onChangeText={(val) => handleChange('rpm_end', val)}
                  placeholder="1462.20"
                  placeholderTextColor="#64748b"
                />
              </View>
            </View>

            <View style={styles.twoCol}>
              <View style={styles.col}>
                <Text style={styles.label}>Average RPM</Text>
                <TextInput
                  style={styles.input}
                  keyboardType="numeric"
                  value={form.avg_rpm}
                  onChangeText={(val) => handleChange('avg_rpm', val)}
                  placeholder="1450"
                  placeholderTextColor="#64748b"
                />
              </View>
              <View style={styles.col}>
                <Text style={styles.label}>Chief Driller</Text>
                <TextInput
                  style={styles.input}
                  value={form.driller_name}
                  onChangeText={(val) => handleChange('driller_name', val)}
                  placeholder="Palanisamy"
                  placeholderTextColor="#64748b"
                />
              </View>
            </View>

            <View style={styles.threeCol}>
              <View style={styles.col}>
                <Text style={styles.label}>Bit No</Text>
                <TextInput
                  style={styles.input}
                  value={form.bit_number}
                  onChangeText={(val) => handleChange('bit_number', val)}
                  placeholder="BIT-6.5"
                  placeholderTextColor="#64748b"
                />
              </View>
              <View style={styles.col}>
                <Text style={styles.label}>Bit Size</Text>
                <TextInput
                  style={styles.input}
                  value={form.bit_size}
                  onChangeText={(val) => handleChange('bit_size', val)}
                  placeholder="6.5 inch"
                  placeholderTextColor="#64748b"
                />
              </View>
              <View style={styles.col}>
                <Text style={styles.label}>Hammer</Text>
                <TextInput
                  style={styles.input}
                  value={form.hammer_type}
                  onChangeText={(val) => handleChange('hammer_type', val)}
                  placeholder="DHD 360"
                  placeholderTextColor="#64748b"
                />
              </View>
            </View>
          </View>

          {/* SECTION 4: FUEL & FINANCIALS */}
          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>4. Fuel & Financials</Text>

            <View style={styles.twoCol}>
              <View style={styles.col}>
                <Text style={styles.label}>Diesel Filled (L)</Text>
                <TextInput
                  style={styles.input}
                  keyboardType="numeric"
                  value={form.diesel_liters}
                  onChangeText={(val) => handleChange('diesel_liters', val)}
                  placeholder="240"
                  placeholderTextColor="#64748b"
                />
              </View>
              <View style={styles.col}>
                <Text style={styles.label}>Cash Advance (₹)</Text>
                <TextInput
                  style={styles.input}
                  value={form.cash_advance}
                  onChangeText={(val) => handleChange('cash_advance', val)}
                  placeholder="Rs. 25,000 cash"
                  placeholderTextColor="#64748b"
                />
              </View>
            </View>

            <Text style={styles.label}>Field Remarks / Water Yield</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              multiline
              numberOfLines={3}
              value={form.remarks}
              onChangeText={(val) => handleChange('remarks', val)}
              placeholder="Record water strikes, rock formation, delays..."
              placeholderTextColor="#64748b"
            />
          </View>

          {/* Submit Button */}
          <TouchableOpacity
            style={[styles.submitButton, submitting && styles.submitButtonDisabled]}
            onPress={handleSubmit}
            disabled={submitting}
            activeOpacity={0.8}
          >
            {submitting ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <Text style={styles.submitButtonText}>
                Submit Log for {vehicleNumber}
              </Text>
            )}
          </TouchableOpacity>

          {/* RECENT SUBMISSIONS FEED FOR THIS RIG */}
          <View style={styles.recentSection}>
            <Text style={styles.recentHeading}>
              Recent Logs for {vehicleNumber}:
            </Text>
            {loadingRecent ? (
              <ActivityIndicator color="#3b82f6" />
            ) : recentLogs.length === 0 ? (
              <Text style={styles.emptyRecentText}>No past logs found for this rig.</Text>
            ) : (
              recentLogs.map((log) => (
                <View key={log.id} style={styles.recentItem}>
                  <View style={styles.recentRow}>
                    <Text style={styles.recentParty}>{log.party_name}</Text>
                    <Text style={styles.recentDepth}>{log.depth} ft</Text>
                  </View>
                  <View style={styles.recentRow}>
                    <Text style={styles.recentMeta}>📍 {log.village}</Text>
                    <Text style={styles.recentTime}>{log.submitted_at_formatted || log.report_date}</Text>
                  </View>
                </View>
              ))
            )}
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
    flex: 1,
    backgroundColor: '#0b1120',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#1e293b',
  },
  managerGreeting: {
    fontSize: 11,
    color: '#64748b',
    textTransform: 'uppercase',
    fontWeight: '700',
  },
  managerName: {
    fontSize: 16,
    fontWeight: '800',
    color: '#ffffff',
  },
  logoutBtn: {
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
  },
  logoutBtnText: {
    color: '#f87171',
    fontSize: 12,
    fontWeight: '700',
  },
  lockedPlateCard: {
    backgroundColor: '#111827',
    borderRadius: 16,
    padding: 16,
    marginBottom: 18,
    borderWidth: 1,
    borderColor: '#374151',
  },
  plateHeader: {
    marginBottom: 10,
  },
  lockBadgeText: {
    color: '#fbbf24',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  plateSubtext: {
    fontSize: 11,
    color: '#94a3b8',
    marginTop: 2,
  },
  plateVisual: {
    backgroundColor: '#ffffff',
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#0f172a',
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginVertical: 4,
  },
  indCol: {
    alignItems: 'center',
    paddingRight: 10,
    borderRightWidth: 1,
    borderRightColor: '#cbd5e1',
  },
  indText: {
    fontSize: 9,
    fontWeight: '900',
    color: '#1e3a8a',
  },
  flagText: {
    fontSize: 8,
  },
  plateNumberText: {
    flex: 1,
    textAlign: 'center',
    fontSize: 20,
    fontWeight: '900',
    color: '#0f172a',
    letterSpacing: 2,
  },
  rigMetaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  rigMetaText: {
    color: '#94a3b8',
    fontSize: 12,
    fontWeight: '600',
  },
  rigIdBadge: {
    color: '#60a5fa',
    fontSize: 11,
    fontWeight: '700',
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  sectionCard: {
    backgroundColor: '#111827',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#1f2937',
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#f8fafc',
    marginBottom: 14,
  },
  label: {
    fontSize: 11,
    fontWeight: '700',
    color: '#94a3b8',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
    marginBottom: 4,
  },
  input: {
    backgroundColor: '#090d16',
    borderWidth: 1,
    borderColor: '#374151',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: '#ffffff',
    marginBottom: 12,
  },
  highlightInput: {
    borderColor: '#10b981',
    color: '#34d399',
    fontWeight: '800',
  },
  inputErrorBorder: {
    borderColor: '#ef4444',
  },
  textArea: {
    minHeight: 70,
    textAlignVertical: 'top',
  },
  twoCol: {
    flexDirection: 'row',
    gap: 10,
  },
  threeCol: {
    flexDirection: 'row',
    gap: 8,
  },
  col: {
    flex: 1,
  },
  calcBanner: {
    padding: 12,
    borderRadius: 10,
    marginBottom: 12,
  },
  calcBannerSuccess: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.4)',
  },
  calcBannerError: {
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.4)',
  },
  calcBannerText: {
    fontSize: 12,
    fontWeight: '700',
    textAlign: 'center',
  },
  calcBannerTextSuccess: {
    color: '#34d399',
  },
  calcBannerTextError: {
    color: '#f87171',
  },
  submitButton: {
    backgroundColor: '#2563eb',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 4,
    shadowColor: '#2563eb',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  recentSection: {
    marginTop: 24,
    borderTopWidth: 1,
    borderTopColor: '#1e293b',
    paddingTop: 16,
  },
  recentHeading: {
    fontSize: 12,
    fontWeight: '700',
    color: '#94a3b8',
    textTransform: 'uppercase',
    marginBottom: 10,
  },
  emptyRecentText: {
    color: '#64748b',
    fontSize: 12,
    fontStyle: 'italic',
  },
  recentItem: {
    backgroundColor: '#111827',
    padding: 12,
    borderRadius: 10,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#1f2937',
  },
  recentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  recentParty: {
    fontSize: 13,
    fontWeight: '700',
    color: '#e2e8f0',
  },
  recentDepth: {
    fontSize: 13,
    fontWeight: '800',
    color: '#38bdf8',
  },
  recentMeta: {
    fontSize: 11,
    color: '#94a3b8',
    marginTop: 4,
  },
  recentTime: {
    fontSize: 10,
    color: '#fbbf24',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    marginTop: 4,
  },
});
