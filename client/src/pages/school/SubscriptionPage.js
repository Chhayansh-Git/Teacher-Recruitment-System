// client/src/pages/school/SubscriptionPage.js

import React, { useState, useEffect } from 'react';
import api from '../../api';
import { useQuery } from '@tanstack/react-query';
// --- CHANGE: Removed the unused 'Zap' import ---
import { Check, Loader2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

// A custom hook to dynamically load the Razorpay script
const useRazorpayScript = () => {
    useEffect(() => {
        const script = document.createElement('script');
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.async = true;
        document.body.appendChild(script);

        return () => {
            document.body.removeChild(script);
        };
    }, []);
};

const fetchSubscriptionPlans = async () => {
    const { data } = await api.get('/schools/plans');
    return data.data;
};

const SubscriptionPage = () => {
    useRazorpayScript();
    const { user } = useAuth();
    const navigate = useNavigate();
    const [isProcessing, setIsProcessing] = useState(null); // Tracks which plan is being processed

    const { data: plans, isLoading, isError, error } = useQuery({
        queryKey: ['subscriptionPlans'],
        queryFn: fetchSubscriptionPlans,
    });

    const handlePayment = async (plan) => {
        setIsProcessing(plan._id);
        try {
            // Step 1: Create a subscription on our backend
            const { data: subscriptionData } = await api.post('/schools/subscriptions/create', {
                planId: plan._id,
            });

            // Step 2: Configure and open the Razorpay checkout
            const options = {
                key: process.env.REACT_APP_RAZORPAY_KEY_ID, // Your Razorpay Key ID from .env
                subscription_id: subscriptionData.data.subscriptionId,
                name: 'Teacher Recruitment System',
                description: `Payment for ${plan.name} Plan`,
                image: '/logo192.png', // A path to your logo
                handler: async function (response) {
                    // Step 3: Verify the payment on our backend
                    try {
                        await api.post('/schools/subscriptions/verify', {
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_subscription_id: response.razorpay_subscription_id,
                            razorpay_signature: response.razorpay_signature,
                        });
                        alert('Subscription successful! Your plan is now active.');
                        navigate('/school/dashboard'); // Redirect to dashboard on success
                    } catch (verifyError) {
                        console.error('Payment verification failed:', verifyError);
                        alert('Payment verification failed. Please contact support.');
                    }
                },
                prefill: {
                    name: user?.name || 'School Name', // Assuming user context has school name
                    email: user?.email,
                },
                theme: {
                    color: '#2563EB', // A nice blue theme
                },
            };

            const rzp = new window.Razorpay(options);
            rzp.open();

        } catch (err) {
            console.error('Failed to create subscription:', err);
            alert('Could not initiate subscription. Please try again.');
        } finally {
            setIsProcessing(null);
        }
    };

    if (isLoading) {
        return <div className="text-center p-10">Loading plans...</div>;
    }

    if (isError) {
        return <div className="text-center p-10 text-red-500">Error: {error.message}</div>;
    }

    return (
        <div className="bg-gray-50 min-h-screen py-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center">
                    <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
                        Find the perfect plan for your school
                    </h2>
                    <p className="mt-4 text-lg text-gray-500">
                        Unlock powerful features to find the best teaching talent.
                    </p>
                </div>

                <div className="mt-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {plans?.map((plan) => (
                        <div
                            key={plan._id}
                            className={`relative rounded-2xl shadow-lg bg-white p-8 flex flex-col ${plan.isPopular ? 'border-4 border-blue-600' : 'border'}`}
                        >
                            {plan.isPopular && (
                                <div className="absolute top-0 -translate-y-1/2 left-1/2 -translate-x-1/2">
                                    <span className="inline-flex items-center px-4 py-1 rounded-full text-sm font-semibold tracking-wider text-white bg-blue-600">
                                        Most Popular
                                    </span>
                                </div>
                            )}

                            <h3 className="text-2xl font-semibold text-gray-900">{plan.name}</h3>
                            <p className="mt-2 text-gray-500">{plan.description}</p>
                            <div className="mt-6">
                                <span className="text-5xl font-extrabold text-gray-900">
                                    ₹{plan.price / 100}
                                </span>
                                <span className="text-lg font-medium text-gray-500">
                                    /{plan.billingCycle === 'monthly' ? 'mo' : 'yr'}
                                </span>
                            </div>

                            <ul className="mt-8 space-y-4 text-gray-600 flex-grow">
                                {plan.features.map((feature, index) => (
                                    <li key={index} className="flex items-start">
                                        <Check className="flex-shrink-0 w-6 h-6 text-green-500" />
                                        <span className="ml-3">{feature}</span>
                                    </li>
                                ))}
                            </ul>

                            <button
                                onClick={() => handlePayment(plan)}
                                disabled={isProcessing}
                                className={`mt-8 w-full py-3 px-6 rounded-lg text-lg font-semibold transition-colors
                                    ${plan.isPopular
                                        ? 'bg-blue-600 text-white hover:bg-blue-700'
                                        : 'bg-blue-100 text-blue-800 hover:bg-blue-200'}
                                    disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center`}
                            >
                                {isProcessing === plan._id ? (
                                    <>
                                        <Loader2 className="animate-spin mr-2" /> Processing...
                                    </>
                                ) : (
                                    'Choose Plan'
                                )}
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default SubscriptionPage;