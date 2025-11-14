import { useEffect, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface QRCodeScannerProps {
  onScanSuccess: (data: any) => void;
}

const QRCodeScanner = ({ onScanSuccess }: QRCodeScannerProps) => {
  const [isScanning, setIsScanning] = useState(false);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const elementId = "qr-reader";

  useEffect(() => {
    return () => {
      if (scannerRef.current?.isScanning) {
        scannerRef.current.stop();
      }
    };
  }, []);

  const startScanning = async () => {
    try {
      if (!scannerRef.current) {
        scannerRef.current = new Html5Qrcode(elementId);
      }

      await scannerRef.current.start(
        { facingMode: "environment" },
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
        },
        (decodedText) => {
          try {
            const data = JSON.parse(decodedText);
            onScanSuccess(data);
            stopScanning();
            toast.success("QR code scanned successfully");
          } catch (error) {
            toast.error("Invalid QR code format");
          }
        },
        (errorMessage) => {
          // Scanning errors are normal, ignore them
        }
      );
      setIsScanning(true);
    } catch (error: any) {
      toast.error("Failed to start camera");
      console.error(error);
    }
  };

  const stopScanning = async () => {
    if (scannerRef.current?.isScanning) {
      await scannerRef.current.stop();
      setIsScanning(false);
    }
  };

  return (
    <div className="space-y-4">
      <div
        id={elementId}
        className="w-full rounded-lg overflow-hidden bg-muted/50"
        style={{ minHeight: "300px" }}
      />
      <div className="flex gap-2">
        {!isScanning ? (
          <Button onClick={startScanning} className="w-full">
            Start Scanning
          </Button>
        ) : (
          <Button onClick={stopScanning} variant="destructive" className="w-full">
            Stop Scanning
          </Button>
        )}
      </div>
    </div>
  );
};

export default QRCodeScanner;
