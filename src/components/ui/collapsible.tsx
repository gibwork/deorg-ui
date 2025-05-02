"use client"

import * as React from "react"
import * as CollapsibleComponent from '@radix-ui/react-collapsible';
import { Dispatch, SetStateAction } from "react";

interface Props {
    isOpen: boolean;
    children : any;
    setIsOpen: Dispatch<SetStateAction<boolean>>;
}

const Collapsible = ({children, isOpen, setIsOpen} : Props) => {

  return (
    <CollapsibleComponent.Root
      open={isOpen}
      onOpenChange={setIsOpen}      
    >
      <div className="flex items-center justify-between space-x-4 px-4">
        <CollapsibleComponent.Trigger asChild />                  
      </div>
      <CollapsibleComponent.Content className="space-y-2">
        {children}
      </CollapsibleComponent.Content>
    </CollapsibleComponent.Root>
  )
}

export default Collapsible;