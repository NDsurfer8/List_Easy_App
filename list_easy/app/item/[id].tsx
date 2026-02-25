import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
  Image,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import type { ListedItem } from '../../lib/types';
import { useListEasy } from '../../context/ListEasyContext';
import { getSimilarCategory } from '../../lib/ai';

export default function ItemScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { getItem, getListing, getSimilarItems, addOffer } = useListEasy();
  const item = id ? getItem(id) : undefined;
  const listing = item ? getListing(item.listingId) : undefined;
  const similar = item ? getSimilarItems(item.category, item.id) : [];
  const [offerAmount, setOfferAmount] = useState('');
  const [offerMessage, setOfferMessage] = useState('');
  const [sending, setSending] = useState(false);

  const handleMakeOffer = () => {
    if (!item || item.status !== 'available') return;
    const amount = parseInt(offerAmount, 10);
    if (isNaN(amount) || amount < 1) {
      Alert.alert('Invalid offer', 'Enter a valid amount in dollars.');
      return;
    }
    setSending(true);
    addOffer({
      itemId: item.id,
      listingId: item.listingId,
      amount,
      message: offerMessage.trim(),
      buyerName: 'You',
    });
    setSending(false);
    setOfferAmount('');
    setOfferMessage('');
    Alert.alert('Offer sent', 'The seller will review your offer.');
  };

  if (!item) {
    return (
      <View style={styles.centered}>
        <Text style={styles.error}>Item not found.</Text>
      </View>
    );
  }

  const similarLabels = getSimilarCategory(item.category);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Image source={{ uri: item.imageUri }} style={styles.image} resizeMode="cover" />
      <View style={styles.main}>
        <Text style={styles.label}>{item.label}</Text>
        <View style={styles.valueRow}>
          <Text style={styles.valueLabel}>AI estimated value</Text>
          <Text style={styles.value}>${item.estimatedValue}</Text>
        </View>
        <Text style={styles.description}>{item.description}</Text>
        <View style={styles.badgeWrap}>
          <View style={[styles.badge, item.status !== 'available' && styles.badgeSold]}>
            <Text style={styles.badgeText}>{item.status}</Text>
          </View>
          <Text style={styles.category}>{item.category}</Text>
        </View>
      </View>

      {item.status === 'available' && (
        <View style={styles.offerSection}>
          <Text style={styles.sectionTitle}>Make an offer</Text>
          <TextInput
            style={styles.input}
            value={offerAmount}
            onChangeText={setOfferAmount}
            placeholder="Your offer ($)"
            placeholderTextColor="#94a3b8"
            keyboardType="number-pad"
          />
          <TextInput
            style={[styles.input, styles.messageInput]}
            value={offerMessage}
            onChangeText={setOfferMessage}
            placeholder="Message (optional)"
            placeholderTextColor="#94a3b8"
            multiline
          />
          <TouchableOpacity
            style={styles.offerBtn}
            onPress={handleMakeOffer}
            disabled={sending}
            activeOpacity={0.85}
          >
            <Text style={styles.offerBtnText}>Submit offer</Text>
          </TouchableOpacity>
        </View>
      )}

      <View style={styles.similarSection}>
        <Text style={styles.sectionTitle}>Similar items</Text>
        <Text style={styles.similarHint}>
          Other things in this category: {similarLabels.slice(0, 5).join(', ')}
        </Text>
        {similar.length > 0 && (
          <View style={styles.similarList}>
            {similar.slice(0, 4).map((s: ListedItem) => (
              <TouchableOpacity
                key={s.id}
                style={styles.similarCard}
                onPress={() => router.push(`/item/${s.id}`)}
                activeOpacity={0.9}
              >
                <Text style={styles.similarLabel}>{s.label}</Text>
                <Text style={styles.similarValue}>${s.estimatedValue}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f1f5f9' },
  content: { paddingBottom: 40 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  error: { color: '#dc2626', fontSize: 16 },
  image: {
    width: '100%',
    height: 220,
    backgroundColor: '#e2e8f0',
  },
  main: { padding: 20, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#e2e8f0' },
  label: { fontSize: 22, fontWeight: '700', color: '#1e293b' },
  valueRow: { flexDirection: 'row', alignItems: 'baseline', marginTop: 8 },
  valueLabel: { fontSize: 14, color: '#64748b', marginRight: 8 },
  value: { fontSize: 24, fontWeight: '700', color: '#22c55e' },
  description: { fontSize: 15, color: '#475569', lineHeight: 22, marginTop: 12 },
  badgeWrap: { flexDirection: 'row', alignItems: 'center', marginTop: 12, gap: 10 },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    backgroundColor: '#dcfce7',
  },
  badgeSold: { backgroundColor: '#fef3c7' },
  badgeText: { fontSize: 12, fontWeight: '600', color: '#166534', textTransform: 'capitalize' },
  category: { fontSize: 13, color: '#64748b' },
  offerSection: { padding: 20, backgroundColor: '#fff', marginTop: 12 },
  sectionTitle: { fontSize: 18, fontWeight: '600', color: '#334155', marginBottom: 12 },
  input: {
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: '#f8fafc',
    marginBottom: 10,
  },
  messageInput: { minHeight: 80 },
  offerBtn: {
    backgroundColor: '#3b82f6',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 4,
  },
  offerBtnText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  similarSection: { padding: 20 },
  similarHint: { fontSize: 14, color: '#64748b', marginBottom: 12 },
  similarList: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  similarCard: {
    backgroundColor: '#fff',
    padding: 14,
    borderRadius: 10,
    minWidth: 140,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  similarLabel: { fontSize: 14, fontWeight: '600', color: '#1e293b' },
  similarValue: { fontSize: 13, color: '#22c55e', marginTop: 2 },
});
