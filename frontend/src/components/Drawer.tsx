import { Button } from "@components/ui/button"
import {
    DrawerActionTrigger,
    DrawerBackdrop,
    DrawerBody,
    DrawerCloseTrigger,
    DrawerContent,
    DrawerFooter,
    DrawerHeader,
    DrawerRoot,
    DrawerTitle,
    DrawerTrigger,
} from "@components/ui/drawer"

import { IconMenu } from '@tabler/icons-react';

export const Drawer = () => {
    return (
        <DrawerRoot>
            <DrawerBackdrop />
            <DrawerTrigger asChild>
                <Button variant="outline" size="sm" className="fixed right-6 z-20">
                    <IconMenu stroke={3} />
                </Button>
            </DrawerTrigger>
            <DrawerContent offset="4" rounded="md">
                <DrawerHeader>
                    <DrawerTitle>Drawer Title</DrawerTitle>
                </DrawerHeader>
                <DrawerBody>
                    <p>
                        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do
                        eiusmod tempor incididunt ut labore et dolore magna aliqua.
                    </p>
                </DrawerBody>
                <DrawerFooter>
                    <DrawerActionTrigger asChild>
                        <Button variant="outline">Cancel</Button>
                    </DrawerActionTrigger>
                    <Button>Save</Button>
                </DrawerFooter>
                <DrawerCloseTrigger />
            </DrawerContent>
        </DrawerRoot>
    )
}
