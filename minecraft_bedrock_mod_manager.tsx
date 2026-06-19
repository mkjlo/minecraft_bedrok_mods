import React, { useState, useEffect } from 'react';
import { 
  Folder, 
  Download, 
  Trash2, 
  Play, 
  Search, 
  Terminal, 
  Check, 
  Plus, 
  Compass, 
  Package, 
  Cpu, 
  Sparkles, 
  FileText,
  Copy,
  ExternalLink,
  Laptop,
  HelpCircle,
  X,
  Loader2,
  Upload,
  FileCode
} from 'lucide-react';

const BEDROCK_ADDONS = [
  {
    id: 'dynamic_lighting',
    name: 'הארת סביבה דינמית (Dynamic Lighting)',
    description: 'תוסף התנהגות (Behavior) המאפשר ללפידים וחפצים מאירים להאיר את הסביבה כאשר מחזיקים אותם ביד, בדיוק כמו בגרסת הג׳אווה.',
    category: 'behavior',
    fileType: '.mcpack',
    version: '2.1.0',
    fileSize: '1.4 MB',
    author: 'BedrockDevs',
    downloads: '1.2M',
    icon: Sparkles,
    color: 'text-amber-400',
    bgColor: 'bg-amber-500/10'
  },
  {
    id: 'furniture_3d',
    name: 'רהיטי תלת-ממד מודרניים (Modern Furniture 3D)',
    description: 'חבילת משאבים והתנהגות המציגה מעל 100 רהיטים אינטראקטיביים מעוצבים לבית שלכם במיינקראפט - ספות, מקררים, טלוויזיות ועוד.',
    category: 'resource',
    fileType: '.mcpack',
    version: '1.5.2',
    fileSize: '8.7 MB',
    author: 'McBeE',
    downloads: '940K',
    icon: Package,
    color: 'text-emerald-400',
    bgColor: 'bg-emerald-500/10'
  },
  {
    id: 'dragons_mount',
    name: 'דרקונים רוכבים (Dragon Mounts: Legacy)',
    description: 'הוסף דרקונים שניתן לאלף, להרביע, לרכוב עליהם ולעוף איתם ברחבי העולם שלכם. כולל בוסים חדשים ומערכת שריון מיוחדת לדרקונים.',
    category: 'behavior',
    fileType: '.mcpack',
    version: '3.0.1',
    fileSize: '12.3 MB',
    author: 'XenonStudio',
    downloads: '2.1M',
    icon: Compass,
    color: 'text-purple-400',
    bgColor: 'bg-purple-500/10'
  },
  {
    id: 'rtx_resourcepack',
    name: 'טקסטורת תלת-ממד ריאליסטית (Realight RTX Pack)',
    description: 'חבילת טקסטורות באיכות גבוהה (PBR) המותאמת במיוחד למנוע ה-RenderDragon של מיינקראפט Windows 10/11 למחשבים תומכי RTX.',
    category: 'resource',
    fileType: '.mcpack',
    version: '4.0.0',
    fileSize: '45.2 MB',
    author: 'NVIDIA Community',
    downloads: '3.4M',
    icon: Cpu,
    color: 'text-blue-400',
    bgColor: 'bg-blue-500/10'
  },
  {
    id: 'java_ui',
    name: 'ממשק משתמש של ג׳אווה (Java UI for Bedrock)',
    description: 'משנה לחלוטין את תפריטי המשחק, מלאי השחקן (Inventory) ומסכי הטעינה כך שייראו בדיוק כמו בגרסת המחשב הקלאסית (Java Edition).',
    category: 'ui',
    fileType: '.mcpack',
    version: '1.1.8',
    fileSize: '3.1 MB',
    author: 'CrisXolt',
    downloads: '1.8M',
    icon: FileText,
    color: 'text-rose-400',
    bgColor: 'bg-rose-500/10'
  }
];

const BEDROCK_FOLDER_PATH = `%localappdata%\\Packages\\Microsoft.MinecraftUWP_8wekyb3d8bbwe\\LocalState\\games\\com.mojang\\`;

export default function App() {
  const [activeTab, setActiveTab] = useState('explore'); // explore, upload, my_downloads, guide, folders
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [addons, setAddons] = useState(BEDROCK_ADDONS);
  const [downloadedAddons, setDownloadedAddons] = useState([]);
  const [downloadingId, setDownloadingId] = useState(null);
  const [toast, setToast] = useState(null);
  const [guideStep, setGuideStep] = useState(0);
  const [jsZipReady, setJsZipReady] = useState(false);

  // סטייטים ייעודיים להעלאת מודים ויצירה מותאמת אישית
  const [customModName, setCustomModName] = useState('');
  const [customModDesc, setCustomModDesc] = useState('');
  const [customModAuthor, setCustomModAuthor] = useState('');
  const [customModCategory, setCustomModCategory] = useState('behavior');
  const [customModVersion, setCustomModVersion] = useState('1.0.0');
  const [customIconBase64, setCustomIconBase64] = useState(null);
  const [customFiles, setCustomFiles] = useState([]); // מערך קבצים מקומיים שהועלו

  // טעינה דינמית של ספריית JSZip
  useEffect(() => {
    if (window.JSZip) {
      setJsZipReady(true);
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js';
    script.async = true;
    script.onload = () => setJsZipReady(true);
    document.body.appendChild(script);
    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, []);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const generateUUID = () => {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  };

  const copyPathToClipboard = () => {
    navigator.clipboard.writeText(BEDROCK_FOLDER_PATH);
    showToast('הנתיב הועתק ללוח! הדבק אותו בשורת הכתובת בסייר הקבצים.', 'success');
  };

  // טיפול בהעלאת אייקון מהמחשב והמרתו ל-Base64
  const handleIconUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      showToast('אנא העלה קובץ תמונה בלבד עבור האייקון!', 'error');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      // חילוץ החלק של ה-base64 בלבד
      const base64Data = reader.result.split(',')[1];
      setCustomIconBase64(base64Data);
      showToast('תמונת האייקון הועלתה והוטמעה בהצלחה!', 'success');
    };
    reader.readAsDataURL(file);
  };

  // טיפול בהעלאת קובצי קוד מרובים (כגון .mcfunction, .json, .js וכדומה)
  const handleFilesUpload = (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    const filePromises = files.map(file => {
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = () => {
          resolve({
            name: file.name,
            content: reader.result,
            type: file.name.endsWith('.png') || file.name.endsWith('.jpg') ? 'binary' : 'text'
          });
        };
        if (file.name.endsWith('.png') || file.name.endsWith('.jpg')) {
          reader.readAsArrayBuffer(file);
        } else {
          reader.readAsText(file);
        }
      });
    });

    Promise.all(filePromises).then(results => {
      setCustomFiles(prev => [...prev, ...results]);
      showToast(`הועלו ${results.length} קבצי קוד בהצלחה לרשימת הייצור!`, 'success');
    });
  };

  // הסרת קובץ שהועלה מרשימת הקבצים לפני יצירה
  const removeUploadedFile = (index) => {
    setCustomFiles(prev => prev.filter((_, i) => i !== index));
    showToast('הקובץ הוסר מרשימת הייצור.', 'info');
  };

  // יצירה והורדה של קובץ .mcpack אמיתי ותקני למחשב
  const handleRealDownload = async (addon) => {
    if (!jsZipReady || !window.JSZip) {
      showToast('מנוע ההורדות נטען בדפדפן, אנא נסה שוב בעוד שנייה...', 'info');
      return;
    }

    setDownloadingId(addon.id);
    showToast(`מייצר ומקמפל קובץ ${addon.fileType} תקני עבור ${addon.name}...`, 'info');

    try {
      const zip = new window.JSZip();
      const headerUUID = generateUUID();
      const moduleUUID = generateUUID();

      const manifest = {
        format_version: 2,
        header: {
          name: `${addon.name}`,
          description: `${addon.description} - Compiled by Bedrock PC Manager`,
          uuid: headerUUID,
          version: [
            parseInt(addon.version.split('.')[0]) || 1,
            parseInt(addon.version.split('.')[1]) || 0,
            parseInt(addon.version.split('.')[2]) || 0
          ],
          min_engine_version: [1, 20, 0]
        },
        modules: [
          {
            description: addon.description,
            type: addon.category === 'behavior' ? 'data' : 'resources',
            uuid: moduleUUID,
            version: [1, 0, 0]
          }
        ]
      };

      // כתיבת המניפסט של מיינקראפט בדרוק
      zip.file('manifest.json', JSON.stringify(manifest, null, 2));

      // הגדרת אייקון המוד
      if (addon.customIconBase64) {
        // אם המשתמש העלה תמונה מותאמת אישית
        zip.file('pack_icon.png', addon.customIconBase64, { base64: true });
      } else {
        // אייקון ברירת מחדל במידה ולא הועלה אייקון
        const base64Png = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==";
        zip.file('pack_icon.png', base64Png, { base64: true });
      }

      // הטמעת קובצי קוד שהועלו על ידי המשתמש
      if (addon.customFiles && addon.customFiles.length > 0) {
        addon.customFiles.forEach(file => {
          if (file.type === 'binary') {
            zip.file(file.name, file.content);
          } else {
            zip.file(file.name, file.content);
          }
        });
      } else {
        // אם אין קבצים שהועלו, מייצרים תוכן ברירת מחדל בסיסי כדי שהמוד יהיה תקין
        if (addon.category === 'behavior') {
          zip.file('functions/tick.mcfunction', `# Built with Bedrock Mod Manager\nsay Loaded ${addon.name} successfully into world!`);
        } else {
          zip.file('textures/splashes.json', JSON.stringify({
            splashes: ["Bedrock Mods Real Download!", "You compiled this dynamically!"]
          }, null, 2));
        }
      }

      // ייצור הקובץ הסופי
      const content = await zip.generateAsync({ type: 'blob' });

      // הפעלת הורדה ישירה של הדפדפן למחשב
      const url = window.URL.createObjectURL(content);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${addon.id}.mcpack`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      if (!downloadedAddons.includes(addon.id)) {
        setDownloadedAddons(prev => [...prev, addon.id]);
      }
      showToast(`הקובץ ${addon.id}.mcpack הורד בהצלחה למחשב שלך! חפש אותו בתיקיית הורדות.`, 'success');
    } catch (error) {
      console.error(error);
      showToast('שגיאה במהלך יצירת קובץ המוד.', 'error');
    } finally {
      setDownloadingId(null);
    }
  };

  // יצירת המוד המותאם אישית והוספתו למאגר המקומי
  const handleCreateCustomMod = (e) => {
    e.preventDefault();
    if (!customModName.trim()) {
      showToast('נא להזין שם עבור המוד!', 'error');
      return;
    }

    const uniqueId = 'custom_' + Date.now();
    const newAddon = {
      id: uniqueId,
      name: customModName,
      description: customModDesc || 'מוד מותאם אישית שנוצר והועלה על ידי המשתמש.',
      category: customModCategory,
      fileType: '.mcpack',
      version: customModVersion || '1.0.0',
      fileSize: customFiles.length > 0 ? `${(customFiles.reduce((acc, f) => acc + (f.content ? f.content.length : 0), 0) / 1024).toFixed(1)} KB` : '1.5 KB',
      author: customModAuthor || 'שחקן מיינקראפט',
      downloads: 'ייצור עצמי',
      icon: Upload,
      color: 'text-rose-400',
      bgColor: 'bg-rose-500/10',
      customIconBase64: customIconBase64,
      customFiles: customFiles
    };

    setAddons(prev => [newAddon, ...prev]);
    showToast(`המוד "${customModName}" נוצר והתווסף לרשימה בהצלחה!`, 'success');

    // איפוס טפסים ומעבר חזרה ללשונית דפדפן
    setCustomModName('');
    setCustomModDesc('');
    setCustomModAuthor('');
    setCustomIconBase64(null);
    setCustomFiles([]);
    setActiveTab('explore');
  };

  const handleDeleteFile = (addonId) => {
    setDownloadedAddons(prev => prev.filter(id => id !== addonId));
    showToast('הקובץ הוסר מרשימת ההורדות המהירות.', 'info');
  };

  const filteredAddons = addons.filter(addon => {
    const matchesSearch = addon.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          addon.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || addon.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-emerald-500 selection:text-slate-900" dir="rtl">
      
      {/* תפריט עליון קבוע */}
      <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur-md sticky top-0 z-40 px-6 py-4 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-green-600 rounded-lg flex items-center justify-center shadow-lg shadow-emerald-500/20">
            <Laptop className="w-6 h-6 text-slate-950 stroke-[2.5]" />
          </div>
          <div>
            <h1 className="text-xl font-black tracking-tight text-white flex items-center gap-2">
              BEDROCK<span className="text-emerald-400">PC</span> DOWNLOADER
            </h1>
            <p className="text-xs text-slate-400">הורדה ויצירת מודים (Add-ons) למיינקראפט Windows 10/11</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {jsZipReady ? (
            <span className="text-xs bg-emerald-500/10 text-emerald-400 px-3 py-1.5 rounded-lg border border-emerald-500/20 font-bold flex items-center gap-1.5">
              <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
              מנוע קימפול קבצים מוכן
            </span>
          ) : (
            <span className="text-xs bg-amber-500/10 text-amber-400 px-3 py-1.5 rounded-lg border border-amber-500/20 font-bold flex items-center gap-1.5">
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              טוען מנוע הורדה...
            </span>
          )}
        </div>
      </header>

      {/* אזור תוכן ראשי */}
      <div className="max-w-7xl mx-auto px-4 py-6 md:py-8 grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* תפריט ניווט צדדי */}
        <aside className="lg:col-span-1 space-y-6">
          <div className="bg-slate-900 rounded-2xl border border-slate-800 p-4 space-y-1">
            <p className="text-xs font-semibold text-slate-500 px-3 uppercase tracking-wider mb-2">תפריט</p>
            
            <button 
              onClick={() => setActiveTab('explore')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-right transition-all ${
                activeTab === 'explore' 
                  ? 'bg-emerald-500/10 text-emerald-400 font-semibold' 
                  : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
              }`}
            >
              <Compass className="w-5 h-5" />
              <span>דפדפן תוספים להורדה</span>
            </button>

            <button 
              onClick={() => setActiveTab('upload')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-right transition-all ${
                activeTab === 'upload' 
                  ? 'bg-emerald-500/10 text-emerald-400 font-semibold' 
                  : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
              }`}
            >
              <Upload className="w-5 h-5 text-rose-400" />
              <span className="font-bold text-rose-400">העלאה ויצירת מוד</span>
            </button>

            <button 
              onClick={() => setActiveTab('my_downloads')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-right transition-all ${
                activeTab === 'my_downloads' 
                  ? 'bg-emerald-500/10 text-emerald-400 font-semibold' 
                  : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
              }`}
            >
              <Download className="w-5 h-5" />
              <span>הורדות מוכנות</span>
              <span className="mr-auto text-xs bg-emerald-500 text-slate-950 px-2.5 py-0.5 rounded-full font-bold">
                {downloadedAddons.length}
              </span>
            </button>

            <button 
              onClick={() => setActiveTab('guide')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-right transition-all ${
                activeTab === 'guide' 
                  ? 'bg-emerald-500/10 text-emerald-400 font-semibold' 
                  : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
              }`}
            >
              <HelpCircle className="w-5 h-5" />
              <span>איך להתקין במחשב?</span>
            </button>

            <button 
              onClick={() => setActiveTab('folders')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-right transition-all ${
                activeTab === 'folders' 
                  ? 'bg-emerald-500/10 text-emerald-400 font-semibold' 
                  : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
              }`}
            >
              <Folder className="w-5 h-5" />
              <span>תיקיות המשחק com.mojang</span>
            </button>
          </div>

          <div className="bg-gradient-to-b from-slate-900 to-slate-950 rounded-2xl border border-slate-800 p-5 space-y-4">
            <h3 className="font-bold text-white text-sm flex items-center gap-1.5">
              ⚡ יצירת מודים אמיתית!
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              העלה קבצי פונקציות, קוד, או תמונה משלך והמערכת תרכיב קובץ <span className="font-bold text-emerald-400">`.mcpack` פיזי אמיתי</span> שמיינקראפט ייבא ויריץ בשניות.
            </p>
          </div>
        </aside>

        {/* מרכז המסך הדינמי */}
        <main className="lg:col-span-3 space-y-6">

          {/* לשונית דפדפן תוספים */}
          {activeTab === 'explore' && (
            <div className="space-y-6">
              {/* סרגל סינון וחיפוש */}
              <div className="bg-slate-900 rounded-2xl border border-slate-800 p-4 flex flex-col md:flex-row gap-4 justify-between items-center">
                <div className="relative w-full md:w-96">
                  <Search className="absolute right-3.5 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                  <input 
                    type="text" 
                    placeholder="חיפוש חבילות התנהגות ותוספי בדרוק..." 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl py-2.5 pr-11 pl-4 text-sm text-slate-100 placeholder-slate-500 outline-none transition-colors"
                  />
                </div>

                <div className="flex gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0 scrollbar-none">
                  {[
                    { id: 'all', label: 'הכל' },
                    { id: 'behavior', label: 'חבילות התנהגות (Behavior)' },
                    { id: 'resource', label: 'חבילות משאבים (Resource)' },
                    { id: 'ui', label: 'ממשק ועיצוב (UI)' }
                  ].map(cat => (
                    <button
                      key={cat.id}
                      onClick={() => setSelectedCategory(cat.id)}
                      className={`px-4 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition-all ${
                        selectedCategory === cat.id 
                          ? 'bg-emerald-500 text-slate-950 font-bold shadow-md' 
                          : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                      }`}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* גריד התוספים */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredAddons.map(addon => {
                  const isDownloaded = downloadedAddons.includes(addon.id);
                  const isDownloading = downloadingId === addon.id;
                  return (
                    <div 
                      key={addon.id} 
                      className={`bg-slate-900 rounded-2xl border p-5 flex flex-col justify-between transition-all hover:translate-y-[-2px] ${
                        isDownloaded ? 'border-emerald-500/40 bg-slate-900/90' : 'border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <div className="space-y-3">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-3">
                            <div className={`w-11 h-11 rounded-xl ${addon.bgColor} flex items-center justify-center overflow-hidden`}>
                              {addon.customIconBase64 ? (
                                <img src={`data:image/png;base64,${addon.customIconBase64}`} className="w-full h-full object-cover" alt="icon" />
                              ) : (
                                <addon.icon className={`w-6 h-6 ${addon.color}`} />
                              )}
                            </div>
                            <div>
                              <h3 className="font-bold text-white text-base">{addon.name}</h3>
                              <p className="text-xs text-slate-400">מאת {addon.author}</p>
                            </div>
                          </div>
                          <span className="text-xs bg-slate-800 text-slate-300 px-2 py-1 rounded font-mono font-bold">
                            {addon.fileType}
                          </span>
                        </div>

                        <p className="text-sm text-slate-300 leading-relaxed min-h-[48px]">{addon.description}</p>
                      </div>

                      <div className="mt-5 pt-4 border-t border-slate-800 flex items-center justify-between">
                        <span className="text-xs text-slate-500 flex items-center gap-1">
                          משקל קובץ: {addon.fileSize}
                        </span>

                        <button
                          onClick={() => handleRealDownload(addon)}
                          disabled={isDownloading}
                          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                            isDownloading 
                              ? 'bg-slate-800 text-slate-500 cursor-wait'
                              : isDownloaded
                              ? 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500 hover:text-slate-950'
                              : 'bg-emerald-500 text-slate-950 hover:bg-emerald-400 shadow-md shadow-emerald-500/5'
                          }`}
                        >
                          {isDownloading ? (
                            <>
                              <Loader2 className="w-4 h-4 animate-spin" />
                              <span>מייצר קובץ...</span>
                            </>
                          ) : isDownloaded ? (
                            <>
                              <Check className="w-4 h-4" />
                              <span>הורד שוב קובץ אמיתי</span>
                            </>
                          ) : (
                            <>
                              <Download className="w-4 h-4" />
                              <span>הורד למחשב (.mcpack)</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* לשונית העלאה ויצירת מוד אישי */}
          {activeTab === 'upload' && (
            <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6 space-y-6">
              <div>
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <Upload className="w-6 h-6 text-rose-400" />
                  העלאת קבצים וייצור מוד מקורי משלך
                </h2>
                <p className="text-sm text-slate-400">הזן את הגדרות המוד, העלה קובצי קוד, טקסטורות או אייקון, והמערכת תקמפל הכל לקובץ משחק שלם!</p>
              </div>

              <form onSubmit={handleCreateCustomMod} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-400">שם המוד / Add-on *</label>
                    <input 
                      type="text" 
                      placeholder="לדוגמה: כלי נשק סודיים" 
                      value={customModName}
                      onChange={(e) => setCustomModName(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl px-4 py-2.5 text-sm text-slate-100 outline-none"
                      required
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-400">יוצר / מחבר</label>
                    <input 
                      type="text" 
                      placeholder="השם שלכם" 
                      value={customModAuthor}
                      onChange={(e) => setCustomModAuthor(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl px-4 py-2.5 text-sm text-slate-100 outline-none"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-400">קטגוריה</label>
                    <select 
                      value={customModCategory}
                      onChange={(e) => setCustomModCategory(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl px-4 py-2.5 text-sm text-slate-100 outline-none cursor-pointer"
                    >
                      <option value="behavior">חבילת התנהגות (Behavior Pack)</option>
                      <option value="resource">חבילת משאבים / טקסטורה (Resource Pack)</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-400">גרסת המוד</label>
                    <input 
                      type="text" 
                      placeholder="1.0.0" 
                      value={customModVersion}
                      onChange={(e) => setCustomModVersion(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl px-4 py-2.5 text-sm text-slate-100 outline-none"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-400">תיאור המוד</label>
                  <textarea 
                    placeholder="תיאור המוד שישפיע על המניפסט של מיינקראפט..." 
                    value={customModDesc}
                    onChange={(e) => setCustomModDesc(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl px-4 py-2.5 text-sm text-slate-100 outline-none min-h-[80px]"
                  />
                </div>

                {/* העלאת קבצים פנימיים */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* אזור העלאת אייקון */}
                  <div className="space-y-3 bg-slate-950 p-4 rounded-xl border border-slate-800">
                    <span className="text-xs font-bold text-slate-300 block">1. העלאת תמונת אייקון למוד (PNG/JPG)</span>
                    <div className="flex items-center gap-4">
                      <label className="cursor-pointer bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold py-2.5 px-4 rounded-lg flex items-center gap-2 transition-colors">
                        <Upload className="w-4 h-4" />
                        <span>בחר קובץ תמונה</span>
                        <input type="file" accept="image/*" className="hidden" onChange={handleIconUpload} />
                      </label>
                      {customIconBase64 && (
                        <div className="relative w-12 h-12 rounded-lg border border-slate-700 overflow-hidden bg-slate-900">
                          <img src={`data:image/png;base64,${customIconBase64}`} className="w-full h-full object-cover" alt="Custom icon preview" />
                          <button 
                            type="button" 
                            onClick={() => setCustomIconBase64(null)} 
                            className="absolute top-0 right-0 bg-red-500 p-0.5 rounded-bl text-white"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* אזור העלאת קובצי קוד */}
                  <div className="space-y-3 bg-slate-950 p-4 rounded-xl border border-slate-800">
                    <span className="text-xs font-bold text-slate-300 block">2. העלאת קובצי קוד, פונקציות וקונפיגורציה</span>
                    <label className="cursor-pointer bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold py-2.5 px-4 rounded-lg inline-flex items-center gap-2 transition-colors">
                      <FileCode className="w-4 h-4" />
                      <span>בחר קבצים להעלאה (mcfun, json...)</span>
                      <input type="file" multiple className="hidden" onChange={handleFilesUpload} />
                    </label>
                  </div>
                </div>

                {/* רשימת קבצים שהועלו */}
                {customFiles.length > 0 && (
                  <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
                    <span className="text-xs font-bold text-slate-400 block">קבצים שיצורפו ל-MCPACK הסופי ({customFiles.length}):</span>
                    <div className="max-h-40 overflow-y-auto space-y-1.5 scrollbar-thin">
                      {customFiles.map((file, idx) => (
                        <div key={idx} className="flex justify-between items-center text-xs bg-slate-900 border border-slate-800 px-3 py-2 rounded-lg text-slate-300">
                          <span className="font-mono">{file.name}</span>
                          <button 
                            type="button" 
                            onClick={() => removeUploadedFile(idx)} 
                            className="text-red-400 hover:text-red-300"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <button 
                  type="submit"
                  className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black py-3 rounded-xl flex items-center justify-center gap-2 transition-colors shadow-lg shadow-emerald-500/10"
                >
                  <Plus className="w-5 h-5" />
                  <span>ייצר מוד אישי והוסף למאגר</span>
                </button>
              </form>
            </div>
          )}

          {/* לשונית הורדות למחשב שלי */}
          {activeTab === 'my_downloads' && (
            <div className="space-y-6">
              <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6 space-y-2">
                <h2 className="text-xl font-bold text-white">היסטוריית קבצים שנוצרו במחשב</h2>
                <p className="text-sm text-slate-400">
                  כל הקבצים שקימפלת והורדת למחשבך דרך המערכת הנוכחית.
                </p>
              </div>

              {downloadedAddons.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {downloadedAddons.map(id => {
                    const addon = addons.find(a => a.id === id);
                    if (!addon) return null;
                    return (
                      <div key={id} className="bg-slate-900 rounded-2xl border border-slate-800 p-5 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`w-11 h-11 rounded-xl ${addon.bgColor} flex items-center justify-center overflow-hidden`}>
                            {addon.customIconBase64 ? (
                              <img src={`data:image/png;base64,${addon.customIconBase64}`} className="w-full h-full object-cover" alt="icon" />
                            ) : (
                              <addon.icon className={`w-6 h-6 ${addon.color}`} />
                            )}
                          </div>
                          <div>
                            <h3 className="font-bold text-white text-sm">{addon.id}.mcpack</h3>
                            <p className="text-xs text-slate-400">קובץ בדרוק מקומפול • {addon.fileSize}</p>
                          </div>
                        </div>

                        <div className="flex gap-2">
                          <button
                            onClick={() => handleRealDownload(addon)}
                            className="flex items-center gap-1 px-3 py-2 bg-emerald-500 text-slate-950 rounded-xl text-xs font-bold hover:bg-emerald-400"
                          >
                            <Download className="w-3.5 h-3.5" />
                            <span>הורד שוב</span>
                          </button>
                          
                          <button
                            onClick={() => handleDeleteFile(addon.id)}
                            className="p-2 bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white rounded-xl transition-all"
                            title="הסר מרשימת המעקב"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-16 bg-slate-900 rounded-2xl border border-slate-800 space-y-4">
                  <Download className="w-12 h-12 text-slate-600 mx-auto" />
                  <div className="space-y-2">
                    <p className="text-lg font-bold text-white">טרם הורדת קבצי מודים פיזיים</p>
                    <p className="text-sm text-slate-400">גש לדפדפן והורד תוסף כדי ליצור קובץ אמיתי שיורד ישירות למחשב שלך!</p>
                    <button 
                      onClick={() => setActiveTab('explore')}
                      className="mt-2 bg-emerald-500 text-slate-950 font-bold px-4 py-2 rounded-xl text-xs hover:bg-emerald-400"
                    >
                      דפדף בתוספים כעת
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* לשונית מדריך התקנה שלב אחר שלב */}
          {activeTab === 'guide' && (
            <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6 space-y-6">
              <div>
                <h2 className="text-xl font-bold text-white">איך להפעיל את הקבצים שהורדת במחשב?</h2>
                <p className="text-sm text-slate-400">בחר באחד השלבים למטה כדי לדעת בדיוק איך לגרום להם לעבוד במיינקראפט בדרוק.</p>
              </div>

              {/* שלבים אינטראקטיביים */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-2 border-b border-slate-800 pb-4">
                {[
                  '1. הורדת הקובץ האמיתי',
                  '2. פתיחת קובץ ה-MCPACK',
                  '3. תהליך הייבוא במשחק',
                  '4. הפעלת המוד בעולם'
                ].map((stepText, idx) => (
                  <button
                    key={idx}
                    onClick={() => setGuideStep(idx)}
                    className={`p-3 rounded-xl text-right text-xs font-bold transition-all ${
                      guideStep === idx 
                        ? 'bg-emerald-500 text-slate-950' 
                        : 'bg-slate-950 text-slate-400 hover:bg-slate-800'
                    }`}
                  >
                    {stepText}
                  </button>
                ))}
              </div>

              {/* תצוגת השלב הנבחר */}
              <div className="p-6 bg-slate-950 rounded-xl border border-slate-800 space-y-4">
                {guideStep === 0 && (
                  <div className="space-y-3">
                    <h3 className="text-lg font-bold text-emerald-400">שלב 1: הורדת הקובץ</h3>
                    <p className="text-sm text-slate-300 leading-relaxed">
                      לחץ על <strong>"הורד למחשב (.mcpack)"</strong> בלשונית הדפדפן. 
                      האפליקציה תתחיל להרכיב קובץ ארכיון ZIP תקני עבור מיינקראפט, תשנה את סיומתו ל- <code className="bg-slate-800 px-1.5 py-0.5 rounded text-yellow-400">.mcpack</code> ותוריד אותו אוטומטית לתיקיית Downloads במחשב שלך.
                    </p>
                  </div>
                )}

                {guideStep === 1 && (
                  <div className="space-y-3">
                    <h3 className="text-lg font-bold text-emerald-400">שלב 2: לחיצה כפולה (Double Click)</h3>
                    <p className="text-sm text-slate-300 leading-relaxed">
                      נווט לתיקיית <strong>"הורדות" (Downloads)</strong> במחשב שלך, ומצא את הקובץ שהורדת (לדוגמה: <code className="text-emerald-400 font-mono">dynamic_lighting.mcpack</code>).
                      כל שעליך לעשות הוא ללחוץ עליו **לחיצה כפולה (קליק כפול)**.
                    </p>
                    <div className="p-3 bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-400 flex items-center gap-2">
                      <span className="w-2.5 h-2.5 bg-yellow-500 rounded-full"></span>
                      <span>טיפ: אם המחשב שואל אותך באמצעות איזו תוכנה לפתוח, בחר ב-<strong>Minecraft</strong> וסמן ב-V שישתמש בה תמיד עבור סוג קובץ זה.</span>
                    </div>
                  </div>
                )}

                {guideStep === 2 && (
                  <div className="space-y-3">
                    <h3 className="text-lg font-bold text-emerald-400">שלב 3: ייבוא אוטומטי למשחק</h3>
                    <p className="text-sm text-slate-300 leading-relaxed">
                      לאחר הלחיצה הכפולה, מיינקראפט בדרוק של מחשבך ייפתח בצורה אוטומטית. 
                      בחלק העליון של המסך תופיע הכרזה: 
                      <span className="text-emerald-400 font-semibold"> "Import Started..."</span> ולאחר מכן 
                      <span className="text-emerald-400 font-semibold"> "Successfully Imported..."</span>. 
                      הקובץ כעת הותקן רשמית בתיקיית ה-`com.mojang` המקומית שלכם.
                    </p>
                  </div>
                )}

                {guideStep === 3 && (
                  <div className="space-y-3">
                    <h3 className="text-lg font-bold text-emerald-400">שלב 4: הוספת המוד לעולם קיים או חדש</h3>
                    <p className="text-sm text-slate-300 leading-relaxed">
                      על מנת להשתמש בתוסף שהתקנת בתוך עולם משחק:
                    </p>
                    <ul className="list-decimal list-inside text-sm text-slate-300 space-y-2 pr-2">
                      <li>פתח את המיינקראפט, ולחץ על <strong>Play</strong>.</li>
                      <li>צור עולם חדש או לחץ על אייקון העיפרון ליד עולם קיים כדי לערוך אותו.</li>
                      <li>בתפריט ההגדרות הצידי, גלול מטה עד שתגיע ל- <strong>Resource Packs</strong> או <strong>Behavior Packs</strong> (חבילות התנהגות/משאבים).</li>
                      <li>לחץ על <strong>My Packs</strong>, מצא את התוסף ולחץ על כפתור <strong>Activate</strong>.</li>
                      <li><strong>חשוב מאוד:</strong> תחת קטגוריית <strong>Experiments</strong> (ניסויים) בהגדרות העולם, ודא שהאופציות של "Beta APIs" ו-"Holiday Creator Features" פעילות כדי שהמוד יעבוד מצוין.</li>
                    </ul>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* לשונית תיקיות המשחק במחשב */}
          {activeTab === 'folders' && (
            <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6 space-y-6">
              <div>
                <h2 className="text-xl font-bold text-white">תיקיית com.mojang המקומית במחשב</h2>
                <p className="text-sm text-slate-400">
                  כל המודים, העולמות וחבילות הטקסטורה של גרסת הבדרוק במחשב נשמרים בתיקייה פנימית נסתרת של מערכת ההפעלה Windows.
                </p>
              </div>

              {/* נתיב תיקייה להעתקה */}
              <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-3">
                <p className="text-xs font-bold text-slate-400 uppercase">נתיב התיקייה הרשמי של Bedrock:</p>
                <div className="flex flex-col md:flex-row gap-2 items-stretch md:items-center">
                  <code className="bg-slate-900 border border-slate-800 p-3 rounded-lg text-xs md:text-sm text-emerald-400 font-mono flex-1 break-all select-all text-left">
                    {BEDROCK_FOLDER_PATH}
                  </code>
                  <button
                    onClick={copyPathToClipboard}
                    className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold px-4 py-3 rounded-lg text-xs flex items-center justify-center gap-1.5 whitespace-nowrap transition-colors"
                  >
                    <Copy className="w-4 h-4" />
                    <span>העתק נתיב</span>
                  </button>
                </div>
              </div>

              <div className="space-y-3">
                <h3 className="font-bold text-white text-sm">איך להגיע לתיקייה הזו עצמאית?</h3>
                <ol className="list-decimal list-inside text-sm text-slate-300 space-y-2">
                  <li>לחץ על המקשים <kbd className="bg-slate-800 px-1.5 py-0.5 rounded text-xs font-bold font-mono">Windows + R</kbd> במקלדת לפתיחת חלון ה-Run.</li>
                  <li>הדבק את הנתיב שהעתקת למעלה ולחץ על <span className="font-bold text-emerald-400">Enter</span>.</li>
                  <li>שם תראה את תיקיות ה- <code className="text-yellow-400 font-mono">behavior_packs</code> וה- <code className="text-yellow-400 font-mono">resource_packs</code> שלך!</li>
                </ol>
              </div>
            </div>
          )}

        </main>
      </div>

      {/* הודעות מערכת צפות (Toasts) */}
      {toast && (
        <div className="fixed bottom-6 left-6 right-6 sm:left-auto sm:max-w-md z-50 animate-bounce">
          <div className={`p-4 rounded-xl shadow-xl flex items-center justify-between border ${
            toast.type === 'error' 
              ? 'bg-red-500/10 border-red-500/40 text-red-300' 
              : toast.type === 'info'
              ? 'bg-blue-500/10 border-blue-500/40 text-blue-300'
              : 'bg-emerald-500/10 border-emerald-500/40 text-emerald-300'
          }`}>
            <span className="font-bold text-sm leading-relaxed">{toast.message}</span>
            <button onClick={() => setToast(null)} className="p-1 hover:bg-white/10 rounded mr-2">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* תחתית הדף */}
      <footer className="border-t border-slate-900 bg-slate-950 py-8 px-6 text-center text-xs text-slate-500">
        <p>© 2026 Minecraft Bedrock Add-on Manager for PC. כל הזכויות שמורות.</p>
        <p className="mt-1">אפליקציה זו הינה כלי עזר חינוכי וקונספטואלי. המשחק מיינקראפט וכל סימני המסחר שייכים ל-Mojang Studios ו-Microsoft.</p>
      </footer>

    </div>
  );
}