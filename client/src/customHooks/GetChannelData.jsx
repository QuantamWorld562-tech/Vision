import axios from "axios";
import { serverUrl } from "../App";
import { useDispatch } from "react-redux";
import { setChannelData } from "../redux/userSlice";
import { useEffect } from "react";

function GetChannelData() {
  const dispatch = useDispatch();
  useEffect(() => {
    const fetchChannel = async () => {
      try {
        const res = await axios.get(`${serverUrl}/api/v1/user/channel`, {
          withCredentials: true,
        });
        dispatch(setChannelData(res.data));
      } catch (error) {
        dispatch(setChannelData(null));
      }
    };
    fetchChannel();
  }, []);
}

export default GetChannelData;
