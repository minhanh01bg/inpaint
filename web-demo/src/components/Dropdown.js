import { Menu, Transition, MenuButton, MenuItem, MenuItems } from '@headlessui/react'
import { Fragment} from 'react'
import {
  ArchiveBoxXMarkIcon,
  ChevronDownIcon,
  PencilIcon,
  Square2StackIcon,
  TrashIcon,
} from '@heroicons/react/16/solid'
import '../css/Dropdown.css'

export default function DropdownTables({handleDelete}) {
  return (
    <div className="text-right">
      <Menu>
        {/* inline-flex items-center gap-2 rounded-md bg-black/10 py-1.5 px-3 text-sm/6 font-semibold text-black shadow-md shadow-black/10 focus:outline-none data-[hover]:bg-black/30 data-[open]:bg-black/30 data-[focus]:outline-1 data-[focus]:outline-none  */}
        <MenuButton>
          <span className='btn btn-sm btn-outline btn-secondary'>
            Options
            <ChevronDownIcon className="size-4" />
          </span>
        </MenuButton>

        <Transition
          as={Fragment}
          enter="transition ease-out duration-100"
          enterFrom="transform opacity-0 scale-95"
          enterTo="transform opacity-100 scale-100"
          leave="transition ease-in duration-75"
          leaveFrom="transform opacity-100 scale-100"
          leaveTo="transform opacity-0 scale-95"
        >
          <MenuItems
            // transition
            anchor="bottom start"
            className="z-10 w-52 origin-top-right rounded-xl border border-black/2 
                      bg-base-100 p-1 text-sm/6
                      transition duration-100 ease-out [--anchor-gap:var(--spacing-1)] focus:outline-none data-[closed]:scale-95 data-[closed]:opacity-0"
          >
            <MenuItem>
              <button className="group flex w-full items-center gap-2 rounded-lg py-1.5 px-3 data-[focus]:bg-black/10">
                <PencilIcon className="size-4" />
                Edit
                <kbd className="ml-auto hidden font-sans text-xs opacity-50 group-data-[focus]:inline">⌘E</kbd>
              </button>
            </MenuItem>
            <MenuItem>
              <button className="group flex w-full items-center gap-2 rounded-lg py-1.5 px-3 data-[focus]:bg-black/10">
                <Square2StackIcon className="size-4" />
                Duplicate
                <kbd className="ml-auto hidden font-sans text-xs opacity-50 group-data-[focus]:inline">⌘D</kbd>
              </button>
            </MenuItem>
            <div className="my-1 h-px bg-black/5" />
            <MenuItem>
              <button className="group flex w-full items-center gap-2 rounded-lg py-1.5 px-3 data-[focus]:bg-black/10">
                <ArchiveBoxXMarkIcon className="size-4" />
                Archive
                <kbd className="ml-auto hidden font-sans text-xs opacity-50 group-data-[focus]:inline">⌘A</kbd>
              </button>
            </MenuItem>
            <MenuItem>
              <button className="group flex w-full items-center gap-2 rounded-lg py-1.5 px-3 data-[focus]:bg-black/10" onClick={handleDelete}>
                <TrashIcon className="size-4" />
                Delete
                <kbd className="ml-auto hidden font-sans text-xs opacity-50 group-data-[focus]:inline">⌘D</kbd>
              </button>
            </MenuItem>
          </MenuItems>
        </Transition>
      </Menu>
    </div>
  )
}
