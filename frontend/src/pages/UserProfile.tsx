import React, { useState, useEffect } from "react";
import {
  MessageSquare,
  LogOut,
  Settings,
  Edit3,
  MapPin,
  Calendar,
  Link,
  MoreHorizontal,
  ChevronLeft,
  UserCheck,
} from "lucide-react";
import { useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "store";
import axios from "axios";
import defaultImage from "@assets/hyperlocal.png";
import defaultImage2 from "@assets/react.svg";
import { logout } from "actions/userActions";
import { toaster } from "@components/ui/toaster";

interface User {
  _id: string;
  googleId?: string;
  firstName?: string;
  lastName?: string;
  email: string;
  username: string;
  password?: string;
  phoneNumber?: number;
  userPosts: string[];
  channelsFollowed: string[];
  usersFollowed: string[];
  bio?: string;
  website?: string;
  preferences: {
    theme: "light" | "dark";
    notificationSettings: {
      messageNotifications: boolean;
      soundEnabled: boolean;
      pushNotifications: boolean;
    };
    privacySettings: {
      profileVisibility: "public" | "friends_only" | "private";
      lastSeenVisibility: "all" | "contacts" | "none";
    };
  };
  blockedUsers: string[];
  reportCount?: number;
  status?: "online" | "offline" | "away" | "do_not_disturb";
  lastSeen?: Date | string;
  avatar?: {
    public_id: string;
    url: string;
  };
  coverPhoto?: {
    public_id: string;
    url: string;
  };
  location: {
    type: string;
    coordinates: [number, number];
  };
  fcmToken?: string;
  authToken?: string;
  createdAt: Date | string;
  verificationToken?: string;
  isVerified: boolean;
  resetPasswordToken?: string;
  resetPasswordExpire?: Date | string;
}

interface EditProfileMenuProps {
  onClose: () => void;
  user: User;
}

const EditProfileMenu: React.FC<EditProfileMenuProps> = ({ onClose, user }) => {
  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="bg-card max-w-md w-full rounded-xl shadow-lg p-6 relative max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 left-4 text-muted-foreground hover:text-foreground"
        >
          <ChevronLeft size={20} />
        </button>

        <h2 className="text-xl font-bold text-center mb-6 text-foreground">
          Edit Profile
        </h2>

        <div className="relative mb-6">
          <img
            src={user.coverPhoto?.url || defaultImage}
            alt="Cover"
            className="w-full h-32 object-cover rounded-lg"
          />
          <button className="absolute bottom-2 right-2 p-1.5 rounded-full bg-background/50 backdrop-blur-sm text-foreground hover:bg-background/70 transition">
            <Edit3 size={16} />
          </button>

          <div className="relative -mt-10 flex justify-center">
            <img
              src={user.avatar?.url || defaultImage}
              alt={user.firstName || "Unknown user"}
              className="w-20 h-20 rounded-full border-4 border-card object-cover"
            />
            <button className="absolute bottom-0 right-0 p-1.5 rounded-full bg-background/50 backdrop-blur-sm text-foreground hover:bg-background/70 transition">
              <Edit3 size={16} />
            </button>
          </div>
        </div>

        <form className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-1">
              Name
            </label>
            <input
              type="text"
              defaultValue={user.firstName || ""}
              className="w-full p-2 rounded-md border border-border bg-input text-foreground"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-1">
              Username
            </label>
            <input
              type="text"
              defaultValue={user.username || ""}
              className="w-full p-2 rounded-md border border-border bg-input text-foreground"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-1">
              Bio
            </label>
            <textarea
              defaultValue={user.bio || ""}
              rows={3}
              className="w-full p-2 rounded-md border border-border bg-input text-foreground"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-1">
              Website
            </label>
            <input
              type="text"
              defaultValue={user.website || ""}
              className="w-full p-2 rounded-md border border-border bg-input text-foreground"
            />
          </div>

          <div className="pt-4 flex gap-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg border border-border text-foreground hover:bg-accent transition-colors w-1/2"
            >
              Cancel
            </button>
            <button
              type="button"
              className="px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors w-1/2"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const UserProfile: React.FC = () => {
  const [pageUser, setPageUser] = useState<User | null>(null);
  const [posts, setPosts] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<"all" | "public" | "private">(
    "all"
  );
  const [followingInProgress, setFollowingInProgress] = useState(false);
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [showMoreOptions, setShowMoreOptions] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const dispatch = useDispatch<AppDispatch>();
  const { id } = useParams<{ id: string }>();
  const { user } = useSelector((state: RootState) => state.user);

  const currentUserId = user?._id;
  const userId = id;
  const isOwnProfile = userId === currentUserId;
  const follow = user?.usersFollowed?.includes(id) || false;
  const [isFollowing, setIsFollowing] = useState(follow);

  useEffect(() => {
    setIsFollowing(follow);

    const fetchUserById = async () => {
      try {
        setLoading(true);
        setError(null);
        const config = { withCredentials: true };
        const { data } = await axios.get(
          `${
            import.meta.env.VITE_API_BACKEND_URL
          }/api/v1/user/fetchUserById/${id}`,
          config
        );
        setPageUser(data.user);
      } catch (err) {
        setError("Failed to load user profile. Please try again.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (isOwnProfile && user) {
      setPageUser(user);
      setLoading(false);
    } else if (id) {
      fetchUserById();
    }
  }, [id, isOwnProfile, user, follow]);

  const handleLogout = async () => {
    await dispatch(logout());
    window.location.reload();
  };

  const toggleFollow = async (e: React.MouseEvent) => {
    e.preventDefault();
    setFollowingInProgress(true);

    try {
      const { data } = await axios.get(
        `${import.meta.env.VITE_API_BACKEND_URL}/api/v1/user/follow/${id}`,
        { withCredentials: true }
      );

      if (data.success) {
        setIsFollowing((prev: any) => !prev);
        toaster.create({
          title: `${data.message}`,
          type: "info",
        });
      }
    } catch (error: any) {
      setIsFollowing(follow);
      toaster.create({
        title:
          error.response?.data?.message || "Failed to update follow status",
        type: "error",
      });
    } finally {
      setFollowingInProgress(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen text-foreground">
        Loading...
      </div>
    );
  }

  if (error || !pageUser) {
    return (
      <div className="flex justify-center items-center h-screen text-foreground">
        {error || "User not found"}
      </div>
    );
  }

  const displayUser = pageUser;
  const followersCount = displayUser.usersFollowed?.length || 0;
  const followingCount = displayUser.usersFollowed?.length || 0;
  const followsYou = displayUser.usersFollowed?.includes(currentUserId || "");

  return (
    <div className="min-h-screen bg-background text-foreground">
      {showEditProfile && (
        <EditProfileMenu
          onClose={() => setShowEditProfile(false)}
          user={displayUser}
        />
      )}

      <div className="relative mb-6">
        <div className="h-48 md:h-64 overflow-hidden">
          <img
            src={displayUser.coverPhoto?.url || defaultImage2}
            alt="Cover"
            className="w-full object-cover"
          />
        </div>

        <div className="max-w-4xl mx-auto px-4 -mt-24 relative">
          <div className="bg-card rounded-xl shadow-md">
            <div className="p-6 md:p-8 pt-28 md:pt-32 relative">
              <div className="absolute -top-16 left-1/2 -translate-x-1/2 md:left-8 md:translate-x-0">
                <img
                  src={displayUser.avatar?.url || defaultImage}
                  alt={displayUser.firstName || "Unknown user"}
                  className="w-32 h-32 rounded-full border-4 border-card object-cover"
                />
              </div>

              <div className="absolute top-4 right-4 flex space-x-2 z-10 md:mt-20 md:right-8">
                {isOwnProfile ? (
                  <>
                    <button
                      onClick={() => setShowEditProfile(true)}
                      className="px-4 py-2 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
                    >
                      Edit Profile
                    </button>
                    <button
                      onClick={() => setShowMoreOptions(!showMoreOptions)}
                      className="p-2 rounded-full bg-card hover:bg-accent transition-colors relative"
                    >
                      <MoreHorizontal size={20} />
                      {showMoreOptions && (
                        <div className="absolute right-0 mt-2 w-48 bg-card rounded-lg shadow-lg overflow-hidden border border-border z-10">
                          <button
                            className="w-full text-left px-4 py-3 flex items-center text-foreground hover:bg-accent transition-colors"
                            onClick={() => setShowEditProfile(true)}
                          >
                            <Settings size={18} className="mr-3" />
                            <span>Settings</span>
                          </button>
                          <button
                            className="w-full text-left px-4 py-3 flex items-center text-destructive hover:bg-accent transition-colors"
                            onClick={handleLogout}
                          >
                            <LogOut size={18} className="mr-3" />
                            <span>Log out</span>
                          </button>
                        </div>
                      )}
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      className={`px-4 py-2 rounded-full flex items-center justify-center min-w-28
                        ${
                          isFollowing
                            ? "bg-card border border-border hover:bg-destructive/10 hover:text-destructive hover:border-destructive"
                            : "bg-primary text-primary-foreground hover:bg-primary/90"
                        } transition-colors`}
                      onClick={toggleFollow}
                      disabled={followingInProgress}
                    >
                      {followingInProgress ? (
                        <span className="inline-block w-4 h-4 border-2 border-t-transparent rounded-full animate-spin"></span>
                      ) : isFollowing ? (
                        "Following"
                      ) : (
                        "Follow"
                      )}
                    </button>
                    <button className="px-4 py-2 rounded-full bg-card border border-border hover:bg-accent transition-colors">
                      <MessageSquare size={18} />
                    </button>
                  </>
                )}
              </div>

              <div className="text-center md:text-left mt-12 md:mt-0">
                <div className="flex items-center justify-center md:justify-start">
                  <h1 className="text-2xl font-bold text-foreground">
                    {displayUser.firstName || displayUser.username}
                  </h1>
                  {displayUser.isVerified && (
                    <span className="ml-2 text-primary">
                      <svg
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                      >
                        <path
                          d="M9.00012 16.2L4.80012 12L3.40012 13.4L9.00012 19L21.0001 7L19.6001 5.6L9.00012 16.2Z"
                          fill="currentColor"
                        />
                      </svg>
                    </span>
                  )}
                </div>
                <div className="flex items-center justify-center md:justify-start">
                  <p className="text-muted-foreground">
                    @{displayUser.username}
                  </p>
                  {!isOwnProfile && followsYou && (
                    <span className="ml-2 px-2 py-0.5 text-xs bg-accent text-muted-foreground rounded-full flex items-center">
                      <UserCheck size={12} className="mr-1" />
                      Follows you
                    </span>
                  )}
                </div>
              </div>

              {displayUser.bio && (
                <p className="mt-4 text-foreground text-center md:text-left">
                  {displayUser.bio}
                </p>
              )}

              <div className="mt-4 flex flex-wrap gap-4 justify-center md:justify-start text-sm">
                {displayUser.location?.coordinates &&
                  displayUser.location.coordinates.length > 0 && (
                    <div className="flex items-center text-muted-foreground">
                      <MapPin size={16} className="mr-1" />
                      <span>{`Lat: ${displayUser.location.coordinates[1]}, Lon: ${displayUser.location.coordinates[0]}`}</span>
                    </div>
                  )}
                {displayUser.website && (
                  <div className="flex items-center text-primary">
                    <Link size={16} className="mr-1" />
                    <a
                      href={`https://${displayUser.website}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {displayUser.website}
                    </a>
                  </div>
                )}
                {displayUser.createdAt && (
                  <div className="flex items-center text-muted-foreground">
                    <Calendar size={16} className="mr-1" />
                    <span>
                      Joined{" "}
                      {new Date(displayUser.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                )}
              </div>

              <div className="mt-6 flex justify-center md:justify-start space-x-6">
                <div className="text-center">
                  <span className="block font-bold text-foreground">
                    {followingCount.toLocaleString()}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    Following
                  </span>
                </div>
                <div className="text-center">
                  <span className="block font-bold text-foreground">
                    {followersCount.toLocaleString()}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    Followers
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 pb-12">
        <div className="mb-6 border-b border-border">
          <div className="flex justify-center items-center">
            <button
              className={`px-6 py-3 font-medium relative ${
                activeTab === "all"
                  ? "text-foreground"
                  : "text-muted-foreground"
              }`}
              onClick={() => setActiveTab("all")}
            >
              All Posts
              {activeTab === "all" && (
                <span className="absolute bottom-0 left-0 w-full h-0.5 bg-primary"></span>
              )}
            </button>
            <button
              className={`px-6 py-3 font-medium relative ${
                activeTab === "public"
                  ? "text-foreground"
                  : "text-muted-foreground"
              }`}
              onClick={() => setActiveTab("public")}
            >
              Public
              {activeTab === "public" && (
                <span className="absolute bottom-0 left-0 w-full h-0.5 bg-primary"></span>
              )}
            </button>
            {isOwnProfile && (
              <button
                className={`px-6 py-3 font-medium relative ${
                  activeTab === "private"
                    ? "text-foreground"
                    : "text-muted-foreground"
                }`}
                onClick={() => setActiveTab("private")}
              >
                Private
                {activeTab === "private" && (
                  <span className="absolute bottom-0 left-0 w-full h-0.5 bg-primary"></span>
                )}
              </button>
            )}
          </div>
        </div>

        <div className="bg-card rounded-xl p-8 text-center shadow-sm border border-border">
          <p className="text-lg font-medium text-foreground">
            No posts to display
          </p>
          <p className="mt-2 text-muted-foreground">
            {activeTab === "private"
              ? "You haven't created any private posts yet."
              : activeTab === "public"
              ? "No public posts to display."
              : !isOwnProfile
              ? "This user hasn't shared any posts yet."
              : "You haven't created any posts yet."}
          </p>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
