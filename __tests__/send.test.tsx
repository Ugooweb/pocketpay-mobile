/**
 * Send Screen – Validation & Submit Behaviour Tests
 *
 * Acceptance criteria covered:
 *  AC1 – Invalid address error is tested (empty destination blocks submit)
 *  AC2 – Invalid amount error is tested (zero / negative amount blocks submit)
 *  AC3 – Submit is blocked when the form is invalid
 *  AC4 – Valid form calls sendXlmTransaction
 *  AC5 – Failure in sendXlmTransaction displays an error alert
 */

import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { Alert } from 'react-native';

// ─── Module mocks ─────────────────────────────────────────────────────────────

jest.mock('../src/services/stellar');
jest.mock('../src/store/walletStore');
jest.mock('pocketpay-sdk', () => ({ validatePublicKey: jest.fn(() => true) }));
jest.mock('expo-router');
jest.mock('lucide-react-native', () => ({ Send: () => null }));

// ─── Typed mock imports ───────────────────────────────────────────────────────

import { sendXlmTransaction } from '../src/services/stellar';
import { useWalletStore } from '../src/store/walletStore';
import { useRouter } from 'expo-router';

const mockSendXlmTransaction = sendXlmTransaction as jest.MockedFunction<typeof sendXlmTransaction>;
const mockUseWalletStore    = useWalletStore as jest.MockedFunction<typeof useWalletStore>;
const mockUseRouter         = useRouter     as jest.MockedFunction<typeof useRouter>;

import SendScreen from '../app/send';

// ─── Constants ────────────────────────────────────────────────────────────────

const VALID_DESTINATION = 'GBXXXXVALIDSTELLARADDRESS1234567890ABCDEFGHIJKLMNOPQRSTUVWX';
const VALID_AMOUNT      = '10';
const MOCK_SECRET       = 'SXXXXXXSECRETXXXXXXX';

// ─── Helpers ──────────────────────────────────────────────────────────────────

const mockBack = jest.fn();

function setupWalletStore(overrides: Record<string, unknown> = {}) {
  mockUseWalletStore.mockReturnValue({
    publicKey:            'GPUBLIC123',
    balance:              '100.0000000',
    transactions:         [],
    isLoading:            false,
    error:                null,
    getSecretKey:         jest.fn(async () => MOCK_SECRET),
    refreshWalletData:    jest.fn(),
    setWallet:            jest.fn(),
    loadWalletFromStorage: jest.fn(async () => true),
    clearWallet:          jest.fn(),
    ...overrides,
  } as any);
}

const alertSpy = jest.spyOn(Alert, 'alert').mockImplementation(() => undefined);

// ─── Lifecycle ────────────────────────────────────────────────────────────────

beforeEach(() => {
  jest.clearAllMocks();
  alertSpy.mockImplementation(() => undefined);
  mockUseRouter.mockReturnValue({ back: mockBack, push: jest.fn(), replace: jest.fn() } as any);
  setupWalletStore();
  mockSendXlmTransaction.mockResolvedValue({ hash: 'abc123' } as any);
});

// ─────────────────────────────────────────────────────────────────────────────
// AC1 – Invalid address error
// ─────────────────────────────────────────────────────────────────────────────

describe('AC1 – invalid address error', () => {
  it('shows an error alert when the destination address is empty', async () => {
    const { getByPlaceholderText, getByText } = render(<SendScreen />);

    // Leave destination empty, provide a valid amount only
    fireEvent.changeText(getByPlaceholderText('0.00'), VALID_AMOUNT);
    fireEvent.press(getByText('Send Payment'));

    expect(getByText('Please enter a destination address.')).toBeTruthy();
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// AC2 – Invalid amount error
// ─────────────────────────────────────────────────────────────────────────────

describe('AC2 – invalid amount error', () => {
  it('shows an error alert when the amount is zero', async () => {
    const { getByPlaceholderText, getByText } = render(<SendScreen />);

    fireEvent.changeText(getByPlaceholderText('G...'), VALID_DESTINATION);
    fireEvent.changeText(getByPlaceholderText('0.00'), '0');
    fireEvent.press(getByText('Send Payment'));

    expect(getByText('Amount must be more than 0.')).toBeTruthy();
  });

  it('shows an error alert when the amount is negative', async () => {
    const { getByPlaceholderText, getByText } = render(<SendScreen />);

    fireEvent.changeText(getByPlaceholderText('G...'), VALID_DESTINATION);
    fireEvent.changeText(getByPlaceholderText('0.00'), '-5');
    fireEvent.press(getByText('Send Payment'));

    expect(getByText('Please enter a valid number.')).toBeTruthy();
  });

  it('shows an error alert when the amount exceeds the balance', async () => {
    setupWalletStore({ balance: '5.0000000' });
    const { getByPlaceholderText, getByText } = render(<SendScreen />);

    fireEvent.changeText(getByPlaceholderText('G...'), VALID_DESTINATION);
    fireEvent.changeText(getByPlaceholderText('0.00'), '50');
    fireEvent.press(getByText('Send Payment'));

    expect(getByText("You don't have enough XLM for this payment.")).toBeTruthy();
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// AC3 – Submit is blocked when the form is invalid
// ─────────────────────────────────────────────────────────────────────────────

describe('AC3 – submit is blocked when the form is invalid', () => {
  it('does not call sendXlmTransaction with an empty destination', async () => {
    const { getByPlaceholderText, getByText } = render(<SendScreen />);

    fireEvent.changeText(getByPlaceholderText('0.00'), VALID_AMOUNT);
    fireEvent.press(getByText('Send Payment'));

    expect(getByText('Please enter a destination address.')).toBeTruthy();
    expect(mockSendXlmTransaction).not.toHaveBeenCalled();
  });

  it('does not call sendXlmTransaction with an invalid amount', async () => {
    const { getByPlaceholderText, getByText } = render(<SendScreen />);

    fireEvent.changeText(getByPlaceholderText('G...'), VALID_DESTINATION);
    fireEvent.changeText(getByPlaceholderText('0.00'), '0');
    fireEvent.press(getByText('Send Payment'));

    expect(getByText('Amount must be more than 0.')).toBeTruthy();
    expect(mockSendXlmTransaction).not.toHaveBeenCalled();
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// AC4 – Valid form calls sendXlmTransaction
// ─────────────────────────────────────────────────────────────────────────────

describe('AC4 – valid form calls sendXlmTransaction', () => {
  it('calls sendXlmTransaction with correct arguments on a valid submission', async () => {
    const { getByPlaceholderText, getByText } = render(<SendScreen />);

    fireEvent.changeText(getByPlaceholderText('G...'), VALID_DESTINATION);
    fireEvent.changeText(getByPlaceholderText('0.00'), VALID_AMOUNT);
    fireEvent.press(getByText('Send Payment'));

    await waitFor(() => {
      expect(mockSendXlmTransaction).toHaveBeenCalledWith(
        MOCK_SECRET, VALID_DESTINATION, VALID_AMOUNT, '',
      );
    });
  });

  it('passes memo text to sendXlmTransaction when provided', async () => {
    const { getByPlaceholderText, getByText } = render(<SendScreen />);

    fireEvent.changeText(getByPlaceholderText('G...'), VALID_DESTINATION);
    fireEvent.changeText(getByPlaceholderText('0.00'), VALID_AMOUNT);
    fireEvent.changeText(getByPlaceholderText('Payment reference'), 'invoice-42');
    fireEvent.press(getByText('Send Payment'));

    await waitFor(() => {
      expect(mockSendXlmTransaction).toHaveBeenCalledWith(
        MOCK_SECRET, VALID_DESTINATION, VALID_AMOUNT, 'invoice-42',
      );
    });
  });

  it('shows a success alert after a successful send', async () => {
    const { getByPlaceholderText, getByText } = render(<SendScreen />);

    fireEvent.changeText(getByPlaceholderText('G...'), VALID_DESTINATION);
    fireEvent.changeText(getByPlaceholderText('0.00'), VALID_AMOUNT);
    fireEvent.press(getByText('Send Payment'));

    await waitFor(() => {
      expect(alertSpy).toHaveBeenCalledWith(
        'Success',
        'Transaction sent successfully!',
        expect.arrayContaining([expect.objectContaining({ text: 'OK' })]),
      );
    });
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// AC5 – Failure displays an error
// ─────────────────────────────────────────────────────────────────────────────

describe('AC5 – failure displays error', () => {
  it('shows a "Transaction Failed" alert with the error message when sendXlmTransaction throws', async () => {
    mockSendXlmTransaction.mockRejectedValueOnce(new Error('tx_bad_seq'));
    const { getByPlaceholderText, getByText } = render(<SendScreen />);

    fireEvent.changeText(getByPlaceholderText('G...'), VALID_DESTINATION);
    fireEvent.changeText(getByPlaceholderText('0.00'), VALID_AMOUNT);
    fireEvent.press(getByText('Send Payment'));

    await waitFor(() => {
      expect(alertSpy).toHaveBeenCalledWith('Transaction Failed', 'tx_bad_seq');
    });
  });

  it('shows a generic error message when the error has no message', async () => {
    mockSendXlmTransaction.mockRejectedValueOnce({});
    const { getByPlaceholderText, getByText } = render(<SendScreen />);

    fireEvent.changeText(getByPlaceholderText('G...'), VALID_DESTINATION);
    fireEvent.changeText(getByPlaceholderText('0.00'), VALID_AMOUNT);
    fireEvent.press(getByText('Send Payment'));

    await waitFor(() => {
      expect(alertSpy).toHaveBeenCalledWith(
        'Transaction Failed', 'An error occurred while sending.',
      );
    });
  });

  it('does NOT call router.back after a failed send', async () => {
    mockSendXlmTransaction.mockRejectedValueOnce(new Error('network error'));
    const { getByPlaceholderText, getByText } = render(<SendScreen />);

    fireEvent.changeText(getByPlaceholderText('G...'), VALID_DESTINATION);
    fireEvent.changeText(getByPlaceholderText('0.00'), VALID_AMOUNT);
    fireEvent.press(getByText('Send Payment'));

    await waitFor(() => expect(alertSpy).toHaveBeenCalled());
    expect(mockBack).not.toHaveBeenCalled();
  });
});
