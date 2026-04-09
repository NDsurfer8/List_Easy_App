import { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useListEasy } from '../../../context/ListEasyContext';
import type { ListedItem } from '../../../lib/types';
import { theme } from '../../../lib/theme';

const { colors } = theme;

export default function EditListingScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { getListing, updateListing, deleteListing, deleteItem } = useListEasy();
  const listing = id ? getListing(id) : undefined;

  const [title, setTitle] = useState('');
  const [zipCode, setZipCode] = useState('');
  const [items, setItems] = useState<ListedItem[]>([]);

  useEffect(() => {
    if (listing) {
      setTitle(listing.title);
      setZipCode(listing.zipCode ?? '');
      setItems(listing.items);
    }
  }, [listing?.id]);

  if (!listing) {
    return (
      <View style={styles.centered}>
        <Text style={styles.error}>Listing not found.</Text>
      </View>
    );
  }

  const handleSave = () => {
    const newZip = zipCode.trim().replace(/\D/g, '').slice(0, 5) || undefined;
    updateListing(id!, {
      title: title.trim() || 'My room',
      zipCode: newZip,
      items,
    });
    router.back();
  };

  const removeItem = (itemId: string) => {
    Alert.alert(
      'Remove item',
      'Remove this item from the listing?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => {
            setItems((prev) => prev.filter((i) => i.id !== itemId));
            deleteItem(itemId);
          },
        },
      ]
    );
  };

  const handleDeleteListing = () => {
    Alert.alert(
      'Delete listing',
      `Remove "${listing.title}" and all items? This cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            deleteListing(id!);
            router.replace('/');
          },
        },
      ]
    );
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.label}>Title</Text>
      <TextInput
        style={styles.input}
        value={title}
        onChangeText={setTitle}
        placeholder="e.g. Living room"
        placeholderTextColor="#94a3b8"
      />

      <Text style={styles.label}>Zip code</Text>
      <TextInput
        style={styles.input}
        value={zipCode}
        onChangeText={(t) => setZipCode(t.replace(/\D/g, '').slice(0, 5))}
        placeholder="e.g. 11201"
        placeholderTextColor="#94a3b8"
        keyboardType="number-pad"
        maxLength={5}
      />

      <Text style={styles.label}>Items ({items.length})</Text>
      <Text style={styles.hint}>Tap Remove to take an item off this listing.</Text>
      {items.map((item) => (
        <View key={item.id} style={styles.itemRow}>
          <View style={styles.itemInfo}>
            <Text style={styles.itemLabel}>{item.label}</Text>
            <Text style={styles.itemValue}>Est. ${item.estimatedValue}</Text>
          </View>
          <TouchableOpacity
            style={styles.removeBtn}
            onPress={() => removeItem(item.id)}
            activeOpacity={0.8}
          >
            <Text style={styles.removeBtnText}>Remove</Text>
          </TouchableOpacity>
        </View>
      ))}

      <TouchableOpacity style={styles.saveBtn} onPress={handleSave} activeOpacity={0.85}>
        <Text style={styles.saveBtnText}>Save changes</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.deleteListingBtn} onPress={handleDeleteListing} activeOpacity={0.85}>
        <Text style={styles.deleteListingBtnText}>Delete entire listing</Text>
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
  hint: { fontSize: 13, color: colors.textMuted, marginBottom: 10 },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: colors.surface,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surface,
    padding: 14,
    borderRadius: 10,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  itemInfo: {},
  itemLabel: { fontSize: 15, fontWeight: '600', color: colors.text },
  itemValue: { fontSize: 13, color: colors.success, marginTop: 2 },
  removeBtn: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: colors.errorBg,
    borderRadius: 6,
  },
  removeBtnText: { fontSize: 13, fontWeight: '600', color: colors.error },
  saveBtn: {
    backgroundColor: colors.primary,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 24,
  },
  saveBtnText: { color: colors.textOnPrimary, fontSize: 16, fontWeight: '600' },
  deleteListingBtn: {
    marginTop: 12,
    paddingVertical: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    backgroundColor: colors.errorBg,
  },
  deleteListingBtnText: { color: colors.error, fontSize: 15, fontWeight: '600' },
});
