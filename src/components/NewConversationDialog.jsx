import React, { useEffect, useMemo, useState } from "react";
import { Dialog, DialogContent, DialogTitle } from "./ui/dialog";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import axios from "axios";
import { useSelector } from "react-redux";

const NewConversationDialog = ({ open, onClose, onCreated }) => {
  const currentUser = useSelector((s) => s.auth.profile);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState([]);
  const [selected, setSelected] = useState({});
  const [groupName, setGroupName] = useState("");

  useEffect(() => {
    if (!open) return;
    setQuery("");
    setUsers([]);
    setSelected({});
    setGroupName("");
    // Load suggestions khi mở
    (async () => {
      try {
        setLoading(true);
        const res = await axios.get(`/message/suggestions`);
        if (res.data?.success) {
          const list = (res.data.users || []).filter(
            (u) => u._id !== currentUser?._id
          );
          setUsers(list);
        }
      } catch (e) {
        console.error("Load suggestions error:", e);
      } finally {
        setLoading(false);
      }
    })();
  }, [open]);

  const search = async () => {
    try {
      setLoading(true);
      if (query.trim()) {
        const res = await axios.get(`/user/search`, { params: { query } });
        if (res.data?.success) {
          const list = (res.data.users || []).filter(
            (u) => u._id !== currentUser?._id
          );
          setUsers(list);
        }
      } else {
        const res = await axios.get(`/message/suggestions`);
        if (res.data?.success) {
          const list = (res.data.users || []).filter(
            (u) => u._id !== currentUser?._id
          );
          setUsers(list);
        }
      }
    } catch (err) {
      console.error("Search/suggestions error:", err);
    } finally {
      setLoading(false);
    }
  };

  const selectedIds = useMemo(
    () => Object.keys(selected).filter((k) => selected[k]),
    [selected]
  );

  const toggleSelect = (userId) => {
    setSelected((prev) => ({ ...prev, [userId]: !prev[userId] }));
  };

  const createConversation = async () => {
    try {
      if (selectedIds.length === 1) {
        const targetId = selectedIds[0];
        const res = await axios.post(`/message/conversation/${targetId}`);
        if (res.data?.success) {
          onCreated({
            type: "direct",
            conversation: res.data.conversation,
            messages: res.data.messages,
          });
          onClose(false);
        }
      } else if (selectedIds.length >= 2) {
        const name = groupName?.trim() || "New Group";
        const res = await axios.post(`/message/group`, {
          groupName: name,
          participantIds: selectedIds,
        });
        if (res.data?.success) {
          onCreated({ type: "group", conversation: res.data.conversation });
          onClose(false);
        }
      }
    } catch (err) {
      console.error("Create conversation error:", err);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogTitle>Tạo cuộc trò chuyện</DialogTitle>
        <div className="space-y-3">
          <div className="flex gap-2">
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Tìm người dùng theo tên hoặc username"
            />
            <Button disabled={loading} onClick={search}>
              {loading ? "Đang tìm..." : "Tìm"}
            </Button>
          </div>
          {users.length > 0 && (
            <div className="max-h-60 overflow-auto border rounded">
              {users.map((u) => (
                <label
                  key={u._id}
                  className="flex items-center gap-2 p-2 hover:bg-gray-50 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={!!selected[u._id]}
                    onChange={() => toggleSelect(u._id)}
                  />
                  <img
                    src={u.profilePicture || ""}
                    alt="avatar"
                    className="w-6 h-6 rounded-full object-cover"
                  />
                  <span className="font-medium">{u.username}</span>
                  <span className="text-gray-500 text-sm">{u.name}</span>
                </label>
              ))}
            </div>
          )}
          {selectedIds.length >= 2 && (
            <Input
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              placeholder="Tên nhóm (tùy chọn)"
            />
          )}
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => onClose(false)}>
              Hủy
            </Button>
            <Button
              disabled={selectedIds.length === 0}
              onClick={createConversation}
            >
              {selectedIds.length <= 1 ? "Tạo trò chuyện" : "Tạo nhóm"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default NewConversationDialog;


