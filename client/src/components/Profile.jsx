import { useSelector, useDispatch } from "react-redux";
import { FaGoogle } from "react-icons/fa";
import { SiYoutubestudio } from "react-icons/si";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-hot-toast";
import { serverUrl } from "../App";
import { setUserData } from "../redux/userSlice";

function Profile({ isOpen, onClose }) {
  const { userData } = useSelector((store) => store.user);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  if (!isOpen) return null;

  const logoutHandler = async () => {
    try {
      const res = await axios.get(`${serverUrl}/api/v1/auth/logout`, {
        withCredentials: true,
      });
      toast.success(res.data.message);
      dispatch(setUserData(null));

    } catch (error) {
      toast.error(error.response?.data?.message || "Logout failed");
    }
  };

  return (
    <>
      {/* backdrop */}
      <div className="fixed inset-0 z-40" onClick={onClose} />

      {/* popup — bottom sheet on mobile, dropdown on desktop */}
      <div className="
        fixed z-50 bg-white border border-gray-200 shadow-xl
        bottom-14 left-0 right-0 rounded-t-2xl
        md:bottom-auto md:top-14 md:right-4 md:left-auto md:w-80 md:rounded-2xl
      ">
      <div className="flex p-5 gap-3">
        {userData?.photoUrl
          ? <img src={userData.photoUrl} className="w-12 h-12 rounded-full object-cover" alt="avatar" />
          : <span className="material-symbols-outlined text-4xl">account_circle</span>
        }
        <div>
          <h4>{userData?.userName}</h4>
          <h6>{userData?.email}</h6>
          <p className="text-red-500 pt-1.5 cursor-pointer" onClick={()=>{userData?.channel ? navigate("/viewChannel") : navigate("/createChannel"); onClose();}} > {userData?.channel ? "View Channel" : "Create Channel" } </p>
        </div>
      </div>
      <hr className="text-gray-400" />
      <div className="p-5">
        <h3 className="flex gap-4 items-center text-xl">
          <FaGoogle />
          Google Account
        </h3>
        <h3
          className="flex gap-4 py-2 items-center text-xl cursor-pointer"
          onClick={() => { navigate("/login"); onClose(); }}
        >
          <span className="material-symbols-outlined">switch_account</span>
          Switch Account
          <span className="material-symbols-outlined ml-auto ">chevron_right</span>
        </h3>
        <h3
          className="flex gap-4 items-center text-xl cursor-pointer"
          onClick={logoutHandler}
        >
          <span className="material-symbols-outlined">logout</span>
          Sign out
        </h3>
        {userData?.channel && (
          <h3
            className="flex gap-4 pt-2 items-center text-xl cursor-pointer hover:text-red-500 transition-colors"
            onClick={() => { navigate("/studio"); onClose(); }}
          >
            <SiYoutubestudio color="red" />
            Vision Studio
          </h3>
        )}
      </div>
      </div>
    </>
  );
}

export default Profile;
