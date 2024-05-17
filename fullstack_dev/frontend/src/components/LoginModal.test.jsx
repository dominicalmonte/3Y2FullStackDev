import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import axios from 'axios';
import LoginModal from './LoginModal';

// Mock the axios module
jest.mock('axios');

describe('LoginModal', () => {
  it('renders correctly when open', () => {
    render(<LoginModal isOpen={true} onClose={jest.fn()} sendDataToParent={jest.fn()} />);
    expect(screen.getByText('Login')).toBeInTheDocument();
  });

  it('closes when the close icon is clicked', () => {
    const onCloseMock = jest.fn();
    render(<LoginModal isOpen={true} onClose={onCloseMock} sendDataToParent={jest.fn()} />);
    fireEvent.click(screen.getByRole('button', { name: /times/i }));
    expect(onCloseMock).toHaveBeenCalled();
  });

  it('calls the login API and handles success', async () => {
    const response = { data: { identifier: '123', access: 'token', role: 'student' } };
    axios.post.mockResolvedValue(response);
    const sendDataToParentMock = jest.fn();

    render(<LoginModal isOpen={true} onClose={jest.fn()} sendDataToParent={sendDataToParentMock} />);
    fireEvent.change(screen.getByLabelText(/username/i), { target: { value: 'testuser' } });
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'password' } });
    fireEvent.click(screen.getByText(/login/i));

    await waitFor(() => {
      expect(localStorage.setItem).toHaveBeenCalledWith('token', 'token');
      expect(localStorage.setItem).toHaveBeenCalledWith('id', JSON.stringify('123'));
      expect(sendDataToParentMock).toHaveBeenCalledWith(true);
    });
  });

  it('handles login failure', async () => {
    axios.post.mockRejectedValue({ response: { data: { error: 'Invalid credentials' } } });
    render(<LoginModal isOpen={true} onClose={jest.fn()} sendDataToParent={jest.fn()} />);
    fireEvent.change(screen.getByLabelText(/username/i), { target: { value: 'testuser' } });
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'password' } });
    fireEvent.click(screen.getByText(/login/i));

    await waitFor(() => {
      expect(screen.getByText('Login failed: Invalid credentials')).toBeInTheDocument();
    });
  });
});
