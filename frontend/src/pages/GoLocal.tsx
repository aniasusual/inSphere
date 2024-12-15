import { Post } from "@components/Post";
import { SegmentedControl } from "@components/ui/segmented-control";

export function Golocal() {
    return (
        <div>
            <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50">
                <SegmentedControl defaultValue="Explore" items={["Explore", "Posts", "Map"]} />
            </div>
        </div>
    )
}