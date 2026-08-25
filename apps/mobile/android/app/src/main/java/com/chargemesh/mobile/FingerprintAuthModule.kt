package com.chargemesh.mobile

import android.content.Intent
import android.os.Build
import android.provider.Settings
import androidx.biometric.BiometricManager
import androidx.biometric.BiometricPrompt
import androidx.core.content.ContextCompat
import androidx.fragment.app.FragmentActivity
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.UiThreadUtil
import com.facebook.react.bridge.WritableMap

class FingerprintAuthModule(private val reactContext: ReactApplicationContext) :
    ReactContextBaseJavaModule(reactContext) {

    override fun getName(): String = "FingerprintAuth"

    /**
     * Check device fingerprint capability and enrollment
     */
    @ReactMethod
    fun isFingerprintAvailable(promise: Promise) {
        try {
            val biometricManager = BiometricManager.from(reactContext)
            val canAuthenticate = biometricManager.canAuthenticate(BiometricManager.Authenticators.BIOMETRIC_STRONG)

            val resultMap: WritableMap = Arguments.createMap()
            when (canAuthenticate) {
                BiometricManager.BIOMETRIC_SUCCESS -> {
                    resultMap.putString("status", "AVAILABLE")
                    resultMap.putBoolean("isAvailable", true)
                    resultMap.putBoolean("isEnrolled", true)
                }
                BiometricManager.BIOMETRIC_ERROR_NONE_ENROLLED -> {
                    resultMap.putString("status", "NOT_ENROLLED")
                    resultMap.putBoolean("isAvailable", false)
                    resultMap.putBoolean("isEnrolled", false)
                }
                BiometricManager.BIOMETRIC_ERROR_NO_HARDWARE -> {
                    resultMap.putString("status", "NOT_SUPPORTED")
                    resultMap.putBoolean("isAvailable", false)
                    resultMap.putBoolean("isEnrolled", false)
                }
                BiometricManager.BIOMETRIC_ERROR_HW_UNAVAILABLE -> {
                    resultMap.putString("status", "HARDWARE_UNAVAILABLE")
                    resultMap.putBoolean("isAvailable", false)
                    resultMap.putBoolean("isEnrolled", false)
                }
                else -> {
                    resultMap.putString("status", "NOT_AVAILABLE")
                    resultMap.putBoolean("isAvailable", false)
                    resultMap.putBoolean("isEnrolled", false)
                }
            }
            promise.resolve(resultMap)
        } catch (e: Exception) {
            promise.reject("FINGERPRINT_CHECK_FAILED", e.message, e)
        }
    }

    /**
     * Launch Android native BiometricPrompt for fingerprint authentication
     */
    @ReactMethod
    fun authenticate(
        title: String,
        subtitle: String,
        cancelLabel: String,
        promise: Promise
    ) {
        UiThreadUtil.runOnUiThread {
            try {
                val activity = currentActivity
                if (activity == null) {
                    val errorMap = Arguments.createMap().apply {
                        putBoolean("success", false)
                        putString("error", "ACTIVITY_NULL")
                        putString("message", "Activity is not available")
                    }
                    promise.resolve(errorMap)
                    return@runOnUiThread
                }

                if (activity !is FragmentActivity) {
                    val errorMap = Arguments.createMap().apply {
                        putBoolean("success", false)
                        putString("error", "NOT_FRAGMENT_ACTIVITY")
                        putString("message", "Activity must be a FragmentActivity")
                    }
                    promise.resolve(errorMap)
                    return@runOnUiThread
                }

                val executor = ContextCompat.getMainExecutor(activity)
                var promiseHandled = false

                val callback = object : BiometricPrompt.AuthenticationCallback() {
                    override fun onAuthenticationSucceeded(result: BiometricPrompt.AuthenticationResult) {
                        super.onAuthenticationSucceeded(result)
                        if (!promiseHandled) {
                            promiseHandled = true
                            val map = Arguments.createMap().apply {
                                booleanMap("success", true)
                            }
                            promise.resolve(map)
                        }
                    }

                    override fun onAuthenticationError(errorCode: Int, errString: CharSequence) {
                        super.onAuthenticationError(errorCode, errString)
                        if (!promiseHandled) {
                            promiseHandled = true
                            val errorType = when (errorCode) {
                                BiometricPrompt.ERROR_USER_CANCELED,
                                BiometricPrompt.ERROR_NEGATIVE_BUTTON,
                                BiometricPrompt.ERROR_CANCELED -> "CANCELLED"
                                BiometricPrompt.ERROR_LOCKOUT,
                                BiometricPrompt.ERROR_LOCKOUT_PERMANENT -> "LOCKOUT"
                                BiometricPrompt.ERROR_NO_BIOMETRICS -> "NOT_ENROLLED"
                                else -> "ERROR"
                            }
                            val map = Arguments.createMap().apply {
                                booleanMap("success", false)
                                putString("error", errorType)
                                putString("message", errString.toString())
                                putInt("errorCode", errorCode)
                            }
                            promise.resolve(map)
                        }
                    }

                    override fun onAuthenticationFailed() {
                        super.onAuthenticationFailed()
                        // BiometricPrompt UI displays "Not recognized. Try again" automatically
                    }
                }

                val promptInfo = BiometricPrompt.PromptInfo.Builder()
                    .setTitle(title.ifBlank { "Fingerprint App Lock" })
                    .setSubtitle(subtitle.ifBlank { "Verify your fingerprint to access ChargeMesh" })
                    .setNegativeButtonText(cancelLabel.ifBlank { "Cancel" })
                    .setAllowedAuthenticators(BiometricManager.Authenticators.BIOMETRIC_STRONG)
                    .build()

                val biometricPrompt = BiometricPrompt(activity, executor, callback)
                biometricPrompt.authenticate(promptInfo)
            } catch (e: Exception) {
                val map = Arguments.createMap().apply {
                    putBoolean("success", false)
                    putString("error", "EXCEPTION")
                    putString("message", e.message ?: "Authentication failed")
                }
                promise.resolve(map)
            }
        }
    }

    /**
     * Open device security / fingerprint settings
     */
    @ReactMethod
    fun openSecuritySettings(promise: Promise) {
        try {
            val intent = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.R) {
                Intent(Settings.ACTION_BIOMETRIC_ENROLL).apply {
                    putExtra(
                        Settings.EXTRA_BIOMETRIC_AUTHENTICATORS_ALLOWED,
                        BiometricManager.Authenticators.BIOMETRIC_STRONG
                    )
                }
            } else {
                Intent(Settings.ACTION_SECURITY_SETTINGS)
            }
            intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
            reactContext.startActivity(intent)
            promise.resolve(true)
        } catch (e: Exception) {
            // Fallback to general security settings
            try {
                val fallbackIntent = Intent(Settings.ACTION_SECURITY_SETTINGS).apply {
                    addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
                }
                reactContext.startActivity(fallbackIntent)
                promise.resolve(true)
            } catch (fallbackEx: Exception) {
                promise.reject("SETTINGS_OPEN_FAILED", fallbackEx.message, fallbackEx)
            }
        }
    }

    private fun WritableMap.booleanMap(key: String, value: Boolean) {
        putBoolean(key, value)
    }
}
