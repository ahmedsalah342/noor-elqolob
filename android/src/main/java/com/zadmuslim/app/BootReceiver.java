package com.zadmuslim.app;

import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.util.Log;

public class BootReceiver extends BroadcastReceiver {
    @Override
    public void onReceive(Context context, Intent intent) {
        if (intent.getAction().equals(Intent.ACTION_BOOT_COMPLETED)) {
            Log.d("BootReceiver", "Device booted, rescheduling prayer notifications");
            // سيتم إعادة جدولة الإشعارات تلقائياً عند فتح التطبيق
            Intent launchIntent = context.getPackageManager().getLaunchIntentForPackage("com.zadmuslim.app");
            if (launchIntent != null) {
                launchIntent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
                context.startActivity(launchIntent);
            }
        }
    }
}
