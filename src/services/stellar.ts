import * as StellarSdk from '@stellar/stellar-sdk';
import * as ExpoCrypto from 'expo-crypto';
import { Buffer } from 'buffer';

const server = new StellarSdk.Horizon.Server(
  process.env.EXPO_PUBLIC_STELLAR_HORIZON_URL || 'https://horizon-testnet.stellar.org'
);

/**
 * Generates a new Stellar Keypair.
 * This function returns both the public and secret keys.
 * The secret key MUST be stored securely using SecureStore.
 */
export const generateKeypair = () => {
  const seed = ExpoCrypto.getRandomValues(new Uint8Array(32));
  const keypair = StellarSdk.Keypair.fromRawEd25519Seed(Buffer.from(seed));
  return {
    publicKey: keypair.publicKey(),
    secretKey: keypair.secret(),
  };
};

/**
 * Horizon returns 404 for accounts that don't exist on the network yet
 * (i.e. never funded). The SDK surfaces this as a NotFoundError with the
 * message "Not Found", while our own wrapper throws "Account not found".
 */
const isNotFoundError = (error: any): boolean =>
  error?.response?.status === 404 || /not found/i.test(error?.message || '');

/**
 * Helper to fetch account details including balances.
 */
export const fetchAccountDetails = async (publicKey: string) => {
  try {
    const account = await server.loadAccount(publicKey);
    return account;
  } catch (error: any) {
    if (error.response && error.response.status === 404) {
      throw new Error('Account not found on the network. Please fund it first.');
    }
    throw error;
  }
};

/**
 * Fetch the XLM balance for a given public key.
 */
export const fetchXlmBalance = async (publicKey: string): Promise<string> => {
  try {
    const accountBalance = await getBalance(publicKey, sdkConfig);
    return accountBalance.nativeBalance;
  } catch (error: unknown) {
    // If account is not found (unfunded), balance is 0
    if (isNotFoundError(error)) {
      return '0.0000000';
    }
    throw error;
  }
};

/**
 * Fetch recent transactions for a given public key.
 */
export const fetchRecentTransactions = async (
  publicKey: string,
  limit: number = 20
): Promise<PaymentRecord[]> => {
  try {
    const response = await server
      .operations()
      .forAccount(publicKey)
      .order('desc')
      .limit(limit)
      .call();

    return response.records;
  } catch (error: any) {
    if (isNotFoundError(error)) {
      return [];
    }
    console.error('Error fetching transactions:', error);
    throw error;
  }
};

/**
 * Send XLM to a destination address.
 */
export const sendXlmTransaction = async (
  secretKey: string,
  destinationPublicKey: string,
  amount: string,
  memoText?: string
) => {
  try {
    const sourceKeypair = StellarSdk.Keypair.fromSecret(secretKey);
    const sourcePublicKey = sourceKeypair.publicKey();

    const account = await server.loadAccount(sourcePublicKey);
    const fee = await server.fetchBaseFee();

    let transactionBuilder = new StellarSdk.TransactionBuilder(account, {
      fee: fee.toString(),
      networkPassphrase: process.env.EXPO_PUBLIC_STELLAR_NETWORK_PASSPHRASE || StellarSdk.Networks.TESTNET,
    });

    transactionBuilder.addOperation(
      StellarSdk.Operation.payment({
        destination: destinationPublicKey,
        asset: StellarSdk.Asset.native(),
        amount: amount,
      })
    );

    if (memoText) {
      transactionBuilder.addMemo(StellarSdk.Memo.text(memoText));
    }

    transactionBuilder.setTimeout(30);
    const transaction = transactionBuilder.build();
    transaction.sign(sourceKeypair);

    const response = await server.submitTransaction(transaction);
    return response;
  } catch (error: any) {
    console.error('Error sending transaction:', error?.response?.data || error);
    throw new Error(error?.response?.data?.extras?.result_codes?.transaction || 'Transaction failed');
  }
};

const isAccountNotFoundError = (error: unknown): boolean =>
  typeof error === 'object' &&
  error !== null &&
  'code' in error &&
  error.code === 'ACCOUNT_NOT_FOUND';

/**
 * MOCK SERVICE WRAPPERS FOR SOROBAN SAVINGS VAULT
 *
 * Used as a fallback by the vault store when EXPO_PUBLIC_VAULT_CONTRACT_ID
 * is not set. The real Soroban implementations live in ./vault.ts.
 */

export const mockConnectVault = async (publicKey: string): Promise<boolean> => {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  return true;
};

export const mockFetchVaultBalance = async (publicKey: string): Promise<string> => {
  await new Promise(resolve => setTimeout(resolve, 500));
  return '0.0000000'; // Default placeholder
};

export const mockDepositToVault = async (secretKey: string, amount: string): Promise<boolean> => {
  await new Promise(resolve => setTimeout(resolve, 1500));
  return true;
};

export const mockWithdrawFromVault = async (secretKey: string, amount: string): Promise<boolean> => {
  await new Promise(resolve => setTimeout(resolve, 1500));
  return true;
};
