import logo from "@assets/hyperlocalsvg.svg"
import { ShootingStars } from "@components/ui/aceternity/shooting-stars";
import { StarsBackground } from "@components/ui/aceternity/stars-background";
import BasicLoader from "./BasicLoader/BasicLoader";

function HomeLoader() {
    return (
        <div className="dark bg-black min-h-screen flex items-center justify-center fixed inset-0 ">
            <div className="flex justify-center content-center flex-col box-border my-5">
                <img src={logo} className="w-32 h-auto mb-4 my-4" alt="React logo" />
                <BasicLoader />
            </div>
            <ShootingStars />
            <StarsBackground />
        </div>
    )
}

export default HomeLoader;