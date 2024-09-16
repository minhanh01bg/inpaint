import { Outlet, Link, useLocation } from "react-router-dom";
import logo from '../assets/img/icons8-fancy-voxel-48.png';
import { useEffect} from 'react';
import '../css/Layout.css';
import DropdownAvatar from '../components/DropdownAvatar';
import NavBar from '../components/NavBar'
import { useDispatch, useSelector } from 'react-redux';
import { useAuth } from '../contexts/AuthContext';
import classNames from "classnames";
import { setActive, filterAdmin, togglePin } from '../redux/slices/navigationSlice';

function Layout() {
  const navigation = useSelector((state) => state.navigation);
  const dispatch = useDispatch();
  const { loading, isAdmin } = useAuth();
  useEffect(() => {
    if (loading) {
      return;
    }
    if (!isAdmin) {
      dispatch(filterAdmin());
    }
  }, [isAdmin, loading]);
	return (
		<>
			<div className='full'>
				<div className='relative w-full flex flex-col'>
          <NavBar logo={logo} DropdownAvatar={DropdownAvatar} navigation={navigation} dispatch={dispatch}/>
					<div className='relative flex h-full w-full'>
            {navigation.isOpen && (
              <div className={`hidden md:block md:fixed md:left-0 z-30 h-full w-56 border-r ${navigation.isPinned ? '' : 'translate-x-0'}`}>
                <div
                  className={`flex flex-col w-[var(--button-width)] bg-base-100 overflow-y-scroll divide-y divide-gray-100 focus:outline-none`}
                  style={{ height: 'calc(100vh - 4rem)' }}
                >
                  <ul className="menu">
                    {navigation.navigationItems.map((item,index)=>(
                      <li key={'sidebar_'+item.name}>
                        <Link 
                          to={item.href}
                          className={classNames(
                            item.current ? 'active':''
                          )}
                          onClick={() => dispatch(setActive(item.name))}
                        >
                          {item.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                  <div className='flex-grow'></div>
                  <ul className="menu">
                    <li onClick={() => dispatch(togglePin())}>
                      <span className={`${navigation.isPinned ? "active":""}`}>
                        {navigation.isPinned ? 'Unpin' : 'Pin'}
                      </span>
                    </li>
                  </ul> 
                </div>
              </div>
            )}
            <div className={`lg:m-0 mx-auto w-full ${navigation.isPinned ? 'md:pl-56' : ''}`}>
						  <Outlet />
            </div>
					</div>
				</div>	
			</div>
		</>
	)
}

export default Layout;