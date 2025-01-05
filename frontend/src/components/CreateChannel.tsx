import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@components/ui/shadcn/card";
import { Label } from "@components/ui/shadcn/label";
import { Input } from "@components/ui/shadcn/input";
import { Textarea } from "@components/ui/shadcn/textarea";
import { Button } from "@components/ui/shadcn/button";
import { Switch } from "@components/ui/shadcn/switch";
import { Slider } from "@components/ui/slider";
import { Globe, MapPin, Users } from 'lucide-react';
import { Alert, AlertDescription } from "@components/ui/shadcn/alert";

interface ChannelFormData {
    name: string;
    description: string;
    isGlobal: boolean;
    radius: number;
}

const ChannelCreationForm = () => {
    const [formData, setFormData] = useState<ChannelFormData>({
        name: '',
        description: '',
        isGlobal: false,
        radius: 5,
    });

    const [showSuccess, setShowSuccess] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Show success message
        setShowSuccess(true);
        // Hide after 3 seconds
        setTimeout(() => setShowSuccess(false), 3000);
    };

    return (
        <div className="w-full mx-auto p-4 space-y-6 overflow-x-auto h-[700px]" >
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
                                    max={50}
                                    min={1}
                                    step={1}
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
