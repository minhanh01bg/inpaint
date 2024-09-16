
import { CheckIcon, ChevronDownIcon } from '@heroicons/react/20/solid'
import clsx from 'clsx'
import { useEffect, useState } from 'react'

import { Listbox, ListboxButton, ListboxOption, ListboxOptions } from '@headlessui/react'

const people = [
  { id: 1, name: 'back' },
  { id: 2, name: 'front' },
]


export default function ComboboxFunc({onChange_func, formData}) {
  const [query, setQuery] = useState('')
  const [selected, setSelected] = useState(people[1])
 
	const handleSelectionChange = (value) => {
		setSelected(value);
		if (onChange_func && value != null) {
			onChange_func(value.name);
		}
	};
  useEffect(() => {
    if (formData.type) {
      setSelected(people.find(person => person.name === formData.type));
    } else {
      setSelected(people[1]);
    }
  },[formData])
  return (
    <div className="w-52 z-40">
      <Listbox value={selected} onChange={handleSelectionChange}>
        <ListboxButton
          className={clsx(
            'relative block w-full rounded-lg bg-base-200 py-1.5 pr-8 pl-3 text-left text-sm/6',
            'focus:outline-none data-[focus]:outline-2 data-[focus]:-outline-offset-2 data-[focus]:outline-white/25'
          )}
        >
          {selected.name}
          <ChevronDownIcon
            className="group pointer-events-none absolute top-2.5 right-2.5 size-4"
            aria-hidden="true"
          />
        </ListboxButton>
        <ListboxOptions
          anchor="bottom"
          transition
          className={clsx(
            'z-40 w-[var(--button-width)] rounded-xl border border-white/5 bg-base-200 p-1 [--anchor-gap:var(--spacing-1)] focus:outline-none',
            'transition duration-100 ease-in data-[leave]:data-[closed]:opacity-0'
          )}
        >
          {people.map((person) => (
            <ListboxOption
              key={person.name}
              value={person}
              className="group flex cursor-default items-center gap-2 rounded-lg py-1.5 px-3 select-none data-[focus]:bg-white/10"
            >
              <CheckIcon className="invisible size-4 group-data-[selected]:visible" />
              <div className="text-sm/6">{person.name}</div>
            </ListboxOption>
          ))}
        </ListboxOptions>
      </Listbox>
    </div>
  )
}
