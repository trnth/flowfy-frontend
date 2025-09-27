import React, { useEffect, useMemo, useState } from "react";
import { Dialog, DialogContent, DialogTitle } from "./ui/dialog";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import axios from "axios";

const EditGroupMembersDialog = ({
  open,
  onClose,
  conversationId,
  mode = "add", // "add" | "remove"
  currentParticipantIds = [],
  onUpdated,
}) => {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState([]);
  const [selected, setSelected] = useState({});

  useEffect(() => {
    if (!open) return;
    setQuery("");
    setUsers([]);
    setSelected({});
    // Auto load theo mode
    if (mode === "add") {
      // ưu tiên suggestions khi mở
      (async () => {
        try {
          setLoading(true);
          const res = await axios.get(`/message/suggestions`);
          if (res.data?.success) {
            const list = (res.data.users || []).filter(
              (u) => !currentParticipantIds.includes(u._id)
            );
            setUsers(list);
          }
        } catch (err) {
          console.error("Load suggestions error:", err);
        } finally {
          setLoading(false);
        }
      })();
    } else {
      // remove mode: tải danh sách thành viên nhóm
      (async () => {
        try {
          setLoading(true);
          const res = await axios.get(`/message/group/${conversationId}/participants`);
          if (res.data?.success) {
            const list = (res.data.participants || []).filter((p) =>
              currentParticipantIds.includes(p._id)
            );
            setUsers(list);
          }
        } catch (err) {
          console.error("Load participants error:", err);
        } finally {
          setLoading(false);
        }
      })();
    }
  }, [open]);

  const search = async () => {
    try {
      setLoading(true);
      if (mode === "add") {
        if (query.trim()) {
          const res = await axios.get(`/user/search`, { params: { query } });
          if (res.data?.success) {
            const list = (res.data.users || []).filter(
              (u) => !currentParticipantIds.includes(u._id)
            );
            setUsers(list);
          }
        } else {
          const res = await axios.get(`/message/suggestions`);
          if (res.data?.success) {
            const list = (res.data.users || []).filter(
              (u) => !currentParticipantIds.includes(u._id)
            );
            setUsers(list);
          }
        }
      } else {
        // remove: filter trong participants theo query (tên/username)
        const lc = query.trim().toLowerCase();
        if (!lc) {
          const res = await axios.get(`/message/group/${conversationId}/participants`);
          if (res.data?.success) setUsers(res.data.participants || []);
        } else {
          setUsers((prev) =>
            (prev || []).filter(
              (u) =>
                u.username?.toLowerCase()?.includes(lc) ||
                u.name?.toLowerCase()?.includes(lc)
            )
          );
        }
      }
    } catch (err) {
      console.error("Search users error:", err);
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

  const submit = async () => {
    if (!selectedIds.length || !conversationId) return;
    try {
      setLoading(true);
      console.log("Submitting with:", { mode, conversationId, selectedIds });
      
      if (mode === "add") {
        const res = await axios.post(`/message/group/${conversationId}/add`, {
          userIds: selectedIds,
        }, { withCredentials: true });
        console.log("Add response:", res.data);
        if (res.data?.conversation) onUpdated(res.data.conversation);
      } else {
        const res = await axios.post(`/message/group/${conversationId}/remove`, {
          userIds: selectedIds,
        }, { withCredentials: true });
        console.log("Remove response:", res.data);
        if (res.data?.conversation) onUpdated(res.data.conversation);
      }
      onClose(false);
    } catch (err) {
      console.error("Update members error:", err);
      console.error("Error response:", err.response?.data);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogTitle>
          {mode === "add" ? "Thêm thành viên nhóm" : "Xoá thành viên nhóm"}
        </DialogTitle>
        <div className="space-y-3">
          <div className="flex gap-2">
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={
                mode === "add"
                  ? "Tìm người dùng để thêm"
                  : "Tìm thành viên để xoá"
              }
            />
            <Button disabled={loading} onClick={search}>
              {loading ? "Đang tìm..." : "Tìm"}
            </Button>
          </div>
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
                  src={u.profilePicture || undefined}
                  alt="avatar"
                  className="w-6 h-6 rounded-full object-cover"
                />
                <span className="font-medium">{u.username}</span>
                <span className="text-gray-500 text-sm">{u.name}</span>
              </label>
            ))}
            {!users.length && (
              <div className="p-3 text-center text-sm text-gray-500">
                {loading ? "Đang tải..." : "Không có kết quả"}
              </div>
            )}
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => onClose(false)}>
              Hủy
            </Button>
            <Button disabled={!selectedIds.length || loading} onClick={submit}>
              {mode === "add" ? "Thêm" : "Xoá"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EditGroupMembersDialog;


