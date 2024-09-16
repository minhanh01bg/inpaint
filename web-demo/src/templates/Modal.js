// templates/Modal.js
import { Dialog, DialogPanel, DialogTitle, TransitionChild } from '@headlessui/react';
import { Fragment } from 'react';
import '../css/Dropdown.css';

export default function ModalTemplate({ isOpen, closeModal, title, children }) {
  return (
    <Dialog open={isOpen} as="div" className="relative z-30 focus:outline-none" onClose={closeModal}>
      <TransitionChild
        as={Fragment}
        enter="ease-out duration-300"
        enterFrom="opacity-0"
        enterTo="opacity-100"
        leave="ease-in duration-200"
        leaveFrom="opacity-100"
        leaveTo="opacity-0"
      >
        <div className="fixed inset-0 bg-black/25" />
      </TransitionChild>
      <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
        <div className="flex min-h-full items-center justify-center p-4"> 
          <DialogPanel
            transition
            className="w-full max-w-2xl rounded-xl bg-base-100 p-6 backdrop-blur-2xl duration-300 ease-out data-[closed]:transform-[scale(95%)] data-[closed]:opacity-0"
          >
            <DialogTitle as="h3" className="text-lg font-medium leading-6">
              {title}
            </DialogTitle>
            {children}
          </DialogPanel>
        </div>
      </div>
    </Dialog>
  );
}