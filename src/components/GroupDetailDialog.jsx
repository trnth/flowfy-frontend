import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { Avatar, AvatarImage, AvatarFallback } from "./ui/avatar";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Badge } from "./ui/badge";
import { 
  UserPlus, 
  UserMinus, 
  LogOut, 
  Crown,
  MoreVertical,
  Edit,
  Camera
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import axios from "axios";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/contexts/ToastContext";

const GroupDetailDialog = ({ 
  open, 
  setOpen, 
  conversation, 
  onLeaveGroup,
  onAddMembers,
  onRemoveMember,
  onUpdateGroupPicture,
  onUpdateGroupName
}) => {
  const user = useSelector((store) => store.auth.profile);
  const onlineUsers = useSelector((store) => store.user.onlineUsers);
  const navigate = useNavigate();
  const { success, error } = useToast();
  const [participants, setParticipants] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showEditName, setShowEditName] = useState(false);
  const [newGroupName, setNewGroupName] = useState("");
  const [updatingName, setUpdatingName] = useState(false);

  const isAdmin = conversation?.groupAdmin === user?._id;
  const isCurrentUser = (participantId) => participantId === user?._id;

  // Load participants
  useEffect(() => {
    if (open && conversation) {
      loadParticipants();
      setNewGroupName(conversation.groupName || "");
    }
  }, [open, conversation]);

  const loadParticipants = async () => {
    try {
      setLoading(true);
      const res = await axios.get(
        `/message/group/${conversation._id}/participants`,
        { withCredentials: true }
      );
      if (res.data?.success) {
        setParticipants(res.data.participants);
      }
    } catch (err) {
      console.error("Load participants error:", err);
      error('toast.error.network');
    } finally {
      setLoading(false);
    }
  };



  const handleRemoveMember = async (userId) => {
    try {
      await axios.post(
        `/message/group/${conversation._id}/remove`,
        { userIds: [userId] },
        { withCredentials: true }
      );
        success('toast.success.userRemoved');
      loadParticipants();
      onRemoveMember?.();
    } catch (err) {
      console.error("Remove member error:", err);
      error('toast.error.userRemove');
    }
  };

  const handleLeaveGroup = async () => {
    try {
      await axios.post(
        `/message/group/${conversation._id}/remove`,
        { userIds: [user._id] },
        { withCredentials: true }
      );
        success('toast.success.groupCreated');
      onLeaveGroup?.();
      setOpen(false);
    } catch (err) {
      console.error("Leave group error:", err);
      error('toast.error.groupCreate');
    }
  };

  const handleUpdateGroupName = async () => {
    if (!newGroupName.trim() || newGroupName === conversation.groupName) {
      setShowEditName(false);
      return;
    }
    try {
      setUpdatingName(true);
      await axios.patch(
        `/message/group/${conversation._id}/name`,
        { groupName: newGroupName.trim() },
        { withCredentials: true }
      );
        success('toast.success.settingsSaved');
      onUpdateGroupName?.(newGroupName.trim());
      setShowEditName(false);
    } catch (err) {
      console.error("Update group name error:", err);
      error('toast.error.settingsSave');
    } finally {
      setUpdatingName(false);
    }
  };


  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-md max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <div className="relative">
              <Avatar 
                className="w-12 h-12 cursor-pointer"
                onClick={() => onUpdateGroupPicture?.()}
              >
                <AvatarImage src={conversation?.groupPicture} />
                <AvatarFallback>
                  {conversation?.groupName?.charAt(0) || "G"}
                </AvatarFallback>
              </Avatar>
              <div 
                className="absolute -bottom-1 -right-1 bg-blue-500 text-white rounded-full p-1 cursor-pointer hover:bg-blue-600"
                onClick={() => onUpdateGroupPicture?.()}
              >
                <Camera className="w-3 h-3" />
              </div>
            </div>
            <div className="flex-1">
              {showEditName ? (
                <div className="flex items-center gap-2">
                  <Input
                    value={newGroupName}
                    onChange={(e) => setNewGroupName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleUpdateGroupName();
                      if (e.key === "Escape") {
                        setNewGroupName(conversation.groupName || "");
                        setShowEditName(false);
                      }
                    }}
                    autoFocus
                    className="text-lg font-semibold"
                  />
                  <Button
                    size="sm"
                    onClick={handleUpdateGroupName}
                    disabled={updatingName}
                  >
                    {updatingName ? "..." : "✓"}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setNewGroupName(conversation.groupName || "");
                      setShowEditName(false);
                    }}
                  >
                    ✕
                  </Button>
                </div>
              ) : (
                <div className="relative group">
                  <span className="text-lg font-semibold">
                    {conversation?.groupName}
                  </span>
                  <div 
                    className="absolute -bottom-1 -right-1 bg-gray-500 text-white rounded-full p-1 cursor-pointer hover:bg-gray-600 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => setShowEditName(true)}
                  >
                    <Edit className="w-3 h-3" />
                  </div>
                </div>
              )}
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Current Members */}
          <div>
            <h3 className="font-semibold mb-3">Thành viên ({participants.length})</h3>
            <div className="space-y-2">
              {loading ? (
                <div className="text-center py-4">Đang tải...</div>
              ) : (
                participants.map((participant) => (
                  <div
                    key={participant._id}
                    className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50"
                  >
                    <div 
                      className="flex items-center gap-3 cursor-pointer flex-1"
                      onClick={() => navigate(`/profile/${participant._id}`)}
                    >
                      <div className="relative">
                        <Avatar className="w-10 h-10">
                          <AvatarImage src={participant.profilePicture} />
                          <AvatarFallback>
                            {participant.username?.charAt(0) || "U"}
                          </AvatarFallback>
                        </Avatar>
                        {onlineUsers?.includes(participant._id) && (
                          <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-green-600 border-2 border-white"></span>
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{participant.username}</span>
                          {participant._id === conversation?.groupAdmin && (
                            <Crown className="w-4 h-4 text-yellow-500" />
                          )}
                        </div>
                        {isCurrentUser(participant._id) && (
                          <Badge variant="secondary" className="text-xs">
                            Bạn
                          </Badge>
                        )}
                      </div>
                    </div>

                    {/* Actions - chỉ hiển thị cho admin */}
                    {isAdmin && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {!isCurrentUser(participant._id) && (
                            <DropdownMenuItem
                              onClick={() => handleRemoveMember(participant._id)}
                              className="text-red-600"
                            >
                              <UserMinus className="w-4 h-4 mr-2" />
                              Xóa khỏi nhóm
                            </DropdownMenuItem>
                          )}
                          {isCurrentUser(participant._id) && (
                            <DropdownMenuItem
                              onClick={handleLeaveGroup}
                              className="text-red-600"
                            >
                              <LogOut className="w-4 h-4 mr-2" />
                              Rời khỏi nhóm
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Add Members Section - mở dialog thêm thành viên */}
          <div className="border-t pt-4">
            <Button
              onClick={() => onAddMembers?.()}
              variant="outline"
              className="w-full"
            >
              <UserPlus className="w-4 h-4 mr-2" />
              Thêm thành viên
            </Button>
          </div>

          {/* Leave Group Button for everyone */}
          <div className="border-t pt-4">
            <Button
              onClick={handleLeaveGroup}
              variant="destructive"
              className="w-full"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Rời khỏi nhóm
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default GroupDetailDialog;
