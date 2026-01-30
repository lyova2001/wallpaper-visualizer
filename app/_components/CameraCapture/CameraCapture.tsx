"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import styles from "./cameraCapture.module.scss";

type UploadResult = {
  ok: boolean;
  imageBase64?: string;
  error?: string;
};

export default function CameraCapture() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [ready, setReady] = useState(false);
  const [permissionError, setPermissionError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<UploadResult | null>(null);

  const canUseCamera = useMemo(() => {
    return typeof navigator !== "undefined" && !!navigator.mediaDevices?.getUserMedia;
  }, []);

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  const startCamera = async () => {
    setPermissionError(null);
    setResult(null);

    if (!canUseCamera) {
      setPermissionError("No camera supported on this device");
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: "environment" },
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      });

      streamRef.current = stream;

      if (!videoRef.current) return;
      videoRef.current.srcObject = stream;
      await videoRef.current.play();

      setReady(true);
    } catch (e: any) {
      setPermissionError(
        e?.name === "NotAllowedError"
          ? "Please, give permission to use the camera on your device"
          : e?.message ?? "Error occurred while running the camera"
      );
      setReady(false);
    }
  };

  const stopCamera = () => {
    const stream = streamRef.current;
    if (stream) {
      stream.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setReady(false);
  };

  const takePhotoAndUpload = async () => {
    setPermissionError(null);
    setResult(null);

    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    const w = video.videoWidth;
    const h = video.videoHeight;

    if (!w || !h) {
      setPermissionError("It's not ready yet");
      return;
    }

    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.drawImage(video, 0, 0, w, h);

    setBusy(true);
    try {
      const blob: Blob | null = await new Promise((resolve) =>
        canvas.toBlob(resolve, "image/jpeg", 0.9)
      );

      if (!blob) throw new Error("Can't take a photo");

      const form = new FormData();
      form.append("photo", blob, "photo.jpg");

      const res = await fetch("/api/photo", {
        method: "POST",
        body: form,
      });

      const data = (await res.json()) as UploadResult;

      if (!res.ok || !data.ok) {
        throw new Error(data.error || "Upload failed");
      }

      setResult(data);
    } catch (e: any) {
      setResult({ ok: false, error: e?.message ?? "Error while sending photo" });
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className={styles.root}>
      <div className={styles.header}>
        <div className={styles.title}>Wallpaper visualizer MVP</div>
        <div className={styles.subtitle}>
          Open the camera → take a photo.
        </div>
      </div>

      {permissionError && <div className={styles.error}>{permissionError}</div>}

      <div className={styles.videoWrap}>
        <video
          ref={videoRef}
          playsInline
          muted
          className={styles.video}
        />
      </div>

      <canvas ref={canvasRef} className={styles.hiddenCanvas} />

      <div className={styles.controls}>
        {!ready ? (
          <button onClick={startCamera} className={styles.button}>
            Start camera
          </button>
        ) : (
          <>
            <button
              onClick={takePhotoAndUpload}
              className={styles.button}
              disabled={busy}
            >
              {busy ? "Uploading..." : "Take photo"}
            </button>
            <button
              onClick={stopCamera}
              className={styles.buttonSecondary}
              disabled={busy}
            >
              Stop
            </button>
          </>
        )}
      </div>

      {result && (
        <div className={styles.result}>
          {result.ok ? (
            <>
              <div className={styles.resultTitle}>Server response</div>
              {result.imageBase64 ? (
                <img
                  src={result.imageBase64}
                  alt="Server result"
                  className={styles.resultImage}
                />
              ) : (
                <div className={styles.resultText}>OK (no image returned)</div>
              )}
            </>
          ) : (
            <div className={styles.error}>{result.error || "Unknown error"}</div>
          )}
        </div>
      )}
    </div>
  );
}
