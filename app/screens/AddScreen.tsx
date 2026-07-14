import React, { useState } from 'react';
import { View, Text, ScrollView, TextInput, Pressable, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { colors, fonts, space } from '../theme';
import NeoBox from '../components/NeoBox';
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

/** Black-bar mode toggle (ADD MANUALLY / REVIEW) — matches Stitch. */
function ModeToggle({ value, onChange, reviewCount }: { value: 'add' | 'review'; onChange: (v: 'add' | 'review') => void; reviewCount: number }) {
  const Seg = ({ k, label }: { k: 'add' | 'review'; label: string }) => {
    const on = value === k;
    return (
      <Pressable style={{ flex: 1 }} onPress={() => onChange(k)}>
        <View style={{ backgroundColor: on ? colors.brand : 'transparent', paddingVertical: 12, alignItems: 'center' }}>
          <Text style={{ fontFamily: fonts.heading, fontSize: 14, letterSpacing: 1, textTransform: 'uppercase', color: colors.white }}>{label}</Text>
        </View>
      </Pressable>
    );
  };
  return (
    <NeoBox bg={colors.ink} borderColor={colors.ink} offset={4} style={{ alignSelf: 'stretch' }} contentStyle={{ flexDirection: 'row', padding: 4 }}>
      <Seg k="add" label="Add manually" />
      <Seg k="review" label={`Review${reviewCount ? ` (${reviewCount})` : ''}`} />
    </NeoBox>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return <Text style={{ fontFamily: fonts.label, fontSize: 12, letterSpacing: 1, color: colors.inkSoft, textTransform: 'uppercase', marginBottom: 8, opacity: 0.9 }}>{children}</Text>;
}

function DirButton({ dir, active, onPress }: { dir: Direction; active: boolean; onPress: () => void }) {
  const isSpent = dir === 'debit';
  const semantic = isSpent ? colors.loss : colors.gain;
  return (
    <Pressable style={{ flex: 1 }} onPress={onPress}>
      <NeoBox
        bg={active ? semantic : colors.paper}
        offset={active ? 4 : 2}
        style={{ alignSelf: 'stretch' }}
        contentStyle={{ paddingVertical: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 }}
      >
        <Ionicons name={isSpent ? 'arrow-down' : 'arrow-up'} size={18} color={active ? colors.white : semantic} />
        <Text style={{ fontFamily: fonts.heading, fontSize: 16, textTransform: 'uppercase', color: active ? colors.white : semantic }}>{isSpent ? 'Spent' : 'Received'}</Text>
      </NeoBox>
    </Pressable>
  );
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
    addTransaction({
      id: 'manual-' + Date.now(),
      amountMinor: Math.round(num * 100),
      currency,
      direction: dir,
      merchant: merchant.trim(),
      categoryId: dir === 'credit' ? INCOME : cat,
      ts: date.getTime(),
      source: 'manual',
      status: 'confirmed',
    });
    setJustSaved(`${dir === 'debit' ? '−' : '+'}₹${num.toLocaleString('en-IN')} · ${merchant.trim()}`);
    setAmount('');
    setMerchant('');
    setError(null);
  };

  return (
    <View style={{ gap: space.xl }}>
      {/* Spent / Received */}
      <View style={{ flexDirection: 'row', gap: space.md }}>
        <DirButton dir="debit" active={dir === 'debit'} onPress={() => setDir('debit')} />
        <DirButton dir="credit" active={dir === 'credit'} onPress={() => setDir('credit')} />
      </View>

      {/* Amount — big */}
      <View>
        <Label>Amount</Label>
        <NeoBox bg={colors.white} offset={4} style={{ alignSelf: 'stretch' }} contentStyle={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16 }}>
          <Text style={{ fontFamily: fonts.display, fontSize: 34, color: colors.reward, marginRight: 10 }}>₹</Text>
          <TextInput
            value={amount}
            onChangeText={setAmount}
            keyboardType="numeric"
            placeholder="0"
            placeholderTextColor={colors.inkSoft}
            style={{ flex: 1, fontFamily: fonts.money, fontSize: 44, color: colors.ink, paddingVertical: 16 }}
          />
        </NeoBox>
      </View>

      {/* Merchant */}
      <View>
        <Label>{dir === 'debit' ? 'Merchant' : 'Source'}</Label>
        <NeoBox bg={colors.white} offset={2} style={{ alignSelf: 'stretch' }} contentStyle={{ paddingHorizontal: 16 }}>
          <TextInput
            value={merchant}
            onChangeText={setMerchant}
            placeholder={dir === 'debit' ? 'e.g. Swiggy' : 'e.g. Salary'}
            placeholderTextColor={colors.inkSoft}
            style={{ fontFamily: fonts.body, fontSize: 16, color: colors.ink, paddingVertical: 14 }}
          />
        </NeoBox>
      </View>

      {/* Category */}
      {dir === 'debit' && (
        <View>
          <Label>Category</Label>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
            {SPEND_CATS.map((c) => {
              const on = cat === c.id;
              return (
                <Pressable key={c.id} onPress={() => setCat(c.id)}>
                  <NeoBox bg={on ? colors.brand : colors.white} offset={2} contentStyle={{ paddingHorizontal: 14, paddingVertical: 8 }}>
                    <Text style={{ fontFamily: fonts.label, fontSize: 12, letterSpacing: 0.5, textTransform: 'uppercase', color: on ? colors.white : colors.ink }}>{c.name}</Text>
                  </NeoBox>
                </Pressable>
              );
            })}
          </View>
        </View>
      )}

      {/* Date */}
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
        <Text style={{ fontFamily: fonts.label, fontSize: 12, letterSpacing: 1, color: colors.inkSoft, textTransform: 'uppercase' }}>Date:</Text>
        <Pressable onPress={() => setShowPicker((v) => !v)}>
          <NeoBox bg={colors.white} offset={2} contentStyle={{ flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 12, paddingVertical: 7 }}>
            <Ionicons name="calendar-outline" size={15} color={colors.ink} />
            <Text style={{ fontFamily: fonts.label, fontSize: 12, letterSpacing: 0.5, textTransform: 'uppercase', color: colors.ink }}>{dateChipLabel(date)}</Text>
          </NeoBox>
        </Pressable>
      </View>
      {showPicker && (
        <DateTimePicker value={date} mode="date" maximumDate={new Date()} onChange={onDateChange} display={Platform.OS === 'ios' ? 'inline' : 'default'} />
      )}

      {error && <Text style={{ fontFamily: fonts.body, fontSize: 13, color: colors.loss }}>{error}</Text>}
      {justSaved && <Text style={{ fontFamily: fonts.body, fontSize: 13, color: colors.gain }}>✓ Added {justSaved}</Text>}

      {/* CTA */}
      <Pressable onPress={save}>
        <NeoBox bg={colors.brand} offset={6} style={{ alignSelf: 'stretch' }} contentStyle={{ paddingVertical: 20, alignItems: 'center' }}>
          <Text style={{ fontFamily: fonts.heading, fontSize: 18, letterSpacing: 2, textTransform: 'uppercase', color: colors.white }}>Add to Ledger</Text>
        </NeoBox>
      </Pressable>
    </View>
  );
}

export default function AddScreen() {
  const txns = useStore((s) => s.transactions);
  const reviewCount = txns.filter((t) => t.status === 'needs_review').length;
  const [mode, setMode] = useState<'add' | 'review'>('add');

  return (
    <View style={{ flex: 1 }}>
      <View style={{ paddingHorizontal: space.md, paddingTop: space.md, paddingBottom: 4 }}>
        <ModeToggle value={mode} onChange={setMode} reviewCount={reviewCount} />
      </View>
      {mode === 'add' ? (
        <ScrollView contentContainerStyle={{ padding: space.md, paddingTop: space.lg, paddingBottom: 56 }} keyboardShouldPersistTaps="handled">
          <ManualForm />
        </ScrollView>
      ) : (
        <EncounterScreen />
      )}
    </View>
  );
}
