/**
 * Representative sample messages (Indian bank / UPI / merchant formats).
 * Placeholder corpus for building & testing the parser until real emails are supplied.
 * Bodies are the kind of text found in bank alert emails / SMS.
 */

import { RawMessage } from './types';

export const SAMPLE_MESSAGES: RawMessage[] = [
  {
    id: 's1',
    source: 'gmail',
    sender: 'alerts@hdfcbank.net',
    ts: Date.parse('2026-07-13T20:42:00'),
    body: 'Sent Rs.487.00 From HDFC Bank A/C x1234 To SWIGGY BANGALORE On 13-07-26 UPI Ref 512345678901. Not you? Call 18002586161.',
  },
  {
    id: 's2',
    source: 'gmail',
    sender: 'credit_cards@icicibank.com',
    ts: Date.parse('2026-07-13T14:10:00'),
    body: 'INR 2,199.00 spent on ICICI Bank Card XX9012 at AMAZON on 13-Jul-26. Avl limit INR 1,20,000. Ref 90887766.',
  },
  {
    id: 's3',
    source: 'gmail',
    sender: 'alerts@hdfcbank.net',
    ts: Date.parse('2026-07-01T09:00:00'),
    body: 'Rs.52,000.00 credited to A/C xx1234 on 01-07-26 by SALARY JUL NEFT CR. Avl Bal Rs.83,450.00.',
  },
  {
    id: 's4',
    source: 'gmail',
    sender: 'noreply@upi.paytm',
    ts: Date.parse('2026-07-12T18:45:00'),
    body: 'You have paid Rs 236 to UBER INDIA via UPI. UPI Ref No 456789012345.',
  },
  {
    id: 's5',
    source: 'gmail',
    sender: 'orders@bigbasket.com',
    ts: Date.parse('2026-07-12T11:05:00'),
    body: 'Rs.1,340.00 debited from a/c **1234 on 12-Jul-26 to BIGBASKET SUPERMARKET GROCER. Ref 771122334455.',
  },
  {
    id: 's6',
    source: 'gmail',
    sender: 'alerts@hdfcbank.net',
    ts: Date.parse('2026-07-08T08:30:00'),
    body: 'Sent Rs.399.00 From HDFC Bank A/C x1234 To JIO PREPAID RECHARGE On 08-07-26 UPI Ref 220011889900.',
  },
  {
    id: 's7',
    source: 'gmail',
    sender: 'alerts@axisbank.com',
    ts: Date.parse('2026-07-06T13:20:00'),
    body: 'INR 640.00 debited from Axis a/c XX5678 on 06-Jul-26 to QWIKMART RETAIL 42. Ref 5566778899.',
  }, // unknown merchant -> needs_review
  {
    id: 's8',
    source: 'gmail',
    sender: 'no-reply@accounts.google.com',
    ts: Date.parse('2026-07-13T21:00:00'),
    body: 'Your OTP for login is 448291. Do not share it with anyone.',
  }, // not a transaction -> dropped
];
