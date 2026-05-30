import { useState } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import Profile from "../components/Profile";

const CATEGORIES = [
  "All", "Music", "Gaming", "Movies", "TV Shows", "News",
  "Trending", "Entertainment", "Education", "Science", "Travel", "Arts",
];

function Home() {
  const [searchQuery, setSearchQuery] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [selectedItem, setSelectedItem] = useState("Home");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [profilePop, setProfilePop] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { userData } = useSelector((store) => store.user);

  const handleSearch = (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    setSearchOpen(false);
  };

  const handleCategoryChange = (cat) => {
    setSelectedCategory(cat);
    // If not on home, go home first
    if (location.pathname !== "/") navigate("/");
  };

  const mainItems = [
    { icon: "home", text: "Home", path: "/" },
    { icon: "whatshot", text: "Shorts", path: "/shorts" },
    { icon: "subscriptions", text: "Subscriptions", path: "/subscriptions" },
  ];

  const youItems = [
    { icon: "history", text: "History", path: "/history" },
    { icon: "video_library", text: "Playlists", path: "/saved-playlists" },
    { icon: "bookmark", text: "Save videos", path: "/saved-videos" },
    { icon: "thumb_up", text: "Liked videos", path: "/liked-videos" },
  ];

  const mobileitems = [
    { icon: "home", text: "Home" },
    { icon: "whatshot", text: "Shorts" },
    { icon: "add_2", text: "Create" },
    { icon: "subscriptions", text: "Subscriptions" },
    { icon: "account_circle", text: "Account" },
  ];

  const handler = (text, path) => {
    if (path) { navigate(path); setSelectedItem(text); return; }
    if (text === "Account") setProfilePop((prev) => !prev);
    if (text === "Create") navigate("/create");
  };

  const isHome = location.pathname === "/";

  return (
    <>
      {/* ── NAVBAR ── */}
      <div className="w-full h-14 px-3 md:px-4 flex items-center justify-between border-b border-gray-200 bg-white fixed top-0 left-0 right-0 z-40">

        {/* Left — menu + logo */}
        <div className="flex items-center gap-2 min-w-0">
          <div className="hidden md:flex">
            <span
              className="material-symbols-outlined cursor-pointer hover:bg-gray-100 p-2 rounded-full"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              menu
            </span>
          </div>
          <div
            className="flex items-center gap-1 cursor-pointer"
            onClick={() => navigate("/")}
          >
            <img className="w-8 h-8 md:w-16 md:h-16 object-contain" src="/logo.png" alt="logo" />
            <h2 className="text-lg font-bold">Vision</h2>
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
              className="px-4 py-2 bg-gray-100 border border-l-0 border-gray-300 rounded-r-full hover:bg-gray-200"
            >
              <span className="material-symbols-outlined text-[20px]">search</span>
            </button>
          </form>
          <button className="p-2 hover:bg-gray-100 rounded-full hidden sm:flex">
            <span className="material-symbols-outlined text-[20px]">mic</span>
          </button>
        </div>

        {/* Right — icons */}
        <div className="flex items-center gap-1">
          <button
            className="p-2 hover:bg-gray-100 rounded-full sm:hidden"
            onClick={() => setSearchOpen((p) => !p)}
          >
            <span className="material-symbols-outlined text-[22px]">search</span>
          </button>

          {userData?.channel && (
            <button className="p-2 hover:bg-gray-100 rounded-full hidden sm:flex">
              <span
                onClick={() => navigate("/create")}
                className="material-symbols-outlined text-[22px]"
              >
                video_call
              </span>
            </button>
          )}
          <button className="p-2 hover:bg-gray-100 rounded-full">
            <span className="material-symbols-outlined text-[22px]">notifications</span>
          </button>
          <div className="relative hidden md:block">
            <button
              className="p-1 hover:bg-gray-100 rounded-full"
              onClick={() => setProfilePop((prev) => !prev)}
            >
              {userData?.photoUrl
                ? <img src={userData.photoUrl} className="w-8 h-8 rounded-full object-cover" alt="avatar" />
                : <span className="material-symbols-outlined text-[28px]">account_circle</span>
              }
            </button>
            <Profile isOpen={profilePop} onClose={() => setProfilePop(false)} />
          </div>
        </div>
      </div>

      {/* Mobile search dropdown */}
      {searchOpen && (
        <div className="fixed top-14 left-0 right-0 z-40 bg-white border-b border-gray-200 px-3 py-2 sm:hidden">
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
              className="px-4 py-2 bg-gray-100 border border-l-0 border-gray-300 rounded-r-full hover:bg-gray-200"
            >
              <span className="material-symbols-outlined text-[20px]">search</span>
            </button>
          </form>
        </div>
      )}

      {/* ── SIDEBAR (desktop) ── */}
      <aside className={`bg-white border-r border-gray-200 transition-all duration-300 fixed top-14 bottom-0 z-30 hidden md:flex flex-col overflow-y-auto py-3 ${sidebarOpen ? "w-60" : "w-16"}`}>
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
      <main className={`mt-14 pb-16 md:pb-4 transition-all duration-300 ${sidebarOpen ? "md:ml-60" : "md:ml-16"}`}>

        {/* Category bar — only on home */}
        {isHome && (
          <div className="sticky top-14 z-20 bg-white border-b border-gray-100 px-3 py-2">
            <div className="flex items-center gap-2 overflow-x-auto scrollbar-none">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => handleCategoryChange(cat)}
                  className={`whitespace-nowrap px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    selectedCategory === cat
                      ? "bg-gray-900 text-white"
                      : "bg-gray-100 hover:bg-gray-200 text-gray-800"
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

function SidebarItem({ icon, text, open, selected, onClick }) {
  return (
    <button
      className={`flex items-center gap-4 px-3 py-2.5 transition-colors rounded-xl mx-1 w-[calc(100%-8px)]
        ${open ? "justify-start" : "justify-center"}
        ${selected ? "bg-gray-200" : "hover:bg-gray-100"}`}
      onClick={onClick}
    >
      <span className="material-symbols-outlined text-[22px]">{icon}</span>
      {open && <span className="text-sm">{text}</span>}
    </button>
  );
}

function Mobilebar({ icon, text, selected, onClick, photoUrl }) {
  return (
    <button
      className={`flex flex-col items-center justify-center gap-0.5 px-2 py-1 rounded-xl transition-colors flex-1
        ${selected ? "bg-gray-200" : "hover:bg-gray-50"}`}
      onClick={onClick}
    >
      {photoUrl
        ? <img src={photoUrl} className="w-6 h-6 rounded-full object-cover" alt="avatar" />
        : <span className="material-symbols-outlined text-[22px]">{icon}</span>
      }
      <span className="text-[10px] text-gray-600">{text}</span>
    </button>
  );
}

export default Home;
