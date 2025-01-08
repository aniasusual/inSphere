import React, { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@components/ui/shadcn/card";
import { Label } from "@components/ui/shadcn/label";
import { Input } from "@components/ui/shadcn/input";
import { Textarea } from "@components/ui/shadcn/textarea";
import { Button } from "@components/ui/shadcn/button";
import { Alert, AlertDescription } from "@components/ui/shadcn/alert";
import {
    MessageSquare,
    Upload,
    X,
    ChevronLeft,
    ChevronRight,
    Search,
    ChevronDown,
    Hash
} from 'lucide-react';

interface Channel {
    id: string;
    name: string;
}

interface PostFormData {
    title: string;
    content: string;
    channelId: string;
    images: File[];
    hashtags: string[];
}

const sampleChannels: Channel[] = [
    { id: '1', name: 'Local Events' },
    { id: '2', name: 'Community Discussions' },
    { id: '3', name: 'Buy & Sell' },
    { id: '4', name: 'Housing' },
    { id: '5', name: 'Tech Talk' },
    { id: '6', name: 'Food & Dining' },
    { id: '7', name: 'Sports & Fitness' },
    { id: '8', name: 'Arts & Culture' },
];

const PostCreationForm = () => {
    const [formData, setFormData] = useState<PostFormData>({
        title: '',
        content: '',
        channelId: 'general',
        images: [],
        hashtags: [],
    });

    const [showSuccess, setShowSuccess] = useState(false);
    const [imagePreviewUrls, setImagePreviewUrls] = useState<string[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [isSelectOpen, setIsSelectOpen] = useState(false);
    const [hashtagInput, setHashtagInput] = useState('');
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const selectRef = useRef<HTMLDivElement>(null);

    React.useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (selectRef.current && !selectRef.current.contains(event.target as Node)) {
                setIsSelectOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        if (files.length + formData.images.length > 10) {
            alert('Maximum 10 images allowed');
            return;
        }

        setFormData(prev => ({
            ...prev,
            images: [...prev.images, ...files]
        }));

        const newPreviewUrls = files.map(file => URL.createObjectURL(file));
        setImagePreviewUrls(prev => [...prev, ...newPreviewUrls]);
    };

    const removeImage = (index: number) => {
        setFormData(prev => ({
            ...prev,
            images: prev.images.filter((_, i) => i !== index)
        }));
        setImagePreviewUrls(prev => prev.filter((_, i) => i !== index));
    };

    const handleAddHashtag = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' && hashtagInput.trim()) {
            e.preventDefault();
            const newTag = hashtagInput.trim().startsWith('#')
                ? hashtagInput.trim()
                : `#${hashtagInput.trim()}`;

            if (!formData.hashtags.includes(newTag)) {
                setFormData({
                    ...formData,
                    hashtags: [...formData.hashtags, newTag],
                });
            }
            setHashtagInput('');
        }
    };

    const removeHashtag = (tagToRemove: string) => {
        setFormData({
            ...formData,
            hashtags: formData.hashtags.filter(tag => tag !== tagToRemove),
        });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 3000);
    };

    const scroll = (direction: 'left' | 'right') => {
        if (scrollContainerRef.current) {
            const scrollAmount = 300;
            const scrollPosition = direction === 'left'
                ? scrollContainerRef.current.scrollLeft - scrollAmount
                : scrollContainerRef.current.scrollLeft + scrollAmount;

            scrollContainerRef.current.scrollTo({
                left: scrollPosition,
                behavior: 'smooth'
            });
        }
    };

    const filteredChannels = sampleChannels.filter(channel =>
        channel.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const selectedChannel = sampleChannels.find(channel => channel.id === formData.channelId);

    return (
        <div className="w-full max-w-2xl mx-auto p-2 sm:p-4 space-y-4 sm:space-y-6 z-20">
            {showSuccess && (
                <Alert className="bg-green-500/10 border-green-500 text-green-500 animate-in slide-in-from-top duration-300">
                    <AlertDescription>
                        Post created successfully! It will appear in the selected channel.
                    </AlertDescription>
                </Alert>
            )}

            <Card className="transition-all duration-300 hover:shadow-lg backdrop-blur-sm h-[calc(100vh-8rem)] overflow-y-auto">
                <CardHeader className="space-y-1 p-4 sm:p-6">
                    <CardTitle className="text-xl sm:text-2xl font-bold flex items-center gap-2">
                        <MessageSquare className="h-5 w-5 sm:h-6 sm:w-6" />
                        Create a New Post
                    </CardTitle>
                </CardHeader>

                <CardContent className="p-4 sm:p-6">
                    <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
                        {/* Custom Channel Select */}
                        <div className="space-y-2" ref={selectRef}>
                            <Label htmlFor="channel">Select Channel</Label>
                            <div className="relative">
                                <button
                                    type="button"
                                    className="w-full p-2 text-left border-1 border-gray-200 rounded-md flex items-center justify-between hover:border-blue-500 transition-colors"
                                    onClick={() => setIsSelectOpen(!isSelectOpen)}
                                >
                                    <span className="truncate">{selectedChannel?.name || 'General Post'}</span>
                                    <ChevronDown className={`h-4 w-4 flex-shrink-0 transition-transform duration-200 ${isSelectOpen ? 'rotate-180' : ''}`} />
                                </button>

                                {isSelectOpen && (
                                    <div className="absolute z-50 w-full mt-1 bg-white dark:bg-gray-800 border rounded-md shadow-lg animate-in slide-in-from-top-2 duration-200">
                                        <div className="p-2 border-b">
                                            <div className="relative">
                                                <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                                <Input
                                                    type="text"
                                                    placeholder="Search channels..."
                                                    value={searchTerm}
                                                    onChange={(e) => setSearchTerm(e.target.value)}
                                                    className="pl-8"
                                                />
                                            </div>
                                        </div>
                                        <div className="max-h-48 overflow-y-auto">
                                            <div
                                                key="general"
                                                className={`p-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors
                                                              ${formData.channelId === "general" ? 'bg-blue-50 dark:bg-blue-900/50' : ''}`}
                                                onClick={() => {
                                                    setFormData({ ...formData, channelId: "general" });
                                                    setIsSelectOpen(false);
                                                    setSearchTerm('');
                                                }}
                                            >
                                                General Post
                                            </div>
                                            <hr className="border-t border-gray-200 dark:border-gray-700 my-1" />
                                            {filteredChannels.map(channel => (
                                                <div
                                                    key={channel.id}
                                                    className={`p-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors
                                                              ${formData.channelId === channel.id ? 'bg-blue-50 dark:bg-blue-900/50' : ''}`}
                                                    onClick={() => {
                                                        setFormData({ ...formData, channelId: channel.id });
                                                        setIsSelectOpen(false);
                                                        setSearchTerm('');
                                                    }}
                                                >
                                                    {channel.name}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="title">Post Title</Label>
                            <Input
                                id="title"
                                placeholder="Give your post a title..."
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                className="transition-all duration-200 focus:scale-[1.01]"
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="content">Content</Label>
                            <Textarea
                                id="content"
                                placeholder="What's on your mind?"
                                value={formData.content}
                                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                                className="min-h-[120px] sm:min-h-[150px] transition-all duration-200 focus:scale-[1.01]"
                                required
                            />
                        </div>

                        {/* Hashtags Section */}
                        <div className="space-y-2">
                            <Label htmlFor="hashtags">Hashtags</Label>
                            <div className="relative">
                                <Hash className="absolute left-2 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                                <Input
                                    id="hashtags"
                                    placeholder="Add hashtags and press Enter..."
                                    value={hashtagInput}
                                    onChange={(e) => setHashtagInput(e.target.value)}
                                    onKeyDown={handleAddHashtag}
                                    className="pl-9 transition-all duration-200 focus:scale-[1.01]"
                                />
                            </div>
                            {formData.hashtags.length > 0 && (
                                <div className="flex flex-wrap gap-2 mt-2">
                                    {formData.hashtags.map((tag) => (
                                        <span
                                            key={tag}
                                            className="inline-flex items-center gap-1 px-3 py-1 bg-primary/10 text-primary rounded-full text-sm group hover:bg-primary/20 transition-colors"
                                        >
                                            {tag}
                                            <button
                                                type="button"
                                                onClick={() => removeHashtag(tag)}
                                                className="opacity-0 group-hover:opacity-100 transition-opacity"
                                            >
                                                <X className="h-4 w-4" />
                                            </button>
                                        </span>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="space-y-4">
                            <Label>Add Images (up to 10)</Label>
                            <div className="relative">
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="icon"
                                    className="absolute left-0 top-1/2 -translate-y-1/2 z-10 sm:flex hidden"
                                    onClick={() => scroll('left')}
                                >
                                    <ChevronLeft className="h-4 w-4" />
                                </Button>
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="icon"
                                    className="absolute right-0 top-1/2 -translate-y-1/2 z-10 sm:flex hidden"
                                    onClick={() => scroll('right')}
                                >
                                    <ChevronRight className="h-4 w-4" />
                                </Button>
                                <div
                                    ref={scrollContainerRef}
                                    className="flex overflow-x-auto space-x-4 px-0 sm:px-4 py-4 scrollbar-hide scroll-smooth"
                                    style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                                >
                                    {imagePreviewUrls.map((url, index) => (
                                        <div key={index} className="relative flex-none group">
                                            <img
                                                src={url}
                                                alt={`Preview ${index + 1}`}
                                                className="w-24 h-24 sm:w-32 sm:h-32 object-cover rounded-lg"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => removeImage(index)}
                                                className="absolute top-2 right-2 p-1 bg-red-500 rounded-full 
                                                         text-white opacity-0 group-hover:opacity-100 
                                                         transition-opacity duration-200"
                                            >
                                                <X className="h-4 w-4" />
                                            </button>
                                        </div>
                                    ))}

                                    {formData.images.length < 10 && (
                                        <label className="flex-none border-2 border-dashed border-gray-300 rounded-lg 
                                                       w-24 h-24 sm:w-32 sm:h-32 flex flex-col items-center justify-center gap-2 
                                                       cursor-pointer hover:border-blue-500 transition-colors">
                                            <Upload className="h-6 w-6 sm:h-8 sm:w-8 text-gray-400" />
                                            <span className="text-xs sm:text-sm text-gray-500">Upload</span>
                                            <input
                                                type="file"
                                                accept="image/*"
                                                onChange={handleImageUpload}
                                                className="hidden"
                                                multiple
                                            />
                                        </label>
                                    )}
                                </div>
                            </div>
                        </div>

                        <Button
                            type="submit"
                            className="w-full transition-all duration-300 hover:scale-[1.02]"
                        >
                            Create Post
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
};

export default PostCreationForm;