import { HStack, Icon } from "@chakra-ui/react"
import {
    RadioCardItem,
    RadioCardLabel,
    RadioCardRoot,
} from "@components/ui/radio-card"
import { RiBankCardFill } from "react-icons/ri"
import { RiUserCommunityLine } from "react-icons/ri";
import { BsHash } from "react-icons/bs";
import { FaUsers } from "react-icons/fa";


export const RadioCard = () => {
    return (
        <RadioCardRoot
            orientation="horizontal"
            align="center"
            justify="center"
            maxW="lg"
            defaultValue="Users"
        >
            <RadioCardLabel>Explore In</RadioCardLabel>
            <HStack align="stretch">
                {items.map((item) => (
                    <RadioCardItem
                        label={item.title}
                        icon={
                            <Icon fontSize="2xl" color="fg.subtle">
                                {item.icon}
                            </Icon>
                        }
                        indicator={true}
                        key={item.value}
                        value={item.value}
                    />
                ))}
            </HStack>
        </RadioCardRoot>
    )
}

const items = [
    { value: "Users", title: "Users", icon: <FaUsers /> },
    {
        value: "Communities", title: "Communities", icon: <RiUserCommunityLine />
    },
    {
        value: "Channels", title: "Channels", icon: <BsHash />
    },
    { value: "Posts", title: "Posts", icon: <RiBankCardFill /> },
]
