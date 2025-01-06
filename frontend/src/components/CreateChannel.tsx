import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@components/ui/shadcn/card";
import { Label } from "@components/ui/shadcn/label";
import { Input } from "@components/ui/shadcn/input";
import { Textarea } from "@components/ui/shadcn/textarea";
import { Button } from "@components/ui/shadcn/button";
import { Switch } from "@components/ui/shadcn/switch";
import { Slider } from "@components/ui/shadcn/slider";
import { Globe, MapPin, Users, X, Hash } from 'lucide-react';
import { Alert, AlertDescription } from "@components/ui/shadcn/alert";
import axios from 'axios';
import { toaster } from './ui/toaster';

interface ChannelFormData {
    name: string;
    description: string;
    isGlobal: boolean;
    radius: number;
    hashtags: string[];
}

const ChannelCreationForm = () => {
    const [formData, setFormData] = useState<ChannelFormData>({
        name: '',
        description: '',
        isGlobal: false,
        radius: 1,
        hashtags: [],
    });

    const [hashtagInput, setHashtagInput] = useState('');
    const [showSuccess, setShowSuccess] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {

            const config = {
                headers: { "Content-Type": "application/json" },
                withCredentials: true,
            };

            const { data } = await axios.post(
                `${import.meta.env.VITE_API_BACKEND_URL}/api/v1/channel/create-channel`,
                formData,
                config
            );

            if (data) {
                toaster.create({
                    title: `Channel: ${data.channel.name} created sucessfully`,
                    description: "Redirecting you to the channel...",
                    type: "success",
                })
                setFormData({
                    name: '',
                    description: '',
                    isGlobal: false,
                    radius: 1,
                    hashtags: [],
                });
            }

            console.log('Channel created:', data);

        } catch (error: any) {
            toaster.create({
                title: `Channel not created 🥲, ${error.response.data.message}`,
                description: "PLease login and try again",
                type: "error",
            })
        }

        setShowSuccess(true);
        // Hide after 3 seconds
        setTimeout(() => setShowSuccess(false), 3000);
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

    return (
        <div className="w-full mx-auto p-4 space-y-6 overflow-x-auto h-[700px]">
            {showSuccess && (
                <Alert className="bg-green-500/10 border-green-500 text-green-500 animate-in slide-in-from-top duration-300">
                    <AlertDescription>
                        Channel created successfully! Users in your area will be able to discover it soon.
                    </AlertDescription>
                </Alert>
            )}

            <Card className="overflow-hidden transition-all duration-300 hover:shadow-lg">
                <CardHeader className="space-y-1">
                    <CardTitle className="text-2xl font-bold flex items-center gap-2">
                        <Users className="h-6 w-6" />
                        Create a New Channel
                    </CardTitle>
                </CardHeader>

                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Channel Name */}
                        <div className="space-y-2">
                            <Label htmlFor="name">Channel Name</Label>
                            <Input
                                id="name"
                                placeholder="Enter channel name..."
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                className="transition-all duration-200 focus:scale-[1.01]"
                                required
                            />
                        </div>

                        {/* Channel Description */}
                        <div className="space-y-2">
                            <Label htmlFor="description">Description</Label>
                            <Textarea
                                id="description"
                                placeholder="What's this channel about?"
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                className="min-h-[100px] transition-all duration-200 focus:scale-[1.01]"
                                required
                            />
                        </div>

                        {/* Hashtags Section */}
                        <div className="space-y-2">
                            <Label htmlFor="hashtags">Hashtags</Label>
                            <div className="relative">
                                <Hash className="absolute left-2 top-2.5 h-5 w-5 text-muted-foreground" />
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
                                            className="inline-flex items-center gap-1 px-3 py-1 bg-primary/10 text-primary rounded-full text-sm"
                                        >
                                            {tag}
                                            <button
                                                type="button"
                                                onClick={() => removeHashtag(tag)}
                                                className="hover:text-primary/80 transition-colors"
                                            >
                                                <X className="h-4 w-4" />
                                            </button>
                                        </span>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Global Toggle */}
                        <div className="flex items-center justify-between p-4 bg-secondary/50 rounded-lg">
                            <div className="flex items-center gap-2">
                                <Globe className="h-5 w-5" />
                                <div>
                                    <Label>Global Channel</Label>
                                    <p className="text-sm text-muted-foreground">Make this channel visible worldwide</p>
                                </div>
                            </div>
                            <Switch
                                checked={formData.isGlobal}
                                onCheckedChange={(checked) => setFormData({ ...formData, isGlobal: checked })}
                                className="transition-all duration-300"
                            />
                        </div>

                        {/* Radius Slider - Only shown if not global */}
                        {!formData.isGlobal && (
                            <div className="space-y-4 animate-in slide-in-from-top duration-300">
                                <div className="flex items-center gap-2">
                                    <MapPin className="h-5 w-5" />
                                    <Label>Visibility Radius: {formData.radius} km</Label>
                                </div>
                                <Slider
                                    value={[formData.radius]}
                                    onValueChange={([value]) => setFormData({ ...formData, radius: value })}
                                    max={4}
                                    min={0}
                                    step={0.1}
                                    defaultValue={[1]}
                                    className="transition-all duration-200"
                                />
                                <p className="text-sm text-muted-foreground">
                                    Users within {formData.radius}km will see this channel as "live"
                                </p>
                            </div>
                        )}

                        {/* Submit Button */}
                        <Button
                            type="submit"
                            className="w-full transition-all duration-300 hover:scale-[1.02]"
                        >
                            Create Channel
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
};

export default ChannelCreationForm;