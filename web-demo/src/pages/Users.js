import Title from '../templates/Title';
import { useAuth } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';
import DropdownTables from '../components/Dropdown'
import { useState, useEffect, useRef } from 'react';
import { useNotification } from '../contexts/NotificationContext';
import { getUser, deteleUser } from '../services/userService';
import logo from '../assets/img/icons8-fancy-voxel-48.png'
import CreateUserModal from '../components/AddUser';

export default function Users() {
  const { showErrorNotification, showSuccessNotification } = useNotification();
  const { isAuthenticated, loading } = useAuth();
  const isMounted = useRef(false);
  const [users, setUsers] = useState([]);
  const userFormConfig = [
    { name: 'username', label: 'Username', type: 'text' },
    { name: 'password', label: 'Password', type: 'password' },
  ];

  const initialUserFormState = {
    username: '',
    password: '',
  };
  // checked
  const [checkedItems, setCheckedItems] = useState({});
  const [isAllChecked, setIsAllChecked] = useState(false);

  const handleSelectAll = (event) => {
    const checked = event.target.checked;
    setIsAllChecked(checked);
    const newCheckedItems = {};
    users.forEach(item => {
      newCheckedItems[`checkbox-table-search-${item.id}`] = checked;
    });
    console.log(users)
    setCheckedItems(newCheckedItems);
  };

  const handleCheckboxChange = (event) => {
    const { id, checked } = event.target;
    setCheckedItems(prevState => {
      const newCheckedItems = {
        ...prevState,
        [id]: checked
      };
      const allChecked = users.length > 0 && Object.keys(newCheckedItems).length === users.length && Object.values(newCheckedItems).every(value => value);
      setIsAllChecked(allChecked);
      return newCheckedItems;
    });
  };

  useEffect(() => {
    if (loading) {
      console.log('loading')
      return;
    }
    if (!isAuthenticated) {
      console.log('not authenticated')
      // window.location.href = '/';
    } else if (!isMounted.current) {
      const loadUsers = async () => {
        const res = await getUser();
        if (res !== undefined) {
          setUsers(res);
        }
      }
      loadUsers();
      isMounted.current = true;
    }
  }, [isAuthenticated, loading])

  const handleDelete = async () => {
    users.forEach(async (user) => {
      if (checkedItems[`checkbox-table-search-${user.id}`]) {
        const res = await deteleUser(user.id, showErrorNotification, showSuccessNotification)
        if (res !== undefined) {
          users.splice(users.indexOf(user), 1)
          console.log('deleted', user.id);
        } else {
          // return
        }
      }
    })
  }

  useEffect(() => {
  }, [users])
  return (
    <>
      <Title title='Users' />
      <div className="p-5">
        <div className="flex sm:flex-row flex-wrap space-y-4 sm:space-y-0 items-center justify-between mb-5">
          <div className='flex justify-between w-full sm:w-auto'>
            <div className='sm:mr-3'>
              <DropdownTables handleDelete={handleDelete} />
            </div>
            <div className=''>
              <CreateUserModal title="Profile user" description="This information will be displayed publicly so be careful what you share." str="create user" data={users} setData={setUsers} formConfig={userFormConfig} initialFormState={initialUserFormState} />
            </div>
          </div>
        </div>
        <div className="overflow-x-auto p-4">
          <table className="table">
            <thead className="text-xs uppercase">
              <tr>
                <th scope="col" className="p-4">
                  <div className="flex items-center">
                    <input checked={isAllChecked} onChange={handleSelectAll} id="checkbox-all-search" type="checkbox" className="checkbox checkbox-primary" />
                  </div>
                </th>
                <th scope="col" className="px-6 py-3">
                  Name
                </th>
                <th scope="col" className="px-6 py-3">
                  Is Admin
                </th>
                <th scope="col" className="px-6 py-3">
                  Status
                </th>
                <th scope="col" className="px-6 py-3">
                  Action
                </th>
              </tr>
            </thead>
            <tbody>

              {users.map((user, index) => (
                <tr key={user.id} className="border-b hover">
                  <td className="w-4 p-4">
                    <div className="flex items-center">
                      <input checked={checkedItems[`checkbox-table-search-${user.id}`] || false} onChange={handleCheckboxChange} id={`checkbox-table-search-${user.id}`} type="checkbox" className="checkbox checkbox-primary" />
                    </div>
                  </td>
                  <th scope="row" className="flex items-center px-6 py-4 text-gray-900 whitespace-nowrap">
                    <img className="w-10 h-10 rounded-full" src={logo} alt="Jese" />
                    <div className="ps-3">
                      <div className="text-base font-semibold">{user.username}</div>
                      <div className="font-normal text-gray-500">neil.sims@flowbite.com</div>
                    </div>
                  </th>
                  <td className="px-6 py-4">
                    {`${user.is_admin ? 'Yes' : 'No'}`}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <div className="h-2.5 w-2.5 rounded-full bg-green-500 me-2"></div> Online
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <Link href="#" className="font-medium text-blue-600 dark:text-blue-500 hover:underline">Edit user</Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <nav className="flex items-center flex-column flex-wrap md:flex-row justify-between pt-4" aria-label="Table navigation">
            <span className="text-sm font-normal mb-4 md:mb-0 block w-full md:inline md:w-auto">Showing <span className="font-semibold">1-10</span> of <span className="font-semibold">1000</span></span>
            <ul className="inline-flex -space-x-px rtl:space-x-reverse text-sm h-8">
              <li>
                <Link href="#" className="flex items-center justify-center px-3 h-8 ms-0 leading-tight border border-gray-300 rounded-s-lg">Previous</Link>
              </li>
              <li>
                <Link href="#" className="flex items-center justify-center px-3 h-8 leading-tight border border-gray-300">1</Link>
              </li>
              <li>
                <Link href="#" className="flex items-center justify-center px-3 h-8 leading-tight border border-gray-300">2</Link>
              </li>
              <li>
                <Link href="#" className="flex items-center justify-center px-3 h-8 leading-tight border border-gray-300">3</Link>
              </li>
              <li>
                <Link href="#" className="flex items-center justify-center px-3 h-8 leading-tight border border-gray-300">4</Link>
              </li>
              <li>
                <Link href="#" className="flex items-center justify-center px-3 h-8 leading-tight border border-gray-300">5</Link>
              </li>
              <li>
                <Link href="#" className="flex items-center justify-center px-3 h-8 leading-tight border border-gray-300 rounded-e-lg">Next</Link>
              </li>
            </ul>
          </nav>
        </div>
      </div>
    </>
  )
}