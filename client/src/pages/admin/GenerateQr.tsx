import { useState } from "react";
import TableSelector from "../../components/admin/TableSelector";
import QrDownloadModal from "../../components/admin/QrDownloadModal";
import FullscreenLoader from "../../components/common/FullscreenLoader";
import { generateQrApi } from "../../api/admin";

const GenerateQr = () => {
  const [qrImage, setQrImage] = useState<string | null>(null);
  const [table, setTable] = useState("");
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleTableSelect = async (tableCode: string) => {
    try {
      setLoading(true);

      const data = await generateQrApi(tableCode);

      setTable(tableCode);

      // The backend returns a Base64 string. 
      // Ensure it's not treated as a relative path by checking if it starts with "data:image"
      // If it accidentally got a leading slash in production, we strip it.
      const rawImage = data.table.qrImage || "";
      const cleanQrImage = rawImage.startsWith('/') ? rawImage.slice(1) : rawImage;

      setQrImage(cleanQrImage);
      setOpen(true);
    } catch (error) {
      console.error("QR generation failed", error);
      alert("QR generation failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative p-6">
      {loading && <FullscreenLoader text="Generating QR code..." />}

      <h1 className="text-xl font-bold mb-6">Generate Table QR</h1>

      <TableSelector mode="admin" onSelect={handleTableSelect} />

      {qrImage && (
        <QrDownloadModal
          open={open}
          qrImage={qrImage}
          table={table}
          onClose={() => setOpen(false)}
        />
      )}
    </div>
  );
};

export default GenerateQr;
