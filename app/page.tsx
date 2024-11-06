"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  AlertCircle,
  CheckCircle2,
  Clock,
  Plus,
  Search,
  Tag,
  Trash2,
  User,
  BarChart2,
  Calendar,
  Filter,
  Settings,
  ChevronDown,
  ArrowUpRight,
  ArrowDownRight,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Progress } from "@/components/ui/progress";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
} from "recharts";
import { PriorityQueue } from "@/utils/priority-queue";

type Task = {
  id: number;
  title: string;
  description: string;
  priority: 1 | 2 | 3;
  status: "pending" | "in-progress" | "completed";
  duration: number;
  createdAt: Date;
  assignee: string;
  tags: string[];
  progress: number;
};

type Statistics = {
  total: number;
  completed: number;
  highPriority: number;
  inProgress: number;
};

export default function TaskManagementSystem() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTask, setNewTask] = useState("");
  const [newTaskDescription, setNewTaskDescription] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState("all");
  const [sortBy, setSortBy] = useState("priority");
  const [taskQueue] = useState(new PriorityQueue());
  const [statistics, setStatistics] = useState<Statistics>({
    total: 0,
    completed: 0,
    highPriority: 0,
    inProgress: 0,
  });
  const [isAddTaskDialogOpen, setIsAddTaskDialogOpen] = useState(false);
  const [newTaskPriority, setNewTaskPriority] = useState<1 | 2 | 3>(2);
  const [newTaskAssignee, setNewTaskAssignee] = useState("");
  const [newTaskTags, setNewTaskTags] = useState<string[]>([]);

  useEffect(() => {
    const interval = setInterval(() => {
      setTasks((prevTasks) =>
        prevTasks.map((task) => ({
          ...task,
          duration:
            task.status === "in-progress" ? task.duration + 1 : task.duration,
          progress:
            task.status === "in-progress"
              ? Math.min(task.progress + 0.1, 100)
              : task.progress,
        }))
      );
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    setStatistics({
      total: tasks.length,
      completed: tasks.filter((task) => task.status === "completed").length,
      highPriority: tasks.filter((task) => task.priority === 1).length,
      inProgress: tasks.filter((task) => task.status === "in-progress").length,
    });
  }, [tasks]);

  const addTask = useCallback(() => {
    if (!newTask.trim()) return;

    const task: Task = {
      id: Date.now(),
      title: newTask,
      description: newTaskDescription,
      priority: newTaskPriority,
      status: "pending",
      duration: 0,
      createdAt: new Date(),
      assignee: newTaskAssignee || "Unassigned",
      tags: newTaskTags,
      progress: 0,
    };

    taskQueue.insert(task);
    setTasks((prev) => [...prev, task]);
    setNewTask("");
    setNewTaskDescription("");
    setNewTaskPriority(2);
    setNewTaskAssignee("");
    setNewTaskTags([]);
    setIsAddTaskDialogOpen(false);
  }, [
    newTask,
    newTaskDescription,
    newTaskPriority,
    newTaskAssignee,
    newTaskTags,
    taskQueue,
  ]);

  const deleteTask = useCallback((taskId: number) => {
    setTasks((prev) => prev.filter((task) => task.id !== taskId));
  }, []);

  const updateTaskStatus = useCallback(
    (taskId: number, newStatus: Task["status"]) => {
      setTasks((prev) =>
        prev.map((task) =>
          task.id === taskId
            ? {
                ...task,
                status: newStatus,
                progress: newStatus === "completed" ? 100 : task.progress,
              }
            : task
        )
      );
    },
    []
  );

  const sortTasks = useCallback(
    (tasksToSort: Task[]) => {
      return [...tasksToSort].sort((a, b) => {
        switch (sortBy) {
          case "priority":
            return a.priority - b.priority;
          case "duration":
            return b.duration - a.duration;
          case "created":
            return (
              new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
            );
          default:
            return 0;
        }
      });
    },
    [sortBy]
  );

  const filteredTasks = useMemo(() => {
    let filtered = tasks;

    if (searchTerm) {
      filtered = filtered.filter(
        (task) =>
          task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          task.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
          task.tags.some((tag) =>
            tag.toLowerCase().includes(searchTerm.toLowerCase())
          )
      );
    }

    if (filter !== "all") {
      filtered = filtered.filter((task) => task.status === filter);
    }

    return sortTasks(filtered);
  }, [tasks, searchTerm, filter, sortTasks]);

  const chartData = useMemo(() => {
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - i);
      return d.toISOString().split("T")[0];
    }).reverse();

    return last7Days.map((date) => ({
      date,
      completed: tasks.filter(
        (t) =>
          t.status === "completed" &&
          new Date(t.createdAt).toISOString().split("T")[0] === date
      ).length,
      created: tasks.filter(
        (t) => new Date(t.createdAt).toISOString().split("T")[0] === date
      ).length,
    }));
  }, [tasks]);

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        <Card className="mb-6">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-3xl font-bold">
              Task Management System
            </CardTitle>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Settings className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                <DropdownMenuItem>Export Tasks</DropdownMenuItem>
                <DropdownMenuItem>Import Tasks</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>Settings</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <Card>
                <CardContent className="flex flex-col items-center justify-center p-6">
                  <BarChart2 className="w-8 h-8 text-blue-500 mb-2" />
                  <div className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    Total Tasks
                  </div>
                  <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                    {statistics.total}
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="flex flex-col items-center justify-center p-6">
                  <CheckCircle2 className="w-8 h-8 text-green-500 mb-2" />
                  <div className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    Completed
                  </div>
                  <div className="text-3xl font-bold text-green-600 dark:text-green-400">
                    {statistics.completed}
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="flex flex-col items-center justify-center p-6">
                  <AlertCircle className="w-8 h-8 text-red-500 mb-2" />
                  <div className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    High Priority
                  </div>
                  <div className="text-3xl font-bold text-red-600 dark:text-red-400">
                    {statistics.highPriority}
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="flex flex-col items-center justify-center p-6">
                  <Clock className="w-8 h-8 text-purple-500 mb-2" />
                  <div className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    In Progress
                  </div>
                  <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">
                    {statistics.inProgress}
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="flex flex-col md:flex-row gap-4 items-center mb-6">
              <div className="flex-1 w-full md:w-auto relative">
                <Search
                  className="absolute left-3 top-2.5  text-gray-400"
                  size={20}
                />
                <Input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search tasks..."
                  className="pl-10"
                />
              </div>
              <Select value={filter} onValueChange={setFilter}>
                <SelectTrigger className="w-full md:w-[180px]">
                  <SelectValue placeholder="Filter tasks" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Tasks</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="in-progress">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-full md:w-[180px]">
                  <SelectValue placeholder="Sort tasks" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="priority">Sort by Priority</SelectItem>
                  <SelectItem value="duration">Sort by Duration</SelectItem>
                  <SelectItem value="created">Sort by Created Date</SelectItem>
                </SelectContent>
              </Select>
              <Dialog
                open={isAddTaskDialogOpen}
                onOpenChange={setIsAddTaskDialogOpen}
              >
                <DialogTrigger asChild>
                  <Button className="w-full md:w-auto">
                    <Plus className="mr-2" size={20} />
                    Add Task
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle>Add New Task</DialogTitle>
                    <DialogDescription>
                      Create a new task with title, description, priority, and
                      assignee.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="task-title" className="text-right">
                        Title
                      </Label>
                      <Input
                        id="task-title"
                        value={newTask}
                        onChange={(e) => setNewTask(e.target.value)}
                        className="col-span-3"
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="task-description" className="text-right">
                        Description
                      </Label>
                      <Input
                        id="task-description"
                        value={newTaskDescription}
                        onChange={(e) => setNewTaskDescription(e.target.value)}
                        className="col-span-3"
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="task-priority" className="text-right">
                        Priority
                      </Label>
                      <Select
                        value={newTaskPriority.toString()}
                        onValueChange={(value) =>
                          setNewTaskPriority(parseInt(value) as 1 | 2 | 3)
                        }
                      >
                        <SelectTrigger className="w-[180px] col-span-3">
                          <SelectValue placeholder="Select priority" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1">High</SelectItem>
                          <SelectItem value="2">Medium</SelectItem>
                          <SelectItem value="3">Low</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="task-assignee" className="text-right">
                        Assignee
                      </Label>
                      <Input
                        id="task-assignee"
                        value={newTaskAssignee}
                        onChange={(e) => setNewTaskAssignee(e.target.value)}
                        className="col-span-3"
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="task-tags" className="text-right">
                        Tags
                      </Label>
                      <Input
                        id="task-tags"
                        value={newTaskTags.join(", ")}
                        onChange={(e) =>
                          setNewTaskTags(
                            e.target.value.split(",").map((tag) => tag.trim())
                          )
                        }
                        className="col-span-3"
                        placeholder="Enter tags separated by commas"
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button type="submit" onClick={addTask}>
                      Add Task
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>

            <div className="mb-6">
              <Card>
                <CardHeader>
                  <CardTitle>Task Completion Trend</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <RechartsTooltip />
                      <Line
                        type="monotone"
                        dataKey="completed"
                        stroke="#8884d8"
                        name="Completed Tasks"
                      />
                      <Line
                        type="monotone"
                        dataKey="created"
                        stroke="#82ca9d"
                        name="Created Tasks"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="all" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="all">All Tasks</TabsTrigger>
            <TabsTrigger value="in-progress">In Progress</TabsTrigger>
            <TabsTrigger value="completed">Completed</TabsTrigger>
          </TabsList>
          <TabsContent value="all">
            <ScrollArea className="h-[600px] rounded-md border p-4">
              <div className="space-y-4">
                {filteredTasks.map((task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    onDelete={deleteTask}
                    onStatusChange={updateTaskStatus}
                  />
                ))}
              </div>
            </ScrollArea>
          </TabsContent>
          <TabsContent value="in-progress">
            <ScrollArea className="h-[600px] rounded-md border p-4">
              <div className="space-y-4">
                {filteredTasks
                  .filter((task) => task.status === "in-progress")
                  .map((task) => (
                    <TaskCard
                      key={task.id}
                      task={task}
                      onDelete={deleteTask}
                      onStatusChange={updateTaskStatus}
                    />
                  ))}
              </div>
            </ScrollArea>
          </TabsContent>
          <TabsContent value="completed">
            <ScrollArea className="h-[600px] rounded-md border p-4">
              <div className="space-y-4">
                {filteredTasks
                  .filter((task) => task.status === "completed")
                  .map((task) => (
                    <TaskCard
                      key={task.id}
                      task={task}
                      onDelete={deleteTask}
                      onStatusChange={updateTaskStatus}
                    />
                  ))}
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

function TaskCard({
  task,
  onDelete,
  onStatusChange,
}: {
  task: Task;
  onDelete: (id: number) => void;
  onStatusChange: (id: number, status: Task["status"]) => void;
}) {
  const getPriorityColor = (priority: Task["priority"]) => {
    switch (priority) {
      case 1:
        return "bg-red-500";
      case 2:
        return "bg-yellow-500";
      case 3:
        return "bg-green-500";
      default:
        return "bg-gray-500";
    }
  };

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-4">
            <div
              className={`w-3 h-3 rounded-full ${getPriorityColor(
                task.priority
              )}`}
            />
            <span className="font-medium">{task.title}</span>
          </div>
          <div className="flex items-center space-x-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex items-center text-gray-600 dark:text-gray-400">
                    <Clock size={16} className="mr-1" />
                    {formatDuration(task.duration)}
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Time spent on task</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <Select
              value={task.status}
              onValueChange={(value) =>
                onStatusChange(task.id, value as Task["status"])
              }
            >
              <SelectTrigger className="w-[130px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="in-progress">In Progress</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
              </SelectContent>
            </Select>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onDelete(task.id)}
              className="text-red-500 hover:text-red-600 dark:text-red-400 dark:hover:text-red-300"
            >
              <Trash2 size={18} />
              <span className="sr-only">Delete task</span>
            </Button>
          </div>
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
          {task.description}
        </p>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-2">
            <Avatar className="w-6 h-6">
              <AvatarImage
                src={`https://api.dicebear.com/6.x/initials/svg?seed=${task.assignee}`}
                alt={task.assignee}
              />
              <AvatarFallback>
                {task.assignee
                  .split(" ")
                  .map((n) => n[0])
                  .join("")}
              </AvatarFallback>
            </Avatar>
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {task.assignee}
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <Calendar size={14} className="text-gray-400" />
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {new Date(task.createdAt).toLocaleDateString()}
            </span>
          </div>
        </div>
        <div className="flex items-center space-x-2 mb-2">
          {task.tags.map((tag) => (
            <Badge key={tag} variant="secondary" className="text-xs">
              {tag}
            </Badge>
          ))}
        </div>
        <div className="flex items-center space-x-2">
          <Progress value={task.progress} className="flex-grow" />
          <span className="text-sm font-medium">
            {Math.round(task.progress)}%
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
