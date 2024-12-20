export interface SettingsType {
    notifications: NotifSettings,
    security: SecuritySettings,
    privacy: PrivacySettings,
    themeAccessibility: ThemeAccessibilitySettings
}

export interface NotifSettings {
    email: boolean,
    push: boolean,
    choice: {
        clubToggle: boolean,
        friendToggle: boolean,
        artistToggle: boolean,
        timeBefore: number,
        timeToggle: boolean,
    }
};

export interface SecuritySettings {
    twoFactor: boolean
};

export interface PrivacySettings {
    shareData: boolean,
    publicProfile: boolean,
    shareLocation: boolean,
    shareEmail: boolean,
    sharePhone: boolean,
    shareReservations: boolean,
};

export interface ThemeAccessibilitySettings {
    theme: string, // light, dark, system
    accessibility: string, // normal, high, extreme
}
