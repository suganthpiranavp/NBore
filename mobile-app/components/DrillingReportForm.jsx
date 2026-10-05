import React, { useState, useMemo } from 'react';
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

// Adjust API_BASE_URL to match your backend host:
// - Android Emulator: 'http://10.0.2.2:5000'
// - iOS Simulator: 'http://localhost:5000'
// - Physical Device: 'http://YOUR_LOCAL_WIFI_IP:5000' (e.g. 192.168.1.50)
const API_BASE_URL = 'http://10.0.2.2:5000';

const VEHICLES = [
  { id: 1, label: 'Vehicle 1 - TN-28-AA-1001 (Rig 1)' },
  { id: 2, label: 'Vehicle 2 - TN-28-AA-1002 (Rig 2)' },
  { id: 3, label: 'Vehicle 3 - TN-28-AA-1003 (Rig 3)' },
  { id: 4, label: 'Vehicle 4 - TN-28-AA-1004 (Rig 4)' },
];

export default function DrillingReportForm() {
  const today = new Date().toISOString().split('T')[0];

  // Initial Form State
  const initialFormState = {
    // Site Details
    vehicle_id: 1,
    manager_id: 'b0000000-0000-0000-0000-000000000001',
    report_date: today,
    agent_name: '',
    party_no: '',
    party_name: '',
    village: '',
    bore_rate: '',

    // Drilling Metrics
    depth: '',
    rod_count: '',
    ms_casing: '',
    pvc_casing: '',
    welding_details: '',
    recut: 'No',
    rebore: 'No',
    flushing: '',

    // Machine Stats & RPM
    rpm_start: '',
    rpm_end: '',
    avg_rpm: '',
    bit_number: '',
    bit_size: '6.5 inch',
    hammer_type: 'DHD 360',
    driller_name: '',

    // Financials & Remarks
    diesel_liters: '',
    cash_advance: '',
    remarks: '',
  };

  const [form, setForm] = useState(initialFormState);
  const [submitting, setSubmitting] = useState(false);

  // Field change handler
  const handleChange = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  // Real-time client-side RPM calculation and validation
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
    // Basic client validations
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
      Alert.alert('Required Field', 'Please fill in both RPM Start and RPM End meter readings.');
      return;
    }
    if (!rpmCalculation.isValid) {
      Alert.alert('RPM Error', rpmCalculation.error || 'End RPM must be greater than Start RPM');
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/reports`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify(form),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        Alert.alert(
          'Report Submitted! ✅',
          `Report for ${form.party_name} at ${form.village} has been logged.\nTotal RPM: ${data.metrics?.rpm_total || rpmCalculation.total} hrs`,
          [
            {
              text: 'Create New Log',
              onPress: () => {
                setForm({
                  ...initialFormState,
                  vehicle_id: form.vehicle_id,
                  report_date: today,
                });
              },
            },
          ]
        );
      } else {
        Alert.alert('Submission Failed', data.message || 'Server error occurred.');
      }
    } catch (error) {
      console.error('Submit error:', error);
      Alert.alert(
        'Network Connection Error',
        `Unable to reach backend at ${API_BASE_URL}. Ensure server is running and device is on same network.`
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#0f172a" />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboardContainer}
      >
        <ScrollView
          style={styles.container}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Header Banner */}
          <View style={styles.header}>
            <View style={styles.headerBadge}>
              <Text style={styles.headerBadgeText}>FIELD MANAGER APP</Text>
            </View>
            <Text style={styles.headerTitle}>Daily Drilling Log</Text>
            <Text style={styles.headerSubtitle}>
              Digitized Daily Log Sheet for Borewell Rig Operations
            </Text>
          </View>

          {/* SECTION 1: SITE & CUSTOMER DETAILS */}
          <View style={styles.sectionCard}>
            <View style={styles.sectionHeader}>
              <View style={[styles.sectionNumber, { backgroundColor: '#3b82f6' }]}>
                <Text style={styles.sectionNumberText}>1</Text>
              </View>
              <Text style={styles.sectionTitle}>Site & Customer Details</Text>
            </View>

            {/* Vehicle Selector */}
            <Text style={styles.inputLabel}>Select Rig / Vehicle *</Text>
            <View style={styles.vehicleSelectorGrid}>
              {VEHICLES.map((v) => {
                const isSelected = form.vehicle_id === v.id;
                return (
                  <TouchableOpacity
                    key={v.id}
                    style={[styles.vehicleChip, isSelected && styles.vehicleChipActive]}
                    onPress={() => handleChange('vehicle_id', v.id)}
                    activeOpacity={0.7}
                  >
                    <Text
                      style={[
                        styles.vehicleChipText,
                        isSelected && styles.vehicleChipTextActive,
                      ]}
                    >
                      {v.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <View style={styles.row}>
              <View style={styles.colHalf}>
                <Text style={styles.inputLabel}>Report Date</Text>
                <TextInput
                  style={styles.input}
                  value={form.report_date}
                  onChangeText={(val) => handleChange('report_date', val)}
                  placeholder="YYYY-MM-DD"
                  placeholderTextColor="#94a3b8"
                />
              </View>
              <View style={styles.colHalf}>
                <Text style={styles.inputLabel}>Party Phone / Ref No</Text>
                <TextInput
                  style={styles.input}
                  value={form.party_no}
                  onChangeText={(val) => handleChange('party_no', val)}
                  placeholder="e.g. PT-2024-88"
                  placeholderTextColor="#94a3b8"
                />
              </View>
            </View>

            <Text style={styles.inputLabel}>Customer / Party Name *</Text>
            <TextInput
              style={styles.input}
              value={form.party_name}
              onChangeText={(val) => handleChange('party_name', val)}
              placeholder="e.g. Velusamy Farmer"
              placeholderTextColor="#94a3b8"
            />

            <View style={styles.row}>
              <View style={styles.colHalf}>
                <Text style={styles.inputLabel}>Village / Site Location *</Text>
                <TextInput
                  style={styles.input}
                  value={form.village}
                  onChangeText={(val) => handleChange('village', val)}
                  placeholder="e.g. Perundurai"
                  placeholderTextColor="#94a3b8"
                />
              </View>
              <View style={styles.colHalf}>
                <Text style={styles.inputLabel}>Agent / Broker Name</Text>
                <TextInput
                  style={styles.input}
                  value={form.agent_name}
                  onChangeText={(val) => handleChange('agent_name', val)}
                  placeholder="e.g. Thirumoorthy"
                  placeholderTextColor="#94a3b8"
                />
              </View>
            </View>
          </View>

          {/* SECTION 2: DRILLING METRICS */}
          <View style={styles.sectionCard}>
            <View style={styles.sectionHeader}>
              <View style={[styles.sectionNumber, { backgroundColor: '#10b981' }]}>
                <Text style={styles.sectionNumberText}>2</Text>
              </View>
              <Text style={styles.sectionTitle}>Drilling Metrics</Text>
            </View>

            <View style={styles.row}>
              <View style={styles.colHalf}>
                <Text style={styles.inputLabel}>Total Depth (ft) *</Text>
                <TextInput
                  style={[styles.input, styles.highlightInput]}
                  keyboardType="numeric"
                  value={form.depth}
                  onChangeText={(val) => handleChange('depth', val)}
                  placeholder="e.g. 750"
                  placeholderTextColor="#94a3b8"
                />
              </View>
              <View style={styles.colHalf}>
                <Text style={styles.inputLabel}>Rod Count (20ft rods)</Text>
                <TextInput
                  style={styles.input}
                  keyboardType="numeric"
                  value={form.rod_count}
                  onChangeText={(val) => handleChange('rod_count', val)}
                  placeholder="e.g. 37"
                  placeholderTextColor="#94a3b8"
                />
              </View>
            </View>

            <View style={styles.row}>
              <View style={styles.colHalf}>
                <Text style={styles.inputLabel}>Bore Rate (₹/ft)</Text>
                <TextInput
                  style={styles.input}
                  keyboardType="numeric"
                  value={form.bore_rate}
                  onChangeText={(val) => handleChange('bore_rate', val)}
                  placeholder="e.g. 85.00"
                  placeholderTextColor="#94a3b8"
                />
              </View>
              <View style={styles.colHalf}>
                <Text style={styles.inputLabel}>MS Casing (ft)</Text>
                <TextInput
                  style={styles.input}
                  keyboardType="numeric"
                  value={form.ms_casing}
                  onChangeText={(val) => handleChange('ms_casing', val)}
                  placeholder="e.g. 45"
                  placeholderTextColor="#94a3b8"
                />
              </View>
            </View>

            <View style={styles.row}>
              <View style={styles.colHalf}>
                <Text style={styles.inputLabel}>PVC Casing (ft)</Text>
                <TextInput
                  style={styles.input}
                  keyboardType="numeric"
                  value={form.pvc_casing}
                  onChangeText={(val) => handleChange('pvc_casing', val)}
                  placeholder="e.g. 120"
                  placeholderTextColor="#94a3b8"
                />
              </View>
              <View style={styles.colHalf}>
                <Text style={styles.inputLabel}>Welding Details</Text>
                <TextInput
                  style={styles.input}
                  value={form.welding_details}
                  onChangeText={(val) => handleChange('welding_details', val)}
                  placeholder="e.g. 3 joints electric"
                  placeholderTextColor="#94a3b8"
                />
              </View>
            </View>

            <View style={styles.row}>
              <View style={styles.colThird}>
                <Text style={styles.inputLabel}>Recut</Text>
                <TextInput
                  style={styles.input}
                  value={form.recut}
                  onChangeText={(val) => handleChange('recut', val)}
                  placeholder="No / 15ft"
                  placeholderTextColor="#94a3b8"
                />
              </View>
              <View style={styles.colThird}>
                <Text style={styles.inputLabel}>Rebore</Text>
                <TextInput
                  style={styles.input}
                  value={form.rebore}
                  onChangeText={(val) => handleChange('rebore', val)}
                  placeholder="No"
                  placeholderTextColor="#94a3b8"
                />
              </View>
              <View style={styles.colThird}>
                <Text style={styles.inputLabel}>Flushing</Text>
                <TextInput
                  style={styles.input}
                  value={form.flushing}
                  onChangeText={(val) => handleChange('flushing', val)}
                  placeholder="45 mins"
                  placeholderTextColor="#94a3b8"
                />
              </View>
            </View>
          </View>

          {/* SECTION 3: MACHINE STATS & RPM */}
          <View style={styles.sectionCard}>
            <View style={styles.sectionHeader}>
              <View style={[styles.sectionNumber, { backgroundColor: '#f59e0b' }]}>
                <Text style={styles.sectionNumberText}>3</Text>
              </View>
              <Text style={styles.sectionTitle}>Machine Stats & Engine Hours</Text>
            </View>

            {/* RPM Validation Banner */}
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
                    rpmCalculation.isValid
                      ? styles.calcBannerTextSuccess
                      : styles.calcBannerTextError,
                  ]}
                >
                  {rpmCalculation.isValid
                    ? `Auto-Calculated Total RPM: ${rpmCalculation.total} hrs`
                    : `⚠️ Validation Alert: ${rpmCalculation.error}`}
                </Text>
              </View>
            )}

            <View style={styles.row}>
              <View style={styles.colHalf}>
                <Text style={styles.inputLabel}>RPM / Meter Start *</Text>
                <TextInput
                  style={styles.input}
                  keyboardType="numeric"
                  value={form.rpm_start}
                  onChangeText={(val) => handleChange('rpm_start', val)}
                  placeholder="e.g. 1450.50"
                  placeholderTextColor="#94a3b8"
                />
              </View>
              <View style={styles.colHalf}>
                <Text style={styles.inputLabel}>RPM / Meter End *</Text>
                <TextInput
                  style={[
                    styles.input,
                    !rpmCalculation.isValid && form.rpm_end !== '' && styles.inputErrorBorder,
                  ]}
                  keyboardType="numeric"
                  value={form.rpm_end}
                  onChangeText={(val) => handleChange('rpm_end', val)}
                  placeholder="e.g. 1462.20"
                  placeholderTextColor="#94a3b8"
                />
              </View>
            </View>

            <View style={styles.row}>
              <View style={styles.colHalf}>
                <Text style={styles.inputLabel}>Average Working RPM</Text>
                <TextInput
                  style={styles.input}
                  keyboardType="numeric"
                  value={form.avg_rpm}
                  onChangeText={(val) => handleChange('avg_rpm', val)}
                  placeholder="e.g. 1450"
                  placeholderTextColor="#94a3b8"
                />
              </View>
              <View style={styles.colHalf}>
                <Text style={styles.inputLabel}>Driller Name</Text>
                <TextInput
                  style={styles.input}
                  value={form.driller_name}
                  onChangeText={(val) => handleChange('driller_name', val)}
                  placeholder="e.g. Palanisamy"
                  placeholderTextColor="#94a3b8"
                />
              </View>
            </View>

            <View style={styles.row}>
              <View style={styles.colThird}>
                <Text style={styles.inputLabel}>Bit Number</Text>
                <TextInput
                  style={styles.input}
                  value={form.bit_number}
                  onChangeText={(val) => handleChange('bit_number', val)}
                  placeholder="BIT-6.5-901"
                  placeholderTextColor="#94a3b8"
                />
              </View>
              <View style={styles.colThird}>
                <Text style={styles.inputLabel}>Bit Size</Text>
                <TextInput
                  style={styles.input}
                  value={form.bit_size}
                  onChangeText={(val) => handleChange('bit_size', val)}
                  placeholder="6.5 inch"
                  placeholderTextColor="#94a3b8"
                />
              </View>
              <View style={styles.colThird}>
                <Text style={styles.inputLabel}>Hammer Type</Text>
                <TextInput
                  style={styles.input}
                  value={form.hammer_type}
                  onChangeText={(val) => handleChange('hammer_type', val)}
                  placeholder="DHD 360"
                  placeholderTextColor="#94a3b8"
                />
              </View>
            </View>
          </View>

          {/* SECTION 4: FINANCIALS & REMARKS */}
          <View style={styles.sectionCard}>
            <View style={styles.sectionHeader}>
              <View style={[styles.sectionNumber, { backgroundColor: '#8b5cf6' }]}>
                <Text style={styles.sectionNumberText}>4</Text>
              </View>
              <Text style={styles.sectionTitle}>Fuel, Financials & Notes</Text>
            </View>

            <View style={styles.row}>
              <View style={styles.colHalf}>
                <Text style={styles.inputLabel}>Diesel Filled (Liters)</Text>
                <TextInput
                  style={styles.input}
                  keyboardType="numeric"
                  value={form.diesel_liters}
                  onChangeText={(val) => handleChange('diesel_liters', val)}
                  placeholder="e.g. 240"
                  placeholderTextColor="#94a3b8"
                />
              </View>
              <View style={styles.colHalf}>
                <Text style={styles.inputLabel}>Cash Advance Received</Text>
                <TextInput
                  style={styles.input}
                  value={form.cash_advance}
                  onChangeText={(val) => handleChange('cash_advance', val)}
                  placeholder="e.g. Rs. 25,000 cash"
                  placeholderTextColor="#94a3b8"
                />
              </View>
            </View>

            <Text style={styles.inputLabel}>Field Remarks / Water Yield Observations</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              multiline
              numberOfLines={3}
              value={form.remarks}
              onChangeText={(val) => handleChange('remarks', val)}
              placeholder="Record water strikes, formation changes, bit conditions, or delays..."
              placeholderTextColor="#94a3b8"
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
              <ActivityIndicator color="#ffffff" size="small" />
            ) : (
              <Text style={styles.submitButtonText}>Submit Daily Drilling Report</Text>
            )}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#0f172a',
  },
  keyboardContainer: {
    flex: 1,
  },
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  header: {
    backgroundColor: '#0f172a',
    marginHorizontal: -16,
    marginTop: -16,
    padding: 24,
    paddingTop: 16,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    marginBottom: 20,
  },
  headerBadge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(59, 130, 246, 0.2)',
    borderColor: '#3b82f6',
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 8,
  },
  headerBadgeText: {
    color: '#60a5fa',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  headerTitle: {
    color: '#ffffff',
    fontSize: 24,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    color: '#94a3b8',
    fontSize: 13,
    marginTop: 4,
  },
  sectionCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  sectionNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  sectionNumberText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '700',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1e293b',
  },
  vehicleSelectorGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 14,
  },
  vehicleChip: {
    backgroundColor: '#f1f5f9',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#cbd5e1',
  },
  vehicleChipActive: {
    backgroundColor: '#2563eb',
    borderColor: '#1d4ed8',
  },
  vehicleChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#475569',
  },
  vehicleChipTextActive: {
    color: '#ffffff',
    fontWeight: '700',
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#475569',
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  input: {
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: '#0f172a',
    marginBottom: 14,
  },
  highlightInput: {
    borderColor: '#10b981',
    backgroundColor: '#f0fdf4',
    fontWeight: '700',
  },
  inputErrorBorder: {
    borderColor: '#ef4444',
    backgroundColor: '#fef2f2',
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  colHalf: {
    flex: 1,
  },
  colThird: {
    flex: 1,
  },
  calcBanner: {
    padding: 12,
    borderRadius: 8,
    marginBottom: 14,
  },
  calcBannerSuccess: {
    backgroundColor: '#ecfdf5',
    borderWidth: 1,
    borderColor: '#a7f3d0',
  },
  calcBannerError: {
    backgroundColor: '#fef2f2',
    borderWidth: 1,
    borderColor: '#fecaca',
  },
  calcBannerText: {
    fontSize: 13,
    fontWeight: '700',
    textAlign: 'center',
  },
  calcBannerTextSuccess: {
    color: '#065f46',
  },
  calcBannerTextError: {
    color: '#b91c1c',
  },
  submitButton: {
    backgroundColor: '#2563eb',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#2563eb',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
    marginTop: 8,
  },
  submitButtonDisabled: {
    backgroundColor: '#94a3b8',
    shadowOpacity: 0,
  },
  submitButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
});
