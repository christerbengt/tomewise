import { useEffect, useRef, useState } from "react";
import { BrowserMultiFormatReader } from "@zxing/browser";

interface BarcodeScannerProps {
  onScan: (isbn: string) => void;
  onClose: () => void;
}

const BarcodeScanner = ({ onScan, onClose }: BarcodeScannerProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [error, setError] = useState<string | null>(null);
  const readerRef = useRef<BrowserMultiFormatReader | null>(null);
  const hasScanned = useRef(false);

  useEffect(() => {
    const reader = new BrowserMultiFormatReader();
    readerRef.current = reader;

    const start = async () => {
      try {
        const devices = await BrowserMultiFormatReader.listVideoInputDevices();
        if (devices.length === 0) {
          setError("No camera found.");
          return;
        }

        const deviceId = devices[devices.length - 1].deviceId;

        await reader.decodeFromVideoDevice(
          deviceId,
          videoRef.current!,
          (result, err) => {
            if (result && !hasScanned.current) {
              hasScanned.current = true;
              BrowserMultiFormatReader.releaseAllStreams();
              onScan(result.getText());
            }
            if (err && err.name !== "NotFoundException") {
              console.error(err);
            }
          },
        );
      } catch {
        setError("Could not access camera. Please check permissions.");
      }
    };

    start();

    return () => {
      BrowserMultiFormatReader.releaseAllStreams();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="barcode-scanner">
      <div className="scanner-header">
        <span>Point camera at barcode</span>
        <button className="button-secondary" onClick={onClose}>
          Cancel
        </button>
      </div>
      {error ? (
        <p className="error">{error}</p>
      ) : (
        <div className="scanner-viewport">
          <video ref={videoRef} className="scanner-video" playsInline muted />
          <div className="scanner-overlay">
            <div className="scanner-frame" />
          </div>
        </div>
      )}
    </div>
  );
};

export default BarcodeScanner;
