/**
 * NetworkStatusBanner – component tests
 *
 * Acceptance criteria covered:
 *  AC-NB1 – Banner is not rendered when networkErrorType is 'none'.
 *  AC-NB2 – Banner is rendered for 'offline'.
 *  AC-NB3 – Banner is rendered for 'service-unavailable'.
 *  AC-NB4 – Retry button calls onRetry when tapped.
 *  AC-NB5 – Retry button is disabled while isRetrying is true.
 *  AC-NB6 – App does not crash when rendered with any valid props.
 */

import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';

jest.mock('lucide-react-native', () => ({
  WifiOff: () => null,
  AlertTriangle: () => null,
  RefreshCw: () => null,
}));

import { NetworkStatusBanner } from '../src/components/NetworkStatusBanner';

const OFFLINE_MESSAGE = 'No internet connection. Check your network and try again.';
const SERVICE_MESSAGE = 'Stellar Testnet services appear unavailable. Please try again shortly.';

// ─── AC-NB1: Hidden when no error ────────────────────────────────────────────

describe('AC-NB1 – not rendered when networkErrorType is none', () => {
  it('returns null when type is "none"', () => {
    const { queryByTestId } = render(
      <NetworkStatusBanner
        networkErrorType="none"
        message=""
        onRetry={jest.fn()}
      />
    );
    expect(queryByTestId('network-status-banner')).toBeNull();
  });
});

// ─── AC-NB2: Offline banner ───────────────────────────────────────────────────

describe('AC-NB2 – offline banner', () => {
  it('renders the banner and message when type is "offline"', () => {
    const { getByTestId, getByText } = render(
      <NetworkStatusBanner
        networkErrorType="offline"
        message={OFFLINE_MESSAGE}
        onRetry={jest.fn()}
      />
    );
    expect(getByTestId('network-status-banner')).toBeTruthy();
    expect(getByText(OFFLINE_MESSAGE)).toBeTruthy();
  });
});

// ─── AC-NB3: Service-unavailable banner ──────────────────────────────────────

describe('AC-NB3 – service-unavailable banner', () => {
  it('renders the banner and message when type is "service-unavailable"', () => {
    const { getByTestId, getByText } = render(
      <NetworkStatusBanner
        networkErrorType="service-unavailable"
        message={SERVICE_MESSAGE}
        onRetry={jest.fn()}
      />
    );
    expect(getByTestId('network-status-banner')).toBeTruthy();
    expect(getByText(SERVICE_MESSAGE)).toBeTruthy();
  });
});

// ─── AC-NB4: Retry callback ───────────────────────────────────────────────────

describe('AC-NB4 – retry button calls onRetry', () => {
  it('calls onRetry when the retry button is pressed', () => {
    const onRetry = jest.fn();
    const { getByTestId } = render(
      <NetworkStatusBanner
        networkErrorType="offline"
        message={OFFLINE_MESSAGE}
        onRetry={onRetry}
      />
    );
    fireEvent.press(getByTestId('network-status-retry'));
    expect(onRetry).toHaveBeenCalledTimes(1);
  });
});

// ─── AC-NB5: Retry disabled while retrying ───────────────────────────────────

describe('AC-NB5 – retry button is disabled while isRetrying', () => {
  it('renders retry button as disabled when isRetrying is true', () => {
    const onRetry = jest.fn();
    const { getByTestId } = render(
      <NetworkStatusBanner
        networkErrorType="offline"
        message={OFFLINE_MESSAGE}
        onRetry={onRetry}
        isRetrying={true}
      />
    );
    const retryBtn = getByTestId('network-status-retry');
    // The button should not respond to presses when disabled
    fireEvent.press(retryBtn);
    expect(onRetry).not.toHaveBeenCalled();
  });
});

// ─── AC-NB6: Does not crash ───────────────────────────────────────────────────

describe('AC-NB6 – does not crash with any valid props', () => {
  it('renders without crashing for "offline"', () => {
    expect(() =>
      render(
        <NetworkStatusBanner
          networkErrorType="offline"
          message={OFFLINE_MESSAGE}
          onRetry={jest.fn()}
        />
      )
    ).not.toThrow();
  });

  it('renders without crashing for "service-unavailable"', () => {
    expect(() =>
      render(
        <NetworkStatusBanner
          networkErrorType="service-unavailable"
          message={SERVICE_MESSAGE}
          onRetry={jest.fn()}
        />
      )
    ).not.toThrow();
  });

  it('renders without crashing for "none"', () => {
    expect(() =>
      render(
        <NetworkStatusBanner
          networkErrorType="none"
          message=""
          onRetry={jest.fn()}
        />
      )
    ).not.toThrow();
  });
});
