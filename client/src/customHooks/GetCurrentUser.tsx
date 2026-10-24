import axios from "axios";
import { serverUrl } from "../constants";
import { useDispatch } from "react-redux";
import { setUserData, setAuthLoading } from "../redux/userSlice";
import { useEffect } from "react";
import type { AppDispatch } from "../redux/store";

function GetCurrentUser() {
  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    const fetchUser = async () => {
      // authLoading starts true — always set it false when done, regardless of outcome
      try {
        const res = await axios.get(`${serverUrl}/api/v1/user`, {
          withCredentials: true,
        });
        dispatch(setUserData(res.data.user)); // also sets authLoading=false internally
      } catch {
        // 401 = no valid cookie → user is not logged in, that's fine
        // Any other error → still mark loading done so app doesn't hang
        dispatch(setUserData(null));
      } finally {
        dispatch(setAuthLoading(false));
      }
    };
    fetchUser();
  }, [dispatch]);

  return null;
}

export default GetCurrentUser;
