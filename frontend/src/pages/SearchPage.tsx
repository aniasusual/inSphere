import { ExpandableCard } from "@components/ui/aceternity/ExpandableCard";
import { SearchBox } from "@components/ui/aceternity/SearchBox";
import { useState } from "react";

import { HStack } from "@chakra-ui/react"
import { Button } from "@components/ui/button"
import { RiArrowRightLine } from "react-icons/ri"


export function Search() {

    const [listView, setlistView] = useState(false)

    return (
        <div>
            <SearchBox />
            <div className="flex justify-end p-4">
                <HStack>
                    <Button colorPalette="red" variant="outline" onClick={() => setlistView(!listView)} className="text-sm p-4 outline-none">
                        {listView ? "List" : "Grid"} <RiArrowRightLine />
                    </Button>
                </HStack>
            </div>
            <ExpandableCard listView={listView} />
        </div>
    )
}