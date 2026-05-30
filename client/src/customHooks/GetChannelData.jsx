import { useDispatch } from "react-redux";
import { setChannelData } from "../redux/userSlice";
import { useEffect } from "react";
import axiosInstance from "../utils/axiosInstance";

function GetChannelData() {
  const dispatch = useDispatch();
  useEffect(() => {
    const fetchChannel = async () => {
      try {
        const res = await axiosInstance.get(`/api/v1/user/channel`);
        dispatch(setChannelData(res.data));
      } catch (error) {
        dispatch(setChannelData(null));
      }
    };
    fetchChannel();
  }, []);
}

export default GetChannelData;
