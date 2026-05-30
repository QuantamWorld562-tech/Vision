import axios from "axios";
import { serverUrl } from "../App";
import { useDispatch } from "react-redux";
import { setUserData, setAuthLoading } from "../redux/userSlice";
import { useEffect } from "react";

function GetCurrentUser() {
  const dispatch = useDispatch();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await axios.get(`${serverUrl}/api/v1/user`, {
          withCredentials: true,
        });
        dispatch(setUserData(res.data.user));
      } catch (error) {
        dispatch(setUserData(null));
        dispatch(setAuthLoading(false));
      }
    };
    fetchUser();
  }, []);
}

export default GetCurrentUser;
