package com.chargemesh.mobile

import android.content.Context
import android.content.ContextWrapper
import android.util.AttributeSet
import android.widget.FrameLayout
import androidx.annotation.OptIn
import androidx.camera.core.Camera
import androidx.camera.core.CameraSelector
import androidx.camera.core.ExperimentalGetImage
import androidx.camera.core.ImageAnalysis
import androidx.camera.core.ImageProxy
import androidx.camera.core.Preview
import androidx.camera.lifecycle.ProcessCameraProvider
import androidx.camera.view.PreviewView
import androidx.core.content.ContextCompat
import androidx.lifecycle.LifecycleOwner
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.ReactContext
import com.facebook.react.bridge.WritableMap
import com.facebook.react.uimanager.events.RCTEventEmitter
import com.google.mlkit.vision.barcode.BarcodeScanner
import com.google.mlkit.vision.barcode.BarcodeScannerOptions
import com.google.mlkit.vision.barcode.BarcodeScanning
import com.google.mlkit.vision.barcode.common.Barcode
import com.google.mlkit.vision.common.InputImage
import java.util.concurrent.ExecutorService
import java.util.concurrent.Executors
import java.util.concurrent.atomic.AtomicBoolean

class NativeCameraView @JvmOverloads constructor(
    context: Context,
    attrs: AttributeSet? = null,
    defStyleAttr: Int = 0
) : FrameLayout(context, attrs, defStyleAttr) {

    private val previewView: PreviewView = PreviewView(context).apply {
        scaleType = PreviewView.ScaleType.FILL_CENTER
        layoutParams = LayoutParams(LayoutParams.MATCH_PARENT, LayoutParams.MATCH_PARENT)
    }

    private var cameraProvider: ProcessCameraProvider? = null
    private var camera: Camera? = null
    private var cameraExecutor: ExecutorService? = null
    private var barcodeScanner: BarcodeScanner? = null

    private var isTorchEnabled: Boolean = false
    private var isActive: Boolean = true
    private val isProcessing = AtomicBoolean(false)
    private var lastScannedCode: String = ""
    private var lastScannedTimestamp: Long = 0L

    init {
        addView(previewView)
        val options = BarcodeScannerOptions.Builder()
            .setBarcodeFormats(Barcode.FORMAT_QR_CODE, Barcode.FORMAT_ALL_FORMATS)
            .build()
        barcodeScanner = BarcodeScanning.getClient(options)
    }

    override fun onAttachedToWindow() {
        super.onAttachedToWindow()
        if (isActive) {
            post { startCamera() }
        }
    }

    fun setTorchEnabled(enabled: Boolean) {
        isTorchEnabled = enabled
        camera?.cameraControl?.enableTorch(enabled)
    }

    fun setIsActive(active: Boolean) {
        isActive = active
        if (!active) {
            cameraProvider?.unbindAll()
            shutdownExecutor()
        } else {
            post { startCamera() }
        }
    }

    private fun getOrCreateExecutor(): ExecutorService {
        val current = cameraExecutor
        if (current == null || current.isShutdown || current.isTerminated) {
            val newExecutor = Executors.newSingleThreadExecutor()
            cameraExecutor = newExecutor
            return newExecutor
        }
        return current
    }

    private fun shutdownExecutor() {
        try {
            cameraExecutor?.shutdown()
            cameraExecutor = null
        } catch (_: Exception) {}
    }

    private fun getLifecycleOwner(): LifecycleOwner? {
        var currentContext: Context? = context
        while (currentContext != null) {
            if (currentContext is LifecycleOwner) {
                return currentContext
            }
            if (currentContext is ReactContext) {
                val act = currentContext.currentActivity
                if (act is LifecycleOwner) {
                    return act
                }
            }
            if (currentContext is ContextWrapper) {
                currentContext = currentContext.baseContext
            } else {
                break
            }
        }
        return null
    }

    private fun startCamera() {
        if (!isActive) return

        val cameraProviderFuture = ProcessCameraProvider.getInstance(context)
        cameraProviderFuture.addListener({
            try {
                cameraProvider = cameraProviderFuture.get()
                bindCameraUseCases()
            } catch (e: Exception) {
                e.printStackTrace()
            }
        }, ContextCompat.getMainExecutor(context))
    }

    private fun bindCameraUseCases() {
        val provider = cameraProvider ?: return
        val lifecycleOwner = getLifecycleOwner() ?: return

        val preview = Preview.Builder().build().also {
            it.setSurfaceProvider(previewView.surfaceProvider)
        }

        val executor = getOrCreateExecutor()
        val imageAnalysis = ImageAnalysis.Builder()
            .setBackpressureStrategy(ImageAnalysis.STRATEGY_KEEP_ONLY_LATEST)
            .build()

        imageAnalysis.setAnalyzer(executor) { imageProxy ->
            processImageProxy(imageProxy)
        }

        val cameraSelector = CameraSelector.DEFAULT_BACK_CAMERA

        try {
            provider.unbindAll()
            camera = provider.bindToLifecycle(
                lifecycleOwner,
                cameraSelector,
                preview,
                imageAnalysis
            )
            // Apply torch if set
            camera?.cameraControl?.enableTorch(isTorchEnabled)
        } catch (e: Exception) {
            e.printStackTrace()
        }
    }

    @OptIn(ExperimentalGetImage::class)
    private fun processImageProxy(imageProxy: ImageProxy) {
        if (!isActive) {
            imageProxy.close()
            return
        }

        val mediaImage = imageProxy.image
        val scanner = barcodeScanner
        if (mediaImage == null || scanner == null || isProcessing.get()) {
            imageProxy.close()
            return
        }

        val image = InputImage.fromMediaImage(mediaImage, imageProxy.imageInfo.rotationDegrees)
        isProcessing.set(true)

        scanner.process(image)
            .addOnSuccessListener { barcodes ->
                for (barcode in barcodes) {
                    val rawValue = barcode.rawValue
                    if (!rawValue.isNullOrBlank()) {
                        val now = System.currentTimeMillis()
                        // Throttle repeat scans within 1.5s
                        if (rawValue != lastScannedCode || now - lastScannedTimestamp > 1500) {
                            lastScannedCode = rawValue
                            lastScannedTimestamp = now
                            emitQrCodeEvent(rawValue)
                        }
                    }
                }
            }
            .addOnFailureListener {
                // Ignore frame parse failure
            }
            .addOnCompleteListener {
                isProcessing.set(false)
                imageProxy.close()
            }
    }

    private fun emitQrCodeEvent(code: String) {
        var currentContext: Context? = context
        var rContext: ReactContext? = null
        while (currentContext != null) {
            if (currentContext is ReactContext) {
                rContext = currentContext
                break
            }
            if (currentContext is ContextWrapper) {
                currentContext = currentContext.baseContext
            } else {
                break
            }
        }

        rContext?.let {
            val event: WritableMap = Arguments.createMap().apply {
                putString("code", code)
            }
            it.getJSModule(RCTEventEmitter::class.java).receiveEvent(
                id,
                "onQrCodeScanned",
                event
            )
        }
    }

    override fun onDetachedFromWindow() {
        super.onDetachedFromWindow()
        cameraProvider?.unbindAll()
        shutdownExecutor()
    }
}
