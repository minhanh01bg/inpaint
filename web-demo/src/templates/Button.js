import { Button } from '@headlessui/react'
import classNames from 'classnames'
export default function ButtonFunc({str,type,color, func}) {
  const colorClass = classNames({
    'bg-blue-100 text-blue-900 hover:bg-blue-200 focus-visible:ring-blue-500': color === 'blue',
    'bg-red-100 text-red-900 hover:bg-red-200 focus-visible:ring-red-500': color === 'red',
    'bg-green-100 text-green-900 hover:bg-green-200 focus-visible:ring-green-500': color === 'green',
    'inline-flex justify-center rounded-md border border-transparent px-4 py-2 text-sm font-medium focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2': true
  });
  return (
    <Button
      className={colorClass}
      onClick={func}
      type={type ? type : 'button'}
    >
        {str}
    </Button>
  )
}