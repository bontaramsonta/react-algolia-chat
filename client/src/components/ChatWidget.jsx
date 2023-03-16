import React from 'react'
import { Menu } from '@headlessui/react'
import { ChevronDownIcon } from '@heroicons/react/24/solid'
function ChatWidget({
  chats
}) {
  return (
    <Menu as={'div'} className='fixed w-80 bottom-0 right-0 md:right-2 py-1 px-2 shadow-slate-500 border-2 border-slate-200 shadow-lg'>
      <Menu.Button as={'div'} className='flex justify-between items-center'>
        <h2 className='block text-lg'>Chat widget</h2>
        <ChevronDownIcon
          className="block h-6"
          aria-hidden="true"
        />
      </Menu.Button>
      <Menu.Items>
        <Menu.Item>
        {({ active }) => (
            <div className="">
              messages
            </div>
          )}
        </Menu.Item>
      </Menu.Items>
    </Menu>
  )
}

export default ChatWidget