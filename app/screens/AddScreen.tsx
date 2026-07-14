import React, { useState } from 'react';
import { View, Text, ScrollView, TextInput, Pressable, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { colors, fonts, space } from '../theme';
import NeoBox from '../components/NeoBox';
import NeoButton from '../components/NeoButton';
import { useStore } from '../store';
import { CATEGORIES, INCOME } from '../domain/categories';
import { Direction, Transaction } from '../domain/types';
import EncounterScreen from './EncounterScreen';

const SPEND_CATS = CATEGORIES.filter((c) => c.id !== INCOME);

function sameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}
function dateChipLabel(d: Date) {
  const now = new Date();
  if (sameDay(d, now)) return 'Today';
  if (sameDay(d, new Date(now.getTime() - 86400000))) return 'Yesterday';
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
}

function SegToggle({ value, onChange, reviewCount }: { value: 'add' | 'review'; onChange: (v: 'add' | 'review') => void; reviewCount: number }) {
  const Item = ({ k, label }: { k: 'add' | 'review'; label: string }) => {
    const on = value === k;
    return (
      <Pressable onPress={() => onChange(k)} style={{ flex: 1 }}>
        <View style={{ borderWidth: 3, borderColor: colors.ink, backgroundColor: on ? colors.brand : colors.paper, paddingVertical: 11, alignItems: 'center' }}>
          <Text style={{ fontFamily: fonts.heading, fontSize: 14, letterSpacing: 0.5, textTransform: 'uppercase', color: on ? colors.paper : colors.ink }}>{label}</Text>
        </View>
      </Pressable>
    );
  };
  return (
    <View style={{ flexDirection: 'row' }}>
      <Item k="add" label="Add manually" />
      <View style={{ width: 8 }} />
      <Item k="review" label={`Review${reviewCount ? ` (${reviewCount})` : ''}`} />
    </View>
  );
}

function DirButton({ dir, active, onPress }: { dir: Direction; active: boolean; onPress: () => void }) {
  const isSpent = dir === 'debit';
  const fill = isSpent ? colors.loss : colors.gain;
  return (
    <Pressable style={{ flex: 1 }} onPress={onPress}>
      <NeoBox offset={active ? 4 : 0} bg={active ? fill : colors.paper} contentStyle={{ paddingVertical: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
        <Ionicons name={isSpent ? 'arrow-down' : 'arrow-up'} size={18} color={active ? colors.paper : colors.ink} />
        <Text style={{ fontFamily: fonts.heading, fontSize: 16, textTransform: 'uppercase', color: active ? colors.paper : colors.ink }}>{isSpent ? 'Spent' : 'Received'}</Text>
      </NeoBox>
    </Pressable>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return <Text style={{ fontFamily: fonts.label, fontSize: 13, letterSpacing: 1, color: colors.inkSoft, textTransform: 'uppercase' }}>{children}</Text>;
}

function ManualForm() {
  const addTransaction = useStore((s) => s.addTransaction);
  const currency = useStore((s) => s.currency);

  const [dir, setDir] = useState<Direction>('debit');
  const [amount, setAmount] = useState('');
  const [merchant, setMerchant] = useState('');
  const [cat, setCat] = useState('food');
  const [date, setDate] = useState(new Date());
  const [showPicker, setShowPicker] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [justSaved, setJustSaved] = useState<string | null>(null);

  const onDateChange = (e: DateTimePickerEvent, d?: Date) => {
    if (Platform.OS !== 'ios') setShowPicker(false);
    if (e.type === 'set' && d) setDate(d);
    if (e.type === 'dismissed') setShowPicker(false);
  };

  const save = () => {
    const num = parseFloat(amount);
    if (!merchant.trim() || !num || num <= 0) {
      setError('Enter a name and an amount greater than 0.');
      return;
    }
    const t: Transaction = {
      id: 'manual-' + Date.now(),
      amountMinor: Math.round(num * 100),
      currency,
      direction: dir,
      merchant: merchant.trim(),
      categoryId: dir === 'credit' ? INCOME : cat,
      ts: date.getTime(),
      source: 'manual',
      status: 'confirmed',
    };
    addTransaction(t);
    setJustSaved(`${dir === 'debit' ? '−' : '+'}₹${num.toLocaleString('en-IN')} · ${t.merchant}`);
    setAmount('');
    setMerchant('');
    setError(null);
  };

  const boxBorder = { borderWidth: 3, borderColor: colors.ink, backgroundColor: colors.surfaceLow } as const;

  return (
    <View style={{ gap: space.lg }}>
      <Text style={{ fontFamily: fonts.display, fontSize: 26, color: colors.ink }}>Log a spend</Text>

      {/* spent / received */}
      <View style={{ flexDirection: 'row', gap: space.sm }}>
        <DirButton dir="debit" active={dir === 'debit'} onPress={() => setDir('debit')} />
        <DirButton dir="credit" active={dir === 'credit'} onPress={() => setDir('credit')} />
      </View>

      {/* amount with ₹ prefix */}
      <View style={{ gap: 6 }}>
        <Label>Amount</Label>
        <View style={{ ...boxBorder, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12 }}>
          <Text style={{ fontFamily: fonts.money, fontSize: 26, color: colors.reward, marginRight: 8 }}>₹</Text>
          <TextInput
            value={amount}
            onChangeText={setAmount}
            keyboardType="numeric"
            placeholder="0"
            placeholderTextColor={colors.inkSoft}
            style={{ flex: 1, fontFamily: fonts.money, fontSize: 26, color: colors.ink, paddingVertical: 10 }}
          />
        </View>
      </View>

      {/* merchant / source */}
      <View style={{ gap: 6 }}>
        <Label>{dir === 'debit' ? 'Merchant' : 'Source'}</Label>
        <TextInput
          value={merchant}
          onChangeText={setMerchant}
          placeholder={dir === 'debit' ? 'e.g. Swiggy' : 'e.g. Salary'}
          placeholderTextColor={colors.inkSoft}
          style={{ ...boxBorder, fontFamily: fonts.body, fontSize: 16, color: colors.ink, paddingHorizontal: 12, paddingVertical: 12 }}
        />
      </View>

      {/* category (spend only) */}
      {dir === 'debit' && (
        <View style={{ gap: 8 }}>
          <Label>Category</Label>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: space.sm }}>
            {SPEND_CATS.map((c) => {
              const on = cat === c.id;
              return (
                <Pressable key={c.id} onPress={() => setCat(c.id)}>
                  <View style={{ borderWidth: 2, borderColor: on ? colors.brand : colors.ink, backgroundColor: on ? colors.brand : 'transparent', paddingHorizontal: 10, paddingVertical: 6 }}>
                    <Text style={{ fontFamily: fonts.label, fontSize: 12, letterSpacing: 0.5, textTransform: 'uppercase', color: on ? colors.paper : colors.ink }}>{c.name}</Text>
                  </View>
                </Pressable>
              );
            })}
          </View>
        </View>
      )}

      {/* date */}
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
        <Label>Date</Label>
        <Pressable onPress={() => setShowPicker((v) => !v)}>
          <View style={{ borderWidth: 2, borderColor: colors.ink, flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 10, paddingVertical: 6 }}>
            <Ionicons name="calendar-outline" size={15} color={colors.ink} />
            <Text style={{ fontFamily: fonts.label, fontSize: 13, letterSpacing: 0.4, textTransform: 'uppercase', color: colors.ink }}>{dateChipLabel(date)}</Text>
          </View>
        </Pressable>
      </View>
      {showPicker && (
        <DateTimePicker value={date} mode="date" maximumDate={new Date()} onChange={onDateChange} display={Platform.OS === 'ios' ? 'inline' : 'default'} />
      )}

      {error && <Text style={{ fontFamily: fonts.body, fontSize: 13, color: colors.loss }}>{error}</Text>}
      {justSaved && <Text style={{ fontFamily: fonts.body, fontSize: 13, color: colors.gain }}>✓ Added {justSaved}</Text>}

      <NeoButton label="Add to Ledger" variant="primary" onPress={save} />
    </View>
  );
}

export default function AddScreen() {
  const txns = useStore((s) => s.transactions);
  const reviewCount = txns.filter((t) => t.status === 'needs_review').length;
  const [mode, setMode] = useState<'add' | 'review'>('add');

  return (
    <View style={{ flex: 1 }}>
      <View style={{ paddingHorizontal: space.md, paddingTop: space.md }}>
        <SegToggle value={mode} onChange={setMode} reviewCount={reviewCount} />
      </View>
      {mode === 'add' ? (
        <ScrollView contentContainerStyle={{ padding: space.md, paddingBottom: 48 }} keyboardShouldPersistTaps="handled">
          <ManualForm />
        </ScrollView>
      ) : (
        <EncounterScreen />
      )}
    </View>
  );
}
