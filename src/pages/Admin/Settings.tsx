import { Routes, Route, Navigate } from 'react-router-dom';
import SettingsLayout from './Settings/SettingsLayout';
import GeneralSettings from './Settings/GeneralSettings';
import AdsSettings from './Settings/AdsSettings';
import DesignSettings from './Settings/DesignSettings';
import SecuritySettings from './Settings/SecuritySettings';

const Settings = () => {
  return (
    <Routes>
      <Route element={<SettingsLayout />}>
        <Route index element={<Navigate to="general" replace />} />
        <Route path="general" element={<GeneralSettings />} />
        <Route path="ads" element={<AdsSettings />} />
        <Route path="design" element={<DesignSettings />} />
        <Route path="security" element={<SecuritySettings />} />
      </Route>
    </Routes>
  );
};

export default Settings;
