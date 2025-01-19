package com.zadmuslim.app;

import android.os.Bundle;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        registerPlugin(com.capacitorjs.plugins.geolocation.GeolocationPlugin.class);
        registerPlugin(com.capacitorjs.plugins.localnotifications.LocalNotificationsPlugin.class);
        registerPlugin(com.capacitorjs.plugins.preferences.PreferencesPlugin.class);
        super.onCreate(savedInstanceState);
    }
}
