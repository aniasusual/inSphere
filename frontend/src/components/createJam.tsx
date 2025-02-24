import React, { useState } from 'react';
import { Calendar, Users, Plus, Music, X, ChevronDown } from 'lucide-react';
import { Card } from '@components/ui/shadcn/card';
import { motion, AnimatePresence } from 'framer-motion';

interface Channel {
    id: string;
    name: string;
    description: string;
}

interface JamFormData {
    title: string;
    description: string;
    datetime: string;
    maxParticipants: number;
    channelOption: 'existing' | 'new';
    channelId?: string;
    newChannelName?: string;
    newChannelDescription?: string;
}
interface Props {
    onClose: () => void;
}
const CreateJam = ({ onClose }: Props) => {
    // Mock data for channels - in real app would come from API/database
    const sampleChannels: Channel[] = [
        { id: '1', name: 'Music Lovers', description: 'General music discussion' },
        { id: '2', name: 'Jazz Club', description: 'Jazz enthusiasts' },
        { id: '3', name: 'Rock Band', description: 'Rock music fans' }
    ];

    // const [isOpen, setIsOpen] = useState(false);
    const [formData, setFormData] = useState<JamFormData>({
        title: '',
        description: '',
        datetime: '',
        maxParticipants: 10,
        channelOption: 'existing'
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            // Here you would typically make an API call to save the jam
            console.log('Submitting jam:', formData);
            // Mock API call
            await new Promise(resolve => setTimeout(resolve, 1000));
            // Reset form and close modal on success
            setFormData({
                title: '',
                description: '',
                datetime: '',
                maxParticipants: 10,
                channelOption: 'existing'
            });
            // setIsOpen(false);
        } catch (error) {
            console.error('Error creating jam:', error);
        }
    };

    const handleInputChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
    ) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const inputClasses = `
        w-full px-5 py-4 
        bg-gray-50/50 dark:bg-gray-800/50
        border-2 border-gray-100 dark:border-gray-700
        rounded-xl
        text-gray-900 dark:text-gray-100
        placeholder-gray-400 dark:placeholder-gray-500
        focus:ring-0 focus:border-red-300 dark:focus:border-red-700
        transition-all duration-300 ease-out
        hover:border-gray-200 dark:hover:border-gray-600
        text-base
    `;

    const labelClasses = `
        block text-sm font-medium tracking-wide uppercase
        text-gray-600 dark:text-gray-300
        mb-2 transition-colors duration-200
    `;

    // // Only render the modal if isOpen is true
    // if (!isOpen) {
    //     return (
    //         <button
    //             onClick={() => setIsOpen(true)}
    //             className="fixed bottom-6 right-6 bg-red-500 hover:bg-red-600 
    //                      text-white p-4 rounded-full shadow-lg hover:shadow-xl 
    //                      transition-all duration-300 transform hover:scale-105"
    //         >
    //             <Plus className="w-6 h-6" />
    //         </button>
    //     );
    // }

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 flex items-center justify-center p-6 bg-black/30 dark:bg-black/50 backdrop-blur-sm z-50"
        >
            <Card className="w-full max-w-3xl max-h-[calc(100vh-4rem)] overflow-y-auto h-fit">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="relative bg-white dark:bg-gray-900 p-8 rounded-2xl shadow-2xl"
                >
                    {/* Header */}
                    <div className="flex items-center gap-4 mb-10 relative">
                        <div className="absolute -left-4 w-1 h-12 bg-gradient-to-b from-red-400 to-red-600" />
                        <div className="p-3 bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-900/10 rounded-2xl">
                            <Music className="w-7 h-7 text-red-500 dark:text-red-400" />
                        </div>
                        <div>
                            <h2 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">
                                Create a New Jam
                            </h2>
                            <p className="text-gray-500 dark:text-gray-400 mt-1">
                                Set up your jam session and invite others to join
                            </p>
                        </div>
                        <button
                            onClick={onClose}
                            className="ml-auto p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-all duration-200"
                        >
                            <X className="w-6 h-6 text-gray-400 dark:text-gray-500" />
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-8">
                        {/* Title */}
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.1 }}
                        >
                            <label className={labelClasses}>Title</label>
                            <input
                                type="text"
                                name="title"
                                value={formData.title}
                                onChange={handleInputChange}
                                className={inputClasses}
                                placeholder="Give your jam session a catchy name"
                                required
                            />
                        </motion.div>

                        {/* Description */}
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.2 }}
                        >
                            <label className={labelClasses}>Description</label>
                            <textarea
                                name="description"
                                value={formData.description}
                                onChange={handleInputChange}
                                rows={4}
                                className={`${inputClasses} resize-none`}
                                placeholder="What's this jam session about? Share the vibe you're going for..."
                                required
                            />
                        </motion.div>

                        {/* Date/Time and Participants Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.3 }}
                            >
                                <label className={labelClasses}>
                                    <div className="flex items-center gap-2">
                                        <Calendar className="w-4 h-4 text-red-400" />
                                        Schedule
                                    </div>
                                </label>
                                <input
                                    type="datetime-local"
                                    name="datetime"
                                    value={formData.datetime}
                                    onChange={handleInputChange}
                                    className={inputClasses}
                                    required
                                />
                            </motion.div>

                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.4 }}
                            >
                                <label className={labelClasses}>
                                    <div className="flex items-center gap-2">
                                        <Users className="w-4 h-4 text-red-400" />
                                        Capacity
                                    </div>
                                </label>
                                <input
                                    type="number"
                                    name="maxParticipants"
                                    value={formData.maxParticipants}
                                    onChange={handleInputChange}
                                    min="2"
                                    max="100"
                                    className={inputClasses}
                                    required
                                />
                            </motion.div>
                        </div>

                        {/* Channel Selection */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.5 }}
                            className="space-y-4"
                        >
                            <label className={labelClasses}>Channel</label>
                            <div className="grid grid-cols-2 gap-4 mb-6">
                                {['existing', 'new'].map((option) => (
                                    <button
                                        key={option}
                                        type="button"
                                        onClick={() => setFormData(prev => ({ ...prev, channelOption: option as 'existing' | 'new' }))}
                                        className={`
                                            py-4 px-6 rounded-xl border-2
                                            transition-all duration-300 ease-out
                                            transform hover:scale-[1.02]
                                            ${formData.channelOption === option
                                                ? 'bg-gradient-to-br from-red-500 to-red-600 text-white border-transparent shadow-lg'
                                                : 'bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-700 hover:border-red-200 dark:hover:border-red-800'
                                            }
                                        `}
                                    >
                                        {option === 'existing' ? 'Use Existing Channel' : 'Create New Channel'}
                                    </button>
                                ))}
                            </div>

                            <AnimatePresence mode="wait">
                                {formData.channelOption === 'existing' ? (
                                    <motion.div
                                        key="existing"
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        exit={{ opacity: 0, height: 0 }}
                                        className="relative"
                                    >
                                        <select
                                            name="channelId"
                                            onChange={handleInputChange}
                                            className={`${inputClasses} appearance-none`}
                                            required
                                        >
                                            <option value="">Select a channel</option>
                                            {sampleChannels.map(channel => (
                                                <option key={channel.id} value={channel.id}>
                                                    {channel.name}
                                                </option>
                                            ))}
                                        </select>
                                        <ChevronDown className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" />
                                    </motion.div>
                                ) : (
                                    <motion.div
                                        key="new"
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        exit={{ opacity: 0, height: 0 }}
                                        className="space-y-4"
                                    >
                                        <input
                                            type="text"
                                            name="newChannelName"
                                            placeholder="Give your channel a name"
                                            onChange={handleInputChange}
                                            className={inputClasses}
                                            required
                                        />
                                        <textarea
                                            name="newChannelDescription"
                                            placeholder="Describe what your channel is about"
                                            onChange={handleInputChange}
                                            className={`${inputClasses} resize-none`}
                                            required
                                        />
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </motion.div>

                        {/* Submit Button */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.6 }}
                            className="flex gap-4 pt-6"
                        >
                            <button
                                type="submit"
                                className="flex-1 bg-gradient-to-r from-red-500 to-red-600 
                                    hover:from-red-600 hover:to-red-700
                                    text-white py-4 px-6 rounded-xl
                                    flex items-center justify-center gap-2
                                    transition-all duration-300 ease-out
                                    transform hover:scale-[1.02] hover:shadow-xl
                                    font-medium tracking-wide"
                            >
                                <Plus className="w-5 h-5" />
                                Create Jam Session
                            </button>
                            <button
                                type="button"
                                onClick={onClose}
                                className="flex-1 bg-gray-50 hover:bg-gray-100 
                                    dark:bg-gray-800 dark:hover:bg-gray-700
                                    text-gray-700 dark:text-gray-200 
                                    py-4 px-6 rounded-xl
                                    transition-all duration-300 ease-out
                                    transform hover:scale-[1.02]
                                    font-medium tracking-wide"
                            >
                                Cancel
                            </button>
                        </motion.div>
                    </form>
                </motion.div>
            </Card>
        </motion.div>
    );
};

export default CreateJam;