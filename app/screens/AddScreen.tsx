import React, { useState } from 'react';
import { View, Text, ScrollView, TextInput, Pressable } from 'react-native';
import { colors, fonts, space } from '../theme';
import NeoBox from '../components/NeoBox';
import NeoButton from '../components/NeoButton';
import { useStore } from '../store';
import { CATEGORIES, INCOME } from '../domain/categories';
import { Direction, Transaction } from '../domain/types';
import EncounterScreen from './EncounterScreen';

const SPEND_CATS = CATEGORIES.filter((c) => c.id !== INCOME);

function SegToggle({
  left,
  right,
  value,
  onChange,
}: {
  left: string;
  right: string;
  value: 'add' | 'review';
  onChange: (v: 'add' | 'review') => void;
}) {
  const Item = ({ k, label }: { k: 'add' | 'review'; label: string }) => {
    const on = value === k;
    return (
      <Pressable onPress={() => onChange(k)} style={{ flex: 1 }}>
        <View
          style={{
            borderWidth: 3,
            borderColor: colors.ink,
            backgroundColor: on ? colors.brand : colors.paper,
            paddingVertical: 10,
            alignItems: 'center',
          }}
        >
          <Text style={{ fontFamily: fonts.heading, fontSize: 14, letterSpacing: 0.5, textTransform: 'uppercase', color: on ? colors.paper : colors.ink }}>
            {label}
          </Text>
        </View>
      </Pressable>
    );
  };
  return (
    <View style={{ flexDirection: 'row', gap: -3 }}>
      <Item k="add" label={left} />
      <Item k="review" label={right} />
    </View>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <View style={{ gap: 6 }}>
      <Text style={{ fontFamily: fonts.label, fontSize: 13, letterSpacing: 1, color: colors.inkSoft, textTransform: 'uppercase' }}>{label}</Text>
      {children}
    </View>
  );
}

function ManualForm() {
  const addTransaction = useStore((s) => s.addTransaction);
  const currency = useStore((s) => s.currency);

  const [dir, setDir] = useState<Direction>('debit');
  const [amount, setAmount] = useState('');
  const [merchant, setMerchant] = useState('');
  const [cat, setCat] = useState('food');
  const [error, setError] = useState<string | null>(null);
  const [justSaved, setJustSaved] = useState<string | null>(null);

  const save = () => {
    const num = parseFloat(amount);
    if (!merchant.trim() || !num || num <= 0) {
      setError('Enter a merchant and an amount greater than 0.');
      return;
    }
    const t: Transaction = {
      id: 'manual-' + Date.now(),
      amountMinor: Math.round(num * 100),
      currency,
      direction: dir,
      merchant: merchant.trim(),
      categoryId: dir === 'credit' ? INCOME : cat,
      ts: Date.now(),
      source: 'manual',
      status: 'confirmed',
    };
    addTransaction(t);
    setJustSaved(`${dir === 'debit' ? '−' : '+'}₹${num.toLocaleString('en-IN')} · ${t.merchant}`);
    setAmount('');
    setMerchant('');
    setError(null);
  };

  const inputStyle = {
    borderWidth: 3,
    borderColor: colors.ink,
    backgroundColor: colors.surfaceLow,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: colors.ink,
  } as const;

  return (
    <View style={{ gap: space.md }}>
      {/* spent / received */}
      <View style={{ flexDirection: 'row', gap: space.sm }}>
        <Pressable style={{ flex: 1 }} onPress={() => setDir('debit')}>
          <NeoBox offset={0} bg={dir === 'debit' ? colors.loss : colors.paper} contentStyle={{ paddingVertical: 10, alignItems: 'center' }}>
            <Text style={{ fontFamily: fonts.heading, fontSize: 14, textTransform: 'uppercase', color: dir === 'debit' ? colors.paper : colors.ink }}>Spent</Text>
          </NeoBox>
        </Pressable>
        <Pressable style={{ flex: 1 }} onPress={() => setDir('credit')}>
          <NeoBox offset={0} bg={dir === 'credit' ? colors.gain : colors.paper} contentStyle={{ paddingVertical: 10, alignItems: 'center' }}>
            <Text style={{ fontFamily: fonts.heading, fontSize: 14, textTransform: 'uppercase', color: dir === 'credit' ? colors.paper : colors.ink }}>Received</Text>
          </NeoBox>
        </Pressable>
      </View>

      <Field label="Amount (₹)">
        <TextInput
          value={amount}
          onChangeText={setAmount}
          keyboardType="numeric"
          placeholder="0"
          placeholderTextColor={colors.inkSoft}
          style={{ ...inputStyle, fontFamily: fonts.money, fontSize: 24 }}
        />
      </Field>

      <Field label={dir === 'debit' ? 'Merchant' : 'Source'}>
        <TextInput
          value={merchant}
          onChangeText={setMerchant}
          placeholder={dir === 'debit' ? 'e.g. Swiggy' : 'e.g. Salary'}
          placeholderTextColor={colors.inkSoft}
          style={{ ...inputStyle, fontFamily: fonts.body, fontSize: 16 }}
        />
      </Field>

      {dir === 'debit' && (
        <Field label="Category">
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: space.sm }}>
            {SPEND_CATS.map((c) => {
              const on = cat === c.id;
              return (
                <Pressable key={c.id} onPress={() => setCat(c.id)}>
                  <View style={{ borderWidth: 2, borderColor: on ? colors.brand : colors.ink, backgroundColor: on ? colors.brand : 'transparent', paddingHorizontal: 10, paddingVertical: 5 }}>
                    <Text style={{ fontFamily: fonts.label, fontSize: 12, letterSpacing: 0.5, textTransform: 'uppercase', color: on ? colors.paper : colors.ink }}>{c.name}</Text>
                  </View>
                </Pressable>
              );
            })}
          </View>
        </Field>
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
        <SegToggle left="Add manually" right={`Review${reviewCount ? ` (${reviewCount})` : ''}`} value={mode} onChange={setMode} />
      </View>
      {mode === 'add' ? (
        <ScrollView contentContainerStyle={{ padding: space.md, paddingBottom: 40, gap: space.md }} keyboardShouldPersistTaps="handled">
          <ManualForm />
        </ScrollView>
      ) : (
        <EncounterScreen />
      )}
    </View>
  );
}
