import { serverUrl } from "../App";
import { useDispatch } from "react-redux";
import { setUserData, setAuthLoading } from "../redux/userSlice";
import { useEffect } from "react";
import axiosInstance from "../utils/axiosInstance";

function GetCurrentUser() {
  const dispatch = useDispatch();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await axiosInstance.get(`/api/v1/user`);
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
