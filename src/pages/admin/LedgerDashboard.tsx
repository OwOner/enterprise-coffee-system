// src/pages/admin/LedgerDashboard.tsx
import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';

// Complex type definitions reflecting our relational Postgres schema
interface Account {
  name: string;
  type: string;
}

interface JournalLine {
  id: string;
  debit_cents: number;
  credit_cents: number;
  accounts: Account;
}

interface JournalEntry {
  id: string;
  created_at: string;
  reference_type: string;
  description: string;
  journal_lines: JournalLine[];
}

export default function LedgerDashboard() {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchLedger() {
      // Supabase Relational Query: Fetching headers, lines, and account names in one network request
      const { data, error } = await supabase
        .from('journal_entries')
        .select(`
          id,
          created_at,
          reference_type,
          description,
          journal_lines (
            id,
            debit_cents,
            credit_cents,
            accounts (
              name,
              type
            )
          )
        `)
        .order('created_at', { ascending: false })
        .limit(50);

      if (!error && data) {
        // Supabase returns related data as unknown types by default, so we cast it for strict UI rendering
        setEntries(data as unknown as JournalEntry[]);
      }
      setLoading(false);
    }
    fetchLedger();
  }, []);

  return (
    <div className="flex flex-col gap-6 w-full">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 flex flex-col gap-6">
        
        <div className="flex flex-col border-b border-gray-200 pb-4">
          <h2 className="text-xl font-bold text-gray-900">General Ledger</h2>
          <p className="text-sm text-gray-500">Immutable record of all financial transactions.</p>
        </div>

        {loading ? (
          <div className="py-12 text-center text-gray-500 font-medium animate-pulse">
            Decrypting ledger records...
          </div>
        ) : entries.length === 0 ? (
          <div className="py-12 text-center text-gray-500">
            The ledger is currently empty. Process a POS transaction to begin.
          </div>
        ) : (
          <div className="flex flex-col gap-6">
            {entries.map((entry) => (
              <div key={entry.id} className="border border-gray-200 rounded-lg overflow-hidden">
                {/* Transaction Header */}
                <div className="bg-gray-50 border-b border-gray-200 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex flex-col">
                    <span className="font-semibold text-gray-900">{entry.description}</span>
                    <span className="text-xs text-gray-500 font-mono">
                      {new Date(entry.created_at).toLocaleString()} | REF: {entry.reference_type}
                    </span>
                  </div>
                  <span className="text-xs text-gray-400 font-mono tracking-wider">
                    TXN: {entry.id.split('-')[0]}
                  </span>
                </div>

                {/* Double-Entry Lines Table */}
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm border-collapse">
                    <thead>
                      <tr className="bg-white text-gray-500 border-b border-gray-100">
                        <th className="p-3 font-medium">Account</th>
                        <th className="p-3 font-medium text-right">Debit</th>
                        <th className="p-3 font-medium text-right">Credit</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {entry.journal_lines.map((line) => (
                        <tr key={line.id} className="hover:bg-gray-50 transition-colors">
                          <td className="p-3 font-medium text-gray-800">
                            {line.accounts?.name || 'Unknown Account'}
                          </td>
                          <td className="p-3 text-right font-mono text-gray-600">
                            {line.debit_cents > 0 ? `$${(line.debit_cents / 100).toFixed(2)}` : '-'}
                          </td>
                          <td className="p-3 text-right font-mono text-gray-600">
                            {line.credit_cents > 0 ? `$${(line.credit_cents / 100).toFixed(2)}` : '-'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}