import React from 'react';
// --- FIX: Removed the unused 'Settings' icon from this import ---
import { Bell, Key } from 'lucide-react';

const SettingsPage = () => {
    return (
        <div>
            <div className="mb-8">
                <h2 className="text-3xl font-bold text-gray-800">Settings</h2>
                <p className="text-gray-500">Manage platform-wide configurations.</p>
            </div>

            <div className="bg-white p-6 md:p-8 rounded-2xl shadow-lg">
                <div className="space-y-8">
                    {/* Notification Settings Section */}
                    <SettingsSection 
                        title="Notification Settings"
                        description="Enable or disable automated email and SMS notifications."
                        icon={<Bell />}
                    >
                        <div className="space-y-4">
                            <ToggleSetting label="Email Notifications" id="email-notifications" />
                            <ToggleSetting label="SMS Notifications" id="sms-notifications" />
                        </div>
                    </SettingsSection>

                    {/* API Keys Section */}
                    <SettingsSection 
                        title="API Keys & Integrations"
                        description="Manage third-party service API keys. (Feature coming soon)"
                        icon={<Key />}
                    >
                        <div className="space-y-4">
                           <InputField label="SendGrid API Key" id="sendgrid-key" value="**********" disabled />
                           <InputField label="Twilio Account SID" id="twilio-sid" value="**********" disabled />
                        </div>
                    </SettingsSection>
                </div>
            </div>
        </div>
    );
};

const SettingsSection = ({ title, description, icon, children }) => (
    <div className="border-b pb-8">
        <div className="flex items-start space-x-4">
            <div className="p-3 bg-blue-100 text-blue-600 rounded-full">{icon}</div>
            <div>
                <h3 className="text-xl font-semibold text-gray-800">{title}</h3>
                <p className="text-gray-500 text-sm mt-1">{description}</p>
            </div>
        </div>
        <div className="mt-6 pl-16">
            {children}
        </div>
    </div>
);

const ToggleSetting = ({ label, id }) => (
    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
        <label htmlFor={id} className="font-medium text-gray-700">{label}</label>
        <div className="relative inline-block w-10 mr-2 align-middle select-none transition duration-200 ease-in">
            <input type="checkbox" name={id} id={id} className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer" disabled />
            <label htmlFor={id} className="toggle-label block overflow-hidden h-6 rounded-full bg-gray-300 cursor-pointer"></label>
        </div>
    </div>
);

const InputField = ({ label, id, ...props }) => (
    <div>
        <label htmlFor={id} className="block text-sm font-medium text-gray-600">{label}</label>
        <input id={id} {...props} className="mt-1 block w-full max-w-sm p-2 border bg-gray-200 border-gray-300 rounded-md cursor-not-allowed" />
    </div>
);

// Add some basic CSS for the toggle switch
const style = document.createElement('style');
style.innerHTML = `
    .toggle-checkbox:checked { right: 0; border-color: #3B82F6; }
    .toggle-checkbox:checked + .toggle-label { background-color: #3B82F6; }
`;
document.head.appendChild(style);

export default SettingsPage;