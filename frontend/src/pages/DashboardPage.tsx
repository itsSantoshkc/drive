import { useState } from "react";
import {
  Home,
  FileImage,
  FileVideo,
  FileAudio,
  FileText,
  Star,
  Trash2,
  Clock,
  HardDrive,
  ChevronDown,
  ChevronRight,
  Plus,
  Search,
  Grid3X3,
  List,
  Upload,
  FolderPlus,
  MoreVertical,
  Download,
  Share2,
  Pencil,
  Info,
  X,
  Folder,
  File,
  Filter,
  SortAsc,
  Sun,
  Moon,
} from "lucide-react";
import { useAppDispatch, useAppSelector } from "../hooks/useRedux";
import { toggleTheme } from "../store/slices/themeSlice";
import { setViewMode } from "../store/slices/viewSlice";

type SortBy = "name" | "date" | "size";

interface FileItem {
  id: string;
  name: string;
  type: "file" | "folder";
  fileType?: "image" | "video" | "audio" | "document" | "other";
  size?: string;
  modified: string;
  starred: boolean;
  shared: boolean;
  color?: string;
}

const mockFiles: FileItem[] = [
  { id: "1", name: "Documents", type: "folder", modified: "2024-01-15", starred: false, shared: false, color: "bg-blue-500" },
  { id: "2", name: "Images", type: "folder", modified: "2024-01-14", starred: true, shared: true, color: "bg-green-500" },
  { id: "3", name: "Videos", type: "folder", modified: "2024-01-13", starred: false, shared: false, color: "bg-purple-500" },
  { id: "4", name: "Music", type: "folder", modified: "2024-01-12", starred: false, shared: false, color: "bg-pink-500" },
  { id: "5", name: "Projects", type: "folder", modified: "2024-01-11", starred: true, shared: true, color: "bg-orange-500" },
  { id: "6", name: "presentation.pdf", type: "file", fileType: "document", size: "2.4 MB", modified: "2024-01-10", starred: false, shared: true },
  { id: "7", name: "photo-001.jpg", type: "file", fileType: "image", size: "3.8 MB", modified: "2024-01-09", starred: true, shared: false },
  { id: "8", name: "budget.xlsx", type: "file", fileType: "document", size: "156 KB", modified: "2024-01-08", starred: false, shared: false },
  { id: "9", name: "demo-video.mp4", type: "file", fileType: "video", size: "45.2 MB", modified: "2024-01-07", starred: false, shared: true },
  { id: "10", name: "notes.txt", type: "file", fileType: "other", size: "12 KB", modified: "2024-01-06", starred: false, shared: false },
  { id: "11", name: "logo.svg", type: "file", fileType: "image", size: "24 KB", modified: "2024-01-05", starred: true, shared: false },
  { id: "12", name: "podcast-ep1.mp3", type: "file", fileType: "audio", size: "18.5 MB", modified: "2024-01-04", starred: false, shared: false },
];

const sidebarItems = [
  { icon: Home, label: "My Drive", active: true, count: 12 },
  { icon: Clock, label: "Recent", active: false, count: 5 },
  { icon: Star, label: "Starred", active: false, count: 4 },
  { icon: Trash2, label: "Trash", active: false, count: 0 },
];

const storageItems = [
  { icon: FileImage, label: "Images", size: "2.4 GB", color: "text-green-500" },
  { icon: FileVideo, label: "Videos", size: "8.1 GB", color: "text-purple-500" },
  { icon: FileAudio, label: "Audio", size: "1.2 GB", color: "text-pink-500" },
  { icon: FileText, label: "Documents", size: "856 MB", color: "text-blue-500" },
];

export default function DashboardPage() {
  const dispatch = useAppDispatch();
  const viewMode = useAppSelector((state) => state.view.mode);
  const theme = useAppSelector((state) => state.theme.mode);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<SortBy>("name");
  const [selectedFiles, setSelectedFiles] = useState<string[]>([]);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; file: FileItem } | null>(null);
  const [currentPath, setCurrentPath] = useState<string[]>(["My Drive"]);

  const filteredFiles = mockFiles.filter((file) =>
    file.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const sortedFiles = [...filteredFiles].sort((a, b) => {
    if (a.type === "folder" && b.type !== "folder") return -1;
    if (a.type !== "folder" && b.type === "folder") return 1;
    switch (sortBy) {
      case "name":
        return a.name.localeCompare(b.name);
      case "date":
        return new Date(b.modified).getTime() - new Date(a.modified).getTime();
      case "size":
        return 0;
      default:
        return 0;
    }
  });

  const handleContextMenu = (e: React.MouseEvent, file: FileItem) => {
    e.preventDefault();
    setContextMenu({ x: e.clientX, y: e.clientY, file });
  };

  const getFileIcon = (file: FileItem) => {
    if (file.type === "folder") return <Folder className="h-6 w-6" />;
    switch (file.fileType) {
      case "image":
        return <FileImage className="h-6 w-6 text-green-500" />;
      case "video":
        return <FileVideo className="h-6 w-6 text-purple-500" />;
      case "audio":
        return <FileAudio className="h-6 w-6 text-pink-500" />;
      case "document":
        return <FileText className="h-6 w-6 text-blue-500" />;
      default:
        return <File className="h-6 w-6 text-slate-500" />;
    }
  };

  const toggleFileSelection = (id: string) => {
    setSelectedFiles((prev) =>
      prev.includes(id) ? prev.filter((f) => f !== id) : [...prev, id]
    );
  };

  const storageUsed = 12.55;
  const storageTotal = 15;
  const storagePercentage = (storageUsed / storageTotal) * 100;

  return (
    <div className={`min-h-screen flex ${theme === "dark" ? "bg-slate-900" : "bg-slate-50"}`}>
      {/* Sidebar */}
      <aside className={`w-64 flex flex-col ${theme === "dark" ? "bg-slate-800 border-slate-700" : "bg-white border-slate-200"} border-r`}>
        <div className={`p-4 border-b ${theme === "dark" ? "border-slate-700" : "border-slate-200"}`}>
          <div className="flex items-center gap-2">
            <HardDrive className="h-8 w-8 text-blue-600" />
            <span className={`text-xl font-bold ${theme === "dark" ? "text-white" : "text-slate-900"}`}>Drive</span>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {sidebarItems.map((item) => (
            <button
              key={item.label}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                item.active
                  ? "bg-blue-50 text-blue-600 font-medium dark:bg-blue-900/30 dark:text-blue-400"
                  : `${theme === "dark" ? "text-slate-300 hover:bg-slate-700" : "text-slate-600 hover:bg-slate-100"}`
              }`}
            >
              <item.icon className="h-5 w-5" />
              <span className="flex-1 text-left">{item.label}</span>
              {item.count > 0 && (
                <span className={`text-xs ${theme === "dark" ? "text-slate-500" : "text-slate-400"}`}>{item.count}</span>
              )}
            </button>
          ))}
        </nav>

        <div className={`p-4 border-t ${theme === "dark" ? "border-slate-700" : "border-slate-200"}`}>
          <div className="mb-3">
            <div className="flex justify-between text-sm mb-1">
              <span className={theme === "dark" ? "text-slate-300" : "text-slate-600"}>Storage</span>
              <span className={theme === "dark" ? "text-slate-400" : "text-slate-500"}>{storageUsed} GB / {storageTotal} GB</span>
            </div>
            <div className={`w-full rounded-full h-2 ${theme === "dark" ? "bg-slate-700" : "bg-slate-200"}`}>
              <div
                className="bg-blue-600 h-2 rounded-full transition-all"
                style={{ width: `${storagePercentage}%` }}
              />
            </div>
          </div>
          <div className="space-y-2">
            {storageItems.map((item) => (
              <div key={item.label} className="flex items-center gap-2 text-sm">
                <item.icon className={`h-4 w-4 ${item.color}`} />
                <span className={theme === "dark" ? "text-slate-300" : "text-slate-600"}>{item.label}</span>
                <span className={`${theme === "dark" ? "text-slate-500" : "text-slate-400"} ml-auto`}>{item.size}</span>
              </div>
            ))}
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className={`border-b px-6 py-4 ${theme === "dark" ? "bg-slate-800 border-slate-700" : "bg-white border-slate-200"}`}>
          <div className="flex items-center gap-4">
            <div className="flex-1 relative">
              <Search className={`absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 ${theme === "dark" ? "text-slate-500" : "text-slate-400"}`} />
              <input
                type="text"
                placeholder="Search in Drive"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`w-full pl-10 pr-4 py-2.5 rounded-lg border-0 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
                  theme === "dark" ? "bg-slate-700 text-white placeholder-slate-400 focus:bg-slate-600" : "bg-slate-100 focus:bg-white"
                }`}
              />
            </div>
            <button
              onClick={() => dispatch(toggleTheme())}
              className={`p-2.5 rounded-lg transition-colors ${
                theme === "dark" ? "bg-slate-700 text-yellow-400 hover:bg-slate-600" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>
            <button
              onClick={() => setShowUploadModal(true)}
              className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              <Plus className="h-5 w-5" />
              New
            </button>
          </div>

          {/* Breadcrumb */}
          <div className="flex items-center gap-2 mt-4">
            {currentPath.map((path, index) => (
              <div key={index} className="flex items-center gap-2">
                {index > 0 && <ChevronRight className={`h-4 w-4 ${theme === "dark" ? "text-slate-500" : "text-slate-400"}`} />}
                <button
                  className={`text-sm ${
                    index === currentPath.length - 1
                      ? `font-medium ${theme === "dark" ? "text-white" : "text-slate-900"}`
                      : `${theme === "dark" ? "text-slate-400 hover:text-slate-200" : "text-slate-500 hover:text-slate-700"}`
                  }`}
                >
                  {path}
                </button>
              </div>
            ))}
          </div>
        </header>

        {/* Toolbar */}
        <div className={`border-b px-6 py-3 flex items-center justify-between ${theme === "dark" ? "bg-slate-800 border-slate-700" : "bg-white border-slate-200"}`}>
          <div className="flex items-center gap-2">
            <button className={`flex items-center gap-2 px-3 py-1.5 text-sm rounded-lg transition-colors ${
              theme === "dark" ? "text-slate-300 hover:bg-slate-700" : "text-slate-600 hover:bg-slate-100"
            }`}>
              <Filter className="h-4 w-4" />
              Filter
            </button>
            <button className={`flex items-center gap-2 px-3 py-1.5 text-sm rounded-lg transition-colors ${
              theme === "dark" ? "text-slate-300 hover:bg-slate-700" : "text-slate-600 hover:bg-slate-100"
            }`}>
              <SortAsc className="h-4 w-4" />
              Sort by: {sortBy}
              <ChevronDown className="h-4 w-4" />
            </button>
          </div>
          <div className={`flex items-center gap-1 rounded-lg p-1 ${theme === "dark" ? "bg-slate-700" : "bg-slate-100"}`}>
            <button
              onClick={() => dispatch(setViewMode("grid"))}
              className={`p-2 rounded-md transition-colors ${
                viewMode === "grid" ? "bg-white shadow-sm text-blue-600 dark:bg-slate-600 dark:text-blue-400" : `${theme === "dark" ? "text-slate-400 hover:text-slate-200" : "text-slate-500 hover:text-slate-700"}`
              }`}
            >
              <Grid3X3 className="h-4 w-4" />
            </button>
            <button
              onClick={() => dispatch(setViewMode("list"))}
              className={`p-2 rounded-md transition-colors ${
                viewMode === "list" ? "bg-white shadow-sm text-blue-600 dark:bg-slate-600 dark:text-blue-400" : `${theme === "dark" ? "text-slate-400 hover:text-slate-200" : "text-slate-500 hover:text-slate-700"}`
              }`}
            >
              <List className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* File Explorer */}
        <div className="flex-1 overflow-auto p-6">
          {selectedFiles.length > 0 && (
            <div className={`mb-4 flex items-center gap-4 rounded-lg px-4 py-3 ${
              theme === "dark" ? "bg-blue-900/30" : "bg-blue-50"
            }`}>
              <span className={`text-sm ${theme === "dark" ? "text-blue-400" : "text-blue-700"}`}>{selectedFiles.length} selected</span>
              <div className="flex items-center gap-2">
                <button className={`p-2 rounded-lg transition-colors ${theme === "dark" ? "text-blue-400 hover:bg-blue-800/50" : "text-blue-600 hover:bg-blue-100"}`}>
                  <Download className="h-4 w-4" />
                </button>
                <button className={`p-2 rounded-lg transition-colors ${theme === "dark" ? "text-blue-400 hover:bg-blue-800/50" : "text-blue-600 hover:bg-blue-100"}`}>
                  <Share2 className="h-4 w-4" />
                </button>
                <button className={`p-2 rounded-lg transition-colors ${theme === "dark" ? "text-blue-400 hover:bg-blue-800/50" : "text-blue-600 hover:bg-blue-100"}`}>
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
              <button
                onClick={() => setSelectedFiles([])}
                className={`ml-auto p-1 rounded-lg transition-colors ${theme === "dark" ? "text-blue-400 hover:bg-blue-800/50" : "text-blue-600 hover:bg-blue-100"}`}
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          )}

          {viewMode === "grid" ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {sortedFiles.map((file) => (
                <div
                  key={file.id}
                  onContextMenu={(e) => handleContextMenu(e, file)}
                  onClick={() => toggleFileSelection(file.id)}
                  className={`group relative rounded-xl border p-4 cursor-pointer transition-all hover:shadow-md ${
                    selectedFiles.includes(file.id)
                      ? "border-blue-500 ring-2 ring-blue-200 dark:ring-blue-800"
                      : `${theme === "dark" ? "bg-slate-800 border-slate-700 hover:border-slate-600" : "bg-white border-slate-200 hover:border-slate-300"}`
                  }`}
                >
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      // Toggle star
                    }}
                    className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Star
                      className={`h-4 w-4 ${
                        file.starred ? "fill-yellow-400 text-yellow-400" : `${theme === "dark" ? "text-slate-500 hover:text-yellow-400" : "text-slate-400 hover:text-yellow-400"}`
                      }`}
                    />
                  </button>
                  <div className={`w-12 h-12 rounded-lg flex items-center justify-center mb-3 ${
                    file.type === "folder" ? `${file.color} text-white` : `${theme === "dark" ? "bg-slate-700" : "bg-slate-100"}`
                  }`}>
                    {getFileIcon(file)}
                  </div>
                  <h3 className={`font-medium truncate ${theme === "dark" ? "text-white" : "text-slate-900"}`}>{file.name}</h3>
                  <p className={`text-xs mt-1 ${theme === "dark" ? "text-slate-400" : "text-slate-500"}`}>
                    {file.type === "folder" ? `${Math.floor(Math.random() * 10) + 1} items` : file.size}
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    {file.shared && (
                      <Share2 className={`h-3 w-3 ${theme === "dark" ? "text-slate-500" : "text-slate-400"}`} />
                    )}
                    <span className={`text-xs ${theme === "dark" ? "text-slate-500" : "text-slate-400"}`}>{file.modified}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className={`rounded-xl border overflow-hidden ${theme === "dark" ? "bg-slate-800 border-slate-700" : "bg-white border-slate-200"}`}>
              <table className="w-full">
                <thead className={`border-b ${theme === "dark" ? "bg-slate-700/50 border-slate-700" : "bg-slate-50 border-slate-200"}`}>
                  <tr>
                    <th className={`text-left px-4 py-3 text-xs font-medium uppercase tracking-wider ${theme === "dark" ? "text-slate-400" : "text-slate-500"}`}>
                      Name
                    </th>
                    <th className={`text-left px-4 py-3 text-xs font-medium uppercase tracking-wider hidden md:table-cell ${theme === "dark" ? "text-slate-400" : "text-slate-500"}`}>
                      Modified
                    </th>
                    <th className={`text-left px-4 py-3 text-xs font-medium uppercase tracking-wider hidden lg:table-cell ${theme === "dark" ? "text-slate-400" : "text-slate-500"}`}>
                      Size
                    </th>
                    <th className="w-10"></th>
                  </tr>
                </thead>
                <tbody className={`divide-y ${theme === "dark" ? "divide-slate-700" : "divide-slate-200"}`}>
                  {sortedFiles.map((file) => (
                    <tr
                      key={file.id}
                      onContextMenu={(e) => handleContextMenu(e, file)}
                      onClick={() => toggleFileSelection(file.id)}
                      className={`cursor-pointer transition-colors ${
                        selectedFiles.includes(file.id)
                          ? `${theme === "dark" ? "bg-blue-900/30" : "bg-blue-50"}`
                          : `${theme === "dark" ? "hover:bg-slate-700/50" : "hover:bg-slate-50"}`
                      }`}
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded flex items-center justify-center ${
                            file.type === "folder" ? `${file.color} text-white` : `${theme === "dark" ? "bg-slate-700" : "bg-slate-100"}`
                          }`}>
                            {file.type === "folder" ? (
                              <Folder className="h-4 w-4" />
                            ) : (
                              getFileIcon(file)
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            <span className={`font-medium ${theme === "dark" ? "text-white" : "text-slate-900"}`}>{file.name}</span>
                            {file.starred && <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />}
                            {file.shared && <Share2 className={`h-3 w-3 ${theme === "dark" ? "text-slate-500" : "text-slate-400"}`} />}
                          </div>
                        </div>
                      </td>
                      <td className={`px-4 py-3 text-sm hidden md:table-cell ${theme === "dark" ? "text-slate-400" : "text-slate-500"}`}>{file.modified}</td>
                      <td className={`px-4 py-3 text-sm hidden lg:table-cell ${theme === "dark" ? "text-slate-400" : "text-slate-500"}`}>
                        {file.type === "folder" ? "—" : file.size}
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleContextMenu(e, file);
                          }}
                          className={`p-1 rounded transition-colors ${theme === "dark" ? "text-slate-500 hover:text-slate-300 hover:bg-slate-700" : "text-slate-400 hover:text-slate-600 hover:bg-slate-100"}`}
                        >
                          <MoreVertical className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      {/* Context Menu */}
      {contextMenu && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setContextMenu(null)}
          />
          <div
            className={`fixed z-50 rounded-xl shadow-lg border py-2 min-w-[180px] ${
              theme === "dark" ? "bg-slate-800 border-slate-700" : "bg-white border-slate-200"
            }`}
            style={{ left: contextMenu.x, top: contextMenu.y }}
          >
            <button className={`w-full flex items-center gap-3 px-4 py-2 text-sm transition-colors ${
              theme === "dark" ? "text-slate-300 hover:bg-slate-700" : "text-slate-700 hover:bg-slate-100"
            }`}>
              <FolderPlus className="h-4 w-4" />
              Open
            </button>
            <button className={`w-full flex items-center gap-3 px-4 py-2 text-sm transition-colors ${
              theme === "dark" ? "text-slate-300 hover:bg-slate-700" : "text-slate-700 hover:bg-slate-100"
            }`}>
              <Share2 className="h-4 w-4" />
              Share
            </button>
            <button className={`w-full flex items-center gap-3 px-4 py-2 text-sm transition-colors ${
              theme === "dark" ? "text-slate-300 hover:bg-slate-700" : "text-slate-700 hover:bg-slate-100"
            }`}>
              <Download className="h-4 w-4" />
              Download
            </button>
            <button className={`w-full flex items-center gap-3 px-4 py-2 text-sm transition-colors ${
              theme === "dark" ? "text-slate-300 hover:bg-slate-700" : "text-slate-700 hover:bg-slate-100"
            }`}>
              <Pencil className="h-4 w-4" />
              Rename
            </button>
            <button className={`w-full flex items-center gap-3 px-4 py-2 text-sm transition-colors ${
              theme === "dark" ? "text-slate-300 hover:bg-slate-700" : "text-slate-700 hover:bg-slate-100"
            }`}>
              <Info className="h-4 w-4" />
              Details
            </button>
            <div className={`border-t my-1 ${theme === "dark" ? "border-slate-700" : "border-slate-200"}`} />
            <button className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
              <Trash2 className="h-4 w-4" />
              Delete
            </button>
          </div>
        </>
      )}

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className={`rounded-2xl shadow-xl w-full max-w-md mx-4 overflow-hidden ${
            theme === "dark" ? "bg-slate-800" : "bg-white"
          }`}>
            <div className={`flex items-center justify-between px-6 py-4 border-b ${
              theme === "dark" ? "border-slate-700" : "border-slate-200"
            }`}>
              <h2 className={`text-lg font-semibold ${theme === "dark" ? "text-white" : "text-slate-900"}`}>Upload to Drive</h2>
              <button
                onClick={() => setShowUploadModal(false)}
                className={`p-1 rounded-lg transition-colors ${
                  theme === "dark" ? "text-slate-400 hover:text-slate-200 hover:bg-slate-700" : "text-slate-400 hover:text-slate-600 hover:bg-slate-100"
                }`}
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-6">
              <div className={`border-2 border-dashed rounded-xl p-12 text-center transition-colors cursor-pointer ${
                theme === "dark" ? "border-slate-600 hover:border-blue-500 hover:bg-blue-900/20" : "border-slate-300 hover:border-blue-400 hover:bg-blue-50"
              }`}>
                <Upload className={`h-12 w-12 mx-auto mb-4 ${theme === "dark" ? "text-slate-500" : "text-slate-400"}`} />
                <p className={`font-medium ${theme === "dark" ? "text-slate-300" : "text-slate-600"}`}>Drag & drop files here</p>
                <p className={`text-sm mt-1 ${theme === "dark" ? "text-slate-400" : "text-slate-500"}`}>or click to browse</p>
                <p className={`text-xs mt-4 ${theme === "dark" ? "text-slate-500" : "text-slate-400"}`}>Maximum file size: 50 MB</p>
              </div>
              <div className="mt-6 flex gap-3">
                <button
                  onClick={() => setShowUploadModal(false)}
                  className={`flex-1 px-4 py-2.5 border rounded-lg font-medium transition-colors ${
                    theme === "dark" ? "border-slate-600 text-slate-300 hover:bg-slate-700" : "border-slate-300 text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  Cancel
                </button>
                <button className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors">
                  Upload
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
