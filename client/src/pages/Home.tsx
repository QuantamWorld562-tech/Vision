import { useState } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import {
  LuBell,
  LuBookmark,
  LuCircleUserRound,
  LuClapperboard,
  LuClock3,
  LuFlame,
  LuHouse,
  LuListVideo,
  LuMenu,
  LuMic,
  LuPlus,
  LuSearch,
  LuThumbsUp,
  LuVideo,
} from "react-icons/lu";
import type { IconType } from "react-icons";
import Profile from "../components/Profile";
import type { RootState } from "../redux/store";
import type { NavItem } from "../types";

const CATEGORIES = [
  "All", "Music", "Gaming", "Movies", "TV Shows", "News",
  "Trending", "Entertainment", "Education", "Science", "Travel", "Arts",
];

interface SidebarItemProps {
  icon: string;
  text: string;
  open: boolean;
  selected: boolean;
  onClick: () => void;
}

const shellIcons: Record<string, IconType> = {
  menu: LuMenu,
  search: LuSearch,
  mic: LuMic,
  notifications: LuBell,
  account_circle: LuCircleUserRound,
  home: LuHouse,
  whatshot: LuFlame,
  subscriptions: LuClapperboard,
  history: LuClock3,
  video_library: LuListVideo,
  bookmark: LuBookmark,
  thumb_up: LuThumbsUp,
  add_2: LuPlus,
  video_call: LuVideo,
};

function ShellIcon({ name, className = "" }: { name: string; className?: string }) {
  const Icon = shellIcons[name] ?? LuCircleUserRound;
  return <Icon className={className} strokeWidth={1.9} aria-hidden="true" />;
}

function SidebarItem({ icon, text, open, selected, onClick }: SidebarItemProps) {
  return (
    <button
      className={`flex items-center gap-4 px-3 py-2.5 transition-all duration-150 rounded-xl mx-1 w-[calc(100%-8px)] cursor-pointer active:scale-95
        ${open ? "justify-start" : "justify-center"}
        ${selected ? "bg-gray-100 font-semibold text-black" : "text-gray-700 hover:bg-gray-100/80 hover:text-black"}`}
      onClick={onClick}
    >
      <ShellIcon
        name={icon}
        className={`h-[21px] w-[21px] transition-transform ${selected ? "text-red-500 scale-105" : "text-slate-500"}`}
      />
      {open && <span className="text-sm tracking-tight">{text}</span>}
    </button>
  );
}

interface MobilebarProps {
  icon: string;
  text: string;
  selected: boolean;
  onClick: () => void;
  photoUrl?: string | null;
}

function Mobilebar({ icon, text, selected, onClick, photoUrl }: MobilebarProps) {
  return (
    <button
      className={`flex flex-col items-center justify-center gap-0.5 px-2 py-1 rounded-xl transition-all duration-150 flex-1 active:scale-95 cursor-pointer
        ${selected ? "text-black font-semibold" : "text-gray-600 hover:text-black"}`}
      onClick={onClick}
    >
      {photoUrl
        ? <img src={photoUrl} className={`w-6 h-6 rounded-full object-cover ring-2 ${selected ? "ring-black" : "ring-transparent"}`} alt="avatar" />
        : <ShellIcon name={icon} className={`h-[21px] w-[21px] transition-transform ${selected ? "text-red-500 scale-105" : "text-slate-500"}`} />
      }
      <span className="text-[10px]">{text}</span>
    </button>
  );
}

function Home() {
  const [searchQuery, setSearchQuery] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [selectedItem, setSelectedItem] = useState("Home");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [profilePop, setProfilePop] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { userData, authLoading } = useSelector((store: RootState) => store.user);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    setSearchOpen(false);
  };

  const handleCategoryChange = (cat: string) => {
    setSelectedCategory(cat);
    if (location.pathname !== "/") navigate("/");
  };

  const mainItems: (NavItem & { path: string })[] = [
    { icon: "home", text: "Home", path: "/" },
    { icon: "whatshot", text: "Shorts", path: "/shorts" },
    { icon: "subscriptions", text: "Subscriptions", path: "/subscriptions" },
  ];

  const youItems: (NavItem & { path: string })[] = [
    { icon: "history", text: "History", path: "/history" },
    { icon: "video_library", text: "Playlists", path: "/saved-playlists" },
    { icon: "bookmark", text: "Save videos", path: "/saved-videos" },
    { icon: "thumb_up", text: "Liked videos", path: "/liked-videos" },
  ];

  const mobileitems: NavItem[] = [
    { icon: "home", text: "Home" },
    { icon: "whatshot", text: "Shorts" },
    { icon: "add_2", text: "Create" },
    { icon: "subscriptions", text: "Subscriptions" },
    { icon: "account_circle", text: "Account" },
  ];

  const handler = (text: string, path?: string) => {
    if (path) { navigate(path); setSelectedItem(text); return; }
    if (text === "Account") setProfilePop((prev) => !prev);
    if (text === "Create") navigate("/create");
  };

  const isHome = location.pathname === "/";

  if (authLoading) return null;

  return (
    <>
      {/* ── NAVBAR ── */}
      <div className="w-full h-16 px-3 md:px-6 flex items-center justify-between border-b fixed top-0 left-0 right-0 z-40 glass-nav">

        {/* Left — menu + logo */}
        <div className="flex items-center gap-2 min-w-0">
          <div className="hidden md:flex">
            <button
              type="button"
              className="cursor-pointer rounded-xl p-2 text-red-500 transition-colors hover:bg-red-50 hover:text-red-600"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              <ShellIcon name="menu" className="h-5 w-5" />
            </button>
          </div>
          <div
            className="flex items-center gap-1 cursor-pointer"
            onClick={() => navigate("/")}
          >
            <img className="w-8 h-8 md:w-16 md:h-16 object-contain" src="/logo.png" alt="logo" />
            <h2 className="text-lg font-black tracking-tight gradient-text">Vision</h2>
          </div>
        </div>

        {/* Center — search bar */}
        <div className="hidden sm:flex items-center gap-2 flex-1 max-w-xl mx-4">
          <form onSubmit={handleSearch} className="flex items-center w-full">
            <div className="flex items-center w-full border border-gray-300 rounded-l-full overflow-hidden focus-within:border-red-400">
              <input
                className="w-full px-4 py-2 outline-none text-sm placeholder-gray-400"
                type="text"
                placeholder="Search with AI..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <button
              type="submit"
              className="px-4 py-2 bg-gray-100 border border-l-0 border-gray-300 rounded-r-full hover:bg-red-50 hover:text-red-600"
            >
              <ShellIcon name="search" className="h-5 w-5" />
            </button>
          </form>
          <button className="p-2 text-red-500 hover:bg-red-50 hover:text-red-600 rounded-full hidden sm:flex">
            <ShellIcon name="mic" className="h-5 w-5" />
          </button>
        </div>

        {/* Right — icons */}
        <div className="flex items-center gap-1">
          <button
            className="p-2 text-red-500 hover:bg-red-50 hover:text-red-600 rounded-full sm:hidden"
            onClick={() => setSearchOpen((p) => !p)}
          >
            <ShellIcon name="search" className="h-5 w-5" />
          </button>

          {userData?.channel && (
            <button
              type="button"
              onClick={() => navigate("/create")}
              className="hidden rounded-xl p-2 text-red-500 transition-colors hover:bg-red-50 hover:text-red-600 sm:flex"
            >
              <ShellIcon name="video_call" className="h-5 w-5" />
            </button>
          )}
          <button className="p-2 text-red-500 hover:bg-red-50 hover:text-red-600 rounded-full">
            <ShellIcon name="notifications" className="h-5 w-5" />
          </button>
          <div className="relative hidden md:block">
            <button
              className="p-1 hover:bg-gray-100 rounded-full"
              onClick={() => setProfilePop((prev) => !prev)}
            >
              {userData?.photoUrl
                ? <img src={userData.photoUrl} className="w-8 h-8 rounded-full object-cover" alt="avatar" />
                : <ShellIcon name="account_circle" className="h-7 w-7 text-red-500" />
              }
            </button>
            <Profile isOpen={profilePop} onClose={() => setProfilePop(false)} />
          </div>
        </div>
      </div>

      {/* Mobile search dropdown */}
      {searchOpen && (
        <div className="fixed top-16 left-0 right-0 z-40 bg-white/90 backdrop-blur-xl border-b border-gray-200 px-3 py-2 sm:hidden">
          <form onSubmit={handleSearch} className="flex items-center w-full">
            <div className="flex items-center w-full border border-gray-300 rounded-l-full overflow-hidden focus-within:border-red-400">
              <input
                autoFocus
                className="w-full px-4 py-2 outline-none text-sm placeholder-gray-400"
                type="text"
                placeholder="Search with AI..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <button
              type="submit"
              className="px-4 py-2 bg-gray-100 border border-l-0 border-gray-300 rounded-r-full hover:bg-red-50 hover:text-red-600"
            >
              <ShellIcon name="search" className="h-5 w-5" />
            </button>
          </form>
        </div>
      )}

      {/* ── SIDEBAR (desktop) ── */}
      <aside className={`bg-white/70 border-r transition-all duration-300 fixed top-16 bottom-0 z-30 hidden md:flex flex-col overflow-y-auto py-4 glass-nav ${sidebarOpen ? "w-60" : "w-16"}`}>
        {mainItems.map((item) => (
          <SidebarItem
            key={item.text}
            icon={item.icon}
            text={item.text}
            open={sidebarOpen}
            selected={selectedItem === item.text}
            onClick={() => handler(item.text, item.path)}
          />
        ))}

        {sidebarOpen && <hr className="border-gray-200 my-3 mx-3" />}
        {sidebarOpen && <p className="text-gray-500 text-sm font-semibold px-4 mb-1">You</p>}

        {youItems.map((item) => (
          <SidebarItem
            key={item.text}
            icon={item.icon}
            text={item.text}
            open={sidebarOpen}
            selected={selectedItem === item.text}
            onClick={() => handler(item.text, item.path)}
          />
        ))}
      </aside>

      {/* ── MAIN CONTENT ── */}
      <main className={`mt-16 pb-16 md:pb-8 transition-all duration-300 ${sidebarOpen ? "md:ml-60" : "md:ml-16"}`}>

        {/* Category bar — only on home */}
        {isHome && (
          <div className="sticky top-16 z-20 bg-white/70 backdrop-blur-xl border-b border-gray-100 px-3 py-3">
            <div className="flex items-center gap-2 overflow-x-auto scrollbar-none">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => handleCategoryChange(cat)}
                  className={`whitespace-nowrap px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    selectedCategory === cat
                      ? "bg-gray-900 text-white shadow-lg shadow-gray-900/15"
                      : "bg-white/80 hover:bg-white text-gray-700 border border-gray-200/80"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="px-3 md:px-4 pt-3">
          {/* Pass category props to Feed via Outlet context */}
          <Outlet context={{ selectedCategory, onCategoryChange: handleCategoryChange }} />
        </div>
      </main>

      {/* ── MOBILE BOTTOM NAV ── */}
      <div className="fixed bottom-0 left-0 right-0 h-14 bg-white border-t border-gray-200 flex items-center justify-around md:hidden z-40">
        {mobileitems.map((item) => (
          <Mobilebar
            key={item.text}
            icon={item.icon}
            text={item.text}
            selected={selectedItem === item.text}
            photoUrl={item.text === "Account" ? userData?.photoUrl : null}
            onClick={() => {
              if (item.text === "Home") handler("Home", "/");
              else if (item.text === "Shorts") handler("Shorts", "/shorts");
              else if (item.text === "Subscriptions") handler("Subscriptions", "/subscriptions");
              else if (item.text === "Create") handler("Create", "/create");
              else if (item.text === "Account") setProfilePop((p) => !p);
              setSelectedItem(item.text);
            }}
          />
        ))}
        <Profile isOpen={profilePop} onClose={() => setProfilePop(false)} />
      </div>
    </>
  );
}

export default Home;
