import { Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/react'
import { Link } from 'react-router-dom'
import {useAuth} from '../contexts/AuthContext'
import '../css/Dropdown.css'

function classNames(...classes) {
  return classes.filter(Boolean).join(' ')
}

export default function DropdownAvatar() {
  const { logout } = useAuth();
  return (
    
    <Menu as="div" className="relative text-left z-10">
      <div>
        <MenuButton className="relative flex rounded-full 
                              bg-gray-800 focus:outline-none focus:ring-2 focus:ring-violet focus:ring-offset-2 focus:ring-offset-violet-500">
          <span className="sr-only">Open user menu</span>
          <img
            className="h-8 w-8 rounded-full"
            src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
            alt=""
          />
        </MenuButton>
      </div>
      <MenuItems transition className={`absolute right-0 mt-2 w-56 origin-top-right divide-y divide-gray-100 rounded-md bg-base-100 shadow-lg ring-1 ring-black/5 focus:outline-none data-[closed]:scale-95 data-[closed]:transform data-[closed]:opacity-0 data-[enter]:duration-100 data-[leave]:duration-75 data-[enter]:ease-out data-[leave]:ease-in`}>
        <div className='px-1 py-1'>
          <MenuItem className=''>
            {({ active }) => (
              <Link
                className={classNames(
                  active ? 'group flex w-full items-center rounded-md px-2 py-2 text-sm bg-violet-500 text-white' : 'group flex w-full items-center rounded-md px-2 py-2 text-sm text-gray-900')}
              >
                Your profile
              </Link>
            )}
          </MenuItem>
        </div>
        <div className='px-1 py-1'>
          <MenuItem>{({ active }) => (
            <Link
              href="#"
              className={classNames(
                active ? 'group flex w-full items-center rounded-md px-2 py-2 text-sm bg-violet-500 text-white' : 'group flex w-full items-center rounded-md px-2 py-2 text-sm text-gray-900')}
            >
              Settings
            </Link>
          )}
          </MenuItem>
          <MenuItem>{({ active }) => (
            <Link
              href="#"
              className={classNames(
                active ? 'group flex w-full items-center rounded-md px-2 py-2 text-sm bg-violet-500 text-white' : 'group flex w-full items-center rounded-md px-2 py-2 text-sm text-gray-900')}
              onClick={logout}
            >
              Sign out
            </Link>
          )}
          </MenuItem>
        </div>
      </MenuItems>
    </Menu>
    
  )
}