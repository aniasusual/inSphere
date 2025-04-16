import React, { useState } from "react";
import { Button } from "@components/ui/shadcn/button";
import { Badge } from "@components/ui/shadcn/badge";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@components/ui/shadcn/tabs";
import { Avatar } from "@components/ui/shadcn/avatar";
import { ScrollArea } from "@components/ui/shadcn/scroll-area";
import {
  DrawerBackdrop,
  DrawerBody,
  DrawerCloseTrigger,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerRoot,
  DrawerTitle,
  DrawerTrigger,
} from "@components/ui/drawer";
import {
  Bell,
  UserPlus,
  UserCheck,
  Heart,
  MessageSquare,
  Repeat,
  Bookmark,
  Clock,
  Sparkles,
  X,
} from "lucide-react";

interface Notification {
  id: number;
  type: "like" | "comment" | "follow" | "mention" | "share" | "bookmark";
  user: string;
  avatar: string;
  content: string;
  time: string;
  read: boolean;
}

interface Request {
  id: number;
  user: string;
  avatar: string;
  content: string;
  time: string;
  pending: boolean;
}

export const Drawer: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>("all");

  const notifications = {
    all: [
      {
        id: 1,
        type: "like",
        user: "Alex Morgan",
        avatar: "/api/placeholder/32/32",
        content: "liked your post",
        time: "2m ago",
        read: false,
      },
      {
        id: 2,
        type: "comment",
        user: "Jamie Chen",
        avatar: "/api/placeholder/32/32",
        content: 'commented: "This is amazing!"',
        time: "15m ago",
        read: false,
      },
      {
        id: 3,
        type: "follow",
        user: "Taylor Swift",
        avatar: "/api/placeholder/32/32",
        content: "started following you",
        time: "1h ago",
        read: true,
      },
      {
        id: 4,
        type: "mention",
        user: "Sam Johnson",
        avatar: "/api/placeholder/32/32",
        content: "mentioned you in a comment",
        time: "3h ago",
        read: true,
      },
      {
        id: 5,
        type: "share",
        user: "Riley Parker",
        avatar: "/api/placeholder/32/32",
        content: "shared your post",
        time: "5h ago",
        read: true,
      },
      {
        id: 6,
        type: "like",
        user: "Jordan Lee",
        avatar: "/api/placeholder/32/32",
        content: "liked your comment",
        time: "8h ago",
        read: true,
      },
    ] as Notification[],
    requests: [
      {
        id: 7,
        user: "Casey Williams",
        avatar: "/api/placeholder/32/32",
        content: "wants to follow you",
        time: "1d ago",
        pending: true,
      },
      {
        id: 8,
        user: "Morgan Taylor",
        avatar: "/api/placeholder/32/32",
        content: "wants to follow you",
        time: "2d ago",
        pending: true,
      },
    ] as Request[],
    sent: [
      {
        id: 9,
        user: "Drew Harper",
        avatar: "/api/placeholder/32/32",
        content: "follow request sent",
        time: "3d ago",
        pending: true,
      },
      {
        id: 10,
        user: "Quinn Evans",
        avatar: "/api/placeholder/32/32",
        content: "follow request sent",
        time: "5d ago",
        pending: true,
      },
    ] as Request[],
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "like":
        return <Heart className="text-rose-500 dark:text-rose-400" size={20} />;
      case "comment":
        return (
          <MessageSquare
            className="text-blue-500 dark:text-blue-400"
            size={20}
          />
        );
      case "follow":
        return (
          <UserCheck className="text-green-500 dark:text-green-400" size={20} />
        );
      case "mention":
        return (
          <MessageSquare
            className="text-purple-500 dark:text-purple-400"
            size={20}
          />
        );
      case "share":
        return (
          <Repeat className="text-amber-500 dark:text-amber-400" size={20} />
        );
      case "bookmark":
        return (
          <Bookmark
            className="text-indigo-500 dark:text-indigo-400"
            size={20}
          />
        );
      default:
        return <Bell className="text-gray-500 dark:text-gray-400" size={20} />;
    }
  };

  return (
    <DrawerRoot>
      <DrawerBackdrop className="bg-black/40 dark:bg-black/60 backdrop-blur-md" />
      <DrawerTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative group hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full hover:cursor-pointer"
        >
          <Bell
            className="!w-7 !h-7 transition-all"
            size={44}
            strokeWidth="1.5"
          />
          <Badge className="absolute top-0 right-0 h-5 min-w-[10px] bg-red-600 dark:bg-red-600 text-black dark:bg-white translate-x-2/3 -translate-y-2/3 shadow-md">
            {notifications.all.filter((n) => !n.read).length +
              notifications.requests.length}
          </Badge>
        </Button>
      </DrawerTrigger>
      <DrawerContent className="w-full max-w-sm md:max-w-md bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-xl overflow-hidden rounded-t-xl">
        <DrawerHeader className="border-b border-gray-100 dark:border-gray-800 px-4 py-4 relative bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-gray-950">
          <DrawerTitle className="text-2xl font-extrabold flex items-center gap-3 tracking-tight">
            <Bell className="h-7 w-7 text-gray-700 dark:text-gray-300" />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-gray-700 to-gray-900 dark:from-gray-300 dark:to-gray-100">
              Notifications
            </span>
            <Sparkles className="h-6 w-6 text-yellow-400 dark:text-yellow-500" />
          </DrawerTitle>
          <div className="absolute top-0 right-0 h-full w-32 bg-gradient-to-l from-gray-100/20 to-transparent dark:from-gray-800/20 pointer-events-none" />
        </DrawerHeader>
        <DrawerBody className="p-0">
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full"
          >
            <TabsList className="w-full grid grid-cols-3 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/50 h-12">
              <TabsTrigger
                value="all"
                className="relative h-full text-sm font-semibold data-[state=active]:bg-white dark:data-[state=active]:bg-gray-900 data-[state=active]:shadow-none dark:text-gray-300"
              >
                All
                {activeTab === "all" && (
                  <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-1 bg-gray-900 dark:bg-gray-100 rounded-full" />
                )}
              </TabsTrigger>
              <TabsTrigger
                value="requests"
                className="relative h-full text-sm font-semibold data-[state=active]:bg-white dark:data-[state=active]:bg-gray-900 data-[state=active]:shadow-none dark:text-gray-300"
              >
                Requests
                {notifications.requests.length > 0 && (
                  <Badge className="absolute top-2 right-2 h-5 min-w-[20px] bg-rose-500 dark:bg-rose-600 text-black dark:bg-white shadow-md">
                    {notifications.requests.length}
                  </Badge>
                )}
                {activeTab === "requests" && (
                  <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-1 bg-gray-900 dark:bg-gray-100 rounded-full" />
                )}
              </TabsTrigger>
              <TabsTrigger
                value="sent"
                className="relative h-full text-sm font-semibold data-[state=active]:bg-white dark:data-[state=active]:bg-gray-900 data-[state=active]:shadow-none dark:text-gray-300"
              >
                Sent
                {activeTab === "sent" && (
                  <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-1 bg-gray-900 dark:bg-gray-100 rounded-full" />
                )}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="m-0">
              <ScrollArea className="h-96">
                <div className="p-3 space-y-2">
                  {notifications.all.map((notification) => (
                    <div
                      key={notification.id}
                      className={`flex items-start gap-4 p-4 rounded-2xl transition-all hover:shadow-lg hover:-translate-y-1 ${
                        notification.read
                          ? "bg-white dark:bg-gray-900"
                          : "bg-gray-50 dark:bg-gray-800/50"
                      }`}
                    >
                      <div className="relative group">
                        <Avatar className="h-14 w-14 border-4 border-white dark:border-gray-900 shadow-lg group-hover:scale-105 transition-transform duration-300">
                          <img
                            src={notification.avatar}
                            alt={notification.user}
                            className="object-cover"
                          />
                        </Avatar>
                        <div className="absolute -bottom-2 -right-2 bg-white dark:bg-gray-900 rounded-full p-1.5 shadow-md border border-gray-100 dark:border-gray-800">
                          {getNotificationIcon(notification.type)}
                        </div>
                      </div>
                      <div className="flex-1 space-y-1.5">
                        <p className="text-sm font-semibold leading-tight">
                          <span className="text-gray-900 dark:text-gray-100 font-bold">
                            {notification.user}
                          </span>
                          <span className="text-gray-600 dark:text-gray-400">
                            {" "}
                            {notification.content}
                          </span>
                        </p>
                        <div className="flex items-center gap-2">
                          <Clock className="h-3.5 w-3.5 text-gray-400 dark:text-gray-500" />
                          <p className="text-xs text-gray-500 dark:text-gray-500 font-medium">
                            {notification.time}
                          </p>
                        </div>
                      </div>
                      {!notification.read && (
                        <div className="h-3 w-3 rounded-full bg-rose-500 dark:bg-rose-600 shadow-md mt-2" />
                      )}
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </TabsContent>

            <TabsContent value="requests" className="m-0">
              <ScrollArea className="h-96">
                <div className="p-3 space-y-2">
                  {notifications.requests.map((request) => (
                    <div
                      key={request.id}
                      className="flex items-start gap-4 p-4 rounded-2xl bg-white dark:bg-gray-900 hover:shadow-lg hover:-translate-y-1 transition-all"
                    >
                      <div className="relative group">
                        <Avatar className="h-14 w-14 border-4 border-white dark:border-gray-900 shadow-lg group-hover:scale-105 transition-transform duration-300">
                          <img
                            src={request.avatar}
                            alt={request.user}
                            className="object-cover"
                          />
                        </Avatar>
                        <div className="absolute -bottom-2 -right-2 bg-white dark:bg-gray-900 rounded-full p-1.5 shadow-md border border-gray-100 dark:border-gray-800">
                          <UserPlus
                            className="text-blue-500 dark:text-blue-400"
                            size={20}
                          />
                        </div>
                      </div>
                      <div className="flex-1 space-y-2">
                        <p className="text-sm font-semibold leading-tight">
                          <span className="text-gray-900 dark:text-gray-100 font-bold">
                            {request.user}
                          </span>
                          <span className="text-gray-600 dark:text-gray-400">
                            {" "}
                            {request.content}
                          </span>
                        </p>
                        <div className="flex items-center gap-2">
                          <Clock className="h-3.5 w-3.5 text-gray-400 dark:text-gray-500" />
                          <p className="text-xs text-gray-500 dark:text-gray-500 font-medium">
                            {request.time}
                          </p>
                        </div>
                        <div className="flex gap-3">
                          <Button
                            size="sm"
                            className="h-9 bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600 dark:from-green-600 dark:to-teal-600 dark:hover:from-green-500 dark:hover:to-teal-500 shadow-md rounded-xl"
                          >
                            Accept
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-9 border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 dark:text-gray-300 rounded-xl shadow-sm"
                          >
                            Decline
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </TabsContent>

            <TabsContent value="sent" className="m-0">
              <ScrollArea className="h-96">
                <div className="p-3 space-y-2">
                  {notifications.sent.map((request) => (
                    <div
                      key={request.id}
                      className="flex items-start gap-4 p-4 rounded-2xl bg-white dark:bg-gray-900 hover:shadow-lg hover:-translate-y-1 transition-all"
                    >
                      <div className="relative group">
                        <Avatar className="h-14 w-14 border-4 border-white dark:border-gray-900 shadow-lg group-hover:scale-105 transition-transform duration-300">
                          <img
                            src={request.avatar}
                            alt={request.user}
                            className="object-cover"
                          />
                        </Avatar>
                        <div className="absolute -bottom-2 -right-2 bg-white dark:bg-gray-900 rounded-full p-1.5 shadow-md border border-gray-100 dark:border-gray-800">
                          <Clock
                            className="text-amber-500 dark:text-amber-400"
                            size={20}
                          />
                        </div>
                      </div>
                      <div className="flex-1 space-y-2">
                        <p className="text-sm font-semibold leading-tight">
                          <span className="text-gray-900 dark:text-gray-100 font-bold">
                            {request.user}
                          </span>
                          <span className="text-gray-600 dark:text-gray-400">
                            {" "}
                            {request.content}
                          </span>
                        </p>
                        <div className="flex items-center gap-2">
                          <Clock className="h-3.5 w-3.5 text-gray-400 dark:text-gray-500" />
                          <p className="text-xs text-gray-500 dark:text-gray-500 font-medium">
                            {request.time}
                          </p>
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-9 border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 dark:text-gray-300 rounded-xl shadow-sm"
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </TabsContent>
          </Tabs>
        </DrawerBody>
        <DrawerFooter className="border-t border-gray-100 dark:border-gray-800 px-4 py-4 flex-row justify-between bg-gray-50/50 dark:bg-gray-900/50">
          <Button
            variant="ghost"
            size="sm"
            className="text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-100 rounded-xl shadow-sm transition-all"
          >
            Mark all as read
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-100 rounded-xl shadow-sm transition-all"
          >
            See all notifications
          </Button>
        </DrawerFooter>
        <DrawerCloseTrigger className="absolute top-4 right-4 h-9 w-9 rounded-full bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 shadow-md transition-all hover:scale-110 flex items-center justify-center">
          <X size={18} className="text-gray-600 dark:text-gray-400" />
        </DrawerCloseTrigger>
      </DrawerContent>
    </DrawerRoot>
  );
};

export default Drawer;
