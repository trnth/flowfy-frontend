import React from "react";

const Notification = () => {
  const { likeNotifications } = useSelector((store) => store.notification);
  return <div>Notification</div>;
};

export default Notification;
