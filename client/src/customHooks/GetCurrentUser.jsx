import axios from "axios";
import { serverUrl } from "../App";
import { useDispatch } from "react-redux";
import { setUserData, setAuthLoading } from "../redux/userSlice";
import { useEffect } from "react";

function GetCurrentUser() {
  const dispatch = useDispatch();

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
  }, []);
}

export default GetCurrentUser;
