import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import type { RootState } from "../redux/store";

function CreatePage() {
  const navigate = useNavigate();
  const { channelData } = useSelector((s: RootState) => s.user);

  const cards: { icon: string; label: string; path: string; description: string }[] = [
    { icon: "videocam", label: "Upload Video", path: "/createvideo", description: "Share long-form videos with your audience" },
    { icon: "video_camera_back", label: "Create Short", path: "/createshort", description: "Share short-form vertical videos" },
    { icon: "video_library", label: "Create Playlist", path: "/createplaylist", description: "Organise your videos into a playlist" },
    { icon: "article", label: "Create Post", path: "/createpost", description: "Share a community post with your channel" },
  ];

  if (!channelData) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4 text-gray-500">
        <span className="material-symbols-outlined text-6xl">video_call</span>
        <p className="text-lg font-semibold">You need a channel to create content</p>
        <button
          onClick={() => navigate("/createChannel")}
          className="px-6 py-2.5 bg-red-500 hover:bg-red-600 text-white rounded-full text-sm font-medium transition-colors"
        >
          Create Channel
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Create</h1>
      <p className="text-sm text-gray-500 mb-6">Choose what you'd like to share</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {cards.map((card) => (
          <button
            key={card.label}
            onClick={() => navigate(card.path)}
            className="flex items-center gap-4 p-5 border border-gray-200 hover:border-red-300 hover:bg-red-50 rounded-2xl text-left transition-colors group"
          >
            <div className="w-12 h-12 rounded-xl bg-gray-100 group-hover:bg-red-100 flex items-center justify-center transition-colors">
              <span className="material-symbols-outlined text-gray-500 group-hover:text-red-500 text-[28px]">{card.icon}</span>
            </div>
            <div>
              <p className="font-semibold text-gray-900">{card.label}</p>
              <p className="text-xs text-gray-400 mt-0.5">{card.description}</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

export default CreatePage;
