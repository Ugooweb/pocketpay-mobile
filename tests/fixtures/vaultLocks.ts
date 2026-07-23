import { Lock } from '../../src/store/vaultStore';

export const MOCK_VAULT_LOCKS: Lock[] = [
  {
    id: 'lock-1',
    amount: '100.0000000',
    unlockDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
    status: 'locked',
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days ago
  },
  {
    id: 'lock-2',
    amount: '50.5000000',
    unlockDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(), // 10 days ago (matured)
    status: 'matured',
    createdAt: new Date(Date.now() - 40 * 24 * 60 * 60 * 1000).toISOString(), // 40 days ago
  },
  {
    id: 'lock-3',
    amount: '200.0000000',
    unlockDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(), // 60 days from now
    status: 'locked',
    createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(), // 15 days ago
  },
  {
    id: 'lock-4',
    amount: '75.0000000',
    unlockDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago (matured)
    status: 'matured',
    createdAt: new Date(Date.now() - 32 * 24 * 60 * 60 * 1000).toISOString(), // 32 days ago
  },
];