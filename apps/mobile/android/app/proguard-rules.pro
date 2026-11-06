# ==============================================================================
# ChargeMesh Production ProGuard / R8 Configuration
# ==============================================================================

# React Native Core & JNI Bridges
-keep class com.facebook.react.** { *; }
-keep class com.facebook.hermes.unicode.** { *; }
-keep class com.facebook.jni.** { *; }
-keep class com.facebook.soloader.** { *; }
-keepattributes *Annotation*, InnerClasses, Signature, Exceptions

# Keep ReactMethods and TurboModules
-keepclassmembers class * extends com.facebook.react.bridge.ReactContextBaseJavaModule {
    @com.facebook.react.bridge.ReactMethod *;
    @com.facebook.react.bridge.ReactMethod(isBlockingSynchronousMethod = true) *;
}
-keepclassmembers class * extends com.facebook.react.uimanager.ViewManager {
    @com.facebook.react.uimanager.annotations.ReactProp *;
    @com.facebook.react.uimanager.annotations.ReactPropGroup *;
}

# ChargeMesh Native Kotlin Modules & Bridges
-keep class com.chargemesh.mobile.** { *; }
-keepclassmembers class com.chargemesh.mobile.** { *; }

# AndroidX Biometric & Security Keystore
-keep class androidx.biometric.** { *; }
-dontwarn androidx.biometric.**

# AndroidX CameraX Core & Lifecycle
-keep class androidx.camera.core.** { *; }
-keep class androidx.camera.camera2.** { *; }
-keep class androidx.camera.lifecycle.** { *; }
-keep class androidx.camera.view.** { *; }
-dontwarn androidx.camera.**

# Google ML Kit Barcode Scanning
-keep class com.google.mlkit.vision.barcode.** { *; }
-keep class com.google.mlkit.vision.common.** { *; }
-keep class com.google.android.gms.vision.** { *; }
-dontwarn com.google.mlkit.**

# MapLibre React Native
-keep class org.maplibre.** { *; }
-dontwarn org.maplibre.**

# Kotlin Coroutines and Reflection
-keepclassmembers class kotlin.Metadata {
    public <methods>;
}
-dontwarn kotlin.**

