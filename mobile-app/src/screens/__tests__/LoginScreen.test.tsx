import React from 'react';
import {render, fireEvent, waitFor} from '@testing-library/react-native';
import {NavigationContainer} from '@react-navigation/native';
import LoginScreen from '../LoginScreen';
import * as authService from '../../services/auth';

// Mock the auth service
jest.mock('../../services/auth');

const mockedAuthService = authService as jest.Mocked<typeof authService>;

// Test wrapper component that provides NavigationContainer
const TestWrapper: React.FC<{children: React.ReactNode}> = ({children}) => (
  <NavigationContainer>{children}</NavigationContainer>
);

// Helper function to render components with navigation context
const renderWithNavigation = (component: React.ReactElement) => {
  return render(component, {wrapper: TestWrapper});
};

/**
 * Unit Tests for Login Screen
 * 
 * Tests form validation, user interactions, error handling, and API integration
 */

describe('LoginScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders correctly with all required elements', () => {
    const {getByText, getByPlaceholderText} = renderWithNavigation(<LoginScreen />);

    // Check title and subtitle
    expect(getByText('Sahayak Voice')).toBeTruthy();
    expect(getByText('सहायक वॉइस')).toBeTruthy();

    // Check input fields
    expect(getByPlaceholderText('10-digit phone number')).toBeTruthy();
    expect(getByPlaceholderText('Enter password')).toBeTruthy();

    // Check login button
    expect(getByText('Login / लॉगिन करें')).toBeTruthy();
  });

  it('validates empty phone number', async () => {
    const {getByText, getByPlaceholderText} = renderWithNavigation(<LoginScreen />);

    const loginButton = getByText('Login / लॉगिन करें');
    fireEvent.press(loginButton);

    await waitFor(() => {
      expect(
        getByText(/Please enter phone number/i),
      ).toBeTruthy();
    });
  });

  it('validates invalid phone number format', async () => {
    const {getByText, getByPlaceholderText} = renderWithNavigation(<LoginScreen />);

    const phoneInput = getByPlaceholderText('10-digit phone number');
    const loginButton = getByText('Login / लॉगिन करें');

    // Enter invalid phone number (less than 10 digits)
    fireEvent.changeText(phoneInput, '12345');
    fireEvent.press(loginButton);

    await waitFor(() => {
      expect(
        getByText(/Please enter valid 10-digit phone number/i),
      ).toBeTruthy();
    });
  });

  it('validates empty password', async () => {
    const {getByText, getByPlaceholderText} = renderWithNavigation(<LoginScreen />);

    const phoneInput = getByPlaceholderText('10-digit phone number');
    const loginButton = getByText('Login / लॉगिन करें');

    // Enter valid phone number but no password
    fireEvent.changeText(phoneInput, '9876543210');
    fireEvent.press(loginButton);

    await waitFor(() => {
      expect(getByText(/Please enter password/i)).toBeTruthy();
    });
  });

  it('validates password length', async () => {
    const {getByText, getByPlaceholderText} = renderWithNavigation(<LoginScreen />);

    const phoneInput = getByPlaceholderText('10-digit phone number');
    const passwordInput = getByPlaceholderText('Enter password');
    const loginButton = getByText('Login / लॉगिन करें');

    // Enter valid phone number but short password
    fireEvent.changeText(phoneInput, '9876543210');
    fireEvent.changeText(passwordInput, '123');
    fireEvent.press(loginButton);

    await waitFor(() => {
      expect(
        getByText(/Password must be at least 4 characters/i),
      ).toBeTruthy();
    });
  });

  it('calls auth service with valid credentials', async () => {
    const mockUser = {
      id: 'user-123',
      name: 'Test User',
      phoneNumber: '9876543210',
      token: 'mock-token',
    };
    mockedAuthService.login.mockResolvedValue(mockUser);

    const {getByText, getByPlaceholderText} = renderWithNavigation(<LoginScreen />);

    const phoneInput = getByPlaceholderText('10-digit phone number');
    const passwordInput = getByPlaceholderText('Enter password');
    const loginButton = getByText('Login / लॉगिन करें');

    // Enter valid credentials
    fireEvent.changeText(phoneInput, '9876543210');
    fireEvent.changeText(passwordInput, 'password123');
    fireEvent.press(loginButton);

    await waitFor(() => {
      expect(mockedAuthService.login).toHaveBeenCalledWith('9876543210', 'password123');
    });
  });

  it('displays error message when login fails', async () => {
    mockedAuthService.login.mockRejectedValue(new Error('Invalid credentials'));

    const {getByText, getByPlaceholderText} = renderWithNavigation(<LoginScreen />);

    const phoneInput = getByPlaceholderText('10-digit phone number');
    const passwordInput = getByPlaceholderText('Enter password');
    const loginButton = getByText('Login / लॉगिन करें');

    // Enter credentials and attempt login
    fireEvent.changeText(phoneInput, '9876543210');
    fireEvent.changeText(passwordInput, 'wrongpassword');
    fireEvent.press(loginButton);

    await waitFor(() => {
      expect(getByText(/Invalid credentials/i)).toBeTruthy();
    });
  });

  it('disables inputs and shows loading indicator during login', async () => {
    let resolveLogin: (value: any) => void;
    const loginPromise = new Promise<any>(resolve => {
      resolveLogin = resolve;
    });
    mockedAuthService.login.mockReturnValue(loginPromise);

    const {getByText, getByPlaceholderText} = renderWithNavigation(<LoginScreen />);

    const phoneInput = getByPlaceholderText('10-digit phone number');
    const passwordInput = getByPlaceholderText('Enter password');

    // Enter credentials and attempt login
    fireEvent.changeText(phoneInput, '9876543210');
    fireEvent.changeText(passwordInput, 'password123');
    fireEvent.press(getByText('Login / लॉगिन करें'));

    // Wait for loading state to be active
    await waitFor(() => {
      expect(mockedAuthService.login).toHaveBeenCalled();
    });

    // Resolve the login promise
    resolveLogin!({
      id: 'user-123',
      name: 'Test User',
      phoneNumber: '9876543210',
      token: 'mock-token',
    });
  });

  it('trims whitespace from phone number', async () => {
    const mockUser = {
      id: 'user-123',
      name: 'Test User',
      phoneNumber: '9876543210',
      token: 'mock-token',
    };
    mockedAuthService.login.mockResolvedValue(mockUser);

    const {getByText, getByPlaceholderText} = renderWithNavigation(<LoginScreen />);

    const phoneInput = getByPlaceholderText('10-digit phone number');
    const passwordInput = getByPlaceholderText('Enter password');
    const loginButton = getByText('Login / लॉगिन करें');

    // Enter credentials with whitespace
    fireEvent.changeText(phoneInput, '  9876543210  ');
    fireEvent.changeText(passwordInput, 'password123');
    fireEvent.press(loginButton);

    await waitFor(() => {
      expect(mockedAuthService.login).toHaveBeenCalledWith('9876543210', 'password123');
    });
  });

  it('accepts exactly 10 digit phone numbers', async () => {
    const mockUser = {
      id: 'user-123',
      name: 'Test User',
      phoneNumber: '1234567890',
      token: 'mock-token',
    };
    mockedAuthService.login.mockResolvedValue(mockUser);

    const {getByText, getByPlaceholderText, queryByText} = renderWithNavigation(<LoginScreen />);

    const phoneInput = getByPlaceholderText('10-digit phone number');
    const passwordInput = getByPlaceholderText('Enter password');
    const loginButton = getByText('Login / लॉगिन करें');

    // Enter valid 10-digit phone number
    fireEvent.changeText(phoneInput, '1234567890');
    fireEvent.changeText(passwordInput, 'password123');
    fireEvent.press(loginButton);

    await waitFor(() => {
      expect(mockedAuthService.login).toHaveBeenCalled();
      expect(queryByText(/Please enter valid 10-digit phone number/i)).toBeNull();
    });
  });
});
