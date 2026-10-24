import axios from "axios";
import { serverUrl } from "../constants";
import { useDispatch, useSelector } from "react-redux";
import { setChannelData } from "../redux/userSlice";
import { useEffect } from "react";
import type { AppDispatch, RootState } from "../redux/store";

function GetChannelData() {
  const dispatch = useDispatch<AppDispatch>();
  const { userData, authLoading } = useSelector((store: RootState) => store.user);

  useEffect(() => {
    if (authLoading) return;
    if (!userData) {
      dispatch(setChannelData(null));
      return;
    }

    const fetchChannel = async () => {
      try {
        const res = await axios.get(`${serverUrl}/api/v1/user/channel`, {
          withCredentials: true,
        });
        dispatch(setChannelData(res.data));
      } catch {
        dispatch(setChannelData(null));
      }
    };
    fetchChannel();
  }, [dispatch, userData, authLoading]);

  return null;
}

export default GetChannelData;
