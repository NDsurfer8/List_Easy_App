import { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useListEasy } from '../../../context/ListEasyContext';
import { theme } from '../../../lib/theme';

const { colors } = theme;

export default function EditItemScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { getItem, updateItem } = useListEasy();
  const item = id ? getItem(id) : undefined;

  const [label, setLabel] = useState('');
  const [description, setDescription] = useState('');
  const [estimatedValue, setEstimatedValue] = useState('');
  const [category, setCategory] = useState('');

  useEffect(() => {
    if (item) {
      setLabel(item.label);
      setDescription(item.description);
      setEstimatedValue(String(item.estimatedValue));
      setCategory(item.category);
    }
  }, [item?.id]);

  if (!item) {
    return (
      <View style={styles.centered}>
        <Text style={styles.error}>Item not found.</Text>
      </View>
    );
  }

  const handleSave = () => {
    const value = parseInt(estimatedValue, 10);
    updateItem(id!, {
      label: label.trim() || item.label,
      description: description.trim() || item.description,
      estimatedValue: isNaN(value) ? item.estimatedValue : value,
      category: category.trim() || item.category,
    });
    router.back();
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.label}>Label</Text>
      <TextInput
        style={styles.input}
        value={label}
        onChangeText={setLabel}
        placeholder="Item name"
        placeholderTextColor="#94a3b8"
      />

      <Text style={styles.label}>Description</Text>
      <TextInput
        style={[styles.input, styles.textArea]}
        value={description}
        onChangeText={setDescription}
        placeholder="Description"
        placeholderTextColor="#94a3b8"
        multiline
      />

      <Text style={styles.label}>Estimated value ($)</Text>
      <TextInput
        style={styles.input}
        value={estimatedValue}
        onChangeText={(t) => setEstimatedValue(t.replace(/\D/g, ''))}
        placeholder="0"
        placeholderTextColor="#94a3b8"
        keyboardType="number-pad"
      />

      <Text style={styles.label}>Category</Text>
      <TextInput
        style={styles.input}
        value={category}
        onChangeText={setCategory}
        placeholder="e.g. Furniture"
        placeholderTextColor="#94a3b8"
      />

      <TouchableOpacity style={styles.saveBtn} onPress={handleSave} activeOpacity={0.85}>
        <Text style={styles.saveBtnText}>Save changes</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: 20, paddingBottom: 40 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  error: { color: colors.error, fontSize: 16 },
  label: { fontSize: 14, fontWeight: '600', color: colors.textSecondary, marginBottom: 6, marginTop: 16 },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: colors.surface,
  },
  textArea: { minHeight: 80 },
  saveBtn: {
    backgroundColor: colors.primary,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 24,
  },
  saveBtnText: { color: colors.textOnPrimary, fontSize: 16, fontWeight: '600' },
});
