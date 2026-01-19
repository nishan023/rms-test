import { useState, useEffect } from "react";
import { Plus, QrCode, Trash2 } from "lucide-react";
import { getAllTablesApi, createTableApi, generateQrApi, deleteTableApi } from "../../api/admin";
import QrDownloadModal from "../../components/admin/QrDownloadModal";
import FullscreenLoader from "../../components/common/FullscreenLoader";
import toast from "react-hot-toast";

interface Table {
  id: string;
  tableCode: string;
  tableType: "PHYSICAL" | "WALK_IN" | "ONLINE";
  isActive: boolean;
}

interface GroupedTables {
  PHYSICAL: Table[];
  WALK_IN: Table[];
  ONLINE: Table[];
}

const GenerateQr = () => {
  const [tables, setTables] = useState<GroupedTables>({
    PHYSICAL: [],
    WALK_IN: [],
    ONLINE: []
  });
  const [qrImage, setQrImage] = useState<string | null>(null);
  const [selectedTable, setSelectedTable] = useState("");
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // Tabs State
  const [activeTab, setActiveTab] = useState<"PHYSICAL" | "WALK_IN" | "ONLINE">("PHYSICAL");

  // Fetch all tables on mount
  useEffect(() => {
    fetchTables();
  }, []);

  const fetchTables = async () => {
    try {
      setLoading(true);
      const data = await getAllTablesApi();
      setTables(data.tables);
    } catch (error) {
      console.error("Failed to fetch tables", error);
      toast.error("Failed to load tables");
    } finally {
      setLoading(false);
    }
  };

  const handleTableSelect = async (tableCode: string) => {
    try {
      setLoading(true);
      const data = await generateQrApi(tableCode);
      setSelectedTable(tableCode);

      const rawImage = data.table.qrImage || "";
      const cleanQrImage = rawImage.startsWith('/') ? rawImage.slice(1) : rawImage;

      setQrImage(cleanQrImage);
      setOpen(true);
    } catch (error) {
      console.error("QR generation failed", error);
      toast.error("QR generation failed");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTable = async (tableType: "PHYSICAL" | "WALK_IN" | "ONLINE") => {
    try {
      setLoading(true);
      const data = await createTableApi(tableType);
      
      // Refresh tables list
      await fetchTables();
      
      toast.success(`${data.table.tableCode} created successfully!`);
      
      // Auto-open QR modal for the new table
      const rawImage = data.table.qrImage || "";
      const cleanQrImage = rawImage.startsWith('/') ? rawImage.slice(1) : rawImage;
      setSelectedTable(data.table.tableCode);
      setQrImage(cleanQrImage);
      setOpen(true);
    } catch (error: any) {
      console.error("Failed to create table", error);
      toast.error(error?.response?.data?.message || "Failed to create table");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTable = async (tableId: string, tableCode: string, e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (!confirm(`Are you sure you want to delete ${tableCode}? This cannot be undone.`)) {
      return;
    }

    try {
      setLoading(true);
      await deleteTableApi(tableId);
      await fetchTables();
      toast.success(`${tableCode} deleted successfully`);
    } catch (error: any) {
      console.error("Failed to delete table", error);
      toast.error(error?.response?.data?.message || "Failed to delete table");
    } finally {
      setLoading(false);
    }
  };

  // Helper to get tab details
  const getTabDetails = (tab: "PHYSICAL" | "WALK_IN" | "ONLINE") => {
    switch (tab) {
      case "PHYSICAL": return { title: "Dine-in Tables", label: "Tables", singularLabel: "Table", prefix: 'T' };
      case "WALK_IN": return { title: "Counter / Walk-in", label: "Counters", singularLabel: "Counter", prefix: 'C' };
      case "ONLINE": return { title: "Online Orders", label: "Online", singularLabel: "Online", prefix: 'O' };
    }
  };

  const currentTabDetails = getTabDetails(activeTab);
  
  // Filter tables to ensure they match the tab's prefix (e.g., 'T' for PHYSICAL)
  // This hides virtual tables (like "WALKIN-...") from the management UI
  const currentList = tables[activeTab].filter(t => 
    t.tableCode.toUpperCase().startsWith(currentTabDetails.prefix)
  );

  return (
    <div className="relative p-6 max-w-7xl mx-auto min-h-screen bg-gray-50">
      {loading && <FullscreenLoader text="Processing..." />}

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Generate QR Codes</h1>
        <p className="text-gray-600">Manage QR codes for tables, counters, and online orders.</p>
      </div>

      {/* Tabs Header */}
      <div className="flex gap-4 border-b border-gray-200 mb-8 overflow-x-auto">
        {(["PHYSICAL", "WALK_IN", "ONLINE"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-6 py-3 font-medium text-sm transition-all relative ${
              activeTab === tab 
                ? "text-[#16516f] font-bold" 
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            {getTabDetails(tab).label}
            {activeTab === tab && (
              <span className="absolute bottom-0 left-0 w-full h-0.5 bg-[#16516f]" />
            )}
          </button>
        ))}
      </div>

      {/* Active Tab Content */}
      <div className="animate-in fade-in duration-300">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-800">{currentTabDetails.title}</h2>
          <button
            onClick={() => handleCreateTable(activeTab)}
            className="flex items-center gap-2 px-6 py-2.5 bg-[#16516f] text-white rounded-lg hover:bg-[#11425c] transition-all shadow-md active:scale-95"
          >
            <Plus className="w-5 h-5" />
            Add {currentTabDetails.singularLabel}
          </button>
        </div>

        {currentList.length === 0 ? (
          <div className="bg-white border-2 border-dashed border-gray-300 rounded-xl p-12 text-center shadow-sm">
            <QrCode className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-medium text-gray-900 mb-1">No codes generated yet</h3>
            <p className="text-gray-500 mb-6">Create your first QR code for {currentTabDetails.title.toLowerCase()}.</p>
            <button
               onClick={() => handleCreateTable(activeTab)}
               className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium"
            >
              <Plus className="w-4 h-4" />
              Create New
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {currentList.map((table) => (
              <div
                key={table.id}
                className="group relative bg-white rounded-xl shadow-sm hover:shadow-xl transition-all border border-gray-100 overflow-hidden"
              >
                <button
                  onClick={() => handleTableSelect(table.tableCode)}
                  className="w-full p-6 flex flex-col items-center justify-center gap-3 h-full"
                >
                  <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center text-[#16516f] group-hover:bg-[#16516f] group-hover:text-white transition-colors">
                    <QrCode className="w-8 h-8" />
                  </div>
                  <span className="font-bold text-2xl text-gray-800">{table.tableCode}</span>
                </button>
                
                <button
                  onClick={(e) => handleDeleteTable(table.id, table.tableCode, e)}
                  className="absolute top-2 right-2 p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                  title="Delete"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {qrImage && (
        <QrDownloadModal
          open={open}
          qrImage={qrImage}
          table={selectedTable}
          onClose={() => setOpen(false)}
        />
      )}
    </div>
  );
};

export default GenerateQr;
