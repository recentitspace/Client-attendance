import { HomeIcon, UserGroupIcon, ClipboardDocumentListIcon, SpeakerWaveIcon, Cog6ToothIcon, ArrowRightEndOnRectangleIcon } from "@heroicons/react/24/outline";
import { NavLink } from "react-router-dom";

const navItems = [
  { name: "Dashboard", icon: HomeIcon, path: "/dashboard" },
  { name: "Employees", icon: UserGroupIcon, path: "/employees" },
  { name: "Attendance", icon: ClipboardDocumentListIcon, path: "/attendance" },
  { name: "Announcements", icon: SpeakerWaveIcon, path: "/announcements" },
  { name: "Settings", icon: Cog6ToothIcon, path: "/settings" },
];

const Sidebar = () => (
  <aside className="h-screen bg-white w-64 shadow-md hidden md:block">
    <div className="p-6 font-bold text-2xl border-b border-gray-100">
      <span className="text-blue-600">Team</span>Hub
    </div>
    <nav className="p-4 space-y-2">
      {navItems.map((item) => (
        <NavLink
          to={item.path}
          key={item.name}
          className={({ isActive }) =>
            `flex items-center p-3 rounded-lg hover:bg-gray-100 ${
              isActive ? "bg-blue-100 text-blue-600" : "text-gray-700"
            }`
          }
        >
          <item.icon className="h-5 w-5 mr-3" />
          {item.name}
        </NavLink>
      ))}
    </nav>
    <button className="mt-auto p-4 flex items-center w-full hover:bg-gray-100 text-gray-700">
      <ArrowRightEndOnRectangleIcon className="h-5 w-5 mr-2" />
      Logout
    </button>
  </aside>
);

export default Sidebar;
