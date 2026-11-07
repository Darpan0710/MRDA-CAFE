import React, { useState, useEffect } from 'react';
import {
  Settings,
  Lock,
  User,
  Clock,
  Phone,
  MapPin,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  KeyRound,
  Sliders,
  Store,
  Shield,
} from 'lucide-react';
import { adminApi, CafeSettings, AdminUser } from '../../services/adminApi';

interface AdminSettingsProps {
  onProfileUpdated: (user: AdminUser) => void;
}

export const AdminSettings: React.FC<AdminSettingsProps> = ({ onProfileUpdated }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [settings, setSettings] = useState<CafeSettings | null>(null);
  const [adminProfile, setAdminProfile] = useState<AdminUser | null>(null);
  const [adminAccounts, setAdminAccounts] = useState<
    Array<{ id: string; username: string; email: string; name: string; lastLoginAt?: string; role: string }> | null
  >(null);
  const [selectedAccountId, setSelectedAccountId] = useState<string>('admin-1');

  // Settings Save State
  const [settingsSaving, setSettingsSaving] = useState(false);
  const [settingsSuccess, setSettingsSuccess] = useState(false);

  // Password / Credentials Form State
  const [credForm, setCredForm] = useState({
    currentPassword: '',
    newName: '',
    newUsername: '',
    newEmail: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [credSaving, setCredSaving] = useState(false);
  const [credSuccess, setCredSuccess] = useState<string | null>(null);
  const [credError, setCredError] = useState<string | null>(null);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await adminApi.getSettings();
      setSettings(data.settings);
      setAdminProfile(data.adminProfile);
      setAdminAccounts(data.adminAccounts || null);

      const targetId = data.adminProfile.id;
      setSelectedAccountId(targetId);

      setCredForm((prev) => ({
        ...prev,
        newName: data.adminProfile.name,
        newUsername: data.adminProfile.username,
        newEmail: data.adminProfile.email,
      }));
    } catch (err: any) {
      setError(err.message || 'Failed to load settings from server.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleSelectAccount = (targetId: string) => {
    setSelectedAccountId(targetId);
    setCredError(null);
    setCredSuccess(null);

    const target = adminAccounts?.find((a) => a.id === targetId);
    if (target) {
      setCredForm((prev) => ({
        ...prev,
        newName: target.name,
        newUsername: target.username,
        newEmail: target.email,
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      }));
    } else if (adminProfile) {
      setCredForm((prev) => ({
        ...prev,
        newName: adminProfile.name,
        newUsername: adminProfile.username,
        newEmail: adminProfile.email,
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      }));
    }
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settings) return;
    try {
      setSettingsSaving(true);
      setSettingsSuccess(false);
      const res = await adminApi.updateSettings(settings);
      setSettings(res.settings);
      setSettingsSuccess(true);
      setTimeout(() => setSettingsSuccess(false), 3000);
    } catch (err: any) {
      alert(err.message || 'Failed to update settings.');
    } finally {
      setSettingsSaving(false);
    }
  };

  const handleUpdateCredentials = async (e: React.FormEvent) => {
    e.preventDefault();
    setCredError(null);
    setCredSuccess(null);

    if (!credForm.currentPassword) {
      setCredError('Current password is required to verify your identity.');
      return;
    }

    if (credForm.newPassword) {
      if (credForm.newPassword.length < 8) {
        setCredError('New password must be at least 8 characters long.');
        return;
      }
      if (credForm.newPassword !== credForm.confirmPassword) {
        setCredError('New password and confirmation do not match.');
        return;
      }
    }

    try {
      setCredSaving(true);
      const res = await adminApi.updateCredentials({
        currentPassword: credForm.currentPassword,
        targetAdminId: selectedAccountId,
        newName: credForm.newName,
        newUsername: credForm.newUsername,
        newEmail: credForm.newEmail,
        newPassword: credForm.newPassword || undefined,
      });

      setCredSuccess(res.message);

      // Update local state
      if (selectedAccountId === adminProfile?.id) {
        setAdminProfile(res.adminProfile);
        onProfileUpdated(res.adminProfile);
      }

      if (adminAccounts) {
        setAdminAccounts(
          adminAccounts.map((a) =>
            a.id === selectedAccountId
              ? {
                  ...a,
                  name: res.adminProfile.name,
                  username: res.adminProfile.username,
                  email: res.adminProfile.email,
                }
              : a
          )
        );
      }

      setCredForm((prev) => ({
        ...prev,
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      }));
    } catch (err: any) {
      setCredError(err.message || 'Failed to update administrator credentials.');
    } finally {
      setCredSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="py-20 text-center space-y-3">
        <RefreshCw size={24} className="text-[#873A35] animate-spin mx-auto" />
        <p className="text-xs font-mono uppercase tracking-widest text-[#70452D]">
          Loading server configuration...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in max-w-4xl">
      
      {/* Top Header */}
      <div className="pb-2 border-b border-[#DCCBB4]">
        <div className="flex items-center gap-2 text-xs font-mono text-[#873A35] uppercase tracking-widest mb-1">
          <span>SYSTEM &amp; SECURITY</span>
          <span>✦</span>
          <span>CONFIGURATION</span>
        </div>
        <h1 className="font-editorial-display text-2xl sm:text-3xl text-[#292723] font-medium tracking-tight">
          Console &amp; Operations Settings
        </h1>
      </div>

      {/* ================= SECTION 1: ADMINISTRATOR ACCOUNT & SECURITY ================= */}
      <div className="bg-[#FFF3DF] border border-[#DCCBB4] rounded-xs p-6 sm:p-8 shadow-xs space-y-6">
        <div className="flex items-center gap-2.5 pb-3 border-b border-[#DCCBB4]">
          <Shield size={18} className="text-[#873A35]" />
          <div>
            <h2 className="font-editorial-sans text-base font-semibold text-[#292723]">
              Administrator Account &amp; Credentials
            </h2>
            <p className="text-xs text-[#70452D] font-light">
              Credentials are cryptographically salted and hashed on the server using Node scrypt.
            </p>
          </div>
        </div>

        {credSuccess && (
          <div className="p-3 bg-emerald-50 border border-emerald-300 rounded-xs text-xs text-emerald-800 flex items-center gap-2">
            <CheckCircle2 size={15} className="text-emerald-700" />
            <span>{credSuccess}</span>
          </div>
        )}

        {credError && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-xs text-xs text-red-800 flex items-start gap-2">
            <AlertCircle size={15} className="shrink-0 mt-0.5 text-red-700" />
            <span>{credError}</span>
          </div>
        )}

        {adminAccounts && adminAccounts.length > 1 && (
          <div className="space-y-2">
            <span className="block text-[11px] font-mono uppercase tracking-wider text-[#70452D]">
              Select Account to Manage
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {adminAccounts.map((acc) => {
                const isSelected = selectedAccountId === acc.id;
                return (
                  <button
                    key={acc.id}
                    type="button"
                    onClick={() => handleSelectAccount(acc.id)}
                    className={`p-3.5 text-left border rounded-xs transition-all cursor-pointer ${
                      isSelected
                        ? 'border-[#873A35] bg-[#F1E9DC] shadow-xs'
                        : 'border-[#DCCBB4] bg-white/70 hover:bg-white'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-editorial-sans font-semibold text-xs text-[#292723]">
                        {acc.name}
                      </span>
                      <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full bg-[#873A35]/10 text-[#873A35]">
                        {acc.role}
                      </span>
                    </div>
                    <div className="text-[11px] font-mono text-[#70452D] mt-1 truncate">
                      {acc.email}
                    </div>
                    <div className="text-[10px] text-[#70452D]/80 font-mono mt-0.5">
                      ID: {acc.id} &bull; Login alias: {acc.username}
                    </div>
                  </button>
                );
              })}
            </div>
            {selectedAccountId === 'admin-2' && (
              <p className="text-[11px] text-[#70452D] bg-[#F1E9DC]/60 p-2.5 rounded-xs border border-[#DCCBB4]/60">
                ✦ <strong>Café &amp; Staff Account:</strong> Shared multi-device login for baristas and order desk.
                Changing its password invalidates all active staff sessions immediately.
              </p>
            )}
          </div>
        )}

        <form onSubmit={handleUpdateCredentials} className="space-y-4 text-xs font-sans">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-mono uppercase tracking-wider text-[#70452D] mb-1">
                Display Name
              </label>
              <input
                type="text"
                required
                value={credForm.newName}
                onChange={(e) => setCredForm({ ...credForm, newName: e.target.value })}
                className="w-full bg-white border border-[#DCCBB4] rounded-xs px-3 py-2 text-[#292723] focus:outline-hidden focus:border-[#873A35]"
              />
            </div>
            <div>
              <label className="block text-[11px] font-mono uppercase tracking-wider text-[#70452D] mb-1">
                Login Username
              </label>
              <input
                type="text"
                required
                value={credForm.newUsername}
                onChange={(e) => setCredForm({ ...credForm, newUsername: e.target.value })}
                className="w-full font-mono bg-white border border-[#DCCBB4] rounded-xs px-3 py-2 text-[#292723] focus:outline-hidden focus:border-[#873A35]"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-mono uppercase tracking-wider text-[#70452D] mb-1">
              Administrator Email
            </label>
            <input
              type="email"
              required
              value={credForm.newEmail}
              onChange={(e) => setCredForm({ ...credForm, newEmail: e.target.value })}
              className="w-full font-mono bg-white border border-[#DCCBB4] rounded-xs px-3 py-2 text-[#292723] focus:outline-hidden focus:border-[#873A35]"
            />
          </div>

          <div className="pt-2 border-t border-[#DCCBB4]/60">
            <span className="text-[11px] font-mono uppercase tracking-wider text-[#873A35] font-semibold block mb-2">
              Update Password (Leave blank to keep current password)
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-mono uppercase tracking-wider text-[#70452D] mb-1">
                  New Password (min 8 chars)
                </label>
                <input
                  type="password"
                  placeholder="••••••••••••"
                  value={credForm.newPassword}
                  onChange={(e) => setCredForm({ ...credForm, newPassword: e.target.value })}
                  className="w-full font-mono bg-white border border-[#DCCBB4] rounded-xs px-3 py-2 text-[#292723] focus:outline-hidden focus:border-[#873A35]"
                />
              </div>
              <div>
                <label className="block text-[11px] font-mono uppercase tracking-wider text-[#70452D] mb-1">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  placeholder="••••••••••••"
                  value={credForm.confirmPassword}
                  onChange={(e) => setCredForm({ ...credForm, confirmPassword: e.target.value })}
                  className="w-full font-mono bg-white border border-[#DCCBB4] rounded-xs px-3 py-2 text-[#292723] focus:outline-hidden focus:border-[#873A35]"
                />
              </div>
            </div>
          </div>

          {/* Current Password Verification */}
          <div className="pt-2 p-3.5 bg-[#F1E9DC]/60 border border-[#DCCBB4] rounded-xs space-y-2">
            <label className="block text-[11px] font-mono uppercase tracking-wider text-[#873A35] font-semibold flex items-center gap-1.5">
              <KeyRound size={13} />
              <span>Current Password (Required to apply changes) *</span>
            </label>
            <input
              type="password"
              required
              placeholder="Enter current password to authorize updates"
              value={credForm.currentPassword}
              onChange={(e) => setCredForm({ ...credForm, currentPassword: e.target.value })}
              className="w-full font-mono bg-white border border-[#DCCBB4] rounded-xs px-3 py-2 text-[#292723] focus:outline-hidden focus:border-[#873A35]"
            />
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              disabled={credSaving}
              className="px-6 py-2.5 bg-[#873A35] hover:bg-[#70452D] text-[#FFF3DF] text-xs font-mono uppercase tracking-wider rounded-full transition-colors cursor-pointer shadow-xs"
            >
              {credSaving
                ? 'Authorizing & Updating...'
                : `Update ${selectedAccountId === 'admin-2' ? 'Staff' : 'Owner'} Credentials`}
            </button>
          </div>
        </form>
      </div>

      {/* ================= SECTION 2: RESERVATION & CAPACITY RULES ================= */}
      {settings && (
        <div className="bg-[#FFF3DF] border border-[#DCCBB4] rounded-xs p-6 sm:p-8 shadow-xs space-y-6">
          <div className="flex items-center gap-2.5 pb-3 border-b border-[#DCCBB4]">
            <Sliders size={18} className="text-[#873A35]" />
            <div>
              <h2 className="font-editorial-sans text-base font-semibold text-[#292723]">
                Reservation Policy &amp; Slot Rules
              </h2>
              <p className="text-xs text-[#70452D] font-light">
                Rules enforced by the server booking API for all public requests.
              </p>
            </div>
          </div>

          {settingsSuccess && (
            <div className="p-3 bg-emerald-50 border border-emerald-300 rounded-xs text-xs text-emerald-800 flex items-center gap-2">
              <CheckCircle2 size={15} className="text-emerald-700" />
              <span>Operational rules updated successfully!</span>
            </div>
          )}

          <form onSubmit={handleSaveSettings} className="space-y-4 text-xs font-sans">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-mono uppercase tracking-wider text-[#70452D] mb-1">
                  Default Guests per Seating Slot
                </label>
                <input
                  type="number"
                  min="5"
                  max="100"
                  value={settings.defaultSlotCapacity}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      defaultSlotCapacity: parseInt(e.target.value, 10) || 20,
                    })
                  }
                  className="w-full font-mono bg-white border border-[#DCCBB4] rounded-xs px-3 py-2 text-[#292723] focus:outline-hidden focus:border-[#873A35]"
                />
                <span className="text-[10px] text-[#70452D]/70 mt-1 block">
                  Prevents booking collisions once capacity is reached.
                </span>
              </div>

              <div>
                <label className="block text-[11px] font-mono uppercase tracking-wider text-[#70452D] mb-1">
                  Maximum Party Size Allowed Online
                </label>
                <input
                  type="number"
                  min="1"
                  max="30"
                  value={settings.maxPartySize}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      maxPartySize: parseInt(e.target.value, 10) || 12,
                    })
                  }
                  className="w-full font-mono bg-white border border-[#DCCBB4] rounded-xs px-3 py-2 text-[#292723] focus:outline-hidden focus:border-[#873A35]"
                />
                <span className="text-[10px] text-[#70452D]/70 mt-1 block">
                  Larger groups require contacting the hospitality desk directly.
                </span>
              </div>
            </div>

            <div className="pt-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.autoConfirmReservations}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      autoConfirmReservations: e.target.checked,
                    })
                  }
                  className="rounded text-[#873A35] focus:ring-[#873A35]"
                />
                <span className="text-xs text-[#292723] font-medium">
                  Auto-confirm table reservation requests when slots have open capacity
                </span>
              </label>
              <p className="text-[11px] text-[#70452D]/80 ml-5 mt-0.5">
                If disabled, incoming table requests will be marked as "pending" for manager review.
              </p>
            </div>

            {/* Café Contact Info */}
            <div className="pt-4 border-t border-[#DCCBB4]/60 space-y-3">
              <span className="text-[11px] font-mono uppercase tracking-wider text-[#873A35] font-semibold block">
                Café Operational Hours &amp; Desk Contact
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-mono uppercase tracking-wider text-[#70452D] mb-1">
                    Operating Hours Text
                  </label>
                  <input
                    type="text"
                    value={settings.hours}
                    onChange={(e) => setSettings({ ...settings, hours: e.target.value })}
                    className="w-full bg-white border border-[#DCCBB4] rounded-xs px-3 py-2 text-[#292723] focus:outline-hidden focus:border-[#873A35]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-mono uppercase tracking-wider text-[#70452D] mb-1">
                    Public Contact Phone
                  </label>
                  <input
                    type="text"
                    value={settings.phone}
                    onChange={(e) => setSettings({ ...settings, phone: e.target.value })}
                    className="w-full font-mono bg-white border border-[#DCCBB4] rounded-xs px-3 py-2 text-[#292723] focus:outline-hidden focus:border-[#873A35]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-mono uppercase tracking-wider text-[#70452D] mb-1">
                  Physical Address
                </label>
                <input
                  type="text"
                  value={settings.address}
                  onChange={(e) => setSettings({ ...settings, address: e.target.value })}
                  className="w-full bg-white border border-[#DCCBB4] rounded-xs px-3 py-2 text-[#292723] focus:outline-hidden focus:border-[#873A35]"
                />
              </div>
            </div>

            <div className="pt-3 flex justify-end">
              <button
                type="submit"
                disabled={settingsSaving}
                className="px-6 py-2.5 bg-[#873A35] hover:bg-[#70452D] text-[#FFF3DF] text-xs font-mono uppercase tracking-wider rounded-full transition-colors cursor-pointer shadow-xs"
              >
                {settingsSaving ? 'Saving Policy...' : 'Save Reservation Settings'}
              </button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
};
