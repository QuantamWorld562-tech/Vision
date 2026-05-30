import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";

const CREATE_OPTIONS = [
  {
    icon: "videocam",
    label: "Upload Video",
    description: "Share long-form content with your audience",
    path: "/createvideo",
    color: "hover:bg-red-50 hover:border-red-200",
    iconColor: "text-red-500",
  },
  {
    icon: "slideshow",
    label: "Create Short",
    description: "Upload a vertical short-form video",
    path: "/createshort",
    color: "hover:bg-pink-50 hover:border-pink-200",
    iconColor: "text-pink-500",
  },
  {
    icon: "edit_note",
    label: "Community Post",
    description: "Share updates, images or thoughts",
    path: "/createpost",
    color: "hover:bg-blue-50 hover:border-blue-200",
    iconColor: "text-blue-500",
  },
  {
    icon: "video_library",
    label: "New Playlist",
    description: "Organise your videos into a collection",
    path: "/createplaylist",
    color: "hover:bg-purple-50 hover:border-purple-200",
    iconColor: "text-purple-500",
  },
];

function CreatePage() {
  const navigate = useNavigate();
  const { channelData } = useSelector((s) => s.user);

  return (
    <div className="max-w-2xl mx-auto py-6 px-2">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Create</h1>
        <p className="text-gray-500 text-sm mt-1">
          Choose what type of content you want to share with your audience
        </p>
      </div>

      {/* Content type grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8">
        {CREATE_OPTIONS.map((opt) => (
          <button
            key={opt.path}
            onClick={() => navigate(opt.path)}
            className={`flex items-center gap-4 p-5 bg-white border border-gray-200 rounded-2xl text-left transition-all cursor-pointer group ${opt.color}`}
          >
            <div className={`w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform`}>
              <span className={`material-symbols-outlined text-2xl ${opt.iconColor}`}>
                {opt.icon}
              </span>
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-gray-900">{opt.label}</p>
              <p className="text-xs text-gray-400 mt-0.5">{opt.description}</p>
            </div>
            <span className="material-symbols-outlined text-gray-300 ml-auto shrink-0 group-hover:text-gray-500 transition-colors">
              chevron_right
            </span>
          </button>
        ))}
      </div>

      {/* Studio shortcut */}
      {channelData && (
        <div className="border-t border-gray-100 pt-6">
          <p className="text-xs text-gray-400 uppercase tracking-wide font-medium mb-3">Creator Tools</p>
          <button
            onClick={() => navigate("/studio")}
            className="w-full flex items-center gap-4 p-5 bg-linear-to-r from-gray-900 to-gray-700 rounded-2xl text-left hover:from-gray-800 hover:to-gray-600 transition-all group"
          >
            <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-white text-2xl">bar_chart</span>
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-white">Vision Studio</p>
              <p className="text-xs text-white/60 mt-0.5">Analytics, revenue, and content management</p>
            </div>
            <span className="material-symbols-outlined text-white/40 ml-auto shrink-0 group-hover:text-white/70 transition-colors">
              chevron_right
            </span>
          </button>
        </div>
      )}
    </div>
  );
}

export default CreatePage;
