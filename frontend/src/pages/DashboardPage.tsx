import { useState, useMemo, useRef, useEffect } from "react";
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
  ArrowLeft,
  Check,
  RotateCcw,
} from "lucide-react";
import { useAppDispatch, useAppSelector } from "../hooks/useRedux";
import { toggleTheme } from "../store/slices/themeSlice";
import { setViewMode } from "../store/slices/viewSlice";

type SortBy = "name" | "date" | "size";
type FilterType = "all" | "folders" | "images" | "videos" | "audio" | "documents";
type SidebarView = "my-drive" | "recent" | "starred" | "trash";

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
  parentId: string | null;
}

const folderColors = [
  "bg-blue-500",
  "bg-green-500",
  "bg-purple-500",
  "bg-pink-500",
  "bg-orange-500",
  "bg-teal-500",
  "bg-indigo-500",
  "bg-rose-500",
];

const initialFiles: FileItem[] = [
  { id: "1", name: "Documents", type: "folder", modified: "2024-01-15", starred: false, shared: false, color: "bg-blue-500", parentId: null },
  { id: "2", name: "Images", type: "folder", modified: "2024-01-14", starred: true, shared: true, color: "bg-green-500", parentId: null },
  { id: "3", name: "Videos", type: "folder", modified: "2024-01-13", starred: false, shared: false, color: "bg-purple-500", parentId: null },
  { id: "4", name: "Music", type: "folder", modified: "2024-01-12", starred: false, shared: false, color: "bg-pink-500", parentId: null },
  { id: "5", name: "Projects", type: "folder", modified: "2024-01-11", starred: true, shared: true, color: "bg-orange-500", parentId: null },
  { id: "6", name: "presentation.pdf", type: "file", fileType: "document", size: "2.4 MB", modified: "2024-01-10", starred: false, shared: true, parentId: null },
  { id: "7", name: "photo-001.jpg", type: "file", fileType: "image", size: "3.8 MB", modified: "2024-01-09", starred: true, shared: false, parentId: null },
  { id: "8", name: "budget.xlsx", type: "file", fileType: "document", size: "156 KB", modified: "2024-01-08", starred: false, shared: false, parentId: null },
  { id: "9", name: "demo-video.mp4", type: "file", fileType: "video", size: "45.2 MB", modified: "2024-01-07", starred: false, shared: true, parentId: null },
  { id: "10", name: "notes.txt", type: "file", fileType: "other", size: "12 KB", modified: "2024-01-06", starred: false, shared: false, parentId: null },
  { id: "11", name: "logo.svg", type: "file", fileType: "image", size: "24 KB", modified: "2024-01-05", starred: true, shared: false, parentId: null },
  { id: "12", name: "podcast-ep1.mp3", type: "file", fileType: "audio", size: "18.5 MB", modified: "2024-01-04", starred: false, shared: false, parentId: null },
  // Documents folder contents
  { id: "20", name: "Work", type: "folder", modified: "2024-01-20", starred: false, shared: false, color: "bg-indigo-500", parentId: "1" },
  { id: "21", name: "Personal", type: "folder", modified: "2024-01-19", starred: false, shared: false, color: "bg-teal-500", parentId: "1" },
  { id: "22", name: "resume.pdf", type: "file", fileType: "document", size: "245 KB", modified: "2024-01-18", starred: true, shared: true, parentId: "1" },
  { id: "23", name: "cover-letter.docx", type: "file", fileType: "document", size: "56 KB", modified: "2024-01-17", starred: false, shared: false, parentId: "1" },
  // Images folder contents
  { id: "30", name: "Vacation", type: "folder", modified: "2024-01-25", starred: true, shared: false, color: "bg-rose-500", parentId: "2" },
  { id: "31", name: "profile.jpg", type: "file", fileType: "image", size: "2.1 MB", modified: "2024-01-24", starred: false, shared: true, parentId: "2" },
  { id: "32", name: "banner.png", type: "file", fileType: "image", size: "4.5 MB", modified: "2024-01-23", starred: false, shared: false, parentId: "2" },
  // Work folder contents
  { id: "40", name: "report-q4.pdf", type: "file", fileType: "document", size: "1.8 MB", modified: "2024-01-22", starred: true, shared: true, parentId: "20" },
  { id: "41", name: "meeting-notes.txt", type: "file", fileType: "other", size: "8 KB", modified: "2024-01-21", starred: false, shared: false, parentId: "20" },
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
  const [files, setFiles] = useState<FileItem[]>(initialFiles);
  const [trashedFiles, setTrashedFiles] = useState<FileItem[]>([]);
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);
  const [sidebarView, setSidebarView] = useState<SidebarView>("my-drive");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<SortBy>("name");
  const [filterType, setFilterType] = useState<FilterType>("all");
  const [selectedFiles, setSelectedFiles] = useState<string[]>([]);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showCreateFolderModal, setShowCreateFolderModal] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; file: FileItem } | null>(null);
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState("");
  const [draggedItem, setDraggedItem] = useState<FileItem | null>(null);
  const [dragOverFolder, setDragOverFolder] = useState<string | null>(null);
  const [isDraggingOverEmpty, setIsDraggingOverEmpty] = useState(false);
  const [showSortDropdown, setShowSortDropdown] = useState(false);
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const sortDropdownRef = useRef<HTMLDivElement>(null);
  const filterDropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (sortDropdownRef.current && !sortDropdownRef.current.contains(e.target as Node)) {
        setShowSortDropdown(false);
      }
      if (filterDropdownRef.current && !filterDropdownRef.current.contains(e.target as Node)) {
        setShowFilterDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Build breadcrumb path
  const breadcrumbPath = useMemo(() => {
    const path: { id: string | null; name: string }[] = [];
    let folderId: string | null = currentFolderId;
    
    while (folderId !== null) {
      const folder = files.find((f) => f.id === folderId);
      if (folder) {
        path.unshift({ id: folder.id, name: folder.name });
        folderId = folder.parentId;
      } else {
        break;
      }
    }
    
    path.unshift({ id: null, name: "My Drive" });
    return path;
  }, [currentFolderId, files]);

  // Get current folder contents based on sidebar view
  const currentFiles = useMemo(() => {
    let filtered: FileItem[] = [];

    // Base filtering by sidebar view
    switch (sidebarView) {
      case "my-drive":
        if (searchQuery) {
          filtered = files.filter((f) =>
            f.name.toLowerCase().includes(searchQuery.toLowerCase())
          );
        } else {
          filtered = files.filter((f) => f.parentId === currentFolderId);
        }
        break;
      case "recent":
        filtered = [...files]
          .filter((f) => f.type === "file")
          .sort((a, b) => new Date(b.modified).getTime() - new Date(a.modified).getTime())
          .slice(0, 10);
        break;
      case "starred":
        filtered = files.filter((f) => f.starred);
        break;
      case "trash":
        filtered = trashedFiles;
        break;
    }

    // Apply type filter
    if (filterType !== "all" && sidebarView === "my-drive") {
      filtered = filtered.filter((f) => {
        switch (filterType) {
          case "folders":
            return f.type === "folder";
          case "images":
            return f.fileType === "image";
          case "videos":
            return f.fileType === "video";
          case "audio":
            return f.fileType === "audio";
          case "documents":
            return f.fileType === "document";
          default:
            return true;
        }
      });
    }

    // Apply sorting
    return filtered.sort((a, b) => {
      if (sidebarView === "my-drive") {
        if (a.type === "folder" && b.type !== "folder") return -1;
        if (a.type !== "folder" && b.type === "folder") return 1;
      }
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
  }, [files, trashedFiles, currentFolderId, searchQuery, sortBy, filterType, sidebarView]);

  const handleContextMenu = (e: React.MouseEvent, file: FileItem) => {
    e.preventDefault();
    e.stopPropagation();
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

  const handleDoubleClick = (file: FileItem) => {
    if (file.type === "folder") {
      setCurrentFolderId(file.id);
      setSelectedFiles([]);
      setSearchQuery("");
    }
  };

  const handleBreadcrumbClick = (folderId: string | null) => {
    setCurrentFolderId(folderId);
    setSelectedFiles([]);
    setSearchQuery("");
  };

  const handleCreateFolder = () => {
    if (newFolderName.trim()) {
      const newFolder: FileItem = {
        id: `folder-${Date.now()}`,
        name: newFolderName.trim(),
        type: "folder",
        modified: new Date().toISOString().split("T")[0],
        starred: false,
        shared: false,
        color: folderColors[Math.floor(Math.random() * folderColors.length)],
        parentId: currentFolderId,
      };
      setFiles([...files, newFolder]);
      setNewFolderName("");
      setShowCreateFolderModal(false);
    }
  };

  const handleDelete = (file: FileItem) => {
    // Move to trash instead of permanent delete
    setTrashedFiles([...trashedFiles, file]);
    if (file.type === "folder") {
      const deleteIds = new Set<string>();
      const findChildren = (parentId: string) => {
        files.forEach((f) => {
          if (f.parentId === parentId) {
            deleteIds.add(f.id);
            if (f.type === "folder") {
              findChildren(f.id);
            }
          }
        });
      };
      deleteIds.add(file.id);
      findChildren(file.id);
      setFiles(files.filter((f) => !deleteIds.has(f.id)));
      // Also move children to trash
      const childFiles = files.filter((f) => deleteIds.has(f.id) && f.id !== file.id);
      setTrashedFiles([...trashedFiles, ...childFiles, file]);
    } else {
      setFiles(files.filter((f) => f.id !== file.id));
    }
    setSelectedFiles(selectedFiles.filter((id) => id !== file.id));
    setContextMenu(null);
  };

  const handleRestore = (file: FileItem) => {
    setFiles([...files, file]);
    setTrashedFiles(trashedFiles.filter((f) => f.id !== file.id));
    setContextMenu(null);
  };

  const handlePermanentDelete = (file: FileItem) => {
    setTrashedFiles(trashedFiles.filter((f) => f.id !== file.id));
    setContextMenu(null);
  };

  const handleRename = (file: FileItem) => {
    if (renameValue.trim()) {
      setFiles(
        files.map((f) =>
          f.id === file.id ? { ...f, name: renameValue.trim() } : f
        )
      );
    }
    setRenamingId(null);
    setRenameValue("");
  };

  const startRename = (file: FileItem) => {
    setRenamingId(file.id);
    setRenameValue(file.name);
    setContextMenu(null);
  };

  const toggleStar = (file: FileItem) => {
    setFiles(
      files.map((f) => (f.id === file.id ? { ...f, starred: !f.starred } : f))
    );
    setContextMenu(null);
  };

  const folderItemCount = (folderId: string) => {
    return files.filter((f) => f.parentId === folderId).length;
  };

  // Drag and drop handlers
  const handleDragStart = (e: React.DragEvent, file: FileItem) => {
    e.stopPropagation();
    setDraggedItem(file);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", file.id);
  };

  const handleDragEnd = () => {
    setDraggedItem(null);
    setDragOverFolder(null);
    setIsDraggingOverEmpty(false);
  };

  const handleDragOver = (e: React.DragEvent, folderId: string | null = null) => {
    e.preventDefault();
    e.stopPropagation();
    e.dataTransfer.dropEffect = "move";
    
    if (folderId) {
      setDragOverFolder(folderId);
    } else {
      setIsDraggingOverEmpty(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOverFolder(null);
    setIsDraggingOverEmpty(false);
  };

  const handleDrop = (e: React.DragEvent, targetFolderId: string | null = null) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!draggedItem) return;
    
    // Don't drop folder into itself
    if (draggedItem.type === "folder" && draggedItem.id === targetFolderId) {
      setDraggedItem(null);
      setDragOverFolder(null);
      setIsDraggingOverEmpty(false);
      return;
    }
    
    // Check if dropping folder into its own child (prevent circular reference)
    if (draggedItem.type === "folder") {
      let checkId = targetFolderId;
      while (checkId) {
        if (checkId === draggedItem.id) {
          setDraggedItem(null);
          setDragOverFolder(null);
          setIsDraggingOverEmpty(false);
          return;
        }
        const parent = files.find((f) => f.id === checkId);
        checkId = parent?.parentId ?? null;
      }
    }
    
    // Move the item
    setFiles(
      files.map((f) =>
        f.id === draggedItem.id ? { ...f, parentId: targetFolderId } : f
      )
    );
    
    setDraggedItem(null);
    setDragOverFolder(null);
    setIsDraggingOverEmpty(false);
  };

  const handleMultipleDrop = (e: React.DragEvent, targetFolderId: string | null = null) => {
    e.preventDefault();
    e.stopPropagation();
    
    const itemsToMove = selectedFiles.length > 0 
      ? files.filter((f) => selectedFiles.includes(f.id))
      : draggedItem 
        ? [draggedItem] 
        : [];
    
    if (itemsToMove.length === 0) return;
    
    // Check for circular references for folders
    for (const item of itemsToMove) {
      if (item.type === "folder" && item.id === targetFolderId) continue;
      
      if (item.type === "folder") {
        let checkId = targetFolderId;
        while (checkId) {
          if (checkId === item.id) {
            setDraggedItem(null);
            setDragOverFolder(null);
            setIsDraggingOverEmpty(false);
            return;
          }
          const parent = files.find((f) => f.id === checkId);
          checkId = parent?.parentId ?? null;
        }
      }
    }
    
    // Move items
    setFiles(
      files.map((f) => {
        if (itemsToMove.some((item) => item.id === f.id)) {
          return { ...f, parentId: targetFolderId };
        }
        return f;
      })
    );
    
    setSelectedFiles([]);
    setDraggedItem(null);
    setDragOverFolder(null);
    setIsDraggingOverEmpty(false);
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
          {[
            { icon: Home, label: "My Drive", view: "my-drive" as SidebarView, count: files.filter((f) => f.parentId === null).length },
            { icon: Clock, label: "Recent", view: "recent" as SidebarView, count: 10 },
            { icon: Star, label: "Starred", view: "starred" as SidebarView, count: files.filter((f) => f.starred).length },
            { icon: Trash2, label: "Trash", view: "trash" as SidebarView, count: trashedFiles.length },
          ].map((item) => (
            <button
              key={item.label}
              onClick={() => {
                setSidebarView(item.view);
                setCurrentFolderId(null);
                setSelectedFiles([]);
                setSearchQuery("");
                setFilterType("all");
              }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                sidebarView === item.view
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
            {sidebarView === "my-drive" && currentFolderId && (
              <button
                onClick={() => {
                  const parentFolder = files.find((f) => f.id === currentFolderId);
                  setCurrentFolderId(parentFolder?.parentId ?? null);
                  setSelectedFiles([]);
                }}
                className={`p-2 rounded-lg transition-colors ${
                  theme === "dark" ? "bg-slate-700 text-slate-300 hover:bg-slate-600" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
            )}
            {sidebarView !== "my-drive" && (
              <button
                onClick={() => {
                  setSidebarView("my-drive");
                  setCurrentFolderId(null);
                  setSelectedFiles([]);
                  setSearchQuery("");
                  setFilterType("all");
                }}
                className={`p-2 rounded-lg transition-colors ${
                  theme === "dark" ? "bg-slate-700 text-slate-300 hover:bg-slate-600" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
            )}
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
            <div className="relative">
              <button
                onClick={() => setShowUploadModal(true)}
                className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                <Plus className="h-5 w-5" />
                New
              </button>
            </div>
          </div>

          {/* Breadcrumb */}
          <div className="flex items-center gap-1 mt-4 flex-wrap">
            {sidebarView === "my-drive" ? (
              breadcrumbPath.map((crumb, index) => (
                <div key={crumb.id ?? "root"} className="flex items-center">
                  {index > 0 && <ChevronRight className={`h-4 w-4 mx-1 ${theme === "dark" ? "text-slate-500" : "text-slate-400"}`} />}
                  <button
                    onClick={() => handleBreadcrumbClick(crumb.id)}
                    className={`text-sm px-1 py-0.5 rounded transition-colors ${
                      index === breadcrumbPath.length - 1
                        ? `font-medium ${theme === "dark" ? "text-white" : "text-slate-900"}`
                        : `${theme === "dark" ? "text-slate-400 hover:text-slate-200 hover:bg-slate-700" : "text-slate-500 hover:text-slate-700 hover:bg-slate-100"}`
                    }`}
                  >
                    {crumb.name}
                  </button>
                </div>
              ))
            ) : (
              <h2 className={`text-sm font-medium ${theme === "dark" ? "text-white" : "text-slate-900"}`}>
                {sidebarView === "recent" && "Recent Files"}
                {sidebarView === "starred" && "Starred Files"}
                {sidebarView === "trash" && "Trash"}
              </h2>
            )}
          </div>
        </header>

        {/* Toolbar */}
        <div className={`border-b px-6 py-3 flex items-center justify-between ${theme === "dark" ? "bg-slate-800 border-slate-700" : "bg-white border-slate-200"}`}>
          <div className="flex items-center gap-2">
            {sidebarView === "my-drive" && (
              <button
                onClick={() => setShowCreateFolderModal(true)}
                className={`flex items-center gap-2 px-3 py-1.5 text-sm rounded-lg transition-colors ${
                  theme === "dark" ? "text-slate-300 hover:bg-slate-700" : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                <FolderPlus className="h-4 w-4" />
                New Folder
              </button>
            )}
            {/* Filter Dropdown */}
            {sidebarView === "my-drive" && (
              <div className="relative" ref={filterDropdownRef}>
                <button
                  onClick={() => setShowFilterDropdown(!showFilterDropdown)}
                  className={`flex items-center gap-2 px-3 py-1.5 text-sm rounded-lg transition-colors ${
                    filterType !== "all"
                      ? "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400"
                      : theme === "dark" ? "text-slate-300 hover:bg-slate-700" : "text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  <Filter className="h-4 w-4" />
                  {filterType === "all" ? "Filter" : filterType.charAt(0).toUpperCase() + filterType.slice(1)}
                  <ChevronDown className="h-4 w-4" />
                </button>
                {showFilterDropdown && (
                  <div className={`absolute left-0 top-full mt-1 z-50 w-48 rounded-xl shadow-lg border py-1 ${
                    theme === "dark" ? "bg-slate-800 border-slate-700" : "bg-white border-slate-200"
                  }`}>
                    {[
                      { value: "all", label: "All Files", icon: File },
                      { value: "folders", label: "Folders", icon: Folder },
                      { value: "images", label: "Images", icon: FileImage },
                      { value: "videos", label: "Videos", icon: FileVideo },
                      { value: "audio", label: "Audio", icon: FileAudio },
                      { value: "documents", label: "Documents", icon: FileText },
                    ].map((item) => (
                      <button
                        key={item.value}
                        onClick={() => {
                          setFilterType(item.value as FilterType);
                          setShowFilterDropdown(false);
                        }}
                        className={`w-full flex items-center gap-3 px-4 py-2 text-sm transition-colors ${
                          filterType === item.value
                            ? "bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400"
                            : theme === "dark" ? "text-slate-300 hover:bg-slate-700" : "text-slate-700 hover:bg-slate-100"
                        }`}
                      >
                        <item.icon className="h-4 w-4" />
                        <span className="flex-1 text-left">{item.label}</span>
                        {filterType === item.value && <Check className="h-4 w-4" />}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
            {/* Sort Dropdown */}
            <div className="relative" ref={sortDropdownRef}>
              <button
                onClick={() => setShowSortDropdown(!showSortDropdown)}
                className={`flex items-center gap-2 px-3 py-1.5 text-sm rounded-lg transition-colors ${
                  theme === "dark" ? "text-slate-300 hover:bg-slate-700" : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                <SortAsc className="h-4 w-4" />
                Sort by: {sortBy === "name" ? "Name" : sortBy === "date" ? "Date" : "Size"}
                <ChevronDown className="h-4 w-4" />
              </button>
              {showSortDropdown && (
                <div className={`absolute left-0 top-full mt-1 z-50 w-40 rounded-xl shadow-lg border py-1 ${
                  theme === "dark" ? "bg-slate-800 border-slate-700" : "bg-white border-slate-200"
                }`}>
                  {[
                    { value: "name", label: "Name" },
                    { value: "date", label: "Last modified" },
                    { value: "size", label: "Size" },
                  ].map((item) => (
                    <button
                      key={item.value}
                      onClick={() => {
                        setSortBy(item.value as SortBy);
                        setShowSortDropdown(false);
                      }}
                      className={`w-full flex items-center gap-3 px-4 py-2 text-sm transition-colors ${
                        sortBy === item.value
                          ? "bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400"
                          : theme === "dark" ? "text-slate-300 hover:bg-slate-700" : "text-slate-700 hover:bg-slate-100"
                      }`}
                    >
                      <span className="flex-1 text-left">{item.label}</span>
                      {sortBy === item.value && <Check className="h-4 w-4" />}
                    </button>
                  ))}
                </div>
              )}
            </div>
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
        <div 
          className={`flex-1 overflow-auto p-6 transition-colors ${
            isDraggingOverEmpty 
              ? theme === "dark" 
                ? "bg-blue-900/30 ring-2 ring-inset ring-blue-500" 
                : "bg-blue-50 ring-2 ring-inset ring-blue-500"
              : ""
          }`}
          onDragOver={(e) => handleDragOver(e)}
          onDragLeave={handleDragLeave}
          onDrop={(e) => handleMultipleDrop(e, currentFolderId)}
        >
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
                <button
                  onClick={() => {
                    selectedFiles.forEach((id) => {
                      const file = files.find((f) => f.id === id);
                      if (file) handleDelete(file);
                    });
                  }}
                  className={`p-2 rounded-lg transition-colors ${theme === "dark" ? "text-blue-400 hover:bg-blue-800/50" : "text-blue-600 hover:bg-blue-100"}`}
                >
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

          {currentFiles.length === 0 ? (
            <div 
              className={`flex flex-col items-center justify-center h-64 rounded-xl border-2 border-dashed transition-colors ${
                isDraggingOverEmpty 
                  ? theme === "dark" 
                    ? "border-blue-500 bg-blue-900/20" 
                    : "border-blue-500 bg-blue-50"
                  : theme === "dark" 
                    ? "border-slate-700" 
                    : "border-slate-300"
              }`}
              onDragOver={(e) => handleDragOver(e)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleMultipleDrop(e, currentFolderId)}
            >
              <Folder className={`h-16 w-16 mb-4 ${theme === "dark" ? "text-slate-600" : "text-slate-300"}`} />
              <p className={`text-lg font-medium ${theme === "dark" ? "text-slate-400" : "text-slate-500"}`}>
                {searchQuery ? "No files found" : "This folder is empty"}
              </p>
              <p className={`text-sm mt-1 ${theme === "dark" ? "text-slate-500" : "text-slate-400"}`}>
                {searchQuery ? "Try a different search" : "Drop files here or create a new folder"}
              </p>
            </div>
          ) : viewMode === "grid" ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {currentFiles.map((file) => (
                <div
                  key={file.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, file)}
                  onDragEnd={handleDragEnd}
                  onDragOver={(e) => file.type === "folder" ? handleDragOver(e, file.id) : undefined}
                  onDragLeave={handleDragLeave}
                  onDrop={(e) => file.type === "folder" ? handleMultipleDrop(e, file.id) : undefined}
                  onContextMenu={(e) => handleContextMenu(e, file)}
                  onClick={() => toggleFileSelection(file.id)}
                  onDoubleClick={() => handleDoubleClick(file)}
                  className={`group relative rounded-xl border p-4 cursor-grab active:cursor-grabbing transition-all hover:shadow-md ${
                    draggedItem?.id === file.id ? "opacity-50 scale-95" : ""
                  } ${
                    dragOverFolder === file.id
                      ? theme === "dark"
                        ? "border-blue-500 ring-2 ring-blue-500/50 bg-blue-900/30"
                        : "border-blue-500 ring-2 ring-blue-500/50 bg-blue-50"
                      : selectedFiles.includes(file.id)
                        ? "border-blue-500 ring-2 ring-blue-200 dark:ring-blue-800"
                        : `${theme === "dark" ? "bg-slate-800 border-slate-700 hover:border-slate-600" : "bg-white border-slate-200 hover:border-slate-300"}`
                  }`}
                >
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleStar(file);
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
                  {renamingId === file.id ? (
                    <input
                      type="text"
                      value={renameValue}
                      onChange={(e) => setRenameValue(e.target.value)}
                      onBlur={() => handleRename(file)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleRename(file);
                        if (e.key === "Escape") setRenamingId(null);
                      }}
                      autoFocus
                      className={`w-full px-2 py-1 text-sm rounded border ${
                        theme === "dark" ? "bg-slate-700 border-slate-600 text-white" : "bg-white border-slate-300"
                      } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                      onClick={(e) => e.stopPropagation()}
                    />
                  ) : (
                    <h3 className={`font-medium truncate ${theme === "dark" ? "text-white" : "text-slate-900"}`}>{file.name}</h3>
                  )}
                  <p className={`text-xs mt-1 ${theme === "dark" ? "text-slate-400" : "text-slate-500"}`}>
                    {file.type === "folder" ? `${folderItemCount(file.id)} items` : file.size}
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
                  {currentFiles.map((file) => (
                    <tr
                      key={file.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, file)}
                      onDragEnd={handleDragEnd}
                      onDragOver={(e) => file.type === "folder" ? handleDragOver(e, file.id) : undefined}
                      onDragLeave={handleDragLeave}
                      onDrop={(e) => file.type === "folder" ? handleMultipleDrop(e, file.id) : undefined}
                      onContextMenu={(e) => handleContextMenu(e, file)}
                      onClick={() => toggleFileSelection(file.id)}
                      onDoubleClick={() => handleDoubleClick(file)}
                      className={`cursor-grab active:cursor-grabbing transition-colors ${
                        draggedItem?.id === file.id ? "opacity-50" : ""
                      } ${
                        dragOverFolder === file.id
                          ? theme === "dark"
                            ? "bg-blue-900/30 ring-2 ring-inset ring-blue-500"
                            : "bg-blue-50 ring-2 ring-inset ring-blue-500"
                          : selectedFiles.includes(file.id)
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
                            {renamingId === file.id ? (
                              <input
                                type="text"
                                value={renameValue}
                                onChange={(e) => setRenameValue(e.target.value)}
                                onBlur={() => handleRename(file)}
                                onKeyDown={(e) => {
                                  if (e.key === "Enter") handleRename(file);
                                  if (e.key === "Escape") setRenamingId(null);
                                }}
                                autoFocus
                                className={`px-2 py-1 text-sm rounded border ${
                                  theme === "dark" ? "bg-slate-700 border-slate-600 text-white" : "bg-white border-slate-300"
                                } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                                onClick={(e) => e.stopPropagation()}
                              />
                            ) : (
                              <span className={`font-medium ${theme === "dark" ? "text-white" : "text-slate-900"}`}>{file.name}</span>
                            )}
                            {file.starred && <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />}
                            {file.shared && <Share2 className={`h-3 w-3 ${theme === "dark" ? "text-slate-500" : "text-slate-400"}`} />}
                          </div>
                        </div>
                      </td>
                      <td className={`px-4 py-3 text-sm hidden md:table-cell ${theme === "dark" ? "text-slate-400" : "text-slate-500"}`}>{file.modified}</td>
                      <td className={`px-4 py-3 text-sm hidden lg:table-cell ${theme === "dark" ? "text-slate-400" : "text-slate-500"}`}>
                        {file.type === "folder" ? `${folderItemCount(file.id)} items` : file.size}
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
            {sidebarView === "trash" ? (
              <>
                <button
                  onClick={() => handleRestore(contextMenu.file)}
                  className={`w-full flex items-center gap-3 px-4 py-2 text-sm transition-colors ${
                    theme === "dark" ? "text-slate-300 hover:bg-slate-700" : "text-slate-700 hover:bg-slate-100"
                  }`}
                >
                  <RotateCcw className="h-4 w-4" />
                  Restore
                </button>
                <button
                  onClick={() => handlePermanentDelete(contextMenu.file)}
                  className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                >
                  <Trash2 className="h-4 w-4" />
                  Delete permanently
                </button>
              </>
            ) : (
              <>
                {contextMenu.file.type === "folder" && (
                  <button
                    onClick={() => {
                      handleDoubleClick(contextMenu.file);
                      setContextMenu(null);
                    }}
                    className={`w-full flex items-center gap-3 px-4 py-2 text-sm transition-colors ${
                      theme === "dark" ? "text-slate-300 hover:bg-slate-700" : "text-slate-700 hover:bg-slate-100"
                    }`}
                  >
                    <FolderPlus className="h-4 w-4" />
                    Open
                  </button>
                )}
                <button
                  onClick={() => toggleStar(contextMenu.file)}
                  className={`w-full flex items-center gap-3 px-4 py-2 text-sm transition-colors ${
                    theme === "dark" ? "text-slate-300 hover:bg-slate-700" : "text-slate-700 hover:bg-slate-100"
                  }`}
                >
                  <Star className={`h-4 w-4 ${contextMenu.file.starred ? "fill-yellow-400 text-yellow-400" : ""}`} />
                  {contextMenu.file.starred ? "Unstar" : "Star"}
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
                <button
                  onClick={() => startRename(contextMenu.file)}
                  className={`w-full flex items-center gap-3 px-4 py-2 text-sm transition-colors ${
                    theme === "dark" ? "text-slate-300 hover:bg-slate-700" : "text-slate-700 hover:bg-slate-100"
                  }`}
                >
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
                <button
                  onClick={() => handleDelete(contextMenu.file)}
                  className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                >
                  <Trash2 className="h-4 w-4" />
                  Move to trash
                </button>
              </>
            )}
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

      {/* Create Folder Modal */}
      {showCreateFolderModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className={`rounded-2xl shadow-xl w-full max-w-sm mx-4 overflow-hidden ${
            theme === "dark" ? "bg-slate-800" : "bg-white"
          }`}>
            <div className={`flex items-center justify-between px-6 py-4 border-b ${
              theme === "dark" ? "border-slate-700" : "border-slate-200"
            }`}>
              <h2 className={`text-lg font-semibold ${theme === "dark" ? "text-white" : "text-slate-900"}`}>New Folder</h2>
              <button
                onClick={() => {
                  setShowCreateFolderModal(false);
                  setNewFolderName("");
                }}
                className={`p-1 rounded-lg transition-colors ${
                  theme === "dark" ? "text-slate-400 hover:text-slate-200 hover:bg-slate-700" : "text-slate-400 hover:text-slate-600 hover:bg-slate-100"
                }`}
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-6">
              <input
                type="text"
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleCreateFolder();
                }}
                autoFocus
                placeholder="Folder name"
                className={`w-full px-4 py-2.5 rounded-lg border ${
                  theme === "dark" ? "bg-slate-700 border-slate-600 text-white placeholder-slate-400" : "border-slate-300"
                } focus:outline-none focus:ring-2 focus:ring-blue-500`}
              />
              <div className="mt-6 flex gap-3">
                <button
                  onClick={() => {
                    setShowCreateFolderModal(false);
                    setNewFolderName("");
                  }}
                  className={`flex-1 px-4 py-2.5 border rounded-lg font-medium transition-colors ${
                    theme === "dark" ? "border-slate-600 text-slate-300 hover:bg-slate-700" : "border-slate-300 text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateFolder}
                  disabled={!newFolderName.trim()}
                  className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Create
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
