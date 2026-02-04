import { useHandleSignInCallback } from "@logto/react";
import { useNavigate } from "react-router-dom";

const Callback = () => {
  const navigate = useNavigate();
  const { isLoading } = useHandleSignInCallback(() => {
    // 登录完成后跳回首页
    navigate("/");
  });

  // When it's working in progress
  if (isLoading) {
    return <div>Redirecting...</div>;
  }

  return null;
};

export default Callback;
