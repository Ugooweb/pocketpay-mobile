jest.mock('../src/services/stellar', () => ({
  fetchXlmBalance: jest.fn(async () => '0.0000000'),
  fetchRecentTransactions: jest.fn(async () => []),
}));

jest.mock('@stellar/stellar-sdk', () => ({
  Keypair: {
    fromSecret: jest.fn((secret: string) => {
      if (secret === 'SVALIDSECRET') {
        return { publicKey: () => 'GPUBLICKEY' };
      }
      throw new Error(`invalid secret ${secret}`);
    }),
  },
}));

import * as SecureStore from 'expo-secure-store';
import { useWalletStore } from '../src/store/walletStore';

const mockedSecureStore = SecureStore as jest.Mocked<typeof SecureStore>;

const resetStore = () => {
  useWalletStore.setState({
    publicKey: null,
    balance: '0.0000000',
    transactions: [],
    isLoading: false,
    error: null,
  });
};

describe('walletStore secure storage handling', () => {
  let consoleErrorSpy: jest.SpyInstance;
  let consoleWarnSpy: jest.SpyInstance;

  beforeEach(() => {
    jest.clearAllMocks();
    resetStore();
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => undefined);
    consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation(() => undefined);
    mockedSecureStore.setItemAsync.mockResolvedValue(undefined);
    mockedSecureStore.getItemAsync.mockResolvedValue(null);
    mockedSecureStore.deleteItemAsync.mockResolvedValue(undefined);
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
    consoleWarnSpy.mockRestore();
  });

  it('does not activate a created or imported wallet when secure storage write fails', async () => {
    mockedSecureStore.setItemAsync.mockRejectedValueOnce(new Error('disk full SVALIDSECRET'));

    const saved = await useWalletStore.getState().setWallet('GPUBLICKEY', 'SVALIDSECRET');

    expect(saved).toBe(false);
    expect(useWalletStore.getState().publicKey).toBeNull();
    expect(useWalletStore.getState().error).toBe('Failed to persist wallet securely');
    expect(consoleErrorSpy).toHaveBeenCalledWith('Failed to persist wallet securely');
    expect(JSON.stringify(consoleErrorSpy.mock.calls)).not.toContain('SVALIDSECRET');
  });

  it('restores a valid stored secret and derives the public key', async () => {
    mockedSecureStore.getItemAsync.mockResolvedValueOnce('SVALIDSECRET');

    const restored = await useWalletStore.getState().loadWalletFromStorage();

    expect(restored).toBe(true);
    expect(useWalletStore.getState().publicKey).toBe('GPUBLICKEY');
    expect(useWalletStore.getState().error).toBeNull();
  });

  it('handles missing stored values without crashing', async () => {
    useWalletStore.setState({ publicKey: 'GOLDPUBLICKEY' });
    mockedSecureStore.getItemAsync.mockResolvedValueOnce(null);

    const restored = await useWalletStore.getState().loadWalletFromStorage();

    expect(restored).toBe(false);
    expect(useWalletStore.getState().publicKey).toBeNull();
    expect(useWalletStore.getState().error).toBeNull();
  });

  it.each(['', '{"secretKey":', '{"publicKey":"GPUBLICKEY"}', 'not-a-valid-secret'])(
    'clears unsafe stored wallet values during restore: %s',
    async (storedValue) => {
      mockedSecureStore.getItemAsync.mockResolvedValueOnce(storedValue);

      const restored = await useWalletStore.getState().loadWalletFromStorage();

      expect(restored).toBe(false);
      expect(useWalletStore.getState().publicKey).toBeNull();
      expect(useWalletStore.getState().error).toBe('Failed to restore wallet securely');
      expect(mockedSecureStore.deleteItemAsync).toHaveBeenCalledWith('pocketpay_wallet_secret');
      if (storedValue) {
        expect(JSON.stringify(consoleErrorSpy.mock.calls)).not.toContain(storedValue);
        expect(JSON.stringify(consoleWarnSpy.mock.calls)).not.toContain(storedValue);
      }
    }
  );

  it('does not clear active wallet state when secure storage deletion fails', async () => {
    useWalletStore.setState({ publicKey: 'GPUBLICKEY', balance: '10.0000000' });
    mockedSecureStore.deleteItemAsync.mockRejectedValueOnce(new Error('delete failed'));

    const cleared = await useWalletStore.getState().clearWallet();

    expect(cleared).toBe(false);
    expect(useWalletStore.getState().publicKey).toBe('GPUBLICKEY');
    expect(useWalletStore.getState().balance).toBe('10.0000000');
    expect(useWalletStore.getState().error).toBe('Failed to clear wallet securely');
  });
});

