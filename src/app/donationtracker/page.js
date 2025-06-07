'use client';

import { useState } from 'react';
import './page.css'; // Import the CSS file

export default function DonationTracker() {
    const [formData, setFormData] = useState({
        phone: '',
        amount: '',
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const form = new FormData();
        form.append('phone', formData.phone);
        form.append('amount', formData.amount);

        try {
            const response = await fetch('/api/updatePaymentDetails', {
                method: 'POST',
                body: form,
            });

            const result = await response.json();
            if (result.success) {
                alert('Payment details updated successfully!');
            } else {
                alert('Failed to update payment details.');
            }
        } catch (error) {
            console.error('Error submitting form:', error);
            alert('An error occurred. Please try again.');
        }
    };

    return (
        <div className="donation-tracker">
            <img src="/assets/iskcon_logo.jpg" alt="ISKCON Logo" className="logo" />
            <h1 className="title">Submit Payment Details</h1>
            <form onSubmit={handleSubmit} className="form">
                <div className="form-group">
                    <label className="label">Phone Number:</label>
                    <input
                        type="text"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        required
                        className="input"
                    />
                </div>
                <div className="form-group">
                    <label className="label">Amount:</label>
                    <input
                        type="number"
                        name="amount"
                        value={formData.amount}
                        onChange={handleChange}
                        required
                        className="input"
                    />
                </div>
                <button type="submit" className="submit-button">Submit</button>
            </form>
            <p className="note">
                Note: Your payment details will be updated in our&nbsp;
                <a href="https://docs.google.com/spreadsheets/d/1Ex0YOzFzJcgy6t4JzKdwkENHI-RoDDQuxsxAqpkT5lM/edit?usp=sharing" target="_blank" rel="noopener noreferrer" className="link">
                    Google Sheet
                </a>.
            </p>
        </div>
    );
}