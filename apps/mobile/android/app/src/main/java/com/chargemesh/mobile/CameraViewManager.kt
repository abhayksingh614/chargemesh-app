package com.chargemesh.mobile

import com.facebook.react.common.MapBuilder
import com.facebook.react.uimanager.SimpleViewManager
import com.facebook.react.uimanager.ThemedReactContext
import com.facebook.react.uimanager.annotations.ReactProp

class CameraViewManager : SimpleViewManager<NativeCameraView>() {

    override fun getName(): String = "CameraView"

    override fun createViewInstance(reactContext: ThemedReactContext): NativeCameraView {
        return NativeCameraView(reactContext)
    }

    @ReactProp(name = "torchEnabled")
    fun setTorchEnabled(view: NativeCameraView, enabled: Boolean) {
        view.setTorchEnabled(enabled)
    }

    @ReactProp(name = "isActive")
    fun setIsActive(view: NativeCameraView, active: Boolean) {
        view.setIsActive(active)
    }

    override fun getExportedCustomDirectEventTypeConstants(): MutableMap<String, Any>? {
        return MapBuilder.of(
            "onQrCodeScanned",
            MapBuilder.of("registrationName", "onQrCodeScanned")
        )
    }
}
